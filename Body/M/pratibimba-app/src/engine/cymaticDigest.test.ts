import { describe, expect, it } from 'vitest';
import {
    cymaticDigest,
    cymaticFieldHash,
    rasterizeCymaticField
} from './cymaticField';

// the same canonical bus the field test pins against
const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const QUARTET = [
    { m: 1, n: 1 },
    { m: 2, n: 1 },
    { m: 3, n: 2 },
    { m: 1, n: 3 }
];

describe('the cymatic digest (49.4 — a compact cymatic-state summary of the real field)', () => {
    it('pins its fieldHash to the exact rasterised field — it summarises, it does not re-solve', () => {
        const digest = cymaticDigest(OCTET, QUARTET, 0.5, 32);
        expect(digest.fieldHash).toBe(cymaticFieldHash(rasterizeCymaticField(32, OCTET, QUARTET, 0.5)));
        expect(digest.resolution).toBe(32);
        expect(digest.sampleCount).toBe(32 * 32);
    });

    it('is deterministic under (octet, quartet, theta) — the whole digest, hash included', () => {
        const one = cymaticDigest(OCTET, QUARTET, 1.234, 24);
        const two = cymaticDigest(OCTET, QUARTET, 1.234, 24);
        expect(two).toEqual(one);
        expect(two.digestHash).toBe(one.digestHash);
    });

    it('the digest byte-hash moves iff the field moves: modes, drivers, and phase all reach it', () => {
        const base = cymaticDigest(OCTET, QUARTET, 0.5, 16).digestHash;
        const modes = cymaticDigest(OCTET, [{ m: 2, n: 2 }, ...QUARTET.slice(1)], 0.5, 16).digestHash;
        const drivers = cymaticDigest([180, ...OCTET.slice(1)], QUARTET, 0.5, 16).digestHash;
        const phase = cymaticDigest(OCTET, QUARTET, 0.6, 16).digestHash;
        expect(new Set([base, modes, drivers, phase]).size).toBe(4);
    });

    it('reads the sand law: fractions stay in [0,1] and nodal counts the |χ|<0.05 stillness band', () => {
        const digest = cymaticDigest(OCTET, QUARTET, 0.5, 32);
        expect(digest.nodalFraction).toBeGreaterThanOrEqual(0);
        expect(digest.nodalFraction).toBeLessThanOrEqual(1);
        expect(digest.antinodeFraction).toBeGreaterThanOrEqual(0);
        expect(digest.antinodeFraction).toBeLessThanOrEqual(1);
        expect(digest.peakMagnitude).toBeGreaterThan(0);
        expect(digest.peakMagnitude).toBeLessThanOrEqual(1);
    });

    it('yields the stillness digest on a malformed bus — never an invented summary', () => {
        // a short octet drives the field to 0 everywhere (stillness), so the
        // whole plate reads as nodal, deterministically.
        const still = cymaticDigest(OCTET.slice(0, 7), QUARTET, 0.5, 16);
        expect(still.peakMagnitude).toBe(0);
        expect(still.meanMagnitude).toBe(0);
        expect(still.nodalFraction).toBe(1);
        expect(still.antinodeFraction).toBe(0);
        expect(still).toEqual(cymaticDigest(OCTET.slice(0, 7), QUARTET, 0.5, 16));
    });
});
