use serde_yaml::{Mapping, Value};

#[derive(Debug, Default)]
pub struct ValidationResult {
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

const CF_NAMES: &[&str] = &[
    "CF_VOID",
    "CF_BINARY",
    "CF_TRIKA",
    "CF_QUATERNAL",
    "CF_FRACTAL",
    "CF_SYNTHESIS",
    "CF_MOBIUS",
];

const VAK_NAMES: &[&str] = &["CPF", "CT", "CP", "CF", "CFP", "CS"];
const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
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
    // L-alignment block: agent-populated epistemic lens annotations
    "l_alignments",
];
const DEPRECATED_PATTERNS: &[&str] = &["bimbaCoordinate", "ql_position"];

pub fn is_valid_coordinate(coord: &str) -> bool {
    if coord == "#" {
        return true;
    }

    if coord.starts_with('#') {
        if let Some(rest) = coord.strip_prefix('#') {
            if let Ok(n) = rest.parse::<u8>() {
                return n <= 5;
            }
        }
        return false;
    }

    if coord.starts_with("Weave_") {
        return true;
    }

    if coord.starts_with("CF_") {
        return CF_NAMES.contains(&coord);
    }

    if VAK_NAMES.contains(&coord) {
        return true;
    }

    let base = coord.strip_suffix('\'').unwrap_or(coord);
    if base.len() == 2 {
        let family = &base[..1];
        let pos = &base[1..];
        if FAMILIES.contains(&family) {
            if let Ok(n) = pos.parse::<u8>() {
                return n <= 5;
            }
        }
    }

    false
}

pub fn validate_frontmatter(yaml: &Value) -> ValidationResult {
    let mut result = ValidationResult::default();

    let map = match yaml.as_mapping() {
        Some(m) => m,
        None => {
            result
                .errors
                .push("Frontmatter is not a YAML mapping".to_string());
            return result;
        }
    };

    validate_identity(map, &mut result);
    validate_keys(map, &mut result);
    validate_temporal_requirements(map, &mut result.errors);

    result
}

fn validate_identity(map: &Mapping, result: &mut ValidationResult) {
    // `coordinate` is canonical; validate its value
    if let Some(val) = map.get(Value::String("coordinate".to_string())) {
        match val.as_str() {
            Some(s) if is_valid_coordinate(s) => {}
            Some(s) => result.errors.push(format!("Invalid coordinate: '{s}'")),
            None => result
                .errors
                .push("coordinate must be a string".to_string()),
        }
    }

    // `bimbaCoordinate` is deprecated but still validate value if present
    if let Some(val) = map.get(Value::String("bimbaCoordinate".to_string())) {
        match val.as_str() {
            Some(s) if is_valid_coordinate(s) => {}
            Some(s) => result
                .errors
                .push(format!("Invalid bimbaCoordinate: '{s}'")),
            None => result
                .errors
                .push("bimbaCoordinate must be a string".to_string()),
        }
    }

    if let Some(val) = map.get(Value::String("family".to_string())) {
        match val.as_str() {
            Some(s) if FAMILIES.contains(&s) || s == "NONE" => {}
            Some(s) => result.errors.push(format!(
                "Invalid family '{s}', expected one of: C, P, L, S, T, M, NONE"
            )),
            None => result.errors.push("family must be a string".to_string()),
        }
    }
}

