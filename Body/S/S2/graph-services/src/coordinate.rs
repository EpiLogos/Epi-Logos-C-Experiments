#[derive(Debug, Clone, PartialEq)]
pub struct ParsedCoordinate {
    pub raw: String,
    pub coordinate: String,
    pub layer: CoordLayer,
    pub family: Option<String>,
    pub ql_position: Option<u8>,
    pub inverted: bool,
    /// Fractal sub-coordinate path. `M0-2-4` -> [2, 4]. `M4.0` -> [0].
    pub sub_positions: Vec<u8>,
    /// Depth in the fractal tree.
    /// -1 = family root (e.g. `M`).
    ///  0 = base family coordinate (e.g. `M0`).
    ///  1+ = sub-coordinate levels (e.g. `M0-2` is depth 1; `M0-2-4` is depth 2).
    pub depth: i8,
    /// Separator that connects sub-positions. `'-'` for branching, `'.'` for lemniscate nesting.
    pub separator: Option<char>,
    /// True when the coordinate is a lens coord like `M-0` (no ql_position, leading sub-coord).
    pub is_lens: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CoordLayer {
    Psychoid,
    Weave,
    ContextFrame,
    Family,
    /// Family root with no ql_position (e.g. bare `M`).
    FamilyRoot,
    /// Lens coordinate on a family root (e.g. `M-0`).
    Lens,
    Vak,
}

#[derive(Debug, Clone)]
pub struct WikiLink {
    pub target: String,
    pub alias: Option<String>,
}

const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
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

pub struct CoordinateArrayParser;

impl CoordinateArrayParser {
    pub fn parse_one(input: &str) -> Result<ParsedCoordinate, String> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return Err("empty coordinate string".into());
        }

        // Bare `#` psychoid root.
        if trimmed == "#" {
            return Ok(empty_kind(trimmed, CoordLayer::Psychoid, None));
        }

        // Psychoid `#0`..`#5`.
        if trimmed.starts_with('#') && trimmed.len() == 2 {
            let ch = trimmed.chars().nth(1).unwrap();
            if ch.is_ascii_digit() {
                let pos = ch.to_digit(10).unwrap() as u8;
                if pos <= 5 {
                    return Ok(ParsedCoordinate {
                        raw: trimmed.into(),
                        coordinate: trimmed.into(),
                        layer: CoordLayer::Psychoid,
                        family: None,
                        ql_position: Some(pos),
                        inverted: false,
                        sub_positions: Vec::new(),
                        depth: 0,
                        separator: None,
                        is_lens: false,
                    });
                }
            }
            return Err(format!("invalid psychoid: '{}'", trimmed));
        }

