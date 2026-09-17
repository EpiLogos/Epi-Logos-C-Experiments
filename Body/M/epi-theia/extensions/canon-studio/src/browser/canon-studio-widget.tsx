import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    buildSemanticAutocompleteRequest,
    buildVaultWriteRequest,
    CANON_STUDIO_WIDGET_ID,
    CanonAutocompleteItem,
    CanonDecoration,
    EXTENSION_ID
} from '../common';
import { CanonDecorationService } from './canon-decoration-service';

interface CanonBridgeRequest {
    readonly method: 'invokeGatewayRpc';
    readonly sessionKey: string;
    readonly params: Record<string, unknown>;
    readonly profileGeneration: number | null;
    readonly provenanceHandles: readonly string[];
    readonly vak: null;
}

interface CanonBridgeReceipt {
    readonly artifact: unknown;
}

interface CanonBridge {
    readonly cachedProfile?: { readonly generation?: number | null } | null;
    invokeCapability(request: CanonBridgeRequest): Promise<CanonBridgeReceipt>;
}

interface MonacoDisposable {
    dispose(): void;
}

interface MonacoEditorModel {
    getValue(): string;
}

interface MonacoEditor {
    getModel(): MonacoEditorModel | null;
    getValue(): string;
    deltaDecorations(oldDecorations: readonly string[], newDecorations: readonly unknown[]): string[];
    onDidChangeModelContent(listener: () => void): MonacoDisposable;
    dispose(): void;
}

interface MonacoApi {
    Range: new (line: number, startColumn: number, endLine: number, endColumn: number) => unknown;
    editor: {
        create(node: HTMLElement, options: Record<string, unknown>): MonacoEditor;
    };
    languages: {
        CompletionItemKind: { Reference: number };
        registerCompletionItemProvider(language: string, provider: unknown): MonacoDisposable;
    };
}

declare const monaco: MonacoApi | undefined;

@injectable()
export class CanonStudioWidget extends ReactWidget {
    static readonly ID = CANON_STUDIO_WIDGET_ID;
    static readonly LABEL = 'Canon Studio';

    @inject(CanonDecorationService)
    protected readonly decorations!: CanonDecorationService;

    protected documentUri = 'vault://Idea/Bimba/World/NOW.md';
    protected markdown = [
        '# Canon Studio',
        '',
        'Open a canon markdown artifact to edit QL #5.0 and [[Bimba]] references.'
    ].join('\n');
    protected lastSave: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = CanonStudioWidget.ID;
        this.title.label = CanonStudioWidget.LABEL;
        this.title.caption = 'Monaco markdown editor with QL/Bimba semantic assistance';
        this.title.closable = true;
        this.addClass('canon-studio-widget');
    }

    protected override render(): React.ReactNode {
        return (
            <CanonMarkdownEditor
                documentUri={this.documentUri}
                initialMarkdown={this.markdown}
                decorations={markdown => this.decorations.scan(markdown)}
                autocomplete={(prefix, line, column) =>
                    this.autocomplete(prefix, line, column)}
                save={markdown => this.save(markdown)}
                lastSave={this.lastSave}
            />
        );
    }

    protected async autocomplete(
        prefix: string,
        cursorLine: number,
        cursorColumn: number
    ): Promise<readonly CanonAutocompleteItem[]> {
        const request = buildSemanticAutocompleteRequest(
            this.documentUri,
            prefix,
            cursorLine,
            cursorColumn
        );
        const receipt = await this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: `${EXTENSION_ID}:semantic-autocomplete`,
            params: { ...request },
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
        return coerceAutocompleteItems(receipt);
    }

    protected async save(markdown: string): Promise<void> {
        this.markdown = markdown;
        const request = buildVaultWriteRequest(this.documentUri, markdown, [
            `${EXTENSION_ID}:monaco-editor`
        ]);
        await this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: `${EXTENSION_ID}:vault-write`,
            params: { ...request },
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: request.provenanceHandles,
            vak: null
        });
        this.lastSave = new Date().toISOString();
        this.update();
    }

    protected get bridge(): CanonBridge {
        const candidate = (globalThis as { pratibimbaKernelBridge?: CanonBridge })
            .pratibimbaKernelBridge;
        if (!candidate) {
            throw new Error(
                'Canon Studio requires globalThis.pratibimbaKernelBridge to dispatch S1 gateway requests.'
            );
        }
        return candidate;
    }
}

