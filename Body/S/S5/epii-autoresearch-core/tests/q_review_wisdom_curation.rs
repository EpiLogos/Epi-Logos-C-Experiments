use std::collections::BTreeMap;

use epi_s5_epii_autoresearch_core::{
    detect_articulation_gaps, detect_contradiction_candidates, detect_resonance_promotions,
    detect_stale_by_non_revisit, epii_self_referential_read, write_q_review_jsonl,
    BimbaNodeSnapshot, CanonicalRelationSnapshot, CorpusSnapshot, QDetectorConfig,
    QReviewReasonClass, QReviewStore, ResonanceEdgeSnapshot,
};

fn embedding(seed: f64) -> Vec<f64> {
    (0..3072)
        .map(|i| if i % 2 == 0 { seed } else { 1.0 - seed })
        .collect()
}

fn q_map(pairs: &[(&str, &str)]) -> BTreeMap<String, String> {
    pairs
        .iter()
        .map(|(key, value)| ((*key).to_owned(), (*value).to_owned()))
        .collect()
}

fn detector_config() -> QDetectorConfig {
    QDetectorConfig {
        articulation_gap_peer_ratio: 0.75,
        contradiction_vector_disagreement_threshold: 0.35,
        resonance_promotion_confidence_threshold: 0.85,
        stale_revision_threshold: 12,
        priority_order: vec![
            QReviewReasonClass::ArticulationGap,
            QReviewReasonClass::PromotionCandidate,
            QReviewReasonClass::ContradictionCandidate,
            QReviewReasonClass::StaleByNonRevisit,
        ],
    }
}

fn node(
    coordinate: &str,
    q: BTreeMap<String, String>,
    review_epoch: Option<u64>,
) -> BimbaNodeSnapshot {
    let mut review_epochs = BTreeMap::new();
    if let Some(epoch) = review_epoch {
        review_epochs.insert("qm_5_i0_review_epoch".to_owned(), epoch);
    }
    BimbaNodeSnapshot {
        coordinate: coordinate.to_owned(),
        namespace: "bimba".to_owned(),
        c_4_family: "M".to_owned(),
        c_4_ql_position: "5".to_owned(),
        c_4_lens: "L5".to_owned(),
        q_values: q,
        review_epochs,
        embedding_3072: embedding(0.75),
    }
}

#[test]
fn self_referential_read_produces_ranked_jsonl_queue_without_mutating_corpus() {
    let before = CorpusSnapshot {
        day_id: "2026-06-11".to_owned(),
        graph_revision: 20,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[
                    (
                        "q_5_i0_integration_template",
                        "library returns canon to living access",
                    ),
                    (
                        "q_4_i0_locality_signature",
                        "library holds Epii self-canon at M5-0",
                    ),
                    (
                        "q_2_i0_operational_logic",
                        "RAG access follows namespace discipline",
                    ),
                    (
                        "q_3_i0_dialectical_movement",
                        "integration gathers difference into return",
                    ),
                ]),
                Some(19),
            ),
            node(
                "M5-1",
                q_map(&[
                    (
                        "q_5_i0_integration_template",
                        "philosophy makes Epii articulate itself",
                    ),
                    (
                        "q_4_i0_locality_signature",
                        "philosophy marks self-articulation",
                    ),
                    (
                        "q_2_i0_operational_logic",
                        "canon proposals remain governed",
                    ),
                    (
                        "q_3_i0_dialectical_movement",
                        "synthesis clarifies conflict without erasing it",
                    ),
                ]),
                Some(19),
            ),
            node(
                "M5-2",
                q_map(&[
                    (
                        "q_5_i0_integration_template",
                        "backend keeps the voice retrievable",
                    ),
                    (
                        "q_4_i0_locality_signature",
                        "backend keeps CPT and RAG aligned",
                    ),
                    ("q_2_i0_operational_logic", "construction precedes training"),
                    (
                        "q_3_i0_dialectical_movement",
                        "operation serves crystallisation",
                    ),
                ]),
                Some(19),
            ),
            node(
                "M5-3",
                q_map(&[
                    (
                        "q_5_i0_integration_template",
                        "surface opens participation in canon",
                    ),
                    (
                        "q_4_i0_locality_signature",
                        "frontend locates pair-composition",
                    ),
                    (
                        "q_2_i0_operational_logic",
                        "the surface proposes but never promotes",
                    ),
                    (
                        "q_3_i0_dialectical_movement",
                        "surface opens participation in canon",
                    ),
                ]),
                Some(19),
            ),
            node(
                "M5-4",
                q_map(&[(
                    "q_3_i0_dialectical_movement",
                    "Sophia must review Sophia without self-protection",
                )]),
                Some(4),
            ),
            node(
                "M5-5",
                q_map(&[(
                    "q_3_i0_dialectical_movement",
                    "etymology traces descent rather than integration",
                )]),
                Some(19),
            ),
        ],
        canonical_relations: vec![CanonicalRelationSnapshot {
            source_coordinate: "M5-4".to_owned(),
            target_coordinate: "M5-5".to_owned(),
            relation_family: "COMPLEMENTS".to_owned(),
        }],
        resonance_edges: vec![ResonanceEdgeSnapshot {
            source_coordinate: "M5-4".to_owned(),
            target_coordinate: "gnosis://epii/sophia-self-review".to_owned(),
            confidence: 0.91,
            has_canonical_bimba_relation: false,
            source_namespace: "bimba".to_owned(),
            target_namespace: "gnosis".to_owned(),
        }],
    };
    let after_input = before.clone();

    let mut config = detector_config();
    config.stale_revision_threshold = 5;
    let queue = epii_self_referential_read(after_input, 10, &config)
        .expect("self-referential read returns queue");

    assert_eq!(before.nodes[4].q_values.len(), 1, "fixture sanity");
    assert_eq!(before.nodes[4].review_epochs["qm_5_i0_review_epoch"], 4);
    assert!(queue.entries.len() >= 5);
    assert_eq!(
        queue.entries[0].reason_class,
        QReviewReasonClass::ArticulationGap
    );
    assert!(queue
        .entries
        .iter()
        .any(|entry| entry.reason_class == QReviewReasonClass::PromotionCandidate));
    assert!(queue
        .entries
        .iter()
        .any(|entry| entry.reason_class == QReviewReasonClass::ContradictionCandidate));
    assert!(queue
        .entries
        .iter()
        .any(|entry| entry.reason_class == QReviewReasonClass::StaleByNonRevisit));
    assert!(queue
        .entries
        .windows(2)
        .all(|pair| pair[0].priority <= pair[1].priority));

    let jsonl = queue.to_jsonl().expect("jsonl serializes");
    for line in jsonl.lines() {
        let value: serde_json::Value = serde_json::from_str(line).expect("json line");
        assert!(value.get("target_coordinate").is_some());
        assert!(value.get("q_key").is_some());
        assert!(value.get("reason_class").is_some());
        assert!(value.get("evidence_refs").is_some());
        assert!(value.get("priority").is_some());
    }
}

