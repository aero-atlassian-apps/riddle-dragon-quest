
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from "lucide-react";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Score } from "@/types/game";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { createAudio, AUDIO_PATHS } from "@/utils/audioUtils";

const Leaderboard = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume at 30%

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  
  // Audio reference for leaderboard background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get authenticated user
  const user = useUser();

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
    await fetchScores();
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  useEffect(() => {
    fetchSessions();
    
    // Initialize audio element with better error handling
    createAudio(AUDIO_PATHS.GAME_LEADERBOARD, { volume, loop: true, preload: true })
      .then(audio => {
        if (audio) {
          audioRef.current = audio;
          audio.play().catch(error => {
            console.warn('Leaderboard audio autoplay was prevented:', error);
          });
        }
      })
      .catch(error => {
        console.warn('Leaderboard audio initialization failed:', error);
      });
    
    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentSessionId) {
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
  }, [currentSessionId]);
  
  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
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
      <div className="max-w-4xl mx-auto relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
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
            
            {/* Audio controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-[#00FF00]/80 hover:text-[#00FF00] hover:bg-[#00FF00]/10 font-mono"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-[#00FF00] bg-[#1A1F2C] h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
            <Skeleton className="h-12 w-full bg-[#00FF00]/5" />
          </div>
        ) : (
          <LeaderboardTable scores={scores} currentSessionId={currentSessionId || undefined} />
        )}
        
        <div className="mt-12 text-center">
          <Link to="/">
            <Button className="bg-[#00FF00]/20 hover:bg-[#00FF00]/30 text-[#00FF00] border border-[#00FF00]/50 transition-all hover:shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono">quitter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
