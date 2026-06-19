import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { M0_LAYER_VIEWS } from './m0-layers';
import type { M0LayerKey, M0LayerView } from './m0-layers';

export { M0_LAYER_VIEWS };
export type { M0LayerKey, M0LayerView };

const M0_PRIVACY_CLASS = 'public_current_with_graph_provenance';
const M0_S2_LAYER_QUERY_METHOD = 's2.graph.query';
const M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID = 'm0.anuttara.communityClockOverlay';
export const M0_ATELIER_CLUSTER_LENS_ID = 'pratibimba.daily.atelier-cluster-lens' as const;

export type M0InspectorLayer = 'lang' | 'ql' | 'rel' | 'time' | 'pers' | 'pedag';
export type M0SurfaceMode = 'reading' | 'authoring';

/**
 * Implicate / explicate phase (21.7). `implicate` reads the M0-side ground-state
 * fields (forward projection); `explicate` reads the Pratibimba-return,
 * articulated formulation (completed atelier route). The two-state toggle that
 * drives this lives in {@link ImplicateExplicateToggle}; the phase value is
 * preserved across selections via the `m0-anuttara.activeLayer`
 * `currentStateSelectors` reader (cross-link 21.20).
 */
export type M0Phase = 'implicate' | 'explicate';

export interface M0LayerS2Query {
    readonly method: typeof M0_S2_LAYER_QUERY_METHOD;
    readonly params: Readonly<{
        readonly coordinate: string | null;
        readonly layer: M0InspectorLayer;
        readonly sourceExtensionId: 'm0-anuttara';
        readonly privacyClass: typeof M0_PRIVACY_CLASS;
        readonly profileGeneration: number | null;
        readonly pointerAnchor: string | null;
    }>;
}

export interface M0LayerRoute {
    readonly layer: M0InspectorLayer;
    readonly layerKey: M0LayerKey;
    readonly tabId: string;
    readonly label: string;
    readonly summary: string;
    readonly routePath: string;
    readonly placement: M0LayerView['placement'];
    readonly bridgeRoute: string | null;
    readonly query: M0LayerS2Query;
    readonly mutatesGraphCanon: false;
}

const M0_LAYER_ROUTE_SPECS: readonly Readonly<{
    readonly layer: M0InspectorLayer;
    readonly viewKey: M0LayerView['key'];
    readonly routePath: string;
}>[] = Object.freeze([
    { layer: 'lang', viewKey: 'language', routePath: '/m0-anuttara/coordinate/language' },
    { layer: 'ql', viewKey: 'ql-structure', routePath: '/m0-anuttara/coordinate/ql' },
    { layer: 'rel', viewKey: 'relations', routePath: '/m0-anuttara/coordinate/relations' },
    { layer: 'time', viewKey: 'time-community', routePath: '/m0-anuttara/coordinate/time' },
    { layer: 'pers', viewKey: 'personal', routePath: '/m0-anuttara/coordinate/personal' },
    { layer: 'pedag', viewKey: 'pedagogy', routePath: '/m0-anuttara/coordinate/pedagogy' }
]);

export type M0ProvenanceState =
    | 'canonical'
    | 'canonical_absent'
    | 'derived'
    | 'inferred'
    | 'review_pending'
    | 'blocked'
    | 'bridged_local'
    | 'bridged_public';

export interface M0ProvenancedField {
    readonly key: string;
    readonly label: string;
    readonly value: string | null;
    readonly state: M0ProvenanceState;
    readonly provenance: string;
}

export interface M0AssetHandle {
    readonly uri: string;
    readonly kind: 'image' | 'sigil' | 'glyph' | 'seal' | 'tarot' | 'audio' | 'document';
    readonly state: M0ProvenanceState;
}

export interface M0GraphReadinessFact {
    readonly id: string;
    readonly label: string;
    readonly state: M0ProvenanceState;
    readonly summary: string;
    readonly canonical: boolean;
    readonly provenance: string;
}

export interface M0CommunityClockOverlay {
    readonly viewId: typeof M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID;
    readonly state: M0ProvenanceState;
    readonly readOnly: true;
    readonly mutatesGraphCanon: false;
    readonly usesLocalClock: false;
    readonly coordinate: string | null;
    readonly gdsCommunity: M0ProvenancedField;
    readonly activeNow: M0ProvenancedField;
    readonly projection: M0ProvenancedField;
    readonly privacyBoundary: M0ProvenancedField;
    readonly canonicalWritePerformed: false;
    readonly provenance: string;
}

export interface M0ProjectionLens {
    readonly id: typeof M0_ATELIER_CLUSTER_LENS_ID;
    readonly lensKind: 'etymological-cluster';
    readonly targetViewId: typeof M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID;
    readonly ownerExtension: 'm0-anuttara';
    readonly standaloneExtension: false;
    readonly provenance: string;
}

export interface M0M2ZodiacalRow {
    readonly vakSymbol: string;
    readonly m0ResonanceIdx: number;
    readonly m0Successor: number;
    readonly element: string;
    readonly mode: string;
    readonly m2SignIdx: number;
    readonly decanPlanets: readonly [string, string, string];
    readonly firstDecanIdx72: number;
}

export interface M0PsychoidRow {
    readonly lensCoordinate: string;
    readonly lensName: string;
    readonly planetName: string;
    readonly planetId: number;
}

export interface M0AlchemicalRow {
    readonly alchemicalName: string;
    readonly tattvicName: string;
    readonly mElemId: number;
    readonly cyclePoint: 'prima_materia' | 'ultima_materia' | 'intermediate';
}

export interface M0ParityBridgeProjection {
    readonly zodiacalBridge: readonly M0M2ZodiacalRow[] | null;
    readonly psychoidPlanetary: readonly M0PsychoidRow[] | null;
    readonly alchemicalToTattvic: readonly M0AlchemicalRow[] | null;
    readonly state: M0ProvenanceState;
}

