import * as React from 'react';
import { readFileSync } from 'node:fs';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIVACY_CLASS,
    type NaraDayContainer,
    readNaraDayContainer
} from '../common';
import { HighlightMark, extractHighlights } from './editor/extensions/highlight-mark';
import {
    FloatingMenu,
    type AgentAction,
    type FloatingMenuState
} from './editor/components/floating-menu';
import { HighlightService } from './services/highlight-service';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from './privacy-chrome';

export interface CanvasEditorModel {
    readonly dayId: string | null;
    readonly nowPath: string | null;
    readonly nowContent: string;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly artifactCount: number;
    readonly profileGeneration: number | null;
    readonly pointerAnchor: string | null;
}

export interface CanvasEditorSurfaceProps {
    readonly model: CanvasEditorModel;
    readonly highlightService: HighlightService;
    readonly bridge: Pick<SharedBridgeAdapter, 'publish'>;
}

export interface CanvasEditorModelInput {
    readonly dayContainer?: NaraDayContainer | null;
    readonly context: Partial<CoordinateContext>;
    readonly nowContent?: string;
}

const CLOSED_FLOATING_MENU: FloatingMenuState = Object.freeze({
    isOpen: false,
    rect: null,
    selectedText: ''
});

@injectable()
export class M4NaraCanvasEditorWidget extends ReactWidget {
    static readonly ID = 'm4.nara.canvasEditor';
    static readonly LABEL = 'M4 Nara Canvas';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(HighlightService)
    protected readonly highlightService!: HighlightService;

    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected model: CanvasEditorModel = createCanvasEditorModel({
        context: EMPTY_COORDINATE_CONTEXT
    });
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M4NaraCanvasEditorWidget.ID;
        this.title.label = M4NaraCanvasEditorWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-canvas-widget');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                void this.reloadFromContext();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return (
            <CanvasEditorSurface
                model={this.model}
                highlightService={this.highlightService}
                bridge={this.bridge}
            />
        );
    }

    protected async reloadFromContext(): Promise<void> {
        const parsed = parseDayHandle(this.context.dayNowSessionHandle);
        if (!parsed) {
            this.model = createCanvasEditorModel({ context: this.context });
            this.update();
            return;
        }
        try {
            const dayContainer = await readNaraDayContainer({
                vaultRoot: parsed.vaultRoot,
                dayId: parsed.dayId
            });
            this.model = createCanvasEditorModel({
                dayContainer,
                context: this.context
            });
        } catch {
            this.model = createCanvasEditorModel({
                context: this.context,
                nowContent: ''
            });
        }
        this.update();
    }
}

export function createCanvasEditorModel(input: CanvasEditorModelInput): CanvasEditorModel {
    const dayContainer = input.dayContainer ?? null;
    const nowPath = dayContainer?.nowLineage[0] ?? null;
    const nowContent = input.nowContent ?? readProtectedNowContent(dayContainer);
    return Object.freeze({
        dayId: dayContainer?.dayId ?? parseDayHandle(input.context.dayNowSessionHandle ?? null)?.dayId ?? null,
        nowPath,
        nowContent,
        privacyClass: PRIVACY_CLASS,
        artifactCount: dayContainer?.artifactTree.length ?? 0,
        profileGeneration: input.context.profileGeneration ?? null,
        pointerAnchor: input.context.pointerAnchor ?? null
    });
}

export function CanvasEditorSurface({
    model,
    highlightService,
    bridge
}: CanvasEditorSurfaceProps): React.ReactElement {
    const [serviceVersion, setServiceVersion] = React.useState(0);

    React.useEffect(() => {
        const disposable = highlightService.onDidChange(() => setServiceVersion(version => version + 1));
        return () => disposable.dispose();
    }, [highlightService]);

    return (
        <section
            className={`m4-nara-canvas-editor ${privacyChromeClass(model.privacyClass)}`}
            data-test="m4-nara-canvas-editor"
            data-privacy-class={model.privacyClass}
            data-highlight-count={highlightService.getHighlights().length}
            data-service-version={serviceVersion}
        >
            <header className="m4-nara-canvas-editor-header">
                <h3>NOW Canvas</h3>
                <dl>
                    <dt>Day</dt>
                    <dd>{model.dayId ?? 'pending'}</dd>
                    <dt>NOW</dt>
                    <dd>{model.nowPath ?? 'pending'}</dd>
                    <dt>Privacy</dt>
                    <dd>{model.privacyClass}</dd>
                </dl>
            </header>
            {isInteractiveTiptapRuntime() ? (
                <TiptapCanvasEditor
                    model={model}
                    highlightService={highlightService}
                    bridge={bridge}
                />
            ) : (
                <article className="m4-nara-canvas-editor-static" data-test="m4-nara-canvas-static">
                    {model.nowContent}
                </article>
            )}
        </section>
    );
}

