use epi_s2_graph_services::{
    schema::{
        classify_relationship_type, node_property_spec, relationship_property_spec,
        validate_coordinate_prefix_property, RelationshipTypeClass,
    },
    Neo4jClient, Neo4jConfig,
};

#[tokio::test]
#[ignore] // requires local Neo4j plus `epi graph import all` against docs/datasets
async fn imported_corpus_passes_s2_integrity_checks() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");

    assert_count_zero(
        &client,
        "MATCH (n:Bimba)
         WITH n.coordinate AS coordinate, count(n) AS c
         WHERE coordinate IS NULL OR c > 1
         RETURN count(*) AS count",
        "duplicate or null Bimba coordinates",
    )
    .await;

    assert_count_zero(
        &client,
        "MATCH (n:Bimba)
         WHERE n.bimbaCoordinate IS NOT NULL
         RETURN count(n) AS count",
        "raw bimbaCoordinate node properties",
    )
    .await;

    assert_count_zero(
        &client,
        "MATCH ()-[r]->()
         WHERE r.c_3_dataset_branch IS NOT NULL
           AND (r.c_0_source_coordinate IS NULL OR r.c_0_target_coordinate IS NULL)
         RETURN count(r) AS count",
        "imported relations missing endpoint coordinate properties",
    )
    .await;

    let node_keys = collect_strings(
        &client,
        "MATCH (n:Bimba)
         UNWIND keys(n) AS key
         RETURN collect(DISTINCT key) AS values",
    )
    .await;
    let unknown_node_keys = node_keys
        .iter()
        .filter(|key| node_property_spec(key).is_none())
        .filter(|key| validate_coordinate_prefix_property(key).is_err())
        .cloned()
        .collect::<Vec<_>>();
    assert!(
        unknown_node_keys.is_empty(),
        "unregistered node properties after dataset import: {unknown_node_keys:?}"
    );

    let relation_keys = collect_strings(
        &client,
        "MATCH ()-[r]->()
         WHERE r.c_3_dataset_branch IS NOT NULL
         UNWIND keys(r) AS key
         RETURN collect(DISTINCT key) AS values",
    )
    .await;
    let unknown_relation_keys = relation_keys
        .iter()
        .filter(|key| relationship_property_spec(key).is_none())
        .cloned()
        .collect::<Vec<_>>();
    assert!(
        unknown_relation_keys.is_empty(),
        "unregistered relationship properties after dataset import: {unknown_relation_keys:?}"
    );

    let relation_types = collect_strings(
        &client,
        "MATCH ()-[r]->()
         WHERE r.c_3_dataset_branch IS NOT NULL
         RETURN collect(DISTINCT type(r)) AS values",
    )
    .await;
    let drift_relation_types = relation_types
        .iter()
        .filter(|rel_type| classify_relationship_type(rel_type) == RelationshipTypeClass::Drift)
        .cloned()
        .collect::<Vec<_>>();
    assert!(
        drift_relation_types.is_empty(),
        "relationship type drift after dataset import: {drift_relation_types:?}"
    );

    let branches = collect_strings(
        &client,
        "MATCH (n:Bimba)
         WHERE n.c_3_dataset_branch IS NOT NULL
         RETURN collect(DISTINCT n.c_3_dataset_branch) AS values",
    )
    .await;
    for expected in [
        "anuttara-deep",
        "paramasiva-deep",
        "parashakti-deep",
        "mahamaya-deep",
        "nara-deep",
        "epii-deep",
    ] {
        assert!(
            branches.iter().any(|branch| branch == expected),
            "missing imported branch provenance {expected}; branches={branches:?}"
        );
    }
}

async fn assert_count_zero(client: &Neo4jClient, cypher: &str, label: &str) {
    let count = client
        .run(cypher)
        .await
        .expect(label)
        .first()
        .and_then(|row| row.get::<i64>("count").ok())
        .unwrap_or(-1);
    assert_eq!(count, 0, "{label}");
}

async fn collect_strings(client: &Neo4jClient, cypher: &str) -> Vec<String> {
    let mut values = client
        .run(cypher)
        .await
        .expect("collect strings")
        .first()
        .and_then(|row| row.get::<Vec<String>>("values").ok())
        .unwrap_or_default();
    values.sort();
    values
}
