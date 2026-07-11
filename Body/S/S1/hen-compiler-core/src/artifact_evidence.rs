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
    pub c_layer_evidence: Option<CLayerEvidence>,
    pub aliases: Vec<String>,
    pub candidate_state: Option<String>,
    pub accepted_wikilinks: Vec<String>,
    pub source_c_authority_path: Option<String>,
    pub flat_world_target: Option<String>,
    pub frontmatter_source_coordinates: Vec<String>,
    pub body_wikilinks: Vec<Wikilink>,
    pub headings: Vec<MarkdownHeading>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub frontmatter: Option<Value>,
    pub unknown_frontmatter: BTreeMap<String, Value>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CLayerEvidence {
    pub type_family: String,
    pub type_path: String,
    pub type_coordinate: String,
    pub semantic_authority: String,
    pub crystallisation_state: String,
    pub c_layer_path: String,
}

/// CCT-15: the `s1'.type.classify_c_layer` result — the C-layer evidence
/// plus how it was reached (frontmatter beats ancestry beats kind-routing;
/// C-prime/reflective branches are audited, never plain-C authoritative).
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CLayerClassification {
    pub evidence: CLayerEvidence,
    /// `frontmatter` | `world-types-ancestry` | `kind-routing` | `c-prime-audit`
    pub classification_source: &'static str,
    pub evidence_kind: String,
}

/// The graph-evidence kind for a C-layer typology (single source — the
/// promotion intent and the classify receipt share it).
pub fn c_layer_evidence_kind(type_coordinate: &str, crystallisation_state: &str) -> &'static str {
    if crystallisation_state == "crystallised_world_form" {
        return "c5_world_graduation_receipt";
    }
    match type_coordinate {
        "C2" => "c2_entity_candidate",
        "C3" => "c3_diagram_canvas_form",
        "C4" => "c4_type_moc_authority",
        "C5" => "c5_world_graduation_receipt",
        _ => "c_layer_typology",
    }
}

/// Reflective / C-prime branch segments: paths crossing these are the
/// executional matrix, not the plain-C ontological authority — they must
/// be audited before any graph-authoritative treatment (CCT-15).
const C_PRIME_SEGMENTS: &[&str] = &[
    "C0'", "C1'", "C2'", "C3'", "C4'", "C5'", "C'", "CPF", "CT", "CP", "CF", "CFP", "CS",
];

fn c_prime_segment_in_path(path: &str) -> Option<&'static str> {
    path.split('/')
        .find_map(|part| C_PRIME_SEGMENTS.iter().find(|seg| **seg == part).copied())
}

