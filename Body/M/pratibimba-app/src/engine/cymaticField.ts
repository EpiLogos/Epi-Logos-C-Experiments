/**
 * Coordinate: M2' (cymatic dynamics — the deterministic CPU reference)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: Sprint-8 E4 — the M2' standing-wave law made real
 *   ([[ql-musical-derivation-v3]] §II-3.3 + [[m2-prime-parashakti-cymatic-engine]]
 *   "M2' ↔ M1' — The 8+4 Cymatic Contract"). The Chladni seed equation
 *       chi(u, v) = a·sin(mπu)·sin(nπv) + b·cos(mπu)·cos(nπv)
 *   is actually solved: the 8 audioOctet carriers ARE the antinodal drivers
 *   (pairs (octet[2k], octet[2k+1]) drive (a_k, b_k) and the temporal phase
 *   of constraint k), the 4 nodalQuartet (m, n) constraints ARE the boundary
 *   conditions selecting the standing-wave modes. Motion structured by
 *   stillness. The klein valence inverts SURFACE VALENCE: the sand mapping
 *   swaps antinodal↔nodal gathering (M2' law: light/shadow swap on every
 *   panel), it never fakes a different field.
 *   This module is the REFERENCE the GPU shader conforms to (the M2' pattern:
 *   "GPU frame generation must be reproducible from CPU frame state") —
 *   byte-hash pinned; the GLSL in CosmicEngine is a transcription of these
 *   functions and must change in lockstep.
 * Does NOT own: pitch or the octet (kernel Vimarśa bus), (m, n) constraints
 *   (kernel nodalQuartet), the klein signal (M1' via the modulation graph),
 *   colour semantics (resonance72 shell routes separately).
 */

import { NodalMN } from './cosmicMath';

/** The M2' Chladni seed equation — one boundary-constrained standing wave. */
export function chladniSeed(
    u: number,
    v: number,
    m: number,
    n: number,
    a: number,
    b: number
): number {
    return (
        a * Math.sin(m * Math.PI * u) * Math.sin(n * Math.PI * v) +
        b * Math.cos(m * Math.PI * u) * Math.cos(n * Math.PI * v)
    );
}

/** Hz → the shared normalisation the whole field breathes against. */
function maxHz(octet: readonly number[]): number {
    let max = 1;
    for (const hz of octet) {
        if (Number.isFinite(hz) && hz > max) {
            max = hz;
        }
    }
    return max;
}

/**
 * Signed field amplitude at (u, v) ∈ [0,1]², theta = temporal phase from the
 * oscillator sweep. Deterministic under (octet, quartet, theta) — scrubbable
 * with the rest of the 5-tuple. Empty/short inputs yield stillness (0),
 * never an invented field.
 */
export function cymaticFieldAmplitude(
    u: number,
    v: number,
    octet: readonly number[],
    quartet: readonly NodalMN[],
    theta: number
): number {
    if (octet.length !== 8 || quartet.length !== 4) {
        return 0;
    }
    const norm = maxHz(octet);
    let chi = 0;
    for (let k = 0; k < 4; k++) {
        // the 8 drive a, b, and temporal phase; the 4 constrain (m, n).
        // The 55 divisor is disclosed CHOREOGRAPHY, not spec law: A1 = 55 Hz
        // as the reference that keeps the audible 146-233 Hz bus in a slow
        // breathing band (same idiom the pre-E4 shader used for scaling).
        const a = (octet[2 * k] ?? 0) / norm;
        const b = (octet[2 * k + 1] ?? 0) / norm;
        const phase = (theta * ((octet[2 * k] ?? 0) + (octet[2 * k + 1] ?? 0))) / (2 * 55);
        const breath = Math.cos(phase);
        chi += breath * chladniSeed(u, v, quartet[k].m, quartet[k].n, a, b);
    }
    return Math.max(-1, Math.min(1, chi / 4));
}

/** GLSL-parity smoothstep. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Where the sand gathers. Valence +1 (bimba face): particles gather along
 * the NODAL stillness lines (classic Chladni). Valence −1 (klein-inverted
 * face): antinodal↔nodal swap — the sand reads the motion instead. The
 * FIELD is untouched; only the surface valence inverts.
 */
export function sandIntensity(amplitude: number, valence: 1 | -1): number {
    const magnitude = Math.abs(amplitude);
    // increasing-edge smoothstep only (decreasing edges are undefined in GLSL)
    return valence > 0
        ? 1 - smoothstep(0.0, 0.05, magnitude)
        : smoothstep(0.55, 0.9, magnitude);
}

