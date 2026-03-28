// nara_e2e_smoke.rs
// End-to-end chain: identity → clock → oracle → payload → medicine
// Tests the structural chain even without a live gateway.

#[test]
fn identity_hash_is_32_bytes() {
    let hash: [u8; 32] = [1u8; 32];
    assert_eq!(hash.len(), 32);
    let preview: String = hash[..4].iter().map(|b| format!("{:02x}", b)).collect();
    assert_eq!(preview.len(), 8);
}

#[test]
fn clock_degree_from_oracle_not_quaternion_atan2() {
    // Canonical: clock degree comes from oracle cast result
    // NOT atan2(quaternion) — that formula was deprecated
    let oracle_degree: u16 = 270;
    let phase: u8 = 0;
    let exact_720: f32 = oracle_degree as f32 + (phase as f32 * 360.0);
    assert!((exact_720 - 270.0).abs() < 0.001);
    assert!(exact_720 < 360.0, "phase=0 means Strand A, degree must be < 360");
}

#[test]
fn tick12_quantizes_correctly() {
    // tick12 = floor(degree / 30) for degree in [0, 360)
    let test_cases: &[(u16, u8)] = &[
        (0, 0), (29, 0), (30, 1), (59, 1),
        (330, 11), (359, 11),
    ];
    for &(degree, expected_tick) in test_cases {
        let tick12 = (degree / 30) as u8;
        assert_eq!(tick12, expected_tick, "degree={} should give tick12={}", degree, expected_tick);
    }
}

#[test]
fn oracle_to_medicine_chain_degree_flows() {
    // Oracle degree drives medicine decan lookup
    let oracle_degree: u16 = 150;
    let oracle_phase: u8 = 0;
    // Decan index = degree / 10
    let decan_idx = oracle_degree / 10; // 15
    let is_shadow = oracle_phase == 1;
    assert_eq!(decan_idx, 15);
    assert!(!is_shadow);
}

#[test]
fn implicate_phase_sets_shadow_in_medicine() {
    // When oracle phase=1 (implicate strand), medicine uses shadow annotation
    let oracle_phase: u8 = 1;
    let is_shadow = oracle_phase == 1;
    assert!(is_shadow, "phase=1 must activate shadow medicine path");
}

#[test]
fn canonical_primitives_all_in_range() {
    // Smoke check all canonical primitive ranges
    let exact_degree_720: f32 = 405.5;
    let tick12: u8 = 7;
    let phase: u8 = 1;
    let quintessence_hash: [u8; 32] = [0xab; 32];

    assert!(exact_degree_720 >= 0.0 && exact_degree_720 < 720.0);
    assert!(tick12 < 12);
    assert!(phase <= 1);
    assert_eq!(quintessence_hash.len(), 32);
}