function TiptapCanvasEditor({
    model,
    highlightService,
    bridge
}: CanvasEditorSurfaceProps): React.ReactElement {
    const [menuState, setMenuState] = React.useState<FloatingMenuState>(CLOSED_FLOATING_MENU);
    const editor = useEditor({
        extensions: [
            StarterKit,
            HighlightMark,
            Placeholder.configure({
                placeholder: 'Write into today...'
            })
        ],
        content: model.nowContent,
        immediatelyRender: false,
        onUpdate: ({ editor: activeEditor }) => {
            highlightService.recordHighlights(extractHighlights(activeEditor.state.doc));
        },
        onSelectionUpdate: ({ editor: activeEditor }) => {
            const { selection } = activeEditor.state;
            if (selection.empty) {
                setMenuState(CLOSED_FLOATING_MENU);
                return;
            }
            const selectedText = activeEditor.state.doc.textBetween(selection.from, selection.to).trim();
            if (!selectedText) {
                setMenuState(CLOSED_FLOATING_MENU);
                return;
            }
            setMenuState({
                isOpen: true,
                rect: safeSelectionRect(activeEditor, selection.from, selection.to),
                selectedText
            });
        }
    });

    React.useEffect(() => {
        if (!editor || editor.getHTML() === model.nowContent) {
            return;
        }
        editor.commands.setContent(model.nowContent, { emitUpdate: false });
    }, [editor, model.nowContent]);

    const sendToAgent = (action: AgentAction, selectedText: string) => {
        bridge.publish({
            type: 'm4.artifact.created',
            extensionId: EXTENSION_ID,
            emittedAt: Date.now(),
            payload: Object.freeze({
                action: 'agent-selection',
                agentAction: action,
                selectedText,
                privacyClass: PRIVACY_CLASS,
                dayId: model.dayId,
                nowPath: model.nowPath
            })
        });
    };

    return (
        <div className="m4-nara-canvas-editor-live">
            <EditorContent editor={editor} />
            <FloatingMenu
                editor={editor}
                state={menuState}
                highlightService={highlightService}
                onClose={() => setMenuState(CLOSED_FLOATING_MENU)}
                onSendToAgent={sendToAgent}
            />
        </div>
    );
}

function readProtectedNowContent(dayContainer: NaraDayContainer | null): string {
    if (!dayContainer) {
        return '';
    }
    const nowArtifact = dayContainer.artifactTree[0];
    if (!nowArtifact) {
        return '';
    }
    try {
        return stripArtifactFrontmatter(readFileSync(nowArtifact.artifactPath, 'utf8')).trim();
    } catch {
        return nowArtifact.title;
    }
}

function stripArtifactFrontmatter(markdown: string): string {
    if (!markdown.startsWith('---')) {
        return markdown;
    }
    const end = markdown.indexOf('\n---', 3);
    return end >= 0 ? markdown.slice(end + 4) : markdown;
}

function isInteractiveTiptapRuntime(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        typeof window.getSelection === 'function' &&
        typeof document.addEventListener === 'function'
    );
}

function safeSelectionRect(
    editor: { view: { coordsAtPos(position: number): { left: number; right?: number; top: number; bottom: number } } },
    from: number,
    to: number
): DOMRect | null {
    try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const left = Math.min(start.left, end.left);
        const right = Math.max(start.right ?? start.left, end.right ?? end.left);
        const top = Math.min(start.top, end.top);
        const bottom = Math.max(start.bottom, end.bottom);
        if (typeof DOMRect !== 'undefined' && typeof DOMRect.fromRect === 'function') {
            return DOMRect.fromRect({ x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) });
        }
        return {
            x: left,
            y: top,
            left,
            right,
            top,
            bottom,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top),
            toJSON: () => ({})
        } as DOMRect;
    } catch {
        return null;
    }
}

function parseDayHandle(handle: string | null): { readonly vaultRoot: string; readonly dayId: string } | null {
    if (!handle) {
        return null;
    }
    const dayMatch = /(\d{4}-\d{2}-\d{2})/.exec(handle);
    if (!dayMatch) {
        return null;
    }
    const vaultRoot = handle.includes('/Pratibimba/Nara/')
        ? handle.slice(0, handle.indexOf('/Pratibimba/Nara/'))
        : process.cwd();
    return Object.freeze({
        vaultRoot,
        dayId: dayMatch[1]
    });
}
