
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DoorKeeper from '@/components/DoorKeeper';
import { toast } from '@/components/ui/use-toast';
import { getRoom, getSessionStatus, getSession, getMaxDoorNumber } from '@/utils/db';
import { supabase } from '@/integrations/supabase/client';
import { Session, Room as RoomType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import Door from '@/components/Door';
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { playAudio, AUDIO_PATHS } from "@/utils/audioUtils";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from 'lucide-react';
import { generateRoomId } from '@/utils/roomIdGenerator';
import { useConfettiStore } from '@/store/confettiStore';
import { useModal } from '@/store/modalStore';
import { useGameStore } from '@/store/gameStore';
import { Confetti } from '@/components/Confetti';
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
  const [sessionContext, setSessionContext] = useState<string | null>(null);
  const [sessionHintEnabled, setSessionHintEnabled] = useState<boolean>(true);
  const [totalDoors, setTotalDoors] = useState<number>(6);
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
  const [roomStartTime, setRoomStartTime] = useState<Date | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);

  const { openModal, closeModal } = useModal();
  const { gameState, setQuestion, submitAnswer, useToken, setTotalDoors: setGameTotalDoors, calculateFinalScore, goToNextDoor, setStartTime, syncTokensWithRoom } = useGame();
  const { setRoomId: setStoreRoomId } = useGameStore();
  const confettiRef = useRef<HTMLDivElement>(null);
  const user = useUser();
  const { startConfetti, stopConfetti } = useConfettiStore();

  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/[–—]/g, '-'); // Normalize dashes
  };

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
            tokensLeft: 1,
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
            
            // Initialize room-specific start time if this is the beginning of the game
            if (currentRoom.currentDoor === 1 && !roomStartTime) {
              const now = new Date();
              console.log('Initializing room start time for room:', currentRoom.id);
              setRoomStartTime(now);
              // Also set the shared game start time for backward compatibility
              setStartTime(now);
            }

            // Sync game state tokens with room tokens
            console.log('Syncing game tokens with room - Room tokens left:', currentRoom.tokensLeft);
            // Use the stored initial tokens from the database
            const roomInitialTokens = currentRoom.initialTokens;
            console.log('Room initial tokens from database:', roomInitialTokens, '(tokens left:', currentRoom.tokensLeft, ')');
            syncTokensWithRoom(currentRoom.tokensLeft, roomInitialTokens);

            if (currentRoom.sessionId) {
              const [status, session, maxDoorNumber] = await Promise.all([
                getSessionStatus(currentRoom.sessionId),
                getSession(currentRoom.sessionId),
                getMaxDoorNumber(currentRoom.sessionId)
              ]);
              
              // Set dynamic total doors
              setTotalDoors(maxDoorNumber);
              setGameTotalDoors(maxDoorNumber);
              console.log('Total doors set to:', maxDoorNumber);
              
              // Only set the session status if we got a valid response
              if (status) {
                setSessionStatus(status);
                console.log('Session status set to:', status);
              } else {
                console.warn("Invalid session status received");
                setSessionStatus(null);
              }
              
              // Set session name for display
              if (session?.name) {
                setSessionName(session.name);
              } else {
                setSessionName(null);
              }

              // Set session context if available
              if (session?.context) {
                setSessionContext(session.context);
                console.log('Session context set to:', session.context);
              } else {
                setSessionContext(null);
              }
              
              // Set session hint enabled setting
              setSessionHintEnabled(session?.hintEnabled ?? true);
              console.log('Session hint enabled set to:', session?.hintEnabled ?? true);
            } else {
              console.warn("Room does not have a session ID.");
              setSessionStatus(null);
              setSessionContext(null);
            }
          } else {
            console.error("La troupe n'existe plus");
            toast({
              title: "Error",
              description: "La troupe n'existe plus",
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
      const newDoorStates = Array(totalDoors).fill(false).map((_, index) => {
        // A door is considered open if its number is less than the current door
        // This means the player has already completed this door
        // If currentDoor > totalDoors, all doors should be open (challenge completed)
        return room.currentDoor > totalDoors ? true : index + 1 < room.currentDoor;
      });
      setDoorStates(newDoorStates);

      // If all doors are open, trigger celebration
      if (room.currentDoor > totalDoors) {
        startConfetti();
        setShowConfetti(true);
      }
    }
  }, [room, totalDoors, startConfetti]);

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
    let roomChannel: any;
    let sessionChannel: any;

    if (roomId && isDirectlyNavigated) {
      roomChannel = supabase
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

      sessionChannel = supabase
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
        if (roomChannel) {
          supabase.removeChannel(roomChannel);
        }
        if (sessionChannel) {
          supabase.removeChannel(sessionChannel);
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
    return <div className="text-center">La troupe n'existe plus.</div>;
  }

  return (
    <div className="w-full max-w-full mx-auto relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 before:absolute before:inset-0 before:bg-[url('/terminal-bg.png')] before:opacity-10 before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none px-2 sm:px-4 py-2 sm:py-4">
      {showConfetti && <Confetti ref={confettiRef} />}
      <div className="mb-4 lg:mb-6 text-center p-3 lg:p-4 bg-black/90 border-2 border-green-500 rounded-lg font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url('/emblems/${room?.name?.toLowerCase().replace(/\s+/g, '-')}.svg')` }} />
        <div className="relative z-10">
          {sessionName && (
            <div className="mb-2 p-3 bg-black/30 rounded-lg border border-amber-500/40">
              <div className="text-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-medieval text-amber-400">
                  {sessionName}
                </span>
              </div>
            </div>
          )}
          <div className="mb-4 p-3 bg-black/30 rounded-lg border border-green-500/20 flex items-center gap-4">
            <p className="text-xl text-green-400 font-medieval">{room?.sigil || 'Loading...'}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-medieval text-green-400">{room?.name || ''}</h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-green-400/80 font-medieval italic">"{room?.motto || ''}"</p>
          </div>

          <div className="flex items-center justify-center space-x-6 mb-4">
            {sessionHintEnabled && (
              <div className="flex items-center bg-black/50 px-4 py-2 rounded-lg border border-amber-500/30">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse mr-2" />
                <span className="text-2xl text-amber-500 font-pixel">{room?.tokensLeft} Jetons</span>
              </div>
            )}
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

          {sessionStatus === "active" && sessionContext && (
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-amber-400 mb-2">Contexte</h4>
              <p className="text-gray-300 font-pixel text-sm leading-relaxed max-w-4xl mx-auto whitespace-pre-line">
                {sessionContext}
              </p>
            </div>
          )}

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
                <p className="text-red-400">$ VEUILLEZ VÉRIFIER LES IDENTIFIANTS DE LA TROUPE ET RÉESSAYER.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {!showQuestion ? (
        <div className="w-full max-w-full mx-auto px-2 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-4">
          {/* Challenge completion message - shown when all doors are open */}
          {room.currentDoor > totalDoors && (
            <div className="mb-4 sm:mb-6 text-center p-2 sm:p-3 bg-black/80 border-2 border-amber-500 rounded-lg font-mono relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.2)_0%,transparent_70%)]" />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 font-medieval mb-2">DÉFI TERMINÉ!</h2>
                <p className="text-lg sm:text-xl text-amber-300 font-medieval mb-3">Félicitations, brave aventurier! Vous avez vaincu tous les gardiens et déverrouillé toutes les portes.</p>
                <Link to="/leaderboard">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-pixel px-4 sm:px-6 py-3 text-base sm:text-lg min-h-[48px] w-full sm:w-auto">
                    VOIR LE MUR DES HÉROS
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <div className={`w-full max-w-full grid gap-2 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8 ${
            totalDoors <= 4 ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
            totalDoors <= 8 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5' :
            totalDoors <= 12 ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6' :
            'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'
          } justify-items-center place-items-center`}>
            {doorStates.map((isOpen, index) => (
              <div key={index} className="flex flex-col items-center transform hover:scale-105 active:scale-95 transition-transform duration-300 w-full max-w-[200px]">
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
                          style: questionData.style,
                          prize: questionData.prize
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
        <div className="relative w-full max-w-full mx-auto">
          {/* Enhanced layout with question bubble positioned above door keeper */}
          <div className="relative flex flex-col items-center space-y-4">
            {/* Question bubble positioned above door keeper */}
            <div className="w-full max-w-6xl mx-auto relative z-20 -mb-8">
              <div className="bg-gray-800/95 backdrop-blur-sm border-2 border-amber-400/60 rounded-2xl p-6 shadow-2xl relative">
                {/* Speech bubble tail pointing down to door keeper */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-400/60"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[2px]">
                    <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[18px] border-l-transparent border-r-transparent border-t-gray-800/95"></div>
                  </div>
                </div>
                
                {/* Question text */}
                <div className="text-center mb-4">
                  <p className="text-lg md:text-xl lg:text-2xl font-medieval text-amber-300 leading-relaxed whitespace-pre-line">
                    {gameState.currentQuestion?.text}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Door keeper positioned below question bubble */}
            <div className="relative z-10 w-full max-w-md mx-auto">
              <DoorKeeper
                isCorrect={gameState.isAnswerCorrect}
                isSpeaking={false}
                question={gameState.currentQuestion}
              />
            </div>
          </div>
          
          {/* RiddleQuestion component for input and controls */}
          <div className="mt-8 w-full">
            <RiddleQuestion
              question={gameState.currentQuestion}
              tokensLeft={sessionHintEnabled ? room.tokensLeft : 0}
              hintEnabled={sessionHintEnabled}
              onSubmitAnswer={async (answer: string) => {
                try {
                  if (!gameState.currentQuestion || !room) {
                    throw new Error('Missing question or room data');
                  }

                  const isCorrect = normalizeString(answer) === normalizeString(gameState.currentQuestion.answer);
                  gameState.isAnswerCorrect = isCorrect;

                  if (isCorrect) {
                    // Calculate points based on question points only (no per-door penalties)
                    const { data: questionData } = await supabase
                      .from('questions')
                      .select('points')
                      .eq('id', gameState.currentQuestion.id)
                      .single();

                    const questionPoints = questionData?.points || 100;
                    // Use full question points - token malus will be applied only at game completion
                    const finalScore = questionPoints;

                    console.log("=== ROOM SCORE UPDATE DETAILS ===");
                    console.log("Question ID:", gameState.currentQuestion.id);
                    console.log("Question points from DB:", questionPoints);
                    console.log("Score to add to room:", finalScore);
                    console.log("Current room score:", room.score || 0);
                    console.log("New room score will be:", (room.score || 0) + finalScore);
                    console.log("==================================");

                    // Start a transaction to update the room state
                    const currentScore = room.score || 0; // Handle null scores
                    const { data: updatedRoom, error: updateError } = await supabase
                      .from('rooms')
                      .update({
                        score: currentScore + finalScore,
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
                      score: updatedRoom.score || 0,
                      currentDoor: updatedRoom.current_door
                    });

                    // Insert/update score record after each correct answer to keep universe leaderboard current
                    if (room.sessionId && room.universeId) {
                      const { insertGameScore } = await import('@/utils/db');
                      const scoreInserted = await insertGameScore(
                        room.id,
                        room.sessionId,
                        room.name,
                        updatedRoom.score || 0,
                        room.universeId
                      );
                      
                      if (scoreInserted) {
                        console.log('Score record updated successfully for universe leaderboard after correct answer');
                      } else {
                        console.error('Failed to update score record for universe leaderboard after correct answer');
                      }
                    }

                    // Trigger celebration effects
                    setShowConfetti(true);
                    
                    // Play success sound
                    playAudio(AUDIO_PATHS.GAME_WINNING, { volume: 0.5 });

                    // Check if all doors are now open (challenge completed)
                    const allDoorsOpen = updatedRoom.current_door > totalDoors;
                    if (allDoorsOpen) {
                      // Calculate and apply final score with time bonus only (token malus already applied immediately)
                      const { timeBonus } = calculateFinalScore(room.tokensLeft, roomStartTime || undefined);
                      const finalScoreAdjustment = timeBonus; // Only time bonus, no token malus
                      
                      console.log("=== GAME COMPLETION SCORE ADJUSTMENT ===");
                      console.log("All doors completed! Applying final adjustments...");
                      console.log("Room ID:", room.id);
                      console.log("Room start time used:", roomStartTime?.toISOString() || "Not set - using game state time");
                      console.log("Current room score after last question:", updatedRoom.score || 0);
                      console.log("Time bonus:", timeBonus);
                      console.log("Token malus: SKIPPED (already applied immediately when tokens were used)");
                      console.log("Total final adjustment (time bonus only):", finalScoreAdjustment);
                      console.log("Room tokens left:", room.tokensLeft);
                      
                      // Update the room score with the final adjustments (time bonus only)
                      const updatedScore = (updatedRoom.score || 0) + finalScoreAdjustment;
                      console.log("Final score after all adjustments:", updatedScore);
                      console.log("=========================================");
                      const { error: finalScoreError } = await supabase
                        .from('rooms')
                        .update({ score: updatedScore })
                        .eq('id', room.id);
                      
                      if (finalScoreError) {
                        console.error('Failed to apply final score adjustment:', finalScoreError);
                      } else {
                        // Update local room state with the final score
                        setRoom(prev => prev ? {
                          ...prev,
                          score: updatedScore
                        } : null);
                        
                        // Final score insertion for universe leaderboard (with time bonus)
                        if (room.sessionId && room.universeId) {
                          const { insertGameScore } = await import('@/utils/db');
                          const scoreInserted = await insertGameScore(
                            room.id,
                            room.sessionId,
                            room.name,
                            updatedScore,
                            room.universeId
                          );
                          
                          if (scoreInserted) {
                            console.log('Final score record updated successfully for universe leaderboard with time bonus');
                          } else {
                            console.error('Failed to update final score record for universe leaderboard');
                          }
                        }
                      }
                      
                      // Trigger more intense celebration for challenge completion
                      startConfetti();

                      // Play victory sound
                      playAudio(AUDIO_PATHS.GAME_WINNING, { volume: 0.5 });
                    }

                    // Stop confetti after celebration but keep question view open for manual control
                    setTimeout(() => {
                      setShowConfetti(false);
                    }, 3000);
                    
                    // Listen for manual continue event from RiddleQuestion component
                    const handleContinueToNextRoom = () => {
                      setShowQuestion(false);
                      gameState.currentQuestion = null;
                      gameState.isAnswerCorrect = null;
                      window.removeEventListener('continueToNextRoom', handleContinueToNextRoom);
                    };
                    
                    window.addEventListener('continueToNextRoom', handleContinueToNextRoom);
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
              onUseToken={sessionHintEnabled ? async () => {
                if (!room || !gameState.currentQuestion) return;

                // Apply immediate token malus (-50 points per token used)
                const tokenMalus = -50;
                const currentScore = room.score || 0;
                const newScore = currentScore + tokenMalus;
                const newTokensLeft = room.tokensLeft - 1;

                console.log("=== IMMEDIATE TOKEN MALUS APPLICATION ===");
                console.log("Token used - applying immediate malus of -50 points");
                console.log("Current room score:", currentScore);
                console.log("New room score after token malus:", newScore);
                console.log("Tokens left after usage:", newTokensLeft);
                console.log("=========================================");

                // Update tokens and apply immediate token malus in the database
                const { error } = await supabase
                  .from('rooms')
                  .update({ 
                    tokens_left: newTokensLeft,
                    score: newScore
                  })
                  .eq('id', room.id);

                if (error) {
                  console.error('Error updating tokens and score:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update tokens",
                    variant: "destructive",
                  });
                  return;
                }

                // Update local state with new score and tokens
                setRoom(prev => prev ? { 
                  ...prev, 
                  tokensLeft: newTokensLeft,
                  score: newScore
                } : null);

                // Call the context's useToken function
                useToken();
              } : undefined}
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