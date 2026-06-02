//! Constrained Cypher passthrough — graph-law executor.
//!
//! S2 is the authority for what counts as a permissible Cypher write
//! against the bimba graph. This module hosts the guard-and-run pipeline
//! that the S0 `epi graph cypher` adapter dispatches into. Read queries
//! are unrestricted; write queries (CREATE/MERGE/SET/DELETE/REMOVE/etc.)
//! require an explicit `--write` flag at the CLI; schema-altering DDL
//! requires `--admin`; row count is budgeted to prevent accidental
//! graph-wide scans.

use neo4rs::{query, BoltType, Query, Row};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

use crate::Neo4jClient;

pub const MAX_ROW_LIMIT: usize = 10_000;
pub const DEFAULT_ROW_LIMIT: usize = 200;

/// Decision about whether a Cypher statement is permitted under the
/// current mode.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CypherGuardOutcome {
    AllowedRead,
    AllowedWrite,
    AllowedAdmin,
    DeniedRequiresWriteFlag { offending_keyword: String },
    DeniedRequiresAdminFlag { offending_keyword: String },
}

/// Runtime mode requested by the caller.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CypherMode {
    pub allow_write: bool,
    pub allow_admin: bool,
}

impl CypherMode {
    pub const READ_ONLY: Self = Self {
        allow_write: false,
        allow_admin: false,
    };

    pub const WRITE: Self = Self {
        allow_write: true,
        allow_admin: false,
    };

    pub const ADMIN: Self = Self {
        allow_write: true,
        allow_admin: true,
    };
}

const WRITE_KEYWORDS: &[&str] = &[
    "CREATE", "MERGE", "SET", "DELETE", "DETACH", "REMOVE", "FOREACH", "LOAD", "CALL",
];

const ADMIN_KEYWORDS: &[&str] = &[
    "CREATE INDEX",
    "DROP INDEX",
    "CREATE CONSTRAINT",
    "DROP CONSTRAINT",
    "ALTER",
    "GRANT",
    "REVOKE",
    "DENY",
    "START DATABASE",
    "STOP DATABASE",
    "CREATE DATABASE",
    "DROP DATABASE",
];

/// Inspect a Cypher statement and decide whether it is permitted under
/// the current mode. The check is uppercase-token based and rejects
/// `CALL { ... }` unless write mode is on, since procedure calls may
/// mutate state.
pub fn check_statement(cypher: &str, mode: CypherMode) -> CypherGuardOutcome {
    let normalised = strip_comments(cypher).to_uppercase();
    for admin_kw in ADMIN_KEYWORDS {
        if statement_contains_keyword(&normalised, admin_kw) && !mode.allow_admin {
            return CypherGuardOutcome::DeniedRequiresAdminFlag {
                offending_keyword: (*admin_kw).to_owned(),
            };
        }
    }
    for write_kw in WRITE_KEYWORDS {
        if statement_contains_keyword(&normalised, write_kw) && !mode.allow_write {
            return CypherGuardOutcome::DeniedRequiresWriteFlag {
                offending_keyword: (*write_kw).to_owned(),
            };
        }
    }
    if mode.allow_admin {
        CypherGuardOutcome::AllowedAdmin
    } else if mode.allow_write {
        CypherGuardOutcome::AllowedWrite
    } else {
        CypherGuardOutcome::AllowedRead
    }
}

fn strip_comments(cypher: &str) -> String {
    let mut out = String::with_capacity(cypher.len());
    let mut chars = cypher.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '/' && chars.peek() == Some(&'/') {
            while let Some(next) = chars.next() {
                if next == '\n' {
                    out.push('\n');
                    break;
                }
            }
        } else if ch == '/' && chars.peek() == Some(&'*') {
            chars.next();
            let mut prev = ' ';
            for next in chars.by_ref() {
                if prev == '*' && next == '/' {
                    break;
                }
                prev = next;
            }
        } else {
            out.push(ch);
        }
    }
    out
}

fn statement_contains_keyword(upper_cypher: &str, keyword: &str) -> bool {
    let bytes = upper_cypher.as_bytes();
    let target = keyword.as_bytes();
    let mut i = 0;
    'outer: while i + target.len() <= bytes.len() {
        for (j, ch) in target.iter().enumerate() {
            if bytes[i + j] != *ch {
                i += 1;
                continue 'outer;
            }
        }
        let before_ok = i == 0 || !is_identifier_byte(bytes[i - 1]);
        let after_idx = i + target.len();
        let after_ok = after_idx >= bytes.len() || !is_identifier_byte(bytes[after_idx]);
        if before_ok && after_ok {
            return true;
        }
        i += 1;
    }
    false
}

fn is_identifier_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_'
}

/// JSON payload returned to the CLI / TS frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CypherResult {
    pub mode: String,
    pub guard: CypherGuardOutcome,
    pub row_count: usize,
    pub truncated: bool,
    pub rows: Vec<Value>,
}

