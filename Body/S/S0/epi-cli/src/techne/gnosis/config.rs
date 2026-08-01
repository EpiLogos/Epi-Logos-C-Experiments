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

/// Bridge the repo's canonical Neo4j env onto the names the S5 bridge reads.
///
/// LightRAG refuses to construct `Neo4JStorage` unless `NEO4J_URI`,
/// `NEO4J_USERNAME` and `NEO4J_PASSWORD` are all PRESENT
/// (`lightrag/utils.py::check_storage_env_vars`), and it builds
/// `auth=(USERNAME, PASSWORD)` from them. This repo's canonical spelling is
/// `EPILOGOS_NEO4J_*` (`DEPENDENCIES.md`), so without this every `query` and
/// `ingest` through the bridge dies at config load with that ValueError —
/// `enrich` survives only because it talks to Neo4j directly and never
/// initialises LightRAG.
///
/// This lives on `GnosisConfig` rather than at one call site because the bridge
/// is spawned from BOTH the gateway (`gate/gnostic.rs`) and the CLI passthrough
/// (`techne/gnosis/{query,ingest}.rs`) — 12.T12.13 first fixed only the gateway
/// path, and the Aletheia Pi tools shell the CLI one, so the seam stayed dark
/// exactly where the agents use it.
///
/// Anything already present is left alone: an explicit `NEO4J_PASSWORD=""` is
/// the no-auth signal and must survive.
pub fn neo4j_bridge_env() -> Vec<(&'static str, String)> {
    neo4j_bridge_env_from(&|key| std::env::var(key).ok())
}

pub(crate) fn neo4j_bridge_env_from(
    lookup: &dyn Fn(&str) -> Option<String>,
) -> Vec<(&'static str, String)> {
    const PAIRS: [(&str, &str); 3] = [
        ("NEO4J_URI", "EPILOGOS_NEO4J_URI"),
        ("NEO4J_USERNAME", "EPILOGOS_NEO4J_USER"),
        ("NEO4J_PASSWORD", "EPILOGOS_NEO4J_PASSWORD"),
    ];
    PAIRS
        .iter()
        .filter(|(target, _)| lookup(target).is_none())
        .filter_map(|(target, source)| lookup(source).map(|value| (*target, value)))
        .collect()
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
mod neo4j_bridge_env_tests {
    use super::*;
    use std::collections::HashMap;

    fn env_of(pairs: &[(&str, &str)]) -> HashMap<String, String> {
        pairs
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect()
    }

    #[test]
    fn canonical_epilogos_names_are_bridged_to_the_names_lightrag_reads() {
        let env = env_of(&[
            ("EPILOGOS_NEO4J_URI", "bolt://graph.internal:7687"),
            ("EPILOGOS_NEO4J_USER", "neo4j"),
            ("EPILOGOS_NEO4J_PASSWORD", "s3cret"),
        ]);
        let bridged = neo4j_bridge_env_from(&|key| env.get(key).cloned());

        assert_eq!(bridged.len(), 3, "all three must cross: {bridged:?}");
        assert!(bridged.contains(&("NEO4J_URI", "bolt://graph.internal:7687".to_owned())));
        assert!(bridged.contains(&("NEO4J_USERNAME", "neo4j".to_owned())));
        assert!(bridged.contains(&("NEO4J_PASSWORD", "s3cret".to_owned())));
    }

    /// An explicit `NEO4J_PASSWORD=""` is the no-auth signal; bridging over it
    /// would hand LightRAG a password it must not use.
    #[test]
    fn an_explicitly_set_target_is_never_clobbered() {
        let env = env_of(&[
            ("NEO4J_PASSWORD", ""),
            ("EPILOGOS_NEO4J_PASSWORD", "would-clobber"),
        ]);
        let bridged = neo4j_bridge_env_from(&|key| env.get(key).cloned());
        assert!(
            !bridged.iter().any(|(key, _)| *key == "NEO4J_PASSWORD"),
            "an already-present NEO4J_PASSWORD must be left alone: {bridged:?}"
        );
    }

    #[test]
    fn nothing_is_invented_when_the_canonical_names_are_absent() {
        let bridged = neo4j_bridge_env_from(&|_| None);
        assert!(bridged.is_empty(), "expected no synthesised env: {bridged:?}");
    }
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
