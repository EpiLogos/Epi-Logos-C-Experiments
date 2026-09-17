// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2-5 planetary-chakral axis (the Cousto octave planets ↔ chakra
//                   centres) crossed with #0-5 psychoid recognition — the
//                   Vibrational (explicate) ↔ Psychoid (implicate) face of the
//                   PlanetaryChakralCard.
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#6):  23.6 — Vibrational↔Psychoid view-switcher on the planetary card
//   Actualises:     the two-mode reading of one orbiter. Vibrational reads the
//                   M2_PLANET_LUT row ONLY through `kernelBridge.m2.planetLUT(idx)`;
//                   Psychoid reads the archetypal correspondence ONLY through
//                   `kernelBridge.m2.psychoidProjection(idx)`. The switch toggles
//                   which published face is folded for render. The psychoid face
//                   honestly defers for the three outer planets (Uranus/Neptune/
//                   Pluto, idx 7/8/9) whose #2-5-8/9/10 dataset is still pending.
//   Public surface: PlanetaryViewModeSwitch, buildPlanetaryViewModeModel, the
//                   M2PsychoidProjection / M2PlanetaryViewModeBridge typed contract,
//                   and the PlanetaryViewModeModel view model.
//   Does NOT own:   the planet LUT (`planetary-lut.ts` M2_PLANET_LUT_ROWS,
//                   surfaced kernel-side as `planetLUT`), the Cousto octave law,
//                   or the psychoid archetype table (kernel-side, surfaced as
//                   `psychoidProjection`). This switch NEVER recomputes either
//                   face; it folds the published projection and toggles between
//                   them. Personal-Pratibimba planetary data stays M4'.
//   Cross-links:    PlanetaryChakralCard (23.3, hosts this switch),
//                   planetary-correspondence (psychoid panel), outer-planet
//                   pending honesty (PENDING_PSYCHOID_OUTER_PLANET_BADGE).
//   Contract:       kernelBridge.m2.planetLUT(idx) → M2PlanetLUTRow
//                   kernelBridge.m2.psychoidProjection(idx) → M2PsychoidProjection
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import {
    isOuterPlanetIndex,
    PENDING_PSYCHOID_OUTER_PLANET_BADGE,
    type M2PlanetLUTRow,
    type PlanetaryViewMode
} from '../../common/planetary-lut';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from './ProvenanceBadge';

export type { PlanetaryViewMode } from '../../common/planetary-lut';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The two faces of one orbiter, render-ordered (Vibrational is the default face). */
export const PLANETARY_VIEW_MODES: readonly PlanetaryViewMode[] = Object.freeze(['vibrational', 'psychoid']);

/** The default face — the explicate, vibrational reading. */
export const DEFAULT_PLANETARY_VIEW_MODE: PlanetaryViewMode = 'vibrational';

/** Provenance source-field for the vibrational face (the planet LUT row). */
export const M2_VIBRATIONAL_PROVENANCE_FIELD = 'planetaryChakralFrame';

/** Provenance source-field for the psychoid face (the archetypal correspondence). */
export const M2_PSYCHOID_PROVENANCE_FIELD = 'psychoidPlanetaryFrame';

/** The single vibrational authority this switch reads through — never a local computation. */
export const VIBRATIONAL_SOURCE = 'kernelBridge.m2.planetLUT(idx)' as const;

/** The single psychoid authority this switch reads through — never a local computation. */
export const PSYCHOID_SOURCE = 'kernelBridge.m2.psychoidProjection(idx)' as const;

/** Chakra glyph map — bija-mandala marker per centre (mirrors the planetary card). */
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

// ── Bridge contract (the two typed projections this switch consumes) ─────────

/**
 * The typed projection returned by `kernelBridge.m2.psychoidProjection(idx)` —
 * the implicate/archetypal face of an orbiter. Mirrors the kernel psychoid
 * correspondence: the Jungian archetype, the associated complex, and the shadow
 * face that the planet's chakra centre carries. The three outer planets
 * (Uranus/Neptune/Pluto) defer honestly via `pending` until #2-5-8/9/10 lands.
 */
export interface M2PsychoidProjection {
    readonly planetIndex: number;
    readonly planetName: string;
    readonly chakra: string;
    /** The archetypal correspondence (e.g. "Self", "Anima", "Senex"). */
    readonly archetype: string;
    /** The constellated complex this orbiter governs. */
    readonly complex: string;
    /** The shadow face the centre carries. */
    readonly shadowFace: string;
    /** True for the transpersonal outer planets whose psychoid dataset is pending. */
    readonly pending: boolean;
}

