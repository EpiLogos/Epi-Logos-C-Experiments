---
title: "S4 Agent Runtime Architecture — Ta-Onta Carriers, Pi Harness, Pleroma Capability Membrane, Aletheia Crystallisation Mode"
label_correction: "Per S4 canon at Idea/Bimba/World/Types/Coordinates/S/S4/S4.md, S4 = Agent Runtime (harness-agnostic; PI Agent migrating toward claw-rust). 'Claude' is retired label. Carrier ↔ S-layer mapping: Khora=S4-0' actualises S0; Hen=S4-1' actualises S0+S1'; Pleroma=S4-2' actualises S0; Chronos=S4-3' actualises S0+S3; Anima=S4-4' actualises S0+S3 (hosts 7 constitutional agents Anima/Nous/Logos/Eros/Mythos/Psyche/Sophia); Aletheia=S4-5' is a MODE of Sophia/Psyche/Anima during crystallisation, NOT a peer agent; 7 Aletheia subagents (Techne+Anansi+Moirai+Janus+Mercurius+Agora+Zeithoven) dispatched BY Anima during crystallisation. Honours DR-B-3."
coordinate: "S4 / S4'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S4/S4' agentic substrate (ta-onta + pi-agent + plugins/pleroma). [[S4-SPEC]] cross-references this document. Where they disagree, S4-SPEC is authoritative for normative spec language; this document is authoritative for substrate citations, cleanup proposals, and M' consumer mapping."
depends_on:
  - "[[S4-SPEC]]"
  - "[[S4-0-SPEC]]"
  - "[[S4-1-SPEC]]"
  - "[[S4-2-SPEC]]"
  - "[[S4-3-SPEC]]"
  - "[[S4-4-SPEC]]"
  - "[[S4-5-SPEC]]"
  - "[[S4'-SPEC]]"
  - "[[S4-0'-SPEC]]"
  - "[[S4-1'-SPEC]]"
  - "[[S4-2'-SPEC]]"
  - "[[S4-3'-SPEC]]"
  - "[[S4-4'-SPEC]]"
  - "[[S4-5'-SPEC]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md"
decisions:
  - "DR-B-1 (consolidates DR-M5-1): Pi's status — ACR governance role vs runtime layer (Pi is the harness; constitutional_agents[] excludes it)."
  - "DR-B-2: Pi's tool surface — axiom-translation lands at Body/S/S4/pi-agent/ OR UX §2.5 downgrades."
  - "DR-B-3: Four disjoint ontologies — ACR-governance-4 / constitutional-7 / ta-onta-carriers-6 / aletheia-subagents-6 — must not be conflated."
related_tranches:
  - "12.1 — ACR-actor parity audit"
  - "12.3 — Constitutional agent .md profile orphan-fill"
  - "12.4 — Recursive-self-review gate"
  - "12.7 / 12.8 — Pi tool-surface and ACR-role decisions"
  - "12.9 — dispatch_moirai_night_pass gateway audit"
  - "12.11 — TillDone residency audit"
  - "12.13 — S4↔S5 shared-intelligence seam (3072-dim, RELATES_TO_COORDINATE)"
---

# S4 Architecture — Ta-Onta, Pi, Pleroma, Aletheia

## 0. Frame

**S4 is the agentic substrate** of the Epi-Logos stack — the layer where bounded PI processes inhabit the coordinate system as constitutional agents. S4 (base) owns the harness mechanics (managed PI directories, agent/model/auth registries, plugin/skill/subagent validation, runtime launch, durable team records). S4' (prime) owns the inhabitation law (VAK dispatch grammar, CPF polarity gate, CF→constitutional routing, CFP thread algebra, CS Day/Night' state, Psyche lived-environs, Sophia review, Aletheia thought-route + crystallisation).

The substrate has three physical roots under `Body/S/S4/`:

- **`ta-onta/`** — the six S4'-carrier extensions (Khora · Hen · Pleroma · Chronos · Anima · Aletheia) wired through the spine compositor at [`Body/S/S4/ta-onta/composite-entry.ts:1-58`](Body/S/S4/ta-onta/composite-entry.ts) and the four-seam contract at [`Body/S/S4/ta-onta/spine/types.ts:1-51`](Body/S/S4/ta-onta/spine/types.ts) and [`Body/S/S4/ta-onta/spine/compositor.ts:1-99`](Body/S/S4/ta-onta/spine/compositor.ts).
- **`pi-agent/`** — the harness foundation that managed PI runtimes mirror. Entrypoint [`Body/S/S4/pi-agent/composite-entry.ts:1-33`](Body/S/S4/pi-agent/composite-entry.ts). Source residency for `Body/S/S4/ta-onta` is reached through the symlink `Body/S/S4/pi-agent/extensions/ta-onta -> ../../ta-onta`.
- **`plugins/`** — body-native plugin registry. The canonical capability membrane is at `Body/S/S4/plugins/pleroma/` with the IOD-17 authority file `Body/S/S4/plugins/pleroma/capability-matrix.json` (23 KB). Source registry at `Body/S/S4/plugins/registry.jsonl` lists `claude-mem` (vendor) and `pleroma` (local).

The single most load-bearing architectural fact: **the ta-onta package is the operational body of the S4' inhabitation law**. Each of the six carriers carries an S-family analogy (Khora=S0, Hen=S1, Pleroma=S2, Chronos=S3, Anima=S4, Aletheia=S5) but its implementation residency IS S4'. The carriers are the horizontal S-folds, VAK is the vertical dispatch grammar; they are coupled but not interchangeable ([`S4-SPEC.md:45-56`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)).

---

## 1. The Six Sub-Coordinates

Verified against actual filesystem at `Body/S/S4/ta-onta/` (linked aliases + directory names):

| Internal coord | Carrier | Directory | S-family analogy | Responsibility |
|---|---|---|---|---|
| **S4-0'** | Khora | `S4-0p-khora/` (alias `khora -> S4-0p-khora`) | S0 (Terminal) | Bootstrap, session id (`{YYYYMMDD-HHmmss-randomId}`), write authority, sync queue, secrets ingest, visibility hook |
| **S4-1'** | Hen | `S4-1p-hen/` (alias `hen -> S4-1p-hen`) | S1 (Obsidian / vault) | Template render (`hen_template_invoke`), 126-key frontmatter validation, property set, NOW/Day/thought/seed/flow templates, VAK-aware frontmatter injection |
| **S4-2'** | Pleroma | `S4-2p-pleroma/` (alias `pleroma -> S4-2p-pleroma`) | S2 (Neo4j / graph) | Bounded primitive registry (PRIMITIVE_REGISTRY), Techne gateway lifecycle, cmux surface/pane assignment, TillDone execution backbone, damage-control patterns |
| **S4-3'** | Chronos | `S4-3p-chronos/` (alias `chronos -> S4-3p-chronos`) | S3 (PAI / temporal) | Day/NOW initialisation, SEED.md morning injection into `## #0 Question`, Graphiti day-arc lifecycle, cron-evening Möbius trigger |
| **S4-4'** | Anima | `S4-4p-anima/` (alias `anima -> S4-4p-anima`) | S4 (Claude / agent) | VAK evaluation, CF→constitutional routing, CFP1 parallel / CFP3 fusion / CFP2 chain dispatch, Moirai Night' pass, Sophia review hook |
| **S4-5'** | Aletheia | `S4-5p-aletheia/` (alias `aletheia -> S4-5p-aletheia`) | S5 (Epii / synthesis) | Gnosis RAG (ingest/query/notebook), thought-route to T0-T5 buckets, SEED refresh, episodic record/search, gates (m/m-prime/s/ql/rupa/collab), **six CF-coded specialist subagents as techne-guardians** (each stewards specific techne classes within Pleroma-Techne, per DR-S4-TECHNE): **Anansi** (CF0 — guards coordinate-mapping / blueprint / Darshana-REPL techne), **Janus** (CF1 — guards temporal-structure / bhedabheda-threshold techne), **Moirai** (CF2 — guards GraphRAG-distillation Klotho/Lachesis/Atropos techne), **Mercurius** (CF3 — guards Kairos-signal / qualitative-temporal-pattern techne), **Agora** (CF4 — guards plugin-absorption / skill-index / multi-channel-aggregation techne), **Zeithoven** (CF5 — guards creative-advance / skill-and-agent-creation techne). **Techne itself is NOT here** — it is Pleroma's atomic-skills substrate (see §2.4); the S4 canon "Aletheia 7" mis-roster is corrected. |

Each carrier has the same five-fold internal shape (verified via `ls Body/S/S4/ta-onta/S4-Np-*/`):

```
S4-Np-{name}/
  CONTRACT.md                    — declarative carrier contract (responsibility, hooks, tools, dependencies, invariants)
  extension.ts                   — PI ExtensionAPI registration (single big file; counts below)
  spine-contribution.ts          — four-seam injection/ledger/compiler/query contract (per spine/types.ts:45-51)
  modules/ OR S{n}/ OR S{n}'/    — internal payload (helpers, validators, dispatch logic, prompts)
  tests/                         — vitest/jest tests (carrier-internal)
```

Line counts (verified `wc -l`):

| Carrier | `extension.ts` LOC | modules/ count |
|---|---:|---:|
| Khora | 324 | 1 module dir |
| Hen | 393 | 1 module dir |
| Pleroma | 350 | 0 modules (uses `S2/` payload) |
| Chronos | 344 | 1 module dir |
| Anima | **761** | 11 modules |
| Aletheia | **1114** | 13 modules |

