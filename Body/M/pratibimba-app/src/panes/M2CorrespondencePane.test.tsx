import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M2CorrespondencePane } from './M2CorrespondencePane';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useReadinessStore } from '../state/readinessStore';
import { useProvenanceStore, useTickStore } from '../state/stores';
import { M2SurfaceProvider } from './M2SurfaceContext';
import { DEFAULT_M2_SURFACE_STATE, type M2SurfaceState } from './m2SurfaceState';

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

// verbatim slice of the real s2.parashaktiCorrespondences artifact (graph.rs)
const ARTIFACT = {
    address72: 17,
    decanFace: {
        name: 'Gemini II',
        zodiacSign: 'Gemini',
        degreesRange: '10°–20° Gemini',
        planetaryRuler: 'Mars',
        bodyPart: 'shoulders',
        tarotCard: '9 of Swords',
        herbalismHerbs: ['vervain', 'lily']
    },
    sacredSonic: {
        name: 'Hahaiah',
        arabicText: 'ٱلْمُصَوِّر',
        englishTranslation: 'The Refuge',
        chakraCorrespondence: 'throat',
        maqam: { name: 'Rast', spiritualFunction: 'protection of thought' },
        // verbatim gate shape (graph.rs asma_overlay_record — snake_case kernel
        // M2_ASMA_LUT algebra + graph-filled mirror_name)
        asma: {
            name_idx: 17,
            group: 2,
            group_name: 'Jamal',
            index_in_group: 5,
            mirror_idx: 35,
            has_mirror: true,
            mirror_relation: 'domain_mirror',
            phase: 'primary',
            phase_law: '#/inversion_spanda',
            mirror_name: 'Yezalel'
        }
    },
    planetaryChakral: {
        // planetaryMode carries the graph's c_0_modal_signature descriptor
        // (PlanetaryHarmonic node), not an invented "diurnal"/"nocturnal" flag —
        // this is the real Mars octave signature verbatim from the live graph.
        planetaryRuler: 'Mars',
        planetaryMode:
            'The E-E octave, manifesting through voices that are "quick, sharp, fierce and menacing."',
        vedicMantra: 'Om Angarakaya Namaha',
        chakraName: 'Manipura',
        chakraRole: 'will and transformation'
    }
};

const invoke = vi.fn(async (method: string) =>
    method === 's2.parashaktiCorrespondences'
        ? ({ artifact: ARTIFACT } as never)
        : ({ artifact: {} } as never)
);

// a real 8+4 profile bus so the cymatic surface / modal digest / asma overlay
// mount against live data (address rides the mocked overlay above at 72:17).
const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const HARMONIC_PROFILE = {
    audioOctet: OCTET,
    nodalQuartet: [
        { m: 1, n: 1 },
        { m: 2, n: 1 },
        { m: 3, n: 2 },
        { m: 1, n: 3 }
    ],
    resonance72: { lensAnchorIndex: 17 },
    kleinFlip: null
};

function M2PaneHarness() {
    const [state, setState] = useState<M2SurfaceState>(DEFAULT_M2_SURFACE_STATE);
    return (
        <M2SurfaceProvider state={state} update={patch => setState(current => ({ ...current, ...patch }))}>
            <M2CorrespondencePane />
        </M2SurfaceProvider>
    );
}

function renderPane() {
    return render(<M2PaneHarness />);
}

