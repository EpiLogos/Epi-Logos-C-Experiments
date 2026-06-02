// 08.T9 — privacy audit forbidden-field enforcement.
//
// The handover lists the complete forbidden-field surface for the production
// release gate:
//   - raw q_b / q_p (binary/private quaternion)
//   - protected natal data (birth_date, birth_time, birth_place, natal_chart)
//   - journal bodies (journal_body, journal_text, etc.)
//   - dream text
//   - oracle interpretation bodies
//   - raw Graphiti episode bodies
//   - private identity data
//
// This suite proves that EVERY forbidden field, in EVERY surface (UI state,
// workspace persistence, evidence envelopes, observability events, S3 rows,
// S5 DTOs), routes to a release-blocking privacyViolation. It is the
// machine-checked encoding of the handover rule: "Privacy scan must FAIL THE
// BUILD on any forbidden-field finding, not just warn."

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
const SURFACES = Object.freeze([
    'uiState',
    'workspaceState',
    'evidenceEnvelopes',
    'observabilityEvents',
    's3Rows',
    's5Dtos'
]);

const FORBIDDEN_KEYS = Object.freeze([
    // Quaternionic identity
    'q_b',
    'q_p',
    // Protected natal data
    'birth_date',
    'birth_time',
    'birth_place',
    'natal_chart',
    'protected_natal_data',
    // Personal bodies
    'journal_body',
    'journal_text',
    'dream_body',
    'dream_text',
    'oracle_interpretation_body',
    'oracle_body',
    // Raw graph artifacts
    'graphiti_body',
    'graphiti_episode_body',
    // Identity
    'identity_raw',
    'identity_private',
    'private_identity_data'
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

function safePerf() {
    const out = {};
    for (const [k, v] of Object.entries(INTEGRATED_PERFORMANCE_BUDGETS[PLUGIN_ID])) out[k] = v;
    return Object.freeze(out);
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

function cleanSurfaces() {
    return Object.freeze({
        uiState: Object.freeze({ readinessLabel: 'ready' }),
        workspaceState: Object.freeze({ ...EMPTY_WORKSPACE_SNAPSHOT, activePluginId: null }),
        evidenceEnvelopes: Object.freeze([]),
        observabilityEvents: Object.freeze([]),
        s3Rows: Object.freeze([]),
        s5Dtos: Object.freeze([])
    });
}

function withForbidden(surface, key) {
    const surfaces = { ...cleanSurfaces() };
    const dirty = { [key]: 'leaked-value' };
    switch (surface) {
        case 'uiState':
            surfaces.uiState = dirty;
            break;
        case 'workspaceState':
            surfaces.workspaceState = { extras: dirty };
            break;
        case 'evidenceEnvelopes':
            surfaces.evidenceEnvelopes = [{ payload: dirty }];
            break;
        case 'observabilityEvents':
            surfaces.observabilityEvents = [{ payload: dirty }];
            break;
        case 's3Rows':
            surfaces.s3Rows = [dirty];
            break;
        case 's5Dtos':
            surfaces.s5Dtos = [dirty];
            break;
    }
    return Object.freeze(surfaces);
}

function gateFor(privacySurfaces) {
    return auditIntegratedReleaseGate({
        pluginId: PLUGIN_ID,
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 1,
            worldClockGeneration: 1,
            lastUpdatedAt: 1
        }),
        performance: safePerf(),
        accessibility: safeAccessibility(),
        privacySurfaces,
        upstream: readyUpstream(),
        acceptanceScenariosPassed: true
    });
}

test('clean surfaces (no forbidden fields) route to production', () => {
    const report = gateFor(cleanSurfaces());
    assert.equal(report.releaseLevel, 'production');
    assert.deepEqual(report.privacyViolations, []);
});

test('every forbidden key in every surface blocks release with a named violation', () => {
    let totalChecks = 0;
    let totalBlocked = 0;
    const missed = [];
    for (const surface of SURFACES) {
        for (const key of FORBIDDEN_KEYS) {
            totalChecks++;
            const report = gateFor(withForbidden(surface, key));
            if (report.releaseLevel === 'blocked' &&
                report.privacyViolations.length >= 1 &&
                report.privacyViolations.some(v => v.surface === surface || v.path.includes(key))) {
                totalBlocked++;
            } else {
                missed.push({
                    surface,
                    key,
                    releaseLevel: report.releaseLevel,
                    violations: report.privacyViolations.length
                });
            }
        }
    }
    assert.equal(
        missed.length,
        0,
        `${missed.length}/${totalChecks} forbidden-field placements did not block: ${JSON.stringify(missed.slice(0, 5))}`
    );
    assert.equal(totalBlocked, totalChecks);
});

test('forbidden-value patterns (protected: body literals) also block release', () => {
    const dirty = cleanSurfaces();
    const report = gateFor({
        ...dirty,
        evidenceEnvelopes: [{ payload: { note: '<protected:body>still leaked</protected:body>' } }]
    });
    assert.equal(report.releaseLevel, 'blocked');
    assert.ok(report.privacyViolations.length >= 1);
});
