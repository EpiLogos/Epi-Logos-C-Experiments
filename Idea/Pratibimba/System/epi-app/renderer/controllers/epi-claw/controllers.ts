/**
 * Epi-Claw Controllers Adapter
 *
 * Bridges Epi-Claw business logic with Electron Omnipanel
 * Ported and adapted from: /Idea/epi-claw/ui/src/ui/controllers/
 *
 * Architecture:
 * - Each controller manages a specific domain (chat, sessions, channels, etc.)
 * - Controllers are stateless - they accept state objects and modify them
 * - Designed for use with Zustand stores or React state
 */

import type { GatewayClient } from "./gateway-client";
import type {
  ChannelsStatusSnapshot,
  ConfigSnapshot,
  ConfigSchemaResponse,
  ConfigUiHints,
  CronJob,
  CronRunLogEntry,
  CronStatus,
  SessionsListResult,
  SkillStatusReport,
  PresenceEntry,
  StatusSummary,
  HealthSnapshot,
  LogEntry,
} from "./types";

// ============================================================================
// CHAT CONTROLLER
// ============================================================================

export type ChatState = {
  client: GatewayClient | null;
  connected: boolean;
  sessionKey: string;
  chatLoading: boolean;
  chatMessages: unknown[];
  chatThinkingLevel: string | null;
  chatSending: boolean;
  chatMessage: string;
  chatAttachments: ChatAttachment[];
  chatQueue: ChatQueueItem[];
  chatRunId: string | null;
  chatStream: string | null;
  chatStreamStartedAt: number | null;
  chatLiveRuns: Record<string, ChatLiveRun>;
  compactionStatus?: {
    active: boolean;
    startedAt: number | null;
    completedAt: number | null;
  } | null;
  lastError: string | null;
};

export type ChatAttachment = {
  id: string;
  dataUrl: string;
  mimeType: string;
};

export type ChatQueueItem = {
  id: string;
  text: string;
  createdAt: number;
  attachments?: ChatAttachment[];
  deliver?: boolean;
  refreshSessions?: boolean;
};

export type ChatEventPayload = {
  runId: string;
  sessionKey: string;
  state: "delta" | "final" | "aborted" | "error";
  message?: unknown;
  errorMessage?: string;
};

export type GatewayAgentStreamPayload = {
  runId: string;
  seq: number;
  stream: string;
  ts: number;
  sessionKey?: string;
  data?: Record<string, unknown>;
};

export type ChatLiveToolEvent = {
  seq: number;
  ts: number;
  phase: string;
  name?: string;
  toolCallId?: string;
  meta?: string;
  isError?: boolean;
  summary?: string;
};

export type ChatLiveRun = {
  runId: string;
  sessionKey: string;
  latestSeq: number;
  startedAt: number;
  updatedAt: number;
  lifecyclePhase: "idle" | "running" | "ended" | "error";
  assistantText: string;
  toolEvents: ChatLiveToolEvent[];
};

export async function loadChatHistory(state: ChatState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.chatLoading = true;
  state.lastError = null;
  try {
    const res = await state.client.request("chat.history", {
      sessionKey: state.sessionKey,
      limit: 200,
    });
    state.chatMessages = Array.isArray(res.messages) ? res.messages : [];
    state.chatThinkingLevel = res.thinkingLevel ?? null;
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.chatLoading = false;
  }
}

