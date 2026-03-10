/**
 * WebSocket wrapper for Node.js
 * Ensures we get the real 'ws' package, not the browser mock
 */

// Use require to avoid bundler issues
const wsModule = require('ws');

// Export the WebSocket class
export const WebSocket = wsModule.WebSocket;

// ReadyState constants
export const READY_STATE_CONNECTING = 0;
export const READY_STATE_OPEN = 1;
export const READY_STATE_CLOSING = 2;
export const READY_STATE_CLOSED = 3;

// Re-export types
export type { WebSocketServer, Data, ClientOptions, PerMessageDeflateOptions } from 'ws';
