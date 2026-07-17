/**
 * Coordinate: M' C5/CS Bases render-model proof (48.T48.6).
 * Actualises: deterministic client-side scope, predicate, sort, group, and
 * view-mode shaping over real coordinate records.
 * Does NOT own: gateway transport or vault projection emission.
 */

import { describe, expect, it } from 'vitest';
import { BaseViewConfig, BasesRecord, basesModelFromRecords } from './basesViewModel';

const RECORDS: readonly BasesRecord[] = Object.freeze([
    Object.freeze({ coordinate: 'M2-1', title: 'MEF Root', c_4_artifact_role: 'map-index', image: 'm2-1.png' }),
    Object.freeze({ coordinate: 'M2-1-0', title: 'Lens Zero', c_4_artifact_role: 'map-index' }),
    Object.freeze({ coordinate: 'M2-1-1', title: 'Lens One', c_4_artifact_role: 'now' }),
    Object.freeze({ coordinate: 'M3-0', title: 'Mahamaya Ground', c_4_artifact_role: 'map-index' })
]);

function config(patch: Partial<BaseViewConfig> = {}): BaseViewConfig {
    return {
        source: 'static',
        coordinateScope: '',
        filter: [],
        view: 'table',
        columns: ['coordinate', 'title'],
        ...patch
    };
}

describe('basesModelFromRecords', () => {
    it('scopes, filters, sorts, and groups records without mutating input', () => {
        const input = [...RECORDS];
        const model = basesModelFromRecords(input, config({
            coordinateScope: 'M2-1',
            filter: [{ property: 'title', op: 'startsWith', value: 'Lens' }],
            groupBy: 'c_4_artifact_role',
            sort: [{ property: 'coordinate', direction: 'DESC' }]
        }));

        expect(model.rowCount).toBe(2);
        expect(model.groups.map(group => group.key)).toEqual(['now', 'map-index']);
        expect(model.groups.flatMap(group => group.rows.map(row => row.coordinate))).toEqual(['M2-1-1', 'M2-1-0']);
        expect(input).toEqual(RECORDS);
        expect(Object.isFrozen(model)).toBe(true);
    });

    it('supports equality, existence, missing, and numeric predicates', () => {
        expect(basesModelFromRecords(RECORDS, config({
            filter: [{ property: 'c_4_artifact_role', op: 'eq', value: 'map-index' }]
        })).rowCount).toBe(3);
        expect(basesModelFromRecords(RECORDS, config({
            filter: [{ property: 'image', op: 'exists' }]
        })).rowCount).toBe(1);
        expect(basesModelFromRecords(RECORDS, config({
            filter: [{ property: 'image', op: 'missing' }]
        })).rowCount).toBe(3);
        expect(basesModelFromRecords([
            { coordinate: 'M1', rank: 1 },
            { coordinate: 'M2', rank: 2 }
        ], config({ filter: [{ property: 'rank', op: 'gt', value: 1 }] })).rowCount).toBe(1);
    });

    it('derives coordinate-first columns and reports incomplete image bindings', () => {
        const derived = basesModelFromRecords(RECORDS, config({ columns: [] }));
        expect(derived.columns[0]).toBe('coordinate');
        expect(derived.columns).toContain('title');

        const cards = basesModelFromRecords(RECORDS, config({ view: 'cards' }));
        expect(cards.pendingFields).toContain('pending-config-field:image');

        const empty = basesModelFromRecords([], config());
        expect(empty.pendingFields).toContain('pending-source:no-records');
    });
});
