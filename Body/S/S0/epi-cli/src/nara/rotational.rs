//! Rotational state generation engine — Rust port of m3_generate_rotational_states().
//!
//! Each codon (6-bit, 0–63) produces exactly 8 raw rotational states:
//!   4 negative (vary first nucleotide, keep n2/n3)
//! + 4 positive (keep n1/n2, vary last nucleotide)
//!
//! The rotational_value for each state is computed from the PAIR_MATRIX.
//! After generation, states are re-ranked by rotational_value (ascending,
//! with polarity tie-break).
//!
//! Reference: epi-lib/include/m3.h FR 2.3.14, epi-lib/src/m3.c lines 506-581.

// ─── Pair Matrix ─────────────────────────────────────────────────────────────
//
// Mirrors M3_PAIR_MATRIX[16] from m3.c.
// Indexed by (nuc1 << 2) | nuc2.  Each entry: (sum_value, difference_value).

/// Pair matrix: (sum_value, difference_value) indexed by (nuc1<<2)|nuc2.
/// Mirrors C `M3_PAIR_MATRIX[16]` exactly.
pub const PM: [(i8, i8); 16] = [
    (12, 0),  // 0  AA
    (15, -3), // 1  AT
    (13, -1), // 2  AC
    (14, 2),  // 3  AG
    (15, 3),  // 4  TA
    (18, 0),  // 5  TT
    (16, -2), // 6  TC
    (17, 1),  // 7  TG
    (13, 1),  // 8  CA
    (16, -2), // 9  CT
    (14, 0),  // 10 CC
    (15, -1), // 11 CG
    (14, 2),  // 12 GA
    (17, -1), // 13 GT
    (15, 1),  // 14 GC
    (16, 0),  // 15 GG
];

// ─── Types ───────────────────────────────────────────────────────────────────

/// Polarity of a rotational state.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Polarity {
    Negative = 0,
    Positive = 1,
}

