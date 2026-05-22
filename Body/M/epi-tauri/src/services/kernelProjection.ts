import type { KernelTemporalProjection, PortalRuntimeState } from './types';

export type KernelConsumerReadiness =
  | 'ready_for_projection'
  | 'data_ready_audio_deferred'
  | 'blocked_private_projection'
  | 'missing_temporal_projection';

export interface KernelHarmonicConsumer {
  available: boolean;
  privacy: KernelTemporalProjection['privacy'] | null;
  computationSource: KernelTemporalProjection['computationSource'] | null;
  generation: number | null;
  phase: KernelTemporalProjection['tick']['phase'] | null;
  element: KernelTemporalProjection['tick']['element'] | null;
  harmonicRatio: string | null;
  pulseRatio: string | null;
  tick12: number | null;
  degree720: number | null;
  degree360: number | null;
  su2Layer: string | null;
  helix: KernelTemporalProjection['harmonicProfile']['helix'] | null;
  ratioRole: string | null;
  chromaticNote: string | null;
  xPrimeNote: string | null;
  mirrorNote: string | null;
  mirrorSquare: string | null;
  resonance72Index: number | null;
  elementProjection: string | null;
  planetaryBody: string | null;
  chakraRole: string | null;
  diatonicDegree: number | null;
  contextFrame: string | null;
  contextAgent: string | null;
  vakRegister: string | null;
  mahamayaAddress64: number | null;
  codon: string | null;
  hexagram: string | null;
  lineChangeOperatorAddress: number | null;
  binaryTranscriptionState: string | null;
  bedrockPsychoidNumber: string | null;
  invertedPsychoidNumber: string | null;
  successorPsychoidNumber: string | null;
  pointerLensAnchor: string | null;
  pointerWebIndex: number | null;
  pointerRelationRole: string | null;
  pointerProvenance: string | null;
  contextFrameCount: number | null;
  tempoMultiplier: string | null;
  periodMultiplier: string | null;
  totalEnergy: string | null;
  visualReadiness: KernelConsumerReadiness;
  musicalReadiness: KernelConsumerReadiness;
  protectedFieldsExposed: boolean;
}

const MISSING_KERNEL_CONSUMER: KernelHarmonicConsumer = {
  available: false,
  privacy: null,
  computationSource: null,
  generation: null,
  phase: null,
  element: null,
  harmonicRatio: null,
  pulseRatio: null,
  tick12: null,
  degree720: null,
  degree360: null,
  su2Layer: null,
  helix: null,
  ratioRole: null,
  chromaticNote: null,
  xPrimeNote: null,
  mirrorNote: null,
  mirrorSquare: null,
  resonance72Index: null,
  elementProjection: null,
  planetaryBody: null,
  chakraRole: null,
  diatonicDegree: null,
  contextFrame: null,
  contextAgent: null,
  vakRegister: null,
  mahamayaAddress64: null,
  codon: null,
  hexagram: null,
  lineChangeOperatorAddress: null,
  binaryTranscriptionState: null,
  bedrockPsychoidNumber: null,
  invertedPsychoidNumber: null,
  successorPsychoidNumber: null,
  pointerLensAnchor: null,
  pointerWebIndex: null,
  pointerRelationRole: null,
  pointerProvenance: null,
  contextFrameCount: null,
  tempoMultiplier: null,
  periodMultiplier: null,
  totalEnergy: null,
  visualReadiness: 'missing_temporal_projection',
  musicalReadiness: 'missing_temporal_projection',
  protectedFieldsExposed: false,
};

