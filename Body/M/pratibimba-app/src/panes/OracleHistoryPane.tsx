/**
 * Coordinate: M' M4' (oracle history viewer — rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #5 — the read of casts already lived.
 * Actualises: view id `m4.nara.oracleHistory` — a read-only, reverse-
 *   chronological viewer over the REAL S0 cast ledger, read through
 *   `nara.oracle.history` and `nara.oracle.hygiene` on the gateway. Per row:
 *   the modality glyph (I-Ching / tarot suit pip), the cast id, the question
 *   prefix the ledger recorded, the hygiene state, and the decay-window state
 *   — for the newest row, which is the only one this wire timestamps.
 *
 *   IT NESTS IN THE ORACLE PANE. History belongs beside the cast that makes
 *   it, and `personal-main` is at its tab-strip limit; the same
 *   nested-section discipline the day container uses (25.2) applies here.
 *
 *   TWO THINGS THE BRIEF ASKS FOR THAT THIS WIRE CANNOT SAY, DISCLOSED RATHER
 *   THAN PAINTED. (a) `show_history` drops `cast_at`, so only the newest row's
 *   4h decay window is computable (from the hygiene line's minutes-ago);
 *   older rows read `decay unknown`. (b) The 5.17 `OracleSpreadPosition`
 *   aliveness join (`generating | muting | mute`) has no gateway method at any
 *   coordinate — `nara.oracle.update_position_state` does not exist — so the
 *   badge is absent and the pane names the missing wire instead of showing a
 *   state it cannot know.
 *
 *   PRIVACY: no interpretation body. The ledger carries the user's own
 *   question truncated to 40 chars and a hygiene word; the reading itself
 *   stays in its day artifact, which is where the deposit put it.
 * Public surface: OracleHistoryPane, ORACLE_HISTORY_METHOD,
 *   ORACLE_HYGIENE_METHOD.
 * Does NOT own: the ledger (epi-cli `nara/oracle_route.rs`), the cast (S3
 *   `nara.oracle.cast`), the deposit (src-tauri/src/oracle.rs), or the host
 *   pane (`OraclePane` mounts this as its history section).
 * Contract: design-recon 25-m4-nara-frontend-deep.md §25.9.
 */

import { useEffect, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import {
    ORACLE_DECAY_WINDOW_MINUTES,
    decayStateFor,
    parseOracleHistory,
    parseOracleHygiene,
    type OracleHygieneRead,
    type OracleLedgerRead,
    type OracleLedgerRow
} from './oracleHistoryLedger';

export const ORACLE_HISTORY_METHOD = 'nara.oracle.history';
export const ORACLE_HYGIENE_METHOD = 'nara.oracle.hygiene';

/** The 5.17 aliveness join has no producer — named, not faked. */
const MISSING_ALIVENESS_METHOD = 'nara.oracle.update_position_state';

const MODALITY_GLYPH: Readonly<Record<string, string>> = Object.freeze({
    'i-ching': '䷀',
    tarot: '✦'
});

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

type HistoryState =
    | { readonly kind: 'loading' }
    | { readonly kind: 'dark'; readonly reason: string }
    | { readonly kind: 'read'; readonly ledger: OracleLedgerRead; readonly hygiene: OracleHygieneRead };

export function OracleHistoryPane() {
    const [state, setState] = useState<HistoryState>({ kind: 'loading' });
    const generation = useTickStore(s => s.generation);

    useEffect(() => {
        let cancelled = false;
        if (!gatewayReady()) {
            setState({ kind: 'dark', reason: 'gateway not connected' });
            return;
        }
        Promise.all([
            gateway().invoke(ORACLE_HISTORY_METHOD, {}),
            gateway().invoke(ORACLE_HYGIENE_METHOD, {})
        ])
            .then(([history, hygiene]) => {
                if (cancelled) {
                    return;
                }
                setState({
                    kind: 'read',
                    ledger: parseOracleHistory(artifactOf(history)),
                    hygiene: parseOracleHygiene(artifactOf(hygiene))
                });
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }
                setState({
                    kind: 'dark',
                    reason: error instanceof Error ? error.message : String(error)
                });
            });
        return () => {
            cancelled = true;
        };
    }, [generation]);

    const chrome = privacyChrome('protected_local_handle_only');

    return (
        <section
            className={`oracle-history ${chrome.className}`}
            title={chrome.title}
            data-testid="oracle-history"
            data-view-id="m4.nara.oracleHistory"
            data-state={state.kind}
        >
            <h3>Casts already lived</h3>
            {state.kind === 'loading' ? (
                <p className="pane-message" data-testid="oracle-history-loading">
                    reading the cast ledger…
                </p>
            ) : null}
            {state.kind === 'dark' ? (
                <p className="pane-message" data-testid="oracle-history-dark">
                    the cast ledger is unreachable: <code>{ORACLE_HISTORY_METHOD}</code> did not
                    answer. ({state.reason})
                </p>
            ) : null}
            {state.kind === 'read' ? (
                <OracleHistoryBody ledger={state.ledger} hygiene={state.hygiene} />
            ) : null}
        </section>
    );
}

