import { beforeEach, describe, expect, it } from 'vitest';
import { KernelBridgeCachedProfile } from '../../bridge/types';
import { useTickStore } from '../../state/stores';
import { ModulationEngine, registerEngineCommands, useEngineStore } from './engine';
import { ModulationCarrier, ModulationFrame, ModulationInputKey } from './types';

function cached(generation: number, hp: Record<string, unknown>): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { harmonicProfile: { tick12: generation % 12, degree720: generation % 720, ...hp } }
    };
}

class Probe implements ModulationCarrier {
    frames: ModulationFrame[] = [];
    ticks: ModulationFrame[] = [];
    flips: ModulationFrame[] = [];
    unready: (readonly ModulationInputKey[])[] = [];
    constructor(
        readonly id: string,
        readonly requiredInputs: readonly ModulationInputKey[]
    ) {}
    onFrame(frame: ModulationFrame): void {
        this.frames.push(frame);
    }
    onTick(frame: ModulationFrame): void {
        this.ticks.push(frame);
    }
    onKleinFlip(frame: ModulationFrame): void {
        this.flips.push(frame);
    }
    onUnready(missing: readonly ModulationInputKey[]): void {
        this.unready.push(missing);
    }
}

function makeEngine() {
    const rafCallbacks: ((nowMs: number) => void)[] = [];
    let clock = 0;
    const engine = new ModulationEngine(
        cb => {
            rafCallbacks.push(cb);
            return rafCallbacks.length;
        },
        () => undefined,
        () => clock
    );
    return {
        engine,
        fireFrame(nowMs: number) {
            clock = nowMs;
            const pending = rafCallbacks.splice(0, rafCallbacks.length);
            for (const cb of pending) {
                cb(nowMs);
            }
        },
        setClock(nowMs: number) {
            clock = nowMs;
        }
    };
}

beforeEach(() => {
    useTickStore.setState({ profile: null, generation: null });
    useEngineStore.setState({
        divisionIndex: 6,
        paused: false,
        scrubGeneration: null,
        divisionSource: null
    });
});

describe('modulation engine — carriers plug into ONE graph', () => {
    it('gates each carrier on its required inputs and reports the loss once (readiness law)', () => {
        const { engine, setClock } = makeEngine();
        const sky = new Probe('kairos-sky', ['kairos']);
        const torus = new Probe('k2-torus', ['oscillator', 'klein']);
        engine.register(sky);
        engine.register(torus);

        setClock(1000);
        engine.ingestProfile(cached(1, {}), 1000);
        expect(torus.frames).toHaveLength(1); // oscillator+klein live
        expect(sky.frames).toHaveLength(0); // no planet sky — never invented

        engine.ingestProfile(cached(2, { planetDegrees: new Array(10).fill(42) }), 2000);
        expect(sky.frames).toHaveLength(1);
        expect(sky.frames[0].kairos?.degrees[0]).toBe(42);

        engine.ingestProfile(cached(3, {}), 3000);
        expect(sky.frames).toHaveLength(1); // frame withheld again
        expect(sky.unready).toEqual([['kairos']]); // and the loss reported once
        expect(torus.frames).toHaveLength(3);
    });

    it('delivers the SAME frame object to every carrier on a klein flip — atomic across layers', () => {
        const { engine } = makeEngine();
        const a = new Probe('a', ['oscillator']);
        const b = new Probe('b', ['klein']);
        engine.register(a);
        engine.register(b);

        engine.ingestProfile(cached(1, {}), 0);
        engine.ingestProfile(cached(2, { kleinFlip: { kind: 'TritoneMirror' } }), 1000);

        expect(a.flips).toHaveLength(1);
        expect(b.flips).toHaveLength(1);
        expect(a.flips[0]).toBe(b.flips[0]); // one object, one truth
        expect(a.flips[0].klein.valence).toBe(-1);
        expect(a.flips[0].klein.axisFlipped).toBe(true);

        engine.ingestProfile(cached(3, { kleinFlip: { kind: 'MobiusReturn' } }), 2000);
        expect(a.flips[1].klein.valence).toBe(1); // second flip inverts back
    });

    it('fires onTick exactly once per generation and ignores non-monotonic pushes', () => {
        const { engine } = makeEngine();
        const probe = new Probe('p', ['oscillator']);
        engine.register(probe);
        engine.ingestProfile(cached(5, {}), 0);
        engine.ingestProfile(cached(5, {}), 100); // duplicate generation
        engine.ingestProfile(cached(4, {}), 200); // regression
        expect(probe.ticks).toHaveLength(1);
        expect(probe.ticks[0].oscillator.generation).toBe(5);
    });

    it('owns the rAF loop: frames flow to carriers + render hooks, and the visibility gate burns nothing', () => {
        const { engine, fireFrame } = makeEngine();
        const probe = new Probe('p', ['oscillator']);
        engine.register(probe);
        const rendered: ModulationFrame[] = [];
        engine.addRenderHook(frame => rendered.push(frame));

        let visible = true;
        engine.setVisibilityGate(() => visible);
        engine.start();
        engine.ingestProfile(cached(1, {}), 0);
        const baseline = probe.frames.length;

        fireFrame(500);
        expect(probe.frames.length).toBe(baseline + 1);
        expect(rendered).toHaveLength(1);
        expect(probe.frames[probe.frames.length - 1]?.oscillator.frac).toBeCloseTo(0.5);

        visible = false;
        fireFrame(600);
        expect(probe.frames.length).toBe(baseline + 1); // gate closed — no work
        expect(rendered).toHaveLength(1);
        engine.stop();
    });

    it('subscribes ONCE to the tick store and fans out (§7.2 single-subscription law)', () => {
        const { engine } = makeEngine();
        const probe = new Probe('p', ['oscillator']);
        engine.register(probe);
        engine.start();
        useTickStore.getState().setProfile(cached(1, {}));
        useTickStore.getState().setProfile(cached(2, {}));
        expect(probe.ticks.map(f => f.oscillator.generation)).toEqual([1, 2]);
        engine.stop();
        useTickStore.getState().setProfile(cached(3, {}));
        expect(probe.ticks).toHaveLength(2); // stopped — subscription released
    });
});

