import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Play, Pause, RotateCcw, ExternalLink, Copy, X } from "lucide-react";
import SessionCreator from "@/components/SessionCreator";
import QuestionUploader from "@/components/QuestionUploader";
import QuestionManager from "@/components/QuestionManager";
import RoomCreator from "@/components/RoomCreator";
import { getSessions, deleteSession, updateSessionStatus } from "@/utils/db";
import { Session, Question, Room } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creationStep, setCreationStep] = useState<"session" | "questions" | "images" | "rooms">("session");
  const [roomCreationSessionId, setRoomCreationSessionId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomsDialog, setShowRoomsDialog] = useState(false);
  const [sessionRooms, setSessionRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [currentSessionName, setCurrentSessionName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    const fetchedSessions = await getSessions();
    setSessions(fetchedSessions);
    setIsLoading(false);
  };

  const handleCreateSession = async (sessionId: string) => {
    setRoomCreationSessionId(sessionId);
    setCreationStep("questions");
    // Refresh sessions to include the newly created session
    await fetchSessions();
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
    setCreationStep("session");
    setRoomCreationSessionId(null);
    fetchSessions();
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeleteSessionId(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;

    const success = await deleteSession(deleteSessionId);
    
    if (success) {
      setSessions((prevSessions) => prevSessions.filter((s) => s.id !== deleteSessionId));
      toast({
        title: "Session deleted",
        description: "The session has been successfully deleted",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the session",
        variant: "destructive",
      });
    }
    
    setDeleteSessionId(null);
  };

  const cancelDeleteSession = () => {
    setDeleteSessionId(null);
  };

  const handleSessionStatusChange = async (sessionId: string, status: 'en attente' | 'active' | 'terminée') => {
    const success = await updateSessionStatus(sessionId, status);
    
    if (success) {
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, status } : session
      ));
      
      const statusMessage = status === 'active' ? 'started' : status === 'terminée' ? 'ended' : 'reset';
      
      toast({
        title: `Session ${statusMessage}`,
        description: `The session has been ${statusMessage} successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to ${status === 'active' ? 'start' : status === 'terminée' ? 'end' : 'reset'} the session`,
        variant: "destructive",
      });
    }
  };

  const handleViewRooms = async (sessionId: string) => {
    setLoadingRooms(true);
    setShowRoomsDialog(true);
    
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSessionName(session.name);
      }
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('session_id', sessionId);
      
      if (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Error",
          description: "Failed to fetch rooms for this session",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        const formattedRooms = data.map(room => ({
          id: room.id,
          sessionId: room.session_id,
          name: room.name,
          tokensLeft: room.tokens_left,
          currentDoor: room.current_door,
          score: room.score,
          sigil: room.sigil,
          motto: room.motto,
          link: `${window.location.origin}/game/room/${room.id}`
        }));
        
        setSessionRooms(formattedRooms);
      } else {
        setSessionRooms([]);
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
    const tableContent = sessionRooms
      .map(room => `${room.name}\t${room.sigil || '🏰'}\t${room.motto || 'House Motto'}\t${room.link}`)
      .join('\n');
    const header = "Room Name\tSigil\tMotto\tLink\n";
    navigator.clipboard.writeText(header + tableContent);
    toast({
      title: "Rooms List Copied",
      description: "All rooms information copied as table",
    });
  };

  return (
    <div className="container mx-auto p-4 relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-[url('/textures/stone-pattern.svg')] bg-repeat bg-opacity-50 before:absolute before:inset-0 before:bg-[url('/terminal-bg.png')] before:opacity-10 before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
      <div className="mb-8 text-center p-6 bg-black/90 border-2 border-green-500 rounded-lg font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-medieval mb-6 text-green-400">Espace du Maître des Jeux</h1>
          <div className="flex items-center justify-center mb-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2" />
            <h3 className="text-2xl text-green-500 font-pixel glitch">[ CONSOLE DE CONTRÔLE ]</h3>
          </div>
          <p className="text-green-400 font-pixel typing-effect">$ Système initialisé et prêt à recevoir des commandes...</p>
        </div>
      </div>

      {showCreateForm ? (
        <div className="mb-8 bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold font-medieval text-green-400">$ INITIALISER_NOUVELLE_SESSION</h2>
              <Button
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/20"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreationStep("session");
                  setRoomCreationSessionId(null);
                }}
              >
                <X className="mr-2" size={18} />
                ANNULER
              </Button>
            </div>

            {creationStep === "session" && (
              <SessionCreator onCreateSession={handleCreateSession} />
            )}
            
            {creationStep === "questions" && roomCreationSessionId && (
              <QuestionUploader
                sessionId={roomCreationSessionId}
                onUpload={handleUploadQuestions}
              />
            )}
            
            {creationStep === "images" && roomCreationSessionId && (
              <QuestionManager
                sessionId={roomCreationSessionId}
                onComplete={handleQuestionsWithImagesComplete}
              />
            )}
            
            {creationStep === "rooms" && roomCreationSessionId && (
              <RoomCreator
                sessionId={roomCreationSessionId}
                onCreateRooms={handleCreateRooms}
                onContinue={handleFinishCreation}
hintEnabled={sessions.find(s => s.id === roomCreationSessionId)?.hintEnabled ?? true}
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
            $ NOUVELLE_SESSION
          </Button>
        </div>
      )}

      {!showCreateForm && (
        <div className="mt-8 bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full mb-6 font-pixel bg-black border-2 border-green-500">
                <TabsTrigger value="all" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  TOUTES_SESSIONS
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  SESSIONS_ACTIVES
                </TabsTrigger>
                <TabsTrigger value="en attente" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  SESSIONS_EN_ATTENTE
                </TabsTrigger>
                <TabsTrigger value="terminée" className="flex-1 text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  SESSIONS_TERMINEES
                </TabsTrigger>
              </TabsList>

              {["all", "active", "en attente", "terminée"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-8 text-green-400 font-pixel">
                      <span className="animate-pulse">Chargement des sessions...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessions
                        .filter((session) => 
                          tab === "all" || 
                          (tab === "active" && session.status === "active") || 
                          (tab === "en attente" && session.status === "en attente") || 
                          (tab === "terminée" && session.status === "terminée")
                        )
                        .map((session) => (
                          <div
                            key={session.id}
                            className="bg-black/90 border-2 border-green-500 rounded-lg p-4 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
                            <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold font-pixel text-green-400">
                                  $ {session.name}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:bg-red-500/20"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>

                              <div className="text-sm text-green-400/80 font-mono mb-4 space-y-1">
                                <div>
                                  Créée le: {new Date(session.startTime).toLocaleString()}
                                </div>
                                <div>
                                  Questions: {session.questions?.length || 0}
                                </div>
                                <div>
                                  Statut: <span className="font-semibold uppercase">{session.status}</span>
                                </div>
                              </div>

                              <div className="flex space-x-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                                  onClick={() => handleViewRooms(session.id)}
                                >
                                  <ExternalLink size={16} className="mr-1" /> VOIR_TROUPES
                                </Button>
                                
                                {session.status === 'en attente' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500 hover:bg-green-600 text-black font-pixel"
                                    onClick={() => handleSessionStatusChange(session.id, 'active')}
                                  >
                                    <Play size={16} className="mr-1" /> DEMARRER
                                  </Button>
                                )}
                                
                                {session.status === 'active' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-pixel"
                                    onClick={() => handleSessionStatusChange(session.id, 'terminée')}
                                  >
                                    <Pause size={16} className="mr-1" /> TERMINER
                                  </Button>
                                )}
                                
                                {session.status === 'terminée' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-500 hover:bg-blue-600 text-black font-pixel"
                                    onClick={() => handleSessionStatusChange(session.id, 'en attente')}
                                  >
                                    <RotateCcw size={16} className="mr-1" /> REINITIALISER
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {sessions.filter(
                        (session) =>
                          tab === "all" || 
                          (tab === "active" && session.status === "active") || 
                          (tab === "en attente" && session.status === "en attente") || 
                          (tab === "terminée" && session.status === "terminée")
                      ).length === 0 && (
                        <div className="col-span-full py-8 text-center">
                          <p className="text-green-400 font-pixel">
                            Aucune session{tab === "all" ? "" : " " + tab} trouvée_
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

      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent className="bg-black border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-pixel">! ATTENTION !</AlertDialogTitle>
            <AlertDialogDescription className="text-red-400 font-mono">
              Cette action supprimera définitivement la session, toutes les troupes associées,
              les questions et les scores. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-green-500 text-green-400 hover:bg-green-500/20">
              ANNULER
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSession}
              className="bg-red-500 hover:bg-red-600 text-black font-pixel"
            >
              CONFIRMER_SUPPRESSION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRoomsDialog} onOpenChange={setShowRoomsDialog}>
        <DialogContent className="bg-black border-2 border-green-500 sm:max-w-md">
          <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
          <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="font-pixel text-green-400">
                $ {currentSessionName} - Troupes
              </DialogTitle>
              <DialogDescription className="text-green-400/80 font-mono">
                Partagez ces liens avec les participants pour rejoindre la session de jeu.
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
              ) : sessionRooms.length === 0 ? (
                <p className="text-center text-green-400 font-pixel"> Aucune troupe trouvée_</p>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4">
                    {sessionRooms.map((room) => (
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
