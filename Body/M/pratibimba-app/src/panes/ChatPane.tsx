/**
 * Coordinate: M' `/` membrane (chat, plan T3.3)
 * Actualises: direct gateway chat — `chat.history` on mount, `chat.send`
 *   (param `sessionKey`, per dispatch.rs; sessions materialise via
 *   store.ensure on first send), live updates from the `chat` event channel.
 *   Conversational-first: this is the membrane's primary tab.
 */

import { useEffect, useRef, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useEventsStore } from '../state/eventsStore';
import { useProvenanceStore, useSessionStore } from '../state/stores';

interface ChatMessage {
    role: string;
    text: string;
    atMs?: number;
}

function coerceMessages(artifact: unknown): ChatMessage[] {
    const raw = Array.isArray(artifact)
        ? artifact
        : ((artifact as { messages?: unknown[] } | null)?.messages ?? []);
    return (raw as Record<string, unknown>[])
        .map(m => ({
            role: typeof m.role === 'string' ? m.role : 'unknown',
            text:
                (typeof m.message === 'string' && m.message) ||
                (typeof m.text === 'string' && m.text) ||
                (typeof m.content === 'string' && m.content) ||
                JSON.stringify(m),
            atMs: typeof m.atMs === 'number' ? m.atMs : undefined
        }))
        .filter(m => m.text.length > 0);
}

export function ChatPane() {
    const sessionKey = useSessionStore(s => s.sessionKey);
    const connected = useProvenanceStore(s => s.connection.connected);
    const events = useEventsStore(s => s.events);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [sendError, setSendError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!sessionKey || !connected) {
            return;
        }
        gateway()
            .invoke('chat.history', { sessionKey })
            .then(receipt => setHistory(coerceMessages(receipt.artifact)))
            .catch(() => setHistory([]));
    }, [sessionKey, connected]);

    const live = events.filter(e => e.channel === 'chat');
    useEffect(() => {
        const el = scrollRef.current;
        if (el && typeof el.scrollTo === 'function') {
            el.scrollTo({ top: el.scrollHeight });
        }
    }, [history.length, live.length]);

    const send = async () => {
        const message = draft.trim();
        if (!message) {
            return;
        }
        const key = sessionKey ?? `app-${Date.now().toString(36)}`;
        if (!sessionKey) {
            useSessionStore.getState().setSession({ sessionKey: key });
        }
        setDraft('');
        setSendError(null);
        setHistory(h => [...h, { role: 'user', text: message }]);
        try {
            await gateway().invoke('chat.send', { sessionKey: key, message });
        } catch (err) {
            setSendError(err instanceof Error ? err.message : String(err));
        }
    };

    const liveMessages = live
        .map(e => {
            const p = e.payload as Record<string, unknown> | null;
            const inner = (p?.payload ?? p) as Record<string, unknown> | null;
            const text =
                (typeof inner?.message === 'string' && inner.message) ||
                (typeof inner?.text === 'string' && inner.text) ||
                null;
            const role = typeof inner?.role === 'string' ? inner.role : 'assistant';
            return text ? { role, text, seq: e.seq } : null;
        })
        .filter((m): m is { role: string; text: string; seq: number } => m !== null);

    return (
        <div className="chat-pane" data-testid="chat-pane">
            <div className="chat-scroll" ref={scrollRef}>
                {history.map((m, i) => (
                    <div key={`h-${i}`} className={`chat-msg chat-${m.role}`} data-testid="chat-msg">
                        <span className="chat-role">{m.role}</span>
                        {m.text}
                    </div>
                ))}
                {liveMessages.map(m => (
                    <div key={`l-${m.seq}`} className={`chat-msg chat-${m.role}`} data-testid="chat-msg-live">
                        <span className="chat-role">{m.role}</span>
                        {m.text}
                    </div>
                ))}
                {history.length === 0 && liveMessages.length === 0 ? (
                    <div className="pane-message">
                        {connected
                            ? sessionKey
                                ? 'No messages yet — speak.'
                                : 'No session bound — the first message creates one.'
                            : 'Gateway disconnected.'}
                    </div>
                ) : null}
            </div>
            {sendError ? <div className="chat-error" data-testid="chat-error">{sendError}</div> : null}
            <div className="chat-input-row">
                <input
                    data-testid="chat-input"
                    value={draft}
                    disabled={!connected}
                    placeholder={connected ? 'Message the organism…' : 'gateway disconnected'}
                    onChange={evt => setDraft(evt.target.value)}
                    onKeyDown={evt => {
                        if (evt.key === 'Enter' && !evt.shiftKey) {
                            evt.preventDefault();
                            void send();
                        }
                    }}
                />
                <button type="button" data-testid="chat-send" disabled={!connected} onClick={() => void send()}>
                    send
                </button>
            </div>
        </div>
    );
}
