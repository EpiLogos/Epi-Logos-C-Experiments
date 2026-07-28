/**
 * Coordinate: M' M4' (session-close ceremony projection — rerun 25.T25.19)
 * Residency: Body/M/pratibimba-app/src/panes/m4SessionCloseCeremony.ts
 * Position (#n): #5 — Integration; the Möbius turn where a session becomes
 *   witnessed rather than merely finished
 * Actualises: the read half of tranche 25.19 — the four ceremony sections over
 *   what the substrate ACTUALLY persists. The brief was written against the
 *   frozen widget's imagined payload; three of its four sections land on real
 *   reads and one does not, and this module states which is which rather than
 *   inventing the difference:
 *     (a) WISDOM DELTA — `nara.contemplate_session_close` composes one (a
 *         4'-5'-0' summary sentence, gateway `dispatch.rs::compose_wisdom_delta`),
 *         but the PERSISTED projection deliberately reduces bodies to counts
 *         (`NaraContemplationObjectProjection`, nara_close_bundle.rs) and drops
 *         it. So the read path carries the delta's HANDLE (`contemplation_ref`)
 *         and its triplet, never its text. The kernel's own 8-byte
 *         `M4_Epii_Integration.wisdom_delta` (m4.h:709) is projected NOWHERE on
 *         the wire — so the brief's "byte trail as hex strip" has no source, and
 *         a hex strip rendered from a prose sentence would be a fabrication.
 *     (b) XOR / Möbius return — PASU carries the derived `c_5_quintessence_hash`
 *         and `c_5_quintessence_clock` reflections. The ceremony shows the
 *         HANDLE FORM only (first 8 hex characters), per the brief's own privacy
 *         law; the byte-level XOR needs the 8-byte delta above, so it stays
 *         explicitly pending rather than animated over data that is not there.
 *     (c) FOUR CONTEMPLATION SEEDS — fully real: the live profile's 12-slot
 *         `contemplationPromptLut` read at Arch positions 3/5/7/9, carrying the
 *         19.9 registers speech / relationship / action / completion.
 *     (d) VIRTUE WITNESS — fully real: the persisted verifier projection's
 *         nine-bit vector over the canonical virtue order.
 * Public surface: M4_CONTEMPLATION_SEED_REGISTERS, M4ContemplationSeed,
 *   contemplationSeedsFromProfile, M4ContemplationRead,
 *   readNaraContemplationObject, M4QuintessenceHandleRead, readQuintessenceHandle,
 *   QUINTESSENCE_HANDLE_LENGTH.
 * Does NOT own: the close bundle parser (m1SessionCloseReader.ts — reused, not
 *   forked), the virtue labels (m0VirtueWitness.ts), the prompt LUT (kernel
 *   profile), the privacy tint register (ui/privacyChrome.ts), or any write.
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.19]] (consumes 19.6 + 19.7).
 */

import type { KernelBridgeCachedProfile } from '../bridge/types';

/** 19.9's four registers, at their Arch positions in the 12-slot prompt LUT. */
export const M4_CONTEMPLATION_SEED_REGISTERS = Object.freeze([
    { archetype: 3, register: 'speech' },
    { archetype: 5, register: 'relationship' },
    { archetype: 7, register: 'action' },
    { archetype: 9, register: 'completion' }
] as const);

export interface M4ContemplationSeed {
    readonly archetype: number;
    readonly register: string;
    readonly prompt: string | null;
    /** `canonical` = the live LUT carried a prompt; `canonical_absent` = the LUT
     *  is present but that slot is empty; `blocked` = no LUT on the profile. */
    readonly state: 'canonical' | 'canonical_absent' | 'blocked';
}

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function harmonicProfile(cached: KernelBridgeCachedProfile | null): Record<string, unknown> | null {
    const root = record(cached?.profile);
    const payload = record(root?.payload);
    return record(root?.harmonicProfile) ?? record(payload?.harmonicProfile) ?? payload ?? root;
}

/**
 * The four Arch 3/5/7/9 seeds, read from the live profile LUT. Never a local
 * prompt table: the LUT is kernel-authored (19.3) and a carrier copy would
 * drift the moment the kernel's changed.
 */
export function contemplationSeedsFromProfile(
    cached: KernelBridgeCachedProfile | null
): readonly M4ContemplationSeed[] {
    const profile = harmonicProfile(cached);
    const candidate = profile?.contemplationPromptLut ?? profile?.contemplation_prompt_lut;
    const lut = Array.isArray(candidate) ? candidate : null;
    return Object.freeze(
        M4_CONTEMPLATION_SEED_REGISTERS.map(seed => {
            if (!lut) {
                return Object.freeze({ ...seed, prompt: null, state: 'blocked' as const });
            }
            const raw = lut[seed.archetype];
            const prompt = typeof raw === 'string' && raw.length > 0 ? raw : null;
            return Object.freeze({
                ...seed,
                prompt,
                state: prompt ? ('canonical' as const) : ('canonical_absent' as const)
            });
        })
    );
}

