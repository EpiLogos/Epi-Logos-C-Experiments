use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

// ─── Golden Dawn Decan Tables ─────────────────────────────────────────────
//
// Three static tables encoding the Golden Dawn Thoth Tarot decan assignments.
//
// PLANET ID constants (mirrors m2.h Planet_Id enum):
//   SUN=0, EARTH=1, VENUS=2, MERCURY=3, MOON=4, SATURN=5, JUPITER=6, MARS=7
//
// SUIT constants (mirrors m3.h Tarot_Suit enum):
//   SUIT_CUPS=0, SUIT_WANDS=1, SUIT_PENTACLES=2, SUIT_SWORDS=3
//
// ZODIAC sign indices 0-11:
//   Aries=0, Taurus=1, Gemini=2, Cancer=3, Leo=4, Virgo=5,
//   Libra=6, Scorpio=7, Sagittarius=8, Capricorn=9, Aquarius=10, Pisces=11

/// Planet ID constants mirroring m2.h `Planet_Id`.
pub mod planet {
    pub const SUN: u8 = 0;
    pub const EARTH: u8 = 1;
    pub const VENUS: u8 = 2;
    pub const MERCURY: u8 = 3;
    pub const MOON: u8 = 4;
    pub const SATURN: u8 = 5;
    pub const JUPITER: u8 = 6;
    pub const MARS: u8 = 7;
}

/// Zodiac sign indices 0-11 (Aries=0 … Pisces=11).
pub mod sign {
    pub const ARIES: u8 = 0;
    pub const TAURUS: u8 = 1;
    pub const GEMINI: u8 = 2;
    pub const CANCER: u8 = 3;
    pub const LEO: u8 = 4;
    pub const VIRGO: u8 = 5;
    pub const LIBRA: u8 = 6;
    pub const SCORPIO: u8 = 7;
    pub const SAGITTARIUS: u8 = 8;
    pub const CAPRICORN: u8 = 9;
    pub const AQUARIUS: u8 = 10;
    pub const PISCES: u8 = 11;
}

/// Element ID constants mirroring m2.h `Element_Id`.
pub mod element {
    pub const AKASHA: u8 = 0;
    pub const VAYU: u8 = 1;   // Air
    pub const AGNI: u8 = 2;   // Fire
    pub const APAS: u8 = 3;   // Water
    pub const PRITHVI: u8 = 4; // Earth
}

/// Entry in the pip decan map. All values are u8 to avoid FFI complexity.
///
/// `zodiac_sign`: 0-11 (Aries=0 … Pisces=11)
/// `decan`:       0-2  (first, second, third decan of the sign)
/// `ruling_planet`: mirrors m2.h Planet_Id (SUN=0, MOON=4, MERCURY=3, VENUS=2,
///                  MARS=7, JUPITER=6, SATURN=5)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct PipDecanEntry {
    pub zodiac_sign: u8,
    pub decan: u8,
    pub ruling_planet: u8,
}

/// PIP_DECAN_MAP[suit][value_index] where value_index 0 = Two, 8 = Ten.
///
/// Outer index = suit: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
///   (mirrors m3.h Tarot_Suit: SUIT_CUPS=0, SUIT_WANDS=1, SUIT_PENTACLES=2, SUIT_SWORDS=3)
/// Inner index = pip value - 2  (0 = Two … 8 = Ten)
///
/// Source: Golden Dawn decan assignments as used in the Thoth Tarot.
/// Each pip card 2-10 corresponds to a 10° decan of a fire/water/earth/air sign,
/// assigned by the Chaldean order of planets cycling through the decans.
pub static PIP_DECAN_MAP: [[PipDecanEntry; 9]; 4] = {
    use planet::*;
    use sign::*;
    // Helper: PipDecanEntry literal shorthand
    const fn e(zodiac_sign: u8, decan: u8, ruling_planet: u8) -> PipDecanEntry {
        PipDecanEntry { zodiac_sign, decan, ruling_planet }
    }

    [
        // ── CUPS (Water / suit index 0) ──────────────────────────────────
        // Cancer, Scorpio, Pisces — the three water signs
        [
            e(CANCER,      0, VENUS),    // 2C: Cancer decan 1
            e(CANCER,      1, MERCURY),  // 3C: Cancer decan 2
            e(CANCER,      2, MOON),     // 4C: Cancer decan 3
            e(SCORPIO,     0, MARS),     // 5C: Scorpio decan 1
            e(SCORPIO,     1, SUN),      // 6C: Scorpio decan 2
            e(SCORPIO,     2, VENUS),    // 7C: Scorpio decan 3
            e(PISCES,      0, SATURN),   // 8C: Pisces decan 1
            e(PISCES,      1, JUPITER),  // 9C: Pisces decan 2
            e(PISCES,      2, MARS),     // 10C: Pisces decan 3
        ],
        // ── WANDS (Fire / suit index 1) ──────────────────────────────────
        // Aries, Leo, Sagittarius — the three fire signs
        [
            e(ARIES,       0, MARS),     // 2W: Aries decan 1
            e(ARIES,       1, SUN),      // 3W: Aries decan 2
            e(ARIES,       2, VENUS),    // 4W: Aries decan 3
            e(LEO,         0, SATURN),   // 5W: Leo decan 1
            e(LEO,         1, JUPITER),  // 6W: Leo decan 2
            e(LEO,         2, MARS),     // 7W: Leo decan 3
            e(SAGITTARIUS, 0, MERCURY),  // 8W: Sagittarius decan 1
            e(SAGITTARIUS, 1, MOON),     // 9W: Sagittarius decan 2
            e(SAGITTARIUS, 2, SATURN),   // 10W: Sagittarius decan 3
        ],
        // ── PENTACLES (Earth / suit index 2) ─────────────────────────────
        // Capricorn, Taurus, Virgo — the three earth signs
        [
            e(CAPRICORN,   0, JUPITER),  // 2P: Capricorn decan 1
            e(CAPRICORN,   1, MARS),     // 3P: Capricorn decan 2
            e(CAPRICORN,   2, SUN),      // 4P: Capricorn decan 3
            e(TAURUS,      0, MERCURY),  // 5P: Taurus decan 1
            e(TAURUS,      1, MOON),     // 6P: Taurus decan 2
            e(TAURUS,      2, SATURN),   // 7P: Taurus decan 3
            e(VIRGO,       0, SUN),      // 8P: Virgo decan 1
            e(VIRGO,       1, VENUS),    // 9P: Virgo decan 2
            e(VIRGO,       2, MERCURY),  // 10P: Virgo decan 3
        ],
        // ── SWORDS (Air / suit index 3) ──────────────────────────────────
        // Libra, Aquarius, Gemini — the three air signs
        [
            e(LIBRA,       0, MOON),     // 2S: Libra decan 1
            e(LIBRA,       1, SATURN),   // 3S: Libra decan 2
            e(LIBRA,       2, JUPITER),  // 4S: Libra decan 3
            e(AQUARIUS,    0, VENUS),    // 5S: Aquarius decan 1
            e(AQUARIUS,    1, MERCURY),  // 6S: Aquarius decan 2
            e(AQUARIUS,    2, MOON),     // 7S: Aquarius decan 3
            e(GEMINI,      0, JUPITER),  // 8S: Gemini decan 1
            e(GEMINI,      1, MARS),     // 9S: Gemini decan 2
            e(GEMINI,      2, SUN),      // 10S: Gemini decan 3
        ],
    ]
};

