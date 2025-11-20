import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsValidSession(false);
          return;
        }

        // Check if this is a recovery session
        if (session && session.user) {
          setIsValidSession(true);
        } else {
          // Try to get the access token from URL parameters if present
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens from URL
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Error setting session:', sessionError);
              setIsValidSession(false);
            } else {
              setIsValidSession(true);
            }
          } else {
            setIsValidSession(false);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsValidSession(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
        } else if (event === 'SIGNED_OUT') {
          setIsValidSession(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (!password || !confirmPassword) {
        toast({
          title: "Invalid input",
          description: "Please enter both password fields",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });

      // Redirect to login page
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating your password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat p-4">
        <div className="w-full max-w-md border-2 border-[#00FF00]/20 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_15px_rgba(0,255,0,0.1)] p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF00] mx-auto mb-4"></div>
            <p className="text-[#00FF00] font-mono">Vérification de la session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if session is invalid
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat p-4">
        <div className="w-full max-w-md border-2 border-red-500/20 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.1)] p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 font-mono mb-4">Session Invalide</h1>
            <p className="text-red-400 mb-6">
              Le lien de réinitialisation du mot de passe est invalide ou a expiré.
            </p>
            <Button 
              onClick={() => navigate('/auth/login')}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat p-4">
      <div className="w-full max-w-md border-2 border-[#00FF00]/20 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_15px_rgba(0,255,0,0.1)] relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none p-8">
        <h1 className="text-2xl font-bold text-center mb-6 font-mono text-[#00FF00] animate-pulse">
          Nouveau mot de passe_
        </h1>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/30 border-[#00FF00]/30 text-[#00FF00] placeholder:text-[#00FF00]/50"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-black/30 border-[#00FF00]/30 text-[#00FF00] placeholder:text-[#00FF00]/50"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#00FF00]/20 hover:bg-[#00FF00]/30 text-[#00FF00] border border-[#00FF00]/50 transition-all hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
            disabled={loading}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('/auth/login')}
            className="text-[#00FF00]/70 hover:text-[#00FF00] hover:bg-[#00FF00]/10"
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;