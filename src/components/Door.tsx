
import React, { useState, useEffect, useRef } from 'react';
import { HouseEmblems } from '@/assets/emblems';

interface DoorProps {
  doorNumber: number;
  isActive: boolean;
  isOpen: boolean;
  onDoorClick?: () => void;
  sessionStatus?: string;
}

const Door: React.FC<DoorProps> = ({ doorNumber, isActive, isOpen, onDoorClick, sessionStatus }) => {
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

  // Get house-specific emblem and styles
  const getHouseStyles = () => {
    switch(doorNumber) {
      case 1: return { emblem: HouseEmblems.stark, name: 'Stark', color: 'from-gray-700 to-gray-800' };
      case 2: return { emblem: HouseEmblems.lannister, name: 'Lannister', color: 'from-red-700 to-red-900' };
      case 3: return { emblem: HouseEmblems.targaryen, name: 'Targaryen', color: 'from-red-600 to-black' };
      case 4: return { emblem: HouseEmblems.baratheon, name: 'Baratheon', color: 'from-yellow-700 to-yellow-900' };
      case 5: return { emblem: HouseEmblems.greyjoy, name: 'Greyjoy', color: 'from-blue-700 to-blue-900' };
      default: return { emblem: null, name: 'Unknown', color: 'from-stone-700 to-stone-800' };
    }
  };

  const { emblem, name, color } = getHouseStyles();

  return (
    <div className="relative">
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
            absolute top-0 left-3 cursor-pointer transition-all duration-700
            origin-left
            ${isActive ? 'z-10' : 'opacity-70 z-10'}
            ${isOpen ? 'transform rotate-y-70 translate-x-3' : ''}
            ${hovered && isActive && !isOpen ? 'shadow-2xl' : 'hover:shadow-xl'}
          `}
          onClick={() => {
            if (sessionStatus === 'active' && isActive && !isOpen) {
              onDoorClick?.();
            }
          }}
          onMouseEnter={() => {
            if (sessionStatus === 'active' && isActive && !isOpen) {
              setHovered(true);
            }
          }}
          onMouseLeave={() => setHovered(false)}
          style={{
            transform: isOpen ? 'perspective(800px) rotateY(-70deg)' : 'perspective(800px) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            width: 'calc(100% - 6px)',
          }}
        >
          {/* Castle Door Structure */}
          <div className={`w-full h-52 bg-gradient-to-b ${color} border-4 border-stone-900 rounded-t-lg relative shadow-lg transition-all duration-300 ${hovered && isActive && !isOpen ? 'shadow-amber-600/30 shadow-lg' : ''}`}>              
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
              <span className="text-amber-200 font-bold font-medieval">{doorNumber}</span>
            </div>
            
            {/* Castle door handles - Large iron ring */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="h-10 w-10 rounded-full border-4 border-gray-700 shadow-inner">
                <div className="h-2 w-4 bg-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded"></div>
              </div>
            </div>
            
            {/* Door emblem - House crest */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-24">
              <div className="w-full h-full border-2 border-gray-700/70 rounded flex flex-col items-center justify-center bg-stone-700/30 p-2">
                <div className="w-12 h-12">{emblem}</div>
                <div className="text-amber-600 text-sm font-medieval mt-2">{name}</div>
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
        
        {/* Door spacing and alignment */}
        <div className="absolute inset-0 z-0"></div>
      </div>
      

    </div>
  );
};

export default Door;
