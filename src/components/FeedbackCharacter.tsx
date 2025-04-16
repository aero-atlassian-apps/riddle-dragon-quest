
import React from 'react';
import { Question } from '../types/game';

interface FeedbackCharacterProps {
  isCorrect: boolean | null;
  isSpeaking: boolean;
  question?: Question;
}

const FeedbackCharacter: React.FC<FeedbackCharacterProps> = ({ isCorrect, isSpeaking, question }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Dragon or Calisy based on answer correctness */}
      <div className={`dragon-float ${isCorrect === null ? 'dragon-neutral' : isCorrect ? 'dragon-friendly' : 'dragon-angry'}`}>
        {isCorrect === true ? (
          // Calisy (Mother of Dragons) - Friendly character with a smile for correct answer
          <svg 
            viewBox="0 0 240 180" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Calisy figure */}
            <path d="M120 155c35 0 65-25 65-55s-30-55-65-55-65 25-65 55 30 55 65 55z" 
                  fill="#FFDEE2" stroke="#EA384C" strokeWidth="2" />
            
            {/* Calisy's features */}
            <path d="M95 80c5 15 50 15 50 0" stroke="#1A1F2C" strokeWidth="2" fill="none" />
            
            {/* Calisy's smile */}
            <path d="M110 115c5 10 15 10 20 0" stroke="#EA384C" strokeWidth="3" fill="none" className="animate-pulse" />
            
            {/* Calisy's eyes - wide and friendly */}
            <circle cx="105" cy="85" r="6" fill="#1A1F2C" />
            <circle cx="135" cy="85" r="6" fill="#1A1F2C" />
            
            {/* Calisy's highlights (eye shine) */}
            <circle cx="102" cy="82" r="2" fill="white" />
            <circle cx="132" cy="82" r="2" fill="white" />
            
            {/* Calisy's crown - Mother of Dragons */}
            <path d="M85 65c10-15 70-15 70 0" stroke="#F59E0B" strokeWidth="4" fill="none" />
            <path d="M90 65l10 -15M110 65l5 -20M130 65l5 -20M150 65l10 -15" 
                  stroke="#F59E0B" strokeWidth="4" fill="none" />
            
            {/* Baby dragons around Calisy */}
            <path d="M70 120c-10-5-15 5-10 10s15 0 10-10z" fill="#8B5CF6" stroke="#1A1F2C" />
            <path d="M170 120c10-5 15 5 10 10s-15 0-10-10z" fill="#9b87f5" stroke="#1A1F2C" />
          </svg>
        ) : (
          // Fierce Dragon with red eyes for wrong answer or neutral state
          <svg 
            viewBox="0 0 240 180" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Dragon Body - More detailed, fierce-looking */}
            <path d="M120 155c35 0 65-25 65-60s-30-55-65-55-65 25-65 55 30 60 65 60z" 
                  fill="#7E69AB" stroke="#1A1F2C" strokeWidth="3" />
            <path d="M95 135c-15 5-30 0-35-10s5-25 20-30 30 0 35 10-5 25-20 30z" 
                  fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M145 135c15 5 30 0 35-10s-5-25-20-30-30 0-35 10 5 25 20 30z" 
                  fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
            
            {/* Dragon's Scales */}
            <path d="M100 120c5 15 35 15 40 0" stroke="#1A1F2C" strokeWidth="2" fill="none" />
            <path d="M100 130c5 15 35 15 40 0" stroke="#1A1F2C" strokeWidth="2" fill="none" />
            <path d="M110 140c5 10 15 10 20 0" stroke="#1A1F2C" strokeWidth="2" fill="none" />
            
            {/* Dragon's Neck/Head - More fierce-looking */}
            <path d="M90 75c-10-20 5-45 30-55 15-5 30 0 45 15 5 5 0 20-10 20-10 0-20-15-40-5-15 7-20 15-25 25z" 
                  fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
            
            {/* Dragon's Horns - Larger and sharper */}
            <path d="M95 40c-5-10-15-20-5-25s15 5 15 15-5 15-10 10z" 
                  fill="#1A1F2C" stroke="#1A1F2C" strokeWidth="1" />
            <path d="M125 40c5-10 15-20 5-25s-15 5-15 15 5 15 10 10z" 
                  fill="#1A1F2C" stroke="#1A1F2C" strokeWidth="1" />
            
            {/* Dragon's Eyes - Red and glowing for wrong answer, normal otherwise */}
            <circle cx="105" cy="55" r="6" fill={isCorrect === false ? "#ea384c" : "#6B7280"} className="dragon-eyes animate-pulse" />
            <circle cx="135" cy="55" r="6" fill={isCorrect === false ? "#ea384c" : "#6B7280"} className="dragon-eyes animate-pulse" />
            
            {/* Dragon's Wings - Larger, more menacing */}
            <path d="M65 110c-25-15-50 0-50 25s25 30 50 20c15-5 15-35 0-45z" 
                  fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M175 110c25-15 50 0 50 25s-25 30-50 20c-15-5-15-35 0-45z" 
                  fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
            
            {/* Wing details */}
            <path d="M35 130c10-10 30-20 30-20" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M40 145c15-10 35-25 35-25" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M205 130c-10-10-30-20-30-20" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            <path d="M200 145c-15-10-35-25-35-25" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
            
            {/* Dragon's Fire - More intense for wrong answer */}
            {(isSpeaking || isCorrect === false) && (
              <g className="flame-animation">
                <path d="M120 35c0-15 8-25 15-30 7 5 15 15 15 30 0 8-7 15-15 15s-15-7-15-15z" 
                      fill={isCorrect === false ? "#F59E0B" : "#DC2626"} stroke="#DC2626" strokeWidth="1.5" />
                <path d="M127 15c3 5 8 10 8 15 0 5-3 8-8 8s-8-3-8-8c0-5 5-10 8-15z" 
                      fill="#DC2626" />
                <path d="M127 15c2 3 4 7 4 10 0 3-2 5-4 5s-4-2-4-5c0-3 2-7 4-10z" 
                      fill="#FBBF24" />
              </g>
            )}
            
            {/* Dragon's Tail */}
            <path d="M120 155c-15 15-30 20-45 5s-5-40 15-25c10 7 15 15 30 20z" 
                  fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
            <path d="M90 135c-10 10-20 20-10 25s20-15 10-25z" 
                  fill="#7E69AB" stroke="#1A1F2C" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      
      {/* Speech bubble when speaking with riddle */}
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
                  src={question.image} 
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
