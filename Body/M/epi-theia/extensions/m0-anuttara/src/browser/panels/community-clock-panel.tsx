import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import {
    COMMUNITY_CLOCK_OVERLAY_VIEW_ID,
    DECLARED_BLOCKERS
} from '../../common';
import type { M0GraphReadinessFact, M0ProvenanceState } from '../../common';

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

/**
 * Blocker label rendered until the S2 GDS community payload arrives. Sourced from
 * the canonical `DECLARED_BLOCKERS` constant so the wording stays in one place.
 */
export const M0_COMMUNITY_CLOCK_PENDING_LABEL = `pending: ${DECLARED_BLOCKERS[0]}` as const;

export interface M0CommunityIdEntry {
    readonly id: string;
    readonly size: number;
    readonly state: M0ProvenanceState;
}

export interface M0CommunityClockProjection {
    readonly communityIds: readonly M0CommunityIdEntry[];
    readonly activeNowClock: {
        readonly tick12: number | null;
        readonly degreeNode360: number | null;
        readonly state: M0ProvenanceState;
    };
    readonly graphitiEpisodeRefs: readonly string[];
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
    profile: MathemeHarmonicProfileBoundary | null | undefined
): M0CommunityClockProjection {
    const payload = objectValue(profile?.payload);

    const communityIds = communityIdEntries(payload?.gds_community ?? payload?.gdsCommunity);
    const activeNowClock = activeNowClockProjection(
        payload?.active_now_clock ?? payload?.activeNowClock
    );
    const graphitiEpisodeRefs = stringListValue(
        payload?.graphiti_episode_refs ?? payload?.graphitiEpisodeRefs
    );

    return Object.freeze({
        communityIds,
        activeNowClock,
        graphitiEpisodeRefs,
        // The whole overlay stays blocked until the S2 GDS community payload lands;
        // the active-now tick can resolve independently from the S3 bridge tick.
        state: communityIds.length ? 'derived' : 'blocked'
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
        clock?.degreeNode360 ?? clock?.degree_node_360
    );
    return Object.freeze({
        tick12,
        degreeNode360,
        // Mirrors the kernel-bridge profile-tick (Track 15.6); derived when supplied.
        state: tick12 !== null ? 'derived' : 'blocked'
    });
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
            data-view-id={COMMUNITY_CLOCK_OVERLAY_VIEW_ID}
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
                            data-blocker-id={DECLARED_BLOCKERS[0]}
                        >
                            {M0_COMMUNITY_CLOCK_PENDING_LABEL}
                        </p>
                    ) : null}

                    <dl className="m0-community-clock-active-now">
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

                    <ul className="m0-community-clock-community-ids" data-testid="m0-community-ids">
                        {projection.communityIds.length === 0 ? (
                            <li
                                className="m0-community-clock-community-empty"
                                data-provenance-state="blocked"
                            >
                                No S2 GDS community payload yet
                            </li>
                        ) : (
                            projection.communityIds.map(entry => (
                                <li
                                    key={entry.id}
                                    data-community-id={entry.id}
                                    data-provenance-state={entry.state}
                                >
                                    <span className="m0-community-id">{entry.id}</span>
                                    <span className="m0-community-size">{entry.size}</span>
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
