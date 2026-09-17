/**
 * Coordinate: M' (instrument engine — the musical fundament, app side)
 * Actualises: the 8-voice audio face of the kernel's Vimarśa reading.
 *   The kernel computes `audio_octet[8]` every tick (M2-1' law: without the
 *   Vimarśa reading there is no audio, only the cloud); this engine renders
 *   it. Bus state is ALWAYS tracked; the audible graph starts on the first
 *   user unmute (browsers gate AudioContext behind a gesture) and the
 *   analysis path keeps running even when muted again — playback is opt-in,
 *   computation is not (psychoid-cymatic engine §5.2).
 * Does NOT own: pitch (all Hz come from the profile — renderers never invent
 *   frequency), the tick (profile generation is the only clock).
 */

import { create } from 'zustand';
import { bellEnvelope } from '../engine/cosmicMath';

export interface OscillatorLike {
    frequency: { value: number; setTargetAtTime(value: number, startTime: number, timeConstant: number): void };
    connect(node: unknown): void;
    start(): void;
    stop(): void;
}

export interface GainLike {
    gain: { value: number; setTargetAtTime(value: number, startTime: number, timeConstant: number): void };
    connect(node: unknown): void;
}

export interface AudioContextLike {
    currentTime: number;
    destination: unknown;
    createOscillator(): OscillatorLike;
    createGain(): GainLike;
    resume(): Promise<void>;
}

const VOICES = 8;
const MASTER_LEVEL = 0.08;
const GLIDE_S = 0.08;

export class InstrumentEngine {
    private ctx: AudioContextLike | null = null;
    private voices: OscillatorLike[] = [];
    private voiceGains: GainLike[] = [];
    private master: GainLike | null = null;
    private lastBus: number[] | null = null;
    private muted = true;

    constructor(
        private readonly createContext: () => AudioContextLike = () =>
            new (window as unknown as { AudioContext: new () => AudioContextLike }).AudioContext()
    ) {}

    get running(): boolean {
        return this.ctx !== null;
    }

    /** Requires a user gesture the first time (browser autoplay policy). */
    start(): void {
        if (this.ctx) {
            void this.ctx.resume();
            return;
        }
        const ctx = this.createContext();
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        for (let i = 0; i < VOICES; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 1 / VOICES;
            osc.connect(gain);
            gain.connect(master);
            osc.start();
            this.voices.push(osc);
            this.voiceGains.push(gain);
        }
        this.ctx = ctx;
        this.master = master;
        if (this.lastBus) {
            this.setBus(this.lastBus);
        }
        this.applyMute();
    }

    /** Feed the kernel's audio_octet — glides each voice to its new pitch. */
    setBus(audioOctet: number[]): void {
        this.lastBus = audioOctet;
        if (!this.ctx) {
            return;
        }
        for (let i = 0; i < Math.min(VOICES, audioOctet.length); i++) {
            const hz = audioOctet[i];
            if (Number.isFinite(hz) && hz > 0) {
                this.voices[i].frequency.setTargetAtTime(hz, this.ctx.currentTime, GLIDE_S);
            }
        }
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        this.applyMute();
    }

    /** The chime: each tick strikes the bell — per-role attack/decay over the
     *  eight modal carriers. The role labels come from the KERNEL
     *  (`modalResonator.bellPartials`, bell spec §2/§4) — the app consumes
     *  them and only choreographs the envelope; with no kernel roles the
     *  spec-order fallback stands in, reported via the store's `bellSource`.
     *  Envelope only; pitch stays 100% kernel-bus.
     *
     *  `subdivision` is the rhythmic gearing of the tick (Sprint-8 E2 engine
     *  half): the active temporal-canon clock division (4/12/24 sections)
     *  subdivides the 1 s tick with lighter sub-pulses riding the prime
     *  partial — all scheduled on the audio clock at strike time, never a
     *  timer, and the count is kernel lens data through the modulation graph. */
    strike(roles?: readonly string[] | null, subdivision = 1): void {
        const envelope = bellEnvelope(roles);
        useInstrumentStore.getState().setBellSource(envelope.source);
        if (!this.ctx || this.voiceGains.length === 0) {
            return;
        }
        const t = this.ctx.currentTime;
        const rest = 1 / VOICES / 2;
        for (let i = 0; i < this.voiceGains.length; i++) {
            const gain = this.voiceGains[i];
            const peak = (envelope.weights[i] ?? 0.5) * 0.5;
            gain.gain.setTargetAtTime(peak, t, 0.008);
            gain.gain.setTargetAtTime(rest, t + 0.03, (envelope.decays[i] ?? 1) / 3);
        }
        const pulses = Math.max(1, Math.min(60, Math.floor(subdivision)));
        if (pulses > 1) {
            const primeIndex = Math.max(0, envelope.order.indexOf('prime')) % this.voiceGains.length;
            const prime = this.voiceGains[primeIndex];
            const subPeak = (envelope.weights[primeIndex] ?? 0.5) * 0.5 * 0.45;
            const subDecay = Math.min(0.15, 1 / pulses / 3);
            for (let k = 1; k < pulses; k++) {
                const tk = t + k / pulses;
                prime.gain.setTargetAtTime(subPeak, tk, 0.006);
                prime.gain.setTargetAtTime(rest, tk + 0.02, subDecay);
            }
        }
    }

