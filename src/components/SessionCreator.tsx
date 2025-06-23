import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { createSession } from '@/utils/db';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SessionCreatorProps {
  onCreateSession: (sessionId: string) => void;
}

const SessionCreator: React.FC<SessionCreatorProps> = ({ onCreateSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [sessionContext, setSessionContext] = useState('');
  const [hintEnabled, setHintEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la session ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create session
      const session = await createSession(sessionName, sessionContext.trim() || undefined, hintEnabled);
      
      if (!session || !session.id) {
        toast({
          title: "Erreur",
          description: "Échec de la création de la session - ID manquant",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Session créée avec succès",
      });
      
      // Reset form
      setSessionName('');
      setSessionContext('');
      setHintEnabled(true);
      
      // Notify parent component with the session ID
      onCreateSession(session.id);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la création de la session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-6 text-center font-pixel text-green-400">$ INITIALISER_NOUVELLE_SESSION</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session-name" className="font-mono text-green-400">$ NOM_SESSION:</Label>
              <Input
                id="session-name"
                placeholder="Entrez l'identifiant de la session..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                required
                className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-600/30 focus:border-green-400 focus:ring-green-400/20"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-context" className="font-mono text-green-400">$ CONTEXTE_SESSION:</Label>
              <textarea
                id="session-context"
                placeholder="Entrez le contexte de la session (optionnel)..."
                value={sessionContext}
                onChange={(e) => setSessionContext(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-green-500/50 text-green-400 font-mono placeholder:text-green-600/30 focus:border-green-400 focus:ring-green-400/20 rounded-md px-3 py-2 resize-none"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hint-enabled"
                checked={hintEnabled}
                onCheckedChange={(checked) => setHintEnabled(checked as boolean)}
                disabled={isLoading}
                className="border-green-500/50 data-[state=checked]:bg-green-500 data-[state=checked]:text-black"
              />
              <Label htmlFor="hint-enabled" className="font-mono text-green-400 cursor-pointer">
                Avec Indice ?
              </Label>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel disabled:opacity-50"
                disabled={isLoading || !sessionName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    INITIALISATION...
                  </>
                ) : (
                  '$ CREER_SESSION'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionCreator;
