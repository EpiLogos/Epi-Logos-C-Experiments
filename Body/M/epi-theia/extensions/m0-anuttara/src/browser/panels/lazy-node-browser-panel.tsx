import * as React from 'react';
import type {
    CoordinateContext,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export type M0SubBranch = '#0-0' | '#0-1' | '#0-2' | '#0-3' | '#0-4' | '#0-5';

export interface M0LazyNodeEntry {
    readonly coordinate: string;
    readonly name: string;
    readonly m0SubBranch: M0SubBranch;
    readonly documentLink?: string;
}

export interface M0LazyNodeBrowserState {
    branch: M0SubBranch | 'all';
    offset: number;
    limit: number;
    results: readonly M0LazyNodeEntry[];
    totalCount: number | null;
}

export interface LazyNodeBrowserPanelProps {
    readonly bridge: SharedBridgeAdapter | null;
    readonly context: CoordinateContext;
    readonly coordinatePrefix: string | null;
    readonly defaultLimit?: number;
    readonly onNodeSelected?: (entry: M0LazyNodeEntry) => void;
}

export const M0_LAZY_NODE_BRANCHES: readonly M0SubBranch[] = Object.freeze([
    '#0-0',
    '#0-1',
    '#0-2',
    '#0-3',
    '#0-4',
    '#0-5'
]);

export const M0_LAZY_NODE_DEFAULT_LIMIT = 20 as const;
export const M0_LAZY_NODE_LIST_METHOD = 's2.graph.list' as const;

type M0LazyNodeBrowserStatus = 'idle' | 'loading' | 'ready' | 'error';

export function createM0LazyNodeBrowserState(
    overrides: Partial<M0LazyNodeBrowserState> = {}
): M0LazyNodeBrowserState {
    return {
        branch: overrides.branch ?? 'all',
        offset: clampNonNegativeInteger(overrides.offset, 0),
        limit: clampPositiveInteger(overrides.limit, M0_LAZY_NODE_DEFAULT_LIMIT),
        results: Object.freeze([...(overrides.results ?? [])]),
        totalCount: normalizeTotalCount(overrides.totalCount)
    };
}

export function buildM0LazyNodeListParams(
    state: Pick<M0LazyNodeBrowserState, 'branch' | 'offset' | 'limit'>,
    coordinatePrefix: string | null
): Record<string, unknown> {
    const prefix = state.branch === 'all' ? coordinatePrefix : state.branch;
    return Object.freeze({
        coordinatePrefix: prefix,
        branch: state.branch,
        offset: clampNonNegativeInteger(state.offset, 0),
        limit: clampPositiveInteger(state.limit, M0_LAZY_NODE_DEFAULT_LIMIT),
        residualSet: 'm0-96-node',
        sourceExtensionId: 'm0-anuttara',
        privacyClass: 'public_current_with_graph_provenance'
    });
}

export async function loadM0LazyNodePage(
    bridge: Pick<SharedBridgeAdapter, 'invokeGatewayRpc'>,
    state: Pick<M0LazyNodeBrowserState, 'branch' | 'offset' | 'limit'>,
    coordinatePrefix: string | null
): Promise<Pick<M0LazyNodeBrowserState, 'results' | 'totalCount'>> {
    const artifact = await bridge.invokeGatewayRpc(
        M0_LAZY_NODE_LIST_METHOD,
        buildM0LazyNodeListParams(state, coordinatePrefix)
    );
    return readM0LazyNodeListArtifact(artifact);
}

export function readM0LazyNodeListArtifact(
    artifact: unknown
): Pick<M0LazyNodeBrowserState, 'results' | 'totalCount'> {
    const record = objectValue(artifact);
    const rawResults =
        arrayValue(record?.results) ??
        arrayValue(record?.nodes) ??
        arrayValue(record?.items) ??
        arrayValue(artifact) ??
        [];
    const results = rawResults.flatMap(readM0LazyNodeEntry);
    const pageInfo = objectValue(record?.pageInfo ?? record?.page_info);
    return Object.freeze({
        results: Object.freeze(results),
        totalCount: normalizeTotalCount(
            record?.totalCount ??
                record?.total_count ??
                record?.total ??
                pageInfo?.totalCount ??
                pageInfo?.total_count
        )
    });
}

export function contextForLazyNodeSelection(
    current: CoordinateContext,
    entry: M0LazyNodeEntry
): CoordinateContext {
    const hashInput = entry.coordinate.startsWith('#') ? entry.coordinate : current.hashInput;
    const canonicalMCoordinate = entry.coordinate.startsWith('M')
        ? entry.coordinate
        : current.canonicalMCoordinate;
    return Object.freeze({
        ...current,
        selectedCoordinate: entry.coordinate,
        hashInput,
        canonicalMCoordinate,
        provenance: Object.freeze({
            source: 'm0-anuttara:lazy-node-browser',
            generation: current.profileGeneration,
            notes: Object.freeze([
                `selected ${entry.coordinate} from ${M0_LAZY_NODE_LIST_METHOD}`,
                `m0SubBranch=${entry.m0SubBranch}`
            ])
        })
    });
}

export function selectM0LazyNodeEntry(
    bridge: Pick<SharedBridgeAdapter, 'updateCoordinateContext'>,
    current: CoordinateContext,
    entry: M0LazyNodeEntry
): CoordinateContext {
    const next = contextForLazyNodeSelection(current, entry);
    bridge.updateCoordinateContext(next);
    return next;
}

export const LazyNodeBrowserPanel: React.FC<LazyNodeBrowserPanelProps> = ({
    bridge,
    context,
    coordinatePrefix,
    defaultLimit = M0_LAZY_NODE_DEFAULT_LIMIT,
    onNodeSelected
}) => {
    const [state, setState] = React.useState<M0LazyNodeBrowserState>(() =>
        createM0LazyNodeBrowserState({ limit: defaultLimit })
    );
    const [status, setStatus] = React.useState<M0LazyNodeBrowserStatus>('idle');
    const [error, setError] = React.useState<string | null>(null);
    const canLoad = Boolean(bridge && coordinatePrefix);

    React.useEffect(() => {
        if (!bridge || !coordinatePrefix) {
            setStatus('idle');
            setError(null);
            setState(current => createM0LazyNodeBrowserState({
                ...current,
                results: [],
                totalCount: null
            }));
            return undefined;
        }
        let cancelled = false;
        setStatus('loading');
        setError(null);
        void loadM0LazyNodePage(bridge, state, coordinatePrefix)
            .then(page => {
                if (cancelled) {
                    return;
                }
                setState(current => createM0LazyNodeBrowserState({ ...current, ...page }));
                setStatus('ready');
            })
            .catch(err => {
                if (cancelled) {
                    return;
                }
                setError(err instanceof Error ? err.message : String(err));
                setStatus('error');
            });
        return () => {
            cancelled = true;
        };
    }, [bridge, coordinatePrefix, state.branch, state.offset, state.limit]);

    const totalCount = state.totalCount ?? state.results.length;
    const canGoPrevious = state.offset > 0 && canLoad;
    const canGoNext = canLoad && state.results.length > 0 && (
        state.totalCount === null || state.offset + state.limit < state.totalCount
    );

    const selectBranch = React.useCallback((branch: M0SubBranch | 'all') => {
        setState(current => createM0LazyNodeBrowserState({
            ...current,
            branch,
            offset: 0
        }));
    }, []);

    const selectEntry = React.useCallback(
        (entry: M0LazyNodeEntry) => {
            if (!bridge) {
                return;
            }
            selectM0LazyNodeEntry(bridge, context, entry);
            onNodeSelected?.(entry);
        },
        [bridge, context, onNodeSelected]
    );

    return (
        <section
            className="m0-lazy-node-browser"
            data-widget-id="pratibimba.m0-anuttara:LazyNodeBrowser"
            data-method={M0_LAZY_NODE_LIST_METHOD}
            data-coordinate-prefix={coordinatePrefix ?? ''}
            data-branch={state.branch}
            data-offset={state.offset}
            data-limit={state.limit}
            aria-label="Lazy 96-node browser"
        >
            <header style={headerStyle}>
                <div>
                    <h4 style={titleStyle}>Lazy 96-node browser</h4>
                    <p className="mext-widget-empty">
                        {coordinatePrefix
                            ? `coordinatePrefix=${coordinatePrefix}`
                            : 'Select a coordinate to query the residual node set'}
                    </p>
                </div>
                <output aria-label="Lazy browser result count" style={countStyle}>
                    {state.totalCount === null
                        ? `${state.results.length} loaded`
                        : `${Math.min(state.offset + state.results.length, totalCount)}/${totalCount}`}
                </output>
            </header>
            <div role="tablist" aria-label="M0 residual sub-branch" className="m0-layer-tabs">
                {(['all', ...M0_LAZY_NODE_BRANCHES] as const).map(branch => (
                    <button
                        key={branch}
                        type="button"
                        role="tab"
                        aria-selected={state.branch === branch}
                        disabled={!canLoad}
                        onClick={() => selectBranch(branch)}
                    >
                        {branch}
                    </button>
                ))}
            </div>
            {status === 'error' ? (
                <p className="mext-widget-empty" role="alert">
                    {error}
                </p>
            ) : null}
            <div style={gridStyle}>
                {state.results.map(entry => (
                    <button
                        key={entry.coordinate}
                        type="button"
                        className="m0-lazy-node-card"
                        data-coordinate={entry.coordinate}
                        data-sub-branch={entry.m0SubBranch}
                        onClick={() => selectEntry(entry)}
                        style={cardStyle}
                    >
                        <span style={coordinateStyle}>{entry.coordinate}</span>
                        <span style={nameStyle}>{entry.name}</span>
                        {entry.documentLink ? (
                            <span style={linkStyle}>{entry.documentLink}</span>
                        ) : null}
                    </button>
                ))}
            </div>
            {status === 'loading' ? (
                <p className="mext-widget-empty">Loading residual nodes from S2...</p>
            ) : null}
            {status === 'ready' && state.results.length === 0 ? (
                <p className="mext-widget-empty">S2 returned no residual nodes for this page.</p>
            ) : null}
            <nav aria-label="Lazy browser pagination" style={pagerStyle}>
                <button
                    type="button"
                    disabled={!canGoPrevious}
                    onClick={() =>
                        setState(current => createM0LazyNodeBrowserState({
                            ...current,
                            offset: Math.max(0, current.offset - current.limit)
                        }))
                    }
                >
                    Previous
                </button>
                <span style={pageStyle}>
                    offset {state.offset} / limit {state.limit}
                </span>
                <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() =>
                        setState(current => createM0LazyNodeBrowserState({
                            ...current,
                            offset: current.offset + current.limit
                        }))
                    }
                >
                    Next
                </button>
            </nav>
        </section>
    );
};

