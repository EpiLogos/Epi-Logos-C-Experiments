use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::artifact_evidence::{collect_artifact_evidence, ArtifactEvidence, ArtifactKind};
use crate::property_intelligence::{
    build_property_intelligence_request, PropertyIntelligenceRequest,
};
use crate::relation_inference::{
    build_relation_inference_request, RelationInferenceCandidate, RelationLinkEvidence,
};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GraphPromotionIntent {
    pub node: GraphPromotionNode,
    pub link_evidence: Vec<RelationLinkEvidence>,
    pub frontmatter_evidence: Vec<FrontmatterEvidence>,
    pub property_intelligence_request: Option<PropertyIntelligenceRequest>,
    pub relation_candidates: Vec<RelationInferenceCandidate>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub compatibility_source_label: Option<String>,
    pub compatibility_source_property: Option<String>,
    pub compatibility_source_coordinate: Option<String>,
    pub promotion_source: String,
    pub sync_version: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GraphPromotionNode {
    pub coordinate: String,
    pub identity_property: String,
    pub vault_path: String,
    pub requested_label_hints: Vec<String>,
    pub properties: BTreeMap<String, serde_json::Value>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct FrontmatterEvidence {
    pub key: String,
    pub value: String,
    pub evidence_kind: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct LegacyCoordinateEvidence {
    property: String,
    coordinate: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct CoordinatePromotionMetadata {
    prefix: String,
    parent: Option<String>,
    axis: String,
}

impl GraphPromotionIntent {
    pub fn from_markdown(source_path: impl Into<String>, markdown: &str) -> Result<Self, String> {
        let evidence = collect_artifact_evidence(source_path, markdown)?;
        Self::from_artifact_evidence(evidence, Vec::new())
    }

    pub fn from_artifact_evidence(
        evidence: ArtifactEvidence,
        relation_candidates: Vec<RelationInferenceCandidate>,
    ) -> Result<Self, String> {
        let coordinate = evidence
            .coordinate
            .clone()
            .ok_or_else(|| "graph promotion requires coordinate frontmatter".to_owned())?;
        if !is_promotion_coordinate(&coordinate) {
            return Err(format!("invalid graph promotion coordinate: {coordinate}"));
        }

        let request = build_relation_inference_request(&evidence, &[])?;
        let property_intelligence_request = build_property_intelligence_request(
            &evidence,
            promotion_class_for_path(&evidence.source_path),
            &["c", "p", "l", "s", "t", "m", "q"],
            &leading_property_families_for_path(&evidence.source_path),
            &[
                "coordinate",
                "title",
                "vault_path",
                "content_hash",
                "coordinate_prefix",
                "artifact_kind",
                "s_4_function_role",
                "s_4_runtime_boundary",
                "s_1_vault_path",
                "c_1_description",
                "c_0_essence",
                "m_2_i_colour",
                "q_4_template_role",
            ],
        )?;
        let mut properties = BTreeMap::new();
        properties.insert(
            "coordinate".to_owned(),
            serde_json::Value::String(coordinate.clone()),
        );
        properties.insert(
            "vault_path".to_owned(),
            serde_json::Value::String(evidence.source_path.clone()),
        );
        properties.insert(
            "content_hash".to_owned(),
            serde_json::Value::String(evidence.content_hash.clone()),
        );
        properties.insert(
            "relation_evidence_count".to_owned(),
            serde_json::Value::Number(serde_json::Number::from(evidence.body_wikilinks.len())),
        );
        if let Some(title) = &evidence.title {
            properties.insert("title".to_owned(), serde_json::Value::String(title.clone()));
        }
        if let Some(metadata) = coordinate_promotion_metadata(&coordinate) {
            properties.insert(
                "coordinate_prefix".to_owned(),
                serde_json::Value::String(metadata.prefix),
            );
            if let Some(parent) = metadata.parent {
                properties.insert(
                    "coordinate_parent".to_owned(),
                    serde_json::Value::String(parent),
                );
            }
            properties.insert(
                "coordinate_axis".to_owned(),
                serde_json::Value::String(metadata.axis),
            );
        }
        properties.insert(
            "artifact_kind".to_owned(),
            serde_json::Value::String(artifact_kind_name(&evidence.artifact_kind).to_owned()),
        );
        if let Some(c_layer) = &evidence.c_layer_evidence {
            insert_property(&mut properties, "type_family", &c_layer.type_family);
            insert_property(&mut properties, "type_path", &c_layer.type_path);
            insert_property(&mut properties, "world_type_path", &c_layer.type_path);
            insert_property(&mut properties, "type_coordinate", &c_layer.type_coordinate);
            insert_property(
                &mut properties,
                "semantic_authority",
                &c_layer.semantic_authority,
            );
            insert_property(
                &mut properties,
                "crystallisation_state",
                &c_layer.crystallisation_state,
            );
            insert_property(&mut properties, "c_layer_path", &c_layer.c_layer_path);
            if let Some(role) = c_layer_role(&c_layer.type_coordinate) {
                insert_property(&mut properties, "c_layer_role", role);
            }
            insert_property(
                &mut properties,
                "graph_evidence_kind",
                graph_evidence_kind(&c_layer.type_coordinate, &c_layer.crystallisation_state),
            );
        }
        insert_string_array_property(&mut properties, "aliases", &evidence.aliases);
        if let Some(candidate_state) = &evidence.candidate_state {
            insert_property(&mut properties, "candidate_state", candidate_state);
        }
        insert_string_array_property(
            &mut properties,
            "accepted_wikilinks",
            &evidence.accepted_wikilinks,
        );
        if let Some(path) = &evidence.source_c_authority_path {
            insert_property(&mut properties, "source_c_authority_path", path);
        }
        if let Some(target) = &evidence.flat_world_target {
            insert_property(&mut properties, "flat_world_target", target);
        }

        if is_world_types_path(&evidence.source_path) {
            insert_string_array_property(
                &mut properties,
                "c_1_source_artifact_span",
                &wikilink_span_pointers(&evidence),
            );
        }

        let mut relation_candidates = relation_candidates;
        relation_candidates.extend(world_root_relation_candidates(&evidence, &coordinate));

        let compatibility_source =
            legacy_coordinate_evidence(&evidence).filter(|legacy| legacy.coordinate != coordinate);

        Ok(Self {
            node: GraphPromotionNode {
                coordinate,
                identity_property: "coordinate".to_owned(),
                vault_path: evidence.source_path.clone(),
                requested_label_hints: label_hints(&evidence),
                properties,
            },
            link_evidence: request.link_evidence,
            frontmatter_evidence: frontmatter_evidence(&evidence),
            property_intelligence_request: Some(property_intelligence_request),
            relation_candidates,
            content_hash: evidence.content_hash,
            markdown_body_hash: evidence.markdown_body_hash,
            compatibility_source_label: compatibility_source
                .as_ref()
                .map(|_| "BimbaCoordinate".to_owned()),
            compatibility_source_property: compatibility_source
                .as_ref()
                .map(|legacy| legacy.property.clone()),
            compatibility_source_coordinate: compatibility_source
                .as_ref()
                .map(|legacy| legacy.coordinate.clone()),
            promotion_source: "hen_compiler_core".to_owned(),
            sync_version: "s1-hen-graph-promotion-v1".to_owned(),
        })
    }
}

fn promotion_class_for_path(path: &str) -> &'static str {
    let normalized = path.replace('\\', "/");
    if normalized.starts_with("Idea/Bimba/World/") {
        "bimba_world_template"
    } else if normalized.starts_with("Idea/Bimba/Seeds/") {
        "canonical_bimba_seed"
    } else if normalized.starts_with("Idea/Empty/Present/") {
        "episodic_temporal_trace"
    } else if normalized.starts_with("Idea/Pratibimba/Self/Thought/") {
        "thought_episode"
    } else if normalized.contains("/S/")
        || normalized.contains("/S'")
        || normalized.starts_with("docs/specs/S/")
        || normalized.starts_with("docs/dev/architecture/")
    {
        "technical_coordinate_doc"
    } else if normalized.contains("/M'")
        || normalized.contains("M-prime")
        || normalized.contains("M4-prime")
        || normalized.contains("m-prime")
    {
        "technical_coordinate_doc"
    } else {
        "manual_review_required"
    }
}

fn leading_property_families_for_path(path: &str) -> [&'static str; 2] {
    let normalized = path.replace('\\', "/");
    if normalized.starts_with("Idea/Bimba/World/") {
        ["q", "c"]
    } else if normalized.contains("/M'")
        || normalized.contains("M-prime")
        || normalized.contains("M4-prime")
        || normalized.contains("m-prime")
    {
        ["m", "c"]
    } else if normalized.starts_with("Idea/Pratibimba/Self/Thought/") {
        ["t", "c"]
    } else {
        ["s", "c"]
    }
}

fn frontmatter_evidence(evidence: &ArtifactEvidence) -> Vec<FrontmatterEvidence> {
    let mut entries = Vec::new();
    if let Some(coordinate) = &evidence.coordinate {
        entries.push(FrontmatterEvidence {
            key: "coordinate".to_owned(),
            value: coordinate.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    if let Some(title) = &evidence.title {
        entries.push(FrontmatterEvidence {
            key: "title".to_owned(),
            value: title.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    for coordinate in &evidence.frontmatter_source_coordinates {
        entries.push(FrontmatterEvidence {
            key: "source_coordinates".to_owned(),
            value: coordinate.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    if let Some(c_layer) = &evidence.c_layer_evidence {
        for (key, value) in [
            ("type_family", &c_layer.type_family),
            ("type_path", &c_layer.type_path),
            ("type_coordinate", &c_layer.type_coordinate),
            ("semantic_authority", &c_layer.semantic_authority),
            ("crystallisation_state", &c_layer.crystallisation_state),
            ("c_layer_path", &c_layer.c_layer_path),
        ] {
            entries.push(FrontmatterEvidence {
                key: key.to_owned(),
                value: value.clone(),
                evidence_kind: "c_first_typology".to_owned(),
            });
        }
    }
    for alias in &evidence.aliases {
        entries.push(FrontmatterEvidence {
            key: "aliases".to_owned(),
            value: alias.clone(),
            evidence_kind: "c_first_typology".to_owned(),
        });
    }
    if let Some(candidate_state) = &evidence.candidate_state {
        entries.push(FrontmatterEvidence {
            key: "candidate_state".to_owned(),
            value: candidate_state.clone(),
            evidence_kind: "c_first_typology".to_owned(),
        });
    }
    for wikilink in &evidence.accepted_wikilinks {
        entries.push(FrontmatterEvidence {
            key: "accepted_wikilinks".to_owned(),
            value: wikilink.clone(),
            evidence_kind: "c_first_typology".to_owned(),
        });
    }
    if let Some(path) = &evidence.source_c_authority_path {
        entries.push(FrontmatterEvidence {
            key: "source_c_authority_path".to_owned(),
            value: path.clone(),
            evidence_kind: "c_first_typology".to_owned(),
        });
    }
    if let Some(target) = &evidence.flat_world_target {
        entries.push(FrontmatterEvidence {
            key: "flat_world_target".to_owned(),
            value: target.clone(),
            evidence_kind: "c_first_typology".to_owned(),
        });
    }
    for (key, value) in &evidence.unknown_frontmatter {
        entries.push(FrontmatterEvidence {
            key: key.clone(),
            value: frontmatter_value_text(value),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    entries
}

fn label_hints(evidence: &ArtifactEvidence) -> Vec<String> {
    let mut hints = Vec::new();

    if evidence.source_path.contains("/Empty/Present/") {
        hints.push("NowSession".to_owned());
    }
    if is_world_path(&evidence.source_path) {
        hints.push("World".to_owned());
        hints.push("Archetypal".to_owned());
    }
    hints
}

fn is_world_path(path: &str) -> bool {
    path.replace('\\', "/").starts_with("Idea/Bimba/World/")
}

fn is_world_types_path(path: &str) -> bool {
    path.replace('\\', "/")
        .starts_with("Idea/Bimba/World/Types/")
}

fn wikilink_span_pointers(evidence: &ArtifactEvidence) -> Vec<String> {
    evidence
        .body_wikilinks
        .iter()
        .map(|link| format!("{}@{}:{}", link.raw_target, link.line, link.column))
        .collect()
}

fn world_root_relation_candidates(
    evidence: &ArtifactEvidence,
    source_coordinate: &str,
) -> Vec<RelationInferenceCandidate> {
    if !is_world_path(&evidence.source_path) {
        return Vec::new();
    }
    let Some(c_layer) = &evidence.c_layer_evidence else {
        return Vec::new();
    };

    let relation_type = if c_layer.type_coordinate == "C4" {
        "WORLD_ONTOLOGY_OF"
    } else {
        "WORLD_FORM_OF"
    };

    vec![RelationInferenceCandidate {
        source_coordinate: source_coordinate.to_owned(),
        target_coordinate: c_layer.type_coordinate.clone(),
        relation_type: relation_type.to_owned(),
        confidence: 1.0,
        evidence_kind: "llm_inference".to_owned(),
        evidence_text: format!(
            "DR-WORLD-1 deterministic World namespace root link from {} to {}.",
            evidence.source_path, c_layer.type_coordinate
        ),
        source_path: Some(evidence.source_path.clone()),
        source_line: None,
        target_text: Some(c_layer.type_coordinate.clone()),
        inferred_by: Some("pi:hen-world-namespace".to_owned()),
        prompt_hash: Some(evidence.content_hash.clone()),
    }]
}

fn artifact_kind_name(kind: &ArtifactKind) -> &str {
    match kind {
        ArtifactKind::VaultMarkdown => "vault_markdown",
        ArtifactKind::Markdown => "markdown",
        ArtifactKind::Unknown(_) => "unknown",
    }
}

fn insert_property(properties: &mut BTreeMap<String, serde_json::Value>, key: &str, value: &str) {
    properties.insert(key.to_owned(), serde_json::Value::String(value.to_owned()));
}

fn insert_string_array_property(
    properties: &mut BTreeMap<String, serde_json::Value>,
    key: &str,
    values: &[String],
) {
    if values.is_empty() {
        return;
    }
    properties.insert(
        key.to_owned(),
        serde_json::Value::Array(
            values
                .iter()
                .cloned()
                .map(serde_json::Value::String)
                .collect(),
        ),
    );
}

fn c_layer_role(coordinate: &str) -> Option<&'static str> {
    match coordinate {
        "C0" => Some("source_ground"),
        "C1" => Some("forms_templates"),
        "C2" => Some("entities_properties_tags"),
        "C3" => Some("processes_canvases_diagrams"),
        "C4" => Some("types_contexts_mocs"),
        "C5" => Some("crystallisations_pratibimba"),
        _ => None,
    }
}

fn graph_evidence_kind(type_coordinate: &str, crystallisation_state: &str) -> &'static str {
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

fn coordinate_promotion_metadata(coordinate: &str) -> Option<CoordinatePromotionMetadata> {
    let first_segment = coordinate.split('/').next()?.trim();
    if first_segment.is_empty() {
        return None;
    }

    let prime = first_segment.ends_with('\'');
    let unprimed = first_segment.strip_suffix('\'').unwrap_or(first_segment);
    let parent_base = unprimed
        .split_once('-')
        .map(|(parent, _)| parent)
        .or_else(|| unprimed.split_once('.').map(|(parent, _)| parent));
    let prefix = match parent_base {
        Some(parent) if prime => format!("{parent}'"),
        Some(parent) => parent.to_owned(),
        None => first_segment.to_owned(),
    };
    Some(CoordinatePromotionMetadata {
        parent: parent_base.map(|parent| {
            if prime {
                format!("{parent}'")
            } else {
                parent.to_owned()
            }
        }),
        prefix,
        axis: if prime { "prime" } else { "direct" }.to_owned(),
    })
}

fn is_promotion_coordinate(coordinate: &str) -> bool {
    coordinate
        .split('/')
        .all(|part| !part.is_empty() && crate::is_valid_coordinate(part))
}

fn legacy_coordinate_evidence(evidence: &ArtifactEvidence) -> Option<LegacyCoordinateEvidence> {
    ["bimbaCoordinate", "bimba_coordinate"]
        .into_iter()
        .find_map(|property| {
            evidence
                .unknown_frontmatter
                .get(property)
                .and_then(serde_yaml::Value::as_str)
                .map(|coordinate| LegacyCoordinateEvidence {
                    property: property.to_owned(),
                    coordinate: coordinate.to_owned(),
                })
        })
}

fn frontmatter_value_text(value: &serde_yaml::Value) -> String {
    value.as_str().map(str::to_owned).unwrap_or_else(|| {
        serde_yaml::to_string(value).unwrap_or_else(|_| "<unprintable>".to_owned())
    })
}
