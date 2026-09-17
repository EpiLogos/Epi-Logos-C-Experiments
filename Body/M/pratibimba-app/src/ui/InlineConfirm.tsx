/**
 * Coordinate: M' shell chrome (inline confirmation — 31.T31.8, CCT-8)
 * Residency: Body/M/pratibimba-app/src/ui/InlineConfirm.tsx
 * Position (#n): #4 — Context/Type; the sanctioned alternative to a modal
 * Actualises: 15.2's "the tab IS the landing surface" for the one case that
 *   keeps reaching for a modal — asking the user to confirm a step that undoes
 *   work. The question is asked IN the surface that owns the action, as a row
 *   the pane renders next to the control that armed it. The rest of the shell
 *   stays live: nothing is trapped, focus is not stolen from the document, and
 *   dismissing is a button rather than an escape from a captured state.
 *
 *   This exists because `window.confirm` is banned carrier-wide by
 *   `scripts/lint-no-modal-discipline.mjs`. A ban with no sanctioned
 *   replacement just pushes the next author into a worse workaround, so the
 *   replacement ships with the rule.
 * Public surface: InlineConfirm.
 * Does NOT own: what is being confirmed (the calling pane holds the pending
 *   state and performs the action), nor any overlay/portal — by design there
 *   is none.
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[31.T31.8]] (CC-08 / CCT-8).
 */

export function InlineConfirm({
    prompt,
    confirmLabel,
    cancelLabel = 'Cancel',
    testId,
    onConfirm,
    onCancel
}: {
    readonly prompt: string;
    readonly confirmLabel: string;
    readonly cancelLabel?: string;
    readonly testId: string;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}) {
    return (
        <div className="inline-confirm" data-testid={testId} role="group" aria-label={prompt}>
            <span className="inline-confirm-prompt">{prompt}</span>
            <button
                type="button"
                className="inline-confirm-accept"
                data-testid={`${testId}-confirm`}
                onClick={onConfirm}
            >
                {confirmLabel}
            </button>
            <button
                type="button"
                className="inline-confirm-cancel"
                data-testid={`${testId}-cancel`}
                onClick={onCancel}
            >
                {cancelLabel}
            </button>
        </div>
    );
}
