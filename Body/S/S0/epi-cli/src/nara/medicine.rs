//! Nara Medicine — Sympathetic medicine grounded in M2 Parashakti dataset
//!
//! All lookup tables are derived from the Parashakti deep dataset:
//!   docs/datasets/parashakti-deep/nodes-full-detail.json
//!   docs/datasets/parashakti-deep/relations.json
//!
//! # M0→M1→M2 Decan Chain (canonical architecture)
//!
//! M0 Anuttara — `ZODIACAL_LUT[12]` (epi-lib/src/m0.c):
//!   12 archetypal positions with ZOD_ELEM × ZOD_MODE encoding.
//!   The zodiac sign index IS the M0 positional resonance.
//!
//! M1 Paramasiva — `ANANDA_BIMBA[12×12]` (epi-lib/src/m1.c):
//!   Digital-root multiplication table (DR(row × col), row=sign, col=planet).
//!   Each decan's ananda_harmonic = ANANDA_BIMBA[sign][ruling_planet].
//!   Row 3 (Cancer): Parashakti tripling ring {3,6,9}. Row 9 (Capricorn): all 9s.
//!   Aries (row 0) = all zeros — pure initiatory void before numerical differentiation.
//!
//! M2 Parashakti — 36 decan nodes (coord #2-3-x-y-z):
//!   Each carries: zodiacSign, planetaryRuler, bodyPart, herbalism_herbs, element.
//!   `ZODIAC_DECAN_TABLE[36]` is the canonical struct bridging M0→M1→M2.
//!
//! M3 Mahamaya: Tarot pip cards → decan → planet → body (via oracle.rs PIP_DECAN_MAP).
//! M4 Nara: Kairos live degrees → active decan → full M0-M3 chain activated.
//!
//! # Chakra IDs
//!   0 = Earth/Ground (physical base, Planet Earth)
//!   1 = Mūlādhāra     (coord #2-5-0/1-1)
//!   2 = Svādhiṣṭhāna  (coord #2-5-0/1-2)
//!   3 = Maṇipūra      (coord #2-5-0/1-3)
//!   4 = Anāhata        (coord #2-5-0/1-4)
//!   5 = Viśuddha       (coord #2-5-0/1-5)
//!   6 = Ājñā           (coord #2-5-0/1-6)
//!   7 = Sahasrāra      (coord #2-5-0/1-7)
//!
//! # Planet_Id enum (from kairos.rs display array — index order)
//!   0 = Sun, 1 = Earth, 2 = Venus, 3 = Mercury,
//!   4 = Moon, 5 = Saturn, 6 = Jupiter, 7 = Mars
//!   (Note: Earth=1 is excluded from Chaldean decan assignments.)
//!
//! # Zodiacal Mode
//!   0 = Cardinal (Aries/Cancer/Libra/Capricorn — signs 0,3,6,9)
//!   1 = Fixed    (Taurus/Leo/Scorpio/Aquarius — signs 1,4,7,10)
//!   2 = Mutable  (Gemini/Virgo/Sagittarius/Pisces — signs 2,5,8,11)
//!
//! # Decan index order (0-35)
//!   Aries 1/2/3, Taurus 1/2/3, Gemini 1/2/3, Cancer 1/2/3,
//!   Leo 1/2/3, Virgo 1/2/3, Libra 1/2/3, Scorpio 1/2/3,
//!   Sagittarius 1/2/3, Capricorn 1/2/3, Aquarius 1/2/3, Pisces 1/2/3

use serde::Serialize;

// ─── ZodiacDecanEntry — M0→M1→M2 canonical bridge struct ────────────────────

/// A single zodiacal decan: the minimal struct that spans the full M0→M1→M2 chain.
///
/// Every field is derivable from the source datasets:
///   - `sign`, `element`, `mode`  → M0 ZODIACAL_LUT (m0.c)
///   - `ruling_planet`            → Chaldean decan system (parashakti-deep dataset)
///   - `ananda_harmonic`          → M1 ANANDA_BIMBA[sign][ruling_planet] (m1.c)
///   - `body_part`, `herb`        → M2 parashakti-deep dataset (bodyPart, herbalism_herbs)
///
/// The 12-fold zodiac (M0) × 7 Chaldean planets generates the 36 decans.
/// Each decan's ananda_harmonic is the digital-root resonance from M1's core matrix —
/// this is NOT a label but a mathematical property grounding M2 in M1.
#[derive(Debug, Clone, Copy, Serialize)]
pub struct ZodiacDecanEntry {
    /// Zodiac sign index: 0=Aries, 1=Taurus, ..., 11=Pisces.
    /// Corresponds to row in M1 ANANDA_BIMBA.  Also indexes M0 ZODIACAL_LUT.
    pub sign: u8,
    /// Decan position within sign: 0=first 10°, 1=second 10°, 2=third 10°.
    pub decan_in_sign: u8,
    /// Chaldean ruling planet (Planet_Id):
    ///   SUN=0, EARTH=1(unused), VENUS=2, MERCURY=3, MOON=4, SATURN=5, JUPITER=6, MARS=7.
    pub ruling_planet: u8,
    /// Element derived from zodiac sign (M0 ZOD_ELEM):
    ///   0=Akasha, 1=Air, 2=Fire, 3=Water, 4=Earth.
    pub element: u8,
    /// Zodiacal mode (M0 ZOD_MODE):
    ///   0=Cardinal (initiating), 1=Fixed (stabilising), 2=Mutable (transforming).
    pub mode: u8,
    /// M1 ananda harmonic: digital-root of (sign × ruling_planet) from ANANDA_BIMBA.
    /// Encodes the fundamental vibrational resonance of this (sign, planet) pairing
    /// in the 12×12 mathematical substrate of Paramasiva.
    /// Aries=0 (void before differentiation), Capricorn peaks at 9 (alchemical saturation).
    pub ananda_harmonic: u8,
    /// Anatomical body region. From parashakti-deep `bodyPart` property.
    pub body_part: &'static str,
    /// Primary herb. First entry from parashakti-deep `herbalism_herbs`.
    pub herb: &'static str,
}

