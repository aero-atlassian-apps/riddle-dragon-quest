
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

export interface Session {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  status?: string;
  context?: string;
  hintEnabled?: boolean;
}

export interface Room {
  id: string;
  sessionId: string;
  name: string;
  tokensLeft: number;
  initialTokens: number;
  currentDoor: number;
  score: number;
  sessionStatus?: string;
  link?: string;
  sigil?: string;
  motto?: string;
  startTime?: Date;
  completionTime?: Date;
  timeBonus?: number;
}

export interface Score {
  roomId: string;
  sessionId: string;
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
