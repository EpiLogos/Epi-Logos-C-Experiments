use crate::{EpiPrimitiveSnapshot, PrimitiveStatus, EPI_SOURCE_REVISION};
use portal_core::{compose_personal_quaternion, PersonalIdentityProfile, PersonalResonance};
use ql_mef::{MCoordinate as QlMCoordinate, MFace as QlMFace};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub const CURRENT_SITUATED_MATHEME_SCHEMA: &str = "epi.current-situated-matheme/v1";
pub const COSMIC_PARENT_SCHEMA: &str = "epi.cosmic.123/v1";
pub const COSMIC_PRODUCT_ID: &str = "epi.cosmic.123";
pub const PERSONAL_PRODUCT_ID: &str = "epi.personal.450";
pub const CURRENT_SITUATED_ACTION_REF: &str = "epi.action.current-situated.read";
pub const COSMIC_CURRENT_ACTION_REF: &str = "epi.action.cosmic.current.read";
pub const COSMIC_OPEN_DEPTH_ACTION_REF: &str = "epi.action.cosmic.open-depth";
pub const LIVING_PERSONAL_SOURCE_COORDINATE: &str = "#4.4.4.4";
pub const LIVING_PERSONAL_M_COORDINATE_REF: &str = "epi:m-coordinate:M4-4-4-4'";
pub const QL_MAP_PROVIDER_REVISION: &str = "d418abfff6f9e001c8c5ff083206329b298eddcf";
pub const QL_MAP_SOURCE_REVISION: &str = "daa660cbc1b8c5da83828698665a753852cb0287";
pub const QL_MAP_DATASET_TREE: &str = "cd4f4f77c13f27e2563c5a6753d2f8bf2b605f15";
pub const QL_MAP_RETURNED_REALITY_SCHEMA: &str = "ql.epi-bimba-pre-d-returned-reality/v1";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorldObservationClass {
    LiveProvider,
    Fixture,
    DerivedOnly,
}

