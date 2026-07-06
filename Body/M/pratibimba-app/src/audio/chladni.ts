/**
 * Coordinate: M' M2' (cymatic mathematics — SUPERSEDED reference)
 * Actualises: NOTHING LIVE. Superseded by `src/engine/cymaticField.ts`
 *   (Sprint-8 E4), which solves the actual M2' seed equation
 *   (a·sin·sin + b·cos·cos per constraint) with a byte-hash-pinned CPU
 *   reference. This module's `chladniMode` is the classic antisymmetric
 *   plate combination — NOT the M2' seed law — and must not be mounted on
 *   any M2' surface again. It remains only as the tested math behind the
 *   retired `components/CymaticField.tsx` (unmounted legacy, kept as a
 *   historical reference per Sprint 6). New cymatic work goes through the
 *   modulation graph + cymaticField.ts, never here. (E4 verifier finding,
 *   2026-07-02.)
 */

export interface NodalConstraint {
    m: number;
    n: number;
}

/** Classic square-plate Chladni mode: antisymmetric combination. */
export function chladniMode(x: number, y: number, m: number, n: number): number {
    return (
        Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y) -
        Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y)
    );
}

/**
 * Field intensity at (x, y) ∈ [0,1]²: each nodal constraint contributes its
 * mode, weighted by the paired voice amplitudes from the audio octet
 * (normalised). Returns |sum| ∈ [0, ~1] — zero lines are the nodal (sand)
 * lines of the figure.
 */
export function chladniIntensity(
    x: number,
    y: number,
    quartet: readonly NodalConstraint[],
    octet: readonly number[]
): number {
    if (quartet.length === 0) {
        return 0;
    }
    const maxHz = Math.max(...octet, 1);
    let sum = 0;
    for (let k = 0; k < quartet.length; k++) {
        const { m, n } = quartet[k];
        // two voices per boundary constraint (8 voices / 4 constraints)
        const a = (octet[2 * k] ?? maxHz) / maxHz;
        const b = (octet[2 * k + 1] ?? maxHz) / maxHz;
        sum += ((a + b) / 2) * chladniMode(x, y, m, n);
    }
    return Math.min(1, Math.abs(sum) / quartet.length);
}

/** Rasterise the field into a grayscale intensity buffer (row-major). */
export function chladniField(
    resolution: number,
    quartet: readonly NodalConstraint[],
    octet: readonly number[]
): Float32Array {
    const buffer = new Float32Array(resolution * resolution);
    for (let j = 0; j < resolution; j++) {
        const y = j / (resolution - 1);
        for (let i = 0; i < resolution; i++) {
            buffer[j * resolution + i] = chladniIntensity(i / (resolution - 1), y, quartet, octet);
        }
    }
    return buffer;
}
