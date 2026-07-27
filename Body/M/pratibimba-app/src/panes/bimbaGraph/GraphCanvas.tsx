/**
 * Coordinate: M' M0' (Bimba graph canvas — rerun 28.T28.3(b))
 * Residency: Body/M/pratibimba-app/src/panes/bimbaGraph/GraphCanvas.tsx
 * Position (#n): #2 — Operation; the one component that draws the canonical map
 * Actualises: 28.3(b) — the sub-component both renderings live in, with the
 *   brief's prop shape (`subgraph` / `renderingMode` / `activeCoordinate` /
 *   `relationFamilyFilter` / `onNodeClick` / `onEdgeHover`) carrier-translated:
 *   the payload is the carrier's own `{nodes, links}` lattice rather than the
 *   frozen `BimbaSubgraphPayload`, because the carrier reads the lattice once
 *   and projects both modes from it (see renderingMode.ts).
 *
 *   SOLAR-ANCHOR (daily 0/1): an SVG sun-and-planets card — the anchored
 *   coordinate at centre, its immediate neighbours radiating, ≤6. Nodes carry
 *   the family hue; correspondential edges are dashed and structural solid per
 *   DR-IG-1, so the family is legible without opening the filter. Every node is
 *   a real button (click + Enter/Space) so the preview NAVIGATES rather than
 *   merely illustrating.
 *   FULL-LATTICE (ide-deep): the force-graph over the whole loaded set, with
 *   the atelier-cluster lens hues and the same edge-family grammar.
 *
 *   Honest empty states, three of them, because they mean different things: no
 *   coordinate anchored yet; an anchor the loaded window does not contain; an
 *   anchor with no relations under the active filter. Collapsing those into one
 *   "no data" would hide a window limit behind an apparent fact about the graph.
 * Public surface: BimbaSubgraph, GraphCanvasProps, GraphCanvas.
 * Does NOT own: the graph read or its status line (panes/GraphExplorerPane.tsx),
 *   the edge classification (panes/m0RelationFamily.ts), the mode law
 *   (bimbaGraph/renderingMode.ts), the family partition
 *   (bimbaGraph/relationFamilyFilter.ts), or the palette (ui/tokens.ts).
 * Contract: [[M0'-SPEC]] + rerun tranche [[28.T28.3]] (DR-IG-1).
 */

import { useEffect, useRef } from 'react';
import ForceGraph from 'force-graph';
import type { ExplorerLink, ExplorerNode } from '../graphData';
import { ATELIER_CLUSTER_HUES, FAMILY_HUES, inkDim, ringLit } from '../../ui/tokens';
import { edgePassesRelationFamily, type RelationFamilyFilterValue } from './relationFamilyFilter';
import {
    linkEndpointId,
    solarAnchorProjection,
    SOLAR_ANCHOR_MAX_NEIGHBOURS,
    type RenderingMode
} from './renderingMode';

export interface BimbaSubgraph {
    readonly nodes: readonly ExplorerNode[];
    readonly links: readonly ExplorerLink[];
}

export interface GraphCanvasProps {
    readonly subgraph: BimbaSubgraph;
    readonly renderingMode: RenderingMode;
    readonly activeCoordinate: string | null;
    readonly relationFamilyFilter: RelationFamilyFilterValue;
    readonly onNodeClick: (coordinate: string) => void;
    readonly onEdgeHover: (edge: ExplorerLink) => void;
    /** Read-only atelier lens: component id per coordinate (etymology clusters). */
    readonly atelierClusters?: ReadonlyMap<string, number>;
    /** Atelier term narrowing — hides non-matching nodes in the full lattice. */
    readonly highlightTerm?: string | null;
}

const SVG_WIDTH = 520;
const SVG_HEIGHT = 320;
const SVG_CENTER_X = SVG_WIDTH / 2;
const SVG_CENTER_Y = SVG_HEIGHT / 2;
const ANCHOR_RADIUS = 26;
const NEIGHBOUR_RADIUS = 16;
const ORBIT_RADIUS = 92;
/** The orbit is drawn as an ellipse — the card is wider than it is tall. */
const ORBIT_FLATTENING = 0.72;

function hueFor(node: ExplorerNode, clusters: ReadonlyMap<string, number> | undefined): string {
    const cluster = clusters?.get(node.id);
    if (cluster !== undefined) {
        return ATELIER_CLUSTER_HUES[cluster % ATELIER_CLUSTER_HUES.length];
    }
    return FAMILY_HUES[node.family] ?? inkDim;
}

