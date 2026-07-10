/**
 * Coordinate: M' M1'+M2'+M3' (integrated 1-2-3 pentadic overlay — Tranche 36.T36.4)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: the pentadic-trace overlay on the cosmic 1-2-3 composition —
 *   the M1 K² hinge (tick/position6 + 0/1 substrate marker), the M2 texture
 *   readout (resonance72 index + 5° Shem quantum), the M3 lens-ring readout
 *   (Mahāmāyā address64 + codon cell), and the join line binding the
 *   translation rule `9_M2 = 8_M3 + 1_M1` to the live 0/1→5 hinge (never an
 *   isolated proof label). Read-only, profile-tick driven, ONE profile
 *   subscription (the engine's existing cached profile feeds this pure
 *   builder); a trace whose tick disagrees with the profile's tick is
 *   REJECTED as stale — and every displayed value is the kernel's verbatim
 *   write (no renderer-local 72→64 conversion; the strict trace reader is
 *   shared with the pentadic inspector — one parser, no fork).
 * Does NOT own: trace genesis (portal-core), the strip DOM (CosmicEngine),
 *   the inspector panel (m3PentadicInspector).
 */

import { pentadicTraceFromPayload } from '../panes/m3PentadicInspector';

export type PentadicOverlayState =
    | 'ready'
    | 'pending-anuttara-pentadic-trace'
    | 'stale-trace-generation';

export interface PentadicOverlayModel {
    readonly state: PentadicOverlayState;
    /** M1 K² slot: the hinge + the 0/1 substrate marker. */
    readonly m1: { tick12: number; position6: number; sourceBinaryState: string } | null;
    /** M2 texture slot: resonance index + Shem degree quantum. */
    readonly m2: { resonance72Index: number; shemDegreeQuantum: number } | null;
    /** M3 lens-ring slot: Mahāmāyā address + codon cell. */
    readonly m3: { mahamayaAddress64: number; codon: string; codonId: number } | null;
    /** The translation rule joined to the live hinge — one line, not a proof label. */
    readonly joinLine: string | null;
}

const PENDING: PentadicOverlayModel = Object.freeze({
    state: 'pending-anuttara-pentadic-trace',
    m1: null,
    m2: null,
    m3: null,
    joinLine: null
});

function profileTick(payload: Readonly<Record<string, unknown>>): number | null {
    const root =
        payload.harmonicProfile !== null &&
        typeof payload.harmonicProfile === 'object' &&
        !Array.isArray(payload.harmonicProfile)
            ? (payload.harmonicProfile as Record<string, unknown>)
            : payload;
    return typeof root.tick === 'number' && Number.isFinite(root.tick) ? root.tick : null;
}

/** Build the 1-2-3 overlay from ONE cached profile payload. All three slots
 *  read the SAME trace generation; a tick mismatch rejects the whole overlay
 *  (per-slot mixing of generations is exactly the bug this guards). */
export function buildPentadicOverlay(
    payload: Readonly<Record<string, unknown>>
): PentadicOverlayModel {
    const trace = pentadicTraceFromPayload(payload);
    if (!trace) {
        return PENDING;
    }
    const tick = profileTick(payload);
    if (tick !== null && trace.tick !== tick) {
        return Object.freeze({
            state: 'stale-trace-generation' as const,
            m1: null,
            m2: null,
            m3: null,
            joinLine: null
        });
    }
    return Object.freeze({
        state: 'ready' as const,
        m1: Object.freeze({
            tick12: trace.tick12,
            position6: trace.position6,
            sourceBinaryState: trace.sourceBinaryState
        }),
        m2: Object.freeze({
            resonance72Index: trace.resonance72Index,
            shemDegreeQuantum: trace.shemDegreeQuantum
        }),
        m3: Object.freeze({
            mahamayaAddress64: trace.mahamayaAddress64,
            codon: trace.codon,
            codonId: trace.codonId
        }),
        // The rule is joined to the LIVE hinge (whole 0→5 / natural 1→6 from
        // the trace itself), not floated as a standalone identity.
        joinLine: `9₍M2₎ = 8₍M3₎ + 1₍M1₎ ⇐ 0/1→${trace.wholeNumberEndpoint} (t12 ${trace.tick12} · ${trace.sourceBinaryState})`
    });
}
