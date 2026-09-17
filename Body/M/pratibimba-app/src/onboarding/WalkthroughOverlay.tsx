/**
 * Coordinate: M' shell-0 (post-identity walkthrough overlay — 32.T32.3)
 * Residency: Body/M/pratibimba-app/src/onboarding/WalkthroughOverlay.tsx
 * Position (#n): #4 — Context/Type; a guide over the shell, never in front of it
 * Actualises: the six-step walk as anchored tooltips with a back/next/skip
 *   stepper. NON-MODAL by construction, which is the brief's own requirement
 *   and CCT-8's law: the backdrop is `pointer-events: none`, so the shell stays
 *   fully usable while the walkthrough is open — you can flip the face, click
 *   the status bar, open a fold, and the tooltip keeps pace. Only the tooltip
 *   card itself takes pointer events.
 *
 *   Escape dismisses the whole walkthrough and writes NOTHING: dismissing is
 *   not a decision about any step. Skip writes that step's id to the skipped
 *   array; Next writes it to the completed array. Both go through
 *   `walkthrough.ts`, which owns the ledger keys.
 * Public surface: WalkthroughOverlay, useWalkthroughStore, WALKTHROUGH_COMMAND.
 * Does NOT own: the step content or the ledger keys (walkthrough.ts), the
 *   preference storage (panes/kairosEnablement.ts browserKairosPreferences).
 * Contract: rerun tranche [[32.T32.3]] (WC-OB-19); [[CHROME-CONTRACT]] CCT-8.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { browserKairosPreferences, type KairosPreferenceAccess } from '../panes/kairosEnablement';
import {
    recordStepComplete,
    recordStepSkip,
    walkthroughSteps,
    type WalkthroughStep
} from './walkthrough';

/** The palette command id that opens the walkthrough (also the Settings
 *  "Replay onboarding walkthrough" action, 32.4). */
export const WALKTHROUGH_COMMAND = 'epi-logos.help.openWalkthrough';

interface WalkthroughState {
    open: boolean;
    index: number;
    setOpen(open: boolean): void;
    setIndex(index: number): void;
}

export const useWalkthroughStore = create<WalkthroughState>(set => ({
    open: false,
    index: 0,
    setOpen: open => set(open ? { open, index: 0 } : { open }),
    setIndex: index => set({ index })
}));

interface AnchorBox {
    /** WHICH step this box was measured for. Position and identity travel
     *  together: the spotlight renders only once the anchor has been measured
     *  for the step now showing, so it can never paint the previous step's
     *  target while claiming to point at this one. */
    readonly stepId: string | null;
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
    readonly resolved: boolean;
}

/** Resolve a step's anchor against the real DOM, trying its candidates in
 *  order. `resolved: false` means none is present — the tooltip centres, and
 *  says nothing false about pointing at something. */
function resolveAnchor(step: WalkthroughStep): AnchorBox {
    if (typeof document !== 'undefined') {
        for (const selector of step.anchors) {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 || rect.height > 0) {
                    return {
                        stepId: step.id,
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        resolved: true
                    };
                }
            }
        }
    }
    return { stepId: step.id, top: 0, left: 0, width: 0, height: 0, resolved: false };
}

