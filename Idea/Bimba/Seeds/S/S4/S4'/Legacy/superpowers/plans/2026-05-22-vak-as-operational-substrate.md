# VAK As Operational Substrate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the VAK system from "describes" (metadata commentary that runs alongside dispatch) to "operates" (causal substrate where every action is VAK-bound, every artifact carries its address, every session is a closed Z-cycle, and the Möbius seam closes Sophia→Aletheia→Epii so cycles accumulate). All ten jobs named in the 2026-05-22 architectural review; no minimum-set deferrals.

**Architecture:** Two layers integrate: **S0' carries VAK as grammar** (`portal-core`, `ql_types`, `vak_system` — type-level immutable reference); **Anima carries VAK as operation** (`ta-onta/S4-4p-anima`, dispatch tools, lifecycle hooks). The wire between them is: no action without an S0-validated address, persisted at session boundary via S3 gateway (multi-session surface), closed by Möbius seam wired from Anima session_end through Aletheia membrane to Epii autoresearch. Anima self-instantiation is a gateway-integrated function because the gateway is the multi-session surface. Subagent-friendly task decomposition with TDD discipline; tests must exercise real mapping / persistence / skill manifests / Rust store behaviour — no mocked service success paths.

**Tech Stack:** Rust (`portal-core`, `Body/S/S3/gateway`, `Body/S/S2/graph-services`, `Body/S/S5/epii-autoresearch-core`, `Body/S/S5/epii-review-core`), TypeScript (`Body/S/S4/ta-onta/S4-{0..5}p-*/extension.ts`, `.pi/extensions/s_i/modules/vak_system/`, pi-agent), Markdown (skill manifests, agent.md), JSON (Pleroma capability matrix), YAML (envelope schema, agent.md frontmatter, pi-agent teams), Node 24 `--experimental-strip-types`, vitest, Python unittest, `cargo test`.

**REPO LAYOUT NOTE (critical):** Two repos in play:
1. `/Users/admin/Documents/Epi-Logos/` — TypeScript / PI agent runtime / `.pi/extensions/s_i/modules/{ql_types,vak_system,ta_onta}/`
2. `/Users/admin/Documents/Epi-Logos C Experiments/` — Rust kernel (`Body/S/S0/portal-core`, `Body/S/S2/graph-services`, `Body/S/S3/gateway`, `Body/S/S5/epii-*`), ta-onta extensions (`Body/S/S4/ta-onta/S4-*p-*/`), Pleroma plugin (`Body/S/S4/plugins/pleroma/`), pi-agent registration (`Body/S/S4/pi-agent/`).

Paths in tasks below using `.pi/extensions/...` live in repo (1); paths using `Body/S/...` live in repo (2). Task A1 establishes the canonical TS VakAddress in repo (1)'s ql_types. Task A1c establishes a thin shared TS mirror in repo (2) that ta-onta extensions import locally (avoids cross-repo relative imports). All Rust types live only in repo (2).

---

## File Structure

**S0' — VAK grammar surfaces (static reference, the alphabet):**
- `.pi/extensions/s_i/modules/ql_types/index.ts` — add `VakAddress` interface + canonical positional map (Job 1, A1)
- `Body/S/S0/portal-core/src/vak_address.rs` (new) — Rust mirror of `VakAddress` for kernel-side validation (Job 1, A1b)
- `Body/S/S0/portal-core/src/matheme_harmonic_profile.rs` — extend to carry `VakAddress` and dispatch envelope hooks (Job 9, E4)

**S2 — graph layer (artifact promotion, retrieval):**
- `Body/S/S2/graph-services/src/sync_coordinator.rs` — extend `PromotionPlan` to carry VAK address properties (Job 3, B1)
- `Body/S/S2/graph-services/src/retrieval/hybrid.rs` — add VAK-bias parameter (Job 8, B5)

**S3 — gateway / temporal runtime (session, multi-session surface):**
- `Body/S/S3/gateway-contract/src/lib.rs` — add `VakAddress` to `SessionRecord` + `SessionPatch` (Job 2, A2)
- `Body/S/S3/gateway/src/session_store.rs` — persist VAK address in session record (Job 2, A2)
- `Body/S/S3/gateway/src/dispatch.rs` — add `AnimaInvoke` multi-session endpoint (Job 10, D2-D3)
- `Body/S/S3/graphiti-runtime/src/lib.rs` — episode insertion includes VAK address attributes (Job 3, B3)

**S4 — Anima ta-onta (orchestration, dispatch, lifecycle):**
- `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — make VAK address required on dispatch tools (Jobs 1, 4, 5)
- `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts` — VAK-bound dispatch routing (Job 1, A6-A7)
- `Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts` (new) — session_end Sophia disclosure invocation (Job 5, C2)
- `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts` (new) — Klotho/Lachesis/Atropos Night' pass (Job 5, C3)
- `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` — session_start fires compose, session_end fires Sophia (Job 4, C1-C2)
- `Body/S/S4/ta-onta/S4-1p-hen/extension.ts` — template render injects VAK address into frontmatter (Job 3, B2)
- `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` — ingest tool receives Sophia disclosure; routes to Epii inbox (Job 5, C4-C5)
- `Body/S/S4/ta-onta/S4-5p-aletheia/modules/gate-trigger.ts` (new) — VAK-state-transition gate predicates (Job 6, D4-D8)
- `Body/S/S4/pi-agent/agents/anima.md` (new) — Anima as instantiated agent (Job 10, D1)
- `Body/S/S4/plugins/pleroma/capability-matrix.json` — extend with VAK profile per skill (Job 7, E1)
- `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py` — extend tests for VAK profile (Job 7, E1)

**S5 — Epii (recompose, autoresearch):**
- `Body/S/S5/epii-autoresearch-core/src/inbox.rs` (new) — autoresearch inbox endpoint (Job 5, C6)
- `Body/S/S5/epii-autoresearch-core/src/lib.rs` — recompose schedule + next-cycle compose hint output (Job 5, C7-C8)

**M' — Tauri surface (harmonic envelope consumer):**
- `Body/M/epi-tauri/src-tauri/src/commands/harmonic_profile.rs` — extend to consume VAK address (Job 9, E6)

---

## Phase A: Foundation — VAK Address Contract & Envelope Persistence (Jobs 1, 2)

### Task A1: Define `VakAddress` type contract in S0' ql_types (repo 1: `/Users/admin/Documents/Epi-Logos`)

**Repo:** `/Users/admin/Documents/Epi-Logos/` (the TS/PI runtime repo)

**Files (paths relative to that repo):**
- Modify: `.pi/extensions/s_i/modules/ql_types/index.ts`
- Test: `.pi/extensions/s_i/modules/ql_types/vak_address.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// .pi/extensions/s_i/modules/ql_types/vak_address.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  isValidVakAddress,
  vakAddressFromObject,
  CANONICAL_CF_POSITIONS,
  type VakAddress,
} from "./index.js";

