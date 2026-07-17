//! Coordinate: S2 (Bimba curation snapshot projection)
//! Residency: Body/S/S2/graph-services/src
//! Position (#n): 2 - graph substrate projection
//! Actualises: read-only, embedding-complete Bimba corpus extraction for
//!   higher-layer curation without accepting a caller-authored corpus.
//! Public surface: BimbaCurationSnapshot DTOs and
//!   `read_bimba_curation_snapshot`.
//! Does NOT own: Q-review detection, review decisions, proposal composition,
//!   scheduling, or any graph mutation.
//! Contract: [[S2-SPEC]] / [[S2-ARCHITECTURE]]

use std::collections::BTreeMap;

use neo4rs::query;
use serde::{Deserialize, Serialize};

use crate::{read_graph_meta, Neo4jClient};

const EMBEDDING_DIMENSIONS: usize = epi_s2_graph_schema::SEMANTIC_EMBEDDING_DIMENSIONS;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BimbaCurationSnapshot {
    pub graph_revision: u64,
    pub nodes: Vec<BimbaCurationNode>,
    pub canonical_relations: Vec<BimbaCurationRelation>,
    pub resonance_edges: Vec<BimbaCurationResonance>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BimbaCurationNode {
    pub coordinate: String,
    pub namespace: String,
    pub c_4_family: String,
    pub c_4_ql_position: String,
    pub c_4_lens: String,
    pub q_values: BTreeMap<String, String>,
    pub review_epochs: BTreeMap<String, u64>,
    pub embedding_3072: Vec<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BimbaCurationRelation {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub relation_family: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BimbaCurationResonance {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub confidence: f64,
    pub has_canonical_bimba_relation: bool,
    pub source_namespace: String,
    pub target_namespace: String,
}

/// Read only the semantically crystallised portion of `:Bimba`.
///
/// A Q-review detector compares vectors, so admitting a node without the
/// canonical 3072-dimensional embedding would turn an incomplete graph into
/// a fabricated review candidate. The absence is therefore explicit: these
/// nodes are outside this snapshot until S2 embedding materialisation catches
/// them up.
pub async fn read_bimba_curation_snapshot(
    client: &Neo4jClient,
) -> Result<BimbaCurationSnapshot, String> {
    let graph_revision = read_graph_meta(client)
        .await?
        .ok_or_else(|| "Bimba curation snapshot requires graph metadata".to_owned())?
        .graph_revision;
    let graph_revision = u64::try_from(graph_revision)
        .map_err(|_| "Bimba curation snapshot graph revision must be non-negative".to_owned())?;

    let nodes = read_nodes(client).await?;
    if nodes.is_empty() {
        return Err(format!(
            "Bimba curation snapshot requires at least one node with a {EMBEDDING_DIMENSIONS}-dimension embedding"
        ));
    }
    let canonical_relations = read_canonical_relations(client).await?;
    let resonance_edges = read_resonance_edges(client).await?;

    Ok(BimbaCurationSnapshot {
        graph_revision,
        nodes,
        canonical_relations,
        resonance_edges,
    })
}

async fn read_nodes(client: &Neo4jClient) -> Result<Vec<BimbaCurationNode>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba)
                 WHERE size(coalesce(n.c_5_embedding, [])) = $embedding_dimensions
                 WITH n,
                      [key IN keys(n) WHERE key STARTS WITH 'q_'] AS q_keys,
                      [key IN keys(n)
                       WHERE key STARTS WITH 'qm_' AND key CONTAINS 'review_epoch'] AS review_keys
                 RETURN n.coordinate AS coordinate,
                        coalesce(toString(n.c_4_family), '') AS c_4_family,
                        coalesce(toString(n.c_4_ql_position), '') AS c_4_ql_position,
                        coalesce(toString(n.c_4_lens), '') AS c_4_lens,
                        q_keys AS q_keys,
                        [key IN q_keys | coalesce(toString(n[key]), '')] AS q_values,
                        review_keys AS review_keys,
                        [key IN review_keys | coalesce(toString(n[key]), '0')] AS review_values,
                        n.c_5_embedding AS embedding_3072
                 ORDER BY coordinate",
            )
            .param("embedding_dimensions", EMBEDDING_DIMENSIONS as i64),
        )
        .await
        .map_err(|err| format!("Bimba curation node query failed: {err}"))?;

    rows.into_iter()
        .map(|row| {
            let coordinate = required_row_string(&row, "coordinate")?;
            let embedding_3072: Vec<f64> = row
                .get("embedding_3072")
                .map_err(|err| format!("Bimba curation node {coordinate} embedding read failed: {err}"))?;
            if embedding_3072.len() != EMBEDDING_DIMENSIONS {
                return Err(format!(
                    "Bimba curation node {coordinate} has {} embedding dimensions, expected {EMBEDDING_DIMENSIONS}",
                    embedding_3072.len()
                ));
            }
            Ok(BimbaCurationNode {
                coordinate,
                namespace: "bimba".to_owned(),
                c_4_family: row.get("c_4_family").unwrap_or_default(),
                c_4_ql_position: row.get("c_4_ql_position").unwrap_or_default(),
                c_4_lens: row.get("c_4_lens").unwrap_or_default(),
                q_values: string_pairs(
                    row.get("q_keys").unwrap_or_default(),
                    row.get("q_values").unwrap_or_default(),
                )?,
                review_epochs: review_epoch_pairs(
                    row.get("review_keys").unwrap_or_default(),
                    row.get("review_values").unwrap_or_default(),
                )?,
                embedding_3072,
            })
        })
        .collect()
}

