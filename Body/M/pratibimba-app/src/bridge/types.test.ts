import { describe, expect, it } from 'vitest';
import {
    KERNEL_BRIDGE_CAPABILITIES,
    parseLensCodonBinaryProjection,
    isKernelBridgeCapability,
    isChimeCoherent,
    type CymaticMonoPolyState,
    type M123ChimeFrameBoundary,
    type M123ChimeWorldClockBindingBoundary,
    type MonoPolyState,
} from './types';

describe('kernel-bridge active-carrier capability preflight', () => {
    it('registers the executable M2 epogdoon projection', () => {
        const capability = 'kernelBridge.m2.epogdoonProjection(address72)';
        expect(KERNEL_BRIDGE_CAPABILITIES).toContain(capability);
        expect(isKernelBridgeCapability(capability)).toBe(true);
    });

    it('strict-parses the complete lens-codon-binary projection', () => {
        const segment = Array.from({ length: 24 }, (_, section) => section * 15);
        const perDegree = segment.map((degree360) => ({
            degree360,
            exactDegree720: degree360 * 2,
            codonUpper: 0,
            codonLower: 0,
            codonClass: 0,
            charges: { pp: 18, nn: -6, np: 6, pn: 6 },
            quaternion: [18, -6, 6, 6],
            elementCanonical: 4,
            hexagramId: 0,
            lineChangeOperator: 0,
            tick12: Math.floor(degree360 / 30),
            fibonacciPosition: Math.floor(degree360 / 6),
            fibonacciDigit: 0,
            fibonacciPhase01: (degree360 % 6) / 6
        }));
        const projection = parseLensCodonBinaryProjection({
            lensId: 7,
            lensRole: 'derived-aperture',
            groundingLensId: 16,
            segment,
            perDegree
        });

        expect(projection.lensId).toBe(7);
        expect(projection.segment).toHaveLength(24);
        expect(projection.perDegree[0].charges).toEqual({ pp: 18, nn: -6, np: 6, pn: 6 });
        expect(KERNEL_BRIDGE_CAPABILITIES).toContain('kernelBridge.m3.lensCodonBinary(lensId)');
        expect(() => parseLensCodonBinaryProjection({
            ...projection,
            perDegree: [
                { ...projection.perDegree[0], charges: { pp: 1, mm: 2, mp: 3, pm: 4 } },
                ...projection.perDegree.slice(1)
            ]
        })).toThrow(/pp\/nn\/np\/pn/);
        expect(() => parseLensCodonBinaryProjection({
            ...projection,
            segment: projection.segment.slice(0, 23),
            perDegree: projection.perDegree.slice(0, 23)
        })).toThrow(/24 canonical lens boundaries/);
        const groundSegment = Array.from({ length: 60 }, (_, position) => position * 6);
        const ground = parseLensCodonBinaryProjection({
            ...projection,
            lensId: 16,
            lensRole: 'primary-ground',
            segment: groundSegment,
            perDegree: groundSegment.map((degree360, fibonacciPosition) => ({
                ...projection.perDegree[0],
                degree360,
                exactDegree720: degree360 * 2,
                tick12: Math.floor(degree360 / 30),
                fibonacciPosition,
                fibonacciDigit: 0,
                fibonacciPhase01: 0
            }))
        });
        expect(ground.perDegree).toHaveLength(60);
        expect(() => parseLensCodonBinaryProjection({ ...ground, lensId: 17 })).toThrow(/0\.\.16/);
    });
});

// isChimeCoherent reads exactly `frame.m3.worldClockBinding` — the same nested
// path App.tsx feeds to strikeRouter.onChime — so a minimal frame carrying that
// binding exercises the real read path (not a re-shaped mock).
const frame = (
    binding: M123ChimeWorldClockBindingBoundary | undefined
): M123ChimeFrameBoundary =>
    ({ m3: binding ? { worldClockBinding: binding } : {} }) as unknown as M123ChimeFrameBoundary;

describe('isChimeCoherent (bell-kernel spec §5 / T49.5 world-clock binding)', () => {
    it('is coherent when the world clock is ready and both match flags hold', () => {
        expect(
            isChimeCoherent(
                frame({ state: 'ready', tickMatchesProfile: true, degree720MatchesProfile: true })
            )
        ).toBe(true);
    });

    it('is coherent while pending — a missing world clock carries no mismatch evidence', () => {
        // Pending bindings arrive with both flags false (there is no clock reading to
        // compare against), but that is absence of evidence, not a mismatch — it must
        // not block the strike.
        expect(
            isChimeCoherent(
                frame({ state: 'pending', tickMatchesProfile: false, degree720MatchesProfile: false })
            )
        ).toBe(true);
    });

    it('is incoherent when the world clock is stale', () => {
        expect(
            isChimeCoherent(
                frame({ state: 'stale', tickMatchesProfile: false, degree720MatchesProfile: true })
            )
        ).toBe(false);
    });

    it('is incoherent when the world clock is blocked', () => {
        expect(
            isChimeCoherent(
                frame({ state: 'blocked', tickMatchesProfile: true, degree720MatchesProfile: true })
            )
        ).toBe(false);
    });

    // T49.5: the explicit tick/degree match flags are the readiness authority, not a
    // tautology on `state`. A divergent frame — state claims 'ready' but a flag is
    // false (a malformed / legacy / future-buggy gateway) — must still block.
    it('is incoherent when state claims ready but the tick flag is false (divergence guard)', () => {
        expect(
            isChimeCoherent(
                frame({ state: 'ready', tickMatchesProfile: false, degree720MatchesProfile: true })
            )
        ).toBe(false);
    });

    it('is incoherent when state claims ready but the degree720 flag is false (divergence guard)', () => {
        expect(
            isChimeCoherent(
                frame({ state: 'ready', tickMatchesProfile: true, degree720MatchesProfile: false })
            )
        ).toBe(false);
    });

    it('is incoherent when the m3 world-clock binding is absent', () => {
        expect(isChimeCoherent(frame(undefined))).toBe(false);
        expect(isChimeCoherent(null)).toBe(false);
        expect(isChimeCoherent(undefined)).toBe(false);
    });
});

describe('MonoPolyState shared vocabulary (T37.5 M0↔M2 reconciliation)', () => {
    // Typing this single source as readonly MonoPolyState[] is the compile-time
    // guard that the four-state vocabulary has not drifted from the shared type.
    const STATES: readonly MonoPolyState[] = ['mono', 'actually-many', 'actualising-one', 'monopoly'];

    it('carries exactly the four canonical behaviour-states in dialectic order', () => {
        expect(STATES).toEqual(['mono', 'actually-many', 'actualising-one', 'monopoly']);
    });

    it('the M2 cymatic state speaks the shared MonoPolyState vocabulary', () => {
        // behaviourState is typed MonoPolyState — assignable only from the shared
        // vocab, so the M2 (cymatic) surface and the M0 (dialectic) surface that
        // import MonoPolyState cannot diverge.
        const cymatic: CymaticMonoPolyState = {
            behaviourState: 'actualising-one',
            activeToneCount: 3,
            mutualResonance: 0.5,
            projection64: 12,
        };
        expect(STATES).toContain(cymatic.behaviourState);
    });
});
