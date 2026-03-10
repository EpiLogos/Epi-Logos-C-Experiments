import { TelegramApiClient } from './client.js';
import type {
  TelegramCachedMessage,
  TelegramMessage,
  TelegramRuntimeConfig,
  TelegramUpdate,
} from './types.js';

function normalizeMessage(message: TelegramMessage, updateId: number): TelegramCachedMessage {
  const text = (message.text ?? message.caption ?? '').trim();
  return {
    updateId,
    chatId: message.chat.id,
    chatTitle: message.chat.title ?? null,
    messageId: message.message_id,
    fromUserId: message.from?.id ?? null,
    fromUsername: message.from?.username ?? null,
    text,
    dateEpochSeconds: message.date,
    timestamp: new Date(message.date * 1000).toISOString(),
  };
}

export function filterAllowedMessage(
  update: TelegramUpdate,
  config: TelegramRuntimeConfig
): TelegramCachedMessage | null {
  const message = update.message ?? update.edited_message;
  if (!message) return null;
  if (!config.allowedChatIds.includes(message.chat.id)) return null;
  const fromUserId = message.from?.id;
  if (!fromUserId || !config.allowedUserIds.includes(fromUserId)) return null;
  const text = (message.text ?? message.caption ?? '').trim();
  if (!text) return null;
  return normalizeMessage(message, update.update_id);
}

export class TelegramService {
  private readonly apiClient: TelegramApiClient;
  private readonly cache: TelegramCachedMessage[] = [];
  private running = false;
  private nextOffset: number | undefined;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: TelegramRuntimeConfig,
    apiClient?: TelegramApiClient
  ) {
    this.apiClient =
      apiClient ??
      new TelegramApiClient(config.apiBaseUrl, config.botToken);
  }

  start(): void {
    if (!this.config.enabled || this.running) return;
    this.running = true;
    console.error(
      '[telegram] enabled. Privacy mode must be OFF in BotFather for full group-context reads.'
    );
    this.schedulePoll(0);
  }

  stop(): void {
    this.running = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  getRecentMessages(chatId: number, limit: number): TelegramCachedMessage[] {
    return this.cache
      .filter((message) => message.chatId === chatId)
      .slice(-limit)
      .reverse();
  }

  resolveChatId(chatId?: number): number {
    const resolved = chatId ?? this.config.defaultChatId;
    if (!this.config.allowedChatIds.includes(resolved)) {
      throw new Error(`Chat ID ${resolved} is not allowlisted`);
    }
    return resolved;
  }

  async sendMessage(chatId: number, text: string, threadId?: number): Promise<TelegramCachedMessage> {
    const sent = await this.apiClient.sendMessage(chatId, text, {
      message_thread_id: threadId,
    });
    return normalizeMessage(sent, this.nextOffset ?? 0);
  }

  async reply(chatId: number, messageId: number, text: string): Promise<TelegramCachedMessage> {
    const sent = await this.apiClient.sendMessage(chatId, text, {
      reply_to_message_id: messageId,
    });
    return normalizeMessage(sent, this.nextOffset ?? 0);
  }

  private schedulePoll(delayMs: number): void {
    if (!this.running) return;
    this.pollTimer = setTimeout(async () => {
      try {
        await this.pollOnce();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[telegram] polling failed: ${message}`);
      } finally {
        this.schedulePoll(this.config.pollIntervalMs);
      }
    }, delayMs);
  }

  private async pollOnce(): Promise<void> {
    const updates = await this.apiClient.getUpdates(this.nextOffset);
    if (updates.length === 0) return;

    const sorted = [...updates].sort((a, b) => a.update_id - b.update_id);
    for (const update of sorted) {
      const accepted = filterAllowedMessage(update, this.config);
      if (accepted) {
        this.cache.push(accepted);
      }
      this.nextOffset = update.update_id + 1;
    }

    if (this.cache.length > this.config.maxRecentMessages) {
      const trimCount = this.cache.length - this.config.maxRecentMessages;
      this.cache.splice(0, trimCount);
    }
  }
}
