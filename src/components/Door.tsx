
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

  // GoT inspired door designs based on door number
  const getDoorDesign = () => {
    switch(doorNumber) {
      case 1: return "House Stark";
      case 2: return "House Lannister";
      case 3: return "House Targaryen";
      case 4: return "House Baratheon";
      case 5: return "House Greyjoy";
      case 6: return "House Tyrell";
      default: return "Iron Throne";
    }
  };

  // Door emblem symbol based on house
  const getDoorEmblem = () => {
    switch(doorNumber) {
      case 1: return "❄"; // Direwolf/Winter (Stark)
      case 2: return "♜"; // Lion (Lannister)
      case 3: return "☽"; // Dragon (Targaryen)
      case 4: return "♞"; // Stag (Baratheon)
      case 5: return "≈"; // Kraken (Greyjoy)
      case 6: return "✿"; // Rose (Tyrell)
      default: return "⚔"; // Swords
    }
  };

  return (
    <div 
      className={`
        door relative cursor-pointer transition-all duration-700
        ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70'}
        ${isOpen ? 'door-open' : ''}
        hover:shadow-xl
      `}
      onClick={onDoorClick}
    >
      {/* Dragon shadows around active door */}
      {isActive && !isOpen && (
        <div className="absolute -inset-6 z-0">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-8 h-16 bg-dragon-fire rounded-full blur-md animate-pulse"></div>
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-8 h-16 bg-dragon-fire rounded-full blur-md animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Door structure */}
      <div className="w-36 h-56 bg-gradient-to-b from-amber-900 to-amber-800 border-4 border-amber-950 rounded-t-lg relative shadow-lg">
        {/* Door frame with GoT style patterns */}
        <div className="absolute inset-0 border-2 border-amber-700/30 rounded-t-lg">
          <div className="absolute inset-2 border border-amber-600/20 rounded-lg"></div>
          <div className="absolute inset-4 border border-amber-600/20 rounded-lg"></div>
          
          {/* Door house name */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-amber-600/80 text-[9px] font-medieval">
            {getDoorDesign()}
          </div>
        </div>
        
        {/* Door number in a medieval style */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-dragon-gold rounded-full h-10 w-10 flex items-center justify-center border-2 border-amber-900 shadow-inner">
          <span className="text-white font-bold font-medieval">{doorNumber}</span>
        </div>
        
        {/* Dragon-themed door handles */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-8 w-6 bg-dragon-gold rounded-full border-2 border-amber-900 shadow-inner">
            <div className="h-full w-full bg-gradient-to-br from-amber-600 to-dragon-gold rounded-full"></div>
          </div>
        </div>
        
        {/* Door decorations - House emblem */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-24">
          <div className="w-full h-full border-2 border-amber-700/70 rounded flex items-center justify-center">
            {/* House emblem symbol */}
            <div className="text-amber-600 text-4xl font-medieval">{getDoorEmblem()}</div>
          </div>
        </div>
        
        {/* Metal reinforcements */}
        <div className="absolute top-1/4 w-full h-1 bg-amber-700/50"></div>
        <div className="absolute top-3/4 w-full h-1 bg-amber-700/50"></div>
        
        {/* Door status indicator */}
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 h-3 w-3 rounded-full 
                         ${isActive ? 'bg-dragon-fire animate-pulse' : 'bg-gray-500'}`}></div>
      </div>
      
      {/* Stone step */}
      <div className="w-44 h-5 bg-stone-800 mx-auto rounded-b-lg shadow-lg"></div>
      
      {/* Dragon's fire glow effect when door is open */}
      {isOpen && (
        <div className="absolute inset-0 bg-dragon-fire/20 rounded-t-lg animate-pulse z-10"></div>
      )}
      
      {/* Dragon's presence effect */}
      {isActive && !isOpen && (
        <div className="absolute -inset-4 bg-dragon-primary/5 rounded-lg animate-pulse"></div>
      )}
      
      {/* Open door fire effect */}
      {isOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="flame-animation">
            <div className="h-24 w-16 bg-gradient-to-t from-dragon-fire to-dragon-gold opacity-70 rounded-full blur-sm"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Door;
