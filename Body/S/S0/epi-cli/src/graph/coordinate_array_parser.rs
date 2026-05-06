#[derive(Debug, Clone, PartialEq)]
pub struct ParsedCoordinate {
    pub raw: String,
    pub coordinate: String,
    pub layer: CoordLayer,
    pub family: Option<String>,
    pub ql_position: Option<u8>,
    pub inverted: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CoordLayer {
    Psychoid,
    Weave,
    ContextFrame,
    Family,
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
    /// Parse a single coordinate string into structured form
    pub fn parse_one(input: &str) -> Result<ParsedCoordinate, String> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return Err("empty coordinate string".into());
        }

        // Hash: "#"
        if trimmed == "#" {
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: "#".into(),
                layer: CoordLayer::Psychoid,
                family: None,
                ql_position: None,
                inverted: false,
            });
        }

        // Psychoids: #0-#5
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
                    });
                }
            }
            return Err(format!("invalid psychoid: '{}'", trimmed));
        }

        // Weaves: Weave_0_0, Weave_0_5, Weave_5_0, Weave_5_5
        if trimmed.starts_with("Weave_") {
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::Weave,
                family: None,
                ql_position: None,
                inverted: false,
            });
        }

        // Context frames: CF_VOID..CF_MOBIUS
        if CF_NAMES.contains(&trimmed) {
            let idx = CF_NAMES.iter().position(|&n| n == trimmed).unwrap() as u8;
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::ContextFrame,
                family: None,
                ql_position: Some(idx),
                inverted: false,
            });
        }

        // VAK: CPF, CT, CP, CF, CFP, CS
        if VAK_NAMES.contains(&trimmed) {
            let idx = VAK_NAMES.iter().position(|&n| n == trimmed).unwrap() as u8;
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::Vak,
                family: None,
                ql_position: Some(idx),
                inverted: false,
            });
        }

        // Family coordinates: {F}{0-5} or {F}{0-5}'
        let inverted = trimmed.ends_with('\'');
        let base = trimmed.trim_end_matches('\'');
        if base.len() == 2 {
            let fam = &base[..1];
            let pos_ch = base.chars().nth(1).unwrap();
            if FAMILIES.contains(&fam) && pos_ch.is_ascii_digit() {
                let pos = pos_ch.to_digit(10).unwrap() as u8;
                if pos <= 5 {
                    return Ok(ParsedCoordinate {
                        raw: trimmed.into(),
                        coordinate: trimmed.into(),
                        layer: CoordLayer::Family,
                        family: Some(fam.to_string()),
                        ql_position: Some(pos),
                        inverted,
                    });
                }
            }
        }

        Err(format!("unrecognized coordinate: '{}'", trimmed))
    }

    /// Parse comma-separated coordinate list
    pub fn parse_multi(input: &str) -> Result<Vec<ParsedCoordinate>, String> {
        input
            .split(',')
            .map(|s| Self::parse_one(s.trim()))
            .collect()
    }

    /// Parse wiki-link: [[target]] or [[target|alias]]
    pub fn parse_wikilink(input: &str) -> Option<WikiLink> {
        let inner = input.strip_prefix("[[")?.strip_suffix("]]")?;
        let parts: Vec<&str> = inner.splitn(2, '|').collect();
        Some(WikiLink {
            target: parts[0].to_string(),
            alias: parts.get(1).map(|s| s.to_string()),
        })
    }

    /// Extract all wiki-links from markdown content
    pub fn extract_wikilinks(content: &str) -> Vec<WikiLink> {
        let mut links = Vec::new();
        let mut start = 0;
        while let Some(open) = content[start..].find("[[") {
            let abs_open = start + open;
            if let Some(close) = content[abs_open..].find("]]") {
                let link_str = &content[abs_open..abs_open + close + 2];
                if let Some(wl) = Self::parse_wikilink(link_str) {
                    links.push(wl);
                }
                start = abs_open + close + 2;
            } else {
                break;
            }
        }
        links
    }

    /// Parse frontmatter coordinate arrays from {family}_{n}_{semantic} keys
    pub fn parse_frontmatter_arrays(yaml: &serde_yaml::Value) -> Vec<(String, Vec<WikiLink>)> {
        let mut arrays = Vec::new();
        let families_lower = ["c", "p", "l", "s", "t", "m"];
        if let Some(map) = yaml.as_mapping() {
            for (key, value) in map {
                if let Some(key_str) = key.as_str() {
                    let parts: Vec<&str> = key_str.splitn(3, '_').collect();
                    if parts.len() == 3 && families_lower.contains(&parts[0]) {
                        // String value with embedded wikilinks
                        if let Some(val_str) = value.as_str() {
                            let links = Self::extract_wikilinks(val_str);
                            if !links.is_empty() {
                                arrays.push((key_str.to_string(), links));
                            }
                        }
                        // Array of link strings
                        if let Some(seq) = value.as_sequence() {
                            let links: Vec<WikiLink> = seq
                                .iter()
                                .filter_map(|v| v.as_str())
                                .flat_map(|s| Self::extract_wikilinks(s))
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_hash() {
        let p = CoordinateArrayParser::parse_one("#").unwrap();
        assert_eq!(p.layer, CoordLayer::Psychoid);
        assert_eq!(p.ql_position, None);
        assert!(!p.inverted);
    }

    #[test]
    fn test_parse_psychoid() {
        let p = CoordinateArrayParser::parse_one("#4").unwrap();
        assert_eq!(p.layer, CoordLayer::Psychoid);
        assert_eq!(p.ql_position, Some(4));
        assert!(!p.inverted);
    }

    #[test]
    fn test_parse_family() {
        let p = CoordinateArrayParser::parse_one("P3").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family, Some("P".into()));
        assert_eq!(p.ql_position, Some(3));
        assert!(!p.inverted);
    }

    #[test]
    fn test_parse_family_inverted() {
        let p = CoordinateArrayParser::parse_one("M4'").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family, Some("M".into()));
        assert_eq!(p.ql_position, Some(4));
        assert!(p.inverted);
    }

    #[test]
    fn test_parse_context_frame() {
        let p = CoordinateArrayParser::parse_one("CF_TRIKA").unwrap();
        assert_eq!(p.layer, CoordLayer::ContextFrame);
        assert_eq!(p.ql_position, Some(2));
    }

    #[test]
    fn test_parse_vak() {
        let p = CoordinateArrayParser::parse_one("CPF").unwrap();
        assert_eq!(p.layer, CoordLayer::Vak);
        assert_eq!(p.ql_position, Some(0));
    }

    #[test]
    fn test_parse_weave() {
        let p = CoordinateArrayParser::parse_one("Weave_0_5").unwrap();
        assert_eq!(p.layer, CoordLayer::Weave);
    }

    #[test]
    fn test_parse_multi() {
        let coords = CoordinateArrayParser::parse_multi("P3, M4', #0").unwrap();
        assert_eq!(coords.len(), 3);
        assert_eq!(coords[0].coordinate, "P3");
        assert_eq!(coords[1].coordinate, "M4'");
        assert_eq!(coords[2].coordinate, "#0");
    }

    #[test]
    fn test_parse_invalid() {
        assert!(CoordinateArrayParser::parse_one("#6").is_err());
        assert!(CoordinateArrayParser::parse_one("X3").is_err());
        assert!(CoordinateArrayParser::parse_one("P9").is_err());
        assert!(CoordinateArrayParser::parse_one("").is_err());
        assert!(CoordinateArrayParser::parse_one("random").is_err());
    }

    #[test]
    fn test_parse_wikilink() {
        let wl = CoordinateArrayParser::parse_wikilink("[[Bimba/Seeds/P/P3]]").unwrap();
        assert_eq!(wl.target, "Bimba/Seeds/P/P3");
        assert!(wl.alias.is_none());

        let wl2 = CoordinateArrayParser::parse_wikilink("[[P3|Pattern]]").unwrap();
        assert_eq!(wl2.target, "P3");
        assert_eq!(wl2.alias, Some("Pattern".into()));
    }

    #[test]
    fn test_extract_wikilinks() {
        let content = "Links to [[Bimba/Seeds/P/P3]] and [[M4|Nara]] here";
        let links = CoordinateArrayParser::extract_wikilinks(content);
        assert_eq!(links.len(), 2);
        assert_eq!(links[0].target, "Bimba/Seeds/P/P3");
        assert_eq!(links[1].target, "M4");
        assert_eq!(links[1].alias, Some("Nara".into()));
    }

    #[test]
    fn test_no_wikilinks() {
        let links = CoordinateArrayParser::extract_wikilinks("no links here");
        assert!(links.is_empty());
    }

    #[test]
    fn test_parse_frontmatter_arrays() {
        let yaml_str = r#"
coordinate: "M4"
c_0_ground: "[[Bimba/Seeds/C/C0|Bimba]]"
p_3_pattern: "[[P3|Pattern]]"
name: "Nara"
"#;
        let yaml: serde_yaml::Value = serde_yaml::from_str(yaml_str).unwrap();
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(&yaml);
        assert_eq!(arrays.len(), 2);
    }
}