fn validate_keys(map: &Mapping, result: &mut ValidationResult) {
    for (key, value) in map {
        let Some(key_str) = key.as_str() else {
            result
                .errors
                .push("Frontmatter keys must be strings".to_string());
            continue;
        };

        if is_deprecated_key(key_str) {
            result
                .warnings
                .push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        // l_alignments: validate each entry's internal consistency
        if key_str == "l_alignments" {
            validate_l_alignments(value, result);
            continue;
        }

        if is_coordinate_key(key_str) {
            if let Some(err) = validate_coordinate_key(key_str, value) {
                result.errors.push(err);
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
        .get(Value::String("artifact_role".to_string()))
        .and_then(Value::as_str);

    if matches!(artifact_role, Some("now") | Some("thought")) {
        for required in ["session_id", "day_id"] {
            if !map.contains_key(Value::String(required.to_string())) {
                errors.push(format!("Missing required temporal key '{required}'"));
            }
        }
    }

    if artifact_role == Some("thought") {
        if !map.contains_key(Value::String("thought_type".to_string())) {
            errors.push("Missing required thought_type for thought artifact".to_string());
        }
    }
}

fn is_deprecated_key(key: &str) -> bool {
    DEPRECATED_PATTERNS.contains(&key) || key.starts_with("pos_")
}

fn is_coordinate_key(key: &str) -> bool {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() != 3 {
        return false;
    }
    if !matches!(parts[0], "c" | "p" | "l" | "s" | "t" | "m") {
        return false;
    }
    // L-family shorthand keys may use lens indices 0-11 (day + night lenses).
    // All other families remain 0-5 — validated in validate_coordinate_key.
    // Accepting them here routes them to validate_coordinate_key for further checks.
    true
}

fn validate_coordinate_key(key: &str, value: &Value) -> Option<String> {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() != 3 {
        return None;
    }

    let family = parts[0];
    if !matches!(family, "c" | "p" | "l" | "s" | "t" | "m") {
        return None;
    }

    let n_str = parts[1];
    let n = match n_str.parse::<u8>() {
        Ok(value) => value,
        Err(_) => {
            return Some(format!(
                "Coordinate key '{key}' has invalid position segment"
            ))
        }
    };

    // L-family per-lens shorthand keys support indices 0-11 (day 0-5, night 6-11).
    // All other families are bounded by the standard 0-5 position range.
    let max_pos: u8 = if family == "l" { 11 } else { 5 };
    if n > max_pos {
        return Some(format!(
            "Coordinate key '{key}': position {n} must be 0-{max_pos} for family '{family}'"
        ));
    }

    match value {
        Value::String(_) | Value::Mapping(_) => None,
        _ => Some(format!(
            "Coordinate key '{key}' must have a string or mapping value"
        )),
    }
}

/// Validate an `l_alignments` value.
///
/// `l_alignments` is a YAML sequence. Each entry must have:
///   - `lens`: string
///   - `lens_index`: integer 0-11
///   - `mode`: "day" | "night"
///   - consistency: index 0-5 → mode "day"; index 6-11 → mode "night"
///   - `weight` (optional): float in [0.0, 1.0]
///   - `klein_square` (optional): 4-element sequence of strings
///
/// Unknown sub-fields within an entry are tolerated (additive protocol).
fn validate_l_alignments(value: &Value, result: &mut ValidationResult) {
    let entries = match value.as_sequence() {
        Some(seq) => seq,
        None => {
            result
                .warnings
                .push("l_alignments is present but not a sequence — ignored".to_string());
            return;
        }
    };

    for (i, entry) in entries.iter().enumerate() {
        let map = match entry.as_mapping() {
            Some(m) => m,
            None => {
                result
                    .errors
                    .push(format!("l_alignments[{i}]: entry must be a mapping"));
                continue;
            }
        };

        let get_str = |field: &str| -> Option<&str> {
            map.get(Value::String(field.to_string()))
                .and_then(Value::as_str)
        };
        let get_u64 = |field: &str| -> Option<u64> {
            map.get(Value::String(field.to_string()))
                .and_then(Value::as_u64)
        };

        // Required: `lens` (string)
        if get_str("lens").is_none() {
            result
                .errors
                .push(format!("l_alignments[{i}]: missing required 'lens' string field"));
        }

        // Required: `lens_index` (0-11)
        let lens_index = match get_u64("lens_index") {
            Some(n) => {
                if n > 11 {
                    result.errors.push(format!(
                        "l_alignments[{i}]: lens_index {n} is out of range (must be 0-11)"
                    ));
                    None
                } else {
                    Some(n)
                }
            }
            None => {
                result
                    .errors
                    .push(format!("l_alignments[{i}]: missing or non-integer 'lens_index'"));
                None
            }
        };

        // Required: `mode` ("day" | "night")
        let mode = get_str("mode");
        match mode {
            Some("day") | Some("night") => {}
            Some(other) => result.errors.push(format!(
                "l_alignments[{i}]: invalid mode '{other}' — must be 'day' or 'night'"
            )),
            None => result
                .errors
                .push(format!("l_alignments[{i}]: missing required 'mode' field")),
        }

        // Consistency: lens_index 0-5 → mode "day"; 6-11 → mode "night"
        if let (Some(idx), Some(m)) = (lens_index, mode) {
            let expected = if idx <= 5 { "day" } else { "night" };
            if m != expected {
                result.errors.push(format!(
                    "l_alignments[{i}]: lens_index {idx} is a {expected}-mode lens \
                     but mode is set to '{m}'"
                ));
            }
        }

        // Optional: `weight` (float 0.0-1.0)
        if let Some(w) = map.get(Value::String("weight".to_string())) {
            let weight_f = match w {
                Value::Number(n) => n.as_f64(),
                _ => None,
            };
            match weight_f {
                Some(f) if (0.0..=1.0).contains(&f) => {}
                Some(f) => result.errors.push(format!(
                    "l_alignments[{i}]: weight {f} is out of range (must be 0.0-1.0)"
                )),
                None => result.errors.push(format!(
                    "l_alignments[{i}]: weight must be a float"
                )),
            }
        }

        // Optional: `klein_square` (4-element sequence of strings)
        if let Some(ks) = map.get(Value::String("klein_square".to_string())) {
            match ks.as_sequence() {
                Some(seq) if seq.len() == 4 => {
                    for (j, elem) in seq.iter().enumerate() {
                        if elem.as_str().is_none() {
                            result.errors.push(format!(
                                "l_alignments[{i}].klein_square[{j}]: must be a string"
                            ));
                        }
                    }
                }
                Some(seq) => result.errors.push(format!(
                    "l_alignments[{i}]: klein_square must be a 4-element array (got {})",
                    seq.len()
                )),
                None => result
                    .errors
                    .push(format!("l_alignments[{i}]: klein_square must be a sequence")),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn coordinate_keys_are_lowercase() {
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "M5"
family: "M"
M_5_epii: "wrong"
"#,
        )
        .unwrap();
        let result = validate_frontmatter(&yaml);
        assert!(result
            .errors
            .iter()
            .any(|error| error.contains("Unknown frontmatter key 'M_5_epii'")));
    }

    #[test]
    fn l_alignments_valid_entry_passes() {
        let yaml: Value = serde_yaml::from_str(
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
        let result = validate_frontmatter(&yaml);
        assert!(result.errors.is_empty(), "expected no errors, got: {:?}", result.errors);
    }

    #[test]
    fn l_alignments_night_lens_valid() {
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "S1"
l_alignments:
  - lens: "L2'"
    lens_index: 8
    mode: "night"
    weight: 0.5
"#,
        )
        .unwrap();
        let result = validate_frontmatter(&yaml);
        assert!(result.errors.is_empty(), "expected no errors, got: {:?}", result.errors);
    }

    #[test]
    fn l_alignments_mode_index_mismatch_is_error() {
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "S1"
l_alignments:
  - lens: "L2"
    lens_index: 2
    mode: "night"
"#,
        )
        .unwrap();
        let result = validate_frontmatter(&yaml);
        assert!(
            result.errors.iter().any(|e| e.contains("day-mode lens") && e.contains("night")),
            "expected day/night mismatch error, got: {:?}", result.errors
        );
    }

    #[test]
    fn l_alignments_weight_out_of_range_is_error() {
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "S1"
l_alignments:
  - lens: "L3"
    lens_index: 3
    mode: "day"
    weight: 1.5
"#,
        )
        .unwrap();
        let result = validate_frontmatter(&yaml);
        assert!(
            result.errors.iter().any(|e| e.contains("weight") && e.contains("out of range")),
            "expected weight range error, got: {:?}", result.errors
        );
    }

    #[test]
    fn l_alignments_klein_square_wrong_length_is_error() {
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "S1"
l_alignments:
  - lens: "L1"
    lens_index: 1
    mode: "day"
    klein_square: ["L1", "L4"]
"#,
        )
        .unwrap();
        let result = validate_frontmatter(&yaml);
        assert!(
            result.errors.iter().any(|e| e.contains("klein_square") && e.contains("4-element")),
            "expected klein_square length error, got: {:?}", result.errors
        );
    }

    #[test]
    fn l_shorthand_key_day_range_passes() {
        // l_2_logical is a valid {family}_{n}_{semantic} key — n=2 within 0-5 day range
        let yaml: Value = serde_yaml::from_str(
            r#"
coordinate: "S1"
l_2_logical:
  sub: 3
  weight: 0.8
  element: "air"
"#,
        )
        .unwrap();
        // l_2_logical has a mapping value — should pass with updated coordinate key validation
        let result = validate_frontmatter(&yaml);
        assert!(result.errors.is_empty(), "expected no errors, got: {:?}", result.errors);
    }
}
