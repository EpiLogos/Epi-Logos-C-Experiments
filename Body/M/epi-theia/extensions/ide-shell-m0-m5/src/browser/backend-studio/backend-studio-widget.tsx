import * as React from 'react';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import { isPrivacySafe } from '../../common/contract';
import { PrivacyDropFeed } from '../services/privacy-drop-feed';
import {
    BACKEND_STUDIO_OPEN_SOURCE_COMMAND,
    BACKEND_STUDIO_LABEL,
    BACKEND_STUDIO_WIDGET_ID
} from './backend-studio-service';

export interface BackendStudioFileHit {
    readonly coordinate: string;
    readonly path: string;
    readonly sourceAnchor: string;
    readonly language: string;
    readonly preview: string;
    readonly proofAnchors: readonly BackendStudioProofAnchor[];
    readonly privacyClass?: string | null;
}

export interface BackendStudioProofAnchor {
    readonly label: string;
    readonly coordinate: string;
    readonly artifactUri: string;
    readonly line?: number;
    readonly privacyClass?: string | null;
}

export interface BackendStudioLineDecoration {
    readonly line: number;
    readonly kind: 'coordinate-aware-line';
    readonly coordinate: string;
}

@injectable()
export class BackendStudioWidget extends ReactWidget {
    static readonly ID = BACKEND_STUDIO_WIDGET_ID;
    static readonly LABEL = BACKEND_STUDIO_LABEL;

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(CommandRegistry)
    protected readonly commands!: CommandRegistry;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    protected coordinatePrefix = '#';
    protected fileHits: readonly BackendStudioFileHit[] = Object.freeze([]);
    protected selectedFile: BackendStudioFileHit | null = null;
    protected error: string | null = null;
    protected searching = false;

    @postConstruct()
    protected init(): void {
        this.id = BackendStudioWidget.ID;
        this.title.label = BackendStudioWidget.LABEL;
        this.title.caption = BackendStudioWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-backend-studio');
    }

