/**
 * Coordinate: M' M4' (q_ scrubber law — Track 08.T8.8)
 * Actualises: the release-gate snapshot acceptance — a synthetic envelope
 *   with all four private fields + public q_5 / qm_5 fields scrubs to only
 *   the public ones with a refusal line per private field; derivatives and
 *   unknown q-shapes handled per DR-M4-4.
 */

import { describe, expect, it } from 'vitest';
import { scrubQPartition } from './qPrivacyScrubber';

describe('q_ privacy partition scrubber (08.T8.8 / DR-M4-4)', () => {
    it('release-gate snapshot: four private fields scrubbed with refusals; public q_5_*/qm_5_* pass', () => {
        const result = scrubQPartition({
            q_personal: { natal: 'SECRET' },
            q_identity: 'SECRET',
            q_activity: [1, 2, 3],
            q_composed: 'SECRET',
            q_5_reflection_summary: 'public wisdom',
            q_5_quintessence_note: 'public',
            qm_5_curation_state: 'candidate',
            generation: 42
        });
        expect(Object.keys(result.scrubbed).sort()).toEqual([
            'generation',
            'q_5_quintessence_note',
            'q_5_reflection_summary',
            'qm_5_curation_state'
        ]);
        expect(result.refusals).toHaveLength(4);
        for (const refusal of result.refusals) {
            expect(refusal).toContain('DR-M4-4 refusal');
        }
        expect(JSON.stringify(result.scrubbed)).not.toContain('SECRET');
    });

    it('prefix DERIVATIVES of the four reserved names are equally private', () => {
        const result = scrubQPartition({
            q_personal_resonance: 0.7,
            q_identity_hash_preview: 'ab12',
            q_composed_handle: 'q_composed://x'
        });
        expect(Object.keys(result.scrubbed)).toHaveLength(0);
        expect(result.refusals).toHaveLength(3);
    });

    it('unknown q-shaped keys are ERRORS — never silently passed or dropped', () => {
        const result = scrubQPartition({ q_wildcard_thing: 1, qm_bogus: 2 });
        expect(Object.keys(result.scrubbed)).toHaveLength(0);
        expect(result.errors).toHaveLength(2);
    });

    it("the inversion slot is honored: q_4_i'_locality-style keys parse as public", () => {
        const result = scrubQPartition({ "q_4_5'_locality_signature": 'public' });
        expect(result.scrubbed["q_4_5'_locality_signature"]).toBe('public');
        expect(result.errors).toHaveLength(0);
    });
});
