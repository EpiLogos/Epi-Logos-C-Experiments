// 08.T9 — accessibility coverage enforcement.
//
// The canonical list of accessibility expectations lives in
// integrated-composition/lib/common/release-gate.js
// (INTEGRATED_ACCESSIBILITY_EXPECTATIONS). This suite proves:
//   1. Every required a11y dimension is enumerated.
//   2. Any single expectation reported false → release blocked + named.
//   3. The seven dimensions cover keyboard, command palette, screen-reader,
//      reduced-motion, non-audio, and non-color-only state — the handover
//      list verbatim.
//
// A puppeteer + axe-core browser harness against the running Theia ide-shell
// is the next layer of coverage; it depends on Track 05 T4 (ide-shell-m0-m5
// chrome) which is in-progress under Thread A. We name that as a named
// release-gate gap rather than ship a fake browser test.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    INTEGRATED_ACCESSIBILITY_EXPECTATIONS,
    INTEGRATED_PERFORMANCE_BUDGETS,
    PENDING_INTEGRATED_VIEW_STATE,
    EMPTY_WORKSPACE_SNAPSHOT,
    auditIntegratedReleaseGate
} = require('../../integrated-composition/lib/common/index.js');

const PLUGIN_ID = 'plugin-integrated-4-5-0';

const REQUIRED_DIMENSIONS = Object.freeze([
    'keyboardActivation',
    'commandPaletteDiscoverable',
    'screenReaderReadinessLabels',
    'screenReaderEvidenceLabels',
    'reducedMotionHonored',
    'nonAudioOperation',
    'noColorOnlyState'
]);

function fullPass() {
    const out = {};
    for (const dim of REQUIRED_DIMENSIONS) out[dim] = true;
    return Object.freeze(out);
}

function safePerf() {
    const out = {};
    for (const [k, v] of Object.entries(INTEGRATED_PERFORMANCE_BUDGETS[PLUGIN_ID])) {
        out[k] = v;
    }
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

function readyUpstream() {
    return Object.freeze({
        track01KernelBridge: 'ready',
        track02GraphPayloads: 'ready',
        track03GatewayStream: 'ready',
        track04S5Review: 'ready',
        track07IndividualExtensions: 'ready',
        namedAlphaBlockers: []
    });
}

function gateFor(accessibility) {
    return auditIntegratedReleaseGate({
        pluginId: PLUGIN_ID,
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 1,
            worldClockGeneration: 1,
            lastUpdatedAt: 1
        }),
        performance: safePerf(),
        accessibility,
        privacySurfaces: safePrivacy(),
        upstream: readyUpstream(),
        acceptanceScenariosPassed: true
    });
}

test('integrated accessibility expectations enumerate every required dimension', () => {
    assert.equal(Array.isArray(INTEGRATED_ACCESSIBILITY_EXPECTATIONS), true);
    for (const required of REQUIRED_DIMENSIONS) {
        assert.ok(
            INTEGRATED_ACCESSIBILITY_EXPECTATIONS.includes(required),
            `release gate must require ${required}`
        );
    }
    // Authority guard: this list is the canon. If it grows or shrinks, the
    // handover/spec should change too. Note this as a guarded surface.
    assert.equal(
        INTEGRATED_ACCESSIBILITY_EXPECTATIONS.length,
        REQUIRED_DIMENSIONS.length,
        'INTEGRATED_ACCESSIBILITY_EXPECTATIONS must stay aligned with the handover dimension list'
    );
});

test('full a11y pass routes release to production', () => {
    const report = gateFor(fullPass());
    assert.equal(report.releaseLevel, 'production');
    assert.deepEqual(report.accessibilityViolations, []);
});

test('any single a11y dimension failure blocks release and names the dimension', () => {
    for (const dim of REQUIRED_DIMENSIONS) {
        const a11y = { ...fullPass(), [dim]: false };
        const report = gateFor(a11y);
        assert.equal(
            report.releaseLevel,
            'blocked',
            `${dim}=false must block release`
        );
        assert.ok(
            report.accessibilityViolations.some(v => v.path === dim),
            `${dim}=false must surface as accessibilityViolations entry`
        );
    }
});
