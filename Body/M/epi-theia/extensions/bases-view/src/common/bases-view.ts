// Coordinate Header (convention:coordinate-header:v1)
// Coordinate:     C5 / CS (Pratibimba reflection over the coordinate-keyed index)
// Residency:      Body/M/epi-theia/extensions/bases-view (M-stack epi-theia surface)
// Position (#5):  Integration / reflection — the read-side of the CTx + MOC write-shape
// Actualises:     Track 48 §13.D — Theia BasesView API (the .base query-view as C5/CS reflection)
// Public surface: PropPredicate, BaseViewConfig, BasesRecord, BasesRenderModel,
//                 BasesDataSource, basesModelFromRecords (pure)
// Does NOT own:   data fetching (browser adapters), canon writes (Hen / S1'), graph traversal (Neo4j)
// Contract:       no Body/S/** import — all data flows through the shared bridge over invokeGatewayRpc
//
// Pure, framework-free render-service for the M-stack BasesView. Mirrors
// `cosmicClockModelFromProps` in CosmicClockRenderService.tsx: a deterministic
// `records + config -> render-model` function with filter / sort / group applied
// client-side. A `.base` is a C5 reflection — pure read; this file never writes
// canon and never imports the S-stack.

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
    /** `static` reads a `.base` snapshot via s1'.vault.read_file; `dynamic` re-queries s2 live. */
    readonly source: 'static' | 'dynamic';
    /** coordinate prefix the view reflects — `"M2-1"` slices, `""` selects all. */
    readonly coordinateScope: string;
    readonly filter: readonly PropPredicate[];
    readonly groupBy?: string;
    readonly sort?: readonly BasesSortKey[];
    readonly view: BasesViewMode;
    readonly columns: readonly string[];
    /** frontmatter key supplying the card / image cover. */
    readonly image?: string;
    /** static-source `.base` snapshot path (defaults to the scope's projected snapshot). */
    readonly path?: string;
    /** dynamic-source row cap forwarded to the gateway. */
    readonly limit?: number;
}

/** `coordinate` is the materialised join — every row carries it; other keys are frontmatter. */
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

export interface BasesDataSource {
    fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]>;
}

const UNGROUPED_KEY = '';
const MISSING_GROUP_KEY = '∅';

/**
 * Pure render-model function. Mirrors `cosmicClockModelFromProps()` — applies
 * the coordinate scope, predicate filter, sort, and group-by entirely
 * client-side so the same records render identically whether they arrived from
 * the static snapshot or the live graph query. Returns a frozen model.
 */
export function basesModelFromRecords(
    records: readonly BasesRecord[],
    config: BaseViewConfig
): BasesRenderModel {
    const input = Array.isArray(records) ? records : [];
    const scoped = input.filter(record => matchesScope(record, config.coordinateScope));
    const filtered = scoped.filter(record => config.filter.every(predicate => matchesPredicate(record, predicate)));
    const sorted = sortRecords(filtered, config.sort);
    const groups = groupRecords(sorted, config.groupBy);
    const columns = resolveColumns(filtered, config.columns);
    const pendingFields = collectPendingFields(filtered, columns, config);

    return Object.freeze({
        groups,
        columns,
        view: config.view,
        pendingFields,
        rowCount: filtered.length
    });
}

function matchesScope(record: BasesRecord, coordinateScope: string): boolean {
    if (!coordinateScope) {
        return true;
    }
    return typeof record.coordinate === 'string' && record.coordinate.startsWith(coordinateScope);
}

function matchesPredicate(record: BasesRecord, predicate: PropPredicate): boolean {
    const present = predicate.property in record;
    const actual = record[predicate.property];
    switch (predicate.op) {
        case 'eq':
            return actual === predicate.value;
        case 'neq':
            return actual !== predicate.value;
        case 'startsWith':
            return typeof actual === 'string' && actual.startsWith(String(predicate.value));
        case 'lt':
            return numberOrNaN(actual) < numberOrNaN(predicate.value);
        case 'gt':
            return numberOrNaN(actual) > numberOrNaN(predicate.value);
        case 'exists':
            return present && actual !== null && actual !== undefined;
        case 'missing':
            return !present || actual === null || actual === undefined;
        default:
            return true;
    }
}

function sortRecords(records: readonly BasesRecord[], sort: readonly BasesSortKey[] | undefined): readonly BasesRecord[] {
    if (!sort || sort.length === 0) {
        return records;
    }
    // Stable sort: decorate with the original index so equal keys keep input order.
    return Object.freeze(
        records
            .map((record, index) => ({ record, index }))
            .sort((left, right) => {
                for (const key of sort) {
                    const comparison = compareValues(left.record[key.property], right.record[key.property]);
                    if (comparison !== 0) {
                        return key.direction === 'DESC' ? -comparison : comparison;
                    }
                }
                return left.index - right.index;
            })
            .map(entry => entry.record)
    );
}

function groupRecords(records: readonly BasesRecord[], groupBy: string | undefined): readonly BasesRenderGroup[] {
    if (!groupBy) {
        return Object.freeze([Object.freeze({ key: UNGROUPED_KEY, rows: Object.freeze([...records]) })]);
    }
    const order: string[] = [];
    const buckets = new Map<string, BasesRecord[]>();
    for (const record of records) {
        const key = groupKey(record[groupBy]);
        let bucket = buckets.get(key);
        if (!bucket) {
            bucket = [];
            buckets.set(key, bucket);
            order.push(key);
        }
        bucket.push(record);
    }
    return Object.freeze(
        order.map(key => Object.freeze({ key, rows: Object.freeze([...(buckets.get(key) ?? [])]) }))
    );
}

function resolveColumns(records: readonly BasesRecord[], columns: readonly string[]): readonly string[] {
    if (columns.length > 0) {
        return Object.freeze([...columns]);
    }
    // No explicit columns: derive the union of keys, coordinate first.
    const derived: string[] = ['coordinate'];
    const seen = new Set(derived);
    for (const record of records) {
        for (const key of Object.keys(record)) {
            if (!seen.has(key)) {
                seen.add(key);
                derived.push(key);
            }
        }
    }
    return Object.freeze(derived);
}

function collectPendingFields(
    records: readonly BasesRecord[],
    columns: readonly string[],
    config: BaseViewConfig
): readonly string[] {
    const pending: string[] = [];
    if (records.length === 0) {
        pending.push('pending-source:no-records');
    }
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

function groupKey(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return MISSING_GROUP_KEY;
    }
    if (Array.isArray(value)) {
        return value.length ? String(value[0]) : MISSING_GROUP_KEY;
    }
    return String(value);
}

function compareValues(left: unknown, right: unknown): number {
    if (left === right) {
        return 0;
    }
    if (left === null || left === undefined) {
        return right === null || right === undefined ? 0 : 1;
    }
    if (right === null || right === undefined) {
        return -1;
    }
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }
    return String(left).localeCompare(String(right));
}

function numberOrNaN(value: unknown): number {
    return typeof value === 'number' ? value : Number(value);
}