/// Entry in the court card sign map.
///
/// Golden Dawn courts each rule a zodiacal band spanning the last 10° of one sign
/// and the first 20° of the next (or in some cases a primary single sign).
/// `sign_a` is the primary sign; `sign_b` is the secondary sign, or `0xFF` if
/// the court rules only one sign.
///
/// Court rank indices mirror m3.h pip values:
///   10=Princess, 11=Prince, 12=Queen, 13=King
///   Thoth deck uses Princess/Prince (not Page/Knight).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CourtSignEntry {
    /// Primary zodiac sign (0-11)
    pub sign_a: u8,
    /// Secondary zodiac sign (0-11), or 0xFF for single-sign courts
    pub sign_b: u8,
    /// Suit index: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
    pub suit: u8,
    /// Court rank: 10=Princess, 11=Prince, 12=Queen, 13=King
    pub rank: u8,
}

/// COURT_SIGN_MAP[suit][court_index] — court_index 0=Princess, 1=Prince, 2=Queen, 3=King.
///
/// Outer index = suit: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
/// Inner index = 0=Princess(earthy), 1=Prince(airy), 2=Queen(watery), 3=King(fiery)
///
/// Golden Dawn zodiacal band assignments:
///   Each court rules from 20° of one sign to 20° of the next (the cusp band).
///   Sign pairs are listed as (last_sign, next_sign); `sign_b = 0xFF` for
///   courts that are commonly assigned primarily to a single sign.
///
/// References: Golden Dawn correspondence tables (Regardie); Thoth Tarot (Crowley/Harris).
pub static COURT_SIGN_MAP: [[CourtSignEntry; 4]; 4] = {
    use sign::*;
    const fn c(suit: u8, rank: u8, sign_a: u8, sign_b: u8) -> CourtSignEntry {
        CourtSignEntry { sign_a, sign_b, suit, rank }
    }
    const NONE: u8 = 0xFF;

    [
        // ── CUPS (suit 0) ─────────────────────────────────────────────────
        [
            c(0, 10, CANCER,      NONE),       // Princess of Cups — earthy/Cancer
            c(0, 11, LIBRA,       SCORPIO),    // Prince of Cups — Libra-Scorpio cusp
            c(0, 12, GEMINI,      CANCER),     // Queen of Cups — Gemini-Cancer cusp
            c(0, 13, PISCES,      ARIES),      // King of Cups — Pisces-Aries cusp
        ],
        // ── WANDS (suit 1) ────────────────────────────────────────────────
        [
            c(1, 10, ARIES,       NONE),       // Princess of Wands — earthy/Aries
            c(1, 11, CANCER,      LEO),        // Prince of Wands — Cancer-Leo cusp
            c(1, 12, PISCES,      ARIES),      // Queen of Wands — Pisces-Aries cusp
            c(1, 13, SAGITTARIUS, CAPRICORN),  // King of Wands — Sagittarius-Capricorn cusp
        ],
        // ── PENTACLES (suit 2) ────────────────────────────────────────────
        [
            c(2, 10, CAPRICORN,   NONE),       // Princess of Pentacles — earthy/Capricorn
            c(2, 11, ARIES,       TAURUS),     // Prince of Pentacles — Aries-Taurus cusp
            c(2, 12, CAPRICORN,   AQUARIUS),   // Queen of Pentacles — Capricorn-Aquarius cusp
            c(2, 13, VIRGO,       LIBRA),      // King of Pentacles — Virgo-Libra cusp
        ],
        // ── SWORDS (suit 3) ───────────────────────────────────────────────
        [
            c(3, 10, LIBRA,       NONE),       // Princess of Swords — earthy/Libra
            c(3, 11, CAPRICORN,   AQUARIUS),   // Prince of Swords — Capricorn-Aquarius cusp
            c(3, 12, VIRGO,       LIBRA),      // Queen of Swords — Virgo-Libra cusp
            c(3, 13, GEMINI,      CANCER),     // King of Swords — Gemini-Cancer cusp
        ],
    ]
};

/// Entry in the Ace element map.
///
/// `suit`: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
/// `element_id`: mirrors m2.h Element_Id (AKASHA=0, VAYU=1, AGNI=2, APAS=3, PRITHVI=4)
/// `element_name`: canonical Sanskrit name
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct AceElementEntry {
    pub suit: u8,
    pub element_id: u8,
    pub element_name: &'static str,
}

/// ACE_ELEMENT_MAP[suit] — each Ace is the root of its element.
///
/// Index = suit: 0=Cups(Water/Apas), 1=Wands(Fire/Agni),
///               2=Pentacles(Earth/Prithvi), 3=Swords(Air/Vayu)
///
/// Aces are the primal root of each element — the seed-force before the numbered
/// sequence begins. They do not receive a decan assignment; they ARE the element.
pub static ACE_ELEMENT_MAP: [AceElementEntry; 4] = [
    AceElementEntry { suit: 0, element_id: element::APAS,    element_name: "Apas"    }, // Cups → Water
    AceElementEntry { suit: 1, element_id: element::AGNI,    element_name: "Agni"    }, // Wands → Fire
    AceElementEntry { suit: 2, element_id: element::PRITHVI, element_name: "Prithvi" }, // Pentacles → Earth
    AceElementEntry { suit: 3, element_id: element::VAYU,    element_name: "Vayu"    }, // Swords → Air
];

/// Look up the decan entry for a pip card by suit and card value.
///
/// `suit`: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
///         (mirrors m3.h SUIT_CUPS=0, SUIT_WANDS=1, SUIT_PENTACLES=2, SUIT_SWORDS=3)
/// `value`: 2-10 (pip value; Ace=1 is excluded — use ACE_ELEMENT_MAP instead)
///
/// Returns `None` if `suit > 3` or `value` is outside the range 2-10.
#[inline]
pub fn pip_decan_lookup(suit: u8, value: u8) -> Option<PipDecanEntry> {
    if suit > 3 || value < 2 || value > 10 {
        return None;
    }
    Some(PIP_DECAN_MAP[suit as usize][(value - 2) as usize])
}

/// Look up the zodiac sign entry for a court card by suit and rank.
///
/// `suit`: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
/// `rank`: 10=Princess, 11=Prince, 12=Queen, 13=King
///         (mirrors m3.h M3_TAROT_PIP_PRINCESS=10 … M3_TAROT_PIP_KING=13)
///
/// Returns `None` if `suit > 3` or `rank` is outside 10-13.
#[inline]
pub fn court_sign_lookup(suit: u8, rank: u8) -> Option<CourtSignEntry> {
    if suit > 3 || rank < 10 || rank > 13 {
        return None;
    }
    Some(COURT_SIGN_MAP[suit as usize][(rank - 10) as usize])
}

/// Look up the element entry for an Ace by suit.
///
/// `suit`: 0=Cups, 1=Wands, 2=Pentacles, 3=Swords
///
/// Returns `None` if `suit > 3`.
#[inline]
pub fn ace_element_lookup(suit: u8) -> Option<AceElementEntry> {
    if suit > 3 {
        return None;
    }
    Some(ACE_ELEMENT_MAP[suit as usize])
}

