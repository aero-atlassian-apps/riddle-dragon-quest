
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Score } from "@/types/game";
import confetti from "canvas-confetti";

// Mock data for demonstration purposes
const mockScores: Score[] = [
  { roomId: "room1", sessionId: "session1", totalScore: 580, roomName: "Team Alpha" },
  { roomId: "room2", sessionId: "session1", totalScore: 490, roomName: "Team Beta" },
  { roomId: "room3", sessionId: "session1", totalScore: 520, roomName: "Team Gamma" },
  { roomId: "room4", sessionId: "session2", totalScore: 600, roomName: "Team Delta" },
  { roomId: "room5", sessionId: "session2", totalScore: 430, roomName: "Team Epsilon" },
];

const Leaderboard = () => {
  const [scores, setScores] = useState<Score[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    setScores(mockScores);
    
    // Launch confetti for the winning team
    if (mockScores.length > 0) {
      const highestScore = [...mockScores].sort((a, b) => b.totalScore - a.totalScore)[0];
      
      if (highestScore.totalScore >= 500) {
        setTimeout(() => {
          launchConfetti();
        }, 500);
      }
    }
  }, []);
  
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
        colors: ['#8B5CF6', '#D6BCFA', '#F59E0B', '#DC2626', '#1A1F2C'],
      });
      
      confetti({
        particleCount: Math.floor(randomInRange(40, 80)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.7, 0.9), y: 0 },
        colors: ['#8B5CF6', '#D6BCFA', '#F59E0B', '#DC2626', '#1A1F2C'],
      });
    }, 250);
  };
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        
        <LeaderboardTable scores={scores} currentSessionId="session1" />
        
        <div className="mt-12 text-center">
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
