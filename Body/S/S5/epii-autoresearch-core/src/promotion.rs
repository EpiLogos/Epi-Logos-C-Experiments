//! Promotion-plan types, Hen compiler-plan summaries, and the destination /
//! governance validation helpers.
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F2. Pure data types,
//! the conversions into/out of the Hen compiler contract, and the promotion-gate
//! logic (`validate_destination_for_run`, `validate_approved_review`,
//! `rollback_plan_for`, `system_hen_timestamp`, and the destination-classifier
//! helpers) live here beside the `PromoteRequest` / `PromotionPlan` types they
//! guard. The `ImprovementStore::promote` façade reaches them via `promotion::`.

use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use epi_s1_hen_compiler_core::{ExecutorKind, HenTimestamp, TargetAgent};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, ReviewCategory, ReviewDecision, ReviewStore,
};

use crate::spine::{PromotionDestination, TargetSubsystem};
use crate::ImprovementRun;

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

pub(crate) fn validate_destination_for_run(
    run: &ImprovementRun,
    destination: &PromotionDestination,
) -> Result<(), String> {
    let Some(candidate) = run.typed_candidate.as_ref() else {
        return Err("typed candidate is required before promotion".to_owned());
    };
    let expected = destination_target_subsystem(destination);
    if candidate.target_subsystem != expected {
        return Err(format!(
            "promotion destination targets {:?}, not {:?}",
            expected, candidate.target_subsystem
        ));
    }
    if candidate.vector_kind.target_subsystem() != expected {
        return Err(format!(
            "promotion vector targets {:?}, not {:?}",
            candidate.vector_kind.target_subsystem(),
            expected
        ));
    }
    Ok(())
}

pub(crate) fn validate_approved_review(
    review_store_root: &Path,
    approved_review_resolution_id: &str,
    destination: &PromotionDestination,
) -> Result<ReviewCategory, String> {
    let history = ReviewStore::new(review_store_root).history(None)?;
    let resolution = history
        .resolutions
        .iter()
        .find(|resolution| resolution.item_id == approved_review_resolution_id)
        .ok_or_else(|| {
            format!(
                "approved review resolution not found: {approved_review_resolution_id}; use the resolved review item id"
            )
        })?;
    if resolution.decision != ReviewDecision::Approve {
        return Err(format!(
            "review resolution {} is {:?}, not approve",
            approved_review_resolution_id, resolution.decision
        ));
    }

    let item = history
        .items
        .iter()
        .find(|item| item.item_id == resolution.item_id)
        .ok_or_else(|| {
            format!(
                "review resolution {} has no matching review item",
                approved_review_resolution_id
            )
        })?;
    let expected_category = governance_category_for_destination(destination);
    let Some(profile) = item.governance_profile.as_ref() else {
        return Err("promotion review is missing governance_profile".to_owned());
    };
    if profile.category != expected_category {
        return Err(format!(
            "review category {:?} is incompatible with destination category {:?}",
            profile.category, expected_category
        ));
    }
    if !governance_allows_dry_run(profile.gate_kind, profile.governance_level) {
        return Err(format!(
            "review governance {:?}/{:?} does not permit dry-run promotion planning",
            profile.gate_kind, profile.governance_level
        ));
    }
    if let Some(review_destination) = profile.promotion_destination.as_deref() {
        PromotionDestination::validate_legacy_destination(review_destination)?;
        if review_destination != destination_legacy_label(destination) {
            return Err(format!(
                "review destination {review_destination} does not match {}",
                destination_legacy_label(destination)
            ));
        }
    }
    if let Some(resolution_destination) = resolution.promotion_destination.as_deref() {
        PromotionDestination::validate_legacy_destination(resolution_destination)?;
        if resolution_destination != destination_legacy_label(destination) {
            return Err(format!(
                "resolution destination {resolution_destination} does not match {}",
                destination_legacy_label(destination)
            ));
        }
    }
    Ok(expected_category)
}

fn governance_allows_dry_run(gate_kind: GateKind, level: GovernanceLevel) -> bool {
    matches!(
        (gate_kind, level),
        (GateKind::Standard, GovernanceLevel::Advisory)
            | (GateKind::HumanFinal, GovernanceLevel::HumanRequired)
            | (
                GateKind::DeploymentGate,
                GovernanceLevel::DeploymentBlocking
            )
            | (
                GateKind::RecursiveSelfModification,
                GovernanceLevel::RecursiveLoadBearing
            )
            | (GateKind::AnimaPrimary, GovernanceLevel::Advisory)
            | (GateKind::AnimaPrimary, GovernanceLevel::HumanRequired)
            | (
                GateKind::PublicationGate,
                GovernanceLevel::PublicationBlocking
            )
    )
}

