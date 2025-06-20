
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Swords, Trophy, ChevronRight } from "lucide-react";
import { useState } from "react";
import GamesShield from "@/components/GamesShield";

const Index = () => {
  const [rulesExpanded, setRulesExpanded] = useState(false);
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Link to="/admin" className="transform transition-transform hover:scale-105">
              <Button className="w-full h-16 text-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#00ff00] border-2 border-[#00ff00]/30 group shadow-[0_0_5px_#00ff00]">
                <Crown className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Espace du Maître des jeux
              </Button>
            </Link>
            
            <Link to="/leaderboard" className="transform transition-transform hover:scale-105">
              <Button className="w-full h-16 text-lg bg-[#2a2a2a] hover:bg-[#1a1a1a] text-[#39ff14] border-2 border-[#00ff00]/30 group shadow-[0_0_5px_#39ff14]">
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
    </div>
  );
};

export default Index;
