import { create } from 'zustand';

export type HighlightCategory = 'daily-note' | 'oracle' | 'dream' | 'expand' | string;

export interface Highlight {
  id: string;
  text: string;
  category: HighlightCategory;
  timestamp: number;
  label?: string;
  color?: string;
}

export interface HighlightsState {
  highlights: Highlight[];
  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Omit<Highlight, 'id'> & { id?: string }) => void;
  removeHighlight: (id: string) => void;
  clearHighlights: () => void;
}

export const useHighlightsStore = create<HighlightsState>((set) => ({
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [
        ...state.highlights,
        {
          ...highlight,
          id: highlight.id || `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      ]
    })),
  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id)
    })),
  clearHighlights: () => set({ highlights: [] })
}));
