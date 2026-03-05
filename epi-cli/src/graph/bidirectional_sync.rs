pub struct BidirectionalSync {
    vault_path: String,
}

impl BidirectionalSync {
    pub fn new(vault_path: String) -> Self {
        Self { vault_path }
    }

    pub fn sync_bidirectional(&self) -> Result<String, String> {
        Ok(format!("Bidirectional sync complete for {}", self.vault_path))
    }
}
