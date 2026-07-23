/**
 * Coordinate: M' `/` membrane (Tool Stream tab body — Track 27.T27.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniLogs / tool-stream fold body (27.4; dispatchGenealogy.ts).
 * Actualises: the TEMPORAL fold of the SAME Pi -> subagent genealogy the
 *   Dispatch tab folds structurally (15.11 — "trace is the tree; stream is the
 *   time-ordered event list"). Folds live `sessions.list` lineage through
 *   `foldGenealogyStream` and renders it via `DispatchGenealogyStream`, with a
 *   live/paused toggle (the profile tick drives refresh only when live), actor +
 *   event-kind + time-range filters, an event detail, and evidence deep-linking
 *   to the Evidence tab. Rows carry NO raw payload/body — only method, kind,
 *   actor, status — so protected content can never leak through this face.
 *   Selection, filters, and the live flag persist in the OmniPanel session store.
 * Public surface: ToolStreamPanel.
 * Does NOT own: the folds (dispatchGenealogy.ts), the stream face
 *   (DispatchGenealogyStream), session authority (S3), intent routing (27.9).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { SessionClient, SessionRecord } from '../../bridge/sessionClient';
import { useProvenanceStore } from '../../state/stores';
import { useProfileTick } from '../../state/useProfileTick';
import { DispatchGenealogyStream } from './DispatchGenealogyStream';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import {
    DISPATCH_STREAM_KIND_INVOKED,
    DISPATCH_STREAM_KIND_SETTLED,
    foldGenealogyStream,
    genealogyIndex,
    type DispatchDeepLink
} from './dispatchGenealogy';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';
import type { ActorRole } from './omnipanelRuntime';

const ACTOR_FILTERS: readonly { readonly role: ActorRole | 'all'; readonly label: string }[] = [
    { role: 'all', label: 'All' },
    { role: 'pi', label: 'Pi' },
    { role: 'anima', label: 'Anima' },
    { role: 'subagent', label: 'Subagents' }
];

type TimeRange = 'last-5m' | 'last-hour' | 'full-session';
const TIME_RANGES: readonly { readonly id: TimeRange; readonly label: string }[] = [
    { id: 'last-5m', label: 'Last 5m' },
    { id: 'last-hour', label: 'Last hour' },
    { id: 'full-session', label: 'Full session' }
];
const TIME_WINDOW_MS: Readonly<Record<TimeRange, number>> = {
    'last-5m': 5 * 60_000,
    'last-hour': 60 * 60_000,
    'full-session': Number.POSITIVE_INFINITY
};

const EVENT_KINDS: readonly { readonly id: string; readonly label: string }[] = [
    { id: DISPATCH_STREAM_KIND_INVOKED, label: 'invoked' },
    { id: DISPATCH_STREAM_KIND_SETTLED, label: 'settled' }
];

const REFETCH_TICKS = 30;

function normaliseTimeRange(value: string | undefined): TimeRange {
    return value === 'last-5m' || value === 'last-hour' ? value : 'full-session';
}

export function ToolStreamPanel() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const tab = useOmniPanelTabState('tool-stream');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const selectTab = useOmniPanelSessionStore(s => s.selectTab);
    const tick = useProfileTick();
    const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (!connected) {
            return;
        }
        new SessionClient(gateway())
            .list()
            .then(setSessions)
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, [connected]);

    // Live/paused: the profile tick only refetches while the stream is live.
    const refetchEpoch = Math.floor((tick.generation ?? 0) / REFETCH_TICKS);
    useEffect(() => {
        if (!tab.live) {
            return;
        }
        refresh();
    }, [refresh, refetchEpoch, tab.live]);
    // Always fetch once on connect, even if paused, so there is something to show.
    useEffect(() => {
        refresh();
    }, [refresh]);

    const records = useMemo(() => dispatchGenealogyFromSessions(sessions ?? []), [sessions]);
    const index = useMemo(() => genealogyIndex(records), [records]);

    const actorFilter = tab.filters.actor;
    const timeRange = normaliseTimeRange(tab.filters.timeRange);
    const eventKinds = tab.filters.eventKind ?? [];
    const activeActor: ActorRole | 'all' = actorFilter ? (actorFilter as ActorRole) : 'all';

    const latestAtMs = useMemo(
        () => records.reduce((max, record) => Math.max(max, record.startedAtMs), 0),
        [records]
    );
    const visibleRecords = useMemo(() => {
        const window = TIME_WINDOW_MS[timeRange];
        return records.filter(record => {
            const roleOk = activeActor === 'all' || record.actor.role === activeActor;
            const timeOk = window === Number.POSITIVE_INFINITY || record.startedAtMs >= latestAtMs - window;
            return roleOk && timeOk;
        });
    }, [records, activeActor, timeRange, latestAtMs]);

    // Event-kind filter operates over the folded stream (invoked/settled rows).
    const streamCount = useMemo(() => {
        const events = foldGenealogyStream(visibleRecords);
        return eventKinds.length === 0 ? events.length : events.filter(e => eventKinds.includes(e.kind)).length;
    }, [visibleRecords, eventKinds]);

    // When a kind filter is active, drop records that would yield no kept event.
    const kindFilteredRecords = useMemo(() => {
        if (eventKinds.length === 0) {
            return visibleRecords;
        }
        const wantInvoked = eventKinds.includes(DISPATCH_STREAM_KIND_INVOKED);
        const wantSettled = eventKinds.includes(DISPATCH_STREAM_KIND_SETTLED);
        return visibleRecords.filter(record => {
            const settled = record.endedAtMs !== null;
            return (wantInvoked) || (wantSettled && settled);
        });
    }, [visibleRecords, eventKinds]);

    const selected = tab.selectedEventId ? index.get(tab.selectedEventId) ?? null : null;

    const setActor = (role: ActorRole | 'all') =>
        patchTab('tool-stream', { filters: { ...tab.filters, actor: role === 'all' ? undefined : role } });
    const setTimeRange = (range: TimeRange) =>
        patchTab('tool-stream', { filters: { ...tab.filters, timeRange: range } });
    const toggleKind = (kind: string) => {
        const next = new Set(eventKinds);
        if (next.has(kind)) {
            next.delete(kind);
        } else {
            next.add(kind);
        }
        patchTab('tool-stream', { filters: { ...tab.filters, eventKind: [...next] } });
    };
    const toggleLive = () => patchTab('tool-stream', { live: !tab.live });
    const onSelect = (nodeId: string) => {
        patchTab('tool-stream', { selectedEventId: nodeId });
        // 15.11 same-data linking: highlight the same node in the Dispatch Trace fold.
        patchTab('dispatch-trace', { selectedNodeId: nodeId });
    };
    const onDeepLink = (link: DispatchDeepLink) => {
        if (link.target === 'omniEvidence') {
            selectTab('evidence');
        }
    };

    return (
        <section className="tool-stream-panel" data-testid="tool-stream-panel">
            <header className="tool-stream-header" data-testid="tool-stream-header">
                <div className="tool-stream-title">
                    <strong>Tool stream</strong>
                    <span className="tool-stream-subtitle">time-ordered dispatch events</span>
                    <span className="tool-stream-count">{streamCount} events</span>
                    <button
                        type="button"
                        className={`tool-stream-live${tab.live ? ' active' : ''}`}
                        data-testid="tool-stream-live-toggle"
                        aria-pressed={tab.live}
                        onClick={toggleLive}
                    >
                        {tab.live ? '● live' : '⏸ paused'}
                    </button>
                </div>
                <div className="tool-stream-controls">
                    <span className="tool-stream-filters" role="group" aria-label="actor filter">
                        {ACTOR_FILTERS.map(filter => (
                            <button
                                key={filter.role}
                                type="button"
                                className={`tool-stream-actor-filter${activeActor === filter.role ? ' active' : ''}`}
                                data-testid={`tool-stream-actor-filter-${filter.role}`}
                                aria-pressed={activeActor === filter.role}
                                onClick={() => setActor(filter.role)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </span>
                    <span className="tool-stream-kinds" role="group" aria-label="event kind filter">
                        {EVENT_KINDS.map(kind => (
                            <button
                                key={kind.id}
                                type="button"
                                className={`tool-stream-kind-filter${eventKinds.includes(kind.id) ? ' active' : ''}`}
                                data-testid={`tool-stream-kind-${kind.label}`}
                                aria-pressed={eventKinds.includes(kind.id)}
                                onClick={() => toggleKind(kind.id)}
                            >
                                {kind.label}
                            </button>
                        ))}
                    </span>
                    <span className="tool-stream-timerange" role="group" aria-label="time range">
                        {TIME_RANGES.map(range => (
                            <button
                                key={range.id}
                                type="button"
                                className={`tool-stream-timerange${timeRange === range.id ? ' active' : ''}`}
                                data-testid={`tool-stream-timerange-${range.id}`}
                                aria-pressed={timeRange === range.id}
                                onClick={() => setTimeRange(range.id)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </span>
                </div>
            </header>

            {!connected ? (
                <p className="pane-message" data-testid="tool-stream-disconnected">
                    gateway not connected — no stream to fold
                </p>
            ) : error ? (
                <p className="pane-message" data-testid="tool-stream-error">
                    {error}
                </p>
            ) : (
                <DispatchGenealogyStream
                    records={kindFilteredRecords}
                    selectedId={tab.selectedEventId}
                    onSelect={onSelect}
                    onDeepLink={onDeepLink}
                />
            )}

            {selected && (
                <aside className="tool-stream-detail" data-testid="tool-stream-detail">
                    <h4>{selected.actor.actor}</h4>
                    <dl>
                        <dt>role</dt>
                        <dd>{selected.actor.role}</dd>
                        <dt>method</dt>
                        <dd>{selected.route.method}</dd>
                        <dt>status</dt>
                        <dd>{selected.status}</dd>
                        {selected.aletheiaSubagent && (
                            <>
                                <dt>Aletheia subagent</dt>
                                <dd>{selected.aletheiaSubagent}</dd>
                            </>
                        )}
                    </dl>
                </aside>
            )}
        </section>
    );
}
