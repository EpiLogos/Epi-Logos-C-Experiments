import { describe, expect, it } from 'vitest';
import {
    AudioContextLike,
    createStrikeRouter,
    GainLike,
    InstrumentEngine,
    OscillatorLike,
    useInstrumentStore
} from './instrument';

class FakeParam {
    value = 0;
    history: number[] = [];
    timed: { value: number; startTime: number }[] = [];
    setTargetAtTime(value: number, startTime = 0): void {
        this.value = value;
        this.history.push(value);
        this.timed.push({ value, startTime });
    }
}

class FakeOsc implements OscillatorLike {
    frequency = new FakeParam();
    started = false;
    stopped = false;
    connect(): void {}
    start(): void {
        this.started = true;
    }
    stop(): void {
        this.stopped = true;
    }
}

class FakeGain implements GainLike {
    gain = new FakeParam();
    connect(): void {}
}

class FakeContext implements AudioContextLike {
    currentTime = 0;
    destination = {};
    oscillators: FakeOsc[] = [];
    gains: FakeGain[] = [];
    createOscillator(): OscillatorLike {
        const osc = new FakeOsc();
        this.oscillators.push(osc);
        return osc;
    }
    createGain(): GainLike {
        const gain = new FakeGain();
        this.gains.push(gain);
        return gain;
    }
    async resume(): Promise<void> {}
}

const BUS = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];

