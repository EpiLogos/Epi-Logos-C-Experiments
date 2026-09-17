/**
 * composition-contract — closing contract for the Cosmic Engine B-8/B-9/B-12 seam.
 *
 * @coordinate   M'-1-2-3 | integrated Cosmic Engine composition
 * @residency    Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/common/composition-contract.ts
 * @position     #1-2-3 — Integrated M1/M2/M3 composition seam
 * @actualises   09.T9.5 one-substrate / three-rendering integration plugin ownership; cross-link to 07.T7.3
 *
 * Public surface:
 *   SOLAR_ANCHOR_COMPOSITION_CONTRACT — frozen B-8/B-9/B-12 ownership contract.
 *   SOLAR_ANCHOR — B-8 solar anchor design-principle face.
 *   PLANETARY_PLACEMENT — B-9 profile-sourced planetary-placement face.
 *   CROSS_SURFACE_PROPAGATION — B-12 kernel-bridge profile-tick propagation face.
 *   attachProfileTickPropagation — Disposable listener binding profile ticks to edit-propagation sinks.
 *   assertSolarAnchorCompositionContract — runtime/test assertion for the seam invariant.
 * Does NOT own:
 *   Planetary, solar, codon, topology, or correspondence lookup tables; per-extension UI internals; bridge runtime.
 *
 * PURPOSE
 * This module is the cosmic-engine (1-2-3) plugin's authority over the
 * B-8 / B-9 / B-12 composition seam carried in from the Wave-B integrated-bimba
 * surface:
 *
 *   - B-8  -> the SOLAR ANCHOR design principle (the immovable centre the whole
 *            composition orbits).
 *   - B-9  -> PLANETARY PLACEMENT (the orbiting bodies positioned relative to
 *            the solar anchor; their data rides the profile bus, never a local
 *            table).
 *   - B-12 -> the cross-surface edit PROPAGATION listener, wired to kernel-bridge
 *            profile-tick events so an edit on one surface rides the next
 *            profile tick into the M1/M2/M3 panes.
 *
 * DOC-AHEAD-LANDING DISCIPLINE
 * The Wave-B integrated-bimba data (the planetary bodies, their chakral
 * correspondences, the solar ephemeris) has NOT landed yet. This file therefore
 * declares the contract shape of the seam — the principle, the placement
 * mapping, and the propagation wiring — and never a planetary/solar lookup
 * table of its own. Every concrete value flows from a backend
 * MathemeHarmonicProfile field (see planetaryChakral, owned by M2 Parashakti)
 * exactly as cosmic-engine-panes.tsx already enforces via the no-local-tables
 * discipline. When the upstream bodies land this contract is the single seam
 * they bind to.
 *
 * REGISTER DISCIPLINE
 * Every face of the seam carries exactly one register label:
 *   - design_principle — fixed compositional law (the solar anchor itself).
 *   - profile_sourced — value read from the profile bus, never computed locally.
 *   - propagation_seam — cross-surface edit propagation keyed to profile ticks.
 *
 * CROSS-LINKS
 * - Wave-B integrated-bimba (B-8 / B-9 / B-12) — originating composition seam.
 * - Tranche 09.5 — closing-tranche ownership for plugin-integrated-1-2-3.
 * - Tranche 07.3 — solar-anchor design-principle integration.
 * - Planet model is canonical mod-10: Sun(0) is the stable root/anchor and is
 *   EXCLUDED from the orbiting placements; Earth is the geocentric observer and
 *   is likewise never an orbiting placement.
 */

import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    MExtensionId,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    IntegratedGeometricSlot,
    ProfileFieldName
} from '@pratibimba/integrated-composition';
import type {
    K2LensRingCellDescriptor,
    M3CodonRotationProjectionForLensRing
} from '@pratibimba/m3-mahamaya';

/** The only register labels a face of this composition seam may carry. */
export type CompositionSeamRegister =
    | 'design_principle'
    | 'profile_sourced'
    | 'propagation_seam';

/** Frozen enumeration of the allowed register labels, for validation/tests. */
export const COMPOSITION_SEAM_REGISTERS: readonly CompositionSeamRegister[] = Object.freeze([
    'design_principle',
    'profile_sourced',
    'propagation_seam'
]);

