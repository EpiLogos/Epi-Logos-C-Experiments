import { useState, useEffect, useCallback } from 'react';

// --- Local Types ---
export interface AgentContext {
    id?: string;
    role?: string;
    sessionId?: string;
    operations: any[];
    [key: string]: any;
}

export interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileTreeNode[];
}

export interface EpiiState {
    context: AgentContext | null;
    skills: any[];
    fileTree: FileTreeNode[];
    loading: boolean;
    error: string | null;
    stats: {
        cpu: number;
        ram: number;
        uptime: string;
    }
}

export interface EpiiActions {
    refreshContext: () => Promise<void>;
    refreshfiles: () => Promise<void>;
    runQuery: (q: string) => Promise<any>;
}

export function useEpii() {
    const [state, setState] = useState<EpiiState>({
        context: null,
        skills: [],
        fileTree: [],
        loading: true,
        error: null,
        stats: { cpu: 15, ram: 4.2, uptime: '4d 2h' } // Mock stats for display
    });

    const refreshContext = useCallback(async () => {
        try {
            // TODO: agent context/skills will come via epi-claw gateway (epi-cli), not local Electron plumbing
            setState(prev => ({ ...prev, context: null, skills: [] }));
        } catch (err) {
            console.error('[Epii] Context Load Error:', err);
        }
    }, []);

    const refreshFiles = useCallback(async () => {
        try {
            const tree = await window.sPrime?.s1?.files?.getFileTree();
            setState(prev => ({ ...prev, fileTree: tree || [] }));
        } catch (err) {
            console.error('[Epii] File Tree Load Error:', err);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        await Promise.all([refreshContext(), refreshFiles()]);
        setState(prev => ({ ...prev, loading: false }));
    }, [refreshContext, refreshFiles]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const actions: EpiiActions = {
        refreshContext,
        refreshfiles: refreshFiles,
        runQuery: async (q) => {
            // TODO: coordinate queries will go via epi-claw gateway (epi-cli)
            console.warn('[Epii] runQuery not yet connected to epi-claw gateway:', q);
            return null;
        }
    };

    return { state, actions };
}
