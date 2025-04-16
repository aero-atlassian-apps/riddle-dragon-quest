
import React, { useState, useEffect } from 'react';

interface DoorProps {
  doorNumber: number;
  isActive: boolean;
  isOpen: boolean;
  onDoorClick?: () => void;
}

const Door: React.FC<DoorProps> = ({ doorNumber, isActive, isOpen, onDoorClick }) => {
  const [animating, setAnimating] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div 
      className={`
        door relative cursor-pointer transition-all duration-500
        ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70'}
        ${isOpen ? 'door-open' : ''}
        hover:shadow-xl
      `}
      onClick={onDoorClick}
    >
      <div className="w-32 h-48 bg-amber-900 border-4 border-amber-950 rounded-t-lg relative">
        {/* Door frame with GoT style patterns */}
        <div className="absolute inset-0 border-2 border-amber-700/30 rounded-t-lg">
          <div className="absolute inset-2 border border-amber-600/20 rounded-lg"></div>
          <div className="absolute inset-4 border border-amber-600/20 rounded-lg"></div>
        </div>
        
        {/* Door number in a medieval style */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-dragon-gold rounded-full h-8 w-8 flex items-center justify-center border-2 border-amber-900">
          <span className="text-white font-bold">{doorNumber}</span>
        </div>
        
        {/* Dragon-themed door handle */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="h-6 w-6 bg-dragon-gold rounded-full border-2 border-amber-900 shadow-inner">
            <div className="h-full w-full bg-gradient-to-br from-amber-600 to-dragon-gold rounded-full"></div>
          </div>
        </div>
        
        {/* Door decorations */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-20">
          <div className="w-full h-full border-2 border-amber-700/70 rounded flex items-center justify-center">
            {/* Dragon symbol */}
            <div className="text-amber-700/50 text-2xl">≋</div>
          </div>
        </div>
        
        {/* Door status indicator */}
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 h-3 w-3 rounded-full 
                         ${isActive ? 'bg-dragon-fire animate-pulse' : 'bg-gray-500'}`}></div>
      </div>
      
      {/* Stone step */}
      <div className="w-36 h-4 bg-stone-800 mx-auto rounded-b-lg shadow-lg"></div>
      
      {/* Dragon's glow effect when door is open */}
      {isOpen && (
        <div className="absolute inset-0 bg-dragon-fire/20 rounded-t-lg animate-pulse"></div>
      )}
      
      {/* Dragon's presence effect */}
      {isActive && !isOpen && (
        <div className="absolute -inset-4 bg-dragon-primary/5 rounded-lg animate-pulse"></div>
      )}
    </div>
  );
};

export default Door;
