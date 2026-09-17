/**
 * Coordinate: M' M1' (Klein-flip event-strip — Track 22.T22.4 per DR-FACE-7)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #3 Pattern — temporal trace of the shared flip-event grammar.
 * Actualises: the `m1.paramasiva.kleinFlipEventStrip` view body — the
 *   user-visible chronograph of Klein-flip arrivals, distinct from the
 *   `kleinTopology` slot (which reads the static topology invariants). Each new
 *   profile generation carrying the tagged `kleinFlip` event union deposits a glyph
 *   on the event log, anchored to its `tick12`; the canonical tritone crossing
 *   (5→6, observed at tick 6) is styled apart from other transitions; an M1 flip at
 *   a non-tritone tick renders an `unexpected-flip` badge (M1'-SPEC §6). A small
 *   Hopf-fibre flag inverts on every flip — the SU(2) double-cover identity-return
 *   made visible at strip level. Every event is a real bus read; the log is
 *   view-local presentation accumulation seeded on mount, never fabricated.
 * Public surface: M1KleinFlipEventStrip.
 * Owns NO clock: it accumulates on generation advance (per heartbeat), no rAF /
 *   interval. Absence of the vortex is the honest pending state.
 */

import { useEffect, useRef, useState } from 'react';
import { M1KleinFlipEvent, useM1FaceState } from './m1DeepFaceData';

const TWELVEFOLD = 12;
const LOG_CAP = 24;
/** The tritone crossing the flip is supposed to fire at: Lens N ↔ Lens N+3,
 *  the 5→6 boundary observed as it arrives at tick 6 (M1'-SPEC §6). */
const CANONICAL_FLIP_TICKS = new Set([5, 6]);

function isCanonicalFlipTick(tick12: number | null): boolean {
    return tick12 !== null && CANONICAL_FLIP_TICKS.has(tick12);
}

interface FlipEvent {
    readonly generation: number;
    readonly tick12: number | null;
    readonly canonical: boolean;
    readonly event: M1KleinFlipEvent;
}

type VariantFilter = 'all' | 'm1-only' | 'm1-m2';

function isVisible(event: FlipEvent, filter: VariantFilter): boolean {
    if (filter === 'all') return true;
    if (filter === 'm1-only') return event.event.kind === 'm1TritoneCrossing';
    return event.event.kind !== 'm3CodonRotationCross';
}

function eventTone(event: M1KleinFlipEvent): 'm1-gold' | 'm2-indigo' | 'm3-emerald' {
    if (event.kind === 'm1TritoneCrossing') return 'm1-gold';
    return event.kind === 'm2CymaticValenceInvert' ? 'm2-indigo' : 'm3-emerald';
}

function eventDescription(event: M1KleinFlipEvent): string {
    if (event.kind === 'm1TritoneCrossing') {
        return `Lens ${event.lensPair[0]} → Lens ${event.lensPair[1]}`;
    }
    if (event.kind === 'm2CymaticValenceInvert') {
        return `${event.valenceBefore} → ${event.valenceAfter}`;
    }
    return `codon ${event.codonBefore} → ${event.codonAfter}`;
}

