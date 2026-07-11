/**
 * Coordinate: Integrated 1-2-3 (modulation graph — typed frames + carrier contract)
 * Residency: Body/M/pratibimba-app/src/engine/modulation
 * Actualises: Sprint-8 E3 — ONE typed modulation graph. The torus is the
 *   oscillator, the lens system is the modulator, the clock is the temporal
 *   carrier, the profile is the patch. Every surface subscribes to typed
 *   modulation outputs from this graph; no renderer computes or hardcodes its
 *   own state. The carrier contract mirrors the compositionMount shape
 *   (INTEGRATED-1-2-3 §7.3: layer, required inputs, readiness gating, atomic
 *   klein flip §6.5/§7.2), realised app-side as typed frames over one engine.
 * Does NOT own: pitch, codon identity, decan/degree law, lens semantics —
 *   all kernel data arriving on the profile bus. TWO LENS NAMESPACES LAW
 *   (M3'-SPEC): `division` is the 16+1 clock aperture stack (M3_LENS_STACK),
 *   `tonality` is the (lens, mode) 84-state landscape (M2_MEF_LENS 12 × CF 7)
 *   — they are separate modulators here and must never merge.
 */

import {
    ModalResonatorBoundary,
    ModalSilentAnchorBoundary,
    PhaseSpaceBoundary,
    PhaseSpaceFibonacciBoundary,
    QuintessenceBoundary
} from '../../bridge/types';
import { DegradationLevel, LivePlanet, NodalMN } from '../cosmicMath';

/** The modulation outputs a carrier may declare as required. */
export type ModulationInputKey =
    | 'oscillator' // the tick12 × 720 sweep (base clock, tween fraction)
    | 'division' // the active 16+1 clock aperture carrying the tick (E2 engine half)
    | 'tonality' // (lens, mode) 84-state address — kernel-owned, M2_MEF namespace
    | 'codon' // codon rotation projection
    | 'klein' // klein-flip fold state (always available)
    | 'kairos' // live planet sky (Kerykeion cadence, never kernel tick)
    | 'cymatic' // audioOctet + nodalQuartet + resonance72 shell
    | 'quintessence'; // handle-only PASU identity ground (E6)

/** The extracted per-tick view of the harmonic profile the graph modulates
 *  from — one extraction point, every carrier sees the same snapshot. */
export interface HarmonicSnapshot {
    tick12: number | null;
    degree720: number | null;
    degree360: number | null;
    audioOctet: number[] | null;
    nodalQuartet: NodalMN[] | null;
    lensAnchorIndex: number | null;
    codonId: number | null;
    codonRotation: number | null;
    kleinFlip: boolean;
    lensMode: { lens: number; mode: number } | null;
    /** Kernel tonality labels (codonRotationProjection / modalResonator) —
     *  surfaced verbatim, never derived locally (E7). */
    lensLabel: string | null;
    modeName: string | null;
    lensModeIndex: number | null;
    planetDegrees: number[] | null;
    livePlanets: LivePlanet[] | null;
    modalResonator: ModalResonatorBoundary | null;
    phaseSpace: PhaseSpaceBoundary | null;
    quintessence: QuintessenceBoundary | null;
    qCosmic: number[] | null;
    resonance: number | null;
    chromatic: { note?: string; xPrimeNote?: string; mirrorNote?: string } | null;
    degradation: DegradationLevel;
}

/** One profile generation as the graph holds it — the klein fold state is
 *  snapshotted per tick so scrubbed frames carry the valence of THEIR tick. */
export interface TickRecord {
    generation: number;
    hp: HarmonicSnapshot;
    kleinValence: 1 | -1;
    axisFlipped: boolean;
}

export interface OscillatorFrame {
    generation: number;
    tick12: number | null;
    degree720: number | null;
    degree360: number | null;
    /** 0..1 through the current tick — wall-clock live, held/stepped when scrubbing. */
    frac: number;
    /** Continuous double-cover ring angle (radians) — the single orientation primitive. */
    sweepAngle: number;
    live: boolean;
}

