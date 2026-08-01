/**
 * Coordinate: M3-5' co-foliated double-torus reading (rerun 51.T51.5)
 * Residency: Body/M/pratibimba-app/src/panes/m3DoubleTorus/coFoliation.ts
 * Position (#n): #5 — Integration: the mythic synthesis wheel as ONE surface.
 * Actualises: [[M3'-SPEC]] §8.13 "M3-5 Surface Law: Co-Foliated Double-Torus
 *   and 0-Side Dual Rendering" — a surface with its own §-numbered law in canon
 *   and, until 51.T51.5, not one tranche. §8.13 states the surface directly:
 *
 *     K²                         ×  T²_Mahāmāyā
 *     chromatic-fifths double       inscription-circle × lens-circle
 *     cover / audio-genesis         symbolic-transcription substrate
 *
 *   CO-FOLIATED, NOT SIDE BY SIDE. That is the whole content of the law and
 *   the thing a lazy rendering gets wrong: two tori drawn next to each other
 *   are two pictures, not a co-foliation. A co-foliation is two transverse
 *   leaf families over ONE chart, and what makes it real is that the leaves
 *   INTERSECT. So this module puts both foliations on the single fundamental
 *   domain of the torus — K² leaves running along `u`, T²_Mahāmāyā leaves
 *   running along `v` — and computes their intersections, of which exactly one
 *   is active at any tick. The active intersection IS the M3-5 state: which
 *   chromatic-fifths sheet the audio genesis is on, crossed with which lens
 *   the inscription is being read through.
 *
 *   THE 0-SIDE DUAL RENDERING is §8.13's second half, and it is a claim about
 *   substrate rather than about pixels: "The [[M0']] graph view is Mahāmāyā's
 *   structural rendering; the M3' wheel is Mahāmāyā's temporal-cosmological
 *   rendering. Both are operational on the 0 side and both consume the same
 *   canonical Neo4j substrate." So the dual is rendered as the two named
 *   renderings over the ONE substrate identity — read from
 *   `composition/compositionContract.ts::BIMBA_SUBSTRATE`, the B-8 non-fork
 *   invariant (one `:Bimba` label, one `coordinate` property), never restated
 *   here. A dual rendering whose two halves did not provably share a substrate
 *   would be exactly the fork that invariant exists to forbid.
 *
 *   EVERY LEAF INDEX IS LIVE OR PENDING. Nothing is placed at a default: with
 *   no `degree720` there is no K² leaf, with no lens there is no T² leaf, and
 *   with either missing there is no active intersection — reported, not faked.
 * Public surface: K2_LEAF_COUNT, T2_LENS_LEAF_COUNT, T2_INSCRIPTION_COUNT,
 *   FIFTH_SEMITONES, CoFoliationLeaf, CoFoliationCrossing, ZeroSideRendering,
 *   CoFoliationReading, k2LeafOf, t2LeafOf, readCoFoliation.
 * Does NOT own: the M3 bus reading (`panes/m3Inspectors.ts::buildM3InspectorsView`
 *   — reused verbatim), the clock, the substrate invariant
 *   (`composition/compositionContract.ts`), or the rendering.
 * Contract: [[M3'-SPEC]] §1 (User-Facing Surface) / §8.13 · [[DR-M0-1]] ·
 *   rerun tranche [[51.T51.5]].
 */

import { buildM3InspectorsView } from '../m3Inspectors';
import { BIMBA_SUBSTRATE } from '../../composition/compositionContract';
import type { KernelBridgeCachedProfile } from '../../bridge/types';

/** K² is a DOUBLE cover of the twelve chromatic classes — 24 leaves. The
 *  doubling is the same one `degree720` carries (720 = 2 × 360). */
export const K2_LEAF_COUNT = 24;

/** The lens circle of T²_Mahāmāyā: the 16 lens stack plus the growth/meta
 *  aperture (§8.15's `M3_LENS_STACK[0..15] + growth/meta aperture`). */
