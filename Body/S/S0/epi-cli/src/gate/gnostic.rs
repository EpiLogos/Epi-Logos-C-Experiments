// S0 ADAPTER: Body/S/S5 (epi-gnostic) — thin gate bridge; validation at the membrane, execution delegated to the production epi-gnostic CLI.
//! S0 gate bridge for the production S5 `epi-gnostic` stack.
//!
//! The gateway surface is intentionally thin: parameters are validated at the
//! S0 membrane, then execution is delegated to the configured `epi-gnostic`
//! command (`EPI_GNOSTIC_PYTHON`, default `epi-gnostic`). JSON emitted by the
//! production CLI is preserved for Theia callers.

use std::path::Path;
use std::process::Command;

use serde_json::{json, Value};

use crate::agent::tmux::{validate_lease, TerminalLeaseStatus};
use crate::techne::gnosis::config::GnosisConfig;

pub fn status() -> Result<Value, String> {
    run_gnostic(["status".to_owned()])
}

pub fn models() -> Result<Value, String> {
    run_gnostic(["models".to_owned()])
}

pub fn ingest(state_root: &Path, params: &Value) -> Result<Value, String> {
    // 12.T12.2 (c): TerminalBinding carried through gnostic dispatch — a
    // persistent ingest running under a terminal lease names it in the
    // params; an expired/missing lease refuses recoverably BEFORE any shell.
    if let Some(lease_id) = optional_str_alias(
        params,
        &[
            "terminalLeaseId",
            "terminal_lease_id",
            "leaseId",
            "sessionKey",
            "session_key",
        ],
    ) {
        match validate_lease(state_root, &lease_id) {
            TerminalLeaseStatus::Live { .. } => {}
            TerminalLeaseStatus::Expired { expired_for_ms } => {
                return Err(format!(
                    "terminal lease {lease_id} expired {expired_for_ms}ms ago — persistent gnostic ingest refused; re-acquire the lease and retry"
                ));
            }
            TerminalLeaseStatus::Missing => {
                return Err(format!(
                    "terminal lease {lease_id} not found — persistent gnostic ingest refused; re-acquire the lease and retry"
                ));
            }
        }
    }

    if let Some(text) = optional_str_alias(params, &["text", "content", "body"]) {
        let mut args = vec!["ingest-text".to_owned(), text];
        if let Some(source_id) = optional_str_alias(params, &["sourceId", "source_id", "id"]) {
            args.push("--source-id".to_owned());
            args.push(source_id);
        }
        return run_gnostic(args);
    }

    let source = required_str_alias(params, &["source", "path", "filePath", "file_path"])?;
    let mut args = vec!["ingest".to_owned(), source];
    if let Some(coordinate) = optional_str_alias(params, &["coordinate", "bimbaCoordinate"]) {
        args.push("--coordinate".to_owned());
        args.push(coordinate);
    }
    if let Some(family) = optional_str_alias(params, &["family", "coordinateFamily"]) {
        args.push("--family".to_owned());
        args.push(family);
    }
    run_gnostic(args)
}

pub fn query(params: &Value) -> Result<Value, String> {
    let question = required_str_alias(params, &["query", "question"])?;
    let mut args = vec!["query".to_owned(), question];
    if let Some(mode) = optional_str(params, "mode") {
        args.push("--mode".to_owned());
        args.push(mode);
    }
    run_gnostic(args)
}

pub fn notebook(params: &Value) -> Result<Value, String> {
    let action =
        optional_str_alias(params, &["action", "operation"]).unwrap_or_else(|| "list".to_owned());
    let mut args = vec!["notebook".to_owned(), action.clone()];
    match action.as_str() {
        "create" | "delete" => args.push(required_str_alias(params, &["name", "notebook"])?),
        "list" => {}
        other => {
            return Err(format!(
                "unsupported s5'.gnostic.notebook action {other:?}; expected list, create, or delete"
            ));
        }
    }
    run_gnostic(args)
}

pub fn resolve(params: &Value) -> Result<Value, String> {
    let reference = required_str_alias(
        params,
        &[
            "coord",
            "coordinate",
            "ref",
            "passageId",
            "passage_id",
            "id",
        ],
    )?;
    run_gnostic(["resolve".to_owned(), reference])
}

