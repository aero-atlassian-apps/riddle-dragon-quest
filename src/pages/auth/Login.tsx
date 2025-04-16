
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Using a valid email format that Supabase will accept
const TEMP_EMAIL = "admin@example.com";
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

        // Add admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ 
            user_id: (await supabase.auth.getUser()).data.user?.id,
            role: 'admin' 
          }]);

        if (roleError) throw roleError;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dragon-accent/5 to-white p-4">
      <div className="w-full max-w-md parchment">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-dragon-gold/30"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-dragon-gold/30"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-dragon-primary hover:bg-dragon-secondary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Demo credentials:</p>
            <p>Email: {TEMP_EMAIL}</p>
            <p>Password: {TEMP_PASSWORD}</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
