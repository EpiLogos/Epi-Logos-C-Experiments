use epi_s2_graph_services::Neo4jGraphRole;
use neo4rs::query;
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

#[test]
fn neo4j_graph_role_uses_s2_bimba_schema_authority() {
    let role = Neo4jGraphRole::primary_bimba();

    assert_eq!(role.coordinate_owner, "S2");
    assert_eq!(role.graph_id, epi_s2_graph_schema::GRAPH_ID);
    assert_eq!(role.node_label, "Bimba");
    assert_eq!(role.coordinate_property, "coordinate");
    assert_eq!(role.semantic_embedding_dimensions, 3072);
    assert_eq!(role.vector_index_name, "coord_embedding");
    assert!(role.compatibility_labels.contains(&"BimbaNode"));
    assert!(!role.compatibility_properties.contains(&"bimbaCoordinate"));
    assert!(!role.compatibility_labels.contains(&"Bimba"));
}

#[tokio::test]
#[ignore = "requires EPI_GRAPH_LIVE=1 and a real Neo4j service"]
async fn live_promotion_upsert_writes_coordinate_node_and_registered_relationship() {
    if std::env::var("EPI_GRAPH_LIVE").ok().as_deref() != Some("1") {
        eprintln!("skipping live graph promotion test: set EPI_GRAPH_LIVE=1");
        return;
    }

    let client = epi_s2_graph_services::Neo4jClient::connect(
        &epi_s2_graph_services::Neo4jConfig::from_env(),
    )
    .expect("live Neo4j connection must be configured");
    let coordinator = epi_s2_graph_services::SyncCoordinator::new(&client);
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos()
        % 60_000;
    let source = format!("M2-3-0-{suffix}");
    let target = format!("M2-3-1-{suffix}");

    let cleanup = |coord: &str| {
        query("MATCH (n {coordinate: $coordinate}) DETACH DELETE n").param("coordinate", coord)
    };
    let _ = client.run_query(cleanup(&source)).await;
    let _ = client.run_query(cleanup(&target)).await;

    coordinator
        .promote_intent(&promotion_intent(&target, &[]))
        .await
        .unwrap();
    coordinator
        .promote_intent(&promotion_intent(&source, &[(&target, "ELABORATES")]))
        .await
        .unwrap();

    let node_rows = client
        .run_query(
            query(
                "MATCH (n {coordinate: $coordinate})
                 RETURN n.coordinate AS coordinate,
                        ('Coordinate' IN labels(n)) AS has_coordinate,
                        ('VaultArtifact' IN labels(n)) AS has_vault,
                        ('Bimba' IN labels(n)) AS has_bimba",
            )
            .param("coordinate", source.clone()),
        )
        .await
        .unwrap();
    assert_eq!(node_rows.len(), 1);
    assert_eq!(node_rows[0].get::<String>("coordinate").unwrap(), source);
    assert!(!node_rows[0].get::<bool>("has_coordinate").unwrap());
    assert!(!node_rows[0].get::<bool>("has_vault").unwrap());
    assert!(node_rows[0].get::<bool>("has_bimba").unwrap());

    let rel_rows = client
        .run_query(
            query(
                "MATCH (s {coordinate: $source})-[r:ELABORATES]->(t {coordinate: $target})
                 RETURN r.evidence_kind AS evidence_kind, r.evidence_text AS evidence_text",
            )
            .param("source", source.clone())
            .param("target", target.clone()),
        )
        .await
        .unwrap();
    assert_eq!(rel_rows.len(), 1);
    assert_eq!(
        rel_rows[0].get::<String>("evidence_kind").unwrap(),
        "llm_inference"
    );
    assert!(!rel_rows[0]
        .get::<String>("evidence_text")
        .unwrap()
        .trim()
        .is_empty());

    client.run_query(cleanup(&source)).await.unwrap();
    client.run_query(cleanup(&target)).await.unwrap();
}

fn promotion_intent(
    coordinate: &str,
    relations: &[(&str, &str)],
) -> epi_s2_graph_services::S2GraphPromotionIntent {
    let relation_candidates = relations
        .iter()
        .map(|(target, rel_type)| {
            json!({
                "source_coordinate": coordinate,
                "target_coordinate": target,
                "relation_type": rel_type,
                "confidence": 0.95,
                "evidence_kind": "llm_inference",
                "evidence_text": "Live promotion contract relation evidence.",
                "source_path": format!("Idea/Empty/{coordinate}.md"),
                "source_line": 4,
                "target_text": target,
                "inferred_by": "pi",
                "prompt_hash": "sha256:live-contract"
            })
        })
        .collect::<Vec<_>>();

    serde_json::from_value(json!({
        "node": {
            "coordinate": coordinate,
            "identity_property": "coordinate",
            "vault_path": format!("Idea/Empty/{coordinate}.md"),
            "requested_label_hints": [],
            "properties": {
                "coordinate": coordinate,
                "vault_path": format!("Idea/Empty/{coordinate}.md"),
                "artifact_kind": "vault_markdown",
                "content_hash": "sha256:live-contract",
                "coordinate_prefix": "M2-3-0",
                "relation_evidence_count": relations.len()
            }
        },
        "link_evidence": [],
        "frontmatter_evidence": [],
        "relation_candidates": relation_candidates,
        "content_hash": "sha256:live-contract",
        "markdown_body_hash": "sha256:live-body",
        "compatibility_source_label": null,
        "compatibility_source_property": null,
        "compatibility_source_coordinate": null,
        "promotion_source": "hen_compiler_core",
        "sync_version": "s1-hen-graph-promotion-v1"
    }))
    .unwrap()
}
