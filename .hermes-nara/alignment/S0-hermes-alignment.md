# S0 — Kernel / CLI / Portal — Hermes Alignment
Date: 2026-06-07

## Adopt (Hermes → Epi-Logos)

1. **Subcommand discovery loop (hermes → epi)**
   Hermes's CLI (`hermes_cli/main.py`) has a flat top-level command set: `chat`, `config`, `model`, `tools`, `skills`, `mcp`, `gateway`, `sessions`, `cron`, `profiles`, `auth`, `doctor`, `status`, `insights`, `update`, `completion`. Each has discoverable subcommands. The `epi` CLI (`epi-cli/src/main.rs`) has 20 top-level `Commands` variants (Core, Vault, Graph, Gate, Agent, Sync, Sesh, Vimarsa, Book, Notebook, Techne, App, Up, Code, Nara, Profile, Portal, Help) but no `epi --help` discoverability grouping by layer (S0–S5). Hermes groups commands by concern (config, tools, sessions) — Epi-Logos could add a `epi layer` subcommand that shows which commands belong to which S-layer: `epi layer s0 → core, profile, portal` and `epi layer s3 → gate, sync, sesh`.

2. **Interactive model/provider picker (hermes model → epi code)**
   Hermes's `hermes model` opens a curses TUI picker for model and provider selection. Epi-Logos has `epi code` which delegates to Claude Code with provider profiles, but no interactive TUI picker. Epi-Logos could adopt the curses picker pattern for S4'/S5' agent model selection, reusing `ratatui` (already a dependency) to build an `epi model pick` TUI that reads from the same provider config that `epi code` uses.

3. **Config set/get/edit as first-class CLI surface (hermes config → epi config)**
   Hermes offers `hermes config`, `hermes config set KEY VAL`, `hermes config edit`, `hermes config path`, `hermes config check`, `hermes config migrate`. Epi-Logos has no `epi config` subcommand — configuration is distributed across env vars (`EPILOGOS_ROOT`, `EPI_SESSION_*`), Cargo features, and hardcoded constants. Adding `epi config show`, `epi config set`, `epi config env-path` would lower the onboarding bar and reduce the compatibility-shim count tracked in `s0-membrane-inventory.json` (shims D, E: legacy session fallbacks and vault-root fallbacks).

4. **Tool enable/disable via curses UI (hermes tools → epi portal-core tool contracts)**
   Hermes's `hermes tools` opens an interactive toggle UI for enabling/disabling toolsets per platform. Epi-Logos's `s0-membrane-inventory.json` (30 modules, 5 classifications: `kernel-owner`, `cli-adapter`, `gateway-adapter`, `temporary-live-host`, `compatibility-shim`, `duplicated-service-law`) is a machine-readable contract inventory — but it has no interactive operator surface. Epi-Logos could add `epi tools status` and `epi tools enable/disable` that read from the membrane inventory and show parity status in a ratatui table, making the Track 13 extraction progress operator-visible.

5. **Doctor/dependency check (hermes doctor → epi doctor)**
   Hermes's `hermes doctor [--fix]` checks dependencies, config health, and suggests fixes. Epi-Logos has no equivalent — a broken config manifests as runtime errors in `main.rs` match arms. Adding `epi doctor` that verifies: Rust toolchain ≥1.89, Neo4j reachable, Redis reachable, EPILOGOS_ROOT populated, vault accessible, gateway process healthy, epi-lib FFI symbols present — would reduce the debugging surface documented in the 12 compatibility shims and 4 temporary live hosts.

6. **Cron scheduling for kernel tick observation (hermes cron → epi cron)**
   Hermes's cron system (`hermes cron create`, `hermes cron list`, schedule strings like `"every monday 9am"`, `context_from` chaining) could be adopted by Epi-Logos for scheduled kernel-profile observation. Currently, `portal-core::KernelProfileObservationEvent` exists but there's no scheduler to emit it periodically. `epi cron observe-profile --coordinate M2-1-3 --every 30m` would close the gap between the typed event shape and actual data production.

## Enrich (Epi-Logos → Hermes)

1. **Coordinate-aware command routing (epi core/vault/graph → hermes session_search)**
   Epi-Logos's `epi core` dispatches through `epi_lib::ffi::EpiLib` which wraps the C engine — commands like `epi core walk M4 torus` are coordinate-position-aware. Hermes has no coordinate-space concept. A Hermes skill that loads a coordinate context and filters session_search results by coordinate family/layer would enrich its retrieval: `hermes sessions search --coordinate M4` filtering by FTS5 on coordinate-tagged sessions. This is the pattern Epi-Logos uses in `epi vault search` (wikilink integrity + frontmatter coordinate keys).

2. **Vimarsa curiosity-driven exploration (epi vimarsa → hermes skills browse)**
   `epi vimarsa` (`epi-cli/src/vimarsa/`) performs coordinate-driven curiosity exploration — walking the graph from a seed coordinate, computing resonances, and surfacing what's adjacent. Hermes's `hermes skills browse` and `hermes skills search` are keyword-based. A coordinate-aware skill discovery mode — "show me all skills related to S-layer concepts" or "find skills that mention coordinates in their frontmatter" — would be a Vimarsa-inspired enrichment.

