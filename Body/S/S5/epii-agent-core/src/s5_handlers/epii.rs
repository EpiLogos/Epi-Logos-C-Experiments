//! The `s5'.epii.deposit*` adapter, resident at the coordinate that owns it.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | [[S5]] / S5' — Epii agent surface |
//! | Residency  | `Body/S/S5/epii-agent-core/src/s5_handlers/epii.rs` |
//! | Position (#n) | #5 — the Anima → Epii deposit write path and its read sibling |
//! | Actualises | [[S5-SPEC]] Epii agent access, Track 53 T53.08 |
//! | Public surface | [`deposit`], [`deposit_list`] |
//! | Does NOT own | Method routing, transport, session/temporal context, Gnosis retrieval, or the world-return status envelope — all of which stayed behind as cross-coordinate composites |
//! | Contract | [[S5-SPEC]] / [[S3-SPEC]] |
//!
//! # Relocation note (Track 53)
//!
//! Only **part** of `Body/S/S0/epi-cli/src/gate/epii.rs` relocated. The two
//! functions here reach nothing but `EpiiAgentAccess`, so they belong at their
//! coordinate. Their siblings do not, and stayed:
//!
//! * `status` folds in a world-return envelope assembled from the Gnosis
//!   config/notebook/ingest modules, the `nara.*` dispatcher, and the graphiti
//!   status probe.
//! * `runtime_context` reads the gateway session store, the temporal context
//!   builder, the SpacetimeDB readiness probe, and the parity port constant.
//! * `gnosis_context_retrieve` runs the local Gnosis query pipeline.
//! * `user_orientation` reads the pratibimba temporal surface and the cached
//!   Kairos snapshot.
//!
//! Those four are cross-coordinate composites: their bodies are S0/S2/S3
//! joins wearing an `s5'` name. Splitting them here would either drag
//! epi-cli internals into S5 or leave a half-handler behind, so they are named
//! for the composition root rather than moved.
//!
//! `capability_envelope` — the per-agent capability matrix that the original
//! module flagged for extraction into `EpiiAgentAccess` — is used *only* by the
//! two composites that stayed, so it stayed with them. Copying it here would
//! create a second source of truth for a governance matrix, which is worse than
//! leaving the flagged follow-up open.

use std::path::Path;

use serde_json::{json, Value};

use crate::{DepositRequest, EpiiAgentAccess, ReviewInboxFilter, ReviewInboxItem, ReviewStatus};

pub fn deposit(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: DepositRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    serde_json::to_value(access(state_root).deposit(request)?).map_err(|err| err.to_string())
}

/// The read sibling of `deposit`. A deposit lands as a review item (see
/// `EpiiAgentAccess::deposit`, which submits into the review store), so listing
/// deposits is a PROJECTION of that store — the adapter does not keep a second
/// deposit ledger beside it, which is exactly how the two would drift.
///
/// A review item is a deposit iff its `coordinate_context` carries a
/// `deposit_type`; items submitted through the plain review path have none and
/// are not deposits, so they are skipped rather than relabelled.
fn deposit_view(item: &ReviewInboxItem, kind: &str) -> Value {
    let context = &item.coordinate_context;
    let field = |key: &str| context.get(key).cloned().unwrap_or(Value::Null);
    json!({
        "itemId": item.item_id,
        "depositType": kind,
        "title": item.title,
        "body": item.body,
        "status": item.status,
        "priority": item.priority,
        "requiresHuman": item.requires_human,
        "createdAt": item.created_at,
        "sourceAgent": field("source_agent"),
        "sourceCoordinate": field("source_coordinate"),
        "artifact": field("artifact"),
        "dayId": field("day_id"),
        "nowPath": field("now_path"),
        "sessionKey": field("session_key"),
        "inboxPath": field("inbox_path"),
        // The claim half of a MediatedRunEvidencePacket. Null for a deposit
        // filed without it — the Evidence fold then has no packet to compose,
        // which is a different thing from a packet with empty anchors.
        //
        // T53.07: this line was dropped in the relocation and the live
        // deposit round-trip caught it (evidenceAnchors read Null instead of
        // the deposited candidate id). Relocation means every field survives,
        // including the ones no unit test names.
        "evidenceAnchors": field("evidence_anchors"),
        "proposedAction": item.proposed_action
    })
}

fn parse_review_status(raw: &str) -> Result<ReviewStatus, String> {
    match raw {
        "open" => Ok(ReviewStatus::Open),
        "resolved" => Ok(ReviewStatus::Resolved),
        "deferred" => Ok(ReviewStatus::Deferred),
        other => Err(format!(
            "unknown status '{other}' — expected open, resolved or deferred"
        )),
    }
}

/// `s5'.epii.deposit.list` — 26.T26.10. Read-only.
pub fn deposit_list(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let status = optional_str(params, "status").map(parse_review_status).transpose()?;
    let wanted_type = optional_str(params, "depositType");
    let wanted_session = optional_str(params, "sessionKey");
    let limit = params
        .get("limit")
        .and_then(Value::as_u64)
        .map(|value| value as usize);

    let inbox = access(state_root).review_inbox(ReviewInboxFilter {
        status,
        source: None,
        // Deliberately NOT the store's limit. It truncates before the deposit
        // filter below, so passing it through would answer a request for N
        // deposits with fewer than N while still reporting success.
        limit: None,
    })?;

    let mut deposits: Vec<Value> = Vec::new();
    for item in &inbox.items {
        let Some(kind) = item
            .coordinate_context
            .get("deposit_type")
            .and_then(Value::as_str)
        else {
            continue; // a plain review item, not a deposit
        };
        if wanted_type.is_some_and(|want| want != kind) {
            continue;
        }
        if let Some(want) = wanted_session {
            let session = item
                .coordinate_context
                .get("session_key")
                .and_then(Value::as_str);
            if session != Some(want) {
                continue;
            }
        }
        deposits.push(deposit_view(item, kind));
    }

    // `matched` is the honest total BEFORE truncation, so a caller can tell a
    // page from the whole set.
    let matched = deposits.len();
    if let Some(limit) = limit {
        deposits.truncate(limit);
    }
    Ok(json!({
        "deposits": deposits,
        "matched": matched,
        "returned": deposits.len(),
        "governance_owner": "S5'",
        "storage_substrate": "S2"
    }))
}

fn access(state_root: impl AsRef<Path>) -> EpiiAgentAccess {
    EpiiAgentAccess::new(state_root)
}

fn optional_str<'a>(params: &'a Value, key: &str) -> Option<&'a str> {
    params.get(key).and_then(Value::as_str)
}
