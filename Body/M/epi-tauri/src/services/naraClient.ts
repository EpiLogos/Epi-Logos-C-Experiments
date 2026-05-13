import { vaultClient } from './vaultClient';
import { clockClient } from './clockClient';
import type { FlowHighlight, InvocationEnvelope, AgentRunHandle } from './types';
import { invoke } from './invoke';
import { temporalClient } from './temporalClient';

export const naraClient = {
  getTodayJournal: vaultClient.getTodayNote,
  getDailyNote: vaultClient.getDailyNote,
  saveFlow: vaultClient.saveFlow,
  getFlow: vaultClient.getFlow,

  sendoff: async (
    highlight: FlowHighlight,
    modality: string,
    sessionKey: string,
  ): Promise<AgentRunHandle> => {
    const runtime = await temporalClient.getRuntime();
    const envelope: InvocationEnvelope = {
      kind: 'nara_highlight',
      modality,
      session_key: sessionKey,
      payload: {
        text: highlight.text,
        category: highlight.category,
        from: highlight.from,
        to: highlight.to,
        timestamp: highlight.timestamp,
      },
      day_now: runtime,
      coordinate: "M4-4'",
    };
    return invoke<AgentRunHandle>('agent_invoke', { envelope });
  },

  oracleCast: (kind: 'tarot' | 'iching' | 'dream', context?: unknown) =>
    invoke<unknown>('nara_oracle_cast', { kind, context }),

  getClockState: clockClient.getState,
};
