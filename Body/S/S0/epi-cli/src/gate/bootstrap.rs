use std::path::{Path, PathBuf};

pub fn derive_bootstrap_scope(
    gate_root: impl AsRef<Path>,
    canonical_key: &str,
    subagent_lineage: &[String],
) -> PathBuf {
    gate_root
        .as_ref()
        .join("bootstrap")
        .join(slug(canonical_key))
        .join(scope_slug(subagent_lineage))
}

fn scope_slug(subagent_lineage: &[String]) -> String {
    if subagent_lineage.is_empty() {
        "main".to_owned()
    } else {
        subagent_lineage
            .iter()
            .map(|entry| slug(entry))
            .collect::<Vec<_>>()
            .join("__")
    }
}

fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect()
}
