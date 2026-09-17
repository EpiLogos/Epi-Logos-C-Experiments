/**
 * Coordinate: M' M1' (played-torus view model — Track 02.T2.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.playedTorus` view model — the M1-2 ananda
 *   vortex riding the single K², sourced ONLY from the profile bus:
 *   `anandaVortex` (Tranche 10.10 projection: active cell plus the complete
 *   six-family 12×12 `matrixCells` dual raw/no-digi-root + digit-root faces),
 *   the M1-5 topology invariants (`m1Topology`), and the M2-1' Vimarśa
 *   windows (`audioOctet[8]` / `nodalQuartet[4]` — windows onto Vimarśa's
 *   writes, never re-derived; `vimarsha_reading.rs` is the single source).
 *   Readiness is explicit: a missing/malformed field is a `pending-*` state,
 *   never a locally-computed fallback (no RING_QUATERNION_LUT / CL42_BASIS /
 *   DR_RING_* forks live here). Contract surfaces (view id, consumed field
 *   set, readiness names) follow the frozen
 *   `epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` (LAW);
 *   the Bevy/wgpu plumbing is dead — this is the pratibimba-app three.js
 *   carrier per the CHARTER retarget. Substrate authority:
 *   `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §4–5.
 * Does NOT own: vortex genesis (portal-core `ananda_vortex.rs`), the Vortex
 *   Modulae values (epi-lib `m1.c`), gateway I/O, flexlayout, and the
 *   `K² × T²_Mahāmāyā` double torus — that is M3-5 territory; this surface
 *   renders a single K² only (M1'-SPEC §1, §13.6).
 */

import { AnandaVortexCellBoundary, AnandaVortexProjectionBoundary } from '../bridge/types';
import { harmonicSnapshot } from '../engine/modulation/modulators';
import { M1KleinTopology, topologyFromPayload } from './m1KleinTopology';

export const M1_PLAYED_TORUS_VIEW_ID = 'm1.paramasiva.playedTorus' as const;

/** K² body proportions — DERIVED, not chosen (ql-musical-derivation-v3
 *  register law, resolved 2026-07-06): R/r = 16/9 with R + r = 1, the standing
 *  identity 100% = 64 + 36 (R = 0.64 Mahāmāyā 2⁶ · r = 0.36 Paraśakti 6²).
 *  The epogdoon 9/8 is the step/double-cover register (2r/R = 72/64), never
 *  the aspect. Same constants as the Cosmic Engine's K² — one derivation. */
export const K2_MAJOR_RADIUS = 0.64;
export const K2_MINOR_RADIUS = 0.36;

export type PlayedTorusVortexState = 'ready' | 'pending-ananda-vortex';