export interface DivisionFrame {
    /** Index into the 16 clock apertures (CLOCK_LENSES). */
    index: number;
    name: string;
    slice: number;
    sections: number;
    temporalCanon: boolean;
    segment: number | null;
    degreeInSegment: number | null;
    phase01: number | null;
    /** 'kernel' when phaseSpace.lensCarrier supplied the carried tick;
     *  'local' when arithmetic fallback stood in (pre-E1 gateway). */
    source: 'kernel' | 'local';
    /** The +1 Level-0 aperture — kernel-only (Pisano digit law), never local. */
    fibonacci: PhaseSpaceFibonacciBoundary | null;
    /** Rhythmic gearing of the 1 Hz tick: sections for the temporal-canon
     *  divisions (24/12/4), 1 for the analytic ones. The 60-fold Fibonacci
     *  gearing lands with E7's musical integration. */
    subdivision: number;
}

/** 84-state tonality address — kernel-owned state, surfaced never recomputed
 *  (the profile-at-lens-mode read is the S5.5b Architect decision). The
 *  labels and the 84-index are KERNEL strings/numbers (codonRotationProjection
 *  lensLabel/modeName; modalResonator.lensMode.lensModeIndex) — no local
 *  mode-name or index table exists app-side (E7). */
export interface TonalityFrame {
    lens: number;
    mode: number;
    lensLabel: string | null;
    modeName: string | null;
    lensModeIndex: number | null;
    /** The lens-anchor sounding note (kernel chromatic.note). */
    anchorNote: string | null;
}

export interface CodonFrame {
    codonId: number;
    rotation: number | null;
}

export interface KleinFrame {
    valence: 1 | -1;
    axisFlipped: boolean;
    /** 0..1 during the 200ms atomic fold, >1 when settled. */
    foldProgress: number;
}

/** Planet cadence — advances on Kerykeion time (solar-anchor law, M2'-SPEC),
 *  never tweened by the kernel tick fraction. */
export interface KairosFrame {
    degrees: number[];
    livePlanets: LivePlanet[] | null;
}

export interface CymaticFrame {
    octet: number[];
    quartet: NodalMN[];
    lensAnchorIndex: number;
    /** The modal resonator's five silent positions rendered as the structured
     *  constraint anchors they ARE (E4; null when the kernel contract is
     *  absent — never invented). */
    silentAnchors: readonly ModalSilentAnchorBoundary[] | null;
}

/** The identity ground vs the cosmos (E6): the kernel's handle summary plus
 *  the profile's own q_cosmic and resonance scalar — the renderer compares,
 *  it NEVER computes resonance itself (kernel.rs owns |q_personal·q_cosmic|). */
export interface QuintessenceFrame {
    identity: QuintessenceBoundary;
    qCosmic: number[] | null;
    resonance: number | null;
}

/** One frame of typed modulation output — every carrier at every animation
 *  frame sees this same object (single-subscription atomicity, §7.2). */
export interface ModulationFrame {
    nowMs: number;
    oscillator: OscillatorFrame;
    division: DivisionFrame;
    tonality: TonalityFrame | null;
    codon: CodonFrame | null;
    klein: KleinFrame;
    kairos: KairosFrame | null;
    cymatic: CymaticFrame | null;
    quintessence: QuintessenceFrame | null;
    degradation: DegradationLevel;
}

/** The carrier registration contract — the compositionMount mirror (§7.3).
 *  A carrier declares which modulation inputs it requires; the engine
 *  delivers frames only while all of them are live, and reports the loss
 *  honestly via onUnready (inline degradation, §5.6). */
export interface ModulationCarrier {
    readonly id: string;
    /** Which composed stratum this carrier renders (labelling/inspection). */
    readonly layer?: string;
    /** CCT-2 / DR-IG-5: the parameterisation target a cymatic-class
     *  contribution renders onto. Inside the cosmic composition the M2
     *  cymatic surface is PINNED to the K² torus — a carrier consuming the
     *  `cymatic` mount must declare `'torus'`; plate/sphere belong to the
     *  standalone M2 surface only, never the composition. */
    readonly surface?: 'torus' | 'plate' | 'sphere';
    readonly requiredInputs: readonly ModulationInputKey[];
    /** Called every animation frame while required inputs are live. */
    onFrame(frame: ModulationFrame): void;
    /** Called once per profile generation advance (frac 0 frame). */
    onTick?(frame: ModulationFrame): void;
    /** Called once per klein-flip event — same frame across ALL carriers. */
    onKleinFlip?(frame: ModulationFrame): void;
    /** Called once when a previously-live required input drops. */
    onUnready?(missing: readonly ModulationInputKey[]): void;
}