export type M0SubTableId = 'ZODIACAL' | 'MONOPOLY' | 'DIVINE_ACT' | 'VIRTUE' | 'NONE';
export type M0SyntaxLayer = 'speech' | 'relationship' | 'action' | 'completion' | null;

export interface M0SubTableRow {
    readonly id: number;
    readonly label: string;
    readonly symbol: string | null;
    readonly provenance: string;
}

export interface M0ArchetypeRoutingProjection {
    readonly archetypeIndex: number | null;
    readonly archetypeLabel: string | null;
    readonly routedSubTable: M0SubTableId;
    readonly subTableRows: readonly M0SubTableRow[];
    readonly syntaxLayer: M0SyntaxLayer;
    readonly state: M0ProvenanceState;
}

export interface M0ContemplationProjection {
    readonly archetypeIndex: number | null;
    readonly prompt: string | null;
    readonly responseDraft: string;
    readonly state: M0ProvenanceState;
}

export interface QlStructureProjection {
    readonly position: 0 | 1 | 2 | 3 | 4 | 5 | null;
    readonly qlVariant: string | null;
    readonly familyContainsParent: string | null;
    readonly mirror: { readonly child: string | null; readonly inverse: string | null };
    readonly anchoredTo: readonly string[];
    readonly state: M0ProvenanceState;
}

export interface M0GatewayAction {
    readonly id: string;
    readonly label: string;
    readonly method: string;
    readonly params: Readonly<Record<string, unknown>>;
    readonly mutatesGraphCanon: false;
}

export interface M0InspectorModel {
    readonly phase: M0Phase;
    readonly mode: M0SurfaceMode;
    readonly query: {
        readonly input: string | null;
        readonly canonicalMCoordinate: string | null;
        readonly hashCompatible: boolean;
    };
    readonly node: {
        readonly coordinate: string | null;
        readonly label: string | null;
        readonly namespace: string | null;
        readonly badges: readonly string[];
    };
    readonly layerReadiness: Readonly<Record<M0LayerKey, M0ProvenanceState>>;
    readonly layerViews: readonly M0LayerView[];
    readonly layerRoutes: readonly M0LayerRoute[];
    readonly languageFields: readonly M0ProvenancedField[];
    readonly assetHandles: readonly M0AssetHandle[];
    readonly anchors: readonly M0ProvenancedField[];
    readonly pointerSummary: M0ProvenancedField;
    readonly relationFamilies: readonly M0ProvenancedField[];
    readonly readinessFacts: readonly M0GraphReadinessFact[];
    readonly communityClockOverlay: M0CommunityClockOverlay;
    readonly projectionLenses: readonly M0ProjectionLens[];
    readonly parityBridges: M0ParityBridgeProjection;
    readonly archetypeRouting: M0ArchetypeRoutingProjection;
    readonly contemplation: M0ContemplationProjection;
    readonly qlStructure: QlStructureProjection;
    readonly routeTargets: readonly string[];
    readonly actions: readonly M0GatewayAction[];
    readonly pedagogy: {
        readonly priorGroundBoundary: string;
        readonly parentAttribution: string;
        readonly contradiction: string;
    };
    readonly renderBudgetMs: 100;
}

export interface M0GraphNodePayload {
    readonly coordinate?: unknown;
    readonly canonicalCoordinate?: unknown;
    readonly label?: unknown;
    readonly labels?: unknown;
    readonly namespace?: unknown;
    readonly properties?: unknown;
    readonly pointerSummary?: unknown;
    readonly pointer_web?: unknown;
    readonly anchors?: unknown;
    readonly relations?: unknown;
    readonly readiness?: unknown;
    readonly gdsOverlay?: unknown;
    readonly gds_overlay?: unknown;
    readonly communityClockOverlay?: unknown;
    readonly community_clock_overlay?: unknown;
}

