/**
 * Coordinate: M' M0' (graph data coercion, Phase-2)
 * Actualises: defensive coercion of `s2.graph.query` results into force-graph
 *   data. Pure functions, unit-tested; the pane renders what these return.
 *   Family hue discipline per THEIA-UI-PATTERNS §1.3 (carrier-independent).
 */

import {
    classifyRelationFamily,
    M0_RELATION_FAMILY_PROPERTY,
    type M0RelationFamilyKey
} from './m0RelationFamily';
import { FAMILY_HUES } from '../ui/tokens';

export interface ExplorerNode {
    id: string;
    label: string | null;
    family: string;
}

export interface ExplorerLink {
    source: string;
    target: string;
    type: string;
    /** 28.T28.3 / DR-IG-1: the edge's `c_1_relation_family`, READ from the
     *  graph. `unclassified` when the property is absent — the carrier never
     *  derives a family from the relation type (m0RelationFamily.ts law). */
    family: M0RelationFamilyKey;
    familyProvenance: 'graph' | 'absent';
}

// Hue values live in the JS token source (Track 30); re-exported so graph
// consumers keep importing the palette alongside the coercers.
export { FAMILY_HUES } from '../ui/tokens';

export function familyOf(coordinate: string): string {
    const first = coordinate.charAt(0).toUpperCase();
    return FAMILY_HUES[first] ? first : 'M';
}

/** Gateway query artifacts vary: bare row arrays, {rows}, {records}. */
export function queryRows(artifact: unknown): Record<string, unknown>[] {
    const raw = Array.isArray(artifact)
        ? artifact
        : ((artifact as { rows?: unknown[] } | null)?.rows ??
          (artifact as { records?: unknown[] } | null)?.records ??
          (artifact as { items?: unknown[] } | null)?.items ??
          []);
    return (raw as unknown[]).filter((r): r is Record<string, unknown> => !!r && typeof r === 'object');
}

export function coerceNodes(artifact: unknown): ExplorerNode[] {
    const seen = new Set<string>();
    const nodes: ExplorerNode[] = [];
    for (const row of queryRows(artifact)) {
        const coordinate = typeof row.coordinate === 'string' ? row.coordinate : null;
        if (!coordinate || seen.has(coordinate)) {
            continue;
        }
        seen.add(coordinate);
        nodes.push({
            id: coordinate,
            label: typeof row.label === 'string' ? row.label : null,
            family: familyOf(coordinate)
        });
    }
    return nodes;
}

export function coerceLinks(artifact: unknown, nodeIds: ReadonlySet<string>): ExplorerLink[] {
    const links: ExplorerLink[] = [];
    for (const row of queryRows(artifact)) {
        const source = typeof row.source === 'string' ? row.source : null;
        const target = typeof row.target === 'string' ? row.target : null;
        if (!source || !target || !nodeIds.has(source) || !nodeIds.has(target)) {
            continue;
        }
        links.push({
            source,
            target,
            type: typeof row.type === 'string' ? row.type : 'RELATES',
            ...classifyRelationFamily(row[M0_RELATION_FAMILY_PROPERTY])
        });
    }
    return links;
}

/** Read-only Atelier lens: components joined by declared etymological relations. */
export function etymologicalClusterIds(links: readonly Pick<ExplorerLink, 'source' | 'target' | 'type'>[]): ReadonlyMap<string, number> {
    const neighbours = new Map<string, Set<string>>();
    for (const link of links) {
        if (!/(etymolog|cognate)/i.test(link.type)) continue;
        for (const [from, to] of [[link.source, link.target], [link.target, link.source]] as const) {
            const members = neighbours.get(from) ?? new Set<string>();
            members.add(to);
            neighbours.set(from, members);
        }
    }
    const clusters = new Map<string, number>();
    let cluster = 0;
    for (const start of neighbours.keys()) {
        if (clusters.has(start)) continue;
        const pending = [start];
        while (pending.length) {
            const node = pending.pop()!;
            if (clusters.has(node)) continue;
            clusters.set(node, cluster);
            for (const neighbour of neighbours.get(node) ?? []) pending.push(neighbour);
        }
        cluster += 1;
    }
    return clusters;
}
