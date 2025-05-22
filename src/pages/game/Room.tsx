
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DoorKeeper from '@/components/DoorKeeper';
import { toast } from '@/components/ui/use-toast';
import { getRoom, getSessionStatus } from '@/utils/db';
import { supabase } from '@/integrations/supabase/client';
import { Session, Room as RoomType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import Door from '@/components/Door';
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from 'lucide-react';
import { generateRoomId } from '@/utils/roomIdGenerator';
import { useConfettiStore } from '@/store/confettiStore';
import { useModal } from '@/store/modalStore';
import { useGameStore } from '@/store/gameStore';
import { Confetti } from '@/components/Confetti';
import { calculateDoorStates } from '@/utils/gameLogic';
import RiddleQuestion from '@/components/RiddleQuestion';
import { useGame } from '@/context/GameContext';

const Room: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const roomIdFromQuery = searchParams.get('roomId');
  const roomId = params.roomId || roomIdFromQuery; // Getting roomId from either params or query

  const [room, setRoom] = useState<RoomType | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [doorStates, setDoorStates] = useState<boolean[]>([false, false, false]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDirectlyNavigated, setIsDirectlyNavigated] = useState(false);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);

  const { openModal, closeModal } = useModal();
  const { gameState, setQuestion, submitAnswer, useToken } = useGame();
  const { setRoomId: setStoreRoomId } = useGameStore();
  const confettiRef = useRef<HTMLDivElement>(null);
  const user = useUser();
  const { startConfetti, stopConfetti } = useConfettiStore();

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(e.target.value);
  };

  const handleCreateRoom = async () => {
    if (!room?.sessionId) {
      toast({
        title: "Error",
        description: "Session ID is missing. Cannot create a new room without a session.",
        variant: "destructive",
      });
      return;
    }

    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Room name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingRoom(true);
    try {
      const newRoomId = generateRoomId();
      setGeneratedRoomId(newRoomId);

      const response = await fetch('/api/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: room.sessionId,
          roomName: newRoomName,
          roomId: newRoomId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `New room "${newRoomName}" created successfully with ID: ${newRoomId}`,
        });
        setStoreRoomId(newRoomId);
        navigate(`/game/room?roomId=${newRoomId}`);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to create room',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create room',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRoom(false);
      closeModal();
      setIsNewRoomModalOpen(false);
    }
  };

  const handleCopyRoomId = () => {
    if (generatedRoomId) {
      navigator.clipboard.writeText(generatedRoomId)
        .then(() => {
          setIsCopied(true);
          toast({
            title: "Copied!",
            description: "Room ID copied to clipboard.",
          });
          setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(err => {
          console.error("Could not copy room ID: ", err);
          toast({
            title: "Error",
            description: "Failed to copy room ID to clipboard.",
            variant: "destructive",
          });
        });
    }
  };

  useEffect(() => {
    // Replacing router.isReady with a simple truth check
    if (!roomId) return;

    const fetchRoomData = async () => {
      setIsLoading(true);
      try {
        if (roomId) {
          const currentRoom = await getRoom(roomId as string);
          if (currentRoom) {
            setRoom(currentRoom);
            setStoreRoomId(currentRoom.id);

            if (currentRoom.sessionId) {
              const status = await getSessionStatus(currentRoom.sessionId);
              // Only set the session status if we got a valid response
              if (status) {
                setSessionStatus(status);
                console.log('Session status set to:', status);
              } else {
                console.warn("Invalid session status received");
                setSessionStatus(null);
              }
            } else {
              console.warn("Room does not have a session ID.");
              setSessionStatus(null);
            }
          } else {
            console.error("La salle n'existe plus");
            toast({
              title: "Error",
              description: "La salle n'existe plus",
              variant: "destructive",
            });
            navigate('/');
          }
        } else {
          console.warn("Room ID is undefined.");
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
        toast({
          title: "Error",
          description: "Failed to load room data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
    setIsDirectlyNavigated(true);
  }, [roomId, navigate, setStoreRoomId]);

  useEffect(() => {
    if (sessionStatus) {
      setIsSessionActive(sessionStatus === "active");
      setIsSessionCompleted(sessionStatus === "terminée");
    } else {
      setIsSessionActive(false);
      setIsSessionCompleted(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (room) {
      // Calculate door states based on current door and total doors
      const totalDoors = 6; // Total number of doors in the game
      const newDoorStates = Array(totalDoors).fill(false).map((_, index) => {
        // A door is considered open if its number is less than the current door
        // This means the player has already completed this door
        // If currentDoor > 6, all doors should be open (challenge completed)
        return room.currentDoor > 6 ? true : index + 1 < room.currentDoor;
      });
      setDoorStates(newDoorStates);
      
      // If all doors are open, trigger celebration
      if (room.currentDoor > 6) {
        startConfetti();
        setShowConfetti(true);
      }
    }
  }, [room, startConfetti]);

  useEffect(() => {
    if (isSessionCompleted) {
      startConfetti();
      setShowConfetti(true);
    } else {
      stopConfetti();
      setShowConfetti(false);
    }

    return () => {
      stopConfetti();
      setShowConfetti(false);
    };
  }, [isSessionCompleted, stopConfetti, startConfetti]);

  useEffect(() => {
    let channel: any;

    if (roomId && isDirectlyNavigated) {
      channel = supabase
        .channel('room-status-subscription')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
          (payload) => {
            console.log('Change received!', payload);
            if (payload.new) {
              const updatedRoom = payload.new as any;
              setRoom({
                id: updatedRoom.id,
                sessionId: updatedRoom.session_id,
                name: updatedRoom.name,
                tokensLeft: updatedRoom.tokens_left,
                currentDoor: updatedRoom.current_door,
                score: updatedRoom.score,
                sessionStatus: sessionStatus || null,
                sigil: updatedRoom.sigil,
                motto: updatedRoom.motto
              });
            }
          })
        .subscribe();

      supabase
        .channel('session-status-subscription')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' },
          (payload) => {
            console.log('Session status changed!', payload);
            if (room?.sessionId && payload.new && (payload.new as any).id === room?.sessionId) {
              setSessionStatus((payload.new as any).status);
            }
          })
        .subscribe();

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [roomId, sessionStatus, isDirectlyNavigated, room?.sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="w-[300px] h-[40px] mb-4" />
        <div className="space-y-2">
          <Skeleton className="w-[200px] h-[30px]" />
          <Skeleton className="w-[250px] h-[30px]" />
          <Skeleton className="w-[150px] h-[30px]" />
        </div>
      </div>
    );
  }

  if (!room) {
    return <div className="text-center">La salle n'existe plus.</div>;
  }

  return (
    <div className="container mx-auto p-4 relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 before:absolute before:inset-0 before:bg-[url('/terminal-bg.png')] before:opacity-10 before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
      {showConfetti && <Confetti ref={confettiRef} />}
      <div className="mb-8 text-center p-6 bg-black/90 border-2 border-green-500 rounded-lg font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url('/emblems/${room?.name?.toLowerCase().replace(/\s+/g, '-')}.svg')` }} />
        <div className="relative z-10">
          <div className="mb-4 p-3 bg-black/30 rounded-lg border border-green-500/20 flex items-center gap-4">
            <p className="text-xl text-green-400 font-medieval">{room?.sigil || 'Loading...'}</p>
            <h1 className="text-4xl font-bold font-medieval text-green-400">{room?.name || ''}</h1>
            <p className="text-md text-green-400/80 font-medieval italic">"{room?.motto || ''}"</p>
          </div>

          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center bg-black/50 px-4 py-2 rounded-lg border border-amber-500/30">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse mr-2" />
              <span className="text-2xl text-amber-500 font-pixel">{room?.tokensLeft} Jetons</span>
            </div>
            <div className="flex items-center bg-black/50 px-4 py-2 rounded-lg border border-green-500/30">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2" />
              <span className="text-2xl text-green-500 font-pixel">{room?.score} Points</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-3">
            {sessionStatus === "en attente" && (
              <>
                <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse mr-2" />
                <h3 className="text-2xl text-yellow-500 font-pixel glitch">[ SESSION DE JEU: EN ATTENTE ]</h3>
              </>
            )}
            {sessionStatus === "terminée" && (
              <>
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-2" />
                <h3 className="text-2xl text-blue-500 font-pixel glitch">[ SESSION DE JEU: TERMINÉE ]</h3>
              </>
            )}
            {!sessionStatus && (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2" />
                <h3 className="text-2xl text-red-500 font-pixel glitch">[ ERREUR: SESSION_NON_TROUVÉE ]</h3>
              </>
            )}
          </div>

          <div className="text-sm font-pixel typing-effect mt-2">
            {sessionStatus === "terminée" && (
              <>
                <p className="text-blue-400">$ MISSION ACCOMPLIE. TOUS LES DÉFIS RELEVÉS.</p>
                <p className="text-blue-400">$ FÉLICITATIONS, BRAVE AVENTURIER !</p>
              </>
            )}
            {!sessionStatus && (
              <>
                <p className="text-red-400">$ ÉCHEC DE LA CONNEXION. IMPOSSIBLE D'ÉTABLIR LE LIEN.</p>
                <p className="text-red-400">$ VEUILLEZ VÉRIFIER LES IDENTIFIANTS DE LA SALLE ET RÉESSAYER.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {!showQuestion ? (
        <div className="max-w-6xl mx-auto px-4">
          {/* Challenge completion message - shown when all doors are open */}
          {room.currentDoor > 6 && (
            <div className="mb-12 text-center p-6 bg-black/80 border-2 border-amber-500 rounded-lg font-mono relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.2)_0%,transparent_70%)]" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-amber-400 font-medieval mb-4">DÉFI TERMINÉ!</h2>
                <p className="text-xl text-amber-300 font-medieval mb-6">Félicitations, brave aventurier! Vous avez vaincu tous les gardiens et déverrouillé toutes les portes.</p>
                <Link to="/leaderboard">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-pixel px-6 py-3 text-lg">
                    VOIR LE MUR DES HÉROS
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 place-items-center">
            {doorStates.map((isOpen, index) => (
              <div key={index} className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <Door
                  doorNumber={index + 1}
                  isActive={index + 1 === room.currentDoor}
                  isOpen={isOpen}
                  sessionStatus={sessionStatus}
                  onDoorClick={async () => {
                    if (sessionStatus === 'active' && index + 1 === room.currentDoor && !isOpen) {
                      try {
                        console.log('Fetching question for door:', index + 1, 'session:', room.sessionId);

                        const { data: questionData, error } = await supabase
                          .from('questions')
                          .select('*')
                          .eq('session_id', room.sessionId)
                          .eq('door_number', index + 1)
                          .maybeSingle();

                        console.log('Question data received:', questionData, 'Error:', error);

                        if (error && error.code !== 'PGRST116') {
                          console.error('Database error:', error);
                          throw error;
                        }

                        if (!questionData) {
                          console.warn('No question data found for door:', index + 1);
                          toast({
                            title: "Error",
                            description: "No question available for this door.",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (!questionData.text || !questionData.answer) {
                          console.error('Invalid question data:', questionData);
                          toast({
                            title: "Error",
                            description: "The question data is incomplete.",
                            variant: "destructive",
                          });
                          return;
                        }

                        const questionToSet = {
                          id: questionData.id,
                          text: questionData.text,
                          answer: questionData.answer,
                          image: questionData.image,
                          hint: questionData.hint,
                          doorNumber: questionData.door_number,
                          points: questionData.points,
                          style: questionData.style
                        };
                        setQuestion(questionToSet);
                        setShowQuestion(true);
                        console.log('Question set successfully:', questionData.id);
                        gameState.currentQuestion = questionToSet;
                      } catch (error: any) {
                        console.error('Error fetching question:', error);
                        toast({
                          title: "Error",
                          description: "Failed to load the question.",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 mb-6">
          <DoorKeeper
            isCorrect={gameState.isAnswerCorrect}
            isSpeaking={true}
            question={gameState.currentQuestion}
          />
          <div className="mt-6">
            <RiddleQuestion
              question={gameState.currentQuestion}
              tokensLeft={room.tokensLeft}
              onSubmitAnswer={async (answer: string) => {
                try {
                  if (!gameState.currentQuestion || !room) {
                    throw new Error('Missing question or room data');
                  }

                  const isCorrect = answer.toLowerCase() === gameState.currentQuestion.answer.toLowerCase();
                  gameState.isAnswerCorrect = isCorrect;

                  if (isCorrect) {
                    // Calculate final score based on tokens used and question points
                    const calculateFinalScore = (basePoints: number, tokensUsed: number, isLastDoor: boolean) => {
                      // Calculate points with token penalty
                      const pointsWithPenalty = Math.max(Math.floor(basePoints * (1 - (0.1 * tokensUsed))), Math.floor(basePoints * 0.6));
                      // Add time bonus if this is the last door, capped at 200 points
                      const timeBonus = isLastDoor ? 200 : 0;
                      return pointsWithPenalty + timeBonus;
                    };
                    
                    // Calculate points based on tokens used and question points
                    const tokensUsed = 3 - room.tokensLeft;
                    const { data: questionData } = await supabase
                      .from('questions')
                      .select('points')
                      .eq('id', gameState.currentQuestion.id)
                      .single();

                    const questionPoints = questionData?.points || 100;
                    const isLastDoor = room.currentDoor === 6;
                    const finalScore = calculateFinalScore(questionPoints, tokensUsed, isLastDoor);

                    // Start a transaction to update the room state
                    const { data: updatedRoom, error: updateError } = await supabase
                      .from('rooms')
                      .update({
                        score: room.score + finalScore,
                        current_door: room.currentDoor + 1
                      })
                      .eq('id', room.id)
                      .select()
                      .single();

                    if (updateError) {
                      console.error('Failed to update room:', updateError);
                      toast({
                        title: "Error",
                        description: "Failed to update room progress. Please try again.",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Update local states only after successful database update
                    const newDoorStates = [...doorStates];
                    newDoorStates[gameState.currentQuestion.doorNumber - 1] = true;
                    setDoorStates(newDoorStates);

                    setRoom({
                      ...room,
                      score: updatedRoom.score,
                      currentDoor: updatedRoom.current_door
                    });

                    // Trigger celebration effects
                    setShowConfetti(true);
                    const audio = new Audio('/sounds/success.mp3');
                    await audio.play().catch(console.error); // Handle audio play error gracefully

                    // Check if all doors are now open (challenge completed)
                    const allDoorsOpen = updatedRoom.current_door > 6;
                    if (allDoorsOpen) {
                      // Trigger more intense celebration for challenge completion
                      startConfetti();
                      
                      // Play victory sound
                      const victoryAudio = new Audio('/sounds/victory.mp3');
                      await victoryAudio.play().catch(console.error);
                    }

                    // Reset game state after celebration
                    setTimeout(() => {
                      setShowConfetti(false);
                      setShowQuestion(false);
                      gameState.currentQuestion = null;
                      gameState.isAnswerCorrect = null;
                    }, 3000);
                  }
                } catch (error) {
                  console.error('Error submitting answer:', error);
                  toast({
                    title: "Error",
                    description: "Failed to submit answer",
                    variant: "destructive",
                  });
                }
              }}
              onUseToken={async () => {
                if (!room || !gameState.currentQuestion) return;
                
                // Update tokens in the database
                const newTokensLeft = room.tokensLeft - 1;
                const { error } = await supabase
                  .from('rooms')
                  .update({ tokens_left: newTokensLeft })
                  .eq('id', room.id);

                if (error) {
                  console.error('Error updating tokens:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update tokens",
                    variant: "destructive",
                  });
                  return;
                }

                // Update local state
                setRoom(prev => prev ? { ...prev, tokensLeft: newTokensLeft } : null);
                
                // Call the context's useToken function
                useToken();
              }}
              isCorrect={gameState.isAnswerCorrect}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {user?.isAdmin ? (
          <>
            <Link to="/game/sessions">
              <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Manage Sessions
              </Button>
            </Link>
          </>
        ) : null}
      </div>

      <Modal title="Create a New Room" description="Enter the details for your new room." modalId="newRoomModal">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              type="text"
              id="roomName"
              placeholder="Enter room name"
              value={newRoomName}
              onChange={handleRoomNameChange}
            />
          </div>
        </div>
        <Button onClick={handleCreateRoom} disabled={isGeneratingRoom}>
          {isGeneratingRoom ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Room'
          )}
        </Button>
      </Modal>

      {generatedRoomId && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-700">
            New Room ID: <span className="font-medium">{generatedRoomId}</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyRoomId}
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Room ID
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Room;