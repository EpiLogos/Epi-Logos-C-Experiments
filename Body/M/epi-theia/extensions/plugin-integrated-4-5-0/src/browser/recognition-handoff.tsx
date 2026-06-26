// 36.T36.5 — Integrated 4-5-0 recognition handoff.
//
// Extends the personal composition (personal-recognition-composition.tsx) so the
// Anuttara pentadic runtime trace (Track 36 — `AnuttaraPentadicRuntimeTrace` in
// kernel-bridge/common/types, the same trace the Integrated 1-2-3
// pentadic-trace-overlay projects) flows INTO the personal recognition surface
// as a typed handoff across the three personal legs of the 4-5-0 composition:
//
//   M4 source   : `qComposedHandle` — the protected-local composed-identity
//                 quaternion handle the M4 personal pole hands forward. Raw
//                 quaternion bodies stay behind the ConsentGate; only the handle
//                 crosses the seam.
//   M5 EBM ctx  : the pentadic trace fields become read-only *feature context*
//                 for the Epii energy-based recognition model (the
//                 `epii-ebm-position-5` actor in contemplation-flow-director):
//                 resonance72 / address64 / degree360 / codon / 5° Shem quantum /
//                 evolutionary gap / learned-predictor checkpoint.
//   M0 ground   : the *unified recognition* — the composed handle bound to the
//                 trace's canonical Mahamaya address, displayed in the Anuttara
//                 grounding under-layer as the tat-tvam-asi closure.
//
// PURELY presentational + read-only, matching pentadic-trace-overlay's contract:
// the handoff performs NO renderer-local 72/64 conversion, no quaternion math,
// and never reads a protected body. It projects the already-composed
// `qComposedHandle` and the backend-supplied trace fields, and rejects stale
// trace-generation mismatches. The composition keeps its single
// `useCompositionProfile` subscription — this module receives the already-read
// profile + composed handle and opens no bus of its own.

import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

/** The read-only EBM feature context the M5 recognition leg consumes — the
 *  pentadic trace fields re-projected as the Epii energy-model query features.
 *  Every field is read straight from the `AnuttaraPentadicRuntimeTrace`; the
 *  handoff never derives or converts. `null` means pending / not-yet-supplied. */
export interface PentadicEbmFeatureContext {
    readonly resonance72Index: number | null;
    readonly mahamayaAddress64: number | null;
    readonly degree360: number | null;
    readonly codon: string | null;
    readonly codonId: number | null;
    readonly shemDegreeQuantum: number | null;
    readonly evolutionaryGap: string | null;
    readonly learnedPredictorCheckpointRef: string | null;
    /** The handoff source threaded into the EBM context: M4's composed-quaternion
     *  handle, carried as the energy model's protected query-vector handle. */
    readonly qComposedHandle: string | null;
}

/** The unified recognition the M0 Anuttara grounding under-layer displays — the
 *  composed personal handle bound to the trace's canonical Mahamaya address. */
export interface AnuttaraUnifiedRecognition {
    readonly qComposedHandle: string | null;
    /** A public-safe coordinate phrase built from the trace address fields. */
    readonly canonicalAddress: string | null;
    /** True when the personal handle and a current trace have met — recognition. */
    readonly recognized: boolean;
    /** The tat-tvam-asi grounding phrase, or a pending sentinel. */
    readonly groundingPhrase: string;
}

export interface RecognitionHandoffModel {
    /** The generation the active profile carries (single bus source of truth). */
    readonly profileGeneration: number | null;
    /** The generation the trace projection was stamped at, when supplied. */
    readonly traceGeneration: number | null;
    /** True when a trace exists but its generation lags the live profile. */
    readonly stale: boolean;
    /** True when the trace fields are present, current, and renderable. */
    readonly hasTrace: boolean;
    /** M4 leg — the composed-quaternion handle handed forward. */
    readonly m4ComposedHandle: string | null;
    /** M5 leg — the pentadic trace re-projected as EBM feature context. */
    readonly m5EbmFeatureContext: PentadicEbmFeatureContext | null;
    /** M0 leg — the unified recognition for the grounding under-layer. */
    readonly m0UnifiedRecognition: AnuttaraUnifiedRecognition;
}

