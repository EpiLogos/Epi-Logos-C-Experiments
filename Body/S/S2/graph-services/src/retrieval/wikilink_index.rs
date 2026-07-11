//! CCT-17b — the wikilink span-pointer as a first-class S2 retrieval
//! primitive. Wikilink law was presentation-only (S1 validates integrity
//! on rename/move); this module promotes the links inside
//! `/Idea/Bimba/World/Types/**` entity files into a retrieval index:
//! `suggest_world_links_by_coordinate` returns the coordinates that
//! resolve from wikilink targets in the entity files owned by a
//! coordinate, each with its `{file}:{line}:{column}` span pointer (the
//! same shape Hen writes into `c_1_source_artifact_span`). Feeds
//! `s1'.semantic.*` as a secondary source ranked alongside Smart-Env
//! similarity once the deeper semantic surface lands.
//!
//! Does NOT own wikilink rename/integrity law (S1 Hen) or the graph copy
//! of the spans (Hen promotion writes those).

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// One vault entity file handed to the index: `(vault-relative path,
/// markdown content)`.
pub type WorldEntityFile = (String, String);

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct WorldLinkSuggestion {
    /// The coordinate the wikilink resolves to.
    pub coordinate: String,
    /// The raw `[[target]]` text the resolution came from.
    pub raw_target: String,
    /// Span pointer — `{source_path}:{line}:{column}`, matching the
    /// `c_1_source_artifact_span` pointer shape.
    pub span: String,
}

/// Scan `[[wikilinks]]` in a markdown body. Local minimal scanner for
/// retrieval spans only — rename/integrity law stays with Hen.
fn scan_wikilinks(markdown: &str) -> Vec<(String, usize, usize)> {
    let mut links = Vec::new();
    for (line_index, line) in markdown.lines().enumerate() {
        let mut rest = line;
        let mut consumed = 0usize;
        while let Some(open) = rest.find("[[") {
            let after = &rest[open + 2..];
            let Some(close) = after.find("]]") else {
                break;
            };
            let raw = &after[..close];
            // Alias / heading / block anchors resolve to the bare target.
            let target = raw
                .split('|')
                .next()
                .unwrap_or(raw)
                .split('#')
                .next()
                .unwrap_or(raw)
                .split('^')
                .next()
                .unwrap_or(raw)
                .trim();
            if !target.is_empty() {
                links.push((target.to_owned(), line_index + 1, consumed + open + 1));
            }
            consumed += open + 2 + close + 2;
            rest = &rest[open + 2 + close + 2..];
        }
    }
    links
}

fn frontmatter_value(markdown: &str, key: &str) -> Option<String> {
    let body = markdown.strip_prefix("---")?;
    let end = body.find("\n---")?;
    for line in body[..end].lines() {
        if let Some(value) = line.strip_prefix(&format!("{key}:")) {
            let value = value.trim().trim_matches('"').trim_matches('\'');
            if !value.is_empty() {
                return Some(value.to_owned());
            }
        }
    }
    None
}

fn looks_like_coordinate(target: &str) -> bool {
    let mut chars = target.chars();
    matches!(chars.next(), Some('C' | 'P' | 'S' | 'T' | 'M' | 'L' | '#'))
        && target.len() <= 16
        && target
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '.' | '\'' | '#' | '/'))
        && target.chars().any(|ch| ch.is_ascii_digit())
}

fn is_world_types_path(path: &str) -> bool {
    path.replace('\\', "/")
        .starts_with("Idea/Bimba/World/Types/")
}

/// The retrieval primitive: over the supplied World/Types entity files,
/// return the coordinates that resolve from wikilink targets inside the
/// files owned by `target_coordinate` (frontmatter `coordinate:` equal or
/// prefixed). Targets resolve two ways: a coordinate-literal target IS the
/// coordinate; a named target resolves through another entity file whose
/// title or filename matches it. Unresolvable targets stay out — no
/// invention.
pub fn suggest_world_links_by_coordinate(
    files: &[WorldEntityFile],
    target_coordinate: &str,
) -> Vec<WorldLinkSuggestion> {
    // title/filename → coordinate resolution table over ALL entity files.
    let mut names: BTreeMap<String, String> = BTreeMap::new();
    for (path, markdown) in files {
        let Some(coordinate) = frontmatter_value(markdown, "coordinate") else {
            continue;
        };
        if let Some(title) = frontmatter_value(markdown, "title") {
            names.insert(title, coordinate.clone());
        }
        if let Some(stem) = path
            .rsplit('/')
            .next()
            .map(|name| name.trim_end_matches(".md").to_owned())
        {
            names.entry(stem).or_insert(coordinate);
        }
    }

    let mut suggestions = Vec::new();
    for (path, markdown) in files {
        if !is_world_types_path(path) {
            continue;
        }
        let owner = frontmatter_value(markdown, "coordinate");
        let owned = owner.as_deref().is_some_and(|coordinate| {
            coordinate == target_coordinate
                || coordinate.starts_with(&format!("{target_coordinate}-"))
        });
        if !owned {
            continue;
        }
        for (target, line, column) in scan_wikilinks(markdown) {
            let resolved = if looks_like_coordinate(&target) {
                Some(target.clone())
            } else {
                names.get(&target).cloned()
            };
            if let Some(coordinate) = resolved {
                suggestions.push(WorldLinkSuggestion {
                    coordinate,
                    raw_target: target,
                    span: format!("{path}:{line}:{column}"),
                });
            }
        }
    }
    suggestions.sort_by(|a, b| a.span.cmp(&b.span));
    suggestions.dedup();
    suggestions
}
