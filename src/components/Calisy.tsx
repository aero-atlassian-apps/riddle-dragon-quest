
import React, { useEffect } from 'react';
import { Question } from '../types/game';

interface CalisyProps {
  isSpeaking: boolean;
  question?: Question;
}

const Calisy: React.FC<CalisyProps> = ({ isSpeaking, question }) => {
  console.log("Calisy render:", { isSpeaking, questionText: question?.text });
  
  // Add an effect to log when Calisy appears
  useEffect(() => {
    console.log("Calisy mounted with speaking:", isSpeaking);
    return () => console.log("Calisy unmounted");
  }, [isSpeaking]);
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="dragon-float dragon-friendly">
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
      </div>
      
      {/* Speech bubble when speaking with riddle - positioned to the right */}
      {isSpeaking && question && (
        <div className="speech-bubble absolute sm:top-1/2 sm:right-0 sm:transform sm:translate-x-full sm:-translate-y-1/2 p-5 max-w-xs w-full md:w-80 -top-16 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0">
          {/* On mobile, position above; on desktop, position to the right */}
          <div className="parchment rounded-lg border-2 border-dragon-gold/50 p-4 relative shadow-lg">
            <div className="mb-3 text-center">
              <h3 className="text-xl font-bold text-dragon-scale font-medieval">
                Well done, brave one!
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
            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
              <svg width="15" height="30" viewBox="0 0 15 30">
                <polygon points="0,15 15,0 15,30" fill="#FEF7CD" stroke="#F59E0B" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calisy;
