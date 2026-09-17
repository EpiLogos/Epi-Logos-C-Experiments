/**
 * Coordinate: M' (status strip)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): shared six-thread context strip.
 * Actualises: the six status entries of Tranche 15.10 — READ from the one
 *   declaration (`ui/shellSlotPolicy.ts` `STATUS_STRIP_THREADS`), not enumerated
 *   here a second time. Exactly six; no widget owns its own day-now or clock.
 *
 *   32.T32.9 rebuilt the profile-tick entry. It used to print `⟳ {generation}`
 *   — the gateway process's generation counter, under the word "tick". For a
 *   new user that number answers nothing: it is already in the hundreds when
 *   the shell attaches to a running gateway, so it cannot say whether the clock
 *   has started HERE. The entry now reads `tick:n gen:g` (spec :265) where `n`
 *   is this shell's observed advances and `g` is the kernel generation, shows
 *   the last-tick-fired ISO timestamp on hover, opens the Diagnostics fold on
 *   its profile-tick history when clicked, and carries the birth of the clock:
 *   the 32.5 `pending_first_tick` copy with a shimmer before the first advance,
 *   then "Profile-tick 1 — system alive." on it.
 *
 *   The entry is hideable by `epi-logos.profile.tick.visible` (default ON).
 *   Hiding removes the PAINT, never the thread: `STATUS_STRIP_THREADS` still
 *   declares six, which is the 15.10 clause spec :271 pins.
 * Public surface: StatusStrip, StatusStripProps.
 * Does NOT own: profile production, the clock (state/stores + useProfileTick),
 *   the thread declaration (ui/shellSlotPolicy), the readout law
 *   (ui/profileTickVisibility), M3 rendering law, or application state.
 * Contract: rerun tranche [[32.T32.9]] over [[31.T31.7]] · 15.10 discipline.
 */

import { commands } from '../commands/registry';
import {
    useOmniPanelSessionStore,
    type DiagnosticsTabState
} from '../panes/omni/omnipanelSessionState';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../state/stores';
import { useProfileTick } from '../state/useProfileTick';
import { activeDailyClaimsForReceiver } from '../ui/dailySurfaceOwnership';
import {
    PROFILE_TICK_HISTORY_ROUTE,
    lastTickFiredIso,
    profileTickReadout,
    useProfileTickVisibilityStore
} from '../ui/profileTickVisibility';
import { M3ContextCodonChip } from './M3CompactViews';

export interface StatusStripProps {
    /** Injected in tests; the one command registry otherwise. */
    readonly execute?: (id: string) => void;
    /** Injected in tests; the OmniPanel session store otherwise. */
    readonly focusDiagnosticsSubSection?: (
        subSection: DiagnosticsTabState['activeSubSection']
    ) => void;
}

/**
 * The profile-tick thread. It subscribes through `useProfileTick()` — the ONE
 * 15.6 re-render seam — and to nothing else that moves: no timer, no local
 * counter, no second store path. What it prints therefore changes if and only
 * if a frame passed the store's generation gate.
 */
function ProfileTickEntry({ execute, focusDiagnosticsSubSection }: StatusStripProps) {
    const tick = useProfileTick();
    const visible = useProfileTickVisibilityStore(s => s.visible);

    if (!visible) {
        return null;
    }

    const readout = profileTickReadout(tick);
    const firedAt = lastTickFiredIso(tick.lastTickAtMs);
    const title = firedAt
        ? `last tick fired ${firedAt} — click for profile-tick history`
        : 'no profile-tick has fired yet — click for profile-tick history';

    const focus =
        focusDiagnosticsSubSection
        ?? ((subSection: DiagnosticsTabState['activeSubSection']) =>
            useOmniPanelSessionStore
                .getState()
                .patchTab('diagnostics', { activeSubSection: subSection }));
    const run = execute ?? ((id: string) => void commands.execute(id));

    const openHistory = () => {
        // The sub-section FIRST: the command activates the fold, and the fold
        // reads its sub-section from the session store as it renders. Setting
        // it after would land a frame late on an already-open Diagnostics tab.
        focus(PROFILE_TICK_HISTORY_ROUTE.subSection);
        run(PROFILE_TICK_HISTORY_ROUTE.commandId);
    };

    return (
        <span
            data-testid="status-tick"
            data-tick-state={readout.kind}
            data-observed-ticks={tick.observedTicks}
            data-generation={tick.generation ?? ''}
            data-last-tick-fired={firedAt ?? ''}
            title={title}
        >
            <button
                type="button"
                className={`status-tick-button status-tick-${readout.kind}`}
                data-testid="status-tick-open-history"
                aria-label={PROFILE_TICK_HISTORY_ROUTE.label}
                onClick={openHistory}
            >
                {readout.glyph} {readout.text}
            </button>
            {readout.announcement ? (
                <em className="status-tick-announcement" data-testid="status-tick-announcement">
                    {readout.announcement}
                </em>
            ) : null}
        </span>
    );
}

export function StatusStrip(props: StatusStripProps = {}) {
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
            <ProfileTickEntry {...props} />
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
            <span
                data-testid="status-coordinate"
                data-active-coordinate={coordinate ?? ''}
                title="active coordinate"
            >
                # <span data-testid="active-coordinate">{coordinate ?? '—'}</span>
                <M3ContextCodonChip />
            </span>
        </footer>
    );
}
