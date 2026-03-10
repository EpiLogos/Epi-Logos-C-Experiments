import { useState, useEffect, useCallback, useMemo } from 'react';
import { GraphData, GraphNode, ForceGraphLink, QL_POSITION_COLORS } from '../../../../shared/types';

// --- Types ---
export interface AnuttaraState {
    graphData: GraphData | null;
    loading: boolean;
    error: string | null;
    metrics: {
        nodeCount: number;
        edgeCount: number;
        density: number;
    };
}

export interface AnuttaraActions {
    refreshGraph: () => Promise<void>;
    runQuery: (query: string) => Promise<void>;
    exportCSV: () => void;
}

// --- Hook ---
export function useAnuttara() {
    const [state, setState] = useState<AnuttaraState>({
        graphData: null,
        loading: true,
        error: null,
        metrics: { nodeCount: 0, edgeCount: 0, density: 0 }
    });

    const refreshGraph = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Bridge Call: sPrime.s2.graph
            const data = await window.sPrime?.s2?.graph?.getGraph();

            if (data) {
                // Calculate Metrics
                const nodes = data.nodes.length;
                const edges = data.relationships.length;
                const density = nodes > 0 ? edges / (nodes * (nodes - 1)) : 0; // Simple density

                setState({
                    graphData: data,
                    loading: false,
                    error: null,
                    metrics: {
                        nodeCount: nodes,
                        edgeCount: edges,
                        density: parseFloat(density.toFixed(3))
                    }
                });
            } else {
                setState(prev => ({ ...prev, loading: false, error: 'No data returned from Graph API' }));
            }
        } catch (err) {
            console.error('[Anuttara] Graph Load Error:', err);
            setState(prev => ({ ...prev, loading: false, error: String(err) }));
        }
    }, []);

    // Initial Load
    useEffect(() => {
        refreshGraph();
    }, [refreshGraph]);

    const actions: AnuttaraActions = {
        refreshGraph,
        runQuery: async (q) => { console.log('Query:', q); }, // Placeholder for now
        exportCSV: () => { console.log('Export CSV'); }
    };

    return { state, actions };
}
