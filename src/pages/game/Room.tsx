import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GameProvider, useGame } from "@/context/GameContext";
import Door from "@/components/Door";
import DoorKeeper from "@/components/DoorKeeper";
import RiddleQuestion from "@/components/RiddleQuestion";
import GamesShield from "@/components/GamesShield";
import { Question } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import SessionTimer from "@/components/SessionTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import confetti from "canvas-confetti";

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [initialGameState, setInitialGameState] = useState<{
    score: number;
    currentDoor: number;
    tokensLeft: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomState = async () => {
      if (!roomId) return;
      
      try {
        const { data: roomData, error } = await supabase
          .from('rooms')
          .select('score, current_door, tokens_left')
          .eq('id', roomId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching room state:", error);
          return;
        }
        
        if (roomData) {
          console.log("Loaded saved room state:", roomData);
          setInitialGameState({
            score: roomData.score || 0,
            currentDoor: roomData.current_door || 1,
            tokensLeft: roomData.tokens_left || 3
          });
        }
      } catch (err) {
        console.error("Failed to fetch room state:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomState();
  }, [roomId]);
  
  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl font-medieval mb-4">⚔️</div>
          <p className="text-xl font-medieval">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GameProvider initialState={initialGameState}>
      <RoomContent />
    </GameProvider>
  );
};