pub fn candidates(params: &Value) -> Result<Value, String> {
    let mut args = vec!["candidates".to_owned()];
    if let Some(filter) =
        optional_str_alias(params, &["filter", "candidateFilter", "candidate_filter"])
    {
        args.push("--filter".to_owned());
        args.push(filter);
    }
    run_gnostic(args)
}

pub fn etymology(params: &Value) -> Result<Value, String> {
    let coord = required_str_alias(params, &["coord", "coordinate", "bimbaCoordinate"])?;
    run_gnostic(["etymology".to_owned(), coord])
}

pub fn list_notebooks(params: &Value) -> Result<Value, String> {
    let mut args = vec!["list-notebooks".to_owned()];
    if let Some(coord) = optional_str_alias(
        params,
        &["coordFilter", "coord_filter", "coordinate", "coord"],
    ) {
        args.push("--coordinate".to_owned());
        args.push(coord);
    }
    run_gnostic(args)
}

pub fn episode_search(params: &Value) -> Result<Value, String> {
    let query = required_str_alias(params, &["query", "question"])?;
    let mut args = vec!["episode-search".to_owned(), query];
    if let Some(vak) = optional_str_alias(params, &["vakFilter", "vak_filter", "vak"]) {
        args.push("--vak".to_owned());
        args.push(vak);
    }
    if let Some(group) = optional_str_alias(params, &["group", "groupId", "group_id"]) {
        args.push("--group".to_owned());
        args.push(group);
    }
    run_gnostic(args)
}

pub fn evidence_trace(params: &Value) -> Result<Value, String> {
    let passage_id = required_str_alias(params, &["passageId", "passage_id", "id"])?;
    run_gnostic(["evidence-trace".to_owned(), passage_id])
}

pub fn query_with_layers(params: &Value) -> Result<Value, String> {
    let question = required_str_alias(params, &["query", "question"])?;
    let mut args = vec!["query-with-layers".to_owned(), question];
    if let Some(layers) = optional_str_alias(params, &["layers"]) {
        args.push("--layers".to_owned());
        args.push(layers);
    }
    run_gnostic(args)
}

/// 12.T12.13: the seam's only WRITE — mint the cross-namespace edge.
///
/// Every other `s5'.gnostic.*` method reads. This one reaches
/// `CoordinateEnricher.assign_direct`, the sole minter of the
/// `MAPS_TO_COORDINATE` edge from a `:gnostic` entity onto its `:Bimba`
/// coordinate node. Omitting `--coordinate` hands the entity to the LLM
/// classifier instead, exactly as the CLI does — validation stays at this
/// membrane, execution stays in production epi-gnostic.
pub fn enrich(params: &Value) -> Result<Value, String> {
    let entity_id = required_str_alias(
        params,
        &["entityId", "entity_id", "id", "vectorId", "vector_id"],
    )?;
    let mut args = vec!["enrich".to_owned(), entity_id];
    if let Some(coord) =
        optional_str_alias(params, &["coordinate", "coord", "bimbaCoordinate"])
    {
        args.push("--coordinate".to_owned());
        args.push(coord);
    }
    if let Some(family) = optional_str_alias(params, &["family", "coordinateFamily"]) {
        args.push("--family".to_owned());
        args.push(family);
    }
    run_gnostic(args)
}

fn run_gnostic<I>(args: I) -> Result<Value, String>
where
    I: IntoIterator<Item = String>,
{
    let config = GnosisConfig::from_env();
    let mut command = Command::new(&config.python_bin);
    command.args(args);
    for (key, value) in neo4j_bridge_env() {
        command.env(key, value);
    }
    let output = command
        .output()
        .map_err(|err| format!("failed to run {}: {err}", config.python_bin))?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
    if !output.status.success() {
        let diagnostic = if stderr.is_empty() { stdout } else { stderr };
        return Err(format!("epi-gnostic failed: {diagnostic}"));
    }

    if stdout.is_empty() {
        return Ok(json!({ "status": "ok" }));
    }
    serde_json::from_str(&stdout)
        .map_err(|err| format!("epi-gnostic returned non-JSON output: {err}; stdout={stdout}"))
}