3. **Matheme harmonic profile as session context header (portal-core::MathemeHarmonicProfile → hermes session prompt)**
   Epi-Logos's `MathemeHarmonicProfile` (1266-line `kernel.rs`, 40+ fields including `degree720`, `tick12`, `lens_mode`, `codon_rotation_projection`, `q_cosmic`, `resonance72`, `vak_address`, `privacy_class`) is a rich context header emitted at session boundaries. Hermes's session context (`agent/prompt_builder.py::build_environment_hints()`) currently emits OS, home dir, cwd, backend type — but no harmonic/orbital state. Adding an optional `hermes profile harmonic` that exposes a simplified tick/codon/resonance header to the system prompt would give Hermes sessions a temporal anchor that Epi-Logos already computes at every `KernelTick`.

4. **Contract inventory with parity tracking (s0-membrane-inventory.json → hermes toolsets.py)**
   Epi-Logos's `s0-membrane-inventory.json` is a machine-readable inventory of 30 S0 modules classified by ownership (kernel-owner, cli-adapter, gateway-adapter, temporary-live-host, compatibility-shim, duplicated-service-law) with extraction tasks, parity status, and allowed responsibilities. Hermes's `toolsets.py` `TOOLSETS` dict is a flat mapping of toolset name → list of tool names — no ownership, parity, or extraction tracking. Hermes could adopt a `toolset-inventory.json` that records which tools are core-owned vs plugin-owned vs MCP-provided, with migration tasks and allowed S0 (core) responsibilities — making the boundary between Hermes core and external plugins auditable the way Epi-Logos's S0/S3/S4/S5 boundaries are.

5. **Privacy-class-gated event envelope (portal-core events → hermes message routing)**
   Epi-Logos's `EventPrivacyClass` (`ProtectedLocalBody`, `ProtectedLocalDerived`, `PublicCurrentContext`, `ReviewedCanonical`) gates what events surface where — `NaraActivityEvent` enforces `ProtectedLocalBody` for raw-body-backed events, `KernelProfileObservationEvent` uses `ProtectedLocalDerived`, and `KernelTickEnvelope` carries `ENVELOPE_PRIVACY_CLASS = "safe-public-current-kernel-tick"`. Hermes's privacy controls (`privacy.redact_pii`, `security.redact_secrets`) are binary toggles. A tiered privacy-class system per message would give Hermes finer-grained control — especially useful for gateway platforms where different channels need different privacy levels.

## Tighten (specific improvements)

1. **S0 CLI: Add `epi config` subcommand**
   Current state: No `epi config` exists. Configuration is env vars + Cargo features + hardcoded constants.
   Proposed change: Add `Commands::Config` variant in `main.rs` with subcommands `show`, `env-path`, `check` (verifying EPILOGOS_ROOT, Neo4j, Redis, vault, epi-lib FFI). Implement in new `src/config.rs` module.
   Rationale: Eliminates shims D and E from `s0-membrane-inventory.json` (legacy session fallback, vault-root fallback) by making configuration explicit and verifiable. Reduces Track 13 extraction surface.

2. **S0 CLI: Add `epi doctor` subcommand**
   Current state: No health/dependency check. Failures surface as runtime errors in `main.rs` match arms.
   Proposed change: Add `Commands::Doctor` that checks: Rust toolchain ≥1.89, Neo4j `:7474` reachable, Redis `:6379` reachable, `EPILOGOS_ROOT` set and contains `Body/` and `Idea/`, vault dir readable, epi-lib FFI symbols loadable (`ffi::EpiLib::new()`), gateway process status, and contract-inventory parity count.
   Rationale: Borrows Hermes's `hermes doctor [--fix]` pattern. Reduces operator debugging friction. Can flag temporary-live-hosts and compatibility shims as warnings.

3. **S0 portal-core: Add `kernel_tick_scheduler` module**
   Current state: `KernelProfileObservationEvent` and `KernelTickEnvelope` exist as typed shapes but no scheduler emits them periodically. The kernel bridge runtime (`gate/kernel_bridge_runtime.rs`) fans out projection updates but requires an external trigger.
   Proposed change: Add `portal-core/src/kernel_tick_scheduler.rs` with a `KernelTickScheduler` that accepts cron-like schedules, emits `KernelTickEnvelope` per tick, and publishes to the gateway bridge. CLI surface: `epi cron observe-profile --coordinate M2-1-3 --every 30m`.
   Rationale: Closes the gap between typed contract shapes and actual data production. Borrows Hermes's cron scheduler pattern (`cron/jobs.py` + `cron/scheduler.py`).

