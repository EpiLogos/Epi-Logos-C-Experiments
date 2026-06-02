# M-Dev Context Pack - 05.T7

Generated: 2026-06-01T19:52:22.583Z

## Task

- **ID:** 05.T7
- **Title:** Integrated 1-2-3 And 4/5/0 Plugin Surfaces
- **Track:** 05-tauri-ide-shell-and-pratibimba-system.md
- **Computed status:** ready
- **Write scopes:** Body/M/epi-tauri/**, Idea/Pratibimba/System/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/epi-tauri`
- `Body/M/epi-tauri/package.json`
- `Body/M/epi-tauri/src-tauri/src/lib.rs`
- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs`
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx`
- `Body/M/epi-tauri/src/services/types.ts`
- `Body/M/epi-tauri/src/shell/Shell.tsx`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`
- `src/components/CommandPalette.tsx`
- `src/components/OmniPanel.tsx`
- `src/domains/MPrime_Subsystems/MPrimeSubsystemPage.tsx`
- `src/stores/uiStore.ts`

## Dependency Context

- 05.T6 - Six Individual M Extension Contribution Registry (staged by backend readiness) (05-tauri-ide-shell-and-pratibimba-system.md)

## Track Source Specs

- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, especially section 1 "Architectural commitments", section 3 "The `/pratibimba/system/` directory structure", section 4 "The kernel-bridge foundational extension", section 5 "The ide-shell-m0-m5 extension", section 8 "The 0/1 <-> IDE bridging", section 9 "Build pipeline", section 10 "Open architectural questions", section 11 "Initial tranche specification", and section 12 "Success criteria". Track 05 folds this plan in and supersedes section 11's proof-of-concept tranches with production tranches.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 2 "Code organisation: /body and /pratibimba/system", section 3 "The single-Tauri-app two-surface model", section 4 "Theia as IDE shell + the 6 + 2 plugin-app architecture", section 5 "The kernel-bridge foundational extension", section 8 "Implementation milestones", and section 9 "Open implementation questions". This is the authority for one Tauri app, two surfaces, Theia as the deep IDE, M0/M5 IDE chrome, 6+2 extension/plugin shape, and kernel-bridge as M5-2 access point.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Canonical 0/1/4+2 Layout Discipline", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Minimum Live Loop", "Diatonic CF / VAK Projection", "The K2 Topology as the Shared Substrate", "Required Shared MathemeHarmonicProfile", and "Neo4j / Graphiti Boundary". This is the authority that M' surfaces share one profile, topology, VAK projection, and graph/memory boundary rather than widget-local interpretations.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Two-Layer Page Architecture", "Preserve From Electron", "Replace From Electron", "OmniPanel As `/`", "VAK / Anima / Epii Execution Surface", "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", "Current-State Gap Table", and "Testing Contract". This is the authority for current `Body/M/epi-tauri` reuse, Tauri command/event boundaries, typed renderer clients, OmniPanel parity, and mock-free desktop tests.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Harmonic / Musical Surface Law", "Shared Runtime Law", "`/` Surface", "`0` Surface", "`1` Surface", "M5' Epii Surface", "Agentic Execution / Inbox", and "Implementation Rule". This is the authority that desktop and TUI mirror logical contracts, not widgets, and that `/` dispatches CLI/gateway/typed service calls instead of forking backend behavior.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy: The Agentic IDE as Conversational Engagement", "User-Facing Surface", "Backend Contract Consumed", "Required MathemeHarmonicProfile Fields", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". This is the authority for M5-2/S-stack, M5-3/Tauri-Theia, M5-4/agentic mediation, graph namespaces, review evidence, human gates, and Theia kernel-bridge readiness.
- [[01-kernel-bridge-and-s0-foundation]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", Tranches 5-8, "Dependencies", and "Open Decisions". Track 05 depends on the shared TypeScript contract, lite/full bridge modes, real `MathemeHarmonicProfile`, readiness taxonomy, bridge capabilities, and bridge-host decision path.
- [[02-s2-bimba-map-population]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, Tranches T7-T9 and "Success Criteria". Track 05 depends on S2 graph payloads, pointer anchors, namespace-aware graph access, Anuttara fields, GDS overlay readiness, and real S2 response fixtures.
- [[03-s3-gateway-and-spacetimedb]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, Tranches 1-5, "Open Decisions", and "Success Criteria". Track 05 depends on the gateway/WebSocket stream contract, native SpaceTimeDB subscriptions, `world_clock`, `pratibimba_presence`, shared archetype/coincidence rows, DAY/NOW/session/deposition anchors, and reconnect/resync semantics.
- [[04-s5-autoresearch-and-review-extension]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, Tranches 6-9, "Dependencies", and "Success Criteria". Track 05 depends on real S5 review/autoresearch DTOs, route queues, agent-access snapshots, review gates, dry-run promotion plans, and M5-3 IDE/workbench contract surfaces.

Current implementation surface observed for this plan:

- `Body/M/epi-tauri/package.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, and `src-tauri/tauri.conf.json` define the existing React/Vite/Tauri v2 app and one-window `frontendDist` build shape.
- `Body/M/epi-tauri/src/shell/Shell.tsx`, `src/components/OmniPanel.tsx`, `src/components/CommandPalette.tsx`, and `src/stores/uiStore.ts` already provide a lightweight shell, hotkeys, workspace selection, OmniPanel, command palette, and an MPrime workspace entry.
- `Body/M/epi-tauri/src/services/types.ts`, `kernelProjection.ts`, `kernelProfileObservation.ts`, `gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `epiiClient.ts`, and `agentExecutionClient.ts` are the current typed-client footholds for profile, S2/S3/S5, and agent surfaces.
- `Body/M/epi-tauri/src-tauri/src/lib.rs`, `commands/*`, `events.rs`, `gateway`, `graph`, `temporal`, `vault`, `agents`, `atelier`, and `library` show the current Tauri command/event authority surface.
- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` still treats native SpaceTimeDB WebSocket mode as a stub and logs fallback to polling; Track 05 must depend on Track 03 before claiming native live projection readiness.
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx` and `src/domains/MPrime_Subsystems/MPrimeSubsystemPage.tsx` already move toward conversational M5 and 4+2 profile-grounded surfaces, but they are not a Theia IDE shell.

## Task Body

8. **T7 - Integrated 1-2-3 And 4/5/0 Plugin Surfaces.**

   Deliverables:

   - Build `plugin-integrated-1-2-3` as a Theia contribution that composes M1, M2, and M3 into the live cosmic-engine surface described by the canon, driven by the same profile tick, S2 relation law, S3 world clock, and bridge stream. Cymatic-engine consumption flows from Track 12 (Cymatic Engine Substrate) per §0.2 of the review.
   - Build `plugin-integrated-4-5-0` as a Theia contribution that composes M4, M5, and M0 into the protected user-experience integration surface: personal field handles, canonical Bimba backdrop, BEDROCK link, activity-resonance traces, review state, and Logos Atelier context.
   - Implement layout choreography so integrated plugins compose individual extension services and views rather than copying their data-fetching or rendering authority.
   - Add explicit privacy gates for the 4/5/0 surface so protected personal-field foreground data remains local/protected and shared state carries only safe handles or reviewed summaries.
   - Surface the unresolved `137 = 64 + 72 + 1` M0/M1 `+1` wording as a canon-review question, not as a silently harmonized UI claim.

   Verification:

   - The 1-2-3 surface test drives a real profile tick change and verifies M1 movement, M2 resonance/correspondence, and M3 codon-rotation views update from the same generation.
   - The 4/5/0 surface test renders canonical Bimba context plus protected Pratibimba handles and proves raw personal field bodies, journal bodies, and Graphiti episode text are absent.
   - Integrated-plugin tests prove composed views share one bridge subscription and one selected coordinate/session state.
   - Review evidence tests prove recognition claims link to source specs, profile generation, S2/S3 anchors, and S5 review state before any canon-promotion affordance appears.

## Track Open Decisions

- **Theia runtime mode — RESOLVED:** Electron is the canonical desktop distribution (via `@theia/electron` + `electron-builder`). The standard Theia browser bundle is retained for CI / optional Docker headless / future shared deployment. No Tauri wrapper, no webview embedding question.
- **Single versus multi-webview — RESOLVED:** One Theia process, one renderer, two workspace layout modes (`daily-0-1.layout` and `ide-deep.layout`) switched via Theia's `Layout Restorer` / `Workspace` services. No cross-webview state question.
- **Bridge ownership — RESOLVED:** The kernel-bridge is a first-loaded Theia extension. Its backend module is the only Theia-side connection to the external `Body/S/S3/gateway` Rust process; its frontend module publishes `KernelBridgeAPI` through Theia DI to both layouts.
- **Build composition strategy — RESOLVED:** Electron-builder produces the canonical desktop bundle reusing the standard Theia browser bundle inside the Electron renderer. The browser bundle alone is deployable for CI / Docker headless.
- **Extension host model — RESOLVED:** Theia-native throughout. No VS Code Extension API borrows currently committed (the earlier `obsidian-md-vsc` borrow was reversed per IOD-19 once research surfaced it as Obsidian-app remote-control rather than vault renderer). The dual-extension-API capability remains as escape hatch; future borrows must justify the dependency through PRD-04.
- **Theia version pin and update cadence — OPEN:** T0 must verify the current Theia stable release against Node version and `@theia/electron` compatibility, pin in `package.json`, and choose an update cadence.
- **Package manager — OPEN:** Theia convention often favors Yarn workspaces; the migration source `Body/M/epi-tauri` uses pnpm. T0 must decide explicitly for `Idea/Pratibimba/System`.
- **Workspace and state persistence — OPEN:** Decide which state belongs to Theia workspace storage, Theia preferences, S3 session state, S5 review state, S1/vault files, or kernel-bridge cache.
- **IDE terminal and shell access — OPEN:** Theia normally provides terminal/task features; Epi-Logos needs bounded agent/task execution. Decide whether a local terminal is available to users, agents, both, or neither in phase 1.
- **Source of deep M-extension ownership:** Track 05 owns the shell, registry, and first real contribution slices, but deeper M1/M2/M3/M4 subsystem renderers may require follow-on tracks once backend contracts mature.
- **Current source gap:** The source specs define the desired Theia shell and M5' workbench, but deeper M-subsystem renderer specs and SpaceTimeDB table/stream shapes for Theia beyond upstream track contracts remain to be elaborated.

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
| PRD-04 | Theia extension API, version, package manager, and build composition | Prototype-resolved | 05, 07, 08 |
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
| IOD-12 | Observability schema ownership | Implementation-owner | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority | Implementation-owner | 01, 04, 09 |
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader | Implementation-owner | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) | Implementation-owner | 03, 05, 07, 09 |
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

### PRD-04 - Theia extension API, version, package manager, and build composition

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
