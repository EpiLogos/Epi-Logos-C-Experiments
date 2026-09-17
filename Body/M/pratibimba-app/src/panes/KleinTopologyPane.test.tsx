import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KleinTopologyPane } from './KleinTopologyPane';
import { topologyFromPayload } from './m1KleinTopology';

import { KernelBridgeCachedProfile } from '../bridge/types';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

// A real-shaped bridge profile: the payload mirrors portal-core
// `MathemeHarmonicProfile` serialised as JSON, carrying the `m1Topology`
// block the T2.3 substrate producer now emits (doubleCoverDeg=720,
// torusGenus=1) plus the live `kleinFlip` / `anandaVortex` fields.
function profileFixture(kleinFlip: unknown, generation: number): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: 0,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: {
            tick12: 6,
            m1Topology: {
                doubleCoverDeg: 720,
                torusGenus: 1,
                torusKnotPhase: { p: 0.25, q: 0.5 },
                eulerCharacteristic: 0,
                hopfIdentity: 'S3 -> S2 Hopf fibration',
                k2TritoneCrossing: 'K² lens-tritone crossing at tick 6: lens pair (0, 6) (6-semitone fold)',
                m1OriginKleinFlip: 'M1-origin Klein flip present (bimba<->pratibimba half-turn)',
                parentAttribution: 'M1-5 is the +1 parent',
                priorGround: 'M0 is the prior 0/1 ground',
                downstreamDoubleTorus: 'Double-torus delegated to M3-5'
            },
            kleinFlip,
            anandaVortex: { kleinFlipAtThisTick: kleinFlip !== null }
        }
    };
}

const M1_TRITONE_CROSSING = { kind: 'm1TritoneCrossing', tick12: 6, lensPair: [0, 6] };

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

describe('KleinTopologyPane', () => {
    it('renders the M1-5 single-torus invariants doubleCoverDeg=720 torusGenus=1 from the bridge', () => {
        publishProfileTick(profileFixture(null, 41));
        render(<KleinTopologyPane />);

        const invariants = screen.getByTestId('m1-klein-double-cover');
        expect(invariants.textContent).toContain('DOUBLE_COVER_DEG=720');
        expect(invariants.textContent).toContain('TORUS_GENUS=1');
        expect(screen.getByTestId('m1-torus-knot-phase').textContent).toBe('(p,q)=(0.25,0.5)');
    });

    it('keeps a missing or malformed torus-knot pair pending instead of deriving a local phase', () => {
        expect(topologyFromPayload({ m1Topology: { torusKnotPhase: { p: 0.25 } } }).torusKnotPhase).toBeNull();
        expect(topologyFromPayload({ m1Topology: { torusKnotPhase: { p: 0.25, q: 0.5 } } }).torusKnotPhase).toEqual({
            p: 0.25,
            q: 0.5
        });
    });

    it('fires an m1.klein_flip.source observability event when the profile carries klein_flip=Some(..)', () => {
        const emit = vi.fn();
        publishProfileTick(profileFixture(M1_TRITONE_CROSSING, 42));
        render(<KleinTopologyPane onObservabilityEvent={emit} />);

        expect(emit).toHaveBeenCalledTimes(1);
        const event = emit.mock.calls[0][0];
        expect(event.type).toBe('m1.klein_flip.source');
        expect(event.payload.doubleCoverDeg).toBe(720);
        expect(event.payload.torusGenus).toBe(1);
        expect(event.payload.profileGeneration).toBe(42);

        // The M1-origin flip surfaces in the widget body too.
        expect(screen.getByTestId('m1-klein-flip-source').textContent).toContain('M1-origin Klein flip present');
    });

    it('does NOT fire the observability event when klein_flip is None', () => {
        const emit = vi.fn();
        publishProfileTick(profileFixture(null, 43));
        render(<KleinTopologyPane onObservabilityEvent={emit} />);

        expect(emit).not.toHaveBeenCalled();
        expect(screen.getByTestId('m1-klein-flip-source').textContent).toContain('klein_flip = None');
    });

    it('shows the blocked empty state until the bridge delivers a profile', () => {
        render(<KleinTopologyPane />);
        expect(screen.queryByTestId('m1-klein-topology')).toBeNull();
        expect(screen.getByText(/No MathemeHarmonicProfile available yet/)).toBeTruthy();
    });
});
