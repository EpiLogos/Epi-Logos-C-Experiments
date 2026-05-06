export interface TelegramRuntimeConfig {
  enabled: boolean;
  botToken: string;
  apiBaseUrl: string;
  allowedChatIds: number[];
  allowedUserIds: number[];
  defaultChatId: number;
  pollIntervalMs: number;
  maxRecentMessages: number;
}

export interface TelegramApiResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  chat: TelegramChat;
  from?: TelegramUser;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface TelegramSendMessageOptions {
  message_thread_id?: number;
  reply_to_message_id?: number;
}

export interface TelegramCachedMessage {
  updateId: number;
  chatId: number;
  chatTitle: string | null;
  messageId: number;
  fromUserId: number | null;
  fromUsername: string | null;
  text: string;
  dateEpochSeconds: number;
  timestamp: string;
}
