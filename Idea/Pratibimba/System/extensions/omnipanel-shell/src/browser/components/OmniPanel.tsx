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
import { ChatPanel } from './omni/chat/ChatPanel';
import { OverviewPanel } from './omni/panels/OverviewPanel';
import { SessionsPanel } from './omni/panels/SessionsPanel';
import { ChannelsPanel } from './omni/panels/ChannelsPanel';
import { InstancesPanel } from './omni/panels/InstancesPanel';
import { CronPanel } from './omni/panels/CronPanel';
import { SkillsPanel } from './omni/panels/SkillsPanel';
import { NodesPanel } from './omni/panels/NodesPanel';
import { ConfigPanel } from './omni/panels/ConfigPanel';
import { DebugPanel } from './omni/panels/DebugPanel';
import { LogsPanel } from './omni/panels/LogsPanel';
import { SettingsPanel } from './omni/panels/SettingsPanel';
import { ModelsPanel } from './omni/panels/ModelsPanel';
import { useDomainStore } from '../stores/domainStore';
import { resolveThemeForDomain } from '../theme/resolveTheme';

const OMNI_UI_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

interface OmniPanelProps {
  state: 'hidden' | 'minimal' | 'fullscreen';
  onClose: () => void;
}

export function OmniPanel({ state, onClose }: OmniPanelProps) {
  const isVisible = state !== 'hidden';
  const { currentDomain } = useDomainStore();

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
    loadPresence,
    loadSessions,
    loadSkills,
    loadChatHistory,
    chat.chatLoading,
    chat.chatMessages.length,
    logsLimit,
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
          <ChatPanel
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
            onSend={async (message, options) => {
              await sendMessage(message, options);
            }}
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
        return (
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              {([
                ['cron', 'Cron'],
                ['models', 'Models'],
                ['skills', 'Skills'],
                ['settings', 'Settings'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded border ${
                    workspaceSection === id
                      ? 'border-[var(--color-m5)]/50 bg-[var(--color-m5)]/15'
                      : 'border-[var(--border-subtle)]'
                  }`}
                  onClick={() => setWorkspaceSection(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {workspaceSection === 'cron' ? (
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
            ) : null}

            {workspaceSection === 'models' ? (
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
            ) : null}

            {workspaceSection === 'skills' ? (
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
            ) : null}

            {workspaceSection === 'settings' ? (
              <SettingsPanel
                gatewayUrl={gatewayUrl}
                gatewayToken={gatewayToken}
                gatewayPassword={gatewayPassword}
                connectionState={connectionState}
                onSetGatewayUrl={setGatewayUrl}
                onSetGatewayToken={setGatewayToken}
                onSetGatewayPassword={setGatewayPassword}
                uiSettings={uiSettings}
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
            ) : null}
          </div>
        );
      case 'sessions':
        return (
          <SessionsPanel
            connectionState={connectionState}
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
      case 'debug':
        return (
          <DebugPanel
            debug={debug}
            debugMethod={debugMethod}
            debugParams={debugParams}
            onSetDebugMethod={setDebugMethod}
            onSetDebugParams={setDebugParams}
            onLoadStatus={() => {
              void loadDebugStatus();
            }}
            onLoadHealth={() => {
              void loadDebugHealth();
            }}
            onCallMethod={() => {
              void callDebugMethod(debugMethod, debugParams);
            }}
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
