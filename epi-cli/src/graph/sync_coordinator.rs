use std::collections::BTreeMap;

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

        // Set additional scalar frontmatter properties, including q_* metadata.
        for (key, value) in frontmatter_scalar_properties(frontmatter) {
            let escaped_v = value.replace('\'', "\\'");
            let set_cypher = format!(
                "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
                coord, key, escaped_v
            );
            let _ = self.client.run(&set_cypher).await;
        }

        // Parse coordinate arrays and create relationships
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(frontmatter);
        let mut rel_count = 0;
        for (key, links) in &arrays {
            let targets: Vec<String> = links.iter().map(|l| l.target.clone()).collect();
            let kv = vec![(key.clone(), targets)];
            rel_count += self.rel_manager.create_from_frontmatter(coord, &kv).await?;
        }

        Ok(SyncResult {
            coordinate: coord.to_string(),
            vault_path: vault_path.to_string(),
            relationships_created: rel_count,
        })
    }
}

pub fn frontmatter_scalar_properties(frontmatter: &serde_yaml::Value) -> BTreeMap<String, String> {
    let mut props = BTreeMap::new();
    let Some(map) = frontmatter.as_mapping() else {
        return props;
    };

    for (key, value) in map {
        let (Some(key), Some(value)) = (key.as_str(), value.as_str()) else {
            continue;
        };
        if key == "coordinate" {
            continue;
        }
        if should_promote_scalar_property(key) {
            props.insert(key.to_string(), value.to_string());
        }
    }

    props
}

fn should_promote_scalar_property(key: &str) -> bool {
    const ALLOWED_METADATA_KEYS: &[&str] = &[
        "family",
        "artifact_role",
        "ctx_type",
        "invocation_profile",
        "source_coordinate",
        "parent_day_id",
        "now_id",
        "day_id",
        "session_id",
        "parent_session_id",
        "created_at",
        "updated_at",
        "merged_at",
        "merge_reason",
        "invocation_kind",
        "thought_type",
    ];

    !key.contains('_') || key.starts_with("q_") || ALLOWED_METADATA_KEYS.contains(&key)
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
        let yaml: serde_yaml::Value = serde_yaml::from_str("coordinate: \"INVALID\"").unwrap();
        let coord = yaml.get("coordinate").and_then(|v| v.as_str()).unwrap();
        assert!(!crate::vault::frontmatter::is_valid_coordinate(coord));
    }

    #[test]
    fn test_valid_coordinate_accepted() {
        let yaml: serde_yaml::Value = serde_yaml::from_str("coordinate: \"M5\"").unwrap();
        let coord = yaml.get("coordinate").and_then(|v| v.as_str()).unwrap();
        assert!(crate::vault::frontmatter::is_valid_coordinate(coord));
    }
}
