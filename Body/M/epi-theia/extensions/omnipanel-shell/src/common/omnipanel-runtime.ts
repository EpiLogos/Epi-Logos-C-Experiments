import {
    OMNIPANEL_DEFAULT_TAB,
    OMNIPANEL_TABS,
    type OmniPanelManifest,
    type OmniPanelState,
    type OmniPanelTab,
    type OmniPanelTabId
} from './omnipanel-types';

export type ToolStreamPrivacyClass = 'public' | 'protected' | 'protected-local' | 'private' | string;

export interface ProtectedHandleMetadata {
    readonly handle: string;
    readonly namespace: string;
    readonly privacyClass: string;
    readonly summary?: string | null;
}

export interface ToolStreamEvent {
    readonly id: string;
    readonly emittedAtMs: number | null;
    readonly tool: string;
    readonly kind: 'tool.start' | 'tool.partial' | 'tool.end' | 'tool.error' | 'route.start' | 'route.end' | string;
    readonly payload?: unknown;
    readonly privacyClass?: ToolStreamPrivacyClass | null;
    readonly actor: string;
    readonly dispatchNodeId: string;
    readonly sessionKey: string | null;
    readonly tickAtEmit: number | null;
    readonly inputDigest?: string | null;
    readonly outputDigest?: string | null;
    readonly latencyMs?: number | null;
    readonly evidencePacketRef?: string | null;
    readonly args?: unknown;
    readonly result?: unknown;
    readonly error?: unknown;
}

export function sanitizeProtectedHandle(ref: unknown): ProtectedHandleMetadata {
    const raw = isRuntimeRecord(ref) ? ref : {};
    return Object.freeze({
        handle: runtimeString(raw.handle) ?? 'protected-handle',
        namespace: runtimeString(raw.namespace) ?? 'protected-local',
        privacyClass: runtimeString(raw.privacyClass) ?? 'protected',
        summary: runtimeString(raw.summary) ?? null
    });
}

export function collapseOmniPanelManifest(
    declaredTabs: readonly OmniPanelTab[] = OMNIPANEL_TABS,
    requestedDefaultTab: string = OMNIPANEL_DEFAULT_TAB
): OmniPanelManifest {
    const byId = new Map<string, OmniPanelTab>();
    for (const tab of declaredTabs) {
        validateTab(tab);
        byId.set(tab.id, tab);
    }

    const tabs = [...byId.values()].sort((left, right) => {
        const priorityDelta = left.priority - right.priority;
        return priorityDelta === 0 ? left.id.localeCompare(right.id) : priorityDelta;
    });

    if (tabs.length === 0) {
        throw new Error('OmniPanel manifest must declare at least one tab.');
    }

    return Object.freeze({
        tabs: Object.freeze(tabs),
        defaultTab: resolveDefaultTab({ tabs, defaultTab: requestedDefaultTab }, requestedDefaultTab)
    });
}

export function resolveDefaultTab(
    manifest: OmniPanelManifest,
    requestedDefaultTab: string = manifest.defaultTab
): string {
    const requested = manifest.tabs.find(tab => tab.id === requestedDefaultTab);
    if (requested) {
        return requested.id;
    }
    const manifestDefault = manifest.tabs.find(tab => tab.id === manifest.defaultTab);
    return manifestDefault?.id ?? manifest.tabs[0]?.id ?? OMNIPANEL_DEFAULT_TAB;
}

export function createOmniPanelState(
    manifest: OmniPanelManifest,
    initialState: Partial<OmniPanelState> = {}
): OmniPanelState {
    const activeTab = isKnownTab(manifest, initialState.activeTab)
        ? initialState.activeTab
        : resolveDefaultTab(manifest);

    return Object.freeze({
        activeTab,
        collapsed: initialState.collapsed ?? false
    });
}

export function activateOmniPanelTab(
    state: OmniPanelState,
    manifest: OmniPanelManifest,
    tabId: string
): OmniPanelState {
    assertKnownTab(manifest, tabId);
    return Object.freeze({
        ...state,
        activeTab: tabId,
        collapsed: false
    });
}

export function deactivateOmniPanelTab(
    state: OmniPanelState,
    manifest: OmniPanelManifest
): OmniPanelState {
    return Object.freeze({
        ...state,
        activeTab: resolveDefaultTab(manifest)
    });
}

export function toggleOmniPanelCollapse(state: OmniPanelState): OmniPanelState {
    return Object.freeze({
        ...state,
        collapsed: !state.collapsed
    });
}

export function isOmniPanelTabId(tabId: string): tabId is OmniPanelTabId {
    return OMNIPANEL_TABS.some(tab => tab.id === tabId);
}

export function findOmniPanelTab(
    manifest: OmniPanelManifest,
    tabId: string
): OmniPanelTab | undefined {
    return manifest.tabs.find(tab => tab.id === tabId);
}

function isKnownTab(manifest: OmniPanelManifest, tabId: string | undefined): tabId is OmniPanelTabId {
    return typeof tabId === 'string' && manifest.tabs.some(tab => tab.id === tabId);
}

function assertKnownTab(manifest: OmniPanelManifest, tabId: string): void {
    if (!isKnownTab(manifest, tabId)) {
        const ids = manifest.tabs.map(tab => tab.id).join(', ');
        throw new Error(`Unknown OmniPanel tab "${tabId}". Expected one of: ${ids}`);
    }
}

function validateTab(tab: OmniPanelTab): void {
    if (!tab.id || !tab.label || !tab.icon || !tab.extensionId) {
        throw new Error('OmniPanel tab declarations require id, label, icon, and extensionId.');
    }
    if (!Number.isFinite(tab.priority)) {
        throw new Error(`OmniPanel tab "${tab.id}" has an invalid priority.`);
    }
}

function isRuntimeRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function runtimeString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
