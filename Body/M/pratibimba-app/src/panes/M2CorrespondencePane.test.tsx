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
        asma: { group_name: 'Jamal', mirror_name: 'Yezalel', has_mirror: true }
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

describe('M2CorrespondencePane', () => {
    beforeEach(() => {
        vi.mocked(buildPentadicOverlay).mockReturnValue(READY_OVERLAY);
        invoke.mockClear();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useTickStore.setState({ profile: { generation: 1, profile: {} } as never, generation: 1 });
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
