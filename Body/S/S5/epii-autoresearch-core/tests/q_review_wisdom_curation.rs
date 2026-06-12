use std::collections::BTreeMap;

use epi_s5_epii_autoresearch_core::{
    detect_articulation_gaps, detect_contradiction_candidates, detect_resonance_promotions,
    detect_stale_by_non_revisit, epii_self_referential_read, write_q_review_jsonl,
    BimbaNodeSnapshot, CanonicalRelationSnapshot, CorpusSnapshot, QDetectorConfig,
    QReviewReasonClass, ResonanceEdgeSnapshot,
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

    let queue = epii_self_referential_read(
        after_input,
        10,
        &QDetectorConfig {
            stale_revision_threshold: 5,
            ..QDetectorConfig::default()
        },
    )
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
    let queue = epii_self_referential_read(snapshot, 1, &QDetectorConfig::default())
        .expect("queue should build");
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
    let config = QDetectorConfig {
        priority_order: vec![
            QReviewReasonClass::PromotionCandidate,
            QReviewReasonClass::ArticulationGap,
            QReviewReasonClass::ContradictionCandidate,
            QReviewReasonClass::StaleByNonRevisit,
        ],
        stale_revision_threshold: 5,
        ..QDetectorConfig::default()
    };

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
