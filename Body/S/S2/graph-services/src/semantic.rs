use std::collections::BTreeMap;
use std::collections::BTreeSet;

use neo4rs::query;
use sha2::{Digest, Sha256};

use crate::meta;
use crate::GeminiEmbeddingClient;
use crate::Neo4jClient;

pub const EMBEDDING_VERSION: &str = meta::EMBEDDING_VERSION;

#[derive(Debug, Clone)]
pub struct SemanticDocument {
    pub coordinate: String,
    pub text: String,
    pub source_hash: String,
    pub q_properties: BTreeMap<String, String>,
}

pub async fn build_semantic_document(
    client: &Neo4jClient,
    coordinate: &str,
) -> Result<SemanticDocument, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coord})
                 WITH n, [k IN keys(n) WHERE k STARTS WITH 'q_'] AS q_keys
                 RETURN n.coordinate AS coordinate,
                        coalesce(n.name, '') AS name,
                        coalesce(n.family, '') AS family,
                        coalesce(n.layer, '') AS layer,
                        coalesce(n.essence, '') AS essence,
                        coalesce(n.description, '') AS description,
                        coalesce(toString(n.ql_position), '') AS ql_position,
                        q_keys AS q_keys,
                        [k IN q_keys | coalesce(toString(n[k]), '')] AS q_values",
            )
            .param("coord", coordinate),
        )
        .await
        .map_err(|e| format!("semantic document query failed: {}", e))?;

    let Some(row) = rows.first() else {
        return Err(format!("coordinate not found: {}", coordinate));
    };

    let mut q_properties = BTreeMap::new();
    let q_keys: Vec<String> = row.get("q_keys").unwrap_or_default();
    let q_values: Vec<String> = row.get("q_values").unwrap_or_default();
    for (key, value) in q_keys.into_iter().zip(q_values) {
        q_properties.insert(key, value);
    }

    let outgoing = relation_summaries(client, coordinate, true).await?;
    let incoming = relation_summaries(client, coordinate, false).await?;

    let mut lines = vec![
        format!(
            "coordinate: {}",
            row.get::<String>("coordinate").unwrap_or_default()
        ),
        format!("name: {}", row.get::<String>("name").unwrap_or_default()),
        format!(
            "family: {}",
            row.get::<String>("family").unwrap_or_default()
        ),
        format!("layer: {}", row.get::<String>("layer").unwrap_or_default()),
        format!(
            "ql_position: {}",
            row.get::<String>("ql_position").unwrap_or_default()
        ),
    ];

    let essence: String = row.get("essence").unwrap_or_default();
    if !essence.is_empty() {
        lines.push(format!("essence: {}", essence));
    }
    let description: String = row.get("description").unwrap_or_default();
    if !description.is_empty() {
        lines.push(format!("description: {}", description));
    }

    for (key, value) in &q_properties {
        if !value.is_empty() {
            lines.push(format!("{}: {}", key, value));
        }
    }

    if !outgoing.is_empty() {
        lines.push("outgoing_relations:".into());
        lines.extend(outgoing.into_iter().map(|item| format!("- {}", item)));
    }
    if !incoming.is_empty() {
        lines.push("incoming_relations:".into());
        lines.extend(incoming.into_iter().map(|item| format!("- {}", item)));
    }

    let text = lines.join("\n");
    let source_hash = hash_text(&text);

    Ok(SemanticDocument {
        coordinate: coordinate.to_string(),
        text,
        source_hash,
        q_properties,
    })
}

pub async fn find_stale_nodes(
    client: &Neo4jClient,
    embedding_version: &str,
) -> Result<Vec<String>, String> {
    let rows = client
        .run(
            "MATCH (n:Bimba)
             RETURN n.coordinate AS coordinate,
                    n.semantic_source_hash AS semantic_source_hash,
                    n.semantic_embedding_version AS semantic_embedding_version,
                    n.semantic_embedding AS semantic_embedding
             ORDER BY coordinate",
        )
        .await
        .map_err(|e| format!("stale-node query failed: {}", e))?;

    let mut stale = Vec::new();
    for row in rows {
        let coordinate: String = row.get("coordinate").unwrap_or_default();
        let current_hash: String = row.get("semantic_source_hash").unwrap_or_default();
        let current_version: String = row.get("semantic_embedding_version").unwrap_or_default();
        let current_embedding: Vec<f64> = row.get("semantic_embedding").unwrap_or_default();
        let doc = build_semantic_document(client, &coordinate).await?;

        if current_hash != doc.source_hash
            || current_version != embedding_version
            || current_embedding.is_empty()
        {
            stale.push(coordinate);
        }
    }
    Ok(stale)
}

