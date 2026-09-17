// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 (Parashakti vibrational address, 0..71) traversed as the
//                   full M2 correspondence path — hexagram → half-decan → decan →
//                   planet → chakra → body-zone. The 72-fold bridge inspector.
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#7):  23.7 — 72-fold bridge inspector: the six-step M2 path rendered
//                   as a left-to-right glyph breadcrumb. WIDGET-INTERNAL per CCT-11
//                   (not the editor-area-top coordinate breadcrumb owned by
//                   m-extension-runtime); dispatches `m2-parashakti.breadcrumb.address72`.
//   Actualises:     ONE live traversal of the active vibrational address through its
//                   six correspondence steps, reading ONLY the typed projection
//                   published by the kernel-bridge. Each step renders its glyph, its
//                   substrate citation, an inline ProvenanceBadge, and a Cl(4,2)
//                   signature colour-binary tint (cool −1 / warm +1).
//   Public surface: SeventyTwoFoldBreadcrumb, buildSeventyTwoFoldBreadcrumbModel, the
//                   M2BreadcrumbBridge / M2SeventyTwoFoldProjector /
//                   M2SeventyTwoFoldBreadcrumbProjection / M2BreadcrumbStepProjection
//                   typed contract, the BreadcrumbStep / SeventyTwoFoldBreadcrumbModel
//                   view model, and the step vocabulary (BREADCRUMB_STEPS,
//                   BREADCRUMB_STEP_KEYS, SIGNATURE_TINT).
//   Does NOT own:   the path law. The hexagram source (`profile.resonance72`), the
//                   72-fold half-decan view, the S2 decan-face authority, the M2-5
//                   planetary-chakral frame (`M2_PLANET_LUT` → chakra), and the S3
//                   kerykeion body-zone all live kernel-/substrate-side and are
//                   surfaced through the bridge. This inspector NEVER recomputes a
//                   step; it folds the published projection into the breadcrumb and
//                   only tints each step by its published (or position-derived) Cl(4,2)
//                   signature polarity.
//   Cross-links:    EpogdoonBridgeEngine (the 72→64 codon descent the hexagram step
//                   keys off), PlanetaryElementalFeed + M2-PlanetaryChakralCard (the
//                   planet/chakra/body-zone tail), CorrespondenceTreeWidget (the
//                   decan-face / Shem leaf-space), Track 30 design language
//                   (Cl(4,2) signature → cool/warm colour-binary).
//   Contract:       kernelBridge.m2.breadcrumbProjection(address72) →
//                   { address72, hexagram, halfDecan, decan, planet, chakra, bodyZone }
//                   where each step is { glyph?, label?, coordinate?, signature? }.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import {
    M2_BREADCRUMB_PROVENANCE_FIELDS,
    ProvenanceBadge,
    type ProvenanceReadinessVariant
} from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every M2 vibrational address resolves here. */
export const SEVENTY_TWO_FOLD_ADDRESS_COUNT = 72;

/** The six correspondence steps the path always traverses, left → right. */
export const BREADCRUMB_STEP_COUNT = 6;

/** The single authority this inspector reads through — never a local computation. */
export const SEVENTY_TWO_FOLD_PROJECTION_SOURCE =
    'kernelBridge.m2.breadcrumbProjection(address72)' as const;

// ── Cl(4,2) signature colour-binary tint (Track 30 / 15.8) ───────────────────

/** A Cl(4,2) signature polarity — −1 (cool, sin/cos endpoints) or +1 (warm). */
export type SignaturePolarity = -1 | 1;

/**
 * The Cl(4,2) signature colour-binary axis (per `M1-2-ANANDA-VORTEX-ARCHITECTURE.md`
 * §5 / Track 30.2 `epilogos.colour.signature.{cool,warm}`). Signature −1
 * (sin/cos — the K² endpoints 0/5) tints cool-indigo; signature +1 (tan/sec/cot/csc
 * — the interior 1..4) tints warm-amber. Light/dark preserve polarity (cool stays
 * cool, warm stays warm across inversion). The inspector NEVER mints a hue; it reads
 * the published per-step signature and binds it to these canonical tokens.
 */
