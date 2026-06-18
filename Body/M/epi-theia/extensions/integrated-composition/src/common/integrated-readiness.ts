import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

export type MonoPolyOperator =
    | 'Mono'
    | 'Poly'
    | 'ActuallyMany'
    | 'PotentiallyOne'
    | 'ActualisingOne'
    | 'PotentiatingMany'
    | 'MonoPoly';

export const PERSPECTIVE_ROLE_VALUES = Object.freeze([
    'FirstPerson',
    'SecondPerson',
    'FirstPersonPlural',
    'ThirdPerson',
    'CollectiveWe',
    'IntegralWeI'
] as const);

export type PerspectiveRole = typeof PERSPECTIVE_ROLE_VALUES[number];

export const PERSPECTIVE_ROLE_DISPLAY_LABELS = Object.freeze({
    FirstPerson: 'I',
    SecondPerson: 'You',
    FirstPersonPlural: 'You-and-I',
    ThirdPerson: 'They',
    CollectiveWe: 'We',
    IntegralWeI: 'We-I'
} satisfies Record<PerspectiveRole, string>);

export type PerspectiveRoleDisplayLabel =
    typeof PERSPECTIVE_ROLE_DISPLAY_LABELS[PerspectiveRole];

export type NaraFamilyRole = string;

export interface BeingEntityRef {
    readonly entityId: string;
    readonly entityKind: string;
    readonly graphAnchor?: string;
    readonly publicLabel?: string;
}

export interface CanonicalIdentityHandle {
    readonly handle: string;
    readonly graphAnchor: string;
    readonly identityHandle: string;
    readonly source?: string;
}

export interface GraphitiEpisodeHandle {
    readonly episodeId: string;
    readonly sourceRef: string;
    readonly publicSummary?: string;
}

export interface LiveStateHandle {
    readonly generation: number;
    readonly streamGeneration?: number;
    readonly spacetimeRowId?: string;
    readonly redisPsyche?: Readonly<Record<string, string>>;
    readonly dayRef?: string;
    readonly nowRef?: string;
    readonly streamDelta?: string;
    readonly graphitiEpisodeRefs?: readonly GraphitiEpisodeHandle[];
}

export type BeingPatternClockAddress = Readonly<Record<string, unknown>>;
export type BeingObserverAnchor = Readonly<Record<string, unknown>>;
export type ElementalWeightProjection = Readonly<Record<string, number>>;
export type M2M3RelationHandle = Readonly<Record<string, unknown>>;

export interface BeingPatternRelationEdge {
    readonly edgeId: string;
    readonly sourceEntityId: string;
    readonly targetEntityId: string;
    readonly edgeKind?: string;
    readonly aspectLabel?: string | null;
    readonly generation?: number;
    readonly elementalDelta?: ElementalWeightProjection;
    readonly m2M3Relation?: M2M3RelationHandle;
    readonly verifierRefs?: readonly Readonly<Record<string, unknown>>[];
}

export interface InhabitedBimbaEntityState {
    readonly entityRef: BeingEntityRef;
    readonly stableIdentity: CanonicalIdentityHandle;
    readonly liveState: LiveStateHandle;
    readonly observerAnchor: BeingObserverAnchor;
    readonly clockAddress: BeingPatternClockAddress;
    readonly monopolyOperator: MonoPolyOperator;
    readonly perspectiveRole: PerspectiveRole;
    readonly naraFamilyRole?: NaraFamilyRole;
    readonly m2M3Relation: M2M3RelationHandle;
    readonly bioquaternionHandles: readonly Readonly<Record<string, unknown>>[];
    readonly elementalWeights: ElementalWeightProjection;
    readonly relationEdges: readonly BeingPatternRelationEdge[];
    readonly reviewRisk: 'none' | 'forced-unification' | 'privacy-boundary' | 'canon-candidate';
}

export interface InhabitedBimbaFieldState {
    readonly generation: number | null;
    readonly subscriptionCapability: "s3'.being_pattern.subscribe";
    readonly entities: readonly InhabitedBimbaEntityState[];
    readonly relationEdges: readonly BeingPatternRelationEdge[];
}

