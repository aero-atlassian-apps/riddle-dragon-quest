
import React from 'react';
import { Question } from '../types/game';
import Calisy from './Calisy';
import DoorKeeper from './DoorKeeper';
import Dragon from './Dragon';
import { Button } from './ui/button';

interface FeedbackCharacterProps {
  isCorrect: boolean | null;
  isSpeaking: boolean;
  question?: Question;
  onTryAgain?: () => void;
  onContinue?: () => void;
}

const FeedbackCharacter: React.FC<FeedbackCharacterProps> = ({ isCorrect, isSpeaking, question, onTryAgain, onContinue }) => {
  // Updated character display logic:
  // isCorrect === null: show DoorKeeper (default, waiting for answer)
  // isCorrect === false: show Dragon (wrong answer)
  // isCorrect === true: show Calisy (correct answer)
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      {isCorrect === true ? (
        <>
          <Calisy 
            isSpeaking={isSpeaking} 
            question={question} 
          />
          {onContinue && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={onContinue}
                className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
              >
                Continue
              </Button>
            </div>
          )}
        </>
      ) : isCorrect === false ? (
        <>
          <Dragon 
            isAwake={true}
            isSpeaking={isSpeaking}
            question={{
              ...question,
              text: "Wrong answer, try again!"
            }}
          />
          {onTryAgain && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={onTryAgain}
                className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
              >
                Try Again
              </Button>
            </div>
          )}
        </>
      ) : (
        <DoorKeeper 
          isCorrect={isCorrect} 
          isSpeaking={isSpeaking} 
          question={question} 
        />
      )}
    </div>
  );
};

export default FeedbackCharacter;
