import { describe, expect, it } from 'vitest';

import { resolvePreferredGatewaySessionKey } from '../../main/epi-claw-client';
import { PANEL_RPC_PARITY } from '../../renderer/components/omni/contracts/panelRpcParity';
import {
  deleteSession,
  patchSession,
  resolvePreferredSessionKey,
  type SessionsState,
} from '../../renderer/controllers/epi-claw/controllers';
import { normalizeChatPayload } from '../../renderer/stores/epiClawGatewayStore';

describe('gateway parity helpers', () => {
  it('prefers gateway sessions over hardcoded defaults in the main-process client', () => {
    const result = {
      sessions: [{ key: 'agent:vak:subagent:child-1' }],
    };

    expect(resolvePreferredGatewaySessionKey(result, 'agent:main:main')).toBe(
      'agent:vak:subagent:child-1',
    );
    expect(resolvePreferredGatewaySessionKey(result, 'agent:vak:subagent:child-1')).toBe(
      'agent:vak:subagent:child-1',
    );
  });

  it('resolves renderer session defaults from sessions.list payloads', () => {
    const result = {
      sessions: [{ key: 'agent:vak:subagent:child-1' }],
      items: [{ canonicalKey: 'agent:vak:subagent:child-1' }],
    } as any;

    expect(resolvePreferredSessionKey(result, 'main')).toBe('agent:vak:subagent:child-1');
    expect(resolvePreferredSessionKey(result, 'agent:vak:subagent:child-1')).toBe(
      'agent:vak:subagent:child-1',
    );
  });

  it('normalizes explicit chat event aliases into chat controller payload states', () => {
    const delta = normalizeChatPayload({
      type: 'event',
      event: 'chat.delta',
      payload: { runId: 'run-1', sessionKey: 'agent:vak:subagent:child-1', message: 'hello' },
    });
    const final = normalizeChatPayload({
      type: 'event',
      event: 'chat.final',
      payload: { runId: 'run-1', sessionKey: 'agent:vak:subagent:child-1', message: 'done' },
    });
    const aborted = normalizeChatPayload({
      type: 'event',
      event: 'chat.aborted',
      payload: { runId: 'run-1', sessionKey: 'agent:vak:subagent:child-1' },
    });

    expect(delta?.state).toBe('delta');
    expect(final?.state).toBe('final');
    expect(aborted?.state).toBe('aborted');
  });

  it('uses canonical sessionKey params for renderer session patch and delete calls', async () => {
    const calls: Array<{ method: string; params?: unknown }> = [];
    const state: SessionsState = {
      client: {
        request: async (method: string, params?: unknown) => {
          calls.push({ method, params });
          return method === 'sessions.list'
            ? { ts: 0, path: '/tmp/gate/sessions', count: 0, defaults: { model: null, contextTokens: null }, sessions: [] }
            : { ok: true };
        },
      } as any,
      connected: true,
      sessionsLoading: false,
      sessionsResult: null,
      sessionsError: null,
      sessionsFilterActive: '0',
      sessionsFilterLimit: '0',
      sessionsIncludeGlobal: true,
      sessionsIncludeUnknown: false,
    };

    await patchSession(state, 'agent:main:main', { label: 'Main' });
    await deleteSession(state, 'agent:main:main');

    expect(calls.find((call) => call.method === 'sessions.patch')?.params).toMatchObject({
      sessionKey: 'agent:main:main',
      label: 'Main',
    });
    expect(calls.find((call) => call.method === 'sessions.patch')?.params).not.toHaveProperty('key');
    expect(calls.find((call) => call.method === 'sessions.delete')?.params).toMatchObject({
      sessionKey: 'agent:main:main',
      deleteTranscript: true,
    });
    expect(calls.find((call) => call.method === 'sessions.delete')?.params).not.toHaveProperty('key');
  });

  it('declares full OmniPanel session operation parity required by the gateway contract', () => {
    expect(PANEL_RPC_PARITY.sessions.required).toEqual(
      expect.arrayContaining([
        'sessions.list',
        'sessions.resolve',
        'sessions.preview',
        'sessions.patch',
        'sessions.reset',
        'sessions.delete',
        'sessions.compact',
        'sessions.fork',
        'sessions.resume',
        'sessions.import',
        'sessions.tree',
      ]),
    );
  });
});
