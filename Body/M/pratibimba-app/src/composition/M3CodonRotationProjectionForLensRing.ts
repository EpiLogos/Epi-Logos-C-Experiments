/**
 * Coordinate: M' M3' (integrated 1-2-3 composition export)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#3): Mahamaya codon rotation projected onto the K2 lens ring.
 * Actualises: the read-only Track 24.T24.13 boundary consumed by CosmicEngine.
 * Public surface: buildM3CodonRotationProjectionForLensRing and its immutable DTOs.
 * Does NOT own: codon, quaternion, line-change, tick, or K2 geometry law.
 * Contract: [[M3'-SPEC]] and [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]].
 */

import type { M3WheelSurface } from '../components/M3CosmicWheelRenderService';

// Frozen warehouse provenance: m3-mahamaya common/codon-wheel.ts.
export const M3_CODON_WHEEL_CONTRACT_VERSION = '2026-06-01.07-T6' as const;

export interface K2LensRingCellDescriptor {
    readonly cellIndex: number;
    readonly codonId: number;
    readonly rotation: number;
    readonly chargeQuaternion: readonly [number, number, number, number];
    readonly lineChangeOperator: string;
    readonly tick: number;
    readonly degree720: number;
}

export interface M3CodonRotationProjectionForLensRingExport {
    readonly contractVersion: typeof M3_CODON_WHEEL_CONTRACT_VERSION;
    readonly profileGeneration: number;
    readonly cells: readonly K2LensRingCellDescriptor[];
    readonly readiness: {
        readonly state: 'ready';
        readonly blockers: readonly string[];
    };
}

export function buildM3CodonRotationProjectionForLensRing(
    surface: M3WheelSurface
): M3CodonRotationProjectionForLensRingExport {
    if (!surface.readiness.surfaceReady || !surface.activeProjection) {
        throw new Error(
            `M3CodonRotationProjectionForLensRing requires a ready M3 projection surface: ${surface.readiness.reason ?? 'unknown blocker'}`
        );
    }

    const projection = surface.activeProjection;
    const charge = surface.chargeQuaternion;
    if (
        projection.surfaceIndex === null ||
        projection.rotation === null ||
        projection.lineChangeOperator === null ||
        surface.tick === null ||
        surface.degree720 === null ||
        charge === null
    ) {
        throw new Error(
            'M3CodonRotationProjectionForLensRing authority payload is incomplete'
        );
    }

    const chargeQuaternion = Object.freeze([
        charge.pp,
        charge.mm,
        charge.mp,
        charge.pm
    ]) as readonly [number, number, number, number];
    const cell = Object.freeze({
        cellIndex: requiredInteger(projection.surfaceIndex, 'cellIndex'),
        codonId: requiredInteger(projection.codonId, 'codonId'),
        rotation: requiredInteger(projection.rotation, 'rotation'),
        chargeQuaternion,
        lineChangeOperator: projection.lineChangeOperator,
        tick: requiredInteger(surface.tick, 'tick'),
        degree720: requiredInteger(surface.degree720, 'degree720')
    });

    return Object.freeze({
        contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
        profileGeneration: requiredInteger(surface.generation, 'profileGeneration'),
        cells: Object.freeze([cell]),
        readiness: Object.freeze({ state: 'ready' as const, blockers: Object.freeze([]) })
    });
}

function requiredInteger(value: number, field: string): number {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${field} must be a non-negative safe integer`);
    }
    return value;
}
