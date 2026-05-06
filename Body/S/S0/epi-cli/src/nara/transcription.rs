//! RNA/amino acid transcription chain.
//!
//! Chain: Degree -> Hexagram -> Codon -> Amino Acid -> (Major Arcana, Chromosome)
//!
//! Uses the standard genetic code mapping (M3_CODON_TO_AA) ported from m3.c.
//! START/STOP codon detection for reading-frame gating.
//!
//! Reference: docs/plans Finding F4, epi-lib/src/m3.c FR 2.3.9.

// ─── Codon-to-Amino-Acid LUT ────────────────────────────────────────────────
//
// Exact port of M3_CODON_TO_AA[64] from epi-lib/src/m3.c.
// Indexed by 6-bit codon: (outer<<4)|(mid<<2)|inner, where A=0,T=1,C=2,G=3.
// 0xFF = STOP codon.
//
// Amino acids: 0=Phe 1=Leu 2=Ile 3=Met(START) 4=Val 5=Ser 6=Pro 7=Thr
//   8=Ala 9=Tyr 10=STOP 11=His 12=Gln 13=Asn 14=Lys 15=Asp 16=Glu 17=Cys
//   18=Trp 19=Arg 20=Gly 21=Ser2 22=Arg2 23=Thr2

pub const CODON_TO_AA: [u8; 64] = [
    // A-outer (0x00-0x0F)
    14, 13, 7, 5, //  AAA=Lys  AAT=Asn  AAC=Thr  AAG=Ser
    3, 0, 5, 17, //  ATA=Met  ATT=Phe  ATC=Ser  ATG=Cys
    7, 5, 7, 5, //  ACA=Thr  ACT=Ser  ACC=Thr  ACG=Ser
    5, 5, 5, 5, //  AGA=Ser  AGT=Ser  AGC=Ser  AGG=Ser
    // T-outer (0x10-0x1F)
    10, 9, 5, 10, //  TAA=STOP TAT=Tyr  TAC=Ser  TAG=STOP
    1, 0, 1, 1, //  TTA=Leu  TTT=Phe  TTC=Leu  TTG=Leu
    5, 5, 5, 5, //  TCA=Ser  TCT=Ser  TCC=Ser  TCG=Ser
    10, 17, 17, 18, //  TGA=STOP TGT=Cys  TGC=Cys  TGG=Trp
    // C-outer (0x20-0x2F)
    12, 11, 12, 11, //  CAA=Gln  CAT=His  CAC=Gln  CAG=His
    1, 1, 1, 1, //  CTA=Leu  CTT=Leu  CTC=Leu  CTG=Leu
    6, 6, 6, 6, //  CCA=Pro  CCT=Pro  CCC=Pro  CCG=Pro
    19, 19, 19, 19, //  CGA=Arg  CGT=Arg  CGC=Arg  CGG=Arg
    // G-outer (0x30-0x3F)
    16, 15, 16, 15, //  GAA=Glu  GAT=Asp  GAC=Glu  GAG=Asp
    4, 4, 4, 4, //  GTA=Val  GTT=Val  GTC=Val  GTG=Val
    8, 8, 8, 8, //  GCA=Ala  GCT=Ala  GCC=Ala  GCG=Ala
    20, 20, 20, 20, //  GGA=Gly  GGT=Gly  GGC=Gly  GGG=Gly
];

/// Look up amino acid index for a 6-bit codon.
/// Returns the amino acid index (0-20), or 10 for STOP codons.
pub fn codon_to_amino_acid(codon: u8) -> u8 {
    if codon >= 64 {
        return 0xFF;
    }
    CODON_TO_AA[codon as usize]
}

// ─── Amino Acid & Major Arcana Names ─────────────────────────────────────────

pub const AMINO_ACID_NAMES: [&str; 24] = [
    "Phe", "Leu", "Ile", "Met", "Val", "Ser", "Pro", "Thr", "Ala", "Tyr", "STOP", "His", "Gln",
    "Asn", "Lys", "Asp", "Glu", "Cys", "Trp", "Arg", "Gly", "Sec", "Pyl", "Thr2",
];

pub const MAJOR_ARCANA_NAMES: [&str; 22] = [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Emperor",
    "The Hierophant",
    "The Lovers",
    "The Chariot",
    "Strength",
    "The Hermit",
    "Wheel of Fortune",
    "Justice",
    "The Hanged Man",
    "Death",
    "Temperance",
    "The Devil",
    "The Tower",
    "The Star",
    "The Moon",
    "The Sun",
    "Judgement",
    "The World",
];

// ─── START / STOP Codons ─────────────────────────────────────────────────────
//
// Encoding: A=0, T=1, C=2, G=3.
// ATG = (0<<4)|(1<<2)|3 = 7.
// TAA = (1<<4)|(0<<2)|0 = 16 = 0x10.
// TAG = (1<<4)|(0<<2)|3 = 19 = 0x13.
// TGA = (1<<4)|(3<<2)|0 = 28 = 0x1C.

pub const START_CODON: u8 = 0x07; // ATG
pub const STOP_CODONS: [u8; 3] = [0x10, 0x13, 0x1C]; // TAA, TAG, TGA

/// True if codon is the canonical START codon (ATG).
#[inline]
pub fn is_start_codon(codon: u8) -> bool {
    codon == START_CODON
}

/// True if codon is one of the three STOP codons (TAA, TAG, TGA).
#[inline]
pub fn is_stop_codon(codon: u8) -> bool {
    STOP_CODONS.contains(&codon)
}

