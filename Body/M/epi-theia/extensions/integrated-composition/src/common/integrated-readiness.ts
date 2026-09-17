import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import type { MExtensionId } from '@pratibimba/m-extension-runtime/lib/common/contribution-contracts';
import type {
    MExtensionReadinessSnapshot,
    MExtensionReadinessState
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import { readinessSeverity } from '@pratibimba/m-extension-runtime/lib/common/readiness';
import {
    checkCosmicEnginePanes,
    FieldAvailability
} from './profile-field-checker';
import {
    checkJivaSivaPanes,
    JivaSivaFieldAvailability
} from './jiva-siva-fields';
import {
    COSMIC_ENGINE_GEOMETRIC_LAYOUT,
    IntegratedContributorRecord,
    IntegratedGeometricSlot,
    JIVA_SIVA_GEOMETRIC_LAYOUT
} from './layout-claim';

export type IntegratedCompositionId = 'cosmic-engine.integrated' | 'jiva-siva.integrated';

export type IntegratedSlotState = 'ready' | 'pending-field' | 'pending-contributor' | 'blocked';

export type IntegratedCompositionBlockerId =
    | 'pending-k2-surface'
    | 'pending-cymatic-mount-point'
    | 'pending-codon-rotation-export'
    | 'pending-ananda-vortex'
    | 'pending-psychoid-cymatic-solver'
    | 'pending-recognition-surface'
    | 'pending-q-composed'
    | 'pending-virtue-witness'
    | 'pending-kairos-populator'
    | 'pending-klein-flip'
    | 'pending-resonance72'
    | 'pending-planetary-chakral'
    | 'pending-audio-octet'
    | 'pending-nodal-quartet';

export interface IntegratedReadiness {
    readonly compositionId: IntegratedCompositionId;
    readonly overall: MExtensionReadinessState;
    readonly perPole: {
        readonly extensionId: MExtensionId;
        readonly readiness: MExtensionReadinessSnapshot;
    }[];
    readonly perGeometricSlot: {
        readonly geometricSlot: IntegratedGeometricSlot;
        readonly ownerId: MExtensionId | null;
        readonly fields: readonly {
            readonly field: string;
            readonly present: boolean;
            readonly blockerOwnerTrack: string;
        }[];
        readonly slotState: IntegratedSlotState;
    }[];
    readonly compositionBlockers: readonly {
        readonly id: IntegratedCompositionBlockerId;
        readonly ownerTrack: string;
        readonly humanReason: string;
    }[];
}

interface FieldRequirement {
    readonly field: string;
    readonly aliases: readonly string[];
    readonly blockerOwnerTrack: string;
    readonly blockerId?: IntegratedCompositionBlockerId;
}

interface SlotReadinessInput {
    readonly geometricSlot: IntegratedGeometricSlot;
    readonly ownerId: MExtensionId | null;
    readonly fields: readonly FieldRequirement[];
}

interface CompositionBlockerDetail {
    readonly id: IntegratedCompositionBlockerId;
    readonly ownerTrack: string;
    readonly humanReason: string;
}

export const INTEGRATED_COMPOSITION_BLOCKER_DETAILS: Readonly<
    Record<IntegratedCompositionBlockerId, CompositionBlockerDetail>
> = Object.freeze({
    'pending-k2-surface': Object.freeze({
        id: 'pending-k2-surface',
        ownerTrack: 'Track 22.2 played-torus',
        humanReason: 'The K2 played-torus surface handle is not present for the integrated cosmic surface.'
    }),
    'pending-cymatic-mount-point': Object.freeze({
        id: 'pending-cymatic-mount-point',
        ownerTrack: 'Track 23.10 cymatic-mount-point',
        humanReason: 'The M2 cymatic mount point is not present for texturing the K2 surface.'
    }),
    'pending-codon-rotation-export': Object.freeze({
        id: 'pending-codon-rotation-export',
        ownerTrack: 'Track 24.13 codon-rotation-export',
        humanReason: 'The M3 codon rotation export is not present for the cell-state projection.'
    }),
    'pending-ananda-vortex': Object.freeze({
        id: 'pending-ananda-vortex',
        ownerTrack: 'Track 10.10 ananda_vortex',
        humanReason: 'The ananda_vortex matrix family is not present for the played-torus cross-fade.'
    }),
    'pending-psychoid-cymatic-solver': Object.freeze({
        id: 'pending-psychoid-cymatic-solver',
        ownerTrack: 'Track 05.5 / 25.6 psychoid-cymatic-solver',
        humanReason: 'The personal psychoid cymatic solver handle is not present for the center slot.'
    }),
    'pending-recognition-surface': Object.freeze({
        id: 'pending-recognition-surface',
        ownerTrack: 'Track 26.11 recognition-surface',
        humanReason: 'The M5 recognition surface handle is not present for the right composition slot.'
    }),
    'pending-q-composed': Object.freeze({
        id: 'pending-q-composed',
        ownerTrack: 'Track 25.6 Q_composed',
        humanReason: 'The Q_composed opaque handle is absent; raw quaternion bodies remain forbidden.'
    }),
    'pending-virtue-witness': Object.freeze({
        id: 'pending-virtue-witness',
        ownerTrack: 'Track 21 virtue-witness',
        humanReason: 'The M0 R-virtue witness vector is not present for the grounding layer.'
    }),
    'pending-kairos-populator': Object.freeze({
        id: 'pending-kairos-populator',
        ownerTrack: 'Track 19.12 kairos-populator',
        humanReason: 'The kairos populator has not delivered live planetary degrees.'
    }),
    'pending-klein-flip': Object.freeze({
        id: 'pending-klein-flip',
        ownerTrack: 'Track 02 (M1 klein_flip)',
        humanReason: 'The klein_flip profile field is not present for the integrated cosmic texture.'
    }),
    'pending-resonance72': Object.freeze({
        id: 'pending-resonance72',
        ownerTrack: 'Track 10 readiness ledger (resonance72)',
        humanReason: 'The resonance72 profile field is not present for the M2 cymatic texture.'
    }),
    'pending-planetary-chakral': Object.freeze({
        id: 'pending-planetary-chakral',
        ownerTrack: 'Track 10 readiness ledger (planetary_chakral)',
        humanReason: 'The planetary_chakral profile field is not present for the M2 cymatic texture.'
    }),
    'pending-audio-octet': Object.freeze({
        id: 'pending-audio-octet',
        ownerTrack: "Track 02.4 M1' performance event",
        humanReason: 'The audio_octet profile field is not present for deterministic replay.'
    }),
    'pending-nodal-quartet': Object.freeze({
        id: 'pending-nodal-quartet',
        ownerTrack: "Track 02.4 M1' performance event",
        humanReason: 'The nodal_quartet profile field is not present for deterministic replay.'
    })
});

const FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = Object.freeze({
    audio_octet: Object.freeze(['audio_octet', 'audioOctet']),
    nodal_quartet: Object.freeze(['nodal_quartet', 'nodalQuartet']),
    planetaryChakral: Object.freeze(['planetaryChakral', 'planetary_chakral']),
    resonance72: Object.freeze(['resonance72']),
    kleinFlip: Object.freeze(['kleinFlip', 'klein_flip', 'kleinFlipState', 'klein_flip_state']),
    codon_rotation_projection: Object.freeze([
        'codon_rotation_projection',
        'codonRotationProjection',
        'codon_rotation_composition_export',
        'codonRotationCompositionExport',
        'm3CodonRotationProjectionForLensRing',
        'codonRotationProjectionForLensRing'
    ]),
    compositionMountPoint: Object.freeze(['compositionMountPoint', 'composition_mount_point']),
    k2SurfaceHandle: Object.freeze(['k2SurfaceHandle', 'k2_surface_handle', 'playedTorusSurfaceHandle']),
    ananda_vortex: Object.freeze([
        'ananda_vortex',
        'anandaVortex',
        'ananda_vortex_matrix',
        'anandaVortexMatrix',
        'vortexMatrixFamilies'
    ]),
    q_composed: Object.freeze([
        'q_composed',
        'qComposed',
        'q_composed_handle',
        'qComposedHandle',
        'protectedPersonalFieldHandles.qComposedHandle',
        'protected_personal_field_handles.q_composed_handle',
        'ProtectedPersonalFieldInput.qComposedHandle',
        'protectedPersonalFieldInput.qComposedHandle'
    ]),
    psychoid_cymatic: Object.freeze([
        'psychoid_cymatic',
        'psychoidCymatic',
        'psychoid_cymatic_renderer_handle',
        'psychoidCymaticRendererHandle'
    ]),
    recognitionSurface: Object.freeze([
        'recognitionSurface',
        'recognition_surface',
        'm5RecognitionSurfaceHandle',
        'm5_recognition_surface_handle'
    ]),
    virtueWitness: Object.freeze([
        'virtueWitness',
        'virtue_witness',
        'virtueWitnessVector',
        'virtue_witness_vector',
        'm0VerifierReport.virtue_witness_vector',
        'm0VerifierReport.virtueWitnessVector'
    ]),
    kairosPopulator: Object.freeze([
        'M4_Temporal_Now.planet_degrees',
        'm4TemporalNow.planetDegrees',
        'temporalNow.realtime.planet_degrees',
        'temporalNow.realTime.planetDegrees',
        'temporalNow.kairotic.planet_degrees',
        'temporalNow.kairotic.planetDegrees'
    ])
});

const PROFILE_FIELD_BLOCKERS: Readonly<Record<string, IntegratedCompositionBlockerId>> = Object.freeze({
    audio_octet: 'pending-audio-octet',
    nodal_quartet: 'pending-nodal-quartet',
    planetaryChakral: 'pending-planetary-chakral',
    resonance72: 'pending-resonance72',
    kleinFlip: 'pending-klein-flip',
    codon_rotation_projection: 'pending-codon-rotation-export'
});

export function buildIntegratedReadiness(
    compositionId: IntegratedReadiness['compositionId'],
    contributors: readonly IntegratedContributorRecord[],
    profile: MathemeHarmonicProfileBoundary | null
): IntegratedReadiness {
    const perPole = contributors.map(contributor => Object.freeze({
        extensionId: contributor.extensionId,
        readiness: contributor.readiness
    }));
    const slotInputs = compositionId === 'cosmic-engine.integrated'
        ? cosmicSlotInputs(profile)
        : jivaSivaSlotInputs(profile);
    const blockers = new Map<IntegratedCompositionBlockerId, CompositionBlockerDetail>();
    const perGeometricSlot = slotInputs.map(input => {
        const ownerContributor = input.ownerId
            ? contributors.find(contributor => contributor.extensionId === input.ownerId) ?? null
            : null;
        const fields = input.fields.map(field => {
            const present = hasAnyProfileValue(profile, field.aliases);
            if (!present && field.blockerId) {
                const detail = INTEGRATED_COMPOSITION_BLOCKER_DETAILS[field.blockerId];
                blockers.set(detail.id, detail);
            }
            return Object.freeze({
                field: field.field,
                present,
                blockerOwnerTrack: field.blockerOwnerTrack
            });
        });
        return Object.freeze({
            geometricSlot: input.geometricSlot,
            ownerId: input.ownerId,
            fields: Object.freeze(fields),
            slotState: slotState(ownerContributor, input.ownerId, fields)
        });
    });
    const compositionBlockers = Object.freeze([...blockers.values()].map(detail => Object.freeze({
        id: detail.id,
        ownerTrack: detail.ownerTrack,
        humanReason: detail.humanReason
    })));
    return Object.freeze({
        compositionId,
        overall: overallReadiness(contributors, compositionBlockers),
        perPole,
        perGeometricSlot,
        compositionBlockers
    });
}

function cosmicSlotInputs(profile: MathemeHarmonicProfileBoundary | null): readonly SlotReadinessInput[] {
    const panes = checkCosmicEnginePanes(profile);
    return Object.freeze([
        Object.freeze({
            geometricSlot: 'surface',
            ownerId: COSMIC_ENGINE_GEOMETRIC_LAYOUT.surface ?? null,
            fields: Object.freeze([
                syntheticField('k2SurfaceHandle', 'Track 22.2 played-torus', 'pending-k2-surface'),
                syntheticField('ananda_vortex', 'Track 10.10 ananda_vortex', 'pending-ananda-vortex'),
                ...fromCosmicFields(panes.m1RightInspector.fields)
            ])
        }),
        Object.freeze({
            geometricSlot: 'texture',
            ownerId: COSMIC_ENGINE_GEOMETRIC_LAYOUT.texture ?? null,
            fields: Object.freeze([
                syntheticField('compositionMountPoint', 'Track 23.10 cymatic-mount-point', 'pending-cymatic-mount-point'),
                ...fromCosmicFields(panes.m2LeftStage.fields)
            ])
        }),
        Object.freeze({
            geometricSlot: 'cell-state',
            ownerId: COSMIC_ENGINE_GEOMETRIC_LAYOUT['cell-state'] ?? null,
            fields: Object.freeze(fromCosmicFields(panes.m3CenterStage.fields))
        })
    ]);
}

function jivaSivaSlotInputs(profile: MathemeHarmonicProfileBoundary | null): readonly SlotReadinessInput[] {
    const panes = checkJivaSivaPanes(profile);
    return Object.freeze([
        Object.freeze({
            geometricSlot: 'left-composition',
            ownerId: JIVA_SIVA_GEOMETRIC_LAYOUT['left-composition'] ?? null,
            fields: Object.freeze(fromJivaSivaFields(panes.m4Foreground.fields))
        }),
        Object.freeze({
            geometricSlot: 'center-composition',
            ownerId: JIVA_SIVA_GEOMETRIC_LAYOUT['center-composition'] ?? null,
            fields: Object.freeze([
                syntheticField('q_composed', 'Track 25.6 Q_composed', 'pending-q-composed'),
                syntheticField('psychoid_cymatic', 'Track 05.5 / 25.6 psychoid-cymatic-solver', 'pending-psychoid-cymatic-solver'),
                ...fromJivaSivaFields(panes.m4Foreground.fields)
            ])
        }),
        Object.freeze({
            geometricSlot: 'right-composition',
            ownerId: JIVA_SIVA_GEOMETRIC_LAYOUT['right-composition'] ?? null,
            fields: Object.freeze([
                syntheticField('recognitionSurface', 'Track 26.11 recognition-surface', 'pending-recognition-surface'),
                ...fromJivaSivaFields(panes.m5Side.fields)
            ])
        }),
        Object.freeze({
            geometricSlot: 'grounding',
            ownerId: 'm0-anuttara',
            fields: Object.freeze([
                syntheticField('virtueWitness', 'Track 21 virtue-witness', 'pending-virtue-witness'),
                ...fromJivaSivaFields(panes.m0Backdrop.fields)
            ])
        }),
        Object.freeze({
            geometricSlot: 'composition-ambient',
            ownerId: 'm4-nara',
            fields: Object.freeze([
                syntheticField('kairosPopulator', 'Track 19.12 kairos-populator', 'pending-kairos-populator')
            ])
        }),
        Object.freeze({
            geometricSlot: 'composition-status',
            ownerId: 'm5-epii',
            fields: Object.freeze(fromJivaSivaFields(panes.m5Side.fields))
        })
    ]);
}

function fromCosmicFields(fields: readonly FieldAvailability[]): readonly FieldRequirement[] {
    return fields.map(field => Object.freeze({
        field: field.field,
        aliases: FIELD_ALIASES[field.field] ?? Object.freeze([field.field]),
        blockerOwnerTrack: field.blockerOwnerTrack,
        blockerId: PROFILE_FIELD_BLOCKERS[field.field]
    }));
}

function fromJivaSivaFields(fields: readonly JivaSivaFieldAvailability[]): readonly FieldRequirement[] {
    return fields.map(field => Object.freeze({
        field: field.field,
        aliases: FIELD_ALIASES[field.field] ?? Object.freeze([field.field]),
        blockerOwnerTrack: field.ownerTrack
    }));
}

function syntheticField(
    field: string,
    blockerOwnerTrack: string,
    blockerId: IntegratedCompositionBlockerId
): FieldRequirement {
    return Object.freeze({
        field,
        aliases: FIELD_ALIASES[field] ?? Object.freeze([field]),
        blockerOwnerTrack,
        blockerId
    });
}

function slotState(
    ownerContributor: IntegratedContributorRecord | null,
    ownerId: MExtensionId | null,
    fields: readonly { readonly present: boolean }[]
): IntegratedSlotState {
    if (ownerId && !ownerContributor) {
        return 'pending-contributor';
    }
    if (ownerContributor && readinessSeverity(ownerContributor.readiness.state) === 'blocked') {
        return 'blocked';
    }
    if (fields.some(field => !field.present)) {
        return 'pending-field';
    }
    return 'ready';
}

function overallReadiness(
    contributors: readonly IntegratedContributorRecord[],
    compositionBlockers: readonly { readonly id: IntegratedCompositionBlockerId }[]
): MExtensionReadinessState {
    let overall: MExtensionReadinessState = 'ready_public_current';
    let overallRank = severityRank(overall);
    for (const contributor of contributors) {
        const rank = severityRank(contributor.readiness.state);
        if (rank > overallRank) {
            overall = contributor.readiness.state;
            overallRank = rank;
        }
    }
    if (compositionBlockers.length > 0 && readinessSeverity(overall) !== 'blocked') {
        return 'profile_missing_field';
    }
    return overall;
}

function severityRank(state: MExtensionReadinessState): number {
    switch (readinessSeverity(state)) {
        case 'ok':
            return 0;
        case 'degraded':
            return 1;
        case 'blocked':
        default:
            return 2;
    }
}

function hasAnyProfileValue(
    profile: MathemeHarmonicProfileBoundary | null,
    aliases: readonly string[]
): boolean {
    if (!profile) {
        return false;
    }
    return aliases.some(alias => {
        const value = readPayloadPath(profile.payload, alias);
        return value !== undefined && value !== null;
    });
}

function readPayloadPath(payload: Readonly<Record<string, unknown>>, path: string): unknown {
    let current: unknown = payload;
    for (const segment of path.split('.')) {
        if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
            return undefined;
        }
        current = (current as Readonly<Record<string, unknown>>)[segment];
    }
    return current;
}

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
