/**
 * Coordinate: M1' traversal timeline surface (rerun 51.T51.3)
 * Residency: Body/M/pratibimba-app/src/panes/m1Traversal/M1TraversalTimelinePane.tsx
 * Position (#n): #3 — Process: the trajectory rendered as a path.
 * Actualises: [[M1'-SPEC]] §2's traversal timeline. It renders the ledger
 *   `traversalTimeline.ts` keeps and computes nothing of its own — the
 *   crossings are already decided by the recorder, so the view cannot
 *   disagree with the record. Newest LAST: a path reads forward.
 * Public surface: M1TraversalTimelinePane.
 * Does NOT own: the recorder or the crossing law (`traversalTimeline.ts`),
 *   the walk (`panes/WalkPane.tsx`), the clock (`state/stores.ts`).
 * Contract: [[M1'-SPEC]] §2 · rerun tranche [[51.T51.3]].
 */

import { useTraversalTimeline, type TraversalSample } from './traversalTimeline';
import './m1TraversalTimeline.css';

function cell(value: number | string | null): string {
    return value === null ? '—' : String(value);
}

function crossingLabel(sample: TraversalSample): string | null {
    if (sample.crossing === 'mobius-return') {
        return "Möbius return P5 → P0′ (enharmonic flip)";
    }
    if (sample.crossing === 'klein-flip') {
        return 'Klein flip 5 → 6';
    }
    return null;
}

export function M1TraversalTimelinePane() {
    const { revision, samples } = useTraversalTimeline();
    const mobiusReturns = samples.filter(sample => sample.crossing === 'mobius-return').length;
    const kleinFlips = samples.filter(sample => sample.crossing === 'klein-flip').length;
    const relationSteps = samples.filter(sample => sample.relationMovement !== null).length;
    const walkedSamples = samples.filter(
        sample => sample.mode === 'held' || sample.mode === 'walking'
    ).length;

    return (
        <div
            className="m1-traversal-timeline"
            data-testid="m1-traversal-timeline"
            data-timeline-revision={revision}
            data-sample-count={samples.length}
            data-mobius-returns={mobiusReturns}
            data-klein-flips={kleinFlips}
            data-relation-steps={relationSteps}
            data-walked-samples={walkedSamples}
        >
            <header className="m1-traversal-header">
                <span className="m1-traversal-coordinate">M1′</span>
                <h2>Traversal timeline</h2>
                <p className="m1-traversal-essence">
                    The walk in progress as motion over time — tick, position6, helix face,
                    degree720 and relation movement, recorded whether or not this surface is the
                    tab you are looking at. A P5 → P0′ Möbius return is marked, never smoothed
                    into the run of ticks — but only on a step the walk actually took: the 1 Hz
                    heartbeat samples a faster oscillator, so a <b>flowing</b> pair that reads 11
                    then 0 skipped most of a turn and crossed nothing observable.
                </p>
            </header>

            {samples.length === 0 ? (
                <p className="m1-traversal-empty" data-testid="m1-traversal-empty">
                    No traversal recorded yet — the trajectory begins at the first tick advance or
                    relation step.
                </p>
            ) : (
                <ol className="m1-traversal-track" data-testid="m1-traversal-track">
                    {samples.map(sample => (
                        <li
                            key={sample.seq}
                            data-testid={`m1-traversal-sample-${sample.seq}`}
                            data-seq={sample.seq}
                            data-tick12={sample.tick12 ?? ''}
                            data-position6={sample.position6 ?? ''}
                            data-helix-sheet={sample.helixSheet ?? ''}
                            data-helix-face={sample.helixFace ?? ''}
                            data-degree720={sample.degree720 ?? ''}
                            data-coordinate={sample.coordinate ?? ''}
                            data-crossing={sample.crossing ?? ''}
                            data-mode={sample.mode ?? ''}
                            className={sample.crossing ? `m1-traversal-crossing-${sample.crossing}` : undefined}
                        >
                            <span className="m1-traversal-seq">{sample.seq}</span>
                            <span className="m1-traversal-field">
                                tick12 <b>{cell(sample.tick12)}</b>
                            </span>
                            <span className="m1-traversal-field">
                                position6 <b>{cell(sample.position6)}</b>
                            </span>
                            <span className="m1-traversal-field">
                                helix <b>{cell(sample.helixFace)}</b>
                                {sample.helixSheet === null ? null : (
                                    <em> / sheet {sample.helixSheet}</em>
                                )}
                            </span>
                            <span className="m1-traversal-field">
                                degree720 <b>{cell(sample.degree720)}</b>
                            </span>
                            <span className="m1-traversal-field">
                                coordinate <b>{cell(sample.coordinate)}</b>
                            </span>
                            <span className="m1-traversal-field">
                                transport <b>{cell(sample.mode)}</b>
                            </span>
                            {sample.relationMovement ? (
                                <span
                                    className="m1-traversal-relation"
                                    data-testid={`m1-traversal-relation-${sample.seq}`}
                                >
                                    {cell(sample.relationMovement.from)} →{' '}
                                    {cell(sample.relationMovement.to)}
                                </span>
                            ) : null}
                            {crossingLabel(sample) ? (
                                <span
                                    className="m1-traversal-crossing"
                                    data-testid={`m1-traversal-crossing-${sample.seq}`}
                                >
                                    {crossingLabel(sample)}
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ol>
            )}

            <p className="m1-traversal-note" data-testid="m1-traversal-note">
                Relation movement is recorded as the coordinate transition the walk performed. The
                relation TYPE of a step is component-local to <code>panes/WalkPane.tsx</code> and is
                published to no store, so it is named here as absent rather than reconstructed.
                Ticks skipped between two <b>flowing</b> samples are likewise not reconstructed:
                deriving them would mean re-deriving kernel phase law here and inventing samples
                nobody observed.
            </p>
        </div>
    );
}
