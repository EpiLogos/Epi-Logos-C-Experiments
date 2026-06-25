import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const {
    DAILY_0_1_ACTIVITY_BAR_MODES,
    IDE_DEEP_ACTIVITY_BAR_MODES,
    expectedActivityBarModes,
    preserveActivityBarModeForLayout
} = require('../lib/common/activity-bar-modes.js');

test('daily-0-1 registers exactly the three named left activity-bar modes', () => {
    assert.deepEqual(
        DAILY_0_1_ACTIVITY_BAR_MODES.map(mode => mode.modeId),
        [
            'pratibimba.activity-bar.coordinate-tree',
            'pratibimba.activity-bar.bimba-graph-viewer',
            'pratibimba.activity-bar.canon-studio'
        ]
    );
    assert.deepEqual(
        DAILY_0_1_ACTIVITY_BAR_MODES.map(mode => [mode.ownerExtension, mode.widgetId]),
        [
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.coordinate-tree'],
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.bimba-graph-viewer'],
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.canon-studio']
        ]
    );
});

test('ide-deep registers exactly the daily modes plus backend studio and smart connections', () => {
    assert.deepEqual(
        IDE_DEEP_ACTIVITY_BAR_MODES.map(mode => mode.modeId),
        [
            'pratibimba.activity-bar.coordinate-tree',
            'pratibimba.activity-bar.bimba-graph-viewer',
            'pratibimba.activity-bar.canon-studio',
            'pratibimba.activity-bar.backend-studio',
            'pratibimba.activity-bar.smart-connections'
        ]
    );
    assert.deepEqual(
        IDE_DEEP_ACTIVITY_BAR_MODES.map(mode => [mode.ownerExtension, mode.widgetId]),
        [
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.coordinate-tree'],
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.bimba-graph-viewer'],
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.canon-studio'],
            ['ide-shell-m0-m5', 'pratibimba.ide-shell.backend-studio'],
            ['smart-connections-sidebar', 'pratibimba.smart-connections-sidebar']
        ]
    );
    assert.equal(
        expectedActivityBarModes['daily-0-1'],
        DAILY_0_1_ACTIVITY_BAR_MODES
    );
    assert.equal(
        expectedActivityBarModes['ide-deep'],
        IDE_DEEP_ACTIVITY_BAR_MODES
    );
});

test('cross-layout state identity preserves active activity-bar mode when target layout supports it', () => {
    assert.equal(
        preserveActivityBarModeForLayout(
            'ide-deep',
            'pratibimba.activity-bar.bimba-graph-viewer'
        ),
        'pratibimba.activity-bar.bimba-graph-viewer'
    );
    assert.equal(
        preserveActivityBarModeForLayout(
            'daily-0-1',
            'pratibimba.activity-bar.bimba-graph-viewer'
        ),
        'pratibimba.activity-bar.bimba-graph-viewer'
    );
});

test('cross-layout state identity falls back only when the active activity-bar mode is absent', () => {
    assert.equal(
        preserveActivityBarModeForLayout(
            'daily-0-1',
            'pratibimba.activity-bar.backend-studio'
        ),
        'pratibimba.activity-bar.coordinate-tree'
    );
});

test('activity-bar mode ids do not assign conflicting owners', () => {
    const ownerByModeId = new Map();

    for (const mode of IDE_DEEP_ACTIVITY_BAR_MODES) {
        const previousOwner = ownerByModeId.get(mode.modeId);
        assert.ok(
            previousOwner === undefined || previousOwner === mode.ownerExtension,
            `${mode.modeId} is owned by both ${previousOwner} and ${mode.ownerExtension}`
        );
        ownerByModeId.set(mode.modeId, mode.ownerExtension);
    }
});

test('chrome contributions catalog enumerates every ide-deep activity-bar mode', async () => {
    const catalogPath = resolve(
        __dirname,
        '../../contracts/chrome-contributions-catalog.json'
    );
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    const catalogModeIds = new Set(catalog.activityBarModes.map(mode => mode.id));

    assert.equal(catalog.activityBarModes.length, 5);
    for (const mode of IDE_DEEP_ACTIVITY_BAR_MODES) {
        assert.ok(catalogModeIds.has(mode.modeId), `${mode.modeId} missing from catalog`);
    }
});
