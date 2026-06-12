use serde::{Deserialize, Serialize};

use super::{non_empty, EventPrivacyClass};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Valence {
    Primary,
    Inverted,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum KleinFlipEvent {
    #[serde(rename_all = "camelCase")]
    M1TritoneCrossing { tick12: u8, lens_pair: (u8, u8) },
    #[serde(rename_all = "camelCase")]
    M2CymaticValenceInvert {
        valence_before: Valence,
        valence_after: Valence,
    },
    #[serde(rename_all = "camelCase")]
    M3CodonRotationCross { codon_before: u8, codon_after: u8 },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RelationFamily {
    A,
    B,
    C,
    D1,
    D2,
    D3,
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
