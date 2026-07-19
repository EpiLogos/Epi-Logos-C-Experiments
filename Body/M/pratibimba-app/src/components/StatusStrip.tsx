/**
 * Coordinate: M' (status strip)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): shared six-thread context strip.
 * Actualises: the six status entries of Tranche 15.10 — tick generation,
 *   day-now, session, gateway state, supervisor state, active coordinate.
 *   Exactly six; no widget owns its own day-now or clock.
 * Public surface: StatusStrip.
 * Does NOT own: profile production, M3 rendering law, or application state.
 */

import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from '../state/stores';
import { activeDailyClaimsForReceiver } from '../ui/dailySurfaceOwnership';
import { M3ContextCodonChip } from './M3CompactViews';

export function StatusStrip() {
    const generation = useTickStore(s => s.generation);
    const dayNow = useSessionStore(s => s.dayNow);
    const sessionKey = useSessionStore(s => s.sessionKey);
    const connection = useProvenanceStore(s => s.connection);
    const supervisor = useProvenanceStore(s => s.supervisor);
    const stale = useProvenanceStore(s => s.stale);
    const coordinate = useCoordinateStore(s => s.selected);

    return (
        <footer
            className="status-strip"
            data-testid="status-strip"
            data-daily-claims={activeDailyClaimsForReceiver('statusStrip').join(' ')}
        >
            <span data-testid="status-tick" title="profile generation (the kernel tick is the only clock)">
                ⟳ {generation ?? '—'}
            </span>
            <span data-testid="status-daynow" title="day-now anchor">
                📅 {dayNow ?? 'no day'}
            </span>
            <span data-testid="status-session" title="gateway session">
                ◈ {sessionKey ?? 'no session'}
            </span>
            <span data-testid="status-gateway" title={stale ? 'connected but no profile stream — Gateway: restart under supervision' : connection.reason}>
                ⇄ {connection.state}
                {stale ? ' (stale)' : ''}
            </span>
            <span data-testid="status-supervisor" title={supervisor.detail}>
                ♼ {supervisor.state}
            </span>
            <span data-testid="status-coordinate" title="active coordinate">
                # {coordinate ?? '—'}
                <M3ContextCodonChip />
            </span>
        </footer>
    );
}
