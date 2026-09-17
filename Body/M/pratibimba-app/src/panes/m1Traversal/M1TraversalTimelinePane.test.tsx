/**
 * Coordinate: M1' traversal timeline — body test (rerun 51.T51.3)
 * Residency: Body/M/pratibimba-app/src/panes/m1Traversal/M1TraversalTimelinePane.test.tsx
 * Actualises: the surface renders the ledger's decision, and the Möbius return
 *   is visible as a marked crossing rather than one more row.
 * Does NOT own: the crossing law (`traversalTimeline.test.ts`).
 * Contract: rerun tranche [[51.T51.3]].
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { M1TraversalTimelinePane } from './M1TraversalTimelinePane';
import { recordTraversalSample, resetTraversalTimeline } from './traversalTimeline';

function tick(tick12: number, coordinate = 'M1') {
    return {
        generation: 1,
        tick12,
        position6: tick12 % 6,
        degree720: tick12 * 60,
        helixFace: tick12 >= 6 ? 'pratibimba' : 'bimba',
        coordinate,
        mode: 'held' as const,
        atMs: 1000 + tick12
    };
}

beforeEach(() => {
    resetTraversalTimeline();
});

afterEach(() => {
    cleanup();
});

describe('51.T51.3 — the traversal timeline surface', () => {
    it('is honestly empty before the first sample', () => {
        render(<M1TraversalTimelinePane />);
        expect(screen.getByTestId('m1-traversal-empty')).toBeTruthy();
        expect(screen.getByTestId('m1-traversal-timeline').getAttribute('data-sample-count')).toBe(
            '0'
        );
    });

    it('renders the four specced fields per sample and the coordinate movement', () => {
        recordTraversalSample(tick(7, 'M1'));
        recordTraversalSample(tick(8, 'M1-2'));
        render(<M1TraversalTimelinePane />);

        const second = screen.getByTestId('m1-traversal-sample-2');
        expect(second.getAttribute('data-tick12')).toBe('8');
        expect(second.getAttribute('data-position6')).toBe('2');
        expect(second.getAttribute('data-helix-face')).toBe('pratibimba');
        expect(second.getAttribute('data-degree720')).toBe('480');
        expect(screen.getByTestId('m1-traversal-relation-2').textContent).toContain('M1 → M1-2');
    });

    it('marks the Möbius return P5 → P0′ and counts it apart from the Klein flip', () => {
        for (let t = 0; t <= 11; t += 1) {
            recordTraversalSample(tick(t));
        }
        recordTraversalSample(tick(0));
        render(<M1TraversalTimelinePane />);

        const root = screen.getByTestId('m1-traversal-timeline');
        expect(root.getAttribute('data-mobius-returns')).toBe('1');
        expect(root.getAttribute('data-klein-flips')).toBe('1');

        const flip = screen.getByTestId('m1-traversal-sample-7');
        expect(flip.getAttribute('data-crossing')).toBe('klein-flip');
        const mobius = screen.getByTestId('m1-traversal-sample-13');
        expect(mobius.getAttribute('data-crossing')).toBe('mobius-return');
        expect(screen.getByTestId('m1-traversal-crossing-13').textContent).toContain('Möbius return');
    });

    it('follows the ledger live — a sample recorded after mount appears', async () => {
        render(<M1TraversalTimelinePane />);
        expect(screen.getByTestId('m1-traversal-timeline').getAttribute('data-sample-count')).toBe(
            '0'
        );
        await act(async () => {
            recordTraversalSample(tick(3));
        });
        expect(screen.getByTestId('m1-traversal-timeline').getAttribute('data-sample-count')).toBe(
            '1'
        );
    });
});