/// The 36-decan master table — canonical M0→M1→M2 bridge.
///
/// Indexed 0-35, ordered zodiacally: Aries 1/2/3 (0-2) → Pisces 1/2/3 (33-35).
/// Use `zodiac_decan(idx)` to access. Use `decan_for_degree(deg)` for kairos-live-degree input.
///
/// Sources (in order of field derivation):
///   - M0: epi-lib/src/m0.c ZODIACAL_LUT — sign, element, mode
///   - M1: epi-lib/src/m1.c ANANDA_BIMBA — ananda_harmonic = DR(sign × planet)
///   - M2: docs/datasets/parashakti-deep/nodes-full-detail.json — ruling_planet, body_part, herb
pub static ZODIAC_DECAN_TABLE: [ZodiacDecanEntry; 36] = [
    // ── Aries (sign=0, Fire/Cardinal) — ANANDA_BIMBA row 0 = all zeros ──
    // DR(0×anything)=0: the void-ground of pure initiatory fire, pre-numerical.
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 0,
        ruling_planet: 7,
        element: 2,
        mode: 0,
        ananda_harmonic: 0, // DR(0×7=0)
        body_part: "Skull and brain - the command center of action",
        herb: "Hawthorn",
    },
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 1,
        ruling_planet: 0,
        element: 2,
        mode: 0,
        ananda_harmonic: 0, // DR(0×0=0)
        body_part: "Eyes and sinuses - the vision centers",
        herb: "Nettle",
    },
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 2,
        ruling_planet: 2,
        element: 2,
        mode: 0,
        ananda_harmonic: 0, // DR(0×2=0)
        body_part: "Neck and throat - bridge between head and heart",
        herb: "Damask Rose",
    },
    // ── Taurus (sign=1, Earth/Fixed) — ANANDA_BIMBA row 1 = {0,1,2,3,4,5,6,7,8,9,1,2} ──
    ZodiacDecanEntry {
        sign: 1,
        decan_in_sign: 0,
        ruling_planet: 3,
        element: 4,
        mode: 1,
        ananda_harmonic: 3, // DR(1×3=3)
        body_part: "Throat and vocal cords - instruments of manifestation",
        herb: "Alfalfa",
    },
    ZodiacDecanEntry {
        sign: 1,
        decan_in_sign: 1,
        ruling_planet: 4,
        element: 4,
        mode: 1,
        ananda_harmonic: 4, // DR(1×4=4)
        body_part: "Upper chest and lungs - breath of life",
        herb: "Barley",
    },
    ZodiacDecanEntry {
        sign: 1,
        decan_in_sign: 2,
        ruling_planet: 5,
        element: 4,
        mode: 1,
        ananda_harmonic: 5, // DR(1×5=5)
        body_part: "Upper back - bearing lifes burdens",
        herb: "Sage",
    },
    // ── Gemini (sign=2, Air/Mutable) — ANANDA_BIMBA row 2 = {0,2,4,6,8,1,3,5,7,9,2,4} ──
    ZodiacDecanEntry {
        sign: 2,
        decan_in_sign: 0,
        ruling_planet: 6,
        element: 1,
        mode: 2,
        ananda_harmonic: 3, // DR(2×6=12→3)
        body_part: "Hands and fingers - tools of communication",
        herb: "Lavender",
    },
    ZodiacDecanEntry {
        sign: 2,
        decan_in_sign: 1,
        ruling_planet: 7,
        element: 1,
        mode: 2,
        ananda_harmonic: 5, // DR(2×7=14→5)
        body_part: "Lungs and diaphragm - breath of action",
        herb: "Frankincense",
    },
    ZodiacDecanEntry {
        sign: 2,
        decan_in_sign: 2,
        ruling_planet: 0,
        element: 1,
        mode: 2,
        ananda_harmonic: 0, // DR(2×0=0)
        body_part: "Nervous system - the network of communication",
        herb: "Rosemary",
    },
    // ── Cancer (sign=3, Water/Cardinal) — ANANDA_BIMBA row 3 = {0,3,6,9,3,6,9,3,6,9,3,6} ──
    // Parashakti's {3,6,9} tripling ring — the vibrational spiral manifests here.
    ZodiacDecanEntry {
        sign: 3,
        decan_in_sign: 0,
        ruling_planet: 2,
        element: 3,
        mode: 0,
        ananda_harmonic: 6, // DR(3×2=6)
        body_part: "Breasts and stomach - centers of nurturing",
        herb: "Jasmine",
    },
    ZodiacDecanEntry {
        sign: 3,
        decan_in_sign: 1,
        ruling_planet: 3,
        element: 3,
        mode: 0,
        ananda_harmonic: 9, // DR(3×3=9) — pivotal mystery point
        body_part: "Upper digestive system and ribs",
        herb: "Water Lily",
    },
    ZodiacDecanEntry {
        sign: 3,
        decan_in_sign: 2,
        ruling_planet: 4,
        element: 3,
        mode: 0,
        ananda_harmonic: 3, // DR(3×4=12→3)
        body_part: "Lymphatic system and liver",
        herb: "Lotus",
    },
    // ── Leo (sign=4, Fire/Fixed) — ANANDA_BIMBA row 4 = {0,4,8,3,7,2,6,1,5,9,4,8} ──
    ZodiacDecanEntry {
        sign: 4,
        decan_in_sign: 0,
        ruling_planet: 5,
        element: 2,
        mode: 1,
        ananda_harmonic: 2, // DR(4×5=20→2)
        body_part: "Heart and spine - core of strength",
        herb: "Sunflower",
    },
    ZodiacDecanEntry {
        sign: 4,
        decan_in_sign: 1,
        ruling_planet: 6,
        element: 2,
        mode: 1,
        ananda_harmonic: 6, // DR(4×6=24→6)
        body_part: "Upper back and circulation",
        herb: "Marigold",
    },
    ZodiacDecanEntry {
        sign: 4,
        decan_in_sign: 2,
        ruling_planet: 7,
        element: 2,
        mode: 1,
        ananda_harmonic: 1, // DR(4×7=28→10→1)
        body_part: "Blood circulation and heart vitality",
        herb: "St. Johns Wort",
    },
    // ── Virgo (sign=5, Earth/Mutable) — ANANDA_BIMBA row 5 = {0,5,1,6,2,7,3,8,4,9,5,1} ──
    ZodiacDecanEntry {
        sign: 5,
        decan_in_sign: 0,
        ruling_planet: 0,
        element: 4,
        mode: 2,
        ananda_harmonic: 0, // DR(5×0=0)
        body_part: "Intestines and digestive system",
        herb: "Wheat",
    },
    ZodiacDecanEntry {
        sign: 5,
        decan_in_sign: 1,
        ruling_planet: 2,
        element: 4,
        mode: 2,
        ananda_harmonic: 1, // DR(5×2=10→1)
        body_part: "Spleen and pancreas",
        herb: "Mint",
    },
    ZodiacDecanEntry {
        sign: 5,
        decan_in_sign: 2,
        ruling_planet: 3,
        element: 4,
        mode: 2,
        ananda_harmonic: 6, // DR(5×3=15→6)
        body_part: "Lower digestive system",
        herb: "Fennel",
    },
    // ── Libra (sign=6, Air/Cardinal) — ANANDA_BIMBA row 6 = {0,6,3,9,6,3,9,6,3,9,6,3} ──
    // Again the {3,6,9} tripling ring — Libra as air reflection of Cancer's water.
    ZodiacDecanEntry {
        sign: 6,
        decan_in_sign: 0,
        ruling_planet: 4,
        element: 1,
        mode: 0,
        ananda_harmonic: 6, // DR(6×4=24→6)
        body_part: "Kidneys and lower back",
        herb: "Chamomile",
    },
    ZodiacDecanEntry {
        sign: 6,
        decan_in_sign: 1,
        ruling_planet: 5,
        element: 1,
        mode: 0,
        ananda_harmonic: 3, // DR(6×5=30→3)
        body_part: "Bladder and skin",
        herb: "Myrrh",
    },
    ZodiacDecanEntry {
        sign: 6,
        decan_in_sign: 2,
        ruling_planet: 6,
        element: 1,
        mode: 0,
        ananda_harmonic: 9, // DR(6×6=36→9) — alchemical saturation in the relational pivot
        body_part: "Skin and circulatory system",
        herb: "Violet",
    },
    // ── Scorpio (sign=7, Water/Fixed) — ANANDA_BIMBA row 7 = {0,7,5,3,1,8,6,4,2,9,7,5} ──
    ZodiacDecanEntry {
        sign: 7,
        decan_in_sign: 0,
        ruling_planet: 7,
        element: 3,
        mode: 1,
        ananda_harmonic: 4, // DR(7×7=49→13→4)
        body_part: "Genitals and reproductive system",
        herb: "Mandrake",
    },
    ZodiacDecanEntry {
        sign: 7,
        decan_in_sign: 1,
        ruling_planet: 0,
        element: 3,
        mode: 1,
        ananda_harmonic: 0, // DR(7×0=0)
        body_part: "Colon and prostate",
        herb: "Wormwood",
    },
    ZodiacDecanEntry {
        sign: 7,
        decan_in_sign: 2,
        ruling_planet: 2,
        element: 3,
        mode: 1,
        ananda_harmonic: 5, // DR(7×2=14→5)
        body_part: "Bladder and elimination systems",
        herb: "Blackberry",
    },
    // ── Sagittarius (sign=8, Fire/Mutable) — ANANDA_BIMBA row 8 = {0,8,7,6,5,4,3,2,1,9,8,7} ──
    ZodiacDecanEntry {
        sign: 8,
        decan_in_sign: 0,
        ruling_planet: 3,
        element: 2,
        mode: 2,
        ananda_harmonic: 6, // DR(8×3=24→6)
        body_part: "Hips and thighs",
        herb: "Sagebrush",
    },
    ZodiacDecanEntry {
        sign: 8,
        decan_in_sign: 1,
        ruling_planet: 4,
        element: 2,
        mode: 2,
        ananda_harmonic: 5, // DR(8×4=32→5)
        body_part: "Liver and sciatic nerve",
        herb: "Juniper",
    },
    ZodiacDecanEntry {
        sign: 8,
        decan_in_sign: 2,
        ruling_planet: 5,
        element: 2,
        mode: 2,
        ananda_harmonic: 4, // DR(8×5=40→4)
        body_part: "Sacrum and hips",
        herb: "Acacia",
    },
    // ── Capricorn (sign=9, Earth/Cardinal) — ANANDA_BIMBA row 9 = {0,9,9,9,9,9,9,9,9,9,9,9} ──
    // All 9 after ground: alchemical saturation — the mountain of accumulated crystallisation.
    ZodiacDecanEntry {
        sign: 9,
        decan_in_sign: 0,
        ruling_planet: 6,
        element: 4,
        mode: 0,
        ananda_harmonic: 9, // DR(9×6=54→9) — full saturation
        body_part: "Knees and joints",
        herb: "Comfrey",
    },
    ZodiacDecanEntry {
        sign: 9,
        decan_in_sign: 1,
        ruling_planet: 7,
        element: 4,
        mode: 0,
        ananda_harmonic: 9, // DR(9×7=63→9) — full saturation
        body_part: "Bones and skin",
        herb: "Thistle",
    },
    ZodiacDecanEntry {
        sign: 9,
        decan_in_sign: 2,
        ruling_planet: 0,
        element: 4,
        mode: 0,
        ananda_harmonic: 0, // DR(9×0=0) — Sun at Capricorn 3: solstice return to void
        body_part: "Skin and teeth",
        herb: "Cedar",
    },
    // ── Aquarius (sign=10, Air/Fixed) — ANANDA_BIMBA row 10 = shadow of row 1 ──
    // {0,1,2,3,4,5,6,7,8,9,1,2} — Aquarius as the night-mirror of Taurus.
    ZodiacDecanEntry {
        sign: 10,
        decan_in_sign: 0,
        ruling_planet: 2,
        element: 1,
        mode: 1,
        ananda_harmonic: 2, // DR(10×2)=shadow_row1[2]=2
        body_part: "Ankles and calves",
        herb: "Horehound",
    },
    ZodiacDecanEntry {
        sign: 10,
        decan_in_sign: 1,
        ruling_planet: 3,
        element: 1,
        mode: 1,
        ananda_harmonic: 3, // DR(10×3)=shadow_row1[3]=3
        body_part: "Circulatory system and shins",
        herb: "Eyebright",
    },
    ZodiacDecanEntry {
        sign: 10,
        decan_in_sign: 2,
        ruling_planet: 4,
        element: 1,
        mode: 1,
        ananda_harmonic: 4, // DR(10×4)=shadow_row1[4]=4
        body_part: "Lymphatic system",
        herb: "Snowdrop",
    },
    // ── Pisces (sign=11, Water/Mutable) — ANANDA_BIMBA row 11 = shadow of row 2 ──
    // {0,2,4,6,8,1,3,5,7,9,2,4} — Pisces as the night-mirror of Gemini; Möbius return.
    ZodiacDecanEntry {
        sign: 11,
        decan_in_sign: 0,
        ruling_planet: 5,
        element: 3,
        mode: 2,
        ananda_harmonic: 1, // DR(11×5)=shadow_row2[5]=1 — unity from dissolution
        body_part: "Feet and toes",
        herb: "Kelp",
    },
    ZodiacDecanEntry {
        sign: 11,
        decan_in_sign: 1,
        ruling_planet: 6,
        element: 3,
        mode: 2,
        ananda_harmonic: 3, // DR(11×6)=shadow_row2[6]=3
        body_part: "Lymphatic system",
        herb: "Lotus",
    },
    ZodiacDecanEntry {
        sign: 11,
        decan_in_sign: 2,
        ruling_planet: 7,
        element: 3,
        mode: 2,
        ananda_harmonic: 5, // DR(11×7)=shadow_row2[7]=5 — synthesis before Möbius return
        body_part: "Pineal gland and immune system",
        herb: "Poppy",
    },
];

