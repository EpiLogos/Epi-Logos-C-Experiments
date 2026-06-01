import * as React from 'react';
import {
    ALL_EPII_ACTIONS,
    EpiiActionId,
    EpiiReviewSurfaceState
} from '@pratibimba/integrated-composition';

/**
 * Summonable Epii review panel for the 4/5/0 plugin.
 *
 * 08.T6 deliverable 4: "Keep Epii review panes summonable, not always-on,
 * unless the user explicitly enters review mode or a notification requires
 * attention."
 *
 * The panel renders only when state.mode !== 'closed'. The header shows
 * inbox count + human-required gate state + dry-run readiness so the user
 * sees what's pending before any deep open.
 */
const ACTION_LABELS: Record<EpiiActionId, string> = {
    reviewRecognitionClaim: 'Review recognition claim',
    depositProtectedEvidence: 'Deposit protected evidence handle',
    requestAnimaConsentReview: 'Request Anima consent review',
    openEpiiContinuity: 'Open Epii continuity',
    dryRunCanonPromotion: 'Dry-run canon promotion'
};

export interface EpiiReviewPanelProps {
    readonly state: EpiiReviewSurfaceState;
    readonly onAction: (action: EpiiActionId) => void;
    readonly onDismiss: () => void;
}

export const EpiiReviewPanel: React.FC<EpiiReviewPanelProps> = ({
    state,
    onAction,
    onDismiss
}) => {
    if (state.mode === 'closed') {
        return null;
    }
    return (
        <aside
            className={`jiva-epii-review-panel jiva-epii-mode-${state.mode}`}
            role="complementary"
            aria-label="Epii review"
        >
            <header className="jiva-epii-review-header">
                <h3>Epii Review</h3>
                <button
                    type="button"
                    className="theia-button jiva-epii-dismiss"
                    onClick={onDismiss}
                >
                    Dismiss
                </button>
            </header>
            <dl className="jiva-epii-review-summary">
                <dt>Inbox</dt>
                <dd data-test="epii-inbox">{state.reviewInboxCount}</dd>
                <dt>Active candidate</dt>
                <dd data-test="epii-active-candidate">
                    {state.activeCandidateRoute ?? '—'}
                </dd>
                <dt>Human-required gate</dt>
                <dd data-test="epii-human-gate">{state.humanRequiredGateState}</dd>
                <dt>Dry-run promotion</dt>
                <dd data-test="epii-dryrun">{state.dryRunPromotionReadiness}</dd>
                <dt>Continuity hint</dt>
                <dd data-test="epii-continuity">{state.continuityHint ?? '—'}</dd>
            </dl>
            <ul className="jiva-epii-review-actions">
                {ALL_EPII_ACTIONS.map(action => (
                    <li key={action}>
                        <button
                            type="button"
                            className="theia-button"
                            onClick={() => onAction(action)}
                        >
                            {ACTION_LABELS[action]}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};