export function M1KleinFlipEventStrip() {
    const face = useM1FaceState();
    const generation = face.generation;
    const tick12 = face.tick12;
    const flipEvent = face.kleinFlip;

    const [log, setLog] = useState<readonly FlipEvent[]>([]);
    const [filter, setFilter] = useState<VariantFilter>('all');
    const lastLoggedGen = useRef<number | null>(null);

    // Deposit a glyph once per generation that carries a flip — mirrors the
    // KleinTopologyPane per-generation emit discipline (never per render).
    useEffect(() => {
        if (generation === null || flipEvent === null) {
            return;
        }
        if (lastLoggedGen.current === generation) {
            return;
        }
        lastLoggedGen.current = generation;
        setLog(prev =>
            [
                ...prev,
                {
                    generation,
                    tick12,
                    canonical:
                        flipEvent.kind === 'm1TritoneCrossing' && isCanonicalFlipTick(flipEvent.tick12),
                    event: flipEvent
                }
            ].slice(-LOG_CAP)
        );
    }, [generation, flipEvent, tick12]);

    if (!face.vortex) {
        return (
            <section className="mext-widget-detail" data-testid="m1-klein-flip-strip">
                <h3>Klein-flip event-strip</h3>
                <p className="mext-widget-empty" data-testid="m1-klein-flip-strip-pending">
                    pending-ananda-vortex — flip events chronograph here once the kernel bridge
                    delivers a MathemeHarmonicProfile carrying the vortex projection.
                </p>
            </section>
        );
    }

    const flipCount = log.length;
    const hopfInverted = flipCount % 2 === 1;
    const visibleLog = log.filter(event => isVisible(event, filter));

    return (
        <section className="mext-widget-detail" data-testid="m1-klein-flip-strip">
            <h3>Klein-flip event-strip</h3>
            <div className="pane-toolbar" data-testid="m1-klein-flip-toolbar">
                <span data-testid="m1-klein-flip-current-tick">tick {tick12 ?? '—'} / {TWELVEFOLD - 1}</span>
                <span data-testid="m1-klein-flip-this-tick" data-flip={flipEvent ? 'true' : 'false'}>
                    this-tick flip: {flipEvent ? 'yes' : 'no'}
                </span>
                <span
                    data-testid="m1-klein-flip-hopf-flag"
                    data-inverted={hopfInverted ? 'true' : 'false'}
                    title="Hopf-fibre flag — inverts on every flip (SU(2) double-cover return)"
                >
                    Hopf {hopfInverted ? '↺' : '↻'}
                </span>
            </div>
            <label>
                variants
                <select
                    aria-label="Klein-flip variants"
                    value={filter}
                    onChange={event => setFilter(event.target.value as VariantFilter)}
                >
                    <option value="m1-only">M1 only</option>
                    <option value="m1-m2">M1 + M2</option>
                    <option value="all">all three</option>
                </select>
            </label>
            {/* Twelvefold tick axis with the canonical 5→6 boundary marked. */}
            <div className="spanda-stops" data-testid="m1-klein-flip-axis">
                {Array.from({ length: TWELVEFOLD }, (_, stop) => (
                    <span
                        key={stop}
                        data-testid={`m1-klein-flip-axis-cell-${stop}`}
                        data-active={stop === tick12 ? 'true' : 'false'}
                        data-canonical={CANONICAL_FLIP_TICKS.has(stop) ? 'true' : 'false'}
                    >
                        {stop}
                    </span>
                ))}
            </div>
            {visibleLog.length === 0 ? (
                <p className="mext-widget-empty" data-testid="m1-klein-flip-log-empty">
                    no flip arrivals yet — glyphs land as klein_flip fires on the bus.
                </p>
            ) : (
                <ol className="m1-klein-flip-log" data-testid="m1-klein-flip-log">
                    {visibleLog.map(event => (
                        <li
                            key={event.generation}
                            data-testid={`m1-klein-flip-glyph-gen-${event.generation}`}
                            data-canonical={event.canonical ? 'true' : 'false'}
                            data-tick={event.tick12 ?? ''}
                            data-variant={event.event.kind}
                            data-tone={eventTone(event.event)}
                            title={`flip at tick ${event.tick12 ?? '?'} (gen ${event.generation})`}
                        >
                            <span data-testid="m1-klein-flip-glyph-mark">
                                {event.canonical ? '◆' : '◇'}
                            </span>{' '}
                            {eventDescription(event.event)} · tick {event.tick12 ?? '?'}
                            {event.event.kind === 'm1TritoneCrossing' && !event.canonical ? (
                                <span
                                    className="pending-badge"
                                    data-testid="m1-klein-flip-unexpected"
                                    title="flip fired outside the tritone crossing"
                                >
                                    {' '}
                                    unexpected-flip
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