export function projectKernelHarmonicConsumer(
  runtime: PortalRuntimeState | null,
): KernelHarmonicConsumer {
  const kernel = runtime?.kernel;
  if (!kernel) {
    return MISSING_KERNEL_CONSUMER;
  }

  const protectedFieldsExposed = exposesProtectedKernelFields(kernel);
  const validPublicProjection =
    kernel.privacy === 'safe-public-current-kernel-tick' &&
    kernel.computationSource === 'portal-core::KernelProjection' &&
    !protectedFieldsExposed;

  return {
    available: validPublicProjection,
    privacy: kernel.privacy,
    computationSource: kernel.computationSource,
    generation: kernel.generation,
    phase: kernel.tick.phase,
    element: kernel.tick.element,
    harmonicRatio: kernel.tick.harmonicRatio,
    pulseRatio: `${kernel.harmonicPulse.ratioNum}/${kernel.harmonicPulse.ratioDen}`,
    tick12: kernel.harmonicProfile.tick12,
    degree720: kernel.harmonicProfile.degree720,
    degree360: kernel.harmonicProfile.degree360,
    su2Layer: kernel.harmonicProfile.su2Layer,
    helix: kernel.harmonicProfile.helix,
    ratioRole: kernel.harmonicProfile.ratioRole,
    chromaticNote: kernel.harmonicProfile.chromatic.note,
    xPrimeNote: kernel.harmonicProfile.chromatic.xPrimeNote,
    mirrorNote: kernel.harmonicProfile.chromatic.mirrorNote,
    mirrorSquare: kernel.harmonicProfile.chromatic.mirrorSquare,
    resonance72Index: kernel.harmonicProfile.resonance72.lensAnchorIndex,
    elementProjection: kernel.harmonicProfile.elements.renderingRole,
    planetaryBody: kernel.harmonicProfile.planetaryChakral.body,
    chakraRole: kernel.harmonicProfile.planetaryChakral.chakraRole,
    diatonicDegree: kernel.harmonicProfile.diatonic?.degree ?? null,
    contextFrame: kernel.harmonicProfile.diatonic?.contextFrame ?? null,
    contextAgent: kernel.harmonicProfile.diatonic?.contextAgent ?? null,
    vakRegister: kernel.harmonicProfile.diatonic?.vakRegister ?? null,
    mahamayaAddress64: kernel.harmonicProfile.binary.mahamayaAddress64,
    codon: kernel.harmonicProfile.binary.codon,
    hexagram: kernel.harmonicProfile.binary.hexagram,
    lineChangeOperatorAddress: kernel.harmonicProfile.binary.lineChangeOperatorAddress,
    binaryTranscriptionState: kernel.harmonicProfile.binary.transcriptionState,
    bedrockPsychoidNumber: kernel.harmonicProfile.bedrock.psychoidNumber,
    invertedPsychoidNumber: kernel.harmonicProfile.bedrock.invertedPsychoidNumber,
    successorPsychoidNumber: kernel.harmonicProfile.bedrock.successorPsychoidNumber,
    pointerLensAnchor: kernel.harmonicProfile.pointerAnchor.lensAnchor,
    pointerWebIndex: kernel.harmonicProfile.pointerAnchor.webIndex,
    pointerRelationRole: kernel.harmonicProfile.pointerAnchor.relationRole,
    pointerProvenance: kernel.harmonicProfile.pointerAnchor.provenance,
    contextFrameCount: kernel.harmonicProfile.contextFrames.frameCount,
    tempoMultiplier: kernel.harmonicPulse.tempoMultiplier,
    periodMultiplier: kernel.harmonicPulse.periodMultiplier,
    totalEnergy: kernel.energy.totalEnergy,
    visualReadiness: validPublicProjection
      ? 'ready_for_projection'
      : 'blocked_private_projection',
    musicalReadiness: validPublicProjection
      ? 'data_ready_audio_deferred'
      : 'blocked_private_projection',
    protectedFieldsExposed,
  };
}

function exposesProtectedKernelFields(kernel: KernelTemporalProjection): boolean {
  const projection = kernel as unknown as Record<string, unknown>;
  return 'bioquaternion' in projection || 'resonanceSquareEmphasis' in projection;
}