impl WorldObservationClass {
    pub const fn can_claim_live_now(self) -> bool {
        matches!(self, Self::LiveProvider)
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CelestialBodyObservation {
    pub body: String,
    pub longitude_degrees: f64,
    #[serde(default)]
    pub retrograde: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sign: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decan: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_ref: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorldConditionObservation {
    pub observation_ref: String,
    pub observation_class: WorldObservationClass,
    pub provider_ref: String,
    pub provider_revision: String,
    pub observed_at_unix_ms: u64,
    pub observer_ref: String,
    pub q_transit: [f32; 4],
    pub q_transit_source_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub solar: Option<CelestialBodyObservation>,
    #[serde(default)]
    pub planets: Vec<CelestialBodyObservation>,
    #[serde(default)]
    pub correspondence_refs: Vec<String>,
}

impl WorldConditionObservation {
    fn validate(&self, event_time_unix_ms: u64) -> Result<(), String> {
        required(&self.observation_ref, "worldCondition.observationRef")?;
        required(&self.provider_ref, "worldCondition.providerRef")?;
        required(&self.provider_revision, "worldCondition.providerRevision")?;
        required(&self.observer_ref, "worldCondition.observerRef")?;
        required(&self.q_transit_source_ref, "worldCondition.qTransitSourceRef")?;
        if self.observed_at_unix_ms != event_time_unix_ms {
            return Err(format!(
                "world observation {} is at {}, but Current Situated Matheme event is at {}; M1/M2/M3 must share one event time",
                self.observation_ref, self.observed_at_unix_ms, event_time_unix_ms
            ));
        }
        for body in self.solar.iter().chain(self.planets.iter()) {
            required(&body.body, "worldCondition.body")?;
            if !body.longitude_degrees.is_finite()
                || !(0.0..360.0).contains(&body.longitude_degrees)
            {
                return Err(format!(
                    "{} longitude must be finite and in [0, 360), got {}",
                    body.body, body.longitude_degrees
                ));
            }
            if let Some(decan) = body.decan {
                if decan > 35 {
                    return Err(format!("{} decan must be 0..35, got {decan}", body.body));
                }
            }
        }
        if self.observation_class.can_claim_live_now() && self.planets.is_empty() {
            return Err(
                "live-provider world observation must contain provider-observed planetary state; empty/default state cannot claim live-now"
                    .to_owned(),
            );
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SituatedActivityEvidence {
    pub activity_ref: String,
    pub q_activity: [f32; 4],
    pub observed_at_unix_ms: u64,
    pub source_class: String,
}

impl SituatedActivityEvidence {
    fn validate(&self, event_time_unix_ms: u64) -> Result<(), String> {
        required(&self.activity_ref, "activity.activityRef")?;
        required(&self.source_class, "activity.sourceClass")?;
        if self.observed_at_unix_ms != event_time_unix_ms {
            return Err(format!(
                "activity {} is at {}, but Current Situated Matheme event is at {}; situated paśu activity must be co-temporal with the event",
                self.activity_ref, self.observed_at_unix_ms, event_time_unix_ms
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CurrentSituatedRequest {
    pub event_at_unix_ms: u64,
    pub personal_identity: PersonalIdentityProfile,
    pub activity: SituatedActivityEvidence,
    pub world_condition: WorldConditionObservation,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MapCoordinateLineage {
    pub source_coordinate: String,
    pub bimba_ref: String,
    pub pratibimba_ref: String,
    pub source_repository: String,
    pub source_revision: String,
    pub map_root: String,
    pub dataset_tree: String,
    pub ql_map_provider_revision: String,
    pub returned_reality_schema: String,
    pub relation_query_ref: String,
}

impl MapCoordinateLineage {
    fn root(source_coordinate: &str) -> Result<Self, String> {
        let bimba = QlMCoordinate::parse_source(source_coordinate, QlMFace::Bimba)?;
        let pratibimba = bimba.reflected();
        Ok(Self {
            source_coordinate: source_coordinate.to_owned(),
            bimba_ref: bimba.canonical_ref(),
            pratibimba_ref: pratibimba.canonical_ref(),
            source_repository: "EpiLogos/Epi-Logos-C-Experiments".to_owned(),
            source_revision: QL_MAP_SOURCE_REVISION.to_owned(),
            map_root: "Idea/Bimba/Map/**".to_owned(),
            dataset_tree: QL_MAP_DATASET_TREE.to_owned(),
            ql_map_provider_revision: QL_MAP_PROVIDER_REVISION.to_owned(),
            returned_reality_schema: QL_MAP_RETURNED_REALITY_SCHEMA.to_owned(),
            relation_query_ref: format!(
                "EpiLogos/QL-MEF@{QL_MAP_PROVIDER_REVISION}:MMapIndex::relations_for({source_coordinate})"
            ),
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoundaryExpression {
    pub position: String,
    pub role: String,
    pub source_ref: String,
    pub expression: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParentMContribution {
    pub m: u8,
    pub name: String,
    pub event_ref: String,
    pub m_coordinate_ref: String,
    pub lineage: MapCoordinateLineage,
    pub boundary_ground: BoundaryExpression,
    pub boundary_return: BoundaryExpression,
    pub status: PrimitiveStatus,
    pub claim_class: String,
    pub source_refs: Vec<String>,
    pub operator_refs: Vec<String>,
    pub data: Value,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CausalEdge {
    pub from_ref: String,
    pub to_ref: String,
    pub relation: String,
    pub event_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SituatedPersonalIdentity {
    pub product_id: String,
    pub event_ref: String,
    pub subject_ref: String,
    pub episode_ref: String,
    pub privacy_class: String,
    pub living_source_coordinate: String,
    pub living_m_coordinate_ref: String,
    pub identity_hash: String,
    pub q_identity: [f32; 4],
    pub q_transit: [f32; 4],
    pub q_activity: [f32; 4],
    pub q_composed: [f32; 4],
    pub situated_resonance: PersonalResonance,
    pub q_transit_source_ref: String,
    pub q_activity_source_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeepSurfaceRelation {
    pub event_ref: String,
    pub m_coordinate_ref: String,
    pub product_id: String,
    pub surface_ref: String,
    pub open_action_ref: String,
    pub boundary_ground_ref: String,
    pub boundary_return_ref: String,
    pub completion_claimed: bool,
    pub readiness: PrimitiveStatus,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentSituatedMatheme {
    pub schema: String,
    pub event_ref: String,
    pub native_owner: String,
    pub event_at_unix_ms: u64,
    pub day_now: String,
    pub ql_address: String,
    pub profile_ref: String,
    pub world_observation: WorldConditionObservation,
    pub personal: SituatedPersonalIdentity,
    pub m1: ParentMContribution,
    pub m2: ParentMContribution,
    pub m3: ParentMContribution,
    pub causal_path: Vec<CausalEdge>,
    pub source_revisions: Value,
    pub readiness: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicParentSurface {
    pub schema: String,
    pub product_id: String,
    pub surface_ref: String,
    pub native_owner: String,
    pub event_ref: String,
    pub subject_ref: String,
    pub profile_ref: String,
    pub day_now: String,
    pub m1: ParentMContribution,
    pub m2: ParentMContribution,
    pub m3: ParentMContribution,
    pub personal_binding_ref: String,
    pub available_actions: Vec<String>,
    pub deep_surfaces: Vec<DeepSurfaceRelation>,
    pub presentation_contract: String,
    pub provenance: Value,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentSituatedResponse {
    pub event: CurrentSituatedMatheme,
    pub cosmic: CosmicParentSurface,
}

pub fn current_situated(
    snapshot: &EpiPrimitiveSnapshot,
    request: CurrentSituatedRequest,
) -> Result<CurrentSituatedResponse, String> {
    if request.event_at_unix_ms != snapshot.provenance.observed_at_unix_ms {
        return Err(format!(
            "request event time {} does not match shared Epi snapshot time {}",
            request.event_at_unix_ms, snapshot.provenance.observed_at_unix_ms
        ));
    }
    request.world_condition.validate(request.event_at_unix_ms)?;
    request.activity.validate(request.event_at_unix_ms)?;

    let nara = snapshot
        .nara
        .context
        .as_ref()
        .ok_or_else(|| "Current Situated Matheme requires the existing protected Nara context; D does not mint a Personal subject".to_owned())?;
    let episode_ref = nara
        .episode_ref
        .as_ref()
        .ok_or_else(|| "Current Situated Matheme requires the existing Nara episodeRef; D does not invent another PersonalEvent".to_owned())?;

    let q_identity = request.personal_identity.q_personal;
    let q_transit = request.world_condition.q_transit;
    let q_activity = request.activity.q_activity;
    let q_composed = compose_personal_quaternion(q_identity, q_transit, q_activity);
    let situated_resonance = PersonalResonance::from_quaternions(
        q_composed,
        snapshot.kernel.harmonic_profile.q_cosmic,
    );

    let profile_ref = format!(
        "epi:matheme-harmonic-profile:{}:{}",
        snapshot.source_revision, snapshot.kernel.harmonic_profile.tick
    );
    let event_ref = event_ref(
        request.event_at_unix_ms,
        &request.world_condition.observation_ref,
        episode_ref,
        &request.personal_identity.identity_hash,
        snapshot.kernel.harmonic_profile.tick,
    );

    let m1_lineage = MapCoordinateLineage::root("#1")?;
    let m2_lineage = MapCoordinateLineage::root("#2")?;
    let m3_lineage = MapCoordinateLineage::root("#3")?;
    let profile = &snapshot.kernel.harmonic_profile;

    let m1 = ParentMContribution {
        m: 1,
        name: "Paramasiva".to_owned(),
        event_ref: event_ref.clone(),
        m_coordinate_ref: m1_lineage.pratibimba_ref.clone(),
        lineage: m1_lineage,
        boundary_ground: BoundaryExpression {
            position: ".0".to_owned(),
            role: "authoritative-ground/reception".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M1".to_owned(),
            expression: "current QL/harmonic act received from the shared Epi kernel/profile; no renderer-local M1 computation".to_owned(),
        },
        boundary_return: BoundaryExpression {
            position: ".5".to_owned(),
            role: "totalisation/return".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M1".to_owned(),
            expression: "compact current topology/oscillation return only; full played K²/Ananda instrument remains epi.deep.m1".to_owned(),
        },
        status: PrimitiveStatus::Implemented,
        claim_class: "implemented-current-parent".to_owned(),
        source_refs: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/** #1".to_owned(),
        ],
        operator_refs: vec![
            "epi-lib::kernel_tick_from_epogdoon".to_owned(),
            "portal-core::MathemeHarmonicProfile::from_tick".to_owned(),
            "ql-core::QlAddress::sixfold".to_owned(),
        ],
        data: json!({
            "tickAddress": &profile.tick_address,
            "position6": profile.position6,
            "phase": profile.phase,
            "helix": &profile.helix,
            "degree720": profile.degree720,
            "degree360": profile.degree360,
            "su2Layer": &profile.su2_layer,
            "qCosmic": profile.q_cosmic,
            "chromatic": &profile.chromatic,
            "diatonic": &profile.diatonic,
            "contextFrames": &profile.context_frames,
        }),
    };

    let m2_status = if request.world_condition.observation_class.can_claim_live_now() {
        PrimitiveStatus::Implemented
    } else {
        PrimitiveStatus::Degraded
    };
    let m2_claim_class = if request.world_condition.observation_class.can_claim_live_now() {
        "live-provider-current-parent"
    } else {
        "non-live-provider-degraded"
    };
    let m2 = ParentMContribution {
        m: 2,
        name: "Parashakti".to_owned(),
        event_ref: event_ref.clone(),
        m_coordinate_ref: m2_lineage.pratibimba_ref.clone(),
        lineage: m2_lineage,
        boundary_ground: BoundaryExpression {
            position: ".0".to_owned(),
            role: "authoritative-ground/reception".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M2".to_owned(),
            expression: "72-fold harmonic/correspondential ground plus explicit world-provider observation; derived defaults are not promoted to live-world fact".to_owned(),
        },
        boundary_return: BoundaryExpression {
            position: ".5".to_owned(),
            role: "totalisation/return".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M2".to_owned(),
            expression: "current celestial/correspondential world-condition only; dense cymatic/frequency laboratory remains epi.deep.m2".to_owned(),
        },
        status: m2_status,
        claim_class: m2_claim_class.to_owned(),
        source_refs: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/** #2".to_owned(),
            request.world_condition.observation_ref.clone(),
        ],
        operator_refs: vec![
            "portal-core::MathemeResonance72Projection::from_tick".to_owned(),
            "portal-core::parashakti::vimarsha_read_profile".to_owned(),
            request.world_condition.q_transit_source_ref.clone(),
        ],
        data: json!({
            "worldObservationRef": &request.world_condition.observation_ref,
            "observationClass": request.world_condition.observation_class,
            "providerRef": &request.world_condition.provider_ref,
            "providerRevision": &request.world_condition.provider_revision,
            "observerRef": &request.world_condition.observer_ref,
            "solar": &request.world_condition.solar,
            "planets": &request.world_condition.planets,
            "correspondenceRefs": &request.world_condition.correspondence_refs,
            "resonance72": &profile.resonance72,
            "derivedPlanetaryChakralProjection": &profile.planetary_chakral,
            "derivedProjectionStanding": "Epi harmonic/correspondential projection; not substituted for provider-observed planetary positions",
            "qTransit": q_transit,
            "qTransitSourceRef": &request.world_condition.q_transit_source_ref,
        }),
    };

    let symbolic = &profile.mahamaya;
    let m3 = ParentMContribution {
        m: 3,
        name: "Mahamaya".to_owned(),
        event_ref: event_ref.clone(),
        m_coordinate_ref: m3_lineage.pratibimba_ref.clone(),
        lineage: m3_lineage,
        boundary_ground: BoundaryExpression {
            position: ".0".to_owned(),
            role: "authoritative-ground/reception".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M3".to_owned(),
            expression: "same-event 72→64 reception using the M1/M2 event time and world observation; no independent clock event".to_owned(),
        },
        boundary_return: BoundaryExpression {
            position: ".5".to_owned(),
            role: "totalisation/return".to_owned(),
            source_ref: "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md#M3".to_owned(),
            expression: "deterministic current 360/720 inscription and ready symbolic address; full transcription/clock workbench remains epi.deep.m3".to_owned(),
        },
        status: snapshot.mahamaya.status,
        claim_class: "implemented-partial-current-parent".to_owned(),
        source_refs: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/** #3".to_owned(),
        ],
        operator_refs: vec![
            "portal-core::MathemeBinaryProjection::from_clock".to_owned(),
            "portal-core::codon_rotation_from_lens_mode".to_owned(),
        ],
        data: json!({
            "worldObservationRef": &request.world_condition.observation_ref,
            "degree360": profile.degree360,
            "degree720": profile.degree720,
            "address64": symbolic.mahamaya_address64,
            "codon": &symbolic.codon,
            "hexagram": &symbolic.hexagram,
            "lineChangeOperator": &symbolic.line_change_operator,
            "lineIndex": symbolic.line_index,
            "tarotMinorId": symbolic.tarot_minor_id,
            "tarotShadowCodon": symbolic.tarot_shadow_codon,
            "aminoAcidCode": &symbolic.amino_acid_code,
            "m2VibrationIndex": symbolic.m2_vibration_index,
            "m2ToM3Symbol": symbolic.m2_to_m3_symbol,
            "codonRotationProjection": &profile.codon_rotation_projection,
            "transcriptionState": &symbolic.transcription_state,
            "datasetLutState": &symbolic.dataset_lut_state,
        }),
    };

    let personal = SituatedPersonalIdentity {
        product_id: PERSONAL_PRODUCT_ID.to_owned(),
        event_ref: event_ref.clone(),
        subject_ref: nara.identity_ref.clone(),
        episode_ref: episode_ref.clone(),
        privacy_class: "protected-local-derived".to_owned(),
        living_source_coordinate: LIVING_PERSONAL_SOURCE_COORDINATE.to_owned(),
        living_m_coordinate_ref: LIVING_PERSONAL_M_COORDINATE_REF.to_owned(),
        identity_hash: request.personal_identity.identity_hash.clone(),
        q_identity,
        q_transit,
        q_activity,
        q_composed,
        situated_resonance,
        q_transit_source_ref: request.world_condition.q_transit_source_ref.clone(),
        q_activity_source_ref: request.activity.activity_ref.clone(),
    };

    let causal_path = vec![
        CausalEdge {
            from_ref: m1.m_coordinate_ref.clone(),
            to_ref: m2.m_coordinate_ref.clone(),
            relation: "same-event M1 current act conditions M2 harmonic/correspondential reading".to_owned(),
            event_ref: event_ref.clone(),
        },
        CausalEdge {
            from_ref: m2.m_coordinate_ref.clone(),
            to_ref: m3.m_coordinate_ref.clone(),
            relation: "same-event M2 world-condition is received by M3 72→64 inscription".to_owned(),
            event_ref: event_ref.clone(),
        },
        CausalEdge {
            from_ref: LIVING_PERSONAL_M_COORDINATE_REF.to_owned(),
            to_ref: m1.m_coordinate_ref.clone(),
            relation: "situated Nara/paśu co-reference binds the current Cosmic event to the existing Personal subject".to_owned(),
            event_ref: event_ref.clone(),
        },
    ];

    let mut readiness = vec![
        "M1:current-parent-implemented".to_owned(),
        format!("M2:{}", m2_claim_class),
        format!("M3:{:?}", m3.status).to_lowercase(),
        "Personal:#4.4.4.4-quaternion-composition-implemented".to_owned(),
        "Map:QL-MEF-PRE-D-source-ground-accepted".to_owned(),
        "deep:M1/M2/M3-descriptors-only-not-complete".to_owned(),
    ];
    if !request.world_condition.observation_class.can_claim_live_now() {
        readiness.push("current-world:degraded-no-live-now-claim".to_owned());
    }

    let event = CurrentSituatedMatheme {
        schema: CURRENT_SITUATED_MATHEME_SCHEMA.to_owned(),
        event_ref: event_ref.clone(),
        native_owner: "epi".to_owned(),
        event_at_unix_ms: request.event_at_unix_ms,
        day_now: "DAY/NOW".to_owned(),
        ql_address: snapshot.ql.ql_address.clone(),
        profile_ref: profile_ref.clone(),
        world_observation: request.world_condition.clone(),
        personal,
        m1: m1.clone(),
        m2: m2.clone(),
        m3: m3.clone(),
        causal_path,
        source_revisions: json!({
            "epiRuntime": EPI_SOURCE_REVISION,
            "qlMapProvider": QL_MAP_PROVIDER_REVISION,
            "qlMapSourceRevision": QL_MAP_SOURCE_REVISION,
            "qlMapDatasetTree": QL_MAP_DATASET_TREE,
            "worldProvider": request.world_condition.provider_revision,
        }),
        readiness,
    };

    let deep_surfaces = vec![
        deep_relation(&event_ref, &m1, "epi.deep.m1"),
        deep_relation(&event_ref, &m2, "epi.deep.m2"),
        deep_relation(&event_ref, &m3, "epi.deep.m3"),
    ];
    let cosmic = CosmicParentSurface {
        schema: COSMIC_PARENT_SCHEMA.to_owned(),
        product_id: COSMIC_PRODUCT_ID.to_owned(),
        surface_ref: format!("epi:surface:cosmic.123:{event_ref}"),
        native_owner: "epi".to_owned(),
        event_ref: event_ref.clone(),
        subject_ref: nara.identity_ref.clone(),
        profile_ref,
        day_now: "DAY/NOW".to_owned(),
        m1,
        m2,
        m3,
        personal_binding_ref: format!(
            "epi:binding:{}:{}:{}",
            COSMIC_PRODUCT_ID, PERSONAL_PRODUCT_ID, event_ref
        ),
        available_actions: vec![
            CURRENT_SITUATED_ACTION_REF.to_owned(),
            COSMIC_CURRENT_ACTION_REF.to_owned(),
            COSMIC_OPEN_DEPTH_ACTION_REF.to_owned(),
        ],
        deep_surfaces,
        presentation_contract: "one parent-scale Cosmic world over one Epi event; O:I may compose/present this contribution but must not compute M/astrology/QL semantics".to_owned(),
        provenance: json!({
            "eventOwner": "EpiLogos/Epi-Logos-C-Experiments",
            "mapAuthority": format!("EpiLogos/QL-MEF@{}", QL_MAP_PROVIDER_REVISION),
            "productAuthority": "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md + EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md",
            "personalLaw": "same eventRef + subjectRef + episodeRef + #4.4.4.4 + qIdentity/qTransit/qActivity/Qcomposed; profileRef equality alone is insufficient",
            "stateLayers": ["Epi semantic state", "workbench context", "presentation state"],
            "deepCompletionClaimed": false,
        }),
    };

    Ok(CurrentSituatedResponse { event, cosmic })
}

fn deep_relation(
    event_ref: &str,
    contribution: &ParentMContribution,
    product_id: &str,
) -> DeepSurfaceRelation {
    DeepSurfaceRelation {
        event_ref: event_ref.to_owned(),
        m_coordinate_ref: contribution.m_coordinate_ref.clone(),
        product_id: product_id.to_owned(),
        surface_ref: format!("epi:surface:{product_id}:{event_ref}"),
        open_action_ref: COSMIC_OPEN_DEPTH_ACTION_REF.to_owned(),
        boundary_ground_ref: format!(
            "{}:{}",
            contribution.m_coordinate_ref, contribution.boundary_ground.position
        ),
        boundary_return_ref: format!(
            "{}:{}",
            contribution.m_coordinate_ref, contribution.boundary_return.position
        ),
        completion_claimed: false,
        readiness: PrimitiveStatus::Partial,
    }
}

fn event_ref(
    event_at_unix_ms: u64,
    world_observation_ref: &str,
    episode_ref: &str,
    identity_hash: &str,
    tick: u64,
) -> String {
    format!(
        "epi:event:current-situated:v1:{event_at_unix_ms}:{tick}:{}:{}:{}",
        stable_ref_component(world_observation_ref),
        stable_ref_component(episode_ref),
        &identity_hash[..identity_hash.len().min(16)]
    )
}

fn stable_ref_component(value: &str) -> String {
    value
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '-' })
        .collect::<String>()
        .trim_matches('-')
        .to_owned()
}

fn required(value: &str, field: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{snapshot, NaraProtectedContext};
    use portal_core::{ElementalBalance, ProfilePrivacyClass};

    const NOW: u64 = 1_725_000_000_000;

    fn nara_context() -> NaraProtectedContext {
        NaraProtectedContext {
            identity_ref: "epi:subject:test-person".to_owned(),
            personal_field_ref: Some("epi:personal:test".to_owned()),
            day_id: "2024-08-29".to_owned(),
            now_path: "/Self/anu/NOW".to_owned(),
            session_key: "session:test".to_owned(),
            episode_ref: Some("epi:episode:test-day".to_owned()),
            privacy_class: "protected-local".to_owned(),
            source_class: "human-authored".to_owned(),
            source_ref: None,
        }
    }

    fn identity() -> PersonalIdentityProfile {
        PersonalIdentityProfile {
            q_personal: [1.0, 0.0, 0.0, 0.0],
            natal_chart_handle: "protected:natal:test".to_owned(),
            elemental_balance: ElementalBalance {
                earth: 0.25,
                fire: 0.25,
                water: 0.25,
                air: 0.25,
            },
            identity_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_owned(),
            privacy_class: ProfilePrivacyClass::ProtectedLocalDerived,
        }
    }

    fn world(class: WorldObservationClass) -> WorldConditionObservation {
        WorldConditionObservation {
            observation_ref: "provider:sky:test-observation".to_owned(),
            observation_class: class,
            provider_ref: "provider:test-sky".to_owned(),
            provider_revision: "provider-rev-1".to_owned(),
            observed_at_unix_ms: NOW,
            observer_ref: "observer:earth:test".to_owned(),
            q_transit: [0.0, 1.0, 0.0, 0.0],
            q_transit_source_ref: "epi:derivation:q-transit:test".to_owned(),
            solar: Some(CelestialBodyObservation {
                body: "Sun".to_owned(),
                longitude_degrees: 156.25,
                retrograde: false,
                sign: Some("Virgo".to_owned()),
                decan: Some(15),
                source_ref: Some("provider:sky:sun".to_owned()),
            }),
            planets: vec![CelestialBodyObservation {
                body: "Moon".to_owned(),
                longitude_degrees: 90.0,
                retrograde: false,
                sign: Some("Cancer".to_owned()),
                decan: Some(9),
                source_ref: Some("provider:sky:moon".to_owned()),
            }],
            correspondence_refs: vec!["epi:correspondence:test".to_owned()],
        }
    }

    fn request(class: WorldObservationClass) -> CurrentSituatedRequest {
        CurrentSituatedRequest {
            event_at_unix_ms: NOW,
            personal_identity: identity(),
            activity: SituatedActivityEvidence {
                activity_ref: "epi:activity:test-day".to_owned(),
                q_activity: [0.0, 0.0, 1.0, 0.0],
                observed_at_unix_ms: NOW,
                source_class: "protected-nara-activity".to_owned(),
            },
            world_condition: world(class),
        }
    }

    #[test]
    fn one_event_binds_m1_m2_m3_and_the_existing_personal_subject() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request(WorldObservationClass::LiveProvider)).unwrap();

        assert_eq!(response.event.event_ref, response.cosmic.event_ref);
        assert_eq!(response.event.personal.event_ref, response.event.event_ref);
        assert_eq!(response.event.m1.event_ref, response.event.event_ref);
        assert_eq!(response.event.m2.event_ref, response.event.event_ref);
        assert_eq!(response.event.m3.event_ref, response.event.event_ref);
        assert_eq!(response.event.personal.living_source_coordinate, "#4.4.4.4");
        assert_eq!(response.cosmic.product_id, "epi.cosmic.123");
        assert_eq!(response.cosmic.deep_surfaces.len(), 3);
        assert!(response
            .cosmic
            .deep_surfaces
            .iter()
            .all(|surface| !surface.completion_claimed));
    }

    #[test]
    fn map_lineage_uses_the_accepted_pre_d_coordinate_grammar() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request(WorldObservationClass::LiveProvider)).unwrap();
        assert_eq!(response.event.m1.m_coordinate_ref, "ql:m-coordinate:pratibimba:M1");
        assert_eq!(response.event.m2.m_coordinate_ref, "ql:m-coordinate:pratibimba:M2");
        assert_eq!(response.event.m3.m_coordinate_ref, "ql:m-coordinate:pratibimba:M3");
        assert_eq!(response.event.m1.lineage.ql_map_provider_revision, QL_MAP_PROVIDER_REVISION);
    }

    #[test]
    fn personal_quaternion_is_operatively_composed_from_identity_transit_and_activity() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let req = request(WorldObservationClass::LiveProvider);
        let expected = compose_personal_quaternion(
            req.personal_identity.q_personal,
            req.world_condition.q_transit,
            req.activity.q_activity,
        );
        let response = current_situated(&snapshot, req).unwrap();
        assert_eq!(response.event.personal.q_composed, expected);
        assert_eq!(response.event.personal.q_identity, [1.0, 0.0, 0.0, 0.0]);
        assert_eq!(response.event.personal.q_transit, [0.0, 1.0, 0.0, 0.0]);
        assert_eq!(response.event.personal.q_activity, [0.0, 0.0, 1.0, 0.0]);
    }

    #[test]
    fn fixture_world_state_is_explicitly_degraded_and_cannot_claim_live_now() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request(WorldObservationClass::Fixture)).unwrap();
        assert_eq!(response.event.m2.status, PrimitiveStatus::Degraded);
        assert_eq!(response.event.m2.claim_class, "non-live-provider-degraded");
        assert!(response
            .event
            .readiness
            .iter()
            .any(|item| item == "current-world:degraded-no-live-now-claim"));
    }

    #[test]
    fn live_provider_requires_real_planetary_observation_body() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let mut req = request(WorldObservationClass::LiveProvider);
        req.world_condition.planets.clear();
        let error = current_situated(&snapshot, req).unwrap_err();
        assert!(error.contains("empty/default state cannot claim live-now"));
    }

    #[test]
    fn d_refuses_to_mint_a_second_personal_event() {
        let snapshot = snapshot(NOW, 0, None, None).unwrap();
        let error = current_situated(&snapshot, request(WorldObservationClass::LiveProvider)).unwrap_err();
        assert!(error.contains("does not mint a Personal subject"));
    }

    #[test]
    fn m3_carries_the_same_world_observation_ref_as_m2() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request(WorldObservationClass::LiveProvider)).unwrap();
        assert_eq!(
            response.event.m2.data["worldObservationRef"],
            response.event.m3.data["worldObservationRef"]
        );
    }
}