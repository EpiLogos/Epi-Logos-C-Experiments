pub struct GraphSync {
    vault_path: String,
}

impl GraphSync {
    pub fn new(vault_path: String) -> Self {
        Self { vault_path }
    }

    pub fn sync_all(&self) -> Result<SyncResult, String> {
        Ok(SyncResult {
            nodes_created: 0,
            edges_created: 0,
            errors: Vec::new(),
            vault_path: self.vault_path.clone(),
        })
    }
}

pub struct SyncResult {
    pub nodes_created: usize,
    pub edges_created: usize,
    pub errors: Vec<String>,
    pub vault_path: String,
}