export const SIGNATURE_TINT: Readonly<Record<'cool' | 'warm', { readonly light: string; readonly dark: string }>> =
    Object.freeze({
        cool: Object.freeze({ light: '#5a73a8', dark: '#8a9bbd' }),
        warm: Object.freeze({ light: '#d4a14a', dark: '#e0b366' })
    });

// ── Step vocabulary (the six fixed correspondence steps) ─────────────────────

/** Canonical key for each of the six path steps. */
export type BreadcrumbStepKey = 'hexagram' | 'half-decan' | 'decan' | 'planet' | 'chakra' | 'body-zone';

/** Canonical step order (left → right along the breadcrumb). */
export const BREADCRUMB_STEP_KEYS: readonly BreadcrumbStepKey[] = Object.freeze([
    'hexagram',
    'half-decan',
    'decan',
    'planet',
    'chakra',
    'body-zone'
]);

/** A static descriptor for one of the six steps — label, fallback glyph, substrate citation. */
export interface BreadcrumbStepDescriptor {
    readonly key: BreadcrumbStepKey;
    /** Projection field this step reads from the bridge projection. */
    readonly field: 'hexagram' | 'halfDecan' | 'decan' | 'planet' | 'chakra' | 'bodyZone';
    /** Human caption for the step chip. */
    readonly label: string;
    /** Glyph shown when the projection carries no glyph of its own. */
    readonly fallbackGlyph: string;
    /** Where the step's payload originates — the substrate citation rendered inline. */
    readonly substrate: string;
    /** The provenance source-field (from `M2_BREADCRUMB_PROVENANCE_FIELDS`). */
    readonly provenanceField: string;
}

/**
 * The six steps, fixed-ordered. Each `provenanceField` is paired positionally with
 * `M2_BREADCRUMB_PROVENANCE_FIELDS` (declared in ProvenanceBadge) — the canonical
 * hexagram → half-decan → decan → planet → chakra → body-zone provenance ledger.
 */
export const BREADCRUMB_STEPS: readonly BreadcrumbStepDescriptor[] = Object.freeze([
    Object.freeze({
        key: 'hexagram',
        field: 'hexagram',
        label: 'hexagram',
        fallbackGlyph: '䷀',
        substrate: 'profile.resonance72 → M3 64-hexagram space (72 = 64 × 9/8 epogdoon)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[0] ?? 'profile.resonance72'
    }),
    Object.freeze({
        key: 'half-decan',
        field: 'halfDecan',
        label: 'half-decan',
        fallbackGlyph: '◐',
        substrate: 'addressViews.halfDecan → 72-fold address view (36 decans × 2 strands)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[1] ?? 'addressViews.halfDecan'
    }),
    Object.freeze({
        key: 'decan',
        field: 'decan',
        label: 'decan',
        fallbackGlyph: '⬡',
        substrate: 's2.decanFace → S2 decan-face authority (36 decans, light/shadow)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[2] ?? 's2.decanFace'
    }),
    Object.freeze({
        key: 'planet',
        field: 'planet',
        label: 'planet',
        fallbackGlyph: '☉',
        substrate: 'planetaryChakralFrame.rulingPlanet → m2.h M2_PLANET_LUT (Cousto octave)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[3] ?? 'planetaryChakralFrame.rulingPlanet'
    }),
    Object.freeze({
        key: 'chakra',
        field: 'chakra',
        label: 'chakra',
        fallbackGlyph: '◉',
        substrate: 'planetaryChakralFrame.chakra → ELEM_SIG → chakra centre (8-fold)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[4] ?? 'planetaryChakralFrame.chakra'
    }),
    Object.freeze({
        key: 'body-zone',
        field: 'bodyZone',
        label: 'body-zone',
        fallbackGlyph: '⚕',
        substrate: 's3.kerykeion.body-zone → CHAKRA_BODY_ZONES[8] (live transit zone)',
        provenanceField: M2_BREADCRUMB_PROVENANCE_FIELDS[5] ?? 's3.kerykeion.body-zone'
    })
]);

// ── Bridge contract (the ONLY typed projection this inspector consumes) ──────

/**
 * One step of the published path projection. Every field is optional and read
 * defensively — a partial bridge response renders an honest-pending chip rather
 * than fabricating a glyph. `signature` carries the Cl(4,2) polarity (−1 / +1); when
 * absent the model derives it structurally from the step's position parity.
 */
