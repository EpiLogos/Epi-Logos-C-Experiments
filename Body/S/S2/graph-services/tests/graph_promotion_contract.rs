use epi_s2_graph_services::{
    GraphPromotionSyncReport, PromotionNodeIntent, S2GraphPromotionIntent, S2GraphPromotionNode,
    SyncCoordinator,
};
use serde_json::json;
use std::collections::BTreeMap;

fn valid_intent() -> S2GraphPromotionIntent {
    serde_json::from_value(json!({
        "node": {
            "coordinate": "C0/T5",
            "identity_property": "coordinate",
            "vault_path": "Idea/Empty/current.md",
            "requested_label_hints": [],
            "properties": {
                "coordinate": "C0/T5",
                "vault_path": "Idea/Empty/current.md",
                "artifact_kind": "vault_markdown",
                "content_hash": "sha256:abc",
                "coordinate_prefix": "C0",
                "relation_evidence_count": 1
            }
        },
        "link_evidence": [{
            "raw": "[[C0/T4]]",
            "target_text": "C0/T4",
            "alias": null,
            "source_path": "Idea/Empty/current.md",
            "source_line": 4,
            "source_column": 8,
            "context": "Links [[C0/T4]]."
        }],
        "frontmatter_evidence": [],
        "property_proposals": [{
            "key": "s_4_function_role",
            "value": "S2 graph-services owns schema validation before Neo4j writes.",
            "evidence_kind": "content_synthesis",
            "evidence_text": "The graph spec states that S2 is the schema/protocol boundary for graph promotion.",
            "source_path": "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
            "source_line": 42,
            "proposed_by": "pi:pleroma",
            "reasoning": "The node is a technical coordinate doc, so the operational role should be agent-reasoned from the spec body rather than copied from frontmatter."
        }],
        "relation_candidates": [{
            "source_coordinate": "C0/T5",
            "target_coordinate": "C0/T4",
            "relation_type": "ELABORATES",
            "confidence": 0.9,
            "evidence_kind": "llm_inference",
            "evidence_text": "The source elaborates the target.",
            "source_path": "Idea/Empty/current.md",
            "source_line": 4,
            "target_text": "C0/T4",
            "inferred_by": "pi",
            "prompt_hash": "sha256:def"
        }],
        "content_hash": "sha256:abc",
        "markdown_body_hash": "sha256:body",
        "compatibility_source_label": null,
        "compatibility_source_property": null,
        "compatibility_source_coordinate": null,
        "promotion_source": "hen_compiler_core",
        "sync_version": "s1-hen-graph-promotion-v1"
    }))
    .unwrap()
}

#[test]
fn valid_promotion_intent_becomes_s2_validated_plan() {
    let plan = SyncCoordinator::validate_promotion_intent(&valid_intent()).unwrap();

    assert_eq!(plan.coordinate, "C0/T5");
    assert_eq!(plan.identity_property, "coordinate");
    assert!(plan.labels.contains(&"Bimba".to_owned()));
    assert!(!plan.labels.contains(&"Coordinate".to_owned()));
    assert!(!plan.labels.contains(&"VaultArtifact".to_owned()));
    assert_eq!(plan.relationships.len(), 2);
    assert_eq!(plan.relationships[0].rel_type, "REFERENCES");
    assert_eq!(plan.relationships[1].rel_type, "ELABORATES");
    assert_eq!(
        plan.properties.get("s_4_function_role"),
        Some(&json!(
            "S2 graph-services owns schema validation before Neo4j writes."
        ))
    );
}

#[test]
fn world_namespace_promotion_plan_preserves_root_link_and_span_pointer() {
    let intent: S2GraphPromotionIntent = serde_json::from_value(json!({
        "node": {
            "coordinate": "C2-1",
            "identity_property": "coordinate",
            "vault_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md",
            "requested_label_hints": ["World", "Archetypal"],
            "properties": {
                "coordinate": "C2-1",
                "vault_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md",
                "artifact_kind": "vault_markdown",
                "content_hash": "sha256:world",
                "coordinate_prefix": "C2",
                "coordinate_parent": "C2",
                "coordinate_axis": "direct",
                "type_family": "C",
                "type_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity",
                "world_type_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity",
                "type_coordinate": "C2",
                "semantic_authority": "candidate_pending_review",
                "crystallisation_state": "entity_candidate",
                "c_layer_path": "Idea/Bimba/World/Types/Coordinates/C/C2",
                "graph_evidence_kind": "c2_entity_candidate",
                "c_1_source_artifact_span": ["C2@12:26", "Anima@12:52"]
            }
        },
        "link_evidence": [],
        "frontmatter_evidence": [],
        "property_proposals": [{
            "key": "q_4_template_role",
            "value": "World entity-form entry grounded in C2 typology.",
            "evidence_kind": "content_synthesis",
            "evidence_text": "The World/Types path and type_coordinate identify this artifact as a C2 entity form.",
            "source_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md",
            "source_line": 12,
            "proposed_by": "pi:hen-world-namespace",
            "reasoning": "Bimba World files require PI property reasoning while the namespace/root relation remains deterministic."
        }],
        "relation_candidates": [{
            "source_coordinate": "C2-1",
            "target_coordinate": "C2",
            "relation_type": "WORLD_FORM_OF",
            "confidence": 1.0,
            "evidence_kind": "llm_inference",
            "evidence_text": "DR-WORLD-1 deterministic World namespace root link from SomeEntity to C2.",
            "source_path": "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md",
            "source_line": null,
            "target_text": "C2",
            "inferred_by": "pi:hen-world-namespace",
            "prompt_hash": "sha256:world"
        }],
        "content_hash": "sha256:world",
        "markdown_body_hash": "sha256:body",
        "compatibility_source_label": null,
        "compatibility_source_property": null,
        "compatibility_source_coordinate": null,
        "promotion_source": "hen_compiler_core",
        "sync_version": "s1-hen-graph-promotion-v1"
    }))
    .unwrap();

    let plan = SyncCoordinator::validate_promotion_intent(&intent).unwrap();

    assert!(plan.labels.contains(&"World".to_owned()));
    assert!(plan.labels.contains(&"Archetypal".to_owned()));
    assert_eq!(
        plan.properties.get("c_1_source_artifact_span"),
        Some(&json!(["C2@12:26", "Anima@12:52"]))
    );
    let root = plan
        .relationships
        .iter()
        .find(|relationship| relationship.rel_type == "WORLD_FORM_OF")
        .expect("WORLD_FORM_OF relationship missing");
    assert_eq!(root.source_coordinate, "C2-1");
    assert_eq!(root.target_coordinate, "C2");
}

