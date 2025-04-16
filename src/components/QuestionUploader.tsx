
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Question } from '../types/game';

interface QuestionUploaderProps {
  onUpload: (questions: Question[]) => void;
}

const QuestionUploader: React.FC<QuestionUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const fileContent = await file.text();
      const parsedData = JSON.parse(fileContent);
      
      // Validate the structure of the JSON data
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        setError('Invalid JSON format: missing "questions" array');
        return;
      }
      
      // Validate each question
      for (const question of parsedData.questions) {
        if (!question.id || !question.text || !question.answer) {
          setError('Invalid question format: each question must have id, text, and answer fields');
          return;
        }
      }
      
      onUpload(parsedData.questions);
      
    } catch (err) {
      setError('Failed to parse JSON file. Please check the format.');
    }
  };

  return (
    <div className="max-w-md mx-auto parchment">
      <h2 className="text-xl font-bold mb-6 text-center">Upload Questions</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question-file">Questions JSON File</Label>
          <Input
            id="question-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="border-dragon-gold/30"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <div>
          <Button 
            onClick={handleUpload} 
            disabled={!file}
            className="w-full bg-dragon-primary hover:bg-dragon-secondary"
          >
            Upload Questions
          </Button>
        </div>
      </div>
      
      <div className="mt-6 border-t border-dragon-gold/30 pt-4">
        <h3 className="text-sm font-medium mb-2">Expected JSON Format:</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "id": 1,
      "text": "What has keys but can't open locks?",
      "image": "piano.jpg",
      "answer": "piano"
    },
    {
      "id": 2,
      "text": "What gets wetter as it dries?",
      "answer": "towel"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default QuestionUploader;
