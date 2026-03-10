import { useState, useEffect, useCallback } from 'react';
import { createNaraService } from './naraService';
// import { JournalEntry } from '../../../../shared/types'; 

declare global {
    interface Window {
        sPrime: any;
    }
}

// Local Types
interface JournalEntry {
    id: string;
    date: string;
    title: string;
    contextPath?: string;
}

// Local Types if missing
export interface QLFrontmatter {
    title?: string;
    date?: string;
    tags?: string[];
    [key: string]: unknown;
}

export type NaraMode = 'journal' | 'daily_note' | 'dream' | 'oracle';

export interface NaraState {
    todayNote: {
        content: string;
        path: string;
        frontmatter: QLFrontmatter;
    } | null;
    entries: any[]; // refined type later
    stats: {
        entryCount: number;
        words: number;
    };
    activeMode: NaraMode;
    currentDocument: string;
    loading: boolean;
    error: string | null;
}

export interface NaraActions {
    refresh: () => Promise<void>;
    search: (query: string) => void;
    setMode: (mode: NaraMode) => void;
    updateDocument: (content: string) => void;
}

export function useNara() {
    const [state, setState] = useState<NaraState>({
        todayNote: null,
        entries: [],
        stats: { entryCount: 0, words: 0 },
        activeMode: 'journal',
        currentDocument: '',
        loading: true,
        error: null
    });

    const refresh = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const service = createNaraService({
                getTodayNote: async () => window.sPrime?.s1?.journal?.getTodayNote(),
            });
            const snapshot = await service.loadTodaySnapshot();

            setState(prev => ({
                ...prev,
                todayNote: snapshot.todayNote as any, // casting to bypass Record<string, unknown> mismatch temporarily
                entries: snapshot.entries,
                stats: snapshot.stats,
                loading: false,
                error: snapshot.error,
            }));
        } catch (err) {
            console.error('[Nara] Load Error:', err);
            setState(prev => ({ ...prev, loading: false, error: String(err) }));
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const actions: NaraActions = {
        refresh,
        search: (q) => console.log('Search:', q),
        setMode: (mode) => setState(prev => ({ ...prev, activeMode: mode })),
        updateDocument: (content) => setState(prev => ({ ...prev, currentDocument: content }))
    };

    return { state, actions };
}
