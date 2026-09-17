/**
 * Coordinate: M' M4' (PASU BeingPattern projection model — rerun 25.T25.22)
 * Residency: Body/M/pratibimba-app/src/panes/beingPattern
 * Position (#n): #1 — the typed shape of the being-pattern READ.
 * Actualises: the strict client-side narrowing of the LIVE CCT-21 stream. The
 *   producer is `Body/S/S3/gateway/src/being_pattern.rs` (landed 2026-08-01,
 *   commit 373709f0); the four `s3'.being_pattern.*` arms are registered in
 *   `S3_METHODS` / `register_s3_handlers` and answer on the wire. The payload
 *   shape parsed here is the ONE the producer serialises —
 *   `being_pattern_bridge_handle_payload` over `portal_core::
 *   PasuBeingPatternProjection` — never a second, invented wire format.
 *   The parse is FAIL-CLOSED twice over: (a) unknown/absent enum values refuse
 *   rather than default — "rendering defaults and calling them a reading" is
 *   exactly what the Wave-C register warned against; (b) the PRIVACY GUARD
 *   refuses any payload carrying a raw protected body. The substrate asserts
 *   public-safety on its side (`assert_being_pattern_public_safe`, applied to
 *   params on the way IN and payloads on the way OUT); this is the consumer's
 *   defence-in-depth, carrying the substrate's own forbidden-key list PLUS the
 *   §25.22 named bodies, so no raw body can enter the DOM even through a wrong
 *   producer.
 * Public surface: MonoPolyOperator, PerspectiveRole, NaraFamilyRole,
 *   PasuReviewRisk, BeingPatternProjectionView, BeingPatternStreamView,
 *   MONO_POLY_OPERATORS, PERSPECTIVE_ROLES, NARA_FAMILY_ROLES,
 *   PERSPECTIVE_STRIP_LABELS, MONO_POLY_READINGS, ELEMENTS,
 *   FORBIDDEN_BODY_KEYS, parseBeingPatternProjection,
 *   parseBeingPatternStream, beingPatternFixture, beingPatternStreamFixture.
 * Does NOT own: the producer (S3 gateway — it stamps the generation, computes
 *   the relation edge, and admits review candidates), the review resolution
 *   (M5), or PASU identity fields (nothing here writes anything).
 * Contract: design-recon 25-m4-nara-frontend-deep.md §25.22 ·
 *   `Body/S/S3/gateway/src/being_pattern.rs` ·
 *   `Body/S/S3/gateway/src/spacetime/registration.rs`
 *   (`being_pattern_bridge_handle_payload`) ·
 *   `Body/S/S0/portal-core/src/profile_projections.rs` · [[DR-WC-M4-6]].
 */

export const MONO_POLY_OPERATORS = [
    'Mono',
    'Poly',
    'ActuallyMany',
    'PotentiallyOne',
    'ActualisingOne',
    'PotentiatingMany',
    'MonoPoly'
] as const;
export type MonoPolyOperator = (typeof MONO_POLY_OPERATORS)[number];

export const PERSPECTIVE_ROLES = [
    'FirstPerson',
    'SecondPerson',
    'FirstPersonPlural',
    'ThirdPerson',
    'CollectiveWe',
    'IntegralWeI'
] as const;
export type PerspectiveRole = (typeof PERSPECTIVE_ROLES)[number];

export const NARA_FAMILY_ROLES = [
    'Father',
    'Mother',
    'Son',
    'Daughter',
    'Tao',
    'IntegralConsciousness'
] as const;
export type NaraFamilyRole = (typeof NARA_FAMILY_ROLES)[number];

/** kebab-case on the wire (`portal_core::PasuReviewRisk`, `rename_all`). */
export const PASU_REVIEW_RISKS = [
    'none',
    'forced-unification',
    'privacy-boundary',
    'canon-candidate'
] as const;
export type PasuReviewRisk = (typeof PASU_REVIEW_RISKS)[number];

/** `portal_core::ElementalWeightProjection` field order. */
export const ELEMENTS = ['fire', 'water', 'air', 'earth'] as const;
export type Element = (typeof ELEMENTS)[number];

