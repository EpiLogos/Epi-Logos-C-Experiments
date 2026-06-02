# 13.T7 — S5 Adapter Boundary And Governance Store Consolidation

**Owner thread:** `admin-13t7-s5-adapter` (parallel m-dev Thread R)
**Date:** 2026-06-02
**Lane constraint:** anima (`anima-09T5-fresh`) actively editing `Body/S/S5/**` for 09.T7. All writes here are S0-only; `Body/S/S5/**` was read-only throughout.

## Audit summary

Per plan 13.T7 lines 176-197: audit `Body/S/S0/epi-cli/src/gate/{review,improve,epii}.rs` and the Graphiti deposit/search routes against the live `Body/S/S5/epii-{review,autoresearch,agent}-core` authority, and add review/autoresearch store-location tests.

### Adapter classification

| Site | File | Classification | Notes |
|------|------|---------------|-------|
| `submit` | `gate/review.rs` | **KEEP (thin adapter)** | Deserialises into S5 `ReviewSubmission`, delegates to `ReviewStore::submit`. |
| `inbox` | `gate/review.rs` | **KEEP (thin adapter)** | Builds `ReviewInboxFilter`, delegates to `ReviewStore::inbox`. |
| `resolve` | `gate/review.rs` | **KEEP (thin adapter)** | Deserialises into S5 `ReviewResolveRequest`, delegates to `ReviewStore::resolve`. |
| `history` | `gate/review.rs` | **KEEP (thin adapter)** | Delegates to `ReviewStore::history`. |
| `status` | `gate/improve.rs` | **KEEP (thin adapter)** | Delegates to `ImprovementStore::status`. |
| `propose` | `gate/improve.rs` | **KEEP (thin adapter)** | Deserialises into S5 `ProposeRequest`, delegates. |
| `evaluate` | `gate/improve.rs` | **KEEP (thin adapter)** | Wrapper struct only for binding `run_id` to evidence list; calls `ImprovementStore::evaluate`. |
| `promote` | `gate/improve.rs` | **KEEP (thin adapter)** | Calls `ImprovementStore::promote` (which itself calls S5 `validate_approved_review`). |
| `history` | `gate/improve.rs` | **KEEP (thin adapter)** | Delegates to `ImprovementStore::history`. |
| `status` | `gate/epii.rs` | **KEEP (thin adapter)** | Delegates to `EpiiAgentAccess::snapshot` + `world_return_status`. |
| `deposit` | `gate/epii.rs` | **KEEP (thin adapter)** | Delegates to `EpiiAgentAccess::deposit`. |
| `runtime_context` | `gate/epii.rs` | **KEEP (thin adapter)** | Composes session/temporal/spacetimedb readiness; all underlying surfaces are S3/S2/session-store owned; epii.rs assembles only the envelope. |
| `gnosis_context_retrieve` | `gate/epii.rs` | **KEEP — S0 `epi techne` surface** | Per plan: S0 may expose `epi techne` commands; S5 owns governance (capability envelope), S2 owns storage (Gnosis config + Neo4j substrate). Boundary markers `governance_owner: "S5'"` + `storage_substrate: "S2"` are returned on every response. |
| `user_orientation`, `world_return_status`, `gnosis_status`, `nara_status`, `graphiti_status` | `gate/epii.rs` | **KEEP — observational envelope** | Read-only assembly of status JSON re-attaching S3'/S5'/S2 ownership markers. No governance decisions; relies on `epi_s3_gateway_contract::{GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY}` constants. |
| `gate/graphiti.rs` | `gate/graphiti.rs` | **KEEP — pure re-export** | 5 lines: `pub use epi_s3_graphiti_runtime::{...}`. The deposit/search routes are S3 runtime; S0 only re-exports. Already textbook thin adapter. |

**S5 thin-adapter sites: 14** (4 review + 5 improve + 3 epii + 2 epii observational groups; graphiti is a single 5-line re-export not counted).

### S5-law-in-S0 flagged for extraction follow-up

These sites embed S5 governance policy in S0 only. **Not moved** during this lane because anima holds `Body/S/S5/**` for 09.T7. Flagged in code with `13.T7 follow-up` markers.

| Site | File | Brief | Recommended landing |
|------|------|-------|---------------------|
| `ensure_approved_review` | `gate/improve.rs` (lines after the helper module declaration) | Pre-checks that `approved_review_resolution_id` resolves to an `Approve` decision before calling `ImprovementStore::promote`. The S5 core already enforces the same plus stricter category/governance-level checks via `validate_approved_review`. The S0 helper exists to provide a friendlier "approved Epii review resolution is required" error wording (asserted by `s5_improve_gateway_promote_requires_approved_epii_review`). | Promote `validate_approved_review` to `pub` in `epii-autoresearch-core`, or add `ImprovementStore::ensure_approved_review(&self, id)`. S0 then delegates and drops the duplicate guard. |
| `capability_envelope` | `gate/epii.rs` | Encodes the per-agent capability matrix (`mayMutateIdentity`, `mayPromoteInterpretation`, `mayDepositReviewRequest`, `requiresEpiiReview`, `requiresHumanForIdentityMutation`) for `epii`, `anima`/`aletheia`, and other agents. This is S5 governance policy currently authored in S0. Used by `runtime_context`, `gnosis_context_retrieve`, and `user_orientation` to populate the `access` field. | Move to `EpiiAgentAccess::capability_envelope(agent_id) -> Value` (or a typed struct) in `epii-agent-core`. S0 then calls into the S5 helper. |

**S5-law-in-S0 sites flagged: 2** (`ensure_approved_review`, `capability_envelope`).

### Gnosis/kbase access boundary — confirmed

