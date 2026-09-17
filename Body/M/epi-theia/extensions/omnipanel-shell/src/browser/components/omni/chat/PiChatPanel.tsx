import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import type { ChatState } from '../../../controllers/epi-claw/controllers';
import { normalizeChatMessage, type NormalizedToolCall } from './messageNormalizer';
import { createAttachmentId, type ChatAttachment } from './attachments';
import { SlashCommandParser, isSlashCommandLine } from '../../../services/slash-command-parser';
import {
  createDefaultSlashCommandRegistry,
  type SlashCommandRegistry,
  type SlashCommandResult,
} from '../../../services/slash-command-registry';
import {
  PiChatConversationStore,
  type PiChatConversationMessage,
} from '../../../stores/pi-chat-conversation-store';
import { OmniButton } from '../ui/button';
import { OmniCard } from '../ui/card';
import { OmniInput, OmniTextarea } from '../ui/input';

export const PI_CHAT_IDENTITY_NARRATIVE =
  "Pi — conversational membrane. Speak; I dispatch through Anima. Anima orchestrates from S4'; subagents surface in crystallisation-mode.";

export const KHORA_SESSION_START_COMPAT = 'khora_session_start';

type PiChatReadiness = ConnectionState | 'ready' | 'not-ready';

export type PiChatPanelProps = {
  panelState: 'minimal' | 'fullscreen';
  connectionState: ConnectionState;
  chat: ChatState;
  focusMode?: boolean;
  splitRatio?: number;
  availableChannels?: Array<{ id: string; label: string }>;
  showThinking?: boolean;
  chatDraft?: string;
  onSetSessionKey: (sessionKey: string) => void;
  onSetChatDraft: (value: string) => void;
  onLoadHistory: () => void;
  onAbort: () => void;
  onNewSession: () => void;
  onQueueRemove: (id: string) => void;
  onToggleFocusMode: () => void;
  onSplitRatioChange: (ratio: number) => void;
  toolEventsVerboseEnabled?: boolean;
  toolEventsVerbosePending?: boolean;
  onToggleToolEventsVerbose?: () => void;
  dayId?: string;
  kairosAtOpen?: Record<string, unknown> | null;
  profileTick?: { generation: number | null; advanced?: boolean } | null;
  slashCommandRegistry?: SlashCommandRegistry;
  conversationStore?: PiChatConversationStore;
  onActivateTab?: (tabId: string, payload?: Record<string, unknown>) => void;
  onInvokeGatewayRpc?: (method: string, params: Record<string, unknown>) => Promise<unknown>;
  onSend: (
    message: string,
    options?: {
      attachments?: ChatAttachment[];
      deliver?: boolean;
      sessionKey?: string;
    },
  ) => Promise<void>;
};

export interface PiChatHeaderModel {
  readonly narrative: string;
  readonly sessionAnchor: string;
  readonly connectionStatus: PiChatReadiness;
  readonly kairosAtOpen: Record<string, unknown> | null;
}

export interface PiChatHistoryModel {
  readonly messages: readonly PiChatConversationMessage[];
  readonly profileTickGeneration: number | null;
  readonly renderKey: string;
}

export interface PiCapabilityCompletion {
  readonly verb: string;
  readonly description: string;
}

export interface PiChatInputModel {
  readonly mode: 'multi-turn' | 'slash-command';
  readonly completions: readonly PiCapabilityCompletion[];
}

export interface ExecutePiChatSubmitArgs {
  readonly text: string;
  readonly sessionKey: string;
  readonly dayId?: string;
  readonly attachments?: readonly ChatAttachment[];
  readonly deliver?: boolean;
  readonly registry?: SlashCommandRegistry;
  readonly invokeGatewayRpc?: (method: string, params: Record<string, unknown>) => Promise<unknown>;
  readonly activateTab?: (tabId: string, payload?: Record<string, unknown>) => unknown;
  readonly setSessionKey?: (sessionKey: string) => void | Promise<void>;
  readonly sendPiMessage: (
    message: string,
    options?: { attachments?: readonly ChatAttachment[]; deliver?: boolean; sessionKey?: string }
  ) => Promise<unknown>;
}

