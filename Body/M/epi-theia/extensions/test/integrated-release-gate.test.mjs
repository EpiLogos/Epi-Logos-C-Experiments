// 08.T9 verification suite. Proves the release gate spans performance,
// accessibility, privacy surfaces, upstream readiness, and acceptance state
// instead of relying on one narrow evidence-envelope scrubber.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    EMPTY_WORKSPACE_SNAPSHOT,
    INTEGRATED_PERFORMANCE_BUDGETS,
    PENDING_INTEGRATED_VIEW_STATE,
    auditIntegratedReleaseGate
} = require('../integrated-composition/lib/common/index.js');

const accessible = Object.freeze({
    keyboardActivation: true,
    commandPaletteDiscoverable: true,
    screenReaderReadinessLabels: true,
    screenReaderEvidenceLabels: true,
    reducedMotionHonored: true,
    nonAudioOperation: true,
    noColorOnlyState: true
});

const upstreamReady = Object.freeze({
    track01KernelBridge: 'ready',
    track02GraphPayloads: 'ready',
    track03GatewayStream: 'ready',
    track04S5Review: 'ready',
    track07IndividualExtensions: 'ready',
    namedAlphaBlockers: []
});

function measurements(pluginId, overrides = {}) {
    const budgets = INTEGRATED_PERFORMANCE_BUDGETS[pluginId];
    const out = {};
    for (const [metric, budget] of Object.entries(budgets)) {
        if (budget > 0) {
            out[metric] = Math.max(1, budget - 1);
        }
    }
    return Object.freeze({ ...out, ...overrides });
}

function safeSurfaces() {
    return Object.freeze({
        uiState: Object.freeze({
            readinessLabel: 'ready from shared bridge',
            selectedCoordinate: 'M4.0',
            protectedArtifactHandles: ['nara://day/2026-06-01/artifact/a1']
        }),
        workspaceState: Object.freeze({
            ...EMPTY_WORKSPACE_SNAPSHOT,
            activePluginId: 'plugin-integrated-4-5-0',
            lastUpdatedAt: 1,
            extras: Object.freeze({
                selectedHandle: 'graphiti://episode/e1',
                readinessLabel: 'protected bodies remain behind consent gate'
            })
        }),
        evidenceEnvelopes: Object.freeze([
            Object.freeze({
                envelopeId: 'env-1',
                emittedAt: 1,
                producerId: 'cosmic-engine-snapshot',
                rangeId: '4-5-0',
                pluginId: 'plugin-integrated-4-5-0',
                profileGeneration: 7,
                worldClockGeneration: 3,
                s2ProvenanceHandles: ['s2://node/M4'],
                s3SessionHandle: 's3://session/1',
                s3DayNowHandle: 's3://day/2026-06-01',
                s5ReviewTarget: {
                    targetKind: 's5.review.target.routine',
                    targetId: 'review://item/1',
                    reason: 'fixture release audit'
                },
                privacyClass: 'protected_local_handle_only',
                sourceSpecAnchors: ['08-integrated-plugin-tracks.md#T9'],
                requiresHumanFinalValidation: false,
                payload: Object.freeze({
                    graphiti_handle: 'graphiti://episode/e1',
                    protectedBodiesRendered: false
                })
            })
        ]),
        observabilityEvents: Object.freeze([
            Object.freeze({
                kind: 'integrated.evidence-envelope-created',
                pluginId: 'plugin-integrated-4-5-0',
                emittedAt: 1,
                profileGeneration: 7,
                worldClockGeneration: 3,
                payload: Object.freeze({ envelopeId: 'env-1', protectedBodiesRendered: false })
            })
        ]),
        s3Rows: Object.freeze([
            Object.freeze({
                table: 'nara_artifact_handle',
                artifact_handle: 'nara://day/2026-06-01/artifact/a1',
                body_included: false
            })
        ]),
        s5Dtos: Object.freeze([
            Object.freeze({
                reviewItemHandle: 'review://item/1',
                protectedBodyHandles: ['nara://day/2026-06-01/artifact/a1'],
                protectedBodiesRendered: false
            })
        ])
    });
}

function gate(overrides = {}) {
    return auditIntegratedReleaseGate({
        pluginId: 'plugin-integrated-4-5-0',
        viewState: Object.freeze({
            ...PENDING_INTEGRATED_VIEW_STATE,
            profileGeneration: 7,
            worldClockGeneration: 3,
            lastUpdatedAt: 1
        }),
        performance: measurements('plugin-integrated-4-5-0'),
        accessibility: accessible,
        privacySurfaces: safeSurfaces(),
        upstream: upstreamReady,
        acceptanceScenariosPassed: true,
        ...overrides
    });
}

test('production release passes when privacy, performance, accessibility, upstream, and acceptance are clean', () => {
    const report = gate();
    assert.equal(report.releaseLevel, 'production');
    assert.deepEqual(report.blockers, []);
    assert.equal(report.requestedAtProfileGeneration, 7);
});

test('privacy audit spans UI, workspace, evidence, observability, S3 rows, and S5 DTOs', () => {
    const surfaces = safeSurfaces();
    const report = gate({
        privacySurfaces: Object.freeze({
            ...surfaces,
            uiState: { q_b: [1, 2, 3, 4] },
            workspaceState: { extras: { journal_body: 'not public' } },
            evidenceEnvelopes: [{ payload: { oracle_interpretation_body: 'not public' } }],
            observabilityEvents: [{ payload: { graphiti_body: 'not public' } }],
            s3Rows: [{ raw_graphiti_episode_body: 'raw graphiti episode body' }],
            s5Dtos: [{ protected_natal_data: { birth_time: '00:00' } }]
        })
    });
    assert.equal(report.releaseLevel, 'blocked');
    assert.equal(report.privacyViolations.length >= 6, true);
    assert.match(report.privacyViolations.map(v => v.path).join('\n'), /uiState\.q_b/);
    assert.match(report.privacyViolations.map(v => v.path).join('\n'), /workspaceState\.extras\.journal_body/);
    assert.match(report.privacyViolations.map(v => v.path).join('\n'), /s5Dtos\[0\]\.protected_natal_data/);
});

test('performance and accessibility violations block release', () => {
    const report = gate({
        performance: measurements('plugin-integrated-4-5-0', {
            profileUpdatePropagationMs: 999
        }),
        accessibility: { ...accessible, keyboardActivation: false }
    });
    assert.equal(report.releaseLevel, 'blocked');
    assert.deepEqual(report.performanceViolations.map(v => v.path), ['profileUpdatePropagationMs']);
    assert.deepEqual(report.accessibilityViolations.map(v => v.path), ['keyboardActivation']);
});

test('named upstream blockers allow only degraded alpha when acceptance is not passing', () => {
    const report = gate({
        acceptanceScenariosPassed: false,
        upstream: Object.freeze({
            ...upstreamReady,
            track03GatewayStream: 'degraded',
            namedAlphaBlockers: ['Track 03 gateway live stream running in captured-local harness only']
        })
    });
    assert.equal(report.releaseLevel, 'alpha');
    assert.match(report.blockers.join('\n'), /acceptanceScenariosPassed/);
    assert.match(report.blockers.join('\n'), /track03GatewayStream/);
});

test('missing acceptance with unnamed blockers remains blocked', () => {
    const report = gate({ acceptanceScenariosPassed: false });
    assert.equal(report.releaseLevel, 'blocked');
});
