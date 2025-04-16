
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
        door relative cursor-pointer transition-all duration-300
        ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70'}
        ${isOpen ? 'door-open' : ''}
      `}
      onClick={onDoorClick}
    >
      <div className="w-32 h-48 bg-amber-800 border-4 border-amber-950 rounded-t-lg relative">
        {/* Door frame */}
        <div className="absolute inset-0 border-2 border-amber-700/30 rounded-t-lg" />
        
        {/* Door number */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-dragon-gold rounded-full h-8 w-8 flex items-center justify-center">
          <span className="text-white font-bold">{doorNumber}</span>
        </div>
        
        {/* Door handle */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-gray-500 rounded-full border border-gray-600"></div>
        
        {/* Door decorations */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-20">
          <div className="w-full h-full border-2 border-amber-700/70 rounded"></div>
        </div>
        
        {/* Door status */}
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 h-3 w-3 rounded-full 
                         ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
      </div>
      
      {/* Door step */}
      <div className="w-36 h-4 bg-stone-700 mx-auto"></div>
      
      {/* Dragon behind door (shown when door is open) */}
      {isOpen && (
        <div className="absolute top-10 left-0 transform -translate-x-40 dragon-glow">
          <div className="h-16 w-16 bg-dragon-primary rounded-full flex items-center justify-center">
            <div className="h-8 w-8 bg-dragon-fire rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Door;
