export type AletheiaSubagent =
    | 'anansi'
    | 'janus'
    | 'moirai'
    | 'mercurius'
    | 'agora'
    | 'zeithoven';

export type DispatchActor = 'pi' | 'anima' | 'aletheia' | string;
export type PsycheFacet = 'anima' | 'eros' | 'logos' | 'mythos' | 'nous' | 'psyche' | 'sophia';

export interface DispatchTraceNode {
    readonly id: string;
    readonly label: string;
    readonly actor: DispatchActor;
    readonly coordinate?: string | null;
    readonly sourceAnchor?: string | null;
    readonly methodOrSkill?: string | null;
    readonly tickAtInvoke?: number | null;
    readonly psycheFacet?: PsycheFacet | null;
    readonly aletheiaSubagent?: AletheiaSubagent | null;
    readonly mediatedRunEvidencePacketId?: string | null;
    readonly children?: readonly DispatchTraceNode[];
}

export interface ToolInvocationRef {
    readonly id: string;
    readonly invokedAt: number;
    readonly toolName: string;
    readonly actor?: string | null;
    readonly psycheFacet?: PsycheFacet | null;
    readonly dispatchNodeId?: string | null;
    readonly inputDigest?: string | null;
    readonly outputDigest?: string | null;
    readonly errorMessage?: string | null;
}

export interface Run {
    readonly id: string;
    readonly status: string;
    readonly humanRequired: boolean;
    readonly reviewId?: string | null;
}

export interface IOD17Parity {
    readonly inParity: boolean;
    readonly capabilityMatrixState: string;
    readonly agentContractState: string;
    readonly widgetState: string;
    readonly drift?: readonly string[];
}

export interface MediatedRunEvidencePacket {
    readonly id: string;
    readonly candidateId: string;
    readonly coordinate: string | null;
    readonly sourceAnchor: string | null;
    readonly reviewId: string | null;
    readonly sessionKey: string | null;
    readonly dayNowContext: string | null;
    readonly profileGeneration: number | null;
    readonly privacyClass: string;
}

export type RuntimeControlAction = 'abort' | 'retry' | 'continue';
export type ReviewDecisionAction = 'approve' | 'reject' | 'revise' | 'defer';
