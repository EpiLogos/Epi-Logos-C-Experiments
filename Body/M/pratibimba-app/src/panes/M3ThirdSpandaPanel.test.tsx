import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { M3ThirdSpandaPanel } from './M3ThirdSpandaPanel';
import {
    QCD_OCTET_SINGLET_FORM,
    THIRD_SPANDA_FORMS
} from '../engine/compositionMatheme';
import { buildCouplingFlowOverlay } from '../engine/couplingFlowOverlay';
import type { AnuttaraPentadicRuntimeTrace } from '../bridge/types';

afterEach(cleanup);

describe('M3ThirdSpandaPanel', () => {
    it('renders the live M1→M2→M3 process before the static reference forms', () => {
        const trace = {
            tick: 31,
            tick12: 7,
            helix: 1,
            position6: 1,
            sourceBinaryState: '0/1',
            wholeNumberEndpoint: 5,
            naturalNumberEndpoint: 6,
            familyBComplement: [1, 4],
            shemDegreeQuantum: 5,
            resonance72Index: 42,
            degree360: 210,
            m2ToM3Symbol: 37,
            mahamayaAddress64: 37,
            codonId: 37,
            codon: 'GTC',
            lineChangeOperator: 251,
            pairedMahamayaFifteens: [15, 15],
            backboneIdentity: '24x15=360',
            lineGraphIdentity: '360+24=384',
            qCosmicRef: 'q_cosmic://tick/31',
            thirdSpanda: {
                m1: {
                    priorGround: 'M0 is the prior 0/1 ground',
                    parentAttribution: 'M1-5 is the +1 parent',
                    degree720: 420,
                    hopfFiber: 1,
                    ringQuaternion: [-0.8660254, -0.5, 0, 0],
                    advancementAddress64: 35
                },
                m2: {
                    address72: 42,
                    axisViews: {
                        mef: { lens: 7, position: 0, isInverted: true, lFamilyLink: 1 },
                        tattva: { tattvaIndex: 21, phase: 0 },
                        decan: { elementId: 0, sign: 1, decan: 0, face: 0, rulingPlanet: 3 },
                        shem: { shemIdx: 42, choir: 4, position: 6, elementId: 2, decanLink: 42 },
                        maqam: { index72: 42, family: 5, modeInFamily: 5, planetRuler: 3 },
                        det: { index72: 42, compressed64: 37, det64: 137438953472 }
                    }
                },
                epogdoon: {
                    ratioNumerator: 9,
                    ratioDenominator: 8,
                    sourceAddress72: 42,
                    blockIndex: 4,
                    blockPhase: 6,
                    compressedAddress64: 37,
                    expandedAddress72: 41,
                    roundTripExact: false,
                    roundTripLoss: 1,
                    collision: null,
                    cardinality: {
                        blockSize: 9,
                        blockCount: 8,
                        collisionPairCount: 8,
                        exactRoundTripCount: 8,
                        nonExactRoundTripCount: 64
                    }
                },
                m3: {
                    detReceptionAddress64: 37,
                    worldClockAddress64: 37,
                    codonId: 37,
                    codon: 'GTC',
                    codonRotation: {
                        lens: 7,
                        mode: 0,
                        lensLabel: "L1'",
                        modeName: 'Ionian',
                        surfaceIndex: 394,
                        codonId: 53,
                        codon: 'TCC',
                        codonClass: 'non-dual',
                        rotation: 2,
                        rotationalStateCount: 7,
                        rotationDegrees: 90,
                        reverseLens: 7,
                        reverseMode: 0,
                        datasetLutState: 'materialized-kernel-lut',
                        provenance: 'portal-core::codon_rotation_projection 84↔472 surface LUT'
                    },
                    transcriptionState: 'compressed-nonexact-round-trip',
                    lineChangeOperator: 251
                }
            },
            provenance: ['portal_core::pentadic_trace::from_profile']
        } as const satisfies AnuttaraPentadicRuntimeTrace;

        render(<M3ThirdSpandaPanel trace={trace} />);

        const runtime = screen.getByTestId('m3-spanda-runtime');
        expect(runtime.textContent).toContain('420°');
        expect(runtime.textContent).toContain('72:42');
        expect(runtime.textContent).toContain('DET 37');
        expect(runtime.textContent).toContain('clock 37');
        expect(runtime.textContent).toContain('phase 6/9');
        expect(runtime.textContent).toContain('round-trip loss 1');
        expect(runtime.textContent).toContain('q [-0.866, -0.500, 0.000, 0.000]');
        expect(runtime.textContent).toContain('rotation 90°/7');
        const axes = screen.getByTestId('m3-spanda-m2-axes');
        for (const axis of ['MEF', 'Tattva', 'Decan', 'Shem', 'Maqam', 'DET']) {
            expect(axes.textContent).toContain(axis);
        }
        expect(axes.textContent).toContain('L7 · P0 · inverted · family 1');
        expect(axes.textContent).toContain('42 → 37');
        expect(
            runtime.compareDocumentPosition(screen.getByTestId('m3-spanda-forms')) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it('renders every canonical form (five + QCD) and each evaluates to 137', () => {
        render(<M3ThirdSpandaPanel />);
        const allForms = [...THIRD_SPANDA_FORMS, QCD_OCTET_SINGLET_FORM];
        expect(allForms).toHaveLength(6);
        for (const form of allForms) {
            const el = screen.getByTestId(`m3-spanda-form-${form.id}`);
            expect(el.textContent).toContain(form.symbol);
            expect(el.textContent).toContain('= 137');
            expect(form.evaluate()).toBe(137);
        }
    });

    it('renders the 137 = 64 + 72 + 1 spine with the M1-5 parent (never M0-Anuttara)', () => {
        render(<M3ThirdSpandaPanel />);
        const spine = screen.getByTestId('m3-spanda-spine').textContent ?? '';
        expect(spine).toContain('137');
        expect(spine).toContain('M₃(64)');
        expect(spine).toContain('M₂(72)');
        expect(spine).toContain('M1-5');
        expect(spine).not.toContain('M0-Anuttara');
    });

    it('renders the execution-order trace 136 → 127=M₇ → 128 → 137', () => {
        render(<M3ThirdSpandaPanel />);
        const trace = screen.getByTestId('m3-spanda-execution-trace').textContent ?? '';
        expect(trace).toContain('136');
        expect(trace).toContain('127 = M₇');
        expect(trace).toContain('128 = 2⁷');
        expect(trace).toContain('137');
    });

    it('renders the translation rule with its QCD analogue', () => {
        render(<M3ThirdSpandaPanel />);
        const t = screen.getByTestId('m3-spanda-translation').textContent ?? '';
        expect(t).toContain('9₍M2₎ = 8₍M3₎ + 1₍M1₎');
        expect(t).toContain('3 ⊗ 3̄ = 8 ⊕ 1');
    });

    it('honours the measurement-face caveat and never claims a QL-derived alpha', () => {
        render(<M3ThirdSpandaPanel />);
        const face = screen.getByTestId('m3-spanda-measurement-face').textContent ?? '';
        expect(face).toContain('integer skeleton');
        expect(face).toContain('measurement-face');
        expect(face).toContain('source-warrant');
        // Forbidden register — the panel must not claim computation.
        const whole = document.body.textContent ?? '';
        expect(whole).not.toContain('QL derives alpha');
        expect(whole).not.toContain('electroweak mixing computed');
    });

    it('renders the recognition-context warrant as honest-pending', () => {
        render(<M3ThirdSpandaPanel />);
        expect(screen.getByTestId('m3-spanda-recognition-warrant').textContent).toContain(
            'pending-recognition-context-warrant'
        );
    });

    it('renders the kernel-provided physics descent and recognition warrant without deriving either lane', () => {
        const couplingFlow = buildCouplingFlowOverlay({
            couplingFlowAlignment: {
                symbolicSkeletons: ['137 = 64 + 72 + 1'],
                physicsDescent: ['G_SM', 'D_mu', 'alpha_EM(0)'],
                measurementFaces: ['137.035999... dressed low-energy measurement-face'],
                recognitionContext: { warrant: 'source-warrant symbolic skeleton, not renderer computation' },
                caveats: ['137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face']
            }
        });
        render(<M3ThirdSpandaPanel couplingFlow={couplingFlow} />);

        expect(screen.getByTestId('m3-spanda-physics-descent').textContent).toContain('G_SM');
        expect(screen.getByTestId('m3-spanda-physics-descent').textContent).toContain('alpha_EM(0)');
        expect(screen.getByTestId('m3-spanda-recognition-warrant').textContent).toContain(
            'source-warrant symbolic skeleton, not renderer computation'
        );
    });

    it('marks only the canonical form or trace named by a live skeleton event', () => {
        render(
            <M3ThirdSpandaPanel
                skeletonEventsActive={['Additive137', 'SpandaCrownBifurcation']}
            />
        );

        expect(screen.getByTestId('m3-spanda-form-spanda-bridge').parentElement?.dataset.active).toBe('true');
        expect(screen.getByTestId('m3-spanda-form-mersenne').parentElement?.dataset.active).toBe('false');
        expect(screen.getByTestId('m3-spanda-execution-trace').dataset.active).toBe('true');
    });
});