/** A function reading the vibrational LUT row for an orbiter. */
export type M2PlanetLUTReader = (index: number) => M2PlanetLUTRow;

/** A function reading the psychoid projection for an orbiter. */
export type M2PsychoidReader = (index: number) => M2PsychoidProjection;

/** The slice of the kernel-bridge this switch depends on. */
export interface M2PlanetaryViewModeBridge {
    readonly m2: {
        readonly planetLUT: M2PlanetLUTReader;
        readonly psychoidProjection: M2PsychoidReader;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface PlanetaryViewModeModel {
    readonly planetIndex: number;
    readonly viewMode: PlanetaryViewMode;
    /** The vibrational LUT row, when the bridge surfaced one. */
    readonly vibrational: M2PlanetLUTRow | null;
    /** The psychoid projection, when the bridge surfaced one. */
    readonly psychoid: M2PsychoidProjection | null;
    readonly chakraGlyph: string;
    readonly elementHue: string;
    /** True when psychoid mode is requested for an outer planet whose dataset is pending. */
    readonly psychoidPending: boolean;
    /** True once the face the switch is showing surfaced a well-formed projection. */
    readonly faceReady: boolean;
}

export interface PlanetaryViewModeSwitchProps {
    /** The orbiter to read (canonical mod-10 index, Sun..Pluto). */
    readonly planetIndex: number;
    /** The kernel-bridge slice. When absent the switch renders a bridge-down state. */
    readonly kernelBridge?: M2PlanetaryViewModeBridge | null;
    /** Active view mode (controlled). Defaults to the vibrational face. */
    readonly viewMode?: PlanetaryViewMode;
    /** Switch handler — toggles the 23.6 view mode. Absent → buttons disabled. */
    readonly onViewModeChange?: (mode: PlanetaryViewMode) => void;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projections) ─────────

export function buildPlanetaryViewModeModel(input: {
    readonly planetIndex: number;
    readonly kernelBridge?: M2PlanetaryViewModeBridge | null;
    readonly viewMode?: PlanetaryViewMode;
}): PlanetaryViewModeModel {
    const planetIndex = clampPlanet(input.planetIndex);
    const viewMode: PlanetaryViewMode = input.viewMode === 'psychoid' ? 'psychoid' : 'vibrational';
    const m2 = input.kernelBridge?.m2 ?? null;

    const vibrational = m2 ? safeReadLUT(m2.planetLUT, planetIndex) : null;
    const psychoid = m2 ? safeReadPsychoid(m2.psychoidProjection, planetIndex) : null;

    const chakra = vibrational?.chakra ?? psychoid?.chakra ?? null;
    const chakraGlyph = chakra ? CHAKRA_GLYPHS[chakra] ?? '○' : '○';
    const elementHue = vibrational ? ELEMENT_HUES[vibrational.element] ?? '#9aa6b2' : '#5a6472';

    const psychoidPending =
        viewMode === 'psychoid' && (isOuterPlanetIndex(planetIndex) || (psychoid?.pending ?? false));

    const faceReady = viewMode === 'psychoid' ? psychoid !== null : vibrational !== null;

    return Object.freeze({
        planetIndex,
        viewMode,
        vibrational,
        psychoid,
        chakraGlyph,
        elementHue,
        psychoidPending,
        faceReady
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function PlanetaryViewModeSwitch(props: PlanetaryViewModeSwitchProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildPlanetaryViewModeModel({
                planetIndex: props.planetIndex,
                kernelBridge: props.kernelBridge ?? null,
                viewMode: props.viewMode
            }),
        [props.planetIndex, props.kernelBridge, props.viewMode]
    );

    const className = ['m2-planetary-view-mode-switch', props.className].filter(Boolean).join(' ');
    const provenanceField = model.viewMode === 'psychoid' ? M2_PSYCHOID_PROVENANCE_FIELD : M2_VIBRATIONAL_PROVENANCE_FIELD;

    return (
        <section
            className={className}
            aria-label="Planetary view mode (Vibrational / Psychoid)"
            data-planetary-view-mode-switch
            data-planet-index={model.planetIndex}
            data-planet-view-mode={model.viewMode}
            data-face-state={model.faceReady ? 'ready' : 'bridge-unavailable'}
            data-psychoid-pending={model.psychoidPending ? 'true' : 'false'}
        >
            <header className="m2-planetary-view-mode-switch__header">
                <ViewModeToggle viewMode={model.viewMode} onViewModeChange={props.onViewModeChange} />
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={provenanceField}
                        readiness={props.readiness ?? (model.faceReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(provenanceField)}
                    />
                )}
            </header>

            {model.viewMode === 'psychoid'
                ? renderPsychoidFace(model)
                : renderVibrationalFace(model)}
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ViewModeToggle({
    viewMode,
    onViewModeChange
}: {
    readonly viewMode: PlanetaryViewMode;
    readonly onViewModeChange?: (mode: PlanetaryViewMode) => void;
}): React.ReactElement {
    return (
        <div
            className="m2-planetary-view-mode-switch__toggle"
            role="group"
            aria-label="Planetary view mode (Vibrational / Psychoid)"
            data-planetary-view-toggle
        >
            {PLANETARY_VIEW_MODES.map(mode => (
                <button
                    key={mode}
                    type="button"
                    className="m2-planetary-view-mode-switch__toggle-button"
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

function renderVibrationalFace(model: PlanetaryViewModeModel): React.ReactElement {
    const row = model.vibrational;
    if (!row) {
        return (
            <p className="mext-widget-empty" data-pending-field={VIBRATIONAL_SOURCE}>
                The vibrational reading is waiting for {VIBRATIONAL_SOURCE}.
            </p>
        );
    }
    return (
        <dl className="m2-planetary-view-mode-switch__body" data-vibrational>
            <dt>Planet</dt>
            <dd>{row.name}</dd>
            <dt>Cousto Hz</dt>
            <dd>{row.coustoHz} Hz</dd>
            <dt>Digital root</dt>
            <dd>DR {row.digitalRoot}</dd>
            <dt>Chakra</dt>
            <dd>
                <span className="m2-planetary-view-mode-switch__chakra-glyph" aria-hidden="true">
                    {model.chakraGlyph}
                </span>{' '}
                {row.chakra}
            </dd>
            <dt>Element</dt>
            <dd data-element={row.element}>
                <span
                    className="m2-planetary-view-mode-switch__element-swatch"
                    style={{ background: model.elementHue }}
                    aria-hidden="true"
                />
                {row.element}
            </dd>
            <dt>Keplerian velocity</dt>
            <dd>{row.keplerianVelocity}</dd>
            <dt>Day</dt>
            <dd>{row.day}</dd>
        </dl>
    );
}

function renderPsychoidFace(model: PlanetaryViewModeModel): React.ReactElement {
    if (model.psychoidPending) {
        return <PsychoidPendingPanel model={model} />;
    }
    const psychoid = model.psychoid;
    if (!psychoid) {
        return (
            <p className="mext-widget-empty" data-pending-field={PSYCHOID_SOURCE}>
                The psychoid reading is waiting for {PSYCHOID_SOURCE}.
            </p>
        );
    }
    return (
        <dl className="m2-planetary-view-mode-switch__body" data-psychoid>
            <dt>Planet</dt>
            <dd>{psychoid.planetName}</dd>
            <dt>Chakra</dt>
            <dd>
                <span className="m2-planetary-view-mode-switch__chakra-glyph" aria-hidden="true">
                    {model.chakraGlyph}
                </span>{' '}
                {psychoid.chakra}
            </dd>
            <dt>Archetype</dt>
            <dd>{psychoid.archetype}</dd>
            <dt>Complex</dt>
            <dd>{psychoid.complex}</dd>
            <dt>Shadow face</dt>
            <dd>{psychoid.shadowFace}</dd>
        </dl>
    );
}

function PsychoidPendingPanel({ model }: { readonly model: PlanetaryViewModeModel }): React.ReactElement {
    const planetName = model.psychoid?.planetName ?? model.vibrational?.name ?? `planet-${model.planetIndex}`;
    return (
        <dl className="m2-planetary-view-mode-switch__body" data-psychoid-pending>
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

function safeReadLUT(reader: M2PlanetLUTReader, index: number): M2PlanetLUTRow | null {
    try {
        const row = reader(index);
        if (!row || typeof row.name !== 'string' || typeof row.coustoHz !== 'number') {
            return null;
        }
        return row;
    } catch {
        return null;
    }
}

function safeReadPsychoid(reader: M2PsychoidReader, index: number): M2PsychoidProjection | null {
    try {
        const projection = reader(index);
        if (!projection || typeof projection.planetName !== 'string' || typeof projection.archetype !== 'string') {
            return null;
        }
        return Object.freeze({
            ...projection,
            pending: projection.pending === true
        });
    } catch {
        return null;
    }
}

function clampPlanet(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % 10) + 10) % 10;
}

export default PlanetaryViewModeSwitch;
