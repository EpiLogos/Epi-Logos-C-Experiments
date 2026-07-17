//! Nara artifact envelope + PatternPacket chain law (05.T5.11).
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | M4 (Nara) |
//! | Residency  | Body/S/S0/portal-core/src/nara/mod.rs |
//! | Position   | #4 — Nara oracle-artifact envelope law |
//! | Actualises | design-recon 05 §5.11: envelope preserves `oracle_frame_ref`, `symbolic_protein_ref`, `vak_address`, `deck_context`, `sequence_mode`, packet refs, graph provenance, review state |
//!
//! # Public surface
//! * [`NaraArtifactEnvelope`] + [`NaraDeckContext`] + [`NaraScalarRef`] +
//!   [`NaraProtectedInterpretation`] + [`NaraReviewState`] + [`NaraOracleSystem`]
//! * [`write_nara_artifact`] / [`read_nara_envelope`] — envelope JSON + protected
//!   body are SEPARATE files; the body never enters the envelope.
//! * [`NaraArtifactEnvelope::project_scalar_refs`] — Tarot ↔ I-Ching mutual
//!   projectability, gated on M3 provenance, resolvable without private bodies.
//! * [`apply_pattern_packet_chain`] — Q_activity/trajectory update law.
//!
//! # Does NOT own
//! * Q_identity mutation — only `personal_identity::IdentityAugmentProposalAdapter::apply`
//!   (an `applied` verdict) may mutate Q_identity. This module never receives a
//!   mutable identity reference: [`apply_pattern_packet_chain`] takes NO identity
//!   or M4-0 branch-evidence parameter at all — it cannot mutate what it never
//!   receives.
//! * M4-0 branch evidence — `birthdate_identity::BirthdateEncodingOutput` is
//!   read-only upstream of this module.
//! * Casting/divination (epi-cli oracle), deposition seams (app src-tauri),
//!   the S3 pattern-packet wire edge (`epi-s3-gateway-contract::nara_pattern`).
//!
//! # Wire casing
//! Serde uses snake_case (default) — matching the §5.11 field vocabulary and the
//! live S3 nara-session edge (`route_nara_session_close` pattern_packet JSON),
//! NOT the camelCase of the frozen epi-theia TS envelope. App-side readers
//! normalize both spellings.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::vama_shakti::perturb_q_activity;
use crate::{VakAddress, VamaShaktiClass};

/// The two mutually-projectable oracle artifact systems (§5.11 UX/runtime law).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NaraOracleSystem {
    Tarot,
    IChing,
}

/// Deck context per §5.11: macro/inhabited deck = protected long-range symbolic
/// register; session deck = local bounded utterance.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NaraDeckContext {
    /// Protected long-range symbolic register (handle, never a card list).
    /// Typed-optional: absent until the deck-inhabitation seam stamps it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub macro_deck_ref: Option<String>,
    /// Local bounded utterance deck for this session (handle).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session_deck_ref: Option<String>,
    pub deck_order_hash: String,
    pub entropy_mode: String,
}

/// Scalar M3 reference kinds. Scalar-only by construction: there is no body
/// field on [`NaraScalarRef`], so a ref can never smuggle a private body.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NaraScalarRefKind {
    M3Codon,
    Tarot,
    IChing,
    Decan,
    LineChange,
    Chronos,
    Kairos,
}

/// A scalar M3 reference — resolvable by M3' without loading private bodies.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NaraScalarRef {
    pub ref_kind: NaraScalarRefKind,
    pub scalar_ref: String,
    pub source_handle: String,
}

/// Review state preserved on the envelope (§5.11). Live artifacts are
/// `live-only` until a review pass runs; only reviewed states may promote.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NaraReviewState {
    LiveOnly,
    ReviewPending,
    ReviewedAccepted,
    ReviewedRejected,
}

/// The protected interpretation. The handle serializes; the body NEVER does
/// (`serde(skip)`) — it lives in the sibling `.md` file, protected-local.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NaraProtectedInterpretation {
    /// `protected-local://…` handle — the only thing that crosses the envelope.
    pub handle: String,
    /// The local interpretation body. Never serialized, never required for
    /// scalar-ref resolution ([`NaraArtifactEnvelope::project_scalar_refs`]).
    #[serde(skip)]
    pub local_body: Option<String>,
}

