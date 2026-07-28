import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M2CorrespondencePane } from './M2CorrespondencePane';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { PENTADIC_TRACE_FIXTURE } from '../test/pentadicTraceFixture';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useReadinessStore } from '../state/readinessStore';
import { useProvenanceStore } from '../state/stores';
import { M2SurfaceProvider } from './M2SurfaceContext';
import { DEFAULT_M2_SURFACE_STATE, type M2SurfaceState } from './m2SurfaceState';
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
    },
    bridge72: {
        address72: 17,
        hexagramId: 15,
        halfDecan: 8,
        decan: { index: 8, label: 'Gemini Decan 3', provenance: 'kernel-lut' },
        planet: { id: 7, name: 'Mars', provenance: 'M2_PLANET_LUT' },
        chakra: { id: 3, name: 'Manipura', provenance: 'PLANET_CHAKRA' },
        bodyZone: {
            zones: ['solar_plexus', 'upper_abdomen'],
            provenance: 'CHAKRA_BODY_ZONES'
        },
        epogdoon: { ratio: '9:8', provenance: 'kernelBridge.m2.epogdoonProjection(address72)' }
    },
    sixSonicCards: {
        provenance: 'kernel-lut + live-graph-enrichment',
        decanFace: {
            face: 'shadow',
            tattva: { glyph: 'T9↑' },
            tattvicThroughline: [
                { alchemical: 'Aether', tattvic: 'Akasha', marker: 'prima-materia' },
                { alchemical: 'Salt', tattvic: 'Akasha', marker: 'ultima-materia' }
            ]
        },
        shemPair: {
            light: { name: 'Hahaiah', choir: 1, position: 7, meaning: 'refuge', provenance: 'live-graph' },
            shadow: { name: 'Yezalel', choir: 1, position: 8, meaning: 'reconciliation', provenance: 'live-graph' }
        },
        maqam: { family: 'Bayati', modeInFamily: 0, intervals: [3, 3, 4, 4, 3, 4, 3], planetRuler: 'Sun' },
        mantra: { phoneme: 'Aa', frequencyHz: 364, phase: 'Matrika', element: 'Akasha' },
        asma: { group: 'Jamal', mirror: 'Yezalel', maskRouting: { internal: true, projective: false } },
        planetaryChakral: { coustoHz: 144, digitalRoot: 9, chakra: 3, element: 'Agni', keplerianVelocity: 35999 }
    },
    correspondenceTree: {
        mantraOverlay: Array.from({ length: 100 }, (_, index) => ({
            index,
            frequencyHz: 144 + index,
            phase: index < 50 ? 'Matrika' : 'Malini',
            element: 'Akasha'
        })),
        asmaOverlay: Array.from({ length: 100 }, (_, index) => ({
            index,
            group: index === 99 ? 'Hidden' : 'Jalal',
            maskRouting: { internal: index < 36, projective: index >= 36 }
        })),
        planetaryKeying: Array.from({ length: 10 }, (_, index) => ({
            index,
            name: `planet-${index}`,
            coustoHz: 144 + index,
            element: 'Akasha',
            chakra: index % 8,
            isOuter: index >= 7
        })),
        psychoidPlanetary: [
            { planetId: 4, planet: 'Mars', l0PrimePosition: 4, archetypalNumber: 5, archetypalRole: 'Transcendence-Pentad' }
        ]
    }
};

const CYMATIC_MONOPOLY_ARTIFACT = {
    behaviourState: 'actualising-one',
    activeToneCount: 4,
    mutualResonance: 0.6,
    projection64: 19,
    contract: 'kernelBridge.m2.cymaticMonoPolyState(address72)',
    runtimeOwner: 'S0',
    source: 'portal-core'
};

const PENDING_SHADOW_DECAN_SURFACE = {
    coordinate: '#2-3',
    primaryDecans: Array.from({ length: 36 }, (_, decanIndex) => ({
        decanIndex,
        coordinate: `M2-3-${decanIndex}`,
        label: `Primary ${decanIndex + 1}`,
        sourceHandle: `kernel://m2/decan/primary/${decanIndex}`,
        provenance: 'kernel-lut' as const
    })),
    lightDecans: Array.from({ length: 36 }, (_, decanIndex) => ({
        decanIndex,
        coordinate: `M2-3-${decanIndex}`,
        label: `Light ${decanIndex + 1}`,
        sourceHandle: `kernel://m2/decan/light/${decanIndex}`,
        provenance: 'kernel-lut' as const
    })),
    primaryDescriptors: [],
    shadowProperDescriptors: [],
    tarotReversedMeanings: [],
    tarotReversedMeaning: {
        coordinate: '#3-4',
        requiredGatewayMethod: 'kernelBridge.m3.tarotReversedMeaning',
        state: 'pending',
        reason: 'provider not registered'
    },
    pending: { shadowDecanGraph: true, tarotReversedMeaning: true },
    visibleCellCount: 72
};

