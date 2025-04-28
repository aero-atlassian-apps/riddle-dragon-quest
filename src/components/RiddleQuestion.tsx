
import { useState } from "react";
import { Question } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, X } from "lucide-react";

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
  const [showImageModal, setShowImageModal] = useState(false);
  
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
    <div className="max-w-2xl mx-auto p-6 rounded-lg relative overflow-hidden">
      <style>
        {`
        @keyframes success-pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
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

        .terminal-input {
          background: #1a1a1a;
          border: 1px solid #10b981;
          color: #10b981;
          font-family: monospace;
          padding: 0.5rem;
          width: 100%;
          transition: all 0.3s ease;
        }

        .terminal-input:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        `}
      </style>
      
      <Card className={`bg-black/90 backdrop-blur-sm border-2 border-emerald-400/30 p-6 ${getCardAnimation()}`}>        
        {question.image && (
          <div className="mb-4 flex justify-center">
            <img 
              src={question.image} 
              alt="Image de l'énigme" 
              className="max-h-48 rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowImageModal(true)}
            />
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && question.image && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-[95vw] h-[90vh] bg-black/90 border-2 border-emerald-400/30 rounded-lg p-4 flex items-center justify-center">
              <Button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-2 -right-2 bg-black border border-emerald-400 text-emerald-400 rounded-full p-1 hover:bg-emerald-400/20"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={question.image}
                alt="Image de l'énigme (plein écran)"
                className="max-w-full max-h-full object-contain rounded-md"
              />
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex">
            <Input 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              placeholder="Entrez votre réponse..." 
              disabled={isCorrect === true || isSubmitting}
              className="terminal-input font-mono text-emerald-400 placeholder:text-emerald-700"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="ml-2 border-emerald-400 hover:bg-emerald-400/20 text-emerald-400"
                    onClick={handleUseToken}
                    disabled={tokensLeft <= 0 || hintRevealed || isCorrect === true}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border-emerald-400 text-emerald-400">
                  <p>Utiliser un jeton pour un indice - {tokensLeft} restant{tokensLeft > 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {hintRevealed && (
            <div className="text-sm text-emerald-400 font-mono p-2 bg-emerald-900/20 border border-emerald-400/30 rounded mt-4">
              <span className="font-bold text-emerald-300">INDICE:</span> La réponse commence par "{firstLetterHint}"
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button 
              type="submit" 
              className="bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 border border-emerald-400/50 font-mono"
              disabled={answer.trim() === '' || isCorrect === true || isSubmitting}
            >
              {isSubmitting ? '> Traitement...' : isCorrect === false ? '> Réessayer' : '> Soumettre la réponse'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RiddleQuestion;
