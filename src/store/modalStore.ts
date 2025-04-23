
import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  currentModalId: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useModal = create<ModalState>((set) => ({
  isOpen: false,
  currentModalId: null,
  openModal: (modalId: string) => set({ currentModalId: modalId, isOpen: true }),
  closeModal: () => set({ currentModalId: null, isOpen: false }),
}));
