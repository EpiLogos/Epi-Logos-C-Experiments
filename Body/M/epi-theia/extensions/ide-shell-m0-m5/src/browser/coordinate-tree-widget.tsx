import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';

/**
 * Bimba coordinate tree — Track 05 T4.
 *
 * Sibling to the Bimba graph viewer; consumes the same S2 coordinate-tree
 * payload via `KERNEL_BRIDGE_API.invokeCapability` with method `invokeGatewayRpc`
 * and the inner `s2'.coordinate.resolve` gateway method. Renders the
 * hierarchical coordinate tree (e.g. M-coordinate parents/children) so users
 * can drill into a sub-tree without leaving the IDE.
 */
interface CoordinateNode {
    readonly coordinate: string;
    readonly label?: string;
    readonly children?: readonly CoordinateNode[];
}

@injectable()
export class CoordinateTreeWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.COORDINATE_TREE;
    static readonly LABEL = 'Bimba Coordinate Tree';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected root: CoordinateNode | null = null;
    protected error: string | null = null;
    protected privacyDropped: number = 0;

    @postConstruct()
    protected init(): void {
        this.id = CoordinateTreeWidget.ID;
        this.title.label = CoordinateTreeWidget.LABEL;
        this.title.caption = CoordinateTreeWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-coordinate-tree');
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
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.privacyDropped += 1;
                this.root = null;
                this.error = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                this.root =
                    receipt.artifact && typeof receipt.artifact === 'object'
                        ? (receipt.artifact as CoordinateNode)
                        : null;
                this.error = null;
            }
        } catch (err) {
            this.error = err instanceof Error ? err.message : String(err);
        }
        this.update();
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
                            {renderTree(this.root)}
                        </ul>
                    )}
                </section>
            </div>
        );
    }
}

function renderTree(node: CoordinateNode, depth: number = 0): React.ReactNode {
    return (
        <li
            data-test={`coordinate-tree-node-${node.coordinate}`}
            data-depth={depth}
        >
            <code>{node.coordinate}</code>
            {node.label && <span> — {node.label}</span>}
            {node.children && node.children.length > 0 && (
                <ul>{node.children.map(c => renderTree(c, depth + 1))}</ul>
            )}
        </li>
    );
}
