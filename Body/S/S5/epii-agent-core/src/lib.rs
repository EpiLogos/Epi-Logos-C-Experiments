use std::path::{Path, PathBuf};

use epi_s5_epii_autoresearch_core::{
    ArtifactRef, CandidateRecord, ContinuityHint, CrossCycleContinuity, ImprovementCandidate,
    ImprovementRun, ImprovementStore, ImprovementVector, OrchestrationRecord, PromoteRequest,
    PromotionPlan, ProposeRequest, RouteRecord, SurfacedCandidateReceipt, TargetSubsystem,
};
use epi_s5_epii_review_core::{
    GovernanceLevel, ReviewCategory, ReviewHistory, ReviewInbox, ReviewInboxFilter,
    ReviewInboxItem, ReviewPriority, ReviewProposedAction, ReviewResolution, ReviewResolveRequest,
    ReviewSource, ReviewStatus, ReviewStore, ReviewSubmission,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub const M5_WORKBENCH_SCHEMA_VERSION: u16 = 1;

#[derive(Debug, Clone)]
pub struct EpiiAgentAccess {
    state_root: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EpiiAgentSnapshot {
    pub agent_id: String,
    pub coordinate: String,
    pub relation_to_anima: String,
    pub review: ReviewAccessSnapshot,
    pub improvement: ImprovementAccessSnapshot,
    pub gateway_methods: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReviewAccessSnapshot {
    pub open_count: usize,
    pub deferred_count: usize,
    pub resolved_count: usize,
    pub human_required_count: usize,
    pub governance_gate_counts: GovernanceGateCounts,
    pub pending_human_validations: Vec<ReviewGateSummary>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementAccessSnapshot {
    pub active_count: usize,
    pub active_vectors: Vec<ImprovementVector>,
    pub active_candidates: Vec<CandidateSummary>,
    pub route_queues: Vec<RouteQueueSummary>,
    pub orchestration_summary: OrchestrationAccessSummary,
    pub continuity_hints: Vec<ContinuityHint>,
    pub latest_promotion_plan_ids: Vec<String>,
    pub total_runs: usize,
    pub keep_count: usize,
    pub discard_count: usize,
    pub kernel_evidence_count: usize,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct GovernanceGateCounts {
    pub standard_improvement: usize,
    pub deployment_gate: usize,
    pub user_final_validation: usize,
    pub recursive_self_modification: usize,
    pub nara_anima_primary_gate: usize,
    pub aletheia_crystallisation: usize,
    pub canon_recognition_publication_gate: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReviewGateSummary {
    pub item_id: String,
    pub category: ReviewCategory,
    pub governance_level: GovernanceLevel,
    pub target_subsystem: Option<String>,
    pub vector_kind: Option<String>,
    pub promotion_destination: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CandidateSummary {
    pub candidate_id: String,
    pub run_id: String,
    pub target_subsystem: TargetSubsystem,
    pub vector_kind: String,
    pub source_uri: String,
    pub sensitivity_class: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RouteQueueSummary {
    pub queue: String,
    pub open: usize,
    pub blocked: usize,
    pub total: usize,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct OrchestrationAccessSummary {
    pub total: usize,
    pub queued: usize,
    pub in_review: usize,
    pub awaiting_user_validation: usize,
    pub retrying: usize,
    pub integrating: usize,
    pub verifying: usize,
    pub promoted: usize,
    pub discarded: usize,
    pub abandoned: usize,
}

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

impl EpiiAgentAccess {
    pub fn new(state_root: impl AsRef<Path>) -> Self {
        Self {
            state_root: state_root.as_ref().to_path_buf(),
        }
    }

    pub fn snapshot(&self) -> Result<EpiiAgentSnapshot, String> {
        let open_inbox = self.review_store().inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: None,
            limit: None,
        })?;
        let deferred_inbox = self.review_store().inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Deferred),
            source: None,
            limit: None,
        })?;
        let history = self.review_store().history(None)?;
        let improve_status = self.improvement_store().status()?;
        let candidates = self.improvement_store().candidates()?;
        let routes = self.improvement_store().routes()?;
        let orchestrations = self.improvement_store().orchestrations()?;
        let continuity = self.improvement_store().cross_cycle_continuity(now_ms())?;
        let active_candidates = candidates
            .iter()
            .filter(|candidate| {
                improve_status
                    .active_vectors
                    .iter()
                    .any(|vector| vector.run_id == candidate.run_id)
            })
            .map(candidate_summary)
            .collect();

        Ok(EpiiAgentSnapshot {
            agent_id: "epii".to_owned(),
            coordinate: "S5/S5'".to_owned(),
            relation_to_anima: "peer_pi_agent".to_owned(),
            review: ReviewAccessSnapshot {
                human_required_count: open_inbox
                    .items
                    .iter()
                    .chain(deferred_inbox.items.iter())
                    .filter(|item| item.requires_human)
                    .count(),
                open_count: open_inbox.items.len(),
                deferred_count: deferred_inbox.items.len(),
                resolved_count: history.resolutions.len(),
                governance_gate_counts: governance_gate_counts(
                    open_inbox.items.iter().chain(deferred_inbox.items.iter()),
                ),
                pending_human_validations: pending_human_validations(
                    open_inbox.items.iter().chain(deferred_inbox.items.iter()),
                ),
            },
            improvement: ImprovementAccessSnapshot {
                active_count: improve_status.active_vectors.len(),
                active_vectors: improve_status.active_vectors,
                active_candidates,
                route_queues: route_queue_summary(&routes),
                orchestration_summary: orchestration_summary(&orchestrations),
                continuity_hints: continuity.continuity_hints,
                latest_promotion_plan_ids: latest_promotion_plan_ids(&orchestrations),
                total_runs: improve_status.total_runs,
                keep_count: improve_status.keep_count,
                discard_count: improve_status.discard_count,
                kernel_evidence_count: improve_status.kernel_evidence_count,
            },
            gateway_methods: gateway_methods(),
        })
    }

    pub fn m5_workbench_snapshot(&self) -> Result<M5WorkbenchSnapshot, String> {
        let open_inbox = self.review_store().inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: None,
            limit: None,
        })?;
        let deferred_inbox = self.review_store().inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Deferred),
            source: None,
            limit: None,
        })?;
        let history = self.review_store().history(None)?;
        let improve_status = self.improvement_store().status()?;
        let candidates = self.improvement_store().candidates()?;
        let routes = self.improvement_store().routes()?;
        let orchestrations = self.improvement_store().orchestrations()?;
        let continuity = self.improvement_store().cross_cycle_continuity(now_ms())?;

        Ok(M5WorkbenchSnapshot {
            schema_version: M5_WORKBENCH_SCHEMA_VERSION,
            review_pane: M5ReviewPaneDto {
                open_items: open_inbox
                    .items
                    .iter()
                    .map(review_item_dto)
                    .collect::<Result<Vec<_>, _>>()?,
                deferred_items: deferred_inbox
                    .items
                    .iter()
                    .map(review_item_dto)
                    .collect::<Result<Vec<_>, _>>()?,
                resolved_items: history
                    .items
                    .iter()
                    .map(review_item_dto)
                    .collect::<Result<Vec<_>, _>>()?,
                pending_human_validations: pending_human_validations(
                    open_inbox.items.iter().chain(deferred_inbox.items.iter()),
                ),
            },
            spine_state: M5SpineStateDto {
                active_count: improve_status.active_vectors.len(),
                total_runs: improve_status.total_runs,
                keep_count: improve_status.keep_count,
                discard_count: improve_status.discard_count,
                kernel_evidence_count: improve_status.kernel_evidence_count,
                orchestration_summary: orchestration_summary(&orchestrations),
            },
            route_queues: route_queue_summary(&routes),
            candidate_details: candidates
                .iter()
                .map(candidate_detail_dto)
                .collect::<Result<Vec<_>, _>>()?,
            continuity_hints: continuity.continuity_hints,
            promotion_dry_run_results: Vec::new(),
            compatibility_aliases: m5_compatibility_aliases(),
            gateway_methods: gateway_methods(),
        })
    }

    pub fn deposit(&self, request: DepositRequest) -> Result<DepositReceipt, String> {
        validate_deposit(&request)?;
        let review_item = self.review_store().submit(ReviewSubmission {
            source: review_source(&request.source_agent)?,
            title: request.title.clone(),
            body: request.body.clone(),
            priority: priority_for_deposit(&request),
            coordinate_context: json!({
                "source_agent": request.source_agent,
                "source_coordinate": request.source_coordinate,
                "deposit_type": request.deposit_type,
                "artifact": request.artifact,
                "day_id": request.day_id,
                "now_path": request.now_path,
                "session_key": request.session_key,
                "inbox_path": day_inbox_path(&request),
            }),
            proposed_action: Some(ReviewProposedAction {
                kind: proposed_action_kind(&request.deposit_type).to_owned(),
                target: Some(json!(request.artifact)),
                destination: Some("epii".to_owned()),
                payload: None,
            }),
            requires_human: request.requires_human,
            kernel_visibility: None,
            governance_profile: None,
        })?;

        let improvement_run = if request.deposit_type == DepositType::ImprovementRequest {
            Some(
                self.improvement_store().propose(ProposeRequest {
                    target_family: "S".to_owned(),
                    target_coordinate: request
                        .artifact
                        .coordinate
                        .clone()
                        .unwrap_or_else(|| "S5/S5'".to_owned()),
                    direction: request.body.clone(),
                    source_review_item_id: Some(review_item.item_id.clone()),
                    baseline: ArtifactRef {
                        path: request.artifact.path.clone(),
                        coordinate: request.artifact.coordinate.clone(),
                        kind: request.artifact.kind.clone(),
                    },
                })?,
            )
        } else {
            None
        };

        Ok(DepositReceipt {
            review_item: Some(review_receipt(&review_item)),
            improvement_run,
            inbox_surface: inbox_surface(&request),
        })
    }

    pub fn deposit_typed_candidate(
        &self,
        request: TypedCandidateDepositRequest,
    ) -> Result<SurfacedCandidateReceipt, String> {
        validate_typed_candidate_deposit(&request)?;
        let surfaced = self
            .improvement_store()
            .surface_candidate(request.candidate.clone())?;
        self.review_store().submit(ReviewSubmission {
            source: review_source(&request.source_agent)?,
            title: request.title,
            body: request.body,
            priority: if request.requires_human {
                ReviewPriority::Blocking
            } else {
                ReviewPriority::High
            },
            coordinate_context: json!({
                "source_agent": request.source_agent,
                "source_coordinate": request.source_coordinate,
                "candidate_id": surfaced.candidate.candidate_id,
                "run_id": surfaced.run.run_id,
                "target_subsystem": surfaced.candidate.candidate.target_subsystem,
            }),
            proposed_action: Some(ReviewProposedAction {
                kind: "typed_improvement_candidate".to_owned(),
                target: Some(json!({
                    "candidate_id": surfaced.candidate.candidate_id,
                    "run_id": surfaced.run.run_id,
                })),
                destination: Some("epii".to_owned()),
                payload: None,
            }),
            requires_human: request.requires_human,
            kernel_visibility: None,
            governance_profile: None,
        })?;
        Ok(surfaced)
    }

    pub fn submit_review(&self, submission: ReviewSubmission) -> Result<ReviewInboxItem, String> {
        self.review_store().submit(submission)
    }

    pub fn review_inbox(&self, filter: ReviewInboxFilter) -> Result<ReviewInbox, String> {
        self.review_store().inbox(filter)
    }

    pub fn resolve_review(
        &self,
        source_agent: &str,
        request: ReviewResolveRequest,
    ) -> Result<ReviewResolution, String> {
        match source_agent {
            "human" | "epii" => self.review_store().resolve(request),
            "anima" | "aletheia" => Err(format!(
                "{source_agent} may deposit review material but cannot resolve Epii gates"
            )),
            other => Err(format!("unsupported Epii review resolver: {other}")),
        }
    }

    pub fn review_history(&self, limit: Option<usize>) -> Result<ReviewHistory, String> {
        self.review_store().history(limit)
    }

    pub fn spine_state(&self, now_ms: u128) -> Result<CrossCycleContinuity, String> {
        self.improvement_store().cross_cycle_continuity(now_ms)
    }

    pub fn route_detail(&self, route_id: &str) -> Result<RouteRecord, String> {
        if route_id.trim().is_empty() {
            return Err("route_id is required".to_owned());
        }
        self.improvement_store()
            .routes()?
            .into_iter()
            .find(|route| route.route_id == route_id)
            .ok_or_else(|| format!("route not found: {route_id}"))
    }

    pub fn plan_promotion_dry_run(&self, request: PromoteRequest) -> Result<PromotionPlan, String> {
        if !request.dry_run {
            return Err("Epii agent access only exposes dry-run promotion planning".to_owned());
        }
        self.improvement_store().promote(request)
    }

    pub fn m5_promotion_dry_run(
        &self,
        request: PromoteRequest,
    ) -> Result<M5PromotionDryRunDto, String> {
        let plan = self.plan_promotion_dry_run(request)?;
        promotion_dry_run_dto(&plan)
    }

    fn review_store(&self) -> ReviewStore {
        ReviewStore::new(self.state_root.join("s5").join("epii-review"))
    }

    fn improvement_store(&self) -> ImprovementStore {
        ImprovementStore::new(self.state_root.join("s5").join("epii-autoresearch"))
    }
}

