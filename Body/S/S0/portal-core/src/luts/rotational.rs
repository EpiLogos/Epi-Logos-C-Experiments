/// Pair matrix: (sum_value, difference_value) indexed by (nuc1<<2)|nuc2.
/// Mirrors C M3_PAIR_MATRIX[16].
pub const PM: [(i8, i8); 16] = [
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
    (15, -1),
    (14, 2),
    (17, -1),
    (15, 1),
    (16, 0),
];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Polarity {
    Negative = 0,
    Positive = 1,
}

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

#[inline]
pub fn encode_pair(n1: u8, n2: u8) -> u8 {
    (n1 << 2) | (n2 & 0x03)
}

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

/// Generate all 8 rotational states for a given 6-bit codon.
/// Mirrors m3_generate_rotational_states() from epi-lib/src/m3.c.
pub fn generate_rotational_states(codon6bit: u8) -> Vec<RotationalState> {
    let n1 = (codon6bit >> 4) & 0x03;
    let n2 = (codon6bit >> 2) & 0x03;
    let n3 = codon6bit & 0x03;
    let first_pair = encode_pair(n1, n2);
    let last_pair = encode_pair(n2, n3);

    let mut states = Vec::with_capacity(8);

    for first in 0u8..4 {
        let pair2 = encode_pair(first, n3);
        let rv = PM[first_pair as usize].0 + PM[pair2 as usize].1;
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

    for second in 0u8..4 {
        let pair1 = encode_pair(n1, second);
        let rv = PM[pair1 as usize].1 + PM[last_pair as usize].0;
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

    let mut order: Vec<usize> = (0..states.len()).collect();
    order.sort_by(|&a, &b| {
        states[a]
            .rotational_value
            .cmp(&states[b].rotational_value)
            .then_with(|| (states[a].polarity as u8).cmp(&(states[b].polarity as u8)))
    });

    for (rank, &orig_idx) in order.iter().enumerate() {
        states[orig_idx].rotation_slot = rank as u8;
        states[orig_idx].rotation_degrees = (rank as u16) * 45;
    }

    states
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_64_produce_8_states() {
        for codon in 0u8..64 {
            assert_eq!(generate_rotational_states(codon).len(), 8);
        }
    }

    #[test]
    fn resulting_codons_valid() {
        for codon in 0u8..64 {
            for s in generate_rotational_states(codon) {
                assert!(s.resulting_codon < 64);
            }
        }
    }

    #[test]
    fn polarity_balance() {
        for codon in 0u8..64 {
            let states = generate_rotational_states(codon);
            let neg = states
                .iter()
                .filter(|s| s.polarity == Polarity::Negative)
                .count();
            let pos = states
                .iter()
                .filter(|s| s.polarity == Polarity::Positive)
                .count();
            assert_eq!(neg, 4);
            assert_eq!(pos, 4);
        }
    }

    #[test]
    fn slots_unique_0_to_7() {
        for codon in 0u8..64 {
            let mut slots: Vec<u8> = generate_rotational_states(codon)
                .iter()
                .map(|s| s.rotation_slot)
                .collect();
            slots.sort();
            assert_eq!(slots, vec![0, 1, 2, 3, 4, 5, 6, 7]);
        }
    }
}
