
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface RoomCreatorProps {
  sessionId: string;
  onCreateRooms: (roomNames: string[]) => void;
}

const RoomCreator: React.FC<RoomCreatorProps> = ({ sessionId, onCreateRooms }) => {
  const [roomNames, setRoomNames] = useState<string[]>(['', '']);

  const addRoom = () => {
    setRoomNames([...roomNames, '']);
  };

  const removeRoom = (index: number) => {
    const newRooms = [...roomNames];
    newRooms.splice(index, 1);
    setRoomNames(newRooms);
  };

  const updateRoomName = (index: number, name: string) => {
    const newRooms = [...roomNames];
    newRooms[index] = name;
    setRoomNames(newRooms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty room names
    const filteredRoomNames = roomNames.filter((name) => name.trim() !== '');
    
    if (filteredRoomNames.length === 0) {
      return;
    }
    
    onCreateRooms(filteredRoomNames);
  };

  return (
    <div className="parchment max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Create Rooms</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 inline-block">Room Names</Label>
            
            <div className="space-y-3">
              {roomNames.map((roomName, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Room ${index + 1}`}
                    value={roomName}
                    onChange={(e) => updateRoomName(index, e.target.value)}
                    className="border-dragon-gold/30 flex-1"
                  />
                  
                  {roomNames.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoom(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRoom}
              className="mt-3 text-dragon-primary border-dragon-primary/30 hover:bg-dragon-accent/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Room
            </Button>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-dragon-primary hover:bg-dragon-secondary"
              disabled={roomNames.every((name) => name.trim() === '')}
            >
              Create Rooms
            </Button>
          </div>
        </div>
      </form>
      
      <div className="mt-6 border-t border-dragon-gold/30 pt-4 text-sm text-center text-gray-500">
        <p>Each room will get a unique URL for team members to join</p>
      </div>
    </div>
  );
};

export default RoomCreator;
