//! Graph lifecycle helpers — bootstrap/update/reconcile assist.
//!
//! S2 owns the Cypher-level evidence and embedding-refresh law used by
//! the S0 `epi graph` CLI dispatch arms (`Update`, `Reconcile`,
//! `ReloadOntology`, …). These functions execute Cypher against Neo4j
//! and consult the S2 metas to decide whether semantic embeddings
//! should be refreshed; the S0 adapter only orchestrates the CLI shape
//! and the rendered messages.

use neo4rs::query;

use crate::{embeddings, gds, meta, semantic, seed, Neo4jClient};

/// Structured view of the live graph evidence used by `graph reconcile`.
#[derive(Debug, Clone, Copy)]
pub struct LiveGraphBackedEvidence {
    pub seed_baseline_ok: bool,
    pub dataset_nodes: i64,
    pub relation_registry_ok: bool,
    pub gds_available: bool,
}

/// Collect the evidence needed by the `reconcile` arm: are the seed
/// baselines intact, how many dataset nodes present, are the
/// relationship types registered, is GDS available.
pub async fn live_graph_backed_evidence(
    client: &Neo4jClient,
) -> Result<LiveGraphBackedEvidence, String> {
    let dataset_rows = client
        .run(
            "MATCH (n:Bimba)
             WHERE n.c_3_source_dataset IS NOT NULL
             RETURN count(n) AS c",
        )
        .await
        .map_err(|err| format!("dataset evidence query failed: {err}"))?;
    let dataset_nodes = dataset_rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();

    let rel_rows = client
        .run("MATCH ()-[r]->() RETURN collect(DISTINCT type(r)) AS rel_types")
        .await
        .map_err(|err| format!("relationship evidence query failed: {err}"))?;
    let rel_types: Vec<String> = rel_rows
        .first()
        .and_then(|row| row.get("rel_types").ok())
        .unwrap_or_default();
    let relation_registry_ok = rel_types.iter().all(|rel_type| {
        !matches!(
            epi_s2_graph_schema::classify_relationship_type(rel_type),
            epi_s2_graph_schema::RelationshipTypeClass::Drift
        )
    });

    let query_set = seed::seed_baseline_snapshot_queries();
    let counts_query = query_set
        .iter()
        .find(|query| query.name == "seed_node_group_counts")
        .ok_or_else(|| "seed count query missing".to_owned())?;
    let rel_query = query_set
        .iter()
        .find(|query| query.name == "seed_relationship_count")
        .ok_or_else(|| "seed relationship query missing".to_owned())?;
    let coordinates = seed::seed_baseline_coordinates();
    let count_rows = client
        .run_query(query(counts_query.cypher).param("coordinates", coordinates.clone()))
        .await
        .map_err(|err| format!("seed evidence query failed: {err}"))?;
    let rel_count_rows = client
        .run_query(
            query(rel_query.cypher)
                .param("coordinates", coordinates)
                .param(
                    "relationship_types",
                    seed::seed_relationship_types()
                        .iter()
                        .map(|rel_type| (*rel_type).to_string())
                        .collect::<Vec<_>>(),
                ),
        )
        .await
        .map_err(|err| format!("seed relationship evidence query failed: {err}"))?;
    let row = count_rows
        .first()
        .ok_or_else(|| "seed evidence row missing".to_owned())?;
    let seed_relationships = rel_count_rows
        .first()
        .and_then(|r| r.get::<i64>("seed_relationships").ok())
        .unwrap_or_default();
    let seed_baseline_ok = row.get::<i64>("seed_nodes").unwrap_or_default() == 102
        && row.get::<i64>("root_nodes").unwrap_or_default() == 1
        && row.get::<i64>("psychoids").unwrap_or_default() == 6
        && row.get::<i64>("weaves").unwrap_or_default() == 4
        && row.get::<i64>("context_frames").unwrap_or_default() == 7
        && row.get::<i64>("family_meta_nodes").unwrap_or_default() == 6
        && row.get::<i64>("family_coordinates").unwrap_or_default() == 72
        && row.get::<i64>("vak_nodes").unwrap_or_default() == 6
        && seed_relationships >= 306;

    let gds_available = gds::gds_procedure_count(client).await.unwrap_or_default() > 0;

    Ok(LiveGraphBackedEvidence {
        seed_baseline_ok,
        dataset_nodes,
        relation_registry_ok,
        gds_available,
    })
}

/// Refresh stale semantic embeddings when a Gemini key is configured.
/// Returns a human-readable status line. Empty string means there were
/// no nodes carrying an embedding yet (semantic indexing not started),
/// "skipped" means embeddings are present but `GEMINI_API_KEY` is not
/// set, "aligned" means everything is up to date.
pub async fn maybe_refresh_semantic_embeddings(client: &Neo4jClient) -> Result<String, String> {
    let rows = client
        .run(
            "MATCH (n:Bimba)
             WHERE n.c_5_embedding_version IS NOT NULL
             RETURN count(n) AS c",
        )
        .await
        .map_err(|e| format!("semantic index presence check failed: {}", e))?;
    let indexed_count: i64 = rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();
    if indexed_count == 0 {
        return Ok(String::new());
    }

    let config = match embeddings::EmbeddingConfig::from_env() {
        Ok(config) => config,
        Err(_) => return Ok("Semantic embeddings skipped: GEMINI_API_KEY not set".into()),
    };
    let embedder = embeddings::GeminiEmbeddingClient::new(config);
    let refreshed =
        semantic::refresh_stale_embeddings(client, &embedder, meta::EMBEDDING_VERSION).await?;
    if refreshed.is_empty() {
        Ok("Semantic embeddings already aligned".into())
    } else {
        Ok(format!(
            "Semantic embeddings refreshed for {} nodes: {}",
            refreshed.len(),
            refreshed.join(", ")
        ))
    }
}
