use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum Trigram {
    Qian = 0,   // Heaven ☰
    Dui = 1,    // Lake ☱
    Li = 2,     // Fire ☲
    Zhen = 3,   // Thunder ☳
    Xun = 4,    // Wind ☴
    Kan = 5,    // Water ☵
    Gen = 6,    // Mountain ☶
    Kun = 7,    // Earth ☷
}

impl Trigram {
    pub fn name(self) -> &'static str {
        match self {
            Trigram::Qian => "Heaven",
            Trigram::Dui => "Lake",
            Trigram::Li => "Fire",
            Trigram::Zhen => "Thunder",
            Trigram::Xun => "Wind",
            Trigram::Kan => "Water",
            Trigram::Gen => "Mountain",
            Trigram::Kun => "Earth",
        }
    }

    pub fn from_bits(bits: u8) -> Self {
        match bits & 0x07 {
            0b111 => Trigram::Qian,
            0b110 => Trigram::Dui,
            0b101 => Trigram::Li,
            0b100 => Trigram::Zhen,
            0b011 => Trigram::Xun,
            0b010 => Trigram::Kan,
            0b001 => Trigram::Gen,
            _ => Trigram::Kun,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IChingHexagram {
    pub king_wen: u8,
    pub name: &'static str,
    pub upper: Trigram,
    pub lower: Trigram,
    pub binary: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IChingCast {
    pub cast_id: String,
    pub primary_hex: u8,
    pub changing_lines_mask: u8,
    pub temporal_hex: u8,
    pub method: CastMethod,
    pub origin: CastOriginIChing,
    pub timestamp: u64,
    pub source_highlight_id: Option<String>,
    pub interpretation: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CastMethod {
    ThreeCoin,
    YarrowStalks,
    RecordedOnly,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CastOriginIChing {
    LiveDraw,
    RandomnessEngine { seed: u64 },
}

pub fn derive_temporal_hex(primary: u8, changing_lines: u8) -> u8 {
    primary ^ changing_lines
}

pub fn trigrams_from_binary(binary: u8) -> (Trigram, Trigram) {
    let upper = Trigram::from_bits((binary >> 3) & 0x07);
    let lower = Trigram::from_bits(binary & 0x07);
    (upper, lower)
}

pub fn get_hexagram(king_wen: u8) -> Option<&'static IChingHexagram> {
    if king_wen == 0 || king_wen > 64 {
        return None;
    }
    Some(&KING_WEN_SEQUENCE[(king_wen - 1) as usize])
}

pub fn binary_to_king_wen(binary: u8) -> u8 {
    BINARY_TO_KING_WEN[(binary & 0x3F) as usize]
}

static BINARY_TO_KING_WEN: [u8; 64] = [
     2,  23,   8,  20,  16,  35,  45,  0, // Kun lower
    15,  52,  39,  53,  62,  56,  31, 33, // Gen lower
    7,   4,  29,  59,  40,  64,  47,  6, // Kan lower
    46,  18,  48,  57,  32,  50,  28, 44, // Xun lower
    24,  27,   3,  42,  51,  21,  17, 25, // Zhen lower
    36,  22,  63,  37,  55,  30,  49, 13, // Li lower
    19,  41,  60,  61,  54,  38,  58, 10, // Dui lower
    11,  26,   5,   9,  34,  14,  43,  1, // Qian lower
];

pub static KING_WEN_SEQUENCE: [IChingHexagram; 64] = [
    IChingHexagram { king_wen: 1, name: "The Creative", upper: Trigram::Qian, lower: Trigram::Qian, binary: 0b111111 },
    IChingHexagram { king_wen: 2, name: "The Receptive", upper: Trigram::Kun, lower: Trigram::Kun, binary: 0b000000 },
    IChingHexagram { king_wen: 3, name: "Difficulty at the Beginning", upper: Trigram::Kan, lower: Trigram::Zhen, binary: 0b010100 },
    IChingHexagram { king_wen: 4, name: "Youthful Folly", upper: Trigram::Gen, lower: Trigram::Kan, binary: 0b001010 },
    IChingHexagram { king_wen: 5, name: "Waiting", upper: Trigram::Kan, lower: Trigram::Qian, binary: 0b010111 },
    IChingHexagram { king_wen: 6, name: "Conflict", upper: Trigram::Qian, lower: Trigram::Kan, binary: 0b111010 },
    IChingHexagram { king_wen: 7, name: "The Army", upper: Trigram::Kun, lower: Trigram::Kan, binary: 0b000010 },
    IChingHexagram { king_wen: 8, name: "Holding Together", upper: Trigram::Kan, lower: Trigram::Kun, binary: 0b010000 },
    IChingHexagram { king_wen: 9, name: "Small Taming", upper: Trigram::Xun, lower: Trigram::Qian, binary: 0b011111 },
    IChingHexagram { king_wen: 10, name: "Treading", upper: Trigram::Qian, lower: Trigram::Dui, binary: 0b111110 },
    IChingHexagram { king_wen: 11, name: "Peace", upper: Trigram::Kun, lower: Trigram::Qian, binary: 0b000111 },
    IChingHexagram { king_wen: 12, name: "Standstill", upper: Trigram::Qian, lower: Trigram::Kun, binary: 0b111000 },
    IChingHexagram { king_wen: 13, name: "Fellowship", upper: Trigram::Qian, lower: Trigram::Li, binary: 0b111101 },
    IChingHexagram { king_wen: 14, name: "Great Possession", upper: Trigram::Li, lower: Trigram::Qian, binary: 0b101111 },
    IChingHexagram { king_wen: 15, name: "Modesty", upper: Trigram::Kun, lower: Trigram::Gen, binary: 0b000001 },
    IChingHexagram { king_wen: 16, name: "Enthusiasm", upper: Trigram::Zhen, lower: Trigram::Kun, binary: 0b100000 },
    IChingHexagram { king_wen: 17, name: "Following", upper: Trigram::Dui, lower: Trigram::Zhen, binary: 0b110100 },
    IChingHexagram { king_wen: 18, name: "Work on the Decayed", upper: Trigram::Gen, lower: Trigram::Xun, binary: 0b001011 },
    IChingHexagram { king_wen: 19, name: "Approach", upper: Trigram::Kun, lower: Trigram::Dui, binary: 0b000110 },
    IChingHexagram { king_wen: 20, name: "Contemplation", upper: Trigram::Xun, lower: Trigram::Kun, binary: 0b011000 },
    IChingHexagram { king_wen: 21, name: "Biting Through", upper: Trigram::Li, lower: Trigram::Zhen, binary: 0b101100 },
    IChingHexagram { king_wen: 22, name: "Grace", upper: Trigram::Gen, lower: Trigram::Li, binary: 0b001101 },
    IChingHexagram { king_wen: 23, name: "Splitting Apart", upper: Trigram::Gen, lower: Trigram::Kun, binary: 0b001000 },
    IChingHexagram { king_wen: 24, name: "Return", upper: Trigram::Kun, lower: Trigram::Zhen, binary: 0b000100 },
    IChingHexagram { king_wen: 25, name: "Innocence", upper: Trigram::Qian, lower: Trigram::Zhen, binary: 0b111100 },
    IChingHexagram { king_wen: 26, name: "Great Taming", upper: Trigram::Gen, lower: Trigram::Qian, binary: 0b001111 },
    IChingHexagram { king_wen: 27, name: "Nourishment", upper: Trigram::Gen, lower: Trigram::Zhen, binary: 0b001100 },
    IChingHexagram { king_wen: 28, name: "Great Preponderance", upper: Trigram::Dui, lower: Trigram::Xun, binary: 0b110011 },
    IChingHexagram { king_wen: 29, name: "The Abysmal", upper: Trigram::Kan, lower: Trigram::Kan, binary: 0b010010 },
    IChingHexagram { king_wen: 30, name: "The Clinging", upper: Trigram::Li, lower: Trigram::Li, binary: 0b101101 },
    IChingHexagram { king_wen: 31, name: "Influence", upper: Trigram::Dui, lower: Trigram::Gen, binary: 0b110001 },
    IChingHexagram { king_wen: 32, name: "Duration", upper: Trigram::Zhen, lower: Trigram::Xun, binary: 0b100011 },
    IChingHexagram { king_wen: 33, name: "Retreat", upper: Trigram::Qian, lower: Trigram::Gen, binary: 0b111001 },
    IChingHexagram { king_wen: 34, name: "Great Power", upper: Trigram::Zhen, lower: Trigram::Qian, binary: 0b100111 },
    IChingHexagram { king_wen: 35, name: "Progress", upper: Trigram::Li, lower: Trigram::Kun, binary: 0b101000 },
    IChingHexagram { king_wen: 36, name: "Darkening of the Light", upper: Trigram::Kun, lower: Trigram::Li, binary: 0b000101 },
    IChingHexagram { king_wen: 37, name: "The Family", upper: Trigram::Xun, lower: Trigram::Li, binary: 0b011101 },
    IChingHexagram { king_wen: 38, name: "Opposition", upper: Trigram::Li, lower: Trigram::Dui, binary: 0b101110 },
    IChingHexagram { king_wen: 39, name: "Obstruction", upper: Trigram::Kan, lower: Trigram::Gen, binary: 0b010001 },
    IChingHexagram { king_wen: 40, name: "Deliverance", upper: Trigram::Zhen, lower: Trigram::Kan, binary: 0b100010 },
    IChingHexagram { king_wen: 41, name: "Decrease", upper: Trigram::Gen, lower: Trigram::Dui, binary: 0b001110 },
    IChingHexagram { king_wen: 42, name: "Increase", upper: Trigram::Xun, lower: Trigram::Zhen, binary: 0b011100 },
    IChingHexagram { king_wen: 43, name: "Breakthrough", upper: Trigram::Dui, lower: Trigram::Qian, binary: 0b110111 },
    IChingHexagram { king_wen: 44, name: "Coming to Meet", upper: Trigram::Qian, lower: Trigram::Xun, binary: 0b111011 },
    IChingHexagram { king_wen: 45, name: "Gathering Together", upper: Trigram::Dui, lower: Trigram::Kun, binary: 0b110000 },
    IChingHexagram { king_wen: 46, name: "Pushing Upward", upper: Trigram::Kun, lower: Trigram::Xun, binary: 0b000011 },
    IChingHexagram { king_wen: 47, name: "Oppression", upper: Trigram::Dui, lower: Trigram::Kan, binary: 0b110010 },
    IChingHexagram { king_wen: 48, name: "The Well", upper: Trigram::Kan, lower: Trigram::Xun, binary: 0b010011 },
    IChingHexagram { king_wen: 49, name: "Revolution", upper: Trigram::Dui, lower: Trigram::Li, binary: 0b110101 },
    IChingHexagram { king_wen: 50, name: "The Cauldron", upper: Trigram::Li, lower: Trigram::Xun, binary: 0b101011 },
    IChingHexagram { king_wen: 51, name: "The Arousing", upper: Trigram::Zhen, lower: Trigram::Zhen, binary: 0b100100 },
    IChingHexagram { king_wen: 52, name: "Keeping Still", upper: Trigram::Gen, lower: Trigram::Gen, binary: 0b001001 },
    IChingHexagram { king_wen: 53, name: "Development", upper: Trigram::Xun, lower: Trigram::Gen, binary: 0b011001 },
    IChingHexagram { king_wen: 54, name: "The Marrying Maiden", upper: Trigram::Zhen, lower: Trigram::Dui, binary: 0b100110 },
    IChingHexagram { king_wen: 55, name: "Abundance", upper: Trigram::Zhen, lower: Trigram::Li, binary: 0b100101 },
    IChingHexagram { king_wen: 56, name: "The Wanderer", upper: Trigram::Li, lower: Trigram::Gen, binary: 0b101001 },
    IChingHexagram { king_wen: 57, name: "The Gentle", upper: Trigram::Xun, lower: Trigram::Xun, binary: 0b011011 },
    IChingHexagram { king_wen: 58, name: "The Joyous", upper: Trigram::Dui, lower: Trigram::Dui, binary: 0b110110 },
    IChingHexagram { king_wen: 59, name: "Dispersion", upper: Trigram::Xun, lower: Trigram::Kan, binary: 0b011010 },
    IChingHexagram { king_wen: 60, name: "Limitation", upper: Trigram::Kan, lower: Trigram::Dui, binary: 0b010110 },
    IChingHexagram { king_wen: 61, name: "Inner Truth", upper: Trigram::Xun, lower: Trigram::Dui, binary: 0b011110 },
    IChingHexagram { king_wen: 62, name: "Small Preponderance", upper: Trigram::Zhen, lower: Trigram::Gen, binary: 0b100001 },
    IChingHexagram { king_wen: 63, name: "After Completion", upper: Trigram::Kan, lower: Trigram::Li, binary: 0b010101 },
    IChingHexagram { king_wen: 64, name: "Before Completion", upper: Trigram::Li, lower: Trigram::Kan, binary: 0b101010 },
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sequence_has_64_hexagrams() {
        assert_eq!(KING_WEN_SEQUENCE.len(), 64);
    }

    #[test]
    fn lookup_by_king_wen() {
        assert_eq!(get_hexagram(1).unwrap().name, "The Creative");
        assert_eq!(get_hexagram(64).unwrap().name, "Before Completion");
        assert!(get_hexagram(0).is_none());
        assert!(get_hexagram(65).is_none());
    }

    #[test]
    fn temporal_hex_derivation() {
        assert_eq!(derive_temporal_hex(0b111111, 0b000001), 0b111110);
        assert_eq!(derive_temporal_hex(0b101010, 0b111111), 0b010101);
    }

    #[test]
    fn trigram_decomposition() {
        let (upper, lower) = trigrams_from_binary(0b111111);
        assert_eq!(upper, Trigram::Qian);
        assert_eq!(lower, Trigram::Qian);

        let (upper, lower) = trigrams_from_binary(0b000000);
        assert_eq!(upper, Trigram::Kun);
        assert_eq!(lower, Trigram::Kun);
    }
}
