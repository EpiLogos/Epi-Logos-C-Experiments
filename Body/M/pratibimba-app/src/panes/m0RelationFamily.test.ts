import { describe, expect, it } from 'vitest';
import {
    buildM0RelationFamilyProjection,
    M0_RELATION_FAMILIES,
    M0_RELATION_FAMILY_PROPERTY
} from './m0RelationFamily';

describe("m0RelationFamily — M0-2' two-family edge discrimination (rerun 01.T1.9, DR-IG-1)", () => {
    it('mirrors the schema relation-family enum + property (no carrier-local copy drift)', () => {
        expect(M0_RELATION_FAMILY_PROPERTY).toBe('c_1_relation_family');
        expect(M0_RELATION_FAMILIES).toEqual([
            'structural',
            'correspondential',
            'kernel_core',
            'inferred',
            'sync',
            'compatibility'
        ]);
    });

    it('discriminates edges by graph-sourced family — structural and correspondential never collapse', () => {
        const p = buildM0RelationFamilyProjection([
            { source: 'M0-0', target: 'M0-1', type: 'DEFINES', c_1_relation_family: 'structural' },
            { source: 'M2-3', target: 'M3-4', type: 'RESONATES_WITH', c_1_relation_family: 'correspondential' },
            { source: 'M0-2', target: 'M0-3', type: 'PROMOTES_TO', c_1_relation_family: 'structural' }
        ]);
        const structural = p.groups.find(g => g.family === 'structural');
        const correspondential = p.groups.find(g => g.family === 'correspondential');
        expect(structural?.edges.length).toBe(2);
        expect(correspondential?.edges.length).toBe(1);
        expect(structural?.family).not.toBe(correspondential?.family);
        expect(structural?.edges[0].familyProvenance).toBe('graph');
    });

    it('NEVER locally infers family: an unfamilied edge is unclassified, not guessed from its type', () => {
        // REFERENCES is structurally a structural edge — but with NO c_1_relation_family
        // on the record, the carrier must NOT derive one. That is the whole point of the tranche.
        const p = buildM0RelationFamilyProjection([{ source: 'A', target: 'B', type: 'REFERENCES' }]);
        expect(p.edges[0].family).toBe('unclassified');
        expect(p.edges[0].familyProvenance).toBe('absent');
        expect(p.unclassifiedCount).toBe(1);
        expect(p.locallyInferred).toBe(false);
        expect(p.groups.find(g => g.family === 'structural')).toBeUndefined();
    });

    it('does not coerce an out-of-enum family value — it stays unclassified', () => {
        const p = buildM0RelationFamilyProjection([
            { source: 'A', target: 'B', type: 'X', c_1_relation_family: 'made_up_family' }
        ]);
        expect(p.edges[0].family).toBe('unclassified');
        expect(p.edges[0].familyProvenance).toBe('absent');
    });

    it('returns a frozen, read-only projection', () => {
        const p = buildM0RelationFamilyProjection([
            { source: 'A', target: 'B', type: 'X', c_1_relation_family: 'kernel_core' }
        ]);
        expect(Object.isFrozen(p)).toBe(true);
        expect(Object.isFrozen(p.groups)).toBe(true);
        expect(Object.isFrozen(p.edges)).toBe(true);
    });
});
