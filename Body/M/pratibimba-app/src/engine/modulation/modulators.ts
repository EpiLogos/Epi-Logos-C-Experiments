/**
 * Coordinate: Integrated 1-2-3 (modulation graph — pure derivations)
 * Residency: Body/M/pratibimba-app/src/engine/modulation
 * Actualises: the pure half of E3 — snapshot extraction from the profile bus
 *   and `deriveFrame`, deterministic under the 5-tuple (tick12, degree720,
 *   lens_mode, codon_id) + frame fraction (INTEGRATED-1-2-3 §6.7) so the
 *   engine is scrubbable: the same (records, controls, frac) always yields
 *   the same frame. Kernel-first law: the carried tick (segment/phase per
 *   division) comes from the kernel's phaseSpace.lensCarrier when present;
 *   local arithmetic is an honest fallback, reported via `source`.
 * Does NOT own: engine state (engine.ts), rendering, pitch, degree law.
 */

import {
    extractPhaseSpace,
    extractQuintessence,
    ModalResonatorBoundary
} from '../../bridge/types';
import {
    CLOCK_LENSES,
    degradationLevel,
    lensSegment,
    LivePlanet,
    NodalMN,
    orientationAngle
} from '../cosmicMath';
import {
    CymaticFrame,
    DivisionFrame,
    HarmonicSnapshot,
    KairosFrame,
    KleinFrame,
    ModulationFrame,
    ModulationInputKey,
    OscillatorFrame,
    TickRecord,
    TonalityFrame
} from './types';

export const TICK_PERIOD_MS = 1000;
export const FLIP_MS = 200;

/** Loose read of the wire profile — the one extraction point. */
interface WireHp {
    tick12?: number;
    degree720?: number;
    degree360?: number;
    audioOctet?: number[];
    nodalQuartet?: NodalMN[];
    resonance72?: { lensAnchorIndex?: number };
    codonRotationProjection?: {
        codonId?: number;
        rotation?: number;
        lensLabel?: string;
        modeName?: string;
    };
    mahamaya?: unknown;
    kleinFlip?: unknown;
    chromatic?: { note?: string; xPrimeNote?: string; mirrorNote?: string };
    lensMode?: { lens?: number; mode?: number };
    planetDegrees?: number[];
    livePlanets?: LivePlanet[];
    kairosMode?: string;
    kairosDecaysAtMs?: number;
    modalResonator?: ModalResonatorBoundary;
    phaseSpace?: unknown;
    quintessence?: unknown;
    qCosmic?: number | number[];
    resonance?: number | null;
}

function wireHp(profile: unknown): WireHp {
    return (
        ((profile as { harmonicProfile?: WireHp } | null)?.harmonicProfile ??
            (profile as WireHp | null)) || {}
    );
}

