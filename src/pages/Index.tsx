
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Dragon from "@/components/Dragon";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 text-dragon-scale dragon-glow">
          Game of <span className="text-dragon-primary">Metrics</span>
        </h1>
        
        <div className="mb-8">
          <p className="text-xl text-gray-700 mb-6">
            Where dragons guard the gates of knowledge and metrics await those brave enough to face them.
          </p>
          
          <div className="my-12 flex justify-center">
            <Dragon isAwake={true} isSpeaking={false} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          <Link to="/admin">
            <Button className="w-full h-16 text-lg bg-dragon-primary hover:bg-dragon-secondary">
              Master of Metrics
            </Button>
          </Link>
          
          <Link to="/leaderboard">
            <Button className="w-full h-16 text-lg bg-dragon-gold hover:bg-dragon-gold/80">
              Hall of Heroes
            </Button>
          </Link>
        </div>
        
        <div className="mt-10 parchment p-6">
          <h2 className="text-xl font-bold mb-4">The Game Rules</h2>
          <ol className="text-left list-decimal pl-6 space-y-2">
            <li>The Master of Metrics creates a realm and summons its guardians</li>
            <li>Each team receives a sacred scroll (unique link) to their chamber</li>
            <li>Six dragon-guarded doors await each team's challenge</li>
            <li>Answer the dragon's riddles to unlock the doors and gain power (points)</li>
            <li>Use wisdom tokens for guidance (but beware, each token dims your glory)</li>
            <li>The team with the highest power shall rule the realm!</li>
          </ol>
        </div>
      </div>
      
      <footer className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Game of Metrics. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
