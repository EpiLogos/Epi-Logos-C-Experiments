/**
 * Coordinate: M' M5' (Autoresearch pane - 28.T28.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5-4' governed autoresearch surface
 * Actualises: concept disclosure, Mobius lifecycle ribbon, capacity filtering,
 *   profile-tick refresh, and governed Review-pane click-through.
 * Public surface: AutoresearchPane, MobiusPassRibbon.
 * Does NOT own: autoresearch execution, promotion, canon mutation, or time.
 * Contract: [[M5'-SPEC]] / [[CHROME-CONTRACT]]
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, IntentPrivacyClass } from '../commands/crossLayoutIntent';
import { useSessionStore, useTickStore } from '../state/stores';
import { useProfileTick } from '../state/useProfileTick';
import {
    AutoresearchSnapshot,
    IMPROVE_HISTORY_METHOD,
    IMPROVE_STATUS_METHOD,
    M5_OPERATIONAL_CAPACITIES,
    M5OperationalCapacity,
    MOBIUS_STAGES,
    parseImproveHistory,
    parseImproveStatus,
    parseQReviewQueue,
    profileVakCf,
    Q_ARTICULATION_ACCEPT_METHOD,
    Q_REVIEW_LATEST_METHOD
    , REVIEW_RESOLVE_METHOD,
    REVIEW_SUBMIT_METHOD,
    type QReviewEntry
} from './autoresearchModel';
import { composeQPairCandidate, validateQPairCandidate } from './qPairComposition';
import { BridgeReadinessBadge } from '../ui/BridgeReadinessBadge';

export const AUTORESEARCH_CONTRACT_TEXT =
    'Autoresearch is dry-run only. requires_human is non-bypassable, and forbidden_authority prevents direct canon mutation. Candidates route through M5 governance for human ratification.';

export interface AutoresearchPaneProps {
    readonly fixture?: AutoresearchSnapshot;
    readonly onOpenReview?: (reviewId: string) => void;
}

export function MobiusPassRibbon({ status }: Pick<AutoresearchSnapshot, 'status'>) {
    return (
        <section className="autoresearch-ribbon" data-testid="autoresearch-mobius-ribbon">
            <div className="autoresearch-ribbon-head">
                <strong>Mobius lifecycle</strong>
                <span data-testid="autoresearch-recompose-pass">recompose pass: not projected</span>
                <span className="autoresearch-dry-run" data-testid="autoresearch-dry-run">
                    dry-run enforced
                </span>
            </div>
            <ol className="autoresearch-stages">
                {MOBIUS_STAGES.map(stage => (
                    <li key={stage} data-active={stage === status.activeStage} aria-current={stage === status.activeStage ? 'step' : undefined}>
                        {stage}
                    </li>
                ))}
            </ol>
            <span className="autoresearch-ribbon-counts">
                {status.activeVectorCount} active / {status.totalRuns} total / {status.keepCount} kept / {status.discardCount} discarded
            </span>
        </section>
    );
}

async function loadSnapshot(dayNow: string | null, cf: string | null): Promise<AutoresearchSnapshot> {
    const [statusReceipt, historyReceipt, queueReceipt] = await Promise.all([
        gateway().invoke(IMPROVE_STATUS_METHOD, {}),
        gateway().invoke(IMPROVE_HISTORY_METHOD, { limit: 100 }),
        dayNow
            ? gateway().invoke(Q_REVIEW_LATEST_METHOD, { day_id: dayNow, ...(cf ? { cf } : {}) })
            : Promise.resolve(null)
    ]);
    const queue = queueReceipt?.artifact ? parseQReviewQueue(queueReceipt.artifact) : null;
    return Object.freeze({
        status: parseImproveStatus(statusReceipt.artifact),
        candidates: parseImproveHistory(historyReceipt.artifact),
        qReviewEntries: queue?.entries ?? [],
        qReviewGraphRevision: queue?.graphRevision ?? null
    });
}

function artifactRecord(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function artifactString(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${label} must be a non-blank string`);
    }
    return value;
}

export function AutoresearchPane({ fixture, onOpenReview }: AutoresearchPaneProps) {
    const tick = useProfileTick();
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const sessionPrivacy = useSessionStore(state => state.privacyClass);
    const profile = useTickStore(state => state.profile?.profile ?? null);
    const activeVakCf = useMemo(() => profileVakCf(profile), [profile]);
    const [snapshot, setSnapshot] = useState<AutoresearchSnapshot | null>(fixture ?? null);
    const [capacity, setCapacity] = useState<M5OperationalCapacity | 'all'>('all');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(!fixture);
    const [activeQReview, setActiveQReview] = useState<QReviewEntry | null>(null);
    const [pairRationale, setPairRationale] = useState('');
    const [pairOpeningQuestion, setPairOpeningQuestion] = useState('');
    const [pairCandidate, setPairCandidate] = useState('');
    const [pairSubmitting, setPairSubmitting] = useState(false);
    const [pairReceipt, setPairReceipt] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (fixture) {
            return;
        }
        if (!gatewayReady()) {
            setLoading(false);
            setError('Gateway disconnected. Autoresearch state was not loaded.');
            return;
        }
        setLoading(true);
        loadSnapshot(dayNow, activeVakCf)
            .then(next => {
                setSnapshot(next);
                setError(null);
            })
            .catch(err => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [fixture, dayNow, activeVakCf]);

    useEffect(refresh, [refresh, tick.generation]);

    const visible = useMemo(
        () => snapshot?.candidates.filter(candidate => capacity === 'all' || candidate.capacity === capacity) ?? [],
        [snapshot, capacity]
    );
    const capacityPanes = useMemo(
        () =>
            M5_OPERATIONAL_CAPACITIES.map(item => {
                const candidates = snapshot?.candidates.filter(candidate => candidate.capacity === item.id) ?? [];
                return {
                    ...item,
                    candidateCount: candidates.length,
                    humanGateCount: candidates.filter(candidate => candidate.requiresHuman === true).length
                };
            }),
        [snapshot]
    );

    const openReview = (candidate: AutoresearchSnapshot['candidates'][number]) => {
        const reviewId = candidate.reviewId;
        if (!reviewId) {
            return;
        }
        if (onOpenReview) {
            onOpenReview(reviewId);
        } else {
            const privacyClass: IntentPrivacyClass | null =
                sessionPrivacy === 'public' || sessionPrivacy === 'protected' || sessionPrivacy === 'private'
                    ? sessionPrivacy
                    : null;
            void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: candidate.targetCoordinate,
                artifactUri: null,
                reviewId,
                dayNow,
                sessionKey,
                profileGeneration: tick.generation,
                privacyClass,
                requestedExtensionId: 'm5-epii',
                requestedContributionId: 'review'
            });
        }
    };

    const openPairComposition = (entry: QReviewEntry) => {
        setActiveQReview(entry);
        setPairRationale('');
        setPairOpeningQuestion('');
        setPairCandidate('');
        setPairReceipt(null);
        setError(null);
    };

    const composePairCandidate = async () => {
        if (!activeQReview) {
            return;
        }
        try {
            const candidate = await composeQPairCandidate(activeQReview, pairRationale);
            setPairCandidate(candidate);
            setError(null);
        } catch (compositionError) {
            setError(compositionError instanceof Error ? compositionError.message : String(compositionError));
        }
    };

    const acceptPairCandidate = async () => {
        if (!activeQReview || !snapshot || snapshot.qReviewGraphRevision === null) {
            setError('Q review queue revision is unavailable; refresh before accepting a proposal.');
            return;
        }
        const validation = validateQPairCandidate(activeQReview, pairCandidate);
        if (!validation.ok) {
            setError(validation.error ?? 'Sophia refused the candidate articulation.');
            return;
        }
        if (pairOpeningQuestion.trim().length === 0) {
            setError('An opening question is required before a Sophia proposal can be accepted.');
            return;
        }
        if (!gatewayReady()) {
            setError('Gateway disconnected. Reconnect before submitting a Q articulation.');
            return;
        }

        setPairSubmitting(true);
        try {
            const reviewReceipt = await gateway().invoke(REVIEW_SUBMIT_METHOD, {
                source: 'human_gate',
                title: `Accept ${activeQReview.qKey} at ${activeQReview.targetCoordinate}`,
                body: pairRationale,
                priority: 'blocking',
                coordinate_context: {
                    coordinate: activeQReview.targetCoordinate,
                    vak_cf: activeQReview.vakCf,
                    vak_cp: activeQReview.vakCp,
                    pair_composition_action: activeQReview.pairCompositionAction
                },
                proposed_action: {
                    kind: 'q_articulation_accept',
                    target: { coordinate: activeQReview.targetCoordinate, q_key: activeQReview.qKey },
                    destination: 'bimba',
                    payload: {
                        q_value_candidate: pairCandidate,
                        opens_questions: [pairOpeningQuestion.trim()]
                    }
                },
                requires_human: true,
                governance_profile: {
                    category: 'canon_recognition_publication_gate',
                    gate_kind: 'publication_gate',
                    governance_level: 'publication_blocking',
                    required_actors: ['human'],
                    source_artifact_refs: activeQReview.evidenceRefs.map(evidence => evidence.uri),
                    target_subsystem: 'Bimba',
                    promotion_destination: 'bimba'
                }
            });
            const review = artifactRecord(reviewReceipt.artifact, 'Q articulation review receipt');
            const reviewItem = artifactRecord(review.item, 'Q articulation review item');
            const reviewId = artifactString(reviewItem.item_id, 'Q articulation review id');

            await gateway().invoke(REVIEW_RESOLVE_METHOD, {
                item_id: reviewId,
                decision: 'approve',
                rationale: pairRationale,
                resolved_by: 'human',
                promotion_destination: 'bimba',
                promoted_artifact: {
                    coordinate: activeQReview.targetCoordinate,
                    q_key: activeQReview.qKey,
                    q_value_candidate: pairCandidate
                }
            });
            const acceptance = await gateway().invoke(Q_ARTICULATION_ACCEPT_METHOD, {
                coordinate: activeQReview.targetCoordinate,
                qKey: activeQReview.qKey,
                qValueCandidate: pairCandidate,
                expectedGraphRevision: snapshot.qReviewGraphRevision,
                acceptedReviewRef: reviewId,
                opensQuestions: [pairOpeningQuestion.trim()],
                sourceArtifacts: activeQReview.evidenceRefs.map(evidence => evidence.uri)
            });
            const accepted = artifactRecord(acceptance.artifact, 'Q articulation acceptance receipt');
            setPairReceipt(
                `Hen promoted ${artifactString(accepted.q_key, 'accepted Q key')} at graph revision ${accepted.graph_revision}.`
            );
            setError(null);
            refresh();
        } catch (acceptanceError) {
            setError(acceptanceError instanceof Error ? acceptanceError.message : String(acceptanceError));
        } finally {
            setPairSubmitting(false);
        }
    };

    return (
        <div className="autoresearch-pane" data-testid="autoresearch-pane">
            <header className="autoresearch-concept" data-testid="autoresearch-as-concept">
                <strong>Autoresearch governance</strong>
                <span>{AUTORESEARCH_CONTRACT_TEXT}</span>
            </header>

            {snapshot ? <MobiusPassRibbon status={snapshot.status} /> : null}

            <div className="pane-toolbar autoresearch-toolbar">
                <label htmlFor="autoresearch-capacity">Capacity</label>
                <select
                    id="autoresearch-capacity"
                    data-testid="autoresearch-capacity-filter"
                    value={capacity}
                    onChange={event => setCapacity(event.currentTarget.value as M5OperationalCapacity | 'all')}
                >
                    <option value="all">All capacities</option>
                    {M5_OPERATIONAL_CAPACITIES.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={refresh} disabled={!!fixture || loading} data-testid="autoresearch-refresh">
                    Refresh
                </button>
                <span className="autoresearch-tick">profile generation {tick.generation ?? 'pending'}</span>
                <BridgeReadinessBadge bindingKey="s5'.improve.history" />
            </div>

            {error ? <p className="pane-message autoresearch-error" data-testid="autoresearch-error">{error}</p> : null}
            {loading ? <p className="pane-message" data-testid="autoresearch-loading">Loading autoresearch state...</p> : null}

            <section className="autoresearch-capacity-matrix" data-testid="autoresearch-capacity-matrix">
                <h2>Operational capacity runtime</h2>
                <div className="autoresearch-capacity-panes">
                    {capacityPanes.map(item => (
                        <button
                            type="button"
                            className="autoresearch-capacity-pane"
                            key={item.id}
                            data-testid={`autoresearch-capacity-pane-${item.id}`}
                            aria-pressed={capacity === item.id}
                            onClick={() => setCapacity(item.id)}
                        >
                            <strong>{item.label}</strong>
                            <span>{item.candidateCount} {item.candidateCount === 1 ? 'candidate' : 'candidates'}</span>
                            <span>{item.humanGateCount} {item.humanGateCount === 1 ? 'human gate' : 'human gates'}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="autoresearch-candidates" data-testid="autoresearch-candidates">
                {!loading && visible.length === 0 ? (
                    <p className="pane-message" data-testid="autoresearch-empty">No candidates in this capacity.</p>
                ) : null}
                {visible.map(candidate => (
                    <article
                        className="autoresearch-candidate"
                        key={candidate.id}
                        data-testid="autoresearch-candidate"
                        data-capacity={candidate.capacity ?? 'unclassified'}
                        data-review-id={candidate.reviewId ?? undefined}
                    >
                        <div className="autoresearch-candidate-main">
                            <strong>{candidate.title}</strong>
                            <code>{candidate.targetCoordinate}</code>
                            <span>{candidate.loopState}{candidate.decision ? ` / ${candidate.decision}` : ''}</span>
                        </div>
                        <div className="autoresearch-candidate-meta">
                            <span className="autoresearch-capacity-badge">{candidate.capacity ?? 'capacity not projected'}</span>
                            {candidate.requiresHuman === true ? (
                                <span className="autoresearch-human-gate" data-testid="autoresearch-human-gate">
                                    Human ratification required - agent transitions blocked at gateway
                                </span>
                            ) : null}
                            {candidate.reviewId ? (
                                <button type="button" onClick={() => openReview(candidate)} data-testid="autoresearch-open-review">
                                    Open in Review pane
                                </button>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>

            {snapshot && snapshot.qReviewEntries.length > 0 ? (
                <section className="autoresearch-q-review" data-testid="autoresearch-q-review-queue">
                    <h2>Q review queue</h2>
                    {snapshot.qReviewEntries.map(entry => (
                        <article
                            className="autoresearch-q-review-entry"
                            key={`${entry.targetCoordinate}:${entry.qKey}:${entry.sourceDetector}`}
                            data-testid="autoresearch-q-review-entry"
                            data-vak-cf={entry.vakCf}
                            data-vak-cp={entry.vakCp}
                        >
                            <div>
                                <strong>{entry.targetCoordinate}</strong>
                                <code>{entry.qKey}</code>
                                <span>{entry.reasonClass} / priority {entry.priority}</span>
                            </div>
                            <div>
                                <span>{entry.vakCf} / {entry.vakCp}</span>
                                <span>{entry.pairCompositionAction}</span>
                                <span>{entry.evidenceCount} evidence refs</span>
                                <button
                                    type="button"
                                    onClick={() => openPairComposition(entry)}
                                    data-testid="autoresearch-open-pair-composition"
                                >
                                    Open pair composition
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            ) : null}

            {activeQReview ? (
                <section className="q-pair-workspace" data-testid="q-pair-workspace">
                    <header>
                        <div>
                            <strong>Pair composition</strong>
                            <code>{activeQReview.targetCoordinate} / {activeQReview.qKey}</code>
                        </div>
                        <span data-testid="q-pair-vak">{activeQReview.vakCf} / {activeQReview.vakCp}</span>
                    </header>
                    <label htmlFor="q-pair-rationale">Rationale</label>
                    <textarea
                        id="q-pair-rationale"
                        value={pairRationale}
                        onChange={event => setPairRationale(event.currentTarget.value)}
                    />
                    <label htmlFor="q-pair-opening-question">Opening question</label>
                    <input
                        id="q-pair-opening-question"
                        value={pairOpeningQuestion}
                        onChange={event => setPairOpeningQuestion(event.currentTarget.value)}
                    />
                    <div className="q-pair-actions">
                        <button
                            type="button"
                            onClick={() => void composePairCandidate()}
                            disabled={pairRationale.trim().length === 0 || pairSubmitting}
                            data-testid="q-pair-compose"
                        >
                            Compose
                        </button>
                        <button
                            type="button"
                            onClick={() => void acceptPairCandidate()}
                            disabled={pairCandidate.trim().length === 0 || pairOpeningQuestion.trim().length === 0 || pairSubmitting}
                            data-testid="q-pair-accept"
                        >
                            {pairSubmitting ? 'Accepting...' : 'Accept and promote'}
                        </button>
                    </div>
                    <label htmlFor="q-pair-candidate">Candidate articulation</label>
                    <textarea
                        id="q-pair-candidate"
                        value={pairCandidate}
                        onChange={event => setPairCandidate(event.currentTarget.value)}
                    />
                    {pairReceipt ? <p className="q-pair-receipt" data-testid="q-pair-receipt">{pairReceipt}</p> : null}
                </section>
            ) : null}
        </div>
    );
}