export const BEING_PATTERN_READINESS_BLOCKERS = Object.freeze([
    'pending-pasu-being-pattern',
    'pending-spacetime-live-state',
    'pending-monopoly-operator',
    'pending-perspective-role'
] as const);

export type BeingPatternReadinessBlocker = typeof BEING_PATTERN_READINESS_BLOCKERS[number];

export const BEING_PATTERN_SUBSCRIPTION_CAPABILITY = "s3'.being_pattern.subscribe" as const;

export function perspectiveRoleDisplayLabelFor(role: PerspectiveRole): PerspectiveRoleDisplayLabel {
    return PERSPECTIVE_ROLE_DISPLAY_LABELS[role];
}

export function readCurrentInhabitedBimbaField(
    profile: MathemeHarmonicProfileBoundary | null
): InhabitedBimbaFieldState {
    const generation = typeof profile?.generation === 'number' ? profile.generation : null;
    const projections = readCurrentPasuBeingPatternProjections(profile);
    const entities = projections
        .filter(projection => generation === null || readGeneration(projection) === generation)
        .map(normalizeProjection)
        .filter((entity): entity is InhabitedBimbaEntityState => entity !== null);
    return Object.freeze({
        generation,
        subscriptionCapability: BEING_PATTERN_SUBSCRIPTION_CAPABILITY,
        entities: Object.freeze(entities),
        relationEdges: Object.freeze(entities.flatMap(entity => [...entity.relationEdges]))
    });
}

function readCurrentPasuBeingPatternProjections(
    profile: MathemeHarmonicProfileBoundary | null
): readonly Readonly<Record<string, unknown>>[] {
    const direct = readProjectionArray(
        profile?.payload['pasuBeingPattern'] ??
        profile?.payload['pasu_being_pattern'] ??
        profile?.payload['pasuBeingPatternProjection']
    );
    const many = readProjectionArray(
        profile?.payload['pasuBeingPatternProjections'] ??
        profile?.payload['pasu_being_pattern_projections']
    );
    return Object.freeze([...direct, ...many]);
}

function readProjectionArray(value: unknown): readonly Readonly<Record<string, unknown>>[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is Readonly<Record<string, unknown>> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        );
    }
    return value && typeof value === 'object'
        ? [value as Readonly<Record<string, unknown>>]
        : [];
}

function normalizeProjection(
    projection: Readonly<Record<string, unknown>>
): InhabitedBimbaEntityState | null {
    const entityRef = readEntityRef(projection);
    const liveState = readLiveState(projection['liveState']);
    const monopolyOperator = readMonoPolyOperator(projection['monopolyOperator']);
    const perspectiveRole = readPerspectiveRole(projection['perspectiveRole']);
    if (!entityRef || !liveState || !monopolyOperator || !perspectiveRole) {
        return null;
    }
    return Object.freeze({
        entityRef,
        stableIdentity: readStableIdentity(projection, entityRef.entityId),
        liveState,
        observerAnchor: readRecord(projection['observerAnchor']),
        clockAddress: readRecord(projection['clockAddress']),
        monopolyOperator,
        perspectiveRole,
        naraFamilyRole: readNaraFamilyRole(projection['naraFamilyRole']),
        m2M3Relation: readRecord(projection['m2M3Relation']),
        bioquaternionHandles: Object.freeze(readRecordArray(projection['bioquaternionHandles'])),
        elementalWeights: readNumberRecord(projection['elementalWeights']),
        relationEdges: Object.freeze(readRelationEdges(projection['relationEdges'], liveState.generation)),
        reviewRisk: readReviewRisk(projection['reviewRisk'], monopolyOperator)
    });
}

function readGeneration(projection: Readonly<Record<string, unknown>>): number | null {
    const liveState = projection['liveState'];
    if (!liveState || typeof liveState !== 'object' || Array.isArray(liveState)) {
        return null;
    }
    const record = liveState as Readonly<Record<string, unknown>>;
    const generation = record['streamGeneration'] ?? record['generation'];
    return typeof generation === 'number' && Number.isFinite(generation) ? generation : null;
}

