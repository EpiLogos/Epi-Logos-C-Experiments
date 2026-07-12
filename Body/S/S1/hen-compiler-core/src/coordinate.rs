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
/// Validate a coordinate string against the full multi-level Epi-Logos grammar.
///
/// This accepts the whole coordinate space the ontology actually holds so the
/// Neo4j→repo `/map` reflection can round-trip deep coordinates (Track 45.T45.1):
///   - psychoid roots `#`, `#0`..`#5`, legacy deep tags `#0-2-9`, `#3-1-0-7`, and
///     lens tags `#-0` (the `M-0` lens form);
///   - family coordinates `M2`, with a trailing prime at any exposed level
///     (`S1'`, `M2-5-0'`);
///   - multi-level sub-paths `M2-5-0`, `M2-3-0-360` — sub-positions are
///     range-unconstrained because decan degrees / codon / tarot indices push
///     well past the QL 0-5 ideal;
///   - context-frame segments in canonical `(…)` form `M0-4.(0/1)`,
///     `M2-5-(0/1)-6`, `M0-4.(4.0/1-4.4/5)`, and their pre-normalisation raw
///     dataset form `M0-4.0/1`, `#2-3-5/0`.
///
/// The base family (or psychoid) QL position stays bounded to 0-5: over-range
/// bases (`M6`, `#6`, `C9`) and malformed segments (`M0-`, `M0-abc`, unbalanced
/// parens) are still rejected.
///
/// Grammar mirrors the canonical multi-level parser
/// `graph-services::coordinate::CoordinateArrayParser::parse_one`
/// (Body/S/S2/graph-services/src/coordinate.rs); keep the two in sync — see the
/// five-implementation parity note in
/// `45-bimba-map-indexing-and-dox-okf-unification.md` §3.3.
pub fn is_valid_coordinate(coord: &str) -> bool {
    if coord == "#" {
        return true;
    }

    // Legacy psychoid tag `#…` (the M-branch's pre-migration notation). `#N`, deep
    // `#N-Z-Y`, dot/frame `#N.…`, and lens `#-N` all validate as their `M`-family
    // equivalent — matches graph-services `convert_hash_to_m_family`.
    if let Some(rest) = coord.strip_prefix('#') {
        let leads_body =
            matches!(rest.chars().next(), Some(c) if c.is_ascii_digit() || c == '-' || c == '.');
        if !leads_body {
            return false;
        }
        let m_equiv = format!("M{rest}");
        let base = m_equiv.strip_suffix('\'').unwrap_or(&m_equiv);
        return is_valid_family_coordinate_base(base);
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
    is_valid_family_coordinate_base(base)
}

/// Validate a family coordinate base (trailing prime already stripped): a family
/// letter, an optional QL position (0-5), and an optional multi-level sub-path.
fn is_valid_family_coordinate_base(base: &str) -> bool {
    let Some(family) = base.get(..1) else {
        return false;
    };
    if !FAMILIES.contains(&family) {
        return false;
    }
    let rest = &base[1..];

    // Lens coordinate: family letter directly followed by a `-` sub-path with no
    // leading QL position, e.g. `M-0` (from the legacy `#-0` lens tag).
    if let Some(tail) = rest.strip_prefix('-') {
        return is_valid_sub_path(tail);
    }

    // Positioned family coordinate: a single QL position digit (0-5) …
    let Some(pos_ch) = rest.chars().next() else {
        return false; // bare family letter `M` is not itself a coordinate here
    };
    if !pos_ch.is_ascii_digit() || pos_ch.to_digit(10).unwrap() > 5 {
        return false;
    }
    let tail = &rest[pos_ch.len_utf8()..];
    if tail.is_empty() {
        return true; // e.g. `M0`
    }

    // … optionally followed by a `-` or `.` separated sub-path.
    match tail.strip_prefix(['-', '.']) {
        Some(sub) => is_valid_sub_path(sub),
        None => false,
    }
}

/// Validate a `-`/`.`-separated, paren-aware sub-coordinate path such as `2-4`,
/// `0-360`, `4.(0/1)`, `(0/1)-6`, or the raw `4.0/1`. Each segment is either an
/// unconstrained numeric sub-position or a parenthesised context frame `(…)`.
/// Mirrors graph-services `parse_sub_tokens` + `split_sub_segments`.
fn is_valid_sub_path(tail: &str) -> bool {
    let Some(segments) = split_sub_segments(tail) else {
        return false;
    };
    segments.iter().all(|segment| {
        // Numeric sub-positions are range-unconstrained (context frames, decan
        // degrees, codon/tarot indices exceed 5); u16 matches the canonical parser.
        segment.parse::<u16>().is_ok()
            || (segment.starts_with('(') && segment.ends_with(')') && segment.len() > 2)
    })
}

/// Split a sub-coordinate tail on top-level `-`, `.`, `/` while keeping any
/// `(…)` context frame atomic. Returns `None` on an empty tail, an empty segment,
/// or unbalanced parens. Mirrors graph-services `split_sub_segments`.
fn split_sub_segments(tail: &str) -> Option<Vec<String>> {
    if tail.is_empty() {
        return None;
    }
    let mut segments = Vec::new();
    let mut current = String::new();
    let mut paren_depth = 0usize;
    for ch in tail.chars() {
        match ch {
            '(' => {
                paren_depth += 1;
                current.push(ch);
            }
            ')' => {
                paren_depth = paren_depth.checked_sub(1)?;
                current.push(ch);
            }
            '-' | '.' | '/' if paren_depth == 0 => {
                if current.is_empty() {
                    return None;
                }
                segments.push(std::mem::take(&mut current));
            }
            _ => current.push(ch),
        }
    }
    if paren_depth != 0 || current.is_empty() {
        return None;
    }
    segments.push(current);
    Some(segments)
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
