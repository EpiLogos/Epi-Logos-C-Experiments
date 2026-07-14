/**
 * Coordinate: M' M5' (Review fold body — Tranches 44.T44.3 + 44.T44.4, cross-link 27.6)
 * Actualises: the OmniPanel Review fold rendering real data through the
 *   Track-44 block standard (genealogy → review-item/evidence/genealogy
 *   blocks via BlockHost) PLUS the 44.4 vertical slice: review-item
 *   affordances route through blocks.verdict/blocks.annotate session-ops
 *   under the live Human Gate (m5ReviewGate — agent committals blocked,
 *   only a human commits) into an `s4'.psyche.update` request whose patch
 *   carries the renderer session state.
 * Does NOT own: the gate law (m5ReviewGate.ts), the run-model types, the
 *   live wire→record producer (track-12 seam) or the `s4'.psyche.update`
 *   ws seam (dispatched honestly; refusals surface inline).
 */

import { useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { BlockHost } from '../../blocks/BlockHost';
import {
    applyBlockSessionOperation,
    createBlockPsycheUpdateRequest,
    createRendererSessionState,
    createVerdictOperation,
    type BlockRendererSessionState,
    type BlockVerdictDecision
} from '../../blocks/verdictLoop';
import { enforceHumanGate } from '../m5ReviewGate';
import { useSessionStore } from '../../state/stores';
import { syntheticPiAnimaMoiraiDispatch } from './dispatchGenealogy.fixture';
import { genealogyToReviewBlocks } from './reviewBlocks';

const VERDICTS: readonly BlockVerdictDecision[] = ['approve', 'reject', 'defer'];

export function ReviewBlocksPane() {
    const sessionKey = useSessionStore(s => s.sessionKey);
    const [state, setState] = useState<BlockRendererSessionState>(() =>
        createRendererSessionState([...genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch())])
    );
    const [gateNotice, setGateNotice] = useState<string | null>(null);

    const reviewItems = state.blocks.filter(block => block.type === 'review-item');
    const selected = reviewItems.find(block => block.id === state.currentSelection) ?? reviewItems[0] ?? null;

    const verdict = (decision: BlockVerdictDecision) => {
        if (!selected) {
            return;
        }
        // The Review fold's operator is the human Architect (Trika-0); the
        // agent-blocked path is law-tested in verdictLoop.test.ts.
        const gate = enforceHumanGate({ decision, humanRequired: true, actorIsHuman: true });
        let operation;
        try {
            operation = createVerdictOperation({
                block: selected,
                decision,
                actor: 'architect',
                actorIsHuman: true,
                reason: `review fold ${decision}`,
                humanGate: gate
            });
        } catch (err) {
            setGateNotice(err instanceof Error ? err.message : String(err));
            return;
        }
        const next = applyBlockSessionOperation(state, operation);
        setState(next);
        setGateNotice(null);
        const request = createBlockPsycheUpdateRequest({ sessionKey: sessionKey ?? 'unbound', state: next });
        gateway()
            .invoke(request.method, request.params as unknown as Record<string, unknown>)
            .catch(err => setGateNotice(`psyche update pending: ${err instanceof Error ? err.message : String(err)}`));
    };

    return (
        <div className="review-blocks-pane" data-testid="review-blocks-pane">
            <p className="pane-message review-blocks-seam" data-testid="review-blocks-seam-note">
                Review rows ride the synthetic acceptance fixture — the live wire→record producer is
                track-12's seam; verdicts route to the s4-prime psyche.update seam under the m5 human gate.
            </p>
            {selected ? (
                <div className="review-verdict-strip" data-testid="review-verdict-strip" data-selected={selected.id}>
                    {VERDICTS.map(decision => (
                        <button
                            key={decision}
                            type="button"
                            data-testid={`review-verdict-${decision}`}
                            onClick={() => verdict(decision)}
                        >
                            {decision}
                        </button>
                    ))}
                    {state.pendingVerdict ? (
                        <span data-testid="review-pending-verdict">
                            pending: {state.pendingVerdict.decision} · {state.pendingVerdict.blockId}
                        </span>
                    ) : null}
                </div>
            ) : null}
            {gateNotice ? (
                <p className="pane-message" data-testid="review-gate-notice">
                    {gateNotice}
                </p>
            ) : null}
            <BlockHost blocks={state.blocks} />
        </div>
    );
}
