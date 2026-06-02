import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from './index';

export const M4_NARA_CONTRACT_VERSION = '2026-06-01.07-T7';

export type NaraArtifactKind =
    | 'journal'
    | 'dream'
    | 'oracle'
    | 'reminder'
    | 'contemplative'
    | 'agent-chat';

export type NaraPrivacyClass =
    | 'protected_local'
    | 'protected_local_handle_only'
    | 'shared_archetype_opt_in';

export interface NaraScalarRef {
    readonly refKind: 'm3-codon' | 'tarot' | 'i-ching' | 'chronos' | 'kairos';
    readonly scalarRef: string;
    readonly sourceHandle: string;
}

export interface NaraArtifactEnvelope {
    readonly artifactId: string;
    readonly artifactHandle: string;
    readonly artifactPath: string;
    readonly dayId: string;
    readonly kind: NaraArtifactKind;
    readonly title: string;
    readonly createdAt: string;
    readonly nowPath: string;
    readonly sessionKey: string;
    readonly privacyClass: NaraPrivacyClass;
    readonly bodySha256: string;
    readonly scalarRefs: readonly NaraScalarRef[];
    readonly graphitiEpisodeHandles: readonly string[];
    readonly qActivityPolicy?: QActivityUpdatePolicy;
    readonly payload: Readonly<Record<string, unknown>>;
}

export interface NaraGraphitiEpisode {
    readonly episodeHandle: string;
    readonly dayId: string;
    readonly artifactHandle: string;
    readonly relation: 'HAS_DAY' | 'CONTAINS_DAILY_NOTE' | 'PART_OF_DAY' | 'NEXT_IN_ARC';
    readonly sagaHandle?: string;
    readonly communityHandle?: string;
    readonly crossArtifactLinks: readonly string[];
    readonly bodyProtectedLocal: true;
}

export interface NaraDayContainer {
    readonly contractVersion: typeof M4_NARA_CONTRACT_VERSION;
    readonly dayId: string;
    readonly dayPath: string;
    readonly metadata: Readonly<Record<string, unknown>>;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly nowLineage: readonly string[];
    readonly scalarRefs: readonly NaraScalarRef[];
    readonly graphitiEpisodeHandles: readonly string[];
    readonly artifactCounts: Readonly<Record<NaraArtifactKind, number>>;
    readonly artifactTree: readonly NaraArtifactEnvelope[];
    readonly graphitiEpisodes: readonly NaraGraphitiEpisode[];
}

export interface QActivityUpdatePolicy {
    readonly provenanceHandle: string | null;
    readonly decayWindowOpen: boolean;
    readonly updateAllowed: boolean;
    readonly reason: string;
}

export interface ProtectedPersonalFieldInput {
    readonly surfaceId: 'm4-nara';
    readonly qIdentityHandle: string;
    readonly qTransitHandle: string;
    readonly qActivityHandle: string;
    readonly qComposedHandle: string;
    readonly audioBusHandle: string;
    readonly planetaryChakralStateHandle: string;
}

export interface ConsentRecord {
    readonly subjectHandle: string;
    readonly action: 'nara.voice-corpus.include' | 'nara.graphiti.body.inspect' | 'nara.shared-archetype.publish';
    readonly consented: boolean;
    readonly consentedAt: string;
    readonly scope: 'single-artifact' | 'single-day' | 'adapter-corpus';
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
    readonly revokedAt?: string;
}

export interface VoiceCorpusAdmissionInput {
    readonly consentRecords: readonly ConsentRecord[];
    readonly piiStripped: boolean;
    readonly animaAdmission: 'approved' | 'pending' | 'rejected';
    readonly adapterProvenanceHandle: string | null;
    readonly rollbackDeploymentHandle: string | null;
}

export interface M4NaraSurfaceInput {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly emittedAt: number;
    readonly dayContainer?: NaraDayContainer;
}

export interface M4NaraSurface {
    readonly contractVersion: typeof M4_NARA_CONTRACT_VERSION;
    readonly extensionId: typeof EXTENSION_ID;
    readonly profileGeneration: number;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly daySummary: Readonly<Record<string, unknown>>;
    readonly artifactTree: readonly Readonly<Record<string, unknown>>[];
    readonly graphitiBrowser: readonly Readonly<Record<string, unknown>>[];
    readonly pendingFields: readonly string[];
    readonly readiness: {
        readonly state: MExtensionReadinessState;
        readonly surfaceReady: boolean;
        readonly blockers: readonly string[];
    };
    readonly observabilityEvents: readonly MObservabilityEvent[];
}

