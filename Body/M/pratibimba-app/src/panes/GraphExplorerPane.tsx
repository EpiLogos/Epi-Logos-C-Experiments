/**
 * Coordinate: M' M0' (Bimba graph explorer, Phase-2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0' graph-surface host
 * Actualises: the canonical map as a navigable field — real nodes/edges via
 *   `s2.graph.query` (read-only; canon mutation is Hen's, DR-M0-1), family
 *   hues per the UI-patterns discipline, click publishes to the shared
 *   coordinate store so the walk and every surface follow. force-graph per
 *   the spec's own renderer recommendation (DR-UI-1). Hosts the M0' in-widget
 *   rail, M0-3' community/clock panel (09.T9.6), coordinate-scoped M5-0'
 *   Gnostic Library seam (09.T9.9), and bussed 9-bit Virtue Witness panel
 *   (21.T21.10), persistent contemplation footer (21.T21.9), and symbolic
 *   verifier-response console (21.T21.11). The M0-0' Language layer carries
 *   reader/browser sub-tabs; the browser pages the live S2 residual set
 *   (21.T21.14).
 * Public surface: GraphExplorerPane, GraphExplorerPaneProps.
 * Does NOT own: S2 graph law, world-clock computation, canon mutation, or
 *   protected Graphiti episode bodies.
 * Contract: [[M0'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]].
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph from 'force-graph';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { coerceLinks, coerceNodes, etymologicalClusterIds, ExplorerLink, ExplorerNode, FAMILY_HUES } from './graphData';
import { M0LayerRail } from './M0LayerRail';
import { M0InspectorLayer } from './m0Layers';
import { M0VirtueWitnessPanel } from './M0VirtueWitnessPanel';
import { M0CommunityClockPanel } from './M0CommunityClockPanel';
import { M0LanguageReaderPanel } from './M0LanguageReaderPanel';
import { M0LazyNodeBrowser } from './M0LazyNodeBrowser';
import { M0QlStructureReaderPanel } from './M0QlStructureReaderPanel';
import { M0RelationsReaderPanel } from './M0RelationsReaderPanel';
import { M0M5LibrarySeamPanel } from './M0M5LibrarySeamPanel';
import { M0ModeActionsPanel } from './M0ModeActionsPanel';
import { M0ContemplationPromptFooter } from './M0ContemplationPromptFooter';
import { M0SymbolicQuestionConsole } from './M0SymbolicQuestionConsole';
import { useM0Surface } from './M0SurfaceContext';
import { BridgeReadinessBadge } from '../ui/BridgeReadinessBadge';
import { ATELIER_CLUSTER_HUES, inkDim, ringLit } from '../ui/tokens';

const NODES_CYPHER =
    'MATCH (n:Bimba) RETURN n.coordinate AS coordinate, n.label AS label LIMIT 900';
/** 28.T28.3 (c) / DR-IG-1: the three options the brief names. */
export const RELATION_FAMILY_FILTERS = ['all', 'structural', 'correspondential'] as const;
export type RelationFamilyFilterValue = (typeof RELATION_FAMILY_FILTERS)[number];

/** Does this edge survive the active filter? `all` keeps everything, including
 *  `unclassified` — a filter must narrow to a family, never quietly drop the
 *  edges the graph left unclassified. */
export function edgePassesRelationFamily(
    link: Pick<ExplorerLink, 'family'>,
    filter: RelationFamilyFilterValue
): boolean {
    return filter === 'all' || link.family === filter;
}

const LINKS_CYPHER =
        'MATCH (a:Bimba)-[r]->(b:Bimba) RETURN a.coordinate AS source, type(r) AS type, ' +
    // 28.T28.3 / DR-IG-1: the edge family must come FROM the graph — selecting
    // it here is what makes the relation-family filter honest rather than a
    // locally-guessed partition of relation types.
    'r.c_1_relation_family AS c_1_relation_family, b.coordinate AS target LIMIT 2500';
export interface GraphExplorerPaneProps {
    requestedM0Contribution?: string | null;
    requestedAtelierTerm?: string | null;
}

