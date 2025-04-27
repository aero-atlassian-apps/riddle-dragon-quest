
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Minus, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HOUSE_NAMES = [
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

interface RoomCreatorProps {
  sessionId: string;
  onCreateRooms: (roomNames: string[]) => void;
  onContinue: () => void;
}

const RoomCreator: React.FC<RoomCreatorProps> = ({ sessionId, onCreateRooms, onContinue }) => {
  const [numberOfRooms, setNumberOfRooms] = useState<number>(2);
  const [createdRooms, setCreatedRooms] = useState<{name: string, link: string, sigil: string, motto: string, id: string}[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const { toast } = useToast();

  const incrementRooms = () => {
    if (numberOfRooms < 5) {
      setNumberOfRooms(prev => prev + 1);
    }
  };

  const decrementRooms = () => {
    if (numberOfRooms > 2) {
      setNumberOfRooms(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Randomly select houses without repeating
    const shuffledHouses = [...HOUSE_NAMES].sort(() => Math.random() - 0.5);
    const selectedHouses = shuffledHouses.slice(0, numberOfRooms);
    
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
    const { createRoom } = await import('@/utils/db');
    
    for (const room of rooms) {
      const result = await createRoom(sessionId, room.name, room.id, room.sigil, room.motto);
      
      if (!result) {
        toast({
          title: "Error creating room",
          description: `Failed to create room: ${room.name}`,
          variant: "destructive",
        });
      }
    }
    
    toast({
      title: "Rooms created successfully",
      description: `${rooms.length} rooms have been created`,
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
    <div className="max-w-md mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-6 text-center font-pixel text-green-400">$ INITIALISER_MAISONS</h2>
        
        {!showLinks ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="mb-3 block text-lg font-mono text-green-400">$ NOMBRE_DE_MAISONS (2-5):</Label>
              
              <div className="flex items-center justify-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementRooms}
                  disabled={numberOfRooms <= 2}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="text-2xl font-mono text-green-400 w-8 text-center">{numberOfRooms}</span>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementRooms}
                  disabled={numberOfRooms >= 5}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
                >
                  $ CRÉER_MAISONS
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-mono text-xl mb-3 text-green-400">$ MAISONS_INITIALISÉES:</h3>
              
              <div className="space-y-4">
                {createdRooms.map((room, index) => (
                  <div key={index} className="border-2 border-green-500/30 rounded-md p-4 bg-black/50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{room.sigil}</span>
                      <div>
                        <div className="font-pixel text-lg text-green-400">{room.name}</div>
                        <div className="text-sm text-green-500/70 font-mono">{room.motto}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 border-green-500/50 text-green-400 hover:bg-green-500/20"
                        onClick={() => copyToClipboard(room.link)}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">COPIER_LIEN</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 border-green-500/50 text-green-400 hover:bg-green-500/20"
                        asChild
                      >
                        <a href={room.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="ml-2">OUVRIR</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={finishSetup}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
              >
                $ TERMINER_CONFIGURATION
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-6 border-t border-green-500/30 pt-4 text-sm text-center text-green-400/70 font-mono">
          <p>$ Chaque maison recevra une URL unique pour l'accès des membres_</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCreator;
