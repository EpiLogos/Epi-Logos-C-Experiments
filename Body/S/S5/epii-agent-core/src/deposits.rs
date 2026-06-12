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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DepositRequest {
    pub source_agent: String,
    pub source_coordinate: String,
    pub deposit_type: DepositType,
    pub title: String,
    pub body: String,
    pub artifact: DepositArtifact,
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
