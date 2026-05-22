use std::collections::BTreeMap;

use serde_yaml::{Mapping, Value};
use sha2::{Digest, Sha256};

use crate::wikilinks::{parse_wikilinks, Wikilink};

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ArtifactKind {
    VaultMarkdown,
    Markdown,
    Unknown(String),
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarkdownHeading {
    pub level: u8,
    pub title: String,
    pub line: usize,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ArtifactEvidence {
    pub source_path: String,
    pub artifact_kind: ArtifactKind,
    pub title: Option<String>,
    pub coordinate: Option<String>,
    pub frontmatter_source_coordinates: Vec<String>,
    pub body_wikilinks: Vec<Wikilink>,
    pub headings: Vec<MarkdownHeading>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub frontmatter: Option<Value>,
    pub unknown_frontmatter: BTreeMap<String, Value>,
}

pub fn collect_artifact_evidence(
    source_path: impl Into<String>,
    markdown: &str,
) -> Result<ArtifactEvidence, String> {
    let source_path = source_path.into();
    let (frontmatter, body, body_start_line) = split_frontmatter(markdown)?;
    let frontmatter_map = frontmatter.as_ref().and_then(Value::as_mapping);
    let mut body_wikilinks = parse_wikilinks(body);
    for link in &mut body_wikilinks {
        link.line += body_start_line.saturating_sub(1);
    }

    Ok(ArtifactEvidence {
        artifact_kind: artifact_kind(&source_path, frontmatter_map),
        title: frontmatter_string(frontmatter_map, "title").or_else(|| first_h1(body)),
        coordinate: frontmatter_string(frontmatter_map, "coordinate"),
        frontmatter_source_coordinates: source_coordinates(frontmatter_map),
        body_wikilinks,
        headings: parse_headings(body, body_start_line),
        content_hash: sha256_prefixed(markdown.as_bytes()),
        markdown_body_hash: sha256_prefixed(body.as_bytes()),
        unknown_frontmatter: unknown_frontmatter(frontmatter_map),
        frontmatter,
        source_path,
    })
}

fn split_frontmatter(markdown: &str) -> Result<(Option<Value>, &str, usize), String> {
    let Some(after_open) = markdown
        .strip_prefix("---\n")
        .or_else(|| markdown.strip_prefix("---\r\n"))
    else {
        return Ok((None, markdown, 1));
    };

    let opening_len = markdown.len() - after_open.len();
    let mut offset = opening_len;

    for line in markdown[opening_len..].split_inclusive('\n') {
        let line_without_newline = line.trim_end_matches('\n').trim_end_matches('\r');
        if line_without_newline == "---" {
            let yaml_source = &markdown[opening_len..offset];
            let body_start = offset + line.len();
            let body_start_line = markdown[..body_start]
                .bytes()
                .filter(|byte| *byte == b'\n')
                .count()
                + 1;
            let value = serde_yaml::from_str::<Value>(yaml_source)
                .map_err(|error| format!("invalid YAML frontmatter: {error}"))?;
            return Ok((Some(value), &markdown[body_start..], body_start_line));
        }
        offset += line.len();
    }

    Ok((None, markdown, 1))
}

fn artifact_kind(source_path: &str, frontmatter: Option<&Mapping>) -> ArtifactKind {
    if let Some(kind) = frontmatter_string(frontmatter, "artifact_kind") {
        return match kind.as_str() {
            "vault_markdown" | "VaultMarkdown" => ArtifactKind::VaultMarkdown,
            "markdown" | "Markdown" => ArtifactKind::Markdown,
            other => ArtifactKind::Unknown(other.to_owned()),
        };
    }

    if source_path.ends_with(".md") || source_path.ends_with(".markdown") {
        ArtifactKind::VaultMarkdown
    } else {
        ArtifactKind::Unknown("unknown".to_owned())
    }
}

fn frontmatter_string(frontmatter: Option<&Mapping>, key: &str) -> Option<String> {
    frontmatter
        .and_then(|map| map.get(Value::String(key.to_owned())))
        .and_then(Value::as_str)
        .map(str::to_owned)
}

fn source_coordinates(frontmatter: Option<&Mapping>) -> Vec<String> {
    let Some(map) = frontmatter else {
        return Vec::new();
    };

    for key in ["source_coordinates", "source_coordinate"] {
        let Some(value) = map.get(Value::String(key.to_owned())) else {
            continue;
        };

        if let Some(coordinate) = value.as_str() {
            return vec![coordinate.to_owned()];
        }

        if let Some(coordinates) = value.as_sequence() {
            return coordinates
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_owned)
                .collect();
        }
    }

    Vec::new()
}

fn unknown_frontmatter(frontmatter: Option<&Mapping>) -> BTreeMap<String, Value> {
    const KNOWN_KEYS: &[&str] = &[
        "artifact_kind",
        "coordinate",
        "source_coordinate",
        "source_coordinates",
        "title",
    ];

    let mut unknown = BTreeMap::new();
    let Some(map) = frontmatter else {
        return unknown;
    };

    for (key, value) in map {
        let Some(key) = key.as_str() else {
            continue;
        };
        if !KNOWN_KEYS.contains(&key) {
            unknown.insert(key.to_owned(), value.clone());
        }
    }

    unknown
}

fn parse_headings(markdown_body: &str, starting_line: usize) -> Vec<MarkdownHeading> {
    let mut headings = Vec::new();
    let mut fence = None;

    for (line_index, line) in markdown_body.lines().enumerate() {
        if update_fence_state(line, &mut fence) {
            continue;
        }
        if fence.is_some() {
            continue;
        }

        let trimmed = line.trim_start();
        let level = trimmed.chars().take_while(|char| *char == '#').count();
        if !(1..=6).contains(&level) {
            continue;
        }

        let rest = &trimmed[level..];
        if !rest.starts_with(' ') {
            continue;
        }

        let title = rest.trim();
        if title.is_empty() {
            continue;
        }

        headings.push(MarkdownHeading {
            level: level as u8,
            title: title.to_owned(),
            line: starting_line + line_index,
        });
    }

    headings
}

fn first_h1(markdown_body: &str) -> Option<String> {
    parse_headings(markdown_body, 1)
        .into_iter()
        .find(|heading| heading.level == 1)
        .map(|heading| heading.title)
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct FenceState {
    marker: char,
    len: usize,
}

fn update_fence_state(line: &str, fence: &mut Option<FenceState>) -> bool {
    let Some(candidate) = fence_marker(line) else {
        return false;
    };

    match fence {
        Some(open) if candidate.marker == open.marker && candidate.len >= open.len => {
            *fence = None;
            true
        }
        None => {
            *fence = Some(candidate);
            true
        }
        Some(_) => false,
    }
}

fn fence_marker(line: &str) -> Option<FenceState> {
    let trimmed = line.trim_start();
    let marker = trimmed.chars().next()?;
    if marker != '`' && marker != '~' {
        return None;
    }

    let len = trimmed.chars().take_while(|ch| *ch == marker).count();
    (len >= 3).then_some(FenceState { marker, len })
}

fn sha256_prefixed(bytes: &[u8]) -> String {
    format!("sha256:{:x}", Sha256::digest(bytes))
}
