
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Swords, Trophy, ChevronRight, Gamepad2, X, Users } from "lucide-react";
import { useState } from "react";
import GamesShield from "@/components/GamesShield";

const Index = () => {
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-black bg-cover bg-center p-4">
      <div className="max-w-4xl w-full mx-auto text-center my-auto">
        <div className="bg-[#1a1a1a] p-8 rounded-xl border-4 border-[#00ff00]/30">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#00ff00] shadow-[0_0_10px_#00ff00] font-medieval">
            Serious <span className="text-[#39ff14]">GAMES</span>
          </h1>
          
          <div className="mb-8">
            <p className="text-xl text-[#00ff00] mb-6 font-medieval">
              "Quand vous jouez à nos SERIOUS GAMES, vous gagnez ou vous apprenez. Il n'y a pas de juste milieu."
            </p>
            
            <div className="my-12 flex justify-center">
              <GamesShield className="w-full max-w-3xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center items-center">
            <Link to="/admin" className="transform transition-transform hover:scale-105">
              <Button className="w-full sm:w-64 h-16 text-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#00ff00] border-2 border-[#00ff00]/30 group shadow-[0_0_5px_#00ff00]">
                <Crown className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Espace du Maître des jeux
              </Button>
            </Link>
            
            {/* Challenges and Universes links removed */}
            
            <Button 
              onClick={() => setShowChallenge(true)}
              className="transform transition-transform hover:scale-105 w-full sm:w-64 h-16 text-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffd700] border-2 border-[#ffd700]/30 group shadow-[0_0_5px_#ffd700]"
            >
              <Gamepad2 className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Défi du jour
            </Button>
            
            <Link to="/leaderboard" className="transform transition-transform hover:scale-105">
              <Button className="w-full sm:w-64 h-16 text-lg bg-[#2a2a2a] hover:bg-[#1a1a1a] text-[#39ff14] border-2 border-[#00ff00]/30 group shadow-[0_0_5px_#39ff14]">
                <Trophy className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Mur des héros
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 p-6 bg-[#2a2a2a] border-2 border-[#00ff00]/30 rounded-xl">
            <button 
              onClick={() => setRulesExpanded(!rulesExpanded)} 
              className="w-full text-left focus:outline-none group"
            >
              <h2 className="text-2xl font-bold mb-4 font-medieval flex items-center text-[#39ff14]">
                <ChevronRight className={`mr-2 h-6 w-6 transition-transform duration-200 ${rulesExpanded ? 'rotate-90' : ''} group-hover:text-[#00ff00]`} />
                <Swords className="mr-2 h-6 w-6" />
                Règles du Jeu
              </h2>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${rulesExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ol className="text-left list-decimal pl-6 space-y-3 font-serif text-[#00ff00]">
                <li>Le Maître du jeu crée un royaume et convoque ses gardiens</li>
                <li>Chaque troupe reçoit un parchemin sacré (lien unique)</li>
                <li>Des portes gardées par la garde du roi du jeu attendent chaque troupe</li>
                <li>Répondez aux énigmes pour déverrouiller les portes et gagner du pouvoir (points)</li>
                <li>Utilisez des jetons de sagesse pour obtenir de l'aide (mais attention, chaque jeton diminue votre gloire)</li>
                <li>La troupe avec le plus de pouvoir règnera sur le royaume !</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="heraldry mx-auto w-24 h-24 opacity-60">
              <div className="shield bg-[#1a1a1a] border-2 border-[#00ff00]/50 rounded-tr-full rounded-tl-full shadow-[0_0_10px_#00ff00]"></div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-sm text-[#00ff00]/70 text-center font-medieval">
        &copy; {new Date().getFullYear()} AWB Serious GAMES. Tous droits réservés par ordre du Roi du jeu.
      </footer>
      
      {/* Challenge du jour Modal */}
      {showChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowChallenge(false)}
              className="absolute top-4 right-4 z-10 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#00ff00] border-2 border-[#00ff00]/30 rounded-full p-2 shadow-[0_0_5px_#00ff00] transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src="/images/DataPrivacyEscapeGame.png"
              alt="Challenge du jour"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_20px_#00ff00]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
