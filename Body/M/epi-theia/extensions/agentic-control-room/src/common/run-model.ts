import {
    enforcePiReviewRoutingGate
} from '@pratibimba/m-extension-runtime/lib/common/recursive-self-review-gate';

/**
 * Agentic Control Room run model — Track 05 T8.
 *
 * The run flow surfaces:
 *   1. A user-driven (or intent-routed) S5 improvement candidate.
 *   2. The actor chooses a route + actor pair (Pi, Anima, or an Aletheia
 *      techne-guardian subagent per DR-M5-1).
 *   3. The Agentic Control Room composes a payload and dispatches via
 *      KERNEL_BRIDGE_API.invokeCapability (method='invokeGatewayRpc',
 *      gatewayMethod='s4'.mediation.route'). Tool events stream back through
 *      kernel-bridge runtime events.
 *   4. The run tree, tool stream, and diagnostics surface those events.
 *   5. Evidence deposition collects source/graph/file/review/test/profile/
 *      bridge-readiness anchors plus DAY/NOW + session key + sessionKey.
 *   6. Review decisions transition the candidate via `s5'.review.submit` /
 *      `s5'.review.resolve` — but only after the human-gate is satisfied.
 *
 * Hard rule (Track 05 T8): if a candidate has `humanRequired === true`,
 * approve / reject / revise are BLOCKED in the UI AND on the gateway. Agents
 * may defer (record `humanRequired` state + reason) but never commit.
 */

export type AgenticActor =
    | 'pi'
    | 'anima'
    | 'anansi'
    | 'moirai'
    | 'janus'
    | 'mercurius'
    | 'agora'
    | 'zeithoven';

export type AgenticRoute =
    | 'dispatch_agent'
    | 'dispatch_parallel_agents'
    | 'dispatch_fusion_agents'
    | 'run_chain'
    | 'dispatch_moirai_night_pass'
    | 'anima_self_invoke'
    | string;

export type RunStatus =
    | 'pending'
    | 'running'
    | 'tool-invoked'
    | 'awaiting-evidence'
    | 'awaiting-review'
    | 'aborted'
    | 'errored'
    | 'completed'
    | 'deferred-human-required';

export interface RunTreeNode {
    readonly id: string;
    readonly label: string;
    readonly status: RunStatus;
    readonly startedAtMs: number;
    readonly endedAtMs?: number;
    readonly toolName?: string;
    readonly diagnostics?: readonly string[];
    readonly children?: readonly RunTreeNode[];
}

export interface ToolStreamEvent {
    readonly id: string;
    readonly emittedAtMs: number;
    readonly tool: string;
    readonly kind: 'tool.start' | 'tool.partial' | 'tool.end' | 'tool.error' | 'route.start' | 'route.end' | string;
    readonly payload?: unknown;
    readonly privacyClass?: string;
}

export type ReviewDecision = 'approve' | 'reject' | 'revise' | 'defer';

export interface ReviewTransition {
    readonly candidateId: string;
    readonly decision: ReviewDecision;
    readonly reason: string;
    readonly actor: AgenticActor;
    /** When true, only a human (via M5 review surface) may transition. */
    readonly humanRequired: boolean;
    readonly transitionAtMs: number;
}

/**
 * Evidence envelope — what the run flow gathers before submitting a review
 * transition. The pane in T4 + this extension's deposition view both render
 * the same shape so the cross-layout intent contract is single-source.
 */
export interface RunEvidenceEnvelope {
    readonly candidateId: string;
    readonly coordinate: string | null;
    readonly artifactUri: string | null;
    readonly sourceAnchor: string | null;
    readonly specAnchor: string | null;
    readonly codeAnchor: string | null;
    readonly testAnchor: string | null;
    readonly graphAnchor: string | null;
    readonly reviewId: string | null;
    readonly profileGeneration: number | null;
    readonly bridgeReadinessHandle: string | null;
    readonly sessionKey: string | null;
    readonly dayNowContext: string | null;
    readonly privacyClass: string;
}