export async function createNaraArtifact(input: {
    readonly vaultRoot: string;
    readonly dayId: string;
    readonly kind: NaraArtifactKind;
    readonly title: string;
    readonly body: string;
    readonly nowPath: string;
    readonly sessionKey: string;
    readonly privacyClass?: NaraPrivacyClass;
    readonly scalarRefs?: readonly NaraScalarRef[];
    readonly graphitiEpisodeHandles?: readonly string[];
    readonly qActivityPolicy?: QActivityUpdatePolicy;
    readonly payload?: Readonly<Record<string, unknown>>;
    readonly createdAt?: string;
}): Promise<NaraArtifactEnvelope> {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const artifactId = stableId(`${input.dayId}:${input.kind}:${input.title}:${createdAt}`);
    const artifactHandle = `nara://day/${input.dayId}/artifact/${artifactId}`;
    const dayPath = dayContainerPath(input.vaultRoot, input.dayId);
    const artifactDir = join(dayPath, 'artifacts', input.kind);
    const artifactPath = join(artifactDir, `${artifactId}.md`);
    const envelopePath = join(artifactDir, `${artifactId}.json`);
    const envelope: NaraArtifactEnvelope = Object.freeze({
        artifactId,
        artifactHandle,
        artifactPath,
        dayId: input.dayId,
        kind: input.kind,
        title: input.title,
        createdAt,
        nowPath: input.nowPath,
        sessionKey: input.sessionKey,
        privacyClass: input.privacyClass ?? 'protected_local',
        bodySha256: stableId(input.body),
        scalarRefs: Object.freeze([...(input.scalarRefs ?? [])]),
        graphitiEpisodeHandles: Object.freeze([...(input.graphitiEpisodeHandles ?? [])]),
        qActivityPolicy: input.qActivityPolicy,
        payload: Object.freeze({ ...(input.payload ?? {}) })
    });
    await mkdir(artifactDir, { recursive: true });
    await ensureDayMetadata(dayPath, input.dayId, input.nowPath, input.sessionKey);
    await writeFile(artifactPath, renderArtifactMarkdown(envelope, input.body), 'utf8');
    await writeFile(envelopePath, `${JSON.stringify(envelope, null, 2)}\n`, 'utf8');
    return envelope;
}

export async function createGraphitiEpisode(input: {
    readonly vaultRoot: string;
    readonly dayId: string;
    readonly artifactHandle: string;
    readonly relation: NaraGraphitiEpisode['relation'];
    readonly sagaHandle?: string;
    readonly communityHandle?: string;
    readonly crossArtifactLinks?: readonly string[];
}): Promise<NaraGraphitiEpisode> {
    const dayPath = dayContainerPath(input.vaultRoot, input.dayId);
    const graphitiDir = join(dayPath, 'graphiti');
    const episode: NaraGraphitiEpisode = Object.freeze({
        episodeHandle: `graphiti://episode/${stableId(`${input.dayId}:${input.artifactHandle}:${input.relation}`)}`,
        dayId: input.dayId,
        artifactHandle: input.artifactHandle,
        relation: input.relation,
        sagaHandle: input.sagaHandle,
        communityHandle: input.communityHandle,
        crossArtifactLinks: Object.freeze([...(input.crossArtifactLinks ?? [])]),
        bodyProtectedLocal: true
    });
    await mkdir(graphitiDir, { recursive: true });
    const episodePath = join(graphitiDir, `${basename(episode.episodeHandle)}.json`);
    await writeFile(episodePath, `${JSON.stringify(episode, null, 2)}\n`, 'utf8');
    return episode;
}

