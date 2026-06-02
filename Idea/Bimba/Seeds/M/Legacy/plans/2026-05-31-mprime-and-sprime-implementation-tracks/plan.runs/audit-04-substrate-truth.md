# Audit — Track 04 Substrate Truth

**Auditor:** `admin-audit-track04` (parallel audit Thread E)
**Date:** 2026-06-01
**Scope:** Read-only substrate-truth gate over Track 04 (S5/S5' autoresearch + review extension).
**Source plan:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`

---

## Headline finding

The world advanced between the parent agent's snapshot and this audit run. **At the time of audit (2026-06-01T22:00:00.691Z ledger updatedAt), Track 04 status is:**

| Tranche | Ledger status | Owner | Audit disposition |
|---|---|---|---|
| 04.T0 | done | codex | Landed (confirmed) |
| 04.T1 | done | codex | Landed (confirmed) |
| 04.T2 | done | admin | Landed (confirmed) |
| 04.T3 | done | admin | Landed (confirmed) |
| 04.T4 | done | admin | Landed (confirmed) |
| 04.T5 | done | codex | Landed (confirmed) |
| 04.T6 | done | codex | Landed (confirmed) |
| 04.T7 | done | codex | **Skipped per task directive** (codex's lane) |
| 04.T8 | done | codex | Landed (confirmed) |
| 04.T9 | pending | — | **Forward** (real work remaining) |

Note: the task brief said T7 was in_progress and T8/T9 pending. By the time this audit ran, codex had already completed both T7 (claimed 21:44:01Z, completed 21:51:35Z) and T8 (claimed 21:53:37Z, completed 22:00:00Z). The ledger reflects this; both completion records carry full Run-ID-tagged evidence. The auditor confirmed T8 by re-running cargo. T7 is NOT probed per task directive.

## Substrate snapshot

The three Track 04 ownership crates exist and are populated:

```
Body/S/S5/epii-autoresearch-core/
  src/    adapters.rs (389)  inbox.rs (172)  lib.rs (1966)  recompose.rs (90)  spine.rs (549)
  tests/  baseline_state_fixture.rs (94)   improvement_loop.rs (648)
          inbox_contract.rs (131)          non_aletheia_adapters.rs (279)
          orchestration_continuity.rs (280) recompose_pass.rs (189)
          spine_schema.rs (223)            surfacing_routing.rs (290)
          z_cycle_smoke.rs (181)
  Total: 3166 src LOC, 2315 test LOC across 9 test binaries

Body/S/S5/epii-review-core/
  src/    lib.rs (554)
  tests/  baseline_state_fixture.rs (59)  review_governance.rs (203)  review_inbox.rs (230)
  Total: 554 src LOC, 492 test LOC across 3 test binaries

Body/S/S5/epii-agent-core/
  src/    lib.rs (1166)
  tests/  agent_access.rs (593)  baseline_state_fixture.rs (43)
  Total: 1166 src LOC, 636 test LOC across 2 test binaries
```

All three crates compile and pass tests offline.

## Verification — Live cargo test results

Commands run from repo root:

### `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml`

```
baseline_state_fixture       2 passed
improvement_loop            10 passed
inbox_contract               7 passed
non_aletheia_adapters        4 passed
orchestration_continuity     4 passed
recompose_pass               8 passed
spine_schema                 5 passed
surfacing_routing            4 passed
z_cycle_smoke                2 passed
Doc-tests                    0
─────────────────────────────
Total                       46 passed; 0 failed; 0 ignored
```

### `cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml`

```
baseline_state_fixture   2 passed
review_governance        3 passed
review_inbox             4 passed
Doc-tests                0
──────────────────────────
Total                    9 passed; 0 failed; 0 ignored
```

### `cargo test --offline --manifest-path Body/S/S5/epii-agent-core/Cargo.toml`

```
agent_access             8 passed
baseline_state_fixture   1 passed
Doc-tests                0
──────────────────────────
Total                    9 passed; 0 failed; 0 ignored
```

**Aggregate: 64 tests pass across the three Track 04 crates with 0 failures, 0 ignored.**

## 08.T8 evidence cross-reference

Thread B's plan-hygiene note (`plan.runs/run-B-plan-hygiene-epicli-evidence.md` §"Findings for the substrate active thread") flagged that 08.T8 evidence cited autoresearch and review-core tests passing, and recommended substrate audit. The 04.T7 evidence (codex, 21:51:35Z) explicitly states:

> `cargo test --offline --manifest-path Body/S/S5/epii-agent-core/Cargo.toml` passed 8/8 agent access tests plus baseline fixture and doctests; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml` passed all suites including improvement_loop 10/10, orchestration_continuity 4/4, surfacing_routing 4/4, recompose_pass 8/8; `cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml` passed 9/9 plus doctests.

My re-run reproduces those exact counts, plus the additional `spine_schema 5/5`, `inbox_contract 7/7`, `non_aletheia_adapters 4/4`, `baseline_state_fixture 2/2`, and `z_cycle_smoke 2/2` (autoresearch-core) — extras that T7 evidence implicitly aggregated under "all suites". The 04.T8 evidence (codex, 22:00:00Z) confirms the non_aletheia_adapters tests it added are part of that "all suites pass" assertion. **No drift between cited evidence and live cargo output.**

## Per-tranche dispositions

### 04.T0 — Baseline Characterization and Compatibility Map

- **Status in ledger:** done (codex)
- **Substrate evidence:** `baseline_state_fixture.rs` exists in all three crates (94+59+43 = 196 LOC). Tests named `tranche_04_t0_*` lock the existing pre-schema-change behavior:
  - autoresearch: `tranche_04_t0_aletheia_jsonl_fixture_path_recomposes_with_human_gate`, `tranche_04_t0_improvement_fixture_loads_through_public_store`
  - review: `tranche_04_t0_human_required_fixture_still_blocks_agent_approval`, `tranche_04_t0_review_fixture_loads_through_public_store`
  - agent: `tranche_04_t0_agent_snapshot_reads_fixture_state_without_placeholders`
- **Fixtures:** `Body/S/S5/fixtures/` directory exists (verified).
- **Disposition:** **Landed** — no action.

### 04.T1 — Typed Spine Core Schema

- **Status:** done (codex)
- **Substrate evidence:** `src/spine.rs` (549 LOC) contains the typed schema; `tests/spine_schema.rs` (223 LOC, 5 tests passing) covers:
  - `typed_candidate_round_trips_without_replacing_propose_request`
  - `closed_enums_reject_unknown_closure_kind` (proves serde rejection on unknown ClosureKind variants per the Aletheia→Epii append contract)
  - `promotion_destination_round_trips_and_rejects_malformed_values`
  - `validation_rejects_blank_direction_missing_observation_and_wrong_target`
  - `tranche_04_t0_fixture_survives_typed_schema_migration_boundary` (migration test)
- **Disposition:** **Landed** — no action.

### 04.T2 — Surfacing Intake and Routing Queues

- **Status:** done (admin)
- **Substrate evidence:** `tests/surfacing_routing.rs` (290 LOC, 4 tests passing):
  - `aletheia_jsonl_surfaces_candidate_run_route_and_linked_review_item`
  - `aletheia_suppression_replays_same_fingerprint_but_accepts_material_change`
  - `multi_target_routing_splits_routes_without_duplicating_run_id`
  - `anuttara_first_blocks_downstream_routes_until_upstream_route_resolves`
- All four verification lines in the plan are explicitly named.
- **Disposition:** **Landed** — no action.

### 04.T3 — Orchestration State Machine and Cross-Cycle Continuity

- **Status:** done (admin)
- **Substrate evidence:** `tests/orchestration_continuity.rs` (280 LOC, 4 tests passing):
  - `state_machine_allows_legal_transitions_and_rejects_illegal_transition_exactly`
  - `orchestration_persists_reloads_and_transitions_with_updated_json_state`
  - `timeout_surfaces_real_epii_on_epii_meta_candidate_for_stalled_route`
  - `continuity_exposes_pending_integration_validation_suppression_and_verification`
- All four verification lines named; `recompose_pass` and `z_cycle_smoke` continue green (8+2 passing).
- **Disposition:** **Landed** — no action.

### 04.T4 — Review Core Governance Extension

- **Status:** done (admin)
- **Substrate evidence:** `Body/S/S5/epii-review-core/tests/review_governance.rs` (203 LOC, 3 tests passing):
  - `agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates`
  - `nara_gate_represents_anima_primary_metadata_without_forcing_human_resolution`
  - `review_history_persists_governance_metadata_and_linked_ids`
- Existing `review_inbox` tests (4 passing) cover human-required gate; `human_required_review_cannot_be_resolved_by_agent` preserves the hard invariant.
- **Disposition:** **Landed** — no action.

### 04.T5 — Typed Dry-Run Promotion and Compiler-Mutation Boundary

- **Status:** done (codex)
- **Substrate evidence:** `tests/improvement_loop.rs` (648 LOC, 10 tests passing) covers every T5 verification line:
  - `non_dry_run_promotion_is_blocked_until_review_and_compiler_mutation_are_wired`
  - `promote_is_dry_run_hen_plan_for_kept_challenger`
  - `promotion_requires_approved_review_resolution`
  - `promotion_requires_governance_category_compatible_with_destination`
  - `promotion_rejects_incompatible_destination_for_candidate_target`
  - `evaluation_keeps_challenger_when_weighted_evidence_wins` + `evaluation_discards_challenger_when_baseline_wins`
  - `evaluation_persists_source_refs_for_world_return_observations`
  - `kernel_evidence_is_advisory_and_never_final_judgement`
  - `propose_creates_generalized_challenger_without_ml_assumptions`
- Timestamp test is folded into `promote_is_dry_run_hen_plan_for_kept_challenger` (the deterministic Hen-plan path).
- **Disposition:** **Landed** — no action.

### 04.T6 — Epii Agent-Access and M5-4 Mediation Surface

- **Status:** done (codex)
- **Substrate evidence:** `Body/S/S5/epii-agent-core/tests/agent_access.rs` (593 LOC, 8 tests passing):
  - `snapshot_reads_real_review_and_autoresearch_state`
  - `typed_candidate_deposit_routes_real_candidate_and_snapshot_summarizes_without_body_leakage`
  - `governed_snapshot_counts_pending_human_validations_without_resolution_authority_leak`
  - `aletheia_improvement_deposit_creates_review_item_and_improvement_run`
  - `anima_review_deposit_creates_inbox_item_without_resolution_authority`
  - `m5_artifact_uri_validator_accepts_contract_namespaces_and_rejects_raw_paths`
  - `m5_workbench_snapshot_serializes_real_state_with_namespace_refs_and_no_body_leakage`
  - `m5_promotion_dry_run_returns_filtered_dto_from_real_review_and_improvement_state`
- `gateway_methods()` in `src/lib.rs:1141` lists the full set: `s5'.review.{submit,inbox,resolve,history}`, `s5'.improve.{status,propose,evaluate,promote,route.detail,spine.state,history}`, `s5'.epii.{status,deposit,deposit.typed_candidate,workbench.snapshot,workbench.promotion_dry_run,user.orientation,pratibimba.status,kairos.context}`.
- **Disposition:** **Landed** — no action.

### 04.T7 — M5-3 IDE/Workbench Contract Surface

- **SKIPPED per task directive.** Codex completed this tranche (claimedAt 21:44:01Z, completedAt 21:51:35Z, runId `20260601T214401Z-04-T7`). The lease has expired (leaseExpiresAt is null because the run completed), so the "fresh lease until ~23:44Z" in the task brief no longer applies — the work has already landed. Two of the eight agent_access tests (`m5_workbench_snapshot_*` and `m5_promotion_dry_run_*`) and the `gateway_methods()` entries `s5'.epii.workbench.snapshot` + `s5'.epii.workbench.promotion_dry_run` are the visible artifacts of T7's deliverable.
- **Disposition:** Not graded by this audit. **No recommended action.**

### 04.T8 — Non-Aletheia Pipeline Adapters

- **Status:** done (codex), completed 22:00:00Z (8 minutes before this audit started its tail)
- **Substrate evidence:** `Body/S/S5/epii-autoresearch-core/src/adapters.rs` (389 LOC) and `tests/non_aletheia_adapters.rs` (279 LOC, 4 tests passing):
  - `shacl_report_file_routes_repeated_anuttara_failure_and_blocks_downstream_route` (first wave — Anuttara SHACL)
  - `parashakti_metric_drift_report_preserves_metric_evidence` (first wave — Paraśakti embedding metric drift)
  - `nara_adapter_requires_quality_signal_not_volume_alone_and_keeps_handles_opaque` (third wave — Nara, Anima-primary gate + anti-frequency-bias)
  - `epii_on_epii_adapter_uses_real_review_history_and_preserves_human_recursive_gate` (Epii-on-Epii meta)
- The codex evidence is candid that **second wave** (Mahāmāyā kernel-trace/RL/federation/genetic, and Paramaśiva corpus/CPT/RAG) adapters are NOT yet landed — those depend on upstream metrics and corpus manifests that don't exist in this repo. The four wave-1 + wave-3 + Epii-on-Epii adapters cover the explicitly-named verification lines in the plan.
- **Caveat for the parent agent:** The plan text says "land adapters one at a time behind real signal inputs" and "second wave: Mahāmāyā ... Paramaśiva ... once upstream metrics and corpus manifests exist". So the missing wave-2 adapters are conditional on absent upstream substrate, not on Track 04 work. T8 is therefore "Landed-as-much-as-Track-04-can-land".
- **Disposition:** **Landed** (per the plan's own staging gate). **No recommended action.**

### 04.T9 — Full Spine Acceptance Scenario

- **Status:** pending
- **Substrate check:** No file matching the patterns `full_spine_*`, `acceptance_*`, `end_to_end_*`, or `production_shaped_*` exists in any of the three crates' `tests/` directories. `grep -rn "acceptance\|spine_accept\|full_spine\|end_to_end\|production_shaped" Body/S/S5/{epii-autoresearch-core,epii-review-core,epii-agent-core}/tests/` returns zero matches.
- **The four required scenarios** (Aletheia-disclosure, Anuttara-first cross-target, Nara Anima-primary, Epii-on-Epii recursive gate) exist individually as test cases scattered across T2/T6/T8 surfaces, but **no single integration test wires them into one production-shaped path** (surfacing → typed candidate → route → review item → improvement run → evidence evaluation → approved review → typed dry-run promotion → continuity hint → M5-3 snapshot).
- **The plan's regression requirement** ("older state files from Tranche 0 still load after all extensions") is partially covered by `tranche_04_t0_fixture_survives_typed_schema_migration_boundary` in `spine_schema.rs`, but a dedicated regression test that loads ALL Tranche 0 fixtures through ALL three crates after all extensions does not exist.
- **writeScopes (per plan.index.json):** `Body/S/S5/**` and `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`. The latter is currently a 181-line STUB ("`epi-cli/src/sync/mod.rs` — stub only") — T9 needs to update its "Implementation Plan" section to reference the live S5-core spine even though Notion/n8n/world sync execution remains future work.
- **Disposition:** **Forward** — genuine work remaining.

## Recommended ledger mark commands

These are the only ledger marks this audit would recommend. **Audit does NOT run them.** Codex (current T7/T8 finisher) or the user decides.

### No marks recommended for T0–T6, T7, T8

All currently marked `done` with green-cargo evidence reproduced live. **Leave as-is.**

### T9 recommended action: leave pending

No substrate exists to mark T9 done. **No mark command issued.** When T9 work begins, the future implementer (likely codex continuing the Track 04 lane, given T0/T1/T5/T6/T7/T8 ownership history) should:

1. Add `Body/S/S5/epii-autoresearch-core/tests/full_spine_acceptance.rs` (or split across the three crates) with the four required scenarios in one integration harness.
2. Add a fixture-regression test that explicitly loads every `Body/S/S5/fixtures/` JSON shape through all three crates' public APIs.
3. Update `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` "Current State in This Repo" section to reference the live `epii-autoresearch-core`/`epii-review-core`/`epii-agent-core` spine and clarify which canon-recognition gates ARE now represented in review metadata vs. which (Notion/n8n/Telegram dispatch) remain stubbed for a later sync track.

Recommended mark (only when the above lands and `cargo test` is green across all three crates):

```
# When T9 substrate lands, the owner should mark:
# (do not run from this audit)
node .codex/scripts/m-dev-mark.mjs --task 04.T9 --status done \
  --evidence "Added full_spine_acceptance integration harness with four scenarios (Aletheia-disclosure, Anuttara-first cross-target, Nara Anima-primary, Epii-on-Epii recursive gate); regression test loads all Tranche 0 fixtures through all three crates post-extension; S5-S5i-SYNC.md Current State section updated to reference live spine. cargo test --offline --manifest-path Body/S/S5/{epii-autoresearch-core,epii-review-core,epii-agent-core}/Cargo.toml all suites pass."
```

## Surprises and notes for the parent agent

1. **Track 04 is essentially done.** Nine of ten tranches are marked done with real evidence; one (T9) is genuinely pending. The parent agent's snapshot (T7 in_progress, T8/T9 pending) is stale by ~10 minutes; both T7 and T8 landed during the audit dispatch window.
2. **The T9 deliverable is real work, not a rubber stamp.** No "spine acceptance scenario" integration test exists today. The four required scenarios exist as individual unit/integration tests across T2/T6/T8 surfaces, but they are not wired through one production-shaped path.
3. **T9's secondary scope is doc-shaped.** `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` is in writeScopes and is currently a STUB. The plan does not require the SYNC implementation to land in T9 (that's "later sync implementation" per the Dependencies section), but it does require the SYNC doc to acknowledge that S5 canon-recognition gates are now representable in review metadata.
4. **T8 wave-2 (Mahāmāyā, Paramaśiva adapters) is deferred by design**, not omitted by accident. The plan explicitly stages second-wave adapters "once upstream metrics and corpus manifests exist". Codex's T8 evidence is honest about this.
5. **No tranche-vs-substrate drift detected.** Every named deliverable in the Track 04 plan that is marked `done` has reproducible, named test code at the path the plan claims. No tranches need to be recast because the substrate moved past the plan.
6. **64 cargo tests pass in 12 test binaries across the three S5 crates** with 0 failures and 0 ignored, fully offline. Track 04 substrate is in a healthy, shippable state.

---

**Marks NOT applied — codex (T7 owner, who has now also closed T8) or user decides.**
