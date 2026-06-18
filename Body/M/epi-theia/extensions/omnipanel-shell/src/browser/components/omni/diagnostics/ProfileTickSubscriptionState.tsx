import type { DiagnosticsProfileTick, LaggingProfileSubscriber } from './diagnosticsTypes';

export interface ProfileTickSubscriptionStateProps {
  readonly subscriberCount: number;
  readonly tickHistory: readonly DiagnosticsProfileTick[];
  readonly lastTickProcessedAt: number | null;
  readonly laggingSubscribers: readonly LaggingProfileSubscriber[];
}

export function tickAdvanceRate(tickHistory: readonly DiagnosticsProfileTick[]): number {
  const advanced = tickHistory.filter(tick => tick.advanced && tick.emittedAt > 0);
  if (advanced.length < 2) {
    return 0;
  }
  const first = advanced[0];
  const last = advanced[advanced.length - 1];
  const seconds = (last.emittedAt - first.emittedAt) / 1000;
  return seconds > 0 ? (advanced.length - 1) / seconds : 0;
}

export function ProfileTickSubscriptionState({
  subscriberCount,
  tickHistory,
  lastTickProcessedAt,
  laggingSubscribers
}: ProfileTickSubscriptionStateProps) {
  const generations = tickHistory
    .map(tick => tick.generation)
    .filter((generation): generation is number => typeof generation === 'number');
  const rate = tickAdvanceRate(tickHistory);

  return (
    <section className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test="profile-tick-subscription-state">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Profile tick subscription state</h4>
        <span className="text-xs" data-test="profile-tick-subscriber-count">subscribers: {subscriberCount}</span>
      </div>
      <div className="mt-2 grid gap-2 text-[10px] text-[var(--text-tertiary)] md:grid-cols-3">
        <div data-test="profile-tick-history">history: {generations.length > 0 ? generations.slice(-12).join(' -> ') : 'pending'}</div>
        <div data-test="profile-tick-rate">ticks/sec: {Number.isInteger(rate) ? rate : rate.toFixed(2)}</div>
        <div data-test="profile-tick-last-processed">
          last processed: {lastTickProcessedAt ? new Date(lastTickProcessedAt).toISOString() : 'pending'}
        </div>
      </div>
      {laggingSubscribers.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[10px] text-amber-200" data-test="profile-tick-lagging-subscribers">
          {laggingSubscribers.map(subscriber => (
            <li key={subscriber.subscriberId}>
              {subscriber.subscriberId}: {subscriber.lagMs}ms lag
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-[10px] text-emerald-200">no subscriber lag detected</div>
      )}
    </section>
  );
}

