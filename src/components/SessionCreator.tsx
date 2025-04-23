import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { createSession } from '@/utils/db';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SessionCreatorProps {
  onCreateSession: (sessionId: string) => void;
}

const SessionCreator: React.FC<SessionCreatorProps> = ({ onCreateSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      toast({
        title: "Error",
        description: "Session name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create session
      const session = await createSession(sessionName);
      
      if (!session) {
        toast({
          title: "Error",
          description: "Failed to create session",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Session created successfully",
      });
      
      // Reset form
      setSessionName('');
      
      // Notify parent component with the session ID
      onCreateSession(session.id);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="parchment max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center font-medieval">Create New Session</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-name" className="font-medieval">Session Name</Label>
            <Input
              id="session-name"
              placeholder="e.g. Marketing Team Building"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              className="border-dragon-gold/30"
              disabled={isLoading}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-dragon-primary hover:bg-dragon-secondary font-medieval"
              disabled={isLoading || !sessionName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SessionCreator;
