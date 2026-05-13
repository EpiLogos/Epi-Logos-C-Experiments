use crate::codon::codon_to_amino_acid;

pub const AMINO_ACID_NAMES: [&str; 24] = [
    "Phe", "Leu", "Ile", "Met", "Val", "Ser", "Pro", "Thr", "Ala", "Tyr", "STOP", "His", "Gln",
    "Asn", "Lys", "Asp", "Glu", "Cys", "Trp", "Arg", "Gly", "Sec", "Pyl", "Thr2",
];

pub const MAJOR_ARCANA_NAMES: [&str; 22] = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
];

pub const START_CODON: u8 = 0x07;
pub const STOP_CODONS: [u8; 3] = [0x10, 0x13, 0x1C];

#[inline]
pub fn is_start_codon(codon: u8) -> bool { codon == START_CODON }

#[inline]
pub fn is_stop_codon(codon: u8) -> bool { STOP_CODONS.contains(&codon) }

pub const DEGREE_TO_HEXAGRAM: [u8; 360] = [
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5,
    5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10,
    11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 15,
    15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19,
    19, 19, 19, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23,
    23, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27,
    28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 32, 32,
    32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 36, 36, 36,
    36, 36, 36, 37, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40,
    40, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44,
    45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 49, 49,
    49, 49, 49, 49, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 53, 53, 53,
    53, 53, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57,
    57, 58, 58, 58, 58, 58, 59, 59, 59, 59, 59, 59, 60, 60, 60, 60, 60, 60, 61, 61, 61, 61, 61, 62,
    62, 62, 62, 62, 62, 63, 63, 63, 63, 63,
];

#[derive(Clone, Debug)]
pub struct TranscriptionStep {
    pub degree: u16,
    pub hexagram: u8,
    pub codon: u8,
    pub amino_acid: u8,
    pub amino_name: &'static str,
    pub is_start: bool,
    pub is_stop: bool,
}

pub fn transcribe_degree(degree: u16, hexagram: u8) -> TranscriptionStep {
    let codon = hexagram & 0x3F;
    let aa = codon_to_amino_acid(codon);
    TranscriptionStep {
        degree,
        hexagram,
        codon,
        amino_acid: aa,
        amino_name: if (aa as usize) < AMINO_ACID_NAMES.len() {
            AMINO_ACID_NAMES[aa as usize]
        } else {
            "?"
        },
        is_start: is_start_codon(codon),
        is_stop: is_stop_codon(codon),
    }
}

pub fn transcribe_degree_from_lut(degree: u16) -> TranscriptionStep {
    let hex = DEGREE_TO_HEXAGRAM[(degree % 360) as usize];
    transcribe_degree(degree, hex)
}

pub fn walk_transcription_chain(degrees: &[u16]) -> Vec<TranscriptionStep> {
    degrees.iter().map(|&d| transcribe_degree_from_lut(d)).collect()
}

pub fn extract_first_orf(chain: &[TranscriptionStep]) -> &[TranscriptionStep] {
    let start = match chain.iter().position(|s| s.is_start) {
        Some(p) => p,
        None => return &[],
    };
    match chain[start + 1..].iter().position(|s| s.is_stop) {
        Some(p) => &chain[start..=(start + 1 + p)],
        None => &chain[start..],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn degree_to_hex_range() {
        for &h in &DEGREE_TO_HEXAGRAM {
            assert!(h < 64);
        }
    }

    #[test]
    fn all_degrees_produce_valid_transcription() {
        for deg in 0u16..360 {
            let step = transcribe_degree_from_lut(deg);
            assert!(step.codon < 64);
            assert_ne!(step.amino_name, "?");
        }
    }

    #[test]
    fn extract_orf_works() {
        let steps = vec![
            transcribe_degree(0, 0),
            transcribe_degree(1, 7),
            transcribe_degree(2, 20),
            transcribe_degree(3, 16),
            transcribe_degree(4, 0),
        ];
        let orf = extract_first_orf(&steps);
        assert_eq!(orf.len(), 3);
        assert!(orf[0].is_start);
        assert!(orf[2].is_stop);
    }
}
