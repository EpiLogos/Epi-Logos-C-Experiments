/**
 * Coordinate: M' `/` membrane (composition Dispatch Trace - 29.T29.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): standalone composition timeline folding
 * Actualises: composition.* observability records in the Dispatch fold.
 * Public surface: CompositionDispatchTracePane.
 * Does NOT own: event production, Pi/Anima genealogy, or evidence snapshots.
 * Contract: [[M'-PORTAL-SPEC]] / [[29-integrated-plugins-composition-deep]].
 */

import { useMemo } from 'react';
import { compositionEventsFromEntries } from '../../composition/compositionEvents';
import { useEventsStore } from '../../state/eventsStore';

export function CompositionDispatchTracePane() {
    const entries = useEventsStore(state => state.events);
    const events = useMemo(() => compositionEventsFromEntries(entries), [entries]);

    return (
        <section className="composition-dispatch-trace" data-testid="composition-dispatch-trace">
            <header>
                <strong>Dispatch trace</strong>
                <span>{events.length} composition events</span>
            </header>
            {events.length === 0 ? (
                <p className="pane-message">No composition events observed.</p>
            ) : (
                <ol aria-label="Composition event timeline">
                    {events.map((event, index) => (
                        <li key={`${event.timestamp}:${event.type}:${index}`}>
                            <span className="composition-trace-index">{index + 1}</span>
                            <div>
                                <strong>{event.type}</strong>
                                <span>{event.compositionId}</span>
                            </div>
                            <time dateTime={event.timestamp}>
                                {new Date(event.timestamp).toLocaleTimeString()}
                            </time>
                            <small>
                                generation {event.profileGeneration ?? 'none'}
                            </small>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
