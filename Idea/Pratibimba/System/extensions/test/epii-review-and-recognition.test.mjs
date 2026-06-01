// 08.T6 verification suite. Proves:
//
//   (1) Recognition-claim evidence cannot be created without privacy
//       boundary, M4 protected source handle, BEDROCK link, activity
//       traces, S2/S3 handles, and S5 target route.
//   (2) Protected evidence can be deferred or summarized by agents but
//       cannot be approved/rejected/revised/promoted when human-required
//       gates apply.
//   (3) Graphiti memory is never treated as canonical S2 topology by the
//       integrated plugin — envelopes with sourceClass='graphiti-memory'
//       cannot target s5.review.target.canon or claim canonical S2 status.
//   (4) The five Epii actions exist with the correct gateway method names
//       and short-circuit on bridge_unavailable / human_validation_required.
//   (5) Epii review panel state defaults to closed and only transitions on
//       explicit action or inbox-count growth.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    AGENT_AUTO_DISPOSITIONS_ALLOWED_FOR_HUMAN_GATE,
    ALL_EPII_ACTIONS,
    AgentDispositionEnumExportSentinel,
    CLOSED_EPII_REVIEW_STATE,
    GraphitiNotCanonicalError,
    HumanRequiredDispositionError,
    JivaSivaRecognitionMissingFieldError,
    assertNotCanonicalS2Source,
    buildJivaSivaRecognitionClaim,
    depositProtectedEvidence,
    dryRunCanonPromotion,
    enforceAgentDispositionLimit,
    epiiActionMethodName,
    openEpiiContinuity,
    recognitionClaimToEnvelope,
    requestAnimaConsentReview,
    reviewRecognitionClaim,
    withPanelMode,
    withReviewInboxCount
} = require('../integrated-composition/lib/common/index.js');

const FULL_CLAIM_INPUT = Object.freeze({
    claimId: 'claim-1',
    emittedAt: 100,
    privacyBoundary: 'protected_local_handle_only',
    m4ProtectedSourceHandle: 'm4://protected.handle.alpha',
    bedrockLinkHandle: 'bedrock://anchor.42',
    activityResonanceTraces: ['ar://trace.1', 'ar://trace.2'],
    s2EvidenceHandles: ['s2.bimba.handle.7'],
    s3SessionHandle: 's3.session.alpha',
    s3DayNowHandle: 's3.day.now.alpha',
    s5TargetRoute: {
        targetKind: 's5.review.target.routine',
        targetId: 's5.review.routine.jiva-recognition',
        reason: 'fixture'
    },
    sourceClass: 'm4-protected',
    sourceSpecAnchors: ["Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md#canon-recognition"],
    readiness: 'degraded_but_readable',
    notes: 'fixture'
});

// ---- Recognition claim required fields (verification 1) ----------------

test('full input builds a frozen recognition claim with required fields', () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    assert.equal(Object.isFrozen(claim), true);
    assert.equal(claim.claimId, 'claim-1');
    assert.equal(claim.m4ProtectedSourceHandle, 'm4://protected.handle.alpha');
    assert.equal(claim.activityResonanceTraces.length, 2);
});

const REQUIRED_FIELDS = [
    'privacyBoundary',
    'm4ProtectedSourceHandle',
    'bedrockLinkHandle',
    'activityResonanceTraces',
    's2EvidenceHandles',
    's3SessionHandle',
    's3DayNowHandle',
    's5TargetRoute',
    'sourceClass',
    'sourceSpecAnchors'
];

for (const field of REQUIRED_FIELDS) {
    test(`claim builder rejects missing ${field}`, () => {
        const input = { ...FULL_CLAIM_INPUT };
        if (Array.isArray(input[field])) {
            input[field] = [];
        } else {
            delete input[field];
        }
        assert.throws(
            () => buildJivaSivaRecognitionClaim(input),
            JivaSivaRecognitionMissingFieldError,
            `must throw for missing ${field}`
        );
    });
}

