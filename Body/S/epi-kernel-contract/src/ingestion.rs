//! Document ingestion session — typed state for the dev-session
//! protocol of mental-pole mechanics §4.
//!
//! An ingestion session traverses the eight matheme elements at
//! session-scale: open with the engaged coordinate, run prehensive
//! analysis (4+2), descend through structured persistence (5→0), flip
//! and run inverse-recognition (1/0 → 4'+2'), then enriched return.
//! Each step deposits a [`KernelTickEnvelope`] into the session log so
//! the verifier ring can read the trajectory afterwards.

use serde::{Deserialize, Serialize};

use portal_core::KernelElement;

use crate::deposit::{TrajectoryDeposit, TrajectoryElement};
use crate::envelope::KernelTickEnvelope;

/// Status of an ingestion session as it advances through the matheme.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IngestionStatus {
    Opened,
    PrehensiveAnalysis,
    PersistedAnalysis,
    SlashFlipped,
    InverseRecognition,
    DepositedReturn,
}

impl IngestionStatus {
    pub fn matches_element(&self, element: KernelElement) -> bool {
        matches!(
            (self, element),
            (Self::Opened, KernelElement::BimbaEncoding)
                | (
                    Self::PrehensiveAnalysis,
                    KernelElement::PratibimbaPrehension
                )
                | (Self::PersistedAnalysis, KernelElement::MobiusDescent)
                | (Self::SlashFlipped, KernelElement::SlashFlip)
                | (
                    Self::InverseRecognition,
                    KernelElement::DoubledPrehension
                )
                | (Self::DepositedReturn, KernelElement::EnrichedReturn)
        )
    }
}

/// A typed ingestion session. Lives across multiple `epi graph`
/// invocations: `ingest` opens it, `analyse-resonance` populates the
/// 4+2 phase, `persist-analysis` performs the 5→0 descent, and
/// `verify-trajectory` finalises with deposit.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct IngestionSession {
    pub session_id: String,
    pub document_id: String,
    pub coordinate: String,
    pub session_key: String,
    pub started_at_ms: u64,
    pub status: IngestionStatus,
    pub envelopes: Vec<KernelTickEnvelope>,
    pub deposit: Option<TrajectoryDeposit>,
}

