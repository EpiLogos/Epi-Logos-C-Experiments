import { create } from 'zustand';
import type { PortalRuntimeState } from '@/services/types';
import { temporalClient } from '@/services/temporalClient';

interface TemporalStore {
  runtime: PortalRuntimeState | null;
  subscribe: () => () => void;
  fetch: () => Promise<void>;
}

export const useTemporalStore = create<TemporalStore>((set) => ({
  runtime: null,

  fetch: async () => {
    const runtime = await temporalClient.getRuntime();
    set({ runtime });
  },

  subscribe: () => {
    const unlisten = temporalClient.onRuntime((s) => set({ runtime: s }));
    return () => {
      unlisten.then((fn) => fn());
    };
  },
}));
