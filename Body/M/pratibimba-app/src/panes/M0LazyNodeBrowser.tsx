/**
 * Coordinate: M' M0-0' (lazy residual-node browser, rerun 21.T21.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' residual graph-data aperture
 * Actualises: fixed 20-row pages over the live S2-owned M0 residual set,
 *   including the root M0 row that sits outside the six branch prefixes.
 * Public surface: M0SubBranch, M0LazyNodeEntry, M0LazyNodeBrowserState,
 *   M0LazyNodeBrowser.
 * Does NOT own: the 108-node data set, ARCHETYPE_LUT exclusions, graph counts,
 *   canonical node properties, or another carrier store.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.14.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';
import type { M0ProvenanceState } from './m0LayerReadiness';
import {
    M0VoidStructureRing,
    m0VoidStructureFromProfile
} from './M0VoidStructureRing';

export type M0SubBranch = '#0-0' | '#0-1' | '#0-2' | '#0-3' | '#0-4' | '#0-5';

export interface M0LazyNodeEntry {
    readonly coordinate: string;
    readonly name: string;
    readonly symbol: string | null;
    readonly form: string | null;
    readonly state: M0ProvenanceState;
}

export interface M0LazyNodeBrowserState {
    readonly subBranch: M0SubBranch;
    readonly offset: number;
    readonly limit: 20;
    readonly entries: readonly M0LazyNodeEntry[];
    readonly rootEntry: M0LazyNodeEntry | null;
    readonly total: number;
    readonly residualTotal: number;
    readonly datasetTotal: number;
    readonly state: M0ProvenanceState;
}

const PAGE_LIMIT = 20 as const;
const BRANCHES: readonly { readonly id: M0SubBranch; readonly label: string }[] = Object.freeze([
    { id: '#0-0', label: '4-Fold Zero' },
    { id: '#0-1', label: 'Emergence' },
    { id: '#0-2', label: '8-Fold Virtues' },
    { id: '#0-3', label: 'Archetypal Number Language' },
    { id: '#0-4', label: 'Holographic Matrix' },
    { id: '#0-5', label: 'Siva-Sakti' }
]);

type BrowserRead =
    | { readonly status: 'pending'; readonly reason: string }
    | { readonly status: 'blocked'; readonly reason: string }
    | { readonly status: 'ready'; readonly model: M0LazyNodeBrowserState };

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function finiteNonNegativeInteger(value: unknown, field: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        throw new Error(`s2.graph.list ${field} must be a non-negative integer`);
    }
    return value;
}

function nullableString(value: unknown, field: string): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value !== 'string') {
        throw new Error(`s2.graph.list ${field} must be a string or null`);
    }
    return value;
}

function parseEntry(value: unknown): M0LazyNodeEntry {
    const row = record(value);
    if (!row || typeof row.coordinate !== 'string' || typeof row.name !== 'string') {
        throw new Error('s2.graph.list entry must carry coordinate and name');
    }
    if (row.state !== 'canonical') {
        throw new Error('s2.graph.list entries must carry canonical provenance');
    }
    return Object.freeze({
        coordinate: row.coordinate,
        name: row.name,
        symbol: nullableString(row.symbol, 'entry.symbol'),
        form: nullableString(row.form, 'entry.form'),
        state: 'canonical'
    });
}

export function parseM0LazyNodeBrowserState(
    artifact: unknown,
    expectedBranch: M0SubBranch
): M0LazyNodeBrowserState {
    const body = record(artifact);
    if (!body || body.coordinatePrefix !== expectedBranch) {
        throw new Error('s2.graph.list returned the wrong coordinatePrefix');
    }
    if (body.limit !== PAGE_LIMIT || !Array.isArray(body.entries)) {
        throw new Error('s2.graph.list returned an invalid fixed-page contract');
    }
    if (body.state !== 'canonical' && body.state !== 'blocked') {
        throw new Error('s2.graph.list state must be canonical or blocked');
    }
    return Object.freeze({
        subBranch: expectedBranch,
        offset: finiteNonNegativeInteger(body.offset, 'offset'),
        limit: PAGE_LIMIT,
        entries: Object.freeze(body.entries.map(parseEntry)),
        rootEntry: body.rootEntry == null ? null : parseEntry(body.rootEntry),
        total: finiteNonNegativeInteger(body.total, 'total'),
        residualTotal: finiteNonNegativeInteger(body.residualTotal, 'residualTotal'),
        datasetTotal: finiteNonNegativeInteger(body.datasetTotal, 'datasetTotal'),
        state: body.state
    });
}

export function M0LazyNodeBrowser() {
    const connected = useProvenanceStore(state => state.connection.connected);
    const cachedProfile = useTickStore(state => state.profile);
    const [subBranch, setSubBranch] = useState<M0SubBranch>('#0-0');
    const [offset, setOffset] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState<M0LazyNodeEntry | null>(null);
    const [read, setRead] = useState<BrowserRead>({
        status: 'pending',
        reason: 'gateway not connected'
    });

    useEffect(() => {
        if (!connected) {
            setRead({ status: 'pending', reason: 'gateway not connected' });
            return;
        }
        let disposed = false;
        setRead({ status: 'pending', reason: `reading ${subBranch} at ${offset}` });
        gateway()
            .invoke('s2.graph.list', {
                coordinatePrefix: subBranch,
                offset,
                limit: PAGE_LIMIT
            })
            .then(receipt => {
                if (!disposed) {
                    setRead({
                        status: 'ready',
                        model: parseM0LazyNodeBrowserState(receipt.artifact, subBranch)
                    });
                }
            })
            .catch(error => {
                if (!disposed) {
                    setRead({
                        status: 'blocked',
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            disposed = true;
        };
    }, [connected, offset, subBranch]);

    const model = read.status === 'ready' ? read.model : null;
    const voidStructure = useMemo(
        () => m0VoidStructureFromProfile(cachedProfile),
        [cachedProfile]
    );
    const visibleEntries = useMemo(
        () => (model ? [model.rootEntry, ...model.entries].filter((entry): entry is M0LazyNodeEntry => entry !== null) : []),
        [model]
    );

    const selectBranch = (next: M0SubBranch) => {
        setSubBranch(next);
        setOffset(0);
        setSelectedEntry(null);
    };

    const selectEntry = (entry: M0LazyNodeEntry) => {
        setSelectedEntry(entry);
        useCoordinateStore.getState().setSelected(entry.coordinate);
    };

    return (
        <section
            className="m0-lazy-browser"
            data-testid="m0-lazy-browser"
            data-state={model?.state ?? read.status}
            data-offset={offset}
        >
            <header className="m0-lazy-browser-header">
                <div>
                    <span className="m0-language-reader-kicker">M0-0'</span>
                    <h3>Residual node browser</h3>
                </div>
                {model ? (
                    <span data-testid="m0-lazy-counts">
                        {model.residualTotal} of {model.datasetTotal} graph nodes
                    </span>
                ) : null}
            </header>

            <div className="m0-lazy-branches" role="tablist" aria-label="M0 sub-branch">
                {BRANCHES.map(branch => (
                    <button
                        key={branch.id}
                        type="button"
                        role="tab"
                        data-testid={`m0-lazy-branch-${branch.id.slice(1)}`}
                        aria-selected={subBranch === branch.id}
                        onClick={() => selectBranch(branch.id)}
                    >
                        <code>{branch.id}</code>
                        <span>{branch.label}</span>
                    </button>
                ))}
            </div>

            {subBranch === '#0-4' ? (
                voidStructure ? (
                    <div className="m0-void-structure-mount">
                        <M0VoidStructureRing
                            projection={voidStructure}
                            onLensClick={lens => {
                                setSelectedEntry(null);
                                useCoordinateStore.getState().setSelected(lens.coordinate);
                            }}
                        />
                    </div>
                ) : (
                    <p
                        className="m0-lazy-status blocked"
                        data-testid="m0-void-structure-blocked"
                    >
                        Kernel Void-Structure projection unavailable.
                    </p>
                )
            ) : null}

            {read.status !== 'ready' ? (
                <p className={`m0-lazy-status ${read.status}`}>{read.reason}</p>
            ) : (
                <div className="m0-lazy-content">
                    <div className="m0-lazy-list" role="list">
                        {visibleEntries.map(entry => (
                            <button
                                key={entry.coordinate}
                                type="button"
                                role="listitem"
                                data-testid={`m0-lazy-node-${entry.coordinate}`}
                                data-coordinate={entry.coordinate}
                                aria-pressed={selectedEntry?.coordinate === entry.coordinate}
                                onClick={() => selectEntry(entry)}
                            >
                                <code>{entry.coordinate}</code>
                                <span>{entry.name}</span>
                                <span>{entry.symbol ?? entry.form ?? ''}</span>
                            </button>
                        ))}
                    </div>
                    <aside className="m0-lazy-detail" data-testid="m0-lazy-detail">
                        {selectedEntry ? (
                            <>
                                <code>{selectedEntry.coordinate}</code>
                                <h4>{selectedEntry.name}</h4>
                                <dl>
                                    <dt>Symbol</dt>
                                    <dd>{selectedEntry.symbol ?? 'canonical absence'}</dd>
                                    <dt>Form</dt>
                                    <dd>{selectedEntry.form ?? 'canonical absence'}</dd>
                                </dl>
                            </>
                        ) : (
                            <p>Select a node to inspect its canonical language fields.</p>
                        )}
                    </aside>
                </div>
            )}

            <div className="m0-lazy-pagination">
                <button
                    type="button"
                    data-testid="m0-lazy-previous"
                    disabled={offset === 0}
                    onClick={() => setOffset(current => Math.max(0, current - PAGE_LIMIT))}
                >
                    Previous
                </button>
                <span>
                    {model && model.total > 0
                        ? `${offset + 1}-${Math.min(offset + PAGE_LIMIT, model.total)} of ${model.total}`
                        : '0 of 0'}
                </span>
                <button
                    type="button"
                    data-testid="m0-lazy-next"
                    disabled={!model || offset + PAGE_LIMIT >= model.total}
                    onClick={() => setOffset(current => current + PAGE_LIMIT)}
                >
                    Next
                </button>
            </div>
        </section>
    );
}