export function normalizeM0CoordinateInput(input: string | null | undefined): {
    readonly input: string | null;
    readonly canonicalMCoordinate: string | null;
    readonly hashCompatible: boolean;
} {
    const raw = input?.trim() ?? '';
    if (!raw) {
        return Object.freeze({
            input: null,
            canonicalMCoordinate: null,
            hashCompatible: false
        });
    }
    const hashMatch = /^#([0-5])(?:\b|$)/.exec(raw);
    if (hashMatch) {
        return Object.freeze({
            input: raw,
            canonicalMCoordinate: `M${hashMatch[1]}`,
            hashCompatible: true
        });
    }
    const mMatch = /^(?:M|m)([0-5])(?:['.]|\b|$)/.exec(raw);
    if (mMatch) {
        return Object.freeze({
            input: raw,
            canonicalMCoordinate: `M${mMatch[1]}`,
            hashCompatible: false
        });
    }
    return Object.freeze({
        input: raw,
        canonicalMCoordinate: null,
        hashCompatible: false
    });
}

export function buildM0InspectorModel(input: {
    readonly selectedInput?: string | null;
    readonly graphNode?: M0GraphNodePayload | null;
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly mode?: M0SurfaceMode;
    readonly phase?: M0Phase;
}): M0InspectorModel {
    const query = normalizeM0CoordinateInput(
        input.selectedInput ??
            input.context.hashInput ??
            input.context.selectedCoordinate ??
            input.context.canonicalMCoordinate
    );
    const properties = objectValue(input.graphNode?.properties);
    const coordinate =
        stringValue(input.graphNode?.canonicalCoordinate) ??
        stringValue(input.graphNode?.coordinate) ??
        stringValue(properties?.canonical_coordinate) ??
        stringValue(properties?.coordinate) ??
        query.canonicalMCoordinate;
    const namespace =
        stringValue(input.graphNode?.namespace) ??
        stringValue(properties?.namespace) ??
        stringValue(properties?.graph_namespace);
    const label = stringValue(input.graphNode?.label) ?? stringValue(properties?.label);

    return Object.freeze({
        phase: input.phase === 'explicate' ? 'explicate' : 'implicate',
        mode: input.mode === 'authoring' ? 'authoring' : 'reading',
        query,
        node: Object.freeze({
            coordinate,
            label,
            namespace,
            badges: Object.freeze(nodeBadges(input.graphNode, namespace))
        }),
        layerReadiness: layerReadiness(input.graphNode, properties, input.profile?.payload),
        layerViews: M0_LAYER_VIEWS,
        layerRoutes: Object.freeze(layerRoutes(coordinate, input)),
        languageFields: Object.freeze(languageFields(properties)),
        assetHandles: Object.freeze(assetHandles(properties)),
        anchors: Object.freeze(anchorFields(input.graphNode?.anchors ?? properties?.anchors)),
        pointerSummary: pointerField(input.graphNode, properties, input.profile ?? null),
        relationFamilies: Object.freeze(relationFamilyFields(input.graphNode, properties)),
        readinessFacts: Object.freeze(readinessFacts(input.graphNode, input.readiness)),
        communityClockOverlay: communityClockOverlay(coordinate, properties, input),
        projectionLenses: Object.freeze([atelierClusterLens()]),
        parityBridges: readM0ParityBridgeProjection(input.profile) ?? blockedParityBridgeProjection(),
        archetypeRouting: readM0ArchetypeRoutingProjection(input.graphNode, input.profile),
        contemplation: readM0ContemplationProjection(input.graphNode, input.profile),
        qlStructure: readM0QlStructureProjection(input.graphNode),
        routeTargets: Object.freeze(['M1', 'M2', 'M3', 'M4', 'M5']),
        actions: Object.freeze(actions(coordinate, input)),
        pedagogy: Object.freeze({
            priorGroundBoundary:
                'M0 is the prior 0/1 ground that M1 receives; it does not absorb the +1 parent.',
            parentAttribution:
                'The 137 = 64 + 72 + 1 teaching routes the +1 parent through M1/M2/M3 detail.',
            contradiction:
                'DCC-01: residual alpha wording can read M0 as witness-axis +1; this surface follows M0-SPEC and M1-SPEC while keeping the contradiction visible.'
        }),
        renderBudgetMs: 100 as const
    });
}

function atelierClusterLens(): M0ProjectionLens {
    return Object.freeze({
        id: M0_ATELIER_CLUSTER_LENS_ID,
        lensKind: 'etymological-cluster',
        targetViewId: M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID,
        ownerExtension: 'm0-anuttara',
        standaloneExtension: false,
        provenance:
            'atelier-projection-lens: etymological-cluster overlay on the existing m0-anuttara graph viewer; no logos-atelier extension'
    });
}

function layerReadiness(
    node: M0GraphNodePayload | null | undefined,
    properties: Record<string, unknown> | undefined,
    payload: unknown
): Readonly<Record<M0LayerKey, M0ProvenanceState>> {
    const profilePayload = objectValue(payload);
    return Object.freeze({
        language: stringValue(properties?.c_1_symbol) ? 'canonical' : 'canonical_absent',
        'ql-structure': stringValue(properties?.c_1_ql_variant)
            ? 'canonical'
            : 'canonical_absent',
        relations: arrayValue(node?.relations).length > 0 ? 'canonical' : 'canonical_absent',
        'time-community': stringValue(profilePayload?.gds_community) ? 'derived' : 'blocked',
        personal: 'bridged_local',
        pedagogy: 'bridged_public'
    });
}

export function readM0ParityBridgeProjection(
    profile: MathemeHarmonicProfileBoundary | null | undefined
): M0ParityBridgeProjection | null {
    const payload = objectValue(profile?.payload);
    const raw = objectValue(payload?.m0_m2_parity_bridges);
    if (!raw) {
        return null;
    }

    const zodiacalBridge = m0M2ZodiacalRows(raw.zodiacalBridge ?? raw.zodiacal_bridge);
    const psychoidPlanetary = m0PsychoidRows(
        raw.psychoidPlanetary ?? raw.psychoid_planetary
    );
    const alchemicalToTattvic = m0AlchemicalRows(
        raw.alchemicalToTattvic ?? raw.alchemical_to_tattvic
    );

    return Object.freeze({
        zodiacalBridge,
        psychoidPlanetary,
        alchemicalToTattvic,
        state:
            zodiacalBridge || psychoidPlanetary || alchemicalToTattvic
                ? provenanceStateFromRaw(raw.state, 'canonical')
                : 'blocked'
    });
}

const M0_ARCHETYPE_ROUTING_SPECS = Object.freeze({
    3: Object.freeze({
        label: 'Vak',
        subTable: 'ZODIACAL',
        syntaxLayer: 'speech',
        lutLabel: 'ZODIACAL_LUT'
    }),
    5: Object.freeze({
        label: 'Mono-Poly',
        subTable: 'MONOPOLY',
        syntaxLayer: 'relationship',
        lutLabel: 'MONOPOLY_LUT'
    }),
    7: Object.freeze({
        label: 'Acts of Śiva',
        subTable: 'DIVINE_ACT',
        syntaxLayer: 'action',
        lutLabel: 'DIVINE_ACT_LUT'
    }),
    9: Object.freeze({
        label: 'Virtue',
        subTable: 'VIRTUE',
        syntaxLayer: 'completion',
        lutLabel: 'VIRTUE_LUT'
    })
} satisfies Readonly<
    Record<
        3 | 5 | 7 | 9,
        {
            readonly label: string;
            readonly subTable: Exclude<M0SubTableId, 'NONE'>;
            readonly syntaxLayer: Exclude<M0SyntaxLayer, null>;
            readonly lutLabel: string;
        }
    >
>);

export function readM0ArchetypeRoutingProjection(
    node: M0GraphNodePayload | null | undefined,
    profile: MathemeHarmonicProfileBoundary | null | undefined
): M0ArchetypeRoutingProjection {
    const properties = objectValue(node?.properties);
    const archetypeIndex = integerishValue(
        properties?.c_1_archetype_index ??
            properties?.archetype_index ??
            profile?.payload?.c_1_archetype_index
    );
    const spec = archetypeRoutingSpec(archetypeIndex);
    if (!spec) {
        return Object.freeze({
            archetypeIndex,
            archetypeLabel: null,
            routedSubTable: 'NONE' as const,
            subTableRows: Object.freeze([]),
            syntaxLayer: null,
            state: archetypeIndex === null ? 'canonical_absent' : 'derived'
        });
    }

    const routedArchetypeIndex = archetypeIndex as 3 | 5 | 7 | 9;
    const rows = m0SubTableRowsForArchetype(profile, routedArchetypeIndex);
    return Object.freeze({
        archetypeIndex: routedArchetypeIndex,
        archetypeLabel: spec.label,
        routedSubTable: spec.subTable,
        subTableRows: rows,
        syntaxLayer: spec.syntaxLayer,
        state: rows.length ? 'canonical' : 'blocked'
    });
}

export function m0ArchetypeRoutingLutLabel(
    projection: Pick<M0ArchetypeRoutingProjection, 'archetypeIndex' | 'routedSubTable'>
): string | null {
    const spec = archetypeRoutingSpec(projection.archetypeIndex);
    return spec && projection.routedSubTable !== 'NONE'
        ? `${spec.lutLabel}[${projection.archetypeIndex}]`
        : null;
}

export function readM0ContemplationProjection(
    node: M0GraphNodePayload | null | undefined,
    profile: MathemeHarmonicProfileBoundary | null | undefined
): M0ContemplationProjection {
    const properties = objectValue(node?.properties);
    const archetypeIndex = integerishValue(
        properties?.c_1_archetype_index ??
            properties?.archetype_index ??
            profile?.payload?.c_1_archetype_index
    );
    const payload = objectValue(profile?.payload);
    const promptLut = arrayValue(payload?.contemplation_prompt_lut);
    const promptEntry = archetypeIndex === null ? undefined : promptLut[archetypeIndex];
    const prompt =
        stringValue(promptEntry) ??
        stringValue(objectValue(promptEntry)?.prompt) ??
        stringValue(objectValue(promptEntry)?.question);

    return Object.freeze({
        archetypeIndex,
        prompt,
        responseDraft: '',
        state:
            archetypeIndex === null
                ? 'canonical_absent'
                : prompt
                  ? 'canonical'
                  : 'blocked'
    });
}

function archetypeRoutingSpec(index: number | null | undefined) {
    if (index === 3 || index === 5 || index === 7 || index === 9) {
        return M0_ARCHETYPE_ROUTING_SPECS[index];
    }
    return null;
}

function m0SubTableRowsForArchetype(
    profile: MathemeHarmonicProfileBoundary | null | undefined,
    archetypeIndex: number
): readonly M0SubTableRow[] {
    const payload = objectValue(profile?.payload);
    const snapshot = objectValue(payload?.m0_routing_lut_snapshot);
    const archetypeLut = arrayValue(snapshot?.archetype_lut ?? snapshot?.archetypeLut);
    return Object.freeze(
        arrayValue(archetypeLut[archetypeIndex]).flatMap(item => {
            const row = objectValue(item);
            const id = integerishValue(row?.id);
            const label = stringValue(row?.label);
            const symbol = stringValue(row?.symbol);
            const provenance = stringValue(row?.provenance);
            if (id === null || !label || !provenance) {
                return [];
            }
            return [
                Object.freeze({
                    id,
                    label,
                    symbol,
                    provenance
                })
            ];
        })
    );
}

function communityClockOverlay(
    coordinate: string | null,
    properties: Record<string, unknown> | undefined,
    input: {
        readonly graphNode?: M0GraphNodePayload | null;
        readonly profile?: MathemeHarmonicProfileBoundary | null;
        readonly context: CoordinateContext;
    }
): M0CommunityClockOverlay {
    const profilePayload = objectValue(input.profile?.payload);
    const gdsOverlay = objectValue(
        input.graphNode?.gdsOverlay ??
            input.graphNode?.gds_overlay ??
            input.graphNode?.communityClockOverlay ??
            input.graphNode?.community_clock_overlay ??
            properties?.gdsOverlay ??
            properties?.gds_overlay ??
            properties?.communityClockOverlay ??
            properties?.community_clock_overlay ??
            profilePayload?.gdsOverlay ??
            profilePayload?.gds_overlay ??
            profilePayload?.communityClockOverlay ??
            profilePayload?.community_clock_overlay
    );
    const s3Projection = objectValue(
        profilePayload?.s3ActiveNow ??
            profilePayload?.s3_active_now ??
            profilePayload?.activeNow ??
            profilePayload?.active_now
    );
    const community =
        stringValue(gdsOverlay?.communityId) ??
        stringValue(gdsOverlay?.community_id) ??
        stringValue(gdsOverlay?.communityLabel) ??
        stringValue(gdsOverlay?.community_label) ??
        stringValue(gdsOverlay?.community);
    const activeNow =
        stringValue(s3Projection?.handle) ??
        stringValue(s3Projection?.activeNowHandle) ??
        stringValue(s3Projection?.active_now_handle) ??
        stringValue(s3Projection?.label) ??
        input.context.dayNowSessionHandle;
    const projection =
        stringValue(gdsOverlay?.projectionName) ??
        stringValue(gdsOverlay?.projection_name);
    const projectionVersion =
        stringValue(gdsOverlay?.projectionVersion) ??
        stringValue(gdsOverlay?.projection_version);
    const privacyBoundary =
        stringValue(gdsOverlay?.privacyBoundaryStatus) ??
        stringValue(gdsOverlay?.privacy_boundary_status) ??
        stringValue(gdsOverlay?.privacyBoundary) ??
        stringValue(gdsOverlay?.privacy_boundary);
    const gdsReady = gdsOverlay?.gdsReady === true || gdsOverlay?.gds_ready === true;
    const canonicalWritePerformed =
        gdsOverlay?.canonicalWritePerformed === true ||
        gdsOverlay?.canonical_write_performed === true;
    const overlayState: M0ProvenanceState =
        gdsReady && community && activeNow && !canonicalWritePerformed ? 'canonical' : 'blocked';

    return Object.freeze({
        viewId: M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID,
        state: overlayState,
        readOnly: true as const,
        mutatesGraphCanon: false as const,
        usesLocalClock: false as const,
        coordinate,
        gdsCommunity: Object.freeze({
            key: 'gds_community',
            label: 'GDS community',
            value: community,
            state: community && gdsReady ? 'canonical' : 'blocked',
            provenance: community
                ? 'S2 GDS overlay payload'
                : 'Blocked until Wave-B integrated-bimba 09.6 wires the S2 GDS community payload'
        }),
        activeNow: Object.freeze({
            key: 'active_now',
            label: 'Active-now clock',
            value: activeNow,
            state: activeNow ? 'derived' : 'blocked',
            provenance: activeNow
                ? 'S3 active-now projection or shared CoordinateContext day-now handle'
                : 'Blocked until S3 active-now projection is supplied by the bridge'
        }),
        projection: Object.freeze({
            key: 'gds_projection',
            label: 'GDS projection',
            value: [projection, projectionVersion].filter(Boolean).join('@') || null,
            state: projection ? 'derived' : 'blocked',
            provenance: projection
                ? 'S2 GDS projection metadata'
                : 'Blocked until S2 GDS projection metadata is supplied'
        }),
        privacyBoundary: Object.freeze({
            key: 'privacy_boundary',
            label: 'Privacy boundary',
            value: privacyBoundary,
            state: privacyBoundary ? 'derived' : 'blocked',
            provenance: privacyBoundary
                ? 'S2 public-coordinate topology privacy boundary'
                : 'Blocked until S2 states the GDS privacy boundary'
        }),
        canonicalWritePerformed: false as const,
        provenance:
            overlayState === 'canonical'
                ? 'S2 GDS community + S3 active-now projections; renderer is read-only and does not compute time'
                : 'provenance-state blocked until S2 GDS payload wired; renderer has no local clock'
    });
}

/** The three structural QL relation types the M0-1' reader traverses. */
const M0_QL_STRUCTURAL_RELATION_TYPES = Object.freeze([
    'FAMILY_CONTAINS',
    'MIRROR_CHILDREN',
    'ANCHORED_TO'
] as const);

/**
 * QL-structure (M0-1') projection selector.
 *
 * Reads the canonical `c_1_ql_position` / `c_1_ql_variant` properties plus the
 * structural relation field from the same `s2.graph.node` payload the other M0'
 * layers consume. Relation traversal is filtered by the Track 01.9
 * `c_1_relation_family` discriminator so correspondential edges never collapse
 * into the structural FAMILY_CONTAINS / MIRROR_CHILDREN / ANCHORED_TO reading.
 */
export function readM0QlStructureProjection(
    node: M0GraphNodePayload | null | undefined
): QlStructureProjection {
    const properties = objectValue(node?.properties);
    const position = qlPositionValue(properties?.c_1_ql_position);
    const qlVariant = stringValue(properties?.c_1_ql_variant);

    const structuralRelations = arrayValue(node?.relations ?? properties?.relations)
        .map(objectValue)
        .filter((relation): relation is Record<string, unknown> =>
            Boolean(relation) && isStructuralQlRelation(relation as Record<string, unknown>)
        );

    const familyContainsParent =
        relationTargetCoordinate(
            structuralRelations.find(relation => relationType(relation) === 'FAMILY_CONTAINS')
        ) ?? null;

    const mirrorRow = structuralRelations.find(
        relation => relationType(relation) === 'MIRROR_CHILDREN'
    );
    const mirror = Object.freeze({
        child: mirrorChildCoordinate(mirrorRow),
        inverse: mirrorInverseCoordinate(mirrorRow)
    });

    const anchoredTo = Object.freeze(
        structuralRelations
            .filter(relation => relationType(relation) === 'ANCHORED_TO')
            .map(relationTargetCoordinate)
            .filter((coordinate): coordinate is string => Boolean(coordinate))
    );

    const state: M0ProvenanceState =
        position !== null || qlVariant ? 'canonical' : 'canonical_absent';

    return Object.freeze({
        position,
        qlVariant,
        familyContainsParent,
        mirror,
        anchoredTo,
        state
    });
}

function qlPositionValue(raw: unknown): 0 | 1 | 2 | 3 | 4 | 5 | null {
    const value = integerValue(raw);
    return value !== null && value >= 0 && value <= 5 ? (value as 0 | 1 | 2 | 3 | 4 | 5) : null;
}

function relationType(relation: Record<string, unknown> | undefined): string | null {
    return (
        stringValue(relation?.type) ??
        stringValue(relation?.relationType) ??
        stringValue(relation?.rel_type)
    );
}

function relationTargetCoordinate(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relation?.target) ??
        stringValue(relation?.targetCoordinate) ??
        stringValue(relation?.target_coordinate) ??
        stringValue(relation?.coordinate) ??
        stringValue(relationProperties?.target_coordinate) ??
        stringValue(relationProperties?.coordinate)
    );
}

