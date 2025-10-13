import React, { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { BookOpen, Upload } from 'lucide-react';

// Import existing components
import SessionCreator from './SessionCreator';
import QuestionUploader from './QuestionUploader';

interface SessionCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  universeId: string;
  universeName: string;
  onSessionCreated: () => void;
}

const SessionCreatorModal: React.FC<SessionCreatorModalProps> = ({
  isOpen,
  onClose,
  universeId,
  universeName,
  onSessionCreated
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'session' | 'questions'>('session');
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const handleSessionCreated = (sessionId: string) => {
    setCreatedSessionId(sessionId);
    setStep('questions');
    toast({
      title: "Session créée!",
      description: "Maintenant, ajoutez des questions à votre session.",
    });
  };

  const handleQuestionsUploaded = () => {
    onSessionCreated();
    handleClose();
    toast({
      title: "Session complète!",
      description: "Votre session et ses questions ont été créées avec succès.",
    });
  };

  const handleClose = () => {
    setStep('session');
    setCreatedSessionId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-green-500" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 font-pixel">
            {step === 'session' ? '$ CRÉER_SESSION' : '$ AJOUTER_QUESTIONS'}
          </DialogTitle>
          <p className="text-green-300 font-mono">
            Univers: {universeName}
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'session' ? 'text-green-400' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'session' ? 'border-green-400 bg-green-400/20' : 'border-green-600 bg-green-600'
              }`}>
                {step === 'questions' ? <BookOpen className="w-4 h-4" /> : '1'}
              </div>
              <span className="font-mono">Session</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-600"></div>
            <div className={`flex items-center space-x-2 ${step === 'questions' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'questions' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'
              }`}>
                <Upload className="w-4 h-4" />
              </div>
              <span className="font-mono">Questions</span>
            </div>
          </div>

          {step === 'session' && (
            <SessionCreator
              universeId={universeId}
              onCreateSession={handleSessionCreated}
            />
          )}

          {step === 'questions' && createdSessionId && (
            <div className="space-y-4">
              <div className="bg-black/50 border border-green-500/50 rounded-lg p-4">
                <h3 className="text-green-400 font-mono mb-2">Session créée avec succès!</h3>
                <p className="text-green-300 text-sm">
                  Maintenant, ajoutez des questions à votre session pour la rendre interactive.
                </p>
              </div>
              
              <QuestionUploader
                sessionId={createdSessionId}
                onUpload={handleQuestionsUploaded}
                onClose={handleQuestionsUploaded}
                universeContext={true}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCreatorModal;