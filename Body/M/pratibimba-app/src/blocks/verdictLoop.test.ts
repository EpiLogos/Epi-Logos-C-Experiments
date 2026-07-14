/**
 * Coordinate: M' M5' (verdict loop tests — Tranche 44.T44.4)
 * Actualises: the vertical-slice verification — verdicts require a
 *   review-item with the declared affordance AND a passing Human Gate
 *   (the carrier's live m5ReviewGate: agent committal on human-required
 *   items is BLOCKED, defer passes, a human commits); operations fold into
 *   the renderer session state; the `s4'.psyche.update` request carries the
 *   `renderer` patch that survives handoff.
 */

import { describe, expect, it } from 'vitest';
import { enforceHumanGate } from '../panes/m5ReviewGate';
import type { Block } from './blockContract';
import {
    applyBlockSessionOperation,
    createAnnotationOperation,
    createBlockPsycheUpdateRequest,
    createRendererSessionState,
    createVerdictOperation
} from './verdictLoop';

const REVIEW_BLOCK: Block = {
    id: 'review-item:run-1',
    type: 'review-item',
    ctx: { cf: '(5/0)', ct: 'CT5', cp: 'CP4.5' },
    privacyClass: 'protected',
    data: { runId: 'run-1' },
    affordances: ['verdict', 'annotate']
};

describe('44.4 verdict loop under the Human Gate', () => {
    it('an agent committal verdict on a human-required item is blocked by the live gate', () => {
        const gate = enforceHumanGate({
            decision: 'approve',
            humanRequired: true,
            actorIsHuman: false
        });
        expect(gate.ok).toBe(false);
        expect(() =>
            createVerdictOperation({
                block: REVIEW_BLOCK,
                decision: 'approve',
                actor: 'anima',
                actorIsHuman: false,
                reason: 'agent tries to commit',
                humanGate: gate
            })
        ).toThrow(/only a human commits/);
    });

    it('an agent may defer, and a human commits — both pass the gate into operations', () => {
        const deferGate = enforceHumanGate({ decision: 'defer', humanRequired: true, actorIsHuman: false });
        expect(deferGate.ok).toBe(true);
        const defer = createVerdictOperation({
            block: REVIEW_BLOCK,
            decision: 'defer',
            actor: 'anima',
            actorIsHuman: false,
            reason: 'needs human eyes',
            humanGate: deferGate
        });
        expect(defer.resolutionTarget).toBe('agent');

        const humanGate = enforceHumanGate({ decision: 'approve', humanRequired: true, actorIsHuman: true });
        const approve = createVerdictOperation({
            block: REVIEW_BLOCK,
            decision: 'approve',
            actor: 'architect',
            actorIsHuman: true,
            reason: 'reviewed and sound',
            humanGate: humanGate
        });
        expect(approve.method).toBe('blocks.verdict');
        expect(approve.resolutionTarget).toBe('human');
        expect(approve.routesTo).toBe("s4'.psyche.update");
    });

    it('affordance law: verdicts and annotations require a review-item declaring the affordance', () => {
        const gate = enforceHumanGate({ decision: 'approve', humanRequired: false, actorIsHuman: true });
        expect(() =>
            createVerdictOperation({
                block: { ...REVIEW_BLOCK, type: 'evidence' },
                decision: 'approve',
                actor: 'architect',
                actorIsHuman: true,
                reason: 'x',
                humanGate: gate
            })
        ).toThrow(/require a review-item/);
        expect(() =>
            createAnnotationOperation({
                block: { ...REVIEW_BLOCK, affordances: ['verdict'] },
                annotation: 'note',
                actor: 'architect',
                actorIsHuman: true
            })
        ).toThrow(/does not declare annotate/);
    });

    it('operations fold into renderer state and the psyche update carries the renderer patch', () => {
        let state = createRendererSessionState([REVIEW_BLOCK]);
        expect(state.activeBlockIds).toEqual(['review-item:run-1']);

        const annotate = createAnnotationOperation({
            block: REVIEW_BLOCK,
            annotation: 'this run needs a second pass',
            actor: 'architect',
            actorIsHuman: true
        });
        state = applyBlockSessionOperation(state, annotate);
        const gate = enforceHumanGate({ decision: 'reject', humanRequired: true, actorIsHuman: true });
        const verdict = createVerdictOperation({
            block: REVIEW_BLOCK,
            decision: 'reject',
            actor: 'architect',
            actorIsHuman: true,
            reason: 'evidence insufficient',
            humanGate: gate
        });
        state = applyBlockSessionOperation(state, verdict);

        expect(state.appliedOperations).toHaveLength(2);
        expect(state.pendingVerdict?.decision).toBe('reject');
        expect(state.currentSelection).toBe('review-item:run-1');

        const request = createBlockPsycheUpdateRequest({ sessionKey: 'sess-1', state });
        expect(request.method).toBe("s4'.psyche.update");
        expect(request.params.patch.renderer.pendingVerdict?.decision).toBe('reject');
        expect(request.params.patch.renderer.activeBlockIds).toEqual(['review-item:run-1']);
    });
});