/// 12.T12.13: bridge the repo's canonical Neo4j env onto the names the S5
/// bridge's own dependencies read.
///
/// LightRAG's `Neo4JStorage.initialize` builds `auth=(USERNAME, PASSWORD)` from
/// the bare `NEO4J_URI`/`NEO4J_USERNAME`/`NEO4J_PASSWORD` (`neo4j_impl.py:137`),
/// but this repo's canonical spelling is `EPILOGOS_NEO4J_*` (`DEPENDENCIES.md`).
/// The gateway therefore spawned the bridge with no credentials at all: against
/// the no-auth dev instance that happens to connect, but against ANY
/// authenticated Neo4j `Neo4JStorage` refuses and gnosis-RAG retrieval never
/// runs. Anything already present in the environment is left alone — an
/// explicitly-set `NEO4J_PASSWORD=""` means "no auth" and must not be clobbered.
fn neo4j_bridge_env() -> Vec<(&'static str, String)> {
    neo4j_bridge_env_from(&|key| std::env::var(key).ok())
}

fn neo4j_bridge_env_from(
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

fn required_str_alias(params: &Value, keys: &[&str]) -> Result<String, String> {
    optional_str_alias(params, keys).ok_or_else(|| {
        format!(
            "missing required string parameter; expected one of {}",
            keys.join(", ")
        )
    })
}

fn optional_str_alias(params: &Value, keys: &[&str]) -> Option<String> {
    keys.iter().find_map(|key| optional_str(params, key))
}

fn optional_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
}

#[cfg(test)]
mod neo4j_bridge_env_tests {
    use super::*;
    use std::collections::HashMap;

    fn lookup_from(pairs: &[(&str, &str)]) -> HashMap<String, String> {
        pairs
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect()
    }

    #[test]
    fn canonical_epilogos_names_are_bridged_to_the_names_lightrag_reads() {
        let env = lookup_from(&[
            ("EPILOGOS_NEO4J_URI", "bolt://graph.internal:7687"),
            ("EPILOGOS_NEO4J_USER", "neo4j"),
            ("EPILOGOS_NEO4J_PASSWORD", "s3cret"),
        ]);
        let bridged = neo4j_bridge_env_from(&|key| env.get(key).cloned());

        assert_eq!(bridged.len(), 3, "all three credentials must cross: {bridged:?}");
        assert!(bridged.contains(&("NEO4J_URI", "bolt://graph.internal:7687".to_owned())));
        assert!(bridged.contains(&("NEO4J_USERNAME", "neo4j".to_owned())));
        assert!(bridged.contains(&("NEO4J_PASSWORD", "s3cret".to_owned())));
    }

    /// An explicit `NEO4J_PASSWORD=""` is the no-auth signal; bridging over it
    /// would hand LightRAG a password it must not use.
    #[test]
    fn an_explicitly_set_target_is_never_clobbered() {
        let env = lookup_from(&[
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
        let env = lookup_from(&[]);
        let bridged = neo4j_bridge_env_from(&|key| env.get(key).cloned());
        assert!(bridged.is_empty(), "expected no synthesised env: {bridged:?}");
    }
}

#[cfg(test)]
mod lease_gate_tests {
    use super::*;

    #[test]
    fn ingest_refuses_recoverably_when_the_named_lease_is_missing() {
        let root =
            std::env::temp_dir().join(format!("epi-gnostic-lease-test-{}", std::process::id()));
        std::fs::create_dir_all(&root).unwrap();
        let err = ingest(
            &root,
            &json!({ "terminalLeaseId": "agent:ghost:main", "path": "/tmp/doc.md" }),
        )
        .expect_err("missing lease must refuse before any shell");
        assert!(err.contains("agent:ghost:main"), "{err}");
        assert!(err.contains("re-acquire"), "{err}");
        std::fs::remove_dir_all(&root).ok();
    }

    #[test]
    fn ingest_without_a_lease_param_skips_the_lease_gate() {
        // No lease named → the gate does not apply (non-persistent call);
        // the next refusal is the ordinary missing-source parameter error.
        let root =
            std::env::temp_dir().join(format!("epi-gnostic-nolease-test-{}", std::process::id()));
        std::fs::create_dir_all(&root).unwrap();
        let err = ingest(&root, &json!({})).expect_err("missing source must refuse");
        assert!(err.contains("missing required string parameter"), "{err}");
        std::fs::remove_dir_all(&root).ok();
    }
}
