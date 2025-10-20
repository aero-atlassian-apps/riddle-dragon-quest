import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy, SquareArrowOutUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  name: string;
  challenge_id: string;
  universe_id: string;
  created_at: string;
}

interface Challenge {
  id: string;
  name: string;
  universe_id: string;
  status: string;
}

interface Troupe {
  name: string;
  challenge_id: string;
}

interface ArenaMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  universeId: string;
  universeName: string;
}

const ArenaMatrix: React.FC<ArenaMatrixProps> = ({
  isOpen,
  onClose,
  universeId,
  universeName
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [troupes, setTroupes] = useState<Troupe[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && universeId) {
      fetchData();
    }
  }, [isOpen, universeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch challenges for this universe
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('id, name, universe_id, status')
        .eq('universe_id', universeId)
        .order('created_at', { ascending: true });

      if (challengesError) throw challengesError;

      // Fetch rooms for this universe
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, challenge_id, universe_id, created_at')
        .eq('universe_id', universeId)
        .order('created_at', { ascending: true });

      if (roomsError) throw roomsError;

      // Extract unique troupe names from rooms
      const uniqueTroupes = roomsData?.reduce((acc: Troupe[], room) => {
        const existingTroupe = acc.find(t => t.name === room.name && t.challenge_id === room.challenge_id);
        if (!existingTroupe) {
          acc.push({ name: room.name, challenge_id: room.challenge_id });
        }
        return acc;
      }, []) || [];

      setChallenges(challengesData || []);
      setRooms(roomsData || []);
      setTroupes(uniqueTroupes);
    } catch (error) {
      console.error('Error fetching arena matrix data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la matrice des arènes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoomForTroupeAndChallenge = (troupeName: string, challengeId: string): Room | undefined => {
    return rooms.find(room => room.name === troupeName && room.challenge_id === challengeId);
  };

  const copyRoomLink = (roomId: string) => {
    const roomLink = `${window.location.origin}/game/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Lien copié",
      description: "Le lien de l'arène a été copié dans le presse-papiers",
    });
  };

  const openRoomLink = (roomId: string) => {
    const roomLink = `${window.location.origin}/game/room/${roomId}`;
    window.open(roomLink, '_blank');
  };

  const getUniqueTeams = () => {
    const uniqueTeams = new Set<string>();
    troupes.forEach(troupe => uniqueTeams.add(troupe.name));
    return Array.from(uniqueTeams).sort();
  };

  const uniqueTeams = getUniqueTeams();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-black/95 border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-green-400 font-medieval text-xl flex items-center gap-2">
            <SquareArrowOutUpRight className="h-6 w-6" />
            Matrice des Arènes - {universeName}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <span className="ml-2 text-green-300">Chargement des données...</span>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4">
              {challenges.length === 0 || uniqueTeams.length === 0 ? (
                <div className="text-center py-8 text-green-300">
                  <SquareArrowOutUpRight className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <p>Aucune donnée disponible pour cette matrice.</p>
                  <p className="text-sm text-green-400 mt-2">
                    Créez des challenges et des troupes pour voir la matrice des arènes.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-green-500 bg-green-900/30 p-3 text-left text-green-400 font-medieval">
                          Troupe / Challenge
                        </th>
                        {challenges.map((challenge) => (
                          <th
                            key={challenge.id}
                            className="border border-green-500 bg-green-900/30 p-3 text-center text-green-400 font-medieval min-w-[150px]"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm">{challenge.name}</span>
                              <Badge 
                                variant={challenge.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {challenge.status}
                              </Badge>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueTeams.map((teamName) => (
                        <tr key={teamName}>
                          <td className="border border-green-500 bg-green-900/20 p-3 text-green-300 font-pixel font-semibold">
                            {teamName}
                          </td>
                          {challenges.map((challenge) => {
                            const room = getRoomForTroupeAndChallenge(teamName, challenge.id);
                            return (
                              <td
                                key={`${teamName}-${challenge.id}`}
                                className="border border-green-500 p-2 text-center"
                              >
                                {room ? (
                                  <div className="flex justify-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-500 text-blue-400 hover:bg-blue-500/20 h-8 w-8 p-0"
                                      onClick={() => openRoomLink(room.id)}
                                      title="Ouvrir l'arène"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500 text-green-400 hover:bg-green-500/20 h-8 w-8 p-0"
                                      onClick={() => copyRoomLink(room.id)}
                                      title="Copier le lien"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArenaMatrix;