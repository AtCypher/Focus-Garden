import { create } from 'zustand';

export interface LevelUpEvent {
  from: number;
  to: number;
}

interface UiState {
  levelUp: LevelUpEvent | null;
  setLevelUp(e: LevelUpEvent | null): void;
  toast: string | null;
  showToast(text: string): void;
}

export const useUiStore = create<UiState>()((set) => ({
  levelUp: null,
  setLevelUp: (levelUp) => set({ levelUp }),
  toast: null,
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set((s) => (s.toast === toast ? { toast: null } : s)), 4000);
  },
}));
