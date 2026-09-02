use serde::{Deserialize, Serialize};

use crate::kernel::{
    MathemeHarmonicProfile, MathemeNodalConstraint, MathemePlanetaryChakralProjection,
};

pub const M2_RELATION_PLAN_SCHEMA: &str = "epi.m2.relation-plan.v1";
pub const M2_RELATION_PLAN_OWNER: &str = "M2'/M2-5 bounded relation compiler";
pub const M2_DOMAIN_SPEC_REF: &str = "Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md";
pub const M2_SITUATED_LOCK_REF: &str =
    "Idea/Bimba/Seeds/M/M2'/M2-5-SITUATED-RETURN-PLAYBACK-LOCK.md";
pub const M2_C_SUBSTRATE_REF: &str = "Body/S/S0/epi-lib/include/m2.h";

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2Address72Views {
    pub index72: u8,
    pub mef_lens12: u8,
    pub mef_position6: u8,
    pub tattva36: u8,
    pub tattva_phase2: u8,
    pub decan_element4: u8,
    pub decan_sign3: u8,
    pub decan_index3: u8,
    pub decan_face2: u8,
    pub shem_choir8: u8,
    pub shem_position9: u8,
    /// The C substrate exposes `M2_MAQAM_DESC[72]`; exact family/mode
    /// semantics remain table/S2-owned, so the relation plan carries the
    /// canonical row address without reconstructing those fields locally.
    pub maqam_row72: u8,
}

