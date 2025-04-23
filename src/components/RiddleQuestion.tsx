
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Question } from '../types/game';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

interface RiddleQuestionProps {
  question: Question;
  tokensLeft: number;
  onSubmitAnswer: (answer: string) => void;
  onUseToken: () => void;
  isCorrect: boolean | null;
}

const RiddleQuestion: React.FC<RiddleQuestionProps> = ({
  question,
  tokensLeft,
  onSubmitAnswer,
  onUseToken,
  isCorrect,
}) => {
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonColor, setButtonColor] = useState('bg-dragon-primary');
  const [inputDisabled, setInputDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  console.log("RiddleQuestion render:", { isCorrect, tokensLeft, questionId: question?.id });
  
  // Clear answer field when question changes
  useEffect(() => {
    setAnswer('');
    setHint('');
    setButtonColor('bg-dragon-primary');
    setInputDisabled(false);
    setIsAnimating(false);
  }, [question]);
  
  // Play wrong answer sound effect
  const playWrongSound = () => {
    const wrongSound = new Audio();
    wrongSound.src = 'data:audio/wav;base64,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','audio/wav';
    wrongSound.volume = 0.5;
    wrongSound.play().catch(e => console.error('Error playing sound:', e));
  };
  
  // Effect to handle wrong answer animation
  useEffect(() => {
    if (isCorrect === false) {
      setButtonColor('bg-red-500');
      setInputDisabled(true);
      setIsAnimating(true);
      playWrongSound();
      
      // Shake the form
      if (formRef.current) {
        formRef.current.classList.add('shake-animation');
      }
      
      // Reset after animation completes
      setTimeout(() => {
        setButtonColor('bg-dragon-primary');
        setInputDisabled(false);
        setIsAnimating(false);
        if (formRef.current) {
          formRef.current.classList.remove('shake-animation');
        }
      }, 1000);
    }
  }, [isCorrect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      console.log("Submitting answer:", answer);
      onSubmitAnswer(answer);
    }
  };

  const generateHint = () => {
    if (tokensLeft <= 0) return;
    
    onUseToken();
    
    // Simple hint logic: reveal part of the answer
    const correctAnswer = question.answer;
    const revealedLength = Math.floor(correctAnswer.length / 3);
    
    setHint(`The answer starts with: ${correctAnswer.substring(0, revealedLength)}...`);
  };

  return (
    <div className="parchment max-w-md mx-auto p-6">
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <h3 className="text-xl font-medium text-center mb-4">Résoudre l'Énigme du Dragon</h3>
      
      {/* Question text is now only displayed in the speech bubble */}
      <div className="mb-6">
        {question.image && (
          <div className="mt-4 flex justify-center">
            <img 
              src={question.image} 
              alt="Riddle hint" 
              className="max-h-48 rounded-md border border-dragon-gold/30"
            />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-2 justify-between">
          <span className="font-medium">Jetons d'Aide:</span>
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="inline-block h-6 w-6">
                {i < tokensLeft ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                    <ellipse cx="12" cy="16" rx="6" ry="2" fill="#FFF8DC" opacity="0.5" />
                    <circle cx="12" cy="12" r="6" fill="#FFECB3" opacity="0.7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="2" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>
        
        {hint && (
          <div className="bg-dragon-accent/20 p-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">Indice:</p>
            <p>{hint}</p>
          </div>
        )}
        
        <Button
          type="button"
          variant="outline"
          onClick={generateHint}
          disabled={tokensLeft <= 0 || isCorrect === true}
          className="w-full text-dragon-scale border-dragon-primary hover:bg-dragon-accent/20 mb-4"
        >
          Utiliser un Jeton pour un Indice ({tokensLeft} restant)
        </Button>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit} className={isAnimating ? 'shake-animation' : ''}>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Entrez votre réponse..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={cn("border-2", {
                "border-dragon-gold/50": !isAnimating,
                "border-red-500": isAnimating
              })}
              disabled={isCorrect === true || inputDisabled}
            />
          </div>
          
          {isCorrect !== null && (
            <Alert
              className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
            >
              <AlertDescription>
                {isCorrect ? 'Correct ! La porte est maintenant déverrouillée !' : 'Incorrect. Essayez à nouveau ou utilisez un jeton pour un indice.'}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className={`w-full ${buttonColor} hover:bg-dragon-secondary transition-colors duration-300`}
            disabled={isCorrect === true || !answer.trim() || inputDisabled}
          >
            Soumettre la Réponse
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RiddleQuestion;