The asymmetry is significant: Anima and Aletheia carry the bulk of the agentic logic; the other four carriers are structurally similar bounded-primitive shells. **This asymmetry is load-bearing** (Anima = dispatch spine, Aletheia = synthesis spine per [`S4-SPEC.md:60`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)) and should NOT be flattened by aggressive splitting — but the two big files do harbour internal cohesion problems addressed in §5.

The composite entrypoint at [`composite-entry.ts:12-19`](Body/S/S4/ta-onta/composite-entry.ts) registers all six spine contributions, wires three PI events (`session_start`, `session_shutdown`, `session_before_compact`) to the compositor seams, then loads the six extension tools plus the plugin-runtime-bridge at [`composite-entry.ts:42-57`](Body/S/S4/ta-onta/composite-entry.ts). The bridge at [`plugin-runtime-bridge.ts:1-271`](Body/S/S4/ta-onta/plugin-runtime-bridge.ts) translates PI lifecycle events (`session_start`, `before_agent_start`, `tool_result`, `session_before_compact`, `agent_end`, `session_shutdown`) into Claude-style hooks (`SessionStart`, `UserPromptSubmit`, `PostToolUse`, `PreCompact`, `Stop`, `SessionEnd`) by reading each plugin's `hooks/hooks.json` and executing matching shell commands.

---

## 2. Substrate Map

### 2.1 Spine compositor — the four-seam architecture

The spine pattern is the single deepest architectural decision in S4. Each carrier exposes a `SpineContribution` ([`spine/types.ts:45-51`](Body/S/S4/ta-onta/spine/types.ts)):

```ts
interface SpineContribution {
  coordinate: string;
  injectionSlot(): Promise<InjectionSlot>;     // Seam 1 (session_start)
  ledgerChannel(): LedgerChannel;              // Seam 2 (session_shutdown)
  compilerPass(): CompilerPass;                // Seam 3 (warm/cold scheduling)
  queryHandler(): SpineQuery;                  // Seam 4 (unified query dispatch)
}
```

