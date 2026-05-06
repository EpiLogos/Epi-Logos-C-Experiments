use std::path::Path;

use epi_s5_epii_review_core::{
    ReviewInboxFilter, ReviewResolveRequest, ReviewSource, ReviewStatus, ReviewStore,
    ReviewSubmission,
};
use serde_json::{json, Value};

pub fn submit(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let submission: ReviewSubmission =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let item = store(state_root).submit(submission)?;
    Ok(json!({ "item": item }))
}

pub fn inbox(
    state_root: impl AsRef<Path>,
    status: Option<ReviewStatus>,
    source: Option<ReviewSource>,
    limit: Option<usize>,
) -> Result<Value, String> {
    let inbox = store(state_root).inbox(ReviewInboxFilter {
        status,
        source,
        limit,
    })?;
    serde_json::to_value(inbox).map_err(|err| err.to_string())
}

pub fn resolve(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: ReviewResolveRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let resolution = store(state_root).resolve(request)?;
    Ok(json!({ "resolution": resolution }))
}

pub fn history(state_root: impl AsRef<Path>, limit: Option<usize>) -> Result<Value, String> {
    let history = store(state_root).history(limit)?;
    serde_json::to_value(history).map_err(|err| err.to_string())
}

fn store(state_root: impl AsRef<Path>) -> ReviewStore {
    ReviewStore::new(state_root.as_ref().join("s5").join("epii-review"))
}
