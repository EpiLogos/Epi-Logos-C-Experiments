/**
 * Coordinate: M1' traversal timeline — the trajectory ledger (rerun 51.T51.3)
 * Residency: Body/M/pratibimba-app/src/panes/m1Traversal/traversalTimeline.ts
 * Position (#n): #3 — Process: the walk AS MOTION, not as a current-state
 *   readout. "Without it the walk is a position; with it the walk is a path."
 * Actualises: [[M1'-SPEC]] §2's "Traversal timeline showing the active tick,
 *   position6, helix face, degree720, and relation movement of the walk in
 *   progress" — specced in canon, scheduled in no track until 51.T51.3.
 *
 *   THE RECORDER IS SHELL-LEVEL, NOT VIEW-LEVEL, and that is the whole point.
 *   FlexLayout renders only the selected tab, so a timeline that recorded from
 *   its own mount effect would record exactly the ticks during which nobody
 *   was walking. `startTraversalRecorder()` subscribes to the same two stores
 *   `WalkPane` reads — the tick store and the coordinate store — so the
 *   trajectory outlives the view, and the surface renders a path that was
 *   really travelled rather than the samples it happened to be watching.
 *
 *   THE CROSSING IS READ OFF ADJACENT TICKS, AND THAT CONSTRAINT IS REAL.
 *   The profile heartbeat runs at 1 Hz while the spanda oscillator runs at
 *   `rateHz` (cited default 2.5 Hz, one tick every 1/rateHz s), so a FLOWING
 *   stream is ALIASED: consecutive heartbeat samples are ~2.5 ticks apart and
 *   the walk never appears to pass through 11 → 0 at all. Reconstructing the
 *   skipped stops would mean re-deriving kernel phase law client-side, and
 *   inventing samples nobody observed; both are refused.
 *
 *   So a crossing is marked only on a genuinely ADJACENT step — which is
 *   exactly what the WALK is. `m1.spanda.hold` parks the anchor (phase
 *   constant, `mode` held/walking) and `m1.spanda.step` / `walk_to` move
 *   `tick12` by one, so the walk in progress produces the real adjacencies.
 *   The two named events are canon's own, verbatim from
 *   `SpandaNavigatorPane::nextEventLabel`: `tick12 5 → 6` is the Klein flip,
 *   `tick12 11 → 0` is the Möbius return — the enharmonic P5 → P0' flip the
 *   spec asks to SEE rather than smooth over. A free-flowing sample that
 *   happens to land on 0 after 11 is NOT marked: the anchor's own `mode` says
 *   whether a step was walked or merely observed, and this ledger says which
 *   it recorded rather than guessing.
 * Public surface: TRAVERSAL_TIMELINE_CAPACITY, TraversalCrossing,
 *   TraversalSampleInput, TraversalSample, TraversalTimelineSnapshot,
 *   helixSheetFor, crossingBetween, recordTraversalSample,
 *   traversalTimelineSnapshot, subscribeTraversalTimeline, useTraversalTimeline,
 *   resetTraversalTimeline, readTraversalSampleInput, startTraversalRecorder.
 * Does NOT own: the tick store (`state/stores.ts`), the M1 tuple reader
 *   (`panes/m1SurfaceDispatch.tsx::readM1SharedState` — reused verbatim), the
 *   walk itself (`panes/WalkPane.tsx`), or the rendering.
 * Contract: [[M1'-SPEC]] §2 · rerun tranche [[51.T51.3]].
 */

import { useSyncExternalStore } from 'react';
import { useCoordinateStore, useTickStore } from '../../state/stores';
import { readM1SharedState } from '../m1SurfaceDispatch';
import { readSpandaAnchor, type KernelBridgeCachedProfile } from '../../bridge/types';

/** How many samples the trajectory keeps. The precedent is the Klein-flip
 *  strip's `LOG_CAP = 24`; a traversal needs more room than a flip log. */
export const TRAVERSAL_TIMELINE_CAPACITY = 128;

