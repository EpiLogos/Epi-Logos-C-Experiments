//! Core autoresearch value types (improvement runs, candidates, routes, receipts).
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F2 — "split type-defs
//! out of the façade". These are pure data definitions; the `ImprovementStore` impl
//! and the free helper/validator functions remain in the crate root, which re-exports
//! everything here via `pub use types::*` so the public API is unchanged.

use serde::{Deserialize, Serialize};

use crate::inbox;
use crate::kernel_evidence::KernelEvidence;
use crate::spine::{ClosureKind, ContentTypeRegister, ImprovementCandidate, TargetSubsystem};

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

/// Classifies the terminal mechanism observed across a verified CPT failure
/// cluster. The values are intentionally stable because Aletheia and
/// Mercurius consume them as structured routing input rather than log text.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TerminalAgentMechanism {
    EksftMaskOverfit,
    EpistemicLeakage,
    EvalCorpusUnderRepresented,
    RegisterDrift,
    OtherKnown(String),
    Unknown(String),
}

/// The next intervention class proposed from a verified CPT failure cluster.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionabilityClass {
    PromptTune,
    MaskRetune,
    EvalCorpusExpand,
    TeacherSwap,
    UserIntervention,
}

/// Verifier-grounded CPT failure evidence for the autoresearch feedback loop.
///
/// This remains separate from `ImprovementRun`: a signature explains why a
/// training attempt failed, while an improvement run owns the candidate's
/// lifecycle and promotion decision.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FailureSignature {
    pub cluster_size: usize,
    pub shared_trace_symptom: String,
    pub verifier_evidence: Vec<String>,
    pub terminal_agent_mechanism: TerminalAgentMechanism,
    pub estimated_actionability: ActionabilityClass,
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
    /// CCT-17b (d): the load-bearing retrieval anchor — where in which
    /// artifact this evidence lives, at which kernel tick it was valid.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anchor: Option<EvidenceAnchor>,
}

/// CCT-17b (d): a span-anchored evidence pointer. `span` carries the same
/// `{line_start}-{line_end}` shape as `c_1_source_artifact_span`; the
/// anchor makes wikilink/graph evidence dereferenceable instead of
/// narrative.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvidenceAnchor {
    /// Vault | Repo | GraphBimba | Gnosis | World
    pub artifact_kind: EvidenceArtifactKind,
    /// Filesystem path or bimba-coordinate path.
    pub path: String,
    /// S5 Graphiti arc id OR gnosis node id, when the passage lives there.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub passage_id: Option<String>,
    /// Source line range — load-bearing for retrieval.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub span: Option<TextSpan>,
    /// The kernel tick this anchor was valid at.
    pub retrieved_at_tick: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum EvidenceArtifactKind {
    Vault,
    Repo,
    GraphBimba,
    Gnosis,
    World,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct TextSpan {
    pub line_start: u32,
    pub line_end: u32,
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