export async function sendChatMessage(
  state: ChatState,
  message: string,
  options?: {
    attachments?: ChatAttachment[];
    deliver?: boolean;
  },
): Promise<string | null> {
  if (!state.client || !state.connected) {
    return null;
  }
  const msg = message.trim();
  const attachments = options?.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  if (!msg && !hasAttachments) {
    return null;
  }

  const now = Date.now();
  const runId = generateUUID();

  const contentBlocks: Array<{ type: string; text?: string; source?: unknown }> = [];
  if (msg) {
    contentBlocks.push({ type: "text", text: msg });
  }
  if (hasAttachments) {
    for (const att of attachments) {
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: att.mimeType, data: att.dataUrl },
      });
    }
  }

  state.chatMessages = [
    ...state.chatMessages,
    {
      role: "user",
      content: contentBlocks,
      timestamp: now,
    },
  ];

  state.chatSending = true;
  state.lastError = null;
  state.chatRunId = runId;
  state.chatStream = "";
  state.chatStreamStartedAt = now;
  state.chatLiveRuns[runId] = {
    runId,
    sessionKey: state.sessionKey,
    latestSeq: 0,
    startedAt: now,
    updatedAt: now,
    lifecyclePhase: "idle",
    assistantText: "",
    toolEvents: [],
  };

  const apiAttachments = hasAttachments
    ? attachments
        .map((att) => dataUrlToBase64(att.dataUrl))
        .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null)
        .map((parsed) => ({
          type: "image",
          mimeType: parsed.mimeType,
          content: parsed.content,
        }))
    : undefined;

  try {
    await state.client.request("chat.send", {
      sessionKey: state.sessionKey,
      message: msg,
      deliver: options?.deliver === true,
      idempotencyKey: runId,
      attachments: apiAttachments,
    });
    return runId;
  } catch (err) {
    const error = String(err);
    state.chatRunId = null;
    state.chatStream = null;
    state.chatStreamStartedAt = null;
    state.lastError = error;
    state.chatMessages = [
      ...state.chatMessages,
      {
        role: "assistant",
        content: [{ type: "text", text: "Error: " + error }],
        timestamp: Date.now(),
      },
    ];
    return null;
  } finally {
    state.chatSending = false;
  }
}

function dataUrlToBase64(dataUrl: string): { content: string; mimeType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return null;
  }
  return { mimeType: match[1], content: match[2] };
}

export async function abortChatRun(state: ChatState): Promise<boolean> {
  if (!state.client || !state.connected) {
    return false;
  }
  const runId = state.chatRunId;
  try {
    await state.client.request(
      "chat.abort",
      runId ? { sessionKey: state.sessionKey, runId } : { sessionKey: state.sessionKey },
    );
    return true;
  } catch (err) {
    state.lastError = String(err);
    return false;
  }
}

export function handleChatEvent(state: ChatState, payload?: ChatEventPayload) {
  if (!payload) {
    return null;
  }
  if (payload.sessionKey !== state.sessionKey) {
    return null;
  }

  // Final from another run: refresh history to show new message
  if (payload.runId && state.chatRunId && payload.runId !== state.chatRunId) {
    if (payload.state === "final") {
      return "final";
    }
    return null;
  }

  if (payload.state === "delta") {
    const next = extractText(payload.message);
    if (typeof next === "string") {
      const current = state.chatStream ?? "";
      if (!current || next.length >= current.length) {
        state.chatStream = next;
      }
    }
  } else if (payload.state === "final") {
    if (payload.runId) {
      delete state.chatLiveRuns[payload.runId];
    }
    state.chatStream = null;
    state.chatRunId = null;
    state.chatStreamStartedAt = null;
  } else if (payload.state === "aborted") {
    if (payload.runId) {
      delete state.chatLiveRuns[payload.runId];
    }
    state.chatStream = null;
    state.chatRunId = null;
    state.chatStreamStartedAt = null;
  } else if (payload.state === "error") {
    if (payload.runId) {
      const live = state.chatLiveRuns[payload.runId];
      if (live) {
        live.lifecyclePhase = "error";
        live.updatedAt = Date.now();
      }
    }
    state.chatStream = null;
    state.chatRunId = null;
    state.chatStreamStartedAt = null;
    state.lastError = payload.errorMessage ?? "chat error";
  }
  return payload.state;
}

function summarizeToolData(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const phase = typeof data.phase === "string" ? data.phase : undefined;
  if (phase === "update") {
    return "update";
  }
  if (phase === "result") {
    return data.isError === true ? "error" : "done";
  }
  return undefined;
}

