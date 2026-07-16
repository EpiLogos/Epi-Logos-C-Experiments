/**
 * Coordinate: M' M0-3' (time / community overlay, 09.T9.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-3' synchronic / diachronic projection boundary
 * Actualises: the M0-3' community + active-now clock overlay per M0'-SPEC
 *   §The Six M0-X' Data Layers — a READ-ONLY projection over the S2 GDS
 *   tangent-overlay payload + the S3 active-now tick and public Graphiti episode
 *   handles. There is NO renderer-local clock: the active-now tick is read from
 *   the S3 / kernel-bridge projection, never computed here (no Date, no wall-clock).
 * Public surface: M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID,
 *   M0_GDS_TANGENT_OVERLAY_METHOD, M0_COMMUNITY_CLOCK_PENDING_LABEL,
 *   M0CommunityClockProjection, buildM0CommunityClockOverlay.
 * Does NOT own: canon mutation (read-only), the S2 GDS computation
 *   (graph-services), the world clock, or Graphiti episode bodies.
 * Contract: [[M0'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.6.
 * Ported from: Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/
 *   community-clock-panel.tsx (frozen warehouse). Cribbed as NEW code, verified
 *   against M0'-SPEC + the carrier ProvenanceState taxonomy; the Theia React
 *   panel and @pratibimba/m-extension-runtime deps are dropped — this is the
 *   pure projection contract the carrier surface consumes.
 */
import type { ProvenanceState } from '../ui/ProvenanceBadge';

export const M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID = 'm0.anuttara.communityClockOverlay' as const;
export const M0_GDS_TANGENT_OVERLAY_METHOD = 's2.graph.gds.tangent_overlay' as const;

export const M0_COMMUNITY_CLOCK_PENDING_LABEL = 'pending: no derived S2 GDS communities' as const;

export interface M0CommunityIdEntry {
    readonly id: string;
    readonly size: number;
    readonly state: ProvenanceState;
}

export interface M0GdsTangentNode {
    readonly coordinate: string;
    readonly score: number;
    readonly sourceAlgorithm: string;
}

/** The active-now tick — mirrors the S3/kernel-bridge profile-tick, never local. */
export interface M0ActiveNowClock {
    readonly tick12: number | null;
    readonly degreeNode360: number | null;
    readonly state: ProvenanceState;
}

export interface M0CommunityClockProjection {
    readonly communityIds: readonly M0CommunityIdEntry[];
    readonly gdsTangentNodes: readonly M0GdsTangentNode[];
    readonly activeNowClock: M0ActiveNowClock;
    readonly graphitiEpisodeRefs: readonly string[];
    readonly gdsOverlayStatus: string | null;
    readonly gdsReason: string | null;
    readonly privacyBoundary: string | null;
    readonly method: typeof M0_GDS_TANGENT_OVERLAY_METHOD;
    readonly state: ProvenanceState;
}

/** Minimal structural shape of the shared bridge profile this overlay reads. */
export interface M0ProfileLike {
    readonly payload?: unknown;
}

export interface M0CommunityClockOverlayInput {
    readonly profile?: M0ProfileLike | null;
    readonly gdsOverlay?: unknown;
    readonly gdsError?: string | null;
}

