/**
 * Coordinate: M' `/` membrane (logs, plan T3.3)
 * Actualises: the observability stream — every gateway event, timestamped,
 *   unfiltered truth from the events ring.
 */

import { useEventsStore } from '../state/eventsStore';

export function LogsPane() {
    const events = useEventsStore(s => s.events);
    const clear = useEventsStore(s => s.clear);

    return (
        <div className="logs-pane" data-testid="logs-pane">
            <div className="pane-toolbar">
                <span>{events.length} events</span>
                <button type="button" onClick={clear}>clear</button>
            </div>
            <ul className="logs-list">
                {[...events].reverse().map(e => (
                    <li key={e.seq} className="log-row" data-testid="log-row">
                        <span className="log-time">{new Date(e.emittedAtMs).toLocaleTimeString()}</span>
                        <span className={`log-kind log-${e.kind}`}>{e.kind}</span>
                        <span className="log-channel">{e.channel ?? '—'}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
