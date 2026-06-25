import * as React from 'react';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';

export type M2CymaticTickSnapshotSource = 'kernel-bridge-profile-cache' | 'live-profile';
export type M2CymaticCacheState = 'ready' | 'pending-tick-snapshot-cache';

export interface M2CymaticTickSnapshot {
    readonly tick: number;
    readonly packet: M2PrimeMeaningPacket;
    readonly capturedAtMs: number;
    readonly source: M2CymaticTickSnapshotSource;
    readonly kleinFlip: boolean;
}

export interface M2CymaticTickSnapshotInput {
    readonly tick: number;
    readonly packet: M2PrimeMeaningPacket;
    readonly capturedAtMs?: number;
    readonly source?: M2CymaticTickSnapshotSource;
    readonly kleinFlip?: boolean;
}

export interface CymaticTransportViewModel {
    readonly cacheState: M2CymaticCacheState;
    readonly liveSnapshot: M2CymaticTickSnapshot | null;
    readonly activeSnapshot: M2CymaticTickSnapshot | null;
    readonly tickSnapshots: readonly M2CymaticTickSnapshot[];
    readonly selectedTick: number | null;
    readonly pausedTick: number | null;
    readonly paused: boolean;
    readonly scrubberDisabled: boolean;
    readonly oldestTick: number | null;
    readonly newestTick: number | null;
    readonly kleinFlipTicks: readonly number[];
}

export interface CymaticTransportModelInput {
    readonly liveSnapshot: M2CymaticTickSnapshot | null;
    readonly tickSnapshots?: readonly M2CymaticTickSnapshot[] | null;
    readonly paused?: boolean;
    readonly pausedSnapshot?: M2CymaticTickSnapshot | null;
    readonly pausedTick?: number | null;
    readonly scrubTick?: number | null;
}

export interface CymaticTransportProps {
    readonly livePacket: M2PrimeMeaningPacket | null;
    readonly liveTick?: number | null;
    readonly tickSnapshots?: readonly M2CymaticTickSnapshot[] | null;
    readonly initialPaused?: boolean;
    readonly initialPausedTick?: number | null;
    readonly initialScrubTick?: number | null;
    readonly className?: string;
    readonly children?: (snapshot: M2CymaticTickSnapshot) => React.ReactNode;
}

interface TransportInteractionState {
    readonly paused: boolean;
    readonly pausedTick: number | null;
    readonly scrubTick: number | null;
    readonly pausedSnapshot: M2CymaticTickSnapshot | null;
}

