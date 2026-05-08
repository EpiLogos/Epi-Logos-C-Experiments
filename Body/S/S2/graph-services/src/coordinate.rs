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
    pub fn parse_one(input: &str) -> Result<ParsedCoordinate, String> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return Err("empty coordinate string".into());
        }

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

        if CF_NAMES.contains(&trimmed) {
            let idx = CF_NAMES.iter().position(|&name| name == trimmed).unwrap() as u8;
            return Ok(ParsedCoordinate {
                raw: trimmed.into(),
                coordinate: trimmed.into(),
                layer: CoordLayer::ContextFrame,
                family: None,
                ql_position: Some(idx),
                inverted: false,
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
            });
        }

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
