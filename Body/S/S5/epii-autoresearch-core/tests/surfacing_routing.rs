use std::collections::BTreeMap;

use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
use epi_s5_epii_autoresearch_core::{
    ArtifactRef, ClosureKind, ContentTypeRegister, ImprovementCandidate, ImprovementStore,
    ProposeRequest, RouteStatus, SensitivityClass, SurfaceActor, SurfacingPipelineId,
    TargetSubsystem,
};
use epi_s5_epii_review_core::{
    ReviewInboxFilter, ReviewPriority, ReviewSource, ReviewStatus, ReviewStore, ReviewSubmission,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::json;

fn vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: "4.4".to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "P4/P5".to_owned(),
        cs: CsField {
            code: "CS-disclosure".to_owned(),
            direction: CsDirection::Day,
        },
    }
}

fn inbox_entry(session_id: &str, vectors: Vec<&str>) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".to_owned(),
        source: "aletheia".to_owned(),
        session_id: session_id.to_owned(),
        day_id: "2026-06-01".to_owned(),
        final_vak: vak(),
        improvement_vectors: vectors.into_iter().map(str::to_owned).collect(),
        moirai_summary: BTreeMap::from([(
            "summary".to_owned(),
            "Aletheia disclosed a reviewable seam in the S5 surface".to_owned(),
        )]),
        artifacts: vec!["vault://Pratibimba/Epii/session-arc.md".to_owned()],
        closure_kind: "rehear".to_owned(),
        disclosure_lineage: None,
    }
}

fn explicit_candidate(
    target: TargetSubsystem,
    direction: &str,
    fingerprint: &str,
) -> ImprovementCandidate {
    let request = ProposeRequest {
        target_family: "S".to_owned(),
        target_coordinate: format!("{target:?}"),
        direction: direction.to_owned(),
        source_review_item_id: None,
        baseline: ArtifactRef {
            path: format!("vault://baseline/{fingerprint}.md"),
            coordinate: Some(format!("{target:?}")),
            kind: Some("baseline_artifact".to_owned()),
        },
    };
    let mut candidate = ImprovementCandidate::from_propose(
        request,
        target,
        match target {
            TargetSubsystem::Anuttara => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::AnuttaraShapeRefinement
            }
            TargetSubsystem::Paramasiva => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::ParamasivaRetrievalGapFilling
            }
            TargetSubsystem::Parashakti => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::ParashaktiKleinHandlingRefinement
            }
            TargetSubsystem::Mahamaya => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::MahamayaProcessRewardRefinement
            }
            TargetSubsystem::Nara => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::NaraDialogueCorpusAddition
            }
            TargetSubsystem::Epii => {
                epi_s5_epii_autoresearch_core::spine::ImprovementVectorKind::EpiiSpineMechanismRefinement {
                    spine_phase: "routing".to_owned(),
                }
            }
        },
        SurfacingPipelineId::AletheiaDisclosure,
        epi_s5_epii_autoresearch_core::spine::ObservationEvidence {
            source_uri: format!("aletheia://test/{fingerprint}"),
            summary: "real persisted route fixture observation".to_owned(),
            observed_at: Some(1_780_000_000_000),
            fingerprint: Some(fingerprint.to_owned()),
        },
        1_780_000_000_000,
        SurfaceActor::Aletheia,
        SensitivityClass::RequiresReview,
    )
    .expect("candidate should build");
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    candidate
}

