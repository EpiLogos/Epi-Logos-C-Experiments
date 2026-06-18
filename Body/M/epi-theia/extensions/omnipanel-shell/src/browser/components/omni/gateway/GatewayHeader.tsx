import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime/lib/common/readiness';
import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import { gatewayStatusFromReadiness } from './gatewayModel';

export interface GatewayHeaderProps {
  readonly connectionState: ConnectionState;
  readonly gatewayUrl: string;
  readonly readinessSnapshot: MExtensionReadinessSnapshot;
  readonly capabilitiesLoading: boolean;
  readonly onReconnect: () => void;
  readonly onRefreshCapabilities: () => void;
  readonly onActivateDiagnostics: () => void;
}

export function GatewayHeader({
  connectionState,
  gatewayUrl,
  readinessSnapshot,
  capabilitiesLoading,
  onReconnect,
  onRefreshCapabilities,
  onActivateDiagnostics
}: GatewayHeaderProps) {
  return (
    <header className="space-y-3" data-test="gateway-header">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-lg font-bold">Gateway</h3>
          <div className="max-w-[560px] truncate text-xs text-[var(--text-tertiary)]" title={gatewayUrl}>
            {gatewayUrl}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-[var(--border-subtle)] px-2 py-1 text-[10px]" data-test="gateway-connection-state">
            {connectionState}
          </span>
          <KernelBridgeReadinessChip snapshot={readinessSnapshot} onActivateDiagnostics={onActivateDiagnostics} />
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
            onClick={onReconnect}
            data-test="gateway-reconnect"
          >
            Reconnect
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
            onClick={onRefreshCapabilities}
            disabled={capabilitiesLoading}
            data-test="gateway-refresh-capabilities"
          >
            {capabilitiesLoading ? 'Refreshing' : 'Refresh capabilities'}
          </button>
        </div>
      </div>
    </header>
  );
}

export function KernelBridgeReadinessChip({
  snapshot,
  onActivateDiagnostics
}: {
  readonly snapshot: MExtensionReadinessSnapshot;
  readonly onActivateDiagnostics: () => void;
}) {
  const status = gatewayStatusFromReadiness(snapshot);
  return (
    <button
      type="button"
      className="rounded border border-[var(--border-subtle)] px-2 py-1 text-[10px]"
      onClick={onActivateDiagnostics}
      data-test="kernel-bridge-readiness-chip"
      data-readiness-state={snapshot.state}
      title={snapshot.reason}
    >
      kernel bridge: {status}
    </button>
  );
}