export async function readNaraDayContainer(input: {
    readonly vaultRoot: string;
    readonly dayId: string;
}): Promise<NaraDayContainer> {
    const dayPath = dayContainerPath(input.vaultRoot, input.dayId);
    const metadata = await readJsonRecord(join(dayPath, 'day.json'));
    const artifactTree = await readArtifactTree(dayPath);
    const graphitiEpisodes = await readGraphitiEpisodes(dayPath);
    const nowLineage = uniqueStrings(artifactTree.map(artifact => artifact.nowPath));
    const scalarRefs = artifactTree.flatMap(artifact => [...artifact.scalarRefs]);
    const graphitiEpisodeHandles = uniqueStrings([
        ...artifactTree.flatMap(artifact => [...artifact.graphitiEpisodeHandles]),
        ...graphitiEpisodes.map(episode => episode.episodeHandle)
    ]);
    return Object.freeze({
        contractVersion: M4_NARA_CONTRACT_VERSION,
        dayId: input.dayId,
        dayPath,
        metadata,
        privacyClass: PRIVACY_CLASS,
        nowLineage: Object.freeze(nowLineage),
        scalarRefs: Object.freeze(scalarRefs),
        graphitiEpisodeHandles: Object.freeze(graphitiEpisodeHandles),
        artifactCounts: countArtifacts(artifactTree),
        artifactTree: Object.freeze(artifactTree),
        graphitiEpisodes: Object.freeze(graphitiEpisodes)
    });
}

export function buildM4NaraSurface(input: M4NaraSurfaceInput): M4NaraSurface {
    const dayContainer =
        input.dayContainer ?? objectValue(input.profile.payload.m4NaraDayContainer) as NaraDayContainer | undefined;
    const pendingFields = dayContainer ? [] : ['m4NaraDayContainer'];
    const blockers = dayContainer ? [] : ['Track 03/04 Nara DayContainer handle payload not available'];
    const artifactTree = (dayContainer?.artifactTree ?? []).map(toArtifactTreeRow);
    const graphitiBrowser = (dayContainer?.graphitiEpisodes ?? []).map(toGraphitiBrowserRow);
    const daySummary = freezeRecord({
        dayId: dayContainer?.dayId ?? null,
        dayPath: dayContainer?.dayPath ?? null,
        artifactCounts: dayContainer?.artifactCounts ?? null,
        nowLineage: dayContainer?.nowLineage ?? [],
        privacyClass: PRIVACY_CLASS,
        scalarRefs: dayContainer?.scalarRefs ?? [],
        graphitiEpisodeHandles: dayContainer?.graphitiEpisodeHandles ?? []
    });
    return Object.freeze({
        contractVersion: M4_NARA_CONTRACT_VERSION,
        extensionId: EXTENSION_ID,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        daySummary,
        artifactTree: Object.freeze(artifactTree),
        graphitiBrowser: Object.freeze(graphitiBrowser),
        pendingFields: Object.freeze(pendingFields),
        readiness: Object.freeze({
            state: blockers.length === 0 ? input.readiness.state : 'authority_payload_missing',
            surfaceReady: blockers.length === 0,
            blockers: Object.freeze(blockers)
        }),
        observabilityEvents: Object.freeze([
            Object.freeze({
                type: 'm4.artifact.created',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    contractVersion: M4_NARA_CONTRACT_VERSION,
                    profileGeneration: input.profile.generation,
                    privacyClass: PRIVACY_CLASS,
                    dayContainerHandle: dayContainer ? `nara://day/${dayContainer.dayId}` : 'pending:nara.day',
                    artifactHandles: artifactTree.map(row => row.artifactHandle),
                    protectedBodiesRendered: false
                })
            })
        ])
    });
}

export function buildS2CanonicalProjection(day: NaraDayContainer): Readonly<Record<string, unknown>> {
    return freezeRecord({
        dayHandle: `nara://day/${day.dayId}`,
        artifactHandles: day.artifactTree.map(artifact => artifact.artifactHandle),
        scalarRefs: day.scalarRefs,
        graphitiEpisodeHandles: day.graphitiEpisodeHandles,
        protectedBodiesIncluded: false
    });
}

export function buildPublicProfilePayload(day: NaraDayContainer): Readonly<Record<string, unknown>> {
    return freezeRecord({
        privacyClass: PRIVACY_CLASS,
        naraDayHandle: `nara://day/${day.dayId}`,
        artifactCount: day.artifactTree.length,
        protectedArtifactHandles: day.artifactTree.map(artifact => artifact.artifactHandle),
        bodyFields: Object.freeze([])
    });
}

