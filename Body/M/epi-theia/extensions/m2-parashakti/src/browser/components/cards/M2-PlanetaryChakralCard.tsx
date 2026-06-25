// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2-5 planetary-chakral axis (the Cousto octave planets ↔ chakra
//                   centres — the epogdoon 9:8 orbiter-to-chakra resonance)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #6 (hosts the 23.6 view-switch)
//   Actualises:     the planetary-chakral reading for the live `address72`, read ONLY
//                   through `kernelBridge.m2.decodeAxisAt(address72, "planetary-chakral")`
//                   → Cousto Hz + digital root + chakra glyph + element badge +
//                   Keplerian velocity + day-of-week. Hosts the Vibrational↔Psychoid
//                   view-mode switch (23.6); the psychoid face honestly defers for the
//                   three outer planets (Uranus/Neptune/Pluto) whose dataset is pending.
//   Public surface: PlanetaryChakralCard, buildPlanetaryChakralCardModel, the
//                   M2PlanetaryChakralProjection / M2PlanetaryChakralCardBridge typed
//                   contract, the PlanetaryChakralCardModel view model, and the
//                   PlanetaryViewMode re-export.
//   Does NOT own:   the planet LUT, the Cousto octave law, or the chakra resonance
//                   table. The mod-10 planet model lives kernel-side and is surfaced
//                   through `decodeAxisAt`. This card NEVER recomputes it; it folds the
//                   published projection. Personal-Pratibimba planetary data stays M4'.
//   Cross-links:    PlanetaryViewModeSwitch (23.6), DecanFaceCard (ruling planet),
//                   SeventyTwoFoldBreadcrumb step 4 (23.7), outer-planet pending honesty.
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "planetary-chakral") →
//                   { address72, planetIndex, planetName, coustoHz, digitalRoot, chakra,
//                     element, keplerianVelocity, day, isOuterPlanet }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import type { PlanetaryViewMode } from '../../../common/planetary-lut';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

export type { PlanetaryViewMode } from '../../../common/planetary-lut';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every planetary-chakral reading keys off an address. */
export const PLANETARY_CHAKRAL_ADDRESS_COUNT = 72;

/** Provenance source-field for the planetary-chakral payload (routes to the S2 authority). */
export const M2_PLANETARY_CHAKRAL_PROVENANCE_FIELD = 'planetaryChakralFrame';

/** The single planetary authority this card reads through — never a local computation. */
export const PLANETARY_CHAKRAL_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "planetary-chakral")' as const;

/** Honest pending badge for the three outer-planet psychoid datasets (2-5-8/9/10). */
export const PENDING_PSYCHOID_OUTER_PLANET_BADGE = 'pending-psychoid-outer-planet';

/** Planet glyphs, canonical mod-10 order (Sun..Pluto). */
const PLANET_GLYPHS: readonly string[] = Object.freeze(['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']);

/** Chakra glyph map — bija-mandala marker per centre. */
const CHAKRA_GLYPHS: Readonly<Record<string, string>> = Object.freeze({
    MULADHARA: '◆',
    SVADHISTHANA: '☾',
    MANIPURA: '▲',
    ANAHATA: '✶',
    VISHUDDHA: '◯',
    AJNA: '☉',
    SAHASRARA: '✷',
    'EARTH-root': '⊕'
});

