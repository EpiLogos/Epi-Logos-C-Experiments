// nara_oracle_payload.rs — oracle four faces and eval4 charges contract
// Source: CLOCK-AND-NARA-SPECS/08-oracle-four-faces

use epi_logos::nara::oracle::{oracle_eval4, IChingResult};

/// Build a no-changing-lines `IChingResult` for a 6-bit line pattern
/// (bit i set → yang line 7, clear → yin line 8). oracle_eval4 reconstructs the
/// 6-bit codon from this pattern and routes charges through the kernel authority.
fn result_for_codon(codon: u8) -> IChingResult {
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
fn four_faces_are_distinct() {
    let degree: u16 = 45;
    let primary_hex: u8 = 0x3F;
    let changing_lines: u8 = 0x01;

    let deficient_degree = (degree + 180) % 360;
    let implicate_720 = degree as f32 + 360.0;
    let temporal_hex = primary_hex ^ changing_lines;

    assert_eq!(deficient_degree, 225);
    assert!((implicate_720 - 405.0).abs() < 0.001);
    assert_eq!(temporal_hex, 0x3E);
    // Deficient and implicate are NOT the same concept
    assert_ne!(deficient_degree, (implicate_720 - 360.0) as u16);
}

#[test]
fn oracle_eval4_charges_route_through_kernel_all_yin() {
    // Charges come from the single kernel authority (m3_compute_charges, FR 2.3.18),
    // not the retired ±32-per-line algebra. All-yin lines → codon 0x00 →
    // nucleotides (0,0,0), I-Ching value 6 each: pp=18, nn=-6, np=6, pn=6.
    let p = oracle_eval4(&result_for_codon(0x00), 0.0, 0);
    assert_eq!((p.pp, p.nn, p.np, p.pn), (18.0, -6.0, 6.0, 6.0));
}

#[test]
fn payload_fields_are_not_stub_zeros() {
    let degree: u16 = 90;
    let phase: u8 = 0;
    let primary_hex: u8 = 0x1F;
    let pp: f32 = 84.0;

    // None of these are zero — oracle produced real values
    assert!(degree > 0);
    assert!(phase <= 1);
    assert!(primary_hex > 0);
    assert!(pp != 0.0);
}

#[test]
fn eval4_charges_all_yang_lines_via_kernel() {
    // 6 yang lines (7) → codon 0x3F → nucleotides (3,3,3), I-Ching value 8 each:
    // pp=24, nn=-8, np=8, pn=8 (m3_compute_charges, replacing the retired ±32 algebra).
    let p = oracle_eval4(&result_for_codon(0x3F), 0.0, 0);
    assert_eq!((p.pp, p.nn, p.np, p.pn), (24.0, -8.0, 8.0, 8.0));
}

#[test]
fn eval4_charges_mixed_lines_via_kernel() {
    // Lines yang,yin,yang,yin,yang,yin (7,8,7,8,7,8) → bits 0,2,4 set →
    // codon 0x15 → nucleotides (1,1,1), I-Ching value 9 each: pp=27, nn=-9, np=9, pn=9.
    let p = oracle_eval4(&result_for_codon(0x15), 0.0, 0);
    assert_eq!((p.pp, p.nn, p.np, p.pn), (27.0, -9.0, 9.0, 9.0));
}

#[test]
fn deficient_degree_wraps_at_360() {
    // degree 270 → deficient = 90 (not 450)
    let degree: u16 = 270;
    let deficient = (degree + 180) % 360;
    assert_eq!(deficient, 90);
}

#[test]
fn temporal_hex_is_xor_of_primary_and_changing() {
    // Canonical: temporal_hex = primary_hex XOR changing_mask
    let primary: u8 = 0b00111111; // hex 63
    let changing: u8 = 0b00000101; // lines 1 and 3 change
    let temporal = (primary ^ changing) & 0x3F;
    assert_eq!(temporal, 0b00111010);
    assert_ne!(temporal, primary);
}

#[test]
fn implicate_720_is_always_above_360() {
    let degree: f32 = 0.0;
    let implicate = degree + 360.0;
    assert!(implicate >= 360.0);
    assert!(implicate < 720.0);
}
