import { describe, expect, it, vi } from 'vitest';
import {
  buildKernelProfileObservationRequest,
  depositKernelProfileObservation,
  KERNEL_PROFILE_OBSERVATION_METHOD,
} from './kernelProfileObservation';
import type { PortalRuntimeState } from './types';

function runtimeFixture(): PortalRuntimeState {
  return {
    day_id: '19-05-2026',
    now_path: 'Idea/Empty/Present/19-05-2026/20260519-120000-main/now.md',
    kernel: {
      coordinateOwner: 'S0/QL-meta',
      projectionOwner: "S3'",
      privacy: 'safe-public-current-kernel-tick',
      computationSource: 'portal-core::KernelProjection',
      generation: 44,
      tick: {
        cycle: 2,
        subTick: 7,
        phase: 'Ascent',
        element: 'InverseMobius',
        position6: 4,
        harmonicRatio: '0.750000',
      },
      harmonicPulse: {
        cycle: 2,
        subTick: 7,
        phase: 'Ascent',
        element: 'InverseMobius',
        ratioNum: 3,
        ratioDen: 4,
        tempoMultiplier: '0.750000',
        periodMultiplier: '1.333333',
      },
      energy: {
        totalEnergy: '0.270000',
      },
      harmonicProfile: {
        tick12: 10,
        cycle: 2,
        degree720: 600,
        degree360: 240,
        su2Layer: 'shadow',
        helix: 'pratibimba',
        ratioRole: '3/2 perfect-fifth aspiration',
        chromatic: {
          position: 4,
          pitchClass: 9,
          note: 'A',
          xPrimePitchClass: 8,
          xPrimeNote: 'G#',
          mirrorPosition: 1,
          mirrorPitchClass: 3,
          mirrorNote: 'D#',
          mirrorSquare: 'Sq2',
          mirrorSpanWholeTones: 3,
          mirrorSpanSemitones: 6,
        },
        resonance72: {
          legacyResonanceIndex: 58,
          lensAnchorIndex: 64,
          baseLens: 4,
          helixBit: 1,
          lensAnchor: 10,
          position: 4,
        },
        elements: {
          pPositionElement: 'Earth',
          l2PrimeElement: 'Fire',
          renderingRole: 'explicate-sounded',
        },
        planetaryChakral: {
          body: 'Uranus',
          chakraRole: 'Ajna transpersonal extension',
          element: 'Light/Air',
          musicalRole: '5/3 major sixth',
          modalColor: 'Nahawand / disruptive insight',
          provenance:
            "initial M2/M' alignment; canonical values must be governed by S2 graph law",
        },
        diatonic: {
          degree: 6,
          pitchClass: 9,
          note: 'A',
          contextFrame: '4.5/0',
          contextAgent: 'Psyche',
          vakRegister: 'partial-Aletheia',
        },
        binary: {
          mahamayaAddress64: 42,
          codon: 'GGG',
          hexagram: 'H43',
          lineChangeOperator: 'H43.5',
          hexagramId: 42,
          upperTrigram: 5,
          lowerTrigram: 2,
          codonId: 42,
          nucleotideBits: [3, 3, 3],
          dnaRnaPhase: 'RNA',
          lineIndex: 4,
          lineChangeOperatorAddress: 256,
          m2VibrationIndex: 64,
          m2ToM3Symbol: 56,
          evolutionaryGap: true,
          tarotMinorId: null,
          tarotShadowCodon: null,
          aminoAcidCode: null,
          datasetLutState: 'pending-dataset-lut',
          transcriptionState: 'provisional-gap',
          frameBreathingRole: 'sq2-active-tritone',
          m3CodecProvenance:
            'portal-core::mahamaya address law; tarot/amino LUTs pending',
        },
        bedrock: {
          hashOperator: '#',
          psychoidNumber: '#4',
          invertedPsychoidNumber: "#4'",
          successorPsychoidNumber: '#5',
          successorRelation: 'epogdoon-tick',
          inversionRelation: 'inversion-spanda',
          bimbaPitchClass: 8,
          inversionPitchClass: 9,
        },
        pointerAnchor: {
          sourceCoordinate: 'S0/QL-meta',
          qlPosition: 4,
          helix: 'pratibimba',
          webIndex: 10,
          bedrockIndex: 4,
          familyRingSize: 12,
          positionRingSize: 12,
          lensRingSize: 12,
          webCardinality: 36,
          lensAnchor: "L4'",
          relationRole: 'inversion-spanda',
          pitchClass: 9,
          provenance: 'S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract',
        },
        contextFrames: {
          frameCount: 7,
          activeFrameIndex: 5,
          activeFrame: '4.5/0',
          activeAgent: 'Psyche',
          projection: 'CF7 diatonic lemniscate overlay',
        },
      },
    },
  };
}

describe('kernel profile observation deposit requests', () => {
  it('builds the S3 Graphiti deposit call from the safe M-prime harmonic consumer state', () => {
    const request = buildKernelProfileObservationRequest(runtimeFixture(), {
      sessionKey: 'agent:main:main',
      namespaceRef: 'pratibimba-test',
      sourceCoordinate: 'M2',
    });

    expect(request?.method).toBe(KERNEL_PROFILE_OBSERVATION_METHOD);
    expect(request?.params).toMatchObject({
      sourceAgent: 'anima',
      sessionKey: 'agent:main:main',
      namespaceRef: 'pratibimba-test',
      dayId: '19-05-2026',
      vaultNowPath: 'Idea/Empty/Present/19-05-2026/20260519-120000-main/now.md',
      sourceCoordinate: 'M2',
      tick12: 10,
      degree720: 600,
      resonance72Index: 64,
      mahamayaAddress64: 42,
    });
    expect(request?.params.coordinateAnchor.coordinate).toBe('M2');
    expect(
      request?.params.coordinateAnchor.coordinate_anchor.harmonic_pointer.pointer_anchor
        .lens_anchor,
    ).toBe("L4'");
    expect(
      request?.params.coordinateAnchor.coordinate_anchor.harmonic_pointer.context_frames
        .active_agent,
    ).toBe('Psyche');
    expect(JSON.stringify(request?.params)).not.toContain('bioquaternion');
    expect(JSON.stringify(request?.params)).not.toContain('q_b');
  });

  it('returns null instead of depositing when the safe temporal kernel projection is absent', () => {
    expect(
      buildKernelProfileObservationRequest(null, {
        sessionKey: 'agent:main:main',
        namespaceRef: 'pratibimba-test',
        sourceCoordinate: 'M2',
      }),
    ).toBeNull();
  });

  it('dispatches the built observation through the gateway client', async () => {
    const rpc = vi.fn().mockResolvedValue(undefined);

    await depositKernelProfileObservation(
      runtimeFixture(),
      {
        sessionKey: 'agent:main:main',
        namespaceRef: 'pratibimba-test',
        sourceCoordinate: 'M2',
      },
      { rpc },
    );

    expect(rpc).toHaveBeenCalledWith(
      KERNEL_PROFILE_OBSERVATION_METHOD,
      expect.objectContaining({
        sourceCoordinate: 'M2',
        tick12: 10,
        resonance72Index: 64,
      }),
    );
  });
});
