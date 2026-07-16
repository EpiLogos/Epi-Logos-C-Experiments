/**
 * Coordinate: M' M5-0' (Library projection tests — Track 16.T16.19)
 * Actualises: the Library lens contract — World/Types entries organise by
 *   coordinate ancestry root, coordinate-sorted shelves with path-sorted
 *   entries, and coordinate-less files land on the honest `uncoordinated`
 *   shelf last. A lens over what exists; nothing invented.
 */

import { describe, expect, it } from 'vitest';
import { buildLibraryProjection, coordinateFromMarkdown, shelfFor } from './libraryProjection';

describe('Library coordinate projection (CCT-19 activation)', () => {
    it('reads the coordinate from real YAML frontmatter without inferring invalid metadata', () => {
        expect(coordinateFromMarkdown('---\ncoordinate: "M5-0.2"\ntags:\n  - library\n---\nbody')).toBe('M5-0.2');
        expect(coordinateFromMarkdown("---\ncoordinate: S3'\n---\nbody")).toBe("S3'");
        expect(coordinateFromMarkdown('---\ncoordinate: [not, scalar]\n---\nbody')).toBeNull();
        expect(coordinateFromMarkdown('plain markdown')).toBeNull();
    });

    it('shelves by coordinate ancestry root, primes preserved', () => {
        expect(shelfFor('C2-1')).toBe('C2');
        expect(shelfFor('M5-4.2')).toBe('M5');
        expect(shelfFor("S3'")).toBe("S3'");
        expect(shelfFor('C4/L2')).toBe('C4');
        expect(shelfFor(null)).toBe('uncoordinated');
        expect(shelfFor('  ')).toBe('uncoordinated');
    });

    it('organises World/Types entries by coordinate with uncoordinated last', () => {
        const shelves = buildLibraryProjection([
            { path: 'Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md', coordinate: 'C2-1' },
            { path: 'Idea/Bimba/World/Types/Coordinates/C/C2/C2.md', coordinate: 'C2' },
            { path: 'Idea/Bimba/World/Types/Coordinates/M/M5/M5.md', coordinate: 'M5' },
            { path: 'Idea/Empty/Present/11-07-2026/loose-note.md', coordinate: null }
        ]);
        expect(shelves.map(shelf => shelf.shelf)).toEqual(['C2', 'M5', 'uncoordinated']);
        expect(shelves[0].entries.map(entry => entry.path)).toEqual([
            'Idea/Bimba/World/Types/Coordinates/C/C2/C2.md',
            'Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md'
        ]);
        expect(shelves[2].entries).toHaveLength(1);
    });
});