export type MediationCapabilityName =
    | 'readCurrentProfile'
    | 'readPointerAnchor'
    | 'readGraphContext'
    | 'subscribeRunEvents'
    | 'invokeGatewayRpc'
    | 'depositReviewEvidence'
    | 'requestDryRunPromotion'
    | 's1.semantic.suggest_links'
    | 's1.semantic.neighbors_of'
    | 's1.semantic.search'
    | 's1.semantic.by_block'
    | 's1.vault.read_file'
    | 's1.vault.write_file'
    | 's1.vault.move_file'
    | 's1.vault.rename_file'
    | 's1.vault.append_block'
    | 's1.vault.update_frontmatter'
    | 'directFsVaultWrite'
    | string;

export interface CapabilityAllowResult {
    readonly allowed: boolean;
    readonly reason: string;
}

export interface CurrentProfileEvidenceRef {
    readonly source: 's0.current_profile';
    readonly generation: number;
    readonly readiness: Readonly<Record<string, unknown>>;
    readonly profileHandle: string;
}

export interface GraphContextEvidenceRef {
    readonly source: 's2.graph_services';
    readonly namespace: string;
    readonly coordinate: string;
    readonly graphAnchor: string;
    readonly relationRefs?: readonly string[];
    readonly sourceRefs?: readonly string[];
}

export interface SessionRuntimeEvidenceRef {
    readonly source: 's3.gateway';
    readonly sessionKey: string;
    readonly dayId: string;
    readonly nowPath: string;
    readonly gatewayRunRef?: string;
    readonly runtimeRefs?: readonly string[];
}

export interface GraphitiProtectedHandle {
    readonly handle: string;
    readonly namespace: string;
    readonly privacyClass: string;
    readonly summary?: string;
}

export interface VaultEvidenceRef {
    readonly method: string;
    readonly uri: string;
    readonly capability: MediationCapabilityName;
    readonly governance: 'read_only' | 'deposit_draft' | 'human_required' | string;
}

export interface SemanticLinkCandidate {
    readonly target: string;
    readonly score: number;
    readonly sourceBlock: string;
    readonly reason?: string;
}

export interface SemanticCandidateEvidenceRef {
    readonly source: 's1.semantic.suggest_links';
    readonly responseType: 'LinkCandidateResponse';
    readonly requestRef: string;
    readonly candidates: readonly SemanticLinkCandidate[];
}

export interface S5EvidenceRefs {
    readonly source: 's5.persisted_store';
    readonly candidateRef: string;
    readonly reviewRef?: string;
    readonly improvementRef?: string;
    readonly persistedStoreDtoRef: string;
}

export type TerminalCaptureMode = 'metadataOnly' | 'stream' | 'transcript' | string;

export interface TerminalObservabilityCapturePolicy {
    readonly mode: TerminalCaptureMode;
    readonly maxLines?: number | null;
    readonly redactionPolicy?: string | null;
}

export interface TerminalObservabilityBinding {
    readonly provider?: string | null;
    readonly terminalIdentifier?: string | null;
    readonly sessionAnchor?: string | null;
    readonly tmuxPaneId?: string | null;
    readonly attachedSessionKey?: string | null;
    readonly terminalStatus?: string | null;
    readonly leaseExpiresAtMs?: number | string | null;
    readonly capturePolicy?: TerminalObservabilityCapturePolicy | null;
    readonly captureHandleRef?: string | null;
    readonly rawPaneBodyIncluded?: boolean | null;
    readonly lease?: {
        readonly leaseOwner?: string | null;
        readonly leasePurpose?: string | null;
        readonly leaseExpiresAtMs?: number | string | null;
    } | null;
}

export interface GatewayResolvedSessionSurface {
    readonly canonicalKey?: string | null;
    readonly sessionKey?: string | null;
    readonly sessionId?: string | null;
    readonly activeAgentId?: string | null;
    readonly provider?: string | null;
    readonly teamId?: string | null;
    readonly teamRole?: string | null;
    readonly orchestrationKind?: string | null;
    readonly parentSessionKey?: string | null;
    readonly sourceSessionKey?: string | null;
    readonly sourceSessionKind?: string | null;
    readonly subagentLineage?: readonly string[] | null;
    readonly dayId?: string | null;
    readonly vaultNowPath?: string | null;
    readonly cmuxWorkspace?: string | null;
    readonly cmuxSurface?: string | null;
    readonly cmuxPaneId?: string | null;
    readonly terminalBinding?: TerminalObservabilityBinding | null;
    readonly capturePolicy?: TerminalObservabilityCapturePolicy | null;
    readonly captureHandleRef?: string | null;
    readonly lastRunId?: string | null;
    readonly runState?: {
        readonly lastRunId?: string | null;
        readonly captureHandleRef?: string | null;
        readonly capturePolicy?: TerminalObservabilityCapturePolicy | null;
    } | null;
    readonly updatedAtMs?: number | string | null;
}

