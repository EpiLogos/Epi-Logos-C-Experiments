//! Deposit request/receipt types for the Anima → Epii write-paths.
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F3. Pure data types;
//! the `EpiiAgentAccess::deposit*` impl methods and their validators remain in the
//! crate root, which re-exports everything here via `pub use deposits::*`.

use serde::{Deserialize, Serialize};

use epi_s5_epii_autoresearch_core::{ImprovementCandidate, ImprovementRun};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DepositType {
    ReviewItem,
    ImprovementRequest,
    ValidationGate,
    AletheiaCrystallisation,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DepositArtifact {
    pub path: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
}

/// The deposition anchors a `MediatedRunEvidencePacket` requires and a dispatch
/// run cannot know.
///
/// A run produces its own genealogy — who dispatched what, which tools were
/// invoked, how the gates landed. It does NOT produce the claim being filed:
/// which candidate this is evidence FOR, which review adjudicates it, which
/// test pins it, where it sits in the graph. Those come from whoever files the
/// evidence, so they arrive with the deposit and are carried on its
/// `coordinate_context` — the run half and the claim half meet in the packet,
/// and neither one invents the other.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvidenceAnchors {
    pub candidate_id: String,
    pub graph_anchor: String,
    pub review_id: String,
    pub test_anchor: String,
    pub privacy_class: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DepositRequest {
    pub source_agent: String,
    pub source_coordinate: String,
    pub deposit_type: DepositType,
    pub title: String,
    pub body: String,
    pub artifact: DepositArtifact,
    /// Optional: a deposit that is not evidence for a run carries none, and the
    /// Evidence fold simply has no packet to compose for it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub evidence_anchors: Option<EvidenceAnchors>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub day_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub now_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vault_root: Option<String>,
    pub requires_human: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TypedCandidateDepositRequest {
    pub source_agent: String,
    pub source_coordinate: String,
    pub candidate: ImprovementCandidate,
    pub title: String,
    pub body: String,
    pub requires_human: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DepositReceipt {
    pub review_item: Option<ReviewItemReceipt>,
    pub improvement_run: Option<ImprovementRun>,
    pub inbox_surface: EpiiInboxSurface,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EpiiInboxSurface {
    pub coordinate: String,
    pub inbox_path: Option<String>,
    pub day_id: Option<String>,
    pub now_path: Option<String>,
    pub session_key: Option<String>,
    pub rule: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReviewItemReceipt {
    pub item_id: String,
    pub source: String,
    pub status: String,
    pub requires_human: bool,
}
