import { describe, expect, it } from 'vitest';
import {
    isChimeCoherent,
    type CymaticMonoPolyState,
    type M123ChimeFrameBoundary,
    type M123ChimeWorldClockBindingBoundary,
    type MonoPolyState,
} from './types';

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
