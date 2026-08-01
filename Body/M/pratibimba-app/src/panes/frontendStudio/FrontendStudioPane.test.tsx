/**
 * Coordinate: M5-3' Frontend Studio — body test (rerun 51.T51.2)
 * Residency: Body/M/pratibimba-app/src/panes/frontendStudio/FrontendStudioPane.test.tsx
 * Actualises: the studio renders THE REGISTRY, not a copy of it — the rows
 *   move when the registry moves, including after a new mount arrives.
 * Does NOT own: the registry law (`paneRegistry.test.ts`), the shell.
 * Contract: rerun tranche [[51.T51.2]].
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FrontendStudioPane } from './FrontendStudioPane';
import {
    publishRegisteredPanes,
    recordPaneRender,
    resetPaneRegistry,
    type RegisteredPaneMount
} from './paneRegistry';

function mount(component: string, overrides: Partial<RegisteredPaneMount> = {}): RegisteredPaneMount {
    return {
        component,
        nodeId: `node-${component}`,
        name: component,
        face: 0,
        layout: 'ide-deep',
        slot: 'main',
        selected: true,
        ...overrides
    };
}

beforeEach(() => {
    resetPaneRegistry();
});

afterEach(() => {
    cleanup();
});

describe('51.T51.2 — the M5-3′ Frontend Studio renders the live registry', () => {
    it('lists the registered panes with their mount cell, render count and declaring module', () => {
        publishRegisteredPanes([mount('walk'), mount('cosmic', { face: 1, layout: 'daily-0-1' })]);
        recordPaneRender('walk');
        render(<FrontendStudioPane />);

        const studio = screen.getByTestId('frontend-studio');
        expect(studio.getAttribute('data-registered-pane-count')).toBe('2');
        expect(studio.getAttribute('data-registered-components')).toBe('cosmic walk');
        expect(studio.getAttribute('data-rendered-components')).toBe('walk');

        const walkRow = screen.getByTestId('frontend-studio-pane-walk');
        expect(walkRow.getAttribute('data-renders')).toBe('1');
        expect(walkRow.textContent).toContain('face 0 · ide-deep · main');
        expect(walkRow.textContent).toContain('ui/deepPaneSet.ts');
    });

    it('updates when a NEW pane is mounted — the studio cannot be a snapshot', async () => {
        publishRegisteredPanes([mount('walk')]);
        render(<FrontendStudioPane />);
        expect(screen.getByTestId('frontend-studio').getAttribute('data-registered-pane-count')).toBe(
            '1'
        );
        expect(screen.queryByTestId('frontend-studio-pane-m3SubsystemPage')?.getAttribute('data-mount-count')).toBe('0');

        await act(async () => {
            publishRegisteredPanes([mount('walk'), mount('m3SubsystemPage')]);
            await Promise.resolve();
        });

        expect(screen.getByTestId('frontend-studio').getAttribute('data-registered-pane-count')).toBe(
            '2'
        );
        expect(
            screen.getByTestId('frontend-studio-pane-m3SubsystemPage').getAttribute('data-mount-count')
        ).toBe('1');
    });

    it('shows composition-slot occupancy from the real load, with owners and blockers', async () => {
        render(<FrontendStudioPane />);
        await act(async () => {
            screen.getByTestId('frontend-studio-section-slots').click();
        });
        const surface = screen.getByTestId('frontend-studio-slot-surface');
        expect(surface.getAttribute('data-slot-owner')).toBe('m1-paramasiva-played-torus');
        expect(surface.getAttribute('data-slot-composition')).toBe('cosmic-engine.integrated');
        expect(screen.getByTestId('frontend-studio-slot-center-composition').textContent).toContain(
            'pending-psychoid-cymatic-solver'
        );
    });

    it('shows the two integrated plugin compositions and whether they mounted', async () => {
        render(<FrontendStudioPane />);
        await act(async () => {
            screen.getByTestId('frontend-studio-section-plugins').click();
        });
        expect(
            screen.getByTestId('frontend-studio-plugin-cosmic-engine.integrated').getAttribute(
                'data-plugin-mounted'
            )
        ).toBe('true');
        expect(
            screen.getByTestId('frontend-studio-plugin-jiva-siva.integrated').getAttribute(
                'data-plugin-mounted'
            )
        ).toBe('true');
    });
});
