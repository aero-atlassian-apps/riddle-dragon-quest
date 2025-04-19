import React, { useEffect } from 'react';
import { Question } from '../types/game';
import Calisy from './Calisy';
import DoorKeeper from './DoorKeeper';
import { Button } from './ui/button';

interface FeedbackCharacterProps {
  isCorrect: boolean | null;
  isSpeaking: boolean;
  question?: Question;
  onTryAgain?: () => void;
  onContinue?: () => void;
}

const FeedbackCharacter: React.FC<FeedbackCharacterProps> = ({ 
  isCorrect, 
  isSpeaking, 
  question, 
  onTryAgain, 
  onContinue 
}) => {
  // Debug logs to track component state
  console.log("FeedbackCharacter render:", { 
    isCorrect, 
    isSpeaking, 
    hasQuestion: !!question,
    hasContinueHandler: !!onContinue,
    hasOnTryAgain: !!onTryAgain
  });

  // Effect to log when handlers change
  useEffect(() => {
    console.log("FeedbackCharacter handlers updated:", {
      hasContinueHandler: !!onContinue,
      hasOnTryAgain: !!onTryAgain
    });
  }, [onContinue, onTryAgain]);

  // Correct answer state - show Calisy with congratulations
  if (isCorrect === true) {
    console.log("RENDERING CALISY - Correct answer detected!");
    
    return (
      <div className="relative w-full max-w-md mx-auto">
        <Calisy 
          isSpeaking={true} 
          question={{
            ...question,
            text: "Well done, brave one! You've solved this riddle."
          }}
        />
        {onContinue && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => {
                console.log("Continue button clicked");
                onContinue();
              }}
              className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
            >
              Continue to Next Door
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Wrong answer state - show DoorKeeper with error message
  if (isCorrect === false) {
    console.log("RENDERING DOORKEEPER - Wrong answer detected!");
    
    return (
      <div className="relative w-full max-w-md mx-auto">
        <DoorKeeper 
          isCorrect={false} 
          isSpeaking={true}
          question={{
            ...question,
            text: "Wrong answer, try again!"
          }}
        />
        {onTryAgain && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => {
                console.log("Try Again button clicked"); 
                onTryAgain();
              }}
              className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Initial state - show DoorKeeper with the question
  return (
    <div className="relative w-full max-w-md mx-auto">
      <DoorKeeper 
        isCorrect={null} 
        isSpeaking={isSpeaking} 
        question={question} 
      />
    </div>
  );
};

export default FeedbackCharacter;