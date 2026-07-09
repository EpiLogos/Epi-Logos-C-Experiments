# Track 38 — Tunability Surface Implementation Plan

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Companion to [`38-tunability-surface-architecture.md`](38-tunability-surface-architecture.md) (the spec) and [`13-decision-register.md`](13-decision-register.md) (DR-TUNE-1..4 PROPOSED rows that gate execution).

**Goal:** Land Tranches **06.7-06.12** — the system-wide tunability surface at M5-2'/M5-3'/M5-4' (schema authority / Tuning UI / runtime lifecycle), making every system "knob" stable, observable, manipulable, and reviewable across developer / self-awareness / ML-training tiers.

**Architecture:** One typed schema (`tunable` Rust module at `Body/S/S0/portal-core/src/tunable.rs`, distributed schema files at `Body/S/S0/portal-core/tunable-schema/*.tunable.toml`) feeds three tiers: Tier 1 developer-tuning via `~/.epi-logos/config.toml` + Theia "Tuning" tab extension at `Body/M/epi-theia/extensions/tuning-surface/`; Tier 2 self-awareness via `AnamnesisProposer` at `Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs` extending `CapacityId` with `TuningReview` 7th lane; Tier 3 ML-trained via `compose_tuning_proposal()` in `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/` routing through Tier 2's pipeline. Anti-greenfield: extends existing `[nara.weights]` precedent at [`Body/S/S0/epi-cli/src/nara/weights.rs`](../../../../../Body/S/S0/epi-cli/src/nara/weights.rs); reuses existing `slot_privacy_boundary_compliance` Anuttara verifier pattern.

**Tech Stack:** Rust (portal-core, epii-autoresearch-core, hen-compiler-core); TypeScript (Theia extension); TOML (schema + user overrides); BLAKE3 (config hash); existing gateway-contract RPC; existing Anuttara virtue-LUT constraint registry.

**Dependencies (load-bearing):**
- DR-TUNE-1..4 PROPOSED → must VALIDATE before any tranche starts
- Tranche 4.16 / 4.17 / 5.26 / 5.27 / CCT-14b → these tranches DECLARE the knobs that 06.7-06.12 EXPOSE; the knobs themselves land via those tranches, the surface lands via this plan
- Track 12.24 (ML-skill-surface) → 06.10 depends on `aletheia-drift-detection` skill scaffold

**Execution order:**
1. **06.7** (schema crate — foundation; all others depend on this) — Tasks 1-12
2. **06.12** (migrate existing config — must precede consumers reading from new loader) — Tasks 13-16
3. **06.8** (Tuning UI) — Tasks 17-25 — parallel-OK with 06.9
4. **06.9** (Tier 2 lifecycle) — Tasks 26-33 — parallel-OK with 06.8
5. **06.10** (Tier 3 ML-training hook) — Tasks 34-37 — depends on 06.9
6. **06.11** (audit loop) — Tasks 38-40 — orthogonal; can run any time after 06.7

---

## File Structure

**New files** (Rust):
- `Body/S/S0/portal-core/src/tunable.rs` — schema crate (module of portal-core)
- `Body/S/S0/portal-core/src/tunable/registry.rs` — TunableRegistry
- `Body/S/S0/portal-core/src/tunable/metadata.rs` — TunableMetadata + per-knob types
- `Body/S/S0/portal-core/src/tunable/scope.rs` — global / per-PASU / per-session resolution
- `Body/S/S0/portal-core/src/tunable/audit.rs` — audit-trail writer
- `Body/S/S0/portal-core/tunable-schema/README.md` — schema authoring guide + class-chooser decision tree
- `Body/S/S0/portal-core/tunable-schema/nara_session.tunable.toml` — Tranche 5.26 knobs
- `Body/S/S0/portal-core/tunable-schema/mythos.tunable.toml` — Tranche 5.27 knobs
- `Body/S/S0/portal-core/tunable-schema/hen.tunable.toml` — Tranche CCT-14b knobs
- `Body/S/S0/portal-core/tunable-schema/aletheia.tunable.toml` — existing `[aletheia.drift_detection]` + `[aletheia.elo]` migrated
- `Body/S/S0/portal-core/tunable-schema/nara.tunable.toml` — existing `[nara.weights]` migrated
- `Body/S/S0/portal-core/tunable-schema/slot.tunable.toml` — existing `[slot.*]` migrated
- `Body/S/S0/portal-core/tunable-schema/cross.tunable.toml` — cross-cutting knobs (spawn_timeout_ms etc.)
- `Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs` — Tier 2 proposal generator
- `Body/S/S5/epii-autoresearch-core/src/tuning_review.rs` — TuningReview capacity lane

**Modified files** (Rust):
- `Body/S/S0/portal-core/src/lib.rs` — add `pub mod tunable;`
- `Body/S/S0/portal-core/Cargo.toml` — add `toml`, `serde`, `blake3` if missing
- `Body/S/S0/epi-lib/src/m0.c` — extend `slot_privacy_boundary_compliance` constraint; register new `tune_structural_invariant_compliance` constraint
- `Body/S/S0/epi-cli/src/nara/weights.rs` — replace manual TOML parse with `tunable::registry::TunableRegistry` lookup
- `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` — extend `CapacityId` with `TuningReview` variant
- `Body/S/S3/gateway-contract/src/lib.rs` — register `s5'.tune.{registry.list, registry.get, registry.set, audit.read, lock.toggle, propose}` + `s5'.tune.proposals.{list, resolve}`

**New files** (TypeScript):
- `Body/M/epi-theia/extensions/tuning-surface/package.json`
- `Body/M/epi-theia/extensions/tuning-surface/src/common/tuning-surface.ts` — DTOs
- `Body/M/epi-theia/extensions/tuning-surface/src/browser/tuning-tab.tsx` — main UI
- `Body/M/epi-theia/extensions/tuning-surface/src/browser/knob-tree.tsx` — left pane
- `Body/M/epi-theia/extensions/tuning-surface/src/browser/knob-detail.tsx` — right pane
- `Body/M/epi-theia/extensions/tuning-surface/src/browser/audit-trail-viewer.tsx`

**Tunability-aware audit-output:**
- `~/.epi-logos/tunable-audit/<knob-key>.jsonl` — append-only audit trail (runtime-created)
- `Body/S/S0/epi-lib/tunable-audit-report.md` — Anuttara hardcoded-relation lint report (generated by 06.11)

---

## Tranche 06.7 — Schema Crate (Foundation)

**Tranche scope:** Lands the `tunable` module of portal-core (Rust). Defines all types, schema-file format, validation, scope resolution, audit-trail writer. Declares first three consumer schemas (Tranches 5.26 / 5.27 / CCT-14b knobs). Registers Anuttara verifier constraint `tune_structural_invariant_compliance`. Anti-greenfield: builds on existing `weights.rs` pattern; existing TOML config files keep loading via backward-compat shim.

### Task 1: Scaffold `tunable` module + types

**Files:**
- Modify: `Body/S/S0/portal-core/src/lib.rs`
- Modify: `Body/S/S0/portal-core/Cargo.toml`
- Create: `Body/S/S0/portal-core/src/tunable.rs`
- Create: `Body/S/S0/portal-core/src/tunable/metadata.rs`
- Test: `Body/S/S0/portal-core/tests/tunable_metadata.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_metadata.rs
use epi_portal_core::tunable::metadata::{
    ResidencyClass, ScopeClass, TuningRiskClass, PrivacyClass, TunableMetadata, TunableValue,
};

#[test]
fn metadata_residency_class_variants_complete() {
    assert_eq!(ResidencyClass::HotReload.as_str(), "hot-reload");
    assert_eq!(ResidencyClass::FreezeOnSessionStart.as_str(), "freeze-on-session-start");
    assert_eq!(ResidencyClass::RestartRequired.as_str(), "restart-required");
}

#[test]
fn metadata_scope_class_variants_complete() {
    assert_eq!(ScopeClass::Global.as_str(), "global");
    assert_eq!(ScopeClass::PerPasu.as_str(), "per-pasu");
    assert_eq!(ScopeClass::PerSession.as_str(), "per-session");
}

#[test]
fn metadata_tuning_risk_class_variants_complete() {
    assert_eq!(TuningRiskClass::A.as_str(), "A");
    assert_eq!(TuningRiskClass::B.as_str(), "B");
    assert_eq!(TuningRiskClass::C.as_str(), "C");
}

#[test]
fn metadata_privacy_class_variants_complete() {
    assert_eq!(PrivacyClass::LocalOnly.as_str(), "local-only");
    assert_eq!(PrivacyClass::VectorDerived.as_str(), "vector-derived");
    assert_eq!(PrivacyClass::NonSensitive.as_str(), "non-sensitive");
}

#[test]
fn metadata_defaults_are_conservative() {
    // Defaults per Track 38 §3.1
    assert_eq!(ResidencyClass::default(), ResidencyClass::FreezeOnSessionStart);
    assert_eq!(ScopeClass::default(), ScopeClass::Global);
    assert_eq!(TuningRiskClass::default(), TuningRiskClass::A);
    assert_eq!(PrivacyClass::default(), PrivacyClass::NonSensitive);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_metadata`
Expected: FAIL with "unresolved import" / "module not found"

- [ ] **Step 3: Add `pub mod tunable;` to lib.rs**

```rust
// Body/S/S0/portal-core/src/lib.rs (find the existing pub mod declarations and add)
pub mod tunable;
```

- [ ] **Step 4: Add required dependencies to Cargo.toml**

```toml
# Body/S/S0/portal-core/Cargo.toml — add if not present in [dependencies]
serde = { version = "1", features = ["derive"] }
toml = "0.8"
blake3 = "1"
chrono = { version = "0.4", features = ["serde"] }
```

- [ ] **Step 5: Create tunable.rs module root**

```rust
// Body/S/S0/portal-core/src/tunable.rs
//! Tunability surface — typed schema + manipulable substrate + reviewable lifecycle
//! for every knob in the system. See Track 38 spec.

pub mod metadata;
pub mod registry;
pub mod scope;
pub mod audit;

pub use metadata::{
    ResidencyClass, ScopeClass, TuningRiskClass, PrivacyClass,
    TunableMetadata, TunableValue, TunableRange,
};
pub use registry::{TunableRegistry, LoadError, ValidationError};
pub use scope::ScopeResolver;
pub use audit::{AuditEntry, AuditWriter};
```

- [ ] **Step 6: Implement metadata.rs**