describe('pause + scrub (§8.8 — load-bearing accessibility)', () => {
    it('pauses at a settled frame, steps back through real history, and resumes to the live edge', () => {
        const { engine, setClock } = makeEngine();
        for (let generation = 1; generation <= 5; generation++) {
            engine.ingestProfile(cached(generation, { degree720: 100 + generation }), generation * 1000);
        }
        setClock(5400);
        engine.pause();
        expect(engine.frame()?.oscillator.generation).toBe(5);
        expect(engine.frame()?.oscillator.frac).toBe(1); // settled, not mid-tween
        expect(useEngineStore.getState().paused).toBe(true);
        expect(useEngineStore.getState().scrubGeneration).toBe(5);

        engine.stepBack();
        engine.stepBack();
        const scrubbed = engine.frame();
        expect(scrubbed?.oscillator.generation).toBe(3);
        expect(scrubbed?.oscillator.degree720).toBe(103); // the RECORD's degree, from history
        expect(useEngineStore.getState().scrubGeneration).toBe(3);

        engine.stepForward();
        expect(engine.frame()?.oscillator.generation).toBe(4);

        // history keeps recording while paused; resume rejoins the live edge
        engine.ingestProfile(cached(6, { degree720: 106 }), 6000);
        expect(engine.frame()?.oscillator.generation).toBe(4); // still scrubbed
        engine.resume();
        expect(engine.frame()?.oscillator.generation).toBe(6);
        expect(useEngineStore.getState().paused).toBe(false);
    });

    it('clamps stepping at both ends of the ring', () => {
        const { engine } = makeEngine();
        engine.ingestProfile(cached(1, {}), 0);
        engine.pause();
        engine.stepForward();
        expect(engine.frame()?.oscillator.generation).toBe(1);
        for (let i = 0; i < 10; i++) {
            engine.stepBack();
        }
        expect(engine.frame()?.oscillator.generation).toBe(1);
    });

    it('scrubbed frames are deterministic — same cursor, same bytes', () => {
        const { engine } = makeEngine();
        for (let generation = 1; generation <= 3; generation++) {
            engine.ingestProfile(cached(generation, { degree720: generation * 7 }), generation * 1000);
        }
        engine.pause();
        engine.stepBack();
        expect(JSON.stringify(engine.frame(9999))).toBe(JSON.stringify(engine.frame(9999)));
    });
});

