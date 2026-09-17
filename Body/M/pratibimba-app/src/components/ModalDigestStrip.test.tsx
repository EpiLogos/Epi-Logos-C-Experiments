import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalDigestStrip } from './ModalDigestStrip';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { PENTADIC_TRACE_FIXTURE } from '../test/pentadicTraceFixture';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore } from '../state/stores';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

vi.mock('../engine/cosmicPentadicOverlay', () => ({
    buildPentadicOverlay: vi.fn()
}));

const READY_OVERLAY = {
    state: 'ready' as const,
    m1: null,
    m2: { resonance72Index: 17, shemDegreeQuantum: 5 },
    m3: null,
    joinLine: null
};

const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const QUARTET = [
    { m: 1, n: 1 },
    { m: 2, n: 1 },
    { m: 3, n: 2 },
    { m: 1, n: 3 }
];

// a real profile bus — the packet/digest below are computed for real, only the
// address-routing overlay is stubbed (it is exercised in its own suite).
const HARMONIC_PROFILE = {
    audioOctet: OCTET,
    nodalQuartet: QUARTET,
    resonance72: { lensAnchorIndex: 17 },
    modalResonator: {
        schemaVersion: 1,
        liveOctet: OCTET.map((hz, octetIndex) => ({ octetIndex, hz })),
        bellPartials: ['hum', 'prime', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue'].map(
            (role, octetIndex) => ({ octetIndex, role })
        ),
        m2Address72: { address72: 17 },
        lensMode: { lens: 2, mode: 3, lensModeIndex: 17 }
    }
};

// verbatim slice of the real s2.parashaktiCorrespondences artifact (graph.rs)
const ARTIFACT = {
    address72: 17,
    sacredSonic: { maqam: { name: 'Rast', spiritualFunction: 'protection of thought' } },
    planetaryChakral: {
        planetaryMode:
            'The E-E octave, manifesting through voices that are "quick, sharp, fierce and menacing."'
    }
};

const invoke = vi.fn(async (method: string) =>
    method === 's2.parashaktiCorrespondences'
        ? ({ artifact: ARTIFACT } as never)
        : ({ artifact: {} } as never)
);

describe('ModalDigestStrip (49.4 — modal labels + cymatic digest, visual only)', () => {
    beforeEach(() => {
        vi.mocked(buildPentadicOverlay).mockReturnValue({
            ...READY_OVERLAY,
            m2: {
                ...READY_OVERLAY.m2!,
                address72: PENTADIC_TRACE_FIXTURE.thirdSpanda.m2.address72,
                axisViews: PENTADIC_TRACE_FIXTURE.thirdSpanda.m2.axisViews
            },
            epogdoon: {
                blockPhase: 6,
                collisionPair: null,
                roundTripLoss: 1,
                roundTripExact: false
            }
        });
        invoke.mockClear();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        publishProfileTick({ generation: 4, profile: { harmonicProfile: HARMONIC_PROFILE } } as never);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        resetProfileTicks();
    });

    it('renders the exact 8-carrier audio bus from the profile — visual only, no audio output', () => {
        render(<ModalDigestStrip />);
        const strip = screen.getByTestId('modal-digest-strip');
        expect(strip.getAttribute('data-audio-output')).toBe('none');
        const channels = strip.querySelectorAll('.m2-modal-digest__channel');
        expect(channels).toHaveLength(8);
        expect((channels[0] as HTMLElement).getAttribute('data-hz')).toBe(String(OCTET[0]));
        expect((channels[7] as HTMLElement).getAttribute('data-hz')).toBe(String(OCTET[7]));
        expect(screen.getByText('visual representation only')).toBeTruthy();
    });

    it('constructs no browser audio context — the surface is representational only', () => {
        const AudioContextSpy = vi.fn();
        (globalThis as Record<string, unknown>).AudioContext = AudioContextSpy;
        (globalThis as Record<string, unknown>).webkitAudioContext = AudioContextSpy;
        render(<ModalDigestStrip />);
        expect(AudioContextSpy).not.toHaveBeenCalled();
        delete (globalThis as Record<string, unknown>).AudioContext;
        delete (globalThis as Record<string, unknown>).webkitAudioContext;
    });

    it('surfaces the cymatic digest byte-hash for the live bus', () => {
        render(<ModalDigestStrip />);
        expect(screen.getByTestId('digest-hash').textContent).toMatch(/^χ [0-9a-f]{8}$/);
        expect(screen.getByTestId('cymatic-digest')).toBeTruthy();
    });

    it('reads the maqam and mode labels through the s2 gateway seam for the live 72-address', async () => {
        render(<ModalDigestStrip />);
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('s2.parashaktiCorrespondences', { address72: 17 })
        );
        await waitFor(() =>
            expect(screen.getByTestId('modal-maqam').textContent).toContain('Rast')
        );
        expect(screen.getByTestId('modal-mode').textContent).toContain('E-E octave');
        expect(screen.getByTestId('modal-digest-strip').getAttribute('data-state')).toBe('ready');
    });

    it('shows honest pending (—) and calls no gateway when no profile bus rides the tick', () => {
        resetProfileTicks();
        render(<ModalDigestStrip />);
        const strip = screen.getByTestId('modal-digest-strip');
        expect(strip.getAttribute('data-state')).toBe('pending');
        expect(strip.getAttribute('data-audio-output')).toBe('none');
        expect(invoke).not.toHaveBeenCalled();
    });

    it('does not fabricate labels when the graph has no descriptor — the bus still renders', async () => {
        invoke.mockImplementationOnce(async () => ({ artifact: {} }) as never);
        render(<ModalDigestStrip />);
        await waitFor(() => expect(invoke).toHaveBeenCalled());
        expect(screen.getByTestId('modal-maqam').textContent).toContain('—');
        // the exact bus is still surfaced from the profile authority
        expect(screen.getByTestId('modal-digest-strip').querySelectorAll('.m2-modal-digest__channel')).toHaveLength(8);
    });
});
