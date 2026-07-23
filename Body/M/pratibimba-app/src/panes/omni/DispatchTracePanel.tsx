/**
 * Coordinate: M' `/` membrane (Dispatch Trace tab body — Track 27.T27.3)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniDispatchTrace fold body (27.3 owns it; dispatchGenealogy.ts).
 * Actualises: the Dispatch tab IS the Pi -> subagent invocation genealogy — the
 *   ONE allowed agentic path. Renders the real genealogy tree (subagents nested
 *   UNDER their dispatcher, DR-B-3; Aletheia fan-outs grouped in
 *   crystallisation-mode; per-node psyche-facet + veto banner), folded live
 *   from `sessions.list` lineage and refreshed on the profile tick (15.6).
 *   Header carries the actor + time-range filters and the psyche-facet legend;
 *   selection, filters, and fold state persist in the OmniPanel session store;
 *   an evidence deep-link activates the Evidence tab (15.11 same-data linking).
 *   Composition observability (29.T29.11) survives only as a subordinate section.
 * Public surface: DispatchTracePanel.
 * Does NOT own: the fold (dispatchGenealogyFromSessions), the tree face
 *   (DispatchGenealogyTree), session authority (S3), or the command spine (27.9).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { SessionClient, SessionRecord } from '../../bridge/sessionClient';
import { useProvenanceStore } from '../../state/stores';
import { useProfileTick } from '../../state/useProfileTick';
import { CompositionDispatchTracePane } from './CompositionDispatchTracePane';
import { DispatchGenealogyTree } from './DispatchGenealogyTree';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import { genealogyIndex, type DispatchDeepLink } from './dispatchGenealogy';
import { PSYCHE_FACETS, PSYCHE_FACET_LABEL, psycheFacetClass } from './psycheFacet';
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

// Refetch the lineage roughly every 30 profile ticks — live without hammering.
const REFETCH_TICKS = 30;

function formatDuration(durationMs: number | null): string {
    return durationMs === null ? 'running' : `${durationMs}ms`;
}

export function DispatchTracePanel() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const tab = useOmniPanelTabState('dispatch-trace');
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

    // Live: refetch on connect and every REFETCH_TICKS profile ticks (15.6).
    const refetchEpoch = Math.floor((tick.generation ?? 0) / REFETCH_TICKS);
    useEffect(() => {
        refresh();
    }, [refresh, refetchEpoch]);

    const records = useMemo(() => dispatchGenealogyFromSessions(sessions ?? []), [sessions]);
    const index = useMemo(() => genealogyIndex(records), [records]);

    const actorFilter = tab.actorFilter;
    const timeRangeFilter = tab.timeRangeFilter;
    const selectedId = tab.selectedNodeId;
    const activeActor: ActorRole | 'all' = actorFilter.length === 1 ? (actorFilter[0] as ActorRole) : 'all';

    // Time window is relative to the latest dispatch (deterministic, no clock).
    const latestAtMs = useMemo(
        () => records.reduce((max, record) => Math.max(max, record.startedAtMs), 0),
        [records]
    );
    const visibleRecords = useMemo(() => {
        const window = TIME_WINDOW_MS[timeRangeFilter];
        return records.filter(record => {
            const roleOk = actorFilter.length === 0 || actorFilter.includes(record.actor.role);
            const timeOk = window === Number.POSITIVE_INFINITY || record.startedAtMs >= latestAtMs - window;
            return roleOk && timeOk;
        });
    }, [records, actorFilter, timeRangeFilter, latestAtMs]);

    const selected = selectedId ? index.get(selectedId) ?? null : null;

    const setActor = (role: ActorRole | 'all') =>
        patchTab('dispatch-trace', { actorFilter: role === 'all' ? [] : [role] });
    const setTimeRange = (range: TimeRange) => patchTab('dispatch-trace', { timeRangeFilter: range });
    const onSelect = (nodeId: string) => {
        patchTab('dispatch-trace', { selectedNodeId: nodeId });
        // 15.11 same-data linking: highlight the same dispatch in the Tool Stream fold.
        patchTab('tool-stream', { selectedEventId: nodeId });
    };
    const onToggleCollapse = (nodeId: string) => {
        // Persist fold state: expandedNodeIds carries the ids diverged from the
        // default-expanded tree (i.e. the collapsed set).
        const collapsed = new Set(tab.expandedNodeIds);
        if (collapsed.has(nodeId)) {
            collapsed.delete(nodeId);
        } else {
            collapsed.add(nodeId);
        }
        patchTab('dispatch-trace', { expandedNodeIds: [...collapsed] });
    };
    const onDeepLink = (link: DispatchDeepLink) => {
        // 15.11 same-data linking: an evidence chip activates the Evidence tab.
        if (link.target === 'omniEvidence') {
            selectTab('evidence');
        }
        // backendStudio deep-links resolve in ide-deep (Backend Studio, 28.13) —
        // carried as data here, routed through the command spine by 27.9.
    };

    return (
        <section className="dispatch-trace-panel" data-testid="dispatch-trace-panel">
            <header className="dispatch-trace-header" data-testid="dispatch-trace-header">
                <div className="dispatch-trace-title">
                    <strong>Dispatch trace</strong>
                    <span className="dispatch-trace-subtitle">Pi → Anima → subagent genealogy</span>
                    <span className="dispatch-trace-count">{records.length} dispatches</span>
                </div>
                <div className="dispatch-trace-controls">
                    <span className="dispatch-trace-filters" role="group" aria-label="actor filter">
                        {ACTOR_FILTERS.map(filter => (
                            <button
                                key={filter.role}
                                type="button"
                                className={`dispatch-actor-filter${activeActor === filter.role ? ' active' : ''}`}
                                data-testid={`dispatch-actor-filter-${filter.role}`}
                                aria-pressed={activeActor === filter.role}
                                onClick={() => setActor(filter.role)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </span>
                    <span className="dispatch-trace-timerange" role="group" aria-label="time range">
                        {TIME_RANGES.map(range => (
                            <button
                                key={range.id}
                                type="button"
                                className={`dispatch-timerange${timeRangeFilter === range.id ? ' active' : ''}`}
                                data-testid={`dispatch-timerange-${range.id}`}
                                aria-pressed={timeRangeFilter === range.id}
                                onClick={() => setTimeRange(range.id)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </span>
                </div>
                <div className="dispatch-psyche-legend" data-testid="dispatch-psyche-legend" role="list" aria-label="psyche-facet legend">
                    {PSYCHE_FACETS.map(facet => (
                        <span
                            key={facet}
                            role="listitem"
                            className={`psyche-legend-item ${psycheFacetClass(facet)}`}
                            data-testid={`psyche-legend-${facet}`}
                        >
                            <span className="psyche-legend-swatch" aria-hidden="true" />
                            {PSYCHE_FACET_LABEL[facet]}
                        </span>
                    ))}
                </div>
            </header>

            {!connected ? (
                <p className="pane-message" data-testid="dispatch-trace-disconnected">
                    gateway not connected — no genealogy to fold
                </p>
            ) : error ? (
                <p className="pane-message" data-testid="dispatch-trace-error">
                    {error}
                </p>
            ) : (
                <DispatchGenealogyTree
                    records={visibleRecords}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDeepLink={onDeepLink}
                    collapsedIds={tab.expandedNodeIds}
                    onToggleCollapse={onToggleCollapse}
                />
            )}

            {selected && (
                <aside className="dispatch-node-detail" data-testid="dispatch-node-detail">
                    <h4>{selected.actor.actor}</h4>
                    <dl>
                        <dt>role</dt>
                        <dd>{selected.actor.role}</dd>
                        {selected.psycheFacet && (
                            <>
                                <dt>psyche facet</dt>
                                <dd data-testid="detail-psyche-facet">{PSYCHE_FACET_LABEL[selected.psycheFacet]}</dd>
                            </>
                        )}
                        {selected.aletheiaSubagent && (
                            <>
                                <dt>Aletheia subagent</dt>
                                <dd data-testid="detail-aletheia-subagent">{selected.aletheiaSubagent}</dd>
                            </>
                        )}
                        <dt>route</dt>
                        <dd>{selected.route.method}</dd>
                        {selected.route.capability && (
                            <>
                                <dt>capability</dt>
                                <dd>{selected.route.capability}</dd>
                            </>
                        )}
                        <dt>status</dt>
                        <dd>{selected.status}</dd>
                        <dt>duration</dt>
                        <dd>
                            {formatDuration(
                                selected.endedAtMs === null
                                    ? null
                                    : Math.max(0, selected.endedAtMs - selected.startedAtMs)
                            )}
                        </dd>
                    </dl>
                    {selected.aletheiaFacetReturn?.kind === 'veto' && (
                        <p className="dispatch-detail-veto" data-testid="detail-veto">
                            veto: {selected.aletheiaFacetReturn.reason}
                        </p>
                    )}
                </aside>
            )}

            <details className="dispatch-composition-observability" data-testid="dispatch-composition-observability">
                <summary>Composition observability</summary>
                <CompositionDispatchTracePane />
            </details>
        </section>
    );
}
