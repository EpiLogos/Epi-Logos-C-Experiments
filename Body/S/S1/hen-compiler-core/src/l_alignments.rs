use serde_yaml::Value;

use crate::frontmatter::ValidationResult;

pub(crate) fn validate_l_alignments(value: &Value, result: &mut ValidationResult) {
    let entries = match value.as_sequence() {
        Some(entries) => entries,
        None => {
            result
                .warnings
                .push("l_alignments is present but not a sequence - ignored".to_owned());
            return;
        }
    };

    for (i, entry) in entries.iter().enumerate() {
        let map = match entry.as_mapping() {
            Some(map) => map,
            None => {
                result
                    .errors
                    .push(format!("l_alignments[{i}]: entry must be a mapping"));
                continue;
            }
        };

        let get_str = |field: &str| -> Option<&str> {
            map.get(Value::String(field.to_owned()))
                .and_then(Value::as_str)
        };
        let get_u64 = |field: &str| -> Option<u64> {
            map.get(Value::String(field.to_owned()))
                .and_then(Value::as_u64)
        };

        if get_str("lens").is_none() {
            result.errors.push(format!(
                "l_alignments[{i}]: missing required 'lens' string field"
            ));
        }

        let lens_index = match get_u64("lens_index") {
            Some(n) if n <= 11 => Some(n),
            Some(n) => {
                result.errors.push(format!(
                    "l_alignments[{i}]: lens_index {n} is out of range (must be 0-11)"
                ));
                None
            }
            None => {
                result.errors.push(format!(
                    "l_alignments[{i}]: missing or non-integer 'lens_index'"
                ));
                None
            }
        };

        let mode = get_str("mode");
        match mode {
            Some("day") | Some("night") => {}
            Some(other) => result.errors.push(format!(
                "l_alignments[{i}]: invalid mode '{other}' - must be 'day' or 'night'"
            )),
            None => result
                .errors
                .push(format!("l_alignments[{i}]: missing required 'mode' field")),
        }

        if let (Some(idx), Some(mode)) = (lens_index, mode) {
            let expected = if idx <= 5 { "day" } else { "night" };
            if mode != expected {
                result.errors.push(format!(
                    "l_alignments[{i}]: lens_index {idx} is a {expected}-mode lens but mode is set to '{mode}'"
                ));
            }
        }

        if let Some(weight) = map.get(Value::String("weight".to_owned())) {
            let weight = match weight {
                Value::Number(number) => number.as_f64(),
                _ => None,
            };
            match weight {
                Some(weight) if (0.0..=1.0).contains(&weight) => {}
                Some(weight) => result.errors.push(format!(
                    "l_alignments[{i}]: weight {weight} is out of range (must be 0.0-1.0)"
                )),
                None => result
                    .errors
                    .push(format!("l_alignments[{i}]: weight must be a float")),
            }
        }

        if let Some(klein_square) = map.get(Value::String("klein_square".to_owned())) {
            match klein_square.as_sequence() {
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
                None => result.errors.push(format!(
                    "l_alignments[{i}]: klein_square must be a sequence"
                )),
            }
        }
    }
}
