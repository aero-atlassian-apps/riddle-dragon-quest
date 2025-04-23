
import React, { useState, useEffect, useRef } from 'react';

interface DoorProps {
  doorNumber: number;
  isActive: boolean;
  isOpen: boolean;
  onDoorClick?: () => void;
}

const Door: React.FC<DoorProps> = ({ doorNumber, isActive, isOpen, onDoorClick }) => {
  const [animating, setAnimating] = useState(false);
  const [hovered, setHovered] = useState(false);
  const doorRef = useRef<HTMLDivElement>(null);
  
  // Play sound effects for different door states
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      // Play door opening sound
      const doorSound = new Audio('/door-open.mp3');
      doorSound.volume = 0.3;
      doorSound.play().catch(e => console.log('Audio play failed:', e));
      
      const timer = setTimeout(() => setAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Play hover sound when door is active and hovered
  useEffect(() => {
    if (hovered && isActive && !isOpen) {
      const hoverSound = new Audio('/door-hover.mp3');
      hoverSound.volume = 0.1;
      hoverSound.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [hovered, isActive, isOpen]);
  
  // Add particle effect when door opens
  useEffect(() => {
    if (isOpen && doorRef.current) {
      createDoorParticles();
    }
  }, [isOpen]);
  
  const createDoorParticles = () => {
    if (!doorRef.current) return;
    
    const doorElement = doorRef.current;
    const rect = doorElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full z-50';
      particle.style.width = `${Math.random() * 8 + 4}px`;
      particle.style.height = particle.style.width;
      particle.style.background = i % 2 === 0 ? '#F59E0B' : '#DC2626';
      particle.style.position = 'fixed';
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.opacity = '0.8';
      particle.style.pointerEvents = 'none';
      
      document.body.appendChild(particle);
      
      // Animate particle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const duration = Math.random() * 1000 + 1000;
      
      const animation = particle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8 },
        { 
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration,
        easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
      });
      
      animation.onfinish = () => {
        document.body.removeChild(particle);
      };
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
      ref={doorRef}
      className={`
        door relative cursor-pointer transition-all duration-700
        ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70'}
        ${isOpen ? 'door-open' : ''}
        ${hovered && isActive && !isOpen ? 'scale-115 shadow-2xl' : 'hover:shadow-xl'}
      `}
      onClick={onDoorClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dragon shadows around active door - enhanced with animation */}
      {isActive && !isOpen && (
        <div className="absolute -inset-6 z-0">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-8 h-16 bg-dragon-fire rounded-full blur-md animate-pulse"></div>
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-8 h-16 bg-dragon-fire rounded-full blur-md animate-pulse"></div>
          </div>
          {/* Magical glow effect around active door */}
          <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-dragon-gold/0 via-dragon-gold/20 to-dragon-gold/0 animate-pulse"></div>
          {/* Magical runes that appear when door is active */}
          <div className="absolute -inset-1 overflow-hidden opacity-0 transition-opacity duration-1000" 
               style={{ opacity: hovered ? 0.7 : 0 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-2 h-2 bg-dragon-gold rounded-full" 
                style={{
                  top: `${Math.sin(i / 8 * Math.PI * 2) * 100 + 50}%`,
                  left: `${Math.cos(i / 8 * Math.PI * 2) * 100 + 50}%`,
                  animation: `float ${1 + i % 3}s infinite ease-in-out ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Door structure - enhanced with subtle animations */}
      <div className={`w-36 h-56 bg-gradient-to-b from-amber-900 to-amber-800 border-4 border-amber-950 rounded-t-lg relative shadow-lg transition-all duration-300 ${hovered && isActive && !isOpen ? 'shadow-dragon-gold/30 shadow-lg' : ''}`}>
        {/* Door frame with GoT style patterns */}
        <div className="absolute inset-0 border-2 border-amber-700/30 rounded-t-lg">
          <div className="absolute inset-2 border border-amber-600/20 rounded-lg"></div>
          <div className="absolute inset-4 border border-amber-600/20 rounded-lg"></div>
        </div>
        
        {/* Door number in a medieval style - with glow effect */}
        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 bg-dragon-gold rounded-full h-10 w-10 flex items-center justify-center border-2 border-amber-900 shadow-inner transition-all duration-300 ${hovered && isActive && !isOpen ? 'animate-pulse-gold scale-110' : ''}`}>
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
      
      {/* Enhanced dragon's fire glow effect when door is open */}
      {isOpen && (
        <div className="absolute inset-0 bg-dragon-fire/20 rounded-t-lg z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-dragon-fire/40 to-dragon-gold/30 rounded-t-lg animate-pulse"></div>
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-12 bg-dragon-gold/60 rounded-full blur-sm"
                style={{
                  left: `${10 + i * 20}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  animation: `flame-flicker ${0.5 + i * 0.2}s infinite alternate ease-in-out ${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced dragon's presence effect with interactive hover */}
      {isActive && !isOpen && (
        <div className={`absolute -inset-4 bg-dragon-primary/5 rounded-lg animate-pulse transition-all duration-500 ${hovered ? 'bg-dragon-primary/15' : ''}`}>
          {/* Subtle magical particles that appear on hover */}
          {hovered && Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1.5 h-1.5 bg-dragon-gold/70 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${1 + Math.random() * 2}s infinite ease-in-out ${Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Enhanced open door fire effect with multiple flames */}
      {isOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="flame-animation">
            <div className="h-24 w-16 bg-gradient-to-t from-dragon-fire to-dragon-gold opacity-70 rounded-full blur-sm"></div>
            
            {/* Additional flame elements for more dynamic effect */}
            <div className="absolute top-1/4 left-1/4 h-16 w-10 bg-gradient-to-t from-dragon-fire to-dragon-gold/80 opacity-60 rounded-full blur-sm"
                 style={{ animation: 'flame-flicker 0.7s infinite alternate ease-in-out 0.1s' }}></div>
            <div className="absolute top-1/3 right-1/4 h-14 w-8 bg-gradient-to-t from-dragon-fire to-dragon-gold/80 opacity-50 rounded-full blur-sm"
                 style={{ animation: 'flame-flicker 0.6s infinite alternate ease-in-out 0.2s' }}></div>
                 
            {/* Sparks flying from the flames */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-dragon-gold rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${20 + i * 5}px)`,
                  animation: `float ${0.5 + i * 0.2}s infinite alternate ease-in-out ${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Door;
