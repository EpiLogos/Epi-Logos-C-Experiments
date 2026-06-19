use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierKernelState {
    pub committed_virtue_mask: u16,
    pub virtue_evidence: [f32; 9],
    pub observed_core_relation_count: u16,
    pub syntax_layer_mask: u16,
    pub active_archetype: u8,
    pub active_tct_position: u8,
    pub slot_privacy_boundary_compliance: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierReportContract {
    pub virtue_witness_vector: u16,
    pub virtue_scores: [f32; 9],
    pub unsatisfied_constraints: Vec<String>,
    pub coherence_score: f32,
    pub slot_privacy_boundary_compliance: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierQuestion {
    pub symbolic_coordinate_string: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierTypedQuery {
    pub surface: String,
    pub law_family: String,
    pub symbolic_coordinate_string: String,
    pub query: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierMembershipRequest {
    pub language_element: String,
    pub registry_cardinality: u16,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VerifierOwlQuery {
    pub query: String,
    pub reasoner: String,
}

pub fn s0_prime_verifier_methods() -> &'static [&'static str] {
    crate::S0_PRIME_VERIFIER_METHODS
}
