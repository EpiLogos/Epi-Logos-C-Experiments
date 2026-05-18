//! Constraint registry — typed shape of the verifier's structural
//! invariant queries (mental-pole mechanics §8).
//!
//! Each constraint is a named Cypher query plus the Anuttara template
//! that renders a detected violation back into the symbolic notation
//! [`crate::AnuttaraDiagnostic`] understands.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::diagnostic::{AnuttaraDiagnostic, AnuttaraParseError};

/// Severity of a constraint. Warnings raise questions; errors block
/// deposits per the spec's progressive promotion model.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ConstraintSeverity {
    Info,
    Warning,
    Error,
}

impl Default for ConstraintSeverity {
    fn default() -> Self {
        Self::Warning
    }
}

/// One registered constraint.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConstraintRegistryEntry {
    pub name: String,
    pub query: String,
    pub severity: ConstraintSeverity,
    pub anuttara_template: String,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

fn default_enabled() -> bool {
    true
}

impl ConstraintRegistryEntry {
    pub fn new(
        name: impl Into<String>,
        query: impl Into<String>,
        severity: ConstraintSeverity,
        anuttara_template: impl Into<String>,
    ) -> Result<Self, &'static str> {
        let name = name.into();
        let query = query.into();
        let anuttara_template = anuttara_template.into();
        if name.trim().is_empty() {
            return Err("constraint name must be non-empty");
        }
        if query.trim().is_empty() {
            return Err("constraint query must be non-empty");
        }
        if anuttara_template.trim().is_empty() {
            return Err("constraint anuttara_template must be non-empty");
        }
        Ok(Self {
            name,
            query,
            severity,
            anuttara_template,
            enabled: true,
        })
    }

    /// Render the Anuttara template with values from a violation row.
    /// Placeholders are `{key}` referencing string keys in `bindings`.
    /// Missing keys are left as the empty string and reported through
    /// the returned diagnostic's `source_constraint`.
    pub fn render(&self, bindings: &BTreeMap<String, String>) -> Result<AnuttaraDiagnostic, AnuttaraParseError> {
        let mut rendered = String::with_capacity(self.anuttara_template.len());
        let mut iter = self.anuttara_template.chars().peekable();
        while let Some(ch) = iter.next() {
            if ch == '{' {
                let mut key = String::new();
                while let Some(&next) = iter.peek() {
                    if next == '}' {
                        iter.next();
                        break;
                    }
                    key.push(next);
                    iter.next();
                }
                if let Some(value) = bindings.get(&key) {
                    rendered.push_str(value);
                }
            } else {
                rendered.push(ch);
            }
        }
        let diag = AnuttaraDiagnostic::parse(&rendered)?.with_source_constraint(self.name.clone());
        Ok(diag)
    }
}

/// One violation produced by running a constraint over a trajectory.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ConstraintViolation {
    pub constraint_name: String,
    pub severity: ConstraintSeverity,
    pub diagnostic: AnuttaraDiagnostic,
    pub details: Value,
}

/// Aggregate report from running all constraints over a trajectory.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct VerifierReport {
    pub trajectory_id: String,
    pub session_key: String,
    pub timestamp_ms: u64,
    pub violations: Vec<ConstraintViolation>,
    pub coherence_recognised: bool,
}

impl VerifierReport {
    /// Build a report and synthesise its overall AnuttaraDiagnostic by
    /// concatenating violation diagnostics; emits silence (`○`) when
    /// no violations were produced.
    pub fn new(
        trajectory_id: impl Into<String>,
        session_key: impl Into<String>,
        timestamp_ms: u64,
        violations: Vec<ConstraintViolation>,
    ) -> Self {
        let coherence_recognised = violations.is_empty();
        Self {
            trajectory_id: trajectory_id.into(),
            session_key: session_key.into(),
            timestamp_ms,
            violations,
            coherence_recognised,
        }
    }

    /// Maximum severity across all violations. Returns `None` when the
    /// report is silent.
    pub fn max_severity(&self) -> Option<ConstraintSeverity> {
        self.violations
            .iter()
            .map(|v| v.severity)
            .max_by_key(severity_rank)
    }

