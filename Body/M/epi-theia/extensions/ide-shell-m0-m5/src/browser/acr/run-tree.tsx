import * as React from 'react';
import type { DispatchTraceNode } from './types';

export interface RunTreeProps {
    readonly dispatchTrace: DispatchTraceNode | null;
    readonly onNodeClick?: (node: DispatchTraceNode) => void;
    readonly onEvidenceClick?: (packetId: string, node: DispatchTraceNode) => void;
}

export function RunTree({
    dispatchTrace,
    onNodeClick,
    onEvidenceClick
}: RunTreeProps): React.ReactElement {
    if (dispatchTrace === null) {
        return (
            <p className="ide-shell-widget-empty" data-test="acr-run-tree-empty">
                No dispatch trace is attached to the current Pi runtime selection.
            </p>
        );
    }
    return (
        <ol data-test="acr-run-tree" className="ide-shell-acr-run-tree">
            <RunTreeNodeView
                node={dispatchTrace}
                onNodeClick={onNodeClick}
                onEvidenceClick={onEvidenceClick}
            />
        </ol>
    );
}

function RunTreeNodeView({
    node,
    onNodeClick,
    onEvidenceClick
}: {
    readonly node: DispatchTraceNode;
    readonly onNodeClick?: (node: DispatchTraceNode) => void;
    readonly onEvidenceClick?: (packetId: string, node: DispatchTraceNode) => void;
}): React.ReactElement {
    const hasSource = Boolean(node.coordinate && node.sourceAnchor);
    return (
        <li
            data-test={`acr-run-tree-node-${node.id}`}
            data-actor={node.actor}
            data-aletheia-subagent={node.aletheiaSubagent ?? ''}
            data-mediated-run-evidence-packet-id={node.mediatedRunEvidencePacketId ?? ''}
        >
            <div>
                <button
                    type="button"
                    disabled={!hasSource}
                    data-command="backend-studio.openSource"
                    data-coordinate={node.coordinate ?? ''}
                    data-source-anchor={node.sourceAnchor ?? ''}
                    onClick={() => onNodeClick?.(node)}
                >
                    {node.label}
                </button>
                <span> — {node.actor}</span>
                {node.methodOrSkill && <code> {node.methodOrSkill}</code>}
                {typeof node.tickAtInvoke === 'number' && (
                    <span data-test={`acr-run-tree-node-tick-${node.id}`}> tick {node.tickAtInvoke}</span>
                )}
                {node.psycheFacet && (
                    <span data-test={`acr-run-tree-node-psyche-facet-${node.id}`}>
                        {' '}facet: {node.psycheFacet}
                    </span>
                )}
                {node.mediatedRunEvidencePacketId && (
                    <button
                        type="button"
                        data-command="pratibimba.ide-shell-m0-m5.evidence-panel.open"
                        data-evidence-packet-id={node.mediatedRunEvidencePacketId}
                        onClick={() => onEvidenceClick?.(node.mediatedRunEvidencePacketId!, node)}
                    >
                        Evidence
                    </button>
                )}
            </div>
            {node.children && node.children.length > 0 && (
                <ol>
                    {node.children.map(child => (
                        <RunTreeNodeView
                            key={child.id}
                            node={child}
                            onNodeClick={onNodeClick}
                            onEvidenceClick={onEvidenceClick}
                        />
                    ))}
                </ol>
            )}
        </li>
    );
}
