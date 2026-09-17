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

describe('ChatPane 27.1 — Pi membrane surface', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockResolvedValue({ artifact: [] } as never);
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

    it('renders the DR-M5-1 identity narrative header with the session anchor', () => {
        render(<ChatPane />);
        const header = screen.getByTestId('pi-chat-header');
        expect(header.textContent).toContain('conversational membrane');
        expect(screen.getByTestId('pi-chat-session-anchor').textContent).toContain('[[NOW-sess-1]]');
    });

    it('shows capability completions on a slash prefix and hides them for prose', () => {
        render(<ChatPane />);
        fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '/' } });
        expect(screen.getAllByTestId('pi-chat-completion').length).toBeGreaterThan(3);
        fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'hello' } });
        expect(screen.queryByTestId('pi-chat-completions')).toBeNull();
    });

    it('DR-B-3: a direct aletheia /dispatch renders the rejection inline and never reaches the wire', async () => {
        render(<ChatPane />);
        fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '/dispatch moirai distill' } });
        fireEvent.click(screen.getByTestId('chat-send'));
        expect(await screen.findByText(/crystallisation-mode/)).toBeTruthy();
        const sends = invoke.mock.calls.filter(([method]) => method === 'chat.send');
        expect(sends).toHaveLength(0);
    });

    it('a permitted slash command dispatches single-shot with its verb tagged', async () => {
        render(<ChatPane />);
        fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '/session resume sess-9' } });
        fireEvent.click(screen.getByTestId('chat-send'));
        await new Promise(resolve => setTimeout(resolve, 0));
        const sends = invoke.mock.calls.filter(([method]) => method === 'chat.send');
        expect(sends).toHaveLength(1);
        expect(sends[0][1]).toMatchObject({ singleShot: true, slashVerb: 'session' });
    });

    it('renders dispatch-genealogy and evidence chips only when the history rows carry the refs', async () => {
        invoke.mockImplementation(async (method: string) =>
            method === 'chat.history'
                ? ({
                      artifact: [
                          { role: 'assistant', message: 'dispatched', dispatchRunId: 'run-7' },
                          { role: 'assistant', message: 'evidenced', evidence_ref: 'packet-3' },
                          { role: 'assistant', message: 'plain' }
                      ]
                  } as never)
                : ({ artifact: { ok: true } } as never)
        );
        render(<ChatPane />);
        expect(await screen.findByTestId('chat-dispatch-chip')).toBeTruthy();
        expect(screen.getByTestId('chat-dispatch-chip').getAttribute('data-run-id')).toBe('run-7');
        expect(screen.getByTestId('chat-evidence-chip').getAttribute('data-evidence-ref')).toBe('packet-3');
        expect(screen.getAllByTestId('chat-msg')).toHaveLength(3);
    });
});
