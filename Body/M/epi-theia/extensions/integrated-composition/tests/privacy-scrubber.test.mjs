import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    PrivacyViolationError,
    validateEvidenceEnvelopeForRange
} = require('../lib/common/privacy-scrubber.js');

function envelope(payload) {
    return Object.freeze({
        envelopeId: 'env-q-partition',
        emittedAt: 1,
        producerId: 'q-partition-test',
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration: 1,
        worldClockGeneration: 1,
        s2ProvenanceHandles: ['s2://node/M5'],
        s3SessionHandle: 's3://session/q-partition',
        s3DayNowHandle: 's3://day-now/q-partition',
        s5ReviewTarget: {
            targetKind: 's5.review.target.routine',
            targetId: 'review://q-partition',
            reason: 'q namespace partition fixture'
        },
        privacyClass: 'protected_local_handle_only',
        sourceSpecAnchors: ['DR-M4-4', '08.T8.8'],
        requiresHumanFinalValidation: false,
        payload: Object.freeze(payload)
    });
}

test('q privacy partition rejects reserved private q fields and derivatives', () => {
    const payload = Object.freeze({
        q_personal: [0, 0, 0, 0],
        q_identity_hash: 'private',
        nested: Object.freeze({
            q_activity_trace: 'private',
            q_composed: [1, 0, 0, 0]
        })
    });

    assert.throws(
        () => validateEvidenceEnvelopeForRange(envelope(payload)),
        error =>
            error instanceof PrivacyViolationError &&
            error.violations.some(v => v.includes('q_personal')) &&
            error.violations.some(v => v.includes('q_identity_hash')) &&
            error.violations.some(v => v.includes('q_activity_trace')) &&
            error.violations.some(v => v.includes('q_composed'))
    );
});

test('q privacy partition accepts public q and qm carrier fields', () => {
    assert.doesNotThrow(() =>
        validateEvidenceEnvelopeForRange(
            envelope({
                q_5_integration_template: 'public q-economy property',
                q_5_metabolised_form: 'public q-economy property',
                qm_5_disclosure_meta: 'public DR-M4-4 meta property'
            })
        )
    );
});

test('q privacy partition rejects unknown q namespace keys by default', () => {
    assert.throws(
        () =>
            validateEvidenceEnvelopeForRange(
                envelope({
                    q_shadow_unregistered: 'not a Tranche 5.23 q carrier',
                    qm_9_out_of_range: 'not a DR-M4-4 meta carrier'
                })
            ),
        error =>
            error instanceof PrivacyViolationError &&
            error.violations.some(v => v.includes('q_shadow_unregistered')) &&
            error.violations.some(v => v.includes('qm_9_out_of_range'))
    );
});
