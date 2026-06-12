import type { SessionManagerRow } from './sessionManagerModel';

type SessionListProps = {
  sessions: readonly SessionManagerRow[];
  selectedSessionKey: string | null;
  onSelectSession: (sessionKey: string) => void;
  onUseSession: (sessionKey: string) => void;
  onCloseSession: (sessionKey: string) => void;
  formatTime: (ts: number | null | undefined) => string;
};

export function SessionList({
  sessions,
  selectedSessionKey,
  onSelectSession,
  onUseSession,
  onCloseSession,
  formatTime,
}: SessionListProps) {
  if (sessions.length === 0) {
    return <div className="rounded border border-[var(--border-subtle)] bg-white/5 p-4 text-xs italic text-[var(--text-tertiary)]">No sessions for the current day-now anchor.</div>;
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.key}
          role="button"
          tabIndex={0}
          className={[
            'w-full rounded border bg-white/5 p-3 text-left transition-colors',
            selectedSessionKey === session.key ? 'border-[var(--color-m5)]/60' : 'border-[var(--border-subtle)] hover:bg-white/10',
          ].join(' ')}
          onClick={() => onSelectSession(session.key)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelectSession(session.key);
            }
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-all font-mono text-xs text-[var(--text-primary)]">{session.key}</span>
                {session.activeNow && <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-200">active now</span>}
                {session.isMainSession && <span className="rounded bg-[var(--color-m5)]/15 px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">main</span>}
                <PrivacyClassBadge privacyClass={session.privacyClass} />
              </div>
              <div className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">{session.nowWikilink}</div>
              <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                opened {formatTime(session.openedAt)} | coordinate {session.activeCoordinate ?? 'pending'} | dispatches {session.dispatchCount ?? 0}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="rounded border border-[var(--border-subtle)] px-2 py-1 text-[10px] text-[var(--text-secondary)]"
                onClick={(event) => {
                  event.stopPropagation();
                  onUseSession(session.key);
                }}
              >
                Use
              </button>
              <button
                type="button"
                className="rounded border border-red-500/40 px-2 py-1 text-[10px] text-red-300"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseSession(session.key);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrivacyClassBadge({ privacyClass }: { privacyClass?: string | null }) {
  const normalized = (privacyClass ?? '').trim();
  if (!normalized) {
    return <span className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)]">M4 public</span>;
  }
  const protectedLocal = normalized === 'protected_local' || normalized.startsWith('m4');
  return (
    <span className={[
      'rounded border px-1.5 py-0.5 text-[10px]',
      protectedLocal ? 'border-amber-400/40 bg-amber-500/10 text-amber-200' : 'border-[var(--border-subtle)] text-[var(--text-tertiary)]',
    ].join(' ')}>
      {protectedLocal ? `M4 ${normalized}` : normalized}
    </span>
  );
}
