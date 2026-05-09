use crate::retrieval::hybrid::{HybridRetriever, RetrievalMode};
use crate::Neo4jClient;
use crate::{
    classify_query, disclosure_for_query_type, extract_coordinate_mentions, infer_positions,
    CoordinateArrayParser,
};
pub use crate::{DisclosureLevel, QueryType};
use neo4rs::query;

pub struct GraphRAGRetriever<'a> {
    client: &'a Neo4jClient,
}

impl<'a> GraphRAGRetriever<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub fn classify_query(query_text: &str) -> QueryType {
        classify_query(query_text)
    }

    pub fn extract_coordinate_mentions(query_text: &str) -> Vec<String> {
        extract_coordinate_mentions(query_text)
    }

    pub fn infer_positions(query_text: &str) -> Vec<u8> {
        infer_positions(query_text)
    }

    pub async fn retrieve(
        &self,
        query_text: &str,
        depth: Option<u32>,
        top_k: Option<usize>,
    ) -> Result<serde_json::Value, String> {
        let query_type = Self::classify_query(query_text);
        let coordinate_mentions = Self::extract_coordinate_mentions(query_text);
        let inferred_positions = Self::infer_positions(query_text);
        let disclosure_level = disclosure_for_query_type(query_type, depth.unwrap_or(1));
        let context_depth = depth.unwrap_or(1).clamp(1, 4);
        let result_limit = top_k.unwrap_or(10).clamp(1, 25);
        let mut results = Vec::new();

        if !coordinate_mentions.is_empty() {
            for coord in coordinate_mentions.iter().take(result_limit) {
                let mut item = self.progressive_disclosure(coord, disclosure_level).await?;
                if context_depth > 1 {
                    item["context"] = self.context_for(coord, context_depth).await?;
                }
                results.push(item);
            }
        } else {
            let hybrid = HybridRetriever::new(self.client);
            let ranked = hybrid
                .retrieve(query_text, RetrievalMode::GraphOnly, Some(result_limit))
                .await?;
            for item in ranked.into_iter().take(result_limit) {
                let coordinate = item.coordinate.clone();
                let mut disclosed = self
                    .progressive_disclosure(&coordinate, disclosure_level)
                    .await?;
                disclosed["retrieval_score"] = serde_json::json!(item.score);
                disclosed["retrieval_source"] = serde_json::json!(item.source);
                if context_depth > 1 {
                    disclosed["context"] = self.context_for(&coordinate, context_depth).await?;
                }
                results.push(disclosed);
            }
        }

        Ok(serde_json::json!({
            "query": query_text,
            "query_type": query_type.as_str(),
            "detected_coordinates": coordinate_mentions,
            "inferred_positions": inferred_positions,
            "depth": context_depth,
            "results": results,
        }))
    }

    /// Retrieve a coordinate at the specified disclosure level.
    ///
    /// Lower levels return fewer properties (cheaper for context windows);
    /// higher levels include relationships and full metadata.
    pub async fn progressive_disclosure(
        &self,
        coord: &str,
        level: DisclosureLevel,
    ) -> Result<serde_json::Value, String> {
        // Validate the coordinate string
        let _parsed = CoordinateArrayParser::parse_one(coord)?;

        // Build RETURN clause based on disclosure level
        let return_clause = match level {
            DisclosureLevel::UuidOnly => "n.coordinate AS coordinate, n.uuid AS uuid",
            DisclosureLevel::Identity => {
                "n.coordinate AS coordinate, n.uuid AS uuid, \
                 n.name AS name, n.family AS family, \
                 n.ql_position AS ql_position, n.vault_path AS vault_path"
            }
            DisclosureLevel::Summary => {
                "n.coordinate AS coordinate, n.uuid AS uuid, \
                 n.name AS name, n.family AS family, \
                 n.ql_position AS ql_position, n.vault_path AS vault_path, \
                 n.s0_pithy AS s0_pithy, n.layer AS layer"
            }
            // Content / Connected / Complete all fetch the same node props;
            // Connected + Complete additionally query relationships below.
            _ => {
                "n.coordinate AS coordinate, n.uuid AS uuid, \
                 n.name AS name, n.family AS family, \
                 n.ql_position AS ql_position, n.vault_path AS vault_path, \
                 n.s0_pithy AS s0_pithy, n.layer AS layer, \
                 n.topo_mode AS topo_mode, n.flags AS flags, \
                 n.inversion_state AS inversion_state"
            }
        };

        let cypher = format!(
            "MATCH (n:Bimba {{coordinate: $coord}}) RETURN {}",
            return_clause
        );
        let q = query(&cypher).param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("disclosure error: {}", e))?;

        if rows.is_empty() {
            return Err(format!("coordinate not found: {}", coord));
        }

        let row = &rows[0];
        let mut result = self.extract_node_json(row, level);

        // Add disclosure_level metadata
        result["disclosure_level"] = serde_json::json!(level as u8);

        // Connected (#4): add outgoing relationships
        if level as u8 >= DisclosureLevel::Connected as u8 {
            let rels = self.fetch_relationships(coord, false).await?;
            result["relationships_out"] = rels;
        }

        // Complete (#5): also add incoming relationships
        if level as u8 >= DisclosureLevel::Complete as u8 {
            let rels_in = self.fetch_relationships(coord, true).await?;
            result["relationships_in"] = rels_in;
        }

        Ok(result)
    }

    /// Batch progressive disclosure for multiple coordinates at the same level.
    pub async fn progressive_disclosure_batch(
        &self,
        coords: &[&str],
        level: DisclosureLevel,
    ) -> Result<Vec<serde_json::Value>, String> {
        let mut results = Vec::with_capacity(coords.len());
        for coord in coords {
            results.push(self.progressive_disclosure(coord, level).await?);
        }
        Ok(results)
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /// Extract JSON fields from a row based on disclosure level.
    fn extract_node_json(&self, row: &neo4rs::Row, level: DisclosureLevel) -> serde_json::Value {
        let coord: String = row.get("coordinate").unwrap_or_default();
        let uuid: String = row.get("uuid").unwrap_or_default();

        if level == DisclosureLevel::UuidOnly {
            return serde_json::json!({
                "coordinate": coord,
                "uuid": uuid,
            });
        }

        let name: String = row.get("name").unwrap_or_default();
        let family: String = row.get("family").unwrap_or_default();
        let ql_pos: i64 = row.get("ql_position").unwrap_or(-1);
        let vault_path: String = row.get("vault_path").unwrap_or_default();

        if level == DisclosureLevel::Identity {
            return serde_json::json!({
                "coordinate": coord,
                "uuid": uuid,
                "name": name,
                "family": family,
                "ql_position": ql_pos,
                "vault_path": vault_path,
            });
        }

        let s0_pithy: String = row.get("s0_pithy").unwrap_or_default();
        let layer: String = row.get("layer").unwrap_or_default();

        if level == DisclosureLevel::Summary {
            return serde_json::json!({
                "coordinate": coord,
                "uuid": uuid,
                "name": name,
                "family": family,
                "ql_position": ql_pos,
                "vault_path": vault_path,
                "s0_pithy": s0_pithy,
                "layer": layer,
            });
        }

        // Content / Connected / Complete
        let topo_mode: String = row.get("topo_mode").unwrap_or_default();
        let flags: i64 = row.get("flags").unwrap_or(0);
        let inversion_state: i64 = row.get("inversion_state").unwrap_or(0);

        serde_json::json!({
            "coordinate": coord,
            "uuid": uuid,
            "name": name,
            "family": family,
            "ql_position": ql_pos,
            "vault_path": vault_path,
            "s0_pithy": s0_pithy,
            "layer": layer,
            "topo_mode": topo_mode,
            "flags": flags,
            "inversion_state": inversion_state,
        })
    }

    /// Fetch relationships for a coordinate.
    /// `incoming = false` => outgoing rels; `incoming = true` => incoming rels.
    async fn fetch_relationships(
        &self,
        coord: &str,
        incoming: bool,
    ) -> Result<serde_json::Value, String> {
        let cypher = if incoming {
            "MATCH (m:Bimba)-[r]->(n:Bimba {coordinate: $coord}) \
             RETURN type(r) AS rel_type, m.coordinate AS other"
        } else {
            "MATCH (n:Bimba {coordinate: $coord})-[r]->(m:Bimba) \
             RETURN type(r) AS rel_type, m.coordinate AS other"
        };

        let q = query(cypher).param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("rel error: {}", e))?;

        let rels: Vec<serde_json::Value> = rows
            .iter()
            .map(|r| {
                let rel_type: String = r.get("rel_type").unwrap_or_default();
                let other: String = r.get("other").unwrap_or_default();
                serde_json::json!({
                    "type": rel_type,
                    "coordinate": other,
                })
            })
            .collect();

        Ok(serde_json::json!(rels))
    }

    async fn context_for(&self, coord: &str, depth: u32) -> Result<serde_json::Value, String> {
        let cypher = format!(
            "MATCH (center:Bimba {{coordinate: $coord}})
             OPTIONAL MATCH path = (center)-[*1..{}]-(neighbor:Bimba)
             RETURN center.coordinate AS center,
                    collect(DISTINCT neighbor.coordinate) AS neighbors",
            depth.min(4)
        );
        let q = query(&cypher).param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("context error: {}", e))?;
        if rows.is_empty() {
            return Ok(serde_json::json!({
                "center": coord,
                "depth": depth,
                "neighbors": [],
                "neighbor_count": 0,
            }));
        }

        let center: String = rows[0].get("center").unwrap_or_default();
        let neighbors: Vec<String> = rows[0].get("neighbors").unwrap_or_default();
        Ok(serde_json::json!({
            "center": center,
            "depth": depth,
            "neighbors": neighbors,
            "neighbor_count": neighbors.len(),
        }))
    }
}
