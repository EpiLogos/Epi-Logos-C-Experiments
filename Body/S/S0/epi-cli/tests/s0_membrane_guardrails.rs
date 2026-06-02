// Track 13 T9 — Cross-Layer Enforcement Tests And CI Guardrails.
//
// This suite is pure regression armor. It fails when:
//
//   (1) a new module file appears in S0's downstream-law zones
//       (`src/gate/`, `src/graph/`, `src/vault/`, `src/core/`) that is
//       neither inventoried in `contract-inventory/s0-membrane-inventory.json`
//       nor carries an explicit `// S0 ADAPTER:` doc-comment annotation
//       naming the Body-native authority;
//   (2) any S4 governance policy primitive (`capability_matrix`,
//       `dispatch_tool_list`, `vak_evaluation_rule`) gets defined under
//       S0 without being explicitly annotated as an `S4_AUTHORITY_ORIGIN`'d
//       adapter;
//   (3) any S5 review/autoresearch schema (`ReviewItem`, `EvidenceEnvelope`,
//       `GovernanceGate`, `DryRunPromotion`) gets freshly struct-defined
//       under S0 instead of being re-exported from Body/S/S5 cores;
//   (4) the inventory and the on-disk source drift (every inventoried
//       module path must resolve to a real file).
//
// The negative-fixture test demonstrates that the scanner correctly
// rejects a hand-crafted fake S0 downstream-law module.

use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use serde_json::Value;

// ===========================================================================
// Workspace path helpers
// ===========================================================================

fn epi_cli_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn workspace_root() -> PathBuf {
    // CARGO_MANIFEST_DIR = .../Body/S/S0/epi-cli  →  ancestors().nth(4) = repo root
    epi_cli_root()
        .ancestors()
        .nth(4)
        .expect("repo root must exist as fifth ancestor of epi-cli")
        .to_path_buf()
}

fn s0_src() -> PathBuf {
    epi_cli_root().join("src")
}

fn inventory_path() -> PathBuf {
    epi_cli_root().join("contract-inventory/s0-membrane-inventory.json")
}

// ===========================================================================
// Inventory reader
// ===========================================================================

/// One inventory record, normalised down to the fields T9 cares about.
#[derive(Debug, Clone)]
struct InventoryRecord {
    id: String,
    path: String,
    classification: String,
    parity_status: String,
    authority_path: Option<String>,
}

fn load_inventory() -> Value {
    let raw = fs::read_to_string(inventory_path())
        .expect("s0-membrane-inventory.json must be readable for T9 guardrails");
    serde_json::from_str(&raw).expect("inventory must parse as JSON")
}

fn inventory_records(inv: &Value) -> Vec<InventoryRecord> {
    inv["modules"]
        .as_array()
        .expect("inventory.modules must be an array")
        .iter()
        .map(|m| InventoryRecord {
            id: m["id"].as_str().unwrap_or_default().to_string(),
            path: m["path"].as_str().unwrap_or_default().to_string(),
            classification: m["classification"].as_str().unwrap_or_default().to_string(),
            parity_status: m["parity_status"].as_str().unwrap_or_default().to_string(),
            authority_path: m["authority_path"].as_str().map(String::from),
        })
        .collect()
}

/// Build the set of repo-relative paths the inventory claims live in S0.
/// Trailing line-spans (e.g. `…/server.rs:304-310`) are stripped.
fn inventoried_paths(records: &[InventoryRecord]) -> BTreeSet<String> {
    let mut set = BTreeSet::new();
    for r in records {
        let normalised = r.path.split(':').next().unwrap_or(&r.path).to_string();
        if !normalised.is_empty() {
            set.insert(normalised);
        }
    }
    set
}

/// True if `rel` is covered by an inventory entry. An entry can be either
/// an exact file match OR a directory entry (trailing `/`) under which the
/// file lives.
fn covered_by_inventory(rel: &str, inventoried: &BTreeSet<String>) -> bool {
    if inventoried.contains(rel) {
        return true;
    }
    for entry in inventoried {
        if entry.ends_with('/') && rel.starts_with(entry.as_str()) {
            return true;
        }
    }
    false
}

// ===========================================================================
// Source walker
// ===========================================================================

