/**
 * CoordinateContext — the shared selection model carried by every M-extension.
 *
 * Per 07.T1: selected coordinate, legacy `#` input, canonical M coordinate,
 * current profile generation, pointer anchor, DAY/NOW/session handle when
 * present, privacy class, and provenance.
 *
 * `#` legacy input is preserved separately from the resolved canonical M
 * coordinate so deferred-canon contradiction DCC-01 (M0 vs M1 `+1` attribution)
 * stays visible in UI provenance rather than being silently collapsed.
 */
export type PrivacyClass =
    | 'public_current'
    | 'public_current_with_graph_provenance'
    | 'public_current_audio_metadata_only'
    | 'public_current_with_pending_private_projection_blocks'
    | 'public_current_with_scalar_oracle_refs_only'
    | 'protected_local_handle_only'
    | 'governed_review_metadata_only';

export interface CoordinateProvenance {
    readonly source: string;
    readonly generation: number | null;
    readonly notes: readonly string[];
}

export interface CoordinateContext {
    readonly selectedCoordinate: string | null;
    readonly hashInput: string | null;
    readonly canonicalMCoordinate: string | null;
    readonly profileGeneration: number | null;
    readonly pointerAnchor: string | null;
    readonly dayNowSessionHandle: string | null;
    readonly privacyClass: PrivacyClass;
    readonly provenance: CoordinateProvenance;
}

export const EMPTY_COORDINATE_CONTEXT: CoordinateContext = Object.freeze({
    selectedCoordinate: null,
    hashInput: null,
    canonicalMCoordinate: null,
    profileGeneration: null,
    pointerAnchor: null,
    dayNowSessionHandle: null,
    privacyClass: 'public_current' as PrivacyClass,
    provenance: Object.freeze({
        source: 'm-extension-runtime:empty',
        generation: null,
        notes: Object.freeze([] as string[]) as readonly string[]
    })
});
