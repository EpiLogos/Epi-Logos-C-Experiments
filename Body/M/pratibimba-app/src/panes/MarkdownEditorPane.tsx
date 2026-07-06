/**
 * Coordinate: M' (markdown editor pane, plan T2.2)
 * Actualises: file editing over the vault service — CodeMirror 6 markdown,
 *   debounced write-back where the S1 write scope permits, honest read-only
 *   banner elsewhere. Provenance state is worn, never hidden.
 */

import { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { invokeCommand } from '../bridge/tauri';
import { createDebouncedSaver, DebouncedSaver } from './debouncedSaver';

interface VaultFile {
    path: string;
    content: string;
    readOnly: boolean;
}

/** Frontmatter never shows in the writing surface — it is typed metadata,
 *  not prose. Split on load, reassemble on save (byte-preserving). */
export function splitFrontmatter(content: string): { frontmatter: string | null; body: string } {
    if (content.startsWith('---\n')) {
        const end = content.indexOf('\n---\n', 4);
        if (end !== -1) {
            return { frontmatter: content.slice(0, end + 5), body: content.slice(end + 5) };
        }
    }
    return { frontmatter: null, body: content };
}

export function MarkdownEditorPane({ path }: { path: string }) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [file, setFile] = useState<VaultFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<'clean' | 'dirty' | 'saving' | 'saved' | 'error'>('clean');
    const [fmOpen, setFmOpen] = useState(false);
    const [fm, setFm] = useState<string | null>(null);

    useEffect(() => {
        let view: EditorView | null = null;
        let saver: DebouncedSaver | null = null;
        let cancelled = false;

        invokeCommand<VaultFile>('vault_read', { path })
            .then(loaded => {
                if (cancelled || !hostRef.current) {
                    return;
                }
                setFile(loaded);
                const parts = splitFrontmatter(loaded.content);
                setFm(parts.frontmatter);
                saver = createDebouncedSaver(
                    body => invokeCommand<void>('vault_write', { path, content: (parts.frontmatter ?? '') + body }),
                    1500,
                    state => setSaveState(state)
                );
                view = new EditorView({
                    parent: hostRef.current,
                    state: EditorState.create({
                        doc: parts.body,
                        extensions: [
                            basicSetup,
                            markdown(),
                            EditorView.editable.of(!loaded.readOnly),
                            EditorView.updateListener.of(update => {
                                if (update.docChanged && !loaded.readOnly) {
                                    saver?.schedule(update.state.doc.toString());
                                }
                            }),
                            EditorView.theme({}, { dark: true })
                        ]
                    })
                });
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                }
            });

        return () => {
            cancelled = true;
            void saver?.flush();
            saver?.dispose();
            view?.destroy();
        };
    }, [path]);

    if (error) {
        return (
            <div className="pane-message" data-testid="editor-error">
                cannot open {path}: {error}
            </div>
        );
    }
    return (
        <div className="editor-pane" data-testid={`editor-${path}`}>
            {file?.readOnly ? (
                <div className="editor-banner" data-testid="editor-readonly-banner">
                    read-only — this surface writes only under Empty/Present/ (S1 scope)
                </div>
            ) : (
                <div className="editor-banner editor-banner-live" data-testid="editor-save-state">
                    {saveState === 'clean' ? 'ready' : saveState}
                </div>
            )}
            {fm ? (
                <div className="editor-frontmatter" data-testid="editor-frontmatter">
                    <button type="button" onClick={() => setFmOpen(open => !open)}>
                        {fmOpen ? '▾' : '▸'} frontmatter
                    </button>
                    {fmOpen ? <pre>{fm}</pre> : null}
                </div>
            ) : null}
            <div ref={hostRef} className="editor-host" />
        </div>
    );
}
