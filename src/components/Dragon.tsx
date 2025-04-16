
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
          viewBox="0 0 200 160" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Dragon Body */}
          <path d="M100 140c30 0 60-20 60-50s-30-50-60-50-60 20-60 50 30 50 60 50z" 
                fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="3" />
          
          {/* Dragon's Neck/Head */}
          <path d="M80 70c-5-20 0-40 20-50 10-5 25-5 40 10 5 5 0 15-10 15-10 0-15-10-30-5-10 5-15 15-15 20z" 
                fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Dragon's Eyes */}
          <circle cx="95" cy="45" r="5" fill={isAwake ? "#DC2626" : "#6B7280"} className="dragon-eyes" />
          <circle cx="115" cy="45" r="5" fill={isAwake ? "#DC2626" : "#6B7280"} className="dragon-eyes" />
          
          {/* Dragon's Wings */}
          <path d="M60 100c-20-10-40 0-40 20s20 25 40 15c10-5 10-30 0-35z" 
                fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
          <path d="M140 100c20-10 40 0 40 20s-20 25-40 15c-10-5-10-30 0-35z" 
                fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Dragon's Fire */}
          {isAwake && isSpeaking && (
            <g className="flame-animation">
              <path d="M105 30c0-10 5-15 10-20 5 5 10 10 10 20 0 5-5 10-10 10s-10-5-10-10z" 
                    fill="#F59E0B" stroke="#DC2626" strokeWidth="1" />
              <path d="M110 15c2 3 5 5 5 10 0 3-2 5-5 5s-5-2-5-5c0-5 3-7 5-10z" 
                    fill="#DC2626" />
            </g>
          )}
          
          {/* Dragon's Tail */}
          <path d="M100 140c-10 10-20 15-30 5s0-30 10-20c5 5 10 10 20 15z" 
                fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Speech bubble when dragon is speaking */}
      {isSpeaking && question && (
        <div className="speech-bubble parchment absolute -top-12 left-1/2 transform -translate-x-1/2 p-4 max-w-xs w-full">
          <div className="mb-3 text-center">
            <h3 className="text-xl font-bold text-dragon-scale">Riddle me this:</h3>
            <p className="mt-2 text-dragon-scale">{question.text}</p>
          </div>
          {question.image && (
            <div className="mt-3 flex justify-center">
              <img 
                src={`/images/${question.image}`} 
                alt="Riddle hint" 
                className="max-h-32 rounded-md border-2 border-dragon-gold/30 shadow-lg"
              />
            </div>
          )}
          <div className="speech-bubble-arrow absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <svg width="20" height="10" viewBox="0 0 30 15">
              <polygon points="15,15 0,0 30,0" fill="#FEF7CD" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dragon;
