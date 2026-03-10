use crate::graph::client::{Neo4jClient, Neo4jConfig};
use color_eyre::eyre::Result;
use neo4rs::query;
use std::time::Duration;

use super::types::{FacetItem, RelationalFieldFacet};

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
