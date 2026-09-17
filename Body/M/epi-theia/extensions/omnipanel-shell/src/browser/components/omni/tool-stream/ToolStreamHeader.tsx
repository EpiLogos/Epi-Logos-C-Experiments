type ToolStreamHeaderProps = {
  sessionKey: string | null;
  eventCount: number;
  filteredCount: number;
  live: boolean;
  loading: boolean;
  onToggleLive: () => void;
  onClear: () => void;
  onRefresh: () => void;
};

export function ToolStreamHeader({
  sessionKey,
  eventCount,
  filteredCount,
  live,
  loading,
  onToggleLive,
  onClear,
  onRefresh
}: ToolStreamHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold">Tool Stream</h3>
        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
          {filteredCount}/{eventCount} event(s) / {sessionKey ?? 'no-session'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleLive}
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
          aria-pressed={live}
        >
          {live ? 'Live' : 'Paused'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
