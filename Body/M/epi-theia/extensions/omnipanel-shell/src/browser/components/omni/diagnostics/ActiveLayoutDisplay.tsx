import type { ActiveLayoutTelemetry } from './diagnosticsTypes';

export interface ActiveLayoutDisplayProps {
  readonly telemetry: ActiveLayoutTelemetry;
}

export function ActiveLayoutDisplay({ telemetry }: ActiveLayoutDisplayProps) {
  return (
    <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="active-layout-display">
      <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Active layout</h4>
      <dl className="mt-2 grid grid-cols-[9rem_minmax(0,1fr)] gap-2 text-xs">
        <dt className="text-[var(--text-tertiary)]">Layout</dt>
        <dd>{telemetry.layoutId}</dd>
        <dt className="text-[var(--text-tertiary)]">0/1 toggle</dt>
        <dd>{telemetry.dailyToggle ?? 'not active'}</dd>
        <dt className="text-[var(--text-tertiary)]">OmniPanel tab</dt>
        <dd>{telemetry.activeOmniPanelTab}</dd>
        <dt className="text-[var(--text-tertiary)]">Activity bar</dt>
        <dd>{telemetry.activeActivityBarMode}</dd>
      </dl>
    </section>
  );
}

