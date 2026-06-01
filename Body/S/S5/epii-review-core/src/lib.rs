use serde::de::{Error as DeError, Visitor};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewSource {
    HumanGate,
    Anima,
    Aletheia,
    Autoresearch,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewStatus {
    Open,
    Resolved,
    Deferred,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewDecision {
    Approve,
    Reject,
    Revise,
    Defer,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewPriority {
    Low,
    Normal,
    High,
    Blocking,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewCategory {
    StandardImprovement,
    DeploymentGate,
    UserFinalValidation,
    RecursiveSelfModification,
    NaraAnimaPrimaryGate,
    AletheiaCrystallisation,
    CanonRecognitionPublicationGate,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GateKind {
    Standard,
    HumanFinal,
    DeploymentGate,
    RecursiveSelfModification,
    AnimaPrimary,
    PublicationGate,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GovernanceLevel {
    Advisory,
    HumanRequired,
    DeploymentBlocking,
    RecursiveLoadBearing,
    PublicationBlocking,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ResolutionActor {
    Human,
    Agent(String),
}

impl Serialize for ResolutionActor {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            ResolutionActor::Human => serializer.serialize_str("human"),
            ResolutionActor::Agent(agent_id) => serializer.serialize_str(agent_id),
        }
    }
}

impl<'de> Deserialize<'de> for ResolutionActor {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct ResolutionActorVisitor;

        impl Visitor<'_> for ResolutionActorVisitor {
            type Value = ResolutionActor;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("human or an agent id string")
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: DeError,
            {
                if value == "human" {
                    Ok(ResolutionActor::Human)
                } else if value.trim().is_empty() {
                    Err(E::custom("resolved_by must not be empty"))
                } else {
                    Ok(ResolutionActor::Agent(value.to_owned()))
                }
            }
        }

        deserializer.deserialize_str(ResolutionActorVisitor)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewProposedAction {
    pub kind: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub destination: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub payload: Option<Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReviewStageRecord {
    pub stage: String,
    pub actor: String,
    pub at_ms: u128,
    pub note: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GovernanceProfile {
    pub category: ReviewCategory,
    pub gate_kind: GateKind,
    pub governance_level: GovernanceLevel,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub required_actors: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidate_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub orchestration_id: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub source_artifact_refs: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target_subsystem: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vector_kind: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub promotion_destination: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_actor_detail: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub stage_records: Vec<ReviewStageRecord>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewSubmission {
    pub source: ReviewSource,
    pub title: String,
    pub body: String,
    pub priority: ReviewPriority,
    pub coordinate_context: Value,
    pub proposed_action: Option<ReviewProposedAction>,
    pub requires_human: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kernel_visibility: Option<KernelReviewVisibility>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub governance_profile: Option<GovernanceProfile>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewInboxItem {
    pub item_id: String,
    pub source: ReviewSource,
    pub title: String,
    pub body: String,
    pub priority: ReviewPriority,
    pub status: ReviewStatus,
    pub coordinate_context: Value,
    pub proposed_action: Option<ReviewProposedAction>,
    pub requires_human: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kernel_visibility: Option<KernelReviewVisibility>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub governance_profile: Option<GovernanceProfile>,
    pub created_at: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct KernelReviewVisibility {
    pub projection: Value,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub energy_delta: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resonance_delta: Option<String>,
    pub musical_readiness: String,
    pub visual_readiness: String,
    pub advisory_only: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewResolveRequest {
    pub item_id: String,
    pub decision: ReviewDecision,
    pub rationale: String,
    pub resolved_by: ResolutionActor,
    pub promotion_destination: Option<String>,
    pub promoted_artifact: Option<Value>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewResolution {
    pub item_id: String,
    pub decision: ReviewDecision,
    pub rationale: String,
    pub resolved_by: ResolutionActor,
    pub resolved_at: u128,
    pub promotion_destination: Option<String>,
    pub promoted_artifact: Option<Value>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ReviewInboxFilter {
    pub status: Option<ReviewStatus>,
    pub source: Option<ReviewSource>,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewInbox {
    pub items: Vec<ReviewInboxItem>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewHistory {
    pub items: Vec<ReviewInboxItem>,
    pub resolutions: Vec<ReviewResolution>,
}

#[derive(Debug, Clone)]
pub struct ReviewStore {
    root: PathBuf,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct ReviewState {
    #[serde(default)]
    items: Vec<ReviewInboxItem>,
    #[serde(default)]
    resolutions: Vec<ReviewResolution>,
}

impl ReviewStore {
    pub fn new(root: impl AsRef<Path>) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
        }
    }

    pub fn submit(&self, submission: ReviewSubmission) -> Result<ReviewInboxItem, String> {
        validate_submission(&submission)?;

        let mut state = self.load_state()?;
        let item = ReviewInboxItem {
            item_id: Uuid::new_v4().to_string(),
            source: submission.source,
            title: submission.title,
            body: submission.body,
            priority: submission.priority,
            status: ReviewStatus::Open,
            coordinate_context: submission.coordinate_context,
            proposed_action: submission.proposed_action,
            requires_human: submission.requires_human,
            kernel_visibility: submission.kernel_visibility,
            governance_profile: submission.governance_profile,
            created_at: now_ms(),
        };
        state.items.push(item.clone());
        self.save_state(&state)?;
        Ok(item)
    }

    pub fn inbox(&self, filter: ReviewInboxFilter) -> Result<ReviewInbox, String> {
        let mut items = self
            .load_state()?
            .items
            .into_iter()
            .filter(|item| {
                filter.status.map_or(true, |status| item.status == status)
                    && filter.source.map_or(true, |source| item.source == source)
            })
            .collect::<Vec<_>>();

        items.sort_by(|left, right| {
            priority_rank(right.priority)
                .cmp(&priority_rank(left.priority))
                .then_with(|| left.created_at.cmp(&right.created_at))
        });

        if let Some(limit) = filter.limit {
            items.truncate(limit);
        }

        Ok(ReviewInbox { items })
    }

    pub fn resolve(&self, request: ReviewResolveRequest) -> Result<ReviewResolution, String> {
        validate_resolution(&request)?;

        let mut state = self.load_state()?;
        let item = state
            .items
            .iter_mut()
            .find(|item| item.item_id == request.item_id)
            .ok_or_else(|| format!("review item not found: {}", request.item_id))?;

        if requires_human_resolution(item, request.decision)
            && request.resolved_by != ResolutionActor::Human
        {
            return Err(format!(
                "review item {} requires human resolution",
                request.item_id
            ));
        }

        item.status = match request.decision {
            ReviewDecision::Defer => ReviewStatus::Deferred,
            ReviewDecision::Approve | ReviewDecision::Reject | ReviewDecision::Revise => {
                ReviewStatus::Resolved
            }
        };

        let resolution = ReviewResolution {
            item_id: request.item_id,
            decision: request.decision,
            rationale: request.rationale,
            resolved_by: request.resolved_by,
            resolved_at: now_ms(),
            promotion_destination: request.promotion_destination,
            promoted_artifact: request.promoted_artifact,
        };
        state.resolutions.push(resolution.clone());
        self.save_state(&state)?;
        Ok(resolution)
    }

    pub fn history(&self, limit: Option<usize>) -> Result<ReviewHistory, String> {
        let state = self.load_state()?;
        let mut items = state
            .items
            .into_iter()
            .filter(|item| item.status != ReviewStatus::Open)
            .collect::<Vec<_>>();
        let mut resolutions = state.resolutions;

        items.sort_by(|left, right| right.created_at.cmp(&left.created_at));
        resolutions.sort_by(|left, right| right.resolved_at.cmp(&left.resolved_at));

        if let Some(limit) = limit {
            items.truncate(limit);
            resolutions.truncate(limit);
        }

        Ok(ReviewHistory { items, resolutions })
    }

    fn state_path(&self) -> PathBuf {
        self.root.join("s5-review-state.json")
    }

    fn load_state(&self) -> Result<ReviewState, String> {
        let path = self.state_path();
        if !path.exists() {
            return Ok(ReviewState::default());
        }

        let contents =
            fs::read_to_string(&path).map_err(|err| format!("{}: {err}", path.display()))?;
        serde_json::from_str(&contents).map_err(|err| format!("{}: {err}", path.display()))
    }

    fn save_state(&self, state: &ReviewState) -> Result<(), String> {
        fs::create_dir_all(&self.root).map_err(|err| format!("{}: {err}", self.root.display()))?;
        let path = self.state_path();
        let encoded = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
        fs::write(&path, encoded).map_err(|err| format!("{}: {err}", path.display()))
    }
}

fn validate_submission(submission: &ReviewSubmission) -> Result<(), String> {
    if submission.title.trim().is_empty() {
        return Err("review title is required".to_owned());
    }
    if submission.body.trim().is_empty() {
        return Err("review body is required".to_owned());
    }
    if !submission.coordinate_context.is_object() {
        return Err("coordinate_context must be an object".to_owned());
    }
    if let Some(kernel_visibility) = &submission.kernel_visibility {
        validate_kernel_visibility(kernel_visibility)?;
    }
    if let Some(governance) = &submission.governance_profile {
        validate_governance_profile(governance)?;
    }
    Ok(())
}

fn validate_governance_profile(profile: &GovernanceProfile) -> Result<(), String> {
    if profile
        .required_actors
        .iter()
        .any(|actor| actor.trim().is_empty())
    {
        return Err("governance required_actors must not contain blanks".to_owned());
    }
    if profile
        .source_artifact_refs
        .iter()
        .any(|artifact| artifact.trim().is_empty())
    {
        return Err("governance source_artifact_refs must not contain blanks".to_owned());
    }
    if profile
        .target_subsystem
        .as_deref()
        .is_some_and(|value| value.trim().is_empty())
    {
        return Err("governance target_subsystem must not be blank".to_owned());
    }
    if profile
        .vector_kind
        .as_deref()
        .is_some_and(|value| value.trim().is_empty())
    {
        return Err("governance vector_kind must not be blank".to_owned());
    }
    Ok(())
}

fn requires_human_resolution(item: &ReviewInboxItem, decision: ReviewDecision) -> bool {
    if decision == ReviewDecision::Defer {
        return false;
    }
    if item.requires_human {
        return true;
    }
    let Some(profile) = &item.governance_profile else {
        return false;
    };
    matches!(
        profile.category,
        ReviewCategory::DeploymentGate
            | ReviewCategory::UserFinalValidation
            | ReviewCategory::RecursiveSelfModification
            | ReviewCategory::CanonRecognitionPublicationGate
    ) || matches!(
        profile.gate_kind,
        GateKind::HumanFinal
            | GateKind::DeploymentGate
            | GateKind::RecursiveSelfModification
            | GateKind::PublicationGate
    ) || matches!(
        profile.governance_level,
        GovernanceLevel::HumanRequired
            | GovernanceLevel::DeploymentBlocking
            | GovernanceLevel::RecursiveLoadBearing
            | GovernanceLevel::PublicationBlocking
    )
}

fn validate_kernel_visibility(visibility: &KernelReviewVisibility) -> Result<(), String> {
    if !visibility.advisory_only {
        return Err("kernel visibility must be advisory_only".to_owned());
    }
    if visibility.musical_readiness.trim().is_empty() {
        return Err("kernel visibility musical_readiness is required".to_owned());
    }
    if visibility.visual_readiness.trim().is_empty() {
        return Err("kernel visibility visual_readiness is required".to_owned());
    }
    if visibility
        .projection
        .pointer("/privacy")
        .and_then(Value::as_str)
        != Some("safe-public-current-kernel-tick")
    {
        return Err(
            "kernel visibility projection privacy must be safe-public-current-kernel-tick"
                .to_owned(),
        );
    }
    if visibility
        .projection
        .pointer("/computationSource")
        .and_then(Value::as_str)
        != Some("portal-core::KernelProjection")
    {
        return Err(
            "kernel visibility projection computationSource must be portal-core::KernelProjection"
                .to_owned(),
        );
    }
    if visibility.projection.get("bioquaternion").is_some()
        || visibility
            .projection
            .get("resonanceSquareEmphasis")
            .is_some()
    {
        return Err("kernel visibility must not expose protected kernel fields".to_owned());
    }
    Ok(())
}

fn validate_resolution(request: &ReviewResolveRequest) -> Result<(), String> {
    if request.item_id.trim().is_empty() {
        return Err("item_id is required".to_owned());
    }
    if request.rationale.trim().is_empty() {
        return Err("resolution rationale is required".to_owned());
    }
    Ok(())
}

fn priority_rank(priority: ReviewPriority) -> u8 {
    match priority {
        ReviewPriority::Low => 0,
        ReviewPriority::Normal => 1,
        ReviewPriority::High => 2,
        ReviewPriority::Blocking => 3,
    }
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
