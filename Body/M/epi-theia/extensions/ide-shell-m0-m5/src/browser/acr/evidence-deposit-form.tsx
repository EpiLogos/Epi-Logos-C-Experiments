import * as React from 'react';
import type { MediatedRunEvidencePacket } from './types';

export interface EvidenceDepositFormProps {
    readonly initialPacket?: MediatedRunEvidencePacket | null;
    readonly onDeposit?: (packet: MediatedRunEvidencePacket) => void;
}

export function EvidenceDepositForm({
    initialPacket = null,
    onDeposit
}: EvidenceDepositFormProps): React.ReactElement {
    const [packet, setPacket] = React.useState<MediatedRunEvidencePacket>(() =>
        initialPacket ?? {
            id: '',
            candidateId: '',
            coordinate: null,
            sourceAnchor: null,
            reviewId: null,
            sessionKey: null,
            dayNowContext: null,
            profileGeneration: null,
            privacyClass: 'safe-public-current-kernel-tick'
        }
    );
    const canDeposit = packet.id.trim().length > 0 && packet.candidateId.trim().length > 0;
    return (
        <form
            data-test="acr-evidence-deposit-form"
            data-gateway-method="s5'.epii.deposit"
            onSubmit={event => {
                event.preventDefault();
                if (canDeposit) {
                    onDeposit?.(packet);
                }
            }}
        >
            <label>
                Evidence packet id
                <input
                    value={packet.id}
                    onChange={event => setPacket({ ...packet, id: event.currentTarget.value })}
                    data-test="acr-evidence-packet-id"
                />
            </label>
            <label>
                Candidate id
                <input
                    value={packet.candidateId}
                    onChange={event => setPacket({ ...packet, candidateId: event.currentTarget.value })}
                    data-test="acr-evidence-candidate-id"
                />
            </label>
            <label>
                Coordinate
                <input
                    value={packet.coordinate ?? ''}
                    onChange={event => setPacket({ ...packet, coordinate: event.currentTarget.value || null })}
                    data-test="acr-evidence-coordinate"
                />
            </label>
            <label>
                Source anchor
                <input
                    value={packet.sourceAnchor ?? ''}
                    onChange={event => setPacket({ ...packet, sourceAnchor: event.currentTarget.value || null })}
                    data-test="acr-evidence-source-anchor"
                />
            </label>
            <label>
                Review id
                <input
                    value={packet.reviewId ?? ''}
                    onChange={event => setPacket({ ...packet, reviewId: event.currentTarget.value || null })}
                    data-test="acr-evidence-review-id"
                />
            </label>
            <button type="submit" disabled={!canDeposit} data-test="acr-evidence-deposit-submit">
                Deposit evidence
            </button>
        </form>
    );
}
