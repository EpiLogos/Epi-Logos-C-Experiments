/**
 * Coordinate: M' C5/CS Bases active carrier (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Position (#5): mounted static/live reflection over the shared coordinate context.
 * Actualises: gateway-backed BasesView with source/mode controls and sibling cross-filter.
 * Public surface: BasesViewPane.
 * Does NOT own: vault/graph law, snapshot emission, or coordinate semantics.
 * Contract: all reads use GatewayClient.invoke; selections use useCoordinateStore.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore } from '../state/stores';
import { useEventsStore } from '../state/eventsStore';
import { BasesGateway, createBasesDataSource } from './basesDataSource';
import { BasesRenderView } from './BasesRenderView';
import {
    BaseViewConfig,
    BasesRecord,
    BasesViewMode,
    basesModelFromRecords
} from './basesViewModel';

const appGateway: BasesGateway = {
    invoke: (method, params) => gateway().invoke(method, params)
};

const COLUMNS = Object.freeze(['coordinate', 'title', 'c_4_artifact_role']);
const VIEW_MODES: readonly BasesViewMode[] = Object.freeze(['table', 'cards', 'list', 'image']);

export interface BasesViewPaneProps {
    readonly basesGateway?: BasesGateway;
}

export function BasesViewPane({ basesGateway = appGateway }: BasesViewPaneProps) {
    const selected = useCoordinateStore(state => state.selected);
    const selectCoordinate = useCoordinateStore(state => state.setSelected);
    const mutationSeq = useEventsStore(state => latestMutationSequence(state.events));
    const [source, setSource] = useState<BaseViewConfig['source']>('static');
    const [view, setView] = useState<BasesViewMode>('table');
    const [grouped, setGrouped] = useState(false);
    const [records, setRecords] = useState<readonly BasesRecord[]>(Object.freeze([]));
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [refreshSerial, setRefreshSerial] = useState(0);

    const config = useMemo<BaseViewConfig>(() => ({
        source,
        coordinateScope: 'M2',
        filter: [],
        groupBy: grouped ? 'c_4_artifact_role' : undefined,
        sort: [{ property: 'coordinate', direction: 'ASC' }],
        view,
        columns: COLUMNS,
        image: 'image',
        limit: 300
    }), [grouped, source, view]);

    const refresh = useCallback(() => setRefreshSerial(value => value + 1), []);
    const coordinateRefresh = source === 'dynamic' ? selected : null;
    const eventRefresh = source === 'dynamic' ? mutationSeq : 0;

    useEffect(() => {
        let disposed = false;
        setStatus('loading');
        setError(null);
        createBasesDataSource(basesGateway, source)
            .fetch(config)
            .then(nextRecords => {
                if (disposed) return;
                setRecords(nextRecords);
                setStatus('ready');
            })
            .catch(cause => {
                if (disposed) return;
                setRecords(Object.freeze([]));
                setError(cause instanceof Error ? cause.message : String(cause));
                setStatus('error');
            });
        return () => {
            disposed = true;
        };
    }, [basesGateway, config, coordinateRefresh, eventRefresh, refreshSerial, source]);

    const primaryModel = useMemo(() => basesModelFromRecords(records, config), [config, records]);
    const contextModel = useMemo(() => basesModelFromRecords(records, {
        ...config,
        coordinateScope: selected ?? '__no_coordinate_selected__',
        view: 'list',
        groupBy: undefined,
        columns: ['coordinate', 'title']
    }), [config, records, selected]);

    return (
        <section
            className="bases-projection"
            data-testid={`bases-projection-${status}`}
            data-source={source}
        >
            <header className="bases-projection-toolbar">
                <div className="bases-source-control" aria-label="Bases data source">
                    <button
                        type="button"
                        data-active={source === 'static'}
                        onClick={() => setSource('static')}
                    >snapshot</button>
                    <button
                        type="button"
                        data-active={source === 'dynamic'}
                        onClick={() => setSource('dynamic')}
                    >live</button>
                </div>
                <label>
                    view
                    <select value={view} onChange={event => setView(event.target.value as BasesViewMode)}>
                        {VIEW_MODES.map(mode => <option value={mode} key={mode}>{mode}</option>)}
                    </select>
                </label>
                <label className="bases-group-control">
                    <input type="checkbox" checked={grouped} onChange={event => setGrouped(event.target.checked)} />
                    group by role
                </label>
                <button type="button" className="bases-refresh" onClick={refresh}>refresh</button>
                <span className="bases-projection-status">{status} | {primaryModel.rowCount} rows</span>
            </header>
            {error ? <p className="bases-projection-error">{error}</p> : null}
            <div className="bases-projection-panels">
                <section className="bases-primary-panel" aria-label="Coordinate base records">
                    <header><h3>M2 reflection</h3><code>{source === 'static' ? 'Bimba/Map/snapshots/M2.base.json' : 's2.graph.query'}</code></header>
                    <BasesRenderView
                        model={primaryModel}
                        image={config.image}
                        selectedCoordinate={selected}
                        onSelect={selectCoordinate}
                    />
                </section>
                <aside className="bases-context-panel" data-testid="bases-context-panel">
                    <header><h3>Coordinate context</h3><code>{selected ?? 'no selection'}</code></header>
                    <BasesRenderView
                        model={contextModel}
                        selectedCoordinate={selected}
                        onSelect={selectCoordinate}
                    />
                </aside>
            </div>
        </section>
    );
}

function latestMutationSequence(events: readonly { seq: number; channel: string | null; kind: string }[]): number {
    for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index];
        if (/vault|graph|coordinate|projection/i.test(`${event.channel ?? ''} ${event.kind}`)) {
            return event.seq;
        }
    }
    return 0;
}