export function handleAgentEventStream(state: ChatState, payload?: GatewayAgentStreamPayload) {
  if (!payload || !payload.runId) {
    return false;
  }
  const sessionKey = typeof payload.sessionKey === "string" ? payload.sessionKey : "";
  if (!sessionKey || sessionKey !== state.sessionKey) {
    return false;
  }
  const now = typeof payload.ts === "number" && Number.isFinite(payload.ts) ? payload.ts : Date.now();
  const run =
    state.chatLiveRuns[payload.runId] ??
    (state.chatLiveRuns[payload.runId] = {
      runId: payload.runId,
      sessionKey,
      latestSeq: 0,
      startedAt: now,
      updatedAt: now,
      lifecyclePhase: "idle",
      assistantText: "",
      toolEvents: [],
    });

  if (payload.seq <= run.latestSeq) {
    return false;
  }
  run.latestSeq = payload.seq;
  run.updatedAt = now;

  if (payload.stream === "lifecycle") {
    const phase = typeof payload.data?.phase === "string" ? payload.data.phase : "";
    if (phase === "start") run.lifecyclePhase = "running";
    if (phase === "end") run.lifecyclePhase = "ended";
    if (phase === "error") run.lifecyclePhase = "error";
    return true;
  }

  if (payload.stream === "assistant") {
    const nextText = typeof payload.data?.text === "string" ? payload.data.text : "";
    if (nextText) {
      run.assistantText = nextText;
    }
    return true;
  }

  if (payload.stream === "tool") {
    const phase = typeof payload.data?.phase === "string" ? payload.data.phase : "update";
    const name = typeof payload.data?.name === "string" ? payload.data.name : undefined;
    const toolCallId = typeof payload.data?.toolCallId === "string" ? payload.data.toolCallId : undefined;
    const meta = typeof payload.data?.meta === "string" ? payload.data.meta : undefined;
    const isError = payload.data?.isError === true;
    run.toolEvents = [
      ...run.toolEvents.slice(-19),
      {
        seq: payload.seq,
        ts: now,
        phase,
        name,
        toolCallId,
        meta,
        isError,
        summary: summarizeToolData(payload.data),
      },
    ];
    return true;
  }

  return false;
}

// ============================================================================
// SESSIONS CONTROLLER
// ============================================================================

export type SessionsState = {
  client: GatewayClient | null;
  connected: boolean;
  sessionsLoading: boolean;
  sessionsResult: SessionsListResult | null;
  sessionsError: string | null;
  sessionsFilterActive: string;
  sessionsFilterLimit: string;
  sessionsIncludeGlobal: boolean;
  sessionsIncludeUnknown: boolean;
};

export async function loadSessions(
  state: SessionsState,
  overrides?: {
    activeMinutes?: number;
    limit?: number;
    includeGlobal?: boolean;
    includeUnknown?: boolean;
  },
) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.sessionsLoading) {
    return;
  }
  state.sessionsLoading = true;
  state.sessionsError = null;
  try {
    const includeGlobal = overrides?.includeGlobal ?? state.sessionsIncludeGlobal;
    const includeUnknown = overrides?.includeUnknown ?? state.sessionsIncludeUnknown;
    const activeMinutes = overrides?.activeMinutes ?? toNumber(state.sessionsFilterActive, 0);
    const limit = overrides?.limit ?? toNumber(state.sessionsFilterLimit, 0);
    const params: Record<string, unknown> = {
      includeGlobal,
      includeUnknown,
    };
    if (activeMinutes > 0) {
      params.activeMinutes = activeMinutes;
    }
    if (limit > 0) {
      params.limit = limit;
    }
    const res = await state.client.request("sessions.list", params);
    if (res) {
      state.sessionsResult = res;
    }
  } catch (err) {
    state.sessionsError = String(err);
  } finally {
    state.sessionsLoading = false;
  }
}

export async function patchSession(
  state: SessionsState,
  key: string,
  patch: {
    label?: string | null;
    thinkingLevel?: string | null;
    verboseLevel?: string | null;
    reasoningLevel?: string | null;
  },
) {
  if (!state.client || !state.connected) {
    return;
  }
  const params: Record<string, unknown> = { key };
  if ("label" in patch) {
    params.label = patch.label;
  }
  if ("thinkingLevel" in patch) {
    params.thinkingLevel = patch.thinkingLevel;
  }
  if ("verboseLevel" in patch) {
    params.verboseLevel = patch.verboseLevel;
  }
  if ("reasoningLevel" in patch) {
    params.reasoningLevel = patch.reasoningLevel;
  }
  try {
    await state.client.request("sessions.patch", params);
    await loadSessions(state);
  } catch (err) {
    state.sessionsError = String(err);
  }
}

export async function deleteSession(state: SessionsState, key: string) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.sessionsLoading) {
    return;
  }
  state.sessionsLoading = true;
  state.sessionsError = null;
  try {
    await state.client.request("sessions.delete", { key, deleteTranscript: true });
    await loadSessions(state);
  } catch (err) {
    state.sessionsError = String(err);
  } finally {
    state.sessionsLoading = false;
  }
}

// ============================================================================
// CHANNELS CONTROLLER
// ============================================================================