/// The Nara oracle artifact envelope (§5.11).
///
/// Cardinality law (DR-VAK-1, VALIDATED): `cp_position_refs` — the envelope's
/// carrier of `OracleFrame.vak_address.cp[]` / `reading_frame.positions[]` —
/// is the authority for reading cardinality and CP semantics. `spread_label`
/// is decorative provenance and NEVER determines cardinality.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraArtifactEnvelope {
    pub artifact_id: String,
    pub system: NaraOracleSystem,
    pub day_id: String,
    pub created_at: String,
    pub vak_address: VakAddress,
    /// DR-VAK-1 cardinality authority (mirrors `vak_address.cp` joined form).
    pub cp_position_refs: Vec<String>,
    /// Decorative spread name. Never consulted for cardinality.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spread_label: Option<String>,
    /// Ref to the owning OracleFrame (04.T4.11 runtime schema). Typed-optional:
    /// the app deposition seam (src-tauri oracle.rs) does not stamp it yet.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub oracle_frame_ref: Option<String>,
    /// Ref to the SymbolicProtein sequence (04.T4.11). Typed-optional, same owner.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub symbolic_protein_ref: Option<String>,
    pub deck_context: NaraDeckContext,
    /// e.g. `sixfold_ql`, `single_packet` (04.T4.11 vocabulary). Typed-optional.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sequence_mode: Option<String>,
    #[serde(default)]
    pub packet_refs: Vec<String>,
    #[serde(default)]
    pub graph_provenance_handles: Vec<String>,
    pub review_state: NaraReviewState,
    pub scalar_refs: Vec<NaraScalarRef>,
    pub interpretation: NaraProtectedInterpretation,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NaraEnvelopeError {
    EmptyField(&'static str),
    /// DR-VAK-1: `vak_address.cp` must equal the joined `cp_position_refs`.
    VakCpMismatch {
        vak_cp: String,
        joined: String,
    },
    /// Positions are the cardinality authority — an envelope with none is unreadable.
    NoReadingPositions,
    Io(String),
    Serde(String),
}

impl std::fmt::Display for NaraEnvelopeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyField(field) => write!(f, "nara envelope field `{field}` is empty"),
            Self::VakCpMismatch { vak_cp, joined } => write!(
                f,
                "DR-VAK-1 violation: vak_address.cp `{vak_cp}` != joined cp_position_refs `{joined}`"
            ),
            Self::NoReadingPositions => {
                write!(f, "DR-VAK-1: cp_position_refs[] is the cardinality authority and is empty")
            }
            Self::Io(err) => write!(f, "nara envelope io: {err}"),
            Self::Serde(err) => write!(f, "nara envelope serde: {err}"),
        }
    }
}

impl std::error::Error for NaraEnvelopeError {}

impl From<io::Error> for NaraEnvelopeError {
    fn from(err: io::Error) -> Self {
        Self::Io(err.to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NaraProjectionError {
    /// §5.11: artifacts are mutually projectable only where M3 provenance exists.
    MissingM3Provenance,
}

impl std::fmt::Display for NaraProjectionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MissingM3Provenance => write!(
                f,
                "mutual projection requires an m3-codon scalar ref (M3 provenance) on the artifact"
            ),
        }
    }
}

impl std::error::Error for NaraProjectionError {}

impl NaraArtifactEnvelope {
    /// DR-VAK-1: reading cardinality comes from the positions authority.
    /// `spread_label` is not consulted — a label naming a sixfold spread over
    /// two positions still reads cardinality 2.
    pub fn reading_cardinality(&self) -> usize {
        self.cp_position_refs.len()
    }

    pub fn validate(&self) -> Result<(), NaraEnvelopeError> {
        for (field, value) in [
            ("artifact_id", &self.artifact_id),
            ("day_id", &self.day_id),
            ("created_at", &self.created_at),
            (
                "deck_context.deck_order_hash",
                &self.deck_context.deck_order_hash,
            ),
            ("deck_context.entropy_mode", &self.deck_context.entropy_mode),
            ("interpretation.handle", &self.interpretation.handle),
        ] {
            if value.trim().is_empty() {
                return Err(NaraEnvelopeError::EmptyField(field));
            }
        }
        if self.cp_position_refs.is_empty() {
            return Err(NaraEnvelopeError::NoReadingPositions);
        }
        let joined = self.cp_position_refs.join(",");
        if self.vak_address.cp != joined {
            return Err(NaraEnvelopeError::VakCpMismatch {
                vak_cp: self.vak_address.cp.clone(),
                joined,
            });
        }
        Ok(())
    }

