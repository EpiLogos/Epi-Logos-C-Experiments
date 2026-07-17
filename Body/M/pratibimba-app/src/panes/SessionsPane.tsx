/**
 * Coordinate: M' `/` membrane (sessions, plan T3.3)
 * Actualises: S3 session records surfaced and selectable — the live
 *   SessionStore is truth; this pane only lists and binds.
 */

import { useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { SessionClient, SessionRecord } from '../bridge/sessionClient';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omni/omnipanelSessionState';

export function SessionsPane() {
    const bound = useSessionStore(s => s.sessionKey);
    const connected = useProvenanceStore(s => s.connection.connected);
    const sessionTab = useOmniPanelTabState('sessions');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        if (!connected) {
            return;
        }
        new SessionClient(gateway())
            .list()
            .then(setSessions)
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    };

    useEffect(refresh, [connected]);

    if (!connected) {
        return <div className="pane-message">Gateway disconnected.</div>;
    }
    if (error) {
        return <div className="pane-message">sessions unavailable: {error}</div>;
    }
    return (
        <div className="sessions-pane" data-testid="sessions-pane">
            <div className="pane-toolbar">
                <button type="button" onClick={refresh}>refresh</button>
                <button
                    type="button"
                    data-testid="session-new"
                    onClick={() => {
                        const sessionKey = `app-${Date.now().toString(36)}`;
                        useSessionStore.getState().setSession({ sessionKey });
                        patchTab('sessions', { selectedSessionId: sessionKey });
                    }}
                >
                    new session
                </button>
            </div>
            <ul className="session-list">
                {(sessions ?? []).map(record => (
                    <li key={record.sessionKey}>
                        <button
                            type="button"
                            data-testid={`session-${record.sessionKey}`}
                            className={record.sessionKey === bound ? 'session-item session-bound' : 'session-item'}
                            onClick={() => {
                                useSessionStore.getState().setSession({ sessionKey: record.sessionKey });
                                patchTab('sessions', { selectedSessionId: record.sessionKey });
                            }}
                        >
                            {record.sessionKey === bound ? '◈ ' : ''}
                            {record.label ?? record.sessionKey}
                        </button>
                    </li>
                ))}
                {sessions && sessions.length === 0 ? (
                    <li className="pane-message">no sessions yet — the first chat message creates one</li>
                ) : null}
            </ul>
            {sessionTab.selectedSessionId && sessionTab.selectedSessionId !== bound ? (
                <p className="pane-message" data-testid="sessions-persisted-selection">
                    Restored session selection: {sessionTab.selectedSessionId}
                </p>
            ) : null}
        </div>
    );
}
