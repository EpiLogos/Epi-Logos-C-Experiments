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

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ValidatedFrontmatterContract {
    pub ct_type: String,
    pub columns: Vec<String>,
    pub source_kind: String,
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
const INTEGER_RANGE_KEYS: &[(&str, i64, i64)] = &[
    ("c_3_fibonacci_position", 0, 59),
    ("c_3_fibonacci_digit", 0, 9),
    ("c_3_tick12", 0, 11),
    ("c_3_backbone_index", 0, 23),
    // CCT-14b entity birth-codon family: 6-bit codon + signed kernel charges.
    ("c_5_birth_codon", 0, 63),
    ("c_5_birth_pp", -128, 127),
    ("c_5_birth_nn", -128, 127),
    ("c_5_birth_np", -128, 127),
    ("c_5_birth_pn", -128, 127),
];

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

pub fn validate_frontmatter_contract(
    yaml: &Value,
) -> Result<ValidatedFrontmatterContract, ValidationResult> {
    let map = match yaml.as_mapping() {
        Some(map) => map,
        None => {
            return Err(ValidationResult {
                errors: vec!["Frontmatter contract is not a YAML mapping".to_owned()],
                warnings: Vec::new(),
            });
        }
    };

    let mut validation = ValidationResult::default();
    validate_keys_for_contract(map, &mut validation);
    let canonical_key = Value::String("c_1_ct_type".to_owned());
    let legacy_key = Value::String("ctx_type".to_owned());
    let ct_type = match map.get(&canonical_key) {
        Some(value) => match value.as_str().filter(|value| !value.trim().is_empty()) {
            Some(value) => Some(value),
            None => {
                validation
                    .errors
                    .push("Frontmatter contract c_1_ct_type must be a non-empty string".to_owned());
                None
            }
        },
        None => map
            .get(&legacy_key)
            .and_then(Value::as_str)
            .filter(|value| !value.trim().is_empty()),
    };
    if ct_type.is_none() && validation.errors.is_empty() {
        validation.errors.push(
            "Frontmatter contract requires string c_1_ct_type (ctx_type is legacy fallback)"
                .to_owned(),
        );
    }
    if !validation.errors.is_empty() {
        return Err(validation);
    }

    let columns = map
        .keys()
        .filter_map(Value::as_str)
        .map(str::to_owned)
        .collect();
    let source_kind = map
        .get(Value::String("c_4_artifact_role".to_owned()))
        .or_else(|| map.get(Value::String("artifact_role".to_owned())))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("contract")
        .to_owned();

    Ok(ValidatedFrontmatterContract {
        ct_type: ct_type.expect("validated CT type").to_owned(),
        columns,
        source_kind,
    })
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
    validate_key_names(map, result, true);
}

fn validate_keys_for_contract(map: &Mapping, result: &mut ValidationResult) {
    validate_key_names(map, result, false);
}

fn validate_key_names(map: &Mapping, result: &mut ValidationResult, validate_values: bool) {
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
            if validate_values {
                validate_l_alignments(value, result);
            }
            continue;
        }

        if let Some((_, min, max)) = INTEGER_RANGE_KEYS
            .iter()
            .find(|(registered_key, _, _)| *registered_key == key_str)
        {
            if validate_values {
                validate_integer_range_key(key_str, value, *min, *max, result);
            }
            continue;
        }

        if key_str == "c_3_klein_weighting" {
            if validate_values {
                validate_klein_weighting(value, result);
            }
            continue;
        }

        if is_coordinate_key(key_str) {
            if validate_values {
                if let Some(error) = validate_coordinate_key(key_str, value) {
                    result.errors.push(error);
                }
            }
            continue;
        }

        if is_q_vocabulary_family_key(key_str) {
            if !is_wellformed_q_vocabulary_key(key_str) {
                result.errors.push(format!(
                    "Malformed q-family frontmatter key '{key_str}' (expected q_<0-5>['][_<slot>]_<lower_snake_case>)"
                ));
            }
            continue;
        }

        if is_position_contract_key(key_str) {
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

fn validate_integer_range_key(
    key: &str,
    value: &Value,
    min: i64,
    max: i64,
    result: &mut ValidationResult,
) {
    match value.as_i64() {
        Some(n) if (min..=max).contains(&n) => {}
        Some(n) => result.errors.push(format!(
            "Frontmatter key '{key}' value {n} is out of range (must be {min}-{max})"
        )),
        None => result.errors.push(format!(
            "Frontmatter key '{key}' must be an integer {min}-{max}"
        )),
    }
}

/// Track 05.T5.19: the NOW Klein-weighting split (prospective + retrospective
/// senses of sight) must carry two numeric weights, each in [0.0, 1.0], summing
/// to 1.0 (canvas-spec §3.1 complementarity). Any mapping was previously accepted;
/// this rejects an out-of-range or non-summing split so it is never rendered as a
/// real weighting.
fn validate_klein_weighting(value: &Value, result: &mut ValidationResult) {
    let Some(map) = value.as_mapping() else {
        result.errors.push(
            "Frontmatter key 'c_3_klein_weighting' must be a mapping of prospective + retrospective weights".to_owned(),
        );
        return;
    };
    let weight = |name: &str| -> Option<f64> {
        map.get(Value::String(name.to_owned()))
            .and_then(Value::as_f64)
    };
    let (Some(prospective), Some(retrospective)) = (weight("prospective"), weight("retrospective"))
    else {
        result.errors.push(
            "Frontmatter key 'c_3_klein_weighting' must carry numeric 'prospective' + 'retrospective' weights".to_owned(),
        );
        return;
    };
    for (name, w) in [
        ("prospective", prospective),
        ("retrospective", retrospective),
    ] {
        if !(0.0..=1.0).contains(&w) {
            result.errors.push(format!(
                "Frontmatter key 'c_3_klein_weighting.{name}' value {w} is out of range (must be 0.0-1.0)"
            ));
        }
    }
    let sum = prospective + retrospective;
    if (sum - 1.0).abs() > 1e-6 {
        result.errors.push(format!(
            "Frontmatter key 'c_3_klein_weighting' weights must sum to 1.0 (prospective + retrospective = {sum})"
        ));
    }
}

fn is_q_vocabulary_family_key(key: &str) -> bool {
    key.starts_with("q_") || key.starts_with("qm_")
}

// The q-register family is OPEN: only the key *shape* is fixed; the facet slug is
// free. A key is well formed iff it is `q_<0-5>['][_<slot>]_<lower_snake_case>`
// (or the `qm_` quickview family). There is no closed vocabulary — see
// Idea/Bimba/Seeds/M/q-vocabulary-canon.md.
pub fn is_wellformed_q_vocabulary_key(key: &str) -> bool {
    let Some(rest) = key.strip_prefix("q_").or_else(|| key.strip_prefix("qm_")) else {
        return false;
    };
    q_vocabulary_suffix(rest).is_some()
}

fn q_vocabulary_suffix(rest: &str) -> Option<&str> {
    let position = rest.chars().next()?;
    if !matches!(position, '0'..='5') {
        return None;
    }

    let mut offset = position.len_utf8();
    if rest[offset..].starts_with('\'') {
        offset += 1; // inverted-phase prime marker
    }
    let after_position = rest[offset..].strip_prefix('_')?;

    // Optional interior numeric slot, then a lower_snake_case semantic suffix.
    let mut slot_split = after_position.splitn(2, '_');
    let first = slot_split.next()?;
    let suffix = if !first.is_empty() && first.chars().all(|ch| ch.is_ascii_digit()) {
        slot_split.next()?
    } else {
        after_position
    };

    let is_lower_snake_case = !suffix.is_empty()
        && suffix.split('_').all(|segment| {
            !segment.is_empty()
                && segment
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        });
    is_lower_snake_case.then_some(suffix)
}

fn is_position_contract_key(key: &str) -> bool {
    let Some(rest) = key.strip_prefix('p') else {
        return false;
    };
    let Some(position) = rest.chars().next() else {
        return false;
    };
    if !matches!(position, '0'..='5') {
        return false;
    }
    let suffix = &rest[position.len_utf8()..];
    let Some(suffix) = suffix.strip_prefix('_') else {
        return false;
    };
    !suffix.is_empty()
        && suffix.split('_').all(|segment| {
            !segment.is_empty()
                && segment
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
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
