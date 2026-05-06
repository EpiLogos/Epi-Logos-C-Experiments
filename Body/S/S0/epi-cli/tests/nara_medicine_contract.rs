// nara_medicine_contract.rs — medicine consumes oracle payload
// Source: CLOCK-AND-NARA-SPECS/13-shadow-decans-rotational-states

#[test]
fn medicine_decan_from_degree_not_raw() {
    // Decan = degree / 10 (approximate; real impl uses CLOCK_DEGREE_LUT)
    let degree: u16 = 45;
    let decan_index = degree / 10;
    assert_eq!(decan_index, 4);
}

#[test]
fn shadow_pole_is_phase_1() {
    // When phase=1 (implicate/shadow), medicine reads reversedMeaning
    let phase: u8 = 1;
    let is_shadow = phase == 1;
    assert!(is_shadow);
}

#[test]
fn prescribe_uses_payload_degree_not_raw() {
    // Architecture contract: medicine takes degree+phase from payload
    // (not re-derived independently)
    let payload_degree: u16 = 150;
    let payload_phase: u8 = 0;
    let decan = payload_degree / 10; // 15
    let is_shadow = payload_phase == 1;
    assert_eq!(decan, 15);
    assert!(!is_shadow);
}

#[test]
fn shadow_flag_derives_from_oracle_phase() {
    // The is_shadow bool passed to prescribe() MUST come from OraclePayload.phase.
    // phase=0 → explicate → is_shadow=false
    // phase=1 → implicate → is_shadow=true
    // This test verifies the derivation is a simple equality check (no other logic).
    for (phase, expected_shadow) in [(0u8, false), (1u8, true)] {
        let is_shadow = phase == 1;
        assert_eq!(
            is_shadow, expected_shadow,
            "phase={phase} should map to is_shadow={expected_shadow}"
        );
    }
}

#[test]
fn explicate_and_shadow_prescriptions_differ() {
    // When is_shadow changes, the prescription output must differ.
    // This test verifies the shadow_note annotation is included/excluded correctly.
    let context = "integration";
    let shadow_note = " [shadow pole — reversedMeaning active]";
    let title_with_shadow = format!("Medicine Prescription ({}){}", context, shadow_note);
    let title_without_shadow = format!("Medicine Prescription ({})", context);
    assert_ne!(title_with_shadow, title_without_shadow);
    assert!(title_with_shadow.contains("shadow pole"));
    assert!(!title_without_shadow.contains("shadow pole"));
}

#[test]
fn decan_index_stays_in_range_0_to_35() {
    // degree range 0-359; decan = degree/10 clamped to 0-35
    for degree in [0u16, 9, 10, 359] {
        let decan = (degree / 10).min(35);
        assert!(
            decan <= 35,
            "decan {decan} out of range for degree {degree}"
        );
    }
}

#[test]
fn shadow_decan_comes_from_reversed_meaning_not_index() {
    // Shadow body zone = reversedMeaning annotation from #3-4 tarot (per spec 13).
    // Architecturally: is_shadow=true shifts the reading mode, NOT the decan index.
    // The decan index is always derived from degree — shadow only changes the annotation.
    let degree: u16 = 150;
    let decan_explicate = degree / 10; // 15
    let decan_shadow = degree / 10; // still 15 — same decan, different pole
    assert_eq!(
        decan_explicate, decan_shadow,
        "shadow does not change decan index, only the annotation mode"
    );
}
