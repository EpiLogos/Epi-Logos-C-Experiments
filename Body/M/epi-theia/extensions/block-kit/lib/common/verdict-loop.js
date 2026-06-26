"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBlockSessionOperation = exports.createAnnotationOperation = exports.createVerdictOperation = exports.createRendererSessionState = void 0;
function createRendererSessionState(blocks = []) {
    return Object.freeze({
        activeBlockIds: Object.freeze(blocks.map(block => block.id)),
        pendingVerdict: null,
        currentSelection: blocks[0]?.id ?? null,
        appliedOperations: Object.freeze([])
    });
}
exports.createRendererSessionState = createRendererSessionState;
function createVerdictOperation(input) {
    if (!input.humanGate.ok) {
        throw new Error(input.humanGate.reason ?? 'Human Gate rejected block verdict');
    }
    return Object.freeze({
        method: 'blocks.verdict',
        blockId: input.block.id,
        actor: input.actor,
        actorIsHuman: input.actorIsHuman,
        decision: input.decision,
        reason: input.reason,
        routesTo: "s4'.psyche.update"
    });
}
exports.createVerdictOperation = createVerdictOperation;
function createAnnotationOperation(input) {
    return Object.freeze({
        method: 'blocks.annotate',
        blockId: input.block.id,
        actor: input.actor,
        actorIsHuman: input.actorIsHuman,
        annotation: input.annotation,
        reason: input.reason ?? 'annotation',
        routesTo: "s4'.psyche.update"
    });
}
exports.createAnnotationOperation = createAnnotationOperation;
function applyBlockSessionOperation(state, operation) {
    return Object.freeze({
        activeBlockIds: state.activeBlockIds,
        pendingVerdict: operation.method === 'blocks.verdict' ? operation : state.pendingVerdict,
        currentSelection: operation.blockId,
        appliedOperations: Object.freeze([...state.appliedOperations, operation])
    });
}
exports.applyBlockSessionOperation = applyBlockSessionOperation;
//# sourceMappingURL=verdict-loop.js.map