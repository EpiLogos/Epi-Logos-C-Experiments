use epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence;
use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent as HenGraphPromotionIntent;
use epi_s1_hen_compiler_core::relation_inference::RelationInferenceCandidate;
use epi_s2_graph_services::{GraphPromotionSyncReport, S2GraphPromotionIntent, SyncCoordinator};

#[test]
fn hen_promotion_intent_validates_as_s2_sync_plan_without_live_llm() {
    let evidence = collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\ntitle: Current\n---\nThis elaborates [[C0/T4]].",
    )
    .unwrap();
    let hen_intent = HenGraphPromotionIntent::from_artifact_evidence(
        evidence,
        vec![RelationInferenceCandidate {
            source_coordinate: "C0/T5".to_owned(),
            target_coordinate: "C0/T4".to_owned(),
            relation_type: "ELABORATES".to_owned(),
            confidence: 0.92,
            evidence_kind: "llm_inference".to_owned(),
            evidence_text: "The source text elaborates the linked target.".to_owned(),
            source_path: Some("Idea/Empty/current.md".to_owned()),
            source_line: Some(4),
            target_text: Some("C0/T4".to_owned()),
            inferred_by: Some("pi".to_owned()),
            prompt_hash: Some("sha256:prompt".to_owned()),
        }],
    )
    .unwrap();

    let s2_intent: S2GraphPromotionIntent =
        serde_json::from_value(serde_json::to_value(hen_intent).unwrap()).unwrap();
    let plan = SyncCoordinator::validate_promotion_intent(&s2_intent).unwrap();
    let report = GraphPromotionSyncReport::planned(&plan);

    assert_eq!(report.coordinate, "C0/T5");
    assert_eq!(report.node_action, "planned_upsert");
    assert_eq!(report.relation_actions.len(), 2);
    assert!(plan
        .relationships
        .iter()
        .any(|rel| rel.rel_type == "REFERENCES"));
    assert!(plan
        .relationships
        .iter()
        .any(|rel| rel.rel_type == "ELABORATES"));
}
