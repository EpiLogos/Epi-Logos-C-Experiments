/**
 * Coordinate: M4' personal composition (time-axis mode — 25.T25.17)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #4 — the personal-pole time-axis reading selector
 * Actualises: the three-mode time-axis vocabulary (natal | real-time | kairotic)
 *   and the single write path that persists the mode on the personal integrated
 *   composition state (`jiva-siva.integrated`) and emits `composition.time-axis.switch`.
 *   Per DR-WC-M4-1 this is DISTINCT from the 11.12 sense-override (Klein
 *   prospective/retrospective face) — a separate `senseOverride` field the
 *   switcher never touches. Choosing a mode foregrounds which quaternion handle
 *   the 25.6 personal renderer reads (natal→qIdentity, real-time→qTransit,
 *   kairotic→qActivity); that FOREGROUNDING is 25.6's deliverable, not this one.
 * Public surface: TIME_AXIS_MODES, TimeAxisMode, DEFAULT_TIME_AXIS_MODE,
 *   TIME_AXIS_HANDLE, PERSONAL_COMPOSITION_ID, currentTimeAxisMode,
 *   nextTimeAxisMode, applyTimeAxisMode.
 * Does NOT own: the renderer handle-foregrounding (25.6), the composition
 *   persistence storage (Tauri host), or the sense-override control (11.12).
 * Contract: [[M'-SYSTEM-SPEC]] + rerun tranche [[25.T25.17]] (DR-WC-M4-1).
 */

import { emitCompositionEvent } from './compositionEvents';
import {
    emptyCompositionState,
    type CompositionStateContextValue,
    type IntegratedCompositionId,
    type IntegratedCompositionPersistedState
} from './compositionState';

/** The three time-axis readings, in cmd-shift-T cycle order. */
export const TIME_AXIS_MODES = ['natal', 'real-time', 'kairotic'] as const;
export type TimeAxisMode = (typeof TIME_AXIS_MODES)[number];

/** Spec default (25.17 line 219): the current-transit reading. */
export const DEFAULT_TIME_AXIS_MODE: TimeAxisMode = 'real-time';

/** Which quaternion handle each mode foregrounds on the 25.6 personal renderer. */
export const TIME_AXIS_HANDLE: Record<TimeAxisMode, string> = {
    natal: 'qIdentityHandle',
    'real-time': 'qTransitHandle',
    kairotic: 'qActivityHandle'
};

/** The personal (4-5-0) integrated composition the time axis lives on. */
export const PERSONAL_COMPOSITION_ID: IntegratedCompositionId = 'jiva-siva.integrated';

/** The mode a face should render: the persisted mode, or the spec default when
 *  nothing has been persisted yet (null is treated as real-time, never shown). */
export function currentTimeAxisMode(state: IntegratedCompositionPersistedState | undefined): TimeAxisMode {
    return state?.timeAxisMode ?? DEFAULT_TIME_AXIS_MODE;
}

/** The next mode in the cmd-shift-T cycle (natal → real-time → kairotic → natal). */
export function nextTimeAxisMode(mode: TimeAxisMode): TimeAxisMode {
    const index = TIME_AXIS_MODES.indexOf(mode);
    return TIME_AXIS_MODES[(index + 1) % TIME_AXIS_MODES.length];
}

/**
 * Persist `mode` on the personal composition state and emit the switch event.
 * Patches only `timeAxisMode` onto the current (or empty) full 18-key state so
 * the strict validator accepts the write, and never touches `senseOverride`.
 * A no-op when the mode is already current.
 */
export async function applyTimeAxisMode(
    compositionState: CompositionStateContextValue,
    mode: TimeAxisMode,
    profileGeneration: number | null
): Promise<void> {
    const current = compositionState.stateById[PERSONAL_COMPOSITION_ID] ?? emptyCompositionState(PERSONAL_COMPOSITION_ID);
    if (current.timeAxisMode === mode) {
        return;
    }
    await compositionState.save({ ...current, timeAxisMode: mode });
    emitCompositionEvent({
        type: 'composition.time-axis.switch',
        compositionId: PERSONAL_COMPOSITION_ID,
        timestamp: new Date().toISOString(),
        profileGeneration,
        payload: { mode, foregroundedHandle: TIME_AXIS_HANDLE[mode] }
    });
}