pub async fn find_stale_nodes_with_dependents(
    client: &Neo4jClient,
    embedding_version: &str,
) -> Result<Vec<String>, String> {
    let stale = find_stale_nodes(client, embedding_version).await?;
    if stale.is_empty() {
        return Ok(stale);
    }

    let mut expanded: BTreeSet<String> = stale.iter().cloned().collect();
    for coordinate in stale {
        for neighbor in adjacent_coordinates(client, &coordinate).await? {
            expanded.insert(neighbor);
        }
    }
    Ok(expanded.into_iter().collect())
}

pub async fn refresh_coordinate_embedding(
    client: &Neo4jClient,
    coordinate: &str,
    embedder: &GeminiEmbeddingClient,
    embedding_version: &str,
) -> Result<SemanticDocument, String> {
    let doc = build_semantic_document(client, coordinate).await?;
    let embedding = embedder.embed(&doc.text).await?;
    let embedding: Vec<f64> = embedding.into_iter().map(f64::from).collect();

    client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coord})
                 SET n.semantic_document = $semantic_document,
                     n.semantic_source_hash = $semantic_source_hash,
                     n.semantic_embedding_version = $semantic_embedding_version,
                     n.semantic_embedding = $semantic_embedding,
                     n.semantic_indexed_at = datetime()",
            )
            .param("coord", coordinate)
            .param("semantic_document", doc.text.as_str())
            .param("semantic_source_hash", doc.source_hash.as_str())
            .param("semantic_embedding_version", embedding_version)
            .param("semantic_embedding", embedding),
        )
        .await
        .map_err(|e| format!("semantic embedding refresh failed: {}", e))?;

    Ok(doc)
}

pub async fn refresh_stale_embeddings(
    client: &Neo4jClient,
    embedder: &GeminiEmbeddingClient,
    embedding_version: &str,
) -> Result<Vec<String>, String> {
    let stale = find_stale_nodes_with_dependents(client, embedding_version).await?;
    for coordinate in &stale {
        refresh_coordinate_embedding(client, coordinate, embedder, embedding_version).await?;
    }
    Ok(stale)
}

async fn relation_summaries(
    client: &Neo4jClient,
    coordinate: &str,
    outgoing: bool,
) -> Result<Vec<String>, String> {
    let cypher = if outgoing {
        "MATCH (n:Bimba {coordinate: $coord})
         OPTIONAL MATCH (n)-[r]->(m:Bimba)
         RETURN collect(DISTINCT CASE
             WHEN r IS NULL THEN NULL
             ELSE type(r) + ' -> ' + coalesce(m.coordinate, '') + ' :: ' + coalesce(m.name, '')
         END) AS rels"
    } else {
        "MATCH (n:Bimba {coordinate: $coord})
         OPTIONAL MATCH (m:Bimba)-[r]->(n)
         RETURN collect(DISTINCT CASE
             WHEN r IS NULL THEN NULL
             ELSE type(r) + ' <- ' + coalesce(m.coordinate, '') + ' :: ' + coalesce(m.name, '')
         END) AS rels"
    };

    let rows = client
        .run_query(query(cypher).param("coord", coordinate))
        .await
        .map_err(|e| format!("relation query failed: {}", e))?;
    let rels: Vec<Option<String>> = rows
        .first()
        .and_then(|row| row.get("rels").ok())
        .unwrap_or_default();
    let mut rels: Vec<String> = rels.into_iter().flatten().collect();
    rels.sort();
    Ok(rels)
}

async fn adjacent_coordinates(
    client: &Neo4jClient,
    coordinate: &str,
) -> Result<Vec<String>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coord})-[*1]-(neighbor:Bimba)
                 RETURN DISTINCT neighbor.coordinate AS coordinate
                 ORDER BY coordinate",
            )
            .param("coord", coordinate),
        )
        .await
        .map_err(|e| format!("adjacent-coordinate query failed: {}", e))?;
    Ok(rows
        .iter()
        .filter_map(|row| row.get::<String>("coordinate").ok())
        .collect())
}

fn hash_text(text: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(text.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_text_is_stable() {
        assert_eq!(hash_text("hello"), hash_text("hello"));
        assert_ne!(hash_text("hello"), hash_text("hello!"));
    }
}
