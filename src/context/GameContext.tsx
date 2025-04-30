
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
  startTime: new Date(),
  timeBonus: 0,
  tokenMalus: 0,
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

  const calculateFinalScore = () => {
    const completionTime = new Date();
    const minutesTaken = Math.floor((completionTime.getTime() - gameState.startTime.getTime()) / (1000 * 60));

    // Maximum time bonus is 200 points for the full game
    const maxTimeBonus = 200;

    // Door difficulty weights (increases with each door)
    const doorDifficultyWeight = 1 + (gameState.currentDoor - 1) * 0.2; // 1.0, 1.2, 1.4, 1.6, 1.8, 2.0

    // Exponential decay factor for time penalty
    const decayFactor = 0.1;
    const timePenalty = Math.exp(-decayFactor * minutesTaken);

    // Calculate weighted bonus with diminishing returns, but cap at maxTimeBonus
    const rawBonus = maxTimeBonus * doorDifficultyWeight * timePenalty;
    
    // Scale the bonus to ensure maximum is capped at 200 points
    const scaleFactor = maxTimeBonus / (maxTimeBonus * gameState.totalDoors * 0.2);
    const scaledBonus = Math.min(rawBonus * scaleFactor, maxTimeBonus);

    // Ensure minimum bonus of 10% of max bonus if completed
    const timeBonus = Math.max(Math.floor(scaledBonus), Math.floor(maxTimeBonus * 0.1));

    // Calculate token malus (-30 points per token used)
    // Since tokens are per room (not per door), we calculate based on initial tokens (3)
    const tokensUsed = 3 - gameState.tokensLeft;
    const tokenMalus = tokensUsed * -30;

    console.log(`Time bonus calculated: ${timeBonus} (Minutes: ${minutesTaken}, Difficulty: ${doorDifficultyWeight})`);
    console.log(`Token malus calculated: ${tokenMalus} (Tokens used: ${tokensUsed})`);

    return { timeBonus, tokenMalus };
  };

  const goToNextDoor = () => {
    const nextDoor = gameState.currentDoor + 1;
    console.log("Going to next door:", nextDoor);

    // Increased timeout to 1500ms to make transitions smoother and more visible
    setTimeout(() => {
      if (nextDoor > gameState.totalDoors) {
        const { timeBonus, tokenMalus } = calculateFinalScore();
        setGameState((prev) => ({
          ...prev,
          isGameComplete: true,
          timeBonus,
          tokenMalus,
          score: prev.score + timeBonus + tokenMalus
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
