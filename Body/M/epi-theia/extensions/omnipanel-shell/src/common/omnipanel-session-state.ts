import {
    OMNIPANEL_DEFAULT_TAB,
    OMNIPANEL_TABS,
    type OmniPanelTabId
} from './omnipanel-types';

export type OmniPanelChromeState = 'hidden' | 'minimized' | 'normal' | 'fullscreen';

export interface OmniPanelSessionState {
    readonly activeTab: OmniPanelTabId;
    readonly perTabState: Record<OmniPanelTabId, Record<string, unknown>>;
    readonly omniState: OmniPanelChromeState;
    readonly lastPiChatMessageTimestamp: number | null;
}

export interface ToolStreamSessionTabState {
    readonly filters: Record<string, unknown>;
    readonly selectedEventId: string | null;
    readonly scrollOffset: number;
    readonly live: boolean;
}

export interface EvidenceSessionTabState {
    readonly selectedPacketId: string | null;
    readonly filters: Record<string, unknown>;
    readonly scrollOffset: number;
    readonly depositFormOpen: boolean;
    readonly depositFormDraft?: Record<string, unknown>;
}

export type GatewaySessionSubView =
    | 'capabilities'
    | 'nodes'
    | 'models'
    | 'skills'
    | 'cron'
    | 'config'
    | 'settings';

export interface GatewaySessionTabState {
    readonly activeSubView: GatewaySessionSubView;
    readonly selectedCapabilityName: string | null;
    readonly tryItDraft?: Record<string, unknown>;
}

export type DiagnosticsSessionSubSection =
    | 'overview'
    | 'kernel-bridge'
    | 'profile'
    | 's2-graph'
    | 'gateway-ws'
    | 'intent-log'
    | null;

export interface DiagnosticsSessionTabState {
    readonly activeSubSection: DiagnosticsSessionSubSection;
    readonly intentLogScrollOffset: number;
}

const OMNIPANEL_TAB_IDS = OMNIPANEL_TABS.map(tab => tab.id);
const OMNIPANEL_STATE_FILE = 'omnipanel.json';

export function createOmniPanelDefaultState(): OmniPanelSessionState {
    return {
        activeTab: OMNIPANEL_DEFAULT_TAB,
        perTabState: createDefaultPerTabState(),
        omniState: 'normal',
        lastPiChatMessageTimestamp: null
    };
}

export async function persistOmniPanelState(state: OmniPanelSessionState): Promise<void> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = await omniPanelStatePath();
    const directory = path.dirname(filePath);
    const serialized = `${JSON.stringify(normalizeOmniPanelSessionState(state), null, 2)}\n`;

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, serialized, 'utf8');
}

export async function readOmniPanelState(): Promise<OmniPanelSessionState> {
    const fs = await import('node:fs/promises');
    const filePath = await omniPanelStatePath();

    let raw: string;
    try {
        raw = await fs.readFile(filePath, 'utf8');
    } catch (err) {
        if (isErrnoException(err) && err.code === 'ENOENT') {
            return createOmniPanelDefaultState();
        }
        throw err;
    }

    return normalizeOmniPanelSessionState(JSON.parse(raw));
}

export async function omniPanelStatePath(): Promise<string> {
    const os = await import('node:os');
    const path = await import('node:path');
    const epiLogosHome = process.env.EPI_LOGOS_HOME ?? path.join(os.homedir(), '.epi-logos');
    return path.join(epiLogosHome, 'ui-state', OMNIPANEL_STATE_FILE);
}

export function normalizeOmniPanelSessionState(value: unknown): OmniPanelSessionState {
    const defaults = createOmniPanelDefaultState();
    if (!isRecord(value)) {
        return defaults;
    }

    return {
        activeTab: isOmniPanelTabId(value.activeTab) ? value.activeTab : defaults.activeTab,
        perTabState: normalizePerTabState(value.perTabState),
        omniState: normalizeOmniState(value.omniState),
        lastPiChatMessageTimestamp: normalizeTimestamp(value.lastPiChatMessageTimestamp)
    };
}

function createDefaultPerTabState(): Record<OmniPanelTabId, Record<string, unknown>> {
    const entries = OMNIPANEL_TAB_IDS.map(tabId => [tabId, {}]);
    const perTabState = Object.fromEntries(entries) as Record<OmniPanelTabId, Record<string, unknown>>;
    perTabState['tool-stream'] = createDefaultToolStreamTabState() as unknown as Record<string, unknown>;
    perTabState.evidence = createDefaultEvidenceTabState() as unknown as Record<string, unknown>;
    perTabState.gateway = createDefaultGatewayTabState() as unknown as Record<string, unknown>;
    perTabState.diagnostics = createDefaultDiagnosticsTabState() as unknown as Record<string, unknown>;
    return perTabState;
}

