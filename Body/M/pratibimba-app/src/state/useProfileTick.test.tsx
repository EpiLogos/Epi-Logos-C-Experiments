/**
 * Coordinate: M' `/` membrane (profile-tick hook tests — Track 27.T27.0)
 * Actualises: the 15.6 re-render law as behavior — a component consuming
 *   `useProfileTick()` re-renders when the profile generation ADVANCES,
 *   holds the last view when a stale generation arrives (the store refuses
 *   it), and reads tick12/degree720 from the bussed profile verbatim.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useProfileTick } from './useProfileTick';
import { crossSurfacePropagation } from '../composition/compositionContract';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

function cachedProfile(
    generation: number,
    tick12: number,
    degree720: number,
    graphRevision?: number
) {
    return {
        generation,
        graphRevision,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile: { harmonicProfile: { tick12, degree720 } }
    };
}

let renderCount = 0;

function TickProbe() {
    const tick = useProfileTick();
    renderCount += 1;
    return (
        <span
            data-testid="tick-probe"
            data-generation={tick.generation ?? 'none'}
            data-tick12={tick.tick12 ?? 'none'}
            data-degree720={tick.degree720 ?? 'none'}
            data-graph-revision={tick.graphRevision ?? 'none'}
        />
    );
}

afterEach(() => {
    cleanup();
    resetProfileTicks();
    renderCount = 0;
});

describe('useProfileTick', () => {
    it('re-renders on generation advance and carries the bussed clock verbatim', () => {
        render(<TickProbe />);
        expect(screen.getByTestId('tick-probe').getAttribute('data-generation')).toBe('none');

        act(() => {
            publishProfileTick(cachedProfile(7, 4, 415));
        });
        const probe = screen.getByTestId('tick-probe');
        expect(probe.getAttribute('data-generation')).toBe('7');
        expect(probe.getAttribute('data-tick12')).toBe('4');
        expect(probe.getAttribute('data-degree720')).toBe('415');

        act(() => {
            publishProfileTick(cachedProfile(8, 5, 445));
        });
        expect(probe.getAttribute('data-generation')).toBe('8');
        expect(probe.getAttribute('data-tick12')).toBe('5');
    });

    it('holds the current view when a stale generation arrives — one clock, no rewind', () => {
        render(<TickProbe />);
        act(() => {
            publishProfileTick(cachedProfile(9, 6, 475));
        });
        const rendersAfterAdvance = renderCount;

        act(() => {
            publishProfileTick(cachedProfile(3, 1, 30));
        });
        const probe = screen.getByTestId('tick-probe');
        expect(probe.getAttribute('data-generation')).toBe('9');
        expect(probe.getAttribute('data-tick12')).toBe('6');
        expect(renderCount).toBe(rendersAfterAdvance);
    });

    it('B-12: surfaces the graph revision so a governed edit is visible on the next tick', () => {
        render(<TickProbe />);
        act(() => {
            publishProfileTick(cachedProfile(10, 4, 415, 7));
        });
        const probe = screen.getByTestId('tick-probe');
        expect(probe.getAttribute('data-graph-revision')).toBe('7');

        // a governed Bimba write lands: generation advances AND revision bumps —
        // crossSurfacePropagation reports the edit crossed to every rendering.
        act(() => {
            publishProfileTick(cachedProfile(11, 5, 445, 8));
        });
        expect(probe.getAttribute('data-graph-revision')).toBe('8');
        const decision = crossSurfacePropagation(
            { generation: 10, graphRevision: '7' },
            { generation: 11, graphRevision: '8' }
        );
        expect(decision.reRead).toBe(true);
        expect(decision.carriesEdit).toBe(true);

        // a bare clock tick (revision unchanged) re-reads but carries no edit.
        act(() => {
            publishProfileTick(cachedProfile(12, 6, 475, 8));
        });
        expect(probe.getAttribute('data-graph-revision')).toBe('8');
        expect(
            crossSurfacePropagation(
                { generation: 11, graphRevision: '8' },
                { generation: 12, graphRevision: '8' }
            ).carriesEdit
        ).toBe(false);
    });
});
