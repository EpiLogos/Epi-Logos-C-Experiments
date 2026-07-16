import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M2CorrespondencePane } from './M2CorrespondencePane';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore, useTickStore } from '../state/stores';

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
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('reads the live 72-address off the trace and shows its decan correspondence', async () => {
        render(<M2CorrespondencePane />);
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
        render(<M2CorrespondencePane />);
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

    it('mounts the cymatic surface, asma overlay, and modal digest as the cymatic face', async () => {
        render(<M2CorrespondencePane />);
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

    it('mounts the six-axis decoder tree and decodes the live address', async () => {
        render(<M2CorrespondencePane />);
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
        render(<M2CorrespondencePane />);
        expect(screen.getByTestId('m2-correspondence').getAttribute('data-state')).toBe('pending');
        expect(invoke).not.toHaveBeenCalled();
        expect(screen.queryByTestId('corr-decan')).toBeNull();
    });
});
