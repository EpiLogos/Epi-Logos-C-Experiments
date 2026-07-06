//! Coordinate: S0/#5 (kernel truth suite, oracle side — Track 00.T4, cycle-3 full rerun)
//! Actualises: [[00-verification-harness]] T4(a) + recapture register §5.1 —
//! the oracle's Rust charge algebra cross-checked against the kernel charge
//! authority (`m3_compute_charges`, FR 2.3.18 closed form). Runs under the
//! kernel-truth verify-all stage with `--ignored`; red is the work order.

use epi_logos::nara::oracle::{oracle_eval4, IChingResult};
use portal_core::bioquaternion_transcription;

/// Build the no-changing-lines I-Ching result for a 6-bit codon/hexagram:
/// bit i set → yang line (7), clear → yin line (8).
fn iching_result_for_codon(codon: u8) -> IChingResult {
    let mut lines = [0u8; 6];
    for (i, line) in lines.iter_mut().enumerate() {
        *line = if (codon >> i) & 1 == 1 { 7 } else { 8 };
    }
    IChingResult {
        lines,
        primary_hexagram: codon & 0x3F,
        relating_hexagram: None,
        nuclear_hexagram: codon & 0x3F,
        changing_mask: 0,
        torus_pos: 0,
    }
}

#[test]
#[ignore = "expected-red: Track 33/4.13 (register §5.1) — oracle_eval4 carries an independent ±32-per-line charge algebra; the kernel authority m3_compute_charges derives pp/nn/np/pn from NUCLEOTIDE_ICHING_VALUE arithmetic. One charge authority must remain."]
fn oracle_eval4_charges_match_kernel_codon_charge_authority() {
    for codon in 0u8..64 {
        let kernel = bioquaternion_transcription(codon).charges;
        let oracle = oracle_eval4(&iching_result_for_codon(codon), 0.0, 0);
        assert_eq!(
            (oracle.pp, oracle.nn, oracle.np, oracle.pn),
            (
                kernel.pp as f32,
                kernel.nn as f32,
                kernel.np as f32,
                kernel.pn as f32
            ),
            "codon {codon}: oracle charge algebra diverges from the kernel authority"
        );
    }
}
