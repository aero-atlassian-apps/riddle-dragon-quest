
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Minus, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HOUSE_NAMES = [
  { name: "House Stark", sigil: "🐺", motto: "Winter is Coming" },
  { name: "House Lannister", sigil: "🦁", motto: "Hear Me Roar" },
  { name: "House Targaryen", sigil: "🐉", motto: "Fire and Blood" },
  { name: "House Baratheon", sigil: "🦌", motto: "Ours is the Fury" },
  { name: "House Greyjoy", sigil: "🦑", motto: "We Do Not Sow" },
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

  const createRoomsInDatabase = async (rooms: {name: string, id: string}[]) => {
    const { createRoom } = await import('@/utils/db');
    
    for (const room of rooms) {
      const result = await createRoom(sessionId, room.name, room.id);
      
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

  const continueToQuestions = () => {
    setShowLinks(false);
    onContinue();
  };

  return (
    <div className="parchment max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center font-medieval">Create Great Houses</h2>
      
      {!showLinks ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="mb-3 block text-lg font-medieval">Number of Houses (2-5)</Label>
            
            <div className="flex items-center justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementRooms}
                disabled={numberOfRooms <= 2}
                className="border-dragon-gold/30 hover:bg-dragon-accent/10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-2xl font-medieval w-8 text-center">{numberOfRooms}</span>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementRooms}
                disabled={numberOfRooms >= 5}
                className="border-dragon-gold/30 hover:bg-dragon-accent/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-dragon-primary hover:bg-dragon-secondary font-medieval"
              >
                Create Houses
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-medieval text-xl mb-3">Your Great Houses</h3>
            
            <div className="space-y-4">
              {createdRooms.map((room, index) => (
                <div key={index} className="border-2 border-dragon-gold/30 rounded-md p-4 bg-dragon-scroll/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{room.sigil}</span>
                    <div>
                      <div className="font-medieval text-lg text-dragon-primary">{room.name}</div>
                      <div className="text-sm text-gray-600 italic">{room.motto}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 truncate flex-1">
                      {room.link}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-dragon-gold/30"
                      onClick={() => copyToClipboard(room.link)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-dragon-gold/30"
                      asChild
                    >
                      <a href={room.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={continueToQuestions}
              className="w-full bg-dragon-primary hover:bg-dragon-secondary font-medieval"
            >
              Continue to Questions
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 border-t border-dragon-gold/30 pt-4 text-sm text-center text-gray-500 font-medieval">
        <p>Each house will receive a unique URL for their members to join</p>
      </div>
    </div>
  );
};

export default RoomCreator;