fn validate_deposit(request: &DepositRequest) -> Result<(), String> {
    if request.source_agent.trim().is_empty() {
        return Err("source_agent is required".to_owned());
    }
    if request.source_coordinate.trim().is_empty() {
        return Err("source_coordinate is required".to_owned());
    }
    if request.title.trim().is_empty() {
        return Err("deposit title is required".to_owned());
    }
    if request.body.trim().is_empty() {
        return Err("deposit body is required".to_owned());
    }
    if request.artifact.path.trim().is_empty() {
        return Err("deposit artifact path is required".to_owned());
    }
    if let Some(day_id) = &request.day_id {
        if day_id.trim().is_empty() {
            return Err("deposit day_id must not be blank when provided".to_owned());
        }
    }
    Ok(())
}

fn validate_typed_candidate_deposit(request: &TypedCandidateDepositRequest) -> Result<(), String> {
    if request.source_agent.trim().is_empty() {
        return Err("source_agent is required".to_owned());
    }
    if request.source_coordinate.trim().is_empty() {
        return Err("source_coordinate is required".to_owned());
    }
    if request.title.trim().is_empty() {
        return Err("deposit title is required".to_owned());
    }
    if request.body.trim().is_empty() {
        return Err("deposit body is required".to_owned());
    }
    request.candidate.validate()
}

