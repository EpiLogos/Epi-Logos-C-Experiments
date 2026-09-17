/**
 * Coordinate: M' shell-0 (walkthrough command — 32.T32.3)
 * Residency: Body/M/pratibimba-app/src/commands/walkthrough.ts
 * Position (#n): #4 — Context/Type
 * Actualises: the walkthrough's re-entry point. The brief requires the user be
 *   able to reopen it after dismissing — from the Help menu there, from the
 *   palette here (this carrier's equivalent surface), and it is the same
 *   command the Settings "Replay onboarding walkthrough" action (32.4) will
 *   fire when that surface lands.
 * Public surface: registerWalkthroughCommand.
 * Does NOT own: the walkthrough content (onboarding/walkthrough.ts) or its
 *   open state (onboarding/WalkthroughOverlay.tsx).
 * Contract: [[CHROME-CONTRACT]] section 10; rerun tranche [[32.T32.3]].
 */

import { useWalkthroughStore, WALKTHROUGH_COMMAND } from '../onboarding/WalkthroughOverlay';
import { commands } from './registry';

export function registerWalkthroughCommand(): () => void {
    return commands.register({
        id: WALKTHROUGH_COMMAND,
        title: 'Help: Replay onboarding walkthrough',
        run: () => useWalkthroughStore.getState().setOpen(true)
    });
}
