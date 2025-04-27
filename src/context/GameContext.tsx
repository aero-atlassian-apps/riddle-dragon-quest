
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Question, GameState } from '../types/game';

interface GameContextProps {
  gameState: GameState;
  setQuestion: (question: Question) => void;
  submitAnswer: (answer: string) => boolean;
  useToken: () => void;
  resetGame: () => void;
  goToNextDoor: () => void;
  showContinueButton: boolean;
  setShowContinueButton: (show: boolean) => void;
}

interface InitialState {
  score: number;
  currentDoor: number;
  tokensLeft: number;
}

const initialGameState: GameState = {
  tokensLeft: 3,
  currentDoor: 1,
  totalDoors: 6,
  score: 0,
  isAnswerCorrect: null,
  isGameComplete: false,
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode; initialState?: InitialState | null }> = ({ 
  children, 
  initialState 
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (initialState) {
      console.log("Initializing game with saved state:", initialState);
      return {
        ...initialGameState,
        tokensLeft: initialState.tokensLeft,
        currentDoor: initialState.currentDoor,
        score: initialState.score,
      };
    }
    return initialGameState;
  });
  const [showContinueButton, setShowContinueButton] = useState(false);

  const setQuestion = (question: Question | undefined) => {
    if (!question) {
      console.error('Attempted to set undefined question');
      return;
    }

    if (!question.text || !question.answer) {
      console.error('Invalid question format:', question);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentQuestion: question,
      isAnswerCorrect: null,
    }));
    setShowContinueButton(false);
  };

  const submitAnswer = (answer: string): boolean => {
    if (!gameState.currentQuestion) return false;

    const isCorrect = gameState.currentQuestion.answer.toLowerCase() === answer.toLowerCase();
    
    console.log("submitAnswer called with:", answer);
    console.log("Correct answer is:", gameState.currentQuestion.answer);
    console.log("Is answer correct?", isCorrect);
    
    if (isCorrect) {
      const tokensUsed = 3 - gameState.tokensLeft;
      const questionPoints = gameState.currentQuestion.points || 100;
      const pointsEarned = Math.max(Math.floor(questionPoints * (1 - (0.1 * tokensUsed))), Math.floor(questionPoints * 0.6));
      console.log("Points earned:", pointsEarned, "from question points:", questionPoints);
      
      setGameState((prev) => ({
        ...prev,
        score: prev.score + pointsEarned,
        isAnswerCorrect: true,
      }));
      
      // Always show continue button on correct answer
      console.log("Setting showContinueButton to true on correct answer");
      setShowContinueButton(true);
    } else {
      setGameState((prev) => ({
        ...prev,
        isAnswerCorrect: false,
      }));
    }
    
    return isCorrect;
  };

  const useToken = () => {
    if (gameState.tokensLeft > 0) {
      setGameState((prev) => ({
        ...prev,
        tokensLeft: prev.tokensLeft - 1,
      }));
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setShowContinueButton(false);
  };

  const goToNextDoor = () => {
    const nextDoor = gameState.currentDoor + 1;
    console.log("Going to next door:", nextDoor);
    
    // Increased timeout to 1500ms to make transitions smoother and more visible
    setTimeout(() => {
      if (nextDoor > gameState.totalDoors) {
        setGameState((prev) => ({
          ...prev,
          isGameComplete: true,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentDoor: nextDoor,
          tokensLeft: 3,
          isAnswerCorrect: null,
        }));
      }
      
      setShowContinueButton(false);
    }, 1500);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setQuestion,
        submitAnswer,
        useToken,
        resetGame,
        goToNextDoor,
        showContinueButton,
        setShowContinueButton,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
