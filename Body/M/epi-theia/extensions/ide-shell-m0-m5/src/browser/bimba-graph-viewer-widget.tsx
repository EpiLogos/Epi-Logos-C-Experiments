import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { PreferenceService } from '@theia/core/lib/browser';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import {
    BridgeReadinessBadge,
    bridgeReadinessColour,
    classifyReadiness,
    snapshotReadinessFromBridge,
    type BridgeReadinessSource
} from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import {
    SharedBridgeAdapter,
    type CoordinateContext
} from '@pratibimba/m-extension-runtime';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import {
    asSubgraph,
    buildBimbaLibrarySurface,
    EMPTY_SUBGRAPH,
    type BimbaSubgraphPayload
} from '../common/graph-types';
import { IdeShellBridgeGate } from './bridge-gate';
import {
    GraphCanvas,
    type BimbaEdge,
    type RelationFamilyFilterValue,
    type RenderingMode
} from './bimba-graph-viewer/graph-canvas';
import { PrivacyDropFeed } from './services/privacy-drop-feed';

const LAYOUT_PREFERENCE = 'epi-logos.layout.active' as const;

export const RelationFamilyFilter: React.FC<{
    readonly value: RelationFamilyFilterValue;
    readonly onChange: (value: RelationFamilyFilterValue) => void;
}> = props => (
    <label className="bimba-relation-family-filter">
        <span>Relation family</span>
        <select
            value={props.value}
            data-test="bimba-relation-family-filter"
            onChange={event => props.onChange(event.currentTarget.value as RelationFamilyFilterValue)}
        >
            <option value="all">all</option>
            <option value="structural">structural</option>
            <option value="correspondential">correspondential</option>
        </select>
    </label>
);

/**
 * Bimba graph viewer — Track 05 T4.
 *
 * Renders an S2 subgraph response: node coordinate / namespace / label /
 * pointer anchor / source/spec/code/test anchors / GDS overlay readiness.
 *
 * All data flows through `KERNEL_BRIDGE_API.invokeCapability` with method
 * `invokeGatewayRpc` and the inner `s2.graph.node` gateway method. No direct
 * fetch / WebSocket / SQL — the kernel-bridge is the only network surface.
 *
 * Privacy-safe: any node payload with a forbidden privacy class is silently
 * dropped (a `privacyClassDropped` count is shown in the data-test pane).
 */
