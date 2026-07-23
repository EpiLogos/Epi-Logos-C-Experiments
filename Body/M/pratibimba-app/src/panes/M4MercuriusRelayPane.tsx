/**
 * Coordinate: M' M4' (Mercurius signal-relay chip — 25.T25.16)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): CF(0/1/2/3) kairos-signal chrome; the M4-side surface of
 *   Mercurius's carrier ("PASU.md -> Kerykeion -> M4 degrees -> agents").
 * Actualises: M4MercuriusRelayChip — a stateless live chip that reads the
 *   bussed live-sky vector off the profile-tick, shows the KAIROS_ENABLED
 *   state (FR-3 grey stub when off), the last-refresh stamp (profile cache
 *   time), and a mount-local delta count that pulses once per genuine kairos
 *   change. Composes as the TRACK_08 M4MercuriusRelayChip export.
 * Public surface: M4MercuriusRelayChip.
 * Does NOT own: Kerykeion, the kairos populator, or the signal (19.12 /
 *   nara.kairos.* own it); this is a strict consumer. No new state store, no
 *   local clock, no re-authoring of Mercurius.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { useEffect, useMemo, useState } from 'react';
import { harmonicSnapshot } from '../engine/modulation/modulators';
import { useTickStore } from '../state/stores';
import {
    browserKairosPreferences,
    KAIROS_ENABLED_PREFERENCE,
    readKairosEnabled
} from './kairosEnablement';
import {
    deriveMercuriusRelayView,
    initialMercuriusRelayAccumulator,
    MERCURIUS_RELAY_VIEW_ID,
    reduceMercuriusRelay,
    type MercuriusRelayInput
} from './mercuriusRelay';

/** FR-3 default-off: read the persisted kairos-enabled preference, never assume
 *  live-sky ingress is on. Any failure (no storage, bad value) reads as off. */
function readKairosEnabledPreference(): boolean {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        return readKairosEnabled(browserKairosPreferences(localStorage).get(KAIROS_ENABLED_PREFERENCE));
    } catch {
        return false;
    }
}

export interface M4MercuriusRelayChipProps {
    /** Explicit enablement (composition sites pass it); defaults to the
     *  persisted FR-3 preference when mounted bare. */
    readonly kairosEnabled?: boolean;
}

export function M4MercuriusRelayChip({ kairosEnabled }: M4MercuriusRelayChipProps) {
    const enabled = kairosEnabled ?? readKairosEnabledPreference();
    const cached = useTickStore(s => s.profile);

    const input = useMemo<MercuriusRelayInput>(() => {
        const snapshot = harmonicSnapshot(cached?.profile ?? null);
        return {
            kairosEnabled: enabled,
            planetDegrees: snapshot.planetDegrees,
            cachedAtMs: cached?.cachedAtMs ?? null
        };
    }, [enabled, cached]);

    const [accumulator, setAccumulator] = useState(initialMercuriusRelayAccumulator);

    // The profile-tick is the ONLY clock (15.6): fold each fresh observation in
    // an effect; reduceMercuriusRelay returns the prior accumulator unchanged on
    // an unchanged signal, so React bails the re-render — no spurious pulse.
    useEffect(() => {
        setAccumulator(prev => reduceMercuriusRelay(prev, input));
    }, [input]);

    const view = deriveMercuriusRelayView(accumulator, input);

    const label =
        view.state === 'disabled'
            ? 'Kairos disabled'
            : view.state === 'pending'
              ? `Mercurius · awaiting signal${
                    view.reason === 'kairos-signal-malformed' ? ' (malformed)' : ''
                }`
              : `Mercurius · ${view.deltaCount} ${view.deltaCount === 1 ? 'signal' : 'signals'}`;

    return (
        <span
            className={`kairos-relay-indicator mercurius-relay-chip mercurius-relay-chip--${view.state}`}
            data-testid="m4-mercurius-relay"
            data-view-id={MERCURIUS_RELAY_VIEW_ID}
            data-state={view.state}
            data-delta-count={view.deltaCount}
            data-pulse-seq={view.pulseSeq}
            data-planet-count={view.planetCount ?? 'none'}
            data-privacy-class="none"
            role="status"
            aria-live="polite"
            title={
                view.lastRefreshIso
                    ? `Last kairos refresh ${view.lastRefreshIso}`
                    : 'Mercurius kairos relay'
            }
        >
            {/* Keyed on pulseSeq so the single-pulse CSS animation re-triggers
                exactly once per genuine kairos change. */}
            <span className="mercurius-relay-pulse" key={view.pulseSeq} aria-hidden="true" />
            <span className="mercurius-relay-label">{label}</span>
            {view.state === 'live' && view.lastRefreshIso ? (
                <time className="mercurius-relay-stamp" dateTime={view.lastRefreshIso}>
                    {view.lastRefreshIso}
                </time>
            ) : null}
        </span>
    );
}