const defaultConversationStore = new PiChatConversationStore();
const defaultSlashCommandRegistry = createDefaultSlashCommandRegistry();
const slashCommandParser = new SlashCommandParser();

export function buildPiChatHeaderModel(input: {
  sessionKey?: string | null;
  readiness: PiChatReadiness;
  kairosAtOpen?: Record<string, unknown> | null;
}): PiChatHeaderModel {
  const sessionKey = input.sessionKey?.trim();
  return {
    narrative: PI_CHAT_IDENTITY_NARRATIVE,
    sessionAnchor: sessionKey ? `[[NOW-${sessionKey}]]` : '[[NOW-new-session]]',
    connectionStatus: input.readiness,
    kairosAtOpen: input.kairosAtOpen ?? null,
  };
}

export function buildPiChatHistoryModel(
  messages: readonly PiChatConversationMessage[],
  profileTick?: { generation: number | null; advanced?: boolean } | null
): PiChatHistoryModel {
  const generation = profileTick?.generation ?? null;
  return {
    messages,
    profileTickGeneration: generation,
    renderKey: `${messages.length}:${generation ?? 'none'}:${profileTick?.advanced ? 'advanced' : 'steady'}`,
  };
}

export function buildPiChatInputModel(input: string, verbs: readonly string[]): PiChatInputModel {
  const trimmed = input.trimStart();
  if (!trimmed.startsWith('/')) {
    return { mode: 'multi-turn', completions: [] };
  }
  const prefix = trimmed.slice(1).toLowerCase();
  return {
    mode: 'slash-command',
    completions: verbs
      .filter((verb) => verb.startsWith(prefix))
      .map((verb) => ({ verb, description: `/${verb}` })),
  };
}

export async function executePiChatSubmit(args: ExecutePiChatSubmitArgs): Promise<SlashCommandResult | { sessionKey: string }> {
  const text = args.text.trim();
  const registry = args.registry ?? defaultSlashCommandRegistry;
  const parsed = slashCommandParser.parse(text);
  if (parsed) {
    const handler = registry.resolve(parsed);
    if (!handler) {
      return { kind: 'rejected', message: `Unknown slash command: /${parsed.verb}` };
    }
    return handler(parsed, {
      sessionKey: args.sessionKey || undefined,
      dayId: args.dayId,
      invokeGatewayRpc: args.invokeGatewayRpc,
      activateTab: args.activateTab,
      sendPiMessage: args.sendPiMessage,
    });
  }

  let sessionKey = args.sessionKey.trim();
  if (!sessionKey) {
    const response = await args.invokeGatewayRpc?.('s4.khora.session_start', {
      topic: text || undefined,
      day_id: args.dayId ?? null,
      compatibility_method: KHORA_SESSION_START_COMPAT,
    });
    sessionKey = extractSessionKey(response) ?? sessionKey;
    if (sessionKey) {
      await args.setSessionKey?.(sessionKey);
    }
  }

  await args.sendPiMessage(text, {
    attachments: args.attachments,
    deliver: args.deliver,
    sessionKey: sessionKey || undefined,
  });
  return { sessionKey };
}

function extractSessionKey(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }
  const raw = response as { sessionKey?: unknown; session_key?: unknown; key?: unknown };
  const value = raw.sessionKey ?? raw.session_key ?? raw.key;
  return typeof value === 'string' && value.trim() ? value : null;
}

function markdownClassName() {
  return '[&_p]:my-1 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:border [&_pre]:border-[var(--border-subtle)] [&_pre]:bg-[var(--chat-code-bg)] [&_pre]:p-2 [&_code]:text-[11px]';
}

function renderToolSummary(tool: NormalizedToolCall) {
  return (
    <div key={tool.id} className="rounded border border-[var(--border-subtle)] bg-black/20 px-2 py-1.5 text-[11px]">
      <div className="font-semibold text-[var(--text-primary)]">{tool.name}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] mt-1">id: {tool.id}</div>
    </div>
  );
}

