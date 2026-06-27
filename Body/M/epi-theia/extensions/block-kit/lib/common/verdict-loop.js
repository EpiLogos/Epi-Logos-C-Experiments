"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBlockSessionOperation = exports.createBlockPsycheUpdateRequest = exports.createAnnotationOperation = exports.createVerdictOperation = exports.createRendererSessionState = void 0;
function createRendererSessionState(blocks = []) {
    return Object.freeze({
        activeBlockIds: Object.freeze(blocks.map(block => block.id)),
        blocks: Object.freeze([...blocks]),
        pendingVerdict: null,
        currentSelection: blocks[0]?.id ?? null,
        appliedOperations: Object.freeze([])
    });
}
exports.createRendererSessionState = createRendererSessionState;
function createVerdictOperation(input) {
    assertReviewItemAffordance(input.block, 'verdict');
    if (!input.humanGate.ok) {
        throw new Error(input.humanGate.reason ?? 'Human Gate rejected block verdict');
    }
    return Object.freeze({
        method: 'blocks.verdict',
        blockId: input.block.id,
        actor: input.actor,
        actorIsHuman: input.actorIsHuman,
        resolutionTarget: input.resolutionTarget ?? resolutionTargetForActor(input.actorIsHuman),
        decision: input.decision,
        reason: input.reason,
        routesTo: "s4'.psyche.update"
    });
}
exports.createVerdictOperation = createVerdictOperation;
function createAnnotationOperation(input) {
    assertReviewItemAffordance(input.block, 'annotate');
    return Object.freeze({
        method: 'blocks.annotate',
        blockId: input.block.id,
        actor: input.actor,
        actorIsHuman: input.actorIsHuman,
        resolutionTarget: input.resolutionTarget ?? resolutionTargetForActor(input.actorIsHuman),
        annotation: input.annotation,
        reason: input.reason ?? 'annotation',
        routesTo: "s4'.psyche.update"
    });
}
exports.createAnnotationOperation = createAnnotationOperation;
function applyBlockSessionOperation(state, operation) {
    return Object.freeze({
        activeBlockIds: state.activeBlockIds,
        blocks: state.blocks,
        pendingVerdict: operation.method === 'blocks.verdict' ? operation : state.pendingVerdict,
        currentSelection: operation.blockId,
        appliedOperations: Object.freeze([...state.appliedOperations, operation])
    });
}
exports.applyBlockSessionOperation = applyBlockSessionOperation;
function createBlockPsycheUpdateRequest(input) {
    return Object.freeze({
        method: "s4'.psyche.update",
        params: Object.freeze({
            sessionKey: input.sessionKey,
            patch: Object.freeze({
                renderer: freezeRendererSessionState(input.state)
            })
        })
    });
}
exports.createBlockPsycheUpdateRequest = createBlockPsycheUpdateRequest;
function resolutionTargetForActor(actorIsHuman) {
    return actorIsHuman ? 'human' : 'agent';
}
function assertReviewItemAffordance(block, affordance) {
    if (block.type !== 'review-item') {
        throw new Error(`${affordance} operations require a review-item block`);
    }
    if (!block.affordances?.includes(affordance)) {
        throw new Error(`review-item block ${block.id} does not declare ${affordance} affordance`);
    }
}
function freezeRendererSessionState(state) {
    return Object.freeze({
        activeBlockIds: Object.freeze([...state.activeBlockIds]),
        blocks: Object.freeze([...state.blocks]),
        pendingVerdict: state.pendingVerdict ? Object.freeze({ ...state.pendingVerdict }) : null,
        currentSelection: state.currentSelection,
        appliedOperations: Object.freeze(state.appliedOperations.map(operation => Object.freeze({ ...operation })))
    });
}
//# sourceMappingURL=verdict-loop.js.map
