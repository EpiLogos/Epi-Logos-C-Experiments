# Open Architectural Decisions Register For M'/S' Implementation Tracks

This register consolidates the open architectural decisions surfaced across Tracks 01-08 and the M5'/alpha canon. It is a build-control artifact: each item names the decision still needed, why it matters, which tracks are blocked or shaped by it, the viable options, the safest default where the sources support one, the validation path, and the cost of leaving it unresolved. Defaults here are implementation defaults, not canon rewrites.

## Recent resolutions log (as of 2026-06-01)

The Track 05/06/07/08 parallel pass closed or hardened the following entries. Per-entry status lines below carry the citation; this log is the index.

- **PRD-01, PRD-02, PRD-03, PRD-04** — Resolved by [ADR-05-011 release-gate close](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md) (Thread A, 2026-06-01T22:20Z) anchored on ADRs 05-001..010. Track 05 T9 release gate closed: `pnpm -r build` green; 42/42 extension tests passing (`@pratibimba/ide-shell-m0-m5` 17/17 + `@pratibimba/agentic-control-room` 14/14 + `@pratibimba/acceptance-harness` 11/11); 21+ MB smoke-build bundle; substrate `cargo test --offline` 6/6 (`epii-review-core`) + 19/19 (`epii-autoresearch-core`). Evidence: `plan.runs/20260601T215100Z-05-T4.json`, `20260601T220500Z-05-T8.json`, `20260601T222000Z-05-T9.json`.
- **IOD-12** (Observability schema ownership) — Binding per Thread C's release-gate decision tree at Track 08.T9 (`plan.runs/08-t9-perf-a11y-privacy-report.md`). The integrated-composition release-gate module is the canonical schema host; privacy/perf/a11y test suites (`extensions/test/privacy-audit/forbidden-fields.test.mjs`, `perf/budgets.test.mjs`, `a11y/coverage.test.mjs`, `release-gate/decision-tree.test.mjs`) consume one shared schema and 18 forbidden keys × 6 surfaces = 108 placements all block release.
- **IOD-17** (capability-matrix three-way parity) — Live as spec-time assertion in `extensions/agentic-control-room/tests/run-flow.test.mjs::parity over the real capability-matrix.json` plus `Body/S/S3/gateway/tests/dispatch_contract.rs` (gateway side) and `tests/canon-studio-save-routing.test.mjs` plus `tests/contract.test.mjs` in `@pratibimba/ide-shell-m0-m5` (UI side). Three-way parity (matrix ↔ UI ↔ gateway) verified across 42/42 tests. Live runtime parity check still recommended (Thread A finding #2 — expose `s4'.mediation.capabilities.list` on the gateway).
- **IOD-18** (Smart Connections via Hen `smart_env.rs`) — Binding per [ADR-05-010](../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md) and ADR-05-011 §4. No client-side Obsidian plugin coupling; semantic-neighbours route through Hen-gateway `s1'.semantic.*` (gated on Track 03 T6.5).
- **IOD-19** (Hen vault-write gatekeeper) — Binding per ADR-05-010 and ADR-05-011 §3. Canon Studio routes every save through `vault-bridge.s1prime.vault.write_file`; until T4.5 lands the vault-bridge extension, saves are rejected with the canonical reason `no vault-bridge registered` — verified by `tests/canon-studio-save-routing.test.mjs::vault-bridge write throws "no vault-bridge registered" before T4.5`.

The remaining entries (IOD-01..14 except IOD-12, all UFV, DSD, and DCC entries) remain open as recorded below.

## Goal

Keep every unresolved implementation-shaping choice visible before engineering work hardens around it. This register gives each decision an owner category, affected tracks, safe default where the sources support one, validation path, and consequence of delay, so teams can proceed behind explicit readiness seams instead of silently resolving canon, privacy, runtime, or substrate questions.

## Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, especially sections 1.2, 3, 4, 5, 8, and 9.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, especially sections 4, 8, 10, 11, and 12.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, especially section 11.
- [[M'-SYSTEM-SPEC]], [[M'-PORTAL-SPEC]], [[M'-TAURI-PORT-SPEC]], and [[M0'-SPEC]] through [[M5'-SPEC]] under `Idea/Bimba/Seeds/M/`.
- [[01-kernel-bridge-and-s0-foundation]] through [[10-cross-cutting-integration-and-milestones]] in this plan folder.

## Tranches

- **Decision wave 0 - Prototype gates:** Resolve or explicitly defer `PRD-01` through `PRD-04` before Theia runtime, bridge ownership, and extension APIs harden. **Status (2026-06-01): PRD-01..04 all resolved by ADR-05-011; this wave is closed.**
- **Decision wave 1 - Substrate contracts:** Resolve `IOD-01` through `IOD-09` before live S0/S2/S3/S5 substrate claims become downstream dependencies.
- **Decision wave 2 - Surface and composition contracts:** Resolve `IOD-10` through `IOD-14`, `IOD-17`, `IOD-18`, and `IOD-19` before deep links, shell chrome, observability, Nara write paths, agent-tool governance extensions, integrated plugin composition, vault semantic-index surfaces, and vault-write paths freeze.
- **Decision wave 3 - User-final validation:** Resolve `UFV-01` through `UFV-04` before privacy, review interruption, background lifecycle, recursive/corpus-affecting changes, or default lightweight agents become user-facing production behavior.
- **Decision wave 4 - Deferred canon contradictions:** Carry `DCC-01` through `DCC-06` as visible provenance/readiness notes until canon review or user-final validation resolves them.

## Dependencies

- Prototype-resolved decisions gate Tracks 05-08 and also shape the Track 01/03 bridge and stream contracts.
- Implementation-owner decisions gate the concrete APIs and schemas in Tracks 01-04 before dependent M5-3 and M5-4 work can claim production readiness.
- User-final-validation decisions gate privacy-sensitive M4/Nara/4/5/0 behavior, review interruption, background lifecycle, and recursive/corpus-affecting operational authority.
- Dependency-and-sequencing decisions define what may proceed in degraded/readiness-blocked mode versus what must wait for live upstream substrate.

## Open Decisions

The decision index and grouped entries below are the active open-decision set for this implementation program.

## Decision Index

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

## User-Final-Validation Required

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

## Prototype-Resolved Decisions

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

## Implementation-Owner Decisions

### IOD-01 - S3 single WebSocket surface: physical multiplexing versus app-level manager

- **Question:** Must the gateway physically multiplex SpaceTimeDB deltas over the existing S3 WebSocket, or may a single app-level connection manager open a direct SpaceTimeDB socket internally while presenting one client-facing surface?
- **Why it matters:** The alpha canon argues for one observable pipeline; current code still has separate gateway and SpaceTimeDB paths. The answer shapes reconnect, gap detection, privacy filtering, and client API complexity.
- **Affected tracks:** 01, 03, 05, 06, 07, 08.
- **Options:** Physical gateway WebSocket multiplexing; app-level connection manager with internal direct SpaceTimeDB socket; temporary dual sockets hidden behind explicit degraded state.
- **Recommended default if safe:** One client-facing manager is mandatory; physical multiplexing is preferred if it preserves gateway auth/privacy and parity, but an internal direct SpaceTimeDB socket is acceptable only if clients still see one ordered, versioned stream with readiness/gap metadata.
- **Validation path:** Gateway parity tests; native subscription tests; reconnect/gap sequence tests; `/body` and Theia consumers prove they use one stream contract.
- **Consequence of delaying:** Frontends may accidentally bind to divergent streams, making world-clock, review, and profile generation reconciliation fragile.

### IOD-02 - SpaceTimeDB auth/RLS and privacy discipline

- **Question:** How do gateway auth/session identity, Tauri desktop identity, future mobile identity, SpaceTimeDB `Identity`, and `:sender` map, given RLS is experimental?
- **Why it matters:** Privacy cannot depend on RLS alone, and SpaceTimeDB reducers can see all module tables. The canon requires bodies to stay local/protected and rows to carry only quaternionic state or opaque handles.
- **Affected tracks:** 03, 04, 05, 06, 08.
- **Options:** Direct OIDC-to-SpaceTimeDB identity; gateway-mediated identity binding; local dev identity shim; RLS plus application-level filtering; opaque-reference-only rows with client-side decryption for protected content.
- **Recommended default if safe:** Gateway-mediated identity binding plus opaque-reference-only SpaceTimeDB rows; use RLS as defense-in-depth, not as the privacy boundary.
- **Validation path:** RLS/visibility tests for `pratibimba_presence` and `coincidence`; privacy tests proving no private body text enters tables; multi-device identity tests; hosted/local dev auth matrix.
- **Consequence of delaying:** Shared-cosmos tables can be prototyped, but protected presence, coincidence, and M4/4/5/0 flows must remain non-production.

### IOD-03 - `world_clock` source of truth and cadence

- **Question:** Is `world_clock` advanced by a scheduled SpaceTimeDB reducer reading gateway-fed Kerykeion/Nara cache, or does the gateway compute authoritative state and call a reducer every tick? What is the initial production cadence?
- **Why it matters:** The answer controls determinism, load, latency, client interpolation, and whether surfaces may display 250 ms animation without claiming new authoritative ticks.
- **Affected tracks:** 01, 03, 05, 06, 08.
- **Options:** SpaceTimeDB scheduled `advance_world_clock` at 1 Hz; gateway-called reducer after authoritative Kerykeion/Nara computation; hybrid source cache with reducer upsert; 250 ms authoritative cadence; 250 ms display-only interpolation.
- **Recommended default if safe:** 1 Hz authoritative `world_clock` with protocol-versioned rows; allow 250 ms visual interpolation only as display state carrying the last authoritative generation.
- **Validation path:** Ten-subscriber live test observing same tick within +/-30 ms; protocol-version compatibility tests; render tests proving interpolation never mutates profile/world-clock authority.
- **Consequence of delaying:** 1-2-3 visuals, `/body` graph/clock composition, and integrated plugin cadence cannot make production claims.

### IOD-04 - Profile versioning and `binary`/`mahamaya` compatibility

- **Question:** What formal schema version, migration policy, compatibility window, and naming rule govern `MathemeHarmonicProfile`, especially current `binary` fields versus spec-preferred `mahamaya`?
- **Why it matters:** M2/M3 review and 1-2-3 synchronization depend on stable profile fields, and frontends must not invent local aliases that drift from S0/S0'.
- **Affected tracks:** 01, 05, 06, 07, 08.
- **Options:** Hard rename to `mahamaya`; dual-field compatibility window; nested versioned `mahamaya` object with legacy projection; readiness-block old clients.
- **Recommended default if safe:** Versioned profile schema with canonical `mahamaya`, legacy `binary` compatibility projection for a bounded window, and explicit readiness when a consumer expects an unavailable field.
- **Validation path:** Schema tests over S0/Rust/TS payloads; migration fixtures; `/body` and Theia contract tests proving no renderer-local aliasing; readiness tests for pending LUT/private/provisional fields.
- **Consequence of delaying:** M2/M3, 1-2-3, and review evidence must keep compatibility shims and cannot finalize payload contracts.

### IOD-05 - S2 canonical `#` root mapping

- **Question:** How is legacy/root `#` represented after `#0..#5` map into `M0..M5`, given current seed code preserves `#` while import/API paths migrate `#` to `M`?
- **Why it matters:** Coordinate search, M0 root display, S2 identity constraints, graph imports, MCP surfaces, and extension deep links must resolve the same coordinate to the same graph fact.
- **Affected tracks:** 02, 05, 06, 07, 08.
- **Options:** Preserve `#` as a source/root node; map `#` to `M` everywhere; keep `#` as alias only; store both with explicit relation.
- **Recommended default if safe:** Preserve `#` as source-condition/root provenance while canonical M-family coordinates drive API responses and UI selection; expose alias/provenance explicitly.
- **Validation path:** Live Neo4j import/API/MCP tests resolving `#`, `#0..#5`, and `M0..M5`; uniqueness constraints; UI tests showing provenance rather than silent rewrite.
- **Consequence of delaying:** S2 population, M0 search, deep links, and integrated 4/5/0 graph backdrop risk divergent coordinate identities.

### IOD-06 - Anuttara field naming and provenance contract

- **Question:** Are Anuttara storage fields public aliases such as `symbol` and `complete_formulation`, or coordinate-prefixed registry keys such as `c_1_symbol` and `c_1_complete_formulation`?
- **Why it matters:** S2 owns graph storage/provenance while M0/M5 may display friendly aliases. Mixing those layers breaks schema validation and review evidence.
- **Affected tracks:** 02, 04, 05, 07, 08.
- **Options:** Store aliases directly; store coordinate-prefixed canonical keys; store canonical keys with display alias mapping; defer fields behind readiness.
- **Recommended default if safe:** Store coordinate-prefixed canonical keys in S2 and expose display aliases through S2/M0 DTOs with provenance.
- **Validation path:** Schema registry tests; dataset import tests; M0 Anuttara inspector tests; S5 Anuttara improvement evidence proving storage key and display alias are both traceable.
- **Consequence of delaying:** M0 and Anuttara review surfaces must remain read-only/degraded for language fields.

### IOD-07 - n10s/GDS packaging and GDS output persistence

- **Question:** Are n10s and GDS installed in the default local Neo4j service, optional profiles, or separate ontology/GDS services, and are GDS outputs stored as derived graph data, ephemeral overlays, or both?
- **Why it matters:** M0/M5 ontology views, 4/5/0 BEDROCK/GDS overlays, recommendations, and graph doctor readiness depend on honest plugin availability and non-canonical treatment of derived recommendations.
- **Affected tracks:** 02, 05, 07, 08.
- **Options:** Default Neo4j image includes APOC+n10s+GDS; optional live-test profile; separate services; derived properties persisted; ephemeral API overlays; hybrid with explicit derived namespace.
- **Recommended default if safe:** Optional profile with doctor/readiness reporting for n10s/GDS, canonical Option 1 first, and GDS outputs as ephemeral overlays unless deliberately persisted in a derived namespace.
- **Validation path:** Live `CALL dbms.procedures()`/projection checks; doctor tests for blocked state; GDS overlay API tests; privacy tests proving recommendations do not become canonical relations automatically.
- **Consequence of delaying:** 4/5/0 and graph-enhanced M0/M5 surfaces must show GDS unavailable/pending rather than render recommendation claims.

### IOD-08 - Graphiti runtime boundary

- **Question:** Does Graphiti run as an embedded Python library, Rust FFI boundary, managed local service, or HTTP compatibility adapter, and what handles may cross into S2/S3/S5 before review?
- **Why it matters:** Graphiti memory is protected/personal context, not canonical S2 topology. Runtime placement determines privacy, availability, test harnesses, and agent capability boundaries.
- **Affected tracks:** 02, 03, 04, 05, 06, 08.
- **Options:** Keep HTTP compatibility adapter; supervise embedded Python; Rust FFI; managed local service with strict S3 contract; S2 stores only safe reviewed handles.
- **Recommended default if safe:** Managed local service or compatibility adapter behind S3/S5 boundaries, with S2/S3 carrying only safe handles/summaries and never raw Graphiti bodies.
- **Validation path:** Graphiti deposit/search integration tests; privacy scans over S2/S3/S5; readiness declines when runtime unavailable; tests proving Epii does not treat Graphiti memory as S2 graph fact.
- **Consequence of delaying:** M4/Nara, protected evidence, and 4/5/0 recognition flows remain handle-only or blocked.

### IOD-09 - S5 state storage and `ReviewSource` metadata

- **Question:** Should extended S5 state remain multiple JSON files under the current root or move to an embedded store, and should `ReviewSource` gain Sophia/Pi/Epii/Nara variants or keep rich identity in actor/governance metadata?
- **Why it matters:** S5 must persist route queues, continuity, review state, orchestration records, and source identity without breaking backward compatibility or creating fake review counts.
- **Affected tracks:** 04, 05, 06, 07, 08.
- **Options:** JSON files with migration discipline; embedded store; coarse `ReviewSource` plus metadata; expanded enum variants; hybrid storage migration after schema stabilizes.
- **Recommended default if safe:** Keep JSON-backed compatibility for first production slice, add governance/actor metadata before exploding enum variants, and define a migration seam to embedded storage when route/orchestration scale demands it.
- **Validation path:** Real filesystem-backed S5 tests; legacy migration fixtures; DTO/gateway tests for M5-3; review transition tests for human-required gates.
- **Consequence of delaying:** IDE review panes can show only minimal current S5 state, and route/continuity claims should be marked provisional.

### IOD-10 - Deep-link URI grammar and intent acknowledgement

- **Question:** What canonical grammar covers internal Tauri events, command-palette intents, OmniPanel actions, and external OS URL schemes such as `epi://` or `epi-logos://`?
- **Why it matters:** `/body`, Theia, M-extensions, integrated plugins, and review/evidence flows all pass coordinate, artifact, review, source, DAY/NOW, session, profile generation, privacy class, and requested action through deep links.
- **Affected tracks:** 05, 06, 07, 08.
- **Options:** Internal-only `DeepLinkIntent`; external `epi://`; external `epi-logos://`; plugin-specific paths; typed intent envelope with URI parser adapters.
- **Recommended default if safe:** Typed `DeepLinkIntent` as canonical internal model, with URI adapters for `epi-logos://ide/...`; every target returns accepted, rejected, unsupported, readiness-blocked, or privacy-denied.
- **Validation path:** Parser/serializer round-trip tests; Tauri/Playwright deep-link e2e; privacy tests proving raw protected body text is excluded; acknowledgement tests against at least one real Theia receiver.
- **Consequence of delaying:** Cross-surface summon can exist only as local commands, not as stable review/source/artifact routing.

### IOD-11 - Shell chrome versus individual extension ownership

- **Question:** Which commands/views belong to always-available `ide-shell-m0-m5` chrome, and which belong to deep `m0-anuttara` and `m5-epii` extensions?
- **Why it matters:** The canon places Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, and Logos Atelier in IDE chrome, while Track 07 must also build deep M0/M5 extensions. Duplicate graph/review ownership would create competing truth surfaces.
- **Affected tracks:** 05, 07, 08.
- **Options:** Shell owns all M0/M5; individual extensions own all deep surfaces; shell owns navigation/chrome while individual extensions own deep engagement; shared widgets with single data authority.
- **Recommended default if safe:** Shell owns always-available navigation, quick graph/canon/agent/review entry, and layout chrome; `m0-anuttara` and `m5-epii` own deep language/review/spine engagement; shared widgets consume the same bridge/S5 state.
- **Validation path:** Command/view inventory before build; Theia activation tests with no duplicate central ownership; UI tests proving one review queue and one coordinate selection authority.
- **Consequence of delaying:** Track 07 and Track 08 may implement overlapping panes that later require churn.

### IOD-12 - Observability schema ownership — **RESOLVED (Binding)**

- **Status (as of 2026-06-01):** Binding per Thread C's Track 08.T9 release-gate audit (`plan.runs/08-t9-perf-a11y-privacy-report.md`). Canonical schema lives in `Idea/Pratibimba/System/extensions/integrated-composition/lib/common/release-gate.js` (`INTEGRATED_PERFORMANCE_BUDGETS`, `INTEGRATED_ACCESSIBILITY_EXPECTATIONS`, the privacy-audit forbidden-keys set, and the alpha/beta/production/blocked decision tree). 99/99 `pnpm -r test:contracts` pass against this schema; 18 forbidden keys × 6 surfaces × test enforcement = 108 placements blocking release on any violation. The Track 01 bridge/Track 04 S5 split recommended in the original default is preserved (Track 01 owns transport envelope; Track 04 owns review/autoresearch meaning) and the integrated-composition module is the registration surface.
- **Question:** Does the canonical observability event schema live in Track 01 `kernel-bridge`, Track 04 S5, a shared gateway contract, or individual extension packages?
- **Why it matters:** Kernel-bridge observations feed S5 autoresearch, extension evidence, readiness reports, and M5-4 actions. If each surface invents events, review evidence cannot be compared or routed.
- **Affected tracks:** 01, 04, 05, 06, 07, 08.
- **Options:** Bridge-owned event schema; S5-owned event schema; gateway-contract package; extension-local events mapped later.
- **Recommended default if safe:** Shared bridge/S5 contract: Track 01 owns transport/runtime event envelope and Track 04 owns review/autoresearch meaning, with extension event families registered against that schema.
- **Validation path:** Schema tests for events carrying source extension, coordinate context, profile generation, privacy class, readiness state, and evidence handles; S5 intake tests for bridge observations.
- **Consequence of delaying:** Autoresearch surfacing and cross-extension evidence remain ad hoc and should not drive promotion planning.

### IOD-13 - Nara vault/write service ownership

- **Binding note (2026-06-02):** The canonical archive root for Day/NOW/session history is `Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`, matching the existing vault topology and the live `Idea/Pratibimba/Self/Action/History/2026/.gitkeep` scaffold. `Idea/Empty/Present/` remains the temporal working window, not the archive: runtime rotation must keep exactly the active Day plus the immediately previous Day available in `Present` for task/file crossover, while days older than that are materialized under `History/{YYYY}/{MM}/{DD}/`. Archival handles, not protected bodies, are what S3/Gateway, S4/Pi, S5 review/autoresearch, M4 Nara, M5 Library, and Graphiti-facing surfaces exchange.
- **Question:** Which service writes Nara artifacts, day episodes, highlights, dreams, oracle artifacts, Graphiti episodes, and protected handles: Theia service, Tauri Rust command, S3 gateway method, or hybrid `nara-vault-service`?
- **Why it matters:** Shell `1`, `m4-nara`, S5 deposits, and 4/5/0 recognition must share DAY/NOW/session/profile/privacy lineage and protected-local guarantees.
- **Affected tracks:** 03, 04, 05, 06, 07, 08, 09, 10.
- **Options:** Tauri Rust vault commands; Theia service; S3 gateway method; hybrid service with local protected store and gateway/S5 deposit handles.
- **Recommended default if safe:** Hybrid local-first `nara-vault-service` behind Theia adapter and S3/Gateway session APIs, with Hen/S1' enforcing path soundness. It writes Day/NOW artifacts in `Empty/Present/{DD-MM-YYYY}/`, snapshots archive material to `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`, keeps only active+previous Day in `Present`, and exposes archive handles/envelopes to S3/S5/M surfaces according to privacy class.
- **Validation path:** Filesystem-backed vault tests in temp canonical layout; rotation tests proving active+previous days remain in `Present` and older days land in `History/{YYYY}/{MM}/{DD}/`; Graphiti handle integration tests; S5 deposit envelope tests; Gateway/Pi session lineage tests; privacy scans for protected bodies.
- **Consequence of delaying:** Shell `1` and M4 can create local drafts, but cross-day continuity, night handover, cross-surface review/deep-link, M5 Library recall, and 4/5/0 recognition cannot be considered production.

### IOD-14 - Plugin activation, composition, and mini-mode model

- **Question:** Are integrated plugins named workspace layouts, command-opened meta-views, or both, and who arbitrates center-stage, mini-inspector, audio, selection, and evidence-panel ownership?
- **Why it matters:** Track 08 composes Track 07 contributions. Without a composition contract, individual extensions and integrated plugins can fight over screen real estate, audio sinks, selection authority, and state persistence.
- **Affected tracks:** 05, 07, 08.
- **Options:** Workspace-mode only; command-view only; both; composition orchestration inside each plugin; shared `integrated-composition` service; shell-owned arbitration.
- **Recommended default if safe:** Both command entry and named workspace layouts, mediated by a shared composition/layout service that grants center-stage or mini-mode explicitly.
- **Validation path:** Layout claim contract tests; Theia command/layout e2e; conflict tests; persistence tests proving protected bodies are not stored in workspace state.
- **Consequence of delaying:** Integrated plugins can only be planned as isolated pages, not composable M5-3 workbench surfaces.

### IOD-17 - `capability-matrix.json` as canonical agent-tool governance authority — **RESOLVED (Binding spec-time)**

- **Status (as of 2026-06-01):** Binding per [ADR-05-011 §5](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md). Three-way parity (matrix ↔ UI ↔ gateway) is enforced as spec-time assertion in `extensions/agentic-control-room/tests/run-flow.test.mjs::parity over the real capability-matrix.json` (14/14 passing), `extensions/ide-shell-m0-m5/tests/contract.test.mjs` (17/17 passing, including real capability-matrix.json parse + dispatch_tools/skills surfacing), and gateway-side `Body/S/S3/gateway/tests/dispatch_contract.rs`. Gate-vs-dispatch distinction and `upstream_required: ["vak-evaluate"]` invariants verified. **Follow-up still recommended:** expose `s4'.mediation.capabilities.list` (or equivalent) on the gateway so parity becomes a live runtime check rather than spec-time only — flagged in Thread A finding #2 (`plan.runs/20260601T220500Z-05-T8.json`).
- **Question:** Where does canonical authority for agent tool surfaces (which tools each agent carries, which tools are gate-only, which require upstream VAK evaluation) live, and how is drift between matrix / runtime / agent.md prevented?
- **Why it matters:** Per the VAK-as-Operational-Substrate landing (`docs/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`, all 10 chips closed including the final parity test at commit `a664b51`), `Body/S/S4/plugins/pleroma/capability-matrix.json` carries `agent_capability_gates` (per-agent tool surfaces), `dispatch_tools[]` (with `upstream_required: ["vak-evaluate"]` invariants), and is enforced as canonical against the runtime `animaDefaultTools` and `Body/S/S4/pi-agent/agents/anima.md` frontmatter by `test_agent_capability_gates_anima_tools_matches_anima_md_tools`. Tracks 01 / 04 / 09 all touch agent-tool governance and must not invent parallel authorities. The gate-vs-dispatch distinction is operationally load-bearing: `nous_disclose` is gate-only (capability-matrix governance, not a dispatch tool); `dispatch_*` tools are gated on real prior VAK evaluation, not advisory.
- **Affected tracks:** 01 (Tranche 7 observability event schema + canonical-prefix VAK keys), 04 (Tranche 1 typed schema including `closure_kind` and `CT4a`/`CT4b`), 09 (entire mediation surface).
- **Options:** Matrix as sole authority with mirror views (anima.md + runtime defaults); matrix as primary with runtime as authoritative for execution; matrix and runtime as co-equal with periodic reconciliation; matrix as documentation only.
- **Recommended default if safe:** Matrix is sole canonical governance authority. The three-way parity test (`test_agent_capability_gates_anima_tools_matches_anima_md_tools`) is the enforcement mechanism. `anima.md` frontmatter `tools:` and runtime `animaDefaultTools` are mirror views — any drift from the matrix fails CI immediately. Gate-vs-dispatch distinction preserved: gate-only tools (e.g., `nous_disclose`) appear in `agent_capability_gates.*.tools` but not in `dispatch_tools[]`; dispatch tools appear in both, each carrying `upstream_required: ["vak-evaluate"]`. The `vak_profile` field is a skill-level concept attached to `skills[]` entries (each with a matching `skills/<name>/SKILL.md` per `test_matrix_maps_real_agents_skills_and_hooks`); `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`.
- **Validation path:** Extend `test_capability_matrix.py` to cover any new gate/dispatch entries added by Tracks 01/04/09; verify the existing three-way parity test remains green; verify M5-4 governance metadata extensions (Track 09 T2) preserve gate-vs-dispatch distinction and `upstream_required` invariants; verify Track 01 Tranche 7 observability events carry canonical-prefix VAK keys and dispatch-tool lineage; verify Track 04 typed candidate schema honours `closure_kind` discriminator (C4 chip, `d1c89ab`) and `CT4a`/`CT4b` distinction (E1↔E2 chip, `9abc13f`).
- **Consequence of delaying:** Tracks 01 / 04 / 09 risk inventing parallel agent-tool surfaces that drift from the test-locked parity. Future agents added without matrix-first authoring break the three-way parity test and silently expand the authority surface.

### IOD-18 - Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader — **RESOLVED (Binding)**

- **Status (as of 2026-06-01):** Binding per [ADR-05-010](../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md) (Hen vault-bridge architecture) and [ADR-05-011 §4](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md) (release-gate close). `Body/S/S1/hen-compiler-core/src/smart_env.rs` is canonical substrate; semantic-neighbours surface through Hen-gateway `s1'.semantic.{suggest_links,neighbors_of,search,by_block}` consumed via the `vault-bridge` Theia extension. No client-side Obsidian plugin coupling. ADR-05-008 (`obsidian-md-vsc`) is superseded. The `s1'.semantic.*` gateway methods themselves remain gated on Track 03 T6.5 — that delivery is the live-runtime hardening of this resolved decision.
- **Question:** What is the canonical substrate for vault semantic-neighbour retrieval inside Theia (and inside the agent layer), and how does it interact with the user's existing Obsidian + Smart Connections workflow?
- **Why it matters:** Vault-semantic search is foundational for M5-0 Library / Gnostic Namespace retrieval, M5-5 Logos Atelier constellations, Canon Studio wikilink autocompletion, and agent retrieval pools across Anuttara language work + Paramaśiva CPT/RAG + Logos archaeology. Re-implementing it would (a) duplicate substrate already in production at `Body/S/S1/hen-compiler-core/src/smart_env.rs` (614 LOC, reads `<vault>/.smart-env/multi/*.ajson` and returns typed `LinkCandidateResponse`), (b) require the user to maintain two semantic indices that drift, and (c) ignore the user's existing local-BGE-micro-v2 embedding workflow inside Obsidian (Smart Connections v4.1.7, no API keys, no external server, on-device).
- **Why earlier `obsidian-md-vsc` was wrong:** Research surfaced that `willasm.obsidian-md-vsc` is an Obsidian-app remote-control shim via Advanced URI; it does NOT render wikilinks, parse vault, serve Smart Connections data, or operate without a running Obsidian. Misidentified as a vault renderer in the original §0.1 / IOD-17 decision; that decision is reversed.
- **Affected tracks:** 03 (new `s1'.semantic.*` gateway tranche), 04 (S5 surface DTOs reference Smart Connections substrate; agent retrieval pools include semantic candidates as evidence), 05 (Theia `smart-connections-bridge` sidebar contribution + Canon Studio wikilink autocompletion), 07 (Logos Atelier M5-5 extension consumes neighbour data), 09 (M5-4 agent capabilities grant `s1'.semantic.*` per role).
- **Options:** (a) Build parallel embedding system inside Theia. (b) Inherit Smart Connections via Hen `smart_env.rs` and expose through gateway. (c) Build a Hen-independent `.ajson` reader. (d) Run a local re-embedding fallback (transformers.js / Ollama) when Obsidian unavailable.
- **Recommended default if safe:** **Option (b)** — inherit. `Body/S/S1/hen-compiler-core/src/smart_env.rs` is production substrate; expose via `s1'.semantic.{suggest_links,neighbors_of,search,by_block}` gateway methods; Theia frontend consumes via kernel-bridge. Smart Connections semantic-input feeds the M5-0 gnostic pipeline (epi-gnostic IS the RAG-anything system). Re-embedding fallback (Option d) is optional future capability — write to the same `.smart-env/` format so Smart Connections inside Obsidian picks up Theia-side embeddings on next run.
- **Validation path:** Gateway integration test that calls `s1'.semantic.suggest_links` over a real populated `<vault>/.smart-env/multi/*.ajson` and returns expected typed `LinkCandidateResponse` with semantic scores; Theia smart-connections-bridge sidebar test against real gateway; staleness-flag test (vault changed since last Smart Connections index run); privacy-class test (protected `pratibimba` content not exposed via semantic-neighbours without governed capability).
- **Consequence of delaying:** Track 05 Canon Studio wikilink autocompletion + Logos Atelier constellation discovery + agent semantic retrieval all blocked behind a missing gateway surface. M5-0 Library remains a pure read of epi-gnostic without Smart Connections semantic-input.

### IOD-19 - Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) — **RESOLVED (Binding)**

- **Status (as of 2026-06-01):** Binding per [ADR-05-010](../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md) and [ADR-05-011 §3](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md). Canon Studio (`@pratibimba/ide-shell-m0-m5`) routes every save through the `vault-bridge.s1prime.vault.write_file` command. Until T4.5 lands the vault-bridge Theia extension, the gate stub correctly rejects all writes with the canonical reason `no vault-bridge registered`, verified by `tests/canon-studio-save-routing.test.mjs::vault-bridge write throws "no vault-bridge registered" before T4.5` (part of 17/17 passing). The substrate (Hen `wikilinks.rs`, `graph_promotion.rs`, `relation_inference.rs`, `property_intelligence.rs`, `artifact_evidence.rs`) is landed and production-grade per ADR-05-010 substrate-truth table; the gateway-method surface `s1'.vault.*` remains the Track 03 T6.5 deliverable that closes the live-runtime side of this resolved decision.
- **Question:** When Theia or an agent writes to the vault (philosophy file edit, Canon Studio save, agent-produced draft, Logos Atelier crystallisation, m4-nara journal append), what mediates the write so wikilink integrity, path soundness, rename-tracking, and structural invariants are preserved?
- **Why it matters:** The vault is a wiki-linked knowledge graph; naive filesystem writes can break `[[X]]` references on rename, orphan headings, leave stale backlinks, drop block ids, or move files without updating Bimba-coordinate-anchored crossreferences. Hen-compiler-core already carries the wikilink parser ([[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] — `Wikilink` struct with raw/target/alias/line/column/context; `WikilinkTarget` enum; `parse_wikilinks()`), plus `relation_inference.rs`, `property_intelligence.rs`, `artifact_evidence.rs`, and `graph_promotion.rs` as the broader write-discipline substrate. The Python Hen infrastructure at [[Body/S/S1/hen-compiler]] runs the higher-level compile-plan flow over those primitives.
- **Affected tracks:** 03 (new `s1'.vault.*` gateway tranche fronting Hen write methods), 05 (Canon Studio saves + Logos Atelier writes + M4-Nara journal writes route through gateway not direct FS), 07 (m4-nara extension write path), 09 (agent vault writes are bounded capabilities requiring `s1'.vault.*` allowlist).
- **Options:** (a) Direct filesystem writes from Theia (current Theia default). (b) Route all vault writes through gateway `s1'.vault.*` methods which delegate to Hen. (c) Theia-side wikilink reconciliation library duplicating Hen's wikilinks.rs. (d) Read-only Theia, all writes Obsidian-side only.
- **Recommended default if safe:** **Option (b)** — route vault writes through Hen-gateway. Hen already has the wikilink parser + relation-inference + property-intelligence; the broader compile-plan flow (per S1 spec) is the right place for write-discipline. The gateway `s1'.vault.{write_file,move_file,rename_file,append_block,update_frontmatter}` methods front Hen; Theia and agents both reach through them. Bypasses (read-direct, write-through-Hen) keep performance acceptable while preserving structural soundness. Per IOD-17 capability matrix, agent write capabilities are gated; per UFV-02 user-final validation thresholds, recursive / canon-affecting writes require human approval.
- **Validation path:** Integration test renaming a file with inbound wikilinks: `s1'.vault.rename_file` updates all referring `[[X]]` to `[[Y]]` atomically; tests for cross-vault-path moves preserving headings; tests for block-id-anchored references; tests proving direct-Theia-FS-write fails wikilink-integrity-check (it should — Theia must use gateway). Live tests against [[/Idea]] vault fixture in a temp clone.
- **Consequence of delaying:** Canon Studio, Logos Atelier, and m4-nara write paths all risk silent wikilink rot; agents allowed direct FS write create canon-corruption opportunities; rename-with-references becomes a manual user task instead of an automatable governed write.

## Dependency And Sequencing Decisions

### DSD-01 - Live local-service harness and CI sequencing

- **Question:** What reproducible harness starts gateway, SpaceTimeDB, Neo4j/Redis, S5 stores, Tauri, and Theia for live acceptance, and which CI lanes are required before readiness claims?
- **Why it matters:** Every track rejects mock-only readiness. Without a shared harness, each team will create incompatible "live enough" checks.
- **Affected tracks:** 01, 02, 03, 04, 05, 06, 07, 08.
- **Options:** Per-track scripts; one root dev harness; Docker-compose plus native Tauri/Theia lanes; captured-real fixture lane plus explicit live lane.
- **Recommended default if safe:** One root local-service harness with per-track profiles and a captured-real fixture lane for fast tests, but live lanes for any claimed live behavior.
- **Validation path:** Runbook plus CI target that boots all owned services; smoke tests for S0 profile, S2 query, S3 subscription, S5 review, Tauri summon, and Theia activation.
- **Consequence of delaying:** Tracks can write contract tests, but cannot honestly close production readiness.

### DSD-02 - Track 01-04 contract readiness before UI hardening

- **Question:** Which Track 01-04 contracts must exist before `/body`, individual extensions, and integrated plugins can harden UI beyond readiness/degraded states?
- **Why it matters:** M5-3 surfaces must not compute backend law locally or hide missing backend capability with polished placeholder UI.
- **Affected tracks:** 05, 06, 07, 08.
- **Options:** Block all UI until backends are complete; build UI against explicit readiness seams; allow captured-real contract fixtures; use placeholders for layout only.
- **Recommended default if safe:** Build UI against readiness seams and captured-real fixtures, but mark completion blocked until live S0/S2/S3/S5 paths exist.
- **Validation path:** Compatibility matrix naming upstream owner per field; tests that fail if missing fields are rendered as real data; live end-to-end release gate.
- **Consequence of delaying:** Frontend tracks may accidentally overfit to synthetic data or duplicate backend logic.

### DSD-03 - Non-dry-run promotion waits for compiler mutation law

- **Question:** Which promotion destinations can be planned now, and what remains reserved until S1/Hen compiler mutation law, rollback, and deployment gates are wired?
- **Why it matters:** S5 can produce reviewed dry-run promotion plans, but direct canon/code/vault mutation without rollback law is unsafe.
- **Affected tracks:** 04, 05, 07, 08.
- **Options:** Enable no promotion; enable dry-run only; allow limited non-canon mutations; enable all behind human review.
- **Recommended default if safe:** Dry-run promotion only across all M5-4 surfaces until compiler mutation law and rollback are implemented and reviewed.
- **Validation path:** S5 tests refusing non-dry-run mutation; IDE tests showing "dry-run only" state; deployment gate workflow tests.
- **Consequence of delaying:** Agentic work can still surface evidence and plans, but users must not be offered real promotion controls.

### DSD-04 - SpaceTimeDB schema source, migration, and table compatibility

- **Question:** Which file/crate is the authoritative schema source for `world_clock`, `pratibimba_presence`, `shared_archetype_event`, `coincidence`, profile/kernel traces, and legacy compatibility tables?
- **Why it matters:** Track 01 bridge schemas, Track 03 module migrations, and M5-3 consumers all depend on stable table names, reducer signatures, protocol versions, and rollback procedures.
- **Affected tracks:** 01, 03, 05, 06, 08.
- **Options:** `Body/S/S3/epi-spacetime-module` as sole authority; split module crates; gateway-contract generated schemas; compatibility projections for legacy `m1_clock_state`/`identity_presence`; defer legacy tables.
- **Recommended default if safe:** Keep the S3 Rust module as authority, generate or document gateway-contract projections, include `clock_protocol_version`, and defer legacy projections unless active consumers require them.
- **Validation path:** Migration tests; protocol-version client gating tests; table/reducer contract tests; rollback rehearsal in local SpaceTimeDB lane.
- **Consequence of delaying:** Bridge and frontend consumers may bind to unstable table names and require churn.

### DSD-05 - Protected Nara/Graphiti substrate before M4 and 4/5/0 readiness

- **Question:** What minimum Nara artifact, Graphiti handle, privacy class, and consent record substrate must land before M4 and 4/5/0 can claim more than safe shell/backdrop/review-only mode?
- **Why it matters:** The 4/5/0 plugin's central claim involves protected personal-field foreground, but private bodies must not leak into public graph, SpaceTimeDB, observability, workspace state, or S5 evidence.
- **Affected tracks:** 02, 03, 04, 06, 07, 08.
- **Options:** Keep 4/5/0 blocked until full M4; allow safe handles and summaries; allow local-only protected inspectors; allow reviewed protected-open actions.
- **Recommended default if safe:** Safe handles/summaries plus local-only protected inspectors first; reviewed protected-open actions only after consent and privacy gates exist.
- **Validation path:** Nara artifact service tests; Graphiti handle tests; S5 evidence tests requiring privacy boundary; automated privacy audits.
- **Consequence of delaying:** 4/5/0 can render canonical backdrop and review shell only, not personal recognition flow.

### DSD-06 - M2/M3 authority payload readiness before full 1-2-3 readiness

- **Question:** Which M2/M3 dataset LUTs and profile fields must be live before 1-2-3 claims full cosmic-engine readiness?
- **Why it matters:** 1-2-3 must not fill missing correspondence, codon, planetary, pitch, or `mahamaya` data with renderer-local tables.
- **Affected tracks:** 01, 02, 07, 08.
- **Options:** Block all 1-2-3 UI until complete; render degraded state for missing LUTs; use captured-real fixtures; use local renderer fallback tables.
- **Recommended default if safe:** Render degraded/pending-LUT states until S0/S2 provide the fields; use captured-real fixtures only for contract/UI tests, never as runtime authority.
- **Validation path:** Profile/schema tests for `resonance72`, `planetaryChakral`, `mahamaya`, `audio_octet`, `nodal_quartet`, codon rotation, pointer/deposition anchors; UI tests rejecting local correspondence tables.
- **Consequence of delaying:** 1-2-3 can demonstrate layout and readiness, but not full synchronized cosmic-engine behavior.

## Deferred Canon Contradictions

### DCC-01 - M0 versus M1 `+1` attribution

- **Question:** Does the `+1` in `137 = 64 + 72 + 1` belong to M1 Paramaśiva as toroidal parent or M0 as witness-axis prior ground?
- **Why it matters:** M5' records this as an unresolved source contradiction. Teaching, review evidence, and 1-2-3/4-5-0 composition must not harmonize it silently.
- **Affected tracks:** 07, 08, M5' canon.
- **Options:** Resolve to M1; resolve to M0; keep both as provenance; display current operational default with contradiction note.
- **Recommended default if safe:** Operationally teach M1 as the `+1` parent for 1-2-3, keep M0 as prior ground, and surface the M0 wording as provenance/contradiction until canon changes.
- **Validation path:** UI copy/provenance tests; review evidence anchors back to M5' and alpha sources; no promotion of a resolved canon claim without user/canon review.
- **Consequence of delaying:** Minimal if surfaced honestly; severe if hidden, because future canon-review claims may encode the wrong attribution.

### DCC-02 - M3 `16+1` / "17th lens" language

- **Question:** Should M3 render a 17th lens, or 16 lens positions plus a Level-0/Fibonacci-Pisano meta-position?
- **Why it matters:** M3 UI and 1-2-3 evidence can mis-teach the Mahāmāyā structure if a provisional phrase becomes a data model.
- **Affected tracks:** 07, 08.
- **Options:** Literal 17th lens; 16 plus meta-position; blocked readiness until canon resolves.
- **Recommended default if safe:** 16 lens positions plus Level-0/meta-position, with provenance note for "17th lens" wording.
- **Validation path:** M3 UI tests; evidence serializer tests; source-anchor review before any schema promotion.
- **Consequence of delaying:** M3 can proceed with explicit provenance; silent schema hardening would create avoidable migration work.

### DCC-03 - M2 planet count and Earth-observer semantics

- **Question:** How should the first M2 surface reconcile a 10-entry LUT, Sun identity-root, nine planetary/rulership handles, and Earth observer-ground?
- **Why it matters:** M2 meaning packets and 1-2-3 visualization depend on honest planetary/chakral provenance and cannot fake correspondence law locally.
- **Affected tracks:** 07, 08.
- **Options:** 10-entry operational LUT; nine handles plus Earth observer; block planetary surface until S2/profile law resolves; display readiness/provenance split.
- **Recommended default if safe:** Show readiness/provenance split: consume backend-provided `planetaryChakral` data when present and render Earth/Sun semantics as unresolved explanatory metadata.
- **Validation path:** M2 contract tests; S2/profile provenance tests; UI readiness tests for missing planetary fields.
- **Consequence of delaying:** M2 can still render non-planetary meaning packet slices, but full planetary/chakral claims remain blocked.

### DCC-04 - M4 identity quaternion naming, axis order, and 0/1 polarity

- **Question:** Which names and axis order are canonical for `q_personal`, `q_Nara`, `Q_identity`, `q_b`, `q_p`, and how does M4 personal/cosmic polarity map to the daily 0/1 shell?
- **Why it matters:** Exposing numeric protected identity internals before the kernel/privacy decision is settled risks leaks, migration churn, and false recognition claims.
- **Affected tracks:** 06, 07, 08.
- **Options:** Pick one naming scheme now; expose only handles; keep daily 0/1 as composite; block numeric display until kernel-level decision.
- **Recommended default if safe:** Expose handles, privacy classes, and derived readiness only; treat daily 0/1 as composite; block raw numeric quaternion internals in public UI until the kernel decision lands.
- **Validation path:** Privacy tests; M4 handle DTO tests; UI tests proving no raw `q_b`, `q_p`, birth data, or identity vectors appear in public state.
- **Consequence of delaying:** Deep M4 numeric inspectors remain blocked, but safe artifact and handle flows can proceed.

### DCC-05 - Audio bus and cymatic derivation ownership wording

- **Question:** Does S0/portal-core own the M2-1' Vimarsha reading function that emits `audio_octet`/`nodal_quartet`, and does the bridge emit raw inputs only or a typed derived cymatic-state contract owned by M2/M4?
- **Why it matters:** Renderer panels must not synthesize authoritative audio/cymatic state, but S0 also should not own UI rendering or audio synthesis beyond harmonic metadata.
- **Affected tracks:** 01, 07, 08.
- **Options:** S0 owns bus derivation and bridge emits bus; M2 owns derived cymatic contract; M4 owns personal field rendering; bridge emits raw inputs plus typed optional derived state.
- **Recommended default if safe:** Document S0/portal-core as current bus derivation implementation; bridge emits validated bus/profile inputs and optional typed derived state only when M2/M4 owner contract is present.
- **Validation path:** Profile schema tests; M2/M4 renderer tests proving no local authority derivation; readiness state for missing derived contract.
- **Consequence of delaying:** Audio/cymatic UI can render playback or visual fallback only as non-authoritative/degraded.

### DCC-06 - Alpha section cross-reference drift

- **Question:** How should implementation plans cite alpha material when referenced sections are missing or renumbered, such as the noted absent Section 18 in `alpha_quaternionic_integration_across_M_stack.md`?
- **Why it matters:** Review evidence and implementation docs need durable source anchors; wrong section references weaken auditability.
- **Affected tracks:** 07, 08.
- **Options:** Keep old references; update to discoverable Section 11 and companion M4 field-engine Section 18; use source anchors by file plus heading text rather than number only.
- **Recommended default if safe:** Cite file plus exact heading text, and route missing/renumbered references to the discoverable heading or companion spec while preserving a note of the drift.
- **Validation path:** Documentation lint/checklist before implementation handoff; S5 evidence source-anchor tests where applicable.
- **Consequence of delaying:** Low runtime impact, but review artifacts become harder to verify and canon contradictions are easier to hide accidentally.

## Success Criteria

- Every recurring decision named in the Wave 3 Track 11 brief appears with an ID, question, why it matters, affected tracks, options, recommended default where safe, validation path, and consequence of delaying.
- Decisions are grouped into the required categories and do not restate canon except where needed to explain the implementation consequence.
- Defaults are conservative: they preserve one-app/two-surface law, one shared bridge identity, backend authority over renderer logic, S5 human gates, and protected-local privacy boundaries.
- Prototype-resolved decisions have concrete ADR/prototype validation paths before implementation hardens around them.
- Implementation-owner decisions name the track(s) that must own the final contract and the tests that prove it.
- Dependency decisions state what can proceed behind readiness seams and what remains blocked until upstream contracts exist.
- Deferred canon contradictions remain visible in UI copy, provenance, review evidence, or readiness states rather than being silently harmonized by implementation.
- Production readiness cannot be claimed from mock-only tests, placeholder UI, fixture-only review state, synthetic graph data, hidden HTTP polling fallback, renderer-local backend law, or unreviewed protected-data exposure.
