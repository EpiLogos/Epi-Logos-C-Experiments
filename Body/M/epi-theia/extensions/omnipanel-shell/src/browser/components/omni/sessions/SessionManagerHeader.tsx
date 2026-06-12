import { useState } from 'react';
import { OmniButton } from '../ui/button';
import { OmniInput } from '../ui/input';
import type { SessionManagerModel } from './sessionManagerModel';

type SessionManagerHeaderProps = {
  model: SessionManagerModel;
  connectionReady: boolean;
  loading: boolean;
  onRefresh: () => void;
  onStartSession: (topic: string, dayId: string | null) => Promise<void> | void;
  onSwitchSession: (sessionKey: string) => void;
};

export function SessionManagerHeader({
  model,
  connectionReady,
  loading,
  onRefresh,
  onStartSession,
  onSwitchSession,
}: SessionManagerHeaderProps) {
  const [topic, setTopic] = useState('');
  const [starting, setStarting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Session Manager</h3>
          <div className="mt-1 text-[10px] uppercase text-[var(--text-tertiary)]">day-now anchor</div>
          <div className="mt-1 break-all font-mono text-xs text-[var(--text-secondary)]">{model.dayNowAnchor}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={model.activeSessionKey ?? ''}
            disabled={!connectionReady || model.sessions.length === 0}
            className="rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-1.5 text-xs text-[var(--text-primary)]"
            onChange={(event) => {
              if (event.target.value) {
                onSwitchSession(event.target.value);
              }
            }}
          >
            <option value="">Switch session</option>
            {model.sessions.map((session) => (
              <option key={session.key} value={session.key}>
                {session.displayName || session.label || session.key}
              </option>
            ))}
          </select>
          <OmniButton onClick={onRefresh} disabled={!connectionReady || loading}>
            {loading ? 'Loading' : 'Refresh'}
          </OmniButton>
        </div>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!connectionReady || starting) {
            return;
          }
          setStarting(true);
          Promise.resolve(onStartSession(topic, model.dayId))
            .then(() => setTopic(''))
            .finally(() => setStarting(false));
        }}
      >
        <OmniInput
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Optional topic for new session"
          disabled={!connectionReady || starting}
        />
        <OmniButton type="submit" variant="default" disabled={!connectionReady || starting}>
          New session
        </OmniButton>
      </form>
    </div>
  );
}
