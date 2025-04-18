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

  const handleCreateSession = (sessionId: string) => {
    setRoomCreationSessionId(sessionId);
    setCreationStep("questions");
  };

  const handleUploadQuestions = (questions: Question[]) => {
    setCreationStep("images"); // Add new step for image management
  };

  const handleQuestionsWithImagesComplete = () => {
    setCreationStep("rooms");
  };

  const handleCreateRooms = async (roomNames: string[]) => {
    // Note: Room creation is now handled directly in the RoomCreator component
    
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

  const handleSessionStatusChange = async (sessionId: string, status: 'pending' | 'active' | 'completed') => {
    const success = await updateSessionStatus(sessionId, status);
    
    if (success) {
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, status } : session
      ));
      
      const statusMessage = status === 'active' ? 'started' : status === 'completed' ? 'ended' : 'reset';
      
      toast({
        title: `Session ${statusMessage}`,
        description: `The session has been ${statusMessage} successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to ${status === 'active' ? 'start' : status === 'completed' ? 'end' : 'reset'} the session`,
        variant: "destructive",
      });
    }
  };

  const handleViewRooms = async (sessionId: string) => {
    setLoadingRooms(true);
    setShowRoomsDialog(true);
    
    try {
      // Find the session name
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSessionName(session.name);
      }
      
      // Fetch rooms for this session
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 font-medieval">Dragon Master Dashboard</h1>

      {showCreateForm ? (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold font-medieval">Create New Game Session</h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setCreationStep("session");
                setRoomCreationSessionId(null);
              }}
            >
              Cancel
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
            />
          )}
        </div>
      ) : (
        <div className="mb-8">
          <Button
            className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusCircle className="mr-2" size={18} />
            Create New Session
          </Button>
        </div>
      )}

      {!showCreateForm && (
        <div className="mt-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full mb-6 font-medieval">
              <TabsTrigger value="all" className="flex-1">
                All Sessions
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active Sessions
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                Pending Sessions
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed Sessions
              </TabsTrigger>
            </TabsList>

            {["all", "active", "pending", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8">Loading sessions...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions
                      .filter((session) => 
                        tab === "all" || 
                        (tab === "active" && session.status === "active") || 
                        (tab === "pending" && session.status === "pending") || 
                        (tab === "completed" && session.status === "completed")
                      )
                      .map((session) => (
                        <div
                          key={session.id}
                          className="bg-white border-2 border-dragon-gold/30 rounded-lg p-4 shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold font-medieval text-dragon-primary">
                              {session.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-red-500"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>

                          <div className="text-sm text-gray-500 mb-4">
                            <div>
                              Created: {new Date(session.startTime).toLocaleString()}
                            </div>
                            <div>
                              Questions: {session.questions?.length || 0}
                            </div>
                            <div>
                              Status: <span className="font-semibold capitalize">{session.status}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-dragon-gold/30 hover:bg-dragon-accent/10"
                              onClick={() => handleViewRooms(session.id)}
                            >
                              <ExternalLink size={16} className="mr-1" /> View Rooms
                            </Button>
                            
                            {session.status === 'pending' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleSessionStatusChange(session.id, 'active')}
                              >
                                <Play size={16} className="mr-1" /> Start
                              </Button>
                            )}
                            
                            {session.status === 'active' && (
                              <Button 
                                size="sm" 
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => handleSessionStatusChange(session.id, 'completed')}
                              >
                                <Pause size={16} className="mr-1" /> End
                              </Button>
                            )}
                            
                            {session.status === 'completed' && (
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSessionStatusChange(session.id, 'pending')}
                              >
                                <RotateCcw size={16} className="mr-1" /> Reset
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                    {sessions.filter(
                      (session) =>
                        tab === "all" || 
                        (tab === "active" && session.status === "active") || 
                        (tab === "pending" && session.status === "pending") || 
                        (tab === "completed" && session.status === "completed")
                    ).length === 0 && (
                      <div className="col-span-full py-8 text-center">
                        <p className="text-gray-500">
                          No {tab === "all" ? "" : tab + " "} sessions found.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session, all associated rooms,
              questions, and scores. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteSession}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSession}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRoomsDialog} onOpenChange={setShowRoomsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medieval">{currentSessionName} - Room Links</DialogTitle>
            <DialogDescription>
              Share these links with participants to join the game session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loadingRooms ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-dragon-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading rooms...</p>
              </div>
            ) : sessionRooms.length === 0 ? (
              <p className="text-center text-gray-500">No rooms found for this session.</p>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  {sessionRooms.map((room) => (
                    <div key={room.id} className="border-2 border-dragon-gold/30 rounded-md p-4 bg-dragon-scroll/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medieval text-lg text-dragon-primary">{room.name}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 border-dragon-gold/30"
                          asChild
                        >
                          <a href={room.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            <span className="ml-2">Open</span>
                          </a>
                        </Button>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 border-dragon-gold/30"
                          onClick={() => copyToClipboard(room.link)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="ml-2">Copy Link</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
