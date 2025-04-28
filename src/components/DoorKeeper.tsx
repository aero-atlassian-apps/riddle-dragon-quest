import React from 'react';
import { Question } from '../types/game';

interface DoorKeeperProps {
  isCorrect: boolean | null;
  isSpeaking: boolean;
  question?: Question;
  isDefeated?: boolean;
}

const DoorKeeper: React.FC<DoorKeeperProps> = ({ isCorrect, isSpeaking, question, isDefeated = false }) => {
  const [animatingDefeat, setAnimatingDefeat] = React.useState(false);

  React.useEffect(() => {
    if (isDefeated) {
      setAnimatingDefeat(true);
      const timer = setTimeout(() => setAnimatingDefeat(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isDefeated]);
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={`
        ${!isDefeated ? 'dragon-float' : ''}
        ${isDefeated ? 'door-keeper-defeated' : ''}
        ${animatingDefeat ? 'door-keeper-falling' : ''}
        ${isCorrect === null ? 'dragon-neutral' : 'dragon-angry'}
      `}>
        <style jsx>{`
          .door-keeper-falling {
            animation: fall 1s forwards;
          }
          
          .door-keeper-defeated {
            transform: rotate(90deg) translateY(50px);
            opacity: 0.7;
          }
          
          @keyframes fall {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(90deg) translateY(50px); }
          }
        `}</style>
        <svg 
          viewBox="0 0 240 180" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Door Keeper Body - Armored, imposing figure */}
          <path d="M120 155c35 0 65-25 65-60s-30-55-65-55-65 25-65 55 30 60 65 60z" 
                fill={isDefeated ? "#4B5563" : "#2A323C"} stroke="#1A1F2C" strokeWidth="3" />
          
          {/* Armor plates and chainmail */}
          <path d="M95 100c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
          <path d="M95 110c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
          <path d="M95 120c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
          <path d="M95 130c-5 15 50 15 50 0" stroke="#4B5563" strokeWidth="3" fill="none" />
          
          {/* Helmet - Medieval style with face guard */}
          <path d="M120 60c-20 0-35 15-35 35 0 10 5 20 15 25 5 2 10 3 20 3s15-1 20-3c10-5 15-15 15-25 0-20-15-35-35-35z" 
                fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Helmet details - Eye slits and breathing holes */}
          <path d="M105 80h30" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M105 85h30" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M115 90h10" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          <path d="M115 95h10" stroke="#1A1F2C" strokeWidth="1.5" fill="none" />
          
          {/* Eyes based on state */}
          {!isDefeated ? (
            <>
              <rect x="108" y="82" width="8" height="2" fill={isCorrect === false ? "#ea384c" : "#60A5FA"} className="animate-pulse" />
              <rect x="124" y="82" width="8" height="2" fill={isCorrect === false ? "#ea384c" : "#60A5FA"} className="animate-pulse" />
            </>
          ) : (
            <>
              <path d="M106 80l12 4" stroke="#ea384c" strokeWidth="2" />
              <path d="M118 80l-12 4" stroke="#ea384c" strokeWidth="2" />
              <path d="M122 80l12 4" stroke="#ea384c" strokeWidth="2" />
              <path d="M134 80l-12 4" stroke="#ea384c" strokeWidth="2" />
            </>
          )}
          
          {/* Shoulder pauldrons */}
          <path d="M85 90c-10 0-20 10-20 20s5 20 15 20c15 0 20-10 20-25 0-10-5-15-15-15z" 
                fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
          <path d="M155 90c10 0 20 10 20 20s-5 20-15 20c-15 0-20-10-20-25 0-10 5-15 15-15z" 
                fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
          
          {/* Sword/weapon - normal or dropped */}
          {!isDefeated ? (
            <>
              <path d="M75 120l-30 30" stroke="#9CA3AF" strokeWidth="3" fill="none" />
              <path d="M45 150l-5-5" stroke="#9CA3AF" strokeWidth="3" fill="none" />
              <path d="M75 120c-2-2-5-2-7 0" stroke="#9CA3AF" strokeWidth="2" fill="none" />
            </>
          ) : (
            <path d="M40 160l35-5" stroke="#9CA3AF" strokeWidth="3" fill="none"
                  className="origin-center rotate-45" />
          )}
          
          {/* Shield - normal or dropped */}
          {!isDefeated ? (
            <>
              <path d="M165 120c10 0 20 5 25 15s0 20-10 25-20 0-25-10-0-30 10-30z" 
                    fill="#6B7280" stroke="#1A1F2C" strokeWidth="2" />
              <path d="M165 125c5 0 10 2 12 7s0 10-5 12-10 0-12-5-0-14 5-14z" 
                    fill="#4B5563" stroke="#1A1F2C" strokeWidth="1" />
            </>
          ) : (
            <path d="M170 160c10 0 20 0 20-10" 
                  fill="#6B7280" stroke="#1A1F2C" strokeWidth="2" />
          )}
          
          {/* Torch or flame effect when speaking */}
          {(isSpeaking || isCorrect === false) && (
            <g className="flame-animation">
              <path d="M90 70c-5-10 0-15 5-20 5 5 10 10 5 20 0 5-3 8-5 8s-5-3-5-8z" 
                    fill={isCorrect === false ? "#F59E0B" : "#DC2626"} stroke="#DC2626" strokeWidth="1.5" />
              <path d="M90 60c2 3 4 5 4 8 0 3-1 5-2 5s-2-2-2-5c0-3 0-5 0-8z" 
                    fill="#FBBF24" />
            </g>
          )}
          
          {/* Cape/cloak */}
          <path d="M85 100c-5 40 70 40 70 0" 
                fill="#1F2937" stroke="#1A1F2C" strokeWidth="2" />
          <path d="M90 110c0 30 60 30 60 0" 
                fill="#1F2937" stroke="#1A1F2C" strokeWidth="1.5" />

          {/* Defeat effects - cracks in armor */}
          {(isDefeated || animatingDefeat) && (
            <>
              <path d="M100 70l40 20" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M140 70l-40 20" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M110 120l20 10" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M130 120l-20 10" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <circle cx="120" cy="100" r="35" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
            </>
          )}
        </svg>
      </div>
      
      {/* Speech bubble when speaking with riddle - positioned to the right */}
      {isSpeaking && question && (
        <div className="speech-bubble absolute sm:top-1/2 sm:right-0 sm:transform sm:translate-x-full sm:-translate-y-1/2 p-5 max-w-xs w-full md:w-80 -top-16 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0">
          {/* On mobile, position above; on desktop, position to the right */}
          <div className="bg-black/90 rounded-lg border-2 border-emerald-400/50 p-4 relative shadow-lg backdrop-blur-sm">
            <div className="mb-3 text-center">
              <p className="mt-3 text-emerald-300 font-mono text-sm leading-relaxed">{question.text}</p>
            </div>
            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
              <svg width="15" height="30" viewBox="0 0 15 30">
                <polygon points="0,15 15,0 15,30" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoorKeeper;