//! Constraint registry — graph-law verification of trajectory deposits.
//!
//! S2 owns the YAML-backed constraint registry (`registry.yaml`) and the
//! Cypher-evaluation pipeline that runs each enabled constraint against
//! a [`TrajectoryDeposit`]. The S0 `epi graph constraint` adapter is a
//! CLI shell over this engine.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use neo4rs::query;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use epi_kernel_contract::{
    ConstraintRegistryEntry, ConstraintSeverity, ConstraintViolation, TrajectoryDeposit,
    VerifierReport,
};

use crate::cypher::{apply_params, check_statement, CypherGuardOutcome, CypherMode};
use crate::Neo4jClient;

pub const ENV_CONSTRAINT_HOME: &str = "EPILOGOS_CONSTRAINT_HOME";

pub fn constraint_home() -> PathBuf {
    if let Ok(path) = std::env::var(ENV_CONSTRAINT_HOME) {
        return PathBuf::from(path);
    }
    let mut home = home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.push(".epi-logos");
    home.push("constraints");
    home
}

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME").map(PathBuf::from)
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Registry {
    #[serde(default)]
    pub entries: Vec<ConstraintRegistryEntry>,
}

impl Registry {
    pub fn empty() -> Self {
        Self { entries: vec![] }
    }

    pub fn load(home: &Path) -> Result<Self, String> {
        let path = home.join("registry.yaml");
        if !path.exists() {
            return Ok(Self::empty());
        }
        let raw = fs::read_to_string(&path).map_err(|e| format!("read {}: {e}", path.display()))?;
        serde_yaml::from_str(&raw).map_err(|e| format!("parse {}: {e}", path.display()))
    }

    pub fn save(&self, home: &Path) -> Result<PathBuf, String> {
        fs::create_dir_all(home)
            .map_err(|e| format!("create constraint home {}: {e}", home.display()))?;
        let path = home.join("registry.yaml");
        let yaml = serde_yaml::to_string(self).map_err(|e| format!("serialize registry: {e}"))?;
        fs::write(&path, yaml).map_err(|e| format!("write {}: {e}", path.display()))?;
        Ok(path)
    }

    pub fn upsert(&mut self, entry: ConstraintRegistryEntry) {
        if let Some(existing) = self.entries.iter_mut().find(|e| e.name == entry.name) {
            *existing = entry;
        } else {
            self.entries.push(entry);
        }
    }

    pub fn remove(&mut self, name: &str) -> bool {
        let before = self.entries.len();
        self.entries.retain(|e| e.name != name);
        before != self.entries.len()
    }

    pub fn set_enabled(&mut self, name: &str, enabled: bool) -> bool {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.name == name) {
            entry.enabled = enabled;
            true
        } else {
            false
        }
    }

    pub fn find(&self, name: &str) -> Option<&ConstraintRegistryEntry> {
        self.entries.iter().find(|e| e.name == name)
    }
}

/// Register a new (or replacement) constraint from a Cypher query file
/// plus inline severity + Anuttara template.
pub fn register(
    name: &str,
    query_file: &Path,
    severity: ConstraintSeverity,
    anuttara_template: &str,
    home: &Path,
) -> Result<ConstraintRegistryEntry, String> {
    let query_text = fs::read_to_string(query_file)
        .map_err(|e| format!("read {}: {e}", query_file.display()))?;
    let trimmed = query_text.trim();
    // Constraint queries must be read-only — they MATCH and RETURN.
    let outcome = check_statement(trimmed, CypherMode::READ_ONLY);
    if !matches!(outcome, CypherGuardOutcome::AllowedRead) {
        return Err(format!(
            "constraint {name}: query must be read-only (use MATCH/RETURN); got {outcome:?}"
        ));
    }
    let entry = ConstraintRegistryEntry::new(name, trimmed, severity, anuttara_template)
        .map_err(str::to_owned)?;
    let mut registry = Registry::load(home)?;
    registry.upsert(entry.clone());
    registry.save(home)?;
    Ok(entry)
}

/// Run a single constraint against a trajectory deposit. Returns the
/// list of violations produced.
pub async fn run_constraint(
    client: &Neo4jClient,
    entry: &ConstraintRegistryEntry,
    deposit: &TrajectoryDeposit,
) -> Result<Vec<ConstraintViolation>, String> {
    let params = json!({
        "trajectory_id": deposit.deposit_id,
        "session_key": deposit.session_key,
        "anchor_coordinate": deposit.anchor_coordinate,
        "canonical_coordinate": deposit.canonical_coordinate,
        "started_at_ms": deposit.started_at_ms as i64,
        "ended_at_ms": deposit.ended_at_ms.map(|v| v as i64).unwrap_or(0),
    });
    let map = params
        .as_object()
        .ok_or_else(|| "constraint param shape error".to_string())?
        .clone();
    let q = apply_params(query(&entry.query), &map)?;
    let rows = client
        .run_query(q)
        .await
        .map_err(|e| format!("constraint {} failed: {e}", entry.name))?;
    let mut violations = Vec::new();
    for row in &rows {
        let bindings = extract_row_bindings(row);
        let diagnostic = entry
            .render(&bindings)
            .map_err(|e| format!("template render for {}: {e}", entry.name))?;
        violations.push(ConstraintViolation {
            constraint_name: entry.name.clone(),
            severity: entry.severity,
            diagnostic,
            details: Value::String(format!("{row:?}")),
        });
    }
    Ok(violations)
}

/// Run every enabled constraint and assemble a [`VerifierReport`].
pub async fn run_all(
    client: &Neo4jClient,
    deposit: &TrajectoryDeposit,
    home: &Path,
) -> Result<VerifierReport, String> {
    let registry = Registry::load(home)?;
    let mut violations = Vec::new();
    for entry in registry.entries.iter().filter(|e| e.enabled) {
        let mut produced = run_constraint(client, entry, deposit).await?;
        violations.append(&mut produced);
    }
    Ok(VerifierReport::new(
        deposit.deposit_id.clone(),
        deposit.session_key.clone(),
        now_ms(),
        violations,
    ))
}

fn extract_row_bindings(_row: &neo4rs::Row) -> BTreeMap<String, String> {
    // neo4rs's Row does not expose key iteration in its current API
    // (0.9.0-rc.9). We surface what we can — leaving bindings empty
    // means template placeholders render to empty strings. Real
    // constraint authors are expected to encode coordinate identifiers
    // into the constraint's anuttara_template as static text and use
    // the row only as evidence; this stays honest about the API limit
    // until neo4rs exposes key iteration.
    BTreeMap::new()
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    static COUNTER: AtomicUsize = AtomicUsize::new(0);

    fn tmp_home() -> PathBuf {
        let id = COUNTER.fetch_add(1, Ordering::SeqCst);
        let mut p = std::env::temp_dir();
        p.push(format!(
            "epi-s2-constraint-test-{}-{}",
            std::process::id(),
            id
        ));
        let _ = fs::remove_dir_all(&p);
        p
    }

    #[test]
    fn registry_round_trips_to_yaml() {
        let home = tmp_home();
        let mut registry = Registry::empty();
        registry.upsert(
            ConstraintRegistryEntry::new(
                "mirror_pair",
                "MATCH (n:Bimba) RETURN n LIMIT 1",
                ConstraintSeverity::Info,
                "#{a} ⟷ #{b}",
            )
            .unwrap(),
        );
        let path = registry.save(&home).unwrap();
        assert!(path.exists());
        let loaded = Registry::load(&home).unwrap();
        assert_eq!(loaded.entries.len(), 1);
        assert_eq!(loaded.entries[0].name, "mirror_pair");
    }

    #[test]
    fn registry_upsert_replaces_by_name() {
        let mut registry = Registry::empty();
        registry.upsert(
            ConstraintRegistryEntry::new(
                "n",
                "MATCH (n) RETURN n",
                ConstraintSeverity::Info,
                "?#X",
            )
            .unwrap(),
        );
        registry.upsert(
            ConstraintRegistryEntry::new(
                "n",
                "MATCH (n) RETURN n LIMIT 1",
                ConstraintSeverity::Warning,
                "?#Y",
            )
            .unwrap(),
        );
        assert_eq!(registry.entries.len(), 1);
        assert_eq!(registry.entries[0].severity, ConstraintSeverity::Warning);
    }

    #[test]
    fn registry_enable_disable_toggle() {
        let mut registry = Registry::empty();
        registry.upsert(
            ConstraintRegistryEntry::new(
                "n",
                "MATCH (n) RETURN n",
                ConstraintSeverity::Info,
                "?#X",
            )
            .unwrap(),
        );
        assert!(registry.set_enabled("n", false));
        assert!(!registry.find("n").unwrap().enabled);
        assert!(registry.set_enabled("n", true));
        assert!(registry.find("n").unwrap().enabled);
        assert!(!registry.set_enabled("missing", false));
    }

    #[test]
    fn register_rejects_write_queries() {
        let home = tmp_home();
        fs::create_dir_all(&home).unwrap();
        let qf = home.join("bad.cypher");
        fs::write(&qf, "CREATE (n:Bimba) RETURN n").unwrap();
        let err = register("bad", &qf, ConstraintSeverity::Info, "?#X", &home)
            .expect_err("write query should be rejected");
        assert!(err.contains("read-only"));
    }

    #[test]
    fn register_writes_yaml_registry_for_a_read_only_query() {
        let home = tmp_home();
        fs::create_dir_all(&home).unwrap();
        let qf = home.join("ok.cypher");
        fs::write(
            &qf,
            "MATCH (t:Bimba {coordinate: $canonical_coordinate}) RETURN t.coordinate AS coord",
        )
        .unwrap();
        let entry = register(
            "mid_position_adjacency",
            &qf,
            ConstraintSeverity::Warning,
            "?#{coord}{3}",
            &home,
        )
        .unwrap();
        assert_eq!(entry.name, "mid_position_adjacency");
        let registry = Registry::load(&home).unwrap();
        assert_eq!(registry.entries.len(), 1);
        assert_eq!(registry.entries[0].severity, ConstraintSeverity::Warning);
    }
}