export interface PortalTemporalSurfaceContract {
    readonly canonicalSessionKey?: string | null;
    readonly activeAgentId?: string | null;
    readonly dayId?: string | null;
    readonly nowPath?: string | null;
    readonly nowWikilink?: string | null;
    readonly kernelGeneration?: number | string | null;
    readonly kernelSubTick?: number | string | null;
    readonly generation?: number | string | null;
    readonly terminalBacked?: boolean | null;
    readonly terminalProvider?: string | null;
    readonly terminalStatus?: string | null;
    readonly terminalLeaseExpiresAtMs?: number | string | null;
    readonly terminalCapturePolicyMode?: TerminalCaptureMode | null;
    readonly terminalCaptureHandleRef?: string | null;
    readonly terminalMetadataKey?: string | null;
}

export interface PiRuntimeMonitorProjection {
    readonly sessionKey: string;
    readonly activeAgent: string;
    readonly role: string;
    readonly teamChainLineage: readonly string[];
    readonly nowDayLink: string;
    readonly cmuxProjection: string;
    readonly terminalProvider: string;
    readonly terminalStatus: string;
    readonly terminalBacked: boolean;
    readonly leaseExpires: string;
    readonly lastObservedTick: string;
    readonly captureAvailability: 'metadata-only' | 'bounded-capture-available' | 'captured-non-terminal' | 'unavailable';
    readonly captureHandleRef: string | null;
    readonly redactedLastRunHandle: string;
    readonly diagnosticsDeepLinks: readonly string[];
    readonly rawTerminalScrollbackRendered: false;
}

export interface MediatedRunEvidencePacket extends RunEvidenceEnvelope {
    readonly currentProfile: CurrentProfileEvidenceRef;
    readonly graphContext: GraphContextEvidenceRef;
    readonly sessionRuntime: SessionRuntimeEvidenceRef;
    readonly graphitiProtectedHandles: readonly GraphitiProtectedHandle[];
    readonly vaultRefs: readonly VaultEvidenceRef[];
    readonly semanticCandidates: SemanticCandidateEvidenceRef;
    readonly s5Refs: S5EvidenceRefs;
}

/**
 * Enforce the human-gate. Returns a typed error message when the requested
 * transition is blocked. The agentic UI calls this BEFORE dispatching
 * `s5'.review.submit` so it can refuse without a network round-trip; the
 * gateway also enforces the same rule (T8 verifies the parity).
 */
export function enforceHumanGate(transition: {
    decision: ReviewDecision;
    humanRequired: boolean;
    actorIsHuman: boolean;
    recursiveSelfReview?: boolean;
    actor?: AgenticActor;
}): { ok: true } | { ok: false; reason: string } {
    const gate = enforcePiReviewRoutingGate({
        decision: transition.decision,
        humanRequired: transition.humanRequired,
        actorIsHuman: transition.actorIsHuman,
        recursiveSelfReview: transition.recursiveSelfReview,
        actor: transition.actor
    });
    if (gate.ok) {
        return { ok: true };
    }
    return {
        ok: false,
        reason: gate.reason
    };
}

/**
 * Build a fresh evidence envelope from intent context + sampled bridge state.
 * The envelope's shape is what the M5 evidence pane consumes (Track 05 T4).
 */
export function buildEvidenceEnvelope(input: {
    candidateId: string;
    coordinate?: string | null;
    artifactUri?: string | null;
    sourceAnchor?: string | null;
    specAnchor?: string | null;
    codeAnchor?: string | null;
    testAnchor?: string | null;
    graphAnchor?: string | null;
    reviewId?: string | null;
    profileGeneration?: number | null;
    bridgeReadinessHandle?: string | null;
    sessionKey?: string | null;
    dayNowContext?: string | null;
    privacyClass?: string;
}): RunEvidenceEnvelope {
    return {
        candidateId: input.candidateId,
        coordinate: input.coordinate ?? null,
        artifactUri: input.artifactUri ?? null,
        sourceAnchor: input.sourceAnchor ?? null,
        specAnchor: input.specAnchor ?? null,
        codeAnchor: input.codeAnchor ?? null,
        testAnchor: input.testAnchor ?? null,
        graphAnchor: input.graphAnchor ?? null,
        reviewId: input.reviewId ?? null,
        profileGeneration: input.profileGeneration ?? null,
        bridgeReadinessHandle: input.bridgeReadinessHandle ?? null,
        sessionKey: input.sessionKey ?? null,
        dayNowContext: input.dayNowContext ?? null,
        privacyClass: input.privacyClass ?? 'safe-public-current-kernel-tick'
    };
}

