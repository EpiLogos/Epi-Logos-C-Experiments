import type { AnuttaraPentadicRuntimeTrace } from '../bridge/types';

/** A complete wire-shaped generation used by contract and carrier tests. */
export const PENTADIC_TRACE_FIXTURE = {
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
                provenance: 'portal-core::codon_rotation_projection 84-to-472 surface LUT'
            },
            transcriptionState: 'compressed-nonexact-round-trip',
            lineChangeOperator: 251
        }
    },
    provenance: ['portal_core::pentadic_trace::from_profile']
} as const satisfies AnuttaraPentadicRuntimeTrace;