/** The spec's perspective strip: I / You / You-and-I / They / We / We-I. */
export const PERSPECTIVE_STRIP_LABELS: Readonly<Record<PerspectiveRole, string>> = Object.freeze({
    FirstPerson: 'I',
    SecondPerson: 'You',
    FirstPersonPlural: 'You-and-I',
    ThirdPerson: 'They',
    CollectiveWe: 'We',
    IntegralWeI: 'We-I'
});

/** The relationship dial's reading per operator — the spec's "one, many,
 *  potentially one, generatively many, or true many-in-one". */
export const MONO_POLY_READINGS: Readonly<Record<MonoPolyOperator, string>> = Object.freeze({
    Mono: 'one',
    Poly: 'many',
    ActuallyMany: 'actually many',
    PotentiallyOne: 'potentially one',
    ActualisingOne: 'actualising one — review-gated',
    PotentiatingMany: 'generatively many',
    MonoPoly: 'true many-in-one'
});

/**
 * Raw protected bodies that must NEVER enter the DOM, checked at every nesting
 * level of the payload.
 *
 * The first block is the §25.22 privacy law verbatim (`q_identity`,
 * `q_transit`, `q_activity`, `q_composed`, Graphiti bodies, natal chart
 * bodies, journal text). The second is the substrate's own list from
 * `epi_s3_gateway_contract::assert_being_pattern_public_safe` — carried here so
 * the two ends of the wire refuse the same set rather than each guessing.
 */
export const FORBIDDEN_BODY_KEYS = [
    'q_identity',
    'q_transit',
    'q_activity',
    'q_composed',
    'qIdentity',
    'qTransit',
    'qActivity',
    'qComposed',
    'graphitiBody',
    'graphiti_body',
    'natalChart',
    'natal_chart',
    'journalText',
    'journal_text',
    // — substrate list (gateway-contract/src/being_pattern.rs) —
    'body',
    'episodeBody',
    'episode_body',
    'protectedPayload',
    'protected_payload',
    'protectedNaraBody',
    'rawQuaternion',
    'raw_quaternion',
    'q_b',
    'q_p',
    'qB',
    'qP'
] as const;

/** Public-safe clock address (`portal_core::BeingPatternClockAddress`). */
export interface BeingPatternClockAddressView {
    readonly degree360: number;
    readonly tick12: number;
    readonly hexagram: number | null;
    readonly line: number | null;
    readonly source: string;
}

export interface BeingPatternRelationEdgeView {
    readonly edgeId: string;
    readonly sourceEntityId: string;
    readonly targetEntityId: string;
    readonly edgeKind: string;
    readonly aspectLabel: string;
    readonly generation: number;
    readonly canonStatus: string;
}

export interface BeingPatternProjectionView {
    readonly entityId: string;
    readonly entityKind: string;
    /** S2 REFERENCE, never a write target. */
    readonly graphAnchor: string;
    readonly monopolyOperator: MonoPolyOperator;
    readonly perspectiveRole: PerspectiveRole;
    readonly naraFamilyRole: NaraFamilyRole | null;
    readonly reviewRisk: PasuReviewRisk;
    readonly clockAddress: BeingPatternClockAddressView | null;
    readonly elementalWeights: Readonly<Record<Element, number>> | null;
    readonly relationEdges: readonly BeingPatternRelationEdgeView[];
    readonly verifierRefCount: number;
    readonly bioquaternionHandleCount: number;
    /** The observer's own role — who this reading is FROM. */
    readonly observerRole: PerspectiveRole | null;
    readonly observerEntityId: string | null;
    /** `liveState.streamGeneration` — the CCT-21 stream generation. */
    readonly streamGeneration: number | null;
}

export type BeingPatternParseResult =
    | { readonly kind: 'projection'; readonly view: BeingPatternProjectionView }
    | { readonly kind: 'refused'; readonly reason: string };

/** The `s3'.being_pattern.subscribe` envelope, narrowed. */
export interface BeingPatternStreamView {
    readonly generation: number | null;
    readonly streamDeltaKey: string | null;
    /** The producer's OWN honesty string — it says so when nobody has been
     *  observed yet, and the card repeats it rather than inventing copy. */
    readonly source: string;
    readonly eventChain: readonly string[];
    readonly entities: readonly BeingPatternProjectionView[];
    readonly reviewCandidateCount: number;
    /** The producer states this on every reply; the card renders it. */
    readonly s2Mutated: boolean;
}

