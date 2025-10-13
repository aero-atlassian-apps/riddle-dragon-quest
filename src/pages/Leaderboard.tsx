
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Globe, Users } from "lucide-react";
import LeaderboardTable from "@/components/LeaderboardTable";
import UniverseLeaderboard from "@/components/UniverseLeaderboard";
import { Score } from "@/types/game";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
// Audio removed from Leaderboard page
import { getUniverses } from "@/utils/db";

const Leaderboard = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Audio controls removed

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => localStorage.getItem('leaderboard_session_id') || null);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  
  // Universe leaderboard state
  const [viewMode, setViewMode] = useState<'sessions' | 'universes'>(() => {
    const saved = localStorage.getItem('leaderboard_view_mode');
    return saved === 'universes' ? 'universes' : 'sessions';
  });
  const [currentUniverseId, setCurrentUniverseId] = useState<string | null>(() => localStorage.getItem('leaderboard_universe_id') || null);
  const [universes, setUniverses] = useState<{ id: string; name: string; status: string }[]>([]);
  
  // Audio reference removed
  
  // Get authenticated user
  const user = useUser();

  // Persist view mode and selections
  useEffect(() => {
    localStorage.setItem('leaderboard_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('leaderboard_session_id', currentSessionId);
    } else {
      localStorage.removeItem('leaderboard_session_id');
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (currentUniverseId) {
      localStorage.setItem('leaderboard_universe_id', currentUniverseId);
    } else {
      localStorage.removeItem('leaderboard_universe_id');
    }
  }, [currentUniverseId]);

  // Refresh nonce for UniverseLeaderboard to force re-fetch
  const [universeRefreshNonce, setUniverseRefreshNonce] = useState(0);
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name, status')
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      // Set sessions and handle currentSessionId
      if (data && data.length > 0) {
        setSessions(data);
        if (!currentSessionId || !data.find(session => session.id === currentSessionId)) {
          setCurrentSessionId(data[0].id);
        }
      } else {
        setSessions([]);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
      setCurrentSessionId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniverses = async () => {
    setIsLoading(true);
    try {
      const data = await getUniverses();
      const activeUniverses = data.filter(universe => universe.status === 'active');
      
      setUniverses(activeUniverses);
      if (activeUniverses.length > 0) {
        // Preserve saved selection if still valid, otherwise default to first active universe
        if (!currentUniverseId || !activeUniverses.find(u => u.id === currentUniverseId)) {
          setCurrentUniverseId(activeUniverses[0].id);
        }
      } else {
        setCurrentUniverseId(null);
      }
    } catch (error) {
      console.error('Error fetching universes:', error);
      setUniverses([]);
      setCurrentUniverseId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, session_id, score')
        .eq('session_id', currentSessionId)
        .order('score', { ascending: false });

      if (error) throw error;

      const formattedScores: Score[] = data.map(room => ({
        roomId: room.id,
        sessionId: room.session_id,
        totalScore: room.score || 0,
        roomName: room.name
      }));

      setScores(formattedScores);
      
      // Launch confetti for the winning team if score >= 500
      if (formattedScores.length > 0 && formattedScores[0].totalScore >= 500) {
        setTimeout(launchConfetti, 500);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (viewMode === 'sessions') {
      await fetchScores();
    } else {
      // Trigger a re-mount of UniverseLeaderboard to force data re-fetch
      setUniverseRefreshNonce((n) => n + 1);
      setIsRefreshing(false);
    }
  };
  
  // Audio control handlers removed

  useEffect(() => {
    if (viewMode === 'sessions') {
      fetchSessions();
    } else {
      fetchUniverses();
    }
    // Audio initialization removed
  }, [viewMode]);

  useEffect(() => {
    if (currentSessionId && viewMode === 'sessions') {
      fetchScores();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel('room_updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'rooms' }, 
          () => {
            fetchScores();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentSessionId, viewMode]);
  
  // Audio volume effect removed
  
  const launchConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Create confetti on both sides of the screen
      confetti({
        particleCount: Math.floor(randomInRange(40, 80)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.3), y: 0 },
        colors: ['#00FF00', '#00CC00', '#009900', '#006600', '#003300'],
      });
      
      confetti({
        particleCount: Math.floor(randomInRange(40, 80)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.7, 0.9), y: 0 },
        colors: ['#00FF00', '#00CC00', '#009900', '#006600', '#003300'],
      });
    }, 250);
  };
  
  return (
    <div className="min-h-screen p-4 bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat font-mono">
      <div className="max-w-7xl mx-auto relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {user && (
              <Link to="/" className="mr-4">
                <Button variant="ghost" size="sm" className="text-[#00FF00]/80 hover:text-[#00FF00] hover:bg-[#00FF00]/10 font-mono">
                  <ArrowLeft className="h-4 w-4 mr-1" /> retour
                </Button>
              </Link>
            )}
            
            <h1 className="text-3xl font-bold text-[#00FF00] animate-pulse">LE MUR DES LÉGENDES</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-[#1A1F2C] border border-[#00FF00]/30 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('sessions')}
                className={`font-mono border-0 rounded-none ${
                  viewMode === 'sessions' 
                    ? 'bg-[#00FF00]/20 text-[#00FF00] hover:bg-[#00FF00]/30' 
                    : 'text-[#00FF00]/80 hover:text-[#00FF00] hover:bg-[#00FF00]/10'
                }`}
              >
                <Users className="h-4 w-4 mr-1" />
                Sessions
              </Button>
              <Button
                variant={viewMode === 'universes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('universes')}
                className={`font-mono border-0 rounded-none ${
                  viewMode === 'universes' 
                    ? 'bg-[#00FF00]/20 text-[#00FF00] hover:bg-[#00FF00]/30' 
                    : 'text-[#00FF00]/80 hover:text-[#00FF00] hover:bg-[#00FF00]/10'
                }`}
              >
                <Globe className="h-4 w-4 mr-1" />
                Univers
              </Button>
            </div>

            {/* Session/Universe Selector */}
            {viewMode === 'sessions' ? (
              <select
                value={currentSessionId || ''}
                onChange={(e) => setCurrentSessionId(e.target.value)}
                className="bg-[#1A1F2C] text-[#00FF00] border border-[#00FF00]/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#00FF00]/60 hover:border-[#00FF00]/60 transition-colors"
              >
                <option value="">Choisir une session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={currentUniverseId || ''}
                onChange={(e) => setCurrentUniverseId(e.target.value)}
                className="bg-[#1A1F2C] text-[#00FF00] border border-[#00FF00]/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#00FF00]/60 hover:border-[#00FF00]/60 transition-colors"
              >
                <option value="">Choisir un univers</option>
                {universes.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[#00FF00]/80 hover:text-[#00FF00] hover:bg-[#00FF00]/10 font-mono"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            {/* Audio controls removed */}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
          </div>
        ) : viewMode === 'sessions' ? (
          <LeaderboardTable scores={scores} currentSessionId={currentSessionId || undefined} />
        ) : (
          currentUniverseId && (
            <UniverseLeaderboard 
              key={`ulb-${currentUniverseId}-${universeRefreshNonce}`}
              universeId={currentUniverseId} 
              universeName={universes.find(u => u.id === currentUniverseId)?.name}
            />
          )
        )}
        
        {/* Quitter button removed */}
      </div>
    </div>
  );
};

export default Leaderboard;
