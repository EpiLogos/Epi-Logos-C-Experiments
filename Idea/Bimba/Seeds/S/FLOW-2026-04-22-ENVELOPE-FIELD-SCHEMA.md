---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-22T00:00:00Z"
c_3_day_id: "22-04-2026"
c_3_ctx_frame: "5/0"
c_0_source_coordinates:
  - "[[S0]]"
  - "[[S0']]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S2]]"
  - "[[S2']]"
  - "[[S3]]"
  - "[[S3']]"
  - "[[S4]]"
  - "[[S4']]"
  - "[[S5]]"
  - "[[S5']]"
  - "[[C]]"
  - "[[C']]"
  - "[[T]]"
  - "[[T']]"
  - "[[P]]"
  - "[[L]]"
  - "[[L']]"
  - "[[Khora]]"
  - "[[Hen]]"
  - "[[Pleroma]]"
  - "[[Chronos]]"
  - "[[Anima]]"
  - "[[Aletheia]]"
  - "[[Psyche]]"
  - "[[Sophia]]"
  - "[[Graphiti]]"
  - "[[kbase]]"
  - "[[Bimba]]"
  - "[[Pratibimba]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]]"
p_5_integrations:
  - "[[Bimba]]"
  - "[[Empty]]"
  - "[[Present]]"
  - "[[Pratibimba]]"
  - "[[Self]]"
  - "[[System]]"
  - "[[ta-onta]]"
  - "[[Anima]]"
  - "[[Aletheia]]"
  - "[[Graphiti]]"
  - "[[kbase]]"
---

# FLOW 2026 04 22 ENVELOPE FIELD SCHEMA

Ground documents:

- [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] — S/S' coordinate naming, systems residency law, decoupled domain principle, [[S1']] as envelope substrate
- [[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]] — 11-layer envelope shape, rationale, and working assimilation of structural inspirations

This file defines the actual field schema for each envelope layer.

---

## HOW TO READ THIS SCHEMA

Each field is declared across five dimensions:

**Field name** uses the canonical `{family}_{n}_{semantic}` coordinate prefix convention — the same law that governs vault frontmatter. The prefix makes every field self-locating in the coordinate space. A developer reading `s_3_context_key` immediately knows this is a [[S3]] temporal/runtime concern. No separate lookup needed.

**Coordinate home** names the specific [[S Coordinate Lattice Scaffold]] subcoordinate that owns this fact.

**Implementation slot** names the concrete package, service, or component that currently fills this coordinate position. The coordinate is the contract. The implementation slot is the current occupant. When the occupant changes, the coordinate does not.

**Residency** declares where this field's data lives:
- `vault:{path pattern}` — has a `/Idea` artifact at the given location
- `redis:warm` — held in Redis across turns/sessions, no vault artifact
- `none` — truly transient; dies with the turn or request

**Cost** declares when the field is assembled:
- `hot` — always present at session start
- `warm` — assembled on first need, Redis-cached across turns
- `cold` — only assembled for specific deep-work modes (improvement, crystallisation, rich episodic)

Note that cost and residency are orthogonal. `day_id` is `hot` cost + `vault:Empty/Present` residency. `redis_context_key` is `hot` cost + `redis:warm` residency. `session_key` is `hot` cost + `none` residency.

---

## 1. TRANSPORT