/** The Wave-B integrated-bimba seam identifiers this plugin owns. */
export type WaveBSeamId = 'B-8' | 'B-9' | 'B-12';

// ============================================================================
// B-8 — Solar anchor (design principle)
// ============================================================================

/**
 * The solar-anchor design principle: the composition has exactly ONE immovable
 * gravitational centre that every other surface is positioned relative to. In
 * the cosmic-engine layout that centre is the M3 center-stage "now" — the codon
 * the current profile generation projects. The anchor is a *design law*, not a
 * profile field: it carries no data of its own, it only fixes the frame the
 * `profile_sourced` placements orbit.
 *
 * Per the canonical mod-10 planet model the Sun is the stable root/parent; it
 * is the anchor and is NEVER an orbiting placement. This rule is encoded in
 * {@link SolarAnchorPrinciple.excludedFromPlacement}.
 */
export interface SolarAnchorPrinciple {
    readonly seam: 'B-8';
    readonly register: Extract<CompositionSeamRegister, 'design_principle'>;
    /** The M-extension that owns the anchored centre stage (M3 Mahamaya). */
    readonly anchorOwner: MExtensionId;
    /** The geometric slot the anchor pins (the codon / cell-state centre). */
    readonly anchorSlot: IntegratedGeometricSlot;
    /** Bodies that are reference frames, never orbiting placements (Sun, Earth). */
    readonly excludedFromPlacement: readonly string[];
    /** Short human label. */
    readonly label: string;
}

/** The single solar anchor for the cosmic-engine composition. */
export const SOLAR_ANCHOR: SolarAnchorPrinciple = Object.freeze({
    seam: 'B-8',
    register: 'design_principle',
    anchorOwner: 'm3-mahamaya',
    anchorSlot: 'cell-state',
    // Sun = stable root/anchor; Earth = geocentric observer. Neither orbits.
    excludedFromPlacement: Object.freeze(['Sun', 'Earth']) as readonly string[],
    label: 'Solar anchor — the immovable centre the composition orbits'
});

// ============================================================================
// B-9 — Planetary placement (profile-sourced)
// ============================================================================

/**
 * A single planetary placement rule. It declares WHERE a planetary body is
 * composed (the geometric slot + owning M-extension) and WHICH profile field
 * its data must be read from — never a local constant. The set of bodies and
 * their chakral correspondences is supplied by the backend (M2's
 * `planetaryChakral`); this rule fixes only the placement frame.
 */
export interface PlanetaryPlacementRule {
    readonly seam: 'B-9';
    readonly register: Extract<CompositionSeamRegister, 'profile_sourced'>;
    /** The geometric slot the orbiting bodies are textured onto. */
    readonly placementSlot: IntegratedGeometricSlot;
    /** The M-extension that owns the planetary correspondence surface (M2). */
    readonly placementOwner: MExtensionId;
    /** The profile field the placement data MUST be read from. */
    readonly sourceField: ProfileFieldName;
    /** Whether placements are positioned relative to {@link SOLAR_ANCHOR}. */
    readonly orbitsSolarAnchor: boolean;
    /** Short human label. */
    readonly label: string;
}

/**
 * Planetary placement for the cosmic-engine composition. The orbiting bodies
 * are textured onto M2 Parashakti's surface and sourced from the
 * `planetaryChakral` profile field — the same field `cosmic-engine-panes.tsx`
 * renders. No planetary table lives here.
 */
export const PLANETARY_PLACEMENT: PlanetaryPlacementRule = Object.freeze({
    seam: 'B-9',
    register: 'profile_sourced',
    placementSlot: 'texture',
    placementOwner: 'm2-parashakti',
    sourceField: 'planetaryChakral',
    orbitsSolarAnchor: true,
    label: 'Planetary placement — bodies orbiting the solar anchor, read from planetaryChakral'
});

// ============================================================================
// B-12 — Cross-surface edit propagation (propagation seam)
// ============================================================================

/**
 * A normalised cross-surface edit-propagation event. The integrated-bimba
 * surface and the M1/M2/M3 panes share a single profile bus; when an edit on
 * one surface bumps the profile generation, the next kernel-bridge profile-tick
 * carries the new generation. This event is the normalised signal a sink uses
 * to re-derive its placement against the new tick — it carries no body payload
 * (the data is re-read from the profile, never threaded through here).
 */
