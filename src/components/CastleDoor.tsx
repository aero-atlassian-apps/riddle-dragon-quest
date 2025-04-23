import React, { useState, useRef } from 'react';

const CastleDoorPreview = () => {
  const [isActive, setIsActive] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const doorRef = useRef(null);
  
  const doorNumber = 1;
  
  // Door emblem symbol for castle theme
  const getDoorEmblem = () => {
    return "⚜"; // Fleur-de-lis castle emblem
  };

  const toggleDoor = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-8">
      <h2 className="text-2xl text-amber-200 mb-6 font-bold">Castle Door Preview</h2>
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setIsActive(true)} 
          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700">
          Activate Door
        </button>
        <button 
          onClick={() => setIsActive(false)} 
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
          Deactivate Door
        </button>
        <button 
          onClick={toggleDoor} 
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500">
          Toggle Open/Close
        </button>
      </div>
      
      <div className="w-full flex justify-center mt-8 relative">
        {/* Door Frame and Archway - This stays in place */}
        <div className="relative w-48 h-60">
          {/* Stone arch frame */}
          <div className="absolute -top-4 -left-6 w-60 h-12 bg-stone-600 rounded-t-full z-0"></div>
          
          {/* Side pillars of the door frame */}
          <div className="absolute left-0 top-0 w-3 h-56 bg-stone-600 z-10"></div>
          <div className="absolute right-0 top-0 w-3 h-56 bg-stone-600 z-10"></div>
          
          {/* Doorway interior (visible when door is open) */}
          <div className="absolute inset-3 bottom-0 bg-gray-950 z-5">
            {/* Torchlight visible when door is open */}
            {isOpen && (
              <div className="absolute inset-0 z-6">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="h-20 w-14 bg-gradient-to-t from-amber-600 to-amber-300 opacity-50 rounded-full blur-md"></div>
                </div>
                
                {/* Torch flame particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-1 h-1 bg-amber-300 rounded-full"
                    style={{
                      top: `${30 + Math.random() * 40}%`,
                      left: `${30 + Math.random() * 40}%`,
                      opacity: 0.6 + Math.random() * 0.4,
                      animation: `float ${0.8 + Math.random()}s infinite alternate ease-in-out ${Math.random() * 0.5}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Stone base - castle foundation */}
          <div className="absolute bottom-0 w-48 h-8 bg-stone-700 mx-auto rounded-b-lg shadow-lg z-20">
            {/* Stone texture */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute h-2 bg-stone-600 rounded"
                  style={{
                    width: `${10 + Math.random() * 20}px`,
                    top: `${Math.random() * 6}px`,
                    left: `${i * 18}px`,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* The actual door */}
          <div 
            ref={doorRef}
            className={`
              absolute top-0 left-3 w-42 h-52 cursor-pointer transition-all duration-700
              origin-left
              ${isActive ? 'z-10' : 'opacity-70 z-10'}
              ${isOpen ? 'transform rotate-y-70 translate-x-3' : ''}
              ${hovered && isActive && !isOpen ? 'shadow-2xl' : 'hover:shadow-xl'}
            `}
            onClick={toggleDoor}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              transform: isOpen ? 'perspective(800px) rotateY(-70deg)' : 'perspective(800px) rotateY(0deg)',
              transformStyle: 'preserve-3d',
              width: 'calc(100% - 6px)',
            }}
          >
            {/* Castle Door Structure */}
            <div className={`w-full h-full bg-gradient-to-b from-stone-700 to-stone-800 border-4 border-stone-900 rounded-t-lg relative shadow-lg transition-all duration-300 ${hovered && isActive && !isOpen ? 'shadow-amber-600/30 shadow-lg' : ''}`}>              
              {/* Door frame with castle patterns */}
              <div className="absolute inset-0 border-2 border-stone-600/50 rounded-t-lg">
                <div className="absolute inset-2 border border-stone-500/20 rounded-lg"></div>
                <div className="absolute inset-4 border border-stone-500/20 rounded-lg"></div>
              </div>
              
              {/* Iron reinforcements */}
              <div className="absolute top-0 w-full h-2 bg-gray-800"></div>
              <div className="absolute top-1/4 w-full h-2 bg-gray-800"></div>
              <div className="absolute top-2/4 w-full h-2 bg-gray-800"></div>
              <div className="absolute top-3/4 w-full h-2 bg-gray-800"></div>
              <div className="absolute bottom-0 w-full h-2 bg-gray-800"></div>
              
              {/* Vertical reinforcements */}
              <div className="absolute top-0 left-1/4 w-2 h-full bg-gray-800"></div>
              <div className="absolute top-0 right-1/4 w-2 h-full bg-gray-800"></div>
              
              {/* Door number in castle style shield */}
              <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 bg-amber-700 h-12 w-10 flex items-center justify-center border-2 border-gray-800 shadow-inner transition-all duration-300 ${hovered && isActive && !isOpen ? 'animate-pulse scale-110' : ''}`}
                   style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)'}}>
                <span className="text-amber-200 font-bold">{doorNumber}</span>
              </div>
              
              {/* Castle door handles - Large iron ring */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="h-10 w-10 rounded-full border-4 border-gray-700 shadow-inner">
                  <div className="h-2 w-4 bg-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded"></div>
                </div>
              </div>
              
              {/* Door emblem - Castle crest */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-24">
                <div className="w-full h-full border-2 border-gray-700/70 rounded flex items-center justify-center bg-stone-700/30">
                  <div className="text-amber-600 text-4xl">{getDoorEmblem()}</div>
                </div>
              </div>
              
              {/* Bolts and rivets */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-gray-600 rounded-full"
                  style={{
                    top: `${10 + Math.floor(i/4) * 30}%`,
                    left: `${10 + (i%4) * 30}%`,
                  }}
                />
              ))}
              
              {/* Door status indicator */}
              <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 h-3 w-3 rounded-full
                             ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-gray-500'}`}></div>
            </div>
          </div>
          
          {/* Castle ambiance effects */}
          {isActive && (
            <div className="absolute -inset-6 z-0">
              {!isOpen && (
                <>
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-20">
                    <div className="w-8 h-16 bg-blue-400 rounded-full blur-md animate-pulse"></div>
                  </div>
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-20">
                    <div className="w-8 h-16 bg-blue-400 rounded-full blur-md animate-pulse"></div>
                  </div>
                </>
              )}
              <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-amber-600/0 via-amber-600/20 to-amber-600/0 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-amber-200 text-center">
        <p>Click the door to open/close or use the buttons above</p>
        <p className="text-sm mt-2">{isActive ? "Door is active" : "Door is inactive"} • {isOpen ? "Door is open" : "Door is closed"}</p>
      </div>
    </div>
  );
};

export default CastleDoorPreview;