    async findFilesByCoordinatePrefix(coordinatePrefix: string): Promise<void> {
        this.coordinatePrefix = coordinatePrefix;
        this.searching = true;
        this.error = null;
        this.update();
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'backend-studio-coordinate-search',
                params: {
                    gatewayMethod: "s1'.semantic.find_by_coordinate",
                    coordinatePrefix
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.fileHits = Object.freeze([]);
                this.selectedFile = null;
                this.error = `privacy class refused: ${receipt.privacyClass}`;
                return;
            }
            this.fileHits = normalizeFileHits(receipt);
            this.selectedFile = this.fileHits[0] ?? null;
        } catch (err) {
            this.fileHits = Object.freeze([]);
            this.selectedFile = null;
            this.error = err instanceof Error ? err.message : String(err);
        } finally {
            this.searching = false;
            this.update();
        }
    }

    selectFile(hit: BackendStudioFileHit): void {
        this.selectedFile = hit;
        this.error = null;
        this.update();
    }

    async openSelectedSource(): Promise<void> {
        if (this.selectedFile === null) {
            return;
        }
        await this.commands.executeCommand(
            BACKEND_STUDIO_OPEN_SOURCE_COMMAND,
            this.selectedFile.coordinate,
            this.selectedFile.sourceAnchor
        );
    }

    async openProofInCanonStudio(anchor: BackendStudioProofAnchor): Promise<void> {
        if (!isPrivacySafe(anchor.privacyClass)) {
            this.recordPrivacyDrop(anchor.privacyClass);
            this.error = `privacy class refused: ${anchor.privacyClass}`;
            this.update();
            return;
        }
        await this.commands.executeCommand('pratibimba.intent.open-canon-studio-file', {
            kind: 'open-canon-studio-file',
            coordinate: anchor.coordinate,
            artifactUri: anchor.artifactUri,
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'canon-studio',
            privacyClass: anchor.privacyClass ?? null
        });
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    protected override render(): React.ReactNode {
        const decorations = decorateBackendStudioLines(this.selectedFile?.preview ?? '');
        return (
            <div className="ide-shell-widget-root backend-studio-root" data-test="backend-studio-root">
                <header className="ide-shell-widget-header">
                    <h3>{BackendStudioWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s1'.semantic.find_by_coordinate"
                    />
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s2.graph.node"
                    />
                    <span data-test="backend-studio-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </span>
                </header>
                <section className="backend-studio-layout">
                    {this.renderFileTree()}
                    {this.renderMonacoEditor(decorations)}
                    {this.renderProofNavigation()}
                </section>
                {this.error && (
                    <p className="ide-shell-error" data-test="backend-studio-error">
                        {this.error}
                    </p>
                )}
            </div>
        );
    }

    protected renderFileTree(): React.ReactNode {
        return (
            <aside className="backend-studio-panel backend-studio-file-tree">
                <form
                    onSubmit={event => {
                        event.preventDefault();
                        void this.findFilesByCoordinatePrefix(this.coordinatePrefix);
                    }}
                >
                    <label>
                        Coordinate prefix
                        <input
                            value={this.coordinatePrefix}
                            onChange={event => {
                                this.coordinatePrefix = event.currentTarget.value;
                                this.update();
                            }}
                            data-test="backend-studio-coordinate-prefix"
                        />
                    </label>
                    <button type="submit" disabled={this.searching}>
                        Find
                    </button>
                </form>
                <ul data-test="backend-studio-file-hits">
                    {this.fileHits.map(hit => (
                        <li key={`${hit.coordinate}-${hit.path}`}>
                            <button
                                type="button"
                                onClick={() => this.selectFile(hit)}
                                data-selected={this.selectedFile === hit ? 'true' : 'false'}
                            >
                                <code>{hit.coordinate}</code>
                                <span>{hit.path}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        );
    }

    protected renderMonacoEditor(decorations: readonly BackendStudioLineDecoration[]): React.ReactNode {
        const content = this.selectedFile?.preview ?? '';
        const decoratedLines = new Map(decorations.map(d => [d.line, d]));
        return (
            <main
                className="backend-studio-panel backend-studio-monaco-editor"
                aria-label="Monaco editor"
                data-test="backend-studio-monaco-editor"
            >
                <div className="backend-studio-editor-toolbar">
                    <span>{this.selectedFile?.sourceAnchor ?? 'No source selected'}</span>
                    <button
                        type="button"
                        onClick={() => void this.openSelectedSource()}
                        disabled={this.selectedFile === null}
                    >
                        Open Source
                    </button>
                </div>
                <pre data-test="backend-studio-coordinate-aware-lines">
                    {content.split('\n').map((line, index) => {
                        const decoration = decoratedLines.get(index + 1);
                        return (
                            <span
                                key={`${index}-${line}`}
                                className={decoration?.kind}
                                data-coordinate={decoration?.coordinate}
                            >
                                {line}
                                {'\n'}
                            </span>
                        );
                    })}
                </pre>
            </main>
        );
    }

    protected renderProofNavigation(): React.ReactNode {
        const anchors = this.selectedFile?.proofAnchors ?? Object.freeze([]);
        return (
            <aside
                className="backend-studio-panel backend-studio-proof-navigation"
                data-test="proof-navigation"
            >
                <h4>Proof Navigation</h4>
                <ul>
                    {anchors.map(anchor => (
                        <li key={`${anchor.coordinate}-${anchor.artifactUri}-${anchor.label}`}>
                            <button
                                type="button"
                                onClick={() => void this.openProofInCanonStudio(anchor)}
                            >
                                <span>{anchor.label}</span>
                                <code>{anchor.coordinate}</code>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        );
    }
}

export function decorateBackendStudioLines(content: string): readonly BackendStudioLineDecoration[] {
    const decorations: BackendStudioLineDecoration[] = [];
    const coordinatePattern = /(?:^|[^\w])((?:M|S)\d(?:[-./][\w'.-]+)*|#[0-5](?:[-./]\d+)*)/;
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const match = coordinatePattern.exec(line);
        if (match) {
            decorations.push({
                line: index + 1,
                kind: 'coordinate-aware-line',
                coordinate: match[1]
            });
        }
    });
    return Object.freeze(decorations);
}

function normalizeFileHits(receipt: KernelBridgeCapabilityReceipt): readonly BackendStudioFileHit[] {
    const artifact = receipt.artifact;
    const rawHits = Array.isArray(artifact)
        ? artifact
        : artifact && typeof artifact === 'object' && Array.isArray((artifact as { results?: unknown[] }).results)
          ? (artifact as { results: unknown[] }).results
          : [];
    return Object.freeze(rawHits.map((hit, index) => normalizeFileHit(hit, index, receipt.privacyClass)));
}

function normalizeFileHit(
    hit: unknown,
    index: number,
    receiptPrivacyClass: string | null
): BackendStudioFileHit {
    const record = hit !== null && typeof hit === 'object'
        ? (hit as Record<string, unknown>)
        : {};
    const coordinate = stringField(record, ['coordinate', 'coord']) ?? `unresolved-${index}`;
    const path = stringField(record, ['path', 'uri', 'sourceAnchor', 'source_anchor']) ?? coordinate;
    const sourceAnchor = stringField(record, ['sourceAnchor', 'source_anchor', 'codeAnchor', 'code_anchor', 'path', 'uri']) ?? path;
    const preview = stringField(record, ['preview', 'content', 'snippet']) ?? '';
    const language = stringField(record, ['language', 'languageId']) ?? inferLanguage(path);
    const proofAnchors = normalizeProofAnchors(record.proofAnchors ?? record.proof_anchors, coordinate);
    const privacyClass = stringField(record, ['privacyClass', 'privacy_class']) ?? receiptPrivacyClass;
    return {
        coordinate,
        path,
        sourceAnchor,
        language,
        preview,
        proofAnchors,
        privacyClass
    };
}

function normalizeProofAnchors(value: unknown, coordinate: string): readonly BackendStudioProofAnchor[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(value.map((anchor, index) => {
        const record = anchor !== null && typeof anchor === 'object'
            ? (anchor as Record<string, unknown>)
            : {};
        const artifactUri = stringField(record, ['artifactUri', 'artifact_uri', 'uri']) ?? '';
        return {
            label: stringField(record, ['label', 'title']) ?? `Proof ${index + 1}`,
            coordinate: stringField(record, ['coordinate', 'coord']) ?? coordinate,
            artifactUri,
            line: numberField(record, ['line']),
            privacyClass: stringField(record, ['privacyClass', 'privacy_class'])
        };
    }));
}

function stringField(record: Record<string, unknown>, fields: readonly string[]): string | null {
    for (const field of fields) {
        const value = record[field];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
}

function numberField(record: Record<string, unknown>, fields: readonly string[]): number | undefined {
    for (const field of fields) {
        const value = record[field];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }
    return undefined;
}

function inferLanguage(path: string): string {
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.h') || path.endsWith('.hpp') || path.endsWith('.c')) return 'cpp';
    return 'plaintext';
}
