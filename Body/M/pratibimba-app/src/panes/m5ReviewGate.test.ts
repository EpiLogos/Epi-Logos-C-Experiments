/**
 * Coordinate: M' M5' (review-gate law — Track 08.T8.3)
 * Actualises: the tranche's named ACR contract test verbatim + the gate's
 *   full behavioral contract (human-required blocks agents, recursive
 *   self-review blocks the whole agent lineage incl sophia/aletheia, defer
 *   is always open, humans commit).
 */

import { describe, expect, it } from 'vitest';
import { enforceHumanGate, RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS } from './m5ReviewGate';

describe('m5 recursive-self-review human gate (08.T8.3)', () => {
    it('NAMED ACCEPTANCE: sophia recursive self-review approve is refused', () => {
        expect(
            enforceHumanGate({
                decision: 'approve',
                humanRequired: false,
                actorIsHuman: false,
                recursiveSelfReview: true,
                actor: 'sophia'
            }).ok
        ).toBe(false);
    });

    it('gates the whole lineage: pi / anima / aletheia (the mode) / all six guardians', () => {
        for (const actor of RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS) {
            const gate = enforceHumanGate({
                decision: 'approve',
                humanRequired: false,
                actorIsHuman: false,
                recursiveSelfReview: true,
                actor
            });
            expect(gate.ok, `${actor} must be gated`).toBe(false);
            if (!gate.ok) {
                expect(gate.reason).toContain('user final-validation');
            }
        }
    });

    it('human-required items block ANY agent verdict regardless of lineage', () => {
        expect(
            enforceHumanGate({
                decision: 'reject',
                humanRequired: true,
                actorIsHuman: false,
                actor: 'external-tool'
            }).ok
        ).toBe(false);
    });

    it('agents may always defer (non-committal keeps the gate open)', () => {
        const gate = enforceHumanGate({
            decision: 'defer',
            humanRequired: true,
            actorIsHuman: false,
            recursiveSelfReview: true,
            actor: 'sophia'
        });
        expect(gate.ok).toBe(true);
        if (gate.ok) {
            expect(gate.humanFinalValidationRequired).toBe(true);
        }
    });

    it('a human commits; a non-gated flow passes clean', () => {
        expect(
            enforceHumanGate({
                decision: 'approve',
                humanRequired: true,
                actorIsHuman: true,
                actor: 'user'
            }).ok
        ).toBe(true);
        const clean = enforceHumanGate({
            decision: 'approve',
            humanRequired: false,
            actorIsHuman: false,
            recursiveSelfReview: false,
            actor: 'sophia'
        });
        expect(clean.ok).toBe(true);
        if (clean.ok) {
            expect(clean.humanFinalValidationRequired).toBe(false);
        }
    });

    it('techneClass discriminates over actor when both are present', () => {
        expect(
            enforceHumanGate({
                decision: 'revise',
                humanRequired: false,
                actorIsHuman: false,
                recursiveSelfReview: true,
                actor: 'anima',
                techneClass: 'moirai'
            }).ok
        ).toBe(false);
    });
});
