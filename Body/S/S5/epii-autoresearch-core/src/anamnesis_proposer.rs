//! Tier 2 self-awareness tuning proposal scaffold for the Epii autoresearch loop.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceWindow {
    pub session_ids: Vec<String>,
    pub mahamaya_transcription_chains: Vec<String>,
    pub mythos_archetype_readings: Vec<String>,
    pub sophia_review_outcomes: Vec<String>,
    pub hen_birth_codon_clusters: Vec<String>,
}

impl EvidenceWindow {
    pub fn empty() -> Self {
        Self {
            session_ids: vec![],
            mahamaya_transcription_chains: vec![],
            mythos_archetype_readings: vec![],
            sophia_review_outcomes: vec![],
            hen_birth_codon_clusters: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TuningProposal {
    pub knob_key: String,
    pub from_value: serde_json::Value,
    pub to_value: serde_json::Value,
    pub proposing_evidence: Vec<String>,
    /// 2 for self-awareness; 3 for ML-training-derived proposals.
    pub tier: u8,
}

pub struct AnamnesisProposer {}

impl AnamnesisProposer {
    pub fn new() -> Self {
        Self {}
    }

    pub fn propose_from_evidence(&self, _evidence: &EvidenceWindow) -> Vec<TuningProposal> {
        Vec::new()
    }
}
