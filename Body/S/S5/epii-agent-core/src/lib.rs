use std::path::{Path, PathBuf};

use epi_s5_epii_autoresearch_core::{
    ArtifactRef, ImprovementRun, ImprovementStore, ImprovementVector, ProposeRequest,
};
use epi_s5_epii_review_core::{
    ReviewInboxFilter, ReviewInboxItem, ReviewPriority, ReviewProposedAction, ReviewSource,
    ReviewStatus, ReviewStore, ReviewSubmission,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

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
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementAccessSnapshot {
    pub active_count: usize,
    pub active_vectors: Vec<ImprovementVector>,
    pub total_runs: usize,
    pub keep_count: usize,
    pub discard_count: usize,
    pub kernel_evidence_count: usize,
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
            },
            improvement: ImprovementAccessSnapshot {
                active_count: improve_status.active_vectors.len(),
                active_vectors: improve_status.active_vectors,
                total_runs: improve_status.total_runs,
                keep_count: improve_status.keep_count,
                discard_count: improve_status.discard_count,
                kernel_evidence_count: improve_status.kernel_evidence_count,
            },
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
        "s5'.improve.history",
        "s5'.epii.status",
        "s5'.epii.deposit",
        "s5'.epii.user.orientation",
        "s5'.epii.pratibimba.status",
        "s5'.epii.kairos.context",
    ]
    .iter()
    .map(|method| (*method).to_owned())
    .collect()
}
