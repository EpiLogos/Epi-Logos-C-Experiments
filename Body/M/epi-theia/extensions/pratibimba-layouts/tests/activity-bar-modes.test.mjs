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
    expectedActivityBarModes
} = require('../lib/common/activity-bar-modes.js');

test('daily-0-1 activity-bar modes contain exactly three cosmic and three personal entries', () => {
    assert.equal(DAILY_0_1_ACTIVITY_BAR_MODES.length, 6);
    assert.deepEqual(
        DAILY_0_1_ACTIVITY_BAR_MODES.map(mode => mode.modeId),
        [
            'pratibimba.activity-bar.coordinate-tree',
            'pratibimba.activity-bar.bimba-graph-viewer',
            'pratibimba.activity-bar.canon-studio',
            'pratibimba.activity-bar.day-calendar',
            'pratibimba.activity-bar.journal-entries',
            'pratibimba.activity-bar.personal-coordinate'
        ]
    );
    assert.deepEqual(
        DAILY_0_1_ACTIVITY_BAR_MODES.map(mode => mode.ownerExtension),
        [
            'ide-shell-m0-m5',
            'ide-shell-m0-m5',
            'ide-shell-m0-m5',
            'm4-nara',
            'm4-nara',
            'm4-nara'
        ]
    );
});

test('ide-deep activity-bar modes extend daily-0-1 with backend studio and smart connections', () => {
    assert.equal(IDE_DEEP_ACTIVITY_BAR_MODES.length, 8);
    assert.deepEqual(
        IDE_DEEP_ACTIVITY_BAR_MODES.slice(0, DAILY_0_1_ACTIVITY_BAR_MODES.length),
        DAILY_0_1_ACTIVITY_BAR_MODES
    );
    assert.deepEqual(
        IDE_DEEP_ACTIVITY_BAR_MODES.slice(-2).map(mode => mode.modeId),
        [
            'pratibimba.activity-bar.backend-studio',
            'pratibimba.activity-bar.smart-connections'
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

    assert.equal(catalog.activityBarModes.length, 8);
    for (const mode of IDE_DEEP_ACTIVITY_BAR_MODES) {
        assert.ok(catalogModeIds.has(mode.modeId), `${mode.modeId} missing from catalog`);
    }
});
