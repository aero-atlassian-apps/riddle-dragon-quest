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
import { getRoom } from "@/utils/db";

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
  
  // Get house icon based on house name
  const getHouseIcon = (name: string): string => {
    if (name.includes('Stark')) return '🐺';
    if (name.includes('Lannister')) return '🦁';
    if (name.includes('Targaryen')) return '🐉';
    if (name.includes('Baratheon')) return '🦌';
    if (name.includes('Greyjoy')) return '🦑';
    return '🛡️';
  };
  
  // Fetch room details and questions
  useEffect(() => {
    const fetchRoomAndQuestions = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        
        // Use the getRoom utility function from db.ts
        const room = await getRoom(roomId);
        
        if (!room) {
          setRoomNotFound(true);
          toast({
            title: "Room not found",
            description: "This game room doesn't exist or has been removed",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Fetch the session to get the start time
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('start_time')
          .eq('id', room.sessionId)
          .maybeSingle();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
        }
        
        setRoomDetails({
          name: room.name,
          sessionId: room.sessionId,
          sessionStartTime: sessionData?.start_time,
          sigil: getHouseIcon(room.name)
        });
        
        // Fetch questions for the session
        if (room.sessionId) {
          const { data: questionData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('session_id', room.sessionId);
          
          if (questionsError) throw questionsError;
          
          if (questionData && questionData.length > 0) {
            const formattedQuestions: Question[] = questionData.map(q => ({
              id: q.id,
              text: q.text,
              image: q.image,
              answer: q.answer
            }));
            
            setQuestions(formattedQuestions);
          } else {
            // No questions found for this session, use fallback
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
          }
        }
      } catch (error) {
        console.error("Error fetching room and questions:", error);
        toast({
          title: "Error",
          description: "Failed to load room data",
          variant: "destructive",
        });
        setRoomNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomAndQuestions();
  }, [roomId, toast]);
  
  // Set the current question based on the current door
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
      // Update the score in the database
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
          <p className="mb-6 font-medieval">This game room doesn't exist or has been removed.</p>
          <Link to="/">
            <Button className="bg-dragon-primary hover:bg-dragon-secondary font-medieval">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-4xl mx-auto">
        {/* House Banner */}
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
            {/* Session Timer */}
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
