
export interface Question {
  id: number;
  text: string;
  image?: string;
  answer: string;
  hint?: string;
  doorNumber?: number;
  points?: number;
  style?: string;
  prize?: string;
}

export interface Challenge {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  createdAt?: Date;
  questions: Question[];
  status?: string;
  context?: string;
  hintEnabled?: boolean;
  challengeType?: 'standalone' | 'universe';
  universeId?: string;
  universeName?: string;
  universeStatus?: 'draft' | 'active' | 'archived' | string;
  challengeOrder?: number;
}

export interface Room {
  id: string;
  challengeId: string;
  name: string;
  tokensLeft: number;
  initialTokens: number;
  currentDoor: number;
  score: number;
  challengeStatus?: string;
  link?: string;
  sigil?: string;
  motto?: string;
  startTime?: Date;
  completionTime?: Date;
  timeBonus?: number;
  universeId?: string;
  troupeId?: string;
  troupeStartTime?: Date;
  troupeEndTime?: Date;
}

export interface Score {
  roomId: string;
  challengeId: string;
  totalScore: number;
  roomName: string;
}

export interface GameState {
  currentQuestion?: Question;
  tokensLeft: number;
  initialTokens: number;
  currentDoor: number;
  totalDoors: number;
  score: number;
  isAnswerCorrect: boolean | null;
  isGameComplete: boolean;
  startTime: Date;
  timeBonus: number;
}

// Optional shared Universe type for components
export interface Universe {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived' | string;
  created_at: string;
  updated_at: string;
  troupe_count?: number;
  challenge_count?: number;
  poster_image_url?: string;
  current_participants?: number;
  max_participants?: number;
  theme?: {
    name: string;
    primary_color: string;
    background_image?: string;
  };
}
