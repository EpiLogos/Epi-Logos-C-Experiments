# 13.T9 — Cross-Layer Enforcement Tests And CI Guardrails (Evidence)

**Status:** done
**Date:** 2026-06-02
**Owner thread:** W (admin-13t9-cross-layer-guardrails)
**Plan section:** [13-s-sprime-modularity-and-s0-membrane-cleanup.md §T9](../13-s-sprime-modularity-and-s0-membrane-cleanup.md) (lines 220-238)

## Binding inputs

- Thread O / 13.T1 — `CoordinateParityStatus` vocabulary + `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json` (30 modules, 12 compatibility shims, 4 temporary live hosts, 3 duplicated-service-law surfaces).
- Thread T / 13.T2 — `METHOD_DISPATCH_PLAN` in `epi_s3_gateway_contract` + `MethodDispatchKind` (six canonical kinds + `S1HenAdapter` extension + `Missing` sentinel).
- Thread U / 13.T3 — handler_owner sentinels for sessions/chat.
- Thread V / 13.T4 — `SpacetimeSubscriptionLifecycleEnvelope` unified.
- Thread P / 13.T5 — type-name ownership tests at `graph_runtime_extraction_contract.rs::t5_graph_law_types_resolve_to_epi_s2_graph_services` (pattern adopted for T9 negative regression).
- Thread Q / 13.T6 — `S4_AUTHORITY_ORIGIN` annotation pattern in `Body/S/S0/epi-cli/src/gate/anima.rs:97`.
- Thread R / 13.T7 — S5 thin-adapter sites for review/improve/epii.
- Thread S / 13.T8 — Hen-routed vs deprecated-local classification + governed write contract.

## Scope

Pure test + CI work. **No production code changes.** Four guardrail axes
landed across three test crates plus one negative fixture and this evidence
ledger.

## Files written

| File | Purpose |
|------|---------|
| `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` | Primary T9 test suite (8 tests, four guardrail axes). |
| `Body/S/S0/epi-cli/tests/fixtures/fake_downstream_law_module.rs` | Negative fixture proving the scanner rejects an unannotated downstream-law module. |
| `Body/S/S3/gateway/tests/dispatch_contract.rs` | Appended `t9_route_ownership_cross_walk` module (1 test) — METHOD_NAMES ↔ S3 dispatch ↔ S0 dispatch cross-walk. |
| `Body/S/S2/graph-services/tests/graph_runtime_extraction_contract.rs` | Appended `t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace` (1 test) — negative regression for the `epi_logos::graph::*` leak surface. |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t9-cross-layer-guardrails-evidence.md` | This ledger. |

## Four guardrail axes

### Axis 1 — S0 downstream-law scanner

Test: `s0_does_not_introduce_new_downstream_service_law`
(`Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs`).

The scanner walks every `.rs` file under the four S0 "law zones":
`src/gate/`, `src/graph/`, `src/vault/`, `src/core/`. For each file the
scanner returns one of:

- `Inventoried` — file is named (exact or via directory prefix) in
  `contract-inventory/s0-membrane-inventory.json`.
- `Annotated` — file head carries `// S0 ADAPTER:` / `// S0 adapter:` /
  `//! S0 ADAPTER:` / `/// S0 ADAPTER:` (case-aware variants), OR the
  first non-blank, non-comment line is a pure re-export of the form
  `pub use epi_s1_…`, `pub use epi_s2_…`, `pub use epi_s3_…`,
  `pub use epi_s4_…`, `pub use epi_s5_…`, `pub use epi_kbase_…`,
  `pub use epii_…`, or `pub use portal_core::…`. Pure re-export files
  are adapters by construction.
- `CliGlueBaseline` — file is listed in `baseline_cli_glue_modules()` as
  pure CLI dispatch / operator-facing surface with no service-law content
  (each entry carries a one-line justification comment).
- `Entrypoint` — `lib.rs` / `main.rs` / `up.rs`.
- `OutsideLawZone` — outside `gate/` `graph/` `vault/` `core/`.
- `UnannotatedDownstreamLaw` — **VIOLATION**: a file under a law zone
  that is none of the above.

Adding a new law-zone module without (a) inventory entry, (b) annotation,
or (c) baseline addition with justification fails this test.

### Axis 2 — Route-ownership cross-walk

Test: `route_ownership_cross_walk_method_names_vs_s3_dispatch_vs_s0_dispatch`
(`Body/S/S3/gateway/tests/dispatch_contract.rs`).

Three surfaces are reconciled exactly:

