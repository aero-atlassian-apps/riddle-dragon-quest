
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GameProvider, useGame } from "@/context/GameContext";
import Door from "@/components/Door";
import Dragon from "@/components/Dragon";
import RiddleQuestion from "@/components/RiddleQuestion";
import { Question } from "@/types/game";

// Mock questions for demonstration purposes
const mockQuestions: Question[] = [
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
];

const GameRoom = () => {
  // In a real app, these would be fetched from Supabase based on the room ID
  return (
    <GameProvider>
      <RoomContent />
    </GameProvider>
  );
};

const RoomContent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, setQuestion, submitAnswer, useToken, goToNextDoor } = useGame();
  
  const [showQuestion, setShowQuestion] = useState(false);
  
  // Set the current question based on the current door
  useEffect(() => {
    if (gameState.currentDoor <= mockQuestions.length) {
      setQuestion(mockQuestions[gameState.currentDoor - 1]);
    }
  }, [gameState.currentDoor, setQuestion]);
  
  const handleDoorClick = () => {
    setShowQuestion(true);
  };
  
  const handleSubmitAnswer = (answer: string) => {
    const isCorrect = submitAnswer(answer);
    
    if (isCorrect) {
      setTimeout(() => {
        setShowQuestion(false);
        goToNextDoor();
      }, 2000);
    }
  };
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Exit Game
              </Button>
            </Link>
            
            <h1 className="text-2xl font-bold">
              Room: {roomId || "Dragon's Lair"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold">{gameState.score}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            
            <div className="border-l h-10 border-gray-300"></div>
            
            <div className="text-right">
              <div className="text-lg font-bold">
                {gameState.currentDoor}/{gameState.totalDoors}
              </div>
              <div className="text-xs text-gray-500">Door</div>
            </div>
          </div>
        </div>
        
        {gameState.isGameComplete ? (
          <div className="text-center my-16 parchment py-12">
            <h2 className="text-3xl font-bold mb-6">Quest Complete!</h2>
            <p className="text-xl mb-8">
              You've solved all the dragon's riddles and opened all doors!
            </p>
            <p className="text-2xl font-bold mb-8">
              Final Score: {gameState.score}
            </p>
            <Link to="/leaderboard">
              <Button size="lg" className="bg-dragon-gold hover:bg-dragon-gold/80">
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
            
            <h2 className="text-xl font-bold text-center mb-6">
              Choose a door to face the dragon's challenge
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {Array.from({ length: gameState.totalDoors }).map((_, i) => (
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
                <p className="text-dragon-scale">
                  You've successfully unlocked {gameState.currentDoor - 1} door(s)!
                </p>
                <p className="text-dragon-scale">
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
