import { inject, injectable } from '@theia/core/shared/inversify';
import {
    Command,
    CommandContribution,
    CommandRegistry,
    MAIN_MENU_BAR,
    MenuContribution,
    MenuModelRegistry
} from '@theia/core/lib/common';
import {
    ApplicationShell,
    FrontendApplicationContribution,
    PreferenceService,
    WidgetManager
} from '@theia/core/lib/browser';
import type { Widget } from '@theia/core/lib/browser/widgets';
import { SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';
import { IDE_SHELL_WIDGET_IDS } from '../../common/contract';

export type LeftSidebarLayoutId = 'daily-0-1' | 'ide-deep';

export interface LeftSidebarMode {
    readonly id: 'coordinate-tree'|'bimba-graph-viewer'|'canon-studio'|'backend-studio'|'smart-connections';
    readonly label: string;
    readonly iconClass: string;
    readonly widgetId: string;
    readonly availableInLayouts: readonly LeftSidebarLayoutId[];
    readonly codePendingMarker?: 'track-03-t6.5'|'first-build';
}

export const LEFT_SIDEBAR_VIEW_CONTAINER_ID = 'activity-bar-left' as const;
export const LEFT_SIDEBAR_LAYOUT_PREFERENCE = 'epi-logos.layout.active' as const;
export const ACTIVE_ACTIVITY_BAR_MODE_SELECTOR_ID = 'activeActivityBarMode' as const;
export const LEFT_SIDEBAR_ACTIVITY_BAR_COMMAND_PREFIX =
    'pratibimba.ide-shell.activity-bar.set-mode' as const;

export const LEFT_SIDEBAR_ACTIVITY_BAR_MENU = [...MAIN_MENU_BAR, '5_pratibimba', '3_activity_bar'];

export const LEFT_SIDEBAR_MODES: readonly LeftSidebarMode[] = [
    {
        id: 'coordinate-tree',
        label: 'Coordinate Tree',
        iconClass: 'codicon-list-tree',
        widgetId: IDE_SHELL_WIDGET_IDS.COORDINATE_TREE,
        availableInLayouts: ['daily-0-1', 'ide-deep']
    },
    {
        id: 'bimba-graph-viewer',
        label: 'Bimba Graph Viewer',
        iconClass: 'codicon-graph',
        widgetId: IDE_SHELL_WIDGET_IDS.BIMBA_GRAPH_VIEWER,
        availableInLayouts: ['daily-0-1', 'ide-deep']
    },
    {
        id: 'canon-studio',
        label: 'Canon Studio',
        iconClass: 'codicon-book',
        widgetId: IDE_SHELL_WIDGET_IDS.CANON_STUDIO,
        availableInLayouts: ['daily-0-1', 'ide-deep']
    },
    {
        id: 'backend-studio',
        label: 'Backend Studio',
        iconClass: 'codicon-terminal',
        widgetId: 'pratibimba.ide-shell.backend-studio',
        availableInLayouts: ['ide-deep'],
        codePendingMarker: 'first-build'
    },
    {
        id: 'smart-connections',
        label: 'Smart Connections',
        iconClass: 'codicon-link',
        widgetId: 'pratibimba.smart-connections-sidebar',
        availableInLayouts: ['ide-deep'],
        codePendingMarker: 'track-03-t6.5'
    }
] as const;

export interface ActiveActivityBarModePayload {
    readonly [key: string]: unknown;
    readonly modeId: LeftSidebarMode['id'];
    readonly widgetId: string;
    readonly layoutId: LeftSidebarLayoutId;
    readonly commandId: string;
    readonly viewContainerId: typeof LEFT_SIDEBAR_VIEW_CONTAINER_ID;
    readonly defaultWidgetArea: ApplicationShell.Area;
    readonly updatedAt: number;
}

export function leftSidebarModeCommandId(modeId: LeftSidebarMode['id']): string {
    return `${LEFT_SIDEBAR_ACTIVITY_BAR_COMMAND_PREFIX}.${modeId}`;
}

export function isLeftSidebarLayoutId(value: unknown): value is LeftSidebarLayoutId {
    return value === 'daily-0-1' || value === 'ide-deep';
}

export function normalizeLeftSidebarLayout(value: unknown): LeftSidebarLayoutId {
    return value === 'ide-deep' ? 'ide-deep' : 'daily-0-1';
}

export function leftSidebarModesForLayout(
    layoutId: LeftSidebarLayoutId,
    modes: readonly LeftSidebarMode[] = LEFT_SIDEBAR_MODES
): readonly LeftSidebarMode[] {
    return modes.filter(mode => mode.availableInLayouts.includes(layoutId));
}

export function findLeftSidebarMode(
    modeId: string,
    modes: readonly LeftSidebarMode[] = LEFT_SIDEBAR_MODES
): LeftSidebarMode | undefined {
    return modes.find(mode => mode.id === modeId);
}

export function isLeftSidebarModeAvailable(
    mode: LeftSidebarMode,
    layoutId: LeftSidebarLayoutId
): boolean {
    return mode.availableInLayouts.includes(layoutId);
}

export function leftSidebarDefaultWidgetArea(
    mode: LeftSidebarMode,
    layoutId: LeftSidebarLayoutId
): ApplicationShell.Area {
    if (
        layoutId === 'daily-0-1' &&
        (mode.id === 'bimba-graph-viewer' || mode.id === 'canon-studio')
    ) {
        return 'left';
    }
    if (mode.id === 'coordinate-tree' || mode.id === 'backend-studio' || mode.id === 'smart-connections') {
        return 'left';
    }
    return 'main';
}

export function activeActivityBarModePayload(
    mode: LeftSidebarMode,
    layoutId: LeftSidebarLayoutId,
    updatedAt = Date.now()
): ActiveActivityBarModePayload {
    return Object.freeze({
        modeId: mode.id,
        widgetId: mode.widgetId,
        layoutId,
        commandId: leftSidebarModeCommandId(mode.id),
        viewContainerId: LEFT_SIDEBAR_VIEW_CONTAINER_ID,
        defaultWidgetArea: leftSidebarDefaultWidgetArea(mode, layoutId),
        updatedAt
    });
}

export function modeIdFromSelectorPayload(payload: Readonly<Record<string, unknown>> | null): string | null {
    return typeof payload?.modeId === 'string' ? payload.modeId : null;
}

export function fallbackLeftSidebarMode(
    layoutId: LeftSidebarLayoutId,
    preferredModeId: string | null,
    modes: readonly LeftSidebarMode[] = LEFT_SIDEBAR_MODES
): LeftSidebarMode {
    const available = leftSidebarModesForLayout(layoutId, modes);
    const preferred = preferredModeId ? available.find(mode => mode.id === preferredModeId) : undefined;
    return preferred ?? available[0] ?? modes[0];
}

@injectable()
export class LeftSidebarActivityBarContribution
    implements CommandContribution, MenuContribution, FrontendApplicationContribution
{
    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(WidgetManager)
    protected readonly widgetManager!: WidgetManager;

    @inject(ApplicationShell)
    protected readonly shell!: ApplicationShell;

    @inject(SharedBridgeAdapter)
    protected readonly bridge!: SharedBridgeAdapter;

    protected activeLayout: LeftSidebarLayoutId = 'daily-0-1';

    async onStart(): Promise<void> {
        this.activeLayout = this.currentLayout();
        this.preferences.onPreferenceChanged(change => {
            if (change.preferenceName === LEFT_SIDEBAR_LAYOUT_PREFERENCE) {
                void this.restoreForLayout(normalizeLeftSidebarLayout(change.newValue));
            }
        });
        await this.restoreForLayout(this.activeLayout);
    }

    registerCommands(commands: CommandRegistry): void {
        for (const mode of LEFT_SIDEBAR_MODES) {
            commands.registerCommand(leftSidebarCommand(mode), {
                execute: () => this.setMode(mode.id),
                isVisible: () => isLeftSidebarModeAvailable(mode, this.currentLayout()),
                isEnabled: () => isLeftSidebarModeAvailable(mode, this.currentLayout())
            });
        }
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(LEFT_SIDEBAR_ACTIVITY_BAR_MENU, 'Activity Bar');
        leftSidebarModesForLayout('ide-deep').forEach((mode, index) => {
            menus.registerMenuAction(LEFT_SIDEBAR_ACTIVITY_BAR_MENU, {
                commandId: leftSidebarModeCommandId(mode.id),
                label: mode.label,
                order: String(index + 1).padStart(2, '0')
            });
        });
    }

    availableModes(layoutId: LeftSidebarLayoutId = this.currentLayout()): readonly LeftSidebarMode[] {
        return leftSidebarModesForLayout(layoutId);
    }

    async setMode(modeId: LeftSidebarMode['id']): Promise<ActiveActivityBarModePayload> {
        const layoutId = this.currentLayout();
        const mode = findLeftSidebarMode(modeId);
        if (!mode) {
            throw new Error(`Unknown left-sidebar activity-bar mode: ${modeId}`);
        }
        if (!isLeftSidebarModeAvailable(mode, layoutId)) {
            throw new Error(`${mode.label} is not available when ${LEFT_SIDEBAR_LAYOUT_PREFERENCE} = ${layoutId}`);
        }
        const payload = activeActivityBarModePayload(mode, layoutId);
        this.bridge.updateCurrentStateSelectorPayload(ACTIVE_ACTIVITY_BAR_MODE_SELECTOR_ID, payload);
        await this.openModeWidget(mode, layoutId);
        return payload;
    }

    protected async restoreForLayout(layoutId: LeftSidebarLayoutId): Promise<void> {
        this.activeLayout = layoutId;
        const preferred = modeIdFromSelectorPayload(
            this.bridge.readCurrentStateSelectorPayload(ACTIVE_ACTIVITY_BAR_MODE_SELECTOR_ID)
        );
        const mode = fallbackLeftSidebarMode(layoutId, preferred);
        const payload = activeActivityBarModePayload(mode, layoutId);
        this.bridge.updateCurrentStateSelectorPayload(ACTIVE_ACTIVITY_BAR_MODE_SELECTOR_ID, payload);
    }

    protected currentLayout(): LeftSidebarLayoutId {
        return normalizeLeftSidebarLayout(this.preferences.get<string>(LEFT_SIDEBAR_LAYOUT_PREFERENCE, this.activeLayout));
    }

    protected async openModeWidget(mode: LeftSidebarMode, layoutId: LeftSidebarLayoutId): Promise<void> {
        const widget = await this.widgetManager.getOrCreateWidget<Widget>(mode.widgetId);
        await this.shell.addWidget(widget, {
            area: leftSidebarDefaultWidgetArea(mode, layoutId),
            mode: 'tab-after'
        });
        this.shell.activateWidget(widget.id);
        this.shell.revealWidget(widget.id);
    }
}

function leftSidebarCommand(mode: LeftSidebarMode): Command {
    return {
        id: leftSidebarModeCommandId(mode.id),
        label: mode.label,
        category: 'Pratibimba Activity Bar',
        iconClass: mode.iconClass
    };
}