- **METHOD_NAMES** (`epi_s3_gateway_contract::METHOD_NAMES`) — the
  contract.
- **S3 classification** (`classify_method` + `dispatch_plan_entry` in
  `epi_s3_gateway::dispatch`) — the executable route table.
- **S0 dispatched** — extracted at test time by tokenising
  `Body/S/S0/epi-cli/src/gate/server.rs` for match-arm string literals
  (skips internal state-machine tags like `"pending"`, `"retrying"`,
  `"shared"`).

Asserts four invariants:

- (A) every METHOD_NAMES entry is classified by S3;
- (A2) every METHOD_NAMES entry has a dispatch-plan entry;
- (B) every METHOD_NAMES entry is dispatched by S0 OR explicitly listed
  in `s3_only_methods()` (the S3-direct dispatch exemption set, each
  entry justified inline);
- (C) every S0-dispatched method is in METHOD_NAMES OR is a known route
  extension (`nara.*`, `s5'.epii.{kairos.context,user.orientation,pratibimba.status}`);
- (D / D2 / D3) bookkeeping: the three set-arithmetic identities hold.

#### Cross-walk parity counts (computed by the test)

- `METHOD_NAMES.len()` = **154** (counted via
  `awk '/^pub const METHOD_NAMES/,/^\];/' lib.rs | grep -E '^\s*"'`).
- `s3_only_methods()` = **18** entries (S3-direct or pre-match
  handshake: `connect`, `agent.identity.get`, `agents.list`,
  `s0.command.{exec,completion}`, the seven `s2'.constraint.*` /
  `s2'.coordinate.{cypher,ingest,analyse_resonance,persist_analysis,aggregate_resonance}`
  surfaces, `s3'.kernel.envelope.publish`, the four S5 autoresearch
  surfaces).
- **S0-dispatched ∩ METHOD_NAMES = 154 − 18 = 136.**
- S0-dispatched route extensions (in addition): `nara.*` family (one
  arm) + 3 `s5'.epii.*` extensions = 4 method strings.

All three sets agree under the four-axis assertion battery. Drift in any
direction surfaces here.

### Axis 3 — Graph ownership regression

Test: `t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace`
(`Body/S/S2/graph-services/tests/graph_runtime_extraction_contract.rs`).

Negative regression complementing T5's positive ownership test. For each
named graph-law family (graph retrieval, semantic cache, dataset import,
doctor, relationship manager, sync coordinator, plus the T5-moved cypher
/ constraint / analyser / anuttara / lifecycle-evidence surfaces) the
test asserts `std::any::type_name::<T>()` does **not** contain
`epi_logos::graph`. If a future change re-introduces an S0-local
definition shadowing an S2 type, the assertion fires immediately.

### Axis 4 — S4 / S5 ownership in S0

Tests: `s4_governance_policy_not_introduced_in_s0` and
`s5_review_schemas_not_introduced_in_s0`
(`Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs`).

Word-boundary scanners (`defines_word` helper) detect *exact* struct /
enum / static / fn definitions of:

- S4: `CapabilityMatrix`, `DispatchToolList`, `VakEvaluationRule` (plus
  `CAPABILITY_MATRIX` / `DISPATCH_TOOL_LIST` / `VAK_EVALUATION_RULE`
  static/const forms).
- S5: `ReviewItem`, `EvidenceEnvelope`, `GovernanceGate`,
  `DryRunPromotion`.

For S4 hits to be allowed, the file must carry an `S4_AUTHORITY_ORIGIN`
declaration referencing `Body/S/S4`. For S5 hits, the file must import
from one of `epii_review_core`, `epii_autoresearch_core`,
`epii_agent_core` (or their `epi-s5-*` re-export crates). Substring-
matches (e.g. `CapabilityMatrixProvider`, `CapabilityMatrixManifest`
under `portal/surfaces.rs`) are correctly tolerated by the word-boundary
detector — those are reflections of the S4 surface, not introductions
of S4 law.

## Negative fixture

Path: `Body/S/S0/epi-cli/tests/fixtures/fake_downstream_law_module.rs`.

Contains a hand-crafted `FakeReviewItem` / `FakeReviewInbox::{submit,
resolve}` shape that mimics what S5 `epii-review-core::ReviewStore` does
— the exact extraction T7 codified. The fixture:

- lives under `tests/fixtures/` so Cargo never compiles it as an
  integration target (only top-level `tests/*.rs` are auto-discovered);
- is referenced **as a path string**, never `mod fixtures;`-imported, so
  it cannot leak into the crate graph;
- carries no `// S0 ADAPTER:` annotation and starts with a plain
  `pub struct FakeReviewItem` (no pure-re-export bypass).

