/**
 * Coordinate: M' M4' (PASU BeingPattern perspective card — rerun 25.T25.22)
 * Residency: Body/M/pratibimba-app/src/panes/beingPattern
 * Position (#n): #4 — the protected-local READ of how the entity is being read.
 * Actualises: view id `m4.nara.beingPatternPerspective` — the Nara consumer of
 *   `PasuBeingPatternProjection` (spec §25.22). NOT an identity editor: a
 *   handle-only read surface rendering the relationship dial (seven
 *   `MonoPolyOperator` modes), the perspective strip (I / You / You-and-I /
 *   They / We / We-I), the optional family overlay chips, public-safe clock
 *   address + elemental weights + relation edges + verifier counts, and the
 *   review-risk banner when `monopolyOperator === 'ActualisingOne'`.
 *
 *   IT READS THE LIVE STREAM. Two sources, in this order:
 *     1. `MathemeHarmonicProfile.pasuBeingPattern` — the 18.10 typed handle on
 *        the profile tick, when the S3 heartbeat attaches one. This is the
 *        spec's `SharedBridgeAdapter.onProfile()` path; in this carrier the
 *        profile tick IS that adapter.
 *     2. `s3'.being_pattern.subscribe` — the CCT-21 producer itself
 *        (`Body/S/S3/gateway/src/being_pattern.rs`, registered in `S3_METHODS`
 *        since 373709f0). Read-only: the card never calls `observe`, because
 *        `observe` requires the CALLER to supply `perspectiveRole` and
 *        `monopolyOperator` — the reading itself — and authoring the reading is
 *        precisely what this surface must not do.
 *   An empty roster is rendered as the producer's OWN sentence ("no entity
 *   observed yet"), never as a defaulted reading.
 *
 *   THE REVIEW GATE. `ActualisingOne` cannot be accepted here. The single
 *   action opens a review CANDIDATE through `s3'.being_pattern.review_candidate`
 *   — which admits ONLY `ActualisingOne`, stamps `forced-unification` /
 *   `emitted-review-only`, writes no S2 canon, and names the Hen/S2 promotion
 *   path instead of taking it — and then routes the user to the Epii review
 *   fold. (The spec names `m5.review.openBeingPatternCandidate`; no such arm
 *   exists at any coordinate, and the S3' emit-review-only arm is the substrate
 *   built for exactly this act. The banner says which one it used.)
 * Public surface: M4BeingPatternPerspectiveCard, BEING_PATTERN_SUBSCRIBE_RPC,
 *   BEING_PATTERN_REVIEW_CANDIDATE_RPC.
 * Does NOT own: the producer (S3 gateway), PASU identity fields (nothing here
 *   writes one), S2 canon, the host pane (`PratibimbaCoordinatePane` mounts
 *   this as its being-pattern section), or review resolution (M5).
 * Contract: design-recon 25-m4-nara-frontend-deep.md §25.22 · [[DR-WC-M4-6]]
 *   · [[CHROME-CONTRACT]] §3 (gateway-only network).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway, gatewayReady } from '../../bridge/gatewayHolder';
import { commands } from '../../commands/registry';
import { useTickStore } from '../../state/stores';
import { privacyChrome } from '../../ui/privacyChrome';
import {
    ELEMENTS,
    MONO_POLY_OPERATORS,
    MONO_POLY_READINGS,
    PERSPECTIVE_ROLES,
    PERSPECTIVE_STRIP_LABELS,
    parseBeingPatternProjection,
    parseBeingPatternStream,
    type BeingPatternProjectionView,
    type BeingPatternStreamView
} from './beingPatternProjection';

export const BEING_PATTERN_SUBSCRIBE_RPC = "s3'.being_pattern.subscribe";
export const BEING_PATTERN_REVIEW_CANDIDATE_RPC = "s3'.being_pattern.review_candidate";

/** Where the rendered reading came from — shown, never guessed at. */
type ReadingSource = 'profile-handle' | 'live-stream';

type SeamState =
    | { readonly kind: 'loading' }
    | { readonly kind: 'dark'; readonly reason: string }
    | { readonly kind: 'refused'; readonly reason: string }
    | { readonly kind: 'empty'; readonly stream: BeingPatternStreamView }
    | {
          readonly kind: 'live';
          readonly source: ReadingSource;
          readonly views: readonly BeingPatternProjectionView[];
          readonly stream: BeingPatternStreamView | null;
      };

