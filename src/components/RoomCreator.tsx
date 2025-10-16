
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Minus, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HOUSE_NAMES = [
  { name: "Stark", sigil: "🐺", motto: "Winter is Coming" },
  { name: "Lannister", sigil: "🦁", motto: "Hear Me Roar!" },
  { name: "Targaryen", sigil: "🐉", motto: "Fire and Blood" },
  { name: "Baratheon", sigil: "🦌", motto: "Ours is the Fury" },
  { name: "Greyjoy", sigil: "🦑", motto: "We Do Not Sow" },
  { name: "Tyrell", sigil: "🌹", motto: "Growing Strong" },
  { name: "Martell", sigil: "🌞", motto: "Unbowed, Unbent, Unbroken" },
  { name: "Bolton", sigil: "🩸", motto: "Our Blades Are Sharp" },
  { name: "Tully", sigil: "🐟", motto: "Family, Duty, Honor" },
  { name: "Arryn", sigil: "🦅", motto: "As High as Honor" },
  { name: "Mormont", sigil: "🐻", motto: "Here We Stand" },
  { name: "Tarly", sigil: "🏹", motto: "First in Battle" },
  { name: "Hightower", sigil: "🗼", motto: "We Light the Way" },
  { name: "Mallister", sigil: "🦅", motto: "Above the Rest" },
  { name: "Florent", sigil: "🦊", motto: "Proud and Free" }
];

interface RoomCreatorProps {
  challengeId: string;
  onCreateRooms: (roomNames: string[]) => void;
  onContinue: () => void;
  hintEnabled?: boolean;
}

