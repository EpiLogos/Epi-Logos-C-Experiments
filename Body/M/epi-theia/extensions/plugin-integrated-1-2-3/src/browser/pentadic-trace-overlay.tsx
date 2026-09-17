// 36.T36.4 — Integrated 1-2-3 pentadic trace overlay.
//
// Extends the Track 29 cosmic composition (cosmic-engine-composition.tsx) with a
// read-only overlay of the Anuttara pentadic runtime trace (Track 36 — T36.1,
// `AnuttaraPentadicRuntimeTrace` in kernel-bridge/common/types). The overlay is
// PURELY presentational — it renders backend-provided typed trace fields and
// performs NO renderer-local 72/64 conversion:
//
//   - M1 K2 surface slot   : tick / position6 hinge + 0/1 substrate marker
//   - M2 texture slot       : resonance72 index + 5-degree Shem quantum
//   - M3 lens-ring slot     : Mahamaya address64 + codon cell
//
// The overlay line joins `9_M2 = 8_M3 + 1_M1` to the 0/1->5 hinge rather than
// rendering the Third Spanda spine as an isolated proof label (the matheme-137
// overlay keeps that proof register; here the translation rule terminates on the
// live hinge). The composition continues to use a single profile subscription
// (`useCompositionProfile`); this overlay receives the already-subscribed profile
// and rejects stale trace-generation mismatches rather than opening its own bus.

import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '../../../m-extension-runtime/lib/common/profile';
import type { K2SurfaceHandle } from './cosmic-engine-composition';

/** The `9_M2 = 8_M3 + 1_M1` translation rule, normalised for DOM/test reads.
 *  Mirrors matheme-137-overlay's bridge label; here it terminates on the hinge. */
export const PENTADIC_TRANSLATION_RULE = '9_M2 = 8_M3 + 1_M1';

/**
 * The slot occupants of the pentadic trace overlay, one per integrated
 * contributor. Each slot displays only backend-provided trace addresses.
 */
export type PentadicTraceSlotId = 'surface' | 'texture' | 'cell-state';

/** A read-only view of the live `AnuttaraPentadicRuntimeTrace` fields the
 *  overlay projects. Every field is read straight from the profile payload —
 *  the overlay never derives or converts. `null` means pending/not-yet-supplied. */
export interface PentadicTraceOverlayView {
    // M1 K2 surface
    readonly tick: number | null;
    readonly position6: number | null;
    readonly sourceBinaryState: string | null;
    readonly substrateMarker: string | null;
    // M2 texture
    readonly resonance72Index: number | null;
    readonly shemDegreeQuantum: number | null;
    // M3 lens-ring
    readonly mahamayaAddress64: number | null;
    readonly codon: string | null;
    readonly codonId: number | null;
    // 0/1 -> 5 hinge endpoints
    readonly wholeNumberEndpoint: number | null;
    readonly naturalNumberEndpoint: number | null;
    readonly hinge: string | null;
}

export interface PentadicTraceOverlayModel {
    /** The generation the active profile carries (single bus source of truth). */
    readonly profileGeneration: number | null;
    /** The generation the trace projection was stamped at, when supplied. */
    readonly traceGeneration: number | null;
    /** True when a trace exists but its generation lags the live profile. */
    readonly stale: boolean;
    /** True when the trace fields are present, current, and renderable. */
    readonly hasTrace: boolean;
    readonly trace: PentadicTraceOverlayView | null;
}

export interface PentadicTraceOverlayProps {
    readonly surfaceHandle: K2SurfaceHandle | null;
    readonly profile?: MathemeHarmonicProfileBoundary | null;
}

export function buildPentadicTraceOverlayModel(
    profile: MathemeHarmonicProfileBoundary | null | undefined
): PentadicTraceOverlayModel {
    const profileGeneration = numberValue(profile?.generation);
    const raw = readTraceRecord(profile);
    if (!raw) {
        return Object.freeze({
            profileGeneration,
            traceGeneration: null,
            stale: false,
            hasTrace: false,
            trace: null
        });
    }
    const traceGeneration = resolveTraceGeneration(profile, raw, profileGeneration);
    // Reject stale trace-generation mismatches: an embedded generation stamp that
    // lags the live profile means an upstream edit advanced the bus after this
    // trace was computed. The overlay refuses to render facts from a stale frame.
    const stale =
        traceGeneration !== null &&
        profileGeneration !== null &&
        traceGeneration !== profileGeneration;

    const view = viewFromRecord(raw);
    return Object.freeze({
        profileGeneration,
        traceGeneration,
        stale,
        hasTrace: !stale,
        trace: view
    });
}

