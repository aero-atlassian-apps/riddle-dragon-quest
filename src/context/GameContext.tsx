
import React, { createContext, useContext, useState, ReactNode } from 'react';
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

const initialGameState: GameState = {
  tokensLeft: 3,
  currentDoor: 1,
  totalDoors: 6,
  score: 0,
  isAnswerCorrect: null,
  isGameComplete: false,
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const setQuestion = (question: Question) => {
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
    
    if (isCorrect) {
      // Calculate score: 100 points - (10 points * tokens used)
      const tokensUsed = 3 - gameState.tokensLeft;
      const pointsEarned = 100 - (10 * tokensUsed);
      
      setGameState((prev) => ({
        ...prev,
        score: prev.score + pointsEarned,
        isAnswerCorrect: true,
      }));
      
      // Show continue button after a successful answer
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
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
    
    if (nextDoor > gameState.totalDoors) {
      setGameState((prev) => ({
        ...prev,
        isGameComplete: true,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        currentDoor: nextDoor,
        tokensLeft: 3, // Reset tokens for the next door
        isAnswerCorrect: null,
      }));
    }
    
    setShowContinueButton(false);
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
