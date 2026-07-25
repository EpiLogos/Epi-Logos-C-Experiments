/**
 * Coordinate: M' M3' (L2' canonical element law — DR-L2-ASPECT-1)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position (#n): pure element law over bussed positions.
 * Actualises: the [[L2']] canonical element ordering on the carrier side, the
 *   [[M2-3]] triplicity identity (`element_of(sign) = sign mod 4`), and the
 *   elemental RELATION of an aspect (`Δ mod 4`). The TS counterpart of
 *   `Body/S/S0/epi-lib/include/m_canonical.h` — same orderings, same
 *   conversions, one law on both sides of the wire.
 * Public surface: CanonicalElement, CANONICAL_ELEMENT_NAMES, isOperativeElement,
 *   canonicalFromM2ElementId, m2ElementIdFromCanonical, canonicalFromM2_3Branch,
 *   signOfDegree, elementOfSign, elementOfDegree, ElementalRelation,
 *   elementalRelationOfAspect, elementalRelationBetweenDegrees.
 * Does NOT own: the aspect law itself (clockFieldOverlay ports `m2_aspect_between`
 *   from the C kernel), element colours (cosmicMath, keyed by the LEGACY m2.h
 *   ordering the bridge emits), or any per-coordinate element assignment — those
 *   arrive from S2 as protected authority.
 * Contract: [[L2']] §"Elemental Relation of Aspects" + [[DR-L2-ASPECT-1]].
 *
 * WHY THIS EXISTS. 24.T24.7 shipped `TarotDecanService.elementForAspect`, a table
 * assigning one element per aspect kind. It was wrong twice: it returned LEGACY
 * m2.h `Element_Id` values where canon requires the L2' ordering, and — the
 * load-bearing error — an aspect does not HAVE an element at all. An aspect is an
 * angular relation between two zodiacal positions, so it carries an elemental
 * RELATION. Asking "which element is a trine?" is a category error, which is
 * exactly why the landing had to invent a table. This module carries the law it
 * should have read.
 */

// ============================================================================
// THE CANONICAL ELEMENT IDS — L2' inner-position ordering.
//
// L2' IS the element-bearing lens: when any coordinate is described as having an
// element, that assignment originates there. Its six inner positions are the ONE
// authoritative ordering for the whole system.
// ============================================================================

export const CanonicalElement = Object.freeze({
    AETHER: 0, // L2-0' — Quintessence / Prima Materia
    EARTH: 1, // L2-1' — Nigredo / Fixed Principle
    WATER: 2, // L2-2' — Solutio / Dissolving
    AIR: 3, // L2-3' — Sublimatio / Volatile
    FIRE: 4, // L2-4' — Calcinatio / Transformative Heat
    SALT: 5 // L2-5' — Sal / Diamond Body (Tria Prima body-principle)
} as const);

export type CanonicalElementId = (typeof CanonicalElement)[keyof typeof CanonicalElement];

export const CANONICAL_ELEMENT_NAMES: Readonly<Record<CanonicalElementId, string>> = Object.freeze({
    [CanonicalElement.AETHER]: 'Aether',
    [CanonicalElement.EARTH]: 'Earth',
    [CanonicalElement.WATER]: 'Water',
    [CanonicalElement.AIR]: 'Air',
    [CanonicalElement.FIRE]: 'Fire',
    [CanonicalElement.SALT]: 'Salt'
});

/** Sentinel for a value with no counterpart in the target ordering (m_canonical.h). */
export const CANONICAL_ELEMENT_INVALID = 0xff;

/**
 * The operative quartet — EARTH, WATER, AIR, FIRE (ids 1-4), the four classical
 * elements that participate in elemental balance and the nucleotide throughline.
 * AETHER (0) is the pre-elemental ground and SALT (5) the crystallised return;
 * neither is "operative" in the four-element sense. Mirrors
 * `OPERATIVE_QUARTET_MASK = 0x1E` in m_canonical.h.
 */
