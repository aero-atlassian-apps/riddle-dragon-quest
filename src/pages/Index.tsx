
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 text-dragon-scale dragon-glow">
          La chasse à la <span className="text-dragon-primary">value</span>
        </h1>
        
        <div className="mb-8">
          <p className="text-xl text-gray-700 mb-6">
            A collaborative riddle game where teams solve dragon's puzzles, 
            unlock magical doors, and compete for the highest score.
          </p>
          
          <div className="my-12 flex justify-center">
            <div className="dragon-float max-w-xs">
              <svg 
                viewBox="0 0 200 160" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                {/* Dragon Body */}
                <path d="M100 140c30 0 60-20 60-50s-30-50-60-50-60 20-60 50 30 50 60 50z" 
                      fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="3" />
                
                {/* Dragon's Neck/Head */}
                <path d="M80 70c-5-20 0-40 20-50 10-5 25-5 40 10 5 5 0 15-10 15-10 0-15-10-30-5-10 5-15 15-15 20z" 
                      fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
                
                {/* Dragon's Eyes */}
                <circle cx="95" cy="45" r="5" fill="#DC2626" className="dragon-eyes" />
                <circle cx="115" cy="45" r="5" fill="#DC2626" className="dragon-eyes" />
                
                {/* Dragon's Wings */}
                <path d="M60 100c-20-10-40 0-40 20s20 25 40 15c10-5 10-30 0-35z" 
                      fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
                <path d="M140 100c20-10 40 0 40 20s-20 25-40 15c-10-5-10-30 0-35z" 
                      fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
                
                {/* Dragon's Fire */}
                <g className="flame-animation">
                  <path d="M105 30c0-10 5-15 10-20 5 5 10 10 10 20 0 5-5 10-10 10s-10-5-10-10z" 
                        fill="#F59E0B" stroke="#DC2626" strokeWidth="1" />
                  <path d="M110 15c2 3 5 5 5 10 0 3-2 5-5 5s-5-2-5-5c0-5 3-7 5-10z" 
                        fill="#DC2626" />
                </g>
                
                {/* Dragon's Tail */}
                <path d="M100 140c-10 10-20 15-30 5s0-30 10-20c5 5 10 10 20 15z" 
                      fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          <Link to="/admin">
            <Button className="w-full h-16 text-lg bg-dragon-primary hover:bg-dragon-secondary">
              Admin Dashboard
            </Button>
          </Link>
          
          <Link to="/leaderboard">
            <Button className="w-full h-16 text-lg bg-dragon-gold hover:bg-dragon-gold/80">
              View Leaderboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-10 parchment p-6">
          <h2 className="text-xl font-bold mb-4">How to Play</h2>
          <ol className="text-left list-decimal pl-6 space-y-2">
            <li>Admins create a game session and add teams (rooms)</li>
            <li>Teams receive a unique link to join their room</li>
            <li>Each room faces 6 doors guarded by a dragon</li>
            <li>Solve riddles to unlock doors and earn points</li>
            <li>Use aid tokens for hints (each token used reduces your score)</li>
            <li>The room with the highest score wins!</li>
          </ol>
        </div>
      </div>
      
      <footer className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} La chasse à la value. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