    /** A walked step emphasises one voice (attack + release around its
     *  steady level) — the melody of the walk, pitch still 100% kernel-bus.
     *  E7: the step's ARTICULATION is geared by the active temporal division
     *  through the modulation graph (subdivision from the engine at call
     *  time) — a finer temporal aperture walks in shorter phrases. */
    pulseVoice(index: number, subdivision = 1): void {
        if (!this.ctx || this.voiceGains.length === 0) {
            return;
        }
        const gearing = Math.max(1, Math.min(60, Math.floor(subdivision)));
        const gain = this.voiceGains[index % this.voiceGains.length];
        const t = this.ctx.currentTime;
        const hold = 0.25 / gearing;
        const release = Math.max(0.05, 0.2 / gearing);
        gain.gain.setTargetAtTime(0.6, t, 0.02);
        gain.gain.setTargetAtTime(1 / VOICES, t + hold, release);
    }

    private applyMute(): void {
        if (this.ctx && this.master) {
            this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_LEVEL, this.ctx.currentTime, 0.05);
        }
    }

    dispose(): void {
        for (const voice of this.voices) {
            try {
                voice.stop();
            } catch {
                /* already stopped */
            }
        }
        this.voices = [];
        this.ctx = null;
        this.master = null;
    }
}

export interface InstrumentState {
    muted: boolean;
    running: boolean;
    /** Where the current bell-partial role labels came from — 'kernel' when
     *  the profile/chime contract supplied them, 'fallback' otherwise. */
    bellSource: 'kernel' | 'fallback';
    setMuted(muted: boolean): void;
    setRunning(running: boolean): void;
    setBellSource(bellSource: 'kernel' | 'fallback'): void;
}

export const useInstrumentStore = create<InstrumentState>(set => ({
    muted: true,
    running: false,
    bellSource: 'fallback',
    setMuted: muted => set({ muted }),
    setRunning: running => set({ running }),
    setBellSource: bellSource => set({ bellSource })
}));

export const instrument = new InstrumentEngine();

/** How many generations the profile stream may advance past the last strike
 *  before a silent chime stream is declared dead and the profile route takes
 *  the bell back. */
const CHIME_SILENCE_GENERATIONS = 2;

/** Routes the strike between the two kernel authorities (bell spec §9):
 *  `M123ChimeFrame` is the authority for "what chimed at this tick" — when
 *  the chime stream is live it drives the bell (kernel roles, coherence-
 *  gated: an incoherent frame blocks the strike, never fakes one). Gateways
 *  that predate the chime contract strike on profile arrival instead, and a
 *  chime stream that dies mid-session hands the bell back to the profile
 *  route. Exactly one strike per generation, whichever route fires. */
export function createStrikeRouter(engine: {
    strike(roles?: readonly string[] | null): void;
}): {
    onProfile(generation: number, roles: readonly string[] | null): void;
    onChime(generation: number, roles: readonly string[] | null, coherent: boolean): void;
} {
    let lastGeneration = 0;
    let chimeDriven = false;
    return {
        onProfile(generation, roles) {
            if (chimeDriven && generation > lastGeneration + CHIME_SILENCE_GENERATIONS) {
                chimeDriven = false; // chime stream went silent — recover
            }
            if (chimeDriven || generation <= lastGeneration) {
                return;
            }
            lastGeneration = generation;
            engine.strike(roles);
        },
        onChime(generation, roles, coherent) {
            chimeDriven = true;
            if (generation <= lastGeneration) {
                return;
            }
            lastGeneration = generation;
            if (coherent) {
                engine.strike(roles);
            }
        }
    };
}
