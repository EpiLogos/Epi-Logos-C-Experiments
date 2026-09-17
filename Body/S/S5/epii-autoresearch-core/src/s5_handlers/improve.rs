//! The `s5'.improve.*` adapter, resident at the coordinate that owns it.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | [[S5]] / S5' — Epii autoresearch (improvement) authority |
//! | Residency  | `Body/S/S5/epii-autoresearch-core/src/s5_handlers/improve.rs` |
//! | Position (#n) | #5 — improvement proposal → evaluation → promotion |
//! | Actualises | [[S5-SPEC]] autoresearch governance, Track 53 T53.08 |
//! | Public surface | [`STORE_SUBPATH`], [`improvement_store_path`], [`status`], [`propose`], [`evaluate`], [`promote`], [`history`], [`q_review_run`], [`q_review_latest`], [`q_review_night_pass`] |
//! | Does NOT own | Method routing, transport, or the review store's own law (that is `epi-s5-epii-review-core`) |
//! | Contract | [[S5-SPEC]] / [[S3-SPEC]] |
//!
//! # Relocation note (Track 53)
//!
//! Relocated verbatim from `Body/S/S0/epi-cli/src/gate/improve.rs`. Its 13.T7
//! audit note stands, and the part of it that named a follow-up is now
//! *answerable in place* rather than across a layer boundary:
//!
//! > 13.T7 audit (2026-06-02): `status`, `propose`, `evaluate`, `promote`,
//! > `history`, and `q_review.{run,latest}` are **thin adapters** over the
//! > improvement store. No improvement DTOs or detector policy is constructed
//! > in the adapter; gateway JSON is deserialised directly into request structs
//! > and Q-review policy is loaded from `[autoresearch]` config.
//! >
//! > Governance ownership: `ImprovementStore::promote` already calls
//! > `validate_approved_review`, which is the authoritative governance check.
//! > The local `ensure_approved_review` helper below performs a single
//! > pre-check (resolution exists + decision == Approve) so the gate can
//! > surface a friendlier "approved Epii review resolution is required" error
//! > before invoking the promote pipeline. It is **not** the governance
//! > authority — it is a UX guard.
//!
//! The original recorded a follow-up to expose
//! `ImprovementStore::ensure_approved_review` so S0 could drop the duplicate
//! guard. That follow-up is deliberately **not** taken here: this is a
//! relocation, not a rewrite, and collapsing the guard would change which error
//! text a failed promotion returns. The duplication is now intra-S5, which is
//! where it can be resolved by a later track without touching the wire.
//!
//! Store root: `state_root/s5/epii-autoresearch`. Review store root:
//! `state_root/s5/epii-review` (read-only here; the review/promote linkage is
//! enforced inside `validate_approved_review`).

use std::path::{Path, PathBuf};

use epi_s2_graph_services::{Neo4jClient, Neo4jConfig};
use epi_s5_epii_review_core::s5_handlers::review_store_path;
use epi_s5_epii_review_core::{ReviewDecision, ReviewStore};
use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    CorpusSnapshot, EvaluationEvidence, ImprovementStore, PromoteRequest, ProposeRequest,
    QDetectorConfig, QReviewStore,
};

/// Canonical subpath under `state_root` where the S5 autoresearch
/// (improvement) store persists. Exposed for store-location tests.
pub const STORE_SUBPATH: [&str; 2] = ["s5", "epii-autoresearch"];

/// Resolve the S5 autoresearch store root under the given gate `state_root`.
/// Sole source of truth for the autoresearch store location.
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
    ReviewStore::new(review_store_path(state_root))
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
