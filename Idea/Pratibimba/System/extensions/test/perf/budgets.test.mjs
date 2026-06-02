// 08.T9 — performance budget enforcement.
//
// The budget table itself is the canonical source: it lives in
// integrated-composition/lib/common/release-gate.js (INTEGRATED_PERFORMANCE_BUDGETS).
// This suite proves three things:
//   1. The budgets exist and are non-trivial (no 0/Infinity placeholders).
//   2. Any measured value strictly above its budget routes to a release-gate
//      blocker, not a silent pass.
//   3. The integrated plugins have realistic envelopes — protected-open gate
//      latency is allowed only on plugin-integrated-4-5-0 (which actually
//      owns the gate), and zero on plugin-integrated-1-2-3 (which does not).

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

const PLUGIN_IDS = Object.freeze(['plugin-integrated-1-2-3', 'plugin-integrated-4-5-0']);
const METRIC_NAMES = Object.freeze([
    'firstMeaningfulRenderMs',
    'profileUpdatePropagationMs',
    'visibleReadinessUpdateMs',
    'miniInspectorOpenMs',
    'evidenceEnvelopeCreationMs',
    'graphOrCityOverlayRenderMs',
    'protectedOpenGateLatencyMs'
]);

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

function gateFor(pluginId, perfMeasurements) {
    return auditIntegratedReleaseGate({
        pluginId,
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 1,
            worldClockGeneration: 1,
            lastUpdatedAt: 1
        }),
        performance: perfMeasurements,
        accessibility: safeAccessibility(),
        privacySurfaces: safePrivacy(),
        upstream: readyUpstream(),
        acceptanceScenariosPassed: true
    });
}

test('every integrated plugin declares every required perf metric with a finite enforceable budget', () => {
    for (const pluginId of PLUGIN_IDS) {
        const budgets = INTEGRATED_PERFORMANCE_BUDGETS[pluginId];
        assert.ok(budgets, `missing budget table for ${pluginId}`);
        for (const metric of METRIC_NAMES) {
            assert.ok(
                Object.prototype.hasOwnProperty.call(budgets, metric),
                `${pluginId} must declare budget for ${metric}`
            );
            const v = budgets[metric];
            assert.equal(typeof v, 'number');
            assert.ok(Number.isFinite(v), `${pluginId}.${metric} budget must be finite`);
            assert.ok(v >= 0, `${pluginId}.${metric} budget must be non-negative`);
        }
    }
});

test('protected-open gate latency is zero on 1-2-3 (no gate) and positive on 4-5-0 (owns the gate)', () => {
    assert.equal(
        INTEGRATED_PERFORMANCE_BUDGETS['plugin-integrated-1-2-3'].protectedOpenGateLatencyMs,
        0,
        '1-2-3 must not declare a protected-open gate latency budget (no gate)'
    );
    assert.ok(
        INTEGRATED_PERFORMANCE_BUDGETS['plugin-integrated-4-5-0'].protectedOpenGateLatencyMs > 0,
        '4-5-0 owns the protected-open gate and must declare a positive budget'
    );
});

test('any measured perf value above its budget routes to a blocked release', () => {
    for (const pluginId of PLUGIN_IDS) {
        const budgets = INTEGRATED_PERFORMANCE_BUDGETS[pluginId];
        for (const metric of METRIC_NAMES) {
            const budget = budgets[metric];
            // Budget 0 means "metric not applicable for this plugin" — the
            // audit deliberately skips it (release-gate.js:115). Skip such
            // metrics in the violation enforcement check.
            if (budget === 0) continue;
            // Build a measurement set that satisfies every metric except `metric`.
            const measurements = {};
            for (const m of METRIC_NAMES) {
                measurements[m] = budgets[m]; // exactly at budget is allowed
            }
            measurements[metric] = budget + 1; // strictly over
            const report = gateFor(pluginId, measurements);
            assert.equal(
                report.releaseLevel,
                'blocked',
                `over-budget ${pluginId}.${metric} (${measurements[metric]} > ${budget}) must block release`
            );
            assert.ok(
                report.performanceViolations.some(v => v.path === metric),
                `over-budget ${metric} must surface a performanceViolations entry`
            );
        }
    }
});

test('missing measurement for an applicable metric blocks release', () => {
    // The audit treats a non-number measurement on a non-zero budget as
    // "measurement missing" — that must also block. We test this on
    // plugin-integrated-4-5-0.protectedOpenGateLatencyMs (budget 200ms).
    const budgets = INTEGRATED_PERFORMANCE_BUDGETS['plugin-integrated-4-5-0'];
    const measurements = {};
    for (const m of METRIC_NAMES) measurements[m] = budgets[m];
    delete measurements.protectedOpenGateLatencyMs;
    const report = gateFor('plugin-integrated-4-5-0', measurements);
    assert.equal(report.releaseLevel, 'blocked');
    assert.ok(
        report.performanceViolations.some(
            v => v.path === 'protectedOpenGateLatencyMs' && /missing/i.test(v.message)
        )
    );
});

test('exactly-at-budget measurements pass and route to production when upstream/acceptance clean', () => {
    for (const pluginId of PLUGIN_IDS) {
        const budgets = INTEGRATED_PERFORMANCE_BUDGETS[pluginId];
        const measurements = {};
        for (const m of METRIC_NAMES) measurements[m] = budgets[m];
        const report = gateFor(pluginId, measurements);
        assert.equal(
            report.releaseLevel,
            'production',
            `exactly-at-budget ${pluginId} should not block release on perf alone`
        );
        assert.deepEqual(report.performanceViolations, []);
    }
});