        if trimmed.starts_with("Weave_") {
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::Weave,
                family: None,
                ql_position: None,
                inverted: false,
                sub_positions: Vec::new(),
                depth: 0,
                separator: None,
                is_lens: false,
            });
        }

        if CF_NAMES.contains(&trimmed) {
            let idx = CF_NAMES.iter().position(|&name| name == trimmed).unwrap() as u8;
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::ContextFrame,
                family: None,
                ql_position: Some(idx),
                inverted: false,
                sub_positions: Vec::new(),
                depth: 0,
                separator: None,
                is_lens: false,
            });
        }

        if VAK_NAMES.contains(&trimmed) {
            let idx = VAK_NAMES.iter().position(|&name| name == trimmed).unwrap() as u8;
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::Vak,
                family: None,
                ql_position: Some(idx),
                inverted: false,
                sub_positions: Vec::new(),
                depth: 0,
                separator: None,
                is_lens: false,
            });
        }

        let inverted = trimmed.ends_with('\'');
        let base = trimmed.trim_end_matches('\'');

        // Family root: bare `M`, `C`, etc.
        if base.len() == 1 {
            let fam = base;
            if FAMILIES.contains(&fam) {
                return Ok(ParsedCoordinate {
                    raw: trimmed.into(),
                    coordinate: trimmed.into(),
                    layer: CoordLayer::FamilyRoot,
                    family: Some(fam.to_string()),
                    ql_position: None,
                    inverted,
                    sub_positions: Vec::new(),
                    depth: -1,
                    separator: None,
                    is_lens: false,
                });
            }
        }

        // Lens coordinate: `M-0`, `M-3`, etc. — family letter, dash, digit, no leading position.
        if base.len() >= 3 {
            let fam = &base[..1];
            let second = base.chars().nth(1).unwrap();
            if FAMILIES.contains(&fam) && second == '-' {
                let rest = &base[2..];
                if let Some(sub_positions) = parse_sub_positions(rest, '-') {
                    return Ok(ParsedCoordinate {
                        raw: trimmed.into(),
                        coordinate: trimmed.into(),
                        layer: CoordLayer::Lens,
                        family: Some(fam.to_string()),
                        ql_position: None,
                        inverted,
                        sub_positions,
                        depth: 0,
                        separator: Some('-'),
                        is_lens: true,
                    });
                }
            }
        }

        // Family coord with optional sub-coordinates: `M0`, `M0-2`, `M0-2-4`, `M4.0`, `M4.0-0`.
        if base.len() >= 2 {
            let fam = &base[..1];
            let pos_ch = base.chars().nth(1).unwrap();
            if FAMILIES.contains(&fam) && pos_ch.is_ascii_digit() {
                let pos = pos_ch.to_digit(10).unwrap() as u8;
                if pos <= 5 {
                    let tail = &base[2..];
                    if tail.is_empty() {
                        return Ok(ParsedCoordinate {
                            raw: trimmed.into(),
                            coordinate: trimmed.into(),
                            layer: CoordLayer::Family,
                            family: Some(fam.to_string()),
                            ql_position: Some(pos),
                            inverted,
                            sub_positions: Vec::new(),
                            depth: 0,
                            separator: None,
                            is_lens: false,
                        });
                    }

                    // Sub-coordinate path. First char must be a separator.
                    let separator = tail.chars().next().unwrap();
                    if separator == '-' || separator == '.' {
                        if let Some(sub_positions) = parse_sub_positions(&tail[1..], separator) {
                            let depth = sub_positions.len() as i8;
                            return Ok(ParsedCoordinate {
                                raw: trimmed.into(),
                                coordinate: trimmed.into(),
                                layer: CoordLayer::Family,
                                family: Some(fam.to_string()),
                                ql_position: Some(pos),
                                inverted,
                                sub_positions,
                                depth,
                                separator: Some(separator),
                                is_lens: false,
                            });
                        }
                    }
                }
            }
        }

        Err(format!("unrecognized coordinate: '{}'", trimmed))
    }

    pub fn parse_multi(input: &str) -> Result<Vec<ParsedCoordinate>, String> {
        input
            .split(',')
            .map(|part| Self::parse_one(part.trim()))
            .collect()
    }

    pub fn parse_wikilink(input: &str) -> Option<WikiLink> {
        let inner = input.strip_prefix("[[")?.strip_suffix("]]")?;
        let parts: Vec<&str> = inner.splitn(2, '|').collect();
        Some(WikiLink {
            target: parts[0].to_string(),
            alias: parts.get(1).map(|alias| alias.to_string()),
        })
    }

    pub fn extract_wikilinks(content: &str) -> Vec<WikiLink> {
        let mut links = Vec::new();
        let mut start = 0;
        while let Some(open) = content[start..].find("[[") {
            let abs_open = start + open;
            if let Some(close) = content[abs_open..].find("]]") {
                let link_str = &content[abs_open..abs_open + close + 2];
                if let Some(wikilink) = Self::parse_wikilink(link_str) {
                    links.push(wikilink);
                }
                start = abs_open + close + 2;
            } else {
                break;
            }
        }
        links
    }

    pub fn parse_frontmatter_arrays(yaml: &serde_yaml::Value) -> Vec<(String, Vec<WikiLink>)> {
        let mut arrays = Vec::new();
        let families_lower = ["c", "p", "l", "s", "t", "m"];
        if let Some(map) = yaml.as_mapping() {
            for (key, value) in map {
                if let Some(key_str) = key.as_str() {
                    let parts: Vec<&str> = key_str.splitn(3, '_').collect();
                    if parts.len() == 3 && families_lower.contains(&parts[0]) {
                        if let Some(val_str) = value.as_str() {
                            let links = Self::extract_wikilinks(val_str);
                            if !links.is_empty() {
                                arrays.push((key_str.to_string(), links));
                            }
                        }

                        if let Some(seq) = value.as_sequence() {
                            let links: Vec<WikiLink> = seq
                                .iter()
                                .filter_map(|v| v.as_str())
                                .flat_map(Self::extract_wikilinks)
                                .collect();
                            if !links.is_empty() {
                                arrays.push((key_str.to_string(), links));
                            }
                        }
                    }
                }
            }
        }
        arrays
    }
}

/// Convert leading `#` to `M` (legacy notation for the M-branch).
pub fn convert_hash_to_m_family(coord: &str) -> String {
    if coord.starts_with('#') {
        if coord == "#" {
            return "M".to_string();
        }
        // Only convert if the char after # is a digit (`#0`, `#-0`, etc., but NOT `#abc`).
        let rest = &coord[1..];
        let first = rest.chars().next().unwrap_or(' ');
        if first.is_ascii_digit() || first == '-' || first == '.' {
            return format!("M{}", rest);
        }
    }
    coord.to_string()
}

fn empty_kind(coord: &str, layer: CoordLayer, family: Option<String>) -> ParsedCoordinate {
    ParsedCoordinate {
        raw: coord.into(),
        coordinate: coord.into(),
        layer,
        family,
        ql_position: None,
        inverted: false,
        sub_positions: Vec::new(),
        depth: -1,
        separator: None,
        is_lens: false,
    }
}