interface ReviewEmission {
    readonly candidateId: string;
    readonly status: string;
    readonly reviewRisk: string;
    readonly canonPromotionPath: string;
    readonly s2Mutated: boolean;
}

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

/** The 18.10 typed handle, if the heartbeat attached one to this tick. */
function profileHandleOf(profile: unknown): unknown {
    if (!profile || typeof profile !== 'object') {
        return null;
    }
    return (profile as { pasuBeingPattern?: unknown }).pasuBeingPattern ?? null;
}

export function M4BeingPatternPerspectiveCard() {
    const [seam, setSeam] = useState<SeamState>({ kind: 'loading' });
    const [selected, setSelected] = useState<string | null>(null);
    const [emission, setEmission] = useState<ReviewEmission | null>(null);
    const [emitError, setEmitError] = useState<string | null>(null);
    const cached = useTickStore(state => state.profile);
    // The one 15.6 re-render seam: the projection's `liveState` generation is
    // stamped per profile tick (CCT-21), so the read re-runs when the
    // generation moves — never on a local timer.
    const generation = useTickStore(state => state.generation);

    useEffect(() => {
        let cancelled = false;

        // (1) the 18.10 profile handle, when the heartbeat carries one.
        const handle = profileHandleOf(cached?.profile ?? null);
        if (handle) {
            const parsed = parseBeingPatternProjection(handle);
            setSeam(
                parsed.kind === 'projection'
                    ? { kind: 'live', source: 'profile-handle', views: [parsed.view], stream: null }
                    : { kind: 'refused', reason: parsed.reason }
            );
            return;
        }

        // (2) the CCT-21 producer itself.
        if (!gatewayReady()) {
            setSeam({ kind: 'dark', reason: 'gateway not connected' });
            return;
        }
        gateway()
            .invoke(BEING_PATTERN_SUBSCRIBE_RPC, {})
            .then(receipt => {
                if (cancelled) {
                    return;
                }
                const parsed = parseBeingPatternStream(artifactOf(receipt));
                if (parsed.kind === 'refused') {
                    setSeam({ kind: 'refused', reason: parsed.reason });
                    return;
                }
                setSeam(
                    parsed.stream.entities.length === 0
                        ? { kind: 'empty', stream: parsed.stream }
                        : {
                              kind: 'live',
                              source: 'live-stream',
                              views: parsed.stream.entities,
                              stream: parsed.stream
                          }
                );
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }
                setSeam({
                    kind: 'dark',
                    reason: error instanceof Error ? error.message : String(error)
                });
            });
        return () => {
            cancelled = true;
        };
    }, [generation, cached]);

    const views = seam.kind === 'live' ? seam.views : [];
    const view = views.find(entry => entry.entityId === selected) ?? views[0] ?? null;

    const openReviewCandidate = useCallback(
        (target: BeingPatternProjectionView) => {
            setEmitError(null);
            gateway()
                .invoke(BEING_PATTERN_REVIEW_CANDIDATE_RPC, {
                    candidateId: `being-pattern:${target.entityId}:${target.streamGeneration ?? 0}`,
                    entityIds: [target.entityId],
                    monopolyOperator: 'ActualisingOne'
                })
                .then(receipt => {
                    const reply = artifactOf(receipt) as Record<string, unknown> | null;
                    const candidate = (reply?.candidate ?? {}) as Record<string, unknown>;
                    setEmission({
                        candidateId:
                            typeof candidate.candidateId === 'string' ? candidate.candidateId : '—',
                        status: typeof reply?.status === 'string' ? reply.status : 'unstated',
                        reviewRisk:
                            typeof reply?.reviewRisk === 'string' ? reply.reviewRisk : 'unstated',
                        canonPromotionPath:
                            typeof reply?.canonPromotionPath === 'string'
                                ? reply.canonPromotionPath
                                : 'unstated',
                        s2Mutated: reply?.s2Mutated === true
                    });
                })
                .catch((error: unknown) =>
                    setEmitError(error instanceof Error ? error.message : String(error))
                );
        },
        []
    );

    const chrome = privacyChrome('protected_local_handle_only');

    return (
        <section
            className={`being-pattern-perspective ${chrome.className}`}
            title={chrome.title}
            data-testid="being-pattern-perspective"
            data-view-id="m4.nara.beingPatternPerspective"
            data-seam={seam.kind}
            data-reading-source={seam.kind === 'live' ? seam.source : null}
        >
            <h3>Being-pattern perspective</h3>
            {seam.kind === 'loading' ? (
                <p className="pane-message" data-testid="being-pattern-loading">
                    reading the being-pattern stream…
                </p>
            ) : null}
            {seam.kind === 'dark' ? (
                <p className="pane-message being-pattern-dark" data-testid="being-pattern-dark">
                    the being-pattern stream is unreachable: <code>{BEING_PATTERN_SUBSCRIBE_RPC}</code>{' '}
                    did not answer. Nothing is rendered in its place. ({seam.reason})
                </p>
            ) : null}
            {seam.kind === 'refused' ? (
                <p className="pane-message being-pattern-refused" data-testid="being-pattern-refused">
                    projection refused: {seam.reason}
                </p>
            ) : null}
            {seam.kind === 'empty' ? (
                <p className="pane-message being-pattern-empty" data-testid="being-pattern-empty">
                    the live stream carries no observed being yet — {seam.stream.source}. A reading
                    exists only because something was observed into it; nothing is invented to fill
                    the surface. (generation {seam.stream.generation ?? '—'})
                </p>
            ) : null}
            {seam.kind === 'live' && view ? (
                <>
                    {views.length > 1 ? (
                        <div className="being-entity-roster" data-testid="being-entity-roster" role="group">
                            {views.map(entry => (
                                <button
                                    key={entry.entityId}
                                    type="button"
                                    className="being-entity-stop"
                                    data-testid={`being-entity-${entry.entityId}`}
                                    aria-current={entry.entityId === view.entityId}
                                    onClick={() => setSelected(entry.entityId)}
                                >
                                    {entry.entityId}
                                </button>
                            ))}
                        </div>
                    ) : null}
                    <BeingPatternReading view={view} source={seam.source} stream={seam.stream} />
                    {view.monopolyOperator === 'ActualisingOne' ? (
                        <div className="being-review-risk" data-testid="being-review-risk">
                            <p>
                                ActualisingOne is review-gated ({view.reviewRisk}): a unification in
                                progress must be witnessed by Epii review, never accepted from this
                                surface. The spec names <code>m5.review.openBeingPatternCandidate</code>;
                                no such arm exists, so this opens the candidate through the S3′
                                emit-review-only arm <code>{BEING_PATTERN_REVIEW_CANDIDATE_RPC}</code>,
                                which writes no S2 canon.
                            </p>
                            <button
                                type="button"
                                data-testid="being-review-open-candidate"
                                onClick={() => openReviewCandidate(view)}
                            >
                                Open review candidate
                            </button>
                            {emitError ? (
                                <p data-testid="being-review-error">
                                    the candidate was not emitted: {emitError}
                                </p>
                            ) : null}
                            {emission ? (
                                <dl className="being-review-emission" data-testid="being-review-emission">
                                    <dt>candidate</dt>
                                    <dd data-testid="being-review-candidate-id">{emission.candidateId}</dd>
                                    <dt>status</dt>
                                    <dd data-testid="being-review-status">{emission.status}</dd>
                                    <dt>risk</dt>
                                    <dd>{emission.reviewRisk}</dd>
                                    <dt>S2 mutated</dt>
                                    <dd data-testid="being-review-s2-mutated">
                                        {emission.s2Mutated ? 'yes' : 'no'}
                                    </dd>
                                    <dt>promotion path</dt>
                                    <dd>{emission.canonPromotionPath}</dd>
                                </dl>
                            ) : null}
                            <button
                                type="button"
                                data-testid="being-review-open"
                                onClick={() => void commands.execute('omnipanel.openReview')}
                            >
                                Open Epii review
                            </button>
                        </div>
                    ) : null}
                </>
            ) : null}
        </section>
    );
}

