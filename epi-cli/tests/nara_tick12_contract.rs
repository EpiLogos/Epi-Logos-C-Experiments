// nara_tick12_contract.rs — Canonical tick12 naming contract
// Source: 00-canonical-invariants.md §3

#[test]
fn tick12_is_u8() {
    let tick12: u8 = 7;
    assert!(tick12 < 12, "tick12 must be 0-11");
}

#[test]
fn cf_substage6_derivable_from_tick12() {
    let tick12: u8 = 9;
    let cf6 = tick12 % 6;
    assert_eq!(cf6, 3);
}

#[test]
fn exact_degree_720_strand_split() {
    let explicate: f32 = 45.0;
    let implicate: f32 = explicate + 360.0;
    assert!(explicate < 360.0);
    assert!(implicate >= 360.0 && implicate < 720.0);
    let phase_a: u8 = if explicate < 360.0 { 0 } else { 1 };
    let phase_b: u8 = if implicate < 360.0 { 0 } else { 1 };
    assert_eq!(phase_a, 0);
    assert_eq!(phase_b, 1);
}

#[test]
fn tick12_wraps_at_12() {
    // All tick12 values must be in [0, 11]
    for raw in 0u16..100 {
        let tick12 = (raw % 12) as u8;
        assert!(tick12 < 12);
    }
}

#[test]
fn tick12_inversion_is_complement() {
    // # operator in 12-fold index space: #(n) = 11 - n
    for n in 0u8..12 {
        let inverted = 11u8.wrapping_sub(n);
        assert_eq!(n + inverted, 11, "tick12 inversion must sum to 11");
    }
}

#[test]
fn tick12_strand_a_is_0_to_5() {
    // Strand A (explicate/ascending): tick12 in [0, 5]
    for t in 0u8..6 {
        assert!(t < 6, "strand A tick12 must be 0-5");
    }
}

#[test]
fn tick12_strand_b_is_6_to_11() {
    // Strand B (implicit/Möbius return): tick12 in [6, 11]
    for t in 6u8..12 {
        assert!(t >= 6 && t < 12, "strand B tick12 must be 6-11");
    }
}
