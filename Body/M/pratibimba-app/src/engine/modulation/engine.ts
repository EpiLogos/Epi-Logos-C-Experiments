/**
 * Coordinate: Integrated 1-2-3 (modulation engine — the one loop)
 * Residency: Body/M/pratibimba-app/src/engine/modulation
 * Actualises: the stateful half of E3. ONE engine owns: the single profile
 *   subscription fan-out (§7.2 — carriers never subscribe themselves), the
 *   rAF loop (the spec's every-frame cadence — this is choreography over the
 *   kernel tick, never a clock: every frame value derives from profile state
 *   + frame fraction), the klein fold state (atomic across carriers, §6.5),
 *   the 720-tick scrub ring and pause/step (§8.8 — pause + scrub are
 *   load-bearing accessibility), and carrier readiness gating (§5.6).
 * Public surface: ModulationEngine, modulationEngine (singleton),
 *   useEngineStore, registerEngineCommands.
 * Does NOT own: rendering (carriers), pitch (kernel bus), the tick itself
 *   (profile generation is the only clock — pausing pauses CHOREOGRAPHY,
 *   ingestion keeps recording history).
 */

import { create } from 'zustand';
import { KernelBridgeCachedProfile } from '../../bridge/types';
import { useTickStore } from '../../state/stores';
import { CLOCK_LENSES } from '../cosmicMath';
import {
    availableInputs,
    deriveFrame,
    EngineControls,
    harmonicSnapshot,
    TICK_PERIOD_MS
} from './modulators';
import { ModulationCarrier, ModulationFrame, ModulationInputKey, TickRecord } from './types';

/** One full 720° sweep of history (12 minutes at 1 Hz) is scrubbable. */
const RING_CAPACITY = 720;

export interface EngineUiState {
    divisionIndex: number;
    /** E7: the Fibonacci Ground Level-0 aperture as RHYTHM — 60 sub-pulses
     *  per tick. The +1 of the 16+1 law rides BESIDE the division ring,
     *  never inside it (never a 17th lens). */
    groundGearing: boolean;
    paused: boolean;
    /** Generation under the scrub cursor while paused (null = live edge). */
    scrubGeneration: number | null;
    /** Where the carried tick (segment/phase) comes from — 'kernel' when the
     *  E1 phaseSpace projection supplies it, 'local' fallback otherwise. */
    divisionSource: 'kernel' | 'local' | null;
    setDivisionIndex(index: number): void;
    setGroundGearing(groundGearing: boolean): void;
    setPaused(paused: boolean): void;
    setScrubGeneration(generation: number | null): void;
    setDivisionSource(source: 'kernel' | 'local' | null): void;
}

/** React mirror of the engine's control state (the engine is the authority;
 *  the store exists so strips/buttons re-render). */
export const useEngineStore = create<EngineUiState>(set => ({
    divisionIndex: 6, // Zodiacal default
    groundGearing: false,
    paused: false,
    scrubGeneration: null,
    divisionSource: null,
    setDivisionIndex: divisionIndex => set({ divisionIndex }),
    setGroundGearing: groundGearing => set({ groundGearing }),
    setPaused: paused => set({ paused }),
    setScrubGeneration: scrubGeneration => set({ scrubGeneration }),
    setDivisionSource: divisionSource => set({ divisionSource })
}));

interface CarrierEntry {
    carrier: ModulationCarrier;
    ready: boolean;
}

type RafImpl = (callback: (nowMs: number) => void) => number;
type CafImpl = (handle: number) => void;

export class ModulationEngine {
    private records: TickRecord[] = [];
    private carriers = new Map<string, CarrierEntry>();
    private renderHooks = new Set<(frame: ModulationFrame) => void>();
    private visibilityGate: (() => boolean) | null = null;
    private controls: EngineControls = { divisionIndex: 6, live: true, tickAtMs: 0, flipAtMs: -1 };
    private scrubIndex = 0; // records back from the live edge while paused
    private pausedFrac = 1;
    private rafHandle: number | null = null;
    private unsubscribe: (() => void) | null = null;
    private startCount = 0;