const BASE_MEDIATION_CAPABILITIES = new Set<MediationCapabilityName>([
    'readCurrentProfile',
    'readPointerAnchor',
    'readGraphContext',
    'subscribeRunEvents',
    'invokeGatewayRpc',
    'depositReviewEvidence',
    'requestDryRunPromotion'
]);

const SEMANTIC_READ_CAPABILITIES = new Set<MediationCapabilityName>([
    's1.semantic.suggest_links',
    's1.semantic.neighbors_of',
    's1.semantic.search',
    's1.semantic.by_block'
]);

const HUMAN_FINAL_VAULT_CAPABILITIES = new Set<MediationCapabilityName>([
    's1.vault.write_file',
    's1.vault.move_file',
    's1.vault.rename_file',
    's1.vault.update_frontmatter'
]);

export function isMediationCapabilityAllowed(
    actor: AgenticActor,
    capability: MediationCapabilityName,
    context: { readonly userFinalValidated?: boolean } = {}
): CapabilityAllowResult {
    const normalizedActor = String(actor).toLowerCase();
    if (capability === 'directFsVaultWrite') {
        return {
            allowed: false,
            reason: 'direct filesystem vault writes are forbidden; route through Hen s1.vault.*'
        };
    }
    if (BASE_MEDIATION_CAPABILITIES.has(capability)) {
        return { allowed: true, reason: 'base mediated-run capability' };
    }
    if (
        SEMANTIC_READ_CAPABILITIES.has(capability) &&
        ['pi', 'anima', 'anansi', 'moirai', 'janus', 'mercurius', 'agora', 'zeithoven'].includes(normalizedActor)
    ) {
        return { allowed: true, reason: 'read-only S1 semantic capability' };
    }
    if (
        capability === 's1.vault.read_file' &&
        ['pi', 'anima', 'anansi', 'moirai', 'janus', 'mercurius', 'agora', 'zeithoven'].includes(normalizedActor)
    ) {
        return { allowed: true, reason: 'read-only S1 vault retrieval' };
    }
    if (capability === 's1.vault.append_block' && ['pi', 'human'].includes(normalizedActor)) {
        return { allowed: true, reason: 'bounded evidence-deposit draft capability' };
    }
    if (HUMAN_FINAL_VAULT_CAPABILITIES.has(capability)) {
        return context.userFinalValidated === true
            ? { allowed: true, reason: 'user-final validated vault mutation' }
            : {
                allowed: false,
                reason: 'canon-affecting vault mutations require user-final validation'
            };
    }
    return { allowed: false, reason: `capability ${capability} is not in the mediated-run allowlist` };
}

