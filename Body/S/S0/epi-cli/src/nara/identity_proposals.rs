//! Identity-augment proposal review store (25.T25.14, DR-WC-M4-4)
//!
//! Coordinate: S0 (membrane) actualising M5' review-gate over M4 identity.
//! Residency: Body/S/S0/epi-cli/src/nara
//! Public surface: PersistedProposal, submit_proposal, list_pending, decide.
//! Does NOT own: the proposal state machine or the DR invariant — those live in
//!   `portal_core::personal_identity::IdentityAugmentProposalAdapter`. This is the
//!   persistence + orchestration seam that drives that adapter across RPC calls.
//!
//! The portal-core adapter is in-memory only; the `nara.identity.proposals.*`
//! RPCs need proposals to survive between a `list` read and a `decide` write, so
//! this module persists a parallel JSON ledger and reconstructs the adapter each
//! call to VALIDATE every transition against the canonical state machine. The
//! INVARIANT holds: `decide` only moves Proposed/Reviewed → Accepted/Rejected;
//! it NEVER calls `apply`, so Q_identity is never mutated here — the `applied`
//! verdict stays a separate governed mutation path (UX 10.1).

use std::path::Path;

use serde::{Deserialize, Serialize};

use portal_core::personal_identity::{
    IdentityAugmentProposal, IdentityAugmentProposalAdapter, IdentityAugmentProposalState,
    IdentityAugmentProposalView, IdentityAugmentReviewVerdict,
};

/// The persisted mirror of a `portal_core` proposal. The adapter's own proposal
/// type is not serializable (its candidate quaternion is private), so we persist
/// this parallel record and rebuild the adapter from it. `q_identity_candidate`
/// is retained for reconstruction fidelity and is NEVER surfaced (the review
/// view is handle-only, proven by portal-core's `surface_view_*` test).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PersistedProposal {
    pub proposal_handle: String,
    pub state: IdentityAugmentProposalState,
    pub summary: String,
    pub source_adapter_handle: String,
    pub created_at: String,
    #[serde(default)]
    pub reviewed_at: Option<String>,
    #[serde(default)]
    pub decided_at: Option<String>,
    #[serde(default)]
    pub applied_at: Option<String>,
    #[serde(default)]
    pub q_identity_candidate: [f32; 4],
}

