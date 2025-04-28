
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
  doorNumber?: number;
}

const RiddleQuestion = ({ 
  question, 
  tokensLeft, 
  onSubmitAnswer, 
  onUseToken,
  isCorrect,
  doorNumber = 1
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

        @keyframes golden-key-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes key-glow {
          0%, 100% { filter: drop-shadow(0 0 5px #FFD700); }
          50% { filter: drop-shadow(0 0 20px #FFD700); }
        }

        @keyframes token-shine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3) drop-shadow(0 0 10px #FFD700); }
        }

        @keyframes token-flip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .animate-token-shine {
          animation: token-shine 2s ease-in-out infinite;
        }

        .token-used {
          animation: token-flip 1s ease-out forwards;
        }

        .golden-key-animation {
          animation: golden-key-float 3s ease-in-out infinite;
        }

        .golden-key-animation svg {
          animation: key-glow 2s ease-in-out infinite;
        }

        .key-bow, .key-teeth, .key-shaft {
          filter: drop-shadow(0 0 3px #B8860B);
        }

        .victory-text {
          animation: success-pulse 2s ease infinite;
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
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
        {isCorrect === true ? (
          <div className="text-center space-y-6">
            <div className="golden-key-animation">
              <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
                <path d="M35 50c0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15z"
                      className="key-bow" fill="#FFD700" />
                <path d="M65 50h25v-5h-5v-5h5v-5h-10v5h-5v-5h-5v15" className="key-teeth" fill="#FFD700" />
                <path d="M65 50h35" className="key-shaft" stroke="#FFD700" strokeWidth="5" fill="none" />
              </svg>
            </div>
            <div className="victory-text space-y-2">
              <p className="text-2xl font-medieval text-amber-400">Gardien Vaincu!</p>
              <p className="text-lg font-medieval text-emerald-400">Porte {doorNumber} Déverrouillée</p>
            </div>
          </div>
        ) : (
          <>
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
            
            <div className="flex items-center space-x-2 ml-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`relative w-8 h-8 transition-all duration-300 transform ${i < tokensLeft ? 'scale-100 cursor-pointer hover:scale-110' : 'scale-90 opacity-40'}`}
                  onClick={() => i < tokensLeft && !hintRevealed && isCorrect !== true && handleUseToken()}
                >
                  <div className={`absolute inset-0 ${i < tokensLeft ? 'animate-token-shine' : ''}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Token outer ring */}
                      <circle cx="50" cy="50" r="45" fill="#B8860B" className="token-border" />
                      {/* Token inner circle */}
                      <circle cx="50" cy="50" r="40" fill="#FFD700" className="token-face" />
                      {/* Decorative elements */}
                      <path d="M50 20v60M20 50h60" stroke="#B8860B" strokeWidth="4" />
                      <circle cx="50" cy="50" r="15" fill="#B8860B" />
                      <text x="50" y="55" textAnchor="middle" fill="#FFD700" fontSize="16" fontFamily="medieval">H</text>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
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
        </>
        )}
      </Card>
    </div>
  );
};

export default RiddleQuestion;
