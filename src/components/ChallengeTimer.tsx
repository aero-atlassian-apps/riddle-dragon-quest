
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { format, intervalToDuration } from 'date-fns';

interface ChallengeTimerProps {
  startTime?: string;
  endTime?: string;
  className?: string;
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({ startTime, endTime, className }) => {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  
  useEffect(() => {
    if (!startTime) {
      setElapsedTime("--:--:--");
      return;
    }
    
    const startDate = new Date(startTime);
    
    const updateTimer = () => {
      // If endTime is provided, use it as the end point instead of current time
      const endDate = endTime ? new Date(endTime) : new Date();
      const duration = intervalToDuration({
        start: startDate,
        end: endDate
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
    
    // If endTime is provided, don't set up interval (timer is stopped)
    if (endTime) {
      return;
    }
    
    // Then update every second only if timer is still running
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime, endTime]);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className={`h-4 w-4 ${endTime ? 'text-red-400' : 'text-green-400'}`} />
      <span className={`font-mono ${endTime ? 'text-red-400' : 'text-green-400'}`}>{elapsedTime}</span>
      {endTime && <span className="text-xs text-red-400 ml-1"></span>}
    </div>
  );
};

export default ChallengeTimer;
