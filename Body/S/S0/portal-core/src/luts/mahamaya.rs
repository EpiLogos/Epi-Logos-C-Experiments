use serde::{Deserialize, Serialize};

pub const MAHAMAYA_SYMBOL_COUNT: u16 = 64;
pub const I_CHING_LINE_COUNT: u16 = 6;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MahamayaCodecProjection {
    pub address64: u8,
    pub hexagram_id: u8,
    /// King Wen ordinal (1..=64) of this Fu-Xi `address64`. King Wen ordering is
    /// a DISTINCT permutation of the binary Fu-Xi order — it is M3 domain-law, so
    /// the canonical translation LUT lives here (see `KING_WEN_FROM_ADDRESS64`).
    /// The bus carries BOTH: `address64`/`hexagram_id` (Fu-Xi, 0..=63) AND this
    /// `king_wen` (1..=64), so a consumer can render either ordering honestly.
    pub king_wen: u8,
    pub upper_trigram: u8,
    pub lower_trigram: u8,
    pub codon_id: u8,
    pub nucleotide_bits: [u8; 3],
    pub codon: String,
    pub dna_rna_phase: String,
    pub line_index: u8,
    pub line_change_operator: u16,
    pub m2_vibration_index: usize,
    pub m2_to_m3_symbol: u8,
    pub round_trip_loss: bool,
    pub transcription_state: String,
}

impl MahamayaCodecProjection {
    pub fn from_clock(
        degree360: u16,
        line_index: u8,
        m2_vibration_index: usize,
        rna_phase: bool,
    ) -> Self {
        let address64 = mahamaya_address64_from_degree(degree360);
        let nucleotide_bits = nucleotide_bits_for_address(address64, rna_phase);
        let m2_to_m3_symbol = apply_epogdoon_compression(m2_vibration_index);
        let round_trip_loss = epogdoon_has_round_trip_loss(m2_vibration_index);
        Self {
            address64,
            hexagram_id: address64,
            king_wen: king_wen_from_address64(address64),
            upper_trigram: address64 >> 3,
            lower_trigram: address64 & 0b0000_0111,
            codon_id: address64,
            nucleotide_bits,
            codon: codon_for_bits(nucleotide_bits, rna_phase),
            dna_rna_phase: if rna_phase { "RNA" } else { "DNA" }.to_owned(),
            line_index: line_index % 6,
            line_change_operator: address64 as u16 * I_CHING_LINE_COUNT + (line_index % 6) as u16,
            m2_vibration_index,
            m2_to_m3_symbol,
            round_trip_loss,
            transcription_state: if round_trip_loss {
                "compressed-nonexact-round-trip"
            } else {
                "round-trip-anchor"
            }
            .to_owned(),
        }
    }
}

pub fn mahamaya_address64_from_degree(degree360: u16) -> u8 {
    (((degree360 % 360) as u32 * MAHAMAYA_SYMBOL_COUNT as u32) / 360) as u8
}

/// Canonical dual Fu-Xi ↔ King Wen translation table (M3 domain-law).
///
/// `address64` is the Fu-Xi binary order (`upper_trigram << 3 | lower_trigram`,
/// each trigram a 3-bit value whose bit0 is its bottom line; so `address64`
/// bit i == hexagram line (i+1), line 1 = bottom = LSB). King Wen order is a
/// distinct permutation of that 64-set. `KING_WEN_FROM_ADDRESS64[address64]`
/// gives the King Wen ordinal 1..=64; `ADDRESS64_FROM_KING_WEN[king_wen - 1]`
/// is the exact inverse. The pair is a bijection (asserted in tests).
///
/// Provenance (CHARTER rule 3): the King Wen sequence is transcribed from the
/// canonical `KING_WEN_LINES` line-pattern table in the FROZEN reference
/// `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3HexagramBrowser.tsx`
/// (which consumed this same address bus, so its address→King-Wen mapping is on
/// this kernel's trigram encoding). Each 6-bit bottom→top line string there is
/// folded to `address64` (line 1 = LSB) and paired with its King Wen ordinal
/// (array index + 1); the bijection + anchor tests below verify the transcription
/// against this kernel's own trigram convention (all-yang addr 63 = Qian/King Wen 1,
/// all-yin addr 0 = Kun/King Wen 2).
pub const KING_WEN_FROM_ADDRESS64: [u8; 64] = [
    2, 24, 7, 19, 15, 36, 46, 11, 16, 51, 40, 54, 62, 55, 32, 34, 8, 3, 29, 60, 39, 63, 48, 5, 45,
    17, 47, 58, 31, 49, 28, 43, 23, 27, 4, 41, 52, 22, 18, 26, 35, 21, 64, 38, 56, 30, 50, 14, 20,
    42, 59, 61, 53, 37, 57, 9, 12, 25, 6, 10, 33, 13, 44, 1,
];

