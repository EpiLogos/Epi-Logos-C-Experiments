import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {
    COMPOSITION_STATE_FIELDS,
    COMPOSITION_TOGGLE_CLASSES,
    COMPOSITION_IDS,
    emptyCompositionState,
    persistCompositionState,
    readCompositionState,
    serializeCompositionState,
    deserializeCompositionState,
    preserveCompositionStateAcrossToggle
} = require('../lib/common/workspace-persistence.js');

const TMP_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'epi-composition-state-'));
process.env.EPI_LOGOS_HOME = TMP_HOME;

test.after(() => {
    fs.rmSync(TMP_HOME, { recursive: true, force: true });
});

function fullState(compositionId) {
    return {
        compositionId,
        pinnedMatrixFamily: 5,
        pinnedTorusView: 'geodesic',
        cosmicSelectedCoordinate: '#1-2-3',
        cosmicKleinToPersonalHinge: true,
        pinnedRecognitionSlot: '5',
        personalSelectedDayId: '2026-06-10',
        personalReviewQueueFilter: 'unread',
        personalKleinToCosmicHinge: true
    };
}

test('the field-name registry names the requested composition-state fields', () => {
    const expected = [
        'compositionId',
        'pinnedMatrixFamily',
        'pinnedTorusView',
        'cosmicSelectedCoordinate',
        'cosmicKleinToPersonalHinge',
        'pinnedRecognitionSlot',
        'personalSelectedDayId',
        'personalReviewQueueFilter',
        'personalKleinToCosmicHinge'
    ];

    assert.deepEqual([...COMPOSITION_STATE_FIELDS].sort(), [...expected].sort());
});

test('round-trip persistence preserves every composition-state field', async () => {
    for (const id of COMPOSITION_IDS) {
        const state = fullState(id);
        await persistCompositionState(state);

        const read = await readCompositionState(id);
        assert.ok(read !== null, 'read must return persisted state');
        for (const field of COMPOSITION_STATE_FIELDS) {
            assert.deepEqual(read[field], state[field], `field "${field}" must round-trip`);
        }
    }
});

test('state survives daily-0-1 <-> ide-deep layout toggle', () => {
    const state = fullState('cosmic-engine.integrated');
    const after = preserveCompositionStateAcrossToggle(state, 'layout:daily-0-1<->ide-deep');

    for (const field of COMPOSITION_STATE_FIELDS) {
        assert.deepEqual(after[field], state[field], `field "${field}" must survive layout toggle`);
    }
});

test('state survives cosmic <-> personal 0/1 toggle', () => {
    const state = fullState('jiva-siva.integrated');
    const after = preserveCompositionStateAcrossToggle(state, 'face:cosmic<->personal-0/1');

    for (const field of COMPOSITION_STATE_FIELDS) {
        assert.deepEqual(after[field], state[field], `field "${field}" must survive face toggle`);
    }
});

test('restart re-reads state from ~/.epi-logos composition storage', async () => {
    const id = 'cosmic-engine.integrated';
    const state = fullState(id);

    await persistCompositionState(state);

    const expectedPath = path.join(TMP_HOME, 'composition', `${id}.json`);
    assert.equal(fs.existsSync(expectedPath), true);
    assert.deepEqual(await readCompositionState(id), state);
    assert.deepEqual(await readCompositionState(id), deserializeCompositionState(id, serializeCompositionState(state)));
});

test('missing state returns null and partial state normalizes to safe defaults', async () => {
    const cleanHome = fs.mkdtempSync(path.join(os.tmpdir(), 'epi-composition-empty-'));
    const prev = process.env.EPI_LOGOS_HOME;
    process.env.EPI_LOGOS_HOME = cleanHome;
    try {
        assert.equal(await readCompositionState('jiva-siva.integrated'), null);

        const normalized = deserializeCompositionState(
            'jiva-siva.integrated',
            JSON.stringify({ pinnedMatrixFamily: 99, pinnedTorusView: 'unknown' })
        );
        assert.deepEqual(normalized, emptyCompositionState('jiva-siva.integrated'));
    } finally {
        process.env.EPI_LOGOS_HOME = prev;
        fs.rmSync(cleanHome, { recursive: true, force: true });
    }
});

test('both canonical toggle classes preserve every field', () => {
    assert.equal(COMPOSITION_TOGGLE_CLASSES.length, 2);
    const state = fullState('cosmic-engine.integrated');

    for (const toggle of COMPOSITION_TOGGLE_CLASSES) {
        const after = preserveCompositionStateAcrossToggle(state, toggle);
        for (const field of COMPOSITION_STATE_FIELDS) {
            assert.deepEqual(after[field], state[field], `"${field}" via ${toggle}`);
        }
    }
});
