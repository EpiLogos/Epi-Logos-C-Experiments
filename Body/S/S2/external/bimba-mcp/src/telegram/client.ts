import type {
  TelegramApiResponse,
  TelegramSendMessageOptions,
  TelegramUpdate,
  TelegramMessage,
} from './types.js';

export class TelegramApiClient {
  private readonly endpointPrefix: string;

  constructor(
    apiBaseUrl: string,
    botToken: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    this.endpointPrefix = `${apiBaseUrl.replace(/\/+$/, '')}/bot${botToken}`;
  }

  async getUpdates(offset?: number): Promise<TelegramUpdate[]> {
    const payload: Record<string, unknown> = {
      timeout: 0,
      allowed_updates: ['message', 'edited_message'],
    };
    if (offset !== undefined) {
      payload.offset = offset;
    }
    const response = await this.request<TelegramUpdate[]>('getUpdates', payload);
    return response.result;
  }

  async sendMessage(
    chatId: number,
    text: string,
    options: TelegramSendMessageOptions = {}
  ): Promise<TelegramMessage> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      ...options,
    };
    const response = await this.request<TelegramMessage>('sendMessage', payload);
    return response.result;
  }

  private async request<T>(
    method: string,
    payload: Record<string, unknown>
  ): Promise<TelegramApiResponse<T>> {
    const response = await this.fetchImpl(`${this.endpointPrefix}/${method}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram API HTTP ${response.status}: ${body}`);
    }

    const data = (await response.json()) as TelegramApiResponse<T>;
    if (!data.ok) {
      throw new Error(
        `Telegram API ${method} failed: ${data.description ?? 'unknown error'}`
      );
    }

    return data;
  }
}
