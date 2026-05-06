/**
 * S3' Observability Store
 *
 * Manages real-time observable events from S3' gateway via WebSocket.
 * Tracks agent lifecycle, operations history, CFP phase changes, and session state.
 */

import { create } from 'zustand';
import {
  AgentObservableEvent,
  HookEventType,
  TaskAcknowledgedResponse,
  ErrorResponse,
  AgentType,
} from '../../shared/s4ObservableTypes';

interface ObservabilityState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Current session state
  sessionId: string | null;
  sessionStarted: Date | null;
  agentName: string | null;
  currentPhase: {
    phase: number;
    position: number;
    constitutional: string;
  } | null;

  // Operation history (last 10 operations)
  operations: Array<{
    timestamp: Date;
    type: HookEventType;
    operation: string;
    status: 'success' | 'failure' | 'pending';
  }>;

  // Recent events (last 50 for debugging)
  recentEvents: AgentObservableEvent[];

  // Error events (last 10)
  errorEvents: Array<{
    timestamp: Date;
    type: HookEventType;
    message: string;
    details?: unknown;
  }>;

  // Task delegation state
  delegationStatus: {
    type: 'success' | 'error';
    message: string;
    taskId?: string;
  } | null;

  lastDelegatedTask: {
    agent: AgentType;
    task: string;
    timestamp: Date;
    taskId?: string;
  } | null;

  // Actions
  handleMessage: (event: AgentObservableEvent | TaskAcknowledgedResponse | ErrorResponse) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  clearSession: () => void;
  clearDelegationStatus: () => void;
}

export const useObservabilityStore = create<ObservabilityState>((set, get) => ({
  // Initial state
  isConnected: false,
  connectionError: null,
  sessionId: null,
  sessionStarted: null,
  agentName: null,
  currentPhase: null,
  operations: [],
  recentEvents: [],
  errorEvents: [],
  delegationStatus: null,
  lastDelegatedTask: null,

  // Handle incoming observable event or response
  handleMessage: (event: AgentObservableEvent | TaskAcknowledgedResponse | ErrorResponse) => {
    // Handle TASK_ACKNOWLEDGED response
    if (event.type === 'TASK_ACKNOWLEDGED') {
      const ackEvent = event as TaskAcknowledgedResponse;
      set({
        delegationStatus: {
          type: 'success',
          message: `Task delegated to ${ackEvent.agent}`,
          taskId: ackEvent.task_id,
        },
        lastDelegatedTask: {
          agent: ackEvent.agent,
          task: ackEvent.message || 'Task delegated',
          timestamp: new Date(),
          taskId: ackEvent.task_id,
        },
      });

      // Clear delegation status after 5 seconds
      setTimeout(() => {
        set({ delegationStatus: null });
      }, 5000);

      return;
    }

    // Handle ERROR response
    if (event.type === 'ERROR') {
      const errorEvent = event as ErrorResponse;
      set({
        delegationStatus: {
          type: 'error',
          message: errorEvent.message,
        },
      });

      // Clear delegation status after 10 seconds
      setTimeout(() => {
        set({ delegationStatus: null });
      }, 10000);

      return;
    }

    // Handle regular observable event
    const observableEvent = event as AgentObservableEvent;
    const state = get();

    // Add to recent events (keep last 50)
    const recentEvents = [observableEvent, ...state.recentEvents].slice(0, 50);

    // Extract common data
    const timestamp = new Date(observableEvent.timestamp);
    const { type, session_id, m5_observable, payload } = observableEvent;

    // Update session info
    let sessionId = state.sessionId;
    let sessionStarted = state.sessionStarted;
    let agentName = state.agentName;
    let currentPhase = state.currentPhase;

    // Session lifecycle events
    if (type === 'SESSION_CREATED' || type === 'SESSION_START') {
      sessionId = session_id;
      sessionStarted = timestamp;
    } else if (type === 'SESSION_ENDED' || type === 'SESSION_STOP') {
      // Keep session info visible after end
    }

    // Update agent name
    if (m5_observable?.agent_name) {
      agentName = m5_observable.agent_name;
    }

    // Update current phase
    if (m5_observable?.current_phase) {
      currentPhase = {
        phase: m5_observable.current_phase.phase,
        position: m5_observable.current_phase.position,
        constitutional: m5_observable.current_phase.constitutional,
      };
    }

    // Add to operations history
    let operations = [...state.operations];
    const isOperationEvent =
      type === 'OPERATION_COMPLETED' ||
      type === 'TOOL_INVOKED' ||
      type === 'AGENT_EXECUTED' ||
      type === 'COMMAND_EXECUTED' ||
      type === 'SKILL_INVOKED';

    if (isOperationEvent) {
      const operationName =
        (payload.tool_name as string) ||
        (payload.operation as string) ||
        (payload.command as string) ||
        (payload.skill as string) ||
        type;

      const status: 'success' | 'failure' | 'pending' =
        type === 'OPERATION_COMPLETED' ? 'success' :
          type === 'ERROR_OCCURRED' ? 'failure' : 'pending';

      operations = [
        {
          timestamp,
          type,
          operation: operationName,
          status,
        },
        ...operations
      ].slice(0, 10); // Keep last 10
    }

    // Handle error events
    let errorEvents = [...state.errorEvents];
    if (type === 'ERROR_OCCURRED') {
      errorEvents = [
        {
          timestamp,
          type,
          message: (payload.message as string) || 'Unknown error',
          details: payload.details,
        },
        ...errorEvents
      ].slice(0, 10); // Keep last 10
    }

    set({
      recentEvents,
      sessionId,
      sessionStarted,
      agentName,
      currentPhase,
      operations,
      errorEvents,
    });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected, connectionError: null });
  },

  setConnectionError: (error: string | null) => {
    set({ connectionError: error });
  },

  clearSession: () => {
    set({
      sessionId: null,
      sessionStarted: null,
      agentName: null,
      currentPhase: null,
      operations: [],
      recentEvents: [],
      errorEvents: [],
      delegationStatus: null,
      lastDelegatedTask: null,
    });
  },

  clearDelegationStatus: () => {
    set({ delegationStatus: null });
  },
}));
