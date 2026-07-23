/**
 * Coordinate: M' `/` membrane (Dispatch Trace tab body — Track 27.T27.3)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniDispatchTrace fold body (27.3 owns it; dispatchGenealogy.ts).
 * Actualises: the Dispatch tab IS the Pi -> subagent invocation genealogy — the
 *   ONE allowed agentic path (Pi is the agentic system; subagents are its
 *   dispatched extension, `agent:<parent>:subagent:<child>` via
 *   `s4'.mediation.route`, one level). Renders the real genealogy tree
 *   (subagents nested UNDER their dispatcher, never top-level peers — DR-B-3),
 *   folded from live `sessions.list` lineage. Composition observability
 *   (29.T29.11) is retained as a clearly-subordinate section — it is NOT
 *   dispatch genealogy and never masquerades as it.
 * Public surface: DispatchTracePanel.
 * Does NOT own: the fold (dispatchGenealogyFromSessions), the tree face
 *   (DispatchGenealogyTree), session authority (S3), or intent routing (27.9).
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { SessionClient, SessionRecord } from '../../bridge/sessionClient';
import { useProvenanceStore } from '../../state/stores';
import { CompositionDispatchTracePane } from './CompositionDispatchTracePane';
import { DispatchGenealogyTree } from './DispatchGenealogyTree';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import { genealogyIndex, type DispatchDeepLink } from './dispatchGenealogy';
import type { ActorRole } from './omnipanelRuntime';

const ACTOR_FILTERS: readonly { readonly role: ActorRole | 'all'; readonly label: string }[] = [
    { role: 'all', label: 'All' },
    { role: 'pi', label: 'Pi' },
    { role: 'anima', label: 'Anima' },
    { role: 'subagent', label: 'Subagents' }
];

function formatDuration(durationMs: number | null): string {
    return durationMs === null ? 'running' : `${durationMs}ms`;
}

export function DispatchTracePanel() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actorFilter, setActorFilter] = useState<ActorRole | 'all'>('all');

    useEffect(() => {
        if (!connected) {
            return;
        }
        new SessionClient(gateway())
            .list()
            .then(setSessions)
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, [connected]);

    const records = useMemo(
        () => dispatchGenealogyFromSessions(sessions ?? []),
        [sessions]
    );
    const visibleRecords = useMemo(
        () => (actorFilter === 'all' ? records : records.filter(r => r.actor.role === actorFilter)),
        [records, actorFilter]
    );
    const index = useMemo(() => genealogyIndex(records), [records]);
    const selected = selectedId ? index.get(selectedId) ?? null : null;

    const onDeepLink = (_link: DispatchDeepLink) => {
        // Intent routing into the command spine is 27.9's lane; the descriptor
        // is carried as data here without a fabricated navigation.
    };

    return (
        <section className="dispatch-trace-panel" data-testid="dispatch-trace-panel">
            <header className="dispatch-trace-header" data-testid="dispatch-trace-header">
                <strong>Dispatch trace</strong>
                <span className="dispatch-trace-subtitle">Pi → Anima → subagent genealogy</span>
                <span className="dispatch-trace-count">{records.length} dispatches</span>
                <span className="dispatch-trace-filters" role="group" aria-label="actor filter">
                    {ACTOR_FILTERS.map(filter => (
                        <button
                            key={filter.role}
                            type="button"
                            className={`dispatch-actor-filter${actorFilter === filter.role ? ' active' : ''}`}
                            data-testid={`dispatch-actor-filter-${filter.role}`}
                            aria-pressed={actorFilter === filter.role}
                            onClick={() => setActorFilter(filter.role)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </span>
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
                    onSelect={setSelectedId}
                    onDeepLink={onDeepLink}
                />
            )}

            {selected && (
                <aside className="dispatch-node-detail" data-testid="dispatch-node-detail">
                    <h4>{selected.actor.actor}</h4>
                    <dl>
                        <dt>role</dt>
                        <dd>{selected.actor.role}</dd>
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
                </aside>
            )}

            <details className="dispatch-composition-observability" data-testid="dispatch-composition-observability">
                <summary>Composition observability</summary>
                <CompositionDispatchTracePane />
            </details>
        </section>
    );
}