// ── the persisted contemplation projection ─────────────────────────────────

const TOP_LEVEL_KEYS = new Set([
    'session_id',
    'close_ref',
    'contemplation_ref',
    'triplet',
    'provenance'
]);
const TRIPLET_KEYS = new Set(['llm', 'ebm', 'verifier']);
const LLM_KEYS = new Set([
    'position',
    'loaded_agent_count',
    'psyche_anchor_coherent',
    'matched_anchor_codon_count',
    // 25.20 substrate widening. Note this is NOT a relaxation of the
    // `matched_anchor_codons` refusal below: that key is the RAW gateway
    // reading, and seeing it still means the payload was never projected. This
    // one is a projected field the substrate now persists per card.
    'anchor_cards'
]);
const ANCHOR_CARD_KEYS = new Set(['card', 'codon', 'matched']);
const EBM_KEYS = new Set(['position', 'gradient_magnitude', 'gauge_trio_coherent', 'coherence_scores']);
const COHERENCE_KEYS = new Set(['square_0_5', 'square_1_4', 'square_2_3']);
const VERIFIER_KEYS = new Set([
    'position',
    'virtue_witness_vector',
    'coherence_score',
    'arch9_wholeness',
    'syntax_layers_witnessed'
]);
const PROVENANCE_KEYS = new Set([
    'privacy_class',
    'source_method',
    'persisted_at',
    'persisted_at_ms',
    'pasu_scoped'
]);
/** Session bodies that must never reach a ceremony that only witnesses. */
const FORBIDDEN_KEYS = new Set([
    'trajectory',
    'journal',
    'body',
    'q_nara',
    'q_personal',
    'q_identity',
    'q_composed',
    'loaded_agents',
    'matched_anchor_codons',
    'recognition_state',
    'per_tick_energy',
    'gradient',
    'unsatisfied_constraints'
]);

/**
 * One psyche-anchor card as the close persisted it. `card` and `codon` are
 * independently nullable because the substrate reports a ragged draw rather
 * than truncating it — a card with no codon had nothing to match against.
 */
export interface M4PsycheAnchorCard {
    readonly card: string | null;
    readonly codon: string | null;
    readonly matched: boolean;
}

export type M4ContemplationRead =
    | {
          readonly state: 'ready';
          readonly sessionId: string;
          readonly closeRef: string;
          readonly contemplationRef: string;
          readonly llm: {
              readonly position: string;
              readonly loadedAgentCount: number;
              readonly psycheAnchorCoherent: boolean;
              readonly matchedAnchorCodonCount: number;
              /** 25.20: the per-card reading the verdict above collapses. Empty
               *  for a bundle closed before the substrate widening — absent is
               *  not the same as none, and the panel says so. */
              readonly anchorCards: readonly M4PsycheAnchorCard[];
          };
          readonly ebm: {
              readonly position: string;
              readonly gradientMagnitude: number;
              readonly gaugeTrioCoherent: boolean;
              readonly coherenceSquares: readonly { readonly label: string; readonly score: number }[];
          };
          readonly verifier: {
              readonly position: string;
              readonly witnessBits: readonly boolean[];
              readonly witnessCount: number;
              readonly coherenceScore: number;
              readonly arch9Wholeness: boolean;
              readonly syntaxLayersWitnessed: boolean;
          };
          readonly provenance: {
              readonly privacyClass: string;
              readonly sourceMethod: string;
              readonly persistedAt: string;
          };
      }
    | { readonly state: 'blocked'; readonly reason: string };

function blocked(reason: string): M4ContemplationRead {
    return { state: 'blocked', reason };
}

function unknownKey(
    value: Record<string, unknown>,
    allowed: ReadonlySet<string>,
    label: string
): string | null {
    for (const key of Object.keys(value)) {
        if (FORBIDDEN_KEYS.has(key)) {
            return `forbidden ${label} field ${key}`;
        }
        if (!allowed.has(key)) {
            return `unexpected ${label} field ${key}`;
        }
    }
    return null;
}

/**
 * The per-card anchor reading, or a refusal string. A bundle closed before the
 * 25.20 widening simply has no `anchor_cards` key, and that reads as an empty
 * list — the panel distinguishes "this close predates the reading" from "this
 * close drew no cards" by its own emptiness copy, not by guessing here.
 */
