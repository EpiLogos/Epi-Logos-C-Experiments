/**
 * Coordinate: M' M2' (element registers + their correspondences — DR-L2-ELEM-2)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position (#n): coordinate-local element registers, and the claims between them.
 * Actualises: the M2 element registers as SEPARATE, coordinate-owned things —
 *   M2-2's Mahābhūta series, M2-1/L2''s alchemical sixfold, M2-3's triplicity —
 *   plus the correspondences that bridge them, and M2-3's own internal laws (the
 *   triplicity identity and the elemental relation of an aspect).
 * Public surface: AlchemicalElement, ALCHEMICAL_ELEMENT_NAMES, alchemicalElementName,
 *   MAHABHUTA_NAMES, MAHABHUTA_TATTVA_BASE, isOperativeElement,
 *   alchemicalFromMahabhuta, mahabhutaFromAlchemical, alchemicalFromTriplicityBranch,
 *   ELEMENT_REGISTER_INVALID, signOfDegree, triplicityOfSign, triplicityOfDegree,
 *   ElementalRelation, elementalRelationOfAspect, elementalRelationBetweenDegrees.
 * Does NOT own: any register's contents (each belongs to its M2 sub-coordinate),
 *   the aspect law (clockFieldOverlay ports `m2_aspect_between` from the kernel),
 *   or element colours (cosmicMath, keyed by the Mahābhūta register).
 * Contract: [[M2-1]] (MEF), [[M2-2]] (36 Tattvas), [[M2-3]] (Decans) +
 *   [[DR-L2-ASPECT-1]], [[DR-L2-ELEM-2]].
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THERE IS NO "THE" ELEMENT ID. This module exists to make that impossible to
 * forget.
 *
 * Several M2 sub-coordinates carry something called an "element", and they are
 * DIFFERENT ONTOLOGIES that share an English word — not one thing in several
 * encodings:
 *
 *   [[M2-2]] 36 Tattvas    — the Mahābhūta series, tattvas 31..35 (m2.c labels
 *                            them "Mahabhutas — the 5 elements"): Ākāśa, Vāyu,
 *                            Agni, Āpas, Pṛthvī. Its order is Śaiva emanation —
 *                            space densifying to earth. Ākāśa is genuinely first.
 *                            Also owns the chakra↔tattva body (the yogic body).
 *   [[M2-1]] MEF/L2'       — the alchemical sixfold: Aether, Earth, Water, Air,
 *                            Fire, Salt. Its order is the opus — nigredo,
 *                            solutio, sublimatio, calcinatio — and Salt is a
 *                            Tria Prima principle, not an element of any other
 *                            system. L2' is ONE lens-family inside M2-1's
 *                            mef_lenses[12][6]; it is not a system-wide authority.
 *   [[M2-3]] Decans        — the zodiacal triplicity: four operative elements
 *                            over twelve signs, with Quintessence as the #2-3-5/0
 *                            sentinel. Also owns the decan↔body-part body (the
 *                            Hermetic medical-astrology body — a DIFFERENT body
 *                            ontology from M2-2's).
 *
 * So a mapping between them is a CORRESPONDENCE — a tradition-bridging claim
 * with content — not a cast. Ākāśa ↔ Aether asserts something. Salt has no
 * Mahābhūta counterpart not because the mapping is "lossy" but because Salt
 * isn't a Mahābhūta at all. Every converter below is therefore partial by
 * nature, and says so.
 *
 * ON THE WIRE. The substrate serialises elements in the alchemical register
 * (DR-37-3, `medicine_frame.rs`, `m_canonical.h`). That is a SERIALISATION
 * CHOICE — one shape is needed on the wire and this is the one that landed. It
 * is NOT a claim that M2-1's lens governs M2-2's tattvas or M2-3's triplicities.
 * Read a wire value as "the alchemical register", never as "the element id".
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Returned when a value has no counterpart in the target register. */
export const ELEMENT_REGISTER_INVALID = 0xff;

// ============================================================================
// [[M2-1]] / L2' — the alchemical register (also the wire encoding).
// ============================================================================

export const AlchemicalElement = Object.freeze({
    AETHER: 0, // L2-0' — Quintessence / Prima Materia
    EARTH: 1, // L2-1' — Nigredo / Fixed Principle
    WATER: 2, // L2-2' — Solutio / Dissolving
    AIR: 3, // L2-3' — Sublimatio / Volatile
    FIRE: 4, // L2-4' — Calcinatio / Transformative Heat
    SALT: 5 // L2-5' — Sal / Diamond Body (Tria Prima body-principle)
} as const);

export type AlchemicalElementId = (typeof AlchemicalElement)[keyof typeof AlchemicalElement];

