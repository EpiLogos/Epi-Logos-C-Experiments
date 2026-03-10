/**
 * Epi-Claw Gateway Store - Enhanced
 *
 * Comprehensive state management for Epi-Claw Gateway integration
 * Extends existing epiClawStore.ts with full 12-panel support
 *
 * Coordinates with business logic controllers in:
 * src/renderer/controllers/epi-claw/controllers.ts
 */

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { GatewayClient, type GatewayHelloOk, type GatewayEventFrame, DEFAULT_GATEWAY_URL } from '../controllers/epi-claw/gateway-client';
import type {
  CronJob,
} from '../controllers/epi-claw/types';
import * as Controllers from '../controllers/epi-claw/controllers';
import type { ConfigPanelMode } from '../domain/configPanelDomain';

// ============================================================================
// CONNECTION STATE
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

function normalizeChatPayload(evt: GatewayEventFrame): Controllers.ChatEventPayload | null {
  if (!evt.payload || typeof evt.payload !== 'object') {
    return null;
  }
  const payload = { ...(evt.payload as Record<string, unknown>) };

  if (evt.event === 'chat') {
    return payload as Controllers.ChatEventPayload;
  }

  if (!payload.state) {
    if (evt.event === 'chat.delta') payload.state = 'delta';
    if (evt.event === 'chat.final') payload.state = 'final';
    if (evt.event === 'chat.error') payload.state = 'error';
    if (evt.event === 'chat.aborted') payload.state = 'aborted';
  }

  return payload as Controllers.ChatEventPayload;
}

// ============================================================================
// PANEL TYPES - 12 Panels of Epi-Claw Gateway UI
// ============================================================================