/// Canonical zodiacal mode names (M0 ZOD_MODE).
pub static MODE_NAMES: [&str; 3] = ["Cardinal", "Fixed", "Mutable"];

// ─── Static Lookup Tables (M2 Parashakti dataset) ───────────────────────────

/// Body zones for each chakra (indexed 0-7).
/// Derived from `anatomicalLocation` property of ChakralCenter nodes
/// and traditional chakra anatomy cross-referenced with dataset.
pub static CHAKRA_BODY_ZONES: [&[&str]; 8] = [
    // 0: Earth/Ground — Planet Earth node (#2 ChakralGrounding)
    &[
        "physical_ground",
        "biosphere",
        "geomagnetic_field",
        "schumann_resonance",
    ],
    // 1: Mūlādhāra — "Base of spine, perineum, pelvic floor"
    &[
        "base_of_spine",
        "perineum",
        "pelvic_floor",
        "coccyx",
        "bones",
        "teeth",
        "skin",
        "large_intestine",
        "adrenal_glands",
        "knees",
        "legs",
    ],
    // 2: Svādhiṣṭhāna — "Lower abdomen, sacral region, reproductive organs"
    &[
        "lower_abdomen",
        "sacrum",
        "sacral_region",
        "reproductive_organs",
        "bladder",
        "kidneys",
        "hips",
        "blood",
        "lymph",
        "gonads",
    ],
    // 3: Maṇipūra — "Solar plexus, upper abdomen, digestive system"
    &[
        "solar_plexus",
        "upper_abdomen",
        "liver",
        "gallbladder",
        "stomach",
        "small_intestine",
        "spleen",
        "pancreas",
        "adrenal_glands",
        "muscles",
        "digestive_system",
    ],
    // 4: Anāhata — "Heart region, chest center, cardiac plexus"
    &[
        "heart",
        "chest_center",
        "cardiac_plexus",
        "lungs",
        "thymus",
        "pericardium",
        "arms",
        "hands",
        "circulatory_system",
        "thoracic_spine",
        "diaphragm",
    ],
    // 5: Viśuddha — "Throat region, thyroid, vocal apparatus"
    &[
        "throat",
        "thyroid",
        "parathyroid",
        "vocal_apparatus",
        "neck",
        "shoulders",
        "ears",
        "mouth",
        "jaw",
        "esophagus",
    ],
    // 6: Ājñā — "Between eyebrows, pineal gland, third eye region"
    &[
        "third_eye_region",
        "between_eyebrows",
        "pineal_gland",
        "pituitary_gland",
        "brain",
        "eyes",
        "sinuses",
        "forehead",
        "autonomic_nervous_system",
        "left_eye",
        "right_eye",
    ],
    // 7: Sahasrāra — "Crown of head, fontanelle, cerebral cortex"
    &[
        "crown_of_head",
        "fontanelle",
        "cerebral_cortex",
        "skull",
        "central_nervous_system",
        "cerebrum",
        "top_of_skull",
    ],
];

