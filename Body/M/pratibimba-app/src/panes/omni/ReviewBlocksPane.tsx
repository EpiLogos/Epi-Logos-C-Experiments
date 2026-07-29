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

import { useEffect, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { BlockHost } from '../../blocks/BlockHost';
import { TEMPORAL_CONTEXT_RPC, normalizeTemporalBlocksProjection } from '../../blocks/temporalBlocks';
import {
    CONTEXT_XRAY_RPC,
    normalizeContextXray,
    pendingContextXray,
    type ContextXrayHandle
} from '../../blocks/contextXray';
import {
    applyBlockSessionOperation,
    createBlockPsycheUpdateRequest,
    createRendererSessionState,
    createVerdictOperation,
    type BlockRendererSessionState,
    type BlockVerdictDecision
} from '../../blocks/verdictLoop';
import { enforceHumanGate } from '../m5ReviewGate';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../../state/stores';
import { syntheticPiAnimaMoiraiDispatch } from './dispatchGenealogy.fixture';
import { genealogyToReviewBlocks } from './reviewBlocks';
import { MExtensionEmptyState } from '../../ui/mExtensionEmptyStates';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';
import { M1SessionCloseReader, readM1SessionCloseBundle } from '../m1SessionCloseReader';
import {
    ContemplationObjectViewer,
    readContemplationObjectProjection,
    type ContemplationObjectProjectionRead
} from '../contemplationObjectViewer';

const VERDICTS: readonly BlockVerdictDecision[] = ['approve', 'reject', 'defer'];
const M1_SESSION_CLOSE_READ_METHOD = 'nara.session_close.read';
const CONTEMPLATION_OBJECT_READ_METHOD = 'nara.session_close.contemplation.read';

type SessionCloseState =
    | { readonly state: 'pending'; readonly reason: string }
    | { readonly state: 'absent'; readonly reason: string }
    | { readonly state: 'error'; readonly reason: string }
    | { readonly state: 'blocked'; readonly reason: string }
    | {
          readonly state: 'ready';
          readonly close: Extract<ReturnType<typeof readM1SessionCloseBundle>, { readonly state: 'ready' }>;
      };

type ContemplationObjectState =
    | { readonly state: 'pending'; readonly reason: string }
    | { readonly state: 'absent'; readonly reason: string }
    | { readonly state: 'error'; readonly reason: string }
    | { readonly state: 'blocked'; readonly reason: string }
    | {
          readonly state: 'ready';
          readonly contemplation: Extract<ContemplationObjectProjectionRead, { readonly state: 'ready' }>;
      };

export function ReviewBlocksPane({ requestedReviewId = null }: { readonly requestedReviewId?: string | null }) {
    const sessionKey = useSessionStore(s => s.sessionKey);
    const connected = useProvenanceStore(s => s.connection.connected);
    const reviewTab = useOmniPanelTabState('review');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const [state, setState] = useState<BlockRendererSessionState>(() =>
        createRendererSessionState([...genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch())])
    );
    const [gateNotice, setGateNotice] = useState<string | null>(null);
    const [blockSource, setBlockSource] = useState<'fixture' | 'live'>('fixture');
    const [xray, setXray] = useState<ContextXrayHandle | null>(null);
    const [sessionClose, setSessionClose] = useState<SessionCloseState>({
        state: 'pending',
        reason: 'exact session key required before close aggregates can be read'
    });
    const [contemplationObject, setContemplationObject] = useState<ContemplationObjectState>({
        state: 'pending',
        reason: 'exact session key required before contemplation aggregates can be read'
    });

    useEffect(() => {
        if (requestedReviewId) {
            patchTab('review', { selectedReviewId: requestedReviewId });
        }
    }, [patchTab, requestedReviewId]);

    // 44.6: block selection fires the context-xray seam and highlights back
    // through the shared coordinate store (the carrier's cross-pane law).
    const selectBlock = (block: { readonly id: string; readonly coordinate?: string }) => {
        const coordinate = block.coordinate ?? null;
        if (coordinate) {
            useCoordinateStore.getState().setSelected(coordinate);
        }
        gateway()
            .invoke(CONTEXT_XRAY_RPC, { coordinate, blockId: block.id })
            .then(receipt => setXray(normalizeContextXray(receipt.artifact, coordinate)))
            .catch(err => setXray(pendingContextXray(err, coordinate)));
    };

    // 44.5: the day/now runtime serves the psyche renderer's blocks projection
    // on the LIVE s3'.temporal.context method — hydrate from it when the
    // session carries blocks; the fixture stays the acceptance baseline.
    useEffect(() => {
        if (!connected || !sessionKey) {
            setSessionClose({
                state: 'pending',
                reason: 'connect the gateway and bind an exact session key to load close aggregates'
            });
            return;
        }
        gateway()
            .invoke(TEMPORAL_CONTEXT_RPC, { sessionKey })
            .then(receipt => {
                const projection = normalizeTemporalBlocksProjection(receipt.artifact);
                if (projection.blocks.length > 0) {
                    setState(createRendererSessionState([...projection.blocks]));
                    setBlockSource('live');
                }
            })
            .catch(() => {
                /* fixture remains the honest baseline */
            });
    }, [connected, sessionKey]);

    useEffect(() => {
        if (!connected || !sessionKey) {
            setContemplationObject({
                state: 'pending',
                reason: 'connect the gateway and bind an exact session key to load contemplation aggregates'
            });
            return;
        }
        let cancelled = false;
        setContemplationObject({
            state: 'pending',
            reason: 'loading latest protected contemplation projection for the exact session key'
        });
        gateway()
            .invoke(CONTEMPLATION_OBJECT_READ_METHOD, { sessionKey, latest: true })
            .then(receipt => {
                if (cancelled) return;
                const parsed = readContemplationObjectProjection(receipt.artifact);
                if (parsed.state === 'ready' && parsed.sessionId !== sessionKey) {
                    setContemplationObject({
                        state: 'blocked',
                        reason: 'returned contemplation projection does not match the exact bound session'
                    });
                    return;
                }
                if (parsed.state === 'ready') {
                    setContemplationObject({ state: 'ready', contemplation: parsed });
                    return;
                }
                setContemplationObject(parsed);
            })
            .catch(err => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : String(err);
                if (message.includes('no persisted contemplation projection')) {
                    setContemplationObject({ state: 'absent', reason: message });
                    return;
                }
                setContemplationObject({ state: 'error', reason: message });
            });
        return () => {
            cancelled = true;
        };
    }, [connected, sessionKey]);

    useEffect(() => {
        if (!connected || !sessionKey) {
            return;
        }
        let cancelled = false;
        setSessionClose({
            state: 'pending',
            reason: 'loading latest persisted close bundle for the exact session key'
        });
        gateway()
            .invoke(M1_SESSION_CLOSE_READ_METHOD, { sessionKey, latest: true })
            .then(receipt => {
                if (cancelled) {
                    return;
                }
                const parsed = readM1SessionCloseBundle(receipt.artifact);
                if (parsed.state === 'ready') {
                    if (parsed.sessionId !== sessionKey) {
                        setSessionClose({
                            state: 'blocked',
                            reason: 'returned close bundle does not match the exact bound session'
                        });
                        return;
                    }
                    setSessionClose({ state: 'ready', close: parsed });
                    return;
                }
                setSessionClose(parsed);
            })
            .catch(err => {
                if (cancelled) {
                    return;
                }
                const message = err instanceof Error ? err.message : String(err);
                if (message.includes('no persisted session-close bundle')) {
                    setSessionClose({ state: 'absent', reason: message });
                    return;
                }
                setSessionClose({ state: 'error', reason: message });
            });
        return () => {
            cancelled = true;
        };
    }, [connected, sessionKey]);

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
        <div className="review-blocks-pane" data-testid="review-blocks-pane" data-block-source={blockSource}>
            {(requestedReviewId ?? reviewTab.selectedReviewId) ? (
                <p className="pane-message review-request-target" data-testid="review-request-target">
                    Requested review: {requestedReviewId ?? reviewTab.selectedReviewId}
                </p>
            ) : null}
            <p className="pane-message review-blocks-seam" data-testid="review-blocks-seam-note">
                Review rows ride the synthetic acceptance fixture — the live wire→record producer is
                track-12's seam; verdicts route to the s4-prime psyche.update seam under the m5 human gate.
            </p>
            <section className="review-session-close" data-testid="review-session-close">
                {sessionClose.state === 'ready' ? (
                    <M1SessionCloseReader close={sessionClose.close} />
                ) : sessionClose.state === 'absent' ? (
                    <p data-testid="review-session-close-absent">
                        No persisted 7-8-9 close bundle exists for this exact session yet.
                    </p>
                ) : sessionClose.state === 'error' ? (
                    <p data-testid="review-session-close-error">
                        Close-bundle read failed: {sessionClose.reason}
                    </p>
                ) : sessionClose.state === 'blocked' ? (
                    <p data-testid="review-session-close-blocked">
                        Close-bundle parse blocked: {sessionClose.reason}
                    </p>
                ) : (
                    <p data-testid="review-session-close-pending">{sessionClose.reason}</p>
                )}
            </section>
            <section className="review-contemplation-object" data-testid="review-contemplation-object">
                {contemplationObject.state === 'ready' ? (
                    <ContemplationObjectViewer contemplation={contemplationObject.contemplation} />
                ) : contemplationObject.state === 'absent' ? (
                    <p data-testid="review-contemplation-object-absent">
                        No persisted contemplation projection exists for this exact session yet.
                    </p>
                ) : contemplationObject.state === 'error' ? (
                    <p data-testid="review-contemplation-object-error">
                        Contemplation read failed: {contemplationObject.reason}
                    </p>
                ) : contemplationObject.state === 'blocked' ? (
                    <p data-testid="review-contemplation-object-blocked">
                        Contemplation parse blocked: {contemplationObject.reason}
                    </p>
                ) : (
                    <p data-testid="review-contemplation-object-pending">{contemplationObject.reason}</p>
                )}
            </section>
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
            {xray ? (
                <aside className="review-xray-strip" data-testid="review-xray-strip" data-wire-state={xray.wireState}>
                    {xray.wireState === 'live' ? (
                        <>
                            <span data-testid="review-xray-coordinates">
                                related: {xray.relatedCoordinates.join(' · ') || 'none'}
                            </span>
                            {xray.episodeHandles.length > 0 ? (
                                <span data-testid="review-xray-episodes">
                                    episodes: {xray.episodeHandles.join(' · ')}
                                </span>
                            ) : null}
                        </>
                    ) : (
                        <span data-testid="review-xray-pending">
                            context-xray pending — the s2-prime coordinate.context_xray seam is not on the wire yet
                        </span>
                    )}
                </aside>
            ) : null}
            {/* 32.T32.6 — the Atelier with nothing to judge. Registered M5
                empty state rather than a silent fold: the review queue and the
                dispatch history are named, and the reasons table says which
                producer is absent. */}
            {reviewItems.length === 0 ? (
                <MExtensionEmptyState extensionId="m5-epii" viewId="review" />
            ) : null}
            <BlockHost blocks={state.blocks} onBlockSelect={selectBlock} />
        </div>
    );
}