    constructor(
        private readonly raf: RafImpl = cb =>
            (globalThis as unknown as { requestAnimationFrame: RafImpl }).requestAnimationFrame(cb),
        private readonly caf: CafImpl = handle =>
            (globalThis as unknown as { cancelAnimationFrame: CafImpl }).cancelAnimationFrame(
                handle
            ),
        private readonly now: () => number = () => performance.now()
    ) {}

    /** Feed one cached profile (monotonic generations only). This is the ONE
     *  subscription point — carriers receive fan-out frames, never the wire. */
    ingestProfile(cached: KernelBridgeCachedProfile, nowMs = this.now()): void {
        const prev = this.records[this.records.length - 1] ?? null;
        if (prev && cached.generation <= prev.generation) {
            return;
        }
        const hp = harmonicSnapshot(cached.profile);
        let valence: 1 | -1 = prev?.kleinValence ?? 1;
        let axisFlipped = prev?.axisFlipped ?? false;
        if (hp.kleinFlip) {
            valence = valence === 1 ? -1 : 1;
            axisFlipped = !axisFlipped;
            this.controls.flipAtMs = nowMs;
        }
        this.records.push({ generation: cached.generation, hp, kleinValence: valence, axisFlipped });
        if (this.records.length > RING_CAPACITY) {
            this.records.shift();
        }
        this.controls.tickAtMs = nowMs;
        if (this.controls.live) {
            const frame = this.frame(nowMs, 0);
            if (frame) {
                useEngineStore.getState().setDivisionSource(frame.division.source);
                this.dispatch(frame, { tick: true, kleinFlip: hp.kleinFlip });
            }
        } else {
            // scrubbing: keep the cursor anchored to the VIEWED tick — the
            // live edge moved one record further away
            this.scrubIndex = Math.min(this.records.length - 1, this.scrubIndex + 1);
            this.syncScrubStore();
        }
    }

    /** The current typed frame — pure over engine state (null before the
     *  first profile). While paused the scrub cursor picks the record pair. */
    frame(nowMs = this.now(), fracOverride?: number): ModulationFrame | null {
        const edge = this.records.length - 1;
        if (edge < 0) {
            return null;
        }
        const index = this.controls.live ? edge : Math.max(0, edge - this.scrubIndex);
        const cur = this.records[index];
        const prev = index > 0 ? this.records[index - 1] : null;
        const frac = this.controls.live
            ? (fracOverride ??
              Math.min(1, Math.max(0, (nowMs - this.controls.tickAtMs) / TICK_PERIOD_MS)))
            : this.pausedFrac;
        return deriveFrame(cur, prev, this.controls, nowMs, frac);
    }

