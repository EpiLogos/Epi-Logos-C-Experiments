use crate::graph::client::Neo4jClient;
use crate::graph::coordinate_array_parser::CoordinateArrayParser;
use crate::graph::relationship_manager::RelationshipManager;

pub struct SyncResult {
    pub coordinate: String,
    pub vault_path: String,
    pub relationships_created: usize,
}

pub struct SyncCoordinator<'a> {
    client: &'a Neo4jClient,
    rel_manager: RelationshipManager<'a>,
}

impl<'a> SyncCoordinator<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self {
            client,
            rel_manager: RelationshipManager::new(client),
        }
    }

    pub async fn sync_from_vault(
        &self,
        vault_path: &str,
        frontmatter: &serde_yaml::Value,
        _content: &str,
    ) -> Result<SyncResult, String> {
        let coord = frontmatter
            .get("coordinate")
            .and_then(|v| v.as_str())
            .ok_or("no coordinate in frontmatter")?;

        if !crate::vault::frontmatter::is_valid_coordinate(coord) {
            return Err(format!("invalid coordinate: {}", coord));
        }

        // Upsert node
        let escaped_path = vault_path.replace('\'', "\\'");
        let cypher = format!(
            "MERGE (n:Bimba {{coordinate: '{}'}}) \
             SET n.vault_path = '{}', n.updated_at = datetime() \
             RETURN n.coordinate AS coord",
            coord, escaped_path
        );
        self.client
            .run(&cypher)
            .await
            .map_err(|e| format!("upsert error: {}", e))?;

        // Set additional frontmatter properties
        if let Some(map) = frontmatter.as_mapping() {
            let skip_keys = ["coordinate"];
            for (key, value) in map {
                if let (Some(k), Some(v)) = (key.as_str(), value.as_str()) {
                    if !skip_keys.contains(&k) && !k.contains('_') {
                        let escaped_v = v.replace('\'', "\\'");
                        let set_cypher = format!(
                            "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
                            coord, k, escaped_v
                        );
                        let _ = self.client.run(&set_cypher).await;
                    }
                }
            }
        }

        // Parse coordinate arrays and create relationships
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(frontmatter);
        let mut rel_count = 0;
        for (key, links) in &arrays {
            let targets: Vec<String> = links.iter().map(|l| l.target.clone()).collect();
            let kv = vec![(key.clone(), targets)];
            rel_count += self
                .rel_manager
                .create_from_frontmatter(coord, &kv)
                .await?;
        }

        Ok(SyncResult {
            coordinate: coord.to_string(),
            vault_path: vault_path.to_string(),
            relationships_created: rel_count,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sync_result_fields() {
        let result = SyncResult {
            coordinate: "M5".into(),
            vault_path: "/test/path.md".into(),
            relationships_created: 3,
        };
        assert_eq!(result.coordinate, "M5");
        assert_eq!(result.relationships_created, 3);
    }

    #[test]
    fn test_invalid_coordinate_rejected() {
        // We can test the validation logic without Neo4j
        let yaml: serde_yaml::Value =
            serde_yaml::from_str("coordinate: \"INVALID\"").unwrap();
        let coord = yaml
            .get("coordinate")
            .and_then(|v| v.as_str())
            .unwrap();
        assert!(!crate::vault::frontmatter::is_valid_coordinate(coord));
    }

    #[test]
    fn test_valid_coordinate_accepted() {
        let yaml: serde_yaml::Value =
            serde_yaml::from_str("coordinate: \"M5\"").unwrap();
        let coord = yaml
            .get("coordinate")
            .and_then(|v| v.as_str())
            .unwrap();
        assert!(crate::vault::frontmatter::is_valid_coordinate(coord));
    }
}