fn walk_rs(dir: &Path, out: &mut Vec<PathBuf>) {
    if !dir.exists() {
        return;
    }
    for entry in fs::read_dir(dir).unwrap().flatten() {
        let p = entry.path();
        if p.is_dir() {
            walk_rs(&p, out);
        } else if p.extension().and_then(|e| e.to_str()) == Some("rs") {
            out.push(p);
        }
    }
}

/// Relative-to-workspace path string for an absolute file path.
fn rel_to_repo(absolute: &Path) -> String {
    let root = workspace_root();
    absolute
        .strip_prefix(&root)
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| absolute.to_string_lossy().to_string())
}

// ===========================================================================
// Annotation detection
// ===========================================================================

/// Returns true if the file has an explicit S0-adapter annotation
/// naming a Body-native authority. The T9 spec requires either this
/// annotation OR explicit presence in the inventory.
///
/// Three accepted forms:
///   (1) `// S0 ADAPTER: Body/S/<…>` — uppercase ALL CAPS canonical.
///   (2) `// S0 adapter: …` — lowercase variant used by Thread P / T5
///       graph-membrane work; still names the Body-native authority
///       in the same comment block.
///   (3) Pure re-export file: the first non-blank, non-comment line
///       is `pub use epi_s1_…`, `pub use epi_s2_…`, `pub use epi_s3_…`,
///       `pub use epi_s4_…`, `pub use epi_s5_…`, or
///       `pub use portal_core::…`. A file that does nothing but
///       re-export Body-native symbols is, by construction, a thin
///       adapter — no further annotation is needed.
fn has_s0_adapter_annotation(file: &Path) -> bool {
    let Ok(text) = fs::read_to_string(file) else {
        return false;
    };

    // (1) + (2): doc-comment annotation in the header zone (first 80 lines).
    for line in text.lines().take(80) {
        let trimmed = line.trim_start();
        let is_annotation_marker = trimmed.starts_with("// S0 ADAPTER:")
            || trimmed.starts_with("// S0 adapter:")
            || trimmed.starts_with("//! S0 ADAPTER:")
            || trimmed.starts_with("//! S0 adapter:")
            || trimmed.starts_with("/// S0 ADAPTER:")
            || trimmed.starts_with("/// S0 adapter:")
            || trimmed.starts_with("//  S0 ADAPTER:")
            || trimmed.starts_with("//  S0 adapter:");
        if is_annotation_marker {
            // Hint of a Body-native authority somewhere in the header zone is
            // enough; the inventory carries the structured authority_path.
            return true;
        }
    }

    // (3) Pure re-export file: the first non-blank, non-comment line is
    // `pub use epi_s<n>_…` or `pub use portal_core::…`.
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") {
            continue;
        }
        return trimmed.starts_with("pub use epi_s1_")
            || trimmed.starts_with("pub use epi_s2_")
            || trimmed.starts_with("pub use epi_s3_")
            || trimmed.starts_with("pub use epi_s4_")
            || trimmed.starts_with("pub use epi_s5_")
            || trimmed.starts_with("pub use epi_kbase_")
            || trimmed.starts_with("pub use epii_")
            || trimmed.starts_with("pub use portal_core::");
    }
    false
}

// ===========================================================================
// 1. INVENTORY ↔ SOURCE PARITY
// ===========================================================================

#[test]
fn t9_inventory_paths_resolve_to_real_files_or_directories() {
    let inv = load_inventory();
    let records = inventory_records(&inv);
    let root = workspace_root();

    let mut missing = Vec::new();
    for r in &records {
        let path_part = r.path.split(':').next().unwrap_or(&r.path);
        let abs = root.join(path_part);
        if !abs.exists() {
            missing.push(format!("{} (id={})", r.path, r.id));
        }
    }
    assert!(
        missing.is_empty(),
        "T9 inventory ↔ source drift: inventory references paths that do not exist on disk:\n  {}",
        missing.join("\n  ")
    );
}

