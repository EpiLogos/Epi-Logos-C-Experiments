use crate::graph::client::Neo4jClient;
use crate::graph::sync_coordinator::SyncCoordinator;

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
                .map_err(|e| format!("read error for {}: {}", path, e))?;

            let frontmatter = crate::graph::parse_yaml_frontmatter(&content)
                .ok_or_else(|| format!("no frontmatter in {}", path))?;

            let result = self
                .coordinator
                .sync_from_vault(path, &frontmatter, &content)
                .await?;
            total_rels += result.relationships_created;
            synced += 1;
        }

        Ok(format!(
            "Orchestrated {} path(s), {} relationships created",
            synced, total_rels
        ))
    }
}