export interface M2BreadcrumbStepProjection {
    /** Display glyph for the step (hexagram char, planet sigil, chakra mark, …). */
    readonly glyph?: string;
    /** Short label folded into the chip caption. */
    readonly label?: string;
    /** Optional coordinate/index published for the step (e.g. decan number, codon). */
    readonly coordinate?: string;
    /** Cl(4,2) signature polarity for the step (−1 cool / +1 warm). */
    readonly signature?: number;
    readonly [key: string]: unknown;
}

/**
 * The typed projection returned by `kernelBridge.m2.breadcrumbProjection(address72)`.
 * Mirrors the M2 correspondence path — one optional step descriptor per the six
 * fixed steps. The inspector reads only these fields, defensively.
 */
export interface M2SeventyTwoFoldBreadcrumbProjection {
    readonly address72: number;
    readonly hexagram?: M2BreadcrumbStepProjection;
    readonly halfDecan?: M2BreadcrumbStepProjection;
    readonly decan?: M2BreadcrumbStepProjection;
    readonly planet?: M2BreadcrumbStepProjection;
    readonly chakra?: M2BreadcrumbStepProjection;
    readonly bodyZone?: M2BreadcrumbStepProjection;
}

/** A function projecting a 72-address into the typed breadcrumb projection. */
export type M2SeventyTwoFoldProjector = (
    address72: number
) => M2SeventyTwoFoldBreadcrumbProjection | null | undefined;