fn destination_target_subsystem(destination: &PromotionDestination) -> TargetSubsystem {
    match destination {
        PromotionDestination::AnuttaraOntologyExtension { .. }
        | PromotionDestination::AnuttaraShapeAddition { .. } => TargetSubsystem::Anuttara,
        PromotionDestination::ParamasivaCorpusInclusion { .. }
        | PromotionDestination::ParamasivaVoiceLoRADeployment { .. } => TargetSubsystem::Paramasiva,
        PromotionDestination::ParashaktiEmbeddingDeployment { .. }
        | PromotionDestination::ParashaktiLensLoRADeployment { .. } => TargetSubsystem::Parashakti,
        PromotionDestination::MahamayaPolicyWeightDeployment { .. }
        | PromotionDestination::MahamayaSymbolicProgramRegistration { .. } => {
            TargetSubsystem::Mahamaya
        }
        PromotionDestination::NaraDialogueAdapterDeployment { .. } => TargetSubsystem::Nara,
        PromotionDestination::EpiiAgentConfigDeployment { .. }
        | PromotionDestination::EpiiSpineMechanismUpdate { .. }
        | PromotionDestination::SeedDeposit { .. }
        | PromotionDestination::WorldPromotion { .. }
        | PromotionDestination::PresentScratchpad { .. }
        | PromotionDestination::KernelLawUpdate { .. }
        | PromotionDestination::SpaceTimeDBTableChange { .. }
        | PromotionDestination::SpacedRetrievalReindexing { .. } => TargetSubsystem::Epii,
    }
}

fn governance_category_for_destination(destination: &PromotionDestination) -> ReviewCategory {
    match destination {
        PromotionDestination::WorldPromotion { .. } => ReviewCategory::UserFinalValidation,
        PromotionDestination::KernelLawUpdate { .. }
        | PromotionDestination::SpaceTimeDBTableChange { .. }
        | PromotionDestination::EpiiAgentConfigDeployment { .. } => ReviewCategory::DeploymentGate,
        PromotionDestination::EpiiSpineMechanismUpdate { .. } => {
            ReviewCategory::RecursiveSelfModification
        }
        PromotionDestination::NaraDialogueAdapterDeployment { .. } => {
            ReviewCategory::NaraAnimaPrimaryGate
        }
        PromotionDestination::SpacedRetrievalReindexing { .. } => {
            ReviewCategory::CanonRecognitionPublicationGate
        }
        PromotionDestination::SeedDeposit { .. }
        | PromotionDestination::PresentScratchpad { .. } => ReviewCategory::StandardImprovement,
        _ => ReviewCategory::StandardImprovement,
    }
}

pub(crate) fn target_agent_for_destination(destination: &PromotionDestination) -> TargetAgent {
    match destination {
        PromotionDestination::NaraDialogueAdapterDeployment { .. } => TargetAgent::Anima,
        _ => TargetAgent::Epii,
    }
}

fn destination_legacy_label(destination: &PromotionDestination) -> &'static str {
    match destination {
        PromotionDestination::SeedDeposit { .. } => "seeds",
        PromotionDestination::WorldPromotion { .. } => "world",
        PromotionDestination::PresentScratchpad { .. } => "present",
        PromotionDestination::AnuttaraOntologyExtension { .. } => "anuttara:ontology",
        PromotionDestination::AnuttaraShapeAddition { .. } => "anuttara:shape",
        PromotionDestination::ParamasivaCorpusInclusion { .. } => "paramasiva:corpus",
        PromotionDestination::ParamasivaVoiceLoRADeployment { .. } => "paramasiva:checkpoint",
        PromotionDestination::ParashaktiEmbeddingDeployment { .. } => "parashakti:embedding",
        PromotionDestination::ParashaktiLensLoRADeployment { .. } => "parashakti:lens-lora",
        PromotionDestination::MahamayaPolicyWeightDeployment { .. } => "mahamaya:policy",
        PromotionDestination::MahamayaSymbolicProgramRegistration { .. } => "mahamaya:program",
        PromotionDestination::NaraDialogueAdapterDeployment { .. } => "nara:adapter",
        PromotionDestination::EpiiAgentConfigDeployment { .. } => "epii:agent",
        PromotionDestination::EpiiSpineMechanismUpdate { .. } => "epii:spine",
        PromotionDestination::KernelLawUpdate { .. } => "kernel:law",
        PromotionDestination::SpaceTimeDBTableChange { .. } => "spacetimedb:table",
        PromotionDestination::SpacedRetrievalReindexing { .. } => "sync:publication",
    }
}

pub(crate) fn rollback_plan_for(destination: &PromotionDestination) -> RollbackPlan {
    RollbackPlan {
        executable: false,
        reason: "non-dry-run mutation law is not wired; rollback is metadata only".to_owned(),
        steps: vec![
            RollbackStep {
                step_id: "review-reopen".to_owned(),
                description: format!(
                    "Re-open the {:?} review item and attach failed promotion evidence",
                    governance_category_for_destination(destination)
                ),
                evidence_required: "review item id, compile-plan artifacts, operator note"
                    .to_owned(),
            },
            RollbackStep {
                step_id: "hen-artifact-quarantine".to_owned(),
                description: "Quarantine generated Hen dry-run artifacts from promotion queues"
                    .to_owned(),
                evidence_required: "artifact paths from compile_plan.artifacts".to_owned(),
            },
        ],
    }
}

pub(crate) fn system_hen_timestamp() -> HenTimestamp {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let days = seconds.div_euclid(86_400);
    let seconds_of_day = seconds.rem_euclid(86_400);
    let (year, month, day) = civil_from_unix_days(days);
    HenTimestamp::new(
        year,
        month,
        day,
        (seconds_of_day / 3_600) as u8,
        ((seconds_of_day % 3_600) / 60) as u8,
        (seconds_of_day % 60) as u8,
    )
}

fn civil_from_unix_days(days_since_epoch: i64) -> (i32, u8, u8) {
    let z = days_since_epoch + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 }.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096).div_euclid(365);
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2).div_euclid(153);
    let day = doy - (153 * mp + 2).div_euclid(5) + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    let year = y + if month <= 2 { 1 } else { 0 };
    (year as i32, month as u8, day as u8)
}
