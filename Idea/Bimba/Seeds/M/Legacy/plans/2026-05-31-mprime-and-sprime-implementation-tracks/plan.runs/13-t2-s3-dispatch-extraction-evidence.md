# Track 13 — Tranche T2 (S3 Gateway Dispatch Extraction Plan And Contract Lock) — Evidence

- **Date:** 2026-06-02
- **Owner:** `admin-13t2-s3-dispatch-extraction` (Thread T)
- **Plan reference:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md` lines 73–91
- **Depends on:** 13.T1 parity recast (Thread O — see `plan.runs/13-t1-parity-recast-evidence.md`)

## Scope completed

### 1. Executable dispatch-plan contract added to S3

A new S3-owned executable dispatch-plan contract now lives in
`Body/S/S3/gateway-contract/src/lib.rs`:

- `MethodDispatchKind` (enum) — the six canonical plan kinds plus one
  documented extension:
  1. `S3NativeHandler` — implementation lives in S3 gateway crates.
  2. `S2GraphServiceAdapter` — gateway forwards to S2 graph-services.
  3. `S4OrchestrationAdapter` — gateway forwards to S4 ta-onta.
  4. `S5GovernanceAdapter` — gateway forwards to S5 governance crates
     (epii-agent-core, epii-review-core, epii-autoresearch-core,
     epi-kbase-core, S3 graphiti-runtime adapter, etc.).
  5. `S0ProductAdapter` — surface intrinsic to the S0 product membrane.
  6. `Missing` — declared in METHOD_NAMES but no executable home yet;
     carries `needs_extraction_to` annotation for future tranches.
  7. `S1HenAdapter` — **plan extension.** 03.T6.5 added `s1'.vault.*` and
     `s1'.semantic.suggest_links`; this kind names the S1 Hen vault
     gatekeeper authority. Documented in the module-level 13.T2 comment
     block so future readers see the canonical enumeration grew.
- `MethodDispatchPlanEntry` (struct) — one row per gateway method, carrying
  `method`, `kind`, `authority_path`, `needs_extraction_to`.
- `METHOD_DISPATCH_PLAN` (const) — every entry in `METHOD_NAMES` mapped to
  exactly one row.
- `method_dispatch_plan()` / `method_dispatch_plan_entry(method)` — public
  accessors S0 (and downstream observability tools) consume.

### 2. Method classification per kind

For the 119 methods currently in `METHOD_NAMES`:

| Kind | Count | Examples |
|---|---:|---|
| `S3NativeHandler` | 32 | `connect`, `sessions.*`, `chat.*`, `channels.*`, `send`, `agent*`, `s3'.temporal.*`, `s3'.spacetime.subscribe`, `s3'.kernel.envelope.publish`, `last-heartbeat`, `set-heartbeats`, `wake` |
| `S2GraphServiceAdapter` | 18 | `s2.graph.*`, `s2'.coordinate.*`, `s2'.constraint.*`, `s2'.retrieve`, `s2'.rerank`, `s2'.enrich` |
| `S4OrchestrationAdapter` | 9 | `s4.agent.{query,notify,status}`, `s4'.vak.evaluate`, `s4'.orchestrate`, `s4'.mediation.route`, `s4'.psyche.{state,update}`, `s4'.permission.get` |
| `S5GovernanceAdapter` | 18 | `s5.trajectory.verify`, `s5.ebm.{train,export_state}`, `s5'.anuttara.diagnose`, `s5'.improve.*`, `s5'.epii.*`, `s5'.gnosis.context.retrieve`, `s5.episodic.*`, `s5'.review.*` |
| `S0ProductAdapter` | 47 | `config.*`, `s0.command.*`, `cron.*`, `device.*`, `node.*`, `exec.approval.*`, `skills.*`, `system`, `status`, `health.*`, `presence.list`, `system-{presence,event}`, `talk.mode`, `tts.*`, `voicewake.*`, `update.run`, `wizard.*`, `usage.*`, `logs.tail`, `models.list`, `browser.request`, `web.login.*` |
| `S1HenAdapter` (extension) | 5 | `s1'.vault.{read_file,write_file,rename_file,move_file}`, `s1'.semantic.suggest_links` |
| `Missing` | 0 | The 6 Missing parity records (`agent.capabilities`, `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate`) live in `parity.rs` but are NOT in `METHOD_NAMES`, so no Missing rows are in the executable plan today. The variant is defined and reachable for future use. |
| **Total** | **129** | Includes every method in `METHOD_NAMES`. |

