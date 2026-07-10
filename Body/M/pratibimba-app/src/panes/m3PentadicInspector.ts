/**
 * Coordinate: M' M3' (Maxwell/Mahāmāyā 15 inspector view model — Tracks 36.3 + 04.T4.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pentadic-hinge inspector — the two fifteens in one runtime
 *   surface. The Maxwell/Kaluza-Klein witness (5D symmetric metric
 *   `15 = 10 + 4 + 1`) renders as a labelled physics CITATION (register fact,
 *   never computed here); every runtime value — paired Mahāmāyā fifteens,
 *   backbone identity `24x15=360`, line-change closure `360+24=384`, active
 *   tick, 5° Shem quantum, 72-index, 64-address, codon, Q reference — arrives
 *   VERBATIM from `profile.anuttaraPentadicTrace` (Track 36/10.P5 bus field,
 *   kernel-derived by `pentadic_trace.rs::from_profile`). A missing/malformed
 *   trace is an explicit `pending-anuttara-pentadic-trace` state; there is no
 *   local recomputation table (tests feed altered identity strings and assert
 *   they render verbatim). This module IS the real implementation of the
 *   former `buildPentadicTrace` doc-ahead stub in bridge/types.ts.
 * Does NOT own: trace genesis (portal-core), the coupling-flow/measurement-face
 *   inspector caveat lanes (Tranche 4.10 / Track 24), gateway I/O, flexlayout.
 */

import { AnuttaraPentadicRuntimeTrace } from '../bridge/types';

export const M3_PENTADIC_INSPECTOR_VIEW_ID = 'm3.mahamaya.pentadicInspector' as const;

/** The Maxwell/Kaluza-Klein relation-space witness — a physics citation
 *  (5D symmetric metric component count), displayed as a labelled register
 *  fact beside the live Mahāmāyā lane. Never computed from runtime values. */
export const MAXWELL_WITNESS = Object.freeze({
    label: '15 = 10 + 4 + 1',
    parts: Object.freeze({
        metricBody: '10 — 4D symmetric metric body',
        vectorConnection: '4 — vector connection field',
        scalarFiber: '1 — scalar/fiber condition'
    }),
    provenance: 'physics citation (5D Kaluza–Klein symmetric metric) — register fact, not computed'
});

export type PentadicInspectorState = 'ready' | 'pending-anuttara-pentadic-trace';

export interface PentadicInspectorViewModel {
    readonly state: PentadicInspectorState;
    /** The bus trace, verbatim — or null (pending chip). */
    readonly trace: AnuttaraPentadicRuntimeTrace | null;
    readonly maxwell: typeof MAXWELL_WITNESS;
    /** 4.14: the coupling-flow lane consumes `profile.couplingFlowAlignment`
     *  when Track 10.M3 lands it — until then an explicit pending chip,
     *  never a locally-fabricated physics lane. */
    readonly couplingFlow: Record<string, unknown> | null;
    readonly couplingFlowState: 'ready' | 'pending-coupling-flow-alignment';
    readonly generation: number;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function profileRoot(payload: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? (payload as Record<string, unknown>);
}

const NUMBER_KEYS = [
    'tick',
    'tick12',
    'helix',
    'position6',
    'wholeNumberEndpoint',
    'naturalNumberEndpoint',
    'shemDegreeQuantum',
    'resonance72Index',
    'degree360',
    'm2ToM3Symbol',
    'mahamayaAddress64',
    'codonId',
    'lineChangeOperator'
] as const;

const STRING_KEYS = [
    'sourceBinaryState',
    'evolutionaryGap',
    'codon',
    'backboneIdentity',
    'lineGraphIdentity',
    'qCosmicRef'
] as const;

/** Strict structural read of `anuttaraPentadicTrace` off the profile payload —
 *  the REAL `buildPentadicTrace`: a window onto the kernel derivation, never a
 *  re-derivation. Missing/malformed → null (pending), no sentinel fabrication. */
export function pentadicTraceFromPayload(
    payload: Readonly<Record<string, unknown>>
): AnuttaraPentadicRuntimeTrace | null {
    const trace = objectValue(profileRoot(payload).anuttaraPentadicTrace);
    if (!trace) {
        return null;
    }
    for (const key of NUMBER_KEYS) {
        if (!isFiniteNumber(trace[key])) {
            return null;
        }
    }
    for (const key of STRING_KEYS) {
        if (!isNonEmptyString(trace[key])) {
            return null;
        }
    }
    const complement = trace.familyBComplement;
    const fifteens = trace.pairedMahamayaFifteens;
    const provenance = trace.provenance;
    if (
        !Array.isArray(complement) ||
        complement.length !== 2 ||
        !complement.every(isFiniteNumber) ||
        !Array.isArray(fifteens) ||
        fifteens.length !== 2 ||
        !fifteens.every(isFiniteNumber) ||
        !Array.isArray(provenance) ||
        !provenance.every(isNonEmptyString)
    ) {
        return null;
    }
    // Verbatim carry — the kernel wrote these; the inspector only shows them.
    return trace as unknown as AnuttaraPentadicRuntimeTrace;
}

/** Build the inspector view model from a bridge profile payload. */
export function buildPentadicInspectorView(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): PentadicInspectorViewModel {
    const trace = pentadicTraceFromPayload(input.payload);
    const couplingFlow = objectValue(profileRoot(input.payload).couplingFlowAlignment);
    return Object.freeze({
        state: trace ? ('ready' as const) : ('pending-anuttara-pentadic-trace' as const),
        trace,
        maxwell: MAXWELL_WITNESS,
        couplingFlow,
        couplingFlowState: couplingFlow
            ? ('ready' as const)
            : ('pending-coupling-flow-alignment' as const),
        generation: input.generation
    });
}
