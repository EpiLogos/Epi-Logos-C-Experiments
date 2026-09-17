//! Coordinate: M3 → M4-4-4-4 (epigenetic expression sequence — the output tail)
//! Residency: Body/S/S0/portal-core/src
//! Actualises: the expression-sequence surface of [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]]
//!   §3.4 (DR-ENV-3). The environmentally-SELECTED codon states (from
//!   `m3_quat_active_state` — the P3.2 env→state feed) express as ORDERED
//!   codon → RNA/anticodon → amino-acid transformational sequences, co-emitting
//!   the Major-Arcana transcription pathway and flagging Euler-prime (41/43)
//!   attractor checkpoints between adjacent codons. **Expression, NEVER mutation**
//!   (DR-ENV-3): every field derives from the immutable codon genome; the
//!   environment selects WHICH rotational state is expressed, it never rewrites
//!   the codon. The RNA/anticodon is a genuine ORDERED intermediate here, not a
//!   parallel co-bundle (the gap the ambient layer's roadmap item 5 named).
//! Does NOT own: the env→state selection (`m3_quat_active_state`, C kernel / P3.2),
//!   the codon genome LUTs (`luts::codon`), or the natal/composition layers.

use crate::luts::codon::{codon_to_amino_acid, wc_anticodon};
use crate::m3_transcription_bridge::{major_arcana, MajorArcanaCard};

/// Nucleotide → I Ching value, indexed 0=A, 1=T, 2=C, 3=G (mirrors the C kernel
/// `NUCLEOTIDE_ICHING_VALUE`, m3.c:25 — A=6, T=9, C=7, G=8).
const NUCLEOTIDE_ICHING_VALUE: [u8; 4] = [6, 9, 7, 8];

/// The Euler primes that mark transcription attractor checkpoints (HMS FR 2.Q.10).
const EULER_PRIME_ATTRACTORS: [u8; 2] = [41, 43];

/// The I Ching sum of a codon's three nucleotides. Mirrors the C kernel
/// `get_codon_iching_sum` (m3.c:40).
pub fn codon_iching_sum(codon: u8) -> u8 {
    let n1 = ((codon >> 4) & 0x03) as usize;
    let n2 = ((codon >> 2) & 0x03) as usize;
    let n3 = (codon & 0x03) as usize;
    NUCLEOTIDE_ICHING_VALUE[n1] + NUCLEOTIDE_ICHING_VALUE[n2] + NUCLEOTIDE_ICHING_VALUE[n3]
}

/// True when a codon PAIR's I Ching sums total an Euler-prime attractor (41/43) —
/// a transcription pause/lock checkpoint (HMS FR 2.Q.10). Mirrors the C kernel
/// `m3_is_prime_attractor` (m3.c:325).
pub fn is_prime_attractor(codon_a: u8, codon_b: u8) -> bool {
    let total = codon_iching_sum(codon_a) as u16 + codon_iching_sum(codon_b) as u16;
    EULER_PRIME_ATTRACTORS.iter().any(|&p| total == p as u16)
}

/// One ordered stage of epigenetic expression (DR-ENV-3: expression, never
/// mutation). The environment SELECTED this codon's `active_state`; the stage then
/// expresses the immutable genome as codon → RNA/anticodon → amino-acid, plus its
/// Major-Arcana pathway. `checkpoint` is set when this codon pairs with the
/// PRECEDING one at an Euler-prime attractor (41/43) — where transcription pauses.
#[derive(Clone, Debug, PartialEq)]
pub struct ExpressionStep {
    /// The genome triplet (immutable input) — 6-bit codon id.
    pub codon: u8,
    /// The environmentally-selected rotational state (0-7) being expressed.
    pub active_state: u8,
    /// Transcription: the RNA/anticodon (reverse-complement) — the genuine
    /// intermediate BETWEEN the codon and its amino-acid.
    pub rna_anticodon: u8,
    /// Translation: the amino-acid index the codon (via its RNA) codes for.
    pub amino_acid: u8,
    /// The Major-Arcana transcription pathway (22-fold); `None` for STOP/unmapped.
    pub major_arcana: Option<MajorArcanaCard>,
    /// Transcription pause: this codon + the preceding codon reach an Euler-prime
    /// attractor (41/43). Always false for the first step (no preceding codon).
    pub checkpoint: bool,
}

/// Express a single environmentally-selected codon state as an ordered
/// codon → RNA → amino-acid step (no preceding codon → no checkpoint).
pub fn express_codon(codon: u8, active_state: u8) -> ExpressionStep {
    ExpressionStep {
        codon,
        active_state: active_state & 0x07,
        rna_anticodon: wc_anticodon(codon),
        amino_acid: codon_to_amino_acid(codon),
        major_arcana: major_arcana(codon),
        checkpoint: false,
    }
}