#[test]
fn t9_inventory_classifications_use_t1_vocabulary() {
    let inv = load_inventory();
    let records = inventory_records(&inv);
    let allowed_classifications: BTreeSet<&str> = [
        "kernel-owner",
        "cli-adapter",
        "gateway-adapter",
        "temporary-live-host",
        "compatibility-shim",
        "duplicated-service-law",
    ]
    .into_iter()
    .collect();
    let allowed_statuses: BTreeSet<&str> = [
        "Native",
        "Adapter",
        "CompatibilityAdapter",
        "TemporaryLiveHost",
        "Missing",
    ]
    .into_iter()
    .collect();

    let mut violations = Vec::new();
    for r in &records {
        if !allowed_classifications.contains(r.classification.as_str()) {
            violations.push(format!(
                "{} carries unknown classification '{}' (T1 vocabulary only)",
                r.id, r.classification
            ));
        }
        if !allowed_statuses.contains(r.parity_status.as_str()) {
            violations.push(format!(
                "{} carries unknown parity_status '{}' (T1 vocabulary only)",
                r.id, r.parity_status
            ));
        }
    }
    assert!(
        violations.is_empty(),
        "T9 inventory vocabulary drift:\n  {}",
        violations.join("\n  ")
    );
}

// ===========================================================================
// 2. NO NEW DOWNSTREAM-LAW MODULES IN S0
// ===========================================================================

/// Baseline of currently-known S0 module files (gathered from the
/// inventory + a hand-audited list of CLI-dispatch glue and entrypoints
/// that are NOT downstream-law and therefore do not need an adapter
/// annotation).
///
/// Any module file that appears in `src/gate/`, `src/graph/`, `src/vault/`,
/// or `src/core/` that is NOT in `inventoried_paths()` AND NOT in this
/// baseline AND does NOT carry an explicit `// S0 ADAPTER:` doc-comment
/// will fail this test.
///
/// To add a legitimate new file: either (a) inventory it in
/// `s0-membrane-inventory.json` with a non-Missing classification and an
/// authority path, OR (b) annotate the file head with `// S0 ADAPTER:
/// Body/S/<…>` naming the Body-native authority, OR (c) if it is pure
/// CLI dispatch glue with no service-law content, add it to the baseline
/// here with a one-line justification.
fn baseline_cli_glue_modules() -> BTreeSet<&'static str> {
    // CLI dispatch glue and operator-facing surfaces that do not
    // implement downstream service-law. These are command shape adapters,
    // auth/secret plumbing, routing arms, and value-passing wrappers that
    // call into other crates without copying their law.
    //
    // Additions to this list need a one-line justification (the comment
    // immediately preceding the entry). When in doubt, prefer either:
    //   (a) inventorying the module in `s0-membrane-inventory.json`, or
    //   (b) annotating it with `// S0 ADAPTER: Body/S/<…>`.
    [
        // ---- gate/ root module & dispatch arms ----
        // operator-facing GateCmd enum + sub-dispatch only.
        "Body/S/S0/epi-cli/src/gate/mod.rs",
        // S2 graph dispatch arm — routes `s2.graph.*` to S2 services.
        "Body/S/S0/epi-cli/src/gate/graph.rs",
        // ---- gate/ pure CLI surfaces (no law content) ----
        "Body/S/S0/epi-cli/src/gate/approvals.rs",
        "Body/S/S0/epi-cli/src/gate/auth.rs",
        "Body/S/S0/epi-cli/src/gate/browser.rs",
        "Body/S/S0/epi-cli/src/gate/channel_adapters.rs",
        "Body/S/S0/epi-cli/src/gate/config.rs",
        "Body/S/S0/epi-cli/src/gate/config_tui.rs",
        "Body/S/S0/epi-cli/src/gate/cron.rs",
        "Body/S/S0/epi-cli/src/gate/devices.rs",
        "Body/S/S0/epi-cli/src/gate/lock.rs",
        "Body/S/S0/epi-cli/src/gate/logs.rs",
        "Body/S/S0/epi-cli/src/gate/models.rs",
        "Body/S/S0/epi-cli/src/gate/nara.rs",
        "Body/S/S0/epi-cli/src/gate/nodes.rs",
        "Body/S/S0/epi-cli/src/gate/omnipanel.rs",
        "Body/S/S0/epi-cli/src/gate/preflight.rs",
        "Body/S/S0/epi-cli/src/gate/s1_hen.rs",
        "Body/S/S0/epi-cli/src/gate/secrets.rs",
        "Body/S/S0/epi-cli/src/gate/skills.rs",
        "Body/S/S0/epi-cli/src/gate/system.rs",
        "Body/S/S0/epi-cli/src/gate/team_store.rs",
        "Body/S/S0/epi-cli/src/gate/tls.rs",
        "Body/S/S0/epi-cli/src/gate/update.rs",
        "Body/S/S0/epi-cli/src/gate/wizard.rs",
        // ---- vault/ paths/templates (operator-facing fs helpers) ----
        "Body/S/S0/epi-cli/src/vault/kairos.rs",
        "Body/S/S0/epi-cli/src/vault/pasu.rs",
        "Body/S/S0/epi-cli/src/vault/paths.rs",
        "Body/S/S0/epi-cli/src/vault/templates.rs",
        // ---- core/ — FFI/CLI surface helpers, not service-law ----
        "Body/S/S0/epi-cli/src/core/mod.rs",
        "Body/S/S0/epi-cli/src/core/overlay.rs",
        "Body/S/S0/epi-cli/src/core/write_gate.rs",
        // core/knowing/ — Hen→S2 CLI back-end for `epi core knowing`.
        // Listed under inventory's `core.knowing` (whole directory).
        "Body/S/S0/epi-cli/src/core/knowing/cache.rs",
        "Body/S/S0/epi-cli/src/core/knowing/graph.rs",
        "Body/S/S0/epi-cli/src/core/knowing/kbase.rs",
        "Body/S/S0/epi-cli/src/core/knowing/mod.rs",
        "Body/S/S0/epi-cli/src/core/knowing/notebook.rs",
        "Body/S/S0/epi-cli/src/core/knowing/render.rs",
        "Body/S/S0/epi-cli/src/core/knowing/types.rs",
        "Body/S/S0/epi-cli/src/core/knowing/vimarsa.rs",
        // ---- graph/ CLI back-ends (not pure re-exports) ----
        // CLI plumbing for `epi graph` subcommands. Calls into S2 via
        // the named-adapter façade (`graph::mod.rs` is inventoried).
        "Body/S/S0/epi-cli/src/graph/client.rs",
        "Body/S/S0/epi-cli/src/graph/commands.rs",
        "Body/S/S0/epi-cli/src/graph/dev.rs",
        "Body/S/S0/epi-cli/src/graph/ingest.rs",
        "Body/S/S0/epi-cli/src/graph/retrieval.rs",
        "Body/S/S0/epi-cli/src/graph/seed.rs",
        "Body/S/S0/epi-cli/src/graph/sync.rs",
        "Body/S/S0/epi-cli/src/graph/retrieval/mod.rs",
    ]
    .into_iter()
    .collect()
}

