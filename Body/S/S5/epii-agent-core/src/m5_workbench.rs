//! M5'-extension workbench DTOs (the `M5*Dto` family).
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F3. Pure data types
//! consumed by the M5' Theia surface. The conversion functions that build them
//! (`review_item_dto`, `candidate_detail_dto`, `m5_artifact_ref_from_uri`, …) and
//! the snapshot DTOs they reference (`RouteQueueSummary`, `OrchestrationAccessSummary`,
//! `ReviewGateSummary`) remain in the crate root, re-exporting this module via
//! `pub use m5_workbench::*`.

use serde::{Deserialize, Serialize};

use epi_s5_epii_autoresearch_core::{ContinuityHint, M2PrimeMeaningPacket, TargetSubsystem};
use epi_s5_epii_review_core::ReviewCategory;

use crate::{OrchestrationAccessSummary, ReviewGateSummary, RouteQueueSummary};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5WorkbenchSnapshot {
    pub schema_version: u16,
    pub review_pane: M5ReviewPaneDto,
    pub spine_state: M5SpineStateDto,
    pub route_queues: Vec<RouteQueueSummary>,
    pub candidate_details: Vec<M5CandidateDetailDto>,
    pub continuity_hints: Vec<ContinuityHint>,
    pub promotion_dry_run_results: Vec<M5PromotionDryRunDto>,
    pub compatibility_aliases: Vec<M5CompatibilityAlias>,
    pub gateway_methods: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5ReviewPaneDto {
    pub open_items: Vec<M5ReviewItemDto>,
    pub deferred_items: Vec<M5ReviewItemDto>,
    pub resolved_items: Vec<M5ReviewItemDto>,
    pub pending_human_validations: Vec<ReviewGateSummary>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5ReviewItemDto {
    pub item_id: String,
    pub title: String,
    pub source: String,
    pub status: String,
    pub priority: String,
    pub requires_human: bool,
    pub governance_category: Option<ReviewCategory>,
    pub target_subsystem: Option<String>,
    pub vector_kind: Option<String>,
    pub promotion_destination: Option<String>,
    pub artifact_refs: Vec<M5ArtifactRefDto>,
    pub readiness: String,
    pub created_at: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5SpineStateDto {
    pub active_count: usize,
    pub total_runs: usize,
    pub keep_count: usize,
    pub discard_count: usize,
    pub kernel_evidence_count: usize,
    pub orchestration_summary: OrchestrationAccessSummary,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5CandidateDetailDto {
    pub candidate_id: String,
    pub run_id: String,
    pub target_subsystem: TargetSubsystem,
    pub vector_kind: String,
    pub surfacing_pipeline: String,
    pub source_artifact: M5ArtifactRefDto,
    pub baseline_artifact: M5ArtifactRefDto,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub challenger_artifact: Option<M5ArtifactRefDto>,
    pub observation_summary: String,
    pub sensitivity_class: String,
    pub readiness: String,
    pub review_required: bool,
    pub closure_kind: String,
    pub ct_register: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub m2_meaning_packet: Option<M2PrimeMeaningPacket>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct M5ArtifactRefDto {
    pub uri: String,
    pub namespace: M5ArtifactNamespace,
    pub label: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
    pub privacy: String,
    pub readiness: String,
    pub review_required: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum M5ArtifactNamespace {
    Vault,
    Repo,
    GraphBimba,
    Gnosis,
    Etymology,
    Pratibimba,
    Run,
    Review,
    Improvement,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct M5CompatibilityAlias {
    pub legacy_ui_name: String,
    pub canonical_name: String,
    pub canonical_uri_prefix: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M5PromotionDryRunDto {
    pub run_id: String,
    pub destination: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub legacy_destination: Option<String>,
    pub governance_category: ReviewCategory,
    pub approved_review_resolution_id: String,
    pub ok: bool,
    pub dry_run: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub promoted_path: Option<String>,
    pub compile_artifacts: Vec<M5ArtifactRefDto>,
    pub compile_errors: Vec<String>,
    pub rollback_executable: bool,
    pub rollback_reason: String,
}
