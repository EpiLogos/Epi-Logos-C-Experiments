import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatPane } from './ChatPane';
import { setGateway } from '../bridge/gatewayHolder';
import { useEventsStore } from '../state/eventsStore';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore, useSessionStore } from '../state/stores';

function receipt(artifact: unknown) {
    return { artifact } as never;
}

describe('ChatPane', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        setGateway({ invoke } as never);
        useSessionStore.setState({ sessionKey: 'sess-1', dayNow: null, privacyClass: null });
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useEventsStore.setState({ events: [] });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('loads history for the bound session and sends through chat.send', async () => {
        invoke.mockImplementation(async (method: string) =>
            method === 'chat.history'
                ? receipt([{ role: 'assistant', message: 'welcome back' }])
                : receipt({ ok: true })
        );
        render(<ChatPane />);
        expect((await screen.findAllByTestId('chat-msg'))[0].textContent).toContain('welcome back');
        expect(invoke).toHaveBeenCalledWith('chat.history', { sessionKey: 'sess-1' });

        fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'hello organism' } });
        fireEvent.keyDown(screen.getByTestId('chat-input'), { key: 'Enter' });
        expect(invoke).toHaveBeenCalledWith('chat.send', { sessionKey: 'sess-1', message: 'hello organism' });
        expect((await screen.findAllByTestId('chat-msg')).at(-1)?.textContent).toContain('hello organism');
    });

    it('renders live chat-channel events from the gateway stream', async () => {
        invoke.mockResolvedValue(receipt([]));
        render(<ChatPane />);
        act(() => {
            useEventsStore.getState().push({
                kind: 'observability',
                emittedAtMs: 1,
                source: 'kernel-bridge',
                profileGeneration: null,
                privacyClass: 'public',
                payload: { event: 'chat', payload: { role: 'assistant', message: 'streamed reply' } }
            });
        });
        expect((await screen.findByTestId('chat-msg-live')).textContent).toContain('streamed reply');
    });
});
