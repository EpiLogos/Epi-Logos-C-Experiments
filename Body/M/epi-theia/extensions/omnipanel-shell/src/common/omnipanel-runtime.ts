import { enforcePiReviewRoutingGate } from '@pratibimba/m-extension-runtime/lib/common/recursive-self-review-gate';
import {
    OMNIPANEL_DEFAULT_TAB,
    OMNIPANEL_TABS,
    type OmniPanelManifest,
    type OmniPanelLayoutId,
    type OmniPanelState,
    type OmniPanelTab,
    type OmniPanelTabId
} from './omnipanel-types';

export type ToolStreamPrivacyClass = 'public' | 'protected' | 'protected-local' | 'private' | string;

export interface ProtectedHandleMetadata {
    readonly handle: string;
    readonly namespace: string;
    readonly privacyClass: string;
    readonly summary?: string | null;
}

export interface ToolStreamEvent {
    readonly id: string;
    readonly emittedAtMs: number | null;
    readonly tool: string;
    readonly kind: 'tool.start' | 'tool.partial' | 'tool.end' | 'tool.error' | 'route.start' | 'route.end' | string;
    readonly payload?: unknown;
    readonly privacyClass?: ToolStreamPrivacyClass | null;
    readonly actor: string;
    readonly dispatchNodeId: string;
    readonly sessionKey: string | null;
    readonly tickAtEmit: number | null;
    readonly inputDigest?: string | null;
    readonly outputDigest?: string | null;
    readonly latencyMs?: number | null;
    readonly evidencePacketRef?: string | null;
    readonly args?: unknown;
    readonly result?: unknown;
    readonly error?: unknown;
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

export function sanitizeProtectedHandle(ref: unknown): ProtectedHandleMetadata {
    const raw = isRuntimeRecord(ref) ? ref : {};
    return Object.freeze({
        handle: runtimeString(raw.handle) ?? 'protected-handle',
        namespace: runtimeString(raw.namespace) ?? 'protected-local',
        privacyClass: runtimeString(raw.privacyClass) ?? 'protected',
        summary: runtimeString(raw.summary) ?? null
    });
}

export function collapseOmniPanelManifest(
    declaredTabs: readonly OmniPanelTab[] = OMNIPANEL_TABS,
    requestedDefaultTab: string = OMNIPANEL_DEFAULT_TAB,
    activeLayout?: OmniPanelLayoutId | null
): OmniPanelManifest {
    const byId = new Map<string, OmniPanelTab>();
    for (const tab of filterOmniPanelTabsForLayout(declaredTabs, activeLayout)) {
        validateTab(tab);
        byId.set(tab.id, tab);
    }

    const tabs = [...byId.values()].sort((left, right) => {
        const priorityDelta = left.priority - right.priority;
        return priorityDelta === 0 ? left.id.localeCompare(right.id) : priorityDelta;
    });

    if (tabs.length === 0) {
        throw new Error('OmniPanel manifest must declare at least one tab.');
    }

    return Object.freeze({
        tabs: Object.freeze(tabs),
        defaultTab: resolveDefaultTab({ tabs, defaultTab: requestedDefaultTab }, requestedDefaultTab)
    });
}

export function filterOmniPanelTabsForLayout(
    declaredTabs: readonly OmniPanelTab[] = OMNIPANEL_TABS,
    activeLayout?: OmniPanelLayoutId | null
): readonly OmniPanelTab[] {
    if (activeLayout !== 'daily-0-1' && activeLayout !== 'ide-deep') {
        return Object.freeze([...declaredTabs]);
    }
    return Object.freeze(
        declaredTabs.filter(tab => tab.availableInLayouts.includes(activeLayout))
    );
}

export function resolveDefaultTab(
    manifest: OmniPanelManifest,
    requestedDefaultTab: string = manifest.defaultTab
): string {
    const requested = manifest.tabs.find(tab => tab.id === requestedDefaultTab);
    if (requested) {
        return requested.id;
    }
    const manifestDefault = manifest.tabs.find(tab => tab.id === manifest.defaultTab);
    return manifestDefault?.id ?? manifest.tabs[0]?.id ?? OMNIPANEL_DEFAULT_TAB;
}

export function createOmniPanelState(
    manifest: OmniPanelManifest,
    initialState: Partial<OmniPanelState> = {}
): OmniPanelState {
    const activeTab = isKnownTab(manifest, initialState.activeTab)
        ? initialState.activeTab
        : resolveDefaultTab(manifest);

    return Object.freeze({
        activeTab,
        collapsed: initialState.collapsed ?? false
    });
}

export function activateOmniPanelTab(
    state: OmniPanelState,
    manifest: OmniPanelManifest,
    tabId: string
): OmniPanelState {
    assertKnownTab(manifest, tabId);
    return Object.freeze({
        ...state,
        activeTab: tabId,
        collapsed: false
    });
}

export function deactivateOmniPanelTab(
    state: OmniPanelState,
    manifest: OmniPanelManifest
): OmniPanelState {
    return Object.freeze({
        ...state,
        activeTab: resolveDefaultTab(manifest)
    });
}

export function toggleOmniPanelCollapse(state: OmniPanelState): OmniPanelState {
    return Object.freeze({
        ...state,
        collapsed: !state.collapsed
    });
}

export function isOmniPanelTabId(tabId: string): tabId is OmniPanelTabId {
    return OMNIPANEL_TABS.some(tab => tab.id === tabId);
}

export function findOmniPanelTab(
    manifest: OmniPanelManifest,
    tabId: string
): OmniPanelTab | undefined {
    return manifest.tabs.find(tab => tab.id === tabId);
}

function isKnownTab(manifest: OmniPanelManifest, tabId: string | undefined): tabId is OmniPanelTabId {
    return typeof tabId === 'string' && manifest.tabs.some(tab => tab.id === tabId);
}

function assertKnownTab(manifest: OmniPanelManifest, tabId: string): void {
    if (!isKnownTab(manifest, tabId)) {
        const ids = manifest.tabs.map(tab => tab.id).join(', ');
        throw new Error(`Unknown OmniPanel tab "${tabId}". Expected one of: ${ids}`);
    }
}

function validateTab(tab: OmniPanelTab): void {
    if (!tab.id || !tab.label || !tab.icon || !tab.extensionId) {
        throw new Error('OmniPanel tab declarations require id, label, icon, and extensionId.');
    }
    if (!Array.isArray(tab.availableInLayouts) || tab.availableInLayouts.length === 0) {
        throw new Error(`OmniPanel tab "${tab.id}" must declare availableInLayouts.`);
    }
    if (!Number.isFinite(tab.priority)) {
        throw new Error(`OmniPanel tab "${tab.id}" has an invalid priority.`);
    }
}

function isRuntimeRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function runtimeString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
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

// ============================================================================
// Review domain — Track 27 T27.6 (the human-required gate landing surface).
//
// The `review` OmniPanel tab is the S5 `s5'.review.*` mediation surface. These
// contracts mirror the ide-shell-m0-m5 `ReviewPaneWidget.ReviewItem` shape (so
// the two layouts stay in cross-layout sync) and extend it with the deep
// fields the OmniPanel landing surface renders: IOD-17 three-way parity,
// privacy class, dispatch genealogy + evidence anchors, and the chronological
// transition history fed from `s5'.review.history`.
//
// The human-gate (`enforceHumanGate`) wraps the canonical
// `enforcePiReviewRoutingGate` so the OmniPanel refuses an agent-driven applied
// verdict on a `humanRequired` item BEFORE any gateway round-trip; the gateway
// enforces the same rule (T8 parity). `assertCapabilityParity` is the IOD-17
// matrix ↔ UI ↔ gateway bijection assertion, re-homed here so the review
// surface shares one parity primitive with the Agentic Control Room.
// ============================================================================

export type ReviewDecision = 'approve' | 'reject' | 'revise' | 'defer' | 'annotate';

export type ReviewStatus =
    | 'pending'
    | 'in-review'
    | 'approved'
    | 'rejected'
    | 'revised'
    | 'deferred'
    | string;

export type ReviewPrivacyClass =
    | 'public'
    | 'protected'
    | 'protected-local'
    | 'private'
    | string;

/**
 * IOD-17 three-way parity state for a single review item. The three cells are
 * the capability-matrix state, the agent-contract state, and the live widget
 * state; `inParity` is the bijection result. When `inParity` is false the
 * readout shows a red drift banner and committal verdicts are blocked.
 */
export interface IOD17Parity {
    readonly inParity: boolean;
    readonly capabilityMatrixState: string;
    readonly agentContractState: string;
    readonly widgetState: string;
    readonly drift?: readonly string[];
}

/**
 * Inbox-row shape. Structurally compatible with the ide-shell
 * `ReviewPaneWidget.ReviewItem` (id/title/status/humanRequired/privacyClass)
 * so a row dispatched from either layout addresses the same item.
 */
export interface ReviewItem {
    readonly id: string;
    readonly title: string;
    readonly status: ReviewStatus;
    readonly humanRequired: boolean;
    readonly reviewerRequired?: boolean;
    readonly recursiveSelfReview?: boolean;
    readonly actor?: string;
    readonly mediator?: string | null;
    readonly privacyClass?: ReviewPrivacyClass;
    readonly originatingDispatchNodeId?: string | null;
    readonly evidencePacketRef?: string | null;
    readonly iod17Parity?: IOD17Parity | null;
    readonly depositedAtMs?: number | null;
    readonly sessionKey?: string | null;
    readonly coordinate?: string;
    readonly summary?: string;
}

/**
 * Right-pane detail shape. Adds the load-bearing deep fields the landing
 * surface renders: a guaranteed IOD-17 parity readout, privacy class,
 * deposition timestamp, session key, and DAY/NOW context, plus the optional
 * embedded evidence + dispatch genealogy anchors and the transition history.
 */
export interface ReviewItemDeep extends ReviewItem {
    readonly iod17Parity: IOD17Parity;
    readonly privacyClass: ReviewPrivacyClass;
    readonly depositedAtMs: number | null;
    readonly sessionKey: string | null;
    readonly dayNowContext: string | null;
    readonly reason?: string | null;
    readonly evidence?: ReviewEvidenceEmbed | null;
    readonly genealogy?: ReviewGenealogyEmbed | null;
    readonly history?: readonly ReviewHistoryEntry[];
}

/** Compact, read-only projection of the Tranche 27.5 EvidencePacketView. */
export interface ReviewEvidenceEmbed {
    readonly packetRef: string | null;
    readonly verdict?: string | null;
    readonly verificationState?: 'verified' | 'pending' | 'failed' | string;
    readonly summary?: string | null;
    readonly privacyClass?: ReviewPrivacyClass;
    readonly sourcePaths?: readonly string[];
}

/** Compact, read-only projection of the Tranche 27.3 DispatchTraceMiniGraph. */
export interface ReviewGenealogyEmbed {
    readonly originatingNodeId: string | null;
    readonly chain: readonly ReviewGenealogyNode[];
}

export interface ReviewGenealogyNode {
    readonly id: string;
    readonly label: string;
    readonly role?: string | null;
    readonly status?: string | null;
}

/** A single transition record from `s5'.review.history`. */
export interface ReviewHistoryEntry {
    readonly id: string;
    readonly reviewId: string;
    readonly fromStatus: string | null;
    readonly toStatus: string;
    readonly decision: ReviewDecision | string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly reason?: string | null;
    readonly transitionAtMs: number | null;
}

/** A requested verdict, submitted via `s5'.review.submit`. */
export interface ReviewTransition {
    readonly reviewId: string;
    readonly decision: ReviewDecision;
    readonly reason: string;
    readonly actor: string;
    readonly actorIsHuman: boolean;
    readonly humanRequired: boolean;
    readonly recursiveSelfReview?: boolean;
    readonly transitionAtMs: number;
}

export interface ReviewSubmitResult {
    readonly ok: boolean;
    readonly reviewId: string;
    readonly status?: ReviewStatus;
    readonly blockedReason?: string | null;
}

export interface ReviewInboxFilter {
    readonly sessionKey?: string | null;
    readonly mediator?: string | null;
    readonly status?: ReviewStatus | null;
    readonly outstandingOnly?: boolean;
}

/** Persisted per-tab state for the `review` OmniPanel tab. */
export interface ReviewSessionTabState {
    readonly selectedReviewId: string | null;
    readonly filters: ReviewInboxFilter;
    readonly scrollOffset: number;
    readonly reviseFormOpen: boolean;
    readonly annotateDraft?: string;
}

export interface ParityAssertResult {
    readonly equal: boolean;
    readonly missingFromUi: readonly string[];
    readonly missingFromGateway: readonly string[];
}

export interface GateCheckResult {
    readonly ok: boolean;
    readonly humanRequired: boolean;
    readonly parityInSync: boolean;
    readonly reason: string | null;
}

/** Approve / reject / revise commit a verdict; defer / annotate never do. */
export function isCommittalReviewDecision(decision: ReviewDecision): boolean {
    return decision === 'approve' || decision === 'reject' || decision === 'revise';
}

/**
 * Enforce the human-gate for a requested review transition. Returns a typed
 * refusal when an agent attempts an applied verdict on a `humanRequired` (or
 * recursive-self-review) item. Defer / annotate are always permitted because
 * they record state without committing a verdict.
 */
export function enforceHumanGate(transition: {
    readonly decision: ReviewDecision;
    readonly humanRequired: boolean;
    readonly actorIsHuman: boolean;
    readonly recursiveSelfReview?: boolean;
    readonly actor?: string | null;
}): { ok: true } | { ok: false; reason: string } {
    const gate = enforcePiReviewRoutingGate({
        decision: transition.decision,
        humanRequired: transition.humanRequired,
        actorIsHuman: transition.actorIsHuman,
        recursiveSelfReview: transition.recursiveSelfReview,
        actor: transition.actor ?? undefined
    });
    if (gate.ok) {
        return { ok: true };
    }
    const reason = 'reason' in gate ? gate.reason : 'human-gate enforced for human-required review item.';
    return { ok: false, reason };
}

/**
 * IOD-17 parity bijection: the capability set the UI exposes MUST match the
 * gateway-enforced set. Re-homed from the Agentic Control Room so the review
 * surface and the control room share one assertion.
 */
export function assertCapabilityParity(
    matrixToolNames: readonly string[],
    gatewayToolNames: readonly string[]
): ParityAssertResult {
    const matrixSet = new Set(matrixToolNames);
    const gatewaySet = new Set(gatewayToolNames);
    const missingFromUi: string[] = [];
    const missingFromGateway: string[] = [];
    for (const name of gatewaySet) {
        if (!matrixSet.has(name)) {
            missingFromUi.push(name);
        }
    }
    for (const name of matrixSet) {
        if (!gatewaySet.has(name)) {
            missingFromGateway.push(name);
        }
    }
    return Object.freeze({
        equal: missingFromUi.length === 0 && missingFromGateway.length === 0,
        missingFromUi: Object.freeze(missingFromUi),
        missingFromGateway: Object.freeze(missingFromGateway)
    });
}

/**
 * Combined gate check used by the review landing surface: wraps
 * `enforceHumanGate` (human-required routing) and the IOD-17 parity state.
 * A committal verdict requires BOTH the human-gate satisfied AND the item in
 * three-way parity. Non-committal decisions (defer / annotate) always pass.
 */
export function checkReviewGate(
    item: Pick<ReviewItemDeep, 'humanRequired' | 'recursiveSelfReview' | 'actor' | 'iod17Parity'>,
    decision: ReviewDecision,
    actorIsHuman: boolean
): GateCheckResult {
    const parityInSync = item.iod17Parity?.inParity !== false;
    if (!isCommittalReviewDecision(decision)) {
        return Object.freeze({ ok: true, humanRequired: item.humanRequired, parityInSync, reason: null });
    }
    const humanGate = enforceHumanGate({
        decision,
        humanRequired: item.humanRequired,
        actorIsHuman,
        recursiveSelfReview: item.recursiveSelfReview,
        actor: item.actor ?? null
    });
    if (!humanGate.ok) {
        const reason = 'reason' in humanGate ? humanGate.reason : 'human-gate enforced.';
        return Object.freeze({ ok: false, humanRequired: item.humanRequired, parityInSync, reason });
    }
    if (!parityInSync) {
        return Object.freeze({
            ok: false,
            humanRequired: item.humanRequired,
            parityInSync,
            reason: 'IOD-17 parity drift: capability-matrix, agent-contract, and widget states disagree; resolve drift before an applied verdict.'
        });
    }
    return Object.freeze({ ok: true, humanRequired: item.humanRequired, parityInSync, reason: null });
}

const REVIEW_DECISIONS: readonly ReviewDecision[] = Object.freeze([
    'approve',
    'reject',
    'revise',
    'defer',
    'annotate'
]);

/** Normalize an arbitrary record into a `ReviewSessionTabState`. */
export function normalizeReviewSessionTabState(value: unknown): ReviewSessionTabState {
    const raw = isRuntimeRecord(value) ? value : {};
    return Object.freeze({
        selectedReviewId: runtimeString(raw.selectedReviewId),
        filters: isRuntimeRecord(raw.filters) ? { ...(raw.filters as ReviewInboxFilter) } : {},
        scrollOffset:
            typeof raw.scrollOffset === 'number' && Number.isFinite(raw.scrollOffset) && raw.scrollOffset >= 0
                ? raw.scrollOffset
                : 0,
        reviseFormOpen: raw.reviseFormOpen === true,
        ...(runtimeString(raw.annotateDraft) ? { annotateDraft: raw.annotateDraft as string } : {})
    });
}

/** Coerce an untyped payload into a `ReviewItem` (defensive inbox parsing). */
export function normalizeReviewItem(value: unknown): ReviewItem | null {
    if (!isRuntimeRecord(value)) {
        return null;
    }
    const id = runtimeString(value.id);
    if (!id) {
        return null;
    }
    return Object.freeze({
        id,
        title: runtimeString(value.title) ?? id,
        status: runtimeString(value.status) ?? 'pending',
        humanRequired: value.humanRequired === true,
        reviewerRequired: value.reviewerRequired === true,
        recursiveSelfReview: value.recursiveSelfReview === true,
        actor: runtimeString(value.actor) ?? undefined,
        mediator: runtimeString(value.mediator),
        privacyClass: runtimeString(value.privacyClass) ?? 'public',
        originatingDispatchNodeId:
            runtimeString(value.originatingDispatchNodeId) ?? runtimeString(value.dispatchNodeId),
        evidencePacketRef: runtimeString(value.evidencePacketRef) ?? runtimeString(value.evidenceRef),
        iod17Parity: normalizeIod17Parity(value.iod17Parity),
        depositedAtMs:
            typeof value.depositedAtMs === 'number' && Number.isFinite(value.depositedAtMs)
                ? value.depositedAtMs
                : null,
        sessionKey: runtimeString(value.sessionKey),
        coordinate: runtimeString(value.coordinate) ?? undefined,
        summary: runtimeString(value.summary) ?? undefined
    });
}

export function normalizeIod17Parity(value: unknown): IOD17Parity | null {
    if (!isRuntimeRecord(value)) {
        return null;
    }
    const drift = Array.isArray(value.drift)
        ? value.drift.filter((entry): entry is string => typeof entry === 'string')
        : undefined;
    return Object.freeze({
        inParity: value.inParity !== false,
        capabilityMatrixState: runtimeString(value.capabilityMatrixState) ?? 'unknown',
        agentContractState: runtimeString(value.agentContractState) ?? 'unknown',
        widgetState: runtimeString(value.widgetState) ?? 'unknown',
        ...(drift ? { drift: Object.freeze(drift) } : {})
    });
}

export function isReviewDecision(value: unknown): value is ReviewDecision {
    return typeof value === 'string' && (REVIEW_DECISIONS as readonly string[]).includes(value);
}
