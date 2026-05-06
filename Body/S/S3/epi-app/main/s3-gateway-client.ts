import { WebSocket } from './ws-wrapper.js';

/**
 * S3' Gateway WebSocket Client
 *
 * Manages WebSocket connection to S3' Gateway (epi gate, port 18794).
 * Features:
 * - Auto-connect on startup
 * - Exponential backoff retry (max 5 retries)
 * - Auto-reconnect on disconnect
 * - Periodic ping for connection health
 * - Event handler registration
 */

type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

interface S3GatewayConfig {
  url?: string;
  token?: string;
  password?: string;
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  pingInterval?: number;
}

export class S3GatewayClient {
  private ws: any = null;
  private url: string;
  private token?: string;
  private password?: string;
  private maxRetries: number;
  private initialRetryDelay: number;
  private maxRetryDelay: number;
  private pingInterval: number;
  private retryCount: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingIntervalId: NodeJS.Timeout | null = null;
  private stabilityTimer: NodeJS.Timeout | null = null;
  private isIntentionalClose: boolean = false;
  private connectedAtMs: number | null = null;
  private sawMessageSinceOpen: boolean = false;
  private connectionStable: boolean = false;
  private connectNonce: string | null = null;
  private connectSent: boolean = false;
  private connectRequestId: string | null = null;
  private connectTimer: NodeJS.Timeout | null = null;

  // Event handlers
  private messageHandlers: Set<MessageHandler> = new Set();
  private openHandlers: Set<ConnectionHandler> = new Set();
  private closeHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  // EpiClaw client reference for message forwarding
  private epiClawClient: any = null;

  constructor(config: S3GatewayConfig = {}) {
    this.url = config.url || 'ws://localhost:18794';
    this.token = config.token;
    this.password = config.password;
    this.maxRetries = config.maxRetries || 5;
    this.initialRetryDelay = config.initialRetryDelay || 1000; // 1 second
    this.maxRetryDelay = config.maxRetryDelay || 30000; // 30 seconds
    this.pingInterval = config.pingInterval || 30000; // 30 seconds
  }

  /**
   * Set EpiClaw client for message forwarding
   */
  public setEpiClawClient(client: any): void {
    this.epiClawClient = client;
  }

  /**
   * Update connection settings. Use undefined/null to clear token/password.
   */
  public configure(config: { url?: string; token?: string | null; password?: string | null }): void {
    if (typeof config.url === 'string' && config.url.trim().length > 0) {
      this.url = config.url.trim();
    }
    if ('token' in config) {
      const token = config.token ?? undefined;
      this.token = token && token.trim().length > 0 ? token : undefined;
    }
    if ('password' in config) {
      const password = config.password ?? undefined;
      this.password = password && password.trim().length > 0 ? password : undefined;
    }
  }

  /**
   * Get the underlying WebSocket instance
   */
  public getWebSocket(): any {
    return this.ws;
  }

