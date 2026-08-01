/**
 * Coordinate: M4' Dream Journal surface (rerun 51.T51.6)
 * Residency: Body/M/pratibimba-app/src/panes/dreamJournal/DreamJournalPane.tsx
 * Position (#n): #4 — Context: the lived-flow surface named beside Daily Note,
 *   Oracle and Highlight, and built last.
 * Actualises: [[M4'-SPEC]]'s Dream Journal over the SAME protected local flow
 *   substrate as its three siblings — the same `vault_write`/`vault_read`
 *   seam under the `Empty/Present/` write scope, the same day container, the
 *   same `c_n_*` frontmatter law, the same `protected_local` chrome, and the
 *   protected-handle discipline for anything that leaves.
 *
 *   THE BODY HAS ONE DESTINATION. A dream is written to its vault file and
 *   read back from it. Nothing here dispatches an intent, publishes to a
 *   store, or hands a body to any gateway call — the only outward shape is the
 *   handle, which is what the "recent dreams" list is built from even though
 *   the bodies are one read away. That is the privacy law expressed as
 *   structure rather than as a promise.
 * Public surface: DreamJournalPane.
 * Does NOT own: the document law (`dreamJournal.ts`), the vault seam
 *   (`bridge/tauri.ts` → `src-tauri/src/vault.rs`), the day container, the
 *   privacy tint register (`ui/privacyChrome.ts`).
 * Contract: [[M4'-SPEC]] · rerun tranche [[51.T51.6]].
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand } from '../../bridge/tauri';
import { useSessionStore } from '../../state/stores';
import { privacyChrome } from '../../ui/privacyChrome';
import type { VaultEntry } from '../FileTreePane';
import {
    buildDreamDocument,
    dreamFileName,
    dreamHandleFor,
    dreamPathFor,
    isDreamPathInWriteScope,
    parseDreamDocument,
    type DreamEntry,
    type DreamHandle
} from './dreamJournal';
import './dreamJournal.css';

export function DreamJournalPane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const sessionKey = useSessionStore(s => s.sessionKey);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [handles, setHandles] = useState<readonly DreamHandle[]>([]);
    const [opened, setOpened] = useState<DreamEntry | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    /** The recent-dream list is built from HANDLES: each file is read to
     *  classify it by role, and the body is dropped on the spot. */
    const refresh = useCallback(async () => {
        if (!dayNow) {
            setHandles([]);
            return;
        }
        const folders = [
            `Empty/Present/${dayNow}`,
            ...(sessionKey ? [`Empty/Present/${dayNow}/${sessionKey}`] : [])
        ];
        const found: DreamHandle[] = [];
        for (const folder of folders) {
            const entries = await invokeCommand<VaultEntry[]>('vault_list', { path: folder }).catch(
                () => [] as VaultEntry[]
            );
            for (const entry of entries) {
                if (entry.isDir || !entry.name.endsWith('.md')) {
                    continue;
                }
                const file = await invokeCommand<{ content: string }>('vault_read', {
                    path: entry.path
                }).catch(() => null);
                if (!file) {
                    continue;
                }
                const dream = parseDreamDocument(entry.path, file.content);
                if (dream) {
                    found.push(dreamHandleFor(dream));
                }
            }
        }
        setHandles(
            found.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        );
    }, [dayNow, sessionKey]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const save = useCallback(async () => {
        if (!dayNow) {
            setStatus('no day is anchored — a dream belongs to a day container');
            return;
        }
        if (body.trim().length === 0) {
            setStatus('nothing to record');
            return;
        }
        const now = new Date();
        const path = dreamPathFor(dayNow, sessionKey, dreamFileName(now));
        if (!isDreamPathInWriteScope(path)) {
            setStatus(`refused: ${path} is outside the S1 write scope`);
            return;
        }
        try {
            await invokeCommand<void>('vault_write', {
                path,
                content: buildDreamDocument({
                    dayId: dayNow,
                    sessionKey,
                    createdAt: now.toISOString(),
                    title: title.trim(),
                    body
                })
            });
            setStatus(`recorded ${path}`);
            setTitle('');
            setBody('');
            await refresh();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : String(error));
        }
    }, [body, dayNow, refresh, sessionKey, title]);

    const open = useCallback(async (handle: DreamHandle) => {
        const file = await invokeCommand<{ content: string }>('vault_read', {
            path: handle.path
        }).catch(() => null);
        setOpened(file ? parseDreamDocument(handle.path, file.content) : null);
    }, []);

    const chrome = privacyChrome('protected_local');

    return (
        <div
            className={`dream-journal ${chrome.className}`}
            title={chrome.title}
            data-testid="dream-journal"
            data-day={dayNow ?? ''}
            data-session={sessionKey ?? ''}
            data-dream-count={handles.length}
            data-privacy-class="protected_local"
        >
            <header className="dream-header">
                <span className="dream-coordinate">M4′</span>
                <h2>Dream Journal</h2>
                <p className="dream-essence">
                    Private local flow, in the same day container as the Daily Note, the Oracle and
                    the Highlights. A dream is written to its vault file and read back from it;
                    nothing else ever carries the body — a list, a playback, or any surface beyond
                    this one sees a handle.
                </p>
            </header>

            {dayNow ? null : (
                <p className="dream-empty" data-testid="dream-journal-no-day">
                    No day is anchored yet. A dream belongs to a day container, so the surface waits
                    rather than inventing one.
                </p>
            )}

            <section className="dream-compose" data-testid="dream-journal-compose">
                <input
                    type="text"
                    data-testid="dream-title"
                    placeholder="a name for the dream"
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                />
                <textarea
                    data-testid="dream-body"
                    placeholder="what happened"
                    rows={8}
                    value={body}
                    onChange={event => setBody(event.target.value)}
                />
                <div className="dream-actions">
                    <button
                        type="button"
                        className="vault-node"
                        data-testid="dream-save"
                        disabled={!dayNow || body.trim().length === 0}
                        onClick={() => void save()}
                    >
                        Record dream
                    </button>
                    {status ? (
                        <span className="dream-status" data-testid="dream-status">
                            {status}
                        </span>
                    ) : null}
                </div>
            </section>

            <section className="dream-list" data-testid="dream-journal-list">
                <h3>Recorded dreams — handles only</h3>
                {handles.length === 0 ? (
                    <p className="dream-empty">none recorded in this day container yet.</p>
                ) : (
                    <ul>
                        {handles.map(handle => (
                            <li
                                key={handle.path}
                                data-testid={`dream-handle-${handle.createdAt}`}
                                data-dream-path={handle.path}
                                data-dream-privacy={handle.privacyClass}
                                data-dream-body-length={handle.bodyLength}
                            >
                                <button
                                    type="button"
                                    className="vault-node"
                                    data-testid={`dream-open-${handle.createdAt}`}
                                    onClick={() => void open(handle)}
                                >
                                    {handle.createdAt}
                                </button>
                                <span className="dream-note">
                                    {handle.bodyLength} characters · {handle.privacyClass}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {opened ? (
                <section className="dream-opened" data-testid="dream-journal-opened">
                    <h3 data-testid="dream-opened-title">{opened.title}</h3>
                    <p className="dream-note">{opened.path}</p>
                    <pre data-testid="dream-opened-body">{opened.body}</pre>
                </section>
            ) : null}
        </div>
    );
}
