
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Question } from '../types/game';
import { useToast } from '@/components/ui/use-toast';
import { addQuestionsToSession } from '@/utils/db';
import { Loader2 } from 'lucide-react';

interface QuestionUploaderProps {
  sessionId: string;
  onUpload: (questions: Question[]) => void;
}

const QuestionUploader: React.FC<QuestionUploaderProps> = ({ sessionId, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);

    try {
      const fileContent = await file.text();
      const parsedData = JSON.parse(fileContent);
      
      // Validate the structure of the JSON data
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        setError('Invalid JSON format: missing "questions" array');
        setIsLoading(false);
        return;
      }
      
      // Validate each question
      for (const question of parsedData.questions) {
        if (!question.text || !question.answer) {
          setError('Invalid question format: each question must have text and answer fields');
          setIsLoading(false);
          return;
        }
      }

      // Format questions to be stored in the database (explicitly excluding image field)
      const questionsToAdd = parsedData.questions.map((q: any) => ({
        text: q.text,
        answer: q.answer
      }));
      
      // Store questions in the database
      const success = await addQuestionsToSession(sessionId, questionsToAdd);
      
      if (success) {
        toast({
          title: "Questions uploaded successfully",
          description: `${questionsToAdd.length} questions have been added to the session`,
        });
        
        // Pass the questions to the parent component
        onUpload(questionsToAdd.map((q: any, index: number) => ({ 
          id: index + 1, // Temporary ID until we get real IDs from database
          ...q 
        })));
        
        // Reset file input
        setFile(null);
        if (document.getElementById('question-file') as HTMLInputElement) {
          (document.getElementById('question-file') as HTMLInputElement).value = '';
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to store questions in the database",
          variant: "destructive",
        });
      }
      
    } catch (err) {
      setError('Failed to parse JSON file. Please check the format.');
      toast({
        title: "Error",
        description: "Failed to parse JSON file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto parchment">
      <h2 className="text-xl font-bold mb-6 text-center font-medieval">Upload Questions</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question-file" className="font-medieval">Questions JSON File</Label>
          <Input
            id="question-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="border-dragon-gold/30"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isLoading}
            className="w-full bg-dragon-primary hover:bg-dragon-secondary font-medieval"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Questions'
            )}
          </Button>
        </div>
      </div>
      
      <div className="mt-6 border-t border-dragon-gold/30 pt-4">
        <h3 className="text-sm font-medium mb-2 font-medieval">Expected JSON Format:</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "text": "What has keys but can't open locks?",
      "answer": "piano"
    },
    {
      "text": "What gets wetter as it dries?",
      "answer": "towel"
    }
  ]
}`}
        </pre>
        <p className="mt-2 text-xs text-gray-500">
          Note: You can add images to questions in the next step.
        </p>
      </div>
    </div>
  );
};

export default QuestionUploader;