Negative test: `negative_fixture_is_correctly_rejected_by_s0_scanner`
(`s0_membrane_guardrails.rs`) constructs a hypothetical
`Body/S/S0/epi-cli/src/gate/fake_review_inbox.rs` path, hands it to the
scanner along with the fixture's actual file contents, and asserts the
scanner returns `ModuleClassification::UnannotatedDownstreamLaw`. The
test also asserts the scanner correctly returns `OutsideLawZone` if the
fixture is "placed" at a non-law-zone path — so an adversary cannot
bypass by location alone; only by adding inventory entry / annotation
inside a law zone.

## Verification — all suites pass

```
$ cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml \
    --test s0_membrane_guardrails
running 8 tests
test t9_inventory_classifications_use_t1_vocabulary ... ok
test t9_inventory_modules_total_matches_recorded ... ok
test t9_every_non_native_inventoried_module_names_a_body_native_authority ... ok
test t9_inventory_paths_resolve_to_real_files_or_directories ... ok
test negative_fixture_is_correctly_rejected_by_s0_scanner ... ok
test s0_does_not_introduce_new_downstream_service_law ... ok
test s5_review_schemas_not_introduced_in_s0 ... ok
test s4_governance_policy_not_introduced_in_s0 ... ok
test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

$ cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml \
    --test dispatch_contract
running 13 tests
... (12 pre-existing) ...
test t9_route_ownership_cross_walk::route_ownership_cross_walk_method_names_vs_s3_dispatch_vs_s0_dispatch ... ok
test result: ok. 13 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

$ cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml \
    --test graph_runtime_extraction_contract
running 8 tests
... (7 pre-existing including the T5 positive ownership test) ...
test t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace ... ok
test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

## Findings (surfaced for T10 release-gate consideration)

1. **Inventory `counts.cli_adapter` drift.** The inventory header records
   `counts.cli_adapter = 17`, but a fresh classification scan finds 18
   `cli-adapter` records (similarly `counts.temporary_live_host_modules
   = 2` records but 0 modules carry that classification — those entries
   migrated to `gateway-adapter` after T2/T3/T4). This is *not* a
   regression introduced by T9 — it is a pre-existing drift between
   the inventory header and the records it contains. The T9 guardrail
   suite tolerates this by enforcing only `counts.modules ==
   inventory.modules.len()` (which holds at 30) and the T1 vocabulary
   well-formedness — but **T10 should refresh `counts.*` to match the
   current per-classification reality** as part of the cleanup release
   gate ledger recast.

2. **No new S4 or S5 schema leaks detected.** Both
   `s4_governance_policy_not_introduced_in_s0` and
   `s5_review_schemas_not_introduced_in_s0` pass cleanly. The single
   `S4_AUTHORITY_ORIGIN`-annotated site (`gate/anima.rs:97`) is the only
   place under S0 where S4 capability law is reflected, and it carries
   the correct adapter annotation. `portal/surfaces.rs` reflects the
   capability-matrix manifest as `CapabilityMatrix{Provider,Manifest}`
   variants — these are *renderings* of an external matrix, not
   re-introductions of S4 law, and the word-boundary detector correctly
   tolerates them.

3. **Graph law fully owned by S2.** The negative T9 ownership regression
   confirms no graph type resolves into `epi_logos::graph::*` —
   complementary to the T5 positive test that confirms they all resolve
   into `epi_s2_graph_services::*`.

4. **Route-ownership three-way reconciliation closes cleanly.** Every
   METHOD_NAMES entry is classified by S3, dispatched by S0 or
   explicitly s3-only, and the S0 server.rs carries no invented routes
   beyond the documented `nara.*` / `s5'.epii.*` route extensions.

## Recommendation for T10

- **Refresh inventory counts.** Per Finding 1 above, T10's "cleanup
  release gate, runbook, and ledger recast" deliverable should
  regenerate `counts.{kernel_owner,cli_adapter,gateway_adapter,
  compatibility_shim,duplicated_service_law,temporary_live_host_modules}`
  from the actual classification distribution so future T9 runs can
  optionally re-enable the per-classification count audit.
- **Consider an annotation backfill pass.** Several `graph/` files
  already carry `// S0 adapter:` (lowercase) annotations; some others
  (e.g. pure-re-export `graph/api.rs`, `graph/mapper.rs`) rely on the
  pure-re-export detector. T10 could optionally normalise all
  annotations to the canonical `// S0 ADAPTER: Body/S/<…>` form for
  consistency — not blocking.
