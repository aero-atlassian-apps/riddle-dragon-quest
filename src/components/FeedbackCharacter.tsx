import React, { useEffect } from 'react';
import { Question } from '../types/game';
import Calisy from './Calisy';
import DoorKeeper from './DoorKeeper';
import { Button } from './ui/button';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  
  // Debug logs to track component state
  console.log("FeedbackCharacter render:", { 
    isCorrect, 
    isSpeaking, 
    hasQuestion: !!question,
    hasContinueHandler: !!onContinue,
    hasOnTryAgain: !!onTryAgain
  });

  // Effect to notify when the correct answer state changes
  useEffect(() => {
    if (isCorrect === true) {
      console.log("Correct answer detected! Continue button should appear");
      
      toast({
        title: "Correct answer!",
        description: "You've solved this riddle successfully.",
      });
    }
  }, [isCorrect, toast]);
  
  // Force showing Calisy on correct answers
  if (isCorrect === true) {
    console.log("RENDERING CALISY - Correct answer detected!");
    console.log("onContinue handler exists:", !!onContinue);
    
    return (
      <div className="relative w-full max-w-md mx-auto">
        <Calisy 
          isSpeaking={true} 
          question={{
            ...question,
            text: question?.text || "Well done, brave one! You've solved this riddle."
          }}
        />
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={() => {
              console.log("Continue button clicked");
              if (onContinue) {
                onContinue();
              } else {
                console.error("Continue handler is missing!");
              }
            }}
            className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
          >
            Continue to Next Door
          </Button>
        </div>
      </div>
    );
  }
  
  // Wrong answer shows DoorKeeper with wrong answer message
  if (isCorrect === false) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <DoorKeeper 
          isCorrect={isCorrect} 
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
  
  // Default state shows DoorKeeper
  return (
    <div className="relative w-full max-w-md mx-auto">
      <DoorKeeper 
        isCorrect={isCorrect} 
        isSpeaking={isSpeaking} 
        question={question} 
      />
    </div>
  );
};

export default FeedbackCharacter;
