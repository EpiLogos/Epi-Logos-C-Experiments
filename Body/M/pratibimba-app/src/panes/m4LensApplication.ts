/**
 * Coordinate: M4' Nara lens-application model (25.T25.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 — Nara personal-context reading over the lens dialects.
 * Actualises: the carrier-native lens-application surface named by 25.12 — a
 *   reading model over the three lens DIALECTS (Jungian / Trika / Phenomenal)
 *   backed by the `nara.lens.list` / `nara.lens.apply` / `nara.lens.synthesize`
 *   RPCs (substrate: Body/S/S0/epi-cli/src/nara/lens.rs). Per UX §10.3
 *   "symbolic systems are DIALECTS, not authorities": a lens position is a
 *   READING NAME, never an authoritative claim about the subject. THE PRIVACY
 *   LAW: the subject body stays protected-local; only the lens route, the
 *   active square, and the resolved `vak_address` (Tranche 5.11) may cross into
 *   canon as a `kind: 'contemplative'` artifact. This is the carrier reading
 *   MODEL + protected-local projection; it is NOT a widget — the render pane is
 *   a thin consumer over these pure transforms.
 * Public surface: LENS_DIALECTS, LensDialect, LENS_READING_PRIVACY_CLASS,
 *   LensApplyResult, parseLensApplyResult, lensRoute, LensReadingCard,
 *   buildLensReadingCard, LensCanonProjection, projectLensReadingToCanon,
 *   SynthesizedProjection, buildSynthesizedProjection, LensApplicationPort.
 * Does NOT own: the lens math (lens.rs archetype/klein/elemental LUTs — kernel
 *   authority), the gateway RPC transport, the vak_address resolver (5.11), or
 *   the canonical write (Hen / gateway). This module SHAPES and enforces the
 *   protected-local boundary; it computes no lens semantics and writes nothing.
 * Contract: [[M'-SYSTEM-SPEC]] / [[25-m4-nara-frontend-deep]] T25.12 ·
 *   5.11 (vak_address) · DR-VAK-1 · protected-local privacy substrate (Track 08.1).
 */

import type { VakAddress } from '../bridge/types';

/** The three lens dialects — 25.12 (a) Lens list sub-tabs. */
export const LENS_DIALECTS = ['jungian', 'trika', 'phenomenal'] as const;
export type LensDialect = (typeof LENS_DIALECTS)[number];

/** The privacy class every lens reading carries: the subject body is a
 *  protected-local handle that never crosses the canon projection. */
export const LENS_READING_PRIVACY_CLASS = 'protected-local-handle-only' as const;

const DIALECT_SET = new Set<string>(LENS_DIALECTS);

/** The parsed substrate `nara.lens.apply` result (mirrors lens.rs
 *  `LensApplyResult`, snake_case on the wire). `target` and `analysis` are the
 *  protected-local subject material — they never enter a canon projection. */
export interface LensApplyResult {
    readonly lens: string;
    readonly lensIndex: number;
    readonly mode: string;
    readonly element: string;
    readonly kleinSquareNames: readonly [string, string, string, string];
    /** the subject the lens was applied to — PROTECTED-LOCAL. */
    readonly target: string;
    /** the lens reading of the subject — PROTECTED-LOCAL. */
    readonly analysis: string;
}

function asString(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

export function parseLensApplyResult(raw: unknown): LensApplyResult {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('lens apply result must be an object');
    }
    const r = raw as Record<string, unknown>;
    const square = r.klein_square_names;
    if (!Array.isArray(square) || square.length !== 4 || square.some(s => typeof s !== 'string')) {
        throw new Error('klein_square_names must be four strings');
    }
    if (!Number.isInteger(r.lens_index) || (r.lens_index as number) < 0 || (r.lens_index as number) > 11) {
        throw new Error('lens_index must be an integer in 0..11');
    }
    return Object.freeze({
        lens: asString(r.lens, 'lens'),
        lensIndex: r.lens_index as number,
        mode: asString(r.mode, 'mode'),
        element: asString(r.element, 'element'),
        kleinSquareNames: Object.freeze([...(square as string[])]) as readonly [
            string,
            string,
            string,
            string
        ],
        target: asString(r.target, 'target'),
        analysis: asString(r.analysis, 'analysis')
    });
}

