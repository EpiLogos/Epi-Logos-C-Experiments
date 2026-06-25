use serde_yaml::Value;

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
pub(crate) const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
pub fn is_valid_coordinate(coord: &str) -> bool {
    if coord == "#" {
        return true;
    }

    if let Some(rest) = coord.strip_prefix('#') {
        return rest.parse::<u8>().is_ok_and(|n| n <= 5);
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
    return is_valid_family_coordinate_base(base);
}

fn is_valid_family_coordinate_base(base: &str) -> bool {
    if let Some((parent, child)) = base.split_once('-') {
        return is_valid_family_head(parent) && is_valid_position(child);
    }

    if let Some((parent, child)) = base.split_once('.') {
        return is_valid_family_head(parent) && parent.ends_with('4') && is_valid_position(child);
    }

    is_valid_family_head(base)
}

fn is_valid_family_head(head: &str) -> bool {
    if head.len() != 2 {
        return false;
    }
    let family = &head[..1];
    let pos = &head[1..];
    FAMILIES.contains(&family) && is_valid_position(pos)
}

fn is_valid_position(value: &str) -> bool {
    value.parse::<u8>().is_ok_and(|n| n <= 5)
}
pub(crate) fn is_coordinate_key(key: &str) -> bool {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    parts.len() == 3 && matches!(parts[0], "c" | "p" | "l" | "s" | "t" | "m")
}

pub(crate) fn validate_coordinate_key(key: &str, value: &Value) -> Option<String> {
    if key == "c_0_source_coordinates" {
        return validate_source_coordinates_key(value);
    }

    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() != 3 {
        return None;
    }

    let family = parts[0];
    if !matches!(family, "c" | "p" | "l" | "s" | "t" | "m") {
        return None;
    }

    let n = match parts[1].parse::<u8>() {
        Ok(n) => n,
        Err(_) => {
            return Some(format!(
                "Coordinate key '{key}' has invalid position segment"
            ));
        }
    };

    let max_pos = if family == "l" { 11 } else { 5 };
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

fn validate_source_coordinates_key(value: &Value) -> Option<String> {
    let Some(entries) = value.as_sequence() else {
        return Some(
            "Coordinate key 'c_0_source_coordinates' must be a sequence of strings".to_owned(),
        );
    };
    let all_strings = entries.iter().all(Value::is_string);
    (!all_strings)
        .then(|| "Coordinate key 'c_0_source_coordinates' must be a sequence of strings".to_owned())
}
