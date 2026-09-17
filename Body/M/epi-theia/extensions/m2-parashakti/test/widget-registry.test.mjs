import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const declaredViews = Object.freeze([
    {
        id: 'm2.parashakti.meaningPacket',
        className: 'M2ParashaktiWidget',
        sourcePath: join(extensionRoot, 'src/browser/m2-parashakti-widget.tsx'),
        idExpression: 'PRIMARY_VIEW_ID'
    },
    {
        id: 'm2.parashakti.cymaticEngine',
        className: 'M2CymaticEngineWidget',
        sourcePath: join(extensionRoot, 'src/browser/m2-cymatic-engine-widget.tsx'),
        idExpression: "'m2.parashakti.cymaticEngine'"
    },
    {
        id: 'm2.parashakti.correspondenceTree',
        className: 'M2CorrespondenceTreeWidget',
        sourcePath: join(extensionRoot, 'src/browser/m2-correspondence-tree-widget.tsx'),
        idExpression: "'m2.parashakti.correspondenceTree'"
    }
]);

function readSource(path) {
    assert.ok(existsSync(path), `missing source file: ${path}`);
    return readFileSync(path, 'utf8');
}

test('ALL_VIEW_IDS declares the three primary M2 view ids in contract order', () => {
    const commonSource = readSource(join(extensionRoot, 'src/common/index.ts'));
    const match = commonSource.match(/export const ALL_VIEW_IDS = \[([^\]]+)\] as const;/);
    assert.ok(match, 'ALL_VIEW_IDS constant must be present');

    const actual = Array.from(match[1].matchAll(/"([^"]+)"/g), match => match[1]);
    assert.deepEqual(actual, declaredViews.map(view => view.id));
});

test('each declared M2 view has a ReactWidget class with packet-backed render surface', () => {
    for (const view of declaredViews) {
        const source = readSource(view.sourcePath);
        assert.match(source, new RegExp(`export class ${view.className} extends ReactWidget`));
        assert.match(source, new RegExp(`static readonly ID = ${view.idExpression}`));
        assert.match(source, /protected override render\(\): React\.ReactNode/);
        assert.match(source, /<ReadinessBanner/);
        assert.match(source, /buildM2PrimeMeaningPacket/);
        assert.match(source, /M2PrimeMeaningPacket/);
    }
});

test('each M2 widget subscribes to the same SharedBridgeAdapter channels', () => {
    const expectedChannels = ['onReadiness', 'onProfile', 'onCoordinateContext'];

    for (const view of declaredViews) {
        const source = readSource(view.sourcePath);
        for (const channel of expectedChannels) {
            assert.match(source, new RegExp(`this\\.bridge\\.${channel}\\(`), `${view.className} missing ${channel}`);
        }
    }
});

test('frontend module registers a WidgetFactory owner for every declared M2 view', () => {
    const source = readSource(join(extensionRoot, 'src/browser/frontend-module.ts'));

    for (const view of declaredViews) {
        assert.match(source, new RegExp(`import \\{ ${view.className} \\}`), `${view.className} must be imported`);
        assert.match(source, new RegExp(`bind\\(${view.className}\\)\\.toSelf\\(\\)`), `${view.className} must be bound`);
        assert.match(source, new RegExp(`id: ${view.className}\\.ID`), `${view.className} must own a factory id`);
        assert.match(
            source,
            new RegExp(`child\\.bind\\(${view.className}\\)\\.toSelf\\(\\)`),
            `${view.className} must be created in an isolated child container`
        );
    }
});