async fn read_canonical_relations(
    client: &Neo4jClient,
) -> Result<Vec<BimbaCurationRelation>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (source:Bimba)-[relation]->(target:Bimba)
                 WHERE size(coalesce(source.c_5_embedding, [])) = $embedding_dimensions
                   AND size(coalesce(target.c_5_embedding, [])) = $embedding_dimensions
                   AND NOT type(relation) CONTAINS 'RESONANCE'
                 RETURN source.coordinate AS source_coordinate,
                        target.coordinate AS target_coordinate,
                        type(relation) AS relation_family
                 ORDER BY source_coordinate, target_coordinate, relation_family",
            )
            .param("embedding_dimensions", EMBEDDING_DIMENSIONS as i64),
        )
        .await
        .map_err(|err| format!("Bimba curation relation query failed: {err}"))?;

    rows.into_iter()
        .map(|row| {
            Ok(BimbaCurationRelation {
                source_coordinate: required_row_string(&row, "source_coordinate")?,
                target_coordinate: required_row_string(&row, "target_coordinate")?,
                relation_family: required_row_string(&row, "relation_family")?,
            })
        })
        .collect()
}

async fn read_resonance_edges(client: &Neo4jClient) -> Result<Vec<BimbaCurationResonance>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (source:Bimba)-[relation]->(target:Bimba)
                 WHERE size(coalesce(source.c_5_embedding, [])) = $embedding_dimensions
                   AND size(coalesce(target.c_5_embedding, [])) = $embedding_dimensions
                   AND type(relation) CONTAINS 'RESONANCE'
                 RETURN source.coordinate AS source_coordinate,
                        target.coordinate AS target_coordinate,
                        coalesce(toFloat(relation.c_5_confidence), toFloat(relation.confidence), 0.0) AS confidence,
                        EXISTS {
                          MATCH (source)-[canonical]->(target)
                          WHERE NOT type(canonical) CONTAINS 'RESONANCE'
                        } AS has_canonical_bimba_relation
                 ORDER BY source_coordinate, target_coordinate",
            )
            .param("embedding_dimensions", EMBEDDING_DIMENSIONS as i64),
        )
        .await
        .map_err(|err| format!("Bimba curation resonance query failed: {err}"))?;

    rows.into_iter()
        .map(|row| {
            Ok(BimbaCurationResonance {
                source_coordinate: required_row_string(&row, "source_coordinate")?,
                target_coordinate: required_row_string(&row, "target_coordinate")?,
                confidence: row.get("confidence").unwrap_or(0.0),
                has_canonical_bimba_relation: row
                    .get("has_canonical_bimba_relation")
                    .unwrap_or(false),
                source_namespace: "bimba".to_owned(),
                target_namespace: "bimba".to_owned(),
            })
        })
        .collect()
}

fn required_row_string(row: &neo4rs::Row, key: &str) -> Result<String, String> {
    let value: String = row
        .get(key)
        .map_err(|err| format!("Bimba curation row {key} read failed: {err}"))?;
    if value.trim().is_empty() {
        return Err(format!("Bimba curation row {key} is required"));
    }
    Ok(value)
}

fn string_pairs(
    keys: Vec<String>,
    values: Vec<String>,
) -> Result<BTreeMap<String, String>, String> {
    if keys.len() != values.len() {
        return Err("Bimba curation Q property keys and values have different lengths".to_owned());
    }
    Ok(keys.into_iter().zip(values).collect())
}

fn review_epoch_pairs(
    keys: Vec<String>,
    values: Vec<String>,
) -> Result<BTreeMap<String, u64>, String> {
    if keys.len() != values.len() {
        return Err(
            "Bimba curation review epoch keys and values have different lengths".to_owned(),
        );
    }
    keys.into_iter()
        .zip(values)
        .map(|(key, value)| {
            value
                .parse::<u64>()
                .map(|epoch| (key.clone(), epoch))
                .map_err(|err| {
                    format!("Bimba curation review epoch {key} is not an unsigned integer: {err}")
                })
        })
        .collect()
}
