import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Save, Crown } from 'lucide-react';

// Import existing components
import TroupeCreator from './TroupeCreator';

// Import utilities
import { createUniverse } from '@/utils/db';
import { Universe } from '@/types/game';

interface SimpleUniverseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (universe: Universe) => void;
  editingUniverse?: Universe | null;
}

interface UniverseFormData {
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
}

const SimpleUniverseCreator: React.FC<SimpleUniverseCreatorProps> = ({
  isOpen,
  onClose,
  onComplete,
  editingUniverse
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'universe' | 'troupes'>('universe');
  const [isLoading, setIsLoading] = useState(false);
  const [createdUniverse, setCreatedUniverse] = useState<Universe | null>(null);
  const [createdTroupes, setCreatedTroupes] = useState<any[]>([]);

  const [universeData, setUniverseData] = useState<UniverseFormData>({
    name: editingUniverse?.name || '',
    description: editingUniverse?.description || '',
    status: 'draft'
  });

  const handleUniverseSubmit = async () => {
    if (!universeData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'univers est requis",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const universe = await createUniverse({
        name: universeData.name,
        description: universeData.description,
        status: universeData.status
      });

      if (!universe) {
        throw new Error("Failed to create universe");
      }

      setCreatedUniverse(universe);
      setStep('troupes');
      
      toast({
        title: "Succès",
        description: "Univers créé avec succès! Maintenant, créez vos troupes.",
      });
    } catch (error) {
      console.error('Error creating universe:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'univers. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTroupesComplete = (troupes: any[]) => {
    setCreatedTroupes(troupes);
    
    if (createdUniverse) {
      // Pass the universe with updated troupe count
      const universeWithTroupeCount = {
        ...createdUniverse,
        troupe_count: troupes.length
      };
      
      onComplete(universeWithTroupeCount);
      onClose();
      toast({
        title: "Univers créé!",
        description: "Votre univers et ses troupes ont été créés avec succès.",
      });
    }
  };

  const handleClose = () => {
    if (isLoading) {
      // Prevent closing while loading
      return;
    }
    
    setStep('universe');
    setUniverseData({
      name: '',
      description: '',
      status: 'draft'
    });
    setCreatedUniverse(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-green-500" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 font-pixel">
            {step === 'universe' ? '$ CRÉER_UNIVERS' : '$ CRÉER_TROUPES'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'universe' ? 'text-green-400' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'universe' ? 'border-green-400 bg-green-400/20' : 'border-green-600 bg-green-600'
              }`}>
                {step === 'troupes' ? <Save className="w-4 h-4" /> : '1'}
              </div>
              <span className="font-mono">Univers</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-600"></div>
            <div className={`flex items-center space-x-2 ${step === 'troupes' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'troupes' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'
              }`}>
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-mono">Troupes</span>
            </div>
          </div>

          {step === 'universe' && (
            <Card className="bg-black/50 border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono">Configuration de l'Univers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="universe-name" className="font-mono text-green-400">
                    Nom de l'Univers *
                  </Label>
                  <Input
                    id="universe-name"
                    value={universeData.name}
                    onChange={(e) => setUniverseData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Entrez le nom de l'univers..."
                    className="bg-black/50 border-green-500/50 text-green-400 font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="universe-description" className="font-mono text-green-400">
                    Description
                  </Label>
                  <Textarea
                    id="universe-description"
                    value={universeData.description}
                    onChange={(e) => setUniverseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre univers..."
                    className="bg-black/50 border-green-500/50 text-green-400 font-mono"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="border-gray-500 text-gray-400 hover:bg-gray-800 disabled:opacity-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUniverseSubmit}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Création...' : 'Créer Univers'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'troupes' && createdUniverse && (
            <div className="space-y-4">
              <Card className="bg-black/50 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono">
                    Univers: {createdUniverse.name}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <TroupeCreator
                universeId={createdUniverse.id}
                onCreateTroupes={handleTroupesComplete}
                onContinue={() => {}} // Empty function since we handle completion in onCreateTroupes
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleUniverseCreator;