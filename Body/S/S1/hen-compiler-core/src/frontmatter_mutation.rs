//! Coordinate: S1 (Hen frontmatter mutation)
//! Residency: Body/S/S1/hen-compiler-core
//! Position (#n): governed artifact mutation primitive
//! Actualises: typed, idempotent append operations for coordinate-owned YAML fields.
//! Public surface: `append_frontmatter_string`.
//! Does NOT own: filesystem path selection, persistence, or domain-specific values.
//! Contract: [[S1-SPEC]] / [[S1-ARCHITECTURE]].

use serde_yaml::{Mapping, Value};

/// Append one string to a coordinate-owned frontmatter sequence.
///
/// The markdown body is retained byte-for-byte. Existing scalar or mixed-type
/// fields are refused instead of being silently coerced.
pub fn append_frontmatter_string(markdown: &str, key: &str, value: &str) -> Result<String, String> {
    validate_coordinate_key(key)?;
    if value.trim().is_empty() {
        return Err("frontmatter sequence values must not be empty".to_owned());
    }

    let content = markdown
        .strip_prefix("---\n")
        .ok_or_else(|| "artifact must begin with YAML frontmatter".to_owned())?;
    let (yaml, body) = content
        .split_once("\n---\n")
        .ok_or_else(|| "artifact frontmatter is missing its closing delimiter".to_owned())?;
    let mut mapping: Mapping =
        serde_yaml::from_str(yaml).map_err(|error| format!("invalid YAML frontmatter: {error}"))?;
    let yaml_key = Value::String(key.to_owned());

    match mapping.get_mut(&yaml_key) {
        None | Some(Value::Null) => {
            mapping.insert(
                yaml_key,
                Value::Sequence(vec![Value::String(value.to_owned())]),
            );
        }
        Some(Value::Sequence(values)) => {
            if values
                .iter()
                .any(|entry| !matches!(entry, Value::String(_)))
            {
                return Err(format!(
                    "frontmatter field '{key}' must contain only strings"
                ));
            }
            let candidate = Value::String(value.to_owned());
            if !values.contains(&candidate) {
                values.push(candidate);
            }
        }
        Some(_) => {
            return Err(format!(
                "frontmatter field '{key}' must be a string sequence"
            ));
        }
    }

    let serialized = serde_yaml::to_string(&mapping)
        .map_err(|error| format!("could not serialize YAML frontmatter: {error}"))?;
    let serialized = serialized.strip_prefix("---\n").unwrap_or(&serialized);
    Ok(format!("---\n{}---\n{}", serialized, body))
}

fn validate_coordinate_key(key: &str) -> Result<(), String> {
    let bytes = key.as_bytes();
    let valid = bytes.len() > 4
        && bytes[0] == b'c'
        && bytes[1] == b'_'
        && matches!(bytes[2], b'0'..=b'5')
        && bytes[3] == b'_'
        && bytes[4..]
            .iter()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'_');
    if valid {
        Ok(())
    } else {
        Err(format!("'{key}' is not a coordinate-owned frontmatter key"))
    }
}
