/**
 * Coordinate: M' `/` membrane (Evidence tail — inline deposit form, 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): the `<EvidenceDepositForm />` opened inline from the Evidence
 *   header "deposit new" affordance (NOT a modal — 15.2, the tab IS the surface).
 * Actualises: the deposition WRITE path. Collects the author-supplied subset of
 *   MEDIATED_RUN_EVIDENCE_PACKET_REQUIRED_FIELDS (evidenceShapes, imported not
 *   redefined); the remaining required fields are gateway/session-filled and are
 *   named as read-only server context. Submit is disabled until every authored
 *   field is populated (`missingDepositFields`), then dispatches the real
 *   `s5'.epii.deposit` method and surfaces the gateway's receipt OR its refusal
 *   inline — success is never fabricated. Disconnected → honest disabled state.
 * Public surface: EvidenceDepositForm, DEPOSIT_AUTHORED_FIELDS, missingDepositFields.
 * Does NOT own: the deposit contract (S5' epii-agent-core), the packet schema.
 */

import { useState } from 'react';
import { gateway } from '../../../bridge/gatewayHolder';
import { useProvenanceStore, useSessionStore } from '../../../state/stores';
import { MEDIATED_RUN_EVIDENCE_PACKET_REQUIRED_FIELDS } from '../evidenceShapes';
import {
    DEPOSIT_METHOD,
    depositReceiptItemId,
    depositRequestFromDraft
} from './evidenceDeposits';

/** The author-supplied subset of the required-field contract. The rest
 *  (currentProfile / graphContext / sessionRuntime / semanticCandidates /
 *  s5Refs / profileGeneration / bridgeReadinessHandle / sessionKey /
 *  dayNowContext) are gateway/session context, filled server-side. */
export const DEPOSIT_AUTHORED_FIELDS = Object.freeze([
    'title',
    'candidateId',
    'coordinate',
    'sourceAnchor',
    'graphAnchor',
    'reviewId',
    'testAnchor',
    'privacyClass'
] as const);

/** The required fields the gateway/session fills — shown read-only for honesty. */
export const DEPOSIT_SERVER_FIELDS: readonly string[] = Object.freeze(
    MEDIATED_RUN_EVIDENCE_PACKET_REQUIRED_FIELDS.filter(
        field => !(DEPOSIT_AUTHORED_FIELDS as readonly string[]).includes(field)
    )
);

type DepositDraft = Record<(typeof DEPOSIT_AUTHORED_FIELDS)[number], string>;

const EMPTY_DRAFT: DepositDraft = {
    title: '',
    candidateId: '',
    coordinate: '',
    sourceAnchor: '',
    graphAnchor: '',
    reviewId: '',
    testAnchor: '',
    // spec default per buildEvidenceEnvelope.
    privacyClass: 'safe-public-current-kernel-tick'
};

export function missingDepositFields(draft: DepositDraft): readonly string[] {
    return DEPOSIT_AUTHORED_FIELDS.filter(field => draft[field].trim().length === 0);
}

type SubmitState =
    | { readonly kind: 'idle' }
    | { readonly kind: 'submitting' }
    | { readonly kind: 'deposited'; readonly ref: string }
    | { readonly kind: 'refused'; readonly reason: string };

export function EvidenceDepositForm({
    initialDraft,
    onDeposited
}: {
    readonly initialDraft?: Partial<DepositDraft>;
    readonly onDeposited?: (ref: string) => void;
}) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const sessionKey = useSessionStore(s => s.sessionKey);
    const [draft, setDraft] = useState<DepositDraft>({ ...EMPTY_DRAFT, ...initialDraft });
    const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });

    const missing = missingDepositFields(draft);
    const canSubmit = connected && missing.length === 0 && submit.kind !== 'submitting';

    const setField = (field: (typeof DEPOSIT_AUTHORED_FIELDS)[number], value: string) =>
        setDraft(prev => ({ ...prev, [field]: value }));

    const onSubmit = () => {
        if (!canSubmit) {
            return;
        }
        setSubmit({ kind: 'submitting' });
        // The draft is packet-shaped; the METHOD takes a DepositRequest. Posting
        // the draft verbatim (as this form used to) is refused by serde before
        // it reaches the review store — every field but `title` is unknown to
        // it, and every required field is absent.
        gateway()
            .invoke(DEPOSIT_METHOD, depositRequestFromDraft(draft, { sessionKey }))
            .then(receipt => {
                // The id is nested under `review_item` — see
                // `depositReceiptItemId`. Reading it at the top level (as this
                // did) always missed, so the fallback reported the author's own
                // candidateId back as if it were the store's id.
                const ref = depositReceiptItemId(receipt.artifact);
                if (!ref) {
                    // No review item means nothing to link to. Reporting the
                    // draft's own value here would fabricate a receipt.
                    setSubmit({
                        kind: 'refused',
                        reason: 'deposit returned no review item to reference'
                    });
                    return;
                }
                setSubmit({ kind: 'deposited', ref });
                onDeposited?.(ref);
            })
            .catch(err => setSubmit({ kind: 'refused', reason: err instanceof Error ? err.message : String(err) }));
    };

    return (
        <form
            className="evidence-deposit-form"
            data-testid="evidence-deposit-form"
            onSubmit={event => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="evidence-deposit-fields">
                {DEPOSIT_AUTHORED_FIELDS.map(field => (
                    <label key={field} className="evidence-deposit-field">
                        <span>{field}</span>
                        <input
                            type="text"
                            data-testid={`deposit-field-${field}`}
                            value={draft[field]}
                            onChange={event => setField(field, event.target.value)}
                        />
                    </label>
                ))}
            </div>

            <p className="evidence-deposit-server-note" data-testid="evidence-deposit-server-note">
                gateway/session context filled server-side: {DEPOSIT_SERVER_FIELDS.join(', ')}
            </p>

            {!connected ? (
                <p className="pane-message" data-testid="deposit-disconnected">
                    gateway not connected — deposit unavailable
                </p>
            ) : missing.length > 0 ? (
                <p className="evidence-deposit-missing" data-testid="deposit-missing">
                    complete: {missing.join(', ')}
                </p>
            ) : null}

            <button type="submit" data-testid="deposit-submit" disabled={!canSubmit}>
                {submit.kind === 'submitting' ? 'depositing…' : 'deposit'}
            </button>

            {submit.kind === 'deposited' ? (
                <p className="evidence-deposit-ok" data-testid="deposit-ok">
                    deposited: {submit.ref}
                </p>
            ) : submit.kind === 'refused' ? (
                <p className="evidence-deposit-refused" data-testid="deposit-refused">
                    gateway refused: {submit.reason}
                </p>
            ) : null}
        </form>
    );
}