export const PentadicTraceOverlay: React.FC<PentadicTraceOverlayProps> = ({
    surfaceHandle,
    profile = null
}) => {
    const model = React.useMemo(() => buildPentadicTraceOverlayModel(profile), [profile]);
    const generationAttr = stalenessGenerationAttr(model);
    const trace = model.hasTrace ? model.trace : null;
    return (
        <aside
            className="pentadic-trace-overlay"
            data-test="pentadic-trace-overlay"
            data-surface-handle={surfaceHandle?.handle ?? 'pending-k2-surface'}
            data-renderer-directive={surfaceHandle?.renderer ?? 'played-torus'}
            data-profile-generation={attr(model.profileGeneration)}
            data-trace-generation={generationAttr}
            data-trace-stale={model.stale ? 'true' : 'false'}
            data-has-trace={model.hasTrace ? 'true' : 'false'}
        >
            {/* M1 K2 surface slot — tick / position6 hinge + 0/1 substrate marker. */}
            <PentadicTraceSlotFrame
                slot="surface"
                occupant="m1-paramasiva-played-torus"
                label="M1 K2 surface — tick / position6 hinge"
                pendingField="profile.anuttara_pentadic_trace.tick"
                pending={!trace}
                generationAttr={generationAttr}
            >
                {trace ? (
                    <section
                        className="pentadic-trace-facts pentadic-trace-facts-surface"
                        data-tick={attr(trace.tick)}
                        data-position6={attr(trace.position6)}
                        data-source-binary-state={trace.sourceBinaryState ?? 'pending'}
                        data-substrate-marker={trace.substrateMarker ?? 'pending'}
                    >
                        <span data-test="pentadic-fact-tick">tick {attr(trace.tick)}</span>
                        <span data-test="pentadic-fact-position6">position6 {attr(trace.position6)}</span>
                        <span data-test="pentadic-fact-substrate-marker">
                            {trace.substrateMarker ?? '0/1 substrate pending'}
                        </span>
                    </section>
                ) : null}
            </PentadicTraceSlotFrame>

            {/* M2 texture slot — resonance72 index + 5-degree Shem quantum. */}
            <PentadicTraceSlotFrame
                slot="texture"
                occupant="m2-parashakti"
                label="M2 texture — resonance72 / 5° Shem quantum"
                pendingField="profile.anuttara_pentadic_trace.resonance72Index"
                pending={!trace}
                generationAttr={generationAttr}
            >
                {trace ? (
                    <section
                        className="pentadic-trace-facts pentadic-trace-facts-texture"
                        data-resonance72={attr(trace.resonance72Index)}
                        data-shem-degree-quantum={attr(trace.shemDegreeQuantum)}
                    >
                        <span data-test="pentadic-fact-resonance72">
                            resonance72 {attr(trace.resonance72Index)}
                        </span>
                        <span data-test="pentadic-fact-shem-degree-quantum">
                            {trace.shemDegreeQuantum === null
                                ? '5° Shem quantum pending'
                                : `${trace.shemDegreeQuantum}° Shem quantum`}
                        </span>
                    </section>
                ) : null}
            </PentadicTraceSlotFrame>

            {/* M3 lens-ring slot — Mahamaya address64 + codon cell. */}
            <PentadicTraceSlotFrame
                slot="cell-state"
                occupant="m3-mahamaya"
                label="M3 lens-ring — Mahamaya address64 / codon cell"
                pendingField="profile.anuttara_pentadic_trace.mahamayaAddress64"
                pending={!trace}
                generationAttr={generationAttr}
            >
                {trace ? (
                    <section
                        className="pentadic-trace-facts pentadic-trace-facts-cell-state"
                        data-address64={attr(trace.mahamayaAddress64)}
                        data-codon={trace.codon ?? 'pending'}
                        data-codon-id={attr(trace.codonId)}
                    >
                        <span data-test="pentadic-fact-address64">
                            address64 {attr(trace.mahamayaAddress64)}
                        </span>
                        <span
                            className="pentadic-codon-cell"
                            data-test="pentadic-fact-codon"
                            data-codon-cell={trace.codon ?? 'pending'}
                        >
                            {trace.codon ? `codon ${trace.codon}` : 'codon cell pending'}
                        </span>
                    </section>
                ) : null}
            </PentadicTraceSlotFrame>

            <PentadicTranslationBridge trace={trace} stale={model.stale} />
        </aside>
    );
};

/**
 * The translation-rule bridge. `9_M2 = 8_M3 + 1_M1` is rendered as a join from
 * the M2/M3 surplus to the M1 parent unit and ON to the live 0/1->5 hinge — the
 * rule terminates on the runtime hinge, it is not an isolated proof label.
 */
const PentadicTranslationBridge: React.FC<{
    readonly trace: PentadicTraceOverlayView | null;
    readonly stale: boolean;
}> = ({ trace, stale }) => {
    const hinge = trace?.hinge ?? null;
    return (
        <div
            className="pentadic-trace-bridge"
            data-test="pentadic-trace-bridge"
            data-translation-rule={PENTADIC_TRANSLATION_RULE}
            data-hinge={hinge ?? (stale ? 'stale-generation' : 'pending-0-1-to-5-hinge')}
        >
            <span className="pentadic-trace-bridge-rule" data-test="pentadic-translation-rule">
                {PENTADIC_TRANSLATION_RULE}
            </span>
            <span className="pentadic-trace-bridge-join" aria-hidden="true">
                ⟶
            </span>
            <span className="pentadic-trace-bridge-hinge" data-test="pentadic-trace-hinge">
                {hinge ?? (stale ? 'trace stale — awaiting current generation' : '0/1 → 5 hinge pending')}
            </span>
        </div>
    );
};

