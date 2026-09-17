import {
  PENDING_M_READINESS,
  readinessSeverity,
  type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import type { PrivacyDropAggregate } from '@pratibimba/ide-shell-m0-m5/lib/browser/services/privacy-drop-feed';
import { ActiveLayoutDisplay } from '../diagnostics/ActiveLayoutDisplay';
import { CrossLayoutIntentLog } from '../diagnostics/CrossLayoutIntentLog';
import { DiagnosticsHeader } from '../diagnostics/DiagnosticsHeader';
import { GatewayWebSocketState } from '../diagnostics/GatewayWebSocketState';
import { KernelBridgeReadinessSummary } from '../diagnostics/KernelBridgeReadinessSummary';
import { MathemeProfileGenerationDisplay } from '../diagnostics/MathemeProfileGenerationDisplay';
import { ProfileFieldPendingMarkers } from '../diagnostics/ProfileFieldPendingMarkers';
import { ProfileTickSubscriptionState } from '../diagnostics/ProfileTickSubscriptionState';
import { S2GraphReachability } from '../diagnostics/S2GraphReachability';
import { PiMonitorPane } from './PiMonitorPane';
import type {
  GatewayResolvedSessionSurface,
  PortalTemporalSurfaceContract
} from '../../../../common/omnipanel-runtime';
import type {
  ActiveLayoutTelemetry,
  CrossLayoutIntentLogEntry,
  DiagnosticsHealth,
  DiagnosticsProfileTick,
  GatewayWebSocketTelemetry,
  LaggingProfileSubscriber,
  PendingProfileFieldMarker,
  S2GraphReachabilityState
} from '../diagnostics/diagnosticsTypes';

export interface DiagnosticsPanelProps {
  readonly readinessLedger?: readonly MExtensionReadinessSnapshot[];
  readonly profileGeneration?: number | null;
  readonly profileTickHistory?: readonly DiagnosticsProfileTick[];
  readonly subscriberCount?: number;
  readonly lastTickProcessedAt?: number | null;
  readonly laggingSubscribers?: readonly LaggingProfileSubscriber[];
  readonly pendingProfileFields?: readonly PendingProfileFieldMarker[];
  readonly s2Graph?: S2GraphReachabilityState;
  readonly gatewayWebSocket?: GatewayWebSocketTelemetry;
  readonly activeLayout?: ActiveLayoutTelemetry;
  readonly intentLogEntries?: readonly CrossLayoutIntentLogEntry[];
  readonly expandedIntentEntryId?: string | null;
  readonly onToggleIntentEntry?: (entryId: string) => void;
  readonly privacyDropAggregate?: PrivacyDropAggregate;
  readonly piMonitor?: {
    readonly portalTemporalSurface: PortalTemporalSurfaceContract;
    readonly resolvedSession: GatewayResolvedSessionSurface;
  } | null;
}

const EMPTY_PRIVACY_DROP_AGGREGATE: PrivacyDropAggregate = {
  byWidget: {},
  byClass: {},
  total: 0
};

export function DiagnosticsPanel({
  readinessLedger = [PENDING_M_READINESS],
  profileGeneration = null,
  profileTickHistory = [],
  subscriberCount = 0,
  lastTickProcessedAt = null,
  laggingSubscribers = [],
  pendingProfileFields = [],
  s2Graph = {
    bimbaReachable: false,
    gnosisReachable: false,
    embeddingDimensions: 3072,
    checkedAt: null,
    reason: 's2.graph_services.ping has not reported yet'
  },
  gatewayWebSocket = {
    state: 'disconnected',
    url: 'ws://127.0.0.1:18794',
    lastPingAt: null,
    latencyMs: null,
    reconnectHistory: []
  },
  activeLayout = {
    layoutId: 'daily-0-1',
    dailyToggle: null,
    activeOmniPanelTab: 'diagnostics',
    activeActivityBarMode: 'unknown'
  },
  intentLogEntries = [],
  expandedIntentEntryId = null,
  onToggleIntentEntry,
  privacyDropAggregate = EMPTY_PRIVACY_DROP_AGGREGATE,
  piMonitor = null
}: DiagnosticsPanelProps) {
  const health = deriveDiagnosticsHealth(readinessLedger, gatewayWebSocket);
  const summary = deriveDiagnosticsSummary(readinessLedger, gatewayWebSocket);
  const lastTickAt = profileTickHistory.length > 0
    ? profileTickHistory[profileTickHistory.length - 1].emittedAt
    : null;

  return (
    <div className="p-6 space-y-5" data-test="diagnostics-panel">
      <DiagnosticsHeader health={health} summary={summary} lastTickAt={lastTickAt} />

      <div className="grid gap-3 xl:grid-cols-2">
        <MathemeProfileGenerationDisplay
          profileGeneration={profileGeneration}
          tickHistory={profileTickHistory}
        />
        <ProfileTickSubscriptionState
          subscriberCount={subscriberCount}
          tickHistory={profileTickHistory}
          lastTickProcessedAt={lastTickProcessedAt}
          laggingSubscribers={laggingSubscribers}
        />
      </div>

      <KernelBridgeReadinessSummary ledger={readinessLedger} />
      <ProfileFieldPendingMarkers markers={pendingProfileFields} />

      {piMonitor ? (
        <PiMonitorPane
          portalTemporalSurface={piMonitor.portalTemporalSurface}
          resolvedSession={piMonitor.resolvedSession}
        />
      ) : (
        <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="pi-monitor-pane-empty">
          <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Pi Runtime Monitor</h4>
          <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">No active Pi session has resolved yet.</p>
        </section>
      )}

      <div className="grid gap-3 xl:grid-cols-3">
        <S2GraphReachability state={s2Graph} />
        <GatewayWebSocketState telemetry={gatewayWebSocket} />
        <ActiveLayoutDisplay telemetry={activeLayout} />
      </div>

      <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="diagnostics-privacy-provenance">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Privacy provenance</h4>
          <span className="text-xs">privacy drops: {privacyDropAggregate.total}</span>
        </div>
        <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
          {privacyDropAggregate.total === 0
            ? 'No privacy drops recorded.'
            : Object.entries(privacyDropAggregate.byWidget)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([widget, count]) => `${widget}:${count}`)
                .join(', ')}
        </div>
      </section>

      <CrossLayoutIntentLog
        entries={intentLogEntries}
        expandedEntryId={expandedIntentEntryId}
        onToggleEntry={onToggleIntentEntry}
      />
    </div>
  );
}

