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
import { useSessionStore } from '../state/stores';
import { useProfileTick } from '../state/useProfileTick';
import {
    AutoresearchSnapshot,
    IMPROVE_HISTORY_METHOD,
    IMPROVE_STATUS_METHOD,
    M5_OPERATIONAL_CAPACITIES,
    M5OperationalCapacity,
    MOBIUS_STAGES,
    parseImproveHistory,
    parseImproveStatus
} from './autoresearchModel';

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

async function loadSnapshot(): Promise<AutoresearchSnapshot> {
    const [statusReceipt, historyReceipt] = await Promise.all([
        gateway().invoke(IMPROVE_STATUS_METHOD, {}),
        gateway().invoke(IMPROVE_HISTORY_METHOD, { limit: 100 })
    ]);
    return Object.freeze({
        status: parseImproveStatus(statusReceipt.artifact),
        candidates: parseImproveHistory(historyReceipt.artifact)
    });
}

export function AutoresearchPane({ fixture, onOpenReview }: AutoresearchPaneProps) {
    const tick = useProfileTick();
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const sessionPrivacy = useSessionStore(state => state.privacyClass);
    const [snapshot, setSnapshot] = useState<AutoresearchSnapshot | null>(fixture ?? null);
    const [capacity, setCapacity] = useState<M5OperationalCapacity | 'all'>('all');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(!fixture);

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
        loadSnapshot()
            .then(next => {
                setSnapshot(next);
                setError(null);
            })
            .catch(err => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [fixture]);

    useEffect(refresh, [refresh, tick.generation]);

    const visible = useMemo(
        () => snapshot?.candidates.filter(candidate => capacity === 'all' || candidate.capacity === capacity) ?? [],
        [snapshot, capacity]
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
            </div>

            {error ? <p className="pane-message autoresearch-error" data-testid="autoresearch-error">{error}</p> : null}
            {loading ? <p className="pane-message" data-testid="autoresearch-loading">Loading autoresearch state...</p> : null}

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
        </div>
    );
}
