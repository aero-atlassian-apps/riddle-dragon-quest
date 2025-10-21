import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Play, Pause, RotateCcw, ExternalLink, Copy, X, Castle, Swords, Tag, ArrowLeft, LogOut, Coins } from "lucide-react";
import ChallengeCreator from "@/components/ChallengeCreator";
import QuestionUploader from "@/components/QuestionUploader";
import QuestionManager from "@/components/QuestionManager";
import RoomCreator from "@/components/RoomCreator";
import UniverseManager, { UniverseManagerHandle } from "@/components/UniverseManager";
import { getChallenges, deleteChallenge, updateChallengeStatus, updateChallengeName, updateChallengeRoomsTokens, getUniverses } from "@/utils/db";
import { Challenge, Question, Room } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const AdminDashboard = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [universes, setUniverses] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creationStep, setCreationStep] = useState<"challenge" | "questions" | "images" | "rooms">("challenge");
  const [roomCreationChallengeId, setRoomCreationChallengeId] = useState<string | null>(null);
  const [deleteChallengeId, setDeleteChallengeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomsDialog, setShowRoomsDialog] = useState(false);
  const [challengeRooms, setChallengeRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [currentChallengeName, setCurrentChallengeName] = useState("");
  const [adminMode, setAdminMode] = useState<"challenges" | "universes">("challenges");
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [savingName, setSavingName] = useState<boolean>(false);
  const [editingTokensId, setEditingTokensId] = useState<string | null>(null);
  const [editingTokens, setEditingTokens] = useState<string>("");
  const [savingTokens, setSavingTokens] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterByUniverse, setFilterByUniverse] = useState<string>("all");
  const universeManagerRef = useRef<UniverseManagerHandle>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
    fetchUniverses();
  }, []);

  // Reload Challenges when switching back to challenges mode
  useEffect(() => {
    if (adminMode === "challenges") {
      fetchChallenges();
  }
  }, [adminMode]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    const fetchedChallenges = await getChallenges();
    setChallenges(fetchedChallenges);
    setIsLoading(false);
  };

  const fetchUniverses = async () => {
    try {
      const fetchedUniverses = await getUniverses();
      setUniverses(fetchedUniverses);
    } catch (error) {
      console.error('Error fetching universes:', error);
    }
  };

  const handleCreateChallenge = async (challenge: Challenge) => {
    setRoomCreationChallengeId(challenge.id);
    setCreationStep("questions");
    // Refresh challenges to include the newly created challenge
    await fetchChallenges();
  };

  const handleUploadQuestions = (questions: Question[]) => {
    setCreationStep("images");
  };

  const handleQuestionsWithImagesComplete = () => {
    setCreationStep("rooms");
  };

  const handleCreateRooms = async (roomNames: string[]) => {
    toast({
      title: "Rooms created successfully",
      description: `${roomNames.length} rooms have been created`,
    });
  };

  const handleFinishCreation = () => {
    setShowCreateForm(false);
    setCreationStep("challenge");
    setRoomCreationChallengeId(null);
    fetchChallenges();
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    setDeleteChallengeId(challengeId);
  };

  const confirmDeleteChallenge = async () => {
    if (!deleteChallengeId) return;

    // Prevent deletion of active challenges
    const target = challenges.find(s => s.id === deleteChallengeId);
    if (target?.status === 'active') {
      toast({
        title: "Action not allowed",
        description: "You cannot delete an active challenge.",
        variant: "destructive",
      });
      setDeleteChallengeId(null);
      return;
    }

    const success = await deleteChallenge(deleteChallengeId);
    
    if (success) {
      setChallenges((prevChallenges) => prevChallenges.filter((s) => s.id !== deleteChallengeId));
      toast({
        title: "Challenge deleted",
        description: "The challenge has been successfully deleted",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the challenge",
        variant: "destructive",
      });
    }
    
    setDeleteChallengeId(null);
  };

  const cancelDeleteChallenge = () => {
    setDeleteChallengeId(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion",
        description: "Vous êtes déconnecté.",
      });
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Échec de la déconnexion",
        variant: "destructive",
      });
    }
  };

  // Inline name editing handlers
  const beginEditChallengeName = (challengeId: string, currentName: string) => {
    setEditingChallengeId(challengeId);
    setEditingName(currentName);
  };

  const cancelEditChallengeName = () => {
    setEditingChallengeId(null);
    setEditingName("");
  };

  const saveEditChallengeName = async () => {
    if (!editingChallengeId) return;
    const newName = editingName.trim();
    if (!newName) {
      toast({ title: "Nom requis", description: "Le nom ne peut pas être vide", variant: "destructive" });
      return;
    }
    setSavingName(true);
    const success = await updateChallengeName(editingChallengeId, newName);
    setSavingName(false);
    if (success) {
      setChallenges(prev => prev.map(s => s.id === editingChallengeId ? { ...s, name: newName } : s));
      toast({ title: "Nom mis à jour", description: "Le nom du challenge a été modifié" });
      cancelEditChallengeName();
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le nom", variant: "destructive" });
    }
  };

  // Inline token editing handlers
  const beginEditChallengeTokens = (challengeId: string, currentTokens: number) => {
    // Check if challenge is in a state that allows token editing
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.status !== 'en attente') {
      toast({ 
        title: "Modification impossible", 
        description: "Les tokens ne peuvent être modifiés que pour les challenges en attente", 
        variant: "destructive" 
      });
      return;
    }
    
    setEditingTokensId(challengeId);
    setEditingTokens(currentTokens.toString());
  };

  const cancelEditChallengeTokens = () => {
    setEditingTokensId(null);
    setEditingTokens("");
  };

  const saveEditChallengeTokens = async () => {
    if (!editingTokensId) return;
    const newTokens = parseInt(editingTokens.trim());
    if (isNaN(newTokens) || newTokens < 1 || newTokens > 100) {
      toast({ 
        title: "Valeur invalide", 
        description: "Le nombre de tokens doit être entre 1 et 100", 
        variant: "destructive" 
      });
      return;
    }
    setSavingTokens(true);
    const success = await updateChallengeRoomsTokens(editingTokensId, newTokens);
    setSavingTokens(false);
    if (success) {
      setChallenges(prev => prev.map(s => s.id === editingTokensId ? { ...s, maxTokens: newTokens } : s));
      toast({ title: "Tokens mis à jour", description: "Le nombre de tokens du challenge a été modifié" });
      cancelEditChallengeTokens();
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour les tokens", variant: "destructive" });
    }
  };

  const handleViewRooms = async (challengeId: string) => {
    setLoadingRooms(true);
    setShowRoomsDialog(true);
    
    try {
      const challenge = challenges.find(s => s.id === challengeId);
      if (challenge) {
        setCurrentChallengeName(challenge.name);
      }
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Error",
          description: "Failed to fetch rooms for this challenge",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        const formattedRooms = data.map(room => ({
          id: room.id,
          challengeId: (room as any).challenge_id,
          name: room.name,
          tokensLeft: room.tokens_left,
          currentDoor: room.current_door,
          score: room.score,
          sigil: room.sigil,
          motto: room.motto,
          link: `${window.location.origin}/game/room/${room.id}`
        }));
        
        setChallengeRooms(formattedRooms);
      } else {
        setChallengeRooms([]);
      }
    } catch (error) {
      console.error('Error in handleViewRooms:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingRooms(false);
    }
  };
  
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Room link has been copied to clipboard",
    });
  };

  const copyAllRoomsAsTable = () => {
    const tableContent = challengeRooms
      .map(room => `${room.name}\t${room.sigil || '🏰'}\t${room.motto || 'House Motto'}\t${room.link}`)
      .join('\n');
    const header = "Room Name\tSigil\tMotto\tLink\n";
    navigator.clipboard.writeText(header + tableContent);
    toast({
      title: "Rooms List Copied",
      description: "All rooms information copied as table",
    });
  };

  const handleChallengeStatusChange = async (challengeId: string, newStatus: string) => {
    try {
      const success = await updateChallengeStatus(challengeId, newStatus);
      
      if (success) {
        setChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, status: newStatus }
            : challenge
        ));
        
        toast({
          title: "Statut mis à jour",
          description: `Le challenge a été mis à jour vers "${newStatus}"`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du challenge",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating challenge status:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 before:absolute before:inset-0 before:bg-[url('/terminal-bg.png')] before:opacity-10 before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
      <div className="mb-8 text-center p-6 bg-black/90 border-2 border-green-500 rounded-lg font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="relative z-10">
          <div className="absolute top-4 left-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 font-mono">
                <ArrowLeft className="h-4 w-4 mr-1" />
                retour
              </Button>
            </Link>
          </div>
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-green-400 hover:text-green-300 hover:bg-green-500/10 font-mono">
              <LogOut className="h-4 w-4 mr-1" />
              logout
            </Button>
          </div>
          <h1 className="text-3xl font-bold font-medieval mb-6 text-green-400">Espace du Maître des Jeux</h1>
          <div className="flex items-center justify-center mb-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2" />
            <h3 className="text-2xl text-green-500 font-pixel glitch">[ CONSOLE DE CONTRÔLE ]</h3>
          </div>
          <p className="text-green-400 font-pixel typing-effect">$ Système initialisé et prêt à recevoir des commandes...</p>
          
          {/* Mode Toggle */}
          <div className="mt-6 flex justify-center">
            <div className="bg-black/50 border-2 border-green-500 rounded-lg p-1 flex">
              <Button
                variant={adminMode === "challenges" ? "default" : "ghost"}
                className={`font-pixel ${
                  adminMode === "challenges" 
                    ? "bg-green-500 text-black hover:bg-green-600" 
                    : "text-green-400 hover:bg-green-500/20"
                }`}
                onClick={() => setAdminMode("challenges")}
              >
                <Swords className="mr-2" size={18} />
                MODE CHALLENGES
              </Button>
              <Button
                variant={adminMode === "universes" ? "default" : "ghost"}
                className={`font-pixel ${
                  adminMode === "universes" 
                    ? "bg-green-500 text-black hover:bg-green-600" 
                    : "text-green-400 hover:bg-green-500/20"
                }`}
                onClick={() => setAdminMode("universes")}
              >
                <Castle className="mr-2" size={18} />
                MODE UNIVERS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Mode */}
      {adminMode === "challenges" && (
        <>
          {showCreateForm ? (
            <div className="mb-8 bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
              <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
              <div className="relative z-10">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold font-medieval text-green-400">$ INITIALISER_NOUVEAU_CHALLENGE</h2>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-400 hover:bg-green-500/20"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreationStep("challenge");
                      setRoomCreationChallengeId(null);
                    }}
                  >
                    <X className="mr-2" size={18} />
                    ANNULER
                  </Button>
                </div>

                {creationStep === "challenge" && (
                <ChallengeCreator onCreateChallenge={handleCreateChallenge} />
                )}
                
                {creationStep === "questions" && roomCreationChallengeId && (
                  <QuestionUploader
                    challengeId={roomCreationChallengeId}
                    onUpload={handleUploadQuestions}
                  />
                )}
                
                {creationStep === "images" && roomCreationChallengeId && (
                  <QuestionManager
                    challengeId={roomCreationChallengeId}
                    onComplete={handleQuestionsWithImagesComplete}
                  />
                )}
                
                {creationStep === "rooms" && roomCreationChallengeId && (
                  <RoomCreator
                    challengeId={roomCreationChallengeId}
                    onCreateRooms={handleCreateRooms}
                    onContinue={handleFinishCreation}
                    hintEnabled={challenges.find(s => s.id === roomCreationChallengeId)?.hintEnabled ?? true}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Button
                className="bg-green-500 hover:bg-green-600 text-black font-pixel"
                onClick={() => setShowCreateForm(true)}
              >
                <PlusCircle className="mr-2" size={18} />
                $ NOUVEAU_CHALLENGE
              </Button>
            </div>
          )}

          {!showCreateForm && (
            <div className="mt-8 bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
              <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
              <div className="relative z-10">
                <Tabs defaultValue="active" className="w-full">
                  <div className="flex items-center justify-end mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-pixel text-sm">FILTRER_PAR_UNIVERS</span>
                      <Select value={filterByUniverse} onValueChange={setFilterByUniverse}>
                        <SelectTrigger className="w-[200px] border-green-500 text-green-400 bg-black">
                          <SelectValue placeholder="Tous les univers" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-green-500">
                          <SelectItem value="all" className="text-green-400">Tous les univers</SelectItem>
                          <SelectItem value="standalone" className="text-blue-400">Challenges standalone</SelectItem>
                          {universes.map((universe) => (
                            <SelectItem key={universe.id} value={universe.id} className="text-purple-400">
                              {universe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-green-400 font-pixel text-sm ml-3">TRIER_PAR</span>
                      <Select value={sortBy} onValueChange={(v: "date" | "name") => setSortBy(v)}>
                        <SelectTrigger className="w-[220px] border-green-500 text-green-400 bg-black">
                          <SelectValue placeholder="Choisir un tri" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-green-500">
                          <SelectItem value="date" className="text-green-400">Date de création</SelectItem>
                          <SelectItem value="name" className="text-green-400">Nom</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-green-400 font-pixel text-sm ml-3">ORDRE</span>
                      <Select value={sortDir} onValueChange={(v: "asc" | "desc") => setSortDir(v)}>
                        <SelectTrigger className="w-[160px] border-green-500 text-green-400 bg-black">
                          <SelectValue placeholder="Choisir l'ordre" /></SelectTrigger>
                        <SelectContent className="bg-black border-green-500">
                          <SelectItem value="asc" className="text-green-400">Ascendant</SelectItem>
                          <SelectItem value="desc" className="text-green-400">Descendant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <TabsList className="w-full mb-6 font-pixel bg-black border-2 border-green-500">
                    <TabsTrigger value="all" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      TOUS_CHALLENGES
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      CHALLENGES_ACTIFS
                    </TabsTrigger>
                    <TabsTrigger value="en attente" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      CHALLENGES_EN_ATTENTE
                    </TabsTrigger>
                    <TabsTrigger value="terminée" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                      CHALLENGES_TERMINÉS
                    </TabsTrigger>
                  </TabsList>

              {["all", "active", "en attente", "terminée"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-8 text-green-400 font-pixel">
                      <span className="animate-pulse">Chargement des challenges...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {challenges
                        .filter((challenge) => {
                          // Filter by status
                          const statusFilter = tab === "all" || 
                            (tab === "active" && challenge.status === "active") || 
                            (tab === "en attente" && challenge.status === "en attente") || 
                            (tab === "terminée" && challenge.status === "terminée");
                          
                          // Filter by universe
                          const universeFilter = filterByUniverse === "all" ||
                            (filterByUniverse === "standalone" && !challenge.universeId) ||
                            (filterByUniverse !== "standalone" && filterByUniverse !== "all" && challenge.universeId === filterByUniverse);
                          
                          return statusFilter && universeFilter;
                        })
                        .sort((a, b) => {
                          if (sortBy === "name") {
                            const cmp = a.name.localeCompare(b.name);
                            return sortDir === "asc" ? cmp : -cmp;
                          }
                          // Sort by creation date using createdAt if available, otherwise startTime
                          const aDate = a.createdAt || a.startTime;
                          const bDate = b.createdAt || b.startTime;
                          const at = aDate ? new Date(aDate).getTime() : 0;
                          const bt = bDate ? new Date(bDate).getTime() : 0;
                          const cmp = at - bt; // asc by default
                          return sortDir === "asc" ? cmp : -cmp;
                        })
                        .map((challenge) => (
                          <div
                            key={challenge.id}
                            className="bg-black/90 border-2 border-green-500 rounded-lg p-4 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
                            <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  {editingChallengeId === challenge.id ? (
                                    <Input
                                      autoFocus
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      onBlur={saveEditChallengeName}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditChallengeName();
                                        if (e.key === 'Escape') cancelEditChallengeName();
                                      }}
                                      disabled={savingName}
                                      className="h-8 bg-black/50 border-green-500 text-green-400 font-pixel"
                                    />
                                  ) : (
                                    <h3
                                      className="text-lg font-bold font-pixel text-green-400 cursor-text"
                                      onClick={() => beginEditChallengeName(challenge.id, challenge.name)}
                                      title="Cliquer pour renommer"
                                    >
                                      $ {challenge.name}
                                    </h3>
                                  )}
                                  {/* Challenge Type Indicator */}
                                  <div className={`px-2 py-1 rounded text-xs font-pixel ${
                                    challenge.challengeType === 'universe' 
                                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}>
                                    {challenge.challengeType === 'universe' ? 'UNIVERS' : 'STANDALONE'}
                                  </div>
                                </div>
                                {challenge.status !== 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-500/20"
                                    onClick={() => handleDeleteChallenge(challenge.id)}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                )}
                              </div>

                              <div className="text-sm text-green-400/80 font-mono mb-4 space-y-1">
                                <div>
                                  {(() => {
                                    const created = challenge.createdAt || challenge.startTime;
                                    return <>Créée le: {created ? new Date(created).toLocaleString() : '—'}</>;
                                  })()}
                                </div>
                                <div>
                                  Questions: {challenge.questions?.length || 0}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Coins size={14} className="text-yellow-400" />
                                  <span>Tokens: </span>
                                  {editingTokensId === challenge.id ? (
                                    <Input
                                      autoFocus
                                      value={editingTokens}
                                      onChange={(e) => setEditingTokens(e.target.value)}
                                      onBlur={saveEditChallengeTokens}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditChallengeTokens();
                                        if (e.key === 'Escape') cancelEditChallengeTokens();
                                      }}
                                      disabled={savingTokens}
                                      className="h-6 w-16 bg-black/50 border-yellow-500 text-yellow-400 font-pixel text-sm"
                                      type="number"
                                      min="1"
                                      max="100"
                                    />
                                  ) : (
                                    <span
                                      className={`font-semibold text-yellow-400 ${
                                        challenge.status === 'en attente' 
                                          ? 'cursor-pointer hover:underline' 
                                          : 'cursor-not-allowed opacity-60'
                                      }`}
                                      onClick={() => {
                                        if (challenge.status === 'en attente') {
                                          beginEditChallengeTokens(challenge.id, challenge.maxTokens || 3);
                                        }
                                      }}
                                      title={
                                        challenge.status === 'en attente' 
                                          ? "Cliquer pour modifier" 
                                          : "Modification impossible - Challenge actif ou terminé"
                                      }
                                    >
                                      {challenge.maxTokens || 3}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  Statut: <span className="font-semibold uppercase">{challenge.status}</span>
                                </div>
                                {challenge.challengeType === 'universe' && challenge.universeId && (
                                  <div className="text-purple-400">
                                    <Tag size={12} className="inline mr-1" />
                                    {challenge.universeName || 'Challenge d\'univers'}
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                                  onClick={() => handleViewRooms(challenge.id)}
                                >
                                  <ExternalLink size={16} className="mr-1" /> VOIR_TROUPES
                                </Button>
                                
                                {challenge.status === 'en attente' && (() => {
                                  const isUniverseChallenge = challenge.challengeType === 'universe';
                                  const isBlockedByUniverse = isUniverseChallenge && challenge.universeStatus !== 'active';
                                  if (isBlockedByUniverse) {
                                    return (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              size="sm" 
                                              className="bg-green-500 text-black font-pixel opacity-50 cursor-not-allowed"
                                              disabled
                                            >
                                              <Play size={16} className="mr-1" /> DEMARRER
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <span className="font-mono">Univers inactif. Activez l'univers pour démarrer.</span>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    );
                                  }
                                  return (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-500 hover:bg-green-600 text-black font-pixel"
                                      onClick={() => handleChallengeStatusChange(challenge.id, 'active')}
                                    >
                                      <Play size={16} className="mr-1" /> DEMARRER
                                    </Button>
                                  );
                                })()}
                                
                                {challenge.status === 'active' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-pixel"
                                    onClick={() => handleChallengeStatusChange(challenge.id, 'terminée')}
                                  >
                                    <Pause size={16} className="mr-1" /> TERMINER
                                  </Button>
                                )}
                                
                                {challenge.status === 'terminée' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-500 hover:bg-blue-600 text-black font-pixel"
                                    onClick={() => handleChallengeStatusChange(challenge.id, 'en attente')}
                                  >
                                    <RotateCcw size={16} className="mr-1" /> REINITIALISER
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {challenges.filter(
                        (challenge) =>
                          tab === "all" || 
                          (tab === "active" && challenge.status === "active") || 
                          (tab === "en attente" && challenge.status === "en attente") || 
                          (tab === "terminée" && challenge.status === "terminée")
                      ).length === 0 && (
                        <div className="col-span-full py-8 text-center">
                          <p className="text-green-400 font-pixel">
                            Aucun challenge{tab === "all" ? "" : " " + tab} trouvé_
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
              
            </Tabs>
          </div>
        </div>
      )}
        </>
      )}

      {/* Universe Mode */}
      {adminMode === "universes" && (
        <>
        <div className="mb-8">
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-pixel"
            onClick={() => universeManagerRef.current?.openCreator()}
          >
            <PlusCircle className="mr-2" size={18} />
            $ NOUVEL_UNIVERS
          </Button>
        </div>
        <div className="mt-8 bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <UniverseManager ref={universeManagerRef} />
          </div>
        </div>
        </>
      )}

      <AlertDialog open={!!deleteChallengeId} onOpenChange={() => setDeleteChallengeId(null)}>
        <AlertDialogContent className="bg-black border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-pixel">! ATTENTION !</AlertDialogTitle>
            <AlertDialogDescription className="text-red-400 font-mono">
              Cette action supprimera définitivement le challenge, toutes les troupes associées,
              les questions et les scores. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-green-500 text-green-400 hover:bg-green-500/20">
              ANNULER
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChallenge}
              className="bg-red-500 hover:bg-red-600 text-black font-pixel"
            >
              CONFIRMER_SUPPRESSION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRoomsDialog} onOpenChange={setShowRoomsDialog}>
        <DialogContent className="bg-black border-2 border-green-500 sm:max-w-2xl max-h-[85vh]">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="font-pixel text-green-400">
                $ {currentChallengeName} - Troupes
              </DialogTitle>
              <DialogDescription className="text-green-400/80 font-mono">
                Partagez ces liens avec les participants pour rejoindre le challenge.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                  onClick={copyAllRoomsAsTable}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  TOUT_COPIER
                </Button>
              </div>
              {loadingRooms ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-green-400 font-pixel">Chargement des troupes...</p>
                </div>
              ) : challengeRooms.length === 0 ? (
                <p className="text-center text-green-400 font-pixel"> Aucune troupe trouvée_</p>
              ) : (
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {challengeRooms.map((room) => (
                      <div key={room.id} className="border-2 border-green-500/50 rounded-md p-4 bg-black/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{room.sigil || '🏰'}</span>
                            <div>
                              <h3 className="font-pixel text-lg text-green-400">{room.name}</h3>
                              <p className="text-sm text-green-400/70 font-mono italic">{room.motto || 'House Motto'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-green-500 text-green-400 hover:bg-green-500/20 h-8 w-8"
                              onClick={() => copyToClipboard(room.link)}
                              title="Copier le lien vers la troupe"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-green-500 text-green-400 hover:bg-green-500/20 h-8 w-8"
                              asChild
                              title="Ouvrir la troupe"
                            >
                              <a href={room.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline"
                className="w-full border-green-500 text-green-400 hover:bg-green-500/20 font-pixel"
              >
                FERMER
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