fn inbox_surface(request: &DepositRequest) -> EpiiInboxSurface {
    EpiiInboxSurface {
        coordinate: "S5/S5'".to_owned(),
        inbox_path: day_inbox_path(request),
        day_id: request.day_id.clone(),
        now_path: request.now_path.clone(),
        session_key: request.session_key.clone(),
        rule: "Epii inbox items live at Idea/Empty/Present/{day-date}/ and carry NOW/session lineage in metadata".to_owned(),
    }
}

fn day_inbox_path(request: &DepositRequest) -> Option<String> {
    let day_id = request.day_id.as_deref()?.trim();
    let vault_root = request.vault_root.as_deref().unwrap_or("Idea").trim();
    if day_id.is_empty() {
        return None;
    }
    Some(format!(
        "{}/Empty/Present/{}/",
        vault_root.trim_end_matches('/'),
        day_id
    ))
}

fn review_source(source_agent: &str) -> Result<ReviewSource, String> {
    match source_agent {
        "anima" => Ok(ReviewSource::Anima),
        "aletheia" => Ok(ReviewSource::Aletheia),
        "autoresearch" | "epii-autoresearch" => Ok(ReviewSource::Autoresearch),
        "human" | "human_gate" => Ok(ReviewSource::HumanGate),
        other => Err(format!("unsupported Epii deposit source_agent: {other}")),
    }
}

