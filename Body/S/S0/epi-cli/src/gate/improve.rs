use std::path::Path;

use epi_s5_epii_autoresearch_core::{
    EvaluationEvidence, ImprovementStore, PromoteRequest, ProposeRequest,
};
use epi_s5_epii_review_core::{ReviewDecision, ReviewStore};
use serde::Deserialize;
use serde_json::{json, Value};

#[derive(Debug, Deserialize)]
struct EvaluateParams {
    run_id: String,
    evidence: Vec<EvaluationEvidence>,
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

fn store(state_root: impl AsRef<Path>) -> ImprovementStore {
    ImprovementStore::new(state_root.as_ref().join("s5").join("epii-autoresearch"))
}

fn review_store(state_root: impl AsRef<Path>) -> ReviewStore {
    ReviewStore::new(state_root.as_ref().join("s5").join("epii-review"))
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
