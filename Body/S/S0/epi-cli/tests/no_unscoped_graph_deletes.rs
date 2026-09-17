//! No test may delete graph data it did not create.
//!
//! On 2026-07-28 a `#[ignore]`d test in this crate ran
//! `MATCH (n:Bimba) DETACH DELETE n` as a "clean slate", then failed on a
//! missing config key *before* re-seeding. It was pointed at the live
//! development Neo4j, and it destroyed the Bimba coordinate graph — the
//! project's ontology, months of work.
//!
//! `#[ignore]` was the only thing standing in front of it. That is not a safety
//! boundary: `cargo test -- --ignored` runs it, and so does anyone sweeping the
//! live-infra suites. There was no test-database assertion, no fixture
//! isolation, and no confirmation.
//!
//! This guard makes the shape unwritable. A destructive statement must name
//! what it deletes — the pattern `graph-services` already used correctly
//! (`WHERE n.coordinate IN ['{source}', '{target}']`). A blanket label-wide or
//! graph-wide delete is rejected here, in this crate and in every other crate
//! under `Body/`, before it can reach anyone's database.
//!
//! If a test genuinely needs an empty graph, it needs its own throwaway
//! database — not a `DELETE` aimed at whatever `NEO4J_URI` happens to resolve
//! to.

use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent() // S0
        .and_then(Path::parent) // S
        .and_then(Path::parent) // Body
        .and_then(Path::parent) // repo root
        .expect("epi-cli sits four levels below the repo root")
        .to_path_buf()
}

fn rust_sources(root: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if path.is_dir() {
            if matches!(name.as_ref(), "target" | "node_modules" | ".git" | "vendor") {
                continue;
            }
            rust_sources(&path, out);
        } else if name.ends_with(".rs") {
            out.push(path);
        }
    }
}

/// A delete is scoped when the same statement constrains WHICH data it removes.
///
/// Accepted: a `WHERE` clause, an inline `{...}` property match, or a
/// parameterised match — anything that names the rows. Rejected: a bare label
/// or bare node pattern, which takes everything.
fn is_scoped(statement: &str) -> bool {
    let s = statement.to_ascii_lowercase();
    s.contains("where") || s.contains('{') || s.contains('$')
}

#[test]
fn no_rust_source_issues_an_unscoped_graph_delete() {
    let root = repo_root();
    let mut files = Vec::new();
    rust_sources(&root.join("Body"), &mut files);
    assert!(
        files.len() > 100,
        "guard scanned only {} Rust files — the walk is broken and would pass on nothing",
        files.len()
    );

    let mut violations: BTreeSet<String> = BTreeSet::new();
    for file in &files {
        // The guard must not flag itself.
        if file.ends_with("no_unscoped_graph_deletes.rs") {
            continue;
        }
        // There is NO sanctioned chokepoint and no opt-in. An earlier version of
        // this guard exempted `tests/common/disposable_graph.rs`, which held the
        // one permitted graph wipe behind an `EPI_DISPOSABLE_TEST_DB=1`
        // environment variable. That file is deleted: no environment variable
        // makes wiping the ontology acceptable, and an exemption is exactly the
        // hole through which the shape comes back.
        let Ok(text) = fs::read_to_string(file) else {
            continue;
        };
        if !text.contains("DETACH DELETE") && !text.contains("detach delete") {
            continue;
        }
        for (index, line) in text.lines().enumerate() {
            let upper = line.to_ascii_uppercase();
            if !upper.contains("DELETE") {
                continue;
            }
            // Reconstruct the statement: a Cypher string can wrap across lines,
            // so look at this line plus the two before it.
            let start = index.saturating_sub(2);
            let statement: String = text.lines().collect::<Vec<_>>()[start..=index].join(" ");
            let upper_statement = statement.to_ascii_uppercase();
            if !upper_statement.contains("DELETE") || !upper_statement.contains("MATCH") {
                continue;
            }
            if is_scoped(&statement) {
                continue;
            }
            // Only EXECUTED statements are dangerous. A destructive Cypher
            // string that is merely *data* — the corpus a guard asserts it
            // REJECTS, e.g. graph-services' cypher-guard and injection tests —
            // never reaches a database. The distinction is structural, not a
            // permit: the statement must be handed to an execution call.
            let executed = [".run(", ".execute(", ".execute_query(", "query("]
                .iter()
                .any(|call| statement.contains(call));
            if !executed {
                continue;
            }
            violations.insert(format!(
                "{}:{} → {}",
                file.strip_prefix(&root).unwrap_or(file).display(),
                index + 1,
                statement.trim()
            ));
        }
    }

    assert!(
        violations.is_empty(),
        "unscoped graph delete(s) found — these take EVERYTHING at the label and \
         cannot tell test fixtures from a real ontology:\n  {}\n\n\
         A destructive statement must name what it deletes. Scope it to the \
         coordinates the test created, e.g.\n\
         \x20   MATCH (n:Bimba) WHERE n.coordinate IN ['{{fixture_a}}', '{{fixture_b}}'] DETACH DELETE n\n\n\
         If a test truly needs an empty graph it needs its own throwaway database. \
         `#[ignore]` is not a safety boundary — `cargo test -- --ignored` runs it, \
         against whatever NEO4J_URI resolves to. That is how the Bimba graph was \
         destroyed on 2026-07-28.",
        violations.into_iter().collect::<Vec<_>>().join("\n  ")
    );
}

/// No environment variable may re-authorise a graph wipe.
///
/// The first attempt at fixing the 2026-07-28 loss put the wipe behind an opt-in
/// (`EPI_DISPOSABLE_TEST_DB=1`) in `tests/common/disposable_graph.rs`, exempt
/// from the guard above. That was rejected: there is no case in which deleting
/// the Bimba map is the right thing for a test to do, so there is nothing for an
/// opt-in to unlock — it only relocates the footgun into a shell variable that
/// someone will eventually export and forget. The helper is deleted; this test
/// keeps it deleted.
#[test]
fn no_environment_variable_re_authorises_a_graph_wipe() {
    let root = repo_root();
    let mut files = Vec::new();
    rust_sources(&root.join("Body"), &mut files);

    let mut offenders: BTreeSet<String> = BTreeSet::new();
    for file in &files {
        if file.ends_with("no_unscoped_graph_deletes.rs") {
            continue;
        }
        let Ok(text) = fs::read_to_string(file) else {
            continue;
        };
        if text.contains("EPI_DISPOSABLE_TEST_DB") {
            offenders.insert(
                file.strip_prefix(&root)
                    .unwrap_or(file)
                    .display()
                    .to_string(),
            );
        }
    }

    assert!(
        offenders.is_empty(),
        "a disposable-database opt-in was reintroduced in:\n  {}\n\n\
         Opting in does not make a real database disposable, and no environment \
         variable makes wiping the ontology acceptable. Scope the delete to the \
         fixtures the test created, or give the test its own throwaway instance.",
        offenders.into_iter().collect::<Vec<_>>().join("\n  ")
    );
}
