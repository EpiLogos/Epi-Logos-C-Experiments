/**
 * Coordinate: M' M0' (Bimba graph explorer, Phase-2)
 * Actualises: the canonical map as a navigable field — real nodes/edges via
 *   `s2.graph.query` (read-only; canon mutation is Hen's, DR-M0-1), family
 *   hues per the UI-patterns discipline, click publishes to the shared
 *   coordinate store so the walk and every surface follow. force-graph per
 *   the spec's own renderer recommendation (DR-UI-1). Hosts the M0' in-widget
 *   rail and the bussed 9-bit Virtue Witness panel (21.T21.10).
 */

import { useEffect, useRef, useState } from 'react';
import ForceGraph from 'force-graph';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { coerceLinks, coerceNodes, ExplorerNode, FAMILY_HUES } from './graphData';
import { M0LayerRail } from './M0LayerRail';
import { M0InspectorLayer } from './m0Layers';
import { M0VirtueWitnessPanel } from './M0VirtueWitnessPanel';
import { inkDim, ringLit } from '../ui/tokens';

const NODES_CYPHER =
    'MATCH (n:Bimba) RETURN n.coordinate AS coordinate, n.label AS label LIMIT 900';
const LINKS_CYPHER =
    'MATCH (a:Bimba)-[r]->(b:Bimba) RETURN a.coordinate AS source, type(r) AS type, b.coordinate AS target LIMIT 2500';

export interface GraphExplorerPaneProps {
    requestedM0Contribution?: string | null;
}

const M0_INTENT_LAYERS: Readonly<Record<string, M0InspectorLayer>> = Object.freeze({
    language: 'lang',
    'ql-structure': 'ql',
    relations: 'rel',
    'time-community': 'time'
});

export function GraphExplorerPane({ requestedM0Contribution = null }: GraphExplorerPaneProps = {}) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const graphRef = useRef<ForceGraph | null>(null);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
    const [detail, setDetail] = useState('');

    useEffect(() => {
        if (!connected || !hostRef.current) {
            return;
        }
        let disposed = false;
        const host = hostRef.current;

        Promise.all([
            gateway().invoke('s2.graph.query', { cypher: NODES_CYPHER, params: {} }),
            gateway().invoke('s2.graph.query', { cypher: LINKS_CYPHER, params: {} })
        ])
            .then(([nodesReceipt, linksReceipt]) => {
                if (disposed) {
                    return;
                }
                const nodes = coerceNodes(nodesReceipt.artifact);
                const ids = new Set(nodes.map(n => n.id));
                const links = coerceLinks(linksReceipt.artifact, ids);
                if (nodes.length === 0) {
                    setStatus('empty');
                    setDetail('the canonical graph returned no :Bimba nodes');
                    return;
                }
                setStatus('ready');
                setDetail(`${nodes.length} nodes · ${links.length} relations`);
                const graph = new ForceGraph(host)
                    .graphData({ nodes, links })
                    .nodeId('id')
                    .nodeLabel((node: unknown) => {
                        const n = node as ExplorerNode;
                        return n.label ? `${n.id} — ${n.label}` : n.id;
                    })
                    .nodeColor((node: unknown) => {
                        const n = node as ExplorerNode;
                        const selected = useCoordinateStore.getState().selected;
                        return n.id === selected ? ringLit : (FAMILY_HUES[n.family] ?? inkDim);
                    })
                    .nodeRelSize(4)
                    .linkColor(() => 'rgba(154, 143, 184, 0.25)')
                    .backgroundColor('rgba(0,0,0,0)')
                    .onNodeClick((node: unknown) => {
                        useCoordinateStore.getState().setSelected((node as ExplorerNode).id);
                        graph.nodeColor(graph.nodeColor());
                    });
                graphRef.current = graph;
            })
            .catch(err => {
                if (!disposed) {
                    setStatus('error');
                    setDetail(err instanceof Error ? err.message : String(err));
                }
            });

        return () => {
            disposed = true;
            graphRef.current?._destructor?.();
            graphRef.current = null;
        };
    }, [connected]);

    if (!connected) {
        return <div className="pane-message">Gateway disconnected — the map needs S2.</div>;
    }
    return (
        <div className="graph-explorer" data-testid="graph-explorer">
            <M0LayerRail requestedLayer={requestedM0Contribution ? M0_INTENT_LAYERS[requestedM0Contribution] : null} />
            <M0VirtueWitnessPanel />
            <div className="pane-toolbar" data-testid="graph-status">
                {status === 'loading' ? 'reading the canonical map…' : detail}
            </div>
            {status === 'error' ? (
                <div className="chat-error" data-testid="graph-error">
                    {detail}
                </div>
            ) : null}
            <div ref={hostRef} className="graph-host" />
        </div>
    );
}