/** Extract the per-tick snapshot the whole graph modulates from. */
export function harmonicSnapshot(profile: unknown): HarmonicSnapshot {
    const hp = wireHp(profile);
    const octetOk = Array.isArray(hp.audioOctet) && hp.audioOctet.length === 8;
    const quartetOk = Array.isArray(hp.nodalQuartet) && hp.nodalQuartet.length === 4;
    return {
        tick12: typeof hp.tick12 === 'number' ? hp.tick12 : null,
        degree720: typeof hp.degree720 === 'number' ? hp.degree720 : null,
        degree360:
            typeof hp.degree360 === 'number'
                ? hp.degree360
                : typeof hp.degree720 === 'number'
                  ? hp.degree720 % 360
                  : null,
        audioOctet: octetOk ? (hp.audioOctet as number[]) : null,
        nodalQuartet: quartetOk ? (hp.nodalQuartet as NodalMN[]) : null,
        lensAnchorIndex:
            typeof hp.resonance72?.lensAnchorIndex === 'number'
                ? hp.resonance72.lensAnchorIndex
                : null,
        codonId:
            typeof hp.codonRotationProjection?.codonId === 'number'
                ? hp.codonRotationProjection.codonId
                : null,
        codonRotation:
            typeof hp.codonRotationProjection?.rotation === 'number'
                ? hp.codonRotationProjection.rotation
                : null,
        kleinFlip: (hp.kleinFlip ?? null) !== null,
        lensMode:
            typeof hp.lensMode?.lens === 'number' && typeof hp.lensMode?.mode === 'number'
                ? { lens: hp.lensMode.lens, mode: hp.lensMode.mode }
                : null,
        lensLabel:
            typeof hp.codonRotationProjection?.lensLabel === 'string'
                ? hp.codonRotationProjection.lensLabel
                : null,
        modeName:
            typeof hp.codonRotationProjection?.modeName === 'string'
                ? hp.codonRotationProjection.modeName
                : null,
        lensModeIndex:
            typeof hp.modalResonator?.lensMode?.lensModeIndex === 'number'
                ? hp.modalResonator.lensMode.lensModeIndex
                : null,
        planetDegrees: Array.isArray(hp.planetDegrees) ? hp.planetDegrees : null,
        livePlanets: Array.isArray(hp.livePlanets) ? hp.livePlanets : null,
        kairosMode: typeof hp.kairosMode === 'string' ? hp.kairosMode : null,
        kairosDecaysAtMs: typeof hp.kairosDecaysAtMs === 'number' ? hp.kairosDecaysAtMs : null,
        modalResonator: hp.modalResonator ?? null,
        phaseSpace: extractPhaseSpace(hp.phaseSpace),
        quintessence: extractQuintessence(hp.quintessence),
        qCosmic: Array.isArray(hp.qCosmic) && hp.qCosmic.length === 4 ? hp.qCosmic : null,
        resonance: typeof hp.resonance === 'number' ? hp.resonance : null,
        chromatic: hp.chromatic ?? null,
        degradation: degradationLevel(hp)
    };
}

/** Rhythmic gearing law (E2 engine half): the temporal-canon divisions
 *  (24/12/4 sections) subdivide the 1 Hz tick; analytic divisions do not. */
export function rhythmicSubdivision(division: { sections: number; temporalCanon: boolean }): number {
    return division.temporalCanon ? division.sections : 1;
}

/** The active clock aperture carrying the tick — kernel lensCarrier first,
 *  local arithmetic as the honest fallback. */
export function deriveDivision(hp: HarmonicSnapshot, index: number): DivisionFrame {
    const lens = CLOCK_LENSES[index % CLOCK_LENSES.length];
    const kernel = hp.phaseSpace?.lensCarrier[index % CLOCK_LENSES.length] ?? null;
    if (kernel) {
        return {
            index,
            name: kernel.name,
            slice: kernel.slice,
            sections: kernel.sections,
            temporalCanon: kernel.temporalCanon,
            segment: kernel.segment,
            degreeInSegment: kernel.degreeInSegment,
            phase01: kernel.phase01,
            source: 'kernel',
            fibonacci: hp.phaseSpace?.fibonacciGround ?? null,
            subdivision: rhythmicSubdivision(kernel)
        };
    }
    const degree = hp.degree360;
    return {
        index,
        name: lens.name,
        slice: lens.slice,
        sections: lens.sections,
        temporalCanon: lens.temporalCanon,
        segment: degree === null ? null : lensSegment(index, degree),
        degreeInSegment: degree === null ? null : Math.floor(((degree % 360) + 360) % 360) % lens.slice,
        phase01: degree === null ? null : ((((degree % 360) + 360) % 360) % lens.slice) / lens.slice,
        source: 'local',
        fibonacci: null, // Pisano digit law is kernel-only — never derived here
        subdivision: rhythmicSubdivision(lens)
    };
}

export function deriveOscillator(
    cur: TickRecord,
    prev: TickRecord | null,
    frac: number,
    live: boolean
): OscillatorFrame {
    const curDegree = cur.hp.degree720 ?? 0;
    const prevDegree = prev?.hp.degree720 ?? curDegree;
    return {
        generation: cur.generation,
        tick12: cur.hp.tick12,
        degree720: cur.hp.degree720,
        degree360: cur.hp.degree360,
        frac,
        sweepAngle: orientationAngle(prevDegree, curDegree, frac),
        live
    };
}