export function deriveDiagnosticsHealth(
  readinessLedger: readonly MExtensionReadinessSnapshot[],
  gatewayWebSocket: GatewayWebSocketTelemetry
): DiagnosticsHealth {
  if (gatewayWebSocket.state === 'disconnected' || gatewayWebSocket.state === 'error') {
    return 'blocked';
  }
  const severities = readinessLedger.map(snapshot => readinessSeverity(snapshot.state));
  if (severities.includes('blocked')) {
    return 'degraded';
  }
  if (severities.includes('degraded')) {
    return 'degraded';
  }
  return 'ok';
}

export function deriveDiagnosticsSummary(
  readinessLedger: readonly MExtensionReadinessSnapshot[],
  gatewayWebSocket: GatewayWebSocketTelemetry
): string {
  if (gatewayWebSocket.state === 'disconnected' || gatewayWebSocket.state === 'error') {
    return 'Gateway blocked - WebSocket disconnected';
  }
  const latest = [...readinessLedger].sort((a, b) => b.fetchedAt - a.fetchedAt)[0];
  if (!latest || latest.state === 'ready_public_current') {
    return 'All systems ready';
  }
  if (latest.state === 'profile_missing_field') {
    return 'Bridge degraded - kernel-bridge profile-field pending';
  }
  if (latest.state === 's2_graph_blocked') {
    return 'Bridge degraded - S2 graph reachability blocked';
  }
  return `Bridge degraded - ${latest.state}`;
}
