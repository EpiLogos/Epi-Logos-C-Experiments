---
coordinate: "S5'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4b"
c_3_created_at: "2026-04-23T00:00:00Z"
c_3_day_id: "23-04-2026"
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
  - "[[Khora]]"
  - "[[Hen]]"
  - "[[Pleroma]]"
  - "[[Chronos]]"
  - "[[Anima]]"
  - "[[Aletheia]]"
  - "[[Sophia]]"
  - "[[Graphiti]]"
  - "[[Bimba]]"
  - "[[Pratibimba]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
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
---

# FLOW 2026 04 23 PARALLEL TRACKS HANDOVER

**Purpose:** Handover document for all active parallel development tracks as of 2026-04-23. Intended to allow any session to pick up without context loss.

**Central framing:** The task is not simply "vendor alignment." It is assessing the full **pi integration of the core [[S1']] compiler backbone**, then understanding exactly how each S-layer's functionality augments and ties into that backbone, such that the [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] can be implemented as running code and not remain planning. Every system — [[ta-onta]] extensions, channels, [[Pleroma]] OMX port, autoresearch loops, gateway additions — needs a declared integration surface against the backbone before implementation begins.

**Grounding files:**
- [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] — S/S' naming, systems residency law, decoupled domain principle
- [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] — 115-field schema across 12 layers; compiler spine mapping table
- [[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]] — 11-layer envelope rationale
- [[S Coordinate Lattice Scaffold]] — named S/S' subcoordinate lattice (CSV + MD)

---

## TRACK A — M-COORDINATE GRAPH POPULATION

**Status:** Ready to execute. No blockers.
**Owner:** [[bimba-vault-map]] skill + [[Anima]] agent session
**Coordinate home:** [[S2]] / [[S2']] / [[Bimba]] / [[Map]]

### What Was Established

The subagent assessment (2026-04-22) confirmed:

- Schema design is canonical and complete (spec dated 2026-04-04)
- DDL layer (`00-bootstrap.cypher`) is production-ready with correct indexes on `c_4_family`, `c_4_ql_position`, vector `c_5_embedding`
- Ingestion pipeline (`epi-gnostic/neo4j_vector.py`, `coordinator.py`) is production-ready for the gnostic namespace
- `bimba-populate` skill is fully documented (8 stages: Stage A semantic apportionment through Stage H validation)
- No M-branch nodes exist in the graph yet — execution is the gap, not design

The coordinate naming convention `{family}_{n}_{semantic}` is already in the graph schema spec, confirming alignment with the [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] field naming.

### Legacy Cleanup Required Before Execution

- `bimbaCoordinate` (legacy field) still referenced in code must be migrated to `coordinate` before M-branch population to avoid dual-naming confusion
- Location: `Idea/Pratibimba/System/bimba-mcp/src/` — update all code references

### Execution Sequence

| Phase | Action | Dependency | Effort |
|---|---|---|---|
| **0. Migration** | Replace `bimbaCoordinate` → `coordinate` throughout `bimba-mcp/src/` | None | 1 session |
| **1A. Test batch** | Run `bimba-populate` Stage A for [[M1]] Paramasiva, 20-node batch; generate `m1-nodes.cypher`; human review cycle | Migration done | 1–2 sessions |
| **1B. M1 full** | Complete [[M1]] node population (~500 nodes at 20–30 batch size) | 1A validated | 2–3 sessions |
| **2. M2–M5** | Sequential population of [[M2]] (~1100 nodes, largest), [[M3]], [[M4]], [[M5]] | 1B done | 4–6 sessions |
| **3. Relations** | Design coordinate-aware relation schema; generate `m{n}-relations.cypher` per branch | Phase 1 complete | 2–3 sessions |
| **4. Pointer web** | Extend `03-pointers-resolve.cypher` — materialise remaining 16 of 18 pointer edge types | Phase 3 complete | 1 session |
| **5. Validation** | Core traversal tests; property spot-checks; update `COORDINATE-MAP.md` | Phase 4 done | 1 session |

### What Can Run in Parallel with Phase 1

- Relation type taxonomy design (no Cypher needed yet — conceptual work)
- Edge property schema (`c_0_type`, `c_1_relation_name`, `c_3_temporal_mode`, `c_4_strength`, subsystem prefix per relation) following node property convention
- Cross-namespace bridge query design ([[Bimba]] ↔ [[Gnostic]])

### Residency

- Node Cypher files: `Idea/Pratibimba/System/bimba-mcp/` (generated)
- Canonical schema spec: `Idea/Bimba/Seeds/` (design artifacts)
- Vault mirror of M-branch: `Idea/Bimba/Map/` (coordinate world mirror — populated post Phase 2)

---

## TRACK B — PI INTEGRATION ASSESSMENT

**Status:** Not started. This is the priority track to open.
**Owner:** Architecture session with full codebase access
**Coordinate home:** [[S1']] as envelope substrate; spans all S/S' layers

### Framing

Track B is not "check the vendor docs." It is a **full integration audit** — assessing exactly how the `claude-memory-compiler` vendor package (the [[S1']] base) integrates with the `.pi/` agent harness, then for each S layer, declaring precisely what augmentation the backbone needs to carry that layer's envelope fields.

The output is not a report. It is a **per-layer integration declaration** that tells an implementer: here is what the vendor provides, here is what we add, here is the exact hook/ledger/compiler/return-type for each layer, and here is which real package provides it.

This is the document from which the augmented [[S1']] can be coded without veering from the architectural vision.

### B.0 — Core Compiler: Pi Integration Surface

**Vendor package:** `claude-memory-compiler` (`.claude/` directory skeleton or equivalent vendored path — locate actual vendor root)
**Pi harness entry points:** `.pi/extensions/ta-onta/` — 6 extension classes, each with hook seams

**Questions to answer:**

1. What hook events does the vendor compiler natively fire? (pre-session, post-turn, pre-compaction, post-session, etc.)
2. What does the vendor ledger append? What is the ledger schema? Is it typed or freeform?
3. What compiler passes does the vendor run natively? (daily summary, knowledge graph, etc.)
4. What is the vendor query/return API? What can it surface and in what format?
5. How do the `.pi/` hooks (`before_agent_start`, `session_start`, `before_compaction`, `session_end` per [[Khora]] CONTRACT.md) map to vendor hook events? Are they the same mechanism or parallel?
6. What is the extension point — how does a new compiler pass register itself?

**Output for this section:** A table mapping vendor hook events → pi hook seams, with gaps marked.

### B.1 — [[S0]] / [[S0']] — CLI Layer Augmentation

**Vendor baseline:** None. CLI is not in scope for the vendor compiler.
**Pi provider:** [[Khora]] `S0/cli/preferred-tools.json`, `S0/cli/resolve.sh`, `S0'/cli-primitives.md`
**Runtime providers:** `bat`, `rg`, `eza`, `zoxide`, `jq`, `fzf`, `gh`, `just`, `cmux`/`tmux`

**Augmentation needed:**

- `s_0_tool_surface` hook: fires on session start, reads `preferred-tools.json`, injects resolved tool paths into runtime envelope
- `s_0_terminal_substrate` hook: fires on session start, detects cmux/tmux topology, injects pane layout
- `s_0_workspace_root` hook: fires on session start from shell `$PWD` + `zoxide` state
- `s_0_env_config` hook: fires on session start, loads `~/.epi-logos/env/base.env` + `varlock inject`

**Questions to answer:**

1. Are these hooks wired in [[Khora]]'s bootstrap sequence today? Which exist, which are missing?
2. Does `resolve.sh` actually execute preferred-tool resolution at session start, or is it advisory only?
3. What is the cmux/tmux integration point — is topology captured as an envelope field anywhere currently?

### B.2 — [[S1]] / [[S1']] — Vault / Compiler Core

**Vendor baseline:** This IS the vendor. The compiler spine for S1 is what the vendor provides.
**Pi provider:** [[Hen]] (ta-onta) — content form, template instantiation, vault write routing
**Write authority:** [[Khora]] `khora_write` primitive

**Augmentation needed:**

- Verify vendor hook seam covers: `note.created`, `note.modified`, `link.added`, `frontmatter.changed`
- Verify vendor ledger records: file path, timestamp, change type, frontmatter delta
- Verify vendor compiler passes: frontmatter validation, wikilink health, CT type check
- Verify vendor query surface: can return compiled vault state by coordinate family, by CT type, by residency class

**What we add beyond vendor:**
- Residency law enforcement: every write must pass through `s_1_target_vault_zone` + `s_1_target_residency_class` before `khora_write` executes
- CT type validation against the canonical CT type registry (CT4a, CT0, CT4b, etc.)
- `c_0_source_coordinates` injection into frontmatter on creation

**Questions to answer:**

1. Does [[Hen]]'s template instantiation currently inject all required frontmatter fields per the [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] residency layer fields?
2. Does `khora_write` currently validate residency before writing, or does it write anywhere?
3. What compiler passes does [[Hen]] currently run, and do they cover wikilink law, frontmatter law, or only raw write?

### B.3 — [[S2]] / [[S2']] — Graph / Retrieval Augmentation

**Vendor baseline:** None. Graph is not in scope for the vendor compiler.
**Pi providers:** `bimba-mcp` ([[S2']] query interface), `epi-gnostic` ([[S2]] ingestion pipeline), [[Graphiti]] ([[S5.3']] episodic return), Redis ([[S2.4']] hot context cache)

**Augmentation needed:**

- `s_2_redis_context_key` hook: fires on context-economy assembly; populates Redis with session-scoped graph context window
- `s_2_kbase_pool_id` hook: fires when kbase assembly completes; ledger records assembled pool identifier
- `s_2_episodic_handles` hook: fires on session start if prior episodes exist; pulls [[Graphiti]] arc handles into context-economy layer
- `s_2_source_set` compiler pass: interprets `c_4_primary_family` + `c_4_primary_coordinate` from coordinate layer to scope the retrieval query

**Critical distinction to document:** Two Redis instances. Must be explicit in implementation:
- `s_2_redis_context_key` — graph context hot cache at [[S2.4']] — provider: Redis instance for retrieval economy
- `s_3_session_store_handle` — gateway session metadata at [[S3.2']] — provider: separate Redis instance (or separate DB index) for session state

**Questions to answer:**

1. Is there currently one Redis instance or two? Are they namespaced separately if one?
2. Does `bimba-mcp` currently scope queries by coordinate family, or does it query the full graph?
3. Does [[Graphiti]] currently write to the same Neo4j instance as [[Bimba]], or a separate one? (Memory notes suggest same instance, rooted at `#4.4.4.4 PersonalNexus`)
4. What is the `epi-gnostic` trigger — does it run on schedule, on file change, or manually?

### B.4 — [[S3]] / [[S3']] — Gateway, Channels, and Temporal Surfacing

**Vendor baseline:** None. Gateway is not in scope for the vendor compiler.
**Pi providers:** Gateway WebSocket server (port 18794, implementation slot), [[SpacetimeDB]] presence module (`epi-spacetime-module/`), [[Chronos]] (ta-onta), `kairos-python-adapter.ts` + kerykeion

**Gateway channels to document explicitly:**

| Channel | Surface | Provider | Status |
|---|---|---|---|
| Terminal channel | `epi-cli` Rust CLI | [[S0]] layer | Active |
| App channel | `epi-app` Electron/Tauri bridge | [[S3.5]] | Active |
| Telegram channel | `bimba-mcp/src/telegram/` | [[S3.3]] | Exists (assess active status) |
| Web/API channel | Direct HTTP/WebSocket | [[S3]] | Assess if present |

**Augmentation needed:**

- `s_3_channel` hook: fires on connection; identifies and records which channel surface the session arrived through
- `s_3_session_key` vs `s_3_session_id` separation: session_key must survive reconnects; session_id is per-connection. Document whether the gateway currently implements this distinction
- `s_3_kairos_tick` hook: fires when kerykeion data is available; populates `tick12`, `planet_degrees[10]` into temporal envelope — requires `KAIROS_ENABLED` feature flag check
- `s_3_session_store_handle` hook: fires on session open; resolves Redis session metadata handle

**OmniPanel RPC parity:** The gateway must expose these methods and the implementation must match exactly what the [[Pleroma]] OMX port declares (see B.5):
```
sessions.list, config.load, config.save,
skills.list, skills.toggle, skills.saveApiKey,
cron.add, cron.list, cron.toggle, cron.run, cron.remove
```

**Questions to answer:**

1. What is the current gateway implementation — is it the bespoke WebSocket server in `epi-app/main/` or a separate process?
2. Is the Telegram channel currently active and connected to the same session model?
3. Does the gateway currently distinguish `session_key` (stable) from `session_id` (per-connection)?
4. Where does the protocol v3 hello-ok handshake live in the codebase?
5. Does [[SpacetimeDB]] module connect to the same session model as the gateway or is it fully separate presence-only?
6. Is `kairos-python-adapter.ts` currently wired to the gateway or does it operate as a standalone CLI call?

### B.5 — [[S4]] / [[S4']] — Ta-Onta Extensions + [[Pleroma]] OMX Port

**Vendor baseline:** The `.pi/` hook seam is the integration point. Ta-onta extensions register against pi hook events.
**Pi providers:** All 6 ta-onta extension classes — [[Khora]] (S4.0), [[Hen]] (S4.1), [[Pleroma]] (S4.2), [[Chronos]] (S4.3), [[Anima]] (S4.4), [[Aletheia]] (S4.5)

**Extension integration points to document per class:**

| Extension | Hook Seams | Envelope Layers Owned | Compiler Passes | Current Status |
|---|---|---|---|---|
| [[Khora]] | `before_agent_start`, `session_start` | Runtime, Residency | Bootstrap compiler | Assess |
| [[Hen]] | `session_start` | Residency, Temporal (NOW creation) | Frontmatter compiler, CT type validator | Assess |
| [[Pleroma]] | `session_start`, per-skill-invocation | Execution (write_surface, helper_roles) | Skill registry compiler | Assess |
| [[Chronos]] | `session_start`, cron events | Temporal (day_id, arc legitimacy) | Temporal compiler | Assess |
| [[Anima]] | `before_agent_start`, per-turn | Coordinate, Execution, Lived-Environs, QL Process | Coordinate compiler, execution compiler | Assess |
| [[Aletheia]] | `session_end`, night' pass | Crystallisation, Improvement | Crystallisation compiler, improvement compiler | Assess |

**[[Pleroma]] OMX Port — Detail**

[[Pleroma]] owns the skill layer ([[S4.2]]) and the [[Techne]] helper boundary. The OMX (Open Message Exchange) port is the interface through which [[Pleroma]]'s skill and tool operations are exposed to external consumers — the gateway, the [[OmniPanel]], and eventually other S-layer domains — without those consumers knowing [[Pleroma]]'s internals.

Currently this manifests as the OmniPanel RPC methods (`skills.list`, `skills.toggle`, `skills.saveApiKey`) which the gateway must expose and [[Pleroma]] must implement. This is a bounded domain interface — [[Pleroma]] publishes to the OMX port; consumers read from it.

**What to assess:**

1. Does [[Pleroma]] currently implement the `skills.list/toggle/saveApiKey` gateway methods, or is this a stub?
2. What is the actual skill registry mechanism — is it file-based (scanning `.claude/skills/`), config-based, or dynamically registered?
3. Does [[Techne]] currently operate as a bounded helper (consuming envelope fields only) or does it make direct calls into other domains?
4. What is the `S2'/` folder in `pleroma/` for — assess its current state against the [[S2']] coordinate definition
5. Does the `child-extension-propagation.ts` file handle extension inheritance to child pi sessions correctly for all 6 classes?
6. Are the `agent-chain.yaml` and `teams.yaml` files in `.pi/agents/` current and consistent with the constitutional agent roster ([[Nous]], [[Logos]], [[Eros]], [[Mythos]], [[Psyche]], [[Sophia]])?

**[[Anima]] constitutional agents — assess against envelope:**

The [[Anima]] root + `{nous,logos,eros,mythos,psyche,sophia}` agents in `anima/S4'/agents/` are the primary publishers of the coordinate layer and execution layer envelope fields. Each agent's RUPA (format: 6-section) must declare which envelope fields it publishes and which it reads.

- Is the RUPA format consistent across all 6 agents?
- Does each agent declare its CPF frame, CT mode, and VAK frame explicitly?
- Are the [[Aletheia]] subagents ([[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], [[Zeithoven]]) documented with equivalent clarity in `aletheia/clusters/`?

### B.6 — [[S5]] / [[S5']] — Return, Autoresearch, and Improvement Loops

**Vendor baseline:** Partial. Some vendor compilers have a daily summary or knowledge extraction pass — assess whether this maps to any crystallisation or improvement layer fields.
**Pi providers:** [[Aletheia]] (ta-onta), [[Sophia]] agent, [[Moirai]], [[Zeithoven]], [[Darshana]], [[Graphiti]] (arc commit), [[Gnostic]] (night' promotion)

**Autoresearch loop — document integration points:**

The autoresearch / developmental loop (Improvement layer, fields `s_5_improvement_mode` through `s_5_sophia_vector`) requires:

1. [[Sophia]] identifying a developmental vector (`s_5_sophia_vector`)
2. [[Zeithoven]] producing a challenger (`s_5_challenger_artifact`)
3. An evaluation surface being declared (`s_5_evaluation_surface`)
4. A keep/discard decision (`s_5_keep_discard_rule`)
5. The improvement compiler pass closing the loop

**Questions to answer:**

1. Does the autoresearch loop currently have any implementation, or is it design-only in agent RUPA files?
2. What is the night' pass trigger mechanism — is it a cron job in [[Chronos]], a session-end hook in [[Aletheia]], or manual?
3. Does `aletheia_session_promote` (mentioned in memory: promotes session types decision/bugfix/feature/discovery from HOT to WARM→COLD) currently exist as a callable function?
4. What is [[Graphiti]]'s current arc commit mechanism — does it fire automatically on session close, or manually triggered?
5. Does [[Darshana]] have any current implementation, or is it a named but unimplemented agent?
6. How does the `c_0_ql_extension_fields` growth mechanism interact with [[Sophia]]'s improvement loop — is there a current process for QL schema versioning?

---

## TRACK C — CODEBASE REALITY CHECK

**Status:** Not started. Can be parallelised with early Track B sessions.
**Owner:** Architecture session with codebase access
**Coordinate home:** [[S1']] (residency law verification)

### Method

Walk through every implementation slot declared in the [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] and verify: does this component exist at the expected location? Is it full, partial, or missing?

### Slot Verification Checklist

| Slot | Declared Location | Verify | Status |
|---|---|---|---|
| `preferred-tools.json` | `.pi/extensions/ta-onta/khora/S0/cli/` | File exists + content correct | — |
| `resolve.sh` | `.pi/extensions/ta-onta/khora/S0/cli/` | File exists | — |
| `base.env` | `~/.epi-logos/env/base.env` | File exists | — |
| `varlock.toml` | `~/.epi-logos/varlock.toml` | File exists | — |
| `khora_write` primitive | [[Khora]] extension | Implemented or stub | — |
| `khora_sync_queue_push/flush` | [[Khora]] extension | Implemented or stub | — |
| `kairos-python-adapter.ts` | `.pi/extensions/ta-onta/chronos/S3'/` | File exists | — |
| `kerykeion` Python lib | pip installed | `pip show kerykeion` | — |
| Gateway WebSocket server | `epi-app/main/` or standalone | Process + port 18794 | — |
| `epi-spacetime-module` | `epi-spacetime-module/` | Crate exists; SpacetimeDB status | — |
| Redis instance(s) | localhost | Running; namespaces | — |
| `bimba-mcp` | `Idea/Pratibimba/System/bimba-mcp/src/` | Build status | — |
| `epi-gnostic` pipeline | `epi-gnostic/` | Python env + deps | — |
| `agent-chain.yaml` | `.pi/agents/` | Current + consistent | — |
| `teams.yaml` | `.pi/agents/` | Current + consistent | — |
| Constitutional agent RUPAs | `.pi/extensions/ta-onta/anima/S4'/agents/` | All 6 present + 6-section format | — |
| Aletheia cluster stubs | `.pi/extensions/ta-onta/aletheia/clusters/` | All 6 subagent stubs present | — |
| `child-extension-propagation.ts` | `.pi/extensions/ta-onta/khora/S0'/` + `pleroma/S2/` | Files exist; logic current | — |
| Telegram channel impl | `Idea/Pratibimba/System/bimba-mcp/src/telegram/` | Active or dormant | — |

### Legacy Cleanup Items (found to date)

| Item | Location | Action |
|---|---|---|
| `bimbaCoordinate` field | `bimba-mcp/src/` | Migrate → `coordinate` before Track A Phase 0 |
| `--no-tmux` flag | `epi-cli/src/up.rs` | Change → `--no-cmux` per memory notes |
| `/usr/local/bin/epi` shadow | PATH ordering | Use `epi-cli/target/debug/epi` for testing |

---

## DEPENDENCIES AND SEQUENCING

```
Track C (slot verification) ─────────────────────────────→ feeds cleanup backlog
                                                                    ↓
Track B.0 (vendor hook audit) ──→ B.1–B.6 per layer ──→ integration declaration doc
                                                                    ↓
                                              Typed struct shapes (TS + Rust)
                                                                    ↓
                                         Compiler pass stubs (temporal + QL first)
                                                                    ↓
Track A Phase 0 (bimbaCoordinate migration) → A Phase 1A (M1 test batch) → A full
```

Track A Phase 0 is the only Track A step that must wait for nothing. It can start immediately.

Track B should open with B.0 (vendor hook audit) to establish the baseline before assessing each layer's augmentation. B.1–B.6 can proceed in any order after B.0, though B.5 ([[Pleroma]] OMX port) and B.4 (gateway channels) are most architecturally urgent because they gate the integration of all other S layers through the backbone.

Track C runs in parallel with Track B — it is the factual ground-truth check that prevents Track B from becoming idealistic.

---

## OPEN QUESTIONS FOR NEXT SESSION

These are unresolved at time of handover and should be addressed before implementation begins:

1. **Vendor package location** — where exactly does `claude-memory-compiler` live in the repo? Is it a submodule, a vendored directory under `.claude/`, or a separate npm/pip package? Its exact hook API is the Track B.0 first task.

2. **Single vs dual Redis** — is there currently one Redis instance serving both [[S2.4']] graph context and [[S3.2']] gateway session metadata, or two? If one, the namespace separation must be documented before any envelope implementation touches Redis.

3. **[[Darshana]] existence** — is [[Darshana]] (the precision loop agent referenced in [[Aletheia]] and improvement layer) currently implemented anywhere, or named-only?

4. **OMX protocol specifics** — does [[Pleroma]]'s OMX port use the gateway WebSocket RPC protocol (same as OmniPanel methods), or is it a separate message bus? This determines whether the pleroma OMX port is an extension of the gateway or an independent channel.

5. **[[Graphiti]] Neo4j instance** — confirmed same instance as [[Bimba]]? If so, the `group_id` property filter (5-line fork per memory notes) is the only namespace separation. This must be explicit in the graph schema before Track A executes.

6. **QL schema version declaration** — who declares `c_0_ql_schema_version` at session start? Is this [[Anima]], [[Khora]], or derived from a config file? It must be hot (present in every run) so it needs a clear owner and a clear source.

---

## RESIDENCY OF THIS DOCUMENT

- **This file:** `Idea/Empty/Present/FLOW-2026-04-23-PARALLEL-TRACKS-HANDOVER.md`
- **Graduate to:** `Idea/Bimba/Seeds/` once Track B integration declaration is written and reviewed
- **Related outputs:** Track B produces an integration declaration doc (new FLOW in `Present/`); Track C produces a cleanup backlog (new FLOW in `Present/`); Track A produces execution logs in `Pratibimba/Self/`
