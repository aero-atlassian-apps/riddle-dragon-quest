
import { create } from 'zustand';

interface GameState {
  roomId: string | null;
  setRoomId: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  setRoomId: (id: string) => set({ roomId: id }),
}));