#[test]
fn jsonl_writer_uses_q_review_queue_schema() {
    let snapshot = CorpusSnapshot {
        day_id: "2026-06-11".to_owned(),
        graph_revision: 3,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[("q_5_i0_integration_template", "library returns")]),
                Some(3),
            ),
            node("M5-1", BTreeMap::new(), Some(3)),
        ],
        canonical_relations: vec![],
        resonance_edges: vec![],
    };
    let queue =
        epii_self_referential_read(snapshot, 1, &detector_config()).expect("queue should build");
    let temp = tempfile::tempdir().expect("tempdir");
    let path = temp.path().join("q_review_2026-06-11.jsonl");

    write_q_review_jsonl(&queue, &path).expect("queue writes");

    let written = std::fs::read_to_string(path).expect("jsonl readable");
    assert!(written.contains("\"reason_class\":\"articulation_gap\""));
    assert!(written
        .lines()
        .all(|line| serde_json::from_str::<serde_json::Value>(line).is_ok()));
}

#[test]
fn detector_accepts_canonical_q_property_keys_from_bimba() {
    let snapshot = CorpusSnapshot {
        day_id: "2026-07-15".to_owned(),
        graph_revision: 20,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[("q_5_living_return", "A fully canonical Q property.")]),
                Some(20),
            ),
            node("M5-1", BTreeMap::new(), Some(20)),
        ],
        canonical_relations: vec![],
        resonance_edges: vec![],
    };

    let entries = detect_articulation_gaps(&snapshot, &detector_config())
        .expect("canonical Bimba Q property must be evaluated");
    assert!(entries.iter().any(|entry| {
        entry.target_coordinate == "M5-1"
            && entry.q_key == "q_5_living_return"
            && entry.reason_class == QReviewReasonClass::ArticulationGap
    }));
}

#[test]
fn stale_detector_targets_an_existing_q_articulation_not_review_metadata() {
    let snapshot = CorpusSnapshot {
        day_id: "2026-07-15".to_owned(),
        graph_revision: 20,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[(
                    "q_5_living_return",
                    "The reviewed articulation remains a living return.",
                )]),
                Some(1),
            ),
            node("M5-1", BTreeMap::new(), Some(1)),
        ],
        canonical_relations: vec![],
        resonance_edges: vec![],
    };

    let entries = detect_stale_by_non_revisit(&snapshot, 0, &detector_config())
        .expect("stale detector should inspect reviewed articulations");

    let reviewed = entries
        .iter()
        .find(|entry| entry.target_coordinate == "M5-0")
        .expect("the reviewed articulation should be queued");
    assert_eq!(reviewed.q_key, "q_5_living_return");
    assert_ne!(reviewed.q_key, "qm_5_i0_review_epoch");
}

