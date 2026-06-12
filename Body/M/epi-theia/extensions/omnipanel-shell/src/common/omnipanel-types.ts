/**
 * Shared OmniPanel runtime contracts.
 *
 * The eight-tab surface is the DR-WC-OP-1 collapse map: legacy overview,
 * channel, node, model, skill, cron, settings, instance, and debug surfaces
 * are represented through the canonical runtime tabs below.
 */

export const OMNIPANEL_WIDGET_ID = 'pratibimba.omnipanel.shell';
export const OMNIPANEL_WIDGET_LABEL = 'OmniPanel';

export type OmniPanelTabId =
    | 'pi-chat'
    | 'sessions'
    | 'dispatch-trace'
    | 'tool-stream'
    | 'evidence'
    | 'review'
    | 'gateway'
    | 'diagnostics';

export interface OmniPanelTab {
    readonly id: OmniPanelTabId;
    readonly label: string;
    readonly icon: string;
    readonly extensionId: string;
    readonly priority: number;
}

export interface OmniPanelManifest {
    readonly tabs: readonly OmniPanelTab[];
    readonly defaultTab: string;
}

export interface OmniPanelState {
    readonly activeTab: string;
    readonly collapsed: boolean;
}

export interface OmniPanelDisposable {
    dispose(): void;
}

export interface OmniPanelProfileTickEvent {
    readonly generation: number | null;
    readonly profile: unknown | null;
    readonly advanced: boolean;
    readonly emittedAt: number;
}

export type OmniPanelProfileTickListener = (event: OmniPanelProfileTickEvent) => void;

export interface OmniPanelRuntimeApi {
    readonly state: OmniPanelState;
    readonly onProfileTick: (listener: OmniPanelProfileTickListener) => OmniPanelDisposable;
    activateTab(tabId: string): OmniPanelState;
    deactivateTab(): OmniPanelState;
    toggleCollapse(): OmniPanelState;
    getManifest(): OmniPanelManifest;
    useProfileTick(listener: OmniPanelProfileTickListener): OmniPanelDisposable;
}

/**
 * Canonical eight-tab OmniPanel declaration set.
 */
export const OMNIPANEL_TABS: readonly OmniPanelTab[] = Object.freeze([
    {
        id: 'pi-chat',
        label: 'Pi Chat',
        icon: 'message-square',
        extensionId: '@pratibimba/omnipanel-shell',
        priority: 10
    },
    {
        id: 'sessions',
        label: 'Sessions',
        icon: 'history',
        extensionId: '@pratibimba/omnipanel-shell',
        priority: 20
    },
    {
        id: 'dispatch-trace',
        label: 'Dispatch Trace',
        icon: 'route',
        extensionId: '@pratibimba/agentic-control-room',
        priority: 30
    },
    {
        id: 'tool-stream',
        label: 'Tool Stream',
        icon: 'terminal-square',
        extensionId: '@pratibimba/agentic-control-room',
        priority: 40
    },
    {
        id: 'evidence',
        label: 'Evidence',
        icon: 'archive',
        extensionId: '@pratibimba/ide-shell-m0-m5',
        priority: 50
    },
    {
        id: 'review',
        label: 'Review',
        icon: 'badge-check',
        extensionId: '@pratibimba/m5-epii',
        priority: 60
    },
    {
        id: 'gateway',
        label: 'Gateway',
        icon: 'plug-zap',
        extensionId: '@pratibimba/kernel-bridge',
        priority: 70
    },
    {
        id: 'diagnostics',
        label: 'Diagnostics',
        icon: 'activity',
        extensionId: '@pratibimba/kernel-bridge',
        priority: 80
    }
] as const);

export const OMNIPANEL_DEFAULT_TAB: OmniPanelTabId = 'pi-chat';

/**
 * Cross-layout intent envelope, preserved for existing deep-link consumers.
 */
export interface CrossLayoutIntent {
    readonly coordinate: string | null;
    readonly artifactUri: string | null;
    readonly reviewId: string | null;
    readonly dayNow: string | null;
    readonly sessionKey: string | null;
    readonly profileGeneration: number | null;
    readonly privacyClass: 'public' | 'protected' | 'private' | null;
    readonly requestedLayout: 'daily-0-1' | 'ide-deep';
    readonly requestedExtensionId: string | null;
    readonly requestedContributionId: string | null;
}