export function buildMediatedRunEvidencePacket(input: {
    candidateId: string;
    coordinate?: string | null;
    artifactUri?: string | null;
    specAnchor?: string | null;
    codeAnchor?: string | null;
    testAnchor?: string | null;
    currentProfile: CurrentProfileEvidenceRef;
    graphContext: GraphContextEvidenceRef;
    sessionRuntime: SessionRuntimeEvidenceRef;
    graphitiProtectedHandles?: readonly GraphitiProtectedHandle[];
    vaultRefs?: readonly VaultEvidenceRef[];
    semanticCandidates: SemanticCandidateEvidenceRef;
    s5Refs: S5EvidenceRefs;
    privacyClass?: string;
}): MediatedRunEvidencePacket {
    validateCurrentProfileRef(input.currentProfile);
    validateGraphContextRef(input.graphContext);
    validateSessionRuntimeRef(input.sessionRuntime);
    validateSemanticCandidateRef(input.semanticCandidates);
    validateS5Refs(input.s5Refs);

    const graphitiProtectedHandles = (input.graphitiProtectedHandles ?? []).map(handle =>
        sanitizeProtectedHandle(handle)
    );
    const vaultRefs = (input.vaultRefs ?? []).map(ref => validateVaultRef(ref));

    return {
        ...buildEvidenceEnvelope({
            candidateId: input.candidateId,
            coordinate: input.coordinate ?? input.graphContext.coordinate,
            artifactUri: input.artifactUri ?? null,
            sourceAnchor: input.currentProfile.profileHandle,
            specAnchor: input.specAnchor ?? null,
            codeAnchor: input.codeAnchor ?? null,
            testAnchor: input.testAnchor ?? input.s5Refs.persistedStoreDtoRef,
            graphAnchor: input.graphContext.graphAnchor,
            reviewId: input.s5Refs.reviewRef ?? input.s5Refs.candidateRef,
            profileGeneration: input.currentProfile.generation,
            bridgeReadinessHandle: input.currentProfile.profileHandle,
            sessionKey: input.sessionRuntime.sessionKey,
            dayNowContext: `${input.sessionRuntime.dayId}::${input.sessionRuntime.nowPath}`,
            privacyClass: input.privacyClass ?? 'safe-public-current-kernel-tick'
        }),
        currentProfile: input.currentProfile,
        graphContext: input.graphContext,
        sessionRuntime: input.sessionRuntime,
        graphitiProtectedHandles: Object.freeze(graphitiProtectedHandles),
        vaultRefs: Object.freeze(vaultRefs),
        semanticCandidates: input.semanticCandidates,
        s5Refs: input.s5Refs
    };
}

export function buildPiRuntimeMonitorProjection(input: {
    readonly portalTemporalSurface: PortalTemporalSurfaceContract;
    readonly resolvedSession: GatewayResolvedSessionSurface;
}): PiRuntimeMonitorProjection {
    const temporal = input.portalTemporalSurface;
    const session = input.resolvedSession;
    const terminalBinding = session.terminalBinding ?? null;
    const capturePolicy =
        terminalBinding?.capturePolicy ??
        session.runState?.capturePolicy ??
        session.capturePolicy ??
        (temporal.terminalCapturePolicyMode ? { mode: temporal.terminalCapturePolicyMode } : null);
    const sessionKey =
        firstNonBlank(session.canonicalKey, session.sessionKey, temporal.canonicalSessionKey, session.sessionId) ??
        'unresolved-session';
    const terminalBacked = Boolean(
        temporal.terminalBacked ||
        terminalBinding?.tmuxPaneId ||
        terminalBinding?.attachedSessionKey ||
        terminalBinding?.terminalIdentifier
    );
    const terminalProvider =
        firstNonBlank(terminalBinding?.provider, temporal.terminalProvider) ??
        (terminalBinding?.tmuxPaneId ? 'tmux' : 'none');
    const terminalStatus =
        firstNonBlank(terminalBinding?.terminalStatus, temporal.terminalStatus) ??
        (terminalBacked ? 'unknown' : 'unbound');
    const leaseExpires =
        stringifyMaybe(
            terminalBinding?.lease?.leaseExpiresAtMs ??
            terminalBinding?.leaseExpiresAtMs ??
            temporal.terminalLeaseExpiresAtMs
        ) ?? 'none';
    const captureHandleRef =
        firstNonBlank(
            terminalBinding?.captureHandleRef,
            session.runState?.captureHandleRef,
            session.captureHandleRef,
            temporal.terminalCaptureHandleRef
        ) ?? null;
    const redactedLastRunHandle = redactRunHandle(
        firstNonBlank(session.runState?.lastRunId, session.lastRunId)
    );

    return Object.freeze({
        sessionKey,
        activeAgent: firstNonBlank(session.activeAgentId, temporal.activeAgentId) ?? 'unknown-agent',
        role: firstNonBlank(session.teamRole, session.provider) ?? 'unassigned',
        teamChainLineage: Object.freeze(lineageForSession(session)),
        nowDayLink: nowDayLink(temporal, session),
        cmuxProjection: cmuxProjection(session),
        terminalProvider,
        terminalStatus,
        terminalBacked,
        leaseExpires,
        lastObservedTick: lastObservedTick(temporal, session),
        captureAvailability: captureAvailability(terminalBacked, capturePolicy, captureHandleRef),
        captureHandleRef,
        redactedLastRunHandle,
        diagnosticsDeepLinks: Object.freeze([
            `epi agent tmux inspect --session-key ${sessionKey}`,
            `techne_terminal_inspect session_key=${sessionKey}`
        ]),
        rawTerminalScrollbackRendered: false
    });
}