export type GatewayPanel =
  | 'chat'      // Chat interface with tool outputs
  | 'workspace' // Consolidated configuration workspace
  | 'models'    // Model defaults/current/fallbacks
  | 'overview'  // Gateway status, health, entry points
  | 'channels'  // Manage messaging channels
  | 'instances' // Presence beacons
  | 'sessions'  // Inspect active sessions, defaults
  | 'cron'      // Schedule agent runs
  | 'skills'    // Manage skills, API keys
  | 'nodes'     // Paired devices, capabilities
  | 'config'    // Edit gateway config
  | 'debug'     // Snapshots, events, manual RPC
  | 'logs'      // Live log tail
  | 'settings'; // General settings

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface EpiClawGatewayState {
  // Connection
  connectionState: ConnectionState;
  connectionError: string | null;
  gatewayUrl: string;
  gatewayToken: string | null;
  gatewayPassword: string;
  hello: GatewayHelloOk | null;

  // Client instance
  client: GatewayClient | null;

  // Active panel
  activePanel: GatewayPanel;
  uiSettings: {
    theme: 'light' | 'dark' | 'glass' | 'discause' | 'nara-dark' | 'nara-light' | 'nara-glass' | 'nara-forest' | 'nara-mist' | 'nara-grove' | 'system';
    chatFocusMode: boolean;
    chatShowThinking: boolean;
    chatSplitRatio: number;
    navCollapsed: boolean;
    navGroupsCollapsed: Record<string, boolean>;
    skillsFilter: string;
    configPanelMode: ConfigPanelMode;
    configSearchQuery: string;
    configActiveSection: string | null;
    configActiveSubsection: string | null;
  };

  // Chat state
  chat: Controllers.ChatState;

  // Sessions state
  sessions: Controllers.SessionsState;

  // Channels state
  channels: Controllers.ChannelsState;

  // Skills state
  skills: Controllers.SkillsState;

  // Cron state
  cron: Controllers.CronState;

  // Config state
  config: Controllers.ConfigState;

  // Presence state
  presence: Controllers.PresenceState;

  // Debug state
  debug: Controllers.DebugState;

  // Logs state
  logs: Controllers.LogsState;

  // Nodes state
  nodes: Controllers.NodesState;
  devices: Controllers.DevicesState;

  // Actions - Connection
  connect: () => void;
  disconnect: () => void;
  setGatewayUrl: (url: string) => void;
  setGatewayToken: (token: string | null) => void;
  setGatewayPassword: (password: string) => void;
  setUiTheme: (theme: 'light' | 'dark' | 'glass' | 'discause' | 'nara-dark' | 'nara-light' | 'nara-glass' | 'nara-forest' | 'nara-mist' | 'nara-grove' | 'system') => void;
  setChatFocusMode: (enabled: boolean) => void;
  setChatShowThinking: (enabled: boolean) => void;
  setChatSplitRatio: (ratio: number) => void;
  setNavCollapsed: (collapsed: boolean) => void;
  setSkillsFilter: (filter: string) => void;
  setConfigPanelMode: (mode: ConfigPanelMode) => void;
  setConfigSearchQuery: (query: string) => void;
  setConfigActiveSection: (section: string | null) => void;
  setConfigActiveSubsection: (subsection: string | null) => void;

  // Actions - Chat
  sendMessage: (message: string, options?: {
    attachments?: Controllers.ChatAttachment[];
    deliver?: boolean;
  }) => Promise<string | null | void>;
  removeQueuedChatMessage: (id: string) => void;
  abortChat: () => Promise<void>;
  loadChatHistory: () => Promise<void>;
  setSessionKey: (sessionKey: string) => void;
  setChatDraft: (message: string) => void;

  // Actions - Sessions
  loadSessions: (overrides?: {
    activeMinutes?: number;
    limit?: number;
    includeGlobal?: boolean;
    includeUnknown?: boolean;
  }) => Promise<void>;
  patchSession: (key: string, patch: {
    label?: string | null;
    thinkingLevel?: string | null;
    verboseLevel?: string | null;
    reasoningLevel?: string | null;
  }) => Promise<void>;
  deleteSession: (key: string) => Promise<void>;

  // Actions - Channels
  loadChannels: (probe?: boolean) => Promise<void>;
  startWhatsAppLogin: (force?: boolean) => Promise<void>;
  waitWhatsAppLogin: () => Promise<void>;
  logoutWhatsApp: () => Promise<void>;

  // Actions - Skills
  loadSkills: () => Promise<void>;
  toggleSkill: (skillKey: string, enabled: boolean) => Promise<void>;
  setSkillEdit: (skillKey: string, value: string) => void;
  saveSkillApiKey: (skillKey: string) => Promise<void>;
  installSkill: (skillKey: string, name: string, installId: string) => Promise<void>;

  // Actions - Cron
  loadCronJobs: () => Promise<void>;
  toggleCronJob: (job: CronJob, enabled: boolean) => Promise<void>;
  addCronJob: (input: Controllers.CronAddInput) => Promise<void>;
  runCronJob: (job: CronJob) => Promise<void>;
  removeCronJob: (job: CronJob) => Promise<void>;
  loadCronRuns: (jobId: string) => Promise<void>;

  // Actions - Config
  loadConfig: () => Promise<void>;
  loadConfigSchema: () => Promise<void>;
  saveConfig: () => Promise<void>;
  applyConfig: () => Promise<void>;
  runUpdate: () => Promise<void>;
  setConfigRaw: (raw: string) => void;
  setConfigApplySessionKey: (sessionKey: string) => void;

  // Actions - Presence
  loadPresence: () => Promise<void>;

  // Actions - Debug
  loadDebugStatus: () => Promise<void>;
  loadDebugHealth: () => Promise<void>;
  callDebugMethod: (method: string, paramsText: string) => Promise<void>;

  // Actions - Logs
  loadLogs: (limit?: number) => Promise<void>;

  // Actions - Nodes
  loadNodes: () => Promise<void>;
  loadDevices: () => Promise<void>;
  approveDevicePairing: (requestId: string) => Promise<void>;
  rejectDevicePairing: (requestId: string) => Promise<void>;
  rotateDeviceToken: (params: { deviceId: string; role: string; scopes?: string[] }) => Promise<void>;
  revokeDeviceToken: (params: { deviceId: string; role: string }) => Promise<void>;

  // Actions - Navigation
  setActivePanel: (panel: GatewayPanel) => void;
}

// ============================================================================
// CREATE STORE
// ============================================================================