/** Evenly spaced orbit, first neighbour at twelve o'clock. */
function orbitAngle(index: number, total: number): number {
    return (Math.PI * 2 * index) / Math.max(total, 1) - Math.PI / 2;
}

function SolarAnchor({
    subgraph,
    activeCoordinate,
    relationFamilyFilter,
    onNodeClick,
    onEdgeHover,
    atelierClusters
}: GraphCanvasProps) {
    const projection = solarAnchorProjection(
        subgraph.nodes,
        subgraph.links,
        activeCoordinate,
        relationFamilyFilter
    );

    if (!projection.anchor) {
        return (
            <div
                className="bimba-graph-canvas-empty"
                data-testid="bimba-graph-canvas-empty"
                data-rendering-mode="solar-anchor"
                data-anchor-off-window={projection.anchorOffWindow ? 'true' : undefined}
            >
                {projection.anchorOffWindow
                    ? `${projection.anchorCoordinate} is not in the loaded window — open the deep layout for the full lattice`
                    : 'No coordinate anchored yet — select one to see its immediate relations'}
            </div>
        );
    }

    const anchor = projection.anchor;
    const placed = projection.neighbours.map((neighbour, index) => {
        const theta = orbitAngle(index, projection.neighbours.length);
        return {
            ...neighbour,
            x: SVG_CENTER_X + Math.cos(theta) * ORBIT_RADIUS,
            y: SVG_CENTER_Y + Math.sin(theta) * ORBIT_RADIUS * ORBIT_FLATTENING
        };
    });

    return (
        <div className="bimba-graph-canvas-host" data-testid="bimba-graph-canvas-host">
            <svg
                className="bimba-graph-canvas bimba-graph-canvas-solar-anchor"
                data-testid="bimba-graph-canvas"
                data-rendering-mode="solar-anchor"
                data-relation-family-filter={relationFamilyFilter}
                data-anchor-coordinate={anchor.id}
                data-neighbour-count={placed.length}
                data-neighbour-total={projection.neighbourTotal}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                role="img"
                aria-label={`Solar anchor for ${anchor.id}: ${placed.length} of ${projection.neighbourTotal} immediate relations`}
            >
                {placed.map(neighbour => (
                    <line
                        key={`edge-${neighbour.node.id}`}
                        className={`bimba-graph-edge bimba-graph-edge-${neighbour.link.family}`}
                        x1={SVG_CENTER_X}
                        y1={SVG_CENTER_Y}
                        x2={neighbour.x}
                        y2={neighbour.y}
                        stroke={inkDim}
                        strokeDasharray={neighbour.link.family === 'correspondential' ? '6 5' : undefined}
                        data-testid={`bimba-edge-${neighbour.node.id}`}
                        data-relation-family={neighbour.link.family}
                        data-relation-type={neighbour.link.type}
                        data-relation-direction={neighbour.direction}
                        onMouseEnter={() => onEdgeHover(neighbour.link)}
                        onFocus={() => onEdgeHover(neighbour.link)}
                    />
                ))}
                <g
                    className="bimba-graph-node bimba-graph-node-anchor"
                    data-testid="bimba-graph-anchor-node"
                    data-coordinate={anchor.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Anchored coordinate ${anchor.id}`}
                    onClick={() => onNodeClick(anchor.id)}
                    onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onNodeClick(anchor.id);
                        }
                    }}
                >
                    <circle
                        cx={SVG_CENTER_X}
                        cy={SVG_CENTER_Y}
                        r={ANCHOR_RADIUS}
                        fill={hueFor(anchor, atelierClusters)}
                        stroke={ringLit}
                    />
                    <text
                        className="bimba-graph-label bimba-graph-label-anchor"
                        x={SVG_CENTER_X}
                        y={SVG_CENTER_Y + ANCHOR_RADIUS + 17}
                        textAnchor="middle"
                    >
                        {anchor.id}
                    </text>
                    <title>{anchor.label ? `${anchor.id} — ${anchor.label}` : anchor.id}</title>
                </g>
                {placed.map(neighbour => (
                    <g
                        key={`node-${neighbour.node.id}`}
                        className="bimba-graph-node bimba-graph-node-neighbour"
                        data-testid="bimba-graph-neighbour-node"
                        data-coordinate={neighbour.node.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open coordinate ${neighbour.node.id}`}
                        onClick={() => onNodeClick(neighbour.node.id)}
                        onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onNodeClick(neighbour.node.id);
                            }
                        }}
                    >
                        <circle
                            cx={neighbour.x}
                            cy={neighbour.y}
                            r={NEIGHBOUR_RADIUS}
                            fill={hueFor(neighbour.node, atelierClusters)}
                        />
                        <text
                            className="bimba-graph-label"
                            x={neighbour.x}
                            y={neighbour.y + NEIGHBOUR_RADIUS + 13}
                            textAnchor="middle"
                        >
                            {neighbour.node.id}
                        </text>
                        <title>
                            {`${neighbour.link.type} (${neighbour.link.family}) — ${
                                neighbour.node.label ?? neighbour.node.id
                            }`}
                        </title>
                    </g>
                ))}
            </svg>
            <p className="bimba-graph-canvas-caption" data-testid="bimba-graph-canvas-caption">
                {projection.neighbourTotal > SOLAR_ANCHOR_MAX_NEIGHBOURS
                    ? `${placed.length} of ${projection.neighbourTotal} immediate relations`
                    : `${projection.neighbourTotal} immediate relations`}
                {projection.neighbourTotal === 0
                    ? relationFamilyFilter === 'all'
                        ? ' — none in the loaded window'
                        : ` — none of family ${relationFamilyFilter} in the loaded window`
                    : null}
            </p>
        </div>
    );
}

