
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
          title: "Échec du téléchargement",
          description: "Échec du téléchargement de l'image",
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
          title: "Image téléchargée",
          description: "Image de la question téléchargée avec succès",
        });
      } else {
        toast({
          title: "Échec de la mise à jour",
          description: "Échec de la mise à jour de la question avec l'URL de l'image",
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
      <div className="max-w-4xl mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="relative z-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-6 text-center font-pixel text-green-400">$ GERER_IMAGES_QUESTIONS</h2>
        
        <div className="space-y-8">
          {questions.length === 0 ? (
            <p className="text-center text-green-400/70 font-mono">$ AUCUNE_QUESTION_TROUVEE_</p>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="border-2 border-green-500/30 rounded-md p-5 bg-black/50">
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <h3 className="font-mono text-lg mb-2 text-green-400">$ QUESTION_{index + 1}</h3>
                    <p className="mb-2 text-green-400/90 font-mono whitespace-pre-line">{question.text}</p>
                    <p className="text-sm text-green-400/70 font-mono">$ REPONSE: <span className="font-semibold text-green-400">{question.answer}</span></p>
                    {question.prize && (
                      <p className="text-sm text-amber-400/80 font-mono">$ PRIX: <span className="font-semibold text-amber-400">{question.prize}</span></p>
                    )}
                  </div>
                  
                  <div className="w-32 h-32 border-2 border-dashed border-green-500/40 rounded-md relative flex flex-col items-center justify-center bg-black/30">
                    {question.image ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={question.image} 
                          alt={`Image for question ${index + 1}`} 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute top-1 right-1 bg-green-500/20 rounded-full p-1">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                      </div>
                    ) : uploading[question.id] ? (
                      <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                    ) : (
                      <Label 
                        htmlFor={`image-upload-${question.id}`} 
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                      >
                        <ImageIcon className="h-8 w-8 text-green-400/60 mb-1" />
                        <span className="text-xs text-center text-green-400/60 font-mono">TELECHARGER_IMAGE</span>
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
            className="bg-green-500 hover:bg-green-600 text-black font-pixel"
          >
            {allQuestionsHaveImages ? '$ CONTINUER' : '$ PASSER_TELECHARGEMENT'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
