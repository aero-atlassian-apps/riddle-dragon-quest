import React from 'react';

interface GamesShieldProps {
  className?: string;
}

const GamesShield: React.FC<GamesShieldProps> = ({ className = '' }) => {
  return (
    <div className={`game-of-metrics-container ${className}`}>
      <svg
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-h-[400px] mx-auto"
      >
        {/* Define filters and gradients */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Fire gradient */}
          <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D6BCFA" />
          </linearGradient>
          
          {/* Metal gradient for swords */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d0d0d0" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#a0a0a0" />
          </linearGradient>
        </defs>
        
        {/* Shield with fire */}
        <g className="shield-emblem" transform="translate(400, 250)" filter="url(#glow)">
          {/* Shield */}
          <path 
            d="M0,-120 L120,-80 C120,0 120,80 0,120 C-120,80 -120,0 -120,-80 Z" 
            fill="#F59E0B" 
            stroke="#8B5CF6" 
            strokeWidth="4" 
          />
          
          {/* Inner shield design */}
          <path 
            d="M0,-100 L100,-65 C100,0 100,65 0,100 C-100,65 -100,0 -100,-65 Z" 
            fill="#FEF7CD" 
            stroke="#7E69AB" 
            strokeWidth="2" 
          />
          
          {/* Fire in the center */}
          <g className="fire">
            <path 
              d="M0,40 C10,20 20,0 15,-20 C25,0 35,-30 30,-40 C40,-10 50,-30 45,-50 C55,-30 60,-20 50,0 C70,-20 65,-10 60,10 C75,-5 70,20 55,30 C65,35 50,45 40,40 C45,50 30,55 20,45 C25,60 5,50 0,40 C-5,50 -25,60 -20,45 C-30,55 -45,50 -40,40 C-50,45 -65,35 -55,30 C-70,20 -75,-5 -60,10 C-65,-10 -70,-20 -50,0 C-60,-20 -55,-30 -45,-50 C-50,-30 -40,-10 -30,-40 C-35,-30 -25,0 -15,-20 C-20,0 -10,20 0,40 Z" 
              fill="url(#fireGradient)" 
            />
          </g>
        </g>
        
        {/* Game of Metrics Text - Positioned above the shield */}
        <g className="title-text" filter="url(#glow)">
          <text 
            x="400" 
            y="80" 
            textAnchor="middle" 
            className="font-medieval"
            fill="#00ff00"
            stroke="#003300"
            strokeWidth="1"
            fontSize="50"
            fontFamily="'Cinzel', serif"
          >
            GAME OF
          </text>
          <text 
            x="400" 
            y="140" 
            textAnchor="middle" 
            className="font-medieval"
            fill="#00ff00"
            stroke="#003300"
            strokeWidth="1"
            fontSize="70"
            fontFamily="'Cinzel', serif"
          >
            METRICS
          </text>
        </g>
      </svg>
    </div>
  );
};

export default GamesShield;