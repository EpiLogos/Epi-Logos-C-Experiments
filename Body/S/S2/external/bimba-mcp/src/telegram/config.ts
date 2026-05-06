import { z } from 'zod';
import type { TelegramRuntimeConfig } from './types.js';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function asBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function parseNumberList(value: string | undefined, fieldName: string): number[] {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required ${fieldName}`);
  }

  const parsed = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number.parseInt(entry, 10));

  if (parsed.length === 0 || parsed.some((id) => !Number.isFinite(id))) {
    throw new Error(`Invalid ${fieldName}. Provide comma-separated numeric IDs.`);
  }

  return Array.from(new Set(parsed.map((id) => Math.trunc(id))));
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value || value.trim().length === 0) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.trunc(parsed);
}

const OptionalConfigSchema = z.object({
  TELEGRAM_MCP_ENABLED: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_API_BASE_URL: z.string().optional(),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().optional(),
  TELEGRAM_ALLOWED_USER_IDS: z.string().optional(),
  TELEGRAM_DEFAULT_CHAT_ID: z.string().optional(),
  TELEGRAM_POLL_INTERVAL_MS: z.string().optional(),
  TELEGRAM_MAX_RECENT_MESSAGES: z.string().optional(),
});

export function loadTelegramConfig(env: NodeJS.ProcessEnv = process.env): TelegramRuntimeConfig {
  const parsedEnv = OptionalConfigSchema.parse(env);
  const enabled = asBoolean(parsedEnv.TELEGRAM_MCP_ENABLED);

  if (!enabled) {
    return {
      enabled: false,
      botToken: '',
      apiBaseUrl: '',
      allowedChatIds: [],
      allowedUserIds: [],
      defaultChatId: 0,
      pollIntervalMs: 0,
      maxRecentMessages: 0,
    };
  }

  const botToken = parsedEnv.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required when TELEGRAM_MCP_ENABLED=true');
  }

  const allowedChatIds = parseNumberList(parsedEnv.TELEGRAM_ALLOWED_CHAT_IDS, 'TELEGRAM_ALLOWED_CHAT_IDS');
  const allowedUserIds = parseNumberList(parsedEnv.TELEGRAM_ALLOWED_USER_IDS, 'TELEGRAM_ALLOWED_USER_IDS');
  const configuredDefaultChatId = parseOptionalNumber(parsedEnv.TELEGRAM_DEFAULT_CHAT_ID);
  const defaultChatId = configuredDefaultChatId ?? allowedChatIds[0];

  if (defaultChatId === undefined) {
    throw new Error('Unable to resolve default chat ID from TELEGRAM_ALLOWED_CHAT_IDS');
  }
  if (!allowedChatIds.includes(defaultChatId)) {
    throw new Error('TELEGRAM_DEFAULT_CHAT_ID must be included in TELEGRAM_ALLOWED_CHAT_IDS');
  }

  const pollInterval = parseOptionalNumber(parsedEnv.TELEGRAM_POLL_INTERVAL_MS) ?? 1500;
  if (pollInterval < 500 || pollInterval > 30_000) {
    throw new Error('TELEGRAM_POLL_INTERVAL_MS must be between 500 and 30000');
  }

  const maxRecent = parseOptionalNumber(parsedEnv.TELEGRAM_MAX_RECENT_MESSAGES) ?? 200;
  if (maxRecent < 10 || maxRecent > 1000) {
    throw new Error('TELEGRAM_MAX_RECENT_MESSAGES must be between 10 and 1000');
  }

  return {
    enabled: true,
    botToken,
    apiBaseUrl: parsedEnv.TELEGRAM_API_BASE_URL?.trim() || 'https://api.telegram.org',
    allowedChatIds,
    allowedUserIds,
    defaultChatId,
    pollIntervalMs: pollInterval,
    maxRecentMessages: maxRecent,
  };
}