export interface CrossSurfaceEditPropagation {
    /** The generation the surfaces were last agreed on (null before first tick). */
    readonly fromGeneration: number | null;
    /** The generation the incoming profile-tick advanced to (null if pending). */
    readonly toGeneration: number | null;
    /** True when the tick advanced the generation — i.e. an upstream edit landed. */
    readonly edited: boolean;
}

/** A sink that re-derives a cross-surface placement when an edit propagates. */
export type CrossSurfaceEditSink = (event: CrossSurfaceEditPropagation) => void;

/**
 * The cross-surface edit-propagation listener contract (B-12). Declares that
 * the propagation rides kernel-bridge profile-tick events and is fanned out by
 * {@link attachProfileTickPropagation}.
 */
export interface CrossSurfacePropagationListener {
    readonly seam: 'B-12';
    readonly register: Extract<CompositionSeamRegister, 'propagation_seam'>;
    /** The event stream the propagation is keyed to. */
    readonly trigger: 'kernel-bridge:profile-tick';
    /** Short human label. */
    readonly label: string;
}

/** The cross-surface propagation listener declaration for the cosmic engine. */
export const CROSS_SURFACE_PROPAGATION: CrossSurfacePropagationListener = Object.freeze({
    seam: 'B-12',
    register: 'propagation_seam',
    trigger: 'kernel-bridge:profile-tick',
    label: 'Cross-surface edit propagation — edits ride the profile-tick into every pane'
});

/**
 * Wire the cross-surface edit-propagation listener (B-12) onto the shared
 * bridge's profile-tick stream. Each `onProfile` emission IS a profile tick;
 * when the tick advances the generation an edit has propagated, so the sink is
 * notified. The sink re-reads its placement from the new profile — it is never
 * handed body data through this seam (doc-ahead: no payload threading).
 *
 * Returns a {@link Disposable}; dispose to detach the listener.
 */
export function attachProfileTickPropagation(
    bridge: SharedBridgeAdapter,
    sink: CrossSurfaceEditSink
): Disposable {
    let lastGeneration: number | null = null;
    return bridge.onProfile((profile: MathemeHarmonicProfileBoundary | null) => {
        const toGeneration = profile ? profile.generation : null;
        const fromGeneration = lastGeneration;
        const edited =
            toGeneration !== null && toGeneration !== fromGeneration;
        lastGeneration = toGeneration;
        sink(Object.freeze({ fromGeneration, toGeneration, edited }));
    });
}

export interface M3LensRingProjectionRead {
    readonly activeRingIndex: number;
    readonly rotationPhase: number;
    readonly cellCount: number;
    readonly activeCell: K2LensRingCellDescriptor | null;
}

export function readM3CodonRotationProjectionForLensRing(
    projection: M3CodonRotationProjectionForLensRing
): M3LensRingProjectionRead {
    return Object.freeze({
        activeRingIndex: projection.activeRingIndex,
        rotationPhase: projection.rotationPhase,
        cellCount: projection.cells.length,
        activeCell:
            projection.cells.find(cell => cell.ringIndex === projection.activeRingIndex) ??
            projection.cells[0] ??
            null
    });
}

// ============================================================================
// The whole seam, frozen
// ============================================================================

/** The Tranche 09.5 cross-link — the single point both waves cite. */
export const TRANCHE_09_5_CROSS_LINK = Object.freeze({
    wave: 'B',
    tranche: '09.5',
    surface: 'integrated-bimba',
    note:
        'Wave-B Tranche 09.5 closes plugin-integrated-1-2-3 ownership for B-8 ' +
        'solar anchor, B-9 planetary placement, and B-12 cross-surface edit ' +
        'propagation via kernel-bridge profile-tick events. PLANETARY_PLACEMENT.sourceField ' +
        '(planetaryChakral) remains the only data path and the solar anchor remains ' +
        'a frame-only design principle.'
});

