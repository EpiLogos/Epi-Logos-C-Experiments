import type {
  DispatchGenealogySnapshot,
  DispatchGenealogyEvent,
  DispatchGenealogySelection
} from '../../../../common/dispatch-genealogy';
import {
  findDispatchGenealogyNode,
  flattenDispatchGenealogyEvents,
  selectDispatchGenealogyNode
} from '../../../../common/dispatch-genealogy';
import {
  sanitizeProtectedHandle,
  type ProtectedHandleMetadata,
  type ToolStreamEvent
} from '../../../../common/omnipanel-runtime';

export type ToolStreamTimeRange = {
  readonly fromMs?: number | null;
  readonly toMs?: number | null;
};

export type ToolStreamFiltersState = {
  readonly actor?: string;
  readonly toolName?: string;
  readonly timeRange?: ToolStreamTimeRange;
  readonly eventKind?: string;
  readonly privacyClass?: string;
};

export type ToolStreamTabState = {
  readonly filters: ToolStreamFiltersState;
  readonly selectedEventId: string | null;
  readonly scrollOffset: number;
  readonly live: boolean;
};

export const DEFAULT_TOOL_STREAM_FILTERS: ToolStreamFiltersState = Object.freeze({});

export const DEFAULT_TOOL_STREAM_TAB_STATE: ToolStreamTabState = Object.freeze({
  filters: DEFAULT_TOOL_STREAM_FILTERS,
  selectedEventId: null,
  scrollOffset: 0,
  live: true
});

export type ToolStreamDispatchLink = {
  readonly tabId: 'dispatch-trace';
  readonly dispatchNodeId: string;
  readonly selection: DispatchGenealogySelection;
};

export function toolStreamEventsFromSnapshot(snapshot: DispatchGenealogySnapshot): readonly ToolStreamEvent[] {
  return Object.freeze(flattenDispatchGenealogyEvents(snapshot).map((event) => {
    const dispatchNodeId = event.dispatchNodeId ?? event.nodeId;
    const node = findDispatchGenealogyNode(snapshot, dispatchNodeId);
    const payload = asRecord(event.payload);
    const args = event.args ?? payload?.args ?? payload?.input ?? event.payload;
    const result = event.result ?? payload?.result ?? payload?.output;
    const privacyClass = event.privacyClass ?? stringValue(payload?.privacyClass) ?? null;
    return Object.freeze({
      id: event.id,
      emittedAtMs: event.emittedAtMs,
      tool: event.tool,
      kind: event.kind,
      payload: event.payload,
      privacyClass,
      actor: event.actor ?? node?.agentId ?? event.provenance.teamRole ?? 'pi',
      dispatchNodeId,
      sessionKey: event.sessionKey ?? event.provenance.sessionKey ?? snapshot.sessionKey,
      tickAtEmit: event.tickAtEmit ?? event.provenance.profileGeneration ?? snapshot.generatedAtMs,
      inputDigest: event.inputDigest ?? stringValue(payload?.inputDigest),
      outputDigest: event.outputDigest ?? stringValue(payload?.outputDigest),
      latencyMs: event.latencyMs ?? latencyFromNode(node),
      evidencePacketRef: event.evidencePacketRef ?? event.evidenceRef?.id ?? node?.evidenceRef?.id ?? null,
      args,
      result,
      error: event.error ?? payload?.error
    } satisfies ToolStreamEvent);
  }));
}

export function filterToolStreamEvents(
  events: readonly ToolStreamEvent[],
  filters: ToolStreamFiltersState = DEFAULT_TOOL_STREAM_FILTERS
): readonly ToolStreamEvent[] {
  const actor = normalizeFilter(filters.actor);
  const toolName = normalizeFilter(filters.toolName);
  const eventKind = normalizeFilter(filters.eventKind);
  const privacyClass = normalizeFilter(filters.privacyClass);
  const range = filters.timeRange;

  return Object.freeze(events.filter((event) => {
    if (actor && event.actor !== actor) {
      return false;
    }
    if (toolName && !event.tool.toLowerCase().includes(toolName.toLowerCase())) {
      return false;
    }
    if (eventKind && event.kind !== eventKind) {
      return false;
    }
    if (privacyClass && normalizePrivacyClass(event.privacyClass) !== privacyClass) {
      return false;
    }
    if (range) {
      const emittedAtMs = event.emittedAtMs ?? Number.NEGATIVE_INFINITY;
      if (typeof range.fromMs === 'number' && emittedAtMs < range.fromMs) {
        return false;
      }
      if (typeof range.toMs === 'number' && emittedAtMs > range.toMs) {
        return false;
      }
    }
    return true;
  }));
}

export function resolveToolStreamDispatchLink(
  event: ToolStreamEvent,
  snapshot: DispatchGenealogySnapshot
): ToolStreamDispatchLink | null {
  const selection = selectDispatchGenealogyNode(snapshot, event.dispatchNodeId);
  if (!selection) {
    return null;
  }
  return Object.freeze({
    tabId: 'dispatch-trace',
    dispatchNodeId: event.dispatchNodeId,
    selection
  });
}

export function findFirstToolStreamEventForNode(
  events: readonly ToolStreamEvent[],
  dispatchNodeId: string | null | undefined
): ToolStreamEvent | null {
  if (!dispatchNodeId) {
    return null;
  }
  return events.find((event) => event.dispatchNodeId === dispatchNodeId) ?? null;
}

export function uniqueToolStreamValues(
  events: readonly ToolStreamEvent[],
  selector: (event: ToolStreamEvent) => string | null | undefined
): readonly string[] {
  return Object.freeze([...new Set(events.map(selector).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)));
}

export function previewToolStreamValue(event: ToolStreamEvent, value: unknown): string {
  const privacyClass = normalizePrivacyClass(event.privacyClass);
  if (privacyClass === 'private') {
    return 'private - not displayed';
  }
  if (privacyClass === 'protected' || privacyClass === 'protected-local') {
    return formatProtectedHandle(sanitizeProtectedHandle(value));
  }
  return truncate(formatPublicValue(value), 180);
}

export function detailToolStreamValue(event: ToolStreamEvent, value: unknown): string {
  const privacyClass = normalizePrivacyClass(event.privacyClass);
  if (privacyClass === 'private') {
    return 'private - not displayed';
  }
  if (privacyClass === 'protected' || privacyClass === 'protected-local') {
    return formatProtectedHandle(sanitizeProtectedHandle(value));
  }
  return formatPublicValue(value);
}

export function normalizePrivacyClass(value: unknown): string {
  const raw = typeof value === 'string' && value.trim().length > 0 ? value.trim().toLowerCase() : 'public';
  return raw === 'protected-local' ? 'protected-local' : raw;
}

function formatProtectedHandle(handle: ProtectedHandleMetadata): string {
  return [
    `handle: ${handle.handle}`,
    `namespace: ${handle.namespace}`,
    `privacy: ${handle.privacyClass}`,
    handle.summary ? `summary: ${handle.summary}` : null
  ].filter(Boolean).join('\n');
}

function formatPublicValue(value: unknown): string {
  if (value === undefined) {
    return 'none';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3)}...`;
}

function latencyFromNode(node: ReturnType<typeof findDispatchGenealogyNode>): number | null {
  if (!node?.startedAtMs || !node.endedAtMs) {
    return null;
  }
  return Math.max(0, node.endedAtMs - node.startedAtMs);
}

function normalizeFilter(value: string | null | undefined): string | null {
  if (!value || value === 'all') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
