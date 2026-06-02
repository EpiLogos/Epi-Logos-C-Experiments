import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from './index';

export const M5_EPII_CONTRACT_VERSION = '2026-06-01.05-T6.07-T8';

export type ReviewStatus = 'open' | 'deferred' | 'resolved';
export type ReviewDisposition =
    | 'defer'
    | 'summarize'
    | 'deposit-evidence'
    | 'request-dry-run-promotion'
    | 'approve'
    | 'reject'
    | 'revise'
    | 'promote'
    | 'weaken-gate';

export type GovernanceCategory =
    | 'routine'
    | 'human-required'
    | 'recursive-self-modification'
    | 'protected-personal-corpus'
    | 'canon-publication';

export interface ArtifactUri {
    readonly scheme:
        | 'vault'
        | 'repo'
        | 'graph'
        | 'gnosis'
        | 'etymology'
        | 'pratibimba'
        | 'run'
        | 'review'
        | 'improvement';
    readonly uri: string;
    readonly namespace?: string;
}

export interface S5ReviewItem {
    readonly reviewItemHandle: string;
    readonly status: ReviewStatus;
    readonly title: string;
    readonly governanceCategory: GovernanceCategory;
    readonly humanRequired: boolean;
    readonly recursiveModification: boolean;
    readonly promotionDestination: ArtifactUri | null;
    readonly dryRunPlanHandle: string | null;
    readonly evidenceHandles: readonly string[];
    readonly artifactRefs: readonly ArtifactUri[];
    readonly protectedBodyHandles: readonly string[];
    readonly protectedBodySummary: string | null;
    readonly createdAt: string;
    readonly resolvedAt?: string;
}

export interface S5ImprovementRun {
    readonly improvementRunHandle: string;
    readonly reviewItemHandle: string;
    readonly status: 'queued' | 'running' | 'kept' | 'discarded';
    readonly direction: string;
    readonly evidenceHandles: readonly string[];
    readonly effectVerificationSchedule: readonly string[];
    readonly createdAt: string;
}

export interface S5SpineState {
    readonly routingConfigurationHandle: string;
    readonly activeCandidates: readonly string[];
    readonly routeQueues: Readonly<Record<string, readonly string[]>>;
    readonly orchestrationStates: readonly string[];
    readonly continuityHints: readonly string[];
    readonly metaLoopEvents: readonly string[];
    readonly effectVerificationSchedules: readonly string[];
    readonly recentSpineRefinements: readonly string[];
}

export interface DryRunPromotionPlan {
    readonly promotionPlanHandle: string;
    readonly reviewItemHandle: string;
    readonly improvementRunHandle: string;
    readonly dryRun: true;
    readonly destination: ArtifactUri;
    readonly compilePlanHandles: readonly string[];
    readonly rollbackHandle: string;
    readonly nonDryRunBlockedReason: string;
}

export interface VakEvidenceDeposit {
    readonly evidenceHandle: string;
    readonly reviewItemHandle: string;
    readonly cpf: string;
    readonly ct: string;
    readonly cp: string;
    readonly cf: string;
    readonly cfp: string;
    readonly cs: string;
    readonly sessionHandle: string;
    readonly dayHandle: string;
    readonly nowHandle: string;
    readonly sourceRefs: readonly ArtifactUri[];
    readonly changedArtifactRefs: readonly ArtifactUri[];
    readonly testOutputHandles: readonly string[];
}

export interface S5ReviewSnapshot {
    readonly contractVersion: typeof M5_EPII_CONTRACT_VERSION;
    readonly reviewItems: readonly S5ReviewItem[];
    readonly improvementRuns: readonly S5ImprovementRun[];
    readonly dryRunPlans: readonly DryRunPromotionPlan[];
    readonly evidenceDeposits: readonly VakEvidenceDeposit[];
    readonly spineState: S5SpineState;
}

export interface M5EpiiSurfaceInput {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly emittedAt: number;
    readonly snapshot?: S5ReviewSnapshot;
}

