import { create } from 'zustand';

export interface LayoutState {
    panels: {
        left: boolean;
        right: boolean;
    };
    togglePanel: (panel: 'left' | 'right') => void;
    setPanel: (panel: 'left' | 'right', value: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    panels: {
        left: true,
        right: true,
    },
    togglePanel: (panel) =>
        set((state) => ({
            panels: {
                ...state.panels,
                [panel]: !state.panels[panel],
            },
        })),
    setPanel: (panel, value) =>
        set((state) => ({
            panels: {
                ...state.panels,
                [panel]: value,
            },
        })),
}));
