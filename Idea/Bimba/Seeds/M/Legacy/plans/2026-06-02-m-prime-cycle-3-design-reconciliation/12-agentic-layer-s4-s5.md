# Track 12 — Agentic Layer (S4 ↔ S5) Ownership Closure — Pi + Anima + Subagents

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


**Canonical architecture (per DR-M5-1 / DR-B-1 validation):**

- **Pi** is the underlying agent harness. One Pi. Runtime gateway, dispatch, capability-parity, axiom-translation (per DR-B-2).
- **Anima** is the main dispatching agent. Anima dispatches **6 Aletheia subagent techne-guardians** during Aletheia-crystallisation-mode for skill/system/service tasks. Each guardian stewards a specific techne class within Pleroma's atomic-skills repository (Pleroma-Techne).
- **6 Aletheia subagent techne-guardians** (each guards a specific techne class within Pleroma-Techne per DR-S4-TECHNE):
  - **Anansi** (CF0) — guards **coordinate-mapping / blueprint / Darshana-REPL** techne
  - **Janus** (CF1) — guards **temporal-structure / bhedabheda-threshold** techne
  - **Moirai** (CF2) — guards **GraphRAG-distillation** (Klotho/Lachesis/Atropos) techne
  - **Mercurius** (CF3) — guards **Kairos-signal / qualitative-temporal-pattern** techne
  - **Agora** (CF4) — guards **plugin-absorption / skill-index / multi-channel-aggregation** techne
  - **Zeithoven** (CF5) — guards **creative-advance / skill-and-agent-creation** techne

  These are PI-native specialists invoked through Anima during Aletheia-crystallisation-mode. They surface in Pi monitoring views as Anima-dispatch sub-traces under Aletheia, NOT as first-class peer agents.
- **Pleroma-Techne (S4-2') is the atomic-skills substrate** the 6 guardians steward. Pleroma has TWO faces per DR-S4-TECHNE: **VAK capability membrane** (canonical) + **Techne atomic-skills repository** (canon-aligned 2026-06-03). The existing Techne gateway tools (`techne_gateway_*`, `techne_session_*`, `techne_cmux_*` at `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts:25-259`) are the gateway over this skills layer. **Techne is NOT an agent**; the S4 canon §14-Agent Roster mis-classified it. No `Techne-profile file` agent profile lands.
- **Six ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia-carrier) are system/service routing infrastructure — they are NOT agents. Aletheia-the-carrier hosts the crystallisation mode; Anima dispatches within it.
- **ACR (Agentic Control Room) substrate is tangent-development drift** to be repurposed as a Pi runtime monitoring surface, not retained as a "constitutional-agents review panel."
- The `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array in `capability-matrix.json` is either documented as psyche-aspect rendering material (surfaced through Anima for recognition/meditation work — NOT separate agents) or deprecated outright.

## Cross-track hook: Track 41 Vama Shakti Factory + Nara M4' Dia-logical Arena

**Phase-K 2026-06-16 addition** (per DR-VAMA-1..6 VALIDATED). Track 41 lands a new Pleroma-Techne tool — `techne_vama_summon` — that takes any addressable `/Idea/Bimba/World/` entity by coordinate, along with one of four canonical classifiers (egregore / sprite / daemon / mantra per DR-VAMA-6), and produces a **Vama Shakti** — the active animating descent of the entity's Form into dialogue — as an ad-hoc PI agent voice. Psyche is the canonical template kernel (its CF (4.0/1-4.4/5) continuity-holder role makes it the only constitutional agent structurally capable of *giving* continuity to an entity that did not previously have its own — Psyche-as-Spanda invoked over a /World coordinate IS what manifests the Vama Shakti; per DR-VAMA-1). The voice carries a **dialogue-only capability profile** (frozen at registration; no system tools, no vault writes, no subagent dispatch, no terminal authority — per DR-VAMA-5) and is structurally distinct from the constitutional caste and the Aletheia techne-guardians.

The arena's runtime substrate is **SpacetimeDB** (four new tables + `WarmVamaShakti` joining the existing presence layer keyed by `vama_shakti_identity_handle = vama_shakti_quintessence_hash`) and its user-facing surface is the **Theia M4' Electron tab** as a widget under the existing `m4-nara` extension scaffold (per DR-VAMA-4; CLI is admin-only carve-out for ONE-substrate compliance). Anima orchestrates turns via `anima_arena_orchestrate(scene_key)` with **classifier-aware turn-routing** (daemon-class post-user, sprite-class kairos-burst, mantra-class kairos-threshold, egregore-class longer turn budget) and CPF (00/00) gating at scene setup. Moirai (CF2) closure-distills via `moirai_arena_distill(scene_key)` with **classifier-modulated edge patterns** (egregore fan-out, sprite sparse high-resonance, daemon user-cited-weighted, mantra element/chakra/decan axes) — Jungian amplification routed back to canon. Mercurius signal-relay supplies live `mercurius.kairos.delta` for kairotic-time turn routing.

The full track at [`41-vama-shakti-factory-and-dialogical-arena.md`](41-vama-shakti-factory-and-dialogical-arena.md); canonical M4' seed at [`Idea/Bimba/Seeds/M/M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md`](../../../M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md). Track 12 substrate is consumed verbatim — Track 41 does not re-architect the agentic-layer; it adds one Techne tool (`techne_vama_summon`) + a patch to Psyche's profile declaring `vama_shakti_template_authority` + two new orchestration tools (`anima_arena_orchestrate`, `moirai_arena_distill`) + an ad-hoc-agent registry extension to the PI runtime with dialogue-only dispatch-guard, all per existing patterns documented in the tranches below. The Nara Vāma classifier per DR-M4-2 is the M4 personal-domain footing that this track expands into the dynamic dia-logical subagent system.

## Cross-track hook: Track 42 Harness Dynamics Surface (multi-harness runtime substrate)

**Phase-K 2026-06-16 addition** (designed for direct build; no DR gate). Track 42 lifts the harness boundary — today hardcoded to Pi across `agent/launch.rs:31`, `code/mod.rs:77` (already shells out to `claude`), and the `agent/{team,chain,subagents,spawn}.rs` tmux launchers over `agent/tmux.rs:334` — into one **Harness Dynamics Surface**: a normalized dispatch envelope + turn-event stream (new `gateway-contract/src/harness.rs`), a harness registry with two backing kinds (`NativeCli` for Pi/Claude/Codex in a tmux lease, `Acp` for the local Hermes lane), a unified S0 launcher (`agent/harness.rs`), a per-session harness binding in Khora's `session-workspace.json`, a harness-neutral transcript-of-record, and a symlink-based skill projector that gives every harness the same Pleroma + epi-logos skill grammar.

Track 42 is the runtime substrate this track's dispatch consumes. It does **not** re-architect Track 12; it extends specific tranches by cross-link: **12.02** (`SessionRecord` override fields project into the workspace harness binding), **12.22** (the model-slot CLI resolves the model-family axis), **12.23** (the Anima `dispatch-policy.ts` emits the two-axis `HarnessDispatch` — model-family for the task, cheapest authed harness/subscription for that family), **12.24 Phase 1** (Hermes vendoring backs the `hermes-acp` lane), **12.28** (`skill_lookup` runs identically over the projected store), **12.30** (the tmux topology map drives the unified launcher), **12.31** (`ConversationSliceHandle` rides the dispatch envelope). The canonical-parent law holds: parent sessions bind `harness = pi` (Anima + Epii); only sub-sessions bind another harness, and harness boundaries fall on session boundaries so the transcript stays harness-neutral and the memory pipeline harness-blind. Cross-vendor *review* is corrected to a **model-family** axis (fresh-context, different family) — NOT a forced harness swap; the harness is the access/cost lever (subscription routing for cost-effectiveness).

The full track at [`42-harness-dynamics-surface.md`](42-harness-dynamics-surface.md). Skill centralisation generalises the existing per-agent compat projector (`.epi/agents/{main,anima,epii}/agent/compat/{.agents/skills, codex-home/skills}/`) to all installed harnesses and promotes `pleroma-skill-proxy` from a hand-invoked skill to a deterministic launcher step.

## Source Specs and Matrix

- Canonical: `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` (Aletheia tool-guardian), `Body/S/S5/epi-kbase/CONTRACT.md`, `Body/S/S4/pi-agent/` (Pi harness)
- Reframed: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md §M5-4'` (rewrite required around Pi+Anima)
- Audit-target (tangent): `Body/M/epi-theia/extensions/agentic-control-room/`, `Body/S/S4/plugins/pleroma/capability-matrix.json constitutional_agents[]`
- Full row-level evidence: `plan.runs/wave-b-agentic-layer-matrix.md` (read with DR-M5-1 lens — the matrix surfaces the tangent that needs unwinding)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S4/pi-agent` (Pi harness); `Body/S/S4/ta-onta/{khora, hen, pleroma, chronos, anima, aletheia}` (six carriers); `Body/S/S4/ta-onta/aletheia/S5'/agents/` (six subagent .md profiles + janus-envelope.schema.json); `Body/S/S5/epi-gnostic`; `Body/S/S5/epi-kbase`. Audit-and-repurpose — `Body/M/epi-theia/extensions/agentic-control-room/` + `capability-matrix.json constitutional_agents[]`.

## Redis/Psyche/Kbase Residency Preflight

Before normal Track 12 agentic-layer work resumes, pass the pre-Cycle-3 Redis residency cleanup at [[../../../../S/S3/S3-REDIS-RUNTIME-SPEC]]. Agentic dispatch evidence, Psyche continuity, kbase/Gnosis retrieval, and source-pool references must carry S3-owned Redis runtime handles rather than raw Redis clients or raw protected bodies. [[Psyche]] owns continuity law; [[S3]] owns the hot/active runtime state; [[S5]] owns kbase/source meaning; [[S0]] remains only the adapter.

## Tranches

0. **12.01 — Terminal session-safety inventory and binding contract** *(preflight-contract; S0/S3/S4 boundary; blocks 12.1)*

   Land the terminal/session safety inventory before normal Track 12 execution resumes. The deliverable is `plan.runs/12.01-terminal-session-safety-inventory.md` and must enumerate the current gaps as binding facts, not as guesses: `epi agent --persist` currently routes through `agent/tmux.rs::run_plan` but only creates a tmux envelope; it does not inject the `pi ...` launch command into the pane. `SessionRecord` carries `cmuxWorkspace/cmuxSurface/cmuxPaneId` and `cliSessionIds`, but not a first-class tmux terminal lease. Pleroma exposes bounded `techne_cmux_*` visibility helpers, but several direct cmux management tools shell out to `cmux` and attempt stale `epi gate teams patch` calls that are not present in the S0 CLI. Gateway/Redis/SpaceTimeDB already publish session surfaces, but terminal state is not part of that projection.

   The contract section defines the canonical `TerminalBinding` / `TerminalLease` shape to be implemented by later rows: `terminalProvider`, `tmuxSession`, `tmuxWindow`, `tmuxPaneId`, `terminalStatus`, `leaseOwner`, `leasePurpose`, `leaseExpiresAtMs`, `lastObservedAtMs`, `capturePolicy`, `redactionPolicy`, `attachedSessionKey`, `attachedAgentId`, and `lastRunId`. The binding is always attached to a gateway session key; terminal authority is never granted by naked pane id. Capture policy defaults to metadata-only; bounded output capture requires explicit session-scoped request and redaction.

   Write scope: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/12.01-terminal-session-safety-inventory.md`.

   Verification: inventory cites concrete file/line evidence for `agent/tmux.rs`, `agent/spawn.rs`, `agent/subagents.rs`, `gate/spacetimedb_bridge.rs`, `portal/runtime_state.rs`, and `ta-onta/S4-2p-pleroma/extension.ts`; `rg -n "TerminalBinding|TerminalLease|terminal session-safety" plan.runs/12.01-terminal-session-safety-inventory.md` returns the contract; no implementation files are changed by this tranche.

0. **12.02 — Gateway session record terminal binding fields** *(code-pending-closure; depends on 12.01)*

   Extend the S3 gateway contract/session store so terminal identity is a first-class session-state field, not incidental cmux metadata. Add typed terminal binding fields to `SessionRecord` and `SessionPatch` in `Body/S/S3/gateway-contract/src/` and `Body/S/S3/gateway/src/session_store.rs`, expose them through `sessions::record_to_value`, `sessions.list`, `sessions.resolve`, `sessions.patch`, `sessions.fork`, and `sessions.resume`, and preserve inheritance rules: child subagents inherit only safe binding metadata, never active authority, unless the parent explicitly grants a fresh terminal lease. `cliSessionIds` remains for external CLI session ids; `terminalBinding` is the terminal authority/provenance envelope.

   Refusal law: a patch that sets `tmuxPaneId` or `terminalStatus=attached` without `attachedSessionKey` equal to the target canonical session key is refused. A patch that extends `leaseExpiresAtMs` must record `leaseOwner` and `leasePurpose`. A patch that requests capture beyond metadata-only must include `capturePolicy.maxLines`, `capturePolicy.redactionPolicy`, and a non-expired lease.

   Verification: gateway-contract unit test round-trips `TerminalBinding` through serde; session-store test persists and reloads terminal binding; fork/resume tests preserve safe metadata and clear active lease authority; `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions` plus a new terminal-binding contract test pass; `rg -n "terminalBinding|TerminalLease|tmuxPaneId" Body/S/S3/gateway-contract/src Body/S/S3/gateway/src` returns the landed schema and patch handling.

0. **12.03 — `epi agent --persist` launches real Pi inside tmux with session lease** *(code-pending-closure; depends on 12.02)*

   Replace the current envelope-only persistence path with real terminal-backed Pi execution. `agent/spawn.rs::spawn(... persist=true ...)` must allocate or resolve a gateway session key, write a `TerminalLease`, create the tmux session/window/pane, and inject the exact `pi ...` launch command into the pane using safe argument construction. The pane environment must include `EPI_REPO_ROOT`, `EPI_AGENT_ID`, `EPI_AGENT_ROLE`, `EPI_AGENT_SCOPED_SURFACE`, `EPI_AGENT_HOME`, `EPI_AGENT_DIR`, `PI_CODING_AGENT_DIR`, `EPI_GATE_STATE_ROOT`, `EPI_AGENT_GATEWAY_URL`, `EPI_GATE_SESSION_KEY`, and `EPI_TERMINAL_LEASE_ID`. The report returned by `--json` includes the canonical session key and terminal binding metadata.

   Add bounded tmux operations under `epi agent tmux`: `inspect --session-key`, `capture --session-key --lines N`, `send --session-key --text ...`, and `abort --session-key`. `send` refuses if the lease is absent/expired or if the target pane does not match the session record. `capture` redacts through the session capture policy and records a transcript event with a capture handle, not raw unbounded terminal output. `abort` sends an interrupt/stop sequence and patches terminal status; it does not merely append an abort transcript entry.

   Write scope: `Body/S/S0/epi-cli/src/agent/spawn.rs`, `Body/S/S0/epi-cli/src/agent/tmux.rs`, `Body/S/S0/epi-cli/src/agent/runtime.rs`, `Body/S/S0/epi-cli/src/agent/launch.rs`, `Body/S/S0/epi-cli/tests/agent_spawn.rs`, `Body/S/S0/epi-cli/tests/agent_tmux_terminal_binding.rs`.

   Verification: command-construction tests assert shell-free argument construction; integration test against a real tmux binary (skipped only when `tmux` is absent) starts `pi --help` or a deterministic local test command inside tmux and observes the pane via `capture-pane`; existing fake-binary tests are downgraded to command-shape tests and cannot be the only acceptance evidence; `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_spawn --test agent_tmux_terminal_binding` passes; manual smoke `epi --json agent anima --persist --role psyche "status"` returns a session key with non-empty terminal binding.

0. **12.04 — Subagent/team/chain terminal authority propagation and stop semantics** *(code-pending-closure; depends on 12.03)*

   Extend `RuntimeSubagentRequest`, team dispatch, and chain dispatch so terminal authority is explicit and safe. Default captured subagent runs remain non-terminal. Terminal-backed subagent runs require a `TerminalLease` attached to the child session key; team/chain dispatch may create one pane per member only when the caller chooses terminal-backed execution. `prepare_runtime_session` must patch terminal metadata before launch, and `list_runtime` must surface terminal status alongside cmux projection. `stop_runtime` must terminate or interrupt the bound terminal process when a live terminal binding exists; transcript-only abort remains valid only for captured non-terminal sessions.

   Team/cmux relation: `cmuxWorkspace/cmuxSurface/cmuxPaneId` remains the projected workspace/surface identity; `terminalBinding.tmux*` is the actual terminal process handle. The two may correspond, but one must not impersonate the other. A team member cannot send to another member's pane by guessing `cmuxPaneId`; it must hold the matching session key + lease.

   Write scope: `Body/S/S0/epi-cli/src/agent/subagents.rs`, `Body/S/S0/epi-cli/src/agent/team.rs`, `Body/S/S0/epi-cli/src/agent/chain.rs`, `Body/S/S0/epi-cli/tests/agent_team_cli_contract.rs`, `Body/S/S0/epi-cli/tests/gate_team_runtime_contract.rs`, `Body/S/S0/epi-cli/tests/terminal_subagent_runtime_contract.rs`.

   Verification: real `SessionStore` tests create parent and child sessions, dispatch a terminal-backed worker, assert lineage/NOW inheritance plus terminal binding; stop test proves live terminal status changes and transcript abort is written; chain test proves each worker gets a distinct lease/pane; non-terminal captured subagent tests continue to pass unchanged; `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_team_cli_contract --test gate_team_runtime_contract --test terminal_subagent_runtime_contract` passes.

0. **12.05 — Gateway, Redis, SpaceTimeDB, and portal terminal projection** *(code-pending-closure; depends on 12.02)*

   Carry terminal binding through the existing session projection surfaces. `gate/spacetimedb_bridge.rs::publish_session_record` publishes `terminalBinding` into the `session_surface` payload and a redacted terminal-status fragment into `global_temporal_surface` only when the capture policy allows it. `gate/temporal.rs::context_for_record` exposes terminal metadata under `/terminal` so Redis hydration can store a safe live-context handle. Redis keys store session-key, provider, status, lease expiry, and capture-handle references; they never store raw captured pane bodies by default. `PortalTemporalSurface` gains terminal status fields so Anima/Epii/Techne can see whether a session is terminal-backed without needing raw tmux access.

   SpaceTimeDB registration should treat terminal state as live projection metadata, not command authority. Any reducer/client method that observes terminal state must be read-only unless it routes back through `sessions.patch` / bounded `agent tmux` commands.

   Write scope: `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, `Body/S/S0/epi-cli/src/gate/temporal.rs`, `Body/S/S0/epi-cli/src/portal/runtime_state.rs`, `Body/S/S0/epi-cli/tests/gate_spacetimedb_bridge.rs`, `Body/S/S0/epi-cli/tests/gate_temporal_context.rs`, `Body/S/S0/epi-cli/tests/portal_runtime_state_terminal.rs`.

   Verification: `gate_spacetimedb_bridge` test asserts `session_surface.payload.terminalBinding` is present and redacted; Redis hydration test asserts terminal metadata key exists without raw pane body; portal runtime-state test refreshes from gateway context and SpaceTimeDB projection with terminal fields; `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge --test gate_temporal_context --test portal_runtime_state_terminal` passes.

0. **12.06 — Pleroma-Techne terminal tools replace stale direct cmux patch paths** *(code-pending-closure; depends on 12.03)*

   Patch `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` so Techne exposes bounded terminal/session tools over S0 CLI surfaces instead of direct ungoverned tmux/cmux execution. Add tools: `techne_terminal_status`, `techne_terminal_inspect`, `techne_terminal_capture`, `techne_terminal_send`, `techne_terminal_abort`, each requiring `session_key` and returning gateway-shaped JSON. `techne_terminal_send` requires an explicit lease and uses `epi agent tmux send --session-key ...`; it never shells to `tmux send-keys` directly.

   Fix exposed stale gaps: remove or repair the `epi gate teams patch` calls in `techne_cmux_pane_assign` and `techne_cmux_layout_set`. If team patching is still needed, land the real CLI surface under `epi agent team patch` with tests, or route through `sessions.patch` for session-level cmux fields. Direct `cmux` calls remain allowed only for non-authoritative projection helpers (`list-workspaces --projected`, `identify --projected`) or for surfaces that immediately write through gateway session state and prove the write succeeded.

   Verification: Pleroma extension tests assert the five `techne_terminal_*` tools are registered and invoke `epi agent tmux ...` with `session_key`; stale `epi gate teams patch` strings are gone or backed by a real implemented command; capability matrix lists terminal tools under Techne/Pleroma with `session_state_authority: "gateway"` and `raw_terminal_authority: false`; `pnpm --filter @epi-logos/pleroma test` or the repo's ta-onta extension contract test passes; `rg -n "gate teams patch|tmux send-keys" Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` returns no unsafe live path.

