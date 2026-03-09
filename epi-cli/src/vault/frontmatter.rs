use serde_yaml::Value;

/// Valid context frame names.
const CF_NAMES: &[&str] = &[
    "CF_VOID",
    "CF_BINARY",
    "CF_TRIKA",
    "CF_QUATERNAL",
    "CF_FRACTAL",
    "CF_SYNTHESIS",
    "CF_MOBIUS",
];

/// Valid VAK reflective coordinate names.
const VAK_NAMES: &[&str] = &["CPF", "CT", "CP", "CF", "CFP", "CS"];

/// Valid family letters.
const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];

/// Validates whether a string is a valid Epi-Logos coordinate notation.
///
/// Accepted forms:
/// - `#` (the inversion act)
/// - `#0` through `#5` (psychoid archetypes)
/// - `Weave_*` (weave states)
/// - `CF_*` (context frames)
/// - `CPF`, `CT`, `CP`, `CF`, `CFP`, `CS` (VAK reflective coordinates)
/// - Family coordinates: `{F}{N}` or `{F}{N}'` where F in {C,P,L,S,T,M} and N in 0..=5
pub fn is_valid_coordinate(coord: &str) -> bool {
    // Bare hash
    if coord == "#" {
        return true;
    }

    // Psychoid archetypes #0-#5
    if coord.starts_with('#') {
        if let Some(rest) = coord.strip_prefix('#') {
            if let Ok(n) = rest.parse::<u8>() {
                return n <= 5;
            }
        }
        return false;
    }

    // Weave states
    if coord.starts_with("Weave_") {
        return true;
    }

    // Context frames
    if coord.starts_with("CF_") {
        return CF_NAMES.contains(&coord);
    }

    // VAK reflective coordinates (must check before family coords since CF overlaps)
    if VAK_NAMES.contains(&coord) {
        return true;
    }

    // Family coordinates: C0-M5 with optional ' suffix
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

/// Validates a frontmatter YAML value and returns a list of error messages.
/// An empty vector means the frontmatter is valid.
pub fn validate_frontmatter(yaml: &Value) -> Vec<String> {
    let mut errors = Vec::new();

    let map = match yaml.as_mapping() {
        Some(m) => m,
        None => {
            errors.push("Frontmatter is not a YAML mapping".to_string());
            return errors;
        }
    };

    // Validate bimbaCoordinate
    if let Some(val) = map.get(Value::String("bimbaCoordinate".to_string())) {
        if let Some(s) = val.as_str() {
            if !is_valid_coordinate(s) {
                errors.push(format!("Invalid bimbaCoordinate: '{}'", s));
            }
        } else {
            errors.push("bimbaCoordinate must be a string".to_string());
        }
    }

    // Validate ql_position
    if let Some(val) = map.get(Value::String("ql_position".to_string())) {
        if let Some(n) = val.as_u64() {
            if n > 5 && n != 255 {
                errors.push(format!("ql_position must be 0-5 or 255, got {}", n));
            }
        } else {
            errors.push("ql_position must be an integer".to_string());
        }
    }

    // Validate family
    if let Some(val) = map.get(Value::String("family".to_string())) {
        if let Some(s) = val.as_str() {
            let valid_families = ["C", "P", "L", "S", "T", "M", "NONE"];
            if !valid_families.contains(&s) {
                errors.push(format!(
                    "Invalid family '{}', expected one of: C, P, L, S, T, M, NONE",
                    s
                ));
            }
        } else {
            errors.push("family must be a string".to_string());
        }
    }

    // Validate {family}_{n}_{semantic} keys
    for (key, _val) in map.iter() {
        if let Some(k) = key.as_str() {
            if let Some(err) = validate_coordinate_key(k) {
                errors.push(err);
            }
        }
    }

    errors
}

/// Validates a frontmatter key that matches the `{family}_{n}_{semantic}` pattern.
/// Returns `Some(error_message)` if the key matches the pattern but has an invalid position,
/// or `None` if the key is valid or does not match the pattern.
fn validate_coordinate_key(key: &str) -> Option<String> {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() != 3 {
        return None;
    }

    let family = parts[0];
    if !FAMILIES.contains(&family) {
        return None; // Not a coordinate key pattern
    }

    let n_str = parts[1];
    match n_str.parse::<u8>() {
        Ok(n) if n > 5 => Some(format!(
            "Coordinate key '{}': position {} must be 0-5",
            key, n
        )),
        Ok(_) => None,
        Err(_) => {
            // Could be a non-coordinate key that happens to start with a family letter
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_coordinates() {
        // Hash
        assert!(is_valid_coordinate("#"));

        // Psychoids
        for i in 0..=5 {
            assert!(is_valid_coordinate(&format!("#{}", i)));
        }

        // Weave states
        assert!(is_valid_coordinate("Weave_0_0"));
        assert!(is_valid_coordinate("Weave_5_5"));
        assert!(is_valid_coordinate("Weave_anything"));

        // Context frames
        for cf in CF_NAMES {
            assert!(is_valid_coordinate(cf), "CF {} should be valid", cf);
        }

        // VAK reflective coordinates
        for vak in VAK_NAMES {
            assert!(is_valid_coordinate(vak), "VAK {} should be valid", vak);
        }

        // Family coordinates (all 6 families x 6 positions)
        for fam in FAMILIES {
            for pos in 0..=5u8 {
                let coord = format!("{}{}", fam, pos);
                assert!(is_valid_coordinate(&coord), "{} should be valid", coord);

                // Inverted form
                let inverted = format!("{}{}'", fam, pos);
                assert!(
                    is_valid_coordinate(&inverted),
                    "{} should be valid",
                    inverted
                );
            }
        }
    }

    #[test]
    fn test_invalid_coordinates() {
        assert!(!is_valid_coordinate(""));
        assert!(!is_valid_coordinate("#6"));
        assert!(!is_valid_coordinate("#99"));
        assert!(!is_valid_coordinate("X0"));
        assert!(!is_valid_coordinate("C7"));
        assert!(!is_valid_coordinate("CF_INVALID"));
        assert!(!is_valid_coordinate("hello"));
        assert!(!is_valid_coordinate("CC"));
        assert!(!is_valid_coordinate("C"));
        assert!(!is_valid_coordinate("0C"));
    }

    #[test]
    fn test_validate_coordinate_key() {
        // Valid coordinate keys
        assert!(validate_coordinate_key("C_0_bimba").is_none());
        assert!(validate_coordinate_key("P_5_integration").is_none());
        assert!(validate_coordinate_key("M_3_mahamaya").is_none());

        // Invalid position in coordinate key
        assert!(validate_coordinate_key("C_6_invalid").is_some());
        assert!(validate_coordinate_key("S_9_bad").is_some());

        // Non-coordinate keys (should return None — not an error)
        assert!(validate_coordinate_key("title").is_none());
        assert!(validate_coordinate_key("bimbaCoordinate").is_none());
        assert!(validate_coordinate_key("X_0_unknown").is_none());
    }

    #[test]
    fn test_validate_frontmatter_valid() {
        let yaml: Value = serde_yaml::from_str(
            r#"
bimbaCoordinate: "M5"
ql_position: 5
family: "M"
M_5_epii: "holographic integration"
"#,
        )
        .unwrap();
        let errors = validate_frontmatter(&yaml);
        assert!(errors.is_empty(), "Expected no errors, got: {:?}", errors);
    }

    #[test]
    fn test_validate_frontmatter_invalid() {
        let yaml: Value = serde_yaml::from_str(
            r#"
bimbaCoordinate: "INVALID"
ql_position: 99
family: "Z"
C_7_bad: "out of range"
"#,
        )
        .unwrap();
        let errors = validate_frontmatter(&yaml);
        assert!(errors.len() >= 3, "Expected at least 3 errors, got: {:?}", errors);
    }

    #[test]
    fn test_validate_frontmatter_ql_position_255() {
        let yaml: Value = serde_yaml::from_str(
            r#"
ql_position: 255
"#,
        )
        .unwrap();
        let errors = validate_frontmatter(&yaml);
        assert!(errors.is_empty(), "255 should be valid for ql_position");
    }
}
