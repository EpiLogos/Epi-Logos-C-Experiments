use std::collections::BTreeMap;
use std::collections::BTreeSet;

use neo4rs::query;
use sha2::{Digest, Sha256};

use crate::meta;
use crate::GeminiEmbeddingClient;
use crate::Neo4jClient;
use crate::{kernel_coordinate_anchor_for, KernelCoordinateAnchor};

pub const EMBEDDING_VERSION: &str = meta::EMBEDDING_VERSION;

#[derive(Debug, Clone)]
pub struct SemanticDocument {
    pub coordinate: String,
    pub text: String,
    pub source_hash: String,
    pub q_properties: BTreeMap<String, String>,
    pub coordinate_anchor: KernelCoordinateAnchor,
}

impl SemanticDocument {
    #[allow(clippy::too_many_arguments)]
    pub fn from_coordinate_parts(
        coordinate: &str,
        name: &str,
        family: &str,
        layer: &str,
        ql_position: &str,
        essence: Option<&str>,
        description: Option<&str>,
        q_properties: BTreeMap<String, String>,
        outgoing: Vec<String>,
        incoming: Vec<String>,
    ) -> Result<Self, String> {
        Self::from_coordinate_parts_with_locality_excerpts(
            coordinate,
            name,
            family,
            layer,
            ql_position,
            essence,
            description,
            q_properties,
            BTreeMap::new(),
            outgoing,
            incoming,
        )
    }

    #[allow(clippy::too_many_arguments)]
    fn from_coordinate_parts_with_locality_excerpts(
        coordinate: &str,
        name: &str,
        family: &str,
        layer: &str,
        ql_position: &str,
        essence: Option<&str>,
        description: Option<&str>,
        q_properties: BTreeMap<String, String>,
        locality_excerpts: BTreeMap<String, String>,
        outgoing: Vec<String>,
        incoming: Vec<String>,
    ) -> Result<Self, String> {
        let coordinate_anchor = kernel_coordinate_anchor_for(coordinate)?;
        let mut lines = vec![
            format!("coordinate: {coordinate}"),
            format!("name: {name}"),
            format!("family: {family}"),
            format!("layer: {layer}"),
            format!("ql_position: {ql_position}"),
        ];

        if let Some(essence) = essence.filter(|value| !value.is_empty()) {
            lines.push(format!("essence: {essence}"));
        }
        if let Some(description) = description.filter(|value| !value.is_empty()) {
            lines.push(format!("description: {description}"));
        }

        lines.extend(ordered_q_property_lines(&q_properties, &locality_excerpts));

        lines.push("coordinate_anchor:".into());
        lines.push(format!(
            "kernel_source: {}",
            coordinate_anchor.kernel.source
        ));
        lines.push(format!(
            "kernel_projection: {}",
            coordinate_anchor.kernel.safe_projection
        ));
        lines.push(format!(
            "coordinate_reference_count: {}",
            coordinate_anchor
                .coordinate_reference_projection
                .reference_count
        ));
        if let Some(harmonic_pointer) = &coordinate_anchor.harmonic_pointer {
            lines.push(format!(
                "harmonic_profile: {}",
                harmonic_pointer.source_profile
            ));
            lines.push(format!(
                "harmonic_bedrock: {}/{}",
                harmonic_pointer.bedrock.psychoid_number,
                harmonic_pointer.bedrock.inverted_psychoid_number
            ));
            lines.push(format!(
                "harmonic_pointer_lens: {}",
                harmonic_pointer.pointer_anchor.lens_anchor
            ));
        }
        lines.push("coordinate_family_refs:".into());
        lines.extend(
            pointer_ref_values(
                &coordinate_anchor
                    .coordinate_reference_projection
                    .family_refs,
            )
            .into_iter()
            .map(|item| format!("- {item}")),
        );
        lines.push(format!(
            "qvdata_source: {}",
            coordinate_anchor.qvdata.source
        ));
        lines.push(format!(
            "qvdata_command: {}",
            coordinate_anchor.qvdata.command
        ));

        if !outgoing.is_empty() {
            lines.push("outgoing_relations:".into());
            lines.extend(outgoing.into_iter().map(|item| format!("- {item}")));
        }
        if !incoming.is_empty() {
            lines.push("incoming_relations:".into());
            lines.extend(incoming.into_iter().map(|item| format!("- {item}")));
        }

        let text = lines.join("\n");
        let source_hash = hash_text(&text);

        Ok(Self {
            coordinate: coordinate.to_owned(),
            text,
            source_hash,
            q_properties,
            coordinate_anchor,
        })
    }
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
                        coalesce(n.c_1_name, '') AS name,
                        coalesce(n.c_4_family, '') AS family,
                        coalesce(n.c_4_layer, '') AS layer,
                        coalesce(n.c_0_essence, '') AS essence,
                        coalesce(n.c_1_description, '') AS description,
                        coalesce(toString(n.c_4_ql_position), '') AS ql_position,
                        q_keys AS q_keys,
                        [k IN q_keys |
                            CASE
                              WHEN n[k] IS NULL THEN ''
                              WHEN valueType(n[k]) STARTS WITH 'LIST' THEN
                                '[' + reduce(acc = '', item IN n[k] |
                                  acc + CASE WHEN acc = '' THEN '' ELSE '; ' END + toString(item)
                                ) + ']'
                              ELSE toString(n[k])
                            END
                        ] AS q_values",
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

