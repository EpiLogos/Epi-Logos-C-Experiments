import { describe, expect, it } from 'vitest';
import {
    buildM0CommunityClockOverlay,
    M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID,
    M0_GDS_TANGENT_OVERLAY_METHOD,
    M0_COMMUNITY_CLOCK_PENDING_LABEL
} from './m0CommunityClockOverlay';

describe("m0CommunityClockOverlay — M0-3' community + clock overlay (rerun 01.T1.5)", () => {
    it('declares the canonical view id and S2 GDS overlay method', () => {
        expect(M0_COMMUNITY_CLOCK_OVERLAY_VIEW_ID).toBe('m0.anuttara.communityClockOverlay');
        expect(M0_GDS_TANGENT_OVERLAY_METHOD).toBe('s2.graph.gds.tangent_overlay');
    });

    it('is BLOCKED until the S2 GDS community payload is wired (design Verify §3)', () => {
        expect(buildM0CommunityClockOverlay(null).state).toBe('blocked');
        expect(buildM0CommunityClockOverlay({ payload: {} }).state).toBe('blocked');
        // synchronic community present but no diachronic clock → still blocked
        expect(
            buildM0CommunityClockOverlay({ payload: { gds_community: [{ id: 'c1', size: 3 }] } }).state
        ).toBe('blocked');
        // diachronic clock present but no synchronic community → still blocked
        expect(
            buildM0CommunityClockOverlay({ payload: { active_now_clock: { tick12: 7, degreeNode360: 210 } } }).state
        ).toBe('blocked');
        expect(M0_COMMUNITY_CLOCK_PENDING_LABEL).toContain('pending');
    });

    it('is DERIVED only when both synchronic community and diachronic clock are present', () => {
        const projection = buildM0CommunityClockOverlay({
            payload: {
                gds_community: [{ id: 'c1', size: 3 }, { id: 'c2', size: 5 }],
                active_now_clock: { tick12: 7, degreeNode360: 210 },
                graphiti_episode_refs: ['ep-1']
            }
        });
        expect(projection.state).toBe('derived');
        expect(projection.communityIds.map(c => c.id)).toEqual(['c1', 'c2']);
        expect(projection.activeNowClock.tick12).toBe(7);
        expect(projection.activeNowClock.degreeNode360).toBe(210);
        expect(projection.graphitiEpisodeRefs).toEqual(['ep-1']);
    });

    it('has NO renderer-local clock: the active-now tick is null unless supplied by the S3 projection', () => {
        const a = buildM0CommunityClockOverlay({ payload: { gds_community: [{ id: 'c1', size: 1 }] } });
        const b = buildM0CommunityClockOverlay({ payload: { gds_community: [{ id: 'c1', size: 1 }] } });
        // deterministic across builds — the overlay never reads a wall-clock "now"
        expect(a.activeNowClock.tick12).toBeNull();
        expect(b.activeNowClock.tick12).toBeNull();
        expect(a.activeNowClock.state).toBe('blocked');
    });

    it('returns a read-only (frozen) projection — the overlay never mutates canon', () => {
        const projection = buildM0CommunityClockOverlay({
            payload: {
                gds_community: [{ id: 'c1', size: 3 }],
                active_now_clock: { tick12: 0, degreeNode360: 0 }
            }
        });
        expect(Object.isFrozen(projection)).toBe(true);
        expect(Object.isFrozen(projection.communityIds)).toBe(true);
        expect(Object.isFrozen(projection.activeNowClock)).toBe(true);
    });
});