export type ChannelsState = {
  client: GatewayClient | null;
  connected: boolean;
  channelsLoading: boolean;
  channelsSnapshot: ChannelsStatusSnapshot | null;
  channelsError: string | null;
  channelsLastSuccess: number | null;
  whatsappBusy: boolean;
  whatsappLoginMessage: string | null;
  whatsappLoginQrDataUrl: string | null;
  whatsappLoginConnected: boolean | null;
};

export async function loadChannels(state: ChannelsState, probe: boolean) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.channelsLoading) {
    return;
  }
  state.channelsLoading = true;
  state.channelsError = null;
  try {
    const res = await state.client.request("channels.status", {
      probe,
      timeoutMs: 8000,
    });
    state.channelsSnapshot = res;
    state.channelsLastSuccess = Date.now();
  } catch (err) {
    state.channelsError = String(err);
  } finally {
    state.channelsLoading = false;
  }
}

export async function startWhatsAppLogin(state: ChannelsState, force: boolean) {
  if (!state.client || !state.connected || state.whatsappBusy) {
    return;
  }
  state.whatsappBusy = true;
  try {
    const res = await state.client.request("web.login.start", {
      force,
      timeoutMs: 30000,
    });
    state.whatsappLoginMessage = res.message ?? null;
    state.whatsappLoginQrDataUrl = res.qrDataUrl ?? null;
    state.whatsappLoginConnected = null;
  } catch (err) {
    state.whatsappLoginMessage = String(err);
    state.whatsappLoginQrDataUrl = null;
    state.whatsappLoginConnected = null;
  } finally {
    state.whatsappBusy = false;
  }
}

export async function waitWhatsAppLogin(state: ChannelsState) {
  if (!state.client || !state.connected || state.whatsappBusy) {
    return;
  }
  state.whatsappBusy = true;
  try {
    const res = await state.client.request("web.login.wait", {
      timeoutMs: 120000,
    });
    state.whatsappLoginMessage = res.message ?? null;
    state.whatsappLoginConnected = res.connected ?? null;
    if (res.connected) {
      state.whatsappLoginQrDataUrl = null;
    }
  } catch (err) {
    state.whatsappLoginMessage = String(err);
    state.whatsappLoginConnected = null;
  } finally {
    state.whatsappBusy = false;
  }
}

export async function logoutWhatsApp(state: ChannelsState) {
  if (!state.client || !state.connected || state.whatsappBusy) {
    return;
  }
  state.whatsappBusy = true;
  try {
    await state.client.request("channels.logout", { channel: "whatsapp" });
    state.whatsappLoginMessage = "Logged out.";
    state.whatsappLoginQrDataUrl = null;
    state.whatsappLoginConnected = null;
  } catch (err) {
    state.whatsappLoginMessage = String(err);
  } finally {
    state.whatsappBusy = false;
  }
}

// ============================================================================
// SKILLS CONTROLLER
// ============================================================================

export type SkillsState = {
  client: GatewayClient | null;
  connected: boolean;
  skillsLoading: boolean;
  skillsReport: SkillStatusReport | null;
  skillsError: string | null;
  skillsBusyKey: string | null;
  skillEdits: Record<string, string>;
  skillMessages: SkillMessageMap;
};

export type SkillMessage = {
  kind: "success" | "error";
  message: string;
};

export type SkillMessageMap = Record<string, SkillMessage>;

function setSkillMessage(state: SkillsState, key: string, message?: SkillMessage) {
  if (!key.trim()) {
    return;
  }
  const next = { ...state.skillMessages };
  if (message) {
    next[key] = message;
  } else {
    delete next[key];
  }
  state.skillMessages = next;
}

export async function loadSkills(state: SkillsState) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.skillsLoading) {
    return;
  }
  state.skillsLoading = true;
  state.skillsError = null;
  try {
    const res = await state.client.request("skills.status", {});
    if (res) {
      state.skillsReport = res;
    }
  } catch (err) {
    state.skillsError = String(err);
  } finally {
    state.skillsLoading = false;
  }
}

export async function updateSkillEnabled(state: SkillsState, skillKey: string, enabled: boolean) {
  if (!state.client || !state.connected) {
    return;
  }
  state.skillsBusyKey = skillKey;
  state.skillsError = null;
  try {
    await state.client.request("skills.update", { skillKey, enabled });
    await loadSkills(state);
    setSkillMessage(state, skillKey, {
      kind: "success",
      message: enabled ? "Skill enabled" : "Skill disabled",
    });
  } catch (err) {
    const message = String(err);
    state.skillsError = message;
    setSkillMessage(state, skillKey, {
      kind: "error",
      message,
    });
  } finally {
    state.skillsBusyKey = null;
  }
}

