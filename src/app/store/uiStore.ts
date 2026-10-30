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
  /** Find brought back by the session just finished, for the result screen. */
  lastFind: string | null;
  setLastFind(id: string | null): void;
}

export const useUiStore = create<UiState>()((set) => ({
  levelUp: null,
  setLevelUp: (levelUp) => set({ levelUp }),
  lastFind: null,
  setLastFind: (lastFind) => set({ lastFind }),
  toast: null,
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set((s) => (s.toast === toast ? { toast: null } : s)), 4000);
  },
}));
