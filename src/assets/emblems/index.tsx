// House emblems in SVG format for better visual quality and scalability

export const HouseEmblems = {
  stark: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 10 L70 30 L60 40 L65 50 L50 65 L35 50 L40 40 L30 30 Z"
        fill="currentColor"
        className="text-amber-600"
      />
      {/* Direwolf head simplified */}
      <path
        d="M45 35 Q50 30 55 35 L50 45 Z"
        fill="currentColor"
        className="text-amber-700"
      />
    </svg>
  ),
  
  lannister: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M30 20 Q50 10 70 20 Q80 30 80 50 Q80 70 60 80 Q50 85 40 80 Q20 70 20 50 Q20 30 30 20 Z"
        fill="currentColor"
        className="text-amber-600"
      />
      {/* Lion's mane */}
      <path
        d="M35 30 Q50 25 65 30 Q55 45 45 45 Q35 45 35 30 Z"
        fill="currentColor"
        className="text-amber-700"
      />
    </svg>
  ),
  
  targaryen: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M20 50 Q35 20 50 35 Q65 20 80 50 Q65 80 50 65 Q35 80 20 50 Z"
        fill="currentColor"
        className="text-amber-600"
      />
      {/* Dragon's wings */}
      <path
        d="M40 45 L30 35 L50 40 L70 35 L60 45 L50 50 Z"
        fill="currentColor"
        className="text-amber-700"
      />
    </svg>
  ),
  
  baratheon: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 20 L65 35 L60 50 L50 60 L40 50 L35 35 Z"
        fill="currentColor"
        className="text-amber-600"
      />
      {/* Stag's antlers */}
      <path
        d="M30 30 L50 25 L70 30 L60 40 L40 40 Z"
        fill="currentColor"
        className="text-amber-700"
      />
    </svg>
  ),
  
  greyjoy: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M30 30 Q50 20 70 30 Q80 40 70 60 Q50 70 30 60 Q20 40 30 30 Z"
        fill="currentColor"
        className="text-amber-600"
      />
      {/* Kraken tentacles */}
      <path
        d="M40 50 Q50 40 60 50 Q50 60 40 50 Z"
        fill="currentColor"
        className="text-amber-700"
      />
    </svg>
  )
};