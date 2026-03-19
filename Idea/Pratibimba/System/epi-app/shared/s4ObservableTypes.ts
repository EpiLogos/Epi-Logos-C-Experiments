/**
 * S3' Observable Event Types
 *
 * TypeScript definitions for AgentObservableEvent schema from S3' Gateway.
 * These types enable real-time streaming of agent lifecycle events to the Omni Panel.
 *
 * Based on: epi-cli/src/gate/ (Rust S3' gateway)
 */

// Constitutional positions in CFP (Context Frame Protocol)
export type ConstitutionalPosition =
  | 'VOID'      // #0 - Ground/Foundation
  | 'SENT'      // #1 - Direction/Intention
  | 'SPARSHA'   // #2 - Touch/Contact
  | 'RUPA'      // #3 - Form/Structure
  | 'RASA'      // #4 - Essence/Taste
  | 'SCENT';    // #5 - Synthesis/Integration

// Hook event types from S3' gateway infrastructure
export type HookEventType =
  // Session lifecycle
  | 'SESSION_START'
  | 'SESSION_STOP'
  | 'SESSION_CREATED'
  | 'SESSION_ENDED'
  | 'PRE_TOOL_USE'
  | 'POST_TOOL_USE'
  | 'TOOL_INVOKED'
  | 'OPERATION_COMPLETED'
  | 'USER_PROMPT_SUBMIT'
  // Agent operations
  | 'AGENT_EXECUTED'
  | 'AGENT_MODULATION'
  | 'AGENT_MODULATED'
  | 'CONTEXT_LOADED'
  | 'ROUTING_DECISION'
  | 'TASK_ROUTED'
  // Frame/Phase tracking
  | 'FRAME_CHANGE'
  | 'CFP_PHASE_CHANGED'
  | 'CFP_STATE_UPDATE'
  | 'CFP_STATE_UPDATED'
  | 'SUBAGENT_SPAWNED'
  | 'SUBAGENT_COMPLETED'
  // Knowledge graph
  | 'NODE_CREATED'
  | 'KNOWLEDGE_CREATED'
  | 'RELATIONSHIP_CREATED'
  | 'EMBEDDING_GENERATED'
  | 'SEMANTIC_INDEXED'
  | 'COORDINATE_VALIDATED'
  // Skills/Commands
  | 'SKILL_INVOKED'
  | 'COMMAND_EXECUTED'
  | 'CACHE_POPULATED'
  | 'CACHE_QUERIED'
  | 'CACHE_ACCESSED'
  // Learning/Reflection
  | 'LEARNING_EXTRACTED'
  | 'CRYSTALLIZATION'
  | 'LEARNING_CRYSTALLIZED'
  | 'MOBIUS_RETURN'
  | 'MOBIUS_RETURN_COMPLETED'
  | 'THOUGHT_STORED'
  | 'THOUGHT_RECORDED'
  | 'BIMBA_ENRICHED'
  | 'KNOWLEDGE_ENRICHED'
  // General
  | 'ENVIRONMENT_VERIFICATION'
  | 'ERROR_OCCURRED'
  | 'OPERATION_SUCCESS';

// CFP phase information
export interface CurrentPhase {
  phase: number;            // S4' gateway phase (4.0-4.5)
  position: number;         // QL position (#0-#5)
  constitutional: ConstitutionalPosition;
}

// Observable Context - agent metadata and CFP phase
export interface M5Observable {
  agent_name?: string;      // e.g., 'nous', 'psyche', 'eros'
  agent_type?: string;      // e.g., 'holographic', 'coordinator'
  model?: string;           // e.g., 'claude-sonnet-4-5', 'gemini-3.0-flash'
  current_phase: CurrentPhase;
  thought_type?: string;    // e.g., 'observation', 'synthesis', 'verification'
}

// Main observable event schema
export interface AgentObservableEvent {
  type: HookEventType;
  timestamp: string;        // ISO datetime string
  session_id: string;
  agent_id?: string;
  payload: Record<string, unknown>;
  m5_observable: M5Observable;
  extensions?: Record<string, unknown>;
}

// Agent types for task delegation
export type AgentType = 'nous' | 'logos' | 'eros' | 'mythos' | 'psyche' | 'sophia';

// Outbound message types (Electron → S3' Gateway)
export interface DelegateTaskMessage {
  type: 'DELEGATE_TASK';
  payload: {
    agent: AgentType;
    task: string;
    context_frame?: string;
  };
}

// Inbound response types (S3' Gateway → Electron)
export interface TaskAcknowledgedResponse {
  type: 'TASK_ACKNOWLEDGED';
  task_id: string;
  agent: AgentType;
  message: string;
}

export interface ErrorResponse {
  type: 'ERROR';
  category: string;
  message: string;
  details?: Record<string, unknown>;
}

// WebSocket API for S3' gateway
export interface S3GatewayAPI {
  isConnected: () => Promise<boolean>;
  send: (message: object) => Promise<void>;
  onMessage: (callback: (message: AgentObservableEvent) => void) => () => void;
  onConnected: (callback: () => void) => () => void;
  onDisconnected: (callback: () => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
}
