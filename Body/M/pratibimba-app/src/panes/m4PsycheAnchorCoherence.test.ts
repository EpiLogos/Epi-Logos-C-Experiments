/**
 * Coordinate: M' M4' (psyche-anchor coherence parse + arithmetic — 25.T25.20)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the laws that live below the render — that the widened projection
 *   is READ (the reader is deny-unknown, so a field the substrate grew is a
 *   refusal until the reader is told about it), that the coherence arithmetic is
 *   deterministic from a fixture, that a card with no codon is excluded from the
 *   denominator rather than counted as a miss, and that a close persisted before
 *   the widening is distinguished from a close that drew nothing.
 * Does NOT own: the mounted-pane laws (M4PsycheAnchorCoherencePane.test.tsx).
 */

import { describe, expect, it } from 'vitest';
import {
    ANCHOR_COHERENCE_UNWIDENED_REASON,
    psycheAnchorCoherence
} from './m4PsycheAnchorCoherence';
import { readNaraContemplationObject } from './m4SessionCloseCeremony';

const WITNESS = [true, true, false, true, false, true, true, false, true];

/** The brief's own example shape: four cards drawn, two of them matched. */
const FOUR_CARDS = [
    { card: 'The Fool', codon: 'I', matched: true },
    { card: 'The Hierophant', codon: 'V', matched: true },
    { card: 'The Hermit', codon: 'IX', matched: false },
    { card: 'The Star', codon: 'XVII', matched: false }
];

function projection(llmOverrides: Record<string, unknown> = {}) {
    return {
        session_id: 'session-anchor',
        close_ref: 'close-anchor-1',
        contemplation_ref: 'contemplation-anchor-1',
        triplet: {
            llm: {
                position: "4'",
                loaded_agent_count: 4,
                psyche_anchor_coherent: false,
                matched_anchor_codon_count: 2,
                anchor_cards: FOUR_CARDS,
                ...llmOverrides
            },
            ebm: {
                position: "5'",
                gradient_magnitude: 0.25,
                gauge_trio_coherent: true,
                coherence_scores: { square_0_5: 1, square_1_4: 0.97, square_2_3: 0.94 }
            },
            verifier: {
                position: "0'",
                virtue_witness_vector: WITNESS,
                coherence_score: 0.82,
                arch9_wholeness: true,
                syntax_layers_witnessed: false
            }
        },
        provenance: {
            privacy_class: 'protected_local',
            source_method: 'nara.session_close',
            persisted_at: '2026-07-27T10:00:00Z',
            persisted_at_ms: 1_785_000_000_000,
            pasu_scoped: true
        }
    };
}

function readReady(llmOverrides: Record<string, unknown> = {}) {
    const read = readNaraContemplationObject(projection(llmOverrides));
    if (read.state !== 'ready') {
        throw new Error(`fixture must parse: ${read.reason}`);
    }
    return read;
}

describe('25.T25.20 — reading the widened anchor projection', () => {
    it('accepts the per-card reading the substrate now persists', () => {
        expect(readReady().llm.anchorCards).toEqual([
            { card: 'The Fool', codon: 'I', matched: true },
            { card: 'The Hierophant', codon: 'V', matched: true },
            { card: 'The Hermit', codon: 'IX', matched: false },
            { card: 'The Star', codon: 'XVII', matched: false }
        ]);
    });

    it('still refuses the RAW gateway reading the projection is supposed to reduce', () => {
        // `anchor_cards` being allowed must not have relaxed the shape guard:
        // seeing `matched_anchor_codons` still means this payload was never
        // projected at all.
        const raw = projection({ matched_anchor_codons: ['I', 'V'] });
        const read = readNaraContemplationObject(raw);
        expect(read.state).toBe('blocked');
        expect(read.state === 'blocked' && read.reason).toContain('matched_anchor_codons');
    });

    it('refuses an anchor card carrying a field it was not told about', () => {
        const read = readNaraContemplationObject(
            projection({ anchor_cards: [{ card: 'The Fool', codon: 'I', matched: true, deck: 'thoth' }] })
        );
        expect(read.state).toBe('blocked');
        expect(read.state === 'blocked' && read.reason).toContain('deck');
    });

    it('refuses a match state that is not a boolean', () => {
        const read = readNaraContemplationObject(
            projection({ anchor_cards: [{ card: 'The Fool', codon: 'I', matched: 'yes' }] })
        );
        expect(read.state).toBe('blocked');
    });
});