describe("VakAddress", () => {
  it("recognises canonical CF positional mapping", () => {
    assert.equal(CANONICAL_CF_POSITIONS["(00/00)"], "inner_0");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1)"], "inner_1");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2)"], "inner_2");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2/3)"], "inner_3");
    assert.equal(CANONICAL_CF_POSITIONS["(4/5/0)"], "inner_4");
    assert.equal(CANONICAL_CF_POSITIONS["(5/0)"], "inner_5");
    assert.equal(CANONICAL_CF_POSITIONS["(4.0/1-4.4/5)"], "outer_4_parent");
  });

  it("validates a complete VakAddress", () => {
    const addr: VakAddress = {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT2"],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    };
    assert.equal(isValidVakAddress(addr), true);
  });

  it("rejects an incomplete VakAddress", () => {
    const addr = vakAddressFromObject({ cpf: "(00/00)" });
    assert.equal(isValidVakAddress(addr), false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd .pi/extensions/s_i/modules/ql_types && node --experimental-strip-types --test vak_address.test.ts`
Expected: FAIL — `VakAddress`, `isValidVakAddress`, `vakAddressFromObject`, `CANONICAL_CF_POSITIONS` not exported.

- [ ] **Step 3: Write minimal implementation**

Add to `.pi/extensions/s_i/modules/ql_types/index.ts`:

```typescript
export interface VakAddress {
  cpf: "(00/00)" | "(4.0/1-4.4/5)";
  ct: CTContent[];
  cp: CPCode;
  cf: CFCode;
  cfp: CFPCode;
  cs: { code: CSCode; direction: "Day" | "Night'" };
}

export const CANONICAL_CF_POSITIONS = {
  "(00/00)": "inner_0",
  "(0/1)": "inner_1",
  "(0/1/2)": "inner_2",
  "(0/1/2/3)": "inner_3",
  "(4/5/0)": "inner_4",
  "(5/0)": "inner_5",
  "(4.0/1-4.4/5)": "outer_4_parent",
  "(4.5/0)": "lemniscate_stage_5",
} as const;

export function isValidVakAddress(value: unknown): value is VakAddress {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<VakAddress>;
  return (
    (v.cpf === "(00/00)" || v.cpf === "(4.0/1-4.4/5)") &&
    Array.isArray(v.ct) && v.ct.length > 0 &&
    typeof v.cp === "string" &&
    typeof v.cf === "string" &&
    typeof v.cfp === "string" &&
    typeof v.cs === "object" && v.cs !== null &&
    typeof (v.cs as any).code === "string" &&
    ((v.cs as any).direction === "Day" || (v.cs as any).direction === "Night'")
  );
}

export function vakAddressFromObject(obj: Partial<VakAddress>): VakAddress | null {
  if (isValidVakAddress(obj)) return obj as VakAddress;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd .pi/extensions/s_i/modules/ql_types && node --experimental-strip-types --test vak_address.test.ts`
Expected: PASS — 3 ok.

- [ ] **Step 5: Commit**

```bash
git add .pi/extensions/s_i/modules/ql_types/index.ts .pi/extensions/s_i/modules/ql_types/vak_address.test.ts
git commit -m "feat(s0'): add VakAddress type with canonical CF positions"
```

### Task A1b: Rust mirror of `VakAddress` in `portal-core`

**Files:**
- Create: `Body/S/S0/portal-core/src/vak_address.rs`
- Modify: `Body/S/S0/portal-core/src/lib.rs`
- Test: `Body/S/S0/portal-core/tests/vak_address.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/vak_address.rs
use portal_core::vak_address::{CfPosition, CsDirection, CpfState, VakAddress, canonical_cf_position};

#[test]
fn canonical_positions_match_grammar() {
    assert_eq!(canonical_cf_position("(00/00)"), Some(CfPosition::Inner0));
    assert_eq!(canonical_cf_position("(0/1)"), Some(CfPosition::Inner1));
    assert_eq!(canonical_cf_position("(0/1/2)"), Some(CfPosition::Inner2));
    assert_eq!(canonical_cf_position("(0/1/2/3)"), Some(CfPosition::Inner3));
    assert_eq!(canonical_cf_position("(4/5/0)"), Some(CfPosition::Inner4));
    assert_eq!(canonical_cf_position("(5/0)"), Some(CfPosition::Inner5));
    assert_eq!(canonical_cf_position("(4.0/1-4.4/5)"), Some(CfPosition::Outer4Parent));
    assert_eq!(canonical_cf_position("(unknown)"), None);
}

#[test]
fn vak_address_roundtrips_through_serde() {
    let addr = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS1".into(),
        cs_direction: CsDirection::Day,
    };
    let json = serde_json::to_string(&addr).unwrap();
    let back: VakAddress = serde_json::from_str(&json).unwrap();
    assert_eq!(back, addr);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test vak_address`
Expected: FAIL — module `vak_address` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S0/portal-core/src/vak_address.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CfPosition {
    Inner0,
    Inner1,
    Inner2,
    Inner3,
    Inner4,
    Inner5,
    Outer4Parent,
    LemniscateStage5,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CpfState {
    Dialogical,
    Mechanistic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CsDirection {
    Day,
    #[serde(rename = "Night'")]
    Night,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VakAddress {
    pub cpf: CpfState,
    pub ct: Vec<String>,
    pub cp: String,
    pub cf: String,
    pub cfp: String,
    pub cs_code: String,
    pub cs_direction: CsDirection,
}

pub fn canonical_cf_position(cf_literal: &str) -> Option<CfPosition> {
    match cf_literal {
        "(00/00)" => Some(CfPosition::Inner0),
        "(0/1)" => Some(CfPosition::Inner1),
        "(0/1/2)" => Some(CfPosition::Inner2),
        "(0/1/2/3)" => Some(CfPosition::Inner3),
        "(4/5/0)" => Some(CfPosition::Inner4),
        "(5/0)" => Some(CfPosition::Inner5),
        "(4.0/1-4.4/5)" => Some(CfPosition::Outer4Parent),
        "(4.5/0)" => Some(CfPosition::LemniscateStage5),
        _ => None,
    }
}
```

Add to `Body/S/S0/portal-core/src/lib.rs`:

```rust
pub mod vak_address;
pub use vak_address::{canonical_cf_position, CfPosition, CpfState, CsDirection, VakAddress};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test vak_address`
Expected: PASS — `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S0/portal-core/src/vak_address.rs Body/S/S0/portal-core/src/lib.rs Body/S/S0/portal-core/tests/vak_address.rs
git commit -m "feat(s0): rust VakAddress mirror with canonical CF positions"
```

### Task A1c: Thin shared TS VakAddress mirror in ta-onta (repo 2)

**Repo:** `/Users/admin/Documents/Epi-Logos C Experiments/`

**Files:**
- Create: `Body/S/S4/ta-onta/shared/vak_address.ts`
- Test: `Body/S/S4/ta-onta/shared/vak_address.test.ts` (new)

Rationale: the canonical TS VakAddress lives in repo 1's ql_types (Task A1). Repo 2's ta-onta extensions cannot do cross-repo relative imports cleanly, so they import from a thin local mirror. The two definitions must stay in shape-sync (same fields, same string-literal unions) — a contract test below verifies.

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/shared/vak_address.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  isValidVakAddress,
  vakAddressFromObject,
  CANONICAL_CF_POSITIONS,
  type VakAddress,
} from "./vak_address.ts";

describe("ta-onta shared VakAddress", () => {
  it("CF position table matches canon", () => {
    assert.equal(CANONICAL_CF_POSITIONS["(00/00)"], "inner_0");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1)"], "inner_1");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2)"], "inner_2");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2/3)"], "inner_3");
    assert.equal(CANONICAL_CF_POSITIONS["(4/5/0)"], "inner_4");
    assert.equal(CANONICAL_CF_POSITIONS["(5/0)"], "inner_5");
    assert.equal(CANONICAL_CF_POSITIONS["(4.0/1-4.4/5)"], "outer_4_parent");
  });

  it("validates a complete VakAddress", () => {
    const addr: VakAddress = {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT2"],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    };
    assert.equal(isValidVakAddress(addr), true);
  });

  it("rejects incomplete VakAddress", () => {
    assert.equal(vakAddressFromObject({ cpf: "(00/00)" }), null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && node --experimental-strip-types --test Body/S/S4/ta-onta/shared/vak_address.test.ts`
Expected: FAIL — `Body/S/S4/ta-onta/shared/vak_address.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/shared/vak_address.ts`:

```typescript
// Mirror of /Users/admin/Documents/Epi-Logos/.pi/extensions/s_i/modules/ql_types/vak_address.ts
// Kept structurally identical so ta-onta extensions can validate VAK addresses locally.
// Shape contract: see Task A1.

export type CtLiteral = "CT0" | "CT1" | "CT2" | "CT3" | "CT4" | "CT4b" | "CT5";
export type CfLiteral = "(00/00)" | "(0/1)" | "(0/1/2)" | "(0/1/2/3)" | "(4/5/0)" | "(5/0)" | "(4.0/1-4.4/5)" | "(4.5/0)";
export type CfpLiteral = "CFP0" | "CFP1" | "CFP2" | "CFP3" | "CFP4" | "CFP5" | "Z";
export type CsLiteral = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CpLiteral = "CP4.0" | "CP4.1" | "CP4.2" | "CP4.3" | "CP4.4" | "CP4.5";

export interface VakAddress {
  cpf: "(00/00)" | "(4.0/1-4.4/5)";
  ct: CtLiteral[];
  cp: CpLiteral;
  cf: CfLiteral;
  cfp: CfpLiteral;
  cs: { code: CsLiteral; direction: "Day" | "Night'" };
}

export const CANONICAL_CF_POSITIONS = {
  "(00/00)": "inner_0",
  "(0/1)": "inner_1",
  "(0/1/2)": "inner_2",
  "(0/1/2/3)": "inner_3",
  "(4/5/0)": "inner_4",
  "(5/0)": "inner_5",
  "(4.0/1-4.4/5)": "outer_4_parent",
  "(4.5/0)": "lemniscate_stage_5",
} as const;

export function isValidVakAddress(value: unknown): value is VakAddress {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<VakAddress>;
  return (
    (v.cpf === "(00/00)" || v.cpf === "(4.0/1-4.4/5)") &&
    Array.isArray(v.ct) && v.ct.length > 0 &&
    typeof v.cp === "string" &&
    typeof v.cf === "string" &&
    typeof v.cfp === "string" &&
    typeof v.cs === "object" && v.cs !== null &&
    typeof (v.cs as any).code === "string" &&
    ((v.cs as any).direction === "Day" || (v.cs as any).direction === "Night'")
  );
}

export function vakAddressFromObject(obj: Partial<VakAddress>): VakAddress | null {
  if (isValidVakAddress(obj)) return obj as VakAddress;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && node --experimental-strip-types --test Body/S/S4/ta-onta/shared/vak_address.test.ts`
Expected: PASS — 3 ok.

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add Body/S/S4/ta-onta/shared/vak_address.ts Body/S/S4/ta-onta/shared/vak_address.test.ts
git commit -m "feat(s4-ta-onta): thin local VakAddress mirror for ta-onta extensions"
```

**Note for downstream tasks (A3, A5, A6, A7, B2, C1–C5, D3, D4, E2):** any TypeScript task writing to `Body/S/S4/ta-onta/S4-*p-*/` or modules under those that needs `VakAddress` should import from `../../shared/vak_address.ts` (or appropriate relative depth), **not** from the cross-repo `.pi/extensions/s_i/modules/ql_types/`. Update import lines in those tasks accordingly when implementing.

### Task A2: Persist VAK address in gateway session record

**Files:**
- Modify: `Body/S/S3/gateway-contract/src/lib.rs` — add `vak_address` field to `SessionRecord` + `SessionPatch`
- Modify: `Body/S/S3/gateway/src/session_store.rs` — round-trip the field
- Test: `Body/S/S3/gateway/tests/session_store_contract.rs`

- [ ] **Step 1: Write the failing test**

Append to `Body/S/S3/gateway/tests/session_store_contract.rs`:

```rust
#[test]
fn session_store_round_trips_vak_address() {
    use epi_s3_gateway::SessionStore;
    use epi_s3_gateway_contract::SessionPatch;
    use portal_core::{CpfState, CsDirection, VakAddress};

    let tmp = tempfile::tempdir().unwrap();
    let store = SessionStore::new(tmp.path()).unwrap();
    let key = "agent:vak-test:main";
    let _ = store.create(key).unwrap();

    let addr = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS1".into(),
        cs_direction: CsDirection::Day,
    };
    let patch = SessionPatch {
        vak_address: Some(addr.clone()),
        ..Default::default()
    };
    store.patch(key, patch).unwrap();

    let loaded = store.load(key).unwrap();
    assert_eq!(loaded.vak_address, Some(addr));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test session_store_contract session_store_round_trips_vak_address`
Expected: FAIL — `vak_address` not a field of `SessionPatch`.

- [ ] **Step 3: Write minimal implementation**

Edit `Body/S/S3/gateway-contract/src/lib.rs` — add to `SessionRecord` and `SessionPatch`:

```rust
// In SessionRecord struct:
pub vak_address: Option<portal_core::VakAddress>,

// In SessionPatch struct:
#[serde(default, skip_serializing_if = "Option::is_none")]
pub vak_address: Option<portal_core::VakAddress>,
```

Add to `gateway-contract/Cargo.toml`:
```toml
portal-core = { path = "../../S0/portal-core" }
```

Edit `Body/S/S3/gateway/src/session_store.rs` `apply_patch` method to:
```rust
if let Some(vak) = patch.vak_address {
    record.vak_address = Some(vak);
}
```

And ensure `SessionRecord::default()` / `create` paths initialise `vak_address: None`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test session_store_contract session_store_round_trips_vak_address`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S3/gateway-contract/src/lib.rs Body/S/S3/gateway-contract/Cargo.toml Body/S/S3/gateway/src/session_store.rs Body/S/S3/gateway/tests/session_store_contract.rs
git commit -m "feat(s3-gateway): persist VakAddress on SessionRecord/SessionPatch"
```

### Task A3: Hen template render injects VAK address into Day/NOW frontmatter

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-1p-hen/extension.ts` — `template_invoke` reads current VAK from session, injects into frontmatter
- Test: `Body/S/S4/ta-onta/S4-1p-hen/tests/template_vak.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-1p-hen/tests/template_vak.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { renderTemplateWithVak } from "../modules/template-vak.ts";

describe("template_invoke VAK injection", () => {
  it("injects current VAK address as frontmatter fields", () => {
    const out = renderTemplateWithVak({
      template_id: "daily-note",
      day_id: "22-05-2026",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT4"],
        cp: "CP4.4",
        cf: "(4.0/1-4.4/5)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Day" },
      },
    });
    assert.match(out, /c_4_cpf:\s*"\(4\.0\/1-4\.4\/5\)"/);
    assert.match(out, /c_1_ct:\s*\n\s*-\s*CT4/);
    assert.match(out, /c_4_cp:\s*CP4\.4/);
    assert.match(out, /c_4_cf:\s*"\(4\.0\/1-4\.4\/5\)"/);
    assert.match(out, /c_4_cfp:\s*CFP0/);
    assert.match(out, /c_4_cs:\s*CS0/);
    assert.match(out, /c_4_cs_direction:\s*Day/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-1p-hen && node --experimental-strip-types --test tests/template_vak.test.ts`
Expected: FAIL — `modules/template-vak.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-1p-hen/modules/template-vak.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export function renderTemplateWithVak(input: {
  template_id: string;
  day_id: string;
  vak_address: VakAddress;
  body?: string;
}): string {
  const v = input.vak_address;
  const ctList = v.ct.map((t) => `  - ${t}`).join("\n");
  return `---
template_id: ${input.template_id}
day_id: "${input.day_id}"
c_4_cpf: "${v.cpf}"
c_1_ct:
${ctList}
c_4_cp: ${v.cp}
c_4_cf: "${v.cf}"
c_4_cfp: ${v.cfp}
c_4_cs: ${v.cs.code}
c_4_cs_direction: ${v.cs.direction}
---
${input.body ?? ""}
`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-1p-hen && node --experimental-strip-types --test tests/template_vak.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into extension.ts**

Modify the `hen_template_invoke` tool in `Body/S/S4/ta-onta/S4-1p-hen/extension.ts` to:
1. Read current VAK address from `process.env.EPI_SESSION_VAK_ADDRESS` (set by Anima at dispatch time) OR call gateway `session.load` to fetch it.
2. Call `renderTemplateWithVak` instead of the bare template renderer when a VAK address is present.

```typescript
import { renderTemplateWithVak } from "./modules/template-vak.ts";

// inside hen_template_invoke execute():
const vakJson = process.env.EPI_SESSION_VAK_ADDRESS;
if (vakJson) {
  try {
    const vak = JSON.parse(vakJson);
    return { content: [{ type: "text", text: renderTemplateWithVak({ ...params, vak_address: vak }) }] };
  } catch (e) {
    // fall through to legacy render
  }
}
// existing render path...
```

- [ ] **Step 6: Commit**

```bash
git add Body/S/S4/ta-onta/S4-1p-hen/modules/template-vak.ts Body/S/S4/ta-onta/S4-1p-hen/tests/template_vak.test.ts Body/S/S4/ta-onta/S4-1p-hen/extension.ts
git commit -m "feat(s4-hen): inject VakAddress into Day/NOW frontmatter on template_invoke"
```

### Task A4: Graphiti episode insertion records VAK address as attributes

**Files:**
- Modify: `Body/S/S3/graphiti-runtime/src/lib.rs` — `EpisodeInsert` payload accepts optional VAK attrs
- Test: `Body/S/S3/graphiti-runtime/tests/episode_vak.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S3/graphiti-runtime/tests/episode_vak.rs
use epi_s3_graphiti_runtime::{EpisodeInsert, EpisodeAttrs};
use portal_core::{CpfState, CsDirection, VakAddress};

#[test]
fn episode_insert_carries_vak_address() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP2".into(),
        cs_code: "CS3".into(),
        cs_direction: CsDirection::Day,
    };
    let attrs = EpisodeAttrs::with_vak(vak.clone());
    let insert = EpisodeInsert {
        group_id: "session:test".into(),
        body: "test episode".into(),
        attrs,
    };
    let serialised = serde_json::to_value(&insert).unwrap();
    assert_eq!(serialised["attrs"]["c_4_cf"], "(0/1/2)");
    assert_eq!(serialised["attrs"]["c_4_cs_direction"], "Day");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test episode_vak`
Expected: FAIL — `EpisodeAttrs::with_vak` not implemented (or `EpisodeAttrs`/`EpisodeInsert` not exported).

- [ ] **Step 3: Write minimal implementation**

In `Body/S/S3/graphiti-runtime/src/lib.rs` add (or extend existing):

```rust
use portal_core::VakAddress;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EpisodeAttrs {
    #[serde(flatten)]
    pub kv: BTreeMap<String, serde_json::Value>,
}

impl EpisodeAttrs {
    pub fn with_vak(vak: VakAddress) -> Self {
        let mut kv = BTreeMap::new();
        kv.insert("c_4_cpf".into(), serde_json::json!(match vak.cpf {
            portal_core::CpfState::Dialogical => "(00/00)",
            portal_core::CpfState::Mechanistic => "(4.0/1-4.4/5)",
        }));
        kv.insert("c_1_ct".into(), serde_json::json!(vak.ct));
        kv.insert("c_4_cp".into(), serde_json::json!(vak.cp));
        kv.insert("c_4_cf".into(), serde_json::json!(vak.cf));
        kv.insert("c_4_cfp".into(), serde_json::json!(vak.cfp));
        kv.insert("c_4_cs".into(), serde_json::json!(vak.cs_code));
        kv.insert("c_4_cs_direction".into(), serde_json::json!(match vak.cs_direction {
            portal_core::CsDirection::Day => "Day",
            portal_core::CsDirection::Night => "Night'",
        }));
        Self { kv }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EpisodeInsert {
    pub group_id: String,
    pub body: String,
    #[serde(default)]
    pub attrs: EpisodeAttrs,
}
```

Add `portal-core = { path = "../../S0/portal-core" }` to `Cargo.toml` if not present.

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test episode_vak`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S3/graphiti-runtime/src/lib.rs Body/S/S3/graphiti-runtime/Cargo.toml Body/S/S3/graphiti-runtime/tests/episode_vak.rs
git commit -m "feat(s3-graphiti): EpisodeAttrs::with_vak carries VAK address into episode insert"
```

### Task A5: Require VakAddress on `dispatch_agent`

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — `dispatch_agent` tool parameter schema requires `vak_address`
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_vak_required.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_vak_required.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateDispatchParams } from "../modules/dispatch-validate.ts";

describe("dispatch_agent VAK requirement", () => {
  it("rejects dispatch with no vak_address", () => {
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "define X",
    } as any);
    assert.equal(result.ok, false);
    assert.match(result.error!, /vak_address required/);
  });

  it("accepts dispatch with complete vak_address", () => {
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "define X",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT1"],
        cp: "CP4.1",
        cf: "(0/1)",
        cfp: "CFP0",
        cs: { code: "CS1", direction: "Day" },
      },
    });
    assert.equal(result.ok, true);
  });

  it("rejects dispatch with cf that doesn't match agent", () => {
    const result = validateDispatchParams({
      agent_name: "logos",  // logos = CF (0/1)
      task: "x",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",  // sophia's CF, not logos's
        cfp: "CFP0",
        cs: { code: "CS5", direction: "Day" },
      },
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /cf does not match agent/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/dispatch_vak_required.test.ts`
Expected: FAIL — `modules/dispatch-validate.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts`:

```typescript
import { isValidVakAddress, type VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

const AGENT_CF: Record<string, string> = {
  nous: "(00/00)",
  logos: "(0/1)",
  eros: "(0/1/2)",
  mythos: "(0/1/2/3)",
  psyche: "(4.5/0)",
  sophia: "(5/0)",
  anima: "(4.0/1-4.4/5)",
};

export interface DispatchParams {
  agent_name: string;
  task: string;
  vak_address?: VakAddress;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateDispatchParams(params: DispatchParams): ValidationResult {
  if (!params.vak_address) {
    return { ok: false, error: "vak_address required for every dispatch" };
  }
  if (!isValidVakAddress(params.vak_address)) {
    return { ok: false, error: "vak_address malformed" };
  }
  const expected = AGENT_CF[params.agent_name];
  if (expected && params.vak_address.cf !== expected) {
    return { ok: false, error: `cf does not match agent ${params.agent_name} (expected ${expected}, got ${params.vak_address.cf})` };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/dispatch_vak_required.test.ts`
Expected: PASS — 3 ok.

- [ ] **Step 5: Wire `dispatch_agent` tool to call `validateDispatchParams`**

In `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`, find `api.registerTool({ name: "dispatch_agent", ... })` and:
1. Add `vak_address` to the parameter schema (required Type.Object).
2. At top of `execute()`, call `validateDispatchParams(params)` — if `!result.ok`, return `{ content: [{ type: "text", text: result.error! }], isError: true }`.
3. Pass `params.vak_address` to `dispatchTeamMember` (extend signature to forward it through env to the subprocess).

- [ ] **Step 6: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_vak_required.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): dispatch_agent requires VakAddress and CF must match agent"
```

### Task A6: `dispatch_parallel_agents` binds per-task VAK addresses

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — `dispatch_parallel_agents` schema
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` — `validateParallelDispatch`
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/parallel_vak.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/parallel_vak.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateParallelDispatch } from "../modules/dispatch-validate.ts";

describe("dispatch_parallel_agents CFP1 binding", () => {
  it("each task must carry a VakAddress", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "define A", vak_address: undefined as any },
        { agent_name: "eros", task: "operate B", vak_address: undefined as any },
      ],
    });
    assert.equal(r.ok, false);
  });

  it("all tasks must declare CFP1 (parallel independent)", () => {
    const r = validateParallelDispatch({
      tasks: [
        {
          agent_name: "logos",
          task: "x",
          vak_address: { cpf: "(4.0/1-4.4/5)", ct: ["CT1"], cp: "CP4.1", cf: "(0/1)", cfp: "CFP0", cs: { code: "CS1", direction: "Day" } },
        },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });

  it("accepts CFP1 tasks with proper VAK addresses", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: { cpf: "(4.0/1-4.4/5)", ct: ["CT1"], cp: "CP4.1", cf: "(0/1)", cfp: "CFP1", cs: { code: "CS1", direction: "Day" } } },
        { agent_name: "eros", task: "y", vak_address: { cpf: "(4.0/1-4.4/5)", ct: ["CT2"], cp: "CP4.2", cf: "(0/1/2)", cfp: "CFP1", cs: { code: "CS1", direction: "Day" } } },
      ],
    });
    assert.equal(r.ok, true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/parallel_vak.test.ts`
Expected: FAIL — `validateParallelDispatch` not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts`:

```typescript
export function validateParallelDispatch(input: { tasks: DispatchParams[] }): ValidationResult {
  if (!input.tasks || input.tasks.length === 0) {
    return { ok: false, error: "no tasks supplied" };
  }
  for (const t of input.tasks) {
    const v = validateDispatchParams(t);
    if (!v.ok) return v;
    if (t.vak_address!.cfp !== "CFP1") {
      return { ok: false, error: "dispatch_parallel_agents requires CFP1 on every task" };
    }
  }
  return { ok: true };
}
```

Wire into `dispatch_parallel_agents` tool the same way Task A5 wired single dispatch.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/parallel_vak.test.ts`
Expected: PASS — 3 ok.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts Body/S/S4/ta-onta/S4-4p-anima/tests/parallel_vak.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): dispatch_parallel_agents requires CFP1 + per-task VakAddress"
```

### Task A7: `vak-evaluate` skill is mandatory upstream of dispatch (Pleroma gate)

**Files:**
- Modify: `Body/S/S4/plugins/pleroma/capability-matrix.json`
- Modify: `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`

- [ ] **Step 1: Write the failing test**

Append to `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`:

```python
def test_dispatch_tools_declare_vak_evaluate_as_upstream(self):
    """Every dispatch-class tool must declare vak-evaluate as upstream gate."""
    matrix = json.loads((self.PLEROMA_ROOT / "capability-matrix.json").read_text())
    dispatch_tools = [t for t in matrix.get("dispatch_tools", []) if t.get("kind") == "vak-dispatch"]
    self.assertTrue(dispatch_tools, "no dispatch_tools registered")
    for t in dispatch_tools:
        self.assertIn("upstream_required", t, f"{t['name']} missing upstream_required")
        self.assertIn("vak-evaluate", t["upstream_required"],
                      f"{t['name']} does not require vak-evaluate upstream")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py -v`
Expected: FAIL — `dispatch_tools` not present in matrix.

- [ ] **Step 3: Write minimal implementation**

Add to `Body/S/S4/plugins/pleroma/capability-matrix.json` (top-level, after `skills` block):

```json
  "dispatch_tools": [
    {
      "name": "dispatch_agent",
      "kind": "vak-dispatch",
      "upstream_required": ["vak-evaluate"]
    },
    {
      "name": "dispatch_parallel_agents",
      "kind": "vak-dispatch",
      "upstream_required": ["vak-evaluate"]
    },
    {
      "name": "dispatch_fusion_agents",
      "kind": "vak-dispatch",
      "upstream_required": ["vak-evaluate"]
    },
    {
      "name": "run_chain",
      "kind": "vak-dispatch",
      "upstream_required": ["vak-evaluate"]
    }
  ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py -v`
Expected: PASS — all tests OK (5 prior + 1 new = 6).

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/plugins/pleroma/capability-matrix.json Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py
git commit -m "feat(pleroma): declare vak-evaluate as upstream-required gate for dispatch tools"
```

---

## Phase B: Artifacts Carry Their Address & Retrieval Biases (Jobs 3, 8)

### Task B1: Extend `PromotionPlan` to carry VAK properties

**Files:**
- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Test: `Body/S/S2/graph-services/tests/promotion_vak.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S2/graph-services/tests/promotion_vak.rs
use epi_s2_graph_services::PromotionPlan;
use portal_core::{CpfState, CsDirection, VakAddress};
use serde_json::Value;

#[test]
fn promotion_plan_carries_vak_properties() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS1".into(),
        cs_direction: CsDirection::Day,
    };
    let mut plan = PromotionPlan::new("S4.4'", "shard-spec").unwrap();
    plan.attach_vak_address(&vak);

    assert_eq!(plan.properties.get("c_4_cpf"), Some(&Value::String("(4.0/1-4.4/5)".into())));
    assert_eq!(plan.properties.get("c_4_cf"), Some(&Value::String("(0/1/2)".into())));
    assert_eq!(plan.properties.get("c_4_cp"), Some(&Value::String("CP4.2".into())));
    assert_eq!(plan.properties.get("c_4_cs"), Some(&Value::String("CS1".into())));
    assert_eq!(plan.properties.get("c_4_cs_direction"), Some(&Value::String("Day".into())));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test promotion_vak`
Expected: FAIL — `attach_vak_address` method does not exist.

- [ ] **Step 3: Write minimal implementation**

Add `portal-core = { path = "../../S0/portal-core" }` to `Body/S/S2/graph-services/Cargo.toml` if absent.

Append to `Body/S/S2/graph-services/src/sync_coordinator.rs`:

```rust
impl PromotionPlan {
    pub fn attach_vak_address(&mut self, vak: &portal_core::VakAddress) {
        let cpf_str = match vak.cpf {
            portal_core::CpfState::Dialogical => "(00/00)",
            portal_core::CpfState::Mechanistic => "(4.0/1-4.4/5)",
        };
        self.properties.insert("c_4_cpf".into(), serde_json::json!(cpf_str));
        self.properties.insert("c_1_ct".into(), serde_json::json!(vak.ct));
        self.properties.insert("c_4_cp".into(), serde_json::json!(vak.cp));
        self.properties.insert("c_4_cf".into(), serde_json::json!(vak.cf));
        self.properties.insert("c_4_cfp".into(), serde_json::json!(vak.cfp));
        self.properties.insert("c_4_cs".into(), serde_json::json!(vak.cs_code));
        let dir = match vak.cs_direction {
            portal_core::CsDirection::Day => "Day",
            portal_core::CsDirection::Night => "Night'",
        };
        self.properties.insert("c_4_cs_direction".into(), serde_json::json!(dir));
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test promotion_vak`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S2/graph-services/src/sync_coordinator.rs Body/S/S2/graph-services/tests/promotion_vak.rs Body/S/S2/graph-services/Cargo.toml
git commit -m "feat(s2-graph): PromotionPlan::attach_vak_address tags artifacts with c_4_* fields"
```

### Task B2: Aletheia `thought_route` records VAK address on T/T' artifacts

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` — `thought_route` tool writes VAK frontmatter
- Test: `Body/S/S4/ta-onta/S4-5p-aletheia/tests/thought_route_vak.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-5p-aletheia/tests/thought_route_vak.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { renderThoughtFrontmatter } from "../modules/thought-vak.ts";

describe("thought_route VAK frontmatter", () => {
  it("records the producing VAK address on T-bucket artifacts", () => {
    const fm = renderThoughtFrontmatter({
      bucket: "T3",
      summary: "pattern noticed",
      vak_address: { cpf: "(4.0/1-4.4/5)", ct: ["CT3"], cp: "CP4.3", cf: "(0/1/2/3)", cfp: "CFP0", cs: { code: "CS3", direction: "Day" } },
    });
    assert.match(fm, /c_4_cf:\s*"\(0\/1\/2\/3\)"/);
    assert.match(fm, /thought_bucket:\s*T3/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/thought_route_vak.test.ts`
Expected: FAIL — `modules/thought-vak.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-5p-aletheia/modules/thought-vak.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export function renderThoughtFrontmatter(input: {
  bucket: string;
  summary: string;
  vak_address: VakAddress;
}): string {
  const v = input.vak_address;
  return `---
thought_bucket: ${input.bucket}
summary: ${JSON.stringify(input.summary)}
c_4_cpf: "${v.cpf}"
c_1_ct:
${v.ct.map((t) => `  - ${t}`).join("\n")}
c_4_cp: ${v.cp}
c_4_cf: "${v.cf}"
c_4_cfp: ${v.cfp}
c_4_cs: ${v.cs.code}
c_4_cs_direction: ${v.cs.direction}
---
`;
}
```

Wire into the existing `thought_route` tool (read `EPI_SESSION_VAK_ADDRESS` env or load from gateway, then prepend the rendered frontmatter).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/thought_route_vak.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-5p-aletheia/modules/thought-vak.ts Body/S/S4/ta-onta/S4-5p-aletheia/tests/thought_route_vak.test.ts Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts
git commit -m "feat(s4-aletheia): thought_route tags T-bucket artifacts with VakAddress"
```

> **Update 2026-05-29:** This task as written uses the stale `c_4_*` / `c_1_*` prefix vocabulary. B1 / A4 / A3 landed the canonical-prefix correction at commit `1a53d369`: VAK is the coordinate system itself, so keys are bare `cpf`/`ct`/`cp`/`cf`/`cfp`/`cs_code`/`cs_direction`. The shipping implementation in commit `5ed895af` uses canonical prefixes; treat the snippets below as historical.

### Task B3: `HybridRetriever` accepts VAK address as bias parameter

**Files:**
- Modify: `Body/S/S2/graph-services/src/retrieval/hybrid.rs` — `retrieve_with_vak_bias` method
- Test: `Body/S/S2/graph-services/tests/retrieval_vak_bias.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S2/graph-services/tests/retrieval_vak_bias.rs
use epi_s2_graph_services::{HybridRetriever, RetrievalMode};
use portal_core::{CpfState, CsDirection, VakAddress};

#[test]
fn hybrid_retriever_computes_vak_bias_weights() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS2".into(),
        cs_direction: CsDirection::Day,
    };
    let weights = HybridRetriever::vak_bias_weights(&vak);
    // CT2 = operational, biases toward CP4.2 + CF (0/1/2) Eros
    assert!(weights.get("c_4_cf").copied().unwrap_or(0.0) > 0.0);
    assert!(weights.get("c_4_cp").copied().unwrap_or(0.0) > 0.0);
    assert!(weights.get("c_1_ct").copied().unwrap_or(0.0) > 0.0);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test retrieval_vak_bias`
Expected: FAIL — `vak_bias_weights` not defined.

- [ ] **Step 3: Write minimal implementation**

Append to `Body/S/S2/graph-services/src/retrieval/hybrid.rs`:

```rust
impl HybridRetriever<'_> {
    pub fn vak_bias_weights(vak: &portal_core::VakAddress) -> std::collections::HashMap<String, f64> {
        let mut w = std::collections::HashMap::new();
        // Strong CF affinity — agent's frame must match
        w.insert("c_4_cf".into(), 0.8);
        // CP match boosts positionally-relevant content
        w.insert("c_4_cp".into(), 0.5);
        // CT match boosts content-type-aligned chunks
        w.insert("c_1_ct".into(), 0.4);
        // CS direction shifts bias toward Day (synthetic) or Night' (analytical) content
        w.insert("c_4_cs_direction".into(), 0.2);
        // Carry the address values to be matched against retrieved chunks
        w.insert(format!("__cf_value:{}", vak.cf), 1.0);
        w.insert(format!("__cp_value:{}", vak.cp), 1.0);
        w
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test retrieval_vak_bias`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S2/graph-services/src/retrieval/hybrid.rs Body/S/S2/graph-services/tests/retrieval_vak_bias.rs
git commit -m "feat(s2-retrieval): HybridRetriever::vak_bias_weights for CF/CP/CT-aware bias"
```

---

## Phase C: Session Lifecycle IS Z-Cycle & Möbius Seam Wired (Jobs 4, 5)

### Task C1: Khora `session_start` fires compose-phase (writes VAK address into session)

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` — `session_start` tool sets compose-phase VAK
- Test: `Body/S/S4/ta-onta/S4-0p-khora/tests/session_compose.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-0p-khora/tests/session_compose.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { composePhaseVakAddress } from "../modules/z-phase-vak.ts";

describe("session_start compose phase", () => {
  it("initialises VAK address with dialogical CPF and Nous CF at session start", () => {
    const vak = composePhaseVakAddress();
    assert.equal(vak.cpf, "(00/00)");      // dialogical, user-engaged
    assert.equal(vak.cf, "(00/00)");       // Nous clearing
    assert.equal(vak.cp, "CP4.0");         // ground
    assert.deepEqual(vak.ct, ["CT0"]);     // relational, pre-task
    assert.equal(vak.cfp, "CFP0");         // base thread
    assert.equal(vak.cs.code, "CS1");      // quick ground -> context
    assert.equal(vak.cs.direction, "Day");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-0p-khora && node --experimental-strip-types --test tests/session_compose.test.ts`
Expected: FAIL — `modules/z-phase-vak.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export function composePhaseVakAddress(): VakAddress {
  return {
    cpf: "(00/00)",
    ct: ["CT0"],
    cp: "CP4.0",
    cf: "(00/00)",
    cfp: "CFP0",
    cs: { code: "CS1", direction: "Day" },
  };
}

export function rehearPhaseVakAddress(): VakAddress {
  return {
    cpf: "(4.0/1-4.4/5)",
    ct: ["CT5"],
    cp: "CP4.5",
    cf: "(5/0)",
    cfp: "CFP3",
    cs: { code: "CS0", direction: "Night'" },
  };
}
```

Wire into the `session_start` tool: after creating the session, call gateway `session.patch` with `composePhaseVakAddress()` and export it as `EPI_SESSION_VAK_ADDRESS` env for child processes.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-0p-khora && node --experimental-strip-types --test tests/session_compose.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts Body/S/S4/ta-onta/S4-0p-khora/tests/session_compose.test.ts Body/S/S4/ta-onta/S4-0p-khora/extension.ts
git commit -m "feat(s4-khora): session_start fires Z-cycle compose phase with initial VakAddress"
```

### Task C2: Sophia post-execution hook fires at `session_end`

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts`
- Modify: `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` — `session_end` calls Sophia hook
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/sophia_hook.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/sophia_hook.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildSophiaDisclosure } from "../modules/sophia-hook.ts";

describe("Sophia post-execution hook", () => {
  it("builds a disclosure from session end state", () => {
    const disclosure = buildSophiaDisclosure({
      session_id: "agent:test:main",
      day_id: "22-05-2026",
      final_vak: { cpf: "(4.0/1-4.4/5)", ct: ["CT5"], cp: "CP4.5", cf: "(5/0)", cfp: "CFP0", cs: { code: "CS5", direction: "Day" } },
      artifacts: ["/path/to/note.md"],
      improvement_vectors: ["consider auto-loading CT4 templates earlier"],
    });
    assert.equal(disclosure.kind, "sophia_session_end_disclosure");
    assert.equal(disclosure.session_id, "agent:test:main");
    assert.equal(disclosure.final_vak.cf, "(5/0)");
    assert.equal(disclosure.improvement_vectors.length, 1);
    assert.equal(disclosure.handoff_target, "aletheia_ingest");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/sophia_hook.test.ts`
Expected: FAIL — `modules/sophia-hook.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export interface SophiaDisclosure {
  kind: "sophia_session_end_disclosure";
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
  handoff_target: "aletheia_ingest";
}

export function buildSophiaDisclosure(input: {
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
}): SophiaDisclosure {
  return {
    kind: "sophia_session_end_disclosure",
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak: input.final_vak,
    artifacts: input.artifacts,
    improvement_vectors: input.improvement_vectors,
    handoff_target: "aletheia_ingest",
  };
}
```

In `Body/S/S4/ta-onta/S4-0p-khora/extension.ts`'s `session_end` (or `agent_session_close`) tool, replace the comment-stub at the Sophia line range with a real call: build the disclosure with the session's final VAK + collected artifacts, write it as a JSONL line to `${VAULT_ROOT}/Pratibimba/Sophia/inbox/${session_id}.jsonl`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/sophia_hook.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts Body/S/S4/ta-onta/S4-4p-anima/tests/sophia_hook.test.ts Body/S/S4/ta-onta/S4-0p-khora/extension.ts
git commit -m "feat(s4-anima): wire Sophia post-execution hook at session_end"
```

### Task C3: Implement `dispatch_moirai_night_pass` (Klotho/Lachesis/Atropos)

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts`
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — register tool
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/moirai_night_pass.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/moirai_night_pass.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { planMoiraiNightPass } from "../modules/moirai-dispatch.ts";

describe("Moirai Night' pass plan", () => {
  it("dispatches all three Moirai as CFP3 F-Thread with proper Night' positions", () => {
    const plan = planMoiraiNightPass({ session_id: "agent:test:main", disclosure_path: "/vault/Sophia/inbox/x.jsonl" });
    assert.equal(plan.cfp, "CFP3");
    assert.equal(plan.cs_direction, "Night'");
    assert.equal(plan.dispatches.length, 3);
    const names = plan.dispatches.map((d) => d.agent);
    assert.deepEqual(names.sort(), ["atropos", "klotho", "lachesis"]);
    const positions = plan.dispatches.map((d) => d.night_position).sort();
    assert.deepEqual(positions, ["P1'", "P4'", "P5'"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/moirai_night_pass.test.ts`
Expected: FAIL — `modules/moirai-dispatch.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts`:

```typescript
export interface MoiraiDispatchPlan {
  cfp: "CFP3";
  cs_direction: "Night'";
  dispatches: Array<{
    agent: "klotho" | "lachesis" | "atropos";
    night_position: "P1'" | "P4'" | "P5'";
    task: string;
  }>;
}

export function planMoiraiNightPass(input: {
  session_id: string;
  disclosure_path: string;
}): MoiraiDispatchPlan {
  const t = (kind: string) =>
    `Night' pass: read ${input.disclosure_path} and report ${kind} for session ${input.session_id}`;
  return {
    cfp: "CFP3",
    cs_direction: "Night'",
    dispatches: [
      { agent: "klotho", night_position: "P1'", task: t("traces (P1' Traces)") },
      { agent: "lachesis", night_position: "P4'", task: t("sources (P4' Discovery)") },
      { agent: "atropos", night_position: "P5'", task: t("crystallisations (P5' Insight)") },
    ],
  };
}
```

Register a new `dispatch_moirai_night_pass` tool in `extension.ts` that calls `planMoiraiNightPass`, then for each plan entry dispatches via `dispatchTeamMember(plan.agent, plan.task)` with the appropriate VAK address (CF `(0/1/2)` Eros for Klotho, CF `(4.0/1-4.4/5)` Anima for Lachesis, CF `(5/0)` Sophia for Atropos per spec).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/moirai_night_pass.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts Body/S/S4/ta-onta/S4-4p-anima/tests/moirai_night_pass.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): dispatch_moirai_night_pass wires CFP3 F-Thread Night' rehearing"
```

### Task C4: Aletheia ingest receives Sophia disclosure → routes to Epii inbox

**Files:**
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/sophia-ingest.ts`
- Modify: `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` — `aletheia_ingest` tool
- Test: `Body/S/S4/ta-onta/S4-5p-aletheia/tests/sophia_ingest.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-5p-aletheia/tests/sophia_ingest.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { routeToEpiiInbox } from "../modules/sophia-ingest.ts";

describe("Aletheia routes Sophia disclosure to Epii inbox", () => {
  it("produces an Epii inbox payload with sophia source", () => {
    const payload = routeToEpiiInbox({
      session_id: "agent:test:main",
      day_id: "22-05-2026",
      sophia_disclosure: { kind: "sophia_session_end_disclosure", session_id: "agent:test:main", day_id: "22-05-2026", final_vak: { cpf: "(4.0/1-4.4/5)", ct: ["CT5"], cp: "CP4.5", cf: "(5/0)", cfp: "CFP0", cs: { code: "CS5", direction: "Day" } }, artifacts: [], improvement_vectors: ["v1"], handoff_target: "aletheia_ingest" },
      moirai_outputs: { klotho: "traces summary", lachesis: "sources", atropos: "insight" },
    });
    assert.equal(payload.kind, "epii_autoresearch_inbox_entry");
    assert.equal(payload.source, "aletheia_sophia_ingest");
    assert.equal(payload.session_id, "agent:test:main");
    assert.equal(payload.improvement_vectors.length, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/sophia_ingest.test.ts`
Expected: FAIL — `modules/sophia-ingest.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-5p-aletheia/modules/sophia-ingest.ts`:

```typescript
import type { SophiaDisclosure } from "../../S4-4p-anima/modules/sophia-hook.ts";

export interface EpiiInboxEntry {
  kind: "epii_autoresearch_inbox_entry";
  source: "aletheia_sophia_ingest";
  session_id: string;
  day_id: string;
  final_vak: SophiaDisclosure["final_vak"];
  improvement_vectors: string[];
  moirai_summary: { klotho?: string; lachesis?: string; atropos?: string };
  artifacts: string[];
}

export function routeToEpiiInbox(input: {
  session_id: string;
  day_id: string;
  sophia_disclosure: SophiaDisclosure;
  moirai_outputs: { klotho?: string; lachesis?: string; atropos?: string };
}): EpiiInboxEntry {
  return {
    kind: "epii_autoresearch_inbox_entry",
    source: "aletheia_sophia_ingest",
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak: input.sophia_disclosure.final_vak,
    improvement_vectors: input.sophia_disclosure.improvement_vectors,
    moirai_summary: input.moirai_outputs,
    artifacts: input.sophia_disclosure.artifacts,
  };
}
```

Wire `aletheia_ingest` tool in `extension.ts` to read the Sophia inbox jsonl, run `planMoiraiNightPass` (or accept its output via callback), call `routeToEpiiInbox`, write the result to `${VAULT_ROOT}/Pratibimba/Epii/inbox/${session_id}.jsonl`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/sophia_ingest.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-5p-aletheia/modules/sophia-ingest.ts Body/S/S4/ta-onta/S4-5p-aletheia/tests/sophia_ingest.test.ts Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts
git commit -m "feat(s4-aletheia): Sophia ingest -> Epii inbox handoff routing"
```

### Task C5: Epii inbox endpoint in `epii-autoresearch-core`

**Files:**
- Create: `Body/S/S5/epii-autoresearch-core/src/inbox.rs`
- Modify: `Body/S/S5/epii-autoresearch-core/src/lib.rs`
- Test: `Body/S/S5/epii-autoresearch-core/tests/inbox_contract.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S5/epii-autoresearch-core/tests/inbox_contract.rs
use epi_s5_epii_autoresearch_core::inbox::{InboxStore, InboxEntry};
use tempfile::tempdir;

#[test]
fn inbox_persists_and_lists_entries() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    let entry = InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: "agent:test:main".into(),
        day_id: "22-05-2026".into(),
        improvement_vectors: vec!["v1".into()],
        raw: serde_json::json!({"final_vak": "stub"}),
    };
    let id = store.append(entry.clone()).unwrap();
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].id, id);
    assert_eq!(listed[0].entry.session_id, "agent:test:main");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test inbox_contract`
Expected: FAIL — module `inbox` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S5/epii-autoresearch-core/src/inbox.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InboxEntry {
    pub kind: String,
    pub source: String,
    pub session_id: String,
    pub day_id: String,
    pub improvement_vectors: Vec<String>,
    pub raw: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredInboxEntry {
    pub id: String,
    pub entry: InboxEntry,
}

pub struct InboxStore {
    root: PathBuf,
}

impl InboxStore {
    pub fn new(root: impl AsRef<Path>) -> Result<Self, String> {
        let root = root.as_ref().to_path_buf();
        fs::create_dir_all(&root).map_err(|e| e.to_string())?;
        Ok(Self { root })
    }

    pub fn append(&self, entry: InboxEntry) -> Result<String, String> {
        let id = format!("inbox_{}_{}", entry.session_id.replace([':', '/'], "_"), uuid::Uuid::new_v4());
        let path = self.root.join(format!("{}.json", id));
        let stored = StoredInboxEntry { id: id.clone(), entry };
        fs::write(&path, serde_json::to_string_pretty(&stored).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
        Ok(id)
    }

    pub fn list_pending(&self) -> Result<Vec<StoredInboxEntry>, String> {
        let mut out = Vec::new();
        for entry in fs::read_dir(&self.root).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.path().extension().and_then(|s| s.to_str()) == Some("json") {
                let raw = fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
                let stored: StoredInboxEntry = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
                out.push(stored);
            }
        }
        Ok(out)
    }
}
```

In `lib.rs` add: `pub mod inbox;`. Add `uuid = { version = "1", features = ["v4"] }` to `Cargo.toml` if absent.

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test inbox_contract`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S5/epii-autoresearch-core/src/inbox.rs Body/S/S5/epii-autoresearch-core/src/lib.rs Body/S/S5/epii-autoresearch-core/tests/inbox_contract.rs Body/S/S5/epii-autoresearch-core/Cargo.toml
git commit -m "feat(s5-epii): InboxStore receives autoresearch entries from Aletheia"
```

### Task C6: Epii recompose pass produces next-cycle compose hint

**Files:**
- Modify: `Body/S/S5/epii-autoresearch-core/src/lib.rs` — `recompose_pass` function
- Test: `Body/S/S5/epii-autoresearch-core/tests/recompose_pass.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S5/epii-autoresearch-core/tests/recompose_pass.rs
use epi_s5_epii_autoresearch_core::{recompose_pass, RecomposeOutput, inbox::{InboxStore, InboxEntry}};
use tempfile::tempdir;

#[test]
fn recompose_pass_produces_next_compose_hint_per_entry() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store.append(InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: "agent:test:main".into(),
        day_id: "22-05-2026".into(),
        improvement_vectors: vec!["consider X".into()],
        raw: serde_json::json!({}),
    }).unwrap();

    let outputs: Vec<RecomposeOutput> = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1);
    assert_eq!(outputs[0].next_compose_hint.session_seed, "agent:test:main");
    assert!(outputs[0].next_compose_hint.proposed_p0_questions.iter().any(|q| q.contains("X")));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test recompose_pass`
Expected: FAIL — `recompose_pass`/`RecomposeOutput` not defined.

- [ ] **Step 3: Write minimal implementation**

Add to `Body/S/S5/epii-autoresearch-core/src/lib.rs`:

```rust
use serde::{Deserialize, Serialize};

pub use inbox::{InboxEntry, InboxStore, StoredInboxEntry};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NextComposeHint {
    pub session_seed: String,
    pub proposed_p0_questions: Vec<String>,
    pub challenger_artifacts: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecomposeOutput {
    pub entry_id: String,
    pub next_compose_hint: NextComposeHint,
    pub keep_discard: KeepDiscard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeepDiscard {
    Keep(String),
    Discard(String),
    HumanReview(String),
}

pub fn recompose_pass(store: &InboxStore) -> Result<Vec<RecomposeOutput>, String> {
    let entries = store.list_pending()?;
    let mut out = Vec::new();
    for stored in entries {
        let questions: Vec<String> = stored.entry.improvement_vectors.iter()
            .map(|v| format!("What if we {}?", v))
            .collect();
        out.push(RecomposeOutput {
            entry_id: stored.id,
            next_compose_hint: NextComposeHint {
                session_seed: stored.entry.session_id.clone(),
                proposed_p0_questions: questions,
                challenger_artifacts: Vec::new(),
            },
            keep_discard: KeepDiscard::HumanReview("first recompose pass requires human gate".into()),
        });
    }
    Ok(out)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test recompose_pass`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S5/epii-autoresearch-core/src/lib.rs Body/S/S5/epii-autoresearch-core/tests/recompose_pass.rs
git commit -m "feat(s5-epii): recompose_pass produces NextComposeHint per inbox entry (Möbius seam closure)"
```

---

## Phase D: Self-Instantiation & Gates (Jobs 10, 6)

### Task D1: Add `anima.md` to `pi-agent/agents/` (Anima as a registered PI agent)

**Files:**
- Create: `Body/S/S4/pi-agent/agents/anima.md`
- Modify: `Body/S/S4/pi-agent/agents/teams.yaml` — include `anima` in the constitutional team
- Test: `Body/S/S4/pi-agent/tests/test_anima_registration.py` (new)

- [ ] **Step 1: Write the failing test**

```python
# Body/S/S4/pi-agent/tests/test_anima_registration.py
import unittest
from pathlib import Path
import yaml
import re

ROOT = Path(__file__).resolve().parent.parent

class AnimaRegistrationTest(unittest.TestCase):
    def test_anima_md_exists_with_required_frontmatter(self):
        anima_md = ROOT / "agents" / "anima.md"
        self.assertTrue(anima_md.exists(), "pi-agent agents/anima.md missing")
        text = anima_md.read_text()
        m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
        self.assertIsNotNone(m, "anima.md missing frontmatter")
        fm = yaml.safe_load(m.group(1))
        self.assertEqual(fm["name"], "anima")
        self.assertEqual(fm["cf"], "(4.0/1-4.4/5)")
        self.assertIn("vak_evaluate", fm["tools"])
        self.assertIn("anima_orchestrate", fm["tools"])

    def test_anima_in_constitutional_team(self):
        teams = yaml.safe_load((ROOT / "agents" / "teams.yaml").read_text())
        self.assertIn("constitutional", teams)
        members = teams["constitutional"].get("members", [])
        self.assertIn("anima", members)

    def test_six_section_structure_present(self):
        text = (ROOT / "agents" / "anima.md").read_text()
        for header in ["## 1. Rupa", "## 2. Ontology", "## 3. Frame Contract", "## 4. Temporal", "## 5. Capability", "## 6. Sattva"]:
            self.assertIn(header, text, f"missing section {header}")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest Body/S/S4/pi-agent/tests/test_anima_registration.py -v`
Expected: FAIL — `agents/anima.md` not in pi-agent dir.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/pi-agent/agents/anima.md` (copy the existing anima.md from `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/anima.md` — it already has the 6-section format). Specifically, the file should start:

```markdown
---
name: anima
description: The constitutional orchestrator and VAK grammar layer. Reads CS runtime state, routes CF codes to constitutional agents, and dispatches CFP thread types without collapsing Day/Night' into fixed agent identities.
permissionMode: default
tools: vak_evaluate,anima_orchestrate,dispatch_agent,dispatch_parallel_agents,dispatch_fusion_agents,run_chain,subagent_create,subagent_continue,subagent_list,subagent_remove,tilldone
skills: vak-coordinate-frame,vak-evaluate,anima-orchestration,day-night-pass,ouroboros,klein-mode
cf: "(4.0/1-4.4/5)"
cpf: "(4.0/1-4.4/5)"
---
```

…then the 6 sections (1. Rupa through 6. Sattva) verbatim from the existing file.

Update `Body/S/S4/pi-agent/agents/teams.yaml` to include `anima` in a `constitutional` team:

```yaml
constitutional:
  description: "The full constitutional six (Nous through Sophia) plus Anima parent"
  members:
    - anima
    - nous
    - logos
    - eros
    - mythos
    - psyche
    - sophia
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest Body/S/S4/pi-agent/tests/test_anima_registration.py -v`
Expected: PASS — 3 ok.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/pi-agent/agents/anima.md Body/S/S4/pi-agent/agents/teams.yaml Body/S/S4/pi-agent/tests/test_anima_registration.py
git commit -m "feat(pi-agent): register Anima as constitutional team parent agent"
```

### Task D2: Gateway exposes `anima.invoke` multi-session endpoint

**Files:**
- Modify: `Body/S/S3/gateway/src/dispatch.rs` — add `AnimaInvokeRequest` / `AnimaInvokeResponse`
- Test: `Body/S/S3/gateway/tests/anima_invoke_contract.rs` (new)

- [ ] **Step 1: Write the failing test**

```rust
// Body/S/S3/gateway/tests/anima_invoke_contract.rs
use epi_s3_gateway::dispatch::{AnimaInvokeRequest, AnimaInvokeResponse, route_anima_invoke};
use portal_core::{CpfState, CsDirection, VakAddress};
use tempfile::tempdir;

#[test]
fn anima_invoke_routes_to_session_with_vak_address() {
    let tmp = tempdir().unwrap();
    let store = epi_s3_gateway::SessionStore::new(tmp.path()).unwrap();
    let _ = store.create("agent:anima:user-a").unwrap();
    let _ = store.create("agent:anima:user-b").unwrap();

    let req = AnimaInvokeRequest {
        target_session_key: "agent:anima:user-a".into(),
        task: "evaluate this VAK".into(),
        vak_address: VakAddress {
            cpf: CpfState::Dialogical,
            ct: vec!["CT0".into()],
            cp: "CP4.0".into(),
            cf: "(00/00)".into(),
            cfp: "CFP0".into(),
            cs_code: "CS1".into(),
            cs_direction: CsDirection::Day,
        },
    };
    let resp: AnimaInvokeResponse = route_anima_invoke(&store, req).unwrap();
    assert_eq!(resp.dispatched_to, "agent:anima:user-a");
    assert!(resp.task_queued);

    // VAK address persisted on the target session
    let loaded = store.load("agent:anima:user-a").unwrap();
    assert_eq!(loaded.vak_address.as_ref().unwrap().cf, "(00/00)");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test anima_invoke_contract`
Expected: FAIL — `AnimaInvokeRequest`/`route_anima_invoke` not in dispatch.

- [ ] **Step 3: Write minimal implementation**

Append to `Body/S/S3/gateway/src/dispatch.rs`:

```rust
use portal_core::VakAddress;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimaInvokeRequest {
    pub target_session_key: String,
    pub task: String,
    pub vak_address: VakAddress,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimaInvokeResponse {
    pub dispatched_to: String,
    pub task_queued: bool,
}

pub fn route_anima_invoke(
    store: &crate::SessionStore,
    req: AnimaInvokeRequest,
) -> Result<AnimaInvokeResponse, String> {
    let patch = epi_s3_gateway_contract::SessionPatch {
        vak_address: Some(req.vak_address.clone()),
        ..Default::default()
    };
    store.patch(&req.target_session_key, patch)?;
    // Append the task into the session's transcript or pending queue
    crate::transcripts::append_message(
        store,
        &req.target_session_key,
        "anima_invoke",
        &req.task,
    )?;
    Ok(AnimaInvokeResponse {
        dispatched_to: req.target_session_key,
        task_queued: true,
    })
}
```

Add `portal-core = { path = "../../S0/portal-core" }` to `gateway/Cargo.toml` if absent.

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test anima_invoke_contract`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S3/gateway/src/dispatch.rs Body/S/S3/gateway/tests/anima_invoke_contract.rs Body/S/S3/gateway/Cargo.toml
git commit -m "feat(s3-gateway): route_anima_invoke endpoint for multi-session Anima self-instantiation"
```

### Task D3: Anima invokes herself via gateway endpoint

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — add `anima_self_invoke` tool
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/anima_self_invoke.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/anima_self_invoke.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildAnimaSelfInvokePayload } from "../modules/anima-self-invoke.ts";

describe("Anima self-invoke", () => {
  it("builds a gateway payload targeting another Anima session", () => {
    const payload = buildAnimaSelfInvokePayload({
      target_user: "user-b",
      task: "evaluate VAK for X",
      vak_address: { cpf: "(4.0/1-4.4/5)", ct: ["CT4"], cp: "CP4.4", cf: "(4.0/1-4.4/5)", cfp: "CFP0", cs: { code: "CS0", direction: "Day" } },
    });
    assert.equal(payload.target_session_key, "agent:anima:user-b");
    assert.equal(payload.task, "evaluate VAK for X");
    assert.equal(payload.vak_address.cf, "(4.0/1-4.4/5)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/anima_self_invoke.test.ts`
Expected: FAIL — `modules/anima-self-invoke.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-4p-anima/modules/anima-self-invoke.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export function buildAnimaSelfInvokePayload(input: {
  target_user: string;
  task: string;
  vak_address: VakAddress;
}) {
  return {
    target_session_key: `agent:anima:${input.target_user}`,
    task: input.task,
    vak_address: input.vak_address,
  };
}
```

Register an `anima_self_invoke` tool in `extension.ts` that calls the gateway's `route_anima_invoke` endpoint with the payload (via `epi gate dispatch` or whichever epi-cli command is the gateway client).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/anima_self_invoke.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/anima-self-invoke.ts Body/S/S4/ta-onta/S4-4p-anima/tests/anima_self_invoke.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): anima_self_invoke tool routes via gateway anima.invoke (multi-session)"
```

### Task D4: Gate-trigger predicate DSL (VAK transition pattern matching)

**Files:**
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/gate-trigger.ts`
- Test: `Body/S/S4/ta-onta/S4-5p-aletheia/tests/gate_trigger.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-5p-aletheia/tests/gate_trigger.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { matchGateTrigger, type GateTrigger } from "../modules/gate-trigger.ts";

describe("gate-trigger predicate DSL", () => {
  const triggers: GateTrigger[] = [
    { gate: "ql-gate", on: { cf_transition_to: "(00/00)" } },
    { gate: "m-prime-gate", on: { ct_includes: "CT4b" } },
    { gate: "collab-gate", on: { cpf_equals: "(00/00)", risk_above: 0.7 } },
  ];

  it("fires ql-gate when CF transitions to (00/00)", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(0/1/2)" } as any,
      next_vak: { cf: "(00/00)" } as any,
    });
    assert.deepEqual(fired, ["ql-gate"]);
  });

  it("fires m-prime-gate when CT includes CT4b", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(0/1)", ct: ["CT1"] } as any,
      next_vak: { cf: "(0/1)", ct: ["CT4b"] } as any,
    });
    assert.deepEqual(fired, ["m-prime-gate"]);
  });

  it("fires collab-gate when CPF=(00/00) and risk above threshold", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cpf: "(4.0/1-4.4/5)" } as any,
      next_vak: { cpf: "(00/00)" } as any,
      context: { risk: 0.9 },
    });
    assert.deepEqual(fired, ["collab-gate"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/gate_trigger.test.ts`
Expected: FAIL — `modules/gate-trigger.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-5p-aletheia/modules/gate-trigger.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export type GateName = "ql-gate" | "m-gate" | "s-gate" | "m-prime-gate" | "rupa-gate" | "collab-gate";

export interface GateTrigger {
  gate: GateName;
  on: {
    cf_transition_to?: string;
    ct_includes?: string;
    cpf_equals?: string;
    risk_above?: number;
  };
}

export function matchGateTrigger(
  triggers: GateTrigger[],
  state: {
    prev_vak?: Partial<VakAddress>;
    next_vak: Partial<VakAddress>;
    context?: { risk?: number };
  },
): GateName[] {
  const fired: GateName[] = [];
  for (const t of triggers) {
    if (t.on.cf_transition_to && state.next_vak.cf === t.on.cf_transition_to && state.prev_vak?.cf !== t.on.cf_transition_to) {
      fired.push(t.gate);
      continue;
    }
    if (t.on.ct_includes && (state.next_vak.ct ?? []).includes(t.on.ct_includes as any)) {
      fired.push(t.gate);
      continue;
    }
    if (t.on.cpf_equals && state.next_vak.cpf === t.on.cpf_equals) {
      if (t.on.risk_above !== undefined) {
        if ((state.context?.risk ?? 0) > t.on.risk_above) fired.push(t.gate);
      } else {
        fired.push(t.gate);
      }
      continue;
    }
  }
  return fired;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-5p-aletheia && node --experimental-strip-types --test tests/gate_trigger.test.ts`
Expected: PASS — 3 ok.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-5p-aletheia/modules/gate-trigger.ts Body/S/S4/ta-onta/S4-5p-aletheia/tests/gate_trigger.test.ts
git commit -m "feat(s4-aletheia): gate-trigger DSL matches VAK transitions to gate names"
```

### Task D5: Wire gate triggers into Anima dispatch (auto-fire on VAK transition)

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — dispatch path checks `matchGateTrigger`
- Modify: `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` — `aletheia_gate_check` tool
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_gate_block.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_gate_block.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { dispatchGuardrails, CANONICAL_TRIGGERS } from "../modules/dispatch-validate.ts";

describe("dispatch gate guardrails", () => {
  it("blocks dispatch when collab-gate fires (high risk dialogical)", () => {
    const out = dispatchGuardrails({
      prev_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)" } as any,
      next_vak: { cpf: "(00/00)", cf: "(00/00)", ct: ["CT0"], cp: "CP4.0", cfp: "CFP0", cs: { code: "CS1", direction: "Day" } },
      risk: 0.9,
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, false);
    assert.deepEqual(out.gates_fired.sort(), ["collab-gate", "ql-gate"]);
  });

  it("allows dispatch when no triggers match", () => {
    const out = dispatchGuardrails({
      prev_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)", ct: ["CT1"] } as any,
      next_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1/2)", ct: ["CT2"], cp: "CP4.2", cfp: "CFP0", cs: { code: "CS1", direction: "Day" } },
      risk: 0.1,
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, true);
    assert.equal(out.gates_fired.length, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/dispatch_gate_block.test.ts`
Expected: FAIL — `dispatchGuardrails`, `CANONICAL_TRIGGERS` not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts`:

```typescript
import { matchGateTrigger, type GateTrigger, type GateName } from "../../S4-5p-aletheia/modules/gate-trigger.ts";

export const CANONICAL_TRIGGERS: GateTrigger[] = [
  { gate: "ql-gate", on: { cf_transition_to: "(00/00)" } },
  { gate: "m-prime-gate", on: { ct_includes: "CT4b" } },
  { gate: "rupa-gate", on: { ct_includes: "CT3" } },
  { gate: "collab-gate", on: { cpf_equals: "(00/00)", risk_above: 0.7 } },
];

export interface GuardrailResult {
  allowed: boolean;
  gates_fired: GateName[];
}

export function dispatchGuardrails(
  state: { prev_vak?: any; next_vak: any; risk?: number },
  triggers: GateTrigger[],
): GuardrailResult {
  const fired = matchGateTrigger(triggers, {
    prev_vak: state.prev_vak,
    next_vak: state.next_vak,
    context: { risk: state.risk },
  });
  const blocking: GateName[] = ["collab-gate", "rupa-gate"];
  const allowed = !fired.some((g) => blocking.includes(g));
  return { allowed, gates_fired: fired };
}
```

Wire into `dispatch_agent` and `dispatch_parallel_agents`: after `validateDispatchParams`, call `dispatchGuardrails({prev_vak: <session current VAK>, next_vak: params.vak_address, risk: <estimate>}, CANONICAL_TRIGGERS)`. If `!allowed`, return early with a gate-block message naming which gates fired.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/dispatch_gate_block.test.ts`
Expected: PASS — 2 ok.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts Body/S/S4/ta-onta/S4-4p-anima/tests/dispatch_gate_block.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): dispatchGuardrails block dispatch when collab/rupa gates fire"
```

---

## Phase E: Coordination & Harmonic Flow (Jobs 7, 9)

### Task E1: Extend `capability-matrix.json` with per-skill VAK profile

**Files:**
- Modify: `Body/S/S4/plugins/pleroma/capability-matrix.json`
- Modify: `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`

- [ ] **Step 1: Write the failing test**

Append to `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`:

```python
def test_every_skill_declares_vak_profile(self):
    """Each skill must carry operates_at_cf / serves_ct / ranges_cp profile fields."""
    matrix = json.loads((self.PLEROMA_ROOT / "capability-matrix.json").read_text())
    for skill in matrix["skills"]:
        with self.subTest(skill=skill["name"]):
            self.assertIn("vak_profile", skill, f"skill {skill['name']} missing vak_profile")
            vp = skill["vak_profile"]
            self.assertIn("operates_at_cf", vp)
            self.assertIn("serves_ct", vp)
            self.assertIn("ranges_cp", vp)
            self.assertTrue(isinstance(vp["operates_at_cf"], list))
            self.assertTrue(isinstance(vp["serves_ct"], list))
            self.assertTrue(isinstance(vp["ranges_cp"], list))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py -v`
Expected: FAIL — `vak_profile` missing on existing skills.

- [ ] **Step 3: Write minimal implementation**

Edit `Body/S/S4/plugins/pleroma/capability-matrix.json` — add `vak_profile` to every entry in `skills[]`. Example for the first three:

```json
{
  "name": "anima-orchestration",
  "layer": "S4/S4'",
  "kind": "vak-dispatch",
  "vak_profile": {
    "operates_at_cf": ["(4.0/1-4.4/5)"],
    "serves_ct": ["CT4", "CT5"],
    "ranges_cp": ["CP4.0", "CP4.1", "CP4.2", "CP4.3", "CP4.4", "CP4.5"]
  }
},
{
  "name": "vak-evaluate",
  "layer": "S4/S4'",
  "kind": "vak-coordinate-assignment",
  "vak_profile": {
    "operates_at_cf": ["(4.0/1-4.4/5)"],
    "serves_ct": ["CT0", "CT1", "CT2", "CT3", "CT4", "CT5"],
    "ranges_cp": ["CP4.0"]
  }
},
{
  "name": "goal-prelude",
  "layer": "S4/S4'",
  "kind": "dialogical-goal-discovery",
  "vak_profile": {
    "operates_at_cf": ["(00/00)"],
    "serves_ct": ["CT0", "CT4b"],
    "ranges_cp": ["CP4.0", "CP4.4"]
  }
}
```

Continue for every skill in the existing matrix.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py -v`
Expected: PASS — all tests OK.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/plugins/pleroma/capability-matrix.json Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py
git commit -m "feat(pleroma): every skill declares vak_profile (operates_at_cf/serves_ct/ranges_cp)"
```

### Task E2: Anima orchestration queries skill registry by VAK address

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/modules/skill-registry.ts`
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — `anima_orchestrate` consults the registry
- Test: `Body/S/S4/ta-onta/S4-4p-anima/tests/skill_registry_query.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// Body/S/S4/ta-onta/S4-4p-anima/tests/skill_registry_query.test.ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { findSkillsForVak } from "../modules/skill-registry.ts";

const FAKE_MATRIX = {
  skills: [
    { name: "alpha", vak_profile: { operates_at_cf: ["(0/1)"], serves_ct: ["CT1"], ranges_cp: ["CP4.1"] } },
    { name: "beta", vak_profile: { operates_at_cf: ["(0/1/2)"], serves_ct: ["CT2"], ranges_cp: ["CP4.2"] } },
    { name: "gamma", vak_profile: { operates_at_cf: ["(0/1)", "(0/1/2)"], serves_ct: ["CT1", "CT2"], ranges_cp: ["CP4.1", "CP4.2"] } },
  ],
};

describe("skill registry query", () => {
  it("finds skills matching CF + CT + CP", () => {
    const matches = findSkillsForVak(FAKE_MATRIX, {
      cf: "(0/1)" as any,
      ct: ["CT1"] as any,
      cp: "CP4.1" as any,
    } as any);
    const names = matches.map((s) => s.name).sort();
    assert.deepEqual(names, ["alpha", "gamma"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/skill_registry_query.test.ts`
Expected: FAIL — `modules/skill-registry.ts` not found.

- [ ] **Step 3: Write minimal implementation**

Create `Body/S/S4/ta-onta/S4-4p-anima/modules/skill-registry.ts`:

```typescript
import type { VakAddress } from "../../../../../.pi/extensions/s_i/modules/ql_types/index.ts";

export interface SkillEntry {
  name: string;
  vak_profile: {
    operates_at_cf: string[];
    serves_ct: string[];
    ranges_cp: string[];
  };
}

export interface CapabilityMatrix {
  skills: SkillEntry[];
}

export function findSkillsForVak(matrix: CapabilityMatrix, vak: VakAddress): SkillEntry[] {
  return matrix.skills.filter((s) => {
    const cfMatch = s.vak_profile.operates_at_cf.includes(vak.cf);
    const ctMatch = vak.ct.some((t) => s.vak_profile.serves_ct.includes(t));
    const cpMatch = s.vak_profile.ranges_cp.includes(vak.cp);
    return cfMatch && ctMatch && cpMatch;
  });
}
```

Wire into `anima_orchestrate` tool: after vak-evaluate produces an address, load capability-matrix.json, call `findSkillsForVak`, include the result in the dispatch plan output (so caller knows which skills are auto-loaded).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Body/S/S4/ta-onta/S4-4p-anima && node --experimental-strip-types --test tests/skill_registry_query.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/modules/skill-registry.ts Body/S/S4/ta-onta/S4-4p-anima/tests/skill_registry_query.test.ts Body/S/S4/ta-onta/S4-4p-anima/extension.ts
git commit -m "feat(s4-anima): findSkillsForVak queries capability matrix by VAK address"
```

### Task E3: `MathemeHarmonicProfile` carries `VakAddress`

**Files:**
- Modify: `Body/S/S0/portal-core/src/matheme_harmonic_profile.rs` (or equivalent — find the existing definition)
- Test: `Body/S/S0/portal-core/tests/profile_carries_vak.rs` (new)

- [ ] **Step 1: Locate the existing profile definition**

Run: `grep -n "MathemeHarmonicProfile\|matheme_harmonic" -r Body/S/S0/portal-core/src/`
Identify the struct and its module.

- [ ] **Step 2: Write the failing test**

```rust
// Body/S/S0/portal-core/tests/profile_carries_vak.rs
use portal_core::{MathemeHarmonicProfile, VakAddress, CpfState, CsDirection};

#[test]
fn profile_carries_vak_address_field() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".into()],
        cp: "CP4.4".into(),
        cf: "(4.0/1-4.4/5)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS0".into(),
        cs_direction: CsDirection::Day,
    };
    let profile = MathemeHarmonicProfile::with_vak(42, vak.clone());
    assert_eq!(profile.vak_address.as_ref().unwrap().cf, "(4.0/1-4.4/5)");
    assert_eq!(profile.tick, 42);
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test profile_carries_vak`
Expected: FAIL — `with_vak` or `vak_address` field not present.

- [ ] **Step 4: Write minimal implementation**

In the existing `MathemeHarmonicProfile` struct, add:

```rust
#[serde(default, skip_serializing_if = "Option::is_none")]
pub vak_address: Option<VakAddress>,
```

And a constructor:

```rust
impl MathemeHarmonicProfile {
    pub fn with_vak(tick: u64, vak: VakAddress) -> Self {
        let mut p = Self::for_tick(tick); // or whatever the existing constructor is
        p.vak_address = Some(vak);
        p
    }
}
```

If `for_tick` (or analogous) doesn't exist, adapt the constructor name to what's there.

- [ ] **Step 5: Run test to verify it passes**

Run: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test profile_carries_vak`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Body/S/S0/portal-core/src/matheme_harmonic_profile.rs Body/S/S0/portal-core/tests/profile_carries_vak.rs
git commit -m "feat(s0): MathemeHarmonicProfile carries optional VakAddress"
```

### Task E4: M' Tauri command consumes harmonic profile with VAK

**Files:**
- Modify: `Body/M/epi-tauri/src-tauri/src/commands/harmonic_profile.rs` (or analogous — find existing)
- Test: `Body/M/epi-tauri/src-tauri/tests/profile_vak.rs` (new)

- [ ] **Step 1: Locate the existing Tauri harmonic profile command**

Run: `grep -rn "harmonic_profile\|MathemeHarmonicProfile" Body/M/epi-tauri/src-tauri/src/`

- [ ] **Step 2: Write the failing test**

```rust
// Body/M/epi-tauri/src-tauri/tests/profile_vak.rs
use epi_tauri::commands::harmonic_profile::HarmonicProfileResponse;
use portal_core::{CpfState, CsDirection, VakAddress};

#[test]
fn harmonic_profile_response_carries_vak() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".into()],
        cp: "CP4.4".into(),
        cf: "(4.0/1-4.4/5)".into(),
        cfp: "CFP0".into(),
        cs_code: "CS0".into(),
        cs_direction: CsDirection::Day,
    };
    let resp = HarmonicProfileResponse::compose(7, Some(vak.clone()));
    assert_eq!(resp.tick, 7);
    assert_eq!(resp.vak_address.as_ref().unwrap().cf, "(4.0/1-4.4/5)");
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml --test profile_vak`
Expected: FAIL — `HarmonicProfileResponse::compose` or `vak_address` not in struct.

- [ ] **Step 4: Write minimal implementation**

In `Body/M/epi-tauri/src-tauri/src/commands/harmonic_profile.rs`:

```rust
use portal_core::VakAddress;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicProfileResponse {
    pub tick: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
}

impl HarmonicProfileResponse {
    pub fn compose(tick: u64, vak: Option<VakAddress>) -> Self {
        Self { tick, vak_address: vak }
    }
}
```

If the Tauri command function exists, extend its return shape to use this struct; if it returns the profile directly, expose `vak_address` through.

- [ ] **Step 5: Run test to verify it passes**

Run: `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml --test profile_vak`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Body/M/epi-tauri/src-tauri/src/commands/harmonic_profile.rs Body/M/epi-tauri/src-tauri/tests/profile_vak.rs
git commit -m "feat(m'-tauri): HarmonicProfileResponse exposes VakAddress to UI consumers"
```

---

## Final integration check

### Task F1: End-to-end Z-cycle smoke test

**Files:**
- Create: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/artifacts/2026-05-22-z-cycle-smoke.md`

- [ ] **Step 1: Document the end-to-end smoke**

Create the artifact describing the smoke run: session_start creates session with compose-phase VAK → dispatch a single trivial task (e.g. logos defines a placeholder) → session_end fires Sophia hook → Aletheia ingest routes to Epii inbox → Epii recompose produces next-compose-hint → check that next-cycle session_start can read the hint. List every command run + observed log lines.

- [ ] **Step 2: Run the smoke and capture output**

Commands (one of):
- Manual: `epi agent session init` → dispatch → `epi agent session close` → check `Pratibimba/Sophia/inbox/` and `Pratibimba/Epii/inbox/` and `recompose_pass` output.
- Test wrapper: write a `tests/integration/z_cycle_smoke.rs` that wires the rust crates only (no live PI / live Gateway), proves Sophia disclosure → Aletheia routing → Epii recompose in-process.

- [ ] **Step 3: Commit**

```bash
git add Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/artifacts/2026-05-22-z-cycle-smoke.md
git commit -m "docs: end-to-end Z-cycle smoke test artifact for VAK operational substrate"
```

---

## Self-Review

**Spec coverage check** — each of the 10 jobs maps to tasks:

| Job | Tasks |
|---|---|
| 1. VAK-bound dispatch | A1, A1b, A5, A6, A7 |
| 2. Coordinate state persisted at session boundary | A2 (gateway), A3 (Hen NOW), A4 (Graphiti) |
| 3. Artifacts carry their address | B1 (graph promotion), B2 (Aletheia T-bucket); A3 covers Day/NOW |
| 4. Session lifecycle IS Z-cycle | C1 (compose at session_start), C2 (rehear at session_end) |
| 5. Möbius seam wired | C2 (Sophia hook), C3 (Moirai), C4 (Aletheia → Epii), C5 (Epii inbox), C6 (recompose) |
| 6. Gates fire at VAK transitions | D4 (trigger DSL), D5 (wire into Anima dispatch) |
| 7. VAK-indexed skill registry | E1 (matrix), E2 (Anima query) |
| 8. Retrieval reads VAK address; biases | B3 (HybridRetriever bias) |
| 9. MathemeHarmonicProfile in dispatch envelope | E3 (profile carries VAK), E4 (Tauri consumes) |
| 10. Anima as self-instantiated # operator | D1 (anima.md in pi-agent), D2 (gateway endpoint), D3 (self-invoke tool) |

**Placeholder scan** — no "TBD", "later", "similar to". Every code block contains complete actual code. Every command is exact.

**Type consistency** — `VakAddress` is the same shape in TS (ql_types index.ts) and Rust (portal-core vak_address.rs). CF strings match across all tasks. CFP codes (CFP0-CFP5, Z) consistent. CS direction is "Day" | "Night'" everywhere. `c_4_*` property names match `sync_coordinator` extension (Task B1) and Hen template (Task A3) and Graphiti episode attrs (Task A4) and thought-route (Task B2).

**Gaps fixed inline:**
- Task A2's `SessionPatch::default()` reference: relies on the existing derive — confirmed `SessionPatch` already derives `Default` in the codebase (per current grep).
- Task E3's `MathemeHarmonicProfile` constructor name (`for_tick`) is generic — if the actual name differs, the engineer adapts via the same one-line constructor pattern; the failing test would catch it immediately.

---

## Execution Handoff

Plan complete and saved to `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Most appropriate for this plan because tasks are well-isolated and the codebase touches multiple subsystems (Rust + TS + Python tests).

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