export const ALCHEMICAL_ELEMENT_NAMES: Readonly<Record<AlchemicalElementId, string>> = Object.freeze(
    {
        [AlchemicalElement.AETHER]: 'Aether',
        [AlchemicalElement.EARTH]: 'Earth',
        [AlchemicalElement.WATER]: 'Water',
        [AlchemicalElement.AIR]: 'Air',
        [AlchemicalElement.FIRE]: 'Fire',
        [AlchemicalElement.SALT]: 'Salt'
    }
);

/** Name of an alchemical-register id, or `null` when it is not one. */
export function alchemicalElementName(element: number): string | null {
    return ALCHEMICAL_ELEMENT_NAMES[element as AlchemicalElementId] ?? null;
}

/**
 * The operative quartet — Earth, Water, Air, Fire (1-4). Aether (0) is the
 * pre-elemental ground and Salt (5) the crystallised return; neither is
 * "operative" in the four-element sense. Mirrors `OPERATIVE_QUARTET_MASK = 0x1E`.
 */
export function isOperativeElement(element: number): boolean {
    return element >= AlchemicalElement.EARTH && element <= AlchemicalElement.FIRE;
}

// ============================================================================
// [[M2-2]] 36 Tattvas — the Mahābhūta register.
//
// m2.c: `/* Mahabhutas — the 5 elements (throughline anchor) */` at tattva
// indices 31..35, so this register IS `tattva_index - MAHABHUTA_TATTVA_BASE`.
// It is the ordering the kernel M2 LUT mirrors carry (`PLANET_ELEMENT_ID`,
// `CHAKRA_ELEMENT_IDS`) and the one `cosmicMath.ELEMENT_COLOURS` is keyed by.
// It is NOT a "legacy" ordering — it is a coordinate-owned series with its own
// semantics, and calling it legacy is what let it be treated as an accident.
// ============================================================================

/** Tattva index of Ākāśa; the Mahābhūta register is `tattva_index - 31`. */
export const MAHABHUTA_TATTVA_BASE = 31;

export const MAHABHUTA_NAMES: readonly string[] = Object.freeze([
    'Akasha', // 0 — tattva 31 — Space
    'Vayu', // 1 — tattva 32 — Air
    'Agni', // 2 — tattva 33 — Fire
    'Apas', // 3 — tattva 34 — Water
    'Prithvi' // 4 — tattva 35 — Earth
]);

// ============================================================================
// CORRESPONDENCES — claims between registers, not casts.
// ============================================================================

/**
 * Mahābhūta ([[M2-2]]) → alchemical ([[M2-1]]/L2').
 *
 * A tradition-bridging claim: the Śaiva mahābhūta are read against the Western
 * classical elements, Ākāśa against Aether/Quintessence. Provenance: the
 * throughline asserted by `m_canonical.h` / `medicine_frame.rs::canonical_from_m2_tattva`
 * (Track 05.T5.16, DR-37-3). It is not an identity — the two series order
 * themselves by different principles (emanation vs. opus).
 */
export function alchemicalFromMahabhuta(mahabhuta: number): number {
    switch (mahabhuta) {
        case 0:
            return AlchemicalElement.AETHER; // Ākāśa
        case 1:
            return AlchemicalElement.AIR; // Vāyu
        case 2:
            return AlchemicalElement.FIRE; // Agni
        case 3:
            return AlchemicalElement.WATER; // Āpas
        case 4:
            return AlchemicalElement.EARTH; // Pṛthvī
        default:
            return ELEMENT_REGISTER_INVALID;
    }
}

/**
 * Alchemical ([[M2-1]]/L2') → Mahābhūta ([[M2-2]]).
 *
 * PARTIAL BY NATURE. Salt has no counterpart because Salt is a Tria Prima
 * body-principle, not a mahābhūta — the Mahābhūta series is not missing a
 * member, it is a different system. Refusing here is the correct answer, not a
 * shortfall.
 */
export function mahabhutaFromAlchemical(alchemical: number): number {
    switch (alchemical) {
        case AlchemicalElement.AETHER:
            return 0; // Ākāśa
        case AlchemicalElement.AIR:
            return 1; // Vāyu
        case AlchemicalElement.FIRE:
            return 2; // Agni
        case AlchemicalElement.WATER:
            return 3; // Āpas
        case AlchemicalElement.EARTH:
            return 4; // Pṛthvī
        default:
            return ELEMENT_REGISTER_INVALID; // Salt — no mahābhūta counterpart
    }
}

/**
 * [[M2-3]] branch-coordinate ordering → alchemical.
 *
 * `#2-3-1 = Fire, #2-3-2 = Earth, #2-3-3 = Air, #2-3-4 = Water,
 * #2-3-5/0 = Quintessence`. These are GRAPH ADDRESSES, never element ids — the
 * coordinate strings are never rewritten by element migration. Total, because
 * M2-3's sixfold and the alchemical sixfold happen to have the same cardinality.
 */