function BeingPatternReading({
    view,
    source,
    stream
}: {
    readonly view: BeingPatternProjectionView;
    readonly source: ReadingSource;
    readonly stream: BeingPatternStreamView | null;
}) {
    return (
        <div className="being-pattern-reading" data-testid="being-pattern-reading">
            {/* the relationship dial — all seven modes, the live one pressed */}
            <div className="being-pattern-dial" data-testid="being-pattern-dial" role="group">
                {MONO_POLY_OPERATORS.map(operator => (
                    <span
                        key={operator}
                        data-testid={`being-dial-${operator}`}
                        className="being-dial-stop"
                        aria-current={operator === view.monopolyOperator}
                        title={MONO_POLY_READINGS[operator]}
                    >
                        {operator}
                    </span>
                ))}
            </div>
            <p className="being-pattern-dial-reading" data-testid="being-pattern-dial-reading">
                {MONO_POLY_READINGS[view.monopolyOperator]}
            </p>
            {/* the perspective strip — I / You / You-and-I / They / We / We-I */}
            <div className="being-perspective-strip" data-testid="being-perspective-strip" role="group">
                {PERSPECTIVE_ROLES.map(role => (
                    <span
                        key={role}
                        data-testid={`being-perspective-${role}`}
                        className="being-perspective-stop"
                        aria-current={role === view.perspectiveRole}
                    >
                        {PERSPECTIVE_STRIP_LABELS[role]}
                    </span>
                ))}
            </div>
            {/* optional family overlay — only when the reading applies the lens */}
            {view.naraFamilyRole ? (
                <div className="being-family-overlay" data-testid="being-family-overlay">
                    <span data-testid={`being-family-${view.naraFamilyRole}`} className="being-family-chip">
                        {view.naraFamilyRole}
                    </span>
                </div>
            ) : null}
            <dl className="being-pattern-handles" data-testid="being-pattern-handles">
                <dt>entity</dt>
                <dd data-testid="being-entity-ref">
                    {view.entityId} · {view.entityKind}
                </dd>
                <dt>graph anchor</dt>
                <dd data-testid="being-graph-anchor">{view.graphAnchor || '—'}</dd>
                <dt>observed by</dt>
                <dd data-testid="being-observer">
                    {view.observerEntityId ?? '—'}
                    {view.observerRole ? ` (${PERSPECTIVE_STRIP_LABELS[view.observerRole]})` : ''}
                </dd>
                <dt>clock</dt>
                <dd data-testid="being-clock-address">
                    {view.clockAddress
                        ? `${view.clockAddress.degree360}° · tick ${view.clockAddress.tick12}` +
                          (view.clockAddress.hexagram !== null
                              ? ` · hex ${view.clockAddress.hexagram}` +
                                (view.clockAddress.line !== null ? `.${view.clockAddress.line}` : '')
                              : '') +
                          ` — ${view.clockAddress.source}`
                        : '—'}
                </dd>
                <dt>elements</dt>
                <dd data-testid="being-elemental-weights">
                    {view.elementalWeights
                        ? ELEMENTS.map(
                              element => `${element}:${view.elementalWeights![element].toFixed(2)}`
                          ).join(' · ')
                        : '—'}
                </dd>
                <dt>relation edges</dt>
                <dd data-testid="being-relation-edge-count">{view.relationEdges.length}</dd>
                <dt>verifier refs</dt>
                <dd data-testid="being-verifier-ref-count">{view.verifierRefCount}</dd>
                <dt>bioquaternion handles</dt>
                <dd data-testid="being-bioquaternion-count">{view.bioquaternionHandleCount}</dd>
                <dt>stream generation</dt>
                <dd data-testid="being-stream-generation">{view.streamGeneration ?? '—'}</dd>
                <dt>read from</dt>
                <dd data-testid="being-reading-source">
                    {source === 'profile-handle'
                        ? 'profile tick handle (18.10)'
                        : `${BEING_PATTERN_SUBSCRIBE_RPC} — ${stream?.source ?? 'live-producer'}`}
                </dd>
            </dl>
            {view.relationEdges.length > 0 ? (
                <ul className="being-relation-edges" data-testid="being-relation-edges">
                    {view.relationEdges.map(edge => (
                        <li key={edge.edgeId} data-testid={`being-edge-${edge.edgeId}`}>
                            {edge.sourceEntityId} → {edge.targetEntityId} · {edge.edgeKind}
                            {edge.aspectLabel ? ` · ${edge.aspectLabel}` : ''} · gen {edge.generation} ·{' '}
                            <span data-testid={`being-edge-canon-${edge.edgeId}`}>{edge.canonStatus}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
