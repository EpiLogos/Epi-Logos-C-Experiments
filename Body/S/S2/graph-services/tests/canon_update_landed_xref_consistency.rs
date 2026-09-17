// Track 40 · T40.2 — Lint test: canon-update landing-invariant cross-reference consistency.
//
// Coordinate: S2 (GraphDB substrate) test surface enforcing an M' canon governance law.
// Provenance: cycle-3 full rerun tranche 40.T40.2, brief at
//   Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md
//   §Cross-reference discipline (c) (:138) + §Tranches 40.2 (:162-164).
//
// The Track-40 canon-update ledger holds additive bimba-canon proposals. When a row reaches
// `status: landed` the invariant (ledger §Boundary discipline / §Lifecycle `landed`) is:
//   (a) the target canon file carries an inline `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->`
//       marker adjacent to the landed paragraph, AND
//   (b) the target canon file's frontmatter carries a `canon_updates_landed` whole-file index
//       entry `"CU-*@YYYY-MM-DD"` for that row.
// Mismatch is a build failure — the ledger is the only legal source of canon-update markers
// (ledger §Cross-reference discipline (d)).
//
// Scope note: the invariant is a *canon-file* convention (Seeds/World canon spec files). A CU
// row may also declare a DR-register spec-edit target under `.../Legacy/plans/` (e.g. the
// DR-M3-6 amendment for CU-FORM-1); that landing is tracked by the DR amendment block, not the
// `canon_updates_landed` frontmatter index, so register targets are excluded here.

use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

const LEDGER_REL: &str = "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md";

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .find(|ancestor| ancestor.join(LEDGER_REL).is_file())
        .expect("repo root carrying the Track-40 canon-update ledger")
        .to_path_buf()
}

/// A canon file is a Seeds/M target that is NOT a plan-folder register: the
/// `canon_updates_landed` frontmatter + inline-marker invariant is a canon-spec convention.
fn is_canon_file(path: &str) -> bool {
    path.starts_with("Idea/Bimba/Seeds/M/") && !path.contains("/Legacy/plans/")
}

#[derive(Debug)]
struct LandedRow {
    id: String,
    canon_targets: BTreeSet<String>,
}

/// Extract every `path: "..."` value on a line (ledger `target_landing_site` objects).
fn paths_on_line(line: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = line;
    while let Some(idx) = rest.find("path: \"") {
        let after = &rest[idx + "path: \"".len()..];
        if let Some(end) = after.find('"') {
            out.push(after[..end].to_string());
            rest = &after[end + 1..];
        } else {
            break;
        }
    }
    out
}

/// Parse the ledger markdown into the set of `status: landed` rows and their canon targets.
/// Rows are the `## CU-*` H2 sections; fields (Status, target paths) are scoped to each section
/// so the header's schema table / frontmatter `downstream_landing_sites` never leak in.
fn parse_landed_rows(ledger: &str) -> Vec<LandedRow> {
    let mut rows: Vec<LandedRow> = Vec::new();
    let mut cur_id: Option<String> = None;
    let mut cur_landed = false;
    let mut cur_targets: BTreeSet<String> = BTreeSet::new();

    let flush = |rows: &mut Vec<LandedRow>, id: &Option<String>, landed: bool, targets: &BTreeSet<String>| {
        if let Some(id) = id {
            if landed {
                rows.push(LandedRow {
                    id: id.clone(),
                    canon_targets: targets.iter().cloned().collect(),
                });
            }
        }
    };

    for line in ledger.lines() {
        if let Some(rest) = line.strip_prefix("## ") {
            // Section boundary: flush the previous CU row, then open a new context.
            flush(&mut rows, &cur_id, cur_landed, &cur_targets);
            cur_id = None;
            cur_landed = false;
            cur_targets = BTreeSet::new();
            if rest.starts_with("CU-") {
                if let Some(tok) = rest.split_whitespace().next() {
                    cur_id = Some(tok.to_string());
                }
            }
            continue;
        }
        if cur_id.is_none() {
            continue;
        }
        if let Some(after) = line.split("**Status:**").nth(1) {
            if after.trim().split_whitespace().next() == Some("landed") {
                cur_landed = true;
            }
        }
        for p in paths_on_line(line) {
            if is_canon_file(&p) {
                cur_targets.insert(p);
            }
        }
    }
    flush(&mut rows, &cur_id, cur_landed, &cur_targets);
    rows
}

/// Return the frontmatter block (between the leading `---` fences), if present.
fn frontmatter_block(text: &str) -> Option<&str> {
    let rest = text.strip_prefix("---\n").or_else(|| text.strip_prefix("---\r\n"))?;
    let end = rest.find("\n---").or_else(|| rest.find("\r\n---"))?;
    Some(&rest[..end])
}

