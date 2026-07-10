/**
 * Coordinate: M' M5' (EBM observatory law — Track 26.T26.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pure view-model of the M5'-as-EBM observatory — "M5'
 *   does not talk. It scores." Reads the bussed
 *   `mathemeResonance72Projection` EBM fields verbatim (checkpoint ref,
 *   predicted/target 72-vectors, 4-dim personal-quaternion gradient);
 *   the ONLY local arithmetic is what the spec states as formula: energy
 *   `E = ‖target − predicted‖²` when not bussed, the Möbius-descent step
 *   `−log(9/8)·∇E` (epogdoon constant), and the three Klein-V₄ tritone
 *   square position partitions A:(0,5) / B:(1,4) / C:(2,3). Absence is
 *   pending, never fabricated: no checkpoint on the bus (10.M5 Wave-B)
 *   → `pending-checkpoint`, grid/energy/gradient suppressed per spec.
 * Does NOT own: EBM law (kernel/S5 substrate), gradient computation
 *   (never derivable locally), square coherence scoring (kernel-owned —
 *   read verbatim or pending), the pane body (M5EbmObservatoryPane.tsx).
 */

export type TritoneSquareLabel = 'A:(0,5)' | 'B:(1,4)' | 'C:(2,3)';

export interface TritoneSquareCell {
    readonly lens: number;
    readonly position: number;
    readonly predicted: number;
    readonly target: number | null;
}

export interface TritoneSquareReading {
    readonly squareLabel: TritoneSquareLabel;
    readonly positions: readonly [number, number];
    /** Kernel-owned score, read verbatim from the projection; null = pending. */
    readonly coherenceScore: number | null;
    readonly cells: readonly TritoneSquareCell[];
}

export interface ResonanceEbmSurface {
    readonly state: 'ready' | 'pending-checkpoint';
    /** e.g. `ebm-checkpoint://v0.3`; null = bootstrap Phase 1, nothing loaded. */
    readonly checkpointRef: string | null;
    /** 12 lenses × 6 positions, row-major; null while pending. */
    readonly predicted72: readonly number[] | null;
    readonly target72: readonly number[] | null;
    /** `‖target − predicted‖²` — bussed value verbatim when present, else
     *  the spec formula over the two vectors, else null. */
    readonly energy: number | null;
    /** `∇_{q_p} E_total` — 4 personal-quaternion components, verbatim only. */
    readonly gradient: readonly number[] | null;
    /** `q_p^(n+1) = q_p^(n) − log(9/8)·∇E` step, derived from the bussed
     *  gradient by the spec formula; null when the gradient is pending. */
    readonly mobiusDescentStep: readonly number[] | null;
    readonly tritoneSquares: readonly TritoneSquareReading[];
    readonly generation: number;
}

const SQUARES: ReadonlyArray<{ label: TritoneSquareLabel; positions: readonly [number, number] }> =
    [
        { label: 'A:(0,5)', positions: [0, 5] },
        { label: 'B:(1,4)', positions: [1, 4] },
        { label: 'C:(2,3)', positions: [2, 3] }
    ];

/** The epogdoon step constant log(9/8) — 9/8 is step/double-cover (2r/R). */
export const EPOGDOON_LOG = Math.log(9 / 8);

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function str(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function numArray(value: unknown, length: number): readonly number[] | null {
    return Array.isArray(value) &&
        value.length === length &&
        value.every(entry => typeof entry === 'number' && Number.isFinite(entry))
        ? (value as number[])
        : null;
}

export function buildResonanceEbmSurface(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): ResonanceEbmSurface {
    const root =
        objectValue((input.payload as { harmonicProfile?: unknown }).harmonicProfile) ??
        input.payload;
    const projection = objectValue(root.mathemeResonance72Projection);

    const checkpointRef = projection
        ? (str(projection.learnedPredictorCheckpointRef) ?? str(projection.checkpointRef))
        : null;
    const predicted72 = projection ? numArray(projection.predicted72, 72) : null;
    const target72 = projection ? numArray(projection.target72, 72) : null;
    const gradient = projection ? numArray(projection.gradient, 4) : null;

    const ready = checkpointRef !== null && predicted72 !== null;

    const bussedEnergy = projection ? num(projection.energy) : null;
    const energy =
        bussedEnergy ??
        (predicted72 && target72
            ? target72.reduce(
                  (sum, target, i) => sum + (target - predicted72[i]) ** 2,
                  0
              )
            : null);

    const coherence = projection ? numArray(projection.tritoneCoherence, 3) : null;

    const tritoneSquares: TritoneSquareReading[] = SQUARES.map((square, index) => ({
        squareLabel: square.label,
        positions: square.positions,
        coherenceScore: coherence ? coherence[index] : null,
        cells:
            ready && predicted72
                ? Array.from({ length: 12 }, (_, lens) =>
                      square.positions.map(position => ({
                          lens,
                          position,
                          predicted: predicted72[lens * 6 + position],
                          target: target72 ? target72[lens * 6 + position] : null
                      }))
                  ).flat()
                : []
    }));

    return Object.freeze({
        state: ready ? ('ready' as const) : ('pending-checkpoint' as const),
        checkpointRef,
        predicted72: ready ? predicted72 : null,
        target72: ready ? target72 : null,
        energy: ready ? energy : null,
        gradient: ready ? gradient : null,
        mobiusDescentStep:
            ready && gradient ? gradient.map(g => -EPOGDOON_LOG * g) : null,
        tritoneSquares,
        generation: input.generation
    });
}
