import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    M0ModeToggle,
    buildM0AuthoringIntent
} = require('../m0-anuttara/lib/browser/components/mode-toggle.js');
const { buildM0InspectorModel } = require('../m0-anuttara/lib/common/m0-inspector.js');
const {
    SharedBridgeAdapter
} = require('../m-extension-runtime/lib/common/shared-bridge.js');
const {
    createMExtensionContributionRuntime
} = require('../m-extension-runtime/lib/common/contribution-contracts.js');
const {
    DEFAULT_M0_SURFACE_STATE,
    M0_SURFACE_STATE_SELECTOR_ID,
    deserializeM0SurfaceState,
    serializeM0SurfaceState
} = require('../m0-anuttara/lib/browser/state/m0-surface-state.js');

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready_public_current',
    reason: 'captured S2 graph payload available',
    profileGeneration: 12,
    bridgeReachable: true,
    blockerIds: []
});

const context = Object.freeze({
    selectedCoordinate: '#0',
    hashInput: '#0',
    canonicalMCoordinate: 'M0',
    profileGeneration: 12,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-01/session',
    privacyClass: 'public_current',
    provenance: {
        source: 'captured-s2-graph',
        generation: 12,
        notes: []
    }
});

const actions = Object.freeze([
    Object.freeze({
        id: 'open-language-development-route',
        label: 'Open language-development route',
        method: "s5'.improve.propose",
        params: Object.freeze({ coordinate: 'M0', mutatesGraphCanon: false }),
        mutatesGraphCanon: false
    }),
    Object.freeze({
        id: 'deposit-graph-readiness-evidence',
        label: 'Deposit graph readiness evidence',
        method: 's5.episodic.deposit',
        params: Object.freeze({ coordinate: 'M0', mutatesGraphCanon: false }),
        mutatesGraphCanon: false
    }),
    Object.freeze({
        id: 'request-anuttara-review',
        label: 'Request Anuttara review',
        method: "s5'.review.submit",
        params: Object.freeze({ coordinate: 'M0', mutatesGraphCanon: false }),
        mutatesGraphCanon: false
    })
]);

const M0_TEST_CONTRIBUTION = Object.freeze({ extensionId: 'm0-anuttara' });

function renderModeToggle(mode) {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(M0ModeToggle, {
            mode,
            coordinate: 'M0',
            actions,
            commands: { executeCommand: () => undefined },
            onModeChange: () => undefined
        })
    );
}

test('inspector model exposes reading and authoring surface modes', () => {
    const readingModel = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: { coordinate: 'M0' },
        profile: null,
        readiness,
        context
    });
    const authoringModel = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: { coordinate: 'M0' },
        profile: null,
        readiness,
        context,
        mode: 'authoring'
    });

    assert.equal(readingModel.mode, 'reading');
    assert.equal(authoringModel.mode, 'authoring');
});

test('reading mode renders only deposit evidence and switch affordance', () => {
    const markup = renderModeToggle('reading');

    assert.match(markup, /Deposit graph readiness evidence/);
    assert.match(markup, /Switch to Authoring/);
    assert.doesNotMatch(markup, /Open language-development route/);
    assert.doesNotMatch(markup, /Request Anuttara review/);
    assert.doesNotMatch(markup, /Open in Canon Studio/);
    assert.doesNotMatch(markup, /Open in Logos Atelier/);
    assert.doesNotMatch(markup, /Per DR-M0-1/);
});

test('authoring mode renders routed-write actions, deep links, and DR-M0-1 banner', () => {
    const markup = renderModeToggle('authoring');

    assert.match(markup, /Open language-development route/);
    assert.match(markup, /Deposit graph readiness evidence/);
    assert.match(markup, /Request Anuttara review/);
    assert.match(markup, /Open in Canon Studio/);
    assert.match(markup, /Open in Logos Atelier/);
    assert.match(markup, /data-contribution-id="canonStudio"/);
    assert.match(markup, /data-contribution-id="logosAtelier"/);
    assert.match(
        markup,
        /data-provenance-state="derived"[^>]*>Per DR-M0-1: M0&#x27; never mutates canon\. Routed-write via M5 atelier governance\./
    );
});

test('authoring deep-link intents route through the ide-shell M0-M5 contribution ids', () => {
    assert.deepEqual(buildM0AuthoringIntent('canonStudio', 'M0'), {
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'canonStudio',
        coordinate: 'M0',
        source: 'm0-anuttara'
    });
    assert.deepEqual(buildM0AuthoringIntent('logosAtelier', 'M0'), {
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'logosAtelier',
        coordinate: 'M0',
        source: 'm0-anuttara'
    });
});

test('M0 surface state serializes selector and acceptance-harness fields', () => {
    const serialized = serializeM0SurfaceState({
        activeLayer: 'relations',
        mode: 'authoring',
        implicateExplicate: 'explicate'
    });

    assert.deepEqual(serialized, {
        activeLayer: 'relations',
        implicateExplicate: 'explicate',
        mode: 'authoring',
        m0_active_layer: 'relations',
        m0_implicate_explicate: 'explicate',
        m0_mode: 'authoring'
    });
    assert.deepEqual(deserializeM0SurfaceState(serialized), {
        activeLayer: 'relations',
        mode: 'authoring',
        implicateExplicate: 'explicate'
    });
    assert.deepEqual(
        deserializeM0SurfaceState({ activeLayer: 'unknown', mode: 'bad' }),
        DEFAULT_M0_SURFACE_STATE
    );
});

test('daily-0-1 to ide-deep toggle preserves active M0 layer state through SharedBridgeAdapter', () => {
    const adapter = new SharedBridgeAdapter();
    const dailyRuntime = createMExtensionContributionRuntime(M0_TEST_CONTRIBUTION, adapter);
    const ideDeepRuntime = createMExtensionContributionRuntime(M0_TEST_CONTRIBUTION, adapter);

    adapter.updateCurrentStateSelectorPayload(
        M0_SURFACE_STATE_SELECTOR_ID,
        serializeM0SurfaceState({
            activeLayer: 'relations',
            mode: 'authoring',
            implicateExplicate: 'explicate'
        })
    );

    assert.equal(
        dailyRuntime.snapshot().currentStateSelectors[M0_SURFACE_STATE_SELECTOR_ID]
            .m0_active_layer,
        'relations'
    );
    const afterToggle = deserializeM0SurfaceState(
        ideDeepRuntime.snapshot().currentStateSelectors[M0_SURFACE_STATE_SELECTOR_ID]
    );
    assert.equal(afterToggle.activeLayer, 'relations');
    assert.equal(afterToggle.mode, 'authoring');
    assert.equal(afterToggle.implicateExplicate, 'explicate');
});

test('m0-anuttara source tree has no requestCanonMutation path', async () => {
    const root = fileURLToPath(new URL('../m0-anuttara/src/', import.meta.url));
    const source = await readSourceTree(root);

    assert.doesNotMatch(source, /requestCanonMutation/);
});

async function readSourceTree(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const chunks = [];
    for (const entry of entries) {
        const path = join(root, entry.name);
        if (entry.isDirectory()) {
            chunks.push(await readSourceTree(path));
        } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
            chunks.push(await readFile(path, 'utf8'));
        }
    }
    return chunks.join('\n');
}
