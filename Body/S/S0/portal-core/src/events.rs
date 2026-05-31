use serde::{Deserialize, Serialize};

use crate::{
    ConjugateFormCharacter, MathemeHarmonicProfile, NaraSymbolicObservation, ProfilePrivacyClass,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RelationFamily {
    A,
    B,
    C,
    D1,
    D2,
    D3,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum EventPrivacyClass {
    ProtectedLocalBody,
    ProtectedLocalDerived,
    PublicCurrentContext,
    ReviewedCanonical,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationDescriptor {
    pub relation_id: String,
    pub relation_family: RelationFamily,
    pub target_coordinate: String,
    pub target_profile_id: String,
    pub interval_semitones: i8,
    pub ratio_role: String,
    pub klein_flip: bool,
}

impl RelationDescriptor {
    pub fn new(
        relation_id: impl Into<String>,
        relation_family: RelationFamily,
        target_coordinate: impl Into<String>,
        target_profile_id: impl Into<String>,
        interval_semitones: i8,
        ratio_role: impl Into<String>,
        klein_flip: bool,
    ) -> Result<Self, String> {
        let relation_id = non_empty(relation_id.into(), "relation_id")?;
        let target_coordinate = non_empty(target_coordinate.into(), "target_coordinate")?;
        let target_profile_id = non_empty(target_profile_id.into(), "target_profile_id")?;
        let ratio_role = non_empty(ratio_role.into(), "ratio_role")?;
        Ok(Self {
            relation_id,
            relation_family,
            target_coordinate,
            target_profile_id,
            interval_semitones,
            ratio_role,
            klein_flip,
        })
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MPrimePerformanceEvent {
    pub event_id: String,
    pub session_id: String,
    pub tick: u64,
    pub source_surface: String,
    pub coordinate_before: String,
    pub coordinate_after: String,
    pub relation_descriptor: RelationDescriptor,
    pub lens: u8,
    pub mode: u8,
    pub audio_octet_hz: [f32; 8],
    pub nodal_quartet: [(u8, u8); 4],
    pub intended_chromagram: [f32; 12],
    pub observed_chromagram: Option<[f32; 12]>,
    pub klein_flip: bool,
    pub codon_rotation: Option<String>,
    pub privacy: EventPrivacyClass,
    pub deposition_policy: String,
}

impl MPrimePerformanceEvent {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        event_id: impl Into<String>,
        session_id: impl Into<String>,
        tick: u64,
        source_surface: impl Into<String>,
        coordinate_before: impl Into<String>,
        coordinate_after: impl Into<String>,
        relation_descriptor: RelationDescriptor,
        lens: u8,
        mode: u8,
        audio_octet_hz: [f32; 8],
        nodal_quartet: [(u8, u8); 4],
        intended_chromagram: [f32; 12],
    ) -> Result<Self, String> {
        if lens >= 12 || mode >= 7 {
            return Err("lens/mode must be in the 12x7 M' landscape".to_owned());
        }
        if !audio_octet_hz.iter().all(|hz| hz.is_finite() && *hz > 0.0) {
            return Err("audio_octet_hz must contain finite positive frequencies".to_owned());
        }
        if !intended_chromagram.iter().all(|value| value.is_finite()) {
            return Err("intended_chromagram must contain finite values".to_owned());
        }
        Ok(Self {
            event_id: non_empty(event_id.into(), "event_id")?,
            session_id: non_empty(session_id.into(), "session_id")?,
            tick,
            source_surface: non_empty(source_surface.into(), "source_surface")?,
            coordinate_before: non_empty(coordinate_before.into(), "coordinate_before")?,
            coordinate_after: non_empty(coordinate_after.into(), "coordinate_after")?,
            klein_flip: relation_descriptor.klein_flip,
            relation_descriptor,
            lens,
            mode,
            audio_octet_hz,
            nodal_quartet,
            intended_chromagram,
            observed_chromagram: None,
            codon_rotation: None,
            privacy: EventPrivacyClass::PublicCurrentContext,
            deposition_policy: "defer-to-session-governance".to_owned(),
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum NaraActivityKind {
    Journal,
    DailyNote,
    Dream,
    Highlight,
    Oracle,
    SessionOpen,
    SessionClose,
    AgentExchange,
    SophiaLoop,
    EpiiReview,
    KernelProfileObservation,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum ActivityStateEffect {
    NoStateChange,
    EphemeralContextOnly,
    UpdateActivityQuaternion { decay: f32, weight: f32 },
    OpenTransformationEpisode,
    CreateIdentityAugmentProposal,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraActivityEvent {
    pub event_id: String,
    pub kind: NaraActivityKind,
    pub coordinate: String,
    pub day_id: String,
    pub now_path: String,
    pub session_key: String,
    pub source_ref: Option<String>,
    pub privacy: EventPrivacyClass,
    pub identity_ref: String,
    pub matheme_handle: String,
    pub kairos_snapshot: Option<String>,
    pub raw_body_handle: String,
    pub derived_symbolic_observation: Option<NaraSymbolicObservation>,
    pub state_effect: ActivityStateEffect,
    pub provenance: String,
}

impl NaraActivityEvent {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        event_id: impl Into<String>,
        kind: NaraActivityKind,
        coordinate: impl Into<String>,
        day_id: impl Into<String>,
        now_path: impl Into<String>,
        session_key: impl Into<String>,
        privacy: EventPrivacyClass,
        identity_ref: impl Into<String>,
        matheme_handle: impl Into<String>,
        raw_body_handle: impl Into<String>,
        state_effect: ActivityStateEffect,
    ) -> Result<Self, String> {
        if matches!(
            state_effect,
            ActivityStateEffect::CreateIdentityAugmentProposal
        ) {
            return Err(
                "identity augment proposals must be created by explicit governed review".to_owned(),
            );
        }
        if matches!(
            kind,
            NaraActivityKind::Journal
                | NaraActivityKind::DailyNote
                | NaraActivityKind::Dream
                | NaraActivityKind::Highlight
                | NaraActivityKind::Oracle
                | NaraActivityKind::AgentExchange
                | NaraActivityKind::SophiaLoop
                | NaraActivityKind::EpiiReview
        ) && privacy != EventPrivacyClass::ProtectedLocalBody
        {
            return Err(
                "raw-body-backed Nara activity must use protected-local-body privacy".to_owned(),
            );
        }
        Ok(Self {
            event_id: non_empty(event_id.into(), "event_id")?,
            kind,
            coordinate: non_empty(coordinate.into(), "coordinate")?,
            day_id: non_empty(day_id.into(), "day_id")?,
            now_path: non_empty(now_path.into(), "now_path")?,
            session_key: non_empty(session_key.into(), "session_key")?,
            source_ref: None,
            privacy,
            identity_ref: non_empty(identity_ref.into(), "identity_ref")?,
            matheme_handle: non_empty(matheme_handle.into(), "matheme_handle")?,
            kairos_snapshot: None,
            raw_body_handle: non_empty(raw_body_handle.into(), "raw_body_handle")?,
            derived_symbolic_observation: None,
            state_effect,
            provenance: "portal-core::NaraActivityEvent protected activity envelope".to_owned(),
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelProfileObservationEvent {
    pub event_id: String,
    pub source_agent: String,
    pub session_key: String,
    pub namespace_ref: String,
    pub day_id: String,
    pub vault_now_path: String,
    pub source_coordinate: String,
    pub tick12: u8,
    pub degree720: u16,
    pub resonance72_index: u8,
    pub mahamaya_address64: u8,
    pub privacy: EventPrivacyClass,
    pub profile_privacy_class: ProfilePrivacyClass,
    pub harmonic_medium: String,
    pub coordinate_anchor: KernelProfileCoordinateAnchor,
}

impl KernelProfileObservationEvent {
    #[allow(clippy::too_many_arguments)]
    pub fn from_profile(
        event_id: impl Into<String>,
        source_agent: impl Into<String>,
        session_key: impl Into<String>,
        namespace_ref: impl Into<String>,
        day_id: impl Into<String>,
        vault_now_path: impl Into<String>,
        source_coordinate: impl Into<String>,
        generation: u64,
        profile: &MathemeHarmonicProfile,
    ) -> Result<Self, String> {
        let source_coordinate = non_empty(source_coordinate.into(), "source_coordinate")?;
        let mahamaya_address64 = profile
            .binary
            .mahamaya_address64
            .ok_or_else(|| "mahamaya_address64 is required".to_owned())?;
        let resonance72_index = u8::try_from(profile.resonance72.lens_anchor_index)
            .map_err(|_| "resonance72_index must remain in 0..72".to_owned())?;
        Ok(Self {
            event_id: non_empty(event_id.into(), "event_id")?,
            source_agent: non_empty(source_agent.into(), "source_agent")?,
            session_key: non_empty(session_key.into(), "session_key")?,
            namespace_ref: non_empty(namespace_ref.into(), "namespace_ref")?,
            day_id: non_empty(day_id.into(), "day_id")?,
            vault_now_path: non_empty(vault_now_path.into(), "vault_now_path")?,
            source_coordinate: source_coordinate.clone(),
            tick12: profile.tick12,
            degree720: profile.degree720,
            resonance72_index,
            mahamaya_address64,
            privacy: EventPrivacyClass::ProtectedLocalDerived,
            profile_privacy_class: profile.privacy_class.clone(),
            harmonic_medium: "portal-core::MathemeHarmonicProfile".to_owned(),
            coordinate_anchor: KernelProfileCoordinateAnchor::from_profile(
                source_coordinate,
                generation,
                profile,
            ),
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileCoordinateAnchor {
    pub coordinate: String,
    pub coordinate_anchor: KernelProfileCoordinateAnchorPayload,
}

impl KernelProfileCoordinateAnchor {
    fn from_profile(
        source_coordinate: String,
        generation: u64,
        profile: &MathemeHarmonicProfile,
    ) -> Self {
        Self {
            coordinate: source_coordinate.clone(),
            coordinate_anchor: KernelProfileCoordinateAnchorPayload {
                coordinate: source_coordinate,
                kernel: KernelProfileKernelAnchor {
                    source: "s0.kernel".to_owned(),
                    profile: "portal-core::MathemeHarmonicProfile".to_owned(),
                    generation,
                    projection_owner: "S3'".to_owned(),
                },
                harmonic_pointer: KernelProfileHarmonicPointerAnchor::from_profile(profile),
            },
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileCoordinateAnchorPayload {
    pub coordinate: String,
    pub kernel: KernelProfileKernelAnchor,
    pub harmonic_pointer: KernelProfileHarmonicPointerAnchor,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileKernelAnchor {
    pub source: String,
    pub profile: String,
    pub generation: u64,
    pub projection_owner: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileHarmonicPointerAnchor {
    pub source_profile: String,
    pub source_contract: String,
    pub bedrock: KernelProfileBedrockAnchor,
    pub pointer_anchor: KernelProfilePointerAnchor,
    pub context_frames: KernelProfileContextFramesAnchor,
    pub provenance: String,
}

impl KernelProfileHarmonicPointerAnchor {
    fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            source_profile: "portal-core::MathemeHarmonicProfile".to_owned(),
            source_contract: "S0 Bedrock7/PointerWeb36/CF7".to_owned(),
            bedrock: KernelProfileBedrockAnchor::from_profile(profile),
            pointer_anchor: KernelProfilePointerAnchor::from_profile(profile),
            context_frames: KernelProfileContextFramesAnchor::from_profile(profile),
            provenance: profile.pointer_anchor.provenance.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileBedrockAnchor {
    pub psychoid_number: String,
    pub inverted_psychoid_number: String,
    pub successor_psychoid_number: String,
    pub successor_relation: String,
    pub inversion_relation: String,
}

impl KernelProfileBedrockAnchor {
    fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            psychoid_number: profile.bedrock.psychoid_number.clone(),
            inverted_psychoid_number: profile.bedrock.inverted_psychoid_number.clone(),
            successor_psychoid_number: profile.bedrock.successor_psychoid_number.clone(),
            successor_relation: profile.bedrock.successor_relation.clone(),
            inversion_relation: profile.bedrock.inversion_relation.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfilePointerAnchor {
    pub source_coordinate: String,
    pub ql_position: u8,
    pub helix: String,
    pub web_index: u8,
    pub web_cardinality: u8,
    pub lens_anchor: String,
    pub relation_role: String,
    pub pitch_class: u8,
}

impl KernelProfilePointerAnchor {
    fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            source_coordinate: profile.pointer_anchor.source_coordinate.clone(),
            ql_position: profile.pointer_anchor.ql_position,
            helix: profile.pointer_anchor.helix.clone(),
            web_index: profile.pointer_anchor.web_index,
            web_cardinality: profile.pointer_anchor.web_cardinality,
            lens_anchor: profile.pointer_anchor.lens_anchor.clone(),
            relation_role: profile.pointer_anchor.relation_role.clone(),
            pitch_class: profile.pointer_anchor.pitch_class,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelProfileContextFramesAnchor {
    pub cf_cardinality: u8,
    pub active_frame_index: Option<u8>,
    pub active_frame: Option<String>,
    pub active_agent: Option<String>,
    pub projection: String,
}

impl KernelProfileContextFramesAnchor {
    fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            cf_cardinality: profile.context_frames.frame_count,
            active_frame_index: profile.context_frames.active_frame_index,
            active_frame: profile.context_frames.active_frame.clone(),
            active_agent: profile.context_frames.active_agent.clone(),
            projection: profile.context_frames.projection.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalResonanceObservationEvent {
    pub event_id: String,
    pub session_key: String,
    pub source_coordinate: String,
    pub identity_ref: String,
    pub resonance_score: f32,
    pub conjugate_form_character: ConjugateFormCharacter,
    pub tick: u64,
    pub tick12: u8,
    pub degree720: u16,
    pub resonance72_index: u8,
    pub privacy: EventPrivacyClass,
    pub harmonic_medium: String,
}

impl PersonalResonanceObservationEvent {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        event_id: impl Into<String>,
        session_key: impl Into<String>,
        source_coordinate: impl Into<String>,
        identity_ref: impl Into<String>,
        resonance_score: f32,
        conjugate_form_character: ConjugateFormCharacter,
        tick: u64,
        tick12: u8,
        degree720: u16,
        resonance72_index: u8,
    ) -> Result<Self, String> {
        if !resonance_score.is_finite() {
            return Err("resonance_score must be finite".to_owned());
        }
        if !(0.0..=1.0).contains(&resonance_score) {
            return Err("resonance_score must be normalized in [0, 1]".to_owned());
        }
        Ok(Self {
            event_id: non_empty(event_id.into(), "event_id")?,
            session_key: non_empty(session_key.into(), "session_key")?,
            source_coordinate: non_empty(source_coordinate.into(), "source_coordinate")?,
            identity_ref: non_empty(identity_ref.into(), "identity_ref")?,
            resonance_score,
            conjugate_form_character,
            tick,
            tick12,
            degree720,
            resonance72_index,
            privacy: EventPrivacyClass::ProtectedLocalDerived,
            harmonic_medium: "portal-core::MathemeHarmonicProfile".to_owned(),
        })
    }

    pub fn from_profile(
        event_id: impl Into<String>,
        session_key: impl Into<String>,
        source_coordinate: impl Into<String>,
        identity_ref: impl Into<String>,
        profile: &MathemeHarmonicProfile,
    ) -> Result<Self, String> {
        let resonance_score = profile.resonance.ok_or_else(|| {
            "resonance is required to record personal resonance observation".to_owned()
        })?;
        Self::new(
            event_id,
            session_key,
            source_coordinate,
            identity_ref,
            resonance_score,
            profile.conjugate_form_character.clone(),
            profile.tick,
            profile.tick12,
            profile.degree720,
            u8::try_from(profile.resonance72.lens_anchor_index)
                .map_err(|_| "resonance72_index must remain in 0..72".to_owned())?,
        )
    }
}

fn non_empty(value: String, field: &str) -> Result<String, String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(trimmed.to_owned())
    }
}
