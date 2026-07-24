/**
 * Coordinate: M' `/` membrane (cross-layout intent log — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/state
 * Position (#n): the Diagnostics fold's intent-log buffer (27.8; reads the
 *   CHROME-CONTRACT CrossLayoutIntent envelope dispatched by 31.T31.10).
 * Actualises: a rolling buffer of the last 32 CrossLayoutIntent dispatches so
 *   the Diagnostics tab can surface the intent history WITHOUT inventing it —
 *   the controller calls `record()` at the dispatch seam; this store only
 *   holds what was actually dispatched (FIFO drop past 32). Cleared on session
 *   change by the controller.
 * Public surface: CrossLayoutIntentLogEntry, useCrossLayoutIntentLogStore,
 *   CROSS_LAYOUT_INTENT_LOG_CAPACITY.
 * Does NOT own: the intent envelope contract (commands/crossLayoutIntent), the
 *   dispatch seam, FlexLayout, or any clock.
 */

import { create } from 'zustand';
import type { CrossLayoutIntent } from '../commands/crossLayoutIntent';

/** One observed cross-layout intent dispatch. `at` is the dispatch timestamp in
 *  ms (supplied by the recording seam — this store never reads a clock);
 *  `outcome` is present once the dispatch settles. */
export interface CrossLayoutIntentLogEntry {
    readonly at: number;
    readonly intent: CrossLayoutIntent;
    readonly outcome?: 'ok' | 'error';
}

/** LAW: the buffer keeps only the last 32 dispatches; the oldest is dropped. */
export const CROSS_LAYOUT_INTENT_LOG_CAPACITY = 32;

export interface CrossLayoutIntentLogStore {
    /** Insertion-ordered; index 0 is the oldest surviving entry. */
    readonly entries: readonly CrossLayoutIntentLogEntry[];
    /** Append one dispatch, dropping the oldest past the 32-entry capacity. */
    record(entry: CrossLayoutIntentLogEntry): void;
    /** Empty the buffer (controller calls this on session change). */
    clear(): void;
}

export const useCrossLayoutIntentLogStore = create<CrossLayoutIntentLogStore>(set => ({
    entries: Object.freeze([]),
    record: entry =>
        set(state => {
            const appended = [...state.entries, entry];
            const trimmed =
                appended.length > CROSS_LAYOUT_INTENT_LOG_CAPACITY
                    ? appended.slice(appended.length - CROSS_LAYOUT_INTENT_LOG_CAPACITY)
                    : appended;
            return { entries: Object.freeze(trimmed) };
        }),
    clear: () => set({ entries: Object.freeze([]) })
}));
