use crate::types::CodonClass;

pub const CODON_TO_AA: [u8; 64] = [
    14, 13, 7, 5, 3, 0, 5, 17, 7, 5, 7, 5, 5, 5, 5, 5, 10, 9, 5, 10, 1, 0, 1, 1, 5, 5, 5, 5, 10,
    17, 17, 18, 12, 11, 12, 11, 1, 1, 1, 1, 6, 6, 6, 6, 19, 19, 19, 19, 16, 15, 16, 15, 4, 4, 4, 4,
    8, 8, 8, 8, 20, 20, 20, 20,
];

pub const AA_STOP: u8 = 10;

pub fn codon_to_amino_acid(codon: u8) -> u8 {
    if codon >= 64 {
        return 0xFF;
    }
    CODON_TO_AA[codon as usize]
}

/// Algorithmic 3-tier codon classifier. No lookup table needed.
pub fn classify_codon(codon: u8) -> CodonClass {
    let n1 = (codon >> 4) & 0x03;
    let n2 = (codon >> 2) & 0x03;
    let n3 = codon & 0x03;
    if n1 == n3 {
        if n1 == n2 {
            CodonClass::PerfectPalindromic
        } else {
            CodonClass::ImperfectPalindromic
        }
    } else if n1 == n2 || n2 == n3 {
        CodonClass::NonPalindromicNonDual
    } else {
        CodonClass::Dual
    }
}

/// Watson-Crick anticodon: reverse-complement.
pub fn wc_anticodon(codon: u8) -> u8 {
    let n1 = (codon >> 4) & 0x03;
    let n2 = (codon >> 2) & 0x03;
    let n3 = codon & 0x03;
    ((n3 ^ 0x01) << 4) | ((n2 ^ 0x01) << 2) | (n1 ^ 0x01)
}

/// Decode a codon into its 3-letter nucleotide sequence. 0=A, 1=T, 2=C, 3=G.
pub fn codon_sequence(codon: u8) -> [u8; 3] {
    const NUC: [u8; 4] = [b'A', b'T', b'C', b'G'];
    [
        NUC[((codon >> 4) & 0x03) as usize],
        NUC[((codon >> 2) & 0x03) as usize],
        NUC[(codon & 0x03) as usize],
    ]
}

#[cfg(test)]
mod tests {
    /// DR-M3-1 pin: TCT is ImperfectPalindromic — the 7-state non-dual runtime
    /// law that overrides the Nine-of-Wands dataset 8-count. TCT encodes as
    /// 0x19 (T=01,C=10,T=01 → 0b01_10_01, per M3_NONDUAL_CODONS T-outer row);
    /// the register's original 0x35 literal was a hex typo (0x35 = GTT) —
    /// caught by this pin, corrected in the register 2026-07-10.
    #[test]
    fn dr_m3_1_tct_0x19_is_imperfect_palindromic_seven_state() {
        assert_eq!(
            super::classify_codon(0x19),
            super::CodonClass::ImperfectPalindromic,
            "classify_codon(TCT=0x19) is the DR-M3-1 authority"
        );
        assert_eq!(
            super::classify_codon(0x19).rotational_state_count(),
            7,
            "TCT is 7-state non-dual, never 8"
        );
    }

    use super::*;

    #[test]
    fn classify_all_64() {
        for c in 0u8..64 {
            let _ = classify_codon(c);
        }
    }

    #[test]
    fn aaa_is_perfect_palindromic() {
        assert_eq!(classify_codon(0), CodonClass::PerfectPalindromic);
    }

    #[test]
    fn anticodon_involution() {
        for c in 0u8..64 {
            assert_eq!(wc_anticodon(wc_anticodon(c)), c);
        }
    }

    #[test]
    fn codon_sequence_aaa() {
        assert_eq!(codon_sequence(0), [b'A', b'A', b'A']);
    }

    #[test]
    fn stop_codons_map_to_stop() {
        for &sc in &[0x10u8, 0x13, 0x1C] {
            assert_eq!(codon_to_amino_acid(sc), AA_STOP);
        }
    }
}