#[test]
fn aletheia_jsonl_surfaces_candidate_run_route_and_linked_review_item() {
    let temp = tempfile::tempdir().expect("tempdir");
    let inbox = InboxStore::new(temp.path().join("inbox")).expect("inbox opens");
    inbox
        .append(inbox_entry(
            "session-a",
            vec!["Epii spine mechanism refinement from Aletheia disclosure"],
        ))
        .expect("jsonl append succeeds");

    let store = ImprovementStore::new(temp.path().join("autoresearch"));
    let receipts = store
        .surface_aletheia_inbox(&inbox)
        .expect("Aletheia intake surfaces candidates");

    assert_eq!(receipts.len(), 1);
    let receipt = &receipts[0];
    assert!(!receipt.suppressed_duplicate);
    assert_eq!(receipt.candidate.run_id, receipt.run.run_id);
    assert_eq!(
        receipt.candidate.candidate.closure_kind,
        ClosureKind::Rehear
    );
    assert_eq!(
        receipt.candidate.candidate.ct_register,
        ContentTypeRegister::CT4b
    );
    assert_eq!(receipt.routes.len(), 1);
    assert_eq!(receipt.routes[0].queue, "epii");
    assert_eq!(receipt.routes[0].status, RouteStatus::Open);

    let review = ReviewStore::new(temp.path().join("review"));
    let item = review
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Review surfaced Aletheia autoresearch candidate".to_owned(),
            body: "Candidate/run/route linkage is carried through coordinate_context.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({
                "candidate_id": receipt.candidate.candidate_id,
                "run_id": receipt.run.run_id,
                "route_id": receipt.routes[0].route_id,
                "originating_inbox_entry": receipt
                    .candidate
                    .candidate
                    .linkage
                    .originating_inbox_entry
            }),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("review submission persists");

    let open = review
        .inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: Some(ReviewSource::Autoresearch),
            limit: None,
        })
        .expect("review inbox reads");
    assert_eq!(open.items.len(), 1);
    assert_eq!(open.items[0].item_id, item.item_id);
    assert_eq!(
        open.items[0].coordinate_context["candidate_id"],
        receipt.candidate.candidate_id
    );

    let reopened = ImprovementStore::new(temp.path().join("autoresearch"));
    assert_eq!(reopened.history(None).expect("history").runs.len(), 1);
    assert_eq!(reopened.candidates().expect("candidates").len(), 1);
    assert_eq!(reopened.routes().expect("routes").len(), 1);
}

#[test]
fn multi_target_routing_splits_routes_without_duplicating_run_id() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let surfaced = store
        .surface_candidate(explicit_candidate(
            TargetSubsystem::Epii,
            "Epii route needs Nara and Anuttara coordination",
            "multi-target-observation",
        ))
        .expect("surface candidate");

    let routes = store
        .route_candidate(
            &surfaced.candidate.candidate_id,
            vec![
                TargetSubsystem::Nara,
                TargetSubsystem::Epii,
                TargetSubsystem::Anuttara,
            ],
        )
        .expect("routes persist");

    assert_eq!(routes.len(), 3);
    assert!(routes
        .iter()
        .all(|route| route.run_id == surfaced.run.run_id));
    let link = routes[0]
        .cross_target_link
        .as_ref()
        .expect("cross-target link");
    assert!(routes
        .iter()
        .all(|route| route.cross_target_link.as_ref() == Some(link)));
    assert_eq!(store.history(None).expect("history").runs.len(), 1);
}

#[test]
fn anuttara_first_blocks_downstream_routes_until_upstream_route_resolves() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let surfaced = store
        .surface_candidate(explicit_candidate(
            TargetSubsystem::Anuttara,
            "Anuttara law change has downstream Epii effect",
            "anuttara-first",
        ))
        .expect("surface candidate");

    let routes = store
        .route_candidate(
            &surfaced.candidate.candidate_id,
            vec![TargetSubsystem::Epii, TargetSubsystem::Anuttara],
        )
        .expect("routes persist");

    let anuttara = routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Anuttara)
        .expect("anuttara route");
    let epii = routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Epii)
        .expect("epii route");

    assert_eq!(anuttara.status, RouteStatus::Open);
    assert_eq!(epii.status, RouteStatus::Blocked);
    assert_eq!(
        epii.blocked_by_route_id.as_deref(),
        Some(anuttara.route_id.as_str())
    );
}

#[test]
fn aletheia_suppression_replays_same_fingerprint_but_accepts_material_change() {
    let temp = tempfile::tempdir().expect("tempdir");
    let inbox = InboxStore::new(temp.path().join("inbox")).expect("inbox opens");
    inbox
        .append(inbox_entry(
            "session-suppression",
            vec!["Epii voice canon refinement"],
        ))
        .expect("jsonl append succeeds");

    let store = ImprovementStore::new(temp.path().join("autoresearch"));
    let first = store
        .surface_aletheia_inbox(&inbox)
        .expect("first intake succeeds");
    let second = store
        .surface_aletheia_inbox(&inbox)
        .expect("second intake suppresses duplicate");

    assert_eq!(first.len(), 1);
    assert_eq!(second.len(), 1);
    assert!(second[0].suppressed_duplicate);
    assert_eq!(store.candidates().expect("candidates").len(), 1);
    assert_eq!(store.history(None).expect("history").runs.len(), 1);

    inbox
        .append(inbox_entry(
            "session-suppression",
            vec!["Epii pedagogy register update after changed observation"],
        ))
        .expect("second jsonl append succeeds");
    store
        .surface_aletheia_inbox(&inbox)
        .expect("materially changed intake succeeds");

    assert_eq!(store.candidates().expect("candidates").len(), 2);
    assert_eq!(store.history(None).expect("history").runs.len(), 2);
}
