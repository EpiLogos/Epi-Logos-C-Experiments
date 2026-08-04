//! `epi techne gnosis sync --from-vimarsa` — bkmr pooling into the RAG corpus.
//!
//! ## What this closes
//!
//! The ta-onta spec describes notebooks as pools of sources assembled through
//! bkmr/vimarsa and then queried with real RAG. The pooling half was never
//! built: `GnosisCmd` had no `sync` arm at all, no chunk in the Neo4j corpus
//! carried a pool, and the vacuum was filled by a local keyword store that
//! re-chunked markdown and scored by counting substring hits. A notebook query
//! therefore either did nothing or silently got keyword search dressed as
//! retrieval.
//!
//! This is the missing route: **discover** the pool's sources from bkmr,
//! **ingest** them through RAG-Anything, and **stamp** pool membership on the
//! resulting chunks so `query --notebook <pool>` is real RAG restricted to the
//! pool.
//!
//! ## Residency
//!
//! The bkmr search itself is [[S5]] law (`epi-s5-kbase-core::vimarsa`), reached
//! through the existing S0 re-export at `core::knowing::vimarsa` rather than
//! imported directly — this module is a membrane step (discover → delegate),
//! and naming the S5 crate here would move its whole line count into the S0
//! membrane residency ratchet for no architectural gain.

use serde_json::{json, Value};

use super::config::GnosisConfig;
use super::query::run_gnostic_passthrough;
use crate::core::knowing::vimarsa::build_vimarsa_field;

/// Default number of bkmr hits to consider for one sync.
const DEFAULT_LIMIT: usize = 25;

/// Derive the pool name for a coordinate when the caller names none.
///
/// A pool is addressable or it is not a pool: an unnamed sync would stamp
/// chunks with nothing and leave them unretrievable by scope.
pub fn pool_name_for(coordinate: &str, notebook: Option<&str>) -> String {
    match notebook {
        Some(name) if !name.trim().is_empty() => name.trim().to_owned(),
        _ => format!("coord-{}", coordinate.trim()),
    }
}

/// Collect the distinct ingestible source paths from a vimarsa facet.
///
/// bkmr result lines that carry no path candidate are dropped — a label with
/// no file behind it is a search hit, not a source.
pub fn source_paths(items: &[(String, Option<String>)]) -> Vec<String> {
    let mut seen = std::collections::BTreeSet::new();
    let mut paths = Vec::new();
    for (_, detail) in items {
        let Some(path) = detail.as_deref() else {
            continue;
        };
        let trimmed = path.trim();
        if trimmed.is_empty() {
            continue;
        }
        if seen.insert(trimmed.to_owned()) {
            paths.push(trimmed.to_owned());
        }
    }
    paths
}

pub fn sync_from_vimarsa(
    config: &GnosisConfig,
    coordinate: &str,
    project: Option<&str>,
    notebook: Option<&str>,
    limit: Option<usize>,
) -> Result<String, String> {
    let limit = limit.unwrap_or(DEFAULT_LIMIT);
    let pool = pool_name_for(coordinate, notebook);

    let facet = build_vimarsa_field(coordinate, project, limit);
    // The facet reports its own failure mode in `source`; surface it verbatim
    // rather than treating an unavailable bkmr as an empty pool.
    if facet.source != "vimarsa" {
        return Ok(serde_json::to_string_pretty(&json!({
            "status": "error",
            "reason": facet.source,
            "message": facet.summary,
            "coordinate": coordinate,
            "pool": pool,
        }))
        .unwrap_or_default());
    }

    let items: Vec<(String, Option<String>)> = facet
        .items
        .iter()
        .map(|item| (item.label.clone(), item.detail.clone()))
        .collect();
    let paths = source_paths(&items);

    let mut ingested = Vec::new();
    let mut failed = Vec::new();
    for path in &paths {
        let args = [
            "ingest",
            path.as_str(),
            "--notebook",
            pool.as_str(),
            "--coordinate",
            coordinate,
        ];
        match run_gnostic_passthrough(config, &args) {
            Ok(raw) => {
                let parsed: Value = serde_json::from_str(raw.trim()).unwrap_or(json!({"raw": raw}));
                ingested.push(json!({ "path": path, "result": parsed }));
            }
            // One unreadable source must not abort the pool — record it and
            // carry on, so the summary says exactly what did and did not land.
            Err(error) => failed.push(json!({ "path": path, "error": error })),
        }
    }

    Ok(serde_json::to_string_pretty(&json!({
        "status": if failed.is_empty() { "ok" } else { "partial" },
        "coordinate": coordinate,
        "project_scope": facet.project_scope,
        "pool": pool,
        "hits": facet.items.len(),
        "sources_found": paths.len(),
        "ingested": ingested.len(),
        "failed": failed.len(),
        "sources": paths,
        "results": ingested,
        "failures": failed,
    }))
    .unwrap_or_default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_explicit_notebook_names_the_pool() {
        assert_eq!(
            pool_name_for("M3", Some("khora-session-abc")),
            "khora-session-abc"
        );
    }

    #[test]
    fn a_blank_notebook_falls_back_to_the_coordinate_pool() {
        assert_eq!(pool_name_for("M3", Some("   ")), "coord-M3");
        assert_eq!(pool_name_for("M3", None), "coord-M3");
    }

    #[test]
    fn only_lines_carrying_a_path_become_sources() {
        let items = vec![
            (
                "a bookmark line".to_owned(),
                Some("/docs/torus.md".to_owned()),
            ),
            ("a hit with no file behind it".to_owned(), None),
            ("blank detail".to_owned(), Some("   ".to_owned())),
        ];
        assert_eq!(source_paths(&items), vec!["/docs/torus.md".to_owned()]);
    }

    #[test]
    fn the_same_source_is_ingested_once_per_sync() {
        let items = vec![
            ("first".to_owned(), Some("/docs/torus.md".to_owned())),
            ("second".to_owned(), Some("/docs/torus.md".to_owned())),
            ("third".to_owned(), Some("/docs/klein.md".to_owned())),
        ];
        assert_eq!(
            source_paths(&items),
            vec!["/docs/torus.md".to_owned(), "/docs/klein.md".to_owned()]
        );
    }
}