    register(carrier: ModulationCarrier): () => void {
        // CCT-11 (16.T16.11): carrier registration IS the composition
        // mount-point contract — validate at composition load, never at
        // render time. Three laws:
        //  1. no JUXTAPOSITION — two carriers may not claim one mount id;
        //  2. no MISSING mount-points — every required input must be a
        //     known modulation input key;
        //  3. no OUT-OF-DOMAIN contributions — a declared layer must be a
        //     known composed stratum.
        if (this.carriers.has(carrier.id)) {
            throw new Error(
                `composition contract: carrier '${carrier.id}' already mounted — juxtaposition refused (unregister the prior carrier first)`
            );
        }
        const KNOWN_INPUTS = new Set([
            'oscillator', 'division', 'tonality', 'codon',
            'klein', 'kairos', 'cymatic', 'quintessence'
        ]);
        const unknownInput = carrier.requiredInputs.find(input => !KNOWN_INPUTS.has(input));
        if (unknownInput !== undefined) {
            throw new Error(
                `composition contract: carrier '${carrier.id}' requires unknown mount-point '${String(unknownInput)}'`
            );
        }
        // Law 4 (CCT-2 / DR-IG-5, VALIDATED 2026-06-03): the M2 cymatic
        // contribution is pinned to the K² torus inside the composition —
        // a carrier consuming the `cymatic` mount must declare
        // surface 'torus'; a standalone plate/sphere is refused at load.
        if (carrier.requiredInputs.includes('cymatic') && carrier.surface !== 'torus') {
            throw new Error(
                `composition contract: carrier '${carrier.id}' consumes the cymatic mount but declares surface '${String(carrier.surface)}' — the M2 cymatic surface is pinned to the K² torus inside the composition (DR-IG-5); plate/sphere stay standalone-only`
            );
        }
        if (carrier.layer !== undefined && !/^L[0-9]+-[a-z0-9-]+$/i.test(carrier.layer)) {
            throw new Error(
                `composition contract: carrier '${carrier.id}' declares out-of-domain layer '${carrier.layer}' (strata are 'L{n}-{name}')`
            );
        }
        this.carriers.set(carrier.id, { carrier, ready: false });
        return () => {
            this.carriers.delete(carrier.id);
        };
    }

    addRenderHook(hook: (frame: ModulationFrame) => void): () => void {
        this.renderHooks.add(hook);
        return () => {
            this.renderHooks.delete(hook);
        };
    }

    /** Burn-nothing law: when the gate reports hidden, the loop skips work. */
    setVisibilityGate(gate: (() => boolean) | null): void {
        this.visibilityGate = gate;
    }

    /** Start the rAF loop + the single tick-store subscription. Ref-counted:
     *  a component pair mounting/unmounting out of order (pathological saved
     *  layout with two engine tabs) cannot kill the loop for the survivor. */
    start(): void {
        this.startCount++;
        if (this.unsubscribe === null) {
            const cached = useTickStore.getState().profile;
            if (cached) {
                this.ingestProfile(cached);
            }
            this.unsubscribe = useTickStore.subscribe(state => {
                if (state.profile) {
                    this.ingestProfile(state.profile);
                }
            });
        }
        if (this.rafHandle === null) {
            const loop = (nowMs: number) => {
                this.rafHandle = this.raf(loop);
                if (this.visibilityGate && !this.visibilityGate()) {
                    return;
                }
                const frame = this.frame(nowMs);
                if (frame) {
                    this.dispatch(frame, { tick: false, kleinFlip: false });
                    for (const hook of this.renderHooks) {
                        hook(frame);
                    }
                }
            };
            this.rafHandle = this.raf(loop);
        }
    }

    stop(): void {
        this.startCount = Math.max(0, this.startCount - 1);
        if (this.startCount > 0) {
            return;
        }
        if (this.rafHandle !== null) {
            this.caf(this.rafHandle);
            this.rafHandle = null;
        }
        this.unsubscribe?.();
        this.unsubscribe = null;
    }

    setDivisionIndex(index: number): void {
        this.controls.divisionIndex = ((index % CLOCK_LENSES.length) + CLOCK_LENSES.length) % CLOCK_LENSES.length;
        useEngineStore.getState().setDivisionIndex(this.controls.divisionIndex);
    }

    get divisionIndex(): number {
        return this.controls.divisionIndex;
    }

    /** The instrument's rhythmic gearing at strike time (E2 engine half):
     *  read from the CURRENT frame so kernel lensCarrier data gears it when
     *  present, local table otherwise. 1 when no profile has arrived.
     *  E7: the Fibonacci Ground gearing (60 — the +1 Level-0 aperture as
     *  rhythm) OVERRIDES the division when toggled; it rides beside the 16,
     *  never inside them. */
    currentSubdivision(): number {
        if (useEngineStore.getState().groundGearing) {
            return 60;
        }
        return this.frame()?.division.subdivision ?? 1;
    }

