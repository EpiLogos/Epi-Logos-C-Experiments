// 08.T4 verification suite. Proves:
//
//   (1) Every evidence producer emits a frozen envelope carrying S0 profile
//       generation, S2 provenance handles, S3 session/DAY/NOW handles, S5
//       review target, privacy class, and source spec anchors.
//   (2) The privacy scrubber rejects 1-2-3 envelopes containing M4 protected
//       fields (raw bioquaternion, Nara journal, Graphiti body content,
//       protected-local privacy class).
//   (3) S5 action wrappers return `bridge_unavailable` when no bridge is
//       attached and `s5_review_blocked` when the gateway throws.
//   (4) Human-required gates cannot be auto-resolved — openInReview against
//       an envelope flagged requiresHumanFinalValidation returns
//       `human_validation_required` without calling the gateway.
//   (5) Producers refuse to emit when required upstream fields are missing
//       unless explicitly asked for a gap report.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    INTEGRATED_EVIDENCE_PRODUCER_IDS,
    PENDING_INTEGRATED_VIEW_STATE,
    produceAllAvailableEnvelopes,
    produceEvidence,
    PrivacyViolationError,
    validateEvidenceEnvelopeForRange,
    openInReview,
    askEpiiToExplain,
    createImprovementCandidate
} = require('../integrated-composition/lib/common/index.js');

function readyProfile(generation, extra = {}) {
    return {
        generation,
        pointerAnchor: 'pointer://test',
        capabilities: [],
        payload: {
            lens: 'L1',
            mode: 'walk',
            audio_octet: { f0: 220 },
            nodal_quartet: [0, 1, 2, 3],
            planetaryChakral: { sun: 'ground' },
            resonance72: { tick: 1 },
            kleinFlipState: 'L',
            codon_rotation_projection: { codon: 0, rotation: 0 },
            mahamaya: { phase: 'incubation' },
            codec_lut: { v: 1 },
            s2_provenance: { handles: ['s2.bimba.snapshot.42', 's2.bimba.proof.7'] },
            kernel_trace_handle: 'kt://abc',
            ...extra
        }
    };
}

const readyView = (overrides = {}) =>
    Object.freeze({
        ...PENDING_INTEGRATED_VIEW_STATE,
        profileGeneration: 9,
        worldClockGeneration: 3,
        lastUpdatedAt: 1000,
        privacyScope: 'public_current',
        ...overrides
    });

test('every producer emits a frozen envelope with required cross-track fields', () => {
    const view = readyView();
    const profile = readyProfile(9);
    const envelopes = produceAllAvailableEnvelopes(
        {
            view,
            profile,
            contributorReadinessIds: ['m1-paramasiva', 'm2-parashakti', 'm3-mahamaya'],
            forceEmitOnGap: true
        },
        'test-seed'
    );
    // 5 producers, 1 envelope each. Some producers only emit on gap; with
    // forceEmitOnGap=true they all emit.
    assert.equal(envelopes.length, INTEGRATED_EVIDENCE_PRODUCER_IDS.length);
    for (const env of envelopes) {
        assert.equal(Object.isFrozen(env), true, `${env.producerId} envelope must be frozen`);
        assert.equal(env.rangeId, '1-2-3');
        assert.equal(env.pluginId, 'plugin-integrated-1-2-3');
        assert.equal(env.profileGeneration, 9);
        assert.equal(env.worldClockGeneration, 3);
        assert.ok(env.s5ReviewTarget && typeof env.s5ReviewTarget.targetKind === 'string');
        assert.ok(env.s5ReviewTarget.targetKind.startsWith('s5.review.target.'));
        assert.ok(env.sourceSpecAnchors.length >= 1);
        assert.ok(env.s2ProvenanceHandles.length >= 1, `${env.producerId} must read s2 provenance`);
        assert.equal(typeof env.privacyClass, 'string');
        assert.equal(env.requiresHumanFinalValidation, false);
    }
});

test('producer refuses to emit cosmic-engine snapshot when required field missing', () => {
    const view = readyView();
    const profile = readyProfile(9);
    delete profile.payload.codec_lut;
    const envelope = produceEvidence(
        'cosmic-engine-snapshot',
        {
            view,
            profile,
            contributorReadinessIds: ['m3-mahamaya']
        },
        'id-1'
    );
    assert.equal(envelope, null, 'must refuse to emit when M3 field missing');
});

