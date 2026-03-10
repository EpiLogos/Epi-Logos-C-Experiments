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
            result.errors.push("Frontmatter is not a YAML mapping".to_string());
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
            None => result.errors.push("coordinate must be a string".to_string()),
        }
    }

    // `bimbaCoordinate` is deprecated but still validate value if present
    if let Some(val) = map.get(Value::String("bimbaCoordinate".to_string())) {
        match val.as_str() {
            Some(s) if is_valid_coordinate(s) => {}
            Some(s) => result.errors.push(format!("Invalid bimbaCoordinate: '{s}'")),
            None => result.errors.push("bimbaCoordinate must be a string".to_string()),
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
            result.errors.push("Frontmatter keys must be strings".to_string());
            continue;
        };

        if is_deprecated_key(key_str) {
            result.warnings.push(format!("Deprecated frontmatter key '{key_str}'"));
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
            result.warnings.push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        result.errors.push(format!("Unknown frontmatter key '{key_str}'"));
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
    parts.len() == 3 && matches!(parts[0], "c" | "p" | "l" | "s" | "t" | "m")
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
    if n > 5 {
        return Some(format!("Coordinate key '{key}': position {n} must be 0-5"));
    }

    match value {
        Value::String(_) => None,
        _ => Some(format!("Coordinate key '{key}' must have a string value")),
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
        assert!(result.errors
            .iter()
            .any(|error| error.contains("Unknown frontmatter key 'M_5_epii'")));
    }
}