/**
 * Build the recognition handoff from the live profile and M4's composed handle.
 *
 * `m4ComposedHandle` is the already-read `qComposedHandle` from the personal
 * handle set (raw quaternion bodies remain forbidden). When the profile carries
 * no composed handle but the trace embeds one (`AnuttaraPentadicRuntimeTrace.
 * qComposedHandle`), the trace value is used as a fallback source.
 */
export function buildRecognitionHandoffModel(
    profile: MathemeHarmonicProfileBoundary | null | undefined,
    m4ComposedHandle: string | null
): RecognitionHandoffModel {
    const profileGeneration = numberValue(profile?.generation);
    const raw = readTraceRecord(profile);
    const composedHandle = m4ComposedHandle ?? stringValue(raw?.qComposedHandle ?? raw?.q_composed_handle);

    if (!raw) {
        return Object.freeze({
            profileGeneration,
            traceGeneration: null,
            stale: false,
            hasTrace: false,
            m4ComposedHandle: composedHandle,
            m5EbmFeatureContext: null,
            m0UnifiedRecognition: unifiedRecognition(composedHandle, null, false)
        });
    }

    const traceGeneration = resolveTraceGeneration(profile, raw, profileGeneration);
    // Reject stale trace-generation mismatches: an embedded stamp that lags the
    // live profile means an upstream edit advanced the bus after this trace was
    // computed. The handoff refuses to feed the EBM facts from a stale frame.
    const stale =
        traceGeneration !== null &&
        profileGeneration !== null &&
        traceGeneration !== profileGeneration;
    const hasTrace = !stale;

    const featureContext = hasTrace ? featureContextFromRecord(raw, composedHandle) : null;
    const canonicalAddress = hasTrace ? canonicalAddressOf(raw) : null;
    const recognized = hasTrace && composedHandle !== null && canonicalAddress !== null;

    return Object.freeze({
        profileGeneration,
        traceGeneration,
        stale,
        hasTrace,
        m4ComposedHandle: composedHandle,
        m5EbmFeatureContext: featureContext,
        m0UnifiedRecognition: unifiedRecognition(composedHandle, canonicalAddress, recognized)
    });
}

// ---------------------------------------------------------------------------
// Presentational legs — mounted inside the existing personal slots
// ---------------------------------------------------------------------------

/**
 * M5 leg — the pentadic trace re-projected as read-only EBM feature context.
 * Mounted inside the Mahamaya recognition (right) slot, it shows the energy
 * model exactly which backend-supplied features it is querying against; it never
 * runs the model or derives a body.
 */
export const M5EbmFeatureContextView: React.FC<{
    readonly context: PentadicEbmFeatureContext | null;
    readonly stale: boolean;
}> = ({ context, stale }) => (
    <section
        className="recognition-handoff-ebm-context"
        data-test="recognition-handoff-ebm-context"
        data-ebm-actor="epii-ebm-position-5"
        data-has-context={context ? 'true' : 'false'}
        data-resonance72={attr(context?.resonance72Index ?? null)}
        data-address64={attr(context?.mahamayaAddress64 ?? null)}
        data-degree360={attr(context?.degree360 ?? null)}
        data-codon={context?.codon ?? 'pending'}
        data-q-composed-handle={context?.qComposedHandle ?? 'pending-q-composed'}
        data-checkpoint-ref={context?.learnedPredictorCheckpointRef ?? 'pending-learned-predictor'}
    >
        <span className="recognition-handoff-ebm-context-label">
            EBM feature context — M5 Epii energy model
        </span>
        {context ? (
            <dl className="recognition-handoff-ebm-context-features">
                <dt>resonance72</dt>
                <dd data-test="ebm-feature-resonance72">{attr(context.resonance72Index)}</dd>
                <dt>address64</dt>
                <dd data-test="ebm-feature-address64">{attr(context.mahamayaAddress64)}</dd>
                <dt>codon</dt>
                <dd data-test="ebm-feature-codon">{context.codon ?? 'pending'}</dd>
                <dt>evolutionary_gap</dt>
                <dd data-test="ebm-feature-gap">{context.evolutionaryGap ?? 'pending'}</dd>
                <dt>q_composed_handle</dt>
                <dd data-test="ebm-feature-q-composed">{context.qComposedHandle ?? 'pending-q-composed'}</dd>
                <dt>learned_predictor</dt>
                <dd data-test="ebm-feature-checkpoint">
                    {context.learnedPredictorCheckpointRef ?? 'pending-learned-predictor'}
                </dd>
            </dl>
        ) : (
            <span
                className="recognition-handoff-pending"
                data-test="recognition-handoff-ebm-pending"
                data-pending-field="profile.anuttaraPentadicTrace"
            >
                {stale
                    ? 'pentadic trace stale — awaiting current generation'
                    : 'awaiting profile.anuttaraPentadicTrace (AnuttaraPentadicRuntimeTrace)'}
            </span>
        )}
    </section>
);

