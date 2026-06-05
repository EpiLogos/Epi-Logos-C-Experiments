#[derive(Debug, Clone, PartialEq)]
pub struct ParsedCoordinate {
    pub raw: String,
    pub coordinate: String,
    pub layer: CoordLayer,
    pub family: Option<String>,
    pub ql_position: Option<u8>,
    pub inverted: bool,
    /// Fractal sub-coordinate path as pure integers. Populated when every segment
    /// is a digit (e.g. `M0-2-4` -> [2, 4]). Empty when any segment is a context
    /// frame like `(0/1)` — use `sub_segments` instead.
    pub sub_positions: Vec<u16>,
    /// All sub-coordinate tokens as raw strings, including parenthesized context
    /// frames. `M2-(0/1)-6` -> ["2", "(0/1)", "6"] is the wrong shape; correctly
    /// the dash-split of the tail `(0/1)-6` is ["(0/1)", "6"]. Context frames
    /// retain their parens.
    pub sub_segments: Vec<String>,
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
const CF_LITERALS: &[&str] = &[
    "(00/00)",
    "(0/1)",
    "(0/1/2)",
    "(0/1/2/3)",
    "(4.0/1-4.4/5)",
    "(4.5/0)",
    "(5/0)",
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
                        sub_segments: Vec::new(),
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
                sub_segments: Vec::new(),
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
                sub_segments: Vec::new(),
                depth: 0,
                separator: None,
                is_lens: false,
            });
        }

        if let Some(idx) = CF_LITERALS.iter().position(|&literal| literal == trimmed) {
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::ContextFrame,
                family: None,
                ql_position: Some(idx as u8),
                inverted: false,
                sub_positions: Vec::new(),
                sub_segments: Vec::new(),
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
                sub_segments: Vec::new(),
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
                    sub_segments: Vec::new(),
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
                if let Some(sub) = parse_sub_tokens(rest) {
                    return Ok(ParsedCoordinate {
                        raw: trimmed.into(),
                        coordinate: trimmed.into(),
                        layer: CoordLayer::Lens,
                        family: Some(fam.to_string()),
                        ql_position: None,
                        inverted,
                        sub_positions: sub.positions.unwrap_or_default(),
                        sub_segments: sub.segments,
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
                            sub_segments: Vec::new(),
                            depth: 0,
                            separator: None,
                            is_lens: false,
                        });
                    }

                    // Sub-coordinate path. First char must be a separator.
                    let separator = tail.chars().next().unwrap();
                    if separator == '-' || separator == '.' {
                        if let Some(sub) = parse_sub_tokens(&tail[1..]) {
                            let depth = sub.segments.len() as i8;
                            return Ok(ParsedCoordinate {
                                raw: trimmed.into(),
                                coordinate: trimmed.into(),
                                layer: CoordLayer::Family,
                                family: Some(fam.to_string()),
                                ql_position: Some(pos),
                                inverted,
                                sub_positions: sub.positions.unwrap_or_default(),
                                sub_segments: sub.segments,
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

/// Map a parenthesised context-frame literal to the canonical `CF_*` node it instances.
///
/// Returns the CF node's `coordinate` (e.g. `"CF_BINARY"`) so callers can MERGE the
/// `OPERATES_IN` relationship directly. Returns None for frames that don't match a
/// canonical CF — caller may skip or warn.
///
/// Lemniscate-anchored fractal stages (`(4.x/…)`, `(4.0/1-4.4/5)`) all bind to
/// `CF_FRACTAL` because they're *modes of the Mod 4/6 doubling*, not free instances
/// of their underlying mod-N count.
pub fn cf_node_for_frame(literal: &str) -> Option<&'static str> {
    // Strip outer parens so callers can pass either `(0/1)` or `0/1`.
    let inner = literal
        .strip_prefix('(')
        .and_then(|s| s.strip_suffix(')'))
        .unwrap_or(literal);
    match inner {
        "00/00" | "0000" => Some("CF_VOID"),
        "0/1" => Some("CF_BINARY"),
        "0/1/2" => Some("CF_TRIKA"),
        "0/1/2/3" => Some("CF_QUATERNAL"),
        "4.0/1-4.4/5" => Some("CF_FRACTAL"),
        "4.5/0" | "4/5/0" => Some("CF_SYNTHESIS"),
        "5/0" => Some("CF_MOBIUS"),
        // Any lemniscate-anchored stage: starts with "4." or is the full fractal frame.
        s if s.starts_with("4.") && s.contains('/') => Some("CF_FRACTAL"),
        _ => None,
    }
}

/// Extract every parenthesised context-frame substring from a coordinate.
/// `M2-5-(0/1)-6` → ["(0/1)"]. `M0-(4.0/1)-(5/0)` → ["(4.0/1)", "(5/0)"].
/// Respects nesting (any `(` opens a frame).
pub fn extract_context_frames(coord: &str) -> Vec<String> {
    let mut frames = Vec::new();
    let mut chars = coord.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '(' {
            let mut buf = String::from("(");
            let mut depth = 1i32;
            while let Some(c) = chars.next() {
                buf.push(c);
                match c {
                    '(' => depth += 1,
                    ')' => {
                        depth -= 1;
                        if depth == 0 {
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if depth == 0 {
                frames.push(buf);
            }
        }
    }
    frames
}

/// Wrap every dash-delimited segment of a coordinate that contains `/` in parentheses.
/// Already-parenthesised segments are left alone. Idempotent.
///
/// This makes context-frame structure explicit in the coordinate string:
///   `M2-4.0-0/1-0-10` → `M2-4.0-(0/1)-0-10`
///   `M2-5-0/1-6`      → `M2-5-(0/1)-6`
///   `M0-4.4.0-4.4/5`  → `M0-4.4.0-(4.4/5)`
///   `M2-(0/1)-6`      → `M2-(0/1)-6`   (already wrapped — no change)
///
/// Canonical mod-N context frames recognised by the parser (in `(...)` form):
///   `(00/00)`        — Mod % (Receptive Dynamism, Svatantrya-Spanda)
///   `(0/1)`          — Mod 2 (Non-dual binary)
///   `(0/1/2)`        — Mod 3 (Trika)
///   `(0/1/2/3)`      — Mod 4 (Three Plus One)
///   `(4.0/1-4.4/5)`  — Mod 4/6 (Fractal doubling — dash *inside* parens stays atomic)
///   `(4.5/0)`        — Psyche synthesis
///   `(5/0)`          — Mod 6 (Möbius return)
///   `(4/5/0)`        — legacy synthesis alias
pub fn wrap_context_frames(coord: &str) -> String {
    coord
        .split('-')
        .map(|seg| {
            if seg.contains('/') && !(seg.starts_with('(') && seg.ends_with(')')) {
                format!("({})", seg)
            } else {
                seg.to_string()
            }
        })
        .collect::<Vec<_>>()
        .join("-")
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
        sub_segments: Vec::new(),
        depth: -1,
        separator: None,
        is_lens: false,
    }
}

struct SubCoordinateTokens {
    positions: Option<Vec<u16>>,
    segments: Vec<String>,
}

/// Parse a separator-delimited sub-coordinate tail like `2-4`, `0-360`,
/// `4.0/1`, or `(0/1)-6`.
///
/// Numeric sub-positions are unconstrained integers (Bimba variants extend well
/// past 5). Parenthesized context-frame segments are preserved in
/// `sub_segments` and make `positions` unavailable rather than invalidating the
/// coordinate. Bare non-numeric tokens remain invalid.
fn parse_sub_tokens(tail: &str) -> Option<SubCoordinateTokens> {
    if tail.is_empty() {
        return None;
    }
    let segments = split_sub_segments(tail)?;
    let mut positions = Vec::new();
    let mut all_numeric = true;
    for segment in &segments {
        if let Ok(position) = segment.parse::<u16>() {
            positions.push(position);
            continue;
        }
        if segment.starts_with('(') && segment.ends_with(')') && segment.len() > 2 {
            all_numeric = false;
            continue;
        }
        return None;
    }
    Some(SubCoordinateTokens {
        positions: all_numeric.then_some(positions),
        segments,
    })
}

fn split_sub_segments(tail: &str) -> Option<Vec<String>> {
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
    if segments.iter().any(|segment| segment.is_empty()) {
        None
    } else {
        Some(segments)
    }
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
        assert_eq!(p.sub_segments, vec!["2", "4"]);
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
    fn parses_context_frame_sub_segments_without_forcing_numeric_positions() {
        let p = CoordinateArrayParser::parse_one("M2-(0/1)-6").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.ql_position, Some(2));
        assert!(p.sub_positions.is_empty());
        assert_eq!(p.sub_segments, vec!["(0/1)", "6"]);
        assert_eq!(p.depth, 2);
    }

    #[test]
    fn parses_all_canonical_parenthesized_context_frame_literals() {
        for (idx, literal) in CF_LITERALS.iter().enumerate() {
            let parsed = CoordinateArrayParser::parse_one(literal)
                .unwrap_or_else(|err| panic!("failed to parse {literal}: {err}"));
            assert_eq!(parsed.layer, CoordLayer::ContextFrame);
            assert_eq!(parsed.ql_position, Some(idx as u8));
            assert_eq!(parsed.coordinate, *literal);
            assert!(parsed.sub_segments.is_empty());
        }
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
    fn parses_parenthesized_context_frames() {
        let p = CoordinateArrayParser::parse_one("M2-5-(0/1)-6").unwrap();
        assert_eq!(p.family.as_deref(), Some("M"));
        assert_eq!(p.ql_position, Some(2));
        assert_eq!(p.sub_segments, vec!["5", "(0/1)", "6"]);
        // sub_positions only populated when all-numeric
        assert!(p.sub_positions.is_empty());
        assert_eq!(p.depth, 3);

        let p = CoordinateArrayParser::parse_one("M0-(4.0/1/2/3)-5").unwrap();
        assert_eq!(p.sub_segments, vec!["(4.0/1/2/3)", "5"]);
        assert_eq!(p.depth, 2);

        let p = CoordinateArrayParser::parse_one("M3-5-(5/0)-99").unwrap();
        assert_eq!(p.sub_segments, vec!["5", "(5/0)", "99"]);
    }

    #[test]
    fn cf_node_mapping_covers_all_canonical_frames() {
        // Direct one-to-one
        assert_eq!(cf_node_for_frame("(00/00)"), Some("CF_VOID"));
        assert_eq!(cf_node_for_frame("(0000)"), Some("CF_VOID"));
        assert_eq!(cf_node_for_frame("(0/1)"), Some("CF_BINARY"));
        assert_eq!(cf_node_for_frame("(0/1/2)"), Some("CF_TRIKA"));
        assert_eq!(cf_node_for_frame("(0/1/2/3)"), Some("CF_QUATERNAL"));
        assert_eq!(cf_node_for_frame("(4.0/1-4.4/5)"), Some("CF_FRACTAL"));
        assert_eq!(cf_node_for_frame("(4.5/0)"), Some("CF_SYNTHESIS"));
        assert_eq!(cf_node_for_frame("(5/0)"), Some("CF_MOBIUS"));
        assert_eq!(cf_node_for_frame("(4/5/0)"), Some("CF_SYNTHESIS"));
        // All lemniscate-anchored fractal stages bind to CF_FRACTAL
        assert_eq!(cf_node_for_frame("(4.0/1)"), Some("CF_FRACTAL"));
        assert_eq!(cf_node_for_frame("(4.0/1/2)"), Some("CF_FRACTAL"));
        assert_eq!(cf_node_for_frame("(4.0/1/2/3)"), Some("CF_FRACTAL"));
        assert_eq!(cf_node_for_frame("(4.4/5)"), Some("CF_FRACTAL"));
        // Without parens still works
        assert_eq!(cf_node_for_frame("0/1"), Some("CF_BINARY"));
        // Unknown frame returns None
        assert_eq!(cf_node_for_frame("(0/360)"), None);
        assert_eq!(cf_node_for_frame("(7/8/9)"), None);
    }

    #[test]
    fn extract_context_frames_finds_all_frames_in_coord() {
        assert_eq!(extract_context_frames("M2-5-(0/1)-6"), vec!["(0/1)"]);
        assert_eq!(
            extract_context_frames("M0-(4.0/1)-(5/0)"),
            vec!["(4.0/1)", "(5/0)"]
        );
        assert_eq!(
            extract_context_frames("M0-(4.0/1-4.4/5)"),
            vec!["(4.0/1-4.4/5)"]
        );
        // No frames
        assert!(extract_context_frames("M0-2-4").is_empty());
        assert!(extract_context_frames("M4.0").is_empty());
    }

    /// All canonical mod-N context frames — including the Mod 4/6 fractal
    /// `(4.0/1-4.4/5)` (dash *inside* parens, must stay one atomic segment)
    /// and the canonical `(4.5/0)` synthesis frame. Embedded in family coords.
    #[test]
    fn parses_all_canonical_mod_frames_embedded() {
        let cases: &[(&str, &[&str])] = &[
            ("M0-(00/00)", &["(00/00)"]),             // Mod %
            ("M2-5-(0/1)-6", &["5", "(0/1)", "6"]),   // Mod 2
            ("M0-(0/1/2)", &["(0/1/2)"]),             // Mod 3
            ("M0-(0/1/2/3)", &["(0/1/2/3)"]),         // Mod 4
            ("M0-(4.0/1-4.4/5)", &["(4.0/1-4.4/5)"]), // Mod 4/6 fractal
            ("M0-(4.5/0)", &["(4.5/0)"]),             // Psyche synthesis
            ("M3-5-(5/0)-99", &["5", "(5/0)", "99"]), // Mod 6 Möbius
            ("M0-(4/5/0)", &["(4/5/0)"]),             // legacy synthesis alias
            ("M2-3-(4.5/0)-1", &["3", "(4.5/0)", "1"]),
        ];
        for (coord, expected_segs) in cases {
            let p = CoordinateArrayParser::parse_one(coord)
                .unwrap_or_else(|e| panic!("parse failed for '{}': {}", coord, e));
            let segs: Vec<String> = expected_segs.iter().map(|s| s.to_string()).collect();
            assert_eq!(p.sub_segments, segs, "coord {}", coord);
        }
    }

    #[test]
    fn wrap_context_frames_is_correct_and_idempotent() {
        assert_eq!(wrap_context_frames("M2-4.0-0/1-0-10"), "M2-4.0-(0/1)-0-10");
        assert_eq!(wrap_context_frames("M2-5-0/1-6"), "M2-5-(0/1)-6");
        assert_eq!(wrap_context_frames("M0-4.0/1"), "M0-(4.0/1)");
        assert_eq!(wrap_context_frames("M0-4.0/1/2/3-5"), "M0-(4.0/1/2/3)-5");
        assert_eq!(wrap_context_frames("M0-4.4.0-4.4/5"), "M0-4.4.0-(4.4/5)");
        // Already-wrapped — idempotent
        assert_eq!(wrap_context_frames("M2-(0/1)-6"), "M2-(0/1)-6");
        // No slash → no change
        assert_eq!(wrap_context_frames("M0-2-4"), "M0-2-4");
        assert_eq!(wrap_context_frames("M"), "M");
    }

    #[test]
    fn parses_variant_positions_beyond_ql_ideal() {
        // Decan degrees, codon indices etc. push sub-positions well past 5.
        let p = CoordinateArrayParser::parse_one("M2-3-0-360").unwrap();
        assert_eq!(p.ql_position, Some(2)); // base stays QL-canonical
        assert_eq!(p.sub_positions, vec![3, 0, 360]);

        let p = CoordinateArrayParser::parse_one("M2-5-9").unwrap();
        assert_eq!(p.sub_positions, vec![5, 9]);

        let p = CoordinateArrayParser::parse_one("M0-5-5/0").unwrap();
        assert_eq!(p.sub_positions, vec![5, 5, 0]);
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
