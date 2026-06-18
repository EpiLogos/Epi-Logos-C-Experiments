import type { S2GraphReachabilityState } from './diagnosticsTypes';

export interface S2GraphReachabilityProps {
  readonly state: S2GraphReachabilityState;
}

export function S2GraphReachability({ state }: S2GraphReachabilityProps) {
  return (
    <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="s2-graph-reachability">
      <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">S2 graph reachability</h4>
      <dl className="mt-2 grid grid-cols-[9rem_minmax(0,1fr)] gap-2 text-xs">
        <dt className="text-[var(--text-tertiary)]">Bimba namespace</dt>
        <dd>{state.bimbaReachable ? 'reachable' : 'blocked'}</dd>
        <dt className="text-[var(--text-tertiary)]">Gnosis namespace</dt>
        <dd>{state.gnosisReachable ? 'reachable' : 'blocked'}</dd>
        <dt className="text-[var(--text-tertiary)]">Embedding dims</dt>
        <dd>GEMINI_EMBED_DIMS={state.embeddingDimensions}</dd>
        <dt className="text-[var(--text-tertiary)]">Last ping</dt>
        <dd>{state.checkedAt ? new Date(state.checkedAt).toISOString() : 'pending'}</dd>
        <dt className="text-[var(--text-tertiary)]">Reason</dt>
        <dd>{state.reason ?? 'none'}</dd>
      </dl>
    </section>
  );
}