export type BeingPatternStreamParseResult =
    | { readonly kind: 'stream'; readonly stream: BeingPatternStreamView }
    | { readonly kind: 'refused'; readonly reason: string };

function findForbiddenKey(value: unknown, path: string): string | null {
    if (Array.isArray(value)) {
        for (const [index, entry] of value.entries()) {
            const hit = findForbiddenKey(entry, `${path}[${index}]`);
            if (hit) {
                return hit;
            }
        }
        return null;
    }
    if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
            if ((FORBIDDEN_BODY_KEYS as readonly string[]).includes(key)) {
                return `${path}.${key}`;
            }
            const hit = findForbiddenKey(child, `${path}.${key}`);
            if (hit) {
                return hit;
            }
        }
    }
    return null;
}

function narrow<T extends string>(raw: unknown, admitted: readonly T[]): T | null {
    return typeof raw === 'string' && (admitted as readonly string[]).includes(raw)
        ? (raw as T)
        : null;
}

function stringAt(node: unknown, key: string): string | null {
    if (!node || typeof node !== 'object') {
        return null;
    }
    const value = (node as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
}

function numberAt(node: unknown, key: string): number | null {
    if (!node || typeof node !== 'object') {
        return null;
    }
    const value = (node as Record<string, unknown>)[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseClockAddress(raw: unknown): BeingPatternClockAddressView | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const degree360 = numberAt(raw, 'degree360');
    const tick12 = numberAt(raw, 'tick12');
    if (degree360 === null || tick12 === null) {
        return null;
    }
    return {
        degree360,
        tick12,
        hexagram: numberAt(raw, 'hexagram'),
        line: numberAt(raw, 'line'),
        source: stringAt(raw, 'source') ?? 'unstated'
    };
}

function parseElementalWeights(raw: unknown): Readonly<Record<Element, number>> | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const out: Partial<Record<Element, number>> = {};
    for (const element of ELEMENTS) {
        const weight = numberAt(raw, element);
        if (weight === null) {
            return null;
        }
        out[element] = weight;
    }
    return Object.freeze(out as Record<Element, number>);
}

function parseRelationEdges(raw: unknown): readonly BeingPatternRelationEdgeView[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.flatMap(entry => {
        const edgeId = stringAt(entry, 'edgeId');
        if (edgeId === null) {
            return [];
        }
        return [
            {
                edgeId,
                sourceEntityId: stringAt(entry, 'sourceEntityId') ?? '',
                targetEntityId: stringAt(entry, 'targetEntityId') ?? '',
                edgeKind: stringAt(entry, 'edgeKind') ?? '',
                aspectLabel: stringAt(entry, 'aspectLabel') ?? '',
                generation: numberAt(entry, 'generation') ?? 0,
                canonStatus: stringAt(entry, 'canonStatus') ?? ''
            }
        ];
    });
}

/**
 * Strict parse of ONE bridge handle payload — the object
 * `being_pattern_bridge_handle_payload` builds, which is what
 * `subscribe.entities[]` carries and what the 18.10 profile handle
 * (`MathemeHarmonicProfile.pasuBeingPattern`) carries.
 */
export function parseBeingPatternProjection(payload: unknown): BeingPatternParseResult {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { kind: 'refused', reason: 'payload is not a handle object' };
    }
    const forbidden = findForbiddenKey(payload, 'payload');
    if (forbidden) {
        return {
            kind: 'refused',
            reason: `raw protected body refused at ${forbidden} — handles only`
        };
    }
    const record = payload as Record<string, unknown>;
    const monopolyOperator = narrow(record.monopolyOperator, MONO_POLY_OPERATORS);
    if (!monopolyOperator) {
        return {
            kind: 'refused',
            reason: 'monopolyOperator is absent or unknown — refusing a defaulted reading'
        };
    }
    const perspectiveRole = narrow(record.perspectiveRole, PERSPECTIVE_ROLES);
    if (!perspectiveRole) {
        return {
            kind: 'refused',
            reason: 'perspectiveRole is absent or unknown — refusing a defaulted reading'
        };
    }
    const naraFamilyRole =
        record.naraFamilyRole == null ? null : narrow(record.naraFamilyRole, NARA_FAMILY_ROLES);
    if (record.naraFamilyRole != null && naraFamilyRole === null) {
        return { kind: 'refused', reason: 'naraFamilyRole carries an unknown variant' };
    }
    const reviewRisk = narrow(record.reviewRisk, PASU_REVIEW_RISKS);
    if (record.reviewRisk != null && reviewRisk === null) {
        return { kind: 'refused', reason: 'reviewRisk carries an unknown variant' };
    }
    const entityId = stringAt(record.entityRef, 'entityId');
    if (entityId === null) {
        return { kind: 'refused', reason: 'entityRef.entityId is absent — no entity to read' };
    }
    const bioquaternionHandles = Array.isArray(record.bioquaternionHandles)
        ? record.bioquaternionHandles
        : [];
    const verifierRefs = Array.isArray(record.verifierRefs) ? record.verifierRefs : [];
    return {
        kind: 'projection',
        view: {
            entityId,
            entityKind: stringAt(record.entityRef, 'entityKind') ?? '',
            graphAnchor: stringAt(record.entityRef, 'graphAnchor') ?? '',
            monopolyOperator,
            perspectiveRole,
            naraFamilyRole,
            reviewRisk: reviewRisk ?? 'none',
            clockAddress: parseClockAddress(record.clockAddress),
            elementalWeights: parseElementalWeights(record.elementalWeights),
            relationEdges: parseRelationEdges(record.relationEdges),
            verifierRefCount: verifierRefs.length,
            bioquaternionHandleCount: bioquaternionHandles.length,
            observerRole: narrow(stringAt(record.observerAnchor, 'observerRole'), PERSPECTIVE_ROLES),
            observerEntityId: stringAt(record.observerAnchor, 'observerEntityId'),
            streamGeneration: numberAt(record.liveState, 'streamGeneration')
        }
    };
}

