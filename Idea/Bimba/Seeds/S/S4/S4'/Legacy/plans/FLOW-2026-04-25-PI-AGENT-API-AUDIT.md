---
coordinate: "S3'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_day_id: "25-04-2026"
c_3_ctx_frame: "5/0"
c_0_source_coordinates:
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 24 ORIENTATION]]"
  - "[[S4']]"
  - "[[S5']]"
  - "[[S1']]"
---

# FLOW 2026 04 25 PI AGENT API AUDIT

> Systematic audit of the PI Agent API v0.1 (96 methods) against the 115-field envelope schema, S/S' residency and naming law, the current ta-onta tool inventory, the Anima/Epii split, the S1'Cx type-to-form system, and the kbase/bkmr surface.

---

## I. ENVELOPE FIELD COVERAGE MATRIX

Cross-reference of all 115 envelope fields against API v0.1 methods. Each field is marked:
- **✓** = clear API method populates it
- **~** = partial/implicit coverage
- **✗** = no API method

### Layer 1: Transport (10 fields) — 8✓ 1~ 1✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_3_session_key` | hot | `connect` response | ✓ |
| `s_3_session_id` | hot | `connect` response | ✓ |
| `s_3_request_id` | hot | wire protocol `id` field | ✓ |
| `s_3_requester` | hot | implicit in channel context | ~ |
| `s_3_channel` | hot | `s3.channel.*` | ✓ |
| `s_3_thread_scope` | hot | **NONE** | ✗ |
| `s_3_target_agent` | hot | `s3.message.route` | ✓ |
| `s_3_history_limit` | hot | **NONE** — should be `connect` param or `s3.session.patch` | ✗ |
| `s_3_patch_lineage` | hot | `s3.session.patch` implicit | ✓ |
| `s_3_protocol_version` | hot | `connect` response | ✓ |

**New field from [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]:** `s_3_agent_id` (hot) — covered by `connect` `agent_id` param. **Must be added to the envelope schema as field #116.**

**Corrections for v0.2:**
- Add `s_3_thread_scope` to `connect` params (thread routing context)
- Add `s_3_history_limit` to `connect` params or `s3.session.patch`

### Layer 2: Runtime (9 fields) — 4✓ 2~ 3✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_4_bootstrap_context` | hot | `s1'.injection` | ~ |
| `s_0_workspace_root` | hot | `s0.env` can read, no dedicated method | ~ |
| `s_3_session_store_handle` | hot | `s3.session.get` | ✓ |
| `s_4_permission_boundary` | hot | **NONE** | ✗ |
| `s_0_tool_surface` | hot | `s0.tool_surface` | ✓ |
| `s_4_observability_mode` | hot | **NONE** | ✗ |
| `s_0_terminal_substrate` | hot | `s0'.cmux.list` partial | ✓ |
| `s_0_env_config` | hot | `s0.env` | ✓ |
| `s_3_app_surface` | cold | No method needed (cold) | — |

**Corrections for v0.2:**
- Add `s_0_workspace_root` to `connect` response (gateway knows CWD)
- Add `s4'.permission` method or include in `connect` response
- Add `s4'.observability` method or include in `connect` response

### Layer 3: Temporal (11 fields) — 5✓ 1~ 5✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_3_day_id` | hot | `connect` response, `s3'.day.status` | ✓ |
| `s_4_now_id` | hot | **NONE** — critical hot gap | ✗ |
| `s_4_now_path` | hot | **NONE** — critical hot gap | ✗ |
| `s_3_session_start` | hot | `connect` response implicit | ✓ |
| `s_5_session_close` | hot | `s3'.day.close` | ✓ |
| `s_5_archive_status` | hot | **NONE** | ✗ |
| `s_4_continuation_status` | hot | **NONE** | ✗ |
| `s_5_arc_membership` | cold | `s3'.episodic.arc.status` | ✓ |
| `s_4_cron_lineage` | cold | `s3.session.get` partial | ~ |
| `s_3_kairos_tick` | cold | `s3'.kairos.fetch` | ✓ |
| `s_4_temporal_horizon` | cold | **NONE** | ✗ |

