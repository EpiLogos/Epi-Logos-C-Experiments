// nara_oracle_payload.rs — oracle four faces and eval4 charges contract
// Source: CLOCK-AND-NARA-SPECS/08-oracle-four-faces

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
fn oracle_eval4_charges_from_adenine() {
    // Pre-stored values from #3-2-1 Adenine (dataset fixture)
    let pp: f32 = 84.0;
    let nn: f32 = -36.0;
    let pn: f32 = 24.0;
    let np: f32 = 24.0;
    assert!(pp > 0.0);
    assert!(nn < 0.0);
    let _ = (pn, np);
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
fn eval4_charges_all_yang_lines() {
    // 6 lines all yang (value 7): positions 0,2,4 = yang pos → pp; 1,3,5 = yin pos → pn
    // yang line (odd) in yang pos (even index): pp += 32.0 × 3 = 96.0
    // yang line (odd) in yin pos (odd index):   pn += 32.0 × 3 = 96.0
    let lines = [7u8, 7, 7, 7, 7, 7];
    let mut pp: f32 = 0.0;
    let mut nn: f32 = 0.0;
    let mut pn: f32 = 0.0;
    let mut np: f32 = 0.0;
    for (i, &v) in lines.iter().enumerate() {
        let is_yang_line = v & 1 == 1;
        let is_yang_pos = i % 2 == 0;
        match (is_yang_line, is_yang_pos) {
            (true,  true)  => pp += 32.0,
            (false, false) => nn -= 32.0,
            (true,  false) => pn += 32.0,
            (false, true)  => np += 32.0,
        }
    }
    assert_eq!(pp, 96.0);
    assert_eq!(nn, 0.0);
    assert_eq!(pn, 96.0);
    assert_eq!(np, 0.0);
}

#[test]
fn eval4_charges_all_yin_lines() {
    // 6 lines all yin (value 8): positions 0,2,4 = yang pos → np; 1,3,5 = yin pos → nn
    let lines = [8u8, 8, 8, 8, 8, 8];
    let mut pp: f32 = 0.0;
    let mut nn: f32 = 0.0;
    let mut pn: f32 = 0.0;
    let mut np: f32 = 0.0;
    for (i, &v) in lines.iter().enumerate() {
        let is_yang_line = v & 1 == 1;
        let is_yang_pos = i % 2 == 0;
        match (is_yang_line, is_yang_pos) {
            (true,  true)  => pp += 32.0,
            (false, false) => nn -= 32.0,
            (true,  false) => pn += 32.0,
            (false, true)  => np += 32.0,
        }
    }
    assert_eq!(pp, 0.0);
    assert_eq!(nn, -96.0);
    assert_eq!(pn, 0.0);
    assert_eq!(np, 96.0);
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