export function deriveKlein(cur: TickRecord, flipAtMs: number, nowMs: number, live: boolean): KleinFrame {
    return {
        valence: cur.kleinValence,
        axisFlipped: cur.axisFlipped,
        foldProgress: live && flipAtMs >= 0 ? Math.max(0, (nowMs - flipAtMs) / FLIP_MS) : 2
    };
}

export interface EngineControls {
    divisionIndex: number;
    live: boolean;
    tickAtMs: number;
    flipAtMs: number;
}

/** ONE frame of the modulation graph — pure over (cur, prev, controls,
 *  nowMs, frac). Scrub = call with a historical record pair and a held frac. */
export function deriveFrame(
    cur: TickRecord,
    prev: TickRecord | null,
    controls: EngineControls,
    nowMs: number,
    frac: number
): ModulationFrame {
    const hp = cur.hp;
    const tonality: TonalityFrame | null = hp.lensMode
        ? {
              lens: hp.lensMode.lens,
              mode: hp.lensMode.mode,
              lensLabel: hp.lensLabel,
              modeName: hp.modeName,
              lensModeIndex: hp.lensModeIndex,
              anchorNote: hp.chromatic?.note ?? null
          }
        : null;
    const kairos: KairosFrame | null = hp.planetDegrees
        ? {
              degrees: hp.planetDegrees,
              livePlanets: hp.livePlanets ?? null,
              mode: typeof hp.kairosMode === 'string' ? hp.kairosMode : null,
              decaysAtMs: typeof hp.kairosDecaysAtMs === 'number' ? hp.kairosDecaysAtMs : null
          }
        : null;
    const silent = hp.modalResonator?.silentComplement;
    const cymatic: CymaticFrame | null =
        hp.audioOctet && hp.nodalQuartet
            ? {
                  octet: hp.audioOctet,
                  quartet: hp.nodalQuartet,
                  lensAnchorIndex: hp.lensAnchorIndex ?? 0,
                  silentAnchors:
                      Array.isArray(silent) &&
                      silent.length === 5 &&
                      silent.every(anchor => typeof anchor?.pitchClass === 'number')
                          ? silent
                          : null
              }
            : null;
    return {
        nowMs,
        oscillator: deriveOscillator(cur, prev, frac, controls.live),
        division: deriveDivision(hp, controls.divisionIndex),
        tonality,
        codon: hp.codonId !== null ? { codonId: hp.codonId, rotation: hp.codonRotation } : null,
        klein: deriveKlein(cur, controls.flipAtMs, nowMs, controls.live),
        kairos,
        cymatic,
        quintessence: hp.quintessence
            ? { identity: hp.quintessence, qCosmic: hp.qCosmic, resonance: hp.resonance }
            : null,
        degradation: hp.degradation
    };
}

/** Which modulation inputs are live in a frame — the readiness law carriers
 *  are gated on (compositionMount checkReadiness mirror). */
export function availableInputs(frame: ModulationFrame): Set<ModulationInputKey> {
    const available = new Set<ModulationInputKey>(['klein']);
    if (frame.oscillator.degree720 !== null) {
        available.add('oscillator');
    }
    if (frame.division.segment !== null) {
        available.add('division');
    }
    if (frame.tonality !== null) {
        available.add('tonality');
    }
    if (frame.codon !== null) {
        available.add('codon');
    }
    if (frame.kairos !== null) {
        available.add('kairos');
    }
    if (frame.cymatic !== null) {
        available.add('cymatic');
    }
    if (frame.quintessence !== null) {
        available.add('quintessence');
    }
    return available;
}

