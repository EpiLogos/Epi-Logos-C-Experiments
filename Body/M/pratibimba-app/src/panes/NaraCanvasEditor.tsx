/**
 * Coordinate: M' M4' (Nara canvas editor, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: the day's Markdown as a Tiptap canvas with protected-local marks.
 * Public surface: NaraCanvasEditor.
 * Does NOT own: S1 vault law, agent execution, or public/S2 projections.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

// Ported from frozen Body/M/epi-theia/extensions/m4-nara/src/browser/canvas-editor.tsx; active-carrier write-back added.
import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { invokeCommand } from '../bridge/tauri';
import { createDebouncedSaver, type DebouncedSaver } from './debouncedSaver';
import { splitFrontmatter } from './MarkdownEditorPane';
import { NaraFloatingMenu, type AgentSelectionAction, type FloatingMenuState } from './NaraFloatingMenu';
import {
    HighlightMark,
    NARA_PRIVACY_CLASS,
    USER_HIGHLIGHT_CATEGORIES,
    applyUserHighlight,
    extractHighlights,
    type UserHighlightCategory
} from './m4NaraHighlightMark';
import { HighlightService } from './m4NaraHighlightService';

interface VaultFile {
    readonly path: string;
    readonly content: string;
    readonly readOnly: boolean;
}

const CLOSED_MENU: FloatingMenuState = Object.freeze({ isOpen: false, selectedText: '' });

export function NaraCanvasEditor({
    path,
    highlightService
}: {
    readonly path: string;
    readonly highlightService?: HighlightService;
}) {
    const [file, setFile] = useState<VaultFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<'clean' | 'dirty' | 'saving' | 'saved' | 'error'>('clean');
    const [menu, setMenu] = useState<FloatingMenuState>(CLOSED_MENU);
    const [highlightCount, setHighlightCount] = useState(0);
    const ownedServiceRef = useRef(new HighlightService());
    const service = highlightService ?? ownedServiceRef.current;
    const saverRef = useRef<DebouncedSaver | null>(null);
    const frontmatterRef = useRef('');

    const editor = useEditor({
        extensions: [StarterKit, Markdown, HighlightMark, Placeholder.configure({ placeholder: 'Write into today...' })],
        content: '',
        contentType: 'markdown',
        immediatelyRender: false,
        editable: false,
        editorProps: { attributes: { 'aria-label': 'NOW canvas', 'data-testid': 'm4-nara-editor' } },
        onUpdate: ({ editor: activeEditor }) => {
            const highlights = extractHighlights(activeEditor.state.doc);
            service.recordHighlights(highlights);
            saverRef.current?.schedule(frontmatterRef.current + activeEditor.getMarkdown());
        },
        onSelectionUpdate: ({ editor: activeEditor }) => {
            const { from, to, empty } = activeEditor.state.selection;
            const selectedText = empty ? '' : activeEditor.state.doc.textBetween(from, to).trim();
            setMenu(selectedText ? { isOpen: true, selectedText } : CLOSED_MENU);
        }
    });

    useEffect(() => service.subscribe(() => {
        setHighlightCount(service.getHighlights().length);
    }), [service]);

    useEffect(() => service.subscribeInscriptions(inscription => {
        if (!editor) return;
        const docLimit = editor.state.doc.content.size;
        if (inscription.from < 1 || inscription.to <= inscription.from || inscription.to > docLimit) {
            throw new Error(`Agent inscription range ${inscription.from}..${inscription.to} is outside the canvas`);
        }
        editor.chain()
            .setTextSelection({ from: inscription.from, to: inscription.to })
            .setHighlight(inscription)
            .setTextSelection(inscription.to)
            .unsetHighlight()
            .run();
    }), [editor, service]);

    // CCT-5: the cmd-H two-stroke chord (App keydown spine) fires a user-side
    // highlight over the current selection by dispatching `m4.nara.user-highlight`
    // — the sibling of the `m4.nara.agent-selection` window event this pane
    // already emits. It runs the SAME `applyUserHighlight` path the FloatingMenu
    // buttons use; a category must be a known user category and there must be a
    // non-empty selection, or it no-ops.
    useEffect(() => {
        if (!editor) return;
        const onUserHighlight = (event: Event) => {
            const category = (event as CustomEvent<{ category?: string }>).detail?.category;
            if (!category || !(USER_HIGHLIGHT_CATEGORIES as readonly string[]).includes(category)) {
                return;
            }
            if (editor.state.selection.empty) {
                return;
            }
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to).trim();
            applyUserHighlight(editor, service, category as UserHighlightCategory, selectedText);
        };
        window.addEventListener('m4.nara.user-highlight', onUserHighlight as EventListener);
        return () => window.removeEventListener('m4.nara.user-highlight', onUserHighlight as EventListener);
    }, [editor, service]);

    useEffect(() => {
        let cancelled = false;
        void invokeCommand<VaultFile>('vault_read', { path }).then(loaded => {
            if (cancelled) return;
            const parts = splitFrontmatter(loaded.content);
            frontmatterRef.current = parts.frontmatter ?? '';
            saverRef.current = loaded.readOnly ? null : createDebouncedSaver(
                content => invokeCommand<void>('vault_write', { path, content }),
                1500,
                setSaveState
            );
            setFile(loaded);
            editor?.setEditable(!loaded.readOnly);
            editor?.commands.setContent(parts.body, { contentType: 'markdown', emitUpdate: false });
            service.recordHighlights(extractHighlights(editor?.state.doc ?? emptyDocument()));
        }).catch(cause => {
            if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
        });
        return () => {
            cancelled = true;
            void saverRef.current?.flush();
            saverRef.current?.dispose();
            saverRef.current = null;
        };
    }, [editor, path, service]);

    const sendToAgent = (action: AgentSelectionAction, selectedText: string) => {
        window.dispatchEvent(new CustomEvent('m4.nara.agent-selection', {
            detail: Object.freeze({ action, selectedText, privacyClass: NARA_PRIVACY_CLASS, path })
        }));
    };

    if (error) return <div className="pane-message" data-testid="m4-nara-canvas-error">cannot open {path}: {error}</div>;

    return (
        <section
            className="m4-nara-canvas"
            data-testid="m4-nara-canvas"
            data-privacy-class={NARA_PRIVACY_CLASS}
            data-highlight-count={highlightCount}
        >
            <div className="editor-banner editor-banner-live" data-testid="editor-save-state">
                {file?.readOnly ? 'read-only' : saveState === 'clean' ? 'ready' : saveState}
            </div>
            <EditorContent editor={editor} />
            <NaraFloatingMenu
                editor={editor}
                state={menu}
                service={service}
                onClose={() => setMenu(CLOSED_MENU)}
                onAgentAction={sendToAgent}
            />
        </section>
    );
}

function emptyDocument() {
    return { descendants: () => undefined };
}