/// Parse the `canon_updates_landed` frontmatter array into the set of CU ids (the `@date` suffix
/// is stripped). Handles the block-list form (`  - "CU-*@DATE"`).
fn canon_updates_landed_ids(frontmatter: &str) -> BTreeSet<String> {
    let mut ids = BTreeSet::new();
    let mut in_block = false;
    for line in frontmatter.lines() {
        let trimmed = line.trim_start();
        if trimmed.starts_with("canon_updates_landed:") {
            in_block = true;
            continue;
        }
        if in_block {
            if trimmed.starts_with("- ") {
                let item = trimmed[2..].trim().trim_matches('"');
                let id = item.split('@').next().unwrap_or(item).trim();
                if !id.is_empty() {
                    ids.insert(id.to_string());
                }
            } else if !trimmed.is_empty() {
                // Next key at frontmatter level ends the block.
                in_block = false;
            }
        }
    }
    ids
}

/// Every `<!-- canon-update: CU-* ... -->` marker id present in a file.
fn markers_in_file(text: &str) -> BTreeSet<String> {
    let mut ids = BTreeSet::new();
    let needle = "<!-- canon-update: ";
    let mut rest = text;
    while let Some(idx) = rest.find(needle) {
        let after = &rest[idx + needle.len()..];
        if let Some(tok) = after.split_whitespace().next() {
            if tok.starts_with("CU-") {
                ids.insert(tok.to_string());
            }
        }
        rest = &after[..];
        // advance past this needle occurrence
        rest = &rest[1..];
    }
    ids
}

#[test]
fn canon_update_landed_rows_are_cross_reference_consistent() {
    let root = repo_root();
    let ledger = fs::read_to_string(root.join(LEDGER_REL)).expect("read Track-40 ledger");
    let landed = parse_landed_rows(&ledger);

    assert!(
        !landed.is_empty(),
        "expected at least one status:landed CU row in the Track-40 ledger; parser found none"
    );

    let mut violations: Vec<String> = Vec::new();

    // Union of canon files any landed row points at — the domain of the reverse (whole-file) check.
    let mut targeted_files: BTreeSet<String> = BTreeSet::new();
    for row in &landed {
        for t in &row.canon_targets {
            targeted_files.insert(t.clone());
        }
    }

    let landed_ids: BTreeSet<String> = landed.iter().map(|r| r.id.clone()).collect();

    // Cache each targeted file's markers + frontmatter ids.
    let mut file_markers: std::collections::BTreeMap<String, BTreeSet<String>> = Default::default();
    let mut file_fm_ids: std::collections::BTreeMap<String, BTreeSet<String>> = Default::default();
    for path in &targeted_files {
        let abs = root.join(path);
        match fs::read_to_string(&abs) {
            Ok(text) => {
                file_markers.insert(path.clone(), markers_in_file(&text));
                let fm = frontmatter_block(&text).map(canon_updates_landed_ids).unwrap_or_default();
                file_fm_ids.insert(path.clone(), fm);
            }
            Err(e) => violations.push(format!("target canon file {path} is unreadable: {e}")),
        }
    }

    // Direction A (forward, ledger -> file): each landed row's canon target carries the marker
    // AND a frontmatter index entry for the row id.
    for row in &landed {
        if row.canon_targets.is_empty() {
            violations.push(format!(
                "landed row {} declares no canon-file target landing site (all targets filtered as non-canon)",
                row.id
            ));
            continue;
        }
        for path in &row.canon_targets {
            if let Some(markers) = file_markers.get(path) {
                if !markers.contains(&row.id) {
                    violations.push(format!(
                        "{path} is a landing site for {} but carries no `<!-- canon-update: {} ... -->` inline marker",
                        row.id, row.id
                    ));
                }
            }
            if let Some(fm) = file_fm_ids.get(path) {
                if !fm.contains(&row.id) {
                    violations.push(format!(
                        "{path} frontmatter `canon_updates_landed` is missing an entry for landed row {}",
                        row.id
                    ));
                }
            }
        }
    }

    // Direction B (reverse, file -> ledger): every canon-update marker present in a targeted
    // canon file must have a frontmatter index entry and reference a landed ledger row.
    for path in &targeted_files {
        let markers = file_markers.get(path).cloned().unwrap_or_default();
        let fm = file_fm_ids.get(path).cloned().unwrap_or_default();
        for id in &markers {
            if !landed_ids.contains(id) {
                violations.push(format!(
                    "{path} carries an orphan `<!-- canon-update: {id} ... -->` marker with no status:landed ledger row (the ledger is the only legal marker source)"
                ));
            }
            if !fm.contains(id) {
                violations.push(format!(
                    "{path} carries a `{id}` marker but its frontmatter `canon_updates_landed` whole-file index omits it"
                ));
            }
        }
    }

    assert!(
        violations.is_empty(),
        "canon-update landing invariant violated ({} issue(s)):\n  - {}",
        violations.len(),
        violations.join("\n  - ")
    );
}
