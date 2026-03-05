use super::sync_coordinator::SyncCoordinator;

pub struct SyncOrchestrator {
    coordinator: SyncCoordinator,
}

impl SyncOrchestrator {
    pub fn new(vault_path: String) -> Self {
        Self { coordinator: SyncCoordinator::new(vault_path) }
    }

    pub fn orchestrate(&self, paths: &[String]) -> Result<String, String> {
        for path in paths {
            self.coordinator.coordinate_sync(path)?;
        }
        Ok(format!("Orchestrated {} path(s)", paths.len()))
    }
}
