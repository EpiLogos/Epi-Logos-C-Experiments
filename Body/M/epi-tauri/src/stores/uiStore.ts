import { create } from 'zustand';
import type { MefLensId } from '@/services/types';

export type ActiveWorkspace = 'M0' | 'M4' | 'M5';
export type ViewDimension = '2d' | '3d';

interface UiStore {
  omniPanelOpen: boolean;
  activeWorkspace: ActiveWorkspace;
  viewDimension: ViewDimension;
  commandPaletteOpen: boolean;
  activeMefLens: MefLensId;
  activeBranchLens: number;
  toggleOmniPanel: () => void;
  setWorkspace: (ws: ActiveWorkspace) => void;
  toggleDimension: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMefLens: (lens: MefLensId) => void;
  setBranchLens: (lens: number) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  omniPanelOpen: false,
  activeWorkspace: 'M4',
  viewDimension: '2d',
  commandPaletteOpen: false,
  activeMefLens: 0,
  activeBranchLens: 0,

  toggleOmniPanel: () => set((s) => ({ omniPanelOpen: !s.omniPanelOpen })),
  setWorkspace: (ws) => set({ activeWorkspace: ws }),
  toggleDimension: () =>
    set((s) => ({ viewDimension: s.viewDimension === '2d' ? '3d' : '2d' })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setMefLens: (lens) => set({ activeMefLens: lens }),
  setBranchLens: (lens) => set({ activeBranchLens: lens }),
}));
