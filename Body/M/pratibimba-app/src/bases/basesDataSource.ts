/**
 * Coordinate: M' C5/CS Bases read adapters (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Position (#5): gateway-only static snapshot and dynamic graph reads.
 * Actualises: StaticBasesSource and DynamicBasesSource over the app's one gateway.
 * Public surface: BasesGateway, BasesDataSource, StaticBasesSource, DynamicBasesSource.
 * Does NOT own: S1 vault law, S2 graph law, snapshot generation, or rendering.
 * Contract: no Body/S import; all production reads use GatewayClient.invoke.
 */

import { BaseViewConfig, BasesRecord, PropPredicate } from './basesViewModel';

export interface BasesGatewayReceipt {
    readonly artifact: unknown;
}

export interface BasesGateway {
    invoke(method: string, params: Record<string, unknown>): Promise<BasesGatewayReceipt>;
}

export interface BasesDataSource {
    fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]>;
}

const SNAPSHOT_ROOT = 'Bimba/Map/snapshots';
const STATIC_READ_METHOD = "s1'.vault.read_file";
const DYNAMIC_QUERY_METHOD = 's2.graph.query';
const DYNAMIC_RETRIEVE_METHOD = "s2'.retrieve";
const DYNAMIC_LIST_BY_FILTER_METHOD = 's2.graph.list_by_filter';

export const BASES_DYNAMIC_CYPHER = [
    'MATCH (n:Bimba)',
    "WHERE $scope = '' OR n.coordinate STARTS WITH $scope",
    'RETURN n.coordinate AS coordinate, coalesce(n.title, n.label) AS title, properties(n) AS properties',
    'ORDER BY n.coordinate',
    'LIMIT $limit'
].join(' ');

export class StaticBasesSource implements BasesDataSource {
    constructor(private readonly gateway: BasesGateway) {}

    async fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]> {
        const path = config.path ?? snapshotPathForScope(config.coordinateScope);
        const receipt = await this.gateway.invoke(STATIC_READ_METHOD, { path });
        return coerceBasesRows(receipt.artifact);
    }
}

export class DynamicBasesSource implements BasesDataSource {
    constructor(private readonly gateway: BasesGateway) {}

    async fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]> {
        const limit = Math.max(1, Math.min(1000, Math.trunc(config.limit ?? 300)));
        // Spec 13.D primary RPC: the typed, injection-safe list_by_filter pushes
        // BOTH the coordinate scope AND the property predicates server-side (into
        // the Neo4j WHERE), rather than dropping config.filter and post-filtering
        // every row client-side in basesViewModel.
        try {
            const receipt = await this.gateway.invoke(DYNAMIC_LIST_BY_FILTER_METHOD, {
                coordinateScope: config.coordinateScope,
                propertyFilters: toPropertyFilters(config.filter),
                limit
            });
            return coerceBasesRows(receipt.artifact);
        } catch (listError) {
            // Fallback 1: raw coordinate-scoped cypher (predicates applied client-side).
            try {
                const receipt = await this.gateway.invoke(DYNAMIC_QUERY_METHOD, {
                    cypher: BASES_DYNAMIC_CYPHER,
                    params: { scope: config.coordinateScope, limit }
                });
                return coerceBasesRows(receipt.artifact);
            } catch (queryError) {
                // Fallback 2: semantic retrieve.
                try {
                    const receipt = await this.gateway.invoke(DYNAMIC_RETRIEVE_METHOD, {
                        query: config.coordinateScope || 'Bimba coordinate map',
                        depth: 2
                    });
                    return coerceBasesRows(receipt.artifact);
                } catch (retrieveError) {
                    const first = listError instanceof Error ? listError.message : String(listError);
                    const second = queryError instanceof Error ? queryError.message : String(queryError);
                    const third = retrieveError instanceof Error ? retrieveError.message : String(retrieveError);
                    throw new Error(
                        `dynamic Bases read failed via list_by_filter (${first}), query (${second}) and retrieve (${third})`
                    );
                }
            }
        }
    }
}

/**
 * Map the view-model's PropPredicate[] to the gateway `propertyFilters` envelope.
 * The op vocabulary is 1:1 with the S2 builder (eq/neq/startsWith/lt/gt/exists/
 * missing); `value` is always present (null for exists/missing) so the Rust
 * PropPredicate deserialises without a missing-field error.
 */
export function toPropertyFilters(
    filter: readonly PropPredicate[] | undefined
): ReadonlyArray<{ property: string; op: string; value: unknown }> {
    return (filter ?? []).map(predicate => ({
        property: predicate.property,
        op: predicate.op,
        value: predicate.value ?? null
    }));
}

export function createBasesDataSource(gateway: BasesGateway, source: BaseViewConfig['source']): BasesDataSource {
    return source === 'static' ? new StaticBasesSource(gateway) : new DynamicBasesSource(gateway);
}

export function snapshotPathForScope(scope: string): string {
    const family = scope.trim().match(/^M[0-5]/)?.[0] ?? 'all';
    return `${SNAPSHOT_ROOT}/${family}.base.json`;
}

export function coerceBasesRows(artifact: unknown): readonly BasesRecord[] {
    const value = parseGatewayContent(artifact);
    const source = rowArray(value);
    const records: BasesRecord[] = [];
    for (const item of source) {
        const record = asRecord(item);
        if (!record) continue;
        const properties = asRecord(record.properties);
        const flattened = properties ? { ...properties, ...record } : { ...record };
        delete flattened.properties;
        const coordinate = firstString(
            flattened.coordinate,
            flattened.bimbaCoordinate,
            flattened.bimba_coordinate,
            properties?.coordinate
        );
        if (coordinate) records.push(Object.freeze({ ...flattened, coordinate }));
    }
    return Object.freeze(records);
}

function parseGatewayContent(artifact: unknown): unknown {
    if (typeof artifact === 'string') return parseJson(artifact);
    const record = asRecord(artifact);
    const contents = record && (record.contents ?? record.content);
    return typeof contents === 'string' ? parseJson(contents) : artifact;
}

function parseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function rowArray(value: unknown): readonly unknown[] {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];
    for (const key of ['rows', 'records', 'results', 'nodes', 'hits', 'items']) {
        if (Array.isArray(record[key])) return record[key] as readonly unknown[];
    }
    return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function firstString(...values: unknown[]): string | null {
    return values.find(value => typeof value === 'string' && value.trim() !== '') as string | undefined ?? null;
}
