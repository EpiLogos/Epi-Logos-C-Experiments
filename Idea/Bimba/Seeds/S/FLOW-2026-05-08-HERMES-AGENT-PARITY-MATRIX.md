---
coordinate: "S/S' + M'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT1"
c_3_created_at: "2026-05-08T00:00:00Z"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[S0-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[2026-03-12-cli-coordinate-reorg]]"
---

# Flow 2026 05 08 Hermes Agent Parity Matrix

## Outcome

Nous Research's [[Hermes Agent]] (v0.13, MIT, vendored at `vendors/hermes-agent/`) is a battle-worn agentic harness with an opinionated but flat shape. Mapping its capability surface against the locked S/S' and M' architecture gives the build a concrete parity reference: where Hermes has shape worth porting at the contract level, where Epi-Logos is already structurally ahead by design, and where the same problem is being solved with categorically different topology. This artifact is the matrix view; the deeper-dive sections below are written against it rather than against Hermes alone, so every recommendation is anchored to a coordinate home.

The TUI/UX surface is the highest-leverage parity point. The PI-agent surfacing question (how an [[Anima]] / [[Epii]] conversation is rendered as chat in the [[epi portal]] centre `/` panel and the [[OmniPanel]] desktop centre, and how that chat shares contract with subagent traces, review-inbox events, Aletheia crystallisations, and Kairos shifts) is what this matrix is meant to make decidable.

## Source Material

**Hermes** (read-only vendored copy):

- `vendors/hermes-agent/run_agent.py` — 752 KB monolithic agent loop
- `vendors/hermes-agent/cli.py` — ~570 KB prompt_toolkit Python TUI (legacy)
- `vendors/hermes-agent/ui-tui/` — TS/Ink/React TUI (modern), bridged via `tui_gateway`
- `vendors/hermes-agent/tui_gateway/server.py` — JSON-RPC bridge between Ink and Python agent
- `vendors/hermes-agent/agent/`, `gateway/`, `gateway/platforms/`, `acp_adapter/`, `providers/`, `mcp_serve.py`, `cron/`, `tools/`, `plugins/`, `skills/`, `optional-skills/`, `web/`
- `vendors/hermes-agent/AGENTS.md` — 46 KB developer-facing agent guide
- `vendors/hermes-agent/plugins/memory/honcho/__init__.py` — dialectic memory plugin

**Epi-Logos** (seed/spec authority):

- [[S-SYSTEM-INDEX]] - cross-level harmonisation map
- [[S-AD-HOC-ROADMAP]] - build readiness, two-PI-agent steering
- [[S-SHARDING-TASK-LIST]] - active execution rail (Phases 1-3A live)
- [[S0-SPEC]] / [[S0']] - CLI ground and portal/topology law
- [[S3-SPEC]] - gateway/session/temporal context
- [[S4-SPEC]] - PI agent runtime, [[Anima]], [[Pleroma]] capability membrane
- [[S5-SPEC]] - Epii return, autoresearch, review, world-return services
- [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] - 12-layer envelope
- [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]] - dual-spine architecture
- [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] - shared typed contract

## Status Legend

| Symbol | Meaning |
|---|---|
| ✓ HAVE | Already specified and at least partially implemented in `Body/` |
| ◐ PARTIAL | Spec exists, gap named in [[S-SHARDING-TASK-LIST]] |
| + ADD | Hermes contract worth lifting; clean additive at coordinate home |
| ≠ DIFFERS | Same problem, structurally different solution; matrix should make ours legible |
| ▲ AHEAD | Epi-Logos has the category; Hermes has no analogue by design |
| ✗ N/A | Hermes has the feature but it does not apply to our scope |

## The Method-Level Substrate (Read Before the Matrices)

The S/S' coordinate associations name **capability areas**. The actual architectural shape — the typed contract beneath the associations — lives in four canonical FLOW documents plus four machine-checkable JSON contracts. Every row in Matrices A–E must be read against this substrate, because the parity question is not "which area" but **which typed method × which envelope field × which capability/contract entry**.

### The four canonical contract documents

| Artifact | What it locks | Counts |
|---|---|---|
| [[FLOW 2026 04 24 PI AGENT API v0.1]] | Coordinate-native method namespace; gateway routing rules; async / event push pattern; CLI parity | **100 methods** across 7 namespaces |
| [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] | 12-layer envelope; field residency + cost + implementation slot; compiler spine hook → ledger → pass → return | **118 fields** across 12 layers |
| [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] | Executable TypeScript type target; same types serve gateway WebSocket transport AND `epi-cli` direct calls | 100 methods + **8 envelope-gap methods** + 118 envelope field types |
| [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]] | Two-peer PI architecture; S3' as unified temporal runtime; decoupled domain principle | 2 PI agents, 3 tool surfaces, 1 shared substrate |

### PI Agent API v0.1 — namespace counts and gateway routing

| Namespace | Methods | Routed to | Primary consumer |
|---|---:|---|---|
| `connect`, `agent.capabilities` | 2 | gateway-internal | all clients |
| `s0.*`, `s0'.*` | 5 | local Rust (`epi-cli`) | all clients |
| `s1.*`, `s1'.*` | 14 | local Rust + `Hen` compiler | [[Anima]], [[Hen]], [[Khora]] |
| `s2.*`, `s2'.*` | 7 | Neo4j direct | all clients (raw graph substrate) |
| `s3.*`, `s3'.*` | 15 | gateway-internal (session store, Redis, SpacetimeDB, Graphiti) | all clients (temporal runtime) |
| `s4.*`, `s4'.*` | 15 | routed to [[Anima]] PI WebSocket | [[Anima]] native; [[Epii]] for observability |
| `s5.*`, `s5'.*` | 42 | routed to [[Epii]] PI WebSocket | [[Epii]] native; [[Anima]] via `agent.query` |
| **Total** | **100** | | |

S5/S5' is by far the largest because it carries Gnosis (3), Episodic (8), Bimba navigation, M' functions, MEF/QL, kbase, Epii review (4), autoresearch / improvement (10), pedagogy, and seed generation. This is where most parity work concentrates.

### The 12-layer envelope and where each lands