/**
 * A slot frame for one integrated contributor (M1 surface / M2 texture /
 * M3 lens-ring). Carries the shared slot scaffolding — occupant id, the
 * profile-driven trace generation (so a test can assert M1/M2/M3 slots all
 * report the same generation), and the pending fallback — while each caller
 * supplies its own statically-typed `data-*` fact section as children.
 */
const PentadicTraceSlotFrame: React.FC<{
    readonly slot: PentadicTraceSlotId;
    readonly occupant: string;
    readonly label: string;
    readonly pendingField: string;
    readonly pending: boolean;
    readonly generationAttr: string;
    readonly children?: React.ReactNode;
}> = ({ slot, occupant, label, pendingField, pending, generationAttr, children }) => (
    <section
        className={`pentadic-trace-slot pentadic-trace-slot-${slot}`}
        data-test="pentadic-trace-slot"
        data-geometric-slot={slot}
        data-slot-occupant={occupant}
        data-trace-generation={generationAttr}
    >
        <span className="pentadic-trace-slot-label">{label}</span>
        {pending ? (
            <span
                className="pentadic-trace-pending"
                data-test="pentadic-trace-pending"
                data-pending-field={pendingField}
            >
                awaiting {pendingField}
            </span>
        ) : (
            children
        )}
    </section>
);

function viewFromRecord(raw: Readonly<Record<string, unknown>>): PentadicTraceOverlayView {
    const sourceBinaryState = stringValue(raw.sourceBinaryState ?? raw.source_binary_state);
    const wholeNumberEndpoint = numberValue(raw.wholeNumberEndpoint ?? raw.whole_number_endpoint);
    const naturalNumberEndpoint = numberValue(raw.naturalNumberEndpoint ?? raw.natural_number_endpoint);
    const substrateMarker = substrateMarkerValue(
        stringValue(raw.substrateHinge ?? raw.substrate_hinge),
        sourceBinaryState
    );
    return Object.freeze({
        tick: numberValue(raw.tick),
        position6: numberValue(raw.position6),
        sourceBinaryState,
        substrateMarker,
        resonance72Index: numberValue(raw.resonance72Index ?? raw.resonance72_index),
        shemDegreeQuantum: numberValue(raw.shemDegreeQuantum ?? raw.shem_degree_quantum),
        mahamayaAddress64: numberValue(raw.mahamayaAddress64 ?? raw.mahamaya_address64),
        codon: stringValue(raw.codon),
        codonId: numberValue(raw.codonId ?? raw.codon_id),
        wholeNumberEndpoint,
        naturalNumberEndpoint,
        hinge: hingeValue(sourceBinaryState, wholeNumberEndpoint, naturalNumberEndpoint)
    });
}

/** The 0/1 substrate marker — the binary state phrased as a substrate badge. */
function substrateMarkerValue(explicit: string | null, sourceBinaryState: string | null): string | null {
    if (explicit) {
        return explicit;
    }
    if (sourceBinaryState) {
        return `0/1 substrate ${sourceBinaryState}`;
    }
    return null;
}

/** The 0/1 -> 5 hinge: the binary source folded onto its whole/natural endpoints. */
function hingeValue(
    sourceBinaryState: string | null,
    wholeNumberEndpoint: number | null,
    naturalNumberEndpoint: number | null
): string | null {
    if (!sourceBinaryState || wholeNumberEndpoint === null) {
        return null;
    }
    const natural = naturalNumberEndpoint === null ? '' : ` (natural ${naturalNumberEndpoint})`;
    return `${sourceBinaryState} → ${wholeNumberEndpoint}${natural}`;
}

function readTraceRecord(
    profile: MathemeHarmonicProfileBoundary | null | undefined
): Readonly<Record<string, unknown>> | null {
    return objectValue(
        profile?.payload['anuttaraPentadicTrace'] ??
        profile?.payload['anuttara_pentadic_trace']
    );
}

function resolveTraceGeneration(
    profile: MathemeHarmonicProfileBoundary | null | undefined,
    raw: Readonly<Record<string, unknown>>,
    profileGeneration: number | null
): number | null {
    const embedded = numberValue(
        raw.generation ??
        raw.profileGeneration ??
        raw.profile_generation ??
        profile?.payload['anuttaraPentadicTraceGeneration'] ??
        profile?.payload['anuttara_pentadic_trace_generation']
    );
    // No embedded stamp → the trace rides the live profile generation by contract.
    return embedded ?? profileGeneration;
}

function stalenessGenerationAttr(model: PentadicTraceOverlayModel): string {
    if (model.stale) {
        return 'stale';
    }
    return attr(model.traceGeneration);
}

function attr(value: number | null): string {
    return value === null ? 'pending' : String(value);
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
