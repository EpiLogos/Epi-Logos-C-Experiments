import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import {
    asSubgraph,
    EMPTY_SUBGRAPH,
    type BimbaSubgraphPayload
} from '../common/graph-types';
import { IdeShellBridgeGate } from './bridge-gate';

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

    protected subgraph: BimbaSubgraphPayload = EMPTY_SUBGRAPH;
    protected lastError: string | null = null;
    protected privacyDropped: number = 0;
    protected selectedCoordinate: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = BimbaGraphViewerWidget.ID;
        this.title.label = BimbaGraphViewerWidget.LABEL;
        this.title.caption = BimbaGraphViewerWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-bimba-graph-viewer');
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
                this.privacyDropped += 1;
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
        return (
            <div className="ide-shell-widget-root" data-test="bimba-graph-viewer-root">
                <header className="ide-shell-widget-header">
                    <h3>{BimbaGraphViewerWidget.LABEL}</h3>
                    <span data-test="bimba-graph-source">
                        source: <code>{this.subgraph.source}</code>
                    </span>
                </header>
                <section className="ide-shell-widget-detail">
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
                    </dl>
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