export function isOperativeElement(element: number): boolean {
    return element >= CanonicalElement.EARTH && element <= CanonicalElement.FIRE;
}

// ============================================================================
// LEGACY ORDERING CONVERSIONS — the reason ad-hoc integer maps are forbidden.
// ============================================================================

/**
 * medicine.rs / m2.h `Element_Id` (the ordering the kernel bridge emits, and the
 * one `cosmicMath.ELEMENT_COLOURS` is keyed by): AKASHA=0, VAYU/Air=1, AGNI/Fire=2,
 * APAS/Water=3, PRITHVI/Earth=4. Note it has no SALT — hence the round trip below
 * is lossy in one direction, exactly as m_canonical.h documents.
 */
export function canonicalFromM2ElementId(legacy: number): number {
    switch (legacy) {
        case 0:
            return CanonicalElement.AETHER;
        case 1:
            return CanonicalElement.AIR;
        case 2:
            return CanonicalElement.FIRE;
        case 3:
            return CanonicalElement.WATER;
        case 4:
            return CanonicalElement.EARTH;
        default:
            return CANONICAL_ELEMENT_INVALID;
    }
}

/** Inverse of {@link canonicalFromM2ElementId}. SALT has no m2.h counterpart. */
export function m2ElementIdFromCanonical(canonical: number): number {
    switch (canonical) {
        case CanonicalElement.AETHER:
            return 0;
        case CanonicalElement.AIR:
            return 1;
        case CanonicalElement.FIRE:
            return 2;
        case CanonicalElement.WATER:
            return 3;
        case CanonicalElement.EARTH:
            return 4;
        default:
            return CANONICAL_ELEMENT_INVALID; // SALT
    }
}

/**
 * M2-3 Bimba branch ordering: `#2-3-1 = Fire, #2-3-2 = Earth, #2-3-3 = Air,
 * #2-3-4 = Water, #2-3-5/0 = Aether/Quintessence`. A graph-coordinate convention,
 * never an element ID — the coordinate strings are never rewritten by element
 * migration. Full bijection (it is the only legacy ordering that carries SALT).
 */
export function canonicalFromM2_3Branch(branch: number): number {
    switch (branch) {
        case 0:
            return CanonicalElement.AETHER;
        case 1:
            return CanonicalElement.FIRE;
        case 2:
            return CanonicalElement.EARTH;
        case 3:
            return CanonicalElement.AIR;
        case 4:
            return CanonicalElement.WATER;
        case 5:
            return CanonicalElement.SALT;
        default:
            return CANONICAL_ELEMENT_INVALID;
    }
}

// ============================================================================
// THE TRIPLICITY IDENTITY — sign → element.
//
// M2-3 already carries this as the first index of decans[4][3][3][2]:
//   Fire  = Aries · Leo · Sagittarius     = signs {0, 4,  8}
//   Earth = Taurus · Virgo · Capricorn    = signs {1, 5,  9}
//   Air   = Gemini · Libra · Aquarius     = signs {2, 6, 10}
//   Water = Cancer · Scorpio · Pisces     = signs {3, 7, 11}
// Those are the residue classes mod 4, so the classical triplicity is arithmetic,
// not a table — and the M2-3 branch order IS the zodiac's element cycle.
// ============================================================================

/** M2-3 branch order of the zodiac's element cycle, starting at Aries. */
const TRIPLICITY_CYCLE: readonly number[] = Object.freeze([
    CanonicalElement.FIRE, // sign ≡ 0 (mod 4) — Aries, Leo, Sagittarius
    CanonicalElement.EARTH, // sign ≡ 1 (mod 4) — Taurus, Virgo, Capricorn
    CanonicalElement.AIR, // sign ≡ 2 (mod 4) — Gemini, Libra, Aquarius
    CanonicalElement.WATER // sign ≡ 3 (mod 4) — Cancer, Scorpio, Pisces
]);

