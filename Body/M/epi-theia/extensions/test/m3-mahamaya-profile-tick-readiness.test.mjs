import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() {
            return undefined;
        }
        removeAttribute() {
            return undefined;
        }
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        documentElement: new globalThis.Element(),
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => [],
        queryCommandSupported: () => false
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
try {
    const { FrontendApplicationConfigProvider } = require('@theia/core/lib/browser/frontend-application-config-provider');
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya profile tick node test' });
} catch (err) {
    if (!String(err?.message ?? err).includes('already set')) {
        throw err;
    }
}

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    subscribeM3ProfileTick,
    profileTickFromProfile
} = require('../m3-mahamaya/lib/browser/context/M3ProfileTickContext.js');
const {
    M3ReadinessProvider,
    readinessStateForBinding
} = require('../m3-mahamaya/lib/browser/context/M3ReadinessContext.js');
const {
    ReadinessChip
} = require('../m3-mahamaya/lib/browser/components/ReadinessChip.js');

const M3_BROWSER_SOURCE_DIR =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser';
const COMPONENT_SOURCE_DIR = join(M3_BROWSER_SOURCE_DIR, 'components');
const PROFILE_TICK_CONTEXT_SOURCE = join(M3_BROWSER_SOURCE_DIR, 'context/M3ProfileTickContext.tsx');

test('profile tick subscription broadcasts tick and degree720 on profile advance', () => {
    const bridge = inMemoryBridge();
    const snapshots = [];
    const sub = subscribeM3ProfileTick(bridge, snapshot => snapshots.push(snapshot));

    bridge.emit(profile(8, 5, 300));
    bridge.emit(profile(9, 6, 360));
    sub.dispose();
    bridge.emit(profile(10, 7, 420));

    assert.deepEqual(snapshots.at(-1), {
        generation: 9,
        tick: 6,
        degree720: 360,
        fibonacciGround: null
    });
    assert.equal(snapshots.length, 3);
    assert.deepEqual(profileTickFromProfile(profile(3, 2, 120)), {
        generation: 3,
        tick: 2,
        degree720: 120,
        fibonacciGround: null
    });
});

test('readiness chip renders inline pending badge and blocked overlay for datum binding', () => {
    const surface = Object.freeze({
        pendingFields: Object.freeze(['profile.mahamayaLensStack.activeLensId']),
        readiness: Object.freeze({
            state: 'authority_payload_missing',
            surfaceReady: false,
            blockers: Object.freeze(['profile.mahamayaLensStack.activeLensId blocked by profile_missing_field'])
        })
    });
    const snapshot = Object.freeze({
        fetchedAt: 1,
        state: 'authority_payload_missing',
        reason: 'profile_missing_field',
        profileGeneration: 23,
        bridgeReachable: true,
        blockerIds: Object.freeze(['profile.mahamayaLensStack.activeLensId'])
    });
    const context = Object.freeze({
        snapshot,
        surfaceReadiness: surface.readiness,
        pendingFields: surface.pendingFields,
        blockers: surface.readiness.blockers
    });

    assert.equal(readinessStateForBinding(context, 'profile.mahamayaLensStack.activeLensId'), 'blocked');

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface, readiness: snapshot },
            React.createElement(
                ReadinessChip,
                { bindingKey: 'profile.mahamayaLensStack.activeLensId' },
                'active lens'
            )
        )
    );

    assert.match(html, /data-readiness-binding="profile\.mahamayaLensStack\.activeLensId"/);
    assert.match(html, /data-readiness-state="blocked"/);
    assert.match(html, /data-pending-badge="true"|data-pending-badge=""/);
    assert.match(html, /data-blocked-overlay="true"|data-blocked-overlay=""/);
    assert.match(html, /active lens/);
});

test('every M3 Wave-C browser widget consumes tick and readiness contexts', () => {
    const missing = componentFiles()
        .filter(file => !file.endsWith('ReadinessChip.tsx'))
        .filter(file => {
            const source = readFileSync(file, 'utf8');
            return !source.includes('useM3ProfileTick') || !source.includes('useM3Readiness');
        })
        .map(file => file.replace(`${COMPONENT_SOURCE_DIR}/`, ''));

    assert.deepEqual(missing, []);
});

test('M3 browser source has no internal timer or RAF clock outside the controlled tick context', () => {
    const violations = sourceFiles(M3_BROWSER_SOURCE_DIR)
        .filter(file => file !== PROFILE_TICK_CONTEXT_SOURCE)
        .flatMap(file => {
            const source = readFileSync(file, 'utf8');
            const matches = source.match(/setInterval|requestAnimationFrame/g) ?? [];
            return matches.map(match => `${file.replace(`${M3_BROWSER_SOURCE_DIR}/`, '')}:${match}`);
        });

    assert.deepEqual(violations, []);
});

function profile(generation, tick, degree720) {
    return Object.freeze({
        generation,
        pointerAnchor: `profile:${generation}`,
        capabilities: Object.freeze(['profile.public-current']),
        payload: Object.freeze({ tick, degree720 })
    });
}

function inMemoryBridge() {
    const listeners = new Set();
    return {
        onProfile(listener) {
            listeners.add(listener);
            listener(null);
            return { dispose: () => listeners.delete(listener) };
        },
        emit(next) {
            for (const listener of listeners) {
                listener(next);
            }
        }
    };
}

function componentFiles() {
    return sourceFiles(COMPONENT_SOURCE_DIR).filter(file => file.endsWith('.tsx'));
}

function sourceFiles(root) {
    return readdirSync(root)
        .flatMap(entry => {
            const absolute = join(root, entry);
            const stat = statSync(absolute);
            return stat.isDirectory() ? sourceFiles(absolute) : [absolute];
        })
        .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
}