export function CymaticTransport(props: CymaticTransportProps): React.ReactElement {
    const liveSnapshot = props.livePacket
        ? buildCymaticTickSnapshot({
            tick: props.liveTick ?? props.livePacket.profileGeneration,
            packet: props.livePacket,
            capturedAtMs: 0,
            source: 'live-profile'
        })
        : null;
    const [interaction, setInteraction] = React.useState<TransportInteractionState>(() => ({
        paused: props.initialPaused ?? false,
        pausedTick: props.initialPausedTick ?? null,
        scrubTick: props.initialScrubTick ?? null,
        pausedSnapshot: findSnapshot(props.tickSnapshots, props.initialPausedTick ?? null) ?? null
    }));
    const model = resolveCymaticTransportViewModel({
        liveSnapshot,
        tickSnapshots: props.tickSnapshots,
        paused: interaction.paused,
        pausedTick: interaction.pausedTick,
        scrubTick: interaction.scrubTick,
        pausedSnapshot: interaction.pausedSnapshot
    });
    const activeTick = model.activeSnapshot?.tick ?? null;
    const rangeValue = model.selectedTick ?? model.newestTick ?? activeTick ?? 0;
    const className = ['m2-cymatic-transport', props.className].filter(Boolean).join(' ');

    const pauseOrResume = (): void => {
        setInteraction(current => {
            if (current.paused) {
                return {
                    paused: false,
                    pausedTick: null,
                    scrubTick: null,
                    pausedSnapshot: null
                };
            }
            const snapshotToHold = model.activeSnapshot ?? liveSnapshot;
            return {
                paused: true,
                pausedTick: snapshotToHold?.tick ?? null,
                scrubTick: current.scrubTick,
                pausedSnapshot: snapshotToHold
            };
        });
    };
    const scrubTo = (tick: number): void => {
        setInteraction(current => ({
            ...current,
            scrubTick: tick
        }));
    };

    return (
        <section
            className={className}
            aria-label="Cymatic transport"
            data-cymatic-transport
            data-cache-state={model.cacheState}
            data-active-tick={activeTick ?? ''}
            data-selected-tick={model.selectedTick ?? ''}
            data-audio-output="none"
        >
            <div className="m2-cymatic-transport__toolbar" role="toolbar" aria-label="Cymatic tick controls">
                <button
                    type="button"
                    className="m2-cymatic-transport__button"
                    aria-pressed={model.paused}
                    aria-label={model.paused ? 'Resume live cymatic surface' : 'Pause cymatic surface at current tick'}
                    onClick={pauseOrResume}
                >
                    {model.paused ? 'Resume' : 'Pause'}
                </button>
                {model.pausedTick !== null && (
                    <span
                        className="m2-cymatic-transport__paused-badge"
                        data-paused-tick-badge={model.pausedTick}
                        aria-live="polite"
                    >
                        Paused tick {model.pausedTick}
                    </span>
                )}
                {model.cacheState === 'pending-tick-snapshot-cache' && (
                    <span className="m2-cymatic-transport__pending" data-pending-tick-snapshot-cache>
                        pending-tick-snapshot-cache
                    </span>
                )}
            </div>

            <div
                className="m2-cymatic-transport__scrubber"
                data-scrubber-disabled={model.scrubberDisabled ? 'true' : 'false'}
            >
                <label className="m2-cymatic-transport__label" htmlFor="m2-cymatic-transport-range">
                    Scrub-to-tick
                </label>
                <input
                    id="m2-cymatic-transport-range"
                    type="range"
                    min={model.oldestTick ?? rangeValue}
                    max={model.newestTick ?? rangeValue}
                    step={1}
                    value={rangeValue}
                    disabled={model.scrubberDisabled}
                    aria-label="Scrub cymatic surface to tick"
                    aria-valuetext={`tick ${rangeValue}`}
                    onChange={event => scrubTo(Number(event.currentTarget.value))}
                />
                <span className="m2-cymatic-transport__tick-readout" aria-live="polite">
                    tick {activeTick ?? 'pending'}
                </span>
                <div className="m2-cymatic-transport__snapshot-bar" aria-label="Tick-snapshot cache window">
                    {model.tickSnapshots.map(snapshot => (
                        <span
                            key={snapshot.tick}
                            className="m2-cymatic-transport__tick"
                            data-history-tick={snapshot.tick}
                            data-active={snapshot.tick === activeTick ? 'true' : 'false'}
                        />
                    ))}
                    {model.kleinFlipTicks.map(tick => (
                        <button
                            key={tick}
                            type="button"
                            className="m2-cymatic-transport__klein-marker"
                            data-klein-flip-marker={tick}
                            aria-label={`Scrub to Klein-flip tick ${tick}`}
                            onClick={() => scrubTo(tick)}
                        />
                    ))}
                </div>
            </div>

            <div className="m2-cymatic-transport__surface" data-cymatic-surface-held-tick={activeTick ?? ''}>
                {model.activeSnapshot
                    ? props.children?.(model.activeSnapshot) ?? <CymaticSnapshotSummary snapshot={model.activeSnapshot} />
                    : <p className="mext-widget-empty">The cymatic surface is waiting for a profile-tick frame.</p>}
            </div>
        </section>
    );
}

