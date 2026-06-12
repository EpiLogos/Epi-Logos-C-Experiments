import { useEffect, useMemo, useState } from 'react';
import type { GatewaySessionRow } from '../../../controllers/epi-claw/types';
import type { SessionsState } from '../../../controllers/epi-claw/controllers';
import { formatTs } from './panelUtils';
import { SessionDetailPane } from '../sessions/SessionDetailPane';
import { SessionList } from '../sessions/SessionList';
import { SessionManagerHeader } from '../sessions/SessionManagerHeader';
import { buildSessionManagerModel } from '../sessions/sessionManagerModel';

type SessionManagerPanelProps = {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  activeSessionKey: string | null;
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
  onStartSession: (topic: string, dayId: string | null) => Promise<void> | void;
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

export function SessionManagerPanel({
  connectionState,
  activeSessionKey,
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
  onStartSession,
  onSelectSession,
  onPatchSessionLabel,
  onPatchSession,
  onDeleteSession,
}: SessionManagerPanelProps) {
  const model = useMemo(() => buildSessionManagerModel({
    result: sessions.sessionsResult,
    activeSessionKey,
  }), [activeSessionKey, sessions.sessionsResult]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<string | null>(model.sessions[0]?.key ?? null);

  useEffect(() => {
    if (!selectedSessionKey || !model.sessions.some((session) => session.key === selectedSessionKey)) {
      setSelectedSessionKey(model.sessions[0]?.key ?? null);
    }
  }, [model.sessions, selectedSessionKey]);

  const selectedSession = model.sessions.find((session) => session.key === selectedSessionKey) ?? model.sessions[0] ?? null;

  return (
    <div className="p-6 space-y-4">
      <SessionManagerHeader
        model={model}
        connectionReady={connectionState === 'connected'}
        loading={sessions.sessionsLoading}
        onRefresh={onRefresh}
        onStartSession={onStartSession}
        onSwitchSession={onSelectSession}
      />

      <div className="rounded border border-[var(--border-subtle)] bg-white/5 p-3">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            value={sessionsActiveMinutes}
            onChange={(event) => onSetSessionsActiveMinutes(event.target.value)}
            className="rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-1 text-xs"
            placeholder="active min"
          />
          <input
            value={sessionsLimit}
            onChange={(event) => onSetSessionsLimit(event.target.value)}
            className="rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-1 text-xs"
            placeholder="limit"
          />
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={sessionsIncludeGlobal} onChange={(event) => onSetSessionsIncludeGlobal(event.target.checked)} />
            include global
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={sessionsIncludeUnknown} onChange={(event) => onSetSessionsIncludeUnknown(event.target.checked)} />
            include unknown
          </label>
        </div>
        <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
          Source: {model.sourceMethod}; main session: {model.mainSessionKey}
        </div>
      </div>

      {sessions.sessionsError && <div className="text-xs text-red-300">{sessions.sessionsError}</div>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <SessionList
          sessions={model.sessions}
          selectedSessionKey={selectedSession?.key ?? null}
          onSelectSession={setSelectedSessionKey}
          onUseSession={onSelectSession}
          onCloseSession={(key) => {
            if (window.confirm(`Close session ${key}?`)) {
              onDeleteSession(key);
            }
          }}
          formatTime={formatTs}
        />
        <div className="space-y-3">
          <SessionDetailPane session={selectedSession} formatTime={formatTs} />
          {selectedSession && (
            <SessionRuntimeControls
              session={selectedSession}
              onPatchSessionLabel={onPatchSessionLabel}
              onPatchSession={onPatchSession}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SessionRuntimeControls({
  session,
  onPatchSessionLabel,
  onPatchSession,
}: {
  session: GatewaySessionRow;
  onPatchSessionLabel: (session: GatewaySessionRow) => void;
  onPatchSession: (key: string, patch: {
    label?: string | null;
    thinkingLevel?: string | null;
    verboseLevel?: string | null;
    reasoningLevel?: string | null;
  }) => void;
}) {
  return (
    <div className="rounded border border-[var(--border-subtle)] bg-white/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-[var(--text-primary)]">Runtime controls</div>
        <button className="rounded border border-[var(--border-subtle)] px-2 py-1 text-[10px]" onClick={() => onPatchSessionLabel(session)}>Label</button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <SessionSelect label="Thinking" value={session.thinkingLevel ?? ''} options={['off', 'minimal', 'low', 'medium', 'high']} onChange={(value) => onPatchSession(session.key, { thinkingLevel: value || null })} />
        <SessionSelect label="Verbose" value={session.verboseLevel ?? ''} options={['off', 'on']} onChange={(value) => onPatchSession(session.key, { verboseLevel: value || null })} />
        <SessionSelect label="Reasoning" value={session.reasoningLevel ?? ''} options={['off', 'on', 'stream']} onChange={(value) => onPatchSession(session.key, { reasoningLevel: value || null })} />
      </div>
    </div>
  );
}

function SessionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[10px] text-[var(--text-tertiary)]">
      {label}
      <select
        value={value}
        className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-1 text-[10px]"
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">inherit</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