fn priority_for_deposit(request: &DepositRequest) -> ReviewPriority {
    match request.deposit_type {
        DepositType::ValidationGate if request.requires_human => ReviewPriority::Blocking,
        DepositType::ValidationGate => ReviewPriority::High,
        DepositType::ImprovementRequest => ReviewPriority::High,
        DepositType::AletheiaCrystallisation => ReviewPriority::Normal,
        DepositType::ReviewItem => ReviewPriority::Normal,
    }
}

fn proposed_action_kind(deposit_type: &DepositType) -> &'static str {
    match deposit_type {
        DepositType::ReviewItem => "review",
        DepositType::ImprovementRequest => "improvement_request",
        DepositType::ValidationGate => "validation_gate",
        DepositType::AletheiaCrystallisation => "aletheia_crystallisation",
    }
}

fn review_receipt(item: &ReviewInboxItem) -> ReviewItemReceipt {
    ReviewItemReceipt {
        item_id: item.item_id.clone(),
        source: match item.source {
            ReviewSource::HumanGate => "human_gate",
            ReviewSource::Anima => "anima",
            ReviewSource::Aletheia => "aletheia",
            ReviewSource::Autoresearch => "autoresearch",
        }
        .to_owned(),
        status: match item.status {
            ReviewStatus::Open => "open",
            ReviewStatus::Resolved => "resolved",
            ReviewStatus::Deferred => "deferred",
        }
        .to_owned(),
        requires_human: item.requires_human,
    }
}

