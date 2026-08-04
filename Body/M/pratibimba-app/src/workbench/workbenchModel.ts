/**
 * Coordinate: M' workbench shell
 * Residency: Body/M/pratibimba-app/src/workbench
 * Position (#n): #4 - stable workbench navigation model
 * Actualises: one workspace-preset switcher and one activity rail over the
 *   carrier's existing command and pane destinations.
 * Public surface: WorkbenchWorkspaceId, WorkbenchActivityId,
 *   WorkbenchActivityTarget, WORKBENCH_WORKSPACES, WORKBENCH_ACTIVITIES,
 *   isWorkbenchWorkspaceId, isWorkbenchActivityId.
 * Does NOT own: command execution, pane bodies, FlexLayout models, or
 *   persistence.
 */

import type { OmniPanelTabId } from '../panes/omni/omnipanelRuntime';
import type { LeftSidebarModeId } from '../ui/leftSidebarModes';
import type { UiIconName } from '../ui/iconography';

export type WorkbenchWorkspaceId = 'home' | 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export interface WorkbenchWorkspace {
    readonly id: WorkbenchWorkspaceId;
    readonly label: string;
    readonly commandId: string;
}

export const WORKBENCH_WORKSPACES: readonly WorkbenchWorkspace[] = Object.freeze([
    { id: 'home', label: 'Home', commandId: 'layout.switch.daily-0-1' },
    { id: 'm0', label: "M0' Map", commandId: 'subsystem.open.m0' },
    { id: 'm1', label: "M1' Traversal", commandId: 'subsystem.open.m1' },
    { id: 'm2', label: "M2' Correspondence", commandId: 'subsystem.open.m2' },
    { id: 'm3', label: "M3' Cosmos", commandId: 'subsystem.open.m3' },
    { id: 'm4', label: "M4' Continuity", commandId: 'subsystem.open.m4' },
    { id: 'm5', label: "M5' Workbench", commandId: 'subsystem.open.m5' }
] as const);

export type WorkbenchActivityId =
    | 'home'
    | 'explorer'
    | 'search'
    | 'graph'
    | 'agents'
    | 'changes-review'
    | 'health'
    | 'settings';

export type WorkbenchActivityTarget =
    | { readonly kind: 'workspace'; readonly workspace: WorkbenchWorkspaceId }
    | { readonly kind: 'left-sidebar'; readonly modeId: LeftSidebarModeId }
    | { readonly kind: 'omnipanel'; readonly tabId: OmniPanelTabId };

export interface WorkbenchActivity {
    readonly id: WorkbenchActivityId;
    readonly label: string;
    readonly icon: UiIconName;
    readonly target: WorkbenchActivityTarget;
}

export const WORKBENCH_ACTIVITIES: readonly WorkbenchActivity[] = Object.freeze([
    {
        id: 'home',
        label: 'Home',
        icon: 'coin-flip',
        target: { kind: 'workspace', workspace: 'home' }
    },
    {
        id: 'explorer',
        label: 'Explorer',
        icon: 'coordinate-tree',
        target: { kind: 'left-sidebar', modeId: 'coordinate-tree' }
    },
    {
        id: 'search',
        label: 'Search',
        icon: 'smart-connections',
        target: { kind: 'left-sidebar', modeId: 'smart-connections' }
    },
    {
        id: 'graph',
        label: 'Graph',
        icon: 'bimba-graph-viewer',
        target: { kind: 'left-sidebar', modeId: 'bimba-graph' }
    },
    {
        id: 'agents',
        label: 'Agents',
        icon: 'family-m5-epii',
        target: { kind: 'omnipanel', tabId: 'pi-chat' }
    },
    {
        id: 'changes-review',
        label: 'Changes and review',
        icon: 'canon-studio',
        target: { kind: 'omnipanel', tabId: 'review' }
    },
    {
        id: 'health',
        label: 'Health',
        icon: 'family-s',
        target: { kind: 'omnipanel', tabId: 'diagnostics' }
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'family-c',
        target: { kind: 'omnipanel', tabId: 'settings' }
    }
] as const);

const WORKSPACE_IDS = new Set<string>(WORKBENCH_WORKSPACES.map(workspace => workspace.id));
const ACTIVITY_IDS = new Set<string>(WORKBENCH_ACTIVITIES.map(activity => activity.id));

export function isWorkbenchWorkspaceId(value: unknown): value is WorkbenchWorkspaceId {
    return typeof value === 'string' && WORKSPACE_IDS.has(value);
}

export function isWorkbenchActivityId(value: unknown): value is WorkbenchActivityId {
    return typeof value === 'string' && ACTIVITY_IDS.has(value);
}
