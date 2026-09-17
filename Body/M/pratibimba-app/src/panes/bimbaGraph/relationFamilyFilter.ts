/**
 * Coordinate: M' M0' (relation-family edge partition — rerun 28.T28.3(c), DR-IG-1)
 * Residency: Body/M/pratibimba-app/src/panes/bimbaGraph/relationFamilyFilter.ts
 * Position (#n): #2 — Operation; the predicate one law both renderings obey
 * Actualises: DR-IG-1's three-option edge partition as a pure predicate,
 *   extracted from GraphExplorerPane so the canvas (28.3b) and the pane share
 *   ONE law rather than two copies. `all` keeps every edge INCLUDING the
 *   `unclassified` ones — narrowing must never silently drop edges the graph
 *   simply never classified.
 * Public surface: RELATION_FAMILY_FILTERS, RelationFamilyFilterValue,
 *   edgePassesRelationFamily.
 * Does NOT own: the edge shape (panes/graphData.ts), the classification law
 *   (panes/m0RelationFamily.ts — family is READ from `c_1_relation_family`,
 *   never inferred), or the rendering (bimbaGraph/GraphCanvas.tsx).
 * Contract: [[M0'-SPEC]] + rerun tranche [[28.T28.3]] (DR-IG-1).
 */

import type { ExplorerLink } from '../graphData';

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