describe('M2CorrespondencePane', () => {
    beforeEach(() => {
        vi.mocked(buildPentadicOverlay).mockReturnValue(READY_OVERLAY);
        invoke.mockClear();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useTickStore.setState({
            profile: { generation: 1, profile: { harmonicProfile: HARMONIC_PROFILE } } as never,
            generation: 1
        });
        useReadinessStore.setState({
            bindings: {
                's2.parashaktiCorrespondences': { state: 'ready_public_current' }
            }
        });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        useReadinessStore.getState().clear();
    });

    it('reads the live 72-address off the trace and shows its decan correspondence', async () => {
        renderPane();
        expect(screen.getByTestId('corr-address').textContent).toBe('72:17');
        await waitFor(() => expect(screen.getByTestId('corr-decan')).toBeTruthy());
        expect(invoke).toHaveBeenCalledWith('s2.parashaktiCorrespondences', { address72: 17 });
        const decan = screen.getByTestId('corr-decan');
        expect(decan.textContent).toContain('Gemini');
        expect(decan.textContent).toContain('Mars');
        expect(decan.textContent).toContain('9 of Swords');
        expect(decan.textContent).toContain('vervain, lily');
    });

    it('navigates between the three correspondence faces of the conserved address', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-sonic'));
        const sonic = await screen.findByTestId('corr-sonic');
        expect(sonic.textContent).toContain('The Refuge');
        expect(sonic.textContent).toContain('Jamal');
        expect(sonic.textContent).toContain('Yezalel');
        expect(screen.queryByTestId('corr-decan')).toBeNull();

        fireEvent.click(screen.getByTestId('corr-nav-planetary'));
        const planetary = await screen.findByTestId('corr-planetary');
        expect(planetary.textContent).toContain('E-E octave');
        expect(planetary.textContent).toContain('Manipura');
    });

    it('keeps S2 provenance and live readiness at every rendered correspondence card', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        const assertCardBinding = (face: string, readiness: string) => {
            const card = screen.getByTestId(`corr-card-${face}`);
            expect(card.getAttribute('data-provenance')).toBe('s2.parashaktiCorrespondences');
            expect(card.querySelector('[data-binding="s2.parashaktiCorrespondences"]')?.getAttribute('data-readiness')).toBe(
                readiness
            );
        };

        assertCardBinding('decan', 'ready_public_current');
        fireEvent.click(screen.getByTestId('corr-nav-sonic'));
        await screen.findByTestId('corr-sonic');
        assertCardBinding('sonic', 'ready_public_current');
        fireEvent.click(screen.getByTestId('corr-nav-planetary'));
        await screen.findByTestId('corr-planetary');
        assertCardBinding('planetary', 'ready_public_current');

        useReadinessStore.getState().reportBinding('s2.parashaktiCorrespondences', {
            state: 's2_graph_blocked',
            reason: 'S2 graph projection is temporarily unavailable'
        });
        await waitFor(() => assertCardBinding('planetary', 's2_graph_blocked'));
        expect(screen.getByTestId('corr-card-planetary').textContent).toContain(
            'S2 graph projection is temporarily unavailable'
        );
    });

    it('mounts the cymatic surface, asma overlay, and modal digest as the cymatic face', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-cymatic'));
        const cymatic = await screen.findByTestId('corr-cymatic');
        // all three authored+tested components are actually rendered mounted
        expect(cymatic.querySelector('[data-testid="cymatic-field"]')).toBeTruthy();
        expect(screen.getByTestId('asma-mirror-overlay')).toBeTruthy();
        expect(screen.getByTestId('modal-digest-strip')).toBeTruthy();
        // the asma overlay rides the SAME conserved 72-address the pane reads
        expect(screen.getByTestId('asma-address').textContent).toBe('72:17');
        // and the fetched correspondence record's asma maps into the overlay
        await waitFor(() =>
            expect(screen.getByTestId('asma-mirror').textContent).toContain('Yezalel')
        );
        expect(screen.getByTestId('asma-name').textContent).toContain('Jamal');
    });

    it('holds the M2 cymatic field at its paused profile frame while the live tick advances', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');
        fireEvent.click(screen.getByTestId('corr-nav-cymatic'));
        const field = await screen.findByTestId('cymatic-field');
        expect(field.getAttribute('data-generation')).toBe('1');

        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        act(() => {
            useTickStore.setState({
                profile: { generation: 2, profile: { harmonicProfile: HARMONIC_PROFILE } } as never,
                generation: 2
            });
        });

        expect(screen.getByTestId('cymatic-paused-tick').textContent).toContain('1');
        expect(screen.getByTestId('cymatic-field').getAttribute('data-generation')).toBe('1');
        expect(screen.getByTestId('cymatic-transport').getAttribute('data-cache-state')).toBe(
            'pending-tick-snapshot-cache'
        );
    });

    it('mounts the six-axis decoder tree and decodes the live address', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-axes'));
        const tree = await screen.findByTestId('six-axis-tree');
        expect(tree).toBeTruthy();
        // the active 72-address leaf is highlighted (real decodeAxisAt over 0..71)
        expect(screen.getByTestId('axis-leaf-17').getAttribute('data-active')).toBe('true');

        // selecting the decan axis surfaces its arithmetic decode + kernel-owned fields
        fireEvent.click(screen.getByTestId('axis-chip-decan'));
        expect(screen.getByTestId('axis-source').textContent).toContain('decan');
        const parts = screen.getByTestId('axis-parts');
        expect(parts.textContent).toContain('decan36'); // 17/2 = 8
        expect(parts.textContent).toContain('8');
        expect(screen.getByTestId('axis-kernel-sourced').textContent).toContain('rulingPlanet');
    });

    it('shows honest absence when no active 72-address rides the bus (never fabricated)', () => {
        vi.mocked(buildPentadicOverlay).mockReturnValue({
            state: 'pending-anuttara-pentadic-trace',
            m1: null,
            m2: null,
            m3: null,
            joinLine: null
        });
        renderPane();
        expect(screen.getByTestId('m2-correspondence').getAttribute('data-state')).toBe('pending');
        expect(invoke).not.toHaveBeenCalled();
        expect(screen.queryByTestId('corr-decan')).toBeNull();
    });
});
