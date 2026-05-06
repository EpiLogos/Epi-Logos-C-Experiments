---
title: "Track B — Pi Integration Audit"
date: "2026-04-23"
coordinate: "S4'"
status: "audit"
tags:
  - "[[Track B]]"
  - "[[Pi Integration]]"
  - "[[Ta-Onta]]"
  - "[[Envelope]]"
  - "[[S Coordinate]]"
  - "[[Present]]"
---

# Track B — Pi Integration Audit

**Purpose:** Full audit of the current pi extension layer (ta-onta) against the [[S/S' Coordinate Lattice]], the [[Envelope Field Schema]], and the [[Vendor Hook API]]. Establishes the integration baseline from which all S-layer augmentations proceed.

**Companion docs:**
- [[FLOW-2026-04-23-PARALLEL-TRACKS-HANDOVER]] — parent handover, all three tracks
- [[FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA]] — the contract all S-layers build toward
- [[FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING]] — naming law and residency map

---

## B.0 — Vendor Hook Audit (COMPLETE)

### Two-Track Hook Reality

**Track 1: Claude Code hooks** → `epi-dev-vault/hooks/session-*.py` (S1' baseline memory system)

| Hook | Event | Input | Output | What it does |
|------|-------|-------|--------|--------------|
| `session-start.py` | `SessionStart` | none | `{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "..."}}` | Reads `knowledge/index.md` + last 30 lines of today/yesterday's daily log → injects into session context. Max 20,000 chars. |
| `session-end.py` | `SessionEnd` | stdin JSON: `{session_id, source, transcript_path}` | none (side-effect) | Extracts last 30 turns from JSONL transcript → writes temp `.md` → spawns `flush.py` as detached background |
| `pre-compact.py` | `PreCompact` | same as SessionEnd | none | Same as session-end; safety net before auto-compaction discards mid-session context |
| `flush.py` | (background) | temp `.md` file + session_id | appends to `daily/YYYY-MM-DD.md` | Calls Claude Agent SDK (query, max_turns=2, CLAUDE_INVOKED_BY guard) → extracts knowledge → appends to daily log → post-6pm auto-triggers `compile.py` as second background process |

**Configuration:** `.claude/settings.json` points at `epi-dev-vault/hooks/` (relative path). The live instance is `epi-dev-vault/` at project root — `vendors/claude-memory-compiler/` is the upstream clone.

**Four seams as S1' substrate:**
```
Hook (event capture) → Ledger (daily/YYYY-MM-DD.md, append-only) → Compiler (scripts/compile.py, daily→knowledge/) → Query (scripts/query.py, index-guided)
```

**Augmentation surface for envelope:** The `session-start.py` injects `additionalContext` — this is the seam for injecting envelope fields at session start. Currently only injects S1' (knowledge index + recent log). S3' (session key), S4' (agent identity), temporal layer, and coordinate layer can all be added here. The `session-end.py` transcript extraction is the seam for extracting envelope fields at session end.

---

**Track 2: PI extensions** → `ta-onta` (6 classes, loaded via `composite-entry.ts`)

Load order (dependency-aware):
1. `plugin-runtime-bridge.ts` — bridges `@mariozechner/pi-coding-agent` `ExtensionAPI` to execution layer
2. `khora/extension.ts` — S4.0' bootstrap spine
3. `hen/extension.ts` — S4.1' content form
4. `pleroma/extension.ts` — S4.2' skill operations
5. `chronos/extension.ts` — S4.3' temporal patterns
6. `anima/extension.ts` — S4.4' context inhabitation
7. `aletheia/extension.ts` — S4.5' crystallisation/improvement

**PI event hooks registered:**

| Extension | Event | Action |
|-----------|-------|--------|
| Khora | `session_start` | Autodetect vault name, set `EPILOGOS_VAULT`, run `epi vault day-init`, run `epi agent session init` (generates `EPI_SESSION_ID/EPI_DAY_ID/EPI_NOW_PATH`), run `epi vault now-init` |
| Khora | `session_before_compact` | `epi agent session continuation` → writes CONTINUATION.md |
| Khora | `session_shutdown` | Runs `S0/post-session-close.sh` if exists |
| Chronos | `session_start` | `epi vault day-init`, `epi vault flow-init` (DUPLICATE with Khora — both call day-init) |
| Aletheia | `session_shutdown` | Thought routing comment only — no action registered |
| Aletheia | `cron_evening` | aletheia_session_promote (HOT→COLD), coordinateMobiusReturn, maybeUpdateCoordinateMap, Graphiti community build |

---

## B.1 — S0 / S0' Layer (CLI Ground / CLI Contract Law)

**S0 (CLI Ground) — what's actually wired:**
- `khora/S0/cli/preferred-tools.json` — declared tool preferences (bat, rg, eza, zoxide, jq, fzf, gh, just)
- `khora/S0/cli/resolve.sh` — resolution helper for preferred-tool fallback chains
- `khora/CONTRACT.md` confirms: `epi agent bootstrap [--agent NAME]`, `epi agent session {init|status|close|continuation}`

**S0' (CLI Contract Law) — what's actually wired:**
- `khora/S0'/cli-primitives.md` — contract file (existence confirmed by CONTRACT.md reference; content not yet audited)
- Tool: `epi_run` via `PRIMITIVE_REGISTRY` in pleroma (`epi_cli` primitive → `epi_run` tool name) — pulls through all `epi` subcommands as bounded PI tool

**Gaps vs envelope:**
- `s_0_preferred_tool_*` fields — not yet flowing into the envelope; preferences stored in JSON but not surfaced as session-start fields
- CLI audit trail (`s_0_session_exit_code`, `s_0_tool_resolution_log`) — not implemented; no session-end hooks produce these
- `S0.5/S0.5'` (CLI integration surface / reflective return) — no tool registered for cross-tool composition audit or session-end cleanup

**Assessment:** S0 is grounded (preferred-tools.json exists, epi_run pullthrough works). S0' CLI law is documented but not validated at runtime. CLI audit trail fields are structural gaps.

---

## B.2 — S1 / S1' Layer (Vault Material Container / Compiler Spine)

**S1 (Vault Material Container) — wired:**
- `khora_write` — canonical vault write primitive; ALL vault writes must route here; enqueues sync event to `.khora-sync-queue.jsonl`; triggers `epi nara wind --profile` on PASU.md writes
- `epi vault day-init` — day folder creation (CT4b')
- `epi vault now-init --session-id` — NOW folder creation (thinking/, thoughts/, tasks/, patterns/ + rendered now.md)
- `epi vault flow-init` — FLOW.md creation (CT0)
- `epi vault daily` — open daily note
- `epi vault read` — read vault artifact

**S1' (Compiler Spine) — wired:**
- `epi-dev-vault` vendor: `daily/` (ledger), `knowledge/` (compiled), `compile.py`, `query.py`, `lint.py`
- 7 lint checks operational (broken links, orphan pages, orphan sources, stale articles, contradictions, missing backlinks, sparse articles)
- `flush.py` auto-compilation post-6pm

**Gaps:**
- `khora_sync_queue_flush` is a **hard stub** — comment: "stub (Neo4j not yet wired)" — the sync queue populates but never drains
- Vault schema validation (`c_*` frontmatter key law) — not enforced at khora_write time; no runtime validator
- `epi vault thought-route` (aletheia_thought_route) calls `epi vault thought-route` — may not exist in epi-cli yet (needs verification)
- `s_1_compiler_hash` and `s_1_schema_version` envelope fields — not yet surfaced

**Assessment:** S1 write primitive is solid. Compiler spine baseline works. **Critical gap: sync queue never flushes** — vault writes queue up but Neo4j never receives them. This blocks Hen→Graph sync and is the single most important S1/S2 integration fix.

---

## B.3 — S2 / S2' Layer (Graph Body / Coordinate-Aware Retrieval)

**S2 (Graph Body) — wired via aletheia extension:**
- `aletheia_gnosis_ingest` → `epi techne gnosis ingest-gnostic` (RAG-Anything parse → chunk → 3072-dim embed → Neo4j)
- `aletheia_gnosis_query` → `epi techne gnosis query-gnostic [question] --mode hybrid` (vector + graph + Redis RRF)
- `aletheia_gnosis_enrich` → `epi techne gnosis enrich [entity_id]` (MAPS_TO_COORDINATE or RESONATES_WITH classification)
- `aletheia_gnosis_status` → `epi techne gnosis status`
- `aletheia_gnosis_notebook_create` → `epi techne gnosis notebook create [name]`

**S2' (Coordinate-Aware Retrieval) — wired:**
- `aletheia_gnosis_query` takes optional `coordinate` parameter — prepends coordinate context to query string (simple but effective)
- `aletheia_gnosis_enrich` does LLM-classified RESONATES_WITH and direct MAPS_TO_COORDINATE

**Redis (S2.4'):**
- `aletheia_session_promote` explicitly calls `epi core cache set claude-mem-obs:{id} gnosis:promoted:{session}` — this IS the Redis hot layer for observation promotion tracking
- No explicit `s_2_redis_context_key` field surfaced in session start

**Gaps:**
- `khora_sync_queue_flush` stub — vault writes never reach Neo4j automatically (blocker)
- Bimba coordinate migration: `bimbaCoordinate` → `coordinate` property in bimba-mcp not yet executed
- 18-fold pointer web: only 2 of 18 cross-coordinate edges materialised (POLAR_OPPOSITE, CONTEXT_FRAME_REF)
- S2.4' Redis vs S3.2' Redis distinction not enforced — single `epi core cache set` but namespace convention not formalised

**Assessment:** S2 retrieval layer is functionally wired (ingest/query/enrich working). The coordinate-aware retrieval contract works. **Critical: Bimba M-coordinate population (Track A) is the prerequisite** for meaningful coordinate-context queries to work.

---

## B.4 — S3 / S3' Layer (Gateway / Temporal-State Contract)

**S3 (Gateway) — wired via Pleroma/techne tools:**
- `techne_gateway_start` → `epi gate start` (port 18794, WebSocket)
- `techne_gateway_stop` → `epi gate stop`
- `techne_gateway_status` → `epi gate status --json`
- `techne_session_list` → `epi gate sessions list --json [--active-minutes N] [--include-global]`
- `techne_session_patch` → `epi gate sessions patch [session_key] --label/--thinking-level`
- `techne_logs_tail` → `epi gate logs --tail N`
- `techne_debug_status` → `epi gate debug status --json`
- Cron: `epi gate cron {add|list|status}` via `chronos_cron_register` / `chronos_cron_list`

**Channels (S3.1) — documented in comment only:**
```
// OmniPanel method names Rust must match:
// "skills.list", "skills.toggle", "skills.saveApiKey"
// "config.load", "config.save"
// "cron.toggle" (not "cron.update")
```
No formal channel registry exists. The comment notes parity gaps tracked in `gate/parity.rs`.

**Gateway channels by surface:**

| Surface | Channel type | Status |
|---------|-------------|--------|
| Electron OmniPanel | WebSocket RPC (sessions, config, skills, cron) | **Parity gaps** — config.load vs config.get, cron.toggle vs cron.update |
| Terminal (cmux/tmux) | `techne_cmux_*` tools (surface-create, pane-assign, layout-set, focus, destroy) | Wired via cmux CLI |
| Telegram | Not in pleroma extension code | **Missing** — no tool registered |
| Web (external) | Not present | **Missing** |

**Pleroma OMX Port — what it actually is:**
The "OMX port" is `PRIMITIVE_REGISTRY` in `pleroma/S2/pleroma-primitives.ts`. It's not a network port — it's the **bounded primitive surface** through which Pleroma exposes capabilities to PI as typed tools. 8 primitives:

| Primitive | Tool Name | Mode | Child Extension |
|-----------|-----------|------|----------------|
| tmux | tmux_exec | interactive | yes |
| cmux | cmux_exec | interactive | yes |
| bkmr_kbase | bkmr_search | bounded | no |
| onecontext | onecontext_inject | bounded | no |
| ralph_tui | tildone_dispatch | interactive | yes |
| worktrunk | worktrunk_exec | bounded | yes |
| epi_cli | epi_run | bounded | no |
| context7 | context7 | bounded | no |

Interactive primitives **cannot be invoked as PI tools** — they require tmux/cmux panes directly. This is the OMX boundary: bounded = callable as PI tool; interactive = requires surface.

**S3' (Temporal Surfacing):**
- `chronos_graphiti_day_arc` — opens/closes `day:{day_id}` arc in Graphiti (**sidecar at port 37778**)
- `chronos_decan_check` — detects sun/moon decan transitions, opens/closes decan arcs (register as 2h cron)
- `chronos_kairos_fetch` / `chronos_kairos_status` — kerykeion integration for natal chart + planet degrees

**Graphiti sidecar (port 37778) vs Gateway (port 18794):**
- Gateway: WebSocket server, session management, OmniPanel RPC — **epi gate start**
- Graphiti: HTTP REST sidecar, personal episodic graph at `#4.4.4.4` — **epi gate graphiti start** (distinct process)

**OmniPanel RPC parity gaps (from pleroma comment + gate/parity.rs):**

| OmniPanel calls | Rust gate method | Status |
|-----------------|-----------------|--------|
| `sessions.list` | sessions.list | ✓ |
| `config.load` | config.load | ✓ |
| `config.save` | config.save | ✓ |
| `skills.list` | skills.list | ✓ |
| `skills.toggle` | skills.toggle | ✓ |
| `skills.saveApiKey` | skills.saveApiKey | ✓ |
| `cron.add` | cron.add | ✓ |
| `cron.list` | cron.list | ✓ |
| `cron.toggle` | **cron.update** | **GAP — name mismatch** |
| `cron.run` | ? | needs verification |
| `cron.remove` | ? | needs verification |

**Assessment:** S3 gateway tools are wired and functional. Telegram and web channels are missing entirely. cron.toggle/cron.run/cron.remove parity gaps need resolution before OmniPanel can fully manage cron. **Two distinct runtime services (gateway port 18794 + graphiti sidecar port 37778) must both be running** — this is not documented in any startup sequence.

---

## B.5 — S4 / S4' Layer (Agent Execution Package / Agentic Inhabitation Law)

**S4 (Agent Execution Package) — the ta-onta package itself:**

| Class | S-coordinate | PI tools registered |
|-------|-------------|---------------------|
| Khora | S4.0 / S4.0' | khora_session_init, khora_session_status, khora_write, khora_sync_queue_push, khora_sync_queue_flush, khora_continuation_write |
| Hen | S4.1 / S4.1' | (not yet audited) |
| Pleroma | S4.2 / S4.2' | 8 primitive tools + 7 techne gateway tools + 5 cmux surface tools = 20 tools |
| Chronos | S4.3 / S4.3' | chronos_day_init, chronos_now_init, chronos_archive_day, chronos_cron_register, chronos_cron_list, chronos_kairos_fetch, chronos_kairos_status, chronos_temporal_status, chronos_graphiti_day_arc, chronos_decan_check = 10 tools |
| Anima | S4.4 / S4.4' | (not yet audited) |
| Aletheia | S4.5 / S4.5' | aletheia_session_promote, aletheia_gnosis_ingest, aletheia_gnosis_query, aletheia_gnosis_notebook_create, aletheia_thought_route, aletheia_crystallise, aletheia_seed_refresh, aletheia_gnosis_enrich, aletheia_gnosis_status, aletheia_episodic_record, aletheia_episodic_search, aletheia_episodic_arc_open, aletheia_episodic_arc_close, aletheia_episodic_arc_status, aletheia_episodic_oracle_arc, aletheia_episodic_logos_stage, aletheia_episodic_mobius_arc, aletheia_episodic_ingest_thoughts = 18 tools |

**Constitutional agent files (S4.4' / Anima):**
Located at `.pi/extensions/ta-onta/anima/S4'/agents/`: anima.md, eros.md, logos.md, mythos.md, nous.md, psyche.md, sophia.md, techne-helper.md
Format: 6-section RUPA (Rupa/Ontology/Frame Contract/Temporal/Capability/Sattva). Status: marked as `M` in git status (modified) — content in flux.

**Aletheia subagent RUPA files:**
Located at `.pi/extensions/ta-onta/aletheia/clusters/`: agora/RUPA.md, anansi/RUPA.md, janus/RUPA.md, moirai/RUPA.md. Status: marked as `M` (modified).

**CPF (00/00) gate:**
Rule: ALWAYS brainstorm with user when CPF frame is (00/00). No autonomous action. Declared in ANIMA.md and constitutional agent Sattva sections. Not mechanically enforced — it's a behavioural contract.

**VAK grammar:**
Referenced in Khora CONTRACT.md and envelope field schema. Implementation unclear — needs Anima extension audit (B.5a pending).

**S4' Agentic Inhabitation Law gaps:**
- `anima/extension.ts` not yet read — unknown tool surface
- Constitutional agent RUPA files are modified but consistency not verified
- VAK grammar enforcement not found in any tool implementation
- Darshana (precision loop agent) — not found anywhere in extension code; referenced in memory as concept

---

## B.6 — S5 / S5' Layer (World Return / Recollection-Improvement Law)

**S5 (World Return) — what's actually wired:**
- `aletheia_seed_refresh` — generates SEED.md morning context package (T5 insights + T0 questions → `Idea/Empty/Present/SEED.md`)
- `aletheia_episodic_logos_stage` — 6-stage Logos cycle episodes in episodic graph (A-Logos→An-a-Logos)
- `aletheia_episodic_mobius_arc` — Möbius return arc (Sophia CF 5/0)
- Notion sync: **not present** — no tool, no CLI command, no wiring

**S5' (Recollection/Improvement Law) — wired:**
- `cron_evening` handler: aletheia_session_promote (HOT→COLD promotion) + coordinateMobiusReturn + maybeUpdateCoordinateMap + Graphiti community build
- `aletheia_episodic_ingest_thoughts` — ingests T0–T5 bucket contents to Graphiti (night' pass), checks Möbius readiness (T5 count ≥ 3)
- `aletheia_episodic_arc_close` — closes arc with synthesis episode

**Critical stub — `aletheia_crystallise`:**
Returns `isError: true` immediately with message: "crystallise unavailable: the current epi CLI does not expose a crystallise command." This is the direct vault crystallisation path — blocks T-bucket → Bimba canonical form flow. Workaround: use `aletheia_gnosis_query` + constitutional agent run for synthesis.

**Darshana and Zeithoven:**
- Darshana (precision evaluation loops) — **not found** in any extension code or tool registration
- Zeithoven (next-form shaping) — **not found** in extension code; referenced in aletheia RUPA stubs only
- Both are S5' concepts (Recollection/Improvement Law) that exist in design but have no runtime implementation

**Assessment:** S5 is thin. The improvement loop backbone (cron_evening + thought ingestion + Möbius) works. Notion sync is entirely absent. `aletheia_crystallise` stub is the main blocking gap for the vault crystallisation path. Darshana/Zeithoven are design-only.

---

## Consolidated Gap Register

| ID | Layer | Gap | Severity | Fix Required |
|----|-------|-----|----------|-------------|
| G1 | S1/S2 | `khora_sync_queue_flush` is a hard stub — vault writes never reach Neo4j | **CRITICAL** | Wire Hen/S2 Neo4j sync in epi-cli |
| G2 | S2 | Bimba `bimbaCoordinate` → `coordinate` migration not executed (Track A blocker) | **CRITICAL** | Execute in bimba-mcp/src/ |
| G3 | S3 | `cron.toggle` → Rust gate has `cron.update` (name mismatch) | **HIGH** | Update gate/cron.rs or OmniPanel caller |
| G4 | S3 | Telegram channel entirely absent from pleroma extension | **HIGH** | Add telegram primitive to PRIMITIVE_REGISTRY |
| G5 | S5 | `aletheia_crystallise` is a hard stub — returns isError:true | **HIGH** | Implement `epi vault crystallise` CLI command |
| G6 | S4 | Khora AND Chronos both call `epi vault day-init` on session_start — duplicate | MEDIUM | Remove one; Khora should own bootstrap, Chronos should check rather than init |
| G7 | S0 | CLI audit trail fields (`s_0_session_exit_code`, `s_0_tool_resolution_log`) not produced | MEDIUM | Add to session-end.py or Khora shutdown hook |
| G8 | S5 | Notion sync entirely absent | MEDIUM | Add S5 world-write primitive |
| G9 | S3 | `cron.run` and `cron.remove` OmniPanel parity unverified | MEDIUM | Audit gate/cron.rs |
| G10 | S4 | Anima extension not audited — VAK enforcement unknown | MEDIUM | Read anima/extension.ts |
| G11 | S5 | Darshana + Zeithoven are design-only, no runtime implementation | LOW | Design phase — not blocking |
| G12 | S3 | Graphiti sidecar (37778) vs Gateway (18794) not in any single startup sequence | LOW | Add combined `epi up` sequence doc |

---

## Two Unresolved Questions from Handover (answered)

**Q: Single vs dual Redis?**
Two Redis namespaces, one Redis instance (most likely):
- `epi core cache set` → S2.4' graph context hot cache
- Gateway session metadata (SessionStore) → S3.2' — stored in gateway's own SessionStore (likely in-memory or SQLite, not Redis)
Actual Redis is S2.4' only. S3.2' SessionStore needs verification.

**Q: OMX protocol specifics?**
OMX is not a network protocol. It's the `PRIMITIVE_REGISTRY` table in `pleroma-primitives.ts` — the typed tool registration surface that declares which system primitives Pleroma exposes as bounded PI tools. "Port" = metaphorical — the bounded execution interface, not a TCP port.

**Q: Darshana existence?**
Confirmed: Darshana does **not exist** in any extension code. Design concept only.

**Q: Graphiti same Neo4j instance?**
Aletheia episodic tools call HTTP sidecar at `localhost:37778` (GRAPHITI_URL env var). This sidecar uses `group_id` to partition within Neo4j. Confirmation: same instance, property-filtered — matches memory record.

---

## B.2 Addendum — Hen Extension Full Audit

**Hen (S4.1 / S1') — all tools:**
| Tool | Delegates to | Notes |
|------|-------------|-------|
| `hen_template_invoke` | `epi vault template-invoke [type]` | 8 CT types: seed/prompt/task-spec/pattern-note/daily-note/now/thought/flow |
| `hen_frontmatter_validate` | `epi vault frontmatter-validate [note]` | 126-key schema; bans bimbaCoordinate, pos_* keys |
| `hen_property_set` | `epi vault frontmatter-set [file] [key] [value]` | Validates key first, then writes via Obsidian property:set |
| `hen_task_list` | `obsidian-cli tasks daily / tasks path=...` | scope: daily/now/file |
| `hen_task_complete` | `obsidian-cli task file=... line=N complete/toggle` | |
| `hen_search` | `obsidian-cli search query=...` | Obsidian full-text search |
| `hen_backlinks` | `obsidian-cli backlinks file=...` | |
| `hen_hybrid_retrieve` | obsidian search + `epi --json graph retrieve [coord] --nested` | S1' + S2' combined |
| `hen_status` | `epi --json agent extensions status --agent main` | |
| `graph_query` | **HARD STUB** | Returns isError:true — "epi does not expose arbitrary Cypher execution" |
| `web_search` | DuckDuckGo HTML scrape | DDG markup dependent, may break |
| `web_fetch` | Jina Reader (r.jina.ai) | Strips nav/ads, returns clean markdown |

**Additional Hen gap:** `obsidian-cli` is called for search, task ops, and archive-day move — must be on PATH. Not in preferred-tools.json. Unverified.

**`tool_call` hook:** Hen listens for `khora_write` calls to `.md` files and attempts best-effort frontmatter validation — but it's a no-op comment stub, not actually validating.

---

## B.5 Addendum — Anima Extension Full Audit

**Anima (S4.4 / S4.4') — all tools:**
| Tool | Purpose |
|------|---------|
| `vak_evaluate` | `epi agent vak evaluate [task]` — assigns 6-layer VAK coordinates (CPF/CT/CP/CF/CFP/CS) |
| `anima_orchestrate` | CF code → constitutional agent routing (logos/eros/mythos/anima/psyche/sophia/nous). **CPF (00/00) gate IS mechanically enforced** — returns CO-ACTION GATE message requiring user brainstorm |
| `nous_disclose` | S0'/S1'/S2' context navigation → injects curated context into Gnosis session notebook |
| `dispatch_parallel_agents` | CFP1 P-Thread — Promise.all fan-out to team members via `epi agent team dispatch` |
| `dispatch_fusion_agents` | CFP3 F-Thread — Agora aggregation (same task → multiple agents) |

Plus via registered sub-modules: agent team, agent chain, subagent widget, pi-pi (conditional on EPI_AGENT_MODE=pipi).

**CS state machine:**
```typescript
type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
type CSDirectionality = "day" | "night_prime";
```
Lives in Anima extension memory as `Map<sessionId, CSState>`. Not persisted across sessions — resets to CS0 on `before_agent_start`. cpPosition tracks 4.0–4.5.

**VAK injection on `before_agent_start`:**
Reads 3 SKILL.md files from `S4'/skills/`:
1. `vak-coordinate-frame/SKILL.md`
2. `vak-evaluate/SKILL.md`
3. `anima-orchestration/SKILL.md`

These are injected as systemPrompt extension at agent start. If any are missing, injection is skipped silently. **These files must exist** for VAK to work.

**`agent_end` → Sophia review:**
Calls `epi agent run --agent sophia [prompt]` — guarded: only fires when `EPI_AGENT_NAME` is `anima` or unset (prevents infinite dispatch chain). CS state transitions to CS5/night_prime at review time.

**Unverified CLI commands needed by Anima:**
- `epi agent vak evaluate`
- `epi agent team dispatch --parent-session --agent --task`
- `epi agent run --agent [name] [prompt]`

---

## Next Steps for Track B

**B.5a (immediate):** Read `anima/extension.ts` — complete the S4.4/S4.4' audit, understand VAK enforcement mechanism and Anima agent tool surface.

**B.3a (immediate):** Read `hen/extension.ts` — complete S4.1/S1' audit, understand content form tools and template instantiation surface.

**G1 fix (parallel with Track A):** Begin Neo4j sync queue drain implementation in epi-cli (`gate sync-flush` command or Hen extension flush tool). This unblocks the vault→graph integration.

**G3 fix (quick):** Update `gate/cron.rs` to alias `cron.toggle` → `cron.update` or fix OmniPanel caller.

**G6 fix (quick):** Remove `epi vault day-init` from Chronos `session_start` handler — Khora already owns bootstrap and calls it first.

**Typed struct shapes (follow-on):** Once gap register is stable, translate envelope field schema layers 1–4 (transport, runtime, temporal, coordinate) into TypeScript interfaces in `ta-onta/` and Rust structs in `epi-cli/src/gate/`.
