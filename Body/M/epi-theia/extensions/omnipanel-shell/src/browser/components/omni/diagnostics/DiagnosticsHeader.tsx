import type { DiagnosticsHealth } from './diagnosticsTypes';

export interface DiagnosticsHeaderProps {
  readonly health: DiagnosticsHealth;
  readonly summary: string;
  readonly lastTickAt: number | null;
}

export function DiagnosticsHeader({ health, summary, lastTickAt }: DiagnosticsHeaderProps) {
  const colorClass = health === 'ok'
    ? 'bg-emerald-400'
    : health === 'degraded'
      ? 'bg-amber-300'
      : 'bg-red-400';

  return (
    <header className="space-y-2" data-test="diagnostics-header">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-lg font-bold">Diagnostics</h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Telemetry fold for kernel bridge, profile ticks, S2 graph reachability, gateway WebSocket, layout state, and cross-layout intents.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-black/20 px-3 py-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} data-test="diagnostics-health-light" />
          <span className="text-xs" data-test="diagnostics-health-summary">{summary}</span>
        </div>
      </div>
      <div className="text-[10px] text-[var(--text-tertiary)]" data-test="diagnostics-last-tick">
        last tick: {lastTickAt ? new Date(lastTickAt).toISOString() : 'pending'}
      </div>
    </header>
  );
}

