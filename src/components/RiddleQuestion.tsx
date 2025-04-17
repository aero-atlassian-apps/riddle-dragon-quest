
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Question } from '../types/game';
import { Alert, AlertDescription } from './ui/alert';

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
  
  console.log("RiddleQuestion render:", { isCorrect, tokensLeft, questionId: question?.id });

  // Clear answer field when question changes
  useEffect(() => {
    setAnswer('');
    setHint('');
  }, [question]);

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
      <h3 className="text-xl font-medium text-center mb-4">Solve the Dragon's Riddle</h3>
      
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
          <span className="font-medium">Aid Tokens:</span>
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`inline-block h-6 w-6 rounded-full border ${
                  i < tokensLeft ? 'bg-dragon-gold border-dragon-scale' : 'bg-gray-200 border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {hint && (
          <div className="bg-dragon-accent/20 p-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">Hint:</p>
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
          Use Token for Hint ({tokensLeft} left)
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border-2 border-dragon-gold/50"
              disabled={isCorrect === true}
            />
          </div>
          
          {isCorrect !== null && (
            <Alert
              className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
            >
              <AlertDescription>
                {isCorrect ? 'Correct! The door is now unlocked!' : 'Incorrect. Try again or use a token for a hint.'}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-dragon-primary hover:bg-dragon-secondary"
            disabled={isCorrect === true || !answer.trim()}
          >
            Submit Answer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RiddleQuestion;
