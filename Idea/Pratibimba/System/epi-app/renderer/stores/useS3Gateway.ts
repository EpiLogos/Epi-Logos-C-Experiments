/**
 * S3' Gateway WebSocket Hook
 *
 * React hook that subscribes to S3' WebSocket messages and updates the observability store.
 * Handles connection lifecycle, message parsing, and cleanup.
 */

import { useEffect } from 'react';
import { useObservabilityStore } from './observabilityStore';
import { AgentObservableEvent } from '../../shared/s4ObservableTypes';

/**
 * Subscribe to S3' Gateway WebSocket messages and update observability store
 *
 * This hook should be called once at the app root level to establish
 * the WebSocket subscription for the entire app lifecycle.
 */
export function useS3Gateway() {
  const {
    handleMessage,
    setConnected,
    setConnectionError,
  } = useObservabilityStore();

  useEffect(() => {
    // Check if S3' WebSocket API is available
    if (!window.sPrime?.s3?.websocket) {
      console.warn('[S3Gateway] S3\' WebSocket API not available');
      return;
    }

    const ws = window.sPrime.s3.websocket;

    // Message handler - parse and forward to store
    const handleRawMessage = (message: unknown) => {
      try {
        // Message should already be parsed JSON from main process
        const event = message as AgentObservableEvent;

        // Basic validation
        if (!event.type || !event.timestamp || !event.session_id) {
          console.warn('[S3Gateway] Invalid event structure:', event);
          return;
        }

        // Forward to observability store
        handleMessage(event);
      } catch (error) {
        console.error('[S3Gateway] Error processing message:', error);
        setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Connection handlers
    const handleConnected = () => {
      console.log('[S3Gateway] Connected to S3\' gateway');
      setConnected(true);
    };

    const handleDisconnected = () => {
      console.log('[S3Gateway] Disconnected from S3\' gateway');
      setConnected(false);
    };

    const handleError = (error: string) => {
      console.error('[S3Gateway] Error:', error);
      setConnectionError(error);
    };

    // Subscribe to events
    const unsubscribeMessage = ws.onMessage(handleRawMessage);
    const unsubscribeConnected = ws.onConnected(handleConnected);
    const unsubscribeDisconnected = ws.onDisconnected(handleDisconnected);
    const unsubscribeError = ws.onError(handleError);

    // Check initial connection state
    ws.isConnected().then(connected => {
      setConnected(connected);
    }).catch(error => {
      console.error('[S3Gateway] Error checking connection:', error);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, [handleMessage, setConnected, setConnectionError]);
}
