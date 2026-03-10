/**
 * Epi-Claw Gateway Protocol Handler
 *
 * Implements OpenClaw gateway protocol for communication with epi-claw gateway.
 * Handles request/response correlation and event stream parsing.
 *
 * Gateway Request Format:
 * {
 *   type: "req",
 *   id: string (UUID),
 *   method: string,
 *   params: object
 * }
 *
 * Gateway Response Format:
 * {
 *   type: "res",
 *   id: string (UUID),
 *   ok: boolean,
 *   payload: any,
 *   error?: { code: string, message: string, data?: any }
 * }
 *
 * Event Frame Format (epi-claw specific):
 * {
 *   type: "event",
 *   event: string,
 *   payload: any
 * }
 */

export interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface GatewayResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: {
    code: string;
    message: string;
    data?: unknown;
  };
}

export interface EventFrame {
  type: 'event';
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: {
    presence: number;
    health: number;
  };
}

export type GatewayMessage = GatewayRequest | GatewayResponse | EventFrame;

// Backward compatibility aliases
export type JsonRpcRequest = GatewayRequest;
export type JsonRpcResponse = GatewayResponse;
export type JsonRpcMessage = GatewayMessage;

/**
 * Gateway Protocol Client
 *
 * Manages request/response correlation and message serialization.
 */
export class JsonRpcClient {
  private messageId: number = 0;
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private requestTimeout: number;

  constructor(requestTimeout: number = 30000) {
    this.requestTimeout = requestTimeout;
  }

  /**
   * Generate a unique request ID (UUID string)
   */
  private generateId(): string {
    const { randomUUID } = require('crypto');
    return randomUUID();
  }

  /**
   * Create a gateway protocol request
   */
  public createRequest(method: string, params?: Record<string, unknown>): GatewayRequest {
    return {
      type: 'req',
      id: this.generateId(),
      method,
      params,
    };
  }

  /**
   * Serialize a request to JSON string
   */
  public serializeRequest(method: string, params?: Record<string, unknown>): string {
    const request = this.createRequest(method, params);
    return JSON.stringify(request);
  }

  /**
   * Parse incoming message and determine its type
   */
  public parseMessage(data: string): GatewayMessage {
    try {
      const message = JSON.parse(data) as GatewayMessage;

      // Validate basic structure
      if (!message) {
        throw new Error('Empty message');
      }

      // Check if it's an event frame (epi-claw specific)
      if ('type' in message && message.type === 'event') {
        return message as EventFrame;
      }

      // Check if it's a gateway response
      if ('type' in message && message.type === 'res') {
        return message as GatewayResponse;
      }

      throw new Error('Invalid message format');
    } catch (error) {
      throw new Error(`Failed to parse message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a request and return a promise that resolves with the response
   * This method expects the caller to handle the actual WebSocket send
   */
  public sendRequest(
    method: string,
    sendFn: (requestString: string) => void,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    const request = this.createRequest(method, params);
    const requestString = JSON.stringify(request);

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout: ${method} (${this.requestTimeout}ms)`));
      }, this.requestTimeout);

      // Store pending request
      this.pendingRequests.set(request.id, { resolve, reject, timeout });

      // Send the request
      try {
        sendFn(requestString);
      } catch (error) {
        // Clean up if send fails
        this.pendingRequests.delete(request.id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Handle an incoming response
   * Returns true if the response was matched to a pending request
   */
  public handleResponse(response: GatewayResponse): boolean {
    const pending = this.pendingRequests.get(response.id);

    if (!pending) {
      // Response for unknown request - could be a stale response
      return false;
    }

    // Clear timeout
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    // Resolve or reject based on response
    if (!response.ok || response.error) {
      const errorMsg = response.error?.message || 'Unknown error';
      pending.reject(new Error(`Gateway Error: ${errorMsg}`));
    } else {
      pending.resolve(response.payload);
    }

    return true;
  }

  /**
   * Check if a message is a response
   */
  public isResponse(message: GatewayMessage): message is GatewayResponse {
    return 'type' in message && message.type === 'res' && 'id' in message;
  }

  /**
   * Check if a message is an event
   */
  public isEvent(message: GatewayMessage): message is EventFrame {
    return 'type' in message && message.type === 'event';
  }

  /**
   * Clean up all pending requests (call on disconnect)
   */
  public cleanup(): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Get count of pending requests
   */
  public getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

/**
 * Helper function to create method-specific request builders
 */
export function createMethodBuilder(client: JsonRpcClient) {
  return {
    /**
     * Agent method - send a chat message
     */
    agent: (message: string, sessionKey?: string) => {
      const params: Record<string, unknown> = { message };
      if (sessionKey) {
        params.sessionKey = sessionKey;
      }
      return client.createRequest('agent', params);
    },

    /**
     * Sessions list method
     */
    sessionsList: () => {
      return client.createRequest('sessions.list', {});
    },

    /**
     * Sessions delete method
     */
    sessionsDelete: (sessionKey: string) => {
      return client.createRequest('sessions.delete', { sessionKey });
    },

    /**
     * Config get method
     */
    configGet: (key?: string) => {
      return client.createRequest('config', key ? { key } : {});
    },

    /**
     * Config set method
     */
    configSet: (key: string, value: unknown) => {
      return client.createRequest('config', { key, value });
    },

    /**
     * Subscribe to events
     */
    subscribe: (event: string) => {
      return client.createRequest('events.subscribe', { event });
    },

    /**
     * Unsubscribe from events
     */
    unsubscribe: (event: string) => {
      return client.createRequest('events.unsubscribe', { event });
    },
  };
}
