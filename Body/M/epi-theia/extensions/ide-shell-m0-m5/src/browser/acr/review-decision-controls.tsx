import * as React from 'react';
import type { IOD17Parity, ReviewDecisionAction } from './types';

export interface ReviewDecisionControlsProps {
    readonly reviewId: string;
    readonly iod17Parity: IOD17Parity;
    readonly humanRequired?: boolean;
    readonly onDecision?: (decision: ReviewDecisionAction, reviewId: string) => void;
}

const DECISIONS: readonly ReviewDecisionAction[] = ['approve', 'reject', 'revise', 'defer'];

export function ReviewDecisionControls({
    reviewId,
    iod17Parity,
    humanRequired = false,
    onDecision
}: ReviewDecisionControlsProps): React.ReactElement {
    const transitionBlocked = humanRequired || !iod17Parity.inParity;
    return (
        <div
            data-test="acr-review-decision-controls"
            data-gateway-method="s5'.review.transition"
            data-review-id={reviewId}
            data-human-required={humanRequired ? 'true' : 'false'}
            data-iod17-in-parity={iod17Parity.inParity ? 'true' : 'false'}
        >
            <IOD17ParityMatrix parity={iod17Parity} />
            {!iod17Parity.inParity && (
                <p className="ide-shell-error" data-test="acr-iod17-parity-violation">
                    IOD-17 parity violated — gateway will reject any transition.
                </p>
            )}
            {humanRequired && (
                <p className="ide-shell-human-required" data-test="acr-review-human-required">
                    Review decisions are disabled while human-required review is active.
                </p>
            )}
            {DECISIONS.map(decision => {
                return (
                    <button
                        key={decision}
                        type="button"
                        disabled={transitionBlocked}
                        data-test={`acr-review-decision-${decision}`}
                        data-review-decision={decision}
                        onClick={() => onDecision?.(decision, reviewId)}
                    >
                        {decision}
                    </button>
                );
            })}
        </div>
    );
}

function IOD17ParityMatrix({ parity }: { readonly parity: IOD17Parity }): React.ReactElement {
    const cells = [
        ['capability-matrix', parity.capabilityMatrixState],
        ['agent-contract', parity.agentContractState],
        ['widget', parity.widgetState]
    ] as const;
    return (
        <dl data-test="acr-iod17-parity-matrix">
            {cells.map(([label, state]) => (
                <React.Fragment key={label}>
                    <dt>{label}</dt>
                    <dd
                        data-test={`acr-iod17-parity-${label}`}
                        data-parity-state={state}
                        className={parity.inParity ? undefined : 'ide-shell-error'}
                    >
                        {parity.inParity ? 'OK' : 'DRIFT'} — {state}
                    </dd>
                </React.Fragment>
            ))}
        </dl>
    );
}