function OracleHistoryBody({
    ledger,
    hygiene
}: {
    readonly ledger: OracleLedgerRead;
    readonly hygiene: OracleHygieneRead;
}) {
    if (ledger.kind === 'refused') {
        return (
            <p className="pane-message" data-testid="oracle-history-refused">
                the ledger reply was not in the shape <code>{ORACLE_HISTORY_METHOD}</code> emits, so
                nothing is listed: {ledger.reason}
            </p>
        );
    }
    if (ledger.kind === 'empty') {
        return (
            <p className="pane-message" data-testid="oracle-history-empty">
                No cast has been lived yet. History is a record, not a placeholder.
            </p>
        );
    }
    return (
        <>
            <p className="oracle-history-hygiene" data-testid="oracle-history-hygiene">
                {hygiene.castsToday === null
                    ? 'hygiene state unavailable'
                    : `${hygiene.castsToday}/${hygiene.dailyLimit ?? '?'} casts today`}
                {hygiene.lastCastMinutesAgo === null
                    ? ''
                    : ` · last cast ${hygiene.lastCastMinutesAgo} min ago`}
                {ledger.rows.length < ledger.declaredCount
                    ? ` · showing ${ledger.rows.length} of ${ledger.declaredCount} (the ledger serves the last ten)`
                    : ''}
            </p>
            <ul className="oracle-history-rows" data-testid="oracle-history-rows">
                {ledger.rows.map((row, index) => (
                    <OracleHistoryRow
                        key={row.castId}
                        row={row}
                        decay={decayStateFor(index, hygiene)}
                    />
                ))}
            </ul>
            <p className="oracle-history-seam" data-testid="oracle-history-seam">
                Decay is resolved for the newest cast only — <code>{ORACLE_HISTORY_METHOD}</code>{' '}
                carries no per-cast timestamp, so an older row&apos;s {ORACLE_DECAY_WINDOW_MINUTES}
                -minute window is unknown here rather than assumed closed. The 5.17 spread-position
                aliveness badge has no producer at any coordinate (
                <code>{MISSING_ALIVENESS_METHOD}</code> is unserved), so it is absent rather than
                invented.
            </p>
        </>
    );
}

function OracleHistoryRow({
    row,
    decay
}: {
    readonly row: OracleLedgerRow;
    readonly decay: ReturnType<typeof decayStateFor>;
}) {
    return (
        <li
            className="oracle-history-row"
            data-testid={`oracle-history-row-${row.castId}`}
            data-modality={row.modality}
            data-decay={decay}
        >
            <span className="oracle-history-glyph" data-testid={`oracle-history-glyph-${row.castId}`}>
                {MODALITY_GLYPH[row.modality]}
            </span>
            <span className="oracle-history-id">#{row.castId}</span>
            <span className="oracle-history-system">{row.system}</span>
            <span className="oracle-history-question">{row.questionPrefix}</span>
            <span className="oracle-history-hygiene-chip" data-testid={`oracle-history-hygiene-${row.castId}`}>
                {row.hygiene}
            </span>
            <span className="oracle-history-decay" data-testid={`oracle-history-decay-${row.castId}`}>
                decay {decay}
            </span>
        </li>
    );
}
