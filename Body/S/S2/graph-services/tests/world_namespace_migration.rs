//! Binds the 09.T9.14 namespace-promotion migration to the S2 schema registries.
//!
//! The migration is a text file the Architect runs by hand, so nothing in the normal build would
//! notice if one of its labels, relation types or properties drifted away from
//! `epi-s2-graph-schema`. This suite is that notice: it reads the real `.cypher` file and refuses
//! any literal the registries do not know, and it pins the two safety properties the migration
//! claims in its own header — that it destroys nothing, and that every step is either a
//! probe+apply pair or a read-only report.

use epi_s2_graph_schema::{
    label_spec, node_property_spec, relationship_spec, ARCHETYPAL_LABEL, GNOSTIC_LABEL,
    SOURCE_ARTIFACT_SPAN_PROPERTY, WORLD_FORM_OF_RELATION, WORLD_LABEL, WORLD_ONTOLOGY_OF_RELATION,
};

const MIGRATION: &str = include_str!("../migrations/2026-08-01-world-gnostic-namespace-promotion.cypher");

/// The lowercase workspace label the Gnostic Python storage adapter MERGEs on
/// (`GNOSTIC_WORKSPACE`, default `gnostic`, `epi_gnostic/config.py`). It is deliberately NOT a
/// registered canonical label — it is what the migration promotes *from*, and DR-S5-ONE-1 is the
/// decision to give that data a real schema label. Exempted by name so the exemption is legible
/// rather than a hole in the check.
const WORKSPACE_LABEL_PROMOTED_FROM: &str = "gnostic";

/// A Python-side storage discriminator on Gnostic nodes, inventoried by the migration's report step
/// and never written by it. It has no S2 schema spec because S2 does not own it.
const GNOSTIC_STORAGE_FIELD: &str = "gnostic_ns";

/// Strip `//` comments and single-quoted string literals, so prose and path literals cannot be
/// mistaken for schema references.
fn executable_text(source: &str) -> String {
    let mut out = String::with_capacity(source.len());
    for line in source.lines() {
        let code = match line.find("//") {
            Some(index) => &line[..index],
            None => line,
        };
        let mut in_string = false;
        for ch in code.chars() {
            if ch == '\'' {
                in_string = !in_string;
                continue;
            }
            out.push(if in_string { ' ' } else { ch });
        }
        out.push('\n');
    }
    out
}

fn identifier_at(bytes: &[u8], start: usize) -> String {
    let mut end = start;
    while end < bytes.len() && (bytes[end].is_ascii_alphanumeric() || bytes[end] == b'_') {
        end += 1;
    }
    String::from_utf8_lossy(&bytes[start..end]).into_owned()
}

/// `[:REL_TYPE]` — relationship types only ever appear inside a relationship pattern.
fn relationship_types(code: &str) -> Vec<String> {
    let bytes = code.as_bytes();
    let mut found = Vec::new();
    for index in 0..bytes.len().saturating_sub(2) {
        if bytes[index] == b'[' && bytes[index + 1] == b':' && bytes[index + 2].is_ascii_uppercase() {
            found.push(identifier_at(bytes, index + 2));
        }
    }
    found.sort();
    found.dedup();
    found
}

/// `:Label` — a colon immediately followed by an identifier start, outside a relationship pattern.
/// A map key (`{coordinate: value}`) puts the colon *after* the identifier, so it never matches.
fn labels(code: &str) -> Vec<String> {
    let bytes = code.as_bytes();
    let mut found = Vec::new();
    for index in 0..bytes.len().saturating_sub(1) {
        if bytes[index] != b':' {
            continue;
        }
        if index > 0 && bytes[index - 1] == b'[' {
            continue; // relationship type, handled above
        }
        if bytes[index + 1].is_ascii_alphabetic() {
            found.push(identifier_at(bytes, index + 1));
        }
    }
    found.sort();
    found.dedup();
    found
}

/// `alias.property` — property reads and writes.
fn properties(code: &str) -> Vec<String> {
    let bytes = code.as_bytes();
    let mut found = Vec::new();
    for index in 1..bytes.len().saturating_sub(1) {
        if bytes[index] != b'.' {
            continue;
        }
        if !(bytes[index - 1].is_ascii_alphanumeric() || bytes[index - 1] == b'_') {
            continue;
        }
        if bytes[index + 1].is_ascii_alphabetic() || bytes[index + 1] == b'_' {
            found.push(identifier_at(bytes, index + 1));
        }
    }
    found.sort();
    found.dedup();
    found
}

