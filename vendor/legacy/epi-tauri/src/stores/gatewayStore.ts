import { create } from 'zustand';
import { gatewayClient } from '@/services/gatewayClient';

interface GatewayStore {
  connected: boolean;
  sessionKey: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

export const useGatewayStore = create<GatewayStore>((set) => ({
  connected: false,
  sessionKey: null,
  error: null,

  connect: async () => {
    try {
      const sessionKey = await gatewayClient.connect();
      set({ connected: true, sessionKey, error: null });
    } catch (e) {
      set({ connected: false, error: String(e) });
    }
  },

  disconnect: async () => {
    try {
      await gatewayClient.disconnect();
      set({ connected: false, sessionKey: null });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  checkConnection: async () => {
    const connected = await gatewayClient.isConnected();
    set({ connected });
  },
}));
