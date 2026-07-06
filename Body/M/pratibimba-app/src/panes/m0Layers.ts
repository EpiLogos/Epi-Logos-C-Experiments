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
