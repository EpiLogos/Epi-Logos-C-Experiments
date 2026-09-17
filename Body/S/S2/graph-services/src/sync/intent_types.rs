use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::property_proposals::PropertyProposal;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct S2GraphPromotionIntent {
    pub node: S2GraphPromotionNode,
    pub link_evidence: Vec<PromotionLinkEvidence>,
    pub frontmatter_evidence: Vec<PromotionFrontmatterEvidence>,
    #[serde(default)]
    pub property_proposals: Vec<PropertyProposal>,
    pub relation_candidates: Vec<PromotionRelationCandidate>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub compatibility_source_label: Option<String>,
    pub compatibility_source_property: Option<String>,
    pub compatibility_source_coordinate: Option<String>,
    pub promotion_source: String,
    pub sync_version: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct S2GraphPromotionNode {
    pub coordinate: String,
    pub identity_property: String,
    pub vault_path: String,
    pub requested_label_hints: Vec<String>,
    pub properties: BTreeMap<String, Value>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PromotionNodeIntent {
    pub coordinate: String,
    pub identity_property: String,
    pub vault_path: String,
}

impl From<S2GraphPromotionNode> for PromotionNodeIntent {
    fn from(node: S2GraphPromotionNode) -> Self {
        Self {
            coordinate: node.coordinate,
            identity_property: node.identity_property,
            vault_path: node.vault_path,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionLinkEvidence {
    pub raw: String,
    pub target_text: String,
    pub alias: Option<String>,
    pub source_path: String,
    pub source_line: usize,
    pub source_column: usize,
    pub context: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionFrontmatterEvidence {
    pub key: String,
    pub value: String,
    pub evidence_kind: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PromotionRelationCandidate {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub relation_type: String,
    pub confidence: f64,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub target_text: Option<String>,
    pub inferred_by: Option<String>,
    pub prompt_hash: Option<String>,
}