    /// Synthesise an [`AnuttaraDiagnostic`] from the report — silence
    /// when no violations, otherwise a compound diagnostic
    /// concatenating each violation's symbolic expression.
    pub fn synthesise_diagnostic(&self) -> AnuttaraDiagnostic {
        if self.violations.is_empty() {
            return AnuttaraDiagnostic::silence();
        }
        let mut questions = Vec::new();
        for violation in &self.violations {
            questions.extend(violation.diagnostic.questions.iter().cloned());
        }
        AnuttaraDiagnostic {
            raw_expression: questions
                .iter()
                .map(crate::diagnostic::AnuttaraExpression::render)
                .collect::<Vec<_>>()
                .join("; "),
            coordinate_owner: AnuttaraDiagnostic::COORDINATE_OWNER.to_owned(),
            questions,
            coherence_recognised: false,
            source_constraint: None,
        }
    }
}

fn severity_rank(severity: &ConstraintSeverity) -> u8 {
    match severity {
        ConstraintSeverity::Info => 0,
        ConstraintSeverity::Warning => 1,
        ConstraintSeverity::Error => 2,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entry_construction_validates_fields() {
        assert!(
            ConstraintRegistryEntry::new("", "MATCH (n) RETURN n", ConstraintSeverity::Warning, "?#X")
                .is_err()
        );
        assert!(
            ConstraintRegistryEntry::new("n", "", ConstraintSeverity::Warning, "?#X").is_err()
        );
        assert!(
            ConstraintRegistryEntry::new("n", "MATCH (n) RETURN n", ConstraintSeverity::Warning, "")
                .is_err()
        );
        ConstraintRegistryEntry::new(
            "mid_position_adjacency",
            "MATCH (t) RETURN t",
            ConstraintSeverity::Warning,
            "?#{coord}{3}",
        )
        .unwrap();
    }

    #[test]
    fn template_renders_with_bindings_and_attaches_constraint_name() {
        let entry = ConstraintRegistryEntry::new(
            "mid_position_adjacency",
            "MATCH (t) RETURN t",
            ConstraintSeverity::Warning,
            "?#{coord}{3}",
        )
        .unwrap();
        // Bindings provide the coord body; the template fixes the
        // family prefix (`#`). Per spec §8 `anuttara_template` sample
        // `"?#{coord}{3}"`, `coord` substitutes after the `#`.
        let mut bindings = BTreeMap::new();
        bindings.insert("coord".to_owned(), "2-1-3".to_owned());
        let diag = entry.render(&bindings).unwrap();
        assert_eq!(diag.source_constraint.as_deref(), Some("mid_position_adjacency"));
        assert_eq!(diag.questions.len(), 1);
    }

    #[test]
    fn empty_violations_synthesise_silence() {
        let report = VerifierReport::new("t-1", "session-1", 100, vec![]);
        assert!(report.coherence_recognised);
        let diag = report.synthesise_diagnostic();
        assert!(diag.coherence_recognised);
        assert!(diag.questions.is_empty());
        assert!(report.max_severity().is_none());
    }

    #[test]
    fn nonempty_violations_aggregate_into_compound_diagnostic() {
        let entry = ConstraintRegistryEntry::new(
            "mirror_pair",
            "MATCH (m) RETURN m",
            ConstraintSeverity::Info,
            "#{a} ⟷ #{b}",
        )
        .unwrap();
        // Template `#{a} ⟷ #{b}` — `#` is in the template, bindings
        // provide the digit-only coord body.
        let mut bindings = BTreeMap::new();
        bindings.insert("a".to_owned(), "2-1-0".to_owned());
        bindings.insert("b".to_owned(), "2-1-5".to_owned());
        let diag = entry.render(&bindings).unwrap();
        let violations = vec![ConstraintViolation {
            constraint_name: entry.name.clone(),
            severity: entry.severity,
            diagnostic: diag,
            details: serde_json::json!({"row": "data"}),
        }];
        let report = VerifierReport::new("t-2", "session-1", 100, violations);
        assert!(!report.coherence_recognised);
        assert_eq!(report.max_severity(), Some(ConstraintSeverity::Info));
        let synth = report.synthesise_diagnostic();
        assert!(!synth.coherence_recognised);
        assert_eq!(synth.questions.len(), 1);
    }

    #[test]
    fn registry_entry_serde_round_trips() {
        let entry = ConstraintRegistryEntry::new(
            "n",
            "MATCH (n) RETURN n",
            ConstraintSeverity::Error,
            "?#X",
        )
        .unwrap();
        let json = serde_json::to_string(&entry).unwrap();
        let restored: ConstraintRegistryEntry = serde_json::from_str(&json).unwrap();
        assert_eq!(entry, restored);
    }
}
