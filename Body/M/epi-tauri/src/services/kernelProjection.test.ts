import { describe, expect, it } from 'vitest';
import { projectKernelHarmonicConsumer } from './kernelProjection';
import type { PortalRuntimeState } from './types';

describe('projectKernelHarmonicConsumer', () => {
  it('turns the shared temporal kernel projection into desktop visual and music readiness data', () => {
    const runtime: PortalRuntimeState = {
      day_id: '17-05-2026',
      now_path: 'Idea/Empty/Present/17-05-2026/20260517-120000-epii/now.md',
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
          position6: 1,
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

    const consumer = projectKernelHarmonicConsumer(runtime);

    expect(consumer.available).toBe(true);
    expect(consumer.privacy).toBe('safe-public-current-kernel-tick');
    expect(consumer.phase).toBe('Ascent');
    expect(consumer.element).toBe('InverseMobius');
    expect(consumer.pulseRatio).toBe('3/4');
    expect(consumer.tick12).toBe(10);
    expect(consumer.degree720).toBe(600);
    expect(consumer.su2Layer).toBe('shadow');
    expect(consumer.helix).toBe('pratibimba');
    expect(consumer.ratioRole).toBe('3/2 perfect-fifth aspiration');
    expect(consumer.chromaticNote).toBe('A');
    expect(consumer.mirrorNote).toBe('D#');
    expect(consumer.resonance72Index).toBe(64);
    expect(consumer.elementProjection).toBe('explicate-sounded');
    expect(consumer.planetaryBody).toBe('Uranus');
    expect(consumer.chakraRole).toBe('Ajna transpersonal extension');
    expect(consumer.contextFrame).toBe('4.5/0');
    expect(consumer.contextAgent).toBe('Psyche');
    expect(consumer.mahamayaAddress64).toBe(42);
    expect(consumer.codon).toBe('GGG');
    expect(consumer.hexagram).toBe('H43');
    expect(consumer.lineChangeOperatorAddress).toBe(256);
    expect(consumer.binaryTranscriptionState).toBe('provisional-gap');
    expect(consumer.bedrockPsychoidNumber).toBe('#4');
    expect(consumer.invertedPsychoidNumber).toBe("#4'");
    expect(consumer.pointerLensAnchor).toBe("L4'");
    expect(consumer.pointerWebIndex).toBe(10);
    expect(consumer.contextFrameCount).toBe(7);
    expect(consumer.visualReadiness).toBe('ready_for_projection');
    expect(consumer.musicalReadiness).toBe('data_ready_audio_deferred');
    expect(consumer.protectedFieldsExposed).toBe(false);
  });

  it('keeps desktop consumers explicit when the shared temporal projection is absent', () => {
    const consumer = projectKernelHarmonicConsumer(null);

    expect(consumer.available).toBe(false);
    expect(consumer.visualReadiness).toBe('missing_temporal_projection');
    expect(consumer.musicalReadiness).toBe('missing_temporal_projection');
  });
});
