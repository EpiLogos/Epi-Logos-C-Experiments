use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct GnosisConfig {
    pub root: PathBuf,
    pub chunk_words: usize,
    pub overlap_words: usize,
    pub python_bin: String,
}

impl GnosisConfig {
    pub fn from_env() -> Self {
        let home = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."));
        let root = home.join(".epi-logos").join("gnosis");
        let chunk_words = std::env::var("EPI_GNOSIS_CHUNK_WORDS")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(512);
        let overlap_words = std::env::var("EPI_GNOSIS_OVERLAP_WORDS")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(64);
        let python_bin = resolve_gnostic_bin();

        Self {
            root,
            chunk_words,
            overlap_words,
            python_bin,
        }
    }

    pub fn notebooks_path(&self) -> PathBuf {
        self.root.join("notebooks.json")
    }

    pub fn documents_path(&self) -> PathBuf {
        self.root.join("documents.json")
    }
}

/// Resolve the `epi-gnostic` bridge executable.
///
/// Search order:
///   1. `$EPI_GNOSTIC_PYTHON` (honoured verbatim — the harnesses pin it to a stub)
///   2. `<CARGO_MANIFEST_DIR>/../../S5/epi-gnostic/.venv/bin/epi-gnostic`
///   3. `epi-gnostic` from `PATH`
///
/// Step 2 exists because a bare `epi-gnostic` on `PATH` is routinely a stale
/// user-level install that raises `ModuleNotFoundError: No module named
/// 'epi_gnostic'`. When that is the only candidate, EVERY `s5'.gnostic.*`
/// method fails at the subprocess boundary and the whole S4↔S5 seam is dark
/// under a default environment — the 12.T12.13 runtime audit caught exactly
/// that over the wire. The venv console script is the real bridge, so prefer it
/// before falling back to whatever `PATH` happens to carry.
pub fn resolve_gnostic_bin() -> String {
    resolve_gnostic_bin_from(
        std::env::var("EPI_GNOSTIC_PYTHON").ok(),
        Path::new(env!("CARGO_MANIFEST_DIR")),
    )
}

fn resolve_gnostic_bin_from(explicit: Option<String>, manifest_dir: &Path) -> String {
    if let Some(value) = explicit.filter(|value| !value.trim().is_empty()) {
        return value;
    }

    let venv = manifest_dir
        .join("..")
        .join("..")
        .join("S5")
        .join("epi-gnostic")
        .join(".venv")
        .join("bin")
        .join("epi-gnostic");
    if venv.exists() {
        return venv
            .canonicalize()
            .unwrap_or(venv)
            .display()
            .to_string();
    }

    "epi-gnostic".to_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The harnesses pin `EPI_GNOSTIC_PYTHON` to a stub that need not exist on
    /// disk at resolve time, so an explicit value is honoured verbatim.
    #[test]
    fn explicit_env_override_wins_verbatim() {
        let resolved = resolve_gnostic_bin_from(
            Some("/tmp/stub-harness".to_owned()),
            Path::new(env!("CARGO_MANIFEST_DIR")),
        );
        assert_eq!(resolved, "/tmp/stub-harness");
    }

    #[test]
    fn blank_override_is_ignored() {
        let resolved =
            resolve_gnostic_bin_from(Some("   ".to_owned()), Path::new(env!("CARGO_MANIFEST_DIR")));
        assert_ne!(
            resolved, "   ",
            "a blank EPI_GNOSTIC_PYTHON must not be spawned as the bridge"
        );
    }

    /// The regression this resolver exists for: with no override, the default
    /// must be the real venv console script, not the bare PATH name.
    #[test]
    fn default_resolves_to_the_repo_venv_console_script() {
        let resolved =
            resolve_gnostic_bin_from(None, Path::new(env!("CARGO_MANIFEST_DIR")));
        assert_ne!(
            resolved, "epi-gnostic",
            "the bare PATH name is the broken default that darkens the S4<->S5 seam; \
             the repo venv console script must win when it is present"
        );
        assert!(
            Path::new(&resolved).exists(),
            "resolved gnostic bridge must exist on disk: {resolved}"
        );
        assert!(
            resolved.ends_with("/.venv/bin/epi-gnostic"),
            "expected the epi-gnostic venv console script, got: {resolved}"
        );
    }

    #[test]
    fn falls_back_to_path_when_no_venv_is_present() {
        let resolved = resolve_gnostic_bin_from(None, Path::new("/nonexistent-manifest-dir"));
        assert_eq!(resolved, "epi-gnostic");
    }
}
