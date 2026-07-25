//! Nara Medicine — Sympathetic medicine grounded in M2 Parashakti dataset
//!
//! All lookup tables are derived from the Parashakti deep dataset:
//!   Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json
//!   Idea/Bimba/Map/datasets/parashakti-deep/relations.json
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
    /// Element derived from zodiac sign, in **L2' canonical IDs** (see
    /// `epi-lib/include/m_canonical.h`):
    ///   0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Salt.
    /// (Decans only ever carry the operative quartet Earth/Water/Air/Fire.)
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
///   - M2: Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json — ruling_planet, body_part, herb
pub static ZODIAC_DECAN_TABLE: [ZodiacDecanEntry; 36] = [
    // ── Aries (sign=0, Fire/Cardinal) — ANANDA_BIMBA row 0 = all zeros ──
    // DR(0×anything)=0: the void-ground of pure initiatory fire, pre-numerical.
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 0,
        ruling_planet: 7,
        element: 4,
        mode: 0,
        ananda_harmonic: 0, // DR(0×7=0)
        body_part: "Skull and brain - the command center of action",
        herb: "Hawthorn",
    },
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 1,
        ruling_planet: 0,
        element: 4,
        mode: 0,
        ananda_harmonic: 0, // DR(0×0=0)
        body_part: "Eyes and sinuses - the vision centers",
        herb: "Nettle",
    },
    ZodiacDecanEntry {
        sign: 0,
        decan_in_sign: 2,
        ruling_planet: 2,
        element: 4,
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
        element: 1,
        mode: 1,
        ananda_harmonic: 3, // DR(1×3=3)
        body_part: "Throat and vocal cords - instruments of manifestation",
        herb: "Alfalfa",
    },
    ZodiacDecanEntry {
        sign: 1,
        decan_in_sign: 1,
        ruling_planet: 4,
        element: 1,
        mode: 1,
        ananda_harmonic: 4, // DR(1×4=4)
        body_part: "Upper chest and lungs - breath of life",
        herb: "Barley",
    },
    ZodiacDecanEntry {
        sign: 1,
        decan_in_sign: 2,
        ruling_planet: 5,
        element: 1,
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
        element: 3,
        mode: 2,
        ananda_harmonic: 3, // DR(2×6=12→3)
        body_part: "Hands and fingers - tools of communication",
        herb: "Lavender",
    },
    ZodiacDecanEntry {
        sign: 2,
        decan_in_sign: 1,
        ruling_planet: 7,
        element: 3,
        mode: 2,
        ananda_harmonic: 5, // DR(2×7=14→5)
        body_part: "Lungs and diaphragm - breath of action",
        herb: "Frankincense",
    },
    ZodiacDecanEntry {
        sign: 2,
        decan_in_sign: 2,
        ruling_planet: 0,
        element: 3,
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
        element: 2,
        mode: 0,
        ananda_harmonic: 6, // DR(3×2=6)
        body_part: "Breasts and stomach - centers of nurturing",
        herb: "Jasmine",
    },
    ZodiacDecanEntry {
        sign: 3,
        decan_in_sign: 1,
        ruling_planet: 3,
        element: 2,
        mode: 0,
        ananda_harmonic: 9, // DR(3×3=9) — pivotal mystery point
        body_part: "Upper digestive system and ribs",
        herb: "Water Lily",
    },
    ZodiacDecanEntry {
        sign: 3,
        decan_in_sign: 2,
        ruling_planet: 4,
        element: 2,
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
        element: 4,
        mode: 1,
        ananda_harmonic: 2, // DR(4×5=20→2)
        body_part: "Heart and spine - core of strength",
        herb: "Sunflower",
    },
    ZodiacDecanEntry {
        sign: 4,
        decan_in_sign: 1,
        ruling_planet: 6,
        element: 4,
        mode: 1,
        ananda_harmonic: 6, // DR(4×6=24→6)
        body_part: "Upper back and circulation",
        herb: "Marigold",
    },
    ZodiacDecanEntry {
        sign: 4,
        decan_in_sign: 2,
        ruling_planet: 7,
        element: 4,
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
        element: 1,
        mode: 2,
        ananda_harmonic: 0, // DR(5×0=0)
        body_part: "Intestines and digestive system",
        herb: "Wheat",
    },
    ZodiacDecanEntry {
        sign: 5,
        decan_in_sign: 1,
        ruling_planet: 2,
        element: 1,
        mode: 2,
        ananda_harmonic: 1, // DR(5×2=10→1)
        body_part: "Spleen and pancreas",
        herb: "Mint",
    },
    ZodiacDecanEntry {
        sign: 5,
        decan_in_sign: 2,
        ruling_planet: 3,
        element: 1,
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
        element: 3,
        mode: 0,
        ananda_harmonic: 6, // DR(6×4=24→6)
        body_part: "Kidneys and lower back",
        herb: "Chamomile",
    },
    ZodiacDecanEntry {
        sign: 6,
        decan_in_sign: 1,
        ruling_planet: 5,
        element: 3,
        mode: 0,
        ananda_harmonic: 3, // DR(6×5=30→3)
        body_part: "Bladder and skin",
        herb: "Myrrh",
    },
    ZodiacDecanEntry {
        sign: 6,
        decan_in_sign: 2,
        ruling_planet: 6,
        element: 3,
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
        element: 2,
        mode: 1,
        ananda_harmonic: 4, // DR(7×7=49→13→4)
        body_part: "Genitals and reproductive system",
        herb: "Mandrake",
    },
    ZodiacDecanEntry {
        sign: 7,
        decan_in_sign: 1,
        ruling_planet: 0,
        element: 2,
        mode: 1,
        ananda_harmonic: 0, // DR(7×0=0)
        body_part: "Colon and prostate",
        herb: "Wormwood",
    },
    ZodiacDecanEntry {
        sign: 7,
        decan_in_sign: 2,
        ruling_planet: 2,
        element: 2,
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
        element: 4,
        mode: 2,
        ananda_harmonic: 6, // DR(8×3=24→6)
        body_part: "Hips and thighs",
        herb: "Sagebrush",
    },
    ZodiacDecanEntry {
        sign: 8,
        decan_in_sign: 1,
        ruling_planet: 4,
        element: 4,
        mode: 2,
        ananda_harmonic: 5, // DR(8×4=32→5)
        body_part: "Liver and sciatic nerve",
        herb: "Juniper",
    },
    ZodiacDecanEntry {
        sign: 8,
        decan_in_sign: 2,
        ruling_planet: 5,
        element: 4,
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
        element: 1,
        mode: 0,
        ananda_harmonic: 9, // DR(9×6=54→9) — full saturation
        body_part: "Knees and joints",
        herb: "Comfrey",
    },
    ZodiacDecanEntry {
        sign: 9,
        decan_in_sign: 1,
        ruling_planet: 7,
        element: 1,
        mode: 0,
        ananda_harmonic: 9, // DR(9×7=63→9) — full saturation
        body_part: "Bones and skin",
        herb: "Thistle",
    },
    ZodiacDecanEntry {
        sign: 9,
        decan_in_sign: 2,
        ruling_planet: 0,
        element: 1,
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
        element: 3,
        mode: 1,
        ananda_harmonic: 2, // DR(10×2)=shadow_row1[2]=2
        body_part: "Ankles and calves",
        herb: "Horehound",
    },
    ZodiacDecanEntry {
        sign: 10,
        decan_in_sign: 1,
        ruling_planet: 3,
        element: 3,
        mode: 1,
        ananda_harmonic: 3, // DR(10×3)=shadow_row1[3]=3
        body_part: "Circulatory system and shins",
        herb: "Eyebright",
    },
    ZodiacDecanEntry {
        sign: 10,
        decan_in_sign: 2,
        ruling_planet: 4,
        element: 3,
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
        element: 2,
        mode: 2,
        ananda_harmonic: 1, // DR(11×5)=shadow_row2[5]=1 — unity from dissolution
        body_part: "Feet and toes",
        herb: "Kelp",
    },
    ZodiacDecanEntry {
        sign: 11,
        decan_in_sign: 1,
        ruling_planet: 6,
        element: 2,
        mode: 2,
        ananda_harmonic: 3, // DR(11×6)=shadow_row2[6]=3
        body_part: "Lymphatic system",
        herb: "Lotus",
    },
    ZodiacDecanEntry {
        sign: 11,
        decan_in_sign: 2,
        ruling_planet: 7,
        element: 2,
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
///
/// Indexed by **L2' canonical element ID** (see `epi-lib/include/m_canonical.h`):
///   0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Salt.
///
/// Salt (5) — the diamond-body / crystalline return — maps to Sahasrara (7),
/// the crown: the irreducible essence that remains after the full opus.
pub static ELEMENT_CHAKRA: [u8; 6] = [
    5, // 0: Aether → Vishuddha (sound, space)
    1, // 1: Earth  → Muladhara (root, Prithivi)
    2, // 2: Water  → Svadhisthana (sacral, Apas)
    4, // 3: Air    → Anahata (heart, wind/Vayu)
    3, // 4: Fire   → Manipura (solar plexus, Agni)
    7, // 5: Salt   → Sahasrara (crown, the diamond body / crystallised essence)
];

/// Zodiac sign → element id, in **L2' canonical IDs** (Earth=1, Water=2, Air=3, Fire=4).
/// dominant_sign 0-11: Aries..Pisces
pub static SIGN_ELEMENT: [u8; 12] = [
    4, // 0:  Aries       = Fire
    1, // 1:  Taurus      = Earth
    3, // 2:  Gemini      = Air
    2, // 3:  Cancer      = Water
    4, // 4:  Leo         = Fire
    1, // 5:  Virgo       = Earth
    3, // 6:  Libra       = Air
    2, // 7:  Scorpio     = Water
    4, // 8:  Sagittarius = Fire
    1, // 9:  Capricorn   = Earth
    3, // 10: Aquarius    = Air
    2, // 11: Pisces      = Water
];

// ─── M2 element REGISTERS and their correspondences (mirror of m_canonical.h) ─
//
// There is no single "element id". Several M2 sub-coordinates carry something
// called an element and they are DIFFERENT ONTOLOGIES sharing a word, each
// complete within its owning coordinate:
//   M2-2 (36 Tattvas) owns the Mahabhuta series (tattvas 31..35, scheme A below)
//     and the chakra<->tattva yogic body;
//   M2-1 (MEF) / L2' owns the alchemical sixfold (scheme B), where Salt is a
//     Tria Prima principle belonging to no other system;
//   M2-3 (Decans) owns the zodiacal triplicity and the decan<->body-part
//     Hermetic medical body — a DIFFERENT body ontology from M2-2's.
// The converters below are therefore CORRESPONDENCES (tradition-bridging claims
// with content), not casts, and are partial by nature.
//
// ON THE WIRE the M-stack serialises in the ALCHEMICAL register (scheme B).
// That is a serialisation choice — one shape is needed when an element crosses
// a coordinate boundary — NOT a claim that M2-1's lens governs M2-2 or M2-3.
// Reframed by DR-L2-ELEM-2 (2026-07-25); `canonical`/`canonical-B` in the names
// below is historical and means "the alchemical register / the wire encoding".
//
// Five distinct element-ID schemes are live across the M-stack (DR-37-3):
//   (A) m2.h tattva `Element_Id`        — AKASHA=0, VAYU/Air=1, AGNI/Fire=2,
//                                         APAS/Water=3, PRITHVI/Earth=4
//   (B) M2-1/L2' alchemical             — Aether=0, Earth=1, Water=2, Air=3,
//                                         Fire=4, Salt=5  ← the WIRE encoding
//   (C) m3.h nucleotide name-binding    — A=Water, T=Fire, C=Earth, G=Air
//                                         (nucleotide 2-bit: A=0,T=1,C=2,G=3)
//   (D) m3.h `Clock_Degree_Entry.decan_element`
//                                       — Fire=0, Earth=1, Air=2, Water=3,
//                                         Akasha=4
//   (E) **stale** clock-spec §15.3 A=Fire/T=Earth/C=Air/G=Water — superseded
//       by the Golden-Dawn/Thoth code binding (scheme C); see DR-37-5.
//
// Every element crossing the M2↔M3 boundary MUST be serialised in the alchemical
// register through one of the converters below — no register-ambiguous element
// integer crosses the boundary, because the receiving side cannot tell which
// register an unlabelled id came from. (DR-37-3 / DR-37-5, Track 37.6 / 37.10;
// reframed by DR-L2-ELEM-2.)

/// Convert an m2.h `Element_Id` tattva enum (scheme A — AKASHA=0, VAYU/Air=1,
/// AGNI/Fire=2, APAS/Water=3, PRITHVI/Earth=4) into the L2' canonical-B ID
/// (Aether=0, Earth=1, Water=2, Air=3, Fire=4, Salt=5).
///
/// This is the scheme the kairos python adapter emits as `dominant_element`.
/// Mirrors `m_canonical_from_medicine_rs_legacy` in
/// `epi-lib/include/m_canonical.h`. All medicine LUTs below are canonically
/// keyed, so any tattva element entering the medicine pipeline MUST pass
/// through here first. (DR-37-3, Track 37.10.)
pub const fn canonical_from_m2_tattva(tattva: u8) -> u8 {
    match tattva {
        0 => 0, // AKASHA → Aether
        1 => 3, // VAYU   → Air
        2 => 4, // AGNI   → Fire
        3 => 2, // APAS   → Water
        4 => 1, // PRITHVI → Earth
        _ => 0xFF,
    }
}

/// Honest-name alias retained for back-compat: scheme A was historically — and
/// inaccurately — called the "medicine.rs legacy" ordering. It IS the m2.h
/// tattva `Element_Id` enum, which is M2-2's Mahabhuta series (tattvas 31..35,
/// per m2.c "Mahabhutas — the 5 elements") — a coordinate-owned register, not a
/// legacy accident. Prefer [`canonical_from_m2_tattva`]. (DR-37-10, DR-L2-ELEM-2.)
#[inline]
pub const fn canonical_from_medicine_rs_legacy(legacy: u8) -> u8 {
    canonical_from_m2_tattva(legacy)
}

/// Inverse of [`canonical_from_m2_tattva`] — canonical-B → m2.h tattva (scheme A).
/// Mirrors `m_canonical_to_medicine_rs_legacy`. Salt has no tattva counterpart.
pub const fn canonical_to_medicine_rs_legacy(canonical: u8) -> u8 {
    match canonical {
        0 => 0,    // Aether → AKASHA
        3 => 1,    // Air    → VAYU
        4 => 2,    // Fire   → AGNI
        2 => 3,    // Water  → APAS
        1 => 4,    // Earth  → PRITHVI
        _ => 0xFF, // Salt
    }
}

/// Convert an m3 `Clock_Degree_Entry.decan_element` (scheme D — Fire=0,
/// Earth=1, Air=2, Water=3, Akasha=4; see `m3.h:841`) into the L2' canonical-B
/// ID. Akasha (the pre-elemental ground) maps to Aether. Any out-of-range
/// value returns `0xFF` (`M_CANONICAL_ELEMENT_INVALID`). (DR-37-3, Track 37.10.)
pub const fn canonical_from_m3_decan_element(decan_element: u8) -> u8 {
    match decan_element {
        0 => 4, // Fire   → Fire
        1 => 1, // Earth  → Earth
        2 => 3, // Air    → Air
        3 => 2, // Water  → Water
        4 => 0, // Akasha → Aether
        _ => 0xFF,
    }
}

/// Convert an m3 nucleotide (2-bit: A=0, T=1, C=2, G=3) into the L2' canonical-B
/// element ID **by name-binding** (scheme C — A=Water, T=Fire, C=Earth, G=Air;
/// the Golden-Dawn/Thoth suit-element correspondence, `m3.h:70-73`). This is the
/// code-canonical binding (yin→Water, yang→Fire) that supersedes the stale
/// clock-spec §15.3 A=Fire/T=Earth/C=Air/G=Water table (DR-37-5). Mirrors the
/// `m4_nuc_to_elem` macro in `m_canonical.h`. (DR-37-3 / DR-37-5, Track 37.10.)
pub const fn canonical_from_nucleotide(nucleotide: u8) -> u8 {
    match nucleotide {
        0 => 2, // A → Water
        1 => 4, // T → Fire
        2 => 1, // C → Earth
        3 => 3, // G → Air
        _ => 0xFF,
    }
}

/// Canonical operative quartet (Earth/Water/Air/Fire) membership — bits 1-4.
/// Mirrors `OPERATIVE_QUARTET_MASK` / `m_canonical_is_operative`.
pub const fn canonical_is_operative(elem: u8) -> bool {
    elem < 8 && (0x1E_u8 >> elem) & 1 != 0
}

/// Extract the chakra ID from an M2 `Elemental_Signature` byte.
///
/// Mirrors the C macro `ELEM_SIG_GET_CHAKRA` in `m2.h`: the chakra occupies
/// bits 5:3, so `(sig >> 3) & 0b111`. (Element is bits 2:0, phase bits 7:6.)
pub const fn elem_sig_chakra(sig: u8) -> u8 {
    (sig >> 3) & 0b111
}

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

/// Chakra id for a dominant element, keyed by **L2' canonical ID**
/// (0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Salt).
pub fn chakra_for_element(element_id: u8) -> u8 {
    ELEMENT_CHAKRA
        .get(element_id as usize)
        .copied()
        .unwrap_or(0)
}

/// Body zones via M2 C Elemental_Signature bitfield (for FFI path).
/// Bit layout from m2.h `ELEM_SIG_PACK`: element = bits[2:0], chakra = bits[5:3],
/// phase = bits[7:6]. This is the mathematically-grounded path from C elem_sig
/// → body zones.
///
/// NOTE: previously this read `(elem_sig >> 2) & 0b111`, which straddled the
/// element/chakra field boundary and returned a garbage chakra id. The
/// canonical `ELEM_SIG_GET_CHAKRA` macro packs the chakra at bits 5:3, so the
/// correct extraction is `(elem_sig >> 3) & 0b111` — see [`elem_sig_chakra`].
pub fn body_zones_for_elem_sig(elem_sig: u8) -> &'static [&'static str] {
    let chakra_id = elem_sig_chakra(elem_sig);
    body_zones_for_chakra(chakra_id)
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/// Human-readable element name, keyed by **L2' canonical ID**
/// (0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Salt).
pub(crate) fn element_name(id: u8) -> String {
    match id {
        0 => "Aether".to_string(),
        1 => "Earth".to_string(),
        2 => "Water".to_string(),
        3 => "Air".to_string(),
        4 => "Fire".to_string(),
        5 => "Salt".to_string(),
        _ => format!("Element({})", id),
    }
}

pub(crate) fn chakra_name(id: u8) -> &'static str {
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

pub(crate) fn planet_name(id: u8) -> &'static str {
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

#[cfg(test)]
mod canonical_tests {
    use super::*;

    // m2.h ELEM_SIG_PACK: elem bits[2:0], chakra bits[5:3], phase bits[7:6]
    const fn elem_sig_pack(elem: u8, chakra: u8, phase: u8) -> u8 {
        (elem & 0x07) | ((chakra & 0x07) << 3) | ((phase & 0x03) << 6)
    }

    #[test]
    fn elem_sig_chakra_matches_c_macro_packing() {
        // For every (elem, chakra, phase) the extractor must recover chakra.
        for elem in 0u8..8 {
            for chakra in 0u8..8 {
                for phase in 0u8..4 {
                    let sig = elem_sig_pack(elem, chakra, phase);
                    assert_eq!(
                        elem_sig_chakra(sig),
                        chakra,
                        "elem={elem} chakra={chakra} phase={phase} sig={sig:#010b}"
                    );
                }
            }
        }
    }

    #[test]
    fn elem_sig_bit_fix_differs_from_old_bug() {
        // Old buggy extraction `(sig >> 2) & 0b111` straddled element/chakra.
        // Demonstrate the fix changes the result for a representative packing:
        // Fire(4) + Anahata(4) + descent(0).
        let sig = elem_sig_pack(4, 4, 0);
        let old_buggy = (sig >> 2) & 0b111;
        assert_eq!(elem_sig_chakra(sig), 4); // correct chakra
        assert_ne!(old_buggy, 4); // the old code returned the wrong chakra
    }

    #[test]
    fn medicine_rs_legacy_round_trips() {
        // Canonical values that have a medicine-legacy counterpart.
        for canonical in [0u8, 1, 2, 3, 4] {
            let legacy = canonical_to_medicine_rs_legacy(canonical);
            assert_eq!(canonical_from_medicine_rs_legacy(legacy), canonical);
        }
        // Legacy domain 0-4 round-trips too.
        for legacy in 0u8..5 {
            let canonical = canonical_from_medicine_rs_legacy(legacy);
            assert_eq!(canonical_to_medicine_rs_legacy(canonical), legacy);
        }
        // Salt (5) has no legacy counterpart.
        assert_eq!(canonical_to_medicine_rs_legacy(5), 0xFF);
    }

    #[test]
    fn canonical_element_id_round_trip() {
        // Tranche 05.T5.16 named invariant: canonical → legacy → canonical ==
        // identity for every Rust-side conversion helper. (The C-side helpers
        // — m4_h legacy and the m2-3 branch bijection — are covered by the
        // epi-lib `test_m_canonical` suite; this is the Rust mirror.)
        //
        // medicine.rs legacy (== m2.h tattva Element_Id) pair:
        for canonical in [0u8, 1, 2, 3, 4] {
            let legacy = canonical_to_medicine_rs_legacy(canonical);
            assert_ne!(legacy, 0xFF, "canonical {canonical} must have a legacy id");
            assert_eq!(
                canonical_from_medicine_rs_legacy(legacy),
                canonical,
                "canonical → medicine-legacy → canonical failed for {canonical}"
            );
        }
        // ...and the legacy → canonical → legacy direction:
        for legacy in 0u8..5 {
            let canonical = canonical_from_medicine_rs_legacy(legacy);
            assert_eq!(canonical_to_medicine_rs_legacy(canonical), legacy);
        }
        // The honest-name alias participates in the identical round trip.
        for legacy in 0u8..5 {
            assert_eq!(
                canonical_from_m2_tattva(canonical_to_medicine_rs_legacy(
                    canonical_from_m2_tattva(legacy)
                )),
                canonical_from_m2_tattva(legacy)
            );
        }
        // Salt (5) has no medicine-legacy counterpart: invalid sentinel, and
        // the sentinel never round-trips into a valid canonical id.
        assert_eq!(canonical_to_medicine_rs_legacy(5), 0xFF);
        assert_eq!(canonical_from_medicine_rs_legacy(0xFF), 0xFF);
        // One-way converters (no legacy inverse) still land inside the
        // canonical-B enum for their whole domain: nucleotide + m3 decan.
        for nuc in 0u8..4 {
            assert!(canonical_from_nucleotide(nuc) <= 5);
        }
        for decan_elem in 0u8..5 {
            assert!(canonical_from_m3_decan_element(decan_elem) <= 5);
        }
    }

    #[test]
    fn body_zones_for_elem_sig_bit_layout() {
        // Tranche 05.T5.16 named invariant: `body_zones_for_elem_sig` extracts
        // the chakra from bits 5:3 (m2.h ELEM_SIG_GET_CHAKRA), NOT the old
        // buggy bits 4:2 straddle. For every packed signature the returned
        // zones must be exactly the packed chakra's zones.
        for elem in 0u8..8 {
            for chakra in 0u8..8 {
                for phase in 0u8..4 {
                    let sig = elem_sig_pack(elem, chakra, phase);
                    assert_eq!(
                        body_zones_for_elem_sig(sig),
                        body_zones_for_chakra(chakra),
                        "elem={elem} chakra={chakra} phase={phase} sig={sig:#010b}"
                    );
                }
            }
        }
        // Regression witness: a signature where the old `(sig >> 2) & 0b111`
        // extraction disagrees with the canonical bit layout. Fire(4) packed
        // with Anahata(4): old code read chakra 1 (Muladhara) — wrong zones.
        let sig = elem_sig_pack(4, 4, 0);
        let old_buggy_chakra = (sig >> 2) & 0b111;
        assert_ne!(old_buggy_chakra, 4);
        assert_eq!(body_zones_for_elem_sig(sig), body_zones_for_chakra(4));
        assert_ne!(
            body_zones_for_elem_sig(sig),
            body_zones_for_chakra(old_buggy_chakra)
        );
    }

    #[test]
    fn chakra_lookup_is_invariant_under_migration() {
        // Pre-migration ELEMENT_CHAKRA was legacy-indexed: [5,4,3,2,1].
        // After re-keying, converting the legacy id then indexing the canonical
        // table MUST yield the identical chakra — this is what guarantees
        // balance()/chakra() output is unchanged under the new ID labels.
        const LEGACY_ELEMENT_CHAKRA: [u8; 5] = [5, 4, 3, 2, 1];
        for legacy in 0u8..5 {
            let canonical = canonical_from_medicine_rs_legacy(legacy);
            assert_eq!(
                chakra_for_element(canonical),
                LEGACY_ELEMENT_CHAKRA[legacy as usize],
                "legacy element {legacy} chakra mismatch"
            );
        }
    }

    #[test]
    fn element_name_is_label_preserving() {
        // A legacy element and its canonical conversion must print the same name.
        let legacy_names = ["Akasha-ish", "Air", "Fire", "Water", "Earth"];
        let expected = ["Aether", "Air", "Fire", "Water", "Earth"];
        for legacy in 0u8..5 {
            let canonical = canonical_from_medicine_rs_legacy(legacy);
            assert_eq!(element_name(canonical), expected[legacy as usize]);
            let _ = legacy_names; // documentation only
        }
        assert_eq!(element_name(5), "Salt");
    }

    #[test]
    fn canonical_tables_well_formed() {
        assert_eq!(ELEMENT_CHAKRA.len(), 6);
        assert_eq!(ELEMENT_CHAKRA[5], 7, "Salt → Sahasrara");
        // SIGN_ELEMENT is canonical: Aries=Fire(4), Taurus=Earth(1).
        assert_eq!(SIGN_ELEMENT[0], 4);
        assert_eq!(SIGN_ELEMENT[1], 1);
        // Operative quartet membership.
        assert!(canonical_is_operative(1) && canonical_is_operative(4));
        assert!(!canonical_is_operative(0) && !canonical_is_operative(5));
    }

    #[test]
    fn m2_tattva_alias_is_identical() {
        // The honest name and the back-compat alias must agree on the whole
        // domain (and the invalid sentinel).
        for tattva in 0u8..=8 {
            assert_eq!(
                canonical_from_m2_tattva(tattva),
                canonical_from_medicine_rs_legacy(tattva),
                "tattva {tattva}: alias diverged from canonical_from_m2_tattva"
            );
        }
    }

    #[test]
    fn m2_tattva_maps_every_element_to_canonical_b() {
        // Scheme A (AKASHA=0, VAYU=1, AGNI=2, APAS=3, PRITHVI=4) → canonical-B.
        assert_eq!(canonical_from_m2_tattva(0), 0, "AKASHA → Aether");
        assert_eq!(canonical_from_m2_tattva(1), 3, "VAYU → Air");
        assert_eq!(canonical_from_m2_tattva(2), 4, "AGNI → Fire");
        assert_eq!(canonical_from_m2_tattva(3), 2, "APAS → Water");
        assert_eq!(canonical_from_m2_tattva(4), 1, "PRITHVI → Earth");
        // Out of range → invalid sentinel.
        assert_eq!(canonical_from_m2_tattva(5), 0xFF);
        assert_eq!(canonical_from_m2_tattva(255), 0xFF);
    }

    #[test]
    fn m3_decan_element_maps_every_element_to_canonical_b() {
        // Scheme D (Fire=0, Earth=1, Air=2, Water=3, Akasha=4) → canonical-B.
        assert_eq!(canonical_from_m3_decan_element(0), 4, "Fire → Fire");
        assert_eq!(canonical_from_m3_decan_element(1), 1, "Earth → Earth");
        assert_eq!(canonical_from_m3_decan_element(2), 3, "Air → Air");
        assert_eq!(canonical_from_m3_decan_element(3), 2, "Water → Water");
        assert_eq!(canonical_from_m3_decan_element(4), 0, "Akasha → Aether");
        // Out of range → invalid sentinel.
        assert_eq!(canonical_from_m3_decan_element(5), 0xFF);
        assert_eq!(canonical_from_m3_decan_element(255), 0xFF);
        // The operative quartet (Fire/Earth/Air/Water) lands in canonical 1-4;
        // Akasha lands on Aether (0), which is NOT operative.
        for decan_element in 0u8..4 {
            assert!(canonical_is_operative(canonical_from_m3_decan_element(
                decan_element
            )));
        }
        assert!(!canonical_is_operative(canonical_from_m3_decan_element(4)));
    }

    #[test]
    fn nucleotide_maps_every_base_to_canonical_b() {
        // Scheme C — Golden-Dawn/Thoth: A=Water, T=Fire, C=Earth, G=Air
        // (2-bit nucleotide A=0, T=1, C=2, G=3). DR-37-5: code-canonical.
        assert_eq!(canonical_from_nucleotide(0), 2, "A → Water (Cups)");
        assert_eq!(canonical_from_nucleotide(1), 4, "T → Fire (Wands)");
        assert_eq!(canonical_from_nucleotide(2), 1, "C → Earth (Pentacles)");
        assert_eq!(canonical_from_nucleotide(3), 3, "G → Air (Swords)");
        // Out of range → invalid sentinel.
        assert_eq!(canonical_from_nucleotide(4), 0xFF);
        assert_eq!(canonical_from_nucleotide(255), 0xFF);
        // Every nucleotide is one of the four operative classical elements —
        // Akasha never arises from a nucleotide (it emerges from balance).
        for nuc in 0u8..4 {
            assert!(
                canonical_is_operative(canonical_from_nucleotide(nuc)),
                "nucleotide {nuc} did not map into the operative quartet"
            );
        }
        // The stale clock-spec §15.3 table (scheme E: A=Fire/T=Earth/C=Air/
        // G=Water) is explicitly NOT what we implement — guard against drift.
        assert_ne!(
            canonical_from_nucleotide(0),
            4,
            "A must be Water, not Fire (DR-37-5)"
        );
        assert_ne!(
            canonical_from_nucleotide(1),
            1,
            "T must be Fire, not Earth (DR-37-5)"
        );
    }

    #[test]
    fn all_converters_land_in_the_single_canonical_b_enum() {
        // Track 18 invariant: every converter's output is a member of the ONE
        // canonical-B element enum (0..=5) or the invalid sentinel — never a
        // raw foreign-scheme integer. This is what lets a single canonical
        // element-ID enum be asserted at the M2↔M3 bridge.
        let is_canonical_b = |e: u8| e <= 5 || e == 0xFF;
        for v in 0u8..=255 {
            assert!(is_canonical_b(canonical_from_m2_tattva(v)));
            assert!(is_canonical_b(canonical_from_m3_decan_element(v)));
            assert!(is_canonical_b(canonical_from_nucleotide(v)));
        }
    }

    #[test]
    fn zodiac_decan_elements_are_canonical() {
        // Every decan carries the operative quartet; signs map to canonical ids
        // matching SIGN_ELEMENT.
        for entry in ZODIAC_DECAN_TABLE.iter() {
            assert!(
                canonical_is_operative(entry.element),
                "decan sign {} element {} not operative",
                entry.sign,
                entry.element
            );
            assert_eq!(entry.element, SIGN_ELEMENT[entry.sign as usize]);
        }
    }
}
