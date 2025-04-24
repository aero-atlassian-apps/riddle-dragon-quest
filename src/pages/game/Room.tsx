
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
            console.error("Room not found");
            toast({
              title: "Error",
              description: "Room not found",
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
      setIsSessionCompleted(sessionStatus === "completed");
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
        return index + 1 < room.currentDoor;
      });
      setDoorStates(newDoorStates);
    }
  }, [room]);

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
                sessionStatus: sessionStatus || null
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
    return <div className="text-center">Room not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 relative">
      {showConfetti && <Confetti ref={confettiRef} />}

      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('/emblems/${room.name.toLowerCase().replace(/\s+/g, '-')}.svg')` }} />
        <h1 className="text-3xl font-bold font-medieval relative z-10 mb-2">Welcome to</h1>
        <h2 className="text-4xl font-bold font-medieval relative z-10 text-dragon-primary">{room.name}</h2>
      </div>

      {sessionStatus === "active" ? (
        <div className="mb-8 text-center p-6 border-4 border-green-500/30 rounded-xl bg-green-500/5 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 animate-pulse" />
          <h2 className="text-2xl font-medieval mb-3 text-green-500 relative z-10">✧ Session Active ✧</h2>
          <p className="text-green-400 text-lg relative z-10">You can now proceed with the game!</p>
        </div>
      ) : sessionStatus === "pending" ? (
        <div className="mb-8 text-center p-6 border-4 border-yellow-500/30 rounded-xl bg-yellow-500/5 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 animate-pulse" />
          <h2 className="text-2xl font-medieval mb-3 text-yellow-500 relative z-10">✧ Waiting for Session to Start ✧</h2>
          <p className="text-yellow-400 text-lg relative z-10">The Game Master will start the session soon. Please wait...</p>
        </div>
      ) : sessionStatus === "completed" ? (
        <div className="mb-8 text-center p-6 border-4 border-blue-500/30 rounded-xl bg-blue-500/5 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 animate-pulse" />
          <h2 className="text-2xl font-medieval mb-3 text-blue-500 relative z-10">✧ Session Completed! ✧</h2>
          <p className="text-blue-400 text-lg relative z-10">Congratulations on completing all the challenges!</p>
        </div>
      ) : (
        <div className="mb-8 text-center p-6 border-4 border-red-500/30 rounded-xl bg-red-500/5 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse" />
          <h2 className="text-2xl font-medieval mb-3 text-red-500 relative z-10">✧ Session Not Available ✧</h2>
          <p className="text-red-400 text-lg relative z-10">Unable to connect to the game session. Please check your room link.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {doorStates.map((isOpen, index) => (
          <Door
            key={index}
            doorNumber={index + 1}
            isActive={index + 1 === room.currentDoor}
            isOpen={isOpen}
            sessionStatus={sessionStatus}
            onDoorClick={async () => {
              if (sessionStatus === 'active' && index + 1 === room.currentDoor && !isOpen) {
                try {
                  console.log('Fetching question for door:', index + 1, 'session:', room.sessionId);
                  
                  // Fetch the question for this door from the database
                  const { data: questionData, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('session_id', room.sessionId)
                    .eq('door_number', index + 1)
                    .single();

                  console.log('Question data received:', questionData, 'Error:', error);

                  if (error) {
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

                  // Validate question data
                  if (!questionData.text || !questionData.answer) {
                    console.error('Invalid question data:', questionData);
                    toast({
                      title: "Error",
                      description: "The question data is incomplete.",
                      variant: "destructive",
                    });
                    return;
                  }

                  // When setting the question data, change image_url to image
                  setQuestion({
                    id: questionData.id,
                    text: questionData.text,
                    answer: questionData.answer,
                    image: questionData.image, // Changed from image_url to image
                    doorNumber: questionData.door_number
                  });
                  setShowQuestion(true);
                  console.log('Question set successfully:', questionData.id);
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
        ))}
      </div>

      {(showQuestion || gameState.currentQuestion) && (
        <div className="mt-6 mb-6">
          <RiddleQuestion
            question={gameState.currentQuestion}
            tokensLeft={gameState.tokensLeft}
            onSubmitAnswer={(answer) => {
              submitAnswer(answer);
              if (gameState.isAnswerCorrect) {
                setShowQuestion(false);
              }
            }}
            onUseToken={useToken}
            isCorrect={gameState.isAnswerCorrect}
          />
        </div>
      )}

      <div className="mt-4 text-center">
        <p>Tokens Left: {room.tokensLeft}</p>
        <p>Current Score: {room.score}</p>
      </div>

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
