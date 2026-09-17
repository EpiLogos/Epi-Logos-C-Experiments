import type {
  MExtensionReadinessSnapshot,
  MExtensionReadinessState
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import { KernelBridgeReadinessChip } from '../gateway/GatewayHeader';

export const READINESS_CLASSES: readonly MExtensionReadinessState[] = Object.freeze([
  'bridge_unavailable',
  'profile_missing_field',
  's2_graph_blocked',
  's3_subscription_blocked',
  's5_review_blocked',
  'authority_payload_missing',
  'privacy_blocked',
  'degraded_but_readable',
  'ready_public_current'
]);

export interface ReadinessClassSummary {
  state: MExtensionReadinessState;
  count: number;
  blockers: string[];
  latest: MExtensionReadinessSnapshot | null;
}

export type ReadinessLedgerSummary = Record<MExtensionReadinessState, ReadinessClassSummary>;

export interface KernelBridgeReadinessSummaryProps {
  readonly ledger: readonly MExtensionReadinessSnapshot[];
  readonly onDrillDown?: (state: MExtensionReadinessState) => void;
}

export function summarizeReadinessLedger(ledger: readonly MExtensionReadinessSnapshot[]): ReadinessLedgerSummary {
  const summary = Object.fromEntries(
    READINESS_CLASSES.map(state => [
      state,
      {
        state,
        count: 0,
        blockers: [] as string[],
        latest: null as MExtensionReadinessSnapshot | null
      }
    ])
  ) as ReadinessLedgerSummary;

  for (const snapshot of ledger) {
    const row = summary[snapshot.state];
    row.count += 1;
    row.latest = !row.latest || snapshot.fetchedAt >= row.latest.fetchedAt ? snapshot : row.latest;
    row.blockers = [...new Set([...row.blockers, ...snapshot.blockerIds])];
  }

  return summary;
}

export function KernelBridgeReadinessSummary({
  ledger,
  onDrillDown
}: KernelBridgeReadinessSummaryProps) {
  const summary = summarizeReadinessLedger(ledger);
  const latest = [...ledger].sort((a, b) => b.fetchedAt - a.fetchedAt)[0] ?? null;

  return (
    <section className="space-y-3" data-test="kernel-bridge-readiness-summary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Kernel bridge readiness ledger</h4>
        {latest ? (
          <KernelBridgeReadinessChip snapshot={latest} onActivateDiagnostics={() => onDrillDown?.(latest.state)} />
        ) : null}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {READINESS_CLASSES.map(state => {
          const row = summary[state];
          return (
            <button
              key={state}
              type="button"
              className="min-w-0 rounded border border-[var(--border-subtle)] bg-black/20 p-3 text-left"
              onClick={() => onDrillDown?.(state)}
              data-test={`readiness-class-${state}`}
            >
              <div className="flex items-center justify-between gap-2">
                <code className="truncate text-[10px]">{state}</code>
                <span className="text-xs">{row.count}</span>
              </div>
              <div className="mt-2 min-h-8 text-[10px] text-[var(--text-tertiary)]">
                {row.blockers.length > 0 ? row.blockers.join(', ') : row.latest?.reason ?? 'No entries'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