function relationFamilyDiscriminator(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relationProperties?.c_1_relation_family) ??
        stringValue(relation?.c_1_relation_family) ??
        stringValue(relationProperties?.relation_family) ??
        stringValue(relation?.relation_family)
    );
}

function isStructuralQlRelation(relation: Record<string, unknown>): boolean {
    const type = relationType(relation);
    if (!type || !M0_QL_STRUCTURAL_RELATION_TYPES.includes(type as never)) {
        return false;
    }
    const family = relationFamilyDiscriminator(relation);
    // Track 01.9 discriminator: keep structural-only edges; absent discriminator
    // is treated as structural since the relation type already names a structural edge.
    return !family || /structural/i.test(family);
}

function mirrorChildCoordinate(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relationProperties?.child) ??
        stringValue(relationProperties?.mirror_child) ??
        stringValue(relation?.child) ??
        relationTargetCoordinate(relation)
    );
}

function mirrorInverseCoordinate(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relationProperties?.inverse) ??
        stringValue(relationProperties?.mirror_inverse) ??
        stringValue(relation?.inverse)
    );
}

function blockedParityBridgeProjection(): M0ParityBridgeProjection {
    return Object.freeze({
        zodiacalBridge: null,
        psychoidPlanetary: null,
        alchemicalToTattvic: null,
        state: 'blocked' as const
    });
}

