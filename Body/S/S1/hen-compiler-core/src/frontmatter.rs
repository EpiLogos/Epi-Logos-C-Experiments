use serde_yaml::{Mapping, Value};

use crate::compile_plan::CompilerInvocation;
use crate::coordinate::{
    is_coordinate_key, is_valid_coordinate, validate_coordinate_key, FAMILIES,
};
use crate::l_alignments::validate_l_alignments;
use crate::residency::CompilerResidencyPlan;

#[derive(Debug, Default, Eq, PartialEq)]
pub struct ValidationResult {
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}
const CANONICAL_METADATA_KEYS: &[&str] = &[
    "coordinate",
    "family",
    "artifact_role",
    "aletheia_verifies",
    "ctx_type",
    "invocation_profile",
    "source_coordinate",
    "parent_day_id",
    "now_id",
    "day_id",
    "session_id",
    "parent_session_id",
    "created_at",
    "updated_at",
    "merged_at",
    "merge_reason",
    "provenance_refs",
    "invocation_kind",
    "thought_type",
    "l_alignments",
];
const DEPRECATED_PATTERNS: &[&str] = &["bimbaCoordinate", "ql_position"];
pub fn validate_frontmatter(yaml: &Value) -> ValidationResult {
    let mut result = ValidationResult::default();

    let map = match yaml.as_mapping() {
        Some(map) => map,
        None => {
            result
                .errors
                .push("Frontmatter is not a YAML mapping".to_owned());
            return result;
        }
    };

    validate_identity(map, &mut result);
    validate_keys(map, &mut result);
    validate_temporal_requirements(map, &mut result.errors);

    result
}

pub fn validate_compile_artifact_frontmatter(
    yaml: &Value,
    residency: &CompilerResidencyPlan,
    invocation: &CompilerInvocation,
) -> ValidationResult {
    let mut result = validate_frontmatter(yaml);
    let Some(map) = yaml.as_mapping() else {
        return result;
    };

    require_string_value(
        map,
        &mut result.errors,
        "artifact_role",
        "thought",
        "compiled artifact_role",
    );
    require_string_value(
        map,
        &mut result.errors,
        "coordinate",
        &residency.thought_lane,
        "compiled coordinate",
    );
    require_string_value(map, &mut result.errors, "family", "T", "compiled family");
    require_string_value(
        map,
        &mut result.errors,
        "day_id",
        &residency.day_id,
        "compiled day_id",
    );
    require_string_value(
        map,
        &mut result.errors,
        "invocation_kind",
        crate::compile_plan::executor_kind_name(invocation.executor_kind),
        "invocation_kind",
    );

    validate_compiled_provenance(map, residency, &mut result.errors);

    result
}
fn validate_identity(map: &Mapping, result: &mut ValidationResult) {
    if let Some(value) = map.get(Value::String("coordinate".to_owned())) {
        match value.as_str() {
            Some(coord) if is_valid_coordinate(coord) => {}
            Some(coord) => result.errors.push(format!("Invalid coordinate: '{coord}'")),
            None => result.errors.push("coordinate must be a string".to_owned()),
        }
    }

    if let Some(value) = map.get(Value::String("bimbaCoordinate".to_owned())) {
        match value.as_str() {
            Some(coord) if is_valid_coordinate(coord) => {}
            Some(coord) => result
                .errors
                .push(format!("Invalid bimbaCoordinate: '{coord}'")),
            None => result
                .errors
                .push("bimbaCoordinate must be a string".to_owned()),
        }
    }

    if let Some(value) = map.get(Value::String("family".to_owned())) {
        match value.as_str() {
            Some(family) if FAMILIES.contains(&family) || family == "NONE" => {}
            Some(family) => result.errors.push(format!(
                "Invalid family '{family}', expected one of: C, P, L, S, T, M, NONE"
            )),
            None => result.errors.push("family must be a string".to_owned()),
        }
    }
}

fn validate_keys(map: &Mapping, result: &mut ValidationResult) {
    for (key, value) in map {
        let Some(key_str) = key.as_str() else {
            result
                .errors
                .push("Frontmatter keys must be strings".to_owned());
            continue;
        };

        if is_deprecated_key(key_str) {
            result
                .warnings
                .push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        if key_str == "l_alignments" {
            validate_l_alignments(value, result);
            continue;
        }

        if is_coordinate_key(key_str) {
            if let Some(error) = validate_coordinate_key(key_str, value) {
                result.errors.push(error);
            }
            continue;
        }

        if CANONICAL_METADATA_KEYS.contains(&key_str) {
            continue;
        }

        if key_str.starts_with("pos_") || key_str.starts_with("pos") {
            result
                .warnings
                .push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        result
            .errors
            .push(format!("Unknown frontmatter key '{key_str}'"));
    }
}

fn validate_temporal_requirements(map: &Mapping, errors: &mut Vec<String>) {
    let artifact_role = map
        .get(Value::String("artifact_role".to_owned()))
        .and_then(Value::as_str);

    if matches!(artifact_role, Some("now") | Some("thought")) {
        for required in ["session_id", "day_id"] {
            if !map.contains_key(Value::String(required.to_owned())) {
                errors.push(format!("Missing required temporal key '{required}'"));
            }
        }
    }

    if artifact_role == Some("thought")
        && !map.contains_key(Value::String("thought_type".to_owned()))
    {
        errors.push("Missing required thought_type for thought artifact".to_owned());
    }
}

fn require_string_value(
    map: &Mapping,
    errors: &mut Vec<String>,
    key: &str,
    expected: &str,
    label: &str,
) {
    match map
        .get(Value::String(key.to_owned()))
        .and_then(Value::as_str)
    {
        Some(actual) if actual == expected => {}
        Some(actual) => errors.push(format!("{label} must be '{expected}', got '{actual}'")),
        None => errors.push(format!("{label} must be '{expected}'")),
    }
}

fn validate_compiled_provenance(
    map: &Mapping,
    residency: &CompilerResidencyPlan,
    errors: &mut Vec<String>,
) {
    let expected = residency.source_path.display().to_string();
    let Some(value) = map.get(Value::String("provenance_refs".to_owned())) else {
        errors.push(format!(
            "provenance_refs must include compiler source path '{}'",
            expected
        ));
        return;
    };

    let Some(entries) = value.as_sequence() else {
        errors.push("provenance_refs must be a sequence of strings".to_owned());
        return;
    };

    let has_source = entries
        .iter()
        .filter_map(Value::as_str)
        .any(|entry| entry == expected);
    if !has_source {
        errors.push(format!(
            "provenance_refs must include compiler source path '{}'",
            expected
        ));
    }
}

fn is_deprecated_key(key: &str) -> bool {
    DEPRECATED_PATTERNS.contains(&key) || key.starts_with("pos_")
}