/// Inverse of [`KING_WEN_FROM_ADDRESS64`]: King Wen ordinal (1..=64) → Fu-Xi
/// `address64` (0..=63). Index is `king_wen - 1`.
pub const ADDRESS64_FROM_KING_WEN: [u8; 64] = [
    63, 0, 17, 34, 23, 58, 2, 16, 55, 59, 7, 56, 61, 47, 4, 8, 25, 38, 3, 48, 41, 37, 32, 1, 57,
    39, 33, 30, 18, 45, 28, 14, 60, 15, 40, 5, 53, 43, 20, 10, 35, 49, 31, 62, 24, 6, 26, 22, 29,
    46, 9, 36, 52, 11, 13, 44, 54, 27, 50, 19, 51, 12, 21, 42,
];

/// Translate a Fu-Xi `address64` (0..=63) to its King Wen ordinal (1..=64).
/// Masks to the low 6 bits so a caller passing a raw codon id stays in range.
pub fn king_wen_from_address64(address64: u8) -> u8 {
    KING_WEN_FROM_ADDRESS64[(address64 & 0b0011_1111) as usize]
}

/// Translate a King Wen ordinal (1..=64) to its Fu-Xi `address64` (0..=63).
/// A `king_wen` outside 1..=64 falls back to 0 (the all-yin ground, Kun).
pub fn address64_from_king_wen(king_wen: u8) -> u8 {
    if king_wen == 0 || king_wen > 64 {
        return 0;
    }
    ADDRESS64_FROM_KING_WEN[(king_wen - 1) as usize]
}

pub fn apply_epogdoon_compression(m2_vibration_index: usize) -> u8 {
    ((m2_vibration_index * 8) / 9).min(63) as u8
}

pub fn epogdoon_has_round_trip_loss(m2_vibration_index: usize) -> bool {
    let compressed = apply_epogdoon_compression(m2_vibration_index) as usize;
    ((compressed * 9) / 8) != m2_vibration_index
}

pub fn line_change_operator(hexagram_id: u8, line_index: u8) -> u16 {
    (hexagram_id % 64) as u16 * I_CHING_LINE_COUNT + (line_index % 6) as u16
}

fn nucleotide_bits_for_address(address64: u8, rna_phase: bool) -> [u8; 3] {
    let mut bits = [
        (address64 >> 4) & 0b11,
        (address64 >> 2) & 0b11,
        address64 & 0b11,
    ];
    if rna_phase {
        for bit in &mut bits {
            *bit ^= 0b01;
        }
    }
    bits
}

fn codon_for_bits(bits: [u8; 3], rna_phase: bool) -> String {
    bits.into_iter()
        .map(|bit| nucleotide_for_bits(bit, rna_phase))
        .collect()
}

fn nucleotide_for_bits(bits: u8, rna_phase: bool) -> char {
    match bits & 0b11 {
        0b00 => 'A',
        0b01 => {
            if rna_phase {
                'U'
            } else {
                'T'
            }
        }
        0b10 => 'C',
        _ => 'G',
    }
}

#[cfg(test)]
mod tests {
    use super::{
        address64_from_king_wen, apply_epogdoon_compression, epogdoon_has_round_trip_loss,
        king_wen_from_address64, line_change_operator, mahamaya_address64_from_degree,
        MahamayaCodecProjection, ADDRESS64_FROM_KING_WEN, KING_WEN_FROM_ADDRESS64,
    };

    #[test]
    fn degree_maps_to_stable_64_fold_address() {
        assert_eq!(mahamaya_address64_from_degree(0), 0);
        assert_eq!(mahamaya_address64_from_degree(60), 10);
        assert_eq!(mahamaya_address64_from_degree(120), 21);
        assert_eq!(mahamaya_address64_from_degree(180), 32);
        assert_eq!(mahamaya_address64_from_degree(240), 42);
        assert_eq!(mahamaya_address64_from_degree(300), 53);
        assert_eq!(mahamaya_address64_from_degree(360), 0);
    }