function readEntityRef(projection: Readonly<Record<string, unknown>>): BeingEntityRef | null {
    const rawRef = projection['entityRef'];
    const ref = rawRef && typeof rawRef === 'object' && !Array.isArray(rawRef)
        ? rawRef as Readonly<Record<string, unknown>>
        : projection;
    const entityId = ref['entityId'];
    if (typeof entityId !== 'string' || entityId.length === 0) {
        return null;
    }
    const entityKind = ref['entityKind'];
    const graphAnchor = ref['graphAnchor'];
    const publicLabel = ref['publicLabel'];
    return Object.freeze({
        entityId,
        entityKind: typeof entityKind === 'string' && entityKind.length > 0 ? entityKind : 'being',
        ...(typeof graphAnchor === 'string' ? { graphAnchor } : {}),
        ...(typeof publicLabel === 'string' ? { publicLabel } : {})
    });
}

function readStableIdentity(
    projection: Readonly<Record<string, unknown>>,
    fallbackHandle: string
): CanonicalIdentityHandle {
    const raw = projection['stableIdentity'];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const graphAnchor = (raw as Readonly<Record<string, unknown>>)['graphAnchor'];
        const identityHandle = (raw as Readonly<Record<string, unknown>>)['identityHandle'];
        const source = (raw as Readonly<Record<string, unknown>>)['source'];
        if (typeof graphAnchor === 'string' && graphAnchor.length > 0) {
            const resolvedHandle = typeof identityHandle === 'string' && identityHandle.length > 0
                ? identityHandle
                : graphAnchor;
            return Object.freeze({
                handle: resolvedHandle,
                graphAnchor,
                identityHandle: resolvedHandle,
                ...(typeof source === 'string' ? { source } : {})
            });
        }
    }
    const handle = projection['stableIdentityHandle'];
    const stableIdentityHandle = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Readonly<Record<string, unknown>>)['handle']
        : undefined;
    const entityRef = projection['entityRef'];
    const graphAnchor = entityRef && typeof entityRef === 'object' && !Array.isArray(entityRef)
        ? (entityRef as Readonly<Record<string, unknown>>)['graphAnchor']
        : undefined;
    const resolvedHandle = typeof handle === 'string' && handle.length > 0
        ? handle
        : typeof stableIdentityHandle === 'string' && stableIdentityHandle.length > 0
            ? stableIdentityHandle
            : fallbackHandle;
    return Object.freeze({
        handle: resolvedHandle,
        graphAnchor: typeof graphAnchor === 'string' && graphAnchor.length > 0
            ? graphAnchor
            : `neo4j://s2/Bimba/${fallbackHandle}`,
        identityHandle: resolvedHandle,
        source: 'S2 Neo4j canonical graph'
    });
}

function readLiveState(value: unknown): LiveStateHandle | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const record = value as Readonly<Record<string, unknown>>;
    const generation = record['streamGeneration'] ?? record['generation'];
    if (typeof generation !== 'number' || !Number.isFinite(generation)) {
        return null;
    }
    return Object.freeze({
        generation,
        ...(typeof record['streamGeneration'] === 'number' ? { streamGeneration: record['streamGeneration'] } : {}),
        ...readOptionalString(record, 'spacetimeRowId'),
        redisPsyche: readStringRecord(record['redisPsyche'] ?? record['redis']),
        ...readOptionalString(record, 'dayRef'),
        ...readOptionalString(record, 'nowRef'),
        ...readOptionalString(record, 'streamDelta'),
        graphitiEpisodeRefs: Object.freeze(readGraphitiRefs(record['graphitiEpisodeRefs']))
    });
}