export function updateSkillEdit(state: SkillsState, skillKey: string, value: string) {
  state.skillEdits = { ...state.skillEdits, [skillKey]: value };
}

export async function saveSkillApiKey(state: SkillsState, skillKey: string) {
  if (!state.client || !state.connected) {
    return;
  }
  state.skillsBusyKey = skillKey;
  state.skillsError = null;
  try {
    const apiKey = state.skillEdits[skillKey] ?? "";
    await state.client.request("skills.update", { skillKey, apiKey });
    await loadSkills(state);
    setSkillMessage(state, skillKey, {
      kind: "success",
      message: "API key saved",
    });
  } catch (err) {
    const message = String(err);
    state.skillsError = message;
    setSkillMessage(state, skillKey, {
      kind: "error",
      message,
    });
  } finally {
    state.skillsBusyKey = null;
  }
}

export async function installSkill(
  state: SkillsState,
  skillKey: string,
  name: string,
  installId: string,
) {
  if (!state.client || !state.connected) {
    return;
  }
  state.skillsBusyKey = skillKey;
  state.skillsError = null;
  try {
    const result = await state.client.request("skills.install", {
      name,
      installId,
      timeoutMs: 120000,
    });
    await loadSkills(state);
    setSkillMessage(state, skillKey, {
      kind: "success",
      message:
        (result as { message?: string } | undefined)?.message ?? "Skill install succeeded",
    });
  } catch (err) {
    const message = String(err);
    state.skillsError = message;
    setSkillMessage(state, skillKey, {
      kind: "error",
      message,
    });
  } finally {
    state.skillsBusyKey = null;
  }
}

// ============================================================================
// CRON CONTROLLER
// ============================================================================

export type CronState = {
  client: GatewayClient | null;
  connected: boolean;
  cronLoading: boolean;
  cronJobs: CronJob[];
  cronStatus: CronStatus | null;
  cronError: string | null;
  cronBusy: boolean;
  cronRunsJobId: string | null;
  cronRuns: CronRunLogEntry[];
};

export type CronAddInput = {
  name: string;
  description?: string;
  agentId?: string;
  enabled: boolean;
  schedule:
    | { kind: "at"; atMs: number }
    | { kind: "every"; everyMs: number }
    | { kind: "cron"; expr: string; tz?: string };
  sessionTarget: "main" | "isolated";
  wakeMode: "next-heartbeat" | "now";
  payload:
    | { kind: "systemEvent"; text: string }
    | {
        kind: "agentTurn";
        message: string;
        deliver?: boolean;
        channel?: string;
        to?: string;
        timeoutSeconds?: number;
      };
  isolation?: { postToMainPrefix?: string };
};

export async function loadCronStatus(state: CronState) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    const res = await state.client.request("cron.status", {});
    state.cronStatus = res;
  } catch (err) {
    state.cronError = String(err);
  }
}

export async function loadCronJobs(state: CronState) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.cronLoading) {
    return;
  }
  state.cronLoading = true;
  state.cronError = null;
  try {
    const res = await state.client.request("cron.list", {
      includeDisabled: true,
    });
    state.cronJobs = Array.isArray(res.jobs) ? res.jobs : [];
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronLoading = false;
  }
}

