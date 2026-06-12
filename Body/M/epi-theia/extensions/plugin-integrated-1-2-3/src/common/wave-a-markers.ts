import { MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import { ProfileFieldName } from '@pratibimba/integrated-composition';

/**
 * Wave-A pending markers (07.T7.1)
 * ================================
 *
 * The cosmic-engine (1-2-3) integrated plugin renders M1/M2/M3 panes whose
 * profile fields are produced by Wave-A tranches that have not all landed yet.
 * Rather than fake a placeholder when one of those fields is absent, the plugin
 * surfaces an honest `profile_missing_field` readiness blocker keyed to a
 * declared Wave-A marker.
 *
 * These markers CONSUME the shared integrated-composition contract: each marker
 * that corresponds to a renderable profile pocket carries its
 * {@link ProfileFieldName} (owned by `integrated-composition/profile-field-checker`).
 * Markers with no profile-pocket field (e.g. the six-axes-of-72 decode that is
 * an M2 derivation rather than a profile field) carry `profileField: null`.
 *
 * "Extend, no rebuild": this file only DECLARES the pending markers and the
 * blocked-state shape that references them. It does not restructure the
 * existing readiness or profile-field-checker infrastructure.
 *
 * Cross-link → Wave-B Tranche 11.8: the resolution of these pending markers
 * (i.e. when the upstream tranches below land and the fields become present)
 * is tracked by Wave-B Tranche 11.8. See {@link WAVE_B_TRANCHE_CROSS_LINK}.
 */

/** Upstream Wave-A tranche references that own each pending marker. */
export type WaveATrancheRef =
    | 'M1 02.2'
    | 'kernel-bridge 10.2'
    | 'kernel-bridge'
    | 'M2 03.3'
    | "M1' performance event 02.4";

/** Owning module for a Wave-A pending marker. */
export type WaveAMarkerOwner =
    | 'm1-paramasiva'
    | 'm2-parashakti'
    | 'kernel-bridge';

/**
 * A single Wave-A blocked-state marker.
 *
 * - `marker`        — the canonical pending-field name as written in the tranche specs.
 * - `owningModule`  — the module responsible for producing the field.
 * - `tranche`       — the Wave-A tranche reference(s) the field flows from.
 * - `profileField`  — the shared integrated-composition contract field this
 *                     marker consumes, or `null` when the marker has no profile
 *                     pocket (a derivation rather than a transported field).
 * - `conditional`   — `true` when the field is aligned but gated on a further
 *                     event before it can be considered pending-but-expected.
 * - `conditionalOn` — the event the marker is gated on (only when conditional).
 */
export interface WaveAPendingMarker {
    readonly marker: string;
    readonly owningModule: WaveAMarkerOwner;
    readonly tranche: readonly WaveATrancheRef[];
    readonly profileField: ProfileFieldName | null;
    readonly conditional: boolean;
    readonly conditionalOn: WaveATrancheRef | null;
}

/**
 * The Wave-A pending markers consumed by the 1-2-3 integrated plugin.
 *
 * Ordered M1 → kernel-bridge → M2 → M1' to mirror the cosmic-spine flow
 * (M1 torus/path → bridge transport → M2 correspondence → M1' performance).
 */
export const WAVE_A_PENDING_MARKERS: readonly WaveAPendingMarker[] = Object.freeze([
    Object.freeze({
        marker: 'klein_flip',
        owningModule: 'm1-paramasiva',
        tranche: Object.freeze(['M1 02.2', 'kernel-bridge 10.2'] as WaveATrancheRef[]) as readonly WaveATrancheRef[],
        profileField: 'kleinFlip',
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'resonance72',
        owningModule: 'kernel-bridge',
        tranche: Object.freeze(['kernel-bridge'] as WaveATrancheRef[]) as readonly WaveATrancheRef[],
        profileField: 'resonance72',
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'six-axes-of-72 decoding',
        owningModule: 'm2-parashakti',
        tranche: Object.freeze(['M2 03.3'] as WaveATrancheRef[]) as readonly WaveATrancheRef[],
        // Derivation over resonance72 — not its own transported profile pocket.
        profileField: null,
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'audio_octet[8]',
        owningModule: 'm1-paramasiva',
        tranche: Object.freeze(["M1' performance event 02.4"] as WaveATrancheRef[]) as readonly WaveATrancheRef[],
        profileField: 'audio_octet',
        conditional: true,
        conditionalOn: "M1' performance event 02.4"
    }),
    Object.freeze({
        marker: 'nodal_quartet[4]',
        owningModule: 'm1-paramasiva',
        tranche: Object.freeze(["M1' performance event 02.4"] as WaveATrancheRef[]) as readonly WaveATrancheRef[],
        profileField: 'nodal_quartet',
        conditional: true,
        conditionalOn: "M1' performance event 02.4"
    })
]) as readonly WaveAPendingMarker[];

/** Marker-name union derived from {@link WAVE_A_PENDING_MARKERS} for typed lookups. */
export type WaveAMarkerName =
    | 'klein_flip'
    | 'resonance72'
    | 'six-axes-of-72 decoding'
    | 'audio_octet[8]'
    | 'nodal_quartet[4]';

/**
 * A typed IntegratedReadiness blocked-state declaration.
 *
 * The 1-2-3 plugin reports `profile_missing_field` (a blocked state in the
 * nine-state {@link MExtensionReadinessState} taxonomy) when one or more
 * Wave-A markers it depends on are still pending. `blockingMarkers` names the
 * exact markers responsible so the renderer can surface an honest blocker
 * rather than a placeholder.
 */
export interface IntegratedReadinessBlockedState {
    /** Always a blocked state in the readiness taxonomy — pinned to the field-missing case. */
    readonly state: Extract<MExtensionReadinessState, 'profile_missing_field'>;
    /** The Wave-A markers currently blocking this readiness state. */
    readonly blockingMarkers: readonly WaveAPendingMarker[];
    /** Stable blocker ids for {@link MExtensionReadinessSnapshot.blockerIds}. */
    readonly blockerIds: readonly string[];
}

/** Stable blocker-id namespace so Wave-A blockers are greppable across tracks. */
export const WAVE_A_BLOCKER_ID_PREFIX = 'wave-a.pending' as const;

/** Build a stable blocker id for a Wave-A marker. */
export function waveABlockerId(marker: WaveAPendingMarker): string {
    return `${WAVE_A_BLOCKER_ID_PREFIX}:${marker.marker}`;
}

/**
 * Construct a typed IntegratedReadiness blocked-state from a set of pending
 * markers. Pass the subset of {@link WAVE_A_PENDING_MARKERS} the plugin found
 * unavailable on the current profile generation.
 */
export function integratedReadinessBlockedBy(
    blockingMarkers: readonly WaveAPendingMarker[]
): IntegratedReadinessBlockedState {
    return Object.freeze({
        state: 'profile_missing_field' as const,
        blockingMarkers: Object.freeze([...blockingMarkers]) as readonly WaveAPendingMarker[],
        blockerIds: Object.freeze(blockingMarkers.map(waveABlockerId)) as readonly string[]
    });
}

/**
 * Documents the Wave-B cross-link. The pending markers above resolve as part
 * of Wave-B Tranche 11.8; this constant is the single point both waves cite so
 * the dependency stays discoverable from code.
 */
export const WAVE_B_TRANCHE_CROSS_LINK = {
    wave: 'B',
    tranche: '11.8',
    note: 'Wave-B Tranche 11.8 resolves the WAVE_A_PENDING_MARKERS declared here; until then the 1-2-3 plugin reports profile_missing_field blocked-states keyed to these markers.'
} as const;
