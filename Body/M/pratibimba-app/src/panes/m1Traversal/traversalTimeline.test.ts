// @vitest-environment node
/**
 * Coordinate: M1' traversal timeline — ledger gate (rerun 51.T51.3)
 * Residency: Body/M/pratibimba-app/src/panes/m1Traversal/traversalTimeline.test.ts
 * Actualises: the crossing law and the trajectory discipline. The Möbius
 *   return is the assertion that matters: a `position6` 5 → 0 step happens
 *   TWICE per `tick12` cycle and only one of them is the return, so a test
 *   that just checks "5 → 0 is marked" would pass on a wrong implementation.
 *   Both steps are driven here, and each must get its own name.
 * Does NOT own: the surface (`M1TraversalTimelinePane.tsx`), the stores.
 * Contract: [[M1'-SPEC]] §2 · rerun tranche [[51.T51.3]].
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
    crossingBetween,
    helixSheetFor,
    readTraversalSampleInput,
    recordTraversalSample,
    resetTraversalTimeline,
    startTraversalRecorder,
    subscribeTraversalTimeline,
    traversalTimelineSnapshot,
    TRAVERSAL_TIMELINE_CAPACITY,
    type TraversalSampleInput
} from './traversalTimeline';
import { useCoordinateStore } from '../../state/stores';
import { publishProfileTick, resetProfileTicks } from '../../composition/profileTickSubscription';
import type { KernelBridgeCachedProfile } from '../../bridge/types';

function input(overrides: Partial<TraversalSampleInput> = {}): TraversalSampleInput {
    return {
        generation: 1,
        tick12: 0,
        position6: 0,
        degree720: 0,
        helixFace: 'bimba',
        coordinate: 'M1',
        mode: 'held' as const,
        atMs: 1,
        ...overrides
    };
}

/** One WALKED stop: the anchor parked (`held`), tick12 moved by one — the
 *  shape `m1.spanda.step` really produces. */
function tickInput(tick12: number, coordinate = 'M1'): TraversalSampleInput {
    return input({
        tick12,
        position6: tick12 % 6,
        degree720: tick12 * 60,
        helixFace: tick12 >= 6 ? 'pratibimba' : 'bimba',
        coordinate,
        mode: 'held',
        atMs: 1000 + tick12
    });
}

function cachedProfile(profile: unknown): KernelBridgeCachedProfile {
    return {
        generation: 7,
        cachedAtMs: 123,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile
    } as KernelBridgeCachedProfile;
}

beforeEach(() => {
    resetTraversalTimeline();
});

describe('51.T51.3 — helix sheet', () => {
    it('splits the twelve ticks into the two half-turns, and refuses nonsense', () => {
        expect([0, 1, 2, 3, 4, 5].map(helixSheetFor)).toEqual([0, 0, 0, 0, 0, 0]);
        expect([6, 7, 8, 9, 10, 11].map(helixSheetFor)).toEqual([1, 1, 1, 1, 1, 1]);
        expect(helixSheetFor(null)).toBeNull();
        expect(helixSheetFor(12)).toBeNull();
        expect(helixSheetFor(-1)).toBeNull();
        expect(helixSheetFor(3.5)).toBeNull();
    });
});

describe('51.T51.3 — the crossing law marks only walked, adjacent steps', () => {
    it('names canon’s two events: 5 → 6 the Klein flip, 11 → 0 the Möbius return', () => {
        expect(crossingBetween({ tick12: 5, mode: 'held' }, { tick12: 6, mode: 'held' })).toBe(
            'klein-flip'
        );
        expect(crossingBetween({ tick12: 11, mode: 'held' }, { tick12: 0, mode: 'held' })).toBe(
            'mobius-return'
        );
        expect(crossingBetween({ tick12: 11, mode: 'walking' }, { tick12: 0, mode: 'walking' })).toBe(
            'mobius-return'
        );
    });

    /**
     * THE ALIASING GUARD. The 1 Hz heartbeat samples a ~2.5 Hz oscillator, so a
     * FLOWING pair reading 11 then 0 skipped most of a turn — it observed no
     * crossing and must not claim one. This is the assertion that separates a
     * real reading from a decorative one.
     */
    it('refuses to mark a FLOWING 11 → 0 pair — an aliased sample crossed nothing observably', () => {
        expect(
            crossingBetween({ tick12: 11, mode: 'flowing' }, { tick12: 0, mode: 'flowing' })
        ).toBeNull();
        expect(
            crossingBetween({ tick12: 5, mode: 'flowing' }, { tick12: 6, mode: 'flowing' })
        ).toBeNull();
        expect(crossingBetween({ tick12: 11, mode: null }, { tick12: 0, mode: null })).toBeNull();
    });

    it('marks nothing on an ordinary step, a first sample, or an unknown tick', () => {
        expect(crossingBetween(null, { tick12: 0, mode: 'held' })).toBeNull();
        expect(crossingBetween({ tick12: 2, mode: 'held' }, { tick12: 3, mode: 'held' })).toBeNull();
        expect(crossingBetween({ tick12: null, mode: 'held' }, { tick12: 0, mode: 'held' })).toBeNull();
    });
});