/** The resolved live-sky tier the carrier displays, after client-side decay. */
export interface KairosTierReadout {
    /** `'kairotic'` = a fresh oracle-consultation capture is preempting the
     *  daily transit; `'realtime'` = the transit; `null` = no tier on the wire
     *  (the strip's "kairos pending" state owns this). A kairotic capture whose
     *  deadline has passed reads as `'realtime'` here — see below. */
    mode: 'kairotic' | 'realtime' | null;
    /** ms until the kairotic window decays; non-null only for a still-live
     *  kairotic capture. */
    remainingMs: number | null;
    /** Compact strip label, or `null` when there is nothing to show. */
    label: string | null;
}

/** Compact human countdown for the kairotic decay window: `3h05m`, `47m`,
 *  `<1m`. Floors to whole minutes — the strip refreshes on the profile tick,
 *  not per-second, so sub-minute precision would only flicker. */
export function formatKairosCountdown(remainingMs: number): string {
    const totalMin = Math.floor(remainingMs / 60_000);
    if (totalMin <= 0) {
        return '<1m';
    }
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}h${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** The kairotic-tier strip readout — the carrier endpoint of the kairos
 *  vertical (DR-FIB-3): show WHICH live-sky tier the S3 heartbeat resolved
 *  (kairotic > realtime precedence, mirroring the kernel `m4_planet_degrees_live`)
 *  and, in kairotic mode, the 4h decay countdown. Client-side decay honours the
 *  kernel `m4_planet_degrees_live_at` rule: a kairotic frame whose `decaysAtMs`
 *  has passed reads as realtime here, because the next heartbeat re-resolves the
 *  tier on the wire — the carrier never renders a dead consultation window. */
export function kairosTierReadout(
    snapshot: Pick<HarmonicSnapshot, 'kairosMode' | 'kairosDecaysAtMs'>,
    nowMs: number
): KairosTierReadout {
    const realtime: KairosTierReadout = {
        mode: 'realtime',
        remainingMs: null,
        label: '○ realtime sky'
    };
    if (snapshot.kairosMode === 'kairotic') {
        const remaining =
            typeof snapshot.kairosDecaysAtMs === 'number'
                ? snapshot.kairosDecaysAtMs - nowMs
                : null;
        if (remaining !== null && remaining > 0) {
            return {
                mode: 'kairotic',
                remainingMs: remaining,
                label: `◉ kairotic · decays ${formatKairosCountdown(remaining)}`
            };
        }
        // decayed (or a kairotic tier with no deadline): the sky is realtime now
        return realtime;
    }
    if (snapshot.kairosMode === 'realtime') {
        return realtime;
    }
    return { mode: null, remainingMs: null, label: null };
}

/** The clock tick's Level-0 Fibonacci-Ground reading, straight off the kernel. */
export interface FibonacciGroundReadout {
    /** 0..59 — the tick's ground position (kernel `degree360 / 6`). */
    position: number;
    /** 0..9 — the Pisano-60 Fibonacci digit at that position (`pisano60_digit`). */
    digit: number;
    /** Compact strip label showing the Pisano digit, e.g. `φ3`. */
    label: string;
}

/** Surface the kernel's clock-tick Fibonacci-Ground position + Pisano digit for
 *  the carrier strip. This CONSUMES the bussed `phaseSpace.fibonacciGround` field
 *  (`phase_space.rs`: `position = degree360/6`, `digit = pisano60_digit(position)`)
 *  — it never re-derives the digit locally. `null` when the wire carries no
 *  phase-space (a gateway predating E1); the strip then shows nothing rather than
 *  a fabricated digit. NB the two Sun markers fold their OWN (Sun) degree via
 *  `fibonacciGround.ts` — a distinct quantity from this clock-tick ground, so
 *  they are correctly local, not a duplication of this field. */
export function fibonacciGroundReadout(
    snapshot: Pick<HarmonicSnapshot, 'phaseSpace'>
): FibonacciGroundReadout | null {
    const fib = snapshot.phaseSpace?.fibonacciGround;
    if (!fib) {
        return null;
    }
    return { position: fib.position, digit: fib.digit, label: `φ${fib.digit}` };
}
