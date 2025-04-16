
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Question } from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Image as ImageIcon, Check, X } from 'lucide-react';
import { getSessionQuestions, uploadQuestionImage, updateQuestionImage } from '@/utils/db';

interface QuestionManagerProps {
  sessionId: string;
  onComplete: () => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ sessionId, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const fetchedQuestions = await getSessionQuestions(sessionId);
      setQuestions(fetchedQuestions);
      setLoading(false);
    };
    
    fetchQuestions();
  }, [sessionId]);

  const handleImageUpload = async (questionId: number, file: File) => {
    setUploading(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const imageUrl = await uploadQuestionImage(file, questionId);
      
      if (!imageUrl) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }
      
      const success = await updateQuestionImage(questionId, imageUrl);
      
      if (success) {
        setQuestions(questions.map(q => 
          q.id === questionId 
            ? { ...q, image: imageUrl } 
            : q
        ));
        
        toast({
          title: "Image uploaded",
          description: "Question image uploaded successfully",
        });
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update question with image URL",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const allQuestionsHaveImages = questions.every(q => q.image);

  if (loading) {
    return (
      <div className="parchment max-w-4xl mx-auto p-6">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-dragon-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="parchment max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center font-medieval">Manage Question Images</h2>
      
      <div className="space-y-8">
        {questions.length === 0 ? (
          <p className="text-center text-gray-500 font-medieval">No questions found for this session.</p>
        ) : (
          questions.map((question, index) => (
            <div key={question.id} className="border-2 border-dragon-gold/30 rounded-md p-5 bg-dragon-scroll/20">
              <div className="flex items-start gap-4">
                <div className="flex-grow">
                  <h3 className="font-medieval text-lg mb-2">Question {index + 1}</h3>
                  <p className="mb-2">{question.text}</p>
                  <p className="text-sm text-gray-500">Answer: <span className="font-semibold">{question.answer}</span></p>
                </div>
                
                <div className="w-32 h-32 border-2 border-dashed border-dragon-gold/40 rounded-md relative flex flex-col items-center justify-center">
                  {question.image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={question.image} 
                        alt={`Image for question ${index + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute top-1 right-1 bg-green-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ) : uploading[question.id] ? (
                    <Loader2 className="h-6 w-6 animate-spin text-dragon-primary" />
                  ) : (
                    <Label 
                      htmlFor={`image-upload-${question.id}`} 
                      className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs text-center text-gray-500">Upload image</span>
                      <Input
                        id={`image-upload-${question.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(question.id, e.target.files[0]);
                          }
                        }}
                      />
                    </Label>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={onComplete}
          className="bg-dragon-primary hover:bg-dragon-secondary font-medieval"
        >
          {allQuestionsHaveImages ? 'Continue' : 'Skip Image Upload'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionManager;