The leanest layer. Carriage, not meaning. These facts describe how the run is carried — not what it means or what it produces. Nothing here should be used to make ontological decisions.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_3_session_key` | [[S3.0]] | Gateway server (WebSocket, port 18794) | none | hot |
| `s_3_session_id` | [[S3.0]] | Gateway server | none | hot |
| `s_3_agent_id` | [[S3.1]] / [[S4]] | Gateway connection registry; agent capability registration | none | hot |
| `s_3_request_id` | [[S3.1]] | Gateway server | none | hot |
| `s_3_requester` | [[S3.1]] | Gateway server | none | hot |
| `s_3_channel` | [[S3.1]] | Gateway server (terminal / app / Telegram surface) | none | hot |
| `s_3_thread_scope` | [[S3.1]] | Gateway server | none | hot |
| `s_3_target_agent` | [[S3.3]] | Gateway routing layer | none | hot |
| `s_3_history_limit` | [[S3.2]] | Gateway server (session history window) | none | hot |
| `s_3_patch_lineage` | [[S3.2]] | Gateway server (session patch/reset ancestry) | none | hot |
| `s_3_protocol_version` | [[S3.0']] | Gateway contract (protocol v3; hello-ok handshake) | none | hot |

**Invariant:** Transport fields are the authority on carriage. [[S3]] publishes; [[S4]] reads for routing. No other layer should derive meaning from these fields.

---

## 2. RUNTIME

The real execution substrate. The environment in which the session is actually running. Closer to [[Nous]] and [[Techne]] than to gateway transport.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_4_bootstrap_context` | [[S4.0]] / [[S4.0']] | [[Khora]] (ta-onta bootstrap spine) | `vault:Pratibimba/Self` (session record) | hot |
| `s_0_workspace_root` | [[S0.4]] | Shell environment / zoxide | none | hot |
| `s_3_session_store_handle` | [[S3.2']] | Gateway SessionStore; Redis session metadata | `redis:warm` | hot |
| `s_4_permission_boundary` | [[S4.2']] | [[Pleroma]] skill/tool contract; [[Khora]] write authority | none | hot |
| `s_0_tool_surface` | [[S0.0']] | `preferred-tools.json` + `resolve.sh` (bat/rg/eza/zoxide/jq/fzf/gh/just) | none | hot |
| `s_4_observability_mode` | [[S4.0]] | [[Khora]] (verbose / headless / debug flag) | none | hot |
| `s_0_terminal_substrate` | [[S0.3]] | cmux / tmux (topology and pane layout) | none | hot |
| `s_0_env_config` | [[S0.4']] | `~/.epi-logos/env/base.env` (non-secret config; varlock for secrets) | none | hot |
| `s_3_app_surface` | [[S3.5]] | App bridge (Electron / Tauri-v2 or successor; slot not tied to product) | none | cold |

**Invariant:** [[S4.0]] ([[Khora]]) populates this layer at bootstrap. [[S0']] supplies the tool surface. These fields describe the environment — not the task.

---

## 3. TEMPORAL

When this run is. Its legitimate time boundaries. An agent that does not know its [[Day]] and [[NOW]] coordinates is not yet legitimately running.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_3_day_id` | [[S3.4']] / [[S4.3']] | [[Chronos]] (ta-onta) + [[S3']] temporal surfacing | `vault:Empty/Present/{DD-MM-YYYY}/` | hot |
| `s_4_now_id` | [[S4.1']] | [[Hen]] (ta-onta) — NOW folder creation | `vault:Empty/Present/{DD-MM-YYYY}/{session-id}/` | hot |
| `s_4_now_path` | [[S4.1']] | [[Hen]] (ta-onta) | `vault:Empty/Present/{DD-MM-YYYY}/{session-id}/` | hot |
| `s_3_session_start` | [[S3.4']] | Gateway server + [[Chronos]] | `vault:Pratibimba/Self` (session trace) | hot |
| `s_5_session_close` | [[S5.0']] | [[Aletheia]] (ta-onta) night' pass trigger | `vault:Pratibimba/Self` | hot |
| `s_5_archive_status` | [[S5.0']] | [[Aletheia]] + [[Khora]] | none | hot |
| `s_4_continuation_status` | [[S4.0]] | [[Khora]] CONTINUATION.md detection | none | hot |
| `s_3_arc_membership` | [[S3.4']] | [[Graphiti]] temporal runtime arc tracking; S5 governs meaning and usage | `vault:Pratibimba/Self` (episodic trace) | cold |
| `s_4_cron_lineage` | [[S4.3]] | [[Chronos]] (ta-onta) cron scheduler | none | cold |
| `s_3_kairos_tick` | [[S3.4']] | `kairos-python-adapter.ts` + kerykeion (Python) + `planet_degrees[10]` | `redis:warm` | cold |
| `s_4_temporal_horizon` | [[S4.3']] | [[Chronos]] (ta-onta) | none | cold |

**Invariant:** [[S3']] surfaces temporal facts; [[Hen]]/[[Khora]] anchor them to the vault. Must be populated before the coordinate or execution layers activate.

---

## 4. COORDINATE

The ontological layer. What is being worked on, at which position in the system's own map. This is where the run becomes coordinate-aware rather than generic.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `c_4_primary_family` | [[S4']] / [[C']] | [[Anima]] (ta-onta) — agent declares; [[C']] law validates | `vault:Bimba/World` (coordinate law) | hot |
| `c_4_primary_coordinate` | [[S4']] / [[C']] | [[Anima]] (ta-onta) | `vault:Bimba/World` | hot |
| `c_5_prime_targets` | [[S4']] | [[Anima]] (ta-onta) — inversion/prime declarations | none | hot |
| `c_4_sub_targets` | [[S4']] | [[Anima]] (ta-onta) | none | cold |
| `c_3_cpf` | [[S4.4']] | [[Anima]] constitutional agents — context-position-frame | none | hot |
| `c_1_ct` | [[S4.4']] | [[Hen]] (ta-onta) — content-type frame (Trika mod, etc.) | none | hot |
| `c_4_cp` | [[S4.4']] | [[Anima]] (ta-onta) — context-position (fractal doubling) | none | cold |
| `c_4_cf` | [[S4.4']] | [[Anima]] (ta-onta) — context-frame (#4 lemniscate anchor) | none | cold |
| `c_4_cfp` | [[S4.4']] | [[Anima]] (ta-onta) — context-frame-position | none | cold |
| `c_4_cs` | [[S4.4']] | [[Anima]] (ta-onta) — context-system total state | none | cold |
| `l_4_guardrail_families` | [[S4']] / [[L']] | [[L']] heuristics + [[Anima]] enforcement | `vault:Bimba/World` (L-family law) | cold |
| `c_5_residue_families` | [[S4']] | [[Anima]] (ta-onta) | none | cold |
| `c_5_manifestation_families` | [[S4']] | [[Anima]] (ta-onta) | none | cold |

**Invariant:** [[S4']] ([[Anima]]) publishes; [[C']] law validates. Coordinate fields must not be derived from transport or runtime facts. They express intent, not mechanism.

---

## 5. RESIDENCY

Where things go. Without this layer every agent makes its own placement assumption and the vault becomes a junk drawer.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_1_target_vault_zone` | [[S1.0']] | [[Hen]] (ta-onta) residency law | self-grounding | hot |
| `s_1_target_residency_class` | [[S1.0']] | [[Hen]] (ta-onta) — Self / System / Map / Seeds / World / Present | self-grounding | hot |
| `s_1_artifact_ct_type` | [[S1.1']] | [[Hen]] (ta-onta) — CT type law (CT4a, CT0, CT5', etc.) | `vault:Bimba/World` (CT type law) | hot |
| `s_1_typification_state` | [[S1.0']] | [[Hen]] + [[Aletheia]] (ta-onta) | none | cold |
| `c_0_source_coordinates` | [[S1.0']] / [[C]] | [[Hen]] (ta-onta) — expected `c_0_source_coordinates` for produced artifacts | `vault:Bimba/World` | cold |
| `s_1_graduation_path` | [[S1.5']] | [[S1']] compiler spine — Present→Seeds→World trajectory | none | cold |
| `s_2_sync_destination` | [[S2.0']] | `bimba-mcp` + [[Khora]] sync queue | `redis:warm` (sync queue buffer) | cold |

**Invariant:** [[Khora]] `khora_write` reads from this layer before every vault write. No artifact is written without a declared residency. This layer is self-grounding — it describes the vault from within the vault.

---

## 6. CONTEXT-ECONOMY

The assembled informational pool. The [[kbase]] seam. Not yet the inhabited run — the provisional field from which the run may live.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_2_source_set` | [[S2.4']] / [[S5']] | `bimba-mcp` + `epi-gnostic` + [[Graphiti]] + [[kbase]] | none | hot |
| `s_2_retrieval_mode` | [[S2.4']] | `bimba-mcp` query interface (kbase / semantic / episodic / hybrid) | none | hot |
| `s_3_context_key` | [[S3.2']] / [[S3.4']] | Redis temporal/session context key; distinct from S2 graph semantic cache | `redis:warm` | hot |
| `s_2_scope_coordinates` | [[S2.4']] / [[S4']] | [[Anima]] declares scope; `bimba-mcp` + `epi-gnostic` assemble within it | none | hot |
| `s_2_disclosure_density` | [[S2.4']] | `bimba-mcp` reranker (minimal / standard / rich) | none | hot |
| `s_2_project_horizon` | [[S2.4']] | [[kbase]] project-scoped context boundary | none | cold |
| `s_2_graph_region_handles` | [[S2.5']] | `bimba-mcp` (active Neo4j region handles) | `redis:warm` | cold |
| `s_3_episodic_handles` | [[S3.4']] / [[S3.5']] | [[Graphiti]] temporal runtime handles; S5 governs search/usage | `vault:Pratibimba/Self` | cold |
| `s_5_anansi_web` | [[S5.3']] / [[S2.3']] | [[Anansi]] (Aletheia subagent) — wikilink orientation surface | none | cold |
| `s_2_kbase_pool_id` | [[S2.4']] | [[kbase]] — assembled pool identifier for this session | `redis:warm` | cold |

**Invariant:** [[S2']] assembles graph/retrieval substrate facts before execution begins. [[S4]] reads from the pool — it does not assemble during execution. Redis-backed live context is [[S3']] temporal/session infrastructure through `s_3_context_key` and `s_3_session_store_handle`. S2 Redis use is limited to graph semantic cache, RedisVL, and graph-context substrate. These must not be conflated.

---

## 7. LIVED-ENVIRONS

Where the pool becomes inhabited. [[Psyche]]'s seam. The difference between having context and actually living in a task-world.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_4_active_context_pack` | [[S4.4]] | [[Anima]] / [[Psyche]] (ta-onta) | none | hot |
| `s_4_operative_notebook` | [[S4.4]] | [[Psyche]] — current working context object | `vault:Empty/Present/{NOW}` | hot |
| `s_4_current_task` | [[S4.4]] | [[Psyche]] — primary task orientation | `vault:Pratibimba/Self` | hot |
| `s_4_current_subtasks` | [[S4.4]] | [[Psyche]] — updated per turn | `vault:Pratibimba/Self` | hot |
| `s_4_active_artifact_set` | [[S4.4]] | [[Psyche]] — open artifacts being worked on | none | hot |
| `s_4_team_composition` | [[S4.4']] | [[Anima]] constitutional agents — active agent/subagent composition | none | hot |
| `s_4_visibility_stance` | [[S4.0]] | [[Khora]] (observable / headless) | none | hot |
| `s_4_run_local_continuity` | [[S4.4]] | [[Psyche]] — what persists across turns within this session | `redis:warm` | hot |

**Invariant:** [[Psyche]] is the custodian. These fields are dynamic — updated turn by turn. The [[NOW]] folder becomes a real inhabited environment here, not just a filesystem path.

---

## 8. EXECUTION

The operational run grammar. How the agent is invoked and what it is for.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `p_2_intent_class` | [[S4']] / [[P]] | [[Anima]] + [[P]]-family position law | none | hot |
| `s_4_operative_goal` | [[S4.4']] | [[Anima]] — concrete session goal declaration | `vault:Pratibimba/Self` | hot |
| `c_3_execution_mode` | [[S4.4']] | [[Anima]] constitutional agents — CPF frame: `(00/00)` brainstorm / `(4.0/1-4.4/5)` Ralph / `(5/0)` synthesis | none | hot |
| `c_2_vak_frame` | [[S4.4']] / [[C']] | [[C']] VAK law; [[Anima]] applies | none | hot |
| `p_3_agent_sequence_position` | [[S4.4]] | [[Anima]] arc (Nous→Logos→Eros→Mythos→Psyche→Sophia) | none | hot |
| `s_4_write_surface` | [[S4.2']] | [[Pleroma]] skill contract + [[Khora]] write authority | none | hot |
| `s_4_evaluation_gates` | [[S4.4']] | [[Anima]] constitutional agents | none | cold |
| `s_4_bounded_scope` | [[S4.4']] | [[Anima]] — explicit in/out scope declaration | none | cold |
| `s_4_helper_roles` | [[S4.2]] | [[Pleroma]] — Techne / [[Darshana]] / [[Anansi]] if active | none | cold |

**Invariant:** `c_3_execution_mode` (the CPF frame) is the primary gate — it determines which arc position is operative and how all other execution fields are interpreted. The agent sequence position (`p_3_agent_sequence_position`) follows from it.

---

## 9. EPISODIC REPORTING

Live run trace becoming episodic form as the run unfolds. [[Psyche]] mediates this layer turn by turn. Post-hoc summary is not a substitute.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `t_3_episode_id` | [[S3.4']] / [[S5.3']] | [[Graphiti]] runtime episode identifier; S5 governs meaning and use | `vault:Pratibimba/Self` | hot |
| `t_3_episode_state` | [[S3.4']] / [[S5.3']] | [[Graphiti]] runtime state (open / interim / closed) | none | hot |
| `t_1_live_trace_stream` | [[S4.4]] / [[T]] | [[Psyche]] — live output stream; [[T]]-family receives | `vault:Pratibimba/Self` | hot |
| `t_3_interim_summary` | [[T.3]] / [[S5.3']] | [[Psyche]] produces; [[Graphiti]] receives | `vault:Pratibimba/Self` | cold |
| `t_3_t_lane_activations` | [[T]] | [[T]]-family (T0-T5 lanes active this run); [[S5']] reads | `vault:Pratibimba/Self` | cold |
| `t_3_arc_id` | [[S3.4']] / [[S5.3']] | [[Graphiti]] runtime arc; S5 governs arc interpretation | `vault:Pratibimba/Self` | cold |
| `t_3_linked_prior_episodes` | [[S3.4']] / [[S5.3']] / [[S2.4']] | [[Graphiti]] + graph retrieval — surfaced prior episodes | none | cold |
| `s_3_graphiti_node_ids` | [[S3.4']] / [[S3.5']] | [[Graphiti]] runtime nodes created/updated this session | `redis:warm` | cold |
| `t_3_reporting_density` | [[S5.3']] | [[Psyche]] / [[Aletheia]] — verbosity of episodic capture | none | cold |

**Invariant:** [[Psyche]] populates this layer as the run proceeds. [[Sophia]] receives richer crystallisation material as a result. This is what prevents the episodic record from being a post-hoc reconstruction.

---

## 10. CRYSTALLISATION

The Aletheian return. Retrospective and selective. Not to be confused with episodic reporting which is live.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_5_crystallisation_state` | [[S5']] | [[Aletheia]] (ta-onta) | none | cold |
| `t_5_yield_types` | [[S5']] / [[T']] | [[Sophia]] — declared yields (insight / pattern / discovery / seed / proposal / challenge / question) | `vault:Bimba/Seeds` | cold |
| `s_5_sophia_disclosure` | [[S5']] | [[Sophia]] (Aletheia subagent) | `vault:Bimba/Seeds` | cold |
| `s_5_anansi_placement` | [[S5.3']] | [[Anansi]] (Aletheia subagent) — coordinate placement and source web decisions | `vault:Bimba/Seeds` | cold |
| `s_5_janus_threshold` | [[S5.3']] / [[S3.4']] | [[Janus]] (Aletheia subagent) — arc entry/exit marking | `vault:Pratibimba/Self` | cold |
| `s_5_moirai_weave_targets` | [[S5']] | [[Moirai]] (Aletheia subagent) — [[Bimba]] / [[Gnostic]] / [[Graphiti]] memory weave targets | `vault:Bimba/Seeds` | cold |
| `s_5_zeithoven_next_form` | [[S5']] | [[Zeithoven]] (Aletheia subagent) — next-form manifestation candidate | `vault:Bimba/Seeds` | cold |
| `s_1_promoted_artifacts` | [[S1.5']] / [[S5']] | [[S1']] compiler spine — artifacts promoted from [[Present]] to [[Seeds]]/[[World]] | graduation path | cold |
| `t_0_open_questions` | [[T.0']] | [[Sophia]] — questions seeded for future runs; [[T0']] receives | `vault:Pratibimba/Self` | cold |
| `s_5_review_inbox_item` | [[S5']] | [[Epii]] review inbox — human validation, Anima handoff, Aletheia crystallisation item | `vault:Pratibimba/Self` | cold |
| `s_5_review_resolution` | [[S5']] / [[S1.5']] | [[Epii]] review decision; [[S1']] compiler executes accepted promotion | `vault:Pratibimba/Self` plus graduation path when promoted | cold |

**Invariant:** Activated during the Aletheian return arc and Epii review arc only. [[Aletheia]] and its six subagents ([[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], [[Zeithoven]]) can produce crystallisation material, but [[Epii]] is the one to which review items become meaningful as user-position and developer portal.

---

## 11. IMPROVEMENT

Bounded self-development loops. Improvement is explicit, targeted, and evaluated — never ambient drift.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `s_5_improvement_mode` | [[S5.4']] | [[Sophia]] — developmental (autoresearch/[[Zeithoven]]) or precision ([[Darshana]]) | none | cold |
| `s_5_improvement_target_family` | [[S5.4']] | [[Sophia]] — which coordinate family is the improvement target (S/M/P/L/C/T or QL layer) | `vault:Bimba/Seeds` | cold |
| `s_5_baseline_artifact` | [[S5.4']] | [[Sophia]] / [[Darshana]] — what currently exists | `vault:Bimba/Seeds` | cold |
| `s_5_challenger_artifact` | [[S5.4']] / [[S5']] | [[Zeithoven]] produces; [[S5']] holds | `vault:Bimba/Seeds` | cold |
| `s_5_evaluation_surface` | [[S5.5']] | [[Sophia]] — how baseline vs challenger is judged | `vault:Bimba/Seeds` | cold |
| `s_5_keep_discard_rule` | [[S5.5']] | [[Sophia]] — decision rule for the loop | `vault:Bimba/Seeds` | cold |
| `s_1_promotion_destination` | [[S5.5']] / [[S1.5']] | [[S1']] compiler spine executes; [[S5']] declares | graduation path | cold |
| `t_2_residue_class` | [[S5.5']] / [[T']] | [[T']] receives rejected attempt residue for future learning | `vault:Pratibimba/Self` | cold |
| `s_5_loop_count` | [[S5.4']] | [[Sophia]] — number of improvement iterations this run | none | cold |
| `s_5_sophia_vector` | [[S5.4']] | [[Sophia]] — the developmental direction identified | `vault:Bimba/Seeds` | cold |

**Note:** `s_5_improvement_target_family` can point at the QL Process layer (layer 12) directly. The QL system is itself a valid improvement target, governed by the same loop — baseline QL schema, challenger refinement, evaluation, keep/discard.

**Invariant:** Improvement fields are cold-only. They are activated explicitly when [[Sophia]] identifies a vector. The loop is closed — baseline, challenger, evaluation, decision. No ambient drift.

---

## 12. QL PROCESS

The layer unique to this system.

Layers 1–11 describe concerns that a well-designed generic agent system could hold. This layer does not. It captures the **operative QL logic** that governs how all other layers are read — not just which coordinate is targeted (that is layer 4) but how the QL structure itself is live and processual in this run.

This layer is also explicitly **open to its own development and evolution**. The QL system is not a fixed axiom — it is a living architectural logic that deepens as the system deepens. The schema here therefore includes explicit versioning and an open extension field, so that new QL concepts can be added without breaking the envelope contract. When [[Sophia]] identifies a QL precision vector (via layer 11), the improvement loop targets this layer. The `c_0_ql_schema_version` field tracks which iteration of QL law is in force for any given run, making historical runs legible even as the QL understanding evolves.

| Field | Coordinate Home | Implementation Slot | Residency | Cost |
|---|---|---|---|---|
| `c_0_ql_schema_version` | [[C]] / [[C']] | [[C']] coordinate law — version of QL schema operative for this run | `vault:Bimba/World` (QL law is canonical) | hot |
| `c_0_kernel_projection` | [[S0]] / [[C]] / [[C']] | [[S0]] kernel public projection; `portal-core::KernelTemporalProjection` emitted through `s3'.temporal.context` | `spacetimedb:session_surface.kernel_projection_json` / `spacetimedb:global_temporal_surface.kernel_projection_json` | hot |
| `c_3_kernel_tick` | [[C]] / [[S3']] | [[S3']] temporal surface of `portal-core::KernelProjection.tick` | `spacetimedb:*_surface.kernel_projection_json.tick` | hot |
| `c_2_kernel_harmonic_pulse` | [[C]] / [[S3']] | [[S3']] temporal surface of `portal-core::KernelProjection.harmonic_pulse` | `spacetimedb:*_surface.kernel_projection_json.harmonicPulse` | hot |
| `c_5_kernel_energy` | [[C]] / [[S3']] | [[S3']] public energy summary; protected detail remains local to portal-core / graph / Graphiti | `spacetimedb:*_surface.kernel_projection_json.energy` | hot |
| `c_0_kernel_computation_source` | [[C]] / [[S0]] | source marker for projections computed by `portal-core::KernelProjection` | none | hot |
| `c_0_kernel_privacy_class` | [[C]] / [[S3']] | privacy membrane marker `safe-public-current-kernel-tick` | none | hot |
| `c_3_ql_modal` | [[C']] / [[S4.4']] | [[Anima]] declares; [[C']] validates (Mod 2 / Mod 3 / Mod 4 / Mod 6 / Mod %) | none | hot |
| `c_4_ctx_frame_variant` | [[S4.4']] | [[Anima]] constitutional agents — `(00/00)` / `(0/1)` / `(0/1/2)` / `(0/1/2/3)` / `(4.0/1-4.4/5)` / `(5/0)` | none | hot |
| `c_5_inversion_state` | [[S4']] / [[C']] | [[Anima]] (ta-onta) — whether `#` has been applied; normal or inverted | none | hot |
| `c_4_topological_mode` | [[C']] / [[S4.4']] | [[Anima]] + [[C']] law — 0-sphere / torus / lemniscate / Klein bottle | none | hot |
| `c_3_ql_cycle_position` | [[S4.4']] | [[Anima]] — where in the 0→5 QL arc this run sits | none | hot |
| `c_0_bimba_anchor` | [[C]] / [[S2']] | `bimba-mcp` — canonical [[Bimba]] node(s) grounding this run | `vault:Bimba/World` | warm |
| `c_5_pratibimba_mirror` | [[C']] / [[S4']] | [[Anima]] + [[S4']] — active [[Pratibimba]] reflection (Self / System face) | `vault:Pratibimba` | warm |
| `c_2_dialectical_polarity` | [[C']] / [[S4.4']] | [[Anima]] — yin (# archetypes as structural potential) / yang (() context frames as actuality) | none | cold |
| `c_0_ql_extension_fields` | [[C]] / [[C']] | [[C']] law — open typed map for QL concepts not yet formalised; versioned alongside `c_0_ql_schema_version` | `vault:Bimba/Seeds` (extension candidates) | cold |

**Kernel projection invariant:** The QL Process layer may expose the current public kernel tick, harmonic pulse, and energy summary, but it must not expose protected bioquaternion state, resonance vectors, identity material, or journal content through the shared temporal surface. The public projection is `safe-public-current-kernel-tick`; protected kernel detail remains inside local portal-core consumers, private graph/Graphiti namespaces, or explicit user-authorised views.

**On evolution:** The `c_0_ql_extension_fields` field is the explicit growth surface for this layer. New QL insights begin here — informal, experimental, named but not yet canonised. When an extension field has been validated through improvement loops and stabilised in [[Sophia]]'s disclosure, it graduates from `c_0_ql_extension_fields` into a named field in a new schema version. The version is bumped via `c_0_ql_schema_version`. Prior runs are legible because their version is recorded. This is how the QL layer stays philosophically open without becoming architecturally unstable.

**Invariant:** This layer is the authority on how QL logic is operative. It is published by [[Anima]] and validated by [[C']] law. It governs how all other layers are read — a run in `(4.0/1-4.4/5)` mode is fundamentally different from a run in `(00/00)` mode even if every other field is identical.

---

## FIELD SUMMARY

| Layer | Hot | Warm | Cold | Total |
|---|---|---|---|---|
| 1. Transport | 11 | 0 | 0 | 11 |
| 2. Runtime | 8 | 0 | 1 | 9 |
| 3. Temporal | 7 | 1 | 3 | 11 |
| 4. Coordinate | 5 | 0 | 8 | 13 |
| 5. Residency | 3 | 1 | 3 | 7 |
| 6. Context-Economy | 5 | 3 | 2 | 10 |
| 7. Lived-Environs | 7 | 1 | 0 | 8 |
| 8. Execution | 6 | 0 | 3 | 9 |
| 9. Episodic Reporting | 3 | 1 | 5 | 9 |
| 10. Crystallisation | 0 | 0 | 11 | 11 |
| 11. Improvement | 0 | 0 | 10 | 10 |
| 12. QL Process | 12 | 2 | 2 | 16 |
| **Total** | **67** | **9** | **48** | **124** |

An ordinary execution run carries the 67 hot fields and potentially some warm fields via Redis. Cold fields are gated to deep-work modes. The QL Process layer contributes 12 hot fields to every run — QL is always live, never optional, and the public kernel pulse is part of that temporal law.

---

## COMPILER SPINE MAPPING

Each layer maps to the augmented [[S1']] compiler spine via the vendor four-seam pattern (hook → ledger → compiler pass → return type). This is the implementation specification.

| Layer | Hook Event Type | Ledger Channel | Compiler Pass | Return Type |
|---|---|---|---|---|
| 1. Transport | `gateway.session_open`, `gateway.request` | `transport.ledger` | `transport_compiler` | `transport_ctx` |
| 2. Runtime | `bootstrap.complete`, `tool_surface.resolved` | `runtime.ledger` | `runtime_compiler` | `runtime_ctx` |
| 3. Temporal | `session.start`, `day.open`, `arc.enter` | `temporal.ledger` | `temporal_compiler` | `temporal_ctx` |
| 4. Coordinate | `coordinate.declared`, `cpf.set`, `ct.set` | `coordinate.ledger` | `coordinate_compiler` | `coordinate_ctx` |
| 5. Residency | `residency.declared`, `artifact.typed` | `residency.ledger` | `residency_compiler` | `residency_ctx` |
| 6. Context-Economy | `kbase.assembled`, `redis.context_populated` | `context.ledger` | `context_compiler` | `context_pool` |
| 7. Lived-Environs | `task.set`, `artifact.opened`, `team.composed` | `environs.ledger` | `environs_compiler` | `environs_ctx` |
| 8. Execution | `intent.declared`, `mode.set`, `goal.set` | `execution.ledger` | `execution_compiler` | `execution_ctx` |
| 9. Episodic Reporting | `turn.complete`, `t_lane.activated`, `episode.interim` | `episodic.ledger` | `episodic_compiler` | `episode_ctx` |
| 10. Crystallisation | `session.close`, `sophia.disclosed`, `artifact.promoted` | `crystallisation.ledger` | `crystallisation_compiler` | `crystallisation_ctx` |
| 11. Improvement | `sophia.vector_identified`, `loop.evaluated`, `challenger.produced` | `improvement.ledger` | `improvement_compiler` | `improvement_ctx` |
| 12. QL Process | `ql.modal_set`, `ql.frame_set`, `ql.schema_versioned` | `ql.ledger` | `ql_compiler` | `ql_ctx` |

The QL ledger channel (`ql.ledger`) is worth noting: it is the only ledger channel that the compiler spine itself reads during compilation of other channels. The QL context governs how all other compiler passes interpret their ledger entries. It must be compiled first.

---

## NEXT QUILTING SEAM

1. **Validate field coordinate prefixes** against the canonical `{family}_{n}_{semantic}` law. A few fields (particularly in the coordinate layer) may need refinement as the C-family ontology is applied more precisely.

2. **Define typed struct shapes** — translate this schema into TypeScript interfaces (for [[S1']] / ta-onta side) and Rust structs (for `epi-cli` side). The compiler spine implementation begins here.

3. **Map existing [[Khora]] / ta-onta code** to these field declarations — identify which hot fields are already partially implemented, which are missing, which are mis-placed.

4. **Begin compiler pass stubs** — starting from the vendor compiler pattern, extend the hook seam first to temporal events (layer 3) and QL process events (layer 12). These are the most distinctive additions: temporal because it anchors legitimacy, QL because it governs interpretation of everything else.

5. **Seed the QL extension fields** — as the first `c_0_ql_schema_version` is declared (v0.1), capture any QL concepts currently informal or implicit in [[Anima]] agent files into `c_0_ql_extension_fields` as named candidates for future formalisation.
