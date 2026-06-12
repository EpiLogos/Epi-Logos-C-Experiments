# Track 12 — Agentic Layer (S4 ↔ S5) Ownership Closure — Pi + Anima + Subagents

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
- **Pleroma-Techne (S4-2') is the atomic-skills substrate** the 6 guardians steward. Pleroma has TWO faces per DR-S4-TECHNE: **VAK capability membrane** (canonical) + **Techne atomic-skills repository** (canon-aligned 2026-06-03). The existing Techne gateway tools (`techne_gateway_*`, `techne_session_*`, `techne_cmux_*` at `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts:25-259`) are the gateway over this skills layer. **Techne is NOT an agent**; the S4 canon §14-Agent Roster mis-classified it. No `techne.md` agent profile lands.
- **Six ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia-carrier) are system/service routing infrastructure — they are NOT agents. Aletheia-the-carrier hosts the crystallisation mode; Anima dispatches within it.
- **ACR (Agentic Control Room) substrate is tangent-development drift** to be repurposed as a Pi runtime monitoring surface, not retained as a "constitutional-agents review panel."
- The `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array in `capability-matrix.json` is either documented as psyche-aspect rendering material (surfaced through Anima for recognition/meditation work — NOT separate agents) or deprecated outright.

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

2. **12.2 — `s5'.gnostic.*` gateway-endpoint registration** *(code-pending-closure; consolidates Tranche 06.1)*

   Register `s5'.gnostic.{ingest, query, notebook, status}` in `Body/S/S3/gateway/src/` routing to `epi-gnostic/epi_gnostic/{cli.py, graphiti_service.py, wrapper.py}`. Anti-greenfield: production Python package landed; gateway only registers.

   Verification: `grep -rn "s5'.gnostic\." Body/S/S3/gateway/src/` returns ≥4 method registrations; `cargo check -p epi-s3-gateway` clean; `pytest Body/S/S5/epi-gnostic/tests/test_enrichment.py -q` passes.

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

    Patch S4-SPEC §A and §14 where "Techne helper roles" / `s_4_helper_roles` imply Techne is a helper-agent roster item. Rename the surface to Pleroma-Techne atomic skills / `s_4_pleroma_techne_*` and cross-link Pleroma's two faces: VAK capability membrane + Techne atomic-skills repository.

    Verification: `grep -rn 'Techne helper roles\\|s_4_helper_roles\\|Aletheia 7\\|7th member' Idea/Bimba/Seeds/S/S4` returns no live wrong-roster attribution.

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

    Operationalize the S4'/S5' autoresearch self-improvement loop as multi-channel Elo over `(agent × model × skill × context)` indexed by `(vak-cp-position, mef-lens, content-class, kairos-window)`. The same machinery rates agent dispatch AND research-moves; the tournament IS the system activity.

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

22. **12.22 — Pi-Agent model-slot configuration interface** *(spec-ahead-integration; DR-MODEL-1 bound; canonical spec at [[../../../M'-MODEL-SLOT-SPEC]])*

    Land the per-role model-slot rule. Each slot has three valid states (local-default / cloud-opt-in / null) configured in `~/.epi-logos/config.toml`. Anima's dispatch policy reads slot state at dispatch time; Anuttara verifier enforces privacy boundaries.

    Slots: `nara_parser`, `epii_judge`, `aletheia.{anansi,janus,moirai,mercurius,agora,zeithoven}`. Defaults per slot per [[../../../M'-MODEL-SLOT-SPEC]] §2-§4 (Nara-parser → local-default Gemma 4 12B Unified Q4; Epii-judge → cloud-opt-in Pro-class; per-Aletheia-subagent defaults per techne-domain).

    CLI surface at `Body/S/S0/epi-cli/src/slot.rs` (new): `epi slot list`, `epi slot show <name>`, `epi slot set <name> --state <state> --provider <p> --model <m>`, `epi slot disable <name>`, `epi slot test <name>`.

    Verifier constraints (new, registered via `pi register-constraint`):
    - `slot_privacy_boundary_compliance` (error-level) — dispatches must not route content of class X to a slot whose consent_scope doesn't cover X
    - `slot_fallback_compliance` (error-level) — slots configured `local-default` must resolve to either `local-default` or `null`, never silently to `cloud-opt-in`

    Pi-Agent harness reads slot config at startup and per-dispatch; exposes `pi_slot_resolve({slot_name, dispatch_context})` → `(model_ref, state, fallback_action)`.

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

25. **12.25 — Evolver / DGM integration as typed VAK choreography over existing primitives** *(spec-only-now; execution blocked on Tranches 12.20–12.24 and Streams A–G of [[33-harmonic-energy-channel-handoff]]; canonical reference at [[../../../M5'/m5-prime-autoresearch-self-improvement-loop]]; locks scope alignment with [[33-harmonic-energy-channel-handoff]] §2.8)*

    **Tranche purpose.** Produce the canonical specification mapping each evolver / Darwinian-Gödel-Machine (DGM) loop step to (a) a typed VAK invocation `(CPF, CT, CP, CF, CFP, CS)` per the S4' VAK reading-frame law at [[../../../../S/S4/S4'/S4'-SPEC]] §VAK-Reading-Frame-Law and (b) the existing primitive that already implements its mechanics. The tranche is **plan-able now**; **execution is blocked until ALL of Streams A–G of [[33-harmonic-energy-channel-handoff]] have EXECUTED (not merely planned)** through their respective tranches (12.20, 12.23, 12.24 Phase 2, 12.24 Phase 4, plus 06-m5-epii-reconciliation Tranche 6.10/6.11 and 04-m3-mahamaya-reconciliation oracle-wiring sub-tranche). The evolver loop is a **choreography over stabilised primitives**, NOT a new mechanism — once upstream tranches land, this tranche delivers the spec; once the spec lands and is approved, a follow-up cycle implements the choreography. **Decisions inherited (not re-debated):** the handoff frontmatter `dev_decisions` block at [[33-harmonic-energy-channel-handoff]] is canonical; any decision not in that block that arises during spec-production must be escalated to user.

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
