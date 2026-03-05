use super::types::*;
use super::client::Neo4jClient;

pub struct GraphAPI {
    neo4j: Option<Neo4jClient>,
    vault_path: String,
}

impl GraphAPI {
    pub fn new(neo4j_client: Option<Neo4jClient>, vault_path: Option<String>) -> Self {
        Self {
            neo4j: neo4j_client,
            vault_path: vault_path.unwrap_or_else(|| {
                std::env::var("EPILOGOS_VAULT")
                    .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string())
            }),
        }
    }

    fn coordinate_to_labels(&self, coordinate: &str) -> Vec<String> {
        match coordinate {
            "#0" => vec!["M0_Anuttara".to_string()],
            "#1" => vec!["M1_Paramasiva".to_string()],
            "#2" => vec!["M2_Parashakti".to_string()],
            "#3" => vec!["M3_Mahamaya".to_string()],
            "#4" => vec!["M4_Nara".to_string()],
            "#5" => vec!["M5_Epii".to_string()],
            "P0" => vec!["P0_Ground".to_string()],
            "P1" => vec!["P1_Definition".to_string()],
            "P2" => vec!["P2_Operation".to_string()],
            "P3" => vec!["P3_Pattern".to_string()],
            "P4" => vec!["P4_Context".to_string()],
            "P5" => vec!["P5_Integration".to_string()],
            _ => vec!["Entity".to_string()],
        }
    }

    pub fn query_by_coordinate(&self, coordinate: &str) -> GraphResult {
        let start = std::time::Instant::now();
        let labels = self.coordinate_to_labels(coordinate);
        let query = format!("MATCH (n:{}) RETURN n", labels.join(":"));

        match &self.neo4j {
            Some(client) => {
                match client.run(&query, std::collections::HashMap::new()) {
                    Ok(rows) => {
                        let nodes: Vec<NodeRef> = rows.into_iter().map(|row| NodeRef {
                            uuid: row.get("uuid")
                                .and_then(|v| v.as_str())
                                .unwrap_or("unknown")
                                .to_string(),
                            labels: labels.clone(),
                            properties: serde_json::Value::Object(
                                row.into_iter().map(|(k, v)| (k, v)).collect()
                            ),
                            file_path: None,
                        }).collect();

                        GraphResult {
                            nodes,
                            query: Some(query),
                            execution_time_ms: Some(start.elapsed().as_secs_f64() * 1000.0),
                            ..Default::default()
                        }
                    }
                    Err(e) => GraphResult {
                        query: Some(query),
                        execution_time_ms: Some(start.elapsed().as_secs_f64() * 1000.0),
                        error: Some(e),
                        ..Default::default()
                    }
                }
            }
            None => GraphResult {
                error: Some("Neo4j client not initialized — use `epi graph` with NEO4J_URI env var".to_string()),
                ..Default::default()
            }
        }
    }

    pub fn vault_path(&self) -> &str {
        &self.vault_path
    }
}