export const T2_LENS_LEAF_COUNT = 17;

/** The inscription circle: the 64-codon symbolic-transcription address. */
export const T2_INSCRIPTION_COUNT = 64;

/** A perfect fifth is seven semitones — the chromatic-fifths reordering. */
export const FIFTH_SEMITONES = 7;

export interface CoFoliationLeaf {
    readonly foliation: 'k2' | 't2';
    readonly index: number;
    /** Position on the fundamental domain, 0..1 along this leaf's own axis. */
    readonly u: number;
    readonly active: boolean;
    readonly label: string;
}

/** A point where a K² leaf meets a T²_Mahāmāyā leaf — the co-foliation
 *  itself. Both coordinates live on the SAME chart; that is the point. */
export interface CoFoliationCrossing {
    readonly k2Leaf: number;
    readonly t2Leaf: number;
    /** Fundamental-domain coordinates, both in 0..1. */
    readonly u: number;
    readonly v: number;
    readonly active: boolean;
}

/** One of §8.13's two 0-side renderings of Mahāmāyā. */
export interface ZeroSideRendering {
    readonly id: 'm0-structural-graph' | 'm3-temporal-wheel';
    readonly coordinate: string;
    readonly role: string;
    /** The shared canonical substrate both consume (B-8 non-fork). */
    readonly substrateLabel: string;
    readonly substrateIdentityProperty: string;
}

export interface CoFoliationReading {
    readonly generation: number | null;
    /** K² — the chromatic-fifths double cover / audio-genesis substrate. */
    readonly k2: Readonly<{
        readonly degree720: number | null;
        readonly sheet: 0 | 1 | null;
        readonly pitchClass: number | null;
        readonly fifthsIndex: number | null;
        readonly activeLeaf: number | null;
        readonly leaves: readonly CoFoliationLeaf[];
    }>;
    /** T²_Mahāmāyā — inscription-circle × lens-circle. */
    readonly t2: Readonly<{
        readonly lens: number | null;
        readonly mode: number | null;
        readonly inscription: number | null;
        readonly activeLeaf: number | null;
        readonly leaves: readonly CoFoliationLeaf[];
    }>;
    /** Every leaf intersection on the one chart; exactly one may be active. */
    readonly crossings: readonly CoFoliationCrossing[];
    readonly activeCrossing: CoFoliationCrossing | null;
    /** §8.13's 0-side dual — two renderings, one substrate. */
    readonly zeroSideDual: readonly ZeroSideRendering[];
    readonly pending: readonly string[];
}

/**
 * The K² leaf of a `degree720`: the chromatic class reordered by fifths, on
 * the sheet the double cover is currently on. 720 = 2 × 360, so the sheet is
 * the upper/lower half and the leaf runs 0..23.
 */
export function k2LeafOf(degree720: number | null): {
    sheet: 0 | 1 | null;
    pitchClass: number | null;
    fifthsIndex: number | null;
    leaf: number | null;
} {
    if (
        degree720 === null
        || !Number.isFinite(degree720)
        || degree720 < 0
        || degree720 >= 720
    ) {
        return { sheet: null, pitchClass: null, fifthsIndex: null, leaf: null };
    }
    const sheet: 0 | 1 = degree720 >= 360 ? 1 : 0;
    const pitchClass = Math.floor((degree720 % 360) / 30);
    const fifthsIndex = (pitchClass * FIFTH_SEMITONES) % 12;
    return { sheet, pitchClass, fifthsIndex, leaf: fifthsIndex + 12 * sheet };
}

/** The T²_Mahāmāyā leaf: the lens circle position (0..16). */
export function t2LeafOf(lens: number | null): number | null {
    if (lens === null || !Number.isInteger(lens) || lens < 0 || lens >= T2_LENS_LEAF_COUNT) {
        return null;
    }
    return lens;
}

