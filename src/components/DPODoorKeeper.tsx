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
          {/* Data Protection Officer Body - Imposing suit */}
          <path d="M120 155c40 0 70-25 70-60s-35-55-70-55-70 25-70 55 35 60 70 60z" 
                fill={isDefeated ? "#374151" : "#111827"} stroke="#000000" strokeWidth="4" />
          
          {/* Shoulder pads - authoritative presence */}
          <ellipse cx="85" cy="95" rx="15" ry="20" 
                   fill="#1F2937" stroke="#000000" strokeWidth="3" />
          <ellipse cx="155" cy="95" rx="15" ry="20" 
                   fill="#1F2937" stroke="#000000" strokeWidth="3" />
          
          {/* Suit jacket with sharp lapels */}
          <path d="M90 100c-5 15 60 15 60 0" stroke="#6B7280" strokeWidth="3" fill="none" />
          <path d="M90 110c-5 15 60 15 60 0" stroke="#6B7280" strokeWidth="3" fill="none" />
          <path d="M90 120c-5 15 60 15 60 0" stroke="#6B7280" strokeWidth="3" fill="none" />
          <path d="M90 130c-5 15 60 15 60 0" stroke="#6B7280" strokeWidth="3" fill="none" />
          
          {/* Shirt and tie */}
          <path d="M110 100v40" stroke="#F3F4F6" strokeWidth="8" fill="none" />
          <path d="M115 105v30" stroke="#DC2626" strokeWidth="4" fill="none" />
          
          {/* Head - Stern appearance */}
          <path d="M120 55c-25 0-35 20-35 35 0 15 10 25 35 25s35-10 35-25c0-15-10-35-35-35z" 
                fill={isDefeated ? "#D1D5DB" : "#F3F4F6"} stroke="#111827" strokeWidth="2" />
          
          {/* Hair - Receding, authoritative */}
          <path d="M95 65c0-10 15-15 25-10 10-5 25 0 25 10 0-5-10-10-25-5-15-5-25 0-25 5z" 
                fill="#374151" stroke="#1F2937" strokeWidth="1" />
          
          {/* Forehead wrinkles - stern expression */}
          <path d="M100 70h40" stroke="#9CA3AF" strokeWidth="1" fill="none" />
          <path d="M105 73h30" stroke="#9CA3AF" strokeWidth="1" fill="none" />
          
          {/* Eyes based on state - narrower, more intense */}
          {!isDefeated ? (
            <>
              <path d="M108 78l8-2" stroke={isCorrect === false ? "#ea384c" : "#1F2937"} strokeWidth="3" className="animate-pulse" />
              <path d="M124 76l8 2" stroke={isCorrect === false ? "#ea384c" : "#1F2937"} strokeWidth="3" className="animate-pulse" />
              <circle cx="112" cy="78" r="2" fill={isCorrect === false ? "#ea384c" : "#1F2937"} />
              <circle cx="128" cy="78" r="2" fill={isCorrect === false ? "#ea384c" : "#1F2937"} />
            </>
          ) : (
            <>
              <path d="M109 75l6 6" stroke="#ea384c" strokeWidth="2" />
              <path d="M115 75l-6 6" stroke="#ea384c" strokeWidth="2" />
              <path d="M125 75l6 6" stroke="#ea384c" strokeWidth="2" />
              <path d="M131 75l-6 6" stroke="#ea384c" strokeWidth="2" />
            </>
          )}
          
          {/* Glasses - Thicker, more imposing */}
          <rect x="104" y="74" width="16" height="8" stroke="#1F2937" strokeWidth="3" fill="none" rx="2" />
          <rect x="120" y="74" width="16" height="8" stroke="#1F2937" strokeWidth="3" fill="none" rx="2" />
          <path d="M120 78h0" stroke="#1F2937" strokeWidth="3" />
          
          {/* Nose - more prominent */}
          <path d="M120 82v6" stroke="#6B7280" strokeWidth="2" fill="none" />
          <path d="M118 88h4" stroke="#6B7280" strokeWidth="1" fill="none" />
          
          {/* Mouth - stern frown */}
          <path d="M110 92c10-3 20-3 20 0" stroke="#6B7280" strokeWidth="2" fill="none" />
          
          {/* Jaw line - more defined */}
          <path d="M100 95c20 5 40 5 40 0" stroke="#9CA3AF" strokeWidth="1" fill="none" />
          
          {/* Security Badge - more authoritative */}
          {!isDefeated ? (
            <>
              <rect x="68" y="112" width="18" height="24" 
                    fill="#DC2626" stroke="#991B1B" strokeWidth="2" rx="2" />
              <rect x="70" y="114" width="14" height="8" 
                    fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
              <text x="77" y="119" textAnchor="middle" fill="#92400E" fontSize="3" fontFamily="Arial" fontWeight="bold">⚠️</text>
              <text x="77" y="128" textAnchor="middle" fill="#F3F4F6" fontSize="3" fontFamily="Arial" fontWeight="bold">DPO</text>
              <text x="77" y="133" textAnchor="middle" fill="#F3F4F6" fontSize="2" fontFamily="Arial">SEC</text>
            </>
          ) : (
            <rect x="40" y="160" width="18" height="24" 
                  fill="#DC2626" stroke="#991B1B" strokeWidth="2" rx="2"
                  className="origin-center rotate-45" />
          )}
          
          {/* Official Security Clipboard - more imposing */}
          {!isDefeated ? (
            <>
              <rect x="158" y="108" width="24" height="35" 
                    fill="#1F2937" stroke="#111827" strokeWidth="3" rx="2" />
              <rect x="160" y="110" width="20" height="31" 
                    fill="#F3F4F6" stroke="#DC2626" strokeWidth="2" />
              <rect x="162" y="112" width="16" height="6" 
                    fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
              <text x="170" y="116" textAnchor="middle" fill="#F3F4F6" fontSize="2" fontFamily="Arial" fontWeight="bold">CLASSIFIED</text>
              <path d="M164 120h12" stroke="#DC2626" strokeWidth="2" />
              <path d="M164 123h12" stroke="#DC2626" strokeWidth="2" />
              <path d="M164 126h8" stroke="#374151" strokeWidth="1" />
              <path d="M164 129h10" stroke="#374151" strokeWidth="1" />
              <path d="M164 132h6" stroke="#374151" strokeWidth="1" />
              <text x="170" y="137" textAnchor="middle" fill="#DC2626" fontSize="2" fontFamily="Arial" fontWeight="bold">⚠️ CONFIDENTIAL</text>
            </>
          ) : (
            <rect x="170" y="160" width="24" height="35" 
                  fill="#1F2937" stroke="#111827" strokeWidth="3" rx="2" />
          )}
          
          {/* Data protection symbols when speaking */}
          {(isSpeaking || isCorrect === false) && (
            <g className="flame-animation">
              <circle cx="90" cy="70" r="8" 
                      fill={isCorrect === false ? "#F59E0B" : "#3B82F6"} stroke="#1E40AF" strokeWidth="1.5" />
              <path d="M86 70h8M90 66v8" stroke="#F3F4F6" strokeWidth="2" />
              <text x="90" y="74" textAnchor="middle" fill="#F3F4F6" fontSize="6" fontFamily="Arial">🔒</text>
            </g>
          )}
          
          {/* Professional jacket */}
          <path d="M85 100c-5 40 70 40 70 0" 
                fill="#374151" stroke="#111827" strokeWidth="2" />
          <path d="M90 110c0 30 60 30 60 0" 
                fill="#374151" stroke="#111827" strokeWidth="1.5" />
          
          {/* Suit buttons */}
          <circle cx="120" cy="115" r="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
          <circle cx="120" cy="125" r="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
          <circle cx="120" cy="135" r="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />

          {/* Defeat effects - data breach indicators */}
          {(isDefeated || animatingDefeat) && (
            <>
              <path d="M100 70l40 20" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M140 70l-40 20" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M110 120l20 10" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <path d="M130 120l-20 10" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <circle cx="120" cy="100" r="35" stroke="#EA384D" strokeWidth="1" fillOpacity="0" className="animate-pulse" />
              <text x="120" y="105" textAnchor="middle" fill="#EA384D" fontSize="8" fontFamily="Arial" className="animate-pulse">⚠️ BREACH</text>
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
              {/* Question text now displayed in speech bubble above door keeper */}
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