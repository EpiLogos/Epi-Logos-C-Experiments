import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const testDir = path.dirname(fileURLToPath(import.meta.url));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS
} = require('../lib/common/workspace-persistence.js');
const {
    Daily01ToggleChrome,
    DAILY_0_1_TOGGLE_KEYSTROKE,
    createDaily01ToggleController,
    isDaily01ToggleKeyEvent,
    preserveBimbaPratibimbaUiStateAcrossDaily01Toggle
} = require('../lib/browser/composition-profile-context.js');
const {
    LEMNISCATE_TRANSITION_PATH
} = require('../lib/browser/design-primitives/index.js');

test('cmd-period is the daily 0/1 toggle gesture and flips cosmic to personal', () => {
    const controller = createDaily01ToggleController('cosmic');
    const event = keyEvent({ key: '.', metaKey: true });

    assert.equal(DAILY_0_1_TOGGLE_KEYSTROKE, 'cmd-period');
    assert.equal(isDaily01ToggleKeyEvent(event), true);

    const next = controller.handleKeyDown(event);

    assert.equal(event.defaultPrevented, true);
    assert.equal(next, 'personal');
    assert.equal(controller.currentFace(), 'personal');
});

test('plain period remains available as the nesting operator', () => {
    const controller = createDaily01ToggleController('cosmic');
    const event = keyEvent({ key: '.', metaKey: false, ctrlKey: false });

    assert.equal(isDaily01ToggleKeyEvent(event), false);
    assert.equal(controller.handleKeyDown(event), null);
    assert.equal(event.defaultPrevented, false);
    assert.equal(controller.currentFace(), 'cosmic');
});

test('daily toggle chrome renders a coin-flip title-bar affordance over the lemniscate primitive', () => {
    const html = renderToStaticMarkup(
        React.createElement(
            Daily01ToggleChrome,
            {
                activeFace: 'cosmic',
                onToggle: () => undefined
            },
            React.createElement('section', { 'data-test': 'daily-face' }, 'daily composition')
        )
    );

    assert.match(html, /data-test="daily-0-1-toggle-chrome"/);
    assert.match(html, /data-test="daily-0-1-coin-flip"/);
    assert.match(html, /aria-label="Toggle daily 0\/1 face: cosmic to personal"/);
    assert.match(html, /data-transition-from="cosmic"/);
    assert.match(html, /data-transition-to="personal"/);
    assert.match(html, /data-test="daily-face"/);
});

test('six Bimba/Pratibimba globals survive the daily 0/1 face toggle', () => {
    const state = Object.freeze({
        coordinate: 'M3-4',
        lens: 'q-cosmic',
        mode: 'daily',
        profileGeneration: 137,
        sessionKey: 'session:20260602-201032-77ad76',
        dayNow: 'Idea/Empty/Present/02-06-2026/20260602-201032-77ad76/now.md'
    });

    const preserved = preserveBimbaPratibimbaUiStateAcrossDaily01Toggle(state, 'cosmic', 'personal');

    assert.deepEqual(BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS, [
        'coordinate',
        'lens',
        'mode',
        'profileGeneration',
        'sessionKey',
        'dayNow'
    ]);
    assert.notEqual(preserved, state);
    assert.deepEqual(preserved, state);
});

test('lemniscate visual-regression fixture remains bound to the transition primitive path', () => {
    const manifestPath = path.resolve(
        testDir,
        '../../acceptance-harness/fixtures/visual-regression/lemniscate-transition/manifest.json'
    );
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.equal(manifest.fixtureId, 'visual-regression/lemniscate-transition');
    assert.equal(manifest.status, 'baseline-committed');
    assert.match(manifest.coverage.join('\n'), /15\.5 lemniscate transition/);
    assert.deepEqual(manifest.framePhases, [0, 0.25, 0.5, 0.75, 1]);
    assert.equal(typeof LEMNISCATE_TRANSITION_PATH, 'string');
    assert.match(LEMNISCATE_TRANSITION_PATH, /^M 12 50 C /);
});

function keyEvent({ key, metaKey = false, ctrlKey = false }) {
    return {
        key,
        metaKey,
        ctrlKey,
        defaultPrevented: false,
        preventDefault() {
            this.defaultPrevented = true;
        }
    };
}