| Layer | Hot/Warm/Cold | Owner | Compiler ledger |
|---|---|---|---|
| 1. Transport | 11 / 0 / 0 | [[S3]] | `transport.ledger` |
| 2. Runtime | 8 / 0 / 1 | [[S0]] + [[S4]] | `runtime.ledger` |
| 3. Temporal | 7 / 1 / 3 | [[S3']] | `temporal.ledger` |
| 4. Coordinate | 5 / 0 / 8 | [[S4']] | `coordinate.ledger` |
| 5. Residency | 3 / 1 / 3 | [[S1']] | `residency.ledger` |
| 6. Context-Economy | 5 / 3 / 2 | [[S2']] + [[S5']] | `context.ledger` |
| 7. Lived-Environs | 7 / 1 / 0 | [[S4']] | `environs.ledger` |
| 8. Execution | 6 / 0 / 3 | [[S0]] + [[S4']] | `execution.ledger` |
| 9. Episodic | 3 / 1 / 5 | [[S3']] + [[S5]] | `episodic.ledger` |
| 10. Crystallisation | 0 / 0 / 11 | [[S5']] via [[S4.5']] | `crystallisation.ledger` |
| 11. Improvement | 0 / 0 / 10 | [[S5']] | `improvement.ledger` |
| 12. QL Process | 6 / 2 / 2 | [[S5']] + [[C']] | `ql.ledger` *(compiled first)* |
| **Total** | **61 / 9 / 48 = 118** | | |

The QL Process layer is operative to all others; its ledger is compiled first, and `c_0_ql_extension_fields` is the explicit growth surface for the system's own self-development.

### Decoupled domain principle (locked)

> A domain may only communicate with another domain through envelope fields. Direct cross-domain calls are architecture violations.

This applies between [[Anima]] (S4/S4') and [[Epii]] (S5/S5'). They are **peer PI instances**, not parent-child. Neither is a subagent of the other. Both subscribe to the [[S3']] temporal runtime as clients. Inter-agent communication propagates through envelope fields published into the shared substrate. The PI agent API is the concrete protocol for this principle. This shapes every Matrix C row.

### VAK is Anima's orchestration grammar (NOT one dimension per ta-onta extension)

Per the canonical [[VAK-HANDOVER]] (2026-02-19/20), the OMX VAK skill fork plan (2026-04-04), and the Anima VAK gate skill injection plan (2026-04-04):

VAK is the six-dimensional orchestration grammar that **[[Anima]] alone** evaluates per turn to assign coordinates to a task and route it. The dimensions are:

| VAK dimension | Values | Function |
|---|---|---|
| **CPF** | `(00/00)` dialogical \| `(4.0/1–4.4/5)` mechanistic | Polarity gate (pre-bifurcation vs autonomous) |
| **CT** | CT0 Relational, CT1 Definitional, CT2 Operational, CT3 Pattern, CT4 Contextual, CT5 Integrative | Content type / semantic phase |
| **CP** | 4.0 Ground / 4.1 Definition / 4.2 Operation / 4.3 Pattern / 4.4 Context / 4.5 Integration | Context position (fractal doubling within the lemniscate) |
| **CF** | `(00/00)` Nous \| `(0/1)` Logos \| `(0/1/2)` Eros \| `(0/1/2/3)` Mythos \| `(4.0/1–4.4/5)` Anima \| `(4.5/0)` Psyche \| `(5/0)` Sophia | Constitutional agent route |
| **CFP** | CFP0 Base / CFP1 P-Thread / CFP2 C-Thread / CFP3 F-Thread / CFP4 L-Thread / CFP5 B-Thread / Z | Thread pattern |
| **CS** | CS0 Full / CS1 Quick / CS2 Ground→Op / CS3 Through-Pattern / CS4 Context / CS5 Direct | Context-sequence path / Day-vs-Night' phase |

VAK lives in **[[Pleroma]] skills** (the OMX-forked skill body) at `Body/S/S4/plugins/pleroma/skills/`:

- Core VAK skills: `vak-coordinate-frame` (reference grammar), `vak-evaluate` (6-step evaluation pipeline), `anima-orchestration` (CF→agent routing + Epi-Claw dispatch matrix), `day-night-pass` (Day+Night' topology over P0'-P5')
- OMX-forked operational skills: `deep-interview` (Nous), `ralplan` / `plan` (Logos), `tdd` (Eros), `pipeline` / `team` (Anima), `ultraqa` (Sophia/Eros), `git-master` (Sophia), `bimba-populate`
- Plus the seven constitutional agent identity files at `.pi/extensions/ta-onta/anima/S4'/agents/{nous,logos,eros,mythos,anima,psyche,sophia}.md` with the canonical six-section structure: Rupa / Ontology / Frame Contract / Temporal / Capability / Sattva

The injection point: `extension.ts` `before_agent_start` hook loads `vak-coordinate-frame` + `vak-evaluate` + `anima-orchestration` into Anima's context at session start (per [[anima-vak-gate-skill-injection.md]] Task 3). Subagents spawned via `dispatchAgent()` get their entitled skills appended to the system prompt from each agent's `skills:` frontmatter (Task 2). This is **the active VAK injection pattern**, not abstract design language.

**The ta-onta extensions are infrastructure**, not VAK dimensions:

| ta-onta extension | What it owns | Relation to VAK |
|---|---|---|
| S4.0' Khora | Bootstrap, session identity, write authority, visibility | Provides write surface for VAK output |
| S4.1' Hen | Vault membrane, CT templates, frontmatter schema, residency | Persists VAK-tagged artifacts |
| S4.2' Pleroma | Skills surface, capability matrix, OMX fork | **HOLDS the VAK skills themselves** |
| S4.3' Chronos | Day/NOW/Kairos timing | Provides temporal context for CS phase |
| S4.4' Anima | VAK evaluation, CF dispatch, team composition, Psyche state | **EVALUATES VAK** and dispatches via CF code |
| S4.5' Aletheia | UX membrane, T-bucket routing, crystallisation trigger | Receives output from VAK-driven runs |

The current S4-SPEC §B "S4'Cx Projection" table that maps each ta-onta extension to a single VAK dimension (S4.0'→CPF, S4.1'→CT, S4.2'→CP, S4.3'→CF, S4.4'→CFP, S4.5'→CS) is a misreading and needs correction (logged in Spec Subtasks below). The cardinality coincidence (six extensions, six dimensions) does not make them the same thing.

**Epii's review inbox is filesystem-backed at `Idea/Empty/Present/{DD-MM-YYYY}/`** — the inbox is day-scoped and therefore relative to the DAY/NOW system without being buried inside one NOW session folder. Individual deposits should still carry NOW/session identifiers in frontmatter or filename, but the operator and Epii can find the active inbox from the day folder itself. Anima→Epii deposits via `s5'.epii.deposit` write into that day-scoped inbox; Epii's tooling surfaces inbox count first, full files on demand.

### Vendor Policy

Hermes is reference material, not source authority. Vendor trees are untracked and ignored under the single `vendors/` residency; the old tracked `vendor/` lane has been retired from git tracking and physically collapsed into `vendors/`. Matrix rows may cite vendored files for pattern provenance, but implementation must land in Body-native coordinate homes and tests must prove the Epi-Logos contract rather than vendor fidelity.

### The three tool surfaces

| Surface | What it owns | Rule |
|---|---|---|
| **1. Domain Operations** → `epi-cli` | vault / graph / gateway / gnostic / cron / nara | "Is this something any agent does to the world?" |
| **2. Agent-Self Operations** → native TS in each agent | Anima: VAK eval, CF routing, CS state, team composition. Epii: Bimba navigation, QL/MEF lens, M' function orchestration, autoresearch policy | "Is this something the agent does to itself?" |
| **3. S3' Temporal Runtime** → shared substrate | session identity, Day/NOW, Kairos, episodic arc lifecycle, presence grid, inter-agent temporal coordination | "Is this about when and where things happen?" |

### Plugin / capability / agent contract files (machine-checkable)

| Path | Role |
|---|---|
| `Body/S/S4/plugins/pleroma/.claude-plugin/plugin.json` | [[Pleroma]] plugin manifest (Anima's executive capability membrane package) |
| `Body/S/S4/plugins/pleroma/capability-matrix.json` | Constitutional agents (`anima`, `eros`, `logos`, `mythos`, `nous`, `psyche`, `sophia`); skills typed by `layer` + `kind`; what Anima may invoke |
| `Body/S/S5/plugins/epi-logos/.claude-plugin/plugin.json` | [[epi-logos plugin]] manifest (Epii's resource/return package) |
| `Body/S/S5/epii-agent/agent-contract.json` | `gateway_methods` (e.g., `s5'.epii.status`, `s5'.review.*`, `s5'.improve.*`), `spines` (`autoresearch`, `review_inbox`), `accepted_deposits_from_anima`, `allowed_requests_to_anima`, `epii_authority`, `forbidden_authority`, `inbox_contract`, `autoresearch_contract` |
| `Body/S/S4/ta-onta/<module>/<level>/tools.json` (e.g. Khora at `S4-0p-khora/S0/tools.json`) | Per-module per-level tool surface declaration; maps tool names to `epi` commands |

The four `.claude-plugin/plugin.json` + capability + agent-contract files are the dual-spine constitutional law. **Hermes has nothing structurally comparable** — its closest analogues are the unwritten role-typing of `leaf` vs `orchestrator` subagents (`tools/delegate_tool.py:25-35`) and the implicit toolset gating in `toolsets.py`. Where Hermes has an implicit constraint, we have a JSON contract that fails the build if violated.

### Parity question reframed

For every row of Matrices A–E, the deeper question is not just "where does it live in S/S'" but:

1. **Which API method** does this map to (existing in v0.1, or proposed addition)?
2. **Which envelope fields** does it populate or consume, by layer?
3. **Which capability-matrix / agent-contract / plugin-manifest / tools.json entry** governs its invocation?
4. **Which tool surface** owns it (Domain Ops via `epi-cli` / Agent-Self via native TS / S3' temporal runtime)?

The matrix rows below are read against these four columns implicitly. Subagent reports must surface the answers explicitly per row touched.

---

## Reading Guide

- **Matrix A** is the master capability table. Read first.
- **Matrix B** drills into TUI/UX details (Hermes is hailed for UX as much as function — this matrix names the specific UX decisions).
- **Matrix C** maps PI-agent surfacing (S4 Anima dispatch / S5 Epii return).
- **Matrix D** maps memory and learning loop (QL-6 autoresearch read against Honcho as contrast/inspiration).
- **Matrix E** maps the external edge (gateway, providers, MCP, ACP, cron).
- The discursive sections after the matrices are written against the rows, not as fresh argument.
- A new **Matrix F** below names where method-level parity refinements land — populated as subagent threads return.

---

## Matrix A — Master Capability Parity

| # | Hermes capability | Hermes location | Epi-Logos coordinate home | Body path / spec | Status | Note |
|---|---|---|---|---|---|---|
| A1 | Single-process agent daemon | `run_agent.py:10774` `run_conversation()` | [[S4]] PI agent runtime | `Body/S/S4/pi-agent/` | ✓ HAVE | Different orchestration topology — see C-rows |
| A2 | SQLite session store | `hermes_state.py:159` `SessionDB` | [[S3]] gateway session store + [[S3']] SpaceTimeDB projection | `Body/S/S0/epi-cli/src/gate/session_store.rs` (mirror); `Body/S/S3/gateway-contract` (canonical) | ▲ AHEAD | Ours: DAY/NOW-named keys, parent/source lineage, runtime cwd, vault root, retry settlement, structured diagnostics |
| A3 | Auto-discovered tool registry | `tools/*.py` import-time registration | [[S4]] / [[S4']] [[ta-onta]] extensions | `Body/S/S4/ta-onta/<module>/<level>/` + `tools.json` manifests | ≠ DIFFERS | Ours coordinate-typed; aggregated by `portal/surfaces.rs` |
| A4 | Plugin lifecycle hooks | `model_tools.py:679` `pre_tool_call`, `post_tool_call`, `transform_tool_result` | [[S4']] [[Anima]] dispatch + [[VAK]] gate over [[Psyche]] / DAY-NOW execution substrate | `Body/S/S4/plugins/pleroma/capability-matrix.json`; `Body/S/S4/plugins/pleroma/hooks/` | + ADD | Lift the **seam**, not the flat lifecycle model: VAK evaluation and permission gate before action; Psyche context/kbase field update around execution; coordinate-aware result transformation after action. Hooks must consume DAY/NOW/session state rather than become generic plugin callbacks |
| A5 | Subagent dispatch (`delegate_task`) | `tools/delegate_tool.py` | [[S4']] Anima orchestration; [[Pleroma]] capability membrane | `Body/S/S4/plugins/pleroma/capability-matrix.json` | ≠ DIFFERS | Lift: leaf vs orchestrator role, summary-only return, shared iteration budget. Add: typed delegation by lens / Klein-square |
| A6 | System prompt frozen at turn 1 (cache discipline) | `run_agent.py:10905-10920` | [[S4]] PI agent + [[S4']] [[Anima]] prompt assembly | TBD; mention in S4 spec but not yet a typed contract | ◐ PARTIAL | Discipline must be adopted; layer assembly so stable identity + lens-square scaffold + anima/vāk overlay + working context have explicit cache fences |
| A7 | Provider abstraction (`ProviderProfile`) | `providers/base.py:24-165` | [[S4]] PI agent providers; surfaced as `epi agent techne code` (S4.T.4) | `Body/S/S0/epi-cli/src/agent/techne/code.rs` (live profiles); typed Rust trait TBD | + ADD | Lift the exact attribute set: `fixed_temperature`, `default_aux_model`, `prepare_messages`, `build_extra_body`, `build_api_kwargs_extras`, `fetch_models`, `auth_type`, `env_vars`, `base_url` |
| A8 | Skills directory + Hub sync | `skills/`, `optional-skills/`, `tools/skills_hub.py` | [[S4']] [[ta-onta]] extensions; [[S5]] [[epi-logos plugin]] resources; [[S1']] [[Hen]] residency | `Body/S/S4/ta-onta/`, `Body/S/S5/plugins/epi-logos/`, `Body/S/S1/hen-compiler-core` | ≠ DIFFERS | Hen compiles ta-onta extensions to canonical residency; agentskills.io export bridge is additive (publish, don't import) |
| A9 | Trajectory compression (post-hoc, training) | `trajectory_compressor.py:709-827` | n/a (RL/training scope) | n/a | ✗ N/A | Different scope: training-data hygiene, not live-session memory |
| A10 | Live `/compress` slash command | `cli.py` slash dispatch | [[S5']] `s5'.epii.session.compact` (already creates Aletheia → Epii inbox item) | `Body/S/S0/epi-cli/src/gate/sessions.rs` `compact` | ▲ AHEAD | Ours: compact emits human-review-required Aletheia inbox item with transcript/session evidence |
| A11 | Memory: `MEMORY.md` + `USER.md` + nudges | `tools/memory_tool.py:118` (2200/1375 char caps) | [[S1]] vault residency + [[S1']] Hen graduation + [[S5']] Epii orientation | `Body/S/S0/epi-cli/src/vault/`; `Body/S/S1/hen-compiler-core` | ▲ AHEAD | 12-layer envelope + Hen residency law + protected-personal/deposit-able split is a different category |
| A12 | FTS5 + LLM-summary cross-session recall | `tools/session_search_tool.py:325-527` | [[S5]] `s5.episodic.search` (over [[Graphiti]] runtime / [[S3']]) + [[S2]] graph retrieval | `Body/S/S0/epi-cli/src/gate/graphiti.rs` (current); future `Body/S/S3/graphiti-runtime` | + ADD | Keep FTS5+LLM-summary truncate-around-match shape as the keyword baseline below Graphiti episodic; the truncation-around-match heuristic is good UX |
| A13 | Honcho dialectic plugin (3-pass) | `plugins/memory/honcho/__init__.py:949-989` | [[S5']] [[autoresearch]] dialectic; [[S4']] VAK execution pressure | `Body/S/S5/autoresearch` (target); `Body/S/S4/plugins/pleroma` | ≠ DIFFERS | Do **not** port Honcho-3 as the autoresearch shape. Use it as contrast for signal saturation / retrieval ergonomics only; ours is the QL P0→P5 arc opened by Sophia return and grounded by Chronos/Night' triggers |
| A14 | Honcho peer card schema | `plugins/memory/honcho/__init__.py` (peer/conclude/profile) | [[S5']] `s5'.epii.user.orientation` / protected [[Pratibimba]] | TBD; field set partially in `s5'.epii.user.orientation` | ◐ PARTIAL | Treat the user-orientation shape cautiously. It may inform a read-facing snapshot, but authority remains Epii + protected M4.4.4.4 Pratibimba, not a copied "peer card" object |
| A15 | Cron scheduler | `cron/jobs.py:422-575`, `cron/scheduler.py:139-143` (file-locked tick) | [[S3]] gateway cron + [[S3']] DAY/NOW/Kairos scheduling | `Body/S/S0/epi-cli/src/gate/` (current); future `Body/S/S3/gateway` | ◐ PARTIAL | Lift: file-locked tick, multi-target delivery syntax (`origin` / `local` / `platform_name` / `platform_name:chat_id`), output saved-on-disk regardless of delivery |
| A16 | Multi-platform messaging gateway (Telegram / Discord / Slack / WhatsApp / Signal / Email) | `gateway/run.py`, `gateway/platforms/` (~16 files per platform) | [[S3]] gateway platforms | `Body/S/S3/gateway/platforms/` (target) | + ADD | Lift the adapter capability set as a Rust async trait: `connect`, `disconnect`, `send`, `send_typing`, `send_image`, `send_document`, `send_voice`, `send_video`, `send_animation`, `send_image_file`, `set_message_handler`, plus reconnection-with-backoff. Do **not** put `truncate_message` on the trait; platform chunking is impl-internal and PI/model response sizing remains an agent concern |
| A17 | Cross-platform conversation continuity claim | `gateway/session.py:594-659` `build_session_key` | [[S3]] DAY/NOW + subject-coordinate-resolution | already specified in [[S3-SPEC]]; subject resolver TBD | ▲ AHEAD | Hermes has none; ours is structurally a different answer |
| A18 | Per-platform identity reconciliation | `gateway/session.py:70-156` `SessionSource` | [[S3]] subject-coordinate-resolver (gateway pre-agent step) | TBD — name as a gateway-contract layer | ◐ PARTIAL | Critical: every inbound platform identity must resolve to a node in the social/identity graph before Anima or Epii fires |
| A19 | ACP server adapter (Zed-consumable) | `acp_adapter/server.py:1-60`, ThreadPoolExecutor 4-worker | [[S3]] gateway protocol family | not yet in [[S3-SPEC]] | + ADD | Additive: ACP becomes a S3 protocol option alongside JSON-RPC product manifest. Session identity through subject-coord + DAY/NOW |
| A20 | MCP server (Hermes-as-MCP) | `mcp_serve.py:470-839`, FastMCP/stdio, 8 tools | [[S2']] [[bimba-mcp]] (graph) + future [[S5']] epi-mcp (Epii) | `Body/S/S2/external/bimba-mcp` (live) | + ADD | Lift `events_poll(after_cursor)` + `events_wait(after_cursor, timeout)` cursor pattern for streaming Epii inbox/autoresearch/Aletheia events to MCP clients |
| A21 | Web dashboard (FastAPI + React + Vite + xterm) | `web/`, `hermes_cli/web_server.py:67` | [[S3]] gateway HTTP + [[OmniPanel]] (M' Tauri target) | `Body/S/S3/epi-app/` (Electron, target Tauri v2 per roadmap) | ≠ DIFFERS | Ours: OmniPanel is the desktop `/` surface; Tauri-over-Rust replacing Electron-over-Node is the migration target. Web dashboard is a different shape, but Hermes still usefully exposes broad panel parity: chat, tools, skills, providers, cron, logs, channels |
| A22 | Plugin slot pattern (UI components in dashboard) | `web_server.py:3730-3838`, `dashboard/manifest.json` with `slots`, `window.registerSlot()` | [[OmniPanel]] hypertile plugin host (existing) + [[Ratatui]] hypertile in epi portal | `Body/S/S0/epi-cli/src/portal/` (Ratatui hypertile plugins live) | ▲ AHEAD | Ours: `portal/surfaces.rs` aggregates topology + parity + extension manifests + `.claude-plugin` + Epii contract + Pleroma gates + Ratatui plugins as one provider-backed registry |
| A23 | Voice memo transcription / TTS | `tools/transcription_tools.py`, `tools/tts_tool.py`, `tools/voice_mode.py` (EdgeTTS, faster-whisper) | [[S5]] world-return; future [[Anima]] voice envelope | not yet specified | + ADD | Voice in/out is a [[Vaikharī]] (L5-4) surface — should land at S5 with a Hen-compiled extension contract |
| A24 | Vision tools | `tools/vision_tools.py`, `tools/browser_dialog_tool.py` | [[S5']] / [[S2']] retrieval | not yet specified | + ADD | Image-as-input → typed Hen artifact + S2 graph link |
| A25 | RL/training environment integration (Atropos / Tinker) | `environments/`, `tinker-atropos/` | n/a (RL training scope) | n/a | ✗ N/A | Out of scope unless we want Anima/Epii fine-tunes |
| A26 | OpenClaw migration tool | `hermes claw migrate` | n/a | n/a | ✗ N/A | We have our own data plane; not relevant |
| A27 | "AGENTS.md as developer guide" pattern | `vendors/hermes-agent/AGENTS.md` (46 KB, for humans) | repo-root `AGENTS.md` | `/Users/admin/Documents/Epi-Logos C Experiments/AGENTS.md` | ✓ HAVE | Same pattern, same separation from runtime system prompt |
| A28 | `SOUL.md` per-user identity | `~/.hermes/SOUL.md` | [[S1]] vault + [[S5']] Epii user-position | `Body/S/S0/epi-cli/src/vault/`; `s5'.epii.user.orientation` | ◐ PARTIAL | We have richer scope: PASU evolution, Pratibimba anchor at protected M4.4.4.4 |
| A29 | Cron output saved on disk regardless of delivery | `cron/jobs.py` `save_job_output` | [[S3]] cron execution + [[S3']] episodic lineage + [[S1']] vault write | TBD | + ADD | Lift the audit-honesty, reject the flat ledger. Cron output dual-writes to Graphiti episodic record and DAY/NOW vault artifact, coordinated by Chronos/Janus/Zeithoven |
| A30 | Graphiti as HTTP sidecar wrapper (transitional) | `gate/graphiti.rs`, `epi_gnostic/graphiti_service.py` | [[S3']] runtime + [[S5]] / [[S5']] usage governance | demoted in roadmap; target `Body/S/S3/graphiti-runtime` | ✓ HAVE | Both projects treat sidecar as transitional; ours has the explicit target architecture |

---

## Matrix B — TUI / S0' Surface Specifics (UX-grain)

The point of this matrix is concrete UX decisions: what makes Hermes's TUI feel coherent, what is contract vs implementation detail, and where the centre `/` panel of [[epi portal]] (and [[OmniPanel]] desktop centre) needs to land.

| # | UX surface | Hermes shape | Hermes file:line | Epi-Logos coordinate | Body path | Status | Contract / decision implied |
|---|---|---|---|---|---|---|---|
| B1 | TUI framework | TWO TUIs: prompt_toolkit Python (legacy) + Ink/React TS (modern) | `cli.py` (570 KB) + `ui-tui/src/entry.tsx` | [[S0']] [[Ratatui]] in Rust (single) | `Body/S/S0/epi-cli/src/portal/` | ▲ AHEAD | Singular native TUI is correct; Hermes's bifurcation is debt |
| B2 | TUI ↔ agent IPC transport | newline-delimited JSON-RPC 2.0 over stdio (default) or WebSocket (web dashboard); polymorphic via `Transport` abstraction | `tui_gateway/transport.py`, `ws.py:112-163`, `entry.py:24-40` | [[S3]] / [[S0']] gateway IPC (TBD typed contract) | `Body/S/S3/gateway-contract` | + ADD | **Adopt JSON-RPC 2.0 + polymorphic Transport at gateway-contract level**. Stdio for local portal, WebSocket for OmniPanel/Tauri, native SpaceTimeDB subscription for distributed projection |
| B3 | One-emit fan-out to multiple sinks | `TeeTransport` mirrors writes to stdio + optional WebSocket sidecar | `tui_gateway/entry.py:24-40`, `event_publisher.py` | [[S3]] local gateway emit fan-out; [[S3']] SpaceTimeDB is additive multiplayer projection | TBD | + ADD | Lift only the one-emit/many-local-consumers pattern. Do **not** make TeeTransport a SpaceTimeDB fallback; local single-user stays gateway-internal, while SpaceTimeDB adds shared live projection when enabled |
| B4 | Token-by-token streaming render | discrete `prompt.token` events with delta text; React reconciler batches frame updates | `ui-tui/src/app/turnStore.ts`; `tui_gateway/server.py` `on_token` callback | [[S0']] portal stream renderer (TBD typed event vocabulary) | `Body/S/S0/epi-cli/src/portal/` | + ADD | **Add typed event vocabulary: `portal.token`, `portal.tool_call`, `portal.lens_pressure`, `portal.vak_eval`, `portal.review_deposit`, `portal.kairos_shift`**. The right panel `1` (Nara/Epii) and left panel `0` (clock) need richer events than the centre transcript |
| B5 | Tool-call traces inline in transcript | `prompt.tool_call` event with name/input/status; nested in activity feed | `ui-tui` activity feed component | [[S0']] portal tool-call render lane (typed) | TBD | + ADD | Render as collapsible nodes in transcript, expandable to show tool args + result snippet. For Anima dispatch, also surface VAK gate state and Pleroma capability membrane outcome |
| B6 | Slash command dispatch | `slash.exec(cmd, args)` RPC → gateway-side resolution from registered handlers + plugin entry points + skills | `ui-tui/src/gatewayClient.ts`; `tui_gateway/server.py` `_run_slash_exec()` | [[S0']] portal command IPC (centre `/` panel) | `Body/S/S0/epi-cli/src/portal/surfaces.rs` (registry exists; IPC method TBD) | + ADD | **Name `s0.command.exec` and `s0.command.completion` as first-class methods on gateway-contract**. Both consume the existing `surfaces.rs` registry. TUI becomes a thin renderer; same contract Tauri consumes |
| B7 | Slash command autocompletion | `completion.request(prefix, ctx)` RPC; server returns ranked items; UI renders popup | `gatewayTypes.ts:CompletionResponse` | [[S0']] portal completion IPC | TBD as `s0.command.completion` | + ADD | Pull-style completion over the surface registry; same IPC for centre panel and OmniPanel command bar |
| B8 | Multi-line input editing | prompt_toolkit `TextArea` (legacy) or Ink-driven multiline buffer (modern) with vim-mode optional | `cli.py` prompt_toolkit Layout; `ui-tui` input component | [[S0']] portal input component (Ratatui) | `Body/S/S0/epi-cli/src/portal/` | ◐ PARTIAL | Multiline + history scroll are TUI-renderer concerns; should live in portal renderer, NOT in gateway-contract |
| B9 | Conversation history navigation (scrollback) | virtual scroll over message list; up/down keys, page-up, jump-to-top | `ui-tui` transcript pane | [[S0']] portal transcript pane | TBD | ◐ PARTIAL | Scrollback renders over gateway transcript/session events; viewport state is a render concern, while the contract is the shared event stream consumed by direct PI, TUI portal, and OmniPanel/Tauri |
| B10 | Interrupt mid-stream | `session.interrupt()` RPC; bound to a single execution thread ID; in-flight model call NOT retried | `run_agent.py:10861`; `tui_gateway/server.py:2711-2729` | [[S3]] `s3.session.interrupt` | `Body/S/S0/epi-cli/src/gate/sessions.rs` | + ADD | **Bind interrupt to the active runtime task ID**. Khora's NOW write authority remains authoritative even if interrupt fires mid-turn. Honest "interrupted at VAK step 3 of 6" semantics |
| B11 | Status bar (model, tokens, session) | bottom strip; shows model name, token usage, session id, channel binding | `ui-tui` SidebarStatusStrip / status component | [[S0']] portal status bar (3-panel-aware) | `Body/S/S0/epi-cli/src/portal/` | ◐ PARTIAL | Ours has more to show: DAY/NOW path, Kairos freshness, active lens-square, Anima VAK state, Epii inbox count |
| B12 | Model switching | `/model [provider:model]` slash command; modifies session metadata | `cli.py` + `_run_slash_exec` | [[S4]] PI agent + S4.T.4 provider profile + `epi agent session patch` | `Body/S/S0/epi-cli/src/agent/`, `Body/S/S0/epi-cli/src/gate/sessions.rs` | ✓ HAVE | Already in gateway session patch contract; portal slash should call through |
| B13 | "Personality" / system-prompt overlay | `/personality [name]` slash; reloads SOUL.md fragment | `cli.py` slash dispatch | [[S4']] [[Anima]] system-prompt assembly + [[S5']] Epii orientation | TBD | ≠ DIFFERS | Ours layered: stable identity + lens-square scaffold + anima/vāk overlay + working context. Personality is the overlay layer |
| B14 | `/retry`, `/undo` | rewind last turn; replay with new model/personality | `cli.py` | [[S3]] `s3.session.fork` (already in gateway-contract) | `Body/S/S0/epi-cli/src/gate/sessions.rs` | ✓ HAVE | We have richer: fork preserves source lineage, retry settlement state |
| B15 | `/compress`, `/usage`, `/insights` | live trajectory compression (different from training compression); usage stats; cross-session insights | `cli.py` | [[S5']] `s5'.epii.session.compact` (live, with Aletheia inbox); usage from gateway parity health; insights from autoresearch | already in gateway-contract; insights TBD | ◐ PARTIAL | `/insights` should call autoresearch + Epii observation surfaces |
| B16 | Slash help overlay | `/help` shows command listing | `cli.py` | [[S0']] `s0.command.help` from surface registry | `Body/S/S0/epi-cli/src/portal/surfaces.rs` | + ADD | Generated from registry, not hand-maintained. Same IPC as completion |
| B17 | Theme / color system | static themes; ANSI-aware | `cli.py`, prompt_toolkit Style | [[S0']] portal theming (Ratatui style) | `Body/S/S0/epi-cli/src/portal/` | ◐ PARTIAL | Should be coordinate-aware (different lens-square has different palette signature; Kairos shifts color the clock panel) |
| B18 | Plugin-as-UI registration (dashboard slots) | `dashboard/manifest.json` declares slots; `window.registerSlot(plugin, slot, Component)` injects React component | `web_server.py:3730-3838` | [[OmniPanel]] hypertile plugin host (Tauri) + portal `surfaces.rs` (Ratatui) | `Body/S/S3/epi-app/`, `Body/S/S0/epi-cli/src/portal/` | ✓ HAVE | Ours is more structured: `surfaces.rs` is provider-backed, M0'-M5' plugins compose into 0/`/`/1 panel topology |
| B19 | Conversation continuity across surfaces | claim-only; in code, per-platform-chat session keys (no real continuity) | `gateway/session.py:594-659` | [[S3]] DAY/NOW-named session + [[S3']] SpaceTimeDB session_surface projection | `Body/S/S3/gateway-contract`; `Body/S/S3/epi-spacetime-module` | ▲ AHEAD | Ours: same session visible to TUI, Tauri, MCP, gateway HTTP, ACP — through one projection plane |
| B20 | Backpressure / streaming flow control | none; SIGPIPE-tolerant on background threads | `tui_gateway/entry.py:134-146` | [[S3']] SpaceTimeDB native subscription with reducer ack | `Body/S/S3/gateway-contract` (subscription contract) | + ADD | Worth doing better: native WebSocket subscription gives explicit reducer state; portal can throttle render rate without dropping events |

---

## Matrix C — PI Agent Surfacing (S4 Anima ⇄ S5 Epii)

How the agent is rendered as **chat** in the centre `/` of the portal and OmniPanel — and how that chat shares the same contract with subagent traces, VAK evaluations, review-inbox events, Aletheia crystallisations, and Kairos shifts.

| # | Surfacing concern | Hermes shape | Hermes file:line | Epi-Logos coordinate | Status | Decision implied |
|---|---|---|---|---|---|---|
| C1 | Agent identity provenance | `AGENTS.md` (developer guide, not loaded), system prompt assembled in `agent/prompt_builder.py` from `DEFAULT_AGENT_IDENTITY` + platform hints + tool guidance + memory block + skills + `SOUL.md` + project AGENTS.md + .cursorrules | `run_agent.py:~11000` | [[Anima]] (S4/S4') and [[Epii]] (S5/S5') as DISTINCT spine-bearing PI agents with separate capability membranes (`Body/S/S4/plugins/pleroma/capability-matrix.json`, `Body/S/S5/epii-agent/agent-contract.json`) | ▲ AHEAD | Two-agent constitutional architecture is the right shape. Question to decide: which agent is the "default" chat surface (probably Anima for action; Epii for reflection / review) |
| C2 | Direct PI agent interface (current) | n/a — Hermes does not separate "agent surface" from chat | n/a | currently the operator interacts with the PI agent through the direct interface ([[Anima]] runtime as invoked through `epi agent` / agent runtime); there is **no** separate native chat TUI | ◐ PARTIAL | **Clarification**: the question is not "where does chat live" but "what is the IPC-shared event/render contract that the direct PI agent interface, the future portal centre `/` chat surface, and the Electron-then-Tauri OmniPanel chat all consume" — see C3, C12 |
| C3 | Chat surface in OmniPanel (today Electron, target Tauri) | React component bound to gateway WS | `web/src/components/Chat*.tsx` (Hermes); presaged chat in `Body/S/S3/epi-app/` (Electron, ours) | [[OmniPanel]] desktop centre `/` chat, presaged in current Electron, target Tauri v2 | ◐ PARTIAL | Same gateway-contract IPC as the portal-centre eventually-chat plugin and the direct PI agent interface — chat-stream subscription + `s0.command.*` — so chat works identically across all three consumption surfaces |
| C4 | Streaming chat render | tokens via `prompt.token`; tool-calls via `prompt.tool_call`; flat sequence in transcript | `tui_gateway/server.py` event emit | [[S0']] portal typed events (see Matrix B4) | + ADD | Ours needs richer event types: VAK eval steps, lens-pressure indicators, Anima→Epii deposit notifications inline, Kairos drift warnings |
| C5 | Subagent trace rendering | child runs in ThreadPoolExecutor; only `.summary` file visible to parent's model; UI shows progress events for the parent only | `run_agent.py:9655` `_dispatch_delegate_task`, `tools/delegate_tool.py` | [[Anima]] orchestrator dispatches; [[Pleroma]] capability membrane gates; subagent traces surface as collapsible threads in transcript | + ADD | **Render subagent dispatch as nested threaded turns in the chat transcript**, expandable; show role (leaf vs orchestrator vs lens-typed vs square-typed), capability gate status, summary at the top, full trace on expand |
| C6 | Multi-agent visibility (Anima ↔ Epii in same chat) | n/a — single agent only | n/a | Both Anima and Epii can be addressed in a single conversation; deposits between them are inline events | + ADD | **This is genuinely novel**. Recommend: chat shows turn provenance (which spine produced this turn), and Anima→Epii deposits render as inline "review item created" events with click-through to inbox |
| C7 | Tool dispatch lifecycle hooks | `pre_tool_call`, `post_tool_call`, `transform_tool_result` (3 hooks) | `model_tools.py:679` | Anima dispatch with VAK gate, Psyche context field, DAY/NOW execution substrate, coordinate-aware result transform | + ADD | Lift the seam but re-home the lifecycle: VAK decides and gates; Psyche holds context/kbase/current-task field; Khora/Chronos provide DAY/NOW/session substrate; post/transform events must update envelope fields and trace, not become generic plugin middleware |
| C8 | Approval / clarification flow | `tools/approval.py` queue for gateway sessions; interactive prompt for CLI; `clarify` tool for ambiguous requests | `run_agent.py:1098+` `clarify_callback`, `tools/approval.py` | [[S4']] permission boundary (`s_4_permission_boundary`) + Pleroma capability membrane | ◐ PARTIAL | Approval queue UX is well-formed in Hermes; lift the queue pattern. Our boundary is structurally richer (per-capability gating from JSON contract) |
| C9 | Provider profile switching mid-session | `/model` slash; system prompt unchanged; provider client swapped | `cli.py` + `agent` provider client | `epi agent session patch` with `model` field; provider profile from S4.T.4 | ✓ HAVE | Already wired; portal slash should call through |
| C10 | Subagent role typing | `leaf` (no `delegate_task`/`clarify`/`memory`/`send_message`/`execute_code`) vs `orchestrator` (retains delegate) | `tools/delegate_tool.py:25-35`, `:80-92` | [[Pleroma]] capability matrix per agent role; lens-typed and square-typed delegation as additional roles | + ADD | Lift the leaf/orchestrator distinction at minimum. Add: `delegate_lens(lens_id, ...)` returns lens-focal report; `delegate_square(square_id, ...)` returns four focal reports for orchestrator synthesis |
| C11 | Session lineage in chat UI | session list shows linear history; no fork/branch UI | `web/src/components/SessionListItem.tsx` | `s3.sessions.tree` already exposes parent/source/runtime/vault/resource-loader/retry/diagnostic facts | ▲ AHEAD | Render the session tree in the right-rail; click any node to switch into it; fork visible as branch in the tree |
| C12 | Three chat-consumption surfaces | one chat surface (transcript pane in ui-tui or cli.py) | n/a | **(a)** direct PI agent interface (current operator path through `epi agent` / agent runtime), **(b)** `epi portal` centre `/` chat plugin (TBD), **(c)** OmniPanel desktop centre chat (presaged in Electron, target Tauri) | **decision needed** | **Three surfaces, one IPC contract**. All three subscribe to the same gateway emit (chat-stream events + tool-call events + lens-pressure / VAK / kairos events) and dispatch through the same `s0.command.*` IPC. Render is per-surface; behavior must not fork |
| C13 | Conversation context files | `~/.hermes/SOUL.md` + project `AGENTS.md` + `.cursorrules` loaded into system prompt | `run_agent.py:962`, `prompt_builder.py` | [[S1]] vault SOUL/USER/identity + project AGENTS.md + per-session pin set | ◐ PARTIAL | Lift the layered loading pattern; ours has richer scope (Hen-compiled artifacts, PASU, Pratibimba ref) |

---

## Matrix D — Memory & Learning Loop (S5' autoresearch read against Honcho)

Frank's intuition that "the autoresearch details probably cover the 3-pass dialectic" — confirmed. This matrix makes the parity exact.

| # | Concept | Hermes shape | Hermes file:line | Epi-Logos coordinate | Decision |
|---|---|---|---|---|---|
| D1 | Three-pass dialectic | cold-pass (general query) → gaps-pass → reconciliation-pass; bails early when signal saturates | `plugins/memory/honcho/__init__.py:949-989` | [[S5']] [[autoresearch]] QL P0→P5 arc | ≠ DIFFERS: Honcho-3 is useful contrast, not parity. Autoresearch is QL-6: baseline → challenger → evaluation → keep/discard → weave → Hen promotion, opened by Sophia return |
| D2 | Reasoning depth scaling | depth scaled by query length: 120-char → +1 level; 400-char → +2 levels | `plugins/memory/honcho/__init__.py:302-343` | [[Anima]] VAK execution pressure + [[Psyche]] context field | + ADD only as one signal. Query length may inform depth, but VAK pressure, permission boundary, Psyche-held kbase/context, Kairos, and task-risk dominate |
| D3 | Cadence gating | configurable `dialecticCadence` and `contextCadence` (per-N-turns) | `plugins/memory/honcho/__init__.py:191-1000` | [[Anima]] per-turn VAK; [[Epii]] autoresearch fire triggers | ≠ DIFFERS: drop "cadence" as governing term. VAK fires per turn; autoresearch fires from Sophia-Möbius-return, Chronos cron_evening, or explicit Epii/user invocation |
| D4 | Recall mode tri-fold | `context` (auto-inject summaries into prompt), `tools` (require explicit search calls), `hybrid` (both) | `plugins/memory/honcho/__init__.py` recall_mode | [[S3']] Redis hot/warm/cold context + [[Psyche]] active context pack + [[S5]] Graphiti/Gnosis | ≠ DIFFERS: no parallel recall mode abstraction. Use existing Redis temperature/context layers and bounded tools; Psyche decides what is active in the field |
| D5 | Peer card schema | name, role, preferences, patterns; written via `honcho_profile`, read via `honcho_context` | `plugins/memory/honcho/__init__.py` | `s5'.epii.user.orientation` + protected [[Pratibimba]] | ◐ PARTIAL: keep as possible read-facing snapshot vocabulary only. Do not let "peer card" become a schema authority before Pratibimba/M4.4.4.4 design is settled |
| D6 | Conclusions (persistent learned facts) | `honcho_conclude` writes/deletes durable conclusions | same | [[S5']] [[Hen]]-graduated artifacts in vault + Bimba graph | ≠ DIFFERS: ours go through Hen graduation law; Hermes's are flat |
| D7 | Cold/warm prefetch | background threads run dialectic with cold/warm prompts, cadence-gated | `plugins/memory/honcho/__init__.py:547-686` | [[S3']] Redis hot/warm/cold context + [[Psyche]] active context pack | + ADD as ergonomic pattern only: prefetch may warm Redis/Psyche context, but it must respect DAY/NOW, permission boundary, and bounded Graphiti/Gnosis tools |
| D8 | Cross-session keyword recall (FTS5) | SQLite FTS5 + LLM-summary truncate-around-match | `tools/session_search_tool.py:325-527` | [[S2]] full-text retrieval over Bimba; [[S5]] `s5.episodic.search` over Graphiti runtime | + ADD: keep the truncate-around-match heuristic for the keyword baseline below Graphiti episodic |
| D9 | Memory nudge prompt every N turns | "save memorable facts" reminder | `run_agent.py:10934-10938` | n/a | ✗ N/A: our memory writes go through Hen compiler graduation, not in-context nudges |
| D10 | Skill creation nudge every N turns | "create a skill for this complex task" reminder | `run_agent.py:14391-14392` | n/a | ✗ N/A: Hen graduation is the formal residency promotion path |
| D11 | Autoresearch baseline / challenger / evaluation / promotion | absent in Hermes | n/a | [[S5']] `s5'.improve.*` (target) | ▲ AHEAD: build planned in [[S-AD-HOC-ROADMAP]] |
| D12 | Review inbox | absent in Hermes | n/a | [[S5']] `s5'.review.*` (gateway routes live, full inbox state TBD) | ▲ AHEAD: Aletheia → Epii deposit pattern is the right structural answer |
| D13 | Trajectory compression | post-hoc training data; protect first N + last 4 turns; compress middle | `trajectory_compressor.py:709-827` | n/a | ✗ N/A: training scope; live `/compress` is `s5'.epii.session.compact` (different concern) |
| D14 | Compaction → review handoff | `/compact` clears history; no inbox creation | `cli.py` | [[S5']] `s5'.epii.session.compact` already creates Aletheia inbox item | ▲ AHEAD: ours already at first executable close-handoff |

---

## Matrix E — Edge & Multi-Surface (S3 gateway, providers, MCP, ACP, cron)

| # | Concern | Hermes shape | Hermes file:line | Epi-Logos coordinate | Status |
|---|---|---|---|---|---|
| E1 | Single gateway daemon | `GatewayRunner` multiplexes platforms; LRU AIAgent cache (128, 1h idle TTL) | `gateway/run.py:50-51` | [[S3]] gateway runtime; agent-runtime factory | ≠ DIFFERS: ours has SpaceTimeDB session_surface projection underneath |
| E2 | `BasePlatformAdapter` interface | `connect`, `disconnect`, `send`, `send_typing`, `send_image`, `send_document`, `send_voice`, `send_video`, `send_animation`, `send_image_file`, `set_message_handler` | `gateway/platforms/base.py:1206-1410` | `Body/S/S3/gateway/platforms/` | + ADD: lift verbatim |
| E3 | Per-platform message limits | UTF-16-aware truncation for Telegram; platform-specific media routing | `gateway/platforms/base.py` `truncate_message`, `should_send_media_as_audio` | platform adapter contract | + ADD |
| E4 | Reconnection backoff + jitter | per-adapter exponential backoff + jitter (Discord, Telegram) | `gateway/platforms/discord.py`, `telegram.py` | platform adapter contract | + ADD |
| E5 | Cron tick + jobs.json | tick every 60s; file-locked to prevent duplicate execution; multi-target delivery; output saved on disk | `cron/scheduler.py:139-143`, `cron/jobs.py:422-575` | [[S3]] gateway cron + [[S3']] DAY/NOW/Kairos scheduling | + ADD: lift tick + lock + delivery syntax |
| E6 | Cron context-from chaining | `context_from` field consumes prior job output | `cron/jobs.py:463-464` | [[S3]] cron job DAG | + ADD |
| E7 | Cron delivery target syntax | `origin`, `local`, `platform_name`, `platform_name:chat_id` | `cron/scheduler.py:363-378` | gateway delivery contract | + ADD: lift verbatim |
| E8 | E2EE delivery via gateway adapter | when gateway running, adapter dispatch supports E2EE; standalone HTTP send is fallback | `cron/scheduler.py:440-600` | gateway dispatch / standalone fallback | + ADD |
| E9 | ACP server (Zed-consumable) | full agent conversation, tool calls, thinking, session fork/resume; ThreadPoolExecutor 4 workers | `acp_adapter/server.py:1-60`, `acp_adapter/session.py` | [[S3]] gateway protocol family | + ADD: name as a S3 protocol option |
| E10 | MCP server (Hermes-as-MCP) | 8 tools: `conversations_list`, `conversation_get`, `messages_read`, `attachments_fetch`, `events_poll`, `events_wait`, `messages_send`, `channels_list`; FastMCP/stdio | `mcp_serve.py:470-839` | [[S2']] [[bimba-mcp]] (live), future [[S5']] epi-mcp | + ADD: lift `events_poll`/`events_wait` cursor pattern |
| E11 | Provider profile | `fixed_temperature`, `default_aux_model`, `prepare_messages`, `build_extra_body`, `build_api_kwargs_extras`, `fetch_models`, `auth_type`, `env_vars`, `base_url` | `providers/base.py:24-165` | [[S4]] `epi agent techne code` (S4.T.4) | + ADD: lift as Rust trait |
| E12 | Provider plugin discovery | bundled plugins → user plugins → legacy single-file modules; later registrations override earlier | `providers/__init__.py:30-192` | [[S4]] provider plugin discovery | + ADD: lift override-order |
| E13 | Subject-coordinate identity reconciliation | absent (per-platform-chat session keys) | `gateway/session.py:594-659` | [[S3]] gateway pre-agent step | ◐ PARTIAL: needs explicit naming as a gateway-contract layer |
| E14 | Live Docker Redis hydration proof | claim-only | n/a | gate_temporal_context ignored test (proven 2026-05-07) | ▲ AHEAD |
| E15 | Native SpaceTimeDB WebSocket subscription | absent | n/a | `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket` over `v1.json.spacetimedb` with `SubscribeMulti` | ▲ AHEAD |

---

## Matrix F Status

The populated Matrix F later in this file is now authoritative. The earlier placeholder table was removed to prevent agents from treating the sparse draft as a second schema. The governing rule remains: every Hermes-inspired addition must map to a PI API method or event, envelope layer/field, contract entry, and tool surface before implementation.

---

## Where Epi-Logos is Structurally Ahead by Design

These rows in the matrix are not "Hermes hasn't gotten to it yet" — they are categorical absences in Hermes's design:

- **Coordinate-typed envelope** with explicit S/S' ownership across 12 layers (transport / runtime / temporal / coordinate / residency / context-economy / lived-environs / execution / episodic / crystallisation / improvement / QL-process). Hermes has flat JSON message rows.
- **Two-spine PI agent architecture** ([[Anima]] dispatch ⇄ [[Epii]] return) with separate capability membranes (`capability-matrix.json` for Pleroma, `agent-contract.json` for Epii) that machine-check what each spine may invoke. Hermes has subagent role-typing only.
- **DAY/NOW-anchored sessions** with parent/source lineage, runtime cwd, vault root, resource-loader id, and structured diagnostics — projected through SpaceTimeDB `session_surface`. Hermes has flat `agent:main:{platform}:{chat_id}` keys.
- **Three-tier temporal substrate**: SpaceTimeDB live projection (gateway/agent/client/session/DAY/NOW/Kairos/Pratibimba) + Redis hot context with TTL (NOW markdown, DAY context, Kairos, agent orientation) + local Neo4j/Graphiti protected personal truth (PersonalNexus, journal-derived aspects, episodic memory). Hermes has SQLite + flat datetime.
- **Aletheia crystallisation at S4.5'** as the membrane / handoff trigger from Anima dispatch to Epii review. Hermes has `/compress` that clears history.
- **Review inbox + autoresearch + promotion** at S5' Epii. Hermes has nudge prompts.
- **Hen-compiler graduation law** at S1' for vault residency. Hermes writes flat Markdown.
- **Three-panel TUI topology** (`0` M0'-M3' structural / `/` S0-S5 command / `1` M4'-M5' personal/world) with explicit coordinate mapping to plugin domains. Hermes has single transcript pane.
- **Provider-backed surface registry** (`portal/surfaces.rs`) aggregating topology + parity records + extension manifests + agent contracts + capability gates. Hermes has hardcoded slash dispatch + plugin entry points.
- **Coordinate-native API contract** (`s0.*` through `s5'.*`) with TypeScript shared types + envelope field homing. Hermes has product-native gateway methods only.

## Where Hermes Sharpens Our Shape (Concrete Contract Additions)

The action items implied by the `+ ADD` rows above, grouped:

**Portal IPC (S0' / S3 gateway-contract)**:

1. Adopt JSON-RPC 2.0 with a polymorphic local/remote transport boundary where useful, without treating Hermes's transport layer as architectural authority — see B2.
2. Local one-emit fan-out to multiple render consumers; SpaceTimeDB remains additive multiplayer projection, not fallback — see B3.
3. Typed event vocabulary: `portal.token`, `portal.tool_call`, `portal.lens_pressure`, `portal.vak_eval`, `portal.review_deposit`, `portal.kairos_shift` — see B4.
4. `s0.command.exec` + `s0.command.completion` + `s0.command.help` IPC methods over the existing `surfaces.rs` registry — see B6, B7, B16.
5. `s3.session.interrupt` thread-bound, no-retry-on-interrupt — see B10.

**Anima / S4 dispatch**:

6. Three-hook dispatch seam (`pre`/`post`/`transform`) reinterpreted through VAK, Psyche-held context/kbase field, DAY/NOW execution substrate, and coordinate-aware result transformation — see A4, C7.
7. Subagent leaf/orchestrator role distinction with shared iteration budget and summary-only return — see A5, C5, C10. Add typed `delegate_lens` / `delegate_square`.
8. Provider profile as Rust trait (`ProviderProfile` attribute set lifted verbatim) — see A7, E11.
9. Provider plugin discovery override-order (bundled → user → legacy) — see E12.

**Epii / S5' return**:

10. QL-6 autoresearch remains authoritative; Honcho-3 contributes only signal-saturation and retrieval ergonomics as contrast — see D1, D2, F28.
11. Use S3' Redis hot/warm/cold + Psyche active context pack rather than importing Honcho recall modes — see D4.
12. Treat Honcho's peer-card fields as tentative read-facing inspiration only; Pratibimba/M4.4.4.4 and Epii authority decide the user-orientation schema — see D5, A14.
13. Cold/warm prefetch may warm Redis/Psyche context, but not by importing Honcho cadence abstractions — see D7.
14. Cursor-based event streaming (`events_poll`/`events_wait`) for future S5' epi-mcp — see A20, E10.

**S3 gateway / edge**:

15. `BasePlatformAdapter` interface + per-platform message-limit handling + reconnection-with-jitter — see E2, E3, E4.
16. Cron tick + file-lock + delivery target syntax (`origin`/`local`/`platform_name`/`platform_name:chat_id`) with Graphiti episodic + DAY/NOW vault dual-write, not flat ledger — see E5, E7, A29, F29.
17. ACP as a S3 gateway protocol option for IDE consumption — see A19, E9.
18. Subject-coordinate-resolver as gateway pre-agent layer — see A18, E13.

## Where Shape is Genuinely Shared (Confirm-and-Port)

These are battle-tested patterns we already have or plan, where Hermes confirms correctness:

- AGENTS.md as developer-facing guide separate from runtime system prompt — see A27.
- Subagent contract fundamentals (role-restricted blocklist, summary-only return, shared budget) — see C5, C10.
- Graphiti as transitional sidecar with target architecture being library/runtime + governance — see A30.
- System prompt freezing for prefix-cache discipline — see A6 (we need to make ours typed).

## Open Questions for the Deeper Dive

After this matrix is in place, the remaining substantive work I want to do is:

**Q1 — PI agent surfacing**: Read `Body/S/S4/pi-agent/`, `Body/S/S4/ta-onta/`, `Body/S/S4/plugins/pleroma/capability-matrix.json` against `vendors/hermes-agent/run_agent.py` orchestration loop and `vendors/hermes-agent/agent/`. Goal: produce a precise mapping of how Anima's run loop should be shaped given Hermes's loop as reference but our two-spine + capability-membrane + VAK gate constraints.

**Q2 — Direct PI agent interface ⇄ portal centre `/` chat plugin ⇄ OmniPanel chat (Electron→Tauri)**: There is **no** separate native chat TUI; today the operator works against the direct PI agent surface, and the Electron OmniPanel has a presaged chat interface that will port to Tauri. Read `Body/S/S0/epi-cli/src/portal/topology.rs` + `surfaces.rs` + `runtime_state.rs`, the direct PI agent interface paths under `Body/S/S4/pi-agent/` and `Body/S/S0/epi-cli/src/agent/`, and the Electron presaged chat in `Body/S/S3/epi-app/`. Goal: propose the IPC-shared / surface-shared / behavior-non-forking shape for chat across the three consumption surfaces, anchored on a single gateway emit + `s0.command.*` IPC contract.

**Q3 — Autoresearch QL-6 read against Honcho**: Read `Body/S/S5/autoresearch` (if any code exists yet) and `Body/S/S5/epii-agent/agent-contract.json` against `plugins/memory/honcho/__init__.py:949-989`. Goal: write the autoresearch dialectic state machine spec with the QL P0→P5 arc made explicit and Honcho-3 recorded only as contrast / ergonomics source.

**Q4 — Hermes UX instrumentation detail**: Read `vendors/hermes-agent/ui-tui/src/` exhaustively for the rendering, input-handling, and slash UX details. Goal: extract the specific keyboard shortcuts, autocomplete behaviors, transcript rendering tricks, and tool-call display patterns that make Hermes feel coherent — and propose the Ratatui equivalents.

**Q5 — Subject-coordinate-resolver shape**: Hermes has nothing here, but the gap is structurally named in this matrix (E13). Worth its own short flow file proposing the gateway pre-agent resolution layer.

## Next Shard Candidates

These map cleanly onto [[S-SHARDING-TASK-LIST]] grammar; they are not yet shards, but each could become one with a one-paragraph framing and a verification checklist:

- **Shard candidate**: Portal IPC typed event vocabulary (Matrix B items B2, B3, B4) — coordinate `S0' / S3` — depends on `gateway-contract`.
- **Shard candidate**: `s0.command.*` IPC methods (Matrix B items B6, B7, B16) — coordinate `S0'` — consumes `portal/surfaces.rs`.
- **Shard candidate**: Anima dispatch three-hook lifecycle (Matrix A4, C7) — coordinate `S4'` — body in `Body/S/S4/plugins/pleroma`.
- **Shard candidate**: Three-pass dialectic state machine for autoresearch (Matrix D1) — coordinate `S5'` — body in `Body/S/S5/autoresearch`.
- **Shard candidate**: Provider profile Rust trait (Matrix A7, E11) — coordinate `S4` — body in `Body/S/S4/pi-agent` or `Body/S/S0/epi-cli/src/agent/techne`.
- **Shard candidate**: `BasePlatformAdapter` Rust trait + first platform implementation (Matrix E2) — coordinate `S3` — body in `Body/S/S3/gateway/platforms/`.
- **Shard candidate**: Subject-coordinate-resolver gateway pre-agent layer (Matrix A18, E13) — coordinate `S3` + `S2` (graph identity nodes).
- **Shard candidate**: ACP protocol option for S3 gateway (Matrix A19, E9) — coordinate `S3`.
- **Shard candidate**: Cron tick/lock/delivery-syntax port (Matrix A15, A29, E5, E7, E8) — coordinate `S3`.
- **Shard candidate**: Redis/Psyche context prefetch over S3' hot/warm/cold temporal context (Matrix D7) — coordinate `S3'` + `S4'/Psyche` + `S5'`; no Honcho cadence abstraction.

## Build-Test Implications

Real-functionality tests this matrix implies:

- Portal IPC contract test: gateway emits typed events; portal renders them; same event stream consumed by Tauri client (when ready).
- Anima three-hook lifecycle test: VAK gate fires before tool dispatch and can block; lens-pressure event fires after; transform may modify result; all three observable in chat stream.
- Subagent dispatch test: leaf cannot call delegate; orchestrator can; shared iteration budget enforced; summary-only return verified.
- Three-pass dialectic test: cold pass runs; gaps pass identifies missing facts; reconciliation pass synthesises; early-bail when signal saturates; depth scales with query length.
- Provider profile test: same chat code talks to two providers (e.g., Anthropic + OpenRouter) with different reasoning_effort placement (`api_kwargs` vs `extra_body`); both produce equivalent typed responses.
- Subject-coordinate-resolver test: same user reaching gateway from three platforms (e.g., Telegram + Discord + Tauri) resolves to the same subject coordinate node, with separate session keys but shared identity.

---

## Resolutions (post subagent + spec deep-dive)

After the four subagent reports (T1–T4) and the deep-dive read against S4-SPEC, S5-SPEC, the Aletheia CONTRACT.md, the Sophia agent file, the canonical [[VAK-HANDOVER]], the OMX VAK skill fork plan, and the Anima VAK gate skill injection plan, the open questions resolve as follows:

**On VAK / Anima execution language:**

- **VAK is Anima's six-dimensional orchestration grammar** (CPF/CT/CP/CF/CFP/CS), implemented as Pleroma skills, NOT one VAK dimension per ta-onta extension. See substrate section above.
- LLM-mediated VAK evaluation (`vak-evaluate` skill) is canonical; Rust evaluator at `epi-cli/src/agent/vak.rs` is explicitly the deterministic fallback.
- Permission boundary lives at `s_4_permission_boundary` (envelope L2), populated from `capability-matrix.json` filtered by VAK output; enforcement at every S0 exec / Pleroma primitive use / file write / subagent spawn / external API call.
- Anima/Epii coordinate-context versioning is already covered by `c_0_ql_schema_version` (envelope L12, S5'-owned). No new mechanism needed.

**On the six cf_frame variants and the Aletheia layer:**

- The seven constitutional agents (Nous / Logos / Eros / Mythos / Anima / Psyche / Sophia) are dispatched via CF code — see VAK CF row in substrate section above.
- Day vs Night' is CS runtime phase. Moirai's Klotho-Assert / Lachesis-Query / Atropos-Reflect are Moirai's three operational modes when CS=night', not three separate agents (per Aletheia CONTRACT.md).
- Aletheia subagent bounded ascriptions (per CONTRACT.md table line 200): Anansi (gap analysis / orientation / Darshana REPL); Moirai (GraphRAG retrieval + distillation); Janus (temporal integration); Mercurius (cross-domain translation); Agora (aggregation + consensus); Zeithoven (temporal pacing / session pacing).
- Aletheia is "emergent, not routed" — invoked by Psyche and Sophia via Anima dispatch (CONTRACT.md line 37).
- Review gating is structural: Sophia's `MÖBIUS_RETURN: [P5' insight] | [P0' questions]` signal becomes a deposit at Epii's review inbox via `s5'.epii.deposit`. Epii's `s5'.review.resolve` is the gate that allows `s5'.improve.promote` to return a Hen dry-run plan (S5-SPEC line 117). No "who in Anima approves Epii promotion" question — the inversion of authority is structural.
- Episodic arc ownership: S3' owns lifecycle and storage; S5'/Epii owns invocation/search/arc-governance policy (S4-SPEC decision 7, S5-SPEC decision 8). Settled.

**On autoresearch shape:**

- The autoresearch loop traverses the **QL 6-fold arc** P0→P5, NOT a Honcho-shaped three-pass: P0 baseline (`s_5_baseline_artifact`) → P1 challenger via Zeithoven (`s_5_challenger_artifact` / `s_5_zeithoven_next_form`) → P2 evaluation via Darshana (per-target heuristic plugs in here) → P3 keep/discard (`s_5_evaluation_result`) → P4 context weave via Moirai + Anansi (`s_5_moirai_weave_targets`, `s_5_anansi_placement`) → P5 promotion through Hen (`s_5_promotion_target`). Sophia's Möbius signal opens the loop.
- The per-target heuristic at P2 is concrete per domain: **skills → tokens / tool success / time-to-completion**; **tech stack → tech debt / compute used**; **tools → speed / accuracy**. The general pattern is that the heuristic itself is #2/#3 territory (Operation/Pattern coordinates) — each improvement target plugs its domain-specific measurement into P2 without changing the arc.
- Klein-bottle topology closes the loop: Sophia's `[P5' insight] | [P0' questions]` signal IS the Möbius return that becomes tomorrow's session ground.
- Drop "cadence" terminology — VAK fires per-turn (Anima's execution language); autoresearch fires on Sophia-Möbius-return or Chronos cron_evening (Night' pass).
- Drop "Hen graduation timing for hypotheses" — hypotheses are transient evaluation state; only the promoted artifact at P5 goes through Hen residency law (Present→Seeds→World).
- Recall integrates with the existing **S3' Redis hot/warm/cold layers** (canonical per envelope schema and S3-SPEC). No parallel "recall mode" abstraction needed.
- Inbox is automated — agent has tooling, decides when to look. Tool surfaces inbox count before full files. No context-injection of inbox into Anima's prompt.

**On chat surface / centre `/` panel:**

- Centre `/` is a **multi-purpose plugin space** for command palette / setup wizard / configuration / readiness / parity map / typed execution routes — and chat lives in this section as one of its surfaces. Per S-AD-HOC-ROADMAP §S0' Portal.
- Slash dispatch is **already specified by API v0.1 line 1666**: gateway routes by prefix to local Rust (S0/S1) / Neo4j (S2) / gateway-internal (S3) / Anima (S4) / Epii (S5). No new IPC to invent. Surface what's there via `portal/surfaces.rs` registry.
- Drop "subscribe" framing. Chat events are envelope-field emissions from S4'/Psyche (`t_1_live_trace_stream`, envelope L9) routed via gateway events. Nothing distinct to "subscribe" to.
- Drop SpaceTimeDB fallback. SpaceTimeDB is the multiplayer/social layer. Local single-user uses gateway-internal session state. SpaceTimeDB is *additive* when multiplayer is on, not a fallback.
- Direct PI agent interface, future portal centre `/` chat, and OmniPanel chat (Electron→Tauri) all consume the same gateway event stream + same `s0./s1./s2./s3./s4./s5.` prefix-routed methods. Render differs per surface; behavior must not fork.

**On UX micro-decisions:**

- Foundational with extension space. Lens-square indicator fires on lens shifts. Status bar refresh on turn boundary + threshold crossings. Interrupt: partial response stays with `[interrupted]` badge. Multi-surface: same gateway event contract.

**On Sophia / QL-aligned dialectic:**

- QL is the upgraded dialectic. The 6-fold arc P0→P5 IS the autoresearch dialectic. Sophia opens at CF=`(5/0)` post-execution; loop traverses P1–P4 via Zeithoven/Darshana/Moirai/Anansi; Hen materialises at P5. Klein bottle topology returns to P0 via Möbius.
- Hermes Honcho's three-pass (Hegelian inheritance) and our six-fold (Quaternal Logic) are structurally not parallel — record as architectural delta, not parity correspondence.

---

## Resolutions to FR1 + FR2 (groups G–O)

After the FR1 (skills/plugin parity) and FR2 (messaging gateway integration) reports plus Frank's corrections, additional resolutions:

**G — Skill ecosystem direction:** Skills are an open ecosystem. No hard gating for or against skill additions. The structured concern is *coordinate-system / QL-grammar evaluation* of incoming skills, which becomes a canonical Aletheia/Sophia operation: **new-skill evaluation pass** that classifies, coordinate-tags, and routes new skills through Hen graduation (Present → Seeds → World) per the existing residency law. This is the inverse of agentskills.io export-only thinking; we accept skills openly and let Aletheia/Sophia do the coordinate-typing work. Lift Hermes's Skills Hub trust-tier model as ranking metadata (not gatekeeping).

**H — Drop "cadence" terminology.** Use "QL phase" + "fire trigger" (per-turn / per-Möbius-return / per-cron-evening). Already settled in earlier Resolutions.

**I — User-orientation snapshot (formerly "peer card"):** potentially useful, but not locked. Honcho's "peer card" naming is alien, and even its field shape (`name`, `role`, `preferences`, `patterns`) should remain provisional until the protected Pratibimba / PASU identity model at M4.4.4.4 decides what the read-facing orientation surface should expose. If such a snapshot exists, authority is **Epii write + Aletheia membrane assist; Anima read-only**, and it is stored under protected M4.4.4.4 Pratibimba identity law.

**J — Drop the "Hermes has no Aletheia equivalent" note.** Not worth noting in matrix.

**K — Drop "subject provisioning policy" framing entirely.** The subject-coordinate-resolver is purely identity continuity, not access control. There is no "unknown subject" gate concept — first contact creates the subject node; the user IS allowed; the question is only which canonical Bimba node maps to their platform identity. Drop FR2's provisioning vs gating modes; replace with simple first-contact node creation.

**L — Drop platform-trait `truncate_message`.** Response sizing is the PI agent / model layer's concern (it knows what response length to produce). Platform-level chunking — splitting a long message into N platform messages because Telegram's 4096-char limit — is a per-platform-impl detail, not a trait surface. If a specific platform needs chunking, that platform's adapter handles it internally.

**M — Cron output via Graphiti + DAY/NOW vault, not flat file ledger.** FR2's `~/.epi/cron/output/{job_id}.{timestamp}.log` is wrong. Cron output writes through the temporal substrate: (a) a `s5.episodic.record` call with cf/ct/kairos metadata (S3' Graphiti runtime, S5 governance) for the cross-temporal lineage; (b) a `khora_write` to `Empty/Present/{DD-MM-YYYY}/{NOW-id}/cron-{job_id}.md` (S1' Hen residency) for vault retrieval. Chronos schedules; Janus integrates the temporal lineage forward/backward; Zeithoven manages session pacing. The flat-file ledger Hermes uses is replaced by coordinate-typed episodic + vault dual-write.

**N — Hot-reload always.** Platform adapters (the Rust impls of `BasePlatformAdapter` per platform — Telegram, Discord, Slack, WhatsApp, Signal, Email, etc.) are pluggable runtime modules. Adding a new adapter does not require gateway restart. (Platform adapter = the code that bridges to a specific messaging channel: handles connection, sending, receiving. Each platform = one impl of the trait.)

**O — Subject node schema follows S2 coordinate-driven full schema.** No invented minimal schema. Subject nodes carry the canonical Bimba schema (`:Bimba` label authority, 3072-dim embedding, coordinate property per S2-SPEC + graph-schema crate) PLUS episodic-bridge fields connecting the Bimba namespace to the Graphiti episodic namespace via `RELATES_TO_COORDINATE` edges. The subject IS a coordinate-typed node, indexed alongside other Bimba nodes, not a parallel registry.

---

## Matrix F — Method/Envelope/Contract-Level Parity (populated)

Cleaned-up consolidation across T1–T4. Format: method/event → envelope layer.field(s) → contract entry → tool surface.

### Anima dispatch (S4 / S4')

| # | Method/Event | Envelope L.field(s) | Contract entry | Tool surface |
|---|---|---|---|---|
| F1 | `s4.agent.query` (async inter-agent RPC) | L1 transport (`s_3_target_agent`); L4 coordinate (`coordinate_context`); L8 execution | `capability-matrix.json` declares which methods Anima may query on Epii | anima-native-ts |
| F2 | `s4.agent.notify` (fire-and-forget) | L1; L10 crystallisation (payload) | `capability-matrix.json` notify permissions per event type | anima-native-ts |
| F3 | `s4.agent.status` | L2 runtime; L4; L8 | gateway-native (no capability gate; runtime observability) | s3'-runtime |
| F4 | `s4'.vak.evaluate` | L4 (`c_4_primary_family`, `c_4_primary_coordinate`, `c_3_cpf`, `c_1_ct`, `c_4_cp`, `c_4_cf`, `c_5_prime_targets`); L8 (`p_2_intent_class`, `c_3_execution_mode`); L12 (`c_3_ql_modal`, `c_4_topological_mode`) | `capability-matrix.json` skills `vak-evaluate`, `vak-coordinate-frame` (Anima authority) | anima-native-ts (Pleroma skill); Rust fallback at `epi-cli/src/agent/vak.rs` |
| F5 | `s4'.team.compose` / `s4'.team.status` | L4; L8 (`s_4_team_composition`) | `capability-matrix.json` per CF (agent_route) | anima-native-ts (Pleroma skill `team`) |
| F6 | `s4'.cs.state` / `s4'.cs.transition` | L8; L3 (Day/Night' phase from `s_3_day_id` + session lifecycle) | `capability-matrix.json` Day/Night' gates; Night' (CS5) forbids `cf_frame=(4.0/1-4.4/5)` autonomous dispatch | s4-runtime via Khora/Chronos |
| F7 | `s4'.orchestrate` | L8 (`c_3_execution_mode`); L4 (cf_frame); L7 (team_composition) | `capability-matrix.json` per CF mode permissions | anima-native-ts (Pleroma skill `anima-orchestration`) |
| F8 | `s4'.context.assemble` | L6 (`s_2_source_set`, `s_2_scope_coordinates`, `s_2_disclosure_density`, `s_2_kbase_pool_id`); L7 (`s_4_active_context_pack`); L2 (`s_4_write_surface`) | `capability-matrix.json` disclosure_density per primary_family | anima-native-ts (Nous dis-closure) |
| F9 | `s4'.psyche.state` / `s4'.psyche.update` | L7 (`s_4_operative_notebook`, `s_4_current_task`, `s_4_current_subtasks`, `s_4_active_artifact_set`, `s_4_visibility_stance`, `s_4_run_local_continuity`) | Pleroma `agents/psyche.md` ANIMA.md identity | anima-native-ts (Psyche) |
| F10 | `s4'.thought.route` / `s4'.thought.list` | L9 (`t_3_t_lane_activations`, `t_1_live_trace_stream`); L10 (`t_5_yield_types`) | Aletheia owns trigger; Epii owns deeper crystallisation | anima-native-ts (Aletheia S4.5') |
| F11 | `s4'.crystallise` | L10 (`s_5_crystallisation_state`, `s_5_review_inbox_item`); L11 (`s_5_improvement_mode`, `s_5_sophia_vector`) | `capability-matrix.json` priority gating; Aletheia trigger; Epii executes heavy work | anima-native-ts (Aletheia + Sophia) |
| F12 | `s4'.notify_user` | L1 (channel); L8 (content); L10 (if type='report') | Aletheia is sole source of user notifications | s3'-runtime via gateway routing |
| F13 | `s4'.permission.get` | L2 (`s_4_permission_boundary`) | `capability-matrix.json` per VAK output | anima-native-ts |
| F14 | `s4'.goal.set` / `s4'.goal.get` | L8 (`s_4_operative_goal`) | gateway-internal | anima-native-ts |
| F15 | Three-hook lifecycle: `pre_tool_call` (VAK gate) / `post_tool_call` (lens-pressure on changes only) / `transform_tool_result` (coordinate-aware transform) | L4; L7; L8 | Lift exactly from Hermes `model_tools.py:679-818`; place VAK gate at `pre_tool_call` | anima-native-ts |
| F16 | `delegate_lens(lens_id, ...)` / `delegate_square(square_id, ...)` (typed subagent) | L4; L8; L10 | Generalises Hermes leaf/orchestrator role typing; coord-typed | anima-native-ts |

### Chat surface (S0' centre `/` plugin + OmniPanel + direct PI interface)

| # | Method/Event | Envelope L.field(s) | Contract entry | Tool surface |
|---|---|---|---|---|
| F17 | Chat events (`t_1_live_trace_stream` projection) | L9 (`t_1_live_trace_stream`, `t_3_episode_state`, `t_3_interim_summary`) | `gateway-contract` event types: `chat.token`, `chat.tool_call`, `chat.lens_pressure` (on lens change), `chat.vak_eval`, `chat.review_deposit`, `chat.kairos_shift` | s3'-runtime emits; portal/OmniPanel/direct PI consume |
| F18 | Slash dispatch via existing prefix routing (no new IPC) | varies by method | `portal/surfaces.rs` registry sources commands; gateway routes per API v0.1 line 1666: `s0./s1.*` → local Rust, `s2.*` → Neo4j, `s3.*/s3'.*` → gateway-internal, `s4.*/s4'.*` → Anima, `s5.*/s5'.*` → Epii | epi-cli (S0') registry; gateway routes |
| F19 | `s3.session.interrupt(session_id, task_id)` thread-bound, no-retry-on-interrupt | L1; L8 | `gateway-contract` | s3'-runtime |
| F20 | Three consumption surfaces (direct PI / portal centre `/` / OmniPanel Electron→Tauri) | L9 chat events; L8 commands | `gateway-contract` event vocabulary + prefix routing | per-surface render; same contract |

### Epii return spine (S5 / S5')

| # | Method/Event | Envelope L.field(s) | Contract entry | Tool surface |
|---|---|---|---|---|
| F21 | Autoresearch QL 6-fold arc: Sophia opens (Möbius signal) → P0 baseline → P1 Zeithoven challenger → P2 Darshana evaluation (per-target heuristic) → P3 keep/discard → P4 Moirai+Anansi weave → P5 Hen promotion | L11 (`s_5_improvement_mode`, `s_5_baseline_artifact`, `s_5_challenger_artifact`, `s_5_evaluation_result`, `s_5_moirai_weave_targets`, `s_5_anansi_placement`, `s_5_promotion_target`); L10 (`s_5_sophia_disclosure`, `s_5_zeithoven_next_form`) | `agent-contract.json` `autoresearch_contract`; `spines: ["autoresearch"]` | epii-native-ts |
| F22 | `s5'.improve.propose` / `s5'.improve.evaluate` / `s5'.improve.promote` / `s5'.improve.status` / `s5'.improve.history` | L11 | `agent-contract.json` `gateway_methods`; promote requires approved `s5'.review.resolve` | epii-native-ts; mirror at `gate/improve.rs` |
| F23 | `s5'.review.inbox` / `s5'.review.submit` / `s5'.review.resolve` / `s5'.review.history` | L10 (`s_5_review_inbox_item`, `s_5_review_resolution`) | `agent-contract.json` `inbox_contract`; `requires_human` guard | epii-native-ts; mirror at `gate/review.rs` |
| F24 | `s5'.epii.status` / `s5'.epii.deposit` / `s5'.epii.user.orientation` / `s5'.epii.pratibimba.status` / `s5'.epii.kairos.context` / `s5'.epii.inbox.count` (proposed) | L7; L10; L11; L12 | `agent-contract.json`; `accepted_deposits_from_anima: review_item, improvement_request, validation_gate, aletheia_crystallisation`; inbox path `Idea/Empty/Present/{DD-MM-YYYY}/` with NOW/session identifiers on each item | epii-native-ts; mirror at `gate/epii.rs` |
| F25 | `s5.episodic.search` / `s5.episodic.deposit` / `s5.episodic.record` (S5 invocation over S3' Graphiti runtime) | L9 (`t_3_episode_id`, `t_3_arc_id`, `s_3_graphiti_node_ids`, `t_3_linked_prior_episodes`) | S3' owns lifecycle/storage; S5/S5' owns invocation/search/governance | epii-native-ts over s3'-runtime |
| F26 | `s5'.mef.apply` / `s5'.mef.evaluate` / `s5'.mef.modal` | L7 (active lens); L9; L12 | `agent-contract.json` MEF surface | epii-native-ts |
| F27 | `s5'.ql.schema` / `s5'.ql.evaluate` (owns `c_0_ql_schema_version`) | L12 (`c_0_ql_schema_version`, `c_0_ql_extension_fields`) | Schema bumps tied to improvement/promote decisions | epii-native-ts |
| F28 | Honcho three-pass dialectic — recorded as **structural delta**, not parity | n/a | n/a | Hermes is Hegelian-3; ours is QL-6 |

### Edge / multi-surface (S3 + providers + ACP + cron)

| # | Method/Event | Envelope L.field(s) | Contract entry | Tool surface |
|---|---|---|---|---|
| F29 | Cron tick (file-locked) + `jobs.json` + delivery target syntax (`origin` / `local` / `platform_name` / `platform_name:chat_id` / threaded / comma-separated). Output written via dual-channel: (a) `s5.episodic.record` to Graphiti with cf/ct/kairos metadata; (b) `khora_write` to `Empty/Present/{DD-MM-YYYY}/{NOW-id}/cron-{job_id}.md`. Chronos schedules; Janus carries temporal lineage forward/backward; Zeithoven paces. NO flat file ledger. | L3 temporal (`s_4_cron_lineage`, `t_3_episode_id`, `t_3_arc_id`); L5 residency (vault path); L9 episodic (`t_3_t_lane_activations`); L1 channel | `gateway-contract` cron section; integrates with `s5.episodic.record` (S5 governance over S3' runtime) | s3-runtime + s3'-graphiti + s1'-hen-write; lift Hermes file-locked tick + delivery target syntax verbatim, replace flat ledger with coordinate-typed episodic + vault dual-write |
| F30 | `BasePlatformAdapter` Rust async trait at `Body/S/S3/gateway/platforms/base.rs`: `name()` / `connect()` / `disconnect()` / `is_connected()` / `send(chat_id, content, reply_to, metadata)` / `send_typing()` / `send_image()` / `send_image_file()` / `send_document()` / `send_voice()` / `send_video()` / `send_animation()` / `edit_message(chat_id, message_id, content, finalize)` (default-not-supported) / `delete_message()` (default-not-supported) / `set_message_handler()` / `reconnect_with_backoff(max_retries)` (default impl: exponential + jitter, 30s cap). Hot-reload always supported (pluggable runtime modules; no gateway restart on adapter add). NO `truncate_message` on the trait — response sizing is PI agent / model concern; platform chunking (if needed) is impl-internal. | L1 transport | `Body/S/S3/gateway/platforms/` (target); `gateway-contract` `PLATFORM_REGISTRY` constant | s3-runtime |
| F31 | ACP server adapter (Zed-consumable) as a S3 protocol option alongside JSON-RPC. Exposes curated subset of `s4.*` (Anima dispatch) + read-only `s5'.epii.*`. ThreadPoolExecutor 4-worker per Hermes pattern. | L1 transport; subset of agent contract | `gateway-contract` adds ACP as protocol family | s3-runtime; lift Hermes `acp_adapter/server.py` shape |
| F32 | Provider profile Rust trait at `Body/S/S4/pi-agent/provider-profile-trait.rs` (or `Body/S/S0/epi-cli/src/agent/techne/`). Attribute set lifted verbatim: `name()`, `fixed_temperature() -> Option<f32>`, `default_aux_model()`, `prepare_messages(Vec<Message>) -> Vec<Message>`, `build_extra_body() -> HashMap<String, Value>`, `build_api_kwargs_extras() -> HashMap<String, Value>`, `fetch_models() -> Result<Vec<String>>`, `auth_type() -> &str`, `env_vars() -> Vec<&str>`, `base_url() -> Option<&str>`. Plugin discovery override-order (bundled → user → legacy). | L2 runtime | S4.T.4 `epi agent techne code` typed surface | epi-cli S4 |
| F33 | MCP server: lift Hermes `events_poll(after_cursor)` + `events_wait(after_cursor, timeout)` cursor-based event streaming pattern for future S5' epi-mcp. | L9 episodic | `Body/S/S2/external/bimba-mcp` (live, S2'); future `Body/S/S5/epi-mcp` | mcp-stdio |
| F34 | Subject-coordinate-resolver as gateway pre-agent step (between `connect` handshake and any S4/S5 dispatch). Resolves inbound platform identity → canonical Bimba subject node via Neo4j query (`MATCH (subject:Bimba { canonical_identity: "{platform}:{user_id}" })`). On first contact, creates a new `:Bimba` subject node following S2's full coordinate-driven schema (label authority, 3072-dim embedding, coordinate property per `Body/S/S2/graph-schema`) plus episodic-bridge fields linking to Graphiti namespace via `RELATES_TO_COORDINATE` edges. NO provisioning / gating policy — first contact creates the node; user is allowed; resolver is purely identity continuity. Populates new envelope L1 field `s_3_subject_coordinate` (Bimba node ID). Hermes has zero analogue — this is our categorical addition. | L1 transport (`s_3_subject_coordinate` NEW); L4 coordinate (links Bimba node) | `Body/S/S3/graph-services/subject_resolver.rs` (target); `s3.subject.resolve` API method (new) | s3-runtime + s2-graph-services |

### Skills, plugin lifecycle, evaluation (S4/S4' + S5/S5' + S1')

| # | Method/Event | Envelope L.field(s) | Contract entry | Tool surface |
|---|---|---|---|---|
| F35 | Aletheia/Sophia **new-skill evaluation pass**: when a new skill enters the ecosystem (any source — local author, agentskills.io import, community contribution), Aletheia/Sophia run a canonical coordinate-typing pass that assigns S-layer + VAK kind + agent affinity, then routes through Hen graduation (Present → Seeds → World). Open ecosystem; no gating; structured evaluation. | L4 coordinate; L5 residency; L10 crystallisation (`s_5_anansi_placement`) | `Body/S/S4/plugins/pleroma/skills/skill-evaluation/` (new skill); Aletheia subagent invocation | anima-native-ts (Aletheia trigger) → epii-native-ts (governance) → s1' Hen graduation |
| F36 | Three-hook tool-dispatch lifecycle declared in `Body/S/S4/plugins/pleroma/hooks.json`: `pre_tool_call` (VAK/permission gate, can block), `post_tool_call` (Psyche context/kbase/task-field observation, emits only meaningful lens/context shifts), `transform_tool_result` (coordinate-aware transform; injects VAK/envelope result block). The Hermes seam is lifted, but execution state is held by DAY/NOW + Psyche, not by generic plugin middleware. | L3 temporal; L4 coordinate; L7 lived-environs; L8 execution | `Body/S/S4/plugins/pleroma/hooks.json` + `lifecycle-hooks.ts` (impl) + Psyche state surface | anima-native-ts |
| F37 | User-orientation snapshot (tentative): the externally-readable face of Pratibimba identity Epii stewards, only if the Pratibimba/M4.4.4.4 schema wants that surface. Honcho's fields (`name`, `role`, `preferences`, `patterns`) are inspiration, not authority. **Authority: Epii write + Aletheia membrane assist + Anima read-only.** | L10 crystallisation (CT5 user-position artifact); L11 improvement only if user-orientation horizon is accepted | `Body/S/S5/epii-agent/agent-contract.json: user_orientation_fields` (proposed, not locked); M4.4.4.4 Pratibimba schema | epii-native-ts |
| F38 | Typed subagent role-typing in `capability-matrix.json:agents[].role_restrictions` + new typed Anima delegation tools `delegate_lens(lens_id, task)` and `delegate_square(square_id, task)`. Generalises Hermes `tools/delegate_tool.py:25-35` leaf/orchestrator distinction with coordinate-typed variants. | L4 coordinate (lens/square id); L8 execution (`s_4_team_composition`); machine-checkable gate at L4 | `Body/S/S4/plugins/pleroma/capability-matrix.json` | anima-native-ts |
| F39 | Trust-tier ranking metadata in portal surface registry (NOT gatekeeping — open ecosystem). `trust_tier: builtin | trusted | community` + `last_checked_at` per registry entry; 1h cache for Hen-exported skills; trust tier feeds completion / search ranking (display order, not access). Lifted from Hermes `tools/skills_hub.py:68` SkillMeta shape. | L7 lived-environs (`c_7_skill_discovery_trust`) | `Body/S/S0/epi-cli/src/portal/surfaces.rs` registry refinement | epi-cli S0' |
| F40 | `s4'.pleroma.gate.evaluate(agent_id, skill_name, context) → { pass: bool, reason: string }`: machine-checkable capability-matrix gate evaluator. Reads `capability-matrix.json` and applies role/entitlement rules deterministically; observable in chat stream. Hermes has implicit toolset filtering only; ours is declarative + auditable. | L4 (`c_4_pleroma_gate_result` NEW) | `Body/S/S4/plugins/pleroma/gate-evaluator.rs` (new) | anima-native-ts |

### What is NOT a parity target (architectural deltas worth recording)

- **Honcho three-pass (Hegelian)** vs **QL 6-fold autoresearch (Quaternal Logic)**: structurally different by design. Not a parity correspondence — confirmed lock; FR1's attempted re-mapping rejected.
- **Per-platform-chat session keys** vs **DAY/NOW + subject-coordinate-resolver**: different identity model.
- **SQLite session DB** vs **SpaceTimeDB session_surface projection**: different distribution model.
- **Single-user TUI** vs **three consumption surfaces (direct PI / portal / OmniPanel) sharing one gateway event contract**: different consumption model.
- **Flat MEMORY.md/USER.md** vs **12-layer envelope + Hen graduation + Pratibimba protected M4.4.4.4**: different memory model.
- **Nudge-prompt "self-improvement"** vs **autoresearch 6-fold + Aletheia/Sophia/Epii contracts**: different self-improvement model.
- **TeeTransport as fallback** (Hermes pattern): rejected. SpaceTimeDB is the multiplayer/social layer, additive when on, not optional-with-fallback. Local single-user uses gateway-internal session state. TeeTransport may live inside gateway-contract as a pure local fan-out pattern (one emit, multiple local consumers — terminal + sidecar) IF useful, but never as a SpaceTimeDB substitute.
- **Flat skills directory + implicit toolset gating** vs **Pleroma capability-matrix.json + ta-onta tools.json + Aletheia/Sophia new-skill evaluation pass**: skills are an open ecosystem in our model; what's structured is the coordinate-typing of incoming skills (Aletheia/Sophia run a canonical evaluation pass that classifies, coordinate-tags, and routes new skills through Hen graduation).
- **Cron flat file ledger** (`~/.hermes/cron/output/...`): rejected. Replaced by Graphiti episodic record + DAY/NOW vault dual-write coordinated by Chronos / Janus / Zeithoven (per F29 refinement).

---

## Spec Subtasks (immediate updates implied by this work)

Tracked as TODOs against the relevant spec/contract files. To be picked up as small dedicated shards before the next major build pass.

| # | File | Change | Reason |
|---|---|---|---|
| ST1 | `Idea/Bimba/Seeds/S/S4/S4-SPEC.md` §B "S4'Cx Projection" table (lines ~547–558) | Correct the table that maps each ta-onta extension to a single VAK dimension. VAK is Anima's six-dimensional grammar living in Pleroma skills; ta-onta extensions are infrastructure (Khora=bootstrap; Hen=vault membrane; Pleroma=skills surface holding VAK; Chronos=timing; Anima=evaluator; Aletheia=UX membrane). Replace the projection table with a clear separation per the substrate section of this FLOW. | Per canonical [[VAK-HANDOVER]] (2026-02-19/20), the OMX VAK skill fork plan (2026-04-04), and the Anima VAK gate skill injection plan (2026-04-04). |
| ST2 | `Idea/Bimba/Seeds/S/S4/S4-SPEC.md` derivation notes + VAK Gate section | Reference the canonical VAK source files (`Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-HANDOVER.md`, `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-omx-vak-skill-fork-plan.md`, `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-04-04-anima-vak-gate-skill-injection.md`) so the spec doesn't drift again. | Source-traceability. |
| ST3 | `Body/S/S4/plugins/pleroma/capability-matrix.json` | Normalize the `kind` field across skill entries so the VAK relationship is explicit (e.g. distinguish "vak-coordinate-assignment" / "vak-dispatch" / "vak-coordinate-framing" / "psyche-continuity" from OMX-forked operational kinds). Add `vak_dimension_evaluated` field per VAK skill so the matrix machine-checks which dimensions each skill produces. | Makes VAK provenance machine-checkable. |
| ST4 | `Body/S/S5/epii-agent/agent-contract.json` | Add `inbox_path` field with value `Idea/Empty/Present/{DD-MM-YYYY}/`; individual inbox items carry NOW/session identifiers in frontmatter or filename. | Per Frank's correction: Epii's inbox is day-scoped and relative to the DAY/NOW system, not buried under one NOW session folder. |
| ST5 | [[FLOW 2026 04 24 PI AGENT API v0.1]] | Add `s5'.epii.inbox.count` as a quick-read companion to `s5'.review.inbox`; document explicitly that Epii's tooling surfaces inbox count first, full files on demand (no context-injection of inbox). | Per resolution above. |
| ST6 | [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] | No new fields; confirm that `c_0_ql_schema_version` (L12) covers Anima/Epii version coordination. Update §"How to Read this Schema" to clarify VAK fields (`c_*`) are produced by Anima evaluation per turn (not distributed across ta-onta extensions). | Resolves coordinate-context versioning question without inventing mechanism. |
| ST7 | [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]] §III "Three-Surface Tool Architecture" | Add explicit statement: VAK lives in Surface 2 (Agent-Self Operations, native TS in Anima — specifically `vak-evaluate`, `anima-orchestration`, `vak-coordinate-frame` skills loaded via `before_agent_start` hook). | Closes the "where is VAK" question for future readers. |
| ST8 | All four temp subagent reports under `_hermes-parity-temp/` | Rename to `.deprecated.md` after this matrix integration is validated. Remove the temp folder once the next review tasks (Hermes skills/plugin parity, messaging gateway integration) complete and are integrated. | Per Working Protocol §"Validation & Integration Cycle". |
| ST9 | Aletheia subagent specs at `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/` | Add new agent file `skill-evaluator.md` (or expand Mercurius agent — the cross-domain translator) as the subagent that runs the canonical new-skill evaluation pass. Specify: input (incoming skill bundle), output (coordinate-tagged skill manifest entry + Hen graduation request), invariants (no gating; pure classification + routing). | Per resolution G — Aletheia/Sophia own the new-skill evaluation pass; this is the structured side of an open skill ecosystem. |
| ST10 | `Body/S/S4/plugins/pleroma/hooks.json` | Add explicit hook declarations for `pre_tool_call` (VAK/permission gate), `post_tool_call` (Psyche context/kbase/current-task field observation, fires only on meaningful field/lens changes), `transform_tool_result` (coordinate-aware transform with VAK/envelope block injection). Wire each to DAY/NOW/session-aware gateway events. | Per F36; lift Hermes's hook seam while grounding lifecycle in VAK execution, Psyche context, and Khora/Chronos DAY/NOW substrate. |
| ST11 | `Body/S/S4/plugins/pleroma/gate-evaluator.rs` (new file) | Implement `s4'.pleroma.gate.evaluate(agent_id, skill_name, context)` as a Rust function that reads `capability-matrix.json`, applies role_restrictions + agent entitlement rules, returns deterministic `{ pass: bool, reason: string }` decision. Add corresponding gateway method. | Per F40; makes capability membrane machine-checkable rather than implicit-by-toolset-filter. |
| ST12 | `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` autoresearch section + `Body/S/S5/epii-agent/agent-contract.json` | Document the **QL P0–P5 arc as the autoresearch dialectic shape** (NOT a Honcho-3 wrapper); record Honcho-3 vs QL-6 as architectural delta per matrix F28. Specify fire triggers (per Möbius-return signal / per Chronos cron-evening). Drop "cadence" terminology. | Per resolution C + F28; locks the QL-as-dialectic shape into the spec so future readers don't re-import Hermes-style cadence/depth thinking. |
| ST13 | `Body/S/S5/epii-agent/agent-contract.json` + M4.4.4.4 Pratibimba schema in `Body/S/S2/graph-schema/` | Decide whether a `user_orientation_fields` read-facing snapshot is needed at all. If accepted, define it under protected M4.4.4.4 Pratibimba authority with read/write ACL: Epii write + Aletheia membrane assist + Anima read-only. **Do not lock Honcho's peer-card schema as authority.** | Per current uncertainty: user-orientation may be useful, but Pratibimba/PASU identity architecture is the real source, not Hermes/Honcho. |
| ST14 | `Body/S/S4/plugins/pleroma/capability-matrix.json` + `Body/S/S4/plugins/pleroma/skills/anima-orchestration/SKILL.md` | Add `agents[].role_restrictions` field per agent. Add `delegate_lens(lens_id, task)` and `delegate_square(square_id, task)` as new typed Anima dispatch tools (coordinate-typed generalisation of Hermes leaf/orchestrator). | Per F38. |
| ST15 | `Body/S/S4/pi-agent/provider-profile-trait.rs` (new file) or `Body/S/S0/epi-cli/src/agent/techne/provider.rs` | Port Hermes `providers/base.py:24-165` ProviderProfile attribute set verbatim to a Rust trait. Implement plugin discovery override-order (bundled → user → legacy). | Per F32; concrete shape for S4.T.4 `epi agent techne code` model dispatch. |
| ST16 | `Body/S/S3/gateway-contract/src/lib.rs` (refinement) + `gateway-runtime` | Add `PLATFORM_REGISTRY` constant + per-platform-impl auto-discovery via env-detection (e.g. `EPI_TELEGRAM_TOKEN` → Telegram adapter auto-enables). Hot-reload always supported (adapters are pluggable runtime modules; gateway does not require restart on adapter add/remove). | Per F30 + resolution N. |
| ST17 | `Body/S/S0/epi-cli/src/portal/surfaces.rs` registry refinement | Add `trust_tier: builtin | trusted | community` and `last_checked_at` to surface registry entries. 1h cache for Hen-exported / community skills. Trust tier feeds completion + search ranking (display order, NOT access gate). | Per F39 + resolution G; lifted from Hermes Skills Hub trust model. |
| ST18 | New envelope field at L1 Transport: `s_3_subject_coordinate` | Add to [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] §1 Transport: `s_3_subject_coordinate` | [[S3]] (pre-agent step) | Subject-coordinate-resolver | none | hot. Bimba node ID resolved by gateway pre-agent step. | Per F34 + resolution K. |
| ST19 | Cron output dual-write contract in [[S3-SPEC]] + `Body/S/S3/gateway/cron.rs` (target) | Replace flat-file ledger pattern with dual-write: (a) `s5.episodic.record` to Graphiti (S3' runtime / S5 governance) with cf/ct/kairos metadata; (b) `khora_write` to `Empty/Present/{DD-MM-YYYY}/{NOW-id}/cron-{job_id}.md` (S1' Hen residency). Coordinated by Chronos schedule + Janus temporal lineage + Zeithoven pacing. | Per resolution M + F29. |
| ST20 | `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` §A | Add `s3.subject.resolve(platform, platform_user_id)` API method that returns the canonical Bimba subject node ID. Specify first-contact behaviour (create new `:Bimba` subject node following S2 full schema + episodic-bridge fields linking to Graphiti via `RELATES_TO_COORDINATE`). | Per F34 + resolution O. |

---

## Further Review Tasks (queued for next pass)

These are deliberately full-scope review streams rather than a small cherry-pick. Hermes is used as inspiration for battle-tested patterns; Epi-Logos remains the architectural authority. Each stream must ask: what Hermes pattern strengthens our typed S/S' + M' contracts, what should be rejected as flat-product debt, and what existing Epi-Logos structure already surpasses the pattern.

Once this matrix lock is validated, the immediate next-pass items are:

**FR1. Hermes skills / plugin surface vs ours.** Read `vendors/hermes-agent/skills/`, `vendors/hermes-agent/optional-skills/`, `vendors/hermes-agent/tools/skills_hub.py`, and the agentskills.io standard. Compare against our `Body/S/S4/plugins/pleroma/skills/` (OMX-forked VAK-aware skill body), `Body/S/S5/plugins/epi-logos/skills/` (Epii resource skills), the ta-onta extension `tools.json` manifests, and the four `.claude-plugin/plugin.json` files. Goal: identify (a) what shape we should expose for community-distributable skills (agentskills.io export bridge?), (b) where Hermes's skill discovery + sync mechanism is worth porting against our Hen residency law, (c) what plugin packaging discipline we can lift verbatim. Land findings as appended rows in this matrix (Matrix F + Spec Subtasks), not a new FLOW file.

**FR2. Messaging channel integration into the gateway.** Read `vendors/hermes-agent/gateway/`, `vendors/hermes-agent/gateway/platforms/` (every platform adapter), `vendors/hermes-agent/gateway/builtin_hooks/`, `vendors/hermes-agent/cron/`, and `vendors/hermes-agent/docs/ADDING_A_PLATFORM.md` if present. Compare against our [[S3-SPEC]] gateway-contract, `Body/S/S3/gateway-contract/`, the existing `epi gate` command surface, and the cron lineage in `cron/scheduler.py`. Goal: produce the Rust-trait shape of `BasePlatformAdapter` (per Matrix F30), the cron tick + delivery-target-syntax port (per Matrix F29), and the subject-coordinate-resolver gateway pre-agent step (per Matrix F34). Land findings as Matrix F refinements + a fresh shard candidate for [[S-SHARDING-TASK-LIST]].

Both are scoped to extend this matrix file rather than spawn new FLOW files. Same protocol as T1–T4: read substrate (Tier 1) + relevant Sx-SPECs (Tier 2) + Hermes drill paths; produce findings against typed contracts; surface decisions back to Frank for validation before integration.

**FR1 + FR2 outcomes integrated above** in Matrix F (F35–F40 added; F29/F30/F34 refined per Frank's corrections), Spec Subtasks ST9–ST20, and the shard candidate immediately below.

---

## Shard Candidate: BasePlatformAdapter + Cron Dual-Write + Subject-Coordinate-Resolver

In [[S-SHARDING-TASK-LIST]] grammar. Builds on Phase 3 (S3 gateway/redis-context/graphiti-runtime extraction) and Phase 3A (gateway session runtime / Khora parity). To be picked up after current Phase 3A work completes.

### Goal

Extract and implement: (i) the `BasePlatformAdapter` Rust async trait at `Body/S/S3/gateway/platforms/base.rs`, (ii) the cron tick + delivery-target-syntax port writing through Graphiti episodic + DAY/NOW vault dual-write (NOT a flat ledger), (iii) the subject-coordinate-resolver gateway pre-agent step that maps platform identities to canonical `:Bimba` subject nodes following S2's full coordinate-driven schema.

### Why now

- Matrix F29 / F30 / F34 are concretely specified after FR2; no longer schematic.
- S3 gateway needs platform abstraction before adding Discord / Signal / Email channels (currently Telegram-only at the implementation level).
- Cross-platform identity continuity is a structural delta from Hermes; resolving it early prevents per-platform-chat session-key lock-in.
- Cron output via Graphiti + DAY/NOW vault is the right shape, anchored to the temporal substrate Chronos / Janus / Zeithoven already coordinate.
- The Pleroma three-hook lifecycle (ST10) becomes legible only when read against VAK execution, Psyche's context/kbase/current-task field, and Khora/Chronos DAY/NOW state. The platform adapter trait is the external edge, not the lifecycle's source.

### Files

**Primary (new):**

- `Body/S/S3/gateway/platforms/base.rs` — `BasePlatformAdapter` async trait per F30
- `Body/S/S3/gateway/platforms/telegram.rs` — first concrete impl (lift from Hermes shape)
- `Body/S/S3/gateway/cron.rs` — tick + delivery-target syntax + dual-write to Graphiti + Hen vault
- `Body/S/S3/graph-services/subject_resolver.rs` — subject-coordinate-resolver per F34

**Refinement (existing):**

- `Body/S/S3/gateway-contract/src/lib.rs` — add `PLATFORM_REGISTRY` constant + auto-discovery contract; add `s_3_subject_coordinate` to L1 Transport
- `Body/S/S0/epi-cli/src/gate/` — thin S3 gateway command wrappers (delegate to extracted modules)
- `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` — add `s3.subject.resolve` API method per ST20

**Tests:**

- `Body/S/S3/gateway/tests/platform_adapter_contract.rs` — trait coverage (connect / disconnect / send variants / hot-reload)
- `Body/S/S3/gateway/tests/cron_dual_write.rs` — verify both Graphiti episodic record AND Hen vault write fire on cron job execution; verify delivery-target syntax parsing across mixed inputs (origin / local / platform_name / platform_name:chat_id / threaded / comma-separated)
- `Body/S/S3/gateway/tests/subject_resolver_lifecycle.rs` — first-contact node creation; same-user-different-platform identity continuity; full S2 schema compliance (`:Bimba` label, 3072-dim embedding, coordinate property, `RELATES_TO_COORDINATE` episodic-bridge edges)

### Checklist

- [ ] `BasePlatformAdapter` trait compiles; trait-object dispatch tested
- [ ] Telegram adapter implements trait; hot-reload verified (add/remove adapter without gateway restart)
- [ ] Cron scheduler uses trait dispatch; no platform-specific branching in scheduler loop
- [ ] Delivery target parsing matches Hermes syntax exactly (`origin` / `local` / `platform_name` / `platform_name:chat_id` / `platform_name:chat_id:thread_id` / comma-separated)
- [ ] Cron job execution writes to Graphiti via `s5.episodic.record` AND to vault via `khora_write`; flat ledger NOT created
- [ ] Subject-coordinate-resolver creates `:Bimba` subject node on first contact following full S2 schema (graph-schema crate compliance)
- [ ] Subject node has `RELATES_TO_COORDINATE` edges to Graphiti episodic namespace (bridge fields)
- [ ] Envelope L1 carries `s_3_subject_coordinate` in all gateway events; compiler enforces population
- [ ] Same user reaching gateway from Telegram + Slack + Signal resolves to single subject node
- [ ] First-contact provisioning tested (no gating; node always created; user always allowed)
- [ ] Anima receives both platform identity (`s_3_requester`) AND canonical subject coordinate (`s_3_subject_coordinate`) in envelope
- [ ] Pleroma three-hook lifecycle (ST10) wires through the adapter dispatch path

### Verification

- `cargo build --release Body/S/S3/gateway` succeeds
- `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml` all pass
- Live test: gateway dispatches to two registered adapters (Telegram + Slack stub) without restart on adapter add
- Live test: cron job fires; verify Graphiti episodic node created via Neo4j query; verify vault file at `Empty/Present/{DAY}/{NOW}/cron-{job_id}.md`
- Live test: same `EPI_USER_TEST=Frank` reaching gateway from three platform handles → all three sessions resolve to one Bimba subject node
- Envelope inspection: every gateway event includes `s_3_subject_coordinate` field populated with valid Bimba node ID

### Exit condition

Gateway can register and dispatch to two live platform adapters (Telegram + Slack stub) with hot-reload; subject-coordinate-resolver is identity-continuity-only (no gating, no provisioning policy); cron output writes via the temporal substrate (Graphiti + vault), not flat ledger; envelope L1 carries `s_3_subject_coordinate` in all gateway events.

---

## Handoff

Read this matrix beside [[S-SYSTEM-INDEX]] before opening any shard that touches:

- the centre `/` panel of [[epi portal]] or [[OmniPanel]],
- [[Anima]] dispatch loop or [[Pleroma]] capability membrane,
- [[Epii]] review inbox / autoresearch / orientation,
- the [[S3]] gateway-contract or platform adapters,
- the [[S4]] PI agent runtime,
- session lifecycle / lineage / projection,
- the provider abstraction.

---

## Working Protocol — Bounded to This File

This artifact is the single canonical home for the Hermes ⇄ S/S' parity work. Deeper-dive sessions land **inside this file** (extending Matrices A–E with refined rows + adding new sections at the end), not as new FLOW files.

### Temp Folder

A scratch folder beside this FLOW file holds in-flight subagent reports until they are validated and integrated:

- Path: `Idea/Empty/Present/_hermes-parity-temp/`
- Underscore prefix marks it as temp/private; not Hen-graduated; not vault canon.
- Each subagent writes exactly one report file there; no nested file proliferation.
- After integration, temp files are deprecated (renamed `.deprecated.md`) and the folder is removed once all four threads are integrated.

### Subagent Threads

Four parallel threads, one report per thread. Threads are independent and may run concurrently. A fifth thread (subject-coordinate-resolver) is deferred unless explicitly authorised.

| Thread | Scope | Coordinate focus | Output file |
|---|---|---|---|
| T1 | PI agent loop shape ([[Anima]] dispatch) | [[S4]] / [[S4']] | `_hermes-parity-temp/T1-pi-agent-loop-shape.md` |
| T2 | Three chat-consumption surfaces (direct PI / portal `/` / OmniPanel) | [[S0']] + [[S3]] + [[S4]] | `_hermes-parity-temp/T2-chat-surface-convergence.md` |
| T3 | Autoresearch QL-6 dialectic + [[Epii]] return spine, with Honcho as contrast | [[S5]] / [[S5']] | `_hermes-parity-temp/T3-autoresearch-dialectic.md` |
| T4 | Hermes UX instrumentation detail (Ratatui-implementable) | [[S0']] | `_hermes-parity-temp/T4-hermes-ux-instrumentation.md` |
| T5 (deferred) | Subject-coordinate-resolver (gateway pre-agent layer) | [[S2]] + [[S3]] | `_hermes-parity-temp/T5-subject-coordinate-resolver.md` (later) |

### Common Protocol — All Threads Must Follow

**Mandatory reading: Tier 1 (substrate — every thread, all of these):**

1. This matrix file (`FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX.md`) — *all of it*, including the Method-Level Substrate section.
2. `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-PI-AGENT-API-v0.1.md` — the 100-method coordinate-native API; especially the namespace section relevant to the thread plus the connect/agent.capabilities section, the gateway routing rules, and the wire protocol.
3. `Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` — the 12-layer 118-field envelope; especially the layer ownership and compiler spine mapping.
4. `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md` — at minimum the SharedTypes (coordinate primitives + wire protocol) and EnvelopeTypes preamble; full type listing for the thread's namespace.
5. `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-ANIMA-EPII-ARCHITECTURE.md` — peer PI architecture, decoupled domain principle in agent context, three-surface tool architecture, S3' as unified temporal runtime.
5a. `Idea/Bimba/Seeds/S/FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` — Section VIII Decoupled Domain Principle (the load-bearing invariant: domains publish/read only through envelope fields; envelope as anti-corruption layer; per-domain publish/read map).
6. `Body/S/S4/plugins/pleroma/.claude-plugin/plugin.json` and `Body/S/S4/plugins/pleroma/capability-matrix.json` — Anima's executive capability membrane (constitutional agents + skills typed by `layer` + `kind`).
7. `Body/S/S5/plugins/epi-logos/.claude-plugin/plugin.json` and `Body/S/S5/epii-agent/agent-contract.json` — Epii's gateway methods, spines, accepted deposits, allowed requests, authority, forbidden authority, inbox contract, autoresearch contract.
8. `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md` — cross-level harmonisation map.
9. `Idea/Bimba/Seeds/S/S-AD-HOC-ROADMAP.md` — build-readiness roadmap.

**Mandatory reading: Tier 2 (per-thread Sx-SPEC + adjacent contract files):**

- T1: `Idea/Bimba/Seeds/S/S4/S4-SPEC.md` + relevant `S4-y-SPEC.md` subnodes; `Body/S/S4/ta-onta/<module>/<level>/tools.json` for each ta-onta module under S4 (Khora S4-0p, Hen S4-1p, Aletheia S4-5p — at minimum).
- T2: `Idea/Bimba/Seeds/S/S0/S0-SPEC.md` + `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` + relevant subnodes; `Body/S/S3/gateway-contract/` Cargo manifest + lib root.
- T3: `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` + relevant `S5-y-SPEC.md` subnodes; full `Body/S/S5/epii-agent/agent-contract.json`.
- T4: `Idea/Bimba/Seeds/S/S0/S0-SPEC.md` + `S0-3-SPEC.md` (terminal substrate) + `S0-3'-SPEC.md` (cmux pattern law).

**Mandatory reading: Tier 3 (project conventions):**

- `AGENTS.md` and `CLAUDE.md` at C Experiments root — onto-code protocol and gitnexus conventions.
- `Idea/Bimba/Seeds/S/S-SHARDING-TASK-LIST.md` — search by `Sx` heading for current-status entries relevant to the thread.

**Required code drill (living code) — do not reason from docs alone:**

- **Body/ source authority**: agent must read at least the principal Rust files relevant to its thread under `Body/S/Sx/...`. Coordinate-native modules: `Body/S/S0/epi-cli/src/portal/`, `Body/S/S0/epi-cli/src/gate/`, `Body/S/S0/epi-cli/src/agent/`, `Body/S/S2/graph-services/`, `Body/S/S2/graph-schema/`, `Body/S/S3/redis-context/`, `Body/S/S3/gateway-contract/`, `Body/S/S3/epi-spacetime-module/`, `Body/S/S3/epi-app/`, `Body/S/S4/pi-agent/`, `Body/S/S4/ta-onta/`, `Body/S/S4/plugins/pleroma/`, `Body/S/S5/epi-gnostic/`, `Body/S/S5/epii-agent/`, `Body/S/S5/plugins/epi-logos/`, `Body/S/S5/autoresearch/` (if present).
- **Tests**: relevant `Body/S/.../tests/*.rs` and `Body/S/S0/epi-cli/tests/*.rs` are evidence of what is actually built and proven.
- **Capability/agent contracts**: `Body/S/S4/plugins/pleroma/capability-matrix.json` and `Body/S/S5/epii-agent/agent-contract.json` are machine-checkable contracts; agents touching S4/S5 must read these directly.

**Hermes drill (vendored, read-only):**

- Path: `vendors/hermes-agent/`
- Large files (read selectively with grep + 100-200-line excerpts of load-bearing functions): `run_agent.py` (752 KB), `cli.py` (570 KB), `hermes_state.py` (114 KB), `trajectory_compressor.py` (65 KB), `AGENTS.md` (46 KB).
- Smaller files of interest by thread: T1 → `agent/`, `model_tools.py`, `tools/delegate_tool.py`. T2 → `ui-tui/src/`, `tui_gateway/`, `web/src/`. T3 → `plugins/memory/honcho/__init__.py`, `tools/session_search_tool.py`, `cron/`. T4 → `ui-tui/src/` exhaustively, `cli.py` for prompt_toolkit parallels.
- Agents have license to drill further into Hermes for parts genuinely relevant; do not pull in scope creep.

**Tooling:**

- **gitnexus** (per `CLAUDE.md`) for code intelligence: `gitnexus_query`, `gitnexus_context`, `gitnexus_impact`, `gitnexus_cypher`. Encouraged for symbol-level exploration; avoids grepping when execution flows are needed.
- **depwire** (`/Users/admin/Documents/Epi-Logos C Experiments/depwire`, output at `depwire-output.json`) for dead-symbol and dependency surface views. Useful when reasoning about what's still load-bearing in `Body/S/S0/epi-cli/src/`.
- **Read / Grep / Bash** for direct file work.

**Output discipline:**

- One file per thread at the path in the table above.
- Frontmatter: `coordinate`, `c_4_artifact_role: "subagent-report"`, `c_1_ct_type: "CT0"` (draft), `c_3_created_at: "2026-05-08T..."`, `c_0_source_coordinates` linking to this FLOW file + the Tier 1 substrate docs + the Sx specs read.
- Length: 1500–2500 words target; concrete file:line refs throughout; no platitudes.
- Structure (each thread):
  1. **Findings** — concrete shape discovered in code (Body + Hermes), not paraphrased docs.
  2. **Matrix updates implied** — specific rows in Matrices A–E that should be revised, with the new wording proposed.
  3. **Method-level mapping (for Matrix F)** — for every Hermes capability touched, propose:
     - PI API method name (e.g., `s0.command.exec`) — existing in v0.1 or new
     - Envelope layer + field(s) populated/consumed (e.g., `EF:8.s_4_write_surface`)
     - Capability-matrix / agent-contract / plugin-manifest / tools.json entry needed (file path + key)
     - Tool surface (`epi-cli` / `anima-native-ts` / `epii-native-ts` / `s3'-runtime`)
  4. **New rows / sections needed** — anything the existing matrix doesn't yet cover.
  5. **Open questions** — decisions that need Frank's call before integration.
  6. **Next-shard readiness** — does this thread hand off to a [[S-SHARDING-TASK-LIST]] candidate, and if so what's the one-paragraph framing.

### Validation & Integration Cycle

1. Subagent completes; report file written to temp folder.
2. Claude (this thread) reads each return and produces a tight summary in chat for Frank — findings + proposed matrix edits + open questions.
3. Frank validates / corrects / requests deeper drill.
4. Validated content is merged **into this FLOW file** as matrix-row revisions, new rows, and post-matrix sections.
5. Each integrated temp file is renamed `.deprecated.md` to mark it folded in.
6. After all four threads integrated, the entire `_hermes-parity-temp/` folder is removed.

### What This Protocol Prevents

- File proliferation: only this FLOW file is canon; temp files are explicitly transient.
- Winging it: every thread reads S/S' seeds + Body code + Hermes code before output.
- Plugin overdose: each thread is coordinate-bounded to a specific S/S' or M' surface; cross-cutting decisions return here for integration.
- Hermes worship: Hermes is reference, not authority; structurally-ahead rows in this matrix already mark where we don't chase parity.