#[test]
fn detectors_are_read_only_and_priority_order_is_configurable() {
    let snapshot = CorpusSnapshot {
        day_id: "2026-06-11".to_owned(),
        graph_revision: 20,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[
                    ("q_5_i0_integration_template", "library returns"),
                    ("q_3_i0_dialectical_movement", "return integrates"),
                ]),
                Some(20),
            ),
            node(
                "M5-1",
                q_map(&[
                    ("q_5_i0_integration_template", "philosophy names"),
                    ("q_3_i0_dialectical_movement", "naming integrates"),
                ]),
                Some(20),
            ),
            node(
                "M5-2",
                q_map(&[(
                    "q_3_i0_dialectical_movement",
                    "technical execution diverges",
                )]),
                Some(1),
            ),
        ],
        canonical_relations: vec![CanonicalRelationSnapshot {
            source_coordinate: "M5-1".to_owned(),
            target_coordinate: "M5-2".to_owned(),
            relation_family: "IMPLEMENTS".to_owned(),
        }],
        resonance_edges: vec![ResonanceEdgeSnapshot {
            source_coordinate: "M5-2".to_owned(),
            target_coordinate: "gnosis://epii/backend-pattern".to_owned(),
            confidence: 0.93,
            has_canonical_bimba_relation: false,
            source_namespace: "bimba".to_owned(),
            target_namespace: "gnosis".to_owned(),
        }],
    };
    let before = snapshot.clone();
    let mut config = detector_config();
    config.priority_order = vec![
        QReviewReasonClass::PromotionCandidate,
        QReviewReasonClass::ArticulationGap,
        QReviewReasonClass::ContradictionCandidate,
        QReviewReasonClass::StaleByNonRevisit,
    ];
    config.stale_revision_threshold = 5;

    let _ = detect_articulation_gaps(&snapshot, &config).expect("gap detector");
    let _ = detect_contradiction_candidates(&snapshot, &config).expect("contradiction detector");
    let _ = detect_resonance_promotions(&snapshot, &config).expect("resonance detector");
    let _ = detect_stale_by_non_revisit(&snapshot, 20, &config).expect("stale detector");
    assert_eq!(snapshot, before);

    let queue = epii_self_referential_read(snapshot, 20, &config).expect("queue");
    assert_eq!(
        queue.entries[0].reason_class,
        QReviewReasonClass::PromotionCandidate
    );
    assert_eq!(queue.entries[0].priority, 0);
}

#[test]
fn q_review_store_persists_and_filters_the_generated_queue() {
    let root = tempfile::tempdir().expect("store root");
    let store = QReviewStore::new(root.path());
    let snapshot = CorpusSnapshot {
        day_id: "2026-07-15".to_owned(),
        graph_revision: 7,
        nodes: vec![
            node(
                "M5-0",
                q_map(&[("q_5_i0_integration_template", "canonical return")]),
                Some(7),
            ),
            node("M5-1", BTreeMap::new(), Some(7)),
        ],
        canonical_relations: vec![],
        resonance_edges: vec![],
    };

    let generated = store
        .run(snapshot, 7, &detector_config())
        .expect("run persists the generated queue");
    assert!(!generated.entries.is_empty());

    let filtered = store
        .latest("2026-07-15", Some("(4.5/0)"))
        .expect("latest reads the persisted JSONL queue")
        .expect("persisted queue is present");
    assert_eq!(filtered.day_id, "2026-07-15");
    assert_eq!(filtered.graph_revision, 7);
    assert_eq!(filtered.generated_by, "epii_self_referential_read");
    assert!(filtered
        .entries
        .iter()
        .all(|entry| entry.review_surface.vak_cf == "(4.5/0)"));
    assert!(root
        .path()
        .join("queues/q_review_2026-07-15.jsonl")
        .is_file());
    assert!(root
        .path()
        .join("queues/q_review_2026-07-15.meta.json")
        .is_file());
}

#[test]
fn q_review_store_reports_an_unrun_day_as_absent() {
    let root = tempfile::tempdir().expect("store root");
    let store = QReviewStore::new(root.path());

    assert_eq!(
        store
            .latest("16-07-2026", None)
            .expect("missing queue is not corrupt"),
        None
    );
}

#[test]
fn detector_config_loads_all_thresholds_from_autoresearch_toml_section() {
    let root = tempfile::tempdir().expect("config root");
    let path = root.path().join("config.toml");
    std::fs::write(
        &path,
        r#"
[autoresearch]
articulation_gap_peer_ratio = 0.75
contradiction_vector_disagreement_threshold = 0.35
resonance_promotion_confidence_threshold = 0.85
stale_revision_threshold = 12
priority_order = ["articulation_gap", "promotion_candidate", "contradiction_candidate", "stale_by_non_revisit"]
"#,
    )
    .expect("write config");

    assert_eq!(
        QDetectorConfig::load_from_path(&path).expect("config loads"),
        detector_config()
    );
}
