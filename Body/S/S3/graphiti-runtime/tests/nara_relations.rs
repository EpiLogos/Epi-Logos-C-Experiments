use epi_s3_graphiti_runtime::{
    nara_insert_relation, nara_relation_payload, NaraRelation, NaraRelationKind,
    NaraRelationPrivacyClass,
};
use serde_json::json;

#[test]
fn nara_relation_payload_materialises_day_and_arc_edge_labels() {
    let contains = nara_relation_payload(
        "25-06-2026",
        "graphiti://episode/daily-note",
        &NaraRelation {
            kind: NaraRelationKind::ContainsDailyNote,
            target_handle: "nara://day/25-06-2026/daily-note".to_owned(),
            privacy_class: NaraRelationPrivacyClass::ProtectedLocalHandleOnly,
            metadata: json!({"nowPath": "Idea/Empty/Present/25-06-2026/session/now.md"}),
        },
    )
    .expect("CONTAINS_DAILY_NOTE relation should be allowed");

    assert_eq!(contains["edgeLabel"], "CONTAINS_DAILY_NOTE");
    assert_eq!(contains["dayId"], "25-06-2026");
    assert_eq!(contains["episodeHandle"], "graphiti://episode/daily-note");
    assert_eq!(contains["targetHandle"], "nara://day/25-06-2026/daily-note");
    assert_eq!(
        contains["privacyClass"], "protected_local_handle_only",
        "runtime writes safe handles, never protected bodies"
    );
    assert_eq!(
        contains["privacyBoundary"],
        "protected-local-episodic-memory"
    );
    assert_eq!(contains["runtimeOwner"], "S3'");
    assert_eq!(contains["graphOwner"], "S2");
    assert_eq!(
        contains["metadata"]["nowPath"],
        "Idea/Empty/Present/25-06-2026/session/now.md"
    );
    assert!(contains.get("body").is_none());
    assert!(contains.get("episodeBody").is_none());

    let next = nara_relation_payload(
        "25-06-2026",
        "graphiti://episode/one",
        &NaraRelation {
            kind: NaraRelationKind::NextInArc,
            target_handle: "graphiti://episode/two".to_owned(),
            privacy_class: NaraRelationPrivacyClass::ProtectedLocalDerived,
            metadata: json!({"arcId": "day:25-06-2026:nara"}),
        },
    )
    .expect("NEXT_IN_ARC relation should be allowed");

    assert_eq!(next["edgeLabel"], "NEXT_IN_ARC");
    assert_eq!(next["sourceHandle"], "graphiti://episode/one");
    assert_eq!(next["targetHandle"], "graphiti://episode/two");
    assert_eq!(next["privacyClass"], "protected-local-derived");
}

#[test]
fn nara_relation_payload_exposes_all_allowed_relation_labels() {
    let cases = [
        (NaraRelationKind::HasDay, "HAS_DAY"),
        (NaraRelationKind::ContainsDailyNote, "CONTAINS_DAILY_NOTE"),
        (NaraRelationKind::PartOfDay, "PART_OF_DAY"),
        (NaraRelationKind::NextInArc, "NEXT_IN_ARC"),
    ];

    for (kind, edge_label) in cases {
        let payload = nara_relation_payload(
            "25-06-2026",
            "graphiti://episode/test",
            &NaraRelation {
                kind,
                target_handle: format!("nara://relation/{edge_label}"),
                privacy_class: NaraRelationPrivacyClass::ProtectedLocalBody,
                metadata: json!({}),
            },
        )
        .expect("allowed relation kind should build");
        assert_eq!(payload["edgeLabel"], edge_label);
    }
}

#[test]
fn nara_relation_payload_rejects_missing_handles_and_body_leaks() {
    let err = nara_relation_payload(
        "25-06-2026",
        "",
        &NaraRelation {
            kind: NaraRelationKind::PartOfDay,
            target_handle: "graphiti://episode/test".to_owned(),
            privacy_class: NaraRelationPrivacyClass::ProtectedLocalBody,
            metadata: json!({}),
        },
    )
    .unwrap_err();
    assert!(err.contains("episode_handle is required"));

    let err = nara_relation_payload(
        "25-06-2026",
        "graphiti://episode/test",
        &NaraRelation {
            kind: NaraRelationKind::PartOfDay,
            target_handle: "graphiti://episode/other".to_owned(),
            privacy_class: NaraRelationPrivacyClass::ProtectedLocalBody,
            metadata: json!({"episodeBody": "raw protected journal text"}),
        },
    )
    .unwrap_err();
    assert!(err.contains("episodeBody"));
}

#[test]
fn nara_insert_relation_returns_privacy_envelope_when_runtime_cannot_write() {
    std::env::set_var("EPI_GRAPHITI_TIMEOUT_MS", "1");
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("tokio runtime");

    let envelope = runtime
        .block_on(nara_insert_relation(
            "25-06-2026",
            "graphiti://episode/test",
            NaraRelation {
                kind: NaraRelationKind::HasDay,
                target_handle: "nara://day/25-06-2026".to_owned(),
                privacy_class: NaraRelationPrivacyClass::ProtectedLocalHandleOnly,
                metadata: json!({}),
            },
        ))
        .expect("unavailable runtime should still return a governed envelope");

    assert_eq!(envelope["method"], "s5.episodic.nara.relation.insert");
    assert_eq!(envelope["relation"]["edgeLabel"], "HAS_DAY");
    assert_eq!(
        envelope["relation"]["privacyClass"],
        "protected_local_handle_only"
    );
    assert_eq!(envelope["runtimeAvailable"], false);
    let error_kind = envelope["error"]["kind"]
        .as_str()
        .expect("error kind is surfaced");
    assert!(
        matches!(error_kind, "graphiti-unavailable" | "graphiti-http-error"),
        "unexpected error kind: {error_kind}"
    );
    assert!(envelope.get("body").is_none());
    std::env::remove_var("EPI_GRAPHITI_TIMEOUT_MS");
}
