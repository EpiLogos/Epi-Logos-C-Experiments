import { describe, expect, it } from 'vitest';
import {
    LENS_DIALECTS,
    LENS_READING_PRIVACY_CLASS,
    buildLensReadingCard,
    buildSynthesizedProjection,
    lensRoute,
    parseLensApplyResult,
    projectLensReadingToCanon
} from './m4LensApplication';
import type { VakAddress } from '../bridge/types';

const VAK: VakAddress = { cpf: '0/1', ct: '0/1/2', cp: '4.0/1-4.4/5', cf: '5/0', cfp: 'x', cs: 'y' };

// A subject body that MUST stay protected-local — used to prove it never leaks.
const SECRET_SUBJECT = 'my private journal entry about a painful dream';

const RAW_APPLY = {
    lens: 'Sensation',
    lens_index: 3,
    mode: 'day',
    element: 'earth',
    klein_square_names: ['Ground', 'Definition', 'Operation', 'Pattern'],
    elemental_profile: { primary: 'earth' },
    target: SECRET_SUBJECT,
    analysis: 'the dream reads as a grounding of unintegrated sensation'
};

describe('m4 lens application — parse + dialects (25.T25.12)', () => {
    it('exposes exactly the three lens dialects (Jungian / Trika / Phenomenal)', () => {
        expect([...LENS_DIALECTS].sort()).toEqual(['jungian', 'phenomenal', 'trika']);
    });

    it('parses a substrate LensApplyResult (snake_case) into the typed carrier shape', () => {
        const result = parseLensApplyResult(RAW_APPLY);
        expect(result.lens).toBe('Sensation');
        expect(result.lensIndex).toBe(3);
        expect(result.kleinSquareNames).toEqual(['Ground', 'Definition', 'Operation', 'Pattern']);
        expect(result.target).toBe(SECRET_SUBJECT);
        expect(result.analysis).toContain('grounding');
    });

    it('rejects a malformed apply result (missing klein square)', () => {
        expect(() => parseLensApplyResult({ ...RAW_APPLY, klein_square_names: ['a', 'b'] })).toThrow();
    });

    it('builds a lens route as a READING NAME (dialect:lens-index:name), not an authority claim', () => {
        expect(lensRoute('jungian', 3, 'Sensation')).toBe('jungian:lens-3:Sensation');
    });
});

describe('m4 lens application — reading card (25.T25.12)', () => {
    it('carries the reading name, active square, vak address, and marks the subject protected-local', () => {
        const card = buildLensReadingCard('jungian', parseLensApplyResult(RAW_APPLY), VAK);
        expect(card.dialect).toBe('jungian');
        expect(card.c_3_lens_route).toBe('jungian:lens-3:Sensation');
        expect(card.c_3_active_square).toEqual(['Ground', 'Definition', 'Operation', 'Pattern']);
        expect(card.vakAddress).toEqual(VAK);
        expect(card.privacyClass).toBe(LENS_READING_PRIVACY_CLASS);
        // subject is retained on the card for LOCAL display only
        expect(card.subject).toBe(SECRET_SUBJECT);
    });
});

describe('m4 lens application — protected-local canon projection (25.T25.12; the privacy boundary)', () => {
    it('projects ONLY lens route + active square + vak address to canon — never the subject body or analysis', () => {
        const card = buildLensReadingCard('jungian', parseLensApplyResult(RAW_APPLY), VAK);
        const projection = projectLensReadingToCanon(card);

        expect(projection.kind).toBe('contemplative');
        expect(projection.c_3_lens_route).toBe('jungian:lens-3:Sensation');
        expect(projection.c_3_active_square).toEqual(['Ground', 'Definition', 'Operation', 'Pattern']);
        expect(projection.vak_address).toEqual(VAK);

        // THE INVARIANT: neither the subject body nor the analysis body may cross.
        const serialized = JSON.stringify(projection);
        expect(serialized).not.toContain(SECRET_SUBJECT);
        expect(serialized).not.toContain('grounding of unintegrated sensation');
        expect(Object.keys(projection).sort()).toEqual(
            ['c_3_active_square', 'c_3_lens_route', 'kind', 'vak_address'].sort()
        );
    });
});

describe('m4 lens application — multi-lens synthesize (25.T25.12)', () => {
    const cardA = buildLensReadingCard('jungian', parseLensApplyResult(RAW_APPLY), VAK);
    const cardB = buildLensReadingCard(
        'trika',
        parseLensApplyResult({
            ...RAW_APPLY,
            lens: 'Iccha',
            lens_index: 1,
            klein_square_names: ['Will', 'Knowledge', 'Action', 'Bliss'],
            target: SECRET_SUBJECT,
            analysis: 'the will-impulse behind the image'
        }),
        VAK
    );

    it('requires at least two applications to synthesize', () => {
        expect(() => buildSynthesizedProjection([cardA])).toThrow(/two/i);
    });

    it('composes 2+ lens routes + active squares into one contemplative artifact with no subject leak', () => {
        const synth = buildSynthesizedProjection([cardA, cardB]);
        expect(synth.kind).toBe('contemplative');
        expect(synth.sourceCount).toBe(2);
        expect(synth.c_3_lens_routes).toEqual(['jungian:lens-3:Sensation', 'trika:lens-1:Iccha']);
        expect(synth.c_3_active_squares).toHaveLength(2);
        const serialized = JSON.stringify(synth);
        expect(serialized).not.toContain(SECRET_SUBJECT);
        expect(serialized).not.toContain('will-impulse');
    });
});