const invoke = vi.fn(async (method: string, params?: { readonly includeShadowDecans?: boolean }) =>
    method === 's2.parashaktiCorrespondences'
        ? ({
              artifact: params?.includeShadowDecans
                  ? { ...ARTIFACT, shadowDecanSurface: PENDING_SHADOW_DECAN_SURFACE }
                  : ARTIFACT
          } as never)
        : method === 'kernelBridge.m2.cymaticMonoPolyState(address72)'
          ? ({ artifact: CYMATIC_MONOPOLY_ARTIFACT } as never)
          : ({ artifact: {} } as never)
);

// a real 8+4 profile bus so the cymatic surface / modal digest / asma overlay
// mount against live data (address rides the mocked overlay above at 72:17).
const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const CYMATIC_SPHERES_PROJECTION = {
    chakras: Array.from({ length: 8 }, (_, chakraId) => ({
        chakraId,
        name: chakraId === 0 ? 'Earth/Ground' : `chakra-${chakraId}`,
        elementId: chakraId === 0 || chakraId > 5 ? null : chakraId % 5,
        tattvaIndex: chakraId > 0 && chakraId < 6 ? 36 - chakraId : null,
        meaningId: 0x0380 + chakraId,
        harmonic: {
            degree: 2 + (chakraId % 2),
            order: 1,
            amplitudeHz: OCTET[chakraId],
            qlPosition: chakraId % 2 === 0 ? 0 : 5,
            helix: chakraId % 2 === 0 ? 'bimba' : 'pratibimba'
        },
        provenance: 'M2_CHAKRA_LUT[8] + profile audioOctet/nodalQuartet'
    })),
    earthObserver: {
        ordinal: 10,
        name: 'Earth',
        role: 'observer-centre',
        position: [0, 0, 0],
        provenance: 'EarthBodyState + DR-M2-1/DCC-03'
    },
    sun: {
        planetId: 0,
        name: 'Sun',
        degree: 15,
        retrograde: false,
        elementId: 2,
        provenance: 'M2_PLANET_LUT[10] + Kerykeion live sky'
    },
    activePlanet: {
        planetId: 4,
        name: 'Mars',
        degree: 95,
        retrograde: false,
        elementId: 2,
        provenance: 'M2_PLANET_LUT[10] + Kerykeion live sky'
    },
    epogdoonRatio: '9:8',
    provenance: 'portal-core::f_routing + M2 substrate projection'
};
const HARMONIC_PROFILE = {
    audioOctet: OCTET,
    nodalQuartet: [
        { m: 1, n: 1 },
        { m: 2, n: 1 },
        { m: 3, n: 2 },
        { m: 1, n: 3 }
    ],
    resonance72: { lensAnchorIndex: 17 },
    kleinFlip: null,
    cymaticSpheres: CYMATIC_SPHERES_PROJECTION
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
        // Clear the clock first: a case that advanced to a later generation
        // would otherwise leave the store refusing this frame as stale.
        resetProfileTicks();
        publishProfileTick({ generation: 1, profile: { harmonicProfile: HARMONIC_PROFILE } } as never);
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

    it('requests the typed 108-decan aggregate only when the decan reveal opens', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');
        expect(invoke).toHaveBeenCalledWith('s2.parashaktiCorrespondences', { address72: 17 });

        fireEvent.click(screen.getByTestId('shadow-decan-reveal'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('s2.parashaktiCorrespondences', {
                address72: 17,
                includeShadowDecans: true
            })
        );

        const surface = await screen.findByTestId('shadow-decan-surface');
        expect(surface.getAttribute('data-visible-cell-count')).toBe('72');
        expect(screen.getByTestId('pending-shadow-decan-graph')).toBeTruthy();
        expect(screen.getByTestId('pending-tarot-reversed-meaning')).toBeTruthy();
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
        fireEvent.click(screen.getByTestId('planetary-view-psychoid'));
        expect(planetary.textContent).toContain('Transcendence-Pentad');
        expect(planetary.textContent).toContain('5');
    });

    it('mounts the epogdoon proof panel on the planetary card when the persisted M2 preference enables it', async () => {
        function ProofPaneHarness() {
            const [state, setState] = useState<M2SurfaceState>({
                ...DEFAULT_M2_SURFACE_STATE,
                activeFace: 'planetary',
                epogdoonProofMode: true
            });
            return (
                <M2SurfaceProvider state={state} update={patch => setState(current => ({ ...current, ...patch }))}>
                    <M2CorrespondencePane />
                </M2SurfaceProvider>
            );
        }

        render(<ProofPaneHarness />);
        await screen.findByTestId('corr-planetary');
        expect(screen.getByTestId('epogdoon-proof-identity').textContent).toBe('7/4 = (72 - 9) / 36');
        expect(screen.getByTestId('epogdoon-address-decomposition').textContent).toContain('17 = 9 x 1 + 8');
    });

    it('renders the kernel-backed 72-fold bridge from hexagram through the chakra body zones', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-bridge'));

        const bridge = await screen.findByTestId('seventy-two-fold-breadcrumb');
        expect(bridge.textContent).toContain('15');
        expect(bridge.textContent).toContain('Gemini Decan 3');
        expect(bridge.textContent).toContain('Mars');
        expect(bridge.textContent).toContain('Manipura');
        expect(bridge.textContent).toContain('solar_plexus');
        expect(bridge.textContent).toContain('9:8');
    });

    it('renders the six kernel-authored sacred-sonic cards from one correspondence receipt', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-sonic'));
        await screen.findByTestId('corr-sonic');

        expect(screen.getByTestId('sonic-card-Decan face').textContent).toContain('T9↑');
        expect(screen.getByTestId('sonic-card-Shem pair').textContent).toContain('Hahaiah');
        expect(screen.getByTestId('sonic-card-Maqam').textContent).toContain('3 · 3 · 4');
        expect(screen.getByTestId('sonic-card-Mantra').textContent).toContain('364 Hz');
        expect(screen.getByTestId('sonic-card-Asma').textContent).toContain('internal yes');
        expect(screen.getByTestId('sonic-card-Planetary-chakral').textContent).toContain('35999 arcsec/day x10');
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
        expect(screen.getByTestId('cymatic-field').getAttribute('data-surface-variant')).toBe('plate');
        expect(screen.getByTestId('cymatic-field').getAttribute('data-address72')).toBe('17');
        expect(screen.getByTestId('cymatic-field').getAttribute('data-element')).toBe('Agni');
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

    it('renders all eight profile-authored spheres and switches without falling back to the plate', async () => {
        function SpheresPaneHarness() {
            const [state, setState] = useState<M2SurfaceState>({
                ...DEFAULT_M2_SURFACE_STATE,
                activeFace: 'cymatic',
                layerCSurfaceVariant: 'spheres'
            });
            return (
                <M2SurfaceProvider state={state} update={patch => setState(current => ({ ...current, ...patch }))}>
                    <M2CorrespondencePane />
                </M2SurfaceProvider>
            );
        }

        render(<SpheresPaneHarness />);
        await screen.findByTestId('corr-cymatic');
        const spheres = await screen.findByTestId('cymatic-spheres');
        expect(spheres.getAttribute('data-generation')).toBe('1');
        expect(spheres.getAttribute('data-active-planet')).toBe('Mars');
        expect(screen.getAllByTestId('cymatic-chakra-sphere')).toHaveLength(8);
        expect(screen.queryByTestId('cymatic-field')).toBeNull();

        fireEvent.click(screen.getByTestId('cymatic-variant-plate'));
        expect(await screen.findByTestId('cymatic-field')).toBeTruthy();
        expect(screen.queryByTestId('cymatic-spheres')).toBeNull();

        fireEvent.click(screen.getByTestId('cymatic-variant-spheres'));
        expect(await screen.findByTestId('cymatic-spheres')).toBeTruthy();

        act(() => {
            publishProfileTick({
                    generation: 2,
                    profile: { harmonicProfile: HARMONIC_PROFILE }
                } as never);
        });
        await waitFor(() =>
            expect(screen.getByTestId('cymatic-spheres').getAttribute('data-generation')).toBe('2')
        );
    });

    it('renders a provenance-aware blocked state for a missing spheres projection', async () => {
        // A later frame than the beforeEach seed — same generation would be
        // refused as stale and this case would silently read the seed instead.
        publishProfileTick({
                generation: 2,
                profile: {
                    harmonicProfile: {
                        ...HARMONIC_PROFILE,
                        cymaticSpheres: undefined
                    }
                }
            } as never);

        function BlockedSpheresPaneHarness() {
            const [state, setState] = useState<M2SurfaceState>({
                ...DEFAULT_M2_SURFACE_STATE,
                activeFace: 'cymatic',
                layerCSurfaceVariant: 'spheres'
            });
            return (
                <M2SurfaceProvider state={state} update={patch => setState(current => ({ ...current, ...patch }))}>
                    <M2CorrespondencePane />
                </M2SurfaceProvider>
            );
        }

        render(<BlockedSpheresPaneHarness />);
        const blocked = await screen.findByTestId('cymatic-spheres-blocked');
        expect(blocked.getAttribute('data-provenance')).toBe(
            'profile.harmonicProfile.cymaticSpheres'
        );
        expect(blocked.textContent).toContain('F_routing planetary-hour ruler');
        expect(screen.queryByTestId('cymatic-field')).toBeNull();
    });

    it('renders the kernel-returned MonoPoly state on the active cymatic surface', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');

        fireEvent.click(screen.getByTestId('corr-nav-cymatic'));
        await screen.findByTestId('corr-cymatic');

        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('kernelBridge.m2.cymaticMonoPolyState(address72)', {
                address72: 17
            })
        );
        expect(screen.getByTestId('cymatic-field').getAttribute('data-behaviour-state')).toBe('actualising-one');
        expect(screen.getByTestId('cymatic-monopoly-state').getAttribute('data-behaviour-state')).toBe(
            'actualising-one'
        );
        expect(screen.getByTestId('cymatic-forced-lock-warning')).toBeTruthy();
    });

    it('holds the M2 cymatic field at its paused profile frame while the live tick advances', async () => {
        renderPane();
        await screen.findByTestId('corr-decan');
        fireEvent.click(screen.getByTestId('corr-nav-cymatic'));
        const field = await screen.findByTestId('cymatic-field');
        expect(field.getAttribute('data-generation')).toBe('1');

        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        act(() => {
            publishProfileTick({ generation: 2, profile: { harmonicProfile: HARMONIC_PROFILE } } as never);
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
        expect(await screen.findByTestId('m2-mef-grid')).toBeTruthy();
        const tree = await screen.findByTestId('six-axis-tree');
        expect(tree).toBeTruthy();
        // the active 72-address leaf is highlighted (real decodeAxisAt over 0..71)
        expect(screen.getByTestId('axis-leaf-17').getAttribute('data-active')).toBe('true');

        // selecting the decan axis surfaces its arithmetic decode + kernel-owned fields
        fireEvent.click(screen.getByTestId('axis-chip-decan'));
        expect(screen.getAllByTestId('axis-source').at(-1)?.textContent).toContain('decan');
        const parts = screen.getAllByTestId('axis-parts').at(-1)!;
        expect(parts.textContent).toContain('decan36'); // 17/2 = 8
        expect(parts.textContent).toContain('8');
        expect(screen.getAllByTestId('axis-kernel-sourced').at(-1)?.textContent).toContain('rulingPlanet');

        fireEvent.click(screen.getByTestId('overlay-tab-asma'));
        expect(screen.getByTestId('axis-overlay-leaves').querySelectorAll('.axis-leaf')).toHaveLength(100);
        expect(screen.getByTestId('axis-overlay-leaf-0').textContent).toContain('internal');
        expect(screen.getByTestId('planetary-keying').querySelectorAll('[data-testid^="planetary-key-"]')).toHaveLength(10);
    });

    it('shows honest absence when no active 72-address rides the bus (never fabricated)', () => {
        vi.mocked(buildPentadicOverlay).mockReturnValue({
            state: 'pending-anuttara-pentadic-trace',
            m1: null,
            m2: null,
            m3: null,
            epogdoon: null,
            joinLine: null
        });
        renderPane();
        expect(screen.getByTestId('m2-correspondence').getAttribute('data-state')).toBe('pending');
        expect(invoke).not.toHaveBeenCalled();
        expect(screen.queryByTestId('corr-decan')).toBeNull();
    });
});
