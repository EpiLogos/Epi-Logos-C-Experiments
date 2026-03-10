import { create } from 'zustand';

export type InnerStratum = '0\'' | '1\'' | '2\'' | '3\'' | '4\'' | '5\'';

// Simplified: only 'closed' or 'open' (always full)
export type SlidePanelMode = 'closed' | 'open';

export interface SlidePanelState {
  // Which inner stratum view is active
  activeStratum: InnerStratum | null;

  // Slide panel mode (closed/open - always full when open)
  slideMode: SlidePanelMode;

  // Actions
  openStratum: (stratum: InnerStratum) => void;
  toggleStratum: (stratum: InnerStratum) => void;
  closeSlidePanel: () => void;

  // Navigation helpers
  nextStratum: () => void;
  prevStratum: () => void;
  directStratum: (num: number) => void;
}

export const usePanelStore = create<SlidePanelState>((set, get) => ({
  activeStratum: null,
  slideMode: 'closed',

  openStratum: (stratum) => set({
    activeStratum: stratum,
    slideMode: 'open',
  }),

  toggleStratum: (stratum) => set((state) => {
    // If clicking same stratum that's already open, close it
    if (state.activeStratum === stratum && state.slideMode === 'open') {
      return {
        activeStratum: null,
        slideMode: 'closed',
      };
    }
    // Otherwise open the new stratum
    return {
      activeStratum: stratum,
      slideMode: 'open',
    };
  }),

  closeSlidePanel: () => set({
    activeStratum: null,
    slideMode: 'closed',
  }),

  nextStratum: () => set((state) => {
    if (!state.activeStratum) {
      return { activeStratum: '0\'', slideMode: 'open' };
    }

    const currentNum = parseInt(state.activeStratum.replace("'", ''));
    const nextNum = (currentNum + 1) % 6;
    const nextStratum = `${nextNum}'` as InnerStratum;

    return {
      activeStratum: nextStratum,
      slideMode: 'open',
    };
  }),

  prevStratum: () => set((state) => {
    if (!state.activeStratum) {
      return { activeStratum: '5\'', slideMode: 'open' };
    }

    const currentNum = parseInt(state.activeStratum.replace("'", ''));
    const prevNum = (currentNum - 1 + 6) % 6;
    const prevStratum = `${prevNum}'` as InnerStratum;

    return {
      activeStratum: prevStratum,
      slideMode: 'open',
    };
  }),

  // Toggle behavior: if same stratum, close; otherwise open
  directStratum: (num) => set((state) => {
    if (num < 0 || num > 5) return state;
    const stratum = `${num}'` as InnerStratum;

    // Toggle: if same stratum is already open, close it
    if (state.activeStratum === stratum && state.slideMode === 'open') {
      return {
        activeStratum: null,
        slideMode: 'closed',
      };
    }

    return {
      activeStratum: stratum,
      slideMode: 'open',
    };
  }),
}));
