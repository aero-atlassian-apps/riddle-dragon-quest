import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createUniverse, updateUniverse, deleteUniverse } from "@/utils/db";
import { PlusCircle, Edit, Trash2, Globe, Users, Trophy, Settings } from "lucide-react";
import SimpleUniverseCreator from "./SimpleUniverseCreator";
import SessionCreatorModal from "./SessionCreatorModal";
import UniverseCard from "./UniverseCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Universe {
  id: string;
  name: string;
  description: string;
  poster_image_url?: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  troupe_count?: number;
  session_count?: number;
}

export type UniverseManagerHandle = {
  openCreator: () => void;
};

const UniverseManager = forwardRef<UniverseManagerHandle>((props, ref) => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedUniverseId, setSelectedUniverseId] = useState<string | null>(null);
  const [editingUniverse, setEditingUniverse] = useState<Universe | null>(null);
  const [deleteUniverseId, setDeleteUniverseId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUniverses();
  }, []);

  const fetchUniverses = async () => {
    try {
      const { data, error } = await supabase
        .from('universes')
        .select(`
          *,
          troupe_count:universe_troupes(count),
          session_count:sessions(count)
        `)
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

      // Transform the data to include counts
      const transformedData = data?.map(universe => ({
        ...universe,
        troupe_count: universe.troupe_count?.[0]?.count || 0,
        session_count: universe.session_count?.[0]?.count || 0
      })) || [];

      setUniverses(transformedData);
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

  const handleCreatorComplete = async (universeData: any) => {
    try {
      // Check if the universe is already created (has an ID)
      if (universeData.id) {
        // Universe is already created, just update the UI
        toast({
          title: "Succès",
          description: "Univers créé avec succès",
        });
        
        setIsCreatorOpen(false);
        fetchUniverses();
        return;
      }

      // Create new universe if it doesn't exist
      const newUniverse = await createUniverse(universeData);
      
      if (!newUniverse) {
        throw new Error('Erreur lors de la création de l\'univers');
      }

      toast({
        title: "Succès",
        description: "Nouvel univers créé avec succès",
      });
      
      setIsCreatorOpen(false);
      fetchUniverses();
    } catch (error) {
      console.error('Error creating universe:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (universe: Universe) => {
    setEditingUniverse(universe);
    setIsCreatorOpen(true);
  };

  const handleAddSession = (universeId: string) => {
    setSelectedUniverseId(universeId);
    setIsSessionModalOpen(true);
  };

  const handleSessionComplete = () => {
    setIsSessionModalOpen(false);
    setSelectedUniverseId(null);
    fetchUniverses(); // Refresh to update session counts
    toast({
      title: "Succès",
      description: "Session créée avec succès",
    });
  };

  const handleViewDetails = (universeId: string) => {
    const universe = universes.find(u => u.id === universeId);
    if (universe) {
      toast({
        title: `Détails de l'univers: ${universe.name}`,
        description: `Status: ${universe.status} | Troupes: ${universe.troupe_count} | Sessions: ${universe.session_count}`,
      });
    }
  };

  const handleDelete = (universeId: string) => {
    setDeleteUniverseId(universeId);
  };

  const confirmDeleteUniverse = async () => {
    if (!deleteUniverseId) return;
    const universe = universes.find(u => u.id === deleteUniverseId);
    try {
      const success = await deleteUniverse(deleteUniverseId);
      if (success) {
        toast({
          title: "Succès",
          description: universe ? `Univers "${universe.name}" supprimé avec succès` : "Univers supprimé avec succès",
        });
        await fetchUniverses();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'univers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting universe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'univers",
        variant: "destructive",
      });
    } finally {
      setDeleteUniverseId(null);
    }
  };

  const handleActivate = async (universeId: string) => {
    const universe = universes.find(u => u.id === universeId);
    if (!universe) return;

    try {
      const updatedUniverse = await updateUniverse(universeId, { status: 'active' });
      
      if (updatedUniverse) {
        toast({
          title: "Succès",
          description: `Univers "${universe.name}" activé avec succès`,
        });
        fetchUniverses(); // Refresh to show updated status
      } else {
        throw new Error('Failed to update universe');
      }
    } catch (error) {
      console.error('Error activating universe:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer l'univers",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      active: { label: "Actif", variant: "default" as const },
      archived: { label: "Archivé", variant: "outline" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Expose an imperative handle to open the creator from parent
  useImperativeHandle(ref, () => ({
    openCreator: () => {
      setEditingUniverse(null);
      setIsCreatorOpen(true);
    },
  }));

  if (isLoading) {
    return (
      <div className="text-center py-8 text-green-400 font-pixel">
        <span className="animate-pulse">Chargement des univers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Simple Universe Creator */}
      <SimpleUniverseCreator
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingUniverse(null);
        }}
        onComplete={handleCreatorComplete}
        editingUniverse={editingUniverse}
      />

      {/* Session Creator Modal */}
      <SessionCreatorModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedUniverseId(null);
        }}
        onSessionCreated={handleSessionComplete}
        universeId={selectedUniverseId || ''}
        universeName={selectedUniverseId ? universes.find(u => u.id === selectedUniverseId)?.name || 'Univers inconnu' : 'Univers inconnu'}
      />

      {universes.length === 0 ? (
        <Card className="bg-black/50 border-2 border-green-500">
          <CardContent className="text-center py-8">
            <Globe className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <p className="text-green-400 font-pixel">Aucun univers créé pour le moment</p>
            <p className="text-green-300 text-sm mt-2">Créez votre premier univers pour commencer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universes.map((universe) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              onAddSession={handleAddSession}
              onView={handleViewDetails}
              onDelete={handleDelete}
              onActivate={handleActivate}
              showActions={true}
              variant={'default'}
            />
          ))}
        </div>
      )}

      {/* Styled delete confirmation matching session deletion */}
      <AlertDialog open={!!deleteUniverseId} onOpenChange={() => setDeleteUniverseId(null)}>
        <AlertDialogContent className="bg-black border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-pixel">! ATTENTION !</AlertDialogTitle>
            <AlertDialogDescription className="text-red-400 font-mono">
              Cette action supprimera définitivement l'univers, toutes les troupes, sessions,
              salles, questions et scores associés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-green-500 text-green-400 hover:bg-green-500/20">
              ANNULER
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUniverse}
              className="bg-red-500 hover:bg-red-600 text-black font-pixel"
            >
              CONFIRMER_SUPPRESSION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default UniverseManager;