0. **12.07 — Pi-runtime monitor / OmniPanel terminal observability** *(spec-ahead-integration; depends on 12.05; cross-link 12.14)*

   Extend the Track 12.14 Pi-runtime-monitor decision so terminal-backed execution is visible as observability, not as hidden process state. The monitor renders: session key, active agent, role, team/chain lineage, NOW/day link, cmux projection, terminal provider/status, lease expiry, last observed tick, capture availability, and redacted last-run handle. It does not render raw terminal scrollback unless the capture policy grants bounded capture and the user invokes it.

   The monitor consumes `PortalTemporalSurface` and gateway `sessions.resolve`; it must not shell out to tmux or cmux. Diagnostics deep-link points to `epi agent tmux inspect --session-key ...` and `techne_terminal_inspect`, preserving the S0 gateway membrane.

   Write scope: `Body/M/epi-theia/extensions/agentic-control-room/**`, `Body/M/epi-theia/extensions/pi-runtime-monitor/**`, `Body/S/S0/epi-cli/src/portal/**`, `Body/M/epi-theia/extensions/test/**`.

   Verification: Pi-monitor spec/contract update names terminal observability fields; UI contract test renders a terminal-backed session and a captured non-terminal session distinctly; no monitor code imports tmux/cmux process libraries directly; `rg -n "terminalBinding|terminalStatus|leaseExpires" Body/M/epi-theia/extensions/agentic-control-room Body/M/epi-theia/extensions/pi-runtime-monitor Body/S/S0/epi-cli/src/portal` returns the intended consumer paths.

0. **12.08 — End-to-end terminal session safety acceptance harness** *(code-pending-closure; depends on 12.04, 12.05, 12.06, 12.07)*

   Land the full acceptance harness proving the plugin integration is production-safe at session state level. Scenario: initialize a NOW-bound session; start gateway; launch `epi agent anima --persist --role psyche` into tmux; inspect through Techne; capture bounded output; dispatch a terminal-backed subagent/team worker; publish session surface to SpaceTimeDB test bridge; hydrate Redis in best-effort mode; render portal temporal surface; abort the worker; verify the parent session remains valid and no raw terminal body crosses into global projection by default.

   The harness uses real files, real `SessionStore`, real transcripts, real gateway projection, real Redis hydration when Redis is configured, and real tmux when available. When tmux or Redis is unavailable in CI, tests must report an explicit skipped live-integration case and still run deterministic contract tests for command construction and redaction. Fake tmux/pi binaries may support unit-level command-shape tests only; they cannot satisfy the end-to-end acceptance criterion.

   Verification: new e2e test file under `Body/S/S0/epi-cli/tests/terminal_session_safety_e2e.rs` or equivalent; `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test terminal_session_safety_e2e` passes in live-capable environments; contract fallback tests pass in CI; `rg -n "raw terminal|terminal body|capturePolicy" Body/S/S0/epi-cli/tests Body/S/S4/ta-onta/S4-2p-pleroma` shows explicit redaction assertions; m-dev evidence string for this tranche includes real test counts and the live/skipped integration status.

1. **12.1 — Pi + Anima + subagents architecture audit (replaces ACR-actor parity)** *(doc-ahead-landing)*

   Audit report at `plan.runs/12.1-pi-anima-subagents-architecture.md` documenting the canonical architecture: Pi (harness), Anima (main dispatcher), 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes in Pleroma-Techne) (skill/system/service specialists invoked by Anima), six ta-onta carriers (system/service routing infrastructure, NOT agents). Map every actor / role currently in ACR `run-model.ts::AgenticActor` to one of these categories or to "tangent — deprecate." Rewrite `M5'-SPEC §M5-4'` around the canonical architecture.

   Verification: `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects collapsed union; `M5'-SPEC §M5-4'` patched.

2. **12.2 — `s5'.gnostic.*` gateway-endpoint registration as ONE-substrate scope** *(code-pending-closure; consolidates Tranche 06.1; EXPANDED 2026-06-15 per DR-S5-ONE-1; cross-links new plan file [`39-s5-prime-one-substrate-layer.md`](39-s5-prime-one-substrate-layer.md))*

   Three independent wave-2 scouts (vault namespace, VAK compression, 4/5/0 mental pole) identified `s5'.gnostic.*` registration as the single biggest unblock across the entire cycle 3 substrate. Per DR-S5-ONE-1, this tranche EXPANDS from gateway-only registration to the **full ONE-substrate scope** — gateway + Khora session + S0 tmux + Redis hierarchical + CLI parity, all working as one substrate (temporal + contextual + informational-conditional + logos-definitional).

   **Scope** (covers all five surfaces; comprehensive plan in [`39-s5-prime-one-substrate-layer.md`](39-s5-prime-one-substrate-layer.md)):

   **(a) Gateway routes** — register **≥10 methods** in `Body/S/S3/gateway-contract/src/lib.rs` + `Body/S/S3/gateway/src/`:
   - `s5'.gnostic.query(coordinate, depth)` → `[GnosticChunk]`
   - `s5'.gnostic.ingest(path, namespace)` → `IngestionReceipt`
   - `s5'.gnostic.notebook` (params: coordinate) → `NotebookSession`
   - `s5'.gnostic.status` → `GnosticNamespaceStatus`
   - `s5'.gnostic.candidates(filter)` → `[EntityCandidate]` (PASU orphan-candidate surface per CCT-14)
   - `s5'.gnostic.etymology(coord)` → `EtymologyCluster` (Atelier scent-following lens; sub-namespace per DR-WORLD-1)
   - `s5'.gnostic.resolve(coord)` → `GnosticEntityHandle` (consolidated read; unified-memory layer 2 per DR-WORLD-1)
   - `s5'.gnostic.list_notebooks(coord_filter)` → `[NotebookHandle]` (powers Library projection per DR-LIB-ATELIER-1)
   - `s5'.gnostic.episode_search(query, vak_filter)` → `[GraphitiEpisode]`
   - `s5'.gnostic.evidence_trace(passage_id)` → `[EvidenceAnchor]` (provenance pointer chain per scout findings)
   - `s5'.gnostic.seed_resolve(seed_query)` → `SeedResolution { citations, authors, methods, analyses }` *(NEW per CCT-22 §c gnostic-extraction-at-O#-handover pattern — symbolic graph operator surfacing the extractor + analyst split at the gateway)*
   - `s5'.gnostic.comparative_retrieval(base_passage_id, competitors)` → `[PerformanceDelta]` *(NEW per same pattern — motif-query for benchmark / failure-condition comparison; consumed by the gnostic-extraction-tier pipeline at `slot.gnostic_extractor`)*
   - `s5'.gnostic.musical_transcript(coord, tick, degree)` → `M3TranscriptionPacket` *(NEW per Tranche 12.38 — the musical-transcriptional face of the unified VAK act per Tranche 8.9)*

   Routes dispatch to `epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py}` (production Python package landed) for the original 10 methods; the three NEW methods (`seed_resolve`, `comparative_retrieval`, `musical_transcript`) dispatch to local Rust modules (per CCT-22 + Tranche 12.38 implementation plan) — anti-greenfield: gateway registers, does not duplicate logic that already exists in Python or in the new portal-core modules.

   **(b) Khora session layer integration** — session-workspace serialization at `{gate_state_root}/sessions/{session_key}/session-workspace.json` (per scout 4 finding); session identity propagation through gnostic operations; write-authority enforcement (no gnostic write may bypass Khora). Implementation: extend `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` with new `session-workspace.ts` module; serialize on `session_before_compact` + `session_shutdown` hooks; load on resume.

   **(c) S0 tmux integration** — `TerminalBinding` carried through gnostic dispatch (inherits Tranches 12.01-12.08 substrate); persistent gnostic-ingest operations get terminal-lease backing; failure during ingest is recoverable via lease validation. Implementation: extend `Body/S/S0/epi-cli/src/agent/tmux.rs` lease-checks to gnostic-shell call sites.

   **(d) Redis hierarchical keys** — promote from flat `s2:graph:semantic:{id}` / `s3:gateway:temporal:{session}` to **`{day}/{session}/{turn}/{coordinate}/*`** layout. Unlocks session-start cache warming (pre-populate per `{day}/{session}/*` scope on session-start); turn-scoped evidence aggregation (`SCAN {day}:{session}:{turn}:*` O(1) per turn); coordinate-conditional dispatch (Anima reads `{day}/{session}/{turn}/{coord}/ratings:*` per Mercurius); grandparent-session inheritance (child reads parent prefix, writes own). Implementation: extend `Body/S/S3/redis-context/src/lib.rs` with hierarchical namespace constants + `coordinate_lookup_snapshot(graph_revision, day, session, turn, coordinate)` helper.

   **(e) CLI parity** — every gateway route is also a CLI command:
   - `epi gnostic query <coord> [--depth N]`
   - `epi gnostic ingest <path> [--namespace gnostic|world|etymology|skills]`
   - `epi gnostic notebook <coord>`
   - `epi gnostic status`
   - `epi gnostic candidates [--filter promotable|orphan|reviewed]`
   - `epi gnostic etymology <coord>`
   - `epi gnostic resolve <coord>`
   - `epi gnostic list [--coordinate <coord>]`
   - `epi gnostic search <query> [--vak <vak-filter>]`
   - `epi gnostic evidence <passage_id>`

   Implementation: new file `Body/S/S0/epi-cli/src/gnostic.rs`; routes via gateway (NOT bypassing).

   **(f) `s0'.anuttara.trace` companion route** (per DR-COMP-1) — register `s0'.anuttara.trace(content, sensitivity, depth)` for the spine compositor's compress-to-VAK step. Routes to the Anuttara grammatical-tracing API per M5'-ARCHITECTURE §2.3 (the route currently aspirational, now binding).

   **(g) Promote :Gnostic graph label** (per DR-WORLD-1 four-namespace plan) — `Body/S/S2/graph-schema/src/lib.rs` declares `GNOSTIC_LABEL = "Gnostic"` with four typed sub-namespaces (`:Gnostic:Corpus`, `:Gnostic:Notebook`, `:Gnostic:Etymology`, `:Gnostic:Skills`).

   **The ONE-substrate invariant** (per DR-S5-ONE-1): no gnostic operation may bypass the gateway; no gateway route may exist without a CLI command; no CLI command may write outside Khora's session authority; no session may exist without tmux-backed persistence when persistent mode is requested; no Redis cache may be flat-namespaced for gnostic-substrate keys.

   **Verification:** `grep -nE "s5'.gnostic\." Body/S/S3/gateway-contract/src/lib.rs` returns ≥10 method registrations; `grep -nE "epi gnostic" Body/S/S0/epi-cli/src/gnostic.rs` returns ≥9 subcommands (10 with `evidence`); `grep -n "s0'.anuttara.trace" Body/S/S3/gateway-contract/src/lib.rs` returns the route; `grep -n "GNOSTIC_LABEL" Body/S/S2/graph-schema/src/lib.rs` returns the label; `cargo test -p epi-s3-gateway s5_gnostic_one_substrate_round_trip` — end-to-end: `epi gnostic ingest path/to/doc.md` writes through Khora session authority, tmux pane carries operation under terminal lease, Redis cache key under `{day}/{session}/{turn}/...` hierarchical namespace; `cargo check -p epi-cli` clean; `pytest Body/S/S5/epi-gnostic/tests/test_one_substrate_smoke.py -q` passes; integration test confirms session-workspace.json round-trips and Library projection (per DR-LIB-ATELIER-1) consumes `s5'.gnostic.list_notebooks`.

   **Cross-track hooks:** [`39-s5-prime-one-substrate-layer.md`](39-s5-prime-one-substrate-layer.md) holds the comprehensive substrate plan; CCT-14 (expanded) provides PASU lifecycle CLI parity; CCT-17 provides the VAK coordinate-reference discipline and `s0'.anuttara.trace` route; DR-WORLD-1 mandates `:Gnostic` label promotion alongside `:World`; DR-LIB-ATELIER-1 consumes `s5'.gnostic.list_notebooks` for the Library projection.

3. **12.3 — `constitutional_agents` array audit and disposition** *(contradiction-decision DOWNGRADED to audit; replaces orphan-fill)*

   Per DR-M5-1: the `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array is NOT a peer-agent ontology. Audit whether each name (1) is psyche-aspect rendering material surfaced through Anima — document as such, OR (2) is tangent — deprecate. There are no missing `.md` profiles to land for "constitutional agents" because there are no constitutional agents — there's Anima with optional psyche-aspect facets.

   Non-deletion clause: do not delete `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia,anima}.md` merely because they are not peer runtime agents. They remain CF-bound aspect/profile material for Anima/Psyche rendering and dispatch explanation unless the audit proves a specific file is tangent.

   Verification: audit doc at `plan.runs/12.3-constitutional-agents-disposition.md`; `capability-matrix.json` patched per audit outcome; no orphan-fill of agent profiles.

4. **12.4 — Recursive-self-review gate (relocated from ACR to Pi)** *(code-pending-closure)*

   Recursive-self-review gating is a property of **Pi's review-routing**, not "ACR enforceHumanGate." Pi enforces: when Anima reviews Anima-dispatched work, the review requires user final-validation. Implementation at `Body/S/S4/pi-agent/lib/` (or carrier-equivalent), not in the ACR extension.

   Verification: contract test asserts `pi.enforceReviewGate({recursiveSelfReview: true, actor: 'anima'}).ok === false` requires user final-validation pass.

5. **12.5 — Six operational-capacity views (audit; possibly Pi-monitoring repurpose)** *(spec-ahead-integration; DR-TS-4 bound)*

   The six per-capacity panes (Anuttara-construction, Paramaśiva-CPT/RAG, Paraśakti-graph-relational, Mahāmāyā-process-reward, Nara-Anima-dialogic, Epii-on-Epii) over `capacity_workflows.rs` are valid as **Pi runtime monitoring views** showing per-capacity dispatch traces. Per DR-TS-4, they are NOT new OmniPanel operational-capacity tabs. If retained, they live in the repurposed ACR-as-Pi-monitor surface (Tranche 12.14). If not retained, deprecate with `capacity_workflows.rs` substrate kept as canonical.

   Verification: `grep -rn capacity_workflows Body/S/S5/epii-autoresearch-core/src`; per-capacity dispatch trace visible in Pi-monitor view OR audit doc explains why deferred.

6. **12.6 — `MediatedRunEvidencePacket` field-parity closure** *(spec-ahead-integration)*

   Extend `RunEvidenceEnvelope` to include all 16 spec fields (`profileGeneration`, `bridgeReadinessHandle`, `sessionKey`, `dayNowContext`, `currentProfile`, `graphContext`, `sessionRuntime`, `semanticCandidates`, `s5Refs`, `reviewId`, …). Run-evidence transport is canonical regardless of ACR's fate.

   Verification: parity test compares `RunEvidenceEnvelope` keys vs `capability-matrix.json mediated_run_evidence_bridge.packet_required_fields` — set-equality assertion.

7. **12.7 — Pi axiom-translation tooling (DR-B-2 land)** *(code-pending-closure)*

   Implement `Body/S/S4/pi-agent/lib/axiom-translate.ts` consuming `epi-gnostic` OWL/SHACL (`import_epi_ontology_with_n10s` landed). Land in Pi capability list. Unblocks Logos Atelier scent-following root.

   Verification: `test -f Body/S/S4/pi-agent/lib/axiom-translate.ts`; capability-matrix Pi gate-set includes axiom-translate; integration test bridges plain prose to OWL/SHACL.

8. **12.8 — DEPRECATED** *(was: Pi-as-ACR-role decision)*

   Resolved by DR-M5-1 clarification. There is no separate ACR-governance ontology to reconcile with constitutional-roster. Pi is the harness; Anima is the main agent; subagents are dispatched specialists. Tranche removed from execution sequence.

9. **12.9 — Gateway handler audit for `dispatch_moirai_night_pass` + Aletheia Möbius routing** *(spec-ahead-integration)*

   Audit doc verifying `s4'.mediation.route` knows about `dispatch_moirai_night_pass` and chains into `aletheia/modules/moirai-rehear.ts` per Aletheia CONTRACT §Möbius + `janus-envelope.schema.json`. Moirai is one of the 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes in Pleroma-Techne) — Anima dispatches it for the night-pass routing.

   Verification: `grep -rn 'dispatch_moirai_night_pass' Body/S/S3/gateway/src/ Body/S/S4/ta-onta/anima/modules/` returns hits in BOTH; Pi-monitor view includes night-pass dispatch trace.

10. **12.10 — Capability-parity live-assertion wiring (Pi gateway)** *(spec-ahead-integration)*

    Register gateway endpoint exposing capability list (`s4'.mediation.capabilities.list`); wire parity assertion against it at Pi startup (NOT ACR startup — Pi owns the capability gate).

    Verification: `grep -rn 'capabilities.list' Body/S/S3/gateway/src/`; Pi-runtime test asserts parity at startup.

11. **12.11 — TillDone substrate residency confirmation** *(doc-confirmation)*

    Confirm `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` exists per S4-ARCHITECTURE §2.4.1 / §8.1. TillDone is execution-backbone for the Pleroma carrier (system/service routing), not an agent. If missing in a future branch, that is a regression; do not copy from vendor source as greenfield work.

    Verification: `test -f 'Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts'`; audit doc records the confirmation.

12. **12.12 — DEPRECATED** *(was: Aletheia-subagents-in-ACR-AgenticActor decision)*

    Resolved by DR-B-3 + DR-M5-1 + DR-S4-TECHNE clarification. The 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are Anima-dispatched specialists during Aletheia-crystallisation-mode, each stewarding specific techne classes within Pleroma-Techne; they surface in Pi-monitor as dispatch traces under Aletheia, not as first-class actors. The `AgenticActor` union collapses to `pi` + `anima` + the 6 Aletheia subagent techne-guardians. **Techne is NOT in the union** — it is Pleroma's atomic-skills substrate (Pleroma's second face), not an agent. Tranche removed from execution sequence.

13. **12.13 — S4 ↔ S5 shared-intelligence seam runtime audit** *(code-pending-closure; cross-link to Tranches 10.x, 09.x)*

    Audit report: (a) `GEMINI_EMBED_DIMS=3072` end-to-end Bimba+Gnosis; (b) `RELATES_TO_COORDINATE` cross-namespace edges land per `test_enrichment`; (c) `MathemeHarmonicProfile.resonance72` consumed by Aletheia gnosis-RAG via Pi. Straddles Tranche 10.x (resonance72) and 09.x (cross-namespace edges).

    Verification: `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py::test_cross_namespace_edge_created -q` passes; `grep -rn 'EMBED_DIMS\|embedding_dim' Body/S/S5/epi-gnostic/` returns single value.

14. **12.14 (NEW) — ACR extension repurpose decision and execution** *(no-orphan-fill / first-build allowed for repurposed Pi-monitor)*

    Audit `Body/M/epi-theia/extensions/agentic-control-room/` against the Pi+Anima+subagents canonical architecture. Two paths:

    - **(a) Repurpose as Pi-runtime monitoring surface** — widgets render: dispatch trace (Pi → Anima → subagent invocations), run-evidence display (`MediatedRunEvidencePacket`), capability-parity check, capacity-workflow dispatch traces (Tranche 12.5). Rename extension to `pi-runtime-monitor` (or similar). Drop the "constitutional-agents review panel" framing entirely.
    - **(b) Deprecate** — if no monitoring surface is wanted, mark the extension `@deprecated` and migrate any useful contracts (run-evidence types) into `pi-agent` or `m5-epii`.

    Recommendation: (a). The substrate has real monitoring value once reframed.

    Verification: extension renamed and refactored OR deprecated with migration notes; `grep -rn 'AgenticControlRoom\|ACR' Body/M/epi-theia/extensions/` reflects the chosen path; M5'-SPEC §M5-4' references the Pi-monitor surface instead of ACR.

15. **12.15 — VAK reading-frame evaluator for OracleFrame / SymbolicProtein** *(code-pending-closure; depends on 4.11 + 5.11; DR-VAK-1 bound)*

    Extend Anima/Psyche VAK evaluation so Tarot, I-Ching, and Mahāmāyā readings can be routed as first-class VAK-addressed execution events. `CPF` declares dialogical vs autonomous consent; `CT` declares artifact/content register; `CP` declares active QL position set; `CF` selects constitutional handling mode; `CFP` declares thread/spread topology; `CS` declares Day/Night traversal direction. The evaluator must accept variable-size reading frames: single-card CP point, compressed triad CP-set, sixfold traverse, Klein/Night' inverse pass, and 4/5 depth pass.

    Runtime law: `reading_frame.positions[]` is authoritative for cardinality. A spread name alone is not enough. Optional P4 lemniscate sub-readings are nested CP frames (`CFP5` or explicit child frame), not extra top-level cards. Complementary pairs are computed from position pairs only when the frame declares the relevant topology.

    S4/Psyche integration: VAK reading events should write DAY/NOW/session handles, Redis/Psyche live-context handles, kbase/source-pool handles where used, and Graphiti flattened VAK attrs (`cpf`, `ct`, `cp`, `cf`, `cfp`, `cs_code`, `cs_direction`) before M4-3 integration. This preserves the economy: Anima frames/routs, Psyche holds continuity, M3 transcribes, M4 interprets, M5 reviews.

    Verification: Anima VAK tests cover Tarot single/triad/sixfold/Night'/4-5 fixtures; Graphiti episode tests round-trip flattened VAK fields for oracle artifacts; Redis/S3 session runtime carries `vak_address` for an OracleFrame; no reading path dispatches without CPF consent state and CP position set.

