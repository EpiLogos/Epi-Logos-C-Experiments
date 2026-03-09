use crate::graph::client::Neo4jClient;
use crate::graph::coordinate_array_parser::CoordinateArrayParser;
use neo4rs::query;

/// Progressive disclosure levels — map to #0-#5 archetype positions.
///
/// Each level reveals more about a coordinate node, from a bare UUID
/// to the full holographic view including all relationships.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DisclosureLevel {
    /// #0 — Ground: UUID only (minimum token cost)
    UuidOnly = 0,
    /// #1 — Form: identity fields (coordinate, name, family, position)
    Identity = 1,
    /// #2 — Operation: summary with pithy description and layer
    Summary = 2,
    /// #3 — Pattern: full node properties
    Content = 3,
    /// #4 — Context: node + outgoing relationships
    Connected = 4,
    /// #5 — Integration: complete holographic view (node + in/out rels)
    Complete = 5,
}

impl DisclosureLevel {
    pub fn from_u8(n: u8) -> Self {
        match n {
            0 => Self::UuidOnly,
            1 => Self::Identity,
            2 => Self::Summary,
            3 => Self::Content,
            4 => Self::Connected,
            _ => Self::Complete,
        }
    }
}

pub struct GraphRAGRetriever<'a> {
    client: &'a Neo4jClient,
}

impl<'a> GraphRAGRetriever<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
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
            DisclosureLevel::UuidOnly => {
                "n.coordinate AS coordinate, n.uuid AS uuid"
            }
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
    fn extract_node_json(
        &self,
        row: &neo4rs::Row,
        level: DisclosureLevel,
    ) -> serde_json::Value {
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
}