export interface M5EpiiSurface {
    readonly contractVersion: typeof M5_EPII_CONTRACT_VERSION;
    readonly extensionId: typeof EXTENSION_ID;
    readonly profileGeneration: number;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly reviewWorkbench: Readonly<Record<string, unknown>>;
    readonly spineInspector: Readonly<Record<string, unknown>>;
    readonly canonEvolutionBrowser: readonly ArtifactUri[];
    readonly recursiveGateRows: readonly Readonly<Record<string, unknown>>[];
    readonly pendingFields: readonly string[];
    readonly readiness: {
        readonly state: MExtensionReadinessState;
        readonly surfaceReady: boolean;
        readonly blockers: readonly string[];
    };
    readonly observabilityEvents: readonly MObservabilityEvent[];
}

export async function createS5ReviewItem(input: {
    readonly storeRoot: string;
    readonly title: string;
    readonly governanceCategory: GovernanceCategory;
    readonly humanRequired?: boolean;
    readonly recursiveModification?: boolean;
    readonly promotionDestination?: string | null;
    readonly evidenceHandles?: readonly string[];
    readonly artifactRefs?: readonly string[];
    readonly protectedBodyHandles?: readonly string[];
    readonly protectedBodySummary?: string | null;
    readonly createdAt?: string;
}): Promise<S5ReviewItem> {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const reviewItemHandle = `review://${stableId(`${input.title}:${createdAt}`)}`;
    const item: S5ReviewItem = Object.freeze({
        reviewItemHandle,
        status: 'open',
        title: input.title,
        governanceCategory: input.governanceCategory,
        humanRequired:
            input.humanRequired ??
            ['human-required', 'recursive-self-modification', 'protected-personal-corpus', 'canon-publication']
                .includes(input.governanceCategory),
        recursiveModification: input.recursiveModification ?? input.governanceCategory === 'recursive-self-modification',
        promotionDestination: input.promotionDestination ? parseArtifactUri(input.promotionDestination) : null,
        dryRunPlanHandle: null,
        evidenceHandles: Object.freeze([...(input.evidenceHandles ?? [])]),
        artifactRefs: Object.freeze((input.artifactRefs ?? []).map(parseArtifactUri)),
        protectedBodyHandles: Object.freeze([...(input.protectedBodyHandles ?? [])]),
        protectedBodySummary: input.protectedBodySummary ?? null,
        createdAt
    });
    await writeJson(input.storeRoot, 'review-items', handleFileName(reviewItemHandle), item);
    return item;
}

export async function createImprovementRun(input: {
    readonly storeRoot: string;
    readonly reviewItemHandle: string;
    readonly direction: string;
    readonly evidenceHandles?: readonly string[];
    readonly effectVerificationSchedule?: readonly string[];
    readonly createdAt?: string;
}): Promise<S5ImprovementRun> {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const run: S5ImprovementRun = Object.freeze({
        improvementRunHandle: `improvement://${stableId(`${input.reviewItemHandle}:${input.direction}:${createdAt}`)}`,
        reviewItemHandle: input.reviewItemHandle,
        status: 'kept',
        direction: input.direction,
        evidenceHandles: Object.freeze([...(input.evidenceHandles ?? [])]),
        effectVerificationSchedule: Object.freeze([...(input.effectVerificationSchedule ?? [])]),
        createdAt
    });
    await writeJson(input.storeRoot, 'improvement-runs', handleFileName(run.improvementRunHandle), run);
    return run;
}

export async function requestDryRunPromotion(input: {
    readonly storeRoot: string;
    readonly reviewItemHandle: string;
    readonly improvementRunHandle: string;
    readonly destination: string;
    readonly compilePlanHandles: readonly string[];
    readonly rollbackHandle: string;
    readonly dryRun: boolean;
}): Promise<DryRunPromotionPlan> {
    if (!input.dryRun) {
        throw new Error('non-dry-run promotion is blocked until compiler mutation law exists');
    }
    const destination = parseArtifactUri(input.destination);
    const plan: DryRunPromotionPlan = Object.freeze({
        promotionPlanHandle: `run://dry-promotion/${stableId(`${input.reviewItemHandle}:${input.improvementRunHandle}:${input.destination}`)}`,
        reviewItemHandle: input.reviewItemHandle,
        improvementRunHandle: input.improvementRunHandle,
        dryRun: true,
        destination,
        compilePlanHandles: Object.freeze([...input.compilePlanHandles]),
        rollbackHandle: input.rollbackHandle,
        nonDryRunBlockedReason: 'compiler-mutation-law-not-wired'
    });
    await writeJson(input.storeRoot, 'dry-run-plans', handleFileName(plan.promotionPlanHandle), plan);
    await patchReviewItem(input.storeRoot, input.reviewItemHandle, {
        dryRunPlanHandle: plan.promotionPlanHandle
    });
    return plan;
}