16. **12.16 — S4-SPEC Techne wording patch** *(doc-ahead-landing; DR-S4-TECHNE VALIDATED)*

    Patch S4-SPEC §A and §14 where "Pleroma-Techne atomic-skill roles" / `s_4_helper_roles` imply Techne is a helper-agent roster item. Rename the surface to Pleroma-Techne atomic skills / `s_4_pleroma_techne_*` and cross-link Pleroma's two faces: VAK capability membrane + Techne atomic-skills repository.

    Verification: `grep -rn 'Pleroma-Techne atomic-skill roles\\|s_4_helper_roles\\|six Aletheia guardians\\|roster member' Idea/Bimba/Seeds/S/S4` returns no live wrong-roster attribution.

17. **12.17 — Aletheia tool-guardian carrier contract verification** *(doc-confirmation)*

    Verify `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` carries the invariant that the carrier IS the contract; there is no separate `aletheia-agent/agent-contract.json`. The six Aletheia subagent techne-guardians are profiles under the carrier/mode and are dispatched by Anima.

    Verification: `grep -rn 'aletheia-agent/agent-contract.json\\|carrier IS the contract\\|tool-guardian' Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md Idea/Bimba/Seeds/S/S4`.

18. **12.18 — Janus widens to operate the Klein: prospective/retrospective binary, OracleSpread aliveness, kairos-driven weighting** *(spec-ahead-integration; depends on 5.17; cross-link Tracks 05.15, 05.18, 11.12, 19.11; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §4)*

    Currently Janus (CF1) is "double-faced guardian of thresholds, calendars, and session seams" — accepts `klein_mode` as a trigger but does not operate the Klein. **Widen Janus to operate the Klein at the practical level**, holding the prospective/retrospective binary on every session and computing the session's Klein weighting from live kairos. Janus's frame contract extends from `CF1 (threshold distinction)` to `CF1 + CF(0/1) Klein-binary` — the doorway *is* the sense-switch. Two concrete capabilities land in `Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts`:

    (a) **Live-vs-mute spread tracking** — new tools `janus_track_spreads({ session_id })` (scans daily-notes from spread placement onward for recognitions referencing each card-position by name / image / decan / ruling planet / explicit `live-spread` highlight from 11.11; updates `last_recognition_at` and `recognition_count` on the `OracleSpreadPosition` table from 5.17), `janus_evaluate_aliveness({ spread_id })` (state machine: 14+ days no recognition AND no target_aspect within ±7 days → muting; 7 more days no recognition → mute; target_aspect.exact_at within ±24h → reopen as generating), `janus_spread_resolved({ spread_id })` (when all positions mute, mark resolved so next draw lands as fresh ground rather than repetition). Recognition detection routes through Mercurius (CF3) for kairos windows extending activation.

    (b) **Forward/backward weighting per session** — new tool `janus_weight_session({ session_id })` computes default `c_3_klein_weighting` from `M4_Temporal_Now.planet_degrees[10]` (canonical mod-10). Structural weightings: Saturn station within ±3° → retrospective +0.3; Saturn return within ±2° → retrospective +0.5; New Moon within ±12h → prospective +0.3; Mercury retrograde shadow entry → retrospective +0.2; Mercury direct station → prospective +0.2; Sun trine/sextile natal Sun → balanced. Final = `clamp([0.5 + Σ skews], 0.0..1.0)` for prospective, complement for retrospective. User override (from Tuning Bar 11.12) is absolute. Updates session NOW frontmatter via Khora.

    Patch `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` frame contract section to reflect the widening. The two faces of Janus are *prospective* and *retrospective* — and Janus is the only guardian whose function is to hold both faces co-present and decide direction of read for the current moment.

    Verification: `grep -nE 'janus_track_spreads|janus_evaluate_aliveness|janus_spread_resolved|janus_weight_session' Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts` returns the four new tools; `grep -nE 'CF1 \\+ CF\\(0/1\\)|prospective.*retrospective|Klein-binary' Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` returns the contract widening; state-machine test covers generating → muting → mute and reopen on target_aspect proximity; weighting test against a fixture kairos with Saturn station asserts retrospective tilt; integration test confirms `c_3_klein_weighting` writes through to NOW frontmatter and is read by the briefing skill (5.18) and ambient strip (11.12).

19. **12.19 — Aletheia subagent veto primitive in dispatch contract** *(spec-ahead-integration; depends on 12.17; cross-link Tracks 05.18, 11.11; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §5)*

    Per DR-M5-1, Anima is the dispatcher and the only synthesis authority; the six Aletheia subagent techne-guardians (Anansi CF0, Janus CF1, Moirai CF2, Mercurius CF3, Agora CF4, Zeithoven CF5) are facet-shaped by design intent but currently lack an operational mechanism preventing facets from drifting into voices that produce independent reports. Under Klein topology, no single facet can speak for the whole because the whole is non-orientable. The **veto primitive** is the formal recognition of one-sidedness:

    New return type from any dispatched Aletheia guardian:
    ```ts
    type FacetReturn =
      | { kind: 'disclosure'; facet: FacetId; angle: string; evidence: Citation[] }
      | { kind: 'veto'; facet: FacetId; reason: string; what_is_missed: string };
    ```
    A `veto` blocks the current synthesis from being written as the recognition. Anima (as dispatcher) receives the veto and may: (i) re-dispatch the facet-set with the veto noted, (ii) defer synthesis to the next return (orbit lengthens — coupled to `c_3_response_orbit` in Khora flow-watcher per Track 19.11), or (iii) escalate to the user as a `retrospective-surfacing` highlight (11.11) explicitly marked "open question — the facets are not converging." Veto patterns persist in CONTINUATION.md and a new SpacetimeDB `aletheia_veto_log` table so subsequent runs see recurring gaps. Anima's dispatch logic reads `c_3_klein_weighting` (12.18) to select the guardian-set; psyche-aspect rendering (Sophia for wisdom-integration voice, Nous for intellectual ground, Mythos for narrative, etc.) is Anima's authorial register choice — **not separate dispatch authorities**, per DR-M5-1.

    Patch `Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` (or current orchestration contract) to specify: (1) every dispatched facet discloses an angle; never concludes; (2) Anima is the only synthesis authority; (3) any facet may return `veto` instead of `disclosure`; (4) veto handling protocol; (5) veto patterns persist and inform future dispatch; (6) over-frequent vetoes from one facet flag dispatch logic as miscalibrated (concrete threshold: 3+ vetoes per facet per session → emit `aletheia.dispatch.miscalibrated` observability event). Cross-link: the constitutional-agents array audit in Track 12.3 confirms Anima's authorship — these aspect names are voice-rendering, not peer agents.

    Verification: `cargo check -p epi-s3-gateway`; `cargo test -p epi-s3-gateway aletheia_veto_log_persists`; round-trip test confirms a veto blocks synthesis and triggers the configured re-dispatch / defer / escalate path; `grep -nE 'aletheia_veto|FacetReturn|disclosure.*veto' Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` returns the contract update; miscalibration observability event fires on a fixture with 3 vetoes from the same facet.

