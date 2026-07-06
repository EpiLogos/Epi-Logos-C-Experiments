import { describe, expect, it, vi } from 'vitest';
import { SessionClient } from './sessionClient';

function receipt(artifact: unknown) {
    return {
        method: '',
        gatewayMethod: null,
        sessionKey: '',
        profileGeneration: null,
        privacyClass: 'public',
        provenanceHandles: [],
        vak: { vakAddress: { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' }, routeLineage: [] },
        artifact
    };
}

describe('session client', () => {
    it('lists sessions from array or {items} artifacts and coerces key aliases', async () => {
        const invoke = vi
            .fn()
            .mockResolvedValueOnce(receipt([{ canonicalKey: 'sess-a' }, { key: 'sess-b', label: 'B' }]));
        const client = new SessionClient({ invoke });
        const sessions = await client.list();
        expect(invoke).toHaveBeenCalledWith('sessions.list', {});
        expect(sessions.map(s => s.sessionKey)).toEqual(['sess-a', 'sess-b']);
        expect(sessions[1].label).toBe('B');
    });

    it('bind prefers the persisted key when it still resolves', async () => {
        const invoke = vi.fn(async (method: string) =>
            method === 'sessions.resolve' ? receipt({ canonicalKey: 'sess-old' }) : receipt([])
        );
        const client = new SessionClient({ invoke: invoke as never });
        const bound = await client.bind('sess-old');
        expect(bound?.sessionKey).toBe('sess-old');
        expect(invoke).toHaveBeenCalledWith('sessions.resolve', { session: 'sess-old' });
    });

    it('bind falls back to the most recent listed session, else null', async () => {
        const invoke = vi.fn(async (method: string) => {
            if (method === 'sessions.resolve') {
                throw new Error('not-found');
            }
            return receipt([{ sessionKey: 'sess-new' }]);
        });
        const client = new SessionClient({ invoke: invoke as never });
        expect((await client.bind('gone'))?.sessionKey).toBe('sess-new');

        const empty = new SessionClient({ invoke: vi.fn(async () => receipt([])) as never });
        expect(await empty.bind(null)).toBeNull();
    });
});
