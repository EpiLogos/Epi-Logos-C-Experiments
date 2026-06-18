import type { DiagnosticsProfileTick } from './diagnosticsTypes';

export interface MathemeProfileGenerationDisplayProps {
  readonly profileGeneration: number | null;
  readonly tickHistory: readonly DiagnosticsProfileTick[];
}

export function MathemeProfileGenerationDisplay({
  profileGeneration,
  tickHistory
}: MathemeProfileGenerationDisplayProps) {
  const generations = tickHistory
    .map(tick => tick.generation)
    .filter((generation): generation is number => typeof generation === 'number');

  return (
    <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="profile-generation-display">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Matheme profile generation</div>
      <div className="mt-2 text-2xl font-semibold">{profileGeneration ?? 'pending'}</div>
      <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
        tick history: {generations.length > 0 ? generations.slice(-12).join(' -> ') : 'pending'}
      </div>
    </section>
  );
}

