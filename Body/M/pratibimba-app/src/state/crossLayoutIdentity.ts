/**
 * Coordinate: M' shell state identity
 * Residency: Body/M/pratibimba-app/src/state
 * Position (#n): #0/1 cross-layout carrier boundary
 * Actualises: an atomic read and preservation guard over the existing shared stores
 * Public surface: readCrossLayoutIdentity, createCrossLayoutIdentityReceipt
 * Does NOT own: profile production, session binding, coordinate selection, or another store
 * Contract: [[M'-SYSTEM-SPEC]] and rerun tranche [[11.T11.6]]
 */

import type { OmniPanelLayoutId } from '../panes/omni/omnipanelRuntime';
import { useCoordinateStore, useSessionStore, useTickStore } from './stores';

export interface CrossLayoutIdentityTuple {
    readonly coordinate: string | null;
    readonly lens: number | null;
    readonly mode: number | null;
    readonly profileGeneration: number | null;
    readonly sessionKey: string | null;
    readonly dayNow: string | null;
}

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
        dayNow: session.dayNow
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
        'dayNow'
    ] as const) {
        if (before[field] !== after[field]) {
            throw new Error(`cross-layout identity changed during routing: ${field}`);
        }
    }
    return { fromLayout, toLayout, before, after };
}
