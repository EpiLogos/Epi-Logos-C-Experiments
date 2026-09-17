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
 *
 *   28.T28.3 folds three more laws in. (a) The RENDERING MODE follows the
 *   active layout — the daily 0/1 shell previews the anchored coordinate as a
 *   solar anchor, the deep layout renders the full lattice (renderingMode.ts).
 *   (b) Both renderings live in ONE sub-component (bimbaGraph/GraphCanvas.tsx);
 *   this pane owns the read, the state and the status line, never the drawing.
 *   (e) The gateway receipt crosses the CHROME-CONTRACT §7 privacy gate before
 *   anything is rendered: a refused class renders a refusal instead of the map
 *   and is counted in the federated PrivacyDropFeed (28.16), so a drop is
 *   visible rather than silently swallowed.
 *   28.T28.7 mounts the M5' Logos Atelier scent trail here — the lens
 *   `ui/dailySurfaceOwnership.ts` already declares this host carries ("M5-5'
 *   Logos Atelier lens over M0'") — but ONLY when a `logos-atelier`
 *   CrossLayoutIntent routed to it. The panel reads nothing on mount.
 * Public surface: GraphExplorerPane, GraphExplorerPaneProps,
 *   AtelierIntentContext,
 *   BIMBA_GRAPH_SURFACE_ID, RELATION_FAMILY_FILTERS, RelationFamilyFilterValue,
 *   edgePassesRelationFamily (the last three re-exported from
 *   bimbaGraph/relationFamilyFilter.ts, their authority since 28.3b).
 * Does NOT own: S2 graph law, world-clock computation, canon mutation, or
 *   protected Graphiti episode bodies; the drawing (bimbaGraph/GraphCanvas.tsx),
 *   the mode law (bimbaGraph/renderingMode.ts), the privacy vocabulary
 *   (ui/privacyGate.ts), or the drop sink (services/privacyDropFeed.ts).
 * Contract: [[M0'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] +
 *   rerun tranche [[28.T28.3]].
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { coerceLinks, coerceNodes, etymologicalClusterIds, ExplorerLink, ExplorerNode } from './graphData';
import { GraphCanvas } from './bimbaGraph/GraphCanvas';
import { renderingModeForLayout } from './bimbaGraph/renderingMode';
import {
    RELATION_FAMILY_FILTERS,
    edgePassesRelationFamily,
    type RelationFamilyFilterValue
} from './bimbaGraph/relationFamilyFilter';
import type { OmniPanelLayoutId } from './omni/omnipanelRuntime';
import { isPrivacySafe, privacyRefusalReason } from '../ui/privacyGate';
import { privacyDropFeed as sharedPrivacyDropFeed, type PrivacyDropFeed } from '../services/privacyDropFeed';
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
import { AtelierScentTrailPanel } from './atelier/AtelierScentTrailPanel';

const NODES_CYPHER =
    'MATCH (n:Bimba) RETURN n.coordinate AS coordinate, n.label AS label LIMIT 900';

/** The surface id the CHROME-CONTRACT §2 row carries as this pane's frozen
 *  lineage — and therefore the key its privacy drops are counted under. */
export const BIMBA_GRAPH_SURFACE_ID = 'bimba-graph-viewer';

// 28.T28.3(b): the filter vocabulary moved to bimbaGraph/relationFamilyFilter.ts
// so the canvas and the pane obey one law; re-exported here because it is this
// pane's published surface and its consumers (and tests) address it here.
export { RELATION_FAMILY_FILTERS, edgePassesRelationFamily };
export type { RelationFamilyFilterValue };

const LINKS_CYPHER =
        'MATCH (a:Bimba)-[r]->(b:Bimba) RETURN a.coordinate AS source, type(r) AS type, ' +
    // 28.T28.3 / DR-IG-1: the edge family must come FROM the graph — selecting
    // it here is what makes the relation-family filter honest rather than a
    // locally-guessed partition of relation types.
    'r.c_1_relation_family AS c_1_relation_family, b.coordinate AS target LIMIT 2500';
/**
 * 28.T28.7: what a `logos-atelier` CrossLayoutIntent carried here. The Atelier
 * is declared a LENS OVER this host (`ui/dailySurfaceOwnership.ts` —
 * "M5-5' Logos Atelier lens over M0'"), so its scent trail renders here, and
 * ONLY when an intent really routed to it. Absent this prop the pane is exactly
 * what it was — which is what keeps the cosmic deep model's opening tab quiet.
 */
export interface AtelierIntentContext {
    readonly contributionId: string;
    readonly artifactUri: string | null;
    readonly coordinate: string | null;
}

export interface GraphExplorerPaneProps {
    requestedM0Contribution?: string | null;
    requestedAtelierTerm?: string | null;
    atelierIntent?: AtelierIntentContext | null;
    /** 28.T28.3(a): the shell's active layout decides the rendering mode. The
     *  shell owns the value (App.tsx `activeLayout`); the pane only reads it. */
    activeLayout?: OmniPanelLayoutId;
    /** Injected in tests; production uses the shared federated sink (28.16). */
    privacyDropFeed?: PrivacyDropFeed;
}

const M0_INTENT_LAYERS: Readonly<Record<string, M0InspectorLayer>> = Object.freeze({
    language: 'lang',
    'ql-structure': 'ql',
    relations: 'rel',
    'time-community': 'time'
});

export function GraphExplorerPane({
    requestedM0Contribution = null,
    requestedAtelierTerm = null,
    atelierIntent = null,
    activeLayout = 'daily-0-1',
    privacyDropFeed = sharedPrivacyDropFeed
}: GraphExplorerPaneProps = {}) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error' | 'privacy-refused'>(
        'loading'
    );
    const [detail, setDetail] = useState('');
    const [subgraph, setSubgraph] = useState<{ nodes: ExplorerNode[]; links: ExplorerLink[] }>({
        nodes: [],
        links: []
    });
    const [atelierClusters, setAtelierClusters] = useState<ReadonlyMap<string, number>>(new Map());
    const [privacyDropped, setPrivacyDropped] = useState(
        () => privacyDropFeed.aggregate.byWidget[BIMBA_GRAPH_SURFACE_ID] ?? 0
    );
    const [atelierClusterCount, setAtelierClusterCount] = useState<number | null>(null);
    // 28.T28.3 (c) / DR-IG-1: the three-option edge partition. `all` shows every
    // edge INCLUDING unclassified ones — filtering to a family must never
    // silently hide edges the graph simply never classified.
    const [relationFamilyFilter, setRelationFamilyFilter] = useState<RelationFamilyFilterValue>('all');
    const [selectedSymbolicQuestion, setSelectedSymbolicQuestion] = useState<string | null>(null);
    const [languageSubtab, setLanguageSubtab] = useState<'reader' | 'browser'>('reader');
    /** The last edge the reader pointed at — the canvas' `onEdgeHover` lands
     *  here and is READ below, so the relation and its family are legible
     *  without inspecting the drawing. */
    const [hoveredEdge, setHoveredEdge] = useState<ExplorerLink | null>(null);
    const selectedCoordinate = useCoordinateStore(state => state.selected);
    const { state: m0Surface, update: updateM0Surface } = useM0Surface();
    const handleLayerChange = useCallback(
        (layer: M0InspectorLayer) => updateM0Surface({ activeLayer: layer }),
        [updateM0Surface]
    );

    useEffect(() => {
        if (!connected) {
            return;
        }
        let disposed = false;

        Promise.all([
            gateway().invoke('s2.graph.query', { cypher: NODES_CYPHER, params: {} }),
            gateway().invoke('s2.graph.query', { cypher: LINKS_CYPHER, params: {} })
        ])
            .then(([nodesReceipt, linksReceipt]) => {
                if (disposed) {
                    return;
                }
                // 28.T28.3(e) / CHROME-CONTRACT §7: the privacy gate runs BEFORE
                // the payload reaches any render tree. A refused receipt is
                // counted in the federated feed and never drawn.
                const refused = [nodesReceipt, linksReceipt].find(
                    receipt => !isPrivacySafe(receipt.privacyClass)
                );
                if (refused) {
                    privacyDropFeed.record(BIMBA_GRAPH_SURFACE_ID, refused.privacyClass);
                    setPrivacyDropped(privacyDropFeed.aggregate.byWidget[BIMBA_GRAPH_SURFACE_ID] ?? 0);
                    setSubgraph({ nodes: [], links: [] });
                    setAtelierClusters(new Map());
                    setAtelierClusterCount(null);
                    setStatus('privacy-refused');
                    setDetail(privacyRefusalReason(refused.privacyClass, 'M0′ chrome'));
                    return;
                }
                const nodes = coerceNodes(nodesReceipt.artifact);
                const ids = new Set(nodes.map(n => n.id));
                const allLinks = coerceLinks(linksReceipt.artifact, ids);
                const links = allLinks.filter(link => edgePassesRelationFamily(link, relationFamilyFilter));
                const clusters = etymologicalClusterIds(allLinks);
                setAtelierClusters(clusters);
                setAtelierClusterCount(new Set(clusters.values()).size);
                setSubgraph({ nodes, links: allLinks });
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
            })
            .catch(err => {
                if (!disposed) {
                    setStatus('error');
                    setDetail(err instanceof Error ? err.message : String(err));
                }
            });

        return () => {
            disposed = true;
        };
    }, [connected, relationFamilyFilter, privacyDropFeed]);

    // 28.T28.3(d): a node click publishes the coordinate to the ONE shared
    // store — the same publication the Coordinate Tree (28.6), breadcrumb,
    // status strip and every M0' panel subscribe to.
    const handleNodeClick = useCallback((coordinate: string) => {
        useCoordinateStore.getState().setSelected(coordinate);
    }, []);
    const handleEdgeHover = useCallback((edge: ExplorerLink) => setHoveredEdge(edge), []);
    const renderingMode = renderingModeForLayout(activeLayout);

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
            data-rendering-mode={renderingMode}
            data-active-layout={activeLayout}
            data-privacy-dropped={privacyDropped}
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
            {/* 28.T28.7: the M5' crystallisation lens, mounted only when a
                `logos-atelier` intent really routed here. It reads nothing and
                publishes nothing on mount — see THE OPENING-TAB LAW. */}
            {atelierIntent ? (
                <AtelierScentTrailPanel
                    artifactUri={atelierIntent.artifactUri}
                    coordinate={atelierIntent.coordinate ?? selectedCoordinate}
                />
            ) : null}
            <div className="pane-toolbar" data-testid="graph-status">
                <BridgeReadinessBadge bindingKey="s2.graph.node" />
                {status === 'loading' ? 'reading the canonical map…' : detail}
                {status === 'ready' && atelierClusterCount !== null
                    ? ` · ${atelierClusterCount} etymology clusters`
                    : null}
                {/* 28.T28.3(e): the drop count is chrome, not a log line — a
                    refusal the reader cannot see is a refusal they cannot audit. */}
                {privacyDropped > 0 ? (
                    <span data-testid="graph-privacy-dropped">
                        {` · ${privacyDropped} privacy-dropped`}
                    </span>
                ) : null}
            </div>
            {status === 'error' ? (
                <div className="chat-error" data-testid="graph-error">
                    {detail}
                </div>
            ) : status === 'privacy-refused' ? (
                <div className="chat-error" data-testid="graph-privacy-refused">
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
            {hoveredEdge ? (
                <div className="graph-explorer-detail" data-testid="graph-hovered-edge">
                    {`${hoveredEdge.type} (${hoveredEdge.family})`}
                </div>
            ) : null}
            {status === 'privacy-refused' ? null : (
                // 28.T28.3(a)+(b): one canvas, the mode chosen by the layout.
                <GraphCanvas
                    subgraph={subgraph}
                    renderingMode={renderingMode}
                    activeCoordinate={selectedCoordinate}
                    relationFamilyFilter={relationFamilyFilter}
                    onNodeClick={handleNodeClick}
                    onEdgeHover={handleEdgeHover}
                    atelierClusters={atelierClusters}
                    highlightTerm={requestedAtelierTerm}
                />
            )}
            <M0ContemplationPromptFooter />
        </div>
    );
}
