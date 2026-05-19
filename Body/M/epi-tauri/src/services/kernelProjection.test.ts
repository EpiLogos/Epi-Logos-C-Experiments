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
          helix: 'pratibimba',
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
          diatonic: {
            degree: 6,
            pitchClass: 9,
            note: 'A',
            contextFrame: '4.5/0',
            contextAgent: 'Psyche',
            vakRegister: 'partial-Aletheia',
          },
          binary: {
            mahamayaAddress64: null,
            codon: null,
            hexagram: null,
            lineChangeOperator: null,
            transcriptionState: 'pending-m3-codec',
            frameBreathingRole: 'sq2-active-tritone',
            m3CodecProvenance:
              'M3 Mahamaya symbolic codec required for 64-fold codon/hexagram materialisation',
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
    expect(consumer.helix).toBe('pratibimba');
    expect(consumer.chromaticNote).toBe('A');
    expect(consumer.mirrorNote).toBe('D#');
    expect(consumer.contextFrame).toBe('4.5/0');
    expect(consumer.contextAgent).toBe('Psyche');
    expect(consumer.binaryTranscriptionState).toBe('pending-m3-codec');
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
