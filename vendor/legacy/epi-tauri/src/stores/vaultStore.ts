import { create } from 'zustand';
import type { DailyNote, FileTreeNode, EntryMetadata, FlowEntry } from '@/services/types';
import { vaultClient } from '@/services/vaultClient';

interface VaultStore {
  todayNote: DailyNote | null;
  fileTree: FileTreeNode[];
  entries: EntryMetadata[];
  currentFlow: FlowEntry | null;
  loading: boolean;
  error: string | null;
  fetchTodayNote: () => Promise<void>;
  fetchFileTree: () => Promise<void>;
  fetchEntries: () => Promise<void>;
  fetchFlow: (date: string) => Promise<void>;
}

export const useVaultStore = create<VaultStore>((set) => ({
  todayNote: null,
  fileTree: [],
  entries: [],
  currentFlow: null,
  loading: false,
  error: null,

  fetchTodayNote: async () => {
    set({ loading: true });
    try {
      const note = await vaultClient.getTodayNote();
      set({ todayNote: note, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  fetchFileTree: async () => {
    try {
      const fileTree = await vaultClient.getFileTree();
      set({ fileTree });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchEntries: async () => {
    try {
      const entries = await vaultClient.listEntries();
      set({ entries });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchFlow: async (date) => {
    try {
      const flow = await vaultClient.getFlow(date);
      set({ currentFlow: flow });
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