    let locality_excerpts = locality_signature_excerpts(client, coordinate).await?;
    let outgoing = relation_summaries(client, coordinate, true).await?;
    let incoming = relation_summaries(client, coordinate, false).await?;

    let essence: String = row.get("essence").unwrap_or_default();
    let description: String = row.get("description").unwrap_or_default();
    SemanticDocument::from_coordinate_parts_with_locality_excerpts(
        &row.get::<String>("coordinate").unwrap_or_default(),
        &row.get::<String>("name").unwrap_or_default(),
        &row.get::<String>("family").unwrap_or_default(),
        &row.get::<String>("layer").unwrap_or_default(),
        &row.get::<String>("ql_position").unwrap_or_default(),
        Some(essence.as_str()),
        Some(description.as_str()),
        q_properties,
        locality_excerpts,
        outgoing,
        incoming,
    )
}

pub async fn find_stale_nodes(
    client: &Neo4jClient,
    embedding_version: &str,
) -> Result<Vec<String>, String> {
    let rows = client
        .run(
            "MATCH (n:Bimba)
             RETURN n.coordinate AS coordinate,
                    n.c_5_source_hash AS semantic_source_hash,
                    n.c_5_embedding_version AS semantic_embedding_version,
                    n.c_5_embedding AS semantic_embedding
             ORDER BY coordinate",
        )
        .await
        .map_err(|e| format!("stale-node query failed: {}", e))?;

    let mut stale = Vec::new();
    for row in rows {
        let coordinate: String = row.get("coordinate").unwrap_or_default();
        if !is_semantic_anchor_coordinate(&coordinate) {
            continue;
        }
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
    // The write/index boundary. `GEMINI_EMBED_DIMS` is a matryoshka *request*
    // knob — 1536 and 768 stay generatable on purpose — but the vector index
    // below has ONE width, and a vector of any other width would be stored on
    // the node yet silently excluded from the index. Asked here rather than
    // after `embed` only so a refusal does not first burn a paid API call; the
    // contract it enforces is the `SET n.c_5_embedding` a few lines down. See
    // `embeddings`' module header.
    crate::embeddings::ensure_index_accepts_writes(client, embedder).await?;

    let doc = build_semantic_document(client, coordinate).await?;
    let embedding = embedder.embed(&doc.text).await?;
    let embedding: Vec<f64> = embedding.into_iter().map(f64::from).collect();

    client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coord})
                 SET n.c_5_document = $semantic_document,
                     n.c_5_source_hash = $semantic_source_hash,
                     n.c_5_embedding_version = $semantic_embedding_version,
                     n.c_5_embedding = $semantic_embedding,
                     n.c_5_indexed_at = datetime()",
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
             ELSE type(r) + ' -> ' + coalesce(m.coordinate, '') + ' :: ' + coalesce(m.c_1_name, '')
         END) AS rels"
    } else {
        "MATCH (n:Bimba {coordinate: $coord})
         OPTIONAL MATCH (m:Bimba)-[r]->(n)
         RETURN collect(DISTINCT CASE
             WHEN r IS NULL THEN NULL
             ELSE type(r) + ' <- ' + coalesce(m.coordinate, '') + ' :: ' + coalesce(m.c_1_name, '')
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

async fn locality_signature_excerpts(
    client: &Neo4jClient,
    coordinate: &str,
) -> Result<BTreeMap<String, String>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coord})-[r]-(neighbor:Bimba)
                 RETURN DISTINCT neighbor.coordinate AS coordinate,
                        coalesce(
                            neighbor.q_1_theoretical_thesis,
                            neighbor.c_0_essence,
                            neighbor.c_1_description,
                            neighbor.c_1_name,
                            ''
                        ) AS excerpt
                 ORDER BY coordinate
                 LIMIT 12",
            )
            .param("coord", coordinate),
        )
        .await
        .map_err(|e| format!("locality signature query failed: {}", e))?;

    Ok(rows
        .iter()
        .filter_map(|row| {
            let coordinate = row.get::<String>("coordinate").ok()?;
            let excerpt = row.get::<String>("excerpt").ok()?;
            (!coordinate.is_empty() && !excerpt.is_empty()).then_some((
                coordinate,
                truncate_utf8(&flatten_q_value(&excerpt), 160).to_string(),
            ))
        })
        .collect())
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
        .filter(|coordinate| is_semantic_anchor_coordinate(coordinate))
        .collect())
}

