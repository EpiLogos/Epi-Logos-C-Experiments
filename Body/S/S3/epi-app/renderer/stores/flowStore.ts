import { create } from 'zustand';
import type { FlowEntry, FlowHighlight, FlowMetadata } from '../../shared/types';

interface FlowState {
  currentDate: string;
  content: string;
  metadata: FlowMetadata | null;

  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;

  loadEntry: (date: string) => Promise<void>;
  saveEntry: (date: string, content: string, highlights: FlowHighlight[]) => Promise<void>;
  setContent: (content: string) => void;
  setHighlights: (highlights: FlowHighlight[]) => void;
  clearError: () => void;
}

function createEmptyMetadata(date: string): FlowMetadata {
  const now = new Date().toISOString();
  return {
    date,
    created: now,
    updated: now,
    version: 0,
    highlights: [],
    wordCount: 0,
  };
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  currentDate: new Date().toISOString().split('T')[0],
  content: '',
  metadata: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  saveError: null,

  loadEntry: async (date: string) => {
    set({ isLoading: true, currentDate: date, saveError: null });
    try {
      const fetcher = window.sPrime?.s1?.journal?.getFlowEntry;
      const entry = fetcher ? ((await fetcher(date)) as FlowEntry | null) : null;
      if (entry) {
        set({ content: entry.content, metadata: entry.metadata, isLoading: false });
        return;
      }
      set({ content: '', metadata: createEmptyMetadata(date), isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        saveError: error instanceof Error ? error.message : 'Failed to load FLOW entry',
        metadata: get().metadata ?? createEmptyMetadata(date),
      });
    }
  },

  saveEntry: async (date: string, content: string, highlights: FlowHighlight[]) => {
    set({ isSaving: true, saveError: null });
    try {
      const base = get().metadata ?? createEmptyMetadata(date);
      const metadata: FlowMetadata = {
        ...base,
        date,
        updated: new Date().toISOString(),
        highlights,
        wordCount: countWords(content),
      };

      const saver = window.sPrime?.s1?.journal?.saveFlowEntry;
      if (saver) {
        await saver(date, content, metadata);
      }

      set({
        content,
        metadata,
        isSaving: false,
        lastSaved: new Date(),
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to save FLOW entry',
      });
    }
  },

  setContent: (content: string) =>
    set((state) => ({
      content,
      metadata: state.metadata
        ? { ...state.metadata, wordCount: countWords(content) }
        : state.metadata,
    })),

  setHighlights: (highlights: FlowHighlight[]) =>
    set((state) => ({
      metadata: state.metadata ? { ...state.metadata, highlights } : state.metadata,
    })),

  clearError: () => set({ saveError: null }),
}));
