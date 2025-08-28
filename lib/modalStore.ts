
import { create } from 'zustand';

type ModalType = 'login' | 'signup';

interface ModalState {
  modal: ModalType | null;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modal: null,
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));
