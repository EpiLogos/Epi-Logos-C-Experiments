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
