/**
 * Coordinate: M' S5' (CU-ledger review pane — Tranche 40.T40.5)
 * Actualises: the Track-40 canon-governance review surface in pratibimba-app —
 *   lists CU-ledger rows over `s5'.canon_update.list` with a status filter,
 *   and inspects a row's provenance (surfaced/updated stamps), derivation
 *   (category + claim), and target landing site. Combined with the Track-48
 *   bases-view posture: one coordinate-keyed query table over GatewayClient.
 * Does NOT own: the ledger runtime (`epi bimba` + gateway canon_update.rs);
 *   the ws seam (family answers `unimplemented` today — honest pending-wire
 *   banner, m4 arena pane precedent).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore } from '../state/stores';
import {
    CANON_LIST_RPC,
    CANON_UPDATE_STATES,
    CANON_WIRE_PENDING_NOTE,
    CanonUpdateRow,
    CanonUpdateState,
    CanonWireState,
    classifyWireError,
    filterByStatus,
    normalizeCanonUpdateRows
} from './canonUpdateLedger';

export interface CanonUpdateLedgerPaneProps {
    /** Test seam: fixture rows rendered instead of the (unwired) live seam. */
    readonly fixture?: readonly CanonUpdateRow[];
}

export function CanonUpdateLedgerPane({ fixture }: CanonUpdateLedgerPaneProps) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [wireState, setWireState] = useState<CanonWireState>(fixture ? 'live' : 'pending-wire');
    const [rows, setRows] = useState<readonly CanonUpdateRow[]>(fixture ?? []);
    const [statusFilter, setStatusFilter] = useState<CanonUpdateState | 'all'>('all');
    const [inspected, setInspected] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (fixture || !connected) {
            return;
        }
        gateway()
            .invoke(CANON_LIST_RPC, statusFilter === 'all' ? {} : { status: statusFilter })
            .then(receipt => {
                setRows(normalizeCanonUpdateRows(receipt.artifact));
                setWireState('live');
            })
            .catch(err => setWireState(classifyWireError(err)));
    }, [fixture, connected, statusFilter]);

    useEffect(refresh, [refresh]);

    if (!connected && !fixture) {
        return <div className="pane-message">Gateway disconnected.</div>;
    }

    const visible = filterByStatus(rows, statusFilter);
    const inspectedRow = visible.find(row => row.id === inspected) ?? null;

    return (
        <div className="canon-ledger-root" data-testid="canon-ledger-root">
            <div className="pane-toolbar">
                <span>CU ledger</span>
                <select
                    data-testid="canon-ledger-status-filter"
                    value={statusFilter}
                    onChange={event => setStatusFilter(event.currentTarget.value as CanonUpdateState | 'all')}
                >
                    <option value="all">All statuses</option>
                    {CANON_UPDATE_STATES.map(state => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
                <button type="button" data-testid="canon-ledger-refresh" onClick={refresh}>
                    refresh
                </button>
            </div>

            {wireState === 'pending-wire' ? (
                <p className="pane-message canon-ledger-pending" data-testid="canon-ledger-pending-wire">
                    {CANON_WIRE_PENDING_NOTE}
                </p>
            ) : null}

            <table className="canon-ledger-table" data-testid="canon-ledger-table">
                <thead>
                    <tr>
                        <th>id</th>
                        <th>category</th>
                        <th>status</th>
                        <th>claim</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="pane-message" data-testid="canon-ledger-empty">
                                No CU rows
                            </td>
                        </tr>
                    ) : (
                        visible.map(row => (
                            <tr
                                key={row.id}
                                data-testid="canon-ledger-row"
                                data-row-id={row.id}
                                data-status={row.status}
                                data-category={row.category}
                                onClick={() => setInspected(prev => (prev === row.id ? null : row.id))}
                            >
                                <td>{row.id}</td>
                                <td>{row.category}</td>
                                <td>
                                    <span className={`canon-ledger-status canon-ledger-status-${row.status}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="canon-ledger-claim">{row.claim}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {inspectedRow ? (
                <aside className="canon-ledger-inspect" data-testid="canon-ledger-inspect" data-row-id={inspectedRow.id}>
                    <h4>{inspectedRow.id}</h4>
                    <dl>
                        <dt>derivation</dt>
                        <dd data-testid="canon-ledger-inspect-derivation">
                            {inspectedRow.category} · {inspectedRow.claim}
                        </dd>
                        <dt>target landing site</dt>
                        <dd data-testid="canon-ledger-inspect-landing">
                            {inspectedRow.targetLandingHint ?? 'unassigned'}
                        </dd>
                        <dt>provenance</dt>
                        <dd data-testid="canon-ledger-inspect-provenance">
                            surfaced {inspectedRow.surfacedAtMs} · updated {inspectedRow.updatedAtMs}
                            {inspectedRow.landedMarker ? ` · marker ${inspectedRow.landedMarker}` : ''}
                            {inspectedRow.refusalReason ? ` · refused: ${inspectedRow.refusalReason}` : ''}
                        </dd>
                    </dl>
                </aside>
            ) : null}
        </div>
    );
}
