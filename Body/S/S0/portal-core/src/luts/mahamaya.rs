use serde::{Deserialize, Serialize};

pub const MAHAMAYA_SYMBOL_COUNT: u16 = 64;
pub const I_CHING_LINE_COUNT: u16 = 6;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MahamayaCodecProjection {
    pub address64: u8,
    pub hexagram_id: u8,
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
    pub evolutionary_gap: bool,
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
        let evolutionary_gap = is_evolutionary_gap(m2_vibration_index);
        Self {
            address64,
            hexagram_id: address64,
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
            evolutionary_gap,
            transcription_state: if evolutionary_gap {
                "provisional-gap"
            } else {
                "resolved"
            }
            .to_owned(),
        }
    }
}

pub fn mahamaya_address64_from_degree(degree360: u16) -> u8 {
    (((degree360 % 360) as u32 * MAHAMAYA_SYMBOL_COUNT as u32) / 360) as u8
}

pub fn apply_epogdoon_compression(m2_vibration_index: usize) -> u8 {
    ((m2_vibration_index * 8) / 9).min(63) as u8
}

pub fn is_evolutionary_gap(m2_vibration_index: usize) -> bool {
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
        apply_epogdoon_compression, is_evolutionary_gap, line_change_operator,
        mahamaya_address64_from_degree, MahamayaCodecProjection,
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
        assert!(!is_evolutionary_gap(0));
        assert!(is_evolutionary_gap(8));
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
        assert_eq!(rna.transcription_state, "provisional-gap");
    }
}
