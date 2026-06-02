/**
 * OmniPanel typed contracts shared between the OmniPanel Theia widget,
 * downstream panel contributions, and any cross-extension consumers.
 *
 * The OmniPanel is the canonical `/` command membrane per canon §2-§3 and
 * the migration target for:
 * - `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` (~960 LOC, the
 *   production Electron OmniPanel with chat/contracts/layout/panels/ui
 *   sub-tree) — the *wholesale port source*.
 * - `Body/M/epi-tauri/src/components/OmniPanel.tsx` (281 LOC slim Tauri
 *   port) — superseded by the Electron source's depth.
 * - `Body/M/epi-tauri/src/components/CommandPalette.tsx` — folded into
 *   `Pratibimba: OmniPanel Toggle` + `Pratibimba: OmniPanel Find` commands.
 *
 * Track 05 T2 lands the scaffold + Theia widget skeleton. T5 promotes it
 * to canonical cross-layout intent routing per the new T5 deliverables.
 */

export const OMNIPANEL_WIDGET_ID = 'pratibimba.omnipanel.shell';
export const OMNIPANEL_WIDGET_LABEL = 'OmniPanel';

/**
 * Identifiers for the panels the production OmniPanel exposes. These
 * correspond 1:1 with the `Body/S/S3/epi-app/renderer/components/omni/panels/*`
 * tree that lands as wholesale port at T2/T5.
 */
export type OmniPanelTabId =
    | 'overview'
    | 'chat'
    | 'channels'
    | 'sessions'
    | 'nodes'
    | 'models'
    | 'skills'
    | 'cron'
    | 'logs'
    | 'config'
    | 'settings'
    | 'instances'
    | 'debug';

export interface OmniPanelTab {
    readonly id: OmniPanelTabId;
    readonly label: string;
    /**
     * Theia widget id this tab opens when activated. Null for tabs that
     * only render inline content inside the OmniPanel itself.
     */
    readonly widgetId: string | null;
    /**
     * The layout(s) this tab is visible in. The OmniPanel shell hides
     * tabs that the active layout does not advertise (e.g. logs/debug
     * remain visible across both layouts; deep-IDE-specific tabs hide
     * in the 0/1 daily layout).
     */
    readonly availableInLayouts: ReadonlyArray<'daily-0-1' | 'ide-deep'>;
}

/**
 * Initial tab manifest. Final population happens during the wholesale
 * port from `Body/S/S3/epi-app/renderer/components/omni/panels/`. The
 * shape here matches what the production OmniPanel already exposes so
 * downstream wiring can target it without waiting for the port to land.
 */
export const OMNIPANEL_TABS: ReadonlyArray<OmniPanelTab> = [
    { id: 'overview',  label: 'Overview',  widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'chat',      label: 'Chat',      widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'channels',  label: 'Channels',  widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'sessions',  label: 'Sessions',  widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'nodes',     label: 'Nodes',     widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'models',    label: 'Models',    widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'skills',    label: 'Skills',    widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'cron',      label: 'Cron',      widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'logs',      label: 'Logs',      widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'config',    label: 'Config',    widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'settings',  label: 'Settings',  widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'instances', label: 'Instances', widgetId: null, availableInLayouts: ['ide-deep'] },
    { id: 'debug',     label: 'Debug',     widgetId: null, availableInLayouts: ['ide-deep'] }
];

/**
 * Cross-layout intent envelope — T5 deliverable. Recorded here at T2 so
 * downstream consumers can type-check against the final shape even before
 * intent routing is implemented.
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