function readRelationEdges(value: unknown, generation: number): readonly BeingPatternRelationEdge[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .filter((item): item is Readonly<Record<string, unknown>> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        )
        .filter(edge => {
            const edgeGeneration = edge['generation'];
            return edgeGeneration === undefined || edgeGeneration === generation;
        })
        .map(edge => {
            const edgeId = stringOr(edge['edgeId'], '');
            const sourceEntityId = stringOr(edge['sourceEntityId'], '');
            const targetEntityId = stringOr(edge['targetEntityId'], '');
            return Object.freeze({
                edgeId,
                sourceEntityId,
                targetEntityId,
                ...readOptionalString(edge, 'edgeKind'),
                aspectLabel: stringOrNull(edge['aspectLabel']),
                generation: typeof edge['generation'] === 'number' ? edge['generation'] : undefined,
                elementalDelta: readNumberRecord(edge['elementalDelta']),
                m2M3Relation: readRecord(edge['m2M3Relation']),
                verifierRefs: Object.freeze(readRecordArray(edge['verifierRefs']))
            });
        })
        .filter(edge => edge.edgeId.length > 0 && edge.sourceEntityId.length > 0 && edge.targetEntityId.length > 0);
}

function readMonoPolyOperator(value: unknown): MonoPolyOperator | null {
    return isOneOf(value, ['Mono', 'Poly', 'ActuallyMany', 'PotentiallyOne', 'ActualisingOne', 'PotentiatingMany', 'MonoPoly']);
}

function readPerspectiveRole(value: unknown): PerspectiveRole | null {
    if (value === 'FirstSecondPerson') {
        return 'FirstPersonPlural';
    }
    const canonical = isOneOf(value, PERSPECTIVE_ROLE_VALUES);
    if (canonical) {
        return canonical;
    }
    switch (value) {
        case 'I':
            return 'FirstPerson';
        case 'You':
            return 'SecondPerson';
        case 'You-and-I':
            return 'FirstPersonPlural';
        case 'They':
            return 'ThirdPerson';
        case 'We':
            return 'CollectiveWe';
        case 'We-I':
            return 'IntegralWeI';
        default:
            return null;
    }
}

function readNaraFamilyRole(value: unknown): NaraFamilyRole | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readReviewRisk(
    value: unknown,
    operator: MonoPolyOperator
): InhabitedBimbaEntityState['reviewRisk'] {
    const explicit = isOneOf(value, ['none', 'forced-unification', 'privacy-boundary', 'canon-candidate']);
    if (explicit) {
        return explicit;
    }
    return operator === 'ActualisingOne' ? 'forced-unification' : 'none';
}

function readGraphitiRefs(value: unknown): readonly GraphitiEpisodeHandle[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .filter((item): item is Readonly<Record<string, unknown>> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        )
        .map(ref => {
            const episodeId = ref['episodeId'];
            const sourceRef = ref['sourceRef'];
            const publicSummary = ref['publicSummary'];
            if (typeof episodeId !== 'string' || typeof sourceRef !== 'string') {
                return null;
            }
            return Object.freeze({
                episodeId,
                sourceRef,
                ...(typeof publicSummary === 'string' ? { publicSummary } : {})
            });
        })
        .filter((ref): ref is GraphitiEpisodeHandle => ref !== null);
}

function readRecord(value: unknown): Readonly<Record<string, unknown>> {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? Object.freeze({ ...(value as Readonly<Record<string, unknown>>) })
        : Object.freeze({});
}

function readStringRecord(value: unknown): Readonly<Record<string, string>> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return Object.freeze({});
    }
    const out: Record<string, string> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if (typeof item === 'string') {
            out[key] = item;
        }
    }
    return Object.freeze(out);
}

function readNumberRecord(value: unknown): ElementalWeightProjection {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return Object.freeze({});
    }
    const out: Record<string, number> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if (typeof item === 'number' && Number.isFinite(item)) {
            out[key] = item;
        }
    }
    return Object.freeze(out);
}

function readRecordArray(value: unknown): readonly Readonly<Record<string, unknown>>[] {
    return Array.isArray(value)
        ? Object.freeze(value.filter((item): item is Readonly<Record<string, unknown>> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        ))
        : Object.freeze([]);
}

function readOptionalString(record: Readonly<Record<string, unknown>>, key: string): Record<string, string> {
    const value = record[key];
    return typeof value === 'string' ? { [key]: value } : {};
}

function stringOr(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

function isOneOf<const T extends readonly string[]>(value: unknown, values: T): T[number] | null {
    return typeof value === 'string' && (values as readonly string[]).includes(value)
        ? value as T[number]
        : null;
}
