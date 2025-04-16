
import React from 'react';
import { Score } from '../types/game';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTableProps {
  scores: Score[];
  currentSessionId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ scores, currentSessionId }) => {
  // Sort scores by total score (highest first)
  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="parchment max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-dragon-scale">Leaderboard</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-dragon-gold/30">
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Room</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedScores.map((score, index) => {
              const isCurrentSession = score.sessionId === currentSessionId;
              
              return (
                <tr 
                  key={score.roomId} 
                  className={`border-b border-dragon-gold/20 ${
                    isCurrentSession ? 'bg-dragon-accent/10' : ''
                  } ${index === 0 ? 'relative' : ''}`}
                >
                  <td className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      {index === 0 && <Trophy className="mr-1 text-dragon-gold trophy-shine h-6 w-6" />}
                      {index === 1 && <Medal className="mr-1 text-gray-400 h-5 w-5" />}
                      {index === 2 && <Award className="mr-1 text-amber-700 h-5 w-5" />}
                      {index > 2 && <span className="ml-1 w-5 inline-block text-center">{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-left font-medium">
                    {score.roomName}
                    {isCurrentSession && <span className="ml-2 text-xs bg-dragon-accent/30 px-2 py-1 rounded-full">Current</span>}
                  </td>
                  <td className="px-4 py-4 text-right font-bold">
                    {score.totalScore}
                  </td>
                </tr>
              );
            })}
            
            {scores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No scores available yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* First place celebration effect */}
      {scores.length > 0 && (
        <div id="confetti-container" className="absolute top-0 left-0 w-full h-full pointer-events-none"></div>
      )}
    </div>
  );
};

export default LeaderboardTable;
