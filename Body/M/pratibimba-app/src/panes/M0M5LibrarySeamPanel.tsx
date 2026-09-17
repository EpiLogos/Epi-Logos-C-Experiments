/**
 * Coordinate: M' M0' ↔ M5-0' (graph / Library Klein panel, 09.T9.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): coordinate-scoped Library surface beneath the M0' map
 * Actualises: map traversal revealing the S5 Gnostic direct-tag and resonance
 *   cluster for the same shared coordinate, without leaving the graph host.
 * Public surface: M0M5LibrarySeamPanel.
 * Does NOT own: a new state store, graph/file mutation, entity bodies, a
 *   standalone viewer package, or a generic view-mode ontology.
 * Contract: [[M0'-SPEC]] + [[M5'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.9.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
    buildM0M5LibrarySeam,
    M0_M5_LIBRARY_METHOD,
    type M0M5LibraryEntry
} from './m0M5LibrarySeam';

function Entry({ entry }: { readonly entry: M0M5LibraryEntry }) {
    return (
        <li data-tag-kind={entry.kind}>
            <span>{entry.entityName ?? entry.entityId}</span>
            <span>
                {entry.kind === 'bimba_coordinate'
                    ? entry.assignmentMethod ?? 'direct'
                    : `${entry.homeCoordinate}${entry.confidence === null ? '' : ` · ${entry.confidence.toFixed(2)}`}`}
            </span>
        </li>
    );
}

export function M0M5LibrarySeamPanel() {
    const selected = useCoordinateStore(state => state.selected);
    const connected = useProvenanceStore(state => state.connection.connected);
    const [response, setResponse] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setResponse(null);
        setError(null);
        if (!selected || !connected) {
            setLoading(false);
            return;
        }

        let disposed = false;
        setLoading(true);
        let invocation;
        try {
            invocation = gateway().invoke(M0_M5_LIBRARY_METHOD, { coordinate: selected });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
            setLoading(false);
            return;
        }
        invocation
            .then(receipt => {
                if (!disposed) setResponse(receipt.artifact);
            })
            .catch(caught => {
                if (!disposed) setError(caught instanceof Error ? caught.message : String(caught));
            })
            .finally(() => {
                if (!disposed) setLoading(false);
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    const projection = useMemo(
        () => buildM0M5LibrarySeam(error ? { status: 'error', message: error } : response),
        [response, error]
    );
    const direct = projection.entries.filter(entry => entry.kind === 'bimba_coordinate');
    const resonant = projection.entries.filter(entry => entry.kind === 'bimba_resonances');
    const state = loading || !selected ? 'pending' : projection.state;

    return (
        <section
            className="m0-m5-library-seam"
            data-testid="m0-m5-library-seam"
            data-coordinate={selected ?? 'none'}
            data-state={state}
        >
            <header>
                <div>
                    <span className="m0-community-clock-kicker">M0′ ↔ M5-0′</span>
                    <h3>Library at {selected ?? 'no coordinate'}</h3>
                </div>
                <ProvenanceBadge state={state} reason={projection.reason ?? undefined} />
            </header>
            {state === 'pending' ? <p>Traverse a map coordinate to reveal its Library surface.</p> : null}
            {state === 'blocked' ? <p>{projection.reason}</p> : null}
            {state === 'canonical_absent' ? <p>No tagged Library entries at this coordinate.</p> : null}
            {state === 'derived' ? (
                <div className="m0-m5-library-columns">
                    <section data-testid="m0-m5-library-direct">
                        <h4>Direct tags</h4>
                        {direct.length > 0 ? <ul>{direct.map(entry => <Entry key={entry.entityId} entry={entry} />)}</ul> : <p>None</p>}
                    </section>
                    <section data-testid="m0-m5-library-resonant">
                        <h4>Resonances</h4>
                        {resonant.length > 0 ? <ul>{resonant.map(entry => <Entry key={entry.entityId} entry={entry} />)}</ul> : <p>None</p>}
                    </section>
                </div>
            ) : null}
        </section>
    );
}
