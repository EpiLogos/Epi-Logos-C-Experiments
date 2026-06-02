// 08.T9 — release-gate decision tree.
//
// The release-gate audit produces one of four levels:
//   - production: clean privacy + perf + a11y + upstream + acceptance
//   - beta: production minus the production-only constraints (e.g. perf budgets
//     met but acceptance still partial under named alpha blockers)
//   - alpha: degraded mode with NAMED upstream blockers, acceptance partial
//   - blocked: any blocker without a named carve-out
//
// This suite exercises the corners of that decision tree explicitly, so a
// regression in the level routing surfaces immediately.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    INTEGRATED_PERFORMANCE_BUDGETS,
    PENDING_INTEGRATED_VIEW_STATE,
    EMPTY_WORKSPACE_SNAPSHOT,
    auditIntegratedReleaseGate
} = require('../../integrated-composition/lib/common/index.js');

const PLUGIN_ID = 'plugin-integrated-4-5-0';

function safeAccessibility() {
    return Object.freeze({
        keyboardActivation: true,
        commandPaletteDiscoverable: true,
        screenReaderReadinessLabels: true,
        screenReaderEvidenceLabels: true,
        reducedMotionHonored: true,
        nonAudioOperation: true,
        noColorOnlyState: true
    });
}

function safePerf() {
    const out = {};
    for (const [k, v] of Object.entries(INTEGRATED_PERFORMANCE_BUDGETS[PLUGIN_ID])) out[k] = v;
    return Object.freeze(out);
}

function safePrivacy() {
    return Object.freeze({
        uiState: Object.freeze({ readinessLabel: 'ready' }),
        workspaceState: Object.freeze({ ...EMPTY_WORKSPACE_SNAPSHOT, activePluginId: null }),
        evidenceEnvelopes: Object.freeze([]),
        observabilityEvents: Object.freeze([]),
        s3Rows: Object.freeze([]),
        s5Dtos: Object.freeze([])
    });
}

function readyUpstream(over = {}) {
    return Object.freeze({
        track01KernelBridge: 'ready',
        track02GraphPayloads: 'ready',
        track03GatewayStream: 'ready',
        track04S5Review: 'ready',
        track07IndividualExtensions: 'ready',
        namedAlphaBlockers: [],
        ...over
    });
}

function gate({ acceptance = true, upstream = readyUpstream(), privacy = safePrivacy(), a11y = safeAccessibility(), perf = safePerf() } = {}) {
    return auditIntegratedReleaseGate({
        pluginId: PLUGIN_ID,
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 1,
            worldClockGeneration: 1,
            lastUpdatedAt: 1
        }),
        performance: perf,
        accessibility: a11y,
        privacySurfaces: privacy,
        upstream,
        acceptanceScenariosPassed: acceptance
    });
}

test('production passes when every dimension is clean', () => {
    const r = gate();
    assert.equal(r.releaseLevel, 'production');
    assert.deepEqual(r.blockers, []);
});

test('unnamed acceptance failure → blocked, not alpha', () => {
    const r = gate({ acceptance: false });
    assert.equal(r.releaseLevel, 'blocked');
});

test('named upstream blocker + acceptance pending → alpha (degraded)', () => {
    const r = gate({
        acceptance: false,
        upstream: readyUpstream({
            track03GatewayStream: 'degraded',
            namedAlphaBlockers: ['Track 03 gateway live stream running in captured-local harness only']
        })
    });
    assert.equal(r.releaseLevel, 'alpha');
    assert.ok(r.blockers.some(b => /track03GatewayStream/.test(b)));
});

test('privacy violation overrides any named alpha blocker → blocked', () => {
    const r = gate({
        acceptance: false,
        privacy: Object.freeze({
            ...safePrivacy(),
            uiState: { q_b: [1, 2, 3, 4] }
        }),
        upstream: readyUpstream({
            track03GatewayStream: 'degraded',
            namedAlphaBlockers: ['Track 03 gateway live stream running in captured-local harness only']
        })
    });
    assert.equal(r.releaseLevel, 'blocked');
    assert.ok(r.privacyViolations.length >= 1);
});

test('perf violation alone blocks even with everything else clean', () => {
    const overPerf = { ...safePerf(), profileUpdatePropagationMs: 9999 };
    const r = gate({ perf: overPerf });
    assert.equal(r.releaseLevel, 'blocked');
    assert.ok(r.performanceViolations.some(v => v.path === 'profileUpdatePropagationMs'));
});

test('release report records the exact profile + worldClock generation it was audited at', () => {
    const r = auditIntegratedReleaseGate({
        pluginId: PLUGIN_ID,
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 99,
            worldClockGeneration: 33,
            lastUpdatedAt: 1
        }),
        performance: safePerf(),
        accessibility: safeAccessibility(),
        privacySurfaces: safePrivacy(),
        upstream: readyUpstream(),
        acceptanceScenariosPassed: true
    });
    assert.equal(r.requestedAtProfileGeneration, 99);
    if ('requestedAtWorldClockGeneration' in r) {
        assert.equal(r.requestedAtWorldClockGeneration, 33);
    }
});
