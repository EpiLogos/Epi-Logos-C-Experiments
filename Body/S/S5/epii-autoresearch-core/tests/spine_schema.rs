use epi_s5_epii_autoresearch_core::spine::{
    ClosureKind, ContentTypeRegister, ImprovementCandidate, ImprovementVectorKind,
    ObservationEvidence, PromotionDestination, SensitivityClass, SurfaceActor, SurfacingPipelineId,
    TargetSubsystem, SPINE_SCHEMA_VERSION,
};
use epi_s5_epii_autoresearch_core::{ArtifactRef, ImprovementStore, ProposeRequest};

const IMPROVEMENT_FIXTURE: &str =
    include_str!("../../fixtures/track-04-t0/s5-improvement-state.json");

#[test]
fn typed_candidate_round_trips_without_replacing_propose_request() {
    let candidate = sample_candidate().expect("candidate");
    let encoded = serde_json::to_string_pretty(&candidate).expect("serialize candidate");
    let decoded: ImprovementCandidate =
        serde_json::from_str(&encoded).expect("deserialize candidate");

    assert_eq!(decoded.schema_version, SPINE_SCHEMA_VERSION);
    assert_eq!(decoded.propose.direction, "tighten Epii review spine");
    assert_eq!(decoded.target_subsystem, TargetSubsystem::Epii);
    assert_eq!(
        decoded.vector_kind.target_subsystem(),
        TargetSubsystem::Epii
    );
    assert_eq!(decoded.closure_kind, ClosureKind::LegacyUnspecified);
    assert_eq!(decoded.ct_register, ContentTypeRegister::LegacyUnspecified);
    decoded.validate().expect("round-trip candidate validates");
}

#[test]
fn closed_enums_reject_unknown_closure_kind() {
    let err = serde_json::from_str::<ClosureKind>("\"invented\"")
        .expect_err("unknown closure kind must reject");
    assert!(
        err.to_string().contains("unknown variant"),
        "serde should reject unknown variants: {err}"
    );
    assert!(ClosureKind::from_inbox_wire("force_closed").is_ok());
    assert!(ClosureKind::from_inbox_wire("surprise").is_err());
}

#[test]
fn validation_rejects_blank_direction_missing_observation_and_wrong_target() {
    let mut candidate = sample_candidate().expect("candidate");
    candidate.propose.direction = " ".to_owned();
    assert!(candidate
        .validate()
        .expect_err("blank direction should fail")
        .contains("direction"));

    let mut candidate = sample_candidate().expect("candidate");
    candidate.observation_evidence.source_uri.clear();
    assert!(candidate
        .validate()
        .expect_err("missing source uri should fail")
        .contains("source_uri"));

    let mut candidate = sample_candidate().expect("candidate");
    candidate.target_subsystem = TargetSubsystem::Nara;
    assert!(candidate
        .validate()
        .expect_err("wrong target should fail")
        .contains("vector kind targets"));
}

#[test]
fn promotion_destination_round_trips_and_rejects_malformed_values() {
    let destination = PromotionDestination::ParashaktiLensLoRADeployment {
        lens_id: 5,
        version: "lens-lora-v1".to_owned(),
    };
    let encoded = serde_json::to_string(&destination).expect("serialize destination");
    let decoded: PromotionDestination =
        serde_json::from_str(&encoded).expect("deserialize destination");
    decoded.validate().expect("valid destination");

    let invalid = PromotionDestination::ParashaktiLensLoRADeployment {
        lens_id: 0,
        version: "lens-lora-v1".to_owned(),
    };
    assert!(invalid
        .validate()
        .expect_err("invalid lens id should fail")
        .contains("lens_id"));

    let invalid = PromotionDestination::SpacedRetrievalReindexing {
        affected_namespaces: vec![],
    };
    assert!(invalid
        .validate()
        .expect_err("empty namespace list should fail")
        .contains("affected_namespaces"));
}

