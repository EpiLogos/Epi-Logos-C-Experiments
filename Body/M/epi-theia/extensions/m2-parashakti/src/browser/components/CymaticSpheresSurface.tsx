// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 Parashakti vibrational web, Layer C cymatic surface, third
//                   variant — the daily-0-1 cosmic-side solar-system anchor view
//                   (UX §8.1 + M2-ARCHITECTURE §5.3.2).
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#23): 23.9 — Cymatic spheres (chakras) variant. DEFERRED NAMED
//                   CARRIER. Named so the variant does not become an orphan; the
//                   8-concentric-sphere spherical-harmonic renderer is NOT built in
//                   cycle-3 (parallel to the Tranche 3.7-M2 music-tech deferral).
//   Actualises:     a deterministic, non-crashing "pending — solar anchor variant"
//                   placeholder tile that the Layer C variant switcher renders when
//                   `surfaceVariant === 'spheres'`. The full surface — 8 concentric
//                   spheres (one per chakra), spherical-harmonic modes per layer,
//                   composed inside plugin-integrated-1-2-3 around the Earth-Sun pair
//                   with chakra-spheres between Earth and the active planetary-hour
//                   ruler — is reserved for a follow-on tranche.
//   Public surface: CymaticSpheresSurface, buildCymaticSpheresPendingModel, the
//                   CymaticSpheresPendingModel / CymaticSpheresSurfaceProps view
//                   models, and the deferral tokens (CYMATIC_SPHERES_DEFERRAL,
//                   CYMATIC_SPHERES_PENDING_LABEL, CYMATIC_SPHERES_CHAKRA_COUNT,
//                   CYMATIC_SPHERES_SUBSTRATE).
//   Does NOT own:   the spherical-harmonic renderer (deferred), the chakra law
//                   (`M2_CHAKRA_LUT[8]` in m2.h), the planet law (`M2_PLANET_LUT[10]`
//                   + Earth observer-centre, m2.h), nor the composition geometry
//                   (the spheres-on-K² engine lives at plugin-integrated-1-2-3
//                   composition level, not here). It only CITES the landed substrate
//                   and renders the pending tile.
//   Cross-links:    CymaticChladniSurface (sibling 'plate' variant — the built
//                   Layer C default), composition.ts (`M2_SURFACE_VARIANT_REGISTRY`
//                   — the variant→status registry), planetary-lut.ts (the active
//                   planetary-hour ruler the deferred surface will anchor between
//                   Earth and the orbiter), DCC-03 (Earth as the 10th planet /
//                   observer-centre).
//   Contract:       registry status `'spheres' → 'deferred-23.9'`; pending tile
//                   label `'pending — solar anchor variant'`; substrate citation
//                   only — never recompute the chakra/planet LUTs widget-side.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import { allPlanetLUTRows, planetLUT } from '../../common/planetary-lut';

/** Local non-throwing mod-10 guard (`planetary-lut` keeps its `isPlanetIndex` private). */
function isCanonicalPlanetIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index <= 9;
}

/** The deferral token registered against the `'spheres'` Layer C variant. */
export const CYMATIC_SPHERES_DEFERRAL = 'deferred-23.9' as const;

/** The pending-tile label the variant switcher renders for the deferred surface. */
export const CYMATIC_SPHERES_PENDING_LABEL = 'pending — solar anchor variant' as const;

/**
 * The eight concentric spheres — one per chakra — the full surface will render.
 * Citation of `M2_CHAKRA_LUT[8]` (m2.h); never recomputed here.
 */
export const CYMATIC_SPHERES_CHAKRA_COUNT = 8;

/**
 * The landed substrate the deferred renderer will consume when promoted. Pure
 * citation — these LUTs live in C (`m2.h`) and reach the widget through the
 * kernel bridge; this carrier only names them so the dependency is legible.
 */
export const CYMATIC_SPHERES_SUBSTRATE = Object.freeze({
    chakraLut: 'M2_CHAKRA_LUT[8]',
    planetLut: 'M2_PLANET_LUT[10]',
    earthObserverCentre: 'DCC-03: Earth = 10th planet, observer-centre',
    plannedRendererResidency: 'plugin-integrated-1-2-3 composition geometry',
    activePlanetSource: 'parashakti_meaning.routing_trace.planetary_hour_ruler'
} as const);

