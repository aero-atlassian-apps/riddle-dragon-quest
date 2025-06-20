
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
  calculateTimeBonus: () => number;
  tokenMalus: number;
  setTotalDoors: (totalDoors: number) => void;
}

interface InitialState {
  score: number;
  currentDoor: number;
  tokensLeft: number;
}

const initialGameState: GameState = {
  tokensLeft: 1,
  initialTokens: 1,
  currentDoor: 1,
  totalDoors: 6,
  score: 0,
  isAnswerCorrect: null,
  isGameComplete: false,
  startTime: new Date(),
  timeBonus: 1,
  tokenMalus: 1,
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
        initialTokens: initialState.tokensLeft, // Set initial tokens to the starting amount
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
      const tokensUsed = 1 - gameState.tokensLeft;
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

  const calculateFinalScore = (roomTokensLeft?: number) => {
    const completionTime = new Date();
    const minutesTaken = Math.floor((completionTime.getTime() - gameState.startTime.getTime()) / (1000 * 60));

    // Maximum time bonus is 200 points for the full game
    const maxTimeBonus = 200;

    // Simple linear time bonus: 200 points for 0 minutes, decreasing to 50 points at 30+ minutes
    // Formula: 200 - (minutesTaken * 5), clamped between 50 and 200
    const linearBonus = 200 - (minutesTaken * 5);
    const timeBonus = Math.max(50, Math.min(200, Math.floor(linearBonus)));

    // Calculate token malus (-50 points per token used)
    // Use room tokens if provided, otherwise fall back to gameState
    const tokensLeft = roomTokensLeft !== undefined ? roomTokensLeft : gameState.tokensLeft;
    // Calculate tokens used based on initial tokens minus current tokens left
    const tokensUsed = Math.max(0, gameState.initialTokens - tokensLeft);
    const tokenMalus = tokensUsed * -50;

    console.log(`Time bonus calculated: ${timeBonus} (Minutes: ${minutesTaken}, Linear formula: 200 - ${minutesTaken} * 5)`);
    console.log(`Token malus calculated: ${tokenMalus} (Tokens used: ${tokensUsed})`);

    return { timeBonus, tokenMalus };
  };

  const setTotalDoors = (totalDoors: number) => {
    console.log("Setting total doors to:", totalDoors);
    setGameState((prev) => ({
      ...prev,
      totalDoors
    }));
  };

  const setStartTime = (startTime: Date) => {
    console.log("Setting game start time to:", startTime);
    setGameState((prev) => ({
      ...prev,
      startTime
    }));
  };

  const goToNextDoor = () => {
    const nextDoor = gameState.currentDoor + 1;
    console.log("Going to next door:", nextDoor);

    // Increased timeout to 1500ms to make transitions smoother and more visible
    setTimeout(() => {
      if (nextDoor > gameState.totalDoors) {
        // Don't calculate final score here - Room.tsx handles final score calculation and database update
        setGameState((prev) => ({
          ...prev,
          isGameComplete: true,
        }));
      } else {
        // Don't reset tokens when going to next door since tokens are per room, not per door
        setGameState((prev) => ({
          ...prev,
          currentDoor: nextDoor,
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
        calculateFinalScore,
        tokenMalus: gameState.tokenMalus,
        setTotalDoors,
        setStartTime,
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