    toggleGroundGearing(): void {
        const store = useEngineStore.getState();
        store.setGroundGearing(!store.groundGearing);
    }

    /** §8.8 pause: choreography freezes at a settled frac; history keeps
     *  recording so resume rejoins the live edge. */
    pause(): void {
        if (!this.controls.live) {
            return;
        }
        this.controls.live = false;
        this.scrubIndex = 0;
        this.pausedFrac = 1;
        this.syncScrubStore();
    }

    resume(): void {
        if (this.controls.live) {
            return;
        }
        this.controls.live = true;
        this.scrubIndex = 0;
        this.syncScrubStore();
    }

    togglePause(): void {
        if (this.controls.live) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /** Step one tick back/forward through the ring while paused. */
    stepBack(): void {
        if (this.controls.live) {
            this.pause();
        }
        this.scrubIndex = Math.min(this.records.length - 1, this.scrubIndex + 1);
        this.syncScrubStore();
    }

    stepForward(): void {
        if (this.controls.live) {
            return;
        }
        this.scrubIndex = Math.max(0, this.scrubIndex - 1);
        this.syncScrubStore();
    }

    get paused(): boolean {
        return !this.controls.live;
    }

    private syncScrubStore(): void {
        const store = useEngineStore.getState();
        store.setPaused(!this.controls.live);
        const edge = this.records.length - 1;
        store.setScrubGeneration(
            this.controls.live || edge < 0
                ? null
                : this.records[Math.max(0, edge - this.scrubIndex)].generation
        );
    }

    /** Fan one frame out to every carrier whose required inputs are live —
     *  the same frame object everywhere (atomicity), losses reported once. */
    private dispatch(frame: ModulationFrame, event: { tick: boolean; kleinFlip: boolean }): void {
        const available = availableInputs(frame);
        for (const entry of this.carriers.values()) {
            const missing = entry.carrier.requiredInputs.filter(input => !available.has(input));
            if (missing.length === 0) {
                if (event.tick) {
                    entry.carrier.onTick?.(frame);
                }
                entry.carrier.onFrame(frame);
                if (event.kleinFlip) {
                    entry.carrier.onKleinFlip?.(frame);
                }
                entry.ready = true;
            } else if (entry.ready) {
                entry.ready = false;
                entry.carrier.onUnready?.(missing as readonly ModulationInputKey[]);
            }
        }
    }
}

/** The one modulation graph of the app — carriers plug in, that is what
 *  makes it an engine. */
export const modulationEngine = new ModulationEngine();

interface CommandRegistryLike {
    register(command: { id: string; title: string; run: () => void }): () => void;
}

/** Engine control surface on the command spine. NOTE: the spec's §8.8
 *  cmd-space binding is OS-owned on macOS (Spotlight) — the palette entries
 *  plus the space-key guard in App.tsx stand in; deviation flagged in the
 *  plan/spec write-back. */
export function registerEngineCommands(
    commands: CommandRegistryLike,
    engine: ModulationEngine = modulationEngine
): (() => void)[] {
    return [
        commands.register({
            id: 'engine.pauseToggle',
            title: 'Engine: Pause / resume the choreography (scrub)',
            run: () => engine.togglePause()
        }),
        commands.register({
            id: 'engine.stepBack',
            title: 'Engine: Step one tick back (scrub)',
            run: () => engine.stepBack()
        }),
        commands.register({
            id: 'engine.stepForward',
            title: 'Engine: Step one tick forward (scrub)',
            run: () => engine.stepForward()
        }),
        commands.register({
            id: 'engine.cycleDivision',
            title: 'Engine: Cycle the 16 clock division apertures',
            run: () => engine.setDivisionIndex(engine.divisionIndex + 1)
        }),
        commands.register({
            id: 'engine.toggleGroundGearing',
            title: 'Engine: Toggle Fibonacci Ground gearing (60-fold, the +1 aperture)',
            run: () => engine.toggleGroundGearing()
        })
    ];
}
