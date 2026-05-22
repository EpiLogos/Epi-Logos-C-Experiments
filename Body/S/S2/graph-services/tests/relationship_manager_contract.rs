use std::collections::BTreeMap;

use epi_s2_graph_services::RelationshipWritePlan;
use serde_json::Value;

#[test]
fn relationship_plan_rejects_unregistered_type_before_cypher() {
    let err = RelationshipWritePlan::new("C0/T5", "C0/T4", "RELATES_TO").unwrap_err();

    assert!(err.contains("not a canonical relationship type"));
}

#[test]
fn relationship_plan_rejects_missing_required_evidence_before_cypher() {
    let plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES").unwrap();
    let err = plan.validated_cypher().unwrap_err();

    assert!(err.contains("missing required relationship evidence property: evidence_kind"));
}

#[test]
fn relationship_plan_rejects_unregistered_property_before_cypher() {
    let mut plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES")
        .unwrap()
        .with_wikilink_evidence("Idea/Empty/current.md", 12, "[[C0/T4]]");
    plan.properties = BTreeMap::from([(
        "made_up_relation_thing".to_owned(),
        Value::String("nope".to_owned()),
    )]);

    let err = plan.validated_cypher().unwrap_err();

    assert!(err.contains("unknown graph relationship property key"));
}

#[test]
fn relationship_plan_generates_cypher_only_after_schema_validation() {
    let cypher = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES")
        .unwrap()
        .with_wikilink_evidence("Idea/Empty/current.md", 12, "[[C0/T4]]")
        .validated_cypher()
        .unwrap();

    assert!(cypher.contains("source.coordinate = $source_coordinate"));
    assert!(cypher.contains("target.coordinate = $target_coordinate"));
    assert!(cypher.contains("MERGE (source)-[r:ELABORATES]->(target)"));
    assert!(!cypher.contains(":Bimba"));
}
