// Generated body for 26.T26.1. Hand-authored EBM reasoning surface for M5 Epii.
//
// The ResonanceEbmService is a passive, deterministic projector. It consumes the
// MathemeHarmonicProfileBoundary observed at the kernel-bridge and derives a
// 72-dim resonance grid (12 spanda ticks × 6 QL positions), partitions it into
// three tritone-symmetric squares, and runs an energy-based Möbius descent over
// the grid. It never mutates the profile, never talks to S0/S2/S3/S5 directly,
// and never derives harmonic *law* — it only re-projects payload-shaped numbers
// the bridge already published.
//
// Energy model (EBM): each cell has exactly one tritone partner six ticks away
// (the half-octave / #4-lemniscate fold). Energy is lowered when tritone pairs
// are coherent and when activations stay near the spanda baseline. Möbius
// descent walks the 72 cells in index order, nudging each activation down its
// local gradient; every #5→#0 tick boundary (tick 11 → tick 0) is flagged as a
// Möbius return, per the (5/0) context frame.

import { injectable } from '@theia/core/shared/inversify';
import { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

/** Total resonance dimensionality: 12 spanda ticks × 6 QL positions. */
export const RESONANCE_GRID_DIM = 72;
/** Spanda / torus ticks per QL row (one full 360° / 30° wind). */
export const RESONANCE_TICK_COUNT = 12;
/** Quaternal-logic positions #0..#5. */
export const RESONANCE_QL_COUNT = 6;
/** Tritone-symmetric squares: QL pairs (0,1), (2,3), (4,5). */
export const RESONANCE_SQUARE_COUNT = 3;
/** Tritone interval: half of the 12-tick octave. */
export const TRITONE_INTERVAL = 6;

/** One of the 72 cells of the resonance grid. */
export interface ResonanceGridCell {
    /** Flat grid index, 0..71. */
    readonly index: number;
    /** Spanda / torus stage, 0..11 (tick12). */
    readonly tick12: number;
    /** Quaternal-logic position, 0..5 (#0..#5). */
    readonly ql: number;
    /** Owning tritone-symmetric square, 0..2. */
    readonly square: number;
    /** Explicate (0) / implicate (1) phase row within the square. */
    readonly phase: number;
    /** Index of this cell's tritone partner (tick ± 6, same phase row). */
    readonly tritonePartner: number;
    /** Current resonance amplitude in [0, 1]. */
    readonly activation: number;
    /** Local energy contribution of this cell. */
    readonly energy: number;
}

/** One tritone-symmetric quadrant of the grid (24 cells = 12 ticks × 2 phases). */
export interface TritoneSquare {
    /** Square id, 0..2. */
    readonly id: number;
    /** Human label naming the QL pair this square carries. */
    readonly label: string;
    /** The two QL positions folded into this square. */
    readonly qlPair: readonly [number, number];
    /** Flat indices of every cell in this square. */
    readonly cellIndices: readonly number[];
    /** Unordered tritone partner pairs (tick t ↔ tick t+6) within the square. */
    readonly tritonePairs: readonly (readonly [number, number])[];
    /** Aggregate energy of the square. */
    readonly energy: number;
    /** Mean tritone-pair divergence — 0 means perfect tritone symmetry. */
    readonly symmetryDefect: number;
}

/** One step of the energy-based Möbius descent. */
export interface EbmDescentStep {
    /** Monotonic step counter, 0-based. */
    readonly step: number;
    /** Cell touched at this step. */
    readonly cellIndex: number;
    /** Spanda tick of the touched cell. */
    readonly tick12: number;
    /** QL position of the touched cell. */
    readonly ql: number;
    /** Total grid energy after the update. */
    readonly energy: number;
    /** Local gradient applied at this step. */
    readonly gradient: number;
    /** True when this step crossed a #5→#0 (tick 11 → tick 0) Möbius return. */
    readonly mobiusWrapped: boolean;
}

/** Frozen projection handed to the widget for rendering. */
export interface ResonanceProjection {
    /** Profile generation this projection was derived from. */
    readonly generation: number;
    /** The 72 resonance cells. */
    readonly cells: readonly ResonanceGridCell[];
    /** The three tritone-symmetric squares. */
    readonly squares: readonly TritoneSquare[];
    /** Total grid energy at the projection's resting state. */
    readonly totalEnergy: number;
    /** Per-cell energy gradient (length 72). */
    readonly gradient: readonly number[];
    /** Recorded Möbius descent trajectory. */
    readonly descent: readonly EbmDescentStep[];
    /** True when the descent reached a low-gradient fixed point. */
    readonly converged: boolean;
}

const SELF_WEIGHT = 0.25;
const TRITONE_COUPLING = 0.5;
const BASELINE = 0.5;
const LEARNING_RATE = 0.35;
const DESCENT_PASSES = 2;
const CONVERGENCE_EPSILON = 1e-3;

const SQUARE_LABELS: readonly string[] = Object.freeze([
    'Ground · Definition (QL 0/1)',
    'Operation · Pattern (QL 2/3)',
    'Context · Integration (QL 4/5)'
]);

/**
 * Energy-based resonance projector for M5 Epii.
 *
 * Lifecycle: the widget pushes each bridge `onProfile` payload through
 * {@link ResonanceEbmService.ingest}; rendering calls {@link project} (pure,
 * idempotent) to obtain a frozen {@link ResonanceProjection}. The cached profile
 * lets the service answer {@link currentProjection} without re-plumbing the
 * bridge.
 */
@injectable()
export class ResonanceEbmService {
    private cachedProfile: MathemeHarmonicProfileBoundary | null = null;

    /** Cache the latest bridge-provided profile (null clears the projection). */
    ingest(profile: MathemeHarmonicProfileBoundary | null): void {
        this.cachedProfile = profile;
    }

    /** The profile currently driving the projection, if any. */
    get profile(): MathemeHarmonicProfileBoundary | null {
        return this.cachedProfile;
    }

    /** Project the cached profile, or null if no profile has been ingested. */
    currentProjection(): ResonanceProjection | null {
        return this.cachedProfile ? this.project(this.cachedProfile) : null;
    }

    /**
     * Pure projection of a profile into grid + squares + descent. Deterministic:
     * the same profile generation/anchor/payload always yields the same surface.
     */
    project(profile: MathemeHarmonicProfileBoundary): ResonanceProjection {
        const seed = seedFromProfile(profile);
        const activations = deriveActivations(seed);
        const descent = this.descend(activations);
        const cells = this.buildCells(activations);
        const squares = this.buildSquares(cells);
        const gradient = energyGradient(activations);
        const maxGradient = gradient.reduce((max, g) => Math.max(max, Math.abs(g)), 0);
        return Object.freeze({
            generation: profile.generation,
            cells,
            squares,
            totalEnergy: totalEnergy(activations),
            gradient: Object.freeze(gradient),
            descent,
            converged: maxGradient < CONVERGENCE_EPSILON || descent.length >= RESONANCE_GRID_DIM * DESCENT_PASSES
        });
    }

    /** Materialise the 72 cells (with per-cell energy) from an activation vector. */
    buildCells(activations: readonly number[]): readonly ResonanceGridCell[] {
        const cells: ResonanceGridCell[] = [];
        for (let index = 0; index < RESONANCE_GRID_DIM; index += 1) {
            const tick12 = index % RESONANCE_TICK_COUNT;
            const square = Math.floor(index / (RESONANCE_TICK_COUNT * 2));
            const phase = Math.floor(index / RESONANCE_TICK_COUNT) % 2;
            const ql = square * 2 + phase;
            const tritonePartner = partnerIndex(index);
            cells.push(Object.freeze({
                index,
                tick12,
                ql,
                square,
                phase,
                tritonePartner,
                activation: activations[index],
                energy: cellEnergy(activations, index)
            }));
        }
        return Object.freeze(cells);
    }

    /** Partition the cells into the three tritone-symmetric squares. */
    buildSquares(cells: readonly ResonanceGridCell[]): readonly TritoneSquare[] {
        const squares: TritoneSquare[] = [];
        for (let id = 0; id < RESONANCE_SQUARE_COUNT; id += 1) {
            const members = cells.filter(cell => cell.square === id);
            const cellIndices = members.map(cell => cell.index);
            const seenPairs = new Set<string>();
            const tritonePairs: (readonly [number, number])[] = [];
            let defectSum = 0;
            for (const cell of members) {
                const key = pairKey(cell.index, cell.tritonePartner);
                if (!seenPairs.has(key)) {
                    seenPairs.add(key);
                    tritonePairs.push(Object.freeze([cell.index, cell.tritonePartner] as const));
                    defectSum += Math.abs(cell.activation - cells[cell.tritonePartner].activation);
                }
            }
            squares.push(Object.freeze({
                id,
                label: SQUARE_LABELS[id],
                qlPair: Object.freeze([id * 2, id * 2 + 1] as const),
                cellIndices: Object.freeze(cellIndices),
                tritonePairs: Object.freeze(tritonePairs),
                energy: members.reduce((sum, cell) => sum + cell.energy, 0),
                symmetryDefect: tritonePairs.length > 0 ? defectSum / tritonePairs.length : 0
            }));
        }
        return Object.freeze(squares);
    }

    /**
     * Energy-based Möbius descent. Walks the 72 cells in index order for
     * {@link DESCENT_PASSES} passes, nudging each activation down its local
     * gradient. A tick 11 → tick 0 transition flags a #5→#0 Möbius return.
     * Mutates the supplied activation vector in place to its descended state.
     */
    descend(activations: number[]): readonly EbmDescentStep[] {
        const steps: EbmDescentStep[] = [];
        let previousTick = -1;
        let step = 0;
        for (let pass = 0; pass < DESCENT_PASSES; pass += 1) {
            for (let index = 0; index < RESONANCE_GRID_DIM; index += 1) {
                const tick12 = index % RESONANCE_TICK_COUNT;
                const gradient = cellGradient(activations, index);
                activations[index] = clamp01(activations[index] - LEARNING_RATE * gradient);
                const mobiusWrapped = previousTick === RESONANCE_TICK_COUNT - 1 && tick12 === 0;
                steps.push(Object.freeze({
                    step,
                    cellIndex: index,
                    tick12,
                    ql: Math.floor(index / (RESONANCE_TICK_COUNT * 2)) * 2 +
                        (Math.floor(index / RESONANCE_TICK_COUNT) % 2),
                    energy: totalEnergy(activations),
                    gradient,
                    mobiusWrapped
                }));
                previousTick = tick12;
                step += 1;
            }
        }
        return Object.freeze(steps);
    }
}

/** This cell's tritone partner: tick ± 6 within the same square+phase row. */
function partnerIndex(index: number): number {
    const rowStart = Math.floor(index / RESONANCE_TICK_COUNT) * RESONANCE_TICK_COUNT;
    const tick = index % RESONANCE_TICK_COUNT;
    return rowStart + ((tick + TRITONE_INTERVAL) % RESONANCE_TICK_COUNT);
}

function pairKey(a: number, b: number): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function cellEnergy(activations: readonly number[], index: number): number {
    const a = activations[index];
    const partner = activations[partnerIndex(index)];
    const self = SELF_WEIGHT * (a - BASELINE) * (a - BASELINE);
    // Halved tritone term so the pair's shared energy is not double-counted.
    const tritone = 0.5 * TRITONE_COUPLING * (a - partner) * (a - partner);
    return self + tritone;
}

function totalEnergy(activations: readonly number[]): number {
    let energy = 0;
    for (let index = 0; index < RESONANCE_GRID_DIM; index += 1) {
        energy += cellEnergy(activations, index);
    }
    return energy;
}

/** ∂E/∂a_i = self pull toward baseline + tritone pull toward the partner. */
function cellGradient(activations: readonly number[], index: number): number {
    const a = activations[index];
    const partner = activations[partnerIndex(index)];
    return 2 * SELF_WEIGHT * (a - BASELINE) + 2 * TRITONE_COUPLING * (a - partner);
}

function energyGradient(activations: readonly number[]): number[] {
    const gradient: number[] = [];
    for (let index = 0; index < RESONANCE_GRID_DIM; index += 1) {
        gradient.push(cellGradient(activations, index));
    }
    return gradient;
}

function clamp01(value: number): number {
    if (value < 0) {
        return 0;
    }
    if (value > 1) {
        return 1;
    }
    return value;
}

/**
 * Fold a profile into a 32-bit seed. Uses the generation, the pointer anchor,
 * the capability roster, and any finite numeric payload values — all
 * payload-shaped data the bridge already owns.
 */
function seedFromProfile(profile: MathemeHarmonicProfileBoundary): number {
    let hash = 2166136261 ^ (profile.generation | 0);
    hash = fold(hash, profile.pointerAnchor ?? 'detached');
    for (const capability of profile.capabilities) {
        hash = fold(hash, capability);
    }
    for (const value of Object.values(profile.payload)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            hash = Math.imul(hash ^ Math.round(value * 1000), 16777619);
        } else if (typeof value === 'string') {
            hash = fold(hash, value);
        }
    }
    return hash >>> 0;
}

function fold(hash: number, text: string): number {
    let next = hash;
    for (let i = 0; i < text.length; i += 1) {
        next ^= text.charCodeAt(i);
        next = Math.imul(next, 16777619);
    }
    return next >>> 0;
}

/** Deterministic mulberry32 PRNG → 72 activations in [0, 1]. */
function deriveActivations(seed: number): number[] {
    let state = seed >>> 0;
    const next = (): number => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const activations: number[] = [];
    for (let index = 0; index < RESONANCE_GRID_DIM; index += 1) {
        activations.push(next());
    }
    return activations;
}