const createInitialState = (): Omit<EpiClawGatewayState, 'connect' | 'disconnect' | 'setGatewayUrl' | 'setGatewayToken' | 'setGatewayPassword' | 'setUiTheme' | 'setChatFocusMode' | 'setChatShowThinking' | 'setChatSplitRatio' | 'setNavCollapsed' | 'setSkillsFilter' | 'setConfigPanelMode' | 'setConfigSearchQuery' | 'setConfigActiveSection' | 'setConfigActiveSubsection' | 'sendMessage' | 'removeQueuedChatMessage' | 'abortChat' | 'loadChatHistory' | 'setSessionKey' | 'setChatDraft' | 'loadSessions' | 'patchSession' | 'deleteSession' | 'loadChannels' | 'startWhatsAppLogin' | 'waitWhatsAppLogin' | 'logoutWhatsApp' | 'loadSkills' | 'toggleSkill' | 'setSkillEdit' | 'saveSkillApiKey' | 'installSkill' | 'loadCronJobs' | 'toggleCronJob' | 'addCronJob' | 'runCronJob' | 'removeCronJob' | 'loadCronRuns' | 'loadConfig' | 'loadConfigSchema' | 'saveConfig' | 'applyConfig' | 'runUpdate' | 'setConfigRaw' | 'setConfigApplySessionKey' | 'loadPresence' | 'loadDebugStatus' | 'loadDebugHealth' | 'callDebugMethod' | 'loadLogs' | 'loadNodes' | 'loadDevices' | 'approveDevicePairing' | 'rejectDevicePairing' | 'rotateDeviceToken' | 'revokeDeviceToken' | 'setActivePanel'> => ({
  // Connection
  connectionState: 'disconnected',
  connectionError: null,
  gatewayUrl: DEFAULT_GATEWAY_URL,
  gatewayToken: null,
  gatewayPassword: '',
  hello: null,
  client: null,
  activePanel: 'overview',
  uiSettings: {
    theme: 'system',
    chatFocusMode: false,
    chatShowThinking: true,
    chatSplitRatio: 0.6,
    navCollapsed: false,
    navGroupsCollapsed: {},
    skillsFilter: '',
    configPanelMode: 'raw',
    configSearchQuery: '',
    configActiveSection: null,
    configActiveSubsection: null,
  },

  // Chat
  chat: {
    client: null,
    connected: false,
    sessionKey: 'main',
    chatLoading: false,
    chatMessages: [],
    chatThinkingLevel: null,
    chatSending: false,
    chatMessage: '',
    chatAttachments: [],
    chatQueue: [],
    chatRunId: null,
    chatStream: null,
    chatStreamStartedAt: null,
    chatLiveRuns: {},
    compactionStatus: null,
    lastError: null,
  },

  // Sessions
  sessions: {
    client: null,
    connected: false,
    sessionsLoading: false,
    sessionsResult: null,
    sessionsError: null,
    sessionsFilterActive: '',
    sessionsFilterLimit: '120',
    sessionsIncludeGlobal: true,
    sessionsIncludeUnknown: false,
  },

  // Channels
  channels: {
    client: null,
    connected: false,
    channelsLoading: false,
    channelsSnapshot: null,
    channelsError: null,
    channelsLastSuccess: null,
    whatsappBusy: false,
    whatsappLoginMessage: null,
    whatsappLoginQrDataUrl: null,
    whatsappLoginConnected: null,
  },

  // Skills
  skills: {
    client: null,
    connected: false,
    skillsLoading: false,
    skillsReport: null,
    skillsError: null,
    skillsBusyKey: null,
    skillEdits: {},
    skillMessages: {},
  },

  // Cron
  cron: {
    client: null,
    connected: false,
    cronLoading: false,
    cronJobs: [],
    cronStatus: null,
    cronError: null,
    cronBusy: false,
    cronRunsJobId: null,
    cronRuns: [],
  },

  // Config
  config: {
    client: null,
    connected: false,
    applySessionKey: 'main',
    configLoading: false,
    configRaw: '{}\n',
    configRawOriginal: '',
    configValid: null,
    configIssues: [],
    configSaving: false,
    configSnapshot: null,
    configSchema: null,
    configSchemaVersion: null,
    configUiHints: {},
    configLastAction: null,
    configLastActionStatus: null,
    configLastActionAt: null,
    lastError: null,
  },

  // Presence
  presence: {
    client: null,
    connected: false,
    presenceLoading: false,
    presenceEntries: [],
    presenceError: null,
  },

  // Debug
  debug: {
    client: null,
    connected: false,
    debugLoading: false,
    debugStatus: null,
    debugHealth: null,
    debugError: null,
    debugCallMethod: '',
    debugCallParams: '{}',
    debugCallResult: null,
  },

  // Logs
  logs: {
    client: null,
    connected: false,
    logsLoading: false,
    logsError: null,
    logsEntries: [],
    logsCursor: null,
  },

  // Nodes
  nodes: {
    client: null,
    connected: false,
    nodesLoading: false,
    nodes: [],
    nodesError: null,
  },
  devices: {
    client: null,
    connected: false,
    devicesLoading: false,
    devicesError: null,
    devicesList: null,
  },
});

