
import React from 'react';
import { Question } from '../types/game';

interface DragonProps {
  isAwake: boolean;
  isSpeaking: boolean;
  question?: Question;
}

const Dragon: React.FC<DragonProps> = ({ isAwake, isSpeaking, question }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={`dragon-float ${isAwake ? 'dragon-glow' : ''}`}>
        <svg 
          viewBox="0 0 240 180" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Dragon Body - More detailed GoT style */}
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
          
          {/* Dragon's Neck/Head - More GoT styled */}
          <path d="M90 75c-10-20 5-45 30-55 15-5 30 0 45 15 5 5 0 20-10 20-10 0-20-15-40-5-15 7-20 15-25 25z" 
                fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Dragon's Horns */}
          <path d="M95 40c-5-10-10-15-5-20s10 0 15 10-5 15-10 10z" 
                fill="#1A1F2C" stroke="#1A1F2C" strokeWidth="1" />
          <path d="M125 40c5-10 10-15 5-20s-10 0-15 10 5 15 10 10z" 
                fill="#1A1F2C" stroke="#1A1F2C" strokeWidth="1" />
          
          {/* Dragon's Eyes */}
          <circle cx="105" cy="55" r="5" fill={isAwake ? "#DC2626" : "#6B7280"} className="dragon-eyes" />
          <circle cx="135" cy="55" r="5" fill={isAwake ? "#DC2626" : "#6B7280"} className="dragon-eyes" />
          
          {/* Dragon's Wings - Larger, more bat-like GoT style */}
          <path d="M65 110c-25-15-50 0-50 25s25 30 50 20c15-5 15-35 0-45z" 
                fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
          <path d="M175 110c25-15 50 0 50 25s-25 30-50 20c-15-5-15-35 0-45z" 
                fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Wing details */}
          <path d="M35 130c10-10 30-20 30-20" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M40 145c15-10 35-25 35-25" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M205 130c-10-10-30-20-30-20" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M200 145c-15-10-35-25-35-25" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          
          {/* Dragon's Fire */}
          {isAwake && isSpeaking && (
            <g className="flame-animation">
              <path d="M120 35c0-15 8-25 15-30 7 5 15 15 15 30 0 8-7 15-15 15s-15-7-15-15z" 
                    fill="#F59E0B" stroke="#DC2626" strokeWidth="1.5" />
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
      </div>
      
      {/* Speech bubble when dragon is speaking - stylized more like a medieval scroll */}
      {isSpeaking && question && (
        <div className="speech-bubble absolute -top-16 left-1/2 transform -translate-x-1/2 p-5 max-w-xs w-full">
          <div className="parchment rounded-lg border-2 border-dragon-gold/50 p-4 relative shadow-lg">
            <div className="mb-3 text-center">
              <h3 className="text-xl font-bold text-dragon-scale font-medieval">Riddle me this:</h3>
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

export default Dragon;