// ─── Hexagram Body Dynamics ──────────────────────────────────────────────
//
// Chakra_Id constants used below:
//   EARTH=0, MULADHARA=1, SVADHISTHANA=2, MANIPURA=3,
//   ANAHATA=4, VISHUDDHA=5, AJNA=6, SAHASRARA=7
//
// Body zone → primary chakra mapping:
//   Head/Lungs              → AJNA (6)
//   Eyes/Heart              → ANAHATA (4)
//   Mouth/Chest             → VISHUDDHA (5)
//   Abdomen/Spleen          → MANIPURA (3)
//   Thighs/Hips/Respiratory → SVADHISTHANA (2)
//   Kidneys/Ears            → SVADHISTHANA (2)
//   Feet/Liver              → MULADHARA (1)
//   Back/Hands/Joints       → MULADHARA (1)

/// Body zone interaction for each of the 64 I Ching hexagrams.
/// Derived from M3 Mahamaya dataset `bodyDynamics` properties.
/// Index 0 = hexagram 1, index 63 = hexagram 64.
pub struct HexagramBodyEntry {
    /// Hexagram number 1-64.
    pub hexagram_number: u8,
    /// Primary chakra ID (0=Earth/none, 1=Muladhara, 2=Svadhisthana, 3=Manipura,
    ///  4=Anahata, 5=Vishuddha, 6=Ajna, 7=Sahasrara).
    pub primary_chakra: u8,
    /// Secondary chakra ID (same encoding as `primary_chakra`).
    pub secondary_chakra: u8,
    /// Named body zones active in this hexagram (lowercase snake_case).
    pub body_zones: &'static [&'static str],
    /// Brief dynamics description (from M3 bodyDynamics, ≤80 chars).
    pub dynamics: &'static str,
}

