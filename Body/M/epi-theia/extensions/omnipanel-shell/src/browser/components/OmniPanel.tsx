// @ts-nocheck
// Wholesale-ported from Body/S/S3/epi-app/renderer/... — Track 05 T2.
// Source authored under "noEmit: true" with strict type assertions that
// the source build never validated end-to-end. We accept the port as-is
// (adapted not rewritten); strict typing returns when the kernel-bridge
// DI services replace window.sPrime calls at Track 05 T3.
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useEpiClawGatewayStore } from '../stores/epiClawGatewayStore';
import type { GatewaySessionRow, CronJob } from '../controllers/epi-claw/types';
import { ADVANCED_PANELS, isGatewayPanel } from './omni/contracts/panels';
import { PrimaryTabs } from './omni/layout/PrimaryTabs';
import { OmniPanelHeader } from './omni/layout/OmniPanelHeader';
import { PiChatPanel } from './omni/chat/PiChatPanel';
import { OverviewPanel } from './omni/panels/OverviewPanel';
import { SessionManagerPanel } from './omni/panels/SessionManagerPanel';
import { ChannelsPanel } from './omni/panels/ChannelsPanel';
import { InstancesPanel } from './omni/panels/InstancesPanel';
import { CronPanel } from './omni/panels/CronPanel';
import { SkillsPanel } from './omni/panels/SkillsPanel';
import { NodesPanel } from './omni/panels/NodesPanel';
import { ConfigPanel } from './omni/panels/ConfigPanel';
import { DiagnosticsPanel } from './omni/panels/DiagnosticsPanel';
import { LogsPanel } from './omni/panels/LogsPanel';
import { SettingsPanel } from './omni/panels/SettingsPanel';
import { ModelsPanel } from './omni/panels/ModelsPanel';
import { GatewayPanel } from './omni/panels/GatewayPanel';
import { DispatchTracePanel } from './omni/panels/DispatchTracePanel';
import { ToolStreamPanel } from './omni/panels/ToolStreamPanel';
import { EvidencePanel } from './omni/panels/EvidencePanel';
import {
  createIntentLogEntry,
  reduceIntentLog
} from './omni/diagnostics/CrossLayoutIntentLog';
import { useDomainStore } from '../stores/domainStore';
import { resolveThemeForDomain } from '../theme/resolveTheme';
import type { DispatchGenealogySelection } from '../../common/dispatch-genealogy';
import type { PrivacyDropAggregate } from '@pratibimba/ide-shell-m0-m5/lib/browser/services/privacy-drop-feed';
import {
  PENDING_M_READINESS,
  type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import { CROSS_LAYOUT_INTENT_TELEMETRY_EVENT } from '@pratibimba/pratibimba-layouts/lib/common/cross-layout-intent';
import { extractSessionKey, MAIN_EPII_SESSION_KEY } from './omni/sessions/sessionManagerModel';

const OMNI_UI_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

interface OmniPanelProps {
  state: 'hidden' | 'minimal' | 'fullscreen';
  onClose: () => void;
  onOpenSource?: (coordinate: string, sourceAnchor: string) => Promise<unknown> | unknown;
  readinessSnapshot?: MExtensionReadinessSnapshot;
  profileTickTelemetry?: {
    subscriberCount: number;
    tickHistory: readonly Array<{ generation: number | null; emittedAt: number; advanced: boolean }>;
    lastTickProcessedAt: number | null;
    laggingSubscribers: readonly Array<{ subscriberId: string; lagMs: number }>;
  };
  onInvokeGatewayRpc?: (method: string, params: Record<string, unknown>) => Promise<unknown>;
  privacyDropAggregate?: PrivacyDropAggregate;
}

const EMPTY_PRIVACY_DROP_AGGREGATE: PrivacyDropAggregate = {
  byWidget: {},
  byClass: {},
  total: 0,
};

export function OmniPanel({
  state,
  onClose,
  onOpenSource,
  readinessSnapshot = PENDING_M_READINESS,
  profileTickTelemetry = {
    subscriberCount: 0,
    tickHistory: [],
    lastTickProcessedAt: null,
    laggingSubscribers: [],
  },
  onInvokeGatewayRpc,
  privacyDropAggregate = EMPTY_PRIVACY_DROP_AGGREGATE,
}: OmniPanelProps) {
  const isVisible = state !== 'hidden';
  const { currentDomain } = useDomainStore();
  const [intentLogEntries, setIntentLogEntries] = useState([]);
  const [expandedIntentEntryId, setExpandedIntentEntryId] = useState<string | null>(null);
  const [gatewayReconnectHistory, setGatewayReconnectHistory] = useState([]);

  const {
    connectionState,
    connectionError,
    hello,
    client,
    gatewayUrl,
    gatewayToken,
    gatewayPassword,
    activePanel,
    chat,
    sessions,
    channels,
    skills,
    cron,
    config,
    presence,
    debug,
    logs,
    nodes,
    devices,
    dispatchGenealogy,
    connect,
    disconnect,
    setGatewayUrl,
    setGatewayToken,
    setGatewayPassword,
    uiSettings,
    setUiTheme,
    setChatFocusMode,
    setChatShowThinking,
    setChatSplitRatio,
    setNavCollapsed,
    setSkillsFilter,
    setConfigPanelMode,
    setConfigSearchQuery,
    setConfigActiveSection,
    setConfigActiveSubsection,
    sendMessage,
    abortChat,
    removeQueuedChatMessage,
    loadChatHistory,
    setSessionKey,
    setChatDraft,
    loadSessions,
    patchSession,
    deleteSession,
    loadChannels,
    startWhatsAppLogin,
    waitWhatsAppLogin,
    logoutWhatsApp,
    loadSkills,
    toggleSkill,
    setSkillEdit,
    saveSkillApiKey,
    installSkill,
    loadCronJobs,
    toggleCronJob,
    addCronJob,
    runCronJob,
    removeCronJob,
    loadCronRuns,
    loadConfig,
    loadConfigSchema,
    saveConfig,
    applyConfig,
    runUpdate,
    setConfigRaw,
    setConfigApplySessionKey,
    loadPresence,
    loadDebugStatus,
    loadDebugHealth,
    callDebugMethod,
    loadLogs,
    loadNodes,
    loadDevices,
    loadDispatchGenealogy,
    selectDispatchGenealogyNode,
    approveDevicePairing,
    rejectDevicePairing,
    rotateDeviceToken,
    revokeDeviceToken,
    setActivePanel,
  } = useEpiClawGatewayStore();

  const [debugMethod, setDebugMethod] = useState('status.summary');
  const [debugParams, setDebugParams] = useState('{}');
  const [logsLimit, setLogsLimit] = useState('300');
  const [cronName, setCronName] = useState('');
  const [cronDescription, setCronDescription] = useState('');
  const [cronAgentId, setCronAgentId] = useState('');
  const [cronScheduleKind, setCronScheduleKind] = useState<'every' | 'at' | 'cron'>('every');
  const [cronEveryAmount, setCronEveryAmount] = useState('60');
  const [cronEveryUnit, setCronEveryUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [cronAtValue, setCronAtValue] = useState('');
  const [cronExpr, setCronExpr] = useState('');
  const [cronTz, setCronTz] = useState('');
  const [cronSessionTarget, setCronSessionTarget] = useState<'main' | 'isolated'>('main');
  const [cronWakeMode, setCronWakeMode] = useState<'next-heartbeat' | 'now'>('next-heartbeat');
  const [cronPayloadKind, setCronPayloadKind] = useState<'systemEvent' | 'agentTurn'>('agentTurn');
  const [cronPayloadText, setCronPayloadText] = useState('');
  const [cronDeliver, setCronDeliver] = useState(false);
  const [cronChannel, setCronChannel] = useState('last');
  const [cronTo, setCronTo] = useState('');
  const [cronTimeoutSeconds, setCronTimeoutSeconds] = useState('');
  const [cronPostToMainPrefix, setCronPostToMainPrefix] = useState('');
  const [sessionsActiveMinutes, setSessionsActiveMinutes] = useState('0');
  const [sessionsLimit, setSessionsLimit] = useState('120');
  const [sessionsIncludeGlobal, setSessionsIncludeGlobal] = useState(true);
  const [sessionsIncludeUnknown, setSessionsIncludeUnknown] = useState(false);
  const [advancedMenuOpen, setAdvancedMenuOpen] = useState(false);
  const [workspaceSection, setWorkspaceSection] = useState<'cron' | 'models' | 'skills' | 'settings'>('cron');
  const [chatToolEventsTogglePending, setChatToolEventsTogglePending] = useState(false);
  const latestProfileGeneration =
    profileTickTelemetry.tickHistory.length > 0
      ? profileTickTelemetry.tickHistory[profileTickTelemetry.tickHistory.length - 1].generation
      : readinessSnapshot.profileGeneration;

  useEffect(() => {
    const target = globalThis as typeof globalThis & {
      addEventListener?: (type: string, listener: EventListener) => void;
      removeEventListener?: (type: string, listener: EventListener) => void;
    };
    if (typeof target.addEventListener !== 'function' || typeof target.removeEventListener !== 'function') {
      return undefined;
    }
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail?.intent) {
        return;
      }
      setIntentLogEntries((entries) => reduceIntentLog(entries, createIntentLogEntry(detail.intent, {
        timestamp: detail.timestamp,
        status: detail.status,
        error: detail.error ?? null,
      })));
    };
    target.addEventListener(CROSS_LAYOUT_INTENT_TELEMETRY_EVENT, handler);
    return () => target.removeEventListener(CROSS_LAYOUT_INTENT_TELEMETRY_EVENT, handler);
  }, []);

  useEffect(() => {
    setGatewayReconnectHistory((entries) => reduceReconnectHistory(entries, {
      timestamp: Date.now(),
      state: connectionState,
      reason: connectionError ?? readinessSnapshot.reason ?? null,
    }));
  }, [connectionState, connectionError, readinessSnapshot.reason]);

  useEffect(() => {
    if (state !== 'fullscreen') {
      setAdvancedMenuOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (!isGatewayPanel(activePanel)) {
      setActivePanel('chat');
    }
  }, [activePanel, setActivePanel]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const domainId = currentDomain.id;

    if (uiSettings.theme === 'system') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const resolvedSystemTheme = resolveThemeForDomain(prefersDark ? 'dark' : 'light', domainId);
      document.documentElement.setAttribute('data-theme', resolvedSystemTheme);
      return;
    }
    const resolvedTheme = resolveThemeForDomain(uiSettings.theme, domainId);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [currentDomain.id, uiSettings.theme]);

  useEffect(() => {
    if (!isVisible || connectionState !== 'connected') return;

    if (activePanel === 'sessions') {
      const activeMinutes = Number.parseInt(sessionsActiveMinutes, 10);
      const limit = Number.parseInt(sessionsLimit, 10);
      void loadSessions({
        activeMinutes: Number.isFinite(activeMinutes) ? activeMinutes : 0,
        limit: Number.isFinite(limit) ? limit : 0,
        includeGlobal: sessionsIncludeGlobal,
        includeUnknown: sessionsIncludeUnknown,
      });
    }
    if (activePanel === 'chat' && chat.chatMessages.length === 0 && !chat.chatLoading) {
      void loadChatHistory();
    }
    if (activePanel === 'channels') {
      void loadChannels(false);
      void loadConfig();
    }
    if (activePanel === 'workspace') {
      void loadConfig();
      void loadConfigSchema();
      void loadSkills();
      void loadCronJobs();
    }
    if (activePanel === 'gateway') {
      void loadConfig();
      void loadConfigSchema();
      void loadSkills();
      void loadCronJobs();
      void loadNodes();
      void loadDevices();
    }
    if (activePanel === 'models') {
      void loadConfig();
      void loadConfigSchema();
    }
    if (activePanel === 'instances') void loadPresence();
    if (activePanel === 'skills') void loadSkills();
    if (activePanel === 'cron') void loadCronJobs();
    if (activePanel === 'config') {
      void loadConfig();
      void loadConfigSchema();
    }
    if (activePanel === 'debug') {
      void loadDebugStatus();
      void loadDebugHealth();
    }
    if (activePanel === 'logs') void loadLogs(Number.parseInt(logsLimit, 10) || 300);
    if (activePanel === 'nodes') {
      void loadNodes();
      void loadDevices();
    }
    if (activePanel === 'dispatch-trace' || activePanel === 'tool-stream' || activePanel === 'evidence') {
      void loadDispatchGenealogy(chat.sessionKey);
    }
  }, [
    activePanel,
    connectionState,
    isVisible,
    loadChannels,
    loadConfig,
    loadConfigSchema,
    loadCronJobs,
    loadDebugHealth,
    loadDebugStatus,
    loadLogs,
    loadNodes,
    loadDevices,
    loadDispatchGenealogy,
    loadPresence,
    loadSessions,
    loadSkills,
    loadChatHistory,
    chat.chatLoading,
    chat.chatMessages.length,
    logsLimit,
    chat.sessionKey,
    sessionsActiveMinutes,
    sessionsLimit,
    sessionsIncludeGlobal,
    sessionsIncludeUnknown,
  ]);

  const activeChatSession = sessions.sessionsResult?.sessions.find((session) => session.key === chat.sessionKey) ?? null;
  const toolEventsVerboseEnabled = (activeChatSession?.verboseLevel ?? '').toLowerCase() === 'on';

  const handleToggleChatToolEventsVerbose = useCallback(async () => {
    if (connectionState !== 'connected') return;
    const nextVerbose = toolEventsVerboseEnabled ? 'off' : 'on';
    setChatToolEventsTogglePending(true);
    try {
      await patchSession(chat.sessionKey, { verboseLevel: nextVerbose });
      await loadSessions({ activeMinutes: 120, limit: 200, includeGlobal: true, includeUnknown: false });
    } finally {
      setChatToolEventsTogglePending(false);
    }
  }, [chat.sessionKey, connectionState, loadSessions, patchSession, toolEventsVerboseEnabled]);

  const targetWidth = state === 'minimal'
    ? 'min(760px, calc(100vw - 220px))'
    : 'calc(100vw - 40px)';

  const refreshOverview = async () => {
    const activeMinutes = Number.parseInt(sessionsActiveMinutes, 10);
    const limit = Number.parseInt(sessionsLimit, 10);
    await Promise.all([
      loadSessions({
        activeMinutes: Number.isFinite(activeMinutes) ? activeMinutes : 0,
        limit: Number.isFinite(limit) ? limit : 0,
        includeGlobal: sessionsIncludeGlobal,
        includeUnknown: sessionsIncludeUnknown,
      }),
      loadChannels(false),
      loadSkills(),
      loadCronJobs(),
      loadPresence(),
      loadDebugStatus(),
      loadLogs(200),
      loadNodes(),
      loadDevices(),
    ]);
  };

  const handleSelectSession = async (sessionKey: string) => {
    setSessionKey(sessionKey);
    await loadChatHistory();
    setActivePanel('chat');
  };

  const handleStartKhoraSession = async (topic: string, dayId: string | null) => {
    if (!client || connectionState !== 'connected') {
      throw new Error('Gateway is not connected.');
    }
    const response = await client.request('s4.khora.session_start', {
      topic: topic.trim() || undefined,
      day_id: dayId,
      parent: MAIN_EPII_SESSION_KEY,
      compatibility_method: 'khora_session_start',
    });
    const sessionKey = extractSessionKey(response);
    if (sessionKey) {
      setSessionKey(sessionKey);
    }
    await loadSessions({
      activeMinutes: 120,
      limit: 200,
      includeGlobal: true,
      includeUnknown: false,
    });
    if (sessionKey) {
      setActivePanel('chat');
    }
  };

  const handleSelectDispatchNode = useCallback((selection: DispatchGenealogySelection) => {
    selectDispatchGenealogyNode(selection.node.id);
  }, [selectDispatchGenealogyNode]);

  const handleOpenDispatchEvidence = useCallback((selection: DispatchGenealogySelection) => {
    selectDispatchGenealogyNode(selection.node.id);
    setActivePanel('evidence');
  }, [selectDispatchGenealogyNode, setActivePanel]);

  const handleOpenDispatchSource = useCallback((selection: DispatchGenealogySelection) => {
    selectDispatchGenealogyNode(selection.node.id);
    const source = selection.sourceCommand;
    if (!source) {
      return;
    }
    const detail = {
      commandId: 'backend-studio.openSource',
      coordinate: source.coordinate,
      sourceAnchor: source.sourceAnchor,
      selectedNodeId: selection.node.id,
    };
    if (onOpenSource) {
      void onOpenSource(source.coordinate, source.sourceAnchor);
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pratibimba.backend-studio.open-source', { detail }));
    }
  }, [onOpenSource, selectDispatchGenealogyNode]);

  const invokeGatewayRpc = useCallback(async (method: string, params: Record<string, unknown>) => {
    if (onInvokeGatewayRpc) {
      return onInvokeGatewayRpc(method, params);
    }
    if (!client || connectionState !== 'connected') {
      throw new Error('Gateway is not connected.');
    }
    return client.request(method, params);
  }, [client, connectionState, onInvokeGatewayRpc]);

  const handlePatchSessionLabel = async (session: GatewaySessionRow) => {
    const nextLabel = window.prompt('Session label', session.label ?? '');
    if (nextLabel === null) return;
    await patchSession(session.key, { label: nextLabel.trim() || null });
  };

  const syncMainS3Connection = useCallback(async () => {
    try {
      await window.sPrime?.s3?.websocket?.configure?.({
        url: gatewayUrl,
        token: gatewayToken ?? null,
        password: gatewayPassword || null,
        reconnect: true,
      });
    } catch (err) {
      console.warn('Failed to configure main S3\' connection', err);
    }
  }, [gatewayPassword, gatewayToken, gatewayUrl]);

  useEffect(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return;
    }
    if (!isVisible) {
      return;
    }
    if (!client && (connectionState === 'disconnected' || connectionState === 'error')) {
      void (async () => {
        await syncMainS3Connection();
        connect();
      })();
    }
  }, [client, connect, connectionState, isVisible, syncMainS3Connection]);

  const handleAddCron = async () => {
    try {
      const name = cronName.trim();
      if (!name) return;

      const schedule =
        cronScheduleKind === 'at'
          ? (() => {
              const atMs = Date.parse(cronAtValue);
              if (!Number.isFinite(atMs)) throw new Error('Invalid "run at" time');
              return { kind: 'at' as const, atMs };
            })()
          : cronScheduleKind === 'cron'
            ? (() => {
                const expr = cronExpr.trim();
                if (!expr) throw new Error('Cron expression required');
                return { kind: 'cron' as const, expr, tz: cronTz.trim() || undefined };
              })()
            : (() => {
                const amount = Number.parseInt(cronEveryAmount, 10);
                if (!Number.isFinite(amount) || amount <= 0) throw new Error('Interval must be > 0');
                const mult = cronEveryUnit === 'minutes' ? 60_000 : cronEveryUnit === 'hours' ? 3_600_000 : 86_400_000;
                return { kind: 'every' as const, everyMs: amount * mult };
              })();

      const payload =
        cronPayloadKind === 'systemEvent'
          ? (() => {
              const text = cronPayloadText.trim();
              if (!text) throw new Error('System event text required');
              return { kind: 'systemEvent' as const, text };
            })()
          : (() => {
              const message = cronPayloadText.trim();
              if (!message) throw new Error('Agent message required');
              const timeoutSeconds = Number.parseInt(cronTimeoutSeconds, 10);
              return {
                kind: 'agentTurn' as const,
                message,
                deliver: cronDeliver || undefined,
                channel: cronChannel.trim() || undefined,
                to: cronTo.trim() || undefined,
                timeoutSeconds: Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds : undefined,
              };
            })();

      await addCronJob({
        name,
        description: cronDescription.trim() || undefined,
        agentId: cronAgentId.trim() || undefined,
        enabled: true,
        schedule,
        sessionTarget: cronSessionTarget,
        wakeMode: cronWakeMode,
        payload,
        isolation:
          cronSessionTarget === 'isolated' && cronPostToMainPrefix.trim()
            ? { postToMainPrefix: cronPostToMainPrefix.trim() }
            : undefined,
      });
    } catch (err) {
      window.alert(String(err));
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return (
          <OverviewPanel
            connectionState={connectionState}
            connectionError={connectionError}
            hello={hello}
            gatewayUrl={gatewayUrl}
            gatewayToken={gatewayToken}
            gatewayPassword={gatewayPassword}
            sessionKey={chat.sessionKey}
            sessionsCount={sessions.sessionsResult?.count ?? 0}
            channelsCount={channels.channelsSnapshot?.channelOrder?.length ?? 0}
            channelsLastSuccess={channels.channelsLastSuccess}
            logsCursor={logs.logsCursor}
            onSetGatewayUrl={setGatewayUrl}
            onSetGatewayToken={setGatewayToken}
            onSetGatewayPassword={setGatewayPassword}
            onSetSessionKey={setSessionKey}
            onConnect={() => {
              void (async () => {
                await syncMainS3Connection();
                connect();
              })();
            }}
            onRefresh={() => {
              void refreshOverview();
            }}
          />
        );
      case 'chat':
        return (
          <PiChatPanel
            panelState={state}
            connectionState={connectionState}
            chat={chat}
            focusMode={uiSettings.chatFocusMode}
            splitRatio={uiSettings.chatSplitRatio}
            showThinking={uiSettings.chatShowThinking}
            availableChannels={(channels.channelsSnapshot?.channelOrder ?? []).map((id) => ({
              id,
              label: channels.channelsSnapshot?.channelLabels?.[id] ?? id,
            }))}
            onSetSessionKey={setSessionKey}
            chatDraft={chat.chatMessage}
            onSetChatDraft={setChatDraft}
            onLoadHistory={() => {
              void loadChatHistory();
            }}
            onAbort={() => {
              void abortChat();
            }}
            onNewSession={() => {
              void sendMessage('/new');
            }}
            onQueueRemove={(id) => {
              removeQueuedChatMessage(id);
            }}
            onToggleFocusMode={() => {
              setChatFocusMode(!uiSettings.chatFocusMode);
            }}
            onSplitRatioChange={(ratio) => {
              setChatSplitRatio(ratio);
            }}
            toolEventsVerboseEnabled={toolEventsVerboseEnabled}
            toolEventsVerbosePending={chatToolEventsTogglePending}
            onToggleToolEventsVerbose={() => {
              void handleToggleChatToolEventsVerbose();
            }}
            onInvokeGatewayRpc={async (method, params) => {
              if (!client || connectionState !== 'connected') {
                throw new Error('Gateway is not connected.');
              }
              return client.request(method, params);
            }}
            onActivateTab={(tabId) => {
              if (tabId === 'gateway') {
                setActivePanel('workspace');
              }
              if (tabId === 'dispatch-trace') {
                setActivePanel('dispatch-trace');
              }
              if (tabId === 'tool-stream') {
                setActivePanel('tool-stream');
              }
              if (tabId === 'evidence') {
                setActivePanel('evidence');
              }
            }}
            onSend={async (message, options) => {
              await sendMessage(message, options);
            }}
          />
        );
      case 'dispatch-trace':
        return (
          <DispatchTracePanel
            snapshot={dispatchGenealogy.snapshot}
            selectedNodeId={dispatchGenealogy.selectedNodeId}
            loading={dispatchGenealogy.loading}
            error={dispatchGenealogy.error}
            onRefresh={() => {
              void loadDispatchGenealogy(chat.sessionKey);
            }}
            onSelectNode={(selection) => {
              handleSelectDispatchNode(selection);
              setActivePanel('tool-stream');
            }}
            onOpenEvidence={handleOpenDispatchEvidence}
            onOpenSource={handleOpenDispatchSource}
          />
        );
      case 'tool-stream':
        return (
          <ToolStreamPanel
            snapshot={dispatchGenealogy.snapshot}
            selectedNodeId={dispatchGenealogy.selectedNodeId}
            loading={dispatchGenealogy.loading}
            error={dispatchGenealogy.error}
            onRefresh={() => {
              void loadDispatchGenealogy(chat.sessionKey);
            }}
            onSelectNode={handleSelectDispatchNode}
            onActivateDispatchTrace={(selection) => {
              handleSelectDispatchNode(selection);
              setActivePanel('dispatch-trace');
            }}
            onOpenEvidence={handleOpenDispatchEvidence}
            onOpenSource={handleOpenDispatchSource}
          />
        );
      case 'evidence':
        return (
          <EvidencePanel
            snapshot={dispatchGenealogy.snapshot}
            selectedNodeId={dispatchGenealogy.selectedNodeId}
            onActivateDispatchTrace={(selection) => {
              handleSelectDispatchNode(selection);
              setActivePanel('dispatch-trace');
            }}
            onOpenSource={handleOpenDispatchSource}
          />
        );
      case 'models':
        return (
          <ModelsPanel
            connectionState={connectionState}
            config={config}
            onLoad={() => {
              void loadConfig();
            }}
            onSave={() => {
              return saveConfig();
            }}
            onApply={() => {
              return applyConfig();
            }}
            onSetRaw={setConfigRaw}
          />
        );
      case 'workspace':
      case 'gateway':
        return (
          <GatewayPanel
            connectionState={connectionState}
            gatewayUrl={gatewayUrl}
            readinessSnapshot={readinessSnapshot}
            initialSubView={activePanel === 'workspace' ? workspaceSection : 'capabilities'}
            onReconnect={() => {
              void (async () => {
                await syncMainS3Connection();
                connect();
              })();
            }}
            onActivateDiagnostics={() => {
              setActivePanel('diagnostics');
            }}
            onInvokeGatewayRpc={invokeGatewayRpc}
            onOpenSource={onOpenSource}
            nodesProps={{
              nodes,
              devices,
              onRefreshNodes: () => {
                void loadNodes();
              },
              onRefreshDevices: () => {
                void loadDevices();
              },
              onApprovePairing: (requestId) => {
                void approveDevicePairing(requestId);
              },
              onRejectPairing: (requestId) => {
                void rejectDevicePairing(requestId);
              },
              onRotateToken: (params) => {
                void rotateDeviceToken(params);
              },
              onRevokeToken: (params) => {
                void revokeDeviceToken(params);
              },
            }}
            modelsProps={{
              connectionState,
              config,
              onLoad: () => {
                void loadConfig();
              },
              onSave: () => {
                return saveConfig();
              },
              onApply: () => {
                return applyConfig();
              },
              onSetRaw: setConfigRaw,
            }}
            skillsProps={{
              skills,
              filter: uiSettings.skillsFilter,
              onRefresh: () => {
                void loadSkills();
              },
              onFilterChange: setSkillsFilter,
              onToggle: (skillKey, enabled) => {
                void toggleSkill(skillKey, enabled);
              },
              onSetEdit: setSkillEdit,
              onSaveKey: (skillKey) => {
                void saveSkillApiKey(skillKey);
              },
              onInstall: (skillKey, name, installId) => {
                void installSkill(skillKey, name, installId);
              },
            }}
            cronProps={{
              cron,
              cronName,
              cronDescription,
              cronAgentId,
              cronScheduleKind,
              cronEveryAmount,
              cronEveryUnit,
              cronAtValue,
              cronExpr,
              cronTz,
              cronSessionTarget,
              cronWakeMode,
              cronPayloadKind,
              cronPayloadText,
              cronDeliver,
              cronChannel,
              cronTo,
              cronTimeoutSeconds,
              cronPostToMainPrefix,
              onSetCronName: setCronName,
              onSetCronDescription: setCronDescription,
              onSetCronAgentId: setCronAgentId,
              onSetCronScheduleKind: setCronScheduleKind,
              onSetCronEveryAmount: setCronEveryAmount,
              onSetCronEveryUnit: setCronEveryUnit,
              onSetCronAtValue: setCronAtValue,
              onSetCronExpr: setCronExpr,
              onSetCronTz: setCronTz,
              onSetCronSessionTarget: setCronSessionTarget,
              onSetCronWakeMode: setCronWakeMode,
              onSetCronPayloadKind: setCronPayloadKind,
              onSetCronPayloadText: setCronPayloadText,
              onSetCronDeliver: setCronDeliver,
              onSetCronChannel: setCronChannel,
              onSetCronTo: setCronTo,
              onSetCronTimeoutSeconds: setCronTimeoutSeconds,
              onSetCronPostToMainPrefix: setCronPostToMainPrefix,
              onRefresh: () => {
                void loadCronJobs();
              },
              onAdd: () => {
                void handleAddCron();
              },
              onToggle: (job: CronJob) => {
                void toggleCronJob(job, !job.enabled);
              },
              onRun: (job: CronJob) => {
                void runCronJob(job);
              },
              onRuns: (job: CronJob) => {
                void loadCronRuns(job.id);
              },
              onRemove: (job: CronJob) => {
                void removeCronJob(job);
              },
            }}
            configProps={{
              connectionState,
              config,
              mode: uiSettings.configPanelMode,
              searchQuery: uiSettings.configSearchQuery,
              activeSection: uiSettings.configActiveSection,
              activeSubsection: uiSettings.configActiveSubsection,
              onLoad: () => {
                void loadConfig();
              },
              onSchema: () => {
                void loadConfigSchema();
              },
              onSave: () => {
                void saveConfig();
              },
              onApply: () => {
                void applyConfig();
              },
              onUpdate: () => {
                void runUpdate();
              },
              onSetApplySessionKey: setConfigApplySessionKey,
              onSetRaw: setConfigRaw,
              onSetMode: setConfigPanelMode,
              onSetSearchQuery: setConfigSearchQuery,
              onSetActiveSection: setConfigActiveSection,
              onSetActiveSubsection: setConfigActiveSubsection,
            }}
            settingsProps={{
              gatewayUrl,
              gatewayToken,
              gatewayPassword,
              connectionState,
              onSetGatewayUrl: setGatewayUrl,
              onSetGatewayToken: setGatewayToken,
              onSetGatewayPassword: setGatewayPassword,
              uiSettings,
              onSetUiTheme: setUiTheme,
              onSetChatFocusMode: setChatFocusMode,
              onSetChatShowThinking: setChatShowThinking,
              onSetChatSplitRatio: setChatSplitRatio,
              onSetNavCollapsed: setNavCollapsed,
              onConnect: () => {
                void (async () => {
                  await syncMainS3Connection();
                  connect();
                })();
              },
              onDisconnect: disconnect,
            }}
          />
        );
      case 'sessions':
        return (
          <SessionManagerPanel
            connectionState={connectionState}
            activeSessionKey={chat.sessionKey}
            sessions={sessions}
            sessionsActiveMinutes={sessionsActiveMinutes}
            sessionsLimit={sessionsLimit}
            sessionsIncludeGlobal={sessionsIncludeGlobal}
            sessionsIncludeUnknown={sessionsIncludeUnknown}
            onSetSessionsActiveMinutes={setSessionsActiveMinutes}
            onSetSessionsLimit={setSessionsLimit}
            onSetSessionsIncludeGlobal={setSessionsIncludeGlobal}
            onSetSessionsIncludeUnknown={setSessionsIncludeUnknown}
            onRefresh={() => {
              void loadSessions({
                activeMinutes: Number.parseInt(sessionsActiveMinutes, 10) || 0,
                limit: Number.parseInt(sessionsLimit, 10) || 0,
                includeGlobal: sessionsIncludeGlobal,
                includeUnknown: sessionsIncludeUnknown,
              });
            }}
            onStartSession={(topic, dayId) => {
              void handleStartKhoraSession(topic, dayId);
            }}
            onSelectSession={(key) => {
              void handleSelectSession(key);
            }}
            onPatchSessionLabel={(session) => {
              void handlePatchSessionLabel(session);
            }}
            onPatchSession={(key, patch) => {
              void patchSession(key, patch);
            }}
            onDeleteSession={(key) => {
              void deleteSession(key);
            }}
          />
        );
      case 'channels':
        return (
          <ChannelsPanel
            channels={channels}
            config={config}
            onRefresh={(probe) => {
              void loadChannels(probe);
            }}
            onStartWhatsAppLogin={() => {
              void startWhatsAppLogin(false);
            }}
            onWaitWhatsAppLogin={() => {
              void waitWhatsAppLogin();
            }}
            onLogoutWhatsApp={() => {
              void logoutWhatsApp();
            }}
            onLoadConfig={() => {
              void loadConfig();
            }}
            onSaveConfig={() => {
              void (async () => {
                await saveConfig();
                await loadConfig();
                await loadChannels(false);
              })();
            }}
            onApplyConfig={() => {
              void (async () => {
                await applyConfig();
                await loadConfig();
                await loadChannels(false);
              })();
            }}
            onSetRawConfig={setConfigRaw}
          />
        );
      case 'instances':
        return (
          <InstancesPanel
            presence={presence}
            onRefresh={() => {
              void loadPresence();
            }}
          />
        );
      case 'cron':
        return (
          <CronPanel
            cron={cron}
            cronName={cronName}
            cronDescription={cronDescription}
            cronAgentId={cronAgentId}
            cronScheduleKind={cronScheduleKind}
            cronEveryAmount={cronEveryAmount}
            cronEveryUnit={cronEveryUnit}
            cronAtValue={cronAtValue}
            cronExpr={cronExpr}
            cronTz={cronTz}
            cronSessionTarget={cronSessionTarget}
            cronWakeMode={cronWakeMode}
            cronPayloadKind={cronPayloadKind}
            cronPayloadText={cronPayloadText}
            cronDeliver={cronDeliver}
            cronChannel={cronChannel}
            cronTo={cronTo}
            cronTimeoutSeconds={cronTimeoutSeconds}
            cronPostToMainPrefix={cronPostToMainPrefix}
            onSetCronName={setCronName}
            onSetCronDescription={setCronDescription}
            onSetCronAgentId={setCronAgentId}
            onSetCronScheduleKind={setCronScheduleKind}
            onSetCronEveryAmount={setCronEveryAmount}
            onSetCronEveryUnit={setCronEveryUnit}
            onSetCronAtValue={setCronAtValue}
            onSetCronExpr={setCronExpr}
            onSetCronTz={setCronTz}
            onSetCronSessionTarget={setCronSessionTarget}
            onSetCronWakeMode={setCronWakeMode}
            onSetCronPayloadKind={setCronPayloadKind}
            onSetCronPayloadText={setCronPayloadText}
            onSetCronDeliver={setCronDeliver}
            onSetCronChannel={setCronChannel}
            onSetCronTo={setCronTo}
            onSetCronTimeoutSeconds={setCronTimeoutSeconds}
            onSetCronPostToMainPrefix={setCronPostToMainPrefix}
            onRefresh={() => {
              void loadCronJobs();
            }}
            onAdd={() => {
              void handleAddCron();
            }}
            onToggle={(job: CronJob) => {
              void toggleCronJob(job, !job.enabled);
            }}
            onRun={(job: CronJob) => {
              void runCronJob(job);
            }}
            onRuns={(job: CronJob) => {
              void loadCronRuns(job.id);
            }}
            onRemove={(job: CronJob) => {
              void removeCronJob(job);
            }}
          />
        );
      case 'skills':
        return (
          <SkillsPanel
            skills={skills}
            filter={uiSettings.skillsFilter}
            onRefresh={() => {
              void loadSkills();
            }}
            onFilterChange={setSkillsFilter}
            onToggle={(skillKey, enabled) => {
              void toggleSkill(skillKey, enabled);
            }}
            onSetEdit={setSkillEdit}
            onSaveKey={(skillKey) => {
              void saveSkillApiKey(skillKey);
            }}
            onInstall={(skillKey, name, installId) => {
              void installSkill(skillKey, name, installId);
            }}
          />
        );
      case 'nodes':
        return (
          <NodesPanel
            nodes={nodes}
            devices={devices}
            onRefreshNodes={() => {
              void loadNodes();
            }}
            onRefreshDevices={() => {
              void loadDevices();
            }}
            onApprovePairing={(requestId) => {
              void approveDevicePairing(requestId);
            }}
            onRejectPairing={(requestId) => {
              void rejectDevicePairing(requestId);
            }}
            onRotateToken={(params) => {
              void rotateDeviceToken(params);
            }}
            onRevokeToken={(params) => {
              void revokeDeviceToken(params);
            }}
          />
        );
      case 'config':
        return (
          <ConfigPanel
            connectionState={connectionState}
            config={config}
            mode={uiSettings.configPanelMode}
            searchQuery={uiSettings.configSearchQuery}
            activeSection={uiSettings.configActiveSection}
            activeSubsection={uiSettings.configActiveSubsection}
            onLoad={() => {
              void loadConfig();
            }}
            onSchema={() => {
              void loadConfigSchema();
            }}
            onSave={() => {
              void saveConfig();
            }}
            onApply={() => {
              void applyConfig();
            }}
            onUpdate={() => {
              void runUpdate();
            }}
            onSetApplySessionKey={setConfigApplySessionKey}
            onSetRaw={setConfigRaw}
            onSetMode={setConfigPanelMode}
            onSetSearchQuery={setConfigSearchQuery}
            onSetActiveSection={setConfigActiveSection}
            onSetActiveSubsection={setConfigActiveSubsection}
          />
        );
      case 'diagnostics':
      case 'debug':
        return (
          <DiagnosticsPanel
            readinessLedger={[readinessSnapshot]}
            profileGeneration={latestProfileGeneration}
            profileTickHistory={profileTickTelemetry.tickHistory}
            subscriberCount={profileTickTelemetry.subscriberCount}
            lastTickProcessedAt={profileTickTelemetry.lastTickProcessedAt}
            laggingSubscribers={profileTickTelemetry.laggingSubscribers}
            pendingProfileFields={pendingProfileFieldsFromReadiness(readinessSnapshot)}
            s2Graph={s2GraphFromReadiness(readinessSnapshot)}
            gatewayWebSocket={{
              state: connectionState,
              url: gatewayUrl,
              lastPingAt: readinessSnapshot.fetchedAt > 0 ? readinessSnapshot.fetchedAt : null,
              latencyMs: null,
              reconnectHistory: gatewayReconnectHistory,
            }}
            activeLayout={{
              layoutId: 'daily-0-1',
              dailyToggle: 'personal',
              activeOmniPanelTab: activePanel === 'debug' ? 'diagnostics' : activePanel,
              activeActivityBarMode: activePanel === 'workspace' ? 'gateway' : '0/1',
            }}
            intentLogEntries={intentLogEntries}
            expandedIntentEntryId={expandedIntentEntryId}
            onToggleIntentEntry={(entryId) => {
              setExpandedIntentEntryId(expandedIntentEntryId === entryId ? null : entryId);
            }}
            privacyDropAggregate={privacyDropAggregate}
          />
        );
      case 'logs':
        return (
          <LogsPanel
            logs={logs}
            logsLimit={logsLimit}
            onSetLogsLimit={setLogsLimit}
            onRefresh={() => {
              void loadLogs(Number.parseInt(logsLimit, 10) || 300);
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            gatewayUrl={gatewayUrl}
            gatewayToken={gatewayToken}
            gatewayPassword={gatewayPassword}
            connectionState={connectionState}
            uiSettings={uiSettings}
            onSetGatewayUrl={setGatewayUrl}
            onSetGatewayToken={setGatewayToken}
            onSetGatewayPassword={setGatewayPassword}
            onSetUiTheme={setUiTheme}
            onSetChatFocusMode={setChatFocusMode}
            onSetChatShowThinking={setChatShowThinking}
            onSetChatSplitRatio={setChatSplitRatio}
            onSetNavCollapsed={setNavCollapsed}
            onConnect={() => {
              void (async () => {
                await syncMainS3Connection();
                connect();
              })();
            }}
            onDisconnect={disconnect}
          />
        );
      default:
        return <div className="p-6 text-xs">Unknown panel</div>;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            style={{ left: '40px', top: '40px' }}
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: -28, opacity: 0, width: targetWidth }}
            animate={{ x: 0, opacity: 1, width: targetWidth }}
            exit={{ x: -28, opacity: 0, width: targetWidth }}
            transition={{ x: { type: 'tween', duration: 0.2, ease: 'easeOut' }, opacity: { duration: 0.16 }, width: { type: 'spring', stiffness: 260, damping: 30, mass: 0.7 } }}
            className="fixed top-[40px] bottom-0 overflow-hidden z-50 opaque-panel flex"
            style={{
              left: '40px',
              willChange: 'transform, width',
            }}
          >
            <div
              data-testid="omnipanel-gateway-shell"
              className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[var(--bg-app)]"
              style={{ fontFamily: OMNI_UI_FONT_STACK }}
            >
              <OmniPanelHeader
                activePanel={activePanel}
                connectionState={connectionState}
                advancedMenuOpen={advancedMenuOpen}
                advancedPanels={ADVANCED_PANELS}
                onToggleAdvancedMenu={() => setAdvancedMenuOpen((prev) => !prev)}
                onSelectAdvancedPanel={(panel) => {
                  setActivePanel(panel);
                  setAdvancedMenuOpen(false);
                }}
              />
              <PrimaryTabs activePanel={activePanel} onSelect={setActivePanel} />
              <div className={`flex-1 min-h-0 ${activePanel === 'chat' ? 'overflow-hidden flex flex-col' : 'overflow-auto custom-scrollbar'}`}>
                {renderPanel()}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function reduceReconnectHistory(entries, next) {
  const previous = entries[entries.length - 1];
  if (previous && previous.state === next.state && previous.reason === next.reason) {
    return entries;
  }
  return [...entries, next].slice(-8);
}

function pendingProfileFieldsFromReadiness(snapshot: MExtensionReadinessSnapshot) {
  if (snapshot.state !== 'profile_missing_field' && snapshot.blockerIds.length === 0) {
    return [];
  }
  return snapshot.blockerIds
    .filter((blocker) => snapshot.state === 'profile_missing_field' || blocker.includes('profile') || blocker.includes('matheme'))
    .map((blocker) => ({
      fieldName: blocker.split('.').pop() || blocker,
      gatingTranche: '10.x',
      state: snapshot.state === 'profile_missing_field' ? 'pending' : snapshot.state,
    }));
}

function s2GraphFromReadiness(snapshot: MExtensionReadinessSnapshot) {
  const blocked = snapshot.state === 's2_graph_blocked';
  const blockers = snapshot.blockerIds.join(' ').toLowerCase();
  return {
    bimbaReachable: snapshot.bridgeReachable && !blocked && !blockers.includes('bimba'),
    gnosisReachable: snapshot.bridgeReachable && !blocked && !blockers.includes('gnosis'),
    embeddingDimensions: 3072,
    checkedAt: snapshot.fetchedAt > 0 ? snapshot.fetchedAt : null,
    reason: snapshot.reason,
  };
}