const M0_INTENT_LAYERS: Readonly<Record<string, M0InspectorLayer>> = Object.freeze({
    language: 'lang',
    'ql-structure': 'ql',
    relations: 'rel',
    'time-community': 'time'
});

export function GraphExplorerPane({
    requestedM0Contribution = null,
    requestedAtelierTerm = null
}: GraphExplorerPaneProps = {}) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const graphRef = useRef<ForceGraph | null>(null);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
    const [detail, setDetail] = useState('');
    const [atelierClusterCount, setAtelierClusterCount] = useState<number | null>(null);
    // 28.T28.3 (c) / DR-IG-1: the three-option edge partition. `all` shows every
    // edge INCLUDING unclassified ones — filtering to a family must never
    // silently hide edges the graph simply never classified.
    const [relationFamilyFilter, setRelationFamilyFilter] = useState<RelationFamilyFilterValue>('all');
    const [selectedSymbolicQuestion, setSelectedSymbolicQuestion] = useState<string | null>(null);
    const [languageSubtab, setLanguageSubtab] = useState<'reader' | 'browser'>('reader');
    const selectedCoordinate = useCoordinateStore(state => state.selected);
    const { state: m0Surface, update: updateM0Surface } = useM0Surface();
    const handleLayerChange = useCallback(
        (layer: M0InspectorLayer) => updateM0Surface({ activeLayer: layer }),
        [updateM0Surface]
    );

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
                const allLinks = coerceLinks(linksReceipt.artifact, ids);
                const links = allLinks.filter(link => edgePassesRelationFamily(link, relationFamilyFilter));
                const atelierClusters = etymologicalClusterIds(allLinks);
                setAtelierClusterCount(new Set(atelierClusters.values()).size);
                if (nodes.length === 0) {
                    setStatus('empty');
                    setDetail('the canonical graph returned no :Bimba nodes');
                    return;
                }
                setStatus('ready');
                setDetail(
                    relationFamilyFilter === 'all'
                        ? `${nodes.length} nodes · ${links.length} relations`
                        : `${nodes.length} nodes · ${links.length} of ${allLinks.length} relations (${relationFamilyFilter})`
                );
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
                        const cluster = atelierClusters.get(n.id);
                        return n.id === selected
                            ? ringLit
                            : cluster === undefined
                                ? (FAMILY_HUES[n.family] ?? inkDim)
                                : ATELIER_CLUSTER_HUES[cluster % ATELIER_CLUSTER_HUES.length];
                    })
                    .nodeRelSize(4)
                    .linkColor((link: unknown) => /etymolog|cognate/i.test((link as { type?: string }).type ?? '') ? 'rgba(199, 132, 255, 0.75)' : 'rgba(154, 143, 184, 0.25)')
                    // DR-IG-1: structural reads solid, correspondential dashed —
                    // the family is legible without opening the filter.
                    .linkLineDash((link: unknown) =>
                        (link as ExplorerLink).family === 'correspondential' ? [4, 3] : null
                    )
                    .backgroundColor('rgba(0,0,0,0)')
                    .onNodeClick((node: unknown) => {
                        useCoordinateStore.getState().setSelected((node as ExplorerNode).id);
                        graph.nodeColor(graph.nodeColor());
                    });
                if (requestedAtelierTerm) {
                    const needle = requestedAtelierTerm.trim().toLocaleLowerCase();
                    graph.nodeVisibility((node: unknown) => {
                        const candidate = node as ExplorerNode;
                        return candidate.id.toLocaleLowerCase().includes(needle)
                            || (candidate.label ?? '').toLocaleLowerCase().includes(needle);
                    });
                }
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
    }, [connected, requestedAtelierTerm, relationFamilyFilter]);

    if (!connected) {
        return <div className="pane-message">Gateway disconnected — the map needs S2.</div>;
    }
    return (
        <div
            className="graph-explorer"
            data-testid="graph-explorer"
            data-projection-lens="pratibimba.daily.atelier-cluster-lens"
            data-atelier-clusters={atelierClusterCount ?? undefined}
            data-atelier-term={requestedAtelierTerm ?? undefined}
            data-relation-family-filter={relationFamilyFilter}
        >
            <div className="graph-relation-family-filter" data-testid="relation-family-filter">
                <span className="graph-filter-label">Relations</span>
                {RELATION_FAMILY_FILTERS.map(value => (
                    <button
                        key={value}
                        type="button"
                        data-testid={`relation-family-${value}`}
                        aria-pressed={relationFamilyFilter === value}
                        onClick={() => setRelationFamilyFilter(value)}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <M0LayerRail
                activeLayer={m0Surface.activeLayer}
                requestedLayer={requestedM0Contribution ? M0_INTENT_LAYERS[requestedM0Contribution] : null}
                onLayerChange={handleLayerChange}
            />
            <div
                className="m0-surface-controls"
                data-testid="m0-surface-state"
                data-active-layer={m0Surface.activeLayer}
                data-implicate-explicate={m0Surface.implicateExplicate}
                data-mode={m0Surface.mode}
                data-selected-coordinate={selectedCoordinate ?? ''}
            >
                <button
                    type="button"
                    data-testid="m0-phase-implicate"
                    aria-pressed={m0Surface.implicateExplicate === 'implicate'}
                    onClick={() => updateM0Surface({ implicateExplicate: 'implicate' })}
                >
                    Implicate
                </button>
                <button
                    type="button"
                    data-testid="m0-phase-explicate"
                    aria-pressed={m0Surface.implicateExplicate === 'explicate'}
                    onClick={() => updateM0Surface({ implicateExplicate: 'explicate' })}
                >
                    Explicate
                </button>
            </div>
            {m0Surface.activeLayer === 'lang' ? (
                <>
                    <div className="m0-language-subtabs" role="tablist" aria-label="M0 language views">
                        <button
                            type="button"
                            role="tab"
                            data-testid="m0-language-subtab-reader"
                            aria-selected={languageSubtab === 'reader'}
                            onClick={() => setLanguageSubtab('reader')}
                        >
                            Language
                        </button>
                        <button
                            type="button"
                            role="tab"
                            data-testid="m0-language-subtab-browser"
                            aria-selected={languageSubtab === 'browser'}
                            onClick={() => setLanguageSubtab('browser')}
                        >
                            96-node browser
                        </button>
                    </div>
                    {languageSubtab === 'reader' ? (
                        <M0LanguageReaderPanel phase={m0Surface.implicateExplicate} />
                    ) : (
                        <M0LazyNodeBrowser />
                    )}
                </>
            ) : null}
            {m0Surface.activeLayer === 'ql' ? <M0QlStructureReaderPanel /> : null}
            {m0Surface.activeLayer === 'rel' ? <M0RelationsReaderPanel /> : null}
            {m0Surface.activeLayer === 'time' ? <M0CommunityClockPanel /> : null}
            <M0M5LibrarySeamPanel />
            <M0VirtueWitnessPanel onQuestionSelect={setSelectedSymbolicQuestion} />
            <M0SymbolicQuestionConsole
                selectedQuestion={selectedSymbolicQuestion}
                onSelectedQuestionChange={setSelectedSymbolicQuestion}
            />
            <M0ModeActionsPanel mode={m0Surface.mode} onModeChange={mode => updateM0Surface({ mode })} />
            <div className="pane-toolbar" data-testid="graph-status">
                <BridgeReadinessBadge bindingKey="s2.graph.node" />
                {status === 'loading' ? 'reading the canonical map…' : detail}
                {status === 'ready' && atelierClusterCount !== null
                    ? ` · ${atelierClusterCount} etymology clusters`
                    : null}
            </div>
            {status === 'error' ? (
                <div className="chat-error" data-testid="graph-error">
                    {detail}
                </div>
            ) : (
                // 28.T28.3: the surface reports what it is actually showing —
                // with a family filter active it names the narrowed count AND
                // the whole, so a narrowed graph can never be mistaken for a
                // smaller graph.
                <div className="graph-explorer-detail" data-testid="graph-explorer-detail">
                    {detail}
                </div>
            )}
            <div ref={hostRef} className="graph-host" />
            <M0ContemplationPromptFooter />
        </div>
    );
}