const RoomContent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, setQuestion, submitAnswer, useToken, goToNextDoor, showContinueButton, setShowContinueButton } = useGame();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [showQuestion, setShowQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomDetails, setRoomDetails] = useState<{
    name: string, 
    sessionId: string,
    sigil?: string,
    motto?: string,
    sessionStartTime?: string,
    sessionStatus?: string
  } | null>(null);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>('pending');
  const [checkingSession, setCheckingSession] = useState<boolean>(false);
  
  const getHouseIcon = (name: string): string => {
    if (name.includes('Stark')) return '🐺';
    if (name.includes('Lannister')) return '🦁';
    if (name.includes('Targaryen')) return '🐉';
    if (name.includes('Baratheon')) return '🦌';
    if (name.includes('Greyjoy')) return '🦑';
    return '🛡️';
  };
  
  useEffect(() => {
    const fetchRoomAndQuestions = async () => {
      if (!roomId) {
        console.error("No room ID in URL parameters");
        setRoomNotFound(true);
        setErrorMessage("Missing room identifier in the URL");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setDebugInfo(prev => [...prev, `Attempting to find room: ${roomId}`]);
        console.log("[ROOM PAGE] Attempting to fetch room with ID:", roomId);

        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .maybeSingle();

        if (roomError) {
          setDebugInfo(prev => [...prev, `Error with direct DB query: ${roomError.message}`]);
          console.error("Direct room query error:", roomError);
        } 
        
        if (roomData) {
          setDebugInfo(prev => [...prev, `Room found with direct DB query: ${roomData.name}`]);
          console.log("Room found with direct query:", roomData);
          
          setRoomDetails({
            name: roomData.name,
            sessionId: roomData.session_id,
            sigil: getHouseIcon(roomData.name)
          });
          
          if (roomData.session_id) {
            const { data: sessionData, error: sessionError } = await supabase
              .from('sessions')
              .select('start_time, status')
              .eq('id', roomData.session_id)
              .maybeSingle();
            
            console.log("Session data:", sessionData);
            if (sessionError) {
              console.error("Error fetching session data:", sessionError);
            }
              
            if (sessionData) {
              setRoomDetails(prev => ({
                ...prev!,
                sessionStartTime: sessionData.start_time,
                sessionStatus: sessionData.status
              }));
              
              setSessionStatus(sessionData.status || 'pending');
            } else {
              console.warn("Session ID exists but no session data found for ID:", roomData.session_id);
            }
            
            const { data: questionsData, error: questionsError } = await supabase
              .from('questions')
              .select('*')
              .eq('session_id', roomData.session_id);
              
            if (questionsError) {
              console.error("Error fetching questions:", questionsError);
              setDefaultQuestions();
            } else if (questionsData && questionsData.length > 0) {
              const formattedQuestions: Question[] = questionsData.map(q => ({
                id: q.id,
                text: q.text,
                image: q.image,
                answer: q.answer
              }));
              
              setQuestions(formattedQuestions);
              console.log("Questions loaded:", formattedQuestions.length);
            } else {
              setDefaultQuestions();
            }
          } else {
            setDefaultQuestions();
          }
          
          setLoading(false);
          return;
        } else {
          setDebugInfo(prev => [...prev, "Room not found with direct DB query"]);
        }
        
        const { data: allRoomsData, error: allRoomsError } = await supabase
          .from('rooms')
          .select('*');
          
        if (allRoomsError) {
          console.error("Error fetching all rooms:", allRoomsError);
          setDebugInfo(prev => [...prev, `Error fetching all rooms: ${allRoomsError.message}`]);
        } else {
          setAllRooms(allRoomsData || []);
          const roomCount = allRoomsData?.length || 0;
          console.log(`Found ${roomCount} rooms directly from database`);
          setDebugInfo(prev => [...prev, `Found ${roomCount} rooms directly from database`]);
          
          if (allRoomsData && allRoomsData.length > 0) {
            const matchingRoom = allRoomsData.find(r => r.id === roomId);
            if (matchingRoom) {
              console.log("Room found in all rooms list:", matchingRoom);
              setDebugInfo(prev => [...prev, `Room found in all rooms list: ${matchingRoom.name}`]);
              
              setRoomDetails({
                name: matchingRoom.name,
                sessionId: matchingRoom.session_id,
                sigil: getHouseIcon(matchingRoom.name)
              });
              
              if (matchingRoom.session_id) {
                const { data: sessionData, error: sessionError } = await supabase
                  .from('sessions')
                  .select('start_time, status')
                  .eq('id', matchingRoom.session_id)
                  .maybeSingle();
                  
                console.log("Session data (alternate path):", sessionData);
                
                if (sessionError) {
                  console.error("Error fetching session data (alternate path):", sessionError);
                }
                  
                if (sessionData) {
                  setRoomDetails(prev => ({
                    ...prev!,
                    sessionStartTime: sessionData.start_time,
                    sessionStatus: sessionData.status
                  }));
                  
                  setSessionStatus(sessionData.status || 'pending');
                } else {
                  console.warn("Session ID exists but no session data found for ID (alternate path):", matchingRoom.session_id);
                }
                
                const { data: questionsData } = await supabase
                  .from('questions')
                  .select('*')
                  .eq('session_id', matchingRoom.session_id);
                  
                if (questionsData && questionsData.length > 0) {
                  const formattedQuestions: Question[] = questionsData.map(q => ({
                    id: q.id,
                    text: q.text,
                    image: q.image,
                    answer: q.answer
                  }));
                  
                  setQuestions(formattedQuestions);
                } else {
                  setDefaultQuestions();
                }
                
                setLoading(false);
                return;
              }
            } else {
              console.log(`Room with ID ${roomId} not found in database`);
              setDebugInfo(prev => [...prev, `Room with ID ${roomId} NOT found in all rooms list`]);
              if (allRoomsData.length > 0) {
                setDebugInfo(prev => [...prev, `Available rooms: ${allRoomsData.map(r => `${r.name} (${r.id})`).join(', ')}`]);
              }
            }
          }
        }
        
        setDebugInfo(prev => [...prev, "Room not found via any method"]);
        setRoomNotFound(true);
        setErrorMessage("This game room doesn't exist or has been removed");
        toast({
          title: "Room not found",
          description: "This game room doesn't exist or has been removed",
          variant: "destructive",
        });
        
      } catch (error) {
        console.error("Error fetching room and questions:", error);
        setErrorMessage(`Failed to load room data: ${error.message || "Unknown error"}`);
        setDebugInfo(prev => [...prev, `Error: ${error.message || "Unknown error"}`]);
        setRoomNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomAndQuestions();
  }, [roomId, toast]);
  
  // Define the checkSessionStatus function at the component level
  const checkSessionStatus = async () => {
    if (!roomDetails?.sessionId || checkingSession) return;

    try {
      setCheckingSession(true);
      console.log("Checking session status...");

      const { data: sessionData, error } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', roomDetails.sessionId)
        .maybeSingle();

      if (error) {
        console.error("Error checking session status:", error);
        return;
      }

      if (sessionData && sessionData.status) {
        console.log("Session status:", sessionData.status);
        // Only show toast notification if status changed from pending to active
        if (sessionStatus !== 'active' && sessionData.status === 'active') {
          toast({
            title: "Session started",
            description: "The game session has started!",
          });
        }
        setSessionStatus(sessionData.status);
      }
    } catch (error) {
      console.error("Error checking session status:", error);
    } finally {
      setCheckingSession(false);
    }
  };

  // Main effect for session status monitoring
  useEffect(() => {
    if (!roomDetails?.sessionId) {
      return;
    }

    // Initial check
    checkSessionStatus();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`session-${roomDetails.sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${roomDetails.sessionId}`
      }, (payload) => {
        console.log("Real-time session update received:", payload);
        if (payload.new && payload.new.status) {
          console.log("New session status:", payload.new.status);
          setSessionStatus(payload.new.status);
          if (payload.new.status === 'active' && (sessionStatus !== 'active' || document.visibilityState !== 'visible')) {
            toast({
              title: "Session started",
              description: "The game session has started!",
              duration: 5000,
            });
          }
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Subscription established, checking current status");
          checkSessionStatus();
        }
      });

    // Set up backup polling intervals
    const backupPollInterval = setInterval(() => {
      checkSessionStatus();
    }, 5000);

    const initialPollInterval = setInterval(() => {
      if (sessionStatus !== 'active') {
        console.log("Initial aggressive polling check");
        checkSessionStatus();
      } else {
        clearInterval(initialPollInterval);
      }
    }, 2000);

    const clearInitialPollingTimeout = setTimeout(() => {
      clearInterval(initialPollInterval);
    }, 60000);

    // Clean up function
    return () => {
      subscription.unsubscribe();
      clearInterval(backupPollInterval);
      clearInterval(initialPollInterval);
      clearTimeout(clearInitialPollingTimeout);
    };
  }, [roomDetails?.sessionId, toast, sessionStatus]);
  
  // Additional effect to ensure session status is checked when the component is focused
  useEffect(() => {
    if (roomDetails?.sessionId) {
      // Define the visibility change handler
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && roomDetails?.sessionId) {
          console.log("Tab became visible, checking session status");
          checkSessionStatus();
        }
      };
      
      // Add event listener for visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up the event listener
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [roomDetails?.sessionId])
  
  const setDefaultQuestions = () => {
    console.log("No questions found, using default questions");
    setQuestions([
      {
        id: 1,
        text: "What has keys but can't open locks?",
        answer: "piano",
      },
      {
        id: 2,
        text: "What gets wetter as it dries?",
        answer: "towel",
      },
      {
        id: 3,
        text: "What has a head and a tail but no body?",
        answer: "coin",
      },
      {
        id: 4,
        text: "What has one eye but cannot see?",
        answer: "needle",
      },
      {
        id: 5,
        text: "What can travel around the world while staying in a corner?",
        answer: "stamp",
      },
      {
        id: 6,
        text: "What has legs but doesn't walk?",
        answer: "table",
      },
    ]);
    
    toast({
      title: "No questions found",
      description: "Using default questions instead",
    });
  };
  
  useEffect(() => {
    if (questions.length > 0 && gameState.currentDoor <= questions.length) {
      setQuestion(questions[gameState.currentDoor - 1]);
    }
  }, [gameState.currentDoor, questions]);
  
  const handleDoorClick = () => {
    setShowQuestion(true);
  };
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState({
    show: false,
    prevScore: 0,
    newScore: 0
  });
  
  const launchCoinAnimation = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 30 * (timeLeft / duration);
      
      // Create gold coins falling from top
      confetti({
        particleCount: Math.floor(randomInRange(10, 20)),
        angle: randomInRange(80, 100),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.3, 0.7), y: 0 },
        gravity: 1.2,
        colors: ['#FFD700', '#FFC000', '#FFAE00', '#FFD700'],
        shapes: ['circle'],
        scalar: randomInRange(0.8, 1.2)
      });
    }, 250);
  };
  
  const handleSubmitAnswer = (answer: string) => {
    const isCorrect = submitAnswer(answer);
    console.log("Answer submitted, isCorrect:", isCorrect);
    
    // Always keep the question visible to show feedback
    setShowQuestion(true);
    
    if (isCorrect) {
      console.log("Correct answer! Setting showContinueButton to true");
      setShowContinueButton(true);
      setShowCelebration(true);
      
      // Animate score
      setScoreAnimation({
        show: true,
        prevScore: gameState.score - (100 - (10 * (3 - gameState.tokensLeft))),
        newScore: gameState.score
      });
      
      // Launch coin animation
      launchCoinAnimation();
      
      if (roomId) {
        supabase
          .from('rooms')
          .update({ 
            score: gameState.score, 
            current_door: gameState.currentDoor + 1,
            tokens_left: gameState.tokensLeft 
          })
          .eq('id', roomId)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating room score:", error);
            }
          });
      }
      
      // Automatically navigate to doors list after celebration animation
      setTimeout(() => {
        console.log("Auto-navigating to doors list after correct answer");
        goToNextDoor();
        setTimeout(() => {
          setShowQuestion(false);
        }, 1500);
      }, 3000); // 3 seconds delay to allow celebration animation to complete
    } else {
      // For wrong answers, ensure the Try Again button will show
      console.log("Wrong answer! Try Again button should appear");
      
      // Force a re-render with the correct state
      setGameState(prev => ({
        ...prev,
        isAnswerCorrect: false
      }));
    }
  };
  
    // handleContinue function removed - now handled automatically in handleSubmitAnswer
  
    // handleTryAgain function removed - now handled automatically with submit button coloring and sound

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl font-medieval mb-4">⚔️</div>
          <p className="text-xl font-medieval">Loading...</p>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white flex items-center justify-center">
        <div className="text-center parchment p-8 max-w-md">
          <h2 className="text-2xl font-bold font-medieval mb-4">Room Not Found</h2>
          <p className="mb-6 font-medieval">{errorMessage || "This game room doesn't exist or has been removed."}</p>
          
          <div className="mb-6 text-sm text-left bg-gray-100 p-4 rounded overflow-auto max-h-60">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            {debugInfo.map((info, index) => (
              <p key={index} className="mb-1">{info}</p>
            ))}
            
            {allRooms.length > 0 && (
              <div className="mt-3">
                <p className="font-bold">Available rooms in database:</p>
                <ul className="list-disc ml-4 mt-1">
                  {allRooms.slice(0, 10).map((room) => (
                    <li key={room.id} className="mb-1">
                      {room.name} (ID: {room.id})
                    </li>
                  ))}
                  {allRooms.length > 10 && <li>...and {allRooms.length - 10} more</li>}
                </ul>
              </div>
            )}
            
            <p className="mt-2 font-bold">Room ID from URL: {roomId}</p>
            
            <div className="mt-4">
              <Button 
                onClick={() => setDebugMode(!debugMode)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {debugMode ? "Hide Technical Details" : "Show Technical Details"}
              </Button>
              
              {debugMode && (
                <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-gray-200 rounded">
                  Database connection info:
                  Project URL: {process.env.SUPABASE_URL || 'Not Set'}
                  {JSON.stringify(allRooms, null, 2)}
                </pre>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full bg-dragon-primary hover:bg-dragon-secondary font-medieval">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-dragon-scroll/20 border-2 border-dragon-gold/30 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="flex-shrink-0 mr-3 flex items-center justify-center bg-dragon-accent/10 w-12 h-12 rounded-full">
                <span className="text-3xl" role="img" aria-label="House Sigil">
                  {roomDetails?.sigil || '🛡️'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-medieval text-dragon-primary">
                  {roomDetails?.name || "Dragon's Lair"}
                </h1>
                <p className="text-sm text-gray-600 italic">
                  {roomDetails?.motto || "Battle the dragon's riddles"}
                </p>
              </div>
            </div>
            <SessionTimer 
              startTime={roomDetails?.sessionStartTime} 
              className="font-medieval text-dragon-scale"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="sm" className="font-medieval">
                <ArrowLeft className="h-4 w-4 mr-1" /> Exit Game
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold font-medieval">{gameState.score}</div>
              <div className="text-xs text-gray-500 font-medieval">Points</div>
            </div>
            
            <div className="border-l h-10 border-gray-300"></div>
            
            <div className="text-right">
              <div className="text-lg font-bold font-medieval">
                {gameState.currentDoor}/{questions.length || gameState.totalDoors}
              </div>
              <div className="text-xs text-gray-500 font-medieval">Door</div>
            </div>
          </div>
        </div>
        
        {sessionStatus === 'pending' ? (
          <div className="text-center my-16">
            <h2 className="text-3xl font-bold mb-6 font-medieval">Waiting for Session to Start</h2>
            <div className="mb-8 flex justify-center">
              <GamesShield className="w-full max-w-3xl" />
            </div>
            <p className="text-xl mb-8 font-medieval">
              The game master has not started the session yet. Please wait...
            </p>
            <div className="animate-pulse flex justify-center">
              <div className="w-16 h-16 border-4 border-dragon-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-sm text-gray-500 font-medieval">
              The page will automatically update when the session begins
            </p>
          </div>
        ) : gameState.isGameComplete ? (
          <div className="text-center my-16 parchment py-12">
            <h2 className="text-3xl font-bold mb-6 font-medieval">Quest Complete!</h2>
            <p className="text-xl mb-8 font-medieval">
              You've solved all the dragon's riddles and opened all doors!
            </p>
            <p className="text-2xl font-bold mb-8 font-medieval">
              Final Score: {gameState.score}
            </p>
            <Link to="/leaderboard">
              <Button size="lg" className="bg-dragon-gold hover:bg-dragon-gold/80 font-medieval">
                View Leaderboard
              </Button>
            </Link>
          </div>
        ) : showQuestion ? (
          <div className="my-8">
            <div className="mb-8 flex justify-center relative">
              <div className="w-full max-w-xl px-16 relative">
                {/* Door Keeper for both question and feedback */}
                <DoorKeeper
                  isCorrect={gameState.isAnswerCorrect}
                  isSpeaking={true}
                  question={gameState.isAnswerCorrect === true ? {
                    ...gameState.currentQuestion!,
                    text: "Well done, brave one! You've solved this riddle. The door unlocks!"
                  } : gameState.isAnswerCorrect === false ? {
                    ...gameState.currentQuestion!,
                    text: "That's not quite right. The dragon's riddle remains unsolved. Try again!"
                  } : gameState.currentQuestion}
                />
                
                {/* Celebration effects for correct answer */}
                {showCelebration && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Animated score increase */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce-in">
                      <div className="text-3xl font-medieval text-dragon-gold font-bold">+{scoreAnimation.newScore - scoreAnimation.prevScore}</div>
                    </div>
                  </div>
                )}
                
                {/* Action buttons removed - now handled automatically */}
              </div>
            </div>
            
            {gameState.currentQuestion && !gameState.isAnswerCorrect && (
              <RiddleQuestion
                question={gameState.currentQuestion}
                tokensLeft={gameState.tokensLeft}
                onSubmitAnswer={handleSubmitAnswer}
                onUseToken={useToken}
                isCorrect={gameState.isAnswerCorrect}
              />
            )}
          </div>
        ) : (
          <div>
            <div className="my-8 flex justify-center">
              <GamesShield className="w-full max-w-3xl" />
            </div>
            
            <h2 className="text-xl font-bold text-center mb-6 font-medieval">
              Choose a door to face the dragon's challenge
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {Array.from({ length: questions.length || gameState.totalDoors }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-center"
                  onClick={i + 1 === gameState.currentDoor ? handleDoorClick : undefined}
                >
                  <Door
                    doorNumber={i + 1}
                    isActive={i + 1 === gameState.currentDoor}
                    isOpen={i + 1 < gameState.currentDoor}
                  />
                </div>
              ))}
            </div>
            
            {gameState.currentDoor > 1 && (
              <div className="text-center mt-12">
                <p className="text-dragon-scale font-medieval">
                  You've successfully unlocked {gameState.currentDoor - 1} door(s)!
                </p>
                <p className="text-dragon-scale font-medieval">
                  Current score: {gameState.score} points
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
