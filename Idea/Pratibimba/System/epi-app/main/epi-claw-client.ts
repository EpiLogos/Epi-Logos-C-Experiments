import { JsonRpcClient, JsonRpcResponse, EventFrame, createMethodBuilder, type JsonRpcRequest } from './epi-claw-rpc.js';
import { READY_STATE_OPEN } from './ws-wrapper.js';

/**
 * Epi-Claw Client (shares S4' WebSocket connection)
 *
 * Uses the existing S4' WebSocket connection instead of creating a separate one.
 * Provides JSON-RPC 2.0 protocol support for Epi-Claw gateway communication.
 *
 * Features:
 * - JSON-RPC 2.0 request/response correlation
 * - Event stream handling
 * - Method-specific helpers
 * - No separate WebSocket connection (shares S4')
 */

type MessageHandler = (data: unknown) => void;
type EventHandler = (event: EventFrame) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

export type { MessageHandler, ConnectionHandler, ErrorHandler };

interface EpiClawClientConfig {
  // Get the S4' WebSocket instance (must be already connected)
  getWebSocket: () => any | null;
  requestTimeout?: number;
}

export class EpiClawClient {
  private getWebSocket: () => any | null;
  private connectionState: 'disconnected' | 'connected' = 'disconnected';

  // JSON-RPC client
  private rpc: JsonRpcClient;

  // Event handlers
  private messageHandlers: Set<MessageHandler> = new Set();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private openHandlers: Set<ConnectionHandler> = new Set();
  private closeHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private eventSubscriptionUnsupported = false;

  // Method builders
  public methods: ReturnType<typeof createMethodBuilder>;

  constructor(config: EpiClawClientConfig) {
    this.getWebSocket = config.getWebSocket;

    // Initialize JSON-RPC client
    this.rpc = new JsonRpcClient(config.requestTimeout || 30000);

    // Create method helpers
    this.methods = createMethodBuilder(this.rpc);

    // Start connection check
    this.checkConnection();
  }

  private get ws() {
    return this.getWebSocket();
  }

  private checkConnection(): void {
    const ws = this.ws;
    if (ws && ws.readyState === READY_STATE_OPEN && this.connectionState === 'disconnected') {
      console.log('[EpiClaw] Using S4\' WebSocket connection');
      this.connectionState = 'connected';

      // Notify handlers
      this.openHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('[EpiClaw] Error in open handler:', error);
        }
      });
    }
  }

  /**
   * Connect to epi-claw gateway (via S4' WebSocket)
   */
  public connect(): void {
    this.checkConnection();
  }

  /**
   * Disconnect from epi-claw gateway
   */
  public disconnect(): void {
    console.log('[EpiClaw] Disconnecting...');
    this.connectionState = 'disconnected';

    // Clean up pending RPC requests
    this.rpc.cleanup();
  }

  /**
   * Send raw message (for backward compatibility)
   */
  public send(message: object): void {
    const ws = this.ws;
    if (ws && ws.readyState === READY_STATE_OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[EpiClaw] Error sending message:', error);
      }
    } else {
      console.warn('[EpiClaw] WebSocket not connected, cannot send message');
    }
  }

  /**
   * Send JSON-RPC request and wait for response
   */
  public async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const ws = this.ws;
    if (!ws || ws.readyState !== READY_STATE_OPEN) {
      throw new Error('WebSocket not connected');
    }

    return this.rpc.sendRequest(method, (requestString) => {
      ws.send(requestString);
    }, params);
  }

  /**
   * Subscribe to an event stream
   */
  public async subscribe(event: string, handler: EventHandler): Promise<void> {
    // Add local handler
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Some gateways emit events without explicit subscribe/unsubscribe RPC methods.
    if (this.eventSubscriptionUnsupported) {
      return;
    }

    try {
      await this.request('events.subscribe', { event });
      console.log(`[EpiClaw] Subscribed to event: ${event}`);
    } catch (error) {
      if (isUnknownMethodError(error, 'events.subscribe')) {
        this.eventSubscriptionUnsupported = true;
        console.warn('[EpiClaw] events.subscribe unsupported by gateway; using passive event stream mode');
        return;
      }
      console.error(`[EpiClaw] Failed to subscribe to ${event}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from an event stream
   */
  public async unsubscribe(event: string, handler: EventHandler): Promise<void> {
    // Remove local handler
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    // Unsubscribe from gateway events if no more local handlers
    if (!this.eventHandlers.has(event) && !this.eventSubscriptionUnsupported) {
      try {
        await this.request('events.unsubscribe', { event });
        console.log(`[EpiClaw] Unsubscribed from event: ${event}`);
      } catch (error) {
        if (isUnknownMethodError(error, 'events.unsubscribe')) {
          this.eventSubscriptionUnsupported = true;
          console.warn('[EpiClaw] events.unsubscribe unsupported by gateway; passive mode remains enabled');
          return;
        }
        console.error(`[EpiClaw] Failed to unsubscribe from ${event}:`, error);
      }
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    const ws = this.ws;
    return ws !== null && ws.readyState === READY_STATE_OPEN && this.connectionState === 'connected';
  }

  /**
   * Get connection state
   */
  public getConnectionState(): 'disconnected' | 'connected' {
    return this.connectionState;
  }

  /**
   * Get pending RPC request count
   */
  public getPendingRequestCount(): number {
    return this.rpc.getPendingCount();
  }

  // Event handler registration

  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  public onEvent(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public onOpen(handler: ConnectionHandler): void {
    this.openHandlers.add(handler);
  }

  public onClose(handler: ConnectionHandler): void {
    this.closeHandlers.add(handler);
  }

  public onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  public offMessage(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  public offEvent(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public offOpen(handler: ConnectionHandler): void {
    this.openHandlers.delete(handler);
  }

  public offClose(handler: ConnectionHandler): void {
    this.closeHandlers.delete(handler);
  }

  public offError(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  /**
   * Handle incoming message from S4' WebSocket
   * Called by S4' client when it receives a message
   */
  public handleMessage(data: any): void {
    try {
      const messageString = data.toString();
      const message = JSON.parse(messageString) as any;

      // Handle JSON-RPC responses
      if (this.rpc.isResponse(message)) {
        const handled = this.rpc.handleResponse(message as JsonRpcResponse);
        if (!handled) {
          // Might be for EpiClaw, pass to handlers
          console.debug('[EpiClaw] Received response for unknown request');
        }
        return;
      }

      // Handle event frames
      if (message.type === 'event') {
        const event = message as EventFrame;
        this.handleEvent(event);
        return;
      }

      // Pass to generic message handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[EpiClaw] Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('[EpiClaw] Error parsing message:', error);
    }
  }

  private handleEvent(event: EventFrame): void {
    // Notify event-specific handlers
    const handlers = this.eventHandlers.get(event.event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EpiClaw] Error in ${event.event} handler:`, error);
        }
      });
    }

    // Also notify generic message handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[EpiClaw] Error in message handler:', error);
      }
    });
  }
}

function isUnknownMethodError(error: unknown, methodName: string): boolean {
  const text = String(error ?? '').toLowerCase();
  return text.includes('unknown method') && text.includes(methodName.toLowerCase());
}
