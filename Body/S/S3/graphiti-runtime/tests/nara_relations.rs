use epi_s3_graphiti_runtime::{
    nara_insert_relation, nara_relation_payload, nara_relations_for_episode, NaraRelation,
    NaraRelationKind, NaraRelationPrivacyClass,
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
fn nara_insert_relation_writes_native_edges_and_reads_them_back() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("tokio runtime");
    let episode_handle = "graphiti://episode/native-nara-relations-05-t5-3";

    let has_day = runtime
        .block_on(nara_insert_relation(
            "25-06-2026",
            episode_handle,
            NaraRelation {
                kind: NaraRelationKind::HasDay,
                target_handle: "nara://day/25-06-2026".to_owned(),
                privacy_class: NaraRelationPrivacyClass::ProtectedLocalHandleOnly,
                metadata: json!({}),
            },
        ))
        .expect("native runtime should insert HAS_DAY");
    let next_in_arc = runtime
        .block_on(nara_insert_relation(
            "25-06-2026",
            episode_handle,
            NaraRelation {
                kind: NaraRelationKind::NextInArc,
                target_handle: "graphiti://episode/native-nara-relations-next".to_owned(),
                privacy_class: NaraRelationPrivacyClass::ProtectedLocalDerived,
                metadata: json!({"arcId": "day:25-06-2026:nara"}),
            },
        ))
        .expect("native runtime should insert NEXT_IN_ARC");
    for (kind, target_handle) in [
        (
            NaraRelationKind::ContainsDailyNote,
            "nara://day/25-06-2026/daily-note",
        ),
        (
            NaraRelationKind::PartOfDay,
            "nara://day/25-06-2026/segment/afternoon",
        ),
    ] {
        let inserted = runtime
            .block_on(nara_insert_relation(
                "25-06-2026",
                episode_handle,
                NaraRelation {
                    kind,
                    target_handle: target_handle.to_owned(),
                    privacy_class: NaraRelationPrivacyClass::ProtectedLocalHandleOnly,
                    metadata: json!({}),
                },
            ))
            .expect("native runtime should insert every allowed Nara relation kind");
        assert_eq!(inserted["runtimeAvailable"], true);
        assert_eq!(inserted["write"]["created"], true);
    }

    assert_eq!(has_day["method"], "s5.episodic.nara.relation.insert");
    assert_eq!(has_day["relation"]["edgeLabel"], "HAS_DAY");
    assert_eq!(
        has_day["relation"]["privacyClass"],
        "protected_local_handle_only"
    );
    assert_eq!(has_day["runtimeAvailable"], true);
    assert_eq!(has_day["write"]["adapter"], "native-library");
    assert_eq!(has_day["write"]["created"], true);
    assert_eq!(next_in_arc["runtimeAvailable"], true);

    let stored = nara_relations_for_episode(episode_handle).expect("native relations read back");
    assert_eq!(stored.len(), 4);
    assert!(stored.iter().any(|edge| {
        edge.predicate == "HAS_DAY"
            && edge.source_uuid == episode_handle
            && edge.target_uuid == "nara://day/25-06-2026"
    }));
    assert!(stored.iter().any(|edge| {
        edge.predicate == "NEXT_IN_ARC"
            && edge.target_uuid == "graphiti://episode/native-nara-relations-next"
    }));
    assert!(stored
        .iter()
        .any(|edge| edge.predicate == "CONTAINS_DAILY_NOTE"));
    assert!(stored.iter().any(|edge| edge.predicate == "PART_OF_DAY"));

    let duplicate = runtime
        .block_on(nara_insert_relation(
            "25-06-2026",
            episode_handle,
            NaraRelation {
                kind: NaraRelationKind::HasDay,
                target_handle: "nara://day/25-06-2026".to_owned(),
                privacy_class: NaraRelationPrivacyClass::ProtectedLocalHandleOnly,
                metadata: json!({}),
            },
        ))
        .expect("idempotent native replay should succeed");
    assert_eq!(duplicate["write"]["created"], false);
    assert_eq!(
        nara_relations_for_episode(episode_handle)
            .expect("idempotent relations read back")
            .len(),
        4
    );
    assert!(has_day.get("body").is_none());
}
