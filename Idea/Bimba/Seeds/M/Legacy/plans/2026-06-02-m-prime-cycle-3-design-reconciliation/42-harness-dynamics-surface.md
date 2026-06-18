# Track 42 — Harness Dynamics Surface (Multi-Harness Session Substrate + Skill Centralisation)

**Status:** Phase-K 2026-06-16 — newly proposed; designed for direct cycle 3 build (no DR ratification gate). Lands the runtime substrate that makes the agentic layer *harness-aware* — Pi as canonical parent, any harness (Claude Code / Codex / Pi / Hermes) as a sub-session — so the system is, from cycle 3 onward, aware of and communicable with multiple agent harnesses behind one contract, one session model, one transcript, and one skill grammar.

**Why this track exists.** The agentic layer (Track 12) is specified around Pi as *the* harness: Anima dispatches, subagents launch, the gateway relays — but every one of those paths is implicitly bound to a single runtime. The architecture already *contemplates* multi-harness in scattered places — `provider_override` / `model_override` on `SessionRecord` (Tranche 12.02), `epi code` already shells out to `claude` (`Body/S/S0/epi-cli/src/code/mod.rs:77`), the `pleroma-skill-proxy` skill configures claude-code / gemini-cli / codex as "constitutional progeny", and the `ouroboros` orchestration skill is the surgeon-patient worktree pattern in skill form. But there is **no single surface that says what a harness *is*** — no normalized dispatch envelope, no normalized turn-event stream, no harness-neutral transcript, no per-session harness binding, and no general skill-projection across harnesses. The launch sites are duplicated and hardcoded: `Body/S/S0/epi-cli/src/agent/launch.rs:31` (`Command::new("pi")`), `Body/S/S0/epi-cli/src/agent/models.rs:119`, `Body/S/S0/epi-cli/src/agent/doctor.rs:119`, `Body/S/S0/epi-cli/src/code/mod.rs:77` (`Command::new("claude")`), and the tmux multi-agent launchers in `Body/S/S0/epi-cli/src/agent/{team,chain,subagents,spawn}.rs` over `Body/S/S0/epi-cli/src/agent/tmux.rs:334`.

Track 42 lifts the harness boundary — which already exists, just hardcoded — into one coordinated **Harness Dynamics Surface** so that delegation to an external harness (a Claude or Codex sub-session under a Pi parent) is a first-class, governed, memory-integrated operation rather than a bespoke shell-out.

**The design principle (the OmniHarness/Omnigent insight, in our coordinates).** Every harness, however different inside, speaks the same external language: messages + files in, text + tool-calls out. So the meta-layer slides one rail underneath and every harness becomes an interchangeable worker. In Epi-Logos terms the external interface is the non-dual surface (`#`); the harness internals are the implicate; the meta-layer is the `()` execution matrix that fires any harness into actuality. `ouroboros` already names the external-agent-in-worktree the "#4 self-fold made operational" — Track 42 makes that an architecture-level contract rather than a legacy skill.

**Two design facts that constrain everything below:**

1. **Parent harness is always Pi.** Pi is the canonical agent for the Anima (S4-4') orchestration and Epii (S5') layers. A *parent* session binds `harness = pi`. Only *sub-sessions* may bind another harness. Harness boundaries fall on session boundaries (one harness per (sub-)session, lineage-linked) — never within a session — because that is what keeps the transcript-of-record harness-neutral and the memory pipeline harness-blind.
2. **Cross-vendor review is a *model* axis, not a harness axis.** The review/diversity lever is "fresh-context subagent, preferably a different model *family*" — that escapes self-bias. The harness is the **access + cost** lever: it brokers which model families it can reach and at what subscription cost. Routing therefore has two independent axes — model-family (task/diversity driven) and harness/subscription (cost driven). Delegation-for-subscription is the more important driver: route a chosen family through whichever authed harness fronts a flat-cost subscription rather than burning metered API.

