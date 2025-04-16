
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { format, intervalToDuration } from 'date-fns';

interface SessionTimerProps {
  startTime?: string;
  className?: string;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ startTime, className }) => {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  
  useEffect(() => {
    if (!startTime) {
      setElapsedTime("--:--:--");
      return;
    }
    
    const startDate = new Date(startTime);
    
    const updateTimer = () => {
      const now = new Date();
      const duration = intervalToDuration({
        start: startDate,
        end: now
      });
      
      const formatted = [
        String(duration.hours || 0).padStart(2, '0'),
        String(duration.minutes || 0).padStart(2, '0'),
        String(duration.seconds || 0).padStart(2, '0')
      ].join(':');
      
      setElapsedTime(formatted);
    };
    
    // Update immediately
    updateTimer();
    
    // Then update every second
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime]);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-dragon-gold" />
      <span className="font-medieval">{elapsedTime}</span>
    </div>
  );
};

export default SessionTimer;
