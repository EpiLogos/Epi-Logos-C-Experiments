use crate::{GraphResult, Neo4jClient, NodeRef, SyncCoordinator};

pub struct QLAlignmentValidator;

impl QLAlignmentValidator {
    pub fn new() -> Self {
        Self
    }

    pub fn validate_coordinate(&self, coordinate: &str) -> bool {
        matches!(
            coordinate,
            "#0" | "#1"
                | "#2"
                | "#3"
                | "#4"
                | "#5"
                | "P0"
                | "P1"
                | "P2"
                | "P3"
                | "P4"
                | "P5"
                | "S0"
                | "S1"
                | "S2"
                | "S3"
                | "S4"
                | "S5"
                | "T0"
                | "T1"
                | "T2"
                | "T3"
                | "T4"
                | "T5"
                | "M0"
                | "M1"
                | "M2"
                | "M3"
                | "M4"
                | "M5"
                | "L0"
                | "L1"
                | "L2"
                | "L3"
                | "L4"
                | "L5"
                | "C0"
                | "C1"
                | "C2"
                | "C3"
                | "C4"
                | "C5"
        )
    }
}

pub struct EntityMapper;

impl EntityMapper {
    pub fn new() -> Self {
        Self
    }

    pub fn path_to_labels(&self, path: &str) -> Vec<String> {
        let parts: Vec<&str> = path.split('/').collect();
        let mut labels = vec!["Note".to_string()];
        if let Some(parent) = parts.get(parts.len().saturating_sub(2)) {
            labels.push(parent.to_string());
        }
        labels
    }

    pub fn node_to_ref(&self, labels: Vec<String>, file_path: Option<String>) -> NodeRef {
        NodeRef {
            uuid: uuid_from_path(file_path.as_deref().unwrap_or("")),
            labels,
            properties: serde_json::Value::Object(Default::default()),
            file_path,
        }
    }
}

pub struct GraphAPI {
    vault_path: String,
}

impl GraphAPI {
    pub fn new(vault_path: Option<String>) -> Self {
        Self {
            vault_path: vault_path.unwrap_or_else(|| {
                std::env::var("EPILOGOS_VAULT")
                    .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string())
            }),
        }
    }

    pub async fn query_by_coordinate(
        &self,
        client: &Neo4jClient,
        coordinate: &str,
    ) -> Result<GraphResult, String> {
        let mut result = GraphResult {
            query: Some(format!("coordinate:{coordinate}")),
            ..Default::default()
        };
        let rows = crate::CoordinateRetrieval::new(client)
            .query_by_coordinate(coordinate)
            .await?;
        result.coordinate = rows.first().map(node_ref_from_row);
        result.nodes = rows.iter().map(node_ref_from_row).collect();
        Ok(result)
    }

    pub fn vault_path(&self) -> &str {
        &self.vault_path
    }
}

pub struct SyncOrchestrator<'a> {
    coordinator: SyncCoordinator<'a>,
}

impl<'a> SyncOrchestrator<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self {
            coordinator: SyncCoordinator::new(client),
        }
    }

    pub async fn orchestrate(&self, paths: &[String]) -> Result<String, String> {
        let mut total_rels = 0;
        let mut synced = 0;

        for path in paths {
            let content = std::fs::read_to_string(path)
                .map_err(|err| format!("read error for {path}: {err}"))?;
            let frontmatter = parse_yaml_frontmatter(&content)
                .ok_or_else(|| format!("no frontmatter in {path}"))?;

            let result = self
                .coordinator
                .sync_from_vault(path, &frontmatter, &content)
                .await?;
            total_rels += result.relationships_created;
            synced += 1;
        }

        Ok(format!(
            "Orchestrated {synced} path(s), {total_rels} relationships created"
        ))
    }
}

pub fn parse_yaml_frontmatter(content: &str) -> Option<serde_yaml::Value> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return None;
    }
    let after_first = &trimmed[3..];
    let end = after_first.find("\n---")?;
    let yaml_str = &after_first[..end];
    serde_yaml::from_str(yaml_str).ok()
}

fn node_ref_from_row(value: &serde_json::Value) -> NodeRef {
    NodeRef {
        uuid: value
            .get("uuid")
            .and_then(|value| value.as_str())
            .unwrap_or_default()
            .to_owned(),
        labels: value
            .get("labels")
            .and_then(|value| value.as_array())
            .map(|items| {
                items
                    .iter()
                    .filter_map(|value| value.as_str().map(str::to_owned))
                    .collect()
            })
            .unwrap_or_default(),
        properties: value.clone(),
        file_path: value
            .get("file_path")
            .and_then(|value| value.as_str())
            .map(str::to_owned),
    }
}

fn uuid_from_path(path: &str) -> String {
    format!("path:{path}")
}
