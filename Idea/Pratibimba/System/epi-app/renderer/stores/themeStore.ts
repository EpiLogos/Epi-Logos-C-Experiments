import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode =
  | 'dark'
  | 'light'
  | 'glass'
  | 'nara-dark'
  | 'nara-light'
  | 'nara-glass'
  | 'nara-forest'
  | 'nara-mist'
  | 'nara-grove';
export type AccentColor = 'blue' | 'purple' | 'pink' | 'amber' | 'emerald' | 'cyan';

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  toggleMode: () => void;
}

function nextMode(mode: ThemeMode): ThemeMode {
  if (mode === 'nara-dark') return 'nara-light';
  if (mode === 'nara-light') return 'nara-glass';
  if (mode === 'nara-glass') return 'nara-dark';
  if (mode === 'nara-forest') return 'nara-mist';
  if (mode === 'nara-mist') return 'nara-grove';
  if (mode === 'nara-grove') return 'nara-forest';
  if (mode === 'dark') return 'light';
  if (mode === 'light') return 'glass';
  return 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      accent: 'cyan',
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      toggleMode: () => set((state) => ({ mode: nextMode(state.mode) })),
    }),
    {
      name: 'epi-theme-storage',
    }
  )
);