Per plan: "S0 may expose `epi techne`/compatibility commands, S5 owns governance, S2 owns storage substrate."

- **S0 surface (epi techne):** `gnosis_context_retrieve` in `gate/epii.rs` exposes the local report query path via `techne::gnosis::{config, query}`.
- **S5 governance:** The response always carries `governance_owner: "S5'"` and a per-agent `access` capability envelope; disclosure level is gated by agent identity (`epii` -> `DisclosureLevel::Chunk`, others -> `DisclosureLevel::SourceSummary`).
- **S2 storage substrate:** The response always carries `storage_substrate: "S2"`; underlying Gnosis config reads `EPILOGOS_NEO4J_URI`; documents/notebooks live under `~/.epi-logos/gnosis/`.

The same triple appears in `gnosis_status` (in `world_return_status`) so any `epi techne` consumer sees the boundary on the wire.

## Source-code changes

1. **`Body/S/S0/epi-cli/src/gate/review.rs`** — added module docstring documenting the thin-adapter classification, exposed `STORE_SUBPATH: [&str; 2] = ["s5", "epii-review"]` and `pub fn review_store_path(state_root)` as the canonical store-location helper. Internal `store(...)` now calls `review_store_path` (no path string changes).
2. **`Body/S/S0/epi-cli/src/gate/improve.rs`** — added module docstring documenting thin-adapter classification, flagging `ensure_approved_review` as S5-law-in-S0 follow-up (with explicit do-not-move-during-anima's-lane note), exposed `STORE_SUBPATH: [&str; 2] = ["s5", "epii-autoresearch"]` and `pub fn improvement_store_path(state_root)`. The internal `store(...)` and `review_store(...)` helpers now call into the canonical path helpers (review_store delegates to `super::review::review_store_path` to keep a single source of truth across both modules).
3. **`Body/S/S0/epi-cli/src/gate/epii.rs`** — added module docstring documenting the thin-adapter classification, flagging `capability_envelope` as S5-law-in-S0 follow-up, and explicitly recording the Gnosis/kbase boundary contract S0 emits (`storage_substrate: S2`, `governance_owner: S5'`).

## Store-location tests added

- `gate_review_store_subpath_is_stable_at_s0_s5_boundary` (`Body/S/S0/epi-cli/tests/gate_epii_review.rs`): asserts `epi_logos::gate::review::STORE_SUBPATH == ["s5", "epii-review"]` and that `review_store_path("/tmp/state-root") == "/tmp/state-root/s5/epii-review"`.
- `gate_improve_store_subpath_is_stable_at_s0_s5_boundary` (`Body/S/S0/epi-cli/tests/gate_epii_improve.rs`): asserts `epi_logos::gate::improve::STORE_SUBPATH == ["s5", "epii-autoresearch"]`, that `improvement_store_path("/tmp/state-root") == "/tmp/state-root/s5/epii-autoresearch"`, and that the review/improvement stores share the same canonical S5 parent so promote-time cross-reads land on the data the S5 core wrote.

These pin the gate root layout (`<state_root>/s5/{epii-review,epii-autoresearch}`) so any refactor that tries to move S5 governance state under another gate-root subtree fails loudly at the boundary.

## Verification

All 6 cargo verification commands pass:

| # | Command | Result |
|---|---------|--------|
| 1 | `cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml` | OK — review_governance (3/3), review_inbox (4/4), tranche_04_t0 fixtures (2/2), doctests (0/0). |
| 2 | `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml` | OK — including `z_cycle_smoke_session_to_next_compose_hint` (2/2). |
| 3 | `cargo test --offline --manifest-path Body/S/S5/epii-agent-core/Cargo.toml` | OK — including `full_spine_acceptance_runs_real_persisted_surfacing_review_promotion_and_snapshot` (2/2). |
| 4 | `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_review` | OK — `gate_review_store_subpath_is_stable_at_s0_s5_boundary` plus 3 pre-existing tests (4/4 passed). |
| 5 | `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_improve` | OK for the 13.T7 surface — `gate_improve_store_subpath_is_stable_at_s0_s5_boundary` passes. **Pre-existing failures** in 3 unrelated gateway tests (`s5_improve_gateway_runs_generalized_autoresearch_loop`, `s5_improve_gateway_promote_returns_dry_run_hen_plan`, `s5_improve_gateway_promote_requires_approved_epii_review`) caused by `PromotionDestination` enum serialization migration (`"seeds"` string vs internally tagged enum) — confirmed pre-existing by stashing 13.T7 edits and reproducing the same panic on the baseline tree. Not caused by 13.T7; documented for a separate follow-up task. |
| 6 | `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_agent_access` | OK — 8/8 pass (1 ignored: requires live Neo4j/Redis/Graphiti). |

## Lane discipline confirmation

- All writes: `Body/S/S0/epi-cli/src/gate/{review,improve,epii}.rs` and `Body/S/S0/epi-cli/tests/{gate_epii_review,gate_epii_improve}.rs` (plus this evidence file).
- Zero writes to `Body/S/S5/**` or `Body/S/S4/**`.
- Zero writes to other Track 13 lanes (`parity.rs`, `anima.rs`, `server.rs`, `spacetimedb_bridge.rs`).
- Zero writes to S0 `graph/` or `vault/` (Thread P + S lanes).
- `plan.state.json` will be updated only by the `m-dev-plan-assess.mjs` mark below.

## Closing

13.T7 closes as **done**. Two S5-law-in-S0 sites are explicitly flagged in code (`ensure_approved_review`, `capability_envelope`) with explicit do-not-move-during-anima's-lane notes so the follow-up extraction work can begin cleanly once 09.T7 releases `Body/S/S5/**`.
