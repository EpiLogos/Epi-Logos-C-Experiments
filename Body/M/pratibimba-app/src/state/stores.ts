/**
 * Coordinate: M' (shell state)
 * Residency: Body/M/pratibimba-app/src/state
 * Actualises: the four state threads that survive every transition —
 *   tick, coordinate, session, provenance (THEIA-SHELL-INVOCATION §3.4 contract,
 *   here as the whole state architecture).
 * Public surface: TickState, CoordinateState, SessionState, SupervisorStatus,
 *   ProvenanceState, useTickStore, useCoordinateStore, useSessionStore,
 *   useProvenanceStore.
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
    /**
     * 32.T32.9 — how many real tick ADVANCES this shell has observed, counted
     * inside the accepted branch of the generation gate below.
     *
     * It is deliberately NOT a render counter and NOT the kernel's generation.
     * The kernel's generation belongs to the gateway PROCESS (it starts at 0
     * when `epi gate start` boots and is already in the hundreds by the time a
     * later client connects), so it cannot answer "has the clock ticked for
     * ME yet, and how many times". This can: it is 0 before the first frame,
     * 1 on the first accepted frame — the visible birth of the clock — and it
     * advances only when a frame really passed the gate. A component
     * re-rendering, a stale frame being refused, or a repeated generation all
     * leave it exactly where it was.
     */
    observedTicks: number;
    setProfile(profile: KernelBridgeCachedProfile): void;
}

export const useTickStore = create<TickState>(set => ({
    profile: null,
    generation: null,
    observedTicks: 0,
    setProfile: profile =>
        set(state => {
            if (state.generation !== null && profile.generation <= state.generation) {
                return state;
            }
            return {
                profile,
                generation: profile.generation,
                observedTicks: state.observedTicks + 1
            };
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
    binaryPath: string | null;
    binarySource: string | null;
    binaryIdentity: string | null;
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
    supervisor: {
        state: 'probing',
        port: 18794,
        pid: null,
        detail: 'not yet probed',
        binaryPath: null,
        binarySource: null,
        binaryIdentity: null
    },
    stale: false,
    setConnection: connection => set({ connection }),
    setSupervisor: supervisor => set({ supervisor }),
    setStale: stale => set({ stale })
}));
