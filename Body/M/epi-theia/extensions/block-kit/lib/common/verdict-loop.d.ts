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
    readonly blocks: readonly Block[];
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
export declare function createRendererSessionState(blocks?: readonly Block[]): BlockRendererSessionState;
export declare function createVerdictOperation(input: {
    readonly block: Block;
    readonly decision: BlockVerdictDecision;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly resolutionTarget?: BlockResolutionTarget;
    readonly reason: string;
    readonly humanGate: HumanGateResult;
}): BlockSessionOperation;
export declare function createAnnotationOperation(input: {
    readonly block: Block;
    readonly annotation: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly resolutionTarget?: BlockResolutionTarget;
    readonly reason?: string;
}): BlockSessionOperation;
export declare function applyBlockSessionOperation(state: BlockRendererSessionState, operation: BlockSessionOperation): BlockRendererSessionState;
export declare function createBlockPsycheUpdateRequest(input: {
    readonly sessionKey: string;
    readonly state: BlockRendererSessionState;
}): BlockPsycheUpdateRequest;
//# sourceMappingURL=verdict-loop.d.ts.map