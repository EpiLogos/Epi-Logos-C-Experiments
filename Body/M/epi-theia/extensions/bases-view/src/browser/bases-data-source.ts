// Coordinate Header (convention:coordinate-header:v1)
// Coordinate:     C5 / CS — the fetch seam behind the BasesView reflection
// Residency:      Body/M/epi-theia/extensions/bases-view/src/browser
// Position (#5):  Integration — the read-side data layer (static snapshot + live graph)
// Actualises:     Track 48 §13.D — StaticBasesSource / DynamicBasesSource
// Public surface: StaticBasesSource, DynamicBasesSource
// Does NOT own:   render-model shaping (common/bases-view.ts), canon writes (Hen / S1')
// Contract:       data over SharedBridgeAdapter.invokeGatewayRpc only — no Body/S/** import (43.5)

import { SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';
import {
    BaseViewConfig,
    BasesDataSource,
    BasesRecord,
    BASES_RPC,
    BASES_SNAPSHOT_ROOT
} from '../common';

/**
 * Static adapter — reads a Hen-emitted `.base` snapshot through
 * `s1'.vault.read_file`. The snapshot is a C5 reflection captured at a
 * `c_3_projected_at` instant; this adapter never recomputes it.
 */
export class StaticBasesSource implements BasesDataSource {
    constructor(private readonly bridge: SharedBridgeAdapter) {}

    async fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]> {
        const path = config.path ?? defaultSnapshotPath(config.coordinateScope);
        const raw = await this.bridge.invokeGatewayRpc(BASES_RPC.staticRead, { path });
        return coerceRows(raw);
    }
}

/**
 * Dynamic adapter — re-queries the live graph. Prefers the additive
 * `s2.graph.list_by_filter`; until that lands it falls back to
 * `s2.graph.query` then `s2'.retrieve`. Re-fired by the widget on
 * `onCoordinateContext` / `onObservabilityEvent`.
 */
export class DynamicBasesSource implements BasesDataSource {
    constructor(private readonly bridge: SharedBridgeAdapter) {}

    async fetch(config: BaseViewConfig): Promise<readonly BasesRecord[]> {
        const params = {
            coordinateScope: config.coordinateScope,
            propertyFilters: config.filter.map(predicate => ({
                property: predicate.property,
                op: predicate.op,
                value: predicate.value
            })),
            limit: config.limit ?? 200
        };
        const methods = [BASES_RPC.dynamicListByFilter, BASES_RPC.dynamicQuery, BASES_RPC.dynamicRetrieve];
        let lastError: unknown = null;
        for (const method of methods) {
            try {
                const raw = await this.bridge.invokeGatewayRpc(method, params);
                return coerceRows(raw);
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError instanceof Error
            ? lastError
            : new Error('No s2 retrieval method answered the dynamic bases query');
    }
}

/** Pick the data source for a config; both honour the same `BaseViewConfig`. */
export function createBasesDataSource(bridge: SharedBridgeAdapter, source: BaseViewConfig['source']): BasesDataSource {
    return source === 'static' ? new StaticBasesSource(bridge) : new DynamicBasesSource(bridge);
}

function defaultSnapshotPath(coordinateScope: string): string {
    const slug = coordinateScope.trim() === '' ? 'all' : coordinateScope.replace(/[^A-Za-z0-9_-]/g, '_');
    return `${BASES_SNAPSHOT_ROOT}/${slug}.base.json`;
}

/**
 * Normalise the many gateway return shapes into `BasesRecord[]`. Accepts:
 *   - `{ rows: [...] }`            (s2.graph.list_by_filter / §13.E)
 *   - `[...]`                      (bare row array)
 *   - `{ content: "<json>" }`     (s1'.vault.read_file snapshot text)
 *   - `{ results | nodes | hits }` (query / retrieve variants)
 */
export function coerceRows(raw: unknown): readonly BasesRecord[] {
    const value = parseIfString(raw);
    const list = extractRowArray(value);
    return Object.freeze(list.map(toRecord).filter((record): record is BasesRecord => record !== null));
}

function parseIfString(raw: unknown): unknown {
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }
    const record = objectRecord(raw);
    if (record && typeof record.content === 'string') {
        try {
            return JSON.parse(record.content);
        } catch {
            return raw;
        }
    }
    return raw;
}

function extractRowArray(value: unknown): readonly unknown[] {
    if (Array.isArray(value)) {
        return value;
    }
    const record = objectRecord(value);
    if (!record) {
        return [];
    }
    for (const key of ['rows', 'results', 'records', 'nodes', 'hits']) {
        const candidate = record[key];
        if (Array.isArray(candidate)) {
            return candidate;
        }
    }
    return [];
}

function toRecord(item: unknown): BasesRecord | null {
    const record = objectRecord(item);
    if (!record) {
        return null;
    }
    // Some payloads nest frontmatter under `properties`; flatten it up.
    const properties = objectRecord(record.properties);
    const flattened = properties ? { ...properties, ...record } : record;
    const coordinate = stringValue(flattened.coordinate)
        ?? stringValue(properties?.coordinate)
        ?? stringValue(flattened.bimbaCoordinate)
        ?? stringValue(flattened.bimba_coordinate);
    if (!coordinate) {
        return null;
    }
    return { ...flattened, coordinate } as BasesRecord;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}
