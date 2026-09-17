import type { PratibimbaLayoutId } from './layout-types';

export interface ActivityBarMode {
    readonly modeId: string;
    readonly ownerExtension: string;
    readonly widgetId: string;
    /** Theia codicon name or M0 ARCHETYPE_LUT glyph ref. */
    readonly iconRef: string;
    readonly orderPriority: number;
}

export const DAILY_0_1_ACTIVITY_BAR_MODES: readonly ActivityBarMode[] = [
    {
        modeId: 'pratibimba.activity-bar.coordinate-tree',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.ide-shell.coordinate-tree',
        iconRef: '$(list-tree)',
        orderPriority: 10
    },
    {
        modeId: 'pratibimba.activity-bar.bimba-graph-viewer',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.ide-shell.bimba-graph-viewer',
        iconRef: '$(graph)',
        orderPriority: 20
    },
    {
        modeId: 'pratibimba.activity-bar.canon-studio',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.ide-shell.canon-studio',
        iconRef: '$(book)',
        orderPriority: 30
    }
];

export const IDE_DEEP_ACTIVITY_BAR_MODES: readonly ActivityBarMode[] = [
    ...DAILY_0_1_ACTIVITY_BAR_MODES,
    {
        modeId: 'pratibimba.activity-bar.backend-studio',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.ide-shell.backend-studio',
        iconRef: '$(server)',
        orderPriority: 40
    },
    {
        modeId: 'pratibimba.activity-bar.smart-connections',
        ownerExtension: 'smart-connections-sidebar',
        widgetId: 'pratibimba.smart-connections-sidebar',
        iconRef: '$(circuit-board)',
        orderPriority: 50
    }
];

export const expectedActivityBarModes: Readonly<
    Record<PratibimbaLayoutId, readonly ActivityBarMode[]>
> = {
    'daily-0-1': DAILY_0_1_ACTIVITY_BAR_MODES,
    'ide-deep': IDE_DEEP_ACTIVITY_BAR_MODES
};

export function activityBarModeForLayout(
    layoutId: PratibimbaLayoutId,
    modeId: string
): ActivityBarMode | undefined {
    return expectedActivityBarModes[layoutId].find(mode => mode.modeId === modeId);
}

export function defaultActivityBarModeForLayout(layoutId: PratibimbaLayoutId): ActivityBarMode {
    const [first] = expectedActivityBarModes[layoutId];
    if (!first) {
        throw new Error(`No activity-bar modes registered for layout: ${layoutId}`);
    }
    return first;
}

export function preserveActivityBarModeForLayout(
    layoutId: PratibimbaLayoutId,
    activeModeId: string | null
): string {
    if (activeModeId && activityBarModeForLayout(layoutId, activeModeId)) {
        return activeModeId;
    }
    return defaultActivityBarModeForLayout(layoutId).modeId;
}
