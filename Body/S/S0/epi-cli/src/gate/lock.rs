use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

const STALE_LOCK_WINDOW_SECS: u64 = 300;

#[derive(Debug)]
pub struct GatewayLock {
    path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
struct LockFile {
    config_hash: String,
    pid: u32,
    created_at_unix_s: u64,
}

impl GatewayLock {
    pub fn acquire(root: impl AsRef<Path>, config_hash: &str) -> Result<Self, String> {
        let path = Self::path_for(root, config_hash);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }

        if path.exists() && lock_is_stale(&path)? {
            fs::remove_file(&path).map_err(|err| err.to_string())?;
        }

        let lock = LockFile {
            config_hash: config_hash.to_owned(),
            pid: std::process::id(),
            created_at_unix_s: now_unix_s()?,
        };
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(&path)
            .map_err(|err| err.to_string())?;
        let payload = serde_json::to_string(&lock).map_err(|err| err.to_string())?;
        file.write_all(payload.as_bytes())
            .map_err(|err| err.to_string())?;

        Ok(Self { path })
    }

    pub fn path_for(root: impl AsRef<Path>, config_hash: &str) -> PathBuf {
        root.as_ref()
            .join("locks")
            .join(format!("{config_hash}.lock.json"))
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for GatewayLock {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
    }
}

fn lock_is_stale(path: &Path) -> Result<bool, String> {
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    let lock: LockFile = serde_json::from_str(&content).map_err(|err| err.to_string())?;
    Ok(now_unix_s()?.saturating_sub(lock.created_at_unix_s) > STALE_LOCK_WINDOW_SECS)
}

fn now_unix_s() -> Result<u64, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_secs())
}
