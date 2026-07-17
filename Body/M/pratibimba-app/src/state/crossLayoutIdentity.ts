/**
 * Coordinate: M' shell state identity
 * Residency: Body/M/pratibimba-app/src/state
 * Position (#n): #0/1 cross-layout carrier boundary
 * Actualises: an atomic seven-field Bimba/Pratibimba identity read and preservation guard.
 *   The OmniPanel fold is deliberately NOT an identity field. The OmniPanel is an
 *   invocable overlay panel that comes in over whatever tab is active (hence "omni-");
 *   routing to a fold (e.g. review, pi-chat) is *supposed* to change which fold shows.
 *   That is the panel doing its job, not a cross-layout identity drift — so the fold
 *   never enters this tuple. "activeTab" as an identity concept belongs to the app's
 *   real layout tabs (carried by fromLayout/toLayout), not to the OmniPanel.
 * Public surface: BimbaPratibimbaUiState, readCrossLayoutIdentity, createCrossLayoutIdentityReceipt
 * Does NOT own: profile production, session binding, coordinate selection, OmniPanel fold state, or another store
 * Contract: [[M'-SYSTEM-SPEC]] and rerun tranche [[11.T11.6]]
 */

import type { OmniPanelLayoutId } from '../panes/omni/omnipanelRuntime';
import { useLeftSidebarModeStore, type LeftSidebarModeId } from '../ui/leftSidebarModes';
import { useCoordinateStore, useSessionStore, useTickStore } from './stores';

export interface BimbaPratibimbaUiState {
    readonly coordinate: string | null;
    readonly lens: number | null;
    readonly mode: number | null;
    readonly profileGeneration: number | null;
    readonly sessionKey: string | null;
    readonly dayNow: string | null;
    readonly activityBarMode: LeftSidebarModeId;
}

export type CrossLayoutIdentityTuple = BimbaPratibimbaUiState;

export interface CrossLayoutIdentityReceipt {
    readonly fromLayout: OmniPanelLayoutId;
    readonly toLayout: OmniPanelLayoutId;
    readonly before: CrossLayoutIdentityTuple;
    readonly after: CrossLayoutIdentityTuple;
}

function readLensMode(): { lens: number | null; mode: number | null } {
    const profile = useTickStore.getState().profile?.profile as {
        harmonicProfile?: {
            modalResonator?: {
                lensMode?: { lens?: unknown; mode?: unknown };
            };
        };
    } | null;
    const lensMode = profile?.harmonicProfile?.modalResonator?.lensMode;
    return {
        lens: typeof lensMode?.lens === 'number' && Number.isFinite(lensMode.lens) ? lensMode.lens : null,
        mode: typeof lensMode?.mode === 'number' && Number.isFinite(lensMode.mode) ? lensMode.mode : null
    };
}

export function readCrossLayoutIdentity(): CrossLayoutIdentityTuple {
    const lensMode = readLensMode();
    const session = useSessionStore.getState();
    return {
        coordinate: useCoordinateStore.getState().selected,
        lens: lensMode.lens,
        mode: lensMode.mode,
        profileGeneration: useTickStore.getState().generation,
        sessionKey: session.sessionKey,
        dayNow: session.dayNow,
        activityBarMode: useLeftSidebarModeStore.getState().activeModeId
    };
}

export function createCrossLayoutIdentityReceipt(
    fromLayout: OmniPanelLayoutId,
    toLayout: OmniPanelLayoutId,
    before: CrossLayoutIdentityTuple,
    after: CrossLayoutIdentityTuple
): CrossLayoutIdentityReceipt {
    for (const field of [
        'coordinate',
        'lens',
        'mode',
        'profileGeneration',
        'sessionKey',
        'dayNow',
        'activityBarMode'
    ] as const) {
        if (before[field] !== after[field]) {
            throw new Error(`cross-layout identity changed during routing: ${field}`);
        }
    }
    return { fromLayout, toLayout, before, after };
}
