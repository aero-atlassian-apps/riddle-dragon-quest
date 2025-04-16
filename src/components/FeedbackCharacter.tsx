import React, { useEffect, useState } from 'react';
import { Question } from '../types/game';

interface FeedbackCharacterProps {
  isCorrect: boolean | null;
  isSpeaking: boolean;
  question?: Question;
}

const FeedbackCharacter: React.FC<FeedbackCharacterProps> = ({ isCorrect, isSpeaking, question }) => {
  const [character, setCharacter] = useState<'dragon' | 'calisy' | null>(null);

  useEffect(() => {
    if (isCorrect === true) {
      setCharacter('calisy');
    } else if (isCorrect === false) {
      setCharacter('dragon');
    } else {
      setCharacter(null);
    }
  }, [isCorrect]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={`dragon-float ${isCorrect === null ? 'dragon-neutral' : isCorrect ? 'dragon-friendly' : 'dragon-angry'}`}>
        {character === 'calisy' || (isCorrect === true && character !== 'dragon') ? (
          <svg 
            viewBox="0 0 240 180" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto animate-fade-in"
          >
            <path d="M120 155c35 0 65-25 65-55s-30-55-65-55-65 25-65 55 30 55 65 55z" 
                  fill="#FFDEE2" stroke="#EA384C" strokeWidth="2" />
            
            <path d="M95 80c5 15 50 15 50 0" stroke="#1A1F2C" strokeWidth="2" fill="none" />
            
            <path d="M110 115c5 10 15 10 20 0" stroke="#EA384C" strokeWidth="3" fill="none" className="animate-pulse" />
            
            <circle cx="105" cy="85" r="6" fill="#1A1F2C" />
            <circle cx="135" cy="85" r="6" fill="#1A1F2C" />
            
            <circle cx="102" cy="82" r="2" fill="white" />
            <circle cx="132" cy="82" r="2" fill="white" />
            
            <path d="M85 65c10-15 70-15 70 0" stroke="#F59E0B" strokeWidth="4" fill="none" />
            <path d="M90 65l10 -15M110 65l5 -20M130 65l5 -20M150 65l10 -15" 
                  stroke="#F59E0B" strokeWidth="4" fill="none" />
            
            <path d="M70 120c-10-5-15 5-10 10s15 0 10-10z" fill="#8B5CF6" stroke="#1A1F2C" />
            <path d="M170 120c10-5 15 5 10 10s-15 0-10-10z" fill="#9b87f5" stroke="#1A1F2C" />
          </svg>
        ) : (
          <svg 
            viewBox="0 0 240 180" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto animate-fade-in"
          >
            <path d="M120 155c35 0 65-25 65-60s-30-55-65-55-65 25-65 55 30 60 65 60z" 
                  fill="#2A323C" stroke="#1A1F2C" strokeWidth="3" />
            
            <path d="M95 100c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
            <path d="M95 110c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
            <path d="M95 120c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
            <path d="M95 130c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
            
            <path d="M120 60c-20 0-35 15-35 35 0 10 5 20 15 25 5 2 10 3 20 3s15-1 20-3c10-5 15-15 15-25 0-20-15-35-35-35z" 
                  fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
            
            <path d="M105 80h30" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M105 85h30" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M115 90h10" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M115 95h10" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            
            <rect x="108" y="82" width="8" height="2" fill={isCorrect === false ? "#ea384c" : "#60A5FA"} className="animate-pulse" />
            <rect x="124" y="82" width="8" height="2" fill={isCorrect === false ? "#ea384c" : "#60A5FA"} className="animate-pulse" />
            
            <path d="M85 90c-10 0-20 10-20 20s5 20 15 20c15 0 20-10 20-25 0-10-5-15-15-15z" 
                  fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M155 90c10 0 20 10 20 20s-5 20-15 20c-15 0-20-10-20-25 0-10 5-15 15-15z" 
                  fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
            
            <path d="M75 120l-30 30" stroke="#9CA3AF" strokeWidth="3" fill="none" />
            <path d="M45 150l-5-5" stroke="#9CA3AF" strokeWidth="3" fill="none" />
            <path d="M75 120c-2-2-5-2-7 0" stroke="#9CA3AF" strokeWidth="2" fill="none" />
            
            <path d="M165 120c10 0 20 5 25 15s0 20-10 25-20 0-25-10-0-30 10-30z" 
                  fill="#6B7280" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M165 125c5 0 10 2 12 7s0 10-5 12-10 0-12-5-0-14 5-14z" 
                  fill="#4B5563" stroke="#1A1F2C" strokeWidth="1" />
            
            {(isSpeaking || isCorrect === false) && (
              <g className="flame-animation">
                <path d="M90 70c-5-10 0-15 5-20 5 5 10 10 5 20 0 5-3 8-5 8s-5-3-5-8z" 
                      fill={isCorrect === false ? "#F59E0B" : "#DC2626"} stroke="#DC2626" strokeWidth="1.5" />
                <path d="M90 60c2 3 4 5 4 8 0 3-1 5-2 5s-2-2-2-5c0-3 0-5 0-8z" 
                      fill="#FBBF24" />
              </g>
            )}
            
            <path d="M85 100c-5 40 70 40 70 0" 
                  fill="#1F2937" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M90 110c0 30 60 30 60 0" 
                  fill="#1F2937" stroke="#1A1F2C" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      
      {isSpeaking && question && (
        <div className="speech-bubble absolute -top-16 left-1/2 transform -translate-x-1/2 p-5 max-w-xs w-full">
          <div className="parchment rounded-lg border-2 border-dragon-gold/50 p-4 relative shadow-lg">
            <div className="mb-3 text-center">
              <h3 className="text-xl font-bold text-dragon-scale font-medieval">
                {isCorrect === null ? "Riddle me this:" : 
                 isCorrect === true ? "Well done, brave one!" : "Wrong! Try again!"}
              </h3>
              <p className="mt-3 text-dragon-scale font-serif italic">{question.text}</p>
            </div>
            {question.image && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={`/images/${question.image}`} 
                  alt="Riddle hint" 
                  className="max-h-32 rounded-md border-2 border-dragon-gold/30 shadow-lg"
                />
              </div>
            )}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <svg width="30" height="15" viewBox="0 0 30 15">
                <polygon points="15,15 0,0 30,0" fill="#FEF7CD" stroke="#F59E0B" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackCharacter;