fn governance_gate_counts<'a>(
    items: impl Iterator<Item = &'a ReviewInboxItem>,
) -> GovernanceGateCounts {
    let mut counts = GovernanceGateCounts::default();
    for item in items {
        let Some(profile) = item.governance_profile.as_ref() else {
            continue;
        };
        match profile.category {
            ReviewCategory::StandardImprovement => counts.standard_improvement += 1,
            ReviewCategory::DeploymentGate => counts.deployment_gate += 1,
            ReviewCategory::UserFinalValidation => counts.user_final_validation += 1,
            ReviewCategory::RecursiveSelfModification => counts.recursive_self_modification += 1,
            ReviewCategory::NaraAnimaPrimaryGate => counts.nara_anima_primary_gate += 1,
            ReviewCategory::AletheiaCrystallisation => counts.aletheia_crystallisation += 1,
            ReviewCategory::CanonRecognitionPublicationGate => {
                counts.canon_recognition_publication_gate += 1
            }
        }
    }
    counts
}

fn pending_human_validations<'a>(
    items: impl Iterator<Item = &'a ReviewInboxItem>,
) -> Vec<ReviewGateSummary> {
    items
        .filter(|item| item.requires_human)
        .filter_map(|item| {
            let profile = item.governance_profile.as_ref()?;
            Some(ReviewGateSummary {
                item_id: item.item_id.clone(),
                category: profile.category,
                governance_level: profile.governance_level,
                target_subsystem: profile.target_subsystem.clone(),
                vector_kind: profile.vector_kind.clone(),
                promotion_destination: profile.promotion_destination.clone(),
            })
        })
        .collect()
}

fn candidate_summary(record: &CandidateRecord) -> CandidateSummary {
    CandidateSummary {
        candidate_id: record.candidate_id.clone(),
        run_id: record.run_id.clone(),
        target_subsystem: record.candidate.target_subsystem,
        vector_kind: format!("{:?}", record.candidate.vector_kind),
        source_uri: record.candidate.observation_evidence.source_uri.clone(),
        sensitivity_class: format!("{:?}", record.candidate.sensitivity_class),
    }
}

fn route_queue_summary(routes: &[RouteRecord]) -> Vec<RouteQueueSummary> {
    let mut summaries = Vec::<RouteQueueSummary>::new();
    for route in routes {
        let summary = if let Some(summary) = summaries
            .iter_mut()
            .find(|summary| summary.queue == route.queue)
        {
            summary
        } else {
            summaries.push(RouteQueueSummary {
                queue: route.queue.clone(),
                open: 0,
                blocked: 0,
                total: 0,
            });
            summaries.last_mut().expect("summary just pushed")
        };
        summary.total += 1;
        match format!("{:?}", route.status).as_str() {
            "Open" => summary.open += 1,
            "Blocked" => summary.blocked += 1,
            _ => {}
        }
    }
    summaries.sort_by(|left, right| left.queue.cmp(&right.queue));
    summaries
}

fn orchestration_summary(orchestrations: &[OrchestrationRecord]) -> OrchestrationAccessSummary {
    let mut summary = OrchestrationAccessSummary {
        total: orchestrations.len(),
        ..OrchestrationAccessSummary::default()
    };
    for record in orchestrations {
        match format!("{:?}", record.state).as_str() {
            "Queued" => summary.queued += 1,
            "InReview" => summary.in_review += 1,
            "AwaitingUserValidation" => summary.awaiting_user_validation += 1,
            "Retrying" => summary.retrying += 1,
            "Integrating" => summary.integrating += 1,
            "Verifying" => summary.verifying += 1,
            "Promoted" => summary.promoted += 1,
            "Discarded" => summary.discarded += 1,
            "Abandoned" => summary.abandoned += 1,
            _ => {}
        }
    }
    summary
}