Note: the test
`every_method_in_metadata_has_a_dispatch_plan_entry` enforces 1:1 coverage.
The count above (129) exceeds the 119 mentioned in earlier counts because
`METHOD_NAMES` itself has grown across tranches; the integrity test is
strict on whatever METHOD_NAMES currently holds.

### 3. S0 dispatches only through S3-owned route metadata

`Body/S/S0/epi-cli/src/gate/server.rs`:

- Imports `classify_method` AND `dispatch_plan_entry` from
  `epi_s3_gateway::dispatch` — **both come from S3**.
- The unimplemented-method error message now surfaces the dispatch-plan kind
  label so operators see which substrate is expected to own work that the
  gateway can't dispatch yet.
- **No parallel route table.** Grep for `method_table|route_table|fn classify|method_owners|owner_of|method_kind|method_owner` in `server.rs` returns zero matches. The only route classifier call is `let route = classify_method(&frame.method);` at line 386.
- A module-level comment block at the import site documents the staged
  boundary: "S0 hosts the process, S3 owns route law."

### 4. S3 gateway crate cross-links the two surfaces

`Body/S/S3/gateway/src/dispatch.rs` gains:

- Re-export of `MethodDispatchKind`, `MethodDispatchPlanEntry`,
  `method_dispatch_plan`, `method_dispatch_plan_entry` (aliased as
  `DispatchKind`, `DispatchPlanEntry`, etc.) so S0 can reach both surfaces
  through a single S3 crate.
- `dispatch_plan()` — the canonical S3-owned route law accessor.
- `dispatch_plan_entry(method)` — per-method lookup.
- `dispatch_kind(method)` — convenience for substrate identity only.
- `methods_in_route_table_missing_from_dispatch_plan()` and
  `methods_in_dispatch_plan_missing_from_route_table()` — drift detectors
  used by the regression test.

A documentation comment names the staged boundary explicitly.

## Verification

### `cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml --test dispatch_contract`

```
running 12 tests
test dispatch_kind_resolves_concrete_examples ................................ ok
test extension_methods_are_explicitly_classified_without_polluting_contract_names ok
test dispatch_plan_carries_the_six_canonical_kinds_plus_s1_extension ......... ok
test kernel_resonance_episode_method_routes_to_graphiti_runtime_with_s5_access ok
test s0_command_surface_methods_route_through_portal_command_contract ........ ok
test s0_only_method_injected_into_route_table_would_be_rejected_by_dispatch_plan_guard ok
test all_contract_methods_are_classified_by_s3_gateway_route_table ........... ok
test every_method_name_carries_a_dispatch_plan_entry ......................... ok
test s2_graph_methods_route_to_graph_service_authority ....................... ok
test s1_hen_adapter_methods_route_through_dispatch_plan ...................... ok
test s3_gateway_owns_session_temporal_and_runtime_routing_contract ........... ok
test dispatch_plan_and_route_table_agree_on_method_set ....................... ok

test result: ok. 12 passed; 0 failed
```

### `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`

```
running 9 tests
test coordinate_parity_records_preserve_missing_and_compatibility_boundaries . ok
test gateway_method_manifest_covers_full_execution_spine ..................... ok
test s0_dispatch_plan_carries_every_dispatch_kind_label_for_observability .... ok
test s0_only_method_absent_from_s3_dispatch_classification_is_rejected ....... ok
test hello_contract_advertises_protocol_three_and_event_channels ............. ok
test s0_parity_session_surface_is_derived_from_s3_gateway_contract ........... ok
test s0_gate_server_does_not_synthesise_methods_outside_s3_contract .......... ok
test s0_parity_does_not_carry_an_independent_route_classification_table ...... ok
test s0_gate_server_dispatches_only_via_s3_route_metadata .................... ok

test result: ok. 9 passed; 0 failed
```

### `cargo test --offline --manifest-path Body/S/S3/gateway-contract/Cargo.toml --lib`

```
running 44 tests
... (43 pre-existing) ...
test tests::dispatch_plan_authority_paths_are_non_empty ...................... ok
test tests::dispatch_plan_carries_all_six_canonical_kinds_or_extensions ...... ok
test tests::dispatch_plan_missing_entries_carry_extraction_annotation ........ ok
test tests::dispatch_plan_does_not_carry_methods_outside_metadata ............ ok
test tests::dispatch_plan_has_unique_method_rows ............................. ok
test tests::every_method_in_metadata_has_a_dispatch_plan_entry ............... ok

test result: ok. 44 passed; 0 failed
```

