/**
 * Coordinate: M' M0' (relation-family filter law — 28.T28.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: DR-IG-1's three-option edge partition as a pure predicate, so
 *   the law is testable apart from the force-graph canvas: `all` keeps every
 *   edge INCLUDING unclassified ones (narrowing must never silently drop the
 *   edges the graph never classified), and each family option keeps only its
 *   own.
 * Does NOT own: the edge shape (graphData.ts) or the classification law
 *   (m0RelationFamily.ts).
 */

import { describe, expect, it } from 'vitest';
import { RELATION_FAMILY_FILTERS, edgePassesRelationFamily } from './GraphExplorerPane';

describe('28.T28.3 — the relation-family filter', () => {
    it('offers exactly the three options the brief names', () => {
        expect([...RELATION_FAMILY_FILTERS]).toEqual(['all', 'structural', 'correspondential']);
    });

    it('`all` keeps every edge, unclassified included', () => {
        for (const family of ['structural', 'correspondential', 'kernel_core', 'unclassified'] as const) {
            expect(edgePassesRelationFamily({ family }, 'all')).toBe(true);
        }
    });

    it('narrows to exactly one family, and never lets another through', () => {
        expect(edgePassesRelationFamily({ family: 'structural' }, 'structural')).toBe(true);
        expect(edgePassesRelationFamily({ family: 'correspondential' }, 'structural')).toBe(false);
        expect(edgePassesRelationFamily({ family: 'unclassified' }, 'structural')).toBe(false);
        expect(edgePassesRelationFamily({ family: 'correspondential' }, 'correspondential')).toBe(true);
        expect(edgePassesRelationFamily({ family: 'structural' }, 'correspondential')).toBe(false);
    });
});
