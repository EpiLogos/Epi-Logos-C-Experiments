import type { ReactNode } from 'react';
import type { ReviewHistoryEntry } from '../../../../common/omnipanel-runtime';

// Track 27 T27.6 — chronological transition history from `s5'.review.history`.
//
// Read-only ledger of every verdict transition for the selected review item,
// oldest → newest, with the actor, whether the actor was human, and the reason.

export type ReviewHistoryListProps = {
  entries: readonly ReviewHistoryEntry[];
};

export function ReviewHistoryList({ entries }: ReviewHistoryListProps) {
  const ordered = [...entries].sort(
    (left, right) => (left.transitionAtMs ?? 0) - (right.transitionAtMs ?? 0)
  );

  return (
    <section
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="review-history-list"
      data-history-count={ordered.length}
    >
      <div className="mb-2 text-xs font-semibold">Transition History</div>
      {ordered.length === 0 ? (
        <div className="text-[11px] italic text-[var(--text-tertiary)]" data-test="review-history-empty">
          No transitions recorded for this item.
        </div>
      ) : (
        <ol className="space-y-1.5">
          {ordered.map((entry) => (
            <li
              key={entry.id}
              data-test={`review-history-entry-${entry.id}`}
              data-decision={entry.decision}
              data-actor-is-human={entry.actorIsHuman ? 'true' : 'false'}
              className="px-2 py-1.5 rounded border border-[var(--border-subtle)] bg-black/10"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono min-w-0 truncate">
                  {entry.fromStatus ?? '∅'} → <strong>{entry.toStatus}</strong>
                </span>
                <span className="flex gap-1 shrink-0">
                  <Badge>{entry.decision}</Badge>
                  <Badge>
                    {entry.actor}
                    {entry.actorIsHuman ? ' · human' : ' · agent'}
                  </Badge>
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                {entry.reason ? (
                  <span className="text-[10px] text-[var(--text-tertiary)] min-w-0 truncate" title={entry.reason}>
                    {entry.reason}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-mono">
                  {formatHistoryTs(entry.transitionAtMs)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] truncate">
      {children}
    </span>
  );
}

function formatHistoryTs(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  return new Date(value).toISOString().replace('T', ' ').replace('Z', '');
}
