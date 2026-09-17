// Pure render-service tests for basesModelFromRecords (Track 48 §13.D).
// Runs against the compiled lib (`pnpm build` first) — node --test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { basesModelFromRecords } from '../lib/common/bases-view.js';

const RECORDS = [
    { coordinate: 'M2-1', title: 'MEF Root', c_4_artifact_role: 'map-index', symbol: '![[m2-1.png]]' },
    { coordinate: 'M2-1-0', title: 'Lens Zero', c_4_artifact_role: 'map-index' },
    { coordinate: 'M2-1-1', title: 'Lens One', c_4_artifact_role: 'now' },
    { coordinate: 'M3-0', title: 'Mahamaya Ground', c_4_artifact_role: 'map-index' }
];

test('coordinateScope slices by prefix', () => {
    const model = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: 'M2-1', filter: [], view: 'table', columns: ['coordinate', 'title']
    });
    assert.equal(model.rowCount, 3);
    assert.ok(model.groups[0].rows.every(r => r.coordinate.startsWith('M2-1')));
});

test('empty scope selects all', () => {
    const model = basesModelFromRecords(RECORDS, {
        source: 'dynamic', coordinateScope: '', filter: [], view: 'list', columns: []
    });
    assert.equal(model.rowCount, 4);
});

test('predicate filter (eq) applies client-side', () => {
    const model = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: '', view: 'table', columns: ['coordinate'],
        filter: [{ property: 'c_4_artifact_role', op: 'eq', value: 'map-index' }]
    });
    assert.equal(model.rowCount, 3);
});

test('startsWith / exists / missing predicates', () => {
    const starts = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: '', view: 'table', columns: ['coordinate'],
        filter: [{ property: 'title', op: 'startsWith', value: 'Lens' }]
    });
    assert.equal(starts.rowCount, 2);
    const hasSymbol = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: '', view: 'table', columns: ['coordinate'],
        filter: [{ property: 'symbol', op: 'exists' }]
    });
    assert.equal(hasSymbol.rowCount, 1);
    const noSymbol = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: '', view: 'table', columns: ['coordinate'],
        filter: [{ property: 'symbol', op: 'missing' }]
    });
    assert.equal(noSymbol.rowCount, 3);
});

test('groupBy partitions and sort orders deterministically', () => {
    const model = basesModelFromRecords(RECORDS, {
        source: 'dynamic', coordinateScope: '', filter: [], view: 'table', columns: ['coordinate'],
        groupBy: 'c_4_artifact_role',
        sort: [{ property: 'coordinate', direction: 'DESC' }]
    });
    const keys = model.groups.map(g => g.key);
    assert.ok(keys.includes('map-index'));
    assert.ok(keys.includes('now'));
    const mapIndex = model.groups.find(g => g.key === 'map-index');
    assert.deepEqual(mapIndex.rows.map(r => r.coordinate), ['M3-0', 'M2-1-0', 'M2-1']);
});

test('pendingFields flags missing image binding and no rows', () => {
    const noImage = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: '', filter: [], view: 'cards', columns: ['coordinate']
    });
    assert.ok(noImage.pendingFields.includes('pending-config-field:image'));
    const empty = basesModelFromRecords([], {
        source: 'static', coordinateScope: '', filter: [], view: 'table', columns: ['coordinate']
    });
    assert.ok(empty.pendingFields.includes('pending-source:no-records'));
});

test('derives columns when none provided (coordinate first)', () => {
    const model = basesModelFromRecords(RECORDS, {
        source: 'static', coordinateScope: 'M2-1-1', filter: [], view: 'table', columns: []
    });
    assert.equal(model.columns[0], 'coordinate');
    assert.ok(model.columns.includes('title'));
});