`SpineCompositor.assembleInjection()` ([`compositor.ts:17-44`](Body/S/S4/ta-onta/spine/compositor.ts)) sorts slots by cost (`hot` > `warm` > `cold`), enforces an 18,000-char budget (the `INJECT_CHAR_BUDGET` at `compositor.ts:7`, deliberately under PI's 20k vendor cap), and emits a wikilink-tagged markdown injection. `extractToLedger` at `compositor.ts:47-59` writes each carrier's channel extract to `epi-dev-vault/ledger/{coordinate}/{dayId}.md` via `appendToLedger` at `compositor.ts:91-97`.

**This is the canonical S4-side bimba/pratibimba bridge**: session-start injects compiled vault context (warm/hot Bimba reads), session-shutdown extracts session output (Pratibimba writes). The same compositor instance also exposes `getCompilerPasses()` for warm-cycle scheduling (`compositor.ts:62-73`) and `query()` for coordinate-filtered cross-carrier dispatch (`compositor.ts:76-88`).

### 2.2 S4-0' Khora — bootstrap / session ground

Entrypoint [`khora/extension.ts:26-30`](Body/S/S4/ta-onta/S4-0p-khora/extension.ts) registers a module-level session-state singleton at `extension.ts:17-19` (`_sessionId`, `_dayId`, `_nowPath`) exposed via getters at `extension.ts:22-24`. Tools (registered at `extension.ts:31-`):

- `khora_session_init` (`extension.ts:31-58`) — shells out to `epi agent session init`, parses `EPI_SESSION_ID/EPI_DAY_ID/EPI_NOW_PATH` from stdout.
- `khora_session_status` (`extension.ts:61-70`) — wraps `epi agent session status`.
- `khora_write` (`extension.ts:72-101`) — **the canonical vault write primitive** (CONTRACT.md:35 — "ALL vault filesystem writes MUST route through this tool"). Writes file, enqueues graph sync event, and triggers `epi nara wind --profile` on PASU.md writes (identity propagation hook at `extension.ts:93-95`).
- `khora_sync_queue_push` / `khora_sync_queue_flush` (`extension.ts:104-`) — Neo4j sync queue at `.khora-sync-queue.jsonl`.

Contract at [`khora/CONTRACT.md:11-13`](Body/S/S4/ta-onta/S4-0p-khora/CONTRACT.md) explicitly bounds Khora away from vault structure (Hen), temporal scheduling (Chronos), and agent dispatch (Anima).

### 2.3 S4-1' Hen — vault carrier / artifact form

[`hen/extension.ts:7-`](Body/S/S4/ta-onta/S4-1p-hen/extension.ts) — `hen_template_invoke` at `extension.ts:9-65` carries the load-bearing VAK-aware render path: when `EPI_SESSION_VAK_ADDRESS` env validates against [`shared/vak_address.ts:89-105`](Body/S/S4/ta-onta/shared/vak_address.ts), it invokes the local `renderTemplateWithVak` from `modules/template-vak.ts`; otherwise falls through to `epi vault template-invoke`. This is the contract test surface for the Rust↔TS VAK shape parity ([`shared/vak_address.ts:1-26`](Body/S/S4/ta-onta/shared/vak_address.ts) is the explicit "thin local mirror of canonical Rust VakAddress"). `hen_frontmatter_validate` and `hen_property_set` (`extension.ts:67-`) enforce the 126-key frontmatter schema with banned-key rejection (`bimbaCoordinate`, `pos_*`).

### 2.4 S4-2' Pleroma — two faces: VAK capability membrane (canonical) + Techne atomic-skills repository (canon-aligned 2026-06-03 per DR-S4-TECHNE)

**Pleroma has TWO sides** that together constitute the capability-incubation work of S4-2':

1. **VAK capability membrane (canonical face)** — the bounded-primitive registry + capability-matrix substrate that enforces the VAK execution language; this is the canonical Pleroma role already described throughout this spec.
2. **Techne atomic-skills repository (Pleroma's second face)** — the **atomic-skills layer** Pleroma incubates and projects outward as executable affordance. The Greek `techne` properly names this skills substrate. The existing **Techne gateway** tools at `extension.ts:25-126` (`techne_gateway_start/stop/status`, `techne_session_list/patch`, `techne_logs_tail`, `techne_debug_status`) ARE the gateway over this skills layer. The cmux surface/pane management (`techne_cmux_surface_create` / `techne_cmux_pane_assign`) operates the techne-skill execution surface. Per S4-SPEC §boundary (line 489): "Techne owns execution" — confirming Techne is the execution substrate, NOT an agent.

> **Aletheia's 6 CF-coded specialist subagents are GUARDIANS of particular techne classes within Pleroma's Techne repository.** See §2.7 for the per-subagent techne-domain enumeration. Aletheia is the crystallisation mode in which a guardian invokes the techne it stewards.

> **Roster correction (per DR-S4-TECHNE):** The S4 canon §14-Agent Roster at `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md` lists Techne as a 7th "Aletheia" member — this is a mis-classification. **Techne is NOT an agent**; it is Pleroma's atomic-skills substrate. No `techne.md` agent profile lands; instead, Pleroma's CONTRACT.md gains a §Techne section enumerating the skills repository the 6 Aletheia guardians steward. The cycle-3 sweep removes Techne from the agent roster and lands it as Pleroma's second face.

#### 2.4.1 Pleroma surface tools and substrate

[`pleroma/extension.ts:7-350`](Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts) registers:

- The 7 bounded primitives loop at `extension.ts:15-17` and `registerPrimitiveTool` at `extension.ts:284-349`, consuming `PRIMITIVE_REGISTRY` from `S2/pleroma-primitives.ts`. Tool-name mapping at `extension.ts:289-298` retired `mprocs→cmux`, `gitbutler→worktrunk`, `notebooklm→aletheia_gnosis_query`; pending `ralph_tui→tildone`.
- TillDone registration at `extension.ts:10-12` gated by `shouldRegisterTilldone()` at `extension.ts:270-282` (enabled when `EPI_AGENT_NAME=anima` OR `EPI_AGENT_MODE in {anima,execution}` OR `EPI_TILLDONE_MODE` opt-in). TillDone substrate is at `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` (resolves Wave-B 12.11 audit).
- Techne gateway tools (`techne_gateway_start/stop/status`, `techne_session_list/patch`, `techne_logs_tail`, `techne_debug_status`) at `extension.ts:25-126`.
- Cmux surface/pane management (VAK-coordinate-aware) at `extension.ts:151-259`. `techne_cmux_surface_create` writes `cmux_workspace/cmux_surface` to the gateway session record; `techne_cmux_pane_assign` writes `cmux_pane_id` to the gateway team store + sets `CF_IDENTITY` env so the spawned pane inherits constitutional type.
- Inline method-name compliance note at `extension.ts:261-267` flagging known OmniPanel↔gateway parity gaps (`skills.list`/`skills.toggle`/`skills.saveApiKey`, `config.load/save`, `cron.toggle`) tracked in `gate/parity.rs`.

`S2/damage-control.ts` registers the `damage-control-rules.yaml` regex bank (rm/chmod/git push --force/etc) from `pi-agent/damage-control-rules.yaml`. `S2/themeMap.ts` provides `applyExtensionDefaults` consumed by `agent-team.ts:27`. `S2'/skills` (not exhaustively inventoried here) hosts the Pleroma capability skill set.

### 2.5 S4-3' Chronos — temporal carrier

[`chronos/extension.ts:36-`](Body/S/S4/ta-onta/S4-3p-chronos/extension.ts) — `chronos_day_init` at `extension.ts:38-89` is the load-bearing day path constructor:

1. Calls `epi vault day-init` (creates `Idea/Empty/Present/{day_id}/`)
2. Calls `epi vault daily` (opens/creates daily-note)
3. Reads `Empty/Present/SEED.md` (yesterday's Aletheia output) and injects it into `## #0 Question` of today's daily note via `injectSeedIntoQuestion()` at `extension.ts:8-34`
4. Calls `epi vault flow-init` (creates today's FLOW.md, CT0 free-flow)
5. Opens Graphiti day arc (non-fatal) via `dayArc({action: "open", dayId})` at `modules/graphiti-day-arc.ts`

This is the canonical morning consumption of yesterday's Aletheia SEED → today's daily-note question — the **Möbius return seam in action** (matheme: `5/0`). `chronos_now_init` (and the rest of the Chronos surface) handle NOW folder creation and Kairos-threshold logic via `modules/temporal-frame.ts`.

### 2.6 S4-4' Anima — dispatch spine

[`anima/extension.ts:127-757`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts). The dispatch surface:

- Default tools list at `extension.ts:131-147` enumerates the 14 always-active Anima tools (`vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `run_chain`, `subagent_create/continue/list/remove`, `tilldone`).
- `vak_evaluate` (`extension.ts:156-173`) — shells out to `epi agent vak evaluate` (Rust deterministic baseline).
- `goal_prelude` (`extension.ts:175-199`) — first-pass `/goal` artifact discovery dialogue.
- `anima_orchestrate` (`extension.ts:201-278`) — CF→constitutional routing via `agentForCf(cf_code)` (`modules/dispatch-validate.ts:46-48`). When `vak_address` is provided, queries `pleroma/capability-matrix.json` via `findSkillsForVak` (`modules/skill-registry.ts`) to surface suggested skills. The `(00/00)` CF code is **hard-gated** by `nousRouteStop` (`modules/nous-clearing.ts`) — returns "CO-ACTION GATE: present task to user and brainstorm before dispatch."
- `nous_disclose` (`extension.ts:280-380`) — gradated context curation: S0' CLI (`epi core knowing`), S1' Vault (`obsidian-cli search`), S2' Graph (`epi graph retrieve`). Curated package written to `/tmp/nous-disclose-{session_id}/context.md` and ingested into a session notebook via `epi techne gnosis ingest` (**load-bearing TODO: per [`S4-SPEC.md:167`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md), this is the "context smuggled through helper workflow" issue — target API is `s4'.context.assemble`**).
- `dispatch_parallel_agents` (`extension.ts:382-452`) — CFP1 P-Thread, validates per-task VAK via `validateParallelDispatch` (`modules/dispatch-validate.ts`), refuses partial-state writes on any bad address.
- `dispatch_fusion_agents` (`extension.ts:454-526`) — CFP3 F-Thread (Agora aggregation).
- `dispatch_moirai_night_pass` (`extension.ts:528-627`) — CFP3 Night' rehearing: dispatches Klotho/Lachesis/Atropos in parallel-fold against a Sophia disclosure JSONL. Each Moirai inherits its host constitutional CF per `MOIRAI_HOST_CF` (`modules/dispatch-validate.ts:66-70`): klotho→Eros, lachesis→Anima, atropos→Sophia.
- `anima_self_invoke` (`extension.ts:629-723`) — D2 gateway-routed cross-user Anima invocation via `epi gate dispatch anima-invoke`.
- `before_agent_start` hook (`extension.ts:725-744`) — injects three VAK skills (`vak-coordinate-frame`, `vak-evaluate`, `anima-orchestration`) into systemPrompt by reading each `S4'/skills/{name}/SKILL.md` and stripping frontmatter.
- `agent_end` hook (`extension.ts:746-756`) — fires Sophia review unless `EPI_AGENT_NAME` is non-anima (recursion guard).

**Constitutional 7-fold roster** (`modules/dispatch-validate.ts:25-33`):

```
nous   → (00/00)            dialogical CO-ACTION
logos  → (0/1)              binary form
eros   → (0/1/2)            Trika operation
mythos → (0/1/2/3)          Quaternity pattern
psyche → (4.5/0)            lemniscate context
sophia → (5/0)              Möbius return
anima  → (4.0/1-4.4/5)      autonomous dispatch
```

The orphan finding O-B-1 ([wave-b-agentic-layer-matrix.md:72](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md)) is partially resolved by inspection: `S4-4p-anima/S4'/agents/` contains `nous.md`, `logos.md`, `eros.md`, `mythos.md`, `psyche.md`, `sophia.md`, `anima.md`, plus `techne-helper.md`. The cycle-2 plan-10 T7-T12 contracts ARE landed there, just not in `pi-agent/agents/` (which only holds `anima.md` + `teams.yaml`/`agent-chain.yaml`). **This resolves O-B-1 to ALIGNED** — the audit in tranche 12.3 should be downgraded to a no-orphan confirmation.

### 2.7 S4-5' Aletheia — synthesis spine + tool-guardian

[`aletheia/extension.ts:49-1114`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts). The largest extension file in the substrate. Tool surface:

- `aletheia_session_promote` (`extension.ts:51-173`) — Reads from claude-mem worker (port 37777), filters by observation type (decision/bugfix/feature/discovery), ingests into Gnosis via `epi techne gnosis ingest-gnostic`. Cross-ref written to Redis cache via `epi core cache set`.
- `aletheia_gnosis_ingest` / `_query` / `_notebook_create` (`extension.ts:175-253`) — local RAG-Anything/LightRAG pipeline wrappers.
- `aletheia_thought_route` (`extension.ts:255-318`) — load-bearing VAK-aware path: when `EPI_SESSION_VAK_ADDRESS` validates, forwards the JSON verbatim to `epi vault thought-route --vak-address-json` so the Rust template renderer inlines the seven canonical VAK keys (cpf/ct/cp/cf/cfp/cs_code/cs_direction) into the SAME frontmatter block — single parser-readable `---` block. Dialogical-mode dispatches (no VAK) persist without VAK keys.
- `aletheia_crystallise` (`extension.ts:320-353`) — **CURRENTLY UNAVAILABLE**: `extension.ts:344-351` returns `isError: true` with message "crystallise unavailable: the current epi CLI does not expose a crystallise command." This is a load-bearing gap: the spec promise of P3 priority crystallisation does not run.
- `aletheia_seed_refresh` (`extension.ts:355-404`) — writes `Empty/Present/SEED.md` for tomorrow's Chronos pickup. SEED.md is the daily Möbius vehicle.
- `aletheia_gnosis_enrich` / `_status` (`extension.ts:406-441`) — entity enrichment with coordinate edges, pipeline health.
- `aletheia_episodic_record` / `_search` (`extension.ts:443-`) — Graphiti episodic graph at `#4.4.4.4` (Pratibimba namespace), HTTP POST to `localhost:37778/episode`. Carries QL position, CPF, CP, optional `tick12` (spanda position), `group_id` (quintessence hash).

The six **Aletheia subagent profiles** live at [`aletheia/S5'/agents/`](Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/) — confirmed presence of `anansi.md`, `moirai.md`, `janus.md`, `mercurius.md`, `agora.md`, `zeithoven.md`, plus `aletheia.md` (parent) and `README.md`. Per [`aletheia/CONTRACT.md:200-209`](Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md) these are PI-native specialists; their identity is their tool domain (Anansi=gap analysis/REPL/Darshana, Moirai=GraphRAG/Klotho-Lachesis-Atropos, Janus=temporal integration, Mercurius=cross-domain translation, Agora=aggregation, Zeithoven=cadence).

The Aletheia **gate suite** at `aletheia/S5'/skills/` carries `aletheia-m-gate`, `aletheia-m-prime-gate`, `aletheia-s-gate`, `aletheia-ql-gate`, `aletheia-rupa-gate`, `aletheia-collab-gate`, plus `aletheia-improvement-propose`, `aletheia-module-audit`, `aletheia-plugin-integrate`, `aletheia-self-extend`, `aletheia-stack-traverse`. Aletheia IS the tool-guardian per user memory and per `CONTRACT.md` invariant 19 of the wave-b matrix — it has no separate `aletheia-agent/agent-contract.json` because the carrier IS the contract.

### 2.8 Pi-agent — the harness, NOT a peer carrier

[`pi-agent/composite-entry.ts:1-33`](Body/S/S4/pi-agent/composite-entry.ts) is the curated entrypoint that ta-onta-composite-entry rides on top of. It runs `taOntaCompositeEntry(api)` first, then opportunistically loads `epii-entitlement-activation.ts` on `session_start` for the epii persona only (`composite-entry.ts:19-25`). The activation module gates epii-side tool entitlements based on `agent-contract.json`.

`pi-agent/lib/` carries the entitlement plumbing (`entitlement-loader.ts`, `entitlement.ts`). `pi-agent/extensions/` carries `epi-citta.ts`, `epii-entitlement-activation.ts`, `skill-entitlement.ts`, plus the `ta-onta` symlink. `pi-agent/agents/` carries the team-dispatch primitives: `anima.md` (the orchestrator profile), `teams.yaml`, `agent-chain.yaml`, plus `pi-pi/` (the Pi-Pi meta-mode agent). `pi-agent/prompts/` carries `epi-agent-help.md` and `epi-system.md` (injected system prompts).

`pi-agent/damage-control-rules.yaml` (8.7 KB) is the regex bank consumed by `pleroma/S2/damage-control.ts` — destructive bash patterns (rm -rf, sudo rm, chmod 777, git reset --hard, git push --force, git stash clear).

### 2.9 Plugins / pleroma — the IOD-17 capability membrane

[`plugins/pleroma/capability-matrix.json`](Body/S/S4/plugins/pleroma/capability-matrix.json) is the single source of truth consumed by the M5-4 Agentic Control Room (per wave-b-agentic-layer-matrix.md B1 line 23). Top-level structure (verified `capability-matrix.json:1-100`):

- `coordinate: "S4/S4'"`, `owner_agent: "anima"`, `package_role: "anima_executive_capability_membrane"`, `body_residency: "Body/S/S4/plugins/pleroma"`
- `constitutional_agents: [anima, eros, logos, mythos, nous, psyche, sophia]` (seven — **does NOT include `pi` or `aletheia`**)
- `dispatch_tools[]` — 7 entries: `dispatch_agent`, `dispatch_parallel_agents` (CFP1), `dispatch_fusion_agents` (CFP3), `run_chain` (CFP2), `dispatch_moirai_night_pass` (CFP3), `anima_self_invoke`, all requiring upstream `vak-evaluate`
- `skills[]` — VAK-profiled skill catalog (each carries `operates_at_cf`, `serves_ct`, `ranges_cp`)
- `hooks{}` — `pre_tool_call` / `post_tool_call` / `transform_tool_result` lifecycle contract (matrix:220-269), each emits `portal.{vak_eval,lens_pressure,tool_call,review_deposit,kairos_shift}`
- `typed_delegation{}` — `s4'.pleroma.{delegate_lens, delegate_square, gate.evaluate}` method declarations
- `m5_4_governance{}` — the ACR review-surface contract (`review_surface_roles`, `capacity_governance`)
- `mediated_run_evidence_bridge{}` — 16 required packet fields, privacy guards

The matrix file is consumed three ways:

1. Anima TS code reads it via `loadCapabilityMatrix()` ([`anima/extension.ts:57-69`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts)) — cached after first read; matrix-aware features are **advisory not gating** (`anima/extension.ts:56-58` comment).
2. The M5-4 ACR Theia extension reads it via `parseCapabilityMatrix` from `@pratibimba/ide-shell-m0-m5` (per wave-b matrix B1).
3. The e2e parity harness loads it through `PATHS.capabilityMatrix` and asserts `matrixDispatchTools` / `matrixSkills` parity against ACR run-model (per [`S4-SPEC.md:76`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)).

### 2.10 Shared utilities

`Body/S/S4/ta-onta/shared/`:

- [`vak_address.ts:1-111`](Body/S/S4/ta-onta/shared/vak_address.ts) — the thin local TS mirror of the canonical Rust `VakAddress`, with explicit drift-prevention strategy at `vak_address.ts:13-22` (frozen-fixture comparison, JSON-shape contract test, const-array-driven Sets). CF roster at `CANONICAL_CF_POSITIONS` (`vak_address.ts:70-79`) is the surface authority.
- `entitlement.ts` / `entitlement-loader.ts` — agent entitlement computation (skill universe enumeration, comma-list parsing, team-entitlement parsing) consumed by `S4-4p-anima/S4/agent-team.ts:36-37`.
- Contract test files (`entitlement_contract.test.ts`, `entitlement_universe.test.ts`, `vak_address.test.ts`).

`Body/S/S4/ta-onta/spine/` (compositor + types as described in §2.1).

---

## 3. M' Dependency Map

Per DR-M5-1 disposition (cycle-3 ledger) and the wave-b-agentic-layer matrix, S4 surfaces are consumed by the following M' surfaces:

| S4 surface | M' consumer | Channel | Status |
|---|---|---|---|
| `capability-matrix.json` (IOD-17) | M5-4 ACR (`@pratibimba/ide-shell-m0-m5`) | Direct file read via `parseCapabilityMatrix` | **ALIGNED** (per B1) |
| `s4'.mediation.route` (gateway) | M5-4 ACR `acr-runtime-service` | `KernelBridgeAPI.invokeCapability({method: "invokeGatewayRpc", params: {gatewayMethod: "s4'.mediation.route"}})` | **ALIGNED** ([`S4-SPEC.md:77-78`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)) |
| `s4'.mediation.capabilities.list` (gateway) | M5-4 ACR (capability listing) | Gateway probe → falls through to matrix-static dispatch on empty | **SPEC-AHEAD** (per [`S4-SPEC.md:92`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) tracked gap) |
| `s4'.vak.evaluate` (canonical, not the Rust baseline) | M5-4 ACR run-flow VAK selector + M5-5 Logos Atelier | Gateway dispatch | **CODE-PENDING** — current path returns thin response; ACR expects full coord fields ([`S4-SPEC.md:619`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)) |
| Anima default tool surface (14 tools, `extension.ts:131-147`) | Constitutional dispatch from any M' consumer through Anima | Anima always-active tools via `setActiveTools()` at `extension.ts:149` | **ALIGNED** |
| `dispatch_moirai_night_pass` | M5-4 ACR `AgenticRoute` | `s4'.mediation.route` | **GATEWAY HANDLER AUDIT PENDING** (CP-B-6, tranche 12.9) |
| `aletheia_gnosis_ingest` / `_query` / `_crystallise` / `_thought_route` | M5-5 Logos Atelier (deeper synthesis consumption) | Currently no `s5'.gnostic.*` registration; consumed only via aletheia-internal dispatch | **SPEC-AHEAD / CODE-PENDING** (per B3) |
| `aletheia_episodic_record` / `_search` | M4 (Nara) personal episodic surface; M5-4 ACR diagnostics | Graphiti sidecar `localhost:37778` | **SPEC-AHEAD** — Graphiti runtime landed; pratibimba-namespace relations CODE-PENDING (Wave-A M4 5.3) |
| `khora_write` | All M' write paths (vault writes route here) | Direct `khora_write` tool call OR `epi vault write` CLI | **ALIGNED** |
| `chronos_day_init` | M' Day-Now ambient (UI Principle 9) | Triggered by morning cron OR explicit M5/M4 daily-note open | **ALIGNED** |
| Spine compositor 4-seam injection | M' session UI (system-prompt visibility) | `session_start` → injection → systemPrompt | **ALIGNED** |
| Aletheia subagents (Anansi/Moirai/Janus/Mercurius/Agora/Zeithoven) | M5-4 ACR `AgenticRoute` (limited — see B5) | Currently only `dispatch_moirai_night_pass` surfaced; others Aletheia-internal | **DOC-AHEAD** — ACR `AgenticActor` union does NOT include `anansi/moirai/janus/mercurius/agora/zeithoven`; per CONTRACT they remain Aletheia-internal, invoked by Sophia and Psyche through Anima dispatch (per CONTRACT inv 1-2) |
| Pleroma TillDone (`S4-2p-pleroma/S2/tilldone.ts`) | M5-4 ACR execution-backbone gate | Gated via `EPI_TILLDONE_MODE` env | **ALIGNED** (resolves 12.11 — file exists) |

Cross-references to the eight M' architecture docs:

- M0 (Anuttara) → consumes `khora_write` for SEED writes; consumes Aletheia thought-route for `T0` (questions) bucket.
- M1 (Paramaśiva) → no direct S4 consumption; S4 hosts the dispatch that drives M1 surfaces.
- M2 (Paraśakti) → Aletheia Gnosis pipeline relevant via M2-1' Vimarśa-read audio_octet writes (NOT directly consumed but conceptually adjacent); episodic-record carries tick12 spanda phase per `aletheia/extension.ts:458`.
- M3 (Mahāmāyā) → no direct S4 consumption.
- M4 (Nara) → Aletheia episodic graph at `#4.4.4.4`, identity propagation via `khora_write` PASU.md hook (`khora/extension.ts:93-95`).
- M5 (Epii) — heaviest consumer: ACR (M5-4) consumes capability-matrix + mediation route; Logos Atelier (M5-5) consumes `aletheia_gnosis_*` + `aletheia_crystallise` + `aletheia_thought_route`.

---

## 4. Contract Surface

### 4.1 Exposed types / methods / events

Anima exposes 14 tools (enumerated §2.6). Aletheia exposes 12+ tools (enumerated §2.7). Khora exposes 5 tools (§2.2). Hen exposes 3+ tools (§2.3). Pleroma exposes 7+7 bounded-primitive tools + Techne tools + 6 cmux tools = ~20 tools (§2.4). Chronos exposes ~4 tools (§2.5).

VAK address surface (`shared/vak_address.ts`):
- `VakAddress` (line 61-68) carries `{cpf, ct[], cp, cf, cfp, cs{code, direction}}`
- `isValidVakAddress(unknown)` (line 89-105) — runtime validator
- `vakAddressFromObject(unknown)` (line 107-110) — parse-and-validate

Spine surface (`spine/types.ts`):
- `InjectionSlot{coordinate, cost, content, charEstimate}` (line 3-12)
- `LedgerChannel{coordinate, ledgerDir, extract(SessionContext)}` (line 14-21)
- `CompilerPass{coordinate, schedule, compile(...), readCompiled(...)}` (line 23-31)
- `SpineQuery{coordinate, query(...)}` (line 33-36)

Dispatch contract (`anima/modules/dispatch-validate.ts`):
- `AGENT_CF` (line 25-33) — constitutional 7-fold roster as `Record<agent, CfLiteral>`
- `MOIRAI_HOST_CF` (line 66-70) — subagent → host constitutional CF
- `CPF_DIALOGICAL = "(00/00)"` (line 90) — the open-conversation polarity
- `validateDispatchParams`, `validateParallelDispatch`, `validateFusionDispatch`, `dispatchGuardrails`, `CANONICAL_TRIGGERS` (exported, body not fully read here)
- `agentForCf(cf)` (line 46-48) — reverse routing

Profile-bus integration (consumed by, not produced by):
- The ACR consumes `MathemeHarmonicProfile.resonance72` (per wave-a-m5 6.3 CODE-PENDING) — S4 does NOT publish to this profile; profile authority lives at S0-side `Body/S/S0/portal-core/src/kernel.rs`.
- Anima's `tick12`-tagged episodic record at `aletheia/extension.ts:458` is the closest S4 surface to the profile — it CONSUMES tick12 (caller-provided) but does not derive it.

### 4.2 Gaps — what should be exposed but isn't

| Gap | Where it bites | S4-SPEC reference |
|---|---|---|
| `s4'.psyche.state` / `_update` (canonical, not the partial CLI shape) | M5-4 ACR Psyche pane (CODE-PENDING) | [`S4-SPEC.md:491-512`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) "largest missing S4/S4' surface" |
| `s4'.permission.get` (canonical, enforcing S0 exec + tool writes) | Permission boundary enforcement is currently advisory (`s_4_permission_boundary` reported but not gating) | [`S4-SPEC.md:522-530`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) |
| `s4'.context.assemble` (proper, replacing the `/tmp/nous-disclose-*` smuggling) | `nous_disclose` currently writes through Gnosis notebook helper; explicit S1/S2/S3/S5 contract missing | [`S4-SPEC.md:480-490`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) |
| `s4'.crystallise` (route trigger → S5'/Epii heavy work) | `aletheia_crystallise` tool returns `isError: true` "crystallise unavailable" ([`aletheia/extension.ts:344-351`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts)) | [`S4-SPEC.md:541-548`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) |
| `s4'.team.compose` / `_status` (mapping CFP+CF into concrete team assignments) | Currently the durable team records exist via `epi agent team` but the API parity is incomplete | [`S4-SPEC.md:451-456`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) |
| `s4'.cs.state` / `_transition` (canonical Day↔Night' machine) | CS state lives in module-scope `sessionCSState` Map at `anima/extension.ts:35` — not exposed as gateway state | [`S4-SPEC.md:461-468`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) |
| Recursive-self-review classifier | ACR `enforceHumanGate` checks only `humanRequired` flag, not recursive-self-review per `capability-matrix.json m5_4_governance.review_surface_roles.{sophia,anima,pi,aletheia}.recursive_self_review_requires_user_final_validation` | CP-B-3, tranche 12.4 |
| Pi axiom-translation tooling | UX §2.5 promises Pi covers philosophical-English ↔ OWL ↔ SHACL; no implementation under `pi-agent/lib/` | DR-B-2, tranche 12.7 |
| `MathemeHarmonicProfile.resonance72` consumption (read-only) by S4 | Aletheia episodic record could carry `resonance72` as group_id-derived sentinel; currently `tick12` only | Wave-A M5 6.3, tranche 12.13 |

---

## 5. Code Cleanup + Modularisation Findings

Concrete proposals, ordered by priority. Each names scope, current shape, proposed refactor, benefit, and blast radius.

### 5.1 File-level: aletheia/extension.ts is 1114 LOC of tool registrations

**Location:** [`Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts:1-1114`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts)

**Current shape:** Single `aletheiaExtension(api)` function registering ~12+ tools sequentially. Tool-registration blocks vary 25-100 LOC. Internal helpers (`resolveNotebookName`, `renderMetadataDocument`, `defaultVaultRoot`) at lines 18-47. The file mixes Gnosis pipeline tools, thought-route, episodic graph, gates, and SEED refresh in one contiguous registration sequence.

**Proposed refactor:** Split into 5 sub-modules registered from `extension.ts` via `registerXxx(api)` helper functions — mirror Anima's `S4/agent-team.ts`/`agent-chain.ts`/`subagent-widget.ts` pattern at [`anima/extension.ts:5-8`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts):

- `S5'/tools/gnosis-tools.ts` — `aletheia_gnosis_{ingest,query,notebook_create,enrich,status}` (~250 LOC)
- `S5'/tools/thought-tools.ts` — `aletheia_thought_route`, `aletheia_session_promote` (~250 LOC)
- `S5'/tools/episodic-tools.ts` — `aletheia_episodic_record`, `aletheia_episodic_search` (~150 LOC)
- `S5'/tools/seed-tools.ts` — `aletheia_seed_refresh`, `aletheia_crystallise` (~150 LOC)
- `extension.ts` shrinks to ~150 LOC composition layer

**Benefit:** Per-domain test isolation; reviewer can find a tool registration in <30 seconds; mirrors the established Anima pattern.

**Blast radius:** LOW — the carrier surface (`aletheiaExtension(api)` exported at composite-entry.ts:49) is unchanged; only internal organisation moves. No M' consumer breaks.

### 5.2 File-level: anima/extension.ts is 761 LOC

**Location:** [`Body/S/S4/ta-onta/S4-4p-anima/extension.ts:1-761`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts)

**Current shape:** `animaExtension` already delegates to `S4/agent-team.ts`, `S4/agent-chain.ts`, `S4/subagent-widget.ts`, `S4/pi-pi.ts` for the team-runtime surface. But the dispatch tool block (anima_orchestrate, dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass, nous_disclose, anima_self_invoke) is 400+ LOC inline.

**Proposed refactor:** Extract `S4'/tools/dispatch-tools.ts` carrying the 6 dispatch tool registrations. `vak_evaluate`, `goal_prelude`, `anima_orchestrate` stay inline (small + frequently read). `nous_disclose` deserves its own `S4'/tools/nous-disclose-tool.ts` because of the smuggled-helper-workflow issue (§4.2 row 3) — isolating it makes the future S5/S1/S2/S3-contract refactor easier to land.

**Benefit:** Aligns Anima with the same internal pattern; clears the path for the canonical `s4'.context.assemble` refactor that has to happen.

**Blast radius:** LOW — `setActiveTools(animaDefaultTools)` at `extension.ts:149` is the contract surface; tool names don't move.

### 5.3 Module-level: duplicate session-state singletons

**Location:** Khora module-level state at [`khora/extension.ts:17-24`](Body/S/S4/ta-onta/S4-0p-khora/extension.ts); Anima module-level CS state at [`anima/extension.ts:35-50`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts).

**Current shape:** Two independent in-memory session/state singletons. Khora tracks `_sessionId/_dayId/_nowPath`; Anima tracks `sessionCSState: Map<sessionId, CSState>`. Both shadow env vars; both rebuild from env on miss.

**Proposed refactor:** Hoist into `shared/session-state.ts` exposing `SessionStateRegistry` — typed getters/setters, single source of truth. Khora reads/writes session-id; Anima reads/writes CS state under the same session-id key. Add invalidation hook for `session_shutdown`.

**Benefit:** Removes the env-vs-singleton drift risk (currently `process.env.EPI_SESSION_ID` and `_sessionId` can disagree if env mutates mid-session). Prepares the foundation for the future `s4'.psyche.state` API ([`S4-SPEC.md:491-512`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)).

**Blast radius:** MEDIUM — exported getters at `khora/extension.ts:22-24` are consumed by agent-team.ts and per-contract by other extensions ("Exported getters — other extensions and agent-team.ts read these"). Migration must preserve export surface.

### 5.4 Type-level: VAK address mirror has explicit drift risk

**Location:** [`shared/vak_address.ts:1-26`](Body/S/S4/ta-onta/shared/vak_address.ts) header comment explicitly documents "thin local mirror of canonical Rust VakAddress" with manual lockstep update requirement.

**Current shape:** The const-array-driven Sets at `vak_address.ts:28-87` prevent type-vs-set drift at compile time within TS, but Rust→TS drift relies on the contract test at `shared/vak_address.test.ts` and a "frozen-fixture comparison test."

**Proposed refactor:** Either (a) emit `vak_address.ts` from a `gen` task that reads the Rust source (`Body/S/S0/epi-cli/src/agent/vak.rs` or similar), OR (b) move to the schema registry that the rest of the typed-delegation surface (`capability-matrix.json typed_delegation`) uses — a single JSON schema source consumed by both sides. The "single JSON schema" approach is consistent with the existing `aletheia/S5'/janus-envelope.schema.json` pattern.

**Benefit:** Removes the manual-lockstep risk for the most load-bearing cross-language type in the system. The drift cost shows up as `isValidVakAddress` returning false at template-render boundaries (`hen_template_invoke`, `aletheia_thought_route`), silently falling through to dialogical-mode persistence — invisible bug.

**Blast radius:** HIGH if poorly executed — `VakAddress` is the contract type for A3 Hen, C1 Khora, A5/A6 Anima, D3 self-invoke, D4 gate-trigger (per `vak_address.ts:21-22` comment). Migration must add a regression test that loads stored fixtures and re-validates.

### 5.5 API-level: dispatch validators use `Type.Optional(Type.Any())` for VAK

**Location:** [`anima/extension.ts:220, 393, 466, 644`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts) — every dispatch tool's parameters carry `vak_address: Type.Optional(Type.Any())` with the comment "opaque to TypeBox — validator is source of truth."

**Current shape:** Validator runs after TypeBox parsing. TypeBox produces no schema constraint on the field.

**Proposed refactor:** Expose `VakAddressSchema` from `shared/vak_address.ts` as a `Type.Object({...})` literal. Use it directly in dispatch-tool parameters. The current `Type.Any()` was a deliberate choice for "domain-friendly error messages" — preserve that by wrapping with a custom validator hook that calls `validateDispatchParams` after schema parse.

**Benefit:** Tool-call introspection (PI surface clients) sees real VAK shape instead of `any`. Auto-completion improves. Schema-driven docs generation works.

**Blast radius:** LOW — all dispatch tools currently call `validateDispatchParams` post-parse anyway; adding a schema doesn't replace the validator.

### 5.6 API-level: capability-matrix is read with no schema

**Location:** [`anima/extension.ts:56-69`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts) `loadCapabilityMatrix()` reads `capability-matrix.json` and lazy-validates "matrix && Array.isArray(matrix.skills)".

**Current shape:** No schema. Matrix is ~600 lines of JSON; structural drift between matrix updates and consumer code is silent.

**Proposed refactor:** Generate a TypeBox schema mirroring `capability-matrix.json`'s top-level structure (`constitutional_agents`, `dispatch_tools[]`, `skills[]`, `hooks`, `typed_delegation`, `m5_4_governance`, `mediated_run_evidence_bridge`). Co-locate at `plugins/pleroma/capability-matrix.schema.ts`. Anima's loader + ACR's `parseCapabilityMatrix` + the e2e parity harness all consume the same schema.

**Benefit:** The matrix file IS the IOD-17 authority (Wave-B B1) — schema-validating it at load makes the parity assertion strong rather than structural.

**Blast radius:** LOW for Anima (matrix-advisory not gating); MEDIUM for ACR (parity-test surface). Tranche 12.6 (MediatedRunEvidencePacket field-parity closure) is the natural co-tranche.

### 5.7 Module-level: `nous_disclose` smuggles context through Gnosis ingest

**Location:** [`anima/extension.ts:297-380`](Body/S/S4/ta-onta/S4-4p-anima/extension.ts) writes a markdown file to `/tmp/nous-disclose-{session_id}/context.md`, runs `epi techne gnosis ingest` into a session-named notebook.

**Current shape:** Workaround for missing `s4'.context.assemble`. Mixes Gnosis ingest (Aletheia's domain per CONTRACT) with context curation (Anima's role per `S4-SPEC.md:480-490`).

**Proposed refactor:** Land `s4'.context.assemble` as a Rust gateway method backed by an explicit S1 / S2 / S3' contract surface:
- Anima calls `s4'.context.assemble({task, source_coordinates, depth})`
- Gateway routes to S1 (vault read), S2 (graph retrieve), S3' (temporal context)
- Returns typed `ContextPack{cli_ctx, vault_ctx, graph_ctx, write_surface}`
- Anima writes to Khora-owned scratch path, NOT through Aletheia's Gnosis ingest

**Benefit:** Decouples Anima (orchestrator) from Aletheia (synthesis); removes the `/tmp/` smuggling; honors the S4-SPEC §B/A separation explicitly.

**Blast radius:** MEDIUM — `nous_disclose` is called by Anima before agent dispatch; the gateway method needs to land first. Stage as: (1) add gateway method, (2) feature-flag `nous_disclose` to call new method when available, (3) retire the smuggle path.

### 5.8 Crate-level: pi-agent vs ta-onta residency boundary

**Location:** Documented at [`pi-agent/README.md`](Body/S/S4/pi-agent/README.md): "`Body/S/S4/ta-onta` is the canonical S4' ta-onta source home. `extensions/ta-onta` is a symlink back to that source so managed PI agents still receive the expected extension tree during sync."

**Current shape:** ALIGNED but fragile — the symlink pattern at `Body/S/S4/pi-agent/extensions/ta-onta -> ../../ta-onta` is correct per the documented intent (Body source tree is never edited by PI). However, the symlink dependency is implicit; any cross-machine clone or backup that flattens symlinks would silently break ta-onta loading.

**Proposed refactor:** Replace the symlink with an explicit path-reference in `pi-agent/composite-entry.ts:4`. Currently: `import { default as taOntaCompositeEntry } from "./extensions/ta-onta/composite-entry.ts"`. After: `import { default as taOntaCompositeEntry } from "../ta-onta/composite-entry.ts"`. The symlink is retired; `epi agent extensions sync` is updated to copy from `Body/S/S4/ta-onta/` directly.

**Benefit:** Cross-platform robustness (Windows, restrictive backup tools); explicit path is what's documented.

**Blast radius:** LOW — `epi agent extensions sync` is the only existing path-aware consumer; its source path is configurable.

### 5.9 Test surface: extension-level tests cover wiring; carrier-internal modules under-tested

**Location:** Every carrier has `tests/` (verified `ls`). Anima's `S4'/skills/` and `S5'/skills/` carry skill-level test coverage. The `shared/vak_address.test.ts` and `shared/entitlement_contract.test.ts` are landed.

**Current shape:** Per `S4-SPEC.md:677-678`: "Tests for true VAK/Anima behavior across the PI extension and Rust CLI together, not just isolated parsers" — explicit known gap. Aletheia `modules/{moirai-rehear,janus-doorway,gate-trigger}.ts` have minimal direct test coverage (most coverage is e2e through `agentic-mediation-e2e`).

**Proposed refactor:** Add module-level contract tests for the 11 anima modules and 13 aletheia modules. Especially:
- `anima/modules/dispatch-validate.ts` — already heavily tested via dispatch tool calls but no direct unit test on `MOIRAI_HOST_CF` mapping invariants
- `aletheia/modules/moirai-rehear.ts` — classification logic (`classifyMoiraiOutput`) needs golden-output tests
- `aletheia/modules/gate-trigger.ts` — gate-name matching is a load-bearing string contract
- Cross-carrier integration: spine compositor with 6 contributions assembling at session_start under budget

**Benefit:** Closes the explicit S4-SPEC §B gap. Also closes the [`S4-SPEC.md:88-91`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md) gateway-side `s5'.review.submit` baseline fixture path (currently ENOENT-failing per the migrated-fixture issue).

**Blast radius:** LOW — pure additive test work; no API surface change.

### 5.10 Concrete cleanup not refactor: aletheia_crystallise returns isError

**Location:** [`aletheia/extension.ts:344-351`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts).

**Current shape:** Tool is registered but returns `isError: true, content: "crystallise unavailable: the current epi CLI does not expose a crystallise command."` — operative dead-code.

**Proposed disposition:** EITHER land the underlying `epi techne crystallise` command (the proper P3 priority deliverable from CONTRACT.md), OR remove the tool from the surface and document the gap explicitly. The current state is the worst option — published surface that fails on call.

**Blast radius:** LOW for removal; depends on `s5'.crystallise` gateway design for landing.

---

## 6. Boundary Contracts

### 6.1 What S4 produces (write surfaces)

| Produced surface | Consumer | Channel |
|---|---|---|
| Session id `{YYYYMMDD-HHmmss-randomId}` | All downstream S-layers (S1 vault, S2 graph, S3 gateway, S5 review) | Env: `EPI_SESSION_ID/EPI_DAY_ID/EPI_NOW_PATH`; Khora write authority |
| Vault writes (via `khora_write`) | S1 (Hen render targets the write), S2 (graph sync queue), S5 (T-bucket archives, SEED.md) | Filesystem + `.khora-sync-queue.jsonl` |
| VAK-keyed frontmatter inlines | S1 (vault note headers) | `hen_template_invoke` + `aletheia_thought_route` use Rust-side `--vak-address-json` |
| Constitutional dispatch records | S3 gateway team store; S5 review intake | `epi agent team dispatch`; `s5'.review.submit` |
| Sophia disclosure events | S5'/Epii review; ACR review-deposition widget | `agent_end` hook fires `sophiaReview()` at `anima/extension.ts:746-756` |
| Gnosis ingestions (3072-dim) | S5 epi-gnostic Neo4j namespace | `epi techne gnosis ingest-gnostic` |
| Episodic records at `#4.4.4.4` | M4 Nara PersonalNexus; M5-4 diagnostics | Graphiti sidecar `localhost:37778/episode` |
| SEED.md (morning context) | Chronos `chronos_day_init` (tomorrow's daily-note pickup) | `Empty/Present/SEED.md` |
| Spine injection package (≤18 kB) | PI system prompt at session_start | `compositor.assembleInjection()` |
| Spine ledger extracts | Per-coordinate daily ledger files | `epi-dev-vault/ledger/{coordinate}/{dayId}.md` |

### 6.2 What S4 consumes

| Consumed surface | Provider | Channel |
|---|---|---|
| S3 gateway session/day/now identity | S3 `s3.session.*` | Env propagation + gateway WebSocket |
| S0 CLI exec (epi commands) | S0 epi-cli | `spawnSync("epi", ...)` everywhere |
| S1 vault reads (`epi vault read`, `obsidian-cli search`) | S1 Hen vault primitives | CLI |
| S2 graph retrieve (`epi graph retrieve`) | S2 Neo4j adapter | CLI |
| S3 temporal context (`epi temporal day-arc`) | S3 graphiti-runtime | CLI |
| S5 Gnosis ingest/query (`epi techne gnosis ingest-gnostic`) | S5 epi-gnostic Python wrapper | CLI |
| S5 review baseline (currently ENOENT-failing) | S5 epii-review-core | Filesystem fixture path |
| Capability matrix | Self (matrix is canonical authority — `body_residency: Body/S/S4/plugins/pleroma`) | File read at `Body/S/S4/plugins/pleroma/capability-matrix.json` |

### 6.3 What S4 forbids

Per anti-greenfield + S4-SPEC:

- **S4 must NOT mutate** [[M4.4.4.4]] Pratibimba identity, journal-derived aspects, PersonalNexus graph state ([`S4-SPEC.md:144`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)). Identity-affecting changes route to Epii/S5'.
- **S4 must NOT own** vault folder structure (Hen-only), temporal scheduling (Chronos owns semantics, Techne owns execution), agent routing (Anima-only).
- **S4 must NOT bypass** `khora_write` for vault filesystem writes (CONTRACT invariant).
- **S4 must NOT** invoke a synthesiser (M2 owns audio writes; M4 owns identity writes).
- **S4 must NOT** flatten the four-ontology distinction: ACR-governance-4 ≠ constitutional-7 ≠ ta-onta-carriers-6 ≠ aletheia-subagents-6.
- **S4 must NOT** route Sophia review through itself when caller is a sub-agent (recursion guard at `anima/extension.ts:749`).

---

## 7. Theia Integration Points

The M' Theia shell lives at `Body/M/epi-theia/extensions/` (per user memory: shell moved from `Idea/Pratibimba/System` → `Body/M/epi-theia`). S4 consumers:

| Theia extension | Consumes from S4 | Bridge call shape |
|---|---|---|
| `@pratibimba/ide-shell-m0-m5` | `capability-matrix.json` direct file read | `parseCapabilityMatrix` (per wave-b B1) |
| `agentic-control-room` | `s4'.mediation.route`, `s4'.mediation.capabilities.list`, `s5'.review.submit` | `KernelBridgeAPI.invokeCapability({method: "invokeGatewayRpc", params: {gatewayMethod: ...}})` |
| `agentic-control-room` | `RunEvidenceEnvelope` from S4 evidence-envelope builder | `buildEvidenceEnvelope` produces shape; ACR submits |
| `agentic-control-room` | Constitutional actor enumeration (anima/eros/logos/mythos/nous/psyche/sophia/aletheia/pi) | `AgenticActor` union in `run-model.ts` |
| `m1-paramasiva` / `m2-parashakti` etc. | Indirectly via Anima dispatch through agent runs | `epi agent run --agent X` triggered by ACR run-flow |

### 7.1 Additional bridge methods or contract types needed

**Bridge methods (kernel-bridge gateway additions, owners flagged):**

| Method | Owner | Tranche | Reason |
|---|---|---|---|
| `s4'.psyche.state` (canonical full shape) | S4-4' Anima/Psyche | 12.x (psyche-state-landing) | M5-4 Psyche pane needs lived-environs |
| `s4'.psyche.update` | S4-4' Anima/Psyche | 12.x | Turn-by-turn updates from PI hooks |
| `s4'.context.assemble` | S4-4' Anima (assembles) + S5 (retrieval strategy) | 12.x (decouple from nous_disclose smuggle) | Replace `/tmp/nous-disclose-*` workaround |
| `s4'.permission.get` (enforcing) | S4-2' Pleroma | 12.x (permission-boundary-landing) | Gate S0 exec, file writes, subagent spawn |
| `s4'.crystallise` (route trigger) | S4-5' Aletheia (route) + S5' Epii (heavy work) | 12.x (crystallise-landing) | Currently dead-code in tool |
| `s4'.mediation.capabilities.list` (gateway exposure) | S4-2' Pleroma (matrix) + S3 gateway | 12.1 (ACR parity audit) | ACR currently falls through to matrix-static |
| `s4'.cs.state` / `s4'.cs.transition` | S4-4' Anima | 12.x (cs-state-machine) | Day/Night' machine surface |
| `dispatch_moirai_night_pass` gateway routing | S3 gateway (router) + S4-4' Anima (handler) | 12.9 | Audit + closure |

**Contract types (TypeScript module exports for Theia consumption):**

| Type | Currently | Should be |
|---|---|---|
| `MediatedRunEvidencePacket` | Spec lists 16 fields; ACR `RunEvidenceEnvelope` carries ~10 | Generate from `capability-matrix.json` schema (tranche 12.6) |
| `AgenticActor` union | ACR includes `pi` + 7 constitutional + `aletheia` = 9 names | Resolve DR-B-1: either split into 4 disjoint enums OR document explicit mapping |
| `AnandaVortexProjection` (read-only, M1-2 surface) | Not on profile yet | Cross-cycle with kernel-bridge tranche 10.10 (NOT S4 owned — flagged as cross-cut) |

---

## 8. Anti-Greenfield Audit

### 8.1 Landed substrate (consume as-is)

| Asset | Path | Verification |
|---|---|---|
| Spine compositor | `Body/S/S4/ta-onta/spine/{compositor,types}.ts` | 99+51 LOC verified |
| 6 carrier extensions | `Body/S/S4/ta-onta/S4-{0-5}p-{khora,hen,pleroma,chronos,anima,aletheia}/` | All 6 dirs verified, all with CONTRACT.md + extension.ts + spine-contribution.ts |
| Carrier aliases | `Body/S/S4/ta-onta/{khora,hen,pleroma,chronos,anima,aletheia}` symlinks | `ls -la` verified |
| Composite entry + plugin runtime bridge | `Body/S/S4/ta-onta/{composite-entry.ts,plugin-runtime-bridge.ts}` | 58 + 271 LOC verified |
| Pi-agent harness | `Body/S/S4/pi-agent/{composite-entry.ts,lib/,extensions/,agents/,prompts/,tests/}` | `ls` verified |
| Capability matrix (IOD-17) | `Body/S/S4/plugins/pleroma/capability-matrix.json` (23 KB) | `ls -la` verified |
| Pleroma plugin package | `Body/S/S4/plugins/pleroma/{capability-matrix.json,settings.json,commands,skills,hooks,evals,tests}` | `ls` verified |
| 7 constitutional agent profiles | `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia,anima,techne-helper}.md` | `ls` verified — **resolves O-B-1 to ALIGNED** |
| 6 CF-coded specialist subagent profiles | `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/{anansi,moirai,janus,mercurius,agora,zeithoven}.md` + `aletheia.md` (carrier parent) + README | `ls` verified |
| ~~Techne profile (7th per S4 canon "Aletheia 7" claim)~~ **RESOLVED 2026-06-03 by DR-S4-TECHNE** | Per DR-S4-TECHNE ratified 2026-06-03: **Techne is NOT an agent**. It is Pleroma's atomic-skills substrate (Pleroma's second face alongside VAK). The S4 canon §14-Agent Roster Techne entry is corrected — no `techne.md` agent profile lands. Techne moves to Pleroma's CONTRACT.md as its §Techne section. The 6 Aletheia subagents are techne-guardians, stewarding specific techne classes within Pleroma-Techne. | RESOLVED — see DR-S4-TECHNE in cycle-3 Tranche 13 |
| Aletheia gate suite | `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-{m,m-prime,s,ql,rupa,collab}-gate/` | `ls` verified |
| Shared VAK address mirror | `Body/S/S4/ta-onta/shared/vak_address.ts` + tests | 111 LOC + test files verified |
| Dispatch validator | `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` | 351 LOC verified |
| TillDone backbone | `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` | `ls` verified — **resolves 12.11 to ALIGNED** |
| Damage-control rules | `Body/S/S4/pi-agent/damage-control-rules.yaml` (8.7 KB) | `cat` verified |
| Plugin registry | `Body/S/S4/plugins/registry.jsonl` | 2 entries: claude-mem (vendor), pleroma (local) |

### 8.2 Pending (cycle-3 deliverables — NOT net-new)

- Refactor work in §5 (file-split, type-extraction, schema-gen, test-additions) — **cleanup not greenfield**.
- Gateway method landing (§7.1 table) — **named integration blockers**.
- `aletheia_crystallise` epi-CLI command landing — closes existing tool's dead path.

### 8.3 Net-new (M' product surface only)

None claimed in this S4 architecture doc. The M' surfaces that consume S4 (ACR, Logos Atelier, Psyche pane, six capacity views) are net-new on the M' side, not on S4. S4's role is to expose the gateway methods + matrix the M' surfaces consume.

### 8.4 Forbidden (do not invent)

- No alternative VAK type definition (the mirror at `shared/vak_address.ts` is the only TS copy; canon is Rust).
- No alternative capability matrix (the IOD-17 file is single-source).
- No local VAK evaluator alternative to `epi agent vak evaluate` (the Rust deterministic baseline) or the canonical skill-mediated path.
- No bypass of `khora_write` for vault writes.
- No bypass of Anima for agent dispatch.
- No collapse of Aletheia subagents into the constitutional roster (CONTRACT inv 3).
- No re-homing of Graphiti to S4 (Graphiti is S3'/S3 per S4-SPEC §C.2).

---

## 9. Test Criteria (acceptance per sub-coordinate)

| Sub-coord | Acceptance command | Pass criterion |
|---|---|---|
| **S4-0' Khora** | `node --test Body/S/S4/ta-onta/S4-0p-khora/tests/*.test.ts` | All session-init/status/write/sync queue tests green |
| **S4-1' Hen** | `node --test Body/S/S4/ta-onta/S4-1p-hen/tests/*.test.ts` | Template render + 126-key validation + VAK-frontmatter inline tests green |
| **S4-2' Pleroma** | `node --test Body/S/S4/ta-onta/S4-2p-pleroma/staged/**/*.test.ts` AND `test -f Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` AND `pnpm --filter pleroma test` (e2e parity) | TillDone present; bounded primitives loop registers; capability-matrix parity asserted |
| **S4-3' Chronos** | `node --test Body/S/S4/ta-onta/S4-3p-chronos/tests/*.test.ts` | Day init + SEED injection + Graphiti day-arc tests green |
| **S4-4' Anima** | `node --test Body/S/S4/ta-onta/S4-4p-anima/tests/*.test.ts` AND `node --test extensions/test/agentic-mediation-e2e/e2e.test.mjs Body/M/epi-theia/extensions/agentic-control-room/tests/*.test.mjs` | Dispatch validators + VAK address + e2e mediation green; ≥18/19 passing modulo the migrated-fixture issue ([`S4-SPEC.md:91`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md)) |
| **S4-5' Aletheia** | `node --test Body/S/S4/ta-onta/S4-5p-aletheia/tests/*.test.ts` AND `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py -q` | Thought-route + Gnosis ingest + episodic record tests green; cross-namespace edges (3072-dim) green |
| **Shared** | `node --test Body/S/S4/ta-onta/shared/{vak_address,entitlement_contract,entitlement_universe}.test.ts` | All shared contract tests green |
| **Capability matrix parity** | `pnpm --filter @pratibimba/agentic-control-room test` | UI capability set matches matrix-declared set (IOD-17) |
| **Gateway dispatch** | `grep -rn "dispatch_moirai_night_pass" Body/S/S3/gateway/src/ Body/S/S4/ta-onta/S4-4p-anima/modules/` | Returns hits in BOTH (tranche 12.9 closure) |

---

## 10. Cross-Cutting Findings

These items touch the cycle-3 ledger directly. Each is paired with an action class (enrich existing tranche / new tranche / register orphan / register decision).

### 10.1 Constitutional agent .md profile orphan — RESOLVED

The wave-b matrix O-B-1 ([line 72](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md)) flagged `nous/logos/eros/mythos/psyche/sophia` profiles as missing. Inspection of `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/` shows all seven plus `techne-helper.md` ARE present. **Action: enrich tranche 12.3 disposition — downgrade to no-orphan confirmation; remove the speculative "land profiles at pi-agent/agents/" branch.**

### 10.2 Aletheia subagents on ACR — keep Aletheia-internal

Wave-B B5 surfaces the question: does ACR `AgenticActor` need anansi/moirai/janus/mercurius/agora/zeithoven? **Recommendation: NO** — per [`aletheia/CONTRACT.md:215`](Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md) invariants 1-2, "Aletheia is emergent — invoked by Psyche and Sophia, never directly routed" and "All invocation routes through Anima dispatch." Surfacing them in `AgenticActor` would violate the carrier contract. **Action: register decision DR-B-AGENTIC-2 in cycle-3 ledger: ACR `AgenticActor` remains a 9-tuple (7 constitutional + aletheia + pi); subagents are invoked through anima dispatch only.**

### 10.3 `aletheia_crystallise` dead-code

The tool returns `isError: true` "crystallise unavailable" ([`aletheia/extension.ts:344-351`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts)). This is an active negative — a registered tool that fails on any call. **Action: new sub-tranche under 12 (S4↔S5 seam): either land `epi techne crystallise` command OR retire the tool from the surface. Worst option (current) is published-but-failing.**

### 10.4 `s4'.psyche.state` is the largest missing surface

Both the canonical SPEC ([`S4-SPEC.md:511`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md): "the largest missing S4/S4' surface") and the M5-4 ACR Psyche pane both require it. The CS state Map at `anima/extension.ts:35` is module-scope; survives within a process but doesn't expose through the gateway. **Action: new tranche 12.x-psyche-state-landing.**

### 10.5 VAK-address-mirror drift risk

`shared/vak_address.ts` carries explicit lockstep-update requirement with Rust canon. The contract tests catch fixture drift but not Rust-side additions. **Action: cross-cycle with kernel-bridge tranche family — generate `VakAddress` schema from a single source consumed by both Rust and TS. Profile-bus extension candidate.**

### 10.6 Capability matrix needs schema

[`capability-matrix.json`](Body/S/S4/plugins/pleroma/capability-matrix.json) is THE single source of truth (per anima loader + ACR parity + e2e harness) but is read with no schema. **Action: extend tranche 12.6 (MediatedRunEvidencePacket field-parity closure) to ALSO ship the full matrix schema. Co-located at `plugins/pleroma/capability-matrix.schema.ts`.**

### 10.7 Pi remains "the harness," NOT "a fourth constitutional"

DR-B-1 (consolidates DR-M5-1): per `capability-matrix.json constitutional_agents` (7-tuple, excludes pi) AND `pi-agent/` carries the harness (composite-entry.ts wraps ta-onta), Pi IS the runtime layer. The UX wording "Sophia/Anima/Pi/Aletheia" colloquially conflates four disjoint ontologies. **Recommendation: downgrade UX wording to "Sophia + Anima orchestration + Pi runtime + Aletheia synthesis (four review-surface roles, four ontologies, not one peer-set)." Land DR-B-1 resolution in cycle-3 decisions register.**

### 10.8 Pi axiom-translation tool surface

DR-B-2: UX §2.5 promises Pi covers philosophical-English ↔ OWL ↔ SHACL; no such tool exists under `pi-agent/lib/`. **Recommendation: either (a) downgrade UX (Pi's role is harness + entitlement + agent-launch, not domain translation), OR (b) land `pi-agent/lib/axiom-translate.ts` consuming `Body/S/S5/epi-gnostic/` OWL/SHACL. Likely (a) given Pi's harness identity.** Decision register entry.

### 10.9 Profile-bus extension candidate

S4 does not currently write to `MathemeHarmonicProfile`. The closest case is `aletheia_episodic_record` carrying caller-provided `tick12` ([`aletheia/extension.ts:458`](Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts)) and `group_id` (quintessence hash). The S4 read of profile-bus state is also implicit — Anima dispatch is currently agnostic to `MathemeHarmonicProfile.resonance72`. **Action: cross-cycle with kernel-bridge tranche 10.x — add a `profile_subscribe` capability in Anima so dispatch decisions can carry `resonance72` context (constitutional CF + 72-name axis) into evidence packets.**

### 10.10 Spine compositor budget enforcement

The 18,000-char `INJECT_CHAR_BUDGET` at [`compositor.ts:7`](Body/S/S4/ta-onta/spine/compositor.ts) is a magic number. Six carriers can collectively over-fill warm-tier slots. **Action: instrument `assembleInjection()` to emit a `portal.spine_injection_assembled` event (carriers-included, bytes-used, warm-skipped count) for OmniPanel observability. The Pi runtime monitoring surface (M5 OmniPanel agentic membrane) is the natural consumer.**

### 10.11 Test fixture migration ENOENT

The mediation e2e harness references a moved fixture (`docs/plans/...` → `Idea/Bimba/Seeds/M/Legacy/plans/...`) per [`S4-SPEC.md:91`](Idea/Bimba/Seeds/S/S4/S4-SPEC.md). Breaks 1/19 tests. **Action: enrich tranche 12 substrate-cleanup with a path-rebase sub-tranche.**

### 10.12 Ledger writes under `epi-dev-vault`

[`compositor.ts:91-97`](Body/S/S4/ta-onta/spine/compositor.ts) writes to `epi-dev-vault/ledger/{coordinate}/{dayId}.md`. The "epi-dev-vault" namespace is a separate vault from the `Idea/` writes that Khora normally targets. **Verify** this is the intended residency vs `Idea/Empty/Present/{day_id}/ledger/{coordinate}.md`. Not a blocker but a residency clarification needed for the M5 daily-note timeline view.

---

## 11. Closing — Why S4 Carries the Agentic Layer

The substrate verifies the spec. The six ta-onta carriers (Khora · Hen · Pleroma · Chronos · Anima · Aletheia) cover the S0-S5 fold from inside the agent runtime. The pi-agent harness mirrors them into managed PI runtimes through the symlink + composite-entry pattern. The pleroma capability matrix at `Body/S/S4/plugins/pleroma/capability-matrix.json` is the IOD-17 single source of truth that ACR, Anima, and the e2e parity harness all read.

The two big files (anima/extension.ts at 761 LOC, aletheia/extension.ts at 1114 LOC) carry the dispatch spine and synthesis spine respectively. They are big because they ARE the operative content of the carrier contract — every other carrier is a bounded-primitive shell. The right refactor is internal organisation (split into `S4'/tools/*`, `S5'/tools/*`) not splitting the carrier itself.

The four ontologies — ACR governance roles (Sophia/Anima/Pi/Aletheia), constitutional 7-tuple (anima/eros/logos/mythos/nous/psyche/sophia), ta-onta carriers (Khora/Hen/Pleroma/Chronos/Anima/Aletheia), Aletheia subagents (Anansi/Moirai/Janus/Mercurius/Agora/Zeithoven) — must stay disjoint. The carrier contract invariant (Aletheia is emergent + tool-guardian) keeps Aletheia and its subagents OFF the constitutional roster. The harness/runtime identity (Pi-agent IS the harness) keeps Pi OFF the constitutional roster. The four-tuple of ACR review-surface roles is a separate ontology that uses BUT does not contain the others.

This is the bimba/pratibimba dynamic at the agentic layer: **Anima dispatches (bimba) → Sophia reviews (pratibimba) → Aletheia crystallises (Möbius return) → SEED.md hands off to Chronos (next-day bimba)**. The vortex that M1-2 carries at the matheme is also the vortex that S4 carries at the agent — one full revolution per Day/Night' cycle, with the (00/00) dialogical pole as the still-point and the (5/0) Möbius return as the completed cycle.

---

*Companion research with cross-references: [`plan.runs/wave-b-agentic-layer-matrix.md`](../../M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md), [`plan.runs/wave-a-m5-reconciliation-matrix.md`](../../M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md). Canonical spec: [`S4-SPEC.md`](S4-SPEC.md). Per-sub-coordinate specs: `S4-{0..5}-SPEC.md` (base) and `S4'/S4-{0..5}'-SPEC.md` (prime).*
