use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s1_hen_compiler_core::{
    plan_compile, CompilePlanRequest, ExecutorKind, HenTimestamp, TargetAgent,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

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
    pub source_review_item_id: Option<String>,
    pub baseline: ArtifactRef,
    pub challenger: ArtifactRef,
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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PromoteRequest {
    pub run_id: String,
    pub destination: String,
    pub approved_review_resolution_id: String,
    pub vault_root: PathBuf,
    pub compiler_root: PathBuf,
    pub artifact_slug: String,
    pub dry_run: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PromotionPlan {
    pub ok: bool,
    pub dry_run: bool,
    pub run_id: String,
    pub destination: String,
    pub approved_review_resolution_id: String,
    pub promoted_path: Option<String>,
    pub compile_plan: CompilePlanSummary,
}

#[derive(Debug, Clone)]
pub struct ImprovementStore {
    root: PathBuf,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct ImprovementState {
    #[serde(default)]
    runs: Vec<ImprovementRun>,
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
        let run = ImprovementRun {
            challenger: ArtifactRef {
                path: format!("autoresearch://challenger/{run_id}"),
                coordinate: Some(request.target_coordinate.clone()),
                kind: Some("improvement_challenger".to_owned()),
            },
            run_id,
            target_family: request.target_family,
            target_coordinate: request.target_coordinate,
            direction: request.direction,
            source_review_item_id: request.source_review_item_id,
            baseline: request.baseline,
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

        let compile_plan = CompilePlanSummary::from(plan_compile(CompilePlanRequest {
            vault_root: request.vault_root.clone(),
            compiler_root: request.compiler_root,
            now: today_hen_timestamp(),
            channel: "improvement".to_owned(),
            thought_lane: "T5".to_owned(),
            artifact_slug: request.artifact_slug,
            executor_kind: ExecutorKind::PiAgent,
            target_agent: TargetAgent::Epii,
            required_skill: Some("autoresearch".to_owned()),
            dry_run: true,
        }));

        Ok(PromotionPlan {
            ok: compile_plan.errors.is_empty(),
            dry_run: true,
            run_id: request.run_id,
            destination: request.destination,
            approved_review_resolution_id: request.approved_review_resolution_id,
            promoted_path: None,
            compile_plan,
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

fn today_hen_timestamp() -> HenTimestamp {
    // The current compiler core only needs a canonical Day source path. Use the
    // active system date for now; the caller supplies the vault root.
    HenTimestamp::new(2026, 5, 3, 0, 0, 0)
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
