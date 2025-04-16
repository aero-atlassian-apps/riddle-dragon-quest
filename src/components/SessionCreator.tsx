
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SessionCreatorProps {
  onCreateSession: (sessionName: string, questionsFile: File) => void;
}

const SessionCreator: React.FC<SessionCreatorProps> = ({ onCreateSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      return;
    }
    
    if (!questionsFile) {
      setFileError('Please upload a questions file');
      return;
    }
    
    onCreateSession(sessionName, questionsFile);
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
              disabled={!sessionName.trim() || !questionsFile}
            >
              Create Session
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