export async function toggleCronJob(state: CronState, job: CronJob, enabled: boolean) {
  if (!state.client || !state.connected || state.cronBusy) {
    return;
  }
  state.cronBusy = true;
  state.cronError = null;
  try {
    await state.client.request("cron.update", { id: job.id, patch: { enabled } });
    await loadCronJobs(state);
    await loadCronStatus(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

export async function addCronJob(
  state: CronState,
  input: CronAddInput,
) {
  if (!state.client || !state.connected || state.cronBusy) {
    return;
  }
  state.cronBusy = true;
  state.cronError = null;
  try {
    await state.client.request("cron.add", {
      name: input.name.trim(),
      description: input.description || undefined,
      agentId: input.agentId?.trim() || undefined,
      enabled: input.enabled,
      schedule: input.schedule,
      sessionTarget: input.sessionTarget,
      wakeMode: input.wakeMode,
      payload: input.payload,
      isolation: input.isolation,
    });
    await loadCronJobs(state);
    await loadCronStatus(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

export async function runCronJob(state: CronState, job: CronJob) {
  if (!state.client || !state.connected || state.cronBusy) {
    return;
  }
  state.cronBusy = true;
  state.cronError = null;
  try {
    await state.client.request("cron.run", { id: job.id, mode: "force" });
    await loadCronRuns(state, job.id);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

export async function removeCronJob(state: CronState, job: CronJob) {
  if (!state.client || !state.connected || state.cronBusy) {
    return;
  }
  state.cronBusy = true;
  state.cronError = null;
  try {
    await state.client.request("cron.remove", { id: job.id });
    if (state.cronRunsJobId === job.id) {
      state.cronRunsJobId = null;
      state.cronRuns = [];
    }
    await loadCronJobs(state);
    await loadCronStatus(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

export async function loadCronRuns(state: CronState, jobId: string) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    const res = await state.client.request("cron.runs", {
      id: jobId,
      limit: 50,
    });
    state.cronRunsJobId = jobId;
    state.cronRuns = Array.isArray(res.entries) ? res.entries : [];
  } catch (err) {
    state.cronError = String(err);
  }
}

// ============================================================================
// CONFIG CONTROLLER
// ============================================================================

export type ConfigState = {
  client: GatewayClient | null;
  connected: boolean;
  applySessionKey: string;
  configLoading: boolean;
  configRaw: string;
  configRawOriginal: string;
  configValid: boolean | null;
  configIssues: unknown[];
  configSaving: boolean;
  configSnapshot: ConfigSnapshot | null;
  configSchema: unknown;
  configSchemaVersion: string | null;
  configUiHints: ConfigUiHints;
  configLastAction?: "save" | "apply" | "update" | null;
  configLastActionStatus?: "success" | "error" | null;
  configLastActionAt?: number | null;
  lastError: string | null;
};

function markConfigActionResult(
  state: ConfigState,
  action: "save" | "apply" | "update",
  status: "success" | "error",
) {
  state.configLastAction = action;
  state.configLastActionStatus = status;
  state.configLastActionAt = Date.now();
}

export async function loadConfig(state: ConfigState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.configLoading = true;
  state.lastError = null;
  try {
    const res = await state.client.request("config.get", {});
    applyConfigSnapshot(state, res);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.configLoading = false;
  }
}

export async function loadConfigSchema(state: ConfigState) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    const res = await state.client.request("config.schema", {});
    applyConfigSchema(state, res);
  } catch (err) {
    state.lastError = String(err);
  }
}

function applyConfigSchema(state: ConfigState, res: ConfigSchemaResponse) {
  state.configSchema = res.schema ?? null;
  state.configUiHints = res.uiHints ?? {};
  state.configSchemaVersion = res.version ?? null;
}

function applyConfigSnapshot(state: ConfigState, snapshot: ConfigSnapshot) {
  state.configSnapshot = snapshot;
  state.configRaw = typeof snapshot.raw === "string" ? snapshot.raw : state.configRaw;
  state.configValid = typeof snapshot.valid === "boolean" ? snapshot.valid : null;
  state.configIssues = Array.isArray(snapshot.issues) ? snapshot.issues : [];
  state.configRawOriginal = state.configRaw;
}

export async function saveConfig(state: ConfigState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.configSaving = true;
  state.lastError = null;
  try {
    const baseHash = state.configSnapshot?.hash;
    if (!baseHash) {
      state.lastError = "Config hash missing; reload and retry.";
      return;
    }
    await state.client.request("config.set", { raw: state.configRaw, baseHash });
    await loadConfig(state);
    markConfigActionResult(state, "save", "success");
  } catch (err) {
    state.lastError = String(err);
    markConfigActionResult(state, "save", "error");
  } finally {
    state.configSaving = false;
  }
}

export async function applyConfig(state: ConfigState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.configSaving = true;
  state.lastError = null;
  try {
    const baseHash = state.configSnapshot?.hash;
    if (!baseHash) {
      state.lastError = "Config hash missing; reload and retry.";
      return;
    }
    await state.client.request("config.apply", {
      raw: state.configRaw,
      baseHash,
      sessionKey: state.applySessionKey || "main",
    });
    await loadConfig(state);
    markConfigActionResult(state, "apply", "success");
  } catch (err) {
    state.lastError = String(err);
    markConfigActionResult(state, "apply", "error");
  } finally {
    state.configSaving = false;
  }
}

export async function runUpdate(state: ConfigState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.configSaving = true;
  state.lastError = null;
  try {
    await state.client.request("update.run", { sessionKey: state.applySessionKey || "main" });
    markConfigActionResult(state, "update", "success");
  } catch (err) {
    state.lastError = String(err);
    markConfigActionResult(state, "update", "error");
  } finally {
    state.configSaving = false;
  }
}

export function setConfigRawDraft(state: ConfigState, raw: string) {
  state.configRaw = raw;
  if (state.configRaw !== state.configRawOriginal) {
    state.configLastAction = null;
    state.configLastActionStatus = null;
    state.configLastActionAt = null;
  }

  // If draft equals the server snapshot, restore server validity metadata.
  if (state.configRaw === state.configRawOriginal && state.configSnapshot) {
    state.configValid =
      typeof state.configSnapshot.valid === "boolean" ? state.configSnapshot.valid : null;
    state.configIssues = Array.isArray(state.configSnapshot.issues)
      ? state.configSnapshot.issues
      : [];
    return;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    state.configValid = false;
    state.configIssues = [{ source: "local-parse", message: "Config cannot be empty JSON." }];
    return;
  }

  try {
    JSON.parse(raw);
    state.configValid = true;
    state.configIssues = [];
  } catch (err) {
    state.configValid = false;
    state.configIssues = [
      {
        source: "local-parse",
        message: err instanceof Error ? err.message : String(err),
      },
    ];
  }
}

// ============================================================================
// DEVICES CONTROLLER
// ============================================================================

export type DeviceTokenSummary = {
  role: string;
  scopes?: string[];
  createdAtMs?: number;
  rotatedAtMs?: number;
  revokedAtMs?: number;
  lastUsedAtMs?: number;
};

export type PendingDevice = {
  requestId: string;
  deviceId: string;
  displayName?: string;
  role?: string;
  remoteIp?: string;
  isRepair?: boolean;
  ts?: number;
};

export type PairedDevice = {
  deviceId: string;
  displayName?: string;
  roles?: string[];
  scopes?: string[];
  remoteIp?: string;
  tokens?: DeviceTokenSummary[];
  createdAtMs?: number;
  approvedAtMs?: number;
};

export type DevicePairingList = {
  pending: PendingDevice[];
  paired: PairedDevice[];
};

export type DevicesState = {
  client: GatewayClient | null;
  connected: boolean;
  devicesLoading: boolean;
  devicesError: string | null;
  devicesList: DevicePairingList | null;
};

export async function loadDevices(state: DevicesState, opts?: { quiet?: boolean }) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.devicesLoading) {
    return;
  }
  state.devicesLoading = true;
  if (!opts?.quiet) {
    state.devicesError = null;
  }
  try {
    const res = await state.client.request("device.pair.list", {});
    state.devicesList = {
      pending: Array.isArray(res?.pending) ? res.pending : [],
      paired: Array.isArray(res?.paired) ? res.paired : [],
    };
  } catch (err) {
    if (!opts?.quiet) {
      state.devicesError = String(err);
    }
  } finally {
    state.devicesLoading = false;
  }
}

export async function approveDevicePairing(state: DevicesState, requestId: string) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    await state.client.request("device.pair.approve", { requestId });
    await loadDevices(state);
  } catch (err) {
    state.devicesError = String(err);
  }
}

export async function rejectDevicePairing(state: DevicesState, requestId: string) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    await state.client.request("device.pair.reject", { requestId });
    await loadDevices(state);
  } catch (err) {
    state.devicesError = String(err);
  }
}

export async function rotateDeviceToken(
  state: DevicesState,
  params: { deviceId: string; role: string; scopes?: string[] },
) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    const res = await state.client.request("device.token.rotate", params);
    const token = (res as { token?: string } | null)?.token;
    if (token) {
      window.prompt("New device token (copy and store securely):", token);
    }
    await loadDevices(state);
  } catch (err) {
    state.devicesError = String(err);
  }
}

