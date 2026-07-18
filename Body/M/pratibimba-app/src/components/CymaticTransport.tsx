/**
 * Coordinate: M' M2' (cymatic transport)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2' historical inspection control.
 * Actualises: pause/hold and cache-gated scrub control over received profile
 *   frames while the live profile stream continues independently.
 * Public surface: CymaticTransport, buildCymaticTickSnapshot,
 *   resolveCymaticTransportViewModel.
 * Does NOT own: kernel ticks, gateway retention, audio output, or cymatic
 *   field rendering.
 * Contract: [[M2'-SPEC]]; frozen reference
 *   `extensions/m2-parashakti/src/browser/components/CymaticTransport.tsx`.
 */

import { type ReactNode, useMemo, useState } from 'react';
import type { KernelBridgeCachedProfile } from '../bridge/types';

export type CymaticTickSnapshotSource = 'kernel-bridge-profile-cache' | 'live-profile';
export type CymaticCacheState = 'ready' | 'pending-tick-snapshot-cache';

export interface CymaticTickSnapshot {
    readonly tick: number;
    readonly profile: KernelBridgeCachedProfile;
    readonly capturedAtMs: number;
    readonly source: CymaticTickSnapshotSource;
    readonly kleinFlip: boolean;
}

export interface CymaticTransportViewModel {
    readonly cacheState: CymaticCacheState;
    readonly liveSnapshot: CymaticTickSnapshot | null;
    readonly activeSnapshot: CymaticTickSnapshot | null;
    readonly tickSnapshots: readonly CymaticTickSnapshot[];
    readonly selectedTick: number | null;
    readonly pausedTick: number | null;
    readonly paused: boolean;
    readonly scrubberDisabled: boolean;
    readonly oldestTick: number | null;
    readonly newestTick: number | null;
    readonly kleinFlipTicks: readonly number[];
}

export interface CymaticTransportProps {
    readonly liveProfile: KernelBridgeCachedProfile | null;
    /** The bridge does not currently expose this cache. This optional input
     * keeps the transport ready to consume a real retained window when it does. */
    readonly tickSnapshots?: readonly CymaticTickSnapshot[] | null;
    readonly children: (snapshot: CymaticTickSnapshot) => ReactNode;
}

interface TransportInteractionState {
    readonly paused: boolean;
    readonly pausedSnapshot: CymaticTickSnapshot | null;
    readonly scrubTick: number | null;
}

export function CymaticTransport(props: CymaticTransportProps) {
    const liveSnapshot = useMemo(
        () => (props.liveProfile ? buildCymaticTickSnapshot(props.liveProfile, 'live-profile') : null),
        [props.liveProfile]
    );
    const [interaction, setInteraction] = useState<TransportInteractionState>({
        paused: false,
        pausedSnapshot: null,
        scrubTick: null
    });
    const model = resolveCymaticTransportViewModel({
        liveSnapshot,
        tickSnapshots: props.tickSnapshots,
        paused: interaction.paused,
        pausedSnapshot: interaction.pausedSnapshot,
        scrubTick: interaction.scrubTick
    });
    const rangeValue = model.selectedTick ?? model.newestTick ?? model.activeSnapshot?.tick ?? 0;

    const pauseOrResume = () => {
        setInteraction(current =>
            current.paused
                ? { paused: false, pausedSnapshot: null, scrubTick: null }
                : {
                      paused: true,
                      pausedSnapshot: model.activeSnapshot ?? liveSnapshot,
                      scrubTick: current.scrubTick
                  }
        );
    };

    return (
        <section
            className="m2-cymatic-transport"
            aria-label="Cymatic transport"
            data-testid="cymatic-transport"
            data-cache-state={model.cacheState}
            data-active-tick={model.activeSnapshot?.tick ?? ''}
            data-audio-output="none"
        >
            <div className="m2-cymatic-transport-toolbar" role="toolbar" aria-label="Cymatic tick controls">
                <button
                    type="button"
                    aria-pressed={model.paused}
                    disabled={model.liveSnapshot === null}
                    onClick={pauseOrResume}
                >
                    {model.paused ? 'Resume' : 'Pause'}
                </button>
                {model.pausedTick !== null ? (
                    <span data-testid="cymatic-paused-tick" aria-live="polite">
                        Paused tick {model.pausedTick}
                    </span>
                ) : null}
                {model.cacheState === 'pending-tick-snapshot-cache' ? (
                    <span data-pending-tick-snapshot-cache>pending-tick-snapshot-cache</span>
                ) : null}
            </div>
            <label className="m2-cymatic-transport-scrubber">
                <span>Scrub-to-tick</span>
                <input
                    type="range"
                    min={model.oldestTick ?? rangeValue}
                    max={model.newestTick ?? rangeValue}
                    step={1}
                    value={rangeValue}
                    disabled={model.scrubberDisabled}
                    aria-label="Scrub cymatic surface to tick"
                    aria-valuetext={`tick ${rangeValue}`}
                    onChange={event =>
                        setInteraction(current => ({ ...current, scrubTick: Number(event.currentTarget.value) }))
                    }
                />
                <span aria-live="polite">tick {model.activeSnapshot?.tick ?? 'pending'}</span>
                <span className="m2-cymatic-transport-markers" aria-label="Klein flip ticks">
                    {model.kleinFlipTicks.map(tick => (
                        <button
                            key={tick}
                            type="button"
                            className="m2-cymatic-transport-klein-marker"
                            data-klein-flip-marker={tick}
                            aria-label={`Scrub to Klein-flip tick ${tick}`}
                            onClick={() => setInteraction(current => ({ ...current, scrubTick: tick }))}
                        />
                    ))}
                </span>
            </label>
            <div className="m2-cymatic-transport-surface" data-cymatic-surface-held-tick={model.activeSnapshot?.tick ?? ''}>
                {model.activeSnapshot ? props.children(model.activeSnapshot) : null}
            </div>
        </section>
    );
}