/**
 * Strict parse of the `s3'.being_pattern.subscribe` envelope.
 *
 * FAIL-CLOSED ON THE WHOLE ROSTER: if any single entity payload refuses, the
 * read refuses. A partial render would hide the violation behind the entities
 * that happened to be clean.
 */
export function parseBeingPatternStream(result: unknown): BeingPatternStreamParseResult {
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        return { kind: 'refused', reason: 'subscribe reply is not an envelope object' };
    }
    const forbidden = findForbiddenKey(result, 'subscribe');
    if (forbidden) {
        return {
            kind: 'refused',
            reason: `raw protected body refused at ${forbidden} — handles only`
        };
    }
    const record = result as Record<string, unknown>;
    if (!Array.isArray(record.entities)) {
        return { kind: 'refused', reason: 'subscribe reply carries no entities roster' };
    }
    const entities: BeingPatternProjectionView[] = [];
    for (const [index, payload] of record.entities.entries()) {
        const parsed = parseBeingPatternProjection(payload);
        if (parsed.kind === 'refused') {
            return { kind: 'refused', reason: `entities[${index}]: ${parsed.reason}` };
        }
        entities.push(parsed.view);
    }
    const eventChain = Array.isArray(record.eventChain)
        ? record.eventChain.filter((name): name is string => typeof name === 'string')
        : [];
    const reviewCandidates = Array.isArray(record.reviewCandidates) ? record.reviewCandidates : [];
    return {
        kind: 'stream',
        stream: {
            generation: numberAt(record, 'generation'),
            streamDeltaKey: stringAt(record, 'streamDeltaKey'),
            source: stringAt(record, 'source') ?? 'unstated',
            eventChain,
            entities,
            reviewCandidateCount: reviewCandidates.length,
            s2Mutated: record.s2Mutated === true
        }
    };
}

/**
 * A wire-shaped fixture — every key mirrors
 * `being_pattern_bridge_handle_payload`, so a test that passes here is a test
 * against the producer's real serialisation and not against a second format
 * invented on the consumer side.
 */
