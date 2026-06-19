import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandRegistry } from '@theia/core/lib/common';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import {
    SharedBridgeAdapter,
    type CoordinateContext
} from '@pratibimba/m-extension-runtime';
import type { CrossLayoutIntent, IntentPrivacyClass } from '@pratibimba/pratibimba-layouts';
import { EXTENSION_ID, IDE_SHELL_INTENT_TARGETS, IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';
import '../../style/coordinate-tree.css';

const CROSS_LAYOUT_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch' as const;
const COORDINATE_FAMILIES = ['P', 'S', 'T', 'M', 'L', 'C'] as const;

export type CoordinateFamily = (typeof COORDINATE_FAMILIES)[number];
export type CoordinateSurfaceMode = 'reading' | 'authoring';

/**
 * Bimba coordinate tree — Track 05 T4.
 *
 * Sibling to the Bimba graph viewer; consumes the same S2 coordinate-tree
 * payload via `KERNEL_BRIDGE_API.invokeCapability` with method `invokeGatewayRpc`
 * and the inner `s2'.coordinate.resolve` gateway method. Renders the
 * hierarchical coordinate tree (e.g. M-coordinate parents/children) so users
 * can drill into a sub-tree without leaving the IDE.
 */
export interface CoordinateNode {
    readonly coordinate: string;
    readonly label?: string;
    readonly namespace?: string;
    readonly privacyClass?: string | null;
    readonly pointer?: string | null;
    readonly pointerAnchor?: string | { readonly path?: string; readonly uri?: string } | null;
    readonly sourceAnchor?: string | null;
    readonly artifactUri?: string | null;
    readonly children?: readonly CoordinateNode[];
}

export interface RenderCoordinateTreeOptions {
    readonly activeCoordinate: string | null;
    readonly expanded: ReadonlySet<string>;
    readonly surfaceMode: CoordinateSurfaceMode;
    readonly inheritedPrivacyClass?: string | null;
    readonly onSelectCoordinate: (coordinate: string, node: CoordinateNode) => void;
    readonly onToggleExpanded: (coordinate: string) => void;
    readonly onProposeCanonicalEdit: (node: CoordinateNode) => void;
}

@injectable()
export class CoordinateTreeWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.COORDINATE_TREE;
    static readonly LABEL = 'Bimba Coordinate Tree';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(SharedBridgeAdapter)
    protected readonly sharedBridge!: SharedBridgeAdapter;

    @inject(CommandRegistry)
    protected readonly commandRegistry!: CommandRegistry;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    protected root: CoordinateNode | null = null;
    protected error: string | null = null;
    protected activeCoordinate: string | null = null;
    protected surfaceMode: 'reading' | 'authoring' = 'reading';
    protected expanded: Set<string> = new Set<string>();
    protected readonly disposers: Array<{ dispose(): void }> = [];
    protected readonly mutatesGraphCanon = false;
    protected treePrivacyClass: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = CoordinateTreeWidget.ID;
        this.title.label = CoordinateTreeWidget.LABEL;
        this.title.caption = CoordinateTreeWidget.LABEL;
        this.title.closable = true;

        /* 28.18 status-bar consumption contract: sessionKey/profileGeneration
           rendered in coordinate tree dispatch MUST consume from bridge.cachedProfile?.generation,
           NOT from own widget state. 15.10 owns status-bar build; 28.18 adds consumption-only contract. */
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-coordinate-tree');
        this.disposers.push(this.sharedBridge.onCoordinateContext(context => {
            const next = context.selectedCoordinate ?? context.canonicalMCoordinate;
            if (next !== this.activeCoordinate) {
                this.activeCoordinate = next;
                this.update();
            }
        }));
        this.toDispose.push({
            dispose: () => this.disposeSubscriptions()
        });
    }

    async loadTree(rootCoordinate: string): Promise<void> {
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-coordinate-tree',
                params: { gatewayMethod: "s2'.coordinate.resolve", coordinate: rootCoordinate },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            this.treePrivacyClass = receipt.privacyClass ?? null;
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.root =
                    receipt.artifact && typeof receipt.artifact === 'object'
                        ? applyInheritedPrivacyClass(receipt.artifact as CoordinateNode, receipt.privacyClass)
                        : null;
                this.error = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                this.root =
                    receipt.artifact && typeof receipt.artifact === 'object'
                        ? (receipt.artifact as CoordinateNode)
                        : null;
                this.error = null;
            }
            if (this.root) {
                this.seedExpanded(this.root);
            }
        } catch (err) {
            this.error = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    focusCoordinate(coordinate: string): void {
        this.activeCoordinate = coordinate;
        this.update();
    }

    expandFamily(family: CoordinateFamily): void {
        if (this.root === null) {
            return;
        }
        this.visit(this.root, node => {
            if (coordinateFamily(node.coordinate) === family && hasChildren(node)) {
                this.expanded.add(node.coordinate);
            }
        });
        this.update();
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    protected disposeSubscriptions(): void {
        while (this.disposers.length > 0) {
            const disposable = this.disposers.pop();
            try {
                disposable?.dispose();
            } catch {
                // best-effort cleanup during Theia widget disposal
            }
        }
    }

    protected toggleSurfaceMode(): void {
        this.surfaceMode = this.surfaceMode === 'reading' ? 'authoring' : 'reading';
        this.update();
    }

    protected toggleExpanded(coordinate: string): void {
        if (this.expanded.has(coordinate)) {
            this.expanded.delete(coordinate);
        } else {
            this.expanded.add(coordinate);
        }
        this.update();
    }

    protected seedExpanded(node: CoordinateNode): void {
        if (hasChildren(node) && !this.expanded.has(node.coordinate)) {
            this.expanded.add(node.coordinate);
        }
        for (const child of node.children ?? []) {
            this.seedExpanded(child);
        }
    }

    protected visit(node: CoordinateNode, visitor: (node: CoordinateNode) => void): void {
        visitor(node);
        for (const child of node.children ?? []) {
            this.visit(child, visitor);
        }
    }

    protected handleSelectCoordinate(coordinate: string, node: CoordinateNode): void {
        this.activeCoordinate = coordinate;
        this.publishCoordinateContext(coordinate, node);
        this.update();
    }

    protected publishCoordinateContext(coordinate: string, node: CoordinateNode): void {
        const snapshot = this.sharedBridge.currentSnapshot();
        const previous = snapshot.context;
        const generation = this.bridge.cachedProfile?.generation ??
            previous.profileGeneration ??
            snapshot.profile?.generation ??
            null;
        const next: CoordinateContext = Object.freeze({
            ...previous,
            selectedCoordinate: coordinate,
            canonicalMCoordinate: coordinate,
            pointerAnchor: pointerAnchorToString(node) ?? previous.pointerAnchor,
            profileGeneration: generation,
            privacyClass: previous.privacyClass ?? 'public_current',
            provenance: Object.freeze({
                source: 'coordinate-tree',
                generation,
                notes: Object.freeze([
                    ...previous.provenance.notes,
                    "publishCoordinateContext({ selectedCoordinate: coordinate, source: 'coordinate-tree' })"
                ] as string[]) as readonly string[]
            })
        });
        this.sharedBridge.updateCoordinateContext(next);
    }

    protected proposeCanonicalEdit(node: CoordinateNode): void {
        if (isPrivacyBlocked(node.privacyClass ?? this.treePrivacyClass)) {
            this.recordPrivacyDrop(node.privacyClass ?? this.treePrivacyClass);
            return;
        }
        const intent: CrossLayoutIntent = {
            coordinate: node.coordinate,
            artifactUri: artifactUriFromPointerAnchor(node),
            reviewId: null,
            dayNow: null,
            sessionKey: 'ide-shell-coordinate-tree',
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            privacyClass: toIntentPrivacyClass(node.privacyClass ?? this.treePrivacyClass),
            requestedLayout: 'ide-deep',
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId: IDE_SHELL_INTENT_TARGETS.CANON_STUDIO,
            reason: 'coordinate-tree.propose-canonical-edit'
        };
        void this.commandRegistry.executeCommand(CROSS_LAYOUT_INTENT_DISPATCH_COMMAND, intent);
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate
                bridge={this.bridge}
                widgetLabel={CoordinateTreeWidget.LABEL}
            >
                {this.renderTree()}
            </IdeShellBridgeGate>
        );
    }

    protected renderTree(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="coordinate-tree-root">
                <header className="ide-shell-widget-header">
                    <h3>{CoordinateTreeWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s2'.coordinate.resolve"
                    />
                    <button
                        type="button"
                        className="coordinate-tree-mode-toggle"
                        data-test="coordinate-tree-surface-mode-toggle"
                        aria-pressed={this.surfaceMode === 'authoring'}
                        onClick={() => this.toggleSurfaceMode()}
                    >
                        {this.surfaceMode === 'reading' ? 'Reading' : 'Authoring'}
                    </button>
                </header>
                <section className="ide-shell-widget-detail">
                    {this.error !== null && (
                        <p className="ide-shell-error" data-test="coordinate-tree-error">
                            {this.error}
                        </p>
                    )}
                    <p data-test="coordinate-tree-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </p>
                    {this.root === null ? (
                        <p className="ide-shell-widget-empty" data-test="coordinate-tree-empty">
                            Awaiting S2 coordinate tree payload (gateway method:{' '}
                            <code>s2&apos;.coordinate.resolve</code>).
                        </p>
                    ) : (
                        <ul data-test="coordinate-tree-list">
                            {renderTree(this.root, {
                                activeCoordinate: this.activeCoordinate,
                                expanded: this.expanded,
                                surfaceMode: this.surfaceMode,
                                inheritedPrivacyClass: this.treePrivacyClass,
                                onSelectCoordinate: (coordinate, node) =>
                                    this.handleSelectCoordinate(coordinate, node),
                                onToggleExpanded: coordinate => this.toggleExpanded(coordinate),
                                onProposeCanonicalEdit: node => this.proposeCanonicalEdit(node)
                            })}
                        </ul>
                    )}
                </section>
            </div>
        );
    }
}