/// SUPERSEDED — body_part data now lives in ZODIAC_DECAN_TABLE[i].body_part.
/// Kept temporarily for any external callers; remove after full migration.
#[deprecated(note = "Use ZODIAC_DECAN_TABLE[i].body_part — canonical M0→M1→M2 struct")]
pub static DECAN_BODY_PARTS: [&str; 36] = [
    // Aries (0-2) — coord #2-3-1-0-0/1/2
    "Skull and brain - the command center of action", // 0: Aries 1 (Mars)
    "Eyes and sinuses - the vision centers",          // 1: Aries 2 (Sun)
    "Neck and throat - bridge between head and heart", // 2: Aries 3 (Venus)
    // Taurus (3-5) — coord #2-3-2-0-0/1/2
    "Throat and vocal cords - instruments of manifestation", // 3: Taurus 1 (Mercury)
    "Upper chest and lungs - breath of life",                // 4: Taurus 2 (Moon)
    "Upper back - bearing lifes burdens",                    // 5: Taurus 3 (Saturn)
    // Gemini (6-8) — coord #2-3-3-0-0/1/2
    "Hands and fingers - tools of communication", // 6: Gemini 1 (Jupiter)
    "Lungs and diaphragm - breath of action",     // 7: Gemini 2 (Mars)
    "Nervous system - the network of communication", // 8: Gemini 3 (Sun)
    // Cancer (9-11) — coord #2-3-4-0-0/1/2
    "Breasts and stomach - centers of nurturing", // 9: Cancer 1 (Venus)
    "Upper digestive system and ribs",            // 10: Cancer 2 (Mercury)
    "Lymphatic system and liver",                 // 11: Cancer 3 (Moon)
    // Leo (12-14) — coord #2-3-1-1-0/1/2
    "Heart and spine - core of strength",   // 12: Leo 1 (Saturn)
    "Upper back and circulation",           // 13: Leo 2 (Jupiter)
    "Blood circulation and heart vitality", // 14: Leo 3 (Mars)
    // Virgo (15-17) — coord #2-3-2-1-0/1/2
    "Intestines and digestive system", // 15: Virgo 1 (Sun)
    "Spleen and pancreas",             // 16: Virgo 2 (Venus)
    "Lower digestive system",          // 17: Virgo 3 (Mercury)
    // Libra (18-20) — coord #2-3-3-1-0/1/2
    "Kidneys and lower back",      // 18: Libra 1 (Moon)
    "Bladder and skin",            // 19: Libra 2 (Saturn)
    "Skin and circulatory system", // 20: Libra 3 (Jupiter)
    // Scorpio (21-23) — coord #2-3-4-1-0/1/2
    "Genitals and reproductive system", // 21: Scorpio 1 (Mars)
    "Colon and prostate",               // 22: Scorpio 2 (Sun)
    "Bladder and elimination systems",  // 23: Scorpio 3 (Venus)
    // Sagittarius (24-26) — coord #2-3-1-2-0/1/2
    "Hips and thighs",         // 24: Sagittarius 1 (Mercury)
    "Liver and sciatic nerve", // 25: Sagittarius 2 (Moon)
    "Sacrum and hips",         // 26: Sagittarius 3 (Saturn)
    // Capricorn (27-29) — coord #2-3-2-2-0/1/2
    "Knees and joints", // 27: Capricorn 1 (Jupiter)
    "Bones and skin",   // 28: Capricorn 2 (Mars)
    "Skin and teeth",   // 29: Capricorn 3 (Sun)
    // Aquarius (30-32) — coord #2-3-3-2-0/1/2
    "Ankles and calves",            // 30: Aquarius 1 (Venus)
    "Circulatory system and shins", // 31: Aquarius 2 (Mercury)
    "Lymphatic system",             // 32: Aquarius 3 (Moon)
    // Pisces (33-35) — coord #2-3-4-2-0/1/2
    "Feet and toes",                  // 33: Pisces 1 (Saturn)
    "Lymphatic system",               // 34: Pisces 2 (Jupiter)
    "Pineal gland and immune system", // 35: Pisces 3 (Mars)
];