test('claim → envelope keeps required cross-track fields and flags human gate', () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    const env = recognitionClaimToEnvelope(claim, 'cosmic-engine-snapshot', 9, 3);
    assert.equal(env.rangeId, '4-5-0');
    assert.equal(env.pluginId, 'plugin-integrated-4-5-0');
    assert.equal(env.requiresHumanFinalValidation, true);
    assert.deepEqual([...env.s2ProvenanceHandles], ['s2.bimba.handle.7']);
    assert.equal(env.s3SessionHandle, 's3.session.alpha');
    assert.equal(env.payload.recognitionSourceClass, 'm4-protected');
    assert.equal(Object.isFrozen(env), true);
});

// ---- Agent disposition guard (verification 2) --------------------------

test('AGENT_AUTO_DISPOSITIONS_ALLOWED_FOR_HUMAN_GATE is exactly defer + summarize', () => {
    assert.deepEqual(
        [...AGENT_AUTO_DISPOSITIONS_ALLOWED_FOR_HUMAN_GATE].sort(),
        ['defer', 'summarize']
    );
});

test('enforceAgentDispositionLimit permits defer + summarize on human-required envelope', () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    const env = recognitionClaimToEnvelope(claim, 'cosmic-engine-snapshot', 9, 3);
    assert.doesNotThrow(() => enforceAgentDispositionLimit(env, 'defer'));
    assert.doesNotThrow(() => enforceAgentDispositionLimit(env, 'summarize'));
});

test('enforceAgentDispositionLimit blocks approve/reject/revise/promote on human gate', () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    const env = recognitionClaimToEnvelope(claim, 'cosmic-engine-snapshot', 9, 3);
    for (const bad of ['approve', 'reject', 'revise', 'promote']) {
        assert.throws(
            () => enforceAgentDispositionLimit(env, bad),
            HumanRequiredDispositionError,
            `must reject "${bad}" on human-required envelope`
        );
    }
});

test('enforceAgentDispositionLimit allows every disposition when envelope is not human-required', () => {
    const env = Object.freeze({
        envelopeId: 'env-non-human',
        emittedAt: 1,
        producerId: 'cosmic-engine-snapshot',
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration: 1,
        worldClockGeneration: 1,
        s2ProvenanceHandles: ['h1'],
        s3SessionHandle: null,
        s3DayNowHandle: null,
        s5ReviewTarget: {
            targetKind: 's5.review.target.routine',
            targetId: 's5.review.routine.fixture',
            reason: 'fixture'
        },
        privacyClass: 'public_current',
        sourceSpecAnchors: ['anchor1'],
        requiresHumanFinalValidation: false,
        payload: Object.freeze({})
    });
    for (const d of ['defer', 'summarize', 'approve', 'reject', 'revise', 'promote']) {
        assert.doesNotThrow(() => enforceAgentDispositionLimit(env, d));
    }
});

// ---- Graphiti source guard (verification 3) ----------------------------

function graphitiEnvelope(payloadExtra = {}, targetKindOverride = null) {
    return Object.freeze({
        envelopeId: 'env-graphiti',
        emittedAt: 1,
        producerId: 'cosmic-engine-snapshot',
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration: 1,
        worldClockGeneration: 1,
        s2ProvenanceHandles: ['h1'],
        s3SessionHandle: 's1',
        s3DayNowHandle: 'd1',
        s5ReviewTarget: {
            targetKind: targetKindOverride ?? 's5.review.target.routine',
            targetId: 's5.review.routine.fixture',
            reason: 'fixture'
        },
        privacyClass: 'protected_local_handle_only',
        sourceSpecAnchors: ['anchor1'],
        requiresHumanFinalValidation: true,
        payload: Object.freeze({
            recognitionSourceClass: 'graphiti-memory',
            ...payloadExtra
        })
    });
}

test('graphiti-memory envelope cannot target s5.review.target.canon', () => {
    const env = graphitiEnvelope({}, 's5.review.target.canon');
    assert.throws(
        () => assertNotCanonicalS2Source(env),
        GraphitiNotCanonicalError
    );
});

test('graphiti-memory envelope cannot claim canonical S2 in payload', () => {
    for (const tag of ['isCanonical', 's2Canonical', 'canonicalS2']) {
        const env = graphitiEnvelope({ [tag]: true });
        assert.throws(
            () => assertNotCanonicalS2Source(env),
            GraphitiNotCanonicalError,
            `must reject ${tag} on graphiti-memory envelope`
        );
    }
});

