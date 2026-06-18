import { ReadinessBanner } from '@pratibimba/m-extension-runtime/lib/browser/readiness-banner';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime/lib/common/readiness';
import { CapabilityCheckCell } from './CapabilityCheckCell';
import { TryItAffordance } from './TryItAffordance';
import {
  capabilityNames,
  DEFAULT_GATEWAY_WIDGET_CAPABILITIES,
  type GatewayCapability
} from './gatewayModel';

export interface CapabilityListViewProps {
  readonly capabilities: readonly GatewayCapability[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly readinessSnapshot: MExtensionReadinessSnapshot;
  readonly selectedCapabilityName: string | null;
  readonly tryItDrafts?: Record<string, string>;
  readonly widgetCapabilityNames?: readonly string[];
  readonly onSelectCapability: (name: string | null) => void;
  readonly onRefresh: () => void;
  readonly onTryItDraftChange?: (capabilityName: string, draft: string) => void;
  readonly onInvokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
}

export function CapabilityListView({
  capabilities,
  loading,
  error,
  readinessSnapshot,
  selectedCapabilityName,
  tryItDrafts = {},
  widgetCapabilityNames = DEFAULT_GATEWAY_WIDGET_CAPABILITIES,
  onSelectCapability,
  onRefresh,
  onTryItDraftChange,
  onInvokeGatewayRpc
}: CapabilityListViewProps) {
  const gatewayCapabilityNames = capabilityNames(capabilities);
  const showFallback = !loading && capabilities.length === 0;

  return (
    <section className="space-y-3" data-test="gateway-capability-list-view">
      {error ? (
        <div className="rounded border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-200" data-test="capability-list-error">
          {error}
        </div>
      ) : null}
      {showFallback ? (
        <ReadinessBanner
          extensionId="@pratibimba/omnipanel-shell.gateway"
          extensionLabel="Gateway capabilities"
          snapshot={readinessSnapshot}
          declaredBlockers={["s4'.mediation.capabilities.list"]}
          provenance="GatewayPanel CapabilityListView fallback when the S4 mediation capability list is not registered."
        />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-[var(--text-tertiary)]">
          {loading ? 'Refreshing capability matrix' : `${capabilities.length} capabilities`}
        </div>
        <button
          type="button"
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
          onClick={onRefresh}
          disabled={loading}
          data-test="capability-list-refresh"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-auto rounded border border-[var(--border-subtle)]" data-test="capability-list-table">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-white/5 text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Parity</th>
              <th className="px-3 py-2">Try-It</th>
            </tr>
          </thead>
          <tbody>
            {capabilities.map(capability => (
              <tr
                key={capability.name}
                className={`border-t border-[var(--border-subtle)] ${selectedCapabilityName === capability.name ? 'bg-white/5' : ''}`}
                data-test={`capability-row-${capability.name}`}
              >
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="max-w-[320px] truncate text-left font-mono text-[11px]"
                    onClick={() => onSelectCapability(selectedCapabilityName === capability.name ? null : capability.name)}
                    title={capability.name}
                  >
                    {capability.name}
                  </button>
                </td>
                <td className="px-3 py-2 text-[var(--text-tertiary)]">{capability.version}</td>
                <td className="px-3 py-2">
                  <span className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px]">
                    {capability.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <CapabilityCheckCell
                    capabilityName={capability.name}
                    gatewayCapabilityNames={gatewayCapabilityNames}
                    widgetCapabilityNames={widgetCapabilityNames}
                    pending={loading}
                  />
                </td>
                <td className="px-3 py-2">
                  <TryItAffordance
                    capability={capability}
                    draft={tryItDrafts[capability.name]}
                    onDraftChange={onTryItDraftChange}
                    onInvokeGatewayRpc={onInvokeGatewayRpc}
                  />
                </td>
              </tr>
            ))}
            {capabilities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-xs italic text-[var(--text-tertiary)]" data-test="capability-list-empty">
                  Capability list unavailable.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