function readAnchorCards(raw: unknown): M4PsycheAnchorCard[] | string {
    if (raw === undefined) {
        return [];
    }
    if (!Array.isArray(raw)) {
        return 'triplet.llm.anchor_cards must be an array';
    }
    const cards: M4PsycheAnchorCard[] = [];
    for (const entry of raw) {
        const card = record(entry);
        if (!card) {
            return 'triplet.llm.anchor_cards entries must be objects';
        }
        const stray = unknownKey(card, ANCHOR_CARD_KEYS, 'anchor card');
        if (stray) {
            return stray;
        }
        if (card.card !== null && typeof card.card !== 'string') {
            return 'anchor card name must be a string or null';
        }
        if (card.codon !== null && typeof card.codon !== 'string') {
            return 'anchor card codon must be a string or null';
        }
        if (typeof card.matched !== 'boolean') {
            return 'anchor card match state must be boolean';
        }
        cards.push({
            card: (card.card as string | null) ?? null,
            codon: (card.codon as string | null) ?? null,
            matched: card.matched
        });
    }
    return cards;
}

function unitScore(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
        ? value
        : null;
}

/**
 * Strict reader for `nara.session_close.contemplation.read`. Deny-unknown, like
 * the Rust struct it mirrors: a payload that grew a field is a CHANGED privacy
 * boundary, and the ceremony refuses to render one it was not told about.
 */
export function readNaraContemplationObject(raw: unknown): M4ContemplationRead {
    const payload = record(raw);
    if (!payload) {
        return blocked('contemplation projection must be an object');
    }
    const strayTop = unknownKey(payload, TOP_LEVEL_KEYS, 'contemplation');
    if (strayTop) {
        return blocked(strayTop);
    }
    if (typeof payload.session_id !== 'string' || payload.session_id.trim().length === 0) {
        return blocked('session_id must be a non-empty string');
    }
    if (typeof payload.close_ref !== 'string' || !/^close-[A-Za-z0-9_-]+$/.test(payload.close_ref)) {
        return blocked('close_ref must be an opaque close reference');
    }
    if (
        typeof payload.contemplation_ref !== 'string' ||
        !/^contemplation-[A-Za-z0-9_-]+$/.test(payload.contemplation_ref)
    ) {
        return blocked('contemplation_ref must be an opaque contemplation handle');
    }

    const triplet = record(payload.triplet);
    if (!triplet) {
        return blocked('triplet must be an object');
    }
    const strayTriplet = unknownKey(triplet, TRIPLET_KEYS, 'triplet');
    if (strayTriplet) {
        return blocked(strayTriplet);
    }

    const llm = record(triplet.llm);
    if (!llm) {
        return blocked('triplet.llm must be an object');
    }
    const strayLlm = unknownKey(llm, LLM_KEYS, 'triplet.llm');
    if (strayLlm) {
        return blocked(strayLlm);
    }
    if (typeof llm.position !== 'string' || llm.position.length === 0) {
        return blocked('triplet.llm.position must name its QL position');
    }
    if (!Number.isInteger(llm.loaded_agent_count) || (llm.loaded_agent_count as number) < 0) {
        return blocked('triplet.llm.loaded_agent_count must be a non-negative integer');
    }
    if (typeof llm.psyche_anchor_coherent !== 'boolean') {
        return blocked('triplet.llm.psyche_anchor_coherent must be boolean');
    }
    if (
        !Number.isInteger(llm.matched_anchor_codon_count) ||
        (llm.matched_anchor_codon_count as number) < 0
    ) {
        return blocked('triplet.llm.matched_anchor_codon_count must be a non-negative integer');
    }
    const anchorCards = readAnchorCards(llm.anchor_cards);
    if (typeof anchorCards === 'string') {
        return blocked(anchorCards);
    }

    const ebm = record(triplet.ebm);
    if (!ebm) {
        return blocked('triplet.ebm must be an object');
    }
    const strayEbm = unknownKey(ebm, EBM_KEYS, 'triplet.ebm');
    if (strayEbm) {
        return blocked(strayEbm);
    }
    if (typeof ebm.position !== 'string' || ebm.position.length === 0) {
        return blocked('triplet.ebm.position must name its QL position');
    }
    if (
        typeof ebm.gradient_magnitude !== 'number' ||
        !Number.isFinite(ebm.gradient_magnitude) ||
        ebm.gradient_magnitude < 0
    ) {
        return blocked('triplet.ebm.gradient_magnitude must be finite and non-negative');
    }
    if (typeof ebm.gauge_trio_coherent !== 'boolean') {
        return blocked('triplet.ebm.gauge_trio_coherent must be boolean');
    }
    const squares = record(ebm.coherence_scores);
    if (!squares) {
        return blocked('triplet.ebm.coherence_scores must be an object');
    }
    const straySquares = unknownKey(squares, COHERENCE_KEYS, 'coherence_scores');
    if (straySquares) {
        return blocked(straySquares);
    }
    const coherenceSquares: { label: string; score: number }[] = [];
    for (const label of ['square_0_5', 'square_1_4', 'square_2_3'] as const) {
        const score = unitScore(squares[label]);
        if (score === null) {
            return blocked(`coherence_scores.${label} must be within 0..=1`);
        }
        coherenceSquares.push({ label, score });
    }

    const verifier = record(triplet.verifier);
    if (!verifier) {
        return blocked('triplet.verifier must be an object');
    }
    const strayVerifier = unknownKey(verifier, VERIFIER_KEYS, 'triplet.verifier');
    if (strayVerifier) {
        return blocked(strayVerifier);
    }
    if (typeof verifier.position !== 'string' || verifier.position.length === 0) {
        return blocked('triplet.verifier.position must name its QL position');
    }
    const witness = verifier.virtue_witness_vector;
    if (!Array.isArray(witness) || witness.length !== 9 || witness.some(b => typeof b !== 'boolean')) {
        return blocked('virtue_witness_vector must be nine booleans');
    }
    const coherenceScore = unitScore(verifier.coherence_score);
    if (coherenceScore === null) {
        return blocked('triplet.verifier.coherence_score must be within 0..=1');
    }
    if (typeof verifier.arch9_wholeness !== 'boolean') {
        return blocked('triplet.verifier.arch9_wholeness must be boolean');
    }
    if (typeof verifier.syntax_layers_witnessed !== 'boolean') {
        return blocked('triplet.verifier.syntax_layers_witnessed must be boolean');
    }

    const provenance = record(payload.provenance);
    if (!provenance) {
        return blocked('provenance must be an object');
    }
    const strayProvenance = unknownKey(provenance, PROVENANCE_KEYS, 'provenance');
    if (strayProvenance) {
        return blocked(strayProvenance);
    }
    if (typeof provenance.privacy_class !== 'string' || provenance.privacy_class.length === 0) {
        return blocked('provenance.privacy_class must be declared');
    }

    const witnessBits = Object.freeze([...(witness as boolean[])]);
    return {
        state: 'ready',
        sessionId: payload.session_id,
        closeRef: payload.close_ref,
        contemplationRef: payload.contemplation_ref,
        llm: {
            position: llm.position,
            loadedAgentCount: llm.loaded_agent_count as number,
            psycheAnchorCoherent: llm.psyche_anchor_coherent,
            matchedAnchorCodonCount: llm.matched_anchor_codon_count as number,
            anchorCards
        },
        ebm: {
            position: ebm.position,
            gradientMagnitude: ebm.gradient_magnitude,
            gaugeTrioCoherent: ebm.gauge_trio_coherent,
            coherenceSquares: Object.freeze(coherenceSquares.map(square => Object.freeze(square)))
        },
        verifier: {
            position: verifier.position,
            witnessBits,
            witnessCount: witnessBits.filter(Boolean).length,
            coherenceScore,
            arch9Wholeness: verifier.arch9_wholeness,
            syntaxLayersWitnessed: verifier.syntax_layers_witnessed
        },
        provenance: {
            privacyClass: provenance.privacy_class,
            sourceMethod: typeof provenance.source_method === 'string' ? provenance.source_method : '',
            persistedAt: typeof provenance.persisted_at === 'string' ? provenance.persisted_at : ''
        }
    };
}