test('graphiti-memory envelope cannot carry registered S2 relationship type', () => {
    const env = graphitiEnvelope({ registeredRelationshipType: 'BIMBA_OWNS' });
    assert.throws(() => assertNotCanonicalS2Source(env), GraphitiNotCanonicalError);
});

test('m4-protected envelope passes the graphiti guard', () => {
    const env = graphitiEnvelope({});
    const safeEnv = Object.freeze({
        ...env,
        payload: Object.freeze({ ...env.payload, recognitionSourceClass: 'm4-protected' })
    });
    assert.doesNotThrow(() => assertNotCanonicalS2Source(safeEnv));
});

// ---- Epii action wrappers (deliverable 1) ------------------------------

test('Epii action method names map to canonical s5.* gateway methods', () => {
    assert.equal(epiiActionMethodName('reviewRecognitionClaim'), 's5.review.recognition_claim.request');
    assert.equal(epiiActionMethodName('depositProtectedEvidence'), 's5.evidence.deposit.protected');
    assert.equal(epiiActionMethodName('requestAnimaConsentReview'), 's5.consent.review.request');
    assert.equal(epiiActionMethodName('openEpiiContinuity'), 's5.continuity.open');
    assert.equal(epiiActionMethodName('dryRunCanonPromotion'), 's5.improve.canon.dry_run');
    assert.equal(ALL_EPII_ACTIONS.length, 5);
});

test('Epii action returns bridge_unavailable when bridge null', async () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    const env = recognitionClaimToEnvelope(claim, 'cosmic-engine-snapshot', 9, 3);
    for (const action of [
        reviewRecognitionClaim,
        depositProtectedEvidence,
        requestAnimaConsentReview,
        openEpiiContinuity,
        dryRunCanonPromotion
    ]) {
        const r = await action(null, env);
        assert.equal(r.status, 'bridge_unavailable');
    }
});

test('Epii action against human-required envelope returns human_validation_required without calling gateway', async () => {
    const claim = buildJivaSivaRecognitionClaim(FULL_CLAIM_INPUT);
    const env = recognitionClaimToEnvelope(claim, 'cosmic-engine-snapshot', 9, 3);
    const calls = [];
    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({}),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async (method) => { calls.push(method); return {}; },
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    const r = await reviewRecognitionClaim(bridge, env);
    assert.equal(r.status, 'human_validation_required');
    assert.equal(calls.length, 0);
});

test('Epii action rejects graphiti-memory envelope targeting canon', async () => {
    const env = graphitiEnvelope({}, 's5.review.target.canon');
    // Re-frame as non-human-gated so the disposition guard does not short-circuit.
    const nonHumanGraphiti = Object.freeze({ ...env, requiresHumanFinalValidation: false });
    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({}),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async () => ({ ok: true }),
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    const r = await dryRunCanonPromotion(bridge, nonHumanGraphiti);
    assert.equal(r.status, 'rejected_by_gateway');
    assert.match(r.reason, /Graphiti-source guard/);
});

// ---- Epii review panel state defaults to closed ------------------------

test('CLOSED_EPII_REVIEW_STATE is frozen and starts in closed mode', () => {
    assert.equal(Object.isFrozen(CLOSED_EPII_REVIEW_STATE), true);
    assert.equal(CLOSED_EPII_REVIEW_STATE.mode, 'closed');
    assert.equal(CLOSED_EPII_REVIEW_STATE.reviewInboxCount, 0);
    assert.equal(
        CLOSED_EPII_REVIEW_STATE.dryRunPromotionReadiness,
        'awaiting-compiler-mutation-law'
    );
});

test('withReviewInboxCount auto-summons via notify-pending on growth', () => {
    const initial = CLOSED_EPII_REVIEW_STATE;
    const next = withReviewInboxCount(initial, 3, 1234);
    assert.equal(next.mode, 'notify-pending');
    assert.equal(next.reviewInboxCount, 3);
    // No growth on same value — returns the same state ref.
    const same = withReviewInboxCount(next, 3, 9999);
    assert.equal(same, next);
});

test('withPanelMode transitions closed → open and back', () => {
    const opened = withPanelMode(CLOSED_EPII_REVIEW_STATE, 'open', 1);
    assert.equal(opened.mode, 'open');
    const closedAgain = withPanelMode(opened, 'closed', 2);
    assert.equal(closedAgain.mode, 'closed');
});