function m0M2ZodiacalRows(raw: unknown): readonly M0M2ZodiacalRow[] | null {
    const rows = arrayValue(raw).flatMap(item => {
        const row = objectValue(item);
        const decanPlanets = stringTuple3(row?.decanPlanets ?? row?.decan_planets);
        const vakSymbol = stringValue(row?.vakSymbol ?? row?.vak_symbol);
        const element = stringValue(row?.element);
        const mode = stringValue(row?.mode);
        const m0ResonanceIdx = integerValue(row?.m0ResonanceIdx ?? row?.m0_resonance_idx);
        const m0Successor = integerValue(row?.m0Successor ?? row?.m0_successor);
        const m2SignIdx = integerValue(row?.m2SignIdx ?? row?.m2_sign_idx);
        const firstDecanIdx72 = integerValue(row?.firstDecanIdx72 ?? row?.first_decan_idx_72);
        if (
            !vakSymbol ||
            !element ||
            !mode ||
            !decanPlanets ||
            m0ResonanceIdx === null ||
            m0Successor === null ||
            m2SignIdx === null ||
            firstDecanIdx72 === null
        ) {
            return [];
        }
        return [
            Object.freeze({
                vakSymbol,
                m0ResonanceIdx,
                m0Successor,
                element,
                mode,
                m2SignIdx,
                decanPlanets,
                firstDecanIdx72
            })
        ];
    });
    return rows.length === 12 ? Object.freeze(rows) : null;
}