export function alchemicalFromTriplicityBranch(branch: number): number {
    switch (branch) {
        case 0:
            return AlchemicalElement.AETHER;
        case 1:
            return AlchemicalElement.FIRE;
        case 2:
            return AlchemicalElement.EARTH;
        case 3:
            return AlchemicalElement.AIR;
        case 4:
            return AlchemicalElement.WATER;
        case 5:
            return AlchemicalElement.SALT;
        default:
            return ELEMENT_REGISTER_INVALID;
    }
}

// ============================================================================
// [[M2-3]] INTERNAL LAW — the triplicity identity.
//
// This is the Decans system's OWN structure, not an import from another
// coordinate: `decans[4][3][3][2]` groups three signs under each element —
//   Fire  = Aries · Leo · Sagittarius     = signs {0, 4,  8}
//   Earth = Taurus · Virgo · Capricorn    = signs {1, 5,  9}
//   Air   = Gemini · Libra · Aquarius     = signs {2, 6, 10}
//   Water = Cancer · Scorpio · Pisces     = signs {3, 7, 11}
// Those are the residue classes mod 4, so the triplicity is arithmetic rather
// than a table — and the #2-3-{1..4} branch order IS the zodiac's element cycle.
// Results are expressed in the alchemical register because that is the wire
// encoding, NOT because M2-3 defers to M2-1 for its own structure.
// ============================================================================

const TRIPLICITY_CYCLE: readonly number[] = Object.freeze([
    AlchemicalElement.FIRE, // sign ≡ 0 (mod 4)
    AlchemicalElement.EARTH, // sign ≡ 1 (mod 4)
    AlchemicalElement.AIR, // sign ≡ 2 (mod 4)
    AlchemicalElement.WATER // sign ≡ 3 (mod 4)
]);

/** Zodiac sign index (0 = Aries … 11 = Pisces) of an ecliptic degree. */
export function signOfDegree(degree: number): number {
    if (!Number.isFinite(degree)) {
        return ELEMENT_REGISTER_INVALID;
    }
    return Math.floor((((degree % 360) + 360) % 360) / 30);
}

/** M2-3 triplicity element of a zodiac sign, by `sign mod 4`. */
export function triplicityOfSign(sign: number): number {
    if (!Number.isInteger(sign) || sign < 0 || sign > 11) {
        return ELEMENT_REGISTER_INVALID;
    }
    return TRIPLICITY_CYCLE[sign % 4];
}

/** M2-3 triplicity element at an ecliptic degree. */
export function triplicityOfDegree(degree: number): number {
    return triplicityOfSign(signOfDegree(degree));
}

// ============================================================================
// [[M2-3]] INTERNAL LAW — the elemental relation of an aspect (DR-L2-ASPECT-1).
//
// An aspect spans Δ signs. The triplicity cycles with period 4 and the major
// aspects fall at whole-sign distances, so `Δ mod 4` fixes the relation exactly:
//
//   Δ mod 4 = 0 → same element        (conjunction Δ=0, trine Δ=4)
//   Δ mod 4 = 2 → complementary pair  (sextile Δ=2, opposition Δ=6)
//   Δ mod 4 = 3 → cross-pair          (square Δ=3)
//
// An aspect does not HAVE an element; it IS an elemental relation. The relation
// ranges over the operative quartet only — Quintessence (#2-3-5/0) closes the
// four, it is not one of them.
// ============================================================================

export type ElementalRelation = 'same-element' | 'complementary-pair' | 'cross-pair';

const ASPECT_SIGN_SPAN: Readonly<Record<string, number>> = Object.freeze({
    conjunction: 0,
    sextile: 2,
    square: 3,
    trine: 4,
    opposition: 6
});

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
 */
export function elementalRelationOfAspect(aspect: string): ElementalRelation | null {
    const span = ASPECT_SIGN_SPAN[aspect];
    return span === undefined ? null : relationOfSpan(span);
}

export interface AspectElements {
    /** Triplicity element at the first position (alchemical register). */
    readonly elementA: number;
    /** Triplicity element at the second position (alchemical register). */
    readonly elementB: number;
    /** How the two stand to one another. */
    readonly relation: ElementalRelation;
}

/**
 * The full elemental reading of an aspect edge: the element on each side plus
 * the relation between them, from the two ecliptic degrees. Both positions in,
 * a relation out — the shape an aspect actually has.
 */
export function elementalRelationBetweenDegrees(
    degreeA: number,
    degreeB: number
): AspectElements | null {
    const signA = signOfDegree(degreeA);
    const signB = signOfDegree(degreeB);
    const elementA = triplicityOfSign(signA);
    const elementB = triplicityOfSign(signB);
    if (elementA === ELEMENT_REGISTER_INVALID || elementB === ELEMENT_REGISTER_INVALID) {
        return null;
    }
    return { elementA, elementB, relation: relationOfSpan(signA - signB) };
}
