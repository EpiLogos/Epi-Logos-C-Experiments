/**
 * Coordinate: M' shell-0 (walkthrough gate — 32.T32.3)
 * Residency: Body/M/pratibimba-app/src/onboarding/walkthrough.test.tsx
 * Actualises: the six checks the 32.3 brief names as its verification — the
 *   six-step structure, preference-array growth on each completion, skip-flag
 *   persistence, Escape writing NOTHING, the non-modal property, and the
 *   re-trigger command. Plus the anti-drift claim this carrier adds: the step
 *   copy is GENERATED from the live inventories, so a new OmniPanel tab or
 *   sidebar mode cannot leave the walkthrough describing an app that no longer
 *   exists.
 * Does NOT own: the ledger contract (contracts/onboarding-completion-ledger.json,
 *   validated by ui/onboardingCompletionLedger.test.ts), the inventories.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WalkthroughOverlay, useWalkthroughStore } from './WalkthroughOverlay';
import {
    COMPLETED_STEPS_PREFERENCE,
    SKIPPED_STEPS_PREFERENCE,
    WALKTHROUGH_STEP_IDS,
    readStepArray,
    walkthroughSteps
} from './walkthrough';
import { browserKairosPreferences } from '../panes/kairosEnablement';
import { OMNIPANEL_TABS } from '../panes/omni/omnipanelRuntime';
import { LEFT_SIDEBAR_MODES } from '../ui/leftSidebarModes';

function preferences() {
    return browserKairosPreferences(localStorage);
}

beforeEach(() => {
    localStorage.clear();
    useWalkthroughStore.setState({ open: true, index: 0 });
});

afterEach(() => {
    cleanup();
    useWalkthroughStore.setState({ open: false, index: 0 });
});

describe('32.T32.3 — the six-step structure', () => {
    it('is exactly the six ledger step ids, in walk order', () => {
        const steps = walkthroughSteps();
        expect(steps).toHaveLength(6);
        expect(steps.map(s => s.id)).toEqual([...WALKTHROUGH_STEP_IDS]);
    });

    it('gives every step real copy and at least one anchor candidate', () => {
        for (const step of walkthroughSteps()) {
            expect(step.title.length, `${step.id} needs a title`).toBeGreaterThan(3);
            expect(step.body.length, `${step.id} needs body copy`).toBeGreaterThan(40);
            expect(step.anchors.length, `${step.id} needs an anchor candidate`).toBeGreaterThan(0);
        }
    });

    it('generates its copy from the LIVE inventories, so it cannot drift', () => {
        const steps = walkthroughSteps();
        const omnipanel = steps.find(s => s.id === 'walkthrough.omnipanel')!;
        for (const tab of OMNIPANEL_TABS) {
            expect(omnipanel.body, `the OmniPanel step must name the live tab ${tab.label}`).toContain(
                tab.label
            );
        }
        expect(omnipanel.body).toContain(String(OMNIPANEL_TABS.length));

        const activityBar = steps.find(s => s.id === 'walkthrough.activity-bar')!;
        for (const mode of LEFT_SIDEBAR_MODES) {
            expect(activityBar.body, `the modes step must name the live mode ${mode.label}`).toContain(
                mode.label
            );
        }
    });
});

describe('32.T32.3 — completion and skip write the ledger preferences', () => {
    it('grows the completed array by one on each Next', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([]);

        fireEvent.click(screen.getByTestId('walkthrough-next'));
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([
            'walkthrough.0-1-toggle'
        ]);

        fireEvent.click(screen.getByTestId('walkthrough-next'));
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([
            'walkthrough.0-1-toggle',
            'walkthrough.omnipanel'
        ]);
    });

    it('persists a skip flag on Skip, and does not mark it completed', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        fireEvent.click(screen.getByTestId('walkthrough-skip'));
        expect(readStepArray(preferences(), SKIPPED_STEPS_PREFERENCE)).toEqual([
            'walkthrough.0-1-toggle'
        ]);
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([]);
    });

    it('does not double-write when the user walks back and forward', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        fireEvent.click(screen.getByTestId('walkthrough-next'));
        fireEvent.click(screen.getByTestId('walkthrough-back'));
        fireEvent.click(screen.getByTestId('walkthrough-next'));
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([
            'walkthrough.0-1-toggle'
        ]);
    });

    it('walks all six and closes on the last step', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        for (let step = 0; step < 6; step += 1) {
            expect(screen.getByTestId('walkthrough-card').dataset.stepId).toBe(WALKTHROUGH_STEP_IDS[step]);
            fireEvent.click(screen.getByTestId('walkthrough-next'));
        }
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([
            ...WALKTHROUGH_STEP_IDS
        ]);
        expect(useWalkthroughStore.getState().open).toBe(false);
        expect(screen.queryByTestId('walkthrough-card')).toBeNull();
    });
});

describe('32.T32.3 — Escape dismisses and decides nothing', () => {
    it('closes the walkthrough and writes NEITHER array', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(useWalkthroughStore.getState().open).toBe(false);
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([]);
        expect(readStepArray(preferences(), SKIPPED_STEPS_PREFERENCE)).toEqual([]);
    });

    it('reopens at step one — dismissing loses no ground already covered', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        fireEvent.click(screen.getByTestId('walkthrough-next'));
        fireEvent.keyDown(window, { key: 'Escape' });

        useWalkthroughStore.getState().setOpen(true);
        expect(useWalkthroughStore.getState().index).toBe(0);
        // the completion from before the dismissal survives
        expect(readStepArray(preferences(), COMPLETED_STEPS_PREFERENCE)).toEqual([
            'walkthrough.0-1-toggle'
        ]);
    });
});

describe('32.T32.3 — non-modal', () => {
    it('renders no modal contract: no aria-modal, no dialog role, no <dialog>', () => {
        const { container } = render(<WalkthroughOverlay preferences={preferences()} />);
        expect(container.querySelectorAll('[aria-modal="true"]').length).toBe(0);
        expect(container.querySelectorAll('[role="dialog"]').length).toBe(0);
        expect(container.querySelectorAll('dialog').length).toBe(0);
    });

    it('the backdrop covers the viewport but is declared pointer-transparent', () => {
        render(<WalkthroughOverlay preferences={preferences()} />);
        const backdrop = screen.getByTestId('walkthrough-backdrop');
        // jsdom does not load styles.css; the class IS the contract, and
        // tests/e2e/walkthrough.spec.ts proves the computed value in a browser.
        expect(backdrop.className).toBe('walkthrough-backdrop');
        expect(screen.getByTestId('walkthrough-card')).toBeTruthy();
    });
});
