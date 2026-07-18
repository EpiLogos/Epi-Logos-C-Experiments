/**
 * Coordinate: M' M0' (six-layer surface contract, rerun 01.T1.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the six M0-X' data layers per M0'-SPEC "The Six M0-X' Data Layers" —
 *   each a read/route affordance over the canonical substrate, never a canon owner.
 *   M0-0'..M0-3' render locally on the M0' graph surface with S2/S3 provenance;
 *   M0-4'/M0-5' are bridged deep-links into the owning M4'/M5' surfaces
 *   (no canon mutation, no local rendering of the bridged payload).
 * Public surface: M0LayerView (discriminate on `placement`), M0_LAYER_VIEWS,
 *   bridgedLayerRoute, M0_BRIDGE_ROUTE_SCHEME.
 * Does NOT own: canon mutation (every view pins mutatesGraphCanon: false, DR-M0-1),
 *   the bridged M4'/M5' payloads, per-layer rendering (relations discriminator
 *   T1.9, community/clock overlay T1.5).
 * Ported from: Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts
 *   (frozen warehouse), verified against M0'-SPEC. Spec-law divergence: routes
 *   emit the spec template `epi-logos://ide/{extensionId}{routePath}` — the
 *   frozen builder doubled the extension id (`…/m4-nara/m4-nara/artifact`),
 *   contradicting its own shared parser (m-extension-runtime route.ts).
 */

/** Deep-link scheme per the 07.T0 route convention (m-extension-runtime). */
export const M0_BRIDGE_ROUTE_SCHEME = 'epi-logos://ide';

export type M0LayerId = "M0-0'" | "M0-1'" | "M0-2'" | "M0-3'" | "M0-4'" | "M0-5'";

export type M0LayerKey =
    | 'language'
    | 'ql-structure'
    | 'relations'
    | 'time-community'
    | 'personal'
    | 'pedagogy';

/** Where a layer renders: locally on the M0' surface, or bridged into another M' surface. */
export type M0LayerPlacement = 'local' | 'bridged';

export interface M0LayerLocalView {
    readonly id: M0LayerId;
    readonly key: M0LayerKey;
    readonly label: string;
    readonly summary: string;
    readonly placement: 'local';
    readonly mutatesGraphCanon: false;
}

export interface M0LayerBridgedView {
    readonly id: M0LayerId;
    readonly key: M0LayerKey;
    readonly label: string;
    readonly summary: string;
    readonly placement: 'bridged';
    /** Target M' surface id the deep-link routes into (e.g. `m4-nara`, `m5-epii`). */
    readonly bridgeExtensionId: string;
    /** Route path within the bridged surface, after the extension-id segment. */
    readonly bridgeRoutePath: string;
    readonly mutatesGraphCanon: false;
}

/** Discriminated union over the six M0-X' layers; discriminate on `placement`. */
export type M0LayerView = M0LayerLocalView | M0LayerBridgedView;

function localLayer(
    id: M0LayerId,
    key: M0LayerKey,
    label: string,
    summary: string
): M0LayerLocalView {
    return Object.freeze({
        id,
        key,
        label,
        summary,
        placement: 'local' as const,
        mutatesGraphCanon: false as const
    });
}

function bridgedLayer(
    id: M0LayerId,
    key: M0LayerKey,
    label: string,
    summary: string,
    bridgeExtensionId: string,
    bridgeRoutePath: string
): M0LayerBridgedView {
    return Object.freeze({
        id,
        key,
        label,
        summary,
        placement: 'bridged' as const,
        bridgeExtensionId,
        bridgeRoutePath,
        mutatesGraphCanon: false as const
    });
}

export const M0_LAYER_VIEWS: readonly M0LayerView[] = Object.freeze([
    localLayer(
        "M0-0'",
        'language',
        'Pre-math node language',
        'symbol / formulation_type / complete_formulation projections; missing values are canonical-absence, not placeholders.'
    ),
    localLayer(
        "M0-1'",
        'ql-structure',
        'QL structure',
        'family/mirror/lens/inversion pointer-web, position-character, and Gebser register from S2 pointer law.'
    ),
    localLayer(
        "M0-2'",
        'relations',
        'Relation field',
        'typed edges carrying the c_1_relation_family discriminator; structural and correspondential edges never collapse.'
    ),
    localLayer(
        "M0-3'",
        'time-community',
        'Time / community overlay',
        'GDS community plus active-now clock overlay, read-only from S2/S3 projections; no renderer-local clock.'
    ),
    bridgedLayer(
        "M0-4'",
        'personal',
        'Personal route (M4 Nara)',
        "deep-link into M4' Nara for the coordinate's personal/Kerykeion context; bridged, no canon mutation.",
        'm4-nara',
        '/artifact'
    ),
    bridgedLayer(
        "M0-5'",
        'pedagogy',
        'Pedagogy route (M5 Epii)',
        "deep-link into M5' Epii atelier for the coordinate's review/teaching context; bridged, no canon mutation.",
        'm5-epii',
        '/review'
    )
]);