describe('instrument engine', () => {
    it('builds 8 voices on start, applies the pending bus, and stays silent until unmuted', () => {
        const ctx = new FakeContext();
        const engine = new InstrumentEngine(() => ctx);
        engine.setBus(BUS); // bus tracked before the graph exists (always-computed law)
        engine.start();
        expect(ctx.oscillators).toHaveLength(8);
        expect(ctx.oscillators.every(o => o.started)).toBe(true);
        expect(ctx.oscillators.map(o => o.frequency.value)).toEqual(BUS);
        // master gain (first created gain) is silent by default
        expect(ctx.gains[0].gain.value).toBe(0);
        engine.setMuted(false);
        expect(ctx.gains[0].gain.history.at(-1)).toBeGreaterThan(0);
        engine.setMuted(true);
        expect(ctx.gains[0].gain.history.at(-1)).toBe(0);
    });

    it('glides voices on each new bus and ignores non-finite pitches', () => {
        const ctx = new FakeContext();
        const engine = new InstrumentEngine(() => ctx);
        engine.start();
        engine.setBus(BUS);
        engine.setBus([440, NaN, -1, 0, 550, 660, 770, 880]);
        expect(ctx.oscillators[0].frequency.value).toBe(440);
        expect(ctx.oscillators[1].frequency.value).toBe(BUS[1]); // NaN ignored
        expect(ctx.oscillators[2].frequency.value).toBe(BUS[2]); // negative ignored
        expect(ctx.oscillators[4].frequency.value).toBe(550);
    });

    it('strike follows kernel role labels and reports the source in the store', () => {
        const ctx = new FakeContext();
        const engine = new InstrumentEngine(() => ctx);
        engine.start();

        // kernel labels with prime moved to carrier 0 — the envelope follows
        // the LABELS, not the positional table
        engine.strike(['prime', 'hum', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue']);
        // gains[0] is the master; voice gains follow. Strike pushes peak then
        // settle per voice: peak = weight * 0.5.
        const voice0Peak = ctx.gains[1].gain.history.at(-2);
        const voice1Peak = ctx.gains[2].gain.history.at(-2);
        expect(voice0Peak).toBeCloseTo(1.0 * 0.5, 9); // prime at carrier 0
        expect(voice1Peak).toBeCloseTo(0.3 * 0.5, 9); // hum at carrier 1
        expect(useInstrumentStore.getState().bellSource).toBe('kernel');

        // no labels → explicit fallback order, honestly reported
        engine.strike(null);
        const fallbackVoice0Peak = ctx.gains[1].gain.history.at(-2);
        expect(fallbackVoice0Peak).toBeCloseTo(0.3 * 0.5, 9); // hum back at 0
        expect(useInstrumentStore.getState().bellSource).toBe('fallback');
    });

    it('gears the strike to the temporal division: sub-pulses ride the prime partial across the tick', () => {
        const ctx = new FakeContext();
        const engine = new InstrumentEngine(() => ctx);
        engine.start();
        const roles = ['hum', 'prime', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue'];
        const primeGain = ctx.gains[2]; // gains[0] is master; prime is voice 1
        const before = primeGain.gain.timed.length;

        engine.strike(roles, 4); // Quadrant gearing: 4 sub-beats per tick
        const events = primeGain.gain.timed.slice(before);
        // main strike (peak + settle) + 3 sub-pulses × (peak + settle)
        expect(events).toHaveLength(8);
        const subPeaks = events.slice(2).filter((_, i) => i % 2 === 0);
        expect(subPeaks.map(e => e.startTime)).toEqual([0.25, 0.5, 0.75]); // audio-clock, in-tick
        expect(subPeaks[0].value).toBeLessThan(events[0].value); // lighter than the strike
        expect(subPeaks[0].value).toBeGreaterThan(0);

        // an analytic division does not gear: no extras beyond the strike pair
        const baseline = primeGain.gain.timed.length;
        engine.strike(roles, 1);
        expect(primeGain.gain.timed.length - baseline).toBe(2);
    });

    it('gears the walked step through the graph (E7): finer apertures walk shorter phrases', () => {
        const ctx = new FakeContext();
        const engine = new InstrumentEngine(() => ctx);
        engine.start();
        const voice = ctx.gains[3].gain; // voice index 2
        engine.pulseVoice(2, 1);
        const slow = voice.timed.slice(-1)[0];
        engine.pulseVoice(2, 24);
        const fast = voice.timed.slice(-1)[0];
        // the return-to-steady is scheduled sooner under finer gearing
        expect(fast.startTime).toBeLessThan(slow.startTime);
        expect(slow.startTime).toBeCloseTo(0.25, 9); // legacy articulation at gearing 1
        expect(fast.startTime).toBeCloseTo(0.25 / 24, 9);
    });
});

describe('strike router (chime is the strike authority when live)', () => {
    const ROLES = ['hum', 'prime', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue'];

    function harness() {
        const strikes: (readonly string[] | null | undefined)[] = [];
        const router = createStrikeRouter({ strike: roles => strikes.push(roles) });
        return { strikes, router };
    }

    it('strikes once per generation — profile first, chime takes over', () => {
        const { strikes, router } = harness();
        // legacy gateway: profile drives
        router.onProfile(1, null);
        expect(strikes).toHaveLength(1);
        // chime contract appears for the same generation → no double strike
        router.onChime(1, ROLES, true);
        expect(strikes).toHaveLength(1);
        // next generation: profile arrives first but the chime now owns the bell
        router.onProfile(2, ROLES);
        expect(strikes).toHaveLength(1);
        router.onChime(2, ROLES, true);
        expect(strikes).toHaveLength(2);
        expect(strikes[1]).toEqual(ROLES);
    });

    it('an incoherent chime blocks the strike instead of faking one', () => {
        const { strikes, router } = harness();
        router.onChime(1, ROLES, true);
        expect(strikes).toHaveLength(1);
        router.onChime(2, ROLES, false); // stale world clock — no strike
        expect(strikes).toHaveLength(1);
        router.onChime(3, ROLES, true);
        expect(strikes).toHaveLength(2);
    });

    it('hands the bell back to the profile route when the chime stream dies', () => {
        const { strikes, router } = harness();
        router.onChime(1, ROLES, true);
        expect(strikes).toHaveLength(1);
        // chime stream dies; profile keeps ticking
        router.onProfile(2, null);
        router.onProfile(3, null);
        expect(strikes).toHaveLength(1); // still waiting within the window
        router.onProfile(4, null);
        expect(strikes).toHaveLength(2); // recovered — profile drives again
        router.onProfile(5, null);
        expect(strikes).toHaveLength(3);
    });
});