fn latest_promotion_plan_ids(orchestrations: &[OrchestrationRecord]) -> Vec<String> {
    let mut plans = orchestrations
        .iter()
        .filter_map(|record| record.promotion_plan_id.clone())
        .collect::<Vec<_>>();
    plans.sort();
    plans.dedup();
    plans
}

fn review_item_dto(item: &ReviewInboxItem) -> Result<M5ReviewItemDto, String> {
    let governance = item.governance_profile.as_ref();
    Ok(M5ReviewItemDto {
        item_id: item.item_id.clone(),
        title: item.title.clone(),
        source: review_source_label(item.source).to_owned(),
        status: review_status_label(item.status).to_owned(),
        priority: review_priority_label(item.priority).to_owned(),
        requires_human: item.requires_human,
        governance_category: governance.map(|profile| profile.category),
        target_subsystem: governance.and_then(|profile| profile.target_subsystem.clone()),
        vector_kind: governance.and_then(|profile| profile.vector_kind.clone()),
        promotion_destination: governance.and_then(|profile| profile.promotion_destination.clone()),
        artifact_refs: review_artifact_refs(item)?,
        readiness: if item.requires_human {
            "awaiting_human_validation"
        } else {
            "ready_for_epii_review"
        }
        .to_owned(),
        created_at: item.created_at,
    })
}

fn review_artifact_refs(item: &ReviewInboxItem) -> Result<Vec<M5ArtifactRefDto>, String> {
    let mut refs = Vec::new();
    if let Some(profile) = item.governance_profile.as_ref() {
        for uri in &profile.source_artifact_refs {
            refs.push(m5_artifact_ref_from_uri(
                uri,
                None,
                Some("governance_source".to_owned()),
                item.requires_human,
            )?);
        }
    }
    if let Some(proposed) = item.proposed_action.as_ref() {
        collect_json_artifact_refs(proposed.target.as_ref(), item.requires_human, &mut refs)?;
        collect_json_artifact_refs(proposed.payload.as_ref(), item.requires_human, &mut refs)?;
    }
    Ok(refs)
}

fn collect_json_artifact_refs(
    value: Option<&Value>,
    review_required: bool,
    refs: &mut Vec<M5ArtifactRefDto>,
) -> Result<(), String> {
    let Some(value) = value else {
        return Ok(());
    };
    match value {
        Value::Object(map) => {
            for key in ["uri", "path", "source_uri", "artifact_uri"] {
                if let Some(uri) = map.get(key).and_then(Value::as_str) {
                    refs.push(m5_artifact_ref_from_uri(
                        uri,
                        None,
                        Some(key.to_owned()),
                        review_required,
                    )?);
                }
            }
            for child in map.values() {
                collect_json_artifact_refs(Some(child), review_required, refs)?;
            }
        }
        Value::Array(values) => {
            for child in values {
                collect_json_artifact_refs(Some(child), review_required, refs)?;
            }
        }
        _ => {}
    }
    Ok(())
}

fn candidate_detail_dto(record: &CandidateRecord) -> Result<M5CandidateDetailDto, String> {
    let candidate = &record.candidate;
    let review_required = !matches!(
        candidate.sensitivity_class,
        epi_s5_epii_autoresearch_core::SensitivityClass::PublicCurrent
    );
    Ok(M5CandidateDetailDto {
        candidate_id: record.candidate_id.clone(),
        run_id: record.run_id.clone(),
        target_subsystem: candidate.target_subsystem,
        vector_kind: format!("{:?}", candidate.vector_kind),
        surfacing_pipeline: format!("{:?}", candidate.surfacing_pipeline),
        source_artifact: m5_artifact_ref_from_uri(
            &candidate.observation_evidence.source_uri,
            Some(candidate.propose.target_coordinate.clone()),
            Some("observation_source".to_owned()),
            review_required,
        )?,
        baseline_artifact: m5_artifact_ref_from_artifact(
            &candidate.propose.baseline,
            review_required,
        )?,
        challenger_artifact: candidate
            .challenger_artifact
            .as_ref()
            .map(|artifact| m5_artifact_ref_from_artifact(artifact, review_required))
            .transpose()?,
        observation_summary: candidate.observation_evidence.summary.clone(),
        sensitivity_class: format!("{:?}", candidate.sensitivity_class),
        readiness: if review_required {
            "handle_only_review_required"
        } else {
            "public_current"
        }
        .to_owned(),
        review_required,
        closure_kind: format!("{:?}", candidate.closure_kind),
        ct_register: format!("{:?}", candidate.ct_register),
    })
}