export async function resolveReviewItem(input: {
    readonly storeRoot: string;
    readonly reviewItemHandle: string;
    readonly disposition: ReviewDisposition;
    readonly actorKind: 'agent' | 'human';
    readonly resolvedAt?: string;
}): Promise<S5ReviewItem> {
    const item = await readReviewItem(input.storeRoot, input.reviewItemHandle);
    enforceReviewDisposition(item, input.disposition, input.actorKind);
    const status: ReviewStatus = input.disposition === 'defer' ? 'deferred' : 'resolved';
    return patchReviewItem(input.storeRoot, input.reviewItemHandle, {
        status,
        resolvedAt: input.resolvedAt ?? new Date().toISOString()
    });
}

export async function depositVakCompletionEvidence(input: {
    readonly storeRoot: string;
    readonly reviewItemHandle: string;
    readonly cpf: string;
    readonly ct: string;
    readonly cp: string;
    readonly cf: string;
    readonly cfp: string;
    readonly cs: string;
    readonly sessionHandle: string;
    readonly dayHandle: string;
    readonly nowHandle: string;
    readonly sourceRefs: readonly string[];
    readonly changedArtifactRefs: readonly string[];
    readonly testOutputHandles: readonly string[];
}): Promise<VakEvidenceDeposit> {
    const deposit: VakEvidenceDeposit = Object.freeze({
        evidenceHandle: `review://evidence/${stableId(`${input.reviewItemHandle}:${input.nowHandle}:${input.testOutputHandles.join('|')}`)}`,
        reviewItemHandle: input.reviewItemHandle,
        cpf: input.cpf,
        ct: input.ct,
        cp: input.cp,
        cf: input.cf,
        cfp: input.cfp,
        cs: input.cs,
        sessionHandle: input.sessionHandle,
        dayHandle: input.dayHandle,
        nowHandle: input.nowHandle,
        sourceRefs: Object.freeze(input.sourceRefs.map(parseArtifactUri)),
        changedArtifactRefs: Object.freeze(input.changedArtifactRefs.map(parseArtifactUri)),
        testOutputHandles: Object.freeze([...input.testOutputHandles])
    });
    await writeJson(input.storeRoot, 'evidence', handleFileName(deposit.evidenceHandle), deposit);
    return deposit;
}

export async function readS5ReviewSnapshot(input: { readonly storeRoot: string }): Promise<S5ReviewSnapshot> {
    const reviewItems = await readJsonDir<S5ReviewItem>(input.storeRoot, 'review-items');
    const improvementRuns = await readJsonDir<S5ImprovementRun>(input.storeRoot, 'improvement-runs');
    const dryRunPlans = await readJsonDir<DryRunPromotionPlan>(input.storeRoot, 'dry-run-plans');
    const evidenceDeposits = await readJsonDir<VakEvidenceDeposit>(input.storeRoot, 'evidence');
    const spineState = buildSpineState(reviewItems, improvementRuns);
    return Object.freeze({
        contractVersion: M5_EPII_CONTRACT_VERSION,
        reviewItems: Object.freeze(reviewItems),
        improvementRuns: Object.freeze(improvementRuns),
        dryRunPlans: Object.freeze(dryRunPlans),
        evidenceDeposits: Object.freeze(evidenceDeposits),
        spineState
    });
}

