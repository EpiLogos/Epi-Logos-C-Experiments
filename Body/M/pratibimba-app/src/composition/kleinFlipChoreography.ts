/**
 * Coordinate: M'/29 :: Klein-flip three-pole choreography (29.T29.7)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #3 — Process; the composed fold, observable
 * Actualises: 29.T29.7 / Track 07 §7.7 (DR-IG-3) — ONE Klein-flip event folds
 *   all three cosmic poles together, and the composition SAYS SO on the
 *   observability bus.
 * Public surface: ChoreographyPhase, ChoreographyTransition,
 *   nextChoreographyPhase, choreographyTransition,
 *   createKleinFlipChoreographyCarrier, KLEIN_FLIP_CHOREOGRAPHY_CARRIER_ID.
 * Does NOT own: the fold itself (`engine/modulation` — the graph flips valence
 *   and axis atomically and derives `klein.foldProgress`), the event
 *   vocabulary (`compositionEvents.ts`, 29.11), or any pole's geometry.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.7.
 *
 * # What was actually missing
 *
 * The three-pole choreography is already atomic and already timer-free. The
 * modulation graph parses the Klein-flip off the profile, flips valence and
 * rotation axis together, stamps `flipAtMs`, and dispatches ONE frame to every
 * carrier; `deriveKlein` turns that stamp into `foldProgress` (0..1 during the
 * fold, >1 settled) on the rAF loop. So the spec's director-with-three-handles
 * is carried by a different mechanism — one graph, one frame, no per-pole call.
 *
 * What did not exist was the composition SAYING it. 29.11 declared
 * `composition.kleinflip.choreography.start` and `.end` in the event
 * vocabulary, and nothing in the repository emitted either — the same
 * declared-and-never-emitted shape as `portal.vak_eval` and the slot law before
 * 29.2. The Dispatch Trace showed no fold, so nothing could tell whether the
 * three poles moved together or at all.
 *
 * # Why this is a carrier and not a timer
 *
 * `.end` fires when `foldProgress` first crosses 1, observed on the frame that
 * crosses it. No `setTimeout` waits out the 200ms — 15.9's "no parallel
 * animation timer competes" is a law about the fold, and it would be absurd to
 * honour it in the fold and break it in the reporting. The phase machine below
 * is pure, so the emission is testable without a clock at all.
 */

import { emitCompositionEvent } from './compositionEvents';
import type { IntegratedCompositionId } from './integratedReadinessEnvelope';
import type { ModulationCarrier, ModulationFrame } from '../engine/modulation/types';

export const KLEIN_FLIP_CHOREOGRAPHY_CARRIER_ID = 'kleinflip-choreography';

/** `settled` between folds; `folding` while the three poles are mid-fold. */
export type ChoreographyPhase = 'settled' | 'folding';

/** What the phase change means for the observability bus. */
export type ChoreographyTransition = 'start' | 'end' | null;

/** `foldProgress` is 0..1 during the atomic fold and >1 once settled. */
export function nextChoreographyPhase(foldProgress: number): ChoreographyPhase {
    return foldProgress <= 1 ? 'folding' : 'settled';
}

/**
 * The transition between two phases, as an event or nothing.
 *
 * Pure on purpose: the whole emission rule is decidable from two phases, so it
 * is testable without a clock, a frame loop, or a rendered surface.
 */
export function choreographyTransition(
    previous: ChoreographyPhase,
    next: ChoreographyPhase
): ChoreographyTransition {
    if (previous === next) return null;
    return next === 'folding' ? 'start' : 'end';
}

/**
 * A modulation carrier that reports the fold on the composition bus.
 *
 * It renders nothing and mutates nothing — it reads the `klein` input every
 * frame and emits at the two boundaries. Registering it on the graph is what
 * makes the declared event types real.
 */
export function createKleinFlipChoreographyCarrier(
    compositionId: IntegratedCompositionId,
    emit: (event: Parameters<typeof emitCompositionEvent>[0]) => void = emitCompositionEvent
): ModulationCarrier {
    let phase: ChoreographyPhase = 'settled';
    return {
        id: KLEIN_FLIP_CHOREOGRAPHY_CARRIER_ID,
        // No `layer` and no `surface`: those declare which composed stratum a
        // carrier RENDERS, and this one renders nothing. A first cut invented
        // `layer: 'observability'` and the composition contract refused it —
        // strata are `L{n}-{name}` — which took the whole cosmic surface down.
        requiredInputs: ['klein'],
        onFrame(frame: ModulationFrame): void {
            const next = nextChoreographyPhase(frame.klein.foldProgress);
            const transition = choreographyTransition(phase, next);
            phase = next;
            if (transition === null) return;
            emit({
                type:
                    transition === 'start'
                        ? 'composition.kleinflip.choreography.start'
                        : 'composition.kleinflip.choreography.end',
                compositionId,
                timestamp: new Date(frame.nowMs).toISOString(),
                profileGeneration: frame.oscillator.generation,
                payload: Object.freeze({
                    // The three poles the one fold moves — named so the trace
                    // shows WHAT moved together, not merely that something did.
                    poles: Object.freeze(['surface', 'texture', 'cell-state']),
                    kleinValence: frame.klein.valence,
                    axisFlipped: frame.klein.axisFlipped,
                    foldProgress: frame.klein.foldProgress
                })
            });
        }
    };
}
