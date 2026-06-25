import type { Block } from '@pratibimba/m-extension-runtime';

export type BlockVerdictDecision = 'approve' | 'reject' | 'revise' | 'defer';
export type BlockSessionOpMethod = 'blocks.annotate' | 'blocks.verdict';

export interface BlockSessionOperation {
    readonly method: BlockSessionOpMethod;
    readonly blockId: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
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
    readonly reason: string;
    readonly humanGate: HumanGateResult;
}): BlockSessionOperation {
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

export function createAnnotationOperation(input: {
    readonly block: Block;
    readonly annotation: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly reason?: string;
}): BlockSessionOperation {
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
