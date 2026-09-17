/**
 * Coordinate: M1-5' composition seam (plugin-integrated-1-2-3 contract — 09.T9.5)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — integration; the closing-tranche ownership contract for
 *   the integrated 1-2-3 cosmic composition.
 * Actualises: 09.T9.5 — declares `plugin-integrated-1-2-3` as the explicit
 *   owner of B-8 (solar anchor), B-9 (planetary placement), B-12 (cross-surface
 *   edit propagation). Ratifies the rendering seam: the three renderings are the
 *   M1/M2/M3 body poles at their -5 positions (torus-knot/Klein +1 · 72 cymatic ·
 *   64 codon) composing `137 = 64 + 72 + 1`; M0′ is the STRUCTURAL graph view of
 *   the SAME Bimba substrate (its six data-layers), never a fourth pole. B-8
 *   non-fork: one Neo4j `:Bimba` label, one `coordinate` identity property,
 *   one `Body/S/S2/graph-schema` authority, and this one
 *   `plugin-integrated-1-2-3` composition seam under every rendering, as
 *   cross-codified in [[M0'-SPEC]], [[M2'-SPEC]], and [[M3'-SPEC]]. B-12 propagation
 *   is grounded in the single monotonic generation gate (`stores.ts` setProfile)
 *   — no per-surface stale cache; a governed write that advances graph_revision
 *   re-emits the profile at a higher generation and every rendering re-reads.
 * Public surface: BIMBA_SUBSTRATE, THREE_RENDERINGS, M0_GRAPH_VIEW,
 *   MATHEME_SPINE_TOTAL, OWNED_BINDINGS, ownedBinding, crossSurfacePropagation.
 * Does NOT own: the tick store law (stores.ts), profile parsing (bridge), the
 *   per-pole geometry renderers (M1 klein / M2 cymatic / M3 codon panes), the
 *   governed write path (gateway / M5 Logos Atelier). This module DECLARES the
 *   seam and the propagation law; it renders nothing and forks nothing.
 * Contract: [[07-integrated-1-2-3-cosmic-engine-reconciliation]] · wave-b B-8/B-9/B-12 ·
 *   [[09-integrated-bimba-graph-reconciliation]] T9.5 · DR-M0-1 (governed-route).
 */

/** B-8 non-fork invariant — the one substrate under every rendering. */
export const BIMBA_SUBSTRATE = Object.freeze({
    label: ':Bimba',
    coordinateProperty: 'coordinate',
    nonFork: true
} as const);

export type RenderingPole = 'M1' | 'M2' | 'M3';
export type RenderingGeometry = 'torus-knot/klein' | 'cymatic-72' | 'codon-64';

export interface RenderingDescriptor {
    readonly pole: RenderingPole;
    readonly geometry: RenderingGeometry;
    /** matheme contribution: M1 +1, M2 72, M3 64. */
    readonly count: number;
    /** all three compose at their -5 positions under the +1 parent. */
    readonly parentAttribution: 'M1-5';
}

/** The three body renderings — computational + visualisation layers over the
 *  one substrate. M1 is the torus-knot whose Klein/K² fold is the inversion
 *  (tick 5→6); M2 the 72 cymatic field; M3 the 64 codon ring. */
export const THREE_RENDERINGS: readonly RenderingDescriptor[] = Object.freeze([
    Object.freeze({ pole: 'M1', geometry: 'torus-knot/klein', count: 1, parentAttribution: 'M1-5' }),
    Object.freeze({ pole: 'M2', geometry: 'cymatic-72', count: 72, parentAttribution: 'M1-5' }),
    Object.freeze({ pole: 'M3', geometry: 'codon-64', count: 64, parentAttribution: 'M1-5' })
]);

/** `137 = 64 + 72 + 1` — the matheme spine the composition preserves. */
export const MATHEME_SPINE_TOTAL = 137;

/** M0′ is the graph VIEW of the Bimba map — the structural affordance over the
 *  same substrate, surfaced through its six data-layers. It is NOT one of the
 *  three body renderings; it re-reads the substrate like they do (B-12), but it
 *  is a distinct kind of surface (view of the map, not a compute/viz pole). */
export const M0_GRAPH_VIEW = Object.freeze({
    affordance: 'structural-graph-view',
    isBodyRendering: false,
    layers: Object.freeze(['lang', 'ql', 'rel', 'time', 'pers', 'pedag'] as const)
} as const);

export type BindingId = 'B-8' | 'B-9' | 'B-12';

export interface CompositionBinding {
    readonly id: BindingId;
    readonly name: string;
    readonly owner: 'plugin-integrated-1-2-3';
}

/** The Wave-B bindings this composition closing-tranche explicitly owns. */
export const OWNED_BINDINGS: readonly CompositionBinding[] = Object.freeze([
    Object.freeze({ id: 'B-8', name: 'solar anchor', owner: 'plugin-integrated-1-2-3' }),
    Object.freeze({ id: 'B-9', name: 'planetary placement', owner: 'plugin-integrated-1-2-3' }),
    Object.freeze({
        id: 'B-12',
        name: 'cross-surface edit propagation',
        owner: 'plugin-integrated-1-2-3'
    })
]);

export function ownedBinding(id: BindingId): CompositionBinding {
    const binding = OWNED_BINDINGS.find(b => b.id === id);
    if (!binding) throw new Error(`plugin-integrated-1-2-3 does not own ${id}`);
    return binding;
}

/** One tick as the propagation law sees it: the monotonic generation plus the
 *  substrate revision the governed write stamped onto that profile. */
export interface RevisionTick {
    readonly generation: number;
    readonly graphRevision: string;
}

export type PropagationReason = 'revision-advanced' | 'clock-tick' | 'stale-generation';

export interface PropagationDecision {
    /** every rendering re-reads this generation (the tick spine). */
    readonly reRead: boolean;
    /** a governed substrate edit crossed to all renderings this generation. */
    readonly carriesEdit: boolean;
    readonly reason: PropagationReason;
}

/**
 * B-12 — the cross-surface edit propagation law, grounded in the SAME monotonic
 * generation gate as `stores.ts` setProfile (a profile lands only when its
 * generation strictly advances). There is no per-surface stale cache: the one
 * generation gate is the single seam, so an accepted profile re-reads across
 * M1/M2/M3 (and the M0′ graph view). `carriesEdit` is true only when the
 * substrate `graph_revision` also changed — the governed write actually moved
 * canon — versus a bare clock tick that merely advances time.
 */
export function crossSurfacePropagation(
    current: RevisionTick | null,
    incoming: RevisionTick
): PropagationDecision {
    if (current !== null && incoming.generation <= current.generation) {
        return Object.freeze({ reRead: false, carriesEdit: false, reason: 'stale-generation' });
    }
    const revisionChanged = current === null || incoming.graphRevision !== current.graphRevision;
    return Object.freeze({
        reRead: true,
        carriesEdit: revisionChanged,
        reason: revisionChanged ? 'revision-advanced' : 'clock-tick'
    });
}
