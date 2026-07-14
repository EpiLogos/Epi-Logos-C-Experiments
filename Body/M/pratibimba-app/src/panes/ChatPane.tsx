/**
 * Coordinate: M' `/` membrane (Pi chat, plan T3.3 + Tranche 27.T27.1)
 * Actualises: the Pi conversational membrane — `chat.history` on mount,
 *   `chat.send` multi-turn prose, live updates from the `chat` event channel,
 *   PLUS the 27.1 agentic surface: the DR-M5-1 identity narrative header,
 *   per-message actor badges, the slash-command grammar (single-shot `/`
 *   lines with inline capability completion from the spec-named local
 *   fallback registry until `s4'.mediation.capabilities.list` lands, 12.10),
 *   and the DR-B-3 guard (direct `/dispatch <aletheia-subagent>` rejected
 *   inline — Aletheia fans out only via `/aletheia crystallise`).
 * Does NOT own: dispatch execution (gateway seams), the dispatch-genealogy /
 *   evidence tab bodies (27.3/27.5 pending folds — chips render only when a
 *   message actually carries those refs; never fabricated).
 */

import { useEffect, useRef, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useEventsStore } from '../state/eventsStore';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import { completionsFor, dispatchGuard, isSlashCommandLine, parseSlashCommand } from './omni/slashCommand';

interface ChatMessage {
    role: string;
    text: string;
    atMs?: number;
    dispatchRunId?: string;
    evidenceRef?: string;
}

const PI_IDENTITY_NARRATIVE =
    'Pi — conversational membrane. Speak; I dispatch through Anima. ' +
    'Anima orchestrates from S4′; subagents surface in crystallisation-mode.';

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
            atMs: typeof m.atMs === 'number' ? m.atMs : undefined,
            dispatchRunId:
                (typeof m.dispatchRunId === 'string' && m.dispatchRunId) ||
                (typeof m.run_id === 'string' && m.run_id) ||
                undefined,
            evidenceRef:
                (typeof m.evidenceRef === 'string' && m.evidenceRef) ||
                (typeof m.evidence_ref === 'string' && m.evidence_ref) ||
                undefined
        }))
        .filter(m => m.text.length > 0);
}

/** Actor badge: `user` renders as You/Trika-0; anything else is Pi or a named sub-actor. */
function actorBadge(role: string): string {
    if (role === 'user') {
        return 'You';
    }
    if (role === 'assistant' || role === 'pi') {
        return 'Pi';
    }
    return role;
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
        // 27.1 single-shot grammar: a slash line parses and guards BEFORE any
        // wire call. DR-B-3 rejections render inline and are never dispatched.
        const command = parseSlashCommand(message);
        if (command) {
            const guard = dispatchGuard(command);
            if (guard.rejected) {
                setDraft('');
                setSendError(null);
                setHistory(h => [...h, { role: 'user', text: message }, { role: 'pi', text: guard.message ?? 'rejected' }]);
                return;
            }
        }
        const key = sessionKey ?? `app-${Date.now().toString(36)}`;
        if (!sessionKey) {
            useSessionStore.getState().setSession({ sessionKey: key });
        }
        setDraft('');
        setSendError(null);
        setHistory(h => [...h, { role: 'user', text: message }]);
        try {
            await gateway().invoke('chat.send', {
                sessionKey: key,
                message,
                ...(command ? { singleShot: true, slashVerb: command.verb } : {})
            });
        } catch (err) {
            setSendError(err instanceof Error ? err.message : String(err));
        }
    };

    const completions = isSlashCommandLine(draft) ? completionsFor(draft) : [];

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
            <header className="chat-pi-header" data-testid="pi-chat-header">
                <span className="chat-pi-narrative">{PI_IDENTITY_NARRATIVE}</span>
                {sessionKey ? (
                    <span className="chat-pi-session" data-testid="pi-chat-session-anchor">
                        [[NOW-{sessionKey}]]
                    </span>
                ) : null}
            </header>
            <div className="chat-scroll" ref={scrollRef}>
                {history.map((m, i) => (
                    <div key={`h-${i}`} className={`chat-msg chat-${m.role}`} data-testid="chat-msg">
                        <span className="chat-role" data-testid="chat-actor-badge">{actorBadge(m.role)}</span>
                        {m.text}
                        {m.dispatchRunId ? (
                            <span className="chat-chip" data-testid="chat-dispatch-chip" data-run-id={m.dispatchRunId}>
                                ⇢ {m.dispatchRunId}
                            </span>
                        ) : null}
                        {m.evidenceRef ? (
                            <span className="chat-chip" data-testid="chat-evidence-chip" data-evidence-ref={m.evidenceRef}>
                                ⧉ {m.evidenceRef}
                            </span>
                        ) : null}
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
            {completions.length > 0 ? (
                <ul className="chat-completions" data-testid="pi-chat-completions">
                    {completions.map(entry => (
                        <li key={entry.command} data-testid="pi-chat-completion">
                            <code>{entry.command}</code> <span className="chat-completion-hint">{entry.hint}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
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
