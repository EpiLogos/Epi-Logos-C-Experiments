/**
 * Coordinate: M' `/` membrane (dispatch genealogy — temporal folding, 15.T15.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the STREAM folding of the dispatch-genealogy primitive — the
 *   SAME records the tree folds, as a time-ordered event list (invoked/settled
 *   rows) with actor, channel (gateway method), status, and deep-link
 *   affordances. Rows carry the same node ids as the tree (the 15.11
 *   consistency invariant); selecting a row emits that id. This is the
 *   reusable face the Tools tab composes when 27.4 extends — LogsPane (the
 *   raw ring fold) is untouched; this face folds GENEALOGY records, not the
 *   gateway event ring.
 * Does NOT own: the dataset or the folds (dispatchGenealogy.ts), the Tools
 *   tab body (27.4, live via LogsPane today), intent routing.
 */

import { useMemo } from 'react';
import {
    deepLinksFor,
    foldGenealogyStream,
    genealogyIndex,
    DispatchDeepLink,
    DispatchGenealogyRecord
} from './dispatchGenealogy';

export interface DispatchGenealogyStreamProps {
    readonly records: readonly DispatchGenealogyRecord[];
    readonly selectedId?: string | null;
    readonly onSelect?: (nodeId: string) => void;
    readonly onDeepLink?: (link: DispatchDeepLink) => void;
}

/** The temporal folding: same records as the tree, folded as the event list. */
export function DispatchGenealogyStream(props: DispatchGenealogyStreamProps) {
    const events = useMemo(() => foldGenealogyStream(props.records), [props.records]);
    const index = useMemo(() => genealogyIndex(props.records), [props.records]);

    return (
        <div className="dispatch-genealogy-stream" data-testid="dispatch-genealogy-stream">
            {events.length === 0 ? (
                <div className="pane-message" data-testid="dispatch-stream-empty">
                    no dispatch events — the genealogy is empty, nothing is synthesised
                </div>
            ) : (
                <ul className="dispatch-stream-list">
                    {events.map(event => {
                        const record = index.get(event.nodeId);
                        const links = record ? deepLinksFor(record) : [];
                        return (
                            <li
                                key={event.seq}
                                className={`dispatch-stream-row${
                                    props.selectedId === event.nodeId ? ' selected' : ''
                                }`}
                                data-testid="dispatch-stream-row"
                                data-node-id={event.nodeId}
                                data-kind={event.kind}
                                data-seq={event.seq}
                                aria-selected={props.selectedId === event.nodeId}
                                onClick={() => props.onSelect?.(event.nodeId)}
                            >
                                <span className="dispatch-stream-time">
                                    {new Date(event.emittedAtMs).toLocaleTimeString()}
                                </span>
                                <span className={`dispatch-stream-kind kind-${event.kind}`}>
                                    {event.kind}
                                </span>
                                <span className="dispatch-stream-actor">
                                    {event.actor.actor} ({event.actor.role})
                                </span>
                                <span className="dispatch-stream-channel">
                                    {event.channel ?? '—'}
                                </span>
                                <span className={`dispatch-stream-status status-${event.status}`}>
                                    {event.status}
                                </span>
                                {links.map(link => (
                                    <button
                                        key={link.target}
                                        type="button"
                                        className="dispatch-stream-link"
                                        data-testid={`dispatch-stream-link-${link.target}`}
                                        onClick={clickEvent => {
                                            clickEvent.stopPropagation();
                                            props.onDeepLink?.(link);
                                        }}
                                    >
                                        {link.target === 'omniEvidence' ? 'evidence' : 'source'}
                                    </button>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