/** The lens route (`c_3_lens_route`) — a READING NAME `dialect:lens-<n>:<name>`,
 *  never an authority claim about the subject. */
export function lensRoute(dialect: LensDialect, lensIndex: number, lens: string): string {
    return `${dialect}:lens-${lensIndex}:${lens}`;
}

/** A single lens reading. The subject is retained for LOCAL display only; it is
 *  marked protected-local and is stripped by `projectLensReadingToCanon`. */
export interface LensReadingCard {
    readonly dialect: LensDialect;
    readonly c_3_lens_route: string;
    readonly c_3_active_square: readonly [string, string, string, string];
    readonly vakAddress: VakAddress;
    /** the reading, framed as a dialect reading NAME (not an authority). LOCAL. */
    readonly readingName: string;
    /** the subject the lens read — PROTECTED-LOCAL; never projected to canon. */
    readonly subject: string;
    readonly privacyClass: typeof LENS_READING_PRIVACY_CLASS;
}

export function buildLensReadingCard(
    dialect: LensDialect,
    result: LensApplyResult,
    vakAddress: VakAddress
): LensReadingCard {
    if (!DIALECT_SET.has(dialect)) {
        throw new Error(`unknown lens dialect: ${dialect}`);
    }
    return Object.freeze({
        dialect,
        c_3_lens_route: lensRoute(dialect, result.lensIndex, result.lens),
        c_3_active_square: result.kleinSquareNames,
        vakAddress,
        readingName: result.analysis,
        subject: result.target,
        privacyClass: LENS_READING_PRIVACY_CLASS
    });
}

/** The `kind: 'contemplative'` artifact that crosses to canon. It carries ONLY
 *  the lens-position reference, the active square, and the vak_address — the
 *  subject body and the analysis stay protected-local. */
export interface LensCanonProjection {
    readonly kind: 'contemplative';
    readonly c_3_lens_route: string;
    readonly c_3_active_square: readonly [string, string, string, string];
    readonly vak_address: VakAddress;
}

/**
 * THE PROTECTED-LOCAL PRIVACY BOUNDARY (25.12). Projects a lens reading to the
 * canonical `contemplative` artifact carrying ONLY position + active-square +
 * vak_address. The subject body and the analysis reading NEVER cross — the
 * projection is constructed from the safe fields only, so no body can leak
 * through an accidental spread.
 */
export function projectLensReadingToCanon(card: LensReadingCard): LensCanonProjection {
    return Object.freeze({
        kind: 'contemplative',
        c_3_lens_route: card.c_3_lens_route,
        c_3_active_square: card.c_3_active_square,
        vak_address: card.vakAddress
    });
}

/** A multi-lens synthesized artifact — the composition of 2+ apply outputs. */
export interface SynthesizedProjection {
    readonly kind: 'contemplative';
    readonly sourceCount: number;
    readonly c_3_lens_routes: readonly string[];
    readonly c_3_active_squares: readonly (readonly [string, string, string, string])[];
    readonly vak_address: VakAddress;
}

/**
 * Compose 2+ prior lens readings into one contemplative artifact (25.12 (c)
 * Synthesize). Requires at least two applications. Every source subject stays
 * protected-local — only the routes, active squares, and a vak_address cross.
 * The vak_address is taken from the first source (all readings share the
 * session's resolved address per 5.11).
 */
export function buildSynthesizedProjection(cards: readonly LensReadingCard[]): SynthesizedProjection {
    if (cards.length < 2) {
        throw new Error('synthesize requires at least two lens applications');
    }
    return Object.freeze({
        kind: 'contemplative',
        sourceCount: cards.length,
        c_3_lens_routes: Object.freeze(cards.map(c => c.c_3_lens_route)),
        c_3_active_squares: Object.freeze(cards.map(c => c.c_3_active_square)),
        vak_address: cards[0].vakAddress
    });
}

/** The async transport the render pane binds to (mockable in tests). Mirrors
 *  the three `nara.lens.*` gateway RPCs; the pane shapes results through the
 *  pure transforms above. */
export interface LensApplicationPort {
    list(dialect: LensDialect): Promise<unknown>;
    apply(input: { lens: string; subject: string; position: number; activeSquare: number }): Promise<unknown>;
    synthesize(input: { applications: readonly string[] }): Promise<unknown>;
}