/** Required envelope fields per Track 05 T8 verification spec. */
export const REQUIRED_EVIDENCE_FIELDS = [
    'candidateId',
    'coordinate',
    'sourceAnchor',
    'graphAnchor',
    'reviewId',
    'testAnchor',
    'profileGeneration',
    'bridgeReadinessHandle',
    'sessionKey',
    'dayNowContext'
] as const;

export const REQUIRED_MEDIATED_EVIDENCE_FIELDS = [
    ...REQUIRED_EVIDENCE_FIELDS,
    'currentProfile',
    'graphContext',
    'sessionRuntime',
    'semanticCandidates',
    's5Refs'
] as const;

/**
 * Verify an envelope has the load-bearing fields populated. Used by tests +
 * the deposition UI to refuse a submit when context is missing. Returns the
 * list of missing field names; empty array means complete.
 */
export function missingEvidenceFields(envelope: RunEvidenceEnvelope): string[] {
    const missing: string[] = [];
    for (const field of REQUIRED_EVIDENCE_FIELDS) {
        if (envelope[field] === null || envelope[field] === undefined) {
            missing.push(field);
        }
    }
    return missing;
}

function validateCurrentProfileRef(ref: CurrentProfileEvidenceRef): void {
    if (ref.source !== 's0.current_profile') {
        throw new Error('currentProfile.source must be s0.current_profile');
    }
    if (!Number.isInteger(ref.generation) || ref.generation < 0) {
        throw new Error('currentProfile.generation must be a non-negative integer');
    }
    requireNonBlank(ref.profileHandle, 'currentProfile.profileHandle');
}

function validateGraphContextRef(ref: GraphContextEvidenceRef): void {
    if (ref.source !== 's2.graph_services') {
        throw new Error('graphContext.source must be s2.graph_services');
    }
    requireNonBlank(ref.namespace, 'graphContext.namespace');
    requireNonBlank(ref.coordinate, 'graphContext.coordinate');
    requireNonBlank(ref.graphAnchor, 'graphContext.graphAnchor');
}

function validateSessionRuntimeRef(ref: SessionRuntimeEvidenceRef): void {
    if (ref.source !== 's3.gateway') {
        throw new Error('sessionRuntime.source must be s3.gateway');
    }
    requireNonBlank(ref.sessionKey, 'sessionRuntime.sessionKey');
    requireNonBlank(ref.dayId, 'sessionRuntime.dayId');
    requireNonBlank(ref.nowPath, 'sessionRuntime.nowPath');
}

function validateSemanticCandidateRef(ref: SemanticCandidateEvidenceRef): void {
    if (ref.source !== 's1.semantic.suggest_links') {
        throw new Error('semanticCandidates.source must be s1.semantic.suggest_links');
    }
    if (ref.responseType !== 'LinkCandidateResponse') {
        throw new Error('semanticCandidates.responseType must be LinkCandidateResponse');
    }
    requireNonBlank(ref.requestRef, 'semanticCandidates.requestRef');
    if (ref.candidates.length === 0) {
        throw new Error('semanticCandidates.candidates must include at least one real candidate');
    }
    for (const candidate of ref.candidates) {
        requireNonBlank(candidate.target, 'semanticCandidates.candidate.target');
        requireNonBlank(candidate.sourceBlock, 'semanticCandidates.candidate.sourceBlock');
        if (typeof candidate.score !== 'number' || candidate.score < 0 || candidate.score > 1) {
            throw new Error('semanticCandidates.candidate.score must be between 0 and 1');
        }
    }
}

function validateS5Refs(ref: S5EvidenceRefs): void {
    if (ref.source !== 's5.persisted_store') {
        throw new Error('s5Refs.source must be s5.persisted_store');
    }
    requireNonBlank(ref.candidateRef, 's5Refs.candidateRef');
    requireNonBlank(ref.persistedStoreDtoRef, 's5Refs.persistedStoreDtoRef');
}