export async function revokeDeviceToken(
  state: DevicesState,
  params: { deviceId: string; role: string },
) {
  if (!state.client || !state.connected) {
    return;
  }
  try {
    await state.client.request("device.token.revoke", params);
    await loadDevices(state);
  } catch (err) {
    state.devicesError = String(err);
  }
}

// ============================================================================
// PRESENCE CONTROLLER
// ============================================================================

export type PresenceState = {
  client: GatewayClient | null;
  connected: boolean;
  presenceLoading: boolean;
  presenceEntries: PresenceEntry[];
  presenceError: string | null;
};

export async function loadPresence(state: PresenceState) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.presenceLoading) {
    return;
  }
  state.presenceLoading = true;
  state.presenceError = null;
  try {
    const res = await state.client.request("presence.list", {});
    state.presenceEntries = Array.isArray(res.entries) ? res.entries : [];
  } catch (err) {
    state.presenceError = String(err);
  } finally {
    state.presenceLoading = false;
  }
}

// ============================================================================
// DEBUG CONTROLLER
// ============================================================================

export type DebugState = {
  client: GatewayClient | null;
  connected: boolean;
  debugLoading: boolean;
  debugStatus: StatusSummary | null;
  debugHealth: HealthSnapshot | null;
  debugError: string | null;
  debugCallMethod: string;
  debugCallParams: string;
  debugCallResult: string | null;
};