```rust
// Body/S/S0/portal-core/src/tunable/metadata.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ResidencyClass {
    HotReload,
    FreezeOnSessionStart,
    RestartRequired,
}

impl ResidencyClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::HotReload => "hot-reload",
            Self::FreezeOnSessionStart => "freeze-on-session-start",
            Self::RestartRequired => "restart-required",
        }
    }
}

impl Default for ResidencyClass {
    fn default() -> Self { Self::FreezeOnSessionStart }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ScopeClass {
    Global,
    PerPasu,
    PerSession,
}

impl ScopeClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Global => "global",
            Self::PerPasu => "per-pasu",
            Self::PerSession => "per-session",
        }
    }
}

impl Default for ScopeClass {
    fn default() -> Self { Self::Global }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TuningRiskClass { A, B, C }

impl TuningRiskClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::A => "A",
            Self::B => "B",
            Self::C => "C",
        }
    }
}

impl Default for TuningRiskClass {
    fn default() -> Self { Self::A }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PrivacyClass {
    LocalOnly,
    VectorDerived,
    NonSensitive,
}

impl PrivacyClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::LocalOnly => "local-only",
            Self::VectorDerived => "vector-derived",
            Self::NonSensitive => "non-sensitive",
        }
    }
}

impl Default for PrivacyClass {
    fn default() -> Self { Self::NonSensitive }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum TunableValue {
    Bool(bool),
    U32(u32),
    U64(u64),
    F32(f32),
    String(String),
    F32Triplet { m1: f32, m2: f32, m3: f32 },
    StringArray(Vec<String>),
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TunableRange {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sum_to: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enum_values: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TunableMetadata {
    pub key: String,
    #[serde(rename = "type")]
    pub value_type: String,
    pub default: TunableValue,
    #[serde(default)]
    pub residency_class: ResidencyClass,
    #[serde(default)]
    pub scope_class: ScopeClass,
    #[serde(default)]
    pub tuning_risk_class: TuningRiskClass,
    #[serde(default)]
    pub ml_trainable: bool,
    #[serde(default)]
    pub privacy_class: PrivacyClass,
    #[serde(default)]
    pub structural_invariant: bool,
    pub owning_subsystem: String,
    #[serde(default)]
    pub owning_carrier: Option<String>,
    pub authoritative_doc: String,
    #[serde(default)]
    pub warrant_constants: Vec<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub range: Option<TunableRange>,
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_metadata`
Expected: PASS (5 tests)

- [ ] **Step 8: Commit**

```bash
git add Body/S/S0/portal-core/src/lib.rs Body/S/S0/portal-core/src/tunable.rs Body/S/S0/portal-core/src/tunable/metadata.rs Body/S/S0/portal-core/tests/tunable_metadata.rs Body/S/S0/portal-core/Cargo.toml
git commit -m "feat(tunable): scaffold tunable module with metadata types

Track 38 Task 1. Defines ResidencyClass / ScopeClass / TuningRiskClass /
PrivacyClass enums + TunableMetadata + TunableValue + TunableRange.
Conservative defaults per Track 38 §3.1."
```

### Task 2: TOML schema file format + load

**Files:**
- Create: `Body/S/S0/portal-core/src/tunable/registry.rs`
- Create: `Body/S/S0/portal-core/tunable-schema/cross.tunable.toml`
- Test: `Body/S/S0/portal-core/tests/tunable_registry_load.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_registry_load.rs
use epi_portal_core::tunable::registry::TunableRegistry;
use std::path::PathBuf;

fn schema_dir() -> PathBuf {
    let mut p = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tunable-schema");
    p
}

#[test]
fn registry_loads_cross_schema_file() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    let knob = reg.get("cross.spawn_timeout_ms").expect("knob present");
    assert_eq!(knob.value_type, "u32");
    assert_eq!(knob.owning_subsystem, "cross");
    assert_eq!(knob.authoritative_doc, "Track 38 §7.3");
}

#[test]
fn registry_load_fails_on_missing_required_field() {
    use std::io::Write;
    let tmp = tempfile::tempdir().expect("tmp");
    let path = tmp.path().join("bad.tunable.toml");
    let mut f = std::fs::File::create(&path).expect("create");
    writeln!(f, "[[tunable]]\nkey = \"foo.bar\"\ntype = \"bool\"\ndefault = false")
        .expect("write");
    // missing owning_subsystem + authoritative_doc
    let result = TunableRegistry::load_from_dir(tmp.path());
    assert!(result.is_err(), "should fail on missing required fields");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_load`
Expected: FAIL with "no such module registry"

- [ ] **Step 3: Add tempfile to dev-dependencies**

```toml
# Body/S/S0/portal-core/Cargo.toml [dev-dependencies]
tempfile = "3"
```

- [ ] **Step 4: Create the seed schema file**

```toml
# Body/S/S0/portal-core/tunable-schema/cross.tunable.toml
# Cross-cutting tunable knobs (not owned by any single M-subsystem).

[[tunable]]
key = "cross.spawn_timeout_ms"
type = "u32"
default = 30000
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "cross"
authoritative_doc = "Track 38 §7.3"
description = "Default timeout for spawnSync calls across ta-onta carrier extensions."

[tunable.range]
min = 1000
max = 300000
```

- [ ] **Step 5: Implement registry.rs (load path)**

```rust
// Body/S/S0/portal-core/src/tunable/registry.rs
use crate::tunable::metadata::TunableMetadata;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Deserialize)]
struct SchemaFile {
    #[serde(default)]
    tunable: Vec<TunableMetadata>,
}

#[derive(Debug, thiserror::Error)]
pub enum LoadError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("toml parse error in {file}: {source}")]
    TomlParse {
        file: String,
        #[source]
        source: toml::de::Error,
    },
    #[error("duplicate knob key: {0}")]
    DuplicateKey(String),
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("knob {key} structural_invariant=true but warrant_constants is empty")]
    StructuralWithoutWarrant { key: String },
    #[error("knob {key} type={value_type} but default value does not match type")]
    DefaultTypeMismatch { key: String, value_type: String },
    #[error("knob {key} range.sum_to set but type is not f32_triplet")]
    SumToOnNonTriplet { key: String },
}

#[derive(Debug, Default)]
pub struct TunableRegistry {
    knobs: HashMap<String, TunableMetadata>,
}

impl TunableRegistry {
    pub fn load_from_dir(dir: &Path) -> Result<Self, LoadError> {
        let mut reg = Self::default();
        let read_dir = std::fs::read_dir(dir)?;
        for entry in read_dir {
            let entry = entry?;
            let path = entry.path();
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if !name.ends_with(".tunable.toml") { continue; }
            let text = std::fs::read_to_string(&path)?;
            let parsed: SchemaFile = toml::from_str(&text)
                .map_err(|source| LoadError::TomlParse {
                    file: name.to_string(),
                    source,
                })?;
            for k in parsed.tunable {
                if reg.knobs.contains_key(&k.key) {
                    return Err(LoadError::DuplicateKey(k.key));
                }
                reg.knobs.insert(k.key.clone(), k);
            }
        }
        Ok(reg)
    }

    pub fn get(&self, key: &str) -> Option<&TunableMetadata> {
        self.knobs.get(key)
    }

    pub fn iter(&self) -> impl Iterator<Item = (&str, &TunableMetadata)> {
        self.knobs.iter().map(|(k, v)| (k.as_str(), v))
    }

    pub fn len(&self) -> usize { self.knobs.len() }
    pub fn is_empty(&self) -> bool { self.knobs.is_empty() }
}
```

- [ ] **Step 6: Add thiserror to Cargo.toml**

```toml
# [dependencies]
thiserror = "1"
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_load`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add Body/S/S0/portal-core/src/tunable/registry.rs Body/S/S0/portal-core/tunable-schema/cross.tunable.toml Body/S/S0/portal-core/tests/tunable_registry_load.rs Body/S/S0/portal-core/Cargo.toml
git commit -m "feat(tunable): TOML schema file loader + cross.tunable.toml seed

Track 38 Task 2. Loads *.tunable.toml from schema dir, returns
TunableRegistry. Rejects duplicate keys + malformed TOML. Seed file
declares cross.spawn_timeout_ms as first canonical knob."
```

### Task 3: Schema validation (type + range + structural_invariant warrant)

**Files:**
- Modify: `Body/S/S0/portal-core/src/tunable/registry.rs`
- Test: `Body/S/S0/portal-core/tests/tunable_registry_validate.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_registry_validate.rs
use epi_portal_core::tunable::registry::{TunableRegistry, ValidationError};
use epi_portal_core::tunable::metadata::TunableValue;
use std::io::Write;

fn write_schema(dir: &std::path::Path, name: &str, body: &str) {
    let p = dir.join(name);
    let mut f = std::fs::File::create(&p).unwrap();
    f.write_all(body.as_bytes()).unwrap();
}

#[test]
fn validate_rejects_structural_invariant_without_warrant() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(tmp.path(), "bad.tunable.toml", r#"
[[tunable]]
key = "foo.locked"
type = "u32"
default = 27
structural_invariant = true
owning_subsystem = "M3"
authoritative_doc = "DR-M3-1"
"#);
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    let result = reg.validate();
    assert!(matches!(
        result,
        Err(ValidationError::StructuralWithoutWarrant { ref key }) if key == "foo.locked"
    ));
}

#[test]
fn validate_accepts_structural_invariant_with_warrant() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(tmp.path(), "ok.tunable.toml", r#"
[[tunable]]
key = "m3.tarot_codon_map"
type = "u32_lut"
default = 0
structural_invariant = true
warrant_constants = ["M3_TAROT_CODON_MAP", "DR-M3-1"]
owning_subsystem = "M3"
authoritative_doc = "DR-M3-1"
"#);
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    reg.validate().expect("should pass");
}

