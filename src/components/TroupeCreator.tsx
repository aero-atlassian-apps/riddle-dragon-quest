import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Minus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_TROUPES = [
  { name: "Stark", sigil: "🐺", motto: "Winter is Coming" },
  { name: "Lannister", sigil: "🦁", motto: "Hear Me Roar" },
  { name: "Targaryen", sigil: "🐉", motto: "Fire and Blood" },
  { name: "Baratheon", sigil: "🦌", motto: "Ours is the Fury" },
  { name: "Greyjoy", sigil: "🦑", motto: "We Do Not Sow" },
  { name: "Tyrell", sigil: "🌹", motto: "Growing Strong" },
  { name: "Martell", sigil: "🌞", motto: "Unbowed, Unbent, Unbroken" },
  { name: "Tully", sigil: "🐟", motto: "Family, Duty, Honor" },
  { name: "Arryn", sigil: "🦅", motto: "As High as Honor" }
];

interface Troupe {
  id: string;
  name: string;
  sigil: string;
  motto: string;
  initialTokens: number;
  order: number;
}

interface TroupeCreatorProps {
  universeId: string;
  onCreateTroupes: (troupes: Troupe[]) => void;
  onContinue: () => void;
  hintEnabled?: boolean;
}

const TroupeCreator: React.FC<TroupeCreatorProps> = ({ 
  universeId, 
  onCreateTroupes, 
  onContinue, 
  hintEnabled = true 
}) => {
  const [numberOfTroupes, setNumberOfTroupes] = useState<number>(2);
  const [tokensPerTroupe, setTokensPerTroupe] = useState<number>(1);
  const [createdTroupes, setCreatedTroupes] = useState<Troupe[]>([]);
  const [showTroupes, setShowTroupes] = useState(false);
  const [editingTroupe, setEditingTroupe] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', sigil: '', motto: '' });
  const { toast } = useToast();

  const incrementTroupes = () => {
    if (numberOfTroupes < 10) {
      setNumberOfTroupes(prev => prev + 1);
    }
  };

  const decrementTroupes = () => {
    if (numberOfTroupes > 2) {
      setNumberOfTroupes(prev => prev - 1);
    }
  };

  const incrementTokens = () => {
    if (tokensPerTroupe < 10) {
      setTokensPerTroupe(prev => prev + 1);
    }
  };

  const decrementTokens = () => {
    if (tokensPerTroupe > 0) {
      setTokensPerTroupe(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Select troupes in order without randomness
    const selectedTroupes = DEFAULT_TROUPES.slice(0, numberOfTroupes);
    
    // Create troupe objects
    const generatedTroupes: Troupe[] = selectedTroupes.map((troupe, index) => ({
      id: crypto.randomUUID(),
      name: troupe.name,
      sigil: troupe.sigil,
      motto: troupe.motto,
      initialTokens: hintEnabled ? tokensPerTroupe : 1,
      order: index + 1
    }));
    
    setCreatedTroupes(generatedTroupes);
    setShowTroupes(true);
    
    // Pass troupe data to parent component
    onCreateTroupes(generatedTroupes);
    
    // Create the troupes in the database
    createTroupesInDatabase(generatedTroupes);
  };

  const createTroupesInDatabase = async (troupes: Troupe[]) => {
    const { createUniverseTroupe, getUniverseTroupes } = await import('@/utils/db');
    
    // First, check if troupes already exist for this universe
    const existingTroupes = await getUniverseTroupes(universeId);
    
    if (existingTroupes && existingTroupes.length > 0) {
      console.log('[TROUPE DEBUG] Troupes already exist for this universe, skipping creation');
      toast({
        title: "Troupes déjà créées",
        description: "Les troupes existent déjà pour cet univers.",
        variant: "default",
      });
      return;
    }
    
    for (const troupe of troupes) {
      const result = await createUniverseTroupe(
        universeId, 
        troupe.name, 
        troupe.sigil, 
        troupe.motto, 
        troupe.initialTokens,
        troupe.order
      );
      
      if (!result) {
        toast({
          title: "Erreur lors de la création de la troupe",
          description: `Échec de la création de la troupe: ${troupe.name}`,
          variant: "destructive",
        });
      }
    }
    
    toast({
      title: "Troupes créées avec succès",
      description: `${troupes.length} troupes ont été créées pour cet univers`,
    });
  };

  const startEdit = (troupe: Troupe) => {
    setEditingTroupe(troupe.id);
    setEditForm({
      name: troupe.name,
      sigil: troupe.sigil,
      motto: troupe.motto
    });
  };

  const saveEdit = () => {
    if (!editingTroupe) return;
    
    setCreatedTroupes(prev => prev.map(troupe => 
      troupe.id === editingTroupe 
        ? { ...troupe, ...editForm }
        : troupe
    ));
    
    setEditingTroupe(null);
    setEditForm({ name: '', sigil: '', motto: '' });
    
    toast({
      title: "Troupe modifiée",
      description: "Les modifications ont été sauvegardées",
    });
  };

  const cancelEdit = () => {
    setEditingTroupe(null);
    setEditForm({ name: '', sigil: '', motto: '' });
  };

  const deleteTroupe = (troupeId: string) => {
    setCreatedTroupes(prev => prev.filter(troupe => troupe.id !== troupeId));
    
    toast({
      title: "Troupe supprimée",
      description: "La troupe a été supprimée de la liste",
    });
  };

  const finishSetup = () => {
    // Complete the setup process
    onContinue();
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 relative">
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-pixel text-green-400 mb-2 tracking-wider">
              $ CONFIGURATION_TROUPES
            </h1>
            <p className="text-base md:text-lg text-green-400/80 font-mono">
              Définissez les troupes qui s'affronteront dans cet univers
            </p>
          </div>
          
          <div className="bg-black/80 border-2 border-green-500 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <div className="space-y-4">
              {!showTroupes ? (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-4">
                    <Label className="mb-2 block text-base md:text-lg font-mono text-green-400 text-center">
                      $ NOMBRE_DE_TROUPES (2-10):
                    </Label>
                    
                    <div className="flex items-center justify-center space-x-4 md:space-x-6">
                      <Button
                        type="button"
                        onClick={decrementTroupes}
                        disabled={numberOfTroupes <= 2}
                        className="bg-red-600 hover:bg-red-700 text-white font-pixel h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="bg-black/50 border-2 border-green-500 rounded-md px-3 py-1 min-w-[50px] text-center">
                        <span className="text-lg font-pixel text-green-400">
                          {numberOfTroupes}
                        </span>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={incrementTroupes}
                        disabled={numberOfTroupes >= 10}
                        className="bg-green-600 hover:bg-green-700 text-white font-pixel h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {hintEnabled && (
                      <div className="space-y-3">
                        <Label className="mb-2 block text-base md:text-lg font-mono text-green-400 text-center">
                          $ JETONS_PAR_TROUPE (0-10):
                        </Label>
                        
                        <div className="flex items-center justify-center space-x-4 md:space-x-6">
                          <Button
                            type="button"
                            onClick={decrementTokens}
                            disabled={tokensPerTroupe <= 0}
                            className="bg-red-600 hover:bg-red-700 text-white font-pixel h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <div className="bg-black/50 border-2 border-green-500 rounded-md px-3 py-1 min-w-[50px] text-center">
                            <span className="text-lg font-pixel text-green-400">
                              {tokensPerTroupe}
                            </span>
                          </div>
                          
                          <Button
                            type="button"
                            onClick={incrementTokens}
                            disabled={tokensPerTroupe >= 10}
                            className="bg-green-600 hover:bg-green-700 text-white font-pixel h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-center text-sm text-green-400/70 font-mono">
                          <p>$ Chaque jeton utilisé = -50 points</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto md:mx-auto md:block bg-green-500 hover:bg-green-600 text-black font-pixel h-10 text-sm px-4"
                      >
                        $ CRÉER_TROUPES
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="font-mono text-lg md:text-xl mb-4 text-green-400 text-center">
                      $ TROUPES_INITIALISÉES:
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {createdTroupes.map((troupe) => (
                        <div key={troupe.id} className="border-2 border-green-500/30 rounded-md p-3 md:p-4 bg-black/50">
                          {editingTroupe === troupe.id ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editForm.sigil}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, sigil: e.target.value }))}
                                  className="w-16 text-center text-2xl bg-black/50 border-green-500/50"
                                  maxLength={2}
                                />
                                <Input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="flex-1 bg-black/50 border-green-500/50 text-green-400 font-pixel"
                                />
                              </div>
                              <Input
                                value={editForm.motto}
                                onChange={(e) => setEditForm(prev => ({ ...prev, motto: e.target.value }))}
                                className="bg-black/50 border-green-500/50 text-green-400/70 font-mono text-sm"
                                placeholder="Devise de la troupe"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={saveEdit}
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-black font-pixel"
                                >
                                  Sauvegarder
                                </Button>
                                <Button
                                  onClick={cancelEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 font-pixel"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl md:text-2xl">{troupe.sigil}</span>
                                <div className="flex-1">
                                  <div className="font-pixel text-base md:text-lg text-green-400">
                                    {troupe.name}
                                  </div>
                                  <div className="text-xs md:text-sm text-green-500/70 font-mono">
                                    {troupe.motto}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => startEdit(troupe)}
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/20 h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteTroupe(troupe.id)}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="text-xs text-green-400/70 font-mono">
                                <p>Ordre: #{troupe.order}</p>
                                <p>Jetons initiaux: {troupe.initialTokens}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-green-400/70 font-mono mb-3 text-sm">
                      $ Troupes créées avec succès! Utilisez les boutons de navigation pour continuer.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 border-t border-green-500/30 pt-4 text-xs md:text-sm text-center text-green-400/70 font-mono">
                <p>$ Chaque troupe générera automatiquement des salles lors de la création des sessions_</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TroupeCreator;