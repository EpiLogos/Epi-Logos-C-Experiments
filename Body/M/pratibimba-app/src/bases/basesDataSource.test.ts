/**
 * Coordinate: M' C5/CS Bases data-adapter proof (48.T48.6).
 * Actualises: the static gateway adapter against a real projected snapshot and
 * defensive coercion of live graph row shapes.
 * Does NOT own: snapshot generation or S2 query execution.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    BasesGateway,
    DynamicBasesSource,
    StaticBasesSource,
    coerceBasesRows,
    snapshotPathForScope
} from './basesDataSource';

const IDEA_ROOT = resolve(import.meta.dirname, '../../../../../Idea');

class RealVaultReadGateway implements BasesGateway {
    async invoke(method: string, params: Record<string, unknown>) {
        if (method !== "s1'.vault.read_file") {
            throw new Error(`unsupported method ${method}`);
        }
        const path = String(params.path);
        return {
            artifact: {
                path,
                contents: await readFile(resolve(IDEA_ROOT, path), 'utf8'),
                privacyClass: 'public'
            }
        };
    }
}

describe('Bases data sources', () => {
    it('reads the real M2 snapshot through the static gateway contract', async () => {
        const source = new StaticBasesSource(new RealVaultReadGateway());
        const rows = await source.fetch({
            source: 'static',
            coordinateScope: 'M2-1',
            filter: [],
            view: 'table',
            columns: ['coordinate', 'title']
        });

        expect(snapshotPathForScope('M2-1')).toBe('Bimba/Map/snapshots/M2.base.json');
        expect(rows.length).toBeGreaterThan(100);
        expect(rows.some(row => row.coordinate === 'M2-1')).toBe(true);
        expect(rows.every(row => typeof row.coordinate === 'string')).toBe(true);
    });

    it('flattens graph properties and rejects rows without coordinates', () => {
        expect(coerceBasesRows({
            rows: [
                { coordinate: 'M3-2', properties: { title: 'Mahamaya', c_4_artifact_role: 'map-index' } },
                { properties: { title: 'No coordinate' } }
            ]
        })).toEqual([
            expect.objectContaining({ coordinate: 'M3-2', title: 'Mahamaya', c_4_artifact_role: 'map-index' })
        ]);
    });

    it('dispatches dynamic reads to s2.graph.list_by_filter with server-side property predicates', async () => {
        const calls: Array<{ method: string; params: Record<string, unknown> }> = [];
        const gateway: BasesGateway = {
            async invoke(method, params) {
                calls.push({ method, params });
                if (method !== 's2.graph.list_by_filter') throw new Error(`unexpected ${method}`);
                return {
                    artifact: {
                        rows: [{ coordinate: 'M2-1', properties: { title: 'MEF', c_4_ql_position: 1 } }]
                    }
                };
            }
        };
        const rows = await new DynamicBasesSource(gateway).fetch({
            source: 'dynamic',
            coordinateScope: 'M2',
            filter: [{ property: 'c_4_ql_position', op: 'eq', value: 1 }],
            view: 'table',
            columns: ['coordinate', 'title']
        });

        expect(calls).toHaveLength(1);
        expect(calls[0].method).toBe('s2.graph.list_by_filter');
        expect(calls[0].params).toEqual({
            coordinateScope: 'M2',
            propertyFilters: [{ property: 'c_4_ql_position', op: 'eq', value: 1 }],
            limit: 300
        });
        expect(rows).toEqual([
            expect.objectContaining({ coordinate: 'M2-1', title: 'MEF', c_4_ql_position: 1 })
        ]);
    });

    it('falls back to s2.graph.query when list_by_filter is unavailable', async () => {
        const methods: string[] = [];
        const gateway: BasesGateway = {
            async invoke(method) {
                methods.push(method);
                if (method === 's2.graph.list_by_filter') throw new Error('unimplemented');
                if (method === 's2.graph.query') {
                    return { artifact: { rows: [{ coordinate: 'M2-3', properties: { title: 'Codon' } }] } };
                }
                throw new Error(`unexpected ${method}`);
            }
        };
        const rows = await new DynamicBasesSource(gateway).fetch({
            source: 'dynamic',
            coordinateScope: 'M2',
            filter: [],
            view: 'table',
            columns: ['coordinate']
        });

        expect(methods).toEqual(['s2.graph.list_by_filter', 's2.graph.query']);
        expect(rows).toEqual([expect.objectContaining({ coordinate: 'M2-3', title: 'Codon' })]);
    });
});
