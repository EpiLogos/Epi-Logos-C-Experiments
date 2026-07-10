//! Cloud opt-in recording + status, persisted to the shared epi-logos config
//! file (`$HOME/.epi-logos` by default, overridable via `EPI_LOGOS_CONFIG_PATH`).
//!
//! The written record is interop-compatible with the gemini-embedding accessor's
//! `[cloud_opt_in.<key>]` reader (`recorded` / `enabled` / `scopes`) and ALSO
//! carries the spec's provenance fields (`consented_at` / `consent_scope`).
//! Recording is read-modify-write: every other config section is preserved.
//!
//! Path resolution deliberately mirrors the accessor's `default_config_path`
//! so the writer here and the reader there always agree on the same file.

use std::{
    env, fs, io,
    path::{Path, PathBuf},
};

use toml::{map::Map, Value};

pub const CONFIG_PATH_ENV: &str = "EPI_LOGOS_CONFIG_PATH";

/// Whether a cloud opt-in has been recorded for a key, with provenance.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OptInStatus {
    Recorded {
        consented_at: Option<String>,
        consent_scope: Option<String>,
    },
    NotRecorded,
}

impl OptInStatus {
    pub fn is_recorded(&self) -> bool {
        matches!(self, OptInStatus::Recorded { .. })
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            OptInStatus::Recorded { .. } => "recorded",
            OptInStatus::NotRecorded => "not-recorded",
        }
    }
}

/// Resolves the shared epi-logos config path:
/// `EPI_LOGOS_CONFIG_PATH` → `$HOME/.epi-logos` → `.epi-logos`.
pub fn default_config_path() -> PathBuf {
    if let Some(path) = env::var_os(CONFIG_PATH_ENV) {
        return PathBuf::from(path);
    }
    if let Some(home) = env::var_os("HOME") {
        return PathBuf::from(home).join(".epi-logos");
    }
    PathBuf::from(".epi-logos")
}

/// Reads and records cloud opt-in against the shared config file.
#[derive(Debug, Clone)]
pub struct CloudOptInStore {
    path: PathBuf,
}

impl CloudOptInStore {
    pub fn from_default() -> Self {
        Self {
            path: default_config_path(),
        }
    }

    pub fn from_path(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    fn load_root(&self) -> io::Result<Value> {
        match fs::read_to_string(&self.path) {
            Ok(contents) => contents.parse::<Value>().map_err(|error| {
                io::Error::new(
                    io::ErrorKind::InvalidData,
                    format!("invalid config toml at {}: {error}", self.path.display()),
                )
            }),
            Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(Value::Table(Map::new())),
            Err(error) => Err(error),
        }
    }

    /// Opt-in status for `opt_in_key` (the `<key>` in `epi settings opt-in <key>`).
    pub fn status(&self, opt_in_key: &str) -> io::Result<OptInStatus> {
        let root = self.load_root()?;
        let Some(record) = root
            .get("cloud_opt_in")
            .and_then(|section| section.get(opt_in_key))
        else {
            return Ok(OptInStatus::NotRecorded);
        };

        let recorded = record
            .get("recorded")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let enabled = record
            .get("enabled")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        if !recorded && !enabled {
            return Ok(OptInStatus::NotRecorded);
        }

        Ok(OptInStatus::Recorded {
            consented_at: record
                .get("consented_at")
                .and_then(Value::as_str)
                .map(str::to_owned),
            consent_scope: record
                .get("consent_scope")
                .and_then(Value::as_str)
                .map(str::to_owned),
        })
    }

    /// Records cloud opt-in for `opt_in_key`, preserving every other config
    /// section. Writes accessor-compatible fields (`recorded` / `enabled` /
    /// `scopes = ["*"]`) plus provenance (`consented_at` / `consent_scope`).
    pub fn record(
        &self,
        opt_in_key: &str,
        consent_scope: &str,
        consented_at: &str,
    ) -> io::Result<()> {
        let mut root = self.load_root()?;
        let root_table = root.as_table_mut().ok_or_else(|| {
            io::Error::new(io::ErrorKind::InvalidData, "config root is not a table")
        })?;

        let cloud = root_table
            .entry("cloud_opt_in".to_owned())
            .or_insert_with(|| Value::Table(Map::new()));
        let cloud_table = cloud.as_table_mut().ok_or_else(|| {
            io::Error::new(io::ErrorKind::InvalidData, "[cloud_opt_in] is not a table")
        })?;

        let mut record = Map::new();
        record.insert("recorded".to_owned(), Value::Boolean(true));
        record.insert("enabled".to_owned(), Value::Boolean(true));
        record.insert(
            "scopes".to_owned(),
            Value::Array(vec![Value::String("*".to_owned())]),
        );
        record.insert(
            "consented_at".to_owned(),
            Value::String(consented_at.to_owned()),
        );
        record.insert(
            "consent_scope".to_owned(),
            Value::String(consent_scope.to_owned()),
        );
        cloud_table.insert(opt_in_key.to_owned(), Value::Table(record));

        let serialized = toml::to_string_pretty(&root).map_err(|error| {
            io::Error::new(io::ErrorKind::Other, format!("serialize config: {error}"))
        })?;

        if let Some(parent) = self.path.parent() {
            if !parent.as_os_str().is_empty() {
                fs::create_dir_all(parent)?;
            }
        }
        fs::write(&self.path, serialized)
    }
}

#[cfg(test)]
mod tests {
    use super::{CloudOptInStore, OptInStatus, CONFIG_PATH_ENV};

