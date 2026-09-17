import * as React from 'react';
import URI from '@theia/core/lib/common/uri';
import { DisposableCollection } from '@theia/core/lib/common';
import { MonacoEditorProvider } from '@theia/monaco/lib/browser/monaco-editor-provider';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';
import { MonacoEditorModel } from '@theia/monaco/lib/browser/monaco-editor-model';
import * as monaco from '@theia/monaco-editor-core';

export interface CanonStudioMonacoMountProps {
    readonly uri: string | null;
    readonly content: string;
    readonly setContent: (content: string) => void;
    readonly editorProvider: MonacoEditorProvider;
    readonly decorations: readonly monaco.editor.IModelDeltaDecoration[];
    readonly diagnostics: readonly monaco.editor.IMarkerData[];
    readonly completionProvider: monaco.languages.CompletionItemProvider;
    readonly readOnly?: boolean;
}

export function CanonStudioMonacoMount(props: CanonStudioMonacoMountProps): React.ReactElement {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<MonacoEditor | null>(null);
    const decorationIds = React.useRef<readonly string[]>([]);

    React.useEffect(() => {
        const host = hostRef.current;
        if (!host || !props.uri) {
            return undefined;
        }

        let cancelled = false;
        const toDispose = new DisposableCollection();
        const completionDisposable = monaco.languages.registerCompletionItemProvider(
            'markdown',
            props.completionProvider
        );
        toDispose.push(completionDisposable);

        void props.editorProvider.createInline(new URI(props.uri), host, {
            language: 'markdown',
            wordWrap: 'on',
            minimap: { enabled: false },
            automaticLayout: true,
            readOnly: props.readOnly ?? false
        }).then(editor => {
            if (cancelled) {
                editor.dispose();
                return;
            }
            const model: MonacoEditorModel = editor.document;
            editor.setLanguage('markdown');
            model.textEditorModel.setValue(props.content);
            editorRef.current = editor;
            decorationIds.current = editor.getControl().deltaDecorations([], [...props.decorations]);
            monaco.editor.setModelMarkers(
                model.textEditorModel,
                'canon-studio-frontmatter',
                [...props.diagnostics]
            );
            toDispose.push(model.onDidChangeContent(() => {
                props.setContent(model.textEditorModel.getValue());
            }));
            toDispose.push(editor);
        });

        return () => {
            cancelled = true;
            const editor = editorRef.current;
            if (editor) {
                monaco.editor.setModelMarkers(editor.document.textEditorModel, 'canon-studio-frontmatter', []);
            }
            decorationIds.current = [];
            editorRef.current = null;
            toDispose.dispose();
        };
    }, [props.uri, props.editorProvider]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        const model = editor.document.textEditorModel;
        if (model.getValue() !== props.content) {
            model.setValue(props.content);
        }
    }, [props.content]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        decorationIds.current = editor.getControl().deltaDecorations(
            [...decorationIds.current],
            [...props.decorations]
        );
    }, [props.decorations]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        monaco.editor.setModelMarkers(
            editor.document.textEditorModel,
            'canon-studio-frontmatter',
            [...props.diagnostics]
        );
    }, [props.diagnostics]);

    return (
        <div
            ref={hostRef}
            className="ide-shell-canon-monaco"
            data-test="canon-studio-monaco"
            data-monaco-uri={props.uri ?? ''}
        />
    );
}

