
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Swords, Trophy } from "lucide-react";
import GamesShield from "@/components/GamesShield";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[url('/images/parchment-bg.jpg')] bg-cover bg-center p-4">
      <div className="max-w-4xl w-full mx-auto text-center my-auto">
        <div className="parchment p-8 rounded-xl border-4 border-dragon-gold/30">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-dragon-scale dragon-glow font-medieval">
            Games of <span className="text-dragon-primary">COPs</span>
          </h1>
          
          <div className="mb-8">
            <p className="text-xl text-gray-700 mb-6 font-medieval">
              "Quand vous jouez aux Games of COPs, vous gagnez ou vous apprenez. Il n'y a pas de juste milieu."
            </p>
            
            <div className="my-12 flex justify-center">
              <GamesShield className="w-full max-w-3xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Link to="/admin" className="transform transition-transform hover:scale-105">
              <Button className="w-full h-16 text-lg bg-dragon-primary hover:bg-dragon-secondary border-2 border-dragon-gold/30 group">
                <Crown className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Maître des Métriques
              </Button>
            </Link>
            
            <Link to="/leaderboard" className="transform transition-transform hover:scale-105">
              <Button className="w-full h-16 text-lg bg-dragon-gold hover:bg-dragon-gold/80 border-2 border-dragon-scale/30 group">
                <Trophy className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Salle des Héros
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 parchment p-6 bg-dragon-scroll/50">
            <h2 className="text-2xl font-bold mb-4 font-medieval flex items-center justify-center">
              <Swords className="mr-2 h-6 w-6" />
              Règles du Jeu
            </h2>
            <ol className="text-left list-decimal pl-6 space-y-3 font-serif">
              <li>Le Maître des Métriques crée un royaume et convoque ses gardiens</li>
              <li>Chaque équipe reçoit un parchemin sacré (lien unique) vers sa chambre</li>
              <li>Six portes gardées par des dragons attendent chaque équipe</li>
              <li>Répondez aux énigmes du dragon pour déverrouiller les portes et gagner du pouvoir (points)</li>
              <li>Utilisez des jetons de sagesse pour obtenir de l'aide (mais attention, chaque jeton diminue votre gloire)</li>
              <li>L'équipe avec le plus de pouvoir règnera sur le royaume !</li>
            </ol>
          </div>
          
          <div className="mt-8">
            <div className="heraldry mx-auto w-24 h-24 opacity-60">
              <div className="shield bg-dragon-primary/20 border-2 border-dragon-gold/50 rounded-tr-full rounded-tl-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-sm text-dragon-scale/70 text-center font-medieval">
        &copy; {new Date().getFullYear()} Games of COPs. Tous droits réservés par ordre du Roi.
      </footer>
    </div>
  );
};

export default Index;
