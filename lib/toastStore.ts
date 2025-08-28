
import { create } from 'zustand';
import { Toast } from '../types';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => Toast;
  removeToast: (id: number) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = toastId++;
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });
    setTimeout(() => get().removeToast(id), 5000); // Auto-remove after 5s
    return newToast;
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
