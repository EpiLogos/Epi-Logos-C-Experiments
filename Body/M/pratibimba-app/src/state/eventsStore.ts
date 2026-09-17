/**
 * Coordinate: M' (gateway event ring)
 * Actualises: the observability face — every non-profile gateway event lands
 *   here (capped ring buffer). Chat panes read the `chat` channel; the logs
 *   pane reads everything. Real events only; nothing synthesised.
 */

import { create } from 'zustand';
import { KernelBridgeRuntimeEvent } from '../bridge/types';

export interface GatewayEventEntry {
    seq: number;
    emittedAtMs: number;
    kind: string;
    /** gateway event channel name when present (e.g. `chat`, `agent`, `health`) */
    channel: string | null;
    payload: unknown;
}

const CAP = 500;
let seqCounter = 0;

export interface EventsState {
    events: GatewayEventEntry[];
    push(event: KernelBridgeRuntimeEvent): void;
    clear(): void;
}

/** Liveness pulses are the clock, not events — they never enter the log ring.
 *  (The profile already routes to the tick store; `tick`/`heartbeat`/`health`
 *  chatter at 1 Hz would drown every real event.) */
const LIVENESS_CHANNELS = new Set([
    'tick',
    'heartbeat',
    'health',
    'health.snapshot',
    'profile.update',
    'profile',
    'm123.chime'
]);

export const useEventsStore = create<EventsState>(set => ({
    events: [],
    push: event => {
        const payload = event.payload as { event?: string; method?: string } | null;
        const channelName =
            (typeof payload?.event === 'string' && payload.event) ||
            (typeof payload?.method === 'string' && payload.method) ||
            null;
        if (channelName && LIVENESS_CHANNELS.has(channelName)) {
            return;
        }
        if (event.kind === 'readiness' && !channelName) {
            return;
        }
        const entry: GatewayEventEntry = {
            seq: ++seqCounter,
            emittedAtMs: event.emittedAtMs,
            kind: event.kind,
            channel:
                (typeof payload?.event === 'string' && payload.event) ||
                (typeof payload?.method === 'string' && payload.method) ||
                null,
            payload: event.payload
        };
        set(state => ({ events: [...state.events.slice(-(CAP - 1)), entry] }));
    },
    clear: () => set({ events: [] })
}));
