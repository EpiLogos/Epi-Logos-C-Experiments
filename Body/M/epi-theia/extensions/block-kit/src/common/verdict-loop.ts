import type { Block } from '@pratibimba/m-extension-runtime';

export type BlockVerdictDecision = 'approve' | 'reject' | 'revise' | 'defer';
export type BlockResolutionTarget = 'agent' | 'human';
export type BlockSessionOpMethod = 'blocks.annotate' | 'blocks.verdict';

export interface BlockSessionOperation {
    readonly method: BlockSessionOpMethod;
    readonly blockId: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly resolutionTarget: BlockResolutionTarget;
    readonly decision?: BlockVerdictDecision;
    readonly annotation?: string;
    readonly reason: string;
    readonly routesTo: "s4'.psyche.update";
}

export interface BlockRendererSessionState {
    readonly activeBlockIds: readonly string[];
    readonly pendingVerdict: BlockSessionOperation | null;
    readonly currentSelection: string | null;
    readonly appliedOperations: readonly BlockSessionOperation[];
}

export interface HumanGateResult {
    readonly ok: boolean;
    readonly reason?: string;
}

export interface BlockPsycheUpdateRequest {
    readonly method: "s4'.psyche.update";
    readonly params: {
        readonly sessionKey: string;
        readonly patch: {
            readonly renderer: BlockRendererSessionState;
        };
    };
}

export function createRendererSessionState(blocks: readonly Block[] = []): BlockRendererSessionState {
    return Object.freeze({
        activeBlockIds: Object.freeze(blocks.map(block => block.id)),
        pendingVerdict: null,
        currentSelection: blocks[0]?.id ?? null,
        appliedOperations: Object.freeze([])
    });
}

export function createVerdictOperation(input: {
    readonly block: Block;
    readonly decision: BlockVerdictDecision;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly resolutionTarget?: BlockResolutionTarget;
    readonly reason: string;
    readonly humanGate: HumanGateResult;
}): BlockSessionOperation {
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

export function createAnnotationOperation(input: {
    readonly block: Block;
    readonly annotation: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly resolutionTarget?: BlockResolutionTarget;
    readonly reason?: string;
}): BlockSessionOperation {
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

export function applyBlockSessionOperation(
    state: BlockRendererSessionState,
    operation: BlockSessionOperation
): BlockRendererSessionState {
    return Object.freeze({
        activeBlockIds: state.activeBlockIds,
        pendingVerdict: operation.method === 'blocks.verdict' ? operation : state.pendingVerdict,
        currentSelection: operation.blockId,
        appliedOperations: Object.freeze([...state.appliedOperations, operation])
    });
}

export function createBlockPsycheUpdateRequest(input: {
    readonly sessionKey: string;
    readonly state: BlockRendererSessionState;
}): BlockPsycheUpdateRequest {
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

function resolutionTargetForActor(actorIsHuman: boolean): BlockResolutionTarget {
    return actorIsHuman ? 'human' : 'agent';
}

function assertReviewItemAffordance(block: Block, affordance: 'annotate' | 'verdict'): void {
    if (block.type !== 'review-item') {
        throw new Error(`${affordance} operations require a review-item block`);
    }
    if (!block.affordances?.includes(affordance)) {
        throw new Error(`review-item block ${block.id} does not declare ${affordance} affordance`);
    }
}

function freezeRendererSessionState(state: BlockRendererSessionState): BlockRendererSessionState {
    return Object.freeze({
        activeBlockIds: Object.freeze([...state.activeBlockIds]),
        pendingVerdict: state.pendingVerdict ? Object.freeze({ ...state.pendingVerdict }) : null,
        currentSelection: state.currentSelection,
        appliedOperations: Object.freeze(state.appliedOperations.map(operation => Object.freeze({ ...operation })))
    });
}
