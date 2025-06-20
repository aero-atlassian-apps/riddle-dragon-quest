
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Using the specified email address
const TEMP_EMAIL = "a.roucadi@attijariwafa.com";
const TEMP_PASSWORD = "admin123";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email === TEMP_EMAIL && password === TEMP_PASSWORD) {
        // Use signIn instead of signUp since we're logging in with credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email: TEMP_EMAIL,
          password: TEMP_PASSWORD,
        });

        if (error) {
          // If the user doesn't exist yet, try to sign them up first
          if (error.message.includes("Invalid login credentials")) {
            // Create the user first
            const { error: signUpError } = await supabase.auth.signUp({
              email: TEMP_EMAIL,
              password: TEMP_PASSWORD,
            });
            
            if (signUpError) throw signUpError;
            
            // Now try to sign in again
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: TEMP_EMAIL,
              password: TEMP_PASSWORD,
            });
            
            if (signInError) throw signInError;
          } else {
            throw error;
          }
        }

        // Check if user role already exists before trying to insert it
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();

        // Only add admin role if it doesn't exist
        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ 
              user_id: userId,
              role: 'admin' 
            }]);

          if (roleError) throw roleError;
        }

        toast({
          title: "Login successful",
          description: "You have been logged in as an admin",
        });

        navigate('/admin');
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
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
              placeholder="Password"
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
