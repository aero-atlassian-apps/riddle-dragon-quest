import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Filter, Users, Play, Pause, Clock } from "lucide-react";

interface Session {
  id: string;
  name: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  context?: string;
  hint_enabled?: boolean;
}

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sessions",
          variant: "destructive",
        });
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.context && session.context.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-black"><Play className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'en attente':
        return <Badge className="bg-yellow-500 text-black"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'terminée':
        return <Badge className="bg-gray-500 text-white"><Pause className="w-3 h-3 mr-1" />Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black bg-cover bg-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-[#1a1a1a] p-6 rounded-xl border-4 border-[#00ff00]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" className="text-[#00ff00] hover:bg-[#00ff00]/20">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-[#00ff00] shadow-[0_0_10px_#00ff00] font-medieval">
                <Users className="inline mr-3" />
                Mode Sessions
              </h1>
            </div>
          </div>
          
          <p className="text-[#00ff00]/80 font-medieval">
            Explorez et rejoignez les sessions de jeu disponibles
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-[#1a1a1a] p-4 rounded-lg border-2 border-[#00ff00]/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00ff00]/60 h-4 w-4" />
                <Input
                  placeholder="Rechercher une session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-[#00ff00]/30 text-[#00ff00] placeholder:text-[#00ff00]/50"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-[#00ff00]/60 h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-black/50 border-[#00ff00]/30 text-[#00ff00]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#00ff00]/30">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="terminée">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] p-6 rounded-lg border-2 border-[#00ff00]/30 animate-pulse">
                <div className="h-6 bg-[#00ff00]/20 rounded mb-4"></div>
                <div className="h-4 bg-[#00ff00]/10 rounded mb-2"></div>
                <div className="h-4 bg-[#00ff00]/10 rounded mb-4"></div>
                <div className="h-8 bg-[#00ff00]/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-[#00ff00]/50 mb-4" />
            <h3 className="text-xl font-bold text-[#00ff00] mb-2">Aucune session trouvée</h3>
            <p className="text-[#00ff00]/70">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez de modifier vos critères de recherche" 
                : "Aucune session n'est disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#1a1a1a] p-6 rounded-lg border-2 border-[#00ff00]/30 hover:border-[#00ff00]/60 transition-all duration-300 hover:shadow-[0_0_20px_#00ff00/20] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#00ff00] font-medieval group-hover:text-[#39ff14] transition-colors">
                    {session.name}
                  </h3>
                  {getStatusBadge(session.status)}
                </div>
                
                {session.context && (
                  <p className="text-[#00ff00]/70 text-sm mb-4 line-clamp-2">
                    {session.context}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-[#00ff00]/60 mb-4">
                  <div>
                    <strong>Créé:</strong> {formatDate(session.start_time)}
                  </div>
                  {session.end_time && (
                    <div>
                      <strong>Terminé:</strong> {formatDate(session.end_time)}
                    </div>
                  )}
                  <div>
                    <strong>Indices:</strong> {session.hint_enabled ? "Activés" : "Désactivés"}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] border border-[#00ff00]/30"
                    onClick={() => {
                      // Navigate to session details or join session
                      toast({
                        title: "Session sélectionnée",
                        description: `Vous avez sélectionné: ${session.name}`,
                      });
                    }}
                  >
                    Voir détails
                  </Button>
                  {session.status === 'active' && (
                    <Button
                      size="sm"
                      className="bg-[#00ff00] hover:bg-[#39ff14] text-black font-bold"
                      onClick={() => {
                        // Navigate to join session
                        toast({
                          title: "Rejoindre la session",
                          description: `Redirection vers: ${session.name}`,
                        });
                      }}
                    >
                      Rejoindre
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;