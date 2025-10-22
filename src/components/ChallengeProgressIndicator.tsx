import React from 'react';
import { cn } from '@/lib/utils';

export interface ChallengeProgress {
  challengeId: string;
  challengeName: string;
  status: 'not_started' | 'in_progress' | 'completed';
  challengeOrder?: number;
  createdAt?: string;
}

interface ChallengeProgressIndicatorProps {
  challenges: ChallengeProgress[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const ChallengeProgressIndicator: React.FC<ChallengeProgressIndicatorProps> = ({
  challenges,
  className,
  size = 'md',
  showTooltip = true
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getStatusColor = (status: ChallengeProgress['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-500 border-gray-400';
      case 'in_progress':
        return 'bg-blue-500 border-blue-400 animate-pulse';
      case 'completed':
        return 'bg-green-500 border-green-400';
      default:
        return 'bg-gray-500 border-gray-400';
    }
  };

  const getStatusText = (status: ChallengeProgress['status']) => {
    switch (status) {
      case 'not_started':
        return 'Non commencé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  };

  // Sort challenges by created_at if available, otherwise by challengeId
  const sortedChallenges = [...challenges].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return a.challengeId.localeCompare(b.challengeId);
  });

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {sortedChallenges.map((challenge, index) => (
        <div
          key={challenge.challengeId}
          className="relative group"
        >
          <div
            className={cn(
              'rounded-full border-2 transition-all duration-200',
              sizeClasses[size],
              getStatusColor(challenge.status),
              'hover:scale-110 cursor-help'
            )}
          />
          
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="font-medium">{challenge.challengeName}</div>
              <div className="text-gray-300">{getStatusText(challenge.status)}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      ))}
      
      {sortedChallenges.length === 0 && (
        <span className="text-gray-400 text-xs font-mono">Aucun challenge</span>
      )}
    </div>
  );
};

export default ChallengeProgressIndicator;