#[test]
fn validate_rejects_sum_to_on_non_triplet() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(tmp.path(), "bad.tunable.toml", r#"
[[tunable]]
key = "foo.scalar"
type = "f32"
default = 0.5
owning_subsystem = "cross"
authoritative_doc = "Track 38"
[tunable.range]
sum_to = 1.0
"#);
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    let result = reg.validate();
    assert!(matches!(result, Err(ValidationError::SumToOnNonTriplet { .. })));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_validate`
Expected: FAIL with "no method named `validate`"

- [ ] **Step 3: Add validate() to TunableRegistry**

```rust
// Body/S/S0/portal-core/src/tunable/registry.rs — append to impl TunableRegistry
impl TunableRegistry {
    pub fn validate(&self) -> Result<(), ValidationError> {
        for (_, knob) in &self.knobs {
            if knob.structural_invariant && knob.warrant_constants.is_empty() {
                return Err(ValidationError::StructuralWithoutWarrant {
                    key: knob.key.clone(),
                });
            }
            if let Some(range) = &knob.range {
                if range.sum_to.is_some() && knob.value_type != "f32_triplet" {
                    return Err(ValidationError::SumToOnNonTriplet {
                        key: knob.key.clone(),
                    });
                }
            }
        }
        Ok(())
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_validate`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/src/tunable/registry.rs Body/S/S0/portal-core/tests/tunable_registry_validate.rs
git commit -m "feat(tunable): schema validation — structural_invariant warrant, type-range checks

Track 38 Task 3. validate() enforces: structural_invariant=true requires
non-empty warrant_constants; range.sum_to is only valid for f32_triplet
type."
```

### Task 4: User override merge from ~/.epi-logos/config.toml

**Files:**
- Modify: `Body/S/S0/portal-core/src/tunable/registry.rs`
- Test: `Body/S/S0/portal-core/tests/tunable_registry_merge.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_registry_merge.rs
use epi_portal_core::tunable::registry::TunableRegistry;
use epi_portal_core::tunable::metadata::TunableValue;
use std::io::Write;

fn write_file(p: &std::path::Path, body: &str) {
    let mut f = std::fs::File::create(p).unwrap();
    f.write_all(body.as_bytes()).unwrap();
}

#[test]
fn merge_user_override_replaces_default() {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    write_file(&schema_dir.join("test.tunable.toml"), r#"
[[tunable]]
key = "test.foo"
type = "u32"
default = 100
owning_subsystem = "cross"
authoritative_doc = "Track 38"
"#);
    let config_path = tmp.path().join("config.toml");
    write_file(&config_path, r#"
[test]
foo = 250
"#);
    let reg = TunableRegistry::load_with_overrides(&schema_dir, Some(&config_path)).unwrap();
    let value = reg.value("test.foo").expect("present");
    assert_eq!(value, TunableValue::U32(250));
}

#[test]
fn merge_no_override_uses_default() {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    write_file(&schema_dir.join("test.tunable.toml"), r#"
[[tunable]]
key = "test.bar"
type = "bool"
default = true
owning_subsystem = "cross"
authoritative_doc = "Track 38"
"#);
    let reg = TunableRegistry::load_with_overrides(&schema_dir, None).unwrap();
    let value = reg.value("test.bar").expect("present");
    assert_eq!(value, TunableValue::Bool(true));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_merge`
Expected: FAIL — no method named `load_with_overrides`

- [ ] **Step 3: Add load_with_overrides + value() to TunableRegistry**

```rust
// Body/S/S0/portal-core/src/tunable/registry.rs — extend
use crate::tunable::metadata::TunableValue;
use std::collections::BTreeMap;

#[derive(Debug, Default)]
pub struct TunableRegistry {
    knobs: HashMap<String, TunableMetadata>,
    overrides: HashMap<String, TunableValue>,
}

impl TunableRegistry {
    pub fn load_with_overrides(
        schema_dir: &Path,
        config_path: Option<&Path>,
    ) -> Result<Self, LoadError> {
        let mut reg = Self::load_from_dir(schema_dir)?;
        if let Some(cfg) = config_path {
            if cfg.exists() {
                let text = std::fs::read_to_string(cfg)?;
                let parsed: toml::Value = text.parse()
                    .map_err(|source| LoadError::TomlParse {
                        file: cfg.display().to_string(),
                        source,
                    })?;
                reg.apply_overrides(&parsed);
            }
        }
        Ok(reg)
    }

    fn apply_overrides(&mut self, root: &toml::Value) {
        for (key, meta) in &self.knobs {
            if let Some(value) = lookup_dotted_key(root, key) {
                if let Some(parsed) = parse_value_against_type(value, &meta.value_type) {
                    self.overrides.insert(key.clone(), parsed);
                }
            }
        }
    }

    pub fn value(&self, key: &str) -> Option<TunableValue> {
        if let Some(v) = self.overrides.get(key) {
            return Some(v.clone());
        }
        self.knobs.get(key).map(|m| m.default.clone())
    }
}

fn lookup_dotted_key<'a>(root: &'a toml::Value, dotted: &str) -> Option<&'a toml::Value> {
    let mut cur = root;
    for seg in dotted.split('.') {
        cur = cur.get(seg)?;
    }
    Some(cur)
}

fn parse_value_against_type(v: &toml::Value, value_type: &str) -> Option<TunableValue> {
    match value_type {
        "bool" => v.as_bool().map(TunableValue::Bool),
        "u32" => v.as_integer().and_then(|i| u32::try_from(i).ok()).map(TunableValue::U32),
        "u64" => v.as_integer().and_then(|i| u64::try_from(i).ok()).map(TunableValue::U64),
        "f32" => v.as_float().map(|f| TunableValue::F32(f as f32)),
        "string" | "enum" => v.as_str().map(|s| TunableValue::String(s.to_string())),
        "f32_triplet" => {
            let t = v.as_table()?;
            let m1 = t.get("m1")?.as_float()? as f32;
            let m2 = t.get("m2")?.as_float()? as f32;
            let m3 = t.get("m3")?.as_float()? as f32;
            Some(TunableValue::F32Triplet { m1, m2, m3 })
        }
        _ => None,
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_merge`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/src/tunable/registry.rs Body/S/S0/portal-core/tests/tunable_registry_merge.rs
git commit -m "feat(tunable): user override merge from ~/.epi-logos/config.toml

Track 38 Task 4. load_with_overrides() reads user config, applies typed
overrides per knob. value() returns override-if-present, else default."
```

### Task 5: Scope resolution (global / per-PASU / per-session)

**Files:**
- Create: `Body/S/S0/portal-core/src/tunable/scope.rs`
- Modify: `Body/S/S0/portal-core/src/tunable.rs` (already exports)
- Test: `Body/S/S0/portal-core/tests/tunable_scope.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_scope.rs
use epi_portal_core::tunable::registry::TunableRegistry;
use epi_portal_core::tunable::scope::{ScopeResolver, ResolutionContext};
use epi_portal_core::tunable::metadata::TunableValue;
use std::io::Write;

fn setup() -> (tempfile::TempDir, TunableRegistry) {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    let mut f = std::fs::File::create(schema_dir.join("test.tunable.toml")).unwrap();
    writeln!(f, r#"
[[tunable]]
key = "test.user_pref"
type = "u32"
default = 5
scope_class = "per-pasu"
owning_subsystem = "M4"
authoritative_doc = "Track 38"
"#).unwrap();
    let reg = TunableRegistry::load_from_dir(&schema_dir).unwrap();
    (tmp, reg)
}

#[test]
fn scope_resolves_global_when_no_overrides() {
    let (_tmp, reg) = setup();
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: None,
        session_overrides: Default::default(),
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(resolver.value("test.user_pref"), Some(TunableValue::U32(5)));
}

#[test]
fn scope_per_pasu_overrides_global() {
    let (tmp, reg) = setup();
    let pasu_path = tmp.path().join("pasu_config.toml");
    std::fs::write(&pasu_path, r#"[test]
user_pref = 11
"#).unwrap();
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: Some(pasu_path),
        session_overrides: Default::default(),
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(resolver.value("test.user_pref"), Some(TunableValue::U32(11)));
}

#[test]
fn scope_per_session_overrides_all() {
    let (tmp, reg) = setup();
    let pasu_path = tmp.path().join("pasu_config.toml");
    std::fs::write(&pasu_path, r#"[test]
user_pref = 11
"#).unwrap();
    let mut session = std::collections::HashMap::new();
    session.insert("test.user_pref".to_string(), TunableValue::U32(99));
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: Some(pasu_path),
        session_overrides: session,
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(resolver.value("test.user_pref"), Some(TunableValue::U32(99)));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_scope`
Expected: FAIL — module not found

- [ ] **Step 3: Implement scope.rs**

```rust
// Body/S/S0/portal-core/src/tunable/scope.rs
use crate::tunable::metadata::TunableValue;
use crate::tunable::registry::TunableRegistry;
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Default, Clone)]
pub struct ResolutionContext {
    pub global_config: Option<PathBuf>,
    pub pasu_config: Option<PathBuf>,
    pub session_overrides: HashMap<String, TunableValue>,
}

pub struct ScopeResolver<'a> {
    registry: &'a TunableRegistry,
    ctx: ResolutionContext,
    pasu_overrides: HashMap<String, TunableValue>,
}

impl<'a> ScopeResolver<'a> {
    pub fn new(registry: &'a TunableRegistry, ctx: ResolutionContext) -> Self {
        let mut pasu_overrides = HashMap::new();
        if let Some(p) = &ctx.pasu_config {
            if p.exists() {
                if let Ok(text) = std::fs::read_to_string(p) {
                    if let Ok(parsed) = text.parse::<toml::Value>() {
                        for (key, meta) in registry.iter() {
                            if meta.scope_class == crate::tunable::metadata::ScopeClass::PerPasu {
                                if let Some(v) = lookup_dotted_key(&parsed, key) {
                                    if let Some(parsed_v) = crate::tunable::registry::parse_value_against_type_public(v, &meta.value_type) {
                                        pasu_overrides.insert(key.to_string(), parsed_v);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Self { registry, ctx, pasu_overrides }
    }

    pub fn value(&self, key: &str) -> Option<TunableValue> {
        if let Some(v) = self.ctx.session_overrides.get(key) {
            return Some(v.clone());
        }
        if let Some(v) = self.pasu_overrides.get(key) {
            return Some(v.clone());
        }
        self.registry.value(key)
    }
}

fn lookup_dotted_key<'a>(root: &'a toml::Value, dotted: &str) -> Option<&'a toml::Value> {
    let mut cur = root;
    for seg in dotted.split('.') {
        cur = cur.get(seg)?;
    }
    Some(cur)
}
```

- [ ] **Step 4: Expose parse_value_against_type publicly**

```rust
// Body/S/S0/portal-core/src/tunable/registry.rs — append at module level
pub fn parse_value_against_type_public(v: &toml::Value, value_type: &str) -> Option<TunableValue> {
    parse_value_against_type(v, value_type)
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_scope`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add Body/S/S0/portal-core/src/tunable/scope.rs Body/S/S0/portal-core/src/tunable/registry.rs Body/S/S0/portal-core/tests/tunable_scope.rs
git commit -m "feat(tunable): scope resolution — global / per-PASU / per-session

Track 38 Task 5. ScopeResolver precedence: session > PASU > global.
Per-PASU overrides loaded from ~/.epi-logos/pasu/<pasu-id>/config.toml.
Only per-pasu-classed knobs read PASU file; other knobs ignore it."
```

### Task 6: Audit-trail writer (append-only JSONL)

**Files:**
- Create: `Body/S/S0/portal-core/src/tunable/audit.rs`
- Test: `Body/S/S0/portal-core/tests/tunable_audit.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_audit.rs
use epi_portal_core::tunable::audit::{AuditEntry, AuditWriter, Actor, TripletVerdict};
use epi_portal_core::tunable::metadata::TunableValue;

#[test]
fn audit_writer_appends_jsonl_entry() {
    let tmp = tempfile::tempdir().unwrap();
    let writer = AuditWriter::new(tmp.path().to_path_buf());
    let entry = AuditEntry {
        timestamp: "2026-06-13T14:23:11Z".to_string(),
        knob_key: "test.foo".to_string(),
        from_value: TunableValue::U32(5),
        to_value: TunableValue::U32(11),
        actor: Actor::User,
        tier: 1,
        risk_class: "A".to_string(),
        proposing_evidence: vec![],
        triplet_verdict: None,
        user_disposition: Some("approved".to_string()),
        user_disposition_evidence_handle: None,
        rollback_handle: "rollback-abc".to_string(),
        kairos_snapshot: None,
    };
    writer.append(&entry).unwrap();
    let read = writer.read("test.foo").unwrap();
    assert_eq!(read.len(), 1);
    assert_eq!(read[0].from_value, TunableValue::U32(5));
    assert_eq!(read[0].to_value, TunableValue::U32(11));
}

#[test]
fn audit_writer_two_appends_two_lines() {
    let tmp = tempfile::tempdir().unwrap();
    let writer = AuditWriter::new(tmp.path().to_path_buf());
    for i in 0..2 {
        let entry = AuditEntry {
            timestamp: format!("2026-06-13T14:{:02}:00Z", i),
            knob_key: "test.bar".to_string(),
            from_value: TunableValue::U32(i),
            to_value: TunableValue::U32(i + 1),
            actor: Actor::User,
            tier: 1,
            risk_class: "B".to_string(),
            proposing_evidence: vec![],
            triplet_verdict: None,
            user_disposition: None,
            user_disposition_evidence_handle: None,
            rollback_handle: format!("rb-{}", i),
            kairos_snapshot: None,
        };
        writer.append(&entry).unwrap();
    }
    let read = writer.read("test.bar").unwrap();
    assert_eq!(read.len(), 2);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_audit`
Expected: FAIL — module not found

- [ ] **Step 3: Implement audit.rs**

```rust
// Body/S/S0/portal-core/src/tunable/audit.rs
use crate::tunable::metadata::TunableValue;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum Actor {
    User,
    AnamnesisProposer,
    AletheiaDriftDetection,
    UserRollback,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripletVerdict {
    pub narratrix_articulation: String,
    pub ebm_energy_delta: f32,
    pub verifier_questions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEntry {
    pub timestamp: String,
    pub knob_key: String,
    pub from_value: TunableValue,
    pub to_value: TunableValue,
    pub actor: Actor,
    pub tier: u8,
    pub risk_class: String,
    #[serde(default)]
    pub proposing_evidence: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub triplet_verdict: Option<TripletVerdict>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_disposition: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_disposition_evidence_handle: Option<String>,
    pub rollback_handle: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kairos_snapshot: Option<JsonValue>,
}

pub struct AuditWriter {
    audit_dir: PathBuf,
}

impl AuditWriter {
    pub fn new(audit_dir: PathBuf) -> Self {
        std::fs::create_dir_all(&audit_dir).ok();
        Self { audit_dir }
    }

    fn path_for_knob(&self, knob_key: &str) -> PathBuf {
        let safe = knob_key.replace('/', "_");
        self.audit_dir.join(format!("{}.jsonl", safe))
    }

    pub fn append(&self, entry: &AuditEntry) -> std::io::Result<()> {
        let path = self.path_for_knob(&entry.knob_key);
        let mut f = OpenOptions::new().create(true).append(true).open(path)?;
        let line = serde_json::to_string(entry)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
        writeln!(f, "{}", line)?;
        Ok(())
    }

    pub fn read(&self, knob_key: &str) -> std::io::Result<Vec<AuditEntry>> {
        let path = self.path_for_knob(knob_key);
        if !path.exists() {
            return Ok(vec![]);
        }
        let f = std::fs::File::open(path)?;
        let reader = BufReader::new(f);
        let mut entries = vec![];
        for line in reader.lines() {
            let line = line?;
            if line.trim().is_empty() { continue; }
            let entry: AuditEntry = serde_json::from_str(&line)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
            entries.push(entry);
        }
        Ok(entries)
    }
}
```

- [ ] **Step 4: Add serde_json to dependencies**

```toml
# Cargo.toml [dependencies]
serde_json = "1"
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_audit`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add Body/S/S0/portal-core/src/tunable/audit.rs Body/S/S0/portal-core/tests/tunable_audit.rs Body/S/S0/portal-core/Cargo.toml
git commit -m "feat(tunable): audit-trail writer — append-only JSONL per knob

Track 38 Task 6. AuditWriter appends to
~/.epi-logos/tunable-audit/<knob-key>.jsonl. AuditEntry includes
actor + tier + risk_class + proposing_evidence + triplet_verdict +
user_disposition + rollback_handle + kairos_snapshot."
```

### Task 7: Declare 5.26 nara_session knobs

**Files:**
- Create: `Body/S/S0/portal-core/tunable-schema/nara_session.tunable.toml`
- Test: extend `Body/S/S0/portal-core/tests/tunable_registry_load.rs`

- [ ] **Step 1: Write the failing test (append to existing file)**

```rust
// Body/S/S0/portal-core/tests/tunable_registry_load.rs — append
#[test]
fn registry_loads_nara_session_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    assert!(reg.get("nara.session.protein_capacity").is_some());
    assert!(reg.get("nara.session.stop_codon_policy").is_some());
    assert!(reg.get("nara.session.write_through_mode").is_some());
    assert!(reg.get("nara.session.protected_handle_strict").is_some());
    let capacity = reg.get("nara.session.protein_capacity").unwrap();
    assert_eq!(capacity.owning_subsystem, "M4");
    assert_eq!(capacity.authoritative_doc, "Tranche 5.26");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_load registry_loads_nara_session_knobs`
Expected: FAIL — knob not present

- [ ] **Step 3: Create the schema file**

```toml
# Body/S/S0/portal-core/tunable-schema/nara_session.tunable.toml
# Tranche 5.26 — M4 session lifecycle tunable knobs.

[[tunable]]
key = "nara.session.protein_capacity"
type = "u32"
default = 256
residency_class = "freeze-on-session-start"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M4"
owning_carrier = "anima"
authoritative_doc = "Tranche 5.26"
description = "Max TranscriptionStep entries per session protein."
[tunable.range]
min = 16
max = 4096

[[tunable]]
key = "nara.session.stop_codon_policy"
type = "enum"
default = "kairos-derived"
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"
description = "Which STOP codon (TAA/TAG/TGA) fires at session close. kairos-derived picks mod-3."
[tunable.range]
enum_values = ["round-robin", "kairos-derived", "fixed-taa", "fixed-tag", "fixed-tga"]

[[tunable]]
key = "nara.session.write_through_mode"
type = "enum"
default = "immediate"
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"
description = "When sealed protein writes to PatternPacket + Graphiti."
[tunable.range]
enum_values = ["immediate", "deferred", "batched"]

[[tunable]]
key = "nara.session.protected_handle_strict"
type = "bool"
default = true
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"
description = "When true, protein body never crosses profile bus. Two-flag gate with dev.unsafe.allow_raw_protein_bus."
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_load`
Expected: PASS (3 tests including new one)

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/nara_session.tunable.toml Body/S/S0/portal-core/tests/tunable_registry_load.rs
git commit -m "feat(tunable): declare Tranche 5.26 nara_session knobs in schema

Track 38 Task 7. Four knobs: protein_capacity (Class B), stop_codon_policy
(Class A, per-PASU, ML-trainable, local-only), write_through_mode (Class B),
protected_handle_strict (Class A, restart-required)."
```

### Task 8: Declare 5.27 mythos knobs

**Files:**
- Create: `Body/S/S0/portal-core/tunable-schema/mythos.tunable.toml`
- Test: extend `Body/S/S0/portal-core/tests/tunable_registry_load.rs`

- [ ] **Step 1: Write the failing test**

```rust
// tests/tunable_registry_load.rs — append
#[test]
fn registry_loads_mythos_symbolic_protein_reading_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    let weights = reg.get("mythos.symbolic_protein_reading.cosmic_weather_weights")
        .expect("weights present");
    assert!(weights.ml_trainable, "cosmic_weather_weights MUST be ml_trainable per 5.27");
    assert_eq!(weights.privacy_class, epi_portal_core::tunable::metadata::PrivacyClass::LocalOnly);
    assert_eq!(weights.scope_class, epi_portal_core::tunable::metadata::ScopeClass::PerPasu);
    assert_eq!(weights.tuning_risk_class, epi_portal_core::tunable::metadata::TuningRiskClass::A);

    // All 9 knobs from 5.27 should be present
    for key in [
        "mythos.symbolic_protein_reading.trigger_mode",
        "mythos.symbolic_protein_reading.utterance_interval_n",
        "mythos.symbolic_protein_reading.kairos_pulse_interval_m",
        "mythos.symbolic_protein_reading.adaptive_floor_seconds",
        "mythos.symbolic_protein_reading.adaptive_ceiling_seconds",
        "mythos.symbolic_protein_reading.cosmic_weather_weights",
        "mythos.symbolic_protein_reading.secondary_archetypes_count",
        "mythos.symbolic_protein_reading.voice_template_path",
        "mythos.symbolic_protein_reading.reification_guard_strictness",
    ] {
        assert!(reg.get(key).is_some(), "knob {} missing", key);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_load registry_loads_mythos_symbolic_protein_reading_knobs`
Expected: FAIL

- [ ] **Step 3: Create the schema file**

```toml
# Body/S/S0/portal-core/tunable-schema/mythos.tunable.toml
# Tranche 5.27 — Mythos symbolic-protein reading knobs.

[[tunable]]
key = "mythos.symbolic_protein_reading.trigger_mode"
type = "enum"
default = "every-mth-kairos-pulse"
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
owning_carrier = "anima"
authoritative_doc = "Tranche 5.27"
[tunable.range]
enum_values = ["every-nth-utterance", "every-mth-kairos-pulse", "hybrid-utterance-and-pulse", "adaptive"]

[[tunable]]
key = "mythos.symbolic_protein_reading.utterance_interval_n"
type = "u32"
default = 5
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
[tunable.range]
min = 1
max = 100

[[tunable]]
key = "mythos.symbolic_protein_reading.kairos_pulse_interval_m"
type = "u32"
default = 3
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
[tunable.range]
min = 1
max = 50

[[tunable]]
key = "mythos.symbolic_protein_reading.adaptive_floor_seconds"
type = "u64"
default = 90
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"

[[tunable]]
key = "mythos.symbolic_protein_reading.adaptive_ceiling_seconds"
type = "u64"
default = 1800
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"

[[tunable]]
key = "mythos.symbolic_protein_reading.cosmic_weather_weights"
type = "f32_triplet"
default = { m1 = 0.33, m2 = 0.34, m3 = 0.33 }
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
description = "Relative weights of M1 spanda / M2 cymatic / M3 codon channels in archetypal naming."
[tunable.range]
min = 0.0
max = 1.0
sum_to = 1.0

[[tunable]]
key = "mythos.symbolic_protein_reading.secondary_archetypes_count"
type = "u32"
default = 2
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
[tunable.range]
min = 0
max = 6

[[tunable]]
key = "mythos.symbolic_protein_reading.voice_template_path"
type = "string"
default = "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/voice-templates/default.md"
residency_class = "hot-reload"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"

[[tunable]]
key = "mythos.symbolic_protein_reading.reification_guard_strictness"
type = "enum"
default = "standard"
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
[tunable.range]
enum_values = ["permissive", "standard", "strict"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_load`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/mythos.tunable.toml Body/S/S0/portal-core/tests/tunable_registry_load.rs
git commit -m "feat(tunable): declare Tranche 5.27 Mythos knobs in schema

Track 38 Task 8. Nine knobs including cosmic_weather_weights (Class A,
per-PASU, ML-trainable, local-only — the flagship ML-trainable knob),
trigger_mode, voice_template_path, reification_guard_strictness, etc."
```

### Task 9: Declare CCT-14b hen birth-codon knobs

**Files:**
- Create: `Body/S/S0/portal-core/tunable-schema/hen.tunable.toml`
- Test: extend `Body/S/S0/portal-core/tests/tunable_registry_load.rs`

- [ ] **Step 1: Write the failing test**

```rust
// tests/tunable_registry_load.rs — append
#[test]
fn registry_loads_hen_birth_codon_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    for key in [
        "hen.birth_codon.seed_composition",
        "hen.birth_codon.derivation_policy",
        "hen.birth_codon.provisional_recompute_on_edit",
        "hen.birth_codon.governance_role_assignment",
        "hen.birth_codon.candidate_codon_visible_in_orphan_review",
        "hen.birth_codon.visualisation_density_normalisation",
        "hen.birth_codon.collision_policy",
    ] {
        assert!(reg.get(key).is_some(), "knob {} missing", key);
    }
    let policy = reg.get("hen.birth_codon.derivation_policy").unwrap();
    assert_eq!(policy.owning_carrier, Some("hen".to_string()));
    assert_eq!(policy.authoritative_doc, "Tranche CCT-14b");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epi-portal-core --test tunable_registry_load registry_loads_hen_birth_codon_knobs`
Expected: FAIL

- [ ] **Step 3: Create the schema file**

```toml
# Body/S/S0/portal-core/tunable-schema/hen.tunable.toml
# Tranche CCT-14b — Hen birth-codon knobs.

[[tunable]]
key = "hen.birth_codon.seed_composition"
type = "string_array"
default = ["content_hash", "kairos", "creator_identity", "coordinate_path"]
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"

[[tunable]]
key = "hen.birth_codon.derivation_policy"
type = "enum"
default = "blake3_first_6_bits"
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"
[tunable.range]
enum_values = ["blake3_first_6_bits", "blake3_modulo_64", "blake3_xor_fold"]

[[tunable]]
key = "hen.birth_codon.provisional_recompute_on_edit"
type = "bool"
default = true
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"

[[tunable]]
key = "hen.birth_codon.governance_role_assignment"
type = "enum"
default = "auto"
residency_class = "freeze-on-session-start"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"
[tunable.range]
enum_values = ["auto", "manual", "policy-driven"]

[[tunable]]
key = "hen.birth_codon.candidate_codon_visible_in_orphan_review"
type = "bool"
default = true
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"

[[tunable]]
key = "hen.birth_codon.visualisation_density_normalisation"
type = "enum"
default = "log"
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"
[tunable.range]
enum_values = ["raw", "log", "sqrt"]

[[tunable]]
key = "hen.birth_codon.collision_policy"
type = "enum"
default = "warn-and-allow"
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "Tranche CCT-14b"
[tunable.range]
enum_values = ["first-wins", "salted-retry", "warn-and-allow"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_registry_load`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/hen.tunable.toml Body/S/S0/portal-core/tests/tunable_registry_load.rs
git commit -m "feat(tunable): declare Tranche CCT-14b Hen birth-codon knobs in schema

Track 38 Task 9. Seven knobs: seed_composition (Class A, restart-required,
global — affects corpus-wide determinism), derivation_policy (Class A),
provisional_recompute_on_edit (Class B), governance_role_assignment
(Class A), candidate_codon_visible_in_orphan_review (Class B),
visualisation_density_normalisation (Class B), collision_policy (Class B)."
```

### Task 10: Register Anuttara verifier constraint `tune_structural_invariant_compliance`

**Files:**
- Modify: `Body/S/S0/epi-lib/src/m0.c` — extend virtue-LUT registration
- Modify: `Body/S/S0/epi-lib/include/m0.h` — declare constraint
- Test: `Body/S/S0/epi-lib/tests/m0_tune_invariant_constraint.c` (or matching test harness)

- [ ] **Step 1: Read the existing virtue-LUT registration pattern**

Run: `grep -n "VIRTUE_LUT\|virtue_register\|slot_privacy_boundary" Body/S/S0/epi-lib/src/m0.c | head -20`
Expected: see existing registration shape; mirror the pattern below.

- [ ] **Step 2: Write the failing test**

```c
// Body/S/S0/epi-lib/tests/m0_tune_invariant_constraint.c
#include "m0.h"
#include <assert.h>
#include <string.h>

int main(void) {
    // Build a mock tuning proposal targeting a structural_invariant knob.
    M0_TuneProposal proposal;
    memset(&proposal, 0, sizeof(proposal));
    strncpy(proposal.knob_key, "m3.tarot_codon_map", sizeof(proposal.knob_key) - 1);
    proposal.target_structural_invariant = 1;

    M0_VerifierVerdict verdict = m0_check_tune_structural_invariant_compliance(&proposal);
    assert(verdict.violation == 1);
    assert(strstr(verdict.violation_name, "structural-invariant-violation") != NULL);

    // Non-invariant knob should pass.
    M0_TuneProposal ok;
    memset(&ok, 0, sizeof(ok));
    strncpy(ok.knob_key, "mythos.symbolic_protein_reading.cosmic_weather_weights",
            sizeof(ok.knob_key) - 1);
    ok.target_structural_invariant = 0;
    verdict = m0_check_tune_structural_invariant_compliance(&ok);
    assert(verdict.violation == 0);

    return 0;
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `make -C Body/S/S0/epi-lib test_m0_tune_invariant_constraint`
Expected: FAIL — symbol not found

- [ ] **Step 4: Add declaration to m0.h**

```c
// Body/S/S0/epi-lib/include/m0.h — append in the public-API section
typedef struct {
    char knob_key[128];
    int target_structural_invariant;  /* 1 if the targeted knob's structural_invariant flag is true */
} M0_TuneProposal;

typedef struct {
    int violation;  /* 0 = pass; 1 = violation */
    char violation_name[64];
} M0_VerifierVerdict;

M0_VerifierVerdict m0_check_tune_structural_invariant_compliance(const M0_TuneProposal* p);
```

- [ ] **Step 5: Implement in m0.c**

```c
// Body/S/S0/epi-lib/src/m0.c — append (find the existing slot_privacy_boundary_compliance
// implementation for shape reference)

#include <string.h>

M0_VerifierVerdict m0_check_tune_structural_invariant_compliance(const M0_TuneProposal* p) {
    M0_VerifierVerdict verdict;
    memset(&verdict, 0, sizeof(verdict));
    if (p == NULL) {
        verdict.violation = 1;
        strncpy(verdict.violation_name, "null-proposal", sizeof(verdict.violation_name) - 1);
        return verdict;
    }
    if (p->target_structural_invariant) {
        verdict.violation = 1;
        strncpy(verdict.violation_name, "structural-invariant-violation",
                sizeof(verdict.violation_name) - 1);
        return verdict;
    }
    return verdict;  /* pass */
}
```

- [ ] **Step 6: Wire into the verifier registration table**

```c
// Body/S/S0/epi-lib/src/m0.c — find the constraint registration table near VIRTUE_LUT
// and add an entry. Pattern (adjust to the actual struct in the file):
//
// { .name = "tune_structural_invariant_compliance",
//   .severity = M0_SEVERITY_ERROR,
//   .check_fn = (m0_constraint_check_fn) m0_check_tune_structural_invariant_compliance },
//
// IMPORTANT: read the existing slot_privacy_boundary_compliance registration first to match
// the exact struct shape (which fields, which type the check_fn pointer is).
```

- [ ] **Step 7: Run test to verify it passes**

Run: `make -C Body/S/S0/epi-lib test_m0_tune_invariant_constraint`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add Body/S/S0/epi-lib/src/m0.c Body/S/S0/epi-lib/include/m0.h Body/S/S0/epi-lib/tests/m0_tune_invariant_constraint.c
git commit -m "feat(m0): register tune_structural_invariant_compliance verifier constraint

Track 38 Task 10 (DR-TUNE-3 implementation). Anuttara verifier rejects
tuning proposals targeting knobs with structural_invariant=true.
Severity: error-level (blocks dispatch). Mirrors the existing
slot_privacy_boundary_compliance pattern from M'-MODEL-SLOT-SPEC §6."
```

### Task 11: Schema authoring README + class-chooser decision tree

**Files:**
- Create: `Body/S/S0/portal-core/tunable-schema/README.md`

- [ ] **Step 1: Author the README**

```markdown
# Tunable Schema Authoring Guide

This directory holds the canonical tunability schema for the Epi-Logos system.
Each `*.tunable.toml` file declares a set of related knobs with full metadata.
See [Track 38 spec](../../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/38-tunability-surface-architecture.md).

## File naming

`{owning-subsystem-or-carrier}.tunable.toml` — e.g. `nara_session.tunable.toml`,
`mythos.tunable.toml`, `hen.tunable.toml`, `aletheia.tunable.toml`,
`cross.tunable.toml`.

## Per-knob metadata

```toml
[[tunable]]
key = "subsystem.scope.knob_name"          # dot-separated; unique system-wide
type = "u32"                               # bool|u32|u64|f32|string|enum|f32_triplet|string_array
default = 256                              # type-matched literal
residency_class = "freeze-on-session-start" # hot-reload|freeze-on-session-start|restart-required
scope_class = "global"                     # global|per-pasu|per-session
tuning_risk_class = "A"                    # A (user-gated default) | B (auto-with-rollback) | C (Aletheia-pattern)
ml_trainable = false                       # eligible for Tier 3 retrain proposals
privacy_class = "non-sensitive"            # local-only|vector-derived|non-sensitive
structural_invariant = false               # if true, verifier rejects all tuning proposals
owning_subsystem = "M4"                    # M0..M5 | cross
owning_carrier = "anima"                   # optional; ta-onta carrier name
authoritative_doc = "Tranche 5.26"         # canonical citation
warrant_constants = []                     # required if structural_invariant=true
description = "..."                        # optional

[tunable.range]
min = 16
max = 4096
```

## The class-chooser decision tree

### residency_class — when does a change take effect?

1. Does the knob affect determinism within a session (e.g., affects results that downstream code reads back from the same session)?
   - **Yes** → `freeze-on-session-start` (default; safest)
2. Does the knob touch loaded model weights, agent harness composition, or constraint-registry registration?
   - **Yes** → `restart-required`
3. Pure-cosmetic, no determinism dependency?
   - **Yes** → `hot-reload`

### scope_class — who can have a value here?

1. Does the knob's value depend on user-identity or PASU-bound rhythm/preference?
   - **Yes** → `per-pasu`
2. Is this a session-debug override only?
   - **Yes** → `per-session`
3. Default → `global`

### tuning_risk_class — how should the self-awareness loop gate proposals?

| Class | When |
|---|---|
| **A** (default) | Structural-adjacent, ML-trainable, voice-template, privacy-touching, or user-visible. User validates every proposal. |
| **B** | Cosmetic — visualization mode, density normalisation, secondary archetype count, ordering. Auto-applies on unanimous triplet consensus with rollback. |
| **C** | Purely internal — drift thresholds, Elo seed, cache TTL. Auto-applies per existing Aletheia pattern, no triplet. |

### ml_trainable

Set `true` only if the knob's value is genuinely learnable from accumulated corpus + user feedback (e.g., user-resonant weights, rhythmic intervals). Privacy_class MUST be `local-only` if PASU-derived data flows into the training signal.

### privacy_class

| Class | When |
|---|---|
| `local-only` | PASU-bound raw content derived; never crosses PASU boundary; ML training confined to Nara-parser slot |
| `vector-derived` | Derived from already-vectorized signal; may train on cloud-opt-in with consent |
| `non-sensitive` | No privacy implication |

### structural_invariant

Set `true` ONLY if the knob represents a structural-canon constant (e.g., 27/37/1/3 codon cardinalities, EPOGDOON_NUM/DEN, RESONANCE_DIM=72, QUATERNION_AXIS_ORDER, M3_TAROT_CODON_MAP, M2_PLANET_LUT). MUST include `warrant_constants = [...]` naming the locking constants AND `authoritative_doc` citing the DR row that ratifies them. The verifier rejects ALL tuning proposals targeting structural_invariant knobs.

## Validation

Run from project root:

```bash
cargo test -p epi-portal-core --test tunable_registry_load
cargo test -p epi-portal-core --test tunable_registry_validate
```

Both must pass before merge.
```

- [ ] **Step 2: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/README.md
git commit -m "docs(tunable): schema authoring guide + class-chooser decision tree

Track 38 Task 11 (DR-TUNE-3 documentation). Explains the per-knob metadata
fields and how to choose residency_class / scope_class / tuning_risk_class /
ml_trainable / privacy_class / structural_invariant for new knobs."
```

### Task 12: Cargo build + full registry validation gate

**Files:**
- Test: `Body/S/S0/portal-core/tests/tunable_full_registry.rs`

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/tunable_full_registry.rs
use epi_portal_core::tunable::registry::TunableRegistry;
use std::path::PathBuf;

#[test]
fn full_registry_loads_and_validates() {
    let mut p = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tunable-schema");
    let reg = TunableRegistry::load_from_dir(&p).expect("schema load");
    reg.validate().expect("schema validates");

    // Sanity: at least the four consumer sets are present
    let counts = [
        ("cross.", 1usize),  // cross.spawn_timeout_ms
        ("nara.session.", 4usize),  // 5.26
        ("mythos.symbolic_protein_reading.", 9usize),  // 5.27
        ("hen.birth_codon.", 7usize),  // CCT-14b
    ];
    for (prefix, expected) in counts {
        let count = reg.iter().filter(|(k, _)| k.starts_with(prefix)).count();
        assert_eq!(count, expected,
            "knob count under prefix {} = {}, expected {}", prefix, count, expected);
    }
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cargo test -p epi-portal-core --test tunable_full_registry`
Expected: PASS — full schema loads, validates, knob counts match

- [ ] **Step 3: Commit**

```bash
git add Body/S/S0/portal-core/tests/tunable_full_registry.rs
git commit -m "test(tunable): full registry load + validate + knob-count gate

Track 38 Task 12. Asserts the four consumer schema files
(cross/nara_session/mythos/hen) load together, validate, and contain
the expected knob counts (1+4+9+7=21 total at this milestone)."
```

---

## Tranche 06.12 — Migrate Existing Config Surfaces (Must precede consumers)

Migrates `[nara.weights]`, `[aletheia.drift_detection]`, `[aletheia.elo]`, `[slot.*]` to schema-driven loaders. Backward compatibility: existing `~/.epi-logos/config.toml` files continue to load.

### Task 13: Declare nara.weights schema + migrate weights.rs

**Files:**
- Create: `Body/S/S0/portal-core/tunable-schema/nara.tunable.toml`
- Modify: `Body/S/S0/epi-cli/src/nara/weights.rs`
- Test: `Body/S/S0/epi-cli/tests/nara_weights_schema_backed.rs`

- [ ] **Step 1: Read the existing weights.rs structure**

Run: `cat Body/S/S0/epi-cli/src/nara/weights.rs | head -100`
Note the 7 fields: body_natal, body_transit, body_oracle, oracle_pp, oracle_nn, oracle_mp, oracle_pm. All f32. Defaults from existing file.

- [ ] **Step 2: Create nara.tunable.toml**

```toml
# Body/S/S0/portal-core/tunable-schema/nara.tunable.toml
# Existing [nara.weights] section, migrated to schema-backed.

[[tunable]]
key = "nara.weights.body_natal"
type = "f32"
default = 0.5
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "Existing weights.rs (pre-Track 38) + DR-TUNE-1 ratification"
[tunable.range]
min = 0.0
max = 1.0

# repeat for body_transit, body_oracle, oracle_pp, oracle_nn, oracle_mp, oracle_pm
# (defaults read from current weights.rs; copy verbatim)
```

(Engineer: fill in remaining 6 knobs by reading the actual defaults from `weights.rs::NaraWeights::default()`.)

- [ ] **Step 3: Write the failing test**

```rust
// Body/S/S0/epi-cli/tests/nara_weights_schema_backed.rs
use epi_cli::nara::weights::{NaraWeights, load_weights};

#[test]
fn nara_weights_backward_compat_with_existing_toml() {
    // Set HOME to a tempdir with a legacy config.toml containing [nara.weights]
    let tmp = tempfile::tempdir().unwrap();
    std::env::set_var("HOME", tmp.path());
    let cfg_dir = tmp.path().join(".epi-logos");
    std::fs::create_dir_all(&cfg_dir).unwrap();
    std::fs::write(cfg_dir.join("config.toml"), r#"
[nara.weights]
body_natal = 0.7
body_transit = 0.2
body_oracle = 0.1
oracle_pp = 0.4
oracle_nn = 0.3
oracle_mp = 0.2
oracle_pm = 0.1
"#).unwrap();
    let w = load_weights().expect("load");
    assert!((w.body_natal - 0.7).abs() < 1e-6);
    assert!((w.body_transit - 0.2).abs() < 1e-6);
}
```

- [ ] **Step 4: Run test to verify it fails OR passes (existing impl may already pass; the test is the backward-compat gate)**

Run: `cargo test -p epi-cli --test nara_weights_schema_backed`
Expected: PASS (the existing manual TOML parse should handle this; if not, the migration must preserve it)

- [ ] **Step 5: Refactor weights.rs to use TunableRegistry**

```rust
// Body/S/S0/epi-cli/src/nara/weights.rs — replace manual TOML parsing with registry lookup
// Keep the public NaraWeights struct unchanged for backward compatibility.

use epi_portal_core::tunable::{TunableRegistry, TunableValue, ScopeResolver, ResolutionContext};
use std::path::PathBuf;

fn schema_dir() -> PathBuf {
    // Resolve relative to the portal-core crate (or use an env var EPI_TUNABLE_SCHEMA_DIR)
    std::env::var("EPI_TUNABLE_SCHEMA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let mut p = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            p.push("..");
            p.push("portal-core");
            p.push("tunable-schema");
            p
        })
}

fn config_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_default();
    PathBuf::from(home).join(".epi-logos").join("config.toml")
}

pub fn load_weights() -> Result<NaraWeights, String> {
    let cfg = config_path();
    let reg = TunableRegistry::load_with_overrides(&schema_dir(), Some(&cfg))
        .map_err(|e| e.to_string())?;
    let mut w = NaraWeights::default();
    if let Some(TunableValue::F32(v)) = reg.value("nara.weights.body_natal") {
        w.body_natal = v;
    }
    // ... repeat for all 7 fields
    Ok(w)
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cargo test -p epi-cli --test nara_weights_schema_backed`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/nara.tunable.toml Body/S/S0/epi-cli/src/nara/weights.rs Body/S/S0/epi-cli/tests/nara_weights_schema_backed.rs
git commit -m "refactor(nara): migrate [nara.weights] to TunableRegistry-backed loader

Track 38 Task 13. Existing ~/.epi-logos/config.toml files continue to load.
Removes the manual TOML parsing from weights.rs in favor of the schema-driven
loader. Each weight now declared as Class A ML-trainable per-PASU local-only
knob — the surface treats them as canonical first-class tunables."
```

### Task 14: Declare aletheia.tunable.toml (drift_detection + elo)

Per M'-ML-SKILL-SURFACE-SPEC §5 no-hardcoding lock. Mark all as Class C.

- [ ] **Step 1: Create the schema file**

```toml
# Body/S/S0/portal-core/tunable-schema/aletheia.tunable.toml
# Existing [aletheia.drift_detection] + [aletheia.elo] no-hardcoding lock,
# migrated to schema-backed. ALL Class C per DR-TUNE-3.

[[tunable]]
key = "aletheia.drift_detection.delta_elo"
type = "f32"
default = 50.0
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.drift_detection.min_trials"
type = "u32"
default = 50
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.drift_detection.coverage_days"
type = "u32"
default = 14
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.drift_detection.verifier_violation_multiplier"
type = "f32"
default = 2.0
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.drift_detection.veto_count_per_facet"
type = "u32"
default = 3
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.drift_detection.veto_consecutive_sessions"
type = "u32"
default = 3
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.elo.seed_rating"
type = "f32"
default = 1500.0
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.elo.confidence_penalty_alpha"
type = "f32"
default = 0.5
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.elo.bootstrap_trials"
type = "u32"
default = 10
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"

[[tunable]]
key = "aletheia.elo.bootstrap_sigma"
type = "f32"
default = 350.0
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "C"
owning_subsystem = "cross"
owning_carrier = "aletheia"
authoritative_doc = "M'-ML-SKILL-SURFACE-SPEC §5 + Track 38"
```

- [ ] **Step 2: Run full-registry test to verify**

Run: `cargo test -p epi-portal-core --test tunable_full_registry`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/aletheia.tunable.toml
git commit -m "feat(tunable): declare [aletheia.drift_detection] + [aletheia.elo] as Class C

Track 38 Task 14. Names the existing no-hardcoding-lock pattern from
M'-ML-SKILL-SURFACE-SPEC §5 as Tier-2-Class-C explicitly. These knobs
self-tune via Mercurius rating dynamics, NOT through the 4'-5'-0' triplet."
```

### Task 15: Declare slot.tunable.toml (model-slot config)

Per M'-MODEL-SLOT-SPEC.

- [ ] **Step 1: Create the schema file (skeleton; full slot enumeration is per-deployment)**

```toml
# Body/S/S0/portal-core/tunable-schema/slot.tunable.toml
# Existing [slot.*] per M'-MODEL-SLOT-SPEC, migrated to schema-backed.

[[tunable]]
key = "slot.nara_parser.state"
type = "enum"
default = "local-default"
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "local-only"
owning_subsystem = "M4"
authoritative_doc = "M'-MODEL-SLOT-SPEC §2"
[tunable.range]
enum_values = ["local-default", "cloud-opt-in", "null"]

[[tunable]]
key = "slot.epii_judge.state"
type = "enum"
default = "cloud-opt-in"
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "vector-derived"
owning_subsystem = "M5"
authoritative_doc = "M'-MODEL-SLOT-SPEC §3"
[tunable.range]
enum_values = ["local-default", "cloud-opt-in", "cloud-opt-in-pool", "null"]

# (engineer: add per-Aletheia-subagent slot.* entries per M'-MODEL-SLOT-SPEC §4)
```

- [ ] **Step 2: Commit**

```bash
git add Body/S/S0/portal-core/tunable-schema/slot.tunable.toml
git commit -m "feat(tunable): declare [slot.*] knobs from M'-MODEL-SLOT-SPEC in schema

Track 38 Task 15. nara_parser slot (Class A, local-only, restart-required)
and epii_judge slot (Class A, vector-derived). Per-Aletheia-subagent
slots added per spec §4."
```

### Task 16: Promote KAIROS_ENABLED env var to schema

- [ ] **Step 1: Append to cross.tunable.toml**

```toml
# Body/S/S0/portal-core/tunable-schema/cross.tunable.toml — append

[[tunable]]
key = "kairos.enabled"
type = "bool"
default = false
residency_class = "restart-required"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
owning_subsystem = "cross"
owning_carrier = "chronos"
authoritative_doc = "MEMORY canon — KAIROS_ENABLED env var promotion"
description = "Master kill-switch for kerykeion-backed kairos features. Replaces env var KAIROS_ENABLED."
```

- [ ] **Step 2: Add a compatibility shim test**

```rust
// Body/S/S0/portal-core/tests/kairos_enabled_compat.rs
#[test]
fn kairos_enabled_reads_from_schema_default() {
    let mut p = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tunable-schema");
    let reg = epi_portal_core::tunable::registry::TunableRegistry::load_from_dir(&p).unwrap();
    let v = reg.value("kairos.enabled").unwrap();
    assert_eq!(v, epi_portal_core::tunable::metadata::TunableValue::Bool(false));
}
```

- [ ] **Step 3: Run test + commit**

Run: `cargo test -p epi-portal-core --test kairos_enabled_compat`
Expected: PASS

```bash
git add Body/S/S0/portal-core/tunable-schema/cross.tunable.toml Body/S/S0/portal-core/tests/kairos_enabled_compat.rs
git commit -m "feat(tunable): promote KAIROS_ENABLED env var to kairos.enabled schema knob

Track 38 Task 16. Migration of env var to schema-resident knob. Existing
env var consumers should be updated separately to read from registry."
```

---

## Tranche 06.8 — Tuning UI Theia Extension

**Tranche scope:** New Theia extension at `Body/M/epi-theia/extensions/tuning-surface/` adding a 10th OmniPanel tab. Consumes the schema crate via gateway RPC `s5'.tune.*`. No modals.

### Task 17: Scaffold tuning-surface Theia extension

**Files:**
- Create: `Body/M/epi-theia/extensions/tuning-surface/package.json`
- Create: `Body/M/epi-theia/extensions/tuning-surface/src/common/index.ts`
- Create: `Body/M/epi-theia/extensions/tuning-surface/src/common/tuning-surface.ts`
- Test: `Body/M/epi-theia/extensions/tuning-surface/test/tuning-surface.test.ts`

- [ ] **Step 1: Inspect an existing M-extension scaffold for shape reference**

Run: `cat Body/M/epi-theia/extensions/m5-epii/package.json`
Note: package name pattern, contribution-point structure, depends declarations.

- [ ] **Step 2: Author package.json**

```json
{
  "name": "@epi/tuning-surface",
  "version": "0.0.1",
  "description": "Track 38 — Tunability surface OmniPanel tab",
  "files": ["lib", "src"],
  "dependencies": {
    "@theia/core": "^1.49.0",
    "@theia/filesystem": "^1.49.0",
    "@theia/workspace": "^1.49.0",
    "@theia/output": "^1.49.0",
    "tslib": "^2.6.2"
  },
  "scripts": {
    "build": "tsc -b",
    "test": "vitest run"
  },
  "theiaExtensions": [
    {
      "frontend": "lib/browser/frontend-module"
    }
  ]
}
```

- [ ] **Step 3: Author DTOs**

```typescript
// Body/M/epi-theia/extensions/tuning-surface/src/common/tuning-surface.ts
export type ResidencyClass = 'hot-reload' | 'freeze-on-session-start' | 'restart-required';
export type ScopeClass = 'global' | 'per-pasu' | 'per-session';
export type TuningRiskClass = 'A' | 'B' | 'C';
export type PrivacyClass = 'local-only' | 'vector-derived' | 'non-sensitive';

export interface TunableMetadata {
    readonly key: string;
    readonly type: string;
    readonly default: unknown;
    readonly residency_class: ResidencyClass;
    readonly scope_class: ScopeClass;
    readonly tuning_risk_class: TuningRiskClass;
    readonly ml_trainable: boolean;
    readonly privacy_class: PrivacyClass;
    readonly structural_invariant: boolean;
    readonly owning_subsystem: string;
    readonly owning_carrier?: string;
    readonly authoritative_doc: string;
    readonly warrant_constants: readonly string[];
    readonly description?: string;
}

export interface KnobCurrentValue {
    readonly key: string;
    readonly current: unknown;
    readonly is_default: boolean;
    readonly locked: boolean;
}

export interface AuditEntry {
    readonly timestamp: string;
    readonly knob_key: string;
    readonly from_value: unknown;
    readonly to_value: unknown;
    readonly actor: 'user' | 'anamnesis-proposer' | 'aletheia-drift-detection' | 'user-rollback';
    readonly tier: 1 | 2 | 3;
    readonly risk_class: TuningRiskClass;
    readonly proposing_evidence: readonly string[];
    readonly rollback_handle: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add Body/M/epi-theia/extensions/tuning-surface/
git commit -m "feat(tuning-surface): scaffold Theia extension + common DTOs

Track 38 Task 17. New extension at Body/M/epi-theia/extensions/tuning-surface/.
TunableMetadata + KnobCurrentValue + AuditEntry DTOs mirror the Rust types
from epi-portal-core::tunable."
```

### Task 18: Gateway methods `s5'.tune.*`

**Files:**
- Modify: `Body/S/S3/gateway-contract/src/lib.rs`
- Modify: `Body/S/S3/gateway/src/...` — wire dispatch
- Test: `Body/S/S3/gateway-contract/tests/s5_tune_methods.rs`

- [ ] **Step 1: Locate the existing `s5'.review.*` registration to mirror**

Run: `grep -n "s5'.review\|s5'.improve" Body/S/S3/gateway-contract/src/lib.rs`
Expected: see the existing METHODS table format and method-arg JSON schema location.

- [ ] **Step 2: Write the failing test**

```rust
// Body/S/S3/gateway-contract/tests/s5_tune_methods.rs
use epi_gateway_contract::*;

#[test]
fn s5_tune_registry_methods_registered() {
    let methods = METHODS;  // or whatever the public method list is named
    for name in [
        "s5'.tune.registry.list",
        "s5'.tune.registry.get",
        "s5'.tune.registry.set",
        "s5'.tune.audit.read",
        "s5'.tune.lock.toggle",
        "s5'.tune.propose",
    ] {
        assert!(methods.iter().any(|m| m.name == name), "method {} missing", name);
    }
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `cargo test -p epi-gateway-contract --test s5_tune_methods`
Expected: FAIL

- [ ] **Step 4: Add the method registrations**

```rust
// Body/S/S3/gateway-contract/src/lib.rs — find the existing METHODS table near line 209
// and add (adjust to match existing struct shape):

// s5'.tune.registry.list — no args, returns Vec<TunableMetadata>
// s5'.tune.registry.get — { key: String } → TunableMetadata + current value
// s5'.tune.registry.set — { key, value, actor, evidence } → AuditEntry
// s5'.tune.audit.read — { key } → Vec<AuditEntry>
// s5'.tune.lock.toggle — { key, locked: bool } → ack
// s5'.tune.propose — { key, to_value, proposing_evidence, tier } → ProposalReceipt
```

- [ ] **Step 5: Run test + commit**

Run: `cargo test -p epi-gateway-contract --test s5_tune_methods`
Expected: PASS

```bash
git add Body/S/S3/gateway-contract/src/lib.rs Body/S/S3/gateway-contract/tests/s5_tune_methods.rs
git commit -m "feat(gateway): register s5'.tune.* methods

Track 38 Task 18. Six methods for Tuning tab: registry.list/get/set,
audit.read, lock.toggle, propose. Wire dispatch lands in Body/S/S3/gateway/."
```

### Tasks 19-25: Theia extension UI tasks (knob-tree, knob-detail, audit-trail viewer, filter chips, lock action, propose form, OmniPanel registration)

(Engineer: Tasks 19-25 follow the same TDD pattern. Each task produces a single React component or service binding. Reference [`Body/M/epi-theia/extensions/m5-epii/src/browser/`](../../../../../Body/M/epi-theia/extensions/m5-epii/src/browser/) for the canonical Theia component patterns. Per task: write failing component test → implement minimal Component → run test → commit. Components to land:

- **Task 19**: `tuning-tab.tsx` — root component with left/right pane split
- **Task 20**: `knob-tree.tsx` — left pane grouped by `owning_subsystem`
- **Task 21**: `knob-detail.tsx` — right pane with editable form per type
- **Task 22**: `audit-trail-viewer.tsx` — inline audit log per knob
- **Task 23**: `filter-chips.tsx` — Tier 1/2/3 filter
- **Task 24**: Lock-knob action wired to `s5'.tune.lock.toggle`
- **Task 25**: OmniPanel registration as 10th tab in [`Body/M/epi-theia/extensions/omnipanel-shell/`](../../../../../Body/M/epi-theia/extensions/omnipanel-shell/)

Each task: small failing test (vitest), minimal implementation, commit. Same TDD discipline as Tasks 1-12.)

---

## Tranche 06.9 — Tier 2 Self-Awareness Lifecycle

### Task 26: Scaffold AnamnesisProposer module

**Files:**
- Create: `Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs`
- Modify: `Body/S/S5/epii-autoresearch-core/src/lib.rs` — add module
- Test: `Body/S/S5/epii-autoresearch-core/tests/anamnesis_proposer_scaffold.rs`

- [ ] **Step 1: Write the failing test**

```rust
// tests/anamnesis_proposer_scaffold.rs
use epii_autoresearch_core::anamnesis_proposer::{AnamnesisProposer, TuningProposal, EvidenceWindow};

#[test]
fn proposer_constructs_with_empty_evidence() {
    let proposer = AnamnesisProposer::new();
    let window = EvidenceWindow::empty();
    let proposals = proposer.propose_from_evidence(&window);
    assert!(proposals.is_empty());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p epii-autoresearch-core --test anamnesis_proposer_scaffold`
Expected: FAIL

- [ ] **Step 3: Implement scaffold**

```rust
// Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceWindow {
    pub session_ids: Vec<String>,
    pub mahamaya_transcription_chains: Vec<String>,
    pub mythos_archetype_readings: Vec<String>,
    pub sophia_review_outcomes: Vec<String>,
    pub hen_birth_codon_clusters: Vec<String>,
}

impl EvidenceWindow {
    pub fn empty() -> Self {
        Self {
            session_ids: vec![],
            mahamaya_transcription_chains: vec![],
            mythos_archetype_readings: vec![],
            sophia_review_outcomes: vec![],
            hen_birth_codon_clusters: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TuningProposal {
    pub knob_key: String,
    pub from_value: serde_json::Value,
    pub to_value: serde_json::Value,
    pub proposing_evidence: Vec<String>,
    pub tier: u8,  /* 2 for self-awareness; 3 for ML-training-derived */
}

pub struct AnamnesisProposer {}

impl AnamnesisProposer {
    pub fn new() -> Self { Self {} }

    pub fn propose_from_evidence(&self, _evidence: &EvidenceWindow) -> Vec<TuningProposal> {
        /* Scaffold: returns empty. Tasks 27-29 add evidence-rule heuristics. */
        vec![]
    }
}
```

- [ ] **Step 4: Add module to lib.rs**

```rust
// Body/S/S5/epii-autoresearch-core/src/lib.rs
pub mod anamnesis_proposer;
```

- [ ] **Step 5: Run test + commit**

```bash
git add Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs Body/S/S5/epii-autoresearch-core/src/lib.rs Body/S/S5/epii-autoresearch-core/tests/anamnesis_proposer_scaffold.rs
git commit -m "feat(autoresearch): scaffold AnamnesisProposer for Tier 2

Track 38 Task 26. Empty scaffold module. EvidenceWindow + TuningProposal
types. Evidence-rule heuristics land in Tasks 27-29."
```

### Task 27: TuningReview CapacityId variant

**Files:**
- Modify: `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs`
- Test: `Body/S/S5/epii-autoresearch-core/tests/tuning_review_variant.rs`

- [ ] **Step 1: Locate existing CapacityId enum**

Run: `grep -n "enum CapacityId\|CapacityId::" Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs | head -20`

- [ ] **Step 2: Write the failing test**

```rust
// tests/tuning_review_variant.rs
use epii_autoresearch_core::capacity_workflows::CapacityId;

#[test]
fn capacity_id_has_tuning_review_variant() {
    let id = CapacityId::TuningReview;
    assert_eq!(format!("{:?}", id), "TuningReview");
}

#[test]
fn capacity_id_seven_variants_total() {
    let all = [
        CapacityId::Anuttara,
        CapacityId::Paramasiva,
        CapacityId::Parashakti,
        CapacityId::Mahamaya,
        CapacityId::Nara,
        CapacityId::EpiiOnEpii,
        CapacityId::TuningReview,
    ];
    assert_eq!(all.len(), 7);
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `cargo test -p epii-autoresearch-core --test tuning_review_variant`
Expected: FAIL — no TuningReview variant

- [ ] **Step 4: Add the variant**

```rust
// Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs
// Find the existing enum CapacityId and add the variant
pub enum CapacityId {
    Anuttara,
    Paramasiva,
    Parashakti,
    Mahamaya,
    Nara,
    EpiiOnEpii,
    TuningReview,  // Track 38 §5.1 — 7th lane
}

// Also extend any match arms (registry, governance_lead, etc.) — find the existing
// `build_capacity_workflow_snapshot` impl and add the TuningReview branch with
// governance_lead = "sophia" per the spec.
```

- [ ] **Step 5: Run test + commit**

```bash
git add Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs Body/S/S5/epii-autoresearch-core/tests/tuning_review_variant.rs
git commit -m "feat(autoresearch): add TuningReview 7th capacity-lane variant

Track 38 Task 27. CapacityId enum extends with TuningReview alongside the
six existing operational-capacity lanes. governance_lead = Sophia per
Track 38 §5.1."
```

### Tasks 28-33: Class A/B/C routing, anti-runaway guards, gateway methods, integration tests

(Engineer: each task follows the same TDD pattern. Implement in order:

- **Task 28**: Class A routing (`humanRequired=true` proposals land on OmniPanel Review tab via `s5'.review.submit`)
- **Task 29**: Class B routing (constitutional triplet consensus check before auto-apply)
- **Task 30**: Class C routing (skip triplet; call existing Aletheia path)
- **Task 31**: Anti-runaway-tuning guards (per-knob frequency ceiling, per-window absolute ceiling, lock-state check)
- **Task 32**: Gateway methods `s5'.tune.proposals.{list, resolve}` (mirrors `s5'.review.{inbox, resolve}` exactly)
- **Task 33**: Integration test simulating 30 sessions with Mythos cosmic-weather-weight evidence → AnamnesisProposer emits Class A proposal → lands in Review tab with full triplet verdict

Each task: failing test → minimal implementation → run → commit.)

---

## Tranche 06.10 — Tier 3 ML-Training Hook

### Task 34: Extend aletheia-drift-detection with `compose_tuning_proposal()`

**Files:**
- Create or modify: `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/scripts/compose_task.py`
- Test: `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/tests/test_compose_tuning_proposal.py`

(Engineer: depends on Track 12.24 having landed the `aletheia-drift-detection` skill scaffold. If not yet landed, Track 38 Task 34 STAGES the additive contract — produce a stub `compose_tuning_proposal()` that returns a structured proposal payload. Same TDD discipline.)

### Tasks 35-37: dispatch_purpose annotation, privacy-class compliance check, integration test

(Engineer: same TDD pattern. Wire `dispatch_purpose: "tuning-calibration"` annotation through dispatch path; extend Anuttara verifier `slot_privacy_boundary_compliance` Cypher to also match `Dispatch.tuning_target_knob_privacy_class` and `Dispatch.evidence_window_pasu_count` fields per DR-TUNE-4 spec §9.4. Integration test: simulate Mythos cosmic-weather-weights drift → Aletheia generates tuning-calibration proposal → routes through Tier 2 review.)

---

## Tranche 06.11 — Audit Loop for Hardcoded-Relation Detection

### Tasks 38-40: M0 Anuttara hardcoded-relation lint

**Files:**
- Create: `Body/S/S0/epi-lib/src/m0_anuttara_lint.c`
- Create: `Body/S/S0/epi-lib/tunable-audit-report.md` (output)
- Test: `Body/S/S0/epi-lib/tests/m0_anuttara_lint.c`

(Engineer: per Track 38 §8 Tranche 06.11. Scans source files for hardcoded-shaped patterns: numeric literals in `const`/`default` positions, magic numbers in business logic, hardcoded timeouts. Emits a candidate-tunable-knob report distinguishing structural-invariant candidates from genuinely-tunable. Manual review pass migrates candidates into the schema via `tunable.toml` authoring per §3.2.

- **Task 38**: Scanner skeleton (find numeric literals in const/default positions)
- **Task 39**: Report generator — markdown output with file:line citations
- **Task 40**: Cycle audit pass — generate the first report; manually triage ~15-25 candidates from Track 38 §7.3 into proper `tunable.toml` declarations

Each follows the failing-test → minimal-implementation → run → commit pattern.)

---

## Self-Review

After completing each tranche, run:

```bash
# Full schema validation
cargo test -p epi-portal-core --test tunable_full_registry

# Backward compat for existing config consumers
cargo test -p epi-cli --test nara_weights_schema_backed
cargo test -p epi-cli --test aletheia_drift_detection_no_hardcoding_lock_preserved

# Verifier constraint enforcement
make -C Body/S/S0/epi-lib test_m0_tune_invariant_constraint
cargo test -p epi-lib m0_verifier_blocks_cross_pasu_tuning_on_local_only_knob

# Tier 2 routing
cargo test -p epii-autoresearch-core class_a_routes_to_human_review
cargo test -p epii-autoresearch-core class_b_auto_applies_on_unanimous_triplet
cargo test -p epii-autoresearch-core class_c_does_not_invoke_triplet
cargo test -p epii-autoresearch-core per_knob_frequency_ceiling_throttles_proposals

# Tier 3 routing
cargo test -p aletheia-drift-detection compose_tuning_proposal_routes_to_tier_2
cargo test -p aletheia-drift-detection privacy_class_local_only_blocks_cross_pasu_dispatch

# Gateway methods
cargo test -p epi-gateway-contract s5_tune_methods

# UI extension
cd Body/M/epi-theia/extensions/tuning-surface && pnpm test
```

All MUST pass before declaring Track 38 acceptance-ready.

---

## Spec Coverage Cross-Check

Track 38 spec → this plan mapping:

| Spec § | Plan task(s) |
|---|---|
| §1 Locating the surface (cross-coordinate) | Tasks 1-2 (M5-2' schema crate); Task 17 (M5-3' Theia extension); Task 27 (M5-4' TuningReview lane) |
| §2.1 Tier 1 developer-tuning | Tasks 1-16 + 17-25 |
| §2.2 Tier 2 self-awareness | Tasks 26-33 |
| §2.3 Tier 3 ML-trained | Tasks 34-37 |
| §3.1 Per-knob metadata | Task 1 |
| §3.2 Schema file layout | Tasks 7-9, 11, 13-16 |
| §3.3 Validation | Tasks 3, 12 |
| §3.4 Hot-reload / residency classes | Task 1 (enum); enforcement in consumer code |
| §3.5 Scope axis | Task 5 |
| §4 Tuning UI | Tasks 17-25 |
| §5.1 Tier 2 lifecycle | Tasks 26-33 |
| §5.2 Tier 3 lifecycle | Tasks 34-37 |
| §5.3 Provenance + rollback | Task 6 (audit writer); Task 22 (audit-trail viewer); Task 24 (lock-knob) |
| §6.1 Tranche 5.26 knobs | Task 7 |
| §6.2 Tranche 5.27 knobs | Task 8 |
| §6.3 Tranche CCT-14b knobs | Task 9 |
| §7.1 Structural invariants | Task 10 (verifier constraint enforces) |
| §7.2 Existing tunable surfaces migration | Tasks 13-16 |
| §7.3 Hardcoded constants candidates | Tasks 38-40 (audit loop) |
| §8 Tranche proposals | Whole plan IS the tranches |
| §9 DR rows | Already landed in 13-decision-register.md |
| §10 Verification gates | Self-review section above |

No spec section uncovered.

---

## Plan complete and saved to `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/38-tunability-surface-implementation-plan.md`.

**Execution options for the engineer working through this plan:**

1. **Subagent-Driven (recommended for solo-Claude implementation)** — Fresh subagent per task; review between tasks; fast iteration. REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`.

2. **Inline Execution** — Execute tasks in current session using `superpowers:executing-plans`. Batch execution with checkpoints for human review.

3. **`/m-dev` autonomous loop** — The project's existing `/m-dev` skill consumes Track 38 §8 tranche text from [`38-tunability-surface-architecture.md`](38-tunability-surface-architecture.md); this plan provides the TDD discipline `/m-dev` can apply per-tranche.

Tranche acceptance criteria are itemized in the spec doc §10. Each tranche must pass all listed verification commands before declaring complete.
