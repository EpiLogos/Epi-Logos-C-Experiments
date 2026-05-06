use epi_s1_hen_compiler_core::{
    compiler_invocation, is_valid_coordinate, resolve_compiler_residency,
    validate_compile_artifact_frontmatter, validate_frontmatter, ExecutorKind, HenTimestamp,
    TargetAgent,
};
use serde_yaml::Value;
use std::path::PathBuf;

#[test]
fn validates_coordinate_keys_and_canonical_metadata() {
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
    assert!(result.errors.is_empty(), "{:?}", result.errors);
}

#[test]
fn rejects_unknown_or_out_of_range_coordinate_keys() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "M2"
family: "Z"
S_8_bad: "out of range"
"#,
    )
    .unwrap();

    let result = validate_frontmatter(&yaml);
    assert!(result.errors.iter().any(|error| error.contains("family")));
    assert!(result.errors.iter().any(|error| error.contains("S_8_bad")));
}

#[test]
fn legacy_bimba_coordinate_is_warning_not_authority() {
    let yaml: Value = serde_yaml::from_str(
        r#"
bimbaCoordinate: "M2"
ql_position: 255
coordinate: "M2"
"#,
    )
    .unwrap();

    let result = validate_frontmatter(&yaml);
    assert!(result.errors.is_empty(), "{:?}", result.errors);
    assert!(result
        .warnings
        .iter()
        .any(|warning| warning.contains("bimbaCoordinate")));
    assert!(result
        .warnings
        .iter()
        .any(|warning| warning.contains("ql_position")));
}

#[test]
fn thought_artifacts_require_temporal_identity_and_thought_type() {
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
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("session_id")));
    assert!(result.errors.iter().any(|error| error.contains("day_id")));
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("thought_type")));
}

#[test]
fn l_alignment_entries_validate_mode_index_and_klein_square() {
    let valid: Value = serde_yaml::from_str(
        r#"
coordinate: "S1"
l_alignments:
  - lens: "L2"
    lens_index: 2
    mode: "day"
    weight: 0.8
    klein_square: ["L2", "L3", "L2'", "L3'"]
"#,
    )
    .unwrap();
    assert!(validate_frontmatter(&valid).errors.is_empty());

    let invalid: Value = serde_yaml::from_str(
        r#"
coordinate: "S1"
l_alignments:
  - lens: "L2"
    lens_index: 2
    mode: "night"
    klein_square: ["L1", "L4"]
"#,
    )
    .unwrap();
    let result = validate_frontmatter(&invalid);
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("day-mode lens")));
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("klein_square") && error.contains("4-element")));
}

#[test]
fn coordinate_parser_matches_current_s_coordinate_domain() {
    assert!(is_valid_coordinate("S5'"));
    assert!(is_valid_coordinate("CF_MOBIUS"));
    assert!(is_valid_coordinate("CPF"));
    assert!(is_valid_coordinate("#"));
    assert!(is_valid_coordinate("#5"));
    assert!(!is_valid_coordinate("#6"));
    assert!(!is_valid_coordinate("X0"));
}

#[test]
fn compiled_artifact_frontmatter_must_match_residency_and_invocation() {
    let vault_root = PathBuf::from("/vault/Idea");
    let residency = resolve_compiler_residency(
        vault_root,
        PathBuf::from("/repo/Body/S/S1/hen-compiler"),
        HenTimestamp::new(2026, 4, 25, 10, 30, 5),
        "T5".to_owned(),
        "improvement-hypothesis".to_owned(),
    )
    .expect("residency");
    let invocation = compiler_invocation(ExecutorKind::PiAgent, TargetAgent::Epii, None, true);
    let source_ref = residency.source_path.display().to_string();

    let valid: Value = serde_yaml::from_str(&format!(
        r#"
coordinate: "T5"
family: "T"
artifact_role: "thought"
day_id: "25-04-2026"
session_id: "session-1"
thought_type: "improvement"
source_coordinate: "S5'"
invocation_kind: "pi_agent"
provenance_refs:
  - "{source_ref}"
"#
    ))
    .unwrap();
    assert!(
        validate_compile_artifact_frontmatter(&valid, &residency, &invocation)
            .errors
            .is_empty()
    );

    let invalid: Value = serde_yaml::from_str(
        r#"
coordinate: "T4"
family: "T"
artifact_role: "thought"
day_id: "24-04-2026"
session_id: "session-1"
thought_type: "improvement"
invocation_kind: "vendor_claude_sdk"
provenance_refs:
  - "/wrong/source.md"
"#,
    )
    .unwrap();
    let result = validate_compile_artifact_frontmatter(&invalid, &residency, &invocation);
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("compiled coordinate")));
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("compiled day_id")));
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("invocation_kind")));
    assert!(result
        .errors
        .iter()
        .any(|error| error.contains("provenance_refs")));
}
