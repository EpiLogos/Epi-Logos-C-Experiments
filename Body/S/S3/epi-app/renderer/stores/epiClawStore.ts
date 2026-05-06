/**
 * Epi-Claw Store
 *
 * Manages Epi-Claw JSON-RPC 2.0 gateway integration.
 * Handles chat messages, sessions, and connection state.
 */

import { create } from 'zustand';
import { useEffect } from 'react';

// Message types for chat interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  pending?: boolean; // For user messages awaiting response
}

// Session information from gateway
export interface EpiClawSession {
  sessionKey: string;
  createdAt: Date;
  lastActive: Date;
  messageCount: number;
  status: 'active' | 'archived';
}

// Connection state
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface EpiClawState {
  // Connection state
  connectionState: ConnectionState;
  connectionError: string | null;

  // Chat state
  messages: ChatMessage[];
  isSending: boolean;
  currentSessionKey: string | null;

  // Sessions state
  sessions: EpiClawSession[];
  isLoadingSessions: boolean;

  // Actions
  setConnectionState: (state: ConnectionState) => void;
  setConnectionError: (error: string | null) => void;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  loadSessions: () => Promise<void>;
  switchSession: (sessionKey: string) => void;
  createNewSession: () => Promise<void>;
  deleteSession: (sessionKey: string) => Promise<void>;
}

export const useEpiClawStore = create<EpiClawState>((set, get) => ({
  // Initial state
  connectionState: 'disconnected',
  connectionError: null,
  messages: [],
  isSending: false,
  currentSessionKey: null,
  sessions: [],
  isLoadingSessions: false,

  setConnectionState: (state) => set({ connectionState: state }),

  setConnectionError: (error) => set({ connectionError: error }),

  sendMessage: async (message: string) => {
    const state = get();

    if (!message.trim() || state.isSending) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      pending: true,
    };

    // Add user message to chat
    set({ messages: [...state.messages, userMessage], isSending: true });

    try {
      // Check if Epi-Claw API is available
      if (!window.sPrime?.epiClaw) {
        throw new Error('Epi-Claw API not available');
      }

      // Send message via JSON-RPC
      const result = await window.sPrime.epiClaw.agent(message, state.currentSessionKey || undefined);

      // Update user message (no longer pending)
      set({
        messages: state.messages.map(msg =>
          msg.id === userMessage.id ? { ...msg, pending: false } : msg
        )
      });

      // Process response
      if (result && result.success) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: result.result?.response || JSON.stringify(result.result),
          timestamp: new Date(),
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
        }));

        // Update session if new session was created
        if (result.result?.sessionKey && !state.currentSessionKey) {
          set({ currentSessionKey: result.result.sessionKey });
        }
      } else {
        throw new Error(result?.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Remove pending user message and show error
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== userMessage.id),
        connectionError: error instanceof Error ? error.message : 'Unknown error',
      }));

      // Clear error after 5 seconds
      setTimeout(() => set({ connectionError: null }), 5000);
    } finally {
      set({ isSending: false });
    }
  },

  addMessage: (message) => {
    set(state => ({ messages: [...state.messages, message] }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  loadSessions: async () => {
    set({ isLoadingSessions: true });

    try {
      if (!window.sPrime?.epiClaw) {
        throw new Error('Epi-Claw API not available');
      }

      const result = await window.sPrime.epiClaw.sessionsList();

      if (result && result.success) {
        const sessions: EpiClawSession[] = (result.result?.sessions || []).map((session: any) => ({
          sessionKey: session.sessionKey || session.key,
          createdAt: new Date(session.createdAt || session.created),
          lastActive: new Date(session.lastActive || session.updated),
          messageCount: session.messageCount || session.count || 0,
          status: session.status || 'active',
        }));

        set({ sessions });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      set({ connectionError: error instanceof Error ? error.message : 'Failed to load sessions' });
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  switchSession: (sessionKey: string) => {
    set({ currentSessionKey: sessionKey, messages: [] });
    // TODO: Load session history from gateway
  },

  createNewSession: async () => {
    set({ currentSessionKey: null, messages: [] });

    // Create a temporary session key - will be finalized by gateway on first message
    const tempSessionKey = `temp-${Date.now()}`;
    set({ currentSessionKey: tempSessionKey });
  },

  deleteSession: async (sessionKey: string) => {
    try {
      if (!window.sPrime?.epiClaw) {
        throw new Error('Epi-Claw API not available');
      }

      const result = await window.sPrime.epiClaw.sessionsDelete(sessionKey);

      if (result && result.success) {
        // Remove session from list
        set(state => ({
          sessions: state.sessions.filter(s => s.sessionKey !== sessionKey),
        }));

        // If deleted session was current, clear current
        if (get().currentSessionKey === sessionKey) {
          set({ currentSessionKey: null, messages: [] });
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      set({ connectionError: error instanceof Error ? error.message : 'Failed to delete session' });
    }
  },
}));

// Hook to initialize Epi-Claw connection monitoring
export function useEpiClawConnection() {
  const { setConnectionState, setConnectionError, connectionState } = useEpiClawStore();

  useEffect(() => {
    if (!window.sPrime?.epiClaw) {
      console.warn('Epi-Claw API not available');
      return;
    }

    // Check initial connection state
    const checkConnection = async () => {
      try {
        const connected = await window.sPrime.epiClaw.isConnected();
        setConnectionState(connected ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionState('error');
        setConnectionError(error instanceof Error ? error.message : 'Connection check failed');
      }
    };

    checkConnection();

    // Subscribe to connection events
    const unsubscribeConnected = window.sPrime.epiClaw.onConnected(() => {
      setConnectionState('connected');
      setConnectionError(null);
    });

    const unsubscribeDisconnected = window.sPrime.epiClaw.onDisconnected(() => {
      setConnectionState('disconnected');
    });

    const unsubscribeError = window.sPrime.epiClaw.onError((error) => {
      setConnectionState('error');
      setConnectionError(error);
    });

    // Cleanup
    return () => {
      unsubscribeConnected?.();
      unsubscribeDisconnected?.();
      unsubscribeError?.();
    };
  }, [setConnectionState, setConnectionError]);

  return { connectionState };
}

// Extend Window interface for Epi-Claw API
declare global {
  interface Window {
    sPrime: {
      epiClaw?: {
        isConnected: () => Promise<boolean>;
        getConnectionState: () => Promise<ConnectionState>;
        request: (method: string, params?: Record<string, unknown>) => Promise<{ success: boolean; result?: unknown; error?: string }>;
        agent: (message: string, sessionKey?: string) => Promise<{ success: boolean; result?: any; error?: string }>;
        sessionsList: () => Promise<{ success: boolean; result?: { sessions: unknown[] }; error?: string }>;
        sessionsDelete: (sessionKey: string) => Promise<{ success: boolean; error?: string }>;
        configGet: (key?: string) => Promise<{ success: boolean; result?: unknown; error?: string }>;
        configSet: (key: string, value: unknown) => Promise<{ success: boolean; result?: unknown; error?: string }>;
        subscribe: (event: string, callback: (frame: unknown) => void) => () => void;
        unsubscribe: (event: string) => Promise<{ success: boolean; error?: string }>;
        onConnected: (callback: () => void) => () => void;
        onDisconnected: (callback: () => void) => () => void;
        onError: (callback: (error: string) => void) => () => void;
      };
    };
  }
}