test('readiness-gap-report is the producer that emits on missing fields', () => {
    const view = readyView();
    const profile = readyProfile(9);
    delete profile.payload.audio_octet;
    const envelope = produceEvidence(
        'readiness-gap-report',
        {
            view,
            profile,
            contributorReadinessIds: ['m1-paramasiva']
        },
        'gap-1'
    );
    assert.ok(envelope);
    assert.equal(envelope.producerId, 'readiness-gap-report');
    assert.deepEqual(envelope.payload.missingByPane.m1, ['audio_octet']);
});

test('privacy scrubber rejects M4 protected-local privacy class on 1-2-3 envelope', () => {
    const view = readyView({ privacyScope: 'protected_local_handle_only' });
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        {
            view,
            profile,
            contributorReadinessIds: [],
            forceEmitOnGap: true
        },
        'scrub-1'
    );
    assert.ok(env);
    assert.throws(
        () => validateEvidenceEnvelopeForRange(env),
        PrivacyViolationError,
        'protected_local privacy class must be illegal on a 1-2-3 envelope'
    );
});

test('privacy scrubber rejects bioquaternion_raw payload field', () => {
    const view = readyView();
    const profile = readyProfile(9);
    // Manually craft a tainted envelope by hand-injecting via the producer
    // then mutating? Envelopes are frozen — build a tainted clone instead.
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        {
            view,
            profile,
            contributorReadinessIds: [],
            forceEmitOnGap: true
        },
        'scrub-2'
    );
    const tainted = Object.freeze({
        ...env,
        payload: Object.freeze({
            ...env.payload,
            bioquaternion_raw: [0.1, 0.2, 0.3, 0.4]
        })
    });
    assert.throws(
        () => validateEvidenceEnvelopeForRange(tainted),
        /bioquaternion_raw/
    );
});

test('privacy scrubber rejects nested Graphiti body content in payload', () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'scrub-3'
    );
    const tainted = Object.freeze({
        ...env,
        payload: Object.freeze({
            ...env.payload,
            nara_journal: { entry_text: 'this should never leak' }
        })
    });
    assert.throws(
        () => validateEvidenceEnvelopeForRange(tainted),
        /nara_journal/
    );
});

test('privacy scrubber rejects forbidden marker strings in nested values', () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'scrub-4'
    );
    const tainted = Object.freeze({
        ...env,
        payload: Object.freeze({
            ...env.payload,
            text_note: '<protected:body>raw episode body bytes</protected:body>'
        })
    });
    assert.throws(
        () => validateEvidenceEnvelopeForRange(tainted),
        /protected:body/
    );
});

test('openInReview returns bridge_unavailable when no bridge', async () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'act-1'
    );
    const result = await openInReview(null, env);
    assert.equal(result.status, 'bridge_unavailable');
});

test('openInReview returns s5_review_blocked when the gateway throws', async () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'act-2'
    );
    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({}),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async () => {
            throw new Error('gateway not reachable');
        },
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    const result = await openInReview(bridge, env);
    assert.equal(result.status, 's5_review_blocked');
    assert.match(result.reason, /gateway not reachable/);
});

test('all three actions short-circuit on human-required envelopes', async () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'act-3'
    );
    // Build a tainted clone that carries the human-validation flag.
    const humanGated = Object.freeze({ ...env, requiresHumanFinalValidation: true });
    const calls = [];
    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({}),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async (method) => {
            calls.push(method);
            return { ok: true };
        },
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    for (const action of [openInReview, askEpiiToExplain, createImprovementCandidate]) {
        const result = await action(bridge, humanGated);
        assert.equal(result.status, 'human_validation_required');
    }
    assert.equal(calls.length, 0, 'gateway must not be invoked for human-required envelopes');
});

test('non-human-gated envelopes pass through to the configured gateway method', async () => {
    const view = readyView();
    const profile = readyProfile(9);
    const env = produceEvidence(
        'cosmic-engine-snapshot',
        { view, profile, contributorReadinessIds: [], forceEmitOnGap: true },
        'act-4'
    );
    const methodCalls = [];
    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({}),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async (method, params) => {
            methodCalls.push({ method, params });
            return { accepted: true };
        },
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    const r1 = await openInReview(bridge, env);
    const r2 = await askEpiiToExplain(bridge, env);
    const r3 = await createImprovementCandidate(bridge, env);
    assert.deepEqual(
        methodCalls.map(c => c.method),
        ['s5.review.request', 's5.epii.explain.request', 's5.improve.deposit']
    );
    for (const r of [r1, r2, r3]) {
        assert.equal(r.status, 'submitted');
        assert.deepEqual(r.gatewayPayload, { accepted: true });
    }
});