export function WalkthroughOverlay({
    preferences
}: {
    /** Injectable for tests; defaults to real localStorage. */
    readonly preferences?: KairosPreferenceAccess;
} = {}) {
    const open = useWalkthroughStore(s => s.open);
    const index = useWalkthroughStore(s => s.index);
    const setOpen = useWalkthroughStore(s => s.setOpen);
    const setIndex = useWalkthroughStore(s => s.setIndex);

    const steps = useMemo(() => walkthroughSteps(), []);
    const store = useMemo(
        () => preferences ?? browserKairosPreferences(localStorage),
        [preferences]
    );
    const step = steps[index];
    const [anchor, setAnchor] = useState<AnchorBox>({ stepId: null, top: 0, left: 0, width: 0, height: 0, resolved: false });
    const cardRef = useRef<HTMLElement | null>(null);
    const [placement, setPlacement] = useState<{ top: number; left: number } | null>(null);

    // Re-measure whenever the step changes or the shell moves under us. The
    // shell stays interactive during the walkthrough, so the anchor really can
    // move while a tooltip is open.
    useEffect(() => {
        if (!open || !step) {
            return;
        }
        const measure = () => setAnchor(resolveAnchor(step));
        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [open, step]);

    // Place the card against the resolved anchor, CLAMPED into the viewport.
    // Anchoring naively at `anchor.bottom + 8` pushes the card off-screen for a
    // tall target (the OmniPanel border is full height) — and an off-screen
    // card is an unreachable Next button, i.e. a walkthrough that traps the
    // user on step 2. Prefer below, fall back to above, then clamp.
    const anchorCurrent = anchor.stepId === step?.id;

    useLayoutEffect(() => {
        if (!open || !anchor.resolved || !anchorCurrent || !cardRef.current) {
            setPlacement(null);
            return;
        }
        const card = cardRef.current.getBoundingClientRect();
        const margin = 8;
        const maxTop = window.innerHeight - card.height - margin;
        const maxLeft = window.innerWidth - card.width - margin;
        const below = anchor.top + anchor.height + margin;
        const above = anchor.top - card.height - margin;
        const top = below <= maxTop ? below : above >= margin ? above : Math.max(margin, maxTop);
        const left = Math.min(Math.max(margin, anchor.left), Math.max(margin, maxLeft));
        setPlacement({ top, left });
    }, [open, anchor, anchorCurrent, index]);

    const dismiss = useCallback(() => setOpen(false), [setOpen]);

    // Escape dismisses and writes NOTHING (the brief is explicit).
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dismiss();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, dismiss]);

    if (!open || !step) {
        return null;
    }

    const last = index === steps.length - 1;

    const advance = () => {
        recordStepComplete(store, step.id);
        if (last) {
            dismiss();
        } else {
            setIndex(index + 1);
        }
    };

    const skip = () => {
        recordStepSkip(store, step.id);
        if (last) {
            dismiss();
        } else {
            setIndex(index + 1);
        }
    };

    const cardStyle = placement ? { top: `${placement.top}px`, left: `${placement.left}px` } : undefined;

    return (
        <div
            className="walkthrough-backdrop"
            data-testid="walkthrough-backdrop"
            data-anchor-resolved={anchor.resolved && anchorCurrent}
        >
            {anchor.resolved && anchorCurrent ? (
                <div
                    className="walkthrough-spotlight"
                    data-testid="walkthrough-spotlight"
                    // the spotlight names the step its BOX was measured for —
                    // not the step now showing — so a stale frame is visible
                    // rather than silently mispointing
                    data-step-id={anchor.stepId ?? ''}
                    style={{
                        top: `${anchor.top}px`,
                        left: `${anchor.left}px`,
                        width: `${anchor.width}px`,
                        height: `${anchor.height}px`
                    }}
                />
            ) : null}
            <section
                ref={cardRef}
                className={`walkthrough-card${placement ? '' : ' walkthrough-card-centred'}`}
                data-testid="walkthrough-card"
                data-step-id={step.id}
                data-step-index={index}
                // role=group, NOT dialog: a dialog role announces a modal
                // contract this deliberately does not have (CCT-8) — the shell
                // stays interactive behind it.
                role="group"
                aria-label={`Walkthrough step ${index + 1} of ${steps.length}: ${step.title}`}
                style={cardStyle}
            >
                <header className="walkthrough-card-head">
                    <strong data-testid="walkthrough-title">{step.title}</strong>
                    <span className="walkthrough-progress" data-testid="walkthrough-progress">
                        {index + 1} / {steps.length}
                    </span>
                </header>
                <p data-testid="walkthrough-body">{step.body}</p>
                <footer className="walkthrough-controls">
                    <button
                        type="button"
                        data-testid="walkthrough-back"
                        onClick={() => setIndex(Math.max(0, index - 1))}
                        disabled={index === 0}
                    >
                        Back
                    </button>
                    <button type="button" data-testid="walkthrough-skip" onClick={skip}>
                        Skip
                    </button>
                    <button type="button" data-testid="walkthrough-next" onClick={advance}>
                        {last ? 'Done' : 'Next'}
                    </button>
                </footer>
            </section>
        </div>
    );
}
