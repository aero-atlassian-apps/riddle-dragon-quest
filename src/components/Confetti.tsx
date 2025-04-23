
import React from 'react';

export const Confetti = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
  // This is a simple confetti component that can be enhanced with actual confetti animation libraries
  return <div ref={ref} className="confetti-container absolute inset-0 z-40 pointer-events-none" {...props} />;
});

Confetti.displayName = "Confetti";