**Critical gap:** `s_4_now_id` and `s_4_now_path` are **hot** fields with no API method. These are the NOW folder identity — the agent's session workspace. Must be in `connect` response or `s3'.temporal.state`.

**Corrections for v0.2:**
- Add `now_id` and `now_path` to `connect` response and `s3'.temporal.state`
- Add `s4'.continuation.status` method
- Add `archive_status` to `s3'.day.status` response
- Move `s_5_session_close` coordinate home from [[S5.0']] to [[S3']] (the API correctly places it at `s3'.day.close`)
- Move `s_5_arc_membership` from [[S5.3']] to [[S3']] (consistent with temporal runtime consolidation)

### Layer 4: Coordinate (13 fields) — 4✓ 3~ 6✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `c_4_primary_family` | hot | `s4'.vak.evaluate` (not explicit in return) | ~ |
| `c_4_primary_coordinate` | hot | `s4'.vak.evaluate` (not explicit in return) | ~ |
| `c_5_prime_targets` | hot | **NONE** | ✗ |
| `c_4_sub_targets` | cold | **NONE** | ✗ |
| `c_3_cpf` | hot | `s4'.vak.evaluate` (returns cf_frame but not cpf) | ~ |
| `c_1_ct` | hot | `s4'.vak.evaluate` ct_type | ✓ |
| `c_4_cp` | cold | `s4'.vak.evaluate` cp_position | ✓ |
| `c_4_cf` | cold | `s4'.vak.evaluate` cf_frame | ✓ |
| `c_4_cfp` | cold | **NONE** | ✗ |
| `c_4_cs` | cold | `s4'.cs.state` | ✓ |
| `l_4_guardrail_families` | cold | **NONE** | ✗ |
| `c_5_residue_families` | cold | **NONE** | ✗ |
| `c_5_manifestation_families` | cold | **NONE** | ✗ |

**Corrections for v0.2:**
- Expand `s4'.vak.evaluate` response to include `primary_family`, `primary_coordinate`, `cpf`, `prime_targets`
- These are hot fields that the VAK evaluation must produce

### Layer 5: Residency (7 fields) — 5✓ 0~ 2✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_1_target_vault_zone` | hot | `s1'.residency.resolve` | ✓ |
| `s_1_target_residency_class` | hot | `s1'.residency.resolve` | ✓ |
| `s_1_artifact_ct_type` | hot | `s1.template`, `s1.frontmatter.get` | ✓ |
| `s_1_typification_state` | cold | **NONE** | ✗ |
| `c_0_source_coordinates` | cold | `s1.frontmatter.get` | ✓ |
| `s_1_graduation_path` | cold | `s1'.residency.resolve` | ✓ |
| `s_2_sync_destination` | cold | **NONE** | ✗ |

Residency layer is well-covered. Cold gaps are acceptable.

### Layer 6: Context-Economy (10 fields) — 7✓ 0~ 3✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_2_source_set` | hot | `s4'.context.assemble` | ✓ |
| `s_2_retrieval_mode` | hot | `s2'.retrieve` mode param | ✓ |
| `s_2_redis_context_key` | hot | `s3'.context.*` (RENAMED — see §II) | ✓ |
| `s_2_scope_coordinates` | hot | `s2'.retrieve` scope_coordinates | ✓ |
| `s_2_disclosure_density` | hot | `s2'.retrieve` disclosure_density | ✓ |
| `s_2_project_horizon` | cold | `s5'.kbase.search` project param | ✓ |
| `s_2_graph_region_handles` | cold | **NONE** | ✗ |
| `s_2_episodic_handles` | cold | `s3'.episodic.*` (MOVED — see §II) | ✓ |
| `s_5_anansi_web` | cold | **NONE** | ✗ |
| `s_2_kbase_pool_id` | cold | `s5'.kbase.pool` pool_id | ✓ |

### Layer 7: Lived-Environs (8 fields) — 2✓ 0~ 6✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_4_active_context_pack` | hot | `s4'.context.assemble` | ✓ |
| `s_4_operative_notebook` | hot | **NONE** — Psyche gap | ✗ |
| `s_4_current_task` | hot | **NONE** — Psyche gap | ✗ |
| `s_4_current_subtasks` | hot | **NONE** — Psyche gap | ✗ |
| `s_4_active_artifact_set` | hot | **NONE** — Psyche gap | ✗ |
| `s_4_team_composition` | hot | `s4'.team.compose/status` | ✓ |
| `s_4_visibility_stance` | hot | **NONE** | ✗ |
| `s_4_run_local_continuity` | hot | **NONE** — should be `s3'.context` | ✗ |