export function buildSpaceTimeRows(day: NaraDayContainer): readonly Readonly<Record<string, unknown>>[] {
    return Object.freeze(
        day.artifactTree.map(artifact =>
            freezeRecord({
                table: 'nara_artifact_handle',
                day_id: day.dayId,
                artifact_handle: artifact.artifactHandle,
                kind: artifact.kind,
                privacy_class: PRIVACY_CLASS,
                body_included: false
            })
        )
    );
}

export function renderProtectedPersonalField(input: ProtectedPersonalFieldInput): Readonly<Record<string, unknown>> {
    const handles = [
        input.qIdentityHandle,
        input.qTransitHandle,
        input.qActivityHandle,
        input.qComposedHandle,
        input.audioBusHandle,
        input.planetaryChakralStateHandle
    ];
    return freezeRecord({
        surfaceId: input.surfaceId,
        privacyClass: PRIVACY_CLASS,
        readiness: 'deterministic-lower-fidelity',
        readinessLabel: 'Lower-fidelity deterministic renderer; physics engine pending S2/S3 authority',
        protectedLocalOnly: true,
        absentFromPublicProjectionExceptHandles: true,
        bodyRendered: false,
        fieldHash: stableId(handles.join('|')),
        handles: freezeRecord({
            qIdentityHandle: input.qIdentityHandle,
            qTransitHandle: input.qTransitHandle,
            qActivityHandle: input.qActivityHandle,
            qComposedHandle: input.qComposedHandle,
            audioBusHandle: input.audioBusHandle,
            planetaryChakralStateHandle: input.planetaryChakralStateHandle
        })
    });
}

export function inspectOracleArtifact(artifact: NaraArtifactEnvelope): Readonly<Record<string, unknown>> {
    if (artifact.kind !== 'oracle') {
        throw new Error('oracle inspector requires an oracle artifact envelope');
    }
    return freezeRecord({
        artifactHandle: artifact.artifactHandle,
        privacyClass: artifact.privacyClass,
        scalarRefs: artifact.scalarRefs,
        lensApplications: artifact.payload.lensApplications ?? [],
        qActivityUpdate: evaluateQActivityUpdate(artifact.qActivityPolicy),
        protectedBodyLoaded: false
    });
}

export function evaluateQActivityUpdate(policy: QActivityUpdatePolicy | undefined): Readonly<Record<string, unknown>> {
    if (!policy) {
        return freezeRecord({ allowed: false, reason: 'missing-q-activity-policy' });
    }
    return freezeRecord({
        allowed: policy.updateAllowed && policy.decayWindowOpen && policy.provenanceHandle !== null,
        reason: policy.reason,
        provenanceHandle: policy.provenanceHandle,
        decayWindowOpen: policy.decayWindowOpen
    });
}

export function buildTemporalReading(day: NaraDayContainer): Readonly<Record<string, unknown>> {
    return freezeRecord({
        dayHandle: `nara://day/${day.dayId}`,
        graphitiTrajectory: day.graphitiEpisodes.map(episode => episode.episodeHandle),
        chronosRefs: day.scalarRefs.filter(ref => ref.refKind === 'chronos').map(ref => ref.scalarRef),
        kairosRefs: day.scalarRefs.filter(ref => ref.refKind === 'kairos').map(ref => ref.scalarRef),
        artifactHistory: day.artifactTree.map(artifact => artifact.artifactHandle),
        reconstructedFromPersistedHandles: true,
        protectedBodiesLoaded: false
    });
}

export function evaluateVoiceCorpusAdmission(input: VoiceCorpusAdmissionInput): Readonly<Record<string, unknown>> {
    const consent = input.consentRecords.find(
        record =>
            record.action === 'nara.voice-corpus.include' &&
            record.consented &&
            record.pressureFree &&
            record.inspectable &&
            record.revokedAt === undefined
    );
    const admitted =
        consent !== undefined &&
        input.piiStripped &&
        input.animaAdmission === 'approved' &&
        input.adapterProvenanceHandle !== null &&
        input.rollbackDeploymentHandle !== null;
    return freezeRecord({
        admitted,
        pressureFreeConsent: consent !== undefined,
        piiStripped: input.piiStripped,
        animaAdmission: input.animaAdmission,
        adapterProvenanceHandle: input.adapterProvenanceHandle,
        rollbackDeploymentHandle: input.rollbackDeploymentHandle,
        ordinaryDialogueSeparated: true
    });
}

function dayContainerPath(vaultRoot: string, dayId: string): string {
    return join(vaultRoot, 'Pratibimba', 'Nara', dayId);
}