/// HEXAGRAM_BODY_DYNAMICS\[i\] corresponds to hexagram number i+1 (0-indexed).
///
/// All 64 entries derived directly from the M3 Mahamaya dataset
/// `bodyDynamics` field at coordinates `#3-1-X-Y`.
pub static HEXAGRAM_BODY_DYNAMICS: [HexagramBodyEntry; 64] = [
    // Hexagram 1: Qian — The Creative (Heaven/Heaven)
    HexagramBodyEntry {
        hexagram_number: 1,
        primary_chakra: 6,
        secondary_chakra: 6,
        body_zones: &["head", "lungs"],
        dynamics: "Head/Lungs governing Head/Lungs",
    },
    // Hexagram 2: Kun — The Receptive (Earth/Earth)
    HexagramBodyEntry {
        hexagram_number: 2,
        primary_chakra: 3,
        secondary_chakra: 3,
        body_zones: &["abdomen", "spleen"],
        dynamics: "Abdomen/Spleen nurturing Abdomen/Spleen",
    },
    // Hexagram 3: Zhun — Difficulty at the Beginning (Water/Thunder)
    HexagramBodyEntry {
        hexagram_number: 3,
        primary_chakra: 1,
        secondary_chakra: 2,
        body_zones: &["feet", "liver", "kidneys", "ears"],
        dynamics: "Feet/Liver struggling with Kidneys/Ears",
    },
    // Hexagram 4: Meng — Youthful Folly (Mountain/Water)
    HexagramBodyEntry {
        hexagram_number: 4,
        primary_chakra: 2,
        secondary_chakra: 1,
        body_zones: &["kidneys", "ears", "back", "hands", "joints"],
        dynamics: "Kidneys/Ears contained by Back/Hands/Joints",
    },
    // Hexagram 5: Xu — Waiting / Nourishment (Water/Heaven)
    HexagramBodyEntry {
        hexagram_number: 5,
        primary_chakra: 6,
        secondary_chakra: 2,
        body_zones: &["head", "lungs", "kidneys", "ears"],
        dynamics: "Head/Lungs waiting beneath Kidneys/Ears",
    },
    // Hexagram 6: Song — Conflict (Heaven/Water)
    HexagramBodyEntry {
        hexagram_number: 6,
        primary_chakra: 2,
        secondary_chakra: 6,
        body_zones: &["kidneys", "ears", "head", "lungs"],
        dynamics: "Kidneys/Ears confronting Head/Lungs",
    },
    // Hexagram 7: Shi — The Army (Earth/Water)
    HexagramBodyEntry {
        hexagram_number: 7,
        primary_chakra: 2,
        secondary_chakra: 3,
        body_zones: &["kidneys", "ears", "abdomen", "spleen"],
        dynamics: "Kidneys/Ears organized by Abdomen/Spleen",
    },
    // Hexagram 8: Bi — Holding Together (Water/Earth)
    HexagramBodyEntry {
        hexagram_number: 8,
        primary_chakra: 3,
        secondary_chakra: 2,
        body_zones: &["abdomen", "spleen", "kidneys", "ears"],
        dynamics: "Abdomen/Spleen supporting Kidneys/Ears",
    },
    // Hexagram 9: Xiao Chu — Taming Power of the Small (Wind/Heaven)
    HexagramBodyEntry {
        hexagram_number: 9,
        primary_chakra: 6,
        secondary_chakra: 2,
        body_zones: &["head", "lungs", "thighs", "hips"],
        dynamics: "Head/Lungs moderated by Thighs/Hips/Respiratory",
    },
    // Hexagram 10: Lu — Treading (Heaven/Lake)
    HexagramBodyEntry {
        hexagram_number: 10,
        primary_chakra: 5,
        secondary_chakra: 6,
        body_zones: &["mouth", "chest", "head", "lungs"],
        dynamics: "Mouth/Chest supporting Head/Lungs",
    },
    // Hexagram 11: Tai — Peace (Earth/Heaven)
    HexagramBodyEntry {
        hexagram_number: 11,
        primary_chakra: 6,
        secondary_chakra: 3,
        body_zones: &["head", "lungs", "abdomen", "spleen"],
        dynamics: "Head/Lungs rising to meet Abdomen/Spleen",
    },
    // Hexagram 12: Pi — Standstill (Heaven/Earth)
    HexagramBodyEntry {
        hexagram_number: 12,
        primary_chakra: 3,
        secondary_chakra: 6,
        body_zones: &["abdomen", "spleen", "head", "lungs"],
        dynamics: "Abdomen/Spleen separated from Head/Lungs",
    },
    // Hexagram 13: Tong Ren — Fellowship (Heaven/Fire)
    HexagramBodyEntry {
        hexagram_number: 13,
        primary_chakra: 4,
        secondary_chakra: 6,
        body_zones: &["eyes", "heart", "head", "lungs"],
        dynamics: "Eyes/Heart illuminating Head/Lungs",
    },
    // Hexagram 14: Da You — Great Possession (Fire/Heaven)
    HexagramBodyEntry {
        hexagram_number: 14,
        primary_chakra: 6,
        secondary_chakra: 4,
        body_zones: &["head", "lungs", "eyes", "heart"],
        dynamics: "Head/Lungs crowned by Eyes/Heart",
    },
    // Hexagram 15: Qian — Modesty (Earth/Mountain)
    HexagramBodyEntry {
        hexagram_number: 15,
        primary_chakra: 1,
        secondary_chakra: 3,
        body_zones: &["back", "hands", "joints", "abdomen", "spleen"],
        dynamics: "Back/Hands/Joints hidden by Abdomen/Spleen",
    },
    // Hexagram 16: Yu — Enthusiasm (Thunder/Earth)
    HexagramBodyEntry {
        hexagram_number: 16,
        primary_chakra: 3,
        secondary_chakra: 1,
        body_zones: &["abdomen", "spleen", "feet", "liver"],
        dynamics: "Abdomen/Spleen mobilized by Feet/Liver",
    },
    // Hexagram 17: Sui — Following (Lake/Thunder)
    HexagramBodyEntry {
        hexagram_number: 17,
        primary_chakra: 1,
        secondary_chakra: 5,
        body_zones: &["feet", "liver", "mouth", "chest"],
        dynamics: "Feet/Liver followed by Mouth/Chest",
    },
    // Hexagram 18: Gu — Work on Spoiled (Mountain/Wind)
    HexagramBodyEntry {
        hexagram_number: 18,
        primary_chakra: 2,
        secondary_chakra: 1,
        body_zones: &["thighs", "hips", "back", "hands", "joints"],
        dynamics: "Thighs/Hips/Respiratory blocked by Back/Hands/Joints",
    },
    // Hexagram 19: Lin — Approach (Earth/Lake)
    HexagramBodyEntry {
        hexagram_number: 19,
        primary_chakra: 5,
        secondary_chakra: 3,
        body_zones: &["mouth", "chest", "abdomen", "spleen"],
        dynamics: "Mouth/Chest nurtured by Abdomen/Spleen",
    },
    // Hexagram 20: Guan — Contemplation (Wind/Earth)
    HexagramBodyEntry {
        hexagram_number: 20,
        primary_chakra: 3,
        secondary_chakra: 2,
        body_zones: &["abdomen", "spleen", "thighs", "hips"],
        dynamics: "Abdomen/Spleen observed by Thighs/Hips/Respiratory",
    },
    // Hexagram 21: Shi Ke — Biting Through (Fire/Thunder)
    HexagramBodyEntry {
        hexagram_number: 21,
        primary_chakra: 1,
        secondary_chakra: 4,
        body_zones: &["feet", "liver", "eyes", "heart"],
        dynamics: "Feet/Liver illuminated by Eyes/Heart",
    },
    // Hexagram 22: Bi — Grace (Mountain/Fire)
    HexagramBodyEntry {
        hexagram_number: 22,
        primary_chakra: 4,
        secondary_chakra: 1,
        body_zones: &["eyes", "heart", "back", "hands", "joints"],
        dynamics: "Eyes/Heart adorning Back/Hands/Joints",
    },
    // Hexagram 23: Bo — Splitting Apart (Mountain/Earth)
    HexagramBodyEntry {
        hexagram_number: 23,
        primary_chakra: 3,
        secondary_chakra: 1,
        body_zones: &["abdomen", "spleen", "back", "hands", "joints"],
        dynamics: "Abdomen/Spleen withdrawing from Back/Hands/Joints",
    },
    // Hexagram 24: Fu — Return (Earth/Thunder)
    HexagramBodyEntry {
        hexagram_number: 24,
        primary_chakra: 3,
        secondary_chakra: 1,
        body_zones: &["abdomen", "spleen", "feet", "liver"],
        dynamics: "Abdomen/Spleen receiving Feet/Liver",
    },
    // Hexagram 25: Wu Wang — Innocence (Heaven/Thunder)
    HexagramBodyEntry {
        hexagram_number: 25,
        primary_chakra: 1,
        secondary_chakra: 6,
        body_zones: &["feet", "liver", "head", "lungs"],
        dynamics: "Feet/Liver aligned with Head/Lungs",
    },
    // Hexagram 26: Da Chu — Great Taming (Mountain/Heaven)
    HexagramBodyEntry {
        hexagram_number: 26,
        primary_chakra: 6,
        secondary_chakra: 1,
        body_zones: &["head", "lungs", "back", "hands", "joints"],
        dynamics: "Head/Lungs restrained by Back/Hands/Joints",
    },
    // Hexagram 27: Yi — Nourishment (Mountain/Thunder)
    HexagramBodyEntry {
        hexagram_number: 27,
        primary_chakra: 1,
        secondary_chakra: 1,
        body_zones: &["feet", "liver", "back", "hands", "joints"],
        dynamics: "Feet/Liver stabilized by Back/Hands/Joints",
    },
    // Hexagram 28: Da Guo — Great Exceeding (Lake/Wind)
    HexagramBodyEntry {
        hexagram_number: 28,
        primary_chakra: 2,
        secondary_chakra: 5,
        body_zones: &["thighs", "hips", "mouth", "chest"],
        dynamics: "Thighs/Hips/Respiratory overwhelmed by Mouth/Chest",
    },
    // Hexagram 29: Kan — The Abysmal Water (Water/Water)
    HexagramBodyEntry {
        hexagram_number: 29,
        primary_chakra: 2,
        secondary_chakra: 2,
        body_zones: &["kidneys", "ears"],
        dynamics: "Kidneys/Ears deepening Kidneys/Ears",
    },
    // Hexagram 30: Li — The Clinging Fire (Fire/Fire)
    HexagramBodyEntry {
        hexagram_number: 30,
        primary_chakra: 4,
        secondary_chakra: 4,
        body_zones: &["eyes", "heart"],
        dynamics: "Eyes/Heart illuminating Eyes/Heart",
    },
    // Hexagram 31: Xian — Influence (Lake/Mountain)
    HexagramBodyEntry {
        hexagram_number: 31,
        primary_chakra: 1,
        secondary_chakra: 5,
        body_zones: &["back", "hands", "joints", "mouth", "chest"],
        dynamics: "Back/Hands/Joints attracting Mouth/Chest",
    },
    // Hexagram 32: Heng — Duration (Thunder/Wind)
    HexagramBodyEntry {
        hexagram_number: 32,
        primary_chakra: 2,
        secondary_chakra: 1,
        body_zones: &["thighs", "hips", "feet", "liver"],
        dynamics: "Thighs/Hips/Respiratory sustaining Feet/Liver",
    },
    // Hexagram 33: Dun — Retreat (Heaven/Mountain)
    HexagramBodyEntry {
        hexagram_number: 33,
        primary_chakra: 1,
        secondary_chakra: 6,
        body_zones: &["back", "hands", "joints", "head", "lungs"],
        dynamics: "Back/Hands/Joints withdrawing from Head/Lungs",
    },
    // Hexagram 34: Da Zhuang — Power of the Great (Thunder/Heaven)
    HexagramBodyEntry {
        hexagram_number: 34,
        primary_chakra: 6,
        secondary_chakra: 1,
        body_zones: &["head", "lungs", "feet", "liver"],
        dynamics: "Head/Lungs empowered by Feet/Liver",
    },
    // Hexagram 35: Jin — Progress (Fire/Earth)
    HexagramBodyEntry {
        hexagram_number: 35,
        primary_chakra: 3,
        secondary_chakra: 4,
        body_zones: &["abdomen", "spleen", "eyes", "heart"],
        dynamics: "Abdomen/Spleen illuminated by Eyes/Heart",
    },
    // Hexagram 36: Ming Yi — Darkening of the Light (Earth/Fire)
    HexagramBodyEntry {
        hexagram_number: 36,
        primary_chakra: 4,
        secondary_chakra: 3,
        body_zones: &["eyes", "heart", "abdomen", "spleen"],
        dynamics: "Eyes/Heart concealed by Abdomen/Spleen",
    },
    // Hexagram 37: Jia Ren — The Family (Wind/Fire)
    HexagramBodyEntry {
        hexagram_number: 37,
        primary_chakra: 4,
        secondary_chakra: 2,
        body_zones: &["eyes", "heart", "thighs", "hips"],
        dynamics: "Eyes/Heart guided by Thighs/Hips/Respiratory",
    },
    // Hexagram 38: Kui — Opposition (Fire/Lake)
    HexagramBodyEntry {
        hexagram_number: 38,
        primary_chakra: 5,
        secondary_chakra: 4,
        body_zones: &["mouth", "chest", "eyes", "heart"],
        dynamics: "Mouth/Chest opposing Eyes/Heart",
    },
    // Hexagram 39: Jian — Obstruction (Water/Mountain)
    HexagramBodyEntry {
        hexagram_number: 39,
        primary_chakra: 1,
        secondary_chakra: 2,
        body_zones: &["back", "hands", "joints", "kidneys", "ears"],
        dynamics: "Back/Hands/Joints blocked by Kidneys/Ears",
    },
    // Hexagram 40: Xie — Deliverance (Thunder/Water)
    HexagramBodyEntry {
        hexagram_number: 40,
        primary_chakra: 2,
        secondary_chakra: 1,
        body_zones: &["kidneys", "ears", "feet", "liver"],
        dynamics: "Kidneys/Ears liberated by Feet/Liver",
    },
    // Hexagram 41: Sun — Decrease (Mountain/Lake)
    HexagramBodyEntry {
        hexagram_number: 41,
        primary_chakra: 5,
        secondary_chakra: 1,
        body_zones: &["mouth", "chest", "back", "hands", "joints"],
        dynamics: "Mouth/Chest refined by Back/Hands/Joints",
    },
    // Hexagram 42: Yi — Increase (Wind/Thunder)
    HexagramBodyEntry {
        hexagram_number: 42,
        primary_chakra: 1,
        secondary_chakra: 2,
        body_zones: &["feet", "liver", "thighs", "hips"],
        dynamics: "Feet/Liver enhanced by Thighs/Hips/Respiratory",
    },
    // Hexagram 43: Guai — Breakthrough (Lake/Heaven)
    HexagramBodyEntry {
        hexagram_number: 43,
        primary_chakra: 6,
        secondary_chakra: 5,
        body_zones: &["head", "lungs", "mouth", "chest"],
        dynamics: "Head/Lungs overwhelmed by Mouth/Chest",
    },
    // Hexagram 44: Gou — Coming to Meet (Heaven/Wind)
    HexagramBodyEntry {
        hexagram_number: 44,
        primary_chakra: 2,
        secondary_chakra: 6,
        body_zones: &["thighs", "hips", "head", "lungs"],
        dynamics: "Thighs/Hips/Respiratory infiltrating Head/Lungs",
    },
    // Hexagram 45: Cui — Gathering (Lake/Earth)
    HexagramBodyEntry {
        hexagram_number: 45,
        primary_chakra: 3,
        secondary_chakra: 5,
        body_zones: &["abdomen", "spleen", "mouth", "chest"],
        dynamics: "Abdomen/Spleen gathering Mouth/Chest",
    },
    // Hexagram 46: Sheng — Pushing Upward (Earth/Wind)
    HexagramBodyEntry {
        hexagram_number: 46,
        primary_chakra: 2,
        secondary_chakra: 3,
        body_zones: &["thighs", "hips", "abdomen", "spleen"],
        dynamics: "Thighs/Hips/Respiratory rising through Abdomen/Spleen",
    },
    // Hexagram 47: Kun — Oppression / Exhaustion (Lake/Water)
    HexagramBodyEntry {
        hexagram_number: 47,
        primary_chakra: 2,
        secondary_chakra: 5,
        body_zones: &["kidneys", "ears", "mouth", "chest"],
        dynamics: "Kidneys/Ears exhausted by Mouth/Chest",
    },
    // Hexagram 48: Jing — The Well (Water/Wind)
    HexagramBodyEntry {
        hexagram_number: 48,
        primary_chakra: 2,
        secondary_chakra: 2,
        body_zones: &["thighs", "hips", "kidneys", "ears"],
        dynamics: "Thighs/Hips/Respiratory drawing from Kidneys/Ears",
    },
    // Hexagram 49: Ge — Revolution (Lake/Fire)
    HexagramBodyEntry {
        hexagram_number: 49,
        primary_chakra: 4,
        secondary_chakra: 5,
        body_zones: &["eyes", "heart", "mouth", "chest"],
        dynamics: "Eyes/Heart transforming Mouth/Chest",
    },
    // Hexagram 50: Ding — The Cauldron (Fire/Wind)
    HexagramBodyEntry {
        hexagram_number: 50,
        primary_chakra: 2,
        secondary_chakra: 4,
        body_zones: &["thighs", "hips", "eyes", "heart"],
        dynamics: "Thighs/Hips/Respiratory nourishing Eyes/Heart",
    },
    // Hexagram 51: Zhen — The Arousing Thunder (Thunder/Thunder)
    HexagramBodyEntry {
        hexagram_number: 51,
        primary_chakra: 1,
        secondary_chakra: 1,
        body_zones: &["feet", "liver"],
        dynamics: "Feet/Liver doubled",
    },
    // Hexagram 52: Gen — Keeping Still Mountain (Mountain/Mountain)
    HexagramBodyEntry {
        hexagram_number: 52,
        primary_chakra: 1,
        secondary_chakra: 1,
        body_zones: &["back", "hands", "joints"],
        dynamics: "Back/Hands/Joints doubled",
    },
    // Hexagram 53: Jian — Development / Gradual Progress (Wind/Mountain)
    HexagramBodyEntry {
        hexagram_number: 53,
        primary_chakra: 1,
        secondary_chakra: 2,
        body_zones: &["back", "hands", "joints", "thighs", "hips"],
        dynamics: "Back/Hands/Joints supporting Thighs/Hips/Respiratory",
    },
    // Hexagram 54: Gui Mei — The Marrying Maiden (Thunder/Lake)
    HexagramBodyEntry {
        hexagram_number: 54,
        primary_chakra: 5,
        secondary_chakra: 1,
        body_zones: &["mouth", "chest", "feet", "liver"],
        dynamics: "Mouth/Chest subordinated to Feet/Liver",
    },
    // Hexagram 55: Feng — Abundance (Thunder/Fire)
    HexagramBodyEntry {
        hexagram_number: 55,
        primary_chakra: 4,
        secondary_chakra: 1,
        body_zones: &["eyes", "heart", "feet", "liver"],
        dynamics: "Eyes/Heart amplified by Feet/Liver",
    },
    // Hexagram 56: Lu — The Wanderer (Fire/Mountain)
    HexagramBodyEntry {
        hexagram_number: 56,
        primary_chakra: 1,
        secondary_chakra: 4,
        body_zones: &["back", "hands", "joints", "eyes", "heart"],
        dynamics: "Back/Hands/Joints illuminated by Eyes/Heart",
    },
    // Hexagram 57: Xun — The Gentle Wind (Wind/Wind)
    HexagramBodyEntry {
        hexagram_number: 57,
        primary_chakra: 2,
        secondary_chakra: 2,
        body_zones: &["thighs", "hips"],
        dynamics: "Thighs/Hips/Respiratory doubled",
    },
    // Hexagram 58: Dui — The Joyous Lake (Lake/Lake)
    HexagramBodyEntry {
        hexagram_number: 58,
        primary_chakra: 5,
        secondary_chakra: 5,
        body_zones: &["mouth", "chest"],
        dynamics: "Mouth/Chest doubled",
    },
    // Hexagram 59: Huan — Dispersion (Wind/Water)
    HexagramBodyEntry {
        hexagram_number: 59,
        primary_chakra: 2,
        secondary_chakra: 2,
        body_zones: &["kidneys", "ears", "thighs", "hips"],
        dynamics: "Kidneys/Ears dispersed by Thighs/Hips/Respiratory",
    },
    // Hexagram 60: Jie — Limitation (Water/Lake)
    HexagramBodyEntry {
        hexagram_number: 60,
        primary_chakra: 5,
        secondary_chakra: 2,
        body_zones: &["mouth", "chest", "kidneys", "ears"],
        dynamics: "Mouth/Chest limited by Kidneys/Ears",
    },
    // Hexagram 61: Zhong Fu — Inner Truth (Wind/Lake)
    HexagramBodyEntry {
        hexagram_number: 61,
        primary_chakra: 5,
        secondary_chakra: 2,
        body_zones: &["mouth", "chest", "thighs", "hips"],
        dynamics: "Mouth/Chest penetrated by Thighs/Hips/Respiratory",
    },
    // Hexagram 62: Xiao Guo — Small Exceeding (Thunder/Mountain)
    HexagramBodyEntry {
        hexagram_number: 62,
        primary_chakra: 1,
        secondary_chakra: 1,
        body_zones: &["back", "hands", "joints", "feet", "liver"],
        dynamics: "Back/Hands/Joints shaken by Feet/Liver",
    },
    // Hexagram 63: Ji Ji — After Completion (Water/Fire)
    HexagramBodyEntry {
        hexagram_number: 63,
        primary_chakra: 4,
        secondary_chakra: 2,
        body_zones: &["eyes", "heart", "kidneys", "ears"],
        dynamics: "Eyes/Heart balanced by Kidneys/Ears",
    },
    // Hexagram 64: Wei Ji — Before Completion (Fire/Water)
    HexagramBodyEntry {
        hexagram_number: 64,
        primary_chakra: 2,
        secondary_chakra: 4,
        body_zones: &["kidneys", "ears", "eyes", "heart"],
        dynamics: "Kidneys/Ears seeking Eyes/Heart",
    },
];