function m0PsychoidRows(raw: unknown): readonly M0PsychoidRow[] | null {
    const rows = arrayValue(raw).flatMap(item => {
        const row = objectValue(item);
        const lensCoordinate = stringValue(row?.lensCoordinate ?? row?.lens_coordinate);
        const lensName = stringValue(row?.lensName ?? row?.lens_name);
        const planetName = stringValue(row?.planetName ?? row?.planet_name);
        const planetId = integerValue(row?.planetId ?? row?.planet_id);
        if (!lensCoordinate || !lensName || !planetName || planetId === null) {
            return [];
        }
        return [
            Object.freeze({
                lensCoordinate,
                lensName,
                planetName,
                planetId
            })
        ];
    });
    return rows.length === 7 ? Object.freeze(rows) : null;
}

function m0AlchemicalRows(raw: unknown): readonly M0AlchemicalRow[] | null {
    const rows = arrayValue(raw).flatMap(item => {
        const row = objectValue(item);
        const alchemicalName = stringValue(row?.alchemicalName ?? row?.alchemical_name);
        const tattvicName = stringValue(row?.tattvicName ?? row?.tattvic_name);
        const mElemId = integerValue(row?.mElemId ?? row?.m_elem_id);
        const cyclePoint = cyclePointValue(row?.cyclePoint ?? row?.cycle_point);
        if (!alchemicalName || !tattvicName || mElemId === null || !cyclePoint) {
            return [];
        }
        return [
            Object.freeze({
                alchemicalName,
                tattvicName,
                mElemId,
                cyclePoint
            })
        ];
    });
    return rows.length === 6 ? Object.freeze(rows) : null;
}

function layerRoutes(
    coordinate: string | null,
    input: {
        readonly profile?: MathemeHarmonicProfileBoundary | null;
        readonly context: CoordinateContext;
    }
): M0LayerRoute[] {
    return M0_LAYER_ROUTE_SPECS.map(spec => {
        const view = M0_LAYER_VIEWS.find(candidate => candidate.key === spec.viewKey);
        const profileGeneration = input.profile?.generation ?? input.context.profileGeneration ?? null;
        const pointerAnchor = input.profile?.pointerAnchor ?? input.context.pointerAnchor ?? null;
        return Object.freeze({
            layer: spec.layer,
            layerKey: spec.viewKey,
            tabId: `m0-layer-${spec.layer}`,
            label: view?.label ?? spec.layer,
            summary: view?.summary ?? '',
            routePath: spec.routePath,
            placement: view?.placement ?? 'local',
            bridgeRoute:
                view?.placement === 'bridged'
                    ? `${spec.routePath}?source=m0-anuttara${coordinate ? `&coordinate=${encodeURIComponent(coordinate)}` : ''}`
                    : null,
            query: Object.freeze({
                method: M0_S2_LAYER_QUERY_METHOD,
                params: Object.freeze({
                    coordinate,
                    layer: spec.layer,
                    sourceExtensionId: 'm0-anuttara',
                    privacyClass: M0_PRIVACY_CLASS,
                    profileGeneration,
                    pointerAnchor
                })
            }),
            mutatesGraphCanon: false as const
        });
    });
}

