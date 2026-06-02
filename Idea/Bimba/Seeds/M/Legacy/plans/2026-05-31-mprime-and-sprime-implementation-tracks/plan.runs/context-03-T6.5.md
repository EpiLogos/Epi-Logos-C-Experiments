# M-Dev Context Pack - 03.T6.5

Generated: 2026-06-02T00:17:52.634Z

## Task

- **ID:** 03.T6.5
- **Title:** S1 vault gateway surface (`s1'.vault.*` + `s1'.semantic.*`) over Hen substrate
- **Track:** 03-s3-gateway-and-spacetimedb.md
- **Computed status:** in_progress
- **Write scopes:** Body/S/S0/epi-cli/src/gate/**, Body/S/S3/**, Idea/**, Idea/Pratibimba/Nara/<day>/protected/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs`
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`
- `Body/S/S1/hen-compiler-core/src/smart_env.rs`
- `Body/S/S1/hen-compiler-core/src/wikilinks.rs`
- `Body/S/S3/epi-spacetime-module/src/lib.rs`
- `Body/S/S3/gateway-contract/src/lib.rs`
- `Body/S/S3/graphiti-runtime/src/lib.rs`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`
- `Idea/Pratibimba/Nara/<day>/protected/`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`

## Dependency Context

- 03.T6 - Graphiti runtime compatibility and temporal reference bridge (03-s3-gateway-and-spacetimedb.md)

## Track Source Specs

- [[alpha_quaternionic_integration_across_M_stack.md]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, Section 11 "Shared cosmos hosting at S3' via SpaceTimeDB", especially Section 11.1 existing repo decision, Section 11.3 WebSocket-shared gateway and SpaceTimeDB surface, Section 11.5 shared-cosmos tables, Section 11.7 milestone 1, and Section 11.8 integration gotchas.
- [[S3-SPEC.md]] - `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`, "Current code reality", "Planning consequence", "A. S3 - Gateway Control Plane Base Technology", "B. S3' - Temporal State Law", "Gaps", and "D. Key Architectural Decisions".
- [[S3-S3i-GATEWAY.md]] - `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`, Section III Two-Plane Model, Section IV parity requirement, Section VII immediate Rust architecture, Section VIII SpaceTimeDB as Universal NOW, Section XII implementation sequence, and Section XIII verification requirements.
- [[m5-prime-system-shape-and-tauri-ide-canon.md]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, Section 1.2 M5-2/M5-3/M5-4 mapping, Section 2.3 one Tauri app with shared gateway/SpaceTimeDB access, Section 5.2 kernel-bridge contribution, and Section 8 milestone 2.
- [[spacetimedb_bridge.rs]] - `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, current REST plus native WebSocket bridge, especially `subscribe_projection` around lines 603-641 and `SpacetimeProjectionSubscription::next_context` around lines 648-668.
- [[lib.rs]] - `Body/S/S3/gateway-contract/src/lib.rs`, `SpacetimeProjectionPlan` and `SubscribeMulti` construction around lines 727-822, subscription row decoding around lines 824-988, and `GraphitiAdapterContract` around lines 1299-1332.
- [[lib.rs]] - `Body/S/S3/epi-spacetime-module/src/lib.rs`, current SpaceTimeDB module tables and reducers for gateway/client/agent registration plus `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, and `TemporalEvent`.
- [[lib.rs]] - `Body/S/S3/graphiti-runtime/src/lib.rs`, current S3 Graphiti runtime compatibility adapter, VAK episode attributes, provenance, and protected-memory payload constraints.
- [[spacetime.rs]] - `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs`, current Tauri polling path and `SpacetimeMode::NativeWebSocket` stub.

## Task Body

**Tranche 6.5 - S1 vault gateway surface (`s1'.vault.*` + `s1'.semantic.*`) over Hen substrate.** (per IOD-18, IOD-19)

Deliverables:

- Add `s1'.vault.{read_file, write_file, move_file, rename_file, append_block, update_frontmatter, list_dir, watch}` gateway methods. Writes delegate to Hen — Theia and agents must NEVER write directly to the vault filesystem; the gateway is the only sanctioned write path. Reads may be either gateway-mediated (for governed/protected paths) or direct-FS via Theia's provider (for ordinary read; the gateway still owns the read contract definition).
- Add `s1'.semantic.{suggest_links, neighbors_of, search, by_block}` gateway methods wrapping [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] `suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`. The response carries typed candidates: `ExplicitOutlink`, `SemanticSource`, `SemanticBlock` with cosine scores + evidence + staleness markers.
- The `s1'.vault.write_file` / `move_file` / `rename_file` paths must invoke Hen's wikilink-integrity reconciliation: parse referring documents with [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] `parse_wikilinks`; for renames/moves, atomically update all referring `[[X]]` to `[[Y]]` across the vault; reject writes that would orphan headings or break Bimba-coordinate-anchored crossreferences with explicit error states for Theia to surface.
- Surface staleness on `s1'.semantic.*` responses: if `<vault>/.smart-env/multi/*.ajson` is older than the underlying note's mtime, mark `staleness: stale` and let consumers decide. (Future capability per IOD-18: optional Theia-side re-embedding via transformers.js or Ollama writing to the same `.smart-env/` format.)
- Privacy class enforcement: `protected` paths (e.g., raw Nara journal bodies under `Idea/Pratibimba/Nara/<day>/protected/`) are inaccessible via `s1'.vault.*` unless caller carries a governed protected capability per IOD-17 + UFV-01. Same for `s1'.semantic.*` neighbour responses — protected paths excluded from candidate lists by default.

Verification:

- Live integration test against a real fixture vault: rename a file with 5+ inbound wikilinks; assert all referring `[[X]]` updated to `[[Y]]` atomically; assert no orphaned link remains.
- Move a file across folders; assert path updates propagate; assert block-id-anchored references preserved.
- Direct-Theia-FS-write attempt against `Idea/` (bypassing gateway) must be detectable in a privacy/integrity audit run (e.g., comparing FS-mtime + git-tracked-mtime + Hen's last-write-ledger entries; surfaces unsanctioned write as a finding).
- Semantic test: call `s1'.semantic.suggest_links` for a known vault note; assert the returned candidates include known explicit outlinks plus N nearest semantic neighbours by cosine score; assert staleness flag fires when fixture `.smart-env/` is artificially aged.
- Privacy test: call `s1'.semantic.search` over a query that would match a protected Nara journal; assert protected-path candidates are excluded unless caller carries governed-protected capability.

## Track Open Decisions

- **Client-facing single WebSocket implementation.** Confirm whether the gateway must physically multiplex SpaceTimeDB deltas over the existing S3 WebSocket, or whether a single app-level connection manager may open a direct SpaceTimeDB socket internally. The alpha spec argues for one client-facing surface; current code still has separate gateway and SpaceTimeDB connection paths.
- **SpaceTimeDB auth and RLS mapping.** Decide how gateway auth/session identity maps to SpaceTimeDB `Identity` and `:sender` for local development, hosted deployment, Tauri desktop, and future mobile clients. RLS is experimental, so privacy cannot depend on RLS alone.
- **World clock source of truth.** Decide whether `advance_world_clock` is truly scheduled inside SpaceTimeDB from a gateway-fed source cache, or whether the gateway calls a reducer every tick after Kerykeion/Nara computes the authoritative state.
- **Clock cadence.** Alpha names 1 Hz as baseline and 250 ms as possible animation cadence. The implementation should choose the initial production cadence and define when surfaces may request higher-frequency interpolation.
- **Graphiti native runtime boundary.** Current code is an HTTP compatibility adapter around Graphiti. Decide whether "native/library" means embedded Python library supervision, a Rust FFI boundary, or a managed local service with a stricter S3 runtime contract.
- **Schema migration procedure.** Define how SpaceTimeDB module migrations are versioned, tested, rolled back, and gated by Tauri/Theia clients.
- **Table naming compatibility.** Decide whether legacy `m1_clock_state` or `identity_presence` remain as compatibility projections over `world_clock` and `pratibimba_presence`, or are deferred until consumers require them.
- **Subscription ownership for Theia.** Decide whether the Theia kernel-bridge owns its own S3 subscription client or receives a stream from the shared Tauri backend process.
- **Production fallback policy.** Decide whether HTTP SQL polling is ever allowed in production, and if so under what visible degraded-mode constraints.

## Decision Register Excerpt

| ID | Decision | Category | Primary affected tracks |
| --- | --- | --- | --- |
| UFV-01 | Privacy and consent copy | User-final validation | 04, 05, 06, 07, 08 |
| UFV-02 | User-final validation threshold for recursive or corpus-affecting changes | User-final validation | 04, 05, 07, 08 |
| UFV-03 | Menubar/background lifecycle semantics | User-final validation | 05, 06, 08 |
| UFV-04 | Daily-flow review interruption and default lightweight agent | User-final validation | 04, 06, 07, 08 |
| PRD-01 | ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **Resolved: Theia-only, Electron-primary (no Tauri wrapper)** | Resolved | — |
| PRD-02 | ~~Single-webview navigation versus multi-webview persistence~~ **Resolved: Theia Layout Restorer / Workspace service handles layout switching inside one process** | Resolved | — |
| PRD-03 | ~~Kernel-bridge host boundary~~ **Resolved: first-loaded Theia extension; backend module connects to external Rust gateway via WS/JSON-RPC** | Resolved | — |
| PRD-04 | ~~Theia extension API, version, package manager, and build composition~~ **Resolved: Theia 1.56 + pnpm workspaces + electron-app canonical / theia-app browser CI (ADR-05-011)** | Resolved | — |
| IOD-01 | S3 single WebSocket surface: physical multiplexing versus app-level manager | Implementation-owner | 01, 03, 05, 06, 07, 08 |
| IOD-02 | SpaceTimeDB auth/RLS and privacy discipline | Implementation-owner | 03, 04, 05, 06, 08 |
| IOD-03 | `world_clock` source of truth and cadence | Implementation-owner | 01, 03, 05, 06, 08 |
| IOD-04 | Profile versioning and `binary`/`mahamaya` compatibility | Implementation-owner | 01, 05, 06, 07, 08 |
| IOD-05 | S2 canonical `#` root mapping | Implementation-owner | 02, 05, 06, 07, 08 |
| IOD-06 | Anuttara field naming and provenance contract | Implementation-owner | 02, 04, 05, 07, 08 |
| IOD-07 | n10s/GDS packaging and GDS output persistence | Implementation-owner | 02, 05, 07, 08 |
| IOD-08 | Graphiti runtime boundary | Implementation-owner | 02, 03, 04, 05, 06, 08 |
| IOD-09 | S5 state storage and `ReviewSource` metadata | Implementation-owner | 04, 05, 06, 07, 08 |
| IOD-10 | Deep-link URI grammar and intent acknowledgement | Implementation-owner | 05, 06, 07, 08 |
| IOD-11 | Shell chrome versus individual extension ownership | Implementation-owner | 05, 07, 08 |
| IOD-12 | Observability schema ownership — **Binding (Track 08.T9, 2026-06-01)** | Implementation-owner (Resolved) | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority — **Binding spec-time (ADR-05-011 §5, Track 05.T8)** | Implementation-owner (Resolved spec-time; runtime parity follow-up) | 01, 04, 09 |
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader — **Binding (ADR-05-010 / ADR-05-011 §4)** | Implementation-owner (Resolved) | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) — **Binding (ADR-05-010 / ADR-05-011 §3); Canon Studio rejects writes until T4.5** | Implementation-owner (Resolved) | 03, 05, 07, 09 |
| DSD-01 | Live local-service harness and CI sequencing | Dependency and sequencing | 01, 02, 03, 04, 05, 06, 07, 08 |
| DSD-02 | Track 01-04 contract readiness before UI hardening | Dependency and sequencing | 05, 06, 07, 08 |
| DSD-03 | Non-dry-run promotion waits for compiler mutation law | Dependency and sequencing | 04, 05, 07, 08 |
| DSD-04 | SpaceTimeDB schema source, migration, and table compatibility | Dependency and sequencing | 01, 03, 05, 06, 08 |
| DSD-05 | Protected Nara/Graphiti substrate before M4 and 4/5/0 readiness | Dependency and sequencing | 02, 03, 04, 06, 07, 08 |
| DSD-06 | M2/M3 authority payload readiness before full 1-2-3 readiness | Dependency and sequencing | 01, 02, 07, 08 |
| DCC-01 | M0 versus M1 `+1` attribution | Deferred canon contradiction | 07, 08, M5' canon |
| DCC-02 | M3 `16+1` / "17th lens" language | Deferred canon contradiction | 07, 08 |
| DCC-03 | M2 planet count and Earth-observer semantics | Deferred canon contradiction | 07, 08 |
| DCC-04 | M4 identity quaternion naming, axis order, and 0/1 polarity | Deferred canon contradiction | 06, 07, 08 |
| DCC-05 | Audio bus and cymatic derivation ownership wording | Deferred canon contradiction | 01, 07, 08 |
| DCC-06 | Alpha section cross-reference drift | Deferred canon contradiction | 07, 08 |

### UFV-01 - Privacy and consent copy

- **Question:** What exact user-facing language explains protected-local data, derived handles, opt-in shared archetype events, audio playback consent, private projection blocks, and review visibility?
- **Why it matters:** Tracks 06 and 08 can only enforce privacy if users understand what is local, what is shared as an opaque handle, and what is explicitly published.
- **Affected tracks:** 04, 05, 06, 07, 08.
- **Options:** Minimal technical labels in readiness UI; full consent copy in `/body` plus Theia; staged consent with short prompts and inspectable detail panes.
- **Recommended default if safe:** Staged consent: concise default copy in `/body`, detailed reviewable privacy explanation in Theia/M5, and no shared archetype publishing or protected-open action without explicit user action.
- **Validation path:** Privacy-copy review by the user; UI tests that block publishing without consent; privacy audit over Tauri events, SpaceTimeDB rows, S2 payloads, S5 DTOs, observability events, workspace state, and DOM text.
- **Consequence of delaying:** M4, 4/5/0, shared archetype, audio, and review surfaces must remain in blocked or local-only mode even if backend contracts are available.

### UFV-02 - User-final validation threshold for recursive or corpus-affecting changes

- **Question:** When do Paraśakti embedding retrains, Paramaśiva corpus refreshes, Anuttara grammar changes, Mahāmāyā runtime-learning updates, Nara voice/corpus shifts, and Epii-on-Epii recursive changes require explicit user-final validation?
- **Why it matters:** S5 can encode gates, but only a user-final policy can say which changes are routine maintenance and which are canon-, identity-, or governance-affecting.
- **Affected tracks:** 04, 05, 07, 08.
- **Options:** Require human validation for all non-read-only changes; require it only for promotion/mutation; require it by target-specific risk class.
- **Recommended default if safe:** Use target-specific risk classes with a conservative rule: any recursive self-modification, deployment gate, protected-personal corpus change, canon publication, or model/profile behavior change that affects future outputs requires human approval.
- **Validation path:** S5 tests proving agents may defer but cannot approve/reject/revise/promote human-required items; review fixtures for each target subsystem; user acceptance of the gate taxonomy.
- **Consequence of delaying:** S5 dry-run promotion can exist, but operational M5-4 actions must stay read-only or deposit-only.

### UFV-03 - Menubar/background lifecycle semantics

- **Question:** What should close, quit, sleep, wake, auto-start, notification permission, global hotkey conflict, crash recovery, and "IDE closed but `/body` lives" mean to the user?
- **Why it matters:** The one-app/two-surface law depends on user trust that the app is neither secretly running too much nor losing session state when the IDE is summoned or dismissed.
- **Affected tracks:** 05, 06, 08.
- **Options:** Always quit on close; minimize to tray by default; ask once and persist preference; expose explicit "sleep app" and "quit app" commands.
- **Recommended default if safe:** Ask once on first close after IDE summon, persist the preference, and always expose visible connection/readiness state plus explicit sleep and quit commands.
- **Validation path:** Desktop e2e for close/foreground/background/wake flows; bridge subscription upgrade/downgrade tests; reconnect tests after gateway/SpaceTimeDB restart while backgrounded.
- **Consequence of delaying:** Track 06 T7 and deep-link/session continuity cannot be finalized, and multi-webview behavior remains only a prototype claim.

### UFV-04 - Daily-flow review interruption and default lightweight agent

- **Question:** Which actor appears in Shell `1` by default, and which review alerts interrupt daily flow versus staying passive?
- **Why it matters:** `/body` must not imply an agent governance model that S5 has not implemented, and review notifications can become either useful safety signals or ambient noise.
- **Affected tracks:** 04, 06, 07, 08.
- **Options:** Default to Nara; default to Anima; default to Epii; use a neutral "agent check-in" affordance that routes after S5/gateway context is known. Alerts may be all passive, priority-based, or always interrupting for human-required gates.
- **Recommended default if safe:** Neutral "agent check-in" entry with S5-routed actor resolution, and priority-based alerts where human-required/security/privacy/deployment gates can interrupt while routine evidence stays passive.
- **Validation path:** S5 DTO tests for alert category/priority; `/body` UX tests for passive versus interrupting alerts; human-gate tests proving no agent approval affordance appears for human-required reviews.
- **Consequence of delaying:** Shell `1` can show safe review counts and readiness, but should not expose default agent promises or interruption behavior as final UX.

### PRD-01 - ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **RESOLVED**

- **Resolution:** Theia-only as THE shell. No Tauri wrapper. Electron is canonical desktop deployment (confirmed by Theia documentation and ecosystem reference architectures — Gitpod, Eclipse Che, Coder); browser-mode is built from the same Theia codebase and optionally containerised per the canonical `theiaide` Docker pattern for headless/CI/shared deployment. Decision recorded in `m5-prime-system-shape-and-tauri-ide-canon.md` §0 thesis points 2-3, §2-§3.
- **What this collapses:** Tauri composition prototype (Track 05 T2); single-vs-multi-webview question across surfaces (PRD-02); kernel-bridge host hybrid question (PRD-03); CSP-in-Tauri-webview verification; deep-link URL-scheme cross-app routing.
- **What remains:** Electron build configuration (electron-builder for Squirrel/AppImage/dmg distributions); optional Docker browser-mode build for CI. **No strategic VS Code Extension API borrows currently committed** — the earlier `obsidian-md-vsc` borrow was reversed once research surfaced that the extension is an Obsidian-app remote-control shim (via Advanced URI) not a vault renderer, requires a running Obsidian, and does not render wikilinks / parse vault structure / serve Smart Connections. S1 vault reach is now filesystem-direct-read + Hen-gateway-write per IOD-19; Smart Connections via Hen `smart_env.rs` per IOD-18.

### PRD-02 - ~~Single-webview navigation versus multi-webview persistence~~ **RESOLVED**

- **Resolution:** Obviated by PRD-01. Single Theia process, two workspace layout modes (0/1 daily + deep IDE), switched via Theia's built-in `Layout Restorer` / `Workspace` service. No cross-webview persistence problem because there's no webview-across-apps split. Inside the deep IDE layout, Theia handles its own multi-pane / multi-editor / multi-window UX natively.

### PRD-03 - ~~Kernel-bridge host boundary~~ **RESOLVED**

- **Resolution:** Kernel-bridge is a first-loaded Theia extension. Its frontend module publishes `KernelBridgeAPI` through Theia DI to all M-extensions and integrated plugins. Its backend module connects to the external [[Body/S/S3/gateway]] Rust process via WebSocket/JSON-RPC (the canonical Theia pattern for backend services — same as every LSP integration). Both the 0/1 daily layout and the deep IDE layout share the same bridge instance because there is one Theia process. The Rust gateway is the substrate-of-substrate and stays where it is; the bridge is the thin TS proxy.
- **What this resolves:** No Tauri-singleton hybrid; no cross-process subscription multiplexing; no `/body`-vs-Theia bridge-host ambiguity; one subscription source fans out via Theia DI inside one process. Language divergence stays at the substrate boundary (TS at shell, Rust + C in gateway/kernel).

### PRD-04 - ~~Theia extension API, version, package manager, and build composition~~ **RESOLVED**

- **Status (as of 2026-06-01):** Resolved by [ADR-05-011](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md) (release-gate close), anchored on ADR-05-005 (Theia 1.56 + pnpm workspaces) and ADR-05-006 (electron-app canonical + theia-app browser-mode for CI/Docker parity). All workspace packages green under `pnpm -r build`; 16+ extension chunks in the 21+ MB smoke-build bundle; 42/42 cross-extension tests passing. The Tauri-build-composition strand of the question is obviated (no Tauri wrapper) — see also the consolidated PRD-01..03 resolutions and `Body/M/epi-tauri/DEPRECATED.md`.
- **Question:** Which Theia release, extension API style, package manager, and Tauri build composition are production for `/pratibimba/system`?
- **Why it matters:** All six individual extensions and two integrated plugins depend on a stable build and contribution model before package skeletons, activation tests, and CI can be meaningful.
- **Affected tracks:** 05, 07, 08.
- **Options:** Recent stable Theia with Theia-native extensions; VS Code Extension API for compatibility; Yarn workspaces per Theia convention; `pnpm` per repo convention; isolated package manager; bundled static assets or supervised local server.
- **Recommended default if safe:** Recent stable Theia, Theia-native extensions for `kernel-bridge` and M surfaces, in-tree `Idea/Pratibimba/System/extensions`, and a package-manager choice made by the Tauri/Theia prototype rather than assumed.
- **Skill-vs-tool invariant (from VAK-as-Operational-Substrate landing):** Within the agent-capability layer (`Body/S/S4/plugins/pleroma/capability-matrix.json`), `vak_profile` is a skill-level concept: every `skills[]` entry has a matching `skills/<name>/SKILL.md` directory enforced by `test_matrix_maps_real_agents_skills_and_hooks`. `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`. Theia extensions hosting skills (under `Idea/Pratibimba/System/extensions/*/skills/*/SKILL.md`) inherit this invariant; new agent capabilities added through Theia extensions must respect skill-vs-tool distinction at matrix-authoring time. See `IOD-17` for the broader governance authority.
- **VS Code Extension API borrows — none currently committed.** Theia's dual-extension-API capability remains as an escape hatch but the earlier `obsidian-md-vsc` borrow was reversed (not a vault renderer; see IOD-19). M-extensions + integrated plugins + kernel-bridge + Canon Studio markdown editor + smart-connections-bridge sidebar + bimba-coordinate file-tree are all Theia-native. Future borrows must show clear ecosystem value before adoption.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