export interface PlayedTorusViewModel {
    readonly topology: M1KleinTopology;
    /** The Tranche 10.10 projection, verbatim off the bus — or null (pending). */
    readonly vortex: AnandaVortexProjectionBoundary | null;
    readonly vortexState: PlayedTorusVortexState;
    /** Vimarśa windows (M2-1' writes). null = pending badge, never derived. */
    readonly audioOctet: readonly number[] | null;
    readonly nodalQuartet: readonly { m: number; n: number }[] | null;
    /** klein_flip presence on the current generation (pending-klein-flip when false). */
    readonly kleinFlipReady: boolean;
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

/** Matrix families cross the wire as kebab-case strings (Rust `AnandaMatrixOp`
 *  serde: 'bimba' … 'quintessence'). */
function isFamilyName(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

/** The bus may nest the profile under `harmonicProfile` (wire shape) or hand
 *  the payload directly — same unwrap the modulation graph applies. */
function profileRoot(payload: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? (payload as Record<string, unknown>);
}

function cellFromValue(value: unknown): AnandaVortexCellBoundary | null {
    const cell = objectValue(value);
    if (!cell) {
        return null;
    }
    const { family, rowK, positionP, rawBimba, rawPratibimba, rawSum, rawDelta } = cell;
    const { drBimba, drPratibimba, drSum } = cell;
    if (
        !isFamilyName(family) ||
        !isFiniteNumber(rowK) ||
        !isFiniteNumber(positionP) ||
        !isFiniteNumber(rawBimba) ||
        !isFiniteNumber(rawPratibimba) ||
        !isFiniteNumber(rawSum) ||
        !isFiniteNumber(rawDelta) ||
        !isFiniteNumber(drBimba) ||
        !isFiniteNumber(drPratibimba) ||
        !isFiniteNumber(drSum)
    ) {
        return null;
    }
    return {
        family,
        rowK,
        positionP,
        rawValue: isFiniteNumber(cell.rawValue) ? cell.rawValue : null,
        rawBimba,
        rawPratibimba,
        rawSum,
        rawDelta,
        drValue: isFiniteNumber(cell.drValue) ? cell.drValue : null,
        drBimba,
        drPratibimba,
        drSum,
        ruleValue: typeof cell.ruleValue === 'string' ? cell.ruleValue : null,
        skeletonEvent: cell.skeletonEvent ?? null
    };
}

function matrixCellsFromValue(value: unknown): readonly AnandaVortexCellBoundary[] | null {
    if (!Array.isArray(value) || value.length !== 6 * 12 * 12) {
        return null;
    }
    const cells: AnandaVortexCellBoundary[] = [];
    for (const valueCell of value) {
        const cell = cellFromValue(valueCell);
        if (cell === null) {
            return null;
        }
        cells.push(cell);
    }
    const addresses = new Set(cells.map(cell => `${cell.family}:${cell.rowK}:${cell.positionP}`));
    return addresses.size === cells.length ? Object.freeze(cells) : null;
}

/** Strict structural read of `anandaVortex` off the profile payload. A missing
 *  or malformed projection yields null — the surface goes `pending-ananda-vortex`
 *  with a blocked overlay; it NEVER back-fills from local math (the raw and DR
 *  faces are kernel writes; this module is a window). */
export function vortexFromPayload(
    payload: Readonly<Record<string, unknown>>
): AnandaVortexProjectionBoundary | null {
    const vortex = objectValue(profileRoot(payload).anandaVortex);
    if (!vortex) {
        return null;
    }
    const activeCell = Array.isArray(vortex.activeCell) ? vortex.activeCell : null;
    const cellValue = cellFromValue(vortex.activeCellValue);
    const matrixCells =
        vortex.matrixCells === undefined ? null : matrixCellsFromValue(vortex.matrixCells);
    const phase = objectValue(vortex.drRingPhase);
    const quaternion = Array.isArray(vortex.ringQuaternion) ? vortex.ringQuaternion : null;
    if (
        !isFamilyName(vortex.activeMatrixOp) ||
        !activeCell ||
        activeCell.length !== 2 ||
        !isFiniteNumber(activeCell[0]) ||
        !isFiniteNumber(activeCell[1]) ||
        !cellValue ||
        !phase ||
        !isFiniteNumber(phase.mahamayaIdx) ||
        !isFiniteNumber(phase.parashaktiIdx) ||
        !isFiniteNumber(vortex.cl42SignatureAtPosition) ||
        !quaternion ||
        quaternion.length !== 4 ||
        !quaternion.every(isFiniteNumber) ||
        !isFiniteNumber(vortex.helixSheet) ||
        typeof vortex.kleinFlipAtThisTick !== 'boolean'
        || (vortex.matrixCells !== undefined && matrixCells === null)
    ) {
        return null;
    }
    return {
        activeMatrixOp: vortex.activeMatrixOp,
        activeCell: [activeCell[0], activeCell[1]] as const,
        activeCellValue: cellValue,
        matrixCells,
        drRingPhase: { mahamayaIdx: phase.mahamayaIdx, parashaktiIdx: phase.parashaktiIdx },
        cl42SignatureAtPosition: vortex.cl42SignatureAtPosition,
        ringQuaternion: quaternion as number[],
        helixSheet: vortex.helixSheet,
        kleinFlipAtThisTick: vortex.kleinFlipAtThisTick
    };
}

/** Build the played-torus view model from a bridge profile payload. Every
 *  field is a window onto a kernel/Vimarśa write; absence is a pending state. */
export function buildPlayedTorusView(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): PlayedTorusViewModel {
    const payload = input.payload;
    const vortex = vortexFromPayload(payload);
    const snapshot = harmonicSnapshot(payload);
    return Object.freeze({
        topology: topologyFromPayload(payload),
        vortex,
        vortexState: vortex ? ('ready' as const) : ('pending-ananda-vortex' as const),
        audioOctet: snapshot.audioOctet,
        nodalQuartet: snapshot.nodalQuartet,
        kleinFlipReady: snapshot.kleinFlip,
        generation: input.generation
    });
}
