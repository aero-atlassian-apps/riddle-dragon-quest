
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash, Play, Pause, StopCircle } from "lucide-react";
import SessionCreator from "@/components/SessionCreator";
import RoomCreator from "@/components/RoomCreator";
import { Session, Question } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessions, createRoom, deleteSession, updateSessionStatus } from "@/utils/db";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("sessions");
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [roomCreationSessionId, setRoomCreationSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions
  });

  const handleCreateSession = (sessionId: string) => {
    // Refetch the sessions to get the newest one
    refetch().then(() => {
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        setCurrentSession(session);
        setRoomCreationSessionId(session.id);
        setActiveTab("rooms");
        
        toast({
          title: "Session created successfully",
          description: "Now you can create rooms for this session",
        });
      } else {
        // If we can't find the session after refetching, try to use just the ID
        setCurrentSession({
          id: sessionId,
          name: "New Session",
          startTime: new Date(),
          questions: []
        });
        setRoomCreationSessionId(sessionId);
        setActiveTab("rooms");
        
        toast({
          title: "Moving to room creation",
          description: "Create rooms for your new session",
        });
      }
    });
  };

  const handleCreateRooms = async (roomNames: string[]) => {
    if (!roomCreationSessionId) return;
    
    // Create rooms in the database
    for (const roomName of roomNames) {
      const room = await createRoom(roomCreationSessionId, roomName);
      
      if (!room) {
        toast({
          title: "Error creating room",
          description: `Failed to create room: ${roomName}`,
          variant: "destructive",
        });
      }
    }
    
    toast({
      title: "Rooms created successfully",
      description: `${roomNames.length} rooms have been created`,
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session and all associated rooms and questions?")) {
      const success = await deleteSession(sessionId);
      
      if (success) {
        toast({
          title: "Session deleted successfully",
          description: "The session and all associated rooms and questions have been removed",
        });
        
        // Refresh the sessions list
        refetch();
        
        // Clear current session if it's the one we just deleted
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession(null);
          setRoomCreationSessionId(null);
          setActiveTab("sessions");
        }
      } else {
        toast({
          title: "Error deleting session",
          description: "Failed to delete the session",
          variant: "destructive",
        });
      }
    }
  };

  const handleSessionStatusChange = async (sessionId: string, newStatus: 'pending' | 'active' | 'completed') => {
    const success = await updateSessionStatus(sessionId, newStatus);
    
    if (success) {
      toast({
        title: "Session status updated",
        description: `Session is now ${newStatus}`,
      });
      
      // Refresh the sessions list to show the updated status
      refetch();
    } else {
      toast({
        title: "Error updating session status",
        description: `Failed to update session to ${newStatus}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold font-medieval">Admin Dashboard</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="sessions" className="font-medieval">Sessions</TabsTrigger>
            <TabsTrigger value="rooms" disabled={!roomCreationSessionId} className="font-medieval">Houses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-6">
            <SessionCreator onCreateSession={handleCreateSession} />
            
            {sessions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 font-medieval">Existing Sessions</h2>
                
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id} className="border-dragon-gold/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg font-medieval flex justify-between items-center">
                          {session.name}
                          <div className="flex space-x-2">
                            {session.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSessionStatusChange(session.id, 'active')}
                                className="font-medieval bg-green-50 hover:bg-green-100 text-green-700"
                              >
                                <Play className="h-4 w-4 mr-1" /> Start
                              </Button>
                            )}
                            
                            {session.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSessionStatusChange(session.id, 'completed')}
                                className="font-medieval bg-gray-50 hover:bg-gray-100 text-gray-700"
                              >
                                <StopCircle className="h-4 w-4 mr-1" /> End
                              </Button>
                            )}
                            
                            {session.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSessionStatusChange(session.id, 'active')}
                                className="font-medieval bg-blue-50 hover:bg-blue-100 text-blue-700"
                              >
                                <Play className="h-4 w-4 mr-1" /> Restart
                              </Button>
                            )}
                            
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleDeleteSession(session.id);
                              }}
                              className="font-medieval"
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">
                              Created: {session.startTime.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Questions: {session.questions.length}
                            </p>
                            <div className={`text-sm px-2 py-1 rounded-full inline-block mt-1 ${getStatusBadgeColor(session.status || 'pending')}`}>
                              {session.status || 'pending'}
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setCurrentSession(session);
                              setRoomCreationSessionId(session.id);
                              setActiveTab("rooms");
                            }}
                            className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
                          >
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rooms">
            {roomCreationSessionId && (
              <RoomCreator
                sessionId={roomCreationSessionId}
                onCreateRooms={handleCreateRooms}
                onContinue={() => {}}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
