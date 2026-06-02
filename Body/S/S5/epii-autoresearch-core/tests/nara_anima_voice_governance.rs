use epi_s5_epii_autoresearch_core::capacity_workflows::{
    run_nara_anima_voice_governance, NaraExchangeRecord, NaraGateKind, NaraVoiceGovernanceRequest,
};
use epi_s5_epii_autoresearch_core::ImprovementStore;
use epi_s5_epii_review_core::{ReviewInboxFilter, ReviewStore};
use std::path::PathBuf;

#[test]
fn nara_anima_workflow_admits_only_consented_pii_stripped_records_and_five_gates() {
    let root = temp_root("nara-anima-workflow");
    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));
    let canonical_artifact_path = root.join("Pratibimba/Nara/2026-06-02/dialogic-exchanges.jsonl");
    std::fs::create_dir_all(canonical_artifact_path.parent().unwrap()).expect("artifact parent");

    let receipt = run_nara_anima_voice_governance(
        &autoresearch,
        &review,
        NaraVoiceGovernanceRequest {
            canonical_artifact_path: canonical_artifact_path.clone(),
            adapter_version: "nara-qlora-2026-w23".to_owned(),
            parser_model_path: "pi://inference/nara-parser/v1".to_owned(),
            dialogue_adapter_path: "qlora://nara/dialogue-adapter/v23".to_owned(),
            rollback_handle: "rollback://nara/dialogue-adapter/v22".to_owned(),
            dpo_preference_pairs: 640,
            exchanges: vec![
                NaraExchangeRecord {
                    exchange_handle: "nara://exchange/consented-pii-stripped".to_owned(),
                    consent_handle: Some("consent://nara/voice-corpus/001".to_owned()),
                    consented: true,
                    pressure_free: true,
                    inspectable: true,
                    revoked: false,
                    pii_stripped_body:
                        "PII_STRIPPED: journal accompaniment with anima-vak transition".to_owned(),
                    raw_body: Some(
                        "raw journal dream oracle dialogue body Alice 555-0101 must not leak"
                            .to_owned(),
                    ),
                    sample_count: 2_500,
                    quality_score: 0.91,
                    quality_threshold: 0.82,
                    drift_kind: Some("dialogic-register-drift".to_owned()),
                    new_register: None,
                    systematic_feedback_count: 6,
                },
                NaraExchangeRecord {
                    exchange_handle: "nara://exchange/not-consented".to_owned(),
                    consent_handle: None,
                    consented: false,
                    pressure_free: false,
                    inspectable: false,
                    revoked: false,
                    pii_stripped_body: "PII_STRIPPED: should not enter queue".to_owned(),
                    raw_body: Some("raw identity dream body Bob 555-0199 must not leak".to_owned()),
                    sample_count: 10_000,
                    quality_score: 0.50,
                    quality_threshold: 0.80,
                    drift_kind: Some("dialogic-register-drift".to_owned()),
                    new_register: None,
                    systematic_feedback_count: 12,
                },
                NaraExchangeRecord {
                    exchange_handle: "nara://exchange/volume-only".to_owned(),
                    consent_handle: Some("consent://nara/voice-corpus/volume".to_owned()),
                    consented: true,
                    pressure_free: true,
                    inspectable: true,
                    revoked: false,
                    pii_stripped_body: "PII_STRIPPED: many ordinary exchanges but no drift signal"
                        .to_owned(),
                    raw_body: Some("raw dialogue volume body Carol must not leak".to_owned()),
                    sample_count: 25_000,
                    quality_score: 0.95,
                    quality_threshold: 0.80,
                    drift_kind: None,
                    new_register: None,
                    systematic_feedback_count: 0,
                },
            ],
            now_ms: 1_780_402_000_000,
        },
    )
    .expect("Nara Anima-primary workflow should run");

    assert_eq!(receipt.admitted_queue.len(), 1);
    assert_eq!(
        receipt.admitted_queue[0].exchange_handle,
        "nara://exchange/consented-pii-stripped"
    );
    assert!(receipt
        .rejected_handles
        .contains(&"nara://exchange/not-consented".to_owned()));
    assert!(receipt
        .rejected_handles
        .contains(&"nara://exchange/volume-only".to_owned()));
    assert!(receipt.volume_only_rejected);
    assert_eq!(receipt.gate_records.len(), 5);
    assert!(receipt
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::Admission));
    assert!(receipt
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::RefreshTrigger));
    assert!(receipt
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::Deployment));
    assert!(receipt
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::Rollback));
    assert!(receipt
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::DpoTrigger));
    assert_ne!(receipt.parser_model_path, receipt.dialogue_adapter_path);

    let inbox = review
        .inbox(ReviewInboxFilter::default())
        .expect("review inbox");
    assert_eq!(inbox.items.len(), 5);
    assert!(inbox.items.iter().all(|item| item.requires_human));

    let privacy_json = serde_json::to_string(&receipt).expect("receipt json");
    for forbidden in [
        "raw journal",
        "dream oracle dialogue body",
        "raw identity",
        "Alice",
        "Bob",
        "Carol",
        "555-0101",
        "555-0199",
    ] {
        assert!(
            !privacy_json.contains(forbidden),
            "privacy output leaked {forbidden}"
        );
    }
    assert!(privacy_json.contains("PII_STRIPPED"));
    assert!(std::fs::read_to_string(&canonical_artifact_path)
        .expect("artifact jsonl")
        .contains("nara://exchange/consented-pii-stripped"));
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-s5-09t7-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