/// CCT-15 routing law: classify an artifact into its C-native authority.
/// Frontmatter / World-Types ancestry win when present; otherwise kind
/// routing applies — templates → C1, entities/properties/tags → C2,
/// canvases/diagrams → C3, same-name MOC index canvases → C4, flat World
/// residency → C5. Unroutable artifacts are refused, never defaulted.
pub fn classify_c_layer(
    source_path: impl Into<String>,
    content: &str,
) -> Result<CLayerClassification, String> {
    let source_path = source_path.into();
    let normalized = source_path.replace('\\', "/");

    // C-prime ancestry audit comes first: CPF/CT/…/C4' branches carry the
    // reflective scaffold, never plain-C graph authority.
    if let Some(segment) = c_prime_segment_in_path(&normalized) {
        let c_layer_path = normalized
            .split('/')
            .take_while(|part| *part != segment)
            .chain(std::iter::once(segment))
            .collect::<Vec<_>>()
            .join("/");
        return Ok(CLayerClassification {
            evidence: CLayerEvidence {
                type_family: "C'".to_owned(),
                type_path: normalized
                    .strip_suffix(".md")
                    .or_else(|| normalized.strip_suffix(".canvas"))
                    .unwrap_or(&normalized)
                    .to_owned(),
                type_coordinate: segment.to_owned(),
                semantic_authority: "reflective_scaffold_pending_review".to_owned(),
                crystallisation_state: "reflective_scaffold".to_owned(),
                c_layer_path,
            },
            classification_source: "c-prime-audit",
            evidence_kind: "c_prime_reflective_scaffold".to_owned(),
        });
    }

    // Canvas artifacts never parse as markdown: same-name index canvases
    // are C4 MOC authorities, every other canvas/diagram is C3.
    if normalized.ends_with(".canvas") {
        let stem = normalized
            .rsplit('/')
            .next()
            .unwrap_or(&normalized)
            .trim_end_matches(".canvas");
        let parent = normalized
            .split('/')
            .rev()
            .nth(1)
            .unwrap_or_default();
        let already_c4 = normalized.contains("/C/C4/");
        let is_moc_index = stem == parent || already_c4;
        let layer = if is_moc_index { "C4" } else { "C3" };
        let segment = crate::entity_lifecycle::c_layer_segment(layer)
            .expect("canonical C-layer segment exists");
        let evidence = CLayerEvidence {
            type_family: "C".to_owned(),
            type_path: format!("Idea/Bimba/World/Types/Coordinates/C/{layer}/{segment}/{stem}"),
            type_coordinate: layer.to_owned(),
            semantic_authority: if is_moc_index {
                "authoritative".to_owned()
            } else {
                "candidate_pending_review".to_owned()
            },
            crystallisation_state: "incubating_type_index".to_owned(),
            c_layer_path: format!("Idea/Bimba/World/Types/Coordinates/C/{layer}"),
        };
        let kind = c_layer_evidence_kind(&evidence.type_coordinate, &evidence.crystallisation_state);
        return Ok(CLayerClassification {
            evidence,
            classification_source: "kind-routing",
            evidence_kind: kind.to_owned(),
        });
    }

    let evidence = collect_artifact_evidence(source_path.clone(), content)?;
    if let Some(c_layer) = evidence.c_layer_evidence.clone() {
        let from_frontmatter = evidence
            .frontmatter
            .as_ref()
            .and_then(Value::as_mapping)
            .map(|map| map.contains_key(Value::String("type_coordinate".to_owned())))
            .unwrap_or(false);
        let kind =
            c_layer_evidence_kind(&c_layer.type_coordinate, &c_layer.crystallisation_state);
        return Ok(CLayerClassification {
            evidence: c_layer,
            classification_source: if from_frontmatter {
                "frontmatter"
            } else {
                "world-types-ancestry"
            },
            evidence_kind: kind.to_owned(),
        });
    }

    // Kind routing for artifacts with no C evidence at all.
    let stem = normalized
        .rsplit('/')
        .next()
        .unwrap_or(&normalized)
        .trim_end_matches(".md")
        .to_owned();
    let lower = normalized.to_ascii_lowercase();
    let has_template_marker = lower.contains("/templates/")
        || evidence
            .frontmatter
            .as_ref()
            .and_then(Value::as_mapping)
            .is_some_and(|map| {
                map.contains_key(Value::String("q_4_template_role".to_owned()))
                    || map
                        .get(Value::String("artifact_role".to_owned()))
                        .and_then(Value::as_str)
                        == Some("template")
            });
    let layer = if has_template_marker {
        "C1"
    } else if evidence.candidate_state.is_some()
        || lower.contains("/entities/")
        || lower.contains("/properties/")
        || lower.contains("/tags/")
    {
        "C2"
    } else if normalized.starts_with("Idea/Bimba/World/")
        && !normalized.starts_with("Idea/Bimba/World/Types/")
    {
        "C5"
    } else {
        return Err(format!(
            "no C-layer route for `{source_path}` — carries neither C frontmatter, World/Types ancestry, nor a template/entity/canvas/World kind marker"
        ));
    };
    let segment = crate::entity_lifecycle::c_layer_segment(layer)
        .expect("canonical C-layer segment exists");
    let crystallisation_state = match layer {
        "C2" => "entity_candidate",
        "C5" => "candidate",
        _ => "candidate",
    };
    let evidence = CLayerEvidence {
        type_family: "C".to_owned(),
        type_path: format!("Idea/Bimba/World/Types/Coordinates/C/{layer}/{segment}/{stem}"),
        type_coordinate: layer.to_owned(),
        semantic_authority: "candidate_pending_review".to_owned(),
        crystallisation_state: crystallisation_state.to_owned(),
        c_layer_path: format!("Idea/Bimba/World/Types/Coordinates/C/{layer}"),
    };
    let kind = c_layer_evidence_kind(&evidence.type_coordinate, &evidence.crystallisation_state);
    Ok(CLayerClassification {
        evidence,
        classification_source: "kind-routing",
        evidence_kind: kind.to_owned(),
    })
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
        c_layer_evidence: c_layer_evidence(&source_path, frontmatter_map),
        aliases: frontmatter_string_sequence(frontmatter_map, "aliases"),
        candidate_state: frontmatter_string(frontmatter_map, "candidate_state"),
        accepted_wikilinks: accepted_wikilinks(frontmatter_map, &body_wikilinks),
        source_c_authority_path: frontmatter_string(frontmatter_map, "source_c_authority_path"),
        flat_world_target: frontmatter_string(frontmatter_map, "flat_world_target"),
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

fn frontmatter_string_sequence(frontmatter: Option<&Mapping>, key: &str) -> Vec<String> {
    let Some(map) = frontmatter else {
        return Vec::new();
    };
    let Some(value) = map.get(Value::String(key.to_owned())) else {
        return Vec::new();
    };
    if let Some(value) = value.as_str() {
        return vec![value.to_owned()];
    }
    value
        .as_sequence()
        .map(|values| {
            values
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn accepted_wikilinks(frontmatter: Option<&Mapping>, _body_wikilinks: &[Wikilink]) -> Vec<String> {
    frontmatter_string_sequence(frontmatter, "accepted_wikilinks")
}

fn c_layer_evidence(source_path: &str, frontmatter: Option<&Mapping>) -> Option<CLayerEvidence> {
    let normalized = source_path.replace('\\', "/");
    let source_c_authority_path = frontmatter_string(frontmatter, "source_c_authority_path");
    let flat_world_target = frontmatter_string(frontmatter, "flat_world_target");
    let type_coordinate = frontmatter_string(frontmatter, "type_coordinate")
        .or_else(|| c_coordinate_from_world_types_path(&normalized))
        .or_else(|| {
            source_c_authority_path
                .as_deref()
                .and_then(c_coordinate_from_world_types_path)
        })?;
    let type_family = frontmatter_string(frontmatter, "type_family")
        .or_else(|| {
            type_coordinate
                .chars()
                .next()
                .map(|family| family.to_string())
        })
        .unwrap_or_else(|| "C".to_owned());
    let c_layer_path = frontmatter_string(frontmatter, "c_layer_path")
        .or_else(|| c_layer_path_from_world_types_path(&normalized))
        .or_else(|| {
            source_c_authority_path
                .as_deref()
                .and_then(c_layer_path_from_world_types_path)
        })
        .unwrap_or_else(|| format!("Idea/Bimba/World/Types/Coordinates/C/{type_coordinate}"));
    let type_path = frontmatter_string(frontmatter, "type_path")
        .or_else(|| world_types_path_without_extension(&normalized))
        .or_else(|| source_c_authority_path.clone())
        .unwrap_or_else(|| c_layer_path.clone());
    let semantic_authority = frontmatter_string(frontmatter, "semantic_authority")
        .unwrap_or_else(|| "authoritative".to_owned());
    let crystallisation_state = frontmatter_string(frontmatter, "crystallisation_state")
        .or_else(|| {
            flat_world_target
                .as_ref()
                .map(|_| "crystallised_world_form".to_owned())
        })
        .or_else(|| {
            normalized
                .starts_with("Idea/Bimba/World/Types/")
                .then(|| "incubating_type_index".to_owned())
        })
        .unwrap_or_else(|| "candidate".to_owned());

    Some(CLayerEvidence {
        type_family,
        type_path,
        type_coordinate,
        semantic_authority,
        crystallisation_state,
        c_layer_path,
    })
}

fn c_coordinate_from_world_types_path(path: &str) -> Option<String> {
    path.split('/').find_map(|part| {
        matches!(part, "C0" | "C1" | "C2" | "C3" | "C4" | "C5").then(|| part.to_owned())
    })
}

fn c_layer_path_from_world_types_path(path: &str) -> Option<String> {
    let parts = path.split('/').collect::<Vec<_>>();
    let index = parts
        .iter()
        .position(|part| matches!(*part, "C0" | "C1" | "C2" | "C3" | "C4" | "C5"))?;
    Some(parts[..=index].join("/"))
}

fn world_types_path_without_extension(path: &str) -> Option<String> {
    path.starts_with("Idea/Bimba/World/Types/")
        .then(|| path.strip_suffix(".md").unwrap_or(path).to_owned())
}

fn unknown_frontmatter(frontmatter: Option<&Mapping>) -> BTreeMap<String, Value> {
    const KNOWN_KEYS: &[&str] = &[
        "accepted_wikilinks",
        "aliases",
        "artifact_kind",
        "c_layer_path",
        "candidate_state",
        "crystallisation_state",
        "flat_world_target",
        "coordinate",
        "semantic_authority",
        "source_c_authority_path",
        "source_coordinate",
        "source_coordinates",
        "title",
        "type_coordinate",
        "type_family",
        "type_path",
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