describe('51.T51.3 — the trajectory', () => {
    it('records a full turn and marks exactly one Klein flip and one Möbius return', () => {
        for (let tick = 0; tick <= 11; tick += 1) {
            recordTraversalSample(tickInput(tick));
        }
        recordTraversalSample(tickInput(0)); // the wrap: 11 → 0

        const { samples } = traversalTimelineSnapshot();
        expect(samples).toHaveLength(13);
        expect(samples.map(sample => sample.tick12)).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0
        ]);
        expect(samples.filter(sample => sample.crossing === 'klein-flip')).toHaveLength(1);
        expect(samples.filter(sample => sample.crossing === 'mobius-return')).toHaveLength(1);
        expect(samples.find(sample => sample.crossing === 'klein-flip')!.tick12).toBe(6);
        expect(samples.find(sample => sample.crossing === 'mobius-return')!.tick12).toBe(0);
    });

    it('carries the four specced fields on every sample', () => {
        recordTraversalSample(tickInput(7));
        const [sample] = traversalTimelineSnapshot().samples;
        expect(sample.tick12).toBe(7);
        expect(sample.position6).toBe(1);
        expect(sample.helixFace).toBe('pratibimba');
        expect(sample.degree720).toBe(420);
        expect(sample.helixSheet).toBe(1);
    });

    it('records relation movement as the coordinate transition the walk performed', () => {
        recordTraversalSample(tickInput(0, 'M1'));
        recordTraversalSample(tickInput(1, 'M1-2'));
        recordTraversalSample(tickInput(2, 'M1-2'));
        const { samples } = traversalTimelineSnapshot();
        expect(samples[0].relationMovement).toBeNull();
        expect(samples[1].relationMovement).toEqual({ from: 'M1', to: 'M1-2' });
        expect(samples[2].relationMovement).toBeNull();
    });

    it('drops a reading identical to the last — a trajectory records movement', () => {
        expect(recordTraversalSample(tickInput(3))).not.toBeNull();
        expect(recordTraversalSample(tickInput(3))).toBeNull();
        expect(traversalTimelineSnapshot().samples).toHaveLength(1);
    });

    it('is a ring: it keeps the most recent window and never grows unbounded', () => {
        for (let i = 0; i < TRAVERSAL_TIMELINE_CAPACITY + 20; i += 1) {
            recordTraversalSample(input({ degree720: i, atMs: i }));
        }
        const { samples } = traversalTimelineSnapshot();
        expect(samples).toHaveLength(TRAVERSAL_TIMELINE_CAPACITY);
        expect(samples[samples.length - 1].degree720).toBe(TRAVERSAL_TIMELINE_CAPACITY + 19);
        // seq keeps counting through the window — a path has no gaps in identity
        expect(samples[samples.length - 1].seq).toBe(TRAVERSAL_TIMELINE_CAPACITY + 20);
    });

    it('wakes subscribers on every appended sample', () => {
        let woken = 0;
        const dispose = subscribeTraversalTimeline(() => {
            woken += 1;
        });
        recordTraversalSample(tickInput(1));
        recordTraversalSample(tickInput(1));
        recordTraversalSample(tickInput(2));
        expect(woken).toBe(2);
        dispose();
    });
});

describe('51.T51.3 — the reading comes off the live profile shape', () => {
    it('unwraps `harmonicProfile` and windows the four fields', () => {
        const sample = readTraversalSampleInput(
            cachedProfile({
                harmonicProfile: { tick12: 8, position6: 2, degree720: 480, helix: 'pratibimba' },
                spanda: {
                    epochMs: 10,
                    phase0: 0,
                    rateHz: 2.5,
                    mode: 'held',
                    direction: 'forward',
                    tick12: 8
                }
            }),
            'M1-3',
            99
        );
        expect(sample).toEqual({
            generation: 7,
            tick12: 8,
            position6: 2,
            degree720: 480,
            helixFace: 'pratibimba',
            coordinate: 'M1-3',
            mode: 'held',
            atMs: 99
        });
    });

    it('reads a flat payload too, and reports absence as null (never a fallback)', () => {
        expect(readTraversalSampleInput(cachedProfile({ tick12: 3 }), null, 1)).toEqual({
            generation: 7,
            tick12: 3,
            position6: null,
            degree720: null,
            helixFace: null,
            coordinate: null,
            mode: null,
            atMs: 1
        });
        expect(readTraversalSampleInput(null, null, 1).tick12).toBeNull();
    });
});

describe('51.T51.3 — the recorder is shell-level, over the stores WalkPane reads', () => {
    it('records on a tick advance AND on a coordinate step, and stops when disposed', () => {
        useCoordinateStore.getState().setSelected(null);
        resetProfileTicks();
        resetTraversalTimeline();
        const stop = startTraversalRecorder(() => 5);
        // Nothing is recorded before the first profile frame: a reading with no
        // tick is not a point on a trajectory.
        const afterStart = traversalTimelineSnapshot().samples.length;
        expect(afterStart).toBe(0);

        // Frames reach the clock through the ONE publisher (29.4 / DR-WC-IP-4);
        // a direct `setProfile` here would be a second clock writer.
        publishProfileTick(
                cachedProfile({
                    harmonicProfile: { tick12: 4, position6: 4, degree720: 240, helix: 'bimba' },
                    spanda: {
                        epochMs: 10,
                        phase0: 0,
                        rateHz: 2.5,
                        mode: 'held',
                        direction: 'forward',
                        tick12: 4
                    }
                })
        );
        expect(traversalTimelineSnapshot().samples.length).toBe(afterStart + 1);

        useCoordinateStore.getState().setSelected('M1-4');
        const recorded = traversalTimelineSnapshot().samples;
        expect(recorded.length).toBe(afterStart + 2);
        expect(recorded[recorded.length - 1].relationMovement).toEqual({ from: null, to: 'M1-4' });

        stop();
        useCoordinateStore.getState().setSelected('M2');
        expect(traversalTimelineSnapshot().samples.length).toBe(afterStart + 2);
    });
});