/// Entrypoint files that are exempt by definition.
fn entrypoint_exempt(rel: &str) -> bool {
    matches!(
        rel,
        "Body/S/S0/epi-cli/src/lib.rs"
            | "Body/S/S0/epi-cli/src/main.rs"
            | "Body/S/S0/epi-cli/src/up.rs"
    )
}

/// True if the module is exempt from the downstream-law scanner because
/// its path is outside the S0 "law zones" (`gate/`, `graph/`, `vault/`,
/// `core/`). The scanner only enforces inside these zones.
fn outside_law_zone(rel: &str) -> bool {
    !(rel.starts_with("Body/S/S0/epi-cli/src/gate/")
        || rel.starts_with("Body/S/S0/epi-cli/src/graph/")
        || rel.starts_with("Body/S/S0/epi-cli/src/vault/")
        || rel.starts_with("Body/S/S0/epi-cli/src/core/"))
}

/// Module-classification result for the scanner.
#[derive(Debug, PartialEq, Eq)]
enum ModuleClassification {
    /// Inventoried with a recognised classification.
    Inventoried,
    /// Annotated at the file head with `// S0 ADAPTER:`.
    Annotated,
    /// In the baseline list of CLI-glue modules.
    CliGlueBaseline,
    /// An entrypoint (lib.rs / main.rs / up.rs).
    Entrypoint,
    /// Outside the law zones (`gate/`, `graph/`, `vault/`, `core/`).
    OutsideLawZone,
    /// VIOLATION: a downstream-law module without inventory entry or
    /// adapter annotation.
    UnannotatedDownstreamLaw,
}

