use serde::Serialize;

pub mod planet {
    pub const SUN: u8 = 0;
    pub const MOON: u8 = 1;
    pub const MERCURY: u8 = 2;
    pub const VENUS: u8 = 3;
    pub const MARS: u8 = 4;
    pub const JUPITER: u8 = 5;
    pub const SATURN: u8 = 6;
    pub const URANUS: u8 = 7;
    pub const NEPTUNE: u8 = 8;
    pub const PLUTO: u8 = 9;
}

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

pub mod element {
    pub const AKASHA: u8 = 0;
    pub const VAYU: u8 = 1;
    pub const AGNI: u8 = 2;
    pub const APAS: u8 = 3;
    pub const PRITHVI: u8 = 4;
}

/// Complementarity matrix: comp[i] = i ^ 0x3F (all 6 bits flipped).
pub const COMP_MATRIX: [u8; 64] = [
    63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40,
    39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16,
    15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
];

/// Movement matrix: trigram swap.
pub const MOVE_MATRIX: [u8; 64] = [
    0, 8, 16, 24, 32, 40, 48, 56, 1, 9, 17, 25, 33, 41, 49, 57, 2, 10, 18, 26, 34, 42, 50, 58, 3,
    11, 19, 27, 35, 43, 51, 59, 4, 12, 20, 28, 36, 44, 52, 60, 5, 13, 21, 29, 37, 45, 53, 61, 6,
    14, 22, 30, 38, 46, 54, 62, 7, 15, 23, 31, 39, 47, 55, 63,
];

/// Resonance matrix: 56 valid entries + 8 evolutionary gaps (0xFF sentinel).
pub const RES_MATRIX: [u8; 64] = [
    0x00, 0x01, 0x02, 0x03, 0x04, 0xFF, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
    0x10, 0x11, 0x12, 0x13, 0x14, 0xFF, 0x16, 0x17, 0x18, 0x19, 0xFF, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
    0x20, 0x21, 0xFF, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0xFF, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F,
    0x30, 0x31, 0x32, 0x33, 0x34, 0xFF, 0x36, 0x37, 0x38, 0x39, 0xFF, 0x3B, 0x3C, 0xFF, 0x3E, 0x3F,
];

pub const RESONANCE_GAP: u8 = 0xFF;

/// Matrix quaternion axes: [Complementary, Moving/Resting, SameQuality].
pub const MATRIX_QUATERNION_AXIS: [[f32; 4]; 3] = [
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0, 1.0],
];

/// Pair matrix (also available in rotational.rs as PM). Public alias for oracle consumers.
pub const PAIR_MATRIX: [(i8, i8); 16] = [
    (12, 0),
    (15, -3),
    (13, -1),
    (14, 2),
    (15, 3),
    (18, 0),
    (16, -2),
    (17, 1),
    (13, 1),
    (16, -2),
    (14, 0),
    (15, 1),
    (14, 2),
    (17, -1),
    (15, -1),
    (16, 0),
];

pub fn pair_sum_diff(n1: u8, n2: u8) -> (i8, i8) {
    PAIR_MATRIX[((n1 << 2) | n2) as usize]
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct PipDecanEntry {
    pub zodiac_sign: u8,
    pub decan: u8,
    pub ruling_planet: u8,
}

pub static PIP_DECAN_MAP: [[PipDecanEntry; 9]; 4] = {
    use planet::*;
    use sign::*;
    const fn e(zodiac_sign: u8, decan: u8, ruling_planet: u8) -> PipDecanEntry {
        PipDecanEntry {
            zodiac_sign,
            decan,
            ruling_planet,
        }
    }
    [
        [
            e(CANCER, 0, VENUS),
            e(CANCER, 1, MERCURY),
            e(CANCER, 2, MOON),
            e(SCORPIO, 0, MARS),
            e(SCORPIO, 1, SUN),
            e(SCORPIO, 2, VENUS),
            e(PISCES, 0, SATURN),
            e(PISCES, 1, JUPITER),
            e(PISCES, 2, MARS),
        ],
        [
            e(ARIES, 0, MARS),
            e(ARIES, 1, SUN),
            e(ARIES, 2, VENUS),
            e(LEO, 0, SATURN),
            e(LEO, 1, JUPITER),
            e(LEO, 2, MARS),
            e(SAGITTARIUS, 0, MERCURY),
            e(SAGITTARIUS, 1, MOON),
            e(SAGITTARIUS, 2, SATURN),
        ],
        [
            e(CAPRICORN, 0, JUPITER),
            e(CAPRICORN, 1, MARS),
            e(CAPRICORN, 2, SUN),
            e(TAURUS, 0, MERCURY),
            e(TAURUS, 1, MOON),
            e(TAURUS, 2, SATURN),
            e(VIRGO, 0, SUN),
            e(VIRGO, 1, VENUS),
            e(VIRGO, 2, MERCURY),
        ],
        [
            e(LIBRA, 0, MOON),
            e(LIBRA, 1, SATURN),
            e(LIBRA, 2, JUPITER),
            e(AQUARIUS, 0, VENUS),
            e(AQUARIUS, 1, MERCURY),
            e(AQUARIUS, 2, MOON),
            e(GEMINI, 0, JUPITER),
            e(GEMINI, 1, MARS),
            e(GEMINI, 2, SUN),
        ],
    ]
};