async function ensureDayMetadata(dayPath: string, dayId: string, nowPath: string, sessionKey: string): Promise<void> {
    await mkdir(dayPath, { recursive: true });
    const metadataPath = join(dayPath, 'day.json');
    const metadata = freezeRecord({
        dayId,
        dayHandle: `nara://day/${dayId}`,
        nowLineage: [nowPath],
        sessionKeys: [sessionKey],
        privacyClass: PRIVACY_CLASS
    });
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}

async function readArtifactTree(dayPath: string): Promise<NaraArtifactEnvelope[]> {
    const artifactsPath = join(dayPath, 'artifacts');
    const envelopes: NaraArtifactEnvelope[] = [];
    for (const kind of artifactKinds()) {
        const dir = join(artifactsPath, kind);
        let entries: string[] = [];
        try {
            entries = await readdir(dir);
        } catch {
            continue;
        }
        for (const entry of entries.filter(name => name.endsWith('.json')).sort()) {
            envelopes.push(await readJsonRecord(join(dir, entry)) as unknown as NaraArtifactEnvelope);
        }
    }
    return envelopes;
}

async function readGraphitiEpisodes(dayPath: string): Promise<NaraGraphitiEpisode[]> {
    const graphitiPath = join(dayPath, 'graphiti');
    let entries: string[] = [];
    try {
        entries = await readdir(graphitiPath);
    } catch {
        return [];
    }
    const episodes: NaraGraphitiEpisode[] = [];
    for (const entry of entries.filter(name => name.endsWith('.json')).sort()) {
        episodes.push(await readJsonRecord(join(graphitiPath, entry)) as unknown as NaraGraphitiEpisode);
    }
    return episodes;
}

async function readJsonRecord(path: string): Promise<Readonly<Record<string, unknown>>> {
    return Object.freeze(JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>);
}

function renderArtifactMarkdown(envelope: NaraArtifactEnvelope, body: string): string {
    return `---\n${[
        ['artifact_id', envelope.artifactId],
        ['artifact_handle', envelope.artifactHandle],
        ['day_id', envelope.dayId],
        ['kind', envelope.kind],
        ['created_at', envelope.createdAt],
        ['now_path', envelope.nowPath],
        ['session_key', envelope.sessionKey],
        ['privacy_class', envelope.privacyClass],
        ['body_sha256', envelope.bodySha256]
    ].map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n${body}\n`;
}

function countArtifacts(artifacts: readonly NaraArtifactEnvelope[]): Readonly<Record<NaraArtifactKind, number>> {
    const counts: Record<NaraArtifactKind, number> = {
        journal: 0,
        dream: 0,
        oracle: 0,
        reminder: 0,
        contemplative: 0,
        'agent-chat': 0
    };
    for (const artifact of artifacts) {
        counts[artifact.kind] += 1;
    }
    return Object.freeze(counts);
}

function toArtifactTreeRow(artifact: NaraArtifactEnvelope): Readonly<Record<string, unknown>> {
    return freezeRecord({
        artifactHandle: artifact.artifactHandle,
        dayId: artifact.dayId,
        kind: artifact.kind,
        title: artifact.title,
        nowPath: artifact.nowPath,
        sessionKey: artifact.sessionKey,
        privacyClass: artifact.privacyClass,
        scalarRefs: artifact.scalarRefs,
        graphitiEpisodeHandles: artifact.graphitiEpisodeHandles,
        bodyRendered: false
    });
}

function toGraphitiBrowserRow(episode: NaraGraphitiEpisode): Readonly<Record<string, unknown>> {
    return freezeRecord({
        episodeHandle: episode.episodeHandle,
        relation: episode.relation,
        artifactHandle: episode.artifactHandle,
        sagaHandle: episode.sagaHandle ?? null,
        communityHandle: episode.communityHandle ?? null,
        crossArtifactLinks: episode.crossArtifactLinks,
        bodyProtectedLocal: episode.bodyProtectedLocal
    });
}

function artifactKinds(): readonly NaraArtifactKind[] {
    return ['journal', 'dream', 'oracle', 'reminder', 'contemplative', 'agent-chat'] as const;
}

function uniqueStrings(values: readonly string[]): string[] {
    return [...new Set(values.filter(Boolean))];
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