fn is_semantic_anchor_coordinate(coordinate: &str) -> bool {
    kernel_coordinate_anchor_for(coordinate).is_ok()
}

fn hash_text(text: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(text.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn ordered_q_property_lines(
    q_properties: &BTreeMap<String, String>,
    locality_excerpts: &BTreeMap<String, String>,
) -> Vec<String> {
    let mut entries: Vec<_> = q_properties
        .iter()
        .filter(|(_, value)| !value.is_empty())
        .collect();
    entries.sort_by(|(left, _), (right, _)| {
        q_property_sort_key(left).cmp(&q_property_sort_key(right))
    });

    entries
        .into_iter()
        .map(|(key, value)| {
            let mut flattened = flatten_q_value(value);
            if is_locality_signature_key(key) && !locality_excerpts.is_empty() {
                flattened.push_str(" | adjacent: ");
                flattened.push_str(
                    &locality_excerpts
                        .iter()
                        .map(|(coordinate, excerpt)| format!("{coordinate}={excerpt}"))
                        .collect::<Vec<_>>()
                        .join("; "),
                );
            }
            format!("{key}: {flattened}")
        })
        .collect()
}

fn q_property_sort_key(key: &str) -> (u8, u8, String) {
    let rest = key.strip_prefix("q_").unwrap_or(key);
    let mut chars = rest.chars();
    let position = chars
        .next()
        .and_then(|ch| ch.to_digit(10))
        .filter(|position| (1..=5).contains(position))
        .map(|position| position as u8)
        .unwrap_or(9);
    let phase = if rest.starts_with(&format!("{position}'")) {
        1
    } else {
        0
    };
    (position, phase, key.to_string())
}

fn is_locality_signature_key(key: &str) -> bool {
    key.ends_with("_locality_signature")
}

fn flatten_q_value(value: &str) -> String {
    value
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join(" | ")
}

fn truncate_utf8(value: &str, max_chars: usize) -> &str {
    if value.chars().count() <= max_chars {
        return value;
    }
    value
        .char_indices()
        .nth(max_chars)
        .map(|(index, _)| &value[..index])
        .unwrap_or(value)
}

fn pointer_ref_values(refs: &BTreeMap<String, String>) -> Vec<String> {
    refs.iter()
        .map(|(key, value)| format!("{key}={value}"))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_text_is_stable() {
        assert_eq!(hash_text("hello"), hash_text("hello"));
        assert_ne!(hash_text("hello"), hash_text("hello!"));
    }

    #[test]
    fn semantic_stale_scan_skips_family_meta_coordinates() {
        assert!(is_semantic_anchor_coordinate("M4"));
        assert!(is_semantic_anchor_coordinate("CF_FRACTAL"));
        assert!(!is_semantic_anchor_coordinate("Family_C"));
        assert!(!is_semantic_anchor_coordinate("Family_A"));
    }
}