// ── quintessence handle (Möbius-return section) ────────────────────────────

/** The brief's law: a HANDLE reaches the DOM, never the full hash. */
export const QUINTESSENCE_HANDLE_LENGTH = 8;

export type M4QuintessenceHandleRead =
    | {
          readonly state: 'ready';
          readonly handle: string;
          readonly clock: string | null;
      }
    | { readonly state: 'absent'; readonly reason: string };

/**
 * Read the quintessence reflection off the PASU record (`nara.pasu.show`) as a
 * handle. The full hash is TRUNCATED here rather than in the renderer: a value
 * that never leaves this function cannot leak into a DOM node, a title, or a
 * screenshot.
 */
export function readQuintessenceHandle(raw: unknown): M4QuintessenceHandleRead {
    const payload = record(raw);
    if (!payload) {
        return { state: 'absent', reason: 'PASU record unavailable' };
    }
    const hash = payload.c_5_quintessence_hash;
    if (typeof hash !== 'string' || hash.trim().length === 0) {
        return { state: 'absent', reason: 'no quintessence reflection on PASU yet' };
    }
    const clock = payload.c_5_quintessence_clock;
    return {
        state: 'ready',
        handle: hash.trim().slice(0, QUINTESSENCE_HANDLE_LENGTH),
        clock: typeof clock === 'string' && clock.trim().length > 0 ? clock.trim() : null
    };
}
