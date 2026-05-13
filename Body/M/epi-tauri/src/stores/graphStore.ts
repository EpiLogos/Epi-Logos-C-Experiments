import { create } from 'zustand';
import type { GraphData, GraphNode, SubGraphGeometry } from '@/services/types';
import { graphClient } from '@/services/graphClient';

interface GraphStore {
  data: GraphData | null;
  selectedNode: GraphNode | null;
  geometry: SubGraphGeometry | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchGraph: () => Promise<void>;
  selectNode: (node: GraphNode | null) => void;
  selectByCoordinate: (coord: string) => Promise<void>;
  fetchGeometry: (coord: string) => Promise<void>;
}

export const useGraphStore = create<GraphStore>((set) => ({
  data: null,
  selectedNode: null,
  geometry: null,
  connected: false,
  loading: false,
  error: null,

  connect: async () => {
    try {
      await graphClient.connect();
      set({ connected: true, error: null });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  disconnect: async () => {
    await graphClient.disconnect();
    set({ connected: false, data: null });
  },

  fetchGraph: async () => {
    set({ loading: true });
    try {
      const data = await graphClient.getGraph();
      set({ data, loading: false, error: null });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  selectNode: (node) => set({ selectedNode: node }),

  selectByCoordinate: async (coord) => {
    const node = await graphClient.getByCoordinate(coord);
    set({ selectedNode: node ?? null });
  },

  fetchGeometry: async (coord) => {
    const geometry = await graphClient.geometryFor(coord);
    set({ geometry });
  },
}));
