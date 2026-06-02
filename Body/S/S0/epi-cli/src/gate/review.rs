//! S0 gate adapter for the S5 review surface.
//!
//! 13.T7 audit (2026-06-02): every public function in this module is a
//! **thin adapter** over `epi_s5_epii_review_core::ReviewStore`. Governance
//! policy (priority ranking, kernel-visibility constraints, human-gate
//! requirements, governance profile validation) lives entirely in S5
//! (`Body/S/S5/epii-review-core/src/lib.rs`). S0 is responsible only for:
//!
//! - deserialising gateway JSON params into S5 DTOs;
//! - selecting the S5 store root under `state_root/s5/epii-review` (see the
//!   `STORE_SUBPATH` constant — `review_store_path` is used by the
//!   `gate_epii_store_layout` test to keep the root stable);
//! - re-serialising S5 results for the gateway frame.
//!
//! No S5 DTO construction, no governance decisions, no business logic.

use std::path::{Path, PathBuf};

use epi_s5_epii_review_core::{
    ReviewInboxFilter, ReviewResolveRequest, ReviewSource, ReviewStatus, ReviewStore,
    ReviewSubmission,
};
use serde_json::{json, Value};

/// Canonical subpath under `state_root` where the S5 review store persists.
/// Exposed so external store-location tests can pin the gate root layout.
pub const STORE_SUBPATH: [&str; 2] = ["s5", "epii-review"];

/// Resolve the S5 review store root under the given gate `state_root`.
/// Sole source of truth for the review store location at the S0/S5 boundary.
pub fn review_store_path(state_root: impl AsRef<Path>) -> PathBuf {
    let mut path = state_root.as_ref().to_path_buf();
    for segment in STORE_SUBPATH {
        path.push(segment);
    }
    path
}

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
    ReviewStore::new(review_store_path(state_root))
}
