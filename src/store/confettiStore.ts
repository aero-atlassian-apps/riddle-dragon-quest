
import { create } from 'zustand';

interface ConfettiState {
  isActive: boolean;
  startConfetti: () => void;
  stopConfetti: () => void;
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isActive: false,
  startConfetti: () => set({ isActive: true }),
  stopConfetti: () => set({ isActive: false }),
}));
