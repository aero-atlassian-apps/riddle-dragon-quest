import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SessionCreator from "@/components/SessionCreator";
import RoomCreator from "@/components/RoomCreator";
import QuestionUploader from "@/components/QuestionUploader";
import { Session, Question } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessions } from "@/utils/db";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("sessions");
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [roomCreationSessionId, setRoomCreationSessionId] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions
  });

  const handleCreateSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setRoomCreationSessionId(session.id);
      setActiveTab("rooms");
    }
  };

  const handleCreateRooms = (roomNames: string[]) => {
    // In a real app, these would be created in Supabase
    console.log("Creating rooms:", roomNames, "for session:", roomCreationSessionId);
    
    // After creating rooms, move to the questions tab
    setActiveTab("questions");
  };

  const handleUploadQuestions = (questions: Question[]) => {
    if (!currentSession) return;
    
    // In a real app, these would be stored in Supabase
    console.log("Uploaded questions for session:", currentSession.id, questions);
    
    // Update the current session with the questions
    const updatedSession = {
      ...currentSession,
      questions,
    };
    
    setCurrentSession(updatedSession);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      )
    );
    
    // Show success message or redirect
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
          
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="rooms" disabled={!roomCreationSessionId}>Rooms</TabsTrigger>
            <TabsTrigger value="questions" disabled={!currentSession}>Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-6">
            <SessionCreator onCreateSession={handleCreateSession} />
            
            {sessions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Existing Sessions</h2>
                
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id} className="border-dragon-gold/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-500">
                            Created: {session.startTime.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Questions: {session.questions.length}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setCurrentSession(session);
                            setRoomCreationSessionId(session.id);
                            setActiveTab("rooms");
                          }}
                        >
                          Manage
                        </Button>
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
              />
            )}
          </TabsContent>
          
          <TabsContent value="questions">
            <QuestionUploader onUpload={handleUploadQuestions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