function normalizePerTabState(value: unknown): Record<OmniPanelTabId, Record<string, unknown>> {
    const raw = isRecord(value) ? value : {};
    const perTabState = createDefaultPerTabState();

    for (const tabId of OMNIPANEL_TAB_IDS) {
        const tabState = raw[tabId];
        perTabState[tabId] = isRecord(tabState) ? { ...tabState } : {};
    }
    perTabState['tool-stream'] = normalizeToolStreamTabState(raw['tool-stream']) as unknown as Record<string, unknown>;
    perTabState.evidence = normalizeEvidenceTabState(raw.evidence) as unknown as Record<string, unknown>;
    perTabState.gateway = normalizeGatewayTabState(raw.gateway) as unknown as Record<string, unknown>;
    perTabState.diagnostics = normalizeDiagnosticsTabState(raw.diagnostics) as unknown as Record<string, unknown>;

    return perTabState;
}

function createDefaultToolStreamTabState(): ToolStreamSessionTabState {
    return {
        filters: {},
        selectedEventId: null,
        scrollOffset: 0,
        live: true
    };
}

function normalizeToolStreamTabState(value: unknown): ToolStreamSessionTabState {
    const defaults = createDefaultToolStreamTabState();
    if (!isRecord(value)) {
        return defaults;
    }
    return {
        filters: isRecord(value.filters) ? { ...value.filters } : defaults.filters,
        selectedEventId: typeof value.selectedEventId === 'string' ? value.selectedEventId : null,
        scrollOffset: normalizeNonNegativeNumber(value.scrollOffset, defaults.scrollOffset),
        live: typeof value.live === 'boolean' ? value.live : defaults.live
    };
}

function createDefaultEvidenceTabState(): EvidenceSessionTabState {
    return {
        selectedPacketId: null,
        filters: {},
        scrollOffset: 0,
        depositFormOpen: false
    };
}

function normalizeEvidenceTabState(value: unknown): EvidenceSessionTabState {
    const defaults = createDefaultEvidenceTabState();
    if (!isRecord(value)) {
        return defaults;
    }
    const draft = isRecord(value.depositFormDraft) ? { ...value.depositFormDraft } : undefined;
    return {
        filters: isRecord(value.filters) ? { ...value.filters } : defaults.filters,
        selectedPacketId: typeof value.selectedPacketId === 'string' ? value.selectedPacketId : null,
        scrollOffset: normalizeNonNegativeNumber(value.scrollOffset, defaults.scrollOffset),
        depositFormOpen: typeof value.depositFormOpen === 'boolean' ? value.depositFormOpen : defaults.depositFormOpen,
        ...(draft ? { depositFormDraft: draft } : {})
    };
}

function createDefaultGatewayTabState(): GatewaySessionTabState {
    return {
        activeSubView: 'capabilities',
        selectedCapabilityName: null
    };
}

function normalizeGatewayTabState(value: unknown): GatewaySessionTabState {
    const defaults = createDefaultGatewayTabState();
    if (!isRecord(value)) {
        return defaults;
    }
    const draft = isRecord(value.tryItDraft) ? { ...value.tryItDraft } : undefined;
    return {
        activeSubView: normalizeGatewaySubView(value.activeSubView),
        selectedCapabilityName: typeof value.selectedCapabilityName === 'string' ? value.selectedCapabilityName : null,
        ...(draft ? { tryItDraft: draft } : {})
    };
}

function normalizeGatewaySubView(value: unknown): GatewaySessionSubView {
    if (
        value === 'capabilities' ||
        value === 'nodes' ||
        value === 'models' ||
        value === 'skills' ||
        value === 'cron' ||
        value === 'config' ||
        value === 'settings'
    ) {
        return value;
    }
    return 'capabilities';
}

function createDefaultDiagnosticsTabState(): DiagnosticsSessionTabState {
    return {
        activeSubSection: 'overview',
        intentLogScrollOffset: 0
    };
}

function normalizeDiagnosticsTabState(value: unknown): DiagnosticsSessionTabState {
    const defaults = createDefaultDiagnosticsTabState();
    if (!isRecord(value)) {
        return defaults;
    }
    return {
        activeSubSection: normalizeDiagnosticsSubSection(value.activeSubSection),
        intentLogScrollOffset: normalizeNonNegativeNumber(
            value.intentLogScrollOffset,
            defaults.intentLogScrollOffset
        )
    };
}

function normalizeDiagnosticsSubSection(value: unknown): DiagnosticsSessionSubSection {
    if (
        value === 'overview' ||
        value === 'kernel-bridge' ||
        value === 'profile' ||
        value === 's2-graph' ||
        value === 'gateway-ws' ||
        value === 'intent-log' ||
        value === null
    ) {
        return value as DiagnosticsSessionSubSection;
    }
    return 'overview';
}

function normalizeOmniState(value: unknown): OmniPanelChromeState {
    if (
        value === 'hidden' ||
        value === 'minimized' ||
        value === 'normal' ||
        value === 'fullscreen'
    ) {
        return value;
    }
    if (value === 'minimal') {
        return 'minimized';
    }
    return 'normal';
}

function normalizeTimestamp(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeNonNegativeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function isOmniPanelTabId(value: unknown): value is OmniPanelTabId {
    return typeof value === 'string' && OMNIPANEL_TAB_IDS.includes(value as OmniPanelTabId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
    return Boolean(value) && typeof value === 'object' && 'code' in value;
}
