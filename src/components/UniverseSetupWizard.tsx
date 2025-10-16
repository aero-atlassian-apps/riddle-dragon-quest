import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Crown, 
  Swords,
  Castle,
  Pause,
  Save,
  AlertCircle
} from 'lucide-react';

// Import existing components
import ChallengeCreator from './ChallengeCreator';
import RoomCreator from './RoomCreator';
import TroupeCreator from './TroupeCreator';
import QuestionUploader from './QuestionUploader';
import QuestionManager from './QuestionManager';

// Import utilities
import { createUniverse, getChallenges, getRoomsByChallenge, getChallengeQuestions } from '@/utils/db';
import { Universe, Challenge, Room, Question } from '@/types/game';

interface UniverseSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (universe: Universe) => void;
  editingUniverse?: Universe | null;
}

interface SetupProgress {
  universeCreated: boolean;
  universeRoomsCreated: Room[];
  troupesCreated: any[];
  challengesCreated: Challenge[];
  roomsCreated: { [challengeId: string]: Room[] };
  questionsUploaded: { [challengeId: string]: Question[] };
  imagesManaged: { [challengeId: string]: boolean };
}

type SetupStep = 'universe' | 'troupes' | 'challenges' | 'finalize';

const UniverseSetupWizard: React.FC<UniverseSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  editingUniverse
}) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('universe');
  const [progress, setProgress] = useState<SetupProgress>({
    universeCreated: false,
    universeRoomsCreated: [],
    troupesCreated: [],
    challengesCreated: [],
    roomsCreated: {},
    questionsUploaded: {},
    imagesManaged: {}
  });
  
  // Universe form data
  const [universeData, setUniverseData] = useState({
    name: '',
    description: '',
    max_participants: 50,
    status: 'draft' as 'draft' | 'active' | 'archived'
  });
  
  const [currentUniverse, setCurrentUniverse] = useState<Universe | null>(null);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  
  const { toast } = useToast();

  // Initialize with editing universe if provided
  useEffect(() => {
    if (editingUniverse) {
      setUniverseData({
        name: editingUniverse.name,
        description: editingUniverse.description || '',
        max_participants: editingUniverse.max_participants,
        status: editingUniverse.status
      });
      setCurrentUniverse(editingUniverse);
      setProgress(prev => ({ ...prev, universeCreated: true }));
      loadExistingProgress(editingUniverse.id);
    }
  }, [editingUniverse]);

  // Load existing progress for editing universe
  const loadExistingProgress = async (universeId: string) => {
    try {
      const challenges = await getChallenges();
      const universeChallenges = challenges.filter(c => c.universeId === universeId);
      
      const roomsData: { [challengeId: string]: Room[] } = {};
      const questionsData: { [challengeId: string]: Question[] } = {};
      const imagesData: { [challengeId: string]: boolean } = {};
      
      for (const challenge of universeChallenges) {
        const rooms = await getRoomsByChallenge(challenge.id);
        const questions = await getChallengeQuestions(challenge.id);
        
        roomsData[challenge.id] = rooms;
        questionsData[challenge.id] = questions;
        imagesData[challenge.id] = questions.every(q => q.image);
      }
      
      setProgress({
        universeCreated: true,
        universeRoomsCreated: [],
        challengesCreated: universeChallenges,
        roomsCreated: roomsData,
        questionsUploaded: questionsData,
        imagesManaged: imagesData
      });
    } catch (error) {
      console.error('Error loading existing progress:', error);
    }
  };

  // Calculate overall progress percentage
  const calculateProgress = () => {
    let completed = 0;
    let total = 6; // Total steps
    
    if (progress.universeCreated) completed++;
    if (progress.universeRoomsCreated.length > 0) completed++;
    if (progress.challengesCreated.length > 0) completed++;
    
    const hasQuestions = Object.keys(progress.questionsUploaded).length > 0;
    if (hasQuestions) completed++;
    
    const hasImages = Object.values(progress.imagesManaged).some(Boolean);
    if (hasImages) completed++;
    
    // Review step is always available
    completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Step validation
  const validateStep = (step: SetupStep): boolean => {
    switch (step) {
      case 'universe':
        return universeData.name.trim() !== '';
      case 'troupes':
        return progress.universeRoomsCreated.length > 0;
      case 'challenges':
        return progress.challengesCreated.length > 0;
      case 'finalize':
        return progress.universeCreated && progress.universeRoomsCreated.length > 0 && progress.challengesCreated.length > 0;
      default:
        return false;
    }
  };

  // Handle universe creation/update
  const handleUniverseSubmit = async () => {
    if (!universeData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'univers est requis",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingUniverse) {
        // Update existing universe logic would go here
        setCurrentUniverse(editingUniverse);
        toast({
          title: "Univers mis à jour",
          description: "Les informations de l'univers ont été mises à jour"
        });
      } else {
        const universe = await createUniverse(universeData);
        if (universe) {
          setCurrentUniverse(universe);
          setProgress(prev => ({ ...prev, universeCreated: true }));
          toast({
            title: "Univers créé",
            description: "Votre univers a été créé avec succès"
          });
        }
      }
      setCurrentStep('troupes');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la création de l'univers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle universe-level room creation
  const handleUniverseRoomsCreated = (roomNames: string[]) => {
    setProgress(prev => ({
      ...prev,
      universeRoomsCreated: roomNames.map((name, index) => ({
        id: `temp-${index}`,
        name,
        universeId: currentUniverse?.id || '',
        sigil: '🏰',
        motto: ''
      }))
    }));
    
    toast({
      title: "Arènes créées",
      description: `${roomNames.length} arènes ont été créées pour l’univers`
    });
  };

  // Save/Resume functionality
  const saveProgressToStorage = () => {
    const progressData = {
      currentStep,
      progress,
      universeData,
      currentUniverse,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('universe-setup-progress', JSON.stringify(progressData));
  };

  const loadProgressFromStorage = () => {
    try {
      const saved = localStorage.getItem('universe-setup-progress');
      if (saved) {
        const progressData = JSON.parse(saved);
        setCurrentStep(progressData.currentStep);
        setProgress(progressData.progress);
        setUniverseData(progressData.universeData);
        setCurrentUniverse(progressData.currentUniverse);
        
        toast({
          title: "Progression restaurée",
          description: "Votre progression précédente a été restaurée."
        });
        return true;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    return false;
  };

  const clearProgressFromStorage = () => {
    localStorage.removeItem('universe-setup-progress');
  };

  // Load progress on component mount
  useEffect(() => {
    if (!editingUniverse && isOpen) {
      loadProgressFromStorage();
    }
  }, [isOpen, editingUniverse]);

  // Handle challenge creation
  const handleChallengeCreated = (challenge: Challenge) => {
    setProgress(prev => ({
      ...prev,
      challengesCreated: [...prev.challengesCreated, challenge]
    }));
    
    // Save progress after challenge creation
    saveProgressToStorage();
    
    toast({
      title: "Challenge créé",
      description: `Le challenge "${challenge.name}" a été créé avec succès.`
    });
  };

  // Handle room creation
  const handleRoomsCreated = (challengeId: string, roomNames: string[]) => {
    setProgress(prev => ({
      ...prev,
      roomsCreated: {
        ...prev.roomsCreated,
        [challengeId]: roomNames.map((name, index) => ({
          id: `temp-${index}`,
          name,
          challengeId,
          currentDoor: 1,
          score: 0,
          tokensLeft: 1,
          initialTokens: 1,
          sigil: '🏰',
          motto: ''
        }))
      }
    }));
    
    toast({
      title: "Arènes créées",
      description: `${roomNames.length} arènes ont été créées pour ce challenge`
    });
  };

  // Handle questions upload
  const handleQuestionsUploaded = (challengeId: string, questions: Question[]) => {
    setProgress(prev => ({
      ...prev,
      questionsUploaded: {
        ...prev.questionsUploaded,
        [challengeId]: questions
      }
    }));
    
    // Save progress after questions upload
    saveProgressToStorage();
    
    toast({
      title: "Questions téléchargées",
      description: `${questions.length} questions ont été ajoutées au challenge`
    });
  };

  // Handle images management completion
  const handleImagesManaged = (challengeId: string) => {
    setProgress(prev => ({
      ...prev,
      imagesManaged: {
        ...prev.imagesManaged,
        [challengeId]: true
      }
    }));
    // Persist progress and inform the user
    saveProgressToStorage();
    toast({
      title: "Images ajoutées",
      description: "Les images des questions du challenge ont été gérées",
    });
  };

  // Navigation functions
  const goToStep = (step: SetupStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const steps: SetupStep[] = ['universe', 'troupes', 'challenges', 'finalize'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: SetupStep[] = ['universe', 'troupes', 'challenges', 'finalize'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Complete setup and clear saved progress
  const completeSetup = async () => {
    if (!currentUniverse) return;
    
    setIsLoading(true);
    try {
      // Clear saved progress since setup is complete
      clearProgressFromStorage();
      
      toast({
        title: "Configuration terminée",
        description: "Votre univers a été configuré avec succès"
      });
      
      onComplete(currentUniverse);
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la finalisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'universe':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400 font-pixel">
                $ CONFIGURATION_UNIVERS
              </h3>
              <p className="text-green-400/70 mb-6 font-mono">
                Définissez les paramètres de base de votre univers de jeu.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="universe-name" className="font-mono text-green-400">
                  $ NOM_UNIVERS *
                </Label>
                <Input
                  id="universe-name"
                  value={universeData.name}
                  onChange={(e) => setUniverseData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Entrez le nom de l'univers..."
                  className="bg-black/50 border-green-500/50 text-green-400 font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="universe-description" className="font-mono text-green-400">
                  $ DESCRIPTION_UNIVERS
                </Label>
                <Textarea
                  id="universe-description"
                  value={universeData.description}
                  onChange={(e) => setUniverseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre univers..."
                  className="bg-black/50 border-green-500/50 text-green-400 font-mono"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="max-participants" className="font-mono text-green-400">
                  $ MAX_PARTICIPANTS
                </Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="1"
                  max="1000"
                  value={universeData.max_participants}
                  onChange={(e) => setUniverseData(prev => ({ 
                    ...prev, 
                    max_participants: parseInt(e.target.value) || 50 
                  }))}
                  className="bg-black/50 border-green-500/50 text-green-400 font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="universe-status" className="font-mono text-green-400">
                  $ STATUT_UNIVERS
                </Label>
                <Select
                  value={universeData.status}
                  onValueChange={(value: 'draft' | 'active' | 'archived') => 
                    setUniverseData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-black/50 border-green-500/50 text-green-400 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handleUniverseSubmit}
              disabled={!universeData.name.trim() || isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
            >
              {isLoading ? 'CREATION...' : editingUniverse ? 'METTRE_A_JOUR' : 'CREER_UNIVERS'}
            </Button>
          </div>
        );
        
      case 'troupes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400 font-pixel">
                $ CREATION_TROUPES
              </h3>
              <p className="text-green-400/70 mb-6 font-mono">
                Créez les troupes pour votre univers.
              </p>
            </div>
            
            {currentUniverse && (
              <div className="mb-6 p-4 border border-green-500/30 rounded bg-black/30">
                <h4 className="font-mono text-green-400 mb-2">$ UNIVERS_ACTUEL:</h4>
                <p className="text-green-400/70 font-mono">{currentUniverse.name}</p>
              </div>
            )}
            
            <TroupeCreator
              universeId={currentUniverse?.id}
              onCreateTroupes={(troupes) => {
                const newTroupes = troupes.map(troupe => ({
                  id: troupe.id,
                  name: troupe.name,
                  max_participants: troupe.max_participants,
                  created_at: new Date().toISOString()
                }));
                
                setProgress(prev => ({
                  ...prev,
                  universeRoomsCreated: troupes,
                  troupesCreated: newTroupes
                }));
                
                saveProgressToStorage();
                nextStep();
              }}
            />
          </div>
        );
        
      case 'challenges':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400 font-pixel">
                $ CREATION_CHALLENGES_ET_QUESTIONS
              </h3>
              <p className="text-green-400/70 mb-6 font-mono">
                Créez des challenges et téléchargez leurs questions.
              </p>
            </div>
            
            {progress.universeRoomsCreated.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-green-400 mb-3">$ TROUPES_CREEES:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {progress.universeRoomsCreated.map((room) => (
                    <div key={room.id} className="p-2 border border-green-500/30 rounded bg-black/30 text-center">
                      <span className="font-mono text-green-400 text-sm">{room.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {progress.challengesCreated.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-green-400 mb-3">$ CHALLENGES_EXISTANTS:</h4>
                <div className="space-y-2">
                  {progress.challengesCreated.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-3 border border-green-500/30 rounded bg-black/30">
                      <div>
                        <span className="font-mono text-green-400">{challenge.name}</span>
                        {challenge.context && (
                          <p className="text-sm text-green-400/70">{challenge.context}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          {challenge.status}
                        </Badge>
                        {progress.questionsUploaded[challenge.id] && (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            Questions
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <ChallengeCreator 
              onCreateChallenge={handleChallengeCreated} 
              universeId={currentUniverse?.id}
            />
            
            {progress.challengesCreated.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-bold text-green-400 font-mono">$ TELECHARGEMENT_QUESTIONS</h4>
                <p className="text-green-400/70 font-mono text-sm">
                  Téléchargez les questions pour chaque challenge créé.
                </p>
                
                <Tabs defaultValue={progress.challengesCreated[0]?.id} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {progress.challengesCreated.map((challenge) => (
                      <TabsTrigger key={challenge.id} value={challenge.id} className="font-mono">
                        {challenge.name}
                        {progress.questionsUploaded[challenge.id] && (
                          <Check className="ml-2 h-4 w-4 text-green-400" />
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {progress.challengesCreated.map((challenge) => (
                    <TabsContent key={challenge.id} value={challenge.id}>
                      <QuestionUploader
                        challengeId={challenge.id}
                        onUpload={(questions) => handleQuestionsUploaded(challenge.id, questions)}
                        universeContext={true}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {progress.challengesCreated.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-bold text-green-400 font-mono">$ GESTION_IMAGES_QUESTIONS</h4>
                <p className="text-green-400/70 font-mono text-sm">
                  Après le téléchargement, ajoutez des images à chaque question des challenges.
                </p>

                <Tabs defaultValue={progress.challengesCreated[0]?.id} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {progress.challengesCreated.map((challenge) => (
                      <TabsTrigger key={challenge.id} value={challenge.id} className="font-mono">
                        {challenge.name}
                        {progress.imagesManaged[challenge.id] && (
                          <Check className="ml-2 h-4 w-4 text-green-400" />
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {progress.challengesCreated.map((challenge) => (
                    <TabsContent key={challenge.id} value={challenge.id}>
                      <div className="border border-green-500/30 rounded p-4 bg-black/30">
                        <QuestionManager
                          challengeId={challenge.id}
                          onComplete={() => handleImagesManaged(challenge.id)}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>
        );

      case 'finalize':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400 font-pixel">
                $ FINALISATION_UNIVERS
              </h3>
              <p className="text-green-400/70 mb-6 font-mono">
                Vérifiez votre configuration et finalisez la création de votre univers.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Universe Summary */}
              <Card className="bg-black/50 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-pixel flex items-center">
                    <Castle className="mr-2 h-5 w-5" />
                    UNIVERS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-green-400 font-mono">
                    <p><strong>Nom:</strong> {universeData.name}</p>
                    <p><strong>Description:</strong> {universeData.description || 'Aucune'}</p>
                    <p><strong>Participants max:</strong> {universeData.max_participants}</p>
                    <p><strong>Statut:</strong> {universeData.status}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Troupes Summary */}
              <Card className="bg-black/50 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-pixel flex items-center">
                    <Crown className="mr-2 h-5 w-5" />
                    TROUPES ({progress.troupesCreated.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.troupesCreated.length === 0 ? (
                    <p className="text-amber-400 font-mono">Aucune troupe créée</p>
                  ) : (
                    <div className="space-y-2">
                      {progress.troupesCreated.map((troupe) => (
                        <div key={troupe.id} className="p-2 border border-green-500/30 rounded">
                          <p className="text-green-400 font-mono font-bold">{troupe.name}</p>
                          <p className="text-sm text-green-400/70 font-mono">
                            Participants: {troupe.max_participants}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Challenges Summary */}
              <Card className="bg-black/50 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-pixel flex items-center">
                    <Swords className="mr-2 h-5 w-5" />
                    CHALLENGES ({progress.challengesCreated.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.challengesCreated.length === 0 ? (
                    <p className="text-amber-400 font-mono">Aucun challenge créé</p>
                  ) : (
                    <div className="space-y-2">
                      {progress.challengesCreated.map((challenge) => (
                        <div key={challenge.id} className="p-2 border border-green-500/30 rounded">
                          <p className="text-green-400 font-mono font-bold">{challenge.name}</p>
                          <div className="text-sm text-green-400/70 font-mono">
                            <p>Questions: {progress.questionsUploaded[challenge.id]?.length || 0}</p>
                            <p>Statut: {progress.questionsUploaded[challenge.id] ? 'Prêt' : 'En attente de questions'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={completeSetup}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-black font-pixel"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      FINALISATION...
                    </>
                  ) : (
                    '$ FINALISER_UNIVERS'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-pixel"
                  onClick={() => {
                    // Save current progress as draft
                    saveProgressToStorage();
                    toast({
                      title: "Brouillon sauvegardé",
                      description: "Votre progression a été sauvegardée. Vous pouvez revenir plus tard.",
                    });
                    onClose();
                  }}
                >
                  $ SAUVEGARDER_BROUILLON
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-green-500" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 font-pixel">
            $ ASSISTANT_CONFIGURATION_UNIVERS
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono text-green-400">
              <span>Progression</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: 'universe', label: 'UNIVERS', icon: Castle },
              { key: 'troupes', label: 'TROUPES', icon: Crown },
              { key: 'challenges', label: 'CHALLENGES', icon: Swords },
              { key: 'finalize', label: 'FINALISER', icon: Check }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => goToStep(key as SetupStep)}
                variant={currentStep === key ? "default" : "outline"}
                size="sm"
                className={`font-pixel ${
                  currentStep === key 
                    ? 'bg-green-500 text-black' 
                    : 'border-green-500/50 text-green-400 hover:bg-green-500/20'
                } ${validateStep(key as SetupStep) ? '' : 'opacity-50'}`}
                disabled={key !== 'universe' && !validateStep(key as SetupStep)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-green-500/30">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 'universe'}
              className="border-green-500/50 text-green-400 hover:bg-green-500/20 font-pixel"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              PRECEDENT
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 font-pixel"
            >
              FERMER
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={currentStep === 'review' || !validateStep(currentStep)}
              className="bg-green-500 hover:bg-green-600 text-black font-pixel"
            >
              SUIVANT
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniverseSetupWizard;