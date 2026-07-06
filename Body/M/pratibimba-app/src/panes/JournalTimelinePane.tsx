/**
 * Coordinate: M' M4' (journal timeline, plan T3.2)
 * Actualises: the day-container timeline over REAL vault data — Present day
 *   folders listed via the vault service (no gateway method exists yet for
 *   `nara.journal.timeline`; per Build law this pane reads the substrate
 *   truth directly rather than stub-rendering a missing RPC).
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';
import { VaultEntry } from './FileTreePane';

const PRESENT = 'Empty/Present';

export function JournalTimelinePane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const [days, setDays] = useState<VaultEntry[] | null>(null);
    const [files, setFiles] = useState<Record<string, VaultEntry[]>>({});
    const [open, setOpen] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        invokeCommand<VaultEntry[]>('vault_list', { path: PRESENT })
            .then(entries =>
                setDays(
                    entries
                        .filter(e => e.isDir)
                        .sort((a, b) => {
                            const key = (n: string) => n.split('-').reverse().join('-');
                            return key(b.name).localeCompare(key(a.name));
                        })
                )
            )
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, []);

    useEffect(() => {
        load();
        let unlisten: (() => void) | undefined;
        void listenEvent<string[]>('vault://changed', paths => {
            if (paths.some(p => p.startsWith(PRESENT))) {
                load();
                setFiles({});
            }
        }).then(u => {
            unlisten = u;
        });
        return () => unlisten?.();
    }, [load]);

    const toggleDay = (day: VaultEntry) => {
        setOpen(prev => {
            const next = new Set(prev);
            if (next.has(day.path)) {
                next.delete(day.path);
            } else {
                next.add(day.path);
                if (!files[day.path]) {
                    invokeCommand<VaultEntry[]>('vault_list', { path: day.path })
                        .then(list => setFiles(current => ({ ...current, [day.path]: list })))
                        .catch(() => undefined);
                }
            }
            return next;
        });
    };

    if (error) {
        return <div className="pane-message">timeline unavailable: {error}</div>;
    }
    return (
        <div className="timeline-pane" data-testid="journal-timeline">
            <div className="pane-toolbar">
                <button
                    type="button"
                    data-testid="begin-today"
                    onClick={() => void commands.execute('journal.beginToday')}
                >
                    ☀ begin today
                </button>
            </div>
            <ul className="timeline-list">
                {(days ?? []).map(day => (
                    <li key={day.path}>
                        <button
                            type="button"
                            className={`timeline-day ${day.name === dayNow ? 'timeline-today' : ''}`}
                            data-testid={`timeline-day-${day.name}`}
                            onClick={() => toggleDay(day)}
                        >
                            {open.has(day.path) ? '▾' : '▸'} {day.name}
                            {day.name === dayNow ? ' · today' : ''}
                        </button>
                        {open.has(day.path) && files[day.path] ? (
                            <ul className="timeline-files">
                                {files[day.path].map(f => (
                                    <li key={f.path}>
                                        <button
                                            type="button"
                                            className="vault-node vault-file"
                                            data-testid={`timeline-file-${f.path}`}
                                            onClick={() =>
                                                f.isDir ? undefined : void commands.execute('vault.open', f.path)
                                            }
                                        >
                                            {f.isDir ? `▸ ${f.name}` : f.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </li>
                ))}
                {days && days.length === 0 ? <li className="pane-message">no days yet — begin today</li> : null}
            </ul>
        </div>
    );
}