/** The two named crossings of the M1 cycle, or none. */
export type TraversalCrossing = 'klein-flip' | 'mobius-return' | null;

/** The anchor's transport mode — `flowing` is free oscillation (an aliased
 *  observation), `held`/`walking` is the walk in progress (exact steps). */
export type TraversalTransportMode = 'flowing' | 'held' | 'walking' | null;

/** One reading of the live walk state — every field a verbatim window. */
export interface TraversalSampleInput {
    readonly generation: number | null;
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly degree720: number | null;
    /** `harmonicProfile.helix` — `bimba` / `pratibimba`, the helix FACE. */
    readonly helixFace: string | null;
    /** The walk's current coordinate (`useCoordinateStore.selected`). */
    readonly coordinate: string | null;
    /** `spanda.mode` — whether this tick was WALKED or merely observed. */
    readonly mode: TraversalTransportMode;
    readonly atMs: number;
}

export interface TraversalSample extends TraversalSampleInput {
    readonly seq: number;
    /** 0 = first half-turn (tick12 0-5), 1 = second (6-11); null when unknown. */
    readonly helixSheet: 0 | 1 | null;
    readonly crossing: TraversalCrossing;
    /** Set when the coordinate moved between this sample and the previous. */
    readonly relationMovement: Readonly<{ from: string | null; to: string | null }> | null;
}

export interface TraversalTimelineSnapshot {
    readonly revision: number;
    readonly samples: readonly TraversalSample[];
}

const EMPTY: TraversalTimelineSnapshot = Object.freeze({
    revision: 0,
    samples: Object.freeze([]) as readonly TraversalSample[]
});

let snapshot: TraversalTimelineSnapshot = EMPTY;
let nextSeq = 1;
const listeners = new Set<() => void>();

/** Which half-turn of the 12-tick cycle a tick sits on. The 0-5 / 6-11 split
 *  is the SAME boundary `SpandaNavigatorPane` calls the Klein flip (5→6). */
export function helixSheetFor(tick12: number | null): 0 | 1 | null {
    if (tick12 === null || !Number.isInteger(tick12) || tick12 < 0 || tick12 > 11) {
        return null;
    }
    return tick12 >= 6 ? 1 : 0;
}

/**
 * The crossing between two consecutive samples.
 *
 * Marked ONLY on an adjacent `tick12` step that the walk actually took: the
 * 1 Hz heartbeat aliases a `rateHz` oscillator, so a FLOWING pair that reads
 * 11 then 0 skipped most of a turn and did not cross anything observably.
 * `mode` is the discriminator the anchor already publishes — a walked step is
 * `held`/`walking` on both sides, phase parked, tick moved by exactly one.
 */
export function crossingBetween(
    previous: Pick<TraversalSample, 'tick12' | 'mode'> | null,
    next: Pick<TraversalSample, 'tick12' | 'mode'>
): TraversalCrossing {
    if (!previous || previous.tick12 === null || next.tick12 === null) {
        return null;
    }
    const walked =
        (previous.mode === 'held' || previous.mode === 'walking')
        && (next.mode === 'held' || next.mode === 'walking');
    if (!walked) {
        return null;
    }
    if (previous.tick12 === 5 && next.tick12 === 6) {
        return 'klein-flip';
    }
    if (previous.tick12 === 11 && next.tick12 === 0) {
        return 'mobius-return';
    }
    return null;
}

function sameReading(sample: TraversalSample, input: TraversalSampleInput): boolean {
    return (
        sample.tick12 === input.tick12
        && sample.position6 === input.position6
        && sample.degree720 === input.degree720
        && sample.helixFace === input.helixFace
        && sample.coordinate === input.coordinate
        && sample.mode === input.mode
    );
}

function notify(): void {
    for (const listener of [...listeners]) {
        listener();
    }
}

/**
 * Append one sample. A reading identical to the last one is DROPPED — a
 * trajectory is a record of movement, and a store notification that changed
 * nothing observable is not movement. Returns the appended sample, or null.
 */
