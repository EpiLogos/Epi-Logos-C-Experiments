use epi_logos::vault::frontmatter::{is_valid_coordinate, validate_frontmatter};
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
bimbaCoordinate: "C0"
ql_position: 0
family: "C"
C_0_bimba: "ground"
"#,
    )
    .unwrap();
    let errors = validate_frontmatter(&yaml);
    assert!(errors.is_empty(), "Expected no errors, got: {:?}", errors);
}

#[test]
fn integration_validate_frontmatter_errors() {
    let yaml: Value = serde_yaml::from_str(
        r#"
bimbaCoordinate: "BOGUS"
ql_position: 42
family: "Z"
S_8_bad: "out of range"
"#,
    )
    .unwrap();
    let errors = validate_frontmatter(&yaml);
    assert!(
        errors.iter().any(|e| e.contains("bimbaCoordinate")),
        "Should flag bad bimbaCoordinate"
    );
    assert!(
        errors.iter().any(|e| e.contains("ql_position")),
        "Should flag bad ql_position"
    );
    assert!(
        errors.iter().any(|e| e.contains("family")),
        "Should flag bad family"
    );
    assert!(
        errors.iter().any(|e| e.contains("S_8_bad")),
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
    let errors = validate_frontmatter(&yaml);
    assert!(
        errors.is_empty(),
        "ql_position 255 (NONE) should be valid, got: {:?}",
        errors
    );
}

#[test]
fn integration_validate_frontmatter_not_a_mapping() {
    let yaml: Value = serde_yaml::from_str("42").unwrap();
    let errors = validate_frontmatter(&yaml);
    assert!(
        errors.iter().any(|e| e.contains("not a YAML mapping")),
        "Should flag non-mapping YAML"
    );
}
