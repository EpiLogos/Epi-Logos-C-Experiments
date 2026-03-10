export type CapabilityId = string;

export interface CapabilityProvider {
  id: string;
}

export interface CapabilityEnvelope<TPayload = unknown> {
  version: '1.0';
  capability: CapabilityId;
  payload: TPayload;
  sessionId: string;
  causalityId: string;
  timestamp: string;
}

export interface CreateEnvelopeParams<TPayload = unknown> {
  capability: CapabilityId;
  payload: TPayload;
  sessionId: string;
  causalityId: string;
}

export function isNamespacedCapability(capability: string): boolean {
  return /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/.test(capability.trim());
}
