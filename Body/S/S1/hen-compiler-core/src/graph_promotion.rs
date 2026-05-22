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
        if let Some(prefix) = coordinate_prefix(&coordinate) {
            properties.insert(
                "coordinate_prefix".to_owned(),
                serde_json::Value::String(prefix),
            );
        }
        properties.insert(
            "artifact_kind".to_owned(),
            serde_json::Value::String(artifact_kind_name(&evidence.artifact_kind).to_owned()),
        );

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
    hints
}

fn artifact_kind_name(kind: &ArtifactKind) -> &str {
    match kind {
        ArtifactKind::VaultMarkdown => "vault_markdown",
        ArtifactKind::Markdown => "markdown",
        ArtifactKind::Unknown(_) => "unknown",
    }
}

fn coordinate_prefix(coordinate: &str) -> Option<String> {
    coordinate
        .split('/')
        .next()
        .filter(|prefix| !prefix.is_empty())
        .map(str::to_owned)
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
