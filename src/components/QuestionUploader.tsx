
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Question } from '../types/game';
import { useToast } from '@/components/ui/use-toast';
import { addQuestionsToChallenge } from '@/utils/db';
import { Loader2 } from 'lucide-react';

interface QuestionUploaderProps {
  challengeId: string;
  onUpload: (questions: Question[]) => void;
  onClose?: () => void;
  universeContext?: boolean; // New prop to indicate if this is used in universe context
}

const QuestionUploader: React.FC<QuestionUploaderProps> = ({ challengeId, onUpload, onClose, universeContext = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedQuestionsCount, setUploadedQuestionsCount] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier à télécharger');
      return;
    }

    setIsLoading(true);

    try {
      const fileContent = await file.text();
      const parsedData = JSON.parse(fileContent);
      
      // Validate the structure of the JSON data
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        setError('Format JSON invalide : tableau "questions" manquant');
        setIsLoading(false);
        return;
      }
      
      // Validate each question
      for (const question of parsedData.questions) {
        if (!question.text || !question.answer || typeof question.text !== 'string' || typeof question.answer !== 'string') {
          setError('Format de question invalide : chaque question doit avoir un texte et une réponse sous forme de chaînes de caractères');
          setIsLoading(false);
          return;
        }
        
        // Validate optional fields
        if (question.hint && typeof question.hint !== 'string') {
          setError('Format de question invalide : l\'indice doit être une chaîne de caractères');
          setIsLoading(false);
          return;
        }
        
        if (question.style && typeof question.style !== 'string') {
          setError('Format de question invalide : le style doit être une chaîne de caractères');
          setIsLoading(false);
          return;
        }

        if (question.points && typeof question.points !== 'number') {
          setError('Format de question invalide : les points doivent être un nombre');
          setIsLoading(false);
          return;
        }
        
        if (question.prize && typeof question.prize !== 'string') {
          setError('Format de question invalide : le prix doit être une chaîne de caractères');
          setIsLoading(false);
          return;
        }
      }

      // Format questions to be stored in the database (explicitly excluding image field)
      // Track used door numbers to ensure uniqueness
      const usedDoorNumbers = new Set<number>();
      const questionsToAdd = parsedData.questions.map((q: any, index: number) => {
        // Use provided door_number if valid, otherwise assign sequentially
        let doorNumber = q.door_number;
        if (!doorNumber || typeof doorNumber !== 'number' || doorNumber < 1) {
          // Find the next available door number
          doorNumber = index + 1;
          while (usedDoorNumbers.has(doorNumber)) {
            doorNumber++;
          }
        }

        // Validate door number is unique within this batch
        if (usedDoorNumbers.has(doorNumber)) {
          setError(`Numéro de porte en double trouvé : ${doorNumber}`);
          setIsLoading(false);
          return null; // This will be filtered out
        }
        usedDoorNumbers.add(doorNumber);

        return {
          text: q.text,
          answer: q.answer,
          door_number: doorNumber,
          hint: q.hint || null,
          style: q.style || null,
          points: q.points || 1, // Default to 1 point if not specified
          prize: q.prize || null
        };
      }).filter(q => q !== null); // Filter out any null entries from duplicate errors

      // Check if we had any duplicate errors
      if (questionsToAdd.length !== parsedData.questions.length) {
        return; // Error already set above
      }
      
      // Store questions in the database
      const success = await addQuestionsToChallenge(challengeId, questionsToAdd);
      
      if (success) {
        toast({
          title: "Questions téléchargées avec succès",
          description: `${questionsToAdd.length} questions ont été ajoutées au challenge`,
        });
        
        // Pass the questions to the parent component
        if (typeof onUpload === 'function') {
          onUpload(questionsToAdd.map((q: any, index: number) => ({ 
            id: index + 1, // Temporary ID until we get real IDs from database
            ...q 
          })));
        }
        
        // Set success state
        setUploadSuccess(true);
        setUploadedQuestionsCount(questionsToAdd.length);
        
        // Reset file input
        setFile(null);
        if (document.getElementById('question-file') as HTMLInputElement) {
          (document.getElementById('question-file') as HTMLInputElement).value = '';
        }
      } else {
        setError("Échec de l'enregistrement des questions dans la base de données. Vérifiez les numéros de porte.");
        toast({
          title: "Erreur",
          description: "Échec de l'enregistrement des questions dans la base de données. Vérifiez les numéros de porte.",
          variant: "destructive",
        });
      }
      
    } catch (err) {
      console.error('Error in question upload:', err);
      setError('Échec de l\'analyse du fichier JSON. Veuillez vérifier le format.');
      toast({
        title: "Erreur",
        description: "Échec de l'analyse du fichier JSON",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAnother = () => {
    setUploadSuccess(false);
    setUploadedQuestionsCount(0);
    setError(null);
  };

  // Show success state after upload
  if (uploadSuccess) {
    return (
      <div className="max-w-md mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
        <div className="relative z-10">
          <div className="text-center space-y-4">
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-center font-pixel text-green-400">$ UPLOAD_REUSSI</h2>
            <p className="text-green-400/70 font-mono text-sm">
              {uploadedQuestionsCount} questions ont été ajoutées avec succès au challenge
            </p>
            
            <div className="space-y-3 pt-4">
              {!universeContext && (
                <Button 
                  onClick={handleUploadAnother}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-pixel"
                >
                  $ TELECHARGER_AUTRES_QUESTIONS
                </Button>
              )}
              
              {onClose ? (
                <Button 
                  onClick={onClose}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
                >
                  $ FERMER
                </Button>
              ) : (
                <Button 
                  onClick={handleUploadAnother}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
                >
                  $ FERMER
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-black/90 border-2 border-green-500 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-6 text-center font-pixel text-green-400">$ TELECHARGER_QUESTIONS</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question-file" className="font-mono text-green-400">$ FICHIER_QUESTIONS:</Label>
            <Input
              id="question-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="bg-black/50 border-green-500/50 text-green-400 font-mono focus:border-green-400 focus:ring-green-400/20"
              disabled={isLoading}
            />
            {error && <p className="text-red-500 font-mono text-sm">{error}</p>}
          </div>
          
          <div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  TELECHARGEMENT...
                </>
              ) : (
                '$ TELECHARGER_QUESTIONS'
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-green-500/30 pt-4">
          <h3 className="text-sm font-medium mb-2 font-mono text-green-400">$ FORMAT_ATTENDU:</h3>
          <pre className="text-xs bg-black/50 border border-green-500/30 p-2 rounded overflow-x-auto text-green-400 font-mono">
{`{
  "questions": [
    {
      "text": "Qu'est-ce qui a des touches mais ne peut pas ouvrir de serrures ?",
      "answer": "piano",
      "door_number": 1, // Optionnel : les numéros de porte seront attribués automatiquement si non fournis
      "points": 2, // Optionnel : nombre de points pour la question (par défaut: 1)
      "hint": "Pensez aux instruments de musique", // Optionnel : indice pour la question
      "style": "enigme", // Optionnel : style de la question
      "prize": "Clé Musicale" // Optionnel : prix obtenu en réussissant la question
    },
    {
      "text": "Qu'est-ce qui devient plus mouillé en séchant ?",
      "answer": "serviette",
      "hint": "Pensez aux objets du quotidien",
      "style": "logique",
      "prize": "Serviette Magique"
    }
  ]
}`}
          </pre>
          <p className="mt-2 text-xs text-gray-500">
            Note : Vous pourrez ajouter des images aux questions à l'étape suivante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionUploader;