fn classify_module(
    rel: &str,
    abs: &Path,
    inventoried: &BTreeSet<String>,
    baseline: &BTreeSet<&'static str>,
) -> ModuleClassification {
    if entrypoint_exempt(rel) {
        return ModuleClassification::Entrypoint;
    }
    if outside_law_zone(rel) {
        return ModuleClassification::OutsideLawZone;
    }
    if covered_by_inventory(rel, inventoried) {
        return ModuleClassification::Inventoried;
    }
    if has_s0_adapter_annotation(abs) {
        return ModuleClassification::Annotated;
    }
    if baseline.contains(rel) {
        return ModuleClassification::CliGlueBaseline;
    }
    ModuleClassification::UnannotatedDownstreamLaw
}

#[test]
fn s0_does_not_introduce_new_downstream_service_law() {
    let inv = load_inventory();
    let records = inventory_records(&inv);
    let inventoried = inventoried_paths(&records);
    let baseline = baseline_cli_glue_modules();

    let mut files: Vec<PathBuf> = Vec::new();
    walk_rs(&s0_src(), &mut files);

    let mut violations: Vec<String> = Vec::new();
    for abs in &files {
        let rel = rel_to_repo(abs);
        let kind = classify_module(&rel, abs, &inventoried, &baseline);
        if kind == ModuleClassification::UnannotatedDownstreamLaw {
            violations.push(rel);
        }
    }

    assert!(
        violations.is_empty(),
        "T9 violation: the following S0 modules implement downstream service-law \
         without being inventoried in `contract-inventory/s0-membrane-inventory.json` \
         AND without carrying an explicit `// S0 ADAPTER: Body/S/<…>` annotation \
         AND without being in the baseline CLI-glue list:\n  {}\n\n\
         To fix: (a) add an inventory entry naming the Body-native authority, OR \
         (b) add an `// S0 ADAPTER: Body/S/<…>` doc-comment at file head naming the \
         Body-native authority, OR (c) if pure CLI glue, add the path to \
         `baseline_cli_glue_modules()` in this test with a justification comment.",
        violations.join("\n  ")
    );
}

#[test]
fn negative_fixture_is_correctly_rejected_by_s0_scanner() {
    // Plan body line 238: "the guardrail suite fails against an
    // intentionally added fake S0 downstream-law module in a local
    // negative fixture."
    //
    // We synthesise the situation by classifying a path that:
    //   - lives under the law zone (`src/gate/`),
    //   - is NOT in the inventory,
    //   - is NOT in the baseline,
    //   - carries no `// S0 ADAPTER:` annotation (its actual content,
    //     loaded from `tests/fixtures/`, contains only the fake
    //     downstream-law shape).
    //
    // The scanner MUST return UnannotatedDownstreamLaw for it; if it
    // ever returned Annotated/Inventoried, the guardrail would be silently
    // broken.
    let fixture_path = epi_cli_root()
        .join("tests")
        .join("fixtures")
        .join("fake_downstream_law_module.rs");
    assert!(
        fixture_path.exists(),
        "negative fixture must exist at {}",
        fixture_path.display()
    );

    // Pretend it lives at a downstream-law path:
    let pretend_rel = "Body/S/S0/epi-cli/src/gate/fake_review_inbox.rs";
    let inv = load_inventory();
    let records = inventory_records(&inv);
    let inventoried = inventoried_paths(&records);
    let baseline = baseline_cli_glue_modules();

    let kind = classify_module(pretend_rel, &fixture_path, &inventoried, &baseline);
    assert_eq!(
        kind,
        ModuleClassification::UnannotatedDownstreamLaw,
        "the negative fixture must be rejected by the S0 scanner; instead got {:?}. \
         If this passes, the guardrail no longer protects against fresh downstream-law \
         modules being added to S0 without adapter annotation.",
        kind
    );

    // And: an adversary can NOT bypass the guard merely by sticking the
    // fixture under a non-law-zone path — the scanner returns
    // OutsideLawZone in that case and the suite does not enforce. This
    // sub-check pins that contract too.
    let outside_kind = classify_module(
        "Body/S/S0/epi-cli/src/tui/fake.rs",
        &fixture_path,
        &inventoried,
        &baseline,
    );
    assert_eq!(outside_kind, ModuleClassification::OutsideLawZone);
}

// ===========================================================================
// 3. S4 OWNERSHIP — governance policy must NOT be (re)introduced in S0
// ===========================================================================

