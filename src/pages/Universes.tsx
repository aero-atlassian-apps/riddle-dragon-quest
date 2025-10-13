import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UniverseCard from "@/components/UniverseCard";
import { ArrowLeft, Search, Filter, Globe, Sparkles } from "lucide-react";

interface Universe {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  troupe_count: number;
  session_count: number;
  theme?: {
    name: string;
    primary_color: string;
    background_image?: string;
  };
}

const Universes = () => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [filteredUniverses, setFilteredUniverses] = useState<Universe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUniverses();
  }, []);

  useEffect(() => {
    filterAndSortUniverses();
  }, [universes, searchTerm, statusFilter, sortBy]);

  const fetchUniverses = async () => {
    try {
      const { data, error } = await supabase
        .from('universes')
        .select(`
          *,
          troupes:troupes(count),
          sessions:sessions(count)
        `)
        .eq('status', 'active') // Only show active universes to public
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching universes:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les univers",
          variant: "destructive",
        });
        return;
      }

      // Transform data to include counts
      const universesWithCounts = (data || []).map(universe => ({
        ...universe,
        troupe_count: universe.troupes?.[0]?.count || 0,
        session_count: universe.sessions?.[0]?.count || 0,
        troupes: undefined, // Remove the nested data
        sessions: undefined, // Remove the nested data
      }));

      setUniverses(universesWithCounts);
    } catch (error) {
      console.error('Error in fetchUniverses:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortUniverses = () => {
    let filtered = [...universes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(universe =>
        universe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universe.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "available") {
        filtered = filtered.filter(universe => 
          universe.session_count > 0 // Has sessions available
        );
      } else if (statusFilter === "full") {
        filtered = filtered.filter(universe => 
          universe.session_count === 0 // No sessions available
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "sessions":
        filtered.sort((a, b) => b.session_count - a.session_count);
        break;
      default:
        break;
    }

    setFilteredUniverses(filtered);
  };

  const handleJoinUniverse = async (universeId: string) => {
    // In a real implementation, this would:
    // 1. Check if user is authenticated
    // 2. Check if universe has space
    // 3. Create a room/session for the user
    // 4. Navigate to the game
    
    toast({
      title: "Fonctionnalité en développement",
      description: "La fonctionnalité de rejoindre un univers sera bientôt disponible",
    });
  };

  const handleViewUniverse = (universeId: string) => {
    // Navigate to universe details page (to be implemented)
    toast({
      title: "Détails de l'univers",
      description: "Page de détails en cours de développement",
    });
  };

  const getFeaturedUniverse = () => {
    return filteredUniverses.find(u => u.session_count > 0) || filteredUniverses[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 relative">
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)]" />
        
        <div className="relative z-10 container mx-auto p-4">
          <div className="text-center py-16 text-green-400 font-pixel">
            <Globe className="mx-auto h-16 w-16 mb-4 animate-pulse" />
            <span className="text-2xl animate-pulse">Chargement des univers...</span>
          </div>
        </div>
      </div>
    );
  }

  const featuredUniverse = getFeaturedUniverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 relative">
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)]" />
      
      <div className="relative z-10 container mx-auto p-4">
        {/* Header */}
        <div className="mb-8 text-center p-6 bg-black/90 border-2 border-green-500 rounded-lg font-mono relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/20"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2" size={18} />
                RETOUR
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="text-green-400" size={24} />
                <h1 className="text-3xl font-bold font-medieval text-green-400">Mode Univers</h1>
                <Sparkles className="text-green-400" size={24} />
              </div>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
            <p className="text-green-400 font-pixel">Explorez des mondes infinis et relevez des défis épiques</p>
          </div>
        </div>

        {/* Featured Universe */}
        {featuredUniverse && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-green-400" size={20} />
              <h2 className="text-xl font-medieval text-green-400">Univers en Vedette</h2>
            </div>
            <UniverseCard
              universe={featuredUniverse}
              onJoin={handleJoinUniverse}
              onView={handleViewUniverse}
              variant="featured"
              showActions={false}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 bg-black/90 border-2 border-green-500 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" size={18} />
                  <Input
                    placeholder="Rechercher un univers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-green-500 text-green-400 placeholder-green-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-black/50 border-green-500 text-green-400">
                    <Filter size={16} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="available">Disponibles</SelectItem>
                    <SelectItem value="full">Complets</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-black/50 border-green-500 text-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500">
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="oldest">Plus anciens</SelectItem>
                    <SelectItem value="name">Nom A-Z</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="text-green-400 font-pixel text-sm">
                {filteredUniverses.length} univers trouvé{filteredUniverses.length !== 1 ? 's' : ''}
              </span>
              {searchTerm && (
                <Badge variant="outline" className="text-green-300">
                  Recherche: "{searchTerm}"
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="outline" className="text-green-300">
                  Filtre: {statusFilter === "available" ? "Disponibles" : "Complets"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Universe Grid */}
        {filteredUniverses.length === 0 ? (
          <div className="text-center py-16 bg-black/90 border-2 border-green-500 rounded-lg">
            <Globe className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-xl font-medieval text-green-400 mb-2">Aucun univers trouvé</h3>
            <p className="text-green-300 font-pixel">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun univers n'est actuellement disponible"
              }
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4 border-green-500 text-green-400 hover:bg-green-500/20"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniverses
              .filter(u => u.id !== featuredUniverse?.id) // Don't show featured universe again
              .map((universe) => (
                <UniverseCard
                  key={universe.id}
                  universe={universe}
                  onJoin={handleJoinUniverse}
                  onView={handleViewUniverse}
                  showActions={false}
                />
              ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center p-4 bg-black/50 border border-green-500 rounded-lg">
          <p className="text-green-400 font-pixel text-sm">
            💡 Astuce: Chaque univers offre une expérience unique avec ses propres défis et récompenses
          </p>
        </div>
      </div>
    </div>
  );
};

export default Universes;