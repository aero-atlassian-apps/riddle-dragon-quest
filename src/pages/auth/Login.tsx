
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre email pour réinitialiser votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi de l'email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        toast({
          title: "Invalid input",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        return;
      }
      // Attempt to sign in with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // If the user doesn't exist yet, try to sign them up first
        if (error.message.includes("Invalid login credentials")) {
          // Create the user first
          const { error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
          });
          
          if (signUpError) throw signUpError;
          
          // Now try to sign in again
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (signInError) throw signInError;
        } else {
          throw error;
        }
      }

      // Get the authenticated user
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Check if user has any role in the user_roles table
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      // If no role exists, assign 'user' role by default
      if (!userRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ 
            user_id: userId,
            role: 'user' 
          }]);

        if (roleError) throw roleError;
      }

      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });

      // Navigate based on user role
      if (userRole?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat p-4">
      <div className="w-full max-w-md border-2 border-[#00FF00]/20 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_15px_rgba(0,255,0,0.1)] relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
        <h1 className="text-2xl font-bold text-center mb-6 font-mono text-[#00FF00] animate-pulse">Login du Maître du jeu_</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/30 border-[#00FF00]/30 text-[#00FF00] placeholder:text-[#00FF00]/50"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/30 border-[#00FF00]/30 text-[#00FF00] placeholder:text-[#00FF00]/50"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#00FF00]/20 hover:bg-[#00FF00]/30 text-[#00FF00] border border-[#00FF00]/50 transition-all hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button 
            variant="ghost"
            onClick={handleForgotPassword}
            className="text-[#00FF00]/70 hover:text-[#00FF00] hover:bg-[#00FF00]/10"
            disabled={loading}
          >
            Mot de passe oublié ?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
