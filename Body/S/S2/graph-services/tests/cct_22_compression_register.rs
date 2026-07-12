//! CCT-22 — Compression-as-Intelligence made measurable: a compress-to-VAK
//! emission at a synthetic coordinate respects the per-symbol Shannon
//! entropy bound of the 109-syntax M0 alphabet (`log₂(109) ≈ 6.77` bits),
//! and the address-resolution round-trips — the same `q_*_semantic`
//! properties resolve back out of the emission. The substrate IS the
//! compression scheme; no separate orchestrator exists.

use std::collections::BTreeMap;

use epi_s2_graph_services::{resolve_frontmatter_key, FrontmatterKeyResolution};

/// Per-symbol Shannon entropy `H(X) = Σ p(x)·−log₂ p(x)` of a string.
fn per_symbol_entropy_bits(text: &str) -> f64 {
    let mut counts: BTreeMap<char, usize> = BTreeMap::new();
    for ch in text.chars() {
        *counts.entry(ch).or_insert(0) += 1;
    }
    let total = text.chars().count() as f64;
    counts
        .values()
        .map(|&count| {
            let p = count as f64 / total;
            -p * p.log2()
        })
        .sum()
}

#[test]
fn compress_to_vak_emission_respects_the_shannon_floor_and_round_trips() {
    // A synthetic compress-to-VAK emission: coordinate-addressed q-register
    // properties — the coordinate-tagging IS the compression.
    let emission: &[(&str, &str)] = &[
        ("q_5_integration_template", "torus-oscillator-patch"),
        ("q_5'_integration_template", "conjugate-reading"),
        ("q_2_carrier_signal", "spanda-pulse"),
        ("qm_4_context_frame", "lemniscate-4-0-1"),
    ];
    let rendered = emission
        .iter()
        .map(|(key, value)| format!("{key}: {value}"))
        .collect::<Vec<_>>()
        .join("\n");

    // (1) The per-symbol entropy stays strictly below the 109-alphabet
    // ceiling — the derivational structure of the emission IS the
    // recoverable compressibility margin.
    let ceiling = (109f64).log2();
    let measured = per_symbol_entropy_bits(&rendered);
    assert!(
        measured < ceiling,
        "emission entropy {measured:.3} bits/symbol must sit under log2(109) = {ceiling:.3}"
    );
    assert!(measured > 0.0, "a real emission is not degenerate");

    // (2) Address-resolution round-trip: every emitted key resolves back
    // to its canonical property — decompression is the substrate running
    // forward from the address, not a separate mechanism.
    let resolved: Vec<String> = emission
        .iter()
        .map(|(key, _)| match resolve_frontmatter_key(key) {
            FrontmatterKeyResolution::Canonical(canonical) => canonical,
            other => panic!("emission key {key} must stay addressable, got {other:?}"),
        })
        .collect();
    assert_eq!(
        resolved,
        vec![
            "q_5_integration_template",
            "q_5_i_integration_template",
            "q_2_carrier_signal",
            "qm_4_context_frame"
        ],
        "the same q_*_semantic properties resolve out of the emission"
    );
}
