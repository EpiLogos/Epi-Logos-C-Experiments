export const EXTENSION_ID = 'logos-atelier' as const;
export const LOGOS_ATELIER_WIDGET_ID = 'pratibimba.logos-atelier' as const;
export const LOGOS_ATELIER_OPEN_COMMAND_ID = 'pratibimba.logos-atelier.open' as const;

export const ETYMOLOGY_GRAPH_NAMESPACE = 'etymology' as const;
export const ETYMOLOGY_URI_SCHEME = 'etymology' as const;
export const ANIMA_DISPATCHER = 'Anima' as const;
export const ALETHEIA_CARRIER = 'Aletheia' as const;
export const ALETHEIA_CRYSTALLISATION_MODE = 'Aletheia-crystallisation-mode' as const;
export const TOOL_GUARDIAN_MODE = 'tool-guardian' as const;

export const ALETHEIA_TOOL_GUARDIANS = [
    'Anansi',
    'Janus',
    'Moirai',
    'Mercurius',
    'Agora',
    'Zeithoven'
] as const;

export type AletheiaToolGuardian = (typeof ALETHEIA_TOOL_GUARDIANS)[number];

export type AletheiaToolName =
    | 'aletheia_gnosis_query'
    | 'aletheia_crystallise'
    | 'aletheia_thought_route';

export type GnosticGatewayMethod =
    | "s5'.gnostic.query"
    | "s5'.gnostic.notebook"
    | "s5'.gnostic.ingest";

export type ScentFollowingStageId =
    | 'root'
    | 'cognate'
    | 'drift'
    | 'psychoid'
    | 'pros-hen'
    | 'mobius-write-back';

export interface ScentFollowingStage {
    readonly id: ScentFollowingStageId;
    readonly label: string;
    readonly order: number;
    readonly tool: AletheiaToolName;
    readonly gatewayMethod: GnosticGatewayMethod;
    readonly promptClass: string;
}

export const SCENT_FOLLOWING_STAGES: readonly ScentFollowingStage[] = Object.freeze([
    {
        id: 'root',
        label: 'Root',
        order: 0,
        tool: 'aletheia_gnosis_query',
        gatewayMethod: "s5'.gnostic.query",
        promptClass: 'root-pressure'
    },
    {
        id: 'cognate',
        label: 'Cognate',
        order: 1,
        tool: 'aletheia_gnosis_query',
        gatewayMethod: "s5'.gnostic.query",
        promptClass: 'cognate-ring'
    },
    {
        id: 'drift',
        label: 'Drift',
        order: 2,
        tool: 'aletheia_thought_route',
        gatewayMethod: "s5'.gnostic.query",
        promptClass: 'semantic-drift'
    },
    {
        id: 'psychoid',
        label: 'Psychoid',
        order: 3,
        tool: 'aletheia_thought_route',
        gatewayMethod: "s5'.gnostic.query",
        promptClass: 'psychoid-resonance'
    },
    {
        id: 'pros-hen',
        label: 'Pros-hen',
        order: 4,
        tool: 'aletheia_crystallise',
        gatewayMethod: "s5'.gnostic.notebook",
        promptClass: 'pros-hen-synthesis'
    },
    {
        id: 'mobius-write-back',
        label: 'Mobius write-back proposal',
        order: 5,
        tool: 'aletheia_crystallise',
        gatewayMethod: "s5'.gnostic.ingest",
        promptClass: 'mobius-write-back-proposal'
    }
]);

export interface AtelierStageArtifact {
    readonly stageId: ScentFollowingStageId;
    readonly gatewayMethod: GnosticGatewayMethod;
    readonly tool: AletheiaToolName;
    readonly artifact: unknown;
    readonly privacyClass: string;
    readonly provenanceHandles: readonly string[];
}

export interface AtelierPipelineInput {
    readonly term: string;
    readonly seedText?: string;
    readonly priorArtifacts?: readonly AtelierStageArtifact[];
    readonly profileGeneration?: number | null;
    readonly sessionKey?: string;
}

export interface AtelierDispatchEnvelope {
    readonly dispatcher: typeof ANIMA_DISPATCHER;
    readonly carrier: typeof ALETHEIA_CARRIER;
    readonly mode: typeof ALETHEIA_CRYSTALLISATION_MODE;
    readonly guardianMode: typeof TOOL_GUARDIAN_MODE;
    readonly evidenceLineage: readonly AletheiaToolGuardian[];
}