export function buildCymaticTickSnapshot(
    profile: KernelBridgeCachedProfile,
    source: CymaticTickSnapshotSource = 'kernel-bridge-profile-cache'
): CymaticTickSnapshot {
    return Object.freeze({
        tick: profile.generation,
        profile,
        capturedAtMs: profile.cachedAtMs,
        source,
        kleinFlip: profileHasKleinFlip(profile)
    });
}

export function resolveCymaticTransportViewModel(input: {
    readonly liveSnapshot: CymaticTickSnapshot | null;
    readonly tickSnapshots?: readonly CymaticTickSnapshot[] | null;
    readonly paused?: boolean;
    readonly pausedSnapshot?: CymaticTickSnapshot | null;
    readonly scrubTick?: number | null;
}): CymaticTransportViewModel {
    const history = normalizeHistory(input.tickSnapshots);
    const scrubSnapshot = findSnapshot(history, input.scrubTick ?? null);
    const pausedSnapshot = input.pausedSnapshot ?? null;
    const activeSnapshot = scrubSnapshot ?? (input.paused ? pausedSnapshot : null) ?? input.liveSnapshot;
    const hasCache = history.length > 0;

    return Object.freeze({
        cacheState: hasCache ? 'ready' : 'pending-tick-snapshot-cache',
        liveSnapshot: input.liveSnapshot,
        activeSnapshot,
        tickSnapshots: Object.freeze(history),
        selectedTick: scrubSnapshot?.tick ?? (input.paused ? pausedSnapshot?.tick ?? null : null),
        pausedTick: input.paused ? pausedSnapshot?.tick ?? null : null,
        paused: input.paused ?? false,
        scrubberDisabled: !hasCache,
        oldestTick: hasCache ? history[0].tick : null,
        newestTick: hasCache ? history[history.length - 1].tick : null,
        kleinFlipTicks: Object.freeze(history.filter(snapshot => snapshot.kleinFlip).map(snapshot => snapshot.tick))
    });
}

function normalizeHistory(
    tickSnapshots: readonly CymaticTickSnapshot[] | null | undefined
): readonly CymaticTickSnapshot[] {
    if (!tickSnapshots?.length) return Object.freeze([]);
    const byTick = new Map<number, CymaticTickSnapshot>();
    for (const snapshot of tickSnapshots) {
        byTick.set(snapshot.tick, snapshot);
    }
    return Object.freeze([...byTick.values()].sort((left, right) => left.tick - right.tick));
}

function findSnapshot(
    snapshots: readonly CymaticTickSnapshot[],
    tick: number | null
): CymaticTickSnapshot | null {
    return tick === null ? null : snapshots.find(snapshot => snapshot.tick === tick) ?? null;
}

function profileHasKleinFlip(profile: KernelBridgeCachedProfile): boolean {
    const harmonicProfile = (profile.profile as { harmonicProfile?: Record<string, unknown> } | null)?.harmonicProfile;
    const kleinFlip = harmonicProfile?.kleinFlip;
    if (kleinFlip === null || kleinFlip === undefined || kleinFlip === false) return false;
    if (typeof kleinFlip !== 'object' || Array.isArray(kleinFlip)) return Boolean(kleinFlip);
    const event = kleinFlip as Record<string, unknown>;
    return event.flip_at_this_tick === true || event.flipAtThisTick === true || event.event === 'm2CymaticValenceInvert';
}
