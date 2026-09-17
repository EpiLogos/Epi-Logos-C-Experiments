/**
 * Coordinate: M' M0'/M5' (semantic-connections sidebar - 28.T28.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): left-border read surface over the S1 semantic index
 * Actualises: note-scoped semantic neighbours with evidence and privacy state.
 * Public surface: SemanticConnectionsPane.
 * Does NOT own: S1 scoring/indexing, editor state, or vault mutation.
 * Contract: [[S1-SPEC]] / [[M'-PORTAL-SPEC]].
 */

import { FormEvent, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import {
    parseSemanticConnectionsResponse,
    SEMANTIC_CONNECTIONS_METHOD,
    type SemanticConnectionsResponse
} from './semanticConnections';

const DEFAULT_NOTE = 'Bimba/World/Types/Coordinates/S/S1/S1.md';

export function SemanticConnectionsPane() {
    const [notePath, setNotePath] = useState(DEFAULT_NOTE);
    const [response, setResponse] = useState<SemanticConnectionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = (event: FormEvent) => {
        event.preventDefault();
        const path = notePath.trim();
        if (!path) return;
        if (!gatewayReady()) {
            setError('Gateway disconnected. Semantic neighbours are unavailable.');
            return;
        }
        setLoading(true);
        setError(null);
        void gateway()
            .invoke(SEMANTIC_CONNECTIONS_METHOD, {
                notePath: path,
                includeStale: true,
                limit: 16
            })
            .then(receipt => parseSemanticConnectionsResponse(receipt.artifact))
            .then(setResponse)
            .catch(cause => setError(cause instanceof Error ? cause.message : String(cause)))
            .finally(() => setLoading(false));
    };

    return (
        <section
            className="semantic-connections"
            data-testid="semantic-connections-pane"
            data-view-id="pratibimba.smart-connections-sidebar"
        >
            <header>
                <strong>Smart connections</strong>
                <span data-testid="semantic-staleness">{response?.staleness ?? 'not queried'}</span>
            </header>
            <form onSubmit={search}>
                <label htmlFor="semantic-note-path">Vault note</label>
                <div>
                    <input
                        id="semantic-note-path"
                        value={notePath}
                        onChange={event => setNotePath(event.target.value)}
                        spellCheck={false}
                    />
                    <button type="submit" aria-label="Find semantic connections" disabled={loading}>
                        <span aria-hidden="true">⌕</span>
                    </button>
                </div>
            </form>

            {response ? (
                <div className="semantic-results" aria-live="polite">
                    {response.candidates.length === 0 ? (
                        <p className="semantic-empty">No indexed neighbours for this note.</p>
                    ) : (
                        <ol>
                            {response.candidates.map(item => (
                                <li key={`${item.targetPath}:${item.kind}`}>
                                    <button
                                        type="button"
                                        onClick={() => void commands.execute('vault.open', item.targetPath)}
                                    >
                                        <strong>{item.wikilinkTitle}</strong>
                                        <span>{Math.round(item.score * 100)}% · {item.kind}</span>
                                    </button>
                                    <small>
                                        {item.privacyClass}
                                        {item.stale ? ' · stale' : ''}
                                        {item.evidenceLines
                                            ? ` · lines ${item.evidenceLines[0]}-${item.evidenceLines[1]}`
                                            : ''}
                                    </small>
                                </li>
                            ))}
                        </ol>
                    )}
                    {response.warnings.map(warning => (
                        <p className="semantic-warning" key={warning}>{warning}</p>
                    ))}
                </div>
            ) : null}
            {error ? <p className="semantic-error" role="alert">{error}</p> : null}
        </section>
    );
}