describe('division gearing (E2 engine half at the engine surface)', () => {
    it('re-gears the instrument subdivision when the division changes: Zodiacal 1 → Quadrant 4 → Hourly 24', () => {
        const { engine } = makeEngine();
        engine.ingestProfile(cached(1, {}), 0);
        expect(engine.divisionIndex).toBe(6); // Zodiacal — analytic, no gearing
        expect(engine.currentSubdivision()).toBe(1);
        engine.setDivisionIndex(13); // Quadrant — temporal canon
        expect(engine.currentSubdivision()).toBe(4);
        engine.setDivisionIndex(7); // Hourly — temporal canon
        expect(engine.currentSubdivision()).toBe(24);
        expect(useEngineStore.getState().divisionIndex).toBe(7);
    });

    it('reports gearing 1 before any profile arrives (nothing invented)', () => {
        const { engine } = makeEngine();
        engine.setDivisionIndex(13);
        expect(engine.currentSubdivision()).toBe(1);
    });

    it('Fibonacci Ground gearing (E7): the +1 aperture overrides at 60 and toggles off cleanly', () => {
        const { engine } = makeEngine();
        engine.ingestProfile(cached(1, {}), 0);
        engine.setDivisionIndex(13); // Quadrant → 4
        expect(engine.currentSubdivision()).toBe(4);
        engine.toggleGroundGearing();
        expect(useEngineStore.getState().groundGearing).toBe(true);
        expect(engine.currentSubdivision()).toBe(60); // the Level-0 aperture as rhythm
        expect(engine.divisionIndex).toBe(13); // NEVER merged into the 16 — division untouched
        engine.toggleGroundGearing();
        expect(engine.currentSubdivision()).toBe(4);
    });
});

describe('command spine', () => {
    it('registers the five engine commands and they drive the engine', () => {
        const { engine } = makeEngine();
        engine.ingestProfile(cached(1, {}), 0);
        const registry: { id: string; run: () => void }[] = [];
        registerEngineCommands(
            {
                register: command => {
                    registry.push(command);
                    return () => undefined;
                }
            },
            engine
        );
        expect(registry.map(c => c.id)).toEqual([
            'engine.pauseToggle',
            'engine.stepBack',
            'engine.stepForward',
            'engine.cycleDivision',
            'engine.toggleGroundGearing'
        ]);
        registry.find(c => c.id === 'engine.pauseToggle')?.run();
        expect(engine.paused).toBe(true);
        registry.find(c => c.id === 'engine.cycleDivision')?.run();
        expect(engine.divisionIndex).toBe(7);
    });
});

describe('cymatic torus pin (16.T16.2 / CCT-2, DR-IG-5)', () => {
    const carrier = (id: string, overrides: Record<string, unknown> = {}) => ({
        id,
        requiredInputs: ['oscillator'] as const,
        onFrame: () => undefined,
        ...overrides
    });

    it('accepts an M2 cymatic contribution pinned to the torus', () => {
        const engine = new ModulationEngine();
        const dispose = engine.register(
            carrier('cct2-torus', {
                requiredInputs: ['cymatic'],
                surface: 'torus'
            }) as never
        );
        dispose();
    });

    it('rejects a standalone plate/sphere cymatic contribution at composition load', () => {
        const engine = new ModulationEngine();
        for (const surface of ['plate', 'sphere', undefined] as const) {
            expect(() =>
                engine.register(
                    carrier(`cct2-${String(surface)}`, {
                        requiredInputs: ['cymatic'],
                        surface
                    }) as never
                )
            ).toThrow(/pinned to the K² torus/);
        }
    });

    it('non-cymatic carriers stay free of the pin — a composition-contract claim, not an M2-domain restriction', () => {
        const engine = new ModulationEngine();
        const dispose = engine.register(
            carrier('cct2-free', { requiredInputs: ['oscillator'] }) as never
        );
        dispose();
    });
});

describe('composition mount-point contract (16.T16.11 / CCT-11)', () => {
    const engine = new ModulationEngine();
    const carrier = (id: string, overrides: Record<string, unknown> = {}) => ({
        id,
        requiredInputs: ['oscillator'] as const,
        onFrame: () => undefined,
        ...overrides
    });

    it('rejects juxtaposition: two carriers claiming one mount id', () => {
        const un = engine.register(carrier('cct11-a') as never);
        expect(() => engine.register(carrier('cct11-a') as never)).toThrow(
            /juxtaposition refused/
        );
        un();
        // after unregister the mount is free again (remount law)
        const again = engine.register(carrier('cct11-a') as never);
        again();
    });

    it('rejects missing mount-points: unknown required inputs refuse at load', () => {
        expect(() =>
            engine.register(carrier('cct11-b', { requiredInputs: ['not-a-mount'] }) as never)
        ).toThrow(/unknown mount-point/);
    });

    it('rejects out-of-domain layer contributions; accepts the composed strata', () => {
        expect(() =>
            engine.register(carrier('cct11-c', { layer: 'sidebar-takeover' }) as never)
        ).toThrow(/out-of-domain layer/);
        const ok = engine.register(carrier('cct11-d', { layer: 'L2-codon' }) as never);
        ok();
    });
});
