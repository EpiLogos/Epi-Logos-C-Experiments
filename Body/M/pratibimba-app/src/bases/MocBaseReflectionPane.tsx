/**
 * Coordinate: M' C5/CS MOC-Base carrier pane (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Actualises: live MOC membership/gap sections from evaluated Base definitions.
 * Public surface: MocBaseReflectionPane.
 * Does NOT own: vault writes, Base authorship, or coordinate meaning.
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import {
    EvaluatedBaseReflection,
    FileSystemEntry,
    FileSystemLike,
    loadCanvasBaseReflections,
    loadMocBaseSections
} from './mocBaseRuntime';
import { BasesViewPane } from './BasesViewPane';

const DEFAULT_MOC = 'Bimba/World/Types/Coordinates/S/S1/S1.md';
const DEFAULT_CANVAS = 'Bimba/World/Types/Coordinates/S/S1/S1.canvas';

const tauriVault: FileSystemLike = {
    readText: async path => {
        const file = await invokeCommand<{ content: string }>('vault_read', { path });
        return file.content;
    },
    list: async path => {
        const entries = await invokeCommand<readonly { path: string; isDir: boolean }[]>('vault_list', { path });
        return entries.map<FileSystemEntry>(entry => ({ path: entry.path, isDirectory: entry.isDir }));
    }
};

export interface MocBaseReflectionPaneProps {
    readonly mocPath?: string;
    readonly canvasPath?: string | null;
    readonly fileSystem?: FileSystemLike;
}

export function MocBaseReflectionPane({
    mocPath = DEFAULT_MOC,
    canvasPath = DEFAULT_CANVAS,
    fileSystem = tauriVault
}: MocBaseReflectionPaneProps) {
    const [sections, setSections] = useState<readonly EvaluatedBaseReflection[]>([]);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setState('loading');
        try {
            const [mocSections, canvasSections] = await Promise.all([
                loadMocBaseSections(mocPath, fileSystem),
                canvasPath ? loadCanvasBaseReflections(canvasPath, fileSystem) : Promise.resolve([])
            ]);
            setSections([...mocSections, ...canvasSections]);
            setError(null);
            setState('ready');
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setState('error');
        }
    }, [canvasPath, fileSystem, mocPath]);

    useEffect(() => {
        void refresh();
        let unlisten: (() => void) | undefined;
        void listenEvent('vault://changed', () => void refresh()).then(dispose => {
            unlisten = dispose;
        });
        return () => unlisten?.();
    }, [refresh]);

    return (
        <div className="moc-base-root" data-testid={`moc-base-${state}`}>
            <div className="pane-toolbar">
                <span>MOC Base</span>
                <code>{mocPath}</code>
                <button type="button" onClick={() => void refresh()}>refresh</button>
            </div>
            <BasesViewPane />
            {error ? <p className="pane-message">{error}</p> : null}
            {sections.map(section => (
                <section
                    key={`${section.heading}:${section.sourcePath}`}
                    className="moc-base-section"
                    data-testid={`moc-base-section-${slug(section.heading)}`}
                >
                    <header>
                        <h3>{section.heading}</h3>
                        <span>{section.rows.length} rows · {section.views.length} views</span>
                        <code>{section.sourcePath}</code>
                    </header>
                    <table>
                        <thead><tr><th>coordinate</th><th>role</th><th>path</th></tr></thead>
                        <tbody>
                            {section.rows.map(row => (
                                <tr key={row.file.path}>
                                    <td>{row.coordinate ?? 'uncoordinated'}</td>
                                    <td>{String(row.c_4_artifact_role ?? 'missing')}</td>
                                    <td>{row.file.path}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </div>
    );
}

function slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
