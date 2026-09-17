import { describe, expect, it } from 'vitest';
import {
    chladniSeed,
    cymaticFieldAmplitude,
    cymaticFieldHash,
    rasterizeCymaticField,
    sandIntensity
} from './cymaticField';

const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const QUARTET = [
    { m: 1, n: 1 },
    { m: 2, n: 1 },
    { m: 3, n: 2 },
    { m: 1, n: 3 }
];

describe('the M2′ seed equation (§II-3.3 — motion structured by stillness)', () => {
    it('the a-term vanishes on its sin node lines, the b-term peaks at the corners', () => {
        // a-only wave with m=2: sin(2π·0.5) = 0 — a node line at u = 0.5
        for (const v of [0.1, 0.35, 0.8]) {
            expect(chladniSeed(0.5, v, 2, 1, 1, 0)).toBeCloseTo(0, 12);
        }
        // b-only wave: cos·cos = 1 at the origin corner
        expect(chladniSeed(0, 0, 2, 1, 0, 1)).toBeCloseTo(1, 12);
    });

    it('the nodal quartet ARE the boundary conditions: changing (m, n) changes the standing wave', () => {
        const base = cymaticFieldAmplitude(0.3, 0.7, OCTET, QUARTET, 0.4);
        const otherModes = cymaticFieldAmplitude(
            0.3,
            0.7,
            OCTET,
            [
                { m: 4, n: 1 },
                { m: 2, n: 3 },
                { m: 1, n: 2 },
                { m: 3, n: 3 }
            ],
            0.4
        );
        expect(otherModes).not.toBe(base);
    });

    it('the octet pairs ARE the antinodal drivers: octet[2k] drives a_k, octet[2k+1] drives b_k', () => {
        // silence the a-driver of constraint 0 and probe ON its sin ridge
        // where the cos term of that constraint is 0: u=v=0.5, (m,n)=(1,1)
        const quartet = [{ m: 1, n: 1 }, { m: 1, n: 1 }, { m: 1, n: 1 }, { m: 1, n: 1 }];
        const aDriven = cymaticFieldAmplitude(0.5, 0.5, [200, 0, 0, 0, 0, 0, 0, 0], quartet, 0);
        expect(aDriven).toBeCloseTo(0.25, 6); // one a-wave at full sin·sin peak, /4
        const bDriven = cymaticFieldAmplitude(0.5, 0.5, [0, 200, 0, 0, 0, 0, 0, 0], quartet, 0);
        expect(bDriven).toBeCloseTo(0, 6); // the b-wave (cos·cos) is silent mid-plate
    });

    it('yields stillness (0), never an invented field, on a malformed bus', () => {
        expect(cymaticFieldAmplitude(0.3, 0.4, [], QUARTET, 0.2)).toBe(0);
        expect(cymaticFieldAmplitude(0.3, 0.4, OCTET, QUARTET.slice(0, 3), 0.2)).toBe(0);
    });

    it('is deterministic under (octet, quartet, theta) — the scrubbable law', () => {
        const one = cymaticFieldAmplitude(0.42, 0.17, OCTET, QUARTET, 1.234);
        const two = cymaticFieldAmplitude(0.42, 0.17, OCTET, QUARTET, 1.234);
        expect(one).toBe(two);
        expect(cymaticFieldAmplitude(0.42, 0.17, OCTET, QUARTET, 1.235)).not.toBe(one);
    });
});

describe('klein valence inversion (antinodal↔nodal swap — surface valence only)', () => {
    it('valence +1 gathers sand at stillness; valence −1 gathers it at motion', () => {
        expect(sandIntensity(0, 1)).toBe(1); // node line: sand
        expect(sandIntensity(0, -1)).toBe(0); // inverted: bare
        expect(sandIntensity(1, 1)).toBe(0); // antinode: bare
        expect(sandIntensity(1, -1)).toBe(1); // inverted: sand
    });

    it('never touches the field itself — the mapping reads magnitude only', () => {
        // the amplitude function has no valence parameter at all (API shape);
        // and the sand mapping is sign-blind — it reads |amplitude|, so the
        // valence swap can only relabel the SAME field, never reshape it
        for (const amp of [0.02, 0.3, 0.7, 1]) {
            expect(sandIntensity(-amp, 1)).toBe(sandIntensity(amp, 1));
            expect(sandIntensity(-amp, -1)).toBe(sandIntensity(amp, -1));
        }
    });
});

describe('byte-hash reproducibility (M2′: GPU frame reproducible from CPU frame state)', () => {
    it('pins the canonical field — the reference the shader must conform to', () => {
        const field = rasterizeCymaticField(32, OCTET, QUARTET, 0.5);
        const hash = cymaticFieldHash(field);
        expect(hash).toBe(cymaticFieldHash(rasterizeCymaticField(32, OCTET, QUARTET, 0.5)));
        // the pinned reference hash: any change to the field law moves it
        expect(hash).toBe('cbc8bc0c');
    });

    it('any law change moves the hash: modes, drivers, and phase all reach the bytes', () => {
        const base = cymaticFieldHash(rasterizeCymaticField(16, OCTET, QUARTET, 0.5));
        const modes = cymaticFieldHash(
            rasterizeCymaticField(16, OCTET, [{ m: 2, n: 2 }, ...QUARTET.slice(1)], 0.5)
        );
        const drivers = cymaticFieldHash(
            rasterizeCymaticField(16, [180, ...OCTET.slice(1)], QUARTET, 0.5)
        );
        const phase = cymaticFieldHash(rasterizeCymaticField(16, OCTET, QUARTET, 0.6));
        expect(new Set([base, modes, drivers, phase]).size).toBe(4);
    });
});
