import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { M0_LAYER_VIEWS, M0LayerView } from './m0-layers';

export { M0_LAYER_VIEWS };
export type { M0LayerView };

const M0_PRIVACY_CLASS = 'public_current_with_graph_provenance';
const M0_S2_LAYER_QUERY_METHOD = 's2.graph.query';
const M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID = 'm0.anuttara.communityClockOverlay';

export type M0InspectorLayer = 'lang' | 'ql' | 'rel' | 'time' | 'pers' | 'pedag';
export type M0SurfaceMode = 'reading' | 'authoring';

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
    | 'blocked';

export interface M0ProvenancedField {
    readonly key: string;
    readonly label: string;
    readonly value: string | null;
    readonly state: M0ProvenanceState;
    readonly provenance: string;
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

export interface M0GatewayAction {
    readonly id: string;
    readonly label: string;
    readonly method: string;
    readonly params: Readonly<Record<string, unknown>>;
    readonly mutatesGraphCanon: false;
}

export interface M0InspectorModel {
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
    readonly layerViews: readonly M0LayerView[];
    readonly layerRoutes: readonly M0LayerRoute[];
    readonly languageFields: readonly M0ProvenancedField[];
    readonly anchors: readonly M0ProvenancedField[];
    readonly pointerSummary: M0ProvenancedField;
    readonly relationFamilies: readonly M0ProvenancedField[];
    readonly readinessFacts: readonly M0GraphReadinessFact[];
    readonly communityClockOverlay: M0CommunityClockOverlay;
    readonly parityBridges: M0ParityBridgeProjection;
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
        mode: input.mode === 'authoring' ? 'authoring' : 'reading',
        query,
        node: Object.freeze({
            coordinate,
            label,
            namespace,
            badges: Object.freeze(nodeBadges(input.graphNode, namespace))
        }),
        layerViews: M0_LAYER_VIEWS,
        layerRoutes: Object.freeze(layerRoutes(coordinate, input)),
        languageFields: Object.freeze([
            field('symbol', 'Symbol', properties?.symbol, 'canonical_absent'),
            field(
                'formulation_type',
                'Formulation type',
                properties?.formulation_type,
                'canonical_absent'
            ),
            field(
                'complete_formulation',
                'Complete formulation',
                properties?.complete_formulation,
                'canonical_absent'
            ),
            assetHandleField(properties)
        ]),
        anchors: Object.freeze(anchorFields(input.graphNode?.anchors ?? properties?.anchors)),
        pointerSummary: pointerField(input.graphNode, properties, input.profile ?? null),
        relationFamilies: Object.freeze(relationFamilyFields(input.graphNode, properties)),
        readinessFacts: Object.freeze(readinessFacts(input.graphNode, input.readiness)),
        communityClockOverlay: communityClockOverlay(coordinate, properties, input),
        parityBridges: readM0ParityBridgeProjection(input.profile) ?? blockedParityBridgeProjection(),
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

function assetHandleField(
    properties: Record<string, unknown> | undefined
): M0ProvenancedField {
    const uris = stringListValue(properties?.c_1_asset_uri ?? properties?.asset_uri);
    const kind = stringValue(properties?.c_1_asset_kind ?? properties?.asset_kind);
    const value = uris.length ? [kind, uris.join(', ')].filter(Boolean).join(': ') : null;
    return Object.freeze({
        key: 'c_1_asset_uri',
        label: 'Asset handles',
        value,
        state: value ? 'review_pending' : 'canonical_absent',
        provenance: value
            ? 'Candidate DR-M0-4 S2 graph payload property c_1_asset_uri with c_1_asset_kind; user final-validation pending'
            : 'Canonical absence from S2 graph payload; not a client extraction failure'
    });
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