/**
 * M0 leg — the unified recognition for the Anuttara grounding under-layer. The
 * composed personal handle and the trace's canonical Mahamaya address are shown
 * superimposed: when both are present and current, recognition has occurred
 * (tat tvam asi — the personal pole grounded in the prior canonical address).
 */
export const AnuttaraUnifiedRecognitionView: React.FC<{
    readonly recognition: AnuttaraUnifiedRecognition;
}> = ({ recognition }) => (
    <div
        className={`recognition-handoff-grounding${recognition.recognized ? ' recognition-handoff-grounding-recognized' : ''}`}
        data-test="recognition-handoff-grounding"
        data-recognized={recognition.recognized ? 'true' : 'false'}
        data-q-composed-handle={recognition.qComposedHandle ?? 'pending-q-composed'}
        data-canonical-address={recognition.canonicalAddress ?? 'pending-canonical-address'}
    >
        <span className="recognition-handoff-grounding-label">Unified recognition — M0 Anuttara ground</span>
        <span className="recognition-handoff-grounding-handle" data-test="grounding-q-composed">
            {recognition.qComposedHandle ?? 'pending-q-composed'}
        </span>
        <span className="recognition-handoff-grounding-join" aria-hidden="true">⟶</span>
        <span className="recognition-handoff-grounding-address" data-test="grounding-canonical-address">
            {recognition.canonicalAddress ?? 'pending-canonical-address'}
        </span>
        <span className="recognition-handoff-grounding-phrase" data-test="grounding-phrase">
            {recognition.groundingPhrase}
        </span>
    </div>
);

// ---------------------------------------------------------------------------
// Derivation helpers — every value is backend-supplied & public-safe
// ---------------------------------------------------------------------------

function featureContextFromRecord(
    raw: Readonly<Record<string, unknown>>,
    qComposedHandle: string | null
): PentadicEbmFeatureContext {
    return Object.freeze({
        resonance72Index: numberValue(raw.resonance72Index ?? raw.resonance72_index),
        mahamayaAddress64: numberValue(raw.mahamayaAddress64 ?? raw.mahamaya_address64),
        degree360: numberValue(raw.degree360 ?? raw.degree_360),
        codon: stringValue(raw.codon),
        codonId: numberValue(raw.codonId ?? raw.codon_id),
        shemDegreeQuantum: numberValue(raw.shemDegreeQuantum ?? raw.shem_degree_quantum),
        evolutionaryGap: stringValue(raw.evolutionaryGap ?? raw.evolutionary_gap),
        learnedPredictorCheckpointRef: stringValue(
            raw.learnedPredictorCheckpointRef ?? raw.learned_predictor_checkpoint_ref
        ),
        qComposedHandle
    });
}

/** A public-safe canonical-address phrase built from the trace address fields.
 *  Null until at least the Mahamaya address64 is supplied. */
function canonicalAddressOf(raw: Readonly<Record<string, unknown>>): string | null {
    const address64 = numberValue(raw.mahamayaAddress64 ?? raw.mahamaya_address64);
    if (address64 === null) {
        return null;
    }
    const codon = stringValue(raw.codon);
    const degree360 = numberValue(raw.degree360 ?? raw.degree_360);
    const codonPart = codon ? ` · codon ${codon}` : '';
    const degreePart = degree360 === null ? '' : ` · ${degree360}°`;
    return `address64 ${address64}${codonPart}${degreePart}`;
}

function unifiedRecognition(
    qComposedHandle: string | null,
    canonicalAddress: string | null,
    recognized: boolean
): AnuttaraUnifiedRecognition {
    return Object.freeze({
        qComposedHandle,
        canonicalAddress,
        recognized,
        groundingPhrase: recognized
            ? 'tat tvam asi — personal handle grounded in prior canonical address'
            : 'recognition pending — awaiting composed handle + current trace'
    });
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