**This is the largest gap area.** Layer 7 (Lived-Environs) is [[Psyche]]'s domain and has 6 out of 8 hot fields uncovered. The API needs a `s4'.psyche` method group.

**Corrections for v0.2:**
- Add `s4'.psyche.state` → returns operative_notebook, current_task, subtasks, active_artifact_set, visibility_stance
- Add `s4'.psyche.update` → turn-by-turn update of Psyche fields
- `s_4_run_local_continuity` should use `s3'.context.set/get` (Redis-backed)

### Layer 8: Execution (9 fields) — 3✓ 1~ 5✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `p_2_intent_class` | hot | **NONE** — should be in vak.evaluate | ✗ |
| `s_4_operative_goal` | hot | **NONE** | ✗ |
| `c_3_execution_mode` | hot | `s4'.vak.evaluate` cf_frame | ✓ |
| `c_2_vak_frame` | hot | `s4'.vak.evaluate` | ✓ |
| `p_3_agent_sequence_position` | hot | `s4'.team.compose` implicit | ~ |
| `s_4_write_surface` | hot | **NONE** | ✗ |
| `s_4_evaluation_gates` | cold | **NONE** | ✗ |
| `s_4_bounded_scope` | cold | **NONE** | ✗ |
| `s_4_helper_roles` | cold | **NONE** | ✗ |

**Corrections for v0.2:**
- Add `p_2_intent_class` and `p_3_agent_sequence_position` to `s4'.vak.evaluate` response
- Add `s4'.goal.set/get` for `s_4_operative_goal`
- Add `s_4_write_surface` to `s4'.context.assemble` response

### Layer 9: Episodic Reporting (9 fields) — 5✓ 0~ 4✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `t_3_episode_id` | hot | `s3'.episodic.record` | ✓ |
| `t_3_episode_state` | hot | `s3'.episodic.arc.status` | ✓ |
| `t_1_live_trace_stream` | hot | **NONE** — Psyche live concern | ✗ |
| `t_3_interim_summary` | cold | **NONE** | ✗ |
| `t_3_t_lane_activations` | cold | `s4'.thought.list` | ✓ |
| `t_3_arc_id` | cold | `s3'.episodic.record` | ✓ |
| `t_3_linked_prior_episodes` | cold | `s3'.episodic.search` | ✓ |
| `s_5_graphiti_node_ids` | cold | `s3'.episodic.record` returns episode_id | ✓ |
| `t_3_reporting_density` | cold | **NONE** | ✗ |

### Layer 10: Crystallisation (9 fields) — 3✓ 0~ 6✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_5_crystallisation_state` | cold | `s4'.crystallise` | ✓ |
| `t_5_yield_types` | cold | **NONE** | ✗ |
| `s_5_sophia_disclosure` | cold | `s4'.crystallise` implicit | ✓ |
| `s_5_anansi_placement` | cold | **NONE** | ✗ |
| `s_5_janus_threshold` | cold | **NONE** | ✗ |
| `s_5_moirai_weave_targets` | cold | **NONE** | ✗ |
| `s_5_zeithoven_next_form` | cold | `s5'.improve.propose` | ✓ |
| `s_1_promoted_artifacts` | cold | `s5'.improve.promote` | ✓ |
| `t_0_open_questions` | cold | **NONE** | ✗ |

Crystallisation is entirely cold — gaps are acceptable for MVP. These will be populated by [[Sophia]]/[[Aletheia]] subagent cluster when implemented.

### Layer 11: Improvement (10 fields) — 7✓ 0~ 3✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `s_5_improvement_mode` | cold | `s5'.improve.status` | ✓ |
| `s_5_improvement_target_family` | cold | `s5'.improve.propose` | ✓ |
| `s_5_baseline_artifact` | cold | `s5'.improve.evaluate` baseline | ✓ |
| `s_5_challenger_artifact` | cold | `s5'.improve.evaluate` challenger | ✓ |
| `s_5_evaluation_surface` | cold | `s5'.improve.evaluate` criteria | ✓ |
| `s_5_keep_discard_rule` | cold | **NONE** — implicit in flow | ✗ |
| `s_1_promotion_destination` | cold | `s5'.improve.promote` destination | ✓ |
| `t_2_residue_class` | cold | **NONE** | ✗ |
| `s_5_loop_count` | cold | `s5'.improve.status` total_runs | ✓ |
| `s_5_sophia_vector` | cold | `s5'.improve.propose` direction | ✓ |