/** Rasterise the signed field row-major at a given resolution. */
export function rasterizeCymaticField(
    resolution: number,
    octet: readonly number[],
    quartet: readonly NodalMN[],
    theta: number
): Float32Array {
    const buffer = new Float32Array(resolution * resolution);
    for (let j = 0; j < resolution; j++) {
        const v = j / (resolution - 1);
        for (let i = 0; i < resolution; i++) {
            buffer[j * resolution + i] = cymaticFieldAmplitude(
                i / (resolution - 1),
                v,
                octet,
                quartet,
                theta
            );
        }
    }
    return buffer;
}

/**
 * FNV-1a over the field quantised to millionths — the byte-hash that pins
 * GPU-frame reproducibility from CPU frame state (M2' invariant). Quantising
 * keeps the pin stable across FP environments while catching any real change.
 */
export function cymaticFieldHash(field: Float32Array): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < field.length; i++) {
        const q = Math.round(field[i] * 1_000_000);
        // fold the 32-bit quantised value byte by byte
        for (let shift = 0; shift < 32; shift += 8) {
            hash ^= (q >> shift) & 0xff;
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
    }
    return hash.toString(16).padStart(8, '0');
}

/**
 * The CYMATIC DIGEST (Tranche 49.4) — a compact, deterministic summary of the
 * whole standing-wave field, the thing the M2 meaning packet carries INSTEAD of
 * the full frame. It is derived FROM the real field (rasterizeCymaticField),
 * never a second solver: `fieldHash` pins it to the exact field the shader must
 * conform to, and the scalar stats read the sand law directly — the 0.05 / 0.55
 * thresholds are `sandIntensity`'s own edges (nodal-stillness gather vs
 * antinodal gather). Deterministic under (octet, quartet, theta); a malformed
 * bus yields the stillness digest (the all-zero field), never an invented one.
 */
export interface CymaticDigest {
    readonly resolution: number;
    readonly sampleCount: number;
    /** FNV byte-hash of the exact field — the GPU-parity pin (M2' invariant). */
    readonly fieldHash: string;
    readonly meanMagnitude: number;
    readonly peakMagnitude: number;
    /** Fraction of samples on the nodal stillness lines (|χ| < 0.05) — where the
     *  sand gathers at bimba valence. */
    readonly nodalFraction: number;
    /** Fraction in the antinodal band (|χ| > 0.55) — the klein-valence gather. */
    readonly antinodeFraction: number;
    /** FNV over the quantised scalar summary + fieldHash — the single compact
     *  pin the meaning packet folds into its own hash. */
    readonly digestHash: string;
}

function round6(value: number): number {
    return Math.round(value * 1_000_000) / 1_000_000;
}

export function cymaticDigest(
    octet: readonly number[],
    quartet: readonly NodalMN[],
    theta: number,
    resolution = 32
): CymaticDigest {
    const res = Math.max(2, Math.trunc(resolution));
    const field = rasterizeCymaticField(res, octet, quartet, theta);
    const fieldHash = cymaticFieldHash(field);

    let sum = 0;
    let peak = 0;
    let nodal = 0;
    let antinode = 0;
    for (let i = 0; i < field.length; i++) {
        const magnitude = Math.abs(field[i]);
        sum += magnitude;
        if (magnitude > peak) peak = magnitude;
        if (magnitude < 0.05) nodal += 1;
        if (magnitude > 0.55) antinode += 1;
    }
    const count = field.length;
    const summary = {
        resolution: res,
        sampleCount: count,
        fieldHash,
        meanMagnitude: round6(sum / count),
        peakMagnitude: round6(peak),
        nodalFraction: round6(nodal / count),
        antinodeFraction: round6(antinode / count)
    };
    return Object.freeze({ ...summary, digestHash: cymaticDigestHash(summary) });
}

/** FNV-1a over a digest's quantised scalars — the compact byte pin the meaning
 *  packet folds in. Reads the same field bytes as `fieldHash`, so it moves iff
 *  the field moves. */
function cymaticDigestHash(summary: {
    readonly resolution: number;
    readonly sampleCount: number;
    readonly fieldHash: string;
    readonly meanMagnitude: number;
    readonly peakMagnitude: number;
    readonly nodalFraction: number;
    readonly antinodeFraction: number;
}): string {
    const canonical = [
        summary.resolution,
        summary.sampleCount,
        summary.fieldHash,
        Math.round(summary.meanMagnitude * 1_000_000),
        Math.round(summary.peakMagnitude * 1_000_000),
        Math.round(summary.nodalFraction * 1_000_000),
        Math.round(summary.antinodeFraction * 1_000_000)
    ].join('|');
    let hash = 0x811c9dc5;
    for (let i = 0; i < canonical.length; i++) {
        hash ^= canonical.charCodeAt(i) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}
