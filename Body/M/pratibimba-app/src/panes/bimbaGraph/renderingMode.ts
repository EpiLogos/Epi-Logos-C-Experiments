/**
 * Coordinate: M' M0' (Bimba graph rendering mode — rerun 28.T28.3(a))
 * Residency: Body/M/pratibimba-app/src/panes/bimbaGraph/renderingMode.ts
 * Position (#n): #4 — Context; the layout decides HOW the map is read
 * Actualises: 28.3(a) — `RenderingMode = 'solar-anchor' | 'full-lattice'`
 *   switched by the `epi-logos.layout.active` shell preference. The daily 0/1
 *   layout PREVIEWS (a compact solar anchor: the active coordinate plus its
 *   immediate neighbours, ≤6) and the deep IDE layout DELIVERS DEPTH (the full
 *   lattice). That split is the shell law `M'-TAURI-PORT-SPEC.md:65` states —
 *   "Shell surfaces preview; subsystem pages deliver depth. Do not merge them."
 *
 *   CARRIER TRANSLATION, stated so it is never mistaken for the frozen shape.
 *   The frozen widget fetched a per-coordinate `BimbaSubgraphPayload` through
 *   `openCoordinate()`. The carrier pane instead reads the lattice once
 *   (`s2.graph.query`) and BOTH modes project that ONE fetched set: full-lattice
 *   renders it whole, solar-anchor projects the anchor's own neighbourhood out
 *   of it. One read, one source of truth, one relation-family law — and the
 *   projection is honest about its window: an anchor the loaded set does not
 *   contain reports exactly that, rather than rendering a false "no relations".
 * Public surface: RenderingMode, RENDERING_MODES, renderingModeForLayout,
 *   SOLAR_ANCHOR_MAX_NEIGHBOURS, SolarAnchorNeighbour, SolarAnchorProjection,
 *   linkEndpointId, solarAnchorProjection.
 * Does NOT own: the layout id vocabulary (ui/layoutId.ts / omnipanelRuntime.ts),
 *   the graph read (panes/GraphExplorerPane.tsx), the edge shape
 *   (panes/graphData.ts), or the family partition (relationFamilyFilter.ts).
 * Contract: [[M0'-SPEC]] + [[M5'-SPEC]] §layout + rerun tranche [[28.T28.3]].
 */

import type { ExplorerLink, ExplorerNode } from '../graphData';
import { edgePassesRelationFamily, type RelationFamilyFilterValue } from './relationFamilyFilter';

export const RENDERING_MODES = ['solar-anchor', 'full-lattice'] as const;
export type RenderingMode = (typeof RENDERING_MODES)[number];

/** The brief's cap: the solar anchor shows the immediate neighbours, ≤6. */
export const SOLAR_ANCHOR_MAX_NEIGHBOURS = 6;

/**
 * 28.3(a): the deep layout renders the full lattice; every other layout — the
 * daily 0/1 preview and any unset/unknown value — renders the solar anchor.
 * Mirrors the frozen `renderingModeForLayout` exactly.
 */
export function renderingModeForLayout(layout: string | null | undefined): RenderingMode {
    return layout === 'ide-deep' ? 'full-lattice' : 'solar-anchor';
}

export interface SolarAnchorNeighbour {
    readonly node: ExplorerNode;
    /** The edge that made this node a neighbour — carries family + provenance. */
    readonly link: ExplorerLink;
    /** `out` = the anchor points at it; `in` = it points at the anchor. */
    readonly direction: 'out' | 'in';
}

export interface SolarAnchorProjection {
    /** The anchor node, or null when nothing is anchored / it is off-window. */
    readonly anchor: ExplorerNode | null;
    readonly anchorCoordinate: string | null;
    /** True when a coordinate IS anchored but the loaded node set lacks it. */
    readonly anchorOffWindow: boolean;
    /** The rendered neighbours — deduped, filtered, capped at ≤6. */
    readonly neighbours: readonly SolarAnchorNeighbour[];
    /** How many distinct neighbours survived the filter BEFORE the ≤6 cap, so
     *  a capped card can say "6 of 23" instead of implying it showed them all. */
    readonly neighbourTotal: number;
}

/**
 * force-graph mutates the link objects it is handed, replacing the string
 * endpoints with node objects. Every reader of an endpoint therefore goes
 * through here rather than assuming a string.
 */
export function linkEndpointId(endpoint: unknown): string | null {
    if (typeof endpoint === 'string') {
        return endpoint;
    }
    const id = (endpoint as { id?: unknown } | null)?.id;
    return typeof id === 'string' ? id : null;
}

/**
 * Project the solar anchor out of the loaded lattice: the anchor plus its
 * immediate neighbours, filtered by the active relation family, deduped by
 * coordinate (the first edge to reach a neighbour is the one drawn), capped at
 * SOLAR_ANCHOR_MAX_NEIGHBOURS.
 */
export function solarAnchorProjection(
    nodes: readonly ExplorerNode[],
    links: readonly ExplorerLink[],
    activeCoordinate: string | null,
    filter: RelationFamilyFilterValue
): SolarAnchorProjection {
    if (!activeCoordinate) {
        return {
            anchor: null,
            anchorCoordinate: null,
            anchorOffWindow: false,
            neighbours: [],
            neighbourTotal: 0
        };
    }
    const byId = new Map(nodes.map(node => [node.id, node]));
    const anchor = byId.get(activeCoordinate) ?? null;
    if (!anchor) {
        return {
            anchor: null,
            anchorCoordinate: activeCoordinate,
            anchorOffWindow: true,
            neighbours: [],
            neighbourTotal: 0
        };
    }

    const seen = new Set<string>();
    const neighbours: SolarAnchorNeighbour[] = [];
    for (const link of links) {
        if (!edgePassesRelationFamily(link, filter)) {
            continue;
        }
        const source = linkEndpointId(link.source);
        const target = linkEndpointId(link.target);
        const direction: 'out' | 'in' | null =
            source === activeCoordinate ? 'out' : target === activeCoordinate ? 'in' : null;
        if (!direction) {
            continue;
        }
        const otherId: string | null = direction === 'out' ? target : source;
        if (!otherId || otherId === activeCoordinate || seen.has(otherId)) {
            continue;
        }
        const node = byId.get(otherId);
        if (!node) {
            continue;
        }
        seen.add(otherId);
        neighbours.push({ node, link, direction });
    }

    return {
        anchor,
        anchorCoordinate: activeCoordinate,
        anchorOffWindow: false,
        neighbours: neighbours.slice(0, SOLAR_ANCHOR_MAX_NEIGHBOURS),
        neighbourTotal: neighbours.length
    };
}
