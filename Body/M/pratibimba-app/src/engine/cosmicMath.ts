/**
 * Coordinate: Integrated 1-2-3 (cosmic engine choreography math)
 * Actualises: the pure functions behind the composed K² surface — codon
 *   annulus geometry (INTEGRATED-1-2-3 §5.4), tick-tween orientation (§6.1:
 *   one animation primitive, every frame derived from profile state), and
 *   layer degradation (§5.6). Deterministic under
 *   (tick12, degree720, lens_mode, codon_id) + frame fraction — scrubbable.
 *   The cymatic field law lives in `cymaticField.ts` (Sprint-8 E4 — the
 *   byte-hash-pinned M2' seed-equation reference the shader conforms to;
 *   the pre-E4 approximate twin that lived here was retired with it).
 * Does NOT own: any pitch/codon/correspondence table (profile-only inputs).
 */

export interface NodalMN {
    m: number;
    n: number;
}

/** §5.4: cell n sits at angle n·2π/64 on the equator; flip reverses the axis. */
export function codonAngle(codonId: number, axisFlipped: boolean): number {
    const angle = (codonId / 64) * Math.PI * 2;
    return axisFlipped ? -angle : angle;
}

/** §6.1 tween: continuous ring angle between two profile generations.
 *  frac ∈ [0,1] is elapsed/tick-period; deterministic per (from, to, frac). */
export function orientationAngle(fromDegree720: number, toDegree720: number, frac: number): number {
    let delta = toDegree720 - fromDegree720;
    // unwrap across the 720 boundary (möbius return)
    if (delta < -360) {
        delta += 720;
    } else if (delta > 360) {
        delta -= 720;
    }
    const clamped = Math.max(0, Math.min(1, frac));
    const degree = fromDegree720 + delta * clamped;
    return (degree / 720) * Math.PI * 2 * 2; // double cover: 720° = two turns
}

export type DegradationLevel =
    | 'ready_full'
    | 'ready_no_cymatic'
    | 'ready_no_codon'
    | 'ready_base_only'
    | 'blocked_base_missing';

/** §5.6 layer-by-layer graceful degradation. */
export function degradationLevel(profile: {
    tick12?: unknown;
    degree720?: unknown;
    audioOctet?: unknown;
    nodalQuartet?: unknown;
    codonRotationProjection?: unknown;
    mahamaya?: unknown;
}): DegradationLevel {
    const m1 = typeof profile.tick12 === 'number' && typeof profile.degree720 === 'number';
    if (!m1) {
        return 'blocked_base_missing';
    }
    const m2 = Array.isArray(profile.audioOctet) && Array.isArray(profile.nodalQuartet);
    const m3 = profile.codonRotationProjection != null || profile.mahamaya != null;
    if (m2 && m3) {
        return 'ready_full';
    }
    if (!m2 && m3) {
        return 'ready_no_cymatic';
    }
    if (m2 && !m3) {
        return 'ready_no_codon';
    }
    return 'ready_base_only';
}

/** Bell-partial strike choreography PER ROLE (bell kernel spec §2). The role
 *  LABELS come from the kernel (`modalResonator.bellPartials` — the app
 *  consumes, it does not label); only the attack/decay envelope per role is
 *  renderer choreography. Pitch never appears here. */
export const BELL_ROLE_CHOREOGRAPHY: Readonly<Record<string, { weight: number; decayS: number }>> = {
    hum: { weight: 0.3, decayS: 2.4 },
    prime: { weight: 1.0, decayS: 1.2 },
    tierce: { weight: 0.7, decayS: 0.9 },
    quint: { weight: 0.55, decayS: 1.0 },
    nominal: { weight: 0.9, decayS: 1.6 },
    upper: { weight: 0.5, decayS: 0.5 },
    warble: { weight: 0.4, decayS: 0.7 },
    residue: { weight: 0.35, decayS: 1.9 }
};

/** Explicit FALLBACK role order for gateways that predate the kernel bell
 *  contract — the spec §2 table order, used only when the profile carries no
 *  `modalResonator`. */
export const BELL_FALLBACK_ROLE_ORDER: readonly string[] = [
    'hum',
    'prime',
    'tierce',
    'quint',
    'nominal',
    'upper',
    'warble',
    'residue'
];

export interface BellEnvelope {
    weights: number[];
    decays: number[];
    /** The resolved role-per-voice order the weights/decays follow. */
    order: readonly string[];
    /** 'kernel' when the roles came from the profile/chime contract;
     *  'fallback' when the local spec-order table had to stand in. */
    source: 'kernel' | 'fallback';
}

/** Resolve the strike envelope for the eight carriers from the kernel's
 *  bell-partial role labels. Unknown or malformed role sets fall back to the
 *  spec-order table — honestly reported via `source`. */
export function bellEnvelope(roles: readonly string[] | null | undefined): BellEnvelope {
    const usable =
        Array.isArray(roles) &&
        roles.length === 8 &&
        roles.every(role => role in BELL_ROLE_CHOREOGRAPHY);
    const order = usable ? (roles as readonly string[]) : BELL_FALLBACK_ROLE_ORDER;
    return {
        weights: order.map(role => BELL_ROLE_CHOREOGRAPHY[role].weight),
        decays: order.map(role => BELL_ROLE_CHOREOGRAPHY[role].decayS),
        order,
        source: usable ? 'kernel' : 'fallback'
    };
}

/** Positional views of the fallback choreography (legacy import surface). */
export const BELL_STRIKE_WEIGHTS: readonly number[] = BELL_FALLBACK_ROLE_ORDER.map(
    role => BELL_ROLE_CHOREOGRAPHY[role].weight
);
export const BELL_DECAY_S: readonly number[] = BELL_FALLBACK_ROLE_ORDER.map(
    role => BELL_ROLE_CHOREOGRAPHY[role].decayS
);

