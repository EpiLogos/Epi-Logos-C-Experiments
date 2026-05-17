use crate::CoordinateArrayParser;
use crate::Neo4jClient;
use crate::RelationshipManager;

/// Map a bare frontmatter key to its coordinate-driven canonical name.
/// Returns None for unknown keys (caller decides whether to skip).
fn canonical_frontmatter_key(key: &str) -> Option<&'static str> {
    Some(match key {
        "name" => "c_1_name",
        "description" => "c_1_description",
        "form" | "formulation" => "c_1_form",
        "structure" => "c_1_structure",
        "essence" => "c_0_essence",
        "core_nature" | "coreNature" => "c_0_core_nature",
        "family" => "c_4_family",
        "ql_position" => "c_4_ql_position",
        "layer" => "c_4_layer",
        "topo_mode" => "c_4_topo_mode",
        "vault_path" => "s_1_vault_path",
        _ => return None,
    })
}

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

        if !crate::CoordinateArrayParser::parse_one(coord).is_ok() {
            return Err(format!("invalid coordinate: {}", coord));
        }

        // Upsert node
        let escaped_path = vault_path.replace('\'', "\\'");
        let cypher = format!(
            "MERGE (n:Bimba {{coordinate: '{}'}}) \
             SET n.s_1_vault_path = '{}', n.c_3_updated_at = datetime() \
             RETURN n.coordinate AS coord",
            coord, escaped_path
        );
        self.client
            .run(&cypher)
            .await
            .map_err(|e| format!("upsert error: {}", e))?;

        // Set additional frontmatter properties, remapping bare keys to their
        // coordinate-driven canonical names.
        if let Some(map) = frontmatter.as_mapping() {
            let skip_keys = ["coordinate"];
            for (key, value) in map {
                if let (Some(k), Some(v)) = (key.as_str(), value.as_str()) {
                    if skip_keys.contains(&k) {
                        continue;
                    }
                    let canonical = canonical_frontmatter_key(k);
                    // Only persist keys we've explicitly mapped or that already follow the prefix.
                    let target_key = match canonical {
                        Some(canonical) => canonical,
                        None if k.starts_with("c_") || k.starts_with("s_") => k,
                        None => continue,
                    };
                    let escaped_v = v.replace('\'', "\\'");
                    let set_cypher = format!(
                        "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
                        coord, target_key, escaped_v
                    );
                    let _ = self.client.run(&set_cypher).await;
                }
            }
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
        assert!(!crate::CoordinateArrayParser::parse_one(coord).is_ok());
    }

    #[test]
    fn test_valid_coordinate_accepted() {
        let yaml: serde_yaml::Value = serde_yaml::from_str("coordinate: \"M5\"").unwrap();
        let coord = yaml.get("coordinate").and_then(|v| v.as_str()).unwrap();
        assert!(crate::CoordinateArrayParser::parse_one(coord).is_ok());
    }
}
