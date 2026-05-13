import { invoke } from './invoke';
import { listen } from '@tauri-apps/api/event';
import type {
  AgentDescriptor,
  AgentRunHandle,
  AgentRunEvent,
  InvocationEnvelope,
} from './types';

export const agentExecutionClient = {
  list: () => invoke<AgentDescriptor[]>('agent_list'),
  invoke: (envelope: InvocationEnvelope) =>
    invoke<AgentRunHandle>('agent_invoke', { envelope }),
  runState: (runId: string) => invoke<unknown>('agent_run_state', { runId }),
  abort: (runId: string) => invoke<void>('agent_abort', { runId }),
  onRunEvent: (runId: string, cb: (e: AgentRunEvent) => void) =>
    listen<AgentRunEvent>(`agent:run:${runId}`, (e) => cb(e.payload)),
};