/// One rotational state of a codon (always 8 raw states per codon).
#[derive(Clone, Debug)]
pub struct RotationalState {
    pub pair1_idx: u8,
    pub pair2_idx: u8,
    pub resulting_codon: u8,
    pub polarity: Polarity,
    pub rotation_slot: u8,
    pub rotation_degrees: u16,
    pub rotational_value: i8,
    pub is_non_dual: bool,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/// Encode a dinucleotide pair: (n1 << 2) | n2.
#[inline]
pub fn encode_pair(n1: u8, n2: u8) -> u8 {
    (n1 << 2) | (n2 & 0x03)
}

/// Compose a resulting codon from two pair indices.
///
/// Positive path: Xy + Za → X·y·a  (keeps first pair's structure, appends a)
/// Negative path: Xy + Za → X·Z·a  (takes X from first, Z·a from second)
#[inline]
pub fn compose_rotational_state(xy: u8, za: u8, positive: bool) -> u8 {
    let x = (xy >> 2) & 0x03;
    let y = xy & 0x03;
    let z = (za >> 2) & 0x03;
    let a = za & 0x03;
    if positive {
        (x << 4) | (y << 2) | a
    } else {
        (x << 4) | (z << 2) | a
    }
}

// ─── Core generation ─────────────────────────────────────────────────────────

/// Generate all 8 rotational states for a given 6-bit codon.
///
/// Mirrors `m3_generate_rotational_states()` from epi-lib/src/m3.c.
///
/// - Negative path (4 states): vary first nucleotide (0..4), keep (n2, n3) via last_pair.
///   Wait — re-reading the C: negative path iterates `first` in 0..4, builds pair2 = encode(first, n3),
///   and uses `first_pair` (the ORIGINAL n1·n2) as pair1.
/// - Positive path (4 states): iterates `second` in 0..4, builds pair1 = encode(n1, second),
///   and uses `last_pair` (the ORIGINAL n2·n3) as pair2.
/// - After all 8, sort by rotational_value ascending, tie-break by polarity ascending.
pub fn generate_rotational_states(codon6bit: u8) -> Vec<RotationalState> {
    let n1 = (codon6bit >> 4) & 0x03;
    let n2 = (codon6bit >> 2) & 0x03;
    let n3 = codon6bit & 0x03;
    let first_pair = encode_pair(n1, n2);
    let last_pair = encode_pair(n2, n3);

    let mut states = Vec::with_capacity(8);

    // Negative path: 4 states
    for first in 0u8..4 {
        let pair2 = encode_pair(first, n3);
        let rv = PM[first_pair as usize].0 + PM[pair2 as usize].1; // sum_value(first_pair) + difference_value(pair2)
        states.push(RotationalState {
            pair1_idx: first_pair,
            pair2_idx: pair2,
            resulting_codon: compose_rotational_state(first_pair, pair2, false),
            polarity: Polarity::Negative,
            rotation_slot: states.len() as u8,
            rotation_degrees: (states.len() as u16) * 45,
            rotational_value: rv,
            is_non_dual: first_pair == pair2,
        });
    }

    // Positive path: 4 states
    for second in 0u8..4 {
        let pair1 = encode_pair(n1, second);
        let rv = PM[pair1 as usize].1 + PM[last_pair as usize].0; // difference_value(pair1) + sum_value(last_pair)
        states.push(RotationalState {
            pair1_idx: pair1,
            pair2_idx: last_pair,
            resulting_codon: compose_rotational_state(pair1, last_pair, true),
            polarity: Polarity::Positive,
            rotation_slot: states.len() as u8,
            rotation_degrees: (states.len() as u16) * 45,
            rotational_value: rv,
            is_non_dual: pair1 == last_pair,
        });
    }

    // Sort by rotational_value ascending; tie-break: polarity ascending (Negative < Positive)
    // Use an index-based sort like the C code does, then re-assign rotation_slot/degrees.
    let mut order: Vec<usize> = (0..states.len()).collect();
    order.sort_by(|&a, &b| {
        let va = states[a].rotational_value;
        let vb = states[b].rotational_value;
        va.cmp(&vb)
            .then_with(|| (states[a].polarity as u8).cmp(&(states[b].polarity as u8)))
    });

    // Re-assign rotation_slot and rotation_degrees based on sorted rank
    for (rank, &orig_idx) in order.iter().enumerate() {
        states[orig_idx].rotation_slot = rank as u8;
        states[orig_idx].rotation_degrees = (rank as u16) * 45;
    }

    states
}

/// Classify a codon and return the effective rotational state count (7 or 8).
/// All 64 codons produce 8 raw states, but non-dual codons have only 7 distinct
/// polarized states (1 is the non-dual overlap).
pub fn effective_state_count(codon6bit: u8) -> u8 {
    crate::nara::oracle::classify_codon(codon6bit).rotational_state_count()
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aaa_produces_8_raw_states() {
        let codon_aaa = 0u8; // A=0, so AAA = (0<<4)|(0<<2)|0 = 0
        let states = generate_rotational_states(codon_aaa);
        assert_eq!(states.len(), 8, "AAA should produce 8 raw states");
    }

    #[test]
    fn aaa_has_non_dual_states() {
        let states = generate_rotational_states(0u8); // AAA
        let non_dual_count = states.iter().filter(|s| s.is_non_dual).count();
        assert!(
            non_dual_count > 0,
            "AAA (perfect palindromic) should have at least one non-dual state"
        );
    }

    #[test]
    fn all_64_codons_produce_8_raw_states() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            assert_eq!(
                states.len(),
                8,
                "Codon {} should produce 8 raw states, got {}",
                codon,
                states.len()
            );
        }
    }

    #[test]
    fn resulting_codon_always_valid() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            for (i, s) in states.iter().enumerate() {
                assert!(
                    s.resulting_codon < 64,
                    "Codon {} state {} has resulting_codon {} (>= 64)",
                    codon,
                    i,
                    s.resulting_codon
                );
            }
        }
    }

    #[test]
    fn negative_states_have_negative_polarity() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            // First 4 are negative, last 4 are positive (before sorting re-assigns slots)
            for s in &states {
                // After sorting, slot assignment changes but polarity is fixed at creation
                // Just check that we have exactly 4 of each polarity
            }
            let neg_count = states
                .iter()
                .filter(|s| s.polarity == Polarity::Negative)
                .count();
            let pos_count = states
                .iter()
                .filter(|s| s.polarity == Polarity::Positive)
                .count();
            assert_eq!(
                neg_count, 4,
                "Codon {} should have 4 negative states",
                codon
            );
            assert_eq!(
                pos_count, 4,
                "Codon {} should have 4 positive states",
                codon
            );
        }
    }

    #[test]
    fn rotation_slots_are_unique_0_to_7() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            let mut slots: Vec<u8> = states.iter().map(|s| s.rotation_slot).collect();
            slots.sort();
            assert_eq!(
                slots,
                vec![0, 1, 2, 3, 4, 5, 6, 7],
                "Codon {} should have rotation_slots 0-7",
                codon
            );
        }
    }

    #[test]
    fn rotation_degrees_match_slots() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            for s in &states {
                assert_eq!(
                    s.rotation_degrees,
                    (s.rotation_slot as u16) * 45,
                    "Codon {} slot {} should have degrees {}",
                    codon,
                    s.rotation_slot,
                    s.rotation_slot as u16 * 45
                );
            }
        }
    }

    #[test]
    fn encode_pair_basic() {
        assert_eq!(encode_pair(0, 0), 0); // AA
        assert_eq!(encode_pair(1, 1), 5); // TT
        assert_eq!(encode_pair(3, 3), 15); // GG
        assert_eq!(encode_pair(0, 1), 1); // AT
    }

    #[test]
    fn compose_positive_vs_negative() {
        // Xy=AT(01), Za=CG(11)
        // Positive: X·y·a = A·T·G = (0<<4)|(1<<2)|3 = 7
        // Negative: X·Z·a = A·C·G = (0<<4)|(2<<2)|3 = 11
        let xy = encode_pair(0, 1); // AT = 1
        let za = encode_pair(2, 3); // CG = 11
        assert_eq!(compose_rotational_state(xy, za, true), 7); // ATG
        assert_eq!(compose_rotational_state(xy, za, false), 11); // ACG
    }
}
