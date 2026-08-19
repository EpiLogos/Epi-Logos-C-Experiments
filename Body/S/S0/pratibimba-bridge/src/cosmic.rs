use crate::{EpiPrimitiveSnapshot, PrimitiveStatus, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub const COSMIC_SCHEMA: &str = "epi.cosmic-current/v1";
pub const COSMIC_PROVIDER_CONTRACT: &str = "epi.cosmic-current-provider/v1";
pub const COSMIC_CONTRIBUTION_REF: &str = "epi.pratibimba.cosmic";
pub const COSMIC_OPEN_DEPTH_ACTION_REF: &str = "epi.action.cosmic.open-depth";
pub const COSMIC_OPEN_DEPTH_CAPABILITY_REF: &str = "epi.capability.cosmic.current-state";

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicAspect {
    pub aspect_ref: String,
    pub coordinate: String,
    pub name: String,
    pub native_owner: String,
    pub status: PrimitiveStatus,
    pub claim_class: String,
    pub operator_refs: Vec<String>,
    pub semantic_sources: Vec<String>,
    pub implementation_sources: Vec<String>,
    pub data: Value,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicReadiness {
    pub capability_ref: String,
    pub status: PrimitiveStatus,
    pub claim_class: String,
    pub detail: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeepWorkspaceEntry {
    pub position: u8,
    pub name: String,
    pub coordinate: String,
    pub workspace_ref: String,
    pub bimba_ref: String,
    pub status: PrimitiveStatus,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicCurrent {
    pub schema: String,
    pub provider_contract: String,
    pub contribution_ref: String,
    pub native_owner: String,
    pub cosmic_ref: String,
    pub profile_ref: String,
    pub coordinate_ref: String,
    pub ql_address: String,
    pub lens_ref: String,
    pub sublens_ref: String,
    pub context_frame: Option<String>,
    pub observed_at_unix_ms: u64,
    pub day_id: Option<String>,
    pub now_path: Option<String>,
    pub current: Value,
    pub movement: CosmicAspect,
    pub resonance: CosmicAspect,
    pub symbolic: CosmicAspect,
    pub readiness: Vec<CosmicReadiness>,
    pub deep_workspaces: Vec<DeepWorkspaceEntry>,
    pub provenance: Value,
}

pub fn current(snapshot: &EpiPrimitiveSnapshot) -> Result<CosmicCurrent, String> {
    let profile = &snapshot.kernel.harmonic_profile;
    let profile_ref = profile_ref(snapshot);
    let cosmic_ref = format!(
        "epi:cosmic:current:{}:{}",
        snapshot.source_revision, profile.tick
    );

    let movement = CosmicAspect {
        aspect_ref: format!("{cosmic_ref}:m1"),
        coordinate: "M1'".to_owned(),
        name: "Paramasiva".to_owned(),
        native_owner: "epi".to_owned(),
        status: PrimitiveStatus::Implemented,
        claim_class: "implemented-derived".to_owned(),
        operator_refs: vec![
            "epi-lib::kernel_tick_from_epogdoon".to_owned(),
            "portal-core::kernel_tick_from_epogdoon".to_owned(),
            "portal-core::MathemeHarmonicProfile::from_tick".to_owned(),
            format!("ql-core:{}::QlAddress::sixfold", snapshot.ql.ql_kernel_version),
        ],
        semantic_sources: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/nodes_paramasiva.json".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/relations_paramasiva.json".to_owned(),
        ],
        implementation_sources: vec![
            "Body/S/S0/epi-lib/src/kernel.c".to_owned(),
            "Body/S/S0/portal-core/src/kernel.rs".to_owned(),
            "Body/S/S0/portal-core/src/aspect.rs".to_owned(),
        ],
        data: json!({
            "tickAddress": &profile.tick_address,
            "position6": profile.position6,
            "helix": &profile.helix,
            "phase": profile.phase,
            "ratioRole": &profile.ratio_role,
            "degree720": profile.degree720,
            "degree360": profile.degree360,
            "chromatic": &profile.chromatic,
            "diatonic": &profile.diatonic,
            "contextFrames": &profile.context_frames,
            "qCosmic": profile.q_cosmic,
        }),
    };

    let resonance = CosmicAspect {
        aspect_ref: format!("{cosmic_ref}:m2"),
        coordinate: "M2'".to_owned(),
        name: "Parashakti".to_owned(),
        native_owner: "epi".to_owned(),
        status: PrimitiveStatus::Implemented,
        claim_class: "implemented-derived".to_owned(),
        operator_refs: vec![
            "portal-core::parashakti::vimarsha_read_profile".to_owned(),
            "portal-core::MathemeResonance72Projection::from_tick".to_owned(),
            "portal-core::MathemeLensMode::new".to_owned(),
        ],
        semantic_sources: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/nodes_parashakti.json".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/relations_parashakti.json".to_owned(),
        ],
        implementation_sources: vec![
            "Body/S/S0/portal-core/src/kernel.rs".to_owned(),
            "Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs".to_owned(),
        ],
        data: json!({
            "lensMode": &profile.lens_mode,
            "resonance72": &profile.resonance72,
            "audioOctet": profile.audio_octet,
            "nodalQuartet": &profile.nodal_quartet,
            "elements": &profile.elements,
            "planetaryChakral": &profile.planetary_chakral,
            "personalResonance": profile.resonance,
            "conjugateFormCharacter": profile.conjugate_form_character,
            "privacyClass": profile.privacy_class,
        }),
    };

    let symbolic = CosmicAspect {
        aspect_ref: format!("{cosmic_ref}:m3"),
        coordinate: "M3'".to_owned(),
        name: "Mahamaya".to_owned(),
        native_owner: "epi".to_owned(),
        status: snapshot.mahamaya.status,
        claim_class: "implemented-partial".to_owned(),
        operator_refs: vec![
            "portal-core::MathemeBinaryProjection::from_clock".to_owned(),
            "portal-core::codon_rotation_from_lens_mode".to_owned(),
        ],
        semantic_sources: vec![
            "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/nodes_mahamaya.json".to_owned(),
            "Idea/Bimba/Map/datasets/low-detail/relations_mahamaya.json".to_owned(),
            "Idea/Bimba/Map/datasets/mahamaya-deep/rotational_state_protocol.txt".to_owned(),
        ],
        implementation_sources: vec![
            "Body/S/S0/portal-core/src/kernel.rs".to_owned(),
            "Body/S/S0/portal-core/src/mahamaya.rs".to_owned(),
            "Body/S/S0/portal-core/src/codon.rs".to_owned(),
            "Body/S/S0/portal-core/src/hexagram.rs".to_owned(),
            "Body/S/S0/portal-core/src/transcription.rs".to_owned(),
        ],
        data: json!({
            "mahamaya": &profile.mahamaya,
            "codonRotationProjection": &profile.codon_rotation_projection,
            "primitive": &snapshot.mahamaya,
            "vak": {
                "status": snapshot.vak.current_state.status,
                "value": &snapshot.vak.value,
            },
        }),
    };

    Ok(CosmicCurrent {
        schema: COSMIC_SCHEMA.to_owned(),
        provider_contract: COSMIC_PROVIDER_CONTRACT.to_owned(),
        contribution_ref: COSMIC_CONTRIBUTION_REF.to_owned(),
        native_owner: "epi".to_owned(),
        cosmic_ref,
        profile_ref,
        coordinate_ref: snapshot.current_address.canonical_ref.clone(),
        ql_address: snapshot.ql.ql_address.clone(),
        lens_ref: snapshot.ql.lens_ref.clone(),
        sublens_ref: snapshot.ql.sublens_ref.clone(),
        context_frame: snapshot.ql.context_frame.clone(),
        observed_at_unix_ms: snapshot.provenance.observed_at_unix_ms,
        day_id: snapshot.time.day_id.clone(),
        now_path: snapshot.time.now_path.clone(),
        current: json!({
            "tick": profile.tick,
            "tick12": profile.tick12,
            "cycle": profile.cycle,
            "position6": profile.position6,
            "helix": &profile.helix,
            "ratioRole": &profile.ratio_role,
            "profileSchemaVersion": profile.profile_schema_version,
            "profileProvenance": &profile.profile_provenance,
        }),
        movement,
        resonance,
        symbolic,
        readiness: readiness(snapshot),
        deep_workspaces: deep_workspaces(),
        provenance: json!({
            "sourceRevision": EPI_SOURCE_REVISION,
            "qlProviderRevision": QL_PROVIDER_REVISION,
            "profileOwner": profile.profile_provenance.owner,
            "profileContract": profile.profile_provenance.contract,
            "sourceComputation": [
                "epi-lib::kernel_tick_from_epogdoon",
                "portal-core::kernel_tick_from_epogdoon parity witness",
                "portal-core::MathemeHarmonicProfile::from_tick",
                "epi-pratibimba-bridge::cosmic::current"
            ],
            "qlUse": {
                "accepted": [
                    format!("ql-core:{}::QlAddress::sixfold", snapshot.ql.ql_kernel_version),
                    format!("ql-mef:{}::LensRef/SublensRef", snapshot.ql.mef_registry_version)
                ],
                "providerRevision": snapshot.ql.provider_revision,
                "notPromoted": [
                    "pairing/rotation/context-field claims outside the pinned accepted provider",
                    "retained musical/cymatic derivation as a whole"
                ]
            },
            "identityLaw": "Cosmic and Nara derive profileRef from the same Epi snapshot sourceRevision + MathemeHarmonicProfile.tick; no second Cosmic state store exists."
        }),
    })
}

pub fn profile_ref(snapshot: &EpiPrimitiveSnapshot) -> String {
    format!(
        "epi:matheme-harmonic-profile:{}:{}",
        snapshot.source_revision, snapshot.kernel.harmonic_profile.tick
    )
}

fn readiness(snapshot: &EpiPrimitiveSnapshot) -> Vec<CosmicReadiness> {
    vec![
        CosmicReadiness {
            capability_ref: "epi.cosmic.m1.current-movement".to_owned(),
            status: PrimitiveStatus::Implemented,
            claim_class: "implemented".to_owned(),
            detail: "kernel tick, chromatic/diatonic movement and qCosmic are live from the shared profile".to_owned(),
        },
        CosmicReadiness {
            capability_ref: "epi.cosmic.m2.current-resonance".to_owned(),
            status: PrimitiveStatus::Implemented,
            claim_class: "implemented".to_owned(),
            detail: "72-field, lens mode, Vimarsha-derived numerical octet/nodes and correspondential projections are live".to_owned(),
        },
        CosmicReadiness {
            capability_ref: "epi.cosmic.m2.audio-cymatic-actuation".to_owned(),
            status: PrimitiveStatus::Research,
            claim_class: "research-provider-unbound".to_owned(),
            detail: "numerical readiness exists; this tranche does not claim a live Vimarsha audio or cymatic material provider".to_owned(),
        },
        CosmicReadiness {
            capability_ref: "epi.cosmic.m3.symbolic-transcription".to_owned(),
            status: snapshot.mahamaya.status,
            claim_class: "implemented-partial".to_owned(),
            detail: format!(
                "codon/hexagram address and rotation are live; transcription={}, datasetLut={}",
                snapshot.mahamaya.transcription_state, snapshot.mahamaya.dataset_lut_state
            ),
        },
        CosmicReadiness {
            capability_ref: "epi.cosmic.day-now".to_owned(),
            status: snapshot.time.day_now.status,
            claim_class: "provider-state".to_owned(),
            detail: snapshot.time.day_now.detail.clone(),
        },
        CosmicReadiness {
            capability_ref: "epi.cosmic.ql-formal-binding".to_owned(),
            status: snapshot.ql.status,
            claim_class: "accepted-pinned-provider-only".to_owned(),
            detail: format!(
                "QL address and MEF lens/sublens refs use pinned provider {}; open pairing/rotation/CF promotion work is not claimed canonical here",
                snapshot.ql.provider_revision
            ),
        },
    ]
}

fn deep_workspaces() -> Vec<DeepWorkspaceEntry> {
    [
        (0, "Anuttara", "M0'"),
        (1, "Paramasiva", "M1'"),
        (2, "Parashakti", "M2'"),
        (3, "Mahamaya", "M3'"),
        (4, "Nara", "M4'"),
        (5, "Epii", "M5'"),
    ]
    .into_iter()
    .map(|(position, name, coordinate)| DeepWorkspaceEntry {
        position,
        name: name.to_owned(),
        coordinate: coordinate.to_owned(),
        workspace_ref: format!("epi:bimba:#-{position}/M{position}'"),
        bimba_ref: format!("#-{position}"),
        status: PrimitiveStatus::Partial,
    })
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::snapshot;

    #[test]
    fn current_cosmic_composes_one_existing_profile_without_new_state() {
        let snapshot = snapshot(1_725_000_000_000, 7, None, None).unwrap();
        let reading = current(&snapshot).unwrap();

        assert_eq!(reading.schema, COSMIC_SCHEMA);
        assert_eq!(reading.profile_ref, profile_ref(&snapshot));
        assert_eq!(reading.coordinate_ref, snapshot.current_address.canonical_ref);
        assert_eq!(reading.movement.coordinate, "M1'");
        assert_eq!(reading.resonance.coordinate, "M2'");
        assert_eq!(reading.symbolic.coordinate, "M3'");
        assert_eq!(reading.deep_workspaces.len(), 6);
        assert_eq!(reading.deep_workspaces[4].workspace_ref, "epi:bimba:#-4/M4'");
    }

    #[test]
    fn recomputing_same_observation_preserves_cosmic_and_profile_identity() {
        let first = snapshot(1_725_000_000_000, 1, None, None).unwrap();
        let second = snapshot(1_725_000_000_000, 999, None, None).unwrap();
        let first = current(&first).unwrap();
        let second = current(&second).unwrap();

        assert_eq!(first.cosmic_ref, second.cosmic_ref);
        assert_eq!(first.profile_ref, second.profile_ref);
        assert_eq!(first.current, second.current);
    }

    #[test]
    fn unavailable_material_audio_is_not_misreported_as_live() {
        let snapshot = snapshot(1_725_000_000_000, 0, None, None).unwrap();
        let reading = current(&snapshot).unwrap();
        let audio = reading
            .readiness
            .iter()
            .find(|item| item.capability_ref == "epi.cosmic.m2.audio-cymatic-actuation")
            .unwrap();
        assert_eq!(audio.status, PrimitiveStatus::Research);
    }
}
