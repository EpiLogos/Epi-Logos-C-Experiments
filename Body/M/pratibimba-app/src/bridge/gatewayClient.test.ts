import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GatewayClient, WebSocketLike } from './gatewayClient';
import {
    KernelBridgeCachedProfile,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent,
    M123ChimeFrameBoundary
} from './types';

class FakeSocket implements WebSocketLike {
    readyState = 0;
    sent: string[] = [];
    private listeners: Record<string, ((evt: any) => void)[]> = { open: [], message: [], close: [] };

    send(data: string): void {
        this.sent.push(data);
    }
    close(): void {
        this.readyState = 3;
        this.fire('close', { code: 1000, reason: 'closed by client' });
    }
    addEventListener(type: string, listener: (evt: any) => void): void {
        this.listeners[type].push(listener);
    }
    open(): void {
        this.readyState = 1;
        this.fire('open', {});
    }
    receive(frame: unknown): void {
        this.fire('message', { data: JSON.stringify(frame) });
    }
    drop(code = 1006, reason = ''): void {
        this.readyState = 3;
        this.fire('close', { code, reason });
    }
    private fire(type: string, evt: any): void {
        for (const listener of this.listeners[type]) {
            listener(evt);
        }
    }
}

describe('GatewayClient', () => {
    let socket: FakeSocket;
    let profiles: KernelBridgeCachedProfile[];
    let statuses: KernelBridgeConnectionStatus[];
    let events: KernelBridgeRuntimeEvent[];
    let chimes: M123ChimeFrameBoundary[];
    let client: GatewayClient;

    beforeEach(() => {
        vi.useFakeTimers();
        socket = new FakeSocket();
        profiles = [];
        statuses = [];
        events = [];
        chimes = [];
        client = new GatewayClient(
            'ws://test.invalid',
            {
                onProfile: p => profiles.push(p),
                onStatus: s => statuses.push(s),
                onEvent: e => events.push(e),
                onChime: frame => chimes.push(frame)
            },
            () => socket
        );
    });

    afterEach(() => {
        client.dispose();
        vi.useRealTimers();
    });

    it('performs the connect handshake on open, then health; connected only after connect-ok', async () => {
        client.start('lite');
        socket.open();
        expect(statuses.at(-1)?.state).toBe('connecting');
        const connectFrame = JSON.parse(socket.sent[0]);
        expect(connectFrame.type).toBe('req');
        expect(connectFrame.method).toBe('connect');
        socket.receive({ type: 'res', id: connectFrame.id, result: { ok: true } });
        await Promise.resolve();
        await Promise.resolve();
        expect(statuses.some(s => s.state === 'connected')).toBe(true);
        expect(JSON.parse(socket.sent[1]).method).toBe('health');
    });

    it('routes profile events to onProfile; bare tick liveness pulses do NOT feed the profile path', () => {
        client.start('lite');
        socket.open();
        socket.receive({ event: 'profile', payload: { generation: 7, graphRevision: 19, tick12: 3 } });
        socket.receive({ event: 'profile.update', payload: { tick12: 4 } });
        socket.receive({ event: 'tick', payload: { seq: 9, ts: 123 } });
        expect(profiles).toHaveLength(2);
        expect(profiles[0].generation).toBe(7);
        expect(profiles[0].graphRevision).toBe(19);
        expect(profiles[1].generation).toBe(8);
        expect(profiles[1].graphRevision).toBeUndefined();
        expect((profiles[0].profile as { tick12: number }).tick12).toBe(3);
        expect(events.filter(e => e.kind === 'observability')).toHaveLength(1);
    });

    it('resolves invoke by matched id and rejects on gateway error frames', async () => {
        client.start('lite');
        socket.open();
        const ok = client.invoke('s3.session.list', {});
        const okFrame = JSON.parse(socket.sent.at(-1)!);
        expect(okFrame.type).toBe('req');
        socket.receive({ type: 'res', id: okFrame.id, result: { artifact: ['a'] } });
        await expect(ok).resolves.toMatchObject({ artifact: ['a'] });

        const bad = client.invoke('s3.session.resolve', {});
        const badId = JSON.parse(socket.sent.at(-1)!).id;
        socket.receive({ type: 'res', id: badId, error: { code: 'not-found', message: 'no such session' } });
        await expect(bad).rejects.toThrow('no such session');
    });

    it('schedules reconnect with backoff after an unexpected close', () => {
        client.start('lite');
        socket.open();
        socket.drop();
        const last = statuses.at(-1);
        expect(last?.state).toBe('reconnecting');
        expect(last?.reason).toContain('retrying in 1500ms');
    });

    it('routes health frames to readiness events and unknown frames to observability', () => {
        client.start('lite');
        socket.open();
        socket.receive({ event: 'health.snapshot', payload: { ok: true } });
        socket.receive({ event: 'something.else', payload: {} });
        expect(events.map(e => e.kind)).toEqual(['readiness', 'observability']);
    });

    it('routes m123.chime frames to onChime, never into the event ring', () => {
        client.start('lite');
        socket.open();
        socket.receive({
            type: 'event',
            event: 'm123.chime',
            payload: {
                eventType: 'm123.chime',
                contract: 'S0.kernel-bridge.m123-chime-frame',
                sourceProfileGeneration: 9,
                tick: 108,
                tick12: 0,
                degree720: 0,
                m2Address72: 0,
                m2: {
                    modalResonator: {
                        schemaVersion: 1,
                        bellPartials: [
                            { octetIndex: 0, role: 'hum' },
                            { octetIndex: 1, role: 'prime' },
                            { octetIndex: 2, role: 'tierce' },
                            { octetIndex: 3, role: 'quint' },
                            { octetIndex: 4, role: 'nominal' },
                            { octetIndex: 5, role: 'upper' },
                            { octetIndex: 6, role: 'warble' },
                            { octetIndex: 7, role: 'residue' }
                        ]
                    }
                },
                m3: {
                    worldClockBinding: {
                        state: 'ready',
                        tickMatchesProfile: true,
                        degree720MatchesProfile: true
                    }
                },
                privacyClass: 'public-current-context'
            }
        });
        expect(chimes).toHaveLength(1);
        expect(chimes[0].sourceProfileGeneration).toBe(9);
        expect(chimes[0].m2?.modalResonator?.bellPartials).toHaveLength(8);
        expect(events).toHaveLength(0);

        // Malformed chime (no generation) falls through to observability
        // instead of silently vanishing.
        socket.receive({ event: 'm123.chime', payload: { broken: true } });
        expect(chimes).toHaveLength(1);
        expect(events.map(e => e.kind)).toEqual(['observability']);
    });
});
