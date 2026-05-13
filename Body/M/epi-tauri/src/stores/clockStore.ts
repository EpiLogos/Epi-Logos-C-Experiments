import { create } from 'zustand';
import type { PortalClockState, WalkMode } from '@/services/types';
import { clockClient } from '@/services/clockClient';

interface ClockStore {
  state: PortalClockState | null;
  walkMode: WalkMode;
  bifurcation: [number, number];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  subscribe: () => () => void;
  setClockState: (s: PortalClockState) => void;
}

export const useClockStore = create<ClockStore>((set) => ({
  state: null,
  walkMode: 'Ground',
  bifurcation: [0, 0],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const state = await clockClient.getState();
      set({ state, walkMode: state.walk_mode, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  subscribe: () => {
    const unlisten1 = clockClient.onStateChange((s) => {
      set({ state: s, walkMode: s.walk_mode });
    });
    const unlisten2 = clockClient.onOracleCast((s) => {
      set({ state: s, walkMode: s.walk_mode });
    });
    return () => {
      unlisten1.then((fn) => fn());
      unlisten2.then((fn) => fn());
    };
  },

  setClockState: (s) => set({ state: s, walkMode: s.walk_mode }),
}));