export const useEpiClawGatewayStore = create<EpiClawGatewayState>()(persist((set, get) => {
  const initialState = createInitialState();
  const makeQueueId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const isChatBusy = (chat: Controllers.ChatState) => chat.chatSending || Boolean(chat.chatRunId);
  const isStopCommand = (text: string) => {
    const normalized = text.trim().toLowerCase();
    return normalized === '/stop' || normalized === 'stop' || normalized === 'abort' || normalized === 'esc' || normalized === 'wait' || normalized === 'exit';
  };
  const isResetCommand = (text: string) => {
    const normalized = text.trim().toLowerCase();
    return normalized === '/new' || normalized === '/reset' || normalized.startsWith('/new ') || normalized.startsWith('/reset ');
  };
  const clearCompactionLater = (delayMs = 5000) => {
    window.setTimeout(() => {
      const state = get();
      if (!state.chat.compactionStatus?.active) {
        state.chat.compactionStatus = null;
        set({ chat: { ...state.chat } });
      }
    }, delayMs);
  };

  const flushChatQueue = async () => {
    const state = get();
    if (isChatBusy(state.chat)) return;
    const [next, ...rest] = state.chat.chatQueue;
    if (!next) return;
    state.chat.chatQueue = rest;
    set({ chat: { ...state.chat } });
    const runId = await Controllers.sendChatMessage(state.chat, next.text, {
      attachments: next.attachments,
      deliver: next.deliver,
    });
    set({ chat: { ...state.chat } });
    if (!runId) {
      state.chat.chatQueue = [next, ...state.chat.chatQueue];
      set({ chat: { ...state.chat } });
      return;
    }
    if (next.refreshSessions) {
      await get().loadSessions({ activeMinutes: 120 });
    }
  };

  return {
    ...initialState,

    // ============================================================================
    // CONNECTION ACTIONS
    // ============================================================================

    connect: () => {
      const state = get();
      if (state.client) {
        state.client.stop();
      }

      set({ connectionState: 'connecting', connectionError: null });

      const client = new GatewayClient({
        url: state.gatewayUrl,
        token: state.gatewayToken ?? undefined,
        password: state.gatewayPassword || undefined,
        onHello: (hello: GatewayHelloOk) => {
          if (get().client !== client) return;
          set({
            connectionState: 'connected',
            hello,
            connectionError: null,
          });

          // Update all controller states with client
          const currentState = get();
          currentState.chat.client = client;
          currentState.chat.connected = true;
          currentState.sessions.client = client;
          currentState.sessions.connected = true;
          currentState.channels.client = client;
          currentState.channels.connected = true;
          currentState.skills.client = client;
          currentState.skills.connected = true;
          currentState.cron.client = client;
          currentState.cron.connected = true;
          currentState.config.client = client;
          currentState.config.connected = true;
          currentState.presence.client = client;
          currentState.presence.connected = true;
          currentState.debug.client = client;
          currentState.debug.connected = true;
          currentState.logs.client = client;
          currentState.logs.connected = true;
          currentState.nodes.client = client;
          currentState.nodes.connected = true;
          currentState.devices.client = client;
          currentState.devices.connected = true;

          // Load initial data
          void get().loadSessions();
          void get().loadChannels(false);
          void get().loadDebugStatus();
          void get().loadDevices();
        },
        onEvent: (evt: GatewayEventFrame) => {
          if (get().client !== client) return;
          if (
            evt.event === 'chat' ||
            evt.event === 'chat.delta' ||
            evt.event === 'chat.final' ||
            evt.event === 'chat.error' ||
            evt.event === 'chat.aborted'
          ) {
            const currentState = get();
            const payload = normalizeChatPayload(evt);
            const phase = Controllers.handleChatEvent(currentState.chat, payload ?? undefined);
            set({ chat: { ...currentState.chat } });
            if (phase === 'final' || phase === 'aborted') {
              void Controllers.loadChatHistory(currentState.chat).then(() => {
                set({ chat: { ...currentState.chat } });
                void flushChatQueue();
              });
            }
            return;
          }
          if (evt.event === 'device.pair.requested' || evt.event === 'device.pair.resolved') {
            const currentState = get();
            void Controllers.loadDevices(currentState.devices, { quiet: true }).then(() => {
              set({ devices: { ...currentState.devices } });
            });
            return;
          }
          if (evt.event === 'agent') {
            const payload = (evt.payload ?? {}) as { stream?: unknown; data?: unknown };
            const stream = typeof payload.stream === 'string' ? payload.stream : '';
            const currentState = get();
            const handledAgentStream = Controllers.handleAgentEventStream(
              currentState.chat,
              evt.payload as Controllers.GatewayAgentStreamPayload | undefined,
            );
            if (handledAgentStream) {
              set({ chat: { ...currentState.chat } });
            }
            if (stream === 'compaction') {
              const data = (payload.data ?? {}) as { phase?: unknown };
              const phase = typeof data.phase === 'string' ? data.phase : '';
              if (phase === 'start') {
                currentState.chat.compactionStatus = {
                  active: true,
                  startedAt: Date.now(),
                  completedAt: null,
                };
                set({ chat: { ...currentState.chat } });
              } else if (phase === 'end') {
                currentState.chat.compactionStatus = {
                  active: false,
                  startedAt: currentState.chat.compactionStatus?.startedAt ?? null,
                  completedAt: Date.now(),
                };
                set({ chat: { ...currentState.chat } });
                clearCompactionLater();
              }
            }
          }
        },
        onClose: (info) => {
          if (get().client !== client) return;
          const normalDisconnect = info.reason === 'disconnected';
          const currentState = get();
          currentState.chat.connected = false;
          currentState.sessions.connected = false;
          currentState.channels.connected = false;
          currentState.skills.connected = false;
          currentState.cron.connected = false;
          currentState.config.connected = false;
          currentState.presence.connected = false;
          currentState.debug.connected = false;
          currentState.logs.connected = false;
          currentState.nodes.connected = false;
          currentState.devices.connected = false;
          set({
            connectionState: 'disconnected',
            connectionError: normalDisconnect ? null : `Connection closed: ${info.reason}`,
            chat: { ...currentState.chat },
            sessions: { ...currentState.sessions },
            channels: { ...currentState.channels },
            skills: { ...currentState.skills },
            cron: { ...currentState.cron },
            config: { ...currentState.config },
            presence: { ...currentState.presence },
            debug: { ...currentState.debug },
            logs: { ...currentState.logs },
            nodes: { ...currentState.nodes },
            devices: { ...currentState.devices },
          });
        },
      });

      set({ client });
      client.start();
      window.setTimeout(() => {
        const latest = get();
        if (latest.client !== client) return;
        if (latest.connectionState === 'connecting') {
          set({
            connectionState: 'error',
            connectionError: 'Connection timed out. Verify gateway auth token/password and retry.',
          });
        }
      }, 9000);
    },

    disconnect: () => {
      const state = get();
      if (state.client) {
        state.client.stop();
        state.chat.connected = false;
        state.sessions.connected = false;
        state.channels.connected = false;
        state.skills.connected = false;
        state.cron.connected = false;
        state.config.connected = false;
        state.presence.connected = false;
        state.debug.connected = false;
        state.logs.connected = false;
        state.nodes.connected = false;
        state.devices.connected = false;
        set({
          client: null,
          connectionState: 'disconnected',
          connectionError: null,
          chat: { ...state.chat },
          sessions: { ...state.sessions },
          channels: { ...state.channels },
          skills: { ...state.skills },
          cron: { ...state.cron },
          config: { ...state.config },
          presence: { ...state.presence },
          debug: { ...state.debug },
          logs: { ...state.logs },
          nodes: { ...state.nodes },
          devices: { ...state.devices },
        });
      }
    },

    setGatewayUrl: (url: string) => set({ gatewayUrl: url }),

    setGatewayToken: (token: string | null) =>
      set({ gatewayToken: token && token.trim().length > 0 ? token.trim() : null }),

    setGatewayPassword: (password: string) => set({ gatewayPassword: password.trim() }),

    setUiTheme: (theme) => set((state) => ({ uiSettings: { ...state.uiSettings, theme } })),

    setChatFocusMode: (enabled) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, chatFocusMode: enabled } })),

    setChatShowThinking: (enabled) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, chatShowThinking: enabled } })),

    setChatSplitRatio: (ratio) =>
      set((state) => ({
        uiSettings: {
          ...state.uiSettings,
          chatSplitRatio: Math.max(0.4, Math.min(0.7, ratio)),
        },
      })),

    setNavCollapsed: (collapsed) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, navCollapsed: collapsed } })),

    setSkillsFilter: (filter: string) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, skillsFilter: filter } })),

    setConfigPanelMode: (mode) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, configPanelMode: mode } })),

    setConfigSearchQuery: (query: string) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, configSearchQuery: query } })),

    setConfigActiveSection: (section: string | null) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, configActiveSection: section } })),

    setConfigActiveSubsection: (subsection: string | null) =>
      set((state) => ({ uiSettings: { ...state.uiSettings, configActiveSubsection: subsection } })),

    // ============================================================================
    // CHAT ACTIONS
    // ============================================================================

    sendMessage: async (message: string, options) => {
      const state = get();
      const text = message.trim();
      const attachments = options?.attachments ?? [];
      const hasAttachments = attachments.length > 0;
      if (!text && !hasAttachments) {
        return;
      }

      if (isStopCommand(text)) {
        if (state.chat.chatRunId) {
          await Controllers.abortChatRun(state.chat);
          set({ chat: { ...state.chat } });
        }
        return;
      }

      if (isChatBusy(state.chat)) {
        state.chat.chatQueue = [
          ...state.chat.chatQueue,
          {
            id: makeQueueId(),
            text,
            createdAt: Date.now(),
            attachments: hasAttachments ? attachments.map((item) => ({ ...item })) : undefined,
            deliver: options?.deliver === true,
            refreshSessions: isResetCommand(text),
          },
        ];
        set({ chat: { ...state.chat } });
        return;
      }

      const result = await Controllers.sendChatMessage(state.chat, text, options);
      set({ chat: { ...state.chat } });
      if (result && isResetCommand(text)) {
        await get().loadSessions({ activeMinutes: 120 });
      }
      return result;
    },

    removeQueuedChatMessage: (id: string) => {
      const state = get();
      state.chat.chatQueue = state.chat.chatQueue.filter((item) => item.id !== id);
      set({ chat: { ...state.chat } });
    },

    abortChat: async () => {
      const state = get();
      await Controllers.abortChatRun(state.chat);
      set({ chat: { ...state.chat } });
    },

    loadChatHistory: async () => {
      const state = get();
      await Controllers.loadChatHistory(state.chat);
      set({ chat: { ...state.chat } });
    },

    setSessionKey: (sessionKey: string) => {
      const state = get();
      state.chat.sessionKey = sessionKey;
      state.chat.chatMessage = '';
      state.chat.chatMessages = [];
      state.chat.chatStream = null;
      state.chat.chatRunId = null;
      state.chat.chatLiveRuns = {};
      state.chat.chatQueue = [];
      set({ chat: { ...state.chat } });
    },

    setChatDraft: (message: string) => {
      const state = get();
      state.chat.chatMessage = message;
      set({ chat: { ...state.chat } });
    },

    // ============================================================================
    // SESSIONS ACTIONS
    // ============================================================================

    loadSessions: async (overrides) => {
      const state = get();
      await Controllers.loadSessions(state.sessions, overrides);
      set({ sessions: { ...state.sessions } });
    },

    patchSession: async (key: string, patch: {
      label?: string | null;
      thinkingLevel?: string | null;
      verboseLevel?: string | null;
      reasoningLevel?: string | null;
    }) => {
      const state = get();
      await Controllers.patchSession(state.sessions, key, patch);
      set({ sessions: { ...state.sessions } });
    },

    deleteSession: async (key: string) => {
      const state = get();
      await Controllers.deleteSession(state.sessions, key);
      set({ sessions: { ...state.sessions } });
    },

    // ============================================================================
    // CHANNELS ACTIONS
    // ============================================================================

    loadChannels: async (probe = false) => {
      const state = get();
      await Controllers.loadChannels(state.channels, probe);
      set({ channels: { ...state.channels } });
    },

    startWhatsAppLogin: async (force = false) => {
      const state = get();
      await Controllers.startWhatsAppLogin(state.channels, force);
      set({ channels: { ...state.channels } });
    },

    waitWhatsAppLogin: async () => {
      const state = get();
      await Controllers.waitWhatsAppLogin(state.channels);
      set({ channels: { ...state.channels } });
    },

    logoutWhatsApp: async () => {
      const state = get();
      await Controllers.logoutWhatsApp(state.channels);
      set({ channels: { ...state.channels } });
    },

    // ============================================================================
    // SKILLS ACTIONS
    // ============================================================================

    loadSkills: async () => {
      const state = get();
      await Controllers.loadSkills(state.skills);
      set({ skills: { ...state.skills } });
    },

    toggleSkill: async (skillKey: string, enabled: boolean) => {
      const state = get();
      await Controllers.updateSkillEnabled(state.skills, skillKey, enabled);
      set({ skills: { ...state.skills } });
    },

    setSkillEdit: (skillKey: string, value: string) => {
      const state = get();
      Controllers.updateSkillEdit(state.skills, skillKey, value);
      set({ skills: { ...state.skills } });
    },

    saveSkillApiKey: async (skillKey: string) => {
      const state = get();
      await Controllers.saveSkillApiKey(state.skills, skillKey);
      set({ skills: { ...state.skills } });
    },

    installSkill: async (skillKey: string, name: string, installId: string) => {
      const state = get();
      await Controllers.installSkill(state.skills, skillKey, name, installId);
      set({ skills: { ...state.skills } });
    },

    // ============================================================================
    // CRON ACTIONS
    // ============================================================================

    loadCronJobs: async () => {
      const state = get();
      await Controllers.loadCronJobs(state.cron);
      set({ cron: { ...state.cron } });
    },

    toggleCronJob: async (job: CronJob, enabled: boolean) => {
      const state = get();
      await Controllers.toggleCronJob(state.cron, job, enabled);
      set({ cron: { ...state.cron } });
    },

    addCronJob: async (input) => {
      const state = get();
      await Controllers.addCronJob(state.cron, input);
      set({ cron: { ...state.cron } });
    },

    runCronJob: async (job: CronJob) => {
      const state = get();
      await Controllers.runCronJob(state.cron, job);
      set({ cron: { ...state.cron } });
    },

    removeCronJob: async (job: CronJob) => {
      const state = get();
      await Controllers.removeCronJob(state.cron, job);
      set({ cron: { ...state.cron } });
    },

    loadCronRuns: async (jobId: string) => {
      const state = get();
      await Controllers.loadCronRuns(state.cron, jobId);
      set({ cron: { ...state.cron } });
    },

    // ============================================================================
    // CONFIG ACTIONS
    // ============================================================================

    loadConfig: async () => {
      const state = get();
      await Controllers.loadConfig(state.config);
      set({ config: { ...state.config } });
    },

    loadConfigSchema: async () => {
      const state = get();
      await Controllers.loadConfigSchema(state.config);
      set({ config: { ...state.config } });
    },

    saveConfig: async () => {
      const state = get();
      await Controllers.saveConfig(state.config);
      set({ config: { ...state.config } });
    },

    applyConfig: async () => {
      const state = get();
      await Controllers.applyConfig(state.config);
      set({ config: { ...state.config } });
    },

    runUpdate: async () => {
      const state = get();
      await Controllers.runUpdate(state.config);
      set({ config: { ...state.config } });
    },

    setConfigRaw: (raw: string) => {
      const state = get();
      Controllers.setConfigRawDraft(state.config, raw);
      set({ config: { ...state.config } });
    },

    setConfigApplySessionKey: (sessionKey: string) => {
      const state = get();
      state.config.applySessionKey = sessionKey;
      set({ config: { ...state.config } });
    },

    // ============================================================================
    // PRESENCE ACTIONS
    // ============================================================================

    loadPresence: async () => {
      const state = get();
      await Controllers.loadPresence(state.presence);
      set({ presence: { ...state.presence } });
    },

    // ============================================================================
    // DEBUG ACTIONS
    // ============================================================================

    loadDebugStatus: async () => {
      const state = get();
      await Controllers.loadDebugStatus(state.debug);
      set({ debug: { ...state.debug } });
    },

    loadDebugHealth: async () => {
      const state = get();
      await Controllers.loadDebugHealth(state.debug);
      set({ debug: { ...state.debug } });
    },

    callDebugMethod: async (method: string, paramsText: string) => {
      const state = get();
      state.debug.debugCallMethod = method;
      state.debug.debugCallParams = paramsText;
      await Controllers.callDebugMethod(state.debug);
      set({ debug: { ...state.debug } });
    },

    // ============================================================================
    // LOGS ACTIONS
    // ============================================================================

    loadLogs: async (limit = 500) => {
      const state = get();
      await Controllers.loadLogs(state.logs, limit);
      set({ logs: { ...state.logs } });
    },

    // ============================================================================
    // NODES ACTIONS
    // ============================================================================

    loadNodes: async () => {
      const state = get();
      await Controllers.loadNodes(state.nodes);
      set({ nodes: { ...state.nodes } });
    },

    loadDevices: async () => {
      const state = get();
      await Controllers.loadDevices(state.devices);
      set({ devices: { ...state.devices } });
    },

    approveDevicePairing: async (requestId: string) => {
      const state = get();
      await Controllers.approveDevicePairing(state.devices, requestId);
      set({ devices: { ...state.devices } });
    },

    rejectDevicePairing: async (requestId: string) => {
      const state = get();
      await Controllers.rejectDevicePairing(state.devices, requestId);
      set({ devices: { ...state.devices } });
    },

    rotateDeviceToken: async (params: { deviceId: string; role: string; scopes?: string[] }) => {
      const state = get();
      await Controllers.rotateDeviceToken(state.devices, params);
      set({ devices: { ...state.devices } });
    },

    revokeDeviceToken: async (params: { deviceId: string; role: string }) => {
      const state = get();
      await Controllers.revokeDeviceToken(state.devices, params);
      set({ devices: { ...state.devices } });
    },

    // ============================================================================
    // NAVIGATION ACTIONS
    // ============================================================================

    setActivePanel: (panel: GatewayPanel) => set({ activePanel: panel }),
  };
}, {
  name: 'epi-gateway-storage',
  storage: createJSONStorage(() => {
    const candidate = (globalThis as { localStorage?: Partial<StateStorage> }).localStorage;
    if (
      candidate &&
      typeof candidate.getItem === 'function' &&
      typeof candidate.setItem === 'function' &&
      typeof candidate.removeItem === 'function'
    ) {
      return candidate as StateStorage;
    }
    const noopStorage: StateStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    return noopStorage;
  }),
  partialize: (state) => ({
    gatewayUrl: state.gatewayUrl,
    gatewayToken: state.gatewayToken,
    uiSettings: state.uiSettings,
    chat: {
      sessionKey: state.chat.sessionKey,
      chatMessage: state.chat.chatMessage,
    },
  }),
  merge: (persistedState, currentState) => {
    const persisted = persistedState as Partial<EpiClawGatewayState> | undefined;
    return {
      ...currentState,
      gatewayUrl: persisted?.gatewayUrl ?? currentState.gatewayUrl,
      gatewayToken: persisted?.gatewayToken ?? currentState.gatewayToken,
      uiSettings: {
        ...currentState.uiSettings,
        ...persisted?.uiSettings,
      },
      chat: {
        ...currentState.chat,
        sessionKey: persisted?.chat?.sessionKey ?? currentState.chat.sessionKey,
        chatMessage: persisted?.chat?.chatMessage ?? currentState.chat.chatMessage,
      },
    };
  },
}));

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to auto-connect to gateway on mount
 */
export function useEpiClawGateway(autoConnect = true) {
  const store = useEpiClawGatewayStore();
  const { connectionState, connect } = store;

  // React to connection state changes
  // In a real React component, this would be useEffect
  if (autoConnect && connectionState === 'disconnected') {
    connect();
  }

  return store;
}
