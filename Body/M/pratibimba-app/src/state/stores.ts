/**
 * Coordinate: M' (shell state)
 * Residency: Body/M/pratibimba-app/src/state
 * Actualises: the four state threads that survive every transition —
 *   tick, coordinate, session, provenance (THEIA-SHELL-INVOCATION §3.4 contract,
 *   here as the whole state architecture).
 * Public surface: useTickStore, useCoordinateStore, useSessionStore, useProvenanceStore.
 * Does NOT own: any timer (the kernel tick is the only clock), any gateway I/O,
 *   any private journal/identity body.
 */

import { create } from 'zustand';
import {
    DEFAULT_CONNECTION_STATUS,
    KernelBridgeCachedProfile,
    KernelBridgeConnectionStatus
} from '../bridge/types';

export interface TickState {
    profile: KernelBridgeCachedProfile | null;
    generation: number | null;
    setProfile(profile: KernelBridgeCachedProfile): void;
}

export const useTickStore = create<TickState>(set => ({
    profile: null,
    generation: null,
    setProfile: profile =>
        set(state => {
            if (state.generation !== null && profile.generation <= state.generation) {
                return state;
            }
            return { profile, generation: profile.generation };
        })
}));

export interface CoordinateState {
    selected: string | null;
    setSelected(coordinate: string | null): void;
}

export const useCoordinateStore = create<CoordinateState>(set => ({
    selected: null,
    setSelected: selected => set({ selected })
}));

export interface SessionState {
    sessionKey: string | null;
    dayNow: string | null;
    privacyClass: string | null;
    setSession(patch: Partial<Pick<SessionState, 'sessionKey' | 'dayNow' | 'privacyClass'>>): void;
}

export const useSessionStore = create<SessionState>(set => ({
    sessionKey: null,
    dayNow: null,
    privacyClass: null,
    setSession: patch => set(patch)
}));

export interface SupervisorStatus {
    state: 'probing' | 'external' | 'starting' | 'supervised' | 'down';
    port: number;
    pid: number | null;
    detail: string;
}

export interface ProvenanceState {
    connection: KernelBridgeConnectionStatus;
    supervisor: SupervisorStatus;
    /** connected but no profile.update within the liveness window — the
     *  gateway predates the heartbeat or the stream broke. */
    stale: boolean;
    setConnection(status: KernelBridgeConnectionStatus): void;
    setSupervisor(status: SupervisorStatus): void;
    setStale(stale: boolean): void;
}

export const useProvenanceStore = create<ProvenanceState>(set => ({
    connection: DEFAULT_CONNECTION_STATUS,
    supervisor: { state: 'probing', port: 18794, pid: null, detail: 'not yet probed' },
    stale: false,
    setConnection: connection => set({ connection }),
    setSupervisor: supervisor => set({ supervisor }),
    setStale: stale => set({ stale })
}));
