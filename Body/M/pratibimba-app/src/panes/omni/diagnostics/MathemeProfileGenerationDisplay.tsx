/**
 * Coordinate: M' `/` membrane (matheme profile generation — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's profile-generation readout (27.8).
 * Actualises: the spec's <MathemeProfileGenerationDisplay /> — the current
 *   MathemeHarmonicProfile generation (useTickStore) plus a small history of
 *   the last up-to-12 generations this fold has ACTUALLY OBSERVED advance via
 *   the profile tick (15.6). The history is an observation buffer, not a
 *   fabricated series: it only records generations the store really emitted.
 * Public surface: MathemeProfileGenerationDisplay,
 *   PROFILE_GENERATION_HISTORY_LIMIT.
 * Does NOT own: the tick store law (state/stores), the profile clock hook
 *   (state/useProfileTick), any timer.
 */

import { useRef } from 'react';
import { useTickStore } from '../../../state/stores';
import { useProfileTick } from '../../../state/useProfileTick';

export const PROFILE_GENERATION_HISTORY_LIMIT = 12;

export function MathemeProfileGenerationDisplay() {
    const generation = useTickStore(s => s.generation);
    const tick = useProfileTick();

    // Observation buffer: append a generation only when it changes from the last
    // one seen. The panel re-renders when the tick store advances (15.6), so this
    // render-time accumulation captures exactly the generations that really ticked.
    // The last-element guard makes a repeat render for the same generation a no-op.
    const historyRef = useRef<number[]>([]);
    if (generation !== null && historyRef.current[historyRef.current.length - 1] !== generation) {
        const appended = [...historyRef.current, generation];
        historyRef.current = appended.slice(-PROFILE_GENERATION_HISTORY_LIMIT);
    }
    const history = historyRef.current;

    return (
        <section className="matheme-profile-generation" data-testid="matheme-profile-generation">
            <h4 className="diagnostics-section-title">Matheme profile generation</h4>
            <div className="matheme-generation-current" data-testid="matheme-generation-current">
                <span className="matheme-generation-label">current</span>
                <strong className="matheme-generation-value">
                    {generation === null ? '—' : generation}
                </strong>
                {tick.tick12 !== null && (
                    <span className="matheme-generation-tick12" data-testid="matheme-generation-tick12">
                        tick12 {tick.tick12}
                    </span>
                )}
            </div>
            {history.length === 0 ? (
                <p className="diagnostics-empty" data-testid="matheme-generation-history-empty">
                    no generations observed yet
                </p>
            ) : (
                <ol className="matheme-generation-history" data-testid="matheme-generation-history" role="list">
                    {history.map((gen, index) => (
                        <li
                            key={`${gen}-${index}`}
                            className="matheme-generation-history-item"
                            data-testid="matheme-generation-history-item"
                        >
                            {gen}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
