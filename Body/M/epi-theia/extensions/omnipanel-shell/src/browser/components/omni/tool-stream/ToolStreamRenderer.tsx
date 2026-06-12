import type { ToolStreamEvent } from '../../../../common/omnipanel-runtime';
import { formatTs } from '../panels/panelUtils';
import {
  normalizePrivacyClass,
  previewToolStreamValue
} from './toolStreamModel';

type ToolStreamRendererProps = {
  events: readonly ToolStreamEvent[];
  selectedEventId: string | null;
  selectedDispatchNodeId?: string | null;
  scrollOffset?: number;
  height?: number;
  rowHeight?: number;
  onScrollOffsetChange?: (scrollOffset: number) => void;
  onSelectEvent: (event: ToolStreamEvent) => void;
};

export function ToolStreamRenderer({
  events,
  selectedEventId,
  selectedDispatchNodeId = null,
  scrollOffset = 0,
  height = 560,
  rowHeight = 64,
  onScrollOffsetChange,
  onSelectEvent
}: ToolStreamRendererProps) {
  const overscan = 4;
  const startIndex = Math.max(0, Math.floor(scrollOffset / rowHeight) - overscan);
  const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
  const visibleEvents = events.slice(startIndex, startIndex + visibleCount);
  const totalHeight = events.length * rowHeight;

  return (
    <div
      data-test="tool-stream-virtual-list"
      style={{ height, overflowY: 'auto' }}
      onScroll={(event) => onScrollOffsetChange?.(event.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {events.length === 0 && (
          <div className="text-xs text-[var(--text-tertiary)] italic">No tool events resolved.</div>
        )}
        {visibleEvents.map((event, offset) => {
          const index = startIndex + offset;
          return (
            <ToolStreamRow
              key={event.id}
              event={event}
              top={index * rowHeight}
              height={rowHeight}
              selected={event.id === selectedEventId || event.dispatchNodeId === selectedDispatchNodeId}
              onSelectEvent={onSelectEvent}
            />
          );
        })}
      </div>
    </div>
  );
}

type ToolStreamRowProps = {
  event: ToolStreamEvent;
  top: number;
  height: number;
  selected: boolean;
  onSelectEvent: (event: ToolStreamEvent) => void;
};

function ToolStreamRow({ event, top, height, selected, onSelectEvent }: ToolStreamRowProps) {
  const privacyClass = normalizePrivacyClass(event.privacyClass);
  return (
    <button
      type="button"
      data-test={`tool-stream-row-${event.id}`}
      data-dispatch-node-id={event.dispatchNodeId}
      data-selected={selected ? 'true' : 'false'}
      onClick={() => onSelectEvent(event)}
      className={`absolute left-0 right-0 px-3 py-2 text-left rounded border ${
        selected
          ? 'border-[var(--color-m5)]/70 bg-[var(--color-m5)]/15'
          : 'border-[var(--border-subtle)] bg-white/5 hover:bg-white/10'
      }`}
      style={{ top, height: Math.max(0, height - 6) }}
    >
      <span hidden data-test={`dispatch-genealogy-event-${event.id}`} />
      <div className="grid grid-cols-[86px_76px_96px_minmax(110px,1fr)_minmax(110px,1fr)_minmax(110px,1fr)_70px_92px] gap-2 items-center min-w-0">
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
          {formatTs(event.emittedAtMs)}
        </span>
        <Badge>{event.actor}</Badge>
        <Badge>{event.kind}</Badge>
        <span className="text-xs font-semibold truncate" title={event.tool}>{event.tool}</span>
        <span className="text-[10px] text-[var(--text-secondary)] truncate" title={previewToolStreamValue(event, event.args)}>
          {previewToolStreamValue(event, event.args)}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] truncate" title={previewToolStreamValue(event, event.result ?? event.error)}>
          {previewToolStreamValue(event, event.result ?? event.error)}
        </span>
        <Badge>{typeof event.latencyMs === 'number' ? `${event.latencyMs}ms` : 'pending'}</Badge>
        <Badge>{privacyClass}</Badge>
      </div>
    </button>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] truncate">
      {children}
    </span>
  );
}
