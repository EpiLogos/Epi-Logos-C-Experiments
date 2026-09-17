/**
 * Coordinate: M' M4' (tarot psyche-anchor coherence — rerun 25.T25.20)
 * Residency: Body/M/pratibimba-app/src/panes/m4PsycheAnchorCoherence.ts
 * Position (#n): #4 — Context; the frame a session is read back through, asking
 *   whether the cards drawn at its opening turned out to be the cards it lived.
 * Actualises: the read half of tranche 25.20 — the coherence indicator and the
 *   per-card hit list, over what the substrate ACTUALLY persists.
 *
 *   ONE RETARGET, stated rather than smuggled. The brief's second section is a
 *   "session codon trace — the codons that rotated through M3 during the
 *   session … each codon shown with its corresponding Major Arcana card
 *   resolved via T19.5 `m3_major_arcana_from_codon` reverse-lookup". Neither
 *   half of that has a producer:
 *     - The TRAJECTORY is deliberately withheld. `trajectory` is a FORBIDDEN key
 *       on the contemplation projection (m4SessionCloseCeremony.ts) — the close
 *       reduces session bodies to readings, and a panel that reconstructed the
 *       tick-by-tick codon walk would be re-exporting exactly what the privacy
 *       boundary drops.
 *     - The reverse LOOKUP is not on any wire. The carrier's own M3 surfaces
 *       carry `majorArcana: 'pending-major-arcana-map'` (m3Inspectors.ts,
 *       M3CosmicWheelRenderService.tsx) against WC-M3-SA-2, which no tranche
 *       currently produces.
 *   What IS real, and what the 25.20 substrate widening now persists, is the
 *   anchor's OWN card<->codon pairing with each card's match state. That answers
 *   the brief's stated question — "Did the tarot psyche-anchor's cards
 *   correspond to codons that appeared in the trajectory?" — per card, without
 *   reconstructing the trajectory to do it. The intersection is the answer; the
 *   walk that produced it stays behind the boundary.
 * Public surface: M4AnchorCoherence, M4AnchorCardReading, psycheAnchorCoherence,
 *   ANCHOR_COHERENCE_UNWIDENED_REASON.
 * Does NOT own: the contemplation read/parse (m4SessionCloseCeremony.ts — reused,
 *   not forked), the privacy tint register (ui/privacyChrome.ts), the anchor
 *   draw (S3 `nara.contemplate_session_close`), or any write.
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.20]] (consumes 19.4 + 19.5).
 */

import type { M4ContemplationRead, M4PsycheAnchorCard } from './m4SessionCloseCeremony';

/** A card with no codon cannot be read against the trajectory at all. */
export type M4AnchorCardState = 'matched' | 'unmatched' | 'no-codon';

export interface M4AnchorCardReading {
    readonly card: string | null;
    readonly codon: string | null;
    readonly state: M4AnchorCardState;
}

export const ANCHOR_COHERENCE_UNWIDENED_REASON =
    'this close was persisted before the per-card anchor reading existed — its verdict stands, its cards do not';

export type M4AnchorCoherence =
    | {
          readonly state: 'ready';
          readonly cards: readonly M4AnchorCardReading[];
          /** Cards whose codon appeared in the session trajectory. */
          readonly matched: number;
          /** Cards that could be read at all — a card with no codon is excluded
           *  from the denominator rather than counted as a miss it never had the
           *  chance to be. */
          readonly readable: number;
          /** `matched / readable` as whole percent, or null when nothing was
           *  readable — 0 % and "no question was asked" are different answers. */
          readonly percent: number | null;
          /** The substrate's own verdict, carried beside the arithmetic rather
           *  than recomputed from it: the two are independently derived, and a
           *  panel that recomputed the verdict could not show them disagreeing. */
          readonly verdict: boolean;
      }
    | { readonly state: 'unwidened'; readonly verdict: boolean; readonly reason: string }
    | { readonly state: 'empty' }
    | { readonly state: 'blocked'; readonly reason: string };

function cardState(card: M4PsycheAnchorCard): M4AnchorCardState {
    if (card.codon === null) {
        return 'no-codon';
    }
    return card.matched ? 'matched' : 'unmatched';
}

/**
 * The coherence reading for one persisted close.
 *
 * The `unwidened` state is a real inference, not a guess: a close that reports
 * matched codons while carrying no card list must predate the widening, because
 * a close that genuinely drew nothing could not have matched anything. When
 * both are zero the two cases are indistinguishable from this projection, and
 * the reading says `empty` rather than pretending to know which.
 */
export function psycheAnchorCoherence(read: M4ContemplationRead | null): M4AnchorCoherence {
    if (read === null) {
        return { state: 'blocked', reason: 'awaiting a persisted contemplation object' };
    }
    if (read.state === 'blocked') {
        return { state: 'blocked', reason: read.reason };
    }
    const { anchorCards, psycheAnchorCoherent, matchedAnchorCodonCount } = read.llm;
    if (anchorCards.length === 0) {
        return matchedAnchorCodonCount > 0
            ? {
                  state: 'unwidened',
                  verdict: psycheAnchorCoherent,
                  reason: ANCHOR_COHERENCE_UNWIDENED_REASON
              }
            : { state: 'empty' };
    }
    const cards = anchorCards.map(card => ({
        card: card.card,
        codon: card.codon,
        state: cardState(card)
    }));
    const readable = cards.filter(card => card.state !== 'no-codon').length;
    const matched = cards.filter(card => card.state === 'matched').length;
    return {
        state: 'ready',
        cards,
        matched,
        readable,
        percent: readable === 0 ? null : Math.round((matched / readable) * 100),
        verdict: psycheAnchorCoherent
    };
}
