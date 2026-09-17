import * as React from 'react';
import {
  buildPiRuntimeMonitorProjection,
  type GatewayResolvedSessionSurface,
  type PiRuntimeMonitorProjection,
  type PortalTemporalSurfaceContract
} from '../../../../common/omnipanel-runtime';

export interface PiMonitorPaneProps {
  readonly portalTemporalSurface: PortalTemporalSurfaceContract;
  readonly resolvedSession: GatewayResolvedSessionSurface;
}

/**
 * Read-only Pi runtime observability pane inside the OmniPanel Diagnostics tab.
 * Raw terminal scrollback is never rendered; terminal access stays behind
 * bounded capture handles and explicit diagnostics commands.
 */
export function PiMonitorPane({
  portalTemporalSurface,
  resolvedSession
}: PiMonitorPaneProps): React.ReactElement {
  const projection = buildPiRuntimeMonitorProjection({
    portalTemporalSurface,
    resolvedSession
  });
  return <PiMonitorProjectionView projection={projection} />;
}

export function PiMonitorProjectionView({
  projection
}: {
  readonly projection: PiRuntimeMonitorProjection;
}): React.ReactElement {
  return (
    <section
      className="rounded border border-[var(--border-subtle)] bg-black/20 p-3"
      data-test="pi-monitor-pane"
      data-terminal-status={projection.terminalStatus}
      data-terminal-backed={projection.terminalBacked ? 'true' : 'false'}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Pi Runtime Monitor</h4>
          <p className="mt-1 text-[10px] text-[var(--text-tertiary)]" data-test="pi-monitor-session-key">
            {projection.sessionKey}
          </p>
        </div>
        <span className="rounded border border-[var(--border-subtle)] px-2 py-1 text-[10px]">
          {projection.captureAvailability}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
        <PiMonitorField label="Active agent" value={projection.activeAgent} testId="pi-monitor-active-agent" />
        <PiMonitorField label="Role" value={projection.role} testId="pi-monitor-role" />
        <PiMonitorField label="NOW / day" value={projection.nowDayLink} testId="pi-monitor-now-day" />
        <PiMonitorField label="cmux" value={projection.cmuxProjection} testId="pi-monitor-cmux-projection" />
        <PiMonitorField label="Terminal provider" value={projection.terminalProvider} testId="pi-monitor-terminal-provider" />
        <PiMonitorField label="terminalStatus" value={projection.terminalStatus} testId="pi-monitor-terminal-status" />
        <PiMonitorField label="leaseExpires" value={projection.leaseExpires} testId="pi-monitor-lease-expires" />
        <PiMonitorField label="Last observed tick" value={projection.lastObservedTick} testId="pi-monitor-last-observed-tick" />
        <PiMonitorField label="Capture handle" value={projection.captureHandleRef ?? 'none'} testId="pi-monitor-capture-handle" />
        <PiMonitorField label="Last-run handle" value={projection.redactedLastRunHandle} testId="pi-monitor-last-run-handle" />
      </dl>

      <div className="mt-3 text-[10px] text-[var(--text-tertiary)]">
        <div>Lineage: {projection.teamChainLineage.join(' > ') || 'none'}</div>
        <ul className="mt-2 space-y-1" data-test="pi-monitor-diagnostics-links">
          {projection.diagnosticsDeepLinks.map(link => (
            <li key={link}>
              <code>{link}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PiMonitorField({
  label,
  value,
  testId
}: {
  readonly label: string;
  readonly value: string;
  readonly testId: string;
}): React.ReactElement {
  return (
    <div>
      <dt className="text-[10px] uppercase text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-0.5 truncate text-[var(--text-primary)]" data-test={testId}>{value}</dd>
    </div>
  );
}
