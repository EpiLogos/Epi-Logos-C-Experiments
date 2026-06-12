//! Promotion-plan types and Hen compiler-plan summaries.
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F2. Pure data types
//! plus the conversions into/out of the Hen compiler contract. The dry-run
//! promotion logic and destination-governance helpers remain in the crate root.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use epi_s1_hen_compiler_core::{ExecutorKind, HenTimestamp, TargetAgent};
use epi_s5_epii_review_core::ReviewCategory;

use crate::spine::PromotionDestination;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CompilerInvocationSummary {
    pub executor_kind: String,
    pub target_agent: String,
    pub required_plugin: String,
    pub required_skill: String,
    pub review_policy: String,
    pub mutation_mode: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CompilePlanSummary {
    pub ledger_entries: Vec<String>,
    pub artifacts: Vec<PathBuf>,
    pub errors: Vec<String>,
    pub invocation: Option<CompilerInvocationSummary>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionHenTimestamp {
    pub year: i32,
    pub month: u8,
    pub day: u8,
    pub hour: u8,
    pub minute: u8,
    pub second: u8,
}

impl PromotionHenTimestamp {
    pub const fn new(year: i32, month: u8, day: u8, hour: u8, minute: u8, second: u8) -> Self {
        Self {
            year,
            month,
            day,
            hour,
            minute,
            second,
        }
    }
}

impl From<PromotionHenTimestamp> for HenTimestamp {
    fn from(value: PromotionHenTimestamp) -> Self {
        HenTimestamp::new(
            value.year,
            value.month,
            value.day,
            value.hour,
            value.minute,
            value.second,
        )
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PromoteRequest {
    pub run_id: String,
    pub destination: PromotionDestination,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub legacy_destination: Option<String>,
    pub approved_review_resolution_id: String,
    pub review_store_root: PathBuf,
    pub vault_root: PathBuf,
    pub compiler_root: PathBuf,
    pub artifact_slug: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub requested_at: Option<PromotionHenTimestamp>,
    pub dry_run: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RollbackStep {
    pub step_id: String,
    pub description: String,
    pub evidence_required: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RollbackPlan {
    pub executable: bool,
    pub reason: String,
    pub steps: Vec<RollbackStep>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PromotionPlan {
    pub ok: bool,
    pub dry_run: bool,
    pub run_id: String,
    pub destination: PromotionDestination,
    pub legacy_destination: Option<String>,
    pub governance_category: ReviewCategory,
    pub approved_review_resolution_id: String,
    pub promoted_path: Option<String>,
    pub compile_plan: CompilePlanSummary,
    pub rollback_plan: RollbackPlan,
}

impl From<epi_s1_hen_compiler_core::CompilePlanResponse> for CompilePlanSummary {
    fn from(response: epi_s1_hen_compiler_core::CompilePlanResponse) -> Self {
        Self {
            ledger_entries: response.ledger_entries,
            artifacts: response.artifacts,
            errors: response.errors,
            invocation: response
                .invocation
                .map(|invocation| CompilerInvocationSummary {
                    executor_kind: match invocation.executor_kind {
                        ExecutorKind::PiAgent => "pi_agent",
                        ExecutorKind::Service => "service",
                        ExecutorKind::VendorClaudeSdk => "vendor_claude_sdk",
                    }
                    .to_owned(),
                    target_agent: match invocation.target_agent {
                        TargetAgent::Anima => "anima",
                        TargetAgent::Epii => "epii",
                    }
                    .to_owned(),
                    required_plugin: invocation.required_plugin.to_owned(),
                    required_skill: invocation.required_skill,
                    review_policy: invocation.review_policy.to_owned(),
                    mutation_mode: invocation.mutation_mode.to_owned(),
                }),
        }
    }
}
