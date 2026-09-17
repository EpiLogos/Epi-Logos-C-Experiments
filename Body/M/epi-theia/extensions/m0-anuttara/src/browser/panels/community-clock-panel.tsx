import * as React from 'react';
import type { MathemeHarmonicProfileBoundary, SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';
import type { M0GraphReadinessFact, M0ProvenanceState } from '../../common/m0-inspector';

/**
 * 21.5 — Community + Clock Overlay panel (M0-3', WC-M0-05).
 *
 * Reads the S2 GDS community projection (`profile.payload.gds_community`) and the
 * S3 Graphiti active-now tick (`profile.payload.active_now_clock`) and renders them
 * as a read-only overlay. Per DR-WC-M0-1 the standalone OWL/SHACL inspector widget
 * (view id `m0.anuttara.owlShaclInspector`) is downgraded into a sub-tab here; it
 * renders the existing graph `readinessFacts` rows rather than living as its own
 * widget.
 *
 * There is NO local clock: `activeNowClock.tick12` mirrors the kernel-bridge
 * profile-tick (Track 15.6). The panel computes no time of its own.
 */

/** Sub-tab id for the downgraded OWL/SHACL inspector (DR-WC-M0-1). */
export const M0_OWL_SHACL_INSPECTOR_VIEW_ID = 'm0.anuttara.owlShaclInspector' as const;
export const M0_GDS_TANGENT_OVERLAY_METHOD = 's2.graph.gds.tangent_overlay' as const;
export const M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID = 'm0.anuttara.communityClockOverlay' as const;
const M0_COMMUNITY_CLOCK_BLOCKER_ID = 'Track 02 T7/T8 coordinate-native graph API parity' as const;

/**
 * Blocker label rendered until the S2 GDS community payload arrives.
 */
export const M0_COMMUNITY_CLOCK_PENDING_LABEL = `pending: ${M0_COMMUNITY_CLOCK_BLOCKER_ID}` as const;

export interface M0CommunityIdEntry {
    readonly id: string;
    readonly size: number;
    readonly state: M0ProvenanceState;
}

export interface M0GdsTangentNode {
    readonly coordinate: string;
    readonly score: number;
    readonly sourceAlgorithm: string;
}

export interface M0WorldClockRow {
    readonly tick12: number | null;
    readonly degreeNode360: number | null;
    readonly sourceRef: string | null;
    readonly state: M0ProvenanceState;
}

export interface M0CommunityClockProjection {
    readonly communityIds: readonly M0CommunityIdEntry[];
    readonly gdsTangentNodes: readonly M0GdsTangentNode[];
    readonly activeNowClock: {
        readonly tick12: number | null;
        readonly degreeNode360: number | null;
        readonly state: M0ProvenanceState;
    };
    readonly worldClockRows: readonly M0WorldClockRow[];
    readonly graphitiEpisodeRefs: readonly string[];
    readonly gdsOverlayStatus: string | null;
    readonly gdsProjection: string | null;
    readonly gdsReason: string | null;
    readonly privacyBoundary: string | null;
    readonly method: typeof M0_GDS_TANGENT_OVERLAY_METHOD;
    readonly state: M0ProvenanceState;
}

/**
 * Surface model consumed by the panel. Mirrors the `communityClock` slice the
 * inspector model exposes plus the `readinessFacts` rows the OWL/SHACL sub-tab
 * renders.
 */
export interface M0InspectorModel {
    readonly communityClock: M0CommunityClockProjection;
}

export interface CommunityClockPanelProps {
    readonly projection: M0CommunityClockProjection;
    readonly readinessFacts: readonly M0GraphReadinessFact[];
}

type CommunityClockSubTab = 'community-clock' | 'owl-shacl';

export interface M0CommunityClockProjectionInput {
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly gdsOverlay?: unknown;
    readonly worldClockRows?: readonly unknown[];
    readonly gdsError?: string | null;
}

/**
 * Build the community + clock projection from the shared bridge profile.
 *
 * - `profile.payload.gds_community` (S2 GDS projection) → `communityIds`.
 * - `profile.payload.active_now_clock` (S3 Graphiti tick) → `activeNowClock`.
 * - `profile.payload.graphiti_episode_refs` → `graphitiEpisodeRefs`.
 *
 * Until the S2 GDS payload arrives the projection is `blocked`; the active-now
 * tick is read-only and mirrors the kernel-bridge profile-tick when present.
 */
export function buildM0CommunityClockProjection(
    inputOrProfile: MathemeHarmonicProfileBoundary | M0CommunityClockProjectionInput | null | undefined
): M0CommunityClockProjection {
    const input = isProjectionInput(inputOrProfile)
        ? inputOrProfile
        : { profile: inputOrProfile };
    const profile = input.profile;
    const payload = objectValue(profile?.payload);
    const gdsOverlay = objectValue(input.gdsOverlay);

    const communityIds = communityIdEntries(
        payload?.gds_community ?? payload?.gdsCommunity ?? gdsOverlay?.communityIds
    );
    const gdsTangentNodes = gdsTangentNodesFromOverlay(gdsOverlay);
    const activeNowClock = activeNowClockProjection(
        payload?.active_now_clock ??
            payload?.activeNowClock ??
            firstWorldClockRow(input.worldClockRows)
    );
    const worldClockRows = worldClockRowsFromRows(input.worldClockRows);
    const graphitiEpisodeRefs = stringListValue(
        payload?.graphiti_episode_refs ?? payload?.graphitiEpisodeRefs
    );
    const gdsOverlayStatus = stringValue(gdsOverlay?.status);
    const gdsProjection = [
        stringValue(gdsOverlay?.projectionName ?? gdsOverlay?.projection_name),
        stringValue(gdsOverlay?.projectionVersion ?? gdsOverlay?.projection_version)
    ].filter(Boolean).join('@') || null;
    const gdsReason = input.gdsError ?? stringValue(gdsOverlay?.reason);
    const privacyBoundary = stringValue(
        gdsOverlay?.privacyBoundaryStatus ??
            gdsOverlay?.privacy_boundary_status ??
            gdsOverlay?.privacyBoundary ??
            gdsOverlay?.privacy_boundary
    );

    const hasSynchronicCommunity = communityIds.length > 0 || gdsTangentNodes.length > 0;
    const hasDiachronicClock =
        activeNowClock.tick12 !== null ||
        activeNowClock.degreeNode360 !== null ||
        worldClockRows.length > 0 ||
        graphitiEpisodeRefs.length > 0;
    return Object.freeze({
        communityIds,
        gdsTangentNodes,
        activeNowClock,
        worldClockRows,
        graphitiEpisodeRefs,
        gdsOverlayStatus,
        gdsProjection,
        gdsReason,
        privacyBoundary,
        method: M0_GDS_TANGENT_OVERLAY_METHOD,
        state: hasSynchronicCommunity && hasDiachronicClock ? 'derived' : 'blocked'
    });
}

export async function loadM0GdsTangentOverlay(
    bridge: Pick<SharedBridgeAdapter, 'invokeGatewayRpc'>,
    coordinate: string,
    topK = 8
): Promise<unknown> {
    return bridge.invokeGatewayRpc(M0_GDS_TANGENT_OVERLAY_METHOD, {
        coordinate,
        topK,
        sourceExtensionId: 'm0-anuttara',
        privacyClass: 'public_current_with_graph_provenance'
    });
}

function communityIdEntries(raw: unknown): readonly M0CommunityIdEntry[] {
    return Object.freeze(
        arrayValue(raw).flatMap(item => {
            const row = objectValue(item);
            const id =
                stringValue(row?.id) ??
                stringValue(row?.community_id) ??
                stringValue(row?.communityId);
            if (!id) {
                return [];
            }
            return [
                Object.freeze({
                    id,
                    size: integerValue(row?.size ?? row?.member_count ?? row?.memberCount) ?? 0,
                    state: provenanceStateFromRaw(row?.state, 'derived')
                })
            ];
        })
    );
}

function activeNowClockProjection(raw: unknown): M0CommunityClockProjection['activeNowClock'] {
    const clock = objectValue(raw);
    const tick12 = integerValue(clock?.tick12 ?? clock?.tick_12);
    const degreeNode360 = integerValue(
        clock?.degreeNode360 ?? clock?.degree_node_360 ?? clock?.degree360 ?? clock?.degree_360
    );
    return Object.freeze({
        tick12,
        degreeNode360,
        // Mirrors the kernel-bridge profile-tick (Track 15.6); derived when supplied.
        state: tick12 !== null ? 'derived' : 'blocked'
    });
}

function gdsTangentNodesFromOverlay(raw: Record<string, unknown> | undefined): readonly M0GdsTangentNode[] {
    return Object.freeze(
        arrayValue(raw?.derivedNodes ?? raw?.derived_nodes).flatMap(item => {
            const row = objectValue(item);
            const coordinate = stringValue(row?.coordinate);
            const score = numberValue(row?.score);
            const sourceAlgorithm =
                stringValue(row?.sourceAlgorithm ?? row?.source_algorithm) ?? 'gds';
            if (!coordinate || score === null) {
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

export function worldClockRowsFromObservabilityPayload(
    payload: Readonly<Record<string, unknown>>
): readonly unknown[] {
    const table = payload.tableName ?? payload.table_name ?? payload.table;
    if (table !== 'world_clock') {
        return Object.freeze([]);
    }
    return Object.freeze(arrayValue(payload.inserts));
}

function worldClockRowsFromRows(rawRows: readonly unknown[] | undefined): readonly M0WorldClockRow[] {
    return Object.freeze(
        arrayValue(rawRows).flatMap(item => {
            const row = objectValue(item);
            const tick12 = integerValue(row?.tick12 ?? row?.tick_12);
            const degreeNode360 = integerValue(
                row?.degreeNode360 ??
                    row?.degree_node_360 ??
                    row?.degree360 ??
                    row?.degree_360
            );
            const sourceRef =
                stringValue(row?.sourceRef ?? row?.source_ref) ??
                stringValue(row?.world_clock_id) ??
                stringValue(row?.id);
            if (tick12 === null && degreeNode360 === null && !sourceRef) {
                return [];
            }
            return [
                Object.freeze({
                    tick12,
                    degreeNode360,
                    sourceRef,
                    state: tick12 !== null || degreeNode360 !== null ? 'derived' : 'blocked'
                })
            ];
        })
    );
}

function firstWorldClockRow(rawRows: readonly unknown[] | undefined): unknown {
    return arrayValue(rawRows)[0];
}

function tickLabel(tick12: number | null): string {
    return tick12 === null ? 'pending profile-tick' : String(tick12);
}

function degreeLabel(degreeNode360: number | null): string {
    return degreeNode360 === null ? 'pending degree node' : String(degreeNode360);
}

export function CommunityClockPanel(props: CommunityClockPanelProps): React.ReactElement {
    const { projection, readinessFacts } = props;
    const [subTab, setSubTab] = React.useState<CommunityClockSubTab>('community-clock');

    const blocked = projection.state === 'blocked';

    return (
        <section
            className="mext-widget-detail m0-community-clock-panel"
            data-widget-id="pratibimba.m0-anuttara:community-clock-panel"
            data-view-id={M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID}
            data-provenance-state={projection.state}
            aria-label="Community and clock overlay"
        >
            <h3>Community + clock overlay (M0-3')</h3>
            <div className="m0-community-clock-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    data-subtab-id="community-clock"
                    aria-selected={subTab === 'community-clock'}
                    onClick={() => setSubTab('community-clock')}
                >
                    Community + clock
                </button>
                <button
                    type="button"
                    role="tab"
                    data-subtab-id="owl-shacl"
                    data-downgraded-view-id={M0_OWL_SHACL_INSPECTOR_VIEW_ID}
                    aria-selected={subTab === 'owl-shacl'}
                    onClick={() => setSubTab('owl-shacl')}
                >
                    OWL / SHACL
                </button>
            </div>

            {subTab === 'community-clock' ? (
                <div
                    className="m0-community-clock-body"
                    role="tabpanel"
                    data-subtab-id="community-clock"
                    data-provenance-state={projection.state}
                >
                    {blocked ? (
                        <p
                            className="m0-community-clock-blocked"
                            data-provenance-state="blocked"
                            data-blocker-id={M0_COMMUNITY_CLOCK_BLOCKER_ID}
                        >
                            {M0_COMMUNITY_CLOCK_PENDING_LABEL}
                        </p>
                    ) : null}

                    <dl className="m0-community-clock-active-now">
                        <dt>Synchronic source</dt>
                        <dd data-method={projection.method}>{projection.method}</dd>
                        <dt>GDS projection</dt>
                        <dd data-provenance-state={projection.gdsProjection ? 'derived' : 'blocked'}>
                            {projection.gdsProjection ?? projection.gdsReason ?? 'pending GDS projection'}
                        </dd>
                        <dt>Privacy boundary</dt>
                        <dd data-provenance-state={projection.privacyBoundary ? 'derived' : 'blocked'}>
                            {projection.privacyBoundary ?? 'pending S2 privacy boundary'}
                        </dd>
                        <dt>Active-now tick (tick12)</dt>
                        <dd
                            data-clock-field-key="tick12"
                            data-provenance-state={projection.activeNowClock.state}
                        >
                            {tickLabel(projection.activeNowClock.tick12)}
                        </dd>
                        <dt>Degree node (360)</dt>
                        <dd
                            data-clock-field-key="degree_node_360"
                            data-provenance-state={projection.activeNowClock.state}
                        >
                            {degreeLabel(projection.activeNowClock.degreeNode360)}
                        </dd>
                    </dl>

                    <h4>Synchronic community</h4>
                    <ul className="m0-community-clock-community-ids" data-testid="m0-community-ids">
                        {projection.communityIds.length === 0 && projection.gdsTangentNodes.length === 0 ? (
                            <li
                                className="m0-community-clock-community-empty"
                                data-provenance-state="blocked"
                            >
                                No S2 GDS community payload yet
                            </li>
                        ) : (
                            <>
                                {projection.communityIds.map(entry => (
                                    <li
                                        key={entry.id}
                                        data-community-id={entry.id}
                                        data-provenance-state={entry.state}
                                    >
                                        <span className="m0-community-id">{entry.id}</span>
                                        <span className="m0-community-size">{entry.size}</span>
                                    </li>
                                ))}
                                {projection.gdsTangentNodes.map(entry => (
                                    <li
                                        key={`${entry.sourceAlgorithm}:${entry.coordinate}`}
                                        data-gds-tangent-coordinate={entry.coordinate}
                                        data-gds-source-algorithm={entry.sourceAlgorithm}
                                        data-provenance-state="derived"
                                    >
                                        <span className="m0-community-id">{entry.coordinate}</span>
                                        <span className="m0-community-size">
                                            {entry.sourceAlgorithm}:{entry.score.toFixed(3)}
                                        </span>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>

                    <h4>Diachronic clock</h4>
                    <ul className="m0-community-clock-world-rows" data-testid="m0-world-clock-rows">
                        {projection.worldClockRows.length === 0 ? (
                            <li data-provenance-state="blocked">No world_clock row yet</li>
                        ) : (
                            projection.worldClockRows.map((row, index) => (
                                <li
                                    key={`${row.sourceRef ?? 'world-clock'}:${index}`}
                                    data-world-clock-ref={row.sourceRef ?? undefined}
                                    data-provenance-state={row.state}
                                >
                                    tick12={tickLabel(row.tick12)} degree360={degreeLabel(row.degreeNode360)}
                                </li>
                            ))
                        )}
                    </ul>

                    {projection.graphitiEpisodeRefs.length ? (
                        <ul
                            className="m0-community-clock-episode-refs"
                            data-testid="m0-graphiti-episode-refs"
                        >
                            {projection.graphitiEpisodeRefs.map(ref => (
                                <li key={ref} data-graphiti-episode-ref={ref}>
                                    {ref}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : (
                <div
                    className="m0-community-clock-owl-shacl"
                    role="tabpanel"
                    data-subtab-id="owl-shacl"
                    data-view-id={M0_OWL_SHACL_INSPECTOR_VIEW_ID}
                >
                    <dl className="m0-owl-shacl-readiness-facts">
                        {readinessFacts.map(fact => (
                            <React.Fragment key={fact.id}>
                                <dt data-readiness-fact-id={fact.id}>{fact.label}</dt>
                                <dd data-provenance-state={fact.state}>{fact.summary}</dd>
                            </React.Fragment>
                        ))}
                    </dl>
                </div>
            )}
        </section>
    );
}

export default CommunityClockPanel;

// --- local payload helpers (the inspector keeps its own private copies) ---

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

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringListValue(value: unknown): readonly string[] {
    if (typeof value === 'string') {
        return value.trim() ? Object.freeze([value]) : Object.freeze([]);
    }
    return Object.freeze(
        arrayValue(value).flatMap(item => {
            const stringItem = stringValue(item);
            return stringItem ? [stringItem] : [];
        })
    );
}

function isProjectionInput(value: unknown): value is M0CommunityClockProjectionInput {
    return Boolean(
        value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            ('profile' in value || 'gdsOverlay' in value || 'worldClockRows' in value || 'gdsError' in value)
    );
}

function provenanceStateFromRaw(raw: unknown, fallback: M0ProvenanceState): M0ProvenanceState {
    switch (typeof raw === 'string' ? raw : null) {
        case 'canonical':
        case 'canonical_absent':
        case 'derived':
        case 'inferred':
        case 'review_pending':
        case 'blocked':
        case 'bridged_local':
        case 'bridged_public':
            return raw as M0ProvenanceState;
        default:
            return fallback;
    }
}
