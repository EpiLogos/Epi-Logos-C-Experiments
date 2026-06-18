import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime/lib/common/readiness';
import type { GatewayPanel } from '../../../stores/epiClawGatewayStore';
import type { CrossLayoutIntent } from '@pratibimba/pratibimba-layouts/lib/common/cross-layout-intent';

export type DiagnosticsHealth = 'ok' | 'degraded' | 'blocked';

export interface DiagnosticsProfileTick {
  readonly generation: number | null;
  readonly emittedAt: number;
  readonly advanced: boolean;
}

export interface LaggingProfileSubscriber {
  readonly subscriberId: string;
  readonly lagMs: number;
}

export interface PendingProfileFieldMarker {
  readonly fieldName: string;
  readonly gatingTranche: string;
  readonly state: string;
}

export interface S2GraphReachabilityState {
  readonly bimbaReachable: boolean;
  readonly gnosisReachable: boolean;
  readonly embeddingDimensions: number;
  readonly checkedAt: number | null;
  readonly reason: string | null;
}

export type GatewayWebSocketConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface GatewayReconnectHistoryEntry {
  readonly timestamp: number;
  readonly state: GatewayWebSocketConnectionState;
  readonly reason: string | null;
}

export interface GatewayWebSocketTelemetry {
  readonly state: GatewayWebSocketConnectionState;
  readonly url: string;
  readonly lastPingAt: number | null;
  readonly latencyMs: number | null;
  readonly reconnectHistory: readonly GatewayReconnectHistoryEntry[];
}

export interface ActiveLayoutTelemetry {
  readonly layoutId: 'daily-0-1' | 'ide-deep';
  readonly dailyToggle: 'cosmic' | 'personal' | null;
  readonly activeOmniPanelTab: GatewayPanel | string;
  readonly activeActivityBarMode: string;
}

export interface CrossLayoutIntentLogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly originatingTabOrExtension: string;
  readonly targetTabOrExtension: string;
  readonly status: 'success' | 'failure';
  readonly error: string | null;
  readonly intent: CrossLayoutIntent;
}

export type ReadinessLedger = readonly MExtensionReadinessSnapshot[];