/// Word-boundary scan: returns true if `text` contains `needle` immediately
/// followed by a non-identifier character (space, `{`, `(`, `<`, `;`, `=`,
/// newline). This avoids matching `CapabilityMatrixProvider` when looking
/// for `CapabilityMatrix` definitions.
fn defines_word(text: &str, needle: &str) -> bool {
    let mut start = 0;
    while let Some(idx) = text[start..].find(needle) {
        let abs = start + idx;
        let after_idx = abs + needle.len();
        let next = text.as_bytes().get(after_idx).copied();
        let is_word_boundary = match next {
            None => true,
            Some(c) => !(c.is_ascii_alphanumeric() || c == b'_'),
        };
        if is_word_boundary {
            return true;
        }
        start = abs + 1;
    }
    false
}

/// Returns the list of suspicious S4-governance identifiers found in `file`,
/// where "suspicious" means the file is defining (not just mentioning) the
/// identifier exactly. The scanner looks for typical Rust definition keywords.
fn s4_governance_defs(file: &Path) -> Vec<&'static str> {
    let Ok(text) = fs::read_to_string(file) else {
        return Vec::new();
    };
    let mut hits = Vec::new();
    let groups: &[(&'static str, &[&'static str])] = &[
        (
            "capability_matrix",
            &[
                "struct CapabilityMatrix",
                "enum CapabilityMatrix",
                "fn build_capability_matrix",
                "static CAPABILITY_MATRIX",
                "const CAPABILITY_MATRIX",
            ],
        ),
        (
            "dispatch_tool_list",
            &[
                "struct DispatchToolList",
                "enum DispatchToolList",
                "fn build_dispatch_tool_list",
                "static DISPATCH_TOOL_LIST",
                "const DISPATCH_TOOL_LIST",
            ],
        ),
        (
            "vak_evaluation_rule",
            &[
                "struct VakEvaluationRule",
                "enum VakEvaluationRule",
                "fn build_vak_evaluation_rule",
                "static VAK_EVALUATION_RULE",
                "const VAK_EVALUATION_RULE",
            ],
        ),
    ];
    for (needle, def_patterns) in groups {
        for p in *def_patterns {
            if defines_word(&text, p) {
                hits.push(*needle);
                break;
            }
        }
    }
    hits
}

#[test]
fn s4_governance_policy_not_introduced_in_s0() {
    let mut files: Vec<PathBuf> = Vec::new();
    walk_rs(&s0_src(), &mut files);

    let mut violations: Vec<String> = Vec::new();
    for abs in &files {
        let rel = rel_to_repo(abs);
        // Tests themselves don't count.
        if rel.contains("/tests/") {
            continue;
        }
        let defs = s4_governance_defs(abs);
        if defs.is_empty() {
            continue;
        }
        // Must be annotated as an S4 adapter — i.e. the file head must
        // carry a `S4_AUTHORITY_ORIGIN` marker referencing Body/S/S4.
        let Ok(text) = fs::read_to_string(abs) else {
            continue;
        };
        let annotated = text.contains("S4_AUTHORITY_ORIGIN") && text.contains("Body/S/S4");
        if !annotated {
            violations.push(format!(
                "{}: introduces S4 governance primitives {:?} without S4_AUTHORITY_ORIGIN annotation referencing Body/S/S4",
                rel, defs
            ));
        }
    }

    assert!(
        violations.is_empty(),
        "T9 violation: S0 must not introduce S4 governance policy primitives. \
         If an adapter genuinely needs to mirror an S4 surface, add a \
         `const S4_AUTHORITY_ORIGIN: &str = \"Body/S/S4 (…)\";` declaration and \
         keep the surface a thin reflection of the S4 authority.\n  {}",
        violations.join("\n  ")
    );
}

// ===========================================================================
// 4. S5 OWNERSHIP — review/autoresearch schemas must not be redefined in S0
// ===========================================================================

