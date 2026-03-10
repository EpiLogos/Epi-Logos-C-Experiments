import type { CapabilityEnvelope, CreateEnvelopeParams } from './contracts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function createEnvelope<TPayload>(params: CreateEnvelopeParams<TPayload>): CapabilityEnvelope<TPayload> {
  return {
    version: '1.0',
    capability: params.capability,
    payload: params.payload,
    sessionId: params.sessionId,
    causalityId: params.causalityId,
    timestamp: new Date().toISOString(),
  };
}

export function isCapabilityEnvelope(value: unknown): value is CapabilityEnvelope {
  if (!isRecord(value)) return false;
  return (
    value.version === '1.0' &&
    typeof value.capability === 'string' &&
    'payload' in value &&
    typeof value.sessionId === 'string' &&
    typeof value.causalityId === 'string' &&
    typeof value.timestamp === 'string'
  );
}