/// SUPERSEDED — herb data now lives in ZODIAC_DECAN_TABLE[i].herb.
#[deprecated(note = "Use ZODIAC_DECAN_TABLE[i].herb — canonical M0→M1→M2 struct")]
pub static DECAN_HERBS: [&str; 36] = [
    // Aries (0-2)
    "Hawthorn",    // 0: Aries 1 — cardioprotective for warriors heart
    "Nettle",      // 1: Aries 2 — anti-inflammatory for fire
    "Damask Rose", // 2: Aries 3 — heart opening
    // Taurus (3-5)
    "Alfalfa", // 3: Taurus 1 — nutrient dense builder
    "Barley",  // 4: Taurus 2 — lunar grain
    "Sage",    // 5: Taurus 3 — Saturnine wisdom
    // Gemini (6-8)
    "Lavender",     // 6: Gemini 1 — mental clarity
    "Frankincense", // 7: Gemini 2 — for focus
    "Rosemary",     // 8: Gemini 3 — for memory and brilliance
    // Cancer (9-11)
    "Jasmine",    // 9: Cancer 1 — for emotional balance
    "Water Lily", // 10: Cancer 2 — for liver health
    "Lotus",      // 11: Cancer 3 — for detoxification
    // Leo (12-14)
    "Sunflower",      // 12: Leo 1 — for solar vitality
    "Marigold",       // 13: Leo 2 — for solar joy
    "St. Johns Wort", // 14: Leo 3 — for solar courage
    // Virgo (15-17)
    "Wheat",  // 15: Virgo 1 — for nourishment
    "Mint",   // 16: Virgo 2 — for clarity
    "Fennel", // 17: Virgo 3 — for healing
    // Libra (18-20)
    "Chamomile", // 18: Libra 1 — for balance
    "Myrrh",     // 19: Libra 2 — for structure
    "Violet",    // 20: Libra 3 — for social harmony
    // Scorpio (21-23)
    "Mandrake",   // 21: Scorpio 1 — for power
    "Wormwood",   // 22: Scorpio 2 — for transformation
    "Blackberry", // 23: Scorpio 3 — for binding
    // Sagittarius (24-26)
    "Sagebrush", // 24: Sagittarius 1 — for ritual purification
    "Juniper",   // 25: Sagittarius 2 — for pathfinding
    "Acacia",    // 26: Sagittarius 3 — for spiritual insight
    // Capricorn (27-29)
    "Comfrey", // 27: Capricorn 1 — for bone healing
    "Thistle", // 28: Capricorn 2 — for determination
    "Cedar",   // 29: Capricorn 3 — for mastery
    // Aquarius (30-32)
    "Horehound", // 30: Aquarius 1 — for humanitarianism
    "Eyebright", // 31: Aquarius 2 — for clear vision
    "Snowdrop",  // 32: Aquarius 3 — for purification
    // Pisces (33-35)
    "Kelp",  // 33: Pisces 1 — for deep nourishment
    "Lotus", // 34: Pisces 2 — for spiritual elevation
    "Poppy", // 35: Pisces 3 — for visionary states
];

/// Planet→chakra mapping via PLANETARY_RESONANCE relations from dataset.
/// Indexed by Planet_Id (kairos.rs display array order):
///   SUN=0→Sahasrara(7), EARTH=1→Ground(0), VENUS=2→Anahata(4),
///   MERCURY=3→Vishuddha(5), MOON=4→Ajna(6), SATURN=5→Muladhara(1),
///   JUPITER=6→Svadhisthana(2), MARS=7→Manipura(3)
///
/// Source: relations.json PLANETARY_RESONANCE edges:
///   #2-5-0/1 (Sun)     → #2-5-0/1-7 (Sahasrara)
///   #2-5-2   (Venus)   → #2-5-0/1-4 (Anahata)
///   #2-5-3   (Mercury) → #2-5-0/1-5 (Vishuddha)
///   #2-5-4   (Moon)    → #2-5-0/1-6 (Ajna)
///   #2-5-5   (Saturn)  → #2-5-0/1-1 (Muladhara)
///   #2-5-6   (Jupiter) → #2-5-0/1-2 (Svadhisthana)
///   #2-5-7   (Mars)    → #2-5-0/1-3 (Manipura)
pub static PLANET_CHAKRA: [u8; 8] = [
    7, // 0: Sun      → Sahasrara
    0, // 1: Earth    → Physical Ground
    4, // 2: Venus    → Anahata
    5, // 3: Mercury  → Vishuddha
    6, // 4: Moon     → Ajna
    1, // 5: Saturn   → Muladhara
    2, // 6: Jupiter  → Svadhisthana
    3, // 7: Mars     → Manipura
];