function readM0LazyNodeEntry(value: unknown): M0LazyNodeEntry[] {
    const record = objectValue(value);
    if (!record) {
        return [];
    }
    const properties = objectValue(record.properties);
    const coordinate =
        stringValue(record.coordinate) ??
        stringValue(record.canonicalCoordinate) ??
        stringValue(record.canonical_coordinate) ??
        stringValue(properties?.coordinate) ??
        stringValue(properties?.canonicalCoordinate) ??
        stringValue(properties?.canonical_coordinate);
    if (!coordinate) {
        return [];
    }
    const branch = readM0SubBranch(
        record.m0SubBranch ??
            record.m0_sub_branch ??
            record.subBranch ??
            record.sub_branch ??
            properties?.m0SubBranch ??
            properties?.m0_sub_branch ??
            coordinate
    );
    if (!branch) {
        return [];
    }
    const name =
        stringValue(record.name) ??
        stringValue(record.label) ??
        stringValue(record.title) ??
        stringValue(properties?.name) ??
        stringValue(properties?.label) ??
        coordinate;
    const documentLink =
        stringValue(record.documentLink) ??
        stringValue(record.document_link) ??
        stringValue(record.source) ??
        stringValue(properties?.documentLink) ??
        stringValue(properties?.document_link) ??
        stringValue(properties?.source);
    return [
        Object.freeze({
            coordinate,
            name,
            m0SubBranch: branch,
            ...(documentLink ? { documentLink } : {})
        })
    ];
}

