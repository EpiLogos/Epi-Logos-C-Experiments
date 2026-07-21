/**
 * Coordinate: M' M4' (logos-cycle pane tests — 25.T25.13)
 * Actualises: the render + transition verification — the six-stage ring reads
 *   completed/active/pending from the cursor; advance moves forward; regress
 *   only fires after confirmation and surfaces the explicit regression marker;
 *   regress is disabled when nothing is completed.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { M4LogosCyclePane } from './M4LogosCyclePane';
import type { LogosCycleReceipt } from './logosCycle';

afterEach(cleanup);

function status(completed: number[], next: number): LogosCycleReceipt {
    return { date: '2026-07-21', completedStages: completed, nextStage: next, total: 6, transition: null };
}

const state = (index: number) =>
    screen.getByTestId(`m4-logos-stage-${index}`).getAttribute('data-state');

describe('M4LogosCyclePane (25.T25.13)', () => {
    it('renders the six-stage ring with completed/active/pending states from the cursor', async () => {
        render(<M4LogosCyclePane readStatus={() => Promise.resolve(status([0, 1, 2], 3))} />);
        await waitFor(() => expect(state(2)).toBe('completed'));
        expect(state(0)).toBe('completed');
        expect(state(3)).toBe('active');
        expect(state(4)).toBe('pending');
        expect(state(5)).toBe('pending');
        expect(screen.getAllByTestId(/^m4-logos-stage-\d+$/)).toHaveLength(6);
        expect(screen.getByTestId('m4-logos-position').textContent).toContain('3 / 6');
    });

    it('advances forward through the injected gateway port', async () => {
        const advanceStage = vi.fn(() =>
            Promise.resolve<LogosCycleReceipt>({
                ...status([0, 1, 2, 3], 4),
                transition: { stage: 3, direction: 'advance', regression: false, artifactPath: '/a.md' }
            })
        );
        render(
            <M4LogosCyclePane
                readStatus={() => Promise.resolve(status([0, 1, 2], 3))}
                advanceStage={advanceStage}
            />
        );
        await waitFor(() => expect(state(2)).toBe('completed'));
        fireEvent.click(screen.getByTestId('m4-logos-advance'));
        await waitFor(() => expect(advanceStage).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(state(3)).toBe('completed'));
        expect(screen.getByTestId('m4-logos-position').textContent).toContain('4 / 6');
    });

    it('regresses only after confirmation and surfaces the explicit regression marker', async () => {
        const regressStage = vi.fn(() =>
            Promise.resolve<LogosCycleReceipt>({
                ...status([0, 1], 2),
                transition: { stage: 2, direction: 'regress', regression: true, artifactPath: '/r.md' }
            })
        );
        render(
            <M4LogosCyclePane
                readStatus={() => Promise.resolve(status([0, 1, 2], 3))}
                regressStage={regressStage}
                confirmRegress={() => true}
            />
        );
        await waitFor(() => expect(state(2)).toBe('completed'));
        fireEvent.click(screen.getByTestId('m4-logos-regress'));
        await waitFor(() => expect(regressStage).toHaveBeenCalledTimes(1));
        await screen.findByTestId('m4-logos-regression');
        expect(screen.getByTestId('m4-logos-position').textContent).toContain('2 / 6');
    });

    it('does not regress when confirmation is declined', async () => {
        const regressStage = vi.fn();
        render(
            <M4LogosCyclePane
                readStatus={() => Promise.resolve(status([0, 1, 2], 3))}
                regressStage={regressStage}
                confirmRegress={() => false}
            />
        );
        await waitFor(() => expect(state(2)).toBe('completed'));
        fireEvent.click(screen.getByTestId('m4-logos-regress'));
        expect(regressStage).not.toHaveBeenCalled();
    });

    it('disables regress when nothing is completed', async () => {
        render(<M4LogosCyclePane readStatus={() => Promise.resolve(status([], 0))} />);
        await waitFor(() =>
            expect((screen.getByTestId('m4-logos-regress') as HTMLButtonElement).disabled).toBe(true)
        );
    });
});
