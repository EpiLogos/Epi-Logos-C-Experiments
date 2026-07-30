/**
 * Coordinate: M' `/` membrane (Evidence dispatch-trace mini-graph — 27.T27.5 / 28.T28.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: an embedded, read-only mini Dispatch Trace scoped to ONE packet's
 *   genealogy (the packet's `dispatchTrace: DispatchTraceNode`, 26.10 schema).
 *   Renders the Pi → Anima → subagent invocation tree in miniature, with
 *   subagents nested under their dispatcher; a click deep-links to the full
 *   Dispatch Trace tab at the root node id (routing is 27.9's lane).
 *
 *   28.T28.8 (c) gave it the two properties the spec asks for and 27.5 did not
 *   have. It is COLLAPSIBLE AND COLLAPSED BY DEFAULT — which is also how one
 *   component serves both DR-WC-IS-2 foldings: collapsed, it is the abbreviated
 *   `/` render (a count and a cross-link); expanded, it is the governance-audit
 *   render. And each node now carries the FOUR fields 28.8 (c) names — actor,
 *   methodOrSkill, `tickAtInvoke`, and the `psycheFacet` badge (26.8) — instead
 *   of the first two only. The facet colour rides `psycheFacetClass`, the ONE
 *   facet vocabulary (27.3), never a second palette.
 * Public surface: DispatchTraceMiniGraph, countDispatchTraceNodes.
 * Does NOT own: the schema (evidenceShapes.ts), the facet vocabulary
 *   (psycheFacet.ts), the full Dispatch tab (27.3), intent routing (27.9).
 * Contract: rerun tranches [[27.T27.5]] / [[28.T28.8]].
 */

import { useState } from 'react';
import type { ActorMediator, DispatchTraceNode } from './evidenceShapes';
import { PSYCHE_FACET_LABEL, psycheFacetClass } from './psycheFacet';

function actorLabel(actor: ActorMediator): string {
    if (actor.kind === 'aletheia') {
        return `Aletheia · ${actor.subagent}`;
    }
    return actor.kind === 'pi' ? 'Pi' : 'Anima';
}

/** How many dispatches this packet's trace really records. */
export function countDispatchTraceNodes(node: DispatchTraceNode): number {
    return 1 + node.children.reduce((total, child) => total + countDispatchTraceNodes(child), 0);
}

function MiniNode({ node }: { readonly node: DispatchTraceNode }) {
    return (
        <li
            className="dispatch-mini-node"
            data-testid="dispatch-mini-node"
            data-node-id={node.id}
            data-tick={node.tickAtInvoke}
            data-psyche-facet={node.psycheFacet ?? ''}
        >
            <span className="dispatch-mini-actor">{actorLabel(node.actor)}</span>
            <span className="dispatch-mini-method">{node.methodOrSkill}</span>
            {/* 28.8 (c): the tick the dispatch was invoked AT — the profile
                generation that anchors it, not a wall clock. */}
            <span className="dispatch-mini-tick" data-testid="dispatch-mini-tick">
                {`tick ${node.tickAtInvoke}`}
            </span>
            {node.psycheFacet ? (
                <span
                    className={`dispatch-mini-facet ${psycheFacetClass(node.psycheFacet)}`}
                    data-testid="dispatch-mini-facet"
                >
                    {PSYCHE_FACET_LABEL[node.psycheFacet]}
                </span>
            ) : null}
            {node.children.length > 0 && (
                <ul className="dispatch-mini-children">
                    {node.children.map(child => (
                        <MiniNode key={child.id} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export function DispatchTraceMiniGraph({
    root,
    onOpen,
    defaultExpanded = false
}: {
    readonly root: DispatchTraceNode;
    readonly onOpen?: (rootNodeId: string) => void;
    /** 28.8 (c) is "collapsed by default"; the deep governance render opens it. */
    readonly defaultExpanded?: boolean;
}) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const nodes = countDispatchTraceNodes(root);
    return (
        <div
            className="dispatch-mini-graph"
            data-testid="dispatch-mini-graph"
            data-expanded={expanded ? 'true' : 'false'}
            data-node-count={nodes}
        >
            <button
                type="button"
                className="dispatch-mini-expand"
                data-testid="dispatch-mini-expand"
                aria-expanded={expanded}
                onClick={() => setExpanded(open => !open)}
            >
                {`${expanded ? '▾' : '▸'} dispatch trace · ${nodes} ${nodes === 1 ? 'dispatch' : 'dispatches'}`}
            </button>
            <button
                type="button"
                className="dispatch-mini-open"
                data-testid="dispatch-mini-open"
                onClick={() => onOpen?.(root.id)}
                title="open the full Dispatch Trace at this node"
            >
                dispatch genealogy →
            </button>
            {expanded ? (
                <ul className="dispatch-mini-roots">
                    <MiniNode node={root} />
                </ul>
            ) : null}
        </div>
    );
}