impl IngestionSession {
    pub fn new(
        document_id: impl Into<String>,
        coordinate: impl Into<String>,
        session_key: impl Into<String>,
        started_at_ms: u64,
    ) -> Result<Self, &'static str> {
        let document_id = document_id.into();
        let coordinate = coordinate.into();
        let session_key = session_key.into();
        if document_id.trim().is_empty() {
            return Err("document_id must be non-empty");
        }
        if coordinate.trim().is_empty() {
            return Err("coordinate must be non-empty");
        }
        if session_key.trim().is_empty() {
            return Err("session_key must be non-empty");
        }
        if started_at_ms == 0 {
            return Err("started_at_ms is required");
        }
        Ok(Self {
            session_id: uuid::Uuid::new_v4().to_string(),
            document_id,
            coordinate,
            session_key,
            started_at_ms,
            status: IngestionStatus::Opened,
            envelopes: Vec::new(),
            deposit: None,
        })
    }

    /// Record an envelope for the current matheme element and advance
    /// the status. The envelope must carry the element matching the
    /// next status, enforcing protocol order.
    pub fn record_envelope(
        &mut self,
        next_status: IngestionStatus,
        envelope: KernelTickEnvelope,
    ) -> Result<(), &'static str> {
        if !next_status.matches_element(envelope.tick.element) {
            return Err("envelope element does not match next status");
        }
        if (next_status as u8) <= (self.status as u8) {
            return Err("ingestion session must advance forward through the matheme");
        }
        self.envelopes.push(envelope);
        self.status = next_status;
        Ok(())
    }

    /// Attach a typed [`TrajectoryDeposit`] computed from the recorded
    /// envelopes. The deposit's elements mirror the envelope tick
    /// states and feed the verifier ring.
    pub fn finalise_deposit(
        &mut self,
        anchor_coordinate: impl Into<String>,
        ended_at_ms: u64,
        r_energy_total: f32,
    ) -> Result<&TrajectoryDeposit, &'static str> {
        let mut deposit = TrajectoryDeposit::new(
            self.session_key.clone(),
            anchor_coordinate,
            self.coordinate.clone(),
            self.started_at_ms,
        )?;
        for env in &self.envelopes {
            let elem = TrajectoryElement::new(
                env.tick.element,
                env.tick.sub_tick,
                env.bioquaternion.clone(),
                env.energy,
            )?;
            deposit.push_element(elem)?;
        }
        deposit.close(ended_at_ms, r_energy_total)?;
        self.deposit = Some(deposit);
        Ok(self.deposit.as_ref().expect("just set"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use portal_core::KernelProjection;

    fn envelope(element_sub_tick: u8) -> KernelTickEnvelope {
        let projection = KernelProjection::from_clock_state(
            1,
            element_sub_tick,
            [1.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5],
            None,
            None,
            0.0,
        );
        KernelTickEnvelope::from_kernel_projection(0, &projection)
    }

    #[test]
    fn session_construction_validates_inputs() {
        assert!(IngestionSession::new("", "M2-1-3", "session-1", 1).is_err());
        assert!(IngestionSession::new("doc", "", "session-1", 1).is_err());
        assert!(IngestionSession::new("doc", "M2-1-3", "", 1).is_err());
        assert!(IngestionSession::new("doc", "M2-1-3", "session-1", 0).is_err());
        let s = IngestionSession::new("doc", "M2-1-3", "session-1", 1).unwrap();
        assert_eq!(s.status, IngestionStatus::Opened);
        assert!(s.envelopes.is_empty());
    }

    #[test]
    fn session_advances_through_matheme_status_in_order() {
        let mut s = IngestionSession::new("doc", "M2-1-3", "session-1", 1).unwrap();
        // PrehensiveAnalysis uses sub_tick 1 -> KernelElement::PratibimbaPrehension
        s.record_envelope(IngestionStatus::PrehensiveAnalysis, envelope(1))
            .unwrap();
        // PersistedAnalysis uses sub_tick 2 or 3 -> MobiusDescent
        s.record_envelope(IngestionStatus::PersistedAnalysis, envelope(2))
            .unwrap();
        // SlashFlip uses sub_tick 4
        s.record_envelope(IngestionStatus::SlashFlipped, envelope(4))
            .unwrap();
        // InverseRecognition uses sub_tick 6 -> DoubledPrehension
        s.record_envelope(IngestionStatus::InverseRecognition, envelope(6))
            .unwrap();
        // DepositedReturn uses sub_tick 9 -> EnrichedReturn
        s.record_envelope(IngestionStatus::DepositedReturn, envelope(9))
            .unwrap();
        assert_eq!(s.envelopes.len(), 5);
    }

    #[test]
    fn session_rejects_out_of_order_advance() {
        let mut s = IngestionSession::new("doc", "M2-1-3", "session-1", 1).unwrap();
        // skip ahead to InverseRecognition immediately
        assert!(s
            .record_envelope(IngestionStatus::InverseRecognition, envelope(6))
            .is_ok());
        // try to go back to PrehensiveAnalysis
        assert!(s
            .record_envelope(IngestionStatus::PrehensiveAnalysis, envelope(1))
            .is_err());
    }

    #[test]
    fn session_rejects_envelope_element_mismatch() {
        let mut s = IngestionSession::new("doc", "M2-1-3", "session-1", 1).unwrap();
        // claiming PrehensiveAnalysis but supplying a SlashFlip-element envelope
        assert!(s
            .record_envelope(IngestionStatus::PrehensiveAnalysis, envelope(4))
            .is_err());
    }

    #[test]
    fn finalise_deposit_builds_typed_record() {
        let mut s = IngestionSession::new("doc", "M2-1-3", "session-1", 1).unwrap();
        s.record_envelope(IngestionStatus::PrehensiveAnalysis, envelope(1))
            .unwrap();
        s.record_envelope(IngestionStatus::PersistedAnalysis, envelope(2))
            .unwrap();
        let deposit = s
            .finalise_deposit("#4.4.4.4-frank", 200, 0.1)
            .unwrap()
            .clone();
        assert_eq!(deposit.session_key, "session-1");
        assert_eq!(deposit.anchor_coordinate, "#4.4.4.4-frank");
        assert_eq!(deposit.canonical_coordinate, "M2-1-3");
        assert_eq!(deposit.elements.len(), 2);
        assert_eq!(deposit.r_energy_total, 0.1);
        assert!(deposit.ended_at_ms.is_some());
    }
}
