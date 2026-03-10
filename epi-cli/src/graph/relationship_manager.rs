use crate::graph::client::Neo4jClient;

/// Position-based relationship types: (position, forward, inverse)
pub const POSITION_REL_TYPES: &[(u8, &str, &str)] = &[
    (0, "POS0_LINKS_TO", "POS0_LINKED_FROM"),
    (1, "POS1_DEFINES", "POS1_DEFINED_BY"),
    (2, "POS2_OPERATES_VIA", "POS2_OPERATED_BY"),
    (3, "POS3_INSTANTIATES", "POS3_INSTANTIATED_BY"),
    (4, "POS4_SITUATED_IN", "POS4_SITUATES"),
    (5, "POS5_INTEGRATES_INTO", "POS5_INTEGRATED_FROM"),
];

pub struct RelationshipManager<'a> {
    client: &'a Neo4jClient,
}

impl<'a> RelationshipManager<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    /// Create a forward position-based relationship between two coordinates
    pub async fn create_position_rel(
        &self,
        source_coord: &str,
        target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, fwd, _) = POSITION_REL_TYPES
            .iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        let cypher = format!(
            "MATCH (s:Bimba {{coordinate: '{}'}}) \
             MATCH (t:Bimba {{coordinate: '{}'}}) \
             MERGE (s)-[:{}]->(t) \
             RETURN s.coordinate AS src, t.coordinate AS tgt",
            source_coord, target_coord, fwd
        );
        self.client
            .run(&cypher)
            .await
            .map_err(|e| format!("relationship error: {}", e))?;

        Ok(format!(
            "({}) -[:{}]-> ({})",
            source_coord, fwd, target_coord
        ))
    }

    /// Create bidirectional position relationship (forward + inverse)
    pub async fn create_bidirectional(
        &self,
        source_coord: &str,
        target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, fwd, inv) = POSITION_REL_TYPES
            .iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        let cypher = format!(
            "MATCH (s:Bimba {{coordinate: '{}'}}) \
             MATCH (t:Bimba {{coordinate: '{}'}}) \
             MERGE (s)-[:{}]->(t) \
             MERGE (t)-[:{}]->(s)",
            source_coord, target_coord, fwd, inv
        );
        self.client
            .run(&cypher)
            .await
            .map_err(|e| format!("bidirectional error: {}", e))?;

        Ok(format!(
            "({}) <-[:{}]-[:{}]-> ({})",
            source_coord, inv, fwd, target_coord
        ))
    }

    /// Create all position relationships from frontmatter coordinate arrays
    pub async fn create_from_frontmatter(
        &self,
        source_coord: &str,
        coord_keys: &[(String, Vec<String>)],
    ) -> Result<usize, String> {
        let mut count = 0;
        for (key, targets) in coord_keys {
            let parts: Vec<&str> = key.splitn(3, '_').collect();
            if parts.len() == 3 {
                if let Ok(pos) = parts[1].parse::<u8>() {
                    if pos <= 5 {
                        for target in targets {
                            self.create_position_rel(source_coord, target, pos).await?;
                            count += 1;
                        }
                    }
                }
            }
        }
        Ok(count)
    }

    /// Query relationships by type from a source
    pub async fn query_by_type(
        &self,
        source_coord: &str,
        rel_type: &str,
    ) -> Result<Vec<String>, String> {
        let cypher = format!(
            "MATCH (s:Bimba {{coordinate: '{}'}})-[:{}]->(t) \
             RETURN t.coordinate AS coord",
            source_coord, rel_type
        );
        let rows = self
            .client
            .run(&cypher)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows
            .iter()
            .filter_map(|r| r.get::<String>("coord").ok())
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_position_rel_types_complete() {
        assert_eq!(POSITION_REL_TYPES.len(), 6);
        for (pos, fwd, inv) in POSITION_REL_TYPES {
            assert!(*pos <= 5);
            assert!(fwd.starts_with("POS"));
            assert!(inv.starts_with("POS"));
        }
    }
}
