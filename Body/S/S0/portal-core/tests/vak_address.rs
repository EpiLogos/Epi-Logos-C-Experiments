use portal_core::vak_address::{CfPosition, CsDirection, CpfState, CsField, VakAddress, canonical_cf_position};

#[test]
fn canonical_positions_match_grammar() {
    assert_eq!(canonical_cf_position("(00/00)"), Some(CfPosition::Inner0));
    assert_eq!(canonical_cf_position("(0/1)"), Some(CfPosition::Inner1));
    assert_eq!(canonical_cf_position("(0/1/2)"), Some(CfPosition::Inner2));
    assert_eq!(canonical_cf_position("(0/1/2/3)"), Some(CfPosition::Inner3));
    assert_eq!(canonical_cf_position("(4/5/0)"), Some(CfPosition::Inner4));
    assert_eq!(canonical_cf_position("(5/0)"), Some(CfPosition::Inner5));
    assert_eq!(canonical_cf_position("(4.0/1-4.4/5)"), Some(CfPosition::Outer4Parent));
    assert_eq!(canonical_cf_position("(4.5/0)"), Some(CfPosition::LemniscateStage5));
    assert_eq!(canonical_cf_position("(unknown)"), None);
}

#[test]
fn vak_address_roundtrips_through_serde() {
    let addr = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Day,
        },
    };
    let json = serde_json::to_string(&addr).unwrap();
    let back: VakAddress = serde_json::from_str(&json).unwrap();
    assert_eq!(back, addr);
}

#[test]
fn cs_direction_night_serialises_with_prime() {
    let addr = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT5".into()],
        cp: "CP4.5".into(),
        cf: "(5/0)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS5".into(),
            direction: CsDirection::Night,
        },
    };
    let json = serde_json::to_string(&addr).unwrap();
    // The cross-repo TS contract uses "Night'" (with prime) — Rust serde rename must match.
    assert!(json.contains("\"Night'\""), "expected primed Night' in JSON, got: {}", json);
}

#[test]
fn cpf_polarity_serialises_as_canonical_literal() {
    let addr = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["CT0".into()],
        cp: "CP4.0".into(),
        cf: "(00/00)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Day,
        },
    };
    let json = serde_json::to_string(&addr).unwrap();
    // CPF in TS uses parenthesised polarities — Rust enum must serialise as same literals.
    assert!(json.contains("\"(00/00)\""), "expected (00/00) literal in JSON, got: {}", json);
}

#[test]
fn vak_address_json_shape_matches_typescript_contract() {
    // Cross-repo contract: TS VakAddress at /Users/admin/Documents/Epi-Logos/
    // .pi/extensions/s_i/modules/ql_types/index.ts (commit d38b32ca) serialises
    // with nested cs: { code, direction }. Rust mirror MUST emit identical shape.
    let addr = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["CT0".into()],
        cp: "CP4.0".into(),
        cf: "(00/00)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Night,
        },
    };
    let value: serde_json::Value = serde_json::to_value(&addr).unwrap();

    // No top-level cs_code / cs_direction keys (the bug we're fixing).
    assert!(value.get("cs_code").is_none(), "must not flatten cs_code to top level");
    assert!(value.get("cs_direction").is_none(), "must not flatten cs_direction to top level");

    // cs is a nested object with code + direction.
    let cs = value.get("cs").expect("cs field required at top level");
    assert!(cs.is_object(), "cs must be an object");
    assert_eq!(cs.get("code"), Some(&serde_json::json!("CS1")));
    assert_eq!(cs.get("direction"), Some(&serde_json::json!("Night'")));

    // Other top-level keys still present.
    for key in &["cpf", "ct", "cp", "cf", "cfp"] {
        assert!(value.get(*key).is_some(), "missing top-level key {}", key);
    }
}
