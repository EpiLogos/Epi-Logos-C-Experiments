//! CCT-17b (e) — the MemoryGraphRAG three-layer retrieval composition:
//! ontology-filter (relation-family, DR-IG-1) → fact-traverse (span
//! pointers per this CCT) → cosine-rank on the FILTERED passage set. The
//! plan is pure data + pure composition so the splice into
//! `hybrid::HybridRetriever::retrieve()` happens BEFORE cosine ranking;
//! the gateway endpoint (`s5'.gnostic.query_with_layers`) is Track 12's
//! registration and consumes this plan when it lands.

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TriLayerStage {
    /// Layer 1: keep only passages whose relation family survives the
    /// ontology filter (DR-IG-1 relation-family enum).
    OntologyFilter,
    /// Layer 2: traverse facts from the surviving set, carrying
    /// `c_1_source_artifact_span` pointers as evidence anchors.
    FactTraverse,
    /// Layer 3: cosine-rank ONLY the filtered + traversed passage set.
    CosineRank,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct TriLayerRetrievalPlan {
    pub stages: [TriLayerStage; 3],
    /// Relation families the ontology layer admits (empty = admit all).
    pub admitted_relation_families: Vec<String>,
}

impl Default for TriLayerRetrievalPlan {
    fn default() -> Self {
        Self {
            stages: [
                TriLayerStage::OntologyFilter,
                TriLayerStage::FactTraverse,
                TriLayerStage::CosineRank,
            ],
            admitted_relation_families: Vec::new(),
        }
    }
}

/// One candidate passage flowing through the composition.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TriLayerPassage {
    pub coordinate: String,
    pub relation_family: Option<String>,
    /// `c_1_source_artifact_span`-shaped pointers carried as anchors.
    pub span_pointers: Vec<String>,
    pub cosine_score: f64,
}

impl TriLayerRetrievalPlan {
    /// Run the composition over candidate passages. Pure: the ontology
    /// layer FILTERS (never re-ranks), the fact layer keeps only passages
    /// that carry at least one span anchor (facts must be anchored), and
    /// cosine ranks LAST over what survived — ranking never resurrects a
    /// filtered passage.
    pub fn compose(&self, candidates: Vec<TriLayerPassage>) -> Vec<TriLayerPassage> {
        let mut passages = candidates;
        for stage in &self.stages {
            passages = match stage {
                TriLayerStage::OntologyFilter => {
                    if self.admitted_relation_families.is_empty() {
                        passages
                    } else {
                        passages
                            .into_iter()
                            .filter(|passage| {
                                passage.relation_family.as_deref().is_some_and(|family| {
                                    self.admitted_relation_families
                                        .iter()
                                        .any(|admitted| admitted == family)
                                })
                            })
                            .collect()
                    }
                }
                TriLayerStage::FactTraverse => passages
                    .into_iter()
                    .filter(|passage| !passage.span_pointers.is_empty())
                    .collect(),
                TriLayerStage::CosineRank => {
                    let mut ranked = passages;
                    ranked.sort_by(|a, b| {
                        b.cosine_score
                            .partial_cmp(&a.cosine_score)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });
                    ranked
                }
            };
        }
        passages
    }
}
