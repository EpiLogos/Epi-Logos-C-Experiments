import type { ToolStreamEvent } from '../../../../common/omnipanel-runtime';
import {
  uniqueToolStreamValues,
  type ToolStreamFiltersState
} from './toolStreamModel';

type ToolStreamFiltersProps = {
  events: readonly ToolStreamEvent[];
  filters: ToolStreamFiltersState;
  onChange: (filters: ToolStreamFiltersState) => void;
};

export function ToolStreamFilters({ events, filters, onChange }: ToolStreamFiltersProps) {
  const actors = uniqueToolStreamValues(events, (event) => event.actor);
  const tools = uniqueToolStreamValues(events, (event) => event.tool);
  const kinds = uniqueToolStreamValues(events, (event) => event.kind);
  const privacyClasses = uniqueToolStreamValues(events, (event) => event.privacyClass ?? 'public');

  const update = (patch: Partial<ToolStreamFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-2" data-test="tool-stream-filters">
      <label className="space-y-1">
        <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Actor</span>
        <select
          value={filters.actor ?? 'all'}
          onChange={(event) => update({ actor: event.currentTarget.value })}
          className="w-full px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        >
          <option value="all">All</option>
          {actors.map((actor) => <option key={actor} value={actor}>{actor}</option>)}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Tool</span>
        <input
          list="tool-stream-tool-names"
          value={filters.toolName ?? ''}
          onChange={(event) => update({ toolName: event.currentTarget.value })}
          placeholder="Tool name"
          className="w-full px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        />
        <datalist id="tool-stream-tool-names">
          {tools.map((tool) => <option key={tool} value={tool} />)}
        </datalist>
      </label>

      <label className="space-y-1">
        <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Range</span>
        <select
          value={rangePreset(filters)}
          onChange={(event) => update({ timeRange: presetRange(event.currentTarget.value, events) })}
          className="w-full px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        >
          <option value="full-session">Full session</option>
          <option value="last-5m">Last 5m</option>
          <option value="last-hour">Last hour</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Kind</span>
        <select
          value={filters.eventKind ?? 'all'}
          onChange={(event) => update({ eventKind: event.currentTarget.value })}
          className="w-full px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        >
          <option value="all">All</option>
          {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Privacy</span>
        <select
          value={filters.privacyClass ?? 'all'}
          onChange={(event) => update({ privacyClass: event.currentTarget.value })}
          className="w-full px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        >
          <option value="all">All</option>
          {privacyClasses.map((privacyClass) => <option key={privacyClass} value={privacyClass}>{privacyClass}</option>)}
        </select>
      </label>
    </div>
  );
}

function rangePreset(filters: ToolStreamFiltersState): string {
  if (!filters.timeRange) {
    return 'full-session';
  }
  return 'custom';
}

function presetRange(value: string, events: readonly ToolStreamEvent[]) {
  if (value === 'full-session') {
    return undefined;
  }
  const max = Math.max(...events.map((event) => event.emittedAtMs ?? 0), 0);
  if (value === 'last-5m') {
    return { fromMs: max - 5 * 60 * 1000, toMs: max };
  }
  if (value === 'last-hour') {
    return { fromMs: max - 60 * 60 * 1000, toMs: max };
  }
  return undefined;
}
