import type { CrossLayoutIntent } from '@pratibimba/pratibimba-layouts/lib/common/cross-layout-intent';
import type { CrossLayoutIntentLogEntry } from './diagnosticsTypes';

export const CROSS_LAYOUT_INTENT_LOG_LIMIT = 32;

let intentLogSequence = 0;

export function createIntentLogEntry(
  intent: CrossLayoutIntent,
  options: {
    readonly timestamp?: number;
    readonly status?: 'success' | 'failure';
    readonly error?: string | null;
  } = {}
): CrossLayoutIntentLogEntry {
  const timestamp = options.timestamp ?? Date.now();
  intentLogSequence += 1;
  return Object.freeze({
    id: `${timestamp}-${intentLogSequence}`,
    timestamp,
    originatingTabOrExtension: intent.reason ?? intent.sessionKey ?? intent.requestedExtensionId ?? 'unknown',
    targetTabOrExtension: [intent.requestedExtensionId, intent.requestedContributionId].filter(Boolean).join('/') || intent.requestedLayout,
    status: options.status ?? 'success',
    error: options.error ?? null,
    intent
  });
}

export function reduceIntentLog(
  entries: readonly CrossLayoutIntentLogEntry[],
  next: CrossLayoutIntentLogEntry
): readonly CrossLayoutIntentLogEntry[] {
  return Object.freeze([...entries, next].slice(-CROSS_LAYOUT_INTENT_LOG_LIMIT));
}

export interface CrossLayoutIntentLogProps {
  readonly entries: readonly CrossLayoutIntentLogEntry[];
  readonly expandedEntryId?: string | null;
  readonly onToggleEntry?: (entryId: string) => void;
}

export function CrossLayoutIntentLog({
  entries,
  expandedEntryId = null,
  onToggleEntry
}: CrossLayoutIntentLogProps) {
  return (
    <section className="space-y-2" data-test="cross-layout-intent-log">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">CrossLayoutIntent log</h4>
        <span className="text-[10px] text-[var(--text-tertiary)]">{entries.length}/{CROSS_LAYOUT_INTENT_LOG_LIMIT}</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-[var(--text-tertiary)]">No cross-layout intents in this session.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const expanded = expandedEntryId === entry.id;
            return (
              <article key={entry.id} className="rounded border border-[var(--border-subtle)] bg-black/20 p-3" data-test={`intent-log-entry-${entry.id}`}>
                <button
                  type="button"
                  className="grid w-full gap-2 text-left text-xs md:grid-cols-[10rem_1fr_1fr_5rem]"
                  onClick={() => onToggleEntry?.(entry.id)}
                  aria-expanded={expanded}
                >
                  <span>{new Date(entry.timestamp).toISOString()}</span>
                  <span className="truncate">from {entry.originatingTabOrExtension}</span>
                  <span className="truncate">to {entry.targetTabOrExtension}</span>
                  <span>{entry.status}</span>
                </button>
                <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
                  {summarizeIntentPayload(entry.intent)}
                  {entry.error ? <span className="ml-2 text-red-200">{entry.error}</span> : null}
                </div>
                {expanded ? (
                  <pre className="mt-2 max-h-72 overflow-auto rounded bg-black/30 p-2 text-[10px]" data-test={`intent-log-detail-${entry.id}`}>
                    {JSON.stringify(entry.intent, null, 2)}
                  </pre>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function summarizeIntentPayload(intent: CrossLayoutIntent): string {
  const parts = [
    intent.coordinate ? `coordinate=${intent.coordinate}` : null,
    intent.artifactUri ? `artifact=${intent.artifactUri}` : null,
    intent.reviewId ? `review=${intent.reviewId}` : null,
    intent.profileGeneration !== null ? `generation=${intent.profileGeneration}` : null,
    intent.privacyClass ? `privacy=${intent.privacyClass}` : null
  ].filter(Boolean);
  return parts.join(' | ') || 'layout-only intent';
}

