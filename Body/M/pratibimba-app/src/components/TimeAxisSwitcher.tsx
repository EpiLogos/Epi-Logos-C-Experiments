/**
 * Coordinate: M4' personal composition (three-mode time-axis switcher — 25.T25.17)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #4 — personal-pole reading selector
 * Actualises: a small stateless segmented control over natal | real-time |
 *   kairotic that chooses which quaternion composition reading is foregrounded
 *   on the personal pole. Reads the mode from the persisted personal composition
 *   state and writes it back through the composition save channel (no private
 *   store, no clock, no gateway RPC); cmd-shift-T cycles the three modes while
 *   mounted. Per DR-WC-M4-1 it is DISTINCT from the 11.12 sense-override — a
 *   separate field this control never touches. The renderer-side handle
 *   foregrounding is 25.6's deliverable, not this face.
 * Public surface: TimeAxisSwitcher.
 * Does NOT own: composition persistence storage, the 25.6 personal renderer, or
 *   the sense-override control (11.12).
 * Contract: [[M'-SYSTEM-SPEC]] + rerun tranche [[25.T25.17]] (DR-WC-M4-1).
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useEffect, useRef } from 'react';
import { useCompositionState } from '../composition/compositionState';
import {
    applyTimeAxisMode,
    currentTimeAxisMode,
    nextTimeAxisMode,
    PERSONAL_COMPOSITION_ID,
    TIME_AXIS_HANDLE,
    TIME_AXIS_MODES,
    type TimeAxisMode
} from '../composition/timeAxis';
import { useTickStore } from '../state/stores';

const MODE_LABEL: Record<TimeAxisMode, string> = {
    natal: 'Natal',
    'real-time': 'Real-time',
    kairotic: 'Kairotic'
};

export function TimeAxisSwitcher() {
    const compositionState = useCompositionState();
    const generation = useTickStore(s => s.generation);
    const mode = currentTimeAxisMode(compositionState.stateById[PERSONAL_COMPOSITION_ID]);

    // Keep the latest state/generation/mode reachable from the stable keydown
    // listener without re-subscribing the window handler on every tick.
    const latest = useRef({ compositionState, generation, mode });
    latest.current = { compositionState, generation, mode };

    // Read the persisted mode on mount so a prior selection survives a layout
    // switch / app restart (the spec's session-scope persistence). Guarded: no
    // persisted state yet, or host unavailable, falls back to the default mode.
    const load = compositionState.load;
    useEffect(() => {
        void load(PERSONAL_COMPOSITION_ID).catch(() => undefined);
    }, [load]);

    useEffect(() => {
        const onKeyDown = (evt: KeyboardEvent) => {
            if (evt.metaKey && evt.shiftKey && !evt.altKey && evt.key.toLowerCase() === 't') {
                evt.preventDefault();
                const state = latest.current;
                void applyTimeAxisMode(
                    state.compositionState,
                    nextTimeAxisMode(state.mode),
                    state.generation
                );
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div
            className={`time-axis-switcher ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title}
            data-testid="time-axis-switcher"
            data-mode={mode}
            role="radiogroup"
            aria-label="time axis reading"
        >
            {TIME_AXIS_MODES.map(candidate => (
                <button
                    key={candidate}
                    type="button"
                    role="radio"
                    aria-checked={candidate === mode}
                    className="time-axis-switcher-mode"
                    data-testid={`time-axis-mode-${candidate}`}
                    data-active={candidate === mode ? 'true' : 'false'}
                    title={`foreground ${TIME_AXIS_HANDLE[candidate]}`}
                    onClick={() => void applyTimeAxisMode(compositionState, candidate, generation)}
                >
                    {MODE_LABEL[candidate]}
                </button>
            ))}
        </div>
    );
}