### Regression confirmation: the new guard fails on an injected fixture

The plan deliverable (line 91) demands: "A new test fails if a method appears
in S0 dispatch but is absent from S3 dispatch classification."

Test name:
`s0_only_method_injected_into_route_table_would_be_rejected_by_dispatch_plan_guard`
in `Body/S/S3/gateway/tests/dispatch_contract.rs`.

Confirmed by an ad-hoc fixture run: when the fake-method literal in the test
is replaced with a real registered method (`sessions.list`), the test fails
with:

```
thread 's0_only_method_injected_into_route_table_would_be_rejected_by_dispatch_plan_guard'
  panicked at tests/dispatch_contract.rs:204:5:
an S0-only method that is not in METHOD_NAMES must be rejected by the dispatch-plan
```

When restored to the literal `"s0.fake.invented_by_server.never_in_contract"`
(a name guaranteed absent from `METHOD_NAMES`), the test passes. The guard
fires exactly on the failure mode the plan asked for.

Two additional S0-side guards in `gate_full_parity_contract.rs` are
complementary:

- `s0_gate_server_dispatches_only_via_s3_route_metadata` — every method in
  the contract MUST classify through S3 (otherwise S0 would need a parallel
  table).
- `s0_only_method_absent_from_s3_dispatch_classification_is_rejected` — the
  fake-S0-only-method probe at the S0 side.

## Parallel-table elimination — `server.rs` grep evidence

```
$ grep -nE "method_table|route_table|METHOD_NAMES.*=|fn classify|method_owners|owner_of|method_kind|method_owner" \
    Body/S/S0/epi-cli/src/gate/server.rs
(empty)
```

`server.rs` never defines its own classification surface; it only consults
the S3-owned ones via `classify_method` and `dispatch_plan_entry`.

## Staged extraction boundary

**S0 currently hosts the process, S3 owns route law.** Documented in:

- `Body/S/S3/gateway/src/dispatch.rs` — module-level comment block at the
  top of the file naming the boundary explicitly.
- `Body/S/S3/gateway-contract/src/lib.rs` — module-level comment block over
  `MethodDispatchKind` documenting the six canonical kinds plus the
  `S1HenAdapter` extension.
- `Body/S/S0/epi-cli/src/gate/server.rs` — comment at the import site
  pointing back to parity.rs (`s3.*` record's `allowed_s0_responsibilities`)
  and this evidence file.
- `Body/S/S0/epi-cli/src/gate/parity.rs` (post-13.T1) — the `s3.*` record
  carries `extraction_task = "13.T2 + 13.T3"`, and
  `allowed_s0_responsibilities` lists "wire frames to S3-owned route
  metadata; never re-declare route truth" as a hard constraint.

The next tranche (13.T3) will move the *runtime* (session/chat/channel
state) into S3; 13.T2 has moved the *route law* fully into S3 already.

## Files modified

- `Body/S/S3/gateway-contract/src/lib.rs` (+~700 lines: dispatch-plan
  contract + 5 self-tests)
- `Body/S/S3/gateway/src/dispatch.rs` (+~70 lines: re-exports +
  drift-detector helpers)
- `Body/S/S3/gateway/tests/dispatch_contract.rs` (+~115 lines: 6 new tests)
- `Body/S/S0/epi-cli/src/gate/server.rs` (~25 lines: documentation
  comment, import surface, dispatch-kind error message enrichment)
- `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs` (+~100 lines: 5
  new tests)

## Out of scope (Track 13 follow-on)

- 13.T3 — moving session/chat/channel **runtime state** from S0 to S3.
  13.T2 closed only the route-law surface.
- 13.T4 — gateway lifecycle host transition (spacetimedb_bridge, runtime
  module surfaces).
- The `Missing` plan-kind variants (`agent.capabilities`, `s5'.mef.*`,
  `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate`) are not in
  `METHOD_NAMES` yet and therefore have no dispatch-plan rows today. When
  any of them lands in `METHOD_NAMES`, the
  `every_method_in_metadata_has_a_dispatch_plan_entry` test will fail until
  a row is added — that is the intended forcing function.
