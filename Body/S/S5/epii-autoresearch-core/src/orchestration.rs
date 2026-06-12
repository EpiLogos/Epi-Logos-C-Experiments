//! Orchestration lifecycle types and cross-cycle continuity DTOs.
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F2. Pure data types;
//! the state-machine logic (`validate_orchestration_transition`,
//! `cross_cycle_continuity_from_state`) and the `ImprovementStore` orchestration
//! methods remain in the crate root.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrchestrationState {
    Queued,
    InReview,
    AwaitingUserValidation,
    Retrying,
    Integrating,
    Verifying,
    Promoted,
    Discarded,
    Abandoned,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewStage {
    Unsubmitted,
    Submitted,
    HumanReview,
    Resolved,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: u8,
    pub attempts: u8,
    pub backoff_ms: u64,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 2,
            attempts: 0,
            backoff_ms: 300_000,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DiscardReason {
    Superseded,
    InsufficientEvidence,
    TimeoutAbandoned,
    HumanRejected,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OrchestrationRecord {
    pub orchestration_id: String,
    pub candidate_id: String,
    pub route_id: String,
    pub improvement_run_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_item_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub promotion_plan_id: Option<String>,
    pub state: OrchestrationState,
    pub review_stage: ReviewStage,
    pub retry_policy: RetryPolicy,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub discard_reason: Option<DiscardReason>,
    pub created_at: u128,
    pub updated_at: u128,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub deadline_at: Option<u128>,
    pub last_transition_reason: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CreateOrchestrationRequest {
    pub candidate_id: String,
    pub route_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_item_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout_after_ms: Option<u128>,
    #[serde(default)]
    pub retry_policy: RetryPolicy,
    pub now_ms: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TransitionOrchestrationRequest {
    pub orchestration_id: String,
    pub next_state: OrchestrationState,
    pub reason: String,
    pub now_ms: u128,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_stage: Option<ReviewStage>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub discard_reason: Option<DiscardReason>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub promotion_plan_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IntegrationVerificationEntry {
    pub orchestration_id: String,
    pub candidate_id: String,
    pub route_id: String,
    pub verify_after_ms: u128,
    pub requirement: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ContinuityHint {
    pub kind: String,
    pub summary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub route_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub orchestration_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CrossCycleContinuity {
    pub continuity_hints: Vec<ContinuityHint>,
    pub pending_articulations: Vec<ContinuityHint>,
    pub pending_integrations: Vec<ContinuityHint>,
    pub user_validation_awaits: Vec<ContinuityHint>,
    pub suppression_windows: Vec<ContinuityHint>,
    pub verification_schedule: Vec<IntegrationVerificationEntry>,
}