function CanonMarkdownEditor(props: {
    readonly documentUri: string;
    readonly initialMarkdown: string;
    readonly decorations: (markdown: string) => readonly CanonDecoration[];
    readonly autocomplete: (
        prefix: string,
        line: number,
        column: number
    ) => Promise<readonly CanonAutocompleteItem[]>;
    readonly save: (markdown: string) => Promise<void>;
    readonly lastSave: string | null;
}): React.ReactElement {
    const editorHost = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<MonacoEditor | null>(null);
    const decorationIds = React.useRef<readonly string[]>([]);
    const [fallbackMarkdown, setFallbackMarkdown] = React.useState(props.initialMarkdown);
    const [saving, setSaving] = React.useState(false);
    const [monacoReady, setMonacoReady] = React.useState(false);

    React.useEffect(() => {
        const api = currentMonaco();
        const node = editorHost.current;
        if (!api || !node || editorRef.current) {
            return undefined;
        }

        const editor = api.editor.create(node, {
            value: props.initialMarkdown,
            language: 'markdown',
            wordWrap: 'on',
            minimap: { enabled: false },
            automaticLayout: true
        });
        editorRef.current = editor;
        setMonacoReady(true);

        const updateDecorations = (): void => {
            decorationIds.current = editor.deltaDecorations(
                decorationIds.current,
                props.decorations(editor.getValue()).map(decoration =>
                    toMonacoDecoration(api, decoration)
                )
            );
        };
        const contentDisposable = editor.onDidChangeModelContent(updateDecorations);
        const completionDisposable = api.languages.registerCompletionItemProvider('markdown', {
            triggerCharacters: ['#', '[', '.', "'"],
            provideCompletionItems: async (
                model: MonacoEditorModel,
                position: { lineNumber: number; column: number }
            ) => {
                const prefix = prefixBeforeCursor(model, position.lineNumber, position.column);
                const items = await props.autocomplete(prefix, position.lineNumber, position.column);
                return {
                    suggestions: items.map(item => ({
                        label: item.label,
                        insertText: item.insertText,
                        detail: item.detail,
                        kind: api.languages.CompletionItemKind.Reference
                    }))
                };
            }
        });
        updateDecorations();

        return () => {
            contentDisposable.dispose();
            completionDisposable.dispose();
            editor.dispose();
            editorRef.current = null;
        };
    }, [props]);

    const currentMarkdown = (): string =>
        editorRef.current?.getValue() ?? fallbackMarkdown;

    const save = async (): Promise<void> => {
        setSaving(true);
        try {
            await props.save(currentMarkdown());
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="canon-studio-root">
            <header className="canon-studio-toolbar">
                <span className="canon-studio-uri">{props.documentUri}</span>
                <span className="canon-studio-state">
                    {monacoReady ? 'Monaco markdown' : 'Textarea fallback'}
                </span>
                <button
                    type="button"
                    className="theia-button"
                    disabled={saving}
                    onClick={() => void save()}
                >
                    {saving ? 'Saving' : 'Save'}
                </button>
            </header>
            <div ref={editorHost} className="canon-studio-monaco-host" />
            {!monacoReady && (
                <textarea
                    className="canon-studio-fallback"
                    value={fallbackMarkdown}
                    onChange={event => setFallbackMarkdown(event.currentTarget.value)}
                    aria-label="Canon Studio markdown editor fallback"
                />
            )}
            <footer className="canon-studio-footer">
                {props.lastSave ? `saved ${props.lastSave}` : 'unsaved'}
            </footer>
        </div>
    );
}

function currentMonaco(): MonacoApi | undefined {
    return typeof monaco === 'undefined' ? undefined : monaco;
}

function toMonacoDecoration(api: MonacoApi, decoration: CanonDecoration): Record<string, unknown> {
    return {
        range: new api.Range(
            decoration.line,
            decoration.startColumn,
            decoration.line,
            decoration.endColumn
        ),
        options: {
            inlineClassName: `canon-decoration-${decoration.kind}`,
            hoverMessage: { value: `${decoration.kind}: ${decoration.value}` }
        }
    };
}

function prefixBeforeCursor(model: MonacoEditorModel, lineNumber: number, column: number): string {
    const line = model.getValue().split('\n')[Math.max(0, lineNumber - 1)] ?? '';
    return line.slice(0, Math.max(0, column - 1)).split(/\s+/).at(-1) ?? '';
}

function coerceAutocompleteItems(
    receipt: CanonBridgeReceipt
): readonly CanonAutocompleteItem[] {
    const artifact = receipt.artifact;
    if (!artifact || typeof artifact !== 'object') {
        return Object.freeze([]);
    }
    const candidates = (artifact as { items?: unknown }).items;
    if (!Array.isArray(candidates)) {
        return Object.freeze([]);
    }
    return Object.freeze(candidates.flatMap(item => {
        if (!item || typeof item !== 'object') {
            return [];
        }
        const record = item as Record<string, unknown>;
        const label = typeof record.label === 'string' ? record.label : null;
        const insertText = typeof record.insertText === 'string'
            ? record.insertText
            : typeof record.insert_text === 'string'
              ? record.insert_text
              : label;
        if (!label || !insertText) {
            return [];
        }
        return [{
            label,
            insertText,
            detail: typeof record.detail === 'string' ? record.detail : 'S1 semantic candidate',
            provenanceHandle: typeof record.provenanceHandle === 'string'
                ? record.provenanceHandle
                : typeof record.provenance_handle === 'string'
                  ? record.provenance_handle
                  : 's1.semantic'
        }];
    }));
}
