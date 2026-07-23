//! Current applied identity-augment store (25.T25.14, DR-M4-3, DR-WC-M4-4).
//!
//! Coordinate: S0 (membrane) actualising the M4 governed `applied` identity.
//! Residency: Body/S/S0/epi-cli/src/nara/applied_identity.rs
//! Public surface: AppliedIdentity, load, current, store.
//! Does NOT own: the proposal state machine or the apply mutation law — those
//!   live in `portal_core::personal_identity` (`apply_identity_augment` /
//!   `IdentityAugmentProposalAdapter::apply`). This is the persistence seam that
//!   makes an `applied` augment DURABLE: the effective personal identity survives
//!   a restart and subsequent detect measures drift against the augmented
//!   baseline (so the absorbed drift is not re-proposed).
//!
//! There is only ever ONE current augmented identity: a later apply OVERWRITES
//! this file. `q_identity` is the protected-local quaternion bytes — this file is
//! state-root local and is NEVER bused raw over the wire (DR-M4-3 handle-only).
//! `load`/`current` return `None` when the file is absent (no augment applied
//! yet — the natal baseline is the effective identity).

use std::path::Path;

use serde::{Deserialize, Serialize};

/// The persisted current applied identity augment. `q_identity` is the augmented
/// (post-apply) protected-local quaternion; `applied_proposal_handle` and
/// `applied_at` record which governed accept produced it and when.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AppliedIdentity {
    pub q_identity: [f32; 4],
    pub applied_proposal_handle: String,
    pub applied_at: String,
}

/// Read the persisted applied identity, returning `None` when the store is
/// absent or unreadable (honest degradation: no augment applied → the natal
/// baseline is the effective identity).
pub fn load(store_path: &Path) -> Option<AppliedIdentity> {
    match std::fs::read_to_string(store_path) {
        Ok(text) => serde_json::from_str(&text).ok(),
        Err(_) => None,
    }
}

/// The read used by the profile-load layering point. Identical to [`load`];
/// named for the read intent.
pub fn current(store_path: &Path) -> Option<AppliedIdentity> {
    load(store_path)
}

/// Persist the current applied identity, overwriting any prior augment (there is
/// only ever one current augmented identity). State-root local — the raw
/// `q_identity` bytes never leave this file.
pub fn store(store_path: &Path, applied: &AppliedIdentity) -> Result<(), String> {
    if let Some(parent) = store_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create applied-identity store dir: {e}"))?;
    }
    let text = serde_json::to_string_pretty(applied)
        .map_err(|e| format!("failed to serialize applied identity: {e}"))?;
    std::fs::write(store_path, text)
        .map_err(|e| format!("failed to write applied identity: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn store_path() -> std::path::PathBuf {
        use std::sync::atomic::{AtomicU64, Ordering};
        static SEQ: AtomicU64 = AtomicU64::new(0);
        std::env::temp_dir().join(format!(
            "applied-identity-{}-{}-{}.json",
            std::process::id(),
            SEQ.fetch_add(1, Ordering::Relaxed),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ))
    }

    #[test]
    fn absent_store_loads_none() {
        let path = store_path();
        assert!(load(&path).is_none());
        assert!(current(&path).is_none());
    }

    #[test]
    fn store_then_load_round_trips() {
        let path = store_path();
        let applied = AppliedIdentity {
            q_identity: [0.0, 1.0, 0.0, 0.0],
            applied_proposal_handle: "identity-proposal://applied".to_owned(),
            applied_at: "2026-07-23T09:00:00.000Z".to_owned(),
        };
        store(&path, &applied).unwrap();
        assert_eq!(current(&path), Some(applied));
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn later_apply_overwrites_the_current_augment() {
        let path = store_path();
        store(
            &path,
            &AppliedIdentity {
                q_identity: [0.0, 1.0, 0.0, 0.0],
                applied_proposal_handle: "id://first".to_owned(),
                applied_at: "2026-07-23T09:00:00.000Z".to_owned(),
            },
        )
        .unwrap();
        let second = AppliedIdentity {
            q_identity: [0.0, 0.0, 1.0, 0.0],
            applied_proposal_handle: "id://second".to_owned(),
            applied_at: "2026-07-23T10:00:00.000Z".to_owned(),
        };
        store(&path, &second).unwrap();
        assert_eq!(current(&path), Some(second));
        std::fs::remove_file(&path).ok();
    }
}