/// Parse a separator-delimited sub-coordinate tail like `2-4` or `0-0`.
/// Returns None if any segment is not a single digit 0..=9.
fn parse_sub_positions(tail: &str, sep: char) -> Option<Vec<u8>> {
    if tail.is_empty() {
        return None;
    }
    let mut out = Vec::new();
    for segment in tail.split(sep) {
        // Allow nested dots inside dash segments (or vice versa) — split on the active separator
        // and then look for the alternate separator within the segment.
        let alt = if sep == '-' { '.' } else { '-' };
        if segment.contains(alt) {
            // Recurse: a mixed run like `0.0` inside a dash split.
            for inner in segment.split(alt) {
                if inner.is_empty() {
                    return None;
                }
                let n: u8 = inner.parse().ok()?;
                if n > 9 {
                    return None;
                }
                out.push(n);
            }
        } else {
            if segment.is_empty() {
                return None;
            }
            let n: u8 = segment.parse().ok()?;
            if n > 9 {
                return None;
            }
            out.push(n);
        }
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_family_root() {
        let p = CoordinateArrayParser::parse_one("M").unwrap();
        assert_eq!(p.layer, CoordLayer::FamilyRoot);
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, None);
        assert_eq!(p.depth, -1);
    }

    #[test]
    fn parses_family_base() {
        let p = CoordinateArrayParser::parse_one("M0").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, Some(0));
        assert_eq!(p.depth, 0);
        assert!(p.sub_positions.is_empty());
    }

    #[test]
    fn parses_sub_coordinate_dash() {
        let p = CoordinateArrayParser::parse_one("M0-2-4").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, Some(0));
        assert_eq!(p.sub_positions, vec![2, 4]);
        assert_eq!(p.depth, 2);
        assert_eq!(p.separator, Some('-'));
    }

    #[test]
    fn parses_sub_coordinate_lemniscate() {
        let p = CoordinateArrayParser::parse_one("M4.0").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, Some(4));
        assert_eq!(p.sub_positions, vec![0]);
        assert_eq!(p.depth, 1);
        assert_eq!(p.separator, Some('.'));
    }

    #[test]
    fn parses_mixed_lemniscate_dash() {
        let p = CoordinateArrayParser::parse_one("M4.0-0").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.ql_position, Some(4));
        assert_eq!(p.sub_positions, vec![0, 0]);
    }

    #[test]
    fn parses_lens_coordinate() {
        let p = CoordinateArrayParser::parse_one("M-0").unwrap();
        assert_eq!(p.layer, CoordLayer::Lens);
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, None);
        assert_eq!(p.sub_positions, vec![0]);
        assert!(p.is_lens);
    }

    #[test]
    fn parses_inverted_sub_coordinate() {
        let p = CoordinateArrayParser::parse_one("M0-2'").unwrap();
        assert!(p.inverted);
        assert_eq!(p.sub_positions, vec![2]);
        assert_eq!(p.family.as_deref(), Some("M"));
    }

    #[test]
    fn rejects_invalid_sub_segment() {
        assert!(CoordinateArrayParser::parse_one("M0--").is_err());
        assert!(CoordinateArrayParser::parse_one("M0-").is_err());
        assert!(CoordinateArrayParser::parse_one("M0-abc").is_err());
    }

    #[test]
    fn hash_to_m_conversion() {
        assert_eq!(convert_hash_to_m_family("#"), "M");
        assert_eq!(convert_hash_to_m_family("#0"), "M0");
        assert_eq!(convert_hash_to_m_family("#0-2-4"), "M0-2-4");
        assert_eq!(convert_hash_to_m_family("#4.0-0"), "M4.0-0");
        assert_eq!(convert_hash_to_m_family("#-0"), "M-0");
        // Non-# inputs pass through.
        assert_eq!(convert_hash_to_m_family("M0"), "M0");
        assert_eq!(convert_hash_to_m_family("C5"), "C5");
    }

    #[test]
    fn original_families_still_parse() {
        for fam in &["C", "P", "L", "S", "T", "M"] {
            for pos in 0..=5 {
                let coord = format!("{}{}", fam, pos);
                let p = CoordinateArrayParser::parse_one(&coord).unwrap();
                assert_eq!(p.family.as_deref(), Some(*fam));
                assert_eq!(p.ql_position, Some(pos));
            }
        }
    }

    #[test]
    fn original_psychoids_still_parse() {
        for i in 0..=5 {
            let coord = format!("#{}", i);
            let p = CoordinateArrayParser::parse_one(&coord).unwrap();
            assert_eq!(p.layer, CoordLayer::Psychoid);
            assert_eq!(p.ql_position, Some(i));
        }
    }
}