    /// Tarot ↔ I-Ching mutual projectability (§5.11 UX/runtime law).
    ///
    /// Requires M3 provenance (an `m3-codon` scalar ref). Returns the scalar
    /// refs legible to the target system — the shared codon bridge plus the
    /// target family's refs. Takes `&self` only and never touches
    /// `interpretation.local_body`: scalar refs stay resolvable by M3' without
    /// loading private bodies.
    pub fn project_scalar_refs(
        &self,
        target: NaraOracleSystem,
    ) -> Result<Vec<NaraScalarRef>, NaraProjectionError> {
        let has_m3_provenance = self
            .scalar_refs
            .iter()
            .any(|scalar| scalar.ref_kind == NaraScalarRefKind::M3Codon);
        if !has_m3_provenance {
            return Err(NaraProjectionError::MissingM3Provenance);
        }
        let admitted: &[NaraScalarRefKind] = match target {
            // A Tarot artifact may carry I-Ching/codon/line-change refs …
            NaraOracleSystem::IChing => &[
                NaraScalarRefKind::M3Codon,
                NaraScalarRefKind::IChing,
                NaraScalarRefKind::LineChange,
            ],
            // … an I-Ching artifact may carry Tarot/decan/codon refs.
            NaraOracleSystem::Tarot => &[
                NaraScalarRefKind::M3Codon,
                NaraScalarRefKind::Tarot,
                NaraScalarRefKind::Decan,
            ],
        };
        Ok(self
            .scalar_refs
            .iter()
            .filter(|scalar| admitted.contains(&scalar.ref_kind))
            .cloned()
            .collect())
    }
}

/// Paths of a written artifact: envelope JSON + protected-local body markdown.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NaraArtifactPaths {
    pub envelope_path: PathBuf,
    pub body_path: PathBuf,
}

/// Write a real artifact: envelope as `{artifact_id}.json`, protected
/// interpretation body as `{artifact_id}.md` — two files, so the body can stay
/// local while the envelope travels. The envelope JSON structurally cannot
/// contain the body (`serde(skip)` on `local_body`).
pub fn write_nara_artifact(
    dir: &Path,
    envelope: &NaraArtifactEnvelope,
    protected_body: &str,
) -> Result<NaraArtifactPaths, NaraEnvelopeError> {
    envelope.validate()?;
    fs::create_dir_all(dir)?;
    let envelope_path = dir.join(format!("{}.json", envelope.artifact_id));
    let body_path = dir.join(format!("{}.md", envelope.artifact_id));
    let json = serde_json::to_string_pretty(envelope)
        .map_err(|err| NaraEnvelopeError::Serde(err.to_string()))?;
    fs::write(&envelope_path, format!("{json}\n"))?;
    fs::write(&body_path, protected_body)?;
    Ok(NaraArtifactPaths {
        envelope_path,
        body_path,
    })
}

/// Read an envelope back WITHOUT loading the private body: `local_body` stays
/// `None`. This is the §5.11 resolvability guarantee — everything scalar on the
/// envelope (refs, deck context, vak address, review state) is available while
/// the interpretation body remains untouched on disk.
pub fn read_nara_envelope(envelope_path: &Path) -> Result<NaraArtifactEnvelope, NaraEnvelopeError> {
    let raw = fs::read_to_string(envelope_path)?;
    let envelope: NaraArtifactEnvelope =
        serde_json::from_str(&raw).map_err(|err| NaraEnvelopeError::Serde(err.to_string()))?;
    envelope.validate()?;
    Ok(envelope)
}

/// One packet's contribution to the activity trajectory.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraPatternPacketStamp {
    pub packet_ref: String,
    pub vak_address: VakAddress,
    pub kairos_delta: f32,
}

/// What a packet chain is allowed to produce: Q_activity + trajectory. Nothing
/// else. There is no identity field here by design.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraActivityTrajectory {
    pub q_activity: [f32; 4],
    pub packet_refs: Vec<String>,
}

/// §5.11 immutability law: packet chains update only `Q_activity` / trajectory
/// and can NEVER mutate `Q_identity` or M4-0 branch evidence.
///
/// The law is structural: this function takes NO `PersonalIdentityProfile` and
/// NO `BirthdateEncodingOutput` parameter — a chain application cannot mutate
/// what it never receives. Q_activity evolves through the existing
/// [`perturb_q_activity`] law (vama_shakti.rs); composition with identity
/// happens read-only downstream via
/// `PersonalIdentityProfile::composed_quaternion`.
pub fn apply_pattern_packet_chain(
    q_activity: [f32; 4],
    packets: &[NaraPatternPacketStamp],
    vama_class: VamaShaktiClass,
) -> NaraActivityTrajectory {
    let mut current = q_activity;
    let mut packet_refs = Vec::with_capacity(packets.len());
    for packet in packets {
        current = perturb_q_activity(
            current,
            &packet.vak_address,
            packet.kairos_delta,
            &[],
            vama_class,
        );
        packet_refs.push(packet.packet_ref.clone());
    }
    NaraActivityTrajectory {
        q_activity: current,
        packet_refs,
    }
}