export function renderTree(
    node: CoordinateNode,
    options: RenderCoordinateTreeOptions,
    depth: number = 0
): React.ReactNode {
    return renderCoordinateTreeNode(node, options, depth);
}

export function renderCoordinateTreeNode(
    node: CoordinateNode,
    options: RenderCoordinateTreeOptions,
    depth: number = 0
): React.ReactNode {
    const children = node.children ?? [];
    const expandable = children.length > 0;
    const isExpanded = !expandable || options.expanded.has(node.coordinate);
    const privacyClass = node.privacyClass ?? options.inheritedPrivacyClass ?? 'public';
    const privacyBlocked = isPrivacyBlocked(privacyClass);
    const classes = coordinateNodeClasses(node, options.activeCoordinate, privacyClass, privacyBlocked);
    return (
        <li
            className={classes.join(' ')}
            data-test={`coordinate-tree-node-${node.coordinate}`}
            data-depth={depth}
            data-expanded={String(isExpanded)}
            data-mutates-graph-canon="false"
        >
            <div className="coordinate-node-row">
                {expandable ? (
                    <button
                        type="button"
                        className="coordinate-expand-arrow"
                        data-test={`coordinate-tree-expand-${node.coordinate}`}
                        aria-expanded={isExpanded}
                        onClick={event => {
                            event.stopPropagation();
                            options.onToggleExpanded(node.coordinate);
                        }}
                    >
                        {isExpanded ? 'v' : '>'}
                    </button>
                ) : (
                    <span className="coordinate-expand-spacer" aria-hidden="true" />
                )}
                <button
                    type="button"
                    className="coordinate-node-main"
                    data-test={`coordinate-tree-select-${node.coordinate}`}
                    disabled={privacyBlocked}
                    onClick={() => options.onSelectCoordinate(node.coordinate, node)}
                >
                    <code>{node.coordinate}</code>
                    {node.label && <span className="coordinate-node-label"> — {node.label}</span>}
                </button>
                {options.surfaceMode === 'authoring' && (
                    <button
                        type="button"
                        className="coordinate-propose-edit"
                        data-test={`coordinate-tree-propose-${node.coordinate}`}
                        disabled={privacyBlocked}
                        onClick={event => {
                            event.stopPropagation();
                            options.onProposeCanonicalEdit(node);
                        }}
                    >
                        Propose canonical edit
                    </button>
                )}
            </div>
            {privacyBlocked && (
                <span
                    className="coordinate-privacy-blocked-overlay"
                    data-test={`coordinate-tree-privacy-blocked-${node.coordinate}`}
                >
                    privacy_blocked
                </span>
            )}
            {expandable && isExpanded && (
                <ul>{children.map(c => renderTree(c, options, depth + 1))}</ul>
            )}
        </li>
    );
}