#[test]
fn tranche_04_t0_fixture_survives_typed_schema_migration_boundary() {
    let root = temp_store_root("spine-schema-migration");
    std::fs::write(root.join("s5-improvement-state.json"), IMPROVEMENT_FIXTURE)
        .expect("write fixture");
    let store = ImprovementStore::new(&root);
    let history = store.history(None).expect("legacy fixture history loads");
    assert_eq!(history.runs.len(), 2);

    let legacy_run = history
        .runs
        .iter()
        .find(|run| run.run_id == "track-04-t0-improvement-kept")
        .expect("legacy kept run");
    assert_eq!(legacy_run.closure_kind, ClosureKind::LegacyUnspecified);
    assert_eq!(
        legacy_run.ct_register,
        ContentTypeRegister::LegacyUnspecified
    );
    assert!(
        legacy_run.typed_candidate.is_none(),
        "legacy fixture must not silently invent typed candidate details"
    );
    let candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: legacy_run.target_family.clone(),
            target_coordinate: legacy_run.target_coordinate.clone(),
            direction: legacy_run.direction.clone(),
            source_review_item_id: legacy_run.source_review_item_id.clone(),
            baseline: legacy_run.baseline.clone(),
        },
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "typed_schema".to_owned(),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: "Body/S/S5/fixtures/track-04-t0/s5-improvement-state.json".to_owned(),
            summary: "Legacy fixture projected into typed candidate boundary.".to_owned(),
            observed_at: Some(legacy_run.updated_at),
            fingerprint: Some(legacy_run.run_id.clone()),
        },
        legacy_run.updated_at,
        SurfaceActor::Epii,
        SensitivityClass::PublicCurrent,
    )
    .expect("legacy run should project into typed boundary");

    assert_eq!(candidate.closure_kind, ClosureKind::LegacyUnspecified);
    assert_eq!(
        candidate.ct_register,
        ContentTypeRegister::LegacyUnspecified
    );

    store
        .propose(candidate.propose.clone())
        .expect("existing ProposeRequest caller still persists after typed projection");
    let after = store
        .history(None)
        .expect("history after persisted proposal");
    assert_eq!(after.runs.len(), 3);
    let persisted_new_run = after
        .runs
        .iter()
        .find(|run| run.direction == "preserve review-gated autoresearch baseline behavior")
        .expect("new persisted run");
    assert_eq!(
        persisted_new_run.closure_kind,
        ClosureKind::LegacyUnspecified
    );
    assert_eq!(
        persisted_new_run.ct_register,
        ContentTypeRegister::LegacyUnspecified
    );
    let typed = persisted_new_run
        .typed_candidate
        .as_ref()
        .expect("new ProposeRequest persistence should carry typed candidate envelope");
    assert_eq!(typed.schema_version, SPINE_SCHEMA_VERSION);
    assert_eq!(typed.target_subsystem, TargetSubsystem::Epii);
    assert_eq!(
        typed.linkage.originating_review_item.as_deref(),
        legacy_run.source_review_item_id.as_deref()
    );
    assert_eq!(
        typed.challenger_artifact.as_ref().unwrap().path,
        persisted_new_run.challenger.path
    );
}

fn sample_candidate() -> Result<ImprovementCandidate, String> {
    ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "tighten Epii review spine".to_owned(),
            source_review_item_id: Some("review-123".to_owned()),
            baseline: ArtifactRef {
                path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
                coordinate: Some("S5/S5'".to_owned()),
                kind: Some("seed_spec".to_owned()),
            },
        },
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "review".to_owned(),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: "s5'.review.history#/patterns".to_owned(),
            summary: "Review latency grew without proposal complexity growth.".to_owned(),
            observed_at: Some(1760000000000),
            fingerprint: Some("review-latency-pattern".to_owned()),
        },
        1760000001000,
        SurfaceActor::Epii,
        SensitivityClass::PublicCurrent,
    )
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s5-spine-schema-{test_name}-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
