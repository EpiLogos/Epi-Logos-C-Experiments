use crate::graph::client::{Neo4jClient, Neo4jConfig};
use color_eyre::eyre::Result;
use neo4rs::query;
use serde_yaml::{Mapping, Value};
use std::time::Duration;

use super::types::{FacetItem, LensAlignment, RelationalFieldFacet};

/// Type alias for a parsed frontmatter YAML mapping.
pub type FrontmatterMap = Mapping;

/// Extract L-coordinate lens alignments from a parsed frontmatter map.
///
/// Reads the `l_alignments` sequence key and returns a `Vec<LensAlignment>`.
/// Entries that are missing required fields (`lens`, `lens_index`, `mode`) are
/// silently skipped — validation errors are the responsibility of the frontmatter
/// validator (`vault/frontmatter.rs`), not this extraction path.
///
/// Intended for use when ingesting vault documents into the knowledge graph so
/// that each alignment entry can become a Neo4j relation:
///   `(doc:BimbaNode)-[:HAS_LENS_ALIGNMENT {weight, sub_position, element, klein_square}]
///    ->(lens:LensNode {name, index, mode})`
pub fn extract_l_alignments(fm: &FrontmatterMap) -> Vec<LensAlignment> {
    let entries = match fm
        .get(Value::String("l_alignments".to_string()))
        .and_then(Value::as_sequence)
    {
        Some(seq) => seq,
        None => return Vec::new(),
    };

    entries
        .iter()
        .filter_map(|entry| {
            let map = entry.as_mapping()?;

            let get_str = |field: &str| -> Option<String> {
                map.get(Value::String(field.to_string()))
                    .and_then(Value::as_str)
                    .map(str::to_string)
            };
            let get_u8 = |field: &str| -> Option<u8> {
                map.get(Value::String(field.to_string()))
                    .and_then(Value::as_u64)
                    .and_then(|n| u8::try_from(n).ok())
            };
            let get_f64 = |field: &str| -> Option<f64> {
                map.get(Value::String(field.to_string()))
                    .and_then(|v| match v {
                        Value::Number(n) => n.as_f64(),
                        _ => None,
                    })
            };

            // Required fields — skip entry if absent
            let lens = get_str("lens")?;
            let lens_index = get_u8("lens_index")?;
            let mode = get_str("mode")?;

            // Optional: sub_position — may be a number or the string "BOTH"
            let sub_position: Option<u8> = get_u8("sub_position");

            // klein_square: sequence of strings
            let klein_square: Option<Vec<String>> = map
                .get(Value::String("klein_square".to_string()))
                .and_then(Value::as_sequence)
                .map(|seq| {
                    seq.iter()
                        .filter_map(|v| v.as_str().map(str::to_string))
                        .collect()
                });

            Some(LensAlignment {
                lens,
                lens_index,
                mode,
                sub_position,
                sub_name: get_str("sub_name"),
                weight: get_f64("weight"),
                element: get_str("element"),
                klein_square,
                complement: get_str("complement"),
                night_partner: get_str("night_partner"),
                populated_by: get_str("populated_by"),
                populated_at: get_str("populated_at"),
            })
        })
        .collect()
}

pub fn build_relational_field(coord: &str) -> RelationalFieldFacet {
    match try_build_relational_field(coord) {
        Ok(field) => field,
        Err(error) => RelationalFieldFacet {
            source: "graph-unavailable".to_string(),
            summary: Some(format!("Graph unavailable: {}", error)),
            constellation: Vec::new(),
            chain: Vec::new(),
            items: Vec::new(),
        },
    }
}

fn try_build_relational_field(coord: &str) -> Result<RelationalFieldFacet> {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config)?;

    let fetch_relations = async move {
        let constellation_rows = client
                .run_query(
                    query(
                        "MATCH (n:Bimba {coordinate: $coord})-[:BEDROCK]->(root)<-[:BEDROCK]-(peer:Bimba) \
                         RETURN DISTINCT peer.coordinate AS coord, peer.name AS name \
                         ORDER BY peer.coordinate",
                    )
                    .param("coord", coord.to_owned()),
                )
                .await?;

        let chain_rows = client
            .run_query(
                query(
                    "MATCH (n:Bimba {coordinate: $coord})-[r]->(m:Bimba) \
                         RETURN type(r) AS rel_type, m.coordinate AS coord \
                         UNION \
                         MATCH (m:Bimba)-[r]->(n:Bimba {coordinate: $coord}) \
                         RETURN type(r) AS rel_type, m.coordinate AS coord",
                )
                .param("coord", coord.to_owned()),
            )
            .await?;

        let constellation: Vec<FacetItem> = constellation_rows
            .iter()
            .map(|row| FacetItem {
                label: row.get::<String>("coord").unwrap_or_default(),
                detail: Some(row.get::<String>("name").unwrap_or_default()),
            })
            .collect();

        let chain: Vec<FacetItem> = chain_rows
            .iter()
            .map(|row| FacetItem {
                label: row.get::<String>("coord").unwrap_or_default(),
                detail: Some(row.get::<String>("rel_type").unwrap_or_default()),
            })
            .collect();

        let summary = if constellation.is_empty() && chain.is_empty() {
            "Graph connected, but no relational hits were found.".to_string()
        } else {
            format!(
                "Graph connected: {} constellation hits, {} chain links.",
                constellation.len(),
                chain.len()
            )
        };

        Ok(RelationalFieldFacet {
            source: "graph".to_string(),
            summary: Some(summary),
            items: chain.clone(),
            constellation,
            chain,
        })
    };
    let timed_fetch = async move {
        tokio::time::timeout(Duration::from_millis(750), fetch_relations)
            .await
            .map_err(|_| color_eyre::eyre::eyre!("graph query timed out"))?
    };

    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        tokio::task::block_in_place(|| handle.block_on(timed_fetch))
    } else {
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()?
            .block_on(timed_fetch)
    }
}