/** §8.13's two 0-side renderings, both over the ONE `:Bimba` substrate. */
function zeroSideDual(): readonly ZeroSideRendering[] {
    return Object.freeze([
        Object.freeze({
            id: 'm0-structural-graph' as const,
            coordinate: "M0'",
            role: "Mahāmāyā's structural rendering — the Bimba graph view",
            substrateLabel: BIMBA_SUBSTRATE.label,
            substrateIdentityProperty: BIMBA_SUBSTRATE.coordinateProperty
        }),
        Object.freeze({
            id: 'm3-temporal-wheel' as const,
            coordinate: "M3-5'",
            role: "Mahāmāyā's temporal-cosmological rendering — the cosmic wheel",
            substrateLabel: BIMBA_SUBSTRATE.label,
            substrateIdentityProperty: BIMBA_SUBSTRATE.coordinateProperty
        })
    ]);
}

/**
 * Read the co-foliation off the live profile. The M3 bus reading comes from
 * `buildM3InspectorsView` — the reader this carrier already owns — so the two
 * surfaces cannot disagree about what the clock said.
 */
export function readCoFoliation(cached: KernelBridgeCachedProfile | null): CoFoliationReading {
    const payload =
        cached && cached.profile !== null && typeof cached.profile === 'object'
            ? (cached.profile as Record<string, unknown>)
            : null;
    const view = payload
        ? buildM3InspectorsView({ payload, generation: cached!.generation })
        : null;

    const degree720 = view?.toroidal?.degree720 ?? null;
    const { sheet, pitchClass, fifthsIndex, leaf: k2Active } = k2LeafOf(degree720);
    const lens = view?.lensMode?.lens ?? null;
    const mode = view?.lensMode?.mode ?? null;
    const inscription = view?.mahamaya?.codonId ?? null;
    const t2Active = t2LeafOf(lens);

    const k2Leaves = Object.freeze(
        Array.from({ length: K2_LEAF_COUNT }, (_, index) =>
            Object.freeze({
                foliation: 'k2' as const,
                index,
                u: index / K2_LEAF_COUNT,
                active: index === k2Active,
                label: `fifths ${index % 12} · sheet ${index < 12 ? 0 : 1}`
            })
        )
    );
    const t2Leaves = Object.freeze(
        Array.from({ length: T2_LENS_LEAF_COUNT }, (_, index) =>
            Object.freeze({
                foliation: 't2' as const,
                index,
                u: index / T2_LENS_LEAF_COUNT,
                active: index === t2Active,
                label: index === 16 ? 'growth/meta aperture' : `lens ${index}`
            })
        )
    );

    const crossings: CoFoliationCrossing[] = [];
    for (const k2 of k2Leaves) {
        for (const t2 of t2Leaves) {
            crossings.push(
                Object.freeze({
                    k2Leaf: k2.index,
                    t2Leaf: t2.index,
                    u: k2.u,
                    v: t2.u,
                    active: k2.active && t2.active
                })
            );
        }
    }
    const activeCrossing = crossings.find(crossing => crossing.active) ?? null;

    const pending: string[] = [];
    if (degree720 === null) pending.push('degree720 (K² double cover)');
    if (lens === null) pending.push('lensMode.lens (T² lens circle)');
    if (inscription === null) pending.push('mahamaya.codonId (T² inscription circle)');

    return Object.freeze({
        generation: cached?.generation ?? null,
        k2: Object.freeze({
            degree720,
            sheet,
            pitchClass,
            fifthsIndex,
            activeLeaf: k2Active,
            leaves: k2Leaves
        }),
        t2: Object.freeze({
            lens,
            mode,
            inscription,
            activeLeaf: t2Active,
            leaves: t2Leaves
        }),
        crossings: Object.freeze(crossings),
        activeCrossing,
        zeroSideDual: zeroSideDual(),
        pending: Object.freeze(pending)
    });
}
