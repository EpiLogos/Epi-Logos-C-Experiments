/**
 * Coordinate: M' workbench shell
 * Residency: Body/M/pratibimba-app/src/workbench
 * Position (#n): #5 - stable seven-region frame verification
 * Actualises: interactive coverage for workspace and activity routing.
 * Public surface: behavioral tests for WorkbenchFrame.
 * Does NOT own: FlexLayout behavior or gateway data production.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkbenchFrame } from './WorkbenchFrame';

afterEach(cleanup);

describe('WorkbenchFrame', () => {
    it('renders stable workbench regions around the existing editor host', () => {
        render(
            <WorkbenchFrame
                workspace="home"
                activeActivity="explorer"
                onWorkspaceChange={vi.fn()}
                onActivityChange={vi.fn()}
                status={<span>live status</span>}
            >
                <div>editor host</div>
            </WorkbenchFrame>
        );

        expect(screen.getByRole('banner', { name: 'Workbench' })).toBeTruthy();
        expect(screen.getByRole('navigation', { name: 'Workbench activities' })).toBeTruthy();
        expect(screen.getByRole('main', { name: 'Editor and instrument groups' }).textContent).toContain('editor host');
        expect(screen.getByRole('region', { name: 'Operational panel' })).toBeTruthy();
        expect(screen.getByText('live status')).toBeTruthy();
    });

    it('routes workspace and activity gestures through its callbacks', () => {
        const onWorkspaceChange = vi.fn();
        const onActivityChange = vi.fn();
        render(
            <WorkbenchFrame
                workspace="home"
                activeActivity="explorer"
                onWorkspaceChange={onWorkspaceChange}
                onActivityChange={onActivityChange}
                status={<span>status</span>}
            >
                <div>editor</div>
            </WorkbenchFrame>
        );

        fireEvent.change(screen.getByLabelText('Workspace'), { target: { value: 'm5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Agents' }));

        expect(onWorkspaceChange).toHaveBeenCalledWith('m5');
        expect(onActivityChange).toHaveBeenCalledWith('agents');
    });
});