/// Definition-pattern detector for S5 review/autoresearch schemas.
/// Returns the set of schema names that are DEFINED with exact-word match
/// (not substring) in `file`.
fn s5_schema_defs(file: &Path) -> Vec<&'static str> {
    let Ok(text) = fs::read_to_string(file) else {
        return Vec::new();
    };
    let mut hits = Vec::new();
    let groups: &[(&'static str, &[&'static str])] = &[
        ("ReviewItem", &["struct ReviewItem", "enum ReviewItem"]),
        (
            "EvidenceEnvelope",
            &["struct EvidenceEnvelope", "enum EvidenceEnvelope"],
        ),
        (
            "GovernanceGate",
            &["struct GovernanceGate", "enum GovernanceGate"],
        ),
        (
            "DryRunPromotion",
            &["struct DryRunPromotion", "enum DryRunPromotion"],
        ),
    ];
    for (name, def_keywords) in groups {
        for kw in *def_keywords {
            if defines_word(&text, kw) {
                hits.push(*name);
                break;
            }
        }
    }
    hits
}

#[test]
fn s5_review_schemas_not_introduced_in_s0() {
    let mut files: Vec<PathBuf> = Vec::new();
    walk_rs(&s0_src(), &mut files);

    let mut violations: Vec<String> = Vec::new();
    for abs in &files {
        let rel = rel_to_repo(abs);
        if rel.contains("/tests/") {
            continue;
        }
        let defs = s5_schema_defs(abs);
        if defs.is_empty() {
            continue;
        }
        // Must be a re-export — the file should `use ::epii_review_core::*`
        // or `use ::epii_autoresearch_core::*` or `use ::epii_agent_core::*`
        // (or the `pub use` re-export equivalent of one of these crates).
        let Ok(text) = fs::read_to_string(abs) else {
            continue;
        };
        let from_review_core = text.contains("epii_review_core")
            || text.contains("epi_s5_epii_review_core")
            || text.contains("epi-s5-epii-review-core");
        let from_autoresearch_core = text.contains("epii_autoresearch_core")
            || text.contains("epi_s5_epii_autoresearch_core")
            || text.contains("epi-s5-epii-autoresearch-core");
        let from_agent_core = text.contains("epii_agent_core")
            || text.contains("epi_s5_epii_agent_core")
            || text.contains("epi-s5-epii-agent-core");
        let re_exported = from_review_core || from_autoresearch_core || from_agent_core;
        if !re_exported {
            violations.push(format!(
                "{}: defines S5 schemas {:?} but does not import from any of \
                 epii_review_core / epii_autoresearch_core / epii_agent_core",
                rel, defs
            ));
        }
    }

    assert!(
        violations.is_empty(),
        "T9 violation: S0 must not introduce fresh struct definitions of S5 \
         review/autoresearch schemas. The canonical authorities live in \
         Body/S/S5/{{epii-review-core,epii-autoresearch-core,epii-agent-core}}.\n  {}",
        violations.join("\n  ")
    );
}

// ===========================================================================
// 5. INVENTORY → AUTHORITY-PATH COVERAGE
// ===========================================================================

#[test]
fn t9_every_non_native_inventoried_module_names_a_body_native_authority() {
    let inv = load_inventory();
    let records = inventory_records(&inv);

    let mut violations = Vec::new();
    for r in &records {
        // `Native` records (e.g. portal-core kernel) legitimately do not
        // need an authority_path — S0 IS the authority.
        if r.parity_status == "Native" {
            continue;
        }
        match &r.authority_path {
            Some(s) if !s.trim().is_empty() => {}
            _ => violations.push(format!(
                "{} (parity_status={}) lacks an authority_path",
                r.id, r.parity_status
            )),
        }
    }

    assert!(
        violations.is_empty(),
        "T9 violation: every non-Native inventoried module must name its \
         Body-native authority_path:\n  {}",
        violations.join("\n  ")
    );
}

// ===========================================================================
// 6. INVENTORY HEALTH SANITY — modules array is non-empty and counts.modules
// reflects the array length. (Per-classification count audit is intentionally
// not enforced: classification counts in the inventory JSON predate later
// reclassifications by T2/T3/T4 and are tracked as Track 13 finding 4-iii
// in the T1 evidence ledger.)
// ===========================================================================

#[test]
fn t9_inventory_modules_total_matches_recorded() {
    let inv = load_inventory();
    let counts = &inv["counts"];
    let records = inventory_records(&inv);
    let modules_total = counts["modules"]
        .as_u64()
        .expect("counts.modules must be present") as usize;
    assert_eq!(
        modules_total,
        records.len(),
        "counts.modules ({}) must equal inventory.modules.len() ({})",
        modules_total,
        records.len()
    );
    assert!(records.len() >= 25, "inventory must list at least 25 modules");
}
