/**
 * Coordinate: M' workbench shell
 * Residency: Body/M/pratibimba-app/src/workbench
 * Position (#n): #4 - stable workbench navigation model
 * Actualises: contract tests for workspace presets and activity destinations.
 * Public surface: behavioral tests for the workbench declarations.
 * Does NOT own: pane bodies or command execution.
 */

import { describe, expect, it } from 'vitest';

import {
    WORKBENCH_ACTIVITIES,
    WORKBENCH_WORKSPACES,
    isWorkbenchWorkspaceId
} from './workbenchModel';

describe('workbench model', () => {
    it('declares Home and M0-M5 as one workspace switcher', () => {
        expect(WORKBENCH_WORKSPACES.map(workspace => workspace.id)).toEqual([
            'home',
            'm0',
            'm1',
            'm2',
            'm3',
            'm4',
            'm5'
        ]);
        expect(WORKBENCH_WORKSPACES.map(workspace => workspace.commandId)).toEqual([
            'layout.switch.daily-0-1',
            'subsystem.open.m0',
            'subsystem.open.m1',
            'subsystem.open.m2',
            'subsystem.open.m3',
            'subsystem.open.m4',
            'subsystem.open.m5'
        ]);
    });

    it('gives every stable activity a real existing destination class', () => {
        expect(WORKBENCH_ACTIVITIES.map(activity => activity.id)).toEqual([
            'home',
            'explorer',
            'search',
            'graph',
            'agents',
            'changes-review',
            'health',
            'settings'
        ]);
        expect(WORKBENCH_ACTIVITIES.map(activity => activity.target.kind)).not.toContain('placeholder');
    });

    it('rejects stale persisted workspace ids', () => {
        expect(isWorkbenchWorkspaceId('m5')).toBe(true);
        expect(isWorkbenchWorkspaceId('old-tab-universe')).toBe(false);
    });
});