export async function loadDebugStatus(state: DebugState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.debugLoading = true;
  state.debugError = null;
  try {
    const res = await state.client.request("status.summary", {});
    state.debugStatus = res;
  } catch (err) {
    state.debugError = String(err);
  } finally {
    state.debugLoading = false;
  }
}

export async function loadDebugHealth(state: DebugState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.debugLoading = true;
  state.debugError = null;
  try {
    const res = await state.client.request("health.snapshot", {});
    state.debugHealth = res;
  } catch (err) {
    state.debugError = String(err);
  } finally {
    state.debugLoading = false;
  }
}

export async function callDebugMethod(state: DebugState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.debugError = null;
  state.debugCallResult = null;
  try {
    const method = state.debugCallMethod.trim();
    if (!method) {
      throw new Error("Method required");
    }
    const params = state.debugCallParams.trim() ? JSON.parse(state.debugCallParams) : {};
    const res = await state.client.request(method, params);
    state.debugCallResult = JSON.stringify(res, null, 2);
  } catch (err) {
    state.debugError = String(err);
  }
}

// ============================================================================
// NODES CONTROLLER
// ============================================================================

export type NodesState = {
  client: GatewayClient | null;
  connected: boolean;
  nodesLoading: boolean;
  nodes: Array<Record<string, unknown>>;
  nodesError: string | null;
};

export async function loadNodes(state: NodesState, opts?: { quiet?: boolean }) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.nodesLoading) {
    return;
  }
  state.nodesLoading = true;
  if (!opts?.quiet) {
    state.nodesError = null;
  }
  try {
    const res = await state.client.request("node.list", {});
    state.nodes = Array.isArray(res.nodes) ? res.nodes : [];
  } catch (err) {
    if (!opts?.quiet) {
      state.nodesError = String(err);
    }
  } finally {
    state.nodesLoading = false;
  }
}

// ============================================================================
// LOGS CONTROLLER
// ============================================================================

export type LogsState = {
  client: GatewayClient | null;
  connected: boolean;
  logsLoading: boolean;
  logsError: string | null;
  logsEntries: LogEntry[];
  logsCursor: number | null;
};

export async function loadLogs(state: LogsState, limit: number = 500) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.logsLoading) {
    return;
  }
  state.logsLoading = true;
  state.logsError = null;
  try {
    const params: Record<string, unknown> = { limit };
    if (state.logsCursor) {
      params.cursor = state.logsCursor;
    }
    const res = await state.client.request("logs.tail", params);
    state.logsEntries = Array.isArray(res.entries) ? res.entries : [];
    state.logsCursor = res.cursor ?? null;
  } catch (err) {
    state.logsError = String(err);
  } finally {
    state.logsLoading = false;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function toNumber(value: string, defaultValue: number): number {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function extractText(message: unknown): string | null {
  if (!message) {
    return null;
  }
  if (typeof message === "string") {
    return message;
  }
  // Handle Claude message format
  const msg = message as { content?: unknown };
  if (Array.isArray(msg.content)) {
    const textBlocks = msg.content
      .filter((block) => block?.type === "text")
      .map((block) => block.text)
      .filter(Boolean);
    return textBlocks.length > 0 ? textBlocks.join("\n\n") : null;
  }
  return null;
}