function FullLattice({
    subgraph,
    activeCoordinate,
    relationFamilyFilter,
    onNodeClick,
    onEdgeHover,
    atelierClusters,
    highlightTerm
}: GraphCanvasProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const graphRef = useRef<ForceGraph | null>(null);
    const nodes = subgraph.nodes;
    const links = subgraph.links;

    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        // force-graph MUTATES the objects it is handed (string endpoints become
        // node objects). It gets copies so the pane's own link set — which the
        // solar anchor and the counts read — is never rewritten underneath them.
        const rendered = links
            .filter(link => edgePassesRelationFamily(link, relationFamilyFilter))
            .map(link => ({ ...link }));
        const graph = new ForceGraph(host)
            .graphData({ nodes: nodes.map(node => ({ ...node })), links: rendered })
            .nodeId('id')
            .nodeLabel((node: unknown) => {
                const n = node as ExplorerNode;
                return n.label ? `${n.id} — ${n.label}` : n.id;
            })
            .nodeColor((node: unknown) => {
                const n = node as ExplorerNode;
                return n.id === activeCoordinate ? ringLit : hueFor(n, atelierClusters);
            })
            .nodeRelSize(4)
            .linkColor((link: unknown) =>
                /etymolog|cognate/i.test((link as { type?: string }).type ?? '')
                    ? ATELIER_CLUSTER_HUES[0]
                    : inkDim
            )
            // DR-IG-1: structural reads solid, correspondential dashed — the
            // family is legible without opening the filter.
            .linkLineDash((link: unknown) =>
                (link as ExplorerLink).family === 'correspondential' ? [4, 3] : null
            )
            .backgroundColor('rgba(0,0,0,0)')
            .onNodeClick((node: unknown) => onNodeClick((node as ExplorerNode).id))
            .onLinkHover((link: unknown) => {
                if (link) {
                    onEdgeHover(link as ExplorerLink);
                }
            });
        if (highlightTerm) {
            const needle = highlightTerm.trim().toLocaleLowerCase();
            graph.nodeVisibility((node: unknown) => {
                const candidate = node as ExplorerNode;
                return (
                    candidate.id.toLocaleLowerCase().includes(needle) ||
                    (candidate.label ?? '').toLocaleLowerCase().includes(needle)
                );
            });
        }
        graphRef.current = graph;
        return () => {
            graphRef.current?._destructor?.();
            graphRef.current = null;
        };
    }, [nodes, links, relationFamilyFilter, activeCoordinate, atelierClusters, highlightTerm, onNodeClick, onEdgeHover]);

    const renderedCount = links.filter(link => edgePassesRelationFamily(link, relationFamilyFilter)).length;
    return (
        <div
            ref={hostRef}
            className="graph-host bimba-graph-canvas bimba-graph-canvas-full-lattice"
            data-testid="bimba-graph-canvas"
            data-rendering-mode="full-lattice"
            data-relation-family-filter={relationFamilyFilter}
            data-node-count={nodes.length}
            data-edge-count={renderedCount}
        />
    );
}

/**
 * The one canvas. The mode decides the rendering; everything else — the data,
 * the filter, the click law — is identical in both, which is the point of
 * having one component rather than two surfaces that drift.
 */
export function GraphCanvas(props: GraphCanvasProps) {
    return props.renderingMode === 'full-lattice' ? <FullLattice {...props} /> : <SolarAnchor {...props} />;
}

export { linkEndpointId };