export interface CymaticSpheresSurfaceProps {
    /** Live 72-address descending into the vibrational web (anchors the future render). */
    readonly address72?: number;
    /** Active planetary-hour ruler (0–9, canonical mod-10) between Earth and which the spheres render. */
    readonly activePlanetIndex?: number | null;
    /** Held profile-tick, surfaced for telemetry parity with the built surfaces. */
    readonly tick?: number | null;
    readonly className?: string;
}

export interface CymaticSpheresPendingModel {
    readonly deferralId: typeof CYMATIC_SPHERES_DEFERRAL;
    readonly pendingLabel: typeof CYMATIC_SPHERES_PENDING_LABEL;
    readonly chakraCount: number;
    readonly planetCount: number;
    readonly address72: number | null;
    readonly tick: number | null;
    /** Resolved active-planet name, or `'unresolved'` when no ruler is selected yet. */
    readonly activePlanetName: string;
    readonly activePlanetIndex: number | null;
}

/**
 * Build the deferred pending-tile model. Pure; never throws — an out-of-range or
 * absent planet index degrades to `'unresolved'` rather than crashing the switcher.
 */
export function buildCymaticSpheresPendingModel(
    input: Pick<CymaticSpheresSurfaceProps, 'address72' | 'activePlanetIndex' | 'tick'> = {}
): CymaticSpheresPendingModel {
    const activePlanetIndex =
        typeof input.activePlanetIndex === 'number' && isCanonicalPlanetIndex(input.activePlanetIndex)
            ? input.activePlanetIndex
            : null;
    return Object.freeze({
        deferralId: CYMATIC_SPHERES_DEFERRAL,
        pendingLabel: CYMATIC_SPHERES_PENDING_LABEL,
        chakraCount: CYMATIC_SPHERES_CHAKRA_COUNT,
        planetCount: allPlanetLUTRows().length,
        address72:
            typeof input.address72 === 'number' && Number.isFinite(input.address72)
                ? Math.trunc(input.address72)
                : null,
        tick:
            typeof input.tick === 'number' && Number.isFinite(input.tick)
                ? Math.trunc(input.tick)
                : null,
        activePlanetName: activePlanetIndex === null ? 'unresolved' : planetLUT(activePlanetIndex).name,
        activePlanetIndex
    });
}

/**
 * The deferred Layer C 'spheres' carrier. Renders a deterministic, non-interactive
 * "pending — solar anchor variant" tile so the variant switcher can mount the
 * `'spheres'` selection without crashing. No spherical-harmonic geometry is drawn —
 * that renderer is reserved for a follow-on tranche per 23.9.
 */
export function CymaticSpheresSurface(props: CymaticSpheresSurfaceProps): React.ReactElement {
    const model = buildCymaticSpheresPendingModel(props);
    const className = ['m2-cymatic-spheres-surface', props.className].filter(Boolean).join(' ');

    return (
        <figure
            className={className}
            data-cymatic-spheres-surface="deferred"
            data-surface-variant="spheres"
            data-deferral-id={model.deferralId}
            data-chakra-count={model.chakraCount}
            data-planet-count={model.planetCount}
            data-active-planet-index={model.activePlanetIndex ?? ''}
            data-address72={model.address72 ?? ''}
            data-held-tick={model.tick ?? ''}
            role="img"
            aria-label={`M2 cymatic spheres variant — ${model.pendingLabel}`}
        >
            <div className="m2-cymatic-spheres-surface__pending-tile">
                <span className="m2-cymatic-spheres-surface__badge" data-pending-spheres-variant>
                    {model.pendingLabel}
                </span>
                <p className="m2-cymatic-spheres-surface__note">
                    The {model.chakraCount} concentric chakra spheres render inside
                    plugin-integrated-1-2-3 around the Earth-Sun anchor — between Earth and
                    the active planetary-hour ruler ({model.activePlanetName}). The
                    spherical-harmonic renderer is deferred ({model.deferralId}); the
                    substrate (M2_CHAKRA_LUT[8], M2_PLANET_LUT[{model.planetCount}]) is landed.
                </p>
            </div>
            <figcaption className="m2-cymatic-spheres-surface__caption">
                <span>{model.deferralId}</span>
                <span>solar anchor variant — pending follow-on tranche</span>
            </figcaption>
        </figure>
    );
}