fn m5_artifact_ref_from_artifact(
    artifact: &ArtifactRef,
    review_required: bool,
) -> Result<M5ArtifactRefDto, String> {
    m5_artifact_ref_from_uri(
        &artifact.path,
        artifact.coordinate.clone(),
        artifact.kind.clone(),
        review_required,
    )
}

fn m5_artifact_ref_from_uri(
    raw_uri: &str,
    coordinate: Option<String>,
    kind: Option<String>,
    review_required: bool,
) -> Result<M5ArtifactRefDto, String> {
    let (uri, namespace) = normalize_m5_artifact_uri(raw_uri)?;
    Ok(M5ArtifactRefDto {
        label: artifact_label(&uri),
        uri,
        namespace,
        coordinate,
        kind,
        privacy: if review_required {
            "protected_handle_or_review_required"
        } else {
            "public_current"
        }
        .to_owned(),
        readiness: if review_required {
            "opaque_handle"
        } else {
            "direct_reference"
        }
        .to_owned(),
        review_required,
    })
}

pub fn validate_m5_artifact_uri(uri: &str) -> Result<M5ArtifactNamespace, String> {
    let trimmed = uri.trim();
    if trimmed.is_empty() {
        return Err("artifact URI is required".to_owned());
    }
    if trimmed.starts_with('/') {
        return Err("artifact URI must use a namespace prefix, not an absolute path".to_owned());
    }
    if trimmed.starts_with("vault://") {
        Ok(M5ArtifactNamespace::Vault)
    } else if trimmed.starts_with("repo://") {
        Ok(M5ArtifactNamespace::Repo)
    } else if trimmed.starts_with("graph://bimba/") {
        Ok(M5ArtifactNamespace::GraphBimba)
    } else if trimmed.starts_with("gnosis://") {
        Ok(M5ArtifactNamespace::Gnosis)
    } else if trimmed.starts_with("etymology://") {
        Ok(M5ArtifactNamespace::Etymology)
    } else if trimmed.starts_with("pratibimba://") {
        Ok(M5ArtifactNamespace::Pratibimba)
    } else if trimmed.starts_with("run://") {
        Ok(M5ArtifactNamespace::Run)
    } else if trimmed.starts_with("review://") {
        Ok(M5ArtifactNamespace::Review)
    } else if trimmed.starts_with("improvement://") {
        Ok(M5ArtifactNamespace::Improvement)
    } else {
        Err(format!("unsupported artifact URI namespace: {trimmed}"))
    }
}

fn normalize_m5_artifact_uri(raw_uri: &str) -> Result<(String, M5ArtifactNamespace), String> {
    let trimmed = raw_uri.trim();
    if trimmed.starts_with('/') {
        if let Some(index) = trimmed.find("/Idea/") {
            let rest = &trimmed[index + 1..];
            let uri = format!("vault://{rest}");
            let namespace = validate_m5_artifact_uri(&uri)?;
            return Ok((uri, namespace));
        }
        if let Some(index) = trimmed.find("/Body/") {
            let rest = &trimmed[index + 1..];
            let uri = format!("repo://{rest}");
            let namespace = validate_m5_artifact_uri(&uri)?;
            return Ok((uri, namespace));
        }
        if let Some(index) = trimmed.find("/docs/") {
            let rest = &trimmed[index + 1..];
            let uri = format!("repo://{rest}");
            let namespace = validate_m5_artifact_uri(&uri)?;
            return Ok((uri, namespace));
        }
        return Err("artifact URI must use a namespace prefix, not an absolute path".to_owned());
    }
    let uri = if let Some(rest) = trimmed.strip_prefix("Idea/") {
        format!("vault://Idea/{rest}")
    } else if trimmed.starts_with("Body/") || trimmed.starts_with("docs/") {
        format!("repo://{trimmed}")
    } else if let Some(rest) = trimmed.strip_prefix("autoresearch://") {
        format!("improvement://autoresearch/{rest}")
    } else if let Some(rest) = trimmed.strip_prefix("graphiti://handle/") {
        format!("graph://bimba/graphiti/handle/{rest}")
    } else if let Some(rest) = trimmed.strip_prefix("gnostic://") {
        format!("gnosis://{rest}")
    } else if let Some(rest) = trimmed.strip_prefix("atelier://") {
        format!("etymology://{rest}")
    } else {
        trimmed.to_owned()
    };
    let namespace = validate_m5_artifact_uri(&uri)?;
    Ok((uri, namespace))
}

