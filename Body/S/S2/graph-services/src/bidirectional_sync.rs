use crate::Neo4jClient;

#[derive(Debug, Clone)]
pub enum ConflictResolution {
    VaultWins,
    GraphWins,
    MostRecent,
    Manual,
    Merge,
    Skip,
}

impl ConflictResolution {
    pub fn from_str(s: &str) -> Self {
        match s {
            "vault-wins" => Self::VaultWins,
            "graph-wins" => Self::GraphWins,
            "most-recent" => Self::MostRecent,
            "manual" => Self::Manual,
            "merge" => Self::Merge,
            _ => Self::Skip,
        }
    }
}

pub struct SyncConflict {
    pub coordinate: String,
    pub property: String,
    pub vault_value: String,
    pub graph_value: String,
    /// Vault-side `dcterms_modified` / `c_3_created_at` (CCT-16 iv).
    pub vault_modified: Option<String>,
    /// Graph-side `dcterms_modified` / `c_3_created_at` (CCT-16 iv).
    pub graph_modified: Option<String>,
}

/// CCT-16 (iv): the canonical `MostRecent` picker — ISO-8601 timestamps
/// compare lexicographically; a side missing its timestamp loses to a side
/// that has one; both missing is a refusal, never a guess.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MostRecentWinner {
    Vault,
    Graph,
}

pub fn most_recent_winner(
    vault_modified: Option<&str>,
    graph_modified: Option<&str>,
) -> Result<MostRecentWinner, String> {
    match (vault_modified, graph_modified) {
        (Some(vault), Some(graph)) => Ok(if vault > graph {
            MostRecentWinner::Vault
        } else {
            MostRecentWinner::Graph
        }),
        (Some(_), None) => Ok(MostRecentWinner::Vault),
        (None, Some(_)) => Ok(MostRecentWinner::Graph),
        (None, None) => Err(
            "most-recent needs a dcterms_modified / c_3_created_at timestamp on at least one side"
                .to_owned(),
        ),
    }
}

pub struct BidirectionalSyncer<'a> {
    client: &'a Neo4jClient,
}

impl<'a> BidirectionalSyncer<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub async fn detect_conflicts(
        &self,
        coord: &str,
        vault_frontmatter: &serde_yaml::Value,
    ) -> Result<Vec<SyncConflict>, String> {
        let cypher = format!(
            "MATCH (n:Bimba {{coordinate: '{}'}}) \
             RETURN n.c_1_name AS name, n.c_4_family AS family, n.c_4_ql_position AS ql_position, \
                    coalesce(n.dcterms_modified, n.c_3_created_at) AS graph_modified",
            coord
        );
        let rows = self
            .client
            .run(&cypher)
            .await
            .map_err(|e| format!("conflict check: {}", e))?;

        if rows.is_empty() {
            return Ok(vec![]); // no conflicts if node doesn't exist yet
        }

        let mut conflicts = Vec::new();
        let row = &rows[0];
        let graph_modified = row.get::<String>("graph_modified").ok();
        let vault_modified = ["dcterms_modified", "c_3_created_at"]
            .iter()
            .find_map(|key| {
                vault_frontmatter
                    .get(*key)
                    .and_then(|v| v.as_str())
                    .map(str::to_owned)
            });

        // Check name
        if let Some(vault_name) = vault_frontmatter.get("name").and_then(|v| v.as_str()) {
            if let Ok(graph_name) = row.get::<String>("name") {
                if vault_name != graph_name {
                    conflicts.push(SyncConflict {
                        coordinate: coord.to_string(),
                        property: "c_1_name".to_string(),
                        vault_value: vault_name.to_string(),
                        graph_value: graph_name,
                        vault_modified: vault_modified.clone(),
                        graph_modified: graph_modified.clone(),
                    });
                }
            }
        }

        Ok(conflicts)
    }

    pub async fn resolve(
        &self,
        conflict: &SyncConflict,
        strategy: &ConflictResolution,
    ) -> Result<String, String> {
        match strategy {
            ConflictResolution::VaultWins => {
                let escaped = conflict.vault_value.replace('\'', "\\'");
                let cypher = format!(
                    "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
                    conflict.coordinate, conflict.property, escaped
                );
                self.client
                    .run(&cypher)
                    .await
                    .map_err(|e| format!("resolve error: {}", e))?;
                Ok(format!(
                    "vault wins: {}.{} = '{}'",
                    conflict.coordinate, conflict.property, conflict.vault_value
                ))
            }
            ConflictResolution::GraphWins => Ok(format!(
                "graph wins: {}.{} kept as '{}'",
                conflict.coordinate, conflict.property, conflict.graph_value
            )),
            ConflictResolution::Skip => Ok(format!(
                "skipped: {}.{}",
                conflict.coordinate, conflict.property
            )),
            // CCT-16 (iv): the graph → vault return-path floor. Vault newer
            // → the vault value writes through to the graph; graph newer →
            // the graph value is reported as the winner for the caller to
            // write back into the vault Form.
            ConflictResolution::MostRecent => {
                match most_recent_winner(
                    conflict.vault_modified.as_deref(),
                    conflict.graph_modified.as_deref(),
                )? {
                    MostRecentWinner::Vault => {
                        let escaped = conflict.vault_value.replace('\'', "\\'");
                        let cypher = format!(
                            "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
                            conflict.coordinate, conflict.property, escaped
                        );
                        self.client
                            .run(&cypher)
                            .await
                            .map_err(|e| format!("resolve error: {}", e))?;
                        Ok(format!(
                            "most-recent: vault wins: {}.{} = '{}'",
                            conflict.coordinate, conflict.property, conflict.vault_value
                        ))
                    }
                    MostRecentWinner::Graph => Ok(format!(
                        "most-recent: graph wins: {}.{} = '{}' (write this back into the vault Form)",
                        conflict.coordinate, conflict.property, conflict.graph_value
                    )),
                }
            }
            _ => Err("resolution strategy not yet implemented".into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conflict_resolution_from_str() {
        assert!(matches!(
            ConflictResolution::from_str("vault-wins"),
            ConflictResolution::VaultWins
        ));
        assert!(matches!(
            ConflictResolution::from_str("graph-wins"),
            ConflictResolution::GraphWins
        ));
        assert!(matches!(
            ConflictResolution::from_str("most-recent"),
            ConflictResolution::MostRecent
        ));
        assert!(matches!(
            ConflictResolution::from_str("manual"),
            ConflictResolution::Manual
        ));
        assert!(matches!(
            ConflictResolution::from_str("merge"),
            ConflictResolution::Merge
        ));
        assert!(matches!(
            ConflictResolution::from_str("unknown"),
            ConflictResolution::Skip
        ));
        assert!(matches!(
            ConflictResolution::from_str(""),
            ConflictResolution::Skip
        ));
    }

    #[test]
    fn test_sync_conflict_fields() {
        let conflict = SyncConflict {
            coordinate: "M5".into(),
            property: "c_1_name".into(),
            vault_value: "Epii".into(),
            graph_value: "epii".into(),
            vault_modified: Some("2026-07-11T10:00:00Z".into()),
            graph_modified: None,
        };
        assert_eq!(conflict.coordinate, "M5");
        assert_eq!(conflict.property, "c_1_name");
        assert_eq!(conflict.vault_value, "Epii");
        assert_eq!(conflict.graph_value, "epii");
        assert_eq!(
            most_recent_winner(
                conflict.vault_modified.as_deref(),
                conflict.graph_modified.as_deref()
            )
            .unwrap(),
            MostRecentWinner::Vault
        );
    }
}