describe('25.T25.20 — the coherence arithmetic', () => {
    it('counts the brief’s two-of-four fixture deterministically', () => {
        const coherence = psycheAnchorCoherence(readReady());
        expect(coherence.state).toBe('ready');
        if (coherence.state !== 'ready') return;
        expect(coherence.matched).toBe(2);
        expect(coherence.readable).toBe(4);
        expect(coherence.percent).toBe(50);
        expect(coherence.cards.map(c => c.state)).toEqual([
            'matched',
            'matched',
            'unmatched',
            'unmatched'
        ]);
    });

    it('carries the substrate verdict beside the arithmetic rather than recomputing it', () => {
        // 2 of 4 matched, so the arithmetic alone would never say "coherent".
        // The verdict is the substrate's, and the panel must be able to show the
        // two disagreeing rather than silently agreeing with itself.
        const coherence = psycheAnchorCoherence(readReady({ psyche_anchor_coherent: true }));
        expect(coherence.state === 'ready' && coherence.verdict).toBe(true);
        expect(coherence.state === 'ready' && coherence.matched).toBe(2);
    });

    it('excludes a card drawn without a codon from the denominator', () => {
        const coherence = psycheAnchorCoherence(
            readReady({
                anchor_cards: [
                    { card: 'The Fool', codon: 'I', matched: true },
                    { card: 'The Star', codon: null, matched: false }
                ]
            })
        );
        if (coherence.state !== 'ready') throw new Error('expected a ready reading');
        expect(coherence.readable).toBe(1);
        expect(coherence.matched).toBe(1);
        expect(coherence.percent).toBe(100);
        expect(coherence.cards[1].state).toBe('no-codon');
    });

    it('reports a codon with no card rather than dropping it', () => {
        const coherence = psycheAnchorCoherence(
            readReady({ anchor_cards: [{ card: null, codon: 'IX', matched: false }] })
        );
        if (coherence.state !== 'ready') throw new Error('expected a ready reading');
        expect(coherence.cards[0].card).toBeNull();
        expect(coherence.cards[0].state).toBe('unmatched');
    });

    it('says "nothing was readable" rather than 0%', () => {
        const coherence = psycheAnchorCoherence(
            readReady({ anchor_cards: [{ card: 'The Star', codon: null, matched: false }] })
        );
        expect(coherence.state === 'ready' && coherence.percent).toBeNull();
    });

    it('distinguishes a close that predates the widening from one that drew nothing', () => {
        // Matched codons but no card list: this close cannot have drawn nothing,
        // so it must predate the reading.
        const older = psycheAnchorCoherence(
            readReady({ anchor_cards: [], matched_anchor_codon_count: 2 })
        );
        expect(older.state).toBe('unwidened');
        expect(older.state === 'unwidened' && older.reason).toBe(ANCHOR_COHERENCE_UNWIDENED_REASON);

        // Nothing matched and no cards: genuinely indistinguishable, and it says so.
        const empty = psycheAnchorCoherence(
            readReady({ anchor_cards: [], matched_anchor_codon_count: 0 })
        );
        expect(empty.state).toBe('empty');
    });

    it('carries a blocked read through instead of rendering over it', () => {
        expect(psycheAnchorCoherence(null).state).toBe('blocked');
        expect(psycheAnchorCoherence({ state: 'blocked', reason: 'boom' })).toEqual({
            state: 'blocked',
            reason: 'boom'
        });
    });
});
