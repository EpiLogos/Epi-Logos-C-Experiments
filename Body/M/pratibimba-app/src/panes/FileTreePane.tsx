/**
 * Coordinate: M' (vault tree pane, plan T2.2)
 * Actualises: the file-system face of the vault workspace — lazy directory
 *   tree over `vault_list`, refreshed by `vault://changed`, opening files
 *   through the command system (`vault.open`).
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { commands } from '../commands/registry';

export interface VaultEntry {
    name: string;
    path: string;
    isDir: boolean;
}

export function FileTreePane() {
    const [rootEntries, setRootEntries] = useState<VaultEntry[] | null>(null);
    const [children, setChildren] = useState<Record<string, VaultEntry[]>>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const loadRoot = useCallback(() => {
        invokeCommand<VaultEntry[]>('vault_list', {})
            .then(setRootEntries)
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, []);

    useEffect(() => {
        loadRoot();
        let unlisten: (() => void) | undefined;
        void listenEvent<string[]>('vault://changed', () => {
            loadRoot();
            setChildren({});
        }).then(u => {
            unlisten = u;
        });
        return () => unlisten?.();
    }, [loadRoot]);

    const toggleDir = (entry: VaultEntry) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(entry.path)) {
                next.delete(entry.path);
            } else {
                next.add(entry.path);
                if (!children[entry.path]) {
                    invokeCommand<VaultEntry[]>('vault_list', { path: entry.path })
                        .then(list => setChildren(current => ({ ...current, [entry.path]: list })))
                        .catch(() => undefined);
                }
            }
            return next;
        });
    };

    const renderEntries = (entries: VaultEntry[], depth: number) => (
        <ul className="vault-tree" style={{ paddingLeft: depth === 0 ? 0 : 14 }}>
            {entries.map(entry => (
                <li key={entry.path}>
                    {entry.isDir ? (
                        <>
                            <button
                                type="button"
                                className="vault-node vault-dir"
                                data-testid={`vault-dir-${entry.path}`}
                                onClick={() => toggleDir(entry)}
                            >
                                {expanded.has(entry.path) ? '▾' : '▸'} {entry.name}
                            </button>
                            {expanded.has(entry.path) && children[entry.path]
                                ? renderEntries(children[entry.path], depth + 1)
                                : null}
                        </>
                    ) : (
                        <button
                            type="button"
                            className="vault-node vault-file"
                            data-testid={`vault-file-${entry.path}`}
                            onClick={() => void commands.execute('vault.open', entry.path)}
                        >
                            {entry.name}
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );

    if (error) {
        return (
            <div className="pane-message" data-testid="vault-tree-error">
                vault unavailable: {error}
            </div>
        );
    }
    if (!rootEntries) {
        return <div className="pane-message">reading vault…</div>;
    }
    return <div className="vault-tree-pane" data-testid="vault-tree">{renderEntries(rootEntries, 0)}</div>;
}
