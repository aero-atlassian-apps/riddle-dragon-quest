
export interface Question {
  id: number;
  text: string;
  image?: string;
  answer: string;
  doorNumber?: number;
}

export interface Session {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  status?: string;
}

export interface Room {
  id: string;
  sessionId: string;
  name: string;
  tokensLeft: number;
  currentDoor: number;
  score: number;
  sessionStatus?: string;
  link?: string;
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
  currentDoor: number;
  totalDoors: number;
  score: number;
  isAnswerCorrect: boolean | null;
  isGameComplete: boolean;
}
