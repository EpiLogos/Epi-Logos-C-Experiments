// Track 05 T8 — human-gate enforcement at the UI surface.
//
// Hard rule (plan body): "human-required gates BLOCK agent approval /
// rejection / revision. Agents may defer but not commit. The UI must enforce
// this AND the gateway must enforce it (test the parity)."
//
// This file exercises the UI side. The gateway-side enforcement is tested
// in Body/S/S5/epii-review-core/Cargo.toml (08.T8 already verified). T9
// adds the live cross-stack parity test.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { enforceHumanGate } = require('../lib/common/run-model.js');

test('non-human-required items pass the gate for all decisions and actors', () => {
    for (const decision of ['approve', 'reject', 'revise', 'defer']) {
        for (const actorIsHuman of [true, false]) {
            const r = enforceHumanGate({ decision, humanRequired: false, actorIsHuman });
            assert.equal(r.ok, true, `${decision} (actorIsHuman=${actorIsHuman}) should pass`);
        }
    }
});

test('human-required + agent actor: approve/reject/revise BLOCKED, defer ALLOWED', () => {
    for (const decision of ['approve', 'reject', 'revise']) {
        const r = enforceHumanGate({ decision, humanRequired: true, actorIsHuman: false });
        assert.equal(r.ok, false, `${decision} must be blocked when agent is the actor`);
        if (!r.ok) {
            assert.match(r.reason, /human-gate enforced/);
            assert.match(r.reason, /may defer/);
        }
    }
    const defer = enforceHumanGate({ decision: 'defer', humanRequired: true, actorIsHuman: false });
    assert.equal(defer.ok, true, 'defer must always be allowed (records human-required state)');
});

test('human-required + HUMAN actor: all decisions pass', () => {
    for (const decision of ['approve', 'reject', 'revise', 'defer']) {
        const r = enforceHumanGate({ decision, humanRequired: true, actorIsHuman: true });
        assert.equal(r.ok, true, `${decision} should pass when actor is human`);
    }
});

test('recursive self-review blocks Sophia approval even when humanRequired is false', () => {
    const r = enforceHumanGate({
        decision: 'approve',
        humanRequired: false,
        actorIsHuman: false,
        recursiveSelfReview: true,
        actor: 'sophia'
    });
    assert.equal(r.ok, false);
});

test('recursive self-review requires human final-validation for Sophia/Anima/Pi/Aletheia', () => {
    for (const actor of ['sophia', 'anima', 'pi', 'aletheia']) {
        const blocked = enforceHumanGate({
            decision: 'approve',
            humanRequired: false,
            actorIsHuman: false,
            recursiveSelfReview: true,
            actor
        });
        assert.equal(blocked.ok, false, `${actor} recursive self-review approval must block`);
        if (!blocked.ok) {
            assert.match(blocked.reason, /recursive self-review/);
            assert.match(blocked.reason, /user final-validation/);
        }

        const human = enforceHumanGate({
            decision: 'approve',
            humanRequired: false,
            actorIsHuman: true,
            recursiveSelfReview: true,
            actor
        });
        assert.equal(human.ok, true, `${actor} recursive self-review passes after human validation`);

        const defer = enforceHumanGate({
            decision: 'defer',
            humanRequired: false,
            actorIsHuman: false,
            recursiveSelfReview: true,
            actor
        });
        assert.equal(defer.ok, true, `${actor} recursive self-review defer remains allowed`);
    }
});
