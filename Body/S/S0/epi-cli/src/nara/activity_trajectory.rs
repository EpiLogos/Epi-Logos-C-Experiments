//! Persisted per-user Q_activity trajectory accumulator (25.T25.14 auto-trigger).
//!
//! Coordinate: S0 (membrane) actualising the M4 personal Q_activity checkpoint.
//! Residency: Body/S/S0/epi-cli/src/nara/activity_trajectory.rs
//! Public surface: PersistedActivityTrajectory, load, current, accumulate.
//! Does NOT own: the pure accumulation law (`portal_core::apply_pattern_packet_chain`),
//!   Q_identity (never touched here — the law takes NO identity parameter), or the
//!   drift detector (`portal_core::personal_identity`).
//!
//! This is the persistence seam that makes the identity-augment `detect` producer
//! fire AUTOMATICALLY on REAL accumulated activity. The pure, identity-safe
//! accumulation law lives in portal-core; this module persists its running
//! `q_activity` per local user so successive session-close activity packets
//! compound into a real drift trajectory — the honest driver the detector
//! measures against the natal baseline. It parallels `identity_proposals.rs`: a
//! JSON ledger under the gateway state_root, load → mutate → persist. The
//! identity quaternion `[1,0,0,0]` is the absent/initial state — an
//! un-accumulated trajectory is perfectly aligned with any identity (no drift).

use std::path::Path;

use serde::{Deserialize, Serialize};

use portal_core::{apply_pattern_packet_chain, NaraPatternPacketStamp, VamaShaktiClass};

/// The identity quaternion — the initial (un-accumulated) Q_activity. An empty
/// trajectory resonates perfectly with any identity, so it produces no drift.
pub const IDENTITY_QUATERNION: [f32; 4] = [1.0, 0.0, 0.0, 0.0];

/// The persisted per-user Q_activity accumulator. `q_activity` is the running
/// accumulation of every activity packet folded through the portal-core chain
/// law. It is NEVER Q_identity — this struct has no identity field by design.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PersistedActivityTrajectory {
    /// The running accumulated Q_activity. Starts at the identity quaternion.
    pub q_activity: [f32; 4],
    /// Every packet_ref folded into the trajectory, in application order.
    #[serde(default)]
    pub packet_refs: Vec<String>,
    /// Number of activity turns (packets) folded so far.
    #[serde(default)]
    pub turn_count: u64,
    /// The last `kairos_close` observed, so the next turn can derive a real
    /// elapsed kairos_delta against the accumulator's last turn. `None` until
    /// the first accumulate.
    #[serde(default)]
    pub last_kairos_close: Option<u64>,
    /// RFC3339 timestamp of the last mutation (empty for an initial trajectory).
    #[serde(default)]
    pub updated_at: String,
}

impl PersistedActivityTrajectory {
    /// The identity-initialised trajectory used when the ledger is absent.
    pub fn initial() -> Self {
        Self {
            q_activity: IDENTITY_QUATERNION,
            packet_refs: Vec::new(),
            turn_count: 0,
            last_kairos_close: None,
            updated_at: String::new(),
        }
    }
}

/// Read the persisted trajectory, initialising to the identity quaternion when
/// the ledger is absent or unreadable — honest degradation: an absent ledger IS
/// an un-accumulated, perfectly-aligned trajectory.
pub fn load(store_path: &Path) -> PersistedActivityTrajectory {
    match std::fs::read_to_string(store_path) {
        Ok(text) => {
            serde_json::from_str(&text).unwrap_or_else(|_| PersistedActivityTrajectory::initial())
        }
        Err(_) => PersistedActivityTrajectory::initial(),
    }
}

/// The read used by `nara.activity.show` and by the `detect` producer when no
/// explicit q_activity override is supplied. Identical to [`load`]; named for
/// the read intent.
pub fn current(store_path: &Path) -> PersistedActivityTrajectory {
    load(store_path)
}

fn save(store_path: &Path, trajectory: &PersistedActivityTrajectory) -> Result<(), String> {
    if let Some(parent) = store_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create activity-trajectory store dir: {e}"))?;
    }
    let text = serde_json::to_string_pretty(trajectory)
        .map_err(|e| format!("failed to serialize activity trajectory: {e}"))?;
    std::fs::write(store_path, text)
        .map_err(|e| format!("failed to write activity trajectory: {e}"))
}

/// Fold `packets` into the persisted Q_activity via the pure portal-core chain
/// law, append their refs, bump `turn_count`, record `kairos_close` as the new
/// last-turn kairos, persist, and return the new trajectory.
///
/// Q_identity is NEVER touched — [`apply_pattern_packet_chain`] takes no identity
/// or branch-evidence parameter at all, so it cannot mutate what it never
/// receives. `now` timestamps the persisted mutation; `kairos_close` (when
/// present) is stored so the next turn can derive an elapsed delta against it.
pub fn accumulate(
    store_path: &Path,
    packets: &[NaraPatternPacketStamp],
    vama_class: VamaShaktiClass,
    now: &str,
    kairos_close: Option<u64>,
) -> Result<PersistedActivityTrajectory, String> {
    let mut trajectory = load(store_path);
    let updated = apply_pattern_packet_chain(trajectory.q_activity, packets, vama_class);
    trajectory.q_activity = updated.q_activity;
    trajectory.packet_refs.extend(updated.packet_refs);
    trajectory.turn_count += packets.len() as u64;
    if kairos_close.is_some() {
        trajectory.last_kairos_close = kairos_close;
    }
    trajectory.updated_at = now.to_owned();
    save(store_path, &trajectory)?;
    Ok(trajectory)
}

