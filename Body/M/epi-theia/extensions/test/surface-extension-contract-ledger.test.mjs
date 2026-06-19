import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const ledgerPath = join(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json'
);
const layoutTypesPath = join(
    repoRoot,
    'Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts'
);
const activityBarModesPath = join(
    repoRoot,
    'Body/M/epi-theia/extensions/pratibimba-layouts/src/common/activity-bar-modes.ts'
);
const chromeContractPath = join(
    repoRoot,
    'Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md'
);

const ideShellRows = [
    ['pratibimba.ide-shell.chrome-contract', 'landed', '28.1'],
    ['pratibimba.ide-shell.activity-bar', 'landed', '28.2'],
    ['pratibimba.ide-shell.bimba-graph-viewer', 'audit-extend-pending', '28.3'],
    ['pratibimba.ide-shell.canon-studio', 'audit-extend-pending', '28.4'],
    ['pratibimba.ide-shell.agentic-control-room', 'audit-extend-pending', '28.5'],
    ['pratibimba.ide-shell.coordinate-tree', 'audit-extend-pending', '28.6'],
    ['pratibimba.ide-shell.logos-atelier', 'audit-extend-pending', '28.7'],
    ['pratibimba.ide-shell.evidence-pane', 'audit-extend-pending', '28.8'],
    ['pratibimba.ide-shell.review-pane', 'audit-extend-pending', '28.9'],
    ['pratibimba.ide-shell.autoresearch-pane', 'landed', '28.10'],
    ['bridge-gate', 'landed', '28.11'],
    ['pratibimba.smart-connections-sidebar', 'code-pending', '28.12'],
    ['pratibimba.ide-shell.backend-studio', 'landed', '28.13']
];

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function rowByWidgetId(ledger) {
    return new Map(ledger.rows.map(row => [row.widgetId, row]));
}

function extractExpectedWidgets(source, descriptorName) {
    const descriptorStart = source.indexOf(`export const ${descriptorName}`);
    assert.notEqual(descriptorStart, -1, `missing ${descriptorName}`);
    const expectedWidgetsStart = source.indexOf('expectedWidgets:', descriptorStart);
    assert.notEqual(expectedWidgetsStart, -1, `missing ${descriptorName}.expectedWidgets`);
    const arrayStart = source.indexOf('[', expectedWidgetsStart);
    assert.notEqual(arrayStart, -1, `missing ${descriptorName}.expectedWidgets array`);
    let depth = 0;
    for (let index = arrayStart; index < source.length; index += 1) {
        if (source[index] === '[') {
            depth += 1;
        } else if (source[index] === ']') {
            depth -= 1;
            if (depth === 0) {
                const arraySource = source.slice(arrayStart, index + 1);
                return Array.from(
                    arraySource.matchAll(/['"]([^'"]+)['"]/g),
                    match => match[1]
                );
            }
        }
    }
    throw new Error(`unterminated ${descriptorName}.expectedWidgets array`);
}

test('surface-extension-contract ledger records ide-shell rows and current statuses', () => {
    const ledger = readJson(ledgerPath);
    const rows = rowByWidgetId(ledger);

    assert.equal(ledger.version, 1);
    assert.equal(ledger.taskId, '28.T28.20');

    for (const [widgetId, status, tranche] of ideShellRows) {
        const row = rows.get(widgetId);
        assert.ok(row, `missing ledger row for ${widgetId}`);
        assert.equal(row.status, status, `${widgetId} status`);
        assert.equal(row.tranche, tranche, `${widgetId} tranche`);
        assert.ok(row.contractEntry, `${widgetId} contractEntry`);
        assert.ok(row.extensionPackage, `${widgetId} extensionPackage`);
        assert.ok(Array.isArray(row.layoutBindings), `${widgetId} layoutBindings`);
        assert.ok(row.layoutBindings.length > 0, `${widgetId} layoutBindings nonempty`);
    }
});

test('ledger covers ide-deep ide-shell layout ids and 14 no-orphan cross-link', () => {
    const ledger = readJson(ledgerPath);
    const rows = rowByWidgetId(ledger);
    const layoutSource = readFileSync(layoutTypesPath, 'utf8');
    const expectedWidgets = extractExpectedWidgets(layoutSource, 'IDE_DEEP_DESCRIPTOR');
    const ideShellExpectedWidgets = expectedWidgets.filter(
        id => id.startsWith('pratibimba.ide-shell.') || id === 'pratibimba.smart-connections-sidebar'
    );

    for (const widgetId of ideShellExpectedWidgets) {
        assert.ok(rows.has(widgetId), `missing ledger row for IDE_DEEP_DESCRIPTOR widget ${widgetId}`);
    }

    assert.ok(
        ledger.crossLinks.some(link => link.track === '14-no-orphan-audit'),
        'ledger must cross-link the 14 no-orphan audit'
    );
    assert.ok(
        ledger.sourceAnchors.some(anchor => anchor.includes('14-no-orphan-audit-and-release-gates.md')),
        'ledger sourceAnchors must include 14-no-orphan-audit'
    );
});

test('ledger activity-bar rows match the real activity-bar mode declarations', () => {
    const ledger = readJson(ledgerPath);
    const rows = rowByWidgetId(ledger);
    const activitySource = readFileSync(activityBarModesPath, 'utf8');

    const expectedModeRows = new Map([
        ['coordinate-tree', 'pratibimba.ide-shell.coordinate-tree'],
        ['bimba-graph-viewer', 'pratibimba.ide-shell.bimba-graph-viewer'],
        ['canon-studio', 'pratibimba.ide-shell.canon-studio'],
        ['backend-studio', 'pratibimba.ide-shell.backend-studio'],
        ['smart-connections', 'pratibimba.smart-connections-sidebar']
    ]);

    for (const [activityBarMode, widgetId] of expectedModeRows) {
        assert.match(activitySource, new RegExp(`pratibimba\\.activity-bar\\.${activityBarMode}`));
        const row = rows.get(widgetId);
        assert.ok(row, `missing activity-bar ledger row for ${widgetId}`);
        assert.equal(row.activityBarMode, activityBarMode, `${widgetId} activityBarMode`);
    }
});

test('ledger categories stay aligned with the chrome contract surface', () => {
    const ledger = readJson(ledgerPath);
    const rows = rowByWidgetId(ledger);
    const chromeContract = readFileSync(chromeContractPath, 'utf8');

    for (const widgetId of [
        'pratibimba.ide-shell.coordinate-tree',
        'pratibimba.ide-shell.bimba-graph-viewer',
        'pratibimba.ide-shell.canon-studio',
        'pratibimba.ide-shell.logos-atelier',
        'pratibimba.ide-shell.agentic-control-room',
        'pratibimba.ide-shell.evidence-pane',
        'pratibimba.ide-shell.review-pane',
        'pratibimba.ide-shell.autoresearch-pane',
        'bridge-gate'
    ]) {
        const row = rows.get(widgetId);
        assert.ok(row, `missing chrome-contract row for ${widgetId}`);
        assert.match(chromeContract, new RegExp(`\\\`${widgetId}\\\``), `${widgetId} appears in CHROME-CONTRACT.md`);
        assert.match(chromeContract, new RegExp(row.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
});