export function recordTraversalSample(input: TraversalSampleInput): TraversalSample | null {
    const previous = snapshot.samples[snapshot.samples.length - 1] ?? null;
    if (previous && sameReading(previous, input)) {
        return null;
    }
    const helixSheet = helixSheetFor(input.tick12);
    const sample: TraversalSample = Object.freeze({
        ...input,
        seq: nextSeq,
        helixSheet,
        crossing: crossingBetween(previous, { tick12: input.tick12, mode: input.mode }),
        relationMovement:
            previous && previous.coordinate !== input.coordinate
                ? Object.freeze({ from: previous.coordinate, to: input.coordinate })
                : null
    });
    nextSeq += 1;
    const samples = [...snapshot.samples, sample].slice(-TRAVERSAL_TIMELINE_CAPACITY);
    snapshot = Object.freeze({ revision: snapshot.revision + 1, samples: Object.freeze(samples) });
    notify();
    return sample;
}

export function traversalTimelineSnapshot(): TraversalTimelineSnapshot {
    return snapshot;
}

export function subscribeTraversalTimeline(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useTraversalTimeline(): TraversalTimelineSnapshot {
    return useSyncExternalStore(
        subscribeTraversalTimeline,
        traversalTimelineSnapshot,
        traversalTimelineSnapshot
    );
}

/** Tests only — the trajectory is process-global by design (one walk). */
export function resetTraversalTimeline(): void {
    snapshot = EMPTY;
    nextSeq = 1;
    notify();
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Read one sample off the live stores. `tick12`/`position6`/`generation` come
 * from the M1 tuple reader `m1SurfaceDispatch` already owns — one parser
 * ontology. `degree720` and `helix` are read off the same `harmonicProfile ??
 * payload` root the sibling windows unwrap; no reader exports the helix face
 * today (`CosmicFace` picks it inline), so this is its first named window.
 */
export function readTraversalSampleInput(
    cached: KernelBridgeCachedProfile | null,
    coordinate: string | null,
    atMs: number
): TraversalSampleInput {
    const shared = readM1SharedState(cached);
    const payload = (cached?.profile ?? null) as Record<string, unknown> | null;
    const root =
        ((payload as { harmonicProfile?: unknown } | null)?.harmonicProfile as
            | Record<string, unknown>
            | undefined) ?? payload;
    // The ANCHOR is the tick authority (02.T2.14 / DR-M1-5): the wire carries
    // the anchor, and `readSpandaAnchor` is the one boundary reader for it. Its
    // `tick12` is the readout at emission, which under a parked (held/walking)
    // anchor is exact and stable — precisely the walk this timeline records.
    const anchor = readSpandaAnchor(payload);
    return Object.freeze({
        generation: shared.generation,
        tick12: anchor ? anchor.tick12 : shared.tick12,
        position6: shared.position6,
        degree720: num(root?.degree720),
        helixFace: text(root?.helix),
        coordinate,
        mode: anchor ? anchor.mode : null,
        atMs
    });
}

/**
 * Start the shell-level recorder. Subscribes to the SAME two stores `WalkPane`
 * reads, so every tick advance and every relation step is recorded whether or
 * not the timeline surface happens to be the selected tab. One recorder per
 * shell; the returned disposer stops it.
 */
export function startTraversalRecorder(now: () => number = Date.now): () => void {
    const sample = () => {
        const input = readTraversalSampleInput(
            useTickStore.getState().profile,
            useCoordinateStore.getState().selected,
            now()
        );
        // A reading with no tick is not a point on any trajectory — it is the
        // shell before the first profile frame. Recording it would put a row
        // with no tick, no helix face and no degree on the head of every
        // timeline, which reads as a defect rather than as the honest
        // pre-clock state it is. The clock's own birth is the status strip's
        // job (`observedTicks`), not this ledger's.
        if (input.tick12 === null) {
            return;
        }
        recordTraversalSample(input);
    };
    sample();
    const stopTick = useTickStore.subscribe(sample);
    const stopCoordinate = useCoordinateStore.subscribe(sample);
    return () => {
        stopTick();
        stopCoordinate();
    };
}