/// Parse a parameter JSON object into neo4rs bolt-typed query
/// parameters. Numbers map to Integer or Float per their representation,
/// strings to String, booleans to Boolean, null to Null.
pub fn apply_params(mut q: Query, params: &Map<String, Value>) -> Result<Query, String> {
    for (name, value) in params {
        q = match value {
            Value::String(s) => q.param(name.as_str(), s.clone()),
            Value::Bool(b) => q.param(name.as_str(), *b),
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    q.param(name.as_str(), i)
                } else if let Some(f) = n.as_f64() {
                    q.param(name.as_str(), f)
                } else {
                    return Err(format!("parameter `{name}` is an unsupported number"));
                }
            }
            Value::Null => q.param(name.as_str(), BoltType::Null(neo4rs::BoltNull)),
            Value::Array(_) | Value::Object(_) => {
                return Err(format!(
                    "parameter `{name}` must be scalar (string, number, bool, or null)"
                ));
            }
        };
    }
    Ok(q)
}

/// Execute a Cypher statement against the client and return a typed
/// result with row budgeting.
pub async fn run(
    client: &Neo4jClient,
    cypher: &str,
    params: &Map<String, Value>,
    mode: CypherMode,
    limit: usize,
) -> Result<CypherResult, String> {
    if cypher.trim().is_empty() {
        return Err("cypher query must be non-empty".to_string());
    }
    let limit = limit.min(MAX_ROW_LIMIT);
    let guard = check_statement(cypher, mode);
    match &guard {
        CypherGuardOutcome::DeniedRequiresWriteFlag { offending_keyword } => {
            return Err(format!(
                "denied: {offending_keyword} requires `--write` (mode read-only)"
            ));
        }
        CypherGuardOutcome::DeniedRequiresAdminFlag { offending_keyword } => {
            return Err(format!(
                "denied: {offending_keyword} requires `--admin` (DDL operations)"
            ));
        }
        _ => {}
    }
    let q = apply_params(query(cypher), params)?;
    let raw_rows = client
        .run_query(q)
        .await
        .map_err(|e| format!("cypher execution failed: {e}"))?;
    let truncated = raw_rows.len() > limit;
    let rows: Vec<Value> = raw_rows.iter().take(limit).map(row_to_json).collect();
    Ok(CypherResult {
        mode: match mode {
            CypherMode::READ_ONLY => "read".into(),
            CypherMode::WRITE => "write".into(),
            CypherMode::ADMIN => "admin".into(),
            _ => "custom".into(),
        },
        guard,
        row_count: rows.len(),
        truncated,
        rows,
    })
}

fn row_to_json(row: &Row) -> Value {
    // neo4rs's Row doesn't expose key iteration directly; use Debug as
    // a fallback to capture the row's contents. Most callers use the
    // CLI's JSON output, so this keeps the result inspectable.
    Value::String(format!("{row:?}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn read_only_mode_allows_match_queries() {
        let outcome = check_statement(
            "MATCH (n:Bimba {coordinate: $coord}) RETURN n",
            CypherMode::READ_ONLY,
        );
        assert!(matches!(outcome, CypherGuardOutcome::AllowedRead));
    }

    #[test]
    fn read_only_mode_blocks_writes() {
        for stmt in [
            "CREATE (n:Bimba) RETURN n",
            "MATCH (n:Bimba) SET n.foo = 1",
            "MATCH (n:Bimba) DETACH DELETE n",
            "MERGE (n:Bimba {coordinate: 'M0'})",
        ] {
            let outcome = check_statement(stmt, CypherMode::READ_ONLY);
            assert!(
                matches!(outcome, CypherGuardOutcome::DeniedRequiresWriteFlag { .. }),
                "expected denial for {stmt}"
            );
        }
    }

    #[test]
    fn write_mode_allows_writes_but_blocks_ddl() {
        let create_outcome = check_statement("CREATE (n:Bimba) RETURN n", CypherMode::WRITE);
        assert!(matches!(create_outcome, CypherGuardOutcome::AllowedWrite));

        let index_outcome = check_statement(
            "CREATE INDEX foo IF NOT EXISTS FOR (n:Bimba) ON (n.coordinate)",
            CypherMode::WRITE,
        );
        assert!(matches!(
            index_outcome,
            CypherGuardOutcome::DeniedRequiresAdminFlag { .. }
        ));
    }

    #[test]
    fn admin_mode_allows_ddl() {
        let outcome = check_statement(
            "DROP CONSTRAINT bimba_coord_unique IF EXISTS",
            CypherMode::ADMIN,
        );
        assert!(matches!(outcome, CypherGuardOutcome::AllowedAdmin));
    }

    #[test]
    fn comments_do_not_smuggle_writes() {
        let stmt = "// CREATE (n:Bimba) RETURN n\nMATCH (n) RETURN n";
        let outcome = check_statement(stmt, CypherMode::READ_ONLY);
        assert!(matches!(outcome, CypherGuardOutcome::AllowedRead));

        let block = "/* CREATE */ MATCH (n) RETURN n";
        let outcome = check_statement(block, CypherMode::READ_ONLY);
        assert!(matches!(outcome, CypherGuardOutcome::AllowedRead));
    }

    #[test]
    fn keyword_match_respects_identifier_boundaries() {
        let stmt = "MATCH (n) WHERE n.label = 'CREATED' RETURN n";
        let outcome = check_statement(stmt, CypherMode::READ_ONLY);
        assert!(matches!(outcome, CypherGuardOutcome::AllowedRead));
    }

    #[test]
    fn empty_query_passes_guard_but_run_rejects_it() {
        let outcome = check_statement("", CypherMode::READ_ONLY);
        assert!(matches!(outcome, CypherGuardOutcome::AllowedRead));
    }
}
