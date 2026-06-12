import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    routePluginIdentityAugmentProposalThroughM5Gate
} = require('../../lib/browser/identity-augment-review-routing.js');
const {
    CLOSED_EPII_REVIEW_STATE
} = require('@pratibimba/integrated-composition/epii-review-state');

test('identity-augment recursive self-review proposals route through the M5 human gate', () => {
    const routed = routePluginIdentityAugmentProposalThroughM5Gate(
        CLOSED_EPII_REVIEW_STATE,
        Object.freeze({
            proposalId: '05.9.identity-augment.sophia',
            actor: 'sophia',
            recursiveSelfReview: true,
            humanRequired: false,
            actorIsHuman: false
        }),
        8083
    );

    assert.equal(routed.gate.ok, false);
    assert.equal(routed.gatedVerdict, 'awaiting-human-final-validation');
    assert.equal(routed.state.mode, 'notify-pending');
    assert.equal(routed.state.humanRequiredGateState, 'awaiting-human');
    assert.equal(routed.state.activeCandidateRoute, 'identity-augment:05.9.identity-augment.sophia');
    assert.equal(routed.state.reviewInboxCount, 1);
    assert.equal(routed.state.lastUpdatedAt, 8083);
});

test('all recursive self-review gate actors require human final-validation', () => {
    for (const actor of ['sophia', 'anima', 'pi', 'aletheia']) {
        const routed = routePluginIdentityAugmentProposalThroughM5Gate(
            CLOSED_EPII_REVIEW_STATE,
            Object.freeze({
                proposalId: `05.9.identity-augment.${actor}`,
                actor,
                recursiveSelfReview: true,
                humanRequired: false,
                actorIsHuman: false
            }),
            9000
        );
        assert.equal(routed.gate.ok, false, `${actor} must await human final-validation`);
        assert.equal(routed.state.humanRequiredGateState, 'awaiting-human');
    }
});
