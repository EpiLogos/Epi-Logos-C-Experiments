use crate::CoordinateArrayParser;
use crate::Neo4jClient;
use neo4rs::query;

pub struct CoordinateRetrieval<'a> {
    client: &'a Neo4jClient,
}

/// Common Bimba return clause — aliased columns for neo4rs Row::get.
const BASE_RETURN: &str = "\
n.coordinate AS coordinate, \
n.name AS name, \
n.family AS family, \
n.layer AS layer, \
n.ql_position AS ql_position, \
n.uuid AS uuid";

impl<'a> CoordinateRetrieval<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /// Single coordinate lookup — validates via CoordinateArrayParser first.
    pub async fn query_by_coordinate(&self, coord: &str) -> Result<Vec<serde_json::Value>, String> {
        let _parsed = CoordinateArrayParser::parse_one(coord)?;
        let q = query(&format!(
            "MATCH (n:Bimba {{coordinate: $coord}}) RETURN {}",
            BASE_RETURN
        ))
        .param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// Multi-coordinate lookup.
    pub async fn query_multi(&self, coords: &[&str]) -> Result<Vec<serde_json::Value>, String> {
        // Validate every coordinate
        for c in coords {
            CoordinateArrayParser::parse_one(c)?;
        }
        // Match each requested coordinate explicitly; this avoids the flaky
        // `IN $coords` behavior we observed against the live Neo4j driver.
        let coord_list: Vec<String> = coords.iter().map(|c| c.to_string()).collect();
        let q = query(&format!(
            "UNWIND $coords AS coord \
             MATCH (n:Bimba {{coordinate: coord}}) \
             RETURN {}",
            BASE_RETURN
        ))
        .param("coords", coord_list);
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// N-hop context around a coordinate (depth capped at 4).
    pub async fn query_context(
        &self,
        coord: &str,
        depth: u32,
    ) -> Result<serde_json::Value, String> {
        let _parsed = CoordinateArrayParser::parse_one(coord)?;
        let depth = depth.min(4); // safety cap
        let cypher = format!(
            "MATCH (center:Bimba {{coordinate: $coord}}) \
             OPTIONAL MATCH path = (center)-[*1..{}]-(neighbor:Bimba) \
             RETURN center.coordinate AS center, \
                    collect(DISTINCT neighbor.coordinate) AS neighbors",
            depth
        );
        let q = query(&cypher).param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("context error: {}", e))?;
        if rows.is_empty() {
            return Err(format!("coordinate not found: {}", coord));
        }
        let center: String = rows[0].get("center").unwrap_or_default();
        let neighbors: Vec<String> = rows[0].get("neighbors").unwrap_or_default();
        let count = neighbors.len();
        Ok(serde_json::json!({
            "center": center,
            "depth": depth,
            "neighbors": neighbors,
            "neighbor_count": count,
        }))
    }

    /// All coordinates in a coordinate family.
    pub async fn query_by_family(&self, family: &str) -> Result<Vec<serde_json::Value>, String> {
        const VALID: &[&str] = &["C", "P", "L", "S", "T", "M", "NONE"];
        if !VALID.contains(&family) {
            return Err(format!("invalid family: {}", family));
        }
        let q = query(&format!(
            "MATCH (n:Bimba {{family: $fam}}) RETURN {} ORDER BY n.ql_position",
            BASE_RETURN
        ))
        .param("fam", family.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// Coordinates framed by a context-frame node (via FRAMES relationship).
    pub async fn query_by_cf(&self, cf_name: &str) -> Result<Vec<serde_json::Value>, String> {
        let q = query(&format!(
            "MATCH (cf:Bimba {{coordinate: $cf}})-[:FRAMES]->(n) RETURN {}",
            BASE_RETURN
        ))
        .param("cf", cf_name.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    fn row_to_json(row: &neo4rs::Row) -> serde_json::Value {
        let coord: String = row.get("coordinate").unwrap_or_default();
        let name: String = row.get("name").unwrap_or_default();
        let family: String = row.get("family").unwrap_or_default();
        let layer: String = row.get("layer").unwrap_or_default();
        let ql_pos: i64 = row.get("ql_position").unwrap_or(-1);
        let uuid: String = row.get("uuid").unwrap_or_default();

        serde_json::json!({
            "coordinate": coord,
            "name": name,
            "family": family,
            "layer": layer,
            "ql_position": ql_pos,
            "uuid": uuid,
        })
    }
}