export function beingPatternFixture(
    overrides: Partial<{
        entityId: string;
        monopolyOperator: MonoPolyOperator;
        perspectiveRole: PerspectiveRole;
        naraFamilyRole: NaraFamilyRole | null;
        reviewRisk: PasuReviewRisk;
        streamGeneration: number;
        relationEdges: readonly unknown[];
    }> = {}
): Record<string, unknown> {
    const entityId = overrides.entityId ?? 'user-being';
    const generation = overrides.streamGeneration ?? 7;
    return {
        entityRef: {
            entityId,
            entityKind: 'being',
            graphAnchor: `neo4j://s2/Bimba/${entityId}`
        },
        stableIdentity: {
            graphAnchor: `neo4j://s2/Bimba/${entityId}`,
            identityHandle: `s2:identity:${entityId}`,
            source: 'S2 Neo4j canonical graph'
        },
        liveState: {
            spacetimeRowId: `being_pattern_presence:${entityId}`,
            streamGeneration: generation,
            redisPsyche: {
                presence: `being_pattern:presence:${entityId}`,
                state: `being_pattern:state:${entityId}`
            },
            dayRef: '',
            nowRef: '',
            streamDelta: `being_pattern:stream_delta:${generation}`,
            graphitiEpisodeRefs: []
        },
        observerAnchor: {
            observerEntityId: entityId,
            observerRole: overrides.perspectiveRole ?? 'FirstPerson',
            anchorRef: `observer:earth-centred:${entityId}`
        },
        clockAddress: {
            degree360: 137,
            tick12: 5,
            hexagram: 42,
            line: 3,
            source: 'caller-supplied clock observation'
        },
        monopolyOperator: overrides.monopolyOperator ?? 'MonoPoly',
        perspectiveRole: overrides.perspectiveRole ?? 'FirstPerson',
        naraFamilyRole: overrides.naraFamilyRole === undefined ? null : overrides.naraFamilyRole,
        m2M3Relation: {
            relationHandle: `m2m3:${entityId}:${generation}`,
            source: "S3' being-pattern live producer",
            planetPlanetEdges: [],
            planetApertureEdges: [],
            pendingDatasetBadges: []
        },
        bioquaternionHandles: [
            {
                handle: `protected-local://bioquaternion/${entityId}/current`,
                privacy: 'protected-local-body',
                source: 'M4 personal identity (handle only)'
            }
        ],
        elementalWeights: { fire: 0.3, water: 0.2, air: 0.4, earth: 0.1 },
        relationEdges: overrides.relationEdges ?? [],
        verifierRefs: [
            {
                episodeId: 'episode:R3',
                sourceRef: 'graphiti://episode/R3',
                publicSummary: 'verifier reference, public summary only'
            }
        ],
        reviewRisk: overrides.reviewRisk ?? 'none'
    };
}

/** A wire-shaped `subscribe` envelope around the fixtures given. */
export function beingPatternStreamFixture(
    entities: readonly Record<string, unknown>[] = [beingPatternFixture()],
    overrides: Partial<{ generation: number; source: string; reviewCandidates: readonly unknown[] }> = {}
): Record<string, unknown> {
    const generation = overrides.generation ?? 7;
    return {
        method: "s3'.being_pattern.subscribe",
        coordinateOwner: "S3'",
        sessionKey: 'agent:main:main',
        agentId: 'operator',
        generation,
        streamDeltaKey: `being_pattern:stream_delta:${generation}`,
        tables: ['being_pattern_presence', 'being_pattern_relation_edge'],
        eventChain: [
            'EntityObserved',
            'BeingPatternProjected',
            'PerspectiveRoleResolved',
            'MonoPolyOperatorResolved',
            'ClockAddressUpdated',
            'AspectEdgeComputed',
            'ElementalResonanceChanged',
            'PatternPacketFormed',
            'ReviewCandidateEmitted'
        ],
        entities,
        relationEdges: [],
        reviewCandidates: overrides.reviewCandidates ?? [],
        events: [],
        spacetimeSubscriptionPlan: null,
        privacyClass: 'protected-reference-only',
        s2Mutated: false,
        source:
            overrides.source ??
            (entities.length === 0 ? 'live-producer (no entity observed yet)' : 'live-producer')
    };
}
