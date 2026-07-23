/**
 * Coordinate: M' `/` membrane (Evidence dispatch-trace mini-graph — Track 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: an embedded, read-only mini Dispatch Trace scoped to ONE packet's
 *   genealogy (the packet's `dispatchTrace: DispatchTraceNode`, 26.10 schema).
 *   Renders the Pi → Anima → subagent invocation tree in miniature (actor +
 *   method per node, subagents nested under their dispatcher); a click deep-links
 *   to the full Dispatch Trace tab at the root node id (routing is 27.9's lane).
 * Public surface: DispatchTraceMiniGraph.
 * Does NOT own: the schema (evidenceShapes.ts), the full Dispatch tab (27.3).
 */

import type { ActorMediator, DispatchTraceNode } from './evidenceShapes';

function actorLabel(actor: ActorMediator): string {
    if (actor.kind === 'aletheia') {
        return `Aletheia · ${actor.subagent}`;
    }
    return actor.kind === 'pi' ? 'Pi' : 'Anima';
}

function MiniNode({ node }: { readonly node: DispatchTraceNode }) {
    return (
        <li className="dispatch-mini-node" data-testid="dispatch-mini-node" data-node-id={node.id}>
            <span className="dispatch-mini-actor">{actorLabel(node.actor)}</span>
            <span className="dispatch-mini-method">{node.methodOrSkill}</span>
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
    onOpen
}: {
    readonly root: DispatchTraceNode;
    readonly onOpen?: (rootNodeId: string) => void;
}) {
    return (
        <div className="dispatch-mini-graph" data-testid="dispatch-mini-graph">
            <button
                type="button"
                className="dispatch-mini-open"
                data-testid="dispatch-mini-open"
                onClick={() => onOpen?.(root.id)}
                title="open the full Dispatch Trace at this node"
            >
                dispatch genealogy →
            </button>
            <ul className="dispatch-mini-roots">
                <MiniNode node={root} />
            </ul>
        </div>
    );
}
