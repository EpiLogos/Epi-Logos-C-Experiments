import { describe, expect, it } from 'vitest';

import { resolvePreferredGatewaySessionKey } from '../../main/epi-claw-client';
import { resolvePreferredSessionKey } from '../../renderer/controllers/epi-claw/controllers';
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
});