4. **S0 contract-inventory: Add operator-facing TUI**
   Current state: `s0-membrane-inventory.json` is machine-readable but only consumed by build scripts and Track 13 planning. No operator can query it.
   Proposed change: Add `epi tools status` that reads `contract-inventory/s0-membrane-inventory.json` and renders a ratatui table: module name, classification, parity status, extraction task, allowed responsibilities. Color-code by parity: Native=green, Adapter=yellow, TemporaryLiveHost=red, Missing=white. Add `epi tools audit` that runs parity checks (is there drift between the inventory and actual files?).
   Rationale: Makes Track 13 extraction progress operator-visible. Borrows Hermes's `hermes tools` interactive TUI pattern. Uses ratatui (already a dep).

5. **S0 epi-lib: Provider abstraction layer**
   Current state: The C engine (`epi-lib/include/engine.h`, `m1.h`–`m5.h`) embeds all computation directly. There is no provider abstraction — the engine IS the computation.
   Proposed change: Add `epi-lib/include/provider.h` with a `ProviderVTable` struct (function pointers for `compute_tick`, `resolve_coordinate`, `evaluate_energy`) and a default `EngineProvider` that routes to the existing engine functions. This would allow pluggable computation backends (e.g., GPU-accelerated quaternion ops via CUDA, or a mock provider for testing) without changing downstream consumers.
   Rationale: While Epi-Logos's computation is more mathematically specific than Hermes's LLM provider abstraction, the provider pattern enables testing, benchmarking, and future hardware acceleration. The `engine_walk_by_mode` dispatcher already follows a similar pattern (mode → engine function).

## Gap (missing on either side)

1. **Gap: Epi-Logos has no REPL/slash-command system**
   Hermes's in-session command system (`/model`, `/config`, `/tools`, `/compress`, `/new`, `/reset`, `/help`, `/quit`, etc.) is a rich interactive surface. Epi-Logos operates via one-shot CLI invocations — `epi portal` opens a TUI but has no command line within the TUI. This is a deliberate architectural choice (Epi-Logos is not an AI agent framework), but it means the portal TUI can't respond to in-session commands the way Hermes's CLI can. Not a gap to close — just a recognized difference in purpose.

2. **Gap: Hermes has no coordinate-space or harmonic-tick concept**
   Hermes has no equivalent of `KernelTick`, `MathemeHarmonicProfile`, `PortalClockState`, or `Holographic_Coordinate`. Its sessions are purely temporal (timestamps) and semantic (FTS5 full-text). This is not a gap to close — Hermes serves a different purpose (general-purpose AI agent) — but it means any adoption of Epi-Logos patterns by Hermes would be additive enrichment, not replacement.

3. **Gap: Epi-Logos has no credential pool or OAuth flow**
   Hermes's `hermes auth add PROVIDER`, credential pools with rotation, and OAuth device-code flows (Nous Portal, OpenAI Codex, Qwen OAuth, GitHub Copilot) have no equivalent in Epi-Logos. The `epi code` command shells out to Claude Code which handles its own auth. This gap is medium priority — if Epi-Logos ever spawns its own LLM agents (S4' pi-agent, S5' epii-agent), it will need credential management. Hermes's `auth.json` + credential pool pattern is the reference implementation.

4. **Gap: Hermes has no parity/contract-extraction tracking**
   Epi-Logos's `s0-membrane-inventory.json` tracks 30 modules with classification, parity status, extraction tasks, and allowed S0 responsibilities. Hermes has no equivalent — there is no machine-readable record of which tools belong to core vs plugins vs MCP vs platform-specific, no extraction tasks for moving things out of `tools/` into plugins. This gap is low priority for Hermes today but would become important as the plugin ecosystem grows.

5. **Gap: Epi-Logos has no setup wizard**
   Hermes's `hermes setup [section]` interactive wizard (model, terminal, gateway, tools, agent) walks the operator through first-time configuration. Epi-Logos has no equivalent — onboarding requires reading documentation and setting env vars manually. This gap is high priority. The `epi help` system describes architecture but doesn't guide step-by-step setup. Borrowing Hermes's wizard pattern would reduce the onboarding barrier significantly.

## Verdict

S0 alignment is **asymmetric by design**: Hermes is a general-purpose AI agent framework with a deep CLI, config, provider, and toolset surface; Epi-Logos is a mathematical coordinate-system engine with a deep C/Rust kernel and a CLI adapter membrane. The most valuable adoptions are Hermes's operational polish (doctor, config set/get, setup wizard, curses tool picker) being ported to Epi-Logos's CLI surface — these are low-risk, high-impact improvements that don't touch the kernel substrate. The most valuable enrichments are Epi-Logos's contract inventory tracking (parity status, extraction tasks, ownership classification) and privacy-class-gated event envelopes — patterns Hermes could adopt as its plugin ecosystem grows. The tightest integration point is `epi doctor` + `epi config` + `epi tools status`: three new CLI subcommands that together close the operator-visible gap between Epi-Logos's rich internal contract infrastructure and its sparse external CLI surface. Recommended next step: implement `epi doctor` and `epi config` as the highest-ROI Hermes→Epi-Logos adoptions.
