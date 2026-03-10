import { create } from 'zustand';

export interface EditorState {
  content: string;
  isTyping: boolean;
  wordCount: number;
  setContent: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const calculateWordCount = (text: string): number => {
  const words = text.trim().match(/\b\w+\b/g);
  return words ? words.length : 0;
};

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  isTyping: false,
  wordCount: 0,
  setContent: (content) =>
    set({
      content,
      wordCount: calculateWordCount(content)
    }),
  setTyping: (isTyping) => set({ isTyping })
}));
