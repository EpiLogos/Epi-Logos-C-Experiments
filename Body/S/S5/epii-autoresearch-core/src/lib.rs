use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s1_hen_compiler_core::{
    plan_compile, CompilePlanRequest, ExecutorKind, HenTimestamp, TargetAgent,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, ReviewCategory, ReviewDecision, ReviewStore,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

pub mod adapters;
pub mod capacity_workflows;
pub mod inbox;
pub mod recompose;
pub mod spine;
// inbox + recompose intentionally not re-exported — callers namespace via
// `inbox::` / `recompose::` to keep the seam topology visible at import sites.
pub use spine::{
    ClosureKind, ContentTypeRegister, ImprovementCandidate, PromotionDestination, SensitivityClass,
    SurfaceActor, SurfacingPipelineId, TargetSubsystem,
};

pub const KERNEL_EVIDENCE_PRIVACY: &str = "safe-public-current-kernel-tick";
pub const KERNEL_EVIDENCE_COMPUTATION_SOURCE: &str = "portal-core::KernelProjection";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactRef {
    pub path: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
}

impl ArtifactRef {
    pub fn new(path: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            coordinate: None,
            kind: None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LoopState {
    Idle,
    Hypothesis,
    Evaluating,
    Deciding,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ImprovementDecision {
    Keep,
    Discard,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProposeRequest {
    pub target_family: String,
    pub target_coordinate: String,
    pub direction: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_review_item_id: Option<String>,
    pub baseline: ArtifactRef,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EvidenceSourceRef {
    pub kind: String,
    pub uri: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EvaluationEvidence {
    pub dimension: String,
    pub baseline_score: f64,
    pub challenger_score: f64,
    pub weight: f64,
    pub notes: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub source_refs: Vec<EvidenceSourceRef>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kernel_evidence: Option<KernelEvidence>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidenceSnapshot {
    pub generation: u64,
    pub phase: String,
    pub element: String,
    pub harmonic_ratio: String,
    pub pulse_ratio: String,
    pub total_energy: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidenceDelta {
    pub energy_delta: String,
    pub harmonic_changed: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resonance_delta: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidence {
    pub baseline: KernelEvidenceSnapshot,
    pub challenger: KernelEvidenceSnapshot,
    pub delta: KernelEvidenceDelta,
    pub privacy: String,
    pub computation_source: String,
    pub advisory_only: bool,
    pub interpretation_boundary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub trajectory: Option<KernelTrajectoryRef>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelTrajectoryRef {
    pub session_key: String,
    pub day_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub now_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacetimedb_session_surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacetimedb_global_surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub graphiti_arc_id: Option<String>,
}

impl KernelEvidence {
    pub fn from_public_projections(
        baseline: &Value,
        challenger: &Value,
        resonance_delta: Option<String>,
        interpretation_boundary: impl Into<String>,
    ) -> Result<Self, String> {
        validate_public_kernel_projection(baseline)?;
        validate_public_kernel_projection(challenger)?;

        let baseline = KernelEvidenceSnapshot::from_public_projection(baseline)?;
        let challenger = KernelEvidenceSnapshot::from_public_projection(challenger)?;
        let energy_delta = format!(
            "{:.6}",
            parse_f64(&challenger.total_energy, "challenger totalEnergy")?
                - parse_f64(&baseline.total_energy, "baseline totalEnergy")?
        );
        let harmonic_changed = baseline.phase != challenger.phase
            || baseline.element != challenger.element
            || baseline.harmonic_ratio != challenger.harmonic_ratio
            || baseline.pulse_ratio != challenger.pulse_ratio;
        let interpretation_boundary = interpretation_boundary.into();
        if interpretation_boundary.trim().is_empty() {
            return Err("kernel evidence interpretation_boundary is required".to_owned());
        }

        Ok(Self {
            baseline,
            challenger,
            delta: KernelEvidenceDelta {
                energy_delta,
                harmonic_changed,
                resonance_delta,
            },
            privacy: KERNEL_EVIDENCE_PRIVACY.to_owned(),
            computation_source: KERNEL_EVIDENCE_COMPUTATION_SOURCE.to_owned(),
            advisory_only: true,
            interpretation_boundary,
            trajectory: None,
        })
    }

    pub fn with_trajectory(mut self, trajectory: KernelTrajectoryRef) -> Result<Self, String> {
        validate_kernel_trajectory(&trajectory)?;
        self.trajectory = Some(trajectory);
        Ok(self)
    }
}

impl KernelEvidenceSnapshot {
    fn from_public_projection(value: &Value) -> Result<Self, String> {
        let ratio_num = required_u64(value, "/harmonicPulse/ratioNum")?;
        let ratio_den = required_u64(value, "/harmonicPulse/ratioDen")?;
        Ok(Self {
            generation: required_u64(value, "/generation")?,
            phase: required_str(value, "/tick/phase")?.to_owned(),
            element: required_str(value, "/tick/element")?.to_owned(),
            harmonic_ratio: required_str(value, "/tick/harmonicRatio")?.to_owned(),
            pulse_ratio: format!("{ratio_num}/{ratio_den}"),
            total_energy: required_str(value, "/energy/totalEnergy")?.to_owned(),
        })
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub winner: String,
    pub baseline_score: f64,
    pub challenger_score: f64,
    pub evidence: Vec<EvaluationEvidence>,
    pub rationale: String,
    pub evaluated_at: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementRun {
    pub run_id: String,
    pub target_family: String,
    pub target_coordinate: String,
    pub direction: String,
    #[serde(default)]
    pub closure_kind: ClosureKind,
    #[serde(default)]
    pub ct_register: ContentTypeRegister,
    pub source_review_item_id: Option<String>,
    pub baseline: ArtifactRef,
    pub challenger: ArtifactRef,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub typed_candidate: Option<ImprovementCandidate>,
    pub loop_state: LoopState,
    pub evaluation: Option<EvaluationResult>,
    pub decision: Option<ImprovementDecision>,
    pub created_at: u128,
    pub updated_at: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementVector {
    pub run_id: String,
    pub target_family: String,
    pub target_coordinate: String,
    pub direction: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImproveStatus {
    pub loop_state: LoopState,
    pub active_vectors: Vec<ImprovementVector>,
    pub last_run: Option<u128>,
    pub total_runs: usize,
    pub keep_count: usize,
    pub discard_count: usize,
    pub kernel_evidence_count: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementHistory {
    pub runs: Vec<ImprovementRun>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CandidateRecord {
    pub candidate_id: String,
    pub run_id: String,
    pub candidate: ImprovementCandidate,
    pub surfaced_at: u128,
    pub updated_at: u128,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RouteStatus {
    Open,
    Blocked,
    Resolved,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RouteRecord {
    pub route_id: String,
    pub candidate_id: String,
    pub run_id: String,
    pub target_subsystem: TargetSubsystem,
    pub queue: String,
    pub closure_kind: ClosureKind,
    pub ct_register: ContentTypeRegister,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cross_target_link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocked_by_route_id: Option<String>,
    pub status: RouteStatus,
    pub created_at: u128,
    pub updated_at: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SurfacedCandidateReceipt {
    pub candidate: CandidateRecord,
    pub run: ImprovementRun,
    pub routes: Vec<RouteRecord>,
    pub suppressed_duplicate: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AletheiaLineageSurfaceReceipt {
    pub surfaced: SurfacedCandidateReceipt,
    pub lineage: inbox::DisclosureLineage,
    pub safe_source_uri: String,
}

#[derive(Debug, Clone, PartialEq)]
struct AletheiaInboxSurfaceRecord {
    surfaced: SurfacedCandidateReceipt,
    lineage: Option<inbox::DisclosureLineage>,
    safe_source_uri: String,
}

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

#[derive(Debug, Clone)]
pub struct ImprovementStore {
    root: PathBuf,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct ImprovementState {
    #[serde(default)]
    runs: Vec<ImprovementRun>,
    #[serde(default)]
    candidates: Vec<CandidateRecord>,
    #[serde(default)]
    routes: Vec<RouteRecord>,
    #[serde(default)]
    orchestrations: Vec<OrchestrationRecord>,
}

impl ImprovementStore {
    pub fn new(root: impl AsRef<Path>) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
        }
    }

    pub fn propose(&self, request: ProposeRequest) -> Result<ImprovementRun, String> {
        validate_proposal(&request)?;
        let mut state = self.load_state()?;
        let now = now_ms();
        let run_id = Uuid::new_v4().to_string();
        let challenger = ArtifactRef {
            path: format!("autoresearch://challenger/{run_id}"),
            coordinate: Some(request.target_coordinate.clone()),
            kind: Some("improvement_challenger".to_owned()),
        };
        let typed_candidate =
            typed_candidate_from_proposal(&run_id, &request, challenger.clone(), now)?;
        let run = ImprovementRun {
            challenger,
            run_id,
            target_family: request.target_family,
            target_coordinate: request.target_coordinate,
            direction: request.direction,
            closure_kind: typed_candidate.closure_kind,
            ct_register: typed_candidate.ct_register,
            source_review_item_id: request.source_review_item_id,
            baseline: request.baseline,
            typed_candidate: Some(typed_candidate),
            loop_state: LoopState::Hypothesis,
            evaluation: None,
            decision: None,
            created_at: now,
            updated_at: now,
        };
        state.runs.push(run.clone());
        self.save_state(&state)?;
        Ok(run)
    }

    pub fn surface_candidate(
        &self,
        mut candidate: ImprovementCandidate,
    ) -> Result<SurfacedCandidateReceipt, String> {
        validate_surface_candidate(&candidate)?;
        let mut state = self.load_state()?;

        if let Some(fingerprint) = candidate.observation_evidence.fingerprint.as_deref() {
            if let Some(existing) = state.candidates.iter().find(|record| {
                record.candidate.observation_evidence.fingerprint.as_deref() == Some(fingerprint)
                    && record.candidate.observation_evidence.source_uri
                        == candidate.observation_evidence.source_uri
                    && record.candidate.surfacing_pipeline == candidate.surfacing_pipeline
            }) {
                let run = state
                    .runs
                    .iter()
                    .find(|run| run.run_id == existing.run_id)
                    .ok_or_else(|| {
                        format!(
                            "candidate {} references missing run {}",
                            existing.candidate_id, existing.run_id
                        )
                    })?
                    .clone();
                let routes = state
                    .routes
                    .iter()
                    .filter(|route| route.candidate_id == existing.candidate_id)
                    .cloned()
                    .collect::<Vec<_>>();
                return Ok(SurfacedCandidateReceipt {
                    candidate: existing.clone(),
                    run,
                    routes,
                    suppressed_duplicate: true,
                });
            }
        }

        let now = now_ms();
        let run_id = Uuid::new_v4().to_string();
        let candidate_id = stable_candidate_id(&candidate, &run_id);
        let challenger = candidate
            .challenger_artifact
            .clone()
            .unwrap_or_else(|| ArtifactRef {
                path: format!("autoresearch://challenger/{run_id}"),
                coordinate: Some(candidate.propose.target_coordinate.clone()),
                kind: Some("improvement_challenger".to_owned()),
            });
        candidate.challenger_artifact = Some(challenger.clone());

        let run = ImprovementRun {
            run_id: run_id.clone(),
            target_family: candidate.propose.target_family.clone(),
            target_coordinate: candidate.propose.target_coordinate.clone(),
            direction: candidate.propose.direction.clone(),
            closure_kind: candidate.closure_kind,
            ct_register: candidate.ct_register,
            source_review_item_id: candidate.propose.source_review_item_id.clone(),
            baseline: candidate.propose.baseline.clone(),
            challenger,
            typed_candidate: Some(candidate.clone()),
            loop_state: LoopState::Hypothesis,
            evaluation: None,
            decision: None,
            created_at: now,
            updated_at: now,
        };
        let record = CandidateRecord {
            candidate_id: candidate_id.clone(),
            run_id: run_id.clone(),
            candidate,
            surfaced_at: now,
            updated_at: now,
        };
        state.runs.push(run.clone());
        state.candidates.push(record.clone());
        self.save_state(&state)?;

        let routes =
            self.route_candidate(&candidate_id, vec![record.candidate.target_subsystem])?;
        Ok(SurfacedCandidateReceipt {
            candidate: record,
            run,
            routes,
            suppressed_duplicate: false,
        })
    }

    pub fn route_candidate(
        &self,
        candidate_id: &str,
        targets: Vec<TargetSubsystem>,
    ) -> Result<Vec<RouteRecord>, String> {
        if candidate_id.trim().is_empty() {
            return Err("candidate_id is required".to_owned());
        }
        let mut state = self.load_state()?;
        let candidate_record = state
            .candidates
            .iter()
            .find(|record| record.candidate_id == candidate_id)
            .ok_or_else(|| format!("candidate not found: {candidate_id}"))?
            .clone();

        let mut normalized_targets = if targets.is_empty() {
            vec![candidate_record.candidate.target_subsystem]
        } else {
            targets
        };
        normalized_targets.sort_by_key(|target| target_rank(*target));
        normalized_targets.dedup();

        let now = now_ms();
        let cross_target_link = (normalized_targets.len() > 1)
            .then(|| format!("cross-target:{candidate_id}:{}", candidate_record.run_id));
        let anuttara_route_id = normalized_targets
            .contains(&TargetSubsystem::Anuttara)
            .then(|| route_id_for(candidate_id, TargetSubsystem::Anuttara));

        for target in &normalized_targets {
            let route_id = route_id_for(candidate_id, *target);
            if let Some(existing) = state
                .routes
                .iter_mut()
                .find(|route| route.route_id == route_id)
            {
                if existing.cross_target_link.is_none() && cross_target_link.is_some() {
                    existing.cross_target_link = cross_target_link.clone();
                    existing.updated_at = now;
                }
                if existing.blocked_by_route_id.is_none()
                    && *target != TargetSubsystem::Anuttara
                    && anuttara_route_id.is_some()
                {
                    existing.blocked_by_route_id = anuttara_route_id.clone();
                    existing.status = RouteStatus::Blocked;
                    existing.updated_at = now;
                }
                continue;
            }
            let blocked_by_route_id =
                if *target != TargetSubsystem::Anuttara && anuttara_route_id.is_some() {
                    anuttara_route_id.clone()
                } else {
                    None
                };
            state.routes.push(RouteRecord {
                route_id,
                candidate_id: candidate_id.to_owned(),
                run_id: candidate_record.run_id.clone(),
                target_subsystem: *target,
                queue: route_queue(*target).to_owned(),
                closure_kind: candidate_record.candidate.closure_kind,
                ct_register: candidate_record.candidate.ct_register,
                cross_target_link: cross_target_link.clone(),
                status: if blocked_by_route_id.is_some() {
                    RouteStatus::Blocked
                } else {
                    RouteStatus::Open
                },
                blocked_by_route_id,
                created_at: now,
                updated_at: now,
            });
        }
        self.save_state(&state)?;

        let mut routes = state
            .routes
            .into_iter()
            .filter(|route| route.candidate_id == candidate_id)
            .filter(|route| normalized_targets.contains(&route.target_subsystem))
            .collect::<Vec<_>>();
        routes.sort_by_key(|route| target_rank(route.target_subsystem));
        Ok(routes)
    }

    pub fn surface_aletheia_inbox(
        &self,
        inbox: &inbox::InboxStore,
    ) -> Result<Vec<SurfacedCandidateReceipt>, String> {
        Ok(self
            .surface_aletheia_inbox_records(inbox)?
            .into_iter()
            .map(|record| record.surfaced)
            .collect())
    }

    pub fn surface_aletheia_lineage_inbox(
        &self,
        inbox: &inbox::InboxStore,
    ) -> Result<Vec<AletheiaLineageSurfaceReceipt>, String> {
        Ok(self
            .surface_aletheia_inbox_records(inbox)?
            .into_iter()
            .filter_map(|record| {
                record.lineage.map(|lineage| AletheiaLineageSurfaceReceipt {
                    surfaced: record.surfaced,
                    lineage,
                    safe_source_uri: record.safe_source_uri,
                })
            })
            .collect())
    }

    fn surface_aletheia_inbox_records(
        &self,
        inbox: &inbox::InboxStore,
    ) -> Result<Vec<AletheiaInboxSurfaceRecord>, String> {
        let mut receipts = Vec::new();
        for stored in inbox.list_pending()? {
            let safe_source_uri = aletheia_present_inbox_uri(&stored);
            let closure_kind = ClosureKind::from_inbox_wire(&stored.entry.closure_kind)?;
            for (vector_index, direction) in stored.entry.improvement_vectors.iter().enumerate() {
                let target_coordinate = vak_coordinate_label(&stored.entry.final_vak)?;
                let request = ProposeRequest {
                    target_family: "S".to_owned(),
                    target_coordinate: target_coordinate.clone(),
                    direction: direction.clone(),
                    source_review_item_id: None,
                    baseline: ArtifactRef {
                        path: stored
                            .entry
                            .artifacts
                            .first()
                            .cloned()
                            .unwrap_or_else(|| aletheia_present_inbox_uri(&stored)),
                        coordinate: Some(target_coordinate),
                        kind: Some("aletheia_disclosure_artifact".to_owned()),
                    },
                };
                let target = infer_target_subsystem(&request);
                let surfaced_at = now_ms();
                let lineage_fingerprint = stored
                    .entry
                    .disclosure_lineage
                    .as_ref()
                    .map(|lineage| lineage.lineage_id.as_str())
                    .unwrap_or("legacy-lineage");
                let mut candidate = ImprovementCandidate::from_propose(
                    request,
                    target,
                    default_vector_for(target),
                    SurfacingPipelineId::AletheiaDisclosure,
                    spine::ObservationEvidence {
                        source_uri: safe_source_uri.clone(),
                        summary: observation_summary(&stored.entry, direction),
                        observed_at: Some(surfaced_at),
                        fingerprint: Some(format!(
                            "aletheia:{}#V{}:{}:{}",
                            stored.id, vector_index, direction, lineage_fingerprint
                        )),
                    },
                    surfaced_at,
                    SurfaceActor::Aletheia,
                    SensitivityClass::RequiresReview,
                )?;
                candidate.closure_kind = closure_kind;
                candidate.ct_register = ContentTypeRegister::CT4b;
                candidate.linkage.originating_inbox_entry = Some(stored.id.clone());
                receipts.push(AletheiaInboxSurfaceRecord {
                    surfaced: self.surface_candidate(candidate)?,
                    lineage: stored.entry.disclosure_lineage.clone(),
                    safe_source_uri: safe_source_uri.clone(),
                });
            }
        }
        Ok(receipts)
    }

    pub fn evaluate(
        &self,
        run_id: &str,
        evidence: Vec<EvaluationEvidence>,
    ) -> Result<ImprovementRun, String> {
        if evidence.is_empty() {
            return Err("evaluation evidence is required".to_owned());
        }
        for item in &evidence {
            if item.dimension.trim().is_empty() {
                return Err("evaluation evidence dimension is required".to_owned());
            }
            if item.weight < 0.0 {
                return Err("evaluation evidence weight must be non-negative".to_owned());
            }
            for source in &item.source_refs {
                if source.kind.trim().is_empty() {
                    return Err("evaluation evidence source_ref kind is required".to_owned());
                }
                if source.uri.trim().is_empty() {
                    return Err("evaluation evidence source_ref uri is required".to_owned());
                }
            }
            if let Some(kernel_evidence) = &item.kernel_evidence {
                validate_kernel_evidence(kernel_evidence)?;
            }
        }

        let mut state = self.load_state()?;
        let run = state
            .runs
            .iter_mut()
            .find(|run| run.run_id == run_id)
            .ok_or_else(|| format!("improvement run not found: {run_id}"))?;

        let baseline_score = weighted_score(&evidence, |item| item.baseline_score);
        let challenger_score = weighted_score(&evidence, |item| item.challenger_score);
        let challenger_wins = challenger_score > baseline_score;
        let winner = if challenger_wins {
            "challenger"
        } else {
            "baseline"
        };

        run.loop_state = LoopState::Deciding;
        run.decision = Some(if challenger_wins {
            ImprovementDecision::Keep
        } else {
            ImprovementDecision::Discard
        });
        run.evaluation = Some(EvaluationResult {
            winner: winner.to_owned(),
            baseline_score,
            challenger_score,
            rationale: format!(
                "{winner} wins by weighted evidence ({baseline_score:.4} vs {challenger_score:.4})"
            ),
            evidence,
            evaluated_at: now_ms(),
        });
        run.updated_at = now_ms();
        let updated = run.clone();
        self.save_state(&state)?;
        Ok(updated)
    }

    pub fn promote(&self, request: PromoteRequest) -> Result<PromotionPlan, String> {
        if !request.dry_run {
            return Err(
                "non-dry-run autoresearch promotion is blocked until review and compiler mutation are wired"
                    .to_owned(),
            );
        }
        request.destination.validate()?;
        if let Some(legacy_destination) = request.legacy_destination.as_deref() {
            PromotionDestination::validate_legacy_destination(legacy_destination)?;
        }
        if request.approved_review_resolution_id.trim().is_empty() {
            return Err("approved_review_resolution_id is required".to_owned());
        }

        let state = self.load_state()?;
        let run = state
            .runs
            .iter()
            .find(|run| run.run_id == request.run_id)
            .ok_or_else(|| format!("improvement run not found: {}", request.run_id))?;

        if run.decision != Some(ImprovementDecision::Keep) {
            return Err(format!(
                "improvement run {} is not kept and cannot be promoted",
                request.run_id
            ));
        }

        validate_destination_for_run(run, &request.destination)?;
        let governance_category = validate_approved_review(
            &request.review_store_root,
            &request.approved_review_resolution_id,
            &request.destination,
        )?;
        let promotion_now = request
            .requested_at
            .map(HenTimestamp::from)
            .unwrap_or_else(system_hen_timestamp);
        let compile_plan = CompilePlanSummary::from(plan_compile(CompilePlanRequest {
            vault_root: request.vault_root.clone(),
            compiler_root: request.compiler_root,
            now: promotion_now,
            channel: "improvement".to_owned(),
            thought_lane: "T5".to_owned(),
            artifact_slug: request.artifact_slug,
            executor_kind: ExecutorKind::PiAgent,
            target_agent: target_agent_for_destination(&request.destination),
            required_skill: Some("autoresearch".to_owned()),
            dry_run: true,
        }));
        let rollback_plan = rollback_plan_for(&request.destination);

        Ok(PromotionPlan {
            ok: compile_plan.errors.is_empty(),
            dry_run: true,
            run_id: request.run_id,
            destination: request.destination,
            legacy_destination: request.legacy_destination,
            governance_category,
            approved_review_resolution_id: request.approved_review_resolution_id,
            promoted_path: None,
            compile_plan,
            rollback_plan,
        })
    }

    pub fn status(&self) -> Result<ImproveStatus, String> {
        let state = self.load_state()?;
        let last_run = state.runs.iter().map(|run| run.updated_at).max();
        let active_vectors = state
            .runs
            .iter()
            .filter(|run| run.decision.is_none())
            .map(|run| ImprovementVector {
                run_id: run.run_id.clone(),
                target_family: run.target_family.clone(),
                target_coordinate: run.target_coordinate.clone(),
                direction: run.direction.clone(),
            })
            .collect::<Vec<_>>();

        let loop_state = state
            .runs
            .iter()
            .max_by_key(|run| run.updated_at)
            .map(|run| run.loop_state)
            .unwrap_or(LoopState::Idle);

        Ok(ImproveStatus {
            loop_state,
            active_vectors,
            last_run,
            total_runs: state.runs.len(),
            keep_count: state
                .runs
                .iter()
                .filter(|run| run.decision == Some(ImprovementDecision::Keep))
                .count(),
            discard_count: state
                .runs
                .iter()
                .filter(|run| run.decision == Some(ImprovementDecision::Discard))
                .count(),
            kernel_evidence_count: state
                .runs
                .iter()
                .filter_map(|run| run.evaluation.as_ref())
                .flat_map(|evaluation| evaluation.evidence.iter())
                .filter(|evidence| evidence.kernel_evidence.is_some())
                .count(),
        })
    }

    pub fn history(&self, limit: Option<usize>) -> Result<ImprovementHistory, String> {
        let mut runs = self.load_state()?.runs;
        runs.sort_by(|left, right| right.updated_at.cmp(&left.updated_at));
        if let Some(limit) = limit {
            runs.truncate(limit);
        }
        Ok(ImprovementHistory { runs })
    }

    pub fn candidates(&self) -> Result<Vec<CandidateRecord>, String> {
        Ok(self.load_state()?.candidates)
    }

    pub fn routes(&self) -> Result<Vec<RouteRecord>, String> {
        Ok(self.load_state()?.routes)
    }

    pub fn create_orchestration(
        &self,
        request: CreateOrchestrationRequest,
    ) -> Result<OrchestrationRecord, String> {
        if request.candidate_id.trim().is_empty() {
            return Err("candidate_id is required".to_owned());
        }
        if request.route_id.trim().is_empty() {
            return Err("route_id is required".to_owned());
        }
        let mut state = self.load_state()?;
        let route = state
            .routes
            .iter()
            .find(|route| {
                route.route_id == request.route_id && route.candidate_id == request.candidate_id
            })
            .ok_or_else(|| {
                format!(
                    "route {} for candidate {} not found",
                    request.route_id, request.candidate_id
                )
            })?
            .clone();
        if let Some(existing) = state
            .orchestrations
            .iter()
            .find(|record| record.route_id == request.route_id)
        {
            return Ok(existing.clone());
        }
        let record = OrchestrationRecord {
            orchestration_id: format!(
                "orchestration:{}:{}",
                sanitize_id_component(&request.candidate_id),
                sanitize_id_component(&request.route_id)
            ),
            candidate_id: request.candidate_id,
            route_id: request.route_id,
            improvement_run_id: route.run_id,
            review_item_id: request.review_item_id.clone(),
            promotion_plan_id: None,
            state: OrchestrationState::Queued,
            review_stage: if request.review_item_id.is_some() {
                ReviewStage::Submitted
            } else {
                ReviewStage::Unsubmitted
            },
            retry_policy: request.retry_policy,
            discard_reason: None,
            created_at: request.now_ms,
            updated_at: request.now_ms,
            deadline_at: request
                .timeout_after_ms
                .map(|timeout| request.now_ms.saturating_add(timeout)),
            last_transition_reason: "created".to_owned(),
        };
        state.orchestrations.push(record.clone());
        self.save_state(&state)?;
        Ok(record)
    }

    pub fn transition_orchestration(
        &self,
        request: TransitionOrchestrationRequest,
    ) -> Result<OrchestrationRecord, String> {
        if request.orchestration_id.trim().is_empty() {
            return Err("orchestration_id is required".to_owned());
        }
        if request.reason.trim().is_empty() {
            return Err("transition reason is required".to_owned());
        }
        let mut state = self.load_state()?;
        let record = state
            .orchestrations
            .iter_mut()
            .find(|record| record.orchestration_id == request.orchestration_id)
            .ok_or_else(|| format!("orchestration not found: {}", request.orchestration_id))?;
        validate_orchestration_transition(record.state, request.next_state)?;
        record.state = request.next_state;
        if let Some(review_stage) = request.review_stage {
            record.review_stage = review_stage;
        }
        if let Some(discard_reason) = request.discard_reason {
            record.discard_reason = Some(discard_reason);
        }
        if let Some(promotion_plan_id) = request.promotion_plan_id {
            if promotion_plan_id.trim().is_empty() {
                return Err("promotion_plan_id must not be blank".to_owned());
            }
            record.promotion_plan_id = Some(promotion_plan_id);
        }
        if request.next_state == OrchestrationState::Retrying {
            record.retry_policy.attempts = record.retry_policy.attempts.saturating_add(1);
            if record.retry_policy.attempts > record.retry_policy.max_attempts {
                return Err(format!(
                    "retry attempts {} exceed max_attempts {}",
                    record.retry_policy.attempts, record.retry_policy.max_attempts
                ));
            }
        }
        record.updated_at = request.now_ms;
        record.last_transition_reason = request.reason;
        let updated = record.clone();
        self.save_state(&state)?;
        Ok(updated)
    }

    pub fn apply_orchestration_timeouts(
        &self,
        now_ms: u128,
    ) -> Result<Vec<SurfacedCandidateReceipt>, String> {
        let mut state = self.load_state()?;
        let mut stalled = Vec::new();
        for record in &mut state.orchestrations {
            if matches!(
                record.state,
                OrchestrationState::Promoted
                    | OrchestrationState::Discarded
                    | OrchestrationState::Abandoned
            ) {
                continue;
            }
            if record
                .deadline_at
                .is_some_and(|deadline| deadline <= now_ms)
            {
                record.state = OrchestrationState::Abandoned;
                record.discard_reason = Some(DiscardReason::TimeoutAbandoned);
                record.updated_at = now_ms;
                record.last_transition_reason =
                    "deadline elapsed; surfaced Epii-on-Epii meta candidate".to_owned();
                stalled.push(record.clone());
            }
        }
        self.save_state(&state)?;

        let mut receipts = Vec::new();
        for record in stalled {
            receipts.push(self.surface_timeout_meta_candidate(&record, now_ms)?);
        }
        Ok(receipts)
    }

    pub fn orchestrations(&self) -> Result<Vec<OrchestrationRecord>, String> {
        Ok(self.load_state()?.orchestrations)
    }

    pub fn cross_cycle_continuity(&self, now_ms: u128) -> Result<CrossCycleContinuity, String> {
        let state = self.load_state()?;
        Ok(cross_cycle_continuity_from_state(&state, now_ms))
    }

    fn surface_timeout_meta_candidate(
        &self,
        record: &OrchestrationRecord,
        now_ms: u128,
    ) -> Result<SurfacedCandidateReceipt, String> {
        let candidate_record = self
            .load_state()?
            .candidates
            .into_iter()
            .find(|candidate| candidate.candidate_id == record.candidate_id)
            .ok_or_else(|| format!("candidate not found: {}", record.candidate_id))?;
        let request = ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/Epii".to_owned(),
            direction: format!(
                "Investigate stalled autoresearch orchestration {} for route {}",
                record.orchestration_id, record.route_id
            ),
            source_review_item_id: record.review_item_id.clone(),
            baseline: ArtifactRef {
                path: format!("autoresearch://orchestration/{}", record.orchestration_id),
                coordinate: Some("S5/Epii".to_owned()),
                kind: Some("orchestration_timeout".to_owned()),
            },
        };
        let mut candidate = ImprovementCandidate::from_propose(
            request,
            TargetSubsystem::Epii,
            spine::ImprovementVectorKind::EpiiSpineMechanismRefinement {
                spine_phase: "orchestration-timeout".to_owned(),
            },
            SurfacingPipelineId::EpiiOnEpiiMeta,
            spine::ObservationEvidence {
                source_uri: format!("autoresearch://orchestration/{}", record.orchestration_id),
                summary: format!(
                    "Route {} stalled from candidate {}; original observation: {}",
                    record.route_id,
                    record.candidate_id,
                    candidate_record.candidate.observation_evidence.summary
                ),
                observed_at: Some(now_ms),
                fingerprint: Some(format!(
                    "orchestration-timeout:{}:{}",
                    record.orchestration_id, now_ms
                )),
            },
            now_ms,
            SurfaceActor::Epii,
            SensitivityClass::RequiresReview,
        )?;
        candidate.closure_kind = candidate_record.candidate.closure_kind;
        candidate.ct_register = candidate_record.candidate.ct_register;
        Ok(self.surface_candidate(candidate)?)
    }

    fn state_path(&self) -> PathBuf {
        self.root.join("s5-improvement-state.json")
    }

    fn load_state(&self) -> Result<ImprovementState, String> {
        let path = self.state_path();
        if !path.exists() {
            return Ok(ImprovementState::default());
        }
        let contents =
            fs::read_to_string(&path).map_err(|err| format!("{}: {err}", path.display()))?;
        serde_json::from_str(&contents).map_err(|err| format!("{}: {err}", path.display()))
    }

    fn save_state(&self, state: &ImprovementState) -> Result<(), String> {
        fs::create_dir_all(&self.root).map_err(|err| format!("{}: {err}", self.root.display()))?;
        let path = self.state_path();
        let encoded = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
        fs::write(&path, encoded).map_err(|err| format!("{}: {err}", path.display()))
    }
}

fn validate_kernel_evidence(evidence: &KernelEvidence) -> Result<(), String> {
    if !evidence.advisory_only {
        return Err("kernel evidence must be advisory_only".to_owned());
    }
    if evidence.privacy != KERNEL_EVIDENCE_PRIVACY {
        return Err(format!(
            "kernel evidence privacy must be {KERNEL_EVIDENCE_PRIVACY}"
        ));
    }
    if evidence.computation_source != KERNEL_EVIDENCE_COMPUTATION_SOURCE {
        return Err(format!(
            "kernel evidence computation_source must be {KERNEL_EVIDENCE_COMPUTATION_SOURCE}"
        ));
    }
    if evidence.interpretation_boundary.trim().is_empty() {
        return Err("kernel evidence interpretation_boundary is required".to_owned());
    }
    parse_f64(&evidence.baseline.total_energy, "baseline total_energy")?;
    parse_f64(&evidence.challenger.total_energy, "challenger total_energy")?;
    parse_f64(&evidence.delta.energy_delta, "energy_delta")?;
    if let Some(trajectory) = &evidence.trajectory {
        validate_kernel_trajectory(trajectory)?;
    }
    Ok(())
}

fn validate_kernel_trajectory(trajectory: &KernelTrajectoryRef) -> Result<(), String> {
    if trajectory.session_key.trim().is_empty() {
        return Err("kernel trajectory session_key is required".to_owned());
    }
    if trajectory.day_id.trim().is_empty() {
        return Err("kernel trajectory day_id is required".to_owned());
    }
    for (label, value) in [
        ("now_path", trajectory.now_path.as_deref()),
        (
            "spacetimedb_session_surface",
            trajectory.spacetimedb_session_surface.as_deref(),
        ),
        (
            "spacetimedb_global_surface",
            trajectory.spacetimedb_global_surface.as_deref(),
        ),
        ("graphiti_arc_id", trajectory.graphiti_arc_id.as_deref()),
    ] {
        if value.is_some_and(|value| value.trim().is_empty()) {
            return Err(format!("kernel trajectory {label} must not be blank"));
        }
    }
    Ok(())
}

fn validate_public_kernel_projection(value: &Value) -> Result<(), String> {
    if required_str(value, "/privacy")? != KERNEL_EVIDENCE_PRIVACY {
        return Err(format!(
            "kernel projection privacy must be {KERNEL_EVIDENCE_PRIVACY}"
        ));
    }
    if required_str(value, "/computationSource")? != KERNEL_EVIDENCE_COMPUTATION_SOURCE {
        return Err(format!(
            "kernel projection computationSource must be {KERNEL_EVIDENCE_COMPUTATION_SOURCE}"
        ));
    }
    if value.get("bioquaternion").is_some() || value.get("resonanceSquareEmphasis").is_some() {
        return Err("kernel projection must not expose protected kernel fields".to_owned());
    }
    Ok(())
}

fn required_str<'a>(value: &'a Value, pointer: &str) -> Result<&'a str, String> {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .ok_or_else(|| format!("kernel projection field is required: {pointer}"))
}

fn required_u64(value: &Value, pointer: &str) -> Result<u64, String> {
    value
        .pointer(pointer)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("kernel projection field is required: {pointer}"))
}

fn parse_f64(value: &str, label: &str) -> Result<f64, String> {
    let parsed = value
        .parse::<f64>()
        .map_err(|_| format!("{label} must be a finite decimal"))?;
    if parsed.is_finite() {
        Ok(parsed)
    } else {
        Err(format!("{label} must be finite"))
    }
}

fn validate_proposal(request: &ProposeRequest) -> Result<(), String> {
    if request.target_family.trim().is_empty() {
        return Err("target_family is required".to_owned());
    }
    if request.target_coordinate.trim().is_empty() {
        return Err("target_coordinate is required".to_owned());
    }
    if request.direction.trim().is_empty() {
        return Err("improvement direction is required".to_owned());
    }
    if request.baseline.path.trim().is_empty() {
        return Err("baseline artifact path is required".to_owned());
    }
    Ok(())
}

fn validate_surface_candidate(candidate: &ImprovementCandidate) -> Result<(), String> {
    candidate.validate()?;
    if candidate.closure_kind == ClosureKind::LegacyUnspecified {
        return Err("surfaced candidates require explicit closure_kind".to_owned());
    }
    if candidate.ct_register == ContentTypeRegister::LegacyUnspecified {
        return Err("surfaced candidates require explicit ct_register".to_owned());
    }
    Ok(())
}

fn stable_candidate_id(candidate: &ImprovementCandidate, fallback: &str) -> String {
    candidate
        .observation_evidence
        .fingerprint
        .as_deref()
        .map(sanitize_id_component)
        .filter(|value| !value.is_empty())
        .map(|fingerprint| format!("candidate:{fingerprint}"))
        .unwrap_or_else(|| format!("candidate:{fallback}"))
}

fn route_id_for(candidate_id: &str, target: TargetSubsystem) -> String {
    format!(
        "route:{}:{}",
        sanitize_id_component(candidate_id),
        route_queue(target)
    )
}

fn sanitize_id_component(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_owned()
}

fn route_queue(target: TargetSubsystem) -> &'static str {
    match target {
        TargetSubsystem::Anuttara => "anuttara",
        TargetSubsystem::Paramasiva => "paramasiva",
        TargetSubsystem::Parashakti => "parashakti",
        TargetSubsystem::Mahamaya => "mahamaya",
        TargetSubsystem::Nara => "nara",
        TargetSubsystem::Epii => "epii",
    }
}

fn target_rank(target: TargetSubsystem) -> u8 {
    match target {
        TargetSubsystem::Anuttara => 0,
        TargetSubsystem::Paramasiva => 1,
        TargetSubsystem::Parashakti => 2,
        TargetSubsystem::Mahamaya => 3,
        TargetSubsystem::Nara => 4,
        TargetSubsystem::Epii => 5,
    }
}

fn observation_summary(entry: &inbox::InboxEntry, direction: &str) -> String {
    let moirai = entry
        .moirai_summary
        .values()
        .next()
        .cloned()
        .unwrap_or_else(|| "Aletheia disclosure surfaced an improvement vector".to_owned());
    let lineage = entry
        .disclosure_lineage
        .as_ref()
        .map(|lineage| {
            format!(
                " lineage={} source_subagent={} privacy={} readiness={}",
                lineage.lineage_id,
                lineage.source_subagent,
                lineage.privacy_class,
                lineage.readiness
            )
        })
        .unwrap_or_default();
    format!(
        "{} | source={} day={} direction={}{}",
        moirai, entry.source, entry.day_id, direction, lineage
    )
}

fn aletheia_present_inbox_uri(stored: &inbox::StoredInboxEntry) -> String {
    let session_id = stored
        .id
        .split_once("#L")
        .map(|(session_id, _)| session_id)
        .unwrap_or(stored.entry.session_id.as_str());
    format!(
        "vault://Idea/Empty/Present/{}/{}.jsonl#{}",
        sanitize_id_component(&stored.entry.day_id),
        session_id,
        stored.id
    )
}

fn vak_coordinate_label(vak: &portal_core::VakAddress) -> Result<String, String> {
    serde_json::to_string(vak).map_err(|err| format!("serialize final_vak: {err}"))
}

fn validate_orchestration_transition(
    current: OrchestrationState,
    next: OrchestrationState,
) -> Result<(), String> {
    if current == next {
        return Ok(());
    }
    let legal = match current {
        OrchestrationState::Queued => matches!(
            next,
            OrchestrationState::InReview
                | OrchestrationState::Discarded
                | OrchestrationState::Abandoned
        ),
        OrchestrationState::InReview => matches!(
            next,
            OrchestrationState::AwaitingUserValidation
                | OrchestrationState::Retrying
                | OrchestrationState::Discarded
                | OrchestrationState::Promoted
        ),
        OrchestrationState::AwaitingUserValidation => matches!(
            next,
            OrchestrationState::Integrating
                | OrchestrationState::Retrying
                | OrchestrationState::Discarded
        ),
        OrchestrationState::Retrying => {
            matches!(
                next,
                OrchestrationState::InReview | OrchestrationState::Abandoned
            )
        }
        OrchestrationState::Integrating => {
            matches!(
                next,
                OrchestrationState::Verifying | OrchestrationState::Discarded
            )
        }
        OrchestrationState::Verifying => matches!(
            next,
            OrchestrationState::Promoted
                | OrchestrationState::Retrying
                | OrchestrationState::Discarded
        ),
        OrchestrationState::Promoted
        | OrchestrationState::Discarded
        | OrchestrationState::Abandoned => false,
    };
    if legal {
        Ok(())
    } else {
        Err(format!(
            "illegal orchestration transition: {:?} -> {:?}",
            current, next
        ))
    }
}

fn cross_cycle_continuity_from_state(
    state: &ImprovementState,
    now_ms: u128,
) -> CrossCycleContinuity {
    let mut pending_articulations = Vec::new();
    let mut pending_integrations = Vec::new();
    let mut user_validation_awaits = Vec::new();
    let mut verification_schedule = Vec::new();

    for record in &state.orchestrations {
        match record.state {
            OrchestrationState::Queued
            | OrchestrationState::InReview
            | OrchestrationState::Retrying => pending_articulations.push(continuity_hint(
                "pending_articulation",
                record,
                "candidate is still being articulated through review/routing",
            )),
            OrchestrationState::AwaitingUserValidation => {
                user_validation_awaits.push(continuity_hint(
                    "user_validation_await",
                    record,
                    "candidate awaits explicit user validation before integration",
                ))
            }
            OrchestrationState::Integrating => pending_integrations.push(continuity_hint(
                "pending_integration",
                record,
                "candidate is integrating and must be carried into the next cycle",
            )),
            OrchestrationState::Verifying => {
                verification_schedule.push(IntegrationVerificationEntry {
                    orchestration_id: record.orchestration_id.clone(),
                    candidate_id: record.candidate_id.clone(),
                    route_id: record.route_id.clone(),
                    verify_after_ms: now_ms.max(record.updated_at.saturating_add(60_000)),
                    requirement: "verify integrated autoresearch route before promotion closure"
                        .to_owned(),
                })
            }
            OrchestrationState::Promoted
            | OrchestrationState::Discarded
            | OrchestrationState::Abandoned => {}
        }
    }

    let suppression_windows = state
        .candidates
        .iter()
        .filter_map(|record| {
            record
                .candidate
                .observation_evidence
                .fingerprint
                .as_ref()
                .map(|fingerprint| ContinuityHint {
                    kind: "suppression_window".to_owned(),
                    summary: format!(
                        "fingerprint {} remains suppressed for source {}",
                        fingerprint, record.candidate.observation_evidence.source_uri
                    ),
                    candidate_id: Some(record.candidate_id.clone()),
                    route_id: None,
                    orchestration_id: None,
                })
        })
        .collect::<Vec<_>>();

    let mut continuity_hints = Vec::new();
    continuity_hints.extend(pending_articulations.clone());
    continuity_hints.extend(pending_integrations.clone());
    continuity_hints.extend(user_validation_awaits.clone());
    continuity_hints.extend(suppression_windows.clone());
    continuity_hints.extend(verification_schedule.iter().map(|entry| ContinuityHint {
        kind: "integration_verification".to_owned(),
        summary: format!(
            "route {} requires verification after {}",
            entry.route_id, entry.verify_after_ms
        ),
        candidate_id: Some(entry.candidate_id.clone()),
        route_id: Some(entry.route_id.clone()),
        orchestration_id: Some(entry.orchestration_id.clone()),
    }));

    CrossCycleContinuity {
        continuity_hints,
        pending_articulations,
        pending_integrations,
        user_validation_awaits,
        suppression_windows,
        verification_schedule,
    }
}

fn continuity_hint(kind: &str, record: &OrchestrationRecord, summary: &str) -> ContinuityHint {
    ContinuityHint {
        kind: kind.to_owned(),
        summary: summary.to_owned(),
        candidate_id: Some(record.candidate_id.clone()),
        route_id: Some(record.route_id.clone()),
        orchestration_id: Some(record.orchestration_id.clone()),
    }
}

fn typed_candidate_from_proposal(
    run_id: &str,
    request: &ProposeRequest,
    challenger: ArtifactRef,
    surfaced_at: u128,
) -> Result<ImprovementCandidate, String> {
    let target = infer_target_subsystem(request);
    let vector = default_vector_for(target);
    let mut candidate = spine::ImprovementCandidate::from_propose(
        request.clone(),
        target,
        vector,
        SurfacingPipelineId::EpiiOnEpiiMeta,
        spine::ObservationEvidence {
            source_uri: request.baseline.path.clone(),
            summary: "ProposeRequest baseline promoted into typed spine evidence".to_owned(),
            observed_at: Some(surfaced_at),
            fingerprint: Some(run_id.to_owned()),
        },
        surfaced_at,
        SurfaceActor::Epii,
        SensitivityClass::PublicCurrent,
    )?;
    candidate.challenger_artifact = Some(challenger);
    candidate.linkage.originating_review_item = request.source_review_item_id.clone();
    Ok(candidate)
}

fn infer_target_subsystem(request: &ProposeRequest) -> TargetSubsystem {
    let haystack = format!(
        "{} {} {}",
        request.target_family, request.target_coordinate, request.direction
    )
    .to_ascii_lowercase();
    if haystack.contains("s0") || haystack.contains("m0") || haystack.contains("anuttara") {
        TargetSubsystem::Anuttara
    } else if haystack.contains("s1") || haystack.contains("m1") || haystack.contains("paramasiva")
    {
        TargetSubsystem::Paramasiva
    } else if haystack.contains("s2") || haystack.contains("m2") || haystack.contains("parashakti")
    {
        TargetSubsystem::Parashakti
    } else if haystack.contains("s3") || haystack.contains("m3") || haystack.contains("mahamaya") {
        TargetSubsystem::Mahamaya
    } else if haystack.contains("s4") || haystack.contains("m4") || haystack.contains("nara") {
        TargetSubsystem::Nara
    } else {
        TargetSubsystem::Epii
    }
}

fn default_vector_for(target: TargetSubsystem) -> spine::ImprovementVectorKind {
    match target {
        TargetSubsystem::Anuttara => spine::ImprovementVectorKind::AnuttaraShapeRefinement,
        TargetSubsystem::Paramasiva => spine::ImprovementVectorKind::ParamasivaRetrievalGapFilling,
        TargetSubsystem::Parashakti => {
            spine::ImprovementVectorKind::ParashaktiKleinHandlingRefinement
        }
        TargetSubsystem::Mahamaya => spine::ImprovementVectorKind::MahamayaProcessRewardRefinement,
        TargetSubsystem::Nara => spine::ImprovementVectorKind::NaraDialogueCorpusAddition,
        TargetSubsystem::Epii => spine::ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "proposal".to_owned(),
        },
    }
}

fn weighted_score(
    evidence: &[EvaluationEvidence],
    score: impl Fn(&EvaluationEvidence) -> f64,
) -> f64 {
    let total_weight = evidence.iter().map(|item| item.weight).sum::<f64>();
    if total_weight == 0.0 {
        return 0.0;
    }
    evidence
        .iter()
        .map(|item| score(item) * item.weight)
        .sum::<f64>()
        / total_weight
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

fn validate_destination_for_run(
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

fn validate_approved_review(
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

fn target_agent_for_destination(destination: &PromotionDestination) -> TargetAgent {
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

fn rollback_plan_for(destination: &PromotionDestination) -> RollbackPlan {
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

fn system_hen_timestamp() -> HenTimestamp {
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

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