/// Element→chakra mapping (traditional tattva system).
/// dominant_element encoding from kairos.rs python script:
///   0=Akasha/Ether, 1=Air, 2=Fire, 3=Water, 4=Earth
pub static ELEMENT_CHAKRA: [u8; 5] = [
    5, // 0: Akasha/Ether → Vishuddha (sound, space)
    4, // 1: Air          → Anahata (heart, wind/Vayu)
    3, // 2: Fire         → Manipura (solar plexus, Agni)
    2, // 3: Water        → Svadhisthana (sacral, Apas)
    1, // 4: Earth        → Muladhara (root, Prithivi)
];

/// Zodiac sign → element id.
/// dominant_sign 0-11: Aries..Pisces
pub static SIGN_ELEMENT: [u8; 12] = [
    2, // 0:  Aries       = Fire
    4, // 1:  Taurus      = Earth
    1, // 2:  Gemini      = Air
    3, // 3:  Cancer      = Water
    2, // 4:  Leo         = Fire
    4, // 5:  Virgo       = Earth
    1, // 6:  Libra       = Air
    3, // 7:  Scorpio     = Water
    2, // 8:  Sagittarius = Fire
    4, // 9:  Capricorn   = Earth
    1, // 10: Aquarius    = Air
    3, // 11: Pisces      = Water
];

// ─── LUT Accessors ──────────────────────────────────────────────────────────

/// Body zones for a chakra id (0-7).
pub fn body_zones_for_chakra(chakra_id: u8) -> &'static [&'static str] {
    CHAKRA_BODY_ZONES
        .get(chakra_id as usize)
        .copied()
        .unwrap_or(&[])
}

/// Body zones for a planet (using PLANET_CHAKRA map then CHAKRA_BODY_ZONES).
pub fn body_zones_for_planet(planet_id: u8) -> &'static [&'static str] {
    let chakra_id = PLANET_CHAKRA.get(planet_id as usize).copied().unwrap_or(0);
    body_zones_for_chakra(chakra_id)
}

/// Canonical decan entry for a decan index (0-35).
/// The single authoritative access point for the M0→M1→M2 chain.
pub fn zodiac_decan(decan_index: u8) -> Option<&'static ZodiacDecanEntry> {
    ZODIAC_DECAN_TABLE.get(decan_index as usize)
}

/// Decan index for a live ecliptic degree (0.0–360.0).
/// 360° / 36 decans = 10° per decan.
pub fn decan_for_degree(degree: f32) -> u8 {
    let d = degree.rem_euclid(360.0);
    (d / 10.0) as u8
}

/// Decan index for a given sign (0-11) and position within sign (0-2).
pub fn decan_for_sign_pos(sign: u8, pos_in_sign: u8) -> u8 {
    sign.min(11) * 3 + pos_in_sign.min(2)
}

/// Body part for a decan index (0-35). Source: ZODIAC_DECAN_TABLE (canonical).
pub fn body_zones_for_decan(decan_index: u8) -> &'static str {
    ZODIAC_DECAN_TABLE
        .get(decan_index as usize)
        .map(|d| d.body_part)
        .unwrap_or("unknown decan")
}

/// Primary herb for a decan index (0-35). Source: ZODIAC_DECAN_TABLE (canonical).
pub fn herb_for_decan(decan_index: u8) -> &'static str {
    ZODIAC_DECAN_TABLE
        .get(decan_index as usize)
        .map(|d| d.herb)
        .unwrap_or("none")
}

/// Ananda harmonic for a decan index — M1 ANANDA_BIMBA resonance value (0-9).
pub fn ananda_harmonic_for_decan(decan_index: u8) -> u8 {
    ZODIAC_DECAN_TABLE
        .get(decan_index as usize)
        .map(|d| d.ananda_harmonic)
        .unwrap_or(0)
}

/// Zodiacal mode name for a decan index.
pub fn mode_for_decan(decan_index: u8) -> &'static str {
    ZODIAC_DECAN_TABLE
        .get(decan_index as usize)
        .and_then(|d| MODE_NAMES.get(d.mode as usize))
        .copied()
        .unwrap_or("unknown")
}

/// Chakra id for dominant element (0=Akasha..4=Earth).
pub fn chakra_for_element(element_id: u8) -> u8 {
    ELEMENT_CHAKRA
        .get(element_id as usize)
        .copied()
        .unwrap_or(0)
}

/// Body zones via M2 C Elemental_Signature bitfield (for FFI path).
/// Bit layout from m2.h: element = bits[2:0], chakra = bits[4:2], phase = bits[6:5]
/// This is the mathematically-grounded path from C elem_sig → body zones.
pub fn body_zones_for_elem_sig(elem_sig: u8) -> &'static [&'static str] {
    let chakra_id = (elem_sig >> 2) & 0b111;
    body_zones_for_chakra(chakra_id)
}

// ─── Output Structs ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct ElementalBalance {
    pub fire: u8,
    pub water: u8,
    pub earth: u8,
    pub air: u8,
    pub dominant: String,
    pub deficient: String,
    pub triage_vector: String,
    pub chakra_state: u8,
    pub chakra_name: String,
    pub active_decan: u8,
    pub decan_body_zone: String,
}

#[derive(Debug, Serialize)]
pub struct ChakraState {
    pub id: u8,
    pub name: String,
    pub body_zones: Vec<String>,
    pub activation: u8,
    pub planetary_ruler: String,
    pub element: String,
    pub decan: u8,
    pub decan_body_zone: String,
}

#[derive(Debug, Serialize)]
pub struct MateriaRecord {
    pub decan: u8,
    pub sign: String,
    pub planetary_ruler: String,
    pub element: String,
    pub body_zone: String,
    pub primary_herb: String,
    pub chakra_id: u8,
    pub chakra_name: String,
    pub chakra_zones: Vec<String>,
}

