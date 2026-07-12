/**
 * Coordinate: M' `/` membrane (dispatch genealogy — structural folding, 15.T15.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the TREE folding of the dispatch-genealogy primitive — the
 *   Pi → Anima → subagent invocation tree with per-node actor, route,
 *   capability-gate outcome, timing, status, and deep-link affordances.
 *   Collapsible nodes (view-local fold state only); selectable nodes emit the
 *   consistent node id; deep-link buttons emit `DispatchDeepLink` descriptors.
 *   This is the reusable face the `omniDispatchTrace` tab body composes when
 *   27.3 lands — it is NOT the tab body itself.
 * Does NOT own: the dataset or the folds (dispatchGenealogy.ts), the tab
 *   mount (App.tsx factory keeps the honest pending pane until 27.3),
 *   intent routing (the mounting pane wires onDeepLink into the command spine).
 */

import { useMemo, useState } from 'react';
import type { RunTreeNode } from './omnipanelRuntime';
import {
    deepLinksFor,
    foldGenealogyTree,
    genealogyIndex,
    DispatchDeepLink,
    DispatchGenealogyRecord
} from './dispatchGenealogy';

export interface DispatchGenealogyTreeProps {
    readonly records: readonly DispatchGenealogyRecord[];
    readonly selectedId?: string | null;
    readonly onSelect?: (nodeId: string) => void;
    readonly onDeepLink?: (link: DispatchDeepLink) => void;
}

function formatDuration(durationMs: number | null): string {
    return durationMs === null ? 'running' : `${durationMs}ms`;
}

function TreeNode(props: {
    readonly node: RunTreeNode;
    readonly index: ReadonlyMap<string, DispatchGenealogyRecord>;
    readonly collapsed: ReadonlySet<string>;
    readonly toggle: (nodeId: string) => void;
    readonly tree: DispatchGenealogyTreeProps;
}) {
    const { node, index, collapsed, toggle, tree } = props;
    const record = index.get(node.id);
    const isCollapsed = collapsed.has(node.id);
    const links = record ? deepLinksFor(record) : [];

    return (
        <li
            className="dispatch-tree-node"
            data-testid="dispatch-tree-node"
            data-node-id={node.id}
            data-status={node.status}
        >
            <div
                className={`dispatch-node-row${tree.selectedId === node.id ? ' selected' : ''}`}
                data-testid="dispatch-tree-node-row"
                aria-selected={tree.selectedId === node.id}
                onClick={() => tree.onSelect?.(node.id)}
            >
                {node.children.length > 0 && (
                    <button
                        type="button"
                        className="dispatch-node-fold"
                        data-testid="dispatch-tree-fold-toggle"
                        aria-expanded={!isCollapsed}
                        onClick={event => {
                            event.stopPropagation();
                            toggle(node.id);
                        }}
                    >
                        {isCollapsed ? '▸' : '▾'}
                    </button>
                )}
                <span className="dispatch-node-actor">
                    {node.actor.actor}
                    <span className="dispatch-node-role"> ({node.actor.role})</span>
                </span>
                <span className="dispatch-node-method">{node.route.method}</span>
                {record && record.gate.capability !== null && (
                    <span
                        className={`dispatch-node-gate gate-${record.gate.allowed ? 'allowed' : 'refused'}`}
                        data-testid="dispatch-node-gate"
                    >
                        {record.gate.capability} {record.gate.allowed ? '✓' : 'refused'}
                    </span>
                )}
                <span className={`dispatch-node-status status-${node.status}`}>{node.status}</span>
                <span className="dispatch-node-duration">{formatDuration(node.durationMs)}</span>
                {links.map(link => (
                    <button
                        key={link.target}
                        type="button"
                        className="dispatch-node-link"
                        data-testid={`dispatch-link-${link.target}`}
                        onClick={event => {
                            event.stopPropagation();
                            tree.onDeepLink?.(link);
                        }}
                    >
                        {link.target === 'omniEvidence' ? 'evidence' : 'source'}
                    </button>
                ))}
            </div>
            {node.children.length > 0 && !isCollapsed && (
                <ul className="dispatch-tree-children">
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            index={index}
                            collapsed={collapsed}
                            toggle={toggle}
                            tree={tree}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

/** The structural folding: same records as the stream, folded as the tree. */
export function DispatchGenealogyTree(props: DispatchGenealogyTreeProps) {
    const trees = useMemo(() => foldGenealogyTree(props.records), [props.records]);
    const index = useMemo(() => genealogyIndex(props.records), [props.records]);
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    const toggle = (nodeId: string) =>
        setCollapsed(previous => {
            const next = new Set(previous);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });

    return (
        <div className="dispatch-genealogy-tree" data-testid="dispatch-genealogy-tree">
            {trees.length === 0 ? (
                <div className="pane-message" data-testid="dispatch-tree-empty">
                    no dispatches — the genealogy is empty, nothing is synthesised
                </div>
            ) : (
                <ul className="dispatch-tree-roots">
                    {trees.map(root => (
                        <TreeNode
                            key={root.id}
                            node={root}
                            index={index}
                            collapsed={collapsed}
                            toggle={toggle}
                            tree={props}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
