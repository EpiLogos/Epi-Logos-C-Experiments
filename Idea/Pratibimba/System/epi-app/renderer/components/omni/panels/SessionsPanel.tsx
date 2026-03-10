import type { GatewaySessionRow } from '../../../controllers/epi-claw/types';
import type { SessionsState } from '../../../controllers/epi-claw/controllers';
import { formatTs } from './panelUtils';

type SessionsPanelProps = {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  sessions: SessionsState;
  sessionsActiveMinutes: string;
  sessionsLimit: string;
  sessionsIncludeGlobal: boolean;
  sessionsIncludeUnknown: boolean;
  onSetSessionsActiveMinutes: (v: string) => void;
  onSetSessionsLimit: (v: string) => void;
  onSetSessionsIncludeGlobal: (v: boolean) => void;
  onSetSessionsIncludeUnknown: (v: boolean) => void;
  onRefresh: () => void;
  onSelectSession: (key: string) => void;
  onPatchSessionLabel: (session: GatewaySessionRow) => void;
  onPatchSession: (key: string, patch: {
    label?: string | null;
    thinkingLevel?: string | null;
    verboseLevel?: string | null;
    reasoningLevel?: string | null;
  }) => void;
  onDeleteSession: (key: string) => void;
};

export function SessionsPanel({
  connectionState,
  sessions,
  sessionsActiveMinutes,
  sessionsLimit,
  sessionsIncludeGlobal,
  sessionsIncludeUnknown,
  onSetSessionsActiveMinutes,
  onSetSessionsLimit,
  onSetSessionsIncludeGlobal,
  onSetSessionsIncludeUnknown,
  onRefresh,
  onSelectSession,
  onPatchSessionLabel,
  onPatchSession,
  onDeleteSession,
}: SessionsPanelProps) {
  const sessionList = sessions.sessionsResult?.sessions ?? [];

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Sessions</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
          disabled={connectionState !== 'connected' || sessions.sessionsLoading}
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <input
          value={sessionsActiveMinutes}
          onChange={(e) => onSetSessionsActiveMinutes(e.target.value)}
          className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
          placeholder="active min"
        />
        <input
          value={sessionsLimit}
          onChange={(e) => onSetSessionsLimit(e.target.value)}
          className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
          placeholder="limit"
        />
        <label className="text-xs flex items-center gap-1">
          <input type="checkbox" checked={sessionsIncludeGlobal} onChange={(e) => onSetSessionsIncludeGlobal(e.target.checked)} />
          include global
        </label>
        <label className="text-xs flex items-center gap-1">
          <input type="checkbox" checked={sessionsIncludeUnknown} onChange={(e) => onSetSessionsIncludeUnknown(e.target.checked)} />
          include unknown
        </label>
      </div>

      {sessions.sessionsError && <div className="text-xs text-red-300">{sessions.sessionsError}</div>}
      <div className="space-y-2">
        {sessionList.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No sessions.</div>}
        {sessionList.map((session) => (
          <div key={session.key} className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-mono truncate" title={session.key}>{session.key}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
                  {session.kind} · updated {formatTs(session.updatedAt)} · model {session.model ?? 'n/a'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onSelectSession(session.key)}>Use</button>
                <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onPatchSessionLabel(session)}>Label</button>
                <button
                  className="text-[10px] px-2 py-1 rounded border border-red-500/40 text-red-300"
                  onClick={() => {
                    if (window.confirm(`Delete session ${session.key}?`)) {
                      onDeleteSession(session.key);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <label className="text-[10px] text-[var(--text-tertiary)]">
                Thinking
                <select
                  value={session.thinkingLevel ?? ''}
                  className="mt-1 w-full px-2 py-1 text-[10px] bg-black/30 border border-[var(--border-subtle)] rounded"
                  onChange={(e) => onPatchSession(session.key, { thinkingLevel: e.target.value || null })}
                >
                  <option value="">inherit</option>
                  <option value="off">off</option>
                  <option value="minimal">minimal</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label className="text-[10px] text-[var(--text-tertiary)]">
                Verbose
                <select
                  value={session.verboseLevel ?? ''}
                  className="mt-1 w-full px-2 py-1 text-[10px] bg-black/30 border border-[var(--border-subtle)] rounded"
                  onChange={(e) => onPatchSession(session.key, { verboseLevel: e.target.value || null })}
                >
                  <option value="">inherit</option>
                  <option value="off">off</option>
                  <option value="on">on</option>
                </select>
              </label>
              <label className="text-[10px] text-[var(--text-tertiary)]">
                Reasoning
                <select
                  value={session.reasoningLevel ?? ''}
                  className="mt-1 w-full px-2 py-1 text-[10px] bg-black/30 border border-[var(--border-subtle)] rounded"
                  onChange={(e) => onPatchSession(session.key, { reasoningLevel: e.target.value || null })}
                >
                  <option value="">inherit</option>
                  <option value="off">off</option>
                  <option value="on">on</option>
                  <option value="stream">stream</option>
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
