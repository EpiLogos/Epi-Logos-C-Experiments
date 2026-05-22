use serde::{Deserialize, Serialize};

use crate::artifact_evidence::ArtifactEvidence;
use crate::relation_inference::{build_relation_inference_request, RelationLinkEvidence};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PropertyIntelligenceRequest {
    pub source_coordinate: Option<String>,
    pub source_path: String,
    pub promotion_class: String,
    pub coordinate_property_families: Vec<String>,
    pub leading_property_families: Vec<String>,
    pub known_schema_properties: Vec<String>,
    pub wikilink_evidence: Vec<RelationLinkEvidence>,
    pub frontmatter_evidence: Vec<PropertyFrontmatterEvidence>,
    pub headings: Vec<PropertyHeadingEvidence>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub system_instructions: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct PropertyFrontmatterEvidence {
    pub key: String,
    pub value: String,
    pub evidence_kind: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct PropertyHeadingEvidence {
    pub level: u8,
    pub title: String,
    pub line: usize,
}

pub fn build_property_intelligence_request(
    evidence: &ArtifactEvidence,
    promotion_class: impl Into<String>,
    coordinate_property_families: &[&str],
    leading_property_families: &[&str],
    known_schema_properties: &[&str],
) -> Result<PropertyIntelligenceRequest, String> {
    let wikilink_evidence = match &evidence.coordinate {
        Some(_) => build_relation_inference_request(evidence, &[])?.link_evidence,
        None => Vec::new(),
    };

    Ok(PropertyIntelligenceRequest {
        source_coordinate: evidence.coordinate.clone(),
        source_path: evidence.source_path.clone(),
        promotion_class: promotion_class.into(),
        coordinate_property_families: coordinate_property_families
            .iter()
            .map(|family| (*family).to_owned())
            .collect(),
        leading_property_families: leading_property_families
            .iter()
            .map(|family| (*family).to_owned())
            .collect(),
        known_schema_properties: known_schema_properties
            .iter()
            .map(|property| (*property).to_owned())
            .collect(),
        wikilink_evidence,
        frontmatter_evidence: frontmatter_evidence(evidence),
        headings: evidence
            .headings
            .iter()
            .map(|heading| PropertyHeadingEvidence {
                level: heading.level,
                title: heading.title.clone(),
                line: heading.line,
            })
            .collect(),
        content_hash: evidence.content_hash.clone(),
        markdown_body_hash: evidence.markdown_body_hash.clone(),
        system_instructions: property_intelligence_system_instructions(),
    })
}

fn frontmatter_evidence(evidence: &ArtifactEvidence) -> Vec<PropertyFrontmatterEvidence> {
    let mut entries = Vec::new();
    if let Some(coordinate) = &evidence.coordinate {
        entries.push(PropertyFrontmatterEvidence {
            key: "coordinate".to_owned(),
            value: coordinate.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    if let Some(title) = &evidence.title {
        entries.push(PropertyFrontmatterEvidence {
            key: "title".to_owned(),
            value: title.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    for coordinate in &evidence.frontmatter_source_coordinates {
        entries.push(PropertyFrontmatterEvidence {
            key: "source_coordinates".to_owned(),
            value: coordinate.clone(),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    for (key, value) in &evidence.unknown_frontmatter {
        entries.push(PropertyFrontmatterEvidence {
            key: key.clone(),
            value: frontmatter_value_text(value),
            evidence_kind: "frontmatter".to_owned(),
        });
    }
    entries
}

fn property_intelligence_system_instructions() -> String {
    [
        "Propose query-grade graph properties for the artifact using the full coordinate-driven schema.",
        "Reason over every coordinate family in coordinate_property_families; leading_property_families are hints, not restrictions.",
        "Use the canonical {family}_{position}_{semantic} property form for direct coordinates.",
        "Use i as the only prime/inversion key segment: m_2_i_colour denotes M2'.",
        "Do not emit alternate inversion spellings such as m_2_prime_colour, m_2_inverted_colour, or m_2_inversion_colour.",
        "Consult the S2 coordinate semantics registry before final property selection; Hen evidence is not the coordinate-law authority.",
        "Return evidence-backed property proposals only; do not choose model providers, models, or credentials.",
    ]
    .join(" ")
}

fn frontmatter_value_text(value: &serde_yaml::Value) -> String {
    value.as_str().map(str::to_owned).unwrap_or_else(|| {
        serde_yaml::to_string(value).unwrap_or_else(|_| "<unprintable>".to_owned())
    })
}
