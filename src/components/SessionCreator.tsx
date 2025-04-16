import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { createSession, addQuestionsToSession } from '@/utils/db';
import { useToast } from '@/components/ui/use-toast';
import { Question } from '@/types/game';
import { Loader2 } from 'lucide-react';

interface SessionCreatorProps {
  onCreateSession: (sessionId: string) => void;
}

const SessionCreator: React.FC<SessionCreatorProps> = ({ onCreateSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type !== 'application/json') {
        setFileError('Please upload a JSON file');
        setQuestionsFile(null);
        return;
      }
      
      setQuestionsFile(file);
      setFileError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      toast({
        title: "Error",
        description: "Session name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (!questionsFile) {
      setFileError('Please upload a questions file');
      return;
    }

    setIsLoading(true);

    try {
      // Create session
      const session = await createSession(sessionName);
      
      if (!session) {
        toast({
          title: "Error",
          description: "Failed to create session",
          variant: "destructive",
        });
        return;
      }

      // Read and parse questions file
      const fileContent = await questionsFile.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(fileContent);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON format in uploaded file",
          variant: "destructive",
        });
        return;
      }
      
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        toast({
          title: "Error",
          description: "Invalid JSON format: missing questions array",
          variant: "destructive",
        });
        return;
      }

      // Add questions to session
      const success = await addQuestionsToSession(session.id, parsedData.questions);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to add questions",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Session created successfully",
      });
      
      // Reset form
      setSessionName('');
      setQuestionsFile(null);
      
      // Notify parent component with the session ID
      onCreateSession(session.id);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="parchment max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Create New Session</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              placeholder="e.g. Marketing Team Building"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              className="border-dragon-gold/30"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="questions-file">Upload Questions (JSON)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="questions-file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="border-dragon-gold/30"
                disabled={isLoading}
              />
            </div>
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
            
            <p className="text-sm text-gray-500 mt-1">
              Upload a JSON file with questions in the required format
            </p>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-dragon-primary hover:bg-dragon-secondary"
              disabled={isLoading || !sessionName.trim() || !questionsFile}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </div>
      </form>
      
      <div className="mt-6 border-t border-dragon-gold/30 pt-4">
        <h3 className="text-sm font-medium mb-2">JSON Format Example:</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "id": 1,
      "text": "What has keys but can't open locks?",
      "image": "piano.jpg",
      "answer": "piano"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default SessionCreator;