function phaseLabel(phase?: string) {
  if (phase === 'start') return 'started';
  if (phase === 'update') return 'updated';
  if (phase === 'result') return 'completed';
  return phase ?? 'event';
}

export function PrivacyClassBadge({ privacyClass }: { privacyClass?: string }) {
  if (privacyClass !== 'protected_local') {
    return null;
  }
  return (
    <span className="rounded border border-amber-400/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-200">
      protected local
    </span>
  );
}

export function PiChatHeader({ model }: { model: PiChatHeaderModel }) {
  return (
    <OmniCard className="shrink-0 p-3 space-y-2 border-[var(--border-subtle)] bg-black/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Pi</div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">{model.narrative}</div>
        </div>
        <div className="shrink-0 text-right text-[10px] text-[var(--text-tertiary)]">
          <div>{model.sessionAnchor}</div>
          <div className="mt-1 uppercase tracking-wide">{model.connectionStatus}</div>
        </div>
      </div>
      {model.kairosAtOpen && (
        <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--text-tertiary)]">
          {Object.entries(model.kairosAtOpen).map(([key, value]) => (
            <span key={key} className="rounded border border-[var(--border-subtle)] bg-black/20 px-1.5 py-0.5">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </OmniCard>
  );
}

export function PiCapabilityCompletionProvider({
  model,
  onPick,
}: {
  model: PiChatInputModel;
  onPick: (verb: string) => void;
}) {
  if (model.mode !== 'slash-command' || model.completions.length === 0) {
    return null;
  }
  return (
    <div className="absolute bottom-full left-2 right-2 mb-2 rounded border border-[var(--border-subtle)] bg-[var(--chat-compose-bg)] p-1.5 shadow-lg">
      {model.completions.map((entry) => (
        <button
          key={entry.verb}
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-xs hover:bg-white/10"
          onClick={() => onPick(entry.verb)}
        >
          <span className="font-semibold text-[var(--text-primary)]">/{entry.verb}</span>
          <span className="truncate text-[10px] text-[var(--text-tertiary)]">{entry.description}</span>
        </button>
      ))}
    </div>
  );
}

export function PiChatInput({
  compact,
  disabled,
  sending,
  value,
  attachmentsCount,
  inputModel,
  onChange,
  onBlur,
  onPaste,
  onKeyDown,
  onSend,
  onPickCommand,
}: {
  compact: boolean;
  disabled: boolean;
  sending: boolean;
  value: string;
  attachmentsCount: number;
  inputModel: PiChatInputModel;
  onChange: (value: string) => void;
  onBlur: () => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onPickCommand: (verb: string) => void;
}) {
  return (
    <OmniCard className="relative z-10 shrink-0 p-2 bg-[var(--chat-compose-bg)] border-[var(--chat-compose-border)] shadow-[0_-8px_24px_rgba(0,0,0,0.2)]">
      <PiCapabilityCompletionProvider model={inputModel} onPick={onPickCommand} />
      <div className="flex gap-2 items-end">
        <OmniTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onPaste={onPaste}
          onKeyDown={onKeyDown}
          rows={compact ? 2 : 3}
          disabled={disabled}
          placeholder={disabled ? 'Connect gateway first' : 'Speak with Pi or type / for command grammar'}
          className="flex-1 min-h-[72px] resize-none bg-black/20"
        />
        <OmniButton
          onClick={onSend}
          disabled={disabled || (!value.trim() && attachmentsCount === 0)}
          variant="default"
          className="self-end"
        >
          {sending ? 'Queue' : isSlashCommandLine(value) ? 'Run' : 'Send'}
        </OmniButton>
      </div>
    </OmniCard>
  );
}

export function PiChatHistory({ model }: { model: PiChatHistoryModel }) {
  return (
    <div className="hidden" data-testid="pi-chat-history-profile-tick" data-render-key={model.renderKey}>
      {model.profileTickGeneration ?? 'none'}
    </div>
  );
}

export function PiChatPanel({
  panelState,
  connectionState,
  chat,
  focusMode = false,
  splitRatio = 0.6,
  availableChannels,
  showThinking = true,
  chatDraft = '',
  onSetSessionKey,
  onSetChatDraft,
  onLoadHistory,
  onAbort,
  onNewSession,
  onQueueRemove,
  onToggleFocusMode,
  onSplitRatioChange,
  toolEventsVerboseEnabled = false,
  toolEventsVerbosePending = false,
  onToggleToolEventsVerbose,
  dayId,
  kairosAtOpen = null,
  profileTick = null,
  slashCommandRegistry = defaultSlashCommandRegistry,
  conversationStore = defaultConversationStore,
  onActivateTab,
  onInvokeGatewayRpc,
  onSend,
}: PiChatPanelProps) {
  const [chatInput, setChatInput] = useState(chatDraft);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [deliver, setDeliver] = useState(false);
  const [selectedTool, setSelectedTool] = useState<NormalizedToolCall | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [inlineMessages, setInlineMessages] = useState<unknown[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef(chatDraft);
  const draftCommitTimerRef = useRef<number | null>(null);
  const chatHasAutoScrolledRef = useRef(false);
  const chatUserNearBottomRef = useRef(true);

  const compact = panelState === 'minimal';
  const useSidebar = panelState === 'fullscreen' && !focusMode;
  const headerModel = buildPiChatHeaderModel({
    sessionKey: chat.sessionKey,
    readiness: connectionState,
    kairosAtOpen,
  });

  const messageList = useMemo(() => {
    return [...chat.chatMessages, ...inlineMessages].map((msg, index) => {
      const m = msg as { timestamp?: number };
      return normalizeChatMessage(msg, `${index}-${m.timestamp ?? index}`);
    });
  }, [chat.chatMessages, inlineMessages]);

  useEffect(() => {
    conversationStore.replaceMessages(
      messageList.map((message) => ({
        id: message.id,
        actor: message.role === 'user' ? 'User' : 'Pi',
        text: message.text,
        timestamp: message.timestamp.getTime(),
        privacyClass: message.text.includes('protected_local') ? 'protected_local' : undefined,
      })),
    );
  }, [conversationStore, messageList]);

  const historyModel = buildPiChatHistoryModel(conversationStore.getMessages(), profileTick);
  const inputModel = buildPiChatInputModel(
    chatInput,
    slashCommandRegistry.listVerbs().map((entry) => entry.verb),
  );

  const activeLiveRun = useMemo(() => {
    if (chat.chatRunId && chat.chatLiveRuns[chat.chatRunId]) {
      return chat.chatLiveRuns[chat.chatRunId];
    }
    const runs = Object.values(chat.chatLiveRuns);
    if (runs.length === 0) return null;
    return [...runs].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  }, [chat.chatLiveRuns, chat.chatRunId]);

  const nearBottomThreshold = 450;

  const scrollThreadToBottom = (behavior: ScrollBehavior = 'auto') => {
    const thread = threadRef.current;
    if (!thread) return;
    if (typeof thread.scrollTo === 'function') {
      thread.scrollTo({ top: thread.scrollHeight, behavior });
      return;
    }
    thread.scrollTop = thread.scrollHeight;
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const thread = threadRef.current;
      if (!thread) return;
      const distanceFromBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight;
      const shouldStick =
        !chatHasAutoScrolledRef.current ||
        chatUserNearBottomRef.current ||
        distanceFromBottom < nearBottomThreshold;
      if (!shouldStick) {
        setShowNewMessages(true);
        return;
      }
      scrollThreadToBottom(chat.chatStream ? 'auto' : 'smooth');
      chatHasAutoScrolledRef.current = true;
      chatUserNearBottomRef.current = true;
      setShowNewMessages(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messageList, chat.chatStream]);

  const handleThreadScroll = () => {
    const thread = threadRef.current;
    if (!thread) return;
    const distanceFromBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight;
    chatUserNearBottomRef.current = distanceFromBottom < nearBottomThreshold;
    if (chatUserNearBottomRef.current) {
      setShowNewMessages(false);
    }
  };

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    } else {
      scrollThreadToBottom();
    }
    chatHasAutoScrolledRef.current = true;
    chatUserNearBottomRef.current = true;
    setShowNewMessages(false);
  }, []);

  useEffect(() => {
    chatHasAutoScrolledRef.current = false;
    chatUserNearBottomRef.current = true;
    setShowNewMessages(false);
    setInlineMessages([]);
  }, [chat.sessionKey]);

  useEffect(() => {
    if (!useSidebar) {
      setSelectedTool(null);
    }
  }, [useSidebar]);

  useEffect(() => {
    chatInputRef.current = chatInput;
  }, [chatInput]);

  useEffect(() => {
    setChatInput(chatDraft);
    chatInputRef.current = chatDraft;
  }, [chatDraft, chat.sessionKey]);

  const commitDraft = (value: string, immediate = false) => {
    if (draftCommitTimerRef.current !== null) {
      window.clearTimeout(draftCommitTimerRef.current);
      draftCommitTimerRef.current = null;
    }
    if (immediate) {
      onSetChatDraft(value);
      return;
    }
    draftCommitTimerRef.current = window.setTimeout(() => {
      onSetChatDraft(value);
      draftCommitTimerRef.current = null;
    }, 180);
  };

  useEffect(() => () => {
    if (draftCommitTimerRef.current !== null) {
      window.clearTimeout(draftCommitTimerRef.current);
    }
    onSetChatDraft(chatInputRef.current);
  }, [onSetChatDraft]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text && attachments.length === 0) return;

    const snapshotAttachments = attachments;
    setChatInput('');
    chatInputRef.current = '';
    commitDraft('', true);
    setAttachments([]);
    try {
      const result = await executePiChatSubmit({
        text,
        sessionKey: chat.sessionKey,
        dayId,
        attachments: snapshotAttachments.length > 0 ? snapshotAttachments : undefined,
        deliver,
        registry: slashCommandRegistry,
        invokeGatewayRpc: onInvokeGatewayRpc,
        activateTab: onActivateTab,
        setSessionKey: onSetSessionKey,
        sendPiMessage: async (message, options) => {
          await onSend(message, {
            attachments: options?.attachments as ChatAttachment[] | undefined,
            deliver: options?.deliver,
            sessionKey: options?.sessionKey,
          });
        },
      });
      if ('kind' in result) {
        setInlineMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: [{ type: 'text', text }],
            timestamp: Date.now(),
          },
          {
            role: 'assistant',
            content: [{ type: 'text', text: result.message }],
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setChatInput(text);
      chatInputRef.current = text;
      commitDraft(text, true);
      setAttachments(snapshotAttachments);
    }
  };

  const handlePasteImages = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageItems: DataTransferItem[] = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.type.startsWith('image/')) imageItems.push(item);
    }
    if (imageItems.length === 0) return;

    event.preventDefault();
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const dataUrl = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: createAttachmentId(),
            dataUrl,
            mimeType: file.type,
          },
        ]);
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      data-panel-state={panelState}
      className={`flex-1 min-h-0 overflow-hidden flex flex-col gap-3 ${compact ? 'p-3' : 'p-5'} bg-[var(--chat-canvas-bg)] ${focusMode ? 'chat-focus-mode' : ''}`}
    >
      {focusMode && (
        <button
          type="button"
          className="self-end text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
          onClick={onToggleFocusMode}
          aria-label="Exit focus mode"
        >
          Exit focus mode
        </button>
      )}

      <PiChatHeader model={headerModel} />

      {chat.compactionStatus && (
        <OmniCard
          className={`shrink-0 p-2 text-xs ${
            chat.compactionStatus.active ? 'border-sky-400/40 text-sky-200' : 'border-emerald-400/40 text-emerald-200'
          }`}
        >
          {chat.compactionStatus.active ? 'Compacting context...' : 'Context compacted'}
        </OmniCard>
      )}

      {chat.lastError && <OmniCard className="p-2.5 text-xs border-red-500/40 text-red-300">{chat.lastError}</OmniCard>}

      <div className={`shrink-0 flex flex-wrap items-center gap-2 ${compact ? '' : ''}`}>
        <OmniInput
          value={chat.sessionKey}
          onChange={(e) => onSetSessionKey(e.target.value)}
          placeholder="Session key (blank uses default)"
          className="flex-1 min-w-[180px]"
        />
        <OmniButton onClick={onLoadHistory} disabled={connectionState !== 'connected' || chat.chatLoading}>History</OmniButton>
        {chat.chatRunId ? (
          <OmniButton onClick={onAbort} disabled={connectionState !== 'connected'} variant="danger">Abort</OmniButton>
        ) : (
          <OmniButton onClick={onNewSession} disabled={connectionState !== 'connected'}>New Session</OmniButton>
        )}
        <OmniButton
          aria-label="Toggle Focus Mode"
          variant={focusMode ? 'default' : 'ghost'}
          onClick={onToggleFocusMode}
        >
          {focusMode ? 'Focus On' : 'Focus Off'}
        </OmniButton>
        <OmniButton aria-label="Routing Options" variant="ghost" onClick={() => setRoutingOpen((prev) => !prev)}>
          {routingOpen ? 'Hide Routing' : 'Routing Options'}
        </OmniButton>
        {onToggleToolEventsVerbose && (
          <OmniButton
            aria-label={`Live Tool Events: ${toolEventsVerboseEnabled ? 'On' : 'Off'}`}
            variant={toolEventsVerboseEnabled ? 'default' : 'ghost'}
            onClick={onToggleToolEventsVerbose}
            disabled={connectionState !== 'connected' || toolEventsVerbosePending}
          >
            {toolEventsVerbosePending
              ? 'Live Tool Events...'
              : `Live Tool Events: ${toolEventsVerboseEnabled ? 'On' : 'Off'}`}
          </OmniButton>
        )}
      </div>

      {chat.chatQueue.length > 0 && (
        <OmniCard className="shrink-0 p-2.5 space-y-2">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Queued</div>
          <div className="space-y-1">
            {chat.chatQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded border border-[var(--border-subtle)] bg-black/20 px-2 py-1">
                <div className="text-[11px] text-[var(--text-secondary)] truncate">{item.text || '(attachment only)'}</div>
                <OmniButton
                  className="text-[10px] px-2 py-0.5"
                  aria-label="Remove queued item"
                  onClick={() => onQueueRemove(item.id)}
                >
                  Remove
                </OmniButton>
              </div>
            ))}
          </div>
        </OmniCard>
      )}

      {routingOpen && (
        <OmniCard className="shrink-0 p-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={deliver}
              onChange={(event) => setDeliver(event.target.checked)}
              aria-label="Deliver externally"
            />
            Deliver externally
          </label>
          {availableChannels && availableChannels.length > 0 && (
            <div className="text-[10px] text-[var(--text-tertiary)] flex flex-wrap gap-1.5">
              {availableChannels.map((channel) => (
                <span key={channel.id} className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-black/20">
                  {channel.label}
                </span>
              ))}
            </div>
          )}
        </OmniCard>
      )}

      <div className={`flex-1 min-h-0 overflow-hidden flex ${useSidebar && selectedTool ? 'gap-3' : ''}`}>
        <OmniCard
          className={`relative flex-1 min-h-0 overflow-y-scroll overscroll-contain bg-[var(--chat-thread-bg)] ${compact ? 'p-2.5' : 'p-3'} space-y-3 custom-scrollbar`}
          ref={threadRef}
          onScroll={handleThreadScroll}
          data-profile-tick={historyModel.profileTickGeneration ?? 'none'}
        >
          <PiChatHistory model={historyModel} />
          {messageList.length === 0 && !chat.chatStream && (
            <div className="text-xs text-[var(--text-tertiary)] italic">No messages yet.</div>
          )}

          {messageList.map((msg) => {
            const userMessage = msg.role === 'user';
            const containerClass = userMessage ? 'justify-end' : 'justify-start';
            const bubbleClass = userMessage
              ? 'bg-[var(--chat-user-bg)] border-[var(--chat-user-border)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
              : 'bg-[var(--chat-assistant-bg)] border-[var(--chat-assistant-border)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]';

            return (
              <div key={msg.id} className={`flex ${containerClass}`}>
                <div className={`w-full ${compact ? 'max-w-[95%]' : 'max-w-[88%]'} rounded-xl border px-3 py-2 ${bubbleClass}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${userMessage ? 'text-[var(--chat-user-title)]' : 'text-[var(--chat-assistant-title)]'}`}>{msg.role}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{formatDistanceToNow(msg.timestamp, { addSuffix: true })}</span>
                  </div>

                  <PrivacyClassBadge privacyClass={msg.text.includes('protected_local') ? 'protected_local' : undefined} />

                  {msg.text && (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className={`text-xs text-[var(--text-primary)] whitespace-pre-wrap break-words ${markdownClassName()}`}>
                      {msg.text}
                    </ReactMarkdown>
                  )}

                  {showThinking && msg.thinking && (
                    <details className="mt-2 rounded border border-[var(--border-subtle)] bg-black/20 px-2 py-1">
                      <summary className="cursor-pointer text-[11px] text-[var(--text-secondary)]">Reasoning</summary>
                      <pre className="mt-1 text-[11px] whitespace-pre-wrap break-words text-[var(--text-tertiary)]">{msg.thinking}</pre>
                    </details>
                  )}

                  {msg.tools.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Tool Calls</div>
                      {msg.tools.map((tool) => (
                        <div key={tool.id} className="space-y-1">
                          {renderToolSummary(tool)}
                          <OmniButton
                            className="text-[10px] px-2 py-1"
                            onClick={() => setSelectedTool(tool)}
                          >
                            Details
                          </OmniButton>
                          {!useSidebar && selectedTool?.id === tool.id && (
                            <OmniCard className="p-2 space-y-2 bg-[var(--chat-tool-bg)] border-[var(--chat-tool-border)]">
                              <div className="text-[10px] text-[var(--text-tertiary)]">Input</div>
                              <pre className="text-[10px] whitespace-pre-wrap break-words text-[var(--text-secondary)]">{tool.inputText}</pre>
                              <div className="text-[10px] text-[var(--text-tertiary)]">Output</div>
                              <pre className="text-[10px] whitespace-pre-wrap break-words text-[var(--text-secondary)]">{tool.outputText || 'No output captured'}</pre>
                            </OmniCard>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {activeLiveRun && (
            <div className="flex justify-start" data-testid="chat-live-run">
              <div className={`w-full ${compact ? 'max-w-[95%]' : 'max-w-[88%]'} rounded-lg border border-[var(--border-subtle)] bg-white/[0.03] px-3 py-2`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Live Run</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{activeLiveRun.lifecyclePhase}</div>
                </div>
                {activeLiveRun.assistantText && (
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)] break-words">
                    {activeLiveRun.assistantText}
                  </div>
                )}
                {activeLiveRun.toolEvents.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {activeLiveRun.toolEvents.slice(-6).map((evt) => (
                      <div
                        key={`${evt.seq}-${evt.toolCallId ?? evt.name ?? 'tool'}`}
                        className="flex items-center justify-between gap-2 rounded border border-[var(--border-subtle)]/60 bg-white/[0.02] px-2 py-1 text-[10px]"
                      >
                        <div className="min-w-0 truncate text-[var(--text-primary)]">
                          {evt.name ?? 'tool'} · {phaseLabel(evt.phase)}
                          {evt.meta ? ` · ${evt.meta}` : ''}
                        </div>
                        <div className={`shrink-0 ${evt.isError ? 'text-red-300' : 'text-[var(--text-tertiary)]'}`}>#{evt.seq}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {chat.chatStream && (
            <div className="flex justify-start">
              <div className={`w-full ${compact ? 'max-w-[95%]' : 'max-w-[88%]'} rounded-xl border border-[var(--chat-stream-border)] bg-[var(--chat-stream-bg)] px-3 py-2`}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--chat-stream-title)] mb-1">assistant (streaming)</div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} className={`text-xs text-[var(--text-primary)] whitespace-pre-wrap break-words ${markdownClassName()}`}>
                  {chat.chatStream}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {showNewMessages && (
            <div className="sticky bottom-2 flex justify-center">
              <OmniButton
                className="text-[10px] px-2 py-1 bg-[var(--chat-compose-bg)] border-[var(--chat-compose-border)]"
                onClick={() => {
                  scrollThreadToBottom('smooth');
                  chatHasAutoScrolledRef.current = true;
                  chatUserNearBottomRef.current = true;
                  setShowNewMessages(false);
                }}
              >
                New messages below
              </OmniButton>
            </div>
          )}
        </OmniCard>

        {useSidebar && selectedTool && (
          <OmniCard
            className="min-h-0 overflow-auto p-3 flex flex-col gap-2 bg-[var(--chat-tool-bg)] border-[var(--chat-tool-border)]"
            style={{ flex: `0 0 ${Math.round(splitRatio * 100)}%`, minWidth: 260, maxWidth: '70%' }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Tool Details</div>
              <OmniButton className="text-[10px] px-2 py-1" onClick={() => setSelectedTool(null)}>Close</OmniButton>
            </div>
            <label className="text-[10px] text-[var(--text-tertiary)]">
              Split ({splitRatio.toFixed(2)})
            </label>
            <input
              type="range"
              min={0.4}
              max={0.7}
              step={0.01}
              value={splitRatio}
              onChange={(event) => onSplitRatioChange(Number.parseFloat(event.target.value))}
            />
            <div className="text-xs text-[var(--text-secondary)]">{selectedTool.name}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">Input</div>
            <pre className="text-[10px] whitespace-pre-wrap break-words text-[var(--text-secondary)] rounded border border-[var(--border-subtle)] bg-[var(--chat-code-bg)] p-2">
              {selectedTool.inputText}
            </pre>
            <div className="text-[10px] text-[var(--text-tertiary)]">Output</div>
            <pre className="text-[10px] whitespace-pre-wrap break-words text-[var(--text-secondary)] rounded border border-[var(--border-subtle)] bg-[var(--chat-code-bg)] p-2 overflow-auto">
              {selectedTool.outputText || 'No output captured'}
            </pre>
          </OmniCard>
        )}
      </div>

      {attachments.length > 0 && (
        <OmniCard className="shrink-0 p-2.5">
          <div className="text-[10px] text-[var(--text-tertiary)] mb-2">Attachments ({attachments.length})</div>
          <div className="grid grid-cols-5 gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <img src={attachment.dataUrl} alt="attachment preview" className="w-full h-16 object-cover rounded border border-[var(--border-subtle)]" />
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((candidate) => candidate.id !== attachment.id))}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full text-[10px] bg-black/70 border border-[var(--border-subtle)] opacity-80 group-hover:opacity-100"
                  aria-label="Remove attachment"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </OmniCard>
      )}

      <PiChatInput
        compact={compact}
        disabled={connectionState !== 'connected' || chat.chatSending}
        sending={chat.chatSending || Boolean(chat.chatRunId)}
        value={chatInput}
        attachmentsCount={attachments.length}
        inputModel={inputModel}
        onChange={(next) => {
          setChatInput(next);
          chatInputRef.current = next;
          commitDraft(next);
        }}
        onBlur={() => commitDraft(chatInputRef.current, true)}
        onPaste={handlePasteImages}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
          }
        }}
        onSend={() => void handleSend()}
        onPickCommand={(verb) => {
          const next = `/${verb} `;
          setChatInput(next);
          chatInputRef.current = next;
          commitDraft(next);
        }}
      />
    </div>
  );
}
