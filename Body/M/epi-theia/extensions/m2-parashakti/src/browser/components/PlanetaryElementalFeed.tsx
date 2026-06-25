// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2-5 (Parashakti epogdoon — the nine planetary orbiters
//                   projecting their elemental field) → #4.4.4.4 (PASU
//                   bioquaternion `elemental_weights`)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#19): 23.19 — planetary-orbiter elemental-weight feed
//   Actualises:     the live four-element weight vector the nine orbiters project,
//                   reading ONLY the typed projection published by the
//                   kernel-bridge. Each planet's Cousto-octave contribution is
//                   rendered as a stacked segment of the four-element bar.
//   Public surface: PlanetaryElementalFeed, buildPlanetaryElementalFeedModel, and
//                   the M2PlanetaryFeedBridge / M2PlanetaryElementalWeightsProjection
//                   / PlanetaryAspectHandle typed contract.
//   Does NOT own:   the weight law itself. The planet→element map
//                   (m2.h `M2_PLANET_LUT`, `ELEM_SIG_GET_ELEMENT`), the Cousto
//                   energies, and the aspect engine (portal-core `aspect.rs`
//                   `planetary_elemental_weights`, `compute_aspects`) live kernel-
//                   side and are surfaced through the bridge. This engine NEVER
//                   recomputes them; it only folds the published contributions for
//                   rendering and verifies the published vector.
//   Cross-links:    Track 24 (M3 codon lattice via the Sun-excluded 9:8 epogdoon),
//                   PASU being-pattern `elemental_weights` (#4.4.4.4 bioquaternion).
//   Contract:       kernelBridge.m2.planetaryElementalWeights() →
//                   { weights, perPlanet, aspectGain }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import {
    foldM2ElementalWeightContributions,
    m2ContributionIsBarElement,
    M2_BAR_ELEMENTS,
    type M2BarElement,
    type M2ElementalWeightContribution,
    type M2ElementalWeightVector
} from '../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The nine orbiters projecting the field — Sun (0) excluded as identity root. */
export const PLANETARY_ORBITER_COUNT = 9;

/** Planet_Id → display name (canonical mod-10 order; Sun included for labels). */
export const PLANET_NAMES: readonly string[] = Object.freeze([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
]);

/** Render colour per bar element + aether (mirrors the M2 cymatic palette). */
export const M2_ELEMENT_COLOURS: Readonly<Record<string, string>> = Object.freeze({
    fire: '#c5564b',
    water: '#5fa9b8',
    air: '#6ec1c8',
    earth: '#8a7355',
    aether: '#7d4f9e'
});

/** Provenance source-field for the feed (routes to the PASU elemental authority). */
export const M2_PLANETARY_FEED_PROVENANCE_FIELD = 'pasu.elementalWeights';

/** The single authority this engine reads through — never a local computation. */
export const PLANETARY_FEED_SOURCE = 'kernelBridge.m2.planetaryElementalWeights()' as const;

// ── Bridge contract (the ONLY typed projection this engine consumes) ─────────

/**
 * A serialisable handle for one aspect's amplification of the elemental field —
 * mirrors the kernel `PlanetaryAspectHandle` (portal-core `aspect.rs`).
 */
export interface PlanetaryAspectHandle {
    readonly handle: string;
    readonly planetA: number;
    readonly planetB: number;
    readonly aspectType: number;
    readonly aspectLabel: string;
    /** Harmonious aspects gain positive; hard aspects gain negative. */
    readonly gain: number;
}

/**
 * The typed projection returned by `kernelBridge.m2.planetaryElementalWeights()`.
 * Mirrors the kernel `PlanetaryElementalWeights`: the folded four-element vector,
 * each orbiter's contribution, and the aspect-gain handles.
 */
export interface M2PlanetaryElementalWeightsProjection {
    readonly weights: M2ElementalWeightVector;
    readonly perPlanet: readonly M2ElementalWeightContribution[];
    readonly aspectGain: readonly PlanetaryAspectHandle[];
}

/** A function projecting the live planetary elemental weights. */
export type M2PlanetaryWeightsProjector = () => M2PlanetaryElementalWeightsProjection;