export function buildM5EpiiSurface(input: M5EpiiSurfaceInput): M5EpiiSurface {
    const snapshot =
        input.snapshot ?? objectValue(input.profile.payload.m5EpiiReviewSnapshot) as S5ReviewSnapshot | undefined;
    const pendingFields = snapshot ? [] : ['m5EpiiReviewSnapshot'];
    const blockers = snapshot ? [] : ['Track 04 S5 review/autoresearch snapshot unavailable'];
    const reviewWorkbench = freezeRecord({
        open: snapshot?.reviewItems.filter(item => item.status === 'open').length ?? 0,
        deferred: snapshot?.reviewItems.filter(item => item.status === 'deferred').length ?? 0,
        resolved: snapshot?.reviewItems.filter(item => item.status === 'resolved').length ?? 0,
        humanRequired: snapshot?.reviewItems.filter(item => item.humanRequired).length ?? 0,
        dryRunPlans: snapshot?.dryRunPlans.length ?? 0,
        evidenceDeposits: snapshot?.evidenceDeposits.length ?? 0,
        reviewItems: (snapshot?.reviewItems ?? []).map(toReviewRow)
    });
    const artifactRefs = uniqueArtifactUris([
        ...(snapshot?.reviewItems.flatMap(item => item.artifactRefs) ?? []),
        ...(snapshot?.dryRunPlans.map(plan => plan.destination) ?? []),
        ...(snapshot?.evidenceDeposits.flatMap(deposit => [...deposit.sourceRefs, ...deposit.changedArtifactRefs]) ?? [])
    ]);
    return Object.freeze({
        contractVersion: M5_EPII_CONTRACT_VERSION,
        extensionId: EXTENSION_ID,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        reviewWorkbench,
        spineInspector: snapshot?.spineState ? freezeRecord({ ...snapshot.spineState }) : freezeRecord({}),
        canonEvolutionBrowser: Object.freeze(artifactRefs),
        recursiveGateRows: Object.freeze((snapshot?.reviewItems ?? []).map(toRecursiveGateRow)),
        pendingFields: Object.freeze(pendingFields),
        readiness: Object.freeze({
            state: blockers.length === 0 ? input.readiness.state : 'authority_payload_missing',
            surfaceReady: blockers.length === 0,
            blockers: Object.freeze(blockers)
        }),
        observabilityEvents: Object.freeze([
            Object.freeze({
                type: 'm5.review.transition',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    contractVersion: M5_EPII_CONTRACT_VERSION,
                    profileGeneration: input.profile.generation,
                    privacyClass: PRIVACY_CLASS,
                    reviewItemHandles: snapshot?.reviewItems.map(item => item.reviewItemHandle) ?? [],
                    protectedBodiesRendered: false
                })
            }),
            Object.freeze({
                type: 'm5.spine.event',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    contractVersion: M5_EPII_CONTRACT_VERSION,
                    routingConfigurationHandle: snapshot?.spineState.routingConfigurationHandle ?? 'pending:s5.spine',
                    activeCandidates: snapshot?.spineState.activeCandidates ?? [],
                    profileGeneration: input.profile.generation,
                    privacyClass: PRIVACY_CLASS
                })
            })
        ])
    });
}

export function parseArtifactUri(uri: string): ArtifactUri {
    if (uri.startsWith('/') || /^[A-Za-z]:[\\/]/.test(uri)) {
        throw new Error('artifact refs must use namespace URIs, not raw absolute paths');
    }
    const match = /^([a-z][a-z0-9-]*):\/\/(.+)$/.exec(uri);
    if (!match) {
        throw new Error(`invalid artifact URI: ${uri}`);
    }
    const scheme = match[1] as ArtifactUri['scheme'];
    if (!['vault', 'repo', 'graph', 'gnosis', 'etymology', 'pratibimba', 'run', 'review', 'improvement'].includes(scheme)) {
        throw new Error(`unsupported artifact URI scheme: ${scheme}`);
    }
    const namespace = scheme === 'graph' ? match[2].split('/')[0] : undefined;
    if (scheme === 'graph' && !['bimba', 'gnosis', 'etymology'].includes(namespace ?? '')) {
        throw new Error('graph:// refs must name bimba, gnosis, or etymology namespace');
    }
    return Object.freeze({ scheme, uri, namespace });
}

export function enforceReviewDisposition(
    item: S5ReviewItem,
    disposition: ReviewDisposition,
    actorKind: 'agent' | 'human'
): void {
    const blocked = ['approve', 'reject', 'revise', 'promote', 'weaken-gate'].includes(disposition);
    if (actorKind === 'agent' && blocked && (item.humanRequired || item.recursiveModification)) {
        throw new Error('agents cannot approve, reject, revise, promote, or weaken human/recursive gates');
    }
}