@injectable()
export class BimbaGraphViewerWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.BIMBA_GRAPH_VIEWER;
    static readonly LABEL = 'Bimba Graph Viewer';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(SharedBridgeAdapter)
    protected readonly sharedBridge!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    protected subgraph: BimbaSubgraphPayload = EMPTY_SUBGRAPH;
    protected lastError: string | null = null;
    protected selectedCoordinate: string | null = null;
    protected renderingMode: RenderingMode = 'solar-anchor';
    protected relationFamilyFilter: RelationFamilyFilterValue = 'all';
    protected hoveredEdge: BimbaEdge | null = null;

    @postConstruct()
    protected init(): void {
        this.id = BimbaGraphViewerWidget.ID;
        this.title.label = BimbaGraphViewerWidget.LABEL;
        this.title.caption = BimbaGraphViewerWidget.LABEL;
        this.title.closable = true;

        /* 28.18 status-bar consumption contract: sessionKey/profileGeneration
           rendered in graph viewer dispatch MUST consume from bridge.cachedProfile?.generation,
           NOT from own widget state. 15.10 owns status-bar build; 28.18 adds consumption-only contract. */
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-bimba-graph-viewer');
        this.renderingMode = this.currentRenderingMode();
        this.toDispose.push(this.preferences.onPreferenceChanged(change => {
            if (change.preferenceName === LAYOUT_PREFERENCE) {
                this.renderingMode = this.renderingModeForLayout(change.newValue);
                this.update();
            }
        }));
    }

    /** Request a subgraph for the given coordinate from S2 via kernel-bridge. */
    async openCoordinate(coordinate: string): Promise<void> {
        this.selectedCoordinate = coordinate;
        try {
            const receipt: KernelBridgeCapabilityReceipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-bimba-graph',
                params: {
                    gatewayMethod: 's2.graph.node',
                    coordinate
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.subgraph = EMPTY_SUBGRAPH;
                this.lastError = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                this.subgraph = asSubgraph(
                    receipt.artifact,
                    receipt.privacyClass,
                    receipt.profileGeneration,
                    's2.graph.node'
                );
                this.lastError = null;
            }
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    protected currentRenderingMode(): RenderingMode {
        return this.renderingModeForLayout(this.preferences.get<string>(LAYOUT_PREFERENCE, 'daily-0-1'));
    }

    protected renderingModeForLayout(layout: unknown): RenderingMode {
        return layout === 'ide-deep' ? 'full-lattice' : 'solar-anchor';
    }

    protected setRelationFamilyFilter(value: RelationFamilyFilterValue): void {
        this.relationFamilyFilter = value;
        this.update();
    }

    protected handleNodeClick(coordinate: string): void {
        this.publishCoordinateContext(coordinate);
        void this.openCoordinate(coordinate);
    }

    protected handleEdgeHover(edge: BimbaEdge): void {
        this.hoveredEdge = edge;
        this.update();
    }

    protected publishCoordinateContext(coordinate: string): void {
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
            profileGeneration: generation,
            privacyClass: previous.privacyClass ?? 'public_current',
            provenance: Object.freeze({
                source: 'bimba-graph-viewer',
                generation,
                notes: Object.freeze([
                    ...previous.provenance.notes,
                    'publishCoordinateContext'
                ] as string[]) as readonly string[]
            })
        });
        this.sharedBridge.updateCoordinateContext(next);
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={BimbaGraphViewerWidget.LABEL}>
                {this.renderViewer()}
            </IdeShellBridgeGate>
        );
    }

    protected renderViewer(): React.ReactNode {
        const node = this.subgraph.node;
        const pointerAnchor =
            typeof node?.pointerAnchor === 'string'
                ? node.pointerAnchor
                : node?.pointerAnchor?.path ?? node?.pointer ?? null;
        const graphReadiness = classifyReadiness(
            snapshotReadinessFromBridge(this.bridge as unknown as BridgeReadinessSource),
            's2.graph.node'
        );
        const librarySurface = buildBimbaLibrarySurface(this.subgraph, this.selectedCoordinate);
        const graphReadinessColour = bridgeReadinessColour(graphReadiness.readinessId);
        return (
            <div
                className={`ide-shell-widget-root bimba-graph-readiness-${graphReadinessColour}`}
                data-test="bimba-graph-viewer-root"
                data-rendering-mode={this.renderingMode}
                data-readiness-id={graphReadiness.readinessId}
                style={{ borderColor: graphReadinessColour }}
            >
                <header className="ide-shell-widget-header">
                    <h3>{BimbaGraphViewerWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s2.graph.node"
                    />
                    <span
                        className="bridge-readiness-pending-badge"
                        data-test="bimba-graph-s2-blocked-badge"
                    >
                        {graphReadiness.readinessId === 'bridge_unavailable'
                            ? 'bridge_unavailable'
                            : graphReadiness.readinessId === 's2_graph_blocked'
                                ? 's2_graph_blocked'
                                : graphReadiness.readinessId}
                    </span>
                    <span data-test="bimba-graph-source">
                        source: <code>{this.subgraph.source}</code>
                    </span>
                </header>
                {graphReadiness.readinessId === 'bridge_unavailable' && (
                    <div
                        className="bridge-readiness-blocked-overlay"
                        data-test="bimba-graph-bridge-unavailable-overlay"
                    >
                        bridge_unavailable
                    </div>
                )}
                <section className="ide-shell-widget-detail">
                    <div className="bimba-graph-toolbar">
                        <span data-test="bimba-graph-rendering-mode">
                            RenderingMode: <code>{this.renderingMode}</code>
                        </span>
                        <RelationFamilyFilter
                            value={this.relationFamilyFilter}
                            onChange={value => this.setRelationFamilyFilter(value)}
                        />
                    </div>
                    <GraphCanvas
                        subgraph={this.subgraph}
                        renderingMode={this.renderingMode}
                        activeCoordinate={this.selectedCoordinate}
                        relationFamilyFilter={this.relationFamilyFilter}
                        onNodeClick={coordinate => this.handleNodeClick(coordinate)}
                        onEdgeHover={edge => this.handleEdgeHover(edge)}
                    />
                    <dl>
                        <dt>Selected coordinate</dt>
                        <dd data-test="bimba-graph-selected-coordinate">
                            {this.selectedCoordinate ?? 'No coordinate selected'}
                        </dd>
                        <dt>Canonical coordinate</dt>
                        <dd data-test="bimba-graph-canonical-coordinate">
                            {node?.coordinate ?? 'Awaiting S2 payload'}
                        </dd>
                        <dt>Namespace</dt>
                        <dd data-test="bimba-graph-namespace">{node?.namespace ?? '—'}</dd>
                        <dt>Label</dt>
                        <dd data-test="bimba-graph-label">{node?.label ?? '—'}</dd>
                        <dt>Pointer anchor</dt>
                        <dd data-test="bimba-graph-pointer-anchor">{pointerAnchor ?? '—'}</dd>
                        <dt>Source anchor</dt>
                        <dd data-test="bimba-graph-source-anchor">{node?.sourceAnchor ?? '—'}</dd>
                        <dt>Spec anchor</dt>
                        <dd data-test="bimba-graph-spec-anchor">{node?.specAnchor ?? '—'}</dd>
                        <dt>Code anchor</dt>
                        <dd data-test="bimba-graph-code-anchor">{node?.codeAnchor ?? '—'}</dd>
                        <dt>Test anchor</dt>
                        <dd data-test="bimba-graph-test-anchor">{node?.testAnchor ?? '—'}</dd>
                        <dt>GDS readiness</dt>
                        <dd data-test="bimba-graph-gds-readiness">{node?.gdsReadiness ?? 'pending'}</dd>
                        <dt>Neighbor count</dt>
                        <dd data-test="bimba-graph-neighbor-count">{this.subgraph.neighbors.length}</dd>
                        <dt>Privacy class</dt>
                        <dd data-test="bimba-graph-privacy-class">{this.subgraph.privacyClass}</dd>
                        <dt>Privacy-dropped payloads</dt>
                        <dd data-test="bimba-graph-privacy-dropped">{this.privacyDropped}</dd>
                        <dt>Hovered relation</dt>
                        <dd data-test="bimba-graph-hovered-edge">
                            {this.hoveredEdge
                                ? `${this.hoveredEdge.relationType} (${this.hoveredEdge.relationFamily})`
                                : 'None'}
                        </dd>
                    </dl>
                    <section
                        className="bimba-library-surface"
                        data-test="bimba-library-surface"
                        data-bimba-coordinate={librarySurface.bimba_coordinate ?? ''}
                    >
                        <h4>Library surface</h4>
                        <dl>
                            <dt>bimba_coordinate</dt>
                            <dd data-test="bimba-library-bimba-coordinate">
                                {librarySurface.bimba_coordinate ?? 'Awaiting traversed coordinate'}
                            </dd>
                            <dt>bimba_resonances</dt>
                            <dd data-test="bimba-library-bimba-resonances">
                                {librarySurface.bimba_resonances.length > 0
                                    ? librarySurface.bimba_resonances.join(', ')
                                    : 'Awaiting classified resonances'}
                            </dd>
                            <dt>Gateway method</dt>
                            <dd data-test="bimba-library-gateway-method">{librarySurface.gatewayMethod}</dd>
                            <dt>Mutates graph canon</dt>
                            <dd data-test="bimba-library-mutates-graph-canon">
                                {String(librarySurface.mutatesGraphCanon)}
                            </dd>
                        </dl>
                    </section>
                    {this.lastError !== null && (
                        <p className="ide-shell-error" data-test="bimba-graph-last-error">
                            {this.lastError}
                        </p>
                    )}
                </section>
            </div>
        );
    }
}
