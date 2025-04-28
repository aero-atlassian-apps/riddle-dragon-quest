
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
    <div className="max-w-3xl mx-auto bg-[#1A1F2C]/80 border border-[#00FF00]/30 rounded-lg p-6 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#00FF00] animate-pulse">Avantage stratégique</h2>
      
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
            {sortedScores.map((score, index) => {
              const isCurrentSession = score.sessionId === currentSessionId;
              
              return (
                <tr 
                  key={score.roomId} 
                  className={`border-b border-[#00FF00]/20 transition-colors ${
                    isCurrentSession ? 'bg-[#00FF00]/5' : ''
                  } hover:bg-[#00FF00]/10 ${index === 0 ? 'relative' : ''}`}
                >
                  <td className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy 
                          className="mr-2 text-[#FFD700] h-6 w-6 animate-pulse shadow-glow-gold" 
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                          }}
                        />
                      )}
                      {index === 1 && (
                        <Medal 
                          className="mr-2 text-[#C0C0C0] h-5 w-5 shadow-glow-silver" 
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(192, 192, 192, 0.5))'
                          }}
                        />
                      )}
                      {index === 2 && (
                        <Award 
                          className="mr-2 text-[#CD7F32] h-5 w-5 shadow-glow-bronze" 
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(205, 127, 50, 0.5))'
                          }}
                        />
                      )}
                      {index > 2 && <span className="ml-1 w-5 inline-block text-center opacity-50">{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-left font-medium">
                    <span className="text-[#00FF00]">{score.roomName}</span>
                    {isCurrentSession && (
                      <span className="ml-2 text-xs bg-[#00FF00]/10 border border-[#00FF00]/30 px-2 py-1 rounded-full animate-pulse">
                        Actuel
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold font-glitch">
                    {score.totalScore}
                  </td>
                </tr>
              );
            })}
            
            {scores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[#00FF00]/50">
                  Aucun score disponible pour le moment_
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