/** Element hue map mirroring the M2 palette. */
const ELEMENT_HUES: Readonly<Record<string, string>> = Object.freeze({
    AGNI: '#c5564b',
    PRITHVI: '#8a7355',
    VAYU: '#6ec1c8',
    APAS: '#5fa9b8',
    AKASHA: '#7d4f9e'
});

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "planetary-chakral")`. */
export interface M2PlanetaryChakralProjection {
    readonly address72: number;
    readonly planetIndex: number;
    readonly planetName: string;
    readonly coustoHz: number;
    readonly digitalRoot: number;
    readonly chakra: string;
    readonly element: string;
    readonly keplerianVelocity: number;
    readonly day: string;
    /** True for the transpersonal outer planets (Uranus/Neptune/Pluto, idx 7/8/9). */
    readonly isOuterPlanet: boolean;
}

/** A function decoding a 72-address along the planetary-chakral axis. */
export type M2PlanetaryChakralDecoder = (address72: number, axis: 'planetary-chakral') => M2PlanetaryChakralProjection;

/** The slice of the kernel-bridge this card depends on. */
export interface M2PlanetaryChakralCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2PlanetaryChakralDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface PlanetaryChakralCardModel {
    readonly address72: number;
    readonly projection: M2PlanetaryChakralProjection | null;
    readonly planetGlyph: string;
    readonly chakraGlyph: string;
    readonly elementHue: string;
    readonly viewMode: PlanetaryViewMode;
    /** True when psychoid mode is requested for an outer planet whose dataset is pending. */
    readonly psychoidPending: boolean;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    readonly bridgeReady: boolean;
}

export interface PlanetaryChakralCardProps {
    /** The live vibrational address descending into the planetary-chakral axis. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2PlanetaryChakralCardBridge | null;
    /** Active view mode for the 23.6 Vibrational↔Psychoid switch. */
    readonly viewMode?: PlanetaryViewMode;
    /** Switch handler — toggles the 23.6 view mode. */
    readonly onViewModeChange?: (mode: PlanetaryViewMode) => void;
    /** Klein-flip phase (carried for parity). */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildPlanetaryChakralCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2PlanetaryChakralCardBridge | null;
    readonly viewMode?: PlanetaryViewMode;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): PlanetaryChakralCardModel {
    const address72 = clampAddress72(input.address72);
    const viewMode: PlanetaryViewMode = input.viewMode === 'psychoid' ? 'psychoid' : 'vibrational';
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const planetGlyph = projection ? PLANET_GLYPHS[clampPlanet(projection.planetIndex)] : '·';
    const chakraGlyph = projection ? CHAKRA_GLYPHS[projection.chakra] ?? '○' : '○';
    const elementHue = projection ? ELEMENT_HUES[projection.element] ?? '#9aa6b2' : '#5a6472';
    const psychoidPending = viewMode === 'psychoid' && projection ? projection.isOuterPlanet : false;

    return Object.freeze({
        address72,
        projection,
        planetGlyph,
        chakraGlyph,
        elementHue,
        viewMode,
        psychoidPending,
        kleinFlipPhase,
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function PlanetaryChakralCard(props: PlanetaryChakralCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildPlanetaryChakralCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                viewMode: props.viewMode,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.viewMode, props.kleinFlipPhase]
    );

    const className = ['m2-planetary-chakral-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');
    const p = model.projection;

    return (
        <article
            className={className}
            data-planetary-chakral-card
            data-sacred-sonic-card="planetary-chakral"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-planet-view-mode={model.viewMode}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-planetary-chakral-card__header">
                <h4>
                    <span className="m2-planetary-chakral-card__planet-glyph" aria-hidden="true">
                        {model.planetGlyph}
                    </span>{' '}
                    {p ? p.planetName : 'Planetary chakral'}
                </h4>
                <span className="m2-planetary-chakral-card__address">#2-5 · {model.address72}</span>
                <PlanetaryViewModeSwitch viewMode={model.viewMode} onViewModeChange={props.onViewModeChange} />
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_PLANETARY_CHAKRAL_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_PLANETARY_CHAKRAL_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {p ? (
                model.psychoidPending ? (
                    <PsychoidPendingPanel planetName={p.planetName} />
                ) : model.viewMode === 'psychoid' ? (
                    <PsychoidPanel projection={p} chakraGlyph={model.chakraGlyph} />
                ) : (
                    <VibrationalPanel projection={p} chakraGlyph={model.chakraGlyph} elementHue={model.elementHue} />
                )
            ) : (
                <p className="mext-widget-empty" data-pending-field={PLANETARY_CHAKRAL_SOURCE}>
                    The planetary-chakral reading is waiting for {PLANETARY_CHAKRAL_SOURCE}.
                </p>
            )}
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function PlanetaryViewModeSwitch({
    viewMode,
    onViewModeChange
}: {
    readonly viewMode: PlanetaryViewMode;
    readonly onViewModeChange?: (mode: PlanetaryViewMode) => void;
}): React.ReactElement {
    return (
        <div
            className="m2-planetary-chakral-card__view-switch"
            role="group"
            aria-label="Planetary view mode (Vibrational / Psychoid)"
            data-planetary-view-switch
        >
            {(['vibrational', 'psychoid'] as const).map(mode => (
                <button
                    key={mode}
                    type="button"
                    className="m2-planetary-chakral-card__view-switch-button"
                    data-view-mode={mode}
                    data-active={viewMode === mode ? 'true' : 'false'}
                    aria-pressed={viewMode === mode}
                    disabled={!onViewModeChange}
                    onClick={() => onViewModeChange?.(mode)}
                >
                    {mode === 'vibrational' ? 'Vibrational' : 'Psychoid'}
                </button>
            ))}
        </div>
    );
}

function VibrationalPanel({
    projection,
    chakraGlyph,
    elementHue
}: {
    readonly projection: M2PlanetaryChakralProjection;
    readonly chakraGlyph: string;
    readonly elementHue: string;
}): React.ReactElement {
    return (
        <dl className="m2-planetary-chakral-card__body">
            <dt>Cousto Hz</dt>
            <dd>{projection.coustoHz} Hz</dd>
            <dt>Digital root</dt>
            <dd>DR {projection.digitalRoot}</dd>
            <dt>Chakra</dt>
            <dd>
                <span className="m2-planetary-chakral-card__chakra-glyph" aria-hidden="true">
                    {chakraGlyph}
                </span>{' '}
                {projection.chakra}
            </dd>
            <dt>Element</dt>
            <dd data-element={projection.element}>
                <span className="m2-planetary-chakral-card__element-swatch" style={{ background: elementHue }} aria-hidden="true" />
                {projection.element}
            </dd>
            <dt>Keplerian velocity</dt>
            <dd>{projection.keplerianVelocity}</dd>
            <dt>Day</dt>
            <dd>{projection.day}</dd>
        </dl>
    );
}

function PsychoidPanel({
    projection,
    chakraGlyph
}: {
    readonly projection: M2PlanetaryChakralProjection;
    readonly chakraGlyph: string;
}): React.ReactElement {
    return (
        <dl className="m2-planetary-chakral-card__body" data-psychoid>
            <dt>Chakra</dt>
            <dd>
                <span className="m2-planetary-chakral-card__chakra-glyph" aria-hidden="true">
                    {chakraGlyph}
                </span>{' '}
                {projection.chakra}
            </dd>
            <dt>Psychoid correspondence</dt>
            <dd>kernelBridge.m0.psychoidPlanetary(planet_id)</dd>
        </dl>
    );
}

function PsychoidPendingPanel({ planetName }: { readonly planetName: string }): React.ReactElement {
    return (
        <dl className="m2-planetary-chakral-card__body" data-psychoid-pending>
            <dt>Psychoid correspondence</dt>
            <dd>
                <span className="m2-pending-badge" data-pending-psychoid={PENDING_PSYCHOID_OUTER_PLANET_BADGE}>
                    {PENDING_PSYCHOID_OUTER_PLANET_BADGE}
                </span>
            </dd>
            <dt>Planet</dt>
            <dd>{planetName} (transpersonal — dataset pending)</dd>
        </dl>
    );
}

// ── Normalisers (bounds + parity only; no planetary arithmetic) ──────────────

function safeDecode(decoder: M2PlanetaryChakralDecoder, address72: number): M2PlanetaryChakralProjection | null {
    try {
        const projection = decoder(address72, 'planetary-chakral');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.planetName !== 'string' ||
            typeof projection.coustoHz !== 'number'
        ) {
            return null;
        }
        return Object.freeze({
            ...projection,
            isOuterPlanet: projection.isOuterPlanet === true
        });
    } catch {
        return null;
    }
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % PLANETARY_CHAKRAL_ADDRESS_COUNT) + PLANETARY_CHAKRAL_ADDRESS_COUNT) % PLANETARY_CHAKRAL_ADDRESS_COUNT;
}

function clampPlanet(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % PLANET_GLYPHS.length) + PLANET_GLYPHS.length) % PLANET_GLYPHS.length;
}

export default PlanetaryChakralCard;