function readM0SubBranch(value: unknown): M0SubBranch | null {
    const raw = stringValue(value);
    if (!raw) {
        return null;
    }
    return M0_LAZY_NODE_BRANCHES.find(branch => raw === branch || raw.startsWith(`${branch}-`)) ?? null;
}

function normalizeTotalCount(value: unknown): number | null {
    if (value === null) {
        return null;
    }
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function clampNonNegativeInteger(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function clampPositiveInteger(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function arrayValue(value: unknown): unknown[] | null {
    return Array.isArray(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '10px'
};

const titleStyle: React.CSSProperties = {
    margin: '0 0 4px',
    fontSize: '13px',
    fontWeight: 600
};

const countStyle: React.CSSProperties = {
    flex: '0 0 auto',
    fontVariantNumeric: 'tabular-nums'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
    marginTop: '10px'
};

const cardStyle: React.CSSProperties = {
    display: 'grid',
    gap: '4px',
    minHeight: '76px',
    padding: '8px',
    textAlign: 'left',
    color: 'var(--theia-foreground)',
    background: 'var(--theia-editorWidget-background)',
    border: '1px solid var(--theia-input-border)',
    borderRadius: '4px',
    cursor: 'pointer'
};

const coordinateStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-ui-font-family)',
    fontWeight: 600
};

const nameStyle: React.CSSProperties = {
    overflowWrap: 'anywhere'
};

const linkStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontSize: '11px',
    overflowWrap: 'anywhere'
};

const pagerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px'
};

const pageStyle: React.CSSProperties = {
    fontVariantNumeric: 'tabular-nums'
};
