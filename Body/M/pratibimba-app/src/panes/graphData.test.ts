import { describe, expect, it } from 'vitest';
import { coerceLinks, coerceNodes, etymologicalClusterIds, familyOf, queryRows } from './graphData';

describe('graph data coercion', () => {
    it('extracts rows from bare arrays and wrapped shapes', () => {
        expect(queryRows([{ a: 1 }])).toHaveLength(1);
        expect(queryRows({ rows: [{ a: 1 }, { b: 2 }] })).toHaveLength(2);
        expect(queryRows({ records: [{ a: 1 }] })).toHaveLength(1);
        expect(queryRows(null)).toEqual([]);
    });

    it('dedupes nodes and assigns family hues by coordinate prefix', () => {
        const nodes = coerceNodes([
            { coordinate: 'M1-2', label: 'Ananda' },
            { coordinate: 'M1-2', label: 'dup' },
            { coordinate: 'S3', label: null },
            { notACoordinate: true }
        ]);
        expect(nodes).toHaveLength(2);
        expect(nodes[0]).toMatchObject({ id: 'M1-2', family: 'M' });
        expect(familyOf('S3')).toBe('S');
        expect(familyOf('4.4.4.4')).toBe('M'); // non-family prefixes fall to M ground
    });

    it('drops links whose endpoints are not in the node set', () => {
        const ids = new Set(['M1', 'M2']);
        const links = coerceLinks(
            [
                { source: 'M1', target: 'M2', type: 'structural' },
                { source: 'M1', target: 'GHOST', type: 'structural' }
            ],
            ids
        );
        expect(links).toHaveLength(1);
        expect(links[0]).toMatchObject({ source: 'M1', target: 'M2', type: 'structural' });
    });

    it('groups only declared etymological and cognate relation components', () => {
        const clusters = etymologicalClusterIds([
            { source: 'M0', target: 'M1', type: 'ETYMOLOGICAL_COGNATE' },
            { source: 'M1', target: 'M2', type: 'cognate' },
            { source: 'M2', target: 'M3', type: 'STRUCTURAL' }
        ]);
        expect(clusters.get('M0')).toBe(clusters.get('M2'));
        expect(clusters.has('M3')).toBe(false);
    });
});
