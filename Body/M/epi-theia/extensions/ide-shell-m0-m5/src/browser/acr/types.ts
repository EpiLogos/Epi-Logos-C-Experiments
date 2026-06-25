export type AletheiaSubagent =
    | 'anansi'
    | 'janus'
    | 'moirai'
    | 'mercurius'
    | 'agora'
    | 'zeithoven';

export type DispatchActor = 'pi' | 'anima' | 'aletheia' | string;
export type PsycheFacet = 'anima' | 'eros' | 'logos' | 'mythos' | 'nous' | 'psyche' | 'sophia';

export interface AletheiaVetoRecord {
    readonly reason: string;
    readonly raisedAt?: number | null;
    readonly candidateCanonicalWriteId?: string | null;
    readonly nonBlockingHumanGate?: boolean | null;
}

export interface AletheiaLineageBadge {
    readonly label: string;
    readonly handle?: string | null;
    readonly source?: string | null;
}

export interface AletheiaMediationRef {
    readonly aletheiaSubagent?: AletheiaSubagent | null;
    readonly kind?: string | null;
}

export interface JanusProspectiveRetrospectiveFrame {
    readonly prospective: number;
    readonly retrospective: number;
    readonly oracleSpreadAliveness?: string | null;
    readonly kairosWeighting?: string | null;
}

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
    readonly mediatedBy?: AletheiaMediationRef | null;
    readonly veto?: AletheiaVetoRecord | null;
    readonly lineageBadges?: readonly AletheiaLineageBadge[];
    readonly janusFrame?: JanusProspectiveRetrospectiveFrame | null;
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
