import { useState } from 'react';
import {
  checkReviewGate,
  isCommittalReviewDecision,
  type GateCheckResult,
  type ReviewDecision,
  type ReviewItemDeep
} from '../../../../common/omnipanel-runtime';

// Track 27 T27.6 — review action controls.
//
// Five affordances: Approve / Reject / Revise are committal verdicts gated by
// the human-required routing gate (and IOD-17 parity); Defer and Annotate are
// always allowed because they record state without committing a verdict.
//
// When a committal verdict is blocked the button is disabled and an inline
// refusal banner explains why. Confirmation is rendered inline (no overlay
// surfaces) — the operator confirms the pending verdict in place.

export type ReviewActionControlsProps = {
  item: ReviewItemDeep;
  /** Whether the acting principal is a human (M5 review surface) or an agent. */
  actorIsHuman: boolean;
  reviseFormOpen: boolean;
  annotateDraft: string;
  onDecision: (decision: ReviewDecision, reason: string) => void;
  onToggleReviseForm: (open: boolean) => void;
  onAnnotateDraftChange: (text: string) => void;
};

const COMMITTAL_BUTTONS: ReadonlyArray<{ decision: ReviewDecision; label: string }> = [
  { decision: 'approve', label: 'Approve' },
  { decision: 'reject', label: 'Reject' },
  { decision: 'revise', label: 'Revise' }
];

export function ReviewActionControls({
  item,
  actorIsHuman,
  reviseFormOpen,
  annotateDraft,
  onDecision,
  onToggleReviseForm,
  onAnnotateDraftChange
}: ReviewActionControlsProps) {
  const [pending, setPending] = useState<{ decision: ReviewDecision; reason: string } | null>(null);

  const gateFor = (decision: ReviewDecision): GateCheckResult =>
    checkReviewGate(item, decision, actorIsHuman);

  const requestDecision = (decision: ReviewDecision, reason: string) => {
    const gate = gateFor(decision);
    if (!gate.ok) {
      return;
    }
    setPending({ decision, reason });
  };

  const confirm = () => {
    if (!pending) {
      return;
    }
    onDecision(pending.decision, pending.reason);
    setPending(null);
  };

  return (
    <section
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 space-y-3"
      data-test="review-action-controls"
      data-actor-is-human={actorIsHuman ? 'true' : 'false'}
    >
      <div className="flex flex-wrap gap-2">
        {COMMITTAL_BUTTONS.map(({ decision, label }) => {
          const gate = gateFor(decision);
          return (
            <button
              key={decision}
              type="button"
              disabled={!gate.ok}
              aria-disabled={!gate.ok}
              data-test={`review-action-${decision}`}
              data-gated={gate.ok ? 'false' : 'true'}
              data-blocked-reason={gate.reason ?? ''}
              title={gate.reason ?? `${label} this review item`}
              className={`text-xs px-3 py-1.5 rounded border ${
                gate.ok
                  ? 'border-[var(--color-m5)]/60 bg-[var(--color-m5)]/15 hover:bg-[var(--color-m5)]/25'
                  : 'border-red-400/40 text-[var(--text-tertiary)] opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (decision === 'revise') {
                  onToggleReviseForm(!reviseFormOpen);
                  requestDecision('revise', annotateDraft.trim() || 'revision requested');
                  return;
                }
                requestDecision(decision, `${label.toLowerCase()} via OmniPanel review surface`);
              }}
            >
              {label}
            </button>
          );
        })}

        <button
          type="button"
          data-test="review-action-defer"
          data-gated="false"
          title="Defer is always allowed — records the human-required state without committing a verdict."
          className="text-xs px-3 py-1.5 rounded border border-amber-400/40 text-amber-100 hover:bg-amber-500/15"
          onClick={() => requestDecision('defer', 'deferred pending human final-validation')}
        >
          Defer
        </button>

        <button
          type="button"
          data-test="review-action-annotate"
          data-gated="false"
          title="Annotate is always allowed — attaches a note without committing a verdict."
          className="text-xs px-3 py-1.5 rounded border border-[var(--border-subtle)] hover:bg-white/10"
          onClick={() => requestDecision('annotate', annotateDraft.trim() || 'annotation')}
        >
          Annotate
        </button>
      </div>

      {blockedReasonFor(item, actorIsHuman) && (
        <div
          className="px-3 py-2 text-[11px] rounded border border-red-400/40 bg-red-500/10 text-red-200"
          data-test="review-action-human-required-banner"
        >
          {blockedReasonFor(item, actorIsHuman)}
        </div>
      )}

      {(reviseFormOpen || true) && (
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
            note / revision reason
          </span>
          <textarea
            data-test="review-annotate-input"
            className="mt-1 w-full text-xs p-2 rounded border border-[var(--border-subtle)] bg-black/20"
            rows={reviseFormOpen ? 4 : 2}
            value={annotateDraft}
            onChange={(event) => onAnnotateDraftChange(event.currentTarget.value)}
            placeholder="Record a note, an annotation, or the requested revision…"
          />
        </label>
      )}

      {pending && (
        <ReviewActionConfirmation
          decision={pending.decision}
          reason={pending.reason}
          onConfirm={confirm}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  );
}

/** Inline confirmation strip — no overlay; the operator confirms in place. */
export function ReviewActionConfirmation({
  decision,
  reason,
  onConfirm,
  onCancel
}: {
  decision: ReviewDecision;
  reason: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-[var(--color-m5)]/50 bg-[var(--color-m5)]/10"
      data-test="review-action-confirmation"
      data-decision={decision}
      data-committal={isCommittalReviewDecision(decision) ? 'true' : 'false'}
    >
      <span className="text-[11px] min-w-0 truncate">
        Confirm <strong>{decision}</strong>
        {reason ? <span className="text-[var(--text-tertiary)]"> — {reason}</span> : null}
      </span>
      <span className="flex gap-2 shrink-0">
        <button
          type="button"
          data-test="review-action-confirm"
          className="text-[11px] px-2 py-1 rounded border border-[var(--color-m5)]/60 bg-[var(--color-m5)]/20"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          data-test="review-action-cancel"
          className="text-[11px] px-2 py-1 rounded border border-[var(--border-subtle)]"
          onClick={onCancel}
        >
          Cancel
        </button>
      </span>
    </div>
  );
}

function blockedReasonFor(item: ReviewItemDeep, actorIsHuman: boolean): string | null {
  // Surface the strongest committal refusal so the operator understands why
  // Approve / Reject / Revise are disabled for this item.
  for (const { decision } of COMMITTAL_BUTTONS) {
    const gate = checkReviewGate(item, decision, actorIsHuman);
    if (!gate.ok && gate.reason) {
      return gate.reason;
    }
  }
  return null;
}
