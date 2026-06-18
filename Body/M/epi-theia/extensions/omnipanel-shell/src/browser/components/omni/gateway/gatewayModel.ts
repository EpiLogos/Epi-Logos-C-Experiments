import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime/lib/common/readiness';

export type GatewaySubView =
  | 'capabilities'
  | 'nodes'
  | 'models'
  | 'skills'
  | 'cron'
  | 'config'
  | 'settings';

export type GatewayCapabilityStatus =
  | 'ready'
  | 'pending-bridge'
  | 'pending-profile-field'
  | 'blocked-privacy'
  | 'blocked-s2-graph'
  | 'blocked-s3-subscription'
  | 'blocked-s5-review'
  | 'authority-payload-missing'
  | 'degraded'
  | string;

export interface GatewayCapability {
  readonly name: string;
  readonly version: string;
  readonly status: GatewayCapabilityStatus;
  readonly privacyClass: string;
  readonly safePublic: boolean;
  readonly samplePayload: Record<string, unknown>;
  readonly source?: string | null;
}

export interface GatewayTryItDraftState {
  readonly openCapabilityName: string | null;
  readonly payloadByCapability: Record<string, string>;
}

export interface GatewayPanelSessionState {
  readonly activeSubView: GatewaySubView;
  readonly selectedCapabilityName: string | null;
  readonly tryItDraft?: Record<string, unknown>;
}

export const GATEWAY_SUBVIEWS: readonly { readonly id: GatewaySubView; readonly label: string }[] = Object.freeze([
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'nodes', label: 'Nodes' },
  { id: 'models', label: 'Models' },
  { id: 'skills', label: 'Skills' },
  { id: 'cron', label: 'Cron' },
  { id: 'config', label: 'Config' },
  { id: 'settings', label: 'Settings' }
]);

export const DEFAULT_GATEWAY_WIDGET_CAPABILITIES: readonly string[] = Object.freeze([
  'readCurrentProfile',
  'invokeGatewayRpc',
  "s4'.mediation.capabilities.list",
  's1.semantic.suggest_links',
  'nodes.list',
  'models.list',
  'skills.list',
  'cron.list',
  'config.read',
  'settings.read'
]);

export function normalizeGatewaySubView(value: unknown): GatewaySubView {
  return GATEWAY_SUBVIEWS.some(view => view.id === value) ? value as GatewaySubView : 'capabilities';
}

export function normalizeGatewayPanelSessionState(value: unknown): GatewayPanelSessionState {
  const raw = isRecord(value) ? value : {};
  return Object.freeze({
    activeSubView: normalizeGatewaySubView(raw.activeSubView),
    selectedCapabilityName: stringField(raw.selectedCapabilityName),
    tryItDraft: isRecord(raw.tryItDraft) ? { ...raw.tryItDraft } : undefined
  });
}

export function gatewayStatusFromReadiness(snapshot: MExtensionReadinessSnapshot | null | undefined): GatewayCapabilityStatus {
  switch (snapshot?.state) {
    case 'ready_public_current':
      return 'ready';
    case 'degraded_but_readable':
      return 'degraded';
    case 'profile_missing_field':
      return 'pending-profile-field';
    case 's2_graph_blocked':
      return 'blocked-s2-graph';
    case 's3_subscription_blocked':
      return 'blocked-s3-subscription';
    case 's5_review_blocked':
      return 'blocked-s5-review';
    case 'authority_payload_missing':
      return 'authority-payload-missing';
    case 'privacy_blocked':
      return 'blocked-privacy';
    default:
      return 'pending-bridge';
  }
}

export function normalizeCapabilitiesPayload(payload: unknown, readiness?: MExtensionReadinessSnapshot | null): readonly GatewayCapability[] {
  const list = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.capabilities)
      ? payload.capabilities
      : null;

  if (!list) {
    return Object.freeze([]);
  }

  const fallbackStatus = gatewayStatusFromReadiness(readiness);
  const capabilities = list
    .map(item => normalizeCapability(item, fallbackStatus))
    .filter((item): item is GatewayCapability => item !== null)
    .sort((left, right) => left.name.localeCompare(right.name));

  return Object.freeze(capabilities);
}

export function capabilityNames(capabilities: readonly GatewayCapability[]): readonly string[] {
  return Object.freeze(capabilities.map(capability => capability.name));
}

export function canTryCapability(capability: GatewayCapability): boolean {
  const privacy = capability.privacyClass.toLowerCase();
  return capability.safePublic && (privacy === 'safe-public' || privacy === 'public');
}

export function createDefaultTryItDraft(capability: GatewayCapability): string {
  return `${JSON.stringify(capability.samplePayload ?? {}, null, 2)}\n`;
}

export function parseTryItPayload(draft: string): Record<string, unknown> {
  const parsed = JSON.parse(draft || '{}') as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Payload must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export async function submitTryItCapability(
  capability: GatewayCapability,
  draft: string,
  invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>
): Promise<string> {
  if (!canTryCapability(capability)) {
    throw new Error(`Capability ${capability.name} is privacy-gated and cannot be invoked from Try-It.`);
  }
  const payload = parseTryItPayload(draft);
  const result = await invokeGatewayRpc(capability.name, payload);
  return `${JSON.stringify(result ?? null, null, 2)}\n`;
}

function normalizeCapability(value: unknown, fallbackStatus: GatewayCapabilityStatus): GatewayCapability | null {
  if (!isRecord(value)) {
    return null;
  }
  const name = stringField(value.name) ?? stringField(value.id) ?? stringField(value.method);
  if (!name) {
    return null;
  }
  const privacyClass = stringField(value.privacyClass) ?? stringField(value.privacy) ?? 'public';
  const safeFlag = value.safePublic === true || value.safe_public === true || value.tryIt === true;
  const samplePayload = isRecord(value.samplePayload)
    ? { ...value.samplePayload }
    : isRecord(value.sample_payload)
      ? { ...value.sample_payload }
      : {};

  return Object.freeze({
    name,
    version: stringField(value.version) ?? 'unversioned',
    status: stringField(value.status) ?? fallbackStatus,
    privacyClass,
    safePublic: safeFlag || privacyClass === 'safe-public' || privacyClass === 'public',
    samplePayload,
    source: stringField(value.source)
  });
}

function stringField(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
