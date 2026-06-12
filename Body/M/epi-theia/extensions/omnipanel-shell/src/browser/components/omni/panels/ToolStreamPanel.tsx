import { useMemo, useState } from 'react';
import type {
  DispatchGenealogySelection,
  DispatchGenealogySnapshot
} from '../../../../common/dispatch-genealogy';
import type { ToolStreamEvent } from '../../../../common/omnipanel-runtime';
import { ToolEventDetail } from '../tool-stream/ToolEventDetail';
import { ToolStreamFilters } from '../tool-stream/ToolStreamFilters';
import { ToolStreamHeader } from '../tool-stream/ToolStreamHeader';
import { ToolStreamRenderer } from '../tool-stream/ToolStreamRenderer';
import {
  DEFAULT_TOOL_STREAM_TAB_STATE,
  filterToolStreamEvents,
  findFirstToolStreamEventForNode,
  resolveToolStreamDispatchLink,
  toolStreamEventsFromSnapshot,
  type ToolStreamFiltersState,
  type ToolStreamTabState
} from '../tool-stream/toolStreamModel';

type ToolStreamPanelProps = {
  snapshot: DispatchGenealogySnapshot;
  selectedNodeId: string | null;
  loading: boolean;
  error: string | null;
  initialState?: Partial<ToolStreamTabState>;
  onStateChange?: (state: ToolStreamTabState) => void;
  onRefresh: () => void;
  onSelectNode: (selection: DispatchGenealogySelection) => void;
  onActivateDispatchTrace?: (selection: DispatchGenealogySelection) => void;
  onOpenEvidence: (selection: DispatchGenealogySelection) => void;
  onOpenSource: (selection: DispatchGenealogySelection) => void;
};

export function ToolStreamPanel({
  snapshot,
  selectedNodeId,
  loading,
  error,
  initialState,
  onStateChange,
  onRefresh,
  onSelectNode,
  onActivateDispatchTrace,
  onOpenEvidence,
}: ToolStreamPanelProps) {
  const [filters, setFiltersState] = useState<ToolStreamFiltersState>(
    initialState?.filters ?? DEFAULT_TOOL_STREAM_TAB_STATE.filters
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialState?.selectedEventId ?? null
  );
  const [scrollOffset, setScrollOffsetState] = useState(initialState?.scrollOffset ?? 0);
  const [live, setLive] = useState(initialState?.live ?? DEFAULT_TOOL_STREAM_TAB_STATE.live);
  const [clearedBefore, setClearedBefore] = useState<number | null>(null);

  const allEvents = useMemo(() => toolStreamEventsFromSnapshot(snapshot), [snapshot]);
  const visibleByClear = useMemo(
    () => clearedBefore === null
      ? allEvents
      : allEvents.filter((event) => (event.emittedAtMs ?? 0) > clearedBefore),
    [allEvents, clearedBefore]
  );
  const filteredEvents = useMemo(
    () => filterToolStreamEvents(visibleByClear, filters),
    [visibleByClear, filters]
  );
  const selectedEvent = useMemo(
    () => filteredEvents.find((event) => event.id === selectedEventId)
      ?? findFirstToolStreamEventForNode(filteredEvents, selectedNodeId),
    [filteredEvents, selectedEventId, selectedNodeId]
  );

  const persistState = (patch: Partial<ToolStreamTabState>) => {
    onStateChange?.({
      filters,
      selectedEventId,
      scrollOffset,
      live,
      ...patch
    });
  };

  const setFilters = (nextFilters: ToolStreamFiltersState) => {
    setFiltersState(nextFilters);
    persistState({ filters: nextFilters });
  };
  const setScrollOffset = (nextScrollOffset: number) => {
    setScrollOffsetState(nextScrollOffset);
    persistState({ scrollOffset: nextScrollOffset });
  };
  const setSelectedEvent = (event: ToolStreamEvent | null) => {
    setSelectedEventId(event?.id ?? null);
    persistState({ selectedEventId: event?.id ?? null });
  };
  const toggleLive = () => {
    setLive((current) => {
      const next = !current;
      persistState({ live: next });
      return next;
    });
  };

  const openDispatchTrace = (event: ToolStreamEvent) => {
    const link = resolveToolStreamDispatchLink(event, snapshot);
    if (!link) {
      return;
    }
    onSelectNode(link.selection);
    onActivateDispatchTrace?.(link.selection);
  };

  const openEvidence = (event: ToolStreamEvent) => {
    const link = resolveToolStreamDispatchLink(event, snapshot);
    if (link) {
      onOpenEvidence(link.selection);
    }
  };

  return (
    <div className="p-6 space-y-4" data-test="tool-stream-panel">
      <ToolStreamHeader
        sessionKey={snapshot.sessionKey}
        eventCount={visibleByClear.length}
        filteredCount={filteredEvents.length}
        live={live}
        loading={loading}
        onToggleLive={toggleLive}
        onClear={() => setClearedBefore(Date.now())}
        onRefresh={onRefresh}
      />

      {error && <div className="text-xs text-red-300">{error}</div>}

      <ToolStreamFilters
        events={visibleByClear}
        filters={filters}
        onChange={setFilters}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4">
        <ToolStreamRenderer
          events={filteredEvents}
          selectedEventId={selectedEvent?.id ?? null}
          selectedDispatchNodeId={selectedNodeId}
          scrollOffset={scrollOffset}
          onScrollOffsetChange={setScrollOffset}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            openDispatchTrace(event);
          }}
        />
        <ToolEventDetail
          event={selectedEvent ?? null}
          onOpenDispatchTrace={openDispatchTrace}
          onOpenEvidence={openEvidence}
        />
      </div>
    </div>
  );
}
