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
    // Cosmic-side modes.
    {
        modeId: 'pratibimba.activity-bar.coordinate-tree',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.coordinate-tree',
        iconRef: '$(list-tree)',
        orderPriority: 10
    },
    {
        modeId: 'pratibimba.activity-bar.bimba-graph-viewer',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.bimba-graph-viewer',
        iconRef: '$(graph)',
        orderPriority: 20
    },
    {
        modeId: 'pratibimba.activity-bar.canon-studio',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.canon-studio',
        iconRef: '$(book)',
        orderPriority: 30
    },
    // Personal-side modes per 25.1, 25.3, and 25.7.
    {
        modeId: 'pratibimba.activity-bar.day-calendar',
        ownerExtension: 'm4-nara',
        widgetId: 'm4.nara.dayCalendar',
        iconRef: '$(calendar)',
        orderPriority: 40
    },
    {
        modeId: 'pratibimba.activity-bar.journal-entries',
        ownerExtension: 'm4-nara',
        widgetId: 'm4.nara.journalEntries',
        iconRef: '$(notebook)',
        orderPriority: 50
    },
    {
        modeId: 'pratibimba.activity-bar.personal-coordinate',
        ownerExtension: 'm4-nara',
        widgetId: 'm4.nara.personalCoordinate',
        iconRef: '$(person)',
        orderPriority: 60
    }
];

export const IDE_DEEP_ACTIVITY_BAR_MODES: readonly ActivityBarMode[] = [
    ...DAILY_0_1_ACTIVITY_BAR_MODES,
    {
        modeId: 'pratibimba.activity-bar.backend-studio',
        ownerExtension: 'ide-shell-m0-m5',
        widgetId: 'pratibimba.backend-studio',
        iconRef: '$(server)',
        orderPriority: 70
    },
    {
        modeId: 'pratibimba.activity-bar.smart-connections',
        ownerExtension: 'smart-connections-sidebar',
        widgetId: 'pratibimba.smart-connections-sidebar',
        iconRef: '$(circuit-board)',
        orderPriority: 80
    }
];

export const expectedActivityBarModes: Readonly<
    Record<PratibimbaLayoutId, readonly ActivityBarMode[]>
> = {
    'daily-0-1': DAILY_0_1_ACTIVITY_BAR_MODES,
    'ide-deep': IDE_DEEP_ACTIVITY_BAR_MODES
};