export interface AtelierGatewayParams {
    readonly gatewayMethod: GnosticGatewayMethod;
    readonly aletheiaTool: AletheiaToolName;
    readonly graphNamespace: typeof ETYMOLOGY_GRAPH_NAMESPACE;
    readonly etymologyUri: string;
    readonly stage: ScentFollowingStageId;
    readonly stageOrder: number;
    readonly promptClass: string;
    readonly term: string;
    readonly seedText: string | null;
    readonly priorArtifactUris: readonly string[];
    readonly dispatch: AtelierDispatchEnvelope;
}

export interface MobiusWriteBackProposal {
    readonly kind: 'logos-atelier.mobius-write-back-proposal';
    readonly graphNamespace: typeof ETYMOLOGY_GRAPH_NAMESPACE;
    readonly etymologyUri: string;
    readonly term: string;
    readonly sourceStage: 'mobius-write-back';
    readonly dispatch: AtelierDispatchEnvelope;
    readonly evidence: readonly AtelierStageArtifact[];
    readonly proposedGatewayMethod: "s5'.gnostic.ingest";
    readonly proposedTool: 'aletheia_crystallise';
}

export const FORBIDDEN_ATELIER_PRIVACY_CLASSES = [
    'private',
    'protected',
    'restricted-graphiti-body',
    'protected-nara-body',
    'private-journal',
    'private-birth-data',
    'private-quaternion',
    'private-profile'
] as const;

export function isAtelierPrivacySafe(privacyClass: string | null | undefined): boolean {
    if (privacyClass === null || privacyClass === undefined) {
        return true;
    }
    return !(FORBIDDEN_ATELIER_PRIVACY_CLASSES as readonly string[]).includes(privacyClass);
}

export function normaliseAtelierTerm(term: string): string {
    return term.trim().replace(/\s+/g, ' ');
}

export function etymologyUriFor(term: string, stageId?: ScentFollowingStageId): string {
    const normalised = normaliseAtelierTerm(term);
    if (normalised.length === 0) {
        throw new Error('Logos Atelier requires a non-empty term before building an etymology URI');
    }
    const encoded = encodeURIComponent(normalised.toLowerCase());
    return stageId
        ? `${ETYMOLOGY_URI_SCHEME}://${encoded}/${stageId}`
        : `${ETYMOLOGY_URI_SCHEME}://${encoded}`;
}

export function atelierDispatchEnvelope(): AtelierDispatchEnvelope {
    return Object.freeze({
        dispatcher: ANIMA_DISPATCHER,
        carrier: ALETHEIA_CARRIER,
        mode: ALETHEIA_CRYSTALLISATION_MODE,
        guardianMode: TOOL_GUARDIAN_MODE,
        evidenceLineage: ALETHEIA_TOOL_GUARDIANS
    });
}

export function buildAtelierGatewayParams(
    stage: ScentFollowingStage,
    input: AtelierPipelineInput
): AtelierGatewayParams {
    const term = normaliseAtelierTerm(input.term);
    if (term.length === 0) {
        throw new Error('Logos Atelier cannot invoke Aletheia without a term');
    }
    return Object.freeze({
        gatewayMethod: stage.gatewayMethod,
        aletheiaTool: stage.tool,
        graphNamespace: ETYMOLOGY_GRAPH_NAMESPACE,
        etymologyUri: etymologyUriFor(term, stage.id),
        stage: stage.id,
        stageOrder: stage.order,
        promptClass: stage.promptClass,
        term,
        seedText: input.seedText?.trim() || null,
        priorArtifactUris: Object.freeze(
            (input.priorArtifacts ?? []).map(artifact => etymologyUriFor(term, artifact.stageId))
        ),
        dispatch: atelierDispatchEnvelope()
    });
}

export function buildMobiusWriteBackProposal(
    term: string,
    evidence: readonly AtelierStageArtifact[]
): MobiusWriteBackProposal {
    const normalised = normaliseAtelierTerm(term);
    if (!evidence.some(item => item.stageId === 'mobius-write-back')) {
        throw new Error('Mobius write-back proposal requires the mobius-write-back stage evidence');
    }
    return Object.freeze({
        kind: 'logos-atelier.mobius-write-back-proposal',
        graphNamespace: ETYMOLOGY_GRAPH_NAMESPACE,
        etymologyUri: etymologyUriFor(normalised),
        term: normalised,
        sourceStage: 'mobius-write-back',
        dispatch: atelierDispatchEnvelope(),
        evidence: Object.freeze([...evidence]),
        proposedGatewayMethod: "s5'.gnostic.ingest",
        proposedTool: 'aletheia_crystallise'
    });
}