#[test]
fn migration_names_only_registered_labels() {
    let code = executable_text(MIGRATION);
    let found = labels(&code);

    assert!(
        found.iter().any(|label| label == WORLD_LABEL),
        "migration must promote {WORLD_LABEL}; found {found:?}"
    );
    assert!(found.iter().any(|label| label == ARCHETYPAL_LABEL));
    assert!(found.iter().any(|label| label == GNOSTIC_LABEL));

    for label in &found {
        if label == WORKSPACE_LABEL_PROMOTED_FROM {
            assert!(
                label_spec(label).is_none(),
                "{label} is the implicit workspace label the migration promotes FROM; if it ever \
                 becomes a registered canonical label this exemption must be removed"
            );
            continue;
        }
        assert!(
            label_spec(label).is_some(),
            "migration uses label `{label}`, which epi-s2-graph-schema does not register — a \
             migration may never mint a label the schema has not declared"
        );
    }
}

#[test]
fn migration_names_only_registered_relationship_types() {
    let code = executable_text(MIGRATION);
    let found = relationship_types(&code);

    assert_eq!(
        found,
        vec![
            WORLD_FORM_OF_RELATION.to_owned(),
            WORLD_ONTOLOGY_OF_RELATION.to_owned()
        ],
        "the migration's relation set is the DR-WORLD-1 pair and nothing else"
    );
    for rel_type in &found {
        let spec = relationship_spec(rel_type)
            .unwrap_or_else(|_| panic!("migration uses unregistered relation `{rel_type}`"));
        assert_eq!(spec.source_family, "world-entity");
        assert!(!spec.compatibility, "{rel_type} must be canonical, not a compatibility shim");
    }
}

#[test]
fn migration_reads_only_registered_properties() {
    let code = executable_text(MIGRATION);

    for property in properties(&code) {
        if property == GNOSTIC_STORAGE_FIELD {
            assert!(
                node_property_spec(&property).is_none(),
                "{property} is a Python-side storage field S2 does not own"
            );
            continue;
        }
        assert!(
            node_property_spec(&property).is_some(),
            "migration touches property `{property}`, which epi-s2-graph-schema does not register"
        );
    }
}

#[test]
fn migration_destroys_nothing() {
    let code = executable_text(MIGRATION).to_uppercase();

    for clause in ["DELETE", "REMOVE", "DROP", "DETACH"] {
        assert!(
            !code.contains(clause),
            "the migration header promises no destructive clause, but `{clause}` is present in an \
             executable statement — a label-promotion migration never removes anything"
        );
    }
}

#[test]
fn every_step_is_a_probe_apply_pair_or_a_report() {
    let mut steps = 0usize;
    let mut current: Option<(String, bool, bool, bool)> = None;
    let mut finished: Vec<(String, bool, bool, bool)> = Vec::new();

    for line in MIGRATION.lines().map(str::trim) {
        if let Some(name) = line.strip_prefix("// @step:") {
            if let Some(step) = current.take() {
                finished.push(step);
            }
            steps += 1;
            current = Some((name.trim().to_owned(), false, false, false));
            continue;
        }
        let Some(step) = current.as_mut() else { continue };
        match line {
            "// @probe" => step.1 = true,
            "// @apply" => step.2 = true,
            "// @report" => step.3 = true,
            _ => {}
        }
    }
    if let Some(step) = current.take() {
        finished.push(step);
    }

    assert!(steps >= 5, "expected the five DR-WORLD-1 / DR-S5-ONE-1 steps, found {steps}");
    for (name, probe, apply, report) in finished {
        if report {
            assert!(
                !apply,
                "step `{name}` is a report and must never carry an apply block"
            );
            continue;
        }
        assert!(
            probe && apply,
            "step `{name}` must carry both a probe and an apply block: the runner's dry run has \
             nothing to show without the probe, and its idempotency assertion re-runs the probe \
             after the apply"
        );
    }
}

#[test]
fn wikilink_span_pointer_stays_hen_owned() {
    // CCT-17b puts `c_1_source_artifact_span` on the World node, populated by Hen from the
    // artifact's own wikilinks. A graph-only migration cannot read the vault, so it must not
    // pretend to backfill the pointer. The property is registered; the migration leaves it alone.
    assert!(node_property_spec(SOURCE_ARTIFACT_SPAN_PROPERTY).is_some());
    assert!(
        !executable_text(MIGRATION).contains(SOURCE_ARTIFACT_SPAN_PROPERTY),
        "the migration must not write {SOURCE_ARTIFACT_SPAN_PROPERTY} — Hen owns it"
    );
}
