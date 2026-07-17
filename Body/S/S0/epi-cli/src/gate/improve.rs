//! S0 gate adapter for the S5 autoresearch (improvement) surface.
//!
//! 13.T7 audit (2026-06-02): `status`, `propose`, `evaluate`, `promote`,
//! `history`, and `q_review.{run,latest}` are **thin adapters** over
//! `epi_s5_epii_autoresearch_core`. No improvement DTOs or detector policy is
//! constructed in S0; gateway JSON is deserialised directly into S5 request
//! structs and Q-review policy is loaded by S5 from `[autoresearch]` config.
//!
//! Governance ownership:
//! - The S5 core's `ImprovementStore::promote` already calls
//!   `validate_approved_review`, which is the authoritative S5 governance
//!   check (matches `ReviewCategory` to `PromotionDestination`, enforces
//!   `governance_level` and `gate_kind`, etc.).
//! - The local `ensure_approved_review` helper below performs a single
//!   pre-check (resolution exists + decision == Approve) so the gate can
//!   surface a friendlier "approved Epii review resolution is required"
//!   error before invoking the S5 promote pipeline. It is **not** the
//!   governance authority — it is a UX guard. The
//!   `tranche-13.T7 follow-up` (in anima's lane: `Body/S/S5/**`) is to
//!   expose `ImprovementStore::ensure_approved_review` (or surface
//!   `validate_approved_review` as `pub`) so S0 can drop this duplicate
//!   guard and call the S5 helper directly. Do not move code into S5 during
//!   anima's active edit on 09.T7.
//!
//! Store root: `state_root/s5/epii-autoresearch`. Review store root:
//! `state_root/s5/epii-review` (read-only here, the review/promote linkage
//! is enforced inside S5 `validate_approved_review`).

use std::path::{Path, PathBuf};

use epi_s2_graph_services::{Neo4jClient, Neo4jConfig};
use epi_s5_epii_autoresearch_core::{
    CorpusSnapshot, EvaluationEvidence, ImprovementStore, PromoteRequest, ProposeRequest,
    QDetectorConfig, QReviewStore,
};
use epi_s5_epii_review_core::{ReviewDecision, ReviewStore};
use serde::Deserialize;
use serde_json::{json, Value};

/// Canonical subpath under `state_root` where the S5 autoresearch
/// (improvement) store persists. Exposed for store-location tests.
pub const STORE_SUBPATH: [&str; 2] = ["s5", "epii-autoresearch"];

/// Resolve the S5 autoresearch store root under the given gate `state_root`.
/// Sole source of truth for the autoresearch store location at the S0/S5
/// boundary.
pub fn improvement_store_path(state_root: impl AsRef<Path>) -> PathBuf {
    let mut path = state_root.as_ref().to_path_buf();
    for segment in STORE_SUBPATH {
        path.push(segment);
    }
    path
}

#[derive(Debug, Deserialize)]
struct EvaluateParams {
    run_id: String,
    evidence: Vec<EvaluationEvidence>,
}

#[derive(Debug, Deserialize)]
struct QReviewRunParams {
    corpus_snapshot: CorpusSnapshot,
    last_review_epoch: u64,
}

#[derive(Debug, Deserialize)]
struct QReviewLatestParams {
    day_id: String,
    #[serde(default)]
    cf: Option<String>,
}

#[derive(Debug, Deserialize)]
struct QReviewNightPassParams {
    day_id: String,
    #[serde(default)]
    last_review_epoch: u64,
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    serde_json::to_value(store(state_root).status()?).map_err(|err| err.to_string())
}

pub fn propose(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: ProposeRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let run = store(state_root).propose(request)?;
    Ok(json!({ "run": run }))
}

pub fn evaluate(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: EvaluateParams =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let run = store(state_root).evaluate(&request.run_id, request.evidence)?;
    Ok(json!({ "run": run }))
}

pub fn promote(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let state_root = state_root.as_ref();
    let request: PromoteRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    ensure_approved_review(state_root, &request.approved_review_resolution_id)?;
    serde_json::to_value(store(state_root).promote(request)?).map_err(|err| err.to_string())
}

pub fn history(state_root: impl AsRef<Path>, limit: Option<usize>) -> Result<Value, String> {
    serde_json::to_value(store(state_root).history(limit)?).map_err(|err| err.to_string())
}

pub fn q_review_run(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: QReviewRunParams =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    serde_json::to_value(q_review_store(state_root).run(
        request.corpus_snapshot,
        request.last_review_epoch,
        &QDetectorConfig::load_from_default_path()?,
    )?)
    .map_err(|err| err.to_string())
}

pub fn q_review_latest(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: QReviewLatestParams =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    serde_json::to_value(q_review_store(state_root).latest(&request.day_id, request.cf.as_deref())?)
        .map_err(|err| err.to_string())
}

pub async fn q_review_night_pass(
    state_root: impl AsRef<Path>,
    params: &Value,
) -> Result<Value, String> {
    let request: QReviewNightPassParams =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let client = Neo4jClient::connect(&Neo4jConfig::from_env())
        .map_err(|err| format!("Q-review night pass graph connection failed: {err}"))?;
    serde_json::to_value(
        q_review_store(state_root)
            .run_night_pass(
                &client,
                &request.day_id,
                request.last_review_epoch,
                &QDetectorConfig::load_from_default_path()?,
            )
            .await?,
    )
    .map_err(|err| err.to_string())
}

fn store(state_root: impl AsRef<Path>) -> ImprovementStore {
    ImprovementStore::new(improvement_store_path(state_root))
}

fn q_review_store(state_root: impl AsRef<Path>) -> QReviewStore {
    QReviewStore::new(improvement_store_path(state_root))
}

fn review_store(state_root: impl AsRef<Path>) -> ReviewStore {
    ReviewStore::new(super::review::review_store_path(state_root))
}

fn ensure_approved_review(state_root: &Path, review_item_id: &str) -> Result<(), String> {
    let history = review_store(state_root).history(None)?;
    let approved = history.resolutions.iter().any(|resolution| {
        resolution.item_id == review_item_id && resolution.decision == ReviewDecision::Approve
    });

    if approved {
        Ok(())
    } else {
        Err(format!(
            "approved Epii review resolution is required before autoresearch promotion: {review_item_id}"
        ))
    }
}
