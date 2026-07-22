/**
 * Coordinate: M' integrated pentadic-trace overlay envelope (29.T29.15)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): the typed AnuttaraPentadicRuntimeTrace binding shared by the
 *   cosmic 1-2-3 and personal 4-5-0 compositions.
 * Actualises: ONE typed envelope binding the kernel pentadic trace + its
 *   generation (the trace tick) + the composition-level readiness aggregate +
 *   the fixed cosmic/personal slot labels. The `composition.pentadic_trace.advance`
 *   emit and the readiness both derive from THIS envelope — never a parallel
 *   hardcode. The trace is the kernel's verbatim `profile.anuttaraPentadicTrace`
 *   field (kernel producer `Body/S/S0/portal-core/src/kernel/profile.rs`,
 *   live-wire-validated at `scripts/live-wire.mjs`); the renderer computes no
 *   trace steps and no 72->64 conversion.
 * Public surface: IntegratedPentadicTraceOverlay, buildIntegratedPentadicTraceOverlay,
 *   INTEGRATED_PENTADIC_COSMIC_SLOTS, INTEGRATED_PENTADIC_PERSONAL_SLOTS.
 * Does NOT own: trace genesis (portal-core), the strip DOM (CosmicEngine /
 *   PersonalRecognitionEngine), the readiness taxonomy (integratedReadiness),
 *   the event ring (compositionEvents).
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.15.
 */

import type { AnuttaraPentadicRuntimeTrace } from '../bridge/types';
import { pentadicTraceFromPayload } from '../panes/m3PentadicInspector';
import {
    aggregatePentadicTraceReadiness,
    type IntegratedReadinessAggregate
} from '../engine/integratedReadiness';

/** LAW: the cosmic 1-2-3 slot labels the trace lands on (spec §29.15). */
export const INTEGRATED_PENTADIC_COSMIC_SLOTS = Object.freeze({
    tickSurface: 'm1-paramasiva-played-torus',
    frequencyTexture: 'm2-parashakti',
    codonCellState: 'm3-mahamaya'
} as const);

/** LAW: the personal 4-5-0 slot labels the trace handles feed (spec §29.15). */
export const INTEGRATED_PENTADIC_PERSONAL_SLOTS = Object.freeze({
    grounding: 'm0-anuttara',
    qHandleConsumer: 'm4-nara',
    recognitionConsumer: 'm5-epii'
} as const);

/**
 * The typed pentadic-trace overlay envelope shared across both compositions.
 * `generation` is the kernel trace tick (`trace.tick`) — the SAME marker the
 * stale-trace-generation guard rejects on — so the advance event and the
 * readiness aggregate read one generation, never two.
 */
export interface IntegratedPentadicTraceOverlay {
    readonly trace: AnuttaraPentadicRuntimeTrace;
    readonly generation: number;
    readonly readiness: IntegratedReadinessAggregate;
    readonly cosmicSlots: typeof INTEGRATED_PENTADIC_COSMIC_SLOTS;
    readonly personalSlots: typeof INTEGRATED_PENTADIC_PERSONAL_SLOTS;
}

/**
 * Build the envelope from ONE cached profile payload (the single subscription
 * both compositions already share). Returns `null` when the trace is absent —
 * the envelope never fabricates a trace or a generation; a `null` return is the
 * honest "pending-anuttara-pentadic-trace" state the callers already handle.
 */
export function buildIntegratedPentadicTraceOverlay(
    payload: Readonly<Record<string, unknown>> | null
): IntegratedPentadicTraceOverlay | null {
    if (payload === null) {
        return null;
    }
    const trace = pentadicTraceFromPayload(payload);
    if (!trace) {
        return null;
    }
    // Both slots read the SAME cached profile in the running app; passing the
    // payload for each honours the "across BOTH slots" contract without
    // inventing a second transport.
    const readiness = aggregatePentadicTraceReadiness(payload, payload);
    return Object.freeze({
        trace,
        generation: trace.tick,
        readiness,
        cosmicSlots: INTEGRATED_PENTADIC_COSMIC_SLOTS,
        personalSlots: INTEGRATED_PENTADIC_PERSONAL_SLOTS
    });
}