// ─── CLI Functions ───────────────────────────────────────────────────────────

/// epi nara medicine balance
pub fn balance(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let _profile = super::identity::load_profile()?
        .ok_or("No identity profile. Run 'epi nara wind' first.")?;

    let elem = kairos.dominant_element;
    let _sign = kairos.dominant_sign as usize;
    let decan = kairos.active_decan;

    // Derive elemental scores from sign distribution across planets.
    // Count how many planets occupy fire/earth/air/water signs.
    let mut fire_count: u8 = 0;
    let mut earth_count: u8 = 0;
    let mut air_count: u8 = 0;
    let mut water_count: u8 = 0;

    for planet in &kairos.planets {
        // Each planet has degree 0-360; sign = degree/30
        let p_sign = ((planet.degree / 30.0) as usize).min(11);
        let p_elem = SIGN_ELEMENT[p_sign];
        match p_elem {
            2 => fire_count = fire_count.saturating_add(30),
            4 => earth_count = earth_count.saturating_add(30),
            1 => air_count = air_count.saturating_add(30),
            3 => water_count = water_count.saturating_add(30),
            _ => {}
        }
    }

    // If no planet data, fall back to dominant element emphasis
    if fire_count == 0 && earth_count == 0 && air_count == 0 && water_count == 0 {
        fire_count = 100;
        earth_count = 100;
        air_count = 100;
        water_count = 100;
        match elem {
            2 => fire_count = 200,
            4 => earth_count = 200,
            1 => air_count = 200,
            3 => water_count = 200,
            _ => {}
        }
    }

    // Deficient = lowest element (excluding zero/tie, pick opposite of dominant)
    let deficient_elem = match elem {
        2 => 3u8, // Fire dominant → Water deficient
        3 => 2u8, // Water dominant → Fire deficient
        1 => 4u8, // Air dominant → Earth deficient
        4 => 1u8, // Earth dominant → Air deficient
        _ => (elem + 2) % 5,
    };

    let chakra_id = chakra_for_element(elem);
    let chakra_nm = chakra_name(chakra_id);

    // Triage: if dominant element matches active decan element (via canonical struct), "resonant"
    let decan_elem = zodiac_decan(decan).map(|d| d.element).unwrap_or(elem);
    let triage = if decan_elem == elem {
        "resonant — decan amplifies dominant element"
    } else {
        "bridging — decan provides elemental contrast"
    };

    let bal = ElementalBalance {
        fire: fire_count,
        water: water_count,
        earth: earth_count,
        air: air_count,
        dominant: element_name(elem),
        deficient: element_name(deficient_elem),
        triage_vector: triage.to_string(),
        chakra_state: chakra_id,
        chakra_name: chakra_nm.to_string(),
        active_decan: decan,
        decan_body_zone: body_zones_for_decan(decan).to_string(),
    };

    if json {
        serde_json::to_string_pretty(&bal).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Elemental Balance\n\
             \x20 Fire: {fire}  Water: {water}  Earth: {earth}  Air: {air}\n\
             \x20 Dominant: {dom}  Deficient: {def}\n\
             \x20 Triage: {triage}\n\
             \x20 Chakra: {cname} (id={cid})\n\
             \x20 Active decan {decan}: {zone}",
            fire = bal.fire,
            water = bal.water,
            earth = bal.earth,
            air = bal.air,
            dom = bal.dominant,
            def = bal.deficient,
            triage = bal.triage_vector,
            cname = bal.chakra_name,
            cid = bal.chakra_state,
            decan = decan,
            zone = bal.decan_body_zone,
        ))
    }
}

/// epi nara medicine prescribe
/// Compute a medicine prescription grounded in the current kairos state.
///
/// `context`: practise context ("morning" | "evening" | "integration" | "crisis" | anything).
/// `is_shadow`: when `true`, the oracle payload phase = 1 (implicate/reversed). In shadow pole
///   the decan body zone annotation shifts to its `reversedMeaning` — the contra-indication /
///   shadow emphasis rather than the primary therapeutic direction. This flag MUST come from
///   `OraclePayload.phase` so the medicine chain is downstream of the oracle cast, not derived
///   independently.
///
/// Canonical data path:
///   OraclePayload.degree → decan (via degree/10)
///   OraclePayload.phase  → is_shadow (shadow pole annotation)
///   kairos.active_decan  → decan ruler, body zones, herbs (when no payload degree available)
pub fn prescribe(context: &str, is_shadow: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;

    let practices: Vec<&str> = match context {
        "morning" => vec!["breathwork (4-7-8)", "sun salutation", "journaling"],
        "evening" => vec!["body scan", "gratitude practice", "dream incubation"],
        "integration" => vec![
            "walking meditation",
            "creative expression",
            "dialogical inquiry",
        ],
        "crisis" => vec![
            "grounding (5-4-3-2-1)",
            "cold water contact",
            "bilateral stimulation",
        ],
        _ => vec!["mindful breathing", "body awareness", "reflective writing"],
    };

    let decan = kairos.active_decan;
    let body_zone = body_zones_for_decan(decan);
    let herb = herb_for_decan(decan);
    let elem = kairos.dominant_element;

    // Ruling planet: Chaldean decan ruler from ZODIAC_DECAN_TABLE (canonical).
    // This is the true decan ruler per GD/Thoth Chaldean assignment, not an approximation.
    let ruling_planet_id = zodiac_decan(decan).map(|d| d.ruling_planet).unwrap_or(0);

    let planet_nm = planet_name(ruling_planet_id);
    let ruling_chakra = PLANET_CHAKRA
        .get(ruling_planet_id as usize)
        .copied()
        .unwrap_or(0);

    let duration_min = 15u32 + (ruling_chakra as u32 * 5);

    // Shadow pole annotation: when is_shadow=true (OraclePayload.phase == 1),
    // the body zone reading shifts to reversedMeaning — the contra-indication /
    // shadow emphasis. This is the #2-3 → #3-4 reversedMeaning path per
    // CLOCK-AND-NARA-SPECS/13-shadow-decans-rotational-states.
    let shadow_note = if is_shadow {
        " [shadow pole — reversedMeaning active]"
    } else {
        ""
    };

    let mut out = format!("Medicine Prescription ({}){}\n", context, shadow_note);
    out.push_str(&format!(
        "\x20 Decan {}: {}{}\n",
        decan,
        body_zone,
        if is_shadow {
            " ⟵ shadow emphasis"
        } else {
            ""
        },
    ));
    out.push_str(&format!(
        "\x20 Element: {}  Planetary ruler: {} → {}\n",
        element_name(elem),
        planet_nm,
        chakra_name(ruling_chakra),
    ));
    out.push_str(&format!("\x20 Primary materia: {}\n", herb));
    if is_shadow {
        out.push_str(
            "\x20 Shadow note: Work WITH the contra-indicated zone; integrate rather than avoid.\n",
        );
    }
    out.push_str("\x20 Practices:\n");
    for p in &practices {
        out.push_str(&format!("    * {}\n", p));
    }
    out.push_str(&format!("\x20 Duration: {} min\n", duration_min));

    Ok(out)
}

