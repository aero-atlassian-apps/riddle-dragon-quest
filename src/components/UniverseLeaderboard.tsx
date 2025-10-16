import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { getUniverseLeaderboard } from '@/utils/db';
import { Skeleton } from '@/components/ui/skeleton';

interface UniverseLeaderboardEntry {
  id: string;
  universe_id: string;
  room_name: string;
  total_score: number;
  completion_time: string;
  challenges_completed: number;
  last_updated: string;
}

interface UniverseLeaderboardProps {
  universeId: string;
  universeName?: string;
  limit?: number;
}

const UniverseLeaderboard: React.FC<UniverseLeaderboardProps> = ({ 
  universeId, 
  universeName = "Univers", 
  limit = 1000 
}) => {
  const [leaderboard, setLeaderboard] = useState<UniverseLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getUniverseLeaderboard(universeId, limit);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching universe leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (universeId) {
      fetchLeaderboard();
    }
  }, [universeId, limit]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-[#1A1F2C]/80 border border-[#00FF00]/30 rounded-lg p-6 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="space-y-4 relative z-10">
          <Skeleton className="h-8 w-64 bg-[#00FF00]/5 mx-auto" />
          <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
          <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
          <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
        </div>
      </div>
    );
  }

  // Compute tie-aware ranks: equal scores share the same rank (competition ranking: 1,1,3)
  const ranks: number[] = [];
  leaderboard.forEach((entry, i) => {
    if (i === 0) {
      ranks.push(1);
    } else {
      const prevScore = leaderboard[i - 1]?.total_score;
      ranks.push(prevScore === entry.total_score ? ranks[i - 1] : i + 1);
    }
  });

  return (
    <div className="max-w-7xl mx-auto bg-[#1A1F2C]/80 border border-[#00FF00]/30 rounded-lg p-6 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#00FF00] animate-pulse">Avantage stratégique - {universeName}</h2>
      
      <div className="overflow-x-auto relative z-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#00FF00]/30">
              <th className="px-4 py-3 text-left text-[#00FF00]/80">Rang</th>
              <th className="px-4 py-3 text-left text-[#00FF00]/80">Troupe</th>
              <th className="px-4 py-3 text-right text-[#00FF00]/80">Score</th>
            </tr>
          </thead>
          <tbody className="text-[#00FF00]">
            {leaderboard.map((entry, index) => {
              const rank = ranks[index];
              return (
                <tr 
                  key={entry.id} 
                  className={`border-b border-[#00FF00]/20 transition-colors hover:bg-[#00FF00]/10 ${index === 0 ? 'relative' : ''}`}
                >
                  <td className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      {rank === 1 && (
                        <Trophy 
                          className="mr-2 text-[#FFD700] h-6 w-6 animate-pulse shadow-glow-gold" 
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                          }}
                        />
                      )}
                      {rank === 2 && (
                        <Medal 
                          className="mr-2 text-[#C0C0C0] h-5 w-5 shadow-glow-silver" 
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(192, 192, 192, 0.5))'
                          }}
                        />
                      )}
                      {rank === 3 && (
                        <Award 
                          className="mr-2 text-[#CD7F32] h-5 w-5 shadow-glow-bronze" 
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(205, 127, 50, 0.5))'
                          }}
                        />
                      )}
                      {rank > 3 && <span className="ml-1 w-5 inline-block text-center opacity-50">{rank}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-left font-medium">
                    <span className="text-[#00FF00]">{entry.room_name}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold font-glitch flex items-center justify-end gap-4">
                    {entry.total_score}
                  </td>
                </tr>
              );
            })}
            
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[#00FF00]/50">
                  Aucun score disponible pour cet univers_
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* First place celebration effect */}
      {leaderboard.length > 0 && (
        <div id="confetti-container" className="absolute top-0 left-0 w-full h-full pointer-events-none"></div>
      )}
    </div>
  );
};

export default UniverseLeaderboard;