// ─── Degree-to-Hexagram LUT ─────────────────────────────────────────────────
//
// Extracted from CLOCK_DEGREE_LUT[360].hexagram_id in m3_clock_lut.c.
// Used by the transcription chain to go Degree -> Hexagram -> Codon.

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

// ─── Transcription Chain ─────────────────────────────────────────────────────

/// A single step in the transcription chain:
///   Degree -> Hexagram -> Codon -> Amino Acid
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

/// Transcribe a single degree given its hexagram.
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

/// Transcribe a degree using the DEGREE_TO_HEXAGRAM LUT (no external hexagram needed).
pub fn transcribe_degree_from_lut(degree: u16) -> TranscriptionStep {
    let hex = DEGREE_TO_HEXAGRAM[(degree % 360) as usize];
    transcribe_degree(degree, hex)
}

/// Walk a sequence of degrees and produce a transcription chain.
///
/// The chain OPENS when a START codon (ATG) is encountered and CLOSES when
/// a STOP codon (TAA/TAG/TGA) is reached. Steps outside an open reading frame
/// are still included but can be filtered by the caller.
///
/// Returns the full sequence of TranscriptionSteps.
pub fn walk_transcription_chain(degrees: &[u16]) -> Vec<TranscriptionStep> {
    degrees
        .iter()
        .map(|&d| transcribe_degree_from_lut(d))
        .collect()
}

/// Extract only the steps within the first open reading frame (ORF).
/// An ORF starts at the first START codon and ends at the next STOP codon.
pub fn extract_first_orf(chain: &[TranscriptionStep]) -> &[TranscriptionStep] {
    let start_pos = chain.iter().position(|s| s.is_start);
    let start = match start_pos {
        Some(p) => p,
        None => return &[],
    };
    let stop_pos = chain[start + 1..].iter().position(|s| s.is_stop);
    match stop_pos {
        Some(p) => &chain[start..=(start + 1 + p)],
        None => &chain[start..], // no stop found — open ORF
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn atg_is_start_codon() {
        assert!(is_start_codon(START_CODON));
        assert!(is_start_codon(0x07)); // ATG = 7
    }

    #[test]
    fn taa_tag_tga_are_stop_codons() {
        assert!(is_stop_codon(0x10)); // TAA = 16
        assert!(is_stop_codon(0x13)); // TAG = 19
        assert!(is_stop_codon(0x1C)); // TGA = 28
    }

    #[test]
    fn start_is_not_stop_and_vice_versa() {
        assert!(!is_stop_codon(START_CODON));
        for &sc in &STOP_CODONS {
            assert!(!is_start_codon(sc));
        }
    }

    #[test]
    fn transcribe_degree_produces_valid_amino_names() {
        for deg in 0u16..360 {
            let step = transcribe_degree_from_lut(deg);
            assert!(
                step.amino_name != "?",
                "Degree {} produced unknown amino acid",
                deg
            );
            assert!(
                step.codon < 64,
                "Degree {} produced invalid codon {}",
                deg,
                step.codon
            );
        }
    }

    #[test]
    fn all_64_codons_produce_valid_transcription() {
        for codon in 0u8..64 {
            let step = transcribe_degree(0, codon);
            assert!(step.codon < 64);
            // amino_acid should be a valid index or 10 (STOP)
            assert!(
                (step.amino_acid as usize) < AMINO_ACID_NAMES.len(),
                "Codon {} maps to amino_acid {} which is out of range",
                codon,
                step.amino_acid
            );
        }
    }

    #[test]
    fn stop_codons_map_to_stop_amino() {
        for &sc in &STOP_CODONS {
            let aa = codon_to_amino_acid(sc);
            assert_eq!(
                aa, 10,
                "Stop codon {} should map to amino acid index 10 (STOP)",
                sc
            );
        }
    }

    #[test]
    fn degree_to_hexagram_range() {
        for &h in &DEGREE_TO_HEXAGRAM {
            assert!(h < 64, "hexagram_id {} out of range", h);
        }
    }

    #[test]
    fn walk_chain_includes_start_stop() {
        // Build a sequence that passes through degree 7 area (hexagram 1)
        // and degree 16 area (hexagram 2-3).
        // The actual start/stop depends on the hexagram->codon mapping.
        let degrees: Vec<u16> = (0..360).collect();
        let chain = walk_transcription_chain(&degrees);
        assert_eq!(chain.len(), 360);

        // At least check that we can find start and stop codons somewhere
        let has_start = chain.iter().any(|s| s.is_start);
        let has_stop = chain.iter().any(|s| s.is_stop);
        // Hexagram 7 = codon 7 = ATG (START) should appear
        assert!(
            has_start,
            "Full 360-degree walk should contain at least one START codon"
        );
        assert!(
            has_stop,
            "Full 360-degree walk should contain at least one STOP codon"
        );
    }

    #[test]
    fn extract_first_orf_works() {
        // Manually construct a chain with known START and STOP
        let steps = vec![
            transcribe_degree(0, 0),  // codon 0 = AAA = Lys
            transcribe_degree(1, 7),  // codon 7 = ATG = START
            transcribe_degree(2, 20), // codon 20 = GGA = Gly
            transcribe_degree(3, 16), // codon 16 = TAA = STOP
            transcribe_degree(4, 0),  // codon 0 = AAA = Lys
        ];
        let orf = extract_first_orf(&steps);
        assert_eq!(orf.len(), 3); // START, Gly, STOP
        assert!(orf[0].is_start);
        assert!(orf[2].is_stop);
    }
}