/** The full composition-seam contract the plugin owns. */
export interface SolarAnchorCompositionContract {
    /** The Wave-B seam ids carried by this contract. */
    readonly seams: readonly WaveBSeamId[];
    /** B-8 — the solar anchor design principle. */
    readonly solarAnchor: SolarAnchorPrinciple;
    /** B-9 — planetary placement, sourced from the profile bus. */
    readonly planetaryPlacement: PlanetaryPlacementRule;
    /** B-12 — the cross-surface edit-propagation listener. */
    readonly propagation: CrossSurfacePropagationListener;
    /** Cross-link to the Wave-B integrated-bimba surface. */
    readonly origin: 'Wave-B integrated-bimba';
    /** Cross-link to the landing tranche. */
    readonly tranche: typeof TRANCHE_09_5_CROSS_LINK;
}

/** The single frozen composition-seam contract for the cosmic engine. */
export const SOLAR_ANCHOR_COMPOSITION_CONTRACT: SolarAnchorCompositionContract = Object.freeze({
    seams: Object.freeze(['B-8', 'B-9', 'B-12']) as readonly WaveBSeamId[],
    solarAnchor: SOLAR_ANCHOR,
    planetaryPlacement: PLANETARY_PLACEMENT,
    propagation: CROSS_SURFACE_PROPAGATION,
    origin: 'Wave-B integrated-bimba',
    tranche: TRANCHE_09_5_CROSS_LINK
});

/**
 * Assert that a composition-seam contract preserves the solar-anchor design
 * principle. Throws on any violation so a render-test (or a future runtime
 * guard) can prove the invariant rather than trust it.
 *
 * Checks:
 *   1. All three Wave-B seams (B-8 / B-9 / B-12) are present and each face
 *      carries its own seam id.
 *   2. The solar anchor is a `design_principle`; the planetary placement is
 *      `profile_sourced` (never a local table); the propagation is a
 *      `propagation_seam` keyed to profile-tick events.
 *   3. The Sun is excluded from the orbiting placements (it IS the anchor), and
 *      planetary placement orbits the solar anchor.
 */
export function assertSolarAnchorCompositionContract(
    contract: SolarAnchorCompositionContract = SOLAR_ANCHOR_COMPOSITION_CONTRACT
): SolarAnchorCompositionContract {
    const expectedSeams: readonly WaveBSeamId[] = ['B-8', 'B-9', 'B-12'];
    for (const seam of expectedSeams) {
        if (!contract.seams.includes(seam)) {
            throw new Error(`composition contract must carry Wave-B seam ${seam}`);
        }
    }
    if (contract.solarAnchor.seam !== 'B-8' || contract.solarAnchor.register !== 'design_principle') {
        throw new Error('solar anchor must be the B-8 design_principle face');
    }
    if (
        contract.planetaryPlacement.seam !== 'B-9' ||
        contract.planetaryPlacement.register !== 'profile_sourced'
    ) {
        throw new Error('planetary placement must be the B-9 profile_sourced face');
    }
    if (contract.propagation.seam !== 'B-12' || contract.propagation.register !== 'propagation_seam') {
        throw new Error('propagation must be the B-12 propagation_seam face');
    }
    if (contract.propagation.trigger !== 'kernel-bridge:profile-tick') {
        throw new Error('cross-surface propagation must be keyed to kernel-bridge profile-tick events');
    }
    if (!contract.solarAnchor.excludedFromPlacement.includes('Sun')) {
        throw new Error('the Sun is the anchor and must be excluded from orbiting placements');
    }
    if (!contract.planetaryPlacement.orbitsSolarAnchor) {
        throw new Error('planetary placement must orbit the solar anchor');
    }
    if (!COMPOSITION_SEAM_REGISTERS.includes(contract.solarAnchor.register)) {
        throw new Error('unknown register label on solar anchor');
    }
    return contract;
}

/**
 * B-8 NON-FORK INVARIANT
 *
 * Single `:Bimba` label + single `coordinate` property + single `graph-schema` crate
 * + single rendering composition seam (this plugin). No per-module graph fork, no
 * per-extension schema fork, no per-plugin rendering fork. The bimba map is the
 * system made walkable — three renderings (M1'/M2'/M3') over one substrate.
 *
 * @cross-link 09.T9.7 one-substrate / no-fork invariant codification
 * @cross-link M0'-SPEC / M2'-SPEC / M3'-SPEC — all share this invariant
 * @cross-link Body/S/S2/graph-schema — single authoritative schema crate
 */