function buildSpineState(
    reviewItems: readonly S5ReviewItem[],
    improvementRuns: readonly S5ImprovementRun[]
): S5SpineState {
    const openHandles = reviewItems.filter(item => item.status === 'open').map(item => item.reviewItemHandle);
    return Object.freeze({
        routingConfigurationHandle: 'review://spine/routing-configuration/current',
        activeCandidates: Object.freeze(openHandles),
        routeQueues: Object.freeze({
            review: Object.freeze(openHandles),
            improvement: Object.freeze(improvementRuns.map(run => run.improvementRunHandle))
        }),
        orchestrationStates: Object.freeze(['pi-prepares-evidence', 'target-agent-reviews', 'anima-checks', 'user-final-validates']),
        continuityHints: Object.freeze(reviewItems.map(item => item.reviewItemHandle)),
        metaLoopEvents: Object.freeze(improvementRuns.map(run => `${run.improvementRunHandle}:effect-verification`)),
        effectVerificationSchedules: Object.freeze(improvementRuns.flatMap(run => [...run.effectVerificationSchedule])),
        recentSpineRefinements: Object.freeze(reviewItems.filter(item => item.status === 'resolved').map(item => item.reviewItemHandle))
    });
}

function toReviewRow(item: S5ReviewItem): Readonly<Record<string, unknown>> {
    return freezeRecord({
        reviewItemHandle: item.reviewItemHandle,
        status: item.status,
        governanceCategory: item.governanceCategory,
        humanRequired: item.humanRequired,
        recursiveModification: item.recursiveModification,
        promotionDestination: item.promotionDestination,
        dryRunPlanHandle: item.dryRunPlanHandle,
        evidenceHandles: item.evidenceHandles,
        protectedBodyHandles: item.protectedBodyHandles,
        protectedBodySummary: item.protectedBodySummary,
        protectedBodiesRendered: false
    });
}

function toRecursiveGateRow(item: S5ReviewItem): Readonly<Record<string, unknown>> {
    return freezeRecord({
        reviewItemHandle: item.reviewItemHandle,
        pattern:
            item.recursiveModification ? 'sophia-on-sophia/anima-on-anima/pi-on-pi/aletheia-on-aletheia' : 'ordinary-review',
        piMayPrepareEvidence: true,
        targetAgentMayReview: true,
        animaMayCheck: true,
        userFinalValidationRequired: item.humanRequired || item.recursiveModification,
        agentMayFinalize: false
    });
}

async function readReviewItem(storeRoot: string, reviewItemHandle: string): Promise<S5ReviewItem> {
    return readJsonFile<S5ReviewItem>(join(storeRoot, 'review-items', handleFileName(reviewItemHandle)));
}

async function patchReviewItem(
    storeRoot: string,
    reviewItemHandle: string,
    patch: Partial<S5ReviewItem>
): Promise<S5ReviewItem> {
    const current = await readReviewItem(storeRoot, reviewItemHandle);
    const next = Object.freeze({ ...current, ...patch }) as S5ReviewItem;
    await writeJson(storeRoot, 'review-items', handleFileName(reviewItemHandle), next);
    return next;
}

async function readJsonDir<T>(storeRoot: string, subdir: string): Promise<T[]> {
    const dir = join(storeRoot, subdir);
    let entries: string[] = [];
    try {
        entries = await readdir(dir);
    } catch {
        return [];
    }
    const values: T[] = [];
    for (const entry of entries.filter(name => name.endsWith('.json')).sort()) {
        values.push(await readJsonFile<T>(join(dir, entry)));
    }
    return values;
}

async function readJsonFile<T>(path: string): Promise<T> {
    return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function writeJson(storeRoot: string, subdir: string, fileName: string, value: unknown): Promise<void> {
    const dir = join(storeRoot, subdir);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function handleFileName(handle: string): string {
    return `${stableId(handle)}.json`;
}

function uniqueArtifactUris(values: readonly ArtifactUri[]): ArtifactUri[] {
    const seen = new Set<string>();
    const out: ArtifactUri[] = [];
    for (const value of values) {
        if (!seen.has(value.uri)) {
            seen.add(value.uri);
            out.push(value);
        }
    }
    return out;
}

function stableId(input: string): string {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function freezeRecord(record: Record<string, unknown>): Readonly<Record<string, unknown>> {
    return Object.freeze(record);
}