### Layer 12: QL Process (10 fields) — 8✓ 0~ 2✗

| Field | Cost | API Method | Status |
|---|---|---|---|
| `c_0_ql_schema_version` | hot | `s5'.ql.schema` | ✓ |
| `c_3_ql_modal` | hot | `s5'.ql.evaluate`, `s5'.mef.modal` | ✓ |
| `c_4_ctx_frame_variant` | hot | `s4'.vak.evaluate` cf_frame | ✓ |
| `c_5_inversion_state` | hot | `s5'.ql.evaluate` | ✓ |
| `c_4_topological_mode` | hot | `s5'.ql.evaluate` | ✓ |
| `c_3_ql_cycle_position` | hot | `s5'.ql.evaluate` | ✓ |
| `c_0_bimba_anchor` | warm | `s5.bimba.context` | ✓ |
| `c_5_pratibimba_mirror` | warm | **NONE** | ✗ |
| `c_2_dialectical_polarity` | cold | `s5'.ql.evaluate` | ✓ |
| `c_0_ql_extension_fields` | cold | `s5'.ql.schema` extension_fields | ✓ |

### Coverage Summary

| Layer | Total | ✓ | ~ | ✗ | Hot ✗ |
|---|---|---|---|---|---|
| 1. Transport | 10 | 8 | 1 | 1 | 1 |
| 2. Runtime | 9 | 4 | 2 | 3 | 3 |
| 3. Temporal | 11 | 5 | 1 | 5 | 4 |
| 4. Coordinate | 13 | 4 | 3 | 6 | 2 |
| 5. Residency | 7 | 5 | 0 | 2 | 0 |
| 6. Context-Economy | 10 | 7 | 0 | 3 | 0 |
| 7. Lived-Environs | 8 | 2 | 0 | 6 | 6 |
| 8. Execution | 9 | 3 | 1 | 5 | 4 |
| 9. Episodic | 9 | 5 | 0 | 4 | 1 |
| 10. Crystallisation | 9 | 3 | 0 | 6 | 0 |
| 11. Improvement | 10 | 7 | 0 | 3 | 0 |
| 12. QL Process | 10 | 8 | 0 | 2 | 0 |
| **Totals** | **115** | **61** | **8** | **46** | **21** |

**61 fields fully covered. 8 partially covered. 46 gaps (21 of which are hot).**

The 21 hot gaps cluster in two areas:
1. **Layer 7 Lived-Environs** (6 gaps) — [[Psyche]]'s domain has no API surface at all
2. **Layers 3+8 Temporal+Execution** (8 gaps) — NOW identity, continuation status, intent class, operative goal, write surface

---

## II. COORDINATE HOME CORRECTIONS

Per [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]], several fields change coordinate homes. The API v0.1 correctly reflects the new homes but the envelope schema (FLOW 2026-04-22) does not.

### Fields That Must Change Coordinate Home in the Envelope Schema

