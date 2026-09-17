/**
 * Coordinate: M' M4' (oracle history viewer - rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #5 - read-only casts already lived.
 * Actualises: timestamped history, modality, four-hour decay, hygiene,
 *   spread-position aliveness, and click-through to the cast viewer.
 * Public surface: OracleHistoryPane, ORACLE_HISTORY_METHOD.
 * Does NOT own: ledger persistence, cast execution, or interpretation bodies.
 * Contract: [[M4'-SPEC]] / design-recon 25.T25.9.
 */

import { useEffect, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import {
    decayStateAt,
    parseOracleHistoryProjection,
    type OracleHistoryEntry,
    type OracleHistoryRead
} from './oracleHistoryLedger';

export const ORACLE_HISTORY_METHOD = 'nara.oracle.history.read';

const MODALITY_GLYPH: Readonly<Record<string, string>> = Object.freeze({
    'i-ching': '䷀',
    tarot: '✦'
});

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in receipt) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

type HistoryState =
    | { readonly kind: 'loading' }
    | { readonly kind: 'dark'; readonly reason: string }
    | { readonly kind: 'read'; readonly ledger: OracleHistoryRead };

export function OracleHistoryPane({ onOpenCast }: { readonly onOpenCast?: (entry: OracleHistoryEntry) => void }) {
    const [state, setState] = useState<HistoryState>({ kind: 'loading' });
    const generation = useTickStore(store => store.generation);

    useEffect(() => {
        let cancelled = false;
        if (!gatewayReady()) {
            setState({ kind: 'dark', reason: 'gateway not connected' });
            return;
        }
        gateway().invoke(ORACLE_HISTORY_METHOD, { limit: 10 })
            .then(history => {
                if (!cancelled) setState({ kind: 'read', ledger: parseOracleHistoryProjection(artifactOf(history)) });
            })
            .catch((error: unknown) => {
                if (!cancelled) setState({ kind: 'dark', reason: error instanceof Error ? error.message : String(error) });
            });
        return () => { cancelled = true; };
    }, [generation]);

    const chrome = privacyChrome('protected_local_handle_only');
    return (
        <section className={`oracle-history ${chrome.className}`} title={chrome.title} data-testid="oracle-history" data-view-id="m4.nara.oracleHistory" data-state={state.kind}>
            <h3>Casts already lived</h3>
            {state.kind === 'loading' ? <p className="pane-message" data-testid="oracle-history-loading">reading the cast ledger...</p> : null}
            {state.kind === 'dark' ? <p className="pane-message" data-testid="oracle-history-dark">the cast ledger is unreachable: <code>{ORACLE_HISTORY_METHOD}</code> did not answer. ({state.reason})</p> : null}
            {state.kind === 'read' ? <OracleHistoryBody ledger={state.ledger} onOpenCast={onOpenCast} /> : null}
        </section>
    );
}

function OracleHistoryBody({ ledger, onOpenCast }: { readonly ledger: OracleHistoryRead; readonly onOpenCast?: (entry: OracleHistoryEntry) => void }) {
    if (ledger.kind === 'refused') return <p className="pane-message" data-testid="oracle-history-refused">the structured ledger reply was refused: {ledger.reason}</p>;
    if (ledger.kind === 'empty') return <p className="pane-message" data-testid="oracle-history-empty">No cast has been lived yet. History is a record, not a placeholder.</p>;
    return (
        <>
            <p className="oracle-history-hygiene" data-testid="oracle-history-count">
                showing {ledger.entries.length} of {ledger.totalCount}
            </p>
            <ul className="oracle-history-rows" data-testid="oracle-history-rows">
                {ledger.entries.map(row => (
                    <OracleHistoryRow key={row.castId} row={row} nowEpoch={ledger.generatedAt} onOpenCast={onOpenCast} />
                ))}
            </ul>
            <p className="oracle-history-seam" data-testid="oracle-history-seam">
                Read-only draw facts and handles. Interpretation bodies remain in their protected-local day artifacts.
            </p>
        </>
    );
}

function OracleHistoryRow({ row, nowEpoch, onOpenCast }: { readonly row: OracleHistoryEntry; readonly nowEpoch: number; readonly onOpenCast?: (entry: OracleHistoryEntry) => void }) {
    const decay = decayStateAt(row.castAt, nowEpoch);
    const states = [...new Set(row.positions.map(position => position.liveState))];
    return (
        <li className="oracle-history-row" data-testid={`oracle-history-row-${row.castId}`} data-modality={row.modality} data-decay={decay}>
            <button type="button" className="oracle-history-open" onClick={() => onOpenCast?.(row)} disabled={!onOpenCast} aria-label={`open cast ${row.castId} read only`}>
                <span className="oracle-history-glyph">{MODALITY_GLYPH[row.modality]}</span>
                <span className="oracle-history-id">#{row.castId}</span>
                <time dateTime={new Date(row.castAt * 1000).toISOString()}>{new Date(row.castAt * 1000).toISOString().slice(11, 16)}</time>
                <span className="oracle-history-system">{row.system}</span>
                <span className="oracle-history-question">{row.questionPrefix}</span>
            </button>
            <span className="oracle-history-hygiene-chip">{row.hygiene}</span>
            <span className="oracle-history-decay" data-testid={`oracle-history-decay-${row.castId}`}>{decay}</span>
            <span className="oracle-history-live" data-testid={`oracle-history-live-${row.castId}`}>{states.join(' / ')}</span>
        </li>
    );
}