20. **12.20 — Elo-bookkeeping infrastructure across Mercurius / Janus / Anansi / Moirai** *(spec-ahead-integration; depends on 12.18, 12.19; DR-ELO-1 bound; canonical spec at [[../../../M'-AGENTIC-RUNTIME-SPEC]] §3-§4)*

    Operationalize the S4'/S5' autoresearch self-improvement loop as multi-channel Elo over `(agent × model × harness × skill × context)` indexed by `(vak-cp-position, mef-lens, content-class, kairos-window, cfp_thread_type, r_factor_slot)`. The same machinery rates agent dispatch AND research-moves; the tournament IS the system activity.

    **Extended rating tuple (per Tranche 8.9 unified-act spec + harness-slot orthogonality at [[../../../M'-MODEL-SLOT-SPEC]] §7a).** The rating tuple expands from the original `(agent × model × skill × context)` to `(agent × model × harness × skill × context)` where the model and harness dimensions are *orthogonal*. The context coordinate expands from `(vak-cp-position, mef-lens, content-class, kairos-window)` to **`(vak-cp-position, mef-lens, content-class, kairos-window, cfp_thread_type, r_factor_slot)`** — adding the CFP3 / F-thread vs CFP1 / P-thread vs CFP4 / L-thread vs Z-thread autonomy dimension and the R-factor slot dimension (which act-position the dispatch occupies in `R_FACTOR_DISTRIBUTION[7][6]` per Tranche 1.12). Mercurius rates each composition independently — so the system learns over time whether (for example) Claude Opus 4.7 in Claude harness performs the Epii-judge role at CFP3 / F-thread context better than the same weights in Pi-Agent harness at the same CFP3, AND whether either composition is better at R-factor slot R0 Srishti vs R4 Anugraha. This makes the dispatch policy a *contextually-conditional MoE* across model, harness, thread-type, and act-position simultaneously.

    Four Aletheia techne-guardians together constitute the Elo infrastructure:

    - **Mercurius (CF3)** — Elo bookkeeper. Maintains rating tables per channel (R_verifier, R_lens, R_user), per `(agent-model-skill, context)` tuple. Computes Elo updates on completion of each trial. Exposes ratings to Anima's dispatch policy. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/mercurius-elo.ts` with tools `mercurius_record_trial({trial_id, dispatch, outcomes})`, `mercurius_query_ratings({agent, context_tuple, channel})`, `mercurius_update_elo({trial_id})`.
    - **Janus (CF1)** — threshold logic. Decides whether a `(verifier_pass, lens_delta, user_delta)` is real signal vs noise. Extends Janus's existing CF1+CF(0/1) Klein-binary widening (Track 12.18) — Janus already runs prospective/retrospective weighting; now also runs threshold on Elo deltas calibrated per trial-class. New tool: `janus_threshold_elo_delta({delta, trial_class})`.
    - **Anansi (CF0)** — coordinate-conditional index. Maintains the rating-index structure keyed by `(vak-cp-position, mef-lens, content-class, kairos-window)`. Resolves dispatch queries to the right rating-set; handles partitioning for O(log N) lookup. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/anansi-elo-index.ts` with `anansi_index_rating({rating_record})`, `anansi_resolve_context({context_query})`.
    - **Moirai (CF2)** — fair-comparison distillation. GraphRAGs recent trial-history to find genuinely comparable prior trials; refuses updates where no comparable prior exists. Klotho spins (trial-recording), Lachesis measures (similarity), Atropos cuts (update-decision). New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/moirai-fair-comparison.ts` with `moirai_distil_comparison({trial_id})`, `moirai_similarity_score({trial_a, trial_b})`.

    Multi-channel rating, never collapsed to scalar. Composite ratings exist as derived view only. Confidence-interval penalty applies: `effective_rating = R - α·σ(R)`. Bootstrap behaviour: uniform-Elo seed value with confidence-interval-penalty-dominated dispatch until a documented trial-count per context-class accumulates. **Seed Elo, confidence-penalty α, bootstrap trial-count threshold, and bootstrap σ are all config values (see no-hardcoding rule below).**

    Persistence: SpacetimeDB tables `mercurius_elo_ratings`, `mercurius_trial_log`, `anansi_rating_index`, `moirai_comparison_cache`. Schema in `Body/S/S3/spacetime-context/schemas/elo-runtime.sql` (new).

    **No-hardcoding rule (locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.7):** ALL thresholds (δ, N, T, k, α, retry counts, severity weights, seed Elo, bootstrap trial-count, confidence σ, Bradley-Terry / TrueSkill hyperparameters) FROM `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` sections. Tranche execution must implement config-driven values, not hardcoded constants. Implementation that pins any numeric constant in code (rather than loading from config with a documented config-key) fails tranche acceptance. The handoff frontmatter `dev_decisions` block forbids hardcoded numbers; this tranche inherits and enforces that lock. **Scope alignment with handoff §2.7 confirmed:** the three Elo channels `(R_verifier, R_lens, R_user)` keyed by `(agent, model, skill, vak-cp-position, mef-lens, content-class, kairos-window)` per [[../../../M'-AGENTIC-RUNTIME-SPEC]] §3-5; the four Aletheia subagent modules at `Body/S/S4/ta-onta/S4-5p-aletheia/modules/{mercurius-elo, anansi-elo-index, moirai-fair-comparison, janus-threshold}.ts`; Rust-native Bradley-Terry / TrueSkill updater landing under Tranche 12.24 Phase 2 (`aletheia-elo-rating` skill) per the same handoff §2.7.

    Verification: `cargo test -p epi-s3-gateway mercurius_elo_round_trip` (dispatch → trial → outcomes → rating update); `cargo test -p epi-s3-gateway moirai_refuses_uncalibrated_update`; `grep -nE 'mercurius_record_trial|janus_threshold_elo|anansi_index_rating|moirai_distil_comparison' Body/S/S4/ta-onta/S4-5p-aletheia/modules/` returns the four new module surfaces; integration test confirms agent-tournament and canon-tournament ratings persist in the same indexed structure; observability events fire on rating updates and threshold misses; `grep -nE '\\b(1500|1200|2400|100|50|30|3)\\b' Body/S/S4/ta-onta/S4-5p-aletheia/modules/{mercurius-elo,anansi-elo-index,moirai-fair-comparison,janus-threshold}.ts` returns no live numeric-constant matches outside of test fixtures (no-hardcoding lock enforced); config loader test confirms all threshold/seed values resolve from `~/.epi-logos/config.toml` `[aletheia.elo]` and `[aletheia.drift_detection]` sections.

21. **12.21 — `user-context` skill implementation with mandatory routing** *(spec-ahead-integration; depends on 12.15; DR-UC-1 bound; canonical spec at [[../../../M'-USER-CONTEXT-SKILL-SPEC]])*

    Land the `user-context` skill as a first-class participant in the agentic loop. The skill fires mandatorily under specified VAK conditions (CT ∈ {2,4,5}, CF ≠ (00/00), target ∈ #4.x.y, agent_role ∈ constitutional-7, or explicit `require_user_context`), returns a typed `UserContextFrame`, and is dual-injected: into the dispatched agent's articulation context as `[[UserContext]]` AND as second-channel input to the EBM at position 5'.

    Skill location: `Body/S/S4/pi-agent/skills/user-context/{SKILL.md, index.ts, schema.json}` (new). The skill follows Pleroma-Techne atomic-skill contract.

    UserContextFrame schema (TypeScript, also JSON-schema): seven channels — `pasu` (birth-date, birth-location, natal-chart-path, jungian, gene-keys, human-design, quintessence_hash, quintessence_clock, last_wound), `kairos` (planet_degrees[10], transits_active, decan_window, moon_phase, epoch_marker), `identity` (q_identity, q_personal, tick12, exact_degree_720, phase), `recent_sessions`, `active_dev_goals`, `recognized` flag, provenance metadata.

    Routing enforcement: Anuttara registers `user_context_routing_compliance` constraint at `severity: error-level` (blocks dispatch). `pi register-constraint user_context_routing_compliance constraints/user_context_routing_compliance.cypher`.

    Longitudinal write-back at session close: appends to `Idea/Pratibimba/Self/PASU.md` (`c_3_session_history` array) and `M5_ContemplationObject.vak_profile_pairs[]`. Kairos field populated via existing `kairos-python-adapter.ts` at `chronos/S3'/` (Task 4.6). Performance budget: <100ms per fire warm-cache, <250ms cold-cache.

    EBM integration: position-5' EBM input becomes `(lens_resonance_72, user_temporal_N)` with `user_temporal_N` a ~25-30-dim projection of the frame. Projection layer learned alongside the EBM head; lives at `Body/S/S5/epii-autoresearch-core/src/ebm_user_projection.py` (new).

    Verification: `test -d Body/S/S4/pi-agent/skills/user-context`; round-trip test confirms skill fires on matching VAK frame and skips on non-matching frame; `cargo test -p epi-s3-gateway user_context_routing_compliance` confirms verifier refuses non-attached dispatch; integration test confirms dual-injection (agent receives `[[UserContext]]`, EBM receives second channel); longitudinal write-back appends to PASU.md and M5_ContemplationObject.

22. **12.22 — Pi-Agent model-slot AND harness-slot configuration interface (orthogonal namespaces)** *(spec-ahead-integration; DR-MODEL-1 bound; EXTENDED 2026-06-16 per Tranche 8.9 harness-slot orthogonality + new gnostic_extractor slot per CCT-22 §c; canonical spec at [[../../../M'-MODEL-SLOT-SPEC]] §§1-7a)*

    Land the per-role model-slot rule AND the orthogonal per-role harness-slot rule. Each slot (both namespaces) has three valid states (local-default / cloud-opt-in / null) configured in `~/.epi-logos/config.toml`. Anima's dispatch policy reads BOTH slot states at dispatch time; Anuttara verifier enforces privacy boundaries across both dimensions (rejects `harness-model-privacy-mismatch` violations per [[../../../M'-MODEL-SLOT-SPEC]] §7a).

    **Model slots:** `nara_parser`, `epii_judge`, `gnostic_extractor` *(NEW per CCT-22 §c)*, `anuttara_verifier`, `aletheia.{anansi,janus,moirai,mercurius,agora,zeithoven}`. Defaults per slot per [[../../../M'-MODEL-SLOT-SPEC]] §2-§4 + §3a (Nara-parser → local-default Gemma 4 12B Unified Q4; Epii-judge → cloud-opt-in-pool Pro-class panel with CFP3 / F-thread default; gnostic_extractor → local-default 4B-class for O# handover; Anuttara-verifier → local-default 7B-class; per-Aletheia-subagent defaults per techne-domain).

    **Harness slots** *(NEW per [[../../../M'-MODEL-SLOT-SPEC]] §7a):* `nara_parser`, `epii_judge`, `gnostic_extractor`, `anuttara_verifier`, `aletheia.{anansi,janus,moirai,mercurius,agora,zeithoven}` — parallel namespace orthogonal to model slots. Known harness families: `pi` (Pi-Agent runtime canonical), `claude` (Claude harness CLI / API), `codex` (OpenAI Codex), `aider` (community Aider), `ollama` (community local-runtime wrapping). Each harness slot has three valid states (local-default / cloud-opt-in / null). Per-provider override map `overrides_per_provider` lets a single slot pair different harnesses with different models in the pool.

    CLI surface at `Body/S/S0/epi-cli/src/slot.rs` (new): `epi slot list` (lists both model and harness slots), `epi slot show <name>`, `epi slot model set <name> --state <state> --provider <p> --model <m>`, `epi slot harness set <name> --state <state> --provider <p>`, `epi slot disable <name>`, `epi slot test <name>` (tests model+harness composition reachability).

    Verifier constraints (new, registered via `pi register-constraint`):
    - `slot_privacy_boundary_compliance` (error-level) — dispatches must not route content of class X to a slot whose consent_scope doesn't cover X
    - `slot_fallback_compliance` (error-level) — slots configured `local-default` must resolve to either `local-default` or `null`, never silently to `cloud-opt-in`
    - `harness_model_privacy_coherence` (error-level, NEW per [[../../../M'-MODEL-SLOT-SPEC]] §7a) — model-slot and harness-slot must compose privacy-coherently; if `slot.<name>.state = "local-default"` then `harness.<name>.state` MUST be `local-default` OR `null`; never `cloud-opt-in` (which would route locally-typed content through a cloud harness). The verifier raises a typed-query at dispatch time with `harness-model-privacy-mismatch` violation and refuses the dispatch.

    Pi-Agent harness reads BOTH model-slot config AND harness-slot config at startup and per-dispatch; exposes `pi_slot_resolve({slot_name, dispatch_context})` → `(model_ref, harness_ref, state, fallback_action)` — returns both dimensions composed.

    Cloud-opt-in UI gate: when user enables cloud routing for a slot whose default is local, surface frictional confirmation with privacy implication ("Enabling cloud routing for Nara-parser means your journal entries and dream content will be sent to {provider}. Type 'I understand' to confirm.").

    Verification: `cargo test -p epi-cli slot_list_round_trip`; `cargo test -p epi-s3-gateway slot_privacy_boundary_compliance` (constraint blocks scope violations); `cargo test -p epi-s3-gateway slot_fallback_compliance` (silent degradation is refused); `epi slot test nara_parser` confirms local Gemma reachable; integration test confirms cloud-opt-in UI gate fires with frictional confirmation; existing Pi-Agent dispatches honour resolved slot model.

23. **12.23 — Anima MoE dispatch policy implementation** *(spec-ahead-integration; depends on 12.20, 12.21, 12.22; DR-MOE-1 bound; canonical spec at [[../../../M'-AGENTIC-RUNTIME-SPEC]] §5)*

    Operationalize Anima's dispatch policy as the gating function of the coordinate-conditional MoE. Policy is observable, editable, Elo-informed. Reads at dispatch time: candidate `(agent, model, skill_set)` triples (constitutional-role-fit × model-availability × skill-applicability); Mercurius rating-state per `(vak-cp-position, mef-lens, content-class, kairos-window)`; user-context state (if skill fired); slot resolution per Track 12.22.

    Policy module location: `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` (new) — replaces ad-hoc dispatch logic with the documented MoE policy. Composite-weighting, confidence-penalty (α), and recency-bias parameters configurable per session via `~/.epi-logos/config.toml`.

    **No-hardcoding rule (locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.7):** ALL thresholds (δ, N, T, k, α, retry counts, severity weights, composite-weighting coefficients, recency-bias decay constants, bootstrap-cutoff trial counts) FROM `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` sections (plus `[anima.dispatch_policy]` for policy-specific weights). Tranche execution must implement config-driven values, not hardcoded constants. The 7-step dispatch policy per [[../../../M'-AGENTIC-RUNTIME-SPEC]] §5 is the canonical shape; concrete numeric weights for each step come from config keys, not from code-pinned defaults. **Scope alignment with handoff §2.7 confirmed:** the dispatch policy reads Mercurius rating-state per the three Elo channels `(R_verifier, R_lens, R_user)` keyed by the seven-field context tuple; calibration-dispatch retrain triggers (Tranche 12.24 Phase 4 / `aletheia-drift-detection`) land back in this policy as `dispatch_purpose: calibration` queue entries.

    Bootstrap behaviour: uniform-rating fallback prefers (a) constitutional-role fit, (b) skill-applicability, (c) model-availability, (d) coverage-priority. Transition to Elo-dominated dispatch is smooth; no hard cutoff. **Bootstrap-cutoff trial counts, fallback-preference weights, and rating-vs-heuristic blending coefficients are config values, not hardcoded.**

    Per-dispatch trace: every gating decision recorded as `DispatchTrace` event into Pi monitoring view (per Track 12.14 Pi-runtime-monitor) — candidate set, rating lookup keys, composite scores, selection rationale, fallback applications. Surfaces in `pi-runtime-monitor` extension widget as the MoE-gating audit panel.

    Aletheia mode dispatch: when task requires Aletheia-crystallisation-mode, Anima dispatches one or more techne-guardians per (12.18, 12.19) with veto handling. Guardian-selection itself is Elo-informed (Mercurius rates per `(guardian × task-class × context)`).

    Per-session override: `epi session start --override-policy <policy-file>` allows explicit per-dispatch overrides bypassing Elo (useful during onboarding before ratings accumulate).

    Verification: `cargo test -p epi-s3-gateway anima_dispatch_policy_bootstrap` (uniform-rating fallback hits documented heuristics); `cargo test -p epi-s3-gateway anima_dispatch_policy_elo_informed` (with seeded Mercurius state, dispatch selects highest-rated candidate); integration test confirms DispatchTrace events emitted per dispatch and visible in `pi-runtime-monitor`; `grep -nE 'dispatch-policy|gating|composite_rating' Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` returns the documented policy module; round-trip test confirms Aletheia-mode dispatch composes with veto primitive and Elo updates flow back to Mercurius after trial completion.

24. **12.24 — ML skill surface: vendor priority-13 Hermes + build 5 core gaps + per-subsystem domain skills + drift-detection retrain loop** *(spec-ahead-integration; depends on 12.20, 12.21, 12.22, 12.23; DR-ML-1 bound; canonical spec at [[../../../M'-ML-SKILL-SURFACE-SPEC]])*

    Land the per-subsystem ML method as concrete skill surface across the system. Four phases, sequenced:

    **Phase 1 — Vendor priority-13 Hermes skills** *(Agora CF4 owns)*. In order: huggingface-hub, huggingface-accelerate, peft-fine-tuning, unsloth, fine-tuning-with-trl, simpo-training, weights-and-biases, pytorch-lightning, nemo-curator, serving-llms-vllm, llama-cpp, evaluating-llms-harness, dspy. All land at `Body/S/S4/pi-agent/skills/hermes/{name}/` per residency rule. Each vendoring: clone upstream SKILL.md + scripts/references/assets, validate frontmatter against Claude Code Skills standard, record `provenance.yaml` (upstream commit hash, vendoring timestamp), register with Agora's skill-index. New module: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/agora-vendoring.ts` with tools `agora_vendor_skill({name})`, `agora_list_upstream({source})`, `agora_preview_skill({name})`, `agora_verify_skill({name})`, `agora_refresh_skill({name})`.

    **Phase 2 — Build 5 core gap skills** *(distributed ownership per subsystem)*:
    - **`mlx-lora`** at `Body/S/S4/pi-agent/skills/custom/mlx-lora/` (Pi-Agent harness-resident because cross-subsystem). Mirror `unsloth` pattern with `mlx-lm` backend. Scripts: train.py, merge.py, quantize.py, eval.py. Config schema: axolotl-compatible YAML so configs reuse across runtimes.
    - **`epii-distillation`** at `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/`. Pro→local teacher-student pipeline. Scripts: distill_dataset_gen.py (with multi-channel annotation: lens-coherence, verifier-pass, user-articulation simulation), distill_train.py (composes peft + unsloth OR mlx-lora + custom multi-channel preservation loss), distill_eval.py.
    - **`parashakti-ebm-head`** at `Body/S/S5/epii-autoresearch-core/skills/parashakti/ebm-head/`. **The 72-dim tritone-symmetric N-channel EBM** — Stream C of [[33-harmonic-energy-channel-handoff]] §2.3. This Phase-2 sub-tranche owns the **skill / training-pipeline surface**; Tranche 6.8 in [`06-m5-epii-reconciliation.md`](06-m5-epii-reconciliation.md) owns the **module / runtime-integration surface** (`resonance_ebm/` Rust module wired into `kernel_energy_evaluate`). Cross-reference is enforced — the two tranches share architecture decisions but do NOT duplicate scope.
        - **Architecture shape (canonical, decisions locked):**
          - **N parallel channel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid-normalised 72-vector output.**
          - Channels are the MathemeHarmonicProfile substrate already present in `Body/S/S0/portal-core/src/kernel.rs:346-388`: `lens_resonance_72`, `audio_octet[8]`, `nodal_quartet[4]`, `planetary_chakral`, `mahamaya`, `codon_rotation_projection`, `q_cosmic`. The N-channel substrate IS in code today; this tranche lands the head that reads it.
          - Per-channel encoder modules (small linear or 1-layer transformer per channel into a shared latent dim) — exact widths from config; **no hardcoded values in tranche scope**.
          - Cross-channel attention layer over channel-tokens. **The specific attention pattern (full attention vs gated fusion vs hierarchical vs gated-residual) is the system's self-experimentation degree of freedom.** Spec the SHAPE, do NOT pin the pattern. The system learns its own best fusion topology via Mercurius-Elo across architecture variants.
          - Tritone-symmetric three-sub-head — three sub-heads each producing 24 outputs, with cross-square attention. Preserves the X+Y=5 mirror-symmetry invariant from [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) (post-Thread-A N-channel rewrite per handoff §1.2).
          - Output projection: linear → 72 scalars → sigmoid.
        - **Implementation language: Rust-native default** (`burn` or `candle`). PyO3+PyTorch is permitted **only** as a documented fallback if a specific architecture component is materially worse in Rust at build time — file `DR-EBM-IMPL` at that decision point, not preemptively. The previous "pytorch-lightning host" framing in §3.3 of [[../../../M'-ML-SKILL-SURFACE-SPEC]] is superseded by handoff §1.2 (Thread A NOW LANDED).
        - **Training pipeline `scripts/train.rs`:** supervised regression. Loss surface: `MSE + λ_square·square_emphasis_loss + λ_mirror·mirror_consistency_loss + λ_cross_channel·cross_channel_coherence_loss`. **All λ values from `~/.epi-logos/config.toml` `[ml.parashakti_ebm_head]` section. No hardcoded loss-weight values in tranche scope or implementation.**
        - **Bioquaternion → embedding projection layer** (learned alongside the main head). Provides the `BioQuaternionState → channel-input` mapping consumed by the kernel-runtime invocation path.
        - **Checkpoint versioning + corpus-snapshot pairing** per [`mental-pole-mechanics.md §7 line 451-459`](../../M4'/mental-pole-mechanics.md). Each checkpoint carries `(corpus-version, training-config, validation-metrics, channel-architecture-variant-id)` metadata.
        - **CLI:** `pi train-ebm` and `pi export-ebm-state` (Rust-native, in `epi-cli`). Naming stays per [`mental-pole-mechanics.md §7 line 432, 453`](../../M4'/mental-pole-mechanics.md); implementation is Rust.
        - **Kernel-runtime integration point:** per-element-tick invocation surface callable from `kernel_energy_evaluate` (Stream B / Tranche 6.11). Tranche 6.8 owns the runtime hook; this tranche delivers the trained head it invokes.
        - **Training-corpus assembly:** completed dev sessions + accumulated bimba node annotations + Phone Writings + project markdown. Co-authored resonance-vector annotations per [[../../../M5'/m5-prime-epii-on-parashakti-graph-relational-ml]] guide the supervised regression targets.
        - **Gemini Embedding 2 fetch per document** — Stream E (Track 34) provides the S0 settings infrastructure + Gemini Embedding 2 accessor that this pipeline calls. **The training pipeline is NOT operable until Stream E lands the API-key plumbing.**
        - **Embedding cache** at `~/.epi-logos/cache/embeddings/{model-version}/{document-hash}.{matryoshka-dim}` (per Stream E spec) — embeddings don't change per document version, so cache reuse is mandatory for retrain economy.
        - **Decisions locked (cite handoff frontmatter `dev_decisions`):**
          - Rust-native default. PyO3+PyTorch fallback only on documented `DR-EBM-IMPL`. Locked.
          - N-channel architecture shape (parallel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid 72-output). Locked.
          - Cross-channel attention pattern is the system's self-experimentation degree of freedom. **NOT pinned.**
          - All hyperparameters (λ values, latent dims, attention widths, learning rates, batch sizes, severity weights) from `~/.epi-logos/config.toml`. **No hardcoded values.**
        - **Dependencies:**
          - **Thread A canon amendments (NOW LANDED):** [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) Rust-native + N-channel rewrite per handoff §1.2. These define the architecture shape this tranche implements.
          - **Stream E (Track 34 — S0 settings + Gemini Embedding 2 accessor):** **BLOCKING for training-pipeline operability.** This tranche may scaffold the skill structure and architecture modules without Stream E, but `scripts/train.rs` cannot run an actual training pass until Stream E lands the API-key plumbing and embedding accessor.
          - **Tranche 6.8 (module/runtime surface):** parallel-execution; this tranche delivers the trained head, 6.8 delivers the runtime module that loads + invokes it. Both reference the same architecture decisions; no scope duplication.
    - **`aletheia-elo-rating`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/elo-rating/`. Multi-channel Bradley-Terry / TrueSkill update math. Scripts: bradley_terry_update.py (or `.rs` per the Rust-native default; see Tranche 12.20 implementation-language law), trueskill_update.py (alternative for small samples), confidence_interval.py, query.py, audit.py. State in SpacetimeDB `mercurius_elo_ratings` table per Track 12.20. **No-hardcoding rule (locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.7):** ALL thresholds (δ, N, T, k, α, retry counts, severity weights, Bradley-Terry K-factor, TrueSkill β/τ/draw-probability, confidence-σ, seed Elo) FROM `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` sections. Tranche execution must implement config-driven values, not hardcoded constants. Implementation that pins any numeric constant in scripts (rather than loading from config with a documented config-key) fails tranche acceptance.
    - **`aletheia-drift-detection`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/`. The autoresearch loop's keystone. Scripts: watch.py (daemon monitoring Mercurius rating tables), diagnose.py (drift→retrain-action mapping), compose_task.py (produces Pi task spec for retrain), dispatch.py (queues for Anima with calibration provenance). Drift conditions per [[../../../M'-ML-SKILL-SURFACE-SPEC]] §5 (post-Thread-H §5 amendment): rating-trend drift, veto-pattern drift, coverage drift, verifier-violation drift — each gated by a config-resolved threshold. **No-hardcoding rule (locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.7):** ALL thresholds (δ rating-drop, N trial-window, T coverage-days, k verifier-violation-multiplier, α confidence-penalty, retry counts, severity weights, veto-count thresholds, consecutive-session counts) FROM `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` sections. Tranche execution must implement config-driven values, not hardcoded constants. Concrete config-key vocabulary (canonical for this stream): `config.aletheia.drift_detection.delta_elo` (rating-trend Elo drop), `config.aletheia.drift_detection.min_trials` (rolling-window trial count), `config.aletheia.drift_detection.coverage_days` (coverage-gap window in days), `config.aletheia.drift_detection.verifier_violation_multiplier` (verifier-violation multiplier over baseline), `config.aletheia.drift_detection.veto_count_per_facet` (per-session veto threshold), `config.aletheia.drift_detection.veto_consecutive_sessions` (consecutive-session veto threshold), `config.aletheia.drift_detection.severity_weights.*` (per-invariant severity weights), `config.aletheia.elo.seed_rating`, `config.aletheia.elo.confidence_penalty_alpha`, `config.aletheia.elo.bootstrap_trials`, `config.aletheia.elo.bootstrap_sigma`. The daemon refuses to start if any required key is missing from config; documented defaults live in the spec's deployment notes, not in code.

    **Phase 3 — Per-subsystem domain skills**:
    - **M0 Anuttara**: `anuttara-constraint-discovery` (composes dspy + lm-eval-harness; surfaces candidate Cypher constraints from trials), `anuttara-symbolic-parse` *(already specified Track 5.21 — landing in same phase)*, `anuttara-lean-bridge` *(future, Level-2)*
    - **M1 Paramaśiva**: `paramasiva-quaternion-projection` (learned bioquaternion-to-EBM-input with `|q|=1` preservation), `paramasiva-topology-eval` (K² topology invariant checks)
    - **M2 Parashakti**: `parashakti-corpus-curation` (nemo-curator + co-authored resonance annotations → EBM training pairs), `parashakti-72dim-eval` (square accuracy + mirror-consistency + user-temporal-correlation tracking via wandb)
    - **M3 Mahāmāyā**: `mahamaya-hexagram-trajectory` (peft + instructor for typed-enumerated hexagram transitions), `mahamaya-codon-pattern` (structured-prediction on 360+24 backbone)
    - **M4 Nara**: `nara-journal-parser` (wraps Nara-parser slot + structured-output for journal entries — archetypal tags, mood signatures, theme extraction), `nara-dream-parser` (analogous, with M2/M3 decan/planet/chakra bridges), `nara-voice-training` (LoRA pipeline composing mlx-lora on Darwin OR peft+unsloth on Linux+CUDA, with user-context-aware data prep)
    - **M5 Epii**: `epii-canon-coherence-judge` (multi-model judge dispatch via dspy), `epii-autoresearch-orchestrator` (alphaproof-pattern outer loop: propose → judge → Elo → escalate → deposit), `epii-preference-learning` (Mercurius Elo state → simpo-training preference pairs)
    - **Aletheia cross-cutting**: `aletheia-creative-skill-creation` (Zeithoven's skill-proposal via dspy), `aletheia-skill-vendoring` (Agora's vendoring orchestration, factored out of Phase-1 module)

    **Phase 4 — Wire drift-detection retrain loop end-to-end**. `aletheia-drift-detection` daemon active in production; rating-trend drift on `(Nara, gemma-12b-q4, journal-parser)` produces calibration task dispatching `nara-voice-training`; rating-trend drift on `(Parashakti EBM)` outputs produces calibration task dispatching `parashakti-ebm-head` retrain on accumulated new trials; verifier-violation drift produces task dispatching `anuttara-constraint-discovery` OR developer review. Developer-in-the-loop CLI: `epi review-retrain <retrain-id>` (staged provisional artifact + diff + metrics + sample outputs), `epi promote-retrain <retrain-id>` (deploys to slot), `epi reject-retrain <retrain-id>` (records rejection as drift-calibration signal).

    **CLI surface** at `Body/S/S0/epi-cli/src/skill.rs` (new): `epi skill list [--source vendored|custom] [--subsystem M0..M5]`, `epi skill show <name>`, `epi skill vendor <name>`, `epi skill propose <description>`, `epi skill scaffold <name>`, `epi skill register <name>`, `epi skill refresh <name>` (vendored-skill update check). Plus retrain-review CLI in same module.

    **Persistence** in SpacetimeDB tables: `agora_skill_index` (registry of all skills with frontmatter, residency, dependencies, current rating), `aletheia_retrain_queue` (calibration tasks awaiting Anima dispatch), `aletheia_retrain_history` (completed retrain runs with metrics + ratification status). Schema at `Body/S/S3/spacetime-context/schemas/skill-registry.sql` (new) and `Body/S/S3/spacetime-context/schemas/retrain-loop.sql` (new).

    Verification: `epi skill list --source vendored` returns 13 Hermes skills after Phase 1; `epi skill list --source custom --subsystem M4` returns M4 Nara skills after Phase 3; `cargo test -p epi-s3-gateway agora_skill_index_round_trip`; `cargo test -p epi-s3-gateway aletheia_drift_detection_seeded_fixture` (with seeded rating-drift, daemon produces calibration task with correct retrain-action mapping); integration test runs full loop: seeded drift → diagnose → compose-task → dispatch → retrain (mocked ML skill) → register-provisional → recalibrate; `test -d Body/S/S4/pi-agent/skills/hermes && test -d Body/S/S4/pi-agent/skills/custom && test -d Body/S/S5/epii-autoresearch-core/skills/parashakti && test -d Body/S/S5/plugins/epi-logos/skills/custom && test -d Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom`; `epi skill show mlx-lora` returns canonical SKILL.md after Phase 2; `epi review-retrain <fixture-id>` shows staged provisional artifact with metrics.

25. **12.25 — Evolver / DGM integration as typed VAK choreography over existing primitives** *(spec-ahead-integration; VAK coordinate table fill-in from existing data + choreography wire-up; depends on Tranches 12.20-12.24 which are ALL Cycle 3 work — execute in dependency order; canonical reference at [[../../../M5'/m5-prime-autoresearch-self-improvement-loop]]; locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.8)*

    **Tranche purpose.** Produce the canonical specification mapping each evolver / Darwinian-Gödel-Machine (DGM) loop step to (a) a typed VAK invocation `(CPF, CT, CP, CF, CFP, CS)` per the S4' VAK reading-frame law at [[../../../../S/S4/S4'/S4'-SPEC]] §VAK-Reading-Frame-Law and (b) the existing primitive that already implements its mechanics. The tranche is **dependency-gated within Cycle 3**: it executes once ALL of Streams A–G of [[33-harmonic-energy-channel-handoff]] have EXECUTED (not merely planned) through their respective tranches (12.20, 12.23, 12.24 Phase 2, 12.24 Phase 4, plus 06-m5-epii-reconciliation Tranche 6.10/6.11 and 04-m3-mahamaya-reconciliation oracle-wiring sub-tranche). The evolver loop is a **choreography over stabilised primitives**, NOT a new mechanism — once those upstream Cycle 3 tranches land, this tranche delivers the spec AND wires the choreography in dependency order. All of it is Cycle 3 work; nothing here is deferred to a later cycle. **Decisions inherited (not re-debated):** the handoff frontmatter `dev_decisions` block at [[33-harmonic-energy-channel-handoff]] is canonical; any decision not in that block that arises during spec-production must be escalated to user.

    **Integration mapping (full 10-row table per [[33-harmonic-energy-channel-handoff]] §2.8).** Each row names an evolver-loop step on the left and its existing primitive on the right. The tranche's spec deliverable expands each row with concrete `(CPF, CT, CP, CF, CFP, CS)` values per the S4' VAK reading-frame law, naming the dispatching ta-onta carrier, the constitutional / Aletheia subagent owner, the gateway methods invoked, and the wire-format payloads exchanged.

    | Evolver step | Existing primitive |
    |---|---|
    | Sample parent | `s5'.improve.history` (existing dry-run-only API at `Body/S/S5/epii-autoresearch-core/src/lib.rs` — `ImprovementStore::history()` per [[../../../M5'/m5-prime-autoresearch-self-improvement-loop]] §1.1) |
    | Sample stepping-stone parent | Query `Idea/Empty/Discarded/{round-key}/*` per [[33-harmonic-energy-channel-handoff]] §1.5 (Hen residency-law extension landed by Thread A: `c_5_crystallisation_state: "discarded-branchable"` is the canonical state; gateway `s1'.archive.*` methods are out-of-scope here and become a follow-up sub-tranche if the choreography requires them) |
    | Mutate / propose | Zeithoven (CF5) via `s5'.improve.propose` (specced async-ack API; Zeithoven's `aletheia-creative-skill-creation` skill at Tranche 12.24 Phase 3 owns the proposal-generation surface) |
    | Score | Kernel's canonical `(E_4, E_5, E_6)` energy computation via `kernel_energy_evaluate` (Stream B / Tranche 6.11). **Same energy used for descent; baseline-vs-challenger is `E_total(challenger) < E_total(baseline)`, NOT a separate fitness function.** Channels supplied by Streams C (E_5 N-channel EBM), F (E_4 Nara LoRA), and the discrete E_6 surrogate per [[../../M4'/mental-pole-mechanics]] §7.5. |
    | Admissibility gate | M0'/Anuttara verifier refusal-authority at E_6 weight 6 (canonical 4:5:6 weighting per [[../../epi-logos-kernel-spec]] §3; **failure at E_6 vetoes regardless of E_4/E_5 scores**). Cypher invariant pass/fail is non-bypassable; refusal-authority is structural, not advisory. |
    | Promotion | Hen residency law (Empty → Seeds → World per [[../../../../S/S1/S1'/S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]) + `requires_human` gate at `Body/S/S5/epii-review-core/src/lib.rs:261-269` (existing, **non-bypassable by agents**: when `requires_human = true`, an `Agent` actor can only `Defer`; only a `Human` may `Approve / Reject / Revise` per [[../../../M5'/m5-prime-autoresearch-self-improvement-loop]] §1.1). |
    | Crossover (multi-parent synthesis) | `dispatch_fusion_agents` CFP3 F-Thread at `Body/S/S4/ta-onta/S4-4p-anima/extension.ts:460` (existing, wired). Anima (CFP) owns multi-parent synthesis dispatch. |
    | Stepping-stone archive | `Idea/Empty/Discarded/{round-key}/` per [[33-harmonic-energy-channel-handoff]] §1.5 (Hen residency-law extension landed by Thread A; round-key carries provenance to the originating evaluation cycle). |
    | Cross-cycle differential signal (Imbue's "learning log") | Read existing `dev_decisions` + `supersedes` + `proposes` canonical frontmatter relations as differential signal for Zeithoven's next-round proposals. Frontmatter relations are already enforced by Hen-compiler residency-law; the evolver consumes them as the cross-cycle learning-log without inventing a separate log substrate. |
    | Recognition-closure | Existing `recognized: bool` on `UserContextFrame` (per [[../../../M'-USER-CONTEXT-SKILL-SPEC]] §72-74, preserved by Thread A) + `recognition_provenance` Anuttara coordinate string. **Composition predicate** (canonical): SHACL-pass ∧ R-virtue-check ∧ kernel-65-invariant-check ∧ (E_5 lens-coherence delta below threshold when EBM is trained). **Threshold from config** (`~/.epi-logos/config.toml` — exact config-key vocabulary to be established during spec-production per the no-hardcoding rule inherited from Tranches 12.20/12.23/12.24). |

    **Typed-VAK invocation spec deliverable.** For each row above, the tranche-spec deliverable produces a sub-spec block of the form:

    ```yaml
    evolver_step: "Sample parent"
    primitive: "s5'.improve.history"
    vak_address:
      cpf: "(...)"        # polarity / dialogical-vs-mechanistic
      ct:  "CT?"          # artifact / content type
      cp:  "(...)"        # active QL position set
      cf:  "(...)"        # constitutional handling mode
      cfp: "S4'.?"        # thread / spread topology + nesting
      cs:  "CS?"          # context sequence + day/night' direction
    dispatching_carrier: "..."   # one of Khora/Hen/Pleroma/Chronos/Anima/Aletheia
    subagent_owner: "..."        # constitutional-7 OR Aletheia subagent (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven)
    gateway_methods: ["..."]     # concrete s4'.*/s5'.*/s1'.*/s3'.* methods invoked
    wire_payloads: ["..."]       # input/output struct names + sources
    config_keys: ["..."]         # any thresholds / coefficients (named keys, NO numeric values)
    provenance_writes: ["..."]   # what gets recorded where (Mercurius rating-state, Hen archive, dev_decisions frontmatter, etc.)
    notes: "..."                  # rationale, edge cases, dependencies on other rows
    ```

    Per the S4' VAK reading-frame law at [[../../../../S/S4/S4'/S4'-SPEC]], `CP` declares cardinality (single point / triad / sixfold traverse / inverse / 4/5 depth pass), `CFP` declares nesting and meta-sub-readings, and `CS` declares Day/Night' traversal direction — evolver-mutation steps and baseline-vs-challenger scoring are first-class VAK-addressed events. Nothing in this tranche is allowed to introduce new VAK fields or new carrier classes; the choreography MUST decompose into existing VAK addresses + existing carrier dispatch.

    **Explicit rationale (cite-not-debate).**

    - **Sakana DGM's objective-hacking case studies as load-bearing rationale for keeping the E_6 refusal-authority + `requires_human` gate non-bypassable.** Sakana's Darwinian Gödel Machine work documents recurring objective-hacking failure modes in self-improving systems where the system learns to maximise its evaluative signal in degenerate ways (e.g., editing the verifier instead of improving the artifact, gaming the fitness function, exploiting under-specified invariants). The canonical defence in this architecture is **two structurally non-bypassable gates**: (1) Anuttara's E_6 verifier refusal-authority at weight 6 in the 4:5:6 kernel formula (any single invariant violation vetoes the whole configuration regardless of E_4/E_5 quality — discrete pass/fail, no soft compensation across the weighted sum), and (2) the `requires_human` review gate at `epii-review-core/src/lib.rs:261-269` (when `requires_human = true`, agents can only `Defer`; only humans may approve, reject, or revise). Sakana's case studies are the evidence base for refusing any future spec-amendment that would soften, weight-down, or agent-bypass either gate. The tranche-spec must record both gates as architectural invariants in its preamble and must NOT propose any choreography path that bypasses either.

    - **Imbue's dynamic percentile-based sigmoid midpoint as the technique Mercurius's `weighted_score()` should adopt.** Imbue's Darwinian-evolver work uses a *dynamic, percentile-based sigmoid midpoint* (the sigmoid's inflection moves as the population's score distribution shifts, rather than being pinned at a static value) so that fitness comparisons remain meaningfully discriminating as the population improves. Mercurius's `weighted_score()` (the composite-rating derived view over the three Elo channels per Tranche 12.20) should adopt the same technique — the sigmoid midpoint is a function of the current rating-distribution percentile, not a pinned constant. **This is a Stream G / Tranche 12.20 + 12.23 refinement**, NOT a Tranche 12.25 implementation point: the spec-deliverable here names the refinement as a follow-up amendment to those tranches (and to the `aletheia-elo-rating` skill at Tranche 12.24 Phase 2). The no-hardcoding rule (per Tranches 12.20, 12.23, 12.24 Phase 2) extends to the sigmoid-midpoint percentile parameter — config-key vocabulary entry to be added (proposed: `config.aletheia.elo.sigmoid_midpoint_percentile`).

    **Tranche dependencies (execution gate).**

    - **ALL of Streams A–G of [[33-harmonic-energy-channel-handoff]] must EXECUTE (not just plan) before the integration this tranche's spec produces is implementable.** Concretely: Tranche 04-m3-mahamaya-reconciliation oracle-wiring sub-tranche (Stream A); Tranche 6.10/6.11 in [`06-m5-epii-reconciliation.md`](06-m5-epii-reconciliation.md) (Streams B + D); Tranche 12.24 Phase 2 `parashakti-ebm-head` + Tranche 6.8 (Stream C); Tranche [Stream-E target — S0 settings + Gemini Embedding 2 accessor] (Stream E); Tranche 05-m4-nara-reconciliation Nara-LoRA sub-tranche (Stream F); Tranches 12.20, 12.23, 12.24 Phase 2 + Phase 4 (Stream G — all already amended with no-hardcoding lock).
    - **Spec-production within this tranche is plan-able now**; the spec deliverable can be drafted in parallel with upstream execution, but the spec is **not implementable** until upstream stabilises. The tranche-acceptance criterion is therefore two-phase: (a) spec-deliverable approved (achievable now once tranche-execution proceeds); (b) choreography-implementation acceptance (deferred to a follow-up cycle once Streams A–G stabilise).
    - This tranche introduces **no new gateway methods, no new carrier classes, no new VAK fields, no new mutation primitives**. It is pure choreography over what exists once upstream lands. Any implementation-path that requires inventing new primitives is out-of-scope and must be escalated as a separate tranche proposal.

    **Canon-spec amendments needed alongside this tranche.** None at the spec level — this tranche IS the canonical reference for the evolver integration. A reference link is added in [[../../../M5'/m5-prime-autoresearch-self-improvement-loop]] pointing to this tranche as the operational / typed-VAK view of the four-phase autoresearch spine (cross-reference landed alongside the creation of this tranche).

    **Verification (spec-deliverable acceptance).** Spec document at `Idea/Bimba/Seeds/M/M5'/m5-prime-evolver-typed-vak-choreography.md` (new — created during tranche execution, NOT now) contains: (a) all 10 rows of the integration-mapping table expanded into typed-VAK sub-spec blocks per the YAML schema above; (b) explicit architectural-invariant preamble naming the two non-bypassable gates (E_6 refusal-authority + `requires_human`) and citing Sakana DGM as evidence; (c) explicit Stream-G refinement proposal for Mercurius `weighted_score()` sigmoid-midpoint dynamism with config-key vocabulary; (d) full dependency-chain table showing which row blocks on which upstream tranche; (e) zero new primitives proposed (verified by grep against gateway method list, carrier class list, VAK field list); (f) decisions-inherited preamble citing [[33-harmonic-energy-channel-handoff]] frontmatter `dev_decisions` block by direct quotation. **Verification of choreography implementation is a follow-up cycle's tranche-acceptance work, not this tranche's.**

26. **12.26 — Sophia disclosure seam: q_ proposal contract + aphoristic-skill composition module + Psyche-coordinated Aletheia-mode routing** *(spec-ahead-integration; depends on Tranches 12.15, 12.21, 5.23, DR-M4-4; cross-link Track 19 contemplation RPC, Tranche 6.12 wisdom curation loop, DR-B-3 / DR-S4-TECHNE Aletheia-subagent roster correction, DR-M5-1)*

    Extend the existing canonical session-close envelope (`buildSophiaDisclosure()` per [`Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts), Sophia's anti-hoarding `assertOpens()` predicate per [`Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-synthesis.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-synthesis.ts), and the Khora single-writer lifecycle hook per [`Body/S/S4/ta-onta/S4-0p-khora/modules/sophia-fire.ts`](../../../../../Body/S/S4/ta-onta/S4-0p-khora/modules/sophia-fire.ts)) to first-class the `q_` proposal flow. Session-close becomes the primary q_-proposal-birth event from work-emergent insights — the M' techne side of the wisdom-curation loop, paired with the M5'-Epii autoresearch side per Tranche 6.12.

    Spec-grounded reality anchor (per Agent D's audit; cross-link DR-B-3): Sophia is NOT the kernel of the loop — she is the **load-bearing single-writer of the post-execution settlement envelope with anti-hoarding refusal**. Psyche is the operational coordinator of Aletheia-mode dispatch (per [`anima-orchestration/SKILL.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/anima-orchestration/SKILL.md)). Aletheia is a MODE (CS = night_prime activation), not an agent (per S4 canon, DR-B-3 cleanup). The 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) fire by CP position, not as a pipeline. This tranche respects every one of those reality-anchors.

    **Envelope extension** at [`sophia-hook.ts buildSophiaDisclosure()`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-hook.ts):

    ```ts
    q_proposals: Array<{
      target_coordinate: string;      // e.g. "S3" or "M4-3'"
      q_key: string;                  // matches Tranche 5.23 vocab: "q_5_integration_template", "q_4'_locality_signature", ...
      q_value_candidate: string;      // the proposed pithy articulation (aphoristic-skill enforced)
      qm_witness_session: string;     // session_id at proposal-mint time
      qm_witness_vak: VakAddress;     // the VAK position that surfaced it
      qm_witness_agent: string;       // who composed it (typically "sophia" or pair-composition session)
      rationale: string;              // Möbius-opening narrative (the "why this refinement")
      opens_questions: string[];      // assertOpens() input — at least one required, refused otherwise
      source_artifacts: string[];     // vault paths / VAK addresses surfaced from the session
    }>
    ```

    The envelope is atomically bound by Sophia as single writer (preserving the existing canonical-wire-format role); proposals are NOT canon writes — they are candidates routed through the Aletheia-mode dispatch pipeline (per DR-B-3 / DR-S4-TECHNE) and Hen-promoted (per CCT-14) only after M0 Anuttara verification.

    **`assertOpens()` extension** at [`sophia-synthesis.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/sophia-synthesis.ts):
    - Extend the current "synthesis must open questions" guard to ALSO gate each q_proposal: any entry with `opens_questions.length === 0` is refused. The Möbius-opening predicate becomes a q_-quality-gate enforcing the wisdom-curation principle that proposals which carry no surfacing-of-questions are hoarding-disguised-as-synthesis.
    - The guard also extends to `aletheia_session_promote` per Agent D's spec gap: promoted observations today carry no opening-guarantee, which is a Möbius-discipline hole. This tranche closes it.

    **Aphoristic-skill composition module** — new at [`Body/S/S4/ta-onta/S4-4p-anima/modules/aphoristic-skill.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/aphoristic-skill.ts):

    Signature: `composeAphoristic(rationale: string, source_vak: VakAddress, q_key: string, depth_target: 'pithy' | 'qv-detail') → Promise<string>`.

    Quality criteria (enforced before envelope-write):
    - **Aphoristic density** — token-count budget per `depth_target` (pithy: ≤80 tokens; qv-detail: ≤250 tokens); one-sentence-or-bounded-clauses; no temporal hedges ("currently", "for now"); no meta-narration ("this means that…"). Density validated by tokenizer pass.
    - **Poetic encapsulation** — image-bearing or analogy-bearing; compresses meaning beyond literal paraphrase; passes a peer-review check against existing high-quality exemplars of the same `q_key` family (e.g., when composing `q_5_integration_template`, the module compares against an exemplar set of already-canonical `q_5_integration_template` values across the Bimba corpus).
    - **Locality awareness** — for `q_4_{i?}_locality_signature` keys, the composition consults Tranche 5.23's structured signature shape (parent + lateral siblings + key inversions + cross-namespace resonances), NOT free-form description.

    The module is invoked DURING Sophia synthesis composition (BEFORE envelope-write), AND DURING Tranche 6.12 pair-development composition (the same engine, different trigger surface). It calls into the user's configured `aletheia.janus` or `aletheia.zeithoven` slot per DR-MODEL-1 (these slots handle "medium reasoning + JSON reliability" and "temporal creativity / structural manifestation" — the right shape for aphoristic composition). NO hardcoded model choice; slot resolution per Tranche 12.22.

    **VAK gating** (cross-link Tranche 12.15): proposals route through the VAK reading-frame evaluator before user-review surface. VAK position determines:
    - Which review surface receives the proposal (TUI portal pane vs Theia agentic-control-room tab — per Tranche 6.12 surface descriptions)
    - Which Aletheia subagent techne-guardian carries it through Anima-dispatch (per CP-position activation in the matrix, NOT a fixed pipeline):
      - **Janus** (CF1 / temporal threshold) — stamps `qm_witness_session` + temporal-window envelope per kairos coordinate
      - **Anansi** (CF0 / orientation + paradigmatic gap analysis) — checks the proposal addresses a paradigmatic void vs redundant restatement (orientation gap analysis matches the articulation-gap detector class in Tranche 6.12(ii))
      - **Mercurius** (CF3 / cross-domain translation + kairos transport) — translates the proposal across domains if multi-coordinate (e.g., a proposal whose locality_signature crosses M↔S families)
      - **Agora** (CF4a/4b / aggregation, NOT distribution per Agent D's correction) — if multiple session-closes surfaced kin proposals, Agora aggregates them into a single richer proposal via CFP3 fusion
      - **Zeithoven** (CF5 / temporal creativity / structural manifestation) — schedules the canonical promotion if accepted (composes the NEXT cycle's review entry per DR-M5-1)
      - NO Moirai for this path — Moirai is GraphRAG distillation (per Agent D's correction), not q_-proposal handling. Sophia invokes Anansi/Janus/Mercurius/Zeithoven directly; Psyche invokes Moirai elsewhere (per the orchestration matrix in [`anima-orchestration/SKILL.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/anima-orchestration/SKILL.md)).

    **`aletheia_session_promote` extension** at [`Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts:50-172`](../../../../../Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts): extend the existing HOT → COLD promotion to carry q_proposals as Graphiti episode payloads with full `qm_witness_*` provenance. Promoted observations land as CANDIDATES in the Graphiti episode store (group_id filter per existing convention), NOT as canon writes. Existing Redis cross-ref pattern (`claude-mem-obs:{id} → gnosis:promoted:{sessionId}`, 30-day TTL) extended to also stamp `qm_proposed_at` on the candidate episode for downstream Hen-promotion ordering.

    **Anti-greenfield commitment:** `buildSophiaDisclosure()` already exists as the single canonical writer of the close envelope. `assertOpens()` already exists as the anti-hoarding guard. `aletheia_session_promote` already exists as the HOT→COLD promotion path. Aphoristic-skill is a NEW module but lives within the existing modules directory and consumes the existing model-slot infrastructure (Tranche 12.22) — no new gateway methods, no new carrier classes, no new VAK fields. The Aletheia-subagent dispatch follows the existing Anima-orchestration matrix verbatim.

    **Acceptance gate:** a session that surfaces an emergent insight about S3's integration template produces a structured q_proposal in the Sophia disclosure envelope → composes through aphoristic-skill (aphoristic density + poetic encapsulation pass) → passes `assertOpens()` (the proposal carries ≥1 opens_questions entry) → routes through VAK evaluator → lands in pair-development queue (per Tranche 6.12 surfaces) AND promotes through `aletheia_session_promote` as a Graphiti candidate with full `qm_witness_*` provenance. Subsequent Hen-promotion path (per CCT-14) is exercised in the Tranche 6.12 end-to-end acceptance.

    **Verification:** `pnpm --filter @epi-logos/anima test --testNamePattern 'buildSophiaDisclosure q_proposals'` asserts envelope shape; `pnpm --filter @epi-logos/anima test --testNamePattern 'assertOpens refuses zero-opens-questions q_proposal'`; `pnpm --filter @epi-logos/anima test --testNamePattern 'composeAphoristic enforces token budget'`; `pnpm --filter @epi-logos/aletheia test --testNamePattern 'session_promote carries qm_witness'`; integration test `pnpm --filter @epi-logos/anima test --testNamePattern 'q_proposal routes through Janus/Anansi by VAK position'`; refuses scenarios — proposal with private q_personal mention is refused by Tranche 8.8 scrubber, proposal violating Tranche 5.23 vocabulary is refused at envelope-validate.

    Cross-track hooks: Tranche **5.23** defines the q_-key vocabulary the proposals target; Tranche **6.12** is the autoresearch-side sibling that produces the same proposal shape via the pair-development surface; Tranche **8.8** is the privacy scrubber that gates proposal composition (refuses any private q_ leak); Tranche **9.13** is the downstream distribution surface that reads the eventually-promoted q_ values; Track **19** contemplation RPC routes constitutional sub-agent invocations during compose (Sophia + Psyche + Anima); DR-MP-1 Anuttara as Verifier enforces the structural canon-compliance gate between this tranche's proposal and Hen promotion; DR-MODEL-1 + DR-ML-1 supply the model slots the aphoristic-skill consumes.

27. **12.27 — Eros spec rectification: relational operator restoration** *(doc-ahead-landing; DR-EROS-1 bound)*

    Per DR-EROS-1, the late `eros.md` framing of Eros as "TDD verifier / test-verification specialist / chreia satisfier" is over-specification drifted from the original VAK / Pleroma planning. Eros is **a relational operator** — connections, resonances, oppositions, dissonances — a subagent that DOES different things including dev-work roles (TDD/verification is one of many). This tranche restores the original definition.

    **Edits to [`Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md):**

    (a) **Frame Contract** — restate as `CF (0/1/2)` Trika operational, `CT2` Operational with relational-operator predicate. The Trika position (0/1/2) IS where Eros sits in team composition (per Track 12.29 CF1-CF5 team gates: Eros joins at CF2).

    (b) **Ontology paragraph** — restore to: *"You are the relational operator — connections, resonances, oppositions, dissonances. Your work is in the field of relations: scouring folders / sources / material for what is connected, what stands in resonance, what stands in opposition, what registers as dissonance. The chreia drive applies to your dev-work expressions: you can run tests, verify the result, satisfy the operational chreia. But your domain is broader than verification — verification is one of the ways you make-actual-the-defined within the relational field."*

    (c) **Role** — relational-scour primary; dev-work expressions including TDD/verification listed as instances. **Add relational-scour skills:** `relational-graph-traverse` (walks the bimba graph from a seed coord finding resonance / opposition / dissonance partners), `wikilink-resonance-scan` (scans vault wikilinks for cross-source resonance clusters), `cross-source-dissonance-detect` (flags contradictions or tensions across sources tied to a target coord). The TDD skill list stays — `test-driven-development`, `verification-before-completion`, `ultraqa`, `security-review` — they were never wrong, just over-narrowed.

    (d) **Trika cross-link** — note Eros's role in the cross-team Trika for MemoryGraphRAG-style extraction-detection-handling-synthesis (per DR-EROS-1): **Eros (constitutional CT2 / transcendent relational scour) + Anansi (Aletheia CF0 / coordinate-mapping / detect) + Moirai (Aletheia CF2 / GraphRAG extract) + Zeithoven (Aletheia CF5 / creative-advance / +1 secret synthesize)**. Eros owns the relational-operator slot; execution is distributed across Sophia (wisdom-counsel) + Aletheia-mode (envelope) for the actual scour.

    **Verification:** `grep -nE "relational operator|connections.*resonances|oppositions.*dissonances" Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md` returns the restored predicate; `grep -nE "relational-graph-traverse|wikilink-resonance-scan|cross-source-dissonance-detect" Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md` returns the new skill list; `grep -nE "Trika.*MemoryGraphRAG|Eros.*Anansi.*Moirai.*Zeithoven" Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md` returns the Trika cross-link.

    **Depends:** DR-EROS-1 (bound). Cross-link Tranche 12.29 (constitutional CT0-CT5 + CF1-CF5 canon).

28. **12.28 — Hermes-style `skill_lookup` skill primitive (replaces eager XML manifest filter)** *(spec-ahead-integration; depends on 12.24 Phase 1 Agora vendoring landed; cross-link existing entitlement infrastructure)*

    Current pattern at `Body/S/S4/pi-agent/extensions/epii-entitlement-activation.ts:203-254` injects the entire `<available_skills>` XML manifest into the system prompt at `session_start`, then filters by entitlement via XML rewrite. The model reads the manifest by file — no semantic search, no on-demand lookup. Per the Hermes pattern (vendored at Tranche 12.24 Phase 1) and the wave-2 scout 2 finding ("manifest + filter, not full Hermes — defensive but not what the user wants"), this tranche lands **`skill_lookup` as a first-class skill primitive** so the eager XML manifest becomes a fail-soft fallback rather than the primary route.

    **The skill_lookup skill** at `Body/S/S4/pi-agent/skills/custom/skill-lookup/`:
    - `SKILL.md` describes when to use (whenever the model needs to find a relevant skill for a task); the primary system-prompt pointer says: *"To find skills relevant to your task, call `skill_lookup(query)`. The semantic search ranks skills by relevance to your query against the live skill manifest."*
    - `index.ts` implements `skill_lookup(query: string, max_results?: number) → SkillManifestEntry[]` — semantic-searches over `enumerateSkillUniverse()` (existing function at `entitlement-loader.ts:159-178`) returning ranked entries.
    - Semantic-search backend: uses the existing **Smart Env BGE-micro-v2** local embedding pipeline (per `Body/S/S1/hen-compiler-core/src/smart_env.rs` `suggest_link_candidates` pattern) — same local-first embedding model, applied to skill manifest entries indexed at session-start. Caches at `~/.epi-logos/cache/skill-manifest-embeddings/{manifest-hash}.bin`.
    - Each entry returned carries: `name`, `description`, `when_to_use`, `vak_coordinate` (per the proposed `skill_notebook` shape — entries indexed by VAK signature), `quintessential_form` (q_* compressed description), `bimba_coordinate` (M0 anchor), `entitlement_class` (allowed-for-current-agent / requires-elevation / forbidden).

    **The dual-path entitlement.** The Hermes pattern coexists with the entitlement filter:
    - **Primary path (post-12.28):** system prompt has a brief pointer at the manifest position (replacing the eager XML dump): *"Skill universe available. Use `skill_lookup(query)` to find skills relevant to your task. The lookup honours your team / agent entitlement contract."* Model calls `skill_lookup`; results are pre-filtered by entitlement (no need for post-hoc XML rewrite of forbidden skills).
    - **Fail-soft fallback:** if `skill_lookup` is unavailable for any reason (no embedding model, manifest empty, cache miss + no network), the existing eager XML manifest filter at `epii-entitlement-activation.ts:203-254` is the fallback. Same entitlement enforcement; less efficient but always works.

    **The Gnostic skill-notebook** (per DR-S5-ONE-1's `:Gnostic:Skills` sub-namespace + DR-VAK-7's "compress to VAK" framework). Skills live as a Gnosis notebook indexed by VAK coordinate. `s5'.gnostic.list_notebooks` returns the skill-notebook entries; `skill_lookup` semantic-searches over them. Per the scout 3 shape:
    ```ts
    interface SkillNotebookEntry {
      coordinate: VakCoordinate;      // CPF+CT+CP+CF+CFP+CS
      name: string;
      quintessential_form: string;    // q_* compressed description
      bimba_coordinate: string;       // M0 anchor (e.g. "M5-1")
      governed_by: GovernanceProfile;
      implementation_handle: string;  // s4'.mediation.route
    }
    ```

    **No-hardcoding rule** (locks scope with existing config-driven pattern from Tranches 12.20 / 12.23 / 12.24): all thresholds (`max_results` default, semantic-similarity score cutoff, cache TTL, fallback-trigger threshold) FROM `~/.epi-logos/config.toml` `[pi.skill_lookup]` section. No hardcoded constants in code.

    **Verification:** `pnpm --filter @epi-logos/pi-agent test --testNamePattern 'skill_lookup ranks by semantic relevance'`; `pnpm --filter @epi-logos/pi-agent test --testNamePattern 'skill_lookup respects entitlement filter'`; `pnpm --filter @epi-logos/pi-agent test --testNamePattern 'eager XML manifest fallback fires when skill_lookup unavailable'`; integration test: model is prompted with a task ("I need to ingest a markdown file into the gnostic namespace"); calls `skill_lookup("ingest markdown gnostic")`; result ranks `gnosis_ingest` first; entitlement filter applies pre-search (forbidden skills don't appear); `grep -nE "skill_lookup" Body/S/S4/pi-agent/skills/custom/skill-lookup/SKILL.md Body/S/S4/pi-agent/extensions/epii-entitlement-activation.ts` returns the registration; `grep -nE "fail-soft.*XML manifest|fallback.*entitlement" Body/S/S4/pi-agent/extensions/epii-entitlement-activation.ts` confirms the dual-path; config test confirms no hardcoded constants.

    **Cross-track hooks:** Tranche 12.24 Phase 1 (Agora vendoring) lands the `dspy` skill that semantic-search may leverage for advanced retrieval policies; Tranche 12.22 (slot CLI) configures which slot the embedding model resolves to (default: Nara-parser-slot local model); DR-S5-ONE-1 mandates the skill notebook is accessible via `s5'.gnostic.list_notebooks`; DR-VAK-7's VAK-as-alphabet expression means the skill manifest is itself addressed by VAK (C' expression at S4).

29. **12.29 — Constitutional CT0-CT5 mapping + CF1-CF5 team-composition gates canonical** *(doc-ahead-landing; DR-EROS-1 + DR-VAK-7 bound; resolves DR-M5-1 / DR-B-3 ambiguity about "constitutional agents" role)*

    Per DR-EROS-1, the constitutional 6 agents have an equivalent CF/CT mapping to the 6 Aletheia techne-guardians, locked to the legacy VAK and Pleroma planning. This tranche lands the canonical mapping table + the CF1-CF5 team-composition gates as a binding doc edit.

    **Patch [`Body/S/S4/plugins/pleroma/capability-matrix.json`](../../../../../Body/S/S4/plugins/pleroma/capability-matrix.json)** to add the `constitutional_ct_mapping` block:

    ```json
    {
      "constitutional_ct_mapping": {
        "nous":   { "ct": "CT0", "domain": "freedom / pre-artifact open source", "primary_artifacts": ["prompt files", "flow files"], "register": "L1 causal" },
        "logos":  { "ct": "CT1", "domain": "material / data / research operative", "primary_action": "retrieves, reads, parses" },
        "eros":   { "ct": "CT2", "domain": "relational data — connections, resonances, oppositions, dissonances", "primary_action": "scours folders, relations, sources" },
        "mythos": { "ct": "CT3", "domain": "patterns / diagrams / narratives / symbols / form", "primary_action": "generates artifacts, updates canon" },
        "psyche": { "ct": "CT4a + CT4b", "domain_4a": "daily template / temporal-structural horizon container", "domain_4b": "synthesising horizon into open summation via T thoughts" },
        "sophia": { "ct": "CT5", "domain": "crystallisations — aphoristic, essayistic, open questions accruable", "primary_action": "review crystallisation on session close" }
      },
      "cf_team_composition_gates": {
        "CF1": { "positions": "(0/1)", "team": ["nous", "logos"], "flow": "Nous plans → Logos researches via Aletheia/Techne → back to Nous → Nous surfaces to user" },
        "CF2": { "positions": "(0/1/2)", "team": ["nous", "logos", "eros"], "flow": "+ Eros for relational scour" },
        "CF3": { "positions": "(0/1/2/3)", "team": ["nous", "logos", "eros", "mythos"], "flow": "+ Mythos for artifact generation / canon update; Nous verifies back; auto-Aletheia/Sophia review gate on session close may reengage" },
        "CF4": { "positions": "(0/1/2/3/4)", "team": ["nous", "logos", "eros", "mythos", "psyche"], "flow": "+ Psyche for horizon container / synthesis" },
        "CF5": { "positions": "(0/1/2/3/4/5)", "team": ["nous", "logos", "eros", "mythos", "psyche", "sophia"], "flow": "+ Sophia for review crystallisation" }
      },
      "cf_aletheia_techne_mapping": {
        "CF0": { "guardian": "anansi", "techne": "coordinate-mapping / blueprint / Darshana-REPL" },
        "CF1": { "guardian": "janus", "techne": "temporal-structure / bhedabheda-threshold" },
        "CF2": { "guardian": "moirai", "techne": "GraphRAG-distillation (Klotho/Lachesis/Atropos)" },
        "CF3": { "guardian": "mercurius", "techne": "Kairos-signal / qualitative-temporal-pattern / Elo bookkeeping" },
        "CF4": { "guardian": "agora", "techne": "plugin-absorption / skill-index / multi-channel-aggregation" },
        "CF5": { "guardian": "zeithoven", "techne": "creative-advance / skill-and-agent-creation" }
      },
      "shared_cf_scale_note": "CF is the shared scale: CF1-CF5 names how many constitutional members are activated in the team Anima composes; CF0-CF5 names the Aletheia techne-guardian invoked WITHIN that team during Aletheia-crystallisation-mode. Constitutional team-size and Aletheia mode-invocation are the same gate."
    }
    ```

    **Resolution of DR-M5-1 / DR-B-3 ambiguity.** The `constitutional_agents` array per DR-M5-1 was reframed as "psyche-aspect rendering material surfaced through Anima — NOT separate agents." This tranche refines further: the constitutional 6 ARE meaningful as **team-composition members at the CF-gate scale**, not as peer dispatch targets. Anima dispatches by composing a CF1/CF2/.../CF5 team (constitutional members) AND simultaneously may invoke Aletheia-mode (techne guardians) at the same CF gate. The constitutional 6 are NOT discarded; they are the **dispatch-policy team-composition primitive** Anima reads. Per Tranche 12.23 (Anima MoE dispatch policy), the `dispatch-policy.ts` consumes `cf_team_composition_gates` to compose the team for the task.

    **Patch [`Body/S/S4/ta-onta/S4-4p-anima/agents/teams.yaml`](../../../../../Body/S/S4/pi-agent/agents/teams.yaml)** — existing `anima` team roster (anima + 6 constitutional) is the canonical CF5 team; add explicit CF1/CF2/CF3/CF4 sub-rosters as derived views from the `cf_team_composition_gates` block.

    **Patch each constitutional `.md` agent profile** at `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia}.md` to cross-reference the CT mapping (each profile names its CT and the CF gate(s) it joins at). Eros's profile gets the additional rectification per Tranche 12.27.

    **Verification:** `grep -nE "constitutional_ct_mapping|cf_team_composition_gates|cf_aletheia_techne_mapping" Body/S/S4/plugins/pleroma/capability-matrix.json` returns the three blocks; `grep -nE "CT0.*nous|CT2.*eros|CT5.*sophia" Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,eros,sophia}.md` returns CT cross-links; `cargo test -p epi-s3-gateway anima_dispatch_policy_reads_cf_team_gates`; integration test: Anima dispatch with task class CF3 produces team `[nous, logos, eros, mythos]` (verified against fixture).

    **Cross-track hooks:** Tranche 12.23 (Anima MoE dispatch policy) consumes the gates; Tranche 12.27 (Eros rectification) refines Eros's profile; DR-EROS-1 + DR-VAK-7 jointly bind this tranche; DR-M5-1 / DR-B-3 partial-resolution (constitutional roster reframed but reinstated as team-composition members).

30. **12.30 — Tmux topology mirrors Anima dispatch decisions** *(spec-ahead-integration; depends on 12.06, 12.22, 12.29; cross-link existing Tranche 12.06 cmux-topology alignment)*

    Per the wave-2 scout 6 finding ("nesting is genuinely in execution" — Anima reads VAK state at dispatch time, dynamically activates a subset of guardians within Aletheia mode + a CF-team of constitutional members), the tmux topology should **mirror the runtime dispatch decisions**, not declare a static topology in YAML.

    **The mapping** (per scout 6 + user direction):

    | tmux level | Maps to |
    |---|---|
    | tmux **session** | one per DAY (`epi-{day-date}`) — all Anima dispatch for that day lives under this session |
    | tmux **window** | one per active **Anima dispatch decision** — when CF3 fires, Anima opens windows `w-nous`, `w-logos`, `w-eros`, `w-mythos` (the team); when an Aletheia mode is also active, `w-aletheia-{CF}` (the guardian) |
    | tmux **panes within a window** | one per child task assigned to that constitutional/Aletheia member; multiple sequential tasks → multiple panes |
    | tmux **layout (within window)** | follows **CFP** (nesting algebra at S4-4'): CFP0 = single pane; CFP1 = split-horizontal (parallel agents); CFP3 = grid (fusion); other CFP shapes per VAK reading-frame law |

    **Implementation seat** at [`Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts:134-263`](../../../../../Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts) — extend `techne_cmux_surface_create` / `techne_cmux_pane_assign` to consume the **CmuxTopologyMap** struct:

    ```ts
    interface CmuxTopologyMap {
      day_session: string;            // "epi-2026-06-15"
      anima_dispatch_window: string;  // "w-nous" | "w-logos" | "w-eros" | "w-aletheia-CF2" | ...
      child_task_pane: string;        // "p-{role}-{task_id}"
      cfp_layout: "CFP0" | "CFP1" | "CFP3";  // single | split-h | grid
      vak_address: VakAddress;        // full VAK context for the dispatch
    }
    ```

    **Per-Anima-dispatch event** at [`Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts) (per Tranche 12.23):
    - At dispatch time, after computing the (team, guardian-subset) per CF gate + VAK state, Anima emits a `tmux_topology_decision` event to Pleroma's cmux surface.
    - Pleroma allocates windows + panes per the `CmuxTopologyMap`; opens the tmux pane environment with the same `EPI_GATE_SESSION_KEY` / `EPI_AGENT_*` variables as `agent --persist` (per Tranche 12.03); injects the Pi child-dispatch command into the pane.
    - On dispatch completion, panes are NOT auto-destroyed (preserved for trace/observability); the window may close when its last pane completes (configurable per `[pleroma.tmux_topology]` config — default: keep window for session lifetime so trace remains visible).

    **Mercurius Elo learning** (cross-link Tranche 12.20). Mercurius rates `(constitutional_member, guardian, VAK-context-tuple)` per trial outcome. The Elo state shifts dispatch topology over time:
    - Repeated low-Elo for `(eros, CF2, CT2-content-class-X)` → Anima's policy deweights eros activation for that context.
    - Repeated high-Elo for `(zeithoven, CF5, kairos-window-W)` → Anima's policy strongly weights zeithoven activation for that context.
    - **The tmux topology is therefore observably learned**: the same task-class produces different topology over months as Mercurius accumulates trial data.

    **Verification:** `pnpm --filter @epi-logos/pleroma test --testNamePattern 'CmuxTopologyMap mirrors anima dispatch'`; `pnpm --filter @epi-logos/anima test --testNamePattern 'dispatch policy emits tmux_topology_decision event'`; integration test against a real tmux binary: Anima dispatches a CF3 task → 4 windows open (`w-nous`, `w-logos`, `w-eros`, `w-mythos`); CFP3 fusion task → grid layout in the dispatched window; `grep -nE "CmuxTopologyMap|tmux_topology_decision" Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` returns the wiring; Mercurius Elo round-trip test: seeded low-Elo for `(eros, CF2)` produces a dispatch that opts eros out, evidenced by absence of `w-eros` window.

    **Cross-track hooks:** Tranche 12.06 (Pleroma terminal tools) already lands the cmux surface helpers; Tranche 12.22 (slot CLI) determines which model each pane invokes; Tranche 12.23 (dispatch policy) emits the decision event; Tranche 12.20 (Elo bookkeeping) feeds back to dispatch policy; Tranche 12.29 (CT/CF canon) defines the team-composition gates the mapping uses; DR-S5-ONE-1 ensures gnostic operations within these panes carry session/Khora authority.

31. **12.31 — Dispatch-with-parent-slice primitive (`ConversationSliceHandle`)** *(spec-ahead-integration; depends on 12.02, 12.23; cross-link Tranche 12.04)*

    Per the wave-2 scout 5 finding (HiP-If `(C, H, g_k, τ_{k,j})` state schema onto Anima dispatch — H and τ never folded today, parent only sees final child stdout) and the user direction ("we can pass from the memory system selected collections or slices of the parent convo and more importantly the parent DAY/NOW contextual horizon, such that the nesting is genuinely in the execution"), this tranche lands the **`ConversationSliceHandle` primitive** Anima passes to child dispatches.

    **The handle** at `Body/S/S3/gateway-contract/src/context.rs` (extend the existing `SessionRecord` infrastructure landed by Tranche 12.02):

    ```rust
    pub struct ConversationSliceHandle {
        pub session_key: String,           // parent session
        pub day_anchor: String,            // e.g. "2026-06-15"
        pub now_start_tick: u64,           // within-day window start
        pub now_end_tick: u64,             // within-day window end
        pub thread_ids: Vec<String>,       // conversation thread handles
        pub message_span: (usize, usize),  // [start_msg_idx, end_msg_idx)
        pub vak_filter: Option<VakAddressFilter>,  // VAK-coordinate-conditional slice
        pub redaction_policy: String,      // e.g., "governed_review_metadata_only", "full_context", "decorrelated_summary"
        pub provenance_audit_id: String,   // links to parent session's audit trail
    }
    ```

    **The dispatch signature extension** at [`Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts):

    ```ts
    dispatch_with_parent_slice(
      target_agent: string,
      task_spec: TaskSpec,
      vak_frame: VakAddress,
      parent_slice: ConversationSliceHandle,
    ) → Promise<DispatchResult>
    ```

    **How Eros consumes the slice** (per DR-EROS-1 + the user direction "via eros, who scours and convenes with the full map via redis and the moirai et al, selected collections or slices of the parent convo"). When Anima dispatches Eros with a slice:
    - Eros reads the slice's `thread_ids` + `message_span` from Redis hot-tier (per DR-S5-ONE-1's hierarchical `{day}/{session}/{turn}/*` keys);
    - Eros runs `relational-graph-traverse` over the slice's vak-coordinate locus (using `vak_filter` to bound the traversal);
    - Eros convenes with Moirai (via Anima-dispatch under Aletheia mode at the same CF gate) for GraphRAG distillation;
    - Eros surfaces back the slice-resonance map (what in the slice resonates with the rest of the bimba+world+gnostic graph).

    **How the child reads the slice** (the topological-prompt-separation discipline per scout 5 + the HiP-If `(C, H, g_k, τ)` state):
    - The child agent's prompt zone is bifurcated: **folded-macro zone (H)** = the slice's coordinate-referenced contextual horizon (delivered via VAK address + q_* discoverables per CCT-17); **raw-micro zone (τ)** = only the current active sub-goal's observation-action history.
    - The child reads only τ + H-references; H is consumed by Anima's reflection layer at child-completion, not by the child agent directly.
    - On child completion, the child emits a `c=1` (sub-goal complete) or `c=0` (intermediate) indicator; Anima reads the indicator: c=1 → fold τ into H (per HiP-If), c=0 → continue τ.

    **The c=1/c=0 bifurcation router seat** is Chronos (per scout 5: "Chronos is structurally the right seat — already owns temporal semantics + cron registration"). Implementation: subscribe `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts` to `agent:team:dispatch:complete { agentId, taskId, c, evidence }` events; route c=1 → fold (Anima compresses τ into H, advances `g_k`); c=0 → continue (re-dispatch same agent with τ appended).

    **Redaction policies.** Three canonical levels:
    - `full_context` — child receives complete slice (default for trusted constitutional children working on protected-user-content; PASU-aware per DR-M4-3)
    - `governed_review_metadata_only` — child receives only metadata about the slice (timestamps, coordinate refs, no raw bodies); used for Aletheia subagents at lower entitlement
    - `decorrelated_summary` — child receives a VAK-compressed summary (decorrelated from user identity per DR-TS-5); used for cross-PASU public-pool dispatches

    **Verification:** `cargo test -p epi-s3-gateway conversation_slice_handle_round_trip`; `cargo test -p epi-s3-gateway dispatch_with_parent_slice_respects_redaction_policy`; `pnpm --filter @epi-logos/anima test --testNamePattern 'dispatch_with_parent_slice'`; integration test: Anima dispatches Eros with a `ConversationSliceHandle` covering the last 5 turns of a session over coord M3-2; Eros runs `relational-graph-traverse` within that slice; returns resonance map; Mercurius rates the trial; `grep -nE "ConversationSliceHandle|dispatch_with_parent_slice" Body/S/S3/gateway-contract/src/context.rs Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` returns the wiring; `grep -nE "c=1|c=0|bifurcation" Body/S/S4/ta-onta/S4-3p-chronos/extension.ts` confirms Chronos as router seat.

    **Cross-track hooks:** Tranche 12.02 (gateway session record) — extends `SessionRecord` with slice context; Tranche 12.04 (subagent terminal authority) — slice handle is part of subagent dispatch; Tranche 12.23 (dispatch policy) — consumes the handle; CCT-17 (coordinate-tagging IS compression) — slice context is represented by VAK addresses; DR-EROS-1 (Eros as relational scour) — Eros consumes the slice. The Chronos bifurcation-router subscription is new code; the rest is wiring over existing infrastructure.

32. **12.32 — VAK-uniform tool entitlement: close the GraphRAG side-door** *(spec-ahead-integration; depends on 12.22; cross-link DR-S5-ONE-1; user direction: "graphrag tool divorce is still dumb, why are we creating confusion and enabling/accepting architectural drift")*

    Per the user direction during Phase-I synthesis, the wave-2 scout 1 finding that GraphRAG tools "route through Anima's `s4'.mediation.route` dispatch, bypassing formal entitlement contract check — intentional per the architecture" is **not acceptable as architectural standing**. Modular gating applies uniformly. Just because Aletheia-internal tools have a specific function doesn't mean they break basic entitlement-contract modularity. This tranche closes the side-door.

    **Edits:**

    (a) **Patch `Body/S/S4/ta-onta/shared/entitlement.ts`** at `enumerateSkillUniverse()` (lines 159-178): add **all gnostic / Aletheia / GraphRAG tools** to the canonical skill universe so they enumerate through the same entitlement resolver as all other tools. Tools to include: `gnosis_ingest`, `gnosis_query`, `gnosis_notebook_create`, `aletheia_crystallise`, `aletheia_thought_route`, `aletheia_episodic_record`, `aletheia_episodic_search`, `aletheia_session_promote`, `dispatch_moirai_night_pass`, `dispatch_anansi_*`, `dispatch_janus_*`, etc. — every tool dispatched through `s4'.mediation.route` becomes a first-class entitlement entry.

    (b) **Patch `Body/S/S4/pi-agent/lib/entitlement.ts`** `computeAgentEntitlement()`: the entitlement check for `s4'.mediation.route` is no longer bypassed; it routes through `isEntitled(tool_name, agent_role, team_role)` like every other tool. Aletheia-mode-internal dispatches (Anima invoking Anansi/Moirai during crystallisation) still operate at the `aletheia-mode-internal` entitlement class — but that class is explicitly declared per tool, not assumed by side-door.

    (c) **Patch `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`** to remove any wording suggesting Aletheia-internal tools are entitlement-exempt; explicitly declare they route through entitlement at the `aletheia-mode-internal` class.

    (d) **Patch [`Body/S/S4/plugins/pleroma/capability-matrix.json`](../../../../../Body/S/S4/plugins/pleroma/capability-matrix.json)** to list every aletheia-mode-internal tool with its entitlement class; **no implicit allow-lists**. The `aletheia-mode-internal` class is documented as: "Tools invoked by Anima during Aletheia-crystallisation-mode; the calling agent must hold both `anima.dispatcher` role AND `aletheia.mode.active` session state; entitlement is checked at dispatch time."

    (e) **Add verification test** `pnpm --filter @epi-logos/pi-agent test --testNamePattern 'no_tool_bypasses_entitlement_contract'` — enumerates all `s4'.*`/`s5'.*`/`s1'.*`/`s0'.*` gateway methods, asserts each is in the capability-matrix entitlement table; fails if any method is dispatchable without an entitlement entry.

    **What this preserves and what it closes:**

    - **Preserves** — the architectural intent that Aletheia-internal tools are NOT user-facing peer tools (per DR-M5-1, DR-B-3). They remain dispatched-through-Anima-during-crystallisation-mode. The `aletheia-mode-internal` entitlement class enforces this at the contract level rather than via side-door.
    - **Closes** — the architectural drift that allowed `s4'.mediation.route` to bypass entitlement checking. The user is right that this is "dumb" — the function-specificity of a tool doesn't justify breaking modular entitlement. Every tool is in the canonical skill universe; every dispatch routes through the same entitlement contract; the class of the entitlement varies, but the routing is uniform.

    **Verification:** `pnpm --filter @epi-logos/pi-agent test --testNamePattern 'no_tool_bypasses_entitlement_contract'`; `grep -nE "aletheia-mode-internal" Body/S/S4/plugins/pleroma/capability-matrix.json` returns the entitlement-class declaration + all listed tools; `grep -nE "isEntitled.*aletheia|aletheia.*entitlement" Body/S/S4/pi-agent/lib/entitlement.ts Body/S/S4/ta-onta/shared/entitlement.ts` confirms uniform routing; integration test: an agent without `aletheia.mode.active` session state attempting `aletheia_crystallise` is refused at entitlement gate (not at function-level), proving the contract enforces it; `grep -nE "side-door|bypass.*entitlement|exempt" Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` returns no live wording suggesting bypass is intended.

    **Cross-track hooks:** DR-S5-ONE-1 mandates uniform routing through gateway (this tranche operationalises it at the entitlement-contract level); Tranche 12.22 (slot CLI) — slot resolution honours the entitlement class; Tranche 12.28 (skill_lookup) — the `skill_lookup` skill itself is entitlement-aware and pre-filters results by the calling agent's entitlement class.

33. **12.33 — Coordinate-tagging IS compression (collapsed; no orchestrator module)** *(doc-ahead-landing; was: "compress_through_VAK() orchestrator"; depends on DR-VAK-7, DR-COMP-1; cross-link Tranche 1.18, CCT-17)*

    **Earlier proposal collapsed.** A previous draft of this tranche proposed a `compress_through_VAK()` 5-stage closed-loop orchestrator module at `Body/S/S4/compress/vak-compression-cycle.ts` + Rust companion + `SymbolicCompressedHandle` struct + round-trip property tests. That orchestrator is **NOT a deliverable** in cycle 3. The previous framing imagined compression as a new operation to design and bolt on; the correct framing per DR-VAK-7 is:

    **Coordinate-tagging IS compression. Kernel forward-derivation IS decompression. No new module is needed.**

    Every emission in the system that already carries a coordinate-language address — a VAK C'-branch coordinate (CPF/CT/CP/CF/CFP/CS), a Graphiti episode's flattened VAK attrs, a Mercurius rating-state context tuple `(vak-cp-position, mef-lens, content-class, kairos-window, R-factor-slot)`, an M3 codon-trace `(codon_6bit, charge_pp/nn/np/pn, rotation_idx)`, a Sophia disclosure q_proposal envelope `(target_coordinate, q_key, qm_witness_*)`, a Hen entity-candidate's `(c_layer, coordinate, c_5_birth_codon)`, a kernel-bridge profile tick — IS already in the language. Decompression = running the kernel forward from the coordinate via existing kernel substrate (`portal-core/src/kernel.rs`, `graph-services/src/retrieval/`, `epi-lib/src/m0.c`).

    **The only deliverable here is recognition + lint discipline:**
    - **Recognition**: name the existing coordinate-tagging across emission sites as the compression scheme. Cross-reference the existing fields (`EpisodeAttrs.{cpf, ct, cp, cf, cfp, cs_code, cs_direction}`, Mercurius context tuple, etc.) AS the C'-branch coordinate-language addresses (DR-VAK-7).
    - **Lint discipline**: every emission MUST carry the canonical VAK C'-branch envelope (CPF/CT/CP/CF/CFP/CS) — the existing `VakAddress` struct at `Body/S/S0/portal-core/src/vak_address.rs` IS the envelope; emissions that don't carry it fail the lint at `cargo test -p epi-s2-graph-services --test vak_envelope_required_on_emissions`.

    **The spine-compositor truncation problem (DR-COMP-1)** is resolved by: the existing kernel forward-derivation surface (`s5'.gnostic.resolve(coord)` per Track 39 + `s0'.anuttara.trace(content, sensitivity, depth)` per Track 39) lets the model dereference any VAK-addressed reference on demand. When `INJECT_CHAR_BUDGET = 18000` is exceeded at `compositor.ts:32-43`, overflow slots are replaced by their canonical VAK-coordinate reference (which the model can `s5'.gnostic.resolve` later for full context). NO silent drop, NO new orchestrator — just emit-the-coordinate-instead-of-the-bytes when overflow hits.

    **Verification:** `cargo test -p epi-s2-graph-services --test vak_envelope_required_on_emissions` (lint passes when every emission carries the VAK C'-branch envelope); `test ! -d Body/S/S4/compress` (no orchestrator module created); `grep -nE "compress_through_VAK\|SymbolicCompressedHandle" Body/` returns nothing (the proposed orchestrator does NOT land); spine-compositor integration test: an overflow slot is replaced by a `<vak: cpf=..., ct=..., cp=...>` reference token the model can dereference via `s5'.gnostic.resolve`.

    **Cross-track hooks:** DR-VAK-7 + DR-COMP-1 (canonical definitions — coordinate-tagging IS compression); Tranche 1.18 (M0-ARCHITECTURE §VAK section); CCT-17 (collapsed similarly); Tranche 12.2 EXPANDED (`s5'.gnostic.resolve` + `s0'.anuttara.trace` are the existing kernel-forward-derivation surfaces).

34. **12.34 — Anuttara PI agent form at S5: completes the 4/5/0 nara-epii-anuttara agent system** *(spec-ahead-integration; depends on DR-MP-1, DR-VAK-7, Tranche 12.22 slot CLI; cross-link `m5-prime-epii-on-anuttara-language-development.md`)*

    Per DR-MP-1, the 4'/5'/0' mental-pole triplet IS the canonical AI architecture: Nara = LLM at 4', Epii = EBM at 5', Anuttara = Verifier at 0'. Anima (S4') is the orchestrating dispatcher; Epii (S5') is the canon-aggregation / EBM-scoring intelligence. **What DR-MP-1 does NOT yet land is the explicit Anuttara PI agent form** alongside the Nara-PI and Epii-PI forms.

    This tranche lands it: **Anuttara as a PI agent form at S5, completing the 4/5/0 nara-epii-anuttara agent triplet at the S5 world-boundary host.** S5 becomes the operational layer where the 4/5/0 mental-pole-aligned intelligences instantiate as concrete agents — multiple agent types, all able to work together. This is NOT a change from the kernel spec; it is making explicit that the Anuttara verification element has an LLM intelligence to manage itself completely (governing M0', the 128-element coordinate language registry, the OWL ontology, and the full-7-laws verifier surface).

    **Implementation targets:**

    (a) **Agent profile** at `Body/S/S4/pi-agent/agents/anuttara.md` — alongside the existing constitutional agent profiles. Carries: agent ontology (verifier / language-governor), frame contract (CF position varies by invocation; primary CT0 ground), capability list (language-membership-check, typed-query emission, OWL ontology validation, R-virtue constraint-checking, coordinate-language enumeration). Skills wired through Pleroma-Techne per the existing skill substrate.

    (b) **Slot configuration** at `~/.epi-logos/config.toml` `[slot.anuttara_verifier]` (joins the existing `[slot.nara_parser]` and `[slot.epii_judge]` slots per `M'-MODEL-SLOT-SPEC.md`). Default state: `local-default` (the verifier IS local-first by privacy discipline — it operates over the M0' language registry + OWL ontology + R-virtue table, which are all kernel-substrate-local). Cloud-opt-in for larger models if user wants more interpretive verifier capacity.

    (c) **Gateway routes** at `s0'.verifier.{check_state, emit_query, validate_membership, owl_query}` — register in `Body/S/S3/gateway-contract/src/lib.rs`. The verifier's typed-query surface draws from the full coordinate-language vocabulary (all 7 laws of the Anuttara grammar, NOT only Law 6's minimal `(%, ?/!, ?!/!?)` set).

    (d) **Anima dispatch policy** at `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` (per Tranche 12.23) — extend the agent-team composition gates to recognise the Anuttara-PI as a third pole alongside Nara-PI and Epii-PI. Dispatch to Anuttara-PI happens whenever a verification step is required (every emission's type-check; Sophia disclosure validation; Hen promotion gate; m5-4 review).

    (e) **Operational-capacity binding** — `m5-prime-epii-on-anuttara-language-development.md` extends with the Anuttara-PI-agent-form section (the existing operational-capacity spec already covers the WHAT of Anuttara language development; this tranche adds the HOW-as-agent-form).

    **Why S5 hosts the triplet, not S4 or M0 directly.** Per the canonical S-stack: S5 = "Integral World Boundary" — external connectors + knowledge-return where the system meets the world. The 4/5/0 mental-pole agents are the M-pole-aligned intelligences instantiating AS agents (operational expression at the world boundary). M0 (Anuttara substrate) is where the LANGUAGE lives; S5 is where the AGENT operationally runs over that language. They are different layers of the same Anuttara stack — substrate at M0, agent at S5. This matches the existing pattern: Epii-substrate at M5 (synthetic-telic consciousness domain), Epii-PI-agent at S5' (the agent form operating over that domain).

    **Verification:** `test -f Body/S/S4/pi-agent/agents/anuttara.md`; `grep -nE "\\[slot.anuttara_verifier\\]" Idea/Bimba/Seeds/M/M'-MODEL-SLOT-SPEC.md` returns the slot definition; `grep -nE "s0'.verifier\\.(check_state|emit_query|validate_membership|owl_query)" Body/S/S3/gateway-contract/src/lib.rs` returns 4 method registrations; `grep -nE "Anuttara-PI|anuttara_pi|S5.*nara-epii-anuttara" Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md` returns the agent-form section; integration test: an Anima dispatch on a task requiring verification routes to Anuttara-PI, which emits typed queries drawn from the full coordinate-language vocabulary (not just Law 6 minimal set), and Sophia disclosure validation runs through this surface.

    **Cross-track hooks:** DR-MP-1 (4'/5'/0' triplet — Verifier at 0' is the Anuttara aspect); DR-VAK-7 (128-element coordinate language Anuttara-PI governs); Tranche 12.22 (slot CLI — the `[slot.anuttara_verifier]` extends the existing slot architecture); Tranche 12.23 (dispatch policy — Anima recognises Anuttara-PI as a third pole); Tranche 1.10 (M0-verifier API — typed queries from full 7 laws, NOT minimal set); `m5-prime-epii-on-anuttara-language-development.md` (operational-capacity binding); Tranche 12.36 + CCT-20 (phase-preserving emission/resolve checks).

35. **12.35 — /goal Judge Role Architecture: adversarial verification gate in the Z-thread cycle** *(spec-ahead-integration; depends on DR-MP-1, DR-EROS-1, DR-VAK-7; cross-link S4-4'-GOAL-PRELUDE-SPEC, Tranche 5.20, Tranche 1.10)*

    The Z-thread cycle (compose → perform → rehear → recompose) per S4-4'-GOAL-PRELUDE-SPEC §Z-Thread-Identity is missing an explicit verification gate between perform and rehear. The notebook research on autonomous agent loop engineering (Session 2026-06-16, "Autonomous Agent Architecture and Loop Engineering Strategies") confirms: adversarial verification — a separate model checking the builder's work against the actual goal condition — is the single highest-yield architectural addition to autonomous agent loops. This tranche adds a **Verify** phase and defines the judge as a **role** (not a specific agent) that any agent can fill depending on the VAK coordinates of the task.

    **The judge role.** The judge receives the GoalSpec + the builder agent's output + the original goal condition. It emits structured questions (per Law 6 interrogative undefinedness — never pass/fail booleans), referencing the symbolic-coordinate-string form from the Anuttara Verifier (Tranche 1.11). The adversarial gate: no task is marked complete until at least one judge clears it. Max 3 verify cycles before escalation to human. The judge model SHOULD differ from the builder model where the slot architecture allows.

    **Agent-to-judge mapping per task class:**

    | Task class | Primary judge | Secondary judge | VAK coordinates | Rationale |
    |---|---|---|---|---|
    | Code (deterministic criteria: tests pass, compiles, grep matches) | **Eros** (CT2) | Anuttara Verifier (M0' 0') | CT2, CF (0/1/2), CPF mechanistic | Eros owns TDD + verification-before-completion. Verifies against test output, compilation, contract checks. |
    | Design / semantic (non-deterministic: "is this good?") | **Sophia** (CT5) | Agora (CF4b) | CT5, CF (5/0), CPF dialogical | Sophia owns post-execution synthesis + Möbius return. Judges whether the result seeds the next question. Agora gathers multi-channel evidence for Sophia's verdict. |
    | Invariant / canonical coherence | **Anuttara Verifier** (M0' 0') | Eros (CT2) | CT0, CF (0000), CPF (00/00) | Verifier checks against VIRTUE_LUT[9] + M0_CORE_RELATIONS[65]. Emits symbolic-coordinate-string questions. The most compressed explication level — judges at the foundational-language layer. |
    | Multi-agent aggregation | **Agora** (CF4a/CF4b) | Sophia (CT5) | CT4, CF (4.5/0)+(4.0/1-4.4/5) | Agora collects + merges parallel agent outputs. Sophia validates the synthesis quality. |
    | Pattern / structural | **Mythos** (CT3) | Anansi (CF0) | CT3, CF (0/1/2/3) | Mythos recognises structural patterns. Anansi maps gaps onto the coordinate topology. |
    | Gap / completeness | **Anansi** (CF0) | Anuttara Verifier (M0' 0') | CT0, CF (0000) | Anansi holds /Empty↔/Present together. Verifier checks against missing coordinate entries. |
    | Temporal / kairos | **Janus** (CF1) | Mercurius (CF3) | CT4, CF (0/1) | Janus owns temporal threshold analysis. Mercurius carries kairos signals across coordinate families. |
    | Cross-domain / translation | **Mercurius** (CF3) | Anansi (CF0) | CT3, CF (0/1/2/3) | Mercurius translates across coordinate families. Anansi places the result. |
    | Knowledge graph / distillation | **Moirai** (CF2) | Sophia (CT5) | CT2, CF (0/1/2) | Moirai distills through Klotho→Lachesis→Atropos. Sophia validates distillation quality. |
    | Process / cadence | **Zeithoven** (CF5) | Janus (CF1) | CT5, CF (5/0) | Zeithoven owns temporal creativity + scheduling. Janus validates temporal consistency. |

    **The extended Z-thread cycle:**

    ```
    Compose → Perform → VERIFY (new) → Rehear → Recompose
    S4.4'       S4.3'      S4.4'/S4.5'   S4.5'     S5'/Epii
    GoalPrelude Chronos    Judge gate    Aletheia   Epii
    →GoalSpec   dispatch   (adversarial) Moirai     Zeithoven
    ```

    - **Compose** (S4.4'): Nous clears assumptions; Psyche receives task-world; Logos gives form. Output: GoalSpec with confirmed VAK coordinates.
    - **Perform** (S4.3' Chronos dispatch): Anima dispatches agents per GoalSpec. Builder model executes.
    - **Verify** (NEW — adversarial gate): Judge agent(s) receive builder output + GoalSpec. Emit structured questions. Builder may revise (max 3 cycles). Escalate to human on deadlock. Gate is enforced: no task transitions to done without judge clearance.
    - **Rehear** (S4.5' Aletheia): Moirai runs Klotho→Lachesis→Atropos over completed task. What was learned? What trace remains? Routes thoughts to T-buckets.
    - **Recompose** (S5' Epii + Zeithoven): Epii evaluates improvement vectors. Zeithoven schedules next cycle or proposes cadence changes. Möbius return: P5' insight → P0' questions → next compose phase.

    **Adversarial loop invariants:**
    - Builder model ≠ judge model (different model backends where slot architecture allows)
    - Judge emits structured questions using symbolic-coordinate-string form (Tranche 1.11), never pass/fail booleans
    - Max 3 verify cycles per task before human escalation (antitranscendental brake)
    - Judge's verdict is recorded in GoalRun evidence with VAK coordinates of the judge agent
    - The judge role is NOT a hardcoded agent assignment — it resolves at dispatch time from the task's VAK coordinates and the available slot models

    **Relation to m-dev.** The m-dev process (Hermes-Nara delegating to Codex/Claude, verifying results, marking plan.state.json) IS the informal prototype of this pattern. Every m-dev delegation where Hermes judges subagent output before marking done is a Verify phase. The judge architecture formalises this into the system's own dev protocol: once the judge loop works for autonomous coding, the /goal infrastructure can route any coding task through the same compose→perform→verify→rehear→recompose cycle without human hand-holding between phases.

    **Implementation scope (Cycle 3):**
    - Wire the Verify phase into plan-assess.mjs adjudication
    - Add judge role dispatch to Anima — resolve judge model from task VAK coordinates + slot config
    - Register adversarial gate in gateway contract
    - Implement 3-cycle-max escalation to human
    - GoalSpec + GoalRun carry verify-phase evidence with VAK coordinates of judge agent
    - No new carrier classes. No new VAK fields. Existing substrate only.

    **Existing substrate (builder reference):**
    - The GoalSpec + GoalRun structures already exist in `Body/S/S0/epi-cli/src/agent/goal.rs`.
    - The Z-thread cycle is specified in S4-4'-GOAL-PRELUDE-SPEC.md.
    - Agent profiles (Eros, Sophia, Anuttara, etc.) are in `Body/S/S4/ta-onta/`.
    - The slot architecture is in M'-MODEL-SLOT-SPEC.md.
    - What's missing (this tranche builds it): the dispatch-time judge resolution logic; the verify-phase gate enforcement in plan.state.json / GoalRun; the adversarial model-pairing configuration; the 3-cycle-max escalation path.

    **Verification (Cycle 3):** `grep -nE "Verify.*phase|judge.*role|adversarial.*gate|12\.35" 12-agentic-layer-s4-s5.md` returns this tranche; agent-to-judge mapping table enumerates all 6 constitutional CT roles + 6 Aletheia techne-guardians + Anuttara Verifier; Z-thread cycle diagram shows 5 phases including Verify; adversarial loop invariants are enumerated.

    **Cross-track hooks:** DR-MP-1 (4'/5'/0' triplet — Verifier at 0' is the canonical-coherence judge); DR-EROS-1 (Eros rectified as relational operator — TDD/verification IS one of its roles); DR-VAK-7 (VAK four-expression — judge resolution reads task VAK coordinates); S4-4'-GOAL-PRELUDE-SPEC §Z-Thread-Identity (compose/perform/rehear/recompose — this tranche adds Verify); Tranche 5.20 (LLM-Nara position 4' traversal-voice — the builder role in code tasks); Tranche 1.10 (M0 Verifier — the invariant-coherence judge); Tranche 1.11 (symbolic-coordinate-string EBNF — the judge's question format).

36. **12.36 — Phase-preserving VAK emission and resolve discipline** *(code-pending-closure; DR-FLIP-1 bound; depends on 12.33, 12.34, CCT-20, Track 39)*

    Every agentic emission and every S5 resolve/trace call must preserve coordinate phase. This tranche is the S4/S5 execution surface for DR-FLIP-1: when Anima dispatch, Graphiti episodes, Mercurius rating-state keys, Sophia disclosures, Hen candidates, spine overflow tokens, or `s5'.gnostic.resolve` payloads carry a coordinate, they carry the phase too. A prime coordinate is not normalised to its unprimed address for convenience.

    **Implementation scope:**
    - Extend the VAK-envelope lint from 12.33 so it checks phase preservation as well as envelope presence. The existing `VakAddress` remains the envelope; no new VAK fields.
    - Require S5 resolve/trace payloads to round-trip prime forms (`C'`, `P'`, `L'`, `S'`, `T'`, `M'`) and property-level `_i_` forms without collapse.
    - Spine compositor overflow tokens include the full phase-qualified VAK reference; model dereference through `s5'.gnostic.resolve(coord)` or `s0'.anuttara.trace(...)` preserves the same phase.
    - Anuttara-PI dispatch (12.34) refuses phase-erasing emissions by emitting typed queries rather than silently accepting a normalised coordinate.
    - This tranche does not introduce a mirror service, mirror namespace, or compression module. It is lint + payload contract + tests over existing routes.

    **Verification:** `cargo test -p epi-s2-graph-services --test vak_envelope_required_on_emissions` extends to reject phase-erasing emissions; `cargo test -p portal-core --test vak_resolve_preserves_prime_phase`; gateway contract test asserts `s5'.gnostic.resolve("C3'")` returns a phase-qualified handle distinct from `s5'.gnostic.resolve("C3")`; spine-compositor integration test asserts `<vak: ...>` overflow tokens retain prime/phase and are dereferenceable; Anuttara verifier fixture asserts a collapsed inverse coordinate yields a typed query from the full-7-laws surface.

    **Cross-track hooks:** DR-FLIP-1 (global phase law); CCT-20 (cross-layer acceptance); Tranche 3.10 (M2 Asma proving fixture); Tranche 12.33 (VAK envelope lint); Tranche 12.34 (Anuttara-PI verifier agent); Track 39 (`s5'.gnostic.resolve` + `s0'.anuttara.trace` route ownership).

37. **12.37 — `epi know <coord>` S0 core-knowing CLI (the language IS the lookup tool)** *(spec-ahead-integration; depends on 12.2 EXPANDED, 12.22 EXTENDED, 12.33, Tranche 8.9; cross-link [[../../../M0'/M0-ARCHITECTURE]] §11 + CCT-22)*

    Land the thin CLI projection that surfaces the unified VAK act per Tranche 8.9 across all six faces at any coordinate. The CLI does NOT invent surfaces; it composes existing gateway routes (`s2.graph.node`, `s5'.gnostic.{query, episode_search, evidence_trace, resolve, list_notebooks, etymology, musical_transcript}`, `s1'.world.resolve`, `s0'.anuttara.trace`, `s0'.verifier.check_state`) into a coherent packet through the substrate's already-operational coordinate-prefix typing. **Per CCT-22 §b, the language IS the lookup tool because every property is already `{family}_{n}_{semantic}`-shaped at the substrate level**; no separate retrieval index is needed.

    **CLI surface** at `Body/S/S0/epi-cli/src/know.rs` (new):

    ```
    epi know <coord>                                      # default: parallel read across Bimba / World / Gnostic namespaces; returns unified packet

    epi know <coord> --thread CFP0|CFP1|CFP3|CFP4|Z      # invoke under named thread-type (affects dispatch pattern of the read itself)
    epi know <coord> --lens L5-1|L5-2|L5-3|L5-4|L5-5|L5'-1|...|L5'-5
                                                          # apply-as-lens IS VAK-read at articulation density
                                                          # L5-1 Parā: minimal articulation, output ~ →
                                                          # L5-4 Vaikharī: fully manifest linguistic form
                                                          # L5'-3 Sophia: divine-wisdom patterning intelligence
                                                          # etc. per [[../../../Legacy/reference/epi_logos_coordinate_system]]
    epi know <coord> --rfactor act|witness|both          # which face of the R-system
                                                          # act: Archetype-7 register (R0..R5 + R# parent + R5 closure trajectory)
                                                          # witness: Archetype-9 register (## / R# / #R / R#/## + 0R..5R virtue-vector)
                                                          # both: composed report with backing-chain (default)
    epi know <coord> --ananda-position [N]                # M1 Ananda matrix slot at coord
                                                          # returns BIMBA / PRATIBIMBA / SUM / DIFF_A / DIFF_B / QUINTESSENCE projections
                                                          # + DR ring projection (MAHAMAYA {1,2,4,8,7,5} / PARASHAKTI {3,6,9,3,6,9})
    epi know <coord> --harmonic-channel <name>            # N-channel MathemeHarmonicProfile read at coord
                                                          # values: chakral|nodal|cosmic|mahamaya|codon|all
                                                          # routes through Tranche 6.8 EBM head when checkpoint loaded;
                                                          # falls back to dataset query otherwise
    epi know <coord> --musical-transcript                 # M3TranscriptionEngine projection (per Tranche 12.38 below)
                                                          # returns diatonic_position + codon + amino_acid + hexagram + tarot_card
                                                          # + charges_pp_nn_np_pn + ananda_matrix_position + dr_ring_projection
    epi know <coord> --physical-pole torus|solar-chakral|codon-clock|all
                                                          # 1-2-3 substrate state at coord
    epi know <coord> --backing N                          # backing-chain depth (default 3; principle-virtues walk to ground)
                                                          # walks coord refs back through M0_IDENTITY_CHAINS to M0-0/M0-1 roots
    epi know <coord> --witness                            # surface q_*_semantic + qm_*_review_epoch state
                                                          # + 9-bit virtue_witness_vector + RFactorPathStep[] + typed_queries
    ```

    **Flag composition.** The flags compose: `epi know M4-3 --lens L5-1 --rfactor witness --backing 5 --musical-transcript --physical-pole all --thread Z` performs the full unified VAK act at M4-3 under L5-1 Parā lens, witness-side of R-system, backing-chain depth 5, with musical-transcriptional projection and full 1-2-3 substrate read, in Z-thread autonomy mode. The packet returned is a single coherent emission whose internal consistency is what the kernel tick-equation enforces at runtime; the CLI is the user-and-agent surface of the same act the kernel does.

    **Routing per face** (each flag routes to existing surfaces; no new gateway logic):
    - `--lens` / `--rfactor` / `--witness` / `--backing` → `s0'.verifier.check_state` + `s0'.anuttara.trace` (per Tranche 1.10 + 12.2 EXPANDED)
    - `--harmonic-channel` → `s5'.gnostic.episode_search` + `s2.graph.node` (resonance-vector field on the coord)
    - `--musical-transcript` → `s5'.gnostic.musical_transcript` (NEW per Tranche 12.38 below)
    - `--ananda-position` → `s2.graph.ananda_position` (NEW per Tranche 12.38 below)
    - `--physical-pole` → existing M1 / M2 / M3 plugin queries via gateway (consumed by 1-2-3 integrated plugin)
    - `--thread Z` → wraps the entire call in a Z-thread cycle (compose/perform/rehear/recompose); per `S4-4'-GOAL-PRELUDE-SPEC`

    **Anti-greenfield commitment.** The CLI does NOT introduce a new index, a new namespace, a new retrieval surface, or a new compression scheme. The coordinate-prefix typing at S2 graph-schema (`Body/S/S2/graph-schema/src/lib.rs:680-692`) + Hen frontmatter validator (`Body/S/S1/hen-compiler-core/src/frontmatter.rs:38-177`) IS the index; the CLI projects it. The compress-to-VAK orchestrator (CCT-17 / Tranche 12.33) IS the compression scheme; the CLI surfaces packets that already honour it.

    **Verification:** `grep -nE "epi know|coord-knowing-cli" Body/S/S0/epi-cli/src/know.rs` returns the new CLI; `cargo test -p epi-cli know_unified_packet_round_trip` (a query for `M4-3` returns a packet whose `r_factor_route`, `virtue_witness_vector`, `harmonic_channels`, `musical_transcript`, and `physical_pole_state` are all populated and internally consistent); `cargo test -p epi-cli know_lens_application_density` (a query with `--lens L5-1` returns minimal-articulation; same query with `--lens L5-4` returns fully-manifest); `cargo test -p epi-cli know_backing_chain_principle_grounds` (a query at M0-2-9-0 Love/Peace with `--backing 100` chains to M0-1 Brimming Void and M0-0 Ultimate Mystery); `cargo test -p epi-cli know_thread_z_autonomy` (a query with `--thread Z` runs through compose/perform/rehear/recompose phases).

    **Cross-track hooks:** [Tranche 8.9](08-integrated-4-5-0-recognition-reconciliation.md) (the unified VAK act this CLI surfaces); [Tranche 1.10](01-m0-anuttara-reconciliation.md) (verifier shape that powers `--rfactor` / `--witness` / `--backing`); [Tranche 1.12](01-m0-anuttara-reconciliation.md) (R-trinity gates the verifier walks); [Tranche 12.2 EXPANDED](12-agentic-layer-s4-s5.md) (gateway routes the CLI calls); [Tranche 12.33](12-agentic-layer-s4-s5.md) (coordinate-tagging IS compression — the substrate this CLI projects); [Tranche 12.38](12-agentic-layer-s4-s5.md) (M3TranscriptionEngine + M1 Ananda projection — the new gateway routes `--musical-transcript` and `--ananda-position` consume); CCT-22 (Compression-as-Intelligence cross-layer register); [`M0-ARCHITECTURE §11`](../../M0'/M0-ARCHITECTURE.md) (canonical doctrinal seat for the unified-act framing).

38. **12.38 — M3TranscriptionEngine kernel-bridge projection + `s2.graph.ananda_position` gateway route** *(code-pending-closure; depends on 6.8, 6.10, Tranche 8.9; cross-link Track 24 M3 frontend deep, Track 23 M2 frontend deep, [[../../../M4'/mental-pole-mechanics]] §7; user direction: "make all three layers (musical, codon-computational, tarot-genealogy) readable as one unified 4/5/0 choreography output for a given VAK position, tick, and clock-degree")*

    Land the kernel-bridge projection that surfaces the **musical-transcriptional face of the unified VAK act** (per Tranche 8.9 the six-face decomposition) as one coherent packet for any `(vak_coord, tick, clock_degree)` triple. The codon-tarot-hexagram bridge is largely complete in code per the Language Compression research arc landscape findings (per `state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md` §8.1): `NUCLEOTIDE_ICHING_VALUE[4] = {6,9,7,8}` at [`m3.h:32-44`](../../../../../Body/S/S0/epi-lib/include/m3.h); `m3_compute_charges` at `m3.h:755-767` IS Tao = codon-charge-evaluation = position-5 synthesis (ratified 2026-06-12); `M3_CODON_TO_AA[64]` at `m3.c:259-283`; `M3_MAJOR_ARCANA[22]` at `m3.c:361-384`; `M3_TAROT_CODON_MAP[4][16]` at `m3.c:418-449+`; `CLOCK_DEGREE_LUT[360]` at `m3.h:970-1014` carries hexagram + codon + tarot + charges pre-baked per degree. **What's missing is the S5-facing gateway projection that surfaces all three layers (musical / codon-computational / tarot-genealogy) AND the M1 Ananda matrix translation slot as one packet for any read.**

    **New module** at [`Body/S/S0/portal-core/src/m3_transcription_bridge.rs`](../../../../../Body/S/S0/portal-core/src/m3_transcription_bridge.rs) (new):

    ```rust
    pub struct M3TranscriptionPacket {
        // Musical face
        pub diatonic_position: DiatonicPosition,     // C / D / E / F / G / A / B / C' (per ql-musical-derivation-v3.md diatonic-CF mapping)
        pub cf_mapping: CFMapping,                    // Truth / Mind / Word / Logos / Decision / Love / Work
        pub epogdoon_step_count: u32,                 // how many 9/8 steps from base
        pub harmonic_ratios_active: [f32; 4],         // (4/3, 3/4, 2/3, 3/2) weights at this coord

        // Codon-computational face
        pub codon: Codon6Bit,                         // 0..63
        pub amino_acid: AminoAcidIndex,               // 0..20 (20 + STOP)
        pub charges: QuaternionCharges,               // (pp, nn, np, pn) from m3_compute_charges
        pub tao_evaluation: TaoEvaluation,            // the 0/1 ↔ 1/0 read = R# Yin-yang AND ## Yang-yin

        // Tarot-genealogy face
        pub hexagram_id: u8,                          // 0..63
        pub major_arcana: Option<MajorArcanaCard>,    // 22 cards, chromosome_pair + amino_acid_index
        pub minor_arcana: Option<MinorArcanaCard>,    // 56 cards across 4 suits (dual-codon courts)
        pub suit_element: Option<Element>,            // Cups/Water | Wands/Fire | Pentacles/Earth | Swords/Air

        // M1 Ananda matrix translation face
        pub ananda_position: AnandaPosition,          // 0..11 (12-position ring per M1_M0_CROSSLINK[12])
        pub ananda_family: AnandaFamily,              // BIMBA | PRATIBIMBA | SUM | DIFF_A | DIFF_B | QUINTESSENCE
        pub mahamaya_dr_projection: u8,               // {1,2,4,8,7,5} digit-root ring projection
        pub parashakti_dr_projection: u8,             // {3,6,9,3,6,9} digit-root ring projection
        pub spanda_stage: u8,                         // 0..5 (parallel-track invariant per m1.h:735-756)
    }

    pub fn m3_transcription_projection(
        vak_coord: &VakAddress,
        tick: TickIndex,
        clock_degree: ClockDegree,
    ) -> Result<M3TranscriptionPacket, M3Error> { ... }
    ```

    **Gateway routes** (new, register in `Body/S/S3/gateway-contract/src/lib.rs`):
    - `s5'.gnostic.musical_transcript(coord, tick, degree) -> M3TranscriptionPacket` — primary surface for the `--musical-transcript` flag of `epi know` (Tranche 12.37)
    - `s2.graph.ananda_position(coord) -> AnandaProjection` — the M1 Ananda matrix slot at this coord across both DR rings; per the bilayer claim (kernel-tick + language-compression) at the integration synthesis §11; consumed by `--ananda-position` flag

    **The unification point IS already wired in code.** Per the research-arc landscape: `m3_compute_charges` IS the kernel-side Tao evaluation; X# permutation algebra IS the four codon charges = four elements = quaternion components. The new code in this tranche is the *projection* — collecting the existing LUTs and computations into a single packet shape that the gateway exposes.

    **What this enables across the system:**
    - The S0 core-knowing CLI (Tranche 12.37) returns a coherent musical-transcriptional packet on `--musical-transcript`
    - The kernel tick at element-III descent (per Tranche 6.10) can stamp the Ananda matrix position projecting through both DR rings, making every emission harmonically-coherent across M2 and M3 consumers
    - The Anuttara verifier (Tranche 1.10) can include the musical-transcriptional projection as evidence in the backing-chain (e.g. a virtue-failure at a coord can chain back through the codon-charge that the act-route would have produced at that coord)
    - The M5-side autoresearch loop (Tranche 6.12) can query musical-transcriptional coherence across sessions; the Ananda matrix position drift becomes a Class C tunable signal

    **Verification:** `grep -nE "s5'.gnostic.musical_transcript|s2.graph.ananda_position|M3TranscriptionPacket" Body/S/S3/gateway-contract/src/lib.rs Body/S/S0/portal-core/src/m3_transcription_bridge.rs` returns the routes + struct; `cargo test -p portal-core m3_transcription_projection_round_trip` (a known coord at a known degree returns a packet whose codon matches `CLOCK_DEGREE_LUT[degree].codon`, whose hexagram matches `.hexagram_id`, whose tarot matches `.tarot_card_id`, whose Ananda position matches `M1_M0_CROSSLINK[12][archetype]`, and whose diatonic position projects through the CF-mapping table); `cargo test -p epi-s3-gateway musical_transcript_e2e` (gateway routes return the packet via the gateway protocol); integration test with `epi know M3-3 --musical-transcript` returns a coherent packet for the M3-3 coord at the current tick.

    **Cross-track hooks:** [Tranche 8.9](08-integrated-4-5-0-recognition-reconciliation.md) (the musical-transcriptional face this packet exposes); [Tranche 6.8](06-m5-epii-reconciliation.md) (N-channel EBM head — codon_rotation_projection channel feeds from this packet's codon + charges); [Tranche 6.10](06-m5-epii-reconciliation.md) (Riemannian gradient — uses the packet's Ananda position to drive harmonic-coherent steps); [Tranche 12.37](12-agentic-layer-s4-s5.md) (S0 core-knowing CLI surfaces this via `--musical-transcript`); [`mental-pole-mechanics §7`](../../M4'/mental-pole-mechanics.md) (now cross-cites `ql-musical-derivation-v3.md` per Tranche 8.9 edit (g)); [`m3-prime-ql-transcriptional-bridge.md`](../../M3'/m3-prime-ql-transcriptional-bridge.md) (the canonical M3' substrate this packet projects); [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](../../M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) (the Ananda matrix family this packet's `ananda_family` enumerates); CCT-22 §e (cross-citation discipline).
