import type { PresenceState } from '../../../controllers/epi-claw/controllers';
import { formatTs } from './panelUtils';

type InstancesPanelProps = {
  presence: PresenceState;
  onRefresh: () => void;
};

export function InstancesPanel({ presence, onRefresh }: InstancesPanelProps) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Instances</h3>
        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefresh} disabled={presence.presenceLoading}>Refresh</button>
      </div>
      {presence.presenceError && <div className="text-xs text-red-300">{presence.presenceError}</div>}
      <div className="space-y-2">
        {presence.presenceEntries.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No presence entries.</div>}
        {presence.presenceEntries.map((entry, idx) => (
          <div key={`${entry.instanceId ?? idx}`} className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
            <div className="text-xs font-semibold">{entry.host ?? entry.instanceId ?? 'unknown'}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
              {entry.platform ?? 'n/a'} · {entry.deviceFamily ?? 'n/a'} · mode {entry.mode ?? 'n/a'}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)]">last seen {formatTs(entry.ts ?? null)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
