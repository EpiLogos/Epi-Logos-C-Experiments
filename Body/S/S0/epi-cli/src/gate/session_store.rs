use std::ops::Deref;
use std::path::{Path, PathBuf};

use crate::sesh::session::{read_session_state, repo_root_from_env, resolve_vault_root};
use epi_s3_gateway::CreateSessionContext;

pub use epi_s3_gateway::session_store::slug;
pub use epi_s3_gateway_contract::{SessionPatch, SessionRecord};

pub struct SessionStore {
    inner: epi_s3_gateway::SessionStore,
}

impl SessionStore {
    pub fn new(gate_root: impl AsRef<Path>) -> Result<Self, String> {
        Ok(Self {
            inner: epi_s3_gateway::SessionStore::new(gate_root)?,
        })
    }

    pub fn create(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        self.inner
            .create_with_context(canonical_key, current_create_context())
    }

    pub fn ensure(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        match self.inner.resolve(canonical_key) {
            Ok(record) => Ok(record),
            Err(_) => self.create(canonical_key),
        }
    }
}

impl Deref for SessionStore {
    type Target = epi_s3_gateway::SessionStore;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

fn current_create_context() -> CreateSessionContext {
    let session_snapshot = load_current_session_state();
    let empty_env = std::collections::BTreeMap::new();
    let vault_root = resolve_vault_root(
        session_snapshot
            .as_ref()
            .map(|state| &state.env)
            .unwrap_or(&empty_env),
    )
    .display()
    .to_string();

    CreateSessionContext {
        session_id: session_snapshot
            .as_ref()
            .map(|state| state.context.session_id.clone()),
        day_id: session_snapshot
            .as_ref()
            .map(|state| state.context.day_id.clone()),
        vault_now_path: session_snapshot
            .as_ref()
            .map(|state| state.context.now_path.display().to_string()),
        runtime_cwd: Some(repo_root_from_env().display().to_string()),
        vault_root: Some(vault_root),
    }
}

fn load_current_session_state() -> Option<crate::sesh::session::SessionState> {
    let repo_root: PathBuf = repo_root_from_env();
    read_session_state(&repo_root).ok()
}
