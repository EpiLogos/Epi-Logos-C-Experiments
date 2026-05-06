import type { LogsState } from '../../../controllers/epi-claw/controllers';

type LogsPanelProps = {
  logs: LogsState;
  logsLimit: string;
  onSetLogsLimit: (v: string) => void;
  onRefresh: () => void;
};

export function LogsPanel({ logs, logsLimit, onSetLogsLimit, onRefresh }: LogsPanelProps) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Logs</h3>
        <div className="flex gap-2 items-center">
          <input value={logsLimit} onChange={(e) => onSetLogsLimit(e.target.value)} className="w-20 px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" />
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefresh} disabled={logs.logsLoading}>Refresh</button>
        </div>
      </div>
      {logs.logsError && <div className="text-xs text-red-300">{logs.logsError}</div>}
      <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {logs.logsEntries.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No logs loaded.</div>}
        {logs.logsEntries.map((entry, idx) => (
          <div key={`${idx}-${entry.raw.slice(0, 16)}`} className="text-[10px] p-2 rounded border border-[var(--border-subtle)] bg-black/30">
            <div className="text-[var(--text-tertiary)]">{entry.time ?? ''} {entry.level ?? ''} {entry.subsystem ?? ''}</div>
            <div className="whitespace-pre-wrap break-words">{entry.message ?? entry.raw}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
