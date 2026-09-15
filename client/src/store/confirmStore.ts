import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  isLoading: boolean;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  options: null,
  isLoading: false,
  openConfirm: (options) => set({ isOpen: true, options, isLoading: false }),
  closeConfirm: () => set({ isOpen: false, options: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const confirm = (options: ConfirmOptions) => {
  useConfirmStore.getState().openConfirm(options);
};