// ── The Cosmic Clock strata (cosmic-clock-full-architecture §§2–5) ──────────

/** The 16 sacred division lenses (§4 CLOCK_LENSES — canon-published static
 *  structure; slice×sections always = 360; rows 0/3 and 1/2 are reciprocal
 *  pairs). +1 is Unity's central node. */
export interface ClockLens {
    slice: number;
    sections: number;
    name: string;
    /** The Architect-named temporality structurers (the 24/12/4-section
     *  derived divisions; the 60-fold Fibonacci Ground is primary lens 16
     *  grounding them) — mirrors the kernel's `temporal_canon` flags in
     *  portal-core phase_space.rs `CLOCK_LENSES_16`, pinned by test. */
    temporalCanon: boolean;
}

export const CLOCK_LENSES: readonly ClockLens[] = [
    { slice: 1, sections: 360, name: 'Microscopic', temporalCanon: false },
    { slice: 2, sections: 180, name: 'Binary', temporalCanon: false },
    { slice: 4, sections: 90, name: 'Quaternary', temporalCanon: false },
    { slice: 8, sections: 45, name: 'Octagonal', temporalCanon: false },
    { slice: 9, sections: 40, name: 'Enneadic', temporalCanon: false },
    { slice: 10, sections: 36, name: 'Decan', temporalCanon: false },
    { slice: 12, sections: 30, name: 'Pleromatic', temporalCanon: false },
    { slice: 15, sections: 24, name: 'Hourly', temporalCanon: true },
    { slice: 24, sections: 15, name: 'Expanded Hours', temporalCanon: false },
    { slice: 30, sections: 12, name: 'Solar Month', temporalCanon: true },
    { slice: 36, sections: 10, name: 'Decadic', temporalCanon: false },
    { slice: 40, sections: 9, name: 'Greater Chamber', temporalCanon: false },
    { slice: 45, sections: 8, name: 'Octant', temporalCanon: false },
    { slice: 90, sections: 4, name: 'Quadrant', temporalCanon: true },
    { slice: 180, sections: 2, name: 'Hemisphere', temporalCanon: false },
    { slice: 360, sections: 1, name: 'Unity', temporalCanon: false }
];

/** §4: which segment of lens L a degree falls in — O(1), pure arithmetic. */
export function lensSegment(lensIndex: number, degree: number): number {
    const lens = CLOCK_LENSES[lensIndex % CLOCK_LENSES.length];
    return Math.floor((((degree % 360) + 360) % 360) / lens.slice);
}

/**
 * Canonical mod-10 body order (Earth absent — Earth IS the clock centre).
 * Authority is the KERNEL, not the legacy clock-spec §5.3 comment (which
 * swaps Venus/Mercury — flagged erratum): kairos.rs, aspect.rs and
 * M2_PLANET_LUT all fix Mercury=2, Venus=3.
 */
export const PLANET_ORDER: readonly string[] = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
];

/** The shape `harmonicProfile.livePlanets[i]` arrives in (kernel projection). */
export interface LivePlanet {
    planetId?: number;
    degree?: number;
    fibonacciPosition?: number;
    retrograde?: boolean;
    decan36?: number;
    decanRuler?: number;
    isResonance?: boolean;
    elementId?: number;
    keplerianVel?: number;
}

/**
 * Element_Id → colour-binary hue (Akasha=violet · Vayu=cyan · Agni=vermilion ·
 * Apas=aquamarine · Prithvi=umber, per M2-ARCHITECTURE §5.3.4). The hue values
 * are renderer choreography; the element id underneath is kernel data
 * (`PLANET_ELEMENT_ID`, the M2_PLANET_LUT mirror) — never a local table of
 * planet→element correspondences.
 */
export const ELEMENT_COLOURS: Readonly<Record<number, number>> = {
    0: 0x8f6fd8, // AKASHA — violet
    1: 0x59c2cf, // VAYU — cyan
    2: 0xd8613c, // AGNI — vermilion
    3: 0x63c9a9, // APAS — aquamarine
    4: 0x9b7a4b // PRITHVI — umber
};

const KEP_LOG_MIN = Math.log(14); // Pluto, slowest (M2_PLANET_LUT keplerian_vel)
const KEP_LOG_MAX = Math.log(47270); // Moon, fastest

/**
 * Body radius from the kernel's Keplerian velocity datum: slower (outer)
 * bodies read heavier. Pure, monotonic, bounded — the scale is renderer
 * choreography over the kernel datum, never an invented per-planet size table.
 */
export function planetBodyRadius(keplerianVel: number): number {
    const v = Math.max(1, keplerianVel);
    const norm = Math.min(
        1,
        Math.max(0, (Math.log(v) - KEP_LOG_MIN) / (KEP_LOG_MAX - KEP_LOG_MIN))
    );
    return 0.06 + 0.08 * (1 - norm);
}

/**
 * Resonance-event breath (cosmic-clock §5.2: a planet "at home" in its own
 * decan pulses). Deterministic in wall-time; gentle ~0.8 Hz swell in [1, 1.35].
 */
export function resonancePulse(nowMs: number): number {
    return 1 + 0.35 * (0.5 + 0.5 * Math.sin((nowMs / 1250) * Math.PI * 2));
}

/** Degree → clock-plane angle (0° at top, clockwise like a clock face). */
export function clockAngle(degree: number): number {
    return Math.PI / 2 - (((degree % 360) + 360) % 360) * (Math.PI / 180);
}