function field(
    key: string,
    label: string,
    raw: unknown,
    absentState: M0ProvenanceState
): M0ProvenancedField {
    const value = stringValue(raw);
    return Object.freeze({
        key,
        label,
        value,
        state: value ? 'canonical' : absentState,
        provenance: value
            ? 'S2 graph payload property'
            : 'Canonical absence from S2 graph payload; not a client extraction failure'
    });
}

const M0_LANGUAGE_FIELD_SPECS: readonly Readonly<{
    readonly key: string;
    readonly label: string;
    readonly aliases: readonly string[];
}>[] = Object.freeze([
    { key: 'c_1_symbol', label: 'Symbol', aliases: Object.freeze(['symbol']) },
    {
        key: 'c_1_formulation_type',
        label: 'Formulation type',
        aliases: Object.freeze(['formulation_type'])
    },
    {
        key: 'c_1_complete_formulation',
        label: 'Complete formulation',
        aliases: Object.freeze(['complete_formulation'])
    },
    { key: 'c_1_form', label: 'Form', aliases: Object.freeze(['form']) },
    {
        key: 'c_1_formulation_breakdown',
        label: 'Formulation breakdown',
        aliases: Object.freeze(['formulation_breakdown'])
    },
    {
        key: 'c_1_primary_designation',
        label: 'Primary designation',
        aliases: Object.freeze(['primary_designation'])
    },
    { key: 'c_1_name', label: 'Name', aliases: Object.freeze(['name']) }
]);

function languageFields(properties: Record<string, unknown> | undefined): M0ProvenancedField[] {
    return M0_LANGUAGE_FIELD_SPECS.map(spec =>
        canonicalLanguageField(spec.key, spec.label, properties, spec.aliases)
    );
}

function canonicalLanguageField(
    key: string,
    label: string,
    properties: Record<string, unknown> | undefined,
    aliases: readonly string[]
): M0ProvenancedField {
    const canonical = stringValue(properties?.[key]);
    if (canonical) {
        return Object.freeze({
            key,
            label,
            value: canonical,
            state: 'canonical' as const,
            provenance: `S2 graph payload property ${key}`
        });
    }

    for (const alias of aliases) {
        const derived = stringValue(properties?.[alias]);
        if (derived) {
            return Object.freeze({
                key,
                label,
                value: derived,
                state: 'derived' as const,
                provenance: `Derived from legacy alias ${alias}; canonical ${key} absent from S2 graph payload`
            });
        }
    }

    return Object.freeze({
        key,
        label,
        value: null,
        state: 'canonical_absent' as const,
        provenance: `Canonical absence of ${key} from S2 graph payload; not a client extraction failure`
    });
}

function assetHandles(properties: Record<string, unknown> | undefined): M0AssetHandle[] {
    const canonicalUris = stringListValue(properties?.c_1_asset_uri);
    const aliasUris = canonicalUris.length ? [] : stringListValue(properties?.asset_uri);
    const uris = canonicalUris.length ? canonicalUris : aliasUris;
    const kind =
        assetKindValue(properties?.c_1_asset_kind) ??
        assetKindValue(properties?.asset_kind) ??
        'document';
    const state: M0ProvenanceState = canonicalUris.length
        ? 'canonical'
        : aliasUris.length
          ? 'derived'
          : 'canonical_absent';

    if (!uris.length) {
        return [
            Object.freeze({
                uri: '',
                kind,
                state
            })
        ];
    }

    return uris.map(uri =>
        Object.freeze({
            uri,
            kind,
            state
        })
    );
}

function assetKindValue(raw: unknown): M0AssetHandle['kind'] | null {
    const value = stringValue(raw)?.toLowerCase().replace(/_/g, '-');
    if (!value) {
        return null;
    }
    if (value === 'image') {
        return 'image';
    }
    if (value === 'sigil') {
        return 'sigil';
    }
    if (value === 'glyph') {
        return 'glyph';
    }
    if (value === 'seal' || value.endsWith('-seal')) {
        return 'seal';
    }
    if (value === 'tarot' || value.endsWith('-tarot')) {
        return 'tarot';
    }
    if (value === 'audio') {
        return 'audio';
    }
    if (value === 'document' || value === 'doc') {
        return 'document';
    }
    return 'document';
}

function anchorFields(raw: unknown): M0ProvenancedField[] {
    const anchors = objectValue(raw);
    return ['source', 'spec', 'code', 'test'].map(key =>
        field(`${key}_anchor`, `${key} anchor`, anchors?.[key], 'canonical_absent')
    );
}

function pointerField(
    node: M0GraphNodePayload | null | undefined,
    properties: Record<string, unknown> | undefined,
    profile: MathemeHarmonicProfileBoundary | null
): M0ProvenancedField {
    const pointer = objectValue(node?.pointer_web ?? properties?.pointer_web);
    const summary =
        stringValue(node?.pointerSummary) ??
        stringValue(pointer?.summary) ??
        stringValue(profile?.payload?.pointer_summary);
    return Object.freeze({
        key: 'pointer_summary',
        label: 'Pointer-web summary',
        value: summary,
        state: summary ? 'derived' : 'blocked',
        provenance: summary
            ? 'S2 pointer-web payload or bridge profile payload'
            : 'Track 01/02 pointer anchor unavailable'
    });
}