/** Zodiac sign index (0 = Aries … 11 = Pisces) of an ecliptic degree. */
export function signOfDegree(degree: number): number {
    if (!Number.isFinite(degree)) {
        return CANONICAL_ELEMENT_INVALID;
    }
    return Math.floor((((degree % 360) + 360) % 360) / 30);
}

/** Canonical element of a zodiac sign, by the triplicity identity `sign mod 4`. */
export function elementOfSign(sign: number): number {
    if (!Number.isInteger(sign) || sign < 0 || sign > 11) {
        return CANONICAL_ELEMENT_INVALID;
    }
    return TRIPLICITY_CYCLE[sign % 4];
}

/** Canonical element at an ecliptic degree. */
export function elementOfDegree(degree: number): number {
    return elementOfSign(signOfDegree(degree));
}

// ============================================================================
// THE ASPECT LAW — an aspect IS an elemental relation.
//
// An aspect spans Δ signs. Element cycles with period 4 and the major aspects
// fall at whole-sign distances, so `Δ mod 4` fixes the relation exactly:
//
//   Δ mod 4 = 0 → same element        (conjunction Δ=0, trine Δ=4)
//   Δ mod 4 = 2 → complementary pair  (sextile Δ=2, opposition Δ=6)
//                 Fire↔Air or Earth↔Water — polar partners, same pairing
//   Δ mod 4 = 3 → cross-pair          (square Δ=3) — the tension
//
// Trine and conjunction coincide because both stay inside one triplicity;
// sextile and opposition coincide because both cross to the complement — they
// differ in polarity, not in element. The relation ranges over the operative
// quartet only: AETHER and SALT frame the wheel and are never an aspect's
// element, matching M2-3's own Quintessence sentinel #2-3-5/0.
// ============================================================================

export type ElementalRelation = 'same-element' | 'complementary-pair' | 'cross-pair';

/** Whole-sign span of each major aspect, in the `ASPECT_KINDS` order. */
const ASPECT_SIGN_SPAN: Readonly<Record<string, number>> = Object.freeze({
    conjunction: 0,
    sextile: 2,
    square: 3,
    trine: 4,
    opposition: 6
});

/** The elemental relation of a signed span, by `Δ mod 4`. */
function relationOfSpan(span: number): ElementalRelation {
    switch (((span % 4) + 4) % 4) {
        case 0:
            return 'same-element';
        case 2:
            return 'complementary-pair';
        default:
            return 'cross-pair';
    }
}

/**
 * The elemental relation a major aspect kind carries. Total over the five major
 * aspects; returns null for anything else rather than inventing a reading.
 *
 * This is the canon-shaped replacement for the withdrawn
 * `TarotDecanService.elementForAspect` — it returns the RELATION, because that is
 * what an aspect carries. For the concrete elements on each side, the two
 * positions are required: see {@link elementalRelationBetweenDegrees}.
 */
export function elementalRelationOfAspect(aspect: string): ElementalRelation | null {
    const span = ASPECT_SIGN_SPAN[aspect];
    return span === undefined ? null : relationOfSpan(span);
}

export interface AspectElements {
    /** Canonical element at the first position. */
    readonly elementA: number;
    /** Canonical element at the second position. */
    readonly elementB: number;
    /** How the two elements stand to one another. */
    readonly relation: ElementalRelation;
}

/**
 * The full elemental reading of an aspect edge: the element on each side plus the
 * relation between them, computed from the two ecliptic degrees. This is the
 * shape an aspect actually has — both positions in, a relation out.
 */
export function elementalRelationBetweenDegrees(
    degreeA: number,
    degreeB: number
): AspectElements | null {
    const signA = signOfDegree(degreeA);
    const signB = signOfDegree(degreeB);
    const elementA = elementOfSign(signA);
    const elementB = elementOfSign(signB);
    if (elementA === CANONICAL_ELEMENT_INVALID || elementB === CANONICAL_ELEMENT_INVALID) {
        return null;
    }
    return { elementA, elementB, relation: relationOfSpan(signA - signB) };
}
