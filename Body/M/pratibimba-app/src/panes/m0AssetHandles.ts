/**
 * Coordinate: M' M0-0' (image-asset handles on the language layer, rerun 01.T1.6 / 09.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: M0-0' image-asset handles per M0'-SPEC §Anuttara As Pre-Math Node
 *   Language (candidate DR-M0-4). S2 publishes node image handles via
 *   `c_1_asset_uri` (StringList, public) + classifies them via `c_1_asset_kind`
 *   (String, public) — the schema slot lands in graph-schema properties.rs. M0'
 *   renders them as asset handles with explicit `review_pending` provenance
 *   until user final-validation promotes DR-M0-4. Per spec the renderer NEVER
 *   infers, generates, or backfills asset URIs when the S2 payload is absent —
 *   an absent slot is canonical-absence, not a placeholder.
 * Public surface: M0_ASSET_URI_FIELD, M0_ASSET_KIND_FIELD, M0_ASSET_DR_GATE,
 *   M0AssetHandle, M0AssetHandlesProjection, buildM0AssetHandles.
 * Does NOT own: DR-M0-4 promotion (review_pending → canonical stays with the
 *   Architect + Track 40 canon-update), the schema property definitions
 *   (Body/S/S2/graph-schema/src/properties.rs), the rendered React panel
 *   (Track 21 frontend-deep — decan seals / sigils / glyphs beside the node).
 */
import type { ProvenanceState } from '../ui/ProvenanceBadge';

/** Canonical anuttara-language asset slot fields (graph-schema properties.rs). */
export const M0_ASSET_URI_FIELD = 'c_1_asset_uri' as const;
export const M0_ASSET_KIND_FIELD = 'c_1_asset_kind' as const;
/** The promotion gate: handles stay review_pending until the Architect ratifies. */
export const M0_ASSET_DR_GATE = 'candidate-DR-M0-4' as const;

export interface M0AssetHandle {
    readonly uri: string;
    readonly kind: string | null;
    /** Always `review_pending` pre-DR-M0-4 — never canonical. */
    readonly state: ProvenanceState;
}

export interface M0AssetHandlesProjection {
    readonly handles: readonly M0AssetHandle[];
    readonly kind: string | null;
    readonly state: ProvenanceState;
    readonly drGate: typeof M0_ASSET_DR_GATE;
}

export interface M0NodeLike {
    readonly payload?: unknown;
}

const EMPTY: Record<string, unknown> = Object.freeze({});

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function asArray(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Build the M0-0' asset-handles projection from a node payload. Handles present
 * → `review_pending` (candidate DR-M0-4); absent → `canonical_absent` with no
 * handles (never inferred or backfilled).
 */
export function buildM0AssetHandles(node: M0NodeLike | null | undefined): M0AssetHandlesProjection {
    const payload = isRecord(node?.payload) ? node.payload : EMPTY;
    const kind = asString(payload[M0_ASSET_KIND_FIELD]);
    const handles = Object.freeze(
        asArray(payload[M0_ASSET_URI_FIELD]).flatMap(raw => {
            const uri = asString(raw);
            if (!uri) {
                return [];
            }
            return [Object.freeze({ uri, kind, state: 'review_pending' as ProvenanceState })];
        })
    );
    return Object.freeze({
        handles,
        kind,
        state: (handles.length > 0 ? 'review_pending' : 'canonical_absent') as ProvenanceState,
        drGate: M0_ASSET_DR_GATE
    });
}