    fn temp_config() -> (tempfile::TempDir, std::path::PathBuf) {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("config.toml");
        (dir, path)
    }

    #[test]
    fn status_is_not_recorded_when_file_absent() {
        let (_dir, path) = temp_config();
        let store = CloudOptInStore::from_path(&path);
        assert_eq!(
            store.status("gemini_embedding").expect("status"),
            OptInStatus::NotRecorded
        );
    }

    #[test]
    fn record_then_status_round_trips_provenance() {
        let (_dir, path) = temp_config();
        let store = CloudOptInStore::from_path(&path);
        store
            .record("gemini_embedding", "RETRIEVAL_DOCUMENT", "2026-07-10T09:00:00Z")
            .expect("record");

        match store.status("gemini_embedding").expect("status") {
            OptInStatus::Recorded {
                consented_at,
                consent_scope,
            } => {
                assert_eq!(consented_at.as_deref(), Some("2026-07-10T09:00:00Z"));
                assert_eq!(consent_scope.as_deref(), Some("RETRIEVAL_DOCUMENT"));
            }
            OptInStatus::NotRecorded => panic!("expected recorded status"),
        }
    }

    #[test]
    fn record_preserves_unrelated_sections() {
        let (_dir, path) = temp_config();
        std::fs::write(
            &path,
            "[gemini_embedding]\nmodel_version = \"gemini-embedding-2-preview\"\nmax_rpm = 60\n",
        )
        .expect("seed config");

        let store = CloudOptInStore::from_path(&path);
        store
            .record("gemini_embedding", "RETRIEVAL_DOCUMENT", "2026-07-10T09:00:00Z")
            .expect("record");

        let raw = std::fs::read_to_string(&path).expect("read back");
        assert!(raw.contains("model_version"), "existing section preserved:\n{raw}");
        assert!(raw.contains("max_rpm"), "existing scalar preserved:\n{raw}");
        assert!(raw.contains("[cloud_opt_in.gemini_embedding]"), "opt-in written:\n{raw}");
    }

    #[test]
    fn default_config_path_honors_env_override() {
        let previous = std::env::var_os(CONFIG_PATH_ENV);
        std::env::set_var(CONFIG_PATH_ENV, "/tmp/epi-logos-test-config.toml");
        assert_eq!(
            super::default_config_path(),
            std::path::PathBuf::from("/tmp/epi-logos-test-config.toml")
        );
        match previous {
            Some(value) => std::env::set_var(CONFIG_PATH_ENV, value),
            None => std::env::remove_var(CONFIG_PATH_ENV),
        }
    }
}
