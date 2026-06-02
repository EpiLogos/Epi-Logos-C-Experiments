# 13.T10 — Final S/S' Modularity Report & Track 13 Closure

**Status:** done — closes Track 13 (S/S' Modularity And S0 Membrane Cleanup); closes the 110-task implementation plan.
**Date:** 2026-06-02
**Owner thread:** X (admin-13t10-final-release-gate)
**Plan section:** [13-s-sprime-modularity-and-s0-membrane-cleanup.md §T10](../13-s-sprime-modularity-and-s0-membrane-cleanup.md) (lines 240-257)

## 0. Summary

Track 13 reframed S0 from a coordinate authority into the **operator
membrane**: a CLI surface, a gateway process host, and a set of named
adapters into Body-native authorities (S1 Hen, S2 graph-services, S3
gateway/spacetime, S4 ta-onta, S5 review/autoresearch/agent cores). The
plan body's keystone now holds as enforceable contract:

> S0 may expose commands, parse CLI parameters, launch local services,
> hold user-facing compatibility aliases, and route gateway frames. It
> MUST NOT carry downstream service law (route definitions, runtime
> handlers, graph mutation, governance policy, vault writes that
> bypass Hen, or capability-matrix law).

The seven guardrail axes landed across T1-T9 (parity ledger recast, S3
dispatch contract, S3 runtime extraction, S3' SpaceTimeDB unification,
S2 graph adapter hardening, S4 capability-matrix annotations, S5
adapter classification, S1 Hen vault-write boundary, cross-layer
enforcement tests) now block re-introduction of S0-local service law
at compile/test time.

**Outcome:**
- 110 / 110 plan tasks done.
- 11 / 11 Track 13 tranches done.
- 4 explicit follow-up tranches catalogued in §5 below (extractions
  that anima's 09.T7 lane prevented during T6/T7, plus ledger drift
  surfaced by T9).
- 5 architectural decisions resolved by Track 13 (IOD-01, IOD-08,
  IOD-09, IOD-18, IOD-19) and 1 flagged as next-tranche (IOD-17
  runtime parity follow-up).

## 1. Method family ledger

The six canonical dispatch kinds Thread T defined for T2 (plus the
S1HenAdapter plan extension and Missing sentinel) frame the
per-family modularity story. For each family the report lists the
**current S0 responsibility** (what stays at the membrane), the
**Body-native authority** (the crate that owns the law), **remaining
compatibility shims** (named, with replacement target), and the
**removal timetable**.

Citations: `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json`
(Thread O); `Body/S/S3/gateway-contract/src/lib.rs::METHOD_DISPATCH_PLAN`
(Thread T); each Track 13 thread's evidence file.

### Family 1 — S3NativeHandler (32 methods)

Examples: `connect`, `sessions.*`, `chat.*`, `channels.*`, `send`,
`agent.*`, `s3'.temporal.*`, `s3'.spacetime.subscribe`,
`s3'.kernel.envelope.publish`, `last-heartbeat`, `set-heartbeats`,
`wake`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | Process host: `gate.server` (`Body/S/S0/epi-cli/src/gate/server.rs`) runs the Tokio listener + WS upgrade. Operator CLI: `epi gate start`/`status`/`stop` commands. Wire frames are translated through `classify_method` + `dispatch_plan_entry` from S3 (no parallel route table). |
| Body-native authority | `Body/S/S3/gateway/src/{dispatch,sessions,chat,spacetime,protocol,runtime}.rs` + `Body/S/S3/gateway-contract` (route metadata + envelopes). Session/chat runtime law moved S0 → S3 in 13.T3 (`sessions::HANDLER_OWNER = "S3.gateway.sessions"`; `chat::HANDLER_OWNER = "S3.gateway.chat"` — emitted as `handlerOwner` on every envelope). |
| Remaining compatibility shims | `gate/channels.rs` (390 LOC, 6 public fns) — classified `CompatibilityAdapter` because it depends on S0-private subprocess/env modules. Replacement target: an S3 channels runtime once Body-native subprocess + env-provider primitives exist (not in the 110-task plan). |
| Removal timetable | **Permanent-by-design** for the process host + CLI surface (`gate.server` retains "host gateway process" responsibility per inventory). **Wait-for-S3-process-binary** for the live host of `gate.server`: if/when a Body-native S3 binary becomes the long-term runtime (per plan §"Open Decisions" line 268), S0 would shell out to it; until then S0 is the process host. **Wait-for-S3-channels** for `gate/channels.rs`. |

### Family 2 — S2GraphServiceAdapter (18 methods)

Examples: `s2.graph.*`, `s2'.coordinate.{cypher,ingest,analyse_resonance,persist_analysis,aggregate_resonance}`,
`s2'.constraint.*`, `s2'.retrieve`, `s2'.rerank`, `s2'.enrich`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | CLI parsing (`GraphCmd`/`ConstraintCmd`/`ConstraintSeverityArg` enums); service invocation; JSON/human render dispatch; operator-CLI lifecycle (`epi graph bootstrap-dev` via `graph/dev.rs`; ingestion session JSON store via `graph/ingest.rs`). |
| Body-native authority | `Body/S/S2/graph-services` (cypher, constraint, analyse, anuttara, retrieval, semantic, schema, doctor, relationship_manager, sync_coordinator, lifecycle). 4 modules extracted S0 → S2 in 13.T5 (`cypher`, `constraint`, `analyse`, `anuttara` — ~1105 LOC moved). 3 S2 lifecycle helpers extracted to `epi_s2_graph_services::lifecycle` (live_graph_backed_evidence + LiveGraphBackedEvidence + maybe_refresh_semantic_embeddings). |
| Remaining compatibility shims | 22 1-line `pub use epi_s2_graph_services::*` modules under `Body/S/S0/epi-cli/src/graph/` (api, alignment_validator, bidirectional_sync, coordinate_array_parser, dataset_import, doctor, embeddings, link_enforcement, mapper, meta, redis_cache, relationship_manager, retrieval/{coordinate,graphrag,hybrid,mod}, schema, seed, semantic, semantic_cache, sync, sync_coordinator, sync_orchestrator, types). |
| Removal timetable | **Permanent-by-design** for the 22 re-export adapters (load-bearing as the operator membrane — guardrail axis 1 classifies them as `Annotated` adapters by construction). **Permanent-by-design** for `dev.rs` and `ingest.rs` (operator-CLI process-host substrate per the keystone). |

### Family 3 — S4OrchestrationAdapter (9 methods)

Examples: `s4.agent.{query,notify,status}`, `s4'.vak.evaluate`,
`s4'.orchestrate`, `s4'.mediation.route`, `s4'.psyche.{state,update}`,
`s4'.permission.get`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | `gate/anima.rs` (681 LOC) — 8 gateway-adapter surfaces, each stamping `S4_AUTHORITY_ORIGIN` into the returned payload so callers can verify S0 is mirroring S4. Two JSONL stores under `<gate_state_root>/s4/`: `agent-events.jsonl` (S3 session telemetry, re-derivable) and `mediation-routes.jsonl` (S4 orchestration evidence, re-derivable). |
| Body-native authority | `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` (route law); `Body/S/S4/plugins/pleroma/capability-matrix.json` (dispatch_tools, constitutional_agents, forbidden_authority, agent_capability_gates); `Body/S/S4/plugins/pleroma/skills/vak-evaluate/SKILL.md`; `Body/S/S4/pi-agent/agents/anima.md`. |
| Remaining compatibility shims | 6 S0-mirrored S4 constants/functions, each annotated with `// S4_AUTHORITY:` comment per 13.T6: `MOIRAI_HOST_CF`, `DISPATCH_TOOLS`, `route_outcome`, `route_agent_for_outcome`, `authority().forbidden`, `constitutional_agents()`. Duplicated because the gateway must enforce them before the call reaches S4. |
| Removal timetable | **Wait-for-S4-`s4'.mediation.capabilities.list`** (IOD-17 runtime parity). Once exposed, the 6 mirrors collapse into a single runtime fetch at gateway boot. Tracked as follow-up FU-T6-A in §5. |

### Family 4 — S5GovernanceAdapter (18 methods)

Examples: `s5.trajectory.verify`, `s5.ebm.{train,export_state}`,
`s5'.anuttara.diagnose`, `s5'.improve.*`, `s5'.epii.*`,
`s5'.gnosis.context.retrieve`, `s5.episodic.*`, `s5'.review.*`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | 14 thin-adapter surfaces in `gate/{review,improve,epii}.rs`, each delegating to S5 stores (`ReviewStore`, `ImprovementStore`, `EpiiAgentAccess`). Store-location helpers exposed (`STORE_SUBPATH`, `review_store_path`, `improvement_store_path`) so the gate-root layout `<state_root>/s5/{epii-review,epii-autoresearch}` is pinned. `gate/graphiti.rs` is a 5-line `pub use epi_s3_graphiti_runtime::{...}` re-export. `gnosis_context_retrieve` exposes the local `epi techne` surface (S0 stays as operator command; S5 owns governance via capability envelope; S2 owns storage substrate). |
| Body-native authority | `Body/S/S5/epii-review-core` (`ReviewStore`, `ReviewSubmission`, `ReviewInboxFilter`, `ReviewResolveRequest`); `Body/S/S5/epii-autoresearch-core` (`ImprovementStore`, `ProposeRequest`, `validate_approved_review`); `Body/S/S5/epii-agent-core` (`EpiiAgentAccess`, `DisclosureLevel`); `Body/S/S3/graphiti-runtime`. |
| Remaining compatibility shims | 2 S5-law-in-S0 sites flagged in code with `13.T7 follow-up` markers (anima held `Body/S/S5/**` during T7): (a) `gate/improve.rs::ensure_approved_review` — friendlier error-wording duplicate of S5 `validate_approved_review`; (b) `gate/epii.rs::capability_envelope` — per-agent capability matrix authored in S0 (`mayMutateIdentity` / `mayPromoteInterpretation` / `mayDepositReviewRequest` / `requiresEpiiReview` / `requiresHumanForIdentityMutation`). |
| Removal timetable | **Immediately removable** once Track 13's S5 follow-up lands (FU-T7-A, FU-T7-B in §5). `validate_approved_review` needs `pub` exposure (or `ImprovementStore::ensure_approved_review`); `capability_envelope` should move to `EpiiAgentAccess::capability_envelope(agent_id)`. |

### Family 5 — S0ProductAdapter (47 methods)

Examples: `config.*`, `s0.command.*`, `cron.*`, `device.*`, `node.*`,
`exec.approval.*`, `skills.*`, `system`, `status`, `health.*`,
`presence.list`, `system-{presence,event}`, `talk.mode`, `tts.*`,
`voicewake.*`, `update.run`, `wizard.*`, `usage.*`, `logs.tail`,
`models.list`, `browser.request`, `web.login.*`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | All of it. These are surfaces intrinsic to the S0 product membrane (operator CLI, device/cron/wizard/health/talk/voicewake/browser). |
| Body-native authority | `Body/S/S0/epi-cli` IS the canonical authority. The `s0.*` parity record carries `authority_path = "Body/S/S0/epi-cli"`. |
| Remaining compatibility shims | None applicable — S0 is the substrate. |
| Removal timetable | **Permanent-by-design.** Per the keystone, "S0 may expose commands, parse CLI parameters, launch local services". |

### Family 6 — S1HenAdapter (5 methods — plan extension)

Methods: `s1'.vault.{read_file,write_file,rename_file,move_file}`,
`s1'.semantic.suggest_links`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | `Body/S/S0/epi-cli/src/gate/s1_hen.rs` is the gateway implementation surface that fronts Hen. 14 S0 CLI vault paths audited in 13.T8: 6 classified `deprecated-local` (named replacement gateway methods, some landed, some deferred), 7 `governed-local` (template scaffolding — no inbound wikilinks to reconcile), 1 `out-of-scope` (env config write). |
| Body-native authority | `Body/S/S1/hen-compiler-core` (`wikilinks.rs`, `graph_promotion.rs`, `relation_inference.rs`, `property_intelligence.rs`, `artifact_evidence.rs`, `smart_env.rs`). Production-grade per ADR-05-010 substrate-truth table. |
| Remaining compatibility shims | 6 obsidian-cli arms in `vault/mod.rs` (`VaultCmd::{Create, FrontmatterSet, FrontmatterDelete, Move, Delete}` + `pasu::pasu_set`) annotated `# DEPRECATED ROUTE` with named replacement. |
| Removal timetable | **Mixed.** 2 landed (`s1'.vault.write_file` for `Create`, `s1'.vault.move_file` for `Move`). 4 await `s1'.vault.{update_frontmatter, delete_file, move_directory}` deferred surfaces — tracked as FU-T8-A in §5 with Track 03 T6.5 carry-forward dependency. **`archive_day` direct `fs::rename` carries a `TODO(IOD-19)`** awaiting `s1'.vault.move_directory`. |

### Family 7 — Missing sentinel (0 in METHOD_DISPATCH_PLAN; 6 in parity ledger)

Methods declared in `parity.rs` but not in `METHOD_NAMES`:
`agent.capabilities`, `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`,
`s5'.teach`, `s5'.seed.generate`.

| Axis | State (post-T10) |
|------|------------------|
| Current S0 responsibility | None — not declared executable. |
| Body-native authority | None yet — each requires a new Track-13.x or Track 09 tranche to land. |
| Remaining compatibility shims | None. |
| Removal timetable | **Permanent-pending-future-tranche.** These are roadmap surfaces, not modularity debt. The `Missing` variant remains a first-class citizen in the parity vocabulary so any future contract growth declares its absence honestly. |

## 2. Cross-walk parity counts (T9 reconciliation)

Per `Body/S/S3/gateway/tests/dispatch_contract.rs::t9_route_ownership_cross_walk`:

- `METHOD_NAMES.len()` = **154**
- `s3_only_methods()` = **18** (S3-direct or pre-match handshake)
- S0-dispatched ∩ METHOD_NAMES = **154 − 18 = 136**
- S0-dispatched route extensions (in addition to METHOD_NAMES): `nara.*`
  family (1 arm) + 3 `s5'.epii.*` extensions = **4 method strings**

All three sets (METHOD_NAMES, S3 classification, S0 dispatched) agree
under the four-axis assertion battery. Drift in any direction
surfaces here.

## 3. Inventory totals (post-Track-13)

From `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json`:

- 30 modules inventoried
- 2 `kernel-owner` (S0 IS authority)
- 18 `cli-adapter` (operator-CLI surface wrapping Body-native crate; long-term load-bearing) — *header field reads 17; **drift surfaced by Thread W T9 Finding 1**, tracked as FU-T9-A in §5*
- 8 `gateway-adapter` (S0 hosts process / route adapter glue)
- 1 `compatibility-shim`
- 1 `duplicated-service-law`
- 12 compatibility shims (transition tags) in the `compatibility_shims` array
- 4 temporary live hosts in `temporary_live_hosts`
- 3 duplicated-service-law surfaces in `duplicated_service_law`

## 4. Guardrail enforcement (T9 cross-layer tests)

These tests, once green in CI, prevent re-introduction of S0-local
service law:

| Axis | Test | Location |
|------|------|----------|
| 1. S0 downstream-law scanner | `s0_does_not_introduce_new_downstream_service_law` | `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` |
| 2. Route-ownership cross-walk | `t9_route_ownership_cross_walk::route_ownership_cross_walk_method_names_vs_s3_dispatch_vs_s0_dispatch` | `Body/S/S3/gateway/tests/dispatch_contract.rs` |
| 3. Graph ownership regression | `t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace` | `Body/S/S2/graph-services/tests/graph_runtime_extraction_contract.rs` |
| 4a. S4 ownership in S0 | `s4_governance_policy_not_introduced_in_s0` | `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` |
| 4b. S5 ownership in S0 | `s5_review_schemas_not_introduced_in_s0` | `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` |
| Negative fixture | `negative_fixture_is_correctly_rejected_by_s0_scanner` | `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` |

## 5. Follow-up tranche backlog

The threads that ran T0–T9 surfaced extractions that could not land
during the active lane (anima held `Body/S/S4/**` and `Body/S/S5/**`
for 09.T7 throughout the Track 13 window) or that depend on
coordinated cross-layer changes. Each is a concrete follow-up tranche
in its own right, named per thread + Track 13 tranche.

| FU id | One-line description | Target Body-native crate | Blocker |
|-------|----------------------|--------------------------|---------|
| **FU-T6-A** | Replace `MOIRAI_HOST_CF` literal in S0 `gate/anima.rs` with runtime fetch from `s4'.mediation.capabilities.list` | `Body/S/S4/ta-onta/S4-4p-anima` + `Body/S/S4/plugins/pleroma/capability-matrix.json` | S4 owner exposes `s4'.mediation.capabilities.list` (IOD-17 runtime-parity surface). |
| **FU-T6-B** | Replace `DISPATCH_TOOLS` list in S0 `gate/anima.rs` with runtime fetch of `capability-matrix.json:dispatch_tools[*].name` at gateway boot | same as FU-T6-A | same |
| **FU-T6-C** | Collapse `route_outcome` and `route_agent_for_outcome` into a single S4-canonical lookup via `capabilities.list` | same as FU-T6-A | same |
| **FU-T6-D** | Replace `authority().forbidden` mirror with runtime read of `capability-matrix.json:forbidden_authority` | same as FU-T6-A | same |
| **FU-T6-E** | Replace `constitutional_agents()` roster mirror with runtime read of `capability-matrix.json:constitutional_agents` | same as FU-T6-A | same |
| **FU-T7-A** | Promote `validate_approved_review` to `pub` (or add `ImprovementStore::ensure_approved_review(&self, id)`); S0 `gate/improve.rs::ensure_approved_review` delegates and drops the duplicate guard | `Body/S/S5/epii-autoresearch-core` | Anima's 09.T7 lane on `Body/S/S5/**` released. (09.T7 now done; ready to start.) |
| **FU-T7-B** | Move `gate/epii.rs::capability_envelope` to `EpiiAgentAccess::capability_envelope(agent_id) -> Value`; S0 calls into S5 helper | `Body/S/S5/epii-agent-core` | same — anima lane released. |
| **FU-T8-A** | Land deferred Track 03 T6.5 surfaces and migrate corresponding S0 obsidian-cli arms: `s1'.vault.{update_frontmatter, append_block, delete_file, move_directory}` + `s1'.semantic.{neighbors_of, search, by_block}` | `Body/S/S0/epi-cli/src/gate/s1_hen.rs` + `Body/S/S1/hen-compiler-core` | Track 03 T6.5 deferred-surface tranche; once landed, S0 `vault/mod.rs::VaultCmd::{FrontmatterSet, FrontmatterDelete, Delete}` + `pasu::pasu_set` route through gateway; `archive_day::fs::rename` is replaceable with `s1'.vault.move_directory`. |
| **FU-T9-A** | Refresh `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json::counts.*` to match the current per-classification reality (header reads `cli_adapter=17` but records sum to 18; `temporary_live_host_modules=2` but 0 modules carry that classification — those entries migrated to `gateway-adapter` after T2/T3/T4) so future T9 runs can re-enable the per-classification count audit | `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json` | None — inventory file is in S0 write zone; can land immediately. |
| **FU-T9-B** | Annotation-style normalisation pass: several `graph/` files carry lowercase `// S0 adapter:`; some pure-re-exports rely on the pure-re-export detector. Normalise all annotations to canonical `// S0 ADAPTER: Body/S/<...>` form | `Body/S/S0/epi-cli/src/graph/**` | None — purely an in-S0 cleanup; non-blocking. |

**Backlog total: 10 concrete follow-up tranches** across 4 lanes
(T6 / T7 / T8 / T9). FU-T6-* and FU-T8-A depend on cross-layer
substrate that must land first; FU-T7-A/B can start now (09.T7 done);
FU-T9-A/B can start now (S0-only).

## 6. Cross-references

- Plan body: [13-s-sprime-modularity-and-s0-membrane-cleanup.md](../13-s-sprime-modularity-and-s0-membrane-cleanup.md) §T0–T10 (lines 33–257).
- T0 inventory: [`Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json`](../../../../Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json) (Thread O / 13.T1 generated, inline T0 deliverable).
- T1 parity recast evidence: [`plan.runs/13-t1-parity-recast-evidence.md`](./13-t1-parity-recast-evidence.md).
- T2 S3 dispatch contract evidence: [`plan.runs/13-t2-s3-dispatch-extraction-evidence.md`](./13-t2-s3-dispatch-extraction-evidence.md).
- T3 S3 runtime extraction evidence: [`plan.runs/13-t3-s3-runtime-extraction-evidence.md`](./13-t3-s3-runtime-extraction-evidence.md).
- T4 S3' SpaceTimeDB bridge extraction evidence: [`plan.runs/13-t4-spacetimedb-bridge-evidence.md`](./13-t4-spacetimedb-bridge-evidence.md).
- T5 S2 graph adapter evidence: [`plan.runs/13-t5-s2-graph-adapter-evidence.md`](./13-t5-s2-graph-adapter-evidence.md).
- T6 S4 orchestration adapter evidence: [`plan.runs/13-t6-s4-orchestration-evidence.md`](./13-t6-s4-orchestration-evidence.md).
- T7 S5 adapter consolidation evidence: [`plan.runs/13-t7-s5-adapter-evidence.md`](./13-t7-s5-adapter-evidence.md).
- T8 S1/Hen vault-write boundary evidence: [`plan.runs/13-t8-s1-vault-hen-evidence.md`](./13-t8-s1-vault-hen-evidence.md).
- T9 cross-layer guardrails evidence: [`plan.runs/13-t9-cross-layer-guardrails-evidence.md`](./13-t9-cross-layer-guardrails-evidence.md).
- Operator runbook (§"S/S' Modularity Update — 2026-06-02"): [`Idea/Pratibimba/System/docs/operator-runbook.md`](../../../../Idea/Pratibimba/System/docs/operator-runbook.md).
- Architectural decisions: [`11-open-architectural-decisions.md`](../11-open-architectural-decisions.md) — IOD-01 / IOD-08 / IOD-09 / IOD-18 / IOD-19 marked resolved by Track 13 closure; IOD-17 runtime-parity follow-up flagged.
- Track 10 alpha-readiness report: [`plan.runs/10-t9-alpha-readiness-report-20260602T102311Z.md`](./10-t9-alpha-readiness-report-20260602T102311Z.md) — beta-blocker reclassification appended.

## 7. Resolved architectural decisions (cross-reference)

Per the per-IOD status lines added by this tranche to
`11-open-architectural-decisions.md`:

- **IOD-01** (S3 single WebSocket multiplexing) — resolved by Track 13
  T2/T3/T4: canonical S3-owned route table + dispatch envelope +
  unified `SpacetimeSubscriptionLifecycleEnvelope` + explicit
  `SpacetimeFallbackPolicy` with `silent-http-fallback-forbidden`
  sentinel.
- **IOD-08** (Graphiti runtime boundary) — resolved by Track 13 T7:
  `gate/graphiti.rs` is a pure `pub use epi_s3_graphiti_runtime::{...}`
  re-export; S3 runtime owns the substrate; S5 owns governance via
  capability envelope; S2 owns storage substrate. S0 emits
  `governance_owner: "S5'"` + `storage_substrate: "S2"` markers on
  every `epi techne` response.
- **IOD-09** (S5 state storage + `ReviewSource` metadata) — resolved
  by Track 13 T7: `<state_root>/s5/{epii-review,epii-autoresearch}`
  layout pinned via `STORE_SUBPATH` + `review_store_path` +
  `improvement_store_path`. Store-location tests prevent layout
  drift.
- **IOD-17** (capability-matrix three-way parity) — runtime parity
  follow-up flagged as next-tranche. T6 surfaced 6 S0-mirrored S4
  constants. Spec-time parity was already binding per ADR-05-011 §5;
  runtime parity awaits `s4'.mediation.capabilities.list`.
- **IOD-18** (Smart Connections via Hen `smart_env.rs`) — resolved by
  Track 13 T8: Track 03 T6.5's `s1'.semantic.*` methods confirmed
  landed; deferred surfaces (`neighbors_of`, `search`, `by_block`)
  catalogued in FU-T8-A.
- **IOD-19** (Hen vault-write gatekeeper) — resolved by Track 13 T8:
  Track 03 T6.5's `s1'.vault.{read_file, write_file, rename_file,
  move_file}` confirmed landed; wikilink-integrity fixture test
  (`t8_governed_rename_leaves_no_orphan_wikilinks`) proves rename
  reconciles `[[Source]]` → `[[Origin]]` end-to-end.

## 8. Cross-layer findings

One observation surfaced during the report that did not fit a single
thread's evidence file: **the `s0_membrane_guardrails` test crate
holds the entire S/S' modularity contract**. Of the 12 test files now
acting as cross-layer enforcement (`s0_membrane_guardrails.rs` + the
two appended modules in `dispatch_contract.rs` and
`graph_runtime_extraction_contract.rs` + 9 existing per-tranche
contract suites cited above), only the membrane guardrails crate is
a *negative* axis — i.e. the only one that would fail if S0 grew NEW
downstream service law. The other 11 are positive ownership /
extraction integrity tests. The membrane guardrails crate is
therefore the load-bearing CI gate; if it is ever marked `#[ignore]`
or removed, the entire S/S' modularity contract becomes a soft
recommendation. Operator runbook §11 (added by this tranche) cites
it as the canonical CI enforcement layer.

## 9. Verification (T10 close)

```
$ node .codex/scripts/m-dev-plan-assess.mjs --json \
    docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks
# summary.totalTasks: 110
# summary.done: 110 (this T10 mark closes the final tranche)
# Track 13 tasks: 11 / 11 indexed with correct dependsOn + writeScopes
#   13.T0 → 03.T3, 10.T9
#   13.T1 → 13.T0
#   13.T2 → 13.T1
#   13.T3 → 13.T2
#   13.T4 → 03.T3, 13.T3
#   13.T5 → 13.T4
#   13.T6 → 13.T5
#   13.T7 → 13.T6
#   13.T8 → 03.T6, 13.T7
#   13.T9 → 13.T8
#   13.T10 → 13.T9
```

T1–T9 evidence files all linked. Operator runbook + alpha readiness
report + open-decisions register updated. Inventory totals confirmed.
Follow-up backlog catalogued.

## 10. Closing — Track 13 closed; 110-task plan closed

The S0 membrane is now formally the operator membrane. Future work
routes to Body-native owners first (S1 / S2 / S3 / S4 / S5); S0 is
touched only when adapter or process work is required, and any new
S0 module under a law zone must pass the membrane guardrails axis 1
scanner.