**Anti-rebuild commitment.** Every component below either exists in code or has a clearly defined extension point. Track 42 is wiring + contract, ~900 LOC across 7 modules (gateway-contract envelope/events ~110, S4 harness registry+selector ~160, S0 unified launcher ~140, Khora workspace binding ~90, transcript event persistence ~80, skill projector ~120, dispatch-policy two-axis router ~100, acceptance harness ~120). Zero greenfield architecture.

- **Launch mechanism exists, scattered:** `Body/S/S0/epi-cli/src/agent/launch.rs`, `code/mod.rs`, `agent/{team,chain,subagents,spawn}.rs`, `agent/tmux.rs` — Track 42 unifies these behind one `agent/harness.rs` launcher; no new process-management substrate.
- **Session model exists:** `Body/S/S3/gateway-contract/src/session.rs` `SessionRecord` already carries `provider_override`, `model_override`, `active_agent_id`, `subagent_lineage`, `spawned_by`, `vak_address`, `terminal_binding`, and the cmux pane fields (per Tranche 12.02). Track 42 adds the durable per-session harness binding to Khora's `session-workspace.json` (Track 39 Access Pattern 2); it does not introduce a new session store.
- **Transcript exists:** `Body/S/S3/gateway/src/chat.rs` already appends turns to `~/.epi/gate/transcripts/<slug>.jsonl` with `run_id`; `Body/S/S3/gateway/src/runtime.rs:22` holds the `chat_processes` registry. Track 42 extends the persisted shape to normalized turn-events; it does not replace the transcript layer.
- **Skill stores + projector exist:** skills are distributed across their carrier homes — Pleroma atomic tools at `Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/`, orchestration skills at `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/` (+ `Body/S/S4/plugins/pleroma/skills/`), Aletheia tools at `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/`, epi-logos plugin skills at `Body/S/S5/plugins/epi-logos/skills/`; the per-agent compat projector already mirrors skills into `.epi/agents/{main,anima,epii}/agent/compat/.agents/skills/` (Claude layout, 21 skills) and `.../compat/codex-home/skills/` (Codex layout, 21 skills). Track 42 generalises this projector to all installed harnesses; the `pleroma-skill-proxy` skill (`Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/SKILL.md`) becomes its per-harness fork implementation.
- **Worktree + relay mechanism exists:** `Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/{worktrunk,techne-spawn,techne-relay,techne-list,techne-close}/SKILL.md` and `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/ouroboros/SKILL.md` — Track 42 binds these as the runner implementations of the contract. Concrete legacy reference for the sub-session teardown/discharge lifecycle (§42.3 / §42.6 / §42.9) survives as un-wired reference scripts at `Body/S/S4/plugins/pleroma/hooks/scripts/` (see that dir's README — superseded by the contract-event + Sophia-disclosure model; not to be wired without a deliberate decision).
- **Memory pipeline exists:** Sophia (5/0) post-execution disclosure + Aletheia night' crystallisation + Graphiti `add_episode(... group_id ...)` at `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` + `aletheia_session_promote` (HOT→COLD). Track 42 makes the pipeline read the harness-neutral transcript; it does not build a new memory system.
- **Hermes harness available:** `vendors/hermes-agent/` ships an ACP (Agent Client Protocol) adapter (`acp_adapter`, `acp_registry`) plus FTS5 session search + subagent spawn — the reference for the ACP backing-kind and the local self-hosted lane.

## Source authority

- **Track 12** ([12-agentic-layer-s4-s5.md](12-agentic-layer-s4-s5.md)) — the agentic-layer home. Track 42 is the harness-runtime substrate Track 12 dispatches over. Bound tranches: 12.02 (`SessionRecord`), 12.06 (Pleroma terminal/cmux tools), 12.20 (Mercurius Elo), 12.22 (model-slot CLI), 12.23 (Anima MoE dispatch-policy at `dispatch-policy.ts`), 12.24 Phase 1 (Hermes/Agora vendoring), 12.28 (`skill_lookup` first-class primitive), 12.30 (tmux topology mirrors Anima dispatch), 12.31 (`ConversationSliceHandle` at `gateway-contract/src/context.rs`).
- **Track 39** ([39-s5-prime-one-substrate-layer.md](39-s5-prime-one-substrate-layer.md)) — the ONE-substrate session/tmux/memory home. Track 42's session binding extends Access Pattern 2 (Khora `session-workspace.json`); the harness-neutral transcript honours the ONE-substrate invariant (no operation bypasses the gateway / Khora write authority). DR-S5-ONE-1 (VALIDATED 2026-06-15) binds.
- **Track 41** ([41-vama-shakti-factory-and-dialogical-arena.md](41-vama-shakti-factory-and-dialogical-arena.md)) — the `purpose: converse` voice/worker distinction (DR-VAMA-5: Vama Shaktis are voices, not workers) is the boundary Track 42's dispatch envelope respects: `converse` carries no tool/worktree authority. Canonical M4' seed at [`Idea/Bimba/Seeds/M/M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md`](../../../M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md). The four canonical classifiers per DR-VAMA-6 (egregore/sprite/daemon/mantra) are upstream of any future Track 42 → Track 41 classifier-aware dispatch.
- **DR-MODEL-1** (model-slot resolution; no hardcoded model) — the model-family axis resolves through the slot architecture (Tranche 12.22), never a pinned model id.
- **DR-EROS-1** (VALIDATED 2026-06-15; constitutional CT/CF team-composition) — the harness binding carries the sub-session's constitutional CF identity (per `pleroma-skill-proxy` `CF_IDENTITY`), so a Claude sub-session run as Eros is the same constitutional caste member as an internal Eros.
- **Canonical S4 references:** Anima CONTRACT (`Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`), Aletheia CONTRACT (`Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`), Pleroma capability matrix (`Body/S/S4/plugins/pleroma/capability-matrix.json` — `provider_profile_contract` / `PiProviderProfile`).

## Ownership split (the three-layer law)

| Concern | Owner | Residency |
|---|---|---|
| **Dispatch envelope + normalized turn-event stream** (the typed protocol surface) | **S3 gateway-contract** | `Body/S/S3/gateway-contract/src/` |
| **Harness registry + selection policy** (what a harness is; the two-axis router) | **S4 ta-onta** | `Body/S/S4/ta-onta/S4-4p-anima/` + `S4-2p-pleroma/` |
| **Process launch + tmux lease + capture** (the mechanism) | **S0 epi-cli `agent/`** | `Body/S/S0/epi-cli/src/agent/harness.rs` (new) over existing `agent/tmux.rs` |
| **Per-session harness binding + write authority** | **S4-0p Khora** | `session-workspace.json` (Track 39 AP-2) |
| **Harness-neutral transcript-of-record** | **S3 gateway** | `~/.epi/gate/transcripts/<slug>.jsonl` |
| **Skill central store + projection** | **S4-2p Pleroma** | central store → per-harness native dirs |
| **Cross-session memory** | **S4-5p Aletheia + Sophia** | Graphiti episodes keyed by VAK |

This matches the existing `dispatch_plan` ownership model: S3 owns the protocol, S4 owns the semantics, S0 owns the mechanism.

## Tranches

1. **42.1 — Harness dispatch envelope + normalized turn-event stream (gateway-contract)** *(spec-ahead-integration; depends on 12.02, 12.31)*

   The typed protocol surface every harness lane is validated against. New module `Body/S/S3/gateway-contract/src/harness.rs`:

   - **`HarnessTurnEvent`** enum — the normalized stream a harness yields per turn, harness-independent: `TextChunk`, `ReasoningChunk`, `ToolCallRequested { call_id, name, arguments }`, `ToolCallInProgress { call_id, name }`, `ToolCallObserved { call_id, name, arguments, result, status, duration_ms }`, `TurnComplete { text, usage, response_model, finish_reasons }`, `TurnCancelled { reason, partial_text }`, `ContextWindowExceeded { max_tokens, actual_tokens }`, `HarnessError { message, code, retryable }`. (Direct analogue of the Omnigent `ExecutorEvent` set, in our serde-typed Rust.)
   - **`HarnessDispatch`** envelope — `{ harness_id, model_slot, purpose, worktree, parent_session_key, vak_address, cost_class }` where `purpose ∈ { implement, review, explore, search, converse }`. `converse` carries no tool/worktree authority (Track 41 voice/worker boundary). The envelope extends the `ConversationSliceHandle` context (12.31) so a dispatch can carry a parent context slice by VAK address.
   - **`HarnessBacking`** enum — `NativeCli` (binary wrapped in a tmux lease) | `Acp` (Agent Client Protocol speaker). The protocol validates the backing kind; S4 owns which harness maps to which.

   **Implementation scope:** serde round-trip + a `tool-call enforcement hook` field on the per-turn context so harness-internal tool dispatch (a Claude SDK running its own Bash) routes back through the policy gate — the meta-layer owns tool enforcement, not the harness.

   **Verification:** `cargo test -p epi-s3-gateway-contract --test harness_envelope_roundtrip` (serde round-trips every event + envelope); a dispatch with an unregistered `harness_id` fails loud; a `converse` dispatch carrying a worktree or tool grant is rejected at construction.

   **Cross-track hooks:** 12.02 (`SessionRecord`), 12.31 (`ConversationSliceHandle`), DR-S5-ONE-1 (envelope flows through the gateway, never around it).

2. **42.2 — `HarnessExecutor` registry + two backing kinds (S4 ta-onta)** *(spec-ahead-integration; depends on 42.1, 12.22, 12.24 Phase 1)*

   The semantic authority for *what a harness is*. The registry (S4, not S3 — semantics live in ta-onta) maps `harness_id → { backing, launch_profile, model_families, subscription }`:

   - **`pi`** — `NativeCli`; the canonical parent; full constitutional/tool authority.
   - **`claude-native`** — `NativeCli` (`claude` CLI in a tmux lease); `permission_mode: auto` for headless sub-sessions (the Omnigent claude-native pattern).
   - **`codex-native`** — `NativeCli` (`codex` CLI); `yolo` bypass for headless sub-sessions.
   - **`hermes-acp`** — `Acp`; the local self-hosted lane via `vendors/hermes-agent/` ACP adapter; reaches any portal/OpenRouter family.

   A **launch profile** per harness is `{ binary, args, env, sandbox, permission_profile }` (the Omnigent native-harness shape). The registry is the single place a new harness is added. The `PiProviderProfile` contract in `capability-matrix.json` is the existing per-provider attribute surface this registry consumes.

   **Implementation scope:** registry as a ta-onta module + a thin Rust resolver at the gateway boundary; `roster preflight` — `command -v claude codex pi hermes` at orchestration start, recording the AVAILABLE set per run (the Polly pattern), so routing only ever targets a harness whose CLI actually resolved on this machine. A missing harness is surfaced to the user ("install the X CLI to enable that lane"), never silently retried.

   **Verification:** registry resolves each harness to a backing kind + launch profile; roster preflight drops an unavailable harness from the routable set; adding a harness is a registry entry only (no dispatch-path edits) — asserted by a test that registers a stub harness and dispatches a no-op turn.

   **Cross-track hooks:** 12.22 (slot CLI resolves `model_slot`), 12.24 Phase 1 (Hermes vendored), capability-matrix `provider_profile_contract`.

3. **42.3 — Unified harness launcher (S0 epi-cli mechanism)** *(spec-ahead-integration; depends on 42.2; cross-link 12.06, 12.30)*

   Consolidate the scattered launch sites behind one `Body/S/S0/epi-cli/src/agent/harness.rs` launcher driven by the registry. It absorbs `agent/launch.rs` (`pi`), `code/mod.rs` (`claude`), and the multi-agent launchers in `agent/{team,chain,subagents,spawn}.rs`, each becoming a launch profile rather than a hardcoded `Command::new`. The launcher allocates a tmux lease per sub-session via the existing `agent/tmux.rs` (no new tmux code; this is wiring over Tranche 12.06's terminal tools) and registers the child in the gateway `chat_processes` map.

   **Implementation scope:** one launcher, N profiles; the legacy `epi code` and `epi agent` entrypoints route through it; ACP harnesses (`hermes-acp`) connect over the ACP socket instead of a tmux pane but register the same session handle.

   **Verification:** `epi agent launch --harness {pi,claude-native,codex-native,hermes-acp}` (where authed) yields a leased pane (or ACP connection) + a registered child; `epi code` is observably routed through the unified launcher (no direct `Command::new("claude")` remains — asserted by a grep-guard test); the `pi` path is behaviourally unchanged.

   **Cross-track hooks:** 12.06 (Pleroma terminal/cmux tools the launcher leases), 12.30 (tmux topology mirrors dispatch — the launcher is what the topology map drives).

4. **42.4 — Per-session harness binding in Khora `session-workspace.json` (S4-0p Khora + Track 39 AP-2)** *(spec-ahead-integration; depends on 42.3; extends Track 39 Access Pattern 2)*

   Extend the Track 39 `session-workspace.json` (`{gate_state_root}/sessions/{session_key}/session-workspace.json`) with a `harness` block: `{ harness_id, model_slot, backing, tmux_lease | acp_endpoint, permission_profile, cf_identity, parent_session_key }`. The session-workspace IS the durable per-session harness binding — the live `provider_override` / `model_override` on `SessionRecord` (12.02) project into it. Parent (Anima/Epii) sessions bind `harness = pi` canonically; sub-sessions bind their own and link to the parent via `parent_session_key` + `subagent_lineage`.

   **Implementation scope:** lands in the `session-workspace.ts` module Track 39 already creates; Khora `khora_write` authors it atomically (tempfile + rename); on Pi process restart Khora bootstrap reads the binding before `CONTINUATION.md` and resumes the lease if live (Track 39's existing recovery flow, now harness-aware). **Write authority enforcement:** no harness binding is written except through `khora_write`; gateway dispatch validates the calling session has Khora write-authority before binding.

   **Verification:** spawning a `codex-native` sub-session under a Pi parent writes a distinct workspace binding + lease, lineage-linked to the parent; killing and restarting the parent Pi resumes its binding without re-bootstrapping; a binding write that bypasses `khora_write` is rejected.

   **Cross-track hooks:** Track 39 AP-2 (Khora session layer), 12.02 (`SessionRecord` override fields), DR-EROS-1 (`cf_identity` carries constitutional caste).

5. **42.5 — Harness-neutral transcript-of-record (S3 gateway)** *(spec-ahead-integration; depends on 42.1; honours Track 39 ONE-substrate invariant)*

   Extend the gateway transcript (`Body/S/S3/gateway/src/chat.rs`, `~/.epi/gate/transcripts/<slug>.jsonl`) to persist normalized `HarnessTurnEvent`s at turn-event granularity (tool calls, not only final text), each tagged with `harness_id`, `vak_address`, `run_id`. **Invariant: no harness owns history; the gateway session transcript is the record of what happened, in one shape, regardless of which harness produced it.** Per-harness capture tools (claude-mem and the like, vendored at `vendors/claude-mem-v10.5.5/`) are demoted from "the memory system" to an *optional HOT-tier ingest source* — they are not the source of truth and not required.

   This is the single load-bearing reason to normalize harness events: it makes the downstream Sophia/Aletheia summarisation (42.9) read the same shape for a Pi session and a Codex sub-session, so the memory pipeline is harness-blind by construction.

   **Implementation scope:** extend `transcripts::append_*` to accept event-granular records; a Pi turn and a Codex turn serialize to a byte-compatible event schema; the transcript remains the gateway's, written under Khora session authority.

   **Verification:** a Pi-run and a Codex-run session produce transcript events that deserialize through the same reader with zero harness-specific branches; the memory summariser (42.9) consumes both without a harness switch; no transcript write bypasses the gateway.

   **Cross-track hooks:** Track 39 (ONE-substrate), 12.36 (phase-preserving VAK on emissions — transcript events carry phase-qualified coordinates).

6. **42.6 — Inbox = the session NOW/day folder; async dispatch + wake (Khora + Anima)** *(spec-ahead-integration; depends on 42.4; cross-link ouroboros, techne-relay)*

   The async-delegation coordination surface is the **vault**, not an external queue. A delegated sub-session writes its result into the parent session's NOW folder (`Idea/Empty/Present/{DD-MM-YYYY}/{session}/`) — or the **day folder** for cross-session results — as a Khora-authored, wikilinked artifact. The orchestrator's "wake" is "a result artifact appeared in my NOW/day folder," surfaced by Khora's session-workspace watch — never a busy-poll. Result artifacts are shaped by `purpose`: `implement` → PR/diff handle + verification report; `review` → blocking / non-blocking / suggestions (file:line); `explore`/`search` → findings report; `converse` → dialogue line.

   `ouroboros` (the legacy orchestration skill) is reframed as one *topology* over this surface — a worktree-isolated worker whose diffs flow back into the NOW folder — implemented by the existing `worktrunk` + `techne-spawn` + `techne-relay` + `techne-close` skills, not a bespoke mechanism.

   **Implementation scope:** the launcher (42.3) sets each sub-session's result-drop to the parent NOW/day folder; Khora session-workspace watches for result artifacts and emits the wake; no external inbox/bin is built.

   **Verification:** a dispatched sub-session's result lands in the parent's NOW folder and wakes the parent via folder-watch (asserted without any polling call); a cross-session result lands in the day folder; the `ouroboros` topology round-trips a diff from a worktree sub-session into the NOW folder.

   **Cross-track hooks:** Track 39 AP-2 (session-workspace watch), Pleroma `worktrunk`/`techne-*` skills, Day/NOW paradigm.

7. **42.7 — Two-axis delegation router (Anima `dispatch-policy.ts`)** *(spec-ahead-integration; depends on 42.2, 12.22, 12.23; cross-link 12.20)*

   Extend the Anima MoE dispatch-policy (`Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts`, Tranche 12.23) to emit a `HarnessDispatch` resolving **two independent axes**:

   - **Model-family axis (task/diversity driven):** the slot/family for the task — a *different family* for review/diversity (escape self-bias), the *strongest* family for hard implementation, a *cheap* family for explores. Review is "fresh-context sub-session, preferably a different model family" — NOT a forced harness swap.
   - **Harness/subscription axis (cost driven):** once the family is chosen, pick the **cheapest authed harness** that can serve it, from the roster (42.2) and a subscription/cost map. A subscription-backed lane (Claude Max via `claude-native`, a Codex subscription via `codex-native`) is preferred over metered API for the families it covers. Config vocabulary: `config.harness.subscription.<harness>` and `config.harness.cost_class.<family>` (no hardcoded model; slot resolution per 12.22 / DR-MODEL-1).

   **Implementation scope:** the router composes (family-for-task) then (cheapest-harness-for-family); Mercurius Elo (12.20) may later weight the `(model_family, harness, VAK-context)` tuple from trial outcomes, but the v1 policy is the static cost map + roster.

   **Verification:** a `review` task routes to a different model family than the implementer; given two authed subscriptions, the router selects the flat-cost lane over metered API; an `explore` routes to a cheap family; an unavailable harness is never selected.

   **Cross-track hooks:** 12.23 (dispatch policy), 12.22 (slot CLI), 12.20 (Mercurius Elo — future weighting), DR-MODEL-1.

8. **42.8 — Skill centralisation + per-harness projection (the skill gap)** *(spec-ahead-integration; depends on 42.3; cross-link 12.28, pleroma-skill-proxy)*

   The skill-layer call: a single central skill store, symlink-projected into every installed harness's native skill directory on sub-session launch — the "npx skills" pattern, generalised. This collapses the internal/external agent distinction at the skill layer (a Claude sub-session run as Eros loads the *same* canonical `SKILL.md` files as an internal Pi Eros).

   - **Central store** = the union of the carrier skill homes — Pleroma atomic tools (`Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/`), Anima orchestration skills (`Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/`), Aletheia tools (`Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/`), and epi-logos plugin skills (`Body/S/S5/plugins/epi-logos/skills/`). One source of truth (each carrier owns its skills; the projector unions them per sub-session).
   - **Projector** = a generalisation of the existing per-agent compat projector (`.epi/agents/{main,anima,epii}/agent/compat/{.agents/skills, codex-home/skills}/`) to **all** installed harnesses, using **symlinks** (not copies) so the central store stays authoritative:
     - `claude-native` → `<worktree>/.claude/skills/` (project-scope, mirroring today's project `.claude/skills/`)
     - `codex-native` → `$CODEX_HOME/skills/` (project `.codex/skills/`)
     - `hermes-acp` → the agentskills.io-standard skills dir (Hermes supports the open standard)
     - `pi` → native extension skill registration (unchanged)
   - **CF identity** is appended per sub-session (the `pleroma-skill-proxy` `CF_IDENTITY` mechanism), so the projected skill grammar carries constitutional caste.

   `pleroma-skill-proxy` (`Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/SKILL.md`) is the per-harness fork implementation of this projector — Track 42 promotes it from a hand-invoked skill to a launcher step (42.3): every sub-session is projected at launch, deterministically, before its first turn.

   **Why symlinks, not the spec-bundle model.** Omnigent packages skills *into* each agent image (a tarball). We invert it: one central store, projected by symlink, because our skills are canon-adjacent (Pleroma + epi-logos plugin) and must stay single-sourced — a skill edit must be instantly visible to every harness, and skills must never fork per-harness.

   **Implementation scope:** projector module (idempotent symlink refresh on launch); `skill_lookup` (Tranche 12.28) provides semantic discovery over the projected store identically across harnesses; the central store is `s5'.gnostic.list_notebooks`-visible per DR-S5-ONE-1.

   **Verification:** launching a `claude-native` / `codex-native` / `hermes-acp` sub-session projects the central skills into its native dir as symlinks pointing at the one store; a skill edited in the central store is immediately visible to all harnesses (symlink, not copy — asserted by editing and re-reading through each harness's path); `skill_lookup` returns the same skill set across harnesses; a sub-session carries its `CF_IDENTITY`.

   **Cross-track hooks:** 12.28 (`skill_lookup`), `pleroma-skill-proxy` (per-harness fork), DR-S5-ONE-1 (store is gnostic-visible), DR-EROS-1 (CF identity).

9. **42.9 — Harness-blind cross-session memory pipeline (Sophia/Aletheia → Graphiti)** *(spec-ahead-integration; depends on 42.5, 42.6; cross-link 06, 12.36)*

   Make the cross-session memory pipeline explicit and harness-blind. The pipeline — NOT a vendored plugin — is: **harness-neutral transcript (42.5) + NOW-folder thought-cycle → Sophia at (5/0) post-execution summarises per VAK execution → Aletheia night' crystallises → Graphiti episode ingest keyed by the session's VAK address.** Graphiti episodes are indexed by `{ day, session, VAK coordinate path executed }` via `add_episode(... group_id ...)` (`Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`); `aletheia_session_promote` is the HOT→COLD path.

   This is where the claude-mem question resolves: the cross-session memory system *is* this Sophia/Aletheia → Graphiti pipeline; `vendors/claude-mem-v10.5.5/` and `vendors/claude-memory-compiler/` are loose references for mechanics (FTS5 recall, LLM summarisation, daily logs), not woven dependencies and never Claude-scoped in intent. Because the transcript is harness-neutral (42.5) and the inbox is the NOW/day folder (42.6), the summariser reads the same shape whether Pi, Claude, Codex, or Hermes ran the session — one pipeline, all harnesses.

   **Implementation scope:** Sophia disclosure + Aletheia crystallisation read the gateway transcript events (not a harness-specific log); episode `group_id` derives from the session VAK address with phase preserved (12.36); no harness-specific code in the summariser.

   **Verification:** a Codex-run sub-session and a Pi-run session both yield VAK-keyed Graphiti episodes through the identical Sophia/Aletheia path (asserted by running the summariser over both transcripts and diffing the code path); a phase-qualified coordinate survives into the episode `group_id`; `aletheia_session_promote` promotes from the harness-neutral transcript.

   **Cross-track hooks:** [06-m5-epii-reconciliation.md](06-m5-epii-reconciliation.md) (Aletheia crystallisation + wisdom curation), 12.36 (phase-preserving VAK), Track 39 (Graphiti as ONE-substrate episodic layer), Track 41 (`group_id` episode convention).

## What this UNBLOCKS

- **Multi-harness delegation, governed.** A Pi parent can dispatch a scoped sub-task to a Claude or Codex sub-session with a normalized envelope, a leased session, a policy-gated tool surface, and a result that returns to the NOW folder — all without a bespoke shell-out.
- **Cost-effective subscription routing.** Work runs on whichever authed harness fronts a flat-cost subscription for the chosen model family, instead of burning metered API.
- **Fresh-context cross-family review** as a first-class dispatch (different model family, not a forced harness swap) — the self-bias-escaping verifier the Eros/Sophia roles want.
- **Harness-blind memory.** Sophia/Aletheia build the Graphiti graph from one transcript shape regardless of harness, so cross-session recall and Epii review are uniform across Pi, Claude, Codex, and Hermes sessions.
- **One skill grammar everywhere.** Every harness sub-session sees the same Pleroma + epi-logos skills via symlink projection — the internal/external distinction collapses at the skill layer.
- **Post-cycle-3 readiness.** From cycle 3 the system is aware of and communicable with Pi, Claude, Codex, and the local Hermes instance behind one contract — the substrate for the planned Pi → OMX/Codex → claw-rust migration lands here, not as a later rewrite.

## What this is NOT

- **Not a new session store, process manager, or memory system.** It is a contract + binding + projector over existing substrate (gateway SessionStore, `agent/tmux.rs`, Khora session-workspace, Graphiti).
- **Not Pi replacement.** Pi remains the canonical parent for Anima and Epii. Sub-sessions are leaves; harness boundaries fall on session boundaries.
- **Not harness-as-diversity-lever.** Diversity is the model-family axis; the harness is the access/cost axis.
- **Not a per-harness skill fork.** One central store, symlink-projected. Skills never diverge per harness.
- **Not a DR ratification gate.** Track 42 is designed for direct cycle 3 build; it references bound DRs (S5-ONE-1, MODEL-1, EROS-1) as context, and introduces none.

## End-to-end acceptance (release-gate addition)

```
Pi parent session_start (harness=pi, bound in session-workspace.json)
  → Anima dispatch-policy resolves a `review` task:
        model-family = different family than implementer;
        harness = cheapest authed lane serving it (subscription map)
  → unified launcher boots a codex-native sub-session in a worktree,
        leased tmux pane, projected central skills (symlinks) + CF_IDENTITY
  → sub-session runs; every tool call passes the meta-layer policy gate;
        turn-events persist to the harness-neutral transcript
  → result artifact lands in the parent NOW folder → parent woken (no poll)
  → Sophia (5/0) summarises per VAK; Aletheia night' → Graphiti episode (VAK group_id)
  → parent session.compact serializes binding; session.resume restores lease
```

All steps succeed; no operation bypasses the gateway or Khora write-authority; the transcript and the Graphiti episode are byte-compatible with the same run executed on `claude-native` instead of `codex-native` (harness-blindness proof); skill edits in the central store are live across all harness sub-sessions.
