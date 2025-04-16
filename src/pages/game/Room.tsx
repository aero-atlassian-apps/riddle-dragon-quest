import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { GameProvider, useGame } from "@/context/GameContext";
import Door from "@/components/Door";
import Dragon from "@/components/Dragon";
import RiddleQuestion from "@/components/RiddleQuestion";
import { Question } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import SessionTimer from "@/components/SessionTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRoom, getRoomDirectCheck } from "@/utils/db";

const GameRoom = () => {
  return (
    <GameProvider>
      <RoomContent />
    </GameProvider>
  );
};

const RoomContent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, setQuestion, submitAnswer, useToken, goToNextDoor } = useGame();
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
    sessionStartTime?: string
  } | null>(null);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  
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
        console.log("[ROOM PAGE] Attempting to fetch room with ID:", roomId);
        
        const { data: allRoomsData, error: allRoomsError } = await supabase
          .from('rooms')
          .select('*');
          
        if (allRoomsError) {
          console.error("Error fetching all rooms directly:", allRoomsError);
          setDebugInfo(prev => [...prev, `Error fetching rooms: ${allRoomsError.message}`]);
        } else {
          setAllRooms(allRoomsData || []);
          console.log(`Found ${allRoomsData?.length || 0} rooms directly from database`);
          setDebugInfo(prev => [...prev, `Found ${allRoomsData?.length || 0} rooms directly from database`]);
          
          if (allRoomsData && allRoomsData.length > 0) {
            const matchingRoom = allRoomsData.find(r => r.id === roomId);
            if (matchingRoom) {
              console.log("Room found in initial direct database query:", matchingRoom);
              setDebugInfo(prev => [...prev, `Room found in database: ${matchingRoom.name} (ID: ${matchingRoom.id})`]);
              
              setRoomDetails({
                name: matchingRoom.name,
                sessionId: matchingRoom.session_id,
                sigil: getHouseIcon(matchingRoom.name)
              });
              
              if (matchingRoom.session_id) {
                const { data: sessionData } = await supabase
                  .from('sessions')
                  .select('start_time, status')
                  .eq('id', matchingRoom.session_id)
                  .maybeSingle();
                  
                if (sessionData) {
                  setRoomDetails(prev => ({
                    ...prev!,
                    sessionStartTime: sessionData.start_time
                  }));
                }
                
                const { data: questionData } = await supabase
                  .from('questions')
                  .select('*')
                  .eq('session_id', matchingRoom.session_id);
                  
                if (questionData && questionData.length > 0) {
                  const formattedQuestions: Question[] = questionData.map(q => ({
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
                
                setLoading(false);
                return;
              }
            } else {
              console.log(`Room with ID ${roomId} not found in database`);
              setDebugInfo(prev => [...prev, `Room with ID ${roomId} NOT found in database`]);
              if (allRoomsData.length > 0) {
                setDebugInfo(prev => [...prev, `Available rooms: ${allRoomsData.map(r => `${r.name} (${r.id})`).join(', ')}`]);
              }
            }
          } else {
            console.log("No rooms found in the database at all");
            setDebugInfo(prev => [...prev, "No rooms found in the database at all"]);
          }
        }
        
        const directCheck = await getRoomDirectCheck(roomId);
        
        if (directCheck.exists && directCheck.data) {
          console.log("Room found via direct check function:", directCheck.data);
          setDebugInfo(prev => [...prev, "Room found via direct check function"]);
          
          const roomData = directCheck.data;
          
          setRoomDetails({
            name: roomData.name,
            sessionId: roomData.session_id,
            sigil: getHouseIcon(roomData.name)
          });
          
          if (roomData.session_id) {
            const { data: sessionData } = await supabase
              .from('sessions')
              .select('start_time')
              .eq('id', roomData.session_id)
              .maybeSingle();
            
            if (sessionData) {
              setRoomDetails(prev => ({
                ...prev!,
                sessionStartTime: sessionData.start_time
              }));
            }
            
            const { data: questionData } = await supabase
              .from('questions')
              .select('*')
              .eq('session_id', roomData.session_id);
            
            if (questionData && questionData.length > 0) {
              const formattedQuestions: Question[] = questionData.map(q => ({
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
            
            setLoading(false);
            return;
          }
        } else {
          console.error("Room not found via any method for ID:", roomId);
          setDebugInfo(prev => [...prev, "Room not found via any method"]);
          setRoomNotFound(true);
          setErrorMessage("This game room doesn't exist or has been removed");
          toast({
            title: "Room not found",
            description: "This game room doesn't exist or has been removed",
            variant: "destructive",
          });
        }
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
  }, [gameState.currentDoor, questions, setQuestion]);
  
  const handleDoorClick = () => {
    setShowQuestion(true);
  };
  
  const handleSubmitAnswer = (answer: string) => {
    const isCorrect = submitAnswer(answer);
    
    if (isCorrect) {
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
      
      setTimeout(() => {
        setShowQuestion(false);
        goToNextDoor();
      }, 2000);
    }
  };

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
            
            <Link to="/admin">
              <Button variant="outline" className="w-full font-medieval">
                Go to Admin Dashboard
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
        
        {gameState.isGameComplete ? (
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
            <div className="mb-8 flex justify-center">
              <Dragon
                isAwake={true}
                isSpeaking={true}
                question={gameState.currentQuestion}
              />
            </div>
            
            {gameState.currentQuestion && (
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
              <Dragon isAwake={false} isSpeaking={false} />
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
