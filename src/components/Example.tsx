import React, { useState } from 'react';

// Mock Question type for the preview
interface Question {
  text: string;
}

const DoorKeeperPreview = () => {
  const [isDefeated, setIsDefeated] = useState(false);
  const [animatingDefeat, setAnimatingDefeat] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Mock question
  const question = {
    text: "Answer my riddle or you shall not pass: What has keys but no locks, space but no room, and you can enter but not go in?"
  };
  
  const handleDefeat = () => {
    if (!isDefeated) {
      setAnimatingDefeat(true);
      setTimeout(() => {
        setIsDefeated(true);
        setAnimatingDefeat(false);
      }, 1000);
    }
  };
  
  const resetDoorKeeper = () => {
    setIsDefeated(false);
    setIsSpeaking(true);
    setIsCorrect(null);
  };
  
  const toggleCorrect = () => {
    setIsCorrect(current => current === false ? null : false);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-8">Door Keeper Preview</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mb-8">
        {/* Door Keeper Component */}
        <div className="relative w-full max-w-md mx-auto">
          <div className={`transition-all duration-1000 ${
            isDefeated ? 'door-keeper-defeated' : 
            animatingDefeat ? 'door-keeper-falling' : 
            'dragon-float'
          }`}>
            <svg 
              viewBox="0 0 240 180" 
              xmlns="http://www.w3.org/2000/svg"
              className={`w-full h-auto ${isDefeated ? 'opacity-50' : ''}`}
            >
              {/* Door Keeper Body - Armored, imposing figure */}
              <path d="M120 155c35 0 65-25 65-60s-30-55-65-55-65 25-65 55 30 60 65 60z" 
                    fill={isDefeated ? "#4B5563" : "#2A323C"} 
                    stroke="#1A1F2C" strokeWidth="3" />
              
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
              
              {/* Eyes glowing through helmet slits */}
              {!isDefeated && (
                <>
                  <rect x="108" y="82" width="8" height="2" 
                        fill={isCorrect === false ? "#ea384c" : "#60A5FA"} 
                        className={animatingDefeat ? "" : "animate-pulse"} />
                  <rect x="124" y="82" width="8" height="2" 
                        fill={isCorrect === false ? "#ea384c" : "#60A5FA"} 
                        className={animatingDefeat ? "" : "animate-pulse"} />
                </>
              )}
              
              {/* Defeated eyes (X shape) */}
              {isDefeated && (
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
              <path d="M155 90c10 0 20 10-20 20s-5 20-15 20c-15 0-20-10-20-25 0-10 5-15 15-15z" 
                    fill="#4B5563" stroke="#1A1F2C" strokeWidth="2" />
              
              {/* Sword/weapon - dropped when defeated */}
              {!isDefeated && (
                <>
                  <path d="M75 120l-30 30" stroke="#9CA3AF" strokeWidth="3" fill="none" />
                  <path d="M45 150l-5-5" stroke="#9CA3AF" strokeWidth="3" fill="none" />
                  <path d="M75 120c-2-2-5-2-7 0" stroke="#9CA3AF" strokeWidth="2" fill="none" />
                </>
              )}
              
              {/* Dropped sword when defeated */}
              {isDefeated && (
                <path d="M40 160l35-5" stroke="#9CA3AF" strokeWidth="3" fill="none"
                      className="origin-center rotate-45" />
              )}
              
              {/* Shield - dropped when defeated */}
              {!isDefeated && (
                <>
                  <path d="M165 120c10 0 20 5 25 15s0 20-10 25-20 0-25-10-0-30 10-30z" 
                        fill="#6B7280" stroke="#1A1F2C" strokeWidth="2" />
                  <path d="M165 125c5 0 10 2 12 7s0 10-5 12-10 0-12-5-0-14 5-14z" 
                        fill="#4B5563" stroke="#1A1F2C" strokeWidth="1" />
                </>
              )}
              
              {/* Dropped shield when defeated */}
              {isDefeated && (
                <path d="M170 160c10 0 20 0 20-10" 
                      fill="#6B7280" stroke="#1A1F2C" strokeWidth="2" />
              )}
              
              {/* Torch or flame effect when speaking */}
              {(isSpeaking || isCorrect === false) && !isDefeated && !animatingDefeat && (
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
          
          {/* Speech bubble when speaking with riddle */}
          {isSpeaking && question && !isDefeated && !animatingDefeat && (
            <div className="absolute top-0 right-4 transform -translate-y-full p-5 max-w-xs w-full">
              <div className="bg-black/90 rounded-lg border-2 border-emerald-400/50 p-4 relative shadow-lg backdrop-blur-sm">
                <div className="mb-3 text-center">
                  <p className="mt-3 text-emerald-300 font-mono text-sm leading-relaxed">{question.text}</p>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45">
                  <div className="w-4 h-4 bg-black border-r-2 border-b-2 border-emerald-400/50"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Defeat message */}
          {isDefeated && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full p-5">
              <div className="bg-black/90 rounded-lg border-2 border-red-400/50 p-4 relative shadow-lg backdrop-blur-sm">
                <p className="text-red-400 font-mono text-sm">GUARDIAN DEFEATED</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white mb-2">Controls</h2>
        
        {!isDefeated && !animatingDefeat && (
          <button 
            onClick={handleDefeat}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-lg transition-all hover:scale-105 focus:outline-none border-2 border-red-400"
          >
            Defeat Guardian
          </button>
        )}
        
        {isDefeated && (
          <button 
            onClick={resetDoorKeeper}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-lg transition-all hover:scale-105 focus:outline-none"
          >
            Reset Guardian
          </button>
        )}
        
        <button 
          onClick={() => setIsSpeaking(!isSpeaking)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow-lg transition-all hover:scale-105 focus:outline-none"
          disabled={isDefeated || animatingDefeat}
        >
          Toggle Speech Bubble
        </button>
        
        <button 
          onClick={toggleCorrect}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-md shadow-lg transition-all hover:scale-105 focus:outline-none"
          disabled={isDefeated || animatingDefeat}
        >
          Toggle Angry Eyes
        </button>
      </div>
      
      {/* Add CSS for animations */}
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
        
        .flame-animation {
          animation: flicker 0.5s infinite alternate;
        }
        
        @keyframes flicker {
          0% { opacity: 0.8; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .dragon-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default DoorKeeperPreview;