const EMPTY: Record<string, unknown> = Object.freeze({});

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function asRecord(value: unknown): Record<string, unknown> {
    return isRecord(value) ? value : EMPTY;
}
function asArray(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
function asInteger(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null;
}
function asBoundedInteger(value: unknown, min: number, maxExclusive: number): number | null {
    const integer = asInteger(value);
    return integer !== null && integer >= min && integer < maxExclusive ? integer : null;
}
function asHandleList(value: unknown): readonly string[] {
    return Object.freeze(
        asArray(value)
            .map(asString)
            .filter(
                (s): s is string =>
                    s !== null && s.length <= 256 && /^[A-Za-z0-9][A-Za-z0-9._:/#-]*$/.test(s)
            )
    );
}

function isOverlayInput(
    value: M0ProfileLike | M0CommunityClockOverlayInput | null | undefined
): value is M0CommunityClockOverlayInput {
    return isRecord(value) && ('profile' in value || 'gdsOverlay' in value || 'gdsError' in value);
}

function communityIdEntries(raw: unknown): readonly M0CommunityIdEntry[] {
    return Object.freeze(
        asArray(raw).flatMap(item => {
            const row = asRecord(item);
            const id = asString(row.id) ?? asString(row.community_id) ?? asString(row.communityId);
            if (!id) {
                return [];
            }
            return [
                Object.freeze({
                    id,
                    size: asInteger(row.size ?? row.member_count ?? row.memberCount) ?? 0,
                    state: 'derived' as ProvenanceState
                })
            ];
        })
    );
}

function gdsTangentNodesFromOverlay(overlay: Record<string, unknown>): readonly M0GdsTangentNode[] {
    return Object.freeze(
        asArray(overlay.derivedNodes ?? overlay.nodes ?? overlay.tangentNodes).flatMap(item => {
            const row = asRecord(item);
            const coordinate = asString(row.coordinate);
            const score = typeof row.score === 'number' && Number.isFinite(row.score) ? row.score : null;
            const sourceAlgorithm = asString(row.sourceAlgorithm ?? row.source_algorithm);
            if (!coordinate || score === null || !sourceAlgorithm) {
                return [];
            }
            return [
                Object.freeze({
                    coordinate,
                    score,
                    sourceAlgorithm
                })
            ];
        })
    );
}

function activeNowClockProjection(raw: unknown): M0ActiveNowClock {
    const clock = asRecord(raw);
    const tick12 = asBoundedInteger(clock.tick12 ?? clock.tick_12, 0, 12);
    const degreeNode360 = asBoundedInteger(
        clock.degreeNode360 ?? clock.degree_node_360 ?? clock.degree360 ?? clock.degree_360,
        0,
        360
    );
    const present = tick12 !== null || degreeNode360 !== null;
    return Object.freeze({
        tick12,
        degreeNode360,
        state: (present ? 'derived' : 'blocked') as ProvenanceState
    });
}

/**
 * Build the M0-3' community + clock projection from the shared bridge profile
 * (and an optional S2 GDS tangent-overlay payload). Blocked until BOTH a
 * synchronic community source and a diachronic clock/episode source are wired;
 * read-only; never reads a local clock.
 */
export function buildM0CommunityClockOverlay(
    inputOrProfile: M0ProfileLike | M0CommunityClockOverlayInput | null | undefined
): M0CommunityClockProjection {
    const input: M0CommunityClockOverlayInput = isOverlayInput(inputOrProfile)
        ? inputOrProfile
        : { profile: inputOrProfile ?? null };
    const payload = asRecord(input.profile?.payload);
    const gdsOverlay = asRecord(input.gdsOverlay);

    const communityIds = communityIdEntries(
        payload.gds_community ?? payload.gdsCommunity ?? gdsOverlay.communityIds
    );
    const gdsTangentNodes = gdsTangentNodesFromOverlay(gdsOverlay);
    const activeNowClock = activeNowClockProjection(payload.active_now_clock ?? payload.activeNowClock);
    const graphitiEpisodeRefs = asHandleList(payload.graphiti_episode_refs ?? payload.graphitiEpisodeRefs);
    const gdsOverlayStatus = asString(gdsOverlay.status);
    const gdsReason = input.gdsError ?? asString(gdsOverlay.reason);
    const privacyBoundary = asString(
        gdsOverlay.privacyBoundaryStatus ?? gdsOverlay.privacy_boundary_status
    );

    const hasSynchronicCommunity = communityIds.length > 0 || gdsTangentNodes.length > 0;
    const hasDiachronicClock =
        activeNowClock.tick12 !== null ||
        activeNowClock.degreeNode360 !== null ||
        graphitiEpisodeRefs.length > 0;

    return Object.freeze({
        communityIds,
        gdsTangentNodes,
        activeNowClock,
        graphitiEpisodeRefs,
        gdsOverlayStatus,
        gdsReason,
        privacyBoundary,
        method: M0_GDS_TANGENT_OVERLAY_METHOD,
        state: (hasSynchronicCommunity && hasDiachronicClock ? 'derived' : 'blocked') as ProvenanceState
    });
}
