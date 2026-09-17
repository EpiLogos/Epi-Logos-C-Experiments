//! Typed PatternPacket edge for the S3 nara-session close seam (05.T5.11).
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3 (M4' nara pattern-packet wire edge) |
//! | Residency  | Body/S/S3/gateway-contract/src/nara_pattern.rs |
//! | Position   | #3 — Gateway Control Plane contract surface |
//! | Actualises | design-recon 05 §5.11 `PatternPacket.mahamaya_transcription` preservation + Track 16/18 typed-JSON-edge law |
//!
//! # Public surface
//! * [`NaraPatternPacket`] / [`MahamayaTranscription`] — the typed form of the
//!   `pattern_packet` JSON emitted by `epi-s3-gateway`
//!   `dispatch::route_nara_session_close` (snake_case wire, matching that live
//!   edge exactly).
//! * [`assert_pattern_packet_identity_safe`] — §5.11 immutability law at the
//!   contract edge: a packet may NEVER carry Q_identity or M4-0 branch-evidence
//!   mutation payloads.
//! * Re-exports `portal_core::{NaraDeckContext, NaraReviewState}` so S3
//!   consumers type the preserved refs against the owning M4 law module.
//!
//! # Does NOT own
//! * Producing the packet — `epi-s3-gateway` `route_nara_session_close` emits
//!   it. The §5.11 preserved fields are typed-optional here because that close
//!   seam does not stamp them yet; stamping is owned by the gateway dispatch
//!   route under the Track 16/18 typed-edge law, and this contract already
//!   types the target shape.
//! * Envelope/artifact law — `portal_core::nara` (M4).
//! * Q_activity evolution — `portal_core::nara::apply_pattern_packet_chain`.

use portal_core::VakAddress;
pub use portal_core::{NaraDeckContext, NaraReviewState};
use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const NARA_PATTERN_PACKET_TYPE: &str = "PatternPacket";

/// The `mahamaya_transcription` body of a nara-session PatternPacket.
///
/// The first five fields are the live wire shape emitted today by
/// `route_nara_session_close`. The remaining fields are the §5.11 preserved
/// refs: typed-optional (`default`) so the current unstamped edge still parses
/// honestly — absent stamps deserialize as `None`/empty, never fabricated.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MahamayaTranscription {
    pub protein_handle: String,
    pub start_codon: u8,
    pub stop_codon: u8,
    pub protected_handle: bool,
    pub capacity: u32,
    // ---- §5.11 preserved refs (typed-optional until the close seam stamps) ----
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub oracle_frame_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub symbolic_protein_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub deck_context: Option<NaraDeckContext>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sequence_mode: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub packet_refs: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub graph_provenance_handles: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_state: Option<NaraReviewState>,
}

/// Typed form of the `pattern_packet` JSON at the nara-session close edge.
///
/// There is deliberately NO identity field on this struct: per §5.11 a packet
/// chain updates only `Q_activity` / trajectory and can never mutate
/// `Q_identity` or M4-0 branch evidence — the wire shape cannot even spell an
/// identity mutation. [`assert_pattern_packet_identity_safe`] enforces the same
/// law against untyped payloads.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraPatternPacket {
    #[serde(rename = "type")]
    pub packet_type: String,
    pub session_id: String,
    pub mahamaya_transcription: MahamayaTranscription,
    pub write_through_mode: String,
}

impl NaraPatternPacket {
    /// Parse an untyped `pattern_packet` value from the live edge, enforcing
    /// the type tag and the identity-safety law.
    pub fn parse(value: &Value) -> Result<Self, String> {
        assert_pattern_packet_identity_safe(value)?;
        let packet: Self = serde_json::from_value(value.clone())
            .map_err(|err| format!("pattern_packet does not match typed edge: {err}"))?;
        if packet.packet_type != NARA_PATTERN_PACKET_TYPE {
            return Err(format!(
                "pattern_packet type must be `{NARA_PATTERN_PACKET_TYPE}`, got `{}`",
                packet.packet_type
            ));
        }
        Ok(packet)
    }
}

/// §5.11 immutability law at the contract edge: packet chains can NEVER carry
/// Q_identity or M4-0 branch-evidence mutation payloads (nor raw natal bodies).
pub fn assert_pattern_packet_identity_safe(value: &Value) -> Result<(), String> {
    const FORBIDDEN_KEYS: &[&str] = &[
        "q_identity",
        "qIdentity",
        "q_personal",
        "qPersonal",
        "identity_mutation",
        "identityMutation",
        "m4_0_branch_evidence",
        "m40BranchEvidence",
        "branch_evidence",
        "branchEvidence",
        "natal_chart",
        "natalChart",
    ];
    find_forbidden_key(value, FORBIDDEN_KEYS)
        .map(|key| {
            Err(format!(
                "pattern packet chain cannot carry identity-mutation payload `{key}`"
            ))
        })
        .unwrap_or(Ok(()))
}

fn find_forbidden_key<'a>(value: &Value, forbidden: &'a [&str]) -> Option<&'a str> {
    match value {
        Value::Object(map) => {
            for (key, child) in map {
                if let Some(found) = forbidden.iter().find(|candidate| **candidate == key) {
                    return Some(*found);
                }
                if let Some(found) = find_forbidden_key(child, forbidden) {
                    return Some(found);
                }
            }
            None
        }
        Value::Array(values) => values
            .iter()
            .find_map(|child| find_forbidden_key(child, forbidden)),
        _ => None,
    }
}