const RoomCreator: React.FC<RoomCreatorProps> = ({ challengeId, onCreateRooms, onContinue, hintEnabled = true }) => {
  const [numberOfRooms, setNumberOfRooms] = useState<number>(2);
  const [tokensPerRoom, setTokensPerRoom] = useState<number>(1);
  const [createdRooms, setCreatedRooms] = useState<{name: string, link: string, sigil: string, motto: string, id: string}[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const { toast } = useToast();

  const incrementRooms = () => {
    if (numberOfRooms < 15) {
      setNumberOfRooms(prev => prev + 1);
    }
  };

  const decrementRooms = () => {
    if (numberOfRooms > 2) {
      setNumberOfRooms(prev => prev - 1);
    }
  };

  const incrementTokens = () => {
    if (tokensPerRoom < 15) {
      setTokensPerRoom(prev => prev + 1);
    }
  };

  const decrementTokens = () => {
    if (tokensPerRoom > 0) {
      setTokensPerRoom(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Select houses in order without randomness
    const selectedHouses = HOUSE_NAMES.slice(0, numberOfRooms);
    
    // Create room links
    const generatedRooms = selectedHouses.map(house => {
      const roomId = crypto.randomUUID();
      const link = `${window.location.origin}/game/room/${roomId}`;
      return {
        name: house.name,
        link,
        sigil: house.sigil,
        motto: house.motto,
        id: roomId // Store the ID for database creation
      };
    });
    
    setCreatedRooms(generatedRooms);
    setShowLinks(true);
    
    // Pass room data to parent component
    onCreateRooms(generatedRooms.map(room => room.name));
    
    // Create the rooms in the database with the generated IDs
    createRoomsInDatabase(generatedRooms);
  };

  const createRoomsInDatabase = async (rooms: {name: string, id: string, sigil: string, motto: string}[]) => {
    const { createRoom, getChallenge } = await import('@/utils/db');
    
    // Get challenge data to check for universe_id
    const challenge = await getChallenge(challengeId);
    const universeId = challenge?.universeId || null;
    
    console.log('[ROOM CREATOR DEBUG] Creating rooms for challenge:', challengeId, 'with universe_id:', universeId);
    
    // Use tokensPerRoom only if hints are enabled, otherwise default to 1
    const tokensToUse = hintEnabled ? tokensPerRoom : 1;
    
    for (const room of rooms) {
      const result = await createRoom(challengeId, room.name, room.id, room.sigil, room.motto, tokensToUse, tokensToUse, universeId);
      
      if (!result) {
        toast({
          title: "Error creating room",
          description: `Failed to create room: ${room.name}`,
          variant: "destructive",
        });
      } else {
        console.log('[ROOM CREATOR DEBUG] Successfully created room:', room.name, 'with universe_id:', universeId);
      }
    }
    
    toast({
      title: "Arènes créées",
      description: `${rooms.length} arènes ont été créées`,
    });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Room link has been copied to clipboard",
    });
  };

  const finishSetup = () => {
    // Complete the setup process
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 relative">
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 relative z-10 max-w-7xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-4 md:mb-6 font-mono tracking-wider">
            CRÉATEUR D’ARÈNE
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-green-300 font-mono">
            Configurez votre arène de quête
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/90 border-2 border-green-500 rounded-lg p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
            <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center font-pixel text-green-400">$ INITIALISER_MAISONS</h2>
        
              {!showLinks ? (
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="space-y-6">
                    <Label className="mb-4 block text-lg md:text-xl font-mono text-green-400 text-center">$ NOMBRE_DE_TROUPES (2-15):</Label>
                    
                    <div className="flex items-center justify-center space-x-6 md:space-x-8">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementRooms}
                        disabled={numberOfRooms <= 2}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50 min-h-[56px] min-w-[56px] md:min-h-[64px] md:min-w-[64px]"
                      >
                        <Minus className="h-6 w-6 md:h-8 md:w-8" />
                      </Button>
                      
                      <span className="text-3xl md:text-4xl font-mono text-green-400 w-16 text-center">{numberOfRooms}</span>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementRooms}
                        disabled={numberOfRooms >= 15}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50 min-h-[56px] min-w-[56px] md:min-h-[64px] md:min-w-[64px]"
                      >
                        <Plus className="h-6 w-6 md:h-8 md:w-8" />
                      </Button>
                    </div>
                    

                    
                    {hintEnabled && (
                      <div className="space-y-6">
                        <Label className="mb-4 block text-lg md:text-xl font-mono text-green-400 text-center">$ JETONS_PAR_ARÈNE (0-15):</Label>
                        
                        <div className="flex items-center justify-center space-x-6 md:space-x-8">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={decrementTokens}
                            disabled={tokensPerRoom <= 0}
                            className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50 min-h-[56px] min-w-[56px] md:min-h-[64px] md:min-w-[64px]"
                          >
                            <Minus className="h-6 w-6 md:h-8 md:w-8" />
                          </Button>
                          
                          <span className="text-3xl md:text-4xl font-mono text-green-400 w-16 text-center">{tokensPerRoom}</span>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={incrementTokens}
                            disabled={tokensPerRoom >= 15}
                            className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50 min-h-[56px] min-w-[56px] md:min-h-[64px] md:min-w-[64px]"
                          >
                            <Plus className="h-6 w-6 md:h-8 md:w-8" />
                          </Button>
                        </div>
                        
                        <div className="text-center text-sm md:text-base text-green-400/70 font-mono">
                          <p>$ Chaque jeton utilisé = -50 points</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto md:mx-auto md:block bg-green-500 hover:bg-green-600 text-black font-pixel min-h-[56px] md:min-h-[64px] text-lg md:text-xl px-8 md:px-12"
                      >
                        $ CRÉER_ARÈNES
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="font-mono text-xl md:text-2xl mb-6 text-green-400 text-center">$ MAISONS_INITIALISÉES:</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {createdRooms.map((room, index) => (
                        <div key={index} className="border-2 border-green-500/30 rounded-md p-4 md:p-6 bg-black/50">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl md:text-3xl">{room.sigil}</span>
                            <div className="flex-1">
                              <div className="font-pixel text-lg md:text-xl text-green-400">{room.name}</div>
                              <div className="text-sm md:text-base text-green-500/70 font-mono">{room.motto}</div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20 min-h-[48px] md:min-h-[52px] text-sm md:text-base"
                              onClick={() => copyToClipboard(room.link)}
                            >
                              <Copy className="h-4 w-4 md:h-5 md:w-5" />
                              <span className="ml-2">COPIER_LIEN</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20 min-h-[48px] md:min-h-[52px] text-sm md:text-base"
                              asChild
                            >
                              <a href={room.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="ml-2">OUVRIR</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <Button 
                      onClick={onContinue}
                      className="w-full md:w-auto md:mx-auto md:block bg-green-500 hover:bg-green-600 text-black font-pixel min-h-[56px] md:min-h-[64px] text-lg md:text-xl px-8 md:px-12"
                    >
                      $ TERMINER_CONFIGURATION
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-8 border-t border-green-500/30 pt-6 text-sm md:text-base text-center text-green-400/70 font-mono">
                <p>$ Chaque maison recevra une URL unique pour l'accès des membres_</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCreator;
