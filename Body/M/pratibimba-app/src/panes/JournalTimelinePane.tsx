/**
 * Coordinate: M' M4' (journal timeline — Track 25.T25.3)
 * Actualises: the NOW-inscription timeline over `nara.journal.timeline`
 *   (30-day bound, newest-first, protected-local). Each row is a SESSION's
 *   NOW inscription — day chip, NOW timestamp, session-key short prefix, and
 *   the kind-icon ribbon of what the session inscribed; clicking opens the
 *   session's now.md (the carrier twin of `m4.openArtifact`). There is NO
 *   silent fallback to a file listing: a dark gateway names itself, because a
 *   quiet substrate walk here would repaint the very gap this tranche closed.
 */

import { useEffect, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { useSessionStore, useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { MExtensionEmptyState } from '../ui/mExtensionEmptyStates';
import {
    JOURNAL_TIMELINE_DAY_RANGE,
    JOURNAL_TIMELINE_METHOD,
    journalKindIcon,
    parseJournalTimeline,
    sessionNowVaultPath,
    shortSessionKey,
    type JournalTimelineRead
} from './journalTimeline';

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

type TimelineState =
    | { readonly kind: 'loading' }
    | { readonly kind: 'dark'; readonly reason: string }
    | { readonly kind: 'read'; readonly read: JournalTimelineRead };

export function JournalTimelinePane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const generation = useTickStore(s => s.generation);
    const [state, setState] = useState<TimelineState>({ kind: 'loading' });

    useEffect(() => {
        let cancelled = false;
        if (!gatewayReady()) {
            setState({ kind: 'dark', reason: `${JOURNAL_TIMELINE_METHOD}: gateway not connected` });
            return;
        }
        gateway()
            .invoke(JOURNAL_TIMELINE_METHOD, { dayRange: JOURNAL_TIMELINE_DAY_RANGE })
            .then(receipt => {
                if (!cancelled) {
                    setState({ kind: 'read', read: parseJournalTimeline(artifactOf(receipt)) });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({
                        kind: 'dark',
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [generation]);

    const chrome = privacyChrome('protected_local');
    const rows = state.kind === 'read' && state.read.kind === 'read' ? state.read.rows : null;

    return (
        <div
            className={`timeline-pane ${chrome.className}`}
            title={chrome.title}
            data-testid="journal-timeline"
            data-state={state.kind === 'read' ? state.read.kind : state.kind}
            data-day-range={JOURNAL_TIMELINE_DAY_RANGE}
        >
            <div className="pane-toolbar">
                <button
                    type="button"
                    data-testid="begin-today"
                    onClick={() => void commands.execute('journal.beginToday')}
                >
                    ☀ begin today
                </button>
            </div>
            {state.kind === 'loading' ? <div className="pane-message">reading the ledger…</div> : null}
            {state.kind === 'dark' ? (
                <div className="pane-message" data-testid="journal-timeline-dark">
                    timeline unavailable: {state.reason}
                </div>
            ) : null}
            {state.kind === 'read' && state.read.kind === 'refused' ? (
                <div className="pane-message" data-testid="journal-timeline-refused">
                    timeline refused: {state.read.reason}
                </div>
            ) : null}
            {rows !== null ? (
                <ul className="timeline-list" data-testid="journal-timeline-rows">
                    {rows.map(row => (
                        <li key={`${row.day}/${row.sessionKey}`}>
                            <button
                                type="button"
                                className="vault-node vault-file journal-timeline-row"
                                data-testid={`journal-row-${row.sessionKey}`}
                                data-day={row.day}
                                data-session-key={row.sessionKey}
                                onClick={() => void commands.execute('vault.open', sessionNowVaultPath(row))}
                            >
                                <span
                                    className={`timeline-day-chip ${row.day === dayNow ? 'timeline-today' : ''}`}
                                    data-testid={`journal-day-chip-${row.day}`}
                                >
                                    {row.day}
                                    {row.day === dayNow ? ' · today' : ''}
                                </span>
                                <span className="timeline-now-timestamp">{row.nowTimestamp}</span>
                                <span className="timeline-session-prefix" title={row.sessionKey}>
                                    {shortSessionKey(row.sessionKey)}
                                </span>
                                <span
                                    className="timeline-kind-ribbon"
                                    data-testid={`journal-kinds-${row.sessionKey}`}
                                    data-kinds={row.artifactKinds.join(',')}
                                >
                                    {row.artifactKinds.map(kind => (
                                        <span key={kind} className="timeline-kind-icon" title={kind}>
                                            {journalKindIcon(kind)}
                                        </span>
                                    ))}
                                </span>
                            </button>
                        </li>
                    ))}
                    {rows.length === 0 ? (
                        // 32.T32.6 — the 32.11 start-session affordance survives
                        // verbatim; the day's absence names its contributors.
                        <li className="pane-message">
                            <MExtensionEmptyState extensionId="m4-nara" viewId="journal" />
                        </li>
                    ) : null}
                </ul>
            ) : null}
        </div>
    );
}