fn load(store_path: &Path) -> Vec<PersistedProposal> {
    match std::fs::read_to_string(store_path) {
        Ok(text) => serde_json::from_str(&text).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

fn save(store_path: &Path, proposals: &[PersistedProposal]) -> Result<(), String> {
    if let Some(parent) = store_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create proposal store dir: {e}"))?;
    }
    let text = serde_json::to_string_pretty(proposals)
        .map_err(|e| format!("failed to serialize proposal store: {e}"))?;
    std::fs::write(store_path, text)
        .map_err(|e| format!("failed to write proposal store: {e}"))
}

/// Submit a new proposal into the store. Used by the producer path (and tests);
/// the `list`/`decide` RPCs never create proposals. Duplicate handles are refused.
pub fn submit_proposal(store_path: &Path, proposal: PersistedProposal) -> Result<(), String> {
    let mut proposals = load(store_path);
    if proposals
        .iter()
        .any(|existing| existing.proposal_handle == proposal.proposal_handle)
    {
        return Err(format!(
            "identity augment proposal already exists: {}",
            proposal.proposal_handle
        ));
    }
    proposals.push(proposal);
    save(store_path, &proposals)
}

/// Rebuild an adapter proposal at Proposed, then replay to Reviewed if needed.
/// The reconstructed proposal is always born Proposed; `review` moves it forward
/// exactly as the canonical state machine dictates.
fn reconstruct_into(
    adapter: &mut IdentityAugmentProposalAdapter,
    persisted: &PersistedProposal,
) -> Result<(), String> {
    let proposal = IdentityAugmentProposal::proposed(
        persisted.proposal_handle.clone(),
        persisted.summary.clone(),
        persisted.source_adapter_handle.clone(),
        persisted.created_at.clone(),
        persisted.q_identity_candidate,
    )
    .map_err(|e| e.to_string())?;
    adapter.submit(proposal).map_err(|e| e.to_string())?;
    if persisted.state == IdentityAugmentProposalState::Reviewed {
        let reviewed_at = persisted
            .reviewed_at
            .clone()
            .unwrap_or_else(|| persisted.created_at.clone());
        adapter
            .review(&persisted.proposal_handle, reviewed_at)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// The read half of panel (c): the pending (Proposed | Reviewed) proposal views,
/// wrapping `IdentityAugmentProposalAdapter::pending_proposal_views`. Terminal
/// proposals (Accepted/Rejected/Applied) are never surfaced as pending.
pub fn list_pending(store_path: &Path) -> Result<Vec<IdentityAugmentProposalView>, String> {
    let persisted = load(store_path);
    let mut adapter = IdentityAugmentProposalAdapter::new();
    for record in persisted.iter().filter(|record| {
        matches!(
            record.state,
            IdentityAugmentProposalState::Proposed | IdentityAugmentProposalState::Reviewed
        )
    }) {
        reconstruct_into(&mut adapter, record)?;
    }
    Ok(adapter.pending_proposal_views())
}

/// The write half of panel (c): accept/reject a pending proposal through the
/// M5' review gate. Drives the canonical adapter (review → decide) so an invalid
/// transition fails closed, then persists the terminal state. Never calls
/// `apply` — Q_identity is untouched.
pub fn decide(
    store_path: &Path,
    proposal_handle: &str,
    verdict: IdentityAugmentReviewVerdict,
    now: &str,
) -> Result<IdentityAugmentProposalView, String> {
    let mut persisted = load(store_path);
    let index = persisted
        .iter()
        .position(|record| record.proposal_handle == proposal_handle)
        .ok_or_else(|| format!("unknown identity augment proposal: {proposal_handle}"))?;

    if !matches!(
        persisted[index].state,
        IdentityAugmentProposalState::Proposed | IdentityAugmentProposalState::Reviewed
    ) {
        return Err(format!(
            "identity augment proposal `{proposal_handle}` is {:?} and cannot be accepted or rejected",
            persisted[index].state
        ));
    }

    // Drive the canonical state machine on a single-proposal adapter.
    let mut adapter = IdentityAugmentProposalAdapter::new();
    let proposal = IdentityAugmentProposal::proposed(
        persisted[index].proposal_handle.clone(),
        persisted[index].summary.clone(),
        persisted[index].source_adapter_handle.clone(),
        persisted[index].created_at.clone(),
        persisted[index].q_identity_candidate,
    )
    .map_err(|e| e.to_string())?;
    adapter.submit(proposal).map_err(|e| e.to_string())?;
    adapter
        .review(proposal_handle, now.to_owned())
        .map_err(|e| e.to_string())?;
    let view = adapter
        .decide(proposal_handle, verdict, now.to_owned())
        .map_err(|e| e.to_string())?;

    persisted[index].state = match verdict {
        IdentityAugmentReviewVerdict::Accept => IdentityAugmentProposalState::Accepted,
        IdentityAugmentReviewVerdict::Reject => IdentityAugmentProposalState::Rejected,
    };
    persisted[index].reviewed_at = Some(now.to_owned());
    persisted[index].decided_at = Some(now.to_owned());
    save(store_path, &persisted)?;

    Ok(view)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn store() -> std::path::PathBuf {
        std::env::temp_dir().join(format!(
            "identity-proposals-{}-{:?}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ))
    }

    fn proposed(handle: &str) -> PersistedProposal {
        PersistedProposal {
            proposal_handle: handle.to_owned(),
            state: IdentityAugmentProposalState::Proposed,
            summary: "Birthdate encoding layer ready for M5 review.".to_owned(),
            source_adapter_handle: "adapter://m4/identity-augment".to_owned(),
            created_at: "2026-07-22T09:00:00.000Z".to_owned(),
            reviewed_at: None,
            decided_at: None,
            applied_at: None,
            q_identity_candidate: [0.0, 1.0, 1.0, 0.0],
        }
    }

    #[test]
    fn submit_then_list_returns_pending_and_refuses_duplicates() {
        let path = store();
        submit_proposal(&path, proposed("id://a")).unwrap();
        assert!(submit_proposal(&path, proposed("id://a")).is_err());
        let pending = list_pending(&path).unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].proposal_handle, "id://a");
        assert_eq!(pending[0].state, IdentityAugmentProposalState::Proposed);
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn accept_moves_to_accepted_and_leaves_pending_empty() {
        let path = store();
        submit_proposal(&path, proposed("id://accept")).unwrap();
        let view = decide(
            &path,
            "id://accept",
            IdentityAugmentReviewVerdict::Accept,
            "2026-07-22T09:05:00.000Z",
        )
        .unwrap();
        assert_eq!(view.state, IdentityAugmentProposalState::Accepted);
        assert!(list_pending(&path).unwrap().is_empty());
        // Re-deciding a terminal proposal fails closed.
        assert!(decide(
            &path,
            "id://accept",
            IdentityAugmentReviewVerdict::Reject,
            "2026-07-22T09:06:00.000Z",
        )
        .is_err());
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn reject_moves_to_rejected() {
        let path = store();
        submit_proposal(&path, proposed("id://reject")).unwrap();
        let view = decide(
            &path,
            "id://reject",
            IdentityAugmentReviewVerdict::Reject,
            "2026-07-22T09:07:00.000Z",
        )
        .unwrap();
        assert_eq!(view.state, IdentityAugmentProposalState::Rejected);
        assert!(list_pending(&path).unwrap().is_empty());
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn list_includes_reviewed_state() {
        let path = store();
        let mut reviewed = proposed("id://reviewed");
        reviewed.state = IdentityAugmentProposalState::Reviewed;
        reviewed.reviewed_at = Some("2026-07-22T09:01:00.000Z".to_owned());
        submit_proposal(&path, reviewed).unwrap();
        let pending = list_pending(&path).unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].state, IdentityAugmentProposalState::Reviewed);
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn decide_unknown_handle_fails() {
        let path = store();
        assert!(decide(
            &path,
            "id://missing",
            IdentityAugmentReviewVerdict::Accept,
            "2026-07-22T09:08:00.000Z",
        )
        .is_err());
        std::fs::remove_file(&path).ok();
    }
}