/// Look up body dynamics for a hexagram number (1-64).
///
/// Returns `None` if `hexagram` is 0 or > 64.
#[inline]
pub fn hexagram_body_lookup(hexagram: u8) -> Option<&'static HexagramBodyEntry> {
    if hexagram == 0 || hexagram > 64 {
        return None;
    }
    HEXAGRAM_BODY_DYNAMICS.get((hexagram - 1) as usize)
}

// ─── Hygiene ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub enum HygieneResult {
    Clear,
    Warning {
        flags: Vec<HygieneFlag>,
        notes: Vec<String>,
    },
    Block {
        reason: String,
    },
}

#[derive(Debug, Serialize)]
pub enum HygieneFlag {
    RecentCast { minutes_ago: u32 },
    SameQuestion { previous_answer: String },
    ExcessiveFrequency { casts_today: u32 },
}

pub fn hygiene_check(question: &str, history_path: &Path) -> HygieneResult {
    let entries = load_history(history_path).unwrap_or_default();
    let now = current_epoch();
    let today_start = now - (now % 86400);

    let casts_today: u32 = entries.iter().filter(|e| e.cast_at >= today_start).count() as u32;

    // Block: >6 casts today
    if casts_today >= 6 {
        return HygieneResult::Block {
            reason: format!("Excessive frequency: {} casts today (max 6)", casts_today),
        };
    }

    let mut flags = Vec::new();
    let mut notes = Vec::new();

    // Warning: same question in last 24h
    if let Some(prev) = entries
        .iter()
        .rev()
        .find(|e| e.question == question && (now - e.cast_at) < 86400)
    {
        flags.push(HygieneFlag::SameQuestion {
            previous_answer: format!("cast_id: {}", prev.cast_id),
        });
        notes.push("Same question asked in last 24h — consider the previous answer.".to_string());
    }

    // Warning: any cast in last 10 minutes
    if let Some(recent) = entries.iter().rev().find(|e| (now - e.cast_at) < 600) {
        let minutes_ago = ((now - recent.cast_at) / 60) as u32;
        flags.push(HygieneFlag::RecentCast { minutes_ago });
        notes.push(format!(
            "Recent cast {} minutes ago — allow time for integration.",
            minutes_ago
        ));
    }

    if flags.is_empty() {
        HygieneResult::Clear
    } else {
        HygieneResult::Warning { flags, notes }
    }
}