/** The slice of the kernel-bridge this engine depends on. */
export interface M2PlanetaryFeedBridge {
    readonly m2: {
        readonly planetaryElementalWeights: M2PlanetaryWeightsProjector;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** One planet's stacked segment within a four-element bar. */
export interface PlanetarySegment {
    readonly planetId: number;
    readonly planetName: string;
    readonly element: M2BarElement;
    readonly couEnergy: number;
    /** Fraction of the whole bar-stack total this segment occupies (0..1). */
    readonly fraction: number;
    /** True for the orbiter currently live under the profile-tick. */
    readonly isActive: boolean;
}

/** One element column of the four-element bar with its planetary segments. */
export interface M2ElementalBar {
    readonly element: M2BarElement;
    readonly colour: string;
    /** Normalised weight of this element (0..1), as published by the bridge. */
    readonly weight: number;
    readonly segments: readonly PlanetarySegment[];
}

export interface PlanetaryElementalFeedModel {
    /** The four element bars (fire, water, air, earth), render-ordered. */
    readonly bars: readonly M2ElementalBar[];
    /** Every orbiter contribution as published (includes aether). */
    readonly contributions: readonly M2ElementalWeightContribution[];
    /** Aether (AKASHA / quintessence) contributions — informs balance, not the bar. */
    readonly aetherContributions: readonly M2ElementalWeightContribution[];
    /** The aspect-gain handles published by the bridge. */
    readonly aspectGain: readonly PlanetaryAspectHandle[];
    /** The orbiter currently live under the profile-tick. */
    readonly activePlanetId: number;
    /** The published four-element vector (authoritative). */
    readonly weights: M2ElementalWeightVector;
    /** The vector re-folded from contributions widget-side (for parity badging). */
    readonly recomputedWeights: M2ElementalWeightVector;
    /** True when the published vector matches the widget-side fold. */
    readonly weightsConsistent: boolean;
    /** True once the bridge surfaced a non-empty, well-formed feed. */
    readonly feedReady: boolean;
    /** The profile-tick that produced this feed, if known. */
    readonly tick: number | null;
}

export interface PlanetaryElementalFeedProps {
    /** The kernel-bridge slice. When absent the engine renders a feed-down state. */
    readonly kernelBridge?: M2PlanetaryFeedBridge | null;
    /** The orbiter to highlight as live (from the profile bus). */
    readonly activePlanetId?: number | null;
    /** Live profile-tick driving the feed (falls back to deriving the orbiter). */
    readonly tick?: number | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildPlanetaryElementalFeedModel(input: {
    readonly kernelBridge?: M2PlanetaryFeedBridge | null;
    readonly activePlanetId?: number | null;
    readonly tick?: number | null;
}): PlanetaryElementalFeedModel {
    const tick = normalizeTick(input.tick);
    const activePlanetId = resolveActivePlanet(input.activePlanetId, tick);
    const projection = safeProject(input.kernelBridge?.m2?.planetaryElementalWeights ?? null);

    if (!projection) {
        return emptyModel(activePlanetId, tick);
    }

    const contributions = projection.perPlanet;
    const barContributions = contributions.filter(m2ContributionIsBarElement);
    const aetherContributions = contributions.filter(c => !m2ContributionIsBarElement(c));

    const grandTotal = barContributions.reduce((acc, c) => acc + Math.max(0, c.couEnergy), 0);

    const bars: M2ElementalBar[] = M2_BAR_ELEMENTS.map(element => {
        const segments = barContributions
            .filter(c => c.element === element)
            .map(c =>
                Object.freeze({
                    planetId: c.planetId,
                    planetName: planetName(c.planetId),
                    element,
                    couEnergy: c.couEnergy,
                    fraction: grandTotal > 0 ? Math.max(0, c.couEnergy) / grandTotal : 0,
                    isActive: c.planetId === activePlanetId
                })
            );
        return Object.freeze({
            element,
            colour: M2_ELEMENT_COLOURS[element],
            weight: clampUnit(weightForElement(projection.weights, element)),
            segments: Object.freeze(segments)
        });
    });

    const recomputedWeights = foldM2ElementalWeightContributions(contributions);

    return Object.freeze({
        bars: Object.freeze(bars),
        contributions,
        aetherContributions: Object.freeze(aetherContributions),
        aspectGain: projection.aspectGain,
        activePlanetId,
        weights: projection.weights,
        recomputedWeights,
        weightsConsistent: vectorsClose(projection.weights, recomputedWeights),
        feedReady: contributions.length > 0,
        tick
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function PlanetaryElementalFeed(props: PlanetaryElementalFeedProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildPlanetaryElementalFeedModel({
                kernelBridge: props.kernelBridge ?? null,
                activePlanetId: props.activePlanetId ?? null,
                tick: props.tick ?? null
            }),
        [props.kernelBridge, props.activePlanetId, props.tick]
    );

    const className = ['m2-planetary-elemental-feed', props.className].filter(Boolean).join(' ');

    if (!model.feedReady) {
        return (
            <section
                className={className}
                aria-label="Planetary elemental-weight feed"
                data-planetary-elemental-feed
                data-feed-state="feed-unavailable"
                data-active-planet={model.activePlanetId}
            >
                <p className="mext-widget-empty" data-pending-field={PLANETARY_FEED_SOURCE}>
                    The planetary elemental-weight feed is waiting for {PLANETARY_FEED_SOURCE}.
                </p>
            </section>
        );
    }

    return (
        <section
            className={className}
            aria-label="Planetary elemental-weight feed"
            data-planetary-elemental-feed
            data-feed-state="ready"
            data-active-planet={model.activePlanetId}
            data-active-tick={model.tick ?? ''}
            data-weights-consistent={model.weightsConsistent ? 'true' : 'false'}
            data-aether-count={model.aetherContributions.length}
        >
            <header className="m2-planetary-elemental-feed__header">
                <h4>Planetary elemental weights</h4>
                <span className="m2-planetary-elemental-feed__ratio">9 orbiters → 4 elements</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_PLANETARY_FEED_PROVENANCE_FIELD}
                        readiness={props.readiness ?? 'ready_public_current'}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_PLANETARY_FEED_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            <ol className="m2-planetary-elemental-feed__bars" aria-label="Four-element weight bar">
                {model.bars.map(bar => (
                    <ElementalBarView key={bar.element} bar={bar} />
                ))}
            </ol>

            <AspectGainStrip aspectGain={model.aspectGain} />
            <AetherNote contributions={model.aetherContributions} />
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ElementalBarView({ bar }: { readonly bar: M2ElementalBar }): React.ReactElement {
    const weightPercent = Number((bar.weight * 100).toFixed(2));
    return (
        <li
            className="m2-planetary-elemental-feed__bar"
            data-elemental-bar
            data-element={bar.element}
            data-weight={bar.weight.toFixed(6)}
            data-segment-count={bar.segments.length}
        >
            <span className="m2-planetary-elemental-feed__bar-label">
                {bar.element}
                <span className="m2-planetary-elemental-feed__bar-weight">{weightPercent}%</span>
            </span>
            <div
                className="m2-planetary-elemental-feed__bar-track"
                role="img"
                aria-label={`${bar.element} ${weightPercent}% across ${bar.segments.length} planets`}
            >
                {bar.segments.map(segment => (
                    <span
                        key={segment.planetId}
                        className="m2-planetary-elemental-feed__segment"
                        data-planet-segment
                        data-planet-id={segment.planetId}
                        data-planet-name={segment.planetName}
                        data-active={segment.isActive ? 'true' : 'false'}
                        style={{
                            width: `${(segment.fraction * 100).toFixed(4)}%`,
                            backgroundColor: bar.colour
                        }}
                        title={`${segment.planetName} → ${bar.element} (Cousto ${segment.couEnergy} Hz)`}
                    />
                ))}
            </div>
        </li>
    );
}

function AspectGainStrip({
    aspectGain
}: {
    readonly aspectGain: readonly PlanetaryAspectHandle[];
}): React.ReactElement | null {
    if (aspectGain.length === 0) {
        return null;
    }
    return (
        <ul
            className="m2-planetary-elemental-feed__aspect-strip"
            aria-label="Aspect-gain handles"
            data-aspect-gain-strip
        >
            {aspectGain.map(handle => (
                <li
                    key={handle.handle}
                    className="m2-planetary-elemental-feed__aspect"
                    data-aspect-handle={handle.handle}
                    data-aspect-type={handle.aspectType}
                    data-gain-polarity={handle.gain >= 0 ? 'harmonious' : 'tense'}
                >
                    <span className="m2-planetary-elemental-feed__aspect-label">{handle.aspectLabel}</span>
                    <span className="m2-planetary-elemental-feed__aspect-pair">
                        {planetName(handle.planetA)} · {planetName(handle.planetB)}
                    </span>
                    <span className="m2-planetary-elemental-feed__aspect-gain">
                        {handle.gain >= 0 ? '+' : ''}
                        {handle.gain.toFixed(2)}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function AetherNote({
    contributions
}: {
    readonly contributions: readonly M2ElementalWeightContribution[];
}): React.ReactElement | null {
    if (contributions.length === 0) {
        return null;
    }
    return (
        <p
            className="m2-planetary-elemental-feed__aether-note"
            data-aether-note
            style={{ color: M2_ELEMENT_COLOURS.aether }}
        >
            Quintessence (aether) carried by{' '}
            {contributions.map(c => planetName(c.planetId)).join(', ')} — balancing the four, not stacked in the bar.
        </p>
    );
}

// ── Normalisers (bounds + parity only; no weight arithmetic) ─────────────────

function safeProject(
    projector: M2PlanetaryWeightsProjector | null
): M2PlanetaryElementalWeightsProjection | null {
    if (!projector) {
        return null;
    }
    try {
        const projection = projector();
        if (
            !projection ||
            !projection.weights ||
            !Array.isArray(projection.perPlanet) ||
            !Array.isArray(projection.aspectGain)
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function emptyModel(activePlanetId: number, tick: number | null): PlanetaryElementalFeedModel {
    const zero = Object.freeze({ earth: 0, fire: 0, water: 0, air: 0 });
    return Object.freeze({
        bars: Object.freeze([] as M2ElementalBar[]),
        contributions: Object.freeze([] as M2ElementalWeightContribution[]),
        aetherContributions: Object.freeze([] as M2ElementalWeightContribution[]),
        aspectGain: Object.freeze([] as PlanetaryAspectHandle[]),
        activePlanetId,
        weights: zero,
        recomputedWeights: zero,
        weightsConsistent: true,
        feedReady: false,
        tick
    });
}

function resolveActivePlanet(activePlanetId: number | null | undefined, tick: number | null): number {
    if (typeof activePlanetId === 'number' && Number.isFinite(activePlanetId)) {
        return clampOrbiter(activePlanetId);
    }
    if (tick !== null) {
        // The nine orbiters cycle 1..9 as the profile-tick advances.
        return 1 + (((Math.trunc(tick) % PLANETARY_ORBITER_COUNT) + PLANETARY_ORBITER_COUNT) % PLANETARY_ORBITER_COUNT);
    }
    return FIRST_ORBITER;
}

function planetName(planetId: number): string {
    return PLANET_NAMES[planetId] ?? `planet-${planetId}`;
}

function weightForElement(weights: M2ElementalWeightVector, element: M2BarElement): number {
    return weights[element];
}

function vectorsClose(a: M2ElementalWeightVector, b: M2ElementalWeightVector): boolean {
    return (
        Math.abs(a.fire - b.fire) < 1e-3 &&
        Math.abs(a.water - b.water) < 1e-3 &&
        Math.abs(a.air - b.air) < 1e-3 &&
        Math.abs(a.earth - b.earth) < 1e-3
    );
}

function normalizeTick(tick: number | null | undefined): number | null {
    return typeof tick === 'number' && Number.isFinite(tick) ? Math.trunc(tick) : null;
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}

function clampOrbiter(value: number): number {
    const rounded = Math.trunc(value);
    if (rounded < FIRST_ORBITER) {
        return FIRST_ORBITER;
    }
    if (rounded >= PLANET_NAMES.length) {
        return PLANET_NAMES.length - 1;
    }
    return rounded;
}

/** First orbiter included — Sun (0) is the excluded identity root. */
const FIRST_ORBITER = 1;

export default PlanetaryElementalFeed;
