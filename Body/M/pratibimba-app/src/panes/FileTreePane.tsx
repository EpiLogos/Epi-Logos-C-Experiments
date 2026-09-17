/**
 * Coordinate: M' M5-0' (vault tree + Library projection lens)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5-0' existing file-tree receiver
 * Actualises: the file-system face of the vault workspace — lazy directory
 *   tree over `vault_list`, refreshed by `vault://changed`, opening files
 *   through the command system (`vault.open`) — with CCT-19's coordinate-
 *   ancestry Library lens over loaded files, parsed from real YAML frontmatter.
 * Public surface: VaultEntry, FileTreePane.
 * Does NOT own: vault IO/write law, coordinate semantics, or a standalone
 *   Library surface.
 * Contract: [[M5'-SPEC]] + CCT-19 + rerun 11.T11.3.
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { coordinateFromMarkdown, shelfFor } from './libraryProjection';

export interface VaultEntry {
    name: string;
    path: string;
    isDir: boolean;
}

interface VaultFile {
    content: string;
}

export function FileTreePane() {
    const [rootEntries, setRootEntries] = useState<VaultEntry[] | null>(null);
    const [children, setChildren] = useState<Record<string, VaultEntry[]>>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [coordinates, setCoordinates] = useState<Record<string, string | null>>({});
    const [error, setError] = useState<string | null>(null);

    const hydrateLibraryLens = useCallback((entries: readonly VaultEntry[]) => {
        const files = entries.filter(entry => !entry.isDir);
        void Promise.all(
            files.map(async entry => {
                try {
                    const file = await invokeCommand<VaultFile>('vault_read', { path: entry.path });
                    return [entry.path, coordinateFromMarkdown(file.content)] as const;
                } catch {
                    return null;
                }
            })
        ).then(results => {
            const resolved = results.filter((result): result is readonly [string, string | null] => result !== null);
            if (resolved.length > 0) {
                setCoordinates(current => ({ ...current, ...Object.fromEntries(resolved) }));
            }
        });
    }, []);

    const loadRoot = useCallback(() => {
        setCoordinates({});
        invokeCommand<VaultEntry[]>('vault_list', {})
            .then(entries => {
                setRootEntries(entries);
                hydrateLibraryLens(entries);
            })
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, [hydrateLibraryLens]);

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
                        .then(list => {
                            setChildren(current => ({ ...current, [entry.path]: list }));
                            hydrateLibraryLens(list);
                        })
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
                            <span className="vault-file-name">{entry.name}</span>
                            {Object.prototype.hasOwnProperty.call(coordinates, entry.path) ? (
                                <span
                                    className="library-shelf-badge"
                                    data-testid={`library-shelf-${entry.path}`}
                                    data-coordinate={coordinates[entry.path] ?? ''}
                                    title="M5-0' Library coordinate shelf"
                                >
                                    {shelfFor(coordinates[entry.path])}
                                </span>
                            ) : null}
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
    return (
        <div
            className="vault-tree-pane"
            data-testid="vault-tree"
            data-projection-lens="pratibimba.daily.library-projection"
        >
            {renderEntries(rootEntries, 0)}
        </div>
    );
}
