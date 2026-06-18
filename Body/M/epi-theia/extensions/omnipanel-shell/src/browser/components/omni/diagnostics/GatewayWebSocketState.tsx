import type { GatewayWebSocketTelemetry } from './diagnosticsTypes';

export interface GatewayWebSocketStateProps {
  readonly telemetry: GatewayWebSocketTelemetry;
}

export function GatewayWebSocketState({ telemetry }: GatewayWebSocketStateProps) {
  return (
    <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="gateway-websocket-state">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Gateway WebSocket</h4>
        <span className="rounded border border-[var(--border-subtle)] px-2 py-0.5 text-[10px]">{telemetry.state}</span>
      </div>
      <dl className="mt-2 grid grid-cols-[7rem_minmax(0,1fr)] gap-2 text-xs">
        <dt className="text-[var(--text-tertiary)]">URL</dt>
        <dd className="truncate font-mono" title={telemetry.url}>{telemetry.url}</dd>
        <dt className="text-[var(--text-tertiary)]">Last ping</dt>
        <dd>{telemetry.lastPingAt ? new Date(telemetry.lastPingAt).toISOString() : 'pending'}</dd>
        <dt className="text-[var(--text-tertiary)]">Latency</dt>
        <dd>{typeof telemetry.latencyMs === 'number' ? `${telemetry.latencyMs}ms` : 'pending'}</dd>
      </dl>
      <div className="mt-3 space-y-1 text-[10px] text-[var(--text-tertiary)]" data-test="gateway-reconnect-history">
        {telemetry.reconnectHistory.length > 0 ? telemetry.reconnectHistory.map(entry => (
          <div key={`${entry.timestamp}-${entry.state}`}>
            {new Date(entry.timestamp).toISOString()} - {entry.state}{entry.reason ? ` - ${entry.reason}` : ''}
          </div>
        )) : 'no reconnects recorded'}
      </div>
    </section>
  );
}

