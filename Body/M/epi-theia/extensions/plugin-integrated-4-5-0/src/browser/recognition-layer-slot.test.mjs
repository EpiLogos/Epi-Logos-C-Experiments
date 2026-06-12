// 26.T26.11 verification suite — m5.epii.recognitionLayer composition slot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

function installBrowserShim() {
    require.extensions['.css'] = () => undefined;

    class ElementStub {}
    ElementStub.prototype.matches = () => false;
    ElementStub.prototype.msMatchesSelector = () => false;
    ElementStub.prototype.webkitMatchesSelector = () => false;
    ElementStub.prototype.contains = () => false;

    globalThis.Element = ElementStub;
    globalThis.HTMLElement = ElementStub;
    globalThis.HTMLDivElement = ElementStub;
    globalThis.Event = class {};
    globalThis.KeyboardEvent = class {};
    globalThis.MouseEvent = class {};

    const element = () => Object.assign(new ElementStub(), {
        className: '',
        classList: {
            add() {},
            remove() {},
            contains() { return false; },
            toggle() {}
        },
        dataset: {},
        setAttribute() {},
        getAttribute() { return null; },
        removeAttribute() {},
        style: {},
        appendChild() {},
        removeChild() {},
        insertBefore() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return true; },
        contains() { return false; },
        focus() {},
        blur() {},
        parentElement: null,
        children: [],
        childNodes: []
    });

    const navigator = { userAgent: 'node', platform: 'Linux x86_64', maxTouchPoints: 0, clipboard: {} };
    globalThis.document = {
        createElement: element,
        documentElement: { style: {} },
        body: Object.assign(element(), { style: {} }),
        activeElement: null,
        addEventListener() {},
        removeEventListener() {},
        createTextNode: text => ({ textContent: text }),
        queryCommandSupported() { return false; }
    };
    globalThis.window = {
        document: globalThis.document,
        navigator,
        localStorage: {
            getItem() { return null; },
            setItem() {},
            removeItem() {}
        },
        getComputedStyle: () => ({}),
        addEventListener() {},
        removeEventListener() {},
        requestAnimationFrame: callback => setTimeout(callback, 0),
        cancelAnimationFrame: id => clearTimeout(id),
        location: { href: 'http://localhost/' }
    };
    Object.defineProperty(globalThis, 'navigator', {
        value: navigator,
        configurable: true
    });

    const {
        FrontendApplicationConfigProvider
    } = require('../../../../node_modules/@theia/core/lib/browser/frontend-application-config-provider.js');
    FrontendApplicationConfigProvider.set({
        applicationName: 'plugin-integrated-4-5-0-test',
        defaultTheme: 'light',
        defaultIconTheme: 'none'
    });
}

installBrowserShim();

const slot = require('../../lib/browser/recognition-layer-slot.js');

function profile(payload) {
    return Object.freeze({ payload: Object.freeze(payload) });
}

function recognitionProfile(overrides = {}) {
    return profile({
        q_nara: [1, 0, 0, 0],
        q_cosmic: [1, 0, 0, 0],
        q_activity: [1, 0, 0, 0],
        klein_v4_square: 'ab',
        canon_recognition_anchor: {
            coordinate: 'M3-2',
            targetResonanceVector: [1, 0, 0, 0],
            personalCodonProjection: 'codon_rotation_projection:personal:M3-2',
            canonRingLabel: 'Canonical Bimba Ring M3-2'
        },
        ...overrides
    });
}

test('recognition-layer slot is the third editor-area composition member, not a side panel', () => {
    assert.equal(
        slot.M5_RECOGNITION_LAYER_SLOT_ID,
        'pratibimba.m5-epii.recognitionLayer'
    );
    assert.equal(slot.COMPOSITION_MODE, 'editor-area-inline');
    assert.notEqual(slot.COMPOSITION_MODE, 'side-by-side');

    const contract = JSON.parse(readFileSync(join(
        process.cwd(),
        'Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.json'
    ), 'utf8'));
    const editorArea = contract.compatibilityMatrix['plugin-integrated-4-5-0'].editorAreaComposition;
    assert.match(editorArea.rule, /ONE editor-area composition/);
    assert.match(editorArea.rule, /NOT three side-by-side panels/);
    assert.deepEqual(
        editorArea.slots.map(s => s.id),
        ['m4.nara.journal', 'm0.anuttara.cymaticField', 'm5.epii.recognitionLayer']
    );

    const recognitionSlot = editorArea.slots[2];
    assert.equal(recognitionSlot.role, 'mahamaya-recognition-layer');
    assert.equal(recognitionSlot.position, 'right');
    assert.equal(recognitionSlot.file, 'Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/recognition-layer-slot.tsx');
    assert.ok(recognitionSlot.consumes.includes('CanonRecognitionAnchor'));
    assert.ok(recognitionSlot.consumes.includes('Q_composed'));
});

test('recognition strength recomputes when Q_composed advances', () => {
    const aligned = slot.deriveRecognitionViewModel(recognitionProfile());
    assert.equal(aligned.activeSquare, 'ab');
    assert.equal(aligned.anchor.coordinate, 'M3-2');
    assert.equal(aligned.anchor.personalCodonProjection, 'codon_rotation_projection:personal:M3-2');
    assert.equal(aligned.strength, 1);

    const advanced = slot.deriveRecognitionViewModel(recognitionProfile({
        q_cosmic: [0, 1, 0, 0]
    }));
    assert.deepEqual(advanced.qComposed, [0, 1, 0, 0]);
    assert.equal(advanced.strength, 0);
});

test('Q_composed uses normalize(q_Nara · q_cosmic(t) · q_activity(t))', () => {
    const composed = slot.composeQComposed(
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    );

    assert.deepEqual(composed, [-1, 0, 0, 0]);
    assert.equal(slot.recognitionStrength(composed, [1, 0, 0, 0]), 1);
});

test('Möbius return readiness fires the close-path command only when close conditions land', () => {
    const pending = slot.deriveRecognitionViewModel(recognitionProfile());
    const ready = slot.deriveRecognitionViewModel(recognitionProfile({
        c_5_reflection_complete: true,
        session_close_requested: true,
        wisdom_delta_pending: true
    }));

    const fired = [];
    assert.equal(slot.fireMobiusReturnClosePath(pending.mobius, command => fired.push(command)), false);
    assert.deepEqual(fired, []);

    assert.equal(slot.fireMobiusReturnClosePath(ready.mobius, command => fired.push(command)), true);
    assert.deepEqual(fired, ['pratibimba.m5-epii.mobiusReturn.compose']);
    assert.equal(ready.mobius.ready, true);
    assert.equal(ready.mobius.message, 'Möbius return ready — wisdom_delta composing...');
    assert.deepEqual([...ready.mobius.crossLinks], ['26.13', '19.7']);
});