impl M2Address72Views {
    pub fn decode(index72: usize) -> Result<Self, String> {
        if index72 >= 72 {
            return Err(format!("M2 address must be in 0..71, got {index72}"));
        }
        let index72 = index72 as u8;
        let decan_local = index72 % 18;
        Ok(Self {
            index72,
            mef_lens12: index72 / 6,
            mef_position6: index72 % 6,
            tattva36: index72 / 2,
            tattva_phase2: index72 % 2,
            decan_element4: index72 / 18,
            decan_sign3: decan_local / 6,
            decan_index3: (decan_local % 6) / 2,
            decan_face2: index72 % 2,
            shem_choir8: index72 / 9,
            shem_position9: index72 % 9,
            maqam_row72: index72,
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2SituatedProviderBinding {
    pub planetary_state_ref: String,
    pub chakra_state_ref: String,
    pub elemental_state_ref: String,
    #[serde(default)]
    pub identity_relation_refs: Vec<String>,
    #[serde(default)]
    pub temporal_provider_refs: Vec<String>,
}

impl M2SituatedProviderBinding {
    fn validate(&self) -> Result<(), String> {
        require_ref("planetary_state_ref", &self.planetary_state_ref)?;
        require_ref("chakra_state_ref", &self.chakra_state_ref)?;
        require_ref("elemental_state_ref", &self.elemental_state_ref)?;
        validate_refs("identity_relation_refs", &self.identity_relation_refs)?;
        validate_refs("temporal_provider_refs", &self.temporal_provider_refs)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct M2MusicalRouteInput {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub maqam_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tuning_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub phrase_or_modulation_ref: Option<String>,
    #[serde(default)]
    pub mantra_or_name_route_refs: Vec<String>,
}

impl M2MusicalRouteInput {
    fn validate(&self) -> Result<(), String> {
        validate_optional_ref("maqam_ref", self.maqam_ref.as_deref())?;
        validate_optional_ref("tuning_ref", self.tuning_ref.as_deref())?;
        validate_optional_ref(
            "phrase_or_modulation_ref",
            self.phrase_or_modulation_ref.as_deref(),
        )?;
        validate_refs("mantra_or_name_route_refs", &self.mantra_or_name_route_refs)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2BoundedRoute {
    pub route_ref: String,
    pub provenance_ref: String,
}

impl M2BoundedRoute {
    fn validate(&self) -> Result<(), String> {
        require_ref("route_ref", &self.route_ref)?;
        require_ref("provenance_ref", &self.provenance_ref)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2RelationPlanContext {
    pub source_score_or_world_ref: String,
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

impl M2RelationPlanContext {
    fn validate(&self) -> Result<(), String> {
        require_ref("source_score_or_world_ref", &self.source_score_or_world_ref)?;
        if let Some(binding) = &self.situated_provider {
            binding.validate()?;
        }
        self.musical.validate()?;
        validate_routes("material_routes", &self.material_routes)?;
        validate_routes("control_routes", &self.control_routes)?;
        validate_routes("audio_routes", &self.audio_routes)?;
        validate_refs("provenance_refs", &self.provenance_refs)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2SituatedState {
    /// `provider-bound` only when bounded current-world evidence was supplied.
    /// The profile compatibility projection is retained separately and never
    /// promoted into canonical S2 law by this compiler.
    pub binding_state: String,
    pub profile_alignment: MathemePlanetaryChakralProjection,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub provider_binding: Option<M2SituatedProviderBinding>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2DetEvidence {
    pub source_index72: u8,
    /// Exact integer form of the authored `72 * 8 / 9 -> 64` aperture.
    pub epogdoon_index64: u8,
    /// Existing profile-side M2→M3 symbolic evidence; retained as its own
    /// field rather than equated with the integer aperture above.
    pub profile_m2_to_m3_symbol: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile_mahamaya_address64: Option<u8>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2ExecutionRoutes {
    /// Exact frequencies already written by M2-1' Vimarśā. The relation plan
    /// copies them; real-time consumers do not recompute profile audio.
    pub audio_octet_hz: [f32; 8],
    pub nodal_quartet: [MathemeNodalConstraint; 4],
    pub p_position_element: String,
    pub l2_prime_element: String,
    pub musical: M2MusicalRouteInput,
    pub material_routes: Vec<M2BoundedRoute>,
    pub control_routes: Vec<M2BoundedRoute>,
    pub audio_routes: Vec<M2BoundedRoute>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2RelationPlan {
    pub schema: String,
    pub owner: String,
    pub source_score_or_world_ref: String,
    pub address72: M2Address72Views,
    pub situated: M2SituatedState,
    pub det: M2DetEvidence,
    pub execution: M2ExecutionRoutes,
    pub provenance: Vec<String>,
}

impl M2RelationPlan {
    /// Compile the smallest sufficient M2 context before real-time execution.
    ///
    /// No graph or provider access occurs here: callers resolve S2/world state
    /// first and pass stable references in `context`. The resulting plan is a
    /// frozen handoff that audio/material/control loops can consume without
    /// querying the whole Bimba graph.
    pub fn compile(
        profile: &MathemeHarmonicProfile,
        context: M2RelationPlanContext,
    ) -> Result<Self, String> {
        context.validate()?;
        let address72 = M2Address72Views::decode(profile.resonance72.lens_anchor_index)?;
        let source_index72 = address72.index72;
        let situated = M2SituatedState {
            binding_state: if context.situated_provider.is_some() {
                "provider-bound"
            } else {
                "pending-provider-binding"
            }
            .to_owned(),
            profile_alignment: profile.planetary_chakral.clone(),
            provider_binding: context.situated_provider.clone(),
        };
        let mut provenance = vec![
            M2_DOMAIN_SPEC_REF.to_owned(),
            M2_SITUATED_LOCK_REF.to_owned(),
            M2_C_SUBSTRATE_REF.to_owned(),
            format!("MathemeHarmonicProfile/schema-v{}", profile.profile_schema_version),
        ];
        provenance.extend(context.provenance_refs.iter().cloned());

        Ok(Self {
            schema: M2_RELATION_PLAN_SCHEMA.to_owned(),
            owner: M2_RELATION_PLAN_OWNER.to_owned(),
            source_score_or_world_ref: context.source_score_or_world_ref,
            address72,
            situated,
            det: M2DetEvidence {
                source_index72,
                epogdoon_index64: ((u16::from(source_index72) * 8) / 9) as u8,
                profile_m2_to_m3_symbol: profile.binary.m2_to_m3_symbol,
                profile_mahamaya_address64: profile.binary.mahamaya_address64,
            },
            execution: M2ExecutionRoutes {
                audio_octet_hz: profile.audio_octet,
                nodal_quartet: profile.nodal_quartet.clone(),
                p_position_element: profile.elements.p_position_element.clone(),
                l2_prime_element: profile.elements.l2_prime_element.clone(),
                musical: context.musical,
                material_routes: context.material_routes,
                control_routes: context.control_routes,
                audio_routes: context.audio_routes,
            },
            provenance,
        })
    }
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

fn validate_routes(field: &str, routes: &[M2BoundedRoute]) -> Result<(), String> {
    for route in routes {
        route
            .validate()
            .map_err(|error| format!("{field}: {error}"))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kernel::kernel_tick_from_epogdoon;

    fn profile(tick12: u8) -> MathemeHarmonicProfile {
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, tick12))
    }

    fn context() -> M2RelationPlanContext {
        M2RelationPlanContext {
            source_score_or_world_ref: "M4:event:test-001".to_owned(),
            situated_provider: Some(M2SituatedProviderBinding {
                planetary_state_ref: "provider:kerykeion:snapshot-001".to_owned(),
                chakra_state_ref: "M4:nara:chakra-state-001".to_owned(),
                elemental_state_ref: "M4:nara:element-state-001".to_owned(),
                identity_relation_refs: vec!["S2:relation:nara-world-001".to_owned()],
                temporal_provider_refs: vec!["S3:kairos:frame-001".to_owned()],
            }),
            musical: M2MusicalRouteInput {
                maqam_ref: Some("S2:maqam:route-12".to_owned()),
                tuning_ref: Some("S2:tuning:just-12".to_owned()),
                phrase_or_modulation_ref: None,
                mantra_or_name_route_refs: vec!["S2:shem:route-21".to_owned()],
            },
            material_routes: vec![M2BoundedRoute {
                route_ref: "material:bell-mode-04".to_owned(),
                provenance_ref: "S2:material:bell-04".to_owned(),
            }],
            control_routes: vec![],
            audio_routes: vec![M2BoundedRoute {
                route_ref: "audio:vimarsha-octet".to_owned(),
                provenance_ref: "portal-core::parashakti::vimarsha_reading".to_owned(),
            }],
            provenance_refs: vec!["M3:score:test-001".to_owned()],
        }
    }

    #[test]
    fn all_72_native_address_views_round_trip_without_generic_lookup_collapse() {
        for index in 0..72usize {
            let decoded = M2Address72Views::decode(index).unwrap();
            assert_eq!(usize::from(decoded.index72), index);
            assert_eq!(usize::from(decoded.mef_lens12) * 6 + usize::from(decoded.mef_position6), index);
            assert_eq!(usize::from(decoded.tattva36) * 2 + usize::from(decoded.tattva_phase2), index);
            assert_eq!(
                usize::from(decoded.decan_element4) * 18
                    + usize::from(decoded.decan_sign3) * 6
                    + usize::from(decoded.decan_index3) * 2
                    + usize::from(decoded.decan_face2),
                index
            );
            assert_eq!(usize::from(decoded.shem_choir8) * 9 + usize::from(decoded.shem_position9), index);
            assert_eq!(decoded.maqam_row72, decoded.index72);
        }
        assert!(M2Address72Views::decode(72).is_err());
    }

    #[test]
    fn plan_copies_vimarsha_bus_exactly_and_keeps_det_evidence_typed() {
        let profile = profile(8);
        let plan = M2RelationPlan::compile(&profile, context()).unwrap();
        assert_eq!(plan.execution.audio_octet_hz, profile.audio_octet);
        assert_eq!(plan.execution.nodal_quartet, profile.nodal_quartet);
        assert_eq!(plan.det.source_index72 as usize, profile.resonance72.lens_anchor_index);
        assert_eq!(plan.det.epogdoon_index64, ((plan.det.source_index72 as u16 * 8) / 9) as u8);
        assert_eq!(plan.det.profile_m2_to_m3_symbol, profile.binary.m2_to_m3_symbol);
    }

    #[test]
    fn situated_binding_is_provider_owned_not_invented_from_profile_alignment() {
        let profile = profile(3);
        let mut input = context();
        input.situated_provider = None;
        let plan = M2RelationPlan::compile(&profile, input).unwrap();
        assert_eq!(plan.situated.binding_state, "pending-provider-binding");
        assert!(plan.situated.provider_binding.is_none());
        assert!(plan.situated.profile_alignment.provenance.contains("S2 graph law"));
    }

    #[test]
    fn provider_bound_plan_keeps_planetary_chakral_identity_and_time_together() {
        let plan = M2RelationPlan::compile(&profile(5), context()).unwrap();
        assert_eq!(plan.situated.binding_state, "provider-bound");
        let binding = plan.situated.provider_binding.unwrap();
        assert_eq!(binding.identity_relation_refs, ["S2:relation:nara-world-001"]);
        assert_eq!(binding.temporal_provider_refs, ["S3:kairos:frame-001"]);
        assert!(binding.planetary_state_ref.starts_with("provider:kerykeion"));
        assert!(binding.chakra_state_ref.starts_with("M4:nara"));
    }

    #[test]
    fn plan_rejects_unbounded_or_provenance_free_routes() {
        let profile = profile(0);
        let mut input = context();
        input.source_score_or_world_ref.clear();
        assert!(M2RelationPlan::compile(&profile, input).is_err());

        let mut input = context();
        input.material_routes[0].provenance_ref.clear();
        assert!(M2RelationPlan::compile(&profile, input).is_err());

        let mut input = context();
        input.situated_provider.as_mut().unwrap().planetary_state_ref.clear();
        assert!(M2RelationPlan::compile(&profile, input).is_err());
    }

    #[test]
    fn plan_is_json_serializable_real_time_handoff_not_a_graph_handle() {
        let plan = M2RelationPlan::compile(&profile(7), context()).unwrap();
        let encoded = serde_json::to_string(&plan).unwrap();
        assert!(encoded.contains("epi.m2.relation-plan.v1"));
        assert!(encoded.contains("M4:event:test-001"));
        assert!(encoded.contains("provider:kerykeion:snapshot-001"));
        assert!(encoded.contains("audio:vimarsha-octet"));
        assert!(!encoded.contains("cypher"));
        assert!(!encoded.contains("neo4j"));
    }
}