#[test]
fn promotion_intent_rejects_missing_canonical_coordinate() {
    let mut intent = valid_intent();
    intent.node.coordinate.clear();
    intent
        .node
        .properties
        .insert("bimbaCoordinate".to_owned(), json!("C0/T5"));

    let err = SyncCoordinator::validate_promotion_intent(&intent).unwrap_err();

    assert!(err.contains("canonical coordinate is required"));
}

#[test]
fn promotion_intent_rejects_legacy_coordinate_only_payload() {
    let intent = S2GraphPromotionIntent {
        node: S2GraphPromotionNode {
            coordinate: String::new(),
            identity_property: "bimbaCoordinate".to_owned(),
            vault_path: "Idea/Empty/legacy.md".to_owned(),
            requested_label_hints: vec!["BimbaCoordinate".to_owned()],
            properties: BTreeMap::from([("bimbaCoordinate".to_owned(), json!("C0/T5"))]),
        },
        ..valid_intent()
    };

    let err = SyncCoordinator::validate_promotion_intent(&intent).unwrap_err();

    assert!(err.contains("canonical coordinate is required"));
}

#[test]
fn promotion_intent_rejects_unregistered_relation_candidate() {
    let mut intent = valid_intent();
    intent.relation_candidates[0].relation_type = "RELATES_TO".to_owned();

    let err = SyncCoordinator::validate_promotion_intent(&intent).unwrap_err();

    assert!(err.contains("not a canonical relationship type"));
}

#[test]
fn technical_promotion_requires_pi_agent_property_reasoning() {
    let mut intent = valid_intent();
    intent.node.vault_path = "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md".to_owned();
    intent.property_proposals.clear();

    let err = SyncCoordinator::validate_promotion_intent(&intent).unwrap_err();

    assert!(err.contains("requires PI-agent property proposals"));
}

#[test]
fn relation_candidates_must_be_pi_agent_inference_artifacts() {
    let mut intent = valid_intent();
    intent.relation_candidates[0].inferred_by = Some("script".to_owned());
    intent.relation_candidates[0].prompt_hash = None;

    let err = SyncCoordinator::validate_promotion_intent(&intent).unwrap_err();

    assert!(err.contains("relation candidate must be inferred by the PI agent"));
    assert!(err.contains("prompt_hash"));
}

#[test]
fn promotion_plan_generates_bimba_namespaced_upsert_without_generic_coordinate_labels() {
    let plan = SyncCoordinator::validate_promotion_intent(&valid_intent()).unwrap();
    let cypher = plan.node_upsert_cypher();

    assert!(cypher.contains("MERGE (n {coordinate: $coordinate})"));
    assert!(cypher.contains("SET n:Bimba"));
    assert!(cypher.contains("REMOVE n:Coordinate"));
    assert!(cypher.contains("REMOVE n:VaultArtifact"));
    assert!(cypher.contains("REMOVE n:BimbaNode"));
    assert!(cypher.contains("REMOVE n:BimbaCoordinate"));
    assert!(cypher.contains("REMOVE n.bimbaCoordinate"));
    assert!(cypher.contains("REMOVE n.bimba_coordinate"));
}

#[test]
fn promotion_sync_report_has_hen_lifecycle_fields() {
    let plan = SyncCoordinator::validate_promotion_intent(&valid_intent()).unwrap();
    let report = GraphPromotionSyncReport::planned(&plan);

    assert_eq!(report.source_path, "Idea/Empty/current.md");
    assert_eq!(report.coordinate, "C0/T5");
    assert_eq!(report.node_action, "planned_upsert");
    assert_eq!(report.relation_actions.len(), 2);
    assert_eq!(report.sync_version, "s1-hen-graph-promotion-v1");
    assert!(report.validation_errors.is_empty());
}

#[test]
fn dto_preserves_hen_node_intent_shape() {
    let node = PromotionNodeIntent::from(valid_intent().node);

    assert_eq!(node.coordinate, "C0/T5");
    assert_eq!(node.identity_property, "coordinate");
    assert_eq!(node.vault_path, "Idea/Empty/current.md");
}
