use serde::{Deserialize, Serialize};

use crate::codon::classify_codon;
use crate::codon_rotation_projection::{codon_charge_quaternion, CodonRotationProjection};
use crate::kernel::MathemeHarmonicProfile;
use crate::mahamaya::MahamayaCodecProjection;
use crate::parashakti::{
    M2BoundedRoute, M2MusicalRouteInput, M2RelationPlan, M2RelationPlanContext,
    M2SituatedProviderBinding,
};

pub const M3_SCORE_SCHEMA: &str = "epi.m3.score.v1";
pub const M3_SCORE_OWNER: &str = "M3/M3' reciprocal score hinge";
pub const M3_DOMAIN_SPEC_REF: &str = "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md";
pub const M3_SCORE_HINGE_REF: &str =
    "Idea/Bimba/Seeds/M/M3'/M3-RECIPROCAL-SCORE-HINGE-LOCK.md";
pub const M3_CODEC_REF: &str = "Body/S/S0/portal-core/src/mahamaya.rs";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum M3ScoreDirection {
    Forward,
    Return,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3StableSourceRefs {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_m1_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_m2_relation_plan_ref: Option<String>,
    pub source_world_event_ref: String,
    #[serde(default)]
    pub provenance_refs: Vec<String>,
}

impl M3StableSourceRefs {
    fn validate(&self) -> Result<(), String> {
        require_ref("source_world_event_ref", &self.source_world_event_ref)?;
        validate_optional_ref("source_m1_ref", self.source_m1_ref.as_deref())?;
        validate_optional_ref(
            "source_m2_relation_plan_ref",
            self.source_m2_relation_plan_ref.as_deref(),
        )?;
        validate_refs("provenance_refs", &self.provenance_refs)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3PrimarySelectionEvidence {
    /// The selected primary Mahāmāyā address. This value is consumed, never
    /// inferred, by the reciprocal score constructor.
    pub address64: u8,
    pub selection_derivation_ref: String,
    pub source_entity_or_event_ref: String,
    pub line_index: u8,
    pub m2_vibration_index: usize,
    pub rna_phase: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rotation: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rotation_derivation_ref: Option<String>,
    /// A stable S3/world-clock or episode-time reference. It is not itself a
    /// numeric clock coordinate and is therefore kept distinct from
    /// `M3ClockPosition`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub temporal_context_ref: Option<String>,
    #[serde(default)]
    pub provenance_refs: Vec<String>,
}

impl M3PrimarySelectionEvidence {
    fn validate(&self) -> Result<(), String> {
        if self.address64 >= 64 {
            return Err(format!(
                "primary Mahāmāyā address must be in 0..63, got {}",
                self.address64
            ));
        }
        require_ref("selection_derivation_ref", &self.selection_derivation_ref)?;
        require_ref(
            "source_entity_or_event_ref",
            &self.source_entity_or_event_ref,
        )?;
        validate_optional_ref("temporal_context_ref", self.temporal_context_ref.as_deref())?;
        validate_refs("provenance_refs", &self.provenance_refs)?;

        match (self.rotation, self.rotation_derivation_ref.as_deref()) {
            (None, None) => Ok(()),
            (Some(rotation), Some(derivation_ref)) => {
                require_ref("rotation_derivation_ref", derivation_ref)?;
                let rotational_state_count = classify_codon(self.address64).rotational_state_count();
                if rotation >= rotational_state_count {
                    return Err(format!(
                        "rotation {rotation} is outside codon {}'s 0..{} state field",
                        self.address64,
                        rotational_state_count - 1
                    ));
                }
                Ok(())
            }
            _ => Err(
                "rotation and rotation_derivation_ref must either both be present or both absent"
                    .to_owned(),
            ),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ExplicitRotationState {
    pub rotation: u8,
    pub rotational_state_count: u8,
    pub codon_class: String,
    pub derivation_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ClockPosition {
    pub absolute_tick: u64,
    pub cycle: u64,
    pub tick12: u8,
    pub degree360: u16,
    pub degree720: u16,
    pub temporal_context_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3Score {
    pub schema: String,
    pub owner: String,
    pub direction: M3ScoreDirection,
    /// Describes how the primary address entered this score. Return scores use
    /// `explicit-provenance-backed-selection`; no score constructor implements
    /// the still-open Q_entity/Q_composed inverse-selection law.
    pub primary_selection_state: String,
    pub primary_selection_ref: String,
    pub primary_codec: MahamayaCodecProjection,
    pub charge_quaternion: [f32; 4],
    /// Forward current-world scores may carry the already-computed 84→472 modal
    /// projection. It remains distinct from the primary 64-fold codec address.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modal_rotation_projection: Option<CodonRotationProjection>,
    /// Return scores carry a rotation only when the caller supplies independent
    /// provenance for it; no rotation is inferred from address64.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub explicit_rotation: Option<M3ExplicitRotationState>,
    /// Exact numeric clock coordinates are present only when they are actually
    /// known (e.g. a current kernel profile).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub clock_position: Option<M3ClockPosition>,
    /// A return score may know the temporal/world reference without yet having
    /// a resolved M3 clock coordinate. This prevents a missing clock from being
    /// represented by fabricated zeroes.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub temporal_context_ref: Option<String>,
    pub sources: M3StableSourceRefs,
    pub provenance: Vec<String>,
}

impl M3Score {
    pub fn from_current_profile(
        profile: &MathemeHarmonicProfile,
        sources: M3StableSourceRefs,
    ) -> Result<Self, String> {
        sources.validate()?;
        let address64 = profile
            .binary
            .mahamaya_address64
            .ok_or_else(|| "current profile is missing its primary Mahāmāyā address".to_owned())?;
        let codec = MahamayaCodecProjection::from_address(
            address64,
            profile.binary.line_index,
            profile.binary.m2_vibration_index,
            profile.binary.dna_rna_phase == "RNA",
        )?;
        let mut provenance = canonical_provenance();
        provenance.push(format!(
            "MathemeHarmonicProfile/schema-v{}",
            profile.profile_schema_version
        ));
        provenance.extend(sources.provenance_refs.iter().cloned());
        let temporal_context_ref = "MathemeHarmonicProfile.tickAddress".to_owned();

        Ok(Self {
            schema: M3_SCORE_SCHEMA.to_owned(),
            owner: M3_SCORE_OWNER.to_owned(),
            direction: M3ScoreDirection::Forward,
            primary_selection_state: "kernel-current-world-address".to_owned(),
            primary_selection_ref: profile.binary.m3_codec_provenance.clone(),
            charge_quaternion: codon_charge_quaternion(codec.codon_id),
            primary_codec: codec,
            modal_rotation_projection: Some(profile.codon_rotation_projection.clone()),
            explicit_rotation: None,
            clock_position: Some(M3ClockPosition {
                absolute_tick: profile.tick_address.absolute_tick,
                cycle: profile.cycle,
                tick12: profile.tick12,
                degree360: profile.degree360,
                degree720: profile.degree720,
                temporal_context_ref: temporal_context_ref.clone(),
            }),
            temporal_context_ref: Some(temporal_context_ref),
            sources,
            provenance,
        })
    }

    pub fn from_primary_selection(selection: M3PrimarySelectionEvidence) -> Result<Self, String> {
        selection.validate()?;
        let codec = MahamayaCodecProjection::from_address(
            selection.address64,
            selection.line_index,
            selection.m2_vibration_index,
            selection.rna_phase,
        )?;
        let codon_class = classify_codon(selection.address64);
        let explicit_rotation = selection.rotation.map(|rotation| M3ExplicitRotationState {
            rotation,
            rotational_state_count: codon_class.rotational_state_count(),
            codon_class: codon_class.label().to_owned(),
            derivation_ref: selection
                .rotation_derivation_ref
                .clone()
                .expect("validated rotation provenance"),
        });
        let sources = M3StableSourceRefs {
            source_m1_ref: None,
            source_m2_relation_plan_ref: None,
            source_world_event_ref: selection.source_entity_or_event_ref.clone(),
            provenance_refs: selection.provenance_refs.clone(),
        };
        let mut provenance = canonical_provenance();
        provenance.push(selection.selection_derivation_ref.clone());
        provenance.extend(selection.provenance_refs.iter().cloned());

        Ok(Self {
            schema: M3_SCORE_SCHEMA.to_owned(),
            owner: M3_SCORE_OWNER.to_owned(),
            direction: M3ScoreDirection::Return,
            primary_selection_state: "explicit-provenance-backed-selection".to_owned(),
            primary_selection_ref: selection.selection_derivation_ref,
            charge_quaternion: codon_charge_quaternion(codec.codon_id),
            primary_codec: codec,
            modal_rotation_projection: None,
            explicit_rotation,
            clock_position: None,
            temporal_context_ref: selection.temporal_context_ref,
            sources,
            provenance,
        })
    }

    /// Replay a score through the bounded W3 compiler against a *current*
    /// harmonic/world profile. This preserves the score as determinate M3 form
    /// while allowing M2-5 to situate the replay in present provider state.
    pub fn compile_m2_replay_plan(
        &self,
        current_profile: &MathemeHarmonicProfile,
        input: M3ReplayPlanInput,
    ) -> Result<M2RelationPlan, String> {
        input.validate()?;
        let mut provenance_refs = input.provenance_refs;
        provenance_refs.push(M3_SCORE_HINGE_REF.to_owned());
        provenance_refs.push(self.primary_selection_ref.clone());
        provenance_refs.extend(self.provenance.iter().cloned());
        M2RelationPlan::compile(
            current_profile,
            M2RelationPlanContext {
                source_score_or_world_ref: input.score_ref,
                situated_provider: input.situated_provider,
                musical: input.musical,
                material_routes: input.material_routes,
                control_routes: input.control_routes,
                audio_routes: input.audio_routes,
                provenance_refs,
            },
        )
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ReplayPlanInput {
    pub score_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub situated_provider: Option<M2SituatedProviderBinding>,
    #[serde(default)]
    pub musical: M2MusicalRouteInput,
    #[serde(default)]
    pub material_routes: Vec<M2BoundedRoute>,
    #[serde(default)]
    pub control_routes: Vec<M2BoundedRoute>,
    #[serde(default)]
    pub audio_routes: Vec<M2BoundedRoute>,
    #[serde(default)]
    pub provenance_refs: Vec<String>,
}

impl M3ReplayPlanInput {
    fn validate(&self) -> Result<(), String> {
        require_ref("score_ref", &self.score_ref)?;
        validate_refs("provenance_refs", &self.provenance_refs)
    }
}

fn canonical_provenance() -> Vec<String> {
    vec![
        M3_DOMAIN_SPEC_REF.to_owned(),
        M3_SCORE_HINGE_REF.to_owned(),
        M3_CODEC_REF.to_owned(),
    ]
}

fn require_ref(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{field} must be a non-empty stable reference"))
    } else {
        Ok(())
    }
}

fn validate_optional_ref(field: &str, value: Option<&str>) -> Result<(), String> {
    match value {
        Some(value) => require_ref(field, value),
        None => Ok(()),
    }
}

fn validate_refs(field: &str, values: &[String]) -> Result<(), String> {
    for value in values {
        require_ref(field, value)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kernel::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

    fn profile(tick12: u8) -> MathemeHarmonicProfile {
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, tick12))
    }

    fn forward_sources() -> M3StableSourceRefs {
        M3StableSourceRefs {
            source_m1_ref: Some("M1:event:performed-001".to_owned()),
            source_m2_relation_plan_ref: Some("M2:plan:performed-001".to_owned()),
            source_world_event_ref: "M4:episode:forward-001".to_owned(),
            provenance_refs: vec!["trace:forward-001".to_owned()],
        }
    }

    #[test]
    fn forward_score_preserves_primary_codec_and_distinct_modal_projection() {
        let profile = profile(7);
        let score = M3Score::from_current_profile(&profile, forward_sources()).unwrap();
        assert_eq!(score.direction, M3ScoreDirection::Forward);
        assert_eq!(
            score.primary_codec.address64,
            profile.binary.mahamaya_address64.unwrap()
        );
        assert_eq!(
            score.modal_rotation_projection.as_ref().unwrap(),
            &profile.codon_rotation_projection
        );
        assert_eq!(
            score.charge_quaternion,
            codon_charge_quaternion(score.primary_codec.codon_id)
        );
        assert_eq!(score.clock_position.as_ref().unwrap().tick12, profile.tick12);
        assert_eq!(
            score.temporal_context_ref.as_deref(),
            Some("MathemeHarmonicProfile.tickAddress")
        );
    }

    #[test]
    fn return_score_requires_explicit_primary_selection_provenance() {
        let selection = M3PrimarySelectionEvidence {
            address64: 42,
            selection_derivation_ref: "M4->M3:derivation:episode-42".to_owned(),
            source_entity_or_event_ref: "M4:episode:return-042".to_owned(),
            line_index: 4,
            m2_vibration_index: 64,
            rna_phase: false,
            rotation: None,
            rotation_derivation_ref: None,
            temporal_context_ref: None,
            provenance_refs: vec!["M4:identity:evidence-042".to_owned()],
        };
        let score = M3Score::from_primary_selection(selection).unwrap();
        assert_eq!(score.direction, M3ScoreDirection::Return);
        assert_eq!(score.primary_codec.address64, 42);
        assert_eq!(
            score.primary_selection_state,
            "explicit-provenance-backed-selection"
        );
        assert!(score.modal_rotation_projection.is_none());
        assert!(score.explicit_rotation.is_none());
        assert!(score.clock_position.is_none());
    }

    #[test]
    fn return_score_does_not_infer_clock_or_rotation_and_validates_explicit_rotation() {
        let mut selection = M3PrimarySelectionEvidence {
            address64: 42,
            selection_derivation_ref: "M4->M3:derivation:episode-42".to_owned(),
            source_entity_or_event_ref: "M4:episode:return-042".to_owned(),
            line_index: 4,
            m2_vibration_index: 64,
            rna_phase: false,
            rotation: Some(2),
            rotation_derivation_ref: Some("M3:rotation:evidence-2".to_owned()),
            temporal_context_ref: Some("S3:clock:episode-042".to_owned()),
            provenance_refs: vec![],
        };
        let score = M3Score::from_primary_selection(selection.clone()).unwrap();
        assert_eq!(score.explicit_rotation.as_ref().unwrap().rotation, 2);
        assert!(score.clock_position.is_none());
        assert_eq!(
            score.temporal_context_ref.as_deref(),
            Some("S3:clock:episode-042")
        );

        selection.rotation = Some(8);
        assert!(M3Score::from_primary_selection(selection).is_err());
    }

    #[test]
    fn invalid_or_unprovenanced_primary_selection_is_rejected() {
        let mut selection = M3PrimarySelectionEvidence {
            address64: 64,
            selection_derivation_ref: "derive:bad".to_owned(),
            source_entity_or_event_ref: "M4:event:bad".to_owned(),
            line_index: 0,
            m2_vibration_index: 0,
            rna_phase: false,
            rotation: None,
            rotation_derivation_ref: None,
            temporal_context_ref: None,
            provenance_refs: vec![],
        };
        assert!(M3Score::from_primary_selection(selection.clone()).is_err());
        selection.address64 = 10;
        selection.selection_derivation_ref.clear();
        assert!(M3Score::from_primary_selection(selection).is_err());
    }

    #[test]
    fn replay_compiles_score_into_current_bounded_m2_plan() {
        let score = M3Score::from_current_profile(&profile(4), forward_sources()).unwrap();
        let current = profile(9);
        let plan = score
            .compile_m2_replay_plan(
                &current,
                M3ReplayPlanInput {
                    score_ref: "M3:score:forward-001".to_owned(),
                    situated_provider: Some(M2SituatedProviderBinding {
                        planetary_state_ref: "provider:kerykeion:now-002".to_owned(),
                        chakra_state_ref: "M4:nara:chakra-now".to_owned(),
                        elemental_state_ref: "M4:nara:element-now".to_owned(),
                        identity_relation_refs: vec!["S2:nara-world:relation-now".to_owned()],
                        temporal_provider_refs: vec!["S3:world-clock:now".to_owned()],
                    }),
                    musical: M2MusicalRouteInput::default(),
                    material_routes: vec![],
                    control_routes: vec![],
                    audio_routes: vec![],
                    provenance_refs: vec!["replay:request-001".to_owned()],
                },
            )
            .unwrap();
        assert_eq!(plan.source_score_or_world_ref, "M3:score:forward-001");
        assert_eq!(plan.situated.binding_state, "provider-bound");
        assert_eq!(
            plan.address72.index72 as usize,
            current.resonance72.lens_anchor_index
        );
        assert!(plan.provenance.iter().any(|p| p == M3_SCORE_HINGE_REF));
        assert!(
            plan.provenance
                .iter()
                .any(|p| p == &score.primary_selection_ref)
        );
    }
}
