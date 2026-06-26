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
export declare function createRendererSessionState(blocks?: readonly Block[]): BlockRendererSessionState;
export declare function createVerdictOperation(input: {
    readonly block: Block;
    readonly decision: BlockVerdictDecision;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly reason: string;
    readonly humanGate: HumanGateResult;
}): BlockSessionOperation;
export declare function createAnnotationOperation(input: {
    readonly block: Block;
    readonly annotation: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly reason?: string;
}): BlockSessionOperation;
export declare function applyBlockSessionOperation(state: BlockRendererSessionState, operation: BlockSessionOperation): BlockRendererSessionState;
//# sourceMappingURL=verdict-loop.d.ts.map