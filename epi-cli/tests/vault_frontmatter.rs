use epi_logos::vault::frontmatter::{is_valid_coordinate, validate_frontmatter, ValidationResult};
use serde_yaml::Value;

#[test]
fn integration_valid_family_coordinates() {
    let families = ["C", "P", "L", "S", "T", "M"];
    for fam in &families {
        for pos in 0..=5u8 {
            let coord = format!("{}{}", fam, pos);
            assert!(
                is_valid_coordinate(&coord),
                "{} should be a valid coordinate",
                coord
            );
            let inverted = format!("{}{}'", fam, pos);
            assert!(
                is_valid_coordinate(&inverted),
                "{} should be a valid inverted coordinate",
                inverted
            );
        }
    }
}

#[test]
fn integration_valid_special_coordinates() {
    // Hash and psychoids
    assert!(is_valid_coordinate("#"));
    for i in 0..=5 {
        assert!(is_valid_coordinate(&format!("#{}", i)));
    }

    // Context frames
    let cfs = [
        "CF_VOID",
        "CF_BINARY",
        "CF_TRIKA",
        "CF_QUATERNAL",
        "CF_FRACTAL",
        "CF_SYNTHESIS",
        "CF_MOBIUS",
    ];
    for cf in &cfs {
        assert!(is_valid_coordinate(cf));
    }

    // VAK
    let vaks = ["CPF", "CT", "CP", "CF", "CFP", "CS"];
    for v in &vaks {
        assert!(is_valid_coordinate(v));
    }

    // Weaves
    assert!(is_valid_coordinate("Weave_0_0"));
    assert!(is_valid_coordinate("Weave_5_5"));
}

#[test]
fn integration_invalid_coordinates() {
    assert!(!is_valid_coordinate(""));
    assert!(!is_valid_coordinate("#6"));
    assert!(!is_valid_coordinate("X0"));
    assert!(!is_valid_coordinate("C9"));
    assert!(!is_valid_coordinate("CF_WRONG"));
    assert!(!is_valid_coordinate("random_string"));
}

#[test]
fn integration_validate_frontmatter_clean() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "C0"
family: "C"
artifact_role: "seed"
c_0_links_to: "[[Bimba/Seeds/C/C0]]"
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&yaml);
    assert!(
        result.errors.is_empty(),
        "Expected no errors, got: {:?}",
        result.errors
    );
}

#[test]
fn integration_validate_frontmatter_errors() {
    let yaml: Value = serde_yaml::from_str(
        r#"
bimbaCoordinate: "BOGUS"
ql_position: 42
coordinate: "M2"
family: "Z"
S_8_bad: "out of range"
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&yaml);
    // bimbaCoordinate is deprecated — should be a warning
    assert!(
        result
            .warnings
            .iter()
            .any(|w| w.contains("bimbaCoordinate")),
        "Should warn about deprecated bimbaCoordinate, got warnings: {:?}",
        result.warnings
    );
    assert!(
        result.warnings.iter().any(|w| w.contains("ql_position")),
        "Should warn about deprecated ql_position"
    );
    // coordinate is now canonical — should NOT be flagged
    assert!(
        !result
            .errors
            .iter()
            .any(|e| e.contains("coordinate") && e.contains("deprecated")),
        "coordinate is canonical, should not be deprecated"
    );
    assert!(
        result.errors.iter().any(|e| e.contains("family")),
        "Should flag bad family"
    );
    assert!(
        result.errors.iter().any(|e| e.contains("S_8_bad")),
        "Should flag coordinate key with position > 5"
    );
}

#[test]
fn integration_validate_frontmatter_ql_255_valid() {
    let yaml: Value = serde_yaml::from_str(
        r#"
ql_position: 255
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&yaml);
    assert!(
        result.warnings.iter().any(|w| w.contains("ql_position")),
        "ql_position should be flagged as deprecated warning, got: {:?}",
        result.warnings
    );
}

#[test]
fn integration_validate_frontmatter_not_a_mapping() {
    let yaml: Value = serde_yaml::from_str("42").unwrap();
    let result = validate_frontmatter(&yaml);
    assert!(
        result
            .errors
            .iter()
            .any(|e| e.contains("not a YAML mapping")),
        "Should flag non-mapping YAML"
    );
}

#[test]
fn integration_validate_temporal_and_thought_invariants() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "T4"
family: "T"
artifact_role: "thought"
t_4_kairos_context: "[[Kairos]]"
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&yaml);
    assert!(result.errors.iter().any(|e| e.contains("session_id")));
    assert!(result.errors.iter().any(|e| e.contains("day_id")));
    assert!(result.errors.iter().any(|e| e.contains("thought_type")));
}

#[test]
fn coordinate_field_is_canonical_not_deprecated() {
    // `coordinate` is the canonical node identifier per Hen CONTRACT
    assert!(is_valid_coordinate("M2"));
    // validate_frontmatter should ACCEPT `coordinate:` field
    let mut fm = serde_yaml::Mapping::new();
    fm.insert(
        serde_yaml::Value::String("coordinate".into()),
        serde_yaml::Value::String("M2".into()),
    );
    let result = validate_frontmatter(&serde_yaml::Value::Mapping(fm));
    // `coordinate` must not appear in errors or warnings as deprecated
    assert!(
        !result
            .errors
            .iter()
            .any(|e| e.contains("coordinate") && e.contains("deprecated")),
        "coordinate should be canonical, not deprecated"
    );
    assert!(
        !result.warnings.iter().any(|w| w.contains("coordinate")),
        "coordinate should not trigger any warning"
    );
}

#[test]
fn bimba_coordinate_field_is_deprecated() {
    let mut fm = serde_yaml::Mapping::new();
    fm.insert(
        serde_yaml::Value::String("bimbaCoordinate".into()),
        serde_yaml::Value::String("M2".into()),
    );
    let result = validate_frontmatter(&serde_yaml::Value::Mapping(fm));
    assert!(
        result
            .warnings
            .iter()
            .any(|w| w.contains("bimbaCoordinate")),
        "bimbaCoordinate should be deprecated warning, got: {:?}",
        result.warnings
    );
}

#[test]
fn integration_validate_frontmatter_accepts_q_metadata_keys() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "M5"
family: "M"
artifact_role: "thought"
session_id: "20260310-090807-abc123"
day_id: "10-03-2026"
thought_type: "T5"
q_essence: "Self-knowing"
q_correspondence: "M5 harmonises S5"
q_vimarsa_field: "Reflective dossier"
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&yaml);
    assert!(
        result.errors.is_empty(),
        "Expected q_* metadata to validate cleanly, got: {:?}",
        result.errors
    );
}
