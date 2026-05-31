import { gatewayClient } from './gatewayClient';
import { projectKernelHarmonicConsumer } from './kernelProjection';
import type {
  KernelProfileCoordinateAnchor,
  KernelProfileObservationParams,
  KernelProfileObservationRequest,
  PortalRuntimeState,
} from './types';

export const KERNEL_PROFILE_OBSERVATION_METHOD =
  's5.episodic.kernel_profile_observation.deposit';

export interface KernelProfileObservationOptions {
  sessionKey: string;
  namespaceRef: string;
  sourceCoordinate: string;
  sourceAgent?: string;
}

export interface KernelProfileObservationGateway {
  rpc(method: string, params: unknown): Promise<unknown>;
}

export function buildKernelProfileObservationRequest(
  runtime: PortalRuntimeState | null,
  options: KernelProfileObservationOptions,
): KernelProfileObservationRequest | null {
  const consumer = projectKernelHarmonicConsumer(runtime);
  const kernel = runtime?.kernel;
  if (!consumer.available || !kernel) {
    return null;
  }

  const profile = kernel.harmonicProfile;
  if (profile.binary.mahamayaAddress64 === null) {
    return null;
  }

  return {
    method: KERNEL_PROFILE_OBSERVATION_METHOD,
    params: {
      sourceAgent: options.sourceAgent ?? 'anima',
      sessionKey: options.sessionKey,
      namespaceRef: options.namespaceRef,
      dayId: runtime.day_id,
      vaultNowPath: runtime.now_path,
      sourceCoordinate: options.sourceCoordinate,
      tick12: profile.tick12,
      degree720: profile.degree720,
      resonance72Index: profile.resonance72.lensAnchorIndex,
      mahamayaAddress64: profile.binary.mahamayaAddress64,
      privacy: 'protected-local-derived',
      profilePrivacyClass: profile.privacyClass,
      harmonicMedium: 'portal-core::MathemeHarmonicProfile',
      coordinateAnchor: buildCoordinateAnchor(runtime, options.sourceCoordinate),
    },
  };
}

export async function depositKernelProfileObservation(
  runtime: PortalRuntimeState | null,
  options: KernelProfileObservationOptions,
  client: KernelProfileObservationGateway = gatewayClient,
): Promise<boolean> {
  const request = buildKernelProfileObservationRequest(runtime, options);
  if (!request) {
    return false;
  }

  await client.rpc(request.method, request.params);
  return true;
}

function buildCoordinateAnchor(
  runtime: PortalRuntimeState,
  coordinate: string,
): KernelProfileCoordinateAnchor {
  const kernel = runtime.kernel;
  if (!kernel) {
    throw new Error('kernel temporal projection is required');
  }
  const profile = kernel.harmonicProfile;

  return {
    coordinate,
    coordinate_anchor: {
      coordinate,
      kernel: {
        source: 's0.kernel',
        profile: 'portal-core::MathemeHarmonicProfile',
        generation: kernel.generation,
        projection_owner: kernel.projectionOwner,
      },
      harmonic_pointer: {
        source_profile: 'portal-core::MathemeHarmonicProfile',
        source_contract: 'S0 Bedrock7/PointerWeb36/CF7',
        bedrock: {
          psychoid_number: profile.bedrock.psychoidNumber,
          inverted_psychoid_number: profile.bedrock.invertedPsychoidNumber,
          successor_psychoid_number: profile.bedrock.successorPsychoidNumber,
          successor_relation: profile.bedrock.successorRelation,
          inversion_relation: profile.bedrock.inversionRelation,
        },
        pointer_anchor: {
          source_coordinate: profile.pointerAnchor.sourceCoordinate,
          ql_position: profile.pointerAnchor.qlPosition,
          helix: profile.pointerAnchor.helix,
          web_index: profile.pointerAnchor.webIndex,
          web_cardinality: profile.pointerAnchor.webCardinality,
          lens_anchor: profile.pointerAnchor.lensAnchor,
          relation_role: profile.pointerAnchor.relationRole,
          pitch_class: profile.pointerAnchor.pitchClass,
        },
        context_frames: {
          cf_cardinality: profile.contextFrames.frameCount,
          active_frame_index: profile.contextFrames.activeFrameIndex,
          active_frame: profile.contextFrames.activeFrame,
          active_agent: profile.contextFrames.activeAgent,
          projection: profile.contextFrames.projection,
        },
        provenance: profile.pointerAnchor.provenance,
      },
    },
  };
}