function relationFamilyFields(
    node: M0GraphNodePayload | null | undefined,
    properties: Record<string, unknown> | undefined
): M0ProvenancedField[] {
    const fromProperties = Object.entries(properties ?? {})
        .filter(([key]) => /^c_[0-5]_family$/.test(key) || key === 'relation_family')
        .map(([key, value]) => field(key, key, value, 'canonical_absent'));
    const relations = arrayValue(node?.relations ?? properties?.relations).flatMap(item => {
        const relation = objectValue(item);
        const relationProperties = objectValue(relation?.properties);
        const family =
            stringValue(relationProperties?.family) ??
            stringValue(relationProperties?.c_family) ??
            stringValue(relation?.family);
        return family
            ? [
                  Object.freeze({
                      key: `relation:${stringValue(relation?.type) ?? 'edge'}`,
                      label: stringValue(relation?.type) ?? 'Relation family',
                      value: family,
                      state: 'canonical' as const,
                      provenance: 'S2 relation/property payload'
                  })
              ]
            : [];
    });
    return [...fromProperties, ...relations];
}

function readinessFacts(
    node: M0GraphNodePayload | null | undefined,
    readiness: MExtensionReadinessSnapshot
): M0GraphReadinessFact[] {
    const payload = objectValue(node?.readiness);
    return [
        fact('owl', 'OWL/n10s readiness', payload?.owl ?? payload?.n10s, readiness),
        fact('shacl', 'SHACL validation', payload?.shacl, readiness),
        fact('gds', 'GDS overlay handle', payload?.gds, readiness),
        fact('kernel-core', 'Kernel-core relation audit', payload?.kernel_core, readiness)
    ];
}

function fact(
    id: string,
    label: string,
    raw: unknown,
    fallback: MExtensionReadinessSnapshot
): M0GraphReadinessFact {
    const obj = objectValue(raw);
    const state = provenanceState(stringValue(obj?.state) ?? stringValue(raw), fallback);
    return Object.freeze({
        id,
        label,
        state,
        summary: stringValue(obj?.summary) ?? fallback.reason,
        canonical: state === 'canonical',
        provenance: stringValue(obj?.provenance) ?? 'S2 readiness payload'
    });
}

function actions(
    coordinate: string | null,
    input: {
        readonly profile?: MathemeHarmonicProfileBoundary | null;
        readonly context: CoordinateContext;
    }
): M0GatewayAction[] {
    const base = {
        coordinate,
        profileGeneration: input.profile?.generation ?? input.context.profileGeneration,
        pointerAnchor: input.profile?.pointerAnchor ?? input.context.pointerAnchor,
        privacyClass: M0_PRIVACY_CLASS,
        sourceExtensionId: 'm0-anuttara'
    };
    return [
        action('open-language-development-route', 'Open language-development route', "s5'.improve.propose", base),
        action('deposit-graph-readiness-evidence', 'Deposit graph readiness evidence', 's5.episodic.deposit', base),
        action('request-anuttara-review', 'Request Anuttara review', "s5'.review.submit", base)
    ];
}

function action(
    id: string,
    label: string,
    method: string,
    base: Readonly<Record<string, unknown>>
): M0GatewayAction {
    return Object.freeze({
        id,
        label,
        method,
        params: Object.freeze({
            ...base,
            targetKind: 'm0-anuttara.graph-language-readiness',
            mutatesGraphCanon: false as const
        }),
        mutatesGraphCanon: false as const
    });
}

function nodeBadges(
    node: M0GraphNodePayload | null | undefined,
    namespace: string | null
): string[] {
    const labels = arrayValue(node?.labels).filter((item): item is string => typeof item === 'string');
    return [namespace ? `namespace:${namespace}` : null, ...labels]
        .filter((item): item is string => Boolean(item))
        .filter(item => !/^family[_-]?c/i.test(item));
}

function provenanceState(
    raw: string | null,
    fallback: MExtensionReadinessSnapshot
): M0ProvenanceState {
    switch (raw) {
        case 'canonical':
        case 'canonical_absent':
        case 'derived':
        case 'inferred':
        case 'review_pending':
        case 'blocked':
        case 'bridged_local':
        case 'bridged_public':
            return raw;
        default:
            return fallback.state === 'ready_public_current' ? 'review_pending' : 'blocked';
    }
}

function provenanceStateFromRaw(
    raw: unknown,
    fallback: M0ProvenanceState
): M0ProvenanceState {
    switch (stringValue(raw)) {
        case 'canonical':
        case 'canonical_absent':
        case 'derived':
        case 'inferred':
        case 'review_pending':
        case 'blocked':
        case 'bridged_local':
        case 'bridged_public':
            return stringValue(raw) as M0ProvenanceState;
        default:
            return fallback;
    }
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function arrayValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function integerValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function integerishValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
    }
    if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
        return Number.parseInt(value, 10);
    }
    return null;
}

function cyclePointValue(value: unknown): M0AlchemicalRow['cyclePoint'] | null {
    switch (value) {
        case 'prima_materia':
        case 'ultima_materia':
        case 'intermediate':
            return value;
        default:
            return null;
    }
}

function stringTuple3(value: unknown): readonly [string, string, string] | null {
    const items = arrayValue(value).map(stringValue);
    return items.length === 3 && items.every((item): item is string => Boolean(item))
        ? Object.freeze([items[0], items[1], items[2]] as const)
        : null;
}

function stringListValue(value: unknown): string[] {
    if (typeof value === 'string') {
        return value.trim() ? [value] : [];
    }
    return arrayValue(value).flatMap(item => {
        const stringItem = stringValue(item);
        return stringItem ? [stringItem] : [];
    });
}