fn artifact_label(uri: &str) -> String {
    uri.rsplit('/')
        .find(|part| !part.is_empty())
        .unwrap_or(uri)
        .to_owned()
}

fn promotion_dry_run_dto(plan: &PromotionPlan) -> Result<M5PromotionDryRunDto, String> {
    let compile_artifacts = plan
        .compile_plan
        .artifacts
        .iter()
        .map(|path| {
            m5_artifact_ref_from_uri(
                &path.display().to_string(),
                None,
                Some("hen_compile_artifact".to_owned()),
                true,
            )
        })
        .collect::<Result<Vec<_>, _>>()?;
    Ok(M5PromotionDryRunDto {
        run_id: plan.run_id.clone(),
        destination: format!("{:?}", plan.destination),
        legacy_destination: plan.legacy_destination.clone(),
        governance_category: plan.governance_category,
        approved_review_resolution_id: plan.approved_review_resolution_id.clone(),
        ok: plan.ok,
        dry_run: plan.dry_run,
        promoted_path: plan.promoted_path.clone(),
        compile_artifacts,
        compile_errors: plan.compile_plan.errors.clone(),
        rollback_executable: plan.rollback_plan.executable,
        rollback_reason: plan.rollback_plan.reason.clone(),
    })
}

fn m5_compatibility_aliases() -> Vec<M5CompatibilityAlias> {
    vec![
        M5CompatibilityAlias {
            legacy_ui_name: "gnostic".to_owned(),
            canonical_name: "gnosis".to_owned(),
            canonical_uri_prefix: "gnosis://".to_owned(),
        },
        M5CompatibilityAlias {
            legacy_ui_name: "atelier".to_owned(),
            canonical_name: "etymology".to_owned(),
            canonical_uri_prefix: "etymology://".to_owned(),
        },
    ]
}

fn review_source_label(source: ReviewSource) -> &'static str {
    match source {
        ReviewSource::HumanGate => "human_gate",
        ReviewSource::Anima => "anima",
        ReviewSource::Aletheia => "aletheia",
        ReviewSource::Autoresearch => "autoresearch",
    }
}

fn review_status_label(status: ReviewStatus) -> &'static str {
    match status {
        ReviewStatus::Open => "open",
        ReviewStatus::Resolved => "resolved",
        ReviewStatus::Deferred => "deferred",
    }
}

fn review_priority_label(priority: ReviewPriority) -> &'static str {
    match priority {
        ReviewPriority::Low => "low",
        ReviewPriority::Normal => "normal",
        ReviewPriority::High => "high",
        ReviewPriority::Blocking => "blocking",
    }
}

fn now_ms() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

fn gateway_methods() -> Vec<String> {
    [
        "s5'.review.submit",
        "s5'.review.inbox",
        "s5'.review.resolve",
        "s5'.review.history",
        "s5'.improve.status",
        "s5'.improve.propose",
        "s5'.improve.evaluate",
        "s5'.improve.promote",
        "s5'.improve.route.detail",
        "s5'.improve.spine.state",
        "s5'.improve.history",
        "s5'.epii.status",
        "s5'.epii.deposit",
        "s5'.epii.deposit.typed_candidate",
        "s5'.epii.workbench.snapshot",
        "s5'.epii.workbench.promotion_dry_run",
        "s5'.epii.user.orientation",
        "s5'.epii.pratibimba.status",
        "s5'.epii.kairos.context",
    ]
    .iter()
    .map(|method| (*method).to_owned())
    .collect()
}