| Field | Old Home | New Home | Reason |
|---|---|---|---|
| `s_2_redis_context_key` | [[S2.4']] | [[S3']] | Redis unified under temporal runtime. **Rename to `s_3_context_key`** |
| `s_2_episodic_handles` | [[S2.4']] / [[S5.3']] | [[S3']] | Graphiti is temporal infrastructure. **Rename to `s_3_episodic_handles`** |
| `s_5_session_close` | [[S5.0']] | [[S3']] | Session close is a temporal concern. API correctly uses `s3'.day.close` |
| `s_5_arc_membership` | [[S5.3']] | [[S3']] | Episodic arcs are temporal. API correctly uses `s3'.episodic.arc.status` |
| `s_5_graphiti_node_ids` | [[S5.3']] | [[S3']] | Graphiti node IDs are temporal artifacts. API uses `s3'.episodic.record` |

### Field Name Corrections

| Old Name | New Name | Reason |
|---|---|---|
| `s_2_redis_context_key` | `s_3_context_key` | Follows coordinate home move to [[S3']] |
| `s_2_episodic_handles` | `s_3_episodic_handles` | Follows coordinate home move to [[S3']] |

### New Field

| Field | Home | Cost | Description |
|---|---|---|---|
| `s_3_agent_id` | [[S3']] | hot | Which agent instance produced this message. Populated by `connect` agent_id. |

This brings the total from 115 to **116 fields** (60 hot → **61 hot**).

---

## III. TA-ONTA TOOL → API METHOD MAPPING

### Clean Mappings (tool → API method, 1:1 or absorbed)

| Existing Tool | API Method | Notes |
|---|---|---|
| `khora_write` | `s1.write` | Clean |
| `khora_sync_queue_push` | `s1.write` sync_queue param | Absorbed into s1.write |
| `hen_template_invoke` | `s1.template` | Clean |
| `hen_frontmatter_validate` | `s1.frontmatter.validate` | Clean |
| `hen_property_set` | `s1.frontmatter.set` | Clean |
| `hen_hybrid_retrieve` | `s2'.retrieve` | Clean |
| `aletheia_gnosis_ingest` | `s2.gnostic.ingest` | Clean |
| `aletheia_gnosis_query` | `s2.gnostic.query` + `s2'.retrieve` | Splits into raw and governed |
| `aletheia_gnosis_enrich` | `s2'.enrich` | Clean |
| `aletheia_gnosis_status` | `s2.gnostic.status` | Clean |
| `techne_session_list` | `s3.session.list` | Clean |
| `techne_session_patch` | `s3.session.patch` | Clean |
| `chronos_day_init` | `s3'.day.open` | Clean |
| `chronos_archive_day` | `s3'.day.close` | Clean |
| `chronos_kairos_fetch` | `s3'.kairos.fetch` | Clean |
| `chronos_kairos_status` | `s3'.kairos.status` | Clean |
| `chronos_graphiti_day_arc` | `s3'.episodic.arc.open/close` | Absorbed |
| `vak_evaluate` | `s4'.vak.evaluate` | Clean |
| `anima_orchestrate` | `s4'.orchestrate` | Clean |
| `nous_disclose` | `s4'.context.assemble` | Renamed, expanded |
| `aletheia_thought_route` | `s4'.thought.route` | Clean |
| `aletheia_crystallise` | `s4'.crystallise` | Maps (but both are stubs) |
| `aletheia_episodic_record` | `s3'.episodic.record` | Moved to S3' |
| `aletheia_episodic_search` | `s3'.episodic.search` | Moved to S3' |
| `aletheia_episodic_arc_open` | `s3'.episodic.arc.open` | Moved to S3' |
| `aletheia_episodic_arc_close` | `s3'.episodic.arc.close` | Moved to S3' |
| `aletheia_episodic_arc_status` | `s3'.episodic.arc.status` | Moved to S3' |
| `aletheia_episodic_oracle_arc` | `s3'.episodic.arc.oracle` | Moved to S3' |
| `aletheia_episodic_mobius_arc` | `s3'.episodic.arc.mobius` | Moved to S3' |
| `aletheia_episodic_ingest_thoughts` | `s3'.episodic.ingest_thoughts` | Moved to S3' |
| `aletheia_episodic_logos_stage` | `s3'.episodic.record` (with QL metadata) | Absorbed |
| `bkmr_search` | `s5'.kbase.search` | Clean |
| `dispatch_parallel_agents` | `s4'.team.compose` + `s4'.orchestrate` | Composed |
| `dispatch_fusion_agents` | `s4'.team.compose` + `s4'.orchestrate` | Composed |

### Composite Mappings (tool spans multiple API methods)

| Existing Tool | API Methods | Notes |
|---|---|---|
| `khora_session_init` | `connect` + `s3'.day.open` + `s1.write` (NOW folder) | Bootstrap sequence splits across transport and temporal |
| `chronos_decan_check` | `s3'.kairos.fetch` + `s3'.episodic.arc.*` | Decan boundary → fetch + arc lifecycle |
| `aletheia_session_promote` | `s3'.context.*` + `s3'.episodic.*` | HOT→COLD promotion spans context and episodic |

### Orphaned Tools (no API equivalent)

| Tool | Assessment |
|---|---|
| `khora_sync_queue_flush` | **CRITICAL STUB** — needs its own API method: `s1.sync.flush` or `s2.graph.sync` |
| `aletheia_gnosis_notebook_create` | Gnosis notebook concept → no direct API need. Could be `s2.gnostic.notebook` |
| `aletheia_seed_refresh` | SEED.md generation → `s3'.day.open` seed_content param covers the injection, but generation needs: `s5'.seed.generate` |
| `aletheia_coordinate_map_update` | Coordinate map maintenance → `s2'.enrich` partially covers. May need `s2.graph.batch_update` |
| `hen_task_list` / `hen_task_complete` | Task management → Psyche concern. Needs `s4'.psyche.tasks` |
| `hen_search` / `hen_backlinks` | Vault search → `s1.search` covers basic. Backlinks need `s1.backlinks` |
| `web_search` / `web_fetch` | External web operations → outside coordinate system. Keep as tools, not API methods |
| `tmux_exec` / `cmux_exec` | Infrastructure → `s0'.cmux.*` covers cmux. tmux raw exec stays as tool |
| `graph_query` (Hen) | **HARD STUB** → `s2.graph.query` is the API equivalent. Hen's version should delegate |
| `epi_run` | Raw CLI → `s0.exec` covers |
| `context7` / `onecontext_inject` | Context injection → `s4'.context.assemble` absorbs the concern |
| `worktrunk_exec` / `tildone_dispatch` | External workflow tools → stay as Pleroma primitives, not API methods |
| `hen_status` | Agent status → `s4.agent.status` covers |

### Missing API Methods (for v0.2)

| Method | Coordinate | Justification |
|---|---|---|
| `s1.sync.flush` | S1/S2 | Drains khora sync queue to Neo4j — CRITICAL blocker (G1 from audit) |
| `s1.backlinks` | S1 | Wikilink backlink queries — used by Hen, no current API path |
| `s4'.psyche.state` | S4.4 | Returns all Layer 7 lived-environs fields |
| `s4'.psyche.update` | S4.4 | Turn-by-turn update of Psyche fields |
| `s4'.goal.set` | S4.4' | Sets operative goal for the session |
| `s5'.seed.generate` | S5' | SEED.md morning context generation |

---

## IV. ANIMA/EPII SEPARATION ASSESSMENT

### Correctly Separated

| Concern | Agent | API Prefix | Assessment |
|---|---|---|---|
| VAK evaluation, CF routing | Anima | `s4'.vak.*` | ✓ Correct |
| Team composition, orchestration | Anima | `s4'.team.*`, `s4'.orchestrate` | ✓ Correct |
| CS state machine | Anima | `s4'.cs.*` | ✓ Correct |
| Thought routing (T-buckets) | Anima/Aletheia | `s4'.thought.*` | ✓ Correct |
| Crystallisation trigger | Anima/Aletheia | `s4'.crystallise` | ✓ Correct |
| User notification | Anima/Aletheia | `s4'.notify_user` | ✓ Correct |
| Context assembly | Anima/Nous | `s4'.context.assemble` | ✓ Correct |
| Bimba map navigation | Epii | `s5.bimba.*` | ✓ Correct |
| M' functions | Epii | `s5.m.*` | ✓ Correct |
| MEF lens application | Epii | `s5'.mef.*` | ✓ Correct |
| QL evaluation | Epii | `s5'.ql.*` | ✓ Correct |
| Kbase/bkmr | Epii | `s5'.kbase.*` | ✓ Correct |
| Improvement loop | Epii | `s5'.improve.*` | ✓ Correct |
| Gnosis governance | Epii | `s5'.gnosis.*` | ✓ Correct |
| Pedagogy | Epii | `s5'.explain/teach` | ✓ Correct |
| Session/day lifecycle | S3' shared | `s3'.*` | ✓ Correct |
| Episodic records | S3' shared | `s3'.episodic.*` | ✓ Correct |
| Kairos | S3' shared | `s3'.kairos.*` | ✓ Correct |

### Design Tension: Context Assembly Depends on Gnosis Strategy

`s4'.context.assemble` (Anima) pools results from kbase, gnosis, episodic, bimba, and vault. But `s5'.gnosis.strategy` (Epii) determines *how* to retrieve. The assembly flow is:

```
Anima calls s5'.gnosis.strategy → gets retrieval plan
Anima executes s2'.retrieve using that plan
Anima assembles pool into s4'.context.assemble
```

This is correct per the decoupled domain principle — Anima reads Epii's strategy via a cross-agent query (`s4.agent.query`), then executes locally. No direct cross-domain call. The API correctly reflects this.

### Potential Overlap: Crystallisation

`s4'.crystallise` (Anima/Aletheia) triggers crystallisation. `s5'.improve.*` (Epii) executes deep improvement. The handoff is: Anima calls `s4'.crystallise` → if `delegate_to_epii` is true, it fires `s4.agent.query` to Epii → Epii runs `s5'.improve.propose/evaluate/promote`.

This is clean. The trigger is Anima's. The execution is Epii's.

---

## V. S1'Cx TYPE-TO-FORM ASSESSMENT

The `s1'.type/form/canvas` API surface correctly represents the C0-C5 manifestation cycle from [[S1']]:

| C-Level | Manifestation | API Method | Assessment |
|---|---|---|---|
| C0 (Bimba/Ground) | Folder-ground, domain residency | `s1'.residency.resolve` | ✓ Correct |
| C1 (Form) | Flat Form in World | `s1'.form.birth`, `s1'.form.graduate`, `s1'.form.list` | ✓ Correct |
| C2 (Entity) | Frontmatter-bearing entity | `s1.frontmatter.*` | ✓ Correct |
| C3 (Process) | Canvas as frozen process | `s1'.canvas.create` | ✓ Correct |
| C4 (Type) | Type folder + MOC canvas index | `s1'.type.create`, `s1'.type.list` | ✓ Correct |
| C5 (Pratibimba) | Invoked artifact in Present/Pratibimba | `s1'.residency.resolve` graduation_path | ✓ Correct |

The graduation path (Present → Seeds → World) is correctly represented by `s1'.form.graduate` and `s1'.residency.resolve`.

**One gap:** No `s1'.type.delete` or `s1'.form.archive` method. These are non-essential for v0.2 but needed for completeness.

**The MOC canvas as C4 index** is correctly handled by `s1'.type.create` returning `moc_canvas_path`. The `s1'.canvas.create` method with `type: "moc"` is the creation path.

---

## VI. KBASE/BKMR SURFACE ASSESSMENT

The `s5'.kbase.*` surface correctly covers the context pooling that feeds [[Psyche]]'s lived-environs:

| Concern | API Method | Assessment |
|---|---|---|
| Semantic search | `s5'.kbase.search` | ✓ — wraps `bkmr_search` with coordinate awareness |
| Bookmark management | `s5'.kbase.add` | ✓ — basic CRUD |
| Multi-query pooling | `s5'.kbase.pool` | ✓ — produces `s_2_kbase_pool_id` |
| Health/status | `s5'.kbase.status` | ✓ |
| Pool → context assembly | `s4'.context.assemble` consumes kbase pool | ✓ |

**Data flow:**
```
s5'.kbase.pool (Epii) → pool_id
  ↓ consumed by
s4'.context.assemble (Anima) → s_4_active_context_pack
  ↓ consumed by
Psyche (Layer 7) → lived-environs
```

This is correct. The kbase pool is Epii-native (S5'), the assembly is Anima-native (S4'), and the consumption is Psyche (S4.4). Cross-agent communication goes through the S3' temporal runtime via `s4.agent.query`.

**Gap:** No `s5'.kbase.remove` or `s5'.kbase.update`. Non-essential for MVP.

---

## VII. CONSOLIDATED CORRECTIONS FOR v0.2

### A. New Methods to Add

| Method | Coordinate | Populates Fields | Priority |
|---|---|---|---|
| `s1.sync.flush` | S1/S2 | Unblocks G1 (sync queue drain) | CRITICAL |
| `s4'.psyche.state` | S4.4 | `s_4_operative_notebook`, `s_4_current_task`, `s_4_current_subtasks`, `s_4_active_artifact_set`, `s_4_visibility_stance` | HIGH |
| `s4'.psyche.update` | S4.4 | Same as above (write path) | HIGH |
| `s4'.goal.set` | S4.4' | `s_4_operative_goal` | HIGH |
| `s4'.permission.get` | S4.2' | `s_4_permission_boundary` | MEDIUM |
| `s5'.seed.generate` | S5' | SEED.md morning context | MEDIUM |
| `s1.backlinks` | S1 | Wikilink backlinks | LOW |

### B. Method Response Expansions

| Method | Add to Response | Populates Fields |
|---|---|---|
| `connect` | `now_id`, `now_path`, `workspace_root`, `agent_id`, `thread_scope`, `history_limit` | 6 hot fields |
| `s3'.temporal.state` | `now_id`, `now_path`, `archive_status`, `continuation_status` | 4 hot fields |
| `s4'.vak.evaluate` | `primary_family`, `primary_coordinate`, `cpf`, `prime_targets`, `p_2_intent_class` | 5 hot fields |
| `s4'.context.assemble` | `write_surface` | 1 hot field |

### C. Envelope Schema Revisions

1. Add field #116: `s_3_agent_id` (hot, [[S3']], `connect` agent_id)
2. Rename `s_2_redis_context_key` → `s_3_context_key`
3. Rename `s_2_episodic_handles` → `s_3_episodic_handles`
4. Move `s_5_session_close` coordinate home from [[S5.0']] → [[S3']]
5. Move `s_5_arc_membership` coordinate home from [[S5.3']] → [[S3']]
6. Move `s_5_graphiti_node_ids` coordinate home from [[S5.3']] → [[S3']]
7. Context-Economy invariant needs updating: "Two Redis instances" statement is now wrong. One Redis, unified at S3'.

### D. Method Count Update (v0.2)

| Coordinate | v0.1 | v0.2 | Delta |
|---|---|---|---|
| Connection | 2 | 2 | 0 |
| S0 / S0' | 5 | 5 | 0 |
| S1 / S1' | 14 | 16 | +2 (sync.flush, backlinks) |
| S2 / S2' | 10 | 10 | 0 |
| S3 / S3' | 26 | 26 | 0 |
| S4 / S4' | 15 | 20 | +5 (psyche.state/update, goal.set, permission.get, + expanded connect) |
| S5 / S5' | 24 | 25 | +1 (seed.generate) |
| **Total** | **96** | **104** | **+8** |

---

## VIII. GAP REGISTER RECONCILIATION

Cross-referencing the Track B gap register ([[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]):

| Gap ID | Description | API Status |
|---|---|---|
| G1 | `khora_sync_queue_flush` stub | → `s1.sync.flush` added to v0.2 |
| G2 | Bimba `bimbaCoordinate` → `coordinate` migration | Track A concern, not API |
| G3 | `cron.toggle` → `cron.update` name mismatch | Not in API scope (OmniPanel RPC, not agent API) |
| G4 | Telegram channel absent | → `s3.channel.register` covers the shape |
| G5 | `aletheia_crystallise` stub | → `s4'.crystallise` in API; still needs epi-cli backing |
| G6 | Duplicate day-init (Khora + Chronos) | Fixed in spine port (2026-04-24) |
| G7 | CLI audit trail fields missing | → Not in v0.2 scope (low priority) |
| G8 | Notion sync absent | → `s5.http` or external adapter, not v0.2 |
| G9 | cron.run/remove parity | → OmniPanel concern, not agent API |
| G10 | Anima VAK enforcement unknown | → Audit complete (B.5 addendum): VAK IS mechanically enforced |
| G11 | Darshana/Zeithoven design-only | → `s5'.improve.*` API defined; runtime is future |
| G12 | Graphiti sidecar startup | → `epi up` concern, not API |

---

## IX. VERDICT

The API v0.1 is **structurally sound**. The S/S' coordinate organisation is correct. The Anima/Epii split is properly reflected. The S1'Cx type-to-form system is well-modelled. The kbase/bkmr surface is complete.

**The two significant gaps are:**

1. **Psyche has no API surface.** Layer 7 (Lived-Environs) is the most dynamic layer — updated turn by turn — and has zero API methods. This is the biggest structural omission. Adding `s4'.psyche.state/update` closes it.

2. **Several hot fields are missing from method responses.** The `connect` and `s3'.temporal.state` responses don't return NOW identity. The `s4'.vak.evaluate` response doesn't return primary_coordinate or cpf explicitly. These are data omissions, not structural ones — fixed by expanding response types.

The corrections are **additive, not structural**. The v0.1 architecture holds. A v0.2 inline update (expanding response types and adding 8 methods) is sufficient. No separate v0.2 file needed.