/// Reset the accumulator back to the identity quaternion. Used when an augment
/// is `applied` (Q_identity absorbs the drift via the governed accept path), so
/// the absorbed drift is not re-proposed. Persists the reset and returns it.
pub fn reset(store_path: &Path, now: &str) -> Result<PersistedActivityTrajectory, String> {
    let mut trajectory = PersistedActivityTrajectory::initial();
    trajectory.updated_at = now.to_owned();
    save(store_path, &trajectory)?;
    Ok(trajectory)
}

#[cfg(test)]
mod tests {
    use super::*;
    use portal_core::{CpfState, CsDirection, CsField, VakAddress};

    fn store() -> std::path::PathBuf {
        use std::sync::atomic::{AtomicU64, Ordering};
        static SEQ: AtomicU64 = AtomicU64::new(0);
        std::env::temp_dir().join(format!(
            "activity-trajectory-{}-{}-{}.json",
            std::process::id(),
            SEQ.fetch_add(1, Ordering::Relaxed),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ))
    }

    fn packet(reference: &str, kairos_delta: f32) -> NaraPatternPacketStamp {
        NaraPatternPacketStamp {
            packet_ref: reference.to_owned(),
            vak_address: VakAddress {
                cpf: CpfState::Mechanistic,
                ct: vec!["I".to_owned()],
                cp: "M4.session".to_owned(),
                cf: "(4.0/1-4.4/5)".to_owned(),
                cfp: "4.4".to_owned(),
                cs: CsField {
                    code: "M4".to_owned(),
                    direction: CsDirection::Day,
                    recognized: false,
                },
            },
            kairos_delta,
        }
    }

    #[test]
    fn absent_ledger_initialises_to_identity_quaternion() {
        let path = store();
        let trajectory = load(&path);
        assert_eq!(trajectory.q_activity, IDENTITY_QUATERNION);
        assert_eq!(trajectory.turn_count, 0);
        assert!(trajectory.packet_refs.is_empty());
        assert!(trajectory.last_kairos_close.is_none());
    }

    #[test]
    fn accumulate_persists_across_load_and_current() {
        let path = store();
        let first = accumulate(
            &path,
            std::slice::from_ref(&packet("p://one", 8.0)),
            VamaShaktiClass::Sprite,
            "2026-07-22T09:00:00.000Z",
            Some(1_000),
        )
        .unwrap();
        assert_eq!(first.turn_count, 1);
        assert_eq!(first.packet_refs, vec!["p://one".to_owned()]);
        assert_eq!(first.last_kairos_close, Some(1_000));

        // current() reads back exactly what accumulate persisted.
        let read = current(&path);
        assert_eq!(read, first);

        // A second accumulate compounds onto the persisted state.
        let second = accumulate(
            &path,
            std::slice::from_ref(&packet("p://two", 8.0)),
            VamaShaktiClass::Sprite,
            "2026-07-22T09:05:00.000Z",
            Some(2_000),
        )
        .unwrap();
        assert_eq!(second.turn_count, 2);
        assert_eq!(
            second.packet_refs,
            vec!["p://one".to_owned(), "p://two".to_owned()]
        );
        assert_eq!(second.last_kairos_close, Some(2_000));
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn accumulate_drifts_q_activity_away_from_identity() {
        let path = store();
        let mut last = IDENTITY_QUATERNION[0];
        // A constant coordinate + constant (max) delta gives a constant
        // perturbation axis → linear drift; the scalar component decreases
        // monotonically away from 1.0.
        for turn in 0..12 {
            let trajectory = accumulate(
                &path,
                std::slice::from_ref(&packet(&format!("p://{turn}"), 8.0)),
                VamaShaktiClass::Sprite,
                "2026-07-22T09:00:00.000Z",
                Some(1_000 + turn as u64 * 21_600_000),
            )
            .unwrap();
            // still a unit quaternion
            let norm = trajectory
                .q_activity
                .iter()
                .map(|c| c * c)
                .sum::<f32>()
                .sqrt();
            assert!((norm - 1.0).abs() < 1e-3, "q_activity must stay unit");
            last = trajectory.q_activity[0];
        }
        // After a dozen turns the scalar component has drifted well below the
        // 2/3 major-resonance floor (|q_activity[0]| is the drift score against
        // an identity transit).
        assert!(
            last.abs() < 2.0 / 3.0,
            "accumulated q_activity[0] {last} should have drifted below 2/3"
        );
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn reset_returns_accumulator_to_identity() {
        let path = store();
        accumulate(
            &path,
            std::slice::from_ref(&packet("p://x", 8.0)),
            VamaShaktiClass::Sprite,
            "2026-07-22T09:00:00.000Z",
            Some(1_000),
        )
        .unwrap();
        let reset_trajectory = reset(&path, "2026-07-22T09:10:00.000Z").unwrap();
        assert_eq!(reset_trajectory.q_activity, IDENTITY_QUATERNION);
        assert_eq!(reset_trajectory.turn_count, 0);
        assert!(reset_trajectory.packet_refs.is_empty());
        assert_eq!(current(&path).q_activity, IDENTITY_QUATERNION);
        std::fs::remove_file(&path).ok();
    }
}
