
import { useState } from "react";
import { Question } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface RiddleQuestionProps {
  question: Question;
  tokensLeft: number;
  onSubmitAnswer: (answer: string) => void;
  onUseToken: () => void;
  isCorrect: boolean | null;
}

const RiddleQuestion = ({ 
  question, 
  tokensLeft, 
  onSubmitAnswer, 
  onUseToken,
  isCorrect
}: RiddleQuestionProps) => {
  const [answer, setAnswer] = useState("");
  const [hintRevealed, setHintRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extract first letter of the answer as a hint
  const firstLetterHint = question.answer ? question.answer.charAt(0).toUpperCase() : "";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.trim()) {
      console.log("Submitting answer:", answer.trim());
      setIsSubmitting(true);
      onSubmitAnswer(answer.trim());
      
      // Reset submission state after a delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };
  
  const handleUseToken = () => {
    setHintRevealed(true);
    onUseToken();
  };
  
  // Animation classes for correct/incorrect answers
  const getCardAnimation = () => {
    if (isCorrect === true) {
      return "animate-success-pulse";
    } else if (isCorrect === false) {
      return "animate-error-shake";
    }
    return "";
  };
  
  return (
    <div className="max-w-2xl mx-auto parchment p-6 rounded-lg relative overflow-hidden">
      <style>
        {`
        @keyframes success-pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
        }
        
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        
        .animate-success-pulse {
          animation: success-pulse 2s ease infinite;
        }
        
        .animate-error-shake {
          animation: error-shake 0.6s ease;
        }
        `}
      </style>
      
      <Card className={`border-2 border-dragon-accent/20 p-6 ${getCardAnimation()}`}>
        <h3 className="text-lg sm:text-xl font-medieval mb-4 text-center">The Dragon's Riddle</h3>
        
        {question.image && (
          <div className="mb-4 flex justify-center">
            <img 
              src={question.image} 
              alt="Riddle image" 
              className="max-h-48 rounded-md border border-gray-300"
            />
          </div>
        )}
        
        <p className="mb-6 text-base sm:text-lg font-medieval text-center">{question.text}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex">
            <Input 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              placeholder="Your answer..." 
              disabled={isCorrect === true || isSubmitting}
              className="font-medieval"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                    onClick={handleUseToken}
                    disabled={tokensLeft <= 0 || hintRevealed || isCorrect === true}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use a token for a hint ({tokensLeft} left)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {hintRevealed && (
            <div className="text-sm text-dragon-primary italic p-2 bg-dragon-gold/10 rounded">
              <span className="font-bold">Hint:</span> The answer starts with the letter "{firstLetterHint}"
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {tokensLeft} {tokensLeft === 1 ? 'token' : 'tokens'} remaining
            </div>
            
            <Button 
              type="submit" 
              className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
              disabled={answer.trim() === '' || isCorrect === true || isSubmitting}
            >
              {isSubmitting ? 'Checking...' : isCorrect === false ? 'Try Again' : 'Submit Answer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RiddleQuestion;