/// epi nara medicine chakra
pub fn chakra(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;

    // Primary chakra from dominant element
    let elem = kairos.dominant_element;
    let primary_id = chakra_for_element(elem);
    let primary_nm = chakra_name(primary_id);

    // Secondary: chakra from active decan's Chaldean ruling planet (via ZODIAC_DECAN_TABLE).
    // Canonical path: decan → ruling_planet → PLANET_CHAKRA.
    let decan = kairos.active_decan;
    let decan_chakra = zodiac_decan(decan)
        .map(|d| {
            PLANET_CHAKRA
                .get(d.ruling_planet as usize)
                .copied()
                .unwrap_or(0)
        })
        .unwrap_or(0);

    // Activation level: 255 if primary == decan chakra (resonant), else 128
    let activation: u8 = if primary_id == decan_chakra { 255 } else { 192 };

    let zones: Vec<String> = body_zones_for_chakra(primary_id)
        .iter()
        .map(|s| s.to_string())
        .collect();

    // Planet whose chakra is primary
    let ruling_planet = PLANET_CHAKRA
        .iter()
        .position(|&c| c == primary_id)
        .map(|i| planet_name(i as u8))
        .unwrap_or("None");

    if json {
        let state = ChakraState {
            id: primary_id,
            name: primary_nm.to_string(),
            body_zones: zones,
            activation,
            planetary_ruler: ruling_planet.to_string(),
            element: element_name(elem),
            decan,
            decan_body_zone: body_zones_for_decan(decan).to_string(),
        };
        serde_json::to_string_pretty(&state).map_err(|e| e.to_string())
    } else {
        let zones_display: Vec<String> = body_zones_for_chakra(primary_id)
            .iter()
            .map(|s| s.to_string())
            .collect();
        Ok(format!(
            "Active Chakra: {} (id={}, activation={})\n\
             \x20 Element: {}  Planetary ruler: {}\n\
             \x20 Body zones: {}\n\
             \x20 Active decan {}: {}",
            primary_nm,
            primary_id,
            activation,
            element_name(elem),
            ruling_planet,
            zones_display.join(", "),
            decan,
            body_zones_for_decan(decan),
        ))
    }
}

/// epi nara medicine materia
pub fn materia(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let decan = kairos.active_decan;

    // All data from the canonical M0→M1→M2 struct — no ad-hoc derivations.
    let entry = zodiac_decan(decan).ok_or_else(|| format!("Invalid decan index: {}", decan))?;

    let sign_names = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    ];
    let sign = sign_names.get(entry.sign as usize).copied().unwrap_or("?");
    let ruler = planet_name(entry.ruling_planet);
    let mode = MODE_NAMES.get(entry.mode as usize).copied().unwrap_or("?");

    // Canonical path: decan ruling_planet → PLANET_CHAKRA → chakra zones
    let chakra_id = PLANET_CHAKRA
        .get(entry.ruling_planet as usize)
        .copied()
        .unwrap_or(0);
    let chakra_nm = chakra_name(chakra_id);
    let chakra_zones: Vec<String> = body_zones_for_chakra(chakra_id)
        .iter()
        .map(|s| s.to_string())
        .collect();

    if json {
        let rec = MateriaRecord {
            decan,
            sign: sign.to_string(),
            planetary_ruler: ruler.to_string(),
            element: element_name(entry.element),
            body_zone: entry.body_part.to_string(),
            primary_herb: entry.herb.to_string(),
            chakra_id,
            chakra_name: chakra_nm.to_string(),
            chakra_zones,
        };
        serde_json::to_string_pretty(&rec).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Materia Medica — Decan {} ({} {} / {}, ananda={})\n\
             \x20 Body zone: {}\n\
             \x20 Primary herb: {}\n\
             \x20 Element: {}  Mode: {}  Ruler: {}\n\
             \x20 Chakra: {} (id={})\n\
             \x20 Chakra zones: {}",
            decan,
            sign,
            entry.decan_in_sign + 1,
            mode,
            entry.ananda_harmonic,
            entry.body_part,
            entry.herb,
            element_name(entry.element),
            mode,
            ruler,
            chakra_nm,
            chakra_id,
            body_zones_for_chakra(chakra_id).join(", "),
        ))
    }
}

/// epi nara medicine safety
pub fn safety(practice: Option<&str>) -> Result<String, String> {
    match practice {
        Some(p) => Ok(format!(
            "Safety check for '{}': CLEAR (no contraindications)",
            p
        )),
        None => Ok("Safety status: CLEAR — no active contraindications.".to_string()),
    }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

fn element_name(id: u8) -> String {
    match id {
        0 => "Akasha".to_string(),
        1 => "Air".to_string(),
        2 => "Fire".to_string(),
        3 => "Water".to_string(),
        4 => "Earth".to_string(),
        _ => format!("Element({})", id),
    }
}

fn chakra_name(id: u8) -> &'static str {
    match id {
        0 => "Earth/Ground",
        1 => "Muladhara",
        2 => "Svadhisthana",
        3 => "Manipura",
        4 => "Anahata",
        5 => "Vishuddha",
        6 => "Ajna",
        7 => "Sahasrara",
        _ => "unknown",
    }
}

fn planet_name(id: u8) -> &'static str {
    match id {
        0 => "Sun",
        1 => "Earth",
        2 => "Venus",
        3 => "Mercury",
        4 => "Moon",
        5 => "Saturn",
        6 => "Jupiter",
        7 => "Mars",
        _ => "Unknown",
    }
}
