
import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  currentModalId: string | null;
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void;
}

export const useModal = create<ModalState>((set) => ({
  isOpen: false,
  currentModalId: null,
  openModal: (modalId: string) => set({ isOpen: true, currentModalId: modalId }),
  closeModal: (modalId?: string) => set((state) => 
    modalId === undefined || modalId === state.currentModalId 
      ? { isOpen: false, currentModalId: null } 
      : state
  ),
}));
