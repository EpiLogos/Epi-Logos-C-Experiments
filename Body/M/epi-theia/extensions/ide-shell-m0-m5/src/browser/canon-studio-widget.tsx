import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MonacoEditorProvider } from '@theia/monaco/lib/browser/monaco-editor-provider';
import * as monaco from '@theia/monaco-editor-core';
import type { CrossLayoutIntent } from '@pratibimba/pratibimba-layouts';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import * as MExtensionRuntime from '@pratibimba/m-extension-runtime/lib/common';
import { EXTENSION_ID, IDE_SHELL_INTENT_TARGETS, IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { decorateCoordinates } from '../common/decorations';
import { VAULT_BRIDGE_WRITE_COMMAND } from '../common/vault-bridge-gate';
import { CanonStudioMonacoMount } from './canon-studio/monaco-mount';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';
import '../../style/canon-studio-decorations.css';

const CANON_STUDIO_AUTOCOMPLETE_METHOD = "s1'.semantic.suggest";
const CANON_STUDIO_AUTOCOMPLETE_SESSION = 'canon-studio-autocomplete';
const CROSS_LAYOUT_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch';
const PASU_CONTRACT_REFERENCE = '25-m4 PASU.md frontmatter contract';
const PASU_URI_SUFFIX = 'Idea/Pratibimba/Self/PASU.md';

const PASU_KEYS = [
    'c_0_birth_date',
    'c_0_birth_location',
    'c_0_natal_chart_path',
    'c_2_jungian',
    'c_3_gene_keys',
    'c_4_human_design',
    'c_5_quintessence_hash',
    'c_5_quintessence_clock',
    'c_4_last_wound'
] as const;

type PasuKey = (typeof PASU_KEYS)[number];
type CanonStudioDeltaDecoration = monaco.editor.IModelDeltaDecoration;

interface CanonStudioReceipt {
    readonly privacyClass?: string | null;
    readonly artifact?: unknown;
    readonly status?: number;
    readonly reason?: string;
}

interface SemanticSuggestion {
    readonly label: string;
    readonly summary?: string;
    readonly coordinate?: string;
}

interface AutocompleteContext {
    readonly query: string;
    readonly replaceFromColumn: number;
    readonly replaceToColumn: number;
}

interface FrontmatterKey {
    readonly key: string;
    readonly value: string;
    readonly lineNumber: number;
}

/**
 * Result returned by Canon Studio save attempts. Per IOD-19, vault writes are
 * gated by the Hen vault-bridge. Until that extension lands (T4.5 gated on
 * Track 03 T6.5), Canon Studio saves MUST be rejected with the canonical
 * message "no vault-bridge registered". This file enforces that contract.
 */
export interface CanonStudioSaveResult {
    readonly ok: boolean;
    readonly reason: string;
    readonly routedThrough: 'vault-bridge' | 'rejected';
}

/**
 * Canon Studio: Monaco markdown editor with QL/Bimba decorations, Smart
 * Connections autocomplete through SharedBridgeAdapter, Hen vault-bridge save
 * routing, and PASU.md governed-write helpers.
 */
@injectable()
export class CanonStudioWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.CANON_STUDIO;
    static readonly LABEL = 'Canon Studio';
    static readonly VAULT_BRIDGE_WRITE_COMMAND = VAULT_BRIDGE_WRITE_COMMAND;

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    @inject(MonacoEditorProvider)
    protected readonly monacoEditorProvider!: MonacoEditorProvider;

    @inject(CommandRegistry)
    protected readonly commandRegistry!: CommandRegistry;

    protected uri: string | null = null;
    protected content: string = '';
    protected dirty: boolean = false;
    protected lastSaveResult: CanonStudioSaveResult | null = null;
    protected smartConnectionsStatus: string | null = null;
    public lastLogosAtelierIntent: CrossLayoutIntent | null = null;

    /** Injected by the contribution at activation time. */
    public vaultBridgeAvailable: () => boolean = () => false;
    public vaultBridgeWrite: (uri: string, content: string) => Promise<void> =
        async () => {
            throw new Error('canon-studio: vault-bridge dispatcher not initialised');
        };

    @postConstruct()
    protected init(): void {
        this.id = CanonStudioWidget.ID;
        this.title.label = CanonStudioWidget.LABEL;
        this.title.caption = CanonStudioWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-canon-studio');
    }

    openFile(uri: string, initialContent: string, privacyClass?: string): void {
        if (!isPrivacySafe(privacyClass)) {
            this.recordPrivacyDrop(privacyClass);
            this.lastSaveResult = {
                ok: false,
                reason: `canon-studio: refused to open file with privacy class "${privacyClass}"`,
                routedThrough: 'rejected'
            };
            this.update();
            return;
        }
        this.uri = uri;
        this.content = initialContent;
        this.dirty = false;
        this.lastSaveResult = null;
        this.smartConnectionsStatus = null;
        this.update();
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    setContent(content: string): void {
        if (this.content !== content) {
            this.content = content;
            this.dirty = true;
            this.update();
        }
    }

    /**
     * Attempt a save. ALWAYS routes through the vault-bridge command. If the
     * vault-bridge is not registered, the result is a clean rejection and
     * never a fall-through to Theia FS write.
     */
    async save(): Promise<CanonStudioSaveResult> {
        if (this.uri === null) {
            const result: CanonStudioSaveResult = {
                ok: false,
                reason: 'canon-studio: no file open',
                routedThrough: 'rejected'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
        if (!this.vaultBridgeAvailable()) {
            const result: CanonStudioSaveResult = {
                ok: false,
                reason: 'no vault-bridge registered',
                routedThrough: 'rejected'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
        try {
            await this.vaultBridgeWrite(this.uri, this.content);
            this.dirty = false;
            const result: CanonStudioSaveResult = {
                ok: true,
                reason: 'vault-bridge accepted write',
                routedThrough: 'vault-bridge'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            const result: CanonStudioSaveResult = {
                ok: false,
                reason,
                routedThrough: 'vault-bridge'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
    }

    async openInLogosAtelier(): Promise<void> {
        if (this.uri === null) {
            return;
        }
        const intent: CrossLayoutIntent = {
            coordinate: null,
            artifactUri: this.uri,
            reviewId: null,
            dayNow: null,
            sessionKey: 'canon-studio-logos-atelier',
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            privacyClass: null,
            requestedLayout: 'ide-deep',
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId: IDE_SHELL_INTENT_TARGETS.LOGOS_ATELIER,
            reason: 'Canon Studio governed write'
        };
        this.lastLogosAtelierIntent = intent;
        await this.commandRegistry.executeCommand(CROSS_LAYOUT_INTENT_DISPATCH_COMMAND, intent);
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={CanonStudioWidget.LABEL}>
                {this.renderEditor()}
            </IdeShellBridgeGate>
        );
    }

    protected renderEditor(): React.ReactNode {
        const diagnostics = lintFrontmatter(this.content);
        const decorations = buildInlineDecorations(this.content);
        const isPasu = isPasuUri(this.uri);
        return (
            <div
                className="ide-shell-widget-root"
                data-test="canon-studio-root"
                data-mutates-graph-canon="false"
            >
                <header className="ide-shell-widget-header">
                    <h3>{CanonStudioWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="vault-bridge.s1prime.vault.write_file"
                    />
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s1'.semantic.suggest"
                    />
                    <span data-test="canon-studio-uri">{this.uri ?? '(no file open)'}</span>
                    <span data-test="canon-studio-dirty">
                        {this.dirty ? 'dirty' : 'clean'}
                    </span>
                    <span data-test="canon-studio-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </span>
                </header>
                {isPasu && this.renderPasuEditors()}
                <section className="ide-shell-widget-detail canon-studio-editor-shell">
                    {this.uri ? (
                        <CanonStudioMonacoMount
                            uri={this.uri}
                            content={this.content}
                            setContent={content => this.setContent(content)}
                            editorProvider={this.monacoEditorProvider}
                            decorations={decorations}
                            diagnostics={diagnostics}
                            completionProvider={this.createCompletionProvider()}
                        />
                    ) : (
                        <p data-test="canon-studio-empty">No file open</p>
                    )}
                    <div className="canon-studio-actions">
                        <button
                            type="button"
                            data-test="canon-studio-save-button"
                            onClick={() => void this.save()}
                            disabled={this.uri === null}
                        >
                            Save (route through vault-bridge)
                        </button>
                        <button
                            type="button"
                            data-test="canon-studio-open-logos-atelier"
                            onClick={() => void this.openInLogosAtelier()}
                            disabled={this.uri === null}
                        >
                            Open in Logos Atelier
                        </button>
                    </div>
                    {this.smartConnectionsStatus && (
                        <p className="ide-shell-degraded" data-test="canon-studio-smart-status">
                            {this.smartConnectionsStatus}
                        </p>
                    )}
                    {this.lastSaveResult && (
                        <p
                            className={
                                this.lastSaveResult.ok
                                    ? 'ide-shell-save-ok'
                                    : 'ide-shell-save-rejected'
                            }
                            data-test="canon-studio-save-result"
                            data-save-ok={this.lastSaveResult.ok ? 'true' : 'false'}
                            data-routed-through={this.lastSaveResult.routedThrough}
                        >
                            {this.lastSaveResult.reason}
                        </p>
                    )}
                </section>
            </div>
        );
    }

    protected renderPasuEditors(): React.ReactNode {
        const frontmatter = readFrontmatter(this.content);
        return (
            <section
                className="canon-studio-pasu-editors"
                data-test="canon-studio-pasu-editors"
                data-contract={PASU_CONTRACT_REFERENCE}
            >
                <header>
                    <h4>PASU.md</h4>
                    <span>Open in Logos Atelier for governed write</span>
                </header>
                <div className="canon-studio-pasu-grid">
                    {PASU_KEYS.map(key => this.renderPasuField(key, frontmatter.get(key) ?? ''))}
                </div>
            </section>
        );
    }

    protected renderPasuField(key: PasuKey, value: string): React.ReactNode {
        const update = (next: string): void => this.updateFrontmatterValue(key, next);
        if (key === 'c_0_birth_date') {
            return (
                <label key={key}>
                    <span>{key}</span>
                    <input
                        type="date"
                        value={value}
                        onChange={event => update(event.currentTarget.value)}
                        data-test={`pasu-${key}`}
                    />
                </label>
            );
        }
        if (key === 'c_0_birth_location') {
            return (
                <label key={key}>
                    <span>{key}</span>
                    <input
                        type="search"
                        value={value}
                        placeholder="Location"
                        onChange={event => update(event.currentTarget.value)}
                        data-test={`pasu-${key}`}
                    />
                </label>
            );
        }
        if (key === 'c_0_natal_chart_path') {
            return (
                <label key={key}>
                    <span>{key}</span>
                    <input
                        type="text"
                        value={value}
                        placeholder="Vault-relative path"
                        onChange={event => update(event.currentTarget.value)}
                        data-test={`pasu-${key}`}
                    />
                </label>
            );
        }
        return (
            <label key={key}>
                <span>{key}</span>
                <input
                    type="text"
                    value={value}
                    onChange={event => update(event.currentTarget.value)}
                    data-test={`pasu-${key}`}
                />
            </label>
        );
    }

    protected updateFrontmatterValue(key: PasuKey, value: string): void {
        this.setContent(writeFrontmatterValue(this.content, key, value));
    }

    protected createCompletionProvider(): monaco.languages.CompletionItemProvider {
        return {
            triggerCharacters: ['[', '#', 'M', 'S', 'T', 'L', 'C', 'P'],
            provideCompletionItems: async (model, position) => {
                const context = completionContext(model, position);
                if (!context) {
                    return { suggestions: [] };
                }
                const receipt = await this.bridge.invokeCapability({
                    method: 'invokeGatewayRpc',
                    sessionKey: CANON_STUDIO_AUTOCOMPLETE_SESSION,
                    params: {
                        gatewayMethod: CANON_STUDIO_AUTOCOMPLETE_METHOD,
                        query: context.query,
                        limit: 20
                    },
                    profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                    provenanceHandles: [],
                    vak: null
                }) as CanonStudioReceipt;
                if (!isPrivacySafe(receipt.privacyClass)) {
                    this.recordPrivacyDrop(receipt.privacyClass);
                    return { suggestions: [] };
                }
                if (receipt.status === 503 || receipt.reason === 'pending-extension') {
                    this.smartConnectionsStatus = 'Smart Connections gated on Track 03 T6.5';
                    this.update();
                    return {
                        suggestions: [this.smartConnectionsPlaceholder(position, context)]
                    };
                }
                const suggestions = readSemanticSuggestions(receipt.artifact).map(candidate => ({
                    label: candidate.label,
                    kind: monaco.languages.CompletionItemKind.Reference,
                    documentation: candidate.summary,
                    insertText: candidate.coordinate ?? candidate.label,
                    range: new monaco.Range(
                        position.lineNumber,
                        context.replaceFromColumn,
                        position.lineNumber,
                        context.replaceToColumn
                    )
                }));
                this.smartConnectionsStatus = null;
                this.update();
                return { suggestions };
            }
        };
    }

    protected smartConnectionsPlaceholder(
        position: monaco.Position,
        context: AutocompleteContext
    ): monaco.languages.CompletionItem {
        return {
            label: 'Smart Connections gated on Track 03 T6.5',
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: context.query,
            documentation: 'The smart-connections-sidebar stub is still pending-extension.',
            range: new monaco.Range(
                position.lineNumber,
                context.replaceFromColumn,
                position.lineNumber,
                context.replaceToColumn
            )
        };
    }
}

function buildInlineDecorations(content: string): CanonStudioDeltaDecoration[] {
    const decorations: CanonStudioDeltaDecoration[] = [];
    const seenOffsets = new Map<string, number>();
    for (const decoration of decorateCoordinates(content)) {
        const startSearch = seenOffsets.get(decoration.match) ?? 0;
        const offset = content.indexOf(decoration.match, startSearch);
        if (offset < 0) {
            continue;
        }
        seenOffsets.set(decoration.match, offset + decoration.match.length);
        const start = offsetToPosition(content, offset);
        const end = offsetToPosition(content, offset + decoration.match.length);
        decorations.push({
            range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
            options: {
                inlineClassName: decoration.kind === 'wikilink' ? 'bimba-wikilink' : 'ql-coordinate',
                hoverMessage: { value: `${decoration.kind}: ${decoration.match}` }
            }
        });
    }
    for (const key of frontmatterKeys(content)) {
        decorations.push({
            range: new monaco.Range(key.lineNumber, 1, key.lineNumber, key.key.length + 1),
            options: {
                inlineClassName: 'frontmatter-key',
                hoverMessage: { value: `frontmatter: ${key.key}` }
            }
        });
    }
    return decorations;
}

function lintFrontmatter(content: string): monaco.editor.IMarkerData[] {
    return frontmatterKeys(content).flatMap(key => {
        if (isAllowedFrontmatterKey(key.key)) {
            return [];
        }
        return [{
            severity: monaco.MarkerSeverity.Warning,
            message: `Frontmatter key "${key.key}" is outside C_FAMILY_SCHEMA.`,
            startLineNumber: key.lineNumber,
            startColumn: 1,
            endLineNumber: key.lineNumber,
            endColumn: key.key.length + 1
        }];
    });
}

function isAllowedFrontmatterKey(key: string): boolean {
    if (key === 'coordinate') {
        return true;
    }
    const schemaKeys = cFamilySchemaKeys();
    if (schemaKeys.has(key)) {
        return true;
    }
    return /^c_[0-5]_[a-z0-9_]+$/i.test(key);
}

function cFamilySchemaKeys(): ReadonlySet<string> {
    const schema = (MExtensionRuntime as { C_FAMILY_SCHEMA?: unknown }).C_FAMILY_SCHEMA;
    const keys = new Set<string>(PASU_KEYS);
    if (schema && typeof schema === 'object') {
        const maybeKeys = (schema as { keys?: unknown; properties?: unknown }).keys;
        if (Array.isArray(maybeKeys)) {
            for (const key of maybeKeys) {
                if (typeof key === 'string') {
                    keys.add(key);
                }
            }
        }
        const properties = (schema as { properties?: unknown }).properties;
        if (properties && typeof properties === 'object') {
            for (const key of Object.keys(properties)) {
                keys.add(key);
            }
        }
    }
    return keys;
}

function completionContext(
    model: Pick<monaco.editor.ITextModel, 'getLineContent'>,
    position: monaco.Position
): AutocompleteContext | null {
    const linePrefix = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
    const wikilinkMatch = /\[\[([^\]]*)$/.exec(linePrefix);
    const coordMatch = /([#SMTLCP][0-9-]*)$/.exec(linePrefix);
    if (!wikilinkMatch && !coordMatch) {
        return null;
    }
    const query = wikilinkMatch?.[1] ?? coordMatch?.[1] ?? '';
    const replaceFromColumn = position.column - query.length;
    return {
        query,
        replaceFromColumn,
        replaceToColumn: position.column
    };
}

function readSemanticSuggestions(artifact: unknown): SemanticSuggestion[] {
    if (!artifact || typeof artifact !== 'object') {
        return [];
    }
    const suggestions = (artifact as { suggestions?: unknown }).suggestions;
    if (!Array.isArray(suggestions)) {
        return [];
    }
    return suggestions.flatMap(candidate => {
        if (!candidate || typeof candidate !== 'object') {
            return [];
        }
        const record = candidate as Record<string, unknown>;
        const label = typeof record.label === 'string' ? record.label : null;
        if (!label) {
            return [];
        }
        return [{
            label,
            summary: typeof record.summary === 'string' ? record.summary : undefined,
            coordinate: typeof record.coordinate === 'string' ? record.coordinate : undefined
        }];
    });
}

function frontmatterKeys(content: string): FrontmatterKey[] {
    const block = frontmatterBlock(content);
    if (!block) {
        return [];
    }
    return block.lines.flatMap((line, index) => {
        const match = /^([A-Za-z0-9_'-]+)\s*:\s*(.*)$/.exec(line);
        if (!match) {
            return [];
        }
        return [{
            key: match[1],
            value: match[2],
            lineNumber: block.startLine + index + 1
        }];
    });
}

function readFrontmatter(content: string): ReadonlyMap<string, string> {
    const values = new Map<string, string>();
    for (const key of frontmatterKeys(content)) {
        values.set(key.key, unquoteFrontmatterValue(key.value));
    }
    return values;
}

function writeFrontmatterValue(content: string, key: string, value: string): string {
    const block = frontmatterBlock(content);
    const line = `${key}: ${quoteFrontmatterValue(value)}`;
    if (!block) {
        return `---\n${line}\n---\n${content}`;
    }
    const lines = [...block.lines];
    const index = lines.findIndex(candidate => candidate.startsWith(`${key}:`));
    if (index >= 0) {
        lines[index] = line;
    } else {
        lines.push(line);
    }
    return [
        '---',
        ...lines,
        '---',
        content.slice(block.bodyOffset)
    ].join('\n');
}

function frontmatterBlock(content: string): {
    readonly lines: readonly string[];
    readonly startLine: number;
    readonly bodyOffset: number;
} | null {
    if (!content.startsWith('---\n')) {
        return null;
    }
    const end = content.indexOf('\n---', 4);
    if (end < 0) {
        return null;
    }
    const bodyOffset = content.indexOf('\n', end + 4) + 1 || content.length;
    return {
        lines: content.slice(4, end).split('\n'),
        startLine: 1,
        bodyOffset
    };
}

function quoteFrontmatterValue(value: string): string {
    if (value === '') {
        return '""';
    }
    return JSON.stringify(value);
}

function unquoteFrontmatterValue(value: string): string {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function isPasuUri(uri: string | null): boolean {
    if (!uri) {
        return false;
    }
    return uri.endsWith(PASU_URI_SUFFIX) || uri.endsWith(`/${PASU_URI_SUFFIX}`);
}

function offsetToPosition(content: string, offset: number): { lineNumber: number; column: number } {
    const prefix = content.slice(0, offset);
    const lines = prefix.split('\n');
    return {
        lineNumber: lines.length,
        column: lines[lines.length - 1].length + 1
    };
}