export function coordinateNodeClasses(
    node: CoordinateNode,
    activeCoordinate: string | null,
    privacyClass: string | null,
    privacyBlocked: boolean = isPrivacyBlocked(privacyClass)
): string[] {
    const classes = ['coordinate-tree-node'];
    const family = coordinateFamily(node.coordinate);
    if (family) {
        classes.push(`coordinate-family-${family}`);
    }
    const namespace = coordinateNamespace(node);
    if (namespace) {
        classes.push(`coordinate-namespace-${namespace}`);
    }
    classes.push(`coordinate-privacy-${privacyClassClass(privacyClass)}`);
    if (privacyBlocked) {
        classes.push('coordinate-privacy-blocked');
    }
    if (activeCoordinate !== null && node.coordinate === activeCoordinate) {
        classes.push('active-coordinate');
    }
    return classes;
}

export function coordinateFamily(coordinate: string): CoordinateFamily | null {
    const first = coordinate.charAt(0).toUpperCase();
    return (COORDINATE_FAMILIES as readonly string[]).includes(first)
        ? first as CoordinateFamily
        : null;
}

function coordinateNamespace(node: CoordinateNode): 'empty' | 'pratibimba' | null {
    const raw = node.namespace ?? node.coordinate;
    if (raw.startsWith('Empty/') || raw === 'Empty') {
        return 'empty';
    }
    if (raw.startsWith('Pratibimba/') || raw === 'Pratibimba') {
        return 'pratibimba';
    }
    return null;
}