/** The slice of the kernel-bridge this inspector depends on. */
export interface M2BreadcrumbBridge {
    readonly m2: {
        readonly breadcrumbProjection: M2SeventyTwoFoldProjector;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** One resolved step of the breadcrumb path. */
export interface BreadcrumbStep {
    readonly key: BreadcrumbStepKey;
    /** Caption for the step chip. */
    readonly label: string;
    /** Glyph folded from the projection (or the descriptor fallback). */
    readonly glyph: string;
    /** Coordinate/index published for the step, if any. */
    readonly coordinate: string | null;
    /** The substrate citation rendered inline beneath the glyph. */
    readonly substrate: string;
    /** The provenance source-field for the inline badge. */
    readonly provenanceField: string;
    /** Cl(4,2) signature polarity (−1 cool / +1 warm) — published or position-derived. */
    readonly signature: SignaturePolarity;
    /** Cool/warm class for the colour-binary tint. */
    readonly tint: 'cool' | 'warm';
    /** Light/dark tint hexes for the step glyph. */
    readonly tintColours: { readonly light: string; readonly dark: string };
    /** True when the bridge returned a well-formed payload for this step. */
    readonly decoded: boolean;
}

export interface SeventyTwoFoldBreadcrumbModel {
    /** The live vibrational address this path traverses. */
    readonly address72: number;
    /** All six steps, fixed-ordered. */
    readonly steps: readonly BreadcrumbStep[];
    /** Number of steps the bridge actually resolved (0..6). */
    readonly decodedStepCount: number;
    /** True once every step resolved — the full path is live. */
    readonly pathComplete: boolean;
    /** True once at least one step resolved through the bridge. */
    readonly bridgeReady: boolean;
    /** The profile-tick that produced this traversal, if known. */
    readonly tick: number | null;
}

export interface SeventyTwoFoldBreadcrumbProps {
    /** The kernel-bridge slice. When absent the inspector renders a bridge-down state. */
    readonly kernelBridge?: M2BreadcrumbBridge | null;
    /** The live M2 address being inspected (from the profile bus). */
    readonly activeAddress72?: number | null;
    /** Live profile-tick driving the address (falls back to deriving it). */
    readonly tick?: number | null;
    /** Notified when the user clicks a step chip (dispatches the breadcrumb intent — 23.7). */
    readonly onStepSelect?: (key: BreadcrumbStepKey, address72: number) => void;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildSeventyTwoFoldBreadcrumbModel(input: {
    readonly kernelBridge?: M2BreadcrumbBridge | null;
    readonly activeAddress72?: number | null;
    readonly tick?: number | null;
}): SeventyTwoFoldBreadcrumbModel {
    const tick = normalizeTick(input.tick);
    const address72 = resolveActiveAddress(input.activeAddress72, tick);
    const projector = input.kernelBridge?.m2?.breadcrumbProjection ?? null;
    const projection = projector ? safeProject(projector, address72) : null;

    const steps: BreadcrumbStep[] = BREADCRUMB_STEPS.map((descriptor, index) => {
        const stepProjection = stepProjectionFor(projection, descriptor.field);
        const decoded = stepProjection !== null;
        const signature = resolveSignature(stepProjection?.signature, index);
        const tint = signature < 0 ? 'cool' : 'warm';
        return Object.freeze({
            key: descriptor.key,
            label: stringField(stepProjection?.label) ?? descriptor.label,
            glyph: stringField(stepProjection?.glyph) ?? descriptor.fallbackGlyph,
            coordinate: stringField(stepProjection?.coordinate),
            substrate: descriptor.substrate,
            provenanceField: descriptor.provenanceField,
            signature,
            tint,
            tintColours: SIGNATURE_TINT[tint],
            decoded
        });
    });

    const decodedStepCount = steps.filter(step => step.decoded).length;

    return Object.freeze({
        address72,
        steps: Object.freeze(steps),
        decodedStepCount,
        pathComplete: decodedStepCount === BREADCRUMB_STEP_COUNT,
        bridgeReady: decodedStepCount > 0,
        tick
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function SeventyTwoFoldBreadcrumb(props: SeventyTwoFoldBreadcrumbProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildSeventyTwoFoldBreadcrumbModel({
                kernelBridge: props.kernelBridge ?? null,
                activeAddress72: props.activeAddress72 ?? null,
                tick: props.tick ?? null
            }),
        [props.kernelBridge, props.activeAddress72, props.tick]
    );

    const onStepSelect = props.onStepSelect;
    const handleSelect = React.useCallback(
        (key: BreadcrumbStepKey) => {
            onStepSelect?.(key, model.address72);
        },
        [onStepSelect, model.address72]
    );

    const className = ['m2-seventy-two-fold-breadcrumb', props.className].filter(Boolean).join(' ');

    if (!model.bridgeReady) {
        return (
            <nav
                className={className}
                aria-label="M2 72-fold correspondence path"
                data-seventy-two-fold-breadcrumb
                data-breadcrumb-state="bridge-unavailable"
                data-active-address72={model.address72}
            >
                <p className="mext-widget-empty" data-pending-field={SEVENTY_TWO_FOLD_PROJECTION_SOURCE}>
                    The 72-fold correspondence path is waiting for {SEVENTY_TWO_FOLD_PROJECTION_SOURCE}.
                </p>
            </nav>
        );
    }

    return (
        <nav
            className={className}
            aria-label={`M2 72-fold correspondence path for address ${model.address72}`}
            data-seventy-two-fold-breadcrumb
            data-breadcrumb-state={model.pathComplete ? 'ready' : 'partial'}
            data-active-address72={model.address72}
            data-active-tick={model.tick ?? ''}
            data-decoded-step-count={model.decodedStepCount}
        >
            <header className="m2-seventy-two-fold-breadcrumb__header">
                <h4>72-fold bridge — #2·{model.address72}</h4>
                <span className="m2-seventy-two-fold-breadcrumb__path-tally" data-decoded-step-count={model.decodedStepCount}>
                    {model.decodedStepCount} / {BREADCRUMB_STEP_COUNT} steps
                </span>
            </header>

            <ol className="m2-seventy-two-fold-breadcrumb__path" data-breadcrumb-path>
                {model.steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                        {index > 0 && (
                            <li className="m2-seventy-two-fold-breadcrumb__separator" aria-hidden="true" data-breadcrumb-separator>
                                →
                            </li>
                        )}
                        <BreadcrumbStepView
                            step={step}
                            packet={props.packet ?? null}
                            readiness={props.readiness}
                            bridgeReady={model.bridgeReady}
                            onSelect={handleSelect}
                        />
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function BreadcrumbStepView({
    step,
    packet,
    readiness,
    bridgeReady,
    onSelect
}: {
    readonly step: BreadcrumbStep;
    readonly packet: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness: SeventyTwoFoldBreadcrumbProps['readiness'];
    readonly bridgeReady: boolean;
    readonly onSelect: (key: BreadcrumbStepKey) => void;
}): React.ReactElement {
    // Bind the Cl(4,2) tint as a custom property so light/dark themes resolve the
    // polarity-preserving hue without the chip re-minting a colour.
    const tintStyle = {
        '--m2-signature-tint': step.tintColours.light,
        '--m2-signature-tint-dark': step.tintColours.dark,
        color: step.tintColours.light
    } as React.CSSProperties;

    return (
        <li
            className="m2-seventy-two-fold-breadcrumb__step"
            data-breadcrumb-step
            data-step-key={step.key}
            data-decoded={step.decoded ? 'true' : 'false'}
            data-signature={step.signature}
            data-signature-tint={step.tint}
        >
            <button
                type="button"
                className="m2-seventy-two-fold-breadcrumb__step-button"
                aria-label={
                    step.decoded
                        ? `${step.label}: ${step.coordinate ?? step.glyph} (${step.tint} signature)`
                        : `${step.label} (pending)`
                }
                data-step-key={step.key}
                style={tintStyle}
                onClick={() => onSelect(step.key)}
            >
                <span
                    className="m2-seventy-two-fold-breadcrumb__step-glyph"
                    data-step-glyph
                    aria-hidden="true"
                    style={{ color: step.tintColours.light }}
                >
                    {step.decoded ? step.glyph : '—'}
                </span>
                <span className="m2-seventy-two-fold-breadcrumb__step-label">{step.label}</span>
                {step.coordinate && (
                    <span className="m2-seventy-two-fold-breadcrumb__step-coordinate" data-step-coordinate>
                        {step.coordinate}
                    </span>
                )}
                <span className="m2-seventy-two-fold-breadcrumb__step-substrate" data-step-substrate title={step.substrate}>
                    {step.substrate}
                </span>
            </button>
            {packet && (
                <ProvenanceBadge
                    compact
                    field={step.provenanceField}
                    readiness={readiness ?? (step.decoded ? 'ready_public_current' : bridgeReady ? 's2_graph_blocked' : 'bridge_unavailable')}
                    provenance={packet.meaningPacketProvenanceFor(step.provenanceField)}
                />
            )}
        </li>
    );
}

// ── Normalisers (bounds + parity only; no path arithmetic) ───────────────────

function safeProject(
    projector: M2SeventyTwoFoldProjector,
    address72: number
): M2SeventyTwoFoldBreadcrumbProjection | null {
    try {
        const projection = projector(address72);
        if (!projection || typeof projection !== 'object') {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function stepProjectionFor(
    projection: M2SeventyTwoFoldBreadcrumbProjection | null,
    field: BreadcrumbStepDescriptor['field']
): M2BreadcrumbStepProjection | null {
    if (!projection) {
        return null;
    }
    const value = projection[field];
    return value && typeof value === 'object' ? (value as M2BreadcrumbStepProjection) : null;
}

/**
 * Resolve the Cl(4,2) signature polarity for a step. Prefers the published value;
 * falls back to the structural derivation — the K² six-position cycle places the
 * sin/cos endpoints (0/5) at signature −1 (cool) and the interior 1..4 at +1 (warm).
 */
function resolveSignature(published: number | undefined, index: number): SignaturePolarity {
    if (typeof published === 'number' && Number.isFinite(published)) {
        return published < 0 ? -1 : 1;
    }
    return index === 0 || index === BREADCRUMB_STEP_COUNT - 1 ? -1 : 1;
}

function resolveActiveAddress(activeAddress72: number | null | undefined, tick: number | null): number {
    if (typeof activeAddress72 === 'number' && Number.isFinite(activeAddress72)) {
        return clampAddress72(activeAddress72);
    }
    if (tick !== null) {
        return clampAddress72(tick);
    }
    return 0;
}

function normalizeTick(tick: number | null | undefined): number | null {
    return typeof tick === 'number' && Number.isFinite(tick) ? Math.trunc(tick) : null;
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % SEVENTY_TWO_FOLD_ADDRESS_COUNT) + SEVENTY_TWO_FOLD_ADDRESS_COUNT) % SEVENTY_TWO_FOLD_ADDRESS_COUNT;
}

function stringField(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

export default SeventyTwoFoldBreadcrumb;