  /**
   * Connect to S3' gateway
   */
  public connect(): void {
    if (this.ws?.readyState === 1 || this.ws?.readyState === 0) {
      console.log('[S3Gateway] Already connected or connecting');
      return;
    }

    console.log(`[S3Gateway] Connecting to ${this.url}...`);
    this.isIntentionalClose = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => this.handleOpen());
      this.ws.on('message', (data: any) => this.handleMessage(data));
      this.ws.on('close', (code: number, reason: Buffer) => {
        this.handleClose(code, reason?.toString() || '');
      });
      this.ws.on('error', (error: Error) => this.handleError(error));
      this.ws.on('pong', () => this.handlePong());
    } catch (error) {
      console.error('[S3Gateway] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from S3' gateway
   */
  public disconnect(): void {
    console.log('[S3Gateway] Disconnecting...');
    this.isIntentionalClose = true;
    this.stopPing();
    this.stopStabilityTimer();
    this.stopConnectTimer();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === 1) {
        try {
          this.ws.close();
        } catch {
          // ignore close race errors
        }
      } else if (this.ws.readyState === 0) {
        try {
          // ws.close() may throw when CONNECTING; terminate safely instead.
          if (typeof this.ws.terminate === 'function') {
            this.ws.terminate();
          }
        } catch {
          // ignore termination race errors
        }
      }
      this.ws = null;
    }
  }

  /**
   * Send message to S3' gateway
   */
  public send(message: object): void {
    if (this.ws?.readyState === 1) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[S3Gateway] Error sending message:', error);
      }
    } else {
      console.warn('[S3Gateway] WebSocket not connected, cannot send message');
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === 1 && this.connectionStable;
  }

  /**
   * Register message handler
   */
  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Register connection open handler
   */
  public onOpen(handler: ConnectionHandler): void {
    this.openHandlers.add(handler);
  }

  /**
   * Register connection close handler
   */
  public onClose(handler: ConnectionHandler): void {
    this.closeHandlers.add(handler);
  }

  /**
   * Register error handler
   */
  public onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  /**
   * Remove message handler
   */
  public offMessage(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Remove connection open handler
   */
  public offOpen(handler: ConnectionHandler): void {
    this.openHandlers.delete(handler);
  }

  /**
   * Remove connection close handler
   */
  public offClose(handler: ConnectionHandler): void {
    this.closeHandlers.delete(handler);
  }

  /**
   * Remove error handler
   */
  public offError(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  // Private methods

  private handleOpen(): void {
    this.connectedAtMs = Date.now();
    this.sawMessageSinceOpen = false;
    this.connectionStable = false;
    this.connectNonce = null;
    this.connectSent = false;
    this.connectRequestId = null;
    this.stopConnectTimer();
    // Match OpenClaw UI behavior: attempt connect shortly after open even without challenge.
    this.connectTimer = setTimeout(() => {
      void this.sendConnectRequest();
    }, 750);
  }

  private handleMessage(data: any): void {
    try {
      const message = JSON.parse(data.toString());

      if (message?.type === 'event' && message?.event === 'connect.challenge') {
        const nonce = message?.payload?.nonce;
        if (typeof nonce === 'string' && nonce.length > 0) {
          this.connectNonce = nonce;
        }
        void this.sendConnectRequest();
        return;
      }

      if (
        message?.type === 'res' &&
        this.connectRequestId &&
        message?.id === this.connectRequestId
      ) {
        if (message?.ok) {
          this.markConnected();
        } else {
          const errMsg = message?.error?.message || 'connect failed';
          console.error(`[S3Gateway] Connect rejected: ${errMsg}`);
          this.errorHandlers.forEach(handler => {
            try {
              handler(new Error(errMsg));
            } catch {
              // ignore handler failures
            }
          });
          try {
            this.ws?.close(4008, 'connect failed');
          } catch {
            // ignore
          }
        }
        return;
      }

      this.sawMessageSinceOpen = true;

      // Forward to EpiClawClient if set
      if (this.epiClawClient && this.epiClawClient.handleMessage) {
        try {
          this.epiClawClient.handleMessage(data);
        } catch (error) {
          console.error('[S3Gateway] Error forwarding to EpiClaw:', error);
        }
      }

      // Notify handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[S3Gateway] Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('[S3Gateway] Error parsing message:', error);
    }
  }

  private handleClose(code: number, reason: string): void {
    const connectedForMs = this.connectedAtMs ? Date.now() - this.connectedAtMs : 0;
    console.log(`[S3Gateway] Connection closed (code=${code}, reason="${reason || 'n/a'}", uptime=${connectedForMs}ms)`);
    this.stopPing();
    this.stopStabilityTimer();
    this.stopConnectTimer();
    this.connectedAtMs = null;
    const hadUsableConnection = this.connectionStable || this.sawMessageSinceOpen;
    this.connectionStable = false;
    this.sawMessageSinceOpen = false;

    // Notify handlers
    this.closeHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('[S3Gateway] Error in close handler:', error);
      }
    });

    // Attempt reconnect if not intentional close and close code is retryable.
    if (!this.isIntentionalClose && this.shouldReconnect(code)) {
      // Only reset retry counter after a usable, non-flaky connection.
      if (hadUsableConnection) {
        this.retryCount = 0;
      }
      this.scheduleReconnect();
    }
  }

  private handleError(error: Error): void {
    console.error('[S3Gateway] WebSocket error:', error);

    // Notify handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        console.error('[S3Gateway] Error in error handler:', err);
      }
    });
  }

  private handlePong(): void {
    // Connection is healthy
    // Could track last pong time for monitoring
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      console.error(`[S3Gateway] Max retries (${this.maxRetries}) reached. Giving up.`);
      return;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.initialRetryDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay
    );

    this.retryCount++;
    console.log(
      `[S3Gateway] Reconnecting in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})...`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingIntervalId = setInterval(() => {
      if (this.ws?.readyState === 1) {
        try {
          if (typeof this.ws.ping === 'function') {
            this.ws.ping();
          }
        } catch (error) {
          console.error('[S3Gateway] Error sending ping:', error);
        }
      }
    }, this.pingInterval);
  }

  private stopPing(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private stopStabilityTimer(): void {
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }
  }

  private stopConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private async sendConnectRequest(): Promise<void> {
    if (!this.ws || this.ws.readyState !== 1 || this.connectSent) {
      return;
    }
    this.connectSent = true;
    this.stopConnectTimer();
    const reqId = this.generateRequestId();
    this.connectRequestId = reqId;
    const hasToken = Boolean(this.token && this.token.trim().length > 0);
    const hasPassword = Boolean(this.password && this.password.trim().length > 0);
    console.log(
      `[S3Gateway] Sending connect handshake (id=${reqId}, token=${hasToken}, password=${hasPassword})`
    );
    const frame = {
      type: 'req',
      id: reqId,
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'cli',
          version: '0.1.0',
          platform: process.platform || 'electron-main',
          mode: 'backend',
          instanceId: this.generateRequestId(),
        },
        role: 'operator',
        scopes: ['operator.admin', 'operator.approvals', 'operator.pairing'],
        caps: [],
        auth:
          this.token || this.password
            ? {
                token: this.token,
                password: this.password,
              }
            : undefined,
        userAgent: 'epi-logos-main',
        locale: 'en-US',
      },
    };
    try {
      this.ws.send(JSON.stringify(frame));
    } catch (error) {
      console.error('[S3Gateway] Error sending connect request:', error);
      this.connectSent = false;
    }
  }

  private markConnected(): void {
    if (this.connectionStable) {
      return;
    }
    this.connectionStable = true;
    this.retryCount = 0;
    this.stopStabilityTimer();
    this.startPing();
    console.log('[S3Gateway] ✓ S3\' gateway connected');
    this.openHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('[S3Gateway] Error in open handler:', error);
      }
    });
  }

  private generateRequestId(): string {
    return `s3-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private shouldReconnect(closeCode: number): boolean {
    // Policy/auth/application-level rejections should not trigger blind reconnect loops.
    const nonRetryableCloseCodes = new Set([
      1008, // policy violation
      4001, // app-auth related
      4003, // forbidden
      4008, // connect failed
      4401, // unauthorized
      4403, // forbidden
    ]);
    if (nonRetryableCloseCodes.has(closeCode)) {
      console.error(`[S3Gateway] Non-retryable close code ${closeCode}; auto-reconnect disabled`);
      return false;
    }
    return true;
  }
}