// ─── Consent Gate ────────────────────────────────────────────────────────

pub fn consent_gate(yes_flag: bool) -> Result<(), String> {
    if yes_flag {
        return Ok(());
    }
    print!("Cast oracle? This is a sacred portal. [y/N]: ");
    std::io::stdout().flush().ok();
    let mut input = String::new();
    std::io::stdin()
        .read_line(&mut input)
        .map_err(|e| format!("oracle: input error: {e}"))?;
    if input.trim().to_lowercase() == "y" {
        Ok(())
    } else {
        Err("oracle: cast cancelled".to_string())
    }
}

// ─── Tarot Draw ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum TarotSystem {
    Rws,
    Thoth,
    Marseille,
    Ql,
}

impl TarotSystem {
    pub fn deck_size(&self) -> u8 {
        78
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s {
            "tarot-rws" | "rws" => Ok(Self::Rws),
            "tarot-thoth" | "thoth" => Ok(Self::Thoth),
            "tarot-marseille" | "marseille" => Ok(Self::Marseille),
            "tarot-ql" | "ql" => Ok(Self::Ql),
            _ => Err(format!(
                "Unknown tarot system: {s}. Use: rws, thoth, marseille, ql"
            )),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct TarotCard {
    pub card_id: u8,
    pub reversed: bool,
}

pub fn draw_tarot(system: TarotSystem, spread_size: u8) -> Vec<TarotCard> {
    let deck_size = system.deck_size();
    let mut deck: Vec<u8> = (0..deck_size).collect();

    // Fisher-Yates shuffle using OS random
    let mut rand_buf = vec![0u8; deck_size as usize];
    getrandom(&mut rand_buf);

    for i in (1..deck_size as usize).rev() {
        let j = (rand_buf[i] as usize) % (i + 1);
        deck.swap(i, j);
    }

    // Reversal bitmask from additional random bytes
    let mut reversal_buf = vec![0u8; spread_size as usize];
    getrandom(&mut reversal_buf);

    (0..spread_size.min(deck_size) as usize)
        .map(|i| TarotCard {
            card_id: deck[i],
            reversed: reversal_buf[i] & 1 == 1,
        })
        .collect()
}

// ─── I-Ching Cast ────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct IChingResult {
    pub lines: [u8; 6],
    pub primary_hexagram: u8,
    pub relating_hexagram: Option<u8>,
    pub nuclear_hexagram: u8,
    pub changing_mask: u8,
    pub torus_pos: u8,
}

pub fn cast_iching_coins() -> IChingResult {
    let mut rand_buf = [0u8; 18]; // 3 bytes per line x 6 lines
    getrandom(&mut rand_buf);

    let mut lines = [0u8; 6];
    let mut hex_bits: u8 = 0;
    let mut changing_mask: u8 = 0;

    for i in 0..6 {
        // 3 coins per line: coin values 2=yin, 3=yang
        let mut sum: u8 = 0;
        for c in 0..3 {
            sum += if rand_buf[i * 3 + c] & 1 == 1 { 3 } else { 2 };
        }
        lines[i] = sum; // 6=old yin, 7=young yang, 8=young yin, 9=old yang

        // Yang line (7 or 9) = bit set
        if sum & 1 == 1 {
            hex_bits |= 1u8 << i;
        }
        // Changing lines: 6 (old yin) or 9 (old yang)
        if sum == 6 || sum == 9 {
            changing_mask |= 1u8 << i;
        }
    }

    let primary = hex_bits & 0x3F;
    let relating = if changing_mask != 0 {
        Some((hex_bits ^ changing_mask) & 0x3F)
    } else {
        None
    };

    // Nuclear hexagram: inner 4 lines (2-5) form new hexagram
    // Lower trigram = lines 2,3,4; upper trigram = lines 3,4,5
    let nuclear_lower = (hex_bits >> 1) & 0x07;
    let nuclear_upper = (hex_bits >> 2) & 0x07;
    let nuclear = (nuclear_lower | (nuclear_upper << 3)) & 0x3F;

    let torus_pos = hexagram_to_torus_pos(primary);

    IChingResult {
        lines,
        primary_hexagram: primary,
        relating_hexagram: relating,
        nuclear_hexagram: nuclear,
        changing_mask,
        torus_pos,
    }
}

pub fn hexagram_to_torus_pos(h: u8) -> u8 {
    ((h.saturating_sub(1)) as u16 * 12 / 64) as u8
}

// ─── OraclePayload — Four Faces + Eval4 Charges ──────────────────────────
//
// The OraclePayload is the canonical structured result of a cast. It exposes
// all four faces of the oracle moment and the quaternionic eval4 charges.
//
// Four faces (canonical; see CLOCK-AND-NARA-SPECS/08-oracle-four-faces):
//   explicate face:   degree (0-359), phase=0
//   deficient face:   (degree + 180) % 360 — the shadow complement
//   implicate face:   degree as f32 + 360.0 — upper-hemisphere (SU(2) map)
//   temporal face:    primary_hex XOR changing_lines_mask — hexagram after change
//
// Eval4 charges (pp/nn/pn/np): quaternionic polarity scores from the I-Ching
// line pattern. Named after the charge matrix in M3 Mahamaya.
//   pp = positive-positive (yang lines in yang positions: lines 1,3,5)
//   nn = negative-negative (yin lines in yin positions: lines 2,4,6) — stored negative
//   pn = positive-negative (yang in yin pos)
//   np = negative-positive (yin in yang pos)

/// Full structured result of an oracle cast — four faces and quaternionic charges.
///
/// Produced by `oracle_eval4()` from an `IChingResult`. Always contains real
/// computed values — no zeros from stubs.
#[derive(Debug, Clone, Serialize)]
pub struct OraclePayload {
    /// Explicate degree (0-359): canonical clock position of the cast moment.
    pub degree: u16,
    /// Phase: 0 = explicate (normal), 1 = implicate (shadow/reversed).
    pub phase: u8,
    /// Primary hexagram index (0-63).
    pub primary_hex: u8,
    /// Deficient face: (degree + 180) % 360 — the shadow complement degree.
    pub deficient_degree: u16,
    /// Implicate face: degree as f32 + 360.0 — SU(2) upper hemisphere position.
    pub implicate_720: f32,
    /// Temporal face: primary_hex XOR changing_lines_mask — hexagram after change lines resolve.
    pub temporal_hex: u8,
    /// Quaternionic charge pp: yang lines (1) in yang positions (1,3,5). Range 0..+192.
    pub pp: f32,
    /// Quaternionic charge nn: yin lines in yin positions (2,4,6). Stored negative. Range -192..0.
    pub nn: f32,
    /// Quaternionic charge pn: yang in yin positions. Range 0..+192.
    pub pn: f32,
    /// Quaternionic charge np: yin in yang positions. Range 0..+192.
    pub np: f32,
}

/// Compute `OraclePayload` from an `IChingResult` and the current kairos degree.
///
/// `kairos_degree`: current sun degree (0.0-360.0) from `KerykeionResult.planets[sun].degree`.
///                  Pass 0.0 if kairos is unavailable — the four faces still compute correctly.
/// `phase`: 0 = explicate, 1 = implicate (set to 1 if the cast moment is shadow/reversed).
pub fn oracle_eval4(result: &IChingResult, kairos_degree: f32, phase: u8) -> OraclePayload {
    let degree = (kairos_degree as u16).min(359);

    // Face 1 — Explicate: canonical degree position (already in `degree`)
    // Face 2 — Deficient: opposite degree (shadow complement on the 360-circle)
    let deficient_degree = (degree as u32 + 180) as u16 % 360;

    // Face 3 — Implicate: SU(2) upper hemisphere (degree_anchor in 360-719 range)
    let implicate_720 = kairos_degree + 360.0;

    // Face 4 — Temporal: hexagram AFTER changing lines resolve (XOR flip)
    let temporal_hex = (result.primary_hexagram ^ result.changing_mask) & 0x3F;

    // Eval4 charges: quaternionic polarity from the 6 line values.
    //
    // Yang positions (odd lines: 1, 3, 5 → indices 0, 2, 4):
    //   yang line (7 or 9) in yang pos → pp += 32.0
    //   yin line  (6 or 8) in yang pos → np += 32.0
    // Yin positions (even lines: 2, 4, 6 → indices 1, 3, 5):
    //   yin line  (6 or 8) in yin pos  → nn -= 32.0 (stored negative)
    //   yang line (7 or 9) in yin pos  → pn += 32.0
    //
    // Weight 32.0 per line × 6 lines = max |charge| = 192.0
    let mut pp: f32 = 0.0;
    let mut nn: f32 = 0.0;
    let mut pn: f32 = 0.0;
    let mut np: f32 = 0.0;

    for (i, &line_val) in result.lines.iter().enumerate() {
        let is_yang_line = line_val & 1 == 1; // 7 or 9 = yang (odd); 6 or 8 = yin (even)
        let is_yang_pos = i % 2 == 0;         // positions 0,2,4 (lines 1,3,5) = yang
        match (is_yang_line, is_yang_pos) {
            (true,  true)  => pp += 32.0,
            (false, false) => nn -= 32.0,
            (true,  false) => pn += 32.0,
            (false, true)  => np += 32.0,
        }
    }

    OraclePayload {
        degree,
        phase,
        primary_hex: result.primary_hexagram,
        deficient_degree,
        implicate_720,
        temporal_hex,
        pp,
        nn,
        pn,
        np,
    }
}

/// Cast coins and compute OraclePayload in one step — for portal clock state updates.
///
/// Does NOT write oracle history or perform hygiene checks.
/// Intended for portal-internal clock synchronization after a cast has already been
/// recorded via `cast()`.
///
/// `kairos_degree`: current sun degree (0.0-360.0) from KerykeionResult.
/// Pass 0.0 if kairos unavailable — the four faces still compute correctly.
pub fn cast_and_eval4(kairos_degree: f32, phase: u8) -> OraclePayload {
    let result = cast_iching_coins();
    oracle_eval4(&result, kairos_degree, phase)
}

// ─── History ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub cast_id: u32,
    pub system: String,
    pub question: String,
    pub draw: serde_json::Value,
    pub cast_at: u64,
    pub hygiene: String,
}

fn history_path() -> PathBuf {
    super::identity::nara_home()
        .join("oracle")
        .join("history.jsonl")
}

fn load_history(path: &Path) -> Result<Vec<HistoryEntry>, String> {
    if !path.exists() {
        return Ok(vec![]);
    }
    let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut entries = Vec::new();
    for line in data.lines() {
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(entry) = serde_json::from_str::<HistoryEntry>(line) {
            entries.push(entry);
        }
    }
    Ok(entries)
}

fn append_history(entry: &HistoryEntry) -> Result<(), String> {
    let path = history_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    let json = serde_json::to_string(entry).map_err(|e| e.to_string())?;
    writeln!(file, "{json}").map_err(|e| e.to_string())
}

fn next_cast_id() -> u32 {
    load_history(&history_path())
        .unwrap_or_default()
        .last()
        .map(|e| e.cast_id + 1)
        .unwrap_or(1)
}

// ─── CLI Commands ────────────────────────────────────────────────────────

/// epi nara oracle cast --system <sys> --question "..." [-y]
pub fn cast(
    system: &str,
    question: &str,
    yes: bool,
    method: Option<&str>,
) -> Result<String, String> {
    // Temporal authority check
    super::kairos::require_temporal_authority()?;

    // Hygiene check
    let hygiene = hygiene_check(question, &history_path());
    match &hygiene {
        HygieneResult::Block { reason } => return Err(format!("oracle: {reason}")),
        HygieneResult::Warning { notes, .. } => {
            for note in notes {
                eprintln!("Warning: {note}");
            }
        }
        HygieneResult::Clear => {}
    }

    // Consent gate
    consent_gate(yes)?;

    let hygiene_str = match &hygiene {
        HygieneResult::Clear => "clear",
        HygieneResult::Warning { .. } => "warning",
        HygieneResult::Block { .. } => "blocked",
    };

    // Dispatch by system
    if system.starts_with("iching") || system == "iching" {
        let method_str = method.unwrap_or("coins");
        if method_str == "yarrow" {
            return Err("yarrow: not yet implemented".to_string());
        }

        let result = cast_iching_coins();
        let cast_id = next_cast_id();

        append_history(&HistoryEntry {
            cast_id,
            system: "iching".to_string(),
            question: question.to_string(),
            draw: serde_json::to_value(&result).unwrap_or_default(),
            cast_at: current_epoch(),
            hygiene: hygiene_str.to_string(),
        })?;

        let line_names: Vec<String> = result
            .lines
            .iter()
            .enumerate()
            .map(|(i, &v)| {
                let kind = match v {
                    6 => "old yin ─ ─ →",
                    7 => "young yang ───",
                    8 => "young yin ─ ─",
                    9 => "old yang ─── →",
                    _ => "???",
                };
                format!("  Line {}: {} ({})", i + 1, v, kind)
            })
            .collect();

        let mut out = format!("I-Ching Cast #{cast_id}\n");
        out.push_str(&format!("  Question: {question}\n"));
        out.push_str(&format!(
            "  Primary hexagram: {}\n",
            result.primary_hexagram + 1
        ));
        if let Some(rel) = result.relating_hexagram {
            out.push_str(&format!("  Relating hexagram: {}\n", rel + 1));
        }
        out.push_str(&format!(
            "  Nuclear hexagram: {}\n",
            result.nuclear_hexagram + 1
        ));
        out.push_str(&format!("  Torus position: {}\n", result.torus_pos));
        for line in &line_names {
            out.push_str(&format!("{line}\n"));
        }

        Ok(out)
    } else {
        // Tarot
        let tarot_system = TarotSystem::from_str(system)?;
        let spread_size = 3u8; // Default Celtic Cross-lite
        let cards = draw_tarot(tarot_system, spread_size);
        let cast_id = next_cast_id();

        append_history(&HistoryEntry {
            cast_id,
            system: system.to_string(),
            question: question.to_string(),
            draw: serde_json::to_value(&cards).unwrap_or_default(),
            cast_at: current_epoch(),
            hygiene: hygiene_str.to_string(),
        })?;

        let mut out = format!("Tarot Draw #{cast_id} ({system})\n");
        out.push_str(&format!("  Question: {question}\n"));
        for (i, card) in cards.iter().enumerate() {
            let reversed = if card.reversed { " (reversed)" } else { "" };
            out.push_str(&format!(
                "  Position {}: Card {}{}\n",
                i + 1,
                card.card_id,
                reversed
            ));
        }

        Ok(out)
    }
}

/// epi nara oracle history
pub fn show_history() -> Result<String, String> {
    let entries = load_history(&history_path())?;
    if entries.is_empty() {
        return Ok("No oracle history.".to_string());
    }
    let mut out = format!("Oracle History ({} casts)\n", entries.len());
    for e in entries.iter().rev().take(10) {
        out.push_str(&format!(
            "  #{} [{}] {} — {}\n",
            e.cast_id,
            e.system,
            &e.question.chars().take(40).collect::<String>(),
            e.hygiene
        ));
    }
    Ok(out)
}

/// epi nara oracle hygiene
pub fn show_hygiene(cast_id: Option<u32>) -> Result<String, String> {
    let entries = load_history(&history_path())?;
    let now = current_epoch();
    let today_start = now - (now % 86400);
    let casts_today = entries.iter().filter(|e| e.cast_at >= today_start).count();

    let mut out = format!("Oracle Hygiene\n  Casts today: {}/6\n", casts_today);

    if let Some(recent) = entries.last() {
        let minutes_ago = (now - recent.cast_at) / 60;
        out.push_str(&format!("  Last cast: {} minutes ago\n", minutes_ago));
    }

    if let Some(id) = cast_id {
        if let Some(entry) = entries.iter().find(|e| e.cast_id == id) {
            out.push_str(&format!("  Cast #{}: hygiene={}\n", id, entry.hygiene));
        }
    }

    Ok(out)
}

// ─── Utility ─────────────────────────────────────────────────────────────

fn current_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

/// Platform random — uses /dev/urandom on unix
fn getrandom(buf: &mut [u8]) {
    use std::io::Read;
    if let Ok(mut f) = std::fs::File::open("/dev/urandom") {
        let _ = f.read_exact(buf);
    }
}
