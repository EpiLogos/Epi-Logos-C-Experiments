use super::sync::GraphSync;

pub struct SyncCoordinator {
    sync: GraphSync,
}

impl SyncCoordinator {
    pub fn new(vault_path: String) -> Self {
        Self {
            sync: GraphSync::new(vault_path),
        }
    }

    pub fn coordinate_sync(&self, coordinate: &str) -> Result<String, String> {
        let _result = self.sync.sync_all()?;
        Ok(format!("Coordinated sync for {}: complete", coordinate))
    }
}
