import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { createChallenge, generateRoomsFromTroupes } from '@/utils/db';
import { Challenge } from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ChallengeCreatorProps {
  onCreateChallenge: (challenge: Challenge) => void;
  universeId?: string; // Optional universe ID for universe challenges
}

const ChallengeCreator: React.FC<ChallengeCreatorProps> = ({ onCreateChallenge, universeId }) => {
  const [challengeName, setChallengeName] = useState('');
  const [challengeContext, setChallengeContext] = useState('');
  const [hintEnabled, setHintEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du challenge ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create challenge with universe support
      const challengeType = universeId ? 'universe' : 'standalone';
      const challenge = await createChallenge(
        challengeName,
        challengeContext.trim() || undefined,
        hintEnabled,
        challengeType,
        universeId
      );
      
      if (!challenge) {
        toast({
          title: "Erreur",
          description: "Échec de la création du challenge",
          variant: "destructive",
        });
        return;
      }

      // If this is a universe challenge, automatically generate rooms from troupes
      if (universeId && challenge.id) {
        console.log('[CHALLENGE DEBUG] Creating universe challenge, generating rooms from troupes...');
        const generatedRooms = await generateRoomsFromTroupes(challenge.id, universeId);
        
        if (generatedRooms.length > 0) {
          toast({
            title: "Succès",
            description: `Challenge créé avec ${generatedRooms.length} arènes générées automatiquement`,
          });
        } else {
          toast({
            title: "Attention",
            description: "Challenge créé mais aucune troupe trouvée pour générer les arènes",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Succès",
          description: "Challenge créé avec succès",
        });
      }
      
      // Reset form
      setChallengeName('');
      setChallengeContext('');
      setHintEnabled(true);
      
      // Notify parent component with the full challenge object
      onCreateChallenge(challenge as Challenge);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la création du challenge",
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
        <h2 className="text-xl font-bold mb-6 text-center font-pixel text-green-400">$ INITIALISER_NOUVEAU_CHALLENGE</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="challenge-name" className="font-mono text-green-400">$ NOM_CHALLENGE:</Label>
              <Input
                id="challenge-name"
                placeholder="Entrez l'identifiant du challenge..."
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                required
                className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-600/30 focus:border-green-400 focus:ring-green-400/20"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="challenge-context" className="font-mono text-green-400">$ CONTEXTE_CHALLENGE:</Label>
              <textarea
                id="challenge-context"
                placeholder="Entrez le contexte du challenge (optionnel)..."
                value={challengeContext}
                onChange={(e) => setChallengeContext(e.target.value)}
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
                disabled={isLoading || !challengeName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    INITIALISATION...
                  </>
                ) : (
                  '$ CREER_CHALLENGE'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeCreator;
