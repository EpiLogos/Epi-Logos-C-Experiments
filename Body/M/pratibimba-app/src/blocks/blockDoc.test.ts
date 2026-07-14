/**
 * Coordinate: M' (block-doc persistence tests — Tranche 44.T44.7)
 * Actualises: the round-trip law — Block[] → toDoc → fromDoc yields the same
 *   blocks in BOTH markdown and MDX; the C-family frontmatter carries
 *   coordinate / c_1_ct_type / c_3_ctx_frame / privacyClass; writes are
 *   path-guarded to Idea/Empty/Present/{day_id}/ (DR-PSS-4) with traversal
 *   refused.
 */

import { describe, expect, it } from 'vitest';
import type { Block } from './blockContract';
import { assertBlockDocWritablePath, fromDoc, toDoc } from './blockDoc';

const BLOCKS: readonly Block[] = [
    {
        id: 'briefing-1',
        type: 'rich-text',
        ctx: { cf: '(5/0)', ct: 'CT4b', cp: 'CP4.5' },
        coordinate: 'M4-3',
        privacyClass: 'protected',
        data: { text: 'the day opens under a Capricorn moon' }
    },
    {
        id: 'briefing-2',
        type: 'kairos-strip',
        ctx: { cf: '(5/0)', ct: 'CT4b', cp: 'CP4.5' },
        privacyClass: 'protected',
        data: { transits: ['saturn-trine-sun'] }
    }
];

describe('44.7 persisted block-doc', () => {
    it('round-trips Block[] through markdown with C-family frontmatter', () => {
        const doc = toDoc(BLOCKS, { format: 'markdown', coordinate: 'M4-3', dayId: '14-07-2026' });
        expect(doc).toContain('coordinate: "M4-3"');
        expect(doc).toContain('c_1_ct_type: "CT4b"');
        expect(doc).toContain('c_3_ctx_frame:');
        expect(doc).toContain('privacyClass: "protected"');
        expect(fromDoc(doc, 'markdown')).toEqual(BLOCKS);
    });

    it('round-trips Block[] through MDX with the same blocks', () => {
        const doc = toDoc(BLOCKS, { format: 'mdx', coordinate: 'M4-3', dayId: '14-07-2026' });
        expect(doc).toContain('export const blocks =');
        expect(doc).toContain('<PratibimbaBlockDoc');
        expect(fromDoc(doc, 'mdx')).toEqual(BLOCKS);
    });

    it('write paths are restricted to Idea/Empty/Present/{day_id}/ and traversal is refused (DR-PSS-4)', () => {
        expect(assertBlockDocWritablePath('Idea/Empty/Present/14-07-2026/daily-briefing.md')).toBe(
            'Idea/Empty/Present/14-07-2026/daily-briefing.md'
        );
        expect(() => assertBlockDocWritablePath('Idea/Bimba/World/canon.md')).toThrow(/restricted/);
        expect(() => assertBlockDocWritablePath('Idea/Empty/Present/14-07-2026/../../../World/x.md')).toThrow(
            /restricted/
        );
        expect(() => assertBlockDocWritablePath('Idea/Empty/Present/14-07-2026/note.canvas')).toThrow(
            /restricted/
        );
    });
});