function firstNonBlank(...values: readonly (string | null | undefined)[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return null;
}

function stringifyMaybe(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    return String(value);
}

function lineageForSession(session: GatewayResolvedSessionSurface): string[] {
    const lineage = [
        session.orchestrationKind ? `kind:${session.orchestrationKind}` : null,
        session.teamId ? `team:${session.teamId}` : null,
        session.teamRole ? `role:${session.teamRole}` : null,
        session.parentSessionKey ? `parent:${session.parentSessionKey}` : null,
        session.sourceSessionKey ? `source:${session.sourceSessionKey}` : null,
        session.sourceSessionKind ? `source-kind:${session.sourceSessionKind}` : null,
        ...(session.subagentLineage ?? []).map(step => `lineage:${step}`)
    ];
    return lineage.filter((step): step is string => typeof step === 'string' && step.length > 0);
}

function nowDayLink(temporal: PortalTemporalSurfaceContract, session: GatewayResolvedSessionSurface): string {
    const day = firstNonBlank(temporal.dayId, session.dayId) ?? 'unknown-day';
    const now = firstNonBlank(temporal.nowWikilink, temporal.nowPath, session.vaultNowPath) ?? 'unknown-now';
    return `${day}::${now}`;
}

function cmuxProjection(session: GatewayResolvedSessionSurface): string {
    const workspace = firstNonBlank(session.cmuxWorkspace) ?? 'none';
    const surface = firstNonBlank(session.cmuxSurface) ?? 'none';
    const pane = firstNonBlank(session.cmuxPaneId) ?? 'none';
    return `${workspace}/${surface}/${pane}`;
}

function lastObservedTick(
    temporal: PortalTemporalSurfaceContract,
    session: GatewayResolvedSessionSurface
): string {
    const generation = stringifyMaybe(temporal.kernelGeneration ?? temporal.generation);
    const subTick = stringifyMaybe(temporal.kernelSubTick);
    if (generation && subTick) {
        return `kernel:${generation}.${subTick}`;
    }
    if (generation) {
        return `kernel:${generation}`;
    }
    return stringifyMaybe(session.updatedAtMs) ?? 'unobserved';
}

function captureAvailability(
    terminalBacked: boolean,
    policy: TerminalObservabilityCapturePolicy | null,
    captureHandleRef: string | null
): PiRuntimeMonitorProjection['captureAvailability'] {
    const mode = policy?.mode ?? 'metadataOnly';
    if (terminalBacked && mode !== 'metadataOnly' && captureHandleRef !== null) {
        return 'bounded-capture-available';
    }
    if (!terminalBacked && mode !== 'metadataOnly' && captureHandleRef !== null) {
        return 'captured-non-terminal';
    }
    if (terminalBacked) {
        return 'metadata-only';
    }
    return 'unavailable';
}

function redactRunHandle(value: string | null): string {
    if (value === null) {
        return 'none';
    }
    if (value.length <= 12) {
        return `${value.slice(0, 4)}...`;
    }
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function sanitizeProtectedHandle(ref: GraphitiProtectedHandle): GraphitiProtectedHandle {
    const raw = ref as unknown as Record<string, unknown>;
    for (const forbidden of ['body', 'rawBody', 'protectedBody', 'content', 'text', 'payload']) {
        if (Object.prototype.hasOwnProperty.call(raw, forbidden)) {
            throw new Error('protected Graphiti/Nara body fields are not permitted in mediated evidence');
        }
    }
    requireNonBlank(ref.handle, 'graphitiProtectedHandle.handle');
    requireNonBlank(ref.namespace, 'graphitiProtectedHandle.namespace');
    requireNonBlank(ref.privacyClass, 'graphitiProtectedHandle.privacyClass');
    return Object.freeze({
        handle: ref.handle,
        namespace: ref.namespace,
        privacyClass: ref.privacyClass,
        summary: ref.summary
    });
}

function validateVaultRef(ref: VaultEvidenceRef): VaultEvidenceRef {
    requireNonBlank(ref.method, 'vaultRef.method');
    requireNonBlank(ref.uri, 'vaultRef.uri');
    const gate = isMediationCapabilityAllowed('pi', ref.capability);
    if (!gate.allowed && ref.governance !== 'human_required') {
        throw new Error(`vaultRef capability ${ref.capability} is not allowed for mediated evidence: ${gate.reason}`);
    }
    return Object.freeze({ ...ref });
}

function requireNonBlank(value: string, field: string): void {
    if (value.trim().length === 0) {
        throw new Error(`${field} is required`);
    }
}
