/**
 * Coordinate: M' C5/CS Bases read-model service (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Position (#5): read-only reflection shaping for the active M' carrier.
 * Actualises: deterministic records + config -> BasesRenderModel projection.
 * Public surface: BaseViewConfig, BasesRecord, BasesRenderModel, basesModelFromRecords.
 * Does NOT own: data fetching, canon writes, graph traversal, or coordinate meaning.
 * Contract: [[M'-SYSTEM-SPEC]]; Track 48 section 13.D.
 */

export type PropPredicateOp = 'eq' | 'neq' | 'startsWith' | 'lt' | 'gt' | 'exists' | 'missing';

export interface PropPredicate {
    readonly property: string;
    readonly op: PropPredicateOp;
    readonly value?: unknown;
}

export type BasesViewMode = 'table' | 'cards' | 'list' | 'image';

export interface BasesSortKey {
    readonly property: string;
    readonly direction: 'ASC' | 'DESC';
}

export interface BaseViewConfig {
    readonly source: 'static' | 'dynamic';
    readonly coordinateScope: string;
    readonly filter: readonly PropPredicate[];
    readonly groupBy?: string;
    readonly sort?: readonly BasesSortKey[];
    readonly view: BasesViewMode;
    readonly columns: readonly string[];
    readonly image?: string;
    readonly path?: string;
    readonly limit?: number;
}

export interface BasesRecord {
    readonly coordinate: string;
    readonly [key: string]: unknown;
}

export interface BasesRenderGroup {
    readonly key: string;
    readonly rows: readonly BasesRecord[];
}

export interface BasesRenderModel {
    readonly groups: readonly BasesRenderGroup[];
    readonly columns: readonly string[];
    readonly view: BasesViewMode;
    readonly pendingFields: readonly string[];
    readonly rowCount: number;
}

export function basesModelFromRecords(
    records: readonly BasesRecord[],
    config: BaseViewConfig
): BasesRenderModel {
    const scoped = records.filter(record => matchesScope(record, config.coordinateScope));
    const filtered = scoped.filter(record => config.filter.every(predicate => matchesPredicate(record, predicate)));
    const sorted = sortRecords(filtered, config.sort);
    const columns = resolveColumns(filtered, config.columns);

    return Object.freeze({
        groups: groupRecords(sorted, config.groupBy),
        columns,
        view: config.view,
        pendingFields: collectPendingFields(filtered, columns, config),
        rowCount: filtered.length
    });
}

function matchesScope(record: BasesRecord, scope: string): boolean {
    return scope === '' || record.coordinate.startsWith(scope);
}

function matchesPredicate(record: BasesRecord, predicate: PropPredicate): boolean {
    const present = predicate.property in record;
    const actual = record[predicate.property];
    switch (predicate.op) {
        case 'eq': return actual === predicate.value;
        case 'neq': return actual !== predicate.value;
        case 'startsWith': return typeof actual === 'string' && actual.startsWith(String(predicate.value));
        case 'lt': return Number(actual) < Number(predicate.value);
        case 'gt': return Number(actual) > Number(predicate.value);
        case 'exists': return present && actual !== null && actual !== undefined;
        case 'missing': return !present || actual === null || actual === undefined;
    }
}

function sortRecords(records: readonly BasesRecord[], sort: readonly BasesSortKey[] | undefined): readonly BasesRecord[] {
    const decorated = records.map((record, index) => ({ record, index }));
    if (sort?.length) {
        decorated.sort((left, right) => {
            for (const key of sort) {
                const order = compareValues(left.record[key.property], right.record[key.property]);
                if (order !== 0) return key.direction === 'DESC' ? -order : order;
            }
            return left.index - right.index;
        });
    }
    return Object.freeze(decorated.map(entry => entry.record));
}

function groupRecords(records: readonly BasesRecord[], groupBy: string | undefined): readonly BasesRenderGroup[] {
    if (!groupBy) {
        return Object.freeze([Object.freeze({ key: '', rows: Object.freeze([...records]) })]);
    }
    const buckets = new Map<string, BasesRecord[]>();
    for (const record of records) {
        const value = record[groupBy];
        const key = value === null || value === undefined || value === ''
            ? '(missing)'
            : String(Array.isArray(value) ? value[0] ?? '(missing)' : value);
        const bucket = buckets.get(key) ?? [];
        bucket.push(record);
        buckets.set(key, bucket);
    }
    return Object.freeze([...buckets.entries()].map(([key, rows]) => Object.freeze({
        key,
        rows: Object.freeze([...rows])
    })));
}

function resolveColumns(records: readonly BasesRecord[], requested: readonly string[]): readonly string[] {
    if (requested.length > 0) return Object.freeze([...requested]);
    const columns = ['coordinate'];
    const seen = new Set(columns);
    for (const record of records) {
        for (const key of Object.keys(record)) {
            if (!seen.has(key)) {
                seen.add(key);
                columns.push(key);
            }
        }
    }
    return Object.freeze(columns);
}

function collectPendingFields(
    records: readonly BasesRecord[],
    columns: readonly string[],
    config: BaseViewConfig
): readonly string[] {
    const pending: string[] = [];
    if (records.length === 0) pending.push('pending-source:no-records');
    if ((config.view === 'cards' || config.view === 'image') && !config.image) {
        pending.push('pending-config-field:image');
    }
    if (config.image && records.length > 0 && !records.some(record => config.image! in record)) {
        pending.push(`pending-column:${config.image}`);
    }
    for (const column of columns) {
        if (column !== 'coordinate' && records.length > 0 && !records.some(record => column in record)) {
            pending.push(`pending-column:${column}`);
        }
    }
    return Object.freeze(pending);
}

function compareValues(left: unknown, right: unknown): number {
    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    return String(left).localeCompare(String(right), undefined, { numeric: true });
}
