
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Score } from '@/types/game';

interface LeaderboardTableProps {
  scores: Score[];
  currentSessionId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ scores, currentSessionId }) => {
  // Sort scores descending by totalScore
  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);
  // Compute tie-aware ranks: equal scores share the same rank (competition ranking: 1,1,3)
  const ranks: number[] = [];
  sortedScores.forEach((entry, i) => {
    if (i === 0) {
      ranks.push(1);
    } else {
      const prevScore = sortedScores[i - 1]?.totalScore;
      ranks.push(prevScore === entry.totalScore ? ranks[i - 1] : i + 1);
    }
  });

  return (
    <div className="max-w-7xl mx-auto bg-[#1A1F2C]/80 border border-[#00FF00]/30 rounded-lg p-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[#00FF00]/30">
            <th className="px-4 py-3 text-left text-[#00FF00]/80">Rang</th>
            <th className="px-4 py-3 text-left text-[#00FF00]/80">Troupe</th>
            <th className="px-4 py-3 text-right text-[#00FF00]/80">Score</th>
          </tr>
        </thead>
        <tbody className="text-[#00FF00]">
          {sortedScores.map((score, index) => {
            const rank = ranks[index];
            const isCurrentSession = score.sessionId === currentSessionId;
            return (
              <tr key={score.roomId} className={cn("border-b border-[#00FF00]/20 transition-colors hover:bg-[#00FF00]/10", isCurrentSession && 'bg-[#00FF00]/5')}>
                <td className="px-4 py-4 text-left">
                  <div className="flex items-center">
                    {rank === 1 && (
                      <Trophy className="mr-2 text-[#FFD700] h-6 w-6 animate-pulse" />
                    )}
                    {rank === 2 && (
                      <Medal className="mr-2 text-[#C0C0C0] h-5 w-5" />
                    )}
                    {rank === 3 && (
                      <Award className="mr-2 text-[#CD7F32] h-5 w-5" />
                    )}
                    {rank > 3 && <span className="ml-1 w-5 inline-block text-center opacity-50">{rank}</span>}
                  </div>
                </td>
                <td className="px-4 py-4 text-left font-medium">
                  {score.roomName}
                </td>
                <td className={cn('px-4 py-4 text-right font-bold font-glitch flex items-center justify-end gap-4')}
                >
                  {score.totalScore}
                </td>
              </tr>
            );
          })}
          {scores.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-[#00FF00]/50">
                {currentSessionId
                  ? 'Aucun score disponible pour cette session_'
                  : 'Aucune session sélectionnée_'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
