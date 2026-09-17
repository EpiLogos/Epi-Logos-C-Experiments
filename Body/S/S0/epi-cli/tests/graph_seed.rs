use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use epi_logos::graph::embeddings::{EmbeddingConfig, GeminiEmbeddingClient};
use epi_logos::graph::schema;
use epi_logos::graph::seed;
use epi_logos::graph::seed_baseline_coordinates;
use epi_logos::graph::semantic;
use neo4rs::query;
use std::collections::BTreeSet;

/// A GLOBAL NODE-COUNT ASSERTION IS FORBIDDEN IN THIS FILE.
///
/// This test used to open with `MATCH (n:Bimba) DETACH DELETE n` and then assert
/// `count(n) == 102`. That pairing is the bug: the only way the whole database
/// can equal one fixture is if the test first empties the database. On
/// 2026-07-28 it ran against the live development Neo4j and destroyed the Bimba
/// ontology — months of work — because `#[ignore]` was the only thing in front
/// of it and `cargo test -- --ignored` runs ignored tests.
///
/// The seeder is idempotent (`MERGE (n:Bimba {coordinate: $coord})`), so it
/// needs no clean slate. What this test is actually for is: *did the seeder
/// produce its coordinates, with the right identity and the right relationships
/// between them?* Every assertion below is therefore scoped to
/// `seed_baseline_coordinates()` — the seeder's own enumeration of what it
/// writes. Neighbouring data is none of this test's business, and a count of it
/// is never evidence about the seed.
///
/// There is also no teardown. The seeded coordinates are the ontology's ROOT
/// coordinate nodes (`#`, `#0`-`#5`, `C0`-`M5'`, the Family/Weave/CF/VAK
/// nodes) — the seeder MERGEs onto whatever is already there rather than
/// creating them fresh. Deleting them "because the test seeded them" would
/// destroy real data under a narrower WHERE clause. A test may only delete what
/// it uniquely created; this one uniquely creates nothing.
#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
async fn test_seed_creates_expected_nodes() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();

    // Schema + seed. Both are MERGE-based and safe to re-run.
    schema::create_schema(&client).await.unwrap();
    seed::seed_coordinate_space(&client).await.unwrap();

    // The seeder's own manifest of what it writes. Everything below is scoped
    // to this list.
    let expected = seed_baseline_coordinates();

    // Every seeded coordinate is present — one node each, none missing.
    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba)
                 WHERE n.coordinate IN $coordinates
                 RETURN n.coordinate AS coordinate",
            )
            .param("coordinates", expected.clone()),
        )
        .await
        .unwrap();
    let present: BTreeSet<String> = rows
        .iter()
        .filter_map(|row| row.get::<String>("coordinate").ok())
        .collect();
    let missing: Vec<&String> = expected.iter().filter(|c| !present.contains(*c)).collect();
    assert!(
        missing.is_empty(),
        "seed did not produce {} of its own coordinates: {:?}",
        missing.len(),
        missing
    );
    assert_eq!(
        present.len(),
        expected.len(),
        "seed baseline is {} coordinates; {} distinct ones are in the graph",
        expected.len(),
        present.len()
    );

    // Verify # node
    let hash = client
        .run("MATCH (n:Bimba {coordinate: '#'}) RETURN n.c_1_name AS name")
        .await
        .unwrap();
    assert_eq!(hash.len(), 1);

    // Identity of a representative coordinate from each seeded layer.
    for (coordinate, name, family, layer) in [
        ("#", "Non-Dual Self-Inversion", "NONE", "PSYCHOID"),
        ("#4", "Context", "NONE", "PSYCHOID"),
        ("Weave_5_5", "Weave_5_5", "NONE", "WEAVE"),
        ("CF_FRACTAL", "CF_FRACTAL", "NONE", "CONTEXT_FRAME"),
        ("Family_M", "Subsystem", "M", "FAMILY_META"),
        ("C0", "Bimba", "C", "COORDINATE"),
        ("M5'", "Epii'", "M", "COORDINATE"),
        ("CFP", "CFP", "NONE", "VAK"),
    ] {
        let rows = client
            .run_query(
                query(
                    "MATCH (n:Bimba {coordinate: $coordinate})
                     RETURN n.c_1_name AS name,
                            n.c_4_family AS family,
                            n.c_4_layer AS layer",
                )
                .param("coordinate", coordinate),
            )
            .await
            .unwrap();
        assert_eq!(rows.len(), 1, "expected exactly one {coordinate} node");
        assert_eq!(rows[0].get::<String>("name").unwrap(), name, "{coordinate}");
        assert_eq!(
            rows[0].get::<String>("family").unwrap(),
            family,
            "{coordinate}"
        );
        assert_eq!(
            rows[0].get::<String>("layer").unwrap(),
            layer,
            "{coordinate}"
        );
    }

    // Verify psychoids — counted within the seed baseline, not graph-wide.
    let psychoids = client
        .run_query(
            query(
                "MATCH (n:Bimba)
                 WHERE n.coordinate IN $coordinates AND n.c_4_layer = 'PSYCHOID'
                 RETURN count(DISTINCT n) AS c",
            )
            .param("coordinates", expected.clone()),
        )
        .await
        .unwrap();
    let p_count: i64 = psychoids[0].get("c").unwrap();
    assert_eq!(p_count, 7); // # + #0-#5

    // Verify CF anchor invariant for the current topology rewrite:
    // only CF_FRACTAL anchors to #4.
    let anchors = client
        .run_query(
            query(
                "MATCH (cf:Bimba)-[:ANCHORED_TO]->(p4:Bimba)
                 WHERE cf.coordinate IN $coordinates
                   AND p4.coordinate IN $coordinates
                   AND cf.c_4_layer = 'CONTEXT_FRAME'
                 RETURN count(DISTINCT cf) AS c",
            )
            .param("coordinates", expected.clone()),
        )
        .await
        .unwrap();
    let a_count: i64 = anchors[0].get("c").unwrap();
    assert_eq!(a_count, 1);

    // Verify inversions
    let inv = client
        .run_query(
            query(
                "MATCH (a:Bimba)-[r:INVERTS_TO]->(b:Bimba)
                 WHERE a.coordinate IN $coordinates AND b.coordinate IN $coordinates
                 RETURN count(DISTINCT r) AS c",
            )
            .param("coordinates", expected.clone()),
        )
        .await
        .unwrap();
    let inv_count: i64 = inv[0].get("c").unwrap();
    assert_eq!(inv_count, 36); // 6 families x 6 positions

    client
        .run(
            r#"MATCH (n:Bimba {coordinate: '#4'})
               SET n.q_semantics = 'Context orchestrates the woven field',
                   n.q_priority = 'High surfacing value for context questions'"#,
        )
        .await
        .unwrap();

    let embedder = GeminiEmbeddingClient::new(EmbeddingConfig::from_env().unwrap());
    let _ = semantic::refresh_coordinate_embedding(
        &client,
        "P4",
        &embedder,
        semantic::EMBEDDING_VERSION,
    )
    .await
    .unwrap();
    let refreshed = semantic::refresh_coordinate_embedding(
        &client,
        "#4",
        &embedder,
        semantic::EMBEDDING_VERSION,
    )
    .await
    .unwrap();
    assert_eq!(refreshed.coordinate, "#4");
    assert!(!refreshed.source_hash.is_empty());

    let rows = client
        .run(
            "MATCH (n:Bimba {coordinate: '#4'})
             RETURN n.c_5_document AS semantic_document,
                    n.c_5_source_hash AS semantic_source_hash,
                    n.c_5_embedding_version AS semantic_embedding_version,
                    size(n.c_5_embedding) AS embedding_size",
        )
        .await
        .unwrap();
    let semantic_document: String = rows[0].get("semantic_document").unwrap();
    let semantic_source_hash: String = rows[0].get("semantic_source_hash").unwrap();
    let semantic_embedding_version: String = rows[0].get("semantic_embedding_version").unwrap();
    let embedding_size: i64 = rows[0].get("embedding_size").unwrap();
    assert!(semantic_document.contains("q_priority"));
    assert_eq!(semantic_source_hash, refreshed.source_hash);
    assert_eq!(semantic_embedding_version, semantic::EMBEDDING_VERSION);
    assert!(embedding_size > 0);

    client
        .run(
            r#"MATCH (n:Bimba {coordinate: 'P4'})
               SET n.q_priority = 'Updated surfacing bias after semantic change'"#,
        )
        .await
        .unwrap();
    let stale = semantic::find_stale_nodes(&client, semantic::EMBEDDING_VERSION)
        .await
        .unwrap();
    assert!(stale.contains(&"P4".to_string()));
    let expanded = semantic::find_stale_nodes_with_dependents(&client, semantic::EMBEDDING_VERSION)
        .await
        .unwrap();
    assert!(expanded.contains(&"P4".to_string()));
    assert!(expanded.contains(&"#4".to_string()));

    // No cleanup — see the module comment above. This test creates no node of
    // its own, so it has nothing it is entitled to delete.
}