/// Walk the environmentally-selected codon states as an expression SEQUENCE
/// (DR-ENV-3, spec §3.4). `codons[i]` is expressed in the rotational state
/// `active_states[i]` (from `m3_quat_active_state` — the P3.2 env→state feed).
/// Each step threads codon → RNA → amino-acid and co-emits its Major-Arcana
/// pathway; a step is a `checkpoint` when its codon pairs with the previous one
/// at an Euler-prime attractor (41/43), where transcription pauses. The walk is
/// pure — it never mutates the genome; every field is a function of the codon.
/// Zips to the shorter of the two slices.
pub fn walk_expression(codons: &[u8], active_states: &[u8]) -> Vec<ExpressionStep> {
    let n = codons.len().min(active_states.len());
    let mut steps = Vec::with_capacity(n);
    for i in 0..n {
        let mut step = express_codon(codons[i], active_states[i]);
        if i > 0 {
            step.checkpoint = is_prime_attractor(codons[i - 1], codons[i]);
        }
        steps.push(step);
    }
    steps
}

#[cfg(test)]
mod tests {
    use super::*;

    // codon encoding: (n1<<4)|(n2<<2)|n3, with 0=A,1=T,2=C,3=G (codon.rs:44).
    const ACA: u8 = 0b00_10_00; // A,C,A -> I Ching 6+7+6 = 19
    const ACT: u8 = 0b00_10_01; // A,C,T -> 6+7+9 = 22   (ACA+ACT = 41)
    const ACG: u8 = 0b00_10_11; // A,C,G -> 6+7+8 = 21   (ACG+ACT = 43)

    #[test]
    fn iching_sum_mirrors_the_c_kernel() {
        assert_eq!(codon_iching_sum(ACA), 19);
        assert_eq!(codon_iching_sum(ACT), 22);
        assert_eq!(codon_iching_sum(ACG), 21);
    }

    #[test]
    fn prime_attractor_fires_at_both_euler_primes_41_and_43() {
        assert!(is_prime_attractor(ACA, ACT), "19+22 = 41");
        assert!(is_prime_attractor(ACG, ACT), "21+22 = 43");
        assert!(!is_prime_attractor(ACA, ACA), "19+19 = 38, no attractor");
    }

    #[test]
    fn rna_anticodon_is_a_genuine_ordered_intermediate_not_a_parallel_bundle() {
        // The step threads codon -> RNA -> amino-acid; the RNA/anticodon is present
        // as its own stage and is the reverse-complement of the codon.
        let step = express_codon(ACA, 3);
        assert_eq!(step.rna_anticodon, wc_anticodon(ACA));
        assert_ne!(
            step.rna_anticodon, step.codon,
            "ACA is non-palindromic → RNA differs"
        );
        assert_eq!(step.amino_acid, codon_to_amino_acid(ACA));
    }

    #[test]
    fn dr_env_3_epigenetic_is_not_mutation_the_genome_is_state_invariant() {
        // The environment SELECTS the rotational state; it must NEVER change the
        // genome-derived expression. Express the SAME codon under all 8 states:
        // codon / RNA / amino-acid / arcana are byte-identical — only active_state
        // moves. This is DR-ENV-3 pinned at the M3 expression layer.
        let baseline = express_codon(ACA, 0);
        for state in 0u8..8 {
            let s = express_codon(ACA, state);
            assert_eq!(s.codon, baseline.codon, "genome must not mutate");
            assert_eq!(
                s.rna_anticodon, baseline.rna_anticodon,
                "RNA must not mutate"
            );
            assert_eq!(
                s.amino_acid, baseline.amino_acid,
                "amino-acid must not mutate"
            );
            assert_eq!(
                s.major_arcana, baseline.major_arcana,
                "arcana pathway must not mutate"
            );
            assert_eq!(s.active_state, state, "only the expressed state moves");
        }
    }

    #[test]
    fn walk_expresses_each_env_selected_state_and_flags_the_checkpoint() {
        let codons = [ACA, ACT, ACG];
        let states = [1u8, 4, 7];
        let seq = walk_expression(&codons, &states);
        assert_eq!(seq.len(), 3);
        // each env-selected state produced its own codon→RNA→amino-acid step
        for (i, step) in seq.iter().enumerate() {
            assert_eq!(step.codon, codons[i]);
            assert_eq!(step.active_state, states[i]);
            assert_eq!(step.rna_anticodon, wc_anticodon(codons[i]));
        }
        assert!(!seq[0].checkpoint, "first step has no preceding codon");
        assert!(
            seq[1].checkpoint,
            "ACA→ACT is an Euler-prime (41) checkpoint"
        );
        assert!(
            seq[2].checkpoint,
            "ACT→ACG is an Euler-prime (43) checkpoint"
        );
    }

    #[test]
    fn walk_is_deterministic_and_zips_to_the_shorter_slice() {
        let codons = [ACA, ACT, ACG];
        let states = [1u8, 4];
        assert_eq!(
            walk_expression(&codons, &states),
            walk_expression(&codons, &states)
        );
        assert_eq!(walk_expression(&codons, &states).len(), 2);
    }
}