export function buildCymaticTickSnapshot(input: M2CymaticTickSnapshotInput): M2CymaticTickSnapshot {
    return Object.freeze({
        tick: normalizeTick(input.tick),
        packet: input.packet,
        capturedAtMs: input.capturedAtMs ?? 0,
        source: input.source ?? 'kernel-bridge-profile-cache',
        kleinFlip: input.kleinFlip ?? packetHasKleinFlip(input.packet)
    });
}

export function resolveCymaticTransportViewModel(input: CymaticTransportModelInput): CymaticTransportViewModel {
    const history = normalizeHistory(input.tickSnapshots);
    const hasCache = history.length > 0;
    const scrubSnapshot = findSnapshot(history, input.scrubTick ?? null);
    const pausedSnapshot =
        input.pausedSnapshot ??
        findSnapshot(history, input.pausedTick ?? null) ??
        (input.pausedTick !== null && input.pausedTick !== undefined && input.liveSnapshot?.tick === input.pausedTick
            ? input.liveSnapshot
            : null);
    const activeSnapshot = scrubSnapshot ?? (input.paused ? pausedSnapshot : null) ?? input.liveSnapshot;
    const selectedTick = scrubSnapshot?.tick ?? (input.paused ? pausedSnapshot?.tick ?? null : null);
    const pausedTick = input.paused ? pausedSnapshot?.tick ?? input.pausedTick ?? null : null;

    return Object.freeze({
        cacheState: hasCache ? 'ready' : 'pending-tick-snapshot-cache',
        liveSnapshot: input.liveSnapshot,
        activeSnapshot: activeSnapshot ?? null,
        tickSnapshots: Object.freeze(history),
        selectedTick,
        pausedTick,
        paused: input.paused ?? false,
        scrubberDisabled: !hasCache,
        oldestTick: hasCache ? history[0].tick : null,
        newestTick: hasCache ? history[history.length - 1].tick : null,
        kleinFlipTicks: Object.freeze(history.filter(snapshot => snapshot.kleinFlip).map(snapshot => snapshot.tick))
    });
}

function CymaticSnapshotSummary(props: { readonly snapshot: M2CymaticTickSnapshot }): React.ReactElement {
    const frame = props.snapshot.packet.cymaticSignature;
    return (
        <dl className="m2-cymatic-transport__summary" data-cymatic-frame-summary>
            <dt>Held tick</dt>
            <dd>{props.snapshot.tick}</dd>
            <dt>72 address</dt>
            <dd>{frame.address72}</dd>
            <dt>Samples</dt>
            <dd>{frame.sampleCount}</dd>
            <dt>Cache source</dt>
            <dd>{props.snapshot.source}</dd>
        </dl>
    );
}

function normalizeHistory(
    tickSnapshots: readonly M2CymaticTickSnapshot[] | null | undefined
): readonly M2CymaticTickSnapshot[] {
    if (!tickSnapshots?.length) return Object.freeze([]);
    const deduped = new Map<number, M2CymaticTickSnapshot>();
    for (const snapshot of tickSnapshots) {
        deduped.set(normalizeTick(snapshot.tick), snapshot);
    }
    return Object.freeze([...deduped.values()].sort((a, b) => a.tick - b.tick));
}

function findSnapshot(
    snapshots: readonly M2CymaticTickSnapshot[] | null | undefined,
    tick: number | null
): M2CymaticTickSnapshot | null {
    if (tick === null || tick === undefined || !snapshots?.length) return null;
    const normalized = normalizeTick(tick);
    return snapshots.find(snapshot => snapshot.tick === normalized) ?? null;
}

function normalizeTick(tick: number): number {
    return Number.isFinite(tick) ? Math.trunc(tick) : 0;
}

function packetHasKleinFlip(packet: M2PrimeMeaningPacket): boolean {
    const event = packet.kleinFlip.event;
    if (!event || typeof event !== 'object' || Array.isArray(event)) return false;
    const record = event as Readonly<Record<string, unknown>>;
    return record.flip_at_this_tick === true || record.flipAtThisTick === true || record.tick === packet.profileGeneration;
}