    #[test]
    fn line_change_address_is_hexagram_times_six_plus_line() {
        assert_eq!(line_change_operator(42, 4), 256);
        assert_eq!(line_change_operator(63, 5), 383);
        assert_eq!(line_change_operator(64, 7), 1);
    }

    #[test]
    fn epogdoon_compression_marks_non_round_tripping_m2_slots() {
        assert_eq!(apply_epogdoon_compression(0), 0);
        assert_eq!(apply_epogdoon_compression(8), 7);
        assert_eq!(apply_epogdoon_compression(9), 8);
        assert_eq!(apply_epogdoon_compression(71), 63);
        assert!(!epogdoon_has_round_trip_loss(0));
        assert!(epogdoon_has_round_trip_loss(8));
    }

    #[test]
    fn king_wen_lut_is_a_bijection_with_a_clean_inverse() {
        // Every King Wen ordinal 1..=64 appears exactly once in the forward LUT.
        let mut seen = [false; 65];
        for &kw in KING_WEN_FROM_ADDRESS64.iter() {
            assert!((1..=64).contains(&kw), "king_wen {kw} out of range 1..=64");
            assert!(!seen[kw as usize], "king_wen {kw} appears more than once");
            seen[kw as usize] = true;
        }
        assert!(
            (1..=64).all(|kw| seen[kw as usize]),
            "forward LUT must cover all 64 King Wen ordinals"
        );

        // Inverse LUT covers every Fu-Xi address64 0..=63 exactly once.
        let mut seen_addr = [false; 64];
        for &addr in ADDRESS64_FROM_KING_WEN.iter() {
            assert!(addr < 64, "address64 {addr} out of range 0..=63");
            assert!(!seen_addr[addr as usize], "address64 {addr} appears more than once");
            seen_addr[addr as usize] = true;
        }

        // Round-trip both directions.
        for addr in 0u8..64 {
            let kw = king_wen_from_address64(addr);
            assert_eq!(address64_from_king_wen(kw), addr, "addr {addr} round-trip");
        }
        for kw in 1u8..=64 {
            let addr = address64_from_king_wen(kw);
            assert_eq!(king_wen_from_address64(addr), kw, "king_wen {kw} round-trip");
        }
    }

    #[test]
    fn king_wen_anchors_match_this_kernels_trigram_encoding() {
        // Kernel trigram convention: bit0 of a 3-bit trigram is its bottom line,
        // 1 = yang. address64 = upper<<3 | lower, so line i (1-based) = bit (i-1).
        // All-yang hexagram (both trigrams 0b111) => address64 = 63 = Qian, KW1.
        let all_yang = (0b111u8 << 3) | 0b111u8;
        assert_eq!(all_yang, 63);
        assert_eq!(king_wen_from_address64(all_yang), 1, "all-yang => Qian (King Wen 1)");
        // All-yin hexagram (both trigrams 0b000) => address64 = 0 = Kun, KW2.
        let all_yin = 0u8;
        assert_eq!(king_wen_from_address64(all_yin), 2, "all-yin => Kun (King Wen 2)");
        // A projection built from the all-yang degree carries king_wen 1.
        // address64 = 63 corresponds to degree ~354 (⌊deg*64/360⌋ == 63).
        let qian = MahamayaCodecProjection::from_clock(355, 0, 0, false);
        assert_eq!(qian.address64, 63);
        assert_eq!(qian.hexagram_id, 63, "Fu-Xi address preserved on the struct");
        assert_eq!(qian.king_wen, 1, "King Wen ordinal derived via the LUT");
    }

    #[test]
    fn rna_phase_flips_two_bit_polarity_without_losing_address() {
        let dna = MahamayaCodecProjection::from_clock(240, 4, 64, false);
        let rna = MahamayaCodecProjection::from_clock(240, 4, 64, true);
        assert_eq!(dna.address64, 42);
        assert_eq!(rna.address64, 42);
        assert_eq!(dna.nucleotide_bits, [2, 2, 2]);
        assert_eq!(rna.nucleotide_bits, [3, 3, 3]);
        assert_eq!(dna.codon, "CCC");
        assert_eq!(rna.codon, "GGG");
        assert_eq!(rna.line_change_operator, 256);
        assert_eq!(rna.transcription_state, "compressed-nonexact-round-trip");
    }
}