/**
 * Build the bridged deep-link for a bridged layer, scoped to a selected coordinate.
 * Returns null for local layers (they render on the M0' surface, not via a route).
 */
export function bridgedLayerRoute(
    layer: M0LayerView,
    coordinate: string | null
): string | null {
    if (layer.placement !== 'bridged') {
        return null;
    }
    const query = coordinate
        ? `?coordinate=${encodeURIComponent(coordinate)}&source=m0-anuttara`
        : '?source=m0-anuttara';
    return `${M0_BRIDGE_ROUTE_SCHEME}/${layer.bridgeExtensionId}${layer.bridgeRoutePath}${query}`;
}

/* ------------------------------------------------------------------------ *
 * Per-layer routing model (rerun 09.T9.1, sibling of 01.T1.1)
 * Frozen-warehouse law: m0-inspector.ts M0InspectorLayer short keys +
 * M0_LAYER_ROUTE_SPECS tab routes. The single S2 query path is shared across
 * every local layer — layers discriminate WHICH spec-named projections render,
 * never HOW the substrate is read.
 * ------------------------------------------------------------------------ */

/** Short layer discriminator carried by tab routes and cross-pane commands. */
export type M0InspectorLayer = 'lang' | 'ql' | 'rel' | 'time' | 'pers' | 'pedag';

export interface M0LayerRoute {
    readonly layer: M0InspectorLayer;
    readonly layerKey: M0LayerKey;
    readonly routePath: string;
    readonly commandId: string;
    readonly view: M0LayerView;
}

const LAYER_ROUTE_SPECS: readonly Readonly<{
    layer: M0InspectorLayer;
    layerKey: M0LayerKey;
    routePath: string;
}>[] = Object.freeze([
    { layer: 'lang', layerKey: 'language', routePath: '/m0-anuttara/coordinate/language' },
    { layer: 'ql', layerKey: 'ql-structure', routePath: '/m0-anuttara/coordinate/ql' },
    { layer: 'rel', layerKey: 'relations', routePath: '/m0-anuttara/coordinate/relations' },
    { layer: 'time', layerKey: 'time-community', routePath: '/m0-anuttara/coordinate/time' },
    { layer: 'pers', layerKey: 'personal', routePath: '/m0-anuttara/coordinate/personal' },
    { layer: 'pedag', layerKey: 'pedagogy', routePath: '/m0-anuttara/coordinate/pedagogy' }
]);

export const M0_LAYER_ROUTES: readonly M0LayerRoute[] = Object.freeze(
    LAYER_ROUTE_SPECS.map(spec => {
        const view = M0_LAYER_VIEWS.find(candidate => candidate.key === spec.layerKey);
        if (!view) {
            throw new Error(`m0Layers: no layer view for route key ${spec.layerKey}`);
        }
        return Object.freeze({
            layer: spec.layer,
            layerKey: spec.layerKey,
            routePath: spec.routePath,
            commandId: `m0.layer.${spec.layer}`,
            view
        });
    })
);

/**
 * Spec-named projections each LOCAL layer renders over the shared query result
 * (M0'-SPEC §The Six M0-X' Data Layers). Bridged layers render nothing locally.
 */
export const M0_LAYER_FIELDS: Readonly<Record<M0InspectorLayer, readonly string[]>> =
    Object.freeze({
        lang: [
            'c_1_symbol',
            'c_1_formulation_type',
            'c_1_complete_formulation',
            'c_1_form',
            'c_1_formulation_breakdown',
            'c_1_primary_designation',
            'c_1_name',
            // M0-0' image-asset handles (rerun 01.T1.6 / 09.3, candidate DR-M0-4):
            // rendered review_pending until user validation promotes DR-M0-4; the
            // renderer never infers/backfills. Projection: m0AssetHandles.ts.
            'c_1_asset_uri',
            'c_1_asset_kind'
        ],
        ql: ['family', 'mirror', 'lens', 'inversion', 'position_character', 'gebser_register'],
        rel: ['relations', 'c_1_relation_family'],
        time: ['community', 'active_now_clock'],
        pers: [],
        pedag: []
    });

export interface M0LayerS2Query {
    readonly method: 's2.graph.node';
    readonly params: Readonly<{ coordinate: string }>;
}

/**
 * The ONE S2 read path every local layer shares: the coordinate's node +
 * relations via the real gateway method (`s2.graph.node`, live-probed). Layer
 * identity never changes the read — it selects which M0_LAYER_FIELDS render.
 * Returns null when no coordinate is selected or the layer is bridged
 * (bridged layers route via bridgedLayerRoute, they never query locally).
 */
export function m0LayerS2Query(
    route: M0LayerRoute,
    coordinate: string | null
): M0LayerS2Query | null {
    if (route.view.placement !== 'local' || !coordinate) {
        return null;
    }
    return { method: 's2.graph.node', params: { coordinate } };
}