function hasChildren(node: CoordinateNode): boolean {
    return (node.children?.length ?? 0) > 0;
}

function privacyClassClass(privacyClass: string | null | undefined): string {
    if (isPrivacyBlocked(privacyClass)) {
        return 'blocked';
    }
    return sanitizeClassName(privacyClass ?? 'public');
}

function isPrivacyBlocked(privacyClass: string | null | undefined): boolean {
    return !isPrivacySafe(privacyClass);
}

function sanitizeClassName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'public';
}

function pointerAnchorToString(node: CoordinateNode): string | null {
    const anchor = node.pointerAnchor;
    if (typeof anchor === 'string') {
        return anchor;
    }
    if (anchor && typeof anchor === 'object') {
        return anchor.uri ?? anchor.path ?? null;
    }
    return node.pointer ?? node.sourceAnchor ?? node.artifactUri ?? null;
}

function artifactUriFromPointerAnchor(node: CoordinateNode): string | null {
    const raw = node.artifactUri ?? pointerAnchorToString(node);
    if (!raw) {
        return null;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
        return raw;
    }
    return `file://${raw}`;
}

function toIntentPrivacyClass(privacyClass: string | null | undefined): IntentPrivacyClass | null {
    if (!privacyClass) {
        return 'public';
    }
    if (privacyClass.includes('private')) {
        return 'private';
    }
    if (privacyClass.includes('protected') || privacyClass.includes('governed')) {
        return 'protected';
    }
    return 'public';
}

function applyInheritedPrivacyClass(node: CoordinateNode, privacyClass: string | null | undefined): CoordinateNode {
    return Object.freeze({
        ...node,
        privacyClass: node.privacyClass ?? privacyClass ?? null,
        children: node.children?.map(child => applyInheritedPrivacyClass(child, privacyClass))
